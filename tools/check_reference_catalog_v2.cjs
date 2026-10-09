'use strict';
const assert = require('node:assert/strict');
global.window = {};
require('../card-reference.js');
require('../spread-content.js');
require('../reading-scenarios.js');
const cards=Object.values(window.TAROT_CARD_REFERENCE.byId);
assert.equal(cards.length,78);
const authored=[];
for(const card of cards){
 assert.equal(card.version,'reference-2');
 assert.ok(card.encyclopedia.imageReading.length>=3,card.id);
 for(const direction of ['upright','reversed']){
  const p=card[direction].meaning;
  assert.ok(p.length>=2,card.id+direction);
  assert.ok(p[0].length>=55&&p[1].length>=55,card.id+direction+' needs substantive paragraphs');
  authored.push(...p.slice(0,2));
  if(card.id.startsWith('m')) {
   assert.ok(p.join('').length>=300,card.id+direction+' requires developed core explanation');
   assert.ok(Object.values(card[direction].contexts).flat().join('').length>=300,card.id+direction+' requires distinct domain explanations');
  }
 }
}
assert.equal(new Set(authored).size,312,'New paragraphs must be card-specific, not repeated boilerplate');
const spreads=window.TAROT_SPREAD_CONTENT.spreads;
assert.equal(new Set(spreads.map(s=>s.id)).size,spreads.length);
for(const id of ['sacred-triangle','diamond','lovers-pyramid','gypsy-cross','hexagram','self-exploration','mind-body-spirit']){
 const s=spreads.find(s=>s.id===id);assert.ok(s&&!s.legacy,id);
 assert.equal(s.layoutPositions.length,s.positions.length,id);
 assert.equal(new Set(s.layoutPositions.map(p=>p.x+','+p.y)).size,s.positions.length,id+' overlap');
 assert.ok(s.layoutPositions.every(p=>p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1),id);
 assert.ok(s.source.url.startsWith('https://'));assert.ok(s.variant&&s.readingTip);
}
assert.deepEqual(spreads.find(s=>s.id==='sacred-triangle').positions.map(p=>p.role),['past','state','outcome']);
assert.deepEqual(spreads.find(s=>s.id==='hexagram').positions.map(p=>p.label),['过去','现况','未来','指引','环境','期望','结果']);
assert.ok(spreads.find(s=>s.id==='open-five').positions.every(p=>p.role==='free'));
assert.equal(spreads.find(s=>s.id==='open-five').positions.length,5);
assert.equal(spreads.find(s=>s.id==='choice').positions.length,6,'Legacy six-card choice must not change');
console.log('PASS: 78 deep references, 312 distinct authored paragraphs, 8 new sourced/mode definitions, geometry and legacy roles preserved.');
