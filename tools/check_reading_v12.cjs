/* Curated positions, dense guide UI, optional references, and explicit AI requests. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..'),KEY='tarot-reading-v3';
const openShuffledDeck=async p=>{
 await p.locator('[data-reading=motion-continue]').click();
 await p.locator('[data-reading=cut-default]').click();
 await p.locator('[data-reading=motion-continue]').click();
 await p.locator('[data-reading=pick]').first().waitFor();
};
const pick=async(p,index)=>{
 const targetPage=Math.floor(index/6);
 let page=Math.floor(Number(await p.locator('[data-reading=pick]').first().getAttribute('data-index'))/6);
 while(page!==targetPage){page+=Math.sign(targetPage-page);await p.locator(`[data-reading=pick-page][data-index="${page}"]`).click();}
 await p.locator(`[data-reading=pick][data-index="${index}"]`).click();
 await p.locator(`[data-reading=pick-confirm][data-index="${index}"]`).click();
};
const reveal=async(p,index)=>{
 await p.locator(`[data-reading=reveal-next][data-index="${index}"]`).first().click();
 await p.locator(`[data-reading=reveal-place][data-index="${index}"]`).click();
};
(async()=>{
 const requests=[];let next='success',held=[];const sessionToken='tp1.'+'v'.repeat(80);
 const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/reading'){
   let body='';for await(const chunk of req)body+=chunk;requests.push({body:JSON.parse(body),authorization:req.headers.authorization});
   res.setHeader('Content-Type','application/json');
   if(next==='hold'){held.push(res);return;}
   if(next==='error'){res.statusCode=502;res.end(JSON.stringify({error:'UPSTREAM_ERROR'}));return;}
   // A transport fixture, not an assertion about real model quality.
   res.end(JSON.stringify({text:'测试解读正文\n\n<script>window.injected=true</script>\n按实际牌位联系两条路径。',provider:'deepseek',model:'mock-model'}));return;
  }
  if(url.pathname==='/api/session'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({token:sessionToken,expiresAt:Date.now()+3600000}));return;}
  const file=path.join(root,url.pathname.slice(1)||'index.html');if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.statusCode=404;res.end();return;}
  res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'})[path.extname(file)]||'application/octet-stream');
  let data=fs.readFileSync(file);if(url.pathname==='/ai-config.js')data=Buffer.from('window.TAROT_AI_CONFIG={endpoint:"/api/reading",sessionEndpoint:"/api/session"};');res.end(data);
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch(require('./browser_options.cjs'));
 try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});await ctx.addInitScript(sessionToken=>sessionStorage.setItem('tarot-pocket-session-v1',JSON.stringify({token:sessionToken,expiresAt:Date.now()+3600000})),sessionToken);const p=await ctx.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));const origin=`http://127.0.0.1:${server.address().port}`;await p.goto(origin);await p.locator('.bottomnav [data-page=reading]').click();
  const catalog=await p.evaluate(()=>window.TAROT_SPREAD_CONTENT.spreads),current=catalog.filter(s=>!s.legacy&&s.id!=='daily'),legacy=catalog.filter(s=>s.legacy);
  assert.equal(current.length,7);assert.equal(legacy.length,19);assert(current.every(s=>s.source?.url.startsWith('https://')));
  assert.deepEqual(await p.locator('.reading-spread-choice').evaluateAll(es=>es.map(e=>e.dataset.value)),current.map(s=>s.id));
  const choice=catalog.find(s=>s.id==='decision-five');assert.deepEqual(choice.positions.map(p=>p.id),['current','a-development','b-development','a-outcome','b-outcome']);assert.equal(catalog.find(s=>s.id==='choice').positions.length,6,'old six-card records retain their positions');
  for(const d of current){
   await p.locator(`[data-reading=guide][data-value="${d.id}"]`).click();assert.equal(await p.locator('.reading-whole').count(),0);
   for(const width of [320,390,1280]){await p.setViewportSize({width,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));const b=await p.locator('.reading-guide-diagram').boundingBox();assert(b.height<260,'guide diagram must not consume the page');const c=await p.locator('[data-reading=use-spread]').boundingBox();assert(c.y+c.height<650,'purpose and draw action are immediately reachable');}
   if(d.id==='decision-five'){const b=await p.locator('.reading-slot').evaluateAll(es=>es.map(e=>({x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y})));assert(b[3].y<b[1].y&&b[1].y<b[0].y);assert(b[1].x<b[2].x&&b[3].x<b[4].x);}
   if(d.id==='relationship-five'){const b=await p.locator('.reading-slot').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().y));assert(b[2]<b[0]&&b[0]===b[3]&&b[4]>b[3]);}
   await p.locator('[data-reading=guide-back]').click();
  }
  await p.setViewportSize({width:390,height:844});await p.locator('[data-reading=guide][data-value="decision-five"]').click();await p.screenshot({path:'/tmp/tarot-v12-guide.png',fullPage:true});await p.locator('[data-reading=use-spread]').click();
  await p.locator('[data-reading-question]').fill('两个课程安排应如何权衡？');await p.locator('[data-reading-option=optionA]').fill('周末上课');await p.locator('[data-reading-option=optionB]').fill('平日自学');await p.locator('[data-reading-setting=reversals]').check();await p.locator('[data-reading=start]').click();await openShuffledDeck(p);
  for(let i=0;i<5;i++)await pick(p,i);for(let i=0;i<5;i++)await reveal(p,i);
  assert.equal(await p.locator('.reading-slot.active').count(),0);assert.equal(await p.locator('.reading-interpretation').count(),0);assert.equal(requests.length,0,'never auto-send private questions');
  await p.locator('[data-reading=card][data-index="0"]').click();assert.equal(await p.locator('.reading-interpretation').count(),1);assert(await p.locator('[data-reading-panel]').evaluate(e=>e.compareDocumentPosition(document.querySelector('[data-reading-completion]'))&Node.DOCUMENT_POSITION_PRECEDING));
  await p.locator('[data-reading=card][data-index="0"]').click();assert.equal(await p.locator('.reading-interpretation').count(),0);await p.locator('[data-reading=card][data-index="1"]').click();await p.locator('[data-reading=close-reference]').click();assert.equal(await p.locator('.reading-slot.active').count(),0);
  assert.equal(await p.locator('.ai-connection,[data-ai-access]').count(),0);await p.locator('[data-reading=ai-request]').click();await p.locator('.ai-answer').waitFor();
  assert.equal(requests.length,1);assert.equal(requests[0].body.spreadId,'decision-five');assert.equal(requests[0].body.question,'两个课程安排应如何权衡？');assert.equal(requests[0].body.optionA,'周末上课');assert.equal(requests[0].body.optionB,'平日自学');
  let saved=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);assert.deepEqual(requests[0].body.cards,saved.draft.picked.map(i=>saved.draft.pool[i]));assert.equal(saved.draft.ai.length,1);assert(!JSON.stringify(saved).includes(sessionToken));assert.equal(await p.evaluate(()=>window.injected),undefined);assert.equal(await p.locator('.ai-answer script').count(),0);assert.equal(requests[0].authorization,'Bearer '+sessionToken);
  await p.screenshot({path:'/tmp/tarot-v12-result.png',fullPage:true});await p.reload();await p.locator('.bottomnav [data-page=reading]').click();assert.equal(await p.locator('.ai-answer').count(),1);assert.equal(requests.length,1);assert.equal(await p.locator('.reading-slot.active').count(),0);
  await p.locator('[data-language-toggle]').click();assert.equal(await p.locator('.ai-answer').count(),0,'a Chinese answer is not relabeled as English');next='error';assert.equal(await p.locator('.ai-connection,[data-ai-access]').count(),0);await p.locator('[data-reading=ai-request]').click();await p.locator('.ai-error').waitFor();assert((await p.locator('.ai-error').innerText()).includes('complete reading'));assert.equal(await p.locator('.ai-answer').count(),0,'do not substitute a fake AI answer on error');
  next='hold';await p.locator('[data-reading=ai-request]').click();await p.locator('[data-reading=ai-cancel]').click();await p.waitForTimeout(50);saved=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);assert.equal(saved.draft.ai.length,1,'cancel preserves original reading');for(const r of held)r.end('{}');held=[];
  await p.locator('[data-language-toggle]').click();await ctx.setOffline(true);await p.locator('[data-reading=pause]').click();await p.locator('[data-reading=resume]').click();assert.equal(await p.locator('.ai-answer').count(),1);await ctx.setOffline(false);
  // Every removed catalog entry remains readable from an old saved record, with exact IDs/card order.
  for(const d of legacy){const lp=await ctx.newPage();await lp.addInitScript(({d,KEY})=>{const deck=[...Array.from({length:22},(_,i)=>({id:'m'+String(i).padStart(2,'0')})),...['w','c','s','p'].flatMap(s=>Array.from({length:14},(_,i)=>({id:s+String(i+1).padStart(2,'0')})))];const r={id:'old-'+d.id,at:123,spreadId:d.id,topic:d.topic,questionId:'own',questionText:'',contextEnabled:d.contextEnabled,reversals:false,pool:deck.map(c=>({id:c.id,reversed:false})),picked:d.positions.map((_,i)=>i),revealed:d.positions.map((_,i)=>i),active:0,phase:'read'};localStorage.setItem(KEY,JSON.stringify({version:1,settings:{topic:d.topic,spreadId:d.id,questionId:'own',reversals:false},draft:r,history:[r],practice:[]}));},{d,KEY});await lp.goto(origin);await lp.locator('.bottomnav [data-page=reading]').click();assert.equal(await lp.locator('.reading-slot').count(),d.positions.length);assert.equal(await lp.locator('.reading-slot img').count(),d.positions.length);assert.equal(await lp.locator('.reading-interpretation').count(),0);assert.equal(await lp.locator('[data-reading-report]').getAttribute('data-reading-report'),d.id);await lp.close();}
  assert.deepEqual(errors,[]);await ctx.close();console.log(JSON.stringify({status:'PASS',checks:['7 sourced spreads, 19 legacy definitions retained','exact five-card decision numbering and V layout','compact mobile/desktop guides','result first, deselectable card reference','explicit AI payload only','automatic scoped session','safe response rendering','AI response persisted in existing backup schema','language-specific saved answers','error and cancellation are honest','offline saved AI reading','all 19 legacy layouts and records reopen'],limitations:['mock transport does not establish live AI quality']}));
 }finally{for(const r of held)r.end('{}');await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
