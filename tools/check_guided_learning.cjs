/* All 78 cards must have a guided path, independent of reference browsing. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{addEventListener(){},matchMedia:()=>({matches:true})},document:{addEventListener(){},querySelector:()=>null},structuredClone,console};
for(const file of ['academy-content.js','academy.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),context);
const api=context.window.TarotAcademy,DAY=86400000,at=10*DAY;
const session=(id,mode,extra={})=>({unitId:id,mode,index:0,startedAt:at,seed:9,contentVersion:api.version,answers:{},support:null,hint:false,complete:false,...extra});
function finish(data,time=at){let budget=30;while(!data.session.complete&&budget--){const step=api.stepFor(data.session);if(step.kind==='question'&&!data.session.answers[step.question.id])assert(api.answer(data,step.question.correct,time));assert(api.advance(data,time));}assert(data.session.complete);}
const data=api.blank();
assert.equal(api.guidedQueue(data,at)[0].id,'m00');
for(const id of api.cardPath){
  for(const mode of ['foundation','application','integration']){
    const next=api.guidedQueue(data,at)[0];assert.equal(next.id,id);assert.equal(next.mode,mode);
    data.session=session(id,mode);assert.equal(api.stepFor(data.session).kind,'teach','each stage explains before assessment');
    finish(data);const restored=api.validate(structuredClone(data));assert(restored.session.complete);assert(api.skillState(restored.progress[id])[mode]);
  }
}
assert.equal(Object.keys(data.progress).length,78);assert.equal(api.guidedQueue(data,at).length,0);
const next=api.guidedQueue(data,at+4*DAY)[0];assert.equal(next.mode,'practice');
const wrong=api.blank();wrong.session=session('m00','practice',{practiceKey:'Q2',variant:0});
let q=api.stepFor(wrong.session).question;api.answer(wrong,q.options.find(o=>o.id!==q.correct).id,at);api.advance(wrong,at);
assert.equal(api.stepFor(wrong.session).kind,'teach','mistake triggers authored remediation');
finish(wrong);assert.equal(wrong.progress.m00.targets.Q2.status,'assisted');
const a=api.stepFor(session('m00','practice',{practiceKey:'Q2',variant:0})).question.id;
const b=api.stepFor(session('m00','practice',{practiceKey:'Q2',variant:1})).question.id;
assert.notEqual(a,b,'practice alternates authored situations instead of only shuffling options');
let persisted=api.blank();
const academy=api.create({esc:x=>x,img:()=>'',icon:()=>'',go:()=>{},toast:()=>{},now:()=>at,get:()=>persisted,set:value=>{persisted=value;}});
academy.start('m00','practice',{key:'Q1'});
const first=api.stepFor(persisted.session).question;
api.answer(persisted,first.options.find(o=>o.id!==first.correct).id,at);
api.advance(persisted,at);
assert(persisted.session.support,'the original practice has remediation in progress');
academy.start('m00','practice',{key:'Q2'});
assert.equal(persisted.session.practiceKey,'Q2');
academy.start('m00','practice',{key:'Q1'});
assert.equal(persisted.session.practiceKey,'Q1');
assert.equal(persisted.session.variant,0);
assert.equal(persisted.session.answers[first.id].correct,false);
assert(persisted.session.support,'the original support survives switching targets');
assert.equal(api.validate(structuredClone(persisted)).paused['m00:practice:Q2'].practiceKey,'Q2');
const older=api.validate({version:1,progress:{m00:{uprightAt:1,reverseAt:2,targets:{},history:[]}},paused:{},session:null});
assert.equal(api.skillState(older.progress.m00).foundation,true);assert.equal(api.skillState(older.progress.m00).integration,false,'legacy completion is not fabricated advanced evidence');
console.log('Guided learning: 78 × 3 stages, persisted progress, due reviews and authored remediation passed');
for(const id of api.cardPath){
  const unit=api.units[id];
  assert(api.practiceVariants(unit,'Q2').length>=2,`${id} has two authored contextual applications`);
  assert(api.practiceVariants(unit,'Q4').length>=2,`${id} includes error discrimination`);
  for(const key of ['Q1','Q2','Q3','Q4','V1'])for(let variant=0;variant<api.practiceVariants(unit,key).length;variant++){
    const d=api.blank();d.session=session(id,'practice',{practiceKey:key,variant});
    const q=api.stepFor(d.session).question;assert.equal(new Set(q.options.map(o=>o.id)).size,q.options.length);assert(q.options.some(o=>o.id===q.correct));
    api.answer(d,q.correct,at);const saved=api.validate(structuredClone(d));
    assert.equal(api.stepFor(saved.session).question.id,q.id);assert.equal(saved.session.answers[q.id].correct,true,'variant answer survives backup validation');
    finish(saved);
  }
}
const backlog=structuredClone(data);for(const id of api.cardPath.slice(0,3))backlog.progress[id].history.push({at:at+4*DAY,mode:'practice',answers:[],contentVersion:api.version});
delete backlog.progress.p14;
assert.equal(api.guidedQueue(backlog,at+4*DAY)[0].mode,'foundation','three due reviews interleave with available new learning');
console.log('All authored variants persist; review backlog interleaves with new learning');
