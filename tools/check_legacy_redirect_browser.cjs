'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'..');
const oldHTML='<!doctype html><meta charset="utf-8"><title>old</title><h1 id="legacy">1.7.3 cached page</h1>';
const oldWorker=`
const CACHE='tarot-pocket-offline-%2Ftarot-pocket%2F-1.7.3';
const INDEX=new URL('index.html',self.registration.scope).href;
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.put(INDEX,new Response(${JSON.stringify(oldHTML)},{headers:{'Content-Type':'text/html'}}));await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url),scope=new URL(self.registration.scope);if(event.request.mode==='navigate'&&[scope.pathname,scope.pathname+'index.html'].includes(url.pathname))event.respondWith(caches.match(INDEX));});
`;

(async()=>{
  let stage='old',origin='';
  const server=http.createServer((req,res)=>{
    const url=new URL(req.url,'http://localhost');
    res.setHeader('Cache-Control','no-store');
    if(url.pathname==='/tarot-pocket/sw.js'){
      res.setHeader('Content-Type','text/javascript');
      if(stage==='old'){res.end(oldWorker);return;}
      const current=fs.readFileSync(path.join(root,'sw.js'),'utf8')
        .replace("'georgelu-creator.github.io'","'127.0.0.1'")
        .replace('https://tarot.georgelu.cn/',origin+'/target/');
      res.end(current);return;
    }
    if(url.pathname==='/target/' || url.pathname==='/target'){
      res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta charset="utf-8"><h1 id="target">production</h1>');return;
    }
    if(url.pathname==='/tarot-pocket/' || url.pathname==='/tarot-pocket/index.html'){
      res.setHeader('Content-Type','text/html');res.end(`<!doctype html><meta charset="utf-8"><h1>bootstrap</h1><script>window.workerReady=(async()=>{await navigator.serviceWorker.register('sw.js',{scope:'./',updateViaCache:'none'});await navigator.serviceWorker.ready;return true;})()</script>`);return;
    }
    res.writeHead(404);res.end();
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  origin=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch(require('./browser_options.cjs'));
  try{
    const context=await browser.newContext();
    const page=await context.newPage();
    const legacy=origin+'/tarot-pocket/?lang=zh&v=1.7.3-old#reading';
    await page.goto(legacy);await page.evaluate(()=>window.workerReady);await page.reload();
    await page.locator('#legacy').waitFor();
    await page.evaluate(()=>{localStorage.setItem('tarot-legacy-export-fixture','kept');return caches.open('unrelated-project-cache');});
    stage='new';
    await page.evaluate(async()=>{const registration=await navigator.serviceWorker.getRegistration();await registration.update();});
    await page.waitForURL(origin+'/target/?lang=zh#reading',{timeout:20000});
    await page.locator('#target').waitFor();
    assert.equal(await page.evaluate(()=>localStorage.getItem('tarot-legacy-export-fixture')),'kept');
    const keys=await page.evaluate(()=>caches.keys());
    assert(keys.includes('tarot-pocket-offline-%2Ftarot-pocket%2F-1.7.3'),'legacy cache remains available for the explicit export escape');
    assert(keys.includes('unrelated-project-cache'),'unrelated origin caches are untouched');
    const registration=await page.evaluate(async scope=>{const item=await navigator.serviceWorker.getRegistration(scope);return {active:item?.active?.state,waiting:item?.waiting?.state||null,installing:item?.installing?.state||null};},origin+'/tarot-pocket/');
    assert.deepEqual(registration,{active:'activated',waiting:null,installing:null});
    await context.close();
    console.log('PASS: real Chromium upgrades a cached 1.7 worker, activates without deadlock, and redirects to the production URL with useful state preserved.');
  }finally{
    await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
