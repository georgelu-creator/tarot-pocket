'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createTelemetry}=require('../server/telemetry.cjs');
const {loadConfig,createReadingServer}=require('../server/reading-service.cjs');

(async()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tarot-telemetry-')),file=path.join(dir,'events.sqlite');
  let stamp=Date.UTC(2026,8,23,12),admin='admin-'+'a'.repeat(40);
  const telemetry=createTelemetry({file,secret:'sign-'+'s'.repeat(40),adminToken:admin,now:()=>stamp});
  const base={name:'page_view',page:'home',visitorId:'visitor-1234567890',sessionId:'session-1234567890',props:{lang:'zh'}};
  assert.equal(telemetry.record(base),true);assert.equal(telemetry.record({...base,name:'home_read'}),true);
  telemetry.recordServer('ai_backend_success',{status:'200',duration:'1200'});telemetry.recordServer('ai_backend_failure',{status:'502',duration:'3400'});
  assert.equal(telemetry.record({...base,name:'unknown'}),false);assert.equal(telemetry.summary().overview.pv,1);assert.equal(telemetry.summary().overview.uv,1);
  assert.equal(telemetry.authorize(admin),true);assert.equal(telemetry.authorize('wrong'),false);
  const env={TAROT_AI_PROVIDER:'deepseek',TAROT_AI_MODEL:'deepseek-test',DEEPSEEK_API_KEY:'key-'+'k'.repeat(40),TAROT_AI_ACCESS_TOKEN:'token-'+'t'.repeat(40),TAROT_AI_ALLOWED_ORIGINS:'https://tarot.georgelu.cn'};
  const server=createReadingServer({config:loadConfig(env),telemetry});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const root='http://127.0.0.1:'+server.address().port,headers={Origin:'https://tarot.georgelu.cn'};
  let response=await fetch(root+'/api/events',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({events:[{...base,name:'spread_open',props:{spread:'three'}}]})});assert.equal(response.status,204);
  response=await fetch(root+'/api/admin/metrics',{headers:{...headers,Authorization:'Bearer wrong'}});assert.equal(response.status,401);
  response=await fetch(root+'/api/admin/metrics',{headers:{...headers,Authorization:'Bearer '+admin}});assert.equal(response.status,200);const summary=await response.json();assert.equal(summary.events.find(x=>x.name==='spread_open').count,1);assert.equal(summary.ai.total,2);assert.equal(summary.ai.successRate,50);assert.equal(summary.ai.averageMs,2300);assert.equal(summary.ai.statuses['502'],1);
  await new Promise(resolve=>server.close(resolve));fs.rmSync(dir,{recursive:true,force:true});
  console.log('PASS: anonymous first-party PV/UV/events, strict event schema, protected dashboard and no reading payload collection.');
})().catch(error=>{console.error(error);process.exitCode=1;});
