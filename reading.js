/* An offline shuffled deck and a position-first spread studio. */
window.createTarotReading = function (bridge) {
  'use strict';
  const {esc,img,icon,go,toast,now} = bridge;
  const catalog=window.TAROT_READING_DECK;
  const content=window.TAROT_SPREAD_CONTENT;
  const cards=Object.fromEntries(catalog.cards.map(c=>[c.id,c]));
  const spreads=Object.fromEntries(content.spreads.map(s=>[s.id,s]));
  const topics=Object.fromEntries(content.topics.map(t=>[t.id,t]));
  const KEY='tarot-reading-v3';
  const blank=()=>({version:1,settings:{topic:'career',spreadId:'three',questionId:topics.career.questions[0].id,reversals:false},draft:null,history:[],practice:[]});
  let data=blank(),storageOK=true,guide=null,timer=null,flipped=-1;
  function validDraft(raw){
    if(!raw||!spreads[raw.spreadId]||!topics[raw.topic]||!Array.isArray(raw.pool)||raw.pool.length!==catalog.cards.length||new Set(raw.pool.map(c=>c?.id)).size!==catalog.cards.length||raw.pool.some(c=>!cards[c?.id]))return null;
    const count=spreads[raw.spreadId].positions.length;
    if(!Array.isArray(raw.picked)||raw.picked.length>count||new Set(raw.picked).size!==raw.picked.length||raw.picked.some(i=>!Number.isInteger(i)||i<0||i>=raw.pool.length))return null;
    const revealed=Array.isArray(raw.revealed)?[...new Set(raw.revealed.filter(i=>Number.isInteger(i)&&i>=0&&i<raw.picked.length))]:[];
    return {id:String(raw.id).slice(0,100),at:Number(raw.at)||now(),spreadId:raw.spreadId,topic:raw.topic,questionId:String(raw.questionId).slice(0,80),reversals:!!raw.reversals,pool:raw.pool.map(c=>({id:c.id,reversed:!!raw.reversals&&!!c.reversed})),picked:[...raw.picked],revealed,active:Number.isInteger(raw.active)&&raw.active>=0&&raw.active<raw.picked.length?raw.active:0,phase:raw.picked.length<count?'pick':revealed.length<count?'reveal':'read'};
  }
  function validate(raw){
    if(!raw||raw.version!==1||!Array.isArray(raw.history)||raw.history.length>40||!Array.isArray(raw.practice)||raw.practice.length>2000)throw Error('抽牌记录格式不正确');
    const out=blank(),s=raw.settings;
    if(s&&topics[s.topic]&&spreads[s.spreadId]){const topic=spreads[s.spreadId].topics.includes(s.topic)?s.topic:spreads[s.spreadId].topics[0];out.settings={topic,spreadId:s.spreadId,questionId:topics[topic].questions.some(q=>q.id===s.questionId)||s.questionId==='own'?s.questionId:topics[topic].questions[0].id,reversals:!!s.reversals};}
    if(raw.draft){out.draft=validDraft(raw.draft);if(!out.draft)throw Error('抽牌进度损坏');}
    for(const h of raw.history){const clean=validDraft(h);if(!clean)throw Error('历史牌组损坏');out.history.push(clean);}
    out.practice=raw.practice.filter(e=>e&&spreads[e.spreadId]&&topics[e.topic]&&Number.isInteger(e.position)&&e.position>=0&&e.position<spreads[e.spreadId].positions.length&&typeof e.correct==='boolean'&&Number.isFinite(e.at)).map(e=>({spreadId:e.spreadId,topic:e.topic,position:e.position,correct:e.correct,at:e.at}));
    return out;
  }
  try{const raw=localStorage.getItem(KEY);if(raw)data=validate(JSON.parse(raw));}catch(e){storageOK=false;}
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(data));storageOK=true;}catch(e){storageOK=false;toast('抽牌记录暂时无法写入；可在「我的」导出备份。');}}
  function randomInt(n){
    const word=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;
    do{crypto.getRandomValues(word);}while(word[0]>=limit);
    return word[0]%n;
  }
  function shuffled(list){const a=[...list];for(let i=a.length-1;i>0;i--){const j=randomInt(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
  function question(s){return topics[s.topic].questions.find(q=>q.id===s.questionId)?.text||'围绕心中的具体问题，观察现状与可行动的部分。';}
  function archive(){if(!data.draft)return;const d=structuredClone(data.draft);if(d.picked.length){data.history=data.history.filter(h=>h.id!==d.id);data.history.unshift(d);data.history=data.history.slice(0,40);}}
  function redraw(destination='reading',keep=false){const y=window.scrollY;go(destination);if(keep)window.scrollTo(0,y);}
  function start(){
    if(data.draft)return;
    const s=data.settings;
    try{
      const pool=shuffled(catalog.cards.map(c=>({id:c.id,reversed:s.reversals?randomInt(2)===1:false})));
      data.draft={...s,id:'reading-'+Date.now()+'-'+randomInt(1000000000),at:now(),pool,picked:[],revealed:[],active:0,phase:'shuffling'};
    }catch(e){toast('当前浏览器无法随机洗牌，请换用支持的浏览器。');return;}
    persist();redraw();
    const id=data.draft.id;
    timer=setTimeout(()=>{if(data.draft?.id===id){data.draft.phase='pick';persist();if(document.querySelector('.reading-shuffle'))redraw();}timer=null;},850);
  }
  function drawBoard(s,guideMode=false,hideLabels=false){
    const d=spreads[s.spreadId];
    return `${d.layout==='celtic'?'<p class="subtleline">展开视图：第 2 张交叉牌放在第 1 张右侧，方便分别点选。</p>':''}<div class="reading-board layout-${esc(d.layout)} count-${d.positions.length}" aria-label="${esc(d.name)}牌位">${d.positions.map((pos,i)=>{
      const drawn=!guideMode&&s.picked[i]!==undefined,revealed=drawn&&s.revealed.includes(i),c=drawn?s.pool[s.picked[i]]:null;
      const selected=guideMode?guide.active===i:s.active===i;
      return `<button class="reading-slot slot-${i+1} ${selected?'active':''} ${revealed?'revealed':''} ${flipped===i?'just-flipped':''}" data-reading="${guideMode?'guide-position':'card'}" data-index="${i}" ${!guideMode&&!drawn?'disabled':''} aria-label="${i+1} ${hideLabels?'待回忆的牌位':esc(pos.label)}${drawn?(revealed?'，'+esc(cards[c.id].name)+(c.reversed?'逆位':'正位'):'，点击翻开'):''}"><span class="reading-card ${c?.reversed?'is-reversed':''}">${revealed?img(c.id):`<span class="reading-back"><b>${guideMode?i+1:drawn?'✧':i+1}</b></span>`}</span><span class="reading-label">${i+1} · ${hideLabels?'？':esc(pos.label.replace(/^\d+ · /,''))}</span>${revealed?`<small>${esc(cards[c.id].name)} · ${c.reversed?'逆位':'正位'}</small>`:''}</button>`;
    }).join('')}</div>`;
  }
  function readingText(card,topic,pos,reversed=false){
    const ctx=card.contexts[topic];
    const external=pos.id==='environment';
    const observed={love:'对方已经表达的需要、联系安排与互动行为',career:'合作者已经表达的要求、承诺与实际配合',study:'老师或同伴已给出的反馈与实际协作'}[topic];
    const environment={love:'相处时间、距离、生活安排与外部支持',career:'团队规则、资源配置、时限与市场信息',study:'课程要求、时间安排、材料与可获得的支持'}[topic];
    const expressions={state:ctx.state,tension:ctx.tension,advice:ctx.advice,resource:'以“'+card.core+'”为线索，核对已有的'+({love:'沟通基础、边界与支持',career:'经验、人手与资源',study:'基础、材料与学习支持'}[topic])+'。可思考的使用方向：'+ctx.advice,past:'回看过去，是否曾出现这样的状态：'+ctx.state,trend:'如果当前条件延续，可观察这种主题如何发展：'+ctx.state,unknown:'以“'+card.core+'”作为观察主题，检查'+(external?environment:observed)+'是否出现相关线索。没有已知事实时，先保留为需要核对的问题。'};
    let text=expressions[pos.role]||ctx.state;
    if(pos.id==='aim')text='目标位提醒你核对：你是否正在追求与“'+card.core+'”有关的状态？它描述想达到的方向，不代表已经实现。结合'+topics[topic].label+'问题，再看目标是否符合现实需要。';
    if(pos.id==='hopes-fears')text='以“'+card.core+'”为线索，想想自己在'+topics[topic].label+'问题中期待什么、害怕什么；这些心理预期不等于将发生的结果。';
    return {text,reversal:reversed?card.reversed:'',check:pos.role==='unknown'?(external?'把环境条件与实际信息核对，不把内心感受当成外部事实。':'这一位置只看已表达的言行，无法确定他人的内心；不清楚时需要沟通。'):pos.role==='trend'?'趋势以当前条件为前提，后续行动与环境都可能改变它。':card.questions[topic]};
  }
  function panel(s){
    const d=spreads[s.spreadId],i=s.active,pos=d.positions[i],drawn=s.pool[s.picked[i]];
    if(!drawn||!s.revealed.includes(i))return '';
    const c=cards[drawn.id],r=readingText(c,s.topic,pos,drawn.reversed);
    return `<section class="reading-interpretation" aria-live="polite"><div class="eyebrow">${esc(topics[s.topic].label)}问题 · ${esc(pos.label)}位</div><h2>${esc(c.name)} <small>${drawn.reversed?'逆位':'正位'}</small></h2><p class="reading-position-question">这个位置问：${esc(pos.question)}</p><div class="reading-evidence"><strong>先看画面</strong><p>${esc(c.observation)}</p></div><div><strong>${drawn.reversed?'先辨认牌的主题':'放进这次的问题与牌位'}</strong><p>${esc(r.text)}</p></div>${drawn.reversed?`<div class="reading-reversal"><strong>逆位时，再检查</strong><p>${esc(r.reversal)}</p><small>这会改变上面主题的表达方式；需要结合实际情况选择，不能直接套用正位结论。</small></div>`:''}<div class="reading-check"><strong>回到现实核对</strong><p>${esc(r.check)}</p></div><button class="linkbtn" data-action="zoom" data-id="${esc(c.id)}">放大看牌图 ${icon('zoom')}</button><details class="learn-other"><summary>同一张牌，换个问题会怎样？</summary>${content.topics.map(t=>`<p><strong>${esc(t.label)} · ${esc(pos.label)}</strong><br>${esc(readingText(c,t.id,pos,drawn.reversed).text)}</p>`).join('')}<p>这里仅用于学习比较，保存的抽牌问题仍是「${esc(topics[s.topic].label)}」。</p></details></section>`;
  }
  function setup(){const s=data.settings;
    return `<div class="pagehead"><div class="eyebrow">随身牌桌 · 完整 78 张 RWS</div><h1>牌不在身边，<br>也能安静抽一组。</h1><p>选好问题与牌阵，洗牌、选牌，再逐张翻开。</p></div><section class="reading-setup"><h2>这次想看什么？</h2><div class="reading-topic">${content.topics.map(t=>`<button class="secondary ${s.topic===t.id?'chosen':''}" data-reading="topic" data-value="${t.id}" aria-pressed="${s.topic===t.id}">${esc(t.label)}</button>`).join('')}</div><div class="reading-questions" role="group" aria-label="本次问题">${[...topics[s.topic].questions,{id:'own',text:'在心里想好自己的具体问题'}].map(q=>`<button class="reading-question ${s.questionId===q.id?'chosen':''}" data-reading="question" data-value="${esc(q.id)}" aria-pressed="${s.questionId===q.id}">${esc(q.text)}</button>`).join('')}</div><div class="sectionhead section"><h2>选一个合适的牌阵</h2><span class="tiny muted">8 种 · 点开了解位置</span></div><div class="reading-spread-grid">${content.spreads.map(d=>`<article class="reading-spread-choice ${s.spreadId===d.id?'chosen':''}"><button data-reading="spread" data-value="${d.id}" aria-pressed="${s.spreadId===d.id}"><span class="spread-count">${d.positions.length}</span><span><strong>${esc(d.name)}</strong><small>${esc(d.summary)}</small></span></button><button class="linkbtn" data-reading="guide" data-value="${d.id}">了解牌位与读法</button></article>`).join('')}</div><div class="reading-selected"><strong>${esc(spreads[s.spreadId].name)}适合这样用</strong><p>${esc(spreads[s.spreadId].bestFor)}</p><small>${esc(spreads[s.spreadId].avoid)}</small></div><label class="reading-toggle"><input type="checkbox" data-reading-setting="reversals" ${s.reversals?'checked':''}><span>加入逆位<small>关闭时全部为正位；开启后每张牌独立随机方向。</small></span></label><button class="primary wide" data-reading="start">洗牌并开始 · ${spreads[s.spreadId].positions.length} 张 ${icon('arrow')}</button><p class="footnote">每次从 78 张牌中随机抽取、不放回。记录保存在本机。</p></section>${historySection()}`;
  }
  function render(){
    const s=data.draft;if(!s)return setup();
    const d=spreads[s.spreadId];
    const header=`<div class="spread-intro"><button class="iconbtn" data-reading="pause" aria-label="保存进度并返回练习">${icon('back')}</button><div><div class="eyebrow">${esc(topics[s.topic].label)} · ${s.reversals?'含正逆位':'仅正位'}</div><h1>${esc(d.name)}</h1></div></div><div class="scenario"><strong>这次的问题</strong>${esc(question(s))}</div>${!storageOK?'<p class="storage-warning">当前浏览器不能保存，请导出备份。</p>':''}`;
    if(s.phase==='shuffling')return `${header}<div class="reading-shuffle"><div class="shuffle-pack">${[0,1,2].map(i=>`<div class="reading-back"><b>✧</b></div>`).join('')}</div><h2 role="status">正在洗牌…</h2><p>在心里想好这次的问题。</p></div>`;
    const complete=s.revealed.length===d.positions.length;
    return `${header}<div class="reading-stage"><h2>${s.phase==='pick'?`选第 ${s.picked.length+1} 张 · ${esc(d.positions[s.picked.length].label)}`:complete?'你的牌阵已展开':'轻点牌背，逐张翻开'}</h2><span>${s.phase==='pick'?s.picked.length:s.revealed.length} / ${d.positions.length}</span></div>${drawBoard(s)}${s.phase==='pick'?`<div class="reading-deck-label"><strong>从下面的牌背中选一张</strong><span>${78-s.picked.length} 张可选 · 左右滑动</span></div><div class="reading-deck" aria-label="洗好的完整牌组">${s.pool.map((_,i)=>`<button class="reading-pick" data-reading="pick" data-index="${i}" ${s.picked.includes(i)?'disabled':''} aria-label="选择第 ${i+1} 张牌背"><span class="reading-back"><b>${s.picked.includes(i)?'✓':'✧'}</b></span></button>`).join('')}</div><p class="subtleline">选出的牌按顺序进入牌位；洗牌后顺序保持不变。</p>`:''}${s.phase==='reveal'?'<p class="subtleline">可以先自己观察；翻开后点牌，查看这个位置的解读提示。</p>':''}${panel(s)}${complete?`<section class="reading-whole"><div class="eyebrow">把各个位置连起来</div><h2>这组牌该怎样一起看？</h2><p>${esc(d.readingTip)}</p><p>${esc(d.compareTip)}</p><ol>${d.positions.map((p,i)=>`<li><strong>${esc(p.label)} · ${esc(cards[s.pool[s.picked[i]].id].name)}</strong><span>${esc(p.question)}</span></li>`).join('')}</ol><p class="notice">以上是结合问题与牌位的参考线索；你可以形成自己的解读，再用现实信息核对。</p><button class="primary wide" data-reading="finish">收好这次牌阵 ${icon('save')}</button><button class="secondary wide" data-learn-start="${s.topic+'-context'}">练一练${esc(topics[s.topic].label)}问题怎么读</button></section>`:''}<button class="linkbtn" data-reading="new">保留这组记录，开始新问题</button>`;
  }
  function historySection(){return `<section class="section"><div class="sectionhead"><h2>我的抽牌记录</h2><span class="tiny muted">${data.history.length} 组 · 最多保留 40 组</span></div>${data.history.map(h=>`<button class="practice-row" data-reading="history" data-value="${esc(h.id)}"><span><strong>${esc(spreads[h.spreadId].name)} · ${esc(topics[h.topic].label)}</strong><p>${new Date(h.at).toLocaleDateString('zh-CN')} · ${h.revealed.length} / ${spreads[h.spreadId].positions.length} 张已翻开</p></span>${icon('arrow')}</button>`).join('')||'<p class="empty">收好一组牌后，可以随时回来再看。</p>'}</section>`;}
  function dashboard(){return `<section class="section"><div class="sectionhead"><h2>我的牌桌</h2><span class="tiny muted">${data.history.length} 组记录 · ${data.practice.length} 次牌位练习</span></div>${data.draft?`<button class="practice-row" data-reading="resume"><span><strong>继续${esc(spreads[data.draft.spreadId].name)}</strong><p>保留了已选牌与正逆位，回来不会重抽。</p></span>${icon('arrow')}</button>`:''}<button class="secondary wide" data-reading="resume">打开抽牌与记录</button><p class="subtleline">抽牌结果不记为学习成绩；牌位辨认题单独记录。</p></section>`;}
  function learningHub(){return `<section class="section"><div class="sectionhead"><h2>牌阵与问题，一起练</h2><span class="tiny muted">感情 · 事业 · 学业</span></div><div class="context-lessons">${content.units.map(u=>`<button class="feature" data-learn-start="${u.id}"><div><span class="eyebrow">${u.steps.length} 步 · 情境练习</span><h3>${esc(u.title)}</h3><p>${esc(u.subtitle)}</p></div>${icon('arrow')}</button>`).join('')}</div><details class="spread-guide-list"><summary>认识 8 种牌阵：位置、用途与读法</summary>${content.spreads.map(d=>`<button class="practice-row" data-reading="guide" data-value="${d.id}"><span class="practice-number">${d.positions.length}</span><span class="practice-text"><strong>${esc(d.name)}</strong><p>${esc(d.summary)}</p></span>${icon('arrow')}</button>`).join('')}</details></section>`;}
  function openGuide(id){if(!spreads[id])return;guide={spreadId:id,active:0,topic:spreads[id].topics.includes(data.settings.topic)?data.settings.topic:spreads[id].topics[0],quiz:null};redraw('spread-guide');}
  function renderGuide(){
    if(!guide)return learningHub();const d=spreads[guide.spreadId],pos=d.positions[guide.active],q=guide.quiz;
    const r=readingText(cards.p04,guide.topic,pos);
    return `<div class="spread-intro"><button class="iconbtn" data-reading="guide-back" aria-label="返回练习首页">${icon('back')}</button><div><div class="eyebrow">牌阵学习 · 本课程的位置约定</div><h1>${esc(d.name)}</h1></div></div><p class="reading-guide-summary">${esc(d.summary)}</p><div class="reading-selected"><strong>适合解决</strong><p>${esc(d.bestFor)}</p><small>${esc(d.avoid)}</small></div>${drawBoard({spreadId:d.id},true,!!q&&q.selected===null)}${q?`<section class="guide-quiz"><h2>第 ${q.position+1} 位在问什么？</h2><div class="options">${q.options.map((o,i)=>`<button class="option ${q.selected!==null?(o.id===q.correct?'correct':o.id===q.selected?'incorrect':''):''}" data-reading="guide-answer" data-value="${esc(o.id)}" ${q.selected!==null?'disabled':''}><span class="letter">${String.fromCharCode(65+i)}</span><span>${esc(o.text)}</span></button>`).join('')}</div>${q.selected!==null?`<div class="guide-verdict ${q.selected===q.correct?'right':'wrong'}" role="status"><strong>${q.selected===q.correct?'✓ 答对了':'✕ 答错了'}</strong><p>第 ${q.position+1} 位是「${esc(d.positions[q.position].label)}」：${esc(d.positions[q.position].question)}</p><p>其他选项属于其他位置的问题；解释时不能把它们互换。</p></div><button class="secondary wide" data-reading="guide-explain">返回牌位讲解</button>`:''}</section>`:`<section class="reading-guide-position"><div class="eyebrow">第 ${guide.active+1} 个位置</div><h2>${esc(pos.label)}</h2><p>${esc(pos.question)}</p><button class="secondary" data-reading="guide-test">收起牌位，考考自己</button></section><section class="guide-context"><h2>同一张星币四，放在这里</h2><div class="reading-topic">${content.topics.filter(t=>d.topics.includes(t.id)).map(t=>`<button class="secondary ${guide.topic===t.id?'chosen':''}" data-reading="guide-topic" data-value="${t.id}">${esc(t.label)}</button>`).join('')}</div><div class="guide-card-example">${img('p04')}<div><strong>${esc(topics[guide.topic].label)} · ${esc(pos.label)}</strong><p>${esc(r.text)}</p><small>${esc(r.check)}</small></div></div><p class="subtleline">这是用于比较的解释方向；完整案例会再加入实际背景，收窄含义。</p><button class="linkbtn" data-learn-start="${guide.topic}-context">进入${esc(topics[guide.topic].label)}完整案例 ${icon('arrow')}</button></section><section class="reading-whole"><h2>读牌顺序</h2><p>${esc(d.readingTip)}</p><p>${esc(d.compareTip)}</p></section><button class="primary wide" data-reading="use-spread" data-value="${d.id}">用这个牌阵抽一次 ${icon('arrow')}</button>`}`;
  }
  function guideTest(){
    const d=spreads[guide.spreadId],pos=d.positions[guide.active],correct=d.id+'-'+guide.active;
    const seen=new Set([pos.question]);const wrong=[];
    for(const spread of [d,...content.spreads.filter(s=>s.id!==d.id)])for(const [i,p]of spread.positions.entries()){if(p.role!==pos.role&&!seen.has(p.question)){wrong.push({id:spread.id+'-'+i,text:p.question});seen.add(p.question);}}
    guide.quiz={position:guide.active,correct,selected:null,options:shuffled([{id:correct,text:pos.question},...shuffled(wrong).slice(0,3)])};
  }
  document.addEventListener('change',e=>{if(e.target.matches('[data-reading-setting=reversals]')&&!data.draft){data.settings.reversals=e.target.checked;persist();}});
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-reading]');if(!b)return;const a=b.dataset.reading,v=b.dataset.value,i=Number(b.dataset.index),s=data.draft;flipped=-1;
    if(a==='resume'){redraw();return;}
    if(a==='guide'){openGuide(v);return;}
    if(a==='guide-back'){go('home');return;}
    if(a.startsWith('guide-')){
      if(!guide)return;
      if(a==='guide-position'&&!guide.quiz&&Number.isInteger(i)&&spreads[guide.spreadId].positions[i])guide.active=i;
      if(a==='guide-topic'&&spreads[guide.spreadId].topics.includes(v))guide.topic=v;
      if(a==='guide-test')guideTest();
      if(a==='guide-explain')guide.quiz=null;
      if(a==='guide-answer'&&guide.quiz&&guide.quiz.selected===null&&guide.quiz.options.some(o=>o.id===v)){guide.quiz.selected=v;data.practice.push({spreadId:guide.spreadId,topic:guide.topic,position:guide.quiz.position,correct:v===guide.quiz.correct,at:now()});data.practice=data.practice.slice(-2000);persist();}
      redraw('spread-guide',true);return;
    }
    if(a==='use-spread'){
      if(s){archive();data.draft=null;clearTimeout(timer);timer=null;}
      if(spreads[v]){data.settings.spreadId=v;if(v==='study')data.settings.topic='study';data.settings.questionId=v==='choice'?topics[data.settings.topic].questions.find(q=>q.id.endsWith('-choice')).id:topics[data.settings.topic].questions[0].id;}persist();redraw();return;
    }
    if(a==='history'){
      const h=data.history.find(h=>h.id===v);if(!h)return;archive();data.draft=structuredClone(h);persist();redraw();return;
    }
    if(a==='pause'){persist();go('home');return;}
    if(a==='finish'||a==='new'){archive();data.draft=null;clearTimeout(timer);timer=null;persist();redraw();return;}
    if(a==='start'){start();return;}
    if(!s){
      if(a==='topic'&&topics[v]){data.settings.topic=v;if(!spreads[data.settings.spreadId].topics.includes(v))data.settings.spreadId='three';data.settings.questionId=data.settings.spreadId==='choice'?topics[v].questions.find(q=>q.id.endsWith('-choice')).id:topics[v].questions[0].id;}
      if(a==='question'&&(v==='own'||topics[data.settings.topic].questions.some(q=>q.id===v)))data.settings.questionId=v;
      if(a==='spread'&&spreads[v]){data.settings.spreadId=v;if(v==='study'){data.settings.topic='study';data.settings.questionId=topics.study.questions[0].id;}if(v==='choice')data.settings.questionId=topics[data.settings.topic].questions.find(q=>q.id.endsWith('-choice'))?.id||'own';}
      persist();redraw('reading',true);return;
    }
    const deckScroll=document.querySelector('.reading-deck')?.scrollLeft||0;
    if(a==='pick'&&s.phase==='pick'&&Number.isInteger(i)&&i>=0&&i<s.pool.length&&!s.picked.includes(i)){
      s.picked.push(i);s.active=s.picked.length-1;
      if(s.picked.length===spreads[s.spreadId].positions.length)s.phase='reveal';
      persist();redraw('reading',true);const deck=document.querySelector('.reading-deck');if(deck)deck.scrollLeft=deckScroll;if(s.phase==='reveal')requestAnimationFrame(()=>document.querySelector('.reading-stage')?.scrollIntoView({block:'start',behavior:'smooth'}));return;
    }
    if(a==='card'&&Number.isInteger(i)&&s.picked[i]!==undefined){
      if(!s.revealed.includes(i)){s.revealed.push(i);flipped=i;}
      s.active=i;if(s.revealed.length===spreads[s.spreadId].positions.length)s.phase='read';
      persist();redraw('reading',true);return;
    }
  });
  window.addEventListener('pagehide',persist);
  return {render,renderGuide,learningHub,dashboard,validate,export:()=>data,restore:raw=>{data=validate(raw);persist();},reset:()=>{clearTimeout(timer);timer=null;data=blank();guide=null;persist();}};
};
