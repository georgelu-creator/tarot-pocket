/* Offline authored coaching. Open recall stays self-report; choices are evidence,
   not proof of mastery. No network or free-text grading. */
window.TarotGuided = (() => {
  'use strict';
  const cards=()=>Object.fromEntries([...(window.TAROT_GUIDED_MAJOR?.cards||[]),...(window.TAROT_GUIDED_MINOR?.cards||[])].map(c=>[c.id,c]));
  const topics={career:'工作',love:'关系',study:'学习'};
  const roles={state:'现状',tension:'阻碍',advice:'建议'};
  const names={intro:'观察',image:'推导',meaning:'理解',compare:'辨析',application:'换位',reversal:'逆位',recall:'回忆'};
  const numberHints=['','开始与潜能','两端、连接与选择','展开与初步成形','结构、稳定与固定','扰动、竞争与调整','协调、恢复与移动','检验、策略与坚持','组织、推进与熟练','积累、成熟与个人承受','完成、饱和与转入下一轮'];
  const elements={w:['火','行动、意愿、创造与目标'],c:['水','感受、关系与回应'],s:['风','思想、语言、判断与冲突'],p:['土','资源、身体、技能与现实边界']};
  const courtHints=['探索与初学','追求与行动','涵养与内在整合','统筹与承担责任'];
  function blank(key){return {key,part:0,selected:'',attempts:[],marks:[],note:'',compareSeen:false};}
  function validate(raw,key){
    const out=blank(key);if(!raw||raw.key!==key)return out;
    out.part=key==='application'&&raw.part===1?1:0;
    const choice=v=>['yes','near','over','d0','d1','d2','unknown','self-2','self-3','self-4'].includes(v);
    if(choice(raw.selected))out.selected=raw.selected;
    if(Array.isArray(raw.attempts))out.attempts=raw.attempts.slice(0,2).filter(x=>x&&choice(x.selected)&&typeof x.correct==='boolean').map(x=>({selected:x.selected,correct:x.correct,hint:!!x.hint}));
    if(Array.isArray(raw.marks))out.marks=[...new Set(raw.marks.filter(x=>['image','meaning','application'].includes(x)))];
    if(typeof raw.note==='string')out.note=raw.note.slice(0,600);
    out.compareSeen=!!raw.compareSeen;
    return out;
  }
  function framework(c){
    const prefix=c.id[0],n=Number(c.id.slice(1));
    if(prefix==='m')return [{label:'大阿尔卡纳',text:'从人物与处境理解人生主题；不套用小牌的数字公式。'}];
    return [{label:c.suit+' · '+elements[prefix][0],text:elements[prefix][1]},
      {label:n>10?c.number:'数字 '+c.number,text:n>10?courtHints[n-11]:numberHints[n]}];
  }
  function makeStep(key,c,lesson,deck,s){
    const g=cards()[c.id];if(!g)throw Error('Missing guided card '+c.id);
    const near=deck[lesson.compareId],part=s.guided?.part||0;
    if(key==='image')return {title:'从动作推到含义',prompt:g.reason.prompt,options:g.reason.options,correct:'yes'};
    if(key==='meaning')return {title:'把画面和主干连起来',prompt:'借助下面的结构，用一句话解释：画面中的动作，为什么会形成这张牌的核心含义？'};
    if(key==='compare')return {title:'相似，但不是同一回事',prompt:'先在心里说出两张牌最关键的区别，再核对。',near};
    if(key==='application')return {title:part?'只换牌位，怎样改读？':'把理解放进一个问题',prompt:c.questions[s.topic],role:part?'advice':'tension'};
    if(key==='reversal')return {title:'用背景判断逆位方向',context:g.reversal.context,prompt:g.reversal.prompt,options:g.reversal.options,correct:'yes'};
    return null;
  }
  function render(c,lesson,deck,s,h){
    const {esc,img,icon,ordered,head,scaffold}=h,key=s.steps[s.index],g=cards()[c.id],a=s.guided||blank(key),answer=s.answers[key];
    if(!g)throw Error('Missing guided card '+c.id);
    const face=()=>`<button class="journey-image guided-face" data-action="zoom" data-id="${c.id}" aria-label="放大牌面">${img(c.id)}</button>`;
    const frame=content=>`<main class="journey-shell guided-shell">${head}<section class="journey-stage guided-stage" data-learning-game="${key}">${content}</section></main>`;
    const next=label=>`<button class="primary wide" data-journey="next">${label||'带着这个理解，继续'} ${icon('arrow')}</button>`;
    const note=()=>`<details class="guided-own-note"><summary>用自己的话留一句（可选）</summary><label><span>只存在你的学习记录里，不自动评分。</span><textarea data-guided-note data-i18n-ignore maxlength="600" rows="2">${esc(a.note)}</textarea></label></details>`;
    const reference=()=>`<details class="guided-reference"><summary>再看画面依据与结构</summary><p>${esc(c.observation)}</p><p>${esc(lesson.why)}</p>${scaffold(c)}</details>`;
    if(key==='intro')return frame(`<div class="guided-observation">${face()}<div><span class="eyebrow">先不看牌义</span><h1>${esc(g.observe)}</h1><p class="guided-prompt-hint">在心里描述动作、物品和它们的关系。可以点图放大。</p>${!s.inspected?'<button class="primary wide" data-journey="inspect">我观察好了，核对画面</button>':`<div class="guided-coach" role="status"><strong>先分清画面与解释</strong><p>${esc(c.observation)}</p><p class="tiny muted">你想到的感受可以保留；接下来用可见动作检查它。</p></div>${next('接着想：这个动作意味着什么')}`}</div></div>`);
    if(key==='recall')return frame(`<div class="guided-recall"><span class="eyebrow">合上牌图，也合上提示</span><h1>用自己的话，把它串起来</h1><p>不看提示，回想这张牌的一个动作，解释它为什么对应核心含义，再举一种用法。</p>${!s.revealed?`<div class="guided-memory-blank" aria-label="牌面已遮住"><span>?</span><p>一个画面动作 · 一句核心含义 · 一种生活用法</p></div>${note()}<button class="linkbtn" data-guided="recall-hint">给我一个回忆方向</button>${s.hint?`<div class="guided-coach"><p>${esc(g.recall)}</p><small>本次使用了提示，记录为辅助回忆。</small></div>`:''}<button class="primary wide" data-journey="reveal">我已经回想过，展开核对</button>`:`<div class="guided-recap">${face()}<div><strong>${esc(lesson.anchor)}</strong><p>${esc(lesson.why)}</p><p>${esc(c.contexts[s.topic].advice)}</p></div></div>${answer?`<section class="journey-feedback" role="status"><strong>回忆自评已记录</strong><p>这记录的是你刚才想起了什么；隔天再回忆，才知道是否记牢。</p>${next('收好这张牌的理解')}</section>`:`<p><strong>展开答案之前，你自己想起了哪些？</strong></p><div class="guided-memory-check">${[['image','画面中的动作'],['meaning','动作为什么对应牌义'],['application','放进生活问题怎样解释']].map(([v,t])=>`<button class="secondary" data-guided="mark" data-value="${v}" aria-pressed="${a.marks.includes(v)}">${a.marks.includes(v)?'✓ ':''}${t}</button>`).join('')}</div><button class="primary wide" data-guided="save-recall">${a.marks.length?'记录这次回忆':'没想起来，也如实记录'}</button>`}`}</div>`);
    const step=makeStep(key,c,lesson,deck,s);
    if(key==='compare')return frame(`<div class="guided-copy"><span class="eyebrow">比较画面动作，不只比较关键词</span><h1>${step.title}</h1><div class="guided-pair">${[c,step.near].map(x=>`<figure><button class="journey-image" data-action="zoom" data-id="${x.id}" aria-label="放大牌面">${img(x.id)}</button><figcaption>${esc(x.name)}</figcaption></figure>`).join('')}</div><p>${esc(step.prompt)}</p>${!a.compareSeen?'<button class="primary wide" data-guided="compare-reveal">我说过区别了，核对两种动作</button>':`<div class="guided-coach"><strong>区别落在这里</strong><p>${esc(lesson.distinction)}</p><div class="guided-contrast"><p><b>${esc(c.name)}</b>${esc(c.observation)}</p><p><b>${esc(step.near.name)}</b>${esc(step.near.observation)}</p></div></div>${answer?`<section class="journey-feedback" role="status"><strong>辨析自评已记录</strong>${next()}</section>`:`<p>看对照前，你是否已经说出了这个差别？</p><div class="guided-self-ratings"><button class="secondary" data-guided="compare-rate" data-value="2">还没分清</button><button class="secondary" data-guided="compare-rate" data-value="3">大致有印象</button><button class="secondary" data-guided="compare-rate" data-value="4">能说明区别</button></div>`}`}</div>`);
    if(key==='meaning')return frame(`<div class="guided-copy">${face()}<h1>${step.title}</h1><div class="guided-framework">${framework(c).map(x=>`<p><strong>${esc(x.label)}</strong><span>${esc(x.text)}</span></p>`).join('')}</div><p class="tiny muted">结构只给线索，具体含义仍要由画面支持。</p><p>${esc(step.prompt)}</p>${!a.compareSeen?'<button class="primary wide" data-guided="meaning-reveal">我解释过了，核对连接</button>':`<div class="guided-coach"><strong>${esc(c.core)}</strong><p>${esc(lesson.why)}</p></div>${answer?`<section class="journey-feedback" role="status"><strong>理解自评已记录</strong>${next()}</section>`:`<p>展开前，你是否能把动作和含义连起来？</p><div class="guided-self-ratings"><button class="secondary" data-guided="meaning-rate" data-value="2">还不能解释</button><button class="secondary" data-guided="meaning-rate" data-value="3">只想到一部分</button><button class="secondary" data-guided="meaning-rate" data-value="4">能说清连接</button></div>`}`}</div>`);
    const chosen=a.selected,locked=!!chosen,correct=chosen===step.correct;
    const top=key==='application'?`<div class="guided-case"><span class="eyebrow">${topics[s.topic]} · 同一张牌，同一个问题</span><p>${esc(step.prompt)}</p><div class="guided-board journey-board">${['state','tension','advice'].map((role,i)=>`<div class="guided-slot ${step.role===role?'occupied':''}"><span>${step.role===role?img(c.id):i+1}</span><strong>${roles[role]}</strong></div>`).join('')}</div>${a.part?`<p class="guided-previous"><strong>刚才在阻碍位：</strong>${esc(c.contexts[s.topic].tension)}</p><p class="tiny">现在只改成建议位。核心不变，回答的任务变了。</p>`:''}</div>`:`<div class="guided-card-line">${face()}<div><span class="eyebrow">${names[key]}</span><strong>${esc(c.name)}</strong>${key==='reversal'?'<span class="tag">逆位情境</span>':'<span class="tiny muted">点图查看细节</span>'}</div></div>`;
    if(key==='application')return frame(`<div class="guided-copy">${top}<h1>${step.title}</h1><p class="guided-question">${step.role==='tension'?'如果这张牌是阻碍，你会怎样描述卡住的地方？':'现在它成了建议：同一主题怎样转成可尝试的行动？'}</p><p class="tiny muted">先在心里解一句，再核对参考。开放解读不设唯一答案。</p>${!a.compareSeen?'<button class="primary wide" data-guided="application-reveal">我解过了，看看这个牌位</button>':`<div class="guided-coach"><strong>${roles[step.role]}位的一种参考</strong><p>${esc(c.contexts[s.topic][step.role])}</p><p>${esc(lesson.why)}</p><small>${step.role==='tension'?'这个位置找出主题怎样形成阻力，不是预言不好的结果。':'这个位置把主题变成行动，不是保证行动后的结果。'}</small></div>${a.selected?`<section class="journey-feedback" role="status"><strong>牌位应用自评已记录</strong>${a.part?next():'<button class="primary wide" data-guided="change-position">保持问题，只换牌位</button>'}</section>`:`<p>展开前，你是否回应了这个位置的问题，并保留了牌面依据？</p><div class="guided-self-ratings"><button class="secondary" data-guided="application-rate" data-value="2">还没有思路</button><button class="secondary" data-guided="application-rate" data-value="3">只回应了一部分</button><button class="secondary" data-guided="application-rate" data-value="4">有牌位也有依据</button></div>`}`}</div>`);
    const foundation=key==='meaning'?`<div class="guided-framework">${framework(c).map(x=>`<p><strong>${esc(x.label)}</strong><span>${esc(x.text)}</span></p>`).join('')}</div><p class="tiny muted">结构只给线索，具体含义仍要由画面支持。</p>`:'';
    const options=`<div class="journey-options guided-options">${ordered(step.options,s).map((o,i)=>`<button class="journey-option ${locked?(o.id===step.correct?'correct':o.id===chosen?'incorrect':''):''}" data-guided="answer" data-value="${o.id}" ${locked?'disabled':''}><span class="letter">${String.fromCharCode(65+i)}</span><span>${esc(o.text)}</span>${locked&&(o.id===step.correct||o.id===chosen)?`<b class="answer-marker">${o.id===step.correct?'✓':'✕'}</b>`:''}</button>`).join('')}</div>`;
    const result=locked?`<section class="journey-feedback ${correct?'correct':'incorrect'}" role="status"><strong>${chosen==='unknown'?'这次还不确定':correct?'✓ 这题答对了':'✕ 这题答错了'}</strong>${chosen!=='unknown'?`<p>${esc(step.options.find(o=>o.id===chosen)?.feedback||lesson.why)}</p>`:''}${!correct?`<p><b>本题更有依据的读法：</b>${esc(step.options.find(o=>o.id==='yes').text)}</p><p>${esc(step.options.find(o=>o.id==='yes').feedback)}</p>`:''}${key==='application'?`<p>${roles[step.role]}${step.role==='tension'?'位要找出卡住事情的表达；同一个主题，下一步会变成行动建议。':'位要把牌的主题变成可尝试的行动；它不保证行动后的现实结果。'}</p>`:''}<details class="guided-alternatives"><summary>其他读法差在哪里？</summary>${step.options.filter(o=>o.id!==chosen).map(o=>`<p><strong>${esc(o.text)}</strong><span>${esc(o.feedback)}</span></p>`).join('')}</details>${note()}${key==='application'&&!a.part?'<button class="primary wide" data-guided="change-position">保持问题，只换牌位</button>':next()}</section>`:`<div class="journey-help"><button class="linkbtn" data-guided="hint">我需要一点提示</button><button class="linkbtn" data-guided="unknown">现在还不能判断</button></div>${s.hint?`<div class="guided-coach" role="status"><p>${esc(lesson.why)}</p><small>这次用过提示，会按辅助练习记录。</small></div>`:''}`;
    return frame(`<div class="guided-copy">${top}<h1>${esc(step.title)}</h1>${foundation}${step.context?`<p class="guided-context">${esc(step.context)}</p>`:''}${key!=='application'?`<p class="guided-question">${esc(step.prompt)}</p>`:`<p class="guided-question">这张牌在${roles[step.role]}位，哪种表达更回应当前问题？</p>`}${options}${result}${locked?reference():''}</div>`);
  }
  function handle(action,el,s,h){
    const key=s.steps[s.index],a=s.guided||(s.guided=blank(key));
    if(action==='inspect'&&key==='intro'){s.inspected=true;h.persist();h.refresh();return true;}
    if(action==='recall-hint'&&key==='recall'&&!s.revealed){s.hint=true;h.persist();h.refresh();return true;}
    if(action==='meaning-reveal'&&key==='meaning'){a.compareSeen=true;h.persist();h.refresh();return true;}
    if(action==='meaning-rate'&&key==='meaning'&&a.compareSeen){const q=Number(el.dataset.value);if([2,3,4].includes(q))h.save('self-'+q,q,q>=3);return true;}
    if(action==='application-reveal'&&key==='application'){a.compareSeen=true;h.persist();h.refresh();return true;}
    if(action==='application-rate'&&key==='application'&&a.compareSeen&&!a.selected&&!s.answers.application){const q=Number(el.dataset.value);if(![2,3,4].includes(q))return true;a.selected='self-'+q;a.attempts.push({selected:a.selected,correct:q>=3,hint:false});if(!a.part){h.persist();h.refresh();}else{const grade=Math.min(...a.attempts.map(x=>Number(x.selected.slice(5))));h.save(a.selected,grade,grade>=3);}return true;}
    if(action==='compare-reveal'&&key==='compare'){a.compareSeen=true;h.persist();h.refresh();return true;}
    if(action==='compare-rate'&&key==='compare'&&a.compareSeen){const q=Number(el.dataset.value);if([2,3,4].includes(q))h.save('self-'+q,q,q>=3);return true;}
    if(action==='mark'&&key==='recall'&&s.revealed&&!s.answers.recall){const id=el.dataset.value;if(['image','meaning','application'].includes(id)){a.marks=a.marks.includes(id)?a.marks.filter(x=>x!==id):[...a.marks,id];h.persist();h.refresh();}return true;}
    if(action==='save-recall'&&key==='recall'&&s.revealed&&!s.answers.recall){const q=s.hint?2:a.marks.length===3?4:a.marks.length?3:2;h.save('self-'+a.marks.length,q,q>=3);return true;}
    if(action==='change-position'&&key==='application'&&a.part===0&&a.selected){a.part=1;a.selected='';a.compareSeen=false;s.hint=false;h.persist();h.refresh();return true;}
    if(action==='hint'){s.hint=true;h.persist();h.refresh();return true;}
    if(['answer','unknown'].includes(action)&&!s.answers[key]&&!a.selected){
      const step=makeStep(key,h.card,h.lesson,h.deck,s),value=action==='unknown'?'unknown':el.dataset.value;
      if(!step?.options||(value!=='unknown'&&!step.options.some(o=>o.id===value)))return true;
      a.selected=value;a.attempts.push({selected:value,correct:value===step.correct,hint:!!s.hint});
      if(key==='application'&&!a.part){h.persist();h.refresh();}
      else{const all=a.attempts.every(x=>x.correct&&!x.hint);s.hint=a.attempts.some(x=>x.hint);h.save(value,all?4:2,a.attempts.every(x=>x.correct));}
      return true;
    }
    return false;
  }
  return {cards,blank,validate,framework,makeStep,render,handle};
})();
