'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {DatabaseSync}=require('node:sqlite');
const {createTelemetry}=require('../server/telemetry.cjs');
const {parseRange,productMetrics}=require('../server/product-metrics.cjs');
const {createReadingServer,loadConfig,deriveInviteCode,createSessionToken}=require('../server/reading-service.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tarot-product-metrics-')),file=path.join(dir,'synthetic.sqlite');
let stamp=Date.parse('2026-10-10T15:59:00Z');
const admin='synthetic-admin-only',t=createTelemetry({file,secret:'synthetic-secret-only',adminToken:admin,now:()=>stamp});
function record(visitor,name,page='courses',props={},session='same-tab'){assert.equal(t.record({visitorId:visitor.padEnd(20,'v'),sessionId:session.padEnd(20,'s'),name,page,props}),true);stamp+=1000;}
function row(id,at,name,page='courses',props={},visitor='a',session='tab'){return {id,occurred_at:Date.parse(at),visitor,session,name,page,props:JSON.stringify(props)};}
(async()=>{try{
 // Same browser across tabs and days counts once over the range, not sum of daily UV.
 record('a','screen_view');record('a','learning_start');record('a','learning_answer');record('a','learning_complete');
 for(let i=0;i<3;i++)record('a','feature_click','courses',{feature:'learning:guided'});
 record('b','learning_complete'); // Outcome before entry must not inflate ordered completion.
 record('b','screen_view');record('b','learning_start');
 stamp=Date.parse('2026-10-10T16:01:00Z');record('a','screen_view');record('a','feature_click','library',{feature:'library:show-card'},'other-tab');record('a','dossier_open','library');
 stamp+=31*60000;record('a','screen_view');
 record('a','feature_click','courses',{feature:'close'});
 stamp=Date.parse('2026-10-12T02:00:00Z');
 let p=t.summary(30,{from:'2026-10-10',to:'2026-10-12',module:'all'}).product;
 assert.equal(p.overview.users,2);assert.equal(p.daily.length,3);assert.equal(p.daily[0].users,2);assert.equal(p.daily[1].users,1);assert.equal(p.daily[2].users,0);assert.equal(p.daily[0].clicks,3);assert.equal(p.daily[1].clicks,2);assert.equal(p.overview.clicks,5);assert.equal(p.overview.visits,4);
 assert.equal(p.selected.funnel.find(r=>r.key==='learning:complete').users,1);assert.equal(p.selected.funnel.find(r=>r.key==='learning:start').users,2);
 assert.equal(p.selected.features.find(r=>r.key==='learning:guided').users,1);assert.equal(p.selected.features.find(r=>r.key==='learning:guided').count,3);
 assert(!p.selected.events.some(r=>['feature_click','screen_view','screen_exit','ai_backend_success'].includes(r.key)),'key behaviors do not repeat click, navigation, or service health tables');
 assert.equal(p.quality.legacyGenericFeatures,1);
 const library=t.summary(30,{from:'2026-10-11',to:'2026-10-11',module:'library'}).product;
 assert.equal(library.overview.users,1);assert.equal(library.overview.valueUsers,1);assert.equal(library.daily[0].clicks,1);assert(library.selected.features.every(r=>r.key.startsWith('library:')));
 // Complete ritual once, a mismatched spread never completes, daily/manual excluded.
 const sequence=['screen_view','spread_open','reading_start','reading_cut','reading_pick','reading_reveal','offline_reading_view'];
 sequence.forEach(name=>record('ritual',name,'reading',{spread:'three'}));
 record('mixed','screen_view','reading');record('mixed','spread_open','reading',{spread:'one'});record('mixed','reading_start','reading',{spread:'three'});record('mixed','reading_cut','reading',{spread:'three'});record('mixed','reading_pick','reading',{spread:'three'});record('mixed','reading_reveal','reading',{spread:'one'});record('mixed','offline_reading_view','reading',{spread:'one'});
 record('manual','screen_view','reading');record('manual','offline_reading_view','reading',{spread:'open-three',source:'manual'});
 record('daily','screen_view','reading');record('daily','reading_start','reading',{spread:'daily'});record('daily','offline_reading_view','reading',{spread:'daily'});
 record('ai','ai_confirm','reading',{spread:'three'});record('ai','ai_result','reading',{spread:'one',status:'success',duration:'50'}); // Wrong-spread outcome.
 record('ai','ai_result','reading',{spread:'three',status:'cancelled',duration:'90'});record('ai','ai_confirm','reading',{spread:'three'});record('ai','ai_result','reading',{spread:'three',status:'success',duration:'200'});
 record('cancel','ai_confirm','reading',{spread:'one'});record('cancel','ai_result','reading',{spread:'one',status:'cancelled',duration:'12'});
 record('fail','ai_confirm','reading',{spread:'one'});record('fail','ai_result','reading',{spread:'one',status:'failure',duration:'30'});
 t.recordServer('ai_backend_success',{spread:'three',status:'200',duration:'300'});t.recordServer('ai_backend_failure',{status:'502',duration:'600'});
 assert.equal(t.recordServer('ai_backend_failure',{question:'private-test-only'}),false);assert.equal(t.recordServer('unallowed',{}),false);
 assert.equal(t.record({visitorId:'x'.repeat(20),sessionId:'s'.repeat(20),name:'ai_result',page:'reading',props:{spread:'three',status:'fake'}}),false);
 assert.equal(t.record({visitorId:'x'.repeat(20),sessionId:'s'.repeat(20),name:'spread_open',page:'reading',props:{spread:'not-a-spread'}}),false);
 // Old data remains honest unknown: no filling from a nearby unrelated event.
 const db=new DatabaseSync(file);db.prepare('INSERT INTO events(occurred_at,day,visitor,session,name,page,props) VALUES(?,?,?,?,?,?,?)').run(stamp,'2026-10-12','historical','historical-tab','reading_reveal','reading','{}');db.close();stamp+=31*60000;
 p=t.summary(30,{from:'2026-10-12',to:'2026-10-12',module:'all'}).product;
 assert.equal(p.selected.funnel.find(r=>r.key==='reading:local').users,1);assert.equal(p.selected.funnel.find(r=>r.key==='reading:start').users,1);assert.equal(p.selected.funnel.find(r=>r.key==='ai:result').users,1);
 assert(p.selected.funnel.every(r=>r.conversion===null||r.conversion<=100));assert.equal(p.selected.ai.total,2);assert.equal(p.selected.ai.successRate,50);assert.equal(p.selected.ai.averageMs,450);assert.equal(p.quality.serverCallsWithoutSpread,1);assert.equal(p.quality.legacyWithoutSpread,1);
 const ai=t.summary(30,{from:'2026-10-12',to:'2026-10-12',module:'ai'}).product;
 assert.equal(ai.overview.users,3);assert.equal(ai.selected.spreads.find(r=>r.id==='one').aiFailures,1);assert.equal(ai.selected.ai.total,2);
 const onlyServer=productMetrics([row(1,'2026-10-12T01:00:00Z','ai_backend_success','/api/reading',{duration:'20',status:'200'},null,null)],{from:'2026-10-12',to:'2026-10-12',module:'ai'},stamp);
 assert.equal(onlyServer.overview.users,null);assert.equal(onlyServer.daily[0].users,null);assert.equal(onlyServer.selected.events.length,0);assert.equal(onlyServer.selected.spreads[0].aiUsers,0);
 assert(!JSON.stringify(p).includes('private-test-only'));assert(!JSON.stringify(p).includes('visitorId'));assert(!JSON.stringify(p).includes('deletionToken'));assert(p.paths.length);assert(p.paths.every(r=>r.steps.every(s=>!['close','face'].includes(s.feature))));
 for(const filters of [{from:'2026-02-30'},{from:'2026-10-13'},{from:'2026-10-12',to:'2026-10-10'},{from:'2026-07-01'},{module:'bad'},{extra:'bad'},{from:'2026-1-1'}])assert.throws(()=>parseRange(filters,stamp),RangeError);
 assert.equal(parseRange({},stamp).days,30);assert.equal(parseRange({from:'2026-07-15',to:'2026-10-12'},stamp).days,90);
 // Derive sessions before selecting day: one visit crossing the Shanghai date is still one visit.
 const crossing=productMetrics([row(1,'2026-10-10T15:59:00Z','screen_view'),row(2,'2026-10-10T16:01:00Z','learning_start')],{from:'2026-10-10',to:'2026-10-11'},stamp);
 assert.equal(crossing.overview.visits,1);assert.equal(crossing.daily[0].visits,1);assert.equal(crossing.daily[1].visits,1);
 const acrossDays=[row(1,'2026-10-10T15:59:00Z','screen_view','reading'),row(2,'2026-10-10T16:01:00Z','screen_view','library')];
 const firstDay=productMetrics(acrossDays,{from:'2026-10-10',to:'2026-10-10'},stamp);
 assert.equal(firstDay.exits.length,0,'a later-day tail cannot appear as an earlier-day exit');assert.equal(firstDay.paths.length,0);
 const secondDay=productMetrics(acrossDays,{from:'2026-10-11',to:'2026-10-11'},stamp);
 assert.equal(secondDay.exits[0].page,'library');assert(secondDay.paths.every(v=>v.steps.every(s=>new Date(s.at).toISOString().slice(0,10)==='2026-10-10')));
 const idleClose=productMetrics([row(1,'2026-10-10T00:00:00Z','screen_view'),row(2,'2026-10-10T02:00:00Z','screen_exit')],{from:'2026-10-10',to:'2026-10-10'},stamp);
 assert.equal(idleClose.overview.visits,1);assert.equal(idleClose.exits.reduce((sum,e)=>sum+e.count,0),1,'exit-only idle visit is not a second user visit');assert.equal(idleClose.paths.length,1);
 // Real API rejects date/module/query abuse, and collects server spread only after full validation.
 const env={TAROT_AI_PROVIDER:'deepseek',TAROT_AI_MODEL:'deepseek-test',DEEPSEEK_API_KEY:'fixture-key-only-'+'k'.repeat(40),TAROT_AI_ACCESS_TOKEN:'fixture-token-only-'+'t'.repeat(40),TAROT_AI_ALLOWED_ORIGINS:'https://tarot.georgelu.cn'},config=loadConfig(env);
 const server=createReadingServer({config,telemetry:t,now:()=>stamp});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{const url='http://127.0.0.1:'+server.address().port,headers={Origin:'https://tarot.georgelu.cn',Authorization:'Bearer '+admin};
 for(const query of ['?from=2026-02-30','?module=nope','?module=all&module=reading','?unknown=x','?from=2026-10-14'])assert.equal((await fetch(url+'/api/admin/metrics'+query,{headers})).status,400);
 let res=await fetch(url+'/api/admin/metrics?from=2026-10-10&to=2026-10-12&module=reading',{headers});assert.equal(res.status,200);assert.equal((await res.json()).product.range.module,'reading');
 const requestHeaders={Origin:'https://tarot.georgelu.cn','Content-Type':'application/json',Authorization:'Bearer '+createSessionToken(config,stamp).token};
 // Safety-boundary request bypasses provider but exercises complete body validation.
 const body={spreadId:'one',language:'zh',question:'我要自杀怎么办',cards:[{id:'m00',reversed:false}]};
 res=await fetch(url+'/api/reading',{method:'POST',headers:requestHeaders,body:JSON.stringify(body)});assert.equal(res.status,200);
 res=await fetch(url+'/api/reading',{method:'POST',headers:requestHeaders,body:JSON.stringify({...body,cards:[]})});assert.equal(res.status,400);
 const metrics=t.summary(30,{from:'2026-10-12',to:'2026-10-12',module:'ai'}).product;assert.equal(metrics.selected.spreads.find(r=>r.id==='one').serverSuccess,1);assert.equal(metrics.quality.serverCallsWithoutSpread,2);assert(!JSON.stringify(metrics).includes(body.question));
 }finally{await new Promise(resolve=>server.close(resolve));}
 console.log('PASS: Shanghai daily drilldown, dedup visitors/visits, ordered matched-spread funnels, manual/daily isolation, honest legacy and server users, strict protected range API, metadata-only AI calls.');
 }finally{try{t.close();}catch{}fs.rmSync(dir,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1;});
