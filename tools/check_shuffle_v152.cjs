/* Verify the visible spread/mix/gather trajectory without changing the shuffled pool. */
'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium,webkit}=require('playwright');
const h=require('./reading_ui_harness.cjs');
const key='tarot-reading-v3';
(async()=>{
 const server=await h.server(),url=server.url;try{for(const engine of [chromium,webkit]){
 const browser=await engine.launch();
 try{for(const width of [320,390,1280]){
 const ctx=await h.context(browser,{viewport:{width,height:900},hasTouch:true}),p=await ctx.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));await p.goto(url);await p.locator('.bottomnav [data-page=reading]').click();await h.intro(p,'three');await p.locator('[data-reading=start]').click();await p.evaluate(()=>{const b=document.createElement('button');b.dataset.reading='motion-pause';document.body.append(b);b.click();b.remove();});
 const pool=await p.evaluate(key=>JSON.parse(localStorage.getItem(key)).draft.pool,key);
 const stage=p.locator('[data-motion-stage=shuffling]'),cards=p.locator('.ritual-pack>.reading-back');assert.equal(await cards.count(),18);
 const sample=async fraction=>{
 await cards.evaluateAll((els,f)=>els.forEach(el=>el.getAnimations().forEach(a=>{a.pause();a.currentTime=a.effect.getTiming().duration*f;})),fraction);
 await stage.locator('.shuffle-stage-label>span,.ritual-tip-sequence>span').evaluateAll((els,f)=>els.forEach(el=>el.getAnimations().forEach(a=>{a.pause();a.currentTime=a.effect.getTiming().duration*f;})),fraction);
 await p.evaluate(()=>new Promise(requestAnimationFrame));
 const rects=await cards.evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,cx:r.x+r.width/2,cy:r.y+r.height/2};}));
 const bounds={left:Math.min(...rects.map(r=>r.x)),right:Math.max(...rects.map(r=>r.x+r.w)),top:Math.min(...rects.map(r=>r.y)),bottom:Math.max(...rects.map(r=>r.y+r.h))};
 const pack=await p.locator('.ritual-pack').boundingBox(),table=await stage.boundingBox();
 assert(bounds.left>=table.x&&bounds.right<=table.x+table.width,'cards stay inside the table horizontally');
 assert(bounds.top>=pack.y-2&&bounds.bottom<=pack.y+pack.height+2,'cards never overlap guidance or heading');
 return {rects,width:bounds.right-bounds.left,height:bounds.bottom-bounds.top};
 };
 const fan=await sample(.23);assert(fan.width>180,'fan spreads visibly across the mobile table');
 const mix=await sample(.42);assert(mix.height>160&&mix.width>180,'mix spreads in two dimensions, not just two piles');
 if(width===390)await stage.screenshot({path:`/tmp/tarot-v152-${engine.name()}-shuffle-mix.png`});
 const crossed=await sample(.59);assert(mix.rects.filter((r,i)=>Math.hypot(r.cx-crossed.rects[i].cx,r.cy-crossed.rects[i].cy)>40).length>=12,'most cards visibly cross to new positions');
 const gathered=await sample(.97);assert(gathered.width<105&&gathered.height<mix.height*.86,'cards gather back into one compact deck');
 assert.deepEqual(await p.evaluate(key=>JSON.parse(localStorage.getItem(key)).draft.pool,key),pool,'animation never rerolls cards');
 await p.evaluate(()=>{const b=document.createElement('button');b.dataset.reading='skip-animation';document.body.append(b);b.click();b.remove();});await p.locator('[data-reading=cut][data-index="0"]').waitFor();assert.deepEqual(await p.evaluate(key=>JSON.parse(localStorage.getItem(key)).draft.pool,key),pool,'completing shuffle preserves the randomized pool');assert(await p.locator('[data-reading=cut][data-index="0"]').isVisible());assert.deepEqual(errors,[]);await ctx.close();
 }
 const ctx=await h.context(browser,{viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await ctx.newPage();await p.goto(url);await p.locator('.bottomnav [data-page=reading]').click();await h.intro(p,'three');await p.locator('[data-reading=start]').click();await p.locator('[data-reading=cut][data-index="0"]').waitFor();assert.equal(await p.locator('[data-reading=motion-continue]').count(),0);assert.equal((await h.state(p)).draft.phase,'cut','reduced motion naturally reaches the next interaction');await ctx.close();
 }finally{await browser.close();}
 }
 }finally{await server.close();}
 console.log('PASS: Chromium/WebKit shuffle spreads, scatters, crosses and gathers at 320/390/1280px; table bounds, unchanged pool, skip and reduced motion.');
})().catch(e=>{console.error(e);process.exitCode=1;});
