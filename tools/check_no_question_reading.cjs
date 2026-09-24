/* Empty questions still produce useful spread-specific readings. Isolated fixtures only. */
'use strict';
const assert=require('node:assert/strict'),{chromium}=require('playwright'),h=require('./reading_ui_harness.cjs');
(async()=>{
 const server=await h.server(),browser=await chromium.launch(require('./browser_options.cjs'));
 try {
  const ctx=await h.context(browser,{viewport:{width:390,height:844},serviceWorkers:'block'}),page=await ctx.newPage();
  await page.goto(server.url);
  const spreadIds=await page.evaluate(()=>TAROT_SPREAD_CONTENT.spreads.map(s=>s.id));
  for(const id of spreadIds){
   const result=await page.evaluate(id=>{
    const spread=TAROT_SPREAD_CONTENT.spreads.find(s=>s.id===id);
    const s={id:'no-question-'+id,spreadId:id,phase:'read',questionText:'',userQuestion:'',topic:'general',pool:TAROT_READING_DECK.cards.map(c=>({id:c.id,reversed:false})),picked:spread.positions.map((_,i)=>i)};
    const scene=TAROT_READING_SCENARIOS.find(x=>x.spreadId===id);
    if(scene)Object.assign(s,{scenarioId:scene.id,sceneVersion:scene.version,questionText:scene.question||'',topic:scene.topic});
    const box=document.createElement('div');box.innerHTML=TarotReadingAI.render(s);
    const local=box.querySelector('.reading-offline');
    return {text:local.textContent,positions:local.querySelectorAll('.offline-position').length,count:spread.positions.length,heading:local.querySelector('h2').textContent};
   },id);
   assert.doesNotMatch(result.text,/没有填写|没有具体问题|补造|一般提示|必须有具体|请先补充/);
   if(id==='yes-no')assert.match(result.heading,/^(Yes|No)$/);
   else {assert.equal(result.positions,result.count);assert.match(result.text,/暗语/);}
  }
  await ctx.close();console.log('PASS: optional empty questions show Yes/No or every spread position with a card message, without empty-question boilerplate.');
 } finally {await browser.close();await server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
