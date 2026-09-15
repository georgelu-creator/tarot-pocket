/* Scene-driven reading and focused learning acceptance. All state is synthetic;
   no invitation, provider, live service, or personal browser profile is used. */
'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),url=process.env.DEMO_URL||pathToFileURL(path.join(root,'demo/tarot-demo.html')).href;
const KEY='tarot-reading-v3',capture=process.env.CAPTURE_V16==='1';
const read=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
const draft=async p=>(await read(p)).draft;
async function fits(p){assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'page fits the viewport without horizontal scrolling');}
async function english(p){const missing=await p.evaluate(()=>{const out=[],w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);for(let n=w.nextNode();n;n=w.nextNode())if(!n.parentElement.closest('script,style,noscript,[data-i18n-ignore]')&&/[\u3400-\u9fff]/.test(n.textContent))out.push(n.textContent.trim());return [...new Set(out)];});assert.deepEqual(missing,[],'visible experience is fully translated');}
async function capturePage(p,name,lang,fullPage=false){if(capture)await p.screenshot({path:path.join(root,'docs/images',`${name}-v16-${lang}.png`),fullPage,animations:'allow'});}
async function sortedCatalog(p){const visible=await p.locator('.reading-spread-choice').evaluateAll(es=>es.map(e=>e.dataset.value));const counts=await p.evaluate(ids=>ids.map(id=>TAROT_SPREAD_CONTENT.spreads.find(s=>s.id===id).positions.length),visible);assert.deepEqual(counts,[...counts].sort((a,b)=>a-b),'spreads are ordered by card count');assert(visible.includes('open-three'),'open three-card reading is available in every scene');return visible;}
async function openDeck(p){await p.locator('[data-reading=start]').click();await p.locator('[data-reading=skip-animation]').click();await p.locator('[data-reading=cut-default]').click();await p.locator('[data-reading=skip-animation]').click();await p.locator('.whole-deck-grid').waitFor();}
(async()=>{
 const browser=await chromium.launch(require('./browser_options.cjs'));
 try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'}),p=await ctx.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(15000);p.setDefaultNavigationTimeout(120000);
  await p.goto(url);await p.locator('.bottomnav [data-page=reading]').click();
  const scenarios=[['all','general'],['love','love'],['work','career'],['study','study'],['life','life'],['self','self'],['choice','choice']];
  let previousIntro='';
  for(const [category,topic]of scenarios){
   await p.locator('.reading-gallery-head').evaluate(el=>window.__v16Gallery=el);await p.locator('.reading-categories').evaluate(el=>window.__v16Tabs=el);
   await p.locator(`[data-reading=category][data-value=${category}]`).click();
   assert(await p.locator('.reading-gallery-head').evaluate(el=>el===window.__v16Gallery),'switching tabs preserves the surrounding gallery DOM');
   assert(await p.locator('.reading-categories').evaluate(el=>el===window.__v16Tabs),'switching tabs preserves the actual tab controls');
   const intro=await p.locator('.reading-scene-summary').innerText();assert(intro&&intro!==previousIntro,'each scene changes the description below the tabs');previousIntro=intro;
   const expected=await p.evaluate(category=>TAROT_SPREAD_CONTENT.sceneGuides[category],category);assert.equal(intro,expected.intro);
   const visible=await sortedCatalog(p);const threeText=await p.locator('[data-reading=guide][data-value=three] .spread-choice-copy>p').innerText();if(expected.uses.three)assert.equal(threeText,expected.uses.three,'the same layout receives scene-specific purpose copy');
   for(const width of [320,390,1280]){await p.setViewportSize({width,height:844});await fits(p);}await p.setViewportSize({width:390,height:844});
   await p.locator('[data-reading=guide][data-value=open-three]').click();assert.equal(await p.locator('.bottomnav:visible').count(),0,'guide text is not covered by the floating navigation');assert.equal(await p.locator('.reading-selected>strong').innerText(),expected.label);
   const open=await p.evaluate(()=>TAROT_SPREAD_CONTENT.spreads.find(s=>s.id==='open-three'));
   assert.deepEqual(open.positions.map(x=>x.id),['card-1','card-2','card-3']);assert(open.positions.every(x=>x.role==='free'),'open cards do not acquire timeline or advice roles');
   assert(open.description.includes('不能把抽取顺序当成时间顺序'));assert(open.source.note.includes('不声称为某个传统命名牌阵'));
   await p.locator('[data-reading=use-spread]').click();assert.equal(await p.locator('.bottomnav:visible').count(),0,'question entry has a clear focused surface');assert.equal(await p.locator('[data-reading-setting=reversals]').count(),0);
   assert.equal(await p.locator('[data-reading-question]').getAttribute('placeholder'),expected.example,'question hint follows the selected scene');
   const question=`Synthetic ${topic} question: what is the likely outcome this month?`;await p.locator('[data-reading-question]').fill(question);await openDeck(p);
   assert.equal(await p.locator('[data-deck-card]').count(),78);assert.equal(await p.locator('[data-reading=pick]:enabled').count(),78);
   assert.equal(await p.locator('[data-reading=pick-confirm],[data-reading=pick-page]').count(),0);
   let s=await draft(p);assert.equal(s.topic,topic);assert.equal(s.questionText,question);assert.equal(s.reversals,true,'reversals are included by default');const pool=s.pool;
   await p.reload();await p.locator('.bottomnav [data-page=reading]').click();s=await draft(p);assert.equal(s.topic,topic);assert.equal(s.questionText,question);assert.deepEqual(s.pool,pool,'reload keeps the exact shuffled deck');assert.equal((await read(p)).ui.category,category);
   for(const index of [77,39,0])await p.locator(`[data-reading=pick][data-index="${index}"]`).click();s=await draft(p);assert.deepEqual(s.picked,[77,39,0],'selection follows actual one-tap draw order');assert.equal(s.phase,'reveal');
   const request=await p.evaluate(KEY=>TarotReadingAI.buildRequest(JSON.parse(localStorage.getItem(KEY)).draft,'zh'),KEY);
   assert.equal(request.topic,topic);assert.equal(request.question,question);assert.equal(request.spreadId,'open-three');assert.deepEqual(request.cards,[77,39,0].map(i=>pool[i]));
   await p.locator('[data-reading=reveal-all]').click();await p.locator('[data-reading-completion]').waitFor();s=await draft(p);assert.equal(s.phase,'read');assert.deepEqual(s.revealed,[0,1,2],'one reveal action opens the entire reading');
   assert.equal(await p.locator('.reading-slot.active').count(),0);assert(await p.locator('.reading-result-return [data-reading=pause]').isVisible(),'result has a direct return to the reading table');
   for(const width of [320,390,1280]){await p.setViewportSize({width,height:844});await fits(p);}await p.setViewportSize({width:390,height:844});
   await p.locator('[data-reading=finish]').click();
  }
  // Capture representative bilingual product screens, all through real UI actions.
  for(const lang of ['zh','en']){
   if(lang==='en')await p.locator('[data-language-toggle]').click();
   await p.locator('[data-reading=category][data-value=love]').click();if(lang==='en')await english(p);await p.evaluate(()=>scrollTo(0,0));await capturePage(p,'reading',lang);
   await p.locator('[data-reading=guide][data-value=three]').click();if(lang==='en')await english(p);await capturePage(p,'reading-guide',lang,true);
   await p.locator('[data-reading=use-spread]').click();await openDeck(p);if(lang==='en')await english(p);await p.evaluate(()=>scrollTo(0,0));await capturePage(p,'ritual-select',lang,true);
   for(const index of [69,31,4])await p.locator(`[data-reading=pick][data-index="${index}"]`).click();if(lang==='en')await english(p);
   if(capture){await p.emulateMedia({reducedMotion:'no-preference'});await p.locator('[data-reading=reveal-all]').click();await p.waitForTimeout(720);await p.locator('.is-revealing-group').waitFor();await capturePage(p,'ritual-reveal',lang,true);await p.waitForFunction(KEY=>JSON.parse(localStorage.getItem(KEY)).draft.phase==='read',KEY);await p.emulateMedia({reducedMotion:'reduce'});}
   else{await p.locator('[data-reading=reveal-all]').click();await p.locator('[data-reading-completion]').waitFor();}
   await p.locator('[data-reading=finish]').click();await p.locator('.bottomnav [data-page=home]').click();
   await p.locator('[data-action=choose-cards]').click();await p.locator('.library-card[data-id=c10]').click();await p.locator('[data-journey=start][data-id=c10]').click();
   // The first pass is a natural encounter with the Ten of Cups; the English
   // pass resumes that same question, never an invented completed record.
   if(await p.locator('[data-journey=inspect]').count()){await p.locator('[data-journey=inspect]').click();await p.locator('[data-journey=next]').click();}
   assert.equal(await p.locator('[data-learning-game=image]').count(),1);assert.equal(await p.locator('.guided-card-anchor img').count(),1);assert.equal(await p.locator('.guided-pair,[data-guided-note],.journey-control').count(),0);
   await p.locator('.guided-card-anchor img').evaluate(i=>i.decode());for(const width of [320,390,1280]){await p.setViewportSize({width,height:844});await fits(p);}await p.setViewportSize({width:390,height:844});if(lang==='en')await english(p);await p.evaluate(()=>scrollTo(0,0));await capturePage(p,'practice',lang);
   await p.locator('[data-action=nav][data-page=home]').first().click();await p.locator('.bottomnav [data-page=reading]').click();
  }
  assert.deepEqual(errors,[]);await ctx.close();console.log(JSON.stringify({status:'PASS',scenes:7,viewports:[320,390,1280],checks:['tab DOM and actual context changes','count-ordered catalog','open-three ordinal roles','category through setup, draft and reload','question and topic in AI payload','78 one-tap cards','default reversals','one-action full reveal','result return','bilingual focused Ten of Cups lesson'],screenshots:capture?10:0,physicalIPhone:false}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
