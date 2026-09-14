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
  const blank=()=>({version:1,settings:{topic:'career',spreadId:'three',questionId:'own',reversals:false,contextEnabled:false},draft:null,history:[],practice:[],daily:[],ui:{view:'gallery',category:'all',guideId:'three',guideActive:0,question:''}});
  let data=blank(),storageOK=true,guide=null,timer=null,flipped=-1,entered=-1;
  const questionPlaceholder='可选填写，例如：推进这件事，我现在能先做哪一步？';
  const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const localDay=()=>{const d=new Date(now());return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
  const phaseLabel={shuffling:'洗牌',cut:'切牌',cutting:'合牌',pick:'选牌',reveal:'翻牌',read:'解读'};
  function stopMotion(){clearTimeout(timer);timer=null;}
  function advanceMotion(){stopMotion();const s=data.draft;if(!s)return;if(s.phase==='shuffling')s.phase='cut';else if(s.phase==='cutting')s.phase='pick';else return;persist();if(data.ui.view==='table')redraw();}
  function ensureMotion(){const s=data.draft;if(!timer&&data.ui.view==='table'&&['shuffling','cutting'].includes(s?.phase)){const phase=s.phase,id=s.id;timer=setTimeout(()=>{timer=null;if(data.draft?.id===id&&data.draft.phase===phase)advanceMotion();},reducedMotion()?0:phase==='shuffling'?2400:850);}}
  function validDraft(raw){
    if(!raw||!spreads[raw.spreadId]||!topics[raw.topic]||!Array.isArray(raw.pool)||raw.pool.length!==catalog.cards.length||new Set(raw.pool.map(c=>c?.id)).size!==catalog.cards.length||raw.pool.some(c=>!cards[c?.id]))return null;
    const count=spreads[raw.spreadId].positions.length;
    if(!Array.isArray(raw.picked)||raw.picked.length>count||new Set(raw.picked).size!==raw.picked.length||raw.picked.some(i=>!Number.isInteger(i)||i<0||i>=raw.pool.length))return null;
    const revealed=Array.isArray(raw.revealed)?[...new Set(raw.revealed.filter(i=>Number.isInteger(i)&&i>=0&&i<raw.picked.length))]:[];
    const ritualPhase=!raw.picked.length&&['shuffling','cut','cutting'].includes(raw.phase)?raw.phase:null;
    if(raw.cutOffset!==undefined&&(!Number.isInteger(raw.cutOffset)||raw.cutOffset<0||raw.cutOffset>=catalog.cards.length))return null;
    if(raw.dailyDate!==undefined&&(!/^\d{4}-\d{2}-\d{2}$/.test(raw.dailyDate)||raw.spreadId!=='daily'))return null;
    return {id:String(raw.id).slice(0,100),at:Number(raw.at)||now(),spreadId:raw.spreadId,topic:raw.topic,questionId:String(raw.questionId).slice(0,80),questionText:typeof raw.questionText==='string'?raw.questionText.trim().slice(0,240):'',contextEnabled:raw.contextEnabled!==false,reversals:!!raw.reversals,pool:raw.pool.map(c=>({id:c.id,reversed:!!raw.reversals&&!!c.reversed})),picked:[...raw.picked],revealed,active:Number.isInteger(raw.active)&&raw.active>=0&&raw.active<raw.picked.length?raw.active:0,phase:ritualPhase||(raw.picked.length<count?'pick':revealed.length<count?'reveal':'read'),...(raw.cutOffset!==undefined?{cutOffset:raw.cutOffset}:{}),...(raw.dailyDate?{dailyDate:raw.dailyDate}:{})};
  }
  function validate(raw){
    if(!raw||raw.version!==1||!Array.isArray(raw.history)||raw.history.length>40||!Array.isArray(raw.practice)||raw.practice.length>2000)throw Error('抽牌记录格式不正确');
    const out=blank(),s=raw.settings;
    if(s&&topics[s.topic]&&spreads[s.spreadId]){const topic=spreads[s.spreadId].topics.includes(s.topic)?s.topic:spreads[s.spreadId].topics[0];out.settings={topic,spreadId:s.spreadId,questionId:topics[topic].questions.some(q=>q.id===s.questionId)||s.questionId==='own'?s.questionId:topics[topic].questions[0].id,reversals:!!s.reversals,contextEnabled:s.contextEnabled!==false};}
    if(raw.draft){out.draft=validDraft(raw.draft);if(!out.draft)throw Error('抽牌进度损坏');}
    for(const h of raw.history){const clean=validDraft(h);if(!clean)throw Error('历史牌组损坏');out.history.push(clean);}
    out.practice=raw.practice.filter(e=>e&&spreads[e.spreadId]&&topics[e.topic]&&Number.isInteger(e.position)&&e.position>=0&&e.position<spreads[e.spreadId].positions.length&&typeof e.correct==='boolean'&&Number.isFinite(e.at)).map(e=>({spreadId:e.spreadId,topic:e.topic,position:e.position,correct:e.correct,at:e.at}));
    const daily=raw.daily===undefined?data.daily:raw.daily;
    if(!Array.isArray(daily)||daily.length>366)throw Error('日签记录格式不正确');
    const days=new Set();for(const r of daily){const clean=validDraft(r);if(!clean?.dailyDate||days.has(clean.dailyDate))throw Error('日签记录格式不正确');days.add(clean.dailyDate);out.daily.push(clean);}
    const ui=raw.ui;if(ui&&['gallery','detail','setup','table'].includes(ui.view)){out.ui={view:ui.view,category:content.categories.some(c=>c.id===ui.category)?ui.category:'all',guideId:spreads[ui.guideId]?ui.guideId:out.settings.spreadId,guideActive:Number.isInteger(ui.guideActive)?Math.max(0,ui.guideActive):0,question:typeof ui.question==='string'?ui.question.slice(0,240):''};}else if(out.draft)out.ui.view='table';
    if(out.ui.view==='table'&&!out.draft)out.ui.view='gallery';
    return out;
  }
  try{const raw=localStorage.getItem(KEY);if(raw)data=validate(JSON.parse(raw));}catch(e){storageOK=false;}
  function persist(){if(data.draft?.dailyDate){data.daily=[structuredClone(data.draft),...data.daily.filter(d=>d.dailyDate!==data.draft.dailyDate)].slice(0,366);}try{localStorage.setItem(KEY,JSON.stringify(data));storageOK=true;}catch(e){storageOK=false;toast('抽牌记录暂时无法写入；可在「我的」导出备份。');}}
  function randomInt(n){
    const word=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;
    do{crypto.getRandomValues(word);}while(word[0]>=limit);
    return word[0]%n;
  }
  function shuffled(list){const a=[...list];for(let i=a.length-1;i>0;i--){const j=randomInt(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
  function question(s){return s.questionText||(s.questionId==='own'?spreads[s.spreadId].bestFor:topics[s.topic].questions.find(q=>q.id===s.questionId)?.text)||spreads[s.spreadId].bestFor;}
  function archive(){if(!data.draft)return;const d=structuredClone(data.draft);if(!d.dailyDate){data.history=data.history.filter(h=>h.id!==d.id);data.history.unshift(d);data.history=data.history.slice(0,40);}}
  function redraw(destination='reading',keep=false){const y=window.scrollY;go(destination);if(keep)window.scrollTo(0,y);}
  function start(daily=false){
    if(data.draft&&data.ui.view==='table')return;
    stopMotion();archive();
    const s=daily?{...data.settings,spreadId:'daily',topic:'career',contextEnabled:false}:data.settings;
    const questionText=daily?'':data.ui.question.trim().slice(0,240);
    try{const pool=shuffled(catalog.cards.map(c=>({id:c.id,reversed:s.reversals?randomInt(2)===1:false})));
      data.draft={...s,questionId:'own',questionText,id:'reading-'+Date.now()+'-'+randomInt(1000000000),at:now(),pool,picked:[],revealed:[],active:0,phase:'shuffling',...(daily?{dailyDate:localDay()}:{})};
    }catch(e){toast('当前浏览器无法随机洗牌，请换用支持的浏览器。');return;}
    data.ui.view='table';persist();redraw();
  }
  function openDaily(){stopMotion();const saved=data.daily.find(d=>d.dailyDate===localDay());if(saved){archive();data.draft=structuredClone(saved);data.ui.view='table';persist();redraw();}else start(true);}
  function cut(offset){const s=data.draft;if(!s||s.phase!=='cut'||![26,39,52].includes(offset))return;s.pool=[...s.pool.slice(offset),...s.pool.slice(0,offset)];s.cutOffset=offset;s.phase='cutting';persist();redraw();}
  function drawBoard(s,guideMode=false,hideLabels=false){
    const d=spreads[s.spreadId];
    return `${d.layout==='celtic'?'<p class="subtleline">展开视图：第 2 张交叉牌放在第 1 张右侧，方便分别点选。</p>':''}<div class="reading-board layout-${esc(d.layout)} count-${d.positions.length} phase-${guideMode?'guide':s.phase}" aria-label="${esc(d.name)}牌位">${d.positions.map((pos,i)=>{
      const drawn=!guideMode&&s.picked[i]!==undefined,revealed=drawn&&s.revealed.includes(i),c=drawn?s.pool[s.picked[i]]:null;
      const selected=guideMode?(guide?.active??data.ui.guideActive)===i:s.active===i;
      return `<button class="reading-slot slot-${i+1} ${selected?'active':''} ${revealed?'revealed':''} ${flipped===i?'just-flipped':''} ${entered===i?'reading-enter':''}" data-reading="${guideMode?'guide-position':'card'}" data-index="${i}" ${!guideMode&&!drawn?'disabled':''} aria-label="${i+1} ${hideLabels?'待回忆的牌位':esc(pos.label)}${drawn?(revealed?'，'+esc(cards[c.id].name)+(c.reversed?'逆位':'正位'):'，点击翻开'):''}"><span class="reading-card ${c?.reversed?'is-reversed':''}">${revealed?img(c.id)+(flipped===i?'<span class="reading-flip-back" aria-hidden="true"></span>':''):`<span class="reading-back ${guideMode||!drawn?'reading-placeholder':''}"><b>${guideMode?i+1:drawn?'':i+1}</b></span>`}</span><span class="reading-label">${i+1} · ${hideLabels?'？':esc(pos.label.replace(/^\d+ · /,''))}</span>${revealed?`<small>${esc(cards[c.id].name)} · ${c.reversed?'逆位':'正位'}</small>`:''}</button>`;
    }).join('')}</div>`;
  }
  function readingText(card,topic,pos,reversed=false,contextEnabled=true){
    const ctx=contextEnabled?card.contexts[topic]:{state:card.core,tension:'以“'+card.core+'”为线索，检查这种倾向是否过度、受阻，或与眼前需要不一致。',advice:card.upright};
    const external=pos.id==='environment';
    const observed=contextEnabled?{love:'对方已经表达的需要、联系安排与互动行为',career:'合作者已经表达的要求、承诺与实际配合',study:'老师或同伴已给出的反馈与实际协作'}[topic]:'已表达的言行、承诺与实际互动';
    const environment=contextEnabled?{love:'相处时间、距离、生活安排与外部支持',career:'团队规则、资源配置、时限与市场信息',study:'课程要求、时间安排、材料与可获得的支持'}[topic]:'可核对的规则、资源、时间与外部支持';
    const expressions={state:ctx.state,tension:ctx.tension,advice:ctx.advice,resource:'以“'+card.core+'”为线索，核对已有的'+(contextEnabled?{love:'沟通基础、边界与支持',career:'经验、人手与资源',study:'基础、材料与学习支持'}[topic]:'经验、支持与现实条件')+'。可思考的使用方向：'+ctx.advice,past:'回看过去，是否曾出现这样的状态：'+ctx.state,trend:'如果当前条件延续，可观察这种主题如何发展：'+ctx.state,unknown:'以“'+card.core+'”作为观察主题，检查'+(external?environment:observed)+'是否出现相关线索。没有已知事实时，先保留为需要核对的问题。'};
    if(!Object.hasOwn(expressions,pos.role))throw Error('不支持的牌位角色');
    let text=expressions[pos.role];
    if(pos.id==='aim')text='目标位提醒你核对：你是否正在追求与“'+card.core+'”有关的状态？它描述想达到的方向，不代表已经实现。结合'+(contextEnabled?topics[topic].label:'当前')+'问题，再看目标是否符合现实需要。';
    if(pos.id==='hopes-fears')text='以“'+card.core+'”为线索，想想自己在'+(contextEnabled?topics[topic].label:'当前')+'问题中期待什么、害怕什么；这些心理预期不等于将发生的结果。';
    return {text,reversal:reversed?card.reversed:'',check:pos.role==='unknown'?(external?'把环境条件与实际信息核对，不把内心感受当成外部事实。':'这一位置只看已表达的言行，无法确定他人的内心；不清楚时需要沟通。'):pos.role==='trend'?'趋势以当前条件为前提，后续行动与环境都可能改变它。':contextEnabled?card.questions[topic]:'这张牌提示的倾向，在现实中有哪些支持或不支持它的证据？'};
  }
  function panel(s){
    const d=spreads[s.spreadId],i=s.active,pos=d.positions[i],drawn=s.pool[s.picked[i]];
    if(!drawn||!s.revealed.includes(i))return '';
    const c=cards[drawn.id],r=readingText(c,s.topic,pos,drawn.reversed,s.contextEnabled);
    return `<section class="reading-interpretation ${flipped===i?'is-entering':''}" aria-live="polite"><div class="eyebrow">逐牌参考 · ${esc(pos.label)}位</div><h2>${esc(c.name)} <small>${drawn.reversed?'逆位':'正位'}</small></h2><p class="reading-position-question">这个位置问：${esc(pos.question)}</p><div class="reading-evidence"><strong>01 · 牌面证据</strong><p>${esc(c.observation)}</p></div><div><strong>02 · 落入问题与牌位</strong><p>${esc(r.text)}</p></div>${drawn.reversed?`<div class="reading-reversal"><strong>03 · 逆位机制</strong><p>${esc(r.reversal)}</p><small>逆位改变主题的表达方式；需要结合实际情况选择，不能直接套用正位结论。</small></div>`:''}<div class="reading-check"><strong>${drawn.reversed?'04':'03'} · 现实核对</strong><p>${esc(r.check)}</p></div><div class="reading-reference-actions"><button class="linkbtn" data-action="zoom" data-id="${esc(c.id)}">放大看牌图 ${icon('zoom')}</button><button class="linkbtn" data-action="card" data-id="${esc(c.id)}">查看单牌完整释义</button></div></section>`;
  }
  function spreadThumb(d){return `<span class="spread-thumb thumb-${esc(d.layout)} count-${d.positions.length}" aria-hidden="true">${d.positions.map(()=>'<i></i>').join('')}</span>`;}
  function category(d){return content.categories.find(c=>c.id===d.category)?.label||'日常生活';}
  function dailyTile(){const saved=data.daily.find(d=>d.dailyDate===localDay()),done=saved?.phase==='read';return `<button class="daily-tile" data-reading="daily"><span class="daily-orbit" aria-hidden="true">✦</span><span><small>${esc(localDay())}</small><strong>塔罗日运</strong><span>${done?'回看今天的提醒':saved?'继续今天的日签':'为今天，翻开一张牌'}</span></span>${icon('arrow')}</button>`;}
  function setup(){const s=data.settings,d=spreads[s.spreadId];
    if(data.ui.view==='detail')return renderGuide();
    if(data.ui.view==='setup')return `<div class="spread-intro reading-sticky-head"><button class="iconbtn" data-reading="question-back" aria-label="返回牌阵说明">${icon('back')}</button><div><div class="eyebrow">${esc(category(d))} · 准备抽牌</div><h1>${esc(d.name)}</h1></div><button class="linkbtn" data-reading="gallery">所有牌阵</button></div><section class="reading-question-setup"><div class="selected-spread-mini">${spreadThumb(d)}<div><strong>${esc(d.name)} · ${d.positions.length} 张</strong><p>${esc(d.summary)}</p></div></div><label class="question-field"><span>想问什么？可以只在心里默念</span><textarea data-reading-question data-i18n-ignore maxlength="240" rows="4" placeholder="${esc(window.TAROT_I18N?.translate(questionPlaceholder)||questionPlaceholder)}">${esc(data.ui.question)}</textarea><small>不填也能抽牌。填写后只保存在这台设备，方便回看。</small></label><label class="reading-toggle"><input type="checkbox" data-reading-setting="reversals" ${s.reversals?'checked':''}><span>加入逆位<small>关闭时全部为正位；开启后每张牌独立随机方向。</small></span></label><button class="primary wide" data-reading="start">开始洗牌 ${icon('arrow')}</button><p class="footnote">牌阵已经包含对应的生活场景。填写的问题用于本地记录，解读依据牌面和牌位组织。</p></section>`;
    const shown=content.spreads.filter(d=>d.id!=='daily'&&(data.ui.category==='all'||d.category===data.ui.category));
    return `<div class="pagehead reading-gallery-head"><div class="eyebrow">YOUR READING TABLE</div><h1>把问题带来，<br>让牌慢慢展开。</h1><p>先看牌阵的样子与用途，再进入洗牌、切牌和抽牌。</p></div>${dailyTile()}${data.draft?`<button class="reading-resume practice-row" data-reading="resume"><span><strong>继续${esc(spreads[data.draft.spreadId].name)}</strong><p>${esc(phaseLabel[data.draft.phase])} · 已保留牌序与进度</p></span>${icon('arrow')}</button>`:''}<nav class="reading-categories" aria-label="按生活场景选择牌阵">${content.categories.map(c=>`<button class="chip ${data.ui.category===c.id?'active':''}" data-reading="category" data-value="${c.id}" aria-pressed="${data.ui.category===c.id}">${esc(c.label)}</button>`).join('')}</nav><section class="reading-setup"><div class="sectionhead"><h2>${esc(content.categories.find(c=>c.id===data.ui.category)?.label||'全部牌阵')}</h2><span class="tiny muted">${shown.length} 种牌阵</span></div><div class="reading-spread-grid">${shown.map(d=>`<button class="reading-spread-choice" data-reading="guide" data-value="${d.id}">${spreadThumb(d)}<span class="spread-choice-copy"><small>${esc(category(d))} · ${d.positions.length} 张</small><strong>${esc(d.name)}</strong><p>${esc(d.bestFor)}</p><span>查看说明 ${icon('arrow')}</span></span></button>`).join('')}</div></section>${historySection()}`;
  }
  // The report connects actual drawn cards. A layout supplies roles, never a predicted story.
  function relatedPairs(d){
    return ({one:[],three:[[0,1],[1,2]],timeline:[[0,1],[1,2]],choice:[[0,3],[1,4],[2,5]],relationship:[[0,1],[2,3],[3,4]],action:[[1,3],[2,3]],study:[[1,3],[2,3]],celtic:[[0,1],[2,6],[7,8],[5,9]]})[d.id]||(d.layout==='choice'?[[0,3],[1,4],[2,5]]:d.positions.slice(1).map((_,i)=>[i,i+1]));
  }
  function relation(a,b){
    const key=[a.card.id,b.card.id].sort().join('|');
    const contrasts={
      'm16|m17':'高塔强调结构受到冲击，星星强调重新建立希望与恢复。把它们放回各自牌位，检查哪里需要承认变化，哪里仍有修复空间。',
      'm13|m16':'死神偏向阶段结束与转换，高塔偏向既有结构被冲击。两张都涉及变化，但要分清逐步告别与突然失效。',
      'm16|p04':'高塔触及结构失效，星币四强调守住已有资源。可以检查：哪些保护仍然必要，哪些坚持已经阻碍调整？',
      'c05|c08':'圣杯五把目光停留在失去的部分，圣杯八则呈现离开不再满足的状态。留意承认失落与主动离开的区别。',
      'm02|m09':'女祭司偏向安静接收与尚未明说的理解，隐士偏向主动抽离、寻找自己的判断。区分等待看清与主动探究。',
      'p04|s04':'星币四强调守住资源与边界，宝剑四强调暂停和恢复。可以检查：此刻需要保存什么，又需要让什么暂时停下来？'
    };
    if(contrasts[key])return {rule:'specific',text:contrasts[key]};
    const as=a.card.id[0],bs=b.card.id[0],an=Number(a.card.id.slice(1)),bn=Number(b.card.id.slice(1));
    if(as!=='m'&&bs!=='m'&&an===bn&&an<=10)return {rule:'same-number',text:'两张数字相同，但花色不同。可以比较同一个阶段怎样分别落在行动、感受、判断或资源上；数字只辅助观察，具体牌面仍是依据。'};
    if(as===bs&&as!=='m')return {rule:'same-suit',text:({w:'两张权杖都聚焦行动与意愿。对照各自的动作，检查推动力量是在支持目标，还是互相消耗。',c:'两张圣杯都聚焦情感与连接。对照人物的注意方向，检查感受、需要与实际互动是否一致。',s:'两张宝剑都聚焦思考、判断与冲突。区分已知事实、心中的解释和可以说清楚的边界。',p:'两张星币都聚焦现实资源与持续投入。检查拥有的条件如何转为实际使用，而不只停留在保护或等待。'})[as]};
    if(as==='m'&&bs==='m')return {rule:'major-pair',text:'两张大阿尔卡纳提供两个较大的主题。结合各自的画面和牌位分清它们的作用，不把张数当成事件严重程度。'};
    if(as==='m'||bs==='m')return {rule:'major-minor',text:'大阿尔卡纳提供整体主题，小阿尔卡纳把观察带回日常做法。检查具体行动是否回应了更大的问题。'};
    const suitKey=[as,bs].sort().join('');
    return {rule:'different-suits',text:({cp:'感受与现实条件放在一起：想维持的连接，需要哪些时间、资源或稳定行动来支持？',cs:'感受与判断放在一起：当前的解释回应了真实需要，还是把担心当成了事实？',cw:'情感与行动放在一起：想采取的动作能否表达真实需要，也给对方留下回应空间？',ps:'现实条件与判断放在一起：计划中的结论，有哪些资源与可核对的信息支持？',pw:'行动与现实条件放在一起：热情能否被可持续的时间、能力与资源承接？',sw:'行动与判断放在一起：推进之前需要说清什么，哪些分析又已经足够支持一次尝试？'})[suitKey]};
  }
  function relationHTML(d,items){
    const pairs=relatedPairs(d);
    if(!pairs.length)return `<p>单牌没有牌间关系。先观察这张牌的核心动作，再结合关注位落到一件可核对的事。</p>`;
    return `<div class="reading-relations">${pairs.map(([ai,bi])=>{const a=items[ai],b=items[bi],r=relation(a,b);return `<details data-reading-relation data-left="${a.card.id}" data-right="${b.card.id}" data-rule="${r.rule}" ${ai===pairs[0][0]&&bi===pairs[0][1]?'open':''}><summary><span>${esc(a.pos.label)} · ${esc(a.card.name)}</span><span class="relation-arrow" aria-hidden="true">↔</span><span>${esc(b.pos.label)} · ${esc(b.card.name)}</span></summary><div class="relation-evidence"><p><b>${esc(a.card.name)}</b> · ${esc(a.card.core)}</p><p><b>${esc(b.card.name)}</b> · ${esc(b.card.core)}</p></div><p>${esc(r.text)}</p>${a.draw.reversed||b.draw.reversed?'<small>其中有逆位：上面比较的是核心主题，还要结合该牌的逆位提示检查受阻、内化或过度表达。</small>':''}</details>`;}).join('')}</div>`;
  }
  function synthesis(d,items){
    const groups=({
      one:[['关注与行动',[0]]],three:[['先看当下，再检查阻碍',[0,1]],['回应方向',[2]]],timeline:[['已发生与正在持续',[0,1]],['条件延续时的观察方向',[2]]],
      choice:[['选项 A：支持、代价与趋势',[0,1,2]],['选项 B：支持、代价与趋势',[3,4,5]]],
      relationship:[['分清自己与可观察的互动',[0,1]],['张力与连接基础',[2,3]],['我能采取的行动',[4]]],
      action:[['起点与可用条件',[0,1]],['让行动回应阻力',[2,3]]],study:[['当前表现与卡点',[0,1]],['支点与下一轮练习',[2,3]]],
      celtic:[['核心处境',[0,1]],['目标与已有背景',[2,3,4]],['态度、外部条件与心理预期',[6,7,8]],['带着条件比较趋势',[5,9]]]
    })[d.id]||(d.layout==='choice'?[['选项 A：支持、代价与趋势',[0,1,2]],['选项 B：支持、代价与趋势',[3,4,5]]]:d.positions.map((p,i)=>[p.label,[i]]));
    return groups.map(([label,indices])=>`<div class="reading-synthesis-group"><h3>${esc(label)}</h3>${indices.map(i=>{const x=items[i];return `<p><b>${esc(x.pos.label)} · ${esc(x.card.name)}</b><br>${esc(x.draw.reversed?x.card.reversed:['advice','tension'].includes(x.pos.role)?x.r.text:x.card.core)}</p>`;}).join('')}</div>`).join('')+`<p class="reading-synthesis-rule">${esc(d.readingTip)}</p>`;
  }
  function professionalReport(s){
    const d=spreads[s.spreadId],items=d.positions.map((pos,i)=>{const draw=s.pool[s.picked[i]],card=cards[draw.id],r=readingText(card,s.topic,pos,draw.reversed,s.contextEnabled);return {pos,draw,card,r};});
    const action=[...items].reverse().find(x=>x.pos.role==='advice')||items.at(-1);
    return `<section class="professional-report" data-reading-report="${d.id}"><div class="eyebrow">READING REFERENCE</div><h2>把这组牌放在一起看</h2><p class="reading-report-intro">先看下面的主线，再展开感兴趣的细节。点牌面可随时查看单牌依据。</p><div class="reading-rhythm"><article><span>01</span><div><strong>问题与牌阵任务</strong><p><span>问题：</span><span ${s.questionText?'data-i18n-ignore':''}>${esc(question(s))}</span></p><small>${esc(d.bestFor)}</small><small>参考按所选语境、牌面与牌位组织；不会分析你输入的文字。</small></div></article><article><span>02</span><div><details class="reading-position-details"><summary>展开全部牌位的解读</summary>${items.map(x=>`<div class="reading-report-position"><h3>${esc(x.pos.label)} · ${esc(x.card.name)} <small>${x.draw.reversed?'逆位':'正位'}</small></h3><p>${esc(x.r.text)}</p>${x.draw.reversed?`<p class="reading-reversal">${esc(x.r.reversal)}</p>`:''}<small>${esc(x.card.observation)}</small><small>${esc(x.r.check)}</small></div>`).join('')}</details></div></article><article><span>03</span><div><strong>这几张牌怎样联系</strong>${relationHTML(d,items)}</div></article><article><span>04</span><div><strong>按牌位整合主线</strong>${synthesis(d,items)}</div></article><article><span>05</span><div><strong>带回现实的一件事</strong>${action.pos.role==='advice'?`<p>${esc(action.r.text)}</p>`:''}<p>${esc(action.r.check)}</p><small>${esc(d.compareTip)}</small><small>把解读当作需要核对的观察方向。个人选择、他人内心和具体结果，需要现实信息才能判断。</small></div></article></div><button class="primary wide" data-reading="finish">收好这次牌阵 ${icon('save')}</button></section>`;
  }
  function ritual(s){
    const steps=['洗牌','切牌','选牌','翻牌'],active={shuffling:0,cut:1,cutting:1,pick:2,reveal:3,read:3}[s.phase];
    const progress=`<ol class="ritual-progress">${steps.map((x,i)=>`<li class="${i===active?'current':i<active?'done':''}" ${i===active?'aria-current="step"':''}><span>${i+1}</span>${x}</li>`).join('')}</ol>`;
    if(s.phase==='shuffling')return progress+`<section class="reading-shuffle ritual-space"><div class="ritual-glow" aria-hidden="true"></div><div class="shuffle-pack ritual-pack" aria-hidden="true">${Array.from({length:9},(_,i)=>`<div class="reading-back" style="--card-index:${i};--side:${i%2?-1:1}"></div>`).join('')}</div><h2 role="status">正在洗牌…</h2><p>呼吸一次，让心里的问题慢慢清楚。</p><div class="reading-motion-actions"><button class="secondary" data-reading="skip-animation">洗好了，继续切牌</button></div></section>`;
    if(['cut','cutting'].includes(s.phase))return progress+`<section class="ritual-space reading-cut ${s.phase==='cutting'?'is-cutting':''}" data-cut-offset="${s.cutOffset??''}"><div class="ritual-glow" aria-hidden="true"></div><h2>${s.phase==='cutting'?'合起牌叠…':'轻点一叠，决定新的起点。'}</h2><p>切牌只移动已经洗好的牌序，不会重新随机。</p><div class="cut-piles">${[26,39,52].map((n,i)=>`<button data-reading="cut" data-index="${n}" class="cut-pile ${s.cutOffset===n?'selected':''}" style="--pile-index:${i}" ${s.phase==='cutting'?'disabled':''} aria-label="${['选择左侧牌叠','选择中间牌叠','选择右侧牌叠'][i]}">${[0,1,2].map(j=>`<span class="reading-back" style="--layer:${j}" aria-hidden="true"></span>`).join('')}<small>${['左侧','中间','右侧'][i]}</small></button>`).join('')}</div><button class="linkbtn" data-reading="${s.phase==='cutting'?'skip-animation':'cut-default'}">${s.phase==='cutting'?'直接展开牌背':'从中间切开'}</button></section>`;
    return progress;
  }
  function dailyResult(s){const draw=s.pool[s.picked[0]],c=cards[draw.id];return `<section class="daily-result" data-daily-date="${s.dailyDate}"><span class="daily-date">${esc(s.dailyDate)}</span><div class="eyebrow">TODAY’S CARD</div><h2>今天，把注意力放在这里。</h2><p class="daily-core">${esc(c.core)}</p><div><strong>一件可以尝试的事</strong><p>${esc(draw.reversed?c.reversed:c.upright)}</p><small>选择其中一件与你实际生活有关的小事，今晚再看看发生了什么。</small></div><p class="subtleline">今天的日签已经保存。重新打开，仍是这张牌。</p><button class="primary wide" data-reading="finish">收好今天的提醒 ${icon('save')}</button><details class="daily-reference"><summary>查看这张牌的依据</summary>${panel(s)}</details></section>`;}
  function render(){
    const s=data.draft;if(!s||data.ui.view!=='table')return setup();ensureMotion();
    const d=spreads[s.spreadId];
    const header=`<div class="spread-intro reading-sticky-head"><button class="iconbtn" data-reading="pause" aria-label="保存进度并返回牌阵">${icon('back')}</button><div><div class="eyebrow">${esc(category(d))} · ${s.reversals?'含正逆位':'仅正位'}</div><h1>${esc(d.name)}</h1></div><button class="linkbtn" data-reading="gallery">所有牌阵</button></div>${s.dailyDate?`<p class="daily-day">${esc(s.dailyDate)}</p>`:`<div class="scenario"><strong>这次的问题</strong><span ${s.questionText?'data-i18n-ignore':''}>${esc(question(s))}</span></div>`}${!storageOK?'<p class="storage-warning">当前浏览器不能保存，请导出备份。</p>':''}`;
    if(['shuffling','cut','cutting'].includes(s.phase))return header+ritual(s);
    const complete=s.revealed.length===d.positions.length;
    return `${header}${ritual(s)}<div class="reading-stage"><h2>${s.phase==='pick'?`选第 ${s.picked.length+1} 张 · ${esc(d.positions[s.picked.length].label)}`:complete?'你的牌阵已展开':'轻点牌背，逐张翻开'}</h2><span>${s.phase==='pick'?s.picked.length:s.revealed.length} / ${d.positions.length}</span></div>${drawBoard(s)}${s.phase==='pick'?`<div class="reading-deck-label"><strong>让手指停在一张牌上</strong><span>${78-s.picked.length} 张可选 · 左右滑动</span></div><div class="reading-deck ritual-fan" aria-label="洗好的完整牌组">${s.pool.map((_,i)=>`<button class="reading-pick" data-reading="pick" data-index="${i}" style="--fan-angle:${(i%13-6)*1.8}deg" ${s.picked.includes(i)?'disabled':''} aria-label="选择第 ${i+1} 张牌背"><span class="reading-back"><b>${s.picked.includes(i)?'✓':'✧'}</b></span></button>`).join('')}</div><p class="subtleline">选出的牌按顺序进入牌位；洗牌后顺序保持不变。</p>`:''}${s.phase==='reveal'?'<p class="subtleline">每一次翻开，都留一点时间看见画面。</p>':''}<div data-reading-panel>${s.dailyDate?'':panel(s)}</div><div data-reading-completion>${complete?(s.dailyDate?dailyResult(s):professionalReport(s)):''}</div><button class="linkbtn" data-reading="new">保留这组记录，开始新问题</button>`;
  }
  function historySection(){return `<details class="reading-history section"><summary>我的抽牌记录 · ${data.history.length}</summary>${data.history.map(h=>`<button class="practice-row" data-reading="history" data-value="${esc(h.id)}"><span><strong>${esc(spreads[h.spreadId].name)}</strong><p><span ${h.questionText?'data-i18n-ignore':''}>${esc(question(h))}</span></p><small>${new Date(h.at).toLocaleDateString('zh-CN')} · ${esc(phaseLabel[h.phase])}</small></span>${icon('arrow')}</button>`).join('')||'<p class="empty">收好一组牌后，可以随时回来再看。</p>'}</details><details class="reading-history section"><summary>我的日签 · ${data.daily.length}</summary>${data.daily.map(h=>`<button class="practice-row" data-reading="daily-history" data-value="${esc(h.dailyDate)}"><span><strong>${esc(h.dailyDate)}</strong><small>${esc(phaseLabel[h.phase])}</small></span>${icon('arrow')}</button>`).join('')||'<p class="empty">每天的相遇，会留在这里。</p>'}</details>`;}
  function dashboard(){return `<section class="section"><div class="sectionhead"><h2>我的牌桌</h2><span class="tiny muted">${data.history.length} 组记录 · ${data.daily.length} 张日签</span></div>${data.draft?`<button class="practice-row" data-reading="resume"><span><strong>继续${esc(spreads[data.draft.spreadId].name)}</strong><p>保留了已选牌与正逆位，回来不会重抽。</p></span>${icon('arrow')}</button>`:''}<button class="secondary wide" data-reading="gallery">打开抽牌与记录</button><p class="subtleline">抽牌和日签独立保存，不记为学习成绩。</p></section>`;}
  function learningHub(){return `<section class="section"><div class="sectionhead"><h2>牌阵与问题，一起练</h2><span class="tiny muted">感情 · 事业 · 学业</span></div><div class="context-lessons">${content.units.map(u=>`<button class="feature" data-learn-start="${u.id}"><div><span class="eyebrow">${u.steps.length} 步 · 情境练习</span><h3>${esc(u.title)}</h3><p>${esc(u.subtitle)}</p></div>${icon('arrow')}</button>`).join('')}</div><details class="spread-guide-list"><summary>认识不同牌阵：位置、用途与读法</summary>${content.spreads.map(d=>`<button class="practice-row" data-reading="guide" data-value="${d.id}"><span class="practice-number">${d.positions.length}</span><span class="practice-text"><strong>${esc(d.name)}</strong><p>${esc(d.summary)}</p></span>${icon('arrow')}</button>`).join('')}</details></section>`;}
  function openGuide(id){if(!spreads[id])return;data.ui.view='detail';data.ui.guideId=id;data.ui.guideActive=0;guide={spreadId:id,active:0,topic:spreads[id].topic,quiz:null};persist();redraw('spread-guide');}
  function renderGuide(){
    if(!guide||guide.spreadId!==data.ui.guideId)guide={spreadId:data.ui.guideId,active:0,topic:spreads[data.ui.guideId].topic,quiz:null};const d=spreads[guide.spreadId];guide.active=Math.min(data.ui.guideActive,d.positions.length-1);const pos=d.positions[guide.active];
    return `<div class="spread-intro reading-sticky-head"><button class="iconbtn" data-reading="guide-back" aria-label="返回牌阵选择">${icon('back')}</button><div><div class="eyebrow">${esc(category(d))} · 牌阵说明</div><h1>${esc(d.name)}</h1></div></div><p class="reading-guide-summary">${esc(d.summary)}</p><div class="reading-selected"><strong>能力范围</strong><p>${esc(d.bestFor)}</p><small><b>不适合：</b>${esc(d.avoid)}</small></div>${drawBoard({spreadId:d.id},true)}<section class="reading-guide-position"><div class="eyebrow">点布局中的牌位查看</div><h2>${guide.active+1} · ${esc(pos.label)}</h2><p>${esc(pos.question)}</p></section><section class="spread-position-list"><h2>这个牌阵的全部位置</h2>${d.positions.map((p,i)=>`<button data-reading="guide-position" data-index="${i}" class="${(guide?.active??data.ui.guideActive)===i?'active':''}"><span>${i+1}</span><div><strong>${esc(p.label)}</strong><p>${esc(p.question)}</p></div></button>`).join('')}</section><section class="reading-whole"><div class="eyebrow">解读顺序</div><h2>抽完以后怎样解？</h2><p>${esc(d.readingTip)}</p><p>${esc(d.compareTip)}</p></section><button class="primary wide" data-reading="use-spread" data-value="${d.id}">就用这个牌阵 ${icon('arrow')}</button>`;
  }
  function guideTest(){
    const d=spreads[guide.spreadId],pos=d.positions[guide.active],correct=d.id+'-'+guide.active;
    const seen=new Set([pos.question]);const wrong=[];
    for(const spread of [d,...content.spreads.filter(s=>s.id!==d.id)])for(const [i,p]of spread.positions.entries()){if(p.role!==pos.role&&!seen.has(p.question)){wrong.push({id:spread.id+'-'+i,text:p.question});seen.add(p.question);}}
    guide.quiz={position:guide.active,correct,selected:null,options:shuffled([{id:correct,text:pos.question},...shuffled(wrong).slice(0,3)])};
  }
  function selectCard(i){
    const s=data.draft;if(!s||!Number.isInteger(i)||s.picked[i]===undefined)return;
    if(s.revealed.includes(i)&&s.active===i)return;
    const fresh=!s.revealed.includes(i);if(fresh){s.revealed.push(i);flipped=i;}
    s.active=i;if(s.revealed.length===spreads[s.spreadId].positions.length)s.phase='read';persist();
    if(fresh&&s.phase==='read'){redraw('reading',true);return;}
    // Replace only the board and reference regions. The page, open report and scroll stay put.
    const board=document.querySelector('.reading-board'),panelNode=document.querySelector('[data-reading-panel]');
    if(board&&panelNode){const holder=document.createElement('div');holder.innerHTML=drawBoard(s);board.replaceWith(holder.querySelector('.reading-board'));panelNode.innerHTML=panel(s);const completion=document.querySelector('[data-reading-completion]');if(completion&&s.phase==='read'&&!completion.children.length)completion.innerHTML=s.dailyDate?dailyResult(s):professionalReport(s);const title=document.querySelector('.reading-stage h2'),count=document.querySelector('.reading-stage>span');if(title&&s.phase==='read')title.textContent='你的牌阵已展开';if(count)count.textContent=s.revealed.length+' / '+spreads[s.spreadId].positions.length;}
    else redraw('reading',true);
  }
  document.addEventListener('tarot-language-change',()=>{const field=document.querySelector('[data-reading-question]');if(field)field.placeholder=window.TAROT_I18N.translate(questionPlaceholder);});
  document.addEventListener('change',e=>{if(e.target.matches('[data-reading-setting=reversals]')&&data.ui.view==='setup'){data.settings.reversals=e.target.checked;persist();}});
  document.addEventListener('input',e=>{if(e.target.matches('[data-reading-question]')&&data.ui.view==='setup'){data.ui.question=e.target.value.slice(0,240);persist();}});
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-reading]');if(!b)return;const a=b.dataset.reading,v=b.dataset.value,i=Number(b.dataset.index),s=data.draft;flipped=-1;entered=-1;
    if(a==='daily'){openDaily();return;}
    if(a==='resume'){data.ui.view=s?'table':'gallery';persist();redraw();return;}
    if(['gallery','pause','guide-back'].includes(a)){stopMotion();data.ui.view='gallery';persist();redraw();return;}
    if(a==='category'&&content.categories.some(c=>c.id===v)){data.ui.category=v;data.ui.view='gallery';persist();redraw('reading',true);return;}
    if(a==='guide'){stopMotion();openGuide(v);return;}
    if(a==='question-back'){openGuide(data.settings.spreadId);return;}
    if(a==='guide-position'&&guide&&Number.isInteger(i)&&spreads[guide.spreadId].positions[i]){guide.active=i;data.ui.guideActive=i;persist();const active=document.querySelector('.reading-guide-position');if(active){const pos=spreads[guide.spreadId].positions[i];active.innerHTML=`<div class="eyebrow">点布局中的牌位查看</div><h2>${i+1} · ${esc(pos.label)}</h2><p>${esc(pos.question)}</p>`;document.querySelectorAll('[data-reading=guide-position]').forEach(el=>el.classList.toggle('active',Number(el.dataset.index)===i));}else redraw('spread-guide',true);return;}
    if(a==='use-spread'&&spreads[v]){const d=spreads[v];stopMotion();data.settings={...data.settings,spreadId:v,topic:d.topic,questionId:'own',contextEnabled:d.contextEnabled};data.ui.view='setup';data.ui.question='';persist();redraw();return;}
    if(a==='history'||a==='daily-history'){const h=a==='history'?data.history.find(h=>h.id===v):data.daily.find(h=>h.dailyDate===v);if(!h)return;stopMotion();archive();data.draft=structuredClone(h);data.ui.view='table';persist();redraw();return;}
    if(a==='finish'||a==='new'){archive();persist();data.draft=null;stopMotion();data.ui.view='gallery';data.ui.question='';persist();redraw();return;}
    if(a==='start'){start();return;}
    if(a==='skip-animation'){advanceMotion();return;}
    if(a==='cut'){cut(i);return;}
    if(a==='cut-default'){cut(39);return;}
    if(!s)return;
    const deckScroll=document.querySelector('.reading-deck')?.scrollLeft||0;
    if(a==='pick'&&s.phase==='pick'&&Number.isInteger(i)&&i>=0&&i<s.pool.length&&!s.picked.includes(i)){
      s.picked.push(i);s.active=s.picked.length-1;entered=s.active;
      if(s.picked.length===spreads[s.spreadId].positions.length)s.phase='reveal';
      persist();redraw('reading',true);const deck=document.querySelector('.reading-deck');if(deck)deck.scrollLeft=deckScroll;if(s.phase==='reveal')requestAnimationFrame(()=>document.querySelector('.reading-stage')?.scrollIntoView({block:'start',behavior:reducedMotion()?'auto':'smooth'}));return;
    }
    if(a==='card')selectCard(i);
  });
  window.addEventListener('pagehide',persist);
  return {isFocused:()=>data.ui.view==='table'&&!!data.draft&&data.draft.phase!=='read',render,renderGuide,learningHub,dashboard,openDaily,validate,export:()=>data,restore:raw=>{stopMotion();data=validate(raw);guide=null;persist();},reset:()=>{stopMotion();data=blank();guide=null;persist();}};
};
