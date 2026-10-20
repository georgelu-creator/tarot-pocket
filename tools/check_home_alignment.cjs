const courseUI=require('./course_ui_helpers.cjs');
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
     await courseUI.open(p,'p12');
     await p.locator('[data-academy=home]').first().click();await p.locator('.bottomnav [data-page=home]').click();
     assert(await p.locator('.continue-resume').isVisible(),'an unfinished lesson is reachable from home');
    }
    for(const requested of ['zh','en']){
     await p.goto(requestedUrl(requested),{timeout:120000});await p.locator('.home-decisions').waitFor();
     assert.equal(await p.locator('html').getAttribute('lang'),'zh-CN',requested+' query falls back to Chinese');
     assert.equal(await p.locator('[data-language-toggle]').count(),0,'public language toggle is hidden');
     assert.equal(await p.title(),'秘境梦屿','web uses the miniapp product name');assert.match(await p.locator('.brand').innerText(),/秘境梦屿/);
     assert.deepEqual(await p.locator('.home-decisions').evaluate(el=>[el.firstElementChild.matches('[data-reading="daily"]'),el.children[1].matches('.reading-choice'),el.children[2].matches('.home-learning-choice')]),[true,true,true],'source and keyboard order are daily, draw, learn');
     // Stress the label with a real long Chinese card name; no user records are imported.
     await p.locator('.learn-choice small').evaluate(el=>{el.textContent='下一张还没学过 · 星币骑士';});
     for(const width of [320,390,768,1280]){
      await p.setViewportSize({width,height:844});
      await p.locator('.home-choice-art img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
      const bounds=await p.evaluate(()=>{
       const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
       return {overflow:document.documentElement.scrollWidth>innerWidth+1,daily:rect('.home-decisions>.daily-tile'),learn:rect('.learn-choice'),draw:rect('.reading-choice'),support:rect('.home-learning-support'),learnArt:rect('.home-choice-art'),drawArt:rect('.home-spread-art'),learnTitle:rect('.learn-choice strong'),drawTitle:rect('.reading-choice strong'),learnArrow:rect('.learn-choice>.icon'),drawArrow:rect('.reading-choice>.icon')};
      });
      const label=`${engine} requested=${requested} ${width} resumed=${resumed}`;
      assert(!bounds.overflow,`${label}: no horizontal overflow`);
      assert(await p.locator('[data-action=choose-cards]').isVisible(),`${label}: self-selection remains available`);
      for(const selector of ['.home-decisions>.daily-tile','.learn-choice','.reading-choice','.home-learning-actions .secondary']){const b=await p.locator(selector).boundingBox();assert(b.width>=44&&b.height>=44,`${label}: usable touch target ${selector}`);}
      assert(bounds.daily.bottom<=bounds.draw.y+1&&bounds.daily.bottom<=bounds.learn.y+1,`${label}: daily is first visually`);
      if(width>600){
       near(bounds.daily.x,bounds.draw.x,`${label}: daily begins at draw column`);near(bounds.daily.right,bounds.learn.right,`${label}: daily spans both columns`);assert(bounds.draw.x<bounds.learn.x,`${label}: draw precedes learning`);
       near(bounds.learn.y,bounds.draw.y,`${label}: main card tops`);near(bounds.learn.height,bounds.draw.height,`${label}: main card heights`);near(bounds.learnTitle.y,bounds.drawTitle.y,`${label}: title alignment`);near(bounds.learnArt.y,bounds.drawArt.y,`${label}: illustration alignment`);near(bounds.learnArt.height,bounds.drawArt.height,`${label}: illustration regions`);near(bounds.learnArrow.y,bounds.drawArrow.y,`${label}: arrow alignment`);assert(bounds.support.y>=bounds.learn.bottom,`${label}: auxiliary controls are outside both primary card heights`);
      }else{
       assert(bounds.draw.bottom<=bounds.learn.y+1,`${label}: draw precedes learning`);assert(bounds.support.y>=bounds.learn.bottom,`${label}: secondary learning controls follow learning`);assert(bounds.learn.height<380&&bounds.draw.height<380,`${label}: mobile cards remain compact`);assert(bounds.learnTitle.x>=bounds.learnArt.right-1,`${label}: image and copy do not overlap`);
      }
      if(shots&&resumed&&[390,1280].includes(width)){const stressText=await p.locator('.learn-choice small').innerText(),actualName=await p.locator('.home-choice-art img').first().getAttribute('alt');await p.locator('.learn-choice small').evaluate((el,text)=>{el.textContent=text;},'下一张还没学过 · '+actualName);await p.screenshot({path:path.join(shots,`home-${engine}-${requested}-${width}.png`),fullPage:true});await p.locator('.learn-choice small').evaluate((el,text)=>{el.textContent=text;},stressText);}
     }
    }
   }
   // A synthetic saved daily proves that the independent home tile resumes the
   // same card rather than silently dealing another card.
   await p.clock.setFixedTime(new Date('2026-10-20T12:00:00'));
   const ids=await p.evaluate(()=>TAROT_READING_DECK.cards.map(card=>card.id));
   await p.addInitScript(ids=>{const day='2026-10-20',pool=ids.map(id=>({id,reversed:false})),draft={id:'home-daily-fixture',at:Date.now(),spreadId:'daily',topic:'career',questionId:'own',questionText:'',contextEnabled:false,reversals:true,pool,picked:[0],revealed:[0],active:0,phase:'read',dailyDate:day};localStorage.setItem('tarot-reading-v3',JSON.stringify({version:1,settings:{topic:'career',spreadId:'daily',questionId:'own',reversals:true},draft,history:[],practice:[],daily:[draft],ui:{view:'gallery',category:'all',guideId:'three',guideActive:0,question:''}}));},ids);
   await p.reload();await p.locator('.bottomnav [data-page=home]').click();await p.locator('.home-decisions>.daily-tile').click();await p.locator('.daily-almanac').waitFor();
   assert.equal(await p.locator('.daily-calendar').getAttribute('datetime'),'2026-10-20');const savedPool=await p.evaluate(()=>JSON.parse(localStorage.getItem('tarot-reading-v3')).daily[0].pool);
   await p.locator('[data-reading=finish]').click();await p.locator('.bottomnav [data-page=home]').click();await p.locator('.home-decisions>.daily-tile').click();await p.locator('.daily-almanac').waitFor();assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('tarot-reading-v3')).daily[0].pool),savedPool,'home daily repeat click preserves saved deck');
   await p.locator('[data-reading=finish]').click();await p.locator('.bottomnav [data-page=home]').click();await p.locator('.reading-choice').click();assert(await p.locator('[data-reading=guide]').count()>0,'draw entry still opens the spread gallery');
   assert.deepEqual(errors,[],`${engine}: no runtime errors`);await context.close();
  }finally{await browser.close();}
 }
 console.log(JSON.stringify({status:'PASS',checks:['Chromium and WebKit','320/390/768/1280px','Mengyu product name','Chinese public UI for zh/en query values','no visible language toggle','long Chinese card label','unfinished lesson and separate library entry retained','daily spans desktop first row; equal draw/learn artwork, titles and arrows below','daily/draw/learn mobile and keyboard order','same-day home daily recovery','no overflow','draw navigation']}));
})().catch(error=>{console.error(error);process.exitCode=1;});
