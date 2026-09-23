/* Layout regressions use fresh browser storage and the self-contained demo. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium,webkit}=require('playwright');
const url=process.env.DEMO_URL||pathToFileURL(path.resolve(__dirname,'../demo/tarot-demo.html')).href;
const requestedUrl=requested=>{const target=new URL(url);target.searchParams.set('lang',requested);return target.href;};
const shots=process.env.HOME_SCREENSHOTS;
const near=(a,b,message)=>assert(Math.abs(a-b)<1.1,`${message}: ${a} / ${b}`);
(async()=>{
 if(shots)fs.mkdirSync(shots,{recursive:true});
 for(const [engine,type] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await type.launch(engine==='chromium'?require('./browser_options.cjs'):{headless:true});
  try{
   const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
   const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
   await p.goto(requestedUrl('zh'),{timeout:120000});await p.locator('.home-decisions').waitFor();
   for(const resumed of [false,true]){
    if(resumed){
     await p.locator('.bottomnav [data-page=courses]').click();
     await p.locator('.academy-card-library [data-action=nav][data-page=library]').click();
     await p.locator('.library-card[data-id=p12]').click();
     await p.locator('[data-academy=start][data-id=p12]').click();
     await p.locator('[data-academy=home]').first().click();await p.locator('.bottomnav [data-page=home]').click();
     assert(await p.locator('.continue-resume').isVisible(),'an unfinished lesson is reachable from home');
    }
    for(const requested of ['zh','en']){
     await p.goto(requestedUrl(requested),{timeout:120000});await p.locator('.home-decisions').waitFor();
     assert.equal(await p.locator('html').getAttribute('lang'),'zh-CN',requested+' query falls back to Chinese');
     assert.equal(await p.locator('[data-language-toggle]').count(),0,'public language toggle is hidden');
     // Stress the label with a real long Chinese card name; no user records are imported.
     await p.locator('.learn-choice small').evaluate(el=>{el.textContent='下一张还没学过 · 星币骑士';});
     for(const width of [320,390,768,1280]){
      await p.setViewportSize({width,height:844});
      await p.locator('.home-choice-art img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
      const bounds=await p.evaluate(()=>{
       const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
       return {overflow:document.documentElement.scrollWidth>innerWidth+1,learn:rect('.learn-choice'),draw:rect('.reading-choice'),support:rect('.home-learning-support'),learnArt:rect('.home-choice-art'),drawArt:rect('.home-spread-art'),learnTitle:rect('.learn-choice strong'),drawTitle:rect('.reading-choice strong'),learnArrow:rect('.learn-choice>.icon'),drawArrow:rect('.reading-choice>.icon')};
      });
      const label=`${engine} requested=${requested} ${width} resumed=${resumed}`;
      assert(!bounds.overflow,`${label}: no horizontal overflow`);
      assert(await p.locator('[data-action=choose-cards]').isVisible(),`${label}: self-selection remains available`);
      for(const selector of ['.learn-choice','.reading-choice','.home-learning-actions .secondary']){const b=await p.locator(selector).boundingBox();assert(b.width>=44&&b.height>=44,`${label}: usable touch target ${selector}`);}
      if(width>600){
       near(bounds.learn.y,bounds.draw.y,`${label}: main card tops`);near(bounds.learn.height,bounds.draw.height,`${label}: main card heights`);near(bounds.learnTitle.y,bounds.drawTitle.y,`${label}: title alignment`);near(bounds.learnArt.y,bounds.drawArt.y,`${label}: illustration alignment`);near(bounds.learnArt.height,bounds.drawArt.height,`${label}: illustration regions`);near(bounds.learnArrow.y,bounds.drawArrow.y,`${label}: arrow alignment`);assert(bounds.support.y>=bounds.learn.bottom,`${label}: auxiliary controls are outside both primary card heights`);
      }else{
       assert(bounds.support.y>=bounds.learn.bottom,`${label}: learning controls follow learning`);assert(bounds.draw.y>=bounds.support.bottom,`${label}: draw remains after learning controls`);assert(bounds.learn.height<380&&bounds.draw.height<380,`${label}: mobile cards remain compact`);assert(bounds.learnTitle.x>=bounds.learnArt.right-1,`${label}: image and copy do not overlap`);
      }
      if(shots&&resumed&&[390,1280].includes(width)){const stressText=await p.locator('.learn-choice small').innerText(),actualName=await p.locator('.home-choice-art img').first().getAttribute('alt');await p.locator('.learn-choice small').evaluate((el,text)=>{el.textContent=text;},'下一张还没学过 · '+actualName);await p.screenshot({path:path.join(shots,`home-${engine}-${requested}-${width}.png`),fullPage:true});await p.locator('.learn-choice small').evaluate((el,text)=>{el.textContent=text;},stressText);}
     }
    }
   }
   await p.locator('.reading-choice').click();assert(await p.locator('[data-reading=guide]').count()>0,'draw entry still opens the spread gallery');
   assert.deepEqual(errors,[],`${engine}: no runtime errors`);await context.close();
  }finally{await browser.close();}
 }
 console.log(JSON.stringify({status:'PASS',checks:['Chromium and WebKit','320/390/768/1280px','Chinese public UI for zh/en query values','no visible language toggle','long Chinese card label','unfinished lesson and separate library entry retained','equal desktop main cards, artwork, titles and arrows','mobile ordering and no overflow','draw navigation']}));
})().catch(error=>{console.error(error);process.exitCode=1;});
