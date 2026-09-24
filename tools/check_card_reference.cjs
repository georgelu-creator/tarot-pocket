/* Full authored corpus contract: keep all card/face/role data available offline. */
const assert=require('node:assert/strict');
global.window={};require('../reading-deck.js');require('../card-reference.js');
const reference=window.TAROT_CARD_REFERENCE.byId,expected=window.TAROT_READING_DECK.cards.map(c=>c.id);
assert.deepEqual(Object.keys(reference).sort(),expected.sort());
const roles=['state','tension','advice','past','trend','outcome','resource','unknown','choice','free'],messages=new Set();
for(const id of expected){const r=reference[id];assert.equal(r.id,id);assert(r.core.length>40,id+' core');assert(r.observation.length>15);assert(r.symbols.length>0);assert(reference[r.comparison.id],id+' comparison target');assert(r.comparison.text.length>20);assert(r.misread.length>15);
 for(const face of ['upright','reversed']){const v=r[face];assert(!messages.has(v.message),'Unique authored message '+id);messages.add(v.message);assert(v.meaning.length>=3);assert(v.meaning.some(x=>x.length>=50),id+' '+face+' explanatory paragraph');for(const role of roles)assert(v.roles[role]?.length>10,id+' '+face+' '+role);for(const topic of ['love','career','study','life'])assert(v.contexts[topic]?.length>0,id+' '+topic);assert(['yes','no'].includes(v.yesNo));assert(v.yesNoReason.length>15);}
 for(const face of ['upright','reversed']){
  const roles=r[face].roles;
  assert.notEqual(roles.resource,roles.advice,id+' '+face+' support is not an instruction');
  assert.notEqual(roles.unknown,roles.advice,id+' '+face+' unknown factors are not instructions');
  assert.notEqual(roles.unknown,roles.resource,id+' '+face+' role meanings remain distinct');
  for(const [role,text] of Object.entries(roles))assert(!/岗位|项目|团队|交付|文档|领导力|同事|工作判断|工作边界|家务|理想家庭|关系推进/.test(text),id+' '+face+' '+role+' must work across domains');
 }
 assert.notDeepEqual(r.upright.meaning,r.reversed.meaning);assert.notDeepEqual(r.upright.contexts,r.reversed.contexts);
 assert(!/学习|学业|同学/.test(r.upright.roles.resource)||['p08','p11','m05'].includes(id),id+' resource must not import unrelated study context');
}
assert.equal(reference.m19.reversed.yesNo,'yes','Reversal is not automatic No');assert.equal(reference.s04.upright.yesNo,'no','Upright is not automatic Yes');
assert.equal(reference.c05.reversed.yesNo,'yes');assert(!/也可能|或/.test(reference.c05.reversed.yesNoReason),'Default Yes rationale must explain the supported positive interpretation');
console.log('PASS: 78 independent references, 156 distinct messages, substantive orientation explanations, all roles/domains, valid comparisons and content-based Yes/No tendencies.');
