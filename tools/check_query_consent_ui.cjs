'use strict';
// All questions/tokens here are isolated synthetic fixtures; never call live AI or analytics.
const assert=require('node:assert/strict'),{chromium,webkit}=require('playwright'),h=require('./reading_ui_harness.cjs');
(async()=>{const server=await h.server();try{for(const engine of [chromium,webkit]){const browser=await engine.launch(require('./browser_options.cjs'));try{for(const mode of ['decline','consent','share-failure','concurrent']){
 const context=await h.context(browser,{reducedMotion:'reduce',serviceWorkers:'block'}),page=await context.newPage(),sent=[],ai=[],events=[],errors=[];let releaseFeedback;page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/ai-config.js*',r=>r.fulfill({contentType:'text/javascript',body:'window.TAROT_AI_CONFIG={endpoint:location.origin+"/api/reading",sessionEndpoint:location.origin+"/api/session",analyticsEndpoint:location.origin+"/api/events"}'}));
 await page.route('**/api/events',async r=>{events.push(...r.request().postDataJSON().events);await r.fulfill({status:204});});
 await page.route('**/api/reading',async r=>{ai.push(r.request().postDataJSON());await r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({text:'合成AI回答，用于测试自愿分析与正常解读互不影响。',provider:'deepseek',model:'synthetic-query'})});});
 await page.route('**/api/query-feedback',async r=>{sent.push({method:r.request().method(),body:r.request().postDataJSON()});if(mode==='concurrent'&&sent.length===1)await new Promise(resolve=>{releaseFeedback=resolve});await r.fulfill({status:mode==='share-failure'?503:sent.at(-1).method==='DELETE'?200:201,contentType:'application/json',body:JSON.stringify(sent.at(-1).method==='DELETE'?{deleted:true}:{id:'synthetic-query-receipt',deletionToken:'synthetic-query-deletion'})});});
 await h.enter(page,server.url);await h.intro(page,'one');await page.locator('[data-reading-question]').fill('合成问题：这周怎样安排绘画练习？');await h.click(page,'start');await h.toPick(page);await h.pick(page,0);await h.reveal(page);
 const box=page.locator('[data-ai-query-consent]');await box.waitFor();assert.equal(await box.isChecked(),false,'sharing is never preselected');assert.equal(sent.length,0,'opening result and checkbox do not send a query');
 if(mode!=='decline')await box.check();assert.equal(sent.length,0,'checking alone does not submit before AI is requested');
 await h.click(page,'ai-request');await page.locator('.ai-answer').waitFor();assert.equal(ai.length,1);assert(!Object.hasOwn(ai[0],'consent')&&!Object.hasOwn(ai[0],'context'),'provider request never gets analytics consent metadata');
 if(mode==='concurrent'){await page.waitForFunction(()=>document.querySelector('.query-feedback')!==null);await page.locator('.query-feedback summary').click();await page.locator('[data-query-consent]').check();await page.locator('[data-reading="send-feedback"]').click();await page.waitForFunction(()=>document.querySelector('[data-reading="send-feedback"]').disabled);assert.equal(sent.length,1,'AI and manual feedback share one in-flight request');assert.equal(typeof releaseFeedback,'function');releaseFeedback();}
 if(mode==='decline')assert.equal(sent.length,0,'using AI without consent never enters feedback store');
 else{
  await page.locator('.ai-query-status').waitFor();assert.equal(sent.length,1);assert.deepEqual(sent[0].body,{question:'合成问题：这周怎样安排绘画练习？',consent:true,consentVersion:'query-analysis-2',context:{source:'ai',spread:'one',topic:ai[0].topic}});assert.deepEqual(Object.keys(sent[0].body.context).sort(),['source','spread','topic']);
  if(mode==='consent'||mode==='concurrent'){
   if(mode==='consent')await page.locator('.query-feedback summary').click();await page.locator('[data-reading="withdraw-feedback"]').first().click();await page.waitForFunction(()=>document.querySelector('[data-feedback-status]')?.textContent.includes('已撤回'));
   assert.match(await page.locator('.ai-query-status').innerText(),/已撤回/);assert.equal(sent.length,2);assert.deepEqual(sent[1],{method:'DELETE',body:{id:'synthetic-query-receipt',deletionToken:'synthetic-query-deletion'}});assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('tarot-query-receipts'))),[]);
  }else{assert.match(await page.locator('.ai-query-status').innerText(),/未能提交/);assert(await page.locator('.ai-answer').isVisible(),'feedback failure does not remove AI answer');assert.equal(await page.evaluate(()=>localStorage.getItem('tarot-query-receipts')),null);}
 }
 await page.evaluate(()=>TarotAnalytics.flush());assert(!JSON.stringify(events).includes('绘画练习'),'ordinary events never contain question text');await h.fit(page);assert.deepEqual(errors,[]);await context.close();
 console.log(`PASS ${engine.name()} ${mode}: unchecked per-request query consent, separate metadata-limited submission, provider isolation, revocation/failure and no raw question in events`);
 }}finally{await browser.close()}}}finally{await server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
