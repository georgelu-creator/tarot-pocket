'use strict';
// Authored catalog/prompt + synthetic client tests. No live model or private config.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {loadCatalog,validateReading,buildPrompt,promptSelection,loadConfig,createSessionToken,createCloudReadingHandler}=require('../server/reading-service.cjs');
const prompts=require('../server/reading-prompts.cjs');
const catalog=loadCatalog(), ids=[...catalog.cards.keys()];
const sample=(id,more={})=>({spreadId:id,question:'',language:'zh',cards:ids.slice(0,catalog.spreads.get(id).positions.length).map((id,i)=>({id,reversed:i%2===1})),...more});
(async()=>{
 assert.equal(catalog.scenarios.size,25);assert.equal(catalog.spreads.size,32);
 assert.equal(prompts.version,'RP-1.1.1');
 // Authored prompt integration only: these checks do not claim that a model obeys it.
 const master=fs.readFileSync('docs/READING_MASTER.md','utf8');
 const pb01=master.slice(master.indexOf('#### RD-PB01 · 系统提示词正文')).match(/```text\n([\s\S]*?)\n```/);
 assert.equal(pb01?.[1],prompts.base,'effective documented PB01 exactly matches runtime');
 for(const language of ['zh','en']){
  const instructions=buildPrompt(validateReading(sample('yes-no',{scenarioId:'sc18',sceneVersion:'1',language,question:language==='en'?'Will the exhibition go ahead next month?':'下个月展览能办成吗？'}),catalog)).instructions;
  for(const rule of ['不能保证用户养成习惯','选择时确认','不声称用户已经积压教程','单牌问题回答倾向与一条具体依据后','cannot guarantee attendance','check whether','without inventing a backlog','without repeating the conclusion'])assert.ok(instructions.includes(rule),language+' includes RP-1.1.1 rule '+rule);
  assert.ok(instructions.includes(language==='en'?'English（英语）':'简体中文'),'requested response language retained');
 }
 const reversedReference=catalog.cards.get('w10').reversed;
 assert.ok(reversedReference.includes('难以放手分担'),'reversal example grounded in supplied reference');

 assert.equal([...catalog.spreads.values()].filter(s=>s.legacy).length,19);
 for(const [id,count]of Object.entries({'yes-no':1,'new-love':5,'three-options':3,'career-six':6}))assert.equal(catalog.spreads.get(id).positions.length,count);
 assert.equal(catalog.spreads.get('yes-no').positions[0].role,'outcome');assert.equal(catalog.spreads.get('one').positions[0].role,'advice');
 assert.deepEqual(catalog.spreads.get('three-options').positions.map(x=>x.id),['option-a','option-b','option-c']);
 const translations=JSON.parse(fs.readFileSync('locales/en-reading-scenes-v2.json','utf8'));
 const modules=['09','09','09','09','06','10','01','02','03','04','05','06','07','07','08','06','08','09','11','01','12','13','01','14','15'];
 const origin='https://test.example',env={DEEPSEEK_API_KEY:'synthetic-not-real-provider-key',TAROT_AI_ACCESS_TOKEN:'synthetic-not-real-signing-key-123456789',TAROT_AI_ALLOWED_ORIGINS:origin,TAROT_AI_REQUESTS_PER_MINUTE:'120'};
 const cfg=loadConfig(env),session=createSessionToken(cfg),seen=[];
 const handler=createCloudReadingHandler({catalog,processEnv:env,fetchImpl:async(url,init)=>{const body=JSON.parse(init.body);seen.push(body);return new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{role:'assistant',content:'Synthetic complete answer for this fixture.'}}]}),{headers:{'Content-Type':'application/json'}});}});
 let i=0;
 for(const scene of catalog.scenarios.values()){
  for(const field of ['name','description','question'])if(scene[field])assert.ok(translations[scene[field]],scene.id+' English '+field);
  const body=sample(scene.spreadId,{scenarioId:scene.id,sceneVersion:'1',topic:scene.topic,question:scene.id==='sc18'?'这周会收到这次申请的回复吗？':''});
  const parsed=validateReading(body,catalog),prompt=buildPrompt(parsed);
  assert.equal(parsed.question,body.question||scene.question);
  assert.equal(parsed.scenario.id,scene.id);assert.equal(promptSelection(parsed).scene,modules[i++],scene.id+' scene route');
  assert.ok(prompt.instructions.startsWith(prompts.base),'full PB01 retained');
  assert.ok(prompt.instructions.includes(prompts.scenes[modules[i-1]]));
  assert.ok(!prompt.instructions.includes('900–1600'),'no mandatory length');
  const req=new Request('https://test.example/api/reading',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Authorization:'Bearer '+session.token},body:JSON.stringify(body)});
  const reply=await handler({request:req,env:{},clientIp:'192.0.2.12'});assert.equal(reply.status,200,scene.id+' cloud route');
  const sent=seen.at(-1).messages[1].content;assert.ok(sent.includes(JSON.stringify(parsed.question)));assert.ok(sent.includes('"id":"'+scene.id+'"'));
 }
 assert.equal(seen.length,25);
 for(const field of ['optionC','timeframe']){
  const body=sample('three-options',{[field]:env.DEEPSEEK_API_KEY});
  const reply=await handler({request:new Request('https://test.example/api/reading',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Authorization:'Bearer '+session.token},body:JSON.stringify(body)}),env:{},clientIp:'192.0.2.14'});
  assert.equal(reply.status,400,'configured credentials cannot enter '+field);assert.equal(seen.length,25);
  const text=await reply.text();assert.ok(!text.includes(env.DEEPSEEK_API_KEY));
 }

 const tri=sample('three-options',{scenarioId:'sc21',sceneVersion:'1',topic:'general',optionA:'A label',optionB:'B label',optionC:'C label',timeframe:'next week'});
 const parsed=validateReading(tri,catalog);assert.equal(parsed.optionC,'C label');assert.equal(parsed.timeframe,'next week');assert.ok(buildPrompt(parsed).input.includes('C label'));
 for(const bad of [{...tri,scenarioId:'sc12'},{...tri,sceneVersion:'2'},{...tri,topic:'love'},{...tri,optionC:3},{...tri,optionC:'c'.repeat(301)},{...tri,timeframe:'x'.repeat(121)},{...sample('three'),optionC:'C'},{...sample('three'),sceneVersion:'1'}])assert.throws(()=>validateReading(bad,catalog),/INVALID_REQUEST/);
 for(const spread of catalog.spreads.values())assert.equal(validateReading(sample(spread.id),catalog).cards.length,spread.positions.length,'old request compatibility');
 const free=validateReading(sample('open-three'),catalog);assert.ok(free.cards.every(x=>x.positionRole==='free'));assert.match(buildPrompt(free).instructions,/不能把最后一张叫结果位/);
 for(const [q,type] of [['这次能不能通过？','01'],['选A还是B？','02'],['为什么卡住了？','03'],['怎样改善准备？','04'],['什么时候有进展？','05'],['','06']])assert.equal(promptSelection(validateReading(sample('open-three',{question:q}),catalog)).type,type);
 // An unknown or expired invitation session cannot consume model requests.
 const before=seen.length;const expired=createSessionToken(cfg,1).token;
 const expiredReply=await handler({request:new Request('https://test.example/api/reading',{method:'POST',headers:{Origin:origin,Authorization:'Bearer '+expired,'Content-Type':'application/json'},body:JSON.stringify(tri)}),env:{},clientIp:'192.0.2.13'});
 assert.equal(expiredReply.status,401);assert.equal(seen.length,before);
 await clientChecks();
 console.log('PASS: 25 trusted scene routes, 32 spread schemas/19 legacy, bilingual scenes, 15 modules/6 question types, ABC, invalid associations, expired auth, cancel/retry/saved result. Mock only.');
})();
async function clientChecks(){
 let fetches=[],cleared=0,saved=[],current;
 const scope={window:{TAROT_AI_CONFIG:{endpoint:'https://test.example/api/reading'},TAROT_READING_SCENARIOS:[...catalog.scenarios.values()],TarotAccess:{ensureSession:async()=> 'synthetic-session',readingEndpoint:()=> 'https://test.example/api/reading',clear:()=>{cleared++;}},addEventListener(){}},document:{documentElement:{lang:'zh'},querySelector:()=>null},navigator:{onLine:true},location:{href:'https://app.example',origin:'https://app.example'},URL,AbortController,TextDecoder,Uint8Array,Date,setTimeout,clearTimeout,setInterval,clearInterval,fetch:(url,init)=>new Promise((resolve,reject)=>{const job={url,init,resolve,reject};fetches.push(job);init.signal.addEventListener('abort',()=>reject(new Error('aborted')));})};
 vm.createContext(scope);vm.runInContext(fs.readFileSync('reading-ai.js','utf8'),scope);const ai=scope.window.TarotReadingAI;
 current={id:'synthetic-reading',phase:'read',spreadId:'three-options',scenarioId:'sc21',sceneVersion:'1',questionText:'默认问题',userQuestion:'Which arrangement fits this week?',optionA:'Morning',optionB:'Noon',optionC:'Evening',pool:ids.slice(0,3).map(id=>({id,reversed:false})),picked:[0,1,2]};
 const cards=JSON.stringify(current.pool),body=ai.buildRequest(current,'en');assert.equal(body.question,current.userQuestion);assert.equal(body.optionC,'Evening');assert.equal(body.topic,'general');
 const save=(id,a)=>{saved.push({id,a});current.ai=[a];};
 let job=ai.request(current,save,()=>current);await new Promise(r=>setImmediate(r));assert.equal(fetches.length,1);assert.equal(fetches[0].url,'https://test.example/api/reading');ai.cancel(current);await job;assert.equal(saved.length,0);assert.equal(JSON.stringify(current.pool),cards);
 job=ai.request(current,save,()=>current);await new Promise(r=>setImmediate(r));assert.equal(fetches.length,2);fetches.at(-1).resolve(new Response(JSON.stringify({text:'Saved synthetic answer.',model:'fixture',provider:'deepseek'})));await job;assert.equal(saved.length,1);assert.equal(JSON.stringify(current.pool),cards);
 await ai.request(current,save,()=>current);assert.equal(fetches.length,2,'saved answer prevents duplicate request');assert.ok(ai.render(current).includes('Saved synthetic answer.'));
 current={...current,id:'second-reading',ai:undefined};job=ai.request(current,save,()=>current);await new Promise(r=>setImmediate(r));fetches.at(-1).resolve(new Response(JSON.stringify({error:'AUTH_REQUIRED'}),{status:401}));await job;assert.equal(cleared,1);assert.equal(saved.length,1);assert.equal(JSON.stringify(current.pool),cards);
}
