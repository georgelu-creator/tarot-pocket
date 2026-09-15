/* Offline authored coaching. Open recall stays self-report; choices are evidence,
   not proof of mastery. No network or free-text grading. */
window.TarotGuided = (() => {
  'use strict';
  const cards=()=>Object.fromEntries([...(window.TAROT_GUIDED_MAJOR?.cards||[]),...(window.TAROT_GUIDED_MINOR?.cards||[])].map(c=>[c.id,c]));
  const topics={career:'工作',love:'关系',study:'学习'};
  const roles={state:'现状',tension:'阻碍',advice:'建议'};
  const names={intro:'观察',image:'推导',meaning:'理解',compare:'辨析',application:'换位',reversal:'逆位',recall:'回忆'};
  const numberHints=["", "出现一个新的机会或念头", "面对两个方向，或学习互相配合", "事情开始发展，有了初步成果", "建立稳定，也可能停在原地", "原来的平衡受到挑战", "调整关系，寻找更合适的做法", "面对考验，决定怎样坚持", "继续推进，或反复练习", "接近完成，看见积累和压力", "一段经历告一段落，准备下一步"];
  const elements={w:['火','行动、热情、创造和目标'],c:['水','情绪、关系和内心需要'],s:['风','思考、沟通、决定与冲突'],p:['土','金钱、工作、身体和实际生活']};
  const courtHints=['刚接触一种经验，正在学习','主动追求，用行动表达','照顾感受，形成自己的方式','做出判断，承担责任'];
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
    if(prefix==='m')return [{label:'大阿尔卡纳',text:'这组牌描绘人生中的重要课题。先看人物在做什么，不必套用数字牌的解释。'}];
    return [{label:c.suit+' · '+elements[prefix][0],text:elements[prefix][1]},
      {label:n>10?c.number:'数字 '+c.number,text:n>10?courtHints[n-11]:numberHints[n]}];
  }
  function makeStep(key,c,lesson,deck,s){
    const g=cards()[c.id];if(!g)throw Error('Missing guided card '+c.id);
    const part=s.guided?.part||0;
    if(key==='image')return {title:'从动作推到含义',prompt:g.reason.prompt,options:g.reason.options,correct:'yes'};
    if(key==='meaning')return {title:'把画面和主干连起来',prompt:'借助下面的结构，用一句话解释：画面中的动作，为什么会形成这张牌的核心含义？'};

    if(key==='application')return {title:part?'只换牌位，怎样改读？':'把理解放进一个问题',prompt:c.questions[s.topic],role:part?'advice':'tension'};
    if(key==='reversal')return {title:'用背景判断逆位方向',context:g.reversal.context,prompt:g.reversal.prompt,options:g.reversal.options,correct:'yes'};
    return null;
  }
  function render(c,lesson,deck,s,h){
    const {esc,img,icon,ordered,head}=h,key=s.steps[s.index],g=cards()[c.id],a=s.guided||blank(key),answer=s.answers[key];
    if(!g)throw Error('Missing guided card '+c.id);
    const plain=g.plain||{},why=plain.why||lesson.why,core=plain.core||c.core,anchor=plain.anchor||lesson.anchor,context=plain.contexts?.[s.topic]||c.contexts[s.topic];
    const hidden=key==='recall'&&!s.revealed;
    const titles={intro:['看画面','先观察人物和物品，找出这张牌最值得记住的细节。'],image:['理解牌义','结合刚才的画面，选出最有依据的解释。'],meaning:['记住重点','借助元素和数字，把这张牌的意思记成一句话。'],application:['放进问题','同一张牌换一个位置，回答的重点也会改变。'],reversal:['理解逆位','结合具体情况，判断逆位时需要留意什么。'],recall:['自己回想','先不看牌图，回想画面、牌义和一种用法。']};
    const [title,instruction]=titles[key]||titles.application;
    const face=`<figure class="guided-card-anchor">${hidden?'<div class="guided-face guided-memory-blank" aria-label="牌面已遮住"><span>?</span></div>':`<button class="journey-image guided-face" data-action="zoom" data-id="${c.id}" aria-label="放大牌面">${img(c.id)}</button>`}<figcaption><strong>${esc(c.name)}</strong><span>${hidden?'牌图暂时收起，先试着回想':'点牌图可放大'}</span></figcaption></figure>`;
    const frame=content=>`<main class="journey-shell guided-shell guided-focused">${head}<section class="journey-stage guided-stage" data-learning-game="${key}">${face}<div class="guided-copy"><header class="guided-step-heading"><h1>${title}</h1><p>${instruction}</p></header>${content}</div></section></main>`;
    const next=label=>`<button class="primary wide" data-journey="next">${label||'继续下一步'} ${icon('arrow')}</button>`;
    const coach=(body)=>`<div class="guided-coach" role="status"><strong>解答</strong>${body}</div>`;
    const ratings=action=>`<p class="guided-self-question">看解答之前，你想到了多少？</p><div class="guided-self-ratings"><button class="secondary" data-guided="${action}" data-value="2">还没想到</button><button class="secondary" data-guided="${action}" data-value="3">想到一部分</button><button class="secondary" data-guided="${action}" data-value="4">基本想到了</button></div>`;
    const noted=button=>`<section class="journey-feedback" role="status"><strong>已记录你的自评</strong>${button||next()}</section>`;
    if(key==='intro')return frame(`<p class="guided-question">${esc(g.observe)}</p>${!s.inspected?'<button class="primary wide" data-journey="inspect">我想好了</button>':coach(`<p>${esc(c.observation)}</p>`)+next()}`);
    if(key==='meaning')return frame(`<div class="guided-framework">${framework(c).map(x=>`<p><strong>${esc(x.label)}</strong><span>${esc(x.text)}</span></p>`).join('')}</div><p class="guided-question">这些线索怎样帮助你记住这张牌？先在心里说一句。</p>${!a.compareSeen?'<button class="primary wide" data-guided="meaning-reveal">我想好了</button>':coach(`<p><b>${esc(core)}</b></p><p>${esc(why)}</p><p class="guided-anchor-line">${esc(anchor)}</p>`)+(answer?noted():ratings('meaning-rate'))}`);
    if(key==='application'){
      const step=makeStep(key,c,lesson,deck,s);
      return frame(`<div class="guided-case"><span class="eyebrow">${topics[s.topic]}</span><p>${esc(step.prompt)}</p><div class="guided-board journey-board" aria-label="现状、阻碍、建议三张牌阵">${['state','tension','advice'].map((role,i)=>`<div class="guided-slot ${step.role===role?'occupied':''}"><span aria-hidden="true">${i+1}</span><strong>${roles[role]}</strong>${step.role===role?'<small>这张牌在这里</small>':''}</div>`).join('')}</div></div><p class="guided-question">${a.part?'现在放在建议位：这张牌提醒你可以怎么做？':'放在阻碍位：这张牌提示，什么可能让事情卡住？'}</p>${!a.compareSeen?'<button class="primary wide" data-guided="application-reveal">我想好了</button>':coach(`<p>${esc(context[step.role])}</p><p>${esc(why)}</p>`)+(a.selected?noted(a.part?next():'<button class="primary wide" data-guided="change-position">继续：换到建议位</button>'):ratings('application-rate'))}`);
    }
    if(key==='recall')return frame(`<p class="guided-question">你记得哪个画面？它是什么意思？遇到什么问题时用得上？</p>${!s.revealed?`<button class="primary wide" data-journey="reveal">我想好了</button><button class="linkbtn" data-guided="recall-hint">给我一点提示</button>${s.hint?coach(`<p>${esc(g.recall)}</p><small>这次看过提示，会记录为辅助回忆。</small>`):''}`:coach(`<p><b>${esc(anchor)}</b></p><p>${esc(why)}</p><p>${esc(context.advice)}</p>`)+(answer?noted(next('完成这张牌')):`<p class="guided-self-question">刚才自己想起了哪些？可以多选。</p><div class="guided-memory-check">${[['image','画面细节'],['meaning','这张牌的意思'],['application','一种实际用法']].map(([v,t])=>`<button class="secondary" data-guided="mark" data-value="${v}" aria-pressed="${a.marks.includes(v)}">${a.marks.includes(v)?'✓ ':''}${t}</button>`).join('')}</div><button class="primary wide" data-guided="save-recall">${a.marks.length?'记下这次回忆':'暂时没想起来'}</button>`)}`);
    const step=makeStep(key,c,lesson,deck,s),chosen=a.selected,locked=!!chosen,correct=chosen===step.correct;
    const options=`<div class="journey-options guided-options">${ordered(step.options,s).map((o,i)=>`<button class="journey-option ${locked?(o.id===step.correct?'correct':o.id===chosen?'incorrect':''):''}" data-guided="answer" data-value="${o.id}" ${locked?'disabled':''}><span class="letter">${String.fromCharCode(65+i)}</span><span>${esc(o.text)}</span>${locked&&(o.id===step.correct||o.id===chosen)?`<b class="answer-marker">${o.id===step.correct?'✓':'✕'}</b>`:''}</button>`).join('')}</div>`;
    const yes=step.options.find(o=>o.id===step.correct),choice=step.options.find(o=>o.id===chosen);
    const feedback=locked?`<section class="journey-feedback ${correct?'correct':'incorrect'}" role="status"><strong>${chosen==='unknown'?'这次还不确定':correct?'✓ 这题答对了':'✕ 这题答错了'}</strong>${choice?`<p>${esc(choice.feedback)}</p>`:''}${!correct?`<p><b>正确答案：</b>${esc(yes.text)}</p><p>${esc(yes.feedback)}</p>`:''}${next()}<details class="guided-alternatives"><summary>看看其他选项为什么不合适</summary>${step.options.filter(o=>o.id!==chosen).map(o=>`<p><strong>${esc(o.text)}</strong><span>${esc(o.feedback)}</span></p>`).join('')}</details></section>`:`<div class="journey-help"><button class="linkbtn" data-guided="hint">给我一点提示</button><button class="linkbtn" data-guided="unknown">还不确定</button></div>${s.hint?coach(`<p>${esc(why)}</p><small>这次看过提示，会记录为辅助练习。</small>`):''}`;
    return frame(`${step.context?`<p class="guided-context">${esc(step.context)}</p>`:''}<p class="guided-question">${esc(step.prompt)}</p>${options}${feedback}`);
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
