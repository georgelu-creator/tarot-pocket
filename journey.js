/* Continuous card learning. SM-2 interval rule, with explicitly documented
   same-day promotion guard and separate recall/self-report evidence. */
(() => {
  'use strict';
  const DAY = 86400000;
  const skills = ['image','meaning','recall','compare','application','reversal'];
  const labels = {image:'画面线索',meaning:'核心含义',recall:'独立回忆',compare:'相似辨析',application:'情境运用',reversal:'逆位理解'};
  const blank = () => ({version:1,cards:{},session:null,paused:{}});
  const clamp = (n,min,max,fallback=min) => Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback;
  function validate(raw,ids) {
    const out=blank(), valid=new Set(ids);
    if(!raw)return out;
    if(raw.version!==1 || !raw.cards || typeof raw.cards!=='object' || Array.isArray(raw.cards))throw Error('学习记录格式不正确');
    for(const [id,r] of Object.entries(raw.cards)) {
      if(!valid.has(id) || !r || typeof r!=='object')continue;
      const clean={introducedAt:clamp(r.introducedAt,0,1e14),lastAt:clamp(r.lastAt,0,1e14),rounds:Math.floor(clamp(r.rounds,0,100000)),skills:{}};
      for(const key of skills){const x=r.skills?.[key];if(!x)continue;clean.skills[key]={ef:clamp(x.ef,1.3,5,2.5),reps:Math.floor(clamp(x.reps,0,10000)),interval:clamp(x.interval,0,36500),due:clamp(x.due,0,1e14),last:clamp(x.last,0,1e14),passes:Math.floor(clamp(x.passes,0,10000)),lapses:Math.floor(clamp(x.lapses,0,10000)),grade:Math.floor(clamp(x.grade,0,5))};}
      out.cards[id]=clean;
    }
    const s=raw.session;
    if(s && valid.has(s.cardId) && Array.isArray(s.steps) && s.steps.length>0 && s.steps.length<=8 && new Set(s.steps).size===s.steps.length && s.steps.every(k=>k==='intro'||skills.includes(k)) && Number.isInteger(s.index) && s.index>=0 && s.index<=s.steps.length){
      if(!out.cards[s.cardId])throw Error('学习记录格式不正确');
      out.session={cardId:s.cardId,seed:Math.floor(clamp(s.seed,1,1e9,1)),mode:s.mode==='review'?'review':'new',topic:['love','career','study'].includes(s.topic)?s.topic:'career',position:['state','tension','advice'].includes(s.position)?s.position:'advice',steps:[...s.steps],index:s.index,startedAt:clamp(s.startedAt,0,1e14),revealed:!!s.revealed,answers:{},complete:!!s.complete && s.index===s.steps.length};
      for(const k of s.steps){const a=s.answers?.[k];if(a && typeof a.selected==='string' && a.selected.length<30 && Number.isInteger(a.grade) && a.grade>=0 && a.grade<=5)out.session.answers[k]={selected:a.selected,grade:a.grade,correct:!!a.correct,hint:!!a.hint};}
      out.session.hint=!!s.hint;
      const missing=out.session.steps.findIndex((key,i)=>i<out.session.index && key!=='intro' && !out.session.answers[key]);
      if(missing>=0)out.session.index=missing;
      out.session.complete=out.session.index===out.session.steps.length;
    }
    if(raw.paused && typeof raw.paused==='object')for(const [id,session] of Object.entries(raw.paused)){if(valid.has(id)&&session?.cardId===id){const clean=validate({version:1,cards:out.cards,session},ids).session;if(clean&&!clean.complete)out.paused[id]=clean;}}
    return out;
  }
  function rate(old,grade,at) {
    const prev=old||{ef:2.5,reps:0,interval:0,due:at,last:0,passes:0,lapses:0};
    const q=Math.round(clamp(grade,0,5));
    // Looking at an answer and immediately retrying must not grow the interval.
    if(old && at-prev.last<DAY){return {...prev,grade:Math.min(prev.grade??q,q),last:at,due:q<3?Math.min(prev.due,at+DAY):prev.due,lapses:prev.lapses+(q<3?1:0),...(q<3?{reps:0,interval:1}:{})};}
    const ef=Math.max(1.3,prev.ef+0.1-(5-q)*(0.08+(5-q)*0.02));
    const reps=q<3?0:prev.reps+1;
    const interval=q<3?1:reps===1?1:reps===2?6:Math.ceil(prev.interval*prev.ef);
    return {ef:Math.min(5,ef),reps,interval,due:at+interval*DAY,last:at,grade:q,passes:prev.passes+(old&&q>=3?1:0),lapses:prev.lapses+(q<3?1:0)};
  }
  function level(r) {
    if(!r)return '未开始';
    if(!r.rounds)return '学习中';
    const values=Object.values(r.skills);
    if(values.some(s=>s.grade<3))return '待巩固';
    if((r.skills.application?.passes||0)>=2 && (r.skills.recall?.passes||0)>=2 && r.skills.application.reps>=2 && r.skills.recall.reps>=2)return '能运用';
    if((r.skills.recall?.passes||0)>=1 && (r.skills.meaning?.passes||0)>=1)return '已回访';
    return '初步理解';
  }
  function makeStep(key,c,lesson,deck,s) {
    const topic={love:'感情',career:'事业',study:'学业'}[s.topic];
    const context=c.contexts[s.topic];
    const near=deck[lesson.compareId];
    const neighbors=Object.values(deck).filter(x=>x.id!==c.id).sort((a,b)=>Number(b.suit===c.suit)-Number(a.suit===c.suit));
    const alternatives=[near,...neighbors.filter(x=>x.id!==near.id)].slice(0,3);
    if(key==='image')return {title:'看见什么，才这样理解？',prompt:lesson.anchor,correct:'yes',options:[{id:'yes',text:c.observation},...alternatives.slice(0,2).map(x=>({id:x.id,text:x.observation}))],explanation:lesson.why};
    if(key==='meaning')return {title:'这些说法很接近，哪句更贴合？',prompt:'结合画面动作，选出这张牌的核心主题。',correct:'yes',options:[{id:'yes',text:c.core},...lesson.distractors.map((text,i)=>({id:'d'+i,text}))],explanation:lesson.why};
    if(key==='compare')return {title:'两张都像，差别在哪里？',prompt:c.core,correct:c.id,options:[{id:c.id,text:c.name,card:c.id},{id:near.id,text:near.name,card:near.id}],explanation:lesson.distinction};
    if(key==='application')return {title:'同一张牌，换一个位置。',prompt:c.questions[s.topic],context:topic,position:{state:'现状位',tension:'阻碍位',advice:'建议位'}[s.position],correct:s.position,options:['state','tension','advice'].map(id=>({id,text:context[id]})),explanation:{state:'现状位描述目前的状态；这里先观察发生了什么，不直接给行动指令。',tension:'阻碍位指出让事情卡住的表达方式；它与现状描述和行动建议承担不同任务。',advice:'建议位回应可以怎样行动；它不把某种状态当成确定会发生的结果。'}[s.position]};
    if(key==='reversal')return {title:'逆位时，先检查什么？',prompt:'按这张牌的核心主题，哪条逆位检查线索最贴合？',correct:'yes',options:[{id:'yes',text:c.reversed},...alternatives.map(x=>({id:x.id,text:x.reversed}))],explanation:'逆位可能表现为受阻、过度或内化。这里是在辨认本课程的检查线索，不是只凭逆位断定现实结果。'};
    return null;
  }
  function create(bridge) {
    const {esc,img,icon,go,toast,now,cardMap:deck,get,set}=bridge;
    const lessons=Object.fromEntries(window.TAROT_CURRICULUM.cards.map(c=>[c.id,c]));
    const order=[...new Set(['p04','m16','m13','c05','c08','m00','m01','m09','m02','w01','s04','p08',...Object.keys(deck)])];
    const record=id=>get().cards[id];
    const current=()=>get().session;
    const active=()=>current()&&!current().complete;
    function due(){return order.filter(id=>record(id)&&Object.values(record(id).skills).some(x=>x.due<=now())).sort((a,b)=>Math.min(...Object.values(record(a).skills).map(x=>x.due))-Math.min(...Object.values(record(b).skills).map(x=>x.due)));}
    function recommendation(exclude){return due().find(id=>id!==exclude)||Object.keys(get().paused||{}).find(id=>id!==exclude)||order.find(id=>!record(id)&&id!==exclude)||order.filter(id=>id!==exclude).sort((a,b)=>(record(a)?.lastAt||0)-(record(b)?.lastAt||0))[0];}
    function start(id,force=false){
      const data=get();
      if(!id && active() && !force){go('journey');return;}
      id=id||recommendation(force?current()?.cardId:null);
      if(!lessons[id])return;
      if(active()&&current().cardId===id&&!force){go('journey');return;}
      data.paused ||= {};
      if(active() && current().cardId!==id)data.paused[current().cardId]=structuredClone(current());
      if(data.paused[id]&&!force){data.session=data.paused[id];delete data.paused[id];set(data);go('journey');return;}
      delete data.paused[id];
      const r=record(id),review=!!r?.rounds;
      const weak=skills.filter(k=>k!=='recall').sort((a,b)=>(r?.skills[a]?.due||0)-(r?.skills[b]?.due||0));
      const steps=review?['recall',...weak.slice(0,3)]:['intro','image','meaning','recall','compare','application','reversal'];
      data.cards[id] ||= {introducedAt:now(),lastAt:now(),rounds:0,skills:{}};
      data.session={cardId:id,seed:Math.floor(Math.random()*999999999)+1,mode:review?'review':'new',topic:['career','love','study'][(r?.rounds||0)%3],position:['advice','tension','state'][Math.floor((r?.rounds||0)/3)%3],steps,index:0,startedAt:now(),answers:{},revealed:false,hint:false,complete:false};
      set(data);go('journey');
    }
    function ordered(options,s){return options.map((o,i)=>({o,n:Math.sin(s.seed*(i+1)+s.index*101)*10000})).sort((a,b)=>a.n-b.n).map(x=>x.o);}
    function saveAnswer(selected,grade,correct){
      const d=get(),s=d.session,key=s.steps[s.index];if(s.answers[key])return;
      s.answers[key]={selected,grade,correct,hint:!!s.hint};
      const r=d.cards[s.cardId];r.skills[key]=rate(r.skills[key],grade,now());r.lastAt=now();set(d);go('journey');
      requestAnimationFrame(()=>document.querySelector('.journey-feedback')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'}));
    }
    function next(){
      const d=get(),s=d.session;if(!s||s.complete)return;
      if(s.steps[s.index]!=='intro'&&!s.answers[s.steps[s.index]])return;
      s.index++;s.revealed=false;s.hint=false;
      if(s.index===s.steps.length){s.complete=true;d.cards[s.cardId].rounds++;d.cards[s.cardId].lastAt=now();}
      set(d);go('journey');
    }
    function progress(id){const r=record(id);return `<div class="memory-state"><span class="memory-level">${esc(level(r))}</span>${r?`<span>${skills.filter(k=>(r.skills[k]?.grade||0)>=3).length} / 6 <span>本轮有支持</span></span>`:''}</div>`;}
    function dashboard(){const rs=Object.values(get().cards),started=rs.length,finished=rs.filter(r=>r.rounds).length,revisited=rs.filter(r=>Object.values(r.skills).some(x=>x.passes>0)).length;return `<section class="journey-dashboard"><div class="sectionhead"><h2>我的记忆足迹</h2><span class="tiny muted">${finished} / 78 <span>完成初学</span></span></div><div class="memory-counts"><div><strong>${started}</strong><span>接触过</span></div><div><strong>${revisited}</strong><span>隔天回访过</span></div><div><strong>${due().length}</strong><span>可以复习</span></div></div><p class="tiny muted">看过、自评和单次答对分别记录；隔天回访才检验是否还能想起。</p>${started?`<div class="memory-log">${order.filter(id=>record(id)).map(id=>`<button data-journey="start" data-id="${id}">${img(id)}<span><strong>${esc(deck[id].name)}</strong>${progress(id)}</span>${icon('arrow')}</button>`).join('')}</div>`:'<p class="empty">从一张牌开始，进步会留在这里。</p>'}</section>`;}
    function hero(){const id=active()?current().cardId:recommendation(),c=deck[id];const isDue=due().includes(id);return `<section class="journey-recommend"><div><span class="eyebrow">${active()?'接着上次':'下一次遇见'}</span><h2>${esc(c.name)}</h2><p>${active()?'你的作答已经保存，从停下的地方继续。':isDue?'先不看提示，看看熟悉的牌还记得多少。':esc(lessons[id].anchor)}</p><button class="primary" data-journey="continue">${active()?'继续学习':isDue?'回忆这张牌':'开始学这张'} ${icon('arrow')}</button></div><button class="journey-hero-image" data-action="card" data-id="${id}" aria-label="查看牌的介绍">${img(id)}</button></section>`;}
    function render(){
      const s=current();if(!s)return '';
      const c=deck[s.cardId],lesson=lessons[s.cardId],key=s.steps[s.index],answer=s.answers[key];
      const head=`<header class="journey-top"><button class="iconbtn" data-action="nav" data-page="home" aria-label="暂停学习">${icon('close')}</button><div><span>${esc(c.name)}</span><div class="journey-progress" role="progressbar" aria-label="本张学习进度" aria-valuenow="${s.index}" aria-valuemin="0" aria-valuemax="${s.steps.length}"><i style="width:${s.index/s.steps.length*100}%"></i></div></div><span class="tiny">${Math.min(s.index+1,s.steps.length)} / ${s.steps.length}</span></header>`;
      if(s.complete){const r=record(c.id),weak=skills.filter(k=>r.skills[k]?.grade<3),dueAt=Math.min(...Object.values(r.skills).map(x=>x.due));return `<main class="journey-shell">${head}<section class="journey-complete"><div class="journey-complete-image">${img(c.id)}</div><span class="eyebrow">${weak.length?'把差别带走，下次再遇见':'又建立了一点自己的理解'}</span><h1>${esc(c.name)}</h1><p class="memory-anchor">${esc(lesson.anchor)}</p>${progress(c.id)}<p>${weak.length?'下次会重点回访这些地方：':'这次表现已记录。隔一段时间，换个问法再检验。'}</p>${weak.length?`<div class="tags">${weak.map(k=>`<span class="tag">${labels[k]}</span>`).join('')}</div>`:''}<p class="tiny muted"><span>下次复习</span> · ${new Date(dueAt).toLocaleDateString(window.TAROT_I18N?.locale==='en'?'en':'zh-CN',{month:'short',day:'numeric'})}</p><div class="journey-actions"><button class="primary wide" data-journey="next-card">继续学下一张 ${icon('arrow')}</button><button class="secondary wide" data-action="nav" data-page="library">自己选一张牌</button><button class="linkbtn" data-journey="repeat">再巩固这张牌</button><button class="linkbtn" data-action="nav" data-page="home">今天先到这里</button></div></section></main>`;}
      const cardImage=`<button class="journey-image ${key==='reversal'?'is-reversed':''}" data-action="zoom" data-id="${c.id}" aria-label="放大牌面">${img(c.id)}</button>`;
      let body='';
      if(key==='intro')body=`${cardImage}<div class="journey-copy"><span class="eyebrow">先从画面认识它</span><h1>${esc(lesson.anchor)}</h1><p>${esc(c.observation)}</p><div class="journey-note"><strong>为什么是这个含义？</strong><p>${esc(lesson.why)}</p></div><details class="journey-scaffold"><summary>元素、数字与这张牌</summary>${scaffold(c)}</details><p class="tiny muted">接下来会从不同角度遇见它。随时暂停，回来接着学。</p><button class="primary wide" data-journey="next">记住这个画面，试一试 ${icon('arrow')}</button></div>`;
      else if(key==='recall')body=`${cardImage}<div class="journey-copy"><span class="eyebrow">先在脑中想，不用打字</span><h1>合上答案，还能想起什么？</h1><p>回忆一个关键动作，以及它怎样形成牌义。</p>${!s.revealed?'<button class="primary wide" data-journey="reveal">我想好了，核对一下</button>':`<div class="journey-note"><strong>${esc(lesson.anchor)}</strong><p>${esc(lesson.why)}</p></div>${answer?`<div class="journey-feedback" role="status"><strong>回忆自评已记录</strong><p>这是你的自我判断，后面的应用会再帮助核对。</p><button class="primary wide" data-journey="next">继续 ${icon('arrow')}</button></div>`:`<p>刚才的回忆接近哪一种？</p><div class="recall-ratings">${[['2','没想起来'],['3','只想到一点'],['4','基本想起'],['5','清楚想起']].map(([v,t])=>`<button class="secondary" data-journey="rate" data-value="${v}">${t}</button>`).join('')}</div>`}`}</div>`;
      else {const step=makeStep(key,c,lesson,deck,s);const opts=ordered(step.options,s);body=`${key==='compare'?'':cardImage}<div class="journey-copy"><span class="eyebrow">${labels[key]}${step.context?' · '+step.context+' · '+step.position:''}</span><h1>${esc(step.title)}</h1><p class="journey-prompt">${esc(step.prompt)}</p><div class="journey-options ${key==='compare'?'compare-options':''}">${opts.map((o,i)=>`<button class="journey-option ${answer?(o.id===step.correct?'correct':answer.selected===o.id?'incorrect':''):''}" data-journey="answer" data-value="${o.id}" ${answer?'disabled':''}>${o.card?img(o.card):`<span class="letter">${String.fromCharCode(65+i)}</span>`}<span>${esc(o.text)}</span>${answer&&o.id===step.correct?'<b class="answer-marker">✓</b>':''}${answer&&answer.selected===o.id&&!answer.correct?'<b class="answer-marker">✕</b>':''}</button>`).join('')}</div>${!answer?`<div class="journey-help"><button class="linkbtn" data-journey="hint">看看线索</button><button class="linkbtn" data-journey="unknown">还不确定</button></div>${s.hint?`<div class="journey-note">${esc(lesson.why)}</div>`:''}`:`<section class="journey-feedback ${answer.correct?'correct':'incorrect'}" role="status"><strong>${answer.selected==='unknown'?'这题还不确定':answer.correct?'✓ 答对了':'✕ 答错了'}</strong><p><b>本题正确答案：</b>${esc(step.options.find(o=>o.id===step.correct).text)}</p><p>${esc(step.explanation)}</p>${!answer.correct&&key==='meaning'?`<p>${esc(lesson.distinction)}</p>`:''}<button class="primary wide" data-journey="next">${s.index===s.steps.length-1?'收好这一张的收获':'继续下一步'} ${icon('arrow')}</button></section>`}</div>`;}
      return `<main class="journey-shell">${head}<section class="journey-stage ${key==='compare'?'journey-compare':''}">${body}</section></main>`;
    }
    function scaffold(c){const rank=Number(c.id.slice(1)),m=c.id[0]==='m';const numberHints=['','起点与潜能','两端、选择与平衡','展开、合作与初步成果','结构、稳定与停驻','扰动、冲突与调整','重新协调与移动','检验、坚持与策略','推进、组织与熟练','接近完成与个人承受','完成、饱和与进入下一轮'];return `<p><strong>${esc(c.suit)} · ${esc(c.element==='—'?'人生主题':c.element)} · ${esc(c.number)}</strong></p><p>${m?'大阿尔卡纳以各自的画面与人生主题为主，不套用小牌数字公式。':rank>10?'宫廷牌可作为行动风格来理解：侍从探索、骑士追求、王后涵养、国王统筹；不限定现实人物的性别或年龄。':esc(numberHints[rank])}</p><p>${esc(lessons[c.id].why)}</p><small>这些是本课程的助记线索。回到牌面核对，不把元素与数字当作万能公式。</small>`;}
    document.addEventListener('click',event=>{
      const el=event.target.closest('[data-journey]');if(!el||el.disabled)return;
      const action=el.dataset.journey;
      if(action==='continue'){start();return;}
      if(action==='start'){start(el.dataset.id);return;}
      if(action==='next-card'){start(null,true);return;}
      if(action==='repeat'){start(current()?.cardId,true);return;}
      const d=get(),s=d.session;if(!s||s.complete)return;
      if(action==='next')next();
      else if(action==='reveal'){s.revealed=true;set(d);go('journey');}
      else if(action==='hint'){s.hint=true;set(d);go('journey');}
      else if(action==='rate'&&s.steps[s.index]==='recall'&&s.revealed){const q=Number(el.dataset.value);if([2,3,4,5].includes(q))saveAnswer(String(q),q,q>=3);}
      else if(['answer','unknown'].includes(action)){
        const key=s.steps[s.index],step=makeStep(key,deck[s.cardId],lessons[s.cardId],deck,s);if(!step)return;
        const selected=action==='unknown'?'unknown':el.dataset.value;if(selected!=='unknown'&&!step.options.some(x=>x.id===selected))return;
        const correct=selected===step.correct;saveAnswer(selected,correct&&!s.hint?4:2,correct);
      }
    });
    return {start,render,hero,dashboard,progress,scaffold,record,due,active,recommendation,level:id=>level(record(id)),lesson:id=>lessons[id]};
  }
  window.TarotJourney={blank,validate,rate,level,makeStep,skills,labels,create};
})();
