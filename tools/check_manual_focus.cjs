/* A queued focus restoration must not steal a learner's newer text-field focus. */
'use strict';
const assert=require('node:assert/strict'),{chromium,webkit}=require('playwright'),h=require('./reading_ui_harness.cjs');
(async()=>{const server=await h.server();try{for(const engine of [chromium,webkit]){
 const browser=await engine.launch(require('./browser_options.cjs'));try{const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',serviceWorkers:'block',extraHTTPHeaders:{DNT:'1'}}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await h.enter(p,server.url);await h.click(p,'manual');await p.locator('[data-manual-spread]').selectOption('one');
 await p.evaluate(()=>{window.__manualFocusFrames=[];const raf=requestAnimationFrame;window.requestAnimationFrame=function(callback){if(String(callback).includes('.focus(')&&String(callback).includes('preventScroll')){window.__manualFocusFrames.push(callback);return -1;}return raf.call(window,callback);};});
 async function keepNewFocus(action){
  await p.locator('[data-manual-question]').focus();
  const frames=await p.evaluate(()=>{const callbacks=window.__manualFocusFrames.splice(0);callbacks.forEach(fn=>fn(performance.now()));return callbacks.length;});assert(frames>0,action+' has a queued real UI focus restoration');
  assert(await p.locator('[data-manual-question]').evaluate(el=>document.activeElement===el),action+' must preserve a newer user focus in the question field');
 }
 await p.locator('[data-manual="pick"]').click();await p.locator('[data-manual="choose"][data-id="p08"]').click();await keepNewFocus('choosing a card');
 await p.keyboard.insertText('隔离测试：本周如何练习？');assert.equal(await p.locator('[data-manual-question]').inputValue(),'隔离测试：本周如何练习？');assert.equal((await h.state(p)).ui.manual.question,'隔离测试：本周如何练习？');
 await p.locator('[data-manual="orientation"]').click();await keepNewFocus('changing orientation');await p.keyboard.insertText('每天十分钟。');
 const question=await p.locator('[data-manual-question]').inputValue();assert(question.includes('每天十分钟。'));assert.equal((await h.state(p)).ui.manual.question,question,'input after orientation is saved immediately');
 await p.reload();await p.locator('.bottomnav [data-page="reading"]').click();assert.equal(await p.locator('[data-manual-question]').inputValue(),question,'newly typed input survives refresh');assert.deepEqual(errors,[]);await ctx.close();
 console.log(`PASS ${engine.name()}: queued card/orientation focus cannot steal newer input; typing and refresh retain the question`);
 }finally{await browser.close();}
}}finally{await server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
