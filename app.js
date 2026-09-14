(() => {
  'use strict';
  const DATA = window.TAROT_CONTENT;
  const root = document.getElementById('app');
  if (!DATA?.cards?.length || !DATA?.questions?.length) {
    root.innerHTML = '<p class="startup">学习内容未能载入。请使用完整的离线文件重新打开。</p>';
    return;
  }
  const baseCards = Object.fromEntries(DATA.cards.map(c=>[c.id,c]));
  const cards = window.TAROT_READING_DECK.cards.map(c=>({...c,...baseCards[c.id],contexts:c.contexts,questions:c.questions,clues:baseCards[c.id]?.clues||[{label:'画面',detail:c.observation}],positions:baseCards[c.id]?.positions||{present:c.core,obstacle:'检查这一主题是否表达过度或受阻：'+c.core,advice:'结合问题，把这一主题转成可尝试的行动：'+c.core},compare:baseCards[c.id]?.compare||null}));
  const questions = DATA.questions;
  const cardMap = Object.fromEntries(cards.map(c => [c.id, c]));
  const questionMap = Object.fromEntries(questions.map(q => [q.id, q]));
  const KEY = 'tarot-pocket-demo-v1';
  const DAY = 86400000;
  const fresh = () => ({version:1,history:[],saved:[],viewed:[],journey:window.TarotJourney.blank(),schedules:{},session:null,offsetDays:0,feedback:[]});
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
  let modalPageY=0,cardTrail=[];
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
  const learnedIDs = () => Object.keys(state.journey.cards).filter(id=>state.journey.cards[id].rounds>0);

  function validateState(input, keepSession=true) {
    if (!input || input.version !== 1 || !Array.isArray(input.history) || input.history.length>10000) throw new Error('不支持的记录格式');
    const out=fresh();
    out.history=input.history.filter(h=>h && questionMap[h.qid] && cardMap[h.cardId] && typeof h.at==='number' && Number.isFinite(h.at) && typeof h.correct==='boolean').map(h=>({id:String(h.id).slice(0,90),qid:h.qid,cardId:h.cardId,at:h.at,correct:h.correct,confidence:h.confidence==='sure'?'sure':'unsure',hint:!!h.hint,selected:typeof h.selected==='string'?h.selected:null}));
    out.saved=Array.isArray(input.saved)?[...new Set(input.saved.filter(id=>cardMap[id]))]:[];
    out.viewed=Array.isArray(input.viewed)?[...new Set(input.viewed.filter(id=>cardMap[id]))]:[];
    out.journey=window.TarotJourney.validate(input.journey,cards.map(c=>c.id));
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
  function topbar(){return `<header class="topbar"><button class="brand" data-action="nav" data-page="home"><span class="brandmark" aria-hidden="true">✧</span>塔罗随身学</button><div class="toplinks"><button class="toplinkbtn" data-action="nav" data-page="me">记录</button><button class="iconbtn" data-action="status" aria-label="查看本机内容状态">${icon('cloud')}</button></div></header>`;}
  function nav(){return `<nav class="bottomnav" aria-label="主要导航"><div class="navinner">${[['home','首页','home'],['library','学牌','practice'],['reading','抽牌','cards']].map(([id,label,ico])=>`<button class="navitem ${page===id?'active':''}" data-action="nav" data-page="${id}" ${page===id?'aria-current="page"':''}><span class="iconwrap">${icon(ico)}</span>${label}</button>`).join('')}</div></nav>`;}
  function shell(body){const focused=page==='reading'&&reading.isFocused();return `<div class="shell ${focused?'reading-focus':''}">${topbar()}${!storageOK?'<div class="storage-warning">当前打开方式无法持久保存记录。你仍可体验，并在「记录」导出学习记录。</div>':''}${body}</div>${focused?'':nav()}`;}
  function render(){
    if(page==='journey')root.innerHTML=journey.render();
    else if(page==='learning')root.innerHTML=learning.render();
    else if(page==='study')root.innerHTML=renderStudy();
    else if(page==='spread')root.innerHTML=shell(renderSpread());
    else if(page==='library')root.innerHTML=shell(renderLibrary());
    else if(page==='reading')root.innerHTML=shell(reading.render());
    else if(page==='spread-guide')root.innerHTML=shell(reading.renderGuide());
    else if(page==='me')root.innerHTML=shell(renderMe());
    else root.innerHTML=shell(renderHome());
    root.querySelectorAll('img').forEach(image=>image.addEventListener('error',()=>{image.alt='图片未能载入，请使用完整离线文件';image.style.background='var(--soft)';},{once:true}));
  }
  function go(destination){page=destination==='practice'?'home':destination;closeModal();render();window.scrollTo(0,0);}
  function renderHome(){
    const id=journey.recommendation(), c=id?cardMap[id]:null;
    const due=journey.due().length, finished=learnedIDs().length;
    return `<div class="home-simple"><div class="eyebrow">TAROT POCKET</div><h1>记住一张，<br>多懂一点。</h1><p>学哪张，由你决定。每次理解，都接着上次积累。</p><div class="home-decisions"><section class="home-learning-choice"><button class="home-choice learn-choice" data-home-choice data-journey="new"><span class="home-choice-art">${c?img(c.id)+img(journey.lesson(c.id).compareId):img('m17')+img('m19')}</span><span class="home-choice-copy"><small>${c?'下一张还没学过':'你的完整牌库'}${c?' · '+esc(c.name):''}</small><strong>随机学一张</strong><span>从一幅画面出发，推导、换位，再独立回忆。</span></span>${icon('arrow')}</button><div class="home-learning-actions"><button class="secondary" data-action="choose-cards">自己选牌</button>${journey.active()?`<button class="linkbtn continue-resume" data-journey="continue"><span>接着上次</span> · ${esc(cardMap[state.journey.session.cardId].name)}</button>`:''}${due?`<button class="linkbtn" data-journey="review"><span>到期复习</span> · ${due}</button>`:''}</div><p class="home-progress-note"><span>已完成初学</span> ${finished} / 78 · <span>进度自动保存</span></p></section><button class="home-choice reading-choice" data-home-choice data-action="nav" data-page="reading"><span class="home-spread-art"><i></i><i></i><i></i></span><span class="home-choice-copy"><small>随身牌桌 · 塔罗日运</small><strong>为自己抽牌</strong><span>按生活场景选阵，洗牌、切牌，揭开你的牌</span></span>${icon('arrow')}</button></div></div>`;
  }
  let librarySearch='',libraryView='cards';
  function libraryCards(){
    const learned=new Set(learnedIDs()),due=new Set(journey.due());
    const pool=filter==='收藏'?cards.filter(c=>state.saved.includes(c.id)):filter==='已学习'?cards.filter(c=>learned.has(c.id)):filter==='待巩固'?cards.filter(c=>journey.level(c.id)==='待巩固'):filter==='待复习'?cards.filter(c=>due.has(c.id)):filter==='学习中'?cards.filter(c=>journey.record(c.id)&&!journey.record(c.id).rounds):filter==='未学习'?cards.filter(c=>!journey.record(c.id)):filter==='全部'?cards:cards.filter(c=>c.suit===filter);
    const shown=pool.filter(c=>(c.name+' '+c.en+' '+c.keywords.join(' ')).toLowerCase().includes(librarySearch.toLowerCase()));
    return `<div class="library-grid">${shown.map(c=>`<button class="library-card ${learned.has(c.id)?'is-learned':''}" data-action="card" data-id="${c.id}">${img(c.id,'loading="lazy"')}<div class="library-card-copy"><small>${esc(c.suit)}${c.element&&c.element!=='—'?' · '+esc(c.element):''}</small><h3>${esc(c.name)}</h3><p>${esc(journey.lesson(c.id).anchor)}</p>${journey.progress(c.id)}</div></button>`).join('')}</div>${shown.length?'':'<p class="empty">这里暂时没有牌。切换「全部」或换一个关键词。</p>'}`;
  }
  function renderLibrary(){
    return `<div class="pagehead library-head"><div class="eyebrow">YOUR GROWING DECK</div><h1>今天想认识哪张？</h1><p>78 张牌都可以直接选择，没有锁定的学习顺序。</p></div><div class="library-views" aria-label="学习内容">${[['cards','78 张牌'],['foundations','基础知识'],['spreads','学牌阵']].map(([id,label])=>`<button class="${libraryView===id?'active':''}" data-action="library-view" data-value="${id}" aria-pressed="${libraryView===id}">${label}</button>`).join('')}</div><section data-library-section="cards" ${libraryView==='cards'?'':'hidden'}>${journey.active()?`<div class="library-resume"><span><span>上次学到</span> · <strong>${esc(cardMap[state.journey.session.cardId].name)}</strong></span><button class="linkbtn" data-journey="continue">继续学习 ${icon('arrow')}</button></div>`:''}<div class="library-tools"><label><span class="sr-only">搜索牌名或关键词</span><input class="library-search" data-library-search type="search" placeholder="找一张牌…" value="${esc(librarySearch)}"></label><button class="secondary" data-journey="new">学一张新牌</button></div><div class="chips">${['全部','未学习','学习中','已学习','待复习','待巩固','大阿尔卡纳','权杖','圣杯','宝剑','星币','收藏'].map(f=>`<button class="chip ${filter===f?'active':''}" data-action="filter" data-value="${f}" aria-pressed="${filter===f}">${f}</button>`).join('')}</div><div data-library-results>${libraryCards()}</div></section><section data-library-section="foundations" ${libraryView==='foundations'?'':'hidden'}><div class="knowledge-intro"><h2>先看共同点，再看每张牌的不同。</h2><p>把元素、数字与人物动作连起来，牌义才更容易记住。</p></div><div class="knowledge-grid">${[['elements','四元素','四种表达领域','w01'],['numbers','数字 1–10','共同的发展节奏','p04'],['arcana','大小阿尔卡纳','人生主题与日常经验','m00'],['court','宫廷牌','角色与行动风格','c12']].map(([id,title,sub,card])=>`<button data-action="knowledge" data-value="${id}">${img(card)}<span><strong>${title}</strong><small>${sub}</small></span></button>`).join('')}</div><p class="notice">基础知识是理解线索，仍要回到真实画面核对。</p></section><section data-library-section="spreads" ${libraryView==='spreads'?'':'hidden'}><div class="knowledge-intro"><h2>把牌真正摆出来，边看边学。</h2><p>先看每个位置在问什么，再读单牌和整组主线。</p></div><div class="library-spread-lessons">${[['one','单牌聚焦','m09'],['three','现状 · 阻碍 · 建议','w01,p04,p08'],['choice','双路径比较 · 教学示例','m01,p04,p08,w01,c08,s06']].map(([id,title,ids])=>`<button data-action="spread" data-id="${id}"><span class="lesson-layout lesson-layout-${id}">${ids.split(',').map((card,i)=>`<span>${img(card)}<small>${i+1}</small></span>`).join('')}</span><strong>${title}</strong><small>看布局，再进入教学案例</small></button>`).join('')}</div><details class="advanced-learning"><summary>牌阵与进阶课程</summary>${window.TAROT_LEARNING.units.map(u=>`<button class="practice-row" data-learn-start="${u.id}"><span><strong>${esc(u.title)}</strong><p>${esc(u.subtitle)}</p></span>${icon('arrow')}</button>`).join('')}<div class="legacy-quick learning-progress"><p>保留早期快练及其记录，可随时继续。</p><button class="secondary" data-action="${state.session&&state.session.phase!=='complete'?'resume':'start'}" data-mode="daily">${state.session&&state.session.phase!=='complete'?'继续上次':'混合快练'}</button></div></details></section>`;
  }

  function renderPractice(){return `<div class="pagehead"><div class="eyebrow">UNDERSTAND, THEN REMEMBER</div><h1>把理解，练成直觉。</h1><p>选一个你想试试的方向。</p></div><section class="section learn-unit-links"><h2>完整学习单元</h2>${[["p04","把星币四记牢 · 12 步"],["structure","元素与数字实验室 · 8 步"],["case","拼出你的三牌解读 · 7 步"],["return","换情境复习 · 最多 5 步"]].map(([id,title])=>`<button class="practice-row" data-learn-start="${id}"><strong>${title}</strong>${icon("arrow")}</button>`).join("")}</section><div class="section feature-grid"><button class="feature" data-action="start" data-mode="review"><div><span class="feature-icon">${icon('repeat')}</span><h3>找回熟悉感</h3><p>${dueIDs().length?'有 '+dueIDs().length+' 个知识点到期':'复习做过的题，看看还记得吗'}</p></div></button><button class="feature" data-action="start" data-mode="structure"><div><span class="feature-icon">${icon('leaf')}</span><h3>元素与数字</h3><p>从共同的结构，读出不同的牌</p></div></button></div><section class="section"><div class="sectionhead"><h2>辨析与应用</h2><span class="tiny muted">不用输入答案</span></div>${[['compare','01','分清相近的含义','不是看哪个选项最好听，而是找依据。'],['context','02','同一张牌，换个位置','在现状位与建议位，表达应该怎样变？'],['reversal','03','逆位，不只是相反','加入具体情境，再看能量怎样表达。']].map(([mode,n,title,sub])=>`<button class="practice-row" data-action="start" data-mode="${mode}"><span class="practice-number">${n}</span><span class="practice-text"><h3>${title}</h3><p>${sub}</p></span>${icon('arrow')}</button>`).join('')}</section><section class="section"><div class="sectionhead"><h2>你的第一张牌桌</h2><span class="tiny muted">3 种牌阵</span></div>${[['one','1','单牌聚焦','围绕一个问题，观察一张牌。'],['three','3','现状 · 阻碍 · 建议','把三张牌的含义连接起来。'],['choice','6','双路径比较 · 教学示例','用同样的维度，比较两种选择。']].map(([id,n,title,sub])=>`<button class="practice-row" data-action="spread" data-id="${id}"><span class="practice-number">${n}</span><span class="practice-text"><h3>${title}</h3><p>${sub}</p></span>${icon('arrow')}</button>`).join('')}</section>`;}
  function renderMe(){return `<div class="pagehead"><div class="eyebrow">YOUR OWN PACE</div><h1>每一点理解，都留下来。</h1><p>真实的回忆与应用，会在一次次重逢中积累。</p></div>${journey.dashboard()}${reading.dashboard()}<section class="section"><h2>保存与离线</h2><div class="setting-row"><div><strong>学习与抽牌记录</strong><p>保存在当前浏览器，换设备前请导出。</p></div><button class="secondary" data-action="export">导出</button></div><div class="setting-row"><div><strong>恢复备份</strong><p>支持以前版本导出的记录。</p></div><button class="secondary" data-action="import">导入</button></div><button class="secondary wide" data-action="status">检查离线内容与安装</button></section><details class="advanced-learning"><summary>早期课程与练习记录</summary>${learning.dashboard()}<p><span>快练作答次数</span> · ${state.history.length}</p><p><span>待复习</span> · ${dueIDs().length}</p><button class="secondary" data-action="start" data-mode="review">复习旧版快练</button><details><summary>开发验收日期工具</summary><p>仅调整旧版练习和当前学习的本机计算日期；验证后请恢复。</p><button class="secondary" data-action="advance">模拟 3 天后</button><button class="linkbtn" data-action="clock-reset">回到真实日期</button><p>${date(now())}</p></details></details><section class="section"><button class="linkbtn" data-action="feedback">记录感受</button><br><button class="linkbtn" data-action="reset">重置本机记录</button></section>`;}

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
  function startNextCard(){
    const current=new Set((state.session?.ids||[]).map(id=>questionMap[id]?.cardId));
    const candidates=[...new Set(questions.map(q=>q.cardId))].filter(id=>!current.has(id));
    const learned=new Set(learnedIDs());
    const nextId=candidates.find(id=>!learned.has(id))||candidates[0];
    if(!nextId){toast('当前可练习的牌已经完成，可以回到牌库选择任意牌继续学习。');go('library');return;}
    startSession('card',nextId);
  }
  function renderComplete(){const s=state.session;const events=s.results.map(id=>state.history.find(h=>h.id===id)).filter(Boolean);const correct=events.filter(h=>h.correct).length;const cardMode=s.mode==='card';return `<section class="complete fade-in"><div class="seal">${icon('leaf')}</div><div class="eyebrow">A LITTLE MORE UNDERSTANDING</div><h1>又多懂了一点。</h1><p>完成 ${events.length} 个练习，首次选对 ${correct} 题。<br>能说出依据，比一次选对更重要。</p><div class="section">${[...new Set(events.map(h=>h.cardId))].map(id=>`<div class="resultline">${img(id)}<span class="text"><strong>${esc(cardMap[id].name)}</strong><small>${esc(cardMap[id].core)}</small></span></div>`).join('')}</div><p class="tiny">这些内容已经进入演示复习队列。<br>刚刚答对不代表已经长期掌握。</p><div class="complete-actions"><button class="primary" data-action="${cardMode?'next-card':'start'}" data-mode="daily">${cardMode?'继续学下一张牌':'继续下一组'} ${icon('arrow')}</button><button class="secondary" data-action="nav" data-page="library">回到牌库选择</button><button class="linkbtn" data-action="feedback">记下这次体验感受</button></div></section>`;}

  const spreadDefs={one:{name:'单牌聚焦',subtitle:'用一张牌，观察一个具体问题。',labels:['本次关注点'],ids:['m09'],scenario:'当外界建议很多，我现在最值得关注什么？'},three:{name:'现状 · 阻碍 · 建议',subtitle:'每个位置问的问题不同，同一张牌的表达也会改变。',labels:['现状','阻碍','建议'],ids:['w01','p04','p08'],scenario:'我想开始一个新项目，但一直没有真正推进。接下来可以怎么做？'},choice:{name:'双路径比较 · 教学示例',subtitle:'用相同的三个维度比较，不把某一张牌当成决定。',labels:['A · 资源','A · 代价','A · 发展','B · 资源','B · 代价','B · 发展'],ids:['m01','p04','p08','w01','c08','s06'],scenario:'面对「在熟悉的领域深耕」和「试一个新方向」，我可以怎样比较？'}};
  function openSpread(id){if(!spreadDefs[id])return;spread={id,ids:[...spreadDefs[id].ids],active:0,mode:'guide',free:false,selected:null,step:0,match:null};go('spread');}
  function renderSpread(){if(!spread)return renderPractice();const d=spreadDefs[spread.id];const c=cardMap[spread.ids[spread.active]];const notes={one:['这张牌只回答本次关注点。隐士在这里可以提示：先减少外界声音，确认自己的判断标准。'],three:['权杖王牌提示一个新动机或创造起点。现状位描述已有的能量，还不等于项目已经落实。','星币四在阻碍位，可以指向过度紧守既有资源或控制感，让新尝试难以发生。','星币八在建议位，可以把关注点落在持续练习、改进细节和小规模的实际行动上。'],choice:['魔术师：熟悉方向中已有的技能与可调用资源。','星币四：维持稳定也可能使投入空间变小，要检查是否过度保守。','星币八：若持续精进，可能形成更扎实的执行能力。','权杖王牌：新方向带来的热情与起步动力。','圣杯八：可能需要放下原有投入或熟悉的满足感。','宝剑六：更像逐渐过渡和调整，并不等于立刻到达理想状态。']};
    return `<div class="spread-intro"><button class="iconbtn" data-action="nav" data-page="library" aria-label="返回学牌阵">${icon('back')}</button><div><div class="eyebrow">${spread.free?'自由练习':'教学示例'} · SPREAD STUDIO</div><h1>${d.name}</h1></div></div><p class="muted">${d.subtitle}</p><div class="scenario section"><strong>这一次的问题</strong>${d.scenario}</div><div class="spread-board ${spread.id==='one'?'one':spread.id==='three'?'three':'six'}">${spread.ids.map((id,i)=>`<button class="spread-slot ${spread.active===i?'active':''}" data-action="position" data-index="${i}" aria-pressed="${spread.active===i}">${img(id)}<span class="spread-label">${i+1} · ${d.labels[i]}</span><span class="spread-name">${esc(cardMap[id].name)}</span></button>`).join('')}</div><div class="position-panel"><div class="eyebrow">点一张牌，看看这个位置在问什么</div><h3>${d.labels[spread.active]} · ${esc(c.name)}</h3><p>${spread.free?esc(c.core)+' '+esc(spread.id==='three'?c.positions[['present','obstacle','advice'][spread.active]]:spread.id==='one'?c.positions.present:'先判断它描述的是资源、代价还是发展，再放进问题里。'):notes[spread.id][spread.active]}</p><button class="linkbtn" data-action="card" data-id="${c.id}">看这张牌的图像依据</button></div>${renderSpreadExercise()}<div class="spread-actions"><button class="secondary" data-action="nav" data-page="library">继续看其他教学牌阵</button></div><p class="mode-note">${spread.free?'自由练习不会自动判定解读正确。先观察图像，再检查是否回答了牌位的问题。':'这是预先写好的教学案例，展示一种有依据的解读。它不代表对现实结果的确定预测。'}</p>`;
  }
  function renderSpreadExercise(){if(spread.free)return '';if(spread.id==='three'){
    const texts=['想法已经出现，但对已有资源的紧守限制了行动；先通过持续的小步实践推进。','想法已经出现，但多项事务之间切换造成分心；先通过重新分配时间推进。','想法已经出现，但旧的情绪联结妨碍了转身；先通过告别原有投入推进。','想法已经出现，但表达和沟通尚未取得共识；先通过协调不同意见推进。'];
    return `<section class="section"><div class="eyebrow">把三张牌连起来</div><h2>哪一句，照顾到了三个位置？</h2><div class="options">${texts.map((t,i)=>`<button class="option ${spread.selected!==null?(i===0?'correct':i===spread.selected?'incorrect':''):''}" data-action="spread-answer" data-index="${i}" ${spread.selected!==null?'disabled':''}><span class="letter">${String.fromCharCode(65+i)}</span><span>${t}</span></button>`).join('')}</div>${spread.selected!==null?`<div class="position-panel" role="status"><h3>${spread.selected===0?'✓ 答对了':'✕ 答错了 · 请核对阻碍位的依据'}</h3><p>权杖王牌对应起步动力；星币四对应对既有资源的控制；星币八强调持续实践。其他选项中的分心、告别或协调，并非这组三张牌最直接支持的重点。</p><button class="linkbtn" data-action="spread-retry">收起解释，再看一次</button></div>`:''}</section>`;
    }
    if(spread.id==='one')return `<section class="section"><h2>把观察变成一句话</h2><p class="context">点选一个最贴近这张牌的关注方向。</p><div class="options">${['先确认我真正认同的方向，而不是不断收集更多意见。','先恢复近期消耗的力量，而不是继续加快行动。','先放下已经没有意义的投入，再寻找新的满足。'].map((t,i)=>`<button class="option ${spread.selected!==null?(i===0?'correct':i===spread.selected?'incorrect':''):''}" data-action="spread-answer" data-index="${i}" ${spread.selected!==null?'disabled':''}><span class="letter">${String.fromCharCode(65+i)}</span><span>${t}</span></button>`).join('')}</div>${spread.selected!==null?`<div class="hint" role="status"><strong>${spread.selected===0?'✓ 答对了':'✕ 答错了'}</strong><br>隐士的独处与灯光，可以支持「寻找自己的方向」。另外两句可能是合理建议，但更接近宝剑四的休整、圣杯八的离开。</div>`:''}</section>`;
    return `<section class="section"><h2>先读懂位置，再读牌</h2><p class="context">A 方向的第二张是「代价」。这个位置主要问什么？</p><div class="options">${['为了选择 A，我可能需要承担或放弃什么？','如果选择 A，我已经能够调用什么优势？','如果选择 A，沿当前条件可能怎样发展？'].map((t,i)=>`<button class="option ${spread.selected!==null?(i===0?'correct':i===spread.selected?'incorrect':''):''}" data-action="spread-answer" data-index="${i}" ${spread.selected!==null?'disabled':''}><span class="letter">${String.fromCharCode(65+i)}</span><span>${t}</span></button>`).join('')}</div>${spread.selected!==null?`<div class="hint" role="status"><strong>${spread.selected===0?'✓ 答对了':'✕ 答错了'}</strong><br>这里应先找出选择的代价，再看星币四怎样描述它。不能因为牌面看起来稳定，就直接把这个位置读成优势。</div>`:''}</section>`;
  }

  function showModal(html,type='sheet'){
    const overlay=document.getElementById('overlay');
    if(!overlay.children.length){lastFocus=document.activeElement;modalPageY=window.scrollY;document.body.style.position='fixed';document.body.style.top=`-${modalPageY}px`;document.body.style.width='100%';}
    overlay.innerHTML=type==='zoom'?html:`<div class="modal-backdrop" data-backdrop="true"><section class="sheet" role="dialog" aria-modal="true" aria-label="详细内容" tabindex="-1">${html}</section></div>`;
    document.body.style.overflow='hidden';requestAnimationFrame(()=>overlay.querySelector('.sheethead [data-action=close],button')?.focus({preventScroll:true}));
  }
  function closeModal(){
    const open=document.getElementById('overlay').children.length;
    document.getElementById('overlay').replaceChildren();document.body.style.overflow='';document.body.style.position='';document.body.style.top='';document.body.style.width='';
    modal=null;restoreCandidate=null;restoreLearningCandidate=null;restoreReadingCandidate=null;zoomReturn=null;cardTrail=[];
    if(open)window.scrollTo(0,modalPageY);if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});lastFocus=null;
  }
  function captureSheet(){return {modal:{...modal},nodes:[...document.getElementById('overlay').childNodes],scroll:document.querySelector('#overlay .sheet')?.scrollTop||0,focus:document.activeElement};}
  function restoreSheet(snapshot){document.getElementById('overlay').replaceChildren(...snapshot.nodes);modal=snapshot.modal;if(modal?.type==='card')patchCardDetail();const sheet=document.querySelector('#overlay .sheet');if(sheet)sheet.scrollTop=snapshot.scroll;if(snapshot.focus?.isConnected)snapshot.focus.focus({preventScroll:true});}
  function dismissOverlay(){if(modal?.type==='zoom'&&zoomReturn){const back=zoomReturn;zoomReturn=null;restoreSheet(back);}else closeModal();}
  function sheetHead(title,language=false){return `<div class="sheethead"><h2>${esc(title)}</h2>${language?`<button class="linkbtn dossier-language" data-action="detail-language" data-i18n-ignore aria-label="Switch language">${window.TAROT_I18N.locale==='en'?'中文':'EN'}</button>`:''}<button class="iconbtn" data-action="close" aria-label="关闭">${icon('close')}</button></div>`;}
  const detailTopics={love:'感情',career:'事业',study:'学业'};
  const detailRoles={present:'现状',obstacle:'阻碍',advice:'建议'};
  const contextRoles={present:'state',obstacle:'tension',advice:'advice'};
  function dossierLens(c,lesson,lens){return [c.observation,lesson.why,c.core][lens]||c.observation;}
  function dossierContext(c,topic){const ctx=c.contexts[topic];return `<p class="dossier-question"><span>带着一个问题看：</span>${esc(c.questions[topic])}</p><table class="dossier-matrix"><caption>同一张牌，三个位置</caption><thead><tr><th scope="col">牌位</th><th scope="col">在这里怎样读</th></tr></thead><tbody>${Object.entries(detailRoles).map(([key,label])=>`<tr data-matrix-role="${key}"><th scope="row">${label}</th><td>${esc(ctx[contextRoles[key]])}</td></tr>`).join('')}</tbody></table>`;}
  function showCard(id,face='upright',position='present'){
    const c=cardMap[id];if(!c)return;const lesson=journey.lesson(id),r=journey.record(id),near=cardMap[lesson.compareId];
    const readingOnly=modal?.readingOnly||['reading','spread-guide'].includes(page);
    if((modal?.type==='card'&&modal.id!==id)||modal?.type==='knowledge')cardTrail.push(captureSheet());
    modal={type:'card',id,face,position,readingOnly,topic:'career',lens:0};
    showModal(`${sheetHead(c.name,true)}${cardTrail.length?'<button class="linkbtn" data-action="card-back">返回上一步</button>':''}<div class="detail-hero dossier-hero"><button class="dossier-cover" data-action="zoom" data-id="${id}" aria-label="放大牌面">${img(id,face==='reversed'?'class="reversed-img"':'')}<span>${icon('zoom')}<span>放大观察</span></span></button><div><div class="eyebrow">${esc(c.en)}</div><div class="dossier-identity"><span>${esc(c.suit)}</span><span>${esc(c.number)}</span></div><p class="memory-anchor">${esc(lesson.anchor)}</p><div class="dossier-keywords">${c.keywords.map(x=>`<span>${esc(x)}</span>`).join('')}</div>${readingOnly?'':journey.progress(id)}</div></div><div class="detail-start">${readingOnly?'':`<button class="primary" data-journey="start" data-id="${id}">${r?.rounds?'换个角度复习':r?'继续学习':'开始完整学习'} ${icon('arrow')}</button>`}<button class="secondary" data-action="save" data-id="${id}" aria-pressed="${state.saved.includes(id)}">${state.saved.includes(id)?'已收藏':'收藏'}</button></div><nav class="dossier-nav" aria-label="牌义手册章节">${[['scene','看图'],['meaning','牌义'],['use','运用'],['compare','对照']].map(([v,t])=>`<button data-action="dossier-jump" data-value="${v}">${t}</button>`).join('')}</nav><div class="card-dossier">
      <section class="dossier-chapter" data-dossier-section="scene"><div class="dossier-chapter-title"><span>01</span><div><small>从画面到理解</small><h3>先看见，再解释</h3></div></div><div class="dossier-lenses" aria-label="观察与解释">${['画面事实','象征联系','核心主题'].map((t,i)=>`<button data-action="dossier-lens" data-value="${i}" aria-pressed="${i===0}"><b>${i+1}</b><span>${t}</span></button>`).join('')}</div><div class="dossier-lens-note" aria-live="polite"><p data-dossier-lens-copy>${esc(c.observation)}</p></div><p class="dossier-editorial">${esc(window.TAROT_CARD_NOTES[id])}</p></section>
      <details open class="dossier-chapter" data-dossier-section="meaning"><summary>核心牌义与正逆位</summary><div class="segmented" aria-label="牌的方向"><button data-action="face" data-value="upright" aria-pressed="${face==='upright'}" class="${face==='upright'?'active':''}">正位</button><button data-action="face" data-value="reversed" aria-pressed="${face==='reversed'}" class="${face==='reversed'?'active':''}">逆位</button></div><p data-detail-face aria-live="polite">${esc(c[face])}</p><div class="dossier-reversal-guide"><strong>逆位不是反义词</strong><p>把核心主题保留下来，再检查它是受阻、过度、内化，还是正在释放。选择哪种表达，需要问题和其他牌支持。</p></div><details class="dossier-inner"><summary>元素、数字与这张牌</summary>${journey.scaffold(c)}</details></details>
      <section class="dossier-chapter" data-dossier-section="use"><div class="dossier-chapter-title"><span>02</span><div><small>把含义放回问题</small><h3>换一个情境，怎样表达？</h3></div></div><div class="segmented dossier-topics" aria-label="问题情境">${Object.entries(detailTopics).map(([v,t])=>`<button data-action="detail-topic" data-value="${v}" aria-pressed="${v==='career'}" class="${v==='career'?'active':''}">${t}</button>`).join('')}</div><div data-dossier-context>${dossierContext(c,'career')}</div><h4>把牌放在眼前，试着换个位置</h4><div class="dossier-position-board">${Object.entries(detailRoles).map(([v,t],i)=>`<button data-action="detail-position" data-value="${v}" aria-pressed="${position===v}" class="${position===v?'active':''}"><span class="dossier-position-card">${img(id)}<b>${i+1}</b></span><strong>${t}</strong></button>`).join('')}</div><p data-detail-position aria-live="polite">${esc(c.contexts.career[contextRoles[position]])}</p><small>这些例子采用正位；逆位需要另外核对表达机制。</small></section>
      <details open class="dossier-chapter" data-dossier-section="compare"><summary>和相近的牌分清楚</summary><div class="dossier-pair"><div>${img(id)}<strong>${esc(c.name)}</strong><small>${esc(c.core)}</small></div><div>${img(near.id)}<strong>${esc(near.name)}</strong><small>${esc(near.core)}</small></div></div><p class="dossier-difference">${esc(lesson.distinction)}</p><table class="dossier-matrix"><caption>从动作辨认差别</caption><tbody><tr><th scope="row">${esc(c.name)}</th><td>${esc(c.observation)}</td></tr><tr><th scope="row">${esc(near.name)}</th><td>${esc(near.observation)}</td></tr></tbody></table><div class="knowledge-card-links"><button data-action="card" data-id="${near.id}">${img(near.id)}<span>继续看这张相近牌</span><strong>${esc(near.name)}</strong>${icon('arrow')}</button></div></details>
      ${readingOnly?'':`<details class="dossier-chapter"><summary>更多学习与查阅</summary><button class="linkbtn" data-action="learn-card" data-id="${id}">${state.viewed.includes(id)?'已标记为读过':'标记为读过'}</button><p class="tiny muted">读过只记录接触情况，不计入完成学习或掌握。</p>${id==='p04'?'<button class="secondary" data-learn-start="p04">完整学习星币四 · 12 个环节</button>':''}${questions.some(q=>q.cardId===id)?`<button class="secondary" data-action="card-practice" data-id="${id}">旧版单牌快练</button>`:''}</details>`}<footer class="dossier-footer"><span>Rider–Waite–Smith · 图像、语境与牌位</span><p>这里提供一套有依据的理解方法。相同的牌可能有不同读法，不把象征解释当作已发生的事实。</p><button class="linkbtn" data-action="sources">内容与图片来源</button></footer></div>`);
    patchCardDetail();
  }
  function patchCardDetail(){
    if(modal?.type!=='card')return;const c=cardMap[modal.id],overlay=document.getElementById('overlay');
    overlay.querySelector('.detail-hero img')?.classList.toggle('reversed-img',modal.face==='reversed');
    const language=overlay.querySelector('[data-action=detail-language]');if(language)language.textContent=window.TAROT_I18N.locale==='en'?'中文':'EN';
    const face=overlay.querySelector('[data-detail-face]');if(face)face.textContent=c[modal.face];
    const position=overlay.querySelector('[data-detail-position]');if(position)position.textContent=c.contexts[modal.topic||'career'][contextRoles[modal.position]];
    const lens=overlay.querySelector('[data-dossier-lens-copy]');if(lens)lens.textContent=dossierLens(c,journey.lesson(c.id),modal.lens||0);
    for(const [action,value] of [['face',modal.face],['detail-position',modal.position],['detail-topic',modal.topic||'career'],['dossier-lens',String(modal.lens||0)]])for(const button of overlay.querySelectorAll(`[data-action="${action}"]`)){button.classList.toggle('active',button.dataset.value===value);button.setAttribute('aria-pressed',String(button.dataset.value===value));}
    overlay.querySelectorAll('[data-matrix-role]').forEach(row=>row.classList.toggle('active',row.dataset.matrixRole===modal.position));
    const save=overlay.querySelector('[data-action=save]');if(save){save.textContent=state.saved.includes(modal.id)?'已收藏':'收藏';save.setAttribute('aria-pressed',String(state.saved.includes(modal.id)));}
    const read=overlay.querySelector('[data-action=learn-card]');if(read)read.textContent=state.viewed.includes(modal.id)?'已标记为读过':'标记为读过';
  }

  function numberFamily(n){return `<div class="family-heading"><h3>同一个数字，四种表达</h3><p>先找共同阶段，再比较人物动作。</p></div><div class="number-family">${['w','c','s','p'].map(s=>{const id=s+String(n).padStart(2,'0'),c=cardMap[id];return `<button data-action="card" data-id="${id}">${img(id)}<strong>${esc(c.name)}</strong><small>${esc(c.core)}</small></button>`;}).join('')}</div>`;}
  function showKnowledge(type){
    modal={type:'knowledge',knowledge:type};
    if(type==='arcana'||type==='court'){showModal(`${sheetHead(type==='arcana'?'大小阿尔卡纳':'宫廷牌 · 行动风格')}<p>${type==='arcana'?'78 张牌包含 22 张大阿尔卡纳和 56 张小阿尔卡纳。大牌帮助观察人生主题，小牌把视线带回日常经验；不能仅按大牌、小牌判定事件大小。':'宫廷牌可以描述一种处理事情的风格，不必指代某个性别、年龄或固定人物。'}</p>${type==='arcana'?'<h3>从具体画面理解</h3><p>小阿尔卡纳由四个花色组成，每个花色有 Ace 到 10，以及四张宫廷牌。先认花色与动作，再参考数字阶段。</p>':[['侍从','探索、接触与学习'],['骑士','追求、行动与试验'],['王后','涵养、照顾与内在整合'],['国王','统筹、组织与承担责任']].map(([t,d])=>`<div class=clue><strong>${t}</strong><span>${d}</span></div>`).join('')}<p class=notice>这是一种学习框架，不是所有传统唯一的解释。请结合花色与具体画面。</p><button class="primary wide" data-action=close>回到牌库选一张牌</button>`);return;}
    if(type==='elements')showModal(`${sheetHead('四元素 · 记忆地图')}<p class="muted">元素先告诉你能量主要在哪个领域运作，再用牌面动作修正具体含义。</p><div class="knowledge-sheet">${[['w01','火 · 权杖','行动、欲望、创造与意志','问：这股力量想推动什么？'],['c01','水 · 圣杯','情感、连接、感受与接纳','问：情绪在流动、停留还是失衡？'],['s01','风 · 宝剑','思想、判断、沟通与冲突','问：什么观念或决定正在切开局面？'],['p01','土 · 星币','现实、身体、资源与稳定','问：它怎样落到时间、金钱、技能或身体？']].map(([symbol,name,meaning,prompt])=>`<article><button class="element-card" data-action="card" data-id="${symbol}">${img(symbol)}</button><div><h3>${name}</h3><p>${meaning}</p><small>${prompt}</small></div></article>`).join('')}</div><div class="notice">元素是理解工具。看到水不等于爱情，看到土也不等于有钱；仍要结合数字、画面、牌位和问题。</div><button class="primary wide" data-action="close">回到牌库选一张牌</button>`);else showModal(`${sheetHead('数字 1–10 · 发展节奏')}<p class="muted">数字帮助你比较四个花色的共同阶段，再观察每张牌怎样以不同元素表达。</p><div class="number-sheet">${[['1','起点与潜能'],['2','两端、选择与平衡'],['3','展开、合作与初步成果'],['4','结构、稳定与停驻'],['5','扰动、冲突与调整'],['6','重新协调与移动'],['7','检验、坚持与策略'],['8','推进、组织与熟练'],['9','接近完成与个人承受'],['10','完成、饱和与进入下一轮']].map(([n,m])=>`<button data-action="number-family" data-value="${n}" aria-pressed="${n==='4'}"><strong>${n}</strong><span>${m}</span></button>`).join('')}</div><div data-number-family>${numberFamily(4)}</div><div class="notice">数字给出阶段，不直接生成答案。比如“四”可能是稳定，也可能变成停滞；要看它落在哪个花色和画面里。</div><button class="primary wide" data-action="close">回到牌库选一张牌</button>`);
  }
  async function checkStatus(){modal={type:'status'};showModal(`${sheetHead('本机内容检查')}<p class="muted">正在逐张检查78 张图片是否可以解码…</p>`);const result=await Promise.all(cards.map(c=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im.naturalWidth>100);im.onerror=()=>resolve(false);im.src=path(c.id);})));if(modal?.type!=='status')return;const count=result.filter(Boolean).length;showModal(`${sheetHead('本机内容检查')}<div class="status-row"><span>牌图可显示</span><span class="status-value">${count} / ${cards.length}</span></div>${window.TarotOffline?.render()||''}<div class="status-row"><span>牌义与连续学习</span><span class="status-value">${cards.length} 张</span></div><div class="status-row"><span>混合快练题</span><span class="status-value">${questions.length} 道</span></div><div class="status-row"><span>新增完整学习与复习</span><span class="status-value">${learning.count()} 个环节</span></div><div class="status-row"><span>可学习与抽取的牌阵</span><span class="status-value">${window.TAROT_SPREAD_CONTENT.spreads.filter(s=>!s.legacy).length} 种</span></div><div class="status-row"><span>当前浏览器保存</span><span class="status-value">${storageOK?'可写入':'不可用，请导出'}</span></div><p class="notice">这个检查确认当前页面能载入内容。要确认手机离线体验，还需要在手机上开飞行模式、退出重开，并检查记录是否保留。</p><button class="secondary wide" data-action="sources">查看内容来源</button>`);}
  function sources(){modal={type:'sources'};showModal(`${sheetHead('内容与来源')}<p>78 张牌来自 Wikimedia Commons 的历史 Rider–Waite–Smith 牌图。插画为 Pamela Colman Smith；对应文件页标注公共领域。图片保留完整构图。</p><div class="source-list"><p>图片来源、版本与许可标签已随单文件内嵌。下面的外部来源链接仅用于查证。</p>${(window.TAROT_ASSET_SOURCES?.items||[]).map(a=>`<p><a href="${esc(a.source_page)}" target="_blank" rel="noopener noreferrer">${esc(cardMap[a.card_id]?.name)}</a> · ${esc(a.visual_edition)} · ${esc(a.license_status_as_listed)}</p>`).join('')}${[...(DATA.sources||[]),...(window.TAROT_READING_DECK.sources||[]),...(window.TAROT_SPREAD_CONTENT.sources||[])].map(s=>`<p>${esc(s.title)}<br>${/^https:\/\//.test(s.url)?`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.url)}</a>`:esc(s.url)}</p>`).join('')}<p><a href="https://commons.wikimedia.org/wiki/Category:Rider-Waite_tarot_deck" target="_blank" rel="noopener noreferrer">Wikimedia Commons · RWS 牌图来源</a></p></div><div class="notice">内容为原创教学解读，尚待独立教师审校，不把一种解读当作唯一真理。来源链接需联网，核心学习不需要访问它们。</div>`);}
  function exportState(){const blob=new Blob([JSON.stringify({app:'tarot-pocket-demo',version:1,exportedAt:new Date().toISOString(),state,learning:learning.export(),reading:reading.export()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`tarot-learning-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已请求导出，请确认浏览器的文件保存位置。');}
  function feedback(){modal={type:'feedback'};showModal(`${sheetHead('这次体验怎么样？')}<p class="muted">点击一个最接近的感受，记录在当前浏览器。你也可以直接回到对话告诉我。</p><div class="buttonstack">${['顺手，愿意继续学','选项有挑战，解析也有帮助','题目太难，需要更多先学内容','解析太长，想更快看重点','操作不顺，想调整页面'].map(t=>`<button class="secondary" data-action="feedback-save" data-text="${t}">${t}</button>`).join('')}</div><p class="subtleline">本机已记录 ${state.feedback.length} 条体验感受，导出学习记录时会一并带上。</p>`);}
  document.addEventListener('click',event=>{
    const el=event.target.closest('[data-action]');
    if(!el){if(event.target.dataset.backdrop)closeModal();return;}
    const action=el.dataset.action;
    if(action==='number-family'){const n=Number(el.dataset.value);if(n>=1&&n<=10){overlay.querySelector('[data-number-family]').innerHTML=numberFamily(n);overlay.querySelectorAll('[data-action=number-family]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.value)===n)));}}
    else if(action==='nav')go(el.dataset.page);
    else if(action==='start')startSession(el.dataset.mode);
    else if(action==='resume')go('study');
    else if(action==='choose-cards'){libraryView='cards';filter='全部';librarySearch='';go('library');}
    else if(action==='library-view'){libraryView=el.dataset.value;render();root.querySelector(`[data-action=library-view][data-value="${CSS.escape(libraryView)}"]`)?.focus({preventScroll:true});}
    else if(action==='filter'){filter=el.dataset.value;render();root.querySelector(`[data-action=filter][data-value="${CSS.escape(filter)}"]`)?.focus({preventScroll:true});}
    else if(action==='card')showCard(el.dataset.id);
    else if(action==='detail-language'){window.TAROT_I18N.setLocale(window.TAROT_I18N.locale==='en'?'zh-CN':'en');el.textContent=window.TAROT_I18N.locale==='en'?'中文':'EN';}
    else if(action==='dossier-jump'&&modal?.type==='card'){const target=overlay.querySelector(`[data-dossier-section="${CSS.escape(el.dataset.value)}"]`);if(target){if(target.tagName==='DETAILS')target.open=true;target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}}
    else if(action==='dossier-lens'&&modal?.type==='card'){const n=Number(el.dataset.value);if(Number.isInteger(n)&&n>=0&&n<3){modal.lens=n;patchCardDetail();}}
    else if(action==='detail-topic'&&modal?.type==='card'&&detailTopics[el.dataset.value]){modal.topic=el.dataset.value;const node=overlay.querySelector('[data-dossier-context]');node.innerHTML=dossierContext(cardMap[modal.id],modal.topic);patchCardDetail();}
    else if(action==='close')dismissOverlay();
    else if(action==='card-back'&&cardTrail.length)restoreSheet(cardTrail.pop());
    else if(action==='status')checkStatus();
    else if(action==='sources')sources();
    else if(action==='draw'){const c=cardMap[currentQuestion().cardId];state.session.phase=seenIDs().includes(c.id)?'question':'intro';persist();render();window.scrollTo(0,0);}
    else if(action==='intro-next'){state.session.phase='question';persist();render();window.scrollTo(0,0);}
    else if(action==='hint'){state.session.hint=true;persist();const y=window.scrollY;render();window.scrollTo(0,y);}
    else if(action==='answer')answer(el.dataset.value);
    else if(action==='unknown')answer(null);
    else if(action==='confidence')confidence(el.dataset.value);
    else if(action==='next')next();
    else if(action==='next-card')startNextCard();
    else if(action==='knowledge')showKnowledge(el.dataset.value);
    else if(action==='zoom'){
      const id=el.dataset.id;if(!cardMap[id])return;
      zoomReturn=modal?.type==='card'?captureSheet():null;modal={type:'zoom'};
      showModal(`<div class="zoom-backdrop" role="dialog" aria-modal="true" aria-label="放大牌图"><button class="iconbtn" data-action="close" aria-label="关闭放大">${icon('close')}</button>${el.dataset.hide==='1'?`<div style="position:relative;max-height:85dvh">${img(id,'style="display:block;max-height:80dvh;max-width:85vw"')}<div style="position:absolute;bottom:0;left:0;right:0;height:7%;background:#eee9d5"></div></div>`:img(id)}</div>`,'zoom');
    }
    else if(action==='face' && modal?.type==='card'){modal.face=el.dataset.value;patchCardDetail();}
    else if(action==='detail-position' && modal?.type==='card'){modal.position=el.dataset.value;patchCardDetail();}
    else if(action==='save'){const id=el.dataset.id;state.saved=state.saved.includes(id)?state.saved.filter(x=>x!==id):[...state.saved,id];persist();patchCardDetail();}
    else if(action==='learn-card'){const id=el.dataset.id;if(!state.viewed.includes(id))state.viewed.push(id);persist();patchCardDetail();toast('已记录为读过，学习进度保持不变。');}
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
    else if(action==='reset'){modal={type:'reset'};showModal(`${sheetHead('重新开始体验？')}<p>将清空塔罗随身学的学习单元、练习、抽牌记录、收藏和演示日期。不会影响其他网站或文件。可以先导出备份。</p><div class="buttonstack"><button class="secondary" data-action="export">先导出记录</button><button class="primary" data-action="confirm-reset">清空塔罗随身学记录</button><button class="linkbtn" data-action="close">保留，继续体验</button></div>`);}
    else if(action==='confirm-reset'){state=fresh();learning.reset();reading.reset();persist();closeModal();go('home');toast('已回到最初的体验状态。');}
  });
  document.getElementById('import-file').addEventListener('change',async event=>{
    const file=event.target.files[0];event.target.value='';if(!file)return;
    try{if(file.size>5*1024*1024)throw new Error('文件太大');const input=JSON.parse(await file.text());if(input.app!=='tarot-pocket-demo')throw new Error('不是塔罗随身学的记录');const candidate=validateState(input.state,false);if(input.state.journey===undefined)candidate.journey=state.journey;const candidateLearning=input.learning===undefined?null:learning.validate(input.learning);const candidateReading=input.reading===undefined?null:reading.validate(input.reading);showModal(`${sheetHead('恢复这份学习记录？')}<p>这份记录包含 ${candidate.history.length} 次练习和 ${candidate.saved.length} 张收藏，将替换当前快练记录。${candidateLearning?`另含 ${candidateLearning.history.length} 次学习单元记录，将一并恢复单元进度。`:"这是旧版备份，保留当前新增学习单元的记录。"}${candidateReading?`另含 ${candidateReading.history.length} 组抽牌记录及当前牌桌进度，将一并恢复。`:"备份未含抽牌记录时，保留当前牌桌。"}旧版未完成快练题组不会导入。</p><div class="buttonstack"><button class="secondary" data-action="export">先备份当前记录</button><button class="primary" data-action="confirm-import">恢复这份记录</button><button class="linkbtn" data-action="close">取消</button></div>`);modal={type:'import'};restoreCandidate=candidate;restoreLearningCandidate=candidateLearning;restoreReadingCandidate=candidateReading;}catch(error){toast('无法导入：请使用塔罗随身学 导出的完整 JSON 文件。');}
  });
  document.addEventListener('keydown',event=>{
    if(!document.getElementById('overlay').children.length)return;
    if(event.key==='Escape'){event.preventDefault();dismissOverlay();}
    if(event.key==='Tab'){const controls=[...document.querySelectorAll('#overlay button,#overlay a,#overlay input,#overlay summary,#overlay [tabindex="0"]')].filter(el=>el.getClientRects().length&&!el.disabled);const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}
  });
  window.addEventListener('pagehide',persist);
  if(state.session && state.session.phase!=='complete')page='home';
  window.TAROT_LEARNING.units.push(...window.TAROT_SPREAD_CONTENT.units);
  const reading = window.createTarotReading({esc,img,icon,go,toast,now});
  const learning = window.createTarotLearning({esc,img,icon,shuffle,go,now,toast,cardMap});
  const journey = window.TarotJourney.create({esc,img,icon,go,toast,now,cardMap,get:()=>state.journey,set:value=>{state.journey=value;persist();}});
  document.addEventListener('input',event=>{if(!event.target.matches('[data-library-search]'))return;librarySearch=event.target.value;document.querySelector('[data-library-results]').innerHTML=libraryCards();});
  render();
})();
