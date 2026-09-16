/* Explicit release probe. Synthetic questions only; credentials remain in memory.
 * This is deliberately excluded from npm test: --live performs two paid calls. */
'use strict';
const {deriveInviteCode}=require('../server/reading-service.cjs');
const BASE='https://tarot-ai.georgelu.cn',ORIGIN='https://georgelu-creator.github.io';
const FIXTURES=[
 {name:'yes-no',body:{spreadId:'yes-no',scenarioId:'sc18',sceneVersion:'1',topic:'general',language:'zh',question:'虚构练习案例：我正在准备一场社区摄影展，作品和场地已经确定。照目前的准备进度，下个月能顺利办成吗？请先回答倾向，再说明依据。',cards:[{id:'m19',reversed:false}]}},
 {name:'three-options',body:{spreadId:'three-options',scenarioId:'sc21',sceneVersion:'1',topic:'general',language:'zh',question:'虚构练习案例：我想用三个月学会基础摄影，每周有六小时。下面三种学习安排，哪一种更适合持续学下去？请比较后给一个明确倾向。',optionA:'参加每周一次、固定时间的小班课',optionB:'只靠自己有空时看零散视频',optionC:'和朋友每周拍一次，再互相讲评',cards:[{id:'p08',reversed:false},{id:'w10',reversed:true},{id:'p03',reversed:false}]}}
];
class ProbeError extends Error {constructor(code){super(code);this.code=code;}}
const requireThat=(ok,code)=>{if(!ok)throw new ProbeError(code);};
async function run({env=process.env,fetchImpl=fetch,log=value=>console.log(JSON.stringify(value))}={}){
 const signing=env.TAROT_AI_ACCESS_TOKEN||'';
 requireThat(signing.length>=32,'PRIVATE_SIGNING_CONFIGURATION_MISSING');
 const invite=deriveInviteCode(signing),secrets=[signing,invite,env.DEEPSEEK_API_KEY,env.OPENAI_API_KEY].filter(Boolean);
 const safe=text=>{const lower=String(text).toLowerCase();return !secrets.some(v=>lower.includes(v.toLowerCase()))&&!/\b(?:sk-[A-Za-z0-9_-]{12,}|tp1\.[A-Za-z0-9._-]{20,}|Bearer\s+[A-Za-z0-9._-]{20,})/i.test(text);};
 const emit=value=>{const serialized=JSON.stringify(value);requireThat(safe(serialized),'RESPONSE_SAFETY_CHECK_FAILED');log(value);};
 async function request(path,{method='GET',body,token,preflight=false}={}){
  const headers={Origin:ORIGIN};if(body!==undefined)headers['Content-Type']='application/json';if(token)headers.Authorization='Bearer '+token;
  if(preflight){headers['Access-Control-Request-Method']='POST';headers['Access-Control-Request-Headers']=path==='/api/session'?'content-type':'authorization,content-type';}
  let response;try{response=await fetchImpl(BASE+path,{method,headers,...(body!==undefined?{body:JSON.stringify(body)}:{}),redirect:'error',credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(135000)});}catch{throw new ProbeError('NETWORK_OR_TIMEOUT');}
  requireThat(response.headers.get('access-control-allow-origin')===ORIGIN,'CORS_ORIGIN_MISMATCH');
  requireThat(Number(response.headers.get('content-length')||0)<=150000,'RESPONSE_TOO_LARGE');
  const reader=response.body?.getReader(),chunks=[];let size=0;
  if(reader)for(;;){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>150000){await reader.cancel();throw new ProbeError('RESPONSE_TOO_LARGE');}chunks.push(part.value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  const text=new TextDecoder().decode(bytes);let result={};if(text){try{result=JSON.parse(text);}catch{throw new ProbeError('NON_JSON_RESPONSE');}}
  return {response,result};
 }
 for(const path of ['/api/session','/api/reading']){const {response}=await request(path,{method:'OPTIONS',preflight:true});requireThat(response.status===204,'PREFLIGHT_FAILED');emit({endpoint:BASE+path,check:'preflight',status:response.status});}
 const health=await request('/api/health');requireThat(health.response.status===200&&health.result.ok===true&&health.result.configured===true,'HEALTH_NOT_READY');
 requireThat(health.result.promptVersion==='RP-1.1.1'&&health.result.scenarioCount===25,'PRODUCTION_REVISION_NOT_READY');
 emit({endpoint:BASE+'/api/health',status:health.response.status,ok:true,configured:true,...(typeof health.result.promptVersion==='string'?{promptVersion:health.result.promptVersion}:{}),...(Number.isInteger(health.result.scenarioCount)?{scenarioCount:health.result.scenarioCount}:{})});
 const wrong=invite==='AAAA2222'?'BBBB3333':'AAAA2222';
 const rejected=await request('/api/session',{method:'POST',body:{inviteCode:wrong}});requireThat(rejected.response.status===401&&rejected.result.error==='AUTH_REQUIRED','WRONG_INVITE_NOT_REJECTED');emit({endpoint:BASE+'/api/session',check:'wrong-invite',status:401});
 const session=await request('/api/session',{method:'POST',body:{inviteCode:invite}});
 requireThat(session.response.status===200&&typeof session.result.token==='string'&&session.result.token.length>=40&&session.result.token.length<=1024&&Number.isFinite(session.result.expiresAt)&&session.result.expiresAt>Date.now()+30000,'SESSION_NOT_READY');
 const token=session.result.token;secrets.push(token);emit({endpoint:BASE+'/api/session',check:'valid-invite',status:200,shape:{token:'present-not-displayed',expiresAt:'future'}});
 const original=await request('/api/reading',{method:'POST',token:invite,body:FIXTURES[0].body});requireThat(original.response.status===401&&original.result.error==='AUTH_REQUIRED','INVITE_MUST_NOT_AUTHORIZE_READING');emit({endpoint:BASE+'/api/reading',check:'invite-is-not-a-session',status:401});
 for(const fixture of FIXTURES){const {response,result}=await request('/api/reading',{method:'POST',token,body:fixture.body});
  requireThat(response.status===200,'READING_REQUEST_FAILED');requireThat(typeof result.text==='string'&&result.text.trim().length>=20&&result.text.length<=30000&&['deepseek','openai'].includes(result.provider)&&typeof result.model==='string'&&result.model.length<=100,'READING_SHAPE_FAILED');
  // Never print arbitrary response bodies or exception details. Only these
  // whitelisted fields and synthetic-case prose pass through the secret guard.
  requireThat(safe(result.text)&&safe(result.model),'RESPONSE_SAFETY_CHECK_FAILED');
  emit({endpoint:BASE+'/api/reading',fixture:fixture.name,status:response.status,shape:{nonempty:true,characters:result.text.length,provider:result.provider,model:result.model},syntheticAnswer:result.text});
 }
 emit({status:'PASS',liveModelCalls:2,fixturesOnly:true,limitation:'Request/auth/schema checks passed; the printed synthetic answers still require human quality review.'});
}
if(require.main===module){if(process.argv.length!==3||process.argv[2]!=='--live'){console.error('Not run. Explicit --live is required; this probe makes two paid synthetic production readings.');process.exitCode=1;}else run().catch(error=>{console.error(JSON.stringify({status:'FAIL',code:error instanceof ProbeError?error.code:'UNEXPECTED_PROBE_FAILURE'}));process.exitCode=1;});}
module.exports={run,FIXTURES};
