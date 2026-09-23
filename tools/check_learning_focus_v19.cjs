/* Chinese learning focus: separate deck library, compact first lesson, and 78-card flow audit. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {pathToFileURL}=require('node:url');

const root=path.resolve(__dirname,'..');

function loadModel(){
  const model={
    window:{addEventListener(){},matchMedia(){return {matches:true};}},
    document:{addEventListener(){},querySelector(){return null;}},
    structuredClone,
    console
  };
  for(const file of ['academy-content.js','academy.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),model);
  return model;
}

function makeSession(api,id,mode,index){
  return {unitId:id,mode,index,startedAt:1000,seed:37,contentVersion:api.version,answers:{},support:null,hint:false,complete:false,lang:'en',animation:{frame:0,static:true,paused:true},scroll:0};
}

function wrongChoice(question){
  return question.options.find(option=>option.id!==question.correct).id;
}

function checkLearningModel(){
  const model=loadModel();
  const api=model.window.TarotAcademy;
  const source=model.window.TAROT_ACADEMY_CONTENT;
  const all=[...source.lessons,...source.cards];
  const questionCount=all.reduce((count,unit)=>count+Object.keys(unit.questions).length+Object.keys(unit.remediation).length+1,0);
  assert.equal(all.length,98,'20 lessons plus 78 card units');
  assert.equal(questionCount,724,'the authored 724-question architecture stays intact');

  let stored=api.blank();
  const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const academy=api.create({esc,img:id=>`<img data-id="${id}">`,icon:()=>'',go(){},toast(){},now:()=>1700000000000,get:()=>stored,set:value=>{stored=value;}});
  const home=academy.home();
  assert.match(home,/data-action="nav" data-page="library"/,'course home links to the independent library');
  assert.doesNotMatch(home,/data-academy-search|academy-card-grid/,'course home does not embed all 78 cards');
  assert.match(home,/按顺序学下一张/);
  assert.doesNotMatch(home,/随机学一张新牌/);
  assert.match(home,/到期复习/);
  assert.match(home,/\/ 78 张完成正位初学/);
  assert.doesNotMatch(home,/Learn to read|Course levels|Beginner/,'academy home stays Chinese even with legacy English state');

  for(const card of source.cards){
    const learn=api.planFor(card,'learn');
    assert.deepEqual(Array.from(learn,step=>`${step.kind}:${step.key}`),['teach:T1','question:Q1','teach:T2','question:Q2','question:Q4'],`${card.id}: upright teaching precedes practice`);
    assert(learn.every(step=>!step.reversed),`${card.id}: first learning stays upright`);
    const reverse=api.planFor(card,'reverse');
    assert.deepEqual(Array.from(reverse,step=>`${step.kind}:${step.key}:${step.reversed}`),['teach:T3:true','question:Q3:true'],`${card.id}: reversal is a separate round`);

    for(const [key,index] of [['Q1',1],['Q2',3]]){
      const data=api.blank();data.session=makeSession(api,card.id,'learn',index);
      const question=api.stepFor(data.session).question;
      assert(api.answer(data,wrongChoice(question),2000),`${card.id} ${key}: wrong answer records`);
      assert(api.advance(data,3000),`${card.id} ${key}: enter repair`);
      let repair=api.stepFor(data.session);
      assert.equal(repair.kind,'teach',`${card.id} ${key}: wrong answer gets authored reteaching`);
      assert.equal(repair.support,true);
      assert(api.advance(data,4000));
      repair=api.stepFor(data.session);
      assert.equal(repair.kind,'question',`${card.id} ${key}: reteaching is checked with a new example`);
      assert.equal(repair.support,true);
    }

    const whole=api.blank();whole.session=makeSession(api,card.id,'learn',4);
    const wholeQuestion=api.stepFor(whole.session).question;
    assert(api.answer(whole,wrongChoice(wholeQuestion),5000));
    assert(api.advance(whole,6000));
    assert.equal(api.stepFor(whole.session).kind,'summary',`${card.id} Q4: a wrong whole-card answer gets a recap before completion`);

    const reversed=api.blank();reversed.session=makeSession(api,card.id,'reverse',1);
    const reverseQuestion=api.stepFor(reversed.session).question;
    assert(api.answer(reversed,wrongChoice(reverseQuestion),7000));
    assert(api.advance(reversed,8000));
    const reverseRepair=api.stepFor(reversed.session);
    assert.equal(reverseRepair.kind,'teach',`${card.id} Q3: reversed misunderstanding gets reteaching`);
    assert.equal(reverseRepair.reversed,true);

    stored=api.blank();stored.session=makeSession(api,card.id,'learn',0);
    const firstScreen=academy.render();
    assert.match(firstScreen,/academy-teaching-points/,`${card.id}: first screen visibly renders teaching`);
    for(const teaching of card.teachings)assert(firstScreen.includes(esc(teaching.zh)),`${card.id}: visible T1 includes every authored Chinese teaching point`);
    assert.doesNotMatch(firstScreen,new RegExp(esc(card.title.en)),`${card.id}: legacy English session does not change visible language`);
  }
  return {cards:source.cards.length,units:all.length,questions:questionCount};
}

async function checkLearningUI(){
  const {chromium}=require('playwright');
  const browser=await chromium.launch(require('./browser_options.cjs'));
  const url=process.env.DEMO_URL||pathToFileURL(path.join(root,'demo/tarot-demo.html')).href;
  try{
    const page=await browser.newPage({viewport:{width:320,height:568},reducedMotion:'reduce'});
    page.setDefaultTimeout(15000);
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(url+'?lang=zh');
    await page.locator('[data-action=nav][data-page=courses]').first().click();
    assert.equal(await page.locator('.academy-card-grid,[data-academy-search]').count(),0,'course page has no embedded 78-card grid or search');
    const libraryEntry=page.locator('.academy-card-library [data-action=nav][data-page=library]');
    assert.equal(await libraryEntry.count(),1,'one clear independent library entry');
    assert.equal(await page.locator('[data-academy=new]').count(),1,'random card remains on course page');
    assert.equal(await page.locator('[data-academy=review]').count(),1,'due review remains on course page even when the count is zero');
    await libraryEntry.click();
    assert.equal(await page.locator('.library-card').count(),78,'independent library contains all 78 cards');

    await page.locator('[data-action=nav][data-page=courses]').first().click();
    await page.locator('[data-academy=start][data-id=B01]').click();
    const compact=await page.locator('.academy-image-space').evaluate(element=>element.getBoundingClientRect().height);
    assert(compact<=125,`first lesson image area should be compact at 320x568, got ${compact}`);
    const next=page.locator('[data-academy=next]');
    const nextBox=await next.boundingBox();
    const nextBottom=nextBox&&nextBox.y+nextBox.height;
    assert(nextBox&&nextBottom<=568,`first Continue button must be in the initial 320x568 viewport, bottom=${nextBottom}`);
    assert(await next.evaluate(element=>{const box=element.getBoundingClientRect();const hit=document.elementFromPoint(box.left+box.width/2,box.top+box.height/2);return hit===element||element.contains(hit);}),`first Continue button must not be covered`);

    await page.locator('[data-academy=home]').click();
    await page.locator('[data-academy=level][data-value=A]').click();
    for(const [id,count,minHeight] of [['A05',5,300],['A06',10,390]]){
      await page.locator(`[data-academy=start][data-id=${id}]`).click();
      const layout=await page.locator(`.academy-layout-${id}`).evaluate(element=>({display:getComputedStyle(element).display,height:element.getBoundingClientRect().height,count:element.querySelectorAll('figure').length}));
      assert.equal(layout.display,'grid',`${id}: authored spread remains a grid`);
      assert.equal(layout.count,count,`${id}: all spread positions remain visible`);
      assert(layout.height>=minHeight,`${id}: short-screen compaction must not collapse the authored spread`);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${id}: no horizontal overflow at 320px`);
      await page.locator('[data-academy=home]').click();
    }

    await page.locator('.academy-card-library [data-action=nav][data-page=library]').click();
    await page.locator('.library-card[data-id=p08]').click();
    await page.locator('[data-academy=start][data-id=p08]').click();
    assert.equal(await page.locator('.academy-teaching-points section').count(),3,'a card visibly teaches meaning, image cue and memory cue before Q1');
    assert.match(await page.locator('.academy-teaching-points').innerText(),/核心意思[\s\S]*画面线索[\s\S]*记忆线索/);
    await page.locator('[data-academy=next]').click();
    assert.match(await page.locator('.academy-copy>.eyebrow').innerText(),/做一道练习/,'Q1 follows visible teaching');
    assert.deepEqual(errors,[]);
    return {viewport:'320x568',libraryCards:78,firstLessonImageHeight:compact,continueBottom:nextBottom,spreadLayouts:['A05','A06']};
  }finally{
    await browser.close();
  }
}

(async()=>{
  const model=checkLearningModel();
  const ui=await checkLearningUI();
  console.log(JSON.stringify({status:'PASS',model,ui,checks:['independent 78-card library entry','course quick actions and progress','Chinese-only academy rendering','visible T1 teaching for every card','Q1/Q2 targeted repair','Q4 whole-card recap','separate reversed round and repair','320x568 first Continue visible','A05/A06 spread layouts preserved']},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
