const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createTelemetry}=require('../server/telemetry.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tarot-analytics-'));
let stamp=Date.parse('2026-10-01T10:00:00Z');
const t=createTelemetry({file:path.join(dir,'events.sqlite'),secret:'test-only-secret',adminToken:'test-only-admin',now:()=>stamp});
const event=(visitor,name='page_view',page='home',props={})=>({name,page,props,visitorId:visitor.padEnd(20,'x'),sessionId:visitor.padEnd(20,'y')});
try{
 assert.equal(t.recordFeedback({question:'未经同意',consent:false,consentVersion:'query-feedback-1'}),null);
 assert.equal(t.recordFeedback({question:'x',consent:true,consentVersion:'query-feedback-1',cards:[]}),null);
 const receipt=t.recordFeedback({question:'<script>虚构测试问题</script>',consent:true,consentVersion:'query-feedback-1'});
 assert(receipt?.deletionToken);assert(!JSON.stringify(t.summary()).includes(receipt.deletionToken));
 assert.equal(t.deleteFeedback(receipt.id,'bad-token'),false);
 assert.equal(t.summary().feedback[0].question,'<script>虚构测试问题</script>');
 assert.equal(t.deleteFeedback(receipt.id,receipt.deletionToken),true);assert.equal(t.summary().feedback.length,0);
 t.record(event('a'));t.record(event('b'));t.record(event('a','feature_click','courses',{feature:'guided'}));
 t.record(event('a','screen_view','courses'));t.record(event('a','screen_exit','courses',{duration:'20'}));
 stamp+=86400000;t.record(event('a'));stamp+=86400000;
 let data=t.summary();assert.deepEqual(data.retention[0],{day:1,eligible:2,returned:1,rate:50});assert.equal(data.retention[1].eligible,0);
 assert.equal(data.features[0].feature,'guided');assert(data.paths.length);assert(data.exits.length);
 assert.equal(t.record({...event('a'),props:{question:'private'}}),false);
 const stale=t.recordFeedback({question:'到期应删除',consent:true,consentVersion:'query-feedback-1'});
 stamp+=30*86400000;assert.equal(t.summary(90).feedback.length,0);assert.equal(t.deleteFeedback(stale.id,stale.deletionToken),false);
 // The 30-day cohort must remain measurable inside the 90-day event retention window.
 const cohort=event('cohort');t.record(cohort);stamp+=30*86400000;t.record(cohort);stamp+=86400000;
 assert(t.summary(30).retention[2].eligible>=1);assert.equal(t.summary(30).retention[2].returned,1);
 // Cross-month identity is stable, so exact-day return is measurable.
 t.record(event('month'));stamp+=86400000;t.record(event('month'));stamp+=86400000;
 assert(t.summary().retention[0].returned>=1);
 console.log('PASS: explicit consent, revocation, 30-day expiry, no query telemetry, mature cohorts, cross-month retention and behavior paths');
}finally{t.close();fs.rmSync(dir,{recursive:true,force:true});}
