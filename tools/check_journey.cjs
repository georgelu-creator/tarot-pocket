const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {chromium}=require('playwright');
const legacyJourney=require('./legacy_journey_fixture.cjs');
const root=path.resolve(__dirname,'..'),model={window:{}};
for(const file of ['reading-deck.js','curriculum-content.js','guided-major.js','guided-minor.js','guided-learning.js','journey.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),model);
const api=model.window.TarotJourney,deck=Object.fromEntries(model.window.TAROT_READING_DECK.cards.map(c=>[c.id,c])),lessons=model.window.TAROT_CURRICULUM.cards;
const DAY=86400000,epoch=1800000000000;
let memory=api.rate(null,4,epoch);assert.equal(memory.interval,1);assert.equal(memory.passes,0);
const same=api.rate(memory,5,epoch+1000);assert.equal(same.interval,1);assert.equal(same.passes,0,'same-day recognition must not count as delayed retention');
memory=api.rate(memory,4,epoch+DAY);assert.equal(memory.interval,6);assert.equal(memory.passes,1);
memory=api.rate(memory,4,epoch+7*DAY);assert.equal(memory.interval,15);
memory=api.rate(memory,2,epoch+22*DAY);assert.equal(memory.interval,1);assert.equal(memory.reps,0);assert.equal(api.level({rounds:4,skills:{meaning:memory}}),'待巩固');
const exposure=api.rate(api.rate(null,4,epoch),4,epoch+23*60*60*1000);
assert.equal(api.rate(exposure,4,epoch+DAY+1000).passes,0,'recent practice prevents delayed recall credit');
const lapse=api.rate({ef:2.5,reps:3,interval:15,last:epoch,due:epoch+DAY,passes:2,lapses:0,grade:4},2,epoch+2*DAY);
const retry=api.rate(lapse,4,epoch+2*DAY+1000);assert.equal(retry.grade,2);assert.equal(api.level({rounds:5,skills:{application:retry,recall:{passes:3,grade:4,reps:3}}}),'待巩固');
assert.throws(()=>api.validate({version:1,cards:{},session:{cardId:'p04',seed:1,steps:['image'],index:0}},Object.keys(deck)));
const blank=api.validate(null,Object.keys(deck));assert.equal(Object.keys(blank.cards).length,0);
let questionCount=0;
for(const lesson of lessons){const card=deck[lesson.id];
 for(const topic of ['love','career','study'])for(const position of ['state','tension','advice'])for(const kind of api.skills.filter(x=>x!=='recall'))for(const variant of [-1,0,1,2]){
   const step=api.makeStep(kind,card,lesson,deck,{topic,position,...(variant>=0?{playVersion:2,variant}:{})});
   assert(step.options.some(x=>x.id===step.correct),`${card.id}/${kind} answer exists`);
   assert.equal(new Set(step.options.map(x=>x.id)).size,step.options.length);
   assert.equal(new Set(step.options.map(x=>x.text)).size,step.options.length,`${card.id}/${kind} unique alternatives`);
   assert(step.explanation.length>15);if(kind==='application')assert.equal(step.kind==='place'?step.statement:step.options.find(x=>x.id===step.correct).text,card.contexts[topic][position]);questionCount++;
 }
}
console.log(JSON.stringify({status:'PASS',model:'SM-2 intervals, lapse reset, same-day guard, 78 full card plans across 9 contexts',questionsChecked:questionCount}));
// Recommendation, due-review separation, and legacy session validation use the
// actual bridge, with no browser storage or random first-card assumptions.
let journeyData=api.blank(),destination='',clockAt=epoch;
model.document={addEventListener(){}};
model.structuredClone=structuredClone;
const journey=api.create({esc:x=>x,img:()=>'',icon:()=>'',go:x=>{destination=x;},toast:()=>{},now:()=>clockAt,cardMap:deck,get:()=>journeyData,set:x=>{journeyData=x;}});
assert.equal(journey.unlearned().length,78);
journey.new();const firstId=journeyData.session.cardId;
assert.equal(journeyData.session.playVersion,5);assert.equal(journeyData.session.mode,'new');assert.equal(journey.unlearned().length,77);
journeyData.session.index=1;journey.start();assert.equal(journeyData.session.cardId,firstId);assert.equal(journeyData.session.index,1);
journey.new();assert.notEqual(journeyData.session.cardId,firstId);assert(journeyData.paused[firstId]);
journey.start(firstId);assert.equal(journeyData.session.index,1);assert.equal(journeyData.session.playVersion,5);
journeyData.cards[firstId].rounds=1;journeyData.cards[firstId].skills.meaning=api.rate(null,4,epoch-DAY);journeyData.session.complete=true;
assert(journey.due().includes(firstId));assert.notEqual(journey.recommendation(),firstId);journey.new();assert.equal(journeyData.session.mode,'new');journey.review();assert.equal(journeyData.session.cardId,firstId);assert.equal(journeyData.session.mode,'review');
const migrated=api.validate(journeyData,Object.keys(deck));assert.equal(migrated.session.playVersion,5);
delete journeyData.session.playVersion;delete journeyData.session.variant;assert.equal(api.validate(journeyData,Object.keys(deck)).session.playVersion,undefined,'old question semantics must remain unchanged');
for(const id of Object.keys(deck))journeyData.cards[id]||={introducedAt:epoch,lastAt:epoch,rounds:0,skills:{}};
assert.equal(journey.unlearned().length,0);assert.equal(journey.recommendation(),null);journey.new();assert.equal(destination,'library');
const bridge={esc:x=>x,img:()=>'',icon:()=>'',go:()=>{},toast:()=>{},now:()=>epoch,cardMap:deck,get:()=>api.blank(),set:()=>{}};
model.Math=Object.create(Math);model.Math.random=()=>0;
const alternateA=api.create(bridge).recommendation();model.Math.random=()=>0.999999;
const alternateB=api.create(bridge).recommendation();assert.notEqual(alternateA,alternateB,'new-card recommendations must not have a fixed prefix');
if(process.env.JOURNEY_MODEL_ONLY==='1')process.exit(0);
// Legacy data checks above remain unchanged. The visible product now uses
// academy courses: self-rating and forced unfamiliar-card comparison were retired
// by explicit user requirements, so their UI coverage is replaced below.
require('./check_academy_v2.cjs').checkModel();
console.log(JSON.stringify({status:'PASS',checks:['legacy intervals and session migration preserved','current authored courses use choices not self ratings','bounded remediation and restore across 98 units']}));
