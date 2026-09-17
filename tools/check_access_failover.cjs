/* A real browser exercises the invitation failover with isolated local routes. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require('playwright'),root=path.resolve(__dirname,'..');
const invite='ABCD2345',token='tp1.'+'f'.repeat(80);
(async()=>{
 const seen={primary:0,backup:0,reading:0};let primaryResponse='network';
 const server=http.createServer(async(req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/primary/api/session'){
   seen.primary++;
   if(primaryResponse==='network'){req.socket.destroy();return;}
   res.writeHead(primaryResponse==='rate'?429:401,{'Content-Type':'application/json'});
   res.end(JSON.stringify({error:primaryResponse==='rate'?'RATE_LIMITED':'AUTH_REQUIRED'}));return;
  }
  if(pathname==='/backup/api/session'){
   seen.backup++;let raw='';for await(const part of req)raw+=part;
   const correct=JSON.parse(raw).inviteCode===invite;
   res.writeHead(correct?200:401,{'Content-Type':'application/json'});
   res.end(JSON.stringify(correct?{token,expiresAt:Date.now()+3600000}:{error:'AUTH_REQUIRED'}));return;
  }
  if(pathname==='/backup/api/reading'){
   seen.reading++;assert.equal(req.headers.authorization,'Bearer '+token);
   let raw='';for await(const part of req)raw+=part;
   assert(JSON.parse(raw).cards.length===1);
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
  res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'})[path.extname(file)]||'application/octet-stream');
  res.end(fs.readFileSync(file));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin=`http://127.0.0.1:${server.address().port}`;
 try{
  for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
   const browser=await engine.launch(require('./browser_options.cjs'));
   try{
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin+'/?lang=zh');
    const field=page.locator('[data-invite-code]');await field.fill('BAD23456');await field.press('Enter');
    await page.getByText('邀请码不正确，请检查后重试。').waitFor();
    assert.equal(await field.inputValue(),'BAD23456','a failed invitation remains editable');
    await field.fill(invite);await field.press('Enter');await page.locator('.access-screen').waitFor({state:'detached'});
    assert.equal(await page.evaluate(()=>window.TarotAccess.readingEndpoint()),origin+'/backup/api/reading');
    const result=await page.evaluate(async()=>{
      const spread=window.TAROT_SPREAD_CONTENT.spreads.find(s=>!s.legacy&&s.positions.length===1);
      const state={id:'failover-fixture',phase:'read',spreadId:spread.id,topic:'general',questionText:'Synthetic reading question?',picked:[0],pool:[{id:'m00',reversed:false}],ai:[]};
      let saved=false;await window.TarotReadingAI.request(state,()=>{saved=true;},()=>state);return saved;
    });
    assert.equal(result,true,'the reading uses the validated backup session');
    await page.reload();assert.equal(await page.locator('.access-screen').count(),0,'reload keeps the valid tab session');
    assert.equal(await page.evaluate(()=>window.TarotAccess.readingEndpoint()),origin+'/backup/api/reading','reload keeps the matching reading service');
    await page.evaluate(()=>{const key='tarot-pocket-session-v1',saved=JSON.parse(sessionStorage.getItem(key));saved.serviceEndpoint='https://other.example/api/session';sessionStorage.setItem(key,JSON.stringify(saved));});
    await page.reload();await page.locator('.access-screen').waitFor();
    assert.equal(await page.evaluate(()=>sessionStorage.getItem('tarot-pocket-session-v1')),null,'a removed service cannot reuse its token with another service');
    for(const [response,message] of [['auth','邀请码不正确，请检查后重试。'],['rate','尝试次数较多，请稍后再试。']]){
      primaryResponse=response;const backupCount=seen.backup;
      await page.locator('[data-invite-code]').fill('BAD23456');await page.locator('[data-invite-code]').press('Enter');
      await page.getByText(message).waitFor();assert.equal(seen.backup,backupCount,'an explicit primary rejection cannot use the backup');
    }
    primaryResponse='network';
    assert.deepEqual(errors,[]);await context.close();
   }finally{await browser.close();}
  }
  assert(seen.primary>=4,'both browser engines attempted the unavailable primary route');
  assert.equal(seen.backup,4);assert.equal(seen.reading,2);
  console.log(JSON.stringify({status:'PASS',checks:['network failure falls back','wrong invitation remains rejected and editable','valid backup session stays on the backup reading route after reload','a removed service invalidates its old session','explicit primary rejection and rate limit cannot use backup'],browsers:['chromium','webkit']}));
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
