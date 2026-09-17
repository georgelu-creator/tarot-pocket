/* Current bilingual product coverage. Legacy data contracts remain in their model checks. */
const assert=require('node:assert/strict'),{chromium}=require('playwright');
const H=require('./reading_ui_harness.cjs'),academy=require('./check_academy_v2.cjs'),translationGaps=[];
async function english(page,label){
 const missing=await page.evaluate(()=>{
  const found=[],han=/[\u3400-\u9fff]/;
  // Academy renders authored English directly; it must be checked even though
  // it opts out of the legacy DOM substitution translator.
  const ignored=e=>e.closest('script,style,noscript')||e.closest('[data-i18n-ignore]')&&!e.closest('.academy-shell,.academy-home');
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  for(let n=w.nextNode();n;n=w.nextNode())if(!ignored(n.parentElement)&&han.test(n.textContent))found.push(n.textContent.trim());
  for(const e of document.querySelectorAll('[aria-label],[alt],[title],[placeholder]'))if(!ignored(e))for(const k of ['aria-label','alt','title','placeholder'])if(han.test(e.getAttribute(k)||''))found.push(e.getAttribute(k));
  return [...new Set(found)];
 });if(missing.length)translationGaps.push({label,missing});await H.fit(page);
}
(async()=>{
 await academy.checkUI('english');
 const fixture=await H.server(),b=await chromium.launch(require('./browser_options.cjs'));
 try{
 const ctx=await H.context(b,{viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(18000);
 await p.goto(fixture.url+'?lang=en');await english(p,'home');assert.deepEqual(await p.locator('.navitem').allTextContents(),['Home','Learn','Draw']);
 // Check every authored teaching / question / feedback / support / revisit in
 // the real renderer, rather than assuming a translation map proves rendering.
 const renderGaps=await p.evaluate(()=>{
  const missing=[],A=TarotAcademy;let d=A.blank();
  const view=A.create({esc:x=>String(x).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c])),img:()=>'',icon:()=>'',go:()=>{},toast:()=>{},now:()=>1800000000000,get:()=>d,set:x=>d=x});
  for(const u of Object.values(A.units))for(const mode of u.kind==='card'?['learn','reverse','review','reverse-review']:['learn','review'])for(const wrong of [false,true]){
   d=A.blank();d.session={unitId:u.id,mode,index:0,seed:1,startedAt:1,answers:{},support:null,hint:false,complete:false,contentVersion:A.version,animation:{frame:0,static:true,paused:true}};
   let guard=90;while(guard--){const root=document.createElement('div');root.innerHTML=view.render();const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);for(let n=walk.nextNode();n;n=walk.nextNode())if(/[\u3400-\u9fff]/.test(n.textContent))missing.push(u.id+' '+n.textContent.trim());if(d.session.complete)break;const step=A.stepFor(d.session);if(step.kind==='question'&&!d.session.answers[step.question.id]){d.session.hint=true;A.answer(d,wrong?step.question.options.find(o=>o.id!==step.question.correct).id:step.question.correct,1800000000000);continue;}A.advance(d,1800000001000);}
   if(!d.session.complete)missing.push(u.id+' did not finish');
  }return [...new Set(missing)];
 });assert.deepEqual(renderGaps,[],'all 98 units must render actual English on every normal and remedial branch');
 await p.locator('[data-action=choose-cards]').first().click();await p.locator('[data-action=filter][data-value=全部]').click();await english(p,'library');
 const cards=await p.evaluate(()=>TAROT_READING_DECK.cards.map(c=>c.id));
 for(const id of cards){await p.locator(`.library-card[data-id="${id}"]`).click();await english(p,id+' detail');await p.locator('[data-action=face][data-value=reversed]').click();await english(p,id+' reversed');await p.locator('#overlay [data-action=close]').click();}
 await p.locator('.bottomnav [data-page=reading]').click();await english(p,'reading directory');
 const scenes=await p.evaluate(()=>TAROT_READING_SCENARIOS);
 const openScene=async scene=>{if((await p.locator('.reading-theme').getAttribute('id'))!==`reading-theme-${scene.category}`)await p.locator(`[data-reading=category][data-value=${scene.category}]`).click();await p.locator(`[data-reading=guide][data-scenario="${scene.id}"]`).click();};
 for(const scene of scenes){await openScene(scene);await english(p,scene.id+' complete introduction');assert.equal(await p.locator('[data-reading=guide-position]').count(),0,'all positions are visible without selecting one');await H.click(p,'guide-back');}
 for(const scene of scenes){await openScene(scene);await p.locator('[data-reading-question]').fill('What should I understand before taking my next step?');await english(p,scene.id+' question');await H.click(p,'start');await H.toPick(p);await english(p,scene.id+' fan');const count=await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('tarot-reading-v3')).draft;return TAROT_SPREAD_CONTENT.spreads.find(s=>s.id===d.spreadId).positions.length;});for(let i=0;i<count;i++)await H.pick(p,i*3);await H.reveal(p);await english(p,scene.id+' result');await H.click(p,'result-guide');await english(p,scene.id+' result guide');await H.click(p,'guide-back');await H.click(p,'pause');}
 await H.click(p,'daily');await H.toPick(p);await H.pick(p,12);await H.reveal(p);await english(p,'daily result');await H.click(p,'finish');
 await p.locator('.topbar [data-page=me]').click();await english(p,'records');await p.locator('[data-action=status]').first().click();await p.getByText('78 / 78',{exact:true}).waitFor();await english(p,'offline content');await p.locator('[data-action=sources]').click();await english(p,'sources');await p.locator('#overlay [data-action=close]').click();
 for(const width of [320,430,1280]){await p.setViewportSize({width,height:900});await english(p,'responsive '+width);}
 await p.locator('[data-language-toggle]').click();await p.reload();assert.equal(await p.locator('html').getAttribute('lang'),'zh-CN');await p.locator('[data-language-toggle]').click();await p.reload();assert.equal(await p.locator('html').getAttribute('lang'),'en');await english(p,'reload');
 // The library remains an offline destination; its current user entry is
 // Home -> Choose a card. Do not substitute the new course page for this check.
 await ctx.setOffline(true);await p.locator('.bottomnav [data-page=home]').click();await p.locator('[data-action=choose-cards]').click();assert.equal(await p.locator('.library-card').count(),78);await english(p,'offline library');assert.deepEqual(errors,[]);assert.deepEqual(translationGaps,[],'All current UI strings and accessibility labels must be translated');
 console.log(JSON.stringify({status:'PASS',englishCourses:98,englishCards:cards.length,englishSpreads:scenes.length,checks:['all normal/error/support/revisit branches rendered','78 bilingual card references','every current spread introduction and drawing result','language reload and offline','320/390/430/1280']}));
 }finally{await b.close();await fixture.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
