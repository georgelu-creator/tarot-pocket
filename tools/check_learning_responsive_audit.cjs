/* Fresh browser records only: responsive teaching, repair and restoration. */
'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url'),{chromium,webkit}=require('playwright');
const course=require('./course_ui_helpers.cjs');
const url=process.env.DEMO_URL||pathToFileURL(path.resolve(__dirname,'../index.html')).href;
const snapshot=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('tarot-pocket-demo-v1')).journey.academy);
async function fits(p,label){assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+' has no horizontal overflow');}
async function finish(p){
  for(let i=0;i<80;i++){
    const step=await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('tarot-pocket-demo-v1')).journey.academy.session;if(s.complete)return null;const q=TarotAcademy.stepFor(s);return {kind:q.kind,correct:q.question?.correct,answered:!!s.answers[q.question?.id]};});
    if(!step)return;
    if(step.kind==='question'&&!step.answered)await p.locator(`[data-academy=answer][data-value="${step.correct}"]`).click();
    await p.locator('[data-academy=next]').click();
  }
  throw Error('Lesson did not finish');
}
(async()=>{
  for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
    const browser=await engine.launch(name==='chromium'?require('./browser_options.cjs'):{headless:true});
    try{
      const p=await browser.newPage({viewport:{width:390,height:600},reducedMotion:'reduce'}),errors=[];
      p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(12000);await p.goto(url);
      for(const [width,height] of [[320,568],[390,844],[600,800],[768,1024],[1280,800],[844,390]]){
        await p.setViewportSize({width,height});
        for(const level of ['B','I','A']){
          await course.home(p);if(await p.locator('.academy-catalog').count())await p.locator('[data-academy=catalog-back]').click();
          await p.locator(`[data-academy=level][data-value=${level}]`).click();await fits(p,`${name} ${width} ${level} home`);
          await course.catalog(p);await fits(p,`${name} ${width} ${level} catalog`);
          assert.equal(await p.locator('[data-academy=guided-card]').count(),78);
        }
        for(const id of ['m00','B01','I06','A05','A06']){await course.open(p,id);await fits(p,`${name} ${width} ${id} teaching`);}
      }
      await p.setViewportSize({width:390,height:600});await course.open(p,'m00');await p.locator('[data-academy=next]').click();
      const wrong=await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('tarot-pocket-demo-v1')).journey.academy.session,q=TarotAcademy.stepFor(s).question;return q.options.find(o=>o.id!==q.correct).id;});
      await p.locator(`[data-academy=answer][data-value="${wrong}"]`).click();
      await p.waitForFunction(()=>{const r=document.querySelector('.academy-feedback').getBoundingClientRect();return r.top>=-1&&r.top<innerHeight/2;});
      await p.waitForTimeout(220);const before=await snapshot(p),scroll=await p.evaluate(()=>scrollY);assert(scroll>0,'feedback requires scrolling on this viewport');
      await p.reload();await p.locator('[data-academy=guided]').click();
      await p.waitForFunction(y=>Math.abs(scrollY-y)<2,scroll);assert.deepEqual((await snapshot(p)).session.answers,before.session.answers,'resume preserves committed answer');
      await p.screenshot({path:`/tmp/tarot-learning-${name}-feedback-resumed.png`});
      await p.locator('[data-academy=next]').click();assert((await snapshot(p)).session.support,'incorrect response routes into repair');await fits(p,'repair');
      await finish(p);assert((await snapshot(p)).session.complete);await fits(p,'completion');
      // Leave during the 180ms scroll-save debounce, then switch lessons.
      // DOM activation avoids Playwright scrolling the top return button into view.
      await course.open(p,'m01');
      // Entering a lesson restores its saved position on the next animation
      // frame. Finish that render before starting the separate rapid-leave test;
      // otherwise its initial restore can undo our synthetic scroll first.
      await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const rapidScroll=await p.evaluate(async()=>{window.scrollTo(0,240);await new Promise(requestAnimationFrame);const y=scrollY;document.querySelector('[data-academy=home]').click();return y;});
      assert(rapidScroll>0);assert.equal((await snapshot(p)).session.scroll,rapidScroll,'return saves the latest position synchronously');
      await p.waitForTimeout(220);assert.equal((await snapshot(p)).session.scroll,rapidScroll,'a pending scroll-save cannot replace the paused position with the course page offset');
      await course.open(p,'I01');await course.open(p,'m01');
      await p.waitForFunction(y=>Math.abs(scrollY-y)<2,rapidScroll);
      assert.equal((await snapshot(p)).session.scroll,rapidScroll,'rapid departure position survives another lesson and resume');
      await course.open(p,'I04');await p.locator('[data-academy=next]').click();
      const session=(await snapshot(p)).session;
      await p.locator('.academy-card-face.is-reversed').first().click();
      assert(await p.locator('.zoom-backdrop img').evaluate(e=>getComputedStyle(e).transform.startsWith('matrix(-1')),'zoom preserves reversed teaching orientation');
      for(const [width,height] of [[320,568],[600,800],[844,390]]){await p.setViewportSize({width,height});await fits(p,'zoom resize');const box=await p.locator('.zoom-backdrop [data-action=close]').boundingBox();assert(box&&box.x>=0&&box.y>=0&&box.x+box.width<=width&&box.y+box.height<=height,'zoom close remains reachable');}
      await p.screenshot({path:`/tmp/tarot-learning-${name}-reverse-zoom-landscape.png`});
      await p.locator('.zoom-backdrop [data-action=close]').click();assert.deepEqual((await snapshot(p)).session.answers,session.answers);assert.equal((await snapshot(p)).session.index,session.index);
      await p.setViewportSize({width:320,height:568});await course.open(p,'A06');await p.screenshot({path:`/tmp/tarot-learning-${name}-A06-320.png`});
      assert.deepEqual(errors,[]);console.log(`PASS ${name}: six viewports, three stage homes/catalogs, single/multiple-card teaching, visible feedback, reload resume position and answers, repair/completion, reversed zoom and resize`);
    }finally{await browser.close();}
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
