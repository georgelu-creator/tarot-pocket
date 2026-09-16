/* Isolated learner journeys: no personal storage, provider calls, or credentials. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),http=require('node:http');
const {chromium}=require('playwright');
const legacyJourney=require('./legacy_journey_fixture.cjs');
const root=path.resolve(__dirname,'..'),context={window:{}};
for(const file of ['reading-deck.js','curriculum-content.js','journey.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),context);
const api=context.window.TarotJourney,deck=Object.fromEntries(context.window.TAROT_READING_DECK.cards.map(x=>[x.id,x])),lessons=context.window.TAROT_CURRICULUM.cards;
let variants=0;
for(const c of Object.values(deck))for(const topic of ['career','love','study'])for(const position of ['state','tension','advice']){
 const l=lessons.find(x=>x.id===c.id),s={topic,position,playVersion:3,variant:0};
 const link=api.makeStep('meaning',c,l,deck,s),match=api.makeStep('compare',c,l,deck,s);
 assert.equal(link.kind,'link');assert.equal(link.evidence.length,3);assert.equal(link.options.length,4);
 assert.equal(link.evidence.find(x=>x.id==='yes').text,c.observation);assert.equal(link.options.find(x=>x.id==='yes').text,c.core);
 assert.equal(match.kind,'match');assert.equal(match.pairs.length,2);assert.equal(new Set(match.pairs.map(x=>x.text)).size,2);
 for(const p of match.pairs)assert.equal(p.text,deck[p.id].core);
 for(const legacy of [undefined,2]){const old=api.makeStep('meaning',c,l,deck,{...s,playVersion:legacy});assert.equal(old.kind,undefined);assert.equal(old.options.find(x=>x.id==='yes').text,c.core);}
 variants++;
}
// Legacy data checks above remain unchanged. The visible product now uses
// academy courses: self-rating and forced unfamiliar-card comparison were retired
// by explicit user requirements, so their UI coverage is replaced below.
require('./check_academy_v2.cjs').checkModel();
console.log(JSON.stringify({status:'PASS',legacyContexts:variants,checks:['preserved v1-v3 stored question meanings','current 98-unit authored question and restore contract']}));
