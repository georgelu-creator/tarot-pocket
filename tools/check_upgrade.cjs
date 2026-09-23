/* Regression: a genuinely cached v1.0.0 must escape through update.html. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),keys=['tarot-pocket-demo-v1','tarot-learning-units-v2','tarot-reading-v3'];
const releaseAt=web=>JSON.parse(fs.readFileSync(path.join(web,'sw.js'),'utf8').match(/^const RELEASE = (.+);$/m)[1]);
const types={'.js':'text/javascript','.html':'text/html','.css':'text/css','.webmanifest':'application/manifest+json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
// New releases may add optional schema fields; every existing field and array
// must remain byte-for-byte equivalent in meaning, including private readings.
function retained(actual,expected,label){if(expected&&typeof expected==='object'&&!Array.isArray(expected)){assert(actual&&typeof actual==='object',label);for(const key of Object.keys(expected))retained(actual[key],expected[key],label+'.'+key);}else assert.deepEqual(actual,expected,label);}
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
async function upgradeCheck(web=path.join(root,'dist')){
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'tarot-upgrade-')),oldRoot=path.join(temp,'old'),current=path.join(temp,'current');fs.mkdirSync(oldRoot);fs.cpSync(web,current,{recursive:true});
 const archive=execFileSync('git',['archive','v1.0.0'],{cwd:root,maxBuffer:100*1024*1024});execFileSync('tar',['-x','-C',oldRoot],{input:archive});
 execFileSync(process.env.PYTHON||'python3',['tools/build_demo.py'],{cwd:oldRoot});
 const previous=path.join(oldRoot,'dist'),oldRelease=releaseAt(previous),release=releaseAt(current);
 assert(release.revision!==oldRelease.revision);
 const html=fs.readFileSync(path.join(current,'index.html'),'utf8');
 for(const tag of html.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^\"]+\.(?:js|css)[^\"]*)"/g))assert(tag[1].endsWith('?v='+release.revision),'every script and stylesheet has the document release fingerprint');
 assert(!release.assets.some(a=>a.path==='update.html'),'recovery entry must always come from the network');
 const updateHTML=fs.readFileSync(path.join(current,'update.html'),'utf8'),script=updateHTML.match(/<script>([\s\S]*?)<\/script>/)[1];
 assert(updateHTML.includes("script-src 'sha256-"+crypto.createHash('sha256').update(script).digest('base64')+"'"));
 let serveOld=true,broken=false,offline=false;
 const server=http.createServer((req,res)=>{
   if(offline){req.socket.destroy();return;}
   const url=new URL(req.url,'http://localhost'),name=url.pathname.replace(/^\/tarot-pocket\//,'')||'index.html';
   if(!url.pathname.startsWith('/tarot-pocket/')||name.includes('..')){res.writeHead(404);res.end();return;}
   // update.html is deliberately outside v1.0.0's precache, just as on Pages.
   const dir=name==='update.html'?current:serveOld?previous:current,file=path.join(dir,name);
   if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}
   res.setHeader('Content-Type',types[path.extname(name)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');
   if(broken&&name==='assets/cards/m03.webp'){res.writeHead(503);res.end('interrupted');return;}
   fs.createReadStream(file).pipe(res);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch(require('./browser_options.cjs'));
 try{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await context.newPage(),origin=`http://127.0.0.1:${server.address().port}`,url=origin+'/tarot-pocket/?lang=zh&v=793e792';
 page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url);await page.waitForFunction(()=>window.TarotOffline?.state.phase==='not-ready');await page.evaluate(()=>window.TarotOffline.prepare());await page.waitForFunction(()=>window.TarotOffline?.state.ready,{},{timeout:120000});
 // Create a real unfinished v1.0 lesson. Also retain old-unit state and reading settings.
 await page.locator('[data-home-choice][data-journey=continue]').click();await page.locator('[data-journey=next]').click();await page.locator('[data-journey=answer][data-value=yes]').click();
 await page.locator('[data-action=nav][data-page=home]').first().click();await page.locator('.bottomnav [data-page=library]').click();await page.locator('.advanced-learning>summary').click();await page.locator('[data-learn-start]').first().click();
 await page.locator('[data-learn=home]').first().click();await page.locator('.bottomnav [data-page=reading]').click();await page.locator('[data-reading=guide][data-value=one]').click();await page.locator('[data-reading=use-spread]').click();await page.locator('[data-reading-question]').fill('Private upgrade regression question');await page.locator('[data-reading=start]').click();await page.locator('[data-reading=pick]').first().click();
 const before=await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,JSON.parse(localStorage.getItem(k))])),keys);for(const k of keys)assert(before[k],'existing storage key '+k);
 const oldSession=before[keys[0]].journey.session;assert.equal(Object.keys(oldSession.answers).length,1);
 await page.evaluate(()=>caches.open('unrelated-project-cache'));
 serveOld=false;
 await page.reload();assert.equal(await page.locator('meta[name=tarot-build]').getAttribute('content'),oldRelease.revision,'an old ?v= URL remains in v1.0 cache before explicit recovery');
 // The old page remains open throughout installation and activation.
 const updatePage=await context.newPage();updatePage.on('pageerror',e=>errors.push(e.message));await updatePage.goto(origin+'/tarot-pocket/update.html?lang=en');assert.equal(await updatePage.locator('html').getAttribute('lang'),'zh-CN');assert.equal(await updatePage.locator('#language,[data-language-toggle]').count(),0,'recovery page has no public language switch');
 await updatePage.waitForFunction(()=>window.TarotUpdate);assert.equal(await updatePage.evaluate(()=>window.TarotUpdate.state.revision),release.revision,'network recovery entry escapes the old worker');
 broken=true;await updatePage.locator('#download').click();await updatePage.waitForFunction(()=>window.TarotUpdate.state.phase==='failed',{},{timeout:120000});
 assert.deepEqual(await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,JSON.parse(localStorage.getItem(k))])),keys),before,'interrupted update cannot alter progress');
 assert.equal((await page.evaluate(()=>window.TarotOffline.check())).ready,true,'old complete offline package survives interrupted update');
 assert(!(await page.evaluate(()=>caches.keys())).some(k=>k.endsWith(release.revision)),'failed installation removes only its partial cache');
 broken=false;await updatePage.locator('#download').click();await updatePage.waitForFunction(()=>window.TarotUpdate.state.phase==='ready',{},{timeout:120000});
 assert.equal(await page.locator('meta[name=tarot-build]').getAttribute('content'),oldRelease.revision,'download never refreshes the older lesson tab');
 const waiting=await updatePage.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();return {waiting:!!r.waiting,active:!!r.active};});assert(waiting.waiting&&waiting.active);
 assert.equal(await updatePage.locator('#continue').innerText(),'保留记录，进入新版','?lang=en keeps the recovery flow in Chinese');
 await updatePage.locator('#continue').click();await updatePage.waitForURL(u=>u.pathname==='/tarot-pocket/'&&u.searchParams.get('v')===release.revision).catch(async error=>{console.error('Activation diagnostic',JSON.stringify(await updatePage.evaluate(async()=>({url:location.href,state:window.TarotUpdate?.state,reg:await navigator.serviceWorker.getRegistration().then(r=>({active:r.active?.state,waiting:r.waiting?.state,installing:r.installing?.state}))}))));throw error;});await updatePage.waitForFunction(()=>window.TarotOffline?.state.ready);
 assert.equal(await updatePage.locator('meta[name=tarot-build]').getAttribute('content'),release.revision);
 retained(await updatePage.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,JSON.parse(localStorage.getItem(k))])),keys),before,'every legacy record field survives explicit update');
 assert.equal(await page.locator('meta[name=tarot-build]').getAttribute('content'),oldRelease.revision,'explicit upgrade still does not reload other tabs');
 const cachesAfter=await updatePage.evaluate(()=>caches.keys());assert(cachesAfter.includes('unrelated-project-cache'));assert(cachesAfter.some(k=>k.endsWith(oldRelease.revision)),'old-tab assets remain available');
 const inventory=await updatePage.evaluate(async revision=>{const key=(await caches.keys()).find(k=>k.endsWith(revision)),cache=await caches.open(key),out=[];for(const request of await cache.keys()){const response=await cache.match(request);out.push({url:request.url,integrity:response.headers.get('X-Tarot-Integrity'),hash:[...new Uint8Array(await crypto.subtle.digest('SHA-256',await response.arrayBuffer()))].map(x=>x.toString(16).padStart(2,'0')).join('')});}return out;},release.revision);
 assert.equal(inventory.length,release.assets.length);for(const asset of release.assets){const actual=inventory.find(x=>x.url.endsWith('/'+asset.path));assert(actual);assert.equal(actual.hash,asset.sha256);assert.equal(actual.integrity,asset.sha256);}
 // A synthetic previous v1.1-style module request is served from its own cache.
 const priorScript=await updatePage.evaluate(async revision=>{const response=await fetch('app.js?v='+revision);return {status:response.status,text:await response.text()};},oldRelease.revision);assert.equal(priorScript.status,200);assert.equal(hash(priorScript.text),oldRelease.assets.find(a=>a.path==='app.js').sha256);
 const wrongVersion=await updatePage.evaluate(async()=>{const response=await fetch('app.js?v=unknown-build');return response.status;});assert.equal(wrongVersion,409,'missing historical version never silently receives a new script');
 await context.setOffline(true);await updatePage.reload();await updatePage.waitForFunction(()=>window.TarotOffline?.state.ready);
 retained(await updatePage.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,JSON.parse(localStorage.getItem(k))])),keys),before,'offline reopen retains all three old records');
 const restored=await updatePage.evaluate(()=>JSON.parse(localStorage.getItem('tarot-pocket-demo-v1')).journey.session);assert.deepEqual(restored,oldSession,'unfinished card resumes with the same question and answer');
 await updatePage.evaluate(async()=>{const image=new Image();image.src='assets/cards/p14.webp';await image.decode();});
 assert.deepEqual(errors,[]);await context.close();
 return {status:'PASS',from:oldRelease.revision,to:release.revision,checks:['actual v1.0 cached query URL reproduced','independent recovery page bypasses old cache','?lang=en recovery remains zh-CN with no language toggle','matching CSP hash','versioned runtime resources','interrupted update keeps previous package','explicit activation only','no other-tab reload','old-version asset isolation','three records and unfinished lesson preserved exactly','complete SHA256 cache inventory','offline reopen and unfamiliar card','unrelated caches preserved']};
 }finally{await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
}
module.exports=upgradeCheck;
if(require.main===module)upgradeCheck(process.env.TAROT_WEB_ROOT).then(result=>console.log(JSON.stringify(result))).catch(error=>{console.error(error);process.exitCode=1;});
