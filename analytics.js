/* Privacy-limited first-party product events. Questions, cards and learning records are never sent. */
window.TarotAnalytics = (() => {
  'use strict';
  const VISITOR_KEY='tarot-pocket-anon-v1',SESSION_KEY='tarot-pocket-tab-v1';
  const allowed=new Set(['page_view','home_learn','home_read','reading_category','spread_open','reading_start','reading_pick','reading_reveal','offline_reading_view','ai_confirm','ai_cancel','learning_start','learning_answer','learning_complete','dossier_open']);
  let queue=[],timer=null;
  const uuid=()=>crypto.randomUUID?.()||`${Date.now().toString(36)}-${crypto.getRandomValues(new Uint32Array(4)).join('-')}`;
  function stored(storage,key){try{let value=storage.getItem(key);if(!value){value=uuid();storage.setItem(key,value);}return value;}catch(_){return uuid();}}
  const visitorId=stored(localStorage,VISITOR_KEY),sessionId=stored(sessionStorage,SESSION_KEY);
  function endpoint(){
    if(window.TAROT_STANDALONE)return '';
    try{const url=new URL(window.TAROT_AI_CONFIG?.analyticsEndpoint||'',location.href);return url.origin===location.origin?url.href:'';}
    catch(_){return '';}
  }
  function page(){return document.querySelector('[data-reading-ai]')?'reading-result':document.querySelector('.reading-table')?'reading-table':document.querySelector('.reading-gallery')?'reading-home':document.querySelector('.learn-v2,.academy-lesson')?'learning':'home';}
  function cleanProps(props){const out={};for(const key of ['spread','category','source','status','mode','phase','lang'])if(props?.[key]!=null)out[key]=String(props[key]).slice(0,80).replace(/[^\w.:/-]/gu,'');return out;}
  function track(name,props={},pageName=page()){
    if(!allowed.has(name)||!endpoint()||navigator.globalPrivacyControl===true||navigator.doNotTrack==='1')return;
    queue.push({name,page:String(pageName).slice(0,80),visitorId,sessionId,props:cleanProps(props)});
    if(queue.length>=10)flush();else if(!timer)timer=setTimeout(flush,1200);
  }
  async function flush(){
    clearTimeout(timer);timer=null;if(!queue.length||!endpoint())return;
    const events=queue.splice(0,20);
    try{await fetch(endpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({events}),credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',keepalive:true});}
    catch(_){} // Analytics must never interrupt learning or a reading.
  }
  document.addEventListener('click',event=>{
    const el=event.target.closest('button,[data-action],[data-reading],[data-academy]');if(!el)return;
    if(el.matches('[data-home-choice][data-page="courses"]'))track('home_learn');
    else if(el.matches('[data-home-choice][data-page="reading"]'))track('home_read');
    const reading=el.dataset.reading;
    if(reading==='category')track('reading_category',{category:el.dataset.value});
    else if(reading==='guide')track('spread_open',{spread:el.dataset.value});
    else if(reading==='start')track('reading_start');
    else if(reading==='pick')track('reading_pick');
    else if(reading==='reveal'||reading==='reveal-all')track('reading_reveal');
    else if(reading==='ai-request')track('ai_confirm');
    else if(reading==='ai-cancel')track('ai_cancel');
    if(el.dataset.academy==='start'||el.dataset.academy==='new')track('learning_start');
    if(el.dataset.academy==='answer')track('learning_answer');
    if(el.dataset.action==='show-card'||el.dataset.reading==='card')track('dossier_open',{source:page()});
  },{capture:true});
  document.addEventListener('toggle',event=>{
    if(event.target.matches('[data-academy-card-details]')&&event.target.open)track('dossier_open',{source:'learning'});
  },true);
  window.addEventListener('pagehide',flush);
  requestAnimationFrame(()=>track('page_view',{lang:document.documentElement.lang==='en'?'en':'zh'}));
  return {track,flush};
})();
