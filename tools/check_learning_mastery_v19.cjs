/* v1.9 mastery gate: targeted whole-card repair, spaced review, path and mobile status UI. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {pathToFileURL}=require('node:url');

const root=path.resolve(__dirname,'..'),DAY=86400000;

function load(){
  const model={window:{addEventListener(){},matchMedia(){return {matches:true};}},document:{addEventListener(){},querySelector(){return null;}},structuredClone,console};
  for(const file of ['academy-content.js','academy.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),model);
  return model.window.TarotAcademy;
}

function session(api,id,mode='learn',index=0){return {unitId:id,mode,index,startedAt:1000,seed:37,contentVersion:api.version,answers:{},support:null,hint:false,complete:false,lang:'zh',animation:{frame:0,static:true,paused:true},scroll:0};}
function wrong(question){return question.options.find(option=>option.id!==question.correct).id;}

function checkModel(){
  const api=load(),card=api.units.m00,pathIds=Array.from(api.cardPath);
  assert.deepEqual(pathIds.slice(0,22),Array.from({length:22},(_,index)=>'m'+String(index).padStart(2,'0')),'major arcana comes first');
  assert.deepEqual(pathIds.slice(22,30),['w01','c01','s01','p01','w02','c02','s02','p02'],'number patterns are compared across four suits');
  assert.deepEqual(pathIds.slice(62,70),['w11','c11','s11','p11','w12','c12','s12','p12'],'court roles follow the numbered cards');

  const data=api.blank();data.session=session(api,'m00','learn',4);
  const original=api.stepFor(data.session).question,selected=wrong(original),selectedFeedback=original.options.find(option=>option.id===selected).feedback.zh;
  assert(api.answer(data,selected,10*DAY));assert(api.advance(data,10*DAY));
  let step=api.stepFor(data.session);
  assert.equal(step.kind,'summary');assert.equal(step.support,true);
  assert(step.content.some(line=>line.zh===selectedFeedback),'repair names the misconception attached to the selected wrong option');
  const restored=api.validate(structuredClone(data));
  assert.equal(restored.session.support.key,'card-integration','targeted repair survives reload');
  assert(api.advance(data,10*DAY));step=api.stepFor(data.session);
  assert.equal(step.kind,'question');assert.equal(step.question.id,card.revisit.id);assert.notEqual(step.question.prompt.zh,original.prompt.zh,'Q4 repair uses an equivalent new situation');
  assert(api.answer(data,step.question.correct,10*DAY));assert(api.advance(data,10*DAY));
  assert(data.session.complete,'the initial round ends only after the equivalent retest is answered');
  assert.equal(data.progress.m00.targets.Q4.status,'assisted','an immediate repair is evidence of initial learning, not mastery');
  assert.equal(api.masteryState(data.progress.m00,10*DAY).key,'initial');

  const at=20*DAY,progress={completedAt:at,uprightAt:at,reverseAt:at,nextVisitAt:at,rounds:2,targets:{},history:[]},reviews=api.blank();reviews.progress.m00=progress;
  for(const [round,time] of [[1,24*DAY],[2,32*DAY]]){
    reviews.session=session(api,'m00','review',0);const question=api.stepFor(reviews.session).question;
    assert(api.answer(reviews,question.correct,time));assert(api.advance(reviews,time));
    assert.equal(reviews.progress.m00.targets.V1.streak,round,`spaced revisit ${round} grows the streak once`);
    if(round===1)assert.notEqual(api.masteryState(reviews.progress.m00,time).key,'mastered','one revisit is not mastery');
  }
  const reinforced=api.masteryState(reviews.progress.m00,32*DAY);
  assert.equal(reinforced.key,'mastered','the stable internal key remains compatible after two spaced independent revisits');
  assert.equal(reinforced.label,'已巩固','two repetitions are presented as reinforcement, not complete mastery');
  assert.equal(reinforced.detail,'已完成正逆位学习和两次回访','card status stays concise while the evidence boundary remains in the learning master');
  assert.equal(api.masteryState({...reviews.progress.m00,reverseAt:0},32*DAY).key,'initial','two revisits without reversal are not mastery');
  assert.equal(api.masteryState({...reviews.progress.m00,nextVisitAt:31*DAY},32*DAY).key,'due','a mastered card returns to due when its next reinforcement is due');

  const legacy=api.validate({version:1,progress:{m01:{completedAt:5,uprightAt:5,reverseAt:0,nextVisitAt:9,rounds:1,targets:{Q4:{last:5,due:9,status:'independent',streak:1}},history:[]}},session:null,paused:{}});
  assert.equal(legacy.progress.m01.uprightAt,5);assert.equal(api.masteryState(legacy.progress.m01,6).key,'initial','old records remain readable without being promoted to mastery');

  let stored=api.blank();const academy=api.create({esc:String,img:()=>'',icon:()=>'',go(){},toast(){},now:()=>40*DAY,get:()=>stored,set:value=>{stored=value;}});
  assert.equal(academy.recommendation(),'m00');stored.progress.m00={uprightAt:1};assert.equal(academy.recommendation(),'m01','recommendation follows the stable learning path');
  return {path:api.cardPath.length,q4Retest:card.revisit.id,masteryRevisits:2};
}

async function checkUI(){
  const {chromium}=require('playwright'),browser=await chromium.launch(require('./browser_options.cjs'));
  const url=process.env.DEMO_URL||pathToFileURL(path.join(root,'demo/tarot-demo.html')).href;
  try{
    const context=await browser.newContext({viewport:{width:320,height:568},reducedMotion:'reduce'});
    const seedPage=await context.newPage();seedPage.setDefaultTimeout(15000);
    await seedPage.goto(url+'?lang=en');
    await seedPage.evaluate(DAY=>{
      const root=JSON.parse(localStorage.getItem('tarot-pocket-demo-v1')),now=Date.now(),record=(extra={})=>({completedAt:now-10*DAY,uprightAt:now-10*DAY,reverseAt:0,nextVisitAt:now+DAY,rounds:1,targets:{},history:[],...extra});
      root.journey.academy.progress={
        m01:record(),
        m02:record({reverseAt:now-8*DAY}),
        m03:record({reverseAt:now-8*DAY,nextVisitAt:now-DAY,targets:{V1:{last:now-4*DAY,due:now-DAY,status:'independent',streak:1}}}),
        m04:record({reverseAt:now-8*DAY,targets:{V1:{last:now-2*DAY,due:now+7*DAY,status:'independent',streak:2}}})
      };
      localStorage.setItem('tarot-pocket-demo-v1',JSON.stringify(root));
    },DAY);
    // Keep the seeding page alive: unloading it would persist its stale in-memory
    // copy over the fixture. A second page in the same context reads the fixture.
    const page=await context.newPage();page.setDefaultTimeout(15000);await page.goto(url+'?lang=en');
    const productHome=await page.locator('.home-simple').innerText();assert.match(productHome,/先看讲解/);assert.match(productHome,/已巩固/);assert.doesNotMatch(productHome,/先听讲解|已掌握/);
    await page.locator('[data-action=nav][data-page=courses]').first().click();
    const home=await page.locator('.academy-home').innerText();assert.match(home,/按顺序学下一张/);assert.match(home,/已巩固/);assert.doesNotMatch(home,/已掌握|随机学一张/);
    await page.locator('.academy-card-library [data-action=nav][data-page=library]').click();
    for(const label of ['未学','初学','已学逆位','待复习','已巩固'])assert.equal(await page.locator(`[data-action=filter][data-value="${label}"]`).count(),1,label+' filter');
    for(const [id,label] of [['m00','未学'],['m01','初学'],['m02','已学逆位'],['m03','待复习'],['m04','已巩固']])assert.match(await page.locator(`.library-card[data-id="${id}"] .library-learning-state`).innerText(),new RegExp(label));
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'320px library has no horizontal overflow');
    await page.locator('.library-card[data-id="m01"]').click();assert.match(await page.locator('#overlay').innerText(),/初学[\s\S]*下一步：学习逆位/);assert.equal(await page.locator('#overlay [data-academy=reverse][data-id=m01]').count(),1);
    await page.locator('#overlay [data-action=close]').click();await page.locator('.library-card[data-id="m03"]').click();assert.equal(await page.locator('#overlay [data-academy=start-review][data-id=m03]').count(),1);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'320px detail has no horizontal overflow');
    return {viewport:'320x568',states:5,language:'zh-CN'};
  }finally{await browser.close();}
}

(async()=>{const model=checkModel(),ui=await checkUI();console.log(JSON.stringify({status:'PASS',model,ui,checks:['targeted Q4 repair plus equivalent retest','two spaced independent revisits display an accurate reinforced state','upright and reversal kept separate','stable major-number-court recommendation path','legacy record compatibility','five learner-facing states at 320px','Chinese-only UI']},null,2));})().catch(error=>{console.error(error);process.exitCode=1;});
