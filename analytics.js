/* Privacy-limited first-party product events. Questions, cards and learning records are never sent. */
window.TarotAnalytics = (() => {
  'use strict';
  const VISITOR_KEY='tarot-pocket-anon-v1',SESSION_KEY='tarot-pocket-tab-v1';
  const allowed=new Set(['page_view','home_learn','home_read','reading_category','spread_open','reading_start','reading_cut','reading_pick','reading_reveal','offline_reading_view','ai_confirm','ai_cancel','ai_result','learning_start','learning_answer','learning_complete','dossier_open','feature_click','screen_view','screen_exit']);
  let queue=[],timer=null,screen='home',screenAt=Date.now(),readingContext=()=>({});
  const moduleFor=name=>['courses','academy','study','practice'].includes(name)?'learning':name==='library'?'library':name==='reading'||name.startsWith('reading-')||name==='spread-guide'?'reading':name;
  const readingProps=()=>{const value=readingContext();return value&&typeof value.spread==='string'?{spread:value.spread,...(['manual','random','daily'].includes(value.source)?{source:value.source}:{})}:{};};
  const uuid=()=>crypto.randomUUID?.()||`${Date.now().toString(36)}-${crypto.getRandomValues(new Uint32Array(4)).join('-')}`;
  function stored(storage,key){try{let value=storage.getItem(key);if(!value){value=uuid();storage.setItem(key,value);}return value;}catch(_){return uuid();}}
  const visitorId=stored(localStorage,VISITOR_KEY);let sessionId=stored(sessionStorage,SESSION_KEY),lastEvent=Date.now();
  function endpoint(){
    if(window.TAROT_STANDALONE||!window.TAROT_AI_CONFIG?.analyticsEndpoint)return '';
    try{const url=new URL(window.TAROT_AI_CONFIG?.analyticsEndpoint||'',location.href);return url.origin===location.origin?url.href:'';}
    catch(_){return '';}
  }
  function page(){return screen;}
  function cleanProps(props){const out={};for(const key of ['spread','category','source','status','mode','phase','lang','feature','duration'])if(props?.[key]!=null)out[key]=String(props[key]).slice(0,80).replace(/[^\w.:/-]/gu,'');return out;}
  function track(name,props={},pageName=page()){
    if(!allowed.has(name)||!endpoint()||navigator.globalPrivacyControl===true||navigator.doNotTrack==='1')return;
    if(Date.now()-lastEvent>30*60000){sessionId=uuid();try{sessionStorage.setItem(SESSION_KEY,sessionId);}catch(_){}}lastEvent=Date.now();
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
    const el=event.target.closest('button,[data-action],[data-reading],[data-academy],[data-manual]');if(!el||el.disabled)return;
    const action=el.dataset.action||el.dataset.reading||el.dataset.academy||el.dataset.manual||(el.dataset.page?'nav-'+el.dataset.page:'');
    const navigation=el.dataset.page&&['nav','nav-away'].includes(el.dataset.action)||el.matches('.bottomnav [data-page],[data-home-choice][data-page]');
    const module=action.startsWith('ai-')?'ai':el.dataset.academy?'learning':moduleFor(navigation?el.dataset.page:screen);
    const feature=(el.dataset.manual?'manual-':'')+(action==='nav'&&el.dataset.page?'nav-'+el.dataset.page:action);
    if(feature&&/^[a-z-]{1,50}$/.test(feature))track('feature_click',{feature:module+':'+feature,...(['reading','ai'].includes(module)?readingProps():{})},module);
    if(el.matches('[data-home-choice][data-page="courses"]'))track('home_learn');
    else if(el.matches('[data-home-choice][data-page="reading"]'))track('home_read');
    const reading=el.dataset.reading;
    if(reading==='category')track('reading_category',{category:el.dataset.value});
    else if(reading==='guide')track('spread_open',{spread:el.dataset.value});
    else if(reading==='ai-cancel')track('ai_cancel',readingProps(),'ai');
    if(['show-card','card'].includes(el.dataset.action)||el.dataset.reading==='card')track('dossier_open',{source:module},module);
  },{capture:true});
  document.addEventListener('toggle',event=>{
    if(event.target.matches('[data-academy-card-details]')&&event.target.open)track('dossier_open',{source:'learning'});
  },true);
  function view(name){
    const next=/^[a-z-]{1,40}$/.test(name)?name:'home';if(next===screen)return;
    track('screen_exit',{duration:String(Math.min(86400,Math.round((Date.now()-screenAt)/1000)))},screen);
    screen=next;screenAt=Date.now();track('screen_view',{},screen);
  }
  window.addEventListener('pagehide',()=>{track('screen_exit',{duration:String(Math.min(86400,Math.round((Date.now()-screenAt)/1000)))},screen);flush();});
  async function feedback(question,receipt){
    if(!endpoint())throw Error('反馈仅在正式网站可用');
    const response=await fetch(new URL('/api/query-feedback',endpoint()),{method:receipt?'DELETE':'POST',headers:{'Content-Type':'application/json'},credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',body:JSON.stringify(receipt||{question,consent:true,consentVersion:'query-feedback-1'})});
    if(!response.ok)throw Error('暂时无法提交，请稍后重试');return response.json();
  }
  requestAnimationFrame(()=>track('page_view',{lang:document.documentElement.lang==='en'?'en':'zh'}));
  return {track,flush,view,feedback,setReadingContext(provider){if(typeof provider==='function')readingContext=provider;}};
})();
