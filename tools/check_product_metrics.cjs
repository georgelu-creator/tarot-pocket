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
 assert.equal(p.overview.users,2);assert.equal(p.daily.length,3);assert.deepEqual(p.daily.map(r=>r.day),['2026-10-12','2026-10-11','2026-10-10']);assert.equal(p.daily[2].users,2);assert.equal(p.daily[1].users,1);assert.equal(p.daily[0].users,0);assert.equal(p.daily[2].clicks,3);assert.equal(p.daily[1].clicks,2);assert.equal(p.overview.clicks,5);assert.equal(p.overview.visits,4);
 assert.equal(p.selected.funnel.find(r=>r.key==='learning:complete').users,1);assert.equal(p.selected.funnel.find(r=>r.key==='learning:start').users,2);
 assert.equal(p.selected.features.find(r=>r.key==='learning:guided').users,1);assert.equal(p.selected.features.find(r=>r.key==='learning:guided').count,3);assert.equal(p.selected.features.find(r=>r.key==='learning:guided').userRate,50);assert.equal(p.selected.features.find(r=>r.key==='learning:guided').denominatorUsers,2);
 assert.deepEqual(p.dailyAnalysis.map(r=>r.day),p.daily.map(r=>r.day));assert.equal(p.dailyAnalysis[2].features.find(r=>r.key==='learning:guided').count,3);assert.equal(p.dailyAnalysis[2].features.find(r=>r.key==='learning:guided').users,1);assert.equal(p.dailyAnalysis[2].features.find(r=>r.key==='learning:guided').userRate,50);assert.equal(p.dailyAnalysis[1].features.find(r=>r.key==='library:show-card').userRate,100);assert.equal(p.dailyAnalysis[0].features.length,0);assert.equal(p.dailyAnalysis[2].events.find(r=>r.key==='learning_complete').userRate,100);
 assert(!p.selected.events.some(r=>['feature_click','screen_view','screen_exit','ai_backend_success'].includes(r.key)),'key behaviors do not repeat click, navigation, or service health tables');
 assert.equal(p.quality.legacyGenericFeatures,1);
 const library=t.summary(30,{from:'2026-10-11',to:'2026-10-11',module:'library'}).product;
 assert.equal(library.overview.users,1);assert.equal(library.overview.valueUsers,1);assert.equal(library.daily[0].clicks,1);assert(library.selected.features.every(r=>r.key.startsWith('library:')));assert.equal(library.dailyAnalysis[0].features[0].userRate,100);assert.equal(library.dailyAnalysis[0].features[0].denominatorUsers,1);
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
 assert.equal(parseRange({},stamp).days,7);assert.equal(parseRange({},stamp).from,'2026-10-06');assert.equal(parseRange({},stamp).to,'2026-10-12');assert.equal(parseRange({from:'2026-07-15',to:'2026-10-12'},stamp).days,90);
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
 // Two-step spread conversion deduplicates visitors across repeats and spreads, with no guessed joins.
 const spreadRows=[],push=(id,at,name,spread,visitor,session='tab',extra={})=>spreadRows.push(row(id,at,name,'reading',{...(spread?{spread}:{}),...extra},visitor,session));
 push(1,'2026-10-11T01:00:00Z','spread_open','three','repeat');push(2,'2026-10-11T01:00:01Z','spread_open','three','repeat');push(3,'2026-10-11T01:00:02Z','reading_start','three','repeat');push(4,'2026-10-11T01:00:03Z','spread_open','one','repeat');push(5,'2026-10-11T01:00:04Z','reading_start','three','repeat');
 push(6,'2026-10-11T02:00:00Z','reading_start','three','backwards');push(7,'2026-10-11T02:00:01Z','spread_open','three','backwards');
 push(8,'2026-10-11T03:00:00Z','spread_open','three','tabs','first');push(9,'2026-10-11T03:00:01Z','reading_start','three','tabs','second');
 push(10,'2026-10-11T04:00:00Z','spread_open','one','mismatch');push(11,'2026-10-11T04:00:01Z','reading_start','three','mismatch');
 push(12,'2026-10-11T05:00:00Z','spread_open',null,'unknown');push(13,'2026-10-11T05:00:01Z','reading_start',null,'unknown');
 push(14,'2026-10-11T06:00:00Z','spread_open','daily','daily');push(15,'2026-10-11T06:00:01Z','reading_start','daily','daily');
 push(16,'2026-10-11T07:00:00Z','spread_open','three','manual','tab',{source:'manual'});push(17,'2026-10-11T07:00:01Z','reading_start','three','manual','tab',{source:'manual'});
 push(18,'2026-10-11T08:00:00Z','spread_open','one','both');push(19,'2026-10-11T08:00:01Z','reading_start','one','both');push(20,'2026-10-11T08:00:02Z','spread_open','three','both');push(21,'2026-10-11T08:00:03Z','reading_start','three','both');
 push(22,'2026-10-10T15:59:00Z','spread_open','three','cross-day');push(23,'2026-10-10T16:01:00Z','reading_start','three','cross-day');
 push(24,'2026-10-11T09:00:00Z','spread_open','three','idle');push(25,'2026-10-11T09:31:00Z','reading_start','three','idle');
 // Tie-breaking follows event ids; these are intentionally supplied in reverse order below.
 push(26,'2026-10-11T10:00:00Z','spread_open','one','same-ms');push(27,'2026-10-11T10:00:00Z','reading_start','one','same-ms');
 push(28,'2026-10-12T03:00:00Z','spread_open','one','future');push(29,'2026-10-12T03:00:01Z','reading_start','one','future');
 const converted=productMetrics([...spreadRows].reverse(),{from:'2026-10-10',to:'2026-10-12',module:'reading'},stamp);
 assert.deepEqual(converted.selected.spreadFunnel,[{key:'spread_view',label:'查看牌阵',users:8,visits:8,conversion:null},{key:'spread_start',label:'开始使用',users:4,visits:4,conversion:50}]);
 assert.deepEqual(converted.selected.spreads.find(r=>r.id==='three').viewToStart,{viewUsers:6,convertedUsers:3,rate:50,viewVisits:6,convertedVisits:3});
 assert.deepEqual(converted.selected.spreads.find(r=>r.id==='one').viewToStart,{viewUsers:4,convertedUsers:2,rate:50,viewVisits:4,convertedVisits:2});
 assert.equal(converted.selected.spreads.find(r=>r.id==='unknown').viewToStart,null);assert(!converted.paths.some(r=>r.at>stamp));
 const dayOnly=productMetrics(spreadRows,{from:'2026-10-11',to:'2026-10-11',module:'reading'},stamp);
 assert.equal(dayOnly.selected.spreadFunnel[0].users,7);assert.equal(dayOnly.selected.spreadFunnel[1].users,3);assert.equal(dayOnly.selected.spreadFunnel[1].conversion,42.9,'a prior-day view cannot convert inside a selected day');
 const previousOnly=productMetrics(spreadRows,{from:'2026-10-10',to:'2026-10-10',module:'reading'},stamp);
 assert.equal(previousOnly.selected.spreadFunnel[0].users,1);assert.equal(previousOnly.selected.spreadFunnel[1].users,0);
 const emptyDefault=productMetrics([],{},stamp);assert.equal(emptyDefault.daily.length,7);assert.deepEqual(emptyDefault.daily.map(r=>r.day),['2026-10-12','2026-10-11','2026-10-10','2026-10-09','2026-10-08','2026-10-07','2026-10-06']);assert.equal(emptyDefault.selected.spreadFunnel[1].conversion,null);
 assert.equal(onlyServer.dailyAnalysis[0].users,null);assert.equal(onlyServer.selected.spreads[0].viewToStart,null);
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
