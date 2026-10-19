'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {DatabaseSync}=require('node:sqlite');
const {createTelemetry}=require('../server/telemetry.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tarot-query-analysis-')),file=path.join(dir,'test.sqlite');
let now=Date.parse('2026-10-19T05:00:00Z');
const legacy=new DatabaseSync(file);legacy.exec('CREATE TABLE query_feedback(id TEXT PRIMARY KEY,occurred_at INTEGER NOT NULL,question TEXT NOT NULL,deletion_hash TEXT NOT NULL,consent_version TEXT NOT NULL)');legacy.prepare('INSERT INTO query_feedback VALUES(?,?,?,?,?)').run('old-consented',now-86400000,'历史合成反馈：怎样开始画画？','not-a-token','query-feedback-1');legacy.close();
const telemetry=createTelemetry({file,secret:'synthetic-query-secret',adminToken:'synthetic-admin',now:()=>now});
try{
 const schema=new DatabaseSync(file);assert.equal(schema.prepare('PRAGMA table_info(query_feedback)').all().length,5,'original five-column schema remains rollback-compatible');schema.close();
 const make=(question,source='ai',spread='one',topic='study')=>({question,consent:true,consentVersion:'query-analysis-2',context:{source,spread,topic}});
 for(const bad of [{...make('合成'),consent:false},{...make('合成'),context:undefined},{...make('合成'),context:{source:'ai',spread:'one',topic:'study',cards:['private']}},{...make('合成'),context:{source:'ai',spread:'made-up',topic:'study'}},{...make('合成'),context:{source:'ai',spread:'one',topic:'arbitrary'}},{...make('合成'),visitorId:'must-not-link'},{question:'合成',consent:true,consentVersion:'query-feedback-1',context:{source:'ai'}}])assert.equal(telemetry.recordFeedback(bad),null,'reject invalid or unconsented metadata');
 const receipt=telemetry.recordFeedback(make('合成问题：如何安排练习？'));assert(receipt);
 telemetry.recordFeedback(make('合成问题：如何安排练习？','feedback','one','study'));
 now+=86400000;const second=telemetry.recordFeedback(make('合成问题：如何安排练习？','ai','one','study'));assert(second);
 const get=(module='all',from='2026-10-18',to='2026-10-20')=>telemetry.summary(7,{from,to,module});
 let metrics=get(),q=metrics.queryAnalysis;assert.equal(q.scope,'consented-only');assert.equal(q.total,4);assert.equal(q.aiTotal,2);assert.equal(q.feedbackTotal,1);assert.equal(q.legacyTotal,1);assert.deepEqual(q.days.map(d=>d.day),['2026-10-20','2026-10-19','2026-10-18']);assert.equal(q.repeated[0].count,3);assert.equal(q.spreads.find(r=>r.id==='one').count,3);assert(q.spreads.some(r=>r.id==='unknown'&&r.count===1));assert.equal(q.items.filter(r=>r.source==='legacy')[0].topic,null);assert(!JSON.stringify(metrics).includes(receipt.deletionToken));assert(!JSON.stringify(metrics).includes('deletion_hash'));assert.equal(get('learning').queryAnalysis.total,0);assert.equal(get('all','2026-10-19','2026-10-19').queryAnalysis.total,2);
 assert.equal(telemetry.deleteFeedback(receipt.id,'wrong'),false);assert.equal(telemetry.deleteFeedback(receipt.id,receipt.deletionToken),true);assert.equal(get().queryAnalysis.total,3);assert.equal(get().queryAnalysis.repeated[0].count,2);
 for(let i=0;i<105;i++)telemetry.recordFeedback(make('分页合成'+i));q=get().queryAnalysis;assert.equal(q.total,108);assert.equal(q.items.length,100);assert.equal(q.truncated,true);assert.equal(q.topics.reduce((a,b)=>a+b.count,0),q.total,'summary includes all consented samples, not just visible page');
 const expiryBefore=now;now=Date.parse('2026-11-19T04:00:00Z');telemetry.summary();now=Date.parse('2026-11-19T06:00:00Z');telemetry.summary();const cleared=new DatabaseSync(file);assert.equal(cleared.prepare('SELECT COUNT(*) n FROM query_feedback').get().n,0);assert.equal(cleared.prepare('SELECT COUNT(*) n FROM query_feedback_context').get().n,0,'same-day expiry deletes context along with question');cleared.close();now=expiryBefore;
 now+=31*86400000;assert.equal(telemetry.summary().queryAnalysis.total,0);assert.equal(telemetry.deleteFeedback(second.id,second.deletionToken),false);
 console.log('PASS consented-query analysis: additive old-schema migration, strict v1/v2 consent/context, no identity/card/answer linkage, date/module scope, honest legacy unknowns, repeated samples, aggregate/full-page reconciliation, withdrawal and 30-day expiry.');
}finally{telemetry.close();fs.rmSync(dir,{recursive:true,force:true});}
