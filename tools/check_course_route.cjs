/* Stage routes integrate methods with all cards without manufacturing progress. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},structuredClone};
for(const file of ['academy-content.js','academy.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),context);
const api=context.window.TarotAcademy,DAY=86400000,at=30*DAY;
function finish(data,item,time=at){
  data.session={unitId:item.id,mode:item.mode,index:0,startedAt:time,seed:9,contentVersion:api.version,answers:{},support:null,hint:false,complete:false,practiceKey:item.key||'V1',variant:0};
  let budget=80;
  while(!data.session.complete&&budget--){const step=api.stepFor(data.session);if(step.kind==='question'&&!data.session.answers[step.question.id])assert(api.answer(data,step.question.correct,time));assert(api.advance(data,time));}
  assert(data.session.complete,`${item.id} ${item.mode} finishes`);
}
const modes={B:'foundation',I:'application',A:'integration'},data=api.blank();
for(const [level,mode]of Object.entries(modes)){
  const route=api.courseRoute(data,level,at),methods=route.filter(node=>node.mode==='learn');
  assert.equal(route.length,78+(level==='B'?8:6));
  assert.equal(new Set(route.map(node=>node.id)).size,route.length);
  assert.equal(route.filter(node=>node.mode===mode).length,78);
  assert.deepEqual([...methods.map(node=>node.id)].sort(),Object.keys(api.units).filter(id=>id.startsWith(level)).sort());
  assert.equal(route[0].id,'p08');assert.equal(route[0].mode,mode,'each stage begins with a concrete card');
  if(level==='B')assert.deepEqual(Array.from(route.slice(0,4).map(n=>n.id)),['p08','m00','m01','B01']);
  assert(route.slice(2,-2).some(node=>node.mode==='learn'),'methods are interleaved, not a separate introductory pile');
  assert.equal(new Set(route.map(node=>node.chapter)).size,3);
  let rounds=0,item;
  while((item=api.stageNext(data,level,at))&&rounds<100){
    assert.equal(item.id,route[rounds].id,'next follows the selected stage route');
    assert.equal(item.mode,route[rounds].mode);
    assert.equal(api.stepFor({unitId:item.id,mode:item.mode,index:0,answers:{}}).kind,'teach');
    finish(data,item);rounds++;
  }
  assert.equal(rounds,route.length);
  assert.equal(api.stageNext(data,level,at),null);
  assert(api.courseRoute(data,level,at).every(node=>node.done));
  assert(api.cardPath.every(id=>api.skillState(data.progress[id])[mode]));
}
assert.equal(Object.keys(data.progress).length,98,'all 78 cards and 20 methods have real submitted completion evidence');
const restored=api.validate(structuredClone(data));
for(const level of Object.keys(modes))assert(api.courseRoute(restored,level,at).every(node=>node.done),'stage progress survives backup validation');

// Entering a higher level is allowed, but missing earlier card skills are taught.
for(const level of ['I','A']){
  const fresh=api.blank(),seen=new Set();let rounds=0,item;
  while((item=api.stageNext(fresh,level,at))&&rounds<260){seen.add(item.id+':'+item.mode);finish(fresh,item);rounds++;}
  assert.equal(api.stageNext(fresh,level,at),null);
  assert.equal(rounds,78*(level==='I'?2:3)+6);
  for(const id of api.cardPath){assert(seen.has(id+':foundation'));assert(seen.has(id+':application'));if(level==='A')assert(seen.has(id+':integration'));}
  assert.equal(Object.keys(fresh.progress).filter(id=>/^B/.test(id)).length,0,'higher level does not fabricate method-course completions');
}
const old=api.validate({version:1,progress:{B01:{completedAt:1,targets:{}},m00:{uprightAt:1,reverseAt:2,targets:{},history:[]}},session:null,paused:{}});
assert(api.courseRoute(old,'B',at).find(node=>node.id==='B01').done);
assert(api.courseRoute(old,'I',at).find(node=>node.id==='m00').done);
assert.equal(api.courseRoute(old,'A',at).find(node=>node.id==='m00').done,false,'legacy upright/reversal cannot imply advanced completion');
const before=JSON.stringify(old);api.courseRoute(old,'B',at);api.stageNext(old,'A',at);assert.equal(JSON.stringify(old),before,'route calculation has no persistence side effects');

const backlog=structuredClone(restored),later=at+4*DAY;
delete backlog.progress.p14;
for(let index=0;index<3;index++){
  const item=api.stageNext(backlog,'B',later+index);assert(['practice','review'].includes(item.mode));
  if(item.mode==='practice')assert.equal(item.key,'Q1','beginner reviews only beginner skills');
  finish(backlog,item,later+index);
}
const newLesson=api.stageNext(backlog,'B',later+3);
assert.equal(newLesson.id,'p14');assert.equal(newLesson.mode,'foundation','three reviews cannot starve an unfinished stage node');
finish(backlog,newLesson,later+3);
assert(['practice','review'].includes(api.stageNext(backlog,'B',later+4).mode),'new teaching allows the next bounded review group');
for(const [level,allowed]of [['I',['Q2','Q3']],['A',['Q4','V1']]]){
  const item=api.stageNext(restored,level,later);if(item.mode==='practice')assert(allowed.includes(item.key));
}
// Ordinary relationship words and story names are not card-image instructions.
for(const [id,key,expected] of [['B07','T1',['c02']],['I02','T1',['c10']],['I01','T3',['p08']],['B01','T1',[]],['B01','T3',['p08','c12','m08']]]){
  const unit=api.units[id],step=api.planFor(unit,'learn',{}).find(s=>s.key===key);
  assert.deepEqual(Array.from(api.learningVisual(unit,{},step).cards),expected,id+' '+key+' shows only its authored examples');
}
for(const id of ['I06','A02','A04']){
  const unit=api.units[id],session={unitId:id,mode:'review',index:0},step=api.stepFor(session);
  assert.deepEqual(Array.from(api.learningVisual(unit,session,step).cards),id==='A04'?['p08']:Array.from(unit.cards),id+' revisit retains its referenced case');
}
const repaired={unitId:'B01',mode:'learn',index:3,answers:{},support:{key:'R1',phase:'question'}};
assert.deepEqual(Array.from(api.learningVisual(api.units.B01,repaired,api.stepFor(repaired)).cards),['s11'],'remediation uses its own question example');
console.log('Course routes: 78 cards × 3 stages, 20 integrated methods, prerequisite teaching, legacy evidence and bounded stage reviews passed');
