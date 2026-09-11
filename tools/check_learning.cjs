const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const model = {window:{}};
for(const f of ['content.js','learning-content.js'])vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),model);
const units=model.window.TAROT_LEARNING.units;
const cards=new Set(model.window.TAROT_CONTENT.cards.map(c=>c.id));
const ids=new Set();
for(const unit of units){
  assert(unit.cardIds.every(id=>cards.has(id)));
  for(const s of unit.steps){
    assert(!ids.has(s.id));ids.add(s.id);
    assert(s.title&&s.prompt&&s.feedback&&s.dimension);
    assert((s.cardIds||[]).every(id=>cards.has(id)));
    if(s.options){assert(s.options.every(o=>o.id&&o.text&&o.why));assert.equal(new Set(s.options.map(o=>o.id)).size,s.options.length);}
    if(['choice','observe','reason'].includes(s.kind))assert(s.options.some(o=>o.id===s.correct));
    if(s.kind==='reason')assert(s.evidenceOptions.some(o=>o.id===s.evidenceCorrect)&&s.evidenceOptions.every(o=>o.why));
    if(s.kind==='arrange')assert.equal(new Set(s.correctOrder).size,3);
    if(s.kind==='recall')assert(s.points.length>=2);
  }
}
assert.equal(ids.size,32);
const KEY='tarot-learning-units-v2';
const state=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
const click=(p,a,v)=>p.locator(`[data-learn="${a}"]${v?`[data-value="${v}"]`:''}`).last().click();
const width=async p=>assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow');
const url=process.env.DEMO_URL||'http://127.0.0.1:8765/tarot-demo.html';
(async()=>{
 const browser=await chromium.launch(require('./browser_options.cjs'));
 try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true});
 const p=await ctx.newPage(),errors=[],external=[];
 p.setDefaultTimeout(90000);p.setDefaultNavigationTimeout(120000);
 p.on('pageerror',e=>errors.push(e.message));
 p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 p.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(new URL(url).origin))external.push(r.url());});
 await p.goto(url);
 assert.deepEqual(await p.locator('.navitem').allTextContents(),['首页','学牌','抽牌']);
 const openUnit=async id=>{
   if(await p.locator('[data-learn=home]').count())await click(p,'home');
   if(!(await p.locator('.library-grid').count()))await p.locator('.bottomnav [data-page=library]').click();
   if(!(await p.locator('.advanced-learning[open]').count()))await p.locator('.advanced-learning>summary').click();
   await p.locator(`[data-learn-start=${id}]`).click();
 };
 await openUnit('p04');
 const run=async(unit,settings={})=>{
   const selected={};
   for(const step of unit.steps){
     await p.getByRole('heading',{name:step.title,exact:true}).waitFor();
     await width(p);
     assert.equal(await p.locator('.learn-feedback').count(),0,'feedback should start hidden');
     if(step.id==='p04-reversed')assert.equal(await p.locator('.learn-visual .reversed-img').count(),1);
     if(step.id==='case-advice')assert.equal(await p.locator('.learn-slot').innerText(),'建议');
     if(step.id==='case-layout')assert.equal(await p.locator('.learn-slot').count(),0,'layout names hidden until answer');
     if(step.kind==='intro'){await click(p,'next');continue;}
     if(step.kind==='recall'){
       const text=await p.locator('#app').innerText();assert(step.points.every(point=>!text.includes(point)),'recall answer leaked');
       const n=(await state(p)).history.length;
       await click(p,'reveal');assert.equal((await state(p)).history.length,n,'revealing is not a score');
       assert(await p.locator('[data-learn=next]').isDisabled());
       await click(p,'rate',step.id==='p04-recall-first'?'part':'all');
       await click(p,'next');
       const h=(await state(p)).history.at(-1);assert.equal(h.correct,null);assert.equal(h.kind,'recall');
       continue;
     }
     if(step.id==='p04-observe'){
       const boxes=await p.locator('.hotspot').evaluateAll(xs=>xs.map(x=>({w:x.offsetWidth,h:x.offsetHeight})));
       assert(boxes.every(b=>b.w>=44&&b.h>=44));
       await click(p,'hint');
       await p.screenshot({path:'/tmp/tarot-v2-observe-mobile.png',fullPage:true});
     }
     if(step.kind==='arrange'){
       await click(p,'assign','advice');await click(p,'assign','present');
       await p.locator('[data-learn=unassign][data-index="0"]').click();
       assert.deepEqual((await state(p)).sessions.case.answers[step.id].arranged,['present']);
       await click(p,'assign','obstacle');await click(p,'assign','advice');
     }else{
       const chosen=step.id==='case-theme'?step.options.find(o=>o.id!==step.correct).id:step.correct;
       selected[step.id]=chosen;
       await click(p,'select',chosen);
     }
     await click(p,'confidence','sure');
     assert.equal(await p.locator('.learn-feedback').count(),0,'selection must not reveal answer');
     if(step.kind==='reason'){
       const n=(await state(p)).history.length;
       await click(p,'submit');
       assert.equal(await p.locator('.learn-feedback').count(),0,'interpretation must wait for evidence');
       assert.equal((await state(p)).history.length,n,'do not score interpretation alone');
       const a=(await state(p)).sessions[unit.id].answers[step.id];
       if(step.id==='p04-reason'){
         await p.reload();await openUnit('p04');
         assert.deepEqual((await state(p)).sessions.p04.answers[step.id],a,'resume shuffled evidence and interpretation');
         assert.equal(await p.locator('.learn-locked').count(),1);
         await p.screenshot({path:'/tmp/tarot-v2-evidence-mobile.png',fullPage:true});
       }
       const evidence=step.id==='p04-reason'?step.evidenceOptions.find(o=>o.id!==step.evidenceCorrect).id:step.evidenceCorrect;
       await click(p,'evidence',evidence);
     }
     const n=(await state(p)).history.length;
     await click(p,'submit');
     assert.equal((await state(p)).history.length,n+1,'one event per completed judgment');
     assert.equal(await p.locator('.learn-feedback').count(),1);
     const h=(await state(p)).history.at(-1);
     assert.equal(h.correct,!['p04-reason','case-theme'].includes(step.id));
     if(step.id==='p04-reason'){
       assert.equal(h.interpretationCorrect,true);assert.equal(h.evidenceCorrect,false);
       await p.reload();await openUnit('p04');
       assert.equal((await state(p)).history.length,n+1,'reloading feedback must not duplicate');
     }
     await click(p,'next');
   }
   await p.locator('.learn-summary').waitFor();
   if(unit.id==='case'){
     assert.equal(await p.locator('.built-reading li').count(),5);
     const wrong=unit.steps.find(s=>s.id==='case-theme').options.find(o=>o.id===selected['case-theme']);
     assert((await p.locator('.built-reading li').first().innerText()).includes(wrong.text),'summary must preserve actual wrong choice');
     assert.equal(await p.locator('.built-reading li').first().locator('.needs-work').count(),1);
     await p.screenshot({path:'/tmp/tarot-v2-case-mobile.png',fullPage:true});
   }
 };
 await run(units.find(u=>u.id==='p04'));
 assert.equal((await state(p)).history.length,11,'one intro excluded, two self-reports separate');
 await openUnit('structure');
 await run(units.find(u=>u.id==='structure'));
 await openUnit('case');
 await run(units.find(u=>u.id==='case'));
 await click(p,'home');await p.locator('.topbar [data-page=me]').click();
 await p.locator('.advanced-learning>summary').click();assert((await p.locator('.learn-concepts').innerText()).includes('还值得巩固'));
 await p.locator('.advanced-learning details>summary').last().click();await p.locator('[data-action=advance]').click();await p.locator('.advanced-learning>summary').click();
 assert((await p.locator('.learn-concepts').innerText()).includes('可以复习了'));
 const download=p.waitForEvent('download');await p.locator('[data-action=export]').click();
 const backup=JSON.parse(fs.readFileSync(await (await download).path(),'utf8'));
 assert(backup.learning.history.length>0&&backup.learning.sessions.p04.index===12);
 await p.locator('[data-action=reset]').click();await p.locator('[data-action=confirm-reset]').click();
 assert.equal((await state(p)).history.length,0);
 await p.locator('.topbar [data-page=me]').click();
 const upload=async b=>p.locator('#import-file').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(b))});
 await upload({...backup,learning:{version:999}});await p.locator('.toast').filter({hasText:'无法导入'}).waitFor();
 assert.equal((await state(p)).history.length,0,'invalid new-state import must be atomic');
 await upload(backup);await p.locator('[data-action=confirm-import]').click();
 assert.deepEqual(await state(p),backup.learning,'round trip includes unit progress and chosen answers');
 const legacy={...backup};delete legacy.learning;await upload(legacy);await p.locator('[data-action=confirm-import]').click();
 assert.deepEqual(await state(p),backup.learning,'legacy import preserves newer unit records');
 await openUnit('return');
 const ret=units.find(u=>u.id==='return');const live=await state(p);
 assert(live.sessions.return.stepIds.every(id=>id.startsWith('return-')),'review uses fresh variants');
 await run({...ret,steps:ret.steps.filter(s=>live.sessions.return.stepIds.includes(s.id))});
 await click(p,'home');
 for(const w of [320,375,390,430,1280]){await p.setViewportSize({width:w,height:900});await width(p);}
 await p.screenshot({path:'/tmp/tarot-v2-home-desktop.png',fullPage:true});
 await p.setViewportSize({width:390,height:844});await p.screenshot({path:'/tmp/tarot-v2-home-mobile.png',fullPage:true});
 const off=await browser.newContext({viewport:{width:320,height:760}});await off.setOffline(true);
 const op=await off.newPage();await op.goto('file://'+path.join(root,'demo/tarot-demo.html'));
 await op.locator('.bottomnav [data-page=library]').click();await op.locator('.advanced-learning>summary').click();await op.locator('[data-learn-start=p04]').first().click();
 await op.locator('.hotspot-card img').evaluate(im=>im.decode());
 await width(op);await click(op,'select','hold');await click(op,'submit');
 assert.equal(await op.locator('.learn-feedback').count(),1,'cold file start works offline');
 await off.close();assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 console.log(JSON.stringify({status:'PASS',learningSteps:ids.size,checks:['four complete learning units','recall answer hidden and self-report ungraded','44px image targets','interpretation and evidence committed before feedback','partial-correct reasoning','shuffled evidence resume','no duplicate events on reload','slot reorder','reversed visual and correct case labels','actual choices preserved in case summary','date simulation and fresh review variants','backup/reset/import incl legacy and malformed backup','320/375/390/430/1280 layouts','offline file cold start','no console errors or external requests'],limitations:['iPhone Safari not tested','spaced review remains a labeled demo rule']},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
