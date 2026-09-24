/* Real source UI with a local mock endpoint: no production service or credentials. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..'),KEY='tarot-reading-v3';
const sessionToken='tp1.'+'s'.repeat(80);
(async()=>{
 const requests=[],sessions=[],held=[];let mode='success';
 const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/session'){
   let body='';for await(const chunk of req)body+=chunk;const parsed=JSON.parse(body);sessions.push(parsed);
   res.setHeader('Content-Type','application/json');
   if(Object.keys(parsed).length){res.statusCode=400;res.end(JSON.stringify({error:'INVALID_REQUEST'}));return;}
   res.end(JSON.stringify({token:sessionToken,expiresAt:Date.now()+3600000}));return;
  }
  if(url.pathname==='/api/reading'){
   let body='';for await(const chunk of req)body+=chunk;
   requests.push({body:JSON.parse(body),auth:req.headers.authorization});res.setHeader('Content-Type','application/json');
   if(mode==='hold'){held.push(res);return;}
   if(mode==='auth'){res.statusCode=401;res.end(JSON.stringify({error:'AUTH_REQUIRED'}));return;}
   if(mode==='error'){res.statusCode=502;res.end(JSON.stringify({error:'UPSTREAM_ERROR'}));return;}
   res.end(JSON.stringify({text:'### 本次回答\nSynthetic whole-spread reading.\n\n### 牌面依据\n**保留原牌**，结合问题阅读。\n\n<script>window.injected=true</script>',model:'fixture',provider:'deepseek'}));return;
  }
  if(url.pathname==='/ai-config.js'){res.setHeader('Content-Type','text/javascript');res.end('window.TAROT_AI_CONFIG={endpoint:"/api/reading",sessionEndpoint:"/api/session"};');return;}
  if(url.pathname==='/locales/en.js'){
   const dict=Object.assign({},...fs.readdirSync(path.join(root,'locales')).filter(n=>/^en-.*\.json$/.test(n)).sort().map(n=>JSON.parse(fs.readFileSync(path.join(root,'locales',n),'utf8'))));
   res.setHeader('Content-Type','text/javascript');res.end('window.TAROT_EN='+JSON.stringify(dict)+';');return;
  }
  const file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
 async function requestReading(page){await page.evaluate(()=>{const control=document.createElement('button');control.dataset.reading='ai-request';document.body.append(control);control.click();control.remove();});}
 const browser=await chromium.launch(require('./browser_options.cjs'));
 try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',isMobile:true,hasTouch:true,serviceWorkers:'block'}),p=await ctx.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));const origin=`http://127.0.0.1:${server.address().port}`;
  await p.goto(origin+'/?lang=en');assert.equal(await p.locator('html').getAttribute('lang'),'zh-CN');assert.equal(await p.locator('[data-language-toggle]').count(),0);
  assert.equal(await p.locator('.access-screen').count(),0,'the public app has no invitation gate');
  assert.equal(await p.locator('#app').getAttribute('aria-hidden'),null,'the public app is interactive immediately');
  assert.equal(await p.locator('.bottomnav').count(),1,'the main navigation is immediately available');
  assert.equal(sessions.length,0,'opening or browsing never creates a billable AI session');
  await p.locator('.bottomnav [data-page=reading]').click();
  const catalog=await p.evaluate(()=>window.TAROT_SPREAD_CONTENT.spreads.filter(d=>!d.legacy&&d.id!=='daily'));
  const scenes=await p.evaluate(()=>window.TAROT_READING_SCENARIOS);
  assert.equal(catalog.length,12,'twelve available structures plus the separate daily draw');assert.equal(scenes.length,25);
  for(const sc of scenes){
   const d=catalog.find(d=>d.id===sc.spreadId);
   if((await p.locator('.reading-theme').getAttribute('id'))!==`reading-theme-${sc.category}`)await p.locator(`[data-reading=category][data-value=${sc.category}]`).click();
   await p.locator(`[data-reading=guide][data-scenario="${sc.id}"]`).click();
   for(const width of [390,320]){
    await p.setViewportSize({width,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal page overflow');
    assert.equal(await p.locator('.reading-position-list li').count(),d.positions.length,'all real positions are visible in one overview');
    assert.equal(await p.locator('.reading-slot.active').count(),0,'overview never preselects one card');
    for(const pos of d.positions)assert((await p.locator('.reading-position-list').innerText()).includes(pos.question));
    assert.equal(await p.locator('[data-reading=guide-position]').count(),0,'understanding positions does not require tapping through them');
    const diagram=await p.locator('.reading-guide-diagram').boundingBox();assert(diagram.height<300,'overview diagram stays compact');
    const action=p.locator('[data-reading=start]');await action.scrollIntoViewIfNeeded();const box=await action.boundingBox();assert(box.height>=44&&box.width<=width,'start stays reachable with a mobile tap target');
   }
   assert(/[\u3400-\u9fff]/.test(await p.locator('.compact-spread-guide').innerText()),sc.id+': visible guide remains Chinese');
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Chinese guide does not overflow');
   await p.locator('[data-reading=guide-back]').click();
  }
  await p.setViewportSize({width:390,height:844});const sc05=scenes.find(sc=>sc.id==='sc05');if((await p.locator('.reading-theme').getAttribute('id'))!==`reading-theme-${sc05.category}`)await p.locator(`[data-reading=category][data-value=${sc05.category}]`).click();await p.locator('[data-reading=guide][data-scenario="sc05"]').click();await p.screenshot({path:'/tmp/tarot-v2-compact-guide.png',fullPage:true});
  // Synthetic completed spread, isolated from any real user records.
  await p.evaluate(KEY=>{
   const d=window.TAROT_SPREAD_CONTENT.spreads.find(d=>d.id==='decision-five');
   const r={id:'fixture-v14',at:123,spreadId:d.id,topic:d.topic,questionId:'own',questionText:'How can I compare two study schedules?',optionA:'Weekend classes',optionB:'Weekday self-study',contextEnabled:true,reversals:true,pool:window.TAROT_READING_DECK.cards.map((c,i)=>({id:c.id,reversed:i%2===1})),picked:[0,1,2,3,4],revealed:[0,1,2,3,4],active:0,phase:'read'};
   sessionStorage.setItem('tarot-ui-fixture-reading',JSON.stringify({version:1,settings:{topic:d.topic,spreadId:d.id,questionId:'own',reversals:true},draft:r,history:[],practice:[],daily:[],ui:{view:'table',category:'all',guideId:d.id,guideActive:0,question:''}}));
  },KEY);
  await p.addInitScript(KEY=>{const fixture=sessionStorage.getItem('tarot-ui-fixture-reading');if(fixture){localStorage.setItem(KEY,fixture);sessionStorage.removeItem('tarot-ui-fixture-reading');}},KEY);
  await p.reload();await p.locator('.bottomnav [data-page=reading]').click();
  assert.equal(await p.locator('[data-ai-access],.ai-connection').count(),0,'the reading page never asks for a code or provider key');
  assert((await p.locator('.reading-result-question p').innerText()).includes('How can I compare two study schedules?'),'the user question is visibly the reading focus');
  await p.locator('[data-reading-ai]').scrollIntoViewIfNeeded();await p.screenshot({path:'/tmp/tarot-v15-auto-ai.png',fullPage:false});
  assert.equal(await p.locator('.reading-offline').count(),1,'a spread-aware local reading is available before AI');
  assert.equal(requests.length,0);assert.equal(sessions.length,0);
  await requestReading(p);await p.locator('.ai-answer').waitFor();assert.equal(sessions.length,1);assert.deepEqual(sessions[0],{});assert.equal(requests.length,1);assert.equal(requests[0].auth,'Bearer '+sessionToken);assert.equal(requests[0].body.spreadId,'decision-five');assert.equal(requests[0].body.question,'How can I compare two study schedules?');assert.equal(requests[0].body.optionA,'Weekend classes');assert.equal(requests[0].body.optionB,'Weekday self-study');assert.equal(requests[0].body.cards.length,5);assert.equal(requests[0].body.cards[1].reversed,true);
  assert.deepEqual(await p.locator('.ai-answer h3').allTextContents(),['本次回答','牌面依据'],'headings render even when followed by a single newline');assert.equal(await p.locator('.ai-answer strong').innerText(),'保留原牌');assert.doesNotMatch(await p.locator('.ai-answer').innerText(),/###/);
  assert.equal(await p.evaluate(()=>window.injected),undefined);assert.equal(await p.locator('.ai-answer script').count(),0);
  const saved=await p.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)),KEY);assert.equal(saved.draft.ai.length,1);assert(!JSON.stringify(saved).includes(sessionToken));
  await p.reload();assert.equal(await p.locator('.access-screen').count(),0,'reload remains public');await p.locator('.bottomnav [data-page=reading]').click();assert.equal(await p.locator('.ai-answer').count(),1,'saved answer remains visible');assert.equal(await p.locator('[data-reading=ai-request]').count(),0,'a successful reading has no redundant request button');assert.equal(requests.length,1);
  const localeState=await p.evaluate(KEY=>localStorage.getItem(KEY),KEY);await p.evaluate(()=>TAROT_I18N.setLocale('en'));assert.equal(await p.locator('html').getAttribute('lang'),'zh-CN');assert.equal(await p.locator('[data-language-toggle]').count(),0);assert.equal(await p.locator('.ai-answer').count(),1);assert.equal(await p.evaluate(KEY=>localStorage.getItem(KEY),KEY),localeState,'compatibility locale call preserves the saved answer');assert.equal(await p.locator('[data-ai-access],.ai-connection').count(),0);
  const firstDraw=await p.evaluate(KEY=>{const s=JSON.parse(localStorage.getItem(KEY)).draft;return {pool:s.pool,picked:s.picked};},KEY);await p.locator('[data-reading=edit-question]').click();await p.locator('[data-reading-edit]').fill('Which retry question should be used?');await p.locator('[data-reading=save-question]').click();const retryDraft=await p.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)).draft,KEY);assert.deepEqual({pool:retryDraft.pool,picked:retryDraft.picked},firstDraw,'preparing a retry never redraws cards');assert.equal(retryDraft.ai?.length||0,0);assert(retryDraft.answerHistory.some(h=>h.ai?.some(a=>a.text.includes('Synthetic whole-spread'))),'first saved answer is archived after the question changes');
  mode='hold';await requestReading(p);await p.locator('[data-reading=ai-cancel]').click();await p.waitForTimeout(30);assert.equal(await p.locator('.ai-answer').count(),0);assert.equal((await p.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)),KEY)).draft.ai.length,0,'cancel leaves the current Chinese answer slot unchanged');for(const res of held)res.end('{}');held.length=0;
  mode='error';await requestReading(p);await p.locator('.ai-error').waitFor();assert.match(await p.locator('.ai-error').innerText(),/完整解读/);assert.equal(await p.locator('.ai-answer').count(),0);
  await ctx.setOffline(true);assert.equal(await p.locator('[data-reading=ai-request]').count(),1,'a failed reading keeps a retry action');assert.equal(await p.locator('.reading-offline').count(),1,'the local reading remains available offline');
  await ctx.setOffline(false);mode='success';await requestReading(p);await p.locator('.ai-answer').waitFor();await ctx.setOffline(true);assert.equal(await p.locator('.ai-answer').count(),1,'offline saved answer is available');await ctx.setOffline(false);
  const originalDraw=await p.evaluate(KEY=>{const s=JSON.parse(localStorage.getItem(KEY)).draft;return {pool:s.pool,picked:s.picked};},KEY);
  await p.locator('[data-reading=edit-question]').click();await p.locator('[data-reading-edit]').fill('Which schedule fits a weekday evening course?');await p.locator('[data-reading=save-question]').click();
  const edited=await p.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)).draft,KEY);
  assert.equal(edited.userQuestion,'Which schedule fits a weekday evening course?');assert.deepEqual({pool:edited.pool,picked:edited.picked},originalDraw,'editing a question never redraws cards');
  assert.equal(edited.ai?.length||0,0,'the old answer is not reused for a changed question');assert(edited.answerHistory.some(h=>h.ai?.some(a=>a.text.includes('Synthetic whole-spread'))),'previous answer remains available');
  const requestCount=requests.length;await p.waitForTimeout(20);assert.equal(requests.length,requestCount,'saving an edited question does not contact AI');
  await p.reload();await p.locator('.bottomnav [data-page=reading]').click();mode='auth';await requestReading(p);await p.locator('.ai-error').waitFor();assert.equal(await p.locator('.access-screen').count(),0,'an expired AI session never locks the public app');assert.equal(await p.evaluate(()=>sessionStorage.getItem('tarot-pocket-session-v1')),null);assert.equal(await p.locator('.reading-offline').count(),1,'the local reading remains available after an AI auth failure');
  assert.deepEqual(errors,[]);await ctx.close();console.log(JSON.stringify({status:'PASS',checks:['public entry has no invitation gate','?lang=en falls back to zh-CN with no visible toggle','browsing and local readings do not create a billable AI session','all 25 Chinese scene guides fit at 320/390','spread-aware local reading appears before AI','explicit AI action creates a tab-scoped anonymous session','question, options, spread, cards and reversals are sent','session is auto-attached and never exported','compatibility locale call preserves current input and saved answer','saved reading survives reload, errors, cancellation and offline use','question edits never redraw or auto-send','401 keeps the public app and local reading usable'],limitations:['local mock only; no live credentials, model-quality or physical-iPhone check']}));
 }finally{for(const res of held)res.end('{}');await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
