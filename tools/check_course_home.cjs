/* A course starts with a lesson, while the complete route lives one level down. */
'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url'),{chromium,webkit}=require('playwright');
const courses=require('./course_ui_helpers.cjs');
const url=process.env.DEMO_URL||pathToFileURL(path.resolve(__dirname,'../demo/tarot-demo.html')).href;
const state=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('tarot-pocket-demo-v1')).journey.academy);
async function finish(page){
  for(let n=0;n<80;n++){
    const step=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('tarot-pocket-demo-v1')).journey.academy.session;if(s.complete)return {complete:true};const q=TarotAcademy.stepFor(s);return {kind:q.kind,id:q.question?.id,correct:q.question?.correct,answered:!!s.answers[q.question?.id]};});
    if(step.complete)return;
    if(step.kind==='question'&&!step.answered)await page.locator(`[data-academy=answer][data-value="${step.correct}"]`).click();
    await page.locator('[data-academy=next]').click();
  }
  throw Error('course did not finish');
}
async function selectStage(page,level){await courses.catalog(page,level);assert.equal(await page.locator(`[data-academy=level][data-value=${level}]`).getAttribute('aria-pressed'),'true');await page.locator('[data-academy=catalog-back]').click();}
(async()=>{
  for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
    const browser=await engine.launch(name==='chromium'?require('./browser_options.cjs'):{headless:true});
    try{
      const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
      await page.goto(url);await courses.home(page);
      const original=await state(page);
      for(const width of [320,390,1280]){
        await page.setViewportSize({width,height:844});
        for(const level of ['B','I','A']){
          await selectStage(page,level);
          assert.equal(await page.locator('[data-academy=level],.academy-up-next').count(),0,'home defers levels and future lists to course selection');
          assert.equal(await page.locator('[data-academy=guided]').count(),1,'one current lesson action');
          assert.equal(await page.locator('[data-academy=guided-card],.academy-foundations,.academy-path-grid').count(),0,'no full-card grid or standalone methods toolbox');
          assert.equal(await page.locator('[data-academy=start]').count(),0,'method lessons are embedded into the route, not a second homepage catalog');
          assert.deepEqual((await state(page)).progress,original.progress,'changing stage never invents completion');
          assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${name} ${width} ${level} fits`);
          const box=await page.locator('[data-academy=guided]').boundingBox();assert(box&&box.width>=44&&box.height>=44,'primary lesson is tappable');
        }
      }
      await selectStage(page,'I');await page.reload();await courses.home(page);assert.equal((await state(page)).courseLevel,'I','selected stage survives reload');assert.deepEqual((await state(page)).progress,original.progress);
      for(const [level,methods] of [['B',8],['I',6],['A',6]]){
        await courses.catalog(page,level);
        assert.equal(await page.locator('.academy-catalog details.academy-chapter').count(),3);
        assert.equal(await page.locator('[data-academy=guided-card]').count(),78,'all cards remain individually reachable');
        assert.equal(await page.locator('[data-academy=start]').count(),methods,'all authored methods are retained in their stage');
        assert.equal(await page.locator('details.academy-chapter[open]').count(),1,'directory opens only the current chapter');
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'directory fits');
        await page.locator('[data-academy=catalog-back]').click();assert.equal(await page.locator('.academy-catalog').count(),0);
      }
      await page.setViewportSize({width:390,height:844});await selectStage(page,'B');await page.locator('[data-academy=guided]').click();assert.equal((await state(page)).session.unitId,'p08','new learner enters one concrete card before methods');
      await finish(page);const learned=await state(page);assert(learned.progress.p08.uprightAt);await page.locator('[data-academy=guided]').click();assert.equal((await state(page)).session.unitId,'m00','finishing the first card continues directly into the next card lesson');assert.equal((await state(page)).session.mode,'foundation');
      const beforeDisclosure=await state(page);await page.locator('.academy-memory > summary').click();assert.equal(await page.locator('.academy-memory[open]').count(),1);await page.waitForFunction(()=>JSON.parse(localStorage.getItem('tarot-pocket-demo-v1')).journey.academy.session.disclosures?.memory===true);assert.deepEqual((await state(page)).progress,beforeDisclosure.progress,'opening an explanation never scores a lesson');
      await page.locator('[data-academy=home]').click();await page.reload();await courses.home(page);await page.locator('[data-academy=guided]').click();assert.equal(await page.locator('.academy-memory[open]').count(),1,'expanded explanation survives leaving and reload');
      await page.locator('[data-academy=next]').click();const q=await page.evaluate(()=>TarotAcademy.stepFor(JSON.parse(localStorage.getItem('tarot-pocket-demo-v1')).journey.academy.session).question);await page.locator(`[data-academy=answer][data-value="${q.correct}"]`).click();const saved=await state(page);
      await page.locator('[data-academy=home]').click();await selectStage(page,'A');assert.deepEqual((await state(page)).progress,saved.progress,'stage browsing does not rescore an answer');await page.reload();await courses.home(page);await selectStage(page,'B');await page.locator('[data-academy=guided]').click();const resumed=await state(page);assert.equal(resumed.session.unitId,'m00','current unfinished lesson remains directly resumable across stage browsing');assert.deepEqual(resumed.session.answers,saved.session.answers);const normalizedSaved=await page.evaluate(snapshot=>TarotAcademy.validate(snapshot).progress,saved);assert.deepEqual(resumed.progress,normalizedSaved,'existing course evidence survives reload and resume, including compatibility defaults');
      // Starting a real lesson in another stage must not replace the paused one.
      await courses.open(page,'m05','B');await page.locator('[data-academy=next]').click();
      const m05Question=await page.evaluate(()=>TarotAcademy.stepFor(JSON.parse(localStorage.getItem('tarot-pocket-demo-v1')).journey.academy.session).question);
      await page.locator(`[data-academy=answer][data-value="${m05Question.correct}"]`).click();const m05Before=await state(page);
      assert.equal(m05Before.session.index,1);assert(Object.keys(m05Before.session.answers).length>0);
      await courses.open(page,'I01');assert.equal((await state(page)).session.unitId,'I01');assert.equal((await state(page)).session.courseLevel,'I');
      await courses.home(page);await selectStage(page,'B');
      if(await page.locator('.academy-catalog').count())await page.locator('[data-academy=catalog-back]').click();
      assert.match(await page.locator('.academy-current-course').innerText(),/教皇/);
      await page.locator('[data-academy=guided]').click();let m05After=await state(page);
      assert.equal(m05After.session.unitId,'m05');assert.equal(m05After.session.mode,'foundation');assert.equal(m05After.session.courseLevel,'B');assert.equal(m05After.session.index,m05Before.session.index);assert.deepEqual(m05After.session.answers,m05Before.session.answers);assert.deepEqual(m05After.progress,m05Before.progress);
      // The same prerequisite lesson can be entered from advanced without losing
      // its answers; its stage ownership must follow the explicit course entry.
      await courses.open(page,'m05','A');m05After=await state(page);
      assert.equal(m05After.session.mode,'foundation');assert.equal(m05After.session.courseLevel,'A');assert.equal(m05After.session.index,m05Before.session.index);assert.deepEqual(m05After.session.answers,m05Before.session.answers);
      await courses.home(page);if(await page.locator('.academy-catalog').count())await page.locator('[data-academy=catalog-back]').click();
      assert.equal((await state(page)).courseLevel,'A');assert.match(await page.locator('.academy-current-course').innerText(),/教皇/);
      await page.locator('[data-academy=guided]').click();const advancedResume=await state(page);
      assert.equal(advancedResume.session.unitId,'m05');assert.equal(advancedResume.session.courseLevel,'A');assert.equal(advancedResume.session.index,m05Before.session.index);assert.deepEqual(advancedResume.session.answers,m05Before.session.answers);assert.deepEqual(advancedResume.progress,m05Before.progress);
      await courses.open(page,'B01');assert.equal(await page.locator('.academy-image-space figure').count(),0,'classification introduction has no unrelated card images');
      await page.locator('[data-academy=next]').click();assert.equal(await page.locator('.academy-image-space figure').count(),0,'suit explanation does not mistake 星币四组 for the card 星币四');
      await page.locator('[data-academy=next]').click();assert.equal(await page.locator('.academy-image-space figure').count(),3,'classification example shows its three relevant cards');
      assert.deepEqual(await page.locator('.academy-image-space figcaption').allInnerTexts(),['星币八 · 数字牌','圣杯骑士 · 宫廷牌','力量 · 大阿卡纳']);
      await page.locator('[data-academy=next]').click();assert.equal(await page.locator('.academy-image-space figure').count(),1);assert.equal(await page.locator('.academy-image-space figcaption').innerText(),'圣杯王后','question caption identifies the card without revealing its classification answer');
      await courses.home(page);if(await page.locator('.academy-catalog').count())await page.locator('[data-academy=catalog-back]').click();await page.setViewportSize({width:390,height:844});await page.screenshot({path:`/tmp/tarot-course-home-${name}-390.png`,fullPage:true});
      assert.deepEqual(errors,[]);console.log(`PASS ${name}: layered stage home, no flattened route, 78-card/20-method directory, concrete card-to-card continuation, preserved stage/answers/evidence, 320/390/1280 widths`);
    }finally{await browser.close();}
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
