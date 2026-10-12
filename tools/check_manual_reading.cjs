'use strict';
const assert=require('node:assert/strict'),{chromium,webkit}=require('playwright'),h=require('./reading_ui_harness.cjs');
const options=require('./browser_options.cjs');
const click=(p,a)=>p.locator(`[data-manual="${a}"]`).click();
async function choose(p,i,id){await p.locator(`[data-manual="pick"][data-index="${i}"]`).click();await p.locator(`[data-manual="choose"][data-id="${id}"]`).click();}
async function manual(p,spread){await h.click(p,'manual');await p.locator('[data-manual-spread]').selectOption(spread);}
(async()=>{const server=await h.server();try{for(const engine of [chromium,webkit]){
 const browser=await engine.launch(options);try{for(const width of [320,390,1280]){
  const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce',serviceWorkers:'block',extraHTTPHeaders:{DNT:'1'}}),p=await context.newPage();
  const errors=[];p.on('pageerror',e=>errors.push(e.message));let apiRequests=0;
  await p.route('**/api/**',r=>{apiRequests++;return r.abort()});
  await h.enter(p,server.url);assert.equal(await p.locator('[data-reading="manual"]').count(),1,'one secondary entry');
  await h.intro(p,'one');await p.locator('[data-reading-question]').fill('SYNTHETIC_PREVIOUS_QUESTION');await h.click(p,'start');await h.toPick(p);await h.pick(p,2);await h.reveal(p);await h.click(p,'pause');
  const signature=s=>({id:s.id,pool:s.pool,picked:s.picked,phase:s.phase,question:s.questionText});
  const original=signature((await h.state(p)).draft);
  await manual(p,'open-three');assert.equal(await p.locator('[data-manual="submit"]').isDisabled(),true);
  await p.locator('[data-manual="pick"][data-index="0"]').click();
  assert.equal(await p.locator('[data-manual="choose"]').count(),78);
  await p.locator('[data-manual-search]').fill('金币八');assert.equal(await p.locator('[data-manual="choose"]').count(),1);
  await p.locator('[data-manual="choose"][data-id="p08"]').click();
  await choose(p,1,'m00');await p.locator('[data-manual="pick"][data-index="2"]').click();
  assert.equal(await p.locator('[data-manual="choose"][data-id="p08"]').isDisabled(),true,'no duplicate card');
  await p.keyboard.press('Escape');assert.equal(await p.locator('.manual-picker').evaluate(d=>d.open),false);
  await choose(p,2,'c02');await p.locator('[data-manual="orientation"][data-index="1"]').click();
  await p.locator('[data-manual-question]').fill('怎样安排本周的绘画练习？');
  await h.fit(p);await p.reload();await p.locator('.bottomnav [data-page=reading]').click();await p.locator('.manual-reading').waitFor();
  assert.equal(await p.locator('[data-manual-question]').inputValue(),'怎样安排本周的绘画练习？');
  assert.deepEqual(signature((await h.state(p)).draft),original,'pending input must preserve prior game');
  assert.deepEqual((await h.state(p)).ui.manual.cards,[{id:'p08',reversed:false},{id:'m00',reversed:true},{id:'c02',reversed:false}]);
  await click(p,'back');await manual(p,'open-three');
  // A failed write cannot commit a new current game or discard the entered cards.
  await p.evaluate(()=>{window.manualRealSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='tarot-reading-v3')throw Error('synthetic quota');return window.manualRealSet.call(this,k,v)}});
  await click(p,'submit');await p.locator('.manual-reading').waitFor();assert.deepEqual(signature((await h.state(p)).draft),original);
  await p.evaluate(()=>{Storage.prototype.setItem=window.manualRealSet});await click(p,'submit');
  await p.locator('.reading-offline').waitFor();let state=await h.state(p);
  assert.equal(state.draft.source,'manual');assert.equal(state.draft.phase,'read');assert.equal(state.ui.manual,undefined);assert.deepEqual(state.ui.inputs,{});assert.equal(JSON.stringify(state).includes('SYNTHETIC_PREVIOUS_QUESTION'),false,'new manual game must not archive old question');
  assert.deepEqual(state.draft.picked.map(i=>state.draft.pool[i]),[{id:'p08',reversed:false},{id:'m00',reversed:true},{id:'c02',reversed:false}]);
  assert.equal(state.draft.pool.length,78);assert.equal(new Set(state.draft.pool.map(c=>c.id)).size,78);
  assert.equal(await p.locator('.offline-position').count(),3);assert.equal(await p.locator('[data-reading="cut"], [data-reading="reveal"]').count(),0);
  assert.deepEqual(state.history,[]);assert.deepEqual(state.practice,[]);assert.equal(apiRequests,0,'local interpretation must not send cards or questions');
  await p.locator('.reading-result-card[data-index="1"]').click();await h.click(p,'full-reference');
  await p.locator('[data-knowledge-section="examples"]').waitFor({state:'attached'});
  assert.equal(await p.locator('[data-reference-body]').getAttribute('data-reference-face'),'reversed');
  await p.locator('[data-action="close"]').first().click();await h.fit(p);
  await p.reload();await p.locator('.bottomnav [data-page=reading]').click();await p.locator('.reading-offline').waitFor();assert.equal((await h.state(p)).draft.source,'manual');
  await h.click(p,'manual-edit');await choose(p,1,'m01');await click(p,'submit');assert.equal((await h.state(p)).draft.pool[1].id,'m01');
  // Existing AI transport receives the exact entered cards and orientation, only on request.
  if(await p.evaluate(()=>!!window.TAROT_STANDALONE)){assert.equal(await p.locator('[data-reading=ai-request]').count(),0,'offline file must not offer network AI');}
  else {
  await p.evaluate(()=>{window.TarotAccess={ensureSession:async()=> 'synthetic-local-test',readingEndpoint:()=>location.origin+'/api/reading'};TarotReadingAI.refresh(JSON.parse(localStorage.getItem('tarot-reading-v3')).draft)});
  let request;
  await p.unroute('**/api/**');await p.route('**/api/reading',async r=>{request=r.request().postDataJSON();await r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({text:'这是一段隔离测试回答，用于核对录入牌和原有解读链路。',provider:'deepseek',model:'synthetic-test'})})});
  await h.click(p,'ai-request');await p.locator('.ai-answer').waitFor();
  assert.deepEqual(request.cards,[{id:'p08',reversed:false},{id:'m01',reversed:false},{id:'c02',reversed:false}]);assert.equal(request.spreadId,'open-three');
  }
  await h.click(p,'manual-edit');await p.locator('[data-manual="orientation"][data-index="0"]').click();await click(p,'submit');assert.equal((await h.state(p)).draft.ai,undefined,'editing cannot reuse an old AI answer');
  await h.click(p,'pause');await h.click(p,'daily');await h.toPick(p);await h.pick(p,0);await h.reveal(p);await h.click(p,'finish');
  const daily=(await h.state(p)).daily;
  await manual(p,'one');await choose(p,0,'m19');await click(p,'submit');assert.deepEqual((await h.state(p)).daily,daily,'manual game cannot replace daily');
  await h.click(p,'pause');await manual(p,'open-five');await h.fit(p);
  const spreadIds=await p.locator('[data-manual-spread] option').evaluateAll(es=>es.map(e=>e.value));
  assert.equal(spreadIds.includes('daily'),false);
  for(const id of spreadIds){await p.locator('[data-manual-spread]').selectOption(id);const count=await p.evaluate(id=>TAROT_SPREAD_CONTENT.spreads.find(s=>s.id===id).positions.length,id);assert.equal(await p.locator('.manual-slot').count(),count);await h.fit(p);}
  assert.deepEqual(errors,[]);
  if(width===390&&!process.env.DEMO_URL){await p.locator('[data-manual-spread]').selectOption('open-three');await choose(p,0,'m19');await p.screenshot({path:`/tmp/tarot-manual-${engine.name()}.png`,fullPage:true});}
  await context.close();console.log(`PASS ${engine.name()} ${width}px: manual input, ${spreadIds.length} spreads, duplicate/reverse, saved draft, transactional failure, local/explicit AI, reference, edit and daily isolation`);
 }}finally{await browser.close()}
}}finally{await server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
