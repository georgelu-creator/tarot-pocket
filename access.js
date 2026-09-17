/* One invitation at the app entrance; provider credentials always remain server-side. */
window.TarotAccess = (() => {
  'use strict';
  const KEY='tarot-pocket-session-v1',root=document.getElementById('access-gate'),app=document.getElementById('app');
  let token='',expiresAt=0,busy=false,error='',inviteInput='',selectedSessionEndpoint='';
  const esc=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function safeEndpoint(raw){
    const url=new URL(raw,location.href);
    const local=url.origin===location.origin&&['localhost','127.0.0.1'].includes(url.hostname);
    if((url.protocol!=='https:'&&!local)||url.username||url.password||url.search||url.hash)throw Error();
    return url;
  }
  function services(){
    const config=window.TAROT_AI_CONFIG||{};
    const values=[[config.sessionEndpoint,config.endpoint],[config.fallbackSessionEndpoint,config.fallbackEndpoint]];
    return values.filter(([session,reading])=>session&&reading).map(([session,reading])=>({session:safeEndpoint(session),reading:safeEndpoint(reading)}));
  }
  function readingEndpoint(){
    const list=services();return (selectedSessionEndpoint?list.find(x=>x.session.href===selectedSessionEndpoint):list[0])?.reading.href||'';
  }
  function valid(){return !!token&&Number.isFinite(expiresAt)&&expiresAt>Date.now()+30000;}
  function load(){
    try{const saved=JSON.parse(sessionStorage.getItem(KEY));if(saved&&typeof saved.token==='string'&&saved.token.length<=1024&&Number.isFinite(saved.expiresAt)){
      const known=saved.serviceEndpoint===undefined||services().some(x=>x.session.href===saved.serviceEndpoint);
      if(known){token=saved.token;expiresAt=saved.expiresAt;selectedSessionEndpoint=saved.serviceEndpoint||'';}
    }}
    catch(_){token='';expiresAt=0;}
    if(!valid()){token='';expiresAt=0;selectedSessionEndpoint='';try{sessionStorage.removeItem(KEY);}catch(_){}}
  }
  function setLocked(locked){
    document.body.classList.toggle('access-locked',locked);
    if(app){app.inert=locked;app.setAttribute('aria-hidden',String(locked));}
  }
  function render(){
    if(window.TAROT_STANDALONE||valid()){root.replaceChildren();setLocked(false);return;}
    setLocked(true);
    root.innerHTML=`<main class="access-screen" role="dialog" aria-modal="true" aria-labelledby="access-title"><div class="access-stars" aria-hidden="true">✦ · ✧ · ✦</div><section class="access-card"><div class="access-mark" aria-hidden="true">☾</div><div class="eyebrow">TAROT POCKET</div><h1 id="access-title">进入你的随身牌桌</h1><p>输入邀请码后即可学习、抽牌，并在需要时使用完整 AI 解读。</p><form data-access-form novalidate><label for="tarot-invite"><span>邀请码</span><input id="tarot-invite" data-invite-code type="password" inputmode="text" autocomplete="one-time-code" autocapitalize="characters" spellcheck="false" maxlength="8" placeholder="8 位邀请码" ${busy?'disabled':''}></label><button class="primary wide" type="submit" ${busy||!navigator.onLine?'disabled':''}>${busy?'正在验证…':'进入 Tarot Pocket'}</button></form>${!navigator.onLine?'<p class="access-error" role="alert">首次进入需要联网验证邀请码。</p>':error?`<p class="access-error" role="alert">${esc(error)}</p>`:''}<small>验证后，本次打开期间会自动连接解读服务；页面不会保存或显示 DeepSeek 密钥。</small></section></main>`;
    const field=root.querySelector('[data-invite-code]');if(field)field.value=inviteInput;
    requestAnimationFrame(()=>field?.focus({preventScroll:true}));
  }
  function clear(message='登录已过期，请重新输入邀请码。'){
    token='';expiresAt=0;selectedSessionEndpoint='';error=message;try{sessionStorage.removeItem(KEY);}catch(_){}render();
  }
  async function enter(code){
    if(busy)return;inviteInput=String(code||'').slice(0,8);const inviteCode=inviteInput.trim();
    if(!inviteCode){error='请输入邀请码。';render();return;}
    if(!navigator.onLine){error='首次进入需要联网验证邀请码。';render();return;}
    let candidates;try{candidates=services();if(!candidates.length)throw Error();}catch(_){error='邀请验证服务暂时不可用。';render();return;}
    busy=true;error='';render();
    try{
      for(const [index,service] of candidates.entries()){
        const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
        try{
          const response=await fetch(service.session.href,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({inviteCode}),signal:controller.signal,credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',redirect:'error'});
          if(Number(response.headers.get('content-length'))>10000)throw Error('UNAVAILABLE');
          const result=await response.json();
          if(!response.ok)throw Error(result?.error==='AUTH_REQUIRED'?'AUTH_REQUIRED':result?.error==='RATE_LIMITED'?'RATE_LIMITED':'UNAVAILABLE');
          if(typeof result.token!=='string'||result.token.length<40||result.token.length>1024||!Number.isFinite(result.expiresAt)||result.expiresAt<=Date.now()+30000)throw Error('UNAVAILABLE');
          token=result.token;expiresAt=result.expiresAt;selectedSessionEndpoint=service.session.href;inviteInput='';
          try{sessionStorage.setItem(KEY,JSON.stringify({token,expiresAt,serviceEndpoint:selectedSessionEndpoint}));}catch(_){}
          break;
        }catch(e){
          if(e.message==='AUTH_REQUIRED'||e.message==='RATE_LIMITED'||index===candidates.length-1)throw e;
        }finally{clearTimeout(timer);}
      }
      root.replaceChildren();setLocked(false);document.querySelector('[data-home-choice]')?.focus({preventScroll:true});
      document.dispatchEvent(new CustomEvent('tarot-access-granted'));
    }catch(e){error=e.message==='AUTH_REQUIRED'?'邀请码不正确，请检查后重试。':e.message==='RATE_LIMITED'?'尝试次数较多，请稍后再试。':'暂时无法验证，请稍后重试。';token='';expiresAt=0;selectedSessionEndpoint='';}
    finally{busy=false;if(!valid())render();}
  }
  document.addEventListener('submit',event=>{if(!event.target.matches('[data-access-form]'))return;event.preventDefault();enter(event.target.querySelector('[data-invite-code]')?.value);});
  document.addEventListener('input',event=>{if(event.target.matches('[data-invite-code]'))inviteInput=event.target.value.slice(0,8);});
  document.addEventListener('tarot-language-change',render);
  if(window.TAROT_STANDALONE){setLocked(false);}else{load();render();}
  return {get authorized(){return window.TAROT_STANDALONE||valid();},token:()=>valid()?token:'',readingEndpoint,clear,refresh:render};
})();
