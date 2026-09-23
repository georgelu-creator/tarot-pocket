/* Local reading first; online AI depth runs only after an explicit user action. */
window.TarotReadingAI = (() => {
  'use strict';
  let pending=null,error='',lastReading='';const trackedOffline=new Set();
  const locale=()=>document.documentElement.lang==='en'?'en':'zh';
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const format=text=>text.split(/\n\s*\n/).map(block=>{const safe=esc(block).replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');const heading=safe.match(/^#{1,3} +([^\n]+)$/);return heading?'<h3>'+heading[1]+'</h3>':'<p>'+safe+'</p>';}).join('');
  const endpoint=()=>window.TAROT_STANDALONE?'':window.TarotAccess?.readingEndpoint?.()||'';
  const clean=raw=>{
    if(raw===undefined)return undefined;
    if(!Array.isArray(raw)||raw.length>2)throw Error('AI 解读记录格式不正确');
    const seen=new Set();return raw.map(x=>{if(!x||!['zh','en'].includes(x.language)||seen.has(x.language)||typeof x.text!=='string'||!x.text.trim()||x.text.length>30000||!['deepseek','openai','safety'].includes(x.provider)||typeof x.model!=='string'||x.model.length>100||!Number.isFinite(x.at))throw Error('AI 解读记录格式不正确');if(x.provider==='safety'&&x.model!=='safety-boundary')throw Error('AI 解读记录格式不正确');seen.add(x.language);return {language:x.language,text:x.text,provider:x.provider,model:x.model,at:x.at};});
  };
  const messages={AUTH_REQUIRED:'这次连接已失效，请重新尝试 AI 深度解析。',RATE_LIMITED:'今天的 AI 深度解析使用较多，请稍后再试。本地解读仍可继续看。',NOT_CONFIGURED:'AI 深度解析尚未配置完成。本地解读仍可使用。',TIMEOUT:'深度解读等待超时，牌阵已保留，可以重试。',UPSTREAM_ERROR:'AI 暂时没有返回完整解读，请稍后再试。',INVALID_REQUEST:'这组牌的信息不完整，请回到牌阵核对。',UNAVAILABLE:'暂时无法连接 AI。你的问题、牌面和本地解读都已保留。',INCOMPLETE_RESPONSE:'AI 暂时没有返回完整解读，请稍后再试。',MODEL_REFUSAL:'AI 无法解读这次问题。牌阵已保留，可以修改问题后重试。',BUSY:'AI 正在处理其他解读，请稍后再试。',ORIGIN_NOT_ALLOWED:'当前地址尚未获准连接 AI 服务。',PAYLOAD_TOO_LARGE:'问题内容过长，请缩短后再试。'};
  const effectiveQuestion=s=>s.userQuestion?.trim()||s.questionText?.trim()||'';
  const buildRequest=(s,language=locale())=>{const clearedScenario=Object.hasOwn(s,'userQuestion')&&!s.userQuestion?.trim()&&!s.questionText?.trim();return {spreadId:s.spreadId,topic:s.scenarioId?(window.TAROT_READING_SCENARIOS?.find(x=>x.id===s.scenarioId)?.topic||s.topic||'general'):s.contextEnabled===false?'general':s.topic||'general',question:effectiveQuestion(s),language,cards:s.picked.map(i=>({id:s.pool[i].id,reversed:s.pool[i].reversed})),...(s.optionA?{optionA:s.optionA}:{}),...(s.optionB?{optionB:s.optionB}:{}),...(s.optionC?{optionC:s.optionC}:{}),...(!clearedScenario&&s.scenarioId?{scenarioId:s.scenarioId,sceneVersion:s.sceneVersion||'1'}:{}),...(s.timeframe?{timeframe:s.timeframe}:{})};};
  const waitingTips=[
    '正在把每张牌放回它的牌位，连起这组牌的主线。',
    '正在对照正逆位与问题，确认回答真正落到你关心的事上。',
    '牌阵已经保留。你可以继续看牌，也可以取消等待。',
    '完整解读回来后，会和这组牌一起保存在本机。'
  ];
  function waiting(s){
    const elapsed=Date.now()-pending.startedAt,index=Math.floor(elapsed/6000)%waitingTips.length;
    return `<div class="ai-waiting" aria-busy="true"><div class="ai-waiting-orbit" aria-hidden="true"><span class="reading-back"></span><span class="reading-back"></span><span class="reading-back"></span><i>✦</i></div><p class="ai-status" role="status">正在细读这组牌…</p><div class="ai-waiting-tip"><small>深度解读</small><p data-ai-wait-tip>${esc(waitingTips[index])}</p></div><p class="ai-waiting-long" data-ai-wait-long ${elapsed<25000?'hidden':''}>这次解读还在继续。取消等待不会改变已经抽到的牌。</p><button class="secondary" data-reading="ai-cancel">取消等待</button></div>`;
  }
  function updateWaiting(job){
    if(pending!==job||job.current()?.id!==job.id)return;
    const elapsed=Date.now()-job.startedAt,tip=document.querySelector('[data-ai-wait-tip]'),long=document.querySelector('[data-ai-wait-long]');
    if(tip){const index=Math.floor(elapsed/6000)%waitingTips.length;if(tip.dataset.tipIndex!==String(index)){tip.dataset.tipIndex=String(index);tip.textContent=waitingTips[index];}}
    if(long)long.hidden=elapsed<25000;
  }
  function offline(s){
    try{return window.TarotOfflineReading.interpret(buildRequest(s,locale()));}
    catch(_){return null;}
  }
  function offlineHtml(s,result=offline(s)){
    if(!result)return '<section class="reading-offline"><h2>先看这组牌</h2><p>本地解读暂时无法生成，可以先点开每张牌查看牌义。</p></section>';
    if(!trackedOffline.has(s.id)){trackedOffline.add(s.id);queueMicrotask(()=>window.TarotAnalytics?.track('offline_reading_view',{spread:s.spreadId,source:'local'},'reading-result'));}
    const positionDetails=result.positions.map(position=>`<article><h4>${esc(position.positionLabel)} · ${esc(position.cardName)}</h4><p>${esc(position.reading)}</p></article>`).join('');
    const sections=result.sections.map(section=>`<section><h3>${esc(section.title)}</h3><p>${esc(section.text)}</p></section>`).join('');
    return `<section class="reading-offline"><div class="eyebrow">本地牌阵解读</div><h2>${esc(result.overview.title)}</h2><p>${esc(result.overview.text)}</p>${sections}<section class="offline-closing"><h3>${esc(result.closing.title)}</h3><p>${esc(result.closing.text)}</p><p class="muted">${esc(result.closing.realityCheck)}</p></section><details><summary>${result.language==='en'?'How each card supports this reading':'每张牌怎样支持这个判断'}</summary>${positionDetails}</details><p class="reading-boundary">${esc(result.boundaries[0])}</p></section>`;
  }
  function render(s){
    if(lastReading!==s.id){lastReading=s.id;error='';}
    const local=offline(s),blocked=!!local?.safety,saved=s.ai?.find(x=>x.language===locale()),working=pending?.id===s.id;
    const onlineSection=blocked
      ? '<section class="reading-ai reading-safety" data-reading-ai><div class="eyebrow">安全边界</div><h2>这类问题不提供 AI 深度解析</h2><p class="ai-status">请按上面的现实处理建议处理；情况紧急时立即联系当地急救、警方或身边可信任的人。</p></section>'
      : saved
      ? saved.provider==='safety'
        ? `<section class="reading-ai reading-safety" data-reading-ai><div class="eyebrow">安全边界提示</div><h2>这类问题不交给 AI 判断</h2><div class="ai-answer" data-i18n-ignore>${format(saved.text)}</div><p class="ai-attribution"><span>未调用 AI</span><span> · 已随牌阵保存</span></p></section>`
        : `<section class="reading-ai" data-reading-ai><div class="eyebrow">AI 深度解读</div><h2>AI 深度解读</h2><div class="ai-answer" data-i18n-ignore>${format(saved.text)}</div><p class="ai-attribution"><span>AI 解读</span> · <span data-i18n-ignore>${esc(saved.provider==='deepseek'?'DeepSeek':'OpenAI')} / ${esc(saved.model)}</span><span> · 已随牌阵保存</span></p></section>`
      : `<section class="reading-ai" data-reading-ai><div class="eyebrow">可选深度解读</div><h2>${working?'正在细读这组牌':'还想看得更深一点？'}</h2>${working?waiting(s):`<p class="ai-status">${window.TAROT_STANDALONE?'离线文件保留本地解读；联网版可以按你的问题生成更深入的整组分析。':'本地解读已经完成。需要更贴合具体问题时，可以再请 AI 深度解析；只有点击下面按钮才会联网。'}</p>${!navigator.onLine?'<p class="ai-status">当前离线，本地解读仍可完整阅读。</p>':''}${error?`<p class="ai-error" role="alert">${esc(messages[error]||messages.UNAVAILABLE)}</p><button class="secondary" data-reading="ai-request">再试一次 AI 深度解析</button>`:!window.TAROT_STANDALONE&&navigator.onLine?'<button class="primary" data-reading="ai-request">请 AI 深度解析</button>':''}`}</section>`;
    return offlineHtml(s,local)+onlineSection;
  }
  function patch(s){if(!s)return;const el=document.querySelector('[data-reading-completion]');if(el)el.innerHTML=render(s);}
  async function request(s,save,current){
    if(pending||!endpoint()||s.phase!=='read'||window.TAROT_STANDALONE||offline(s)?.safety)return;
    const language=locale();if(s.ai?.some(x=>x.language===language))return;
    const controller=new AbortController(),job={id:s.id,controller,startedAt:Date.now(),current};pending=job;error='';patch(s);job.tipTimer=setInterval(()=>updateWaiting(job),1000);
    const timeout=setTimeout(()=>{job.timeout=true;controller.abort();},125000);
    try{
      const session=await window.TarotAccess?.ensureSession?.();if(!session)throw Error('UNAVAILABLE');
      let url;try{url=new URL(endpoint(),location.href);if(url.protocol!=='https:'&&!(url.origin===location.origin&&['localhost','127.0.0.1'].includes(url.hostname)))throw Error();if(url.username||url.password||url.hash||url.search)throw Error();}catch(_){throw Error('NOT_CONFIGURED');}
      const requestContext=JSON.stringify(buildRequest(s,language));
      const response=await fetch(url.href,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session},body:requestContext,signal:controller.signal,credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',redirect:'error'});
      if(Number(response.headers.get('content-length'))>150000)throw Error('UPSTREAM_ERROR');
      const reader=response.body.getReader(),chunks=[];let size=0;for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>150000){await reader.cancel();throw Error('UPSTREAM_ERROR');}chunks.push(value);}
      const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.byteLength;}const result=JSON.parse(new TextDecoder().decode(bytes));
      if(!response.ok)throw Error(Object.hasOwn(messages,result.error)?result.error:'UPSTREAM_ERROR');
      let answer;try{answer=clean([{language,text:result.text,model:result.model,provider:result.provider,at:Date.now()}])[0];}catch(_){throw Error('UPSTREAM_ERROR');}
      if(!job.cancelled&&pending===job&&JSON.stringify(buildRequest(s,language))===requestContext)save(s.id,answer,requestContext);
    }catch(e){if(!job.cancelled&&pending===job){error=job.timeout?'TIMEOUT':Object.hasOwn(messages,e.message)?e.message:'UNAVAILABLE';if(error==='AUTH_REQUIRED')window.TarotAccess?.clear();}}
    finally{clearTimeout(timeout);clearInterval(job.tipTimer);if(pending===job)pending=null;const visible=current();if(visible?.id===s.id&&visible.phase==='read')patch(visible);}
  }
  window.addEventListener('pagehide',()=>{if(pending){pending.cancelled=true;clearInterval(pending.tipTimer);pending.controller.abort();}});
  return {render,clean,buildRequest,request,cancel(s){if(pending){pending.cancelled=true;clearInterval(pending.tipTimer);pending.controller.abort();pending=null;}error='';patch(s);},refresh:patch};
})();
