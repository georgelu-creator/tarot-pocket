/* Current guided-course contract. Uses synthetic records, never private progress. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {chromium}=require('playwright');
const legacyJourney=require('./legacy_journey_fixture.cjs');
const root=path.resolve(__dirname,'..'),model={window:{}};
for(const n of ['reading-deck.js','curriculum-content.js','guided-major.js','guided-minor.js','guided-learning.js','journey.js'])vm.runInNewContext(fs.readFileSync(path.join(root,n),'utf8'),model);
const guided=model.window.TarotGuided,api=model.window.TarotJourney,deck=Object.fromEntries(model.window.TAROT_READING_DECK.cards.map(c=>[c.id,c])),lessons=Object.fromEntries(model.window.TAROT_CURRICULUM.cards.map(c=>[c.id,c])),authored=guided.cards();
assert.equal(Object.keys(authored).length,78,'every freely selectable card needs the new authored course');
assert.deepEqual(Object.keys(authored).sort(),Object.keys(deck).sort());
for(const c of Object.values(authored)){
 assert(typeof c.observe==='string'&&c.observe.trim(),c.id+' observation instruction');assert(typeof c.recall==='string'&&c.recall.trim(),c.id+' recall cue');
 for(const field of ['core','why','anchor'])assert(typeof c.plain?.[field]==='string'&&c.plain[field].trim(),c.id+' plain '+field);
 assert.equal(c.reason.options.find(o=>o.id==='yes').text,c.plain.core,c.id+' correct choice matches the authored meaning');assert.equal(c.reason.options.find(o=>o.id==='yes').feedback,c.plain.why,c.id+' feedback connects the scene to the meaning');
 for(const topic of ['career','love','study'])for(const role of ['state','tension','advice'])assert(typeof c.plain.contexts?.[topic]?.[role]==='string'&&c.plain.contexts[topic][role].trim(),c.id+'/'+topic+'/'+role);
 for(const q of [c.reason,c.reversal]){assert(typeof q.prompt==='string'&&q.prompt.trim(),c.id+' question');assert.equal(q.options.length,3);assert.deepEqual(Array.from(q.options,x=>x.id),['yes','near','over']);assert.equal(new Set(q.options.map(x=>x.text)).size,3);for(const o of q.options){assert(typeof o.text==='string'&&o.text.trim(),c.id+' option');assert(typeof o.feedback==='string'&&o.feedback.trim(),c.id+' explanation');assert(!Object.values(deck).some(x=>x.name===o.text),'no card-name recognition choices');}}
 assert(typeof c.reversal.context==='string'&&c.reversal.context.trim(),c.id+' needs a situation to distinguish possible reversals');
}
assert.equal(new Set(Object.values(authored).map(c=>c.reason.prompt)).size,78,'card-specific reasoning, not one generic quiz template');
assert.equal(new Set(Object.values(authored).map(c=>c.reversal.context)).size,78);
let contexts=0;
for(const c of Object.values(deck))for(const topic of ['career','love','study'])for(const part of [0,1]){
 const step=guided.makeStep('application',c,lessons[c.id],deck,{topic,guided:{part}});
 assert.equal(step.role,part?'advice':'tension');assert.equal(step.prompt,c.questions[topic]);assert.equal(step.options,undefined,'open contextual readings must not manufacture an exclusive correct answer');assert(c.contexts[topic][step.role].length>10);contexts++;
}
const sample={version:1,cards:{m02:{introducedAt:1,lastAt:1,rounds:0,skills:{},reflections:{recall:'synthetic memory sentence'}}},paused:{},session:{cardId:'m02',mode:'new',steps:['intro','image','meaning','compare','application','reversal','recall'],index:4,seed:30,topic:'career',position:'advice',startedAt:1,answers:{image:{selected:'yes',grade:4,correct:true,hint:false},meaning:{selected:'yes',grade:4,correct:true,hint:false},compare:{selected:'self-3',grade:3,correct:true,hint:false}},playVersion:4,variant:0,inspected:true,guided:{key:'application',part:1,selected:'',attempts:[{selected:'self-2',correct:false,hint:false}],marks:[],note:'synthetic note',compareSeen:false}}};
const restored=api.validate(sample,Object.keys(deck));assert.equal(restored.session.guided.part,1);assert.equal(restored.session.guided.attempts[0].correct,false);assert.equal(restored.cards.m02.reflections.recall,'synthetic memory sentence');assert.deepEqual(api.validate(restored,Object.keys(deck)),restored,'validated new records are idempotent, with every field checked');
assert.equal(restored.session.playVersion,5);assert.deepEqual(Array.from(restored.session.steps),['intro','image','meaning','application','reversal','recall']);assert.equal(restored.session.index,3);assert.equal(restored.session.answers.compare.grade,3,'historic comparison evidence stays in the backup');
const atComparison=JSON.parse(JSON.stringify(sample));atComparison.session.index=3;atComparison.session.hint=true;delete atComparison.session.answers.compare;atComparison.session.guided={key:'compare',compareSeen:true,note:'unfinished historical comparison note'};const migratedComparison=api.validate(atComparison,Object.keys(deck));assert.equal(migratedComparison.session.steps[migratedComparison.session.index],'application');assert.equal(migratedComparison.session.guided.key,'application');assert.equal(migratedComparison.session.hint,false,'a retired task hint does not mark the next task as assisted');assert.equal(migratedComparison.cards.m02.reflections.compare,'unfinished historical comparison note');assert.equal(migratedComparison.session.answers.compare,undefined,'skipping a retired task never manufactures a grade');assert.deepEqual(migratedComparison.cards,api.validate(atComparison,Object.keys(deck)).cards);
const missingPresentation=JSON.parse(JSON.stringify(sample));missingPresentation.session.index=1;delete missingPresentation.session.guided;assert.equal(api.validate(missingPresentation,Object.keys(deck)).session.guided.selected,'yes','committed answer recovers presentation without scoring again');
const missingEarlier=JSON.parse(JSON.stringify(sample));delete missingEarlier.session.answers.image;const repaired=api.validate(missingEarlier,Object.keys(deck));assert.equal(repaired.session.index,1);assert.equal(repaired.session.guided.key,'image','repaired index and guided state must agree');
if(process.env.GUIDED_MODEL_ONLY==='1'){console.log(JSON.stringify({status:'PASS',cards:78,contexts}));process.exit(0);}
// Legacy data checks above remain unchanged. The visible product now uses
// academy courses: self-rating and forced unfamiliar-card comparison were retired
// by explicit user requirements, so their UI coverage is replaced below.
require('./check_academy_v2.cjs').checkUI('motion').catch(e=>{console.error(e);process.exitCode=1;});
