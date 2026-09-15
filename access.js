/* One invitation at the app entrance; provider credentials always remain server-side. */
window.TarotAccess = (() => {
  'use strict';
  const KEY='tarot-pocket-session-v1',root=document.getElementById('access-gate'),app=document.getElementById('app');
  let token='',expiresAt=0,busy=false,error='';
  const esc=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const endpoint=()=>window.TAROT_AI_CONFIG?.sessionEndpoint||'';
  function valid(){return !!token&&Number.isFinite(expiresAt)&&expiresAt>Date.now()+30000;}
  function load(){
    try{const saved=JSON.parse(sessionStorage.getItem(KEY));if(saved&&typeof saved.token==='string'&&saved.token.length<=1024&&Number.isFinite(saved.expiresAt)){token=saved.token;expiresAt=saved.expiresAt;}}
    catch(_){token='';expiresAt=0;}
    if(!valid()){token='';expiresAt=0;try{sessionStorage.removeItem(KEY);}catch(_){}}
  }
  function setLocked(locked){
    document.body.classList.toggle('access-locked',locked);
    if(app){app.inert=locked;app.setAttribute('aria-hidden',String(locked));}
  }
  function render(){
    if(window.TAROT_STANDALONE||valid()){root.replaceChildren();setLocked(false);return;}
    setLocked(true);
    root.innerHTML=`<main class="access-screen" role="dialog" aria-modal="true" aria-labelledby="access-title"><div class="access-stars" aria-hidden="true">✦ · ✧ · ✦</div><section class="access-card"><div class="access-mark" aria-hidden="true">☾</div><div class="eyebrow">TAROT POCKET</div><h1 id="access-title">进入你的随身牌桌</h1><p>输入邀请码后即可学习、抽牌，并在需要时使用完整 AI 解读。</p><form data-access-form novalidate><label for="tarot-invite"><span>邀请码</span><input id="tarot-invite" data-invite-code type="password" inputmode="text" autocomplete="one-time-code" autocapitalize="characters" spellcheck="false" maxlength="8" placeholder="8 位邀请码" ${busy?'disabled':''}></label><button class="primary wide" type="submit" ${busy||!navigator.onLine?'disabled':''}>${busy?'正在验证…':'进入 Tarot Pocket'}</button></form>${!navigator.onLine?'<p class="access-error" role="alert">首次进入需要联网验证邀请码。</p>':error?`<p class="access-error" role="alert">${esc(error)}</p>`:''}<small>验证后，本次打开期间会自动连接解读服务；页面不会保存或显示 DeepSeek 密钥。</small></section></main>`;
    requestAnimationFrame(()=>root.querySelector('[data-invite-code]')?.focus({preventScroll:true}));
  }
  function clear(message='登录已过期，请重新输入邀请码。'){
    token='';expiresAt=0;error=message;try{sessionStorage.removeItem(KEY);}catch(_){}render();
  }
  function safeEndpoint(){
    const url=new URL(endpoint(),location.href);
    const local=url.origin===location.origin&&['localhost','127.0.0.1'].includes(url.hostname);
    if((url.protocol!=='https:'&&!local)||url.username||url.password||url.search||url.hash)throw Error();
    return url;
  }
  async function enter(code){
    if(busy)return;const inviteCode=String(code||'').trim();
    if(!inviteCode){error='请输入邀请码。';render();return;}
    if(!navigator.onLine){error='首次进入需要联网验证邀请码。';render();return;}
    let url;try{url=safeEndpoint();}catch(_){error='邀请验证服务暂时不可用。';render();return;}
    busy=true;error='';render();
    try{
      const response=await fetch(url.href,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({inviteCode}),credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',redirect:'error'});
      if(Number(response.headers.get('content-length'))>10000)throw Error('UNAVAILABLE');
      const result=await response.json();
      if(!response.ok)throw Error(result?.error==='AUTH_REQUIRED'?'AUTH_REQUIRED':result?.error==='RATE_LIMITED'?'RATE_LIMITED':'UNAVAILABLE');
      if(typeof result.token!=='string'||result.token.length<40||result.token.length>1024||!Number.isFinite(result.expiresAt)||result.expiresAt<=Date.now()+30000)throw Error('UNAVAILABLE');
      token=result.token;expiresAt=result.expiresAt;
      try{sessionStorage.setItem(KEY,JSON.stringify({token,expiresAt}));}catch(_){}
      root.replaceChildren();setLocked(false);document.querySelector('[data-home-choice]')?.focus({preventScroll:true});
      document.dispatchEvent(new CustomEvent('tarot-access-granted'));
    }catch(e){error=e.message==='AUTH_REQUIRED'?'邀请码不正确，请重新输入。':e.message==='RATE_LIMITED'?'尝试次数较多，请稍后再试。':'暂时无法验证邀请码，请检查网络后重试。';token='';expiresAt=0;}
    finally{busy=false;if(!valid())render();}
  }
  document.addEventListener('submit',event=>{if(!event.target.matches('[data-access-form]'))return;event.preventDefault();enter(event.target.querySelector('[data-invite-code]')?.value);});
  document.addEventListener('tarot-language-change',render);
  if(window.TAROT_STANDALONE){setLocked(false);}else{load();render();}
  return {get authorized(){return window.TAROT_STANDALONE||valid();},token:()=>valid()?token:'',clear,refresh:render};
})();
