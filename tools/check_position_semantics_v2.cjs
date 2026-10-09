'use strict';
const assert=require('node:assert/strict');
global.window={};require('../reading-deck.js');require('../card-reference.js');require('../spread-content.js');require('../reading-scenarios.js');
const api=require('../offline-reading.js');
function solarAt(spreadId,index,topic='general',reversed=false){
 const spread=window.TAROT_SPREAD_CONTENT.spreads.find(s=>s.id===spreadId);
 const cards=spread.positions.map((_,i)=>({id:i===index?'m19':'m'+String(i).padStart(2,'0'),reversed:i===index&&reversed}));
 return api.interpret({spreadId,topic,question:'',language:'zh',cards}).positions[index];
}
const present=solarAt('hexagram',1),environment=solarAt('hexagram',4),expectation=solarAt('hexagram',5);
const opening=p=>p.details[0].paragraphs.join(' ');
function reading(spreadId,topic,ids){return api.interpret({spreadId,topic,question:'怎样推进这个项目？',language:'zh',cards:ids.map(id=>({id,reversed:false}))});}
const three=reading('three','general',['p08','m19','m01']);
assert.match(three.overview.text,/主要阻碍是阶段顺利就不再核对细节/,'Short obstacle answer uses the same role as its detail');
assert.match(opening(three.positions[1]),/因为阶段顺利就不再核对细节/);
assert.doesNotMatch(three.overview.text,/主要阻碍是认可已有进展|主要阻碍是坦诚表达/,'Positive state guidance is not presented as an obstacle');
const hexagram=reading('hexagram','career',['m00','p08','m14','m01','p03','m19','m21']);
const whole=hexagram.sections.find(s=>s.title==='整组怎样回答').text;
assert.match(whole,/“期望”的太阳正位指出：你可能期待“清晰、活力、喜悦”/);
assert.match(opening(hexagram.positions[5]),/想得到或担心失去/);
assert.doesNotMatch(whole,/“期望”的太阳正位指出：明确的成果和直接反馈可以帮助团队看清进展/);
const pyramid=reading('lovers-pyramid','love',['c02','m02','s03','m14']);
const pyramidWhole=pyramid.sections.find(s=>s.title==='整组怎样回答').text;
assert.match(pyramidWhole,/“你的期望”的圣杯二正位指出：你可能期待/);
assert.match(pyramidWhole,/“对方的期望”的女祭司正位指出：可借.*探索对方可能看重什么，仍需通过交流确认/);
assert.match(opening(pyramid.positions[1]),/对方可能看重的关系主题/);
assert.ok(pyramidWhole.length<500,'Whole-spread summary stays concise instead of copying card encyclopedia paragraphs');
assert.equal(new Set([present,environment,expectation].map(opening)).size,3,'A shared coarse state role must preserve actual position semantics');
assert.match(opening(environment),/个人之外的条件/);
assert.match(opening(expectation),/想得到或担心失去/);
assert.doesNotMatch(opening(expectation),/认可已有进展|更自信地行动/,'A desire must not become a factual condition or action instruction');
assert.ok(expectation.details.some(b=>b.paragraphs.some(p=>p.includes('主观关注'))),'Actual authored position description is present');
assert.equal(expectation.reading,opening(expectation),'Legacy text and visible scoped interpretation agree');
const obstacle=solarAt('three',1,'career');
assert.match(opening(obstacle),/遗漏/);
assert.ok(obstacle.details.some(b=>b.title==='牌义背景 · 正位'),'General meanings must be explicitly separate from position reasoning');
assert.ok(!obstacle.details.some(b=>b.title==='这张牌为什么这样解'));
const applied=obstacle.details.filter(b=>!b.title.startsWith('牌义背景')).flatMap(b=>b.paragraphs);
assert.equal(applied.filter(p=>p.includes('可避免的遗漏')).length,1,'Identical card-role and domain-obstacle guidance should appear once');
assert.doesNotMatch(applied.join(''),/适合展示成果|更自信地行动/,'Obstacle application must not be a generic positive action recommendation');
const reversed=solarAt('hexagram',5,'general',true);
assert.match(opening(reversed),/太阳逆位/,'Position scope must retain reversal specificity');
assert.ok(opening(reversed).includes(window.TAROT_CARD_REFERENCE.byId.m19.reversed.roles.unknown));
assert.equal(reversed.details.flatMap(b=>b.paragraphs).filter(p=>p===window.TAROT_CARD_REFERENCE.byId.m19.reversed.meaning[0]).length,1,'Background paragraphs are not repeated under a prefixed label');
for(const id of ['lovers-pyramid','gypsy-cross']){
 assert.equal(window.TAROT_READING_SCENARIOS.find(s=>s.spreadId===id).topic,'love');
 assert.equal(window.TAROT_SPREAD_CONTENT.spreads.find(s=>s.id===id).topic,'love');
}
for(const card of Object.values(window.TAROT_CARD_REFERENCE.byId).filter(c=>c.id.startsWith('m'))){
 for(const face of ['upright','reversed'])assert.ok(Object.values(card[face].contexts).every(p=>p.length===1),'Major domain text must not append the old short summary again');
}
console.log('PASS: one Sun has distinct present/environment/expectation readings; obstacle application separated from background; reversed scope, love scenes and major-domain deduplication verified.');
