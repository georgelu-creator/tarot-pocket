/* Current learner contract. Retired self-rating screens are not current product requirements. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),KEY='tarot-pocket-demo-v1',DAY=86400000;
function load(){const model={window:{},document:{addEventListener(){}},structuredClone,console};for(const file of ['academy-content.js','academy.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),model);return model;}
function record(api,id,mode='learn'){const d=api.blank();d.session={unitId:id,mode,index:0,startedAt:1000,seed:71,contentVersion:api.version,answers:{},support:null,hint:false,complete:false,animation:{frame:0,static:true,paused:true}};return d;}
function checkModel(){
 const model=load(),api=model.window.TarotAcademy,source=model.window.TAROT_ACADEMY_CONTENT,all=[...source.lessons,...source.cards];
 assert.equal(source.lessons.length,20);assert.equal(source.cards.length,78);assert.equal(new Set(all.map(u=>u.id)).size,98);
 assert.deepEqual(['B','I','A'].map(l=>source.lessons.filter(x=>x.level===l).length),[8,6,6]);
 assert.equal(new Set(source.cards.map(u=>u.teachings[0].zh)).size,78);
 let questionCount=0;
 const checkPair=p=>{assert(p&&p.zh&&p.en);assert(!/[\u3400-\u9fff]/.test(p.en),'English cannot leak Chinese: '+p.en);assert(!/内容ID|触发与范围|验收方式|编写者|补学路由|已教依据/.test(p.zh),'author-only instructions');};
 for(const u of all){for(const p of [...u.teachings,u.title,u.summary,...(u.kind==='card'?[u.application,u.reversal]:[])])checkPair(p);
  for(const q of [...Object.values(u.questions),...Object.values(u.remediation).map(r=>r.question),u.revisit]){checkPair(q.prompt);assert.equal(q.options.filter(o=>o.id===q.correct).length,1);assert.equal(new Set(q.options.map(o=>o.id)).size,q.options.length);q.options.forEach(o=>{checkPair(o.text);checkPair(o.feedback);});questionCount++;}
  // Exercise every authored normal path, every error path, each support branch,
  // and restore every intermediate state without repeating a committed answer.
  for(const mode of u.kind==='card'?['learn','reverse','review','reverse-review']:['learn','review'])for(const wrong of [false,true]){
   let d=record(api,u.id,mode),guard=80,answered=0;
   while(!d.session.complete&&guard--){
    d=api.validate(JSON.parse(JSON.stringify(d)));const step=api.stepFor(d.session);assert(step,u.id+' '+mode);
    if(step.kind==='question'){
     const selected=wrong?step.question.options.find(o=>o.id!==step.question.correct).id:step.question.correct;
     if(!d.session.answers[step.question.id]){assert(api.answer(d,selected,10000+answered++));const snapshot=JSON.stringify(d);assert.equal(api.answer(d,selected,10001),false,'double submit must be idempotent');assert.equal(JSON.stringify(d),snapshot);}
    }
    assert(api.advance(d,20000+guard),u.id+' should continue');
   }
   assert(d.session.complete,u.id+' failed to finish '+mode);assert.equal(d.progress[u.id].rounds,1);assert.equal(d.progress[u.id].history.length,1);const restoredRound=api.validate(JSON.parse(JSON.stringify(d)));assert.deepEqual(JSON.parse(JSON.stringify(restoredRound.progress[u.id].history)),JSON.parse(JSON.stringify(d.progress[u.id].history)),'round evidence survives validation');
   assert(Object.values(d.progress[u.id].targets).every(t=>t.status===(wrong?'pending':mode==='reverse-review'?'assisted':'independent')));
   assert(d.progress[u.id].nextVisitAt>0);
  }
 }
 const b07=api.planFor(api.units.B07);assert.equal(b07[2].key,'Q1');assert.equal(b07[3].key,'T3','Strength begins only after the Two of Cups question');
 assert.equal(api.units.A06.teachings.length,14,'ten position explanations must be taught before assessment');
 assert.deepEqual(Array.from(api.units.A05.cards),['p02','p03','w11','p08','w10']);
 assert.deepEqual(Array.from(api.units.A06.cards),['p03','w05','m19','p06','w11','p12','m01','m05','s09','w04']);
 const d=record(api,'p08');api.advance(d);d.session.hint=true;api.answer(d,api.stepFor(d.session).question.correct,5000);assert.equal(d.progress.p08.targets.Q1.status,'assisted');assert.equal(d.progress.p08.targets.Q1.streak,0);
 const raw=JSON.parse(JSON.stringify(d));raw.session.contentVersion='old-question-version';const fresh=api.validate(raw);assert.equal(fresh.session.index,0);assert.equal(Object.keys(fresh.session.answers).length,0);assert(fresh.progress.p08.targets.Q1,'retain history on content change');
 const merged={window:model.window,document:{addEventListener(){}},structuredClone,console};for(const f of ['reading-deck.js','guided-major.js','guided-minor.js','guided-learning.js','journey.js'])vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),merged);
 const old={version:1,cards:{p08:{introducedAt:1,lastAt:2,rounds:1,skills:{},reflections:{recall:'synthetic legacy reflection'}}},session:null,paused:{},academy:d};const clean=merged.window.TarotJourney.validate(old,source.cards.map(c=>c.id));assert.equal(clean.cards.p08.reflections.recall,old.cards.p08.reflections.recall);assert.equal(clean.academy.session.unitId,'p08');assert.deepEqual(JSON.parse(JSON.stringify(clean.academy)),JSON.parse(JSON.stringify(api.validate(d))));
 console.log(JSON.stringify({status:'PASS',academyUnits:98,authoredQuestions:questionCount,checks:['all authored correct and error branches','bounded targeted support','every-step restore','hint evidence','double submit','delayed revisit','reverse prerequisite separation','legacy progress preservation','learner-only bilingual content']}));
 return {api,source};
}
async function checkUI(profile='core'){
 const {chromium}=require('playwright');const b=await chromium.launch(require('./browser_options.cjs'));
 const url=process.env.DEMO_URL||'http://127.0.0.1:8765/tarot-demo.html';
 try{const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',acceptDownloads:true}),p=await ctx.newPage();p.setDefaultTimeout(15000);const errors=[],external=[];p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(new URL(url).origin))external.push(r.url());});await p.goto(url+'?lang='+(profile==='english'?'en':'zh'));
 const read=()=>p.evaluate(k=>JSON.parse(localStorage.getItem(k))?.journey?.academy,KEY);
 const open=async id=>{if(await p.locator('.academy-shell').count())await p.locator('[data-academy=home]').first().click();else if(!(await p.locator('.academy-home').count()))await p.locator('[data-action=nav][data-page=courses]').first().click();if(await p.locator(`[data-academy=start][data-id="${id}"]`).count()===0){const lev=id[0];await p.locator(`[data-academy=level][data-value="${lev}"]`).click();}await p.locator(`[data-academy=start][data-id="${id}"]`).click();};
 const expected=()=>p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('tarot-pocket-demo-v1')).journey.academy.session,step=TarotAcademy.stepFor(s);return {kind:step?.kind,id:step?.question?.id,correct:step?.question?.correct};});
 const checkEnglish=async()=>{const found=await p.locator('.academy-shell,.academy-home').evaluate(el=>{const found=[];const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);for(let n=w.nextNode();n;n=w.nextNode())if(/[\u3400-\u9fff]/.test(n.textContent))found.push(n.textContent.trim());return found;});assert.deepEqual(found,[],'academy English renderer must not hide leaks behind data-i18n-ignore');};
 const solve=async({wrongFirst=false,checkLanguage=false}={})=>{let n=0;while(!(await read()).session.complete&&n++<60){const q=await expected();if(checkLanguage)await checkEnglish();assert.equal(await p.locator('textarea,[data-guided-note],[data-journey=rate],[data-guided=meaning-rate]').count(),0);if(q.kind==='question'&&!(await read()).session.answers[q.id]){let choice=q.correct;if(wrongFirst){choice=await p.locator(`[data-academy=answer]:not([data-value="${choice}"])`).first().getAttribute('data-value');wrongFirst=false;}await p.locator(`[data-academy=answer][data-value="${choice}"]`).click();if(checkLanguage)await checkEnglish();}await p.locator('[data-academy=next]').click();}assert((await read()).session.complete);};
 await open('p08');let anchor=await p.locator('.academy-card-face').boundingBox();assert.equal(anchor.width,108);assert.equal(anchor.height,184);
 await p.locator('[data-academy=next]').click();const q=await expected();await p.locator(`[data-academy=answer]:not([data-value="${q.correct}"])`).click();const before=await read();assert.match(await p.locator('.academy-feedback').innerText(),profile==='english'?/Not quite/:/这题不对/);await p.reload();await p.locator('[data-academy=continue]').first().click();assert.deepEqual((await read()).session.answers,before.session.answers);assert.equal((await p.locator('.academy-card-face').boundingBox()).width,anchor.width);
 await p.locator('[data-academy=next]').click();assert.equal((await read()).session.support.phase,'teach');await solve({checkLanguage:profile==='english'});assert.equal((await read()).progress.p08.targets.Q1.status,'assisted');assert.equal((await read()).session.mode,'learn');assert.equal(Object.hasOwn((await read()).progress.p08.targets,'Q3'),false,'no reversal required during first card learning');
 if(profile==='motion'){
  for(const id of ['B01','B02','B03','B04','B05','B06','B07','B08','I01','I02','I03','I04','I05','I06','A01','A02','A03','A04','A05','A06']){await open(id);assert.equal(await p.locator('.academy-animation,[data-animation]').count(),0,id+' has no automatic teaching effect');assert.equal(await p.locator('[data-academy=play],[data-academy=replay],[data-academy=static],[data-academy=skip-motion]').count(),0,'teaching does not add decorative controls');}
  await p.waitForTimeout(1800);assert.equal(await p.locator('.academy-animation,[data-animation]').count(),0,'learning content remains static after waiting');
 }
 const chosenProfile=profile==='english'?['B01','B02','B07','I04','I06','A03','A05','A06','m02','w01','c10','s04']:profile==='motion'?['B02','A05','A06']:['B07','I04','m02','c10'];
 for(const id of chosenProfile){await open(id);for(const width of [320,390,430,1280]){await p.setViewportSize({width,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),id+' overflow '+width);}await p.setViewportSize({width:390,height:844});if(id==='B07')assert.equal(await p.locator('.academy-image-space figure').count(),1,'do not compare two unfamiliar cards');await solve({checkLanguage:profile==='english'});}
 await open('p08');await p.locator('[data-academy=next]').click();await p.locator('[data-academy=hint]').click();const snapshot=(await read()).session;await p.locator('[data-language-toggle]').click();const switched=(await read()).session;assert.equal(switched.index,snapshot.index);assert.deepEqual(switched.answers,snapshot.answers);assert.equal(switched.hint,true);await p.locator('[data-language-toggle]').click();await solve();
 assert.deepEqual(errors,[]);assert.deepEqual(external,[],'offline learning must make no external requests');await ctx.setOffline(true);await open('p01');assert.equal(await p.locator('.academy-shell').count(),1);await solve();
 console.log(JSON.stringify({status:'PASS',profile,checks:['mobile fixed image anchor','all stage entry points','teach before question','misconception-specific support','saved feedback reload','no self ratings or reflection inputs','320/390/430/1280 widths','language switch preserves evidence','offline complete lesson','no external requests']}));
 }finally{await b.close();}
}
module.exports={checkModel,checkUI};
if(require.main===module){checkModel();if(!process.argv.includes('--model'))checkUI(process.argv.includes('--english')?'english':process.argv.includes('--motion')?'motion':'core').catch(e=>{console.error(e);process.exitCode=1;});}
