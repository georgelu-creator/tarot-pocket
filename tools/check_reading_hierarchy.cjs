'use strict';
// Lock the agreed hierarchy without changing either product's presentation.
const assert=require('node:assert/strict'),{chromium,webkit}=require('playwright'),h=require('./reading_ui_harness.cjs');
(async()=>{const server=process.env.WEB_URL?{url:process.env.WEB_URL,close:async()=>{}}:await h.server();
try{for(const type of [chromium,webkit]){const browser=await type.launch(require('./browser_options.cjs'));try{for(const width of [390,1280]){
 const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce',serviceWorkers:'block',extraHTTPHeaders:{DNT:'1'}}),page=await context.newPage();
 // No provider/session/query/telemetry calls during this UI review.
 await page.route('**/api/**',route=>route.abort());
 await h.enter(page,server.url);
 const scenes=await page.evaluate(()=>TAROT_READING_SCENARIOS.map(s=>({id:s.id,category:s.category,spreadId:s.spreadId})));
 for(const scene of scenes){
  await page.locator(`[data-reading="category"][data-value="${scene.category}"]`).click();
  assert.equal(await page.locator('[data-reading-question], [data-reading="start"]').count(),0,'directory cannot ask a question or start before a spread is chosen');
  await page.locator(`[data-reading="guide"][data-scenario="${scene.id}"]`).click();
  assert.equal(await page.locator('.compact-spread-guide .reading-question-setup [data-reading-question]').count(),1,'question stays inside the selected spread detail');
  assert.equal(await page.locator('.reading-question-setup [data-reading="start"]').count(),1);
  assert.equal(await page.locator('[data-reading-question]').getAttribute('required'),null,'question remains optional');
  const state=await h.state(page);assert.equal(state.ui.guideId,scene.spreadId);assert.equal(state.ui.scenarioId,scene.id);
  await h.click(page,'guide-back');await page.locator('.reading-directory').waitFor();
 }
 await page.locator('[data-reading="category"][data-value="all"]').click();await h.intro(page,'one');
 await page.locator('[data-reading-question]').fill('这周怎样安排练习？');await h.click(page,'guide-back');await h.intro(page,'one');assert.equal(await page.locator('[data-reading-question]').inputValue(),'这周怎样安排练习？','returning preserves this spread question');
 await page.locator('[data-reading-question]').fill('');await h.click(page,'start');assert.equal((await h.state(page)).draft.userQuestion,'','empty question starts the selected spread');assert.equal((await h.state(page)).draft.spreadId,'one');
 await context.close();console.log(`PASS ${type.name()} ${width}px: ${scenes.length} scenes, spread → optional question, back/restore and empty start (${process.env.WEB_URL?'public':'local'})`);
 }}finally{await browser.close()}}
}finally{await server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
