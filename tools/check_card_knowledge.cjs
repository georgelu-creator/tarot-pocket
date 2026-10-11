/* Validate editorial coverage and safe cross-platform reuse, without changing progress. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),sandbox={window:{}};
for(const name of ['reading-deck.js','card-reference.js','card-knowledge.js','academy-content.js','academy.js'])vm.runInNewContext(fs.readFileSync(path.join(root,name),'utf8'),sandbox,{filename:name});
const {TAROT_CARD_KNOWLEDGE:knowledge,TAROT_READING_DECK:deck,TarotAcademy:academy}=sandbox.window;
const ids=Array.from(deck.cards,c=>c.id),seen=new Map(),lengths=[];
assert.deepEqual(Object.keys(knowledge.byId).sort(),ids.slice().sort());
function prose(text,label){assert.equal(typeof text,'string',label);assert(text.trim().length>20,label+' is substantive');assert(!/[<>]/.test(text),label+' contains plain text');}
for(const id of ids){
 const k=knowledge.byId[id];assert.equal(k.id,id);prose(k.structure,id+' structure');
 assert.equal(k.nuances.length,2);k.nuances.forEach(t=>prose(t,id+' nuance'));
 assert.equal(k.reversedBranches.length,3);assert.equal(new Set(k.reversedBranches.map(x=>x.title)).size,3);k.reversedBranches.forEach(x=>prose(x.text,id+' reversal '+x.title));
 assert.deepEqual(Object.keys(k.domains).sort(),['career','life','love','money','study']);
 for(const [domain,faces]of Object.entries(k.domains)){assert.deepEqual(Object.keys(faces).sort(),['reversed','upright']);assert.notEqual(faces.upright,faces.reversed,id+' '+domain+' differentiated');for(const text of Object.values(faces))prose(text,id+' '+domain);}
 assert.equal(k.comparisons.length,2);assert.equal(new Set(k.comparisons.map(x=>x.id)).size,2);for(const x of k.comparisons){assert(ids.includes(x.id)&&x.id!==id);prose(x.text,id+' comparison');}
 assert.equal(k.examples.length,2);for(const x of k.examples){prose(x.situation,id+' example situation');prose(x.reading,id+' example reasoning');}
 prose(k.history.text,id+' historical note');assert(k.sources.some(s=>s.url===k.history.source),id+' history has a matching source');
 for(const s of k.sources){assert.equal(new URL(s.url).protocol,'https:');assert(s.title&&s.scope);}
 for(const key of ['foundation','application','reversal','integration']){prose(k.learning[key].text,id+' '+key);assert(k.learning[key].title);}
 for(const [mode,keys]of [['foundation',['T1']],['application',['T2','T3']],['integration',['T4']]]){
  const unit=academy.units[id],plan=academy.planFor(unit,mode);
  for(const key of keys){const step=plan.find(s=>s.key===key);assert(step);assert(academy.knowledgeLesson(knowledge,id,step)?.text,id+' '+mode+' rendered insight');}
  assert.equal(academy.knowledgeLesson(knowledge,id,plan.find(s=>s.kind==='question')),null,'No reference dump in questions');
 }
 assert.equal(academy.knowledgeLesson(knowledge,id,{kind:'teach',key:'T1',support:true}),null,'Repair retains its own focused teaching');
 const texts=[k.structure,...k.nuances,...k.reversedBranches.map(x=>x.text),...Object.values(k.domains).flatMap(Object.values),...k.comparisons.map(x=>x.text),...k.examples.flatMap(x=>[x.situation,x.reading]),k.history.text];
 for(const text of texts){assert(!seen.has(text),id+' duplicates '+seen.get(text));seen.set(text,id);}
 lengths.push(texts.reduce((sum,t)=>sum+t.length,0));
}
console.log(`PASS: 78 detailed articles; 156 contrasts; 156 original cases; 780 orientation-specific domains; 312 stage excerpts. New reference prose ${Math.min(...lengths)}–${Math.max(...lengths)} characters per card.`);
