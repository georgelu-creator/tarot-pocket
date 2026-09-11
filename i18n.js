/* Translate presentation only: card IDs, scoring and saved records stay stable. */
(() => {
  'use strict';
  const dictionary = window.TAROT_EN || {};
  const key = 'tarot-pocket-language';
  const requested = new URLSearchParams(location.search).get('lang');
  let locale = requested === 'en' ? 'en' : requested === 'zh' ? 'zh-CN' : 'zh-CN';
  try { if (!requested) locale = localStorage.getItem(key) === 'en' ? 'en' : 'zh-CN'; } catch (_) { /* Practice works without storage. */ }
  const originals = new WeakMap();
  const attributes = new WeakMap();
  const han = /[\u3400-\u9fff]/;
  const escapeRE = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matcher = new RegExp(Object.keys(dictionary).sort((a,b)=>b.length-a.length).map(escapeRE).join('|') || '(?!)', 'g');
  const missing = new Set();
  const count = (n,word) => `${n} ${word}${Number(n)===1?'':'s'}`;
  // Whole-sentence rules keep dynamic grammar out of shared glossary entries.
  const patterns = [
    [/^第 (\d+) 个位置$/,m=>`Position ${m[1]}`],
    [/^选择第 (\d+) 张牌背$/,m=>`Choose card back ${m[1]}`],
    [/^选第 (\d+) 张 · (.+)$/,m=>`Pick card ${m[1]} · ${translate(m[2])}`],
    [/^第 (\d+) 位在问什么？$/,m=>`What does position ${m[1]} ask?`],
    [/^第 (\d+) 位是「(.+)」：(.+)$/,m=>`Position ${m[1]} is ${translate(m[2])}: ${translate(m[3])}`],
    [/^(\d+) 张$/,m=>count(m[1],'card')],
    [/^洗牌并开始 · (\d+) 张$/,m=>`Shuffle & begin · ${count(m[1],'card')}`],
    [/^完成 (\d+) 个练习，首次选对 (\d+) 题。$/,m=>`Completed ${count(m[1],'exercise')}; ${m[2]} correct on the first attempt.`],
    [/^完成 (\d+) 个环节。刚练过，还需要隔一段时间再检验。$/,m=>`Completed ${count(m[1],'step')}. Return after a delay to check what remains.`],
    [/^这份记录包含 (\d+) 次练习和 (\d+) 张收藏，将替换当前快练记录。$/,m=>`This backup contains ${count(m[1],'drill answer')} and ${count(m[2],'saved card')}. It will replace your current drill records.`],
    [/^另含 (\d+) 次学习单元记录，将一并恢复单元进度。$/,m=>`It also contains ${count(m[1],'unit record')}; unit progress will be restored.`],
    [/^另含 (\d+) 组抽牌记录及当前牌桌进度，将一并恢复。$/,m=>`It also contains ${count(m[1],'reading')} and the current table, which will be restored.`],
    [/^(.+)适合这样用$/,m=>`${translate(m[1])} — when to use it`],
    [/^目标位提醒你核对：你是否正在追求与“(.+)”有关的状态？它描述想达到的方向，不代表已经实现。结合(.+)问题，再看目标是否符合现实需要。$/,m=>`Consider this theme for your goal: “${translate(m[1])}” Is this what you are working toward? This position describes an aim, not an achieved result. For your ${translate(m[2]).toLowerCase()} question, consider whether that aim fits actual needs.`]
  ];
  function translate(value) {
    if (locale !== 'en' || !han.test(value)) return value;
    const trimmed = value.trim();
    for(const [pattern,render]of patterns){const match=trimmed.match(pattern);if(match)return render(match);}
    if (Object.hasOwn(dictionary, trimmed)) return value.replace(trimmed, dictionary[trimmed]);
    const result = value.replace(matcher, match=>' '+dictionary[match]+' ')
      .replace(/[「『]/g,'“').replace(/[」』]/g,'”').replace(/，/g,', ').replace(/。/g,'. ')
      .replace(/：/g,': ').replace(/；/g,'; ').replace(/？/g,'?').replace(/！/g,'!')
      .replace(/（/g,'(').replace(/）/g,')').replace(/＋/g,' + ')
      .replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').replace(/“\s+/g,'“').replace(/\s+”/g,'”').trim();
    if (han.test(result)) missing.add(trimmed);
    return result;
  }
  function ignored(el) { return !el || !!el.closest('script,style,noscript,[data-i18n-ignore]'); }
  function translateText(node) {
    if (ignored(node.parentElement)) return;
    const current = node.nodeValue;
    let saved = originals.get(node);
    if (!saved || saved.last !== current) saved = {original:current,last:current};
    let next = translate(saved.original);
    if(locale==='en'&&node.nextSibling?.nodeName==='BR'&&!/\s$/.test(next))next+=' ';
    if (next !== current) node.nodeValue = next;
    saved.last = next; originals.set(node,saved);
  }
  function translateAttrs(el) {
    if (ignored(el)) return;
    const saved = attributes.get(el) || {};
    for (const name of ['aria-label','alt','title','placeholder']) {
      if (!el.hasAttribute(name)) continue;
      const current = el.getAttribute(name);
      if (!saved[name] || saved[name].last !== current) saved[name]={original:current,last:current};
      const next = translate(saved[name].original);
      if (next !== current) el.setAttribute(name,next);
      saved[name].last=next;
    }
    attributes.set(el,saved);
  }
  function walk(root) {
    if (root.nodeType === Node.TEXT_NODE) { translateText(root); return; }
    if (root.nodeType !== Node.ELEMENT_NODE || ignored(root)) return;
    translateAttrs(root);
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
    for(let node=walker.nextNode();node;node=walker.nextNode()) {
      if(node.nodeType===Node.TEXT_NODE)translateText(node);else translateAttrs(node);
    }
  }
  function sync() {
    document.documentElement.lang=locale;
    document.title=locale==='en'?'Tarot Pocket · Learn, recall, read':'Tarot Pocket · 塔罗随身学';
    const toggle=document.querySelector('[data-language-toggle]');
    if(toggle){toggle.textContent=locale==='en'?'中文':'EN';toggle.lang=locale==='en'?'zh-CN':'en';toggle.setAttribute('aria-label',locale==='en'?'Switch to Chinese':'Switch to English');}
    walk(document.body);
  }
  const observer=new MutationObserver(records=>{
    observer.disconnect();
    for(const record of records){
      if(record.type==='characterData')translateText(record.target);
      else if(record.type==='attributes')translateAttrs(record.target);
      else for(const node of record.addedNodes)walk(node);
    }
    observe();
  });
  function observe(){observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label','alt','title','placeholder']});}
  function setLocale(next){
    if(!['en','zh-CN'].includes(next))return;
    locale=next;missing.clear();
    try{localStorage.setItem(key,locale);}catch(_){}
    try{const url=new URL(location.href);url.searchParams.set('lang',locale==='en'?'en':'zh');history.replaceState(null,'',url);}catch(_){}
    observer.disconnect();sync();observe();
    document.dispatchEvent(new CustomEvent('tarot-language-change',{detail:{locale}}));
  }
  document.addEventListener('click',e=>{if(e.target.closest('[data-language-toggle]'))setLocale(locale==='en'?'zh-CN':'en');});
  window.TAROT_I18N={get locale(){return locale;},translate,setLocale,missing};
  sync();observe();
})();
