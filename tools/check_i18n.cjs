const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),model={window:{}};
for(const f of ['content.js','learning-content.js','spread-content.js','reading-deck.js'])vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),model);
const units=[...model.window.TAROT_LEARNING.units,...model.window.TAROT_SPREAD_CONTENT.units];
const url=process.env.DEMO_URL||'http://127.0.0.1:8765/tarot-demo.html';
async function english(page,label){
  const missing=await page.evaluate(()=>{
    const found=[],han=/[\u3400-\u9fff]/;
    const ignored=e=>e.closest('script,style,noscript,[data-i18n-ignore]');
    const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    for(let n=w.nextNode();n;n=w.nextNode())if(!ignored(n.parentElement)&&han.test(n.textContent))found.push(n.textContent.trim());
    for(const e of document.querySelectorAll('[aria-label],[alt],[title],[placeholder]'))if(!ignored(e))for(const k of ['aria-label','alt','title','placeholder'])if(han.test(e.getAttribute(k)||''))found.push(e.getAttribute(k));
    return [...new Set(found)];
  });
  assert.deepEqual(missing,[],`Untranslated English UI at ${label}`);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Overflow at ${label}`);
}
const learn=(p,a,v)=>p.locator(`[data-learn="${a}"]${v?`[data-value="${v}"]`:''}`).last().click();
(async()=>{
 const browser=await chromium.launch(require('./browser_options.cjs'));
 try{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await context.newPage();
 p.setDefaultTimeout(60000);p.setDefaultNavigationTimeout(120000);
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(url+'?lang=en');await english(p,'home');
 assert.deepEqual(await p.locator('.navitem').allTextContents(),['Home','Learn','Draw']);
 const openUnit=async id=>{
   if(!(await p.locator('.library-grid').count()))await p.locator('.bottomnav [data-page=library]').click();
   await p.locator('[data-action=library-view][data-value=spreads]').click();
   if(!(await p.locator('.advanced-learning[open]').count()))await p.locator('.advanced-learning>summary').click();
   await p.locator(`[data-learn-start="${id}"]`).first().click();
 };
 for(const u of units){
   await openUnit(u.id);
   const session=await p.evaluate(()=>JSON.parse(localStorage.getItem('tarot-learning-units-v2')));
   const ids=session.sessions[u.id].stepIds;
   for(const id of ids){const s=u.steps.find(x=>x.id===id);
     await english(p,s.id);
     if(s.kind==='intro'){await learn(p,'next');continue;}
     if(s.kind==='recall'){await learn(p,'reveal');await english(p,s.id+' recall');await learn(p,'rate','part');await learn(p,'next');continue;}
     if(s.kind==='arrange'){for(const v of s.correctOrder)await learn(p,'assign',v);}
     else{
       await learn(p,'select',s.correct);
       if(s.kind==='reason'){await learn(p,'submit');await english(p,s.id+' evidence');await learn(p,'evidence',s.evidenceCorrect);}
     }
     // Switching languages midway must not alter answers, order, or saved progress.
     if(s.id===ids.find(x=>u.steps.find(y=>y.id===x)?.kind==='reason')){
       const before=await p.evaluate(()=>localStorage.getItem('tarot-learning-units-v2'));
       await p.locator('[data-language-toggle]').click();assert.equal(await p.locator('html').getAttribute('lang'),'zh-CN');
       await p.locator('[data-language-toggle]').click();assert.equal(await p.evaluate(()=>localStorage.getItem('tarot-learning-units-v2')),before);
     }
     await learn(p,'submit');await english(p,s.id+' feedback');await learn(p,'next');
   }
   await english(p,u.id+' completion');await p.locator('[data-learn=home]').last().click();
 }
 console.log('PASS: all guided units render in English; mid-answer switching preserves records.');
 await p.locator('.bottomnav [data-page=reading]').click();
 for(const d of model.window.TAROT_SPREAD_CONTENT.spreads.filter(d=>d.id!=='daily'&&!d.legacy)){
   if(d.id==='daily')await p.locator('[data-reading=daily]').click();else await p.locator(`[data-reading=guide][data-value="${d.id}"]`).click();
   for(let i=0;i<d.positions.length;i++){await p.locator(`[data-reading=guide-position][data-index="${i}"]`).last().click();await english(p,d.id+' position '+i);}
   await p.locator('[data-reading=guide-back]').click();
 }
 await p.locator('.bottomnav [data-page=library]').click();await p.locator('[data-action=library-view][data-value=cards]').click();await english(p,'library');
 await p.locator('[data-action=filter][data-value=全部]').click();
 for(const card of model.window.TAROT_READING_DECK.cards){
   await p.locator(`.library-card[data-id="${card.id}"]`).click();await english(p,card.id+' detail');
   await p.locator('[data-action=face][data-value=reversed]').click();await english(p,card.id+' reversed');
   await p.locator('#overlay [data-action=close]').click();
 }
 await p.locator('.bottomnav [data-page=reading]').click();await english(p,'drawing setup');
 for(const d of model.window.TAROT_SPREAD_CONTENT.spreads.filter(d=>d.id!=='daily'&&!d.legacy)){
   if(d.id==='daily')await p.locator('[data-reading=daily]').click();else await p.locator(`[data-reading=guide][data-value="${d.id}"]`).click();await english(p,'guide '+d.id);
   await p.locator(`[data-reading=use-spread][data-value="${d.id}"]`).click();
   await p.locator('[data-reading-question]').fill('What should I understand and verify before choosing my next step?');
   await p.locator('[data-reading-setting=reversals]').setChecked(true);
   await p.locator('[data-reading=start]').click();await p.locator('[data-reading=cut-default]').click();await p.locator('[data-reading=pick]').first().waitFor();await english(p,'pick '+d.id);
   for(let i=0;i<d.positions.length;i++)await p.locator(`[data-reading=pick][data-index="${i}"]`).click();
   for(let i=0;i<d.positions.length;i++){await p.locator(`[data-reading=card][data-index="${i}"]`).click();await english(p,'reading '+d.id+' '+i);}
   await p.locator('[data-reading=finish]').click();
 }
 await p.locator('[data-reading=daily]').click();await p.locator('[data-reading=cut-default]').click();await english(p,'daily cut and pick');await p.locator('[data-reading=pick]').first().click();await p.locator('[data-reading=card]').first().click();await english(p,'daily reading');await p.locator('.topbar [data-page=me]').click();await english(p,'records');
 await p.locator('[data-action=status]').first().click();await p.getByText('78 / 78',{exact:true}).waitFor();await english(p,'content status');
 await p.locator('[data-action=sources]').click();await english(p,'sources');await p.locator('#overlay [data-action=close]').click();
 for(const width of [320,430,1280]){await p.setViewportSize({width,height:900});await english(p,'responsive '+width);}
 await p.locator('[data-language-toggle]').click();await p.reload();assert.equal(await p.locator('html').getAttribute('lang'),'zh-CN');
 await p.locator('[data-language-toggle]').click();await p.reload();assert.equal(await p.locator('html').getAttribute('lang'),'en');await english(p,'reload');
 await context.setOffline(true);await p.locator('.bottomnav [data-page=library]').click();await english(p,'offline');
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({status:'PASS',englishUnits:units.length,englishCards:78,englishSpreads:model.window.TAROT_SPREAD_CONTENT.spreads.length,checks:['no untranslated content or labels','language switch retains answer state','language survives reload','320/390/430/1280 widths','offline language use']}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
