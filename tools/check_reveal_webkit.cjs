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
  for(const width of [390,320])for(const reducedMotion of ['no-preference','reduce']){
   const ctx=await browser.newContext({viewport:{width,height:844},hasTouch:true,reducedMotion});
   await ctx.addInitScript(()=>sessionStorage.setItem('tarot-pocket-session-v1',JSON.stringify({token:'tp1.'+'w'.repeat(80),expiresAt:Date.now()+3600000})));
   const page=await ctx.newPage(),errors=[],external=[];
   page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',route=>{if(!route.request().url().startsWith(origin+'/')){external.push(route.request().url());return route.abort();}return route.continue();});
   const tap=selector=>page.locator(selector).first().tap();
   const state=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
   const fit=async()=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal page overflow');
   const screenshot=async label=>{const file=path.join(os.tmpdir(),`tarot-v13-webkit-${width}-${label}.png`);await page.screenshot({path:file,fullPage:false});return file;};
   await page.goto(origin);await tap('.bottomnav [data-page=reading]');await tap('[data-reading=guide][data-value=three]');await tap('[data-reading=use-spread]');await tap('[data-reading=start]');
   assert.equal((await state()).draft.phase,'shuffling');assert.equal(await page.locator('[data-reading=motion-continue]').isDisabled(),reducedMotion==='no-preference');
   await page.waitForFunction(()=>document.querySelector('[data-reading=motion-continue]')?.disabled===false);
   assert.equal((await state()).draft.phase,'shuffling','motion completion must wait for user');await tap('[data-reading=motion-continue]');
   const pool=(await state()).draft.pool;await tap('[data-reading=cut][data-index="26"]');assert.deepEqual((await state()).draft.pool,[...pool.slice(26),...pool.slice(0,26)]);
   await page.waitForFunction(()=>document.querySelector('[data-reading=motion-continue]')?.disabled===false);
   assert.equal((await state()).draft.phase,'cutting','cut completion must wait for user');await tap('[data-reading=motion-continue]');
   assert.equal(await page.locator('[data-reading=pick]').count(),78);assert.equal(await page.locator('.ritual-selection img').count(),0,'hidden selection has no face images');
   for(const index of [0,39,77]){await tap(`[data-reading=pick][data-index="${index}"]`);assert.equal((await state()).draft.pendingPick,null);}
   assert.deepEqual((await state()).draft.picked,[0,39,77]);
   const shots=[];await tap('[data-reading=reveal-all]');
   assert.deepEqual((await state()).draft.revealed,[0,1,2]);
   if(reducedMotion==='reduce'){
    assert.equal((await state()).draft.phase,'read','reduced motion exposes whole result immediately');
    assert.equal(await page.locator('.group-flip-back').count(),0);
   }else{
    assert.equal((await state()).draft.phase,'reveal');assert(await page.locator('[data-reading=reveal-all]').isDisabled());assert.equal(await page.locator('.group-flip-back').count(),3);
    assert.equal(await page.locator('.reveal-group img').count(),3,'all faces mount together');
    await page.waitForTimeout(160);shots.push(await screenshot('group-flip-in-motion'));
    await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).draft.phase==='read',KEY);
   }
   assert.equal(await page.locator('.group-flip-back,.is-revealing-group').count(),0,'settled group leaves no opaque back or animated layer');
   for(let index=0;index<3;index++){
    const image=page.locator('.reading-slot img').nth(index);await image.scrollIntoViewIfNeeded();await image.evaluate(image=>image.decode());
    const visibility=await image.evaluate(image=>{const r=image.getBoundingClientRect(),style=getComputedStyle(image);return {width:r.width,height:r.height,naturalWidth:image.naturalWidth,opacity:Number(style.opacity),visibility:style.visibility,
     hit:[[.5,.5],[.25,.35],[.75,.65]].every(([x,y])=>{const e=document.elementFromPoint(r.x+r.width*x,r.y+r.height*y);return e===image||e?.contains(image)||image.contains(e);})};});
    assert(visibility.width>40&&visibility.height>65,'whole-spread faces remain visible');assert(visibility.naturalWidth>100,'actual artwork decoded');assert.equal(visibility.opacity,1);assert.equal(visibility.visibility,'visible');assert(visibility.hit,'no layer obscures the settled face');
   }
   assert.equal(await page.locator('.reading-interpretation').count(),0,'whole result is primary, no forced single-card lesson');await fit();
   shots.push(await screenshot('whole-result'));await page.waitForTimeout(1200);assert.equal((await state()).draft.phase,'read');
   // Detailed inspection remains available after the group result, at usable size.
   await tap('[data-reading=card][data-index="0"]');await tap('[data-action=zoom]');
   const zoom=page.locator('.zoom-backdrop img');await zoom.waitFor();await zoom.evaluate(image=>image.decode());
   const zoomBox=await zoom.boundingBox();assert(zoomBox.width>=140&&zoomBox.height>=220,'optional zoom retains inspectable large face');await page.locator('.zoom-backdrop [data-action=close]').click();
   await tap('[data-reading=card][data-index="0"]');
   const result=(await state()).draft;assert.equal(result.phase,'read');assert.deepEqual(result.revealed,[0,1,2]);assert.equal(await page.locator('.reading-slot img').count(),3);assert.equal(await page.locator('.reading-slot.active').count(),0);await fit();
   await page.reload();await tap('.bottomnav [data-page=reading]');const restored=(await state()).draft;assert.deepEqual(restored.pool,result.pool);assert.deepEqual(restored.picked,result.picked);assert.deepEqual(restored.revealed,result.revealed);assert.equal(restored.phase,'read');
   assert.deepEqual(errors,[]);assert.deepEqual(external,[],'no AI or external asset request');reports.push({width,reducedMotion,status:'PASS',screenshots:shots});await ctx.close();
  }
  console.log(JSON.stringify({status:'PASS',engine:'desktop WebKit',physicalIPhone:false,serverRoot:'dist only',AIRequested:false,checks:['shuffle/cut wait for explicit continuation','78 cards and immediate taps','one group flip and temporary backs removed','decoded faces with three-point occlusion guard and large optional zoom','normal and reduced motion','whole result retained after reload','390px and 320px touch layouts'],reports},null,2));
 }finally{await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
