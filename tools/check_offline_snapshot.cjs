/* Validate the lifecycle synchronizer without timers used as success signals. */
'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm');
const snapshot=require('./offline_install_snapshot.cjs');
class Worker extends EventTarget{
  constructor(){super();this.state='installing';}
  finish(state){this.state=state;this.dispatchEvent(new Event('statechange'));}
}
function fixture(keys){
  const reg=new EventTarget(),window={};reg.installing=null;reg.waiting=null;
  const environment={navigator:{serviceWorker:{getRegistration:async()=>reg}},caches:{keys:async()=>keys},window,setTimeout,clearTimeout};
  return {reg,window,environment,page:{evaluate:(fn,input)=>vm.runInNewContext('('+fn.toString()+')(__input)',{...environment,__input:input})}};
}
async function checkSnapshot(){
  const leaked=fixture(['scope-old','scope-partial','unrelated']);
  const leakResult=await snapshot(leaked.page,'scope-');
  assert.deepEqual([...leakResult.keys],['scope-old','scope-partial'],'an orphaned partial cache is returned unchanged to the failure assertion');
  assert.equal(leakResult.completed,0,'wrong cache keys do not cause unbounded retries');

  const successful=fixture(['scope-old','scope-new']),worker=new Worker();successful.reg.installing=worker;
  successful.window.awaiting=()=>queueMicrotask(()=>worker.finish('installed'));
  await assert.rejects(snapshot(successful.page,'scope-',{waitingSignal:'awaiting'}),/unexpectedly completed installation/,'a successful bad revision must not be treated as a harmless background retry');

  const racing=fixture(['scope-old']),nativeWorker=new Worker();let reads=0;
  racing.environment.caches.keys=async()=>{
    reads++;
    if(reads===1){racing.reg.installing=nativeWorker;racing.reg.dispatchEvent(new Event('updatefound'));return ['scope-old','scope-new'];}
    return ['scope-old'];
  };
  racing.window.awaiting=()=>queueMicrotask(()=>{racing.reg.installing=null;nativeWorker.finish('redundant');});
  const settled=await snapshot(racing.page,'scope-',{waitingSignal:'awaiting'});
  assert.deepEqual([...settled.keys],['scope-old'],'a worker that begins during the cache read must finish before inspection');
  assert.equal(settled.completed,1);assert.deepEqual([...settled.states],['redundant']);assert.equal(reads,2);
  return {status:'PASS',checks:['real orphaned cache is not hidden','successful bad installation fails','update starting during cache read is synchronized by lifecycle events']};
}
module.exports=checkSnapshot;
if(require.main===module)checkSnapshot().then(result=>console.log(JSON.stringify(result))).catch(error=>{console.error(error);process.exitCode=1;});
