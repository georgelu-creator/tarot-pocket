/* Offline, authored teaching. All evidence comes from submitted choices, never self-ratings. */
(() => {
  'use strict';
  const source=window.TAROT_ACADEMY_CONTENT, units=Object.fromEntries([...source.lessons,...source.cards].map(u=>[u.id,u]));
  const DAY=86400000, version=source.version;
  const blank=()=>({version:1,contentVersion:version,progress:{},session:null,paused:{},pendingReverse:null});
  const number=(n,f=0)=>Number.isFinite(n)&&n>=0&&n<1e14?n:f;
  function planFor(u,mode='learn') {
    if(mode==='reverse-review'){const support=u.remediation[u.questions.Q3.support];return [{kind:'teach',key:'T3',content:[u.reversal],reversed:true},{kind:'question',key:'Q3',question:support.question,reversed:true,support:true}];}
    if(mode==='review')return [{kind:'question',key:'V1',question:u.revisit}];
    if(mode==='reverse')return [{kind:'teach',key:'T3',content:[u.reversal],reversed:true},{kind:'question',key:'Q3',question:u.questions.Q3,reversed:true}];
    if(u.kind==='card')return [{kind:'teach',key:'T1',content:u.teachings},{kind:'question',key:'Q1',question:u.questions.Q1},{kind:'teach',key:'T2',content:[u.application]},{kind:'question',key:'Q2',question:u.questions.Q2}];
    const teaching=u.teachings.map((t,i)=>({kind:'teach',key:'T'+(i+1),content:[t]}));
    if(u.id==='B07')return [...teaching.slice(0,2),{kind:'question',key:'Q1',question:u.questions.Q1},teaching[2],{kind:'question',key:'Q2',question:u.questions.Q2}];
    return [...teaching,...Object.entries(u.questions).map(([key,question])=>({kind:'question',key,question}))];
  }
  function cleanSession(s) {
    if(!s||!units[s.unitId])return null;
    const mode=['learn','review','reverse','reverse-review'].includes(s.mode)?s.mode:'learn',u=units[s.unitId];
    if(mode.startsWith('reverse')&&u.kind!=='card')return null;
    const plan=planFor(u,mode), index=Number.isInteger(s.index)?Math.max(0,Math.min(s.index,plan.length)):0;
    const out={unitId:u.id,mode,index,startedAt:number(s.startedAt),seed:number(s.seed,1),contentVersion:version,answers:{},support:null,hint:!!s.hint,complete:!!s.complete&&index===plan.length,lang:s.lang==='en'?'en':'zh',animation:{frame:0,static:true,paused:true},scroll:number(s.scroll)};
    const allowed=new Map([...Object.values(u.questions),u.revisit,...Object.values(u.remediation).map(r=>r.question)].map(q=>[q.id,q]));
    for(const [qid,a]of Object.entries(s.answers||{})){
      const q=allowed.get(qid);if(!q||!a||!q.options.some(o=>o.id===a.selected))continue;
      out.answers[qid]={selected:a.selected,correct:a.selected===q.correct,hint:!!a.hint,at:number(a.at),support:!!a.support};
    }
    const step=plan[index];
    if(s.support?.key==='review-summary'&&mode==='review'&&out.answers[u.revisit.id]&&!out.answers[u.revisit.id].correct)out.support={key:'review-summary',phase:'summary',round:0};
    if(s.support&&step?.kind==='question'&&u.remediation[s.support.key]&&s.support.key===step.question.support){
      const r=u.remediation[s.support.key], validAnswer=out.answers[step.question.id];
      if(validAnswer&&!validAnswer.correct)out.support={key:s.support.key,phase:['teach','question','summary'].includes(s.support.phase)?s.support.phase:'teach',round:1};
    }
    if(s.animation&&Number.isInteger(s.animation.frame))out.animation.frame=Math.max(0,Math.min(s.animation.frame,3));
    if(['a','b','all','work','movement','outcome'].includes(s.animation?.path))out.animation.path=s.animation.path;
    // Changed question content cannot silently preserve a completed assessment.
    if(s.contentVersion!==version){out.index=0;out.answers={};out.support=null;out.hint=false;out.complete=false;}
    return out;
  }
  function validate(raw) {
    if(!raw)return blank();
    if(raw.version!==1||!raw.progress||typeof raw.progress!=='object'||Array.isArray(raw.progress))throw Error('学习记录格式不正确');
    const out=blank();
    if(units[raw.pendingReverse]?.kind==='card')out.pendingReverse=raw.pendingReverse;
    for(const [id,p]of Object.entries(raw.progress)){
      if(!units[id]||!p||typeof p!=='object')continue;
      const record={completedAt:number(p.completedAt),uprightAt:number(p.uprightAt),reverseAt:number(p.reverseAt),nextVisitAt:number(p.nextVisitAt),rounds:Math.min(100000,Math.floor(number(p.rounds))),targets:{},history:[]};
      for(const r of Array.isArray(p.history)?p.history:[]){if(!r||!['learn','review','reverse','reverse-review'].includes(r.mode)||!Array.isArray(r.answers)||typeof r.contentVersion!=='string')continue;const answers=r.answers.filter(a=>a&&typeof a.questionId==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(a.questionId)&&typeof a.selected==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(a.selected)).map(a=>({questionId:a.questionId,selected:a.selected,correct:!!a.correct,hint:!!a.hint,support:!!a.support,at:number(a.at)}));record.history.push({at:number(r.at),mode:r.mode,contentVersion:r.contentVersion.slice(0,64),answers});}
      for(const key of ['Q1','Q2','Q3','V1']){const t=p.targets?.[key];if(!t)continue;record.targets[key]={last:number(t.last),due:number(t.due),status:['independent','assisted','pending'].includes(t.status)?t.status:'pending',streak:Math.min(10000,Math.floor(number(t.streak)))};}
      out.progress[id]=record;
    }
    out.session=cleanSession(raw.session);
    for(const [key,s]of Object.entries(raw.paused||{})){const clean=cleanSession(s);if(clean&&!clean.complete&&key===clean.unitId+':'+clean.mode)out.paused[key]=clean;}
    return out;
  }
  function stepFor(s) {
    if(!s||s.complete)return null;
    const u=units[s.unitId],base=planFor(u,s.mode)[s.index];if(!base)return null;
    if(s.support?.key==='review-summary')return {kind:'summary',key:'V1',content:[u.summary],support:true};
    if(!s.support)return base;
    const support=u.remediation[s.support.key];
    return s.support.phase==='question'?{kind:'question',key:base.key,question:support.question,support:true,reversed:base.reversed}:
      {kind:s.support.phase==='summary'?'summary':'teach',key:base.key,content:s.support.phase==='summary'?[base.reversed?u.reversal:u.summary]:support.teach,support:true,reversed:base.reversed};
  }
  function answer(data,choice,at=Date.now()) {
    const s=data.session,step=stepFor(s);if(step?.kind!=='question'||s.answers[step.question.id])return false;
    const q=step.question;if(!q.options.some(o=>o.id===choice))return false;
    const correct=q.correct===choice;
    s.answers[q.id]={selected:choice,correct,hint:!!s.hint,at,support:!!step.support};
    const p=data.progress[s.unitId]||=( {completedAt:0,uprightAt:0,reverseAt:0,rounds:0,targets:{}} );
    const old=p.targets[step.key], independent=correct&&!s.hint&&!step.support;
    const sameDay=old&&at-old.last<DAY;
    const streak=independent?(sameDay?old.streak:(old?.streak||0)+1):0;
    p.targets[step.key]={last:at,status:!correct?'pending':independent?'independent':'assisted',streak,due:at+DAY*(independent?[3,7,14][Math.min(2,Math.max(0,streak-1))]:1)};
    return true;
  }
  function advance(data,at=Date.now()) {
    const s=data.session,step=stepFor(s);if(!step)return false;
    const u=units[s.unitId];
    if(step.kind==='question'){
      const a=s.answers[step.question.id];if(!a)return false;
      if(s.support){
        if(!a.correct){s.support.phase='summary';s.hint=false;return true;}
        s.support=null;
      }else if(!a.correct&&step.question.support&&u.remediation[step.question.support]){
        s.support={key:step.question.support,phase:'teach',round:1};s.hint=false;return true;
      }else if(!a.correct&&s.mode==='review'){
        // A revisit has no second authored equivalent; recap and revisit later.
        s.support={key:'review-summary',phase:'summary',round:0};return true;
      }
    }else if(s.support){
      if(s.support.phase==='teach'){s.support.phase='question';s.hint=false;return true;}
      s.support=null;
    }
    s.index++;s.hint=false;s.animation={frame:0,static:true,paused:true};s.scroll=0;
    if(s.index===planFor(u,s.mode).length){
      s.complete=true;
      const p=data.progress[u.id]||={completedAt:0,uprightAt:0,reverseAt:0,rounds:0,targets:{}};
      p.completedAt=at;p.rounds++;(p.history||=[]).push({at,mode:s.mode,contentVersion:version,answers:Object.entries(s.answers).map(([questionId,a])=>({questionId,...a}))});
      const submitted=Object.values(s.answers),targets=Object.values(p.targets);p.nextVisitAt=submitted.some(a=>!a.correct||a.hint||a.support)?at+DAY:Math.min(...targets.map(t=>t.due).filter(n=>n>at),at+14*DAY);
      if(u.kind==='card'&&s.mode==='learn')p.uprightAt=at;
      if(s.mode==='reverse')p.reverseAt=at;
    }
    return true;
  }
  // Review recap is deliberately not a fresh scored exercise.
  const rawStep=stepFor;
  function currentStep(s){if(s?.support?.key==='review-summary')return {kind:'summary',key:'V1',content:[units[s.unitId].summary],support:true};return rawStep(s);}
  function create(bridge){
    const {esc,img,icon,go,toast,now,get,set}=bridge;
    let search='',level='B';
    const lang=()=>window.TAROT_I18N?.locale==='en'?'en':'zh';
    const t=p=>typeof p==='string'?p:p?.[lang()]||'';
    const copy=(zh,en)=>lang()==='en'?en:zh;
    const data=()=>get()||blank();
    const current=()=>data().session;
    const active=()=>!!current()&&!current().complete;
    const status=id=>data().progress[id]||null;
    const completedCards=()=>source.cards.filter(u=>status(u.id)?.uprightAt).map(u=>u.id);
    const due=()=>Object.entries(data().progress).filter(([id,p])=>p.completedAt&&(p.nextVisitAt||Infinity)<=now()).sort((a,b)=>a[1].nextVisitAt-b[1].nextVisitAt).map(([id])=>id);
    function recommendation(){const candidates=source.cards.filter(c=>!status(c.id)?.uprightAt).map(c=>c.id),seen=new Set([current()?.unitId,...Object.values(data().paused||{}).map(s=>s.unitId)]),fresh=candidates.filter(id=>!seen.has(id)),ids=fresh.length?fresh:candidates;return ids.length?ids[Math.floor(Math.random()*ids.length)]:null;}
    function save(d){d.contentVersion=version;set(d);}
    function pauseAnimation(){}
    function start(id,mode='learn'){
      pauseAnimation();if(!units[id])return;
      const d=data(),u=units[id];
      if(mode==='reverse'&&!status('I04')?.completedAt){d.pendingReverse=id;id='I04';mode='learn';}
      else if(mode==='reverse')d.pendingReverse=null;
      if(active()&&current().unitId===id&&current().mode===mode){go('academy');return;}
      if(active())d.paused[current().unitId+':'+current().mode]=structuredClone(current());
      const key=id+':'+mode;
      d.session=d.paused[key]||{unitId:id,mode,index:0,startedAt:now(),seed:Math.floor(Math.random()*1e9)+1,contentVersion:version,answers:{},support:null,hint:false,complete:false,lang:lang(),animation:{frame:0,static:true,paused:true},scroll:0};
      delete d.paused[key];save(d);go('academy');
    }
    function newCard(){const id=recommendation();if(id)start(id);else{toast(copy('78 张牌都已经学过，可以选一张回看。','You have studied all 78 cards. Choose one to revisit.'));go('courses');}}
    function review(){const id=due()[0];if(id)start(id,units[id].kind==='card'&&status(id)?.targets.Q3?.status==='pending'?'reverse-review':'review');else{toast(copy('暂时没有需要回访的内容。','Nothing is due for a revisit yet.'));go('courses');}}
    const button=(action,zh,en,attrs='',cls='secondary')=>`<button class="${cls}" data-academy="${action}" ${attrs}>${copy(zh,en)}</button>`;
    function statusLabel(id){const p=status(id);if(!p)return copy('开始学习','Start');if(!p.completedAt)return copy('继续学习','Continue');return Object.values(p.targets).some(x=>x.status==='pending')?copy('学过 · 稍后再练','Studied · revisit later'):copy('已完成本轮','Round complete');}
    function home(){
      const titles={B:copy('初级 · 从这里开始','Beginner · start here'),I:copy('中级 · 读懂每张牌','Intermediate · understand each card'),A:copy('高级 · 连成完整解读','Advanced · read the whole spread')};
      const tabs={B:copy('初级','Beginner'),I:copy('中级','Intermediate'),A:copy('高级','Advanced')};
      const intros={B:copy('先认识牌组，走一遍抽牌，再学会用一张牌回答问题。','Meet the deck, try the reading process and learn to answer a question with one card.'),I:copy('把画面、牌义和问题联系起来，再学习有具体背景的逆位。','Connect images, meanings and questions, then learn reversals in specific situations.'),A:copy('练习问题、牌位和多张牌的配合，用完整案例解释结果。','Work with questions, positions and several cards in complete worked readings.')};
      const candidates=source.cards.filter(c=>!search||c.title.zh.includes(search)||c.title.en.toLowerCase().includes(search.toLowerCase()));
      return `<main class="academy-home" data-i18n-ignore><header class="academy-pagehead"><span class="eyebrow">TAROT POCKET</span><h1>${copy('一步步学会读牌','Learn to read, one step at a time')}</h1><p>${copy('先看讲解和例子，再做练习。进度会自动保存。','Read an explanation and example, then try a question. Your place is saved automatically.')}</p></header>${active()?`<button class="academy-resume" data-academy="continue"><span>${copy('接着上次','Continue where you stopped')} · ${esc(t(units[current().unitId].title))}</span>${icon('arrow')}</button>`:''}<nav class="academy-levels" aria-label="${copy('课程阶段','Course levels')}">${Object.keys(titles).map(k=>`<button data-academy="level" data-value="${k}" aria-pressed="${level===k}">${esc(tabs[k])}</button>`).join('')}</nav><section class="academy-lessons"><h2>${esc(titles[level])}</h2><p>${esc(intros[level])}</p>${source.lessons.filter(u=>u.level===level).map((u,i)=>`<button class="academy-lesson" data-academy="start" data-id="${u.id}"><span class="academy-number">${i+1}</span><span><strong>${esc(t(u.title))}</strong><small>${esc(statusLabel(u.id))}</small></span>${icon('arrow')}</button>`).join('')}</section><section class="academy-card-library"><h2>${copy('也可以从一张牌开始','Or start with a card')}</h2><p>${copy('选你想认识的牌。先学正位，之后再学逆位。','Choose a card you want to understand. Begin upright; reversals come later.')}</p><div class="academy-library-actions">${button('new','随机学一张新牌','Learn a random new card')}${due().length?button('review','回访之前学过的','Revisit earlier learning'):''}<span>${completedCards().length} / 78 ${copy('已完成正位初学','upright introductions completed')}</span></div><label class="academy-search"><span>${copy('找一张牌','Find a card')}</span><input data-academy-search type="search" value="${esc(search)}" placeholder="${copy('输入牌名','Card name')}" /></label><div class="academy-card-grid">${candidates.map(u=>`<button data-academy="start" data-id="${u.id}">${img(u.id,'loading="lazy"')}<strong>${esc(t(u.title))}</strong><small>${esc(statusLabel(u.id))}</small></button>`).join('')}</div></section></main>`;
    }
    function cardArea(u,s,step){
      let ids=u.kind==='card'?[u.id]:u.cards;
      if(u.id==='B07')ids=[['T1','T2','Q1'].includes(step?.key)?'c02':'m08'];
      if(u.id==='I04')ids=[step?.key==='T2'?'s09':'p08'];
      if(u.id==='B03')return `<div class="academy-suit-map" aria-label="${copy('四种花色及元素','Four suits and their elements')}">${[['权杖','Wands','火','Fire'],['圣杯','Cups','水','Water'],['宝剑','Swords','风','Air'],['星币','Pentacles','土','Earth']].map(([z,en,ez,ee])=>`<div><strong>${copy(z,en)}</strong><span>${copy(ez,ee)}</span></div>`).join('')}</div>`;
      if(!ids.length)return `<div class="academy-image-space academy-question-space"><span aria-hidden="true">?</span><p>${copy('先说清楚想问什么','Begin with a clear question')}</p></div>`;
      const shown=ids, special=['A05','A06'].includes(u.id),path='all';
      const roles=u.id==='A05'?[['现状','Situation'],['A 发展','A development'],['B 发展','B development'],['A 趋势','A tendency'],['B 趋势','B tendency']]:u.id==='A06'?[['整体影响','Overall'],['交叉阻碍','Crossing obstacle'],['目标','Goal'],['基础','Foundation'],['渐退影响','Receding'],['将来影响','Approaching'],['自己','Your approach'],['环境','Environment'],['希望或担忧','Hopes or fears'],['结果趋势','Tendency']]:null;
      const group=path==='a'?[0,1,3]:path==='b'?[0,2,4]:path==='work'?[0,1]:path==='movement'?[3,4,5,7]:path==='outcome'?[2,8,9]:ids.map((_,i)=>i);
      return `<div class="academy-image-space ${shown.length>1?'is-spread':''} ${special?'academy-layout-'+u.id:''}" aria-label="${copy('本节牌图','Cards in this lesson')}">${shown.map((id,i)=>{const c=units[id],reversed=step?.reversed||s.mode?.startsWith('reverse')||u.id==='A04'&&id==='p08'||u.id==='I04'&&step?.key!=='T1';return `<figure data-position="${i+1}" class="${group.includes(i)?'is-emphasized':''}"><button class="academy-card-face ${reversed?'is-reversed':''}" data-action="zoom" data-id="${id}" aria-label="${esc(copy('放大','Enlarge')+' '+t(c?.title))}">${img(id)}</button><figcaption>${shown.length>1?`${i+1} · `:''}${roles?esc(copy(...roles[i])):esc(t(c?.title))}${reversed?' · '+copy('逆位','Reversed'):''}</figcaption></figure>`;}).join('')}</div>`;
    }
    /* Historical lesson-visual data is intentionally retained below only for
       saved-session compatibility. The learner UI does not render or control it. */
    const lessonVisuals={
      B01:[['78 张牌','78 cards'],['22 张大牌','22 Major Arcana'],['56 张小牌','56 Minor Arcana']],
      B02:[['先定问题和牌位','Set the question and position'],['洗牌，再选一张','Shuffle, then draw a card'],['回答原来的问题','Answer the original question']],
      B03:[['权杖 · 火\n行动、热情、创造','Wands · Fire\nAction, enthusiasm, creativity'],['圣杯 · 水\n感受与关系','Cups · Water\nFeelings and relationships'],['宝剑 · 风\n想法、判断、沟通','Swords · Air\nThought, judgement, communication'],['星币 · 土\n资源、技能、实际安排','Pentacles · Earth\nResources, skills, practical arrangements']],
      B04:[['数字八：继续做下去','Eight: continuing an activity'],['星币八：认真练技能','Eight of Pentacles: practise a skill'],['在练琴时：单独练总出错的地方','In music practice: work on the difficult passage']],
      B05:[['侍从：接触和学习','Page: explore and learn'],['骑士：主动追求','Knight: actively pursue'],['王后：留意需要、照顾','Queen: notice needs and care'],['国王：安排事情、承担责任','King: organise and take responsibility']],
      B06:[['看见人物在做工','Notice the person at work'],['联系专注、练习和细心','Connect this with focus, practice and care'],['练琴：慢练出错的小节','Piano example: slow down the difficult passage']],
      B07:[['圣杯二：双方都表达','Two of Cups: both people express themselves'],['也听听对方怎么说','Also listen to the other person'],['力量：耐心说清自己的理由','Strength: explain your reasons patiently']],
      B08:[['问题：怎样澄清误会？','Question: how can I clear up a misunderstanding?'],['圣杯二：表达，也听对方说','Two of Cups: speak and listen'],['先问朋友是否愿意聊聊','Ask whether your friend is willing to talk']],
      I01:[['先读完整意思','Learn the whole meaning'],['用画面和关键词帮助记忆','Use images and keywords to remember'],['把意思用到这个问题里','Apply that meaning to this question']],
      I02:[['画面：家人共享幸福','Picture: a family sharing happiness'],['含义：和睦、归属、一起幸福','Meaning: harmony, belonging, shared happiness'],['朋友聚会：让每个人都参与','Friends’ gathering: include everyone']],
      I03:[['圣杯：关注感受','Cups: feelings matter'],['骑士：主动做些什么','Knight: take action'],['圣杯骑士：表达心意、发出邀请','Knight of Cups: express feelings and offer an invitation']],
      I04:[['先看正位在讲什么','Start with the upright theme'],['再看题目已说明的情况','Read the situation the question gives'],['据此判断逆位怎样变化','Use that context to interpret the reversal']],
      I05:[['现状：正在认真练摄影','Situation: practising photography carefully'],['建议：按要求练习、改细节','Advice: practise and improve the details'],['趋势：持续练和改，有望进步','Tendency: continued practice can bring improvement']],
      I06:[['现状 · 圣杯骑士\n愿意为展览行动','Situation · Knight of Cups\nWilling to act for the exhibition'],['建议 · 星币八\n选好、修好、布置好','Advice · Eight of Pentacles\nSelect, edit and display the photographs'],['趋势 · 圣杯十\n一起体会完成的开心','Tendency · Ten of Cups\nEnjoy completing it together']],
      A01:[['目标：三个月完成作品集','Goal: finish a portfolio in three months'],['背景：刚自学两周，暂不转职','Context: two weeks of self-study; no career move yet'],['想问：准备、困难、下一步','Ask about preparation, difficulty and the next step']],
      A02:[['现状 · 圣杯二\n双方还愿意一起计划','Situation · Two of Cups\nBoth still want to plan together'],['阻碍 · 宝剑二\n有些安排迟迟没定','Obstacle · Two of Swords\nSome arrangements remain undecided'],['建议 · 节制\n找双方能接受的安排','Advice · Temperance\nFind arrangements both can accept']],
      A03:[['星币侍从：想认真学','Page of Pentacles: wants to learn'],['圣杯七：想做的太多','Seven of Cups: too many possibilities'],['星币八：先选一件认真做','Eight of Pentacles: choose one and practise']],
      A04:[['现状：愿意认真做','Situation: willing to work carefully'],['阻碍：一直改细节，没交上','Obstacle: endless detail changes delay submission'],['建议：改必要的地方，按时交','Advice: make necessary changes and submit on time']],
      A05:[['1：先看共同起点','1: read the shared starting point'],['1 → 2 → 4：读完整的 A 路线','1 → 2 → 4: read the whole A path'],['1 → 3 → 5：读完整的 B 路线','1 → 3 → 5: read the whole B path']],
      A06:[['1、2：合作与分歧','1, 2: cooperation and disagreement'],['4、5、6、8：把准备落到实处','4, 5, 6, 8: make practical preparations'],['3、9、10：分清目标、担忧和趋势','3, 9, 10: separate the goal, fear and tendency']]
    };
    function framesFor(u,step){return u.kind==='card'?u.teachings:lessonVisuals[u.id]||[];}
    function animation(u,s,step){
      if(step.kind!=='teach'||step.support)return '';
      const a=s.animation||{},reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, staticMode=a.static||reduced;
      if(u.id==='B02'&&step.key==='T2'){
        const frames=[['分成两叠','Split into two piles'],['交错合拢','Interleave the piles'],['分开后重新合拢，可跳过','Cut and recombine; optional'],['选出一张，按原问题解读','Draw one and keep the question']];
        return `<section class="academy-animation ${a.paused?'is-paused':''} ${staticMode?'is-static':''}" data-animation="shuffle" aria-label="${copy('教学示范','Worked example')}"><strong>${copy('看一遍洗牌和切牌','Watch a shuffle and cut')}</strong><div class="academy-demo-deck" data-frame="${a.frame||0}" aria-hidden="true">${Array.from({length:12},(_,i)=>`<i style="--i:${i};--side:${i%2===0?-1:1}"></i>`).join('')}</div><ol class="academy-animation-captions">${frames.map((f,i)=>`<li class="${i===(a.frame||0)?'active':''}">${copy(...f)}</li>`).join('')}</ol></section>`;
      }
      if(u.id==='B01'&&step.key==='T2')return `<section class="academy-deck-map"><strong>${copy('78 张牌怎样分','How the 78 cards fit together')}</strong><div><b>22</b><span>${copy('大阿尔卡纳','Major Arcana')}</span></div><div><b>56</b><span>${copy('小阿尔卡纳：40 张数字牌＋16 张宫廷牌','Minor Arcana: 40 numbered + 16 court cards')}</span></div><p>${copy('四种花色，每种 10 张数字牌＋4 张宫廷牌。','Four suits, each with 10 numbered and 4 court cards.')}</p></section>`;
      if(u.kind==='card'&&step.key==='T1'){
        const frames=u.teachings;
        return `<section class="academy-animation academy-cue ${a.paused?'is-paused':''} ${staticMode?'is-static':''}" data-animation="clues"><strong>${copy('画面怎样帮助记住牌义','Connect the picture with the meaning')}</strong><ol class="academy-animation-captions">${frames.map((f,i)=>`<li class="${i===(a.frame||0)?'active':''}"><span>${copy(...[['主要意思','Main meaning'],['画面线索','Picture cue'],['记忆线索','Memory aid']][i])}</span><p>${esc(t(f))}</p></li>`).join('')}</ol></section>`;
      }
      if(step.reversed)return `<section class="academy-animation academy-reversal-demo ${a.paused?'is-paused':''} ${staticMode?'is-static':''}" data-animation="reverse"><p>${copy('逆位是牌图倒着出现。先读本例的背景，再看含义怎样变化。','A reversed card appears upside down. Read this example’s context before interpreting the change.')}</p></section>`;
      const frames=u.kind==='lesson'?framesFor(u,step):[];
      if(frames.length)return `<section class="academy-animation academy-concept ${staticMode?'is-static':''} ${a.paused?'is-paused':''}" data-animation="lesson" aria-label="${copy('按顺序看这个例子','Follow the example in order')}"><div class="academy-concept-steps">${frames.map((f,i)=>`<div aria-current="${i===(a.frame||0)?'step':'false'}"><span class="academy-concept-number">${i+1}</span><span>${esc(copy(...f))}</span></div>`).join('')}</div></section>`;
      return '';
    }
    function feedback(q,a){
      const selected=q.options.find(o=>o.id===a.selected),correct=q.options.find(o=>o.id===q.correct);
      const otherWrong=q.options.filter(o=>o.id!==a.selected&&o.id!==q.correct);
      return `<section class="academy-feedback ${a.correct?'is-correct':'is-incorrect'}" role="status"><h2>${a.correct?copy('答对了','Correct'):copy('这题不对，我们看一下原因','Not quite — here is why')}</h2><p>${esc(t(selected.feedback))}</p>${a.correct?'':`<p><strong>${copy('这题应选：','Supported answer: ')}</strong>${esc(t(correct.text))}</p>${t(selected.feedback)===t(correct.feedback)?'':`<p>${esc(t(correct.feedback))}</p>`}`}${otherWrong.length?`<details><summary>${copy('看看其他选项为什么不合适','Why the other option does not fit')}</summary>${otherWrong.map(o=>`<p><b>${esc(t(o.text))}</b><br>${esc(t(o.feedback))}</p>`).join('')}</details>`:''}${button('next','继续','Continue','','primary wide')}</section>`;
    }
    function render(){
      const s=current();if(!s)return home();const u=units[s.unitId],plan=planFor(u,s.mode),step=currentStep(s);
      const head=`<header class="academy-top">${button('home','返回课程','Back to courses','','linkbtn')}<span>${esc(t(u.title))}</span><span>${Math.min(s.index+1,plan.length)} / ${plan.length}</span></header><div class="academy-progress" role="progressbar" aria-label="${copy('本节进度','Lesson progress')}" aria-valuemin="0" aria-valuemax="${plan.length}" aria-valuenow="${s.index}"><i style="width:${s.index/plan.length*100}%"></i></div>`;
      if(s.complete){const p=status(u.id),pending=Object.values(p?.targets||{}).some(x=>x.status==='pending');const nextLesson=source.lessons[source.lessons.findIndex(x=>x.id===u.id)+1];
        return `<main class="academy-shell" data-i18n-ignore>${head}${cardArea(u,s,{})}<section class="academy-complete"><span class="eyebrow">${copy('本轮学习完成','This round is complete')}</span><h1>${esc(t(u.title))}</h1><p>${esc(t(u.summary))}</p>${pending?`<p class="academy-support-note">${copy('刚才比较难的地方已经记下了。之后换个例子再练，现在可以继续。','The difficult parts have been saved. Revisit them with an example later; you can continue now.')}</p>`:''}<div class="buttonstack">${u.id==='I04'&&data().pendingReverse?button('reverse','继续刚才那张牌的逆位','Continue the card reversal',`data-id="${data().pendingReverse}"`,'primary wide'):''}${u.kind==='lesson'&&nextLesson?button('start','继续下一课','Next lesson',`data-id="${nextLesson.id}"`,'primary wide'):button('new','再学一张新牌','Learn another new card','','primary wide')}${u.kind==='card'&&s.mode!=='reverse'?button('reverse',status('I04')?.completedAt?'看看这张牌的逆位':'先学逆位的读法',status('I04')?.completedAt?'Study this card reversed':'Learn how reversals work',`data-id="${u.id}"`):''}${button('home','返回课程','Back to courses')}</div></section></main>`;}
      let body='';
      if(step.kind==='teach'||step.kind==='summary'){
        const labels=step.support?copy('换个例子，继续理解','Another example to help it click'):step.key==='T2'&&u.kind==='card'?copy('看看怎样用','See how to apply it'):step.reversed?copy('在这个例子里读逆位','A reversal in this situation'):copy('先看讲解','Start with an explanation');
        const content=u.kind==='card'&&step.key==='T1'&&!step.support?'':step.content.map(p=>`<p>${esc(t(p))}</p>`).join('');
        body=`<section class="academy-copy"><span class="eyebrow">${labels}</span><h1>${step.kind==='summary'?copy('先记住这点，再往下学','Take this point with you'):esc(t(u.title))}</h1>${u.kind==='card'&&step.key==='T1'&&!step.support?`<p class="academy-context-note">${copy('先认识这张牌的正位：牌图朝正方向。接下来先看意思和例子，再做两道练习。','Start with this card upright, with its image facing the usual way. Read its meaning and example, then try two questions.')}</p>`:''}${content}${step.reversed?`<p class="academy-context-note">${copy('这里只练刚才这个情况。逆位不等于把正位的意思反过来。','Practise this stated situation. Reversal does not simply reverse the upright meaning.')}</p>`:''}${button('next',step.kind==='summary'?'继续学习':'继续',step.kind==='summary'?'Continue learning':'Continue','','primary wide')}</section>`;
      }else{
        const q=step.question,a=s.answers[q.id],ordered=[...q.options].sort((x,y)=>hash(x.id+s.seed)-hash(y.id+s.seed));
        const hint=step.key==='Q2'&&u.application?[u.application]:step.reversed?[u.reversal]:u.teachings;
        body=`<section class="academy-copy"><span class="eyebrow">${step.support?copy('换个例子试试','Try another example'):copy('做一道练习','Try a question')}</span><h1>${esc(t(q.prompt))}</h1><div class="academy-options">${ordered.map(o=>`<button data-academy="answer" data-value="${o.id}" class="academy-option ${a?(o.id===q.correct?'correct':o.id===a.selected?'incorrect':''):''}" ${a?'disabled':''}><span>${esc(t(o.text))}</span>${a&&o.id===q.correct?'<b aria-label="'+copy('正确答案','Correct answer')+'">✓</b>':''}</button>`).join('')}</div>${a?feedback(q,a):`${button('hint','回看刚才的讲解','Review the explanation','','linkbtn')}${s.hint?`<aside class="academy-hint">${hint.map(p=>`<p>${esc(t(p))}</p>`).join('')}</aside>`:''}`}</section>`;
      }
      return `<main class="academy-shell" data-i18n-ignore>${head}${cardArea(u,s,step)}${body}</main>`;
    }
    function hash(s){let h=0;for(const c of s)h=(Math.imul(h,31)+c.charCodeAt(0))|0;return h;}
    function refresh(scroll=false){const old=document.querySelector('.academy-shell,.academy-home');if(!old){go(current()?'academy':'courses');return;}const y=window.scrollY;old.outerHTML=old.classList.contains('academy-home')?home():render();if(scroll)window.scrollTo(0,0);else window.scrollTo(0,y);}
    function paintAnimation(){
      const s=current(),el=document.querySelector('.academy-animation');if(!s||!el)return;
      const a=s.animation,staticMode=a.static||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      el.classList.toggle('is-static',!!staticMode);el.classList.toggle('is-paused',!!a.paused);
      const deck=el.querySelector('.academy-demo-deck');if(deck)deck.dataset.frame=a.frame;
      el.querySelectorAll('.academy-animation-captions>li').forEach((li,i)=>li.classList.toggle('active',i===a.frame));
      el.querySelectorAll('.academy-concept-steps>div').forEach((item,i)=>item.setAttribute('aria-current',i===a.frame?'step':'false'));
      // Preserve DOM nodes so the shuffle/cut moves interpolate, not jump after a
      // page rebuild. Pausing also freezes an in-flight CSS transition.
      for(const motion of el.getAnimations?.({subtree:true})||[])a.paused?motion.pause():motion.play();
      if(['A05','A06'].includes(s.unitId)){
        const path=s.animation.path||'all',group=path==='a'?[0,1,3]:path==='b'?[0,2,4]:path==='work'?[0,1]:path==='movement'?[3,4,5,7]:path==='outcome'?[2,8,9]:units[s.unitId].cards.map((_,i)=>i);
        document.querySelectorAll('.academy-image-space figure').forEach((f,i)=>f.classList.toggle('is-emphasized',group.includes(i)));
        document.querySelectorAll('[data-academy=path]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===path)));
      }
    }
    function animate(replay=false){
      const d=data(),s=d.session;if(!s||s.complete)return;pauseAnimation();
      if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){s.animation={frame:3,static:true,paused:true};save(d);paintAnimation();return;}
      if(replay)s.animation={frame:0,static:false,paused:false};
      else s.animation={...s.animation,static:false,paused:!s.animation.paused};
      save(d);paintAnimation();
      const tick=()=>{const d=data(),s=d.session;if(!s||s.complete||s.animation.paused)return;const step=currentStep(s),u=units[s.unitId],max=s.unitId==='B02'&&step?.key==='T2'?3:Math.max(0,framesFor(u,step).length-1);if(s.animation.frame>=max){s.animation.paused=true;save(d);paintAnimation();return;}s.animation.frame=Math.min(max,s.animation.frame+1);if(s.unitId==='A05')s.animation.path=['all','a','b'][s.animation.frame];if(s.unitId==='A06')s.animation.path=['work','movement','outcome'][s.animation.frame];save(d);paintAnimation();if(!s.animation.paused)animationTimer=setTimeout(tick,1600);};
      if(!s.animation.paused)animationTimer=setTimeout(tick,1600);
    }
    function autoPlayDemonstration(){
      const s=current(),step=currentStep(s);
      if(!s||s.complete||step?.kind!=='teach'||step.support||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||!document.querySelector('.academy-animation'))return;
      animate(true);
    }
    document.addEventListener('click',e=>{
      if(e.target.closest('[data-action="nav"],.bottomnav button'))pauseAnimation();
      const el=e.target.closest('[data-academy]');if(!el||el.disabled)return;
      const action=el.dataset.academy;
      if(action==='start'){start(el.dataset.id);return;}
      if(action==='reverse'){start(el.dataset.id,'reverse');return;}
      if(action==='new'){newCard();return;}
      if(action==='review'){review();return;}
      if(action==='continue'){pauseAnimation();const scroll=current()?.scroll||0;go(active()?'academy':'courses');requestAnimationFrame(()=>window.scrollTo(0,scroll));return;}
      if(action==='home'){pauseAnimation();const d=data();if(d.session){d.session.scroll=window.scrollY;d.session.animation.paused=true;save(d);}go('courses');return;}
      if(action==='level'){level=el.dataset.value;refresh();return;}
      const d=data(),s=d.session;if(!s||s.complete)return;
      if(action==='answer'){if(answer(d,el.dataset.value,now())){save(d);refresh();}return;}
      if(action==='hint'){s.hint=true;save(d);refresh();return;}
      if(action==='next'){
        pauseAnimation();
        if(s.support?.key==='review-summary'){if(advance(d,now())){save(d);refresh(true);}return;}
        if(advance(d,now())){save(d);refresh(true);}return;
      }
    });
    // Save scrolling without a write for every scroll event. Restoring the unit
    // keeps both its committed evidence and the learner's reading position.
    let scrollSaveTimer=null;
    window.addEventListener?.('scroll',()=>{if(!document.querySelector('.academy-shell'))return;clearTimeout(scrollSaveTimer);scrollSaveTimer=setTimeout(()=>{const d=data();if(d.session){d.session.scroll=window.scrollY;save(d);}},180);},{passive:true});
    window.addEventListener?.('pagehide',()=>{if(!document.querySelector('.academy-shell'))return;const d=data();if(d.session){d.session.scroll=window.scrollY;d.session.animation.paused=true;save(d);}});
    document.addEventListener('input',e=>{if(!e.target.matches('[data-academy-search]'))return;search=e.target.value;const pos=e.target.selectionStart;refresh();const input=document.querySelector('[data-academy-search]');input?.focus({preventScroll:true});if(input?.type!=='search')input?.setSelectionRange(pos,pos);});
    document.addEventListener('tarot-language-change',()=>{pauseAnimation();const d=data();if(d.session){d.session.lang=lang();d.session.animation.paused=true;save(d);}if(document.querySelector('.academy-shell,.academy-home'))refresh();});
    function dashboard(){return `<section class="section" data-i18n-ignore><h2>${copy('课程学习','Course learning')}</h2><p>${source.lessons.filter(u=>status(u.id)?.completedAt).length} / 20 ${copy('课完成本轮','lesson rounds completed')} · ${completedCards().length} / 78 ${copy('张牌完成正位初学','upright card introductions completed')}</p>${button('home','继续学习','Continue learning')}${due().length?button('review','回访学过的内容','Revisit earlier learning'):''}</section>`;}
    return {home,render,start,newCard,review,current,active,status,completedCards,due,recommendation,dashboard,pause:pauseAnimation};
  }
  window.TarotAcademy={blank,validate,planFor,stepFor:currentStep,answer,advance,units,create,version};
})();
