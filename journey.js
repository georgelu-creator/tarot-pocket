/* Continuous card learning. SM-2 interval rule, with explicitly documented
   same-day promotion guard and separate recall/self-report evidence. */
(() => {
  'use strict';
  const DAY = 86400000;
  const skills = ['image','meaning','recall','compare','application','reversal'];
  const activeSkills=skills.filter(k=>k!=='compare');
  const labels = {image:'画面线索',meaning:'核心含义',recall:'独立回忆',compare:'相似辨析',application:'情境运用',reversal:'逆位理解'};
  const blank = () => ({version:1,cards:{},session:null,paused:{},...(window.TarotAcademy?{academy:window.TarotAcademy.blank()}:{})});
  const clamp = (n,min,max,fallback=min) => Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback;
  function validate(raw,ids) {
    const out=blank(), valid=new Set(ids);
    if(!raw)return out;
    if(raw.version!==1 || !raw.cards || typeof raw.cards!=='object' || Array.isArray(raw.cards))throw Error('学习记录格式不正确');
    for(const [id,r] of Object.entries(raw.cards)) {
      if(!valid.has(id) || !r || typeof r!=='object')continue;
      const clean={introducedAt:clamp(r.introducedAt,0,1e14),lastAt:clamp(r.lastAt,0,1e14),rounds:Math.floor(clamp(r.rounds,0,100000)),skills:{}};
      if(r.reflections&&typeof r.reflections==='object'){clean.reflections={};for(const key of skills)if(typeof r.reflections[key]==='string')clean.reflections[key]=r.reflections[key].slice(0,600);}
      for(const key of skills){const x=r.skills?.[key];if(!x)continue;clean.skills[key]={ef:clamp(x.ef,1.3,5,2.5),reps:Math.floor(clamp(x.reps,0,10000)),interval:clamp(x.interval,0,36500),due:clamp(x.due,0,1e14),last:clamp(x.last,0,1e14),passes:Math.floor(clamp(x.passes,0,10000)),lapses:Math.floor(clamp(x.lapses,0,10000)),grade:Math.floor(clamp(x.grade,0,5))};}
      out.cards[id]=clean;
    }
    const s=raw.session;
    if(s && valid.has(s.cardId) && Array.isArray(s.steps) && s.steps.length>0 && s.steps.length<=8 && new Set(s.steps).size===s.steps.length && s.steps.every(k=>k==='intro'||skills.includes(k)) && Number.isInteger(s.index) && s.index>=0 && s.index<=s.steps.length){
      if(!out.cards[s.cardId])throw Error('学习记录格式不正确');
      out.session={cardId:s.cardId,seed:Math.floor(clamp(s.seed,1,1e9,1)),mode:s.mode==='review'?'review':'new',topic:['love','career','study'].includes(s.topic)?s.topic:'career',position:['state','tension','advice'].includes(s.position)?s.position:'advice',steps:[...s.steps],index:s.index,startedAt:clamp(s.startedAt,0,1e14),revealed:!!s.revealed,answers:{},complete:!!s.complete && s.index===s.steps.length};
      for(const k of ['intro',...skills]){const a=s.answers?.[k];if(a && typeof a.selected==='string' && a.selected.length<30 && Number.isInteger(a.grade) && a.grade>=0 && a.grade<=5)out.session.answers[k]={selected:a.selected,grade:a.grade,correct:!!a.correct,hint:!!a.hint};}
      out.session.hint=!!s.hint;
      // Versioned presentation keeps already answered v1 sessions stable.
      if([2,3,4,5].includes(s.playVersion)){out.session.playVersion=s.playVersion;out.session.variant=Math.floor(clamp(s.variant,0,2));}
      if(s.playVersion>=4)out.session.inspected=!!s.inspected;
      if(s.playVersion===3){
        out.session.inspected=!!s.inspected;
        const a=s.activity;
        if(a && ['meaning','compare'].includes(a.key) && a.key===s.steps[s.index]){
          const choice=x=>typeof x==='string' && /^(yes|d[0-2]|[mwcsp][0-9]{2})$/.test(x);
          out.session.activity={key:a.key,pairs:{},repair:!!a.repair};
          for(const k of ['evidence','meaning','holding'])if(choice(a[k]))out.session.activity[k]=a[k];
          if(typeof a.result==='boolean')out.session.activity.result=a.result;
          if(a.pairs && typeof a.pairs==='object')for(const [id,value] of Object.entries(a.pairs))if(valid.has(id)&&valid.has(value))out.session.activity.pairs[id]=value;
        }
      }
      // Retire the comparison task without inventing an answer. Scores and notes
      // stay in the backup; the cursor follows the next remaining stage.
      if(s.playVersion===4){
        if(s.guided?.key==='compare'&&typeof s.guided.note==='string'&&s.guided.note){out.cards[s.cardId].reflections||={};out.cards[s.cardId].reflections.compare=s.guided.note.slice(0,600);}
        if(s.steps[s.index]==='compare'){out.session.hint=false;out.session.revealed=false;}
        out.session.index=out.session.steps.slice(0,out.session.index).filter(k=>k!=='compare').length;
        out.session.steps=out.session.steps.filter(k=>k!=='compare');
        out.session.playVersion=5;
      }
      const missing=out.session.steps.findIndex((key,i)=>i<out.session.index && key!=='intro' && !out.session.answers[key]);
      if(missing>=0)out.session.index=missing;
      out.session.complete=out.session.index===out.session.steps.length;
      if(s.playVersion>=4){
        const key=out.session.steps[out.session.index],a=out.session.answers[key];
        const g=out.session.guided=window.TarotGuided.validate(s.guided,key);
        // Imported progress can omit presentation state. Restore the committed
        // answer without scoring it again or leaving an unusable question.
        if(a){
          if(['image','reversal'].includes(key)&&!g.selected)g.selected=['yes','near','over','unknown'].includes(a.selected)?a.selected:'unknown';
          if(['meaning','compare'].includes(key))g.compareSeen=true;
          if(key==='application'){g.part=1;g.compareSeen=true;g.selected=a.selected;}
          if(key==='recall')out.session.revealed=true;
        }
      }
    }
    if(raw.paused && typeof raw.paused==='object')for(const [id,session] of Object.entries(raw.paused)){if(valid.has(id)&&session?.cardId===id){const clean=validate({version:1,cards:out.cards,session},ids).session;if(clean&&!clean.complete)out.paused[id]=clean;}}
    // Preserve the old sessions verbatim in their own fields. New courses use a
    // separate versioned branch inside the existing backup/storage envelope.
    if(window.TarotAcademy)out.academy=window.TarotAcademy.validate(raw.academy);
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
    const values=activeSkills.map(k=>r.skills[k]).filter(Boolean);
    if(values.some(s=>s.grade<3))return '待巩固';
    if((r.skills.application?.passes||0)>=2 && (r.skills.recall?.passes||0)>=2 && r.skills.application.reps>=2 && r.skills.recall.reps>=2)return '持续巩固';
    if((r.skills.recall?.passes||0)>=1 && (r.skills.meaning?.passes||0)>=1)return '已回访';
    return '初步理解';
  }
  function makeStep(key,c,lesson,deck,s) {
    if(s.playVersion>=4)return window.TarotGuided.makeStep(key,c,lesson,deck,s);
    const topic={love:'感情',career:'事业',study:'学业'}[s.topic];
    const context=c.contexts[s.topic];
    const visual=s.playVersion===2||s.playVersion===3,variant=s.variant||0;
    const near=deck[lesson.compareId];
    const neighbors=Object.values(deck).filter(x=>x.id!==c.id).sort((a,b)=>Number(b.suit===c.suit)-Number(a.suit===c.suit));
    const alternatives=[near,...neighbors.filter(x=>x.id!==near.id)].slice(0,3);
    if(key==='image'&&visual&&variant!==1)return {kind:'picture',title:variant===2?'让画面和动作对上号':'在牌图里找到它',prompt:variant===2?c.observation:lesson.anchor,correct:'yes',options:[{id:'yes',text:c.name,card:c.id},...alternatives.slice(0,2).map(x=>({id:x.id,text:x.name,card:x.id}))],explanation:lesson.why};
    if(key==='image')return {title:'看见什么，才这样理解？',prompt:lesson.anchor,correct:'yes',options:[{id:'yes',text:c.observation},...alternatives.slice(0,2).map(x=>({id:x.id,text:x.observation}))],explanation:lesson.why};
    if(key==='meaning'&&s.playVersion===3)return {kind:'link',title:'把画面和含义连起来',prompt:'先选你看见的，再选它支持的含义。两端都可以改，想好后一起核对。',correct:'yes',options:[{id:'yes',text:c.core},...lesson.distractors.map((text,i)=>({id:'d'+i,text}))],evidence:[{id:'yes',text:c.observation},...alternatives.slice(0,2).map(x=>({id:x.id,text:x.observation}))],explanation:lesson.why};
    if(key==='meaning')return {title:'这些说法很接近，哪句更贴合？',prompt:'结合画面动作，选出这张牌的核心主题。',correct:'yes',options:[{id:'yes',text:c.core},...lesson.distractors.map((text,i)=>({id:'d'+i,text}))],explanation:lesson.why};
    if(key==='compare'){
      const family=visual&&variant>0&&c.id[0]!=='m'?Object.values(deck).find(x=>x.id!==c.id&&x.id.slice(1)===c.id.slice(1)):null;
      const other=family||near;
      return {kind:s.playVersion===3?'match':'picture',pairs:[{id:c.id,text:c.core},{id:other.id,text:other.core}],title:s.playVersion===3?'为两张牌找回各自的含义':family?'同一个数字或角色，画面有何不同？':'两张都像，差别在哪里？',prompt:c.core,correct:c.id,options:[{id:c.id,text:c.name,card:c.id},{id:other.id,text:other.name,card:other.id}],explanation:family?c.observation+' '+lesson.why+' '+other.observation:lesson.distinction};
    }
    if(key==='application'&&visual&&variant!==1)return {kind:'place',title:'把这句解读放回牌阵',prompt:c.questions[s.topic],statement:context[s.position],context:topic,position:'现状 · 阻碍 · 建议',correct:s.position,options:[{id:'state',text:'现状位'},{id:'tension',text:'阻碍位'},{id:'advice',text:'建议位'}],explanation:{state:'现状位描述目前的状态；这里先观察发生了什么，不直接给行动指令。',tension:'阻碍位指出让事情卡住的表达方式；它与现状描述和行动建议承担不同任务。',advice:'建议位回应可以怎样行动；它不把某种状态当成确定会发生的结果。'}[s.position]};
    if(key==='application')return {title:'同一张牌，换一个位置。',prompt:c.questions[s.topic],context:topic,position:{state:'现状位',tension:'阻碍位',advice:'建议位'}[s.position],correct:s.position,options:['state','tension','advice'].map(id=>({id,text:context[id]})),explanation:{state:'现状位描述目前的状态；这里先观察发生了什么，不直接给行动指令。',tension:'阻碍位指出让事情卡住的表达方式；它与现状描述和行动建议承担不同任务。',advice:'建议位回应可以怎样行动；它不把某种状态当成确定会发生的结果。'}[s.position]};
    if(key==='reversal')return {title:'逆位时，先检查什么？',prompt:'按这张牌的核心主题，哪条逆位检查线索最贴合？',correct:'yes',options:[{id:'yes',text:c.reversed},...alternatives.map(x=>({id:x.id,text:x.reversed}))],explanation:'逆位可能表现为受阻、过度或内化。这里是在辨认本课程的检查线索，不是只凭逆位断定现实结果。'};
    return null;
  }
  function create(bridge) {
    const {esc,img,icon,go,toast,now,cardMap:deck,get,set}=bridge;
    const lessons=Object.fromEntries(window.TAROT_CURRICULUM.cards.map(c=>[c.id,c]));
    // Shuffle recommendations once per application visit. A saved lesson always
    // resumes its own card; a new-card request never silently becomes a review.
    const order=Object.keys(deck);
    const exploreOrder=[...order];
    for(let i=exploreOrder.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[exploreOrder[i],exploreOrder[j]]=[exploreOrder[j],exploreOrder[i]];}
    const record=id=>get().cards[id];
    const current=()=>get().session;
    const active=()=>current()&&!current().complete;
    function due(){return order.filter(id=>record(id)?.rounds>0&&activeSkills.some(k=>record(id).skills[k]?.due<=now())).sort((a,b)=>Math.min(...activeSkills.map(k=>record(a).skills[k]?.due??Infinity))-Math.min(...activeSkills.map(k=>record(b).skills[k]?.due??Infinity)));}
    function unlearned(){return exploreOrder.filter(id=>!record(id));}
    function recommendation(exclude){return unlearned().find(id=>id!==exclude)||null;}
    function newCard(){const id=recommendation();if(id)start(id);else{toast('所有牌都已经开始学习，可以自选继续或回访。');go('library');}}
    function review(){const id=due()[0];if(id)start(id);else{toast('暂时没有到期复习，可以先探索新牌。');go('library');}}
    function start(id,force=false){
      familyFocus=null;previewPosition=null;
      const data=get();
      if(!id && active() && !force){go('journey');return;}
      id=id||recommendation(force?current()?.cardId:null);
      if(!lessons[id]){go('library');return;}
      if(active()&&current().cardId===id&&!force){go('journey');return;}
      data.paused ||= {};
      if(active() && current().cardId!==id)data.paused[current().cardId]=structuredClone(current());
      if(data.paused[id]&&!force){data.session=data.paused[id];delete data.paused[id];set(data);go('journey');return;}
      delete data.paused[id];
      const r=record(id),review=!!r?.rounds;
      const weak=activeSkills.filter(k=>k!=='recall').sort((a,b)=>Number((r?.skills[b]?.grade??4)<3)-Number((r?.skills[a]?.grade??4)<3)||(r?.skills[a]?.due||0)-(r?.skills[b]?.due||0));
      const steps=review?['recall',...weak.slice(0,3)]:['intro','image','meaning','application','reversal','recall'];
      data.cards[id] ||= {introducedAt:now(),lastAt:now(),rounds:0,skills:{}};
      data.session={cardId:id,seed:Math.floor(Math.random()*999999999)+1,playVersion:5,inspected:false,variant:(r?.rounds||0)%3,mode:review?'review':'new',topic:['career','love','study'][Math.floor(Math.random()*3)],position:['advice','tension','state'][Math.floor((r?.rounds||0)/3)%3],steps,index:0,startedAt:now(),answers:{},revealed:false,hint:false,complete:false,guided:window.TarotGuided.blank(steps[0])};
      set(data);go('journey');
    }
    function ordered(options,s){return options.map((o,i)=>({o,n:Math.sin(s.seed*(i+1)+s.index*101)*10000})).sort((a,b)=>a.n-b.n).map(x=>x.o);}
    function refresh(focusAction){
      const shell=document.querySelector('.journey-shell');
      if(!shell){go('journey');return;}
      const y=window.scrollY;
      shell.outerHTML=render();
      if(current()?.playVersion===3)document.querySelector('.journey-shell')?.classList.add('is-updating');
      window.scrollTo(0,y);
      if(focusAction)document.querySelector(focusAction)?.focus({preventScroll:true});
    }
    function saveAnswer(selected,grade,correct){
      const d=get(),s=d.session,key=s.steps[s.index];if(s.answers[key])return;
      s.answers[key]={selected,grade,correct,hint:!!s.hint};
      const r=d.cards[s.cardId];r.skills[key]=rate(r.skills[key],grade,now());r.lastAt=now();set(d);refresh();
      requestAnimationFrame(()=>document.querySelector('.journey-feedback')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'}));
    }
    function next(){
      const d=get(),s=d.session;if(!s||s.complete)return;
      if(s.steps[s.index]==='intro'&&s.playVersion>=3&&!s.inspected)return;
      if(s.steps[s.index]!=='intro'&&!s.answers[s.steps[s.index]])return;
      if(s.playVersion>=4&&s.guided?.note){const r=d.cards[s.cardId];r.reflections||={};r.reflections[s.steps[s.index]]=s.guided.note;}
      s.index++;s.revealed=false;s.hint=false;delete s.activity;previewPosition=null;familyFocus=null;
      if(s.playVersion>=4)s.guided=window.TarotGuided.blank(s.steps[s.index]);
      if(s.index===s.steps.length){s.complete=true;d.cards[s.cardId].rounds++;d.cards[s.cardId].lastAt=now();}
      set(d);go('journey');
    }
    function progress(id){const r=record(id);return `<div class="memory-state"><span class="memory-level">${esc(level(r))}</span>${r?`<span>${activeSkills.filter(k=>(r.skills[k]?.grade||0)>=3).length} / 5 <span>本轮有支持</span></span>`:''}</div>`;}
    function dashboard(){const rs=Object.values(get().cards),started=rs.length,finished=rs.filter(r=>r.rounds).length,revisited=rs.filter(r=>Object.values(r.skills).some(x=>x.passes>0)).length;return `<section class="journey-dashboard"><div class="sectionhead"><h2>我的记忆足迹</h2><span class="tiny muted">${finished} / 78 <span>完成初学</span></span></div><div class="memory-counts"><div><strong>${started}</strong><span>接触过</span></div><div><strong>${revisited}</strong><span>隔天回访过</span></div><div><strong>${due().length}</strong><span>可以复习</span></div></div><p class="tiny muted">看过、自评和单次答对分别记录；隔天回访才检验是否还能想起。</p>${started?`<div class="memory-log">${order.filter(id=>record(id)).map(id=>`<button data-journey="start" data-id="${id}">${img(id)}<span><strong>${esc(deck[id].name)}</strong>${progress(id)}</span>${icon('arrow')}</button>`).join('')}</div>`:'<p class="empty">从一张牌开始，进步会留在这里。</p>'}</section>`;}
    function hero(){const id=active()?current().cardId:recommendation(),c=deck[id];if(!c)return `<section class="journey-recommend"><div><span class="eyebrow">每张都有自己的进度</span><h2>78 张牌，继续探索</h2><p>所有牌都已经开始学习，可以自选继续或回访。</p>${due().length?'<button class="primary" data-journey="review">回访到期的牌</button>':''}</div></section>`;return `<section class="journey-recommend"><div><span class="eyebrow">${active()?'接着上次':'发现一张未学过的牌'}</span><h2>${esc(c.name)}</h2><p>${active()?'你的作答已经保存，从停下的地方继续。':'这是一张你尚未开始的牌；也可以直接从下面自选。'}</p><button class="primary" data-journey="continue">${active()?'继续学习':'开始学这张'} ${icon('arrow')}</button>${active()?'<button class="linkbtn" data-journey="new">今天想学一张新的</button>':''}</div><button class="journey-hero-image" data-action="card" data-id="${id}" aria-label="查看牌的介绍">${img(id)}</button></section>`;}
    let familyFocus=null,previewPosition=null;
    const roleNames={state:'现状位',tension:'阻碍位',advice:'建议位'};
    const roleTasks={state:'正在发生什么',tension:'什么让事情卡住',advice:'可以怎样行动'};
    function familyCards(c){
      return c.id[0]==='m'?[c,deck[lessons[c.id].compareId]]:
        ['w','c','s','p'].map(prefix=>deck[prefix+c.id.slice(1)]);
    }
    function familyPanel(c){
      const family=familyCards(c),focus=family.find(x=>x.id===familyFocus)||c;
      return `<section class="journey-family"><div class="sectionhead"><h2>${c.id[0]==='m'?'把相近的画面放在一起':'把同一个数字或角色放在一起'}</h2></div><p class="tiny muted">点一张，看看它的元素与动作怎样改变含义。</p><div class="journey-family-cards">${family.map(x=>`<button data-journey="family" data-id="${x.id}" aria-pressed="${focus.id===x.id}">${img(x.id)}<span>${esc(x.name)}</span><small>${esc(x.element==='—'?'人生主题':x.element)}</small></button>`).join('')}</div><div class="journey-family-note" role="status"><strong>${esc(focus.name)} · ${esc(focus.element==='—'?'人生主题':focus.element)}</strong><p>${esc(lessons[focus.id].why)}</p></div><p class="tiny muted">共同结构帮助联想，具体含义仍由各自的画面决定。</p></section>`;
    }
    function board(c,s,step,answer){
      const place=step.kind==='place',selected=previewPosition||(answer?(place&&answer.selected!=='unknown'?answer.selected:s.position):place?null:s.position);
      return `<div class="journey-board-wrap"><p class="tiny"><strong>基础三张牌阵</strong> · <span>现状 · 阻碍 · 建议</span></p><div class="journey-board ${answer?'has-answer':''}">${['state','tension','advice'].map((role,i)=>{const occupied=role===selected,correct=answer&&role===step.correct;return `<button class="journey-slot ${occupied?'occupied':''} ${correct?'correct':''} ${answer&&!answer.correct&&role===answer.selected?'incorrect':''}" ${place&&!answer?`data-journey="answer" data-value="${role}"`:`data-journey="position" data-value="${role}"`} ${!place&&!answer?'disabled':''} aria-label="${roleNames[role]}" aria-pressed="${occupied}"><span class="journey-slot-card">${occupied?img(c.id):`<span class="journey-slot-number">${i+1}</span>`}</span><strong>${roleNames[role]}</strong><small>${roleTasks[role]}</small>${correct?'<b class="answer-marker">✓</b>':''}</button>`;}).join('')}</div>${answer?`<div class="journey-placement-note" role="status"><strong>${roleNames[selected]||roleNames[s.position]}</strong><p>${esc(c.contexts[s.topic][selected]||c.contexts[s.topic][s.position])}</p><small>答题已记录。现在点其他位置，看看同牌怎样换一种表达。</small></div>`:''}</div>`;
    }
    // A small guide has one job at a time. It never advances a lesson for the learner.
    function guide(key,s,answer){
      const hints={intro:'先看一眼画面，找一个让你记得住的动作。',image:'别急着认牌名。把这句话和画面里的动作对上。',meaning:'让依据和含义一起成立，比猜中一个词更有用。',recall:'答案先收起来。在心里说出来，就算一次真正的尝试。',compare:'这两张很接近。把两句含义各自交还给它们。',application:'牌还在眼前。点一个位置，看看它在这里承担什么任务。',reversal:'把逆位想成核心主题的另一种表达，再回到画面核对。'};
      return `<aside class="journey-guide"><span class="journey-guide-spark" aria-hidden="true">✦</span><p>${answer?'这一笔已经记下。看清差别，再由你决定继续。':hints[key]||''}</p></aside>`;
    }
    function introduction(c,lesson,s,cardImage){
      return `<div class="journey-discovery"><span class="journey-discovery-ring" aria-hidden="true"></span>${cardImage}<span class="journey-discovery-caption">${esc(c.name)}</span></div><div class="journey-copy"><span class="eyebrow">和这张牌第一次见面</span><h1>${s.inspected?esc(lesson.anchor):'先看，不急着背。'}</h1>${!s.inspected?'<p>留意人物在做什么、目光朝向哪里、什么东西最突出。点牌可以放大，准备好了再打开线索。</p><button class="primary wide" data-journey="inspect">看看画面线索</button><p class="tiny muted">这里没有倒计时，按自己的节奏看。</p>':`<div class="journey-observation"><span class="eyebrow">我看见</span><p>${esc(c.observation)}</p></div><div class="journey-note"><strong>为什么是这个含义？</strong><p>${esc(lesson.why)}</p></div><button class="primary wide" data-journey="next">记住这个画面，试一试 ${icon('arrow')}</button><details class="journey-scaffold"><summary>元素、数字与这张牌</summary>${scaffold(c)}</details>${familyPanel(c)}`}</div>`;
    }
    function construction(c,lesson,s,step,answer,cardImage){
      const a=s.activity?.key===s.steps[s.index]?s.activity:{pairs:{}},locked=!!answer;
      const pick=(o,kind,chosen)=>`<button class="journey-piece ${chosen===o.id?'is-picked':''}" data-journey="${kind}" data-value="${o.id}" aria-pressed="${chosen===o.id}" ${locked?'disabled':''}><span>${esc(o.text)}</span>${chosen===o.id?'<b aria-hidden="true">✓</b>':''}</button>`;
      let work='';
      if(step.kind==='link'){
        const evidence=step.evidence.find(x=>x.id===a.evidence),meaning=step.options.find(x=>x.id===a.meaning);
        work=`<div class="journey-link-scene">${cardImage}<div><span class="eyebrow">让两端彼此支持</span><strong>${esc(c.name)}</strong><p>画面证据 → 核心含义</p></div></div><div class="journey-link-work"><section class="journey-link-half"><h2><span>1</span> <span>我看见什么</span></h2><details ${!evidence?'open':''}><summary>${evidence?esc(evidence.text):'选择一条画面证据'}${evidence&&!locked?'<small>点此更换</small>':''}</summary><div class="journey-pieces">${ordered(step.evidence,s).map(o=>pick(o,'pick-evidence',a.evidence)).join('')}</div></details></section><span class="journey-link-thread ${evidence?'connected':''}" aria-hidden="true">↓</span><section class="journey-link-half ${evidence?'':'is-waiting'}"><h2><span>2</span> <span>它支持什么含义</span></h2>${evidence?`<details ${!meaning?'open':''}><summary>${meaning?esc(meaning.text):'选择它最支持的含义'}${meaning&&!locked?'<small>点此更换</small>':''}</summary><div class="journey-pieces">${ordered(step.options,s).map(o=>pick(o,'pick-meaning',a.meaning)).join('')}</div></details>`:'<p class="tiny muted">先选好画面这一端，再连向含义。</p>'}</section></div>`;
      }else{
        work=`<p class="tiny muted">先点一句含义，再点它属于的牌。点已放好的含义可以收回。</p><div class="journey-match-cards">${step.options.map(o=>{const paired=step.pairs.find(x=>x.id===a.pairs?.[o.id]);return `<button class="journey-match-target ${paired?'is-filled':''} ${a.holding?'is-ready':''} ${locked?(a.pairs?.[o.id]===o.id?'correct':'incorrect'):''}" data-journey="match-card" data-value="${o.id}" ${locked?'disabled':''} aria-label="${esc(o.text)}"><span class="journey-match-image">${img(o.card)}</span><strong>${esc(o.text)}</strong><span class="journey-match-label">${paired?esc(paired.text):'把含义放到这里'}</span></button>`;}).join('')}</div><div class="journey-match-bank"><span class="eyebrow">待归位的含义</span>${ordered(step.pairs,s).filter(o=>!Object.values(a.pairs||{}).includes(o.id)).map(o=>pick(o,'hold-meaning',a.holding)).join('')}${Object.keys(a.pairs||{}).length===2?'<p class="tiny muted">两句已归位。还可以点牌收回，确认后再核对。</p>':''}<p class="journey-action-tip" role="status">${a.holding?'已拿起这句含义，再点它属于的牌。':'点一句，开始配对。'}</p></div>`;
      }
      const ready=step.kind==='link'?a.evidence&&a.meaning:Object.keys(a.pairs||{}).length===2;
      let feedback='';
      if(locked){
        const success=typeof a.result==='boolean'?a.result:answer.correct;
        const title=typeof a.result==='boolean'?(success?'✓ 这次连对了':'✕ 这次还没连对'):answer.selected==='unknown'?'这题还不确定':answer.correct?'✓ 答对了':'✕ 答错了';
        const evidenceOK=a.evidence==='yes',meaningOK=a.meaning==='yes';
        feedback=`<section class="journey-feedback ${success?'correct':'incorrect'}" role="status"><strong>${title}</strong>${typeof a.result==='boolean'?'<p class="tiny muted">这是看过反馈后的巩固，保留第一次的记录，不提前延长复习间隔。</p>':''}${step.kind==='link'?`<div class="journey-link-result"><p><b>${evidenceOK?'✓':'✕'} <span>画面证据</span></b><span>${esc(c.observation)}</span></p><p><b>${meaningOK?'✓':'✕'} <span>核心含义</span></b><span>${esc(c.core)}</span></p></div>${!evidenceOK&&meaningOK?'<p>含义选对了，但所选画面不支持它。下次让两个环节一起成立。</p>':''}${evidenceOK&&!meaningOK?'<p>你找到了画面，但含义还差了一步。留意动作的方向与人物的处境。</p>':''}`:`<div class="journey-pair-result">${step.pairs.map(o=>`<p><strong>${esc(deck[o.id].name)}</strong><span>${esc(o.text)}</span></p>`).join('')}</div>`}<p>${esc(step.explanation)}</p>${!success?`<p>${esc(lesson.distinction)}</p><button class="secondary wide" data-journey="retry-link">重连一次，记住这个区别</button>`:''}<button class="primary wide" data-journey="next">继续下一步 ${icon('arrow')}</button></section>`;
      }else{
        feedback=`<div class="journey-construct-actions"><button class="primary wide" data-journey="check-link" ${ready?'':'disabled'}>一起核对 ${icon('arrow')}</button><div class="journey-help"><button class="linkbtn" data-journey="hint">看看线索</button><button class="linkbtn" data-journey="unknown">还不确定</button></div>${s.hint?`<div class="journey-note">${esc(lesson.why)}</div>`:''}</div>`;
      }
      return `<div class="journey-copy journey-construction" data-construction="${step.kind}"><span class="eyebrow">${labels[s.steps[s.index]]}</span><h1>${esc(step.title)}</h1>${step.kind==='link'?`<p class="journey-prompt">${esc(step.prompt)}</p>`:''}${work}${feedback}</div>`;
    }
    function handleConstruction(action,el,d,s){
      const key=s.steps[s.index];if(s.playVersion!==3||!['meaning','compare'].includes(key))return;
      const step=makeStep(key,deck[s.cardId],lessons[s.cardId],deck,s);
      const a=s.activity?.key===key?s.activity:(s.activity={key,pairs:{}});
      if(action==='retry-link'){
        if(!s.answers[key])return;
        s.activity={key,pairs:{},repair:true};set(d);refresh();return;
      }
      if(s.answers[key]&&!a.repair)return;
      const value=el.dataset.value;
      if(action==='pick-evidence' && step.kind==='link' && step.evidence.some(o=>o.id===value))a.evidence=value;
      else if(action==='pick-meaning' && step.kind==='link' && a.evidence && step.options.some(o=>o.id===value))a.meaning=value;
      else if(action==='hold-meaning' && step.kind==='match' && step.pairs.some(o=>o.id===value)&&!Object.values(a.pairs).includes(value))a.holding=a.holding===value?null:value;
      else if(action==='match-card' && step.kind==='match' && step.options.some(o=>o.id===value)){
        if(a.holding){a.pairs[value]=a.holding;a.holding=null;}
        else if(a.pairs[value])delete a.pairs[value];
      }else if(action==='check-link'){
        const ready=step.kind==='link'?a.evidence&&a.meaning:step.options.every(o=>a.pairs[o.id]);if(!ready)return;
        const correct=step.kind==='link'?a.evidence==='yes'&&a.meaning==='yes':step.options.every(o=>a.pairs[o.id]===o.id);
        if(a.repair){a.repair=false;a.result=correct;set(d);refresh();return;}
        const selected=step.kind==='link'?a.meaning:correct?s.cardId:'mismatch';
        saveAnswer(selected,correct&&!s.hint?4:2,correct);return;
      }else return;
      set(d);refresh();
    }
    function render(){
      const s=current();if(!s)return '';
      const c=deck[s.cardId],lesson=lessons[s.cardId],key=s.steps[s.index],answer=s.activity?.repair?null:s.answers[key];
      const head=`<header class="journey-top"><button class="iconbtn" data-action="nav" data-page="home" aria-label="暂停学习">${icon('close')}</button><div><span>${esc(c.name)}</span><div class="journey-progress" role="progressbar" aria-label="本张学习进度" aria-valuenow="${s.index}" aria-valuemin="0" aria-valuemax="${s.steps.length}"><i style="width:${s.index/s.steps.length*100}%"></i></div></div><span class="tiny">${Math.min(s.index+1,s.steps.length)} / ${s.steps.length}</span></header>${!(s.playVersion>=4)&&!s.complete?'<div class="journey-upgrade"><span>这张牌有了逐步理解的新课程，原有学习记录会保留。</span><button class="secondary" data-journey="upgrade">切换新课</button></div>':''}`;
      if(s.complete){
        const r=record(c.id),weak=activeSkills.filter(k=>r.skills[k]?.grade<3),dueAt=Math.min(...activeSkills.map(k=>r.skills[k]?.due??Infinity)),finished=Object.values(get().cards).filter(x=>x.rounds>0).length;
        return `<main class="journey-shell">${head}<section class="journey-complete"><div class="journey-complete-image">${img(c.id)}</div><span class="eyebrow">${weak.length?'把差别带走，下次再遇见':'又建立了一点自己的理解'}</span><h1>${esc(c.name)}</h1><p class="memory-anchor">${esc(window.TarotGuided.cards()[c.id]?.plain?.anchor||lesson.anchor)}</p>${progress(c.id)}${r.reflections?.recall?`<div class="guided-coach"><strong>我的记忆句</strong><p data-i18n-ignore>${esc(r.reflections.recall)}</p></div>`:''}<div class="journey-collected"><span aria-hidden="true">✦</span><strong>${finished} / 78</strong><span>已经留下学习足迹</span></div><div class="journey-skill-stamps">${s.steps.filter(k=>k!=='intro').map(k=>`<span class="${s.answers[k]?.grade>=3?'supported':'pending'}">${s.answers[k]?.grade>=3?'✓':'↺'} ${labels[k]}</span>`).join('')}</div><p>${weak.length?'下次会重点回访这些地方：':'这次表现已记录。隔一段时间，换个问法再检验。'}</p>${weak.length?`<div class="tags">${weak.map(k=>`<span class="tag">${labels[k]}</span>`).join('')}</div>`:''}<p class="tiny muted"><span>下次复习</span> · ${new Date(dueAt).toLocaleDateString(window.TAROT_I18N?.locale==='en'?'en':'zh-CN',{month:'short',day:'numeric'})}</p><div class="journey-actions"><button class="primary wide" data-journey="next-card">继续发现一张新牌 ${icon('arrow')}</button><button class="secondary wide" data-action="nav" data-page="library">自己选一张牌</button>${due().length?'<button class="secondary wide" data-journey="review">回访到期的牌</button>':''}<button class="linkbtn" data-journey="repeat">再巩固这张牌</button><button class="linkbtn" data-action="nav" data-page="home">今天先到这里</button></div></section></main>`;
      }
      if(s.playVersion>=4)return window.TarotGuided.render(c,lesson,deck,s,{esc,img,icon,ordered,head,scaffold});
      const cardImage=`<button class="journey-image ${key==='reversal'?'is-reversed':''}" data-action="zoom" data-id="${c.id}" aria-label="放大牌面">${img(c.id)}</button>`;
      let body='',wide=false;
      if(key==='intro'&&s.playVersion===3){
        body=introduction(c,lesson,s,cardImage);
      }
      else if(key==='intro')body=`${cardImage}<div class="journey-copy"><span class="eyebrow">先从画面认识它</span><h1>${esc(lesson.anchor)}</h1><p>${esc(c.observation)}</p><div class="journey-note"><strong>为什么是这个含义？</strong><p>${esc(lesson.why)}</p></div><button class="primary wide" data-journey="next">记住这个画面，试一试 ${icon('arrow')}</button><p class="tiny muted">接下来会从不同角度遇见它。随时暂停，回来接着学。</p>${familyPanel(c)}<details class="journey-scaffold"><summary>元素、数字与这张牌</summary>${scaffold(c)}</details></div>`;
      else if(key==='recall')body=`${cardImage}<div class="journey-copy"><span class="eyebrow">先在脑中想，不用打字</span><h1>合上答案，还能想起什么？</h1><p>回忆一个关键动作，以及它怎样形成牌义。</p>${!s.revealed?'<button class="primary wide" data-journey="reveal">我想好了，核对一下</button>':`<div class="journey-note journey-revealed"><strong>${esc(lesson.anchor)}</strong><p>${esc(lesson.why)}</p></div>${answer?`<div class="journey-feedback" role="status"><strong>回忆自评已记录</strong><p>这是你的自我判断，后面的应用会再帮助核对。</p><button class="primary wide" data-journey="next">继续 ${icon('arrow')}</button></div>`:`<p>刚才的回忆接近哪一种？</p><div class="recall-ratings">${[['2','没想起来'],['3','只想到一点'],['4','基本想起'],['5','清楚想起']].map(([v,t])=>`<button class="secondary" data-journey="rate" data-value="${v}">${t}</button>`).join('')}</div>`}`}</div>`;
      else if(s.playVersion===3 && ['meaning','compare'].includes(key)){
        wide=true;body=construction(c,lesson,s,makeStep(key,c,lesson,deck,s),answer,cardImage);
      }
      else {
        const step=makeStep(key,c,lesson,deck,s),opts=ordered(step.options,s),isApplication=key==='application'&&(s.playVersion===2||s.playVersion===3);
        wide=step.kind==='picture'||isApplication;
        const choices=step.kind==='place'?`<div class="journey-statement">${cardImage}<blockquote>${esc(step.statement)}</blockquote></div><p class="tiny muted">点一个位置，把牌放进去；选完会明确核对。</p>${board(c,s,step,answer)}`:`${isApplication?board(c,s,step,answer):''}<div class="journey-options ${step.kind==='picture'?'picture-options':''} ${key==='compare'?'compare-options':''}">${opts.map((o,i)=>`<button class="journey-option ${answer?(o.id===step.correct?'correct':answer.selected===o.id?'incorrect':''):''}" data-journey="answer" data-value="${o.id}" ${answer?'disabled':''}>${o.card?img(o.card):`<span class="letter">${String.fromCharCode(65+i)}</span>`}<span>${esc(o.card&&key==='image'&&!answer?'选这张牌':o.text)}</span>${answer&&o.id===step.correct?'<b class="answer-marker">✓</b>':''}${answer&&answer.selected===o.id&&!answer.correct?'<b class="answer-marker">✕</b>':''}</button>`).join('')}</div>`;
        const feedback=!answer?`<div class="journey-help"><button class="linkbtn" data-journey="hint">看看线索</button><button class="linkbtn" data-journey="unknown">还不确定</button></div>${s.hint?`<div class="journey-note">${esc(lesson.why)}</div>`:''}`:`<section class="journey-feedback ${answer.correct?'correct':'incorrect'}" role="status"><strong>${answer.selected==='unknown'?'这题还不确定':answer.correct?'✓ 答对了':'✕ 答错了'}</strong><p><b>本题正确答案：</b>${esc(step.options.find(o=>o.id===step.correct).text)}</p><p>${esc(step.explanation)}</p>${s.playVersion===3&&!answer.correct&&key==='image'&&deck[answer.selected]?`<div class="journey-pair-result"><p><strong>你选中的画面</strong><span>${esc(deck[answer.selected].observation)}</span></p><p><strong>这张牌需要找的线索</strong><span>${esc(c.observation)}</span></p></div>`:''}${!answer.correct&&key==='meaning'?`<p>${esc(lesson.distinction)}</p>`:''}<button class="primary wide" data-journey="next">${s.index===s.steps.length-1?'收好这一张的收获':'继续下一步'} ${icon('arrow')}</button></section>`;
        body=`${wide?'':cardImage}<div class="journey-copy"><span class="eyebrow">${labels[key]}${step.context?' · '+step.context+(step.kind==='place'?'':' · '+step.position):''}</span><h1>${esc(step.title)}</h1><p class="journey-prompt">${esc(step.prompt)}</p>${choices}${feedback}</div>`;
      }
      return `<main class="journey-shell ${s.playVersion===3?'journey-playful':''}">${head}${s.playVersion===3?guide(key,s,answer):''}<section class="journey-stage ${wide?'journey-visual':''}" data-learning-game="${key}">${body}</section></main>`;
    }
    function scaffold(c){const rank=Number(c.id.slice(1)),m=c.id[0]==='m';const numberHints=['','起点与潜能','两端、选择与平衡','展开、合作与初步成果','结构、稳定与停驻','扰动、冲突与调整','重新协调与移动','检验、坚持与策略','推进、组织与熟练','接近完成与个人承受','完成、饱和与进入下一轮'];return `<p><strong>${esc(c.suit)} · ${esc(c.element==='—'?'人生主题':c.element)} · ${esc(c.number)}</strong></p><p>${m?'大阿尔卡纳以各自的画面与人生主题为主，不套用小牌数字公式。':rank>10?'宫廷牌可作为行动风格来理解：侍从探索、骑士追求、王后涵养、国王统筹；不限定现实人物的性别或年龄。':esc(numberHints[rank])}</p><p>${esc(lessons[c.id].why)}</p><small>这些是本课程的助记线索。回到牌面核对，不把元素与数字当作万能公式。</small>`;}
    document.addEventListener('click',event=>{
      const el=event.target.closest('[data-journey],[data-guided]');if(!el||el.disabled)return;
      const action=el.dataset.journey||el.dataset.guided;
      if(action==='continue'){start();return;}
      if(action==='new'){newCard();return;}
      if(action==='review'){review();return;}
      if(action==='start'){start(el.dataset.id);return;}
      if(action==='next-card'){newCard();return;}
      if(action==='repeat'){start(current()?.cardId,true);return;}
      if(action==='upgrade'){start(current()?.cardId,true);return;}
      const d=get(),s=d.session;if(!s||s.complete)return;
      if(s.playVersion>=4&&window.TarotGuided.handle(action,el,s,{card:deck[s.cardId],lesson:lessons[s.cardId],deck,persist:()=>set(d),refresh,save:saveAnswer}))return;
      if(action==='next')next();
      else if(action==='inspect'&&s.playVersion===3&&s.steps[s.index]==='intro'){s.inspected=true;set(d);refresh('[data-journey=next]');}
      else if(['pick-evidence','pick-meaning','hold-meaning','match-card','check-link','retry-link'].includes(action)){handleConstruction(action,el,d,s);}
      else if(action==='family'&&s.steps[s.index]==='intro'){familyFocus=el.dataset.id;refresh();}
      else if(action==='position'&&s.steps[s.index]==='application'&&s.answers.application){previewPosition=el.dataset.value;refresh();}
      else if(action==='reveal'){s.revealed=true;set(d);refresh();}
      else if(action==='hint'){s.hint=true;set(d);refresh();}
      else if(action==='rate'&&s.steps[s.index]==='recall'&&s.revealed){const q=Number(el.dataset.value);if([2,3,4,5].includes(q))saveAnswer(String(q),q,q>=3);}
      else if(['answer','unknown'].includes(action)){
        const key=s.steps[s.index],step=makeStep(key,deck[s.cardId],lessons[s.cardId],deck,s);if(!step)return;
        if(s.playVersion===3&&['meaning','compare'].includes(key)&&action==='answer')return;
        if(action==='unknown'&&s.activity?.repair){s.activity.repair=false;s.activity.result=false;set(d);refresh();return;}
        const selected=action==='unknown'?'unknown':el.dataset.value;if(selected!=='unknown'&&!step.options.some(x=>x.id===selected))return;
        const correct=selected===step.correct;saveAnswer(selected,correct&&!s.hint?4:2,correct);
      }
    });
    document.addEventListener('input',event=>{if(!event.target.matches('[data-guided-note]'))return;const d=get(),s=d.session;if(s?.playVersion>=4&&!s.complete){s.guided||=window.TarotGuided.blank(s.steps[s.index]);s.guided.note=event.target.value.slice(0,600);set(d);}});
    return {start,new:newCard,review,unlearned,render,hero,dashboard,progress,scaffold,record,due,active,recommendation,level:id=>level(record(id)),lesson:id=>lessons[id]};
  }
  window.TarotJourney={blank,validate,rate,level,makeStep,skills,labels,create};
})();
