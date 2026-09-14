(() => {
  'use strict';
  const standalone=!!window.TAROT_IMAGES;
  const revision=document.querySelector('meta[name="tarot-build"]')?.content||'development';
  const updateURL=()=>new URL('update.html?lang='+((window.TAROT_I18N?.locale||document.documentElement.lang).startsWith('en')?'en':'zh')+'&v='+encodeURIComponent(revision),location.href).href;
  const supported=!standalone && isSecureContext && 'serviceWorker' in navigator && 'caches' in window;
  let registration,installPrompt,busy=false;
  let state={phase:standalone?'ready':supported?'checking':'unavailable',ready:standalone&&Object.keys(window.TAROT_IMAGES).length===78,done:0,total:0,cards:standalone?Object.keys(window.TAROT_IMAGES).length:0,revision,updateAvailable:false};
  const escape=value=>String(value??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  function emit(patch){
    if(patch.ready&&supported&&navigator.serviceWorker.controller?.state!=='activated')patch={...patch,phase:'checking',ready:false};
    state={...state,...patch};
    for(const panel of document.querySelectorAll('[data-offline-panel]'))panel.outerHTML=render();
    document.dispatchEvent(new CustomEvent('tarot-offline-change',{detail:{...state}}));
  }
  function render(){
    const label=standalone?'离线文件已内置内容':state.ready?'离线内容已检查':state.phase==='downloading'?'正在保存离线内容':state.phase==='error'?'离线准备未完成':state.phase==='unavailable'?'此浏览器暂不能保存网页离线内容':state.phase==='incomplete'?'离线内容不完整':state.phase==='not-ready'?'离线内容尚未下载':'正在检查离线内容';
    const progress=state.total?`<progress max="${state.total}" value="${state.done}" aria-label="离线下载进度"></progress><p class="offline-count">${state.done} / ${state.total} <span>项内容</span></p>`:'';
    return `<section class="offline-panel" data-offline-panel><div class="offline-heading"><span aria-hidden="true" class="offline-dot ${state.ready?'is-ready':''}"></span><h3>${label}</h3></div><div class="offline-live" role="status" aria-live="polite">${standalone?'<p>78 张牌图和课程已包含在这个文件中，无需联网读取。</p>':state.ready?'<p>78 张牌图、课程和应用文件已完整保存在此浏览器。离线时可从同一网址或主屏幕打开。</p>':state.phase==='error'?`<p>${state.error==='revision-mismatch'?'网站正在更新，部分文件版本不一致。请稍后重试。':'下载被中断或空间不足。连接网络后重试；学习记录仍保留在本机。'}</p>`:state.phase==='not-ready'?'<p>出发前下载 78 张牌图、课程和应用文件，之后可断网学习。建议使用 Wi-Fi 完成。</p>':state.phase==='unavailable'?'<p>请通过 Safari 或 Chrome 打开 HTTPS 网站，再尝试离线准备。也可下载发布页中的单文件版本。</p>':'<p>请保持页面打开，完成后再断网。下载完成前不会标记为离线可用。</p>'}${!standalone&&!state.ready?progress:''}</div>${!standalone&&supported?`<div class="offline-actions"><button class="${state.ready?'ghost':'primary'}" data-offline="${state.ready?'check':'retry'}" ${busy||state.phase==='downloading'?'disabled':''}>${state.ready?'重新检查':state.phase==='downloading'?'正在下载…':state.phase==='not-ready'?'下载离线内容':'重试离线准备'}</button>${installPrompt?'<button class="ghost" data-offline="install">添加到主屏幕</button>':''}</div>`:''}${state.updateAvailable?'<p class="offline-update">已有新版可用。当前学习保持不变，你可以完成后再进入新版。</p>':''}${!standalone&&supported?`<a class="offline-update-link" href="${escape(updateURL())}">检查并进入新版</a>`:''}<details class="offline-help"><summary>手机安装与旅行前检查</summary><p>iPhone：在 Safari 点分享，选择“添加到主屏幕”。Android：在浏览器菜单选择“安装应用”或“添加到主屏幕”。</p><p>旅行前，请在本机完成离线检查，开启飞行模式，关闭并重新打开应用，尝试一张未学过的牌。</p><p>浏览器可能因空间不足、清理网站数据或隐私模式移除离线内容和记录。学习记录请另外导出备份；添加到主屏幕不等于永久保存。</p></details>${!standalone&&state.revision?`<small class="offline-revision" data-i18n-ignore>${escape('v'+revision.split('-')[0]+' · '+revision)}</small>`:''}</section>`;
  }
  function request(worker,type){return new Promise((resolve,reject)=>{
    if(!worker){reject(Error('no-worker'));return;}
    const channel=new MessageChannel(),timer=setTimeout(()=>reject(Error('timeout')),type==='TAROT_OFFLINE_REPAIR'?180000:15000);
    channel.port1.onmessage=event=>{clearTimeout(timer);resolve(event.data);};
    worker.postMessage({type},[channel.port2]);
  });}
  async function check(){
    if(standalone||!supported)return {...state};
    const worker=navigator.serviceWorker.controller||registration?.active;
    if(!worker)return {...state};
    try{const result=await request(worker,'TAROT_OFFLINE_STATUS');if(result.revision===revision)emit(result);else emit({ready:false,phase:'incomplete',updateAvailable:true});}
    catch(_){emit({phase:'error',ready:false,error:'check-failed'});}
    return {...state};
  }
  function watch(worker){
    if(!worker)return;
    worker.addEventListener('statechange',()=>{
      if(worker.state==='redundant'&&!registration?.waiting){if(registration?.active)check();else emit({phase:'error',ready:false,error:state.error||'download'});}
      if(worker.state==='activated')check();
      if(worker.state==='installed'&&registration?.active)emit({updateAvailable:true});
    });
  }
  async function prepare(){
    if(!supported||busy)return;
    busy=true;emit({phase:'downloading',ready:false,error:null});
    try{
      registration=await navigator.serviceWorker.register(new URL('sw.js',location.href),{scope:'./',updateViaCache:'none'});
      registration.addEventListener('updatefound',()=>watch(registration.installing));
      watch(registration.installing);
      if(registration.waiting)emit({updateAvailable:true});
      if(registration.active){
        const result=await request(navigator.serviceWorker.controller||registration.active,'TAROT_OFFLINE_STATUS');
        if(result.revision===revision){if(!result.ready)emit(await request(registration.active,'TAROT_OFFLINE_REPAIR'));else emit(result);}
        else emit({phase:'incomplete',ready:false,updateAvailable:true});
      }
    }catch(error){emit({phase:'error',ready:false,error:error.message});}
    finally{busy=false;emit({});}
  }
  if(supported){
    navigator.serviceWorker.addEventListener('message',event=>{
      const message=event.data;if(message?.type!=='TAROT_OFFLINE')return;
      if(message.revision!==revision){if(message.ready)emit({updateAvailable:true});return;}
      emit(message);
    });
    navigator.serviceWorker.addEventListener('controllerchange',()=>{watch(navigator.serviceWorker.controller);check();});
    window.addEventListener('online',check);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
    navigator.serviceWorker.getRegistration(new URL('./',location.href)).then(reg=>{
      registration=reg;
      if(reg?.active){if(reg.waiting)emit({updateAvailable:true});reg.addEventListener('updatefound',()=>watch(reg.installing));check();}
      else if(reg?.installing){watch(reg.installing);emit({phase:'downloading'});}
      else emit({phase:'not-ready',ready:false});
    }).catch(()=>emit({phase:'unavailable',ready:false}));
  }
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;emit({});});
  window.addEventListener('appinstalled',()=>{installPrompt=null;emit({});});
  document.addEventListener('click',async event=>{
    const action=event.target.closest('[data-offline]')?.dataset.offline;if(!action)return;
    if(action==='check')await check();
    if(action==='retry')await prepare();
    if(action==='install'&&installPrompt){await installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;emit({});}
  });
  window.TarotOffline={render,check,prepare,get updateURL(){return updateURL();},get state(){return {...state};}};
})();
