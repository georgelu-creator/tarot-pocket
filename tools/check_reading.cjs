const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),model={window:{}};
for(const f of ['reading-deck.js','spread-content.js'])vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),model);
const deck=model.window.TAROT_READING_DECK.cards,content=model.window.TAROT_SPREAD_CONTENT;
assert.equal(deck.length,78);assert.equal(new Set(deck.map(c=>c.id)).size,78);
const expected=[...Array.from({length:22},(_,i)=>'m'+String(i).padStart(2,'0')),...['w','c','s','p'].flatMap(s=>Array.from({length:14},(_,i)=>s+String(i+1).padStart(2,'0')))];
assert.deepEqual([...deck.map(c=>c.id)].sort(),expected.sort());
for(const c of deck){assert(c.core&&c.observation&&c.reversed);for(const t of ['love','career','study']){assert(c.questions[t]);for(const k of ['state','tension','advice'])assert(c.contexts[t][k]);}assert.equal(new Set(['love','career','study'].map(t=>c.contexts[t].state)).size,3);}
assert.equal(content.spreads.length,8);assert.equal(content.units.reduce((n,u)=>n+u.steps.length,0),24);
for(const d of content.spreads){assert(d.readingTip&&d.compareTip&&d.bestFor);assert(new Set(d.positions.map(p=>p.id)).size===d.positions.length);}
const url=process.env.DEMO_URL||'http://127.0.0.1:8765/tarot-demo.html';
const KEY='tarot-reading-v3',LKEY='tarot-learning-units-v2';
const state=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
const lstate=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),LKEY);
const click=(p,a,v)=>p.locator(`[data-reading="${a}"]${v?`[data-value="${v}"]`:''}`).first().click();
const learn=(p,a,v)=>p.locator(`[data-learn="${a}"]${v?`[data-value="${v}"]`:''}`).last().click();
const width=async p=>assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow');
(async()=>{
 const browser=await chromium.launch(require('./browser_options.cjs'));
 try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true,reducedMotion:'reduce'}),p=await ctx.newPage();
 p.setDefaultTimeout(90000);p.setDefaultNavigationTimeout(120000);
 const errors=[],external=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 p.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(new URL(url).origin))external.push(r.url());});
 await p.goto(url);
 assert.deepEqual(await p.locator('.navitem').allTextContents(),['练习','抽牌','牌库','我的']);
 assert.equal(await p.locator('.bottomnav [data-page=practice]').count(),0);
 assert.equal(await p.locator('.context-lessons [data-learn-start]').count(),4);
 // Every new contextual lesson is completed, including wrong and partial responses.
 for(const unit of content.units){
   await p.locator(`[data-learn-start="${unit.id}"]`).click();
   for(const step of unit.steps){
     await p.getByRole('heading',{name:step.title,exact:true}).waitFor();await width(p);
     if(step.cardPositions)assert.deepEqual(await p.locator('.learn-slot').allTextContents(),Array.from(step.cardPositions));
     if(step.kind==='intro'){await learn(p,'next');continue;}
     if(step.kind==='recall'){assert.equal(await p.locator('.learn-feedback').count(),0);await learn(p,'reveal');await learn(p,'rate','part');await learn(p,'next');continue;}
     let wrong=step.kind==='choice';
     if(step.kind==='arrange'){for(const id of step.correctOrder)await learn(p,'assign',id);}
     else{const answer=wrong?step.options.find(o=>o.id!==step.correct).id:step.correct;await learn(p,'select',answer);}
     await learn(p,'confidence','sure');
     if(step.kind==='reason'){
       await learn(p,'submit');assert.equal(await p.locator('.learn-feedback').count(),0);
       await learn(p,'evidence',step.evidenceOptions.find(o=>o.id!==step.evidenceCorrect).id);
     }
     await learn(p,'submit');const text=await p.locator('.learn-feedback').innerText();
     if(wrong){assert(text.includes('答错了'));assert(text.includes('本题正确答案'));}
     else if(step.kind==='reason'){assert(text.includes('部分答对'));assert(text.includes('依据选错了'));assert(text.includes('正确依据'));}
     else assert(text.includes('答对了'));
     await learn(p,'next');
   }
   await p.locator('.learn-summary').waitFor();await learn(p,'home');
 }
 // The eight diagrams each support position learning and a scored memory check.
 for(const d of content.spreads){
   await p.locator('.spread-guide-list').filter({hasText:'认识 8 种牌阵'}).locator('summary').click();
   await click(p,'guide',d.id);await width(p);
   assert.equal(await p.locator('.reading-slot').count(),d.positions.length);
   await p.locator(`[data-reading=guide-position][data-index="${d.positions.length-1}"]`).click();
   const before=await p.locator('.guide-card-example p').innerText();
   if(d.topics.includes('love')){await click(p,'guide-topic','love');const after=await p.locator('.guide-card-example p').innerText();assert.notEqual(before,after,'domain changes the example meaning');}
   else{assert.equal(await p.locator('[data-reading=guide-topic]').count(),1);assert((await p.locator('.guide-card-example').innerText()).includes('学业'));}
   await click(p,'guide-test');assert.equal(await p.locator('.reading-label').filter({hasText:'？'}).count(),d.positions.length);
   const options=await p.locator('[data-reading=guide-answer]').evaluateAll(xs=>xs.map(x=>({id:x.dataset.value,text:x.innerText})));
   const correct=d.id+'-'+(d.positions.length-1),wrong=options.find(o=>o.id!==correct).id;
   for(const o of options.filter(o=>o.id!==correct)){const dash=o.id.lastIndexOf('-');const def=content.spreads.find(x=>x.id===o.id.slice(0,dash));assert.notEqual(def.positions[Number(o.id.slice(dash+1))].role,d.positions.at(-1).role,'synonymous same-role choices must not be marked wrong');}
   const n=(await state(p))?.practice.length||0;await click(p,'guide-answer',wrong);
   assert((await p.locator('.guide-verdict').innerText()).includes('答错了'));assert.equal((await state(p)).practice.length,n+1);
   await click(p,'guide-explain');await click(p,'guide-test');await click(p,'guide-answer',correct);
   assert((await p.locator('.guide-verdict').innerText()).includes('答对了'));
   await click(p,'guide-back');
 }
 const lessonCount=(await lstate(p)).history.length;
 await p.locator('.bottomnav [data-page=reading]').click();assert.equal(await p.locator('.reading-spread-choice').count(),8);
 const previousPools=[];
 for(const d of content.spreads){
   await click(p,'spread',d.id);
   if(d.id==='choice')assert((await state(p)).settings.questionId.endsWith('-choice'));
   if(d.id==='study'){assert.equal((await state(p)).settings.topic,'study');await click(p,'topic','love');assert.equal((await state(p)).settings.spreadId,'three');await click(p,'spread','study');}
   const reversals=d.id==='celtic';await p.locator('[data-reading-setting=reversals]').setChecked(reversals);
   await click(p,'start');await p.locator('[data-reading=pick]').first().waitFor();
   let s=(await state(p)).draft;assert.equal(s.pool.length,78);assert.equal(new Set(s.pool.map(c=>c.id)).size,78);
   if(!reversals)assert(s.pool.every(c=>c.reversed===false));
   assert(previousPools.every(pool=>pool!==s.pool.map(c=>c.id).join(',')));previousPools.push(s.pool.map(c=>c.id).join(','));
   assert.equal(await p.locator('.reading-slot img').count(),0,'unrevealed card identity must not be rendered');
   for(let i=0;i<d.positions.length;i++){
     await p.locator(`[data-reading=pick][data-index="${i*3}"]`).click();
     if(i===0&&d.id==='three'){
       const before=(await state(p)).draft;await p.reload();await p.locator('.bottomnav [data-page=reading]').click();
       const after=(await state(p)).draft;assert.deepEqual(after.pool,before.pool);assert.deepEqual(after.picked,before.picked);
       assert.equal(await p.locator('[data-reading=pick][data-index="0"]').isDisabled(),true);
     }
   }
   assert.equal(new Set((await state(p)).draft.picked).size,d.positions.length);
   for(let i=0;i<d.positions.length;i++)await p.locator(`[data-reading=card][data-index="${i}"]`).click();
   s=(await state(p)).draft;assert.equal(s.phase,'read');assert.equal(s.revealed.length,d.positions.length);
   await p.locator('.reading-slot img').evaluateAll(ims=>Promise.all(ims.map(im=>im.decode())));
   assert.equal(await p.locator('.reading-slot img').count(),d.positions.length);
   if(d.positions.length>1){await p.locator('[data-reading=card][data-index="0"]').click();const text=await p.locator('.reading-interpretation').innerText();await p.locator('[data-reading=card][data-index="1"]').click();assert.notEqual(text,await p.locator('.reading-interpretation').innerText());}
   for(const w of [320,390,1280]){await p.setViewportSize({width:w,height:900});await width(p);}
   await p.setViewportSize({width:390,height:844});
   if(d.id==='celtic')await p.screenshot({path:'/tmp/tarot-v3-celtic.png',fullPage:true});
   await click(p,'finish');
 }
 assert.equal((await state(p)).history.length,8);assert.equal((await lstate(p)).history.length,lessonCount,'real drawing is not graded learning');
 const saved=await state(p);await click(p,'history',saved.history[0].id);assert.deepEqual((await state(p)).draft.pool,saved.history[0].pool);
 await p.reload();await p.locator('.bottomnav [data-page=reading]').click();assert.equal((await state(p)).draft.revealed.length,10);
 await p.locator('.bottomnav [data-page=me]').click();
 const dl=p.waitForEvent('download');await p.locator('[data-action=export]').click();const backup=JSON.parse(fs.readFileSync(await (await dl).path(),'utf8'));assert.equal(backup.reading.history.length,8);
 await p.locator('[data-action=reset]').click();await p.locator('[data-action=confirm-reset]').click();assert.equal((await state(p)).history.length,0);
 await p.locator('.bottomnav [data-page=me]').click();
 const upload=b=>p.locator('#import-file').setInputFiles({name:'reading.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(b))});
 await upload({...backup,reading:{version:0}});await p.locator('.toast').filter({hasText:'无法导入'}).waitFor();assert.equal((await lstate(p)).history.length,0,'bad reading section must not partly restore learning');
 await upload(backup);await p.locator('[data-action=confirm-import]').click();assert.deepEqual(await state(p),backup.reading);
 await ctx.setOffline(true);await p.locator('.bottomnav [data-page=reading]').click();await click(p,'new');await click(p,'spread','three');await click(p,'start');await p.locator('[data-reading=pick]').first().waitFor();await p.locator('[data-reading=pick][data-index="0"]').click();await p.locator('[data-reading=card][data-index="0"]').click();assert.equal(await p.locator('.reading-interpretation').count(),1);
 await p.locator('[data-reading=pause]').click();await p.screenshot({path:'/tmp/tarot-v3-home.png',fullPage:true});
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 console.log(JSON.stringify({status:'PASS',deck:78,spreads:8,newLessonSteps:24,checks:['single practice home navigation','explicit wrong and partially-correct verdicts','all new context lessons','eight layouts and recall quizzes','domain and position specific interpretations','full-deck unique shuffling and no replacement','no premature card face in DOM','resume without reshuffle','upright mode','all eight live spreads','small and desktop widths','history persists','no drawing counted as study mastery','backup/reset/atomic restore','offline live draw','no external requests or console errors'],limitations:['real iPhone not tested','context interpretations are authored prompts, not bespoke predictions']},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
