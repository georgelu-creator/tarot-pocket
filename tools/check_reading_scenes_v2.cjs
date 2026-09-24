'use strict';
// Authored catalog/prompt + synthetic client tests. No live model or private config.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {loadCatalog,validateReading,buildPrompt,promptSelection,loadConfig,createSessionToken,createCloudReadingHandler}=require('../server/reading-service.cjs');
const prompts=require('../server/reading-prompts.cjs');
const catalog=loadCatalog(), ids=[...catalog.cards.keys()];
const sample=(id,more={})=>({spreadId:id,question:'',language:'zh',cards:ids.slice(0,catalog.spreads.get(id).positions.length).map((id,i)=>({id,reversed:i%2===1})),...more});
(async()=>{
 assert.equal(catalog.scenarios.size,25);assert.equal(catalog.spreads.size,32);
 assert.equal(prompts.version,'RP-1.2.2');
 // Authored prompt integration only: these checks do not claim that a model obeys it.
 const master=fs.readFileSync('docs/READING_MASTER.md','utf8');
 const pb01=master.slice(master.indexOf('#### RD-PB01 · 系统提示词正文')).match(/```text\n([\s\S]*?)\n```/);
 assert.equal(pb01?.[1],prompts.base,'effective documented PB01 exactly matches runtime');
 for(const language of ['zh','en']){
  const instructions=buildPrompt(validateReading(sample('yes-no',{scenarioId:'sc18',sceneVersion:'1',language,question:language==='en'?'Will the exhibition go ahead next month?':'下个月展览能办成吗？'}),catalog)).instructions;
  for(const rule of ['不能保证用户养成习惯','选择时确认','不声称用户已经积压教程','单牌问题回答倾向与一条具体依据后','不能支持精确未来判断','不得分别改成过去、现在、未来','同一比较维度','不按正位/逆位直接计票','timeline有真实trend位置','抑郁症','恶性肿瘤','停药','合同或行为是否违法','全部积蓄','cannot guarantee attendance','check whether','without inventing a backlog','without repeating the conclusion'])assert.ok(instructions.includes(rule),language+' includes RP-1.2.2 rule '+rule);
  assert.ok(instructions.includes(language==='en'?'English（英语）':'简体中文'),'requested response language retained');
  assert.ok(instructions.includes('不能称其“尚未落实”'),'unknown arrangements cannot become invented facts');
  assert.ok(instructions.endsWith(prompts.riskBoundary),'high-risk boundary is the final instruction layer');
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
 const health=await handler({request:new Request(origin+'/api/health',{headers:{Origin:origin}}),env:{},clientIp:'192.0.2.10'});
 assert.equal(health.status,200);assert.equal((await health.json()).promptVersion,'RP-1.2.2');
 let i=0;
 for(const scene of catalog.scenarios.values()){
  for(const field of ['name','description','question'])if(scene[field]){const key=scene[field]==='能不能／会不会'?'能不能／会不会 · Yes/No':scene[field];assert.ok(translations[key],scene.id+' English '+field);}
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
 const free=validateReading(sample('open-three'),catalog);assert.ok(free.cards.every(x=>x.positionRole==='free'));assert.match(buildPrompt(free).instructions,/不能把最后一张叫结果位/);assert.match(buildPrompt(free).instructions,/第1\/2\/3张只表示抽取顺序/);
 const typeCases=[
  ['这次能不能通过？','01'],['这次不会通过吗？','01'],['难道已经没有机会了吗？','01'],
  ['选A还是B？','02'],['A和B到底哪个更适合我？','02'],
  ['为什么卡住了？','03'],['问题到底出在哪里？','03'],
  ['怎样改善准备？','04'],['我不是想问会不会通过，而是想知道怎么改善准备？','04'],['我不知道为什么总卡住，接下来具体怎么办？','04'],
  ['什么时候有进展？','05'],['大概多久才会有结果？','05'],['','06']
 ];
 for(const [q,type] of typeCases)assert.equal(promptSelection(validateReading(sample('open-three',{question:q}),catalog)).type,type,q);
 const latter=promptSelection(validateReading(sample('open-three',{question:'不是想复合，我真正想问这次面试能不能拿到录用？'}),catalog));assert.deepEqual(latter,{scene:'04',type:'01'});
 const workCause=promptSelection(validateReading(sample('open-three',{question:'这个项目为什么一直卡住？'}),catalog));assert.deepEqual(workCause,{scene:'05',type:'03'});
 const bareResign=promptSelection(validateReading(sample('relationship-five',{scenarioId:'sc09',sceneVersion:'1',topic:'love',question:'不是感情问题我想辞职'}),catalog));assert.deepEqual(bareResign,{scene:'05',type:null});
 const negatedReunion=promptSelection(validateReading(sample('relationship-five',{scenarioId:'sc09',sceneVersion:'1',topic:'love',question:'我不想复合我想辞职'}),catalog));assert.deepEqual(negatedReunion,{scene:'05',type:null});
 const mixedWorkLove=promptSelection(validateReading(sample('open-three',{topic:'general',question:'我喜欢同事，这段感情影响工作，我该辞职吗？'}),catalog));assert.deepEqual(mixedWorkLove,{scene:'05',type:'02'});
 const currentRelation=validateReading(sample('relationship-three',{topic:'love',question:'我们下个月会在一起吗？'}),catalog);
 assert.deepEqual(promptSelection(currentRelation),{scene:'01',type:'01'});assert.match(buildPrompt(currentRelation).instructions,/没有trend\/outcome角色/);assert.match(buildPrompt(currentRelation).instructions,/不能支持精确未来判断/);
 const futureRelation=validateReading(sample('relationship-five',{topic:'love',question:'我们接下来会怎样发展？'}),catalog);
 assert.deepEqual(promptSelection(futureRelation),{scene:'02',type:'01'});
 assert.match(buildPrompt(futureRelation).instructions,/开头先用该趋势位给有条件的方向/);
 const timelineOutcome=validateReading(sample('timeline',{topic:'study',question:'这次考试会通过吗？'}),catalog);
 assert.match(buildPrompt(timelineOutcome).instructions,/开头先用trend位置回答所问结果/);
 const blankYesNo=buildPrompt(validateReading(sample('yes-no'),catalog)).instructions;assert.match(blankYesNo,/仍先给Yes或No的牌面倾向/);assert.doesNotMatch(blankYesNo,/请补一句问题/);

 // The actual question deterministically overrides a conflicting preset. The
 // stale scene module/topic is removed before the model sees trusted context.
 const conflictReading=(sceneId,question)=>{const scene=catalog.scenarios.get(sceneId);return validateReading(sample(scene.spreadId,{scenarioId:scene.id,sceneVersion:scene.version,topic:scene.topic,question}),catalog);};
 const resignFromReunion=conflictReading('sc09','我正在考虑辞职，要不要离开现在的工作？');
 assert.deepEqual(promptSelection(resignFromReunion),{scene:'05',type:'02'});
 const resignPrompt=buildPrompt(resignFromReunion);
 assert.ok(resignPrompt.instructions.includes(prompts.scenes['05']));assert.ok(!resignPrompt.instructions.includes(prompts.scenes['03']));
 assert.match(resignPrompt.instructions,/目录预设属于“感情”.*实际问题属于“工作”/s);
 assert.match(resignPrompt.instructions,/真实牌位是关系角色.*和用户实际问题的领域不适配/s);
 assert.match(resignPrompt.input,/"topic":\{"id":"career","label":"工作事业","source":"question"\}/);
 assert.match(resignPrompt.input,/"scenario":\{"id":"sc09","version":"1","presetIgnored":true\}/);
 assert.doesNotMatch(resignPrompt.input,/还有复合的机会吗|按目前的情况，我们还有重新开始的机会吗/);

 const loveFromWork=conflictReading('sc11','我真正想问的是，这段感情还要不要继续？');
 assert.deepEqual(promptSelection(loveFromWork),{scene:'01',type:'02'});
 const lovePrompt=buildPrompt(loveFromWork);
 assert.ok(lovePrompt.instructions.includes(prompts.scenes['01']));assert.ok(!lovePrompt.instructions.includes(prompts.scenes['05']));
 assert.match(lovePrompt.input,/"topic":\{"id":"love","label":"感情关系","source":"question"\}/);
 assert.doesNotMatch(lovePrompt.input,/工作卡在哪里|当前这项工作卡在哪里/);

 const medicalFromStudy=conflictReading('sc13','我是不是得了抑郁症，要不要停药？');
 assert.deepEqual(promptSelection(medicalFromStudy),{scene:'09',type:'02'});
 const medicalPrompt=buildPrompt(medicalFromStudy);
 assert.ok(medicalPrompt.instructions.includes(prompts.scenes['09']));assert.ok(!medicalPrompt.instructions.includes(prompts.scenes['07']));
 assert.match(medicalPrompt.instructions,/实际问题属于“医疗”/);
 assert.match(medicalPrompt.input,/"questionDomain":"medical"/);
 assert.doesNotMatch(medicalPrompt.input,/学习哪里需要调整|目前学习卡在哪里/);
 assert.ok(medicalPrompt.instructions.endsWith(prompts.riskBoundary));

 const callReading=body=>handler({request:new Request('https://test.example/api/reading',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Authorization:'Bearer '+session.token},body:JSON.stringify(body)}),env:{},clientIp:'192.0.2.20'});
 const beforeSafety=seen.length;
 for(const [spreadId,question,next] of [['yes-no','我是不是得了抑郁症？',/正规医疗机构|有资质的医生/],['one','我现在能停药吗？',/开药医生|有资质的药师/],['three','我是不是应该立刻停掉医生开的药？',/开药医生|有资质的药师/],['open-three','这份合同违法吗？',/律师|法律援助/],['timeline','我该把全部积蓄投入这个项目吗？',/应急资金|持牌专业人士/]]){
  const reply=await callReading(sample(spreadId,{question}));assert.equal(reply.status,200,spreadId+' deterministic safety');
  const body=await reply.json();assert.equal(body.model,'safety-boundary');assert.equal(body.provider,'safety');assert.match(body.text,next);
  assert.equal(seen.length,beforeSafety,spreadId+' must not call provider');
 }
 for(const question of ['我有抑郁症，这次考试会通过吗？','医生已经让我停药，这次考试会通过吗？','我已经按医生要求停掉这个药，这次考试会通过吗？','这份合同已经由律师确认合法，这次合作会成吗？','我不打算投入全部积蓄，这个项目会完成吗？']){
  const reply=await callReading(sample('yes-no',{question}));assert.equal(reply.status,200,question);assert.notEqual((await reply.json()).model,'safety-boundary',question);
 }
 assert.equal(seen.length,beforeSafety+5,'safe history and negated high-risk statements still call provider');
 // An unknown or expired invitation session cannot consume model requests.
 const before=seen.length;const expired=createSessionToken(cfg,1).token;
 const expiredReply=await handler({request:new Request('https://test.example/api/reading',{method:'POST',headers:{Origin:origin,Authorization:'Bearer '+expired,'Content-Type':'application/json'},body:JSON.stringify(tri)}),env:{},clientIp:'192.0.2.13'});
 assert.equal(expiredReply.status,401);assert.equal(seen.length,before);
 await clientChecks();
 console.log('PASS: RP-1.2.2 health, final-layer risk boundary, 25 scene routes, sc09/resign + work/love + study/medical conflict handling, spread scope, natural question routing, schemas, auth and client retry/save. Mock only.');
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
 const safety=ai.clean([{language:'zh',text:'这次不调用 AI。请联系有资质的专业人士。',model:'safety-boundary',provider:'safety',at:Date.now()}])[0];
 current={...current,id:'safety-reading',ai:[safety]};const safetyHtml=ai.render(current);
 assert.match(safetyHtml,/安全边界提示[\s\S]*这类问题不交给 AI 判断[\s\S]*未调用 AI/);
 assert.doesNotMatch(safetyHtml,/AI 深度解读|DeepSeek|OpenAI/,'deterministic boundary must never be labelled as an AI/provider answer');
 assert.throws(()=>ai.clean([{...safety,model:'fixture'}]),/AI 解读记录格式不正确/);
 current={...current,id:'second-reading',ai:undefined};job=ai.request(current,save,()=>current);await new Promise(r=>setImmediate(r));fetches.at(-1).resolve(new Response(JSON.stringify({error:'AUTH_REQUIRED'}),{status:401}));await job;assert.equal(cleared,1);assert.equal(saved.length,1);assert.equal(JSON.stringify(current.pool),cards);
}
