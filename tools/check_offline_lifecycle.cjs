/* Deterministic worker lifecycle checks. All caches/responses are synthetic. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const scope='https://offline-fixture.invalid/tarot-pocket/',prefix='tarot-pocket-offline-%2Ftarot-pocket%2F-';
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
async function checkWorkerLifecycle(source=fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8')){
 const assets=Array.from({length:78},(_,i)=>({path:`assets/cards/test-${i}.webp`,sha256:hash('card-'+i)}));
 const release={revision:'lifecycle-test',assets},key=prefix+release.revision,previous=prefix+'previous';
 const stores=new Map([[previous,new Map([['old-file',new Response('preserved')]])]]),listeners={},messages=[];
 let fail=true,afterDelete,deleted=false,fetches=0;
 const caches={
  async open(name){if(!stores.has(name))stores.set(name,new Map());const store=stores.get(name);return {match:async url=>store.get(String(url))?.clone(),put:async(url,response)=>{store.set(String(url),response.clone());}};},
  async match(url,{cacheName}={}){return stores.get(cacheName)?.get(String(url))?.clone();},
  async delete(name){const result=stores.delete(name);if(name===key){deleted=true;afterDelete?.();}return result;},
  async keys(){return [...stores.keys()];}
 };
 const context=vm.createContext({URL,Request,Response,Headers,AbortController,setTimeout,clearTimeout,crypto:crypto.webcrypto,caches,
  fetch:async request=>{fetches++;const index=Number(new URL(request.url).pathname.match(/test-(\d+)/)?.[1]);return new Response(fail&&index===3?'bad revision':'card-'+index);},
  self:{registration:{scope},clients:{matchAll:async()=>[{url:scope,postMessage:message=>messages.push(message)}],claim:async()=>{}},skipWaiting:async()=>{},addEventListener:(name,callback)=>{listeners[name]=callback;}}
 });
 vm.runInContext(source.replace(/^const RELEASE = .+;$/m,'const RELEASE = '+JSON.stringify(release)+';'),context);
 const message=async type=>{let pending,result;listeners.message({data:{type},ports:[{postMessage:value=>{result=value;}}],waitUntil:value=>{pending=value;}});await pending;return result;};
 const install=()=>{let pending;listeners.install({waitUntil:value=>{pending=value;}});return pending;};
 const before=[...stores.keys()];
 const empty=await message('TAROT_OFFLINE_STATUS'),afterInitialStatus=[...stores.keys()];assert.equal(empty.ready,false);assert.equal(empty.done,0);assert.equal(fetches,0,'status does not fetch content');
 // Schedule a status message at the cleanup boundary, before the failed install
 // promise settles. Neither this message nor later checks may recreate a cache.
 let lateStatus;afterDelete=()=>{lateStatus=message('TAROT_OFFLINE_STATUS');};
 await assert.rejects(install(),/revision-mismatch/);assert(deleted);assert.equal((await lateStatus).ready,false);
 assert.deepEqual([...stores.keys()],[previous],'a status query racing failed-install cleanup does not recreate its cache');
 assert.deepEqual(afterInitialStatus,before,'status before download is read-only');
 assert.equal((await message('TAROT_OFFLINE_STATUS')).ready,false);assert.deepEqual([...stores.keys()],[previous]);
 assert.equal(await (await caches.open(previous)).match('old-file').then(r=>r.text()),'preserved','the previous revision is not touched');
 assert(messages.some(m=>m.phase==='error'&&m.error==='revision-mismatch'));
 fail=false;afterDelete=null;await install();const ready=await message('TAROT_OFFLINE_STATUS');assert.equal(ready.ready,true);assert.equal(ready.cards,78);assert.equal(ready.done,78);assert.deepEqual([...stores.keys()],[previous,key],'an explicit later installation can succeed');
 return {status:'PASS',checks:['status is read-only','status during failed-install cleanup does not resurrect a cache','previous revision preserved','explicit retry completes all 78 cards']};
}
module.exports=checkWorkerLifecycle;
if(require.main===module)checkWorkerLifecycle().then(result=>console.log(JSON.stringify(result))).catch(error=>{console.error(error);process.exitCode=1;});
