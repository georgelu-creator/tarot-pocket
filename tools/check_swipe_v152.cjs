/* Fresh contexts exercise native card-rail scrolling, persistence and touch selection. */
'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium,webkit}=require('playwright');
const url=process.env.DEMO_URL||pathToFileURL(path.resolve(__dirname,'../demo/tarot-demo.html')).href;
const KEY='tarot-reading-v3';
const draft=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)).draft,KEY);
async function atPage(p,index){
 await p.waitForFunction(({key,index})=>JSON.parse(localStorage.getItem(key)).draft.drawPage===index,{key:KEY,index});
 await p.waitForFunction(index=>{const rail=document.querySelector('.ritual-swipe-rail'),pages=[...rail.querySelectorAll('[data-draw-page]')],target=pages[index].offsetLeft-pages[0].offsetLeft;return Math.abs(rail.scrollLeft-target)<2;},index);
 await p.waitForFunction(()=>document.querySelector('.ritual-swipe-rail').dataset.scrollTarget===undefined);
 assert.equal(await p.locator('[data-reading=pick]').count(),6,'exactly the visible group is interactive');
 assert.equal(await p.locator('.ritual-swipe-page:not([inert])').count(),1,'offscreen pages are inert');
}
async function scrollToPage(p,index){
 await p.locator('.ritual-swipe-rail').evaluate((rail,index)=>{const pages=rail.querySelectorAll('[data-draw-page]');rail.scrollTo({left:pages[index].offsetLeft-pages[0].offsetLeft,behavior:'instant'});},index);
 await atPage(p,index);
}
async function markRail(p){await p.locator('.ritual-swipe-rail').evaluate(el=>{window.__swipeTestRail=el;window.__swipeTestLeft=el.scrollLeft;});}
async function stableRail(p){
 assert(await p.locator('.ritual-swipe-rail').evaluate(el=>el===window.__swipeTestRail),'selection preserves the actual scroll rail node');
 const position=await p.locator('.ritual-swipe-rail').evaluate(el=>({before:window.__swipeTestLeft,after:el.scrollLeft,width:el.clientWidth,page:JSON.parse(localStorage.getItem('tarot-reading-v3')).draft.drawPage}));
 assert(Math.abs(position.after-position.before)<2,'selection preserves horizontal position '+JSON.stringify(position));
}
async function touchSwipe(p,context){
 const rail=p.locator('.ritual-swipe-rail');await rail.scrollIntoViewIfNeeded();
 const box=await rail.boundingBox(),start={x:box.x+box.width*.82,y:Math.max(30,box.y+Math.min(75,box.height*.22))},end=box.x+box.width*.18;
 const cdp=await context.newCDPSession(p);
 const scrollEnded=rail.evaluate(el=>new Promise(resolve=>el.addEventListener('scrollend',resolve,{once:true}))); 
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});
 for(let i=1;i<=9;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end-start.x)*i/9,y:start.y}]});await p.waitForTimeout(30);}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await scrollEnded;
 await p.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).draft.drawPage>0,KEY);
 const state=await draft(p);assert.equal(state.pendingPick,null,'a genuine finger swipe does not pick a card');assert.deepEqual(state.picked,[],'a finger swipe never confirms a card');
 await cdp.detach();
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
   await p.locator('.ritual-swipe-rail').waitFor();await atPage(p,0);
   const pool=(await draft(p)).pool;
   assert.equal(await p.locator('.ritual-swipe-page').count(),13);assert.equal(await p.locator('[data-deck-card]').count(),78,'all 78 backs remain in the same native rail');
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'the rail scrolls internally without widening the page');
   assert(await p.locator('.ritual-swipe-rail').evaluate(el=>['auto','scroll'].includes(getComputedStyle(el).overflowX)),'horizontal scrolling belongs to the native rail');
   if(reducedMotion==='reduce')assert.equal(await p.locator('.ritual-swipe-rail').evaluate(el=>getComputedStyle(el).scrollBehavior),'auto','reduced motion disables smooth scrolling');
   if(name==='chromium'&&width===390&&reducedMotion==='no-preference')await touchSwipe(p,context);
   await scrollToPage(p,3);assert.deepEqual((await draft(p)).pool,pool,'browsing groups does not reshuffle');assert.equal((await draft(p)).pendingPick,null);
   await markRail(p);await p.locator('[data-reading=pick][data-index="19"]').tap();await stableRail(p);
   assert.equal((await draft(p)).pendingPick,19);assert.deepEqual((await draft(p)).picked,[],'a light tap only lifts a candidate');
   await scrollToPage(p,4);assert.equal((await draft(p)).pendingPick,null,'moving away clears the old candidate');assert.deepEqual((await draft(p)).picked,[],'native scrolling never confirms');
   // Previous and next buttons remain keyboard-operable alternatives.
   await p.locator('[data-reading=pick-page][data-index="3"]').focus();await p.keyboard.press('Enter');await atPage(p,3);
   await p.locator('[data-reading=pick-page][data-index="4"]').focus();await p.keyboard.press('Enter');await atPage(p,4);
   await scrollToPage(p,12);await markRail(p);await p.locator('[data-reading=pick][data-index="77"]').tap();await stableRail(p);
   assert.equal((await draft(p)).pendingPick,77,'the final card is reachable by scrolling');assert(await p.locator('[data-reading=pick-page][data-index="13"]').isDisabled());
   await p.locator('[data-reading=pause]').click();await p.locator('[data-reading=resume]').first().click();await atPage(p,12);
   assert.equal((await draft(p)).pendingPick,77,'pause and resume retain the candidate');assert.deepEqual((await draft(p)).pool,pool);
   await p.reload();await p.locator('.bottomnav [data-page=reading]').click();await atPage(p,12);
   assert.equal((await draft(p)).pendingPick,77,'a full reload restores the page and candidate');
   await markRail(p);await p.locator('[data-reading=pick-confirm][data-index="77"]').click();await stableRail(p);
   assert.deepEqual((await draft(p)).picked,[77]);assert.equal((await draft(p)).pendingPick,null);assert.deepEqual((await draft(p)).pool,pool);
   await p.locator('.ritual-selection-tray .filled .reading-back').evaluate(el=>window.__placedCard=el);
   await p.locator('[data-reading=pick][data-index="72"]').tap();
   assert(await p.locator('.ritual-selection-tray .filled .reading-back').evaluate(el=>el===window.__placedCard),'lifting another candidate does not replay the placed-card animation');
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'selection and restoration do not create horizontal page overflow');
   assert.deepEqual(errors,[],`${name} ${width} ${reducedMotion}: no runtime errors`);
   await context.close();
  }}finally{await browser.close();}
 }
 console.log('PASS: Chromium/WebKit 320/390 native swipe pages, real touch gesture, candidate and confirm node stability, all 78 choices, keyboard alternatives, pause/reload restoration and reduced motion.');
})().catch(error=>{console.error(error);process.exitCode=1;});
