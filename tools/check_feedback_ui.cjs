/* Synthetic receipt remains reachable after its question and reading record are removed. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const h=require('./reading_ui_harness.cjs');
(async()=>{
  const server=await h.server(),browser=await chromium.launch(require('./browser_options.cjs'));
  try{
    const context=await h.context(browser,{reducedMotion:'reduce'}),page=await context.newPage();
    await h.enter(page,server.url);
    const pool=await page.evaluate(()=>window.TAROT_READING_DECK.cards.map(c=>({id:c.id,reversed:false})));
    const saved={id:'synthetic-reading',at:Date.now(),spreadId:'one',topic:'love',questionId:'own',questionText:'',userQuestion:'',reversals:false,pool,picked:[0],revealed:[0],phase:'read'};
    await context.addInitScript(({saved})=>{
      if(sessionStorage.getItem('feedback-fixture-loaded'))return;
      sessionStorage.setItem('feedback-fixture-loaded','1');
      localStorage.setItem('tarot-query-receipts',JSON.stringify([[saved.id,{id:'synthetic-receipt',deletionToken:'synthetic-token',at:Date.now()}]]));
      localStorage.setItem('tarot-reading-v3',JSON.stringify({version:1,settings:{topic:'love',spreadId:'one'},draft:saved,history:[saved],practice:[],daily:[],ui:{view:'table'}}));
    },{saved});
    await page.reload();await page.locator('.bottomnav [data-page=reading]').click();
    assert.equal(await page.locator('.query-feedback [data-reading="withdraw-feedback"]').count(),1,'cleared question retains its withdrawal control');
    await page.evaluate(()=>{const state=JSON.parse(localStorage.getItem('tarot-reading-v3'));state.draft=null;state.history=[];localStorage.setItem('tarot-reading-v3',JSON.stringify(state));});
    await page.reload();await page.locator('.toplinkbtn[data-page=me]').click();
    assert.equal(await page.locator('.feedback-management [data-reading="withdraw-feedback"]').count(),1,'deleted reading still has an independent receipt control');
    await context.close();console.log('PASS: synthetic feedback receipt remains manageable after question clearing and reading deletion');
  }finally{await browser.close();await server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
