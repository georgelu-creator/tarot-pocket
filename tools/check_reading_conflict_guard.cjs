#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const h=require('./reading_ui_harness.cjs');

async function openScene(page,category,sceneId){
  await page.locator(`[data-reading="category"][data-value="${category}"]`).click();
  await page.locator(`[data-reading="guide"][data-scenario="${sceneId}"]`).click();
}

(async()=>{
  const server=await h.server(),browser=await chromium.launch(require('./browser_options.cjs'));
  try{
    const ctx=await h.context(browser,{viewport:{width:320,height:568},reducedMotion:'reduce'}),page=await ctx.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await h.enter(page,server.url);
    await openScene(page,'love','sc09');
    const original='我应该辞职吗？';
    await page.locator('[data-reading-question]').fill(original);
    await h.click(page,'start');
    assert.equal((await h.state(page)).draft,null,'a clear scene/question mismatch must not start shuffling');
    const notice=page.locator('[data-reading-conflict]');
    await notice.waitFor();
    const copy=await notice.innerText();
    assert(copy.includes('还有复合的机会吗')&&copy.includes('感情与相处')&&copy.includes('求职或职业发展'));
    assert.equal(await page.locator('[data-reading="start"]').isHidden(),true,'the blocked state offers no ignore-and-continue path');
    assert.deepEqual(await notice.locator('button').evaluateAll(buttons=>buttons.map(button=>button.getBoundingClientRect().height>=44)),[true,true]);
    await h.fit(page);

    await h.click(page,'change-spread');
    assert.equal((await h.state(page)).ui.view,'gallery');
    assert.equal((await h.state(page)).ui.inputs.sc09.question,original,'returning to the directory preserves the typed question');
    await page.locator('[data-reading="category"][data-value="work"]').click();
    await page.locator('[data-reading="guide"][data-scenario="sc11"]').click();
    assert.equal(await page.locator('[data-reading-question]').inputValue(),original);
    assert.equal((await h.state(page)).ui.inputs.sc11.question,original,'the preserved question follows the user into a different spread');
    await page.locator('[data-reading-question]').fill('前任还愿意复合吗？');
    await h.click(page,'start');
    await page.locator('[data-reading-question]').fill(original);
    assert.equal(await page.locator('[data-reading-conflict]').count(),0,'editing to a matching question clears the blocked state');
    assert.equal(await page.locator('[data-reading="start"]').isVisible(),true);
    const mixed='工作调动会不会影响我和伴侣的关系？';
    await page.locator('[data-reading-question]').fill(mixed);
    await h.click(page,'start');
    assert.equal((await h.state(page)).draft.questionText,mixed,'a mixed question is not guessed into one domain');
    assert.deepEqual(errors,[]);
    await ctx.close();

    const choiceCtx=await h.context(browser,{viewport:{width:320,height:568},reducedMotion:'reduce'}),choice=await choiceCtx.newPage();
    await h.enter(choice,server.url);
    await openScene(choice,'work','sc12');
    await choice.locator('[data-reading-question]').fill('前任还爱我吗？');
    await choice.locator('[data-reading-option="optionA"]').fill('留在现在的团队');
    await choice.locator('[data-reading-option="optionB"]').fill('接受新工作');
    await h.click(choice,'start');
    await h.click(choice,'use-preset-question');
    const selected=await h.state(choice);
    assert.equal(selected.draft.userQuestion,'','choosing the preset clears only the conflicting custom question');
    assert.equal(selected.draft.questionText,'两个工作选择各会怎样发展，哪一个更适合我这次的目标？');
    assert.equal(selected.draft.optionA,'留在现在的团队');
    assert.equal(selected.draft.optionB,'接受新工作');
    assert.equal(selected.ui.inputs.sc12.question,'');
    assert.equal(selected.ui.inputs.sc12.optionA,'留在现在的团队');
    await choiceCtx.close();

    const genericCtx=await h.context(browser,{viewport:{width:320,height:568},reducedMotion:'reduce'}),generic=await genericCtx.newPage();
    await h.enter(generic,server.url);
    await generic.locator('[data-reading="guide"][data-scenario="sc03"]').click();
    await generic.locator('[data-reading-question]').fill('我应该辞职吗？');
    await h.click(generic,'start');
    assert.equal((await h.state(generic)).draft.questionText,'我应该辞职吗？','a general spread accepts a specific question without blocking');
    await genericCtx.close();

    const matrixCtx=await h.context(browser,{viewport:{width:320,height:568},reducedMotion:'reduce'}),matrix=await matrixCtx.newPage();
    await h.enter(matrix,server.url);
    await openScene(matrix,'love','sc09');
    const lastIntent='我喜欢同事，这段感情影响工作，我该辞职吗？';
    await matrix.locator('[data-reading-question]').fill(lastIntent);
    await h.click(matrix,'start');
    assert.equal((await h.state(matrix)).draft,null,'the final explicit decision controls a multi-clause conflict check');
    assert.equal(await matrix.locator('[data-reading-conflict]').count(),1);
    await h.click(matrix,'change-spread');
    await openScene(matrix,'love','sc19');
    await matrix.locator('[data-reading-question]').fill('我和前任还有机会复合吗？');
    await h.click(matrix,'start');
    assert.equal((await h.state(matrix)).draft,null,'new-love positions must not answer reunion questions');
    assert.equal(await matrix.locator('[data-reading-conflict]').count(),1);
    await h.click(matrix,'change-spread');
    await openScene(matrix,'work','sc22');
    await matrix.locator('[data-reading-question]').fill('我能拿到这次面试的 offer 吗？');
    await h.click(matrix,'start');
    assert.equal((await h.state(matrix)).draft,null,'current-career positions must not answer hiring outcomes');
    assert.equal(await matrix.locator('[data-reading-conflict]').count(),1);
    await h.click(matrix,'change-spread');
    await openScene(matrix,'work','sc11');
    const relationshipQuestions=['这段关系会怎样？','我在工作中认识了一个人，这段关系会怎样？'];
    for(let i=0;i<relationshipQuestions.length;i++){
      const relationshipQuestion=relationshipQuestions[i];
      await matrix.locator('[data-reading-question]').fill(relationshipQuestion);
      await h.click(matrix,'start');
      assert.equal((await h.state(matrix)).draft,null,'a relationship outcome must not silently use the work-stall preset');
      assert.equal(await matrix.locator('[data-reading-conflict]').count(),1);
      await h.click(matrix,'change-spread');
      if(i<relationshipQuestions.length-1)await openScene(matrix,'work','sc11');
    }
    await openScene(matrix,'life','sc23');
    const coworker='我和同事在项目里怎样配合？';
    await matrix.locator('[data-reading-question]').fill(coworker);
    await h.click(matrix,'start');
    assert.equal((await h.state(matrix)).draft.questionText,coworker,'non-romantic relationship questions may mention coworkers and projects');
    await matrixCtx.close();
    console.log('PASS: clear preset/question conflicts block before shuffling, explain both scopes, preserve input on return, keep options when using the preset, refresh after edits, allow mixed/general questions, and fit at 320px.');
  }finally{
    await browser.close();
    await server.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
