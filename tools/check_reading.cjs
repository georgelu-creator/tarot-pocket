require('./check_ritual.cjs');
require('./check_reading_quality.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),model={window:{}};
for(const f of ['reading-deck.js','spread-content.js'])vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),model);
const deck=model.window.TAROT_READING_DECK.cards,content=model.window.TAROT_SPREAD_CONTENT;
assert.equal(deck.length,78);assert.equal(new Set(deck.map(c=>c.id)).size,78);
const expected=[...Array.from({length:22},(_,i)=>'m'+String(i).padStart(2,'0')),...['w','c','s','p'].flatMap(s=>Array.from({length:14},(_,i)=>s+String(i+1).padStart(2,'0')))];
assert.deepEqual([...deck.map(c=>c.id)].sort(),expected.sort());
for(const c of deck){assert(c.core&&c.observation&&c.reversed);for(const t of ['love','career','study']){assert(c.questions[t]);for(const k of ['state','tension','advice'])assert(c.contexts[t][k]);}assert.equal(new Set(['love','career','study'].map(t=>c.contexts[t].state)).size,3);}
assert.equal(content.spreads.length,32);assert.equal(content.units.reduce((n,u)=>n+u.steps.length,0),24);
for(const d of content.spreads.filter(d=>d.id!=='daily'&&!d.legacy)){assert(d.bestFor&&d.source?.url&&d.positions.every(p=>p.label&&p.question));assert(new Set(d.positions.map(p=>p.id)).size===d.positions.length);}

console.log("PASS: 78 stable real-card IDs, distinct contextual data, 32 spread definitions, unique position IDs and legacy 24-step content retained; current learning UI is verified by check_academy_v2.");
