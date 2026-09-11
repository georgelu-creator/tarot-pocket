/* Offline, click-first learning units. Kept separate from the original quick drills. */
window.createTarotLearning = function (bridge) {
  'use strict';
  const {esc, img, icon, shuffle, go, now, toast, cardMap} = bridge;
  const content = window.TAROT_LEARNING;
  const units = Object.fromEntries(content.units.map(u => [u.id, u]));
  const KEY = 'tarot-learning-units-v2';
  const DAY = 86400000;
  const blank = () => ({version: 2, active: null, sessions: {}, history: []});
  let data = blank();
  let storageOK = true;
  const optionIDs = step => (step.options || []).map(o => o.id);
  const route = session => session.stepIds.map(id => units[session.unitId].steps.find(s => s.id === id));
  const currentSession = () => data.sessions[data.active];
  const stepAt = session => route(session)[session.index];
  const cleanIds = (values, allowed) => Array.isArray(values) ? [...new Set(values.filter(x => allowed.includes(x)))] : [];

  function validate(input) {
    if (!input || input.version !== 2 || !Array.isArray(input.history) || input.history.length > 5000) throw Error('不支持的单元记录');
    const out = blank();
    for (const [id, raw] of Object.entries(input.sessions || {})) {
      if (!units[id] || !raw || typeof raw.runId !== 'string') continue;
      const stepIds = cleanIds(raw.stepIds, units[id].steps.map(s => s.id));
      if (!stepIds.length || !Number.isInteger(raw.index) || raw.index < 0 || raw.index > stepIds.length) continue;
      const s = {unitId:id, runId:raw.runId.slice(0,100), index:raw.index, stepIds, answers:{}, startedAt:Number(raw.startedAt)||now()};
      for (const stepId of stepIds) {
        const step = units[id].steps.find(x => x.id === stepId);
        const a = raw.answers?.[stepId];
        if (!a) continue;
        const ids = optionIDs(step), eids = (step.evidenceOptions || []).map(x=>x.id);
        const order = cleanIds(a.order, ids), evidenceOrder = cleanIds(a.evidenceOrder, eids);
        s.answers[stepId] = {phase:['question','evidence','feedback'].includes(a.phase)?a.phase:'question', selected:ids.includes(a.selected)?a.selected:null, evidence:eids.includes(a.evidence)?a.evidence:null, order:order.length===ids.length?order:shuffle(ids), evidenceOrder:evidenceOrder.length===eids.length?evidenceOrder:shuffle(eids), arranged:cleanIds(a.arranged,ids), hint:!!a.hint, confidence:a.confidence==='sure'?'sure':'unsure', recall:['all','part','none'].includes(a.recall)?a.recall:null};
      }
      out.sessions[id]=s;
    }
    out.active=out.sessions[input.active]?input.active:null;
    const seen = new Set();
    for (const h of input.history) {
      const step=units[h?.unitId]?.steps.find(s=>s.id===h.stepId);
      if (!step || typeof h.id!=='string' || seen.has(h.id) || !Number.isFinite(h.at)) continue;
      seen.add(h.id);
      out.history.push({id:h.id.slice(0,200),runId:String(h.runId).slice(0,100),unitId:h.unitId,stepId:step.id,dimension:step.dimension||'理解',kind:step.kind,at:h.at,correct:typeof h.correct==='boolean'?h.correct:null,interpretationCorrect:typeof h.interpretationCorrect==='boolean'?h.interpretationCorrect:null,evidenceCorrect:typeof h.evidenceCorrect==='boolean'?h.evidenceCorrect:null,hint:!!h.hint,confidence:h.confidence==='sure'?'sure':'unsure',recall:['all','part','none'].includes(h.recall)?h.recall:null});
    }
    return out;
  }
  try { const raw=localStorage.getItem(KEY); if(raw)data=validate(JSON.parse(raw)); }
  catch(e){storageOK=false;}
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(data));storageOK=true;}catch(e){storageOK=false;toast('单元进度暂时无法保存，可在「我的」导出备份。');}}
  function ensureAnswer(s, step){
    if(!s.answers[step.id])s.answers[step.id]={phase:'question',selected:null,evidence:null,order:shuffle(optionIDs(step)),evidenceOrder:shuffle((step.evidenceOptions||[]).map(o=>o.id)),arranged:[],hint:false,confidence:'unsure',recall:null};
    return s.answers[step.id];
  }
  function concepts(){
    const groups={};
    for(const h of data.history){if(h.kind==='intro')continue;const scope=h.unitId==='return'?(h.stepId==='return-element-number'?'structure':'p04'):h.unitId;(groups[scope+'|'+h.dimension] ||= []).push(h);}
    return Object.entries(groups).map(([key,events])=>{
      const [scope,name]=key.split('|');
      const last=events.at(-1), recent=events.filter(h=>h.runId===last.runId);
      const needs=recent.some(h=>h.correct===false || h.hint || (h.kind==='recall'?h.recall!=='all':h.confidence!=='sure'));
      return {name,scope,events,last,needs,due:last.at+(needs?1:3)*DAY};
    });
  }
  function start(id, restart=false){
    if(!units[id])return;
    const old=data.sessions[id];
    if(!old || old.index===old.stepIds.length || restart){
      let steps=units[id].steps;
      if(id==='return'){
        const targets=concepts().filter(x=>x.needs||x.due<=now()).map(x=>x.name);
        const picked=steps.filter(s=>s.kind==='recall'||targets.includes(s.dimension));
        if(picked.length>=2)steps=picked;
      }
      data.sessions[id]={unitId:id,runId:`unit-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,index:0,stepIds:steps.map(s=>s.id),answers:{},startedAt:now()};
    }
    data.active=id;
    ensureAnswer(currentSession(),stepAt(currentSession()));
    persist();go('learning');
  }
  function redraw(){go('learning');}
  function record(s,step,a){
    const id=`${s.runId}:${step.id}`;
    if(data.history.some(h=>h.id===id))return;
    let correct=null,interpretationCorrect=null,evidenceCorrect=null;
    if(step.kind==='arrange')correct=a.arranged.join('|')===step.correctOrder.join('|');
    else if(['choice','observe','reason'].includes(step.kind))correct=a.selected===step.correct;
    if(step.kind==='reason'){interpretationCorrect=correct;evidenceCorrect=a.evidence===step.evidenceCorrect;correct=correct&&evidenceCorrect;}
    data.history.push({id,runId:s.runId,unitId:s.unitId,stepId:step.id,dimension:step.dimension||'理解',kind:step.kind,at:now(),correct,interpretationCorrect,evidenceCorrect,hint:a.hint,confidence:a.confidence,recall:a.recall});
    if(data.history.length>5000)data.history=data.history.slice(-5000);
    persist();
  }
  function primary(action,label,disabled=false){return `<button class="primary wide" data-learn="${action}" ${disabled?'disabled':''}>${label} ${icon('arrow')}</button>`;}
  function options(step,a,evidence=false){
    const list=evidence?step.evidenceOptions:step.options;
    const selected=evidence?a.evidence:a.selected;
    const order=evidence?a.evidenceOrder:a.order;
    return `<div class="options learn-options" role="group" aria-label="${evidence?'选择支持依据':'选择你的判断'}">${order.map((id,i)=>{
      const o=list.find(x=>x.id===id);
      return `<button class="option ${selected===id?'chosen':''}" data-learn="${evidence?'evidence':'select'}" data-value="${esc(id)}" aria-pressed="${selected===id}"><span class="letter">${step.kind==='observe'?step.hotspotIds.indexOf(id)+1:String.fromCharCode(65+i)}</span><span>${esc(o.text)}</span></button>`;
    }).join('')}</div>`;
  }
  function confidence(a){return `<div class="learn-confidence"><span>这次有多确定？</span><div class="chips"><button class="chip ${a.confidence==='sure'?'active':''}" data-learn="confidence" data-value="sure" aria-pressed="${a.confidence==='sure'}">能说出理由</button><button class="chip ${a.confidence==='unsure'?'active':''}" data-learn="confidence" data-value="unsure" aria-pressed="${a.confidence==='unsure'}">还在推敲</button></div></div>`;}
  function visuals(unit,step,a){
    const ids=step.cardIds?.length?step.cardIds:unit.cardIds;
    if(step.kind==='observe'){
      const spots={hold:{x:48,y:52,label:'抱住星币的手臂'},feet:{x:47,y:82,label:'踩住星币的双脚'},city:{x:79,y:73,label:'远处的城镇'}};
      return `<div class="learn-observe"><div class="hotspot-card">${img('p04')}${step.hotspotIds.map((id,i)=>{const p=spots[id];return `<button class="hotspot ${a.selected===id?'selected':''}" style="left:${p.x}%;top:${p.y}%" data-learn="select" data-value="${id}" aria-label="线索 ${i+1}：${p.label}" aria-pressed="${a.selected===id}">${i+1}</button>`;}).join('')}</div><p class="tiny muted">点图上的标记，或下方的对应文字</p><button class="linkbtn" data-action="zoom" data-id="p04">放大原图，仔细看动作</button></div>`;
    }
    const labels=step.cardPositions||(unit.id==='case'?['现状','阻碍','建议']:[]);
    return `<div class="learn-pictures ${ids.length>1?'multiple':''}">${ids.map((id,i)=>`<figure><button data-action="zoom" data-id="${esc(id)}" aria-label="放大${esc(cardMap[id].name)}">${img(id,step.orientation==='reversed'?'class="reversed-img"':'')}</button><figcaption>${labels.length&&step.kind!=='arrange'?`<span class="learn-slot">${labels[step.cardPositions?i:unit.cardIds.indexOf(id)]}</span>`:''}${esc(cardMap[id].name)}</figcaption></figure>`).join('')}</div>${step.position?`<div class="learn-position"><span>同一张牌，现在位于</span><strong>${esc(step.position)}</strong></div>`:''}`;
  }
  function result(step,a){
    const s=currentSession();
    const h=data.history.find(x=>x.id===`${s.runId}:${step.id}`);
    const good=h?.correct;
    const interpretationCorrect=h?.interpretationCorrect??(a.selected!==null?a.selected===step.correct:good===true?true:null);
    const evidenceCorrect=h?.evidenceCorrect??(a.evidence!==null?a.evidence===step.evidenceCorrect:good===true?true:null);
    const your=step.options?.find(o=>o.id===a.selected);
    const right=step.options?.find(o=>o.id===step.correct);
    const evidence=step.evidenceOptions?.find(o=>o.id===a.evidence);
    return `<div class="learn-feedback ${good?'positive':'revisit'}" role="status"><span class="eyebrow">${good?'✓ 答对了':step.kind==='reason'&&(interpretationCorrect||evidenceCorrect)?'△ 部分答对':'✕ 答错了'}</span><h3>${step.kind==='reason'?(interpretationCorrect?(evidenceCorrect?'解读正确，依据也正确':'解读正确，依据选错了'):(evidenceCorrect?'解读选错了，依据正确':'解读和依据都选错了')):good?'这次判断正确':'这个选择不正确'}</h3>${your?`<p class="${good?'':'verdict-choice'}"><strong>你选的是：</strong>${esc(your.text)}</p><p>${esc(your.why)}</p>`:''}${step.kind==='reason'&&evidence?`<p><strong>你的依据：</strong>${esc(evidence.text)}</p><p>${esc(evidence.why)}</p>`:''}<p class="learn-takeaway">${esc(step.feedback)}</p>${!good&&right?`<p class="verdict-answer"><strong>本题正确答案：</strong>${esc(right.text)}</p>`:''}${step.kind==='reason'&&evidenceCorrect===false?`<p class="verdict-answer"><strong>正确依据：</strong>${esc(step.evidenceOptions.find(o=>o.id===step.evidenceCorrect)?.text)}</p>`:''}${step.kind==='arrange'?`<p>从左到右：${step.correctOrder.map(id=>esc(step.options.find(o=>o.id===id).text)).join(' · ')}</p>`:''}${a.hint?'<small>这次使用提示或回看，按辅助完成记录。</small>':''}</div>${step.options?`<details class="learn-other"><summary>其他选项差在哪里？</summary>${a.order.map(id=>{const o=step.options.find(x=>x.id===id);return `<p><strong>${esc(o.text)}</strong><br>${esc(o.why)}</p>`;}).join('')}</details>`:''}${primary('next','继续下一小步')}`;
  }
  function interaction(step,a){
    if(step.kind==='intro')return `<p class="learn-body">${esc(step.body||step.feedback||'')}</p>${step.points?`<ul class="learn-points">${step.points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>`:''}${primary('next','带着这个线索试试看')}`;
    if(step.kind==='recall'){
      if(a.phase==='question')return `<div class="recall-wait"><span aria-hidden="true">…</span><p>先在脑中想一想。不用打字，也不用说出来。</p><small>按照这一小步的问题回忆，不必背原句。</small></div>${primary('reveal','我想好了，看看关键点')}<button class="linkbtn" data-learn="recall-forgot">这次没想起来，带我回顾</button>`;
      return `<div class="learn-feedback"><span class="eyebrow">对照你刚才想到的</span><ul class="learn-points">${step.points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul><p>${esc(step.feedback||'表达不必一字不差，重点是核心意思。')}</p></div><p class="learn-question-label">揭晓之前，你想起了多少？</p><div class="recall-ratings">${[['all','核心想到了'],['part','想到一部分'],['none','没想起来']].map(([id,t])=>`<button class="secondary ${a.recall===id?'chosen':''}" data-learn="rate" data-value="${id}" aria-pressed="${a.recall===id}">${t}</button>`).join('')}</div><p class="tiny muted">这里只记录你的自评，不把它当成客观测验成绩。${data.history.some(h=>h.id===`${currentSession().runId}:${step.id}`)?'这次自评已经收好，回看时保留首次记录。':''}</p>${primary('next','记下这次回忆',!a.recall)}`;
    }
    if(a.phase==='feedback')return result(step,a);
    if(step.kind==='arrange')return `<div class="arrange-slots" aria-label="从左到右的牌位">${[0,1,2].map(i=>`<button class="arrange-slot" data-learn="unassign" data-index="${i}" ${!a.arranged[i]?'disabled':''}><small>第 ${i+1} 个位置</small><strong>${a.arranged[i]?esc(step.options.find(o=>o.id===a.arranged[i]).text):'点下面填入'}</strong></button>`).join('')}</div><div class="chips">${a.order.map(id=>`<button class="chip" data-learn="assign" data-value="${id}" ${a.arranged.includes(id)?'disabled':''}>${esc(step.options.find(o=>o.id===id).text)}</button>`).join('')}</div><p class="tiny muted">按顺序点选；点上方位置可以撤回。</p>${confidence(a)}${primary('submit','确认这个布局',a.arranged.length!==3)}`;
    const ev=step.kind==='reason'&&a.phase==='evidence';
    return `${ev?`<div class="learn-locked"><small>你的解读已选好，答案还没揭晓</small><p>${esc(step.options.find(o=>o.id===a.selected)?.text)}</p><button class="linkbtn" data-learn="reconsider">修改解读</button></div><h3 class="learn-question-label">哪一个依据最直接支持本题的核心判断？</h3>`:''}${options(step,a,ev)}${!ev?confidence(a):''}${step.hint?`<button class="linkbtn" data-learn="hint">${a.hint?'已使用提示':'给我一点提示'}</button>${a.hint?`<p class="hint">${esc(step.hint)}</p>`:''}`:''}${primary('submit',step.kind==='reason'&&!ev?'先选依据，再揭晓':'确认并查看反馈',ev?!a.evidence:!a.selected)}`;
  }
  function summary(unit,s){
    const events=data.history.filter(h=>h.runId===s.runId);
    const graded=events.filter(h=>h.correct!==null);
    const weak=[...new Set(events.filter(h=>h.correct===false||h.hint||(h.kind==='recall'?h.recall!=='all':h.confidence!=='sure')).map(h=>h.dimension))];
    const recall=events.filter(h=>h.kind==='recall');
    const selectedPath=unit.id==='case'?route(s).filter(step=>step.kind!=='arrange').map(step=>({step,a:s.answers[step.id]})).filter(x=>x.a?.selected):[];
    return `<section class="learn-summary"><div class="eyebrow">这一轮，先收好这些发现</div><h1>${unit.id==='case'?'这是你走出的解读路径':unit.id==='structure'?'用体系，让画面更好记':'你和这张牌，更熟悉了一点'}</h1><p class="muted">完成 ${s.stepIds.length} 个环节。刚练过，还需要隔一段时间再检验。</p><div class="learn-result-metrics"><div><strong>${graded.filter(h=>h.correct).length}<small> / ${graded.length}</small></strong><span>判断与依据符合本题<br>含使用提示后作答</span></div><div><strong>${events.filter(h=>h.hint).length}</strong><span>使用提示的环节</span></div></div>${selectedPath.length?`<ol class="built-reading">${selectedPath.map(({step,a})=>{const h=events.find(h=>h.stepId===step.id),o=step.options.find(o=>o.id===a.selected);return `<li><span class="eyebrow">${esc(step.title)}</span><p>${esc(o.text)}</p><small class="${h?.correct?'supported':'needs-work'}">${h?.correct?'✓ 本题答对':'✕ 本题答错'} · ${esc(o.why)}</small>${a.evidence?`<p class="tiny">你选择的依据：${esc(step.evidenceOptions.find(o=>o.id===a.evidence)?.text)}</p>`:''}</li>`;}).join('')}</ol><details class="learn-other"><summary>对照一条参考路径</summary><p>权杖王牌描述新的起步动力；星币四在阻碍位，可提示对现有资源或控制感的紧守；星币八在建议位，把行动落在可持续的小步练习与改进上。具体投入多少、是否值得继续，仍要核对现实条件。</p></details>`:''}<div class="learn-feedback"><h3>${weak.length?'下次重点补这些地方':'下一步：隔一段时间，再换个问法'}</h3><p>${weak.length?weak.map(esc).join(' · '):'本次完成得不错；还不能据此判断长期掌握。'}</p>${recall.length?`<p class="tiny">${recall.length} 次静默回忆单独记为自评，不计入上面的选对题数。</p>`:''}<p class="tiny">演示复习按能力维度安排；这仍是内容样本，尚未使用正式记忆算法。</p></div><div class="buttonstack"><button class="primary" data-learn="home">收好，回到今天</button><button class="secondary" data-learn-start="${unit.id==='p04'?'structure':unit.id==='structure'?'case':'return'}">${unit.id==='p04'?'换个角度：元素与数字':unit.id==='structure'?'试一次三牌解读':'换个问法再回忆'}</button><button class="linkbtn" data-learn="restart">重新体验这个单元</button></div></section>`;
  }
  function render(){
    const s=currentSession();if(!s)return `<div class="study-shell"><button class="primary" data-learn="home">回到今天</button></div>`;
    const unit=units[s.unitId],total=s.stepIds.length,complete=s.index===total;
    const header=`<header class="study-top"><button class="iconbtn" data-learn="home" aria-label="暂停并返回">${icon('close')}</button><div class="learn-header-title"><strong>${esc(unit.title)}</strong><small>${complete?'本轮结束，等待后续复习':'进度自动保存在当前浏览器'}</small></div><span class="study-counter">${complete?total:s.index+1} / ${total}</span></header><div class="learn-progress" role="progressbar" aria-label="单元进度" aria-valuenow="${s.index}" aria-valuemin="0" aria-valuemax="${total}"><span style="width:${s.index/total*100}%"></span></div>`;
    if(complete)return `<div class="learn-shell">${header}${summary(unit,s)}</div>`;
    const step=stepAt(s),a=ensureAnswer(s,step);
    return `<div class="learn-shell">${header}${!storageOK?'<p class="storage-warning">当前打开方式不能可靠保存单元进度，请使用导出备份。</p>':''}<div class="learn-grid"><aside class="learn-visual">${visuals(unit,step,a)}<div class="learn-unit-caption">${esc(unit.subtitle)}</div>${unit.id==='case'&&step.kind!=='intro'?`<details class="learn-case-context"><summary>回看案例背景</summary><p>${esc(unit.steps[0].prompt)}</p></details>`:''}</aside><main class="learn-main"><div class="eyebrow">${esc(step.dimension||'观察与理解')} · ${esc({observe:'点图找线索',intro:'建立联想',recall:'静默回忆',choice:'作出判断',reason:'判断＋依据',arrange:'记住牌位'}[step.kind])}</div><h1 tabindex="-1">${esc(step.title)}</h1>${step.contextLabel?`<span class="tag context-tag">${esc(step.contextLabel)}</span>`:""}<p class="learn-prompt">${esc(step.prompt||'')}</p>${interaction(step,a)}<div class="learn-step-footer">${s.index?'<button class="linkbtn" data-learn="previous">回看上一小步</button>':'<span></span>'}<button class="linkbtn" data-learn="home">先停在这里</button></div></main></div></div>`;
  }
  function home(){
    const s=data.sessions.p04,active=s&&s.index<s.stepIds.length;
    const reviewed=data.history.length;
    return `<section class="learn-home-hero"><div class="learn-home-copy"><div class="eyebrow">练习首页</div><h1>这一张，<br>真正记在心里。</h1><p>从画面找到线索，用元素和数字理解，<br>再亲自回忆、辨析和解读。</p><div class="tags"><span class="tag">先回忆，再揭晓</span><span class="tag">答案＋依据</span><span class="tag">全程点击</span></div></div><div class="learn-home-card"><button data-action="zoom" data-id="p04" aria-label="放大星币四">${img('p04')}</button><span>本次主角 · 星币四</span></div></section><section class="studycall"><div><h2>${active?'接着把这张牌学透':'从星币四开始'}</h2><p>${active?`上次停在第 ${s.index+1} / ${s.stepIds.length} 步`:`${units.p04.steps.length} 个环节 · 随时暂停，回来接着学`}</p></div><button class="primary light" data-learn-start="p04">${active?'继续学习':'翻开这一课'} ${icon('arrow')}</button></section><div class="learn-home-strip"><span>${reviewed?`已留下 ${reviewed} 次判断与回忆记录`:'本次深入体验 1 张牌，关联多张对照牌'}</span><span>学习记录仅保存在本机</span></div><section class="section"><div class="sectionhead"><h2>再换一个角度</h2><span class="tiny muted">单牌 · 元素 · 三牌</span></div><div class="feature-grid">${[['structure','元素与数字实验室','四元素＋三张四号牌，先推导再看图','leaf'],['case','把三张牌读成一段话','自己选主题、依据和建议，留下解读路径','practice']].map(([id,title,sub,ico])=>`<button class="feature" data-learn-start="${id}"><div><span class="feature-icon">${icon(ico)}</span><h3>${title}</h3><p>${sub}</p></div>${icon('arrow')}</button>`).join('')}</div><button class="learn-review-entry" data-learn-start="return"><span>${icon('repeat')} 换个问法，看看还记不记得</span><span>${concepts().filter(c=>c.due<=now()).length?'有到期复习':'5 道回访练习'} ${icon('arrow')}</span></button></section>`;
  }
  function dashboard(){
    const rows=concepts();
    return `<section class="section"><div class="sectionhead"><h2>我的学习单元</h2><span class="tiny muted">${data.history.length} 次记录</span></div>${Object.values(units).filter(u=>data.sessions[u.id]).map(u=>{const s=data.sessions[u.id];return `<button class="practice-row" data-learn-start="${u.id}"><span><strong>${esc(u.title)}</strong><p>${s.index===s.stepIds.length?'本轮已完成 · 可以重新体验':`停在第 ${s.index+1} 步 · 继续学习`}</p></span>${icon('arrow')}</button>`;}).join('')||'<p class="muted">完成新单元后，这里会记录你的理解与回忆。</p>'}<div class="learn-concepts">${rows.map(c=>`<div><strong>${esc(c.name)}</strong><small>${esc(units[c.scope].title)}</small><span>${c.needs?'还值得巩固':'本轮有支持'}</span><small>${c.due<=now()?'可以复习了':'演示复习：'+new Date(c.due).toLocaleDateString('zh-CN',{month:'numeric',day:'numeric'})}</small></div>`).join('')}</div>${rows.length?'<button class="secondary wide" data-learn-start="return">用新题回访单牌与元素</button>':''}<p class="subtleline">观察、回忆和应用分别记录；自评与即时正确都不等于长期掌握。回访先覆盖单牌与元素，牌阵关系的回访题尚未加入。下方「模拟 3 天后」也适用于这些单元。</p></section>`;
  }
  document.addEventListener('click',event=>{
    const entry=event.target.closest('[data-learn-start]');
    if(entry){start(entry.dataset.learnStart);return;}
    const el=event.target.closest('[data-learn]');if(!el)return;
    const action=el.dataset.learn;
    if(action==='home'){persist();go('home');return;}
    const s=currentSession();if(!s)return;
    if(action==='restart'){start(s.unitId,true);return;}
    const step=stepAt(s);if(!step)return;
    const a=ensureAnswer(s,step);
    if(action==='previous'){if(s.index>0){if(a.phase!=='feedback')a.hint=true;s.index--;ensureAnswer(s,stepAt(s));}persist();redraw();return;}
    if(action==='next'){
      const ready=step.kind==='intro'||(step.kind==='recall'?a.phase==='feedback'&&a.recall:a.phase==='feedback');
      if(!ready)return;
      if(step.kind==='recall')record(s,step,a);
      s.index++;if(s.index<s.stepIds.length)ensureAnswer(s,stepAt(s));persist();redraw();return;
    }
    if(step.kind==='recall'){
      if(action==='reveal'&&a.phase==='question')a.phase='feedback';
      if(action==='recall-forgot'&&a.phase==='question'){a.phase='feedback';a.recall='none';}
      if(action==='rate'&&a.phase==='feedback'&&!data.history.some(h=>h.id===`${s.runId}:${step.id}`)&&['all','part','none'].includes(el.dataset.value))a.recall=el.dataset.value;
    }else if(a.phase!=='feedback'){
      if(action==='select'&&a.phase==='question'&&optionIDs(step).includes(el.dataset.value))a.selected=el.dataset.value;
      if(action==='evidence'&&a.phase==='evidence'&&step.evidenceOptions.some(o=>o.id===el.dataset.value))a.evidence=el.dataset.value;
      if(action==='confidence'&&['sure','unsure'].includes(el.dataset.value))a.confidence=el.dataset.value;
      if(action==='hint')a.hint=true;
      if(action==='reconsider'){a.phase='question';a.evidence=null;}
      if(action==='assign'&&optionIDs(step).includes(el.dataset.value)&&!a.arranged.includes(el.dataset.value))a.arranged.push(el.dataset.value);
      if(action==='unassign'){const i=Number(el.dataset.index);if(Number.isInteger(i)&&i>=0&&i<a.arranged.length)a.arranged.splice(i,1);}
      if(action==='submit'){
        if(step.kind==='reason'&&a.phase==='question'&&a.selected)a.phase='evidence';
        else if((step.kind==='reason'&&a.evidence)||(step.kind==='arrange'&&a.arranged.length===3)||(['choice','observe'].includes(step.kind)&&a.selected)){a.phase='feedback';record(s,step,a);}
      }
    }
    persist();
    const y=window.scrollY;redraw();window.scrollTo(0,y);
    if(event.detail===0){const matching=[...document.querySelectorAll('[data-learn]')].find(b=>b.dataset.learn===action&&b.dataset.value===el.dataset.value&&b.classList.contains('hotspot')===el.classList.contains('hotspot'));(matching||document.querySelector('.learn-main h1'))?.focus({preventScroll:true});}
    if(action==='submit'||action==='reveal'||action==='recall-forgot')requestAnimationFrame(()=>document.querySelector('.learn-feedback,.learn-locked')?.scrollIntoView({behavior:'smooth',block:'nearest'}));
  });
  window.addEventListener('pagehide',persist);
  return {render,home,dashboard,start,validate,export:()=>data,restore:input=>{data=validate(input);persist();},reset:()=>{data=blank();persist();},count:()=>content.units.reduce((n,u)=>n+u.steps.length,0)};
};
