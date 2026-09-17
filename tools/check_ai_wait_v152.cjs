/* Source UI plus a held local response. Synthetic readings only, never a live-AI quality check. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..'),KEY='tarot-reading-v3';
const sessionToken='tp1.'+'s'.repeat(80),requests=[],held=[];
const reply=res=>{if(!res.destroyed)res.end(JSON.stringify({text:'Synthetic waiting-test answer.\n\nCompare the two study schedules.',model:'fixture',provider:'deepseek'}));};
let mode='hold';
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/api/reading'){
  let body='';for await(const chunk of req)body+=chunk;
  requests.push(JSON.parse(body));res.setHeader('Content-Type','application/json');
  if(mode==='hold')held.push(res);else reply(res);return;
 }
 if(url.pathname==='/ai-config.js'){res.setHeader('Content-Type','text/javascript');res.end('window.TAROT_AI_CONFIG={endpoint:"/api/reading",sessionEndpoint:"/api/session"};');return;}
 if(url.pathname==='/locales/en.js'){
  const dict=Object.assign({},...fs.readdirSync(path.join(root,'locales')).filter(n=>/^en-.*\.json$/.test(n)).sort().map(n=>JSON.parse(fs.readFileSync(path.join(root,'locales',n),'utf8'))));
  res.setHeader('Content-Type','text/javascript');res.end('window.TAROT_EN='+JSON.stringify(dict)+';');return;
 }
 const file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
});
async function until(check,message){for(let i=0;i<100;i++){if(await check())return;await new Promise(r=>setTimeout(r,20));}assert.fail(message);}
async function requestReading(page){await page.evaluate(()=>{const control=document.createElement('button');control.dataset.reading='ai-request';document.body.append(control);control.click();control.remove();});}
async function fixture(page){
 await page.evaluate(KEY=>{
  const d=window.TAROT_SPREAD_CONTENT.spreads.find(d=>d.id==='decision-five');
  const r={id:'fixture-ai-wait-v152',at:123,spreadId:d.id,topic:d.topic,questionId:'own',questionText:'How can I compare two study schedules?',optionA:'Weekend classes',optionB:'Weekday self-study',contextEnabled:true,reversals:true,pool:window.TAROT_READING_DECK.cards.map((c,i)=>({id:c.id,reversed:i%2===1})),picked:[0,1,2,3,4],revealed:[0,1,2,3,4],active:0,phase:'read'};
  sessionStorage.setItem('tarot-wait-fixture',JSON.stringify({version:1,settings:{topic:d.topic,spreadId:d.id,questionId:'own',reversals:true},draft:r,history:[],practice:[],daily:[],ui:{view:'table',category:'all',guideId:d.id,guideActive:0,question:''}}));
 },KEY);
 await page.reload();await page.locator('.bottomnav [data-page=reading]').click();
}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch(require('./browser_options.cjs'));
 try{
  for(const language of ['zh','en'])for(const width of [320,390]){
   const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(({token,KEY})=>{sessionStorage.setItem('tarot-pocket-session-v1',JSON.stringify({token,expiresAt:Date.now()+3600000}));const data=sessionStorage.getItem('tarot-wait-fixture');if(data){localStorage.setItem(KEY,data);sessionStorage.removeItem('tarot-wait-fixture');}},{token:sessionToken,KEY});
   await page.goto(`http://127.0.0.1:${server.address().port}/?lang=${language}`);await fixture(page);
   await page.clock.install();mode='hold';const before=requests.length;
   await requestReading(page);await page.locator('.ai-waiting').waitFor();
   await until(()=>requests.length===before+1,'exactly one held request starts');
   const tip=page.locator('[data-ai-wait-tip]'),long=page.locator('[data-ai-wait-long]'),first=await tip.innerText();
   assert.equal(await page.locator('.ai-waiting').getAttribute('aria-busy'),'true');
   assert.equal(await long.isVisible(),false,'long-wait message starts hidden');
   assert.equal(await page.locator('.ai-waiting-orbit .reading-back').count(),3);
   assert((await page.locator('.ai-waiting-orbit .reading-back').evaluateAll(es=>es.map(e=>getComputedStyle(e).animationName))).every(n=>n!=='none'),'standard motion animates the waiting cards');
   await page.clock.fastForward(6100);
   await until(async()=>await tip.innerText()!==first,'tip changes after six seconds');
   const second=await tip.innerText();assert.notEqual(second,first);
   if(language==='en')assert(!/[\u3400-\u9fff]/.test(await page.locator('.ai-waiting').innerText()),'English waiting tip translates after timer updates');
   await page.clock.fastForward(20000);await until(()=>long.isVisible(),'25-second long-wait message becomes visible');
   assert.equal(requests.length,before+1,'tip rotation never requests another AI reading');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${language} ${width}: no horizontal overflow`);
   const box=await page.locator('.ai-waiting').boundingBox();assert(box.x>=0&&box.x+box.width<=width+1,'waiting panel fits mobile width');
   const cancel=page.locator('[data-reading=ai-cancel]');assert((await cancel.boundingBox()).height>=44,'cancel has a mobile tap target');
   if(width===390)await page.locator('[data-reading-ai]').screenshot({path:`/tmp/tarot-ai-wait-v152-${language}.png`});
   await page.emulateMedia({reducedMotion:'reduce'});
   assert((await page.locator('.ai-waiting-orbit .reading-back,.ai-waiting-orbit i').evaluateAll(es=>es.map(e=>getComputedStyle(e).animationName))).every(n=>n==='none'),'reduced motion disables every decorative waiting animation');
   await cancel.click();await page.locator('.ai-waiting').waitFor({state:'detached'});
   for(const res of held.splice(0))reply(res);
   assert.equal(await page.locator('.ai-answer').count(),0,'cancellation never shows a late answer');
   assert.equal(await page.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)).draft.ai?.length||0,KEY),0,'cancellation never saves an answer');
   mode='success';await requestReading(page);
   await page.locator('.ai-answer').waitFor({timeout:3000});
   assert.equal(await page.locator('.ai-waiting').count(),0,'successful answer replaces waiting immediately without a minimum animation delay');
   assert.match(await page.locator('.ai-answer').innerText(),/Synthetic waiting-test answer/);
   assert.equal(requests.length,before+2,'retry causes precisely one additional request');
   assert.equal(await page.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)).draft.ai.length,KEY),1);
   await page.clock.fastForward(30000);assert.equal(requests.length,before+2,'completed waiting timer causes no requests or UI regression');
   assert.equal(await page.locator('.ai-waiting').count(),0);
   // A reply that arrives after choosing another spread must not enter its draft or visible UI.
   await fixture(page);mode='hold';await requestReading(page);await until(()=>requests.length===before+3,'navigation scenario has one held request');
   await page.locator('[data-reading=pause]').first().click();
   const next=page.locator('[data-reading=guide]:not([data-value="decision-five"])').first();const nextId=await next.getAttribute('data-value');await next.click();
   await page.locator('[data-reading=start]').click();
   for(const res of held.splice(0))reply(res);
   await until(async()=>await page.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)).history.some(r=>r.id==='fixture-ai-wait-v152'&&r.ai?.length),KEY),'late reply stays with the archived original spread');
   const draft=await page.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)).draft,KEY);
   assert.equal(draft.spreadId,nextId);assert.notEqual(draft.id,'fixture-ai-wait-v152');assert.equal(draft.ai?.length||0,0,'new spread receives no old answer');
   assert.equal(await page.locator('.ai-answer,.ai-waiting').count(),0,'late response does not replace the new spread UI');
   // Editing while waiting must cancel the old interpretation without redrawing.
   // Ignore abort in this synthetic transport so a genuinely late reply is tested.
   await fixture(page);mode='hold';const editBefore=requests.length;
   await page.evaluate(()=>{window.waitTestFetch=window.fetch;window.fetch=(url,options)=>window.waitTestFetch(url,{...options,signal:undefined});});
   await requestReading(page);await until(()=>requests.length===editBefore+1,'old question starts once');
   const oldReply=held.splice(0)[0];
   const originalCards=await page.evaluate(KEY=>{const s=JSON.parse(localStorage.getItem(KEY)).draft;return {pool:s.pool,picked:s.picked};},KEY);
   await page.locator('[data-reading=edit-question]').click();await page.locator('[data-reading-edit]').fill('Which schedule fits a new evening job?');await page.locator('[data-reading=save-question]').click();
   await page.locator('.ai-waiting').waitFor();await until(()=>requests.length===editBefore+2,'saving a changed question starts its new reading once');
   const newReply=held.splice(0)[0];newReply.end(JSON.stringify({text:'New question answer for the evening job.',model:'fixture',provider:'deepseek'}));
   await page.locator('.ai-answer').waitFor();reply(oldReply);
   await page.evaluate(async()=>{await new Promise(r=>window.waitTestFetch('/ai-config.js').then(r));});
   const edited=await page.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)).draft,KEY);
   assert.equal(edited.questionText,'Which schedule fits a new evening job?');assert.deepEqual({pool:edited.pool,picked:edited.picked},originalCards,'editing/retry keeps every original card');
   assert.equal(edited.ai.length,1);assert.equal(edited.ai[0].text,'New question answer for the evening job.','late old reply must not replace the new answer');
   await page.evaluate(()=>{window.fetch=window.waitTestFetch;delete window.waitTestFetch;});
   // Independently exercise the context guard without relying on UI cancellation.
   const guard=await page.evaluate(async KEY=>{
    const s=structuredClone(JSON.parse(localStorage.getItem(KEY)).draft);s.id='context-guard';s.ai=[];
    const nativeFetch=window.fetch;let release,saved=0;
    window.fetch=()=>new Promise(r=>{release=()=>r(new Response(JSON.stringify({text:'Old context',model:'fixture',provider:'deepseek'}),{status:200,headers:{'Content-Type':'application/json'}}));});
    try{const task=TarotReadingAI.request(s,()=>saved++,()=>null);s.userQuestion='Changed without cancellation';s.questionText=s.userQuestion;release();await task;return saved;}finally{window.fetch=nativeFetch;}
   },KEY);
   assert.equal(guard,0,'request snapshot guard rejects a changed question even without cancellation');
   assert.deepEqual(errors,[]);await context.close();
  }
  console.log(JSON.stringify({status:'PASS',checks:['Chinese and English at 320/390px','six-second tips and 25-second long-wait guidance','three animated cards and reduced motion','cancellation discards late answer','retry renders immediately with one request','navigation isolates answers by spread','editing a pending question preserves cards and only saves its new reply','immutable request context blocks stale answers independently of cancellation'],limitations:['local synthetic mock responses only; no live AI quality or physical-iPhone verification']}));
 }finally{for(const res of held.splice(0))reply(res);await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
