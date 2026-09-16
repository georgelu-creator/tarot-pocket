const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const model = {window:{}};
for(const f of ['content.js','learning-content.js'])vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),model);
const units=model.window.TAROT_LEARNING.units;
const cards=new Set(model.window.TAROT_CONTENT.cards.map(c=>c.id));
const ids=new Set();
for(const unit of units){
  assert(unit.cardIds.every(id=>cards.has(id)));
  for(const s of unit.steps){
    assert(!ids.has(s.id));ids.add(s.id);
    assert(s.title&&s.prompt&&s.feedback&&s.dimension);
    assert((s.cardIds||[]).every(id=>cards.has(id)));
    if(s.options){assert(s.options.every(o=>o.id&&o.text&&o.why));assert.equal(new Set(s.options.map(o=>o.id)).size,s.options.length);}
    if(['choice','observe','reason'].includes(s.kind))assert(s.options.some(o=>o.id===s.correct));
    if(s.kind==='reason')assert(s.evidenceOptions.some(o=>o.id===s.evidenceCorrect)&&s.evidenceOptions.every(o=>o.why));
    if(s.kind==='arrange')assert.equal(new Set(s.correctOrder).size,3);
    if(s.kind==='recall')assert(s.points.length>=2);
  }
}
assert.equal(ids.size,32);
// Legacy data checks above remain unchanged. The visible product now uses
// academy courses: self-rating and forced unfamiliar-card comparison were retired
// by explicit user requirements, so their UI coverage is replaced below.
require('./check_academy_v2.cjs').checkUI('core').catch(e=>{console.error(e);process.exitCode=1;});
