/* Exercise the published subdirectory bundle; no reliance on HTTP browser cache. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto');
const {chromium,webkit}=require('playwright');
const failedInstallSnapshot=require('./offline_install_snapshot.cjs');
const root=path.resolve(__dirname,'..'),web=process.env.TAROT_WEB_ROOT||path.join(root,'dist');
const workerSource=fs.readFileSync(path.join(web,'sw.js'),'utf8');
const release=JSON.parse(workerSource.match(/^const RELEASE = (.+);$/m)[1]);
const prefix='tarot-pocket-offline-%2Ftarot-pocket%2F-';
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
assert.equal(release.assets.filter(a=>a.path.startsWith('assets/cards/')).length,78);
for(const asset of release.assets)assert.equal(hash(fs.readFileSync(path.join(web,asset.path))),asset.sha256,'release hashes match published bytes: '+asset.path);
const manifest=JSON.parse(fs.readFileSync(path.join(web,'manifest.webmanifest')));
assert.equal(manifest.scope,'./');assert.equal(manifest.display,'standalone');assert(manifest.start_url.startsWith('./'));
let mode='healthy',update=null,requests=[],lifecycleRequests=[],holdMismatch=null;
const types={'.js':'text/javascript','.html':'text/html','.css':'text/css','.webmanifest':'application/manifest+json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');requests.push(url.pathname);
  if(mode==='offline'){req.socket.destroy();return;}
  if(!url.pathname.startsWith('/tarot-pocket/')){res.writeHead(404);res.end();return;}
  const name=url.pathname.slice('/tarot-pocket/'.length)||'index.html';
  if(['sw.js','index.html','assets/cards/m03.webp'].includes(name))lifecycleRequests.push({at:Date.now(),name,mode,update:!!update,destination:req.headers['sec-fetch-dest']||''});
  if(name.includes('..')||!fs.existsSync(path.join(web,name))){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',types[path.extname(name)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');
  if(mode==='interrupt'&&name==='assets/cards/m03.webp'){res.writeHead(503);res.end('interrupted');return;}
  if(mode==='mismatch'&&name==='assets/cards/m03.webp'){
    if(holdMismatch){const capture=holdMismatch;holdMismatch=null;capture(()=>res.end(Buffer.from('wrong-release-image')));return;}
    res.end(Buffer.from('wrong-release-image'));return;
  }
  if(update&&name==='sw.js'){res.end(update.worker);return;}
  if(update&&name==='index.html'){res.end(update.html);return;}
  fs.createReadStream(path.join(web,name)).pipe(res);
});
const ready=page=>page.waitForFunction(()=>window.TarotOffline?.state.ready,{},{timeout:120000});
async function poll(check){const until=Date.now()+120000;while(Date.now()<until){if(await check())return;await new Promise(resolve=>setTimeout(resolve,100));}throw Error('Timed out waiting for service-worker lifecycle');}
async function showPanel(page){await page.evaluate(()=>{document.querySelector('#overlay').innerHTML=window.TarotOffline.render();});}
async function bounded(promise,label){let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(label)),15000);})]);}finally{clearTimeout(timer);}}
async function browserCheck(type,name,updates){
  const browser=await type.launch(name==='chromium'?require('./browser_options.cjs'):{headless:true});
  try{
    const context=await browser.newContext({viewport:{width:390,height:844}});
    await context.addInitScript(()=>{
      window.__offlineLifecycle=[];
      if(!('serviceWorker' in navigator))return;
      const record=event=>window.__offlineLifecycle.push({at:Date.now(),...event});
      const seen=new WeakSet(),watch=worker=>{if(!worker||seen.has(worker))return;seen.add(worker);record({event:'worker',state:worker.state,url:worker.scriptURL});worker.addEventListener('statechange',()=>record({event:'statechange',state:worker.state,url:worker.scriptURL}));};
      navigator.serviceWorker.addEventListener('message',e=>{if(e.data?.type==='TAROT_OFFLINE'&&e.data.phase!=='downloading')record({event:'message',revision:e.data.revision,phase:e.data.phase,error:e.data.error,sourceState:e.source?.state});});
      navigator.serviceWorker.addEventListener('controllerchange',()=>{record({event:'controllerchange'});watch(navigator.serviceWorker.controller);});
      navigator.serviceWorker.getRegistration().then(reg=>{if(!reg)return;watch(reg.active);watch(reg.installing);watch(reg.waiting);reg.addEventListener('updatefound',()=>{record({event:'updatefound'});watch(reg.installing);});});
    });
    await context.addInitScript(()=>sessionStorage.setItem('tarot-pocket-session-v1',JSON.stringify({token:'tp1.'+'o'.repeat(80),expiresAt:Date.now()+3600000})));
    const page=await context.newPage(),origin=`http://127.0.0.1:${server.address().port}`,url=origin+'/tarot-pocket/?lang=zh';
    const external=[],errors=[];page.on('request',request=>{if(!request.url().startsWith(origin)&&/^https?:/.test(request.url()))external.push(request.url());});page.on('pageerror',error=>errors.push(error.message));
    await page.goto(url);await page.waitForFunction(()=>window.TarotOffline?.state.phase==='not-ready');
    assert.equal(await page.evaluate(()=>navigator.serviceWorker.controller),null,'first visit does not silently download the offline package');
    await showPanel(page);await page.getByRole('button',{name:'下载离线内容',exact:true}).click();await ready(page);
    assert.equal((await page.evaluate(()=>window.TarotOffline.state)).cards,78);
    assert.equal(await page.evaluate(()=>navigator.serviceWorker.controller!==null),true);
    await showPanel(page);await page.getByText('离线内容已检查',{exact:true}).waitFor();
    await page.evaluate(()=>window.TAROT_I18N.setLocale('en'));await page.getByText('Offline content verified',{exact:true}).waitFor();
    assert(!/[\u3400-\u9fff]/.test(await page.locator('[data-offline-panel]').innerText()),'offline panel is completely bilingual');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'offline panel fits 390px');
    const localBefore=await page.evaluate(()=>({...localStorage}));
    // Playwright WebKit's setOffline + SW navigation also fails for a minimal
    // cache.add('/') / caches.match('/') control app on macOS. Disconnect the
    // entire served origin there; CSP forbids any other runtime network origin.
    if(name==='webkit')mode='offline';else await context.setOffline(true);
    // Use the page's reload path, also used by an in-app refresh. Playwright's
    // WebKit automation reload has an upstream service-worker cancellation bug.
    await Promise.all([page.waitForNavigation({waitUntil:'load'}),page.evaluate(()=>location.reload())]);await ready(page);
    const localAfter=await page.evaluate(()=>({...localStorage}));
    for(const [key,value] of Object.entries(localBefore))assert.equal(localAfter[key],value,'offline reload preserves existing records: '+key);
    // Decode all cards in a fresh page; most were never seen before going offline.
    await page.evaluate(async ids=>{for(const id of ids){const image=new Image();image.src='assets/cards/'+id+'.webp';await image.decode();if(image.naturalWidth<100)throw Error('bad card '+id);}},release.assets.filter(a=>a.path.startsWith('assets/cards/')).map(a=>path.basename(a.path,'.webp')));
    await page.close();const reopened=await context.newPage();await reopened.goto(url);await ready(reopened);
    const localReopened=await reopened.evaluate(()=>({...localStorage}));
    for(const [key,value] of Object.entries(localBefore))assert.equal(localReopened[key],value,'closing and reopening keeps existing records: '+key);
    // Missing one cached card must invalidate readiness, then repair after reconnecting.
    await reopened.evaluate(async p=>{const key=(await caches.keys()).find(k=>k.startsWith(p));const cache=await caches.open(key);await cache.delete(new URL('assets/cards/c14.webp',location.href).href);},prefix);
    assert.equal((await reopened.evaluate(()=>window.TarotOffline.check())).ready,false);
    if(name==='webkit')mode='healthy';else await context.setOffline(false);
    await reopened.evaluate(()=>window.TarotOffline.prepare());await ready(reopened);
    if(updates){
      const originalController=await reopened.evaluate(()=>navigator.serviceWorker.controller.scriptURL);
      const next=structuredClone(release);next.revision=release.revision+'-update';
      const html=fs.readFileSync(path.join(web,'index.html'),'utf8').replaceAll(release.revision,next.revision);
      next.assets.find(a=>a.path==='index.html').sha256=hash(html);
      update={html,worker:workerSource.replace(/^const RELEASE = .+;$/m,'const RELEASE = '+JSON.stringify(next)+';')};
      mode='mismatch';
      const failedUpdate=await reopened.evaluate(async()=>{
        const reg=await navigator.serviceWorker.getRegistration();
        const ended=new Promise(resolve=>reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker.addEventListener('statechange',()=>{if(['installed','redundant'].includes(worker.state))resolve(worker.state);});},{once:true}));
        await reg.update();return ended;
      });
      assert.equal(failedUpdate,'redundant','mismatched release is rejected during installation');
      assert.equal((await reopened.evaluate(()=>window.TarotOffline.check())).ready,true,'failed update leaves the complete previous release usable');
      assert.equal(await reopened.evaluate(()=>navigator.serviceWorker.controller.scriptURL),originalController);
      const remainingKeys=(await failedInstallSnapshot(reopened,prefix)).keys;
      if(remainingKeys.length!==1||remainingKeys[0]!==prefix+release.revision){
        const session=await context.newCDPSession(reopened),inventory=[];
        try{for(const cache of (await session.send('CacheStorage.requestCacheNames',{securityOrigin:origin})).caches){const entries=await session.send('CacheStorage.requestEntries',{cacheId:cache.cacheId,pageSize:150});inventory.push({name:cache.cacheName,count:entries.returnCount,paths:entries.cacheDataEntries.map(e=>new URL(e.requestURL).pathname)});}}catch(error){inventory.push({diagnosticError:error.message});}finally{await session.detach();}
        console.error('Offline failed-update lifecycle diagnostic',JSON.stringify({remainingKeys,inventory,requests:lifecycleRequests.slice(-40),page:await reopened.evaluate(async()=>({events:window.__offlineLifecycle,state:window.TarotOffline.state,registration:await navigator.serviceWorker.getRegistration().then(r=>({active:r?.active?.state,installing:r?.installing?.state,waiting:r?.waiting?.state}))}))}));
      }
      assert.deepEqual(remainingKeys,[prefix+release.revision],'failed revision does not leave a partial cache');
      // Real navigation-triggered background update, with no second reg.update().
      // Hold a response after verified writes so the previously racy observation
      // is deterministic: old cache complete, new cache partial, worker installing.
      const heldResponse=new Promise(resolve=>{holdMismatch=resolve;});
      const nativePage=await context.newPage();await nativePage.goto(url);await ready(nativePage);
      const releaseMismatch=await bounded(heldResponse,'Navigation did not trigger the native background update');
      const during=await reopened.evaluate(async p=>({keys:(await caches.keys()).filter(key=>key.startsWith(p)),installing:(await navigator.serviceWorker.getRegistration()).installing?.state}),prefix);
      assert.equal(during.installing,'installing','native background installation is actually in progress');
      assert(during.keys.includes(prefix+release.revision)&&during.keys.includes(prefix+next.revision),'the original premature assertion would observe a partial cache');
      let signalWaiting;const waiting=new Promise(resolve=>{signalWaiting=resolve;});
      await reopened.exposeFunction('__offlineWaitingForNativeInstall',()=>signalWaiting());
      let snapshotFinished=false;
      const afterNative=failedInstallSnapshot(reopened,prefix,{waitingSignal:'__offlineWaitingForNativeInstall'}).then(result=>{snapshotFinished=true;return result;});
      await bounded(waiting,'Cache inspection did not observe the native installing worker');
      assert.equal(snapshotFinished,false,'cache inspection waits for installation rather than ignoring its partial cache');
      assert.equal((await reopened.evaluate(()=>window.TarotOffline.check())).ready,true,'previous release stays usable during the second installation');
      releaseMismatch();const nativeSnapshot=await afterNative;
      assert(nativeSnapshot.completed>=1);assert(nativeSnapshot.states.every(state=>state==='redundant'));
      assert.deepEqual(nativeSnapshot.keys,[prefix+release.revision],'failed native background revision does not leave a partial cache');
      assert.equal((await reopened.evaluate(()=>window.TarotOffline.check())).ready,true,'previous release stays usable after both failed installations');
      await nativePage.close();
      mode='healthy';update.worker+='\n// Retry after interrupted publication.\n';
      await reopened.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();await reg.update();});
      await poll(()=>reopened.evaluate(async()=>!!(await navigator.serviceWorker.getRegistration()).waiting));
      assert.equal(await reopened.evaluate(()=>document.querySelector('meta[name="tarot-build"]').content),release.revision,'update does not replace active lesson code');
      await reopened.evaluate(()=>caches.open('unrelated-project-cache'));
      await reopened.close();
      const finalPage=await context.newPage();
      // Observe from outside the app scope while all controlled pages are closed.
      // Immediately opening another app tab can legitimately keep the old worker alive.
      await finalPage.goto(origin+'/probe');
      await poll(()=>finalPage.evaluate(async({url,revision})=>{
        const reg=await navigator.serviceWorker.getRegistration(url);
        if(reg?.active?.state!=='activated'||reg.waiting||reg.installing)return false;
        return new Promise(resolve=>{const channel=new MessageChannel();channel.port1.onmessage=e=>resolve(e.data.revision===revision&&e.data.ready);reg.active.postMessage({type:'TAROT_OFFLINE_STATUS'},[channel.port2]);});
      },{url,revision:next.revision}));
      const beforeOpen=await finalPage.evaluate(async()=>{const out={};for(const key of await caches.keys()){const cache=await caches.open(key);const req=(await cache.keys()).find(r=>r.url.endsWith('/index.html'));out[key]=req?(await (await cache.match(req)).text()).match(/name="tarot-build" content="([^\"]+)"/)?.[1]:'none';}return out;});
      await finalPage.goto(url);await ready(finalPage);
      const activated=await finalPage.evaluate(async()=>({state:window.TarotOffline.state,meta:document.querySelector('meta[name="tarot-build"]').content,keys:await caches.keys(),reg:await navigator.serviceWorker.getRegistration().then(r=>({active:r.active?.state,waiting:r.waiting?.state,installing:r.installing?.state}))}));
      assert.equal(activated.state.revision,next.revision,JSON.stringify({beforeOpen,activated}));
      const keys=await finalPage.evaluate(()=>caches.keys());assert(keys.includes('unrelated-project-cache'));assert(!keys.includes(prefix+release.revision),'old cache removed only once new release activates');
      await finalPage.close();update=null;
    }
    assert.deepEqual(external,[]);assert.deepEqual(errors,[]);
    await context.close();
    // Clean installation interrupted mid-download: no readiness and no leftover partial cache.
    mode='interrupt';const failed=await browser.newContext({viewport:{width:375,height:812}});await failed.addInitScript(()=>sessionStorage.setItem('tarot-pocket-session-v1',JSON.stringify({token:'tp1.'+'o'.repeat(80),expiresAt:Date.now()+3600000})));const failedPage=await failed.newPage();
    await failedPage.goto(url);await failedPage.evaluate(()=>window.TarotOffline.prepare());await failedPage.waitForFunction(()=>window.TarotOffline?.state.phase==='error',{},{timeout:120000});
    assert.equal((await failedPage.evaluate(()=>window.TarotOffline.state)).ready,false);
    assert.deepEqual(await failedPage.evaluate(async p=>(await caches.keys()).filter(k=>k.startsWith(p)),prefix),[]);
    mode='healthy';await failedPage.evaluate(()=>window.TarotOffline.prepare());await ready(failedPage);await failed.close();
    return {browser:name,status:'PASS',networkMethod:name==='webkit'?'all requests to the application origin disconnected; Playwright offline-emulation navigation fails in a minimal control app':'browser offline emulation',checks:['subdirectory scope','explicit download','complete 78-card cache','no external runtime requests','bilingual status','offline reload and reopen','cache eviction detected and repaired','interrupted installation retried',...(updates?['mixed-revision update rejected','native background reinstallation observed and rejected','cache assertion waits for native installation cleanup','active lesson preserved','new release activated after closing pages','unrelated caches preserved']:[])]};
  }finally{mode='healthy';update=null;holdMismatch=null;await browser.close();}
}
(async()=>{
  await require('./check_offline_lifecycle.cjs')();
  await require('./check_offline_snapshot.cjs')();
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{
    const results=[await browserCheck(chromium,'chromium',true)];
    if(fs.existsSync(webkit.executablePath()))results.push(await browserCheck(webkit,'webkit',false));
    else results.push({browser:'webkit',status:'NOT_RUN',reason:'Playwright WebKit is not installed; this does not establish physical iPhone readiness.'});
    const upgrade=await require('./check_upgrade.cjs')(web);
    console.log(JSON.stringify({status:'PASS',revision:release.revision,offlineAssets:release.assets.length,results,upgrade}));
  }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
