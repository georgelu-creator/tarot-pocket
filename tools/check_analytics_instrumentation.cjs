'use strict';
const assert=require('node:assert/strict'),{chromium,webkit}=require('playwright'),h=require('./reading_ui_harness.cjs');
(async()=>{const server=await h.server();try{for(const engine of [chromium,webkit]){const browser=await engine.launch(require('./browser_options.cjs'));try{
 const context=await h.context(browser,{reducedMotion:'reduce',serviceWorkers:'block'}),p=await context.newPage(),events=[],errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/ai-config.js*',r=>r.fulfill({contentType:'text/javascript',body:'window.TAROT_AI_CONFIG={endpoint:location.origin+"/api/reading",sessionEndpoint:location.origin+"/api/session",analyticsEndpoint:location.origin+"/api/events"}'}));
 await p.route('**/api/events',async r=>{events.push(...r.request().postDataJSON().events);await r.fulfill({status:204});});
 await p.route('**/api/reading',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({text:'隔离测试的解释，仅用于确认统计状态。',provider:'deepseek',model:'synthetic-test'})}));
 const flush=async()=>{await p.evaluate(()=>TarotAnalytics.flush());};const count=name=>events.filter(e=>e.name===name).length;
 await h.enter(p,server.url);await h.intro(p,'one');await p.locator('[data-reading-question]').fill('SYNTHETIC_PRIVATE_QUESTION_MUST_NOT_LEAVE');await h.click(p,'start');await h.toPick(p);await flush();
 assert.equal(count('reading_start'),1);assert.equal(count('reading_cut'),1);
 const c=await h.center(p,0);await c.click();await flush();assert.equal(count('reading_pick'),0,'preview is not a committed pick');
 await h.click(p,'pick-change');await h.pick(p,1);await flush();assert.equal(count('reading_pick'),1,'confirmation records one pick');
 await h.reveal(p);await flush();assert.equal(count('reading_reveal'),1);assert.equal(count('offline_reading_view'),1);assert.equal(count('ai_confirm'),0);
 for(const e of events.filter(e=>['reading_start','reading_cut','reading_pick','reading_reveal','offline_reading_view'].includes(e.name)))assert.equal(e.props.spread,'one');
 await h.click(p,'ai-request');await p.locator('.ai-answer').waitFor();await flush();assert.equal(count('ai_confirm'),1);assert.equal(count('ai_result'),1);assert.equal(events.find(e=>e.name==='ai_result').props.status,'success');assert.equal(events.find(e=>e.name==='ai_result').props.spread,'one');
 assert(events.some(e=>e.name==='feature_click'&&e.props.feature==='ai:ai-request'));
 await h.click(p,'pause');await p.locator('.bottomnav [data-page=courses]').click();await p.locator('[data-academy=guided]').click();await flush();assert.equal(count('learning_start'),1,'actual course opens once');
 for(let i=0;i<8&&!await p.locator('[data-academy=answer]').count();i++)await p.locator('[data-academy=next]').click();
 await p.locator('[data-academy=answer]').first().click();await flush();assert.equal(count('learning_answer'),1);await p.evaluate(()=>document.querySelector('[data-academy=answer]')?.click());await flush();assert.equal(count('learning_answer'),1,'disabled repeat cannot generate outcome');
 assert(events.some(e=>e.name==='feature_click'&&e.props.feature==='learning:answer'));
 await p.goto(server.url);await flush();let beforeHome=events.length;
 await p.locator('[data-academy=guided]').click();await flush();
 let homeEvents=events.slice(beforeHome);assert(homeEvents.some(e=>e.name==='feature_click'&&e.props.feature==='learning:guided'));
 assert(homeEvents.findIndex(e=>e.name==='screen_view'&&e.page==='academy')<homeEvents.findIndex(e=>e.name==='learning_start'),'home course start follows entering the course');
 await p.goto(server.url);await flush();beforeHome=events.length;
 await p.locator('[data-academy=continue]').click();await flush();
 homeEvents=events.slice(beforeHome);assert(homeEvents.some(e=>e.name==='feature_click'&&e.props.feature==='learning:continue'));
 assert(homeEvents.findIndex(e=>e.name==='screen_view'&&e.page==='academy')<homeEvents.findIndex(e=>e.name==='learning_start'),'home resume also records an ordered course start');
 const serialized=JSON.stringify(events);assert(!serialized.includes('SYNTHETIC_PRIVATE'));for(const e of events){assert.deepEqual(Object.keys(e).sort(),['name','page','props','sessionId','visitorId']);assert(!Object.keys(e.props).some(k=>['question','cards','selected','unitId','answer','token'].includes(k)));}
 for(const preference of ['doNotTrack','globalPrivacyControl']){await p.evaluate(key=>Object.defineProperty(navigator,key,{get:()=>key==='doNotTrack'?'1':true,configurable:true}),preference);const before=events.length;await p.evaluate(()=>TarotAnalytics.track('feature_click',{feature:'reading:pick'}));await flush();assert.equal(events.length,before);await p.evaluate(key=>Object.defineProperty(navigator,key,{get:()=>undefined,configurable:true}),preference);}
 await p.evaluate(()=>window.TAROT_STANDALONE=true);const before=events.length;await p.evaluate(()=>TarotAnalytics.track('ai_result',{spread:'one',status:'success'}));await flush();assert.equal(events.length,before);assert.deepEqual(errors,[]);
 await context.close();console.log(`PASS ${engine.name()}: actual outcomes, exact spread, contextual features, no private payload, DNT/GPC and standalone opt-out`);
 }finally{await browser.close();}}}finally{await server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
