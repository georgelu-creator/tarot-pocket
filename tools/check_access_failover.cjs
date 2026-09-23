/* Real browsers exercise public entry and lazy anonymous AI-session failover. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require('playwright'),root=path.resolve(__dirname,'..');
const token='tp1.'+'f'.repeat(80);
(async()=>{
 const seen={primary:0,backup:0,reading:0};let primaryResponse='network';
 const server=http.createServer(async(req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/primary/api/session'){
   seen.primary++;let raw='';for await(const part of req)raw+=part;assert.deepEqual(JSON.parse(raw),{});
   if(primaryResponse==='network'){req.socket.destroy();return;}
   res.writeHead(primaryResponse==='rate'?429:503,{'Content-Type':'application/json'});
   res.end(JSON.stringify({error:primaryResponse==='rate'?'RATE_LIMITED':'NOT_CONFIGURED'}));return;
  }
  if(pathname==='/backup/api/session'){
   seen.backup++;let raw='';for await(const part of req)raw+=part;assert.deepEqual(JSON.parse(raw),{});
   res.writeHead(200,{'Content-Type':'application/json'});
   res.end(JSON.stringify({token,expiresAt:Date.now()+3600000}));return;
  }
  if(pathname==='/backup/api/reading'){
   seen.reading++;assert.equal(req.headers.authorization,'Bearer '+token);
   let raw='';for await(const part of req)raw+=part;assert.equal(JSON.parse(raw).cards.length,1);
   res.writeHead(200,{'Content-Type':'application/json'});
   res.end(JSON.stringify({text:'Synthetic backup reading.',provider:'deepseek',model:'fixture'}));return;
  }
  if(pathname==='/ai-config.js'){
   res.setHeader('Content-Type','text/javascript');res.end('window.TAROT_AI_CONFIG={endpoint:"/primary/api/reading",sessionEndpoint:"/primary/api/session",fallbackEndpoint:"/backup/api/reading",fallbackSessionEndpoint:"/backup/api/session"};');return;
  }
  if(pathname==='/locales/en.js'){
   const dict=Object.assign({},...fs.readdirSync(path.join(root,'locales')).filter(n=>/^en-.*\.json$/.test(n)).sort().map(n=>JSON.parse(fs.readFileSync(path.join(root,'locales',n),'utf8'))));
   res.setHeader('Content-Type','text/javascript');res.end('window.TAROT_EN='+JSON.stringify(dict)+';');return;
  }
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin=`http://127.0.0.1:${server.address().port}`;
 try{
  for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
   const browser=await engine.launch(require('./browser_options.cjs'));
   try{
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/?lang=zh');
    assert.equal(await page.locator('.access-screen').count(),0,name+': public entry has no gate');
    const before=seen.primary+seen.backup;await page.waitForTimeout(30);assert.equal(seen.primary+seen.backup,before,name+': opening the app does not request an AI session');
    const result=await page.evaluate(async()=>{
      const spread=window.TAROT_SPREAD_CONTENT.spreads.find(s=>!s.legacy&&s.positions.length===1);
      const state={id:'failover-fixture',phase:'read',spreadId:spread.id,topic:'general',questionText:'Synthetic reading question?',picked:[0],pool:[{id:'m00',reversed:false}],ai:[]};
      let saved=false;await window.TarotReadingAI.request(state,()=>{saved=true;},()=>state);return saved;
    });
    assert.equal(result,true,name+': an explicit AI request uses the backup after a network failure');
    assert.equal(await page.evaluate(()=>window.TarotAccess.readingEndpoint()),origin+'/backup/api/reading');
    await page.reload();assert.equal(await page.locator('.access-screen').count(),0,name+': reload remains public');
    assert.equal(await page.evaluate(()=>window.TarotAccess.readingEndpoint()),origin+'/backup/api/reading',name+': reload keeps the matching reading service');
    await page.evaluate(()=>{const key='tarot-pocket-session-v1',saved=JSON.parse(sessionStorage.getItem(key));saved.serviceEndpoint='https://other.example/api/session';sessionStorage.setItem(key,JSON.stringify(saved));});
    await page.reload();assert.equal(await page.locator('.access-screen').count(),0,name+': an invalid saved endpoint never locks the app');
    assert.equal(await page.evaluate(()=>sessionStorage.getItem('tarot-pocket-session-v1')),null,name+': a removed service cannot reuse its token');
    primaryResponse='rate';const backupCount=seen.backup;
    const rateError=await page.evaluate(async()=>{try{await window.TarotAccess.ensureSession();return '';}catch(e){return e.message;}});
    assert.equal(rateError,'RATE_LIMITED');assert.equal(seen.backup,backupCount,name+': a rate limit does not bypass to another service');
    primaryResponse='network';const recovered=await page.evaluate(async()=>{await window.TarotAccess.ensureSession();return window.TarotAccess.readingEndpoint();});
    assert.equal(recovered,origin+'/backup/api/reading',name+': a later explicit request can recover through failover');
    assert.deepEqual(errors,[]);await context.close();
   }finally{await browser.close();}
  }
  assert.equal(seen.backup,4);assert.equal(seen.reading,2);
  console.log(JSON.stringify({status:'PASS',checks:['public entry creates no AI session','explicit request falls back after network failure','tab session stays bound to its service','invalid saved endpoint clears without locking the app','rate limit does not bypass quotas','later explicit retry recovers'],browsers:['chromium','webkit']}));
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
