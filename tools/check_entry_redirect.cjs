const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'..','entry-redirect.js'),'utf8');
function run(location){
  let replaced='';
  const value={...location,replace(url){replaced=url;}};
  vm.runInNewContext(source,{location:value,URL,URLSearchParams});
  return replaced;
}

assert.equal(
  run({hostname:'georgelu-creator.github.io',pathname:'/tarot-pocket/',search:'?lang=zh&v=old',hash:'#reading'}),
  'https://tarot.georgelu.cn/?lang=zh#reading'
);
assert.equal(
  run({hostname:'georgelu-creator.github.io',pathname:'/tarot-pocket/admin.html',search:'?days=7',hash:''}),
  'https://tarot.georgelu.cn/admin.html?days=7'
);
assert.equal(run({hostname:'tarot.georgelu.cn',pathname:'/',search:'',hash:''}),'');
assert.equal(run({hostname:'georgelu-creator.github.io',pathname:'/another-project/',search:'',hash:''}),'');
assert.equal(run({hostname:'georgelu-creator.github.io',pathname:'/tarot-pocket/',search:'?legacy=export',hash:''}),'','the documented legacy-data escape stays on the old origin');
console.log('PASS: legacy Pages links redirect to tarot.georgelu.cn while preserving useful URL state.');

async function checkLegacyWorkerMigration(){
  const workerSource=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8');
  const listeners={},deleted=[],navigated=[];
  let skipped=false,claimed=false;
  const scope='https://georgelu-creator.github.io/tarot-pocket/';
  const client={
    url:scope+'?lang=zh&v=1.7.3-old#reading',
    navigate(url){navigated.push(url);return Promise.resolve(this);}
  };
  const context=vm.createContext({
    URL,Request,Response,Headers,AbortController,setTimeout,clearTimeout,
    crypto:require('node:crypto').webcrypto,
    fetch:async()=>{throw Error('legacy migration must not download the application');},
    caches:{
      keys:async()=>['tarot-pocket-offline-%2Ftarot-pocket%2F-1.7.3','unrelated-project-cache'],
      delete:async key=>{deleted.push(key);return true;}
    },
    self:{
      location:new URL(scope+'sw.js'),
      registration:{scope},
      clients:{claim:async()=>{claimed=true;},matchAll:async()=>[client]},
      skipWaiting:async()=>{skipped=true;},
      addEventListener:(name,callback)=>{listeners[name]=callback;}
    }
  });
  vm.runInContext(workerSource,context);
  const dispatch=async(name,event={})=>{
    let pending;
    listeners[name]({...event,waitUntil:value=>{pending=value;}});
    if(pending)await pending;
  };
  await dispatch('install');
  assert.equal(skipped,true,'legacy Pages worker activates without waiting for the old application');
  await dispatch('activate');
  assert.equal(claimed,true);
  await new Promise(resolve=>setTimeout(resolve,10));
  assert.deepEqual(deleted,[],'migration keeps the old cache available for an explicit data export');
  assert.equal(navigated.length,1);
  const migration=new URL(navigated[0]);
  assert.equal(migration.origin,'https://georgelu-creator.github.io');
  assert.equal(migration.searchParams.get('__tarot_move'),'1');
  assert.equal(migration.searchParams.get('__tarot_hash'),'reading');
  assert.equal(migration.hash,'');
  let response;
  listeners.fetch({
    request:{method:'GET',mode:'navigate',url:migration.href},
    respondWith:value=>{response=value;}
  });
  const redirect=await response;
  assert.equal(redirect.status,302);
  assert.equal(redirect.headers.get('location'),'https://tarot.georgelu.cn/?lang=zh#reading');

  client.url=scope+'?legacy=export';deleted.length=0;navigated.length=0;
  await dispatch('activate');
  await new Promise(resolve=>setTimeout(resolve,10));
  assert.deepEqual(navigated,[],'the legacy-data escape is not moved away from the old origin');
  assert.deepEqual(deleted,[],'the export escape keeps the project cache available');
  let exportResponse;
  listeners.fetch({request:{method:'GET',mode:'navigate',url:client.url},respondWith:value=>{exportResponse=value;}});
  assert.equal(exportResponse,undefined,'the export escape falls through to the normal application response');

  client.url=scope+'?lang=zh';client.navigate=()=>Promise.reject(Error('navigation failed'));deleted.length=0;
  await dispatch('activate');
  await new Promise(resolve=>setTimeout(resolve,10));
  assert.deepEqual(deleted,[],'a failed client migration does not delete its recoverable offline cache');
}

checkLegacyWorkerMigration().then(()=>console.log('PASS: stale GitHub Pages service workers migrate cached 1.7 links to the production domain.')).catch(error=>{console.error(error);process.exitCode=1;});
