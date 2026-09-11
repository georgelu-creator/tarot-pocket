(() => {
  'use strict';
  const DATA = window.TAROT_CONTENT;
  const root = document.getElementById('app');
  if (!DATA?.cards?.length || !DATA?.questions?.length) {
    root.innerHTML = '<p class="startup">学习内容未能载入。请使用完整的 Demo 文件重新打开。</p>';
    return;
  }
  const baseCards = Object.fromEntries(DATA.cards.map(c=>[c.id,c]));
  const cards = window.TAROT_READING_DECK.cards.map(c=>({...c,...baseCards[c.id],contexts:c.contexts,questions:c.questions,clues:baseCards[c.id]?.clues||[{label:'画面',detail:c.observation}],positions:baseCards[c.id]?.positions||{present:c.core,obstacle:'检查这一主题是否表达过度或受阻：'+c.core,advice:'结合问题，把这一主题转成可尝试的行动：'+c.core},compare:baseCards[c.id]?.compare||null}));
  const questions = DATA.questions;
  const cardMap = Object.fromEntries(cards.map(c => [c.id, c]));
  const questionMap = Object.fromEntries(questions.map(q => [q.id, q]));
  const KEY = 'tarot-pocket-demo-v1';
  const DAY = 86400000;
  const fresh = () => ({version:1,history:[],saved:[],schedules:{},session:null,offsetDays:0,feedback:[]});
  let storageOK = true;
  let state = fresh();
  let page = 'home';
  let filter = '全部';
  let modal = null;
  let lastFocus = null;
  let spread = null;
  let toastTimer;
  let restoreCandidate = null;
  let restoreLearningCandidate = null;
  let restoreReadingCandidate = null;
  let zoomReturn = null;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const path = id => `assets/cards/${id}.webp`;
  const img = (id,extra='') => `<img src="${path(id)}" alt="${esc(cardMap[id]?.name || '塔罗牌')}" ${extra}>`;
  const icon = name => {
    const shapes = {
      home:'<path d="m3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9"/>',
      cards:'<rect x="6" y="3" width="13" height="18" rx="2"/><path d="M3 6v13a2 2 0 0 0 2 2m5-13 2.5-2L15 8l-2.5 2L10 8Z"/>',
      practice:'<path d="m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6L12 3Z"/>',
      me:'<circle cx="12" cy="8" r="3.5"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/>',
      arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
      back:'<path d="m14 5-7 7 7 7"/>',
      close:'<path d="m6 6 12 12M6 18 18 6"/>',
      check:'<path d="m5 12 4 4L19 6"/>',
      cloud:'<path d="M6 18a4 4 0 0 1-1-7.9 7 7 0 0 1 13.5-1A4.5 4.5 0 0 1 18 18M8 18l3 3 5-6"/>',
      zoom:'<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5M7 10h6m-3-3v6"/>',
      repeat:'<path d="M4 10a8 8 0 0 1 14-5l2 2M20 3v4h-4M20 14A8 8 0 0 1 6 19l-2-2m0 4v-4h4"/>',
      save:'<path d="M6 3h12v18l-6-4-6 4V3Z"/>',
      leaf:'<path d="M5 19C-1 6 12 3 21 3c0 12-3 18-13 15M5 21 16 9"/>'
    };
    return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${shapes[name] || shapes.practice}</svg>`;
  };
  const shuffle = list => {
    const result = [...list];
    for (let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
    return result;
  };
  const now = () => Date.now() + state.offsetDays * DAY;
  const date = value => new Date(value).toLocaleDateString('zh-CN',{month:'numeric',day:'numeric'});
  const dueIDs = () => Object.keys(state.schedules).filter(id => questionMap[id] && state.schedules[id] <= now());
  const seenIDs = () => [...new Set(state.history.map(h=>h.cardId).filter(id=>cardMap[id]))];

  function validateState(input, keepSession=true) {
    if (!input || input.version !== 1 || !Array.isArray(input.history) || input.history.length>10000) throw new Error('不支持的记录格式');
    const out=fresh();
    out.history=input.history.filter(h=>h && questionMap[h.qid] && cardMap[h.cardId] && typeof h.at==='number' && Number.isFinite(h.at) && typeof h.correct==='boolean').map(h=>({id:String(h.id).slice(0,90),qid:h.qid,cardId:h.cardId,at:h.at,correct:h.correct,confidence:h.confidence==='sure'?'sure':'unsure',hint:!!h.hint,selected:typeof h.selected==='string'?h.selected:null}));
    out.saved=Array.isArray(input.saved)?[...new Set(input.saved.filter(id=>cardMap[id]))]:[];
    out.offsetDays=Number.isInteger(input.offsetDays)?Math.max(0,Math.min(365,input.offsetDays)):0;
    if(input.schedules && typeof input.schedules==='object') for(const [id,value] of Object.entries(input.schedules)) if(questionMap[id] && Number.isFinite(value))out.schedules[id]=value;
    out.feedback=Array.isArray(input.feedback)?input.feedback.filter(x=>x && typeof x.text==='string').slice(-100).map(x=>({text:x.text.slice(0,200),at:Number(x.at)||0})):[];
    const s=input.session;
    if(keepSession && s && Array.isArray(s.ids) && s.ids.length>0 && s.ids.length<=24 && s.ids.every(id=>questionMap[id]) && Number.isInteger(s.index) && s.index>=0 && s.index<s.ids.length && ['draw','intro','question','complete'].includes(s.phase)) {
      const q=questionMap[s.ids[s.index]];
      if(Array.isArray(s.order) && s.order.length===4 && new Set(s.order).size===4 && s.order.every(id=>q.options.some(o=>o.id===id))) {
        out.session={id:String(s.id).slice(0,90),mode:typeof s.mode==='string'?s.mode:'daily',ids:s.ids,index:s.index,phase:s.phase,order:s.order,selected:q.options.some(o=>o.id===s.selected)?s.selected:null,answered:!!s.answered,hint:!!s.hint,confidence:s.confidence==='sure'?'sure':'unsure',eventId:typeof s.eventId==='string'?s.eventId:null,results:Array.isArray(s.results)?s.results.filter(id=>typeof id==='string').slice(0,24):[]};
      }
    }
    return out;
  }
  try {
    const saved=localStorage.getItem(KEY);
    if(saved)state=validateState(JSON.parse(saved));
    localStorage.setItem(KEY,JSON.stringify(state));
  } catch(error){storageOK=false;}
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch(error){storageOK=false;toast('当前环境无法保存记录，可以先体验并导出备份。');}}
  function toast(text){clearTimeout(toastTimer);document.getElementById('toast').innerHTML=`<div class="toast">${esc(text)}</div>`;toastTimer=setTimeout(()=>document.getElementById('toast').replaceChildren(),3400);}
  function topbar(){return `<header class="topbar"><button class="brand" data-action="nav" data-page="home"><span class="brandmark" aria-hidden="true">✧</span>塔罗随身学</button><div class="toplinks"><span class="badge">交互体验版</span><button class="iconbtn" data-action="status" aria-label="查看本机内容状态">${icon('cloud')}</button></div></header>`;}
  function nav(){return `<nav class="bottomnav" aria-label="主要导航"><div class="navinner">${[['home','练习','practice'],['reading','抽牌','cards'],['library','牌库','home'],['me','我的','me']].map(([id,label,ico])=>`<button class="navitem ${page===id?'active':''}" data-action="nav" data-page="${id}" ${page===id?'aria-current="page"':''}><span class="iconwrap">${icon(ico)}</span>${label}</button>`).join('')}</div></nav>`;}
  function shell(body){return `<div class="shell">${topbar()}${!storageOK?'<div class="storage-warning">当前打开方式无法持久保存记录。你仍可体验，并在「我的」导出学习记录。</div>':''}${body}</div>${nav()}`;}
  function render(){
    if(page==='learning')root.innerHTML=learning.render();
    else if(page==='study')root.innerHTML=renderStudy();
    else if(page==='spread')root.innerHTML=shell(renderSpread());
    else if(page==='library')root.innerHTML=shell(renderLibrary());
    else if(page==='reading')root.innerHTML=shell(reading.render());
    else if(page==='spread-guide')root.innerHTML=shell(reading.renderGuide());
    else if(page==='me')root.innerHTML=shell(renderMe());
    else root.innerHTML=shell(renderHome());
    root.querySelectorAll('img').forEach(image=>image.addEventListener('error',()=>{image.alt='图片未能载入，请使用完整 Demo';image.style.background='#e7e3d5';},{once:true}));
  }
  function go(destination){page=destination==='practice'?'home':destination;closeModal();render();window.scrollTo(0,0);}
  function renderHome(){
    const active=state.session && state.session.phase!=='complete';
    return `${learning.home()}${reading.learningHub()}<section class="section"><div class="sectionhead"><h2>混合巩固</h2><span class="tiny muted">图像 · 近义辨析 · 牌位</span></div><button class="primary wide" data-action="${active?'resume':'start'}" data-mode="daily">${active?'继续上次的快练':'抽一组题 · 六个小练习'} ${icon('arrow')}</button><details class="spread-guide-list"><summary>选择专项练习</summary>${[['compare','相似牌辨析'],['structure','元素与数字'],['context','同牌换位'],['reversal','正逆位情境'],['review','复习快练错题']].map(([mode,title])=>`<button class="practice-row" data-action="start" data-mode="${mode}"><strong>${title}</strong>${icon('arrow')}</button>`).join('')}</details></section><details class="spread-guide-list"><summary>原有三个教学案例</summary>${[['one','单牌聚焦'],['three','现状 · 阻碍 · 建议'],['choice','二选一']].map(([id,title])=>`<button class="practice-row" data-action="spread" data-id="${id}"><strong>${title}</strong>${icon('arrow')}</button>`).join('')}</details><p class="footnote">练习回答明确题目；自由抽牌请进入底部「抽牌」。</p>`;
  }
  function renderLibrary(){const shown=filter==='收藏'?cards.filter(c=>state.saved.includes(c.id)):filter==='全部'?cards:cards.filter(c=>c.suit===filter);return `<div class="pagehead"><div class="eyebrow">YOUR LITTLE TAROT LIBRARY</div><h1>每张牌，都有线索。</h1><p>完整 78 张牌图与基础释义；深入课程正在逐组扩展。</p></div><div class="chips">${['全部','大阿尔卡纳','权杖','圣杯','宝剑','星币','收藏'].map(f=>`<button class="chip ${filter===f?'active':''}" data-action="filter" data-value="${f}" aria-pressed="${filter===f}">${f}</button>`).join('')}</div><div class="library-grid">${shown.map(c=>`<button class="library-card" data-action="card" data-id="${c.id}">${img(c.id,'loading="lazy"')}${seenIDs().includes(c.id)?'<span class="seen-dot">练过</span>':''}<h3>${esc(c.name)}</h3><p>${esc(c.en)}</p></button>`).join('')}</div>${shown.length?'':'<p class="empty">还没有收藏。打开一张牌，点「收藏」就可以留下它。</p>'}<p class="footnote">牌库含 78 张基础释义；完整学习单元与基础查阅分别提供。</p>`;}
  function renderPractice(){return `<div class="pagehead"><div class="eyebrow">UNDERSTAND, THEN REMEMBER</div><h1>把理解，练成直觉。</h1><p>选一个你想试试的方向。</p></div><section class="section learn-unit-links"><h2>完整学习单元</h2>${[["p04","把星币四记牢 · 12 步"],["structure","元素与数字实验室 · 8 步"],["case","拼出你的三牌解读 · 7 步"],["return","换情境复习 · 最多 5 步"]].map(([id,title])=>`<button class="practice-row" data-learn-start="${id}"><strong>${title}</strong>${icon("arrow")}</button>`).join("")}</section><div class="section feature-grid"><button class="feature" data-action="start" data-mode="review"><div><span class="feature-icon">${icon('repeat')}</span><h3>找回熟悉感</h3><p>${dueIDs().length?'有 '+dueIDs().length+' 个知识点到期':'复习做过的题，看看还记得吗'}</p></div></button><button class="feature" data-action="start" data-mode="structure"><div><span class="feature-icon">${icon('leaf')}</span><h3>元素与数字</h3><p>从共同的结构，读出不同的牌</p></div></button></div><section class="section"><div class="sectionhead"><h2>辨析与应用</h2><span class="tiny muted">不用输入答案</span></div>${[['compare','01','分清相近的含义','不是看哪个选项最好听，而是找依据。'],['context','02','同一张牌，换个位置','在现状位与建议位，表达应该怎样变？'],['reversal','03','逆位，不只是相反','加入具体情境，再看能量怎样表达。']].map(([mode,n,title,sub])=>`<button class="practice-row" data-action="start" data-mode="${mode}"><span class="practice-number">${n}</span><span class="practice-text"><h3>${title}</h3><p>${sub}</p></span>${icon('arrow')}</button>`).join('')}</section><section class="section"><div class="sectionhead"><h2>你的第一张牌桌</h2><span class="tiny muted">3 种牌阵</span></div>${[['one','1','单牌聚焦','围绕一个问题，观察一张牌。'],['three','3','现状 · 阻碍 · 建议','把三张牌的含义连接起来。'],['choice','6','二选一','用同样的维度，比较两种选择。']].map(([id,n,title,sub])=>`<button class="practice-row" data-action="spread" data-id="${id}"><span class="practice-number">${n}</span><span class="practice-text"><h3>${title}</h3><p>${sub}</p></span>${icon('arrow')}</button>`).join('')}</section>`;}
  function renderMe(){const wrong=[...new Set(state.history.filter(h=>!h.correct).slice(-12).map(h=>h.cardId))];return `<div class="pagehead"><div class="eyebrow">YOUR OWN PACE</div><h1>每一点理解，都算数。</h1><p>这里记录你做过的练习，不把猜对当作掌握。</p></div><div class="statgrid"><div class="statbox"><strong>${seenIDs().length} <small>/ ${cards.length}</small></strong><span>快练中遇到的牌</span></div><div class="statbox"><strong>${state.history.length}</strong><span>快练作答次数</span></div></div>${learning.dashboard()}${reading.dashboard()}<section class="section"><div class="sectionhead"><h2>值得再看看</h2></div>${wrong.length?`<div class="discovery">${wrong.map(id=>`<button data-action="card" data-id="${id}">${img(id)}<strong>${esc(cardMap[id].name)}</strong></button>`).join('')}</div>`:'<p class="empty">做过练习后，容易混淆的牌会出现在这里。</p>'}</section><section class="section"><h2>复习与记录</h2><div class="setting-row"><div><strong>待复习 ${dueIDs().length} 个知识点</strong><p>演示日期：${date(now())}${state.offsetDays?' · 已向后模拟 '+state.offsetDays+' 天':''}</p></div><button class="secondary" data-action="start" data-mode="review">复习</button></div><div class="setting-row"><div><strong>看看几天后会怎样</strong><p>只改变 Demo 时间，不修改手机日期。</p></div><button class="secondary" data-action="advance">模拟 3 天后</button></div>${state.offsetDays?'<button class="linkbtn" data-action="clock-reset">回到真实日期</button>':''}<p class="subtleline">演示规则：答错、用了提示或不确定，次日再看；答对且有依据，三天后再看。暂未接入正式记忆算法。</p></section><section class="section"><h2>保存与体验</h2><div class="setting-row"><div><strong>学习记录</strong><p>${storageOK?'保存在当前浏览器；导出文件可另行备份。':'当前环境不能保存，请使用导出备份。'}</p></div><button class="secondary" data-action="export">导出</button></div><div class="setting-row"><div><strong>恢复记录</strong><p>导入之前从这个 Demo 导出的 JSON。</p></div><button class="secondary" data-action="import">导入</button></div><div class="setting-row"><div><strong>牌图与内容</strong><p>检查 78 张本地图片及内容来源。</p></div><button class="secondary" data-action="status">检查</button></div><div class="setting-row"><div><strong>体验反馈</strong><p>一键留下感受，仅保存在本机。</p></div><button class="secondary" data-action="feedback">记录感受</button></div><div class="setting-row"><div><strong>重新体验</strong><p>仅清空本 Demo 的记录。</p></div><button class="linkbtn" data-action="reset">重置</button></div></section><p class="footnote">轻量体验 Demo · 无账号 · 无联网 AI</p>`;}

  function startSession(mode='daily',cardId=null){
    let pool=questions;
    if(cardId)pool=questions.filter(q=>q.cardId===cardId);
    else if(mode==='compare')pool=questions.filter(q=>q.type==='compare' || ['m09','s04'].includes(q.cardId));
    else if(['context','reversal','structure'].includes(mode))pool=questions.filter(q=>q.type===mode);
    else if(mode==='review'){const ids=dueIDs();pool=ids.length?questions.filter(q=>ids.includes(q.id)):questions.filter(q=>state.history.some(h=>h.qid===q.id));if(!pool.length){toast('先认识几张牌，之后就有内容可以复习了。');return;}}
    let ids=shuffle(pool).slice(0,6).map(q=>q.id);
    if(mode==='daily' && !cardId){const first=questions.find(q=>q.cardId==='m09' && q.type==='meaning') || questions.find(q=>q.cardId==='m09');const due=dueIDs();ids=[...new Set([...due,first.id,...ids])].slice(0,6);}
    if(!ids.length){toast('这个方向的示例题还未载入。');return;}
    const firstQ=questionMap[ids[0]];
    state.session={id:`s-${Date.now()}-${Math.random().toString(16).slice(2,8)}`,mode,ids,index:0,phase:'draw',order:shuffle(firstQ.options.map(o=>o.id)),selected:null,answered:false,hint:false,confidence:'unsure',eventId:null,results:[]};
    persist();go('study');
  }
  function currentQuestion(){return state.session?questionMap[state.session.ids[state.session.index]]:null;}
  function renderStudy(){const s=state.session;if(!s){page='home';return shell(renderHome());}const q=currentQuestion();const c=cardMap[q.cardId];const header=`<div class="study-top"><button class="iconbtn" data-action="nav" data-page="home" aria-label="暂停并返回">${icon('close')}</button><div class="progress" role="progressbar" aria-label="本组进度" aria-valuenow="${s.index}" aria-valuemin="0" aria-valuemax="${s.ids.length}"><div class="progressfill" style="width:${Math.round(s.index/s.ids.length*100)}%"></div></div><span class="study-counter">${s.phase==='complete'?s.ids.length:s.index+1} / ${s.ids.length}</span></div>`;
    if(s.phase==='complete')return `<div class="study-shell">${header}${renderComplete()}</div>`;
    if(s.phase==='draw')return `<div class="study-shell">${header}<div class="backstage"><div><div class="eyebrow">A MOMENT FOR YOURSELF</div><button class="draw-button" data-action="draw" aria-label="翻开学习牌"><div class="card-back"><span aria-hidden="true">✧</span></div></button><h1>这一张，慢慢看。</h1><p>不急着背下所有含义。<br>先从画面里，找一个你注意到的细节。</p><button class="primary wide" data-action="draw">翻开这张牌 ${icon('arrow')}</button><p class="draw-meta">系统为本组练习选出的学习牌</p></div></div></div>`;
    if(s.phase==='intro')return `<div class="study-shell">${header}<div class="study-grid"><div class="question-visual"><button class="question-card" data-action="zoom" data-id="${c.id}" aria-label="放大${esc(c.name)}">${img(c.id)}</button><div class="card-caption">${esc(c.name)} · ${esc(c.en)}</div></div><div class="question-main"><div class="eyebrow">先认识，再试着判断</div><h2>${esc(c.theme || c.name)}</h2><p class="context">${esc(c.core)}</p><div class="detail-section" style="margin-top:22px"><h3>先看见什么？</h3>${c.clues.slice(0,2).map(cue=>`<div class="clue"><strong>${esc(cue.label)}</strong><span>${esc(cue.detail)}</span></div>`).join('')}</div><p class="subtleline">接下来几个解释会很接近。试着找到最有画面依据的一个。</p><button class="primary wide" data-action="intro-next">我想试试看 ${icon('arrow')}</button></div></div></div>`;
    const options=s.order.map((id,i)=>{const o=q.options.find(o=>o.id===id);return `<button class="option ${s.answered?(id===q.correct?'correct':id===s.selected?'incorrect':''):''}" data-action="answer" data-value="${id}" ${s.answered?'disabled':''}><span class="letter">${s.answered&&id===q.correct?icon('check'):String.fromCharCode(65+i)}</span><span>${esc(o.text)}</span></button>`;}).join('');
    return `<div class="study-shell">${header}<div class="study-grid"><div class="question-visual"><div class="eyebrow">${esc(q.tag || '观察与理解')}</div><button class="question-card ${s.answered?'':'covered'}" data-action="zoom" data-id="${c.id}" data-hide="${s.answered?'0':'1'}" aria-label="放大牌面，不显示答案">${img(c.id)}</button><div class="card-caption">${s.answered?esc(c.name)+' · ':''}点牌面放大观察</div></div><div class="question-main"><div class="eyebrow">${esc({meaning:'牌义辨析',image:'图像线索',structure:'元素与数字',context:'放进具体情境',reversal:'理解逆位',compare:'相近的牌'}[q.type] || '想一想')}</div><h2 id="question-title">${esc(q.title)}</h2>${q.context?`<p class="context">${esc(q.context)}</p>`:''}<div class="options" aria-labelledby="question-title">${options}</div>${!s.answered?`<div class="helper-row"><button class="linkbtn" data-action="hint">${s.hint?'提示已展开':'给我一点提示'}</button><button class="linkbtn" data-action="unknown">还不确定，看看解释</button></div>${s.hint?`<div class="hint">${esc(q.evidence)}</div>`:''}`:renderAnswer(q,s)}</div></div></div>`;
  }
  function renderAnswer(q,s){const correct=s.selected===q.correct;return `<section class="answer-feedback" aria-label="答案解释"><div class="feedbacktitle" data-correct="${correct}" role="status">${correct?'✓ 答对了':s.selected?'✕ 答错了':'本题未作答'}</div><p><strong>本题正确答案：</strong>${esc(q.options.find(o=>o.id===q.correct).text)}</p><p>${esc(q.explanation)}</p><div class="evidence"><span class="eyebrow">回到画面与问题</span><p>${esc(q.evidence)}</p></div><details><summary>为什么其他选项没那么贴合？</summary><div class="reasons">${s.order.map((id,i)=>{const o=q.options.find(o=>o.id===id);return `<p><strong>${String.fromCharCode(65+i)} · </strong>${esc(o.reason)}</p>`;}).join('')}</div></details>${correct?`<p class="tiny muted">这次你是怎样选出来的？</p><div class="confidence"><button class="chip ${s.confidence==='sure'?'active':''}" data-action="confidence" data-value="sure" aria-pressed="${s.confidence==='sure'}">有依据地选出</button><button class="chip ${s.confidence!=='sure'?'active':''}" data-action="confidence" data-value="unsure" aria-pressed="${s.confidence!=='sure'}">还有点靠猜</button></div>`:''}<div class="nextrow"><button class="primary wide" data-action="next">${s.index===s.ids.length-1?'看看这一组的收获':'继续下一题'} ${icon('arrow')}</button></div><button class="linkbtn" data-action="card" data-id="${q.cardId}">再看看这张牌的完整解释</button></section>`;}
  function answer(value){const s=state.session;if(!s || s.answered || s.phase!=='question')return;const q=currentQuestion();if(value!==null&&!q.options.some(o=>o.id===value))return;s.selected=value;s.answered=true;s.confidence='unsure';const event={id:`${s.id}-${s.index}`,qid:q.id,cardId:q.cardId,at:now(),selected:value,correct:value===q.correct,confidence:'unsure',hint:s.hint};s.eventId=event.id;s.results.push(event.id);state.history.push(event);state.schedules[q.id]=now()+DAY;persist();const oldY=window.scrollY;render();window.scrollTo(0,oldY);requestAnimationFrame(()=>document.querySelector('.answer-feedback')?.scrollIntoView({behavior:'smooth',block:'start'}));}
  function confidence(value){const s=state.session;if(!s?.answered || !['sure','unsure'].includes(value))return;s.confidence=value;const h=state.history.find(e=>e.id===s.eventId);if(h){h.confidence=value;state.schedules[h.qid]=h.at+(h.correct&&value==='sure'&&!h.hint?3:1)*DAY;}persist();const y=window.scrollY;render();window.scrollTo(0,y);}
  function next(){const s=state.session;if(!s?.answered)return;if(s.index===s.ids.length-1){s.phase='complete';}else{s.index++;const q=currentQuestion();s.order=shuffle(q.options.map(o=>o.id));s.selected=null;s.answered=false;s.hint=false;s.confidence='unsure';s.eventId=null;}persist();render();window.scrollTo(0,0);}
  function renderComplete(){const s=state.session;const events=s.results.map(id=>state.history.find(h=>h.id===id)).filter(Boolean);const correct=events.filter(h=>h.correct).length;return `<section class="complete fade-in"><div class="seal">${icon('leaf')}</div><div class="eyebrow">A LITTLE MORE UNDERSTANDING</div><h1>又多懂了一点。</h1><p>完成 ${events.length} 个练习，首次选对 ${correct} 题。<br>能说出依据，比一次选对更重要。</p><div class="section">${[...new Set(events.map(h=>h.cardId))].map(id=>`<div class="resultline">${img(id)}<span class="text"><strong>${esc(cardMap[id].name)}</strong><small>${esc(cardMap[id].core)}</small></span></div>`).join('')}</div><p class="tiny">这些内容已经进入演示复习队列。<br>刚刚答对不代表已经长期掌握。</p><div class="complete-actions"><button class="primary" data-action="nav" data-page="home">收好今天的发现</button><button class="secondary" data-action="start" data-mode="daily">再练一组</button><button class="linkbtn" data-action="feedback">记下这次体验感受</button></div></section>`;}

  const spreadDefs={one:{name:'单牌聚焦',subtitle:'用一张牌，观察一个具体问题。',labels:['本次关注点'],ids:['m09'],scenario:'当外界建议很多，我现在最值得关注什么？'},three:{name:'现状 · 阻碍 · 建议',subtitle:'每个位置问的问题不同，同一张牌的表达也会改变。',labels:['现状','阻碍','建议'],ids:['w01','p04','p08'],scenario:'我想开始一个新项目，但一直没有真正推进。接下来可以怎么做？'},choice:{name:'二选一',subtitle:'用相同的三个维度比较，不把某一张牌当成决定。',labels:['A · 资源','A · 代价','A · 发展','B · 资源','B · 代价','B · 发展'],ids:['m01','p04','p08','w01','c08','s06'],scenario:'面对「在熟悉的领域深耕」和「试一个新方向」，我可以怎样比较？'}};
  function openSpread(id){if(!spreadDefs[id])return;spread={id,ids:[...spreadDefs[id].ids],active:0,mode:'guide',free:false,selected:null,step:0,match:null};go('spread');}
  function renderSpread(){if(!spread)return renderPractice();const d=spreadDefs[spread.id];const c=cardMap[spread.ids[spread.active]];const notes={one:['这张牌只回答本次关注点。隐士在这里可以提示：先减少外界声音，确认自己的判断标准。'],three:['权杖王牌提示一个新动机或创造起点。现状位描述已有的能量，还不等于项目已经落实。','星币四在阻碍位，可以指向过度紧守既有资源或控制感，让新尝试难以发生。','星币八在建议位，可以把关注点落在持续练习、改进细节和小规模的实际行动上。'],choice:['魔术师：熟悉方向中已有的技能与可调用资源。','星币四：维持稳定也可能使投入空间变小，要检查是否过度保守。','星币八：若持续精进，可能形成更扎实的执行能力。','权杖王牌：新方向带来的热情与起步动力。','圣杯八：可能需要放下原有投入或熟悉的满足感。','宝剑六：更像逐渐过渡和调整，并不等于立刻到达理想状态。']};
    return `<div class="spread-intro"><button class="iconbtn" data-action="nav" data-page="practice" aria-label="返回练习">${icon('back')}</button><div><div class="eyebrow">${spread.free?'自由练习':'教学示例'} · SPREAD STUDIO</div><h1>${d.name}</h1></div></div><p class="muted">${d.subtitle}</p><div class="scenario section"><strong>这一次的问题</strong>${d.scenario}</div><div class="spread-board ${spread.id==='one'?'one':spread.id==='three'?'three':'six'}">${spread.ids.map((id,i)=>`<button class="spread-slot ${spread.active===i?'active':''}" data-action="position" data-index="${i}" aria-pressed="${spread.active===i}">${img(id)}<span class="spread-label">${i+1} · ${d.labels[i]}</span><span class="spread-name">${esc(cardMap[id].name)}</span></button>`).join('')}</div><div class="position-panel"><div class="eyebrow">点一张牌，看看这个位置在问什么</div><h3>${d.labels[spread.active]} · ${esc(c.name)}</h3><p>${spread.free?esc(c.core)+' '+esc(spread.id==='three'?c.positions[['present','obstacle','advice'][spread.active]]:spread.id==='one'?c.positions.present:'先判断它描述的是资源、代价还是发展，再放进问题里。'):notes[spread.id][spread.active]}</p><button class="linkbtn" data-action="card" data-id="${c.id}">看这张牌的图像依据</button></div>${renderSpreadExercise()}<div class="spread-actions">${!spread.free?`<button class="secondary" data-reading="use-spread" data-value="${spread.id}">选择自己的问题，实际抽一次</button>`:`<button class="secondary" data-action="spread-free">重新抽取</button><button class="linkbtn" data-action="spread" data-id="${spread.id}">回到教学示例</button>`}</div><p class="mode-note">${spread.free?'自由练习不会自动判定解读正确。先观察图像，再检查是否回答了牌位的问题。':'这是预先写好的教学案例，展示一种有依据的解读。它不代表对现实结果的确定预测。'}</p>`;
  }
  function renderSpreadExercise(){if(spread.free)return '';if(spread.id==='three'){
    const texts=['想法已经出现，但对已有资源的紧守限制了行动；先通过持续的小步实践推进。','想法已经出现，但多项事务之间切换造成分心；先通过重新分配时间推进。','想法已经出现，但旧的情绪联结妨碍了转身；先通过告别原有投入推进。','想法已经出现，但表达和沟通尚未取得共识；先通过协调不同意见推进。'];
    return `<section class="section"><div class="eyebrow">把三张牌连起来</div><h2>哪一句，照顾到了三个位置？</h2><div class="options">${texts.map((t,i)=>`<button class="option ${spread.selected!==null?(i===0?'correct':i===spread.selected?'incorrect':''):''}" data-action="spread-answer" data-index="${i}" ${spread.selected!==null?'disabled':''}><span class="letter">${String.fromCharCode(65+i)}</span><span>${t}</span></button>`).join('')}</div>${spread.selected!==null?`<div class="position-panel" role="status"><h3>${spread.selected===0?'✓ 答对了':'✕ 答错了 · 请核对阻碍位的依据'}</h3><p>权杖王牌对应起步动力；星币四对应对既有资源的控制；星币八强调持续实践。其他选项中的分心、告别或协调，并非这组三张牌最直接支持的重点。</p><button class="linkbtn" data-action="spread-retry">收起解释，再看一次</button></div>`:''}</section>`;
    }
    if(spread.id==='one')return `<section class="section"><h2>把观察变成一句话</h2><p class="context">点选一个最贴近这张牌的关注方向。</p><div class="options">${['先确认我真正认同的方向，而不是不断收集更多意见。','先恢复近期消耗的力量，而不是继续加快行动。','先放下已经没有意义的投入，再寻找新的满足。'].map((t,i)=>`<button class="option ${spread.selected!==null?(i===0?'correct':i===spread.selected?'incorrect':''):''}" data-action="spread-answer" data-index="${i}" ${spread.selected!==null?'disabled':''}><span class="letter">${String.fromCharCode(65+i)}</span><span>${t}</span></button>`).join('')}</div>${spread.selected!==null?`<div class="hint" role="status"><strong>${spread.selected===0?'✓ 答对了':'✕ 答错了'}</strong><br>隐士的独处与灯光，可以支持「寻找自己的方向」。另外两句可能是合理建议，但更接近宝剑四的休整、圣杯八的离开。</div>`:''}</section>`;
    return `<section class="section"><h2>先读懂位置，再读牌</h2><p class="context">A 方向的第二张是「代价」。这个位置主要问什么？</p><div class="options">${['为了选择 A，我可能需要承担或放弃什么？','如果选择 A，我已经能够调用什么优势？','如果选择 A，沿当前条件可能怎样发展？'].map((t,i)=>`<button class="option ${spread.selected!==null?(i===0?'correct':i===spread.selected?'incorrect':''):''}" data-action="spread-answer" data-index="${i}" ${spread.selected!==null?'disabled':''}><span class="letter">${String.fromCharCode(65+i)}</span><span>${t}</span></button>`).join('')}</div>${spread.selected!==null?`<div class="hint" role="status"><strong>${spread.selected===0?'✓ 答对了':'✕ 答错了'}</strong><br>这里应先找出选择的代价，再看星币四怎样描述它。不能因为牌面看起来稳定，就直接把这个位置读成优势。</div>`:''}</section>`;
  }

  function showModal(html,type='sheet'){lastFocus=document.activeElement;document.getElementById('overlay').innerHTML=type==='zoom'?html:`<div class="modal-backdrop" data-backdrop="true"><section class="sheet" role="dialog" aria-modal="true" aria-label="详细内容" tabindex="-1">${html}</section></div>`;document.body.style.overflow='hidden';requestAnimationFrame(()=>document.querySelector('#overlay button')?.focus());}
  function closeModal(){document.getElementById('overlay').replaceChildren();document.body.style.overflow='';modal=null;restoreCandidate=null;restoreLearningCandidate=null;restoreReadingCandidate=null;zoomReturn=null;if(lastFocus?.isConnected)lastFocus.focus();lastFocus=null;}
  function sheetHead(title){return `<div class="sheethead"><h2>${esc(title)}</h2><button class="iconbtn" data-action="close" aria-label="关闭">${icon('close')}</button></div>`;}
  function showCard(id,face='upright',position='present'){const c=cardMap[id];if(!c)return;modal={type:'card',id,face,position};showModal(`${sheetHead(c.name)}<div class="detail-hero"><button class="iconbtn" style="padding:0" data-action="zoom" data-id="${id}" aria-label="放大${esc(c.name)}">${img(id,face==='reversed'?'class="reversed-img"':'')}</button><div><div class="eyebrow">${esc(c.en)}</div><p>${esc(c.core)}</p><div class="tags">${c.keywords.map(k=>`<span class="tag">${esc(k)}</span>`).join('')}</div><p class="tiny muted">${esc(c.suit)}${c.element&&c.element!=='—'?' · '+esc(c.element):''} · ${esc(c.number)}</p></div></div><div class="segmented" aria-label="牌的方向"><button data-action="face" data-value="upright" class="${face==='upright'?'active':''}">正位</button><button data-action="face" data-value="reversed" class="${face==='reversed'?'active':''}">逆位</button></div><p>${esc(c[face])}</p><div class="detail-section" style="margin-top:20px"><h3>从画面里找到依据</h3><p>${esc(c.observation)}</p>${c.clues.map(cue=>`<div class="clue"><strong>${esc(cue.label)}</strong><span>${esc(cue.detail)}</span></div>`).join('')}</div><div class="detail-section"><h3>换一个牌位，怎样表达？</h3><div class="segmented">${[['present','现状'],['obstacle','阻碍'],['advice','建议']].map(([v,t])=>`<button class="${position===v?'active':''}" data-action="detail-position" data-value="${v}">${t}</button>`).join('')}</div><p>${esc(c.positions[position])}</p><small class="muted">这里展示正位的牌位应用示例。</small></div>${c.compare?`<div class="detail-section"><h3>和相近的牌分清楚</h3><p>${esc(c.compare.note)}</p><button class="linkbtn" data-action="card" data-id="${c.compare.id}">对照看看 ${esc(cardMap[c.compare.id]?.name)}</button></div>`:""}<div class="detail-section"><h3>换一个问题，怎样理解？</h3>${Object.entries(c.contexts).map(([topic,ctx])=>`<p><strong>${esc({love:"感情",career:"事业",study:"学业"}[topic])}</strong> · ${esc(ctx.state)}</p>`).join("")}</div><div class="buttonstack">${id==='p04'?'<button class="primary" data-learn-start="p04">完整学习星币四 · 12 个环节</button>':''}${questions.some(q=>q.cardId===id)?`<button class="secondary" data-action="card-practice" data-id="${id}">练习这张牌</button>`:""}<button class="secondary" data-action="save" data-id="${id}">${state.saved.includes(id)?'已收藏 · 点击取消':'收藏这张牌'}</button></div><p class="footnote">历史 RWS 牌图 · 中文讲解为教学示例<br><button class="linkbtn" data-action="sources">查看内容与图片来源</button></p>`);}
  async function checkStatus(){modal={type:'status'};showModal(`${sheetHead('本机内容检查')}<p class="muted">正在逐张检查78 张图片是否可以解码…</p>`);const result=await Promise.all(cards.map(c=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im.naturalWidth>100);im.onerror=()=>resolve(false);im.src=path(c.id);})));if(modal?.type!=='status')return;const count=result.filter(Boolean).length;showModal(`${sheetHead('本机内容检查')}<div class="status-row"><span>牌图可显示</span><span class="status-value">${count} / ${cards.length}</span></div><div class="status-row"><span>示例牌义</span><span class="status-value">${cards.length} 张</span></div><div class="status-row"><span>混合快练题</span><span class="status-value">${questions.length} 道</span></div><div class="status-row"><span>新增完整学习与复习</span><span class="status-value">${learning.count()} 个环节</span></div><div class="status-row"><span>可学习与抽取的牌阵</span><span class="status-value">8 种</span></div><div class="status-row"><span>当前浏览器保存</span><span class="status-value">${storageOK?'可写入':'不可用，请导出'}</span></div><p class="notice">这个检查确认当前页面能载入内容。要确认手机离线体验，还需要在手机上开飞行模式、退出重开，并检查记录是否保留。</p><button class="secondary wide" data-action="sources">查看来源与 Demo 范围</button>`);}
  function sources(){modal={type:'sources'};showModal(`${sheetHead('内容与来源')}<p>78 张牌来自 Wikimedia Commons 的历史 Rider–Waite–Smith 牌图。插画为 Pamela Colman Smith；对应文件页标注公共领域。图片保留完整构图。</p><div class="source-list"><p>图片来源、版本与许可标签已随单文件内嵌。下面的外部来源链接仅用于查证。</p>${(window.TAROT_ASSET_SOURCES?.items||[]).map(a=>`<p><a href="${esc(a.source_page)}" target="_blank" rel="noopener noreferrer">${esc(cardMap[a.card_id]?.name)}</a> · ${esc(a.visual_edition)} · ${esc(a.license_status_as_listed)}</p>`).join('')}${[...(DATA.sources||[]),...(window.TAROT_READING_DECK.sources||[]),...(window.TAROT_SPREAD_CONTENT.sources||[])].map(s=>`<p>${esc(s.title)}<br>${/^https:\/\//.test(s.url)?`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.url)}</a>`:esc(s.url)}</p>`).join('')}<p><a href="https://commons.wikimedia.org/wiki/Category:Rider-Waite_tarot_deck" target="_blank" rel="noopener noreferrer">Wikimedia Commons · RWS 牌图来源</a></p></div><div class="notice">此 Demo 用于体验学习流程，内容是原创教学示例，不把一种解读当作唯一真理。来源链接需联网，核心学习不需要访问它们。</div>`);}
  function exportState(){const blob=new Blob([JSON.stringify({app:'tarot-pocket-demo',version:1,exportedAt:new Date().toISOString(),state,learning:learning.export(),reading:reading.export()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`tarot-learning-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已请求导出，请确认浏览器的文件保存位置。');}
  function feedback(){modal={type:'feedback'};showModal(`${sheetHead('这次体验怎么样？')}<p class="muted">点击一个最接近的感受，记录在当前浏览器。你也可以直接回到对话告诉我。</p><div class="buttonstack">${['顺手，愿意继续学','选项有挑战，解析也有帮助','题目太难，需要更多先学内容','解析太长，想更快看重点','操作不顺，想调整页面'].map(t=>`<button class="secondary" data-action="feedback-save" data-text="${t}">${t}</button>`).join('')}</div><p class="subtleline">本机已记录 ${state.feedback.length} 条体验感受，导出学习记录时会一并带上。</p>`);}
  document.addEventListener('click',event=>{
    const el=event.target.closest('[data-action]');
    if(!el){if(event.target.dataset.backdrop)closeModal();return;}
    const action=el.dataset.action;
    if(action==='nav')go(el.dataset.page);
    else if(action==='start')startSession(el.dataset.mode);
    else if(action==='resume')go('study');
    else if(action==='filter'){filter=el.dataset.value;render();}
    else if(action==='card')showCard(el.dataset.id);
    else if(action==='close'){if(modal?.type==='zoom' && zoomReturn){const back=zoomReturn;zoomReturn=null;showCard(back.id,back.face,back.position);}else closeModal();}
    else if(action==='status')checkStatus();
    else if(action==='sources')sources();
    else if(action==='draw'){const c=cardMap[currentQuestion().cardId];state.session.phase=seenIDs().includes(c.id)?'question':'intro';persist();render();window.scrollTo(0,0);}
    else if(action==='intro-next'){state.session.phase='question';persist();render();window.scrollTo(0,0);}
    else if(action==='hint'){state.session.hint=true;persist();const y=window.scrollY;render();window.scrollTo(0,y);}
    else if(action==='answer')answer(el.dataset.value);
    else if(action==='unknown')answer(null);
    else if(action==='confidence')confidence(el.dataset.value);
    else if(action==='next')next();
    else if(action==='zoom'){
      const id=el.dataset.id;if(!cardMap[id])return;
      zoomReturn=modal?.type==='card'?{...modal}:null;modal={type:'zoom'};
      showModal(`<div class="zoom-backdrop" role="dialog" aria-modal="true" aria-label="放大牌图"><button class="iconbtn" data-action="close" aria-label="关闭放大">${icon('close')}</button>${el.dataset.hide==='1'?`<div style="position:relative;max-height:85dvh">${img(id,'style="display:block;max-height:80dvh;max-width:85vw"')}<div style="position:absolute;bottom:0;left:0;right:0;height:7%;background:#eee9d5"></div></div>`:img(id)}</div>`,'zoom');
    }
    else if(action==='face' && modal?.type==='card')showCard(modal.id,el.dataset.value,modal.position);
    else if(action==='detail-position' && modal?.type==='card')showCard(modal.id,modal.face,el.dataset.value);
    else if(action==='save'){const id=el.dataset.id;state.saved=state.saved.includes(id)?state.saved.filter(x=>x!==id):[...state.saved,id];persist();showCard(id,modal?.face||'upright',modal?.position||'present');}
    else if(action==='card-practice'){const id=el.dataset.id;closeModal();startSession('card',id);}
    else if(action==='spread')openSpread(el.dataset.id);
    else if(action==='position'){spread.active=Number(el.dataset.index);const y=window.scrollY;render();window.scrollTo(0,y);}
    else if(action==='spread-answer'){spread.selected=Number(el.dataset.index);const y=window.scrollY;render();window.scrollTo(0,y);}
    else if(action==='spread-retry'){spread.selected=null;render();}
    else if(action==='spread-free'){spread.ids=shuffle(cards.map(c=>c.id)).slice(0,spreadDefs[spread.id].ids.length);spread.free=true;spread.active=0;spread.selected=null;render();window.scrollTo(0,0);}
    else if(action==='advance'){state.offsetDays=Math.min(365,state.offsetDays+3);persist();render();toast('演示日期向后移动了三天。');}
    else if(action==='clock-reset'){state.offsetDays=0;persist();render();toast('已回到真实日期。');}
    else if(action==='export')exportState();
    else if(action==='import')document.getElementById('import-file').click();
    else if(action==='confirm-import' && restoreCandidate){if(restoreLearningCandidate)learning.restore(restoreLearningCandidate);if(restoreReadingCandidate)reading.restore(restoreReadingCandidate);state=restoreCandidate;persist();closeModal();go('me');toast('学习记录已恢复。');}
    else if(action==='feedback')feedback();
    else if(action==='feedback-save'){state.feedback.push({text:el.dataset.text,at:Date.now()});persist();closeModal();toast('已记在本机，也欢迎在对话里直接告诉我。');}
    else if(action==='reset'){modal={type:'reset'};showModal(`${sheetHead('重新开始体验？')}<p>将清空本 Demo 的学习单元、练习、抽牌记录、收藏和演示日期。不会影响其他网站或文件。可以先导出备份。</p><div class="buttonstack"><button class="secondary" data-action="export">先导出记录</button><button class="primary" data-action="confirm-reset">清空本 Demo 记录</button><button class="linkbtn" data-action="close">保留，继续体验</button></div>`);}
    else if(action==='confirm-reset'){state=fresh();learning.reset();reading.reset();persist();closeModal();go('home');toast('已回到最初的体验状态。');}
  });
  document.getElementById('import-file').addEventListener('change',async event=>{
    const file=event.target.files[0];event.target.value='';if(!file)return;
    try{if(file.size>5*1024*1024)throw new Error('文件太大');const input=JSON.parse(await file.text());if(input.app!=='tarot-pocket-demo')throw new Error('不是本 Demo 的记录');const candidate=validateState(input.state,false);const candidateLearning=input.learning===undefined?null:learning.validate(input.learning);const candidateReading=input.reading===undefined?null:reading.validate(input.reading);showModal(`${sheetHead('恢复这份学习记录？')}<p>这份记录包含 ${candidate.history.length} 次练习和 ${candidate.saved.length} 张收藏，将替换当前快练记录。${candidateLearning?`另含 ${candidateLearning.history.length} 次学习单元记录，将一并恢复单元进度。`:"这是旧版备份，保留当前新增学习单元的记录。"}${candidateReading?`另含 ${candidateReading.history.length} 组抽牌记录及当前牌桌进度，将一并恢复。`:"备份未含抽牌记录时，保留当前牌桌。"}旧版未完成快练题组不会导入。</p><div class="buttonstack"><button class="secondary" data-action="export">先备份当前记录</button><button class="primary" data-action="confirm-import">恢复这份记录</button><button class="linkbtn" data-action="close">取消</button></div>`);modal={type:'import'};restoreCandidate=candidate;restoreLearningCandidate=candidateLearning;restoreReadingCandidate=candidateReading;}catch(error){toast('无法导入：请使用本 Demo 导出的完整 JSON 文件。');}
  });
  document.addEventListener('keydown',event=>{
    if(!document.getElementById('overlay').children.length)return;
    if(event.key==='Escape'){event.preventDefault();closeModal();}
    if(event.key==='Tab'){const controls=[...document.querySelectorAll('#overlay button,#overlay a,#overlay input,#overlay [tabindex="0"]')];const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}
  });
  window.addEventListener('pagehide',persist);
  if(state.session && state.session.phase!=='complete')page='home';
  window.TAROT_LEARNING.units.push(...window.TAROT_SPREAD_CONTENT.units);
  const reading = window.createTarotReading({esc,img,icon,go,toast,now});
  const learning = window.createTarotLearning({esc,img,icon,shuffle,go,now,toast,cardMap});
  render();
})();
