/* Full-deck touch overview: native scrolling, immediate picks and durable state. */
'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium,webkit}=require('playwright');
const url=process.env.DEMO_URL||pathToFileURL(path.resolve(__dirname,'../demo/tarot-demo.html')).href;
const KEY='tarot-reading-v3',draft=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)).draft,KEY);
async function touchScroll(p,context){
 const card=p.locator('[data-reading=pick][data-index="30"]');await card.scrollIntoViewIfNeeded();const b=await card.boundingBox();
 const x=b.x+b.width/2,y=b.y+b.height/2,cdp=await context.newCDPSession(p);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
 for(let i=1;i<=9;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-i*15}]});await p.waitForTimeout(25);}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(300);
 assert.deepEqual((await draft(p)).picked,[],'real finger scrolling never picks a card');await cdp.detach();
}
(async()=>{
 for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await engine.launch(name==='chromium'?require('./browser_options.cjs'):{headless:true});
  try{for(const width of [320,390])for(const reducedMotion of ['no-preference','reduce']){
   const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,reducedMotion});
   const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(15000);
   console.log(`Checking ${name} ${width} ${reducedMotion}`);
   await p.goto(url,{timeout:120000});await p.locator('.bottomnav [data-page=reading]').click();
   await p.locator('[data-reading=guide][data-value=three]').click();await p.locator('[data-reading=use-spread]').click();
   await p.locator('[data-reading=start]').click();await p.locator('[data-reading=skip-animation]').click();
   await p.locator('[data-reading=cut-default]').click();await p.locator('[data-reading=skip-animation]').click();
   await p.locator('.whole-deck-grid').waitFor();const pool=(await draft(p)).pool;
   assert.equal(await p.locator('[data-deck-card]').count(),78);assert.equal(await p.locator('[data-reading=pick]:enabled').count(),78);
   assert.equal(await p.locator('[data-reading=pick-page], [data-reading=pick-confirm], .ritual-swipe-page').count(),0,'no pages or second confirmation');
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const boxes=await p.locator('[data-deck-card]').evaluateAll(es=>es.map(e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height};}));
   assert(boxes.every(b=>b.w>=44&&b.h>=44),'compact overview retains reachable touch rectangles');
   for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];assert(a.x+a.w<=b.x+.5||b.x+b.w<=a.x+.5||a.y+a.h<=b.y+.5||b.y+b.h<=a.y+.5,'all 78 target rectangles do not overlap');}
   if(name==='chromium'&&width===390&&reducedMotion==='no-preference')await touchScroll(p,context);
   // A moved/cancelled pointer cannot be interpreted as a click, even if a browser dispatches one.
   await p.locator('[data-reading=pick][data-index="20"]').evaluate(el=>{el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:10,clientY:10}));el.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,clientX:10,clientY:50}));el.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true}));el.click();});
   assert.deepEqual((await draft(p)).picked,[]);await p.waitForTimeout(300);
   await p.locator('[data-reading=pick][data-index="77"]').scrollIntoViewIfNeeded();
   await p.locator('.whole-deck-grid').evaluate(el=>{window.__grid=el;window.__y=scrollY;window.__cards=[...el.children];});
   await p.locator('[data-reading=pick][data-index="77"]').tap();
   assert.deepEqual((await draft(p)).picked,[77],'last card commits in one tap');assert.equal((await draft(p)).pendingPick,null);
   assert(await p.locator('.whole-deck-grid').evaluate(el=>el===window.__grid&&[...el.children].every((c,i)=>c===window.__cards[i])),'selection preserves all card nodes');
   assert(await p.evaluate(()=>Math.abs(scrollY-window.__y)<2),'selection preserves scroll position');
   assert(await p.locator('[data-reading=pick][data-index="77"]').isDisabled());
   await p.locator('[data-reading=pick][data-index="77"]').evaluate(el=>{el.click();el.click();});assert.deepEqual((await draft(p)).picked,[77],'repeated taps cannot select the same card twice');
   await p.locator('.ritual-selection-tray .filled .reading-back').evaluate(el=>window.__placed=el);
   await p.locator('[data-reading=pick][data-index="0"]').focus();await p.keyboard.press('Enter');
   assert.deepEqual((await draft(p)).picked,[77,0],'first card remains reachable with keyboard');
   assert(await p.locator('.ritual-selection-tray .filled .reading-back').first().evaluate(el=>el===window.__placed),'another pick does not replay earlier placed animation');
   await p.locator('[data-reading=pause]').click();await p.locator('[data-reading=resume]').first().click();assert.deepEqual((await draft(p)).picked,[77,0]);
   await p.reload();await p.locator('.bottomnav [data-page=reading]').click();assert.deepEqual((await draft(p)).picked,[77,0]);assert.deepEqual((await draft(p)).pool,pool);
   assert.equal(await p.locator('[data-reading=pick]:disabled').count(),2,'restored choices stay visibly marked');
   await p.locator('[data-reading=pick][data-index="39"]').tap();assert.equal((await draft(p)).phase,'reveal');assert.deepEqual((await draft(p)).picked,[77,0,39]);
   assert.deepEqual(errors,[]);await context.close();
  }}finally{await browser.close();}
 }
 console.log('PASS: Chromium/WebKit 320/390 full 78-card overview, real touch scroll and gesture suppression, one-tap choice, node/scroll stability, keyboard, pause/reload and normal/reduced motion.');
})().catch(error=>{console.error(error);process.exitCode=1;});
