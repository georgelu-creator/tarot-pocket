const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),model={window:{}};
for(const file of ['reading-deck.js','curriculum-content.js','journey.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),model);
const api=model.window.TarotJourney,deck=Object.fromEntries(model.window.TAROT_READING_DECK.cards.map(c=>[c.id,c])),lessons=model.window.TAROT_CURRICULUM.cards;
const DAY=86400000,epoch=1800000000000;
let memory=api.rate(null,4,epoch);assert.equal(memory.interval,1);assert.equal(memory.passes,0);
const same=api.rate(memory,5,epoch+1000);assert.equal(same.interval,1);assert.equal(same.passes,0,'same-day recognition must not count as delayed retention');
memory=api.rate(memory,4,epoch+DAY);assert.equal(memory.interval,6);assert.equal(memory.passes,1);
memory=api.rate(memory,4,epoch+7*DAY);assert.equal(memory.interval,15);
memory=api.rate(memory,2,epoch+22*DAY);assert.equal(memory.interval,1);assert.equal(memory.reps,0);assert.equal(api.level({rounds:4,skills:{meaning:memory}}),'待巩固');
const exposure=api.rate(api.rate(null,4,epoch),4,epoch+23*60*60*1000);
assert.equal(api.rate(exposure,4,epoch+DAY+1000).passes,0,'recent practice prevents delayed recall credit');
const lapse=api.rate({ef:2.5,reps:3,interval:15,last:epoch,due:epoch+DAY,passes:2,lapses:0,grade:4},2,epoch+2*DAY);
const retry=api.rate(lapse,4,epoch+2*DAY+1000);assert.equal(retry.grade,2);assert.equal(api.level({rounds:5,skills:{application:retry,recall:{passes:3,grade:4,reps:3}}}),'待巩固');
assert.throws(()=>api.validate({version:1,cards:{},session:{cardId:'p04',seed:1,steps:['image'],index:0}},Object.keys(deck)));
const blank=api.validate(null,Object.keys(deck));assert.equal(Object.keys(blank.cards).length,0);
let questionCount=0;
for(const lesson of lessons){const card=deck[lesson.id];
 for(const topic of ['love','career','study'])for(const position of ['state','tension','advice'])for(const kind of api.skills.filter(x=>x!=='recall'))for(const variant of [-1,0,1,2]){
   const step=api.makeStep(kind,card,lesson,deck,{topic,position,...(variant>=0?{playVersion:2,variant}:{})});
   assert(step.options.some(x=>x.id===step.correct),`${card.id}/${kind} answer exists`);
   assert.equal(new Set(step.options.map(x=>x.id)).size,step.options.length);
   assert.equal(new Set(step.options.map(x=>x.text)).size,step.options.length,`${card.id}/${kind} unique alternatives`);
   assert(step.explanation.length>15);if(kind==='application')assert.equal(step.kind==='place'?step.statement:step.options.find(x=>x.id===step.correct).text,card.contexts[topic][position]);questionCount++;
 }
}
console.log(JSON.stringify({status:'PASS',model:'SM-2 intervals, lapse reset, same-day guard, 78 full card plans across 9 contexts',questionsChecked:questionCount}));
// Recommendation, due-review separation, and legacy session validation use the
// actual bridge, with no browser storage or random first-card assumptions.
let journeyData=api.blank(),destination='',clockAt=epoch;
model.document={addEventListener(){}};
model.structuredClone=structuredClone;
const journey=api.create({esc:x=>x,img:()=>'',icon:()=>'',go:x=>{destination=x;},toast:()=>{},now:()=>clockAt,cardMap:deck,get:()=>journeyData,set:x=>{journeyData=x;}});
assert.equal(journey.unlearned().length,78);
journey.new();const firstId=journeyData.session.cardId;
assert.equal(journeyData.session.playVersion,3);assert.equal(journeyData.session.mode,'new');assert.equal(journey.unlearned().length,77);
journeyData.session.index=1;journey.start();assert.equal(journeyData.session.cardId,firstId);assert.equal(journeyData.session.index,1);
journey.new();assert.notEqual(journeyData.session.cardId,firstId);assert(journeyData.paused[firstId]);
journey.start(firstId);assert.equal(journeyData.session.index,1);assert.equal(journeyData.session.playVersion,3);
journeyData.cards[firstId].rounds=1;journeyData.cards[firstId].skills.meaning=api.rate(null,4,epoch-DAY);journeyData.session.complete=true;
assert(journey.due().includes(firstId));assert.notEqual(journey.recommendation(),firstId);journey.new();assert.equal(journeyData.session.mode,'new');journey.review();assert.equal(journeyData.session.cardId,firstId);assert.equal(journeyData.session.mode,'review');
const migrated=api.validate(journeyData,Object.keys(deck));assert.equal(migrated.session.playVersion,3);
delete journeyData.session.playVersion;delete journeyData.session.variant;assert.equal(api.validate(journeyData,Object.keys(deck)).session.playVersion,undefined,'old question semantics must remain unchanged');
for(const id of Object.keys(deck))journeyData.cards[id]||={introducedAt:epoch,lastAt:epoch,rounds:0,skills:{}};
assert.equal(journey.unlearned().length,0);assert.equal(journey.recommendation(),null);journey.new();assert.equal(destination,'library');
const bridge={esc:x=>x,img:()=>'',icon:()=>'',go:()=>{},toast:()=>{},now:()=>epoch,cardMap:deck,get:()=>api.blank(),set:()=>{}};
model.Math=Object.create(Math);model.Math.random=()=>0;
const alternateA=api.create(bridge).recommendation();model.Math.random=()=>0.999999;
const alternateB=api.create(bridge).recommendation();assert.notEqual(alternateA,alternateB,'new-card recommendations must not have a fixed prefix');
if(process.env.JOURNEY_MODEL_ONLY==='1')process.exit(0);
const key='tarot-pocket-demo-v1',state=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
const url=process.env.DEMO_URL||'http://127.0.0.1:8765/tarot-demo.html';
const session=async p=>(await state(p)).journey.session;
async function english(p){const missing=await p.evaluate(()=>{const a=[],walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);for(let n=walk.nextNode();n;n=walk.nextNode())if(!n.parentElement.closest('script,style,noscript,[data-i18n-ignore]')&&/[\u3400-\u9fff]/.test(n.textContent))a.push(n.textContent.trim());return [...new Set(a)];});assert.deepEqual(missing,[],'journey English must not leak authored Chinese');}
async function complete(p,lang){
 let count=0;
 while(!(await session(p)).complete){
   const s=await session(p),kind=s.steps[s.index];if(lang==='en')await english(p);
   if(kind==='intro'){if(s.playVersion===3&&!s.inspected)await p.locator('[data-journey=inspect]').click();await p.locator('[data-journey=next]').click();continue;}
   if(kind==='recall'){await p.locator('[data-journey=reveal]').click();await p.locator('[data-journey=rate][data-value="4"]').click();}
   else if(s.playVersion===3&&['meaning','compare'].includes(kind)){
     if(kind==='meaning'){await p.locator('[data-journey=pick-evidence][data-value=yes]').click();await p.locator('[data-journey=pick-meaning][data-value=yes]').click();}
     else{const cards=await p.locator('[data-journey=match-card]').evaluateAll(es=>es.map(e=>e.dataset.value));for(const id of cards){await p.locator(`[data-journey=hold-meaning][data-value=${id}]`).click();await p.locator(`[data-journey=match-card][data-value=${id}]`).click();}}
     await p.locator('[data-journey=check-link]').click();assert.match(await p.locator('.journey-feedback>strong').innerText(),lang==='en'?/Correct|correct|right/:/答对/);
   }
   else{const id=kind==='compare'?s.cardId:kind==='application'?s.position:'yes';
     if(kind==='application'&&s.playVersion>=2){assert.equal(await p.locator('.journey-board .journey-slot').count(),3,'application shows labelled, visible positions');const viewport=p.viewportSize();for(const width of [320,390,430]){await p.setViewportSize({width,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'visual spread must fit narrow phones');}await p.setViewportSize(viewport);if(process.env.JOURNEY_SCREENSHOTS)await p.screenshot({path:path.join(process.env.JOURNEY_SCREENSHOTS,`journey-application-${lang}.png`),fullPage:true});}
     await p.locator(`[data-journey=answer][data-value="${id}"]`).click();assert.match(await p.locator('.journey-feedback>strong').innerText(),lang==='en'?/Correct|correct|right/:/答对/);
     if(kind==='application'&&s.playVersion>=2){const saved=await session(p);await p.locator('[data-journey=position]').first().click();assert.deepEqual((await session(p)).answers,saved.answers,'post-answer position exploration does not regrade');assert.equal(await p.locator('.journey-slot.occupied').count(),1);}
   }
   if(lang==='en')await english(p);await p.locator('[data-journey=next]').click();count++;
 }
 return count;
}
(async()=>{const browser=await chromium.launch(require('./browser_options.cjs'));
try{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',acceptDownloads:true}),p=await context.newPage();p.setDefaultTimeout(15000);p.setDefaultNavigationTimeout(120000);
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(url);await p.locator('[data-home-choice][data-journey=continue]').click();const firstCardId=(await session(p)).cardId;assert(deck[firstCardId]);
 assert.equal(await p.locator('[data-journey=next]').count(),0,'first encounter has no automatic or premature next action');await p.locator('[data-journey=inspect]').click();
 assert.equal(await p.locator('.journey-family-cards img').count(),firstCardId[0]==='m'?2:4);
 const introAnswers=Object.keys((await session(p)).answers).length;
 await p.locator('[data-journey=family]').last().click();assert.equal(Object.keys((await session(p)).answers).length,introAnswers,'foundation exploration does not count as an answer');
 await p.locator('[data-journey=next]').click();
 assert.equal(await p.locator('.picture-options img').count(),3,'new lessons use actual card images as choices');
 await p.locator('.picture-options img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
 assert.equal(await p.locator('.picture-options img').first().evaluate(image=>getComputedStyle(image).animationName),'none','reduced motion retains a static image');
 await p.emulateMedia({reducedMotion:'no-preference'});assert.equal(await p.locator('.picture-options img').first().evaluate(image=>getComputedStyle(image).animationName),'learning-arrive');await p.emulateMedia({reducedMotion:'reduce'});
 if(process.env.JOURNEY_SCREENSHOTS)await p.screenshot({path:path.join(process.env.JOURNEY_SCREENSHOTS,'journey-picture-zh.png'),fullPage:true});
 await p.locator('[data-journey=answer]:not([data-value=yes])').first().click();assert.match(await p.locator('.journey-feedback>strong').innerText(),/答错/);
 let before=await session(p);assert.equal(Object.keys(before.answers).length,1);
 await p.reload();await p.locator('[data-home-choice][data-journey=continue]').click();assert.deepEqual((await session(p)).answers,before.answers,'reload retains exact answer and does not double-score');
 await p.locator('[data-journey=next]').click();await complete(p,'zh');
 let data=(await state(p)).journey;assert.equal(data.cards[firstCardId].rounds,1);assert.equal(Object.keys(data.cards[firstCardId].skills).length,6);assert.equal(data.cards[firstCardId].skills.image.grade,2);assert.equal(api.level(data.cards[firstCardId]),'待巩固');
 await p.locator('[data-journey=next-card]').click();assert.notEqual((await session(p)).cardId,firstCardId);
 const nextId=(await session(p)).cardId;await p.locator('[data-journey=inspect]').click();await p.locator('[data-journey=next]').click();before=await session(p);
 await p.locator('[data-action=nav][data-page=home]').click();await p.locator('.bottomnav [data-page=library]').click();await p.locator('[data-action=filter][data-value=全部]').click();
 const chosenId=Object.keys(deck).find(id=>![nextId,firstCardId,'p14'].includes(id));
 await p.locator(`.library-card[data-id=${chosenId}]`).click();await p.locator(`[data-journey=start][data-id=${chosenId}]`).click();assert((await state(p)).journey.paused[nextId]);
 await p.locator('[data-action=nav][data-page=home]').click();await p.locator('.bottomnav [data-page=library]').click();await p.locator(`.library-card[data-id=${nextId}]`).click();await p.locator(`[data-journey=start][data-id=${nextId}]`).click();assert.equal((await session(p)).index,before.index,'switching cards retains each unfinished place');
 await complete(p,'zh');
 await p.locator('[data-action=nav][data-page=home]').last().click();await p.locator('.bottomnav [data-page=library]').click();await p.locator('[data-action=filter][data-value=全部]').click();
 await p.locator('.library-card[data-id=p14]').click();await p.locator('[data-journey=start][data-id=p14]').click();await p.locator('[data-language-toggle]').click();assert.equal(await p.locator('html').getAttribute('lang'),'en');await complete(p,'en');await english(p);
 // Actual delayed review and all nine topic/position combinations are distinct.
 await p.locator('[data-action=nav][data-page=home]').last().click();await p.locator('.topbar [data-page=me]').click();await p.locator('.advanced-learning>summary').click();await p.locator('.advanced-learning details>summary').last().click();await p.locator('[data-action=advance]').click();await p.locator('.bottomnav [data-page=home]').click();await p.locator('[data-journey=review]').first().click();assert.equal((await session(p)).mode,'review');assert.equal((await session(p)).steps[0],'recall');await complete(p,'en');
 data=(await state(p)).journey;assert(Object.values(data.cards).some(r=>Object.values(r.skills).some(x=>x.passes>0)));
 await p.locator('[data-action=nav][data-page=home]').last().click();await p.locator('.topbar [data-page=me]').click();await english(p);
 const dl=p.waitForEvent('download');await p.locator('[data-action=export]').click();const download=await dl,backup=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.deepEqual(backup.state.journey,data);
 // Importing a legacy backup must not erase new memory progress.
 const old=structuredClone(backup);delete old.state.journey;
 await p.locator('#import-file').setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(old))});await p.locator('[data-action=confirm-import]').click();assert.deepEqual((await state(p)).journey,data);
 const malformed=structuredClone(backup);malformed.state.journey.version=99;
 await p.locator('#import-file').setInputFiles({name:'malformed.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(malformed))});assert.deepEqual((await state(p)).journey,data,'invalid memory import leaves prior state intact');
 for(const width of [320,375,390,430,1280]){await p.setViewportSize({width,height:844});await p.locator('.bottomnav [data-page=home]').click();assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.locator('[data-home-choice][data-journey=continue]').click();assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.locator('[data-action=nav][data-page=home]').first().click();}
 await context.setOffline(true);await p.locator('[data-home-choice][data-journey=continue]').click();assert(await p.locator('.journey-stage').count());await p.locator('.journey-image img').evaluate(i=>i.decode());
 assert.deepEqual(errors,[]);await context.close();
 console.log(JSON.stringify({status:'PASS',checks:['78 continuous card plans','wrong feedback','7-step complete lesson and immediate next card','reload idempotence','per-card pause and resume','English learning and results','delayed review','SM-2 per skill','old backups retain new memory','invalid backups no mutation','320-1280 responsive','offline learning']}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
