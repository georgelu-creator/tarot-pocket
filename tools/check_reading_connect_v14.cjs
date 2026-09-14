/* Real source UI with a local mock endpoint: no production service or credentials. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..'),KEY='tarot-reading-v3';
const token='fixture-connection-code-not-a-provider-key';
(async()=>{
 const requests=[],held=[];let mode='auth';
 const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/reading'){
   let body='';for await(const chunk of req)body+=chunk;
   requests.push({body:JSON.parse(body),auth:req.headers.authorization});res.setHeader('Content-Type','application/json');
   if(mode==='hold'){held.push(res);return;}
   if(mode==='auth'){res.statusCode=401;res.end(JSON.stringify({error:'AUTH_REQUIRED'}));return;}
   if(mode==='error'){res.statusCode=502;res.end(JSON.stringify({error:'UPSTREAM_ERROR'}));return;}
   res.end(JSON.stringify({text:'Synthetic whole-spread reading.\n\n<script>window.injected=true</script>',model:'fixture',provider:'deepseek'}));return;
  }
  if(url.pathname==='/ai-config.js'){res.setHeader('Content-Type','text/javascript');res.end('window.TAROT_AI_CONFIG={endpoint:"/api/reading"};');return;}
  if(url.pathname==='/locales/en.js'){
   const dict=Object.assign({},...fs.readdirSync(path.join(root,'locales')).filter(n=>/^en-.*\.json$/.test(n)).sort().map(n=>JSON.parse(fs.readFileSync(path.join(root,'locales',n),'utf8'))));
   res.setHeader('Content-Type','text/javascript');res.end('window.TAROT_EN='+JSON.stringify(dict)+';');return;
  }
  const file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch(require('./browser_options.cjs'));
 try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',isMobile:true,hasTouch:true,serviceWorkers:'block'}),p=await ctx.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));const origin=`http://127.0.0.1:${server.address().port}`;
  await p.goto(origin+'/?lang=zh');await p.locator('.bottomnav [data-page=reading]').click();
  const catalog=await p.evaluate(()=>window.TAROT_SPREAD_CONTENT.spreads.filter(d=>!d.legacy&&d.id!=='daily'));
  assert.equal(catalog.length,7,'the existing seven sourced definitions remain');
  for(const d of catalog){
   await p.locator(`[data-reading=guide][data-value="${d.id}"]`).click();
   for(const width of [390,320]){
    await p.setViewportSize({width,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal page overflow');
    assert.equal(await p.locator('.spread-position-list button').count(),d.positions.length,'the diagram owns one selector per actual position');
    const boxes=await p.locator('.spread-position-list button').evaluateAll(es=>es.map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})));
    assert(boxes.every(b=>b.width>=44&&b.height>=44),'every position has a 44px tap target');
    const diagram=await p.locator('.reading-guide-diagram').boundingBox();assert(diagram.height<260,'guide diagram stays compact');
    const action=await p.locator('[data-reading=use-spread]').boundingBox();assert(action.y+action.height<650,'purpose, diagram, current explanation and action fit above the fold');
    if(d.positions.length<=5){for(let i=0;i<d.positions.length;i++){const label=p.locator(`.reading-slot[data-index="${i}"] .reading-label`);assert(await label.isVisible(),'small spreads expose every position name without tapping');assert.equal(await label.innerText(),d.positions[i].label);assert((await label.boundingBox()).height<=28,'position label uses at most two lines');}}
   }
   await p.locator('.reading-board').evaluate(e=>e.dataset.identity='keep-this-board');const before=await p.evaluate(()=>scrollY);
   await p.locator(`[data-reading=guide-position][data-index="${d.positions.length-1}"]`).click();
   assert.equal(await p.locator('.reading-board').getAttribute('data-identity'),'keep-this-board','position changes do not rerender the board');
   assert.equal(await p.evaluate(()=>scrollY),before,'position changes do not reset scroll');
   assert((await p.locator('[data-guide-description]').innerText()).includes(d.positions.at(-1).question));
   assert.equal(await p.locator('.reading-slot.active').count(),1);
   await p.locator('.guide-all-positions>summary').click();assert.equal(await p.locator('.guide-all-positions tbody tr').count(),d.positions.length);
   for(const pos of d.positions)assert((await p.locator('.guide-all-positions').innerText()).includes(pos.question));
   await p.locator('[data-language-toggle]').click();await p.waitForTimeout(30);assert(!/[\u3400-\u9fff]/.test(await p.locator('.compact-spread-guide').innerText()),'all visible guide text translates');
   if(d.positions.length<=5){for(const label of await p.locator('.reading-label').all()){assert(await label.isVisible(),'English position names remain visible');assert((await label.boundingBox()).height<=28,`${d.id}: English position name fits in two lines: ${await label.innerText()}`);}const action=await p.locator('[data-reading=use-spread]').boundingBox();if(action.y+action.height>=650)await p.screenshot({path:'/tmp/tarot-v14-guide-failure.png',fullPage:true});assert(action.y+action.height<650,`${d.id}: English primary action ends at ${action.y+action.height}, expected below650`);}
   await p.locator('[data-language-toggle]').click();await p.locator('[data-reading=guide-back]').click();
  }
  await p.setViewportSize({width:390,height:844});await p.locator('[data-reading=guide][data-value="decision-five"]').click();await p.screenshot({path:'/tmp/tarot-v14-compact-guide.png',fullPage:true});await p.locator('[data-language-toggle]').click();await p.waitForTimeout(30);await p.screenshot({path:'/tmp/tarot-v14-compact-guide-en.png',fullPage:true});await p.locator('[data-language-toggle]').click();
  // Synthetic completed spread, isolated from any real user records.
  await p.evaluate(KEY=>{
   const d=window.TAROT_SPREAD_CONTENT.spreads.find(d=>d.id==='decision-five');
   const r={id:'fixture-v14',at:123,spreadId:d.id,topic:d.topic,questionId:'own',questionText:'How can I compare two study schedules?',optionA:'Weekend classes',optionB:'Weekday self-study',contextEnabled:true,reversals:true,pool:window.TAROT_READING_DECK.cards.map((c,i)=>({id:c.id,reversed:i%2===1})),picked:[0,1,2,3,4],revealed:[0,1,2,3,4],active:0,phase:'read'};
   sessionStorage.setItem('tarot-ui-fixture-reading',JSON.stringify({version:1,settings:{topic:d.topic,spreadId:d.id,questionId:'own',reversals:true},draft:r,history:[],practice:[],daily:[],ui:{view:'table',category:'all',guideId:d.id,guideActive:0,question:''}}));
  },KEY);
  await p.addInitScript(KEY=>{const fixture=sessionStorage.getItem('tarot-ui-fixture-reading');if(fixture){localStorage.setItem(KEY,fixture);sessionStorage.removeItem('tarot-ui-fixture-reading');}},KEY);
  await p.reload();await p.locator('.bottomnav [data-page=reading]').click();
  const code=p.getByLabel('AI 连接码',{exact:true});assert.equal(await code.count(),1,'connection field has an explicit accessible name');assert.equal(await code.getAttribute('type'),'password');assert(await code.isVisible(),'first connection form is visible without an error');
  assert.equal(requests.length,0);assert((await p.locator('.ai-connection').innerText()).includes('服务提供者'));assert((await p.locator('.ai-connection').innerText()).includes('不要填写'));
  await p.locator('[data-reading=ai-request]').click();assert.equal(requests.length,0);assert.equal(await code.evaluate(e=>e===document.activeElement),true);assert(await p.locator('.ai-error').isVisible());
  await p.locator('.ai-connection-help>summary').click();assert((await p.locator('.ai-connection-help').innerText()).includes('TAROT_AI_ACCESS_TOKEN'));assert.equal(await p.locator('.ai-connection-help a').getAttribute('rel'),'noopener noreferrer');
  await code.fill(token);assert.equal(requests.length,0,'typing a code must not submit a question');assert.equal(await p.locator('.ai-error').count(),0,'editing removes stale missing-code feedback without validating the code');assert(!(await p.locator('[data-reading-ai]').innerText()).includes('已连接'),'typing is not verification');
  assert(!await p.evaluate(token=>JSON.stringify({...localStorage,...sessionStorage}).includes(token),token),'connection code is not stored');
  await p.locator('.ai-connection-help>summary').click();await p.locator('[data-reading-ai]').scrollIntoViewIfNeeded();await p.screenshot({path:'/tmp/tarot-v14-connection.png',fullPage:false});
  await code.press('Enter');await p.locator('.ai-error').filter({hasText:'连接码不正确'}).waitFor();assert.equal(requests.length,1,'Enter explicitly submits exactly once');assert.equal(await p.locator('.ai-answer').count(),0,'authentication failure does not masquerade as a reading');assert.equal(new URL(p.url()).searchParams.has('tarot-connection-code'),false,'the code never enters the URL');
  mode='success';await p.locator('[data-reading=ai-request]').click();await p.locator('.ai-answer').waitFor();assert.equal(requests.length,2);assert.equal(requests[1].auth,'Bearer '+token);assert.equal(requests[1].body.spreadId,'decision-five');assert.equal(requests[1].body.question,'How can I compare two study schedules?');assert.equal(requests[1].body.cards.length,5);assert.equal(requests[1].body.cards[1].reversed,true);
  assert.equal(await p.evaluate(()=>window.injected),undefined);assert.equal(await p.locator('.ai-answer script').count(),0);
  const saved=await p.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)),KEY);assert.equal(saved.draft.ai.length,1);assert(!JSON.stringify(saved).includes(token));
  await p.reload();await p.locator('.bottomnav [data-page=reading]').click();assert.equal(await p.locator('.ai-answer').count(),1,'saved answer remains visible without reconnecting');assert.equal(requests.length,2);
  await p.locator('[data-language-toggle]').click();assert.equal(await p.locator('.ai-answer').count(),0);assert.equal(await p.locator('[data-ai-access]').inputValue(),'','a new page opening clears the connection code');
  await p.locator('.ai-connection-help>summary').click();await p.waitForTimeout(30);assert(!/[\u3400-\u9fff]/.test(await p.locator('[data-reading-ai]').innerText()),'connection and setup help are fully translated');assert.equal(await p.locator('[data-ai-access]').getAttribute('placeholder'),'Paste your connection code here');
  mode='hold';await p.locator('[data-ai-access]').fill(token);await p.locator('[data-reading=ai-request]').click();await p.locator('[data-reading=ai-cancel]').click();await p.waitForTimeout(30);assert.equal(await p.locator('.ai-answer').count(),0);assert.equal((await p.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)),KEY)).draft.ai.length,1,'cancel preserves the other-language saved answer');for(const res of held)res.end('{}');held.length=0;
  mode='error';await p.locator('[data-reading=ai-request]').click();await p.locator('.ai-error').waitFor();assert.match(await p.locator('.ai-error').innerText(),/complete reading/);assert.equal(await p.locator('.ai-answer').count(),0);
  await ctx.setOffline(true);await p.locator('[data-language-toggle]').click();assert.equal(await p.locator('.ai-answer').count(),1,'offline saved answer is available');await p.locator('[data-language-toggle]').click();assert(await p.locator('[data-reading=ai-request]').isDisabled(),'new readings require connectivity');
  assert.deepEqual(errors,[]);await ctx.close();console.log(JSON.stringify({status:'PASS',checks:['7 sourced compact guides at 320 and 390','44px positions; live explanation and full position table','stable board and scroll','fully bilingual guide and connection help','visible first-connect password field','input does not send; Enter submits once','incorrect code clear, no fake answer','no credential storage or URL leakage','saved reading survives reload, errors, cancellation and offline use'],limitations:['local mock only; no live credentials, model-quality or physical-iPhone check']}));
 }finally{for(const res of held)res.end('{}');await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
