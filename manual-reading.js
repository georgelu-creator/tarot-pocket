/* Physical cards enter the existing reading pipeline; no separate history or AI. */
window.createTarotManualReading = function (bridge) {
  'use strict';
  const {esc,img,icon,get,set,redraw,submit,back,positionName}=bridge;
  const deck=window.TAROT_READING_DECK.cards;
  const byId=Object.fromEntries(deck.map(c=>[c.id,c]));
  const spreads=window.TAROT_SPREAD_CONTENT.spreads.filter(s=>!s.legacy&&s.id!=='daily');
  const bySpread=Object.fromEntries(spreads.map(s=>[s.id,s]));
  const label=positionName;
  let picking=null,query='';
  function clean(raw) {
    if(!raw||!bySpread[raw.spreadId])return null;
    const count=bySpread[raw.spreadId].positions.length,seen=new Set();
    const selected=Array.from({length:count},(_,i)=>{
      const c=raw.cards?.[i];
      if(!c||!byId[c.id]||seen.has(c.id))return null;
      seen.add(c.id);return {id:c.id,reversed:c.reversed===true};
    });
    const out={spreadId:raw.spreadId,cards:selected,question:typeof raw.question==='string'?raw.question.slice(0,3000):'',returnToResult:raw.returnToResult===true};
    for(const k of ['optionA','optionB','optionC'])out[k]=typeof raw[k]==='string'?raw[k].slice(0,120):'';
    return out;
  }
  function open(s) {
    picking=null;query='';
    set(clean(s?.source==='manual'?{spreadId:s.spreadId,cards:s.picked.map(i=>s.pool[i]),question:s.questionText,optionA:s.optionA,optionB:s.optionB,optionC:s.optionC,returnToResult:true}:get())||clean({spreadId:'open-three'}));
  }
  function pickerOptions() {
    const m=get(),selected=new Set(m.cards.filter(Boolean).map(c=>c.id));
    const q=query.trim().toLowerCase().replace(/金币/g,'星币');
    const found=deck.filter(c=>`${c.name} ${c.id}`.toLowerCase().includes(q));
    return found.length?found.map(c=>`<button class="manual-card-choice" data-manual="choose" data-id="${c.id}" ${selected.has(c.id)&&m.cards[picking]?.id!==c.id?'disabled':''}>${img(c.id)}<span>${esc(c.name)}</span>${selected.has(c.id)?'<small>已选</small>':''}</button>`).join(''):'<p role="status">没有找到这张牌，试试“星币八”或“愚人”。</p>';
  }
  function render() {
    const m=get(),d=bySpread[m.spreadId],count=m.cards.filter(Boolean).length;
    const priority=s=>['one','open-three','open-five'].includes(s.id)?-1:0;
    const options=[...spreads].sort((a,b)=>a.positions.length-b.positions.length||priority(a)-priority(b));
    return `<article class="reading-v2 manual-reading"><header class="reading-header"><button class="iconbtn" data-manual="back" aria-label="返回">${icon('back')}</button><div><small>用你已经抽到的牌</small><h1>手动解牌</h1></div></header><p>把手中的牌放进来，看看每张牌和整组牌的意思。</p><label class="question-field"><span>这组牌用什么牌阵？</span><select data-manual-spread>${options.map(s=>`<option value="${s.id}" ${s.id===m.spreadId?'selected':''}>${esc(s.name)} · ${s.positions.length} 张</option>`).join('')}</select></label><p class="muted">${esc(d.bestFor)}</p><div class="manual-slots count-${d.positions.length}">${d.positions.map((p,i)=>{const c=m.cards[i];return `<section class="manual-slot"><h2>${esc(label(p,i))}</h2><button class="manual-face" data-manual="pick" data-index="${i}" aria-label="${c?'更换'+esc(byId[c.id].name):'选择第'+(i+1)+'张牌'}">${c?img(c.id,c.reversed?'class="reversed-img"':''):'<span class="reading-back"><b>＋</b></span>'}</button><strong>${c?esc(byId[c.id].name):'选择一张牌'}</strong>${c?`<button class="secondary manual-orientation" data-manual="orientation" data-index="${i}" aria-label="第 ${i+1} 张${c.reversed?'逆位，点击切换正位':'正位，点击切换逆位'}">${c.reversed?'逆位':'正位'} ⇄</button>`:''}</section>`;}).join('')}</div>${!['open-three','open-five'].includes(d.id)?`<details class="manual-position-help"><summary>查看牌位说明</summary><ol>${d.positions.map((p,i)=>`<li><strong>${esc(label(p,i))}</strong><p>${esc(p.question)}</p></li>`).join('')}</ol></details>`:''}${['decision-five','three-options'].includes(d.id)?`<div class="manual-options">${['optionA','optionB',...(d.id==='three-options'?['optionC']:[])].map((k,i)=>`<label class="question-field"><span>选项${'ABC'[i]}（可选）</span><input data-manual-option="${k}" maxlength="120" value="${esc(m[k])}"></label>`).join('')}</div>`:''}<label class="question-field"><span>想了解什么？（可选）</span><textarea data-manual-question maxlength="3000" rows="3" placeholder="写下问题或背景，也可以直接看牌义。">${esc(m.question)}</textarea></label><p class="muted manual-save-note">录入时保留原牌局；查看解读后替换当前牌局，当天日运不受影响。不保存抽牌历史。</p><button class="primary wide" data-manual="submit" ${count!==d.positions.length?'disabled':''}>${count===d.positions.length?'查看这组牌的解读':`已录入 ${count} / ${d.positions.length} 张`}</button><p class="muted">先在本机解读；需要时，再主动选择 AI 深度解析。</p><dialog class="manual-picker" aria-labelledby="manual-picker-title"><header><h2 id="manual-picker-title">选择一张牌</h2><button class="iconbtn" data-manual="close" aria-label="关闭选牌">×</button></header><label class="question-field"><span>按牌名查找</span><input type="search" data-manual-search placeholder="例如：圣杯二、星币八" autocomplete="off"></label><div class="manual-card-grid" data-manual-results></div></dialog></article>`;
  }
  function close() {
    document.querySelector('.manual-picker')?.close();
    document.querySelector(`[data-manual="pick"][data-index="${picking}"]`)?.focus({preventScroll:true});
    picking=null;query='';
  }
  document.addEventListener('cancel',e=>{if(e.target.matches?.('.manual-picker')){e.preventDefault();close();}},true);
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-manual]');if(!b||b.disabled||!get())return;
    const m=get(),i=Number(b.dataset.index);
    if(b.dataset.manual==='back'){picking=null;back(m.returnToResult);return;}
    if(b.dataset.manual==='pick'){
      if(!Number.isInteger(i)||!bySpread[m.spreadId].positions[i])return;
      picking=i;query='';const dialog=document.querySelector('.manual-picker');
      dialog.querySelector('[data-manual-search]').value='';dialog.querySelector('[data-manual-results]').innerHTML=pickerOptions();dialog.showModal();dialog.querySelector('[data-manual-search]').focus();return;
    }
    if(b.dataset.manual==='close'){close();return;}
    if(b.dataset.manual==='choose'){
      const id=b.dataset.id;if(picking===null||!byId[id]||m.cards.some((c,n)=>n!==picking&&c?.id===id))return;
      const focus=picking;m.cards[picking]={id,reversed:false};set(m);close();redraw(window.scrollY);
      requestAnimationFrame(()=>document.querySelector(`[data-manual="pick"][data-index="${focus}"]`)?.focus({preventScroll:true}));return;
    }
    if(b.dataset.manual==='orientation'&&m.cards[i]){m.cards[i].reversed=!m.cards[i].reversed;set(m);redraw(window.scrollY);requestAnimationFrame(()=>document.querySelector(`[data-manual="orientation"][data-index="${i}"]`)?.focus({preventScroll:true}));return;}
    if(b.dataset.manual==='submit'){const valid=clean(m);if(valid?.cards.every(Boolean))submit(valid);}
  });
  document.addEventListener('change',e=>{
    if(!e.target.matches('[data-manual-spread]')||!bySpread[e.target.value])return;
    const m=get();if(!m)return;
    set(clean({...m,spreadId:e.target.value,cards:m.cards,optionA:'',optionB:'',optionC:''}));redraw();
  });
  document.addEventListener('input',e=>{
    const el=e.target,m=get();if(!m)return;
    if(el.matches('[data-manual-search]')){query=el.value;document.querySelector('[data-manual-results]').innerHTML=pickerOptions();}
    if(el.matches('[data-manual-question]')){m.question=el.value.slice(0,3000);set(m);}
    if(el.matches('[data-manual-option]')&&['optionA','optionB','optionC'].includes(el.dataset.manualOption)){m[el.dataset.manualOption]=el.value.slice(0,120);set(m);}
  });
  return {clean,open,render};
};
