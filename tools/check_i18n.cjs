/* v1.9 public UI is Chinese-only. Authored bilingual catalogs remain covered by model/locales checks. */
'use strict';
const assert=require('node:assert/strict'),{chromium}=require('playwright');
const H=require('./reading_ui_harness.cjs'),academy=require('./check_academy_v2.cjs');
async function chinese(page,label){
 assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN',label+' document language');
 assert.equal(await page.locator('[data-language-toggle]').count(),0,label+' has no public language toggle');
 assert(/[\u3400-\u9fff]/.test(await page.locator('body').innerText()),label+' displays Chinese');
 await H.fit(page);
}
(async()=>{
 await academy.checkUI('english');
 const fixture=await H.server(),b=await chromium.launch(require('./browser_options.cjs'));
 try{
  const ctx=await H.context(b,{viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await ctx.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(18000);
  await p.goto(fixture.url+'?lang=en');await chinese(p,'?lang=en home');
  assert.deepEqual(await p.locator('.navitem').allTextContents(),['首页','学牌','抽牌']);
  // Render every authored normal, wrong-answer, support and revisit branch in the real view.
  const renderProblems=await p.evaluate(()=>{
   const problems=[],A=TarotAcademy;let d=A.blank();
   const view=A.create({esc:x=>String(x).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c])),img:()=>'',icon:()=>'',go:()=>{},toast:()=>{},now:()=>1800000000000,get:()=>d,set:x=>d=x});
   for(const u of Object.values(A.units))for(const mode of u.kind==='card'?['learn','reverse','review','reverse-review']:['learn','review'])for(const wrong of [false,true]){
    d=A.blank();d.session={unitId:u.id,mode,index:0,seed:1,startedAt:1,answers:{},support:null,hint:false,complete:false,contentVersion:A.version,animation:{frame:0,static:true,paused:true}};
    let guard=90;while(guard--){const root=document.createElement('div');root.innerHTML=view.render();const text=root.innerText||root.textContent||'';if(!/[\u3400-\u9fff]/.test(text))problems.push(u.id+' '+mode+' rendered without Chinese');if(/Back to courses|Start with an explanation|Not quite|Core meaning|Picture cues/.test(text))problems.push(u.id+' '+mode+' exposed English public copy');if(d.session.complete)break;const step=A.stepFor(d.session);if(step.kind==='question'&&!d.session.answers[step.question.id]){d.session.hint=true;A.answer(d,wrong?step.question.options.find(o=>o.id!==step.question.correct).id:step.question.correct,1800000000000);continue;}A.advance(d,1800000001000);}
    if(!d.session.complete)problems.push(u.id+' did not finish');
   }return [...new Set(problems)];
  });
  assert.deepEqual(renderProblems,[],'all 98 units render Chinese throughout every branch');
  await p.locator('.bottomnav [data-page=courses]').click();await p.locator('.academy-card-library [data-action=nav][data-page=library]').click();await p.locator('[data-action=filter][data-value=全部]').click();await chinese(p,'library');
  const cards=await p.evaluate(()=>TAROT_READING_DECK.cards.map(c=>c.id));
  for(const id of cards){await p.locator(`.library-card[data-id="${id}"]`).click();await chinese(p,id+' detail');await p.locator('[data-action=face][data-value=reversed]').click();await chinese(p,id+' reversed');await p.locator('#overlay [data-action=close]').click();}
  await p.locator('.bottomnav [data-page=reading]').click();await chinese(p,'reading directory');
  const scenes=await p.evaluate(()=>TAROT_READING_SCENARIOS);
  const openScene=async scene=>{if((await p.locator('.reading-theme').getAttribute('id'))!==`reading-theme-${scene.category}`)await p.locator(`[data-reading=category][data-value=${scene.category}]`).click();await p.locator(`[data-reading=guide][data-scenario="${scene.id}"]`).click();};
  for(const scene of scenes){await openScene(scene);await chinese(p,scene.id+' introduction');assert.equal(await p.locator('[data-reading=guide-position]').count(),0,'all positions are visible without selecting one');await H.click(p,'guide-back');}
  for(const scene of scenes){await openScene(scene);await p.locator('[data-reading-question]').fill('下一步之前，我最需要看清什么？');await chinese(p,scene.id+' question');await H.click(p,'start');await H.toPick(p);await chinese(p,scene.id+' fan');const count=await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('tarot-reading-v3')).draft;return TAROT_SPREAD_CONTENT.spreads.find(s=>s.id===d.spreadId).positions.length;});for(let i=0;i<count;i++)await H.pick(p,i*3);await H.reveal(p);await chinese(p,scene.id+' result');await H.click(p,'result-guide');await chinese(p,scene.id+' result guide');await H.click(p,'guide-back');await H.click(p,'pause');}
  await H.click(p,'daily');await H.toPick(p);await H.pick(p,12);await H.reveal(p);await chinese(p,'daily result');await H.click(p,'finish');
  await p.locator('.topbar [data-page=me]').click();await chinese(p,'records');await p.locator('[data-action=status]').first().click();await p.getByText('78 / 78',{exact:true}).waitFor();await chinese(p,'offline content');await p.locator('[data-action=sources]').click();await chinese(p,'sources');await p.locator('#overlay [data-action=close]').click();
  for(const width of [320,430,1280]){await p.setViewportSize({width,height:900});await chinese(p,'responsive '+width);}
  await p.setViewportSize({width:390,height:844});await p.locator('.bottomnav [data-page=reading]').click();await openScene(scenes[0]);const question='切换兼容设置后仍应保留这段问题';await p.locator('[data-reading-question]').fill(question);const stored=await p.evaluate(()=>({...localStorage}));await p.evaluate(()=>TAROT_I18N.setLocale('en'));assert.equal(await p.locator('[data-reading-question]').inputValue(),question);assert.deepEqual(await p.evaluate(()=>({...localStorage})),stored);await chinese(p,'setLocale fallback');await p.reload();await chinese(p,'reload fallback');await p.locator('.bottomnav [data-page=reading]').click();if(!(await p.locator('[data-reading-question]').count()))await openScene(scenes[0]);assert.equal(await p.locator('[data-reading-question]').inputValue(),question);
  await ctx.setOffline(true);if(await p.locator('[data-reading=guide-back]').count())await H.click(p,'guide-back');await p.locator('.bottomnav [data-page=courses]').click();await p.locator('.academy-card-library [data-action=nav][data-page=library]').click();assert.equal(await p.locator('.library-card').count(),78);await chinese(p,'offline library');
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({status:'PASS',chineseCourses:98,chineseCards:cards.length,chineseSpreads:scenes.length,checks:['all normal/error/support/revisit branches rendered','78 card references through separate library route','every current spread introduction and drawing result','?lang=en and setLocale(en) keep Chinese','no visible language toggle','state and input survive compatibility locale calls and reload','offline library','320/390/430/1280'],staticBilingualIntegrity:['check_locales.cjs','check_curriculum.cjs','check_academy_v2.cjs --model']}));
 }finally{await b.close();await fixture.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
