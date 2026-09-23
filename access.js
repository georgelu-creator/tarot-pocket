/* Public app entry. A short-lived AI session is requested only after the user asks for AI depth. */
window.TarotAccess = (() => {
  'use strict';
  const KEY='tarot-pocket-session-v1';
  let token='',expiresAt=0,selectedSessionEndpoint='',pending=null;
  function safeEndpoint(raw){
    const url=new URL(raw,location.href);
    const local=url.origin===location.origin&&['localhost','127.0.0.1'].includes(url.hostname);
    if((url.protocol!=='https:'&&!local)||url.username||url.password||url.search||url.hash)throw Error('NOT_CONFIGURED');
    return url;
  }
  function services(){
    const config=window.TAROT_AI_CONFIG||{};
    return [[config.sessionEndpoint,config.endpoint],[config.fallbackSessionEndpoint,config.fallbackEndpoint]]
      .filter(([session,reading])=>session&&reading)
      .map(([session,reading])=>({session:safeEndpoint(session),reading:safeEndpoint(reading)}));
  }
  function valid(){return !!token&&Number.isFinite(expiresAt)&&expiresAt>Date.now()+30000;}
  function load(){
    try{
      const saved=JSON.parse(sessionStorage.getItem(KEY));
      if(saved&&typeof saved.token==='string'&&saved.token.length<=1024&&Number.isFinite(saved.expiresAt)){
        const known=saved.serviceEndpoint===undefined||services().some(x=>x.session.href===saved.serviceEndpoint);
        if(known){token=saved.token;expiresAt=saved.expiresAt;selectedSessionEndpoint=saved.serviceEndpoint||'';}
      }
    }catch(_){}
    if(!valid())clear();
  }
  function clear(){
    token='';expiresAt=0;selectedSessionEndpoint='';
    try{sessionStorage.removeItem(KEY);}catch(_){}
  }
  function readingEndpoint(){
    const list=services();
    return (selectedSessionEndpoint?list.find(x=>x.session.href===selectedSessionEndpoint):list[0])?.reading.href||'';
  }
  async function createSession(){
    if(window.TAROT_STANDALONE||!navigator.onLine)throw Error('UNAVAILABLE');
    let candidates;try{candidates=services();}catch(_){throw Error('NOT_CONFIGURED');}
    if(!candidates.length)throw Error('NOT_CONFIGURED');
    for(const [index,service] of candidates.entries()){
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
      try{
        const response=await fetch(service.session.href,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',signal:controller.signal,credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',redirect:'error'});
        if(Number(response.headers.get('content-length'))>10000)throw Error('UNAVAILABLE');
        const result=await response.json();
        if(!response.ok)throw Error(result?.error==='RATE_LIMITED'?'RATE_LIMITED':result?.error==='NOT_CONFIGURED'?'NOT_CONFIGURED':'UNAVAILABLE');
        if(typeof result.token!=='string'||result.token.length<40||result.token.length>1024||!Number.isFinite(result.expiresAt)||result.expiresAt<=Date.now()+30000)throw Error('UNAVAILABLE');
        token=result.token;expiresAt=result.expiresAt;selectedSessionEndpoint=service.session.href;
        try{sessionStorage.setItem(KEY,JSON.stringify({token,expiresAt,serviceEndpoint:selectedSessionEndpoint}));}catch(_){}
        return token;
      }catch(error){
        if(error.message==='RATE_LIMITED'||error.message==='NOT_CONFIGURED'||index===candidates.length-1)throw error;
      }finally{clearTimeout(timer);}
    }
    throw Error('UNAVAILABLE');
  }
  async function ensureSession(){
    if(valid())return token;
    if(pending)return pending;
    clear();pending=createSession();
    try{return await pending;}finally{pending=null;}
  }
  load();
  document.getElementById('access-gate')?.replaceChildren();
  document.body.classList.remove('access-locked');
  const app=document.getElementById('app');if(app){app.inert=false;app.removeAttribute('aria-hidden');}
  return {get authorized(){return true;},token:()=>valid()?token:'',readingEndpoint,ensureSession,clear,refresh() {}};
})();
