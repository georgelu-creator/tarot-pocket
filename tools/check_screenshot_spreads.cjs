'use strict';
// Authored application variants, not a claim to reproduce private miniapp rules.
const assert = require('node:assert/strict');
global.window = {};
for (const name of ['reading-deck','card-reference','spread-content','reading-scenarios']) require('../'+name+'.js');
const offline = require('../offline-reading.js');
const {loadCatalog, validateReading, buildPrompt, promptSelection} = require('../server/reading-service.cjs');
const prompts = require('../server/reading-prompts.cjs');
const catalog = loadCatalog();
const definitions = [
 ['sc34','crush-three','love','16',['我的期待','对方呈现的态度','靠近的方式'],['state','unknown','advice']],
 ['sc35','hidden-attitude-three','love','17',['表面表达','待确认的态度','互动中的落差'],['state','unknown','tension']],
 ['sc36','love-triangle','love','18',['我的关系需要','对方可能的需要','协调彼此的方式'],['state','unknown','advice']],
 ['sc37','reunion-four','love','19',['目前的联系','尚未解决的问题','修复所需的条件','重新开始的趋势'],['state','tension','resource','trend']],
 ['sc38','separation-four','love','20',['关系现况','主要困难','继续所需面对的事','结束所需面对的事'],['state','tension','trend','trend']],
 ['sc39','crisis-four','love','21',['眼前的局面','核心卡点','可用的支持','先做的一步'],['state','tension','resource','advice']],
 ['sc40','lost-object-three','life','22',['最后使用的情境','容易漏查的环节','下一步寻找办法'],['past','tension','advice']]
];
assert.equal(catalog.scenarios.size,40);
assert.deepEqual([...catalog.scenarios.keys()],Array.from({length:40},(_,i)=>'sc'+String(i+1).padStart(2,'0')),'retain every original ID and append seven unique IDs');
assert.equal([...catalog.spreads.values()].filter(s=>!s.legacy).length,28);
assert.equal([...catalog.spreads.values()].filter(s=>s.legacy).length,19);
const deck = window.TAROT_READING_DECK.cards;
const sampleCards = n => deck.slice(0,n).map((c,i)=>({id:c.id,reversed:i%2===1}));
let applications = 0;
for (const [sceneId,spreadId,category,module,labels,roles] of definitions) {
 const scene=catalog.scenarios.get(sceneId), spread=catalog.spreads.get(spreadId);
 assert.equal(scene.spreadId,spreadId);assert.equal(scene.category,category);assert.equal(spread.readingMode,spreadId);
 assert.deepEqual(spread.positions.map(p=>p.label),labels);assert.deepEqual(spread.positions.map(p=>p.role),roles);
 assert.equal(spread.positions.length,spread.layoutPositions.length);
 assert.equal(new Set(spread.layoutPositions.map(p=>p.x+','+p.y)).size,labels.length);
 assert.ok(spread.layoutPositions.every(p=>p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1));
 assert.ok(spread.variant.includes('原创')&&spread.source.note.includes('不复制'));
 assert.ok(spread.positions.every(p=>p.description.length>=60&&p.scope),'every adopted position has substantial authored semantics');
 for (const question of ['',scene.question]) {
  const r=offline.interpret({spreadId,topic:scene.topic,language:'zh',question,cards:sampleCards(labels.length)});
  assert.equal(r.positions.length,labels.length);assert.equal(r.display,question?'summary':'positions');
  assert.deepEqual(r.positions.map(p=>p.positionLabel),labels);assert.equal(r.sections.length,1);
  assert.ok(r.sections[0].cardIds.length===labels.length,'whole-spread links use all actual cards');
  assert.doesNotMatch(JSON.stringify(r),/undefined|磁场频率为|失物在(?:东方|西方|南方|北方)|对方一定喜欢你/);
 }
 for (const withScene of [true,false]) {
  const validated=validateReading({spreadId,topic:scene.topic,language:'zh',question:scene.question,cards:sampleCards(labels.length),...(withScene?{scenarioId:sceneId,sceneVersion:'1'}:{})},catalog);
  const prompt=buildPrompt(validated);
  assert.equal(promptSelection(validated).scene,module,'scene or standalone spread selects its exact module');
  assert.ok(prompt.instructions.includes(prompts.scenes[module]));
  for (const p of spread.positions) for (const value of [p.label,p.question,p.description,p.scope])assert.ok(prompt.input.includes(value),'trusted AI input retains actual position '+p.id);
  assert.ok(prompt.instructions.endsWith(prompts.riskBoundary));
 }
 for(let position=0;position<labels.length;position++)for(const card of deck)for(const reversed of [false,true]) {
  const fillers=deck.filter(c=>c.id!==card.id).slice(0,labels.length-1);let index=0;
  const cards=labels.map((_,i)=>({id:i===position?card.id:fillers[index++].id,reversed:i===position&&reversed}));
  const r=offline.interpret({spreadId,topic:scene.topic,language:'zh',question:'',cards});
  const target=r.positions[position], text=target.details.flatMap(b=>b.paragraphs).join('');
  assert.equal(target.cardId,card.id);assert.equal(target.orientation,reversed?'reversed':'upright');
  assert.equal(target.positionRole,roles[position]);
  assert.ok(target.details.some(b=>b.paragraphs.includes(spread.positions[position].description)),spreadId+' position connection');
  const meaning=window.TAROT_CARD_REFERENCE.byId[card.id][reversed?'reversed':'upright'].meaning;
  assert.ok(meaning.every(p=>text.includes(p)),spreadId+' full direction-specific meaning for '+card.id);
  assert.ok(text.length>=240,spreadId+' detailed application '+card.id);
  assert.doesNotMatch(text,/undefined|NaN/);
  applications++;
 }
}
function sunAt(id,index){const s=catalog.spreads.get(id);const cards=s.positions.map((_,i)=>({id:i===index?'m19':'m'+String(i).padStart(2,'0'),reversed:false}));return offline.interpret({spreadId:id,topic:s.topic,question:'',language:'zh',cards}).positions[index].details[0].paragraphs.join('');}
assert.notEqual(sunAt('separation-four',2),sunAt('separation-four',3),'two trend roles retain different continue/separate path meanings');
assert.match(sunAt('separation-four',2),/继续相处/);assert.match(sunAt('separation-four',3),/结束关系/);
assert.equal(new Set([0,1,2].map(i=>sunAt('lost-object-three',i))).size,3,'same card has distinct memory/overlooked/next-search tasks');
assert.match(prompts.scenes['18'],/不表示三个人/);assert.match(prompts.scenes['22'],/不能.*磁场频率/);
const s=catalog.spreads.get('crisis-four');const risk=offline.interpret({spreadId:s.id,topic:'love',language:'zh',question:'他刚刚打了我，我要回去吗？',cards:sampleCards(4)});
assert.ok(risk.safety,'danger overrides authored crisis mode');assert.ok(risk.positions.every(p=>p.details.length===0));
const mismatch=buildPrompt(validateReading({spreadId:'lost-object-three',topic:'life',question:'这次面试能拿到录用吗？',language:'zh',cards:sampleCards(3)},catalog));
assert.match(mismatch.instructions,/不能改名成感情、工作或考试的结果位/);
console.log(`PASS: seven explicitly authored screenshot-purpose variants, 40 stable scenes, 28 active/19 legacy spreads, ${applications} orientation/card/position applications, exact AI modules and trusted positions, no-question detail, path distinction and danger/mismatch boundaries. Mock only.`);
