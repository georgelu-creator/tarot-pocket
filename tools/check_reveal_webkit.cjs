/* Real WebKit composition and user-controlled reveal timing. Static server serves dist only. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os');
const {webkit}=require('playwright');
const dist=fs.realpathSync(path.join(__dirname,'../dist')),KEY='tarot-reading-v3';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
(async()=>{
 const server=http.createServer((req,res)=>{
  let relative;try{relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
  if(relative.split('/').some(part=>part.startsWith('.'))){res.writeHead(404).end();return;}
  try{
   const file=fs.realpathSync(path.resolve(dist,'.'+(relative==='/'?'/index.html':relative)));
   if(!file.startsWith(dist+path.sep)||!fs.statSync(file).isFile())throw Error('outside dist');
   res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
  }catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin=`http://127.0.0.1:${server.address().port}`,browser=await webkit.launch({headless:true}),reports=[];
 try{
  for(const width of [390,320]){
   const ctx=await browser.newContext({viewport:{width,height:844},hasTouch:true,reducedMotion:'no-preference'}),page=await ctx.newPage(),errors=[],external=[];
   page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',route=>{if(!route.request().url().startsWith(origin+'/')){external.push(route.request().url());return route.abort();}return route.continue();});
   const tap=selector=>page.locator(selector).first().tap();
   const state=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
   const fit=async()=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal page overflow');
   const screenshot=async label=>{const file=path.join(os.tmpdir(),`tarot-v13-webkit-${width}-${label}.png`);await page.screenshot({path:file,fullPage:false});return file;};
   await page.goto(origin);await tap('.bottomnav [data-page=reading]');await tap('[data-reading=guide][data-value=three]');await tap('[data-reading=use-spread]');await tap('[data-reading=start]');
   assert.equal((await state()).draft.phase,'shuffling');assert(await page.locator('[data-reading=motion-continue]').isDisabled());
   await page.waitForFunction(()=>document.querySelector('[data-reading=motion-continue]')?.disabled===false);
   assert.equal((await state()).draft.phase,'shuffling','motion completion must wait for user');await tap('[data-reading=motion-continue]');
   const pool=(await state()).draft.pool;await tap('[data-reading=cut][data-index="26"]');assert.deepEqual((await state()).draft.pool,[...pool.slice(26),...pool.slice(0,26)]);
   await page.waitForFunction(()=>document.querySelector('[data-reading=motion-continue]')?.disabled===false);
   assert.equal((await state()).draft.phase,'cutting','cut completion must wait for user');await tap('[data-reading=motion-continue]');
   assert.equal(await page.locator('[data-reading=pick]').count(),6);assert.equal(await page.locator('.ritual-selection img').count(),0,'hidden selection has no face images');
   for(const index of [0,2,5]){await tap(`[data-reading=pick][data-index="${index}"]`);assert.equal((await state()).draft.pendingPick,index);await tap(`[data-reading=pick-confirm][data-index="${index}"]`);}
   assert.deepEqual((await state()).draft.picked,[0,2,5]);
   const shots=[];
   for(let index=0;index<3;index++){
    const reduced=width===320&&index===1;
    await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});
    await tap(`[data-reading=reveal-next][data-index="${index}"]`);
    assert.equal((await state()).draft.phase,'reveal');assert.equal((await state()).draft.revealPending,index);
    if(reduced){
     assert(await page.locator('[data-reading=reveal-place]').isEnabled(),'reduced motion shows the face without a forced animation wait');
     assert.equal(await page.locator('.ritual-reveal-back').count(),0,'reduced motion never inserts an obsolete opaque back');
    }else{
     assert(await page.locator('[data-reading=reveal-place]').isDisabled(),'normal flip starts with observation action locked');
     assert.equal(await page.locator('.ritual-reveal-back').count(),1,'temporary back exists while turning');
    }
    if(index===0){await page.waitForTimeout(160);shots.push(await screenshot('flip-in-motion'));}
    await page.waitForFunction(()=>document.querySelector('[data-reading=reveal-place]')?.disabled===false);
    assert.equal(await page.locator('.ritual-reveal-back').count(),0,'settled reveal removes the opaque back, including in WebKit');
    assert.equal(await page.locator('.ritual-spotlight.is-revealing').count(),0,'settled view leaves the 3D animation');
    const image=page.locator('.ritual-reveal-card img');await image.evaluate(image=>image.decode());
    const visibility=await image.evaluate(image=>{
     const r=image.getBoundingClientRect(),style=getComputedStyle(image);
     const points=[[.5,.5],[.25,.35],[.75,.65]];
     return {width:r.width,height:r.height,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,opacity:Number(style.opacity),visibility:style.visibility,
      hit:points.every(([x,y])=>document.elementFromPoint(r.x+r.width*x,r.y+r.height*y)===image)};
    });
    assert(visibility.width>=140&&visibility.height>=220,'settled face is large enough to inspect');
    assert(visibility.naturalWidth>100&&visibility.naturalHeight>100,'real card image decoded');
    assert.equal(visibility.opacity,1);assert.equal(visibility.visibility,'visible');assert(visibility.hit,'face is the top painted hit target at three interior points');
    assert.equal(await page.locator('.reading-interpretation').count(),0,'observation is separate from single-card explanation');await fit();
    if(index===0){
     shots.push(await screenshot('face-settled'));await page.waitForTimeout(1200);assert.equal((await state()).draft.phase,'reveal','time alone does not place the card');assert.equal(await page.locator('.ritual-reveal-back').count(),0);shots.push(await screenshot('face-still-visible'));
     const pending=(await state()).draft,source=await image.getAttribute('src');
     await page.reload();await tap('.bottomnav [data-page=reading]');
     assert.equal((await state()).draft.phase,'reveal');assert.equal((await state()).draft.revealPending,0);assert.deepEqual((await state()).draft.pool,pending.pool);assert.deepEqual((await state()).draft.picked,pending.picked);
     assert.equal(await page.locator('.ritual-reveal-back').count(),0,'restored pending reveal retains its visible face');
     assert.equal(await page.locator('.ritual-spotlight.is-revealing').count(),0,'restored pending reveal does not replay its flip');
     assert(await page.locator('[data-reading=reveal-place]').isEnabled(),'restored pending reveal can be placed immediately');
     assert.equal(await page.locator('.ritual-reveal-card img').getAttribute('src'),source);
     await page.locator('.ritual-reveal-card img').evaluate(image=>image.decode());
    }
    await tap(`[data-reading=reveal-place][data-index="${index}"]`);
   }
   const result=(await state()).draft;assert.equal(result.phase,'read');assert.deepEqual(result.revealed,[0,1,2]);assert.equal(await page.locator('.reading-slot img').count(),3);assert.equal(await page.locator('.reading-slot.active').count(),0);await fit();
   await page.reload();await tap('.bottomnav [data-page=reading]');const restored=(await state()).draft;assert.deepEqual(restored.pool,result.pool);assert.deepEqual(restored.picked,result.picked);assert.deepEqual(restored.revealed,result.revealed);assert.equal(restored.phase,'read');
   assert.deepEqual(errors,[]);assert.deepEqual(external,[],'no AI or external asset request');reports.push({width,status:'PASS',screenshots:shots});await ctx.close();
  }
  console.log(JSON.stringify({status:'PASS',engine:'desktop WebKit',physicalIPhone:false,serverRoot:'dist only',AIRequested:false,checks:['normal-motion observation waits','six candidates and confirmation','temporary flip back removed on settle','decoded large face with three-point occlusion guard','reduced motion and pending reveal recovery','whole result retained after reload','390px and 320px touch layouts'],reports},null,2));
 }finally{await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
