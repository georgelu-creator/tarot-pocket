/* Test-only synchronization for cache assertions after unsuccessful updates. */
'use strict';
module.exports=async function failedInstallSnapshot(page,prefix,{waitingSignal}={}){
  return page.evaluate(async({prefix,waitingSignal})=>{
    const reg=await navigator.serviceWorker.getRegistration();
    if(!reg)throw Error('Missing service-worker registration');
    const workers=new Map();let generation=0,timer;
    const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Installation did not finish before cache inspection')),120000);});
    const watch=worker=>{
      if(!worker||workers.has(worker))return;
      const entry={worker,state:worker.state};workers.set(worker,entry);generation++;
      entry.change=()=>{entry.state=worker.state;generation++;};
      worker.addEventListener('statechange',entry.change);
    };
    const found=()=>watch(reg.installing);
    const ended=entry=>new Promise((resolve,reject)=>{
      const check=()=>{
        const state=entry.worker.state;
        if(state==='redundant'){entry.worker.removeEventListener('statechange',check);resolve();}
        else if(['installed','activating','activated'].includes(state)){entry.worker.removeEventListener('statechange',check);reject(Error('A mismatched revision unexpectedly completed installation'));}
      };
      entry.worker.addEventListener('statechange',check);check();
    });
    reg.addEventListener('updatefound',found);watch(reg.installing);
    try{return await Promise.race([timeout,(async()=>{
      for(;;){
        if(reg.waiting)throw Error('A mismatched revision unexpectedly reached waiting');
        const pending=[...workers.values()].filter(entry=>entry.worker.state!=='redundant');
        if(pending.length){
          if(waitingSignal)window[waitingSignal]?.();
          await Promise.all(pending.map(ended));
        }
        const before=generation,keys=(await caches.keys()).filter(key=>key.startsWith(prefix));
        // A navigation may start another native update after the first worker
        // failed. Refresh registration after the async cache read and inspect
        // that worker's real lifecycle before calling a partial cache a leak.
        const current=await navigator.serviceWorker.getRegistration();watch(current?.installing);
        if(current?.waiting)throw Error('A mismatched revision unexpectedly reached waiting');
        if(before!==generation||[...workers.values()].some(entry=>entry.worker.state!=='redundant'))continue;
        // Never retry merely because keys are wrong. Without a worker lifecycle
        // transition this exact snapshot goes straight to the original assertion.
        return {keys,completed:workers.size,states:[...workers.values()].map(entry=>entry.worker.state)};
      }
    })()]);}finally{
      clearTimeout(timer);reg.removeEventListener('updatefound',found);
      for(const entry of workers.values())entry.worker.removeEventListener('statechange',entry.change);
    }
  },{prefix,waitingSignal});
};
