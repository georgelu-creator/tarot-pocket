/* Explicit online interpretation; the app session is automatic and provider credentials remain server-side. */
window.TarotReadingAI = (() => {
  'use strict';
  let pending=null,error='',lastReading='';
  const locale=()=>document.documentElement.lang==='en'?'en':'zh';
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const format=text=>text.split(/\n\s*\n/).map(block=>{const safe=esc(block).replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');const heading=safe.match(/^#{1,3} +([^\n]+)$/);return heading?'<h3>'+heading[1]+'</h3>':'<p>'+safe+'</p>';}).join('');
  const endpoint=()=>window.TAROT_STANDALONE?'':window.TAROT_AI_CONFIG?.endpoint||'';
  const clean=raw=>{
    if(raw===undefined)return undefined;
    if(!Array.isArray(raw)||raw.length>2)throw Error('AI 解读记录格式不正确');
    const seen=new Set();return raw.map(x=>{if(!x||!['zh','en'].includes(x.language)||seen.has(x.language)||typeof x.text!=='string'||!x.text.trim()||x.text.length>30000||!['deepseek','openai'].includes(x.provider)||typeof x.model!=='string'||x.model.length>100||!Number.isFinite(x.at))throw Error('AI 解读记录格式不正确');seen.add(x.language);return {language:x.language,text:x.text,provider:x.provider,model:x.model,at:x.at};});
  };
  const messages={AUTH_REQUIRED:'登录已过期，请重新输入邀请码。',RATE_LIMITED:'本次解读暂时达到使用上限，请稍后再试。',NOT_CONFIGURED:'AI 服务尚未配置完成。牌阵与离线参考仍可使用。',TIMEOUT:'解读等待超时，牌阵已保留，可以重试。',UPSTREAM_ERROR:'AI 暂时没有返回完整解读，请稍后再试。',INVALID_REQUEST:'这组牌的信息不完整，请回到牌阵核对。',UNAVAILABLE:'暂时无法连接 AI 服务。你的牌阵没有改变。',INCOMPLETE_RESPONSE:'AI 暂时没有返回完整解读，请稍后再试。',MODEL_REFUSAL:'AI 无法解读这次问题，可以修改问题后重新抽牌。',BUSY:'AI 服务正在处理其他解读，请稍后再试。',ORIGIN_NOT_ALLOWED:'此网页尚未获准连接该 AI 服务。',PAYLOAD_TOO_LARGE:'问题内容过长，请缩短后再试。'};
  function action(s){
    return `<div class="ai-action"><div class="ai-question"><small>本次重点回应</small><p>${esc(s.questionText||'这组牌呈现的主要方向')}</p></div><button type="button" class="primary wide" data-reading="ai-request" ${navigator.onLine?'':'disabled'}>生成完整解读</button><p class="ai-disclosure">点击后，仅将这次的问题、牌阵、牌位与正逆位发送给解读服务。学习记录不会发送。</p></div>`;
  }
  function render(s){
    if(lastReading!==s.id){lastReading=s.id;error='';}
    const saved=s.ai?.find(x=>x.language===locale()),working=pending?.id===s.id;
    return `<section class="reading-ai" data-reading-ai><div class="eyebrow">WHOLE-SPREAD READING</div><h2>${saved?'你的整组解读':'看懂这组牌的主线'}</h2>${saved?`<div class="ai-answer" data-i18n-ignore>${format(saved.text)}</div><p class="ai-attribution"><span>AI 解读</span> · <span data-i18n-ignore>${esc(saved.provider==='deepseek'?'DeepSeek':'OpenAI')} / ${esc(saved.model)}</span><span> · 已随牌阵保存</span></p>`:working?'<p class="ai-status" role="status">正在结合你的问题、牌位与整组牌解读…</p><button class="secondary" data-reading="ai-cancel">取消等待</button>':endpoint()?`<p>从你的具体问题出发，连接每个牌位与正逆位，形成一条完整主线。</p>${action(s)}`:`<p class="ai-status">${window.TAROT_STANDALONE?'这是独立离线文件。联网 AI 解读请打开网页版；已保存的解读可在这里阅读。':'AI 服务尚未连接；连接后可在这里生成整组解读。'}</p>`}${!navigator.onLine?'<p class="ai-status">当前离线。已保存的解读仍可阅读；新解读需要联网。</p>':''}${error?`<p class="ai-error" role="alert">${esc(messages[error]||messages.UNAVAILABLE)}</p>`:''}</section>`;
  }
  function patch(s){const el=document.querySelector('[data-reading-ai]');if(el){const h=document.createElement('div');h.innerHTML=render(s);el.replaceWith(h.firstElementChild);}}
  async function request(s,save,current){
    if(pending||!endpoint()||s.phase!=='read')return;
    const language=locale();if(s.ai?.some(x=>x.language===language))return;
    const session=window.TarotAccess?.token?.();if(!session){window.TarotAccess?.clear();return;}
    let url;try{url=new URL(endpoint(),location.href);if(url.protocol!=='https:'&&!(url.origin===location.origin&&['localhost','127.0.0.1'].includes(url.hostname)))throw Error();if(url.username||url.password||url.hash||url.search)throw Error();}catch(_){error='NOT_CONFIGURED';patch(s);return;}
    const controller=new AbortController(),job={id:s.id,controller};pending=job;error='';patch(s);
    const timeout=setTimeout(()=>{job.timeout=true;controller.abort();},125000);
    try{
      const body={spreadId:s.spreadId,question:s.questionText||'',language,cards:s.picked.map(i=>({id:s.pool[i].id,reversed:s.pool[i].reversed})),...(s.optionA?{optionA:s.optionA}:{}),...(s.optionB?{optionB:s.optionB}:{})};
      const response=await fetch(url.href,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session},body:JSON.stringify(body),signal:controller.signal,credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',redirect:'error'});
      if(Number(response.headers.get('content-length'))>150000)throw Error('UPSTREAM_ERROR');
      const reader=response.body.getReader(),chunks=[];let size=0;for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>150000){await reader.cancel();throw Error('UPSTREAM_ERROR');}chunks.push(value);}
      const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.byteLength;}const result=JSON.parse(new TextDecoder().decode(bytes));
      if(!response.ok)throw Error(Object.hasOwn(messages,result.error)?result.error:'UPSTREAM_ERROR');
      let answer;try{answer=clean([{language,text:result.text,model:result.model,provider:result.provider,at:Date.now()}])[0];}catch(_){throw Error('UPSTREAM_ERROR');}
      if(!job.cancelled)save(s.id,answer);
    }catch(e){if(!job.cancelled){error=job.timeout?'TIMEOUT':Object.hasOwn(messages,e.message)?e.message:'UNAVAILABLE';if(error==='AUTH_REQUIRED')window.TarotAccess?.clear();}}
    finally{clearTimeout(timeout);if(pending===job)pending=null;const visible=current();if(visible?.id===s.id)patch(visible);}
  }
  window.addEventListener('pagehide',()=>{if(pending){pending.cancelled=true;pending.controller.abort();}});
  return {render,clean,request,cancel(s){if(pending){pending.cancelled=true;pending.controller.abort();pending=null;}error='';patch(s);},refresh:patch};
})();
