/* Build replaces this payload with a release fingerprint and exact file hashes. */
const RELEASE = /* TAROT_RELEASE */ null;
const PREFIX = 'tarot-pocket-offline-' + encodeURIComponent(new URL(self.registration.scope).pathname) + '-';
const CACHE = RELEASE ? PREFIX + RELEASE.revision : PREFIX + 'unbuilt';
const absolute = path => new URL(path, self.registration.scope).href;
const entries = () => RELEASE.assets.map(asset => ({...asset, url:absolute(asset.path)}));
const digest = async buffer => [...new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))].map(x=>x.toString(16).padStart(2,'0')).join('');
async function notify(payload) {
  for (const client of await self.clients.matchAll({includeUncontrolled:true,type:'window'})) {
    if(client.url.startsWith(self.registration.scope))client.postMessage({type:'TAROT_OFFLINE',revision:RELEASE.revision,...payload});
  }
}
async function verifiedResponse(asset) {
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);
  try{
    const response=await fetch(new Request(asset.url,{cache:'reload',credentials:'same-origin',signal:controller.signal}));
    if(!response.ok || response.type==='opaque')throw Error('download');
    const bytes=await response.arrayBuffer();
    if(await digest(bytes)!==asset.sha256)throw Error('revision-mismatch');
    const headers=new Headers(response.headers);
    // Fetch exposes decoded bytes; do not keep wire-compression metadata on a synthetic response.
    headers.delete('Content-Encoding');headers.delete('Content-Length');headers.delete('Transfer-Encoding');
    headers.set('X-Tarot-Integrity',asset.sha256);
    return new Response(bytes,{status:200,headers});
  }finally{clearTimeout(timer);}
}
async function inventory() {
  if(!RELEASE)return {phase:'unavailable',ready:false,done:0,total:0,cards:0};
  const cache=await caches.open(CACHE);let done=0,cards=0;
  for(const asset of entries()) {
    const response=await cache.match(asset.url);
    if(response?.ok && response.headers.get('X-Tarot-Integrity')===asset.sha256){done++;if(asset.path.startsWith('assets/cards/'))cards++;}
  }
  const ready=done===RELEASE.assets.length && cards===78;
  return {phase:ready?'ready':'incomplete',ready,done,total:RELEASE.assets.length,cards,revision:RELEASE.revision};
}
let repairing;
async function repair(installing=false) {
  if(repairing)return repairing;
  repairing=(async()=>{
    const cache=await caches.open(CACHE), assets=entries();let done=0;
    for(const asset of assets) {
      const existing=await cache.match(asset.url);
      if(!existing?.ok || existing.headers.get('X-Tarot-Integrity')!==asset.sha256)await cache.put(asset.url,await verifiedResponse(asset));
      done++;await notify({phase:'downloading',ready:false,done,total:assets.length});
    }
    const result=await inventory();if(!result.ready)throw Error('incomplete');
    if(!installing)await notify(result);return result;
  })().finally(()=>{repairing=null;});
  return repairing;
}
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    if(!RELEASE)throw Error('Release build required');
    try{await repair(true);}
    catch(error){await caches.delete(CACHE);await notify({phase:'error',ready:false,error:error.message});throw error;}
    // Keep updates waiting: a new release never swaps files under a live lesson.
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const result=await inventory();if(!result.ready)throw Error('Incomplete offline release');
    // An explicit update can leave an older lesson tab open. Keep its versioned
    // assets until a later activation with no lesson tabs; never reload that tab.
    const oldTabs=(await self.clients.matchAll({includeUncontrolled:true,type:'window'})).filter(client=>client.url.startsWith(self.registration.scope)&&!new URL(client.url).pathname.endsWith('/update.html'));
    if(!oldTabs.length)for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);
    await self.clients.claim();await notify(result);
  })());
});
self.addEventListener('message',event=>{
  if(!RELEASE || !['TAROT_OFFLINE_STATUS','TAROT_OFFLINE_REPAIR','TAROT_OFFLINE_ACTIVATE'].includes(event.data?.type))return;
  const reply=value=>event.ports[0]?.postMessage(value);
  if(event.data.type==='TAROT_OFFLINE_ACTIVATE'){
    event.waitUntil((async()=>{
      const result=await inventory();
      if(!result.ready){reply(result);return;}
      reply({...result,activating:true});await self.skipWaiting();
    })());return;
  }
  event.waitUntil((event.data.type==='TAROT_OFFLINE_REPAIR'?repair():inventory()).then(reply,error=>reply({phase:'error',ready:false,error:error.message,revision:RELEASE.revision})));
});
self.addEventListener('fetch',event=>{
  if(!RELEASE || event.request.method!=='GET')return;
  const url=new URL(event.request.url),scope=new URL(self.registration.scope);
  if(url.origin!==scope.origin || !url.pathname.startsWith(scope.pathname))return;
  const navigation=event.request.mode==='navigate' && [scope.pathname,scope.pathname+'index.html'].includes(url.pathname);
  const asset=entries().find(item=>item.url===(navigation?absolute('index.html'):url.origin+url.pathname));
  if(!asset)return;
  event.respondWith((async()=>{
    const requestedVersion=navigation?null:url.searchParams.get('v');
    if(requestedVersion&&requestedVersion!==RELEASE.revision){
      const key=PREFIX+requestedVersion;
      // Never substitute a different script version under an already open page.
      if((await caches.keys()).includes(key)){
        const previous=await (await caches.open(key)).match(asset.url);
        if(previous?.ok&&previous.headers.has('X-Tarot-Integrity'))return previous;
      }
      return new Response('This page version is no longer available. Finish your session and reopen Tarot Pocket.',{status:409,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }
    const cache=await caches.open(CACHE),cached=await cache.match(asset.url);
    if(cached?.headers.get('X-Tarot-Integrity')===asset.sha256)return cached;
    try{const response=await verifiedResponse(asset);await cache.put(asset.url,response.clone());return response;}
    catch(_){await notify({phase:'incomplete',ready:false});return new Response('Offline content is incomplete. Reconnect and retry the offline download.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}
  })());
});
