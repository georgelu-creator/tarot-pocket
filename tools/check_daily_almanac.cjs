/* Synthetic saved days only; never reads invitation secrets or real progress. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{pathToFileURL}=require('node:url');
const {chromium,webkit}=require('playwright'),root=path.resolve(__dirname,'..'),KEY='tarot-reading-v3';
const world={window:{}};for(const file of ['reading-deck.js','daily-content.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),world);
const cards=JSON.parse(JSON.stringify(world.window.TAROT_READING_DECK.cards)),guides=world.window.TAROT_DAILY_GUIDANCE;
assert.deepEqual(Object.keys(guides).sort(),cards.map(c=>c.id).sort());
for(const card of cards)for(const side of ['upright','reversed'])for(const key of ['do','avoid'])assert.equal(typeof guides[card.id][side][key],'string');
const url=process.env.DEMO_URL||pathToFileURL(path.join(root,'demo/tarot-demo.html')).href;
const fallbackUrl=(()=>{const value=new URL(url);value.searchParams.set('lang','en');return value.href;})();
(async()=>{
 for(const engine of [chromium,webkit]){
  const browser=await engine.launch(require('./browser_options.cjs'));
  try{
   const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await ctx.newPage(),errors=[];
   p.on('pageerror',e=>errors.push(e.message));
   await p.clock.setFixedTime(new Date('2026-09-15T12:00:00'));
   async function open(cardId,reversed=false,date='2026-09-15'){
    await p.addInitScript(({ids,cardId,reversed,date,KEY})=>{
     const pool=[cardId,...ids.filter(id=>id!==cardId)].map(id=>({id,reversed}));
     const draft={id:'daily-fixture',at:1789444800000,spreadId:'daily',topic:'career',questionId:'own',questionText:'',contextEnabled:false,reversals:true,pool,picked:[0],revealed:[0],active:0,phase:'read',dailyDate:date};
     localStorage.setItem(KEY,JSON.stringify({version:1,settings:{topic:'career',spreadId:'daily',questionId:'own',reversals:true},draft,history:[],practice:[],daily:[draft],ui:{view:'table',category:'all',guideId:'three',guideActive:0,question:''}}));
    },{ids:cards.map(c=>c.id),cardId,reversed,date,KEY});
    await p.goto(fallbackUrl);await p.locator('.bottomnav [data-page=reading]').click();await p.locator('.daily-almanac').waitFor();assert.equal(await p.locator('html').getAttribute('lang'),'zh-CN');assert.equal(await p.locator('[data-language-toggle]').count(),0);
   }
   for(const [cardId,reversed,date] of [['m21',false,'2026-09-15'],['p12',true,'2001-02-03']]){
    // Fresh page ensures no earlier fixture script can overwrite the current day.
    if(cardId!=='m21'){await p.close();}
    if(cardId!=='m21')break;
    await open(cardId,reversed,date);const card=cards.find(c=>c.id===cardId);
    assert.equal(await p.locator('.daily-calendar').getAttribute('datetime'),date);
    assert.equal(await p.locator('.daily-calendar strong').innerText(),'15');
    assert.equal(await p.locator('.daily-calendar>span').last().innerText(),'星期二');
    assert.equal(await p.locator('.daily-core').innerText(),card.core);
    assert.equal(await p.locator('.daily-advice>p').innerText(),card.upright);
    assert.equal(await p.locator('.daily-do>p').innerText(),guides[cardId].upright.do);
    assert.equal(await p.locator('.daily-avoid>p').innerText(),guides[cardId].upright.avoid);
    assert.equal(await p.locator('.reading-board,.reading-stage,[data-reading=new],[data-reading-ai]').count(),0,'daily result has no duplicate spread or teaching/AI result flow');
    assert(!/分享|Share/.test(await p.locator('.daily-almanac').innerText()));
    for(const width of [320,390,1280]){
      await p.setViewportSize({width,height:900});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow');
      const image=p.locator('.daily-cover img');assert(await image.evaluate(i=>i.complete&&i.naturalWidth>100));
      assert(await image.evaluate(i=>Math.abs(i.getBoundingClientRect().width/i.getBoundingClientRect().height-i.naturalWidth/i.naturalHeight)<.01),'face has original aspect ratio');
      const signs=await p.locator('.daily-signs').boundingBox();assert(signs.y+signs.height<700,'both short reminders appear near the card');
      if(process.env.CAPTURE_DAILY==='1'&&engine===chromium&&width===390)await p.screenshot({path:path.join(root,'docs/images/daily-v154-zh.png'),fullPage:false});
    }
    await p.locator('.daily-reference>summary').click();assert(await p.locator('.daily-provenance').isVisible());
    const before=await p.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)).daily,KEY);
    await p.locator('[data-reading=finish]').click();await p.locator('[data-reading=daily]').click();
    assert.deepEqual(await p.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)).draft.pool,KEY),before[0].pool,'same-day revisit preserves cards');
    assert.equal(await p.locator('.daily-almanac').evaluate(e=>getComputedStyle(e).animationName),'none','reduced motion disables arrival');
   }
   const q=await ctx.newPage();q.on('pageerror',e=>errors.push(e.message));await q.addInitScript(({ids,KEY})=>{
    const draft={id:'historical-daily',at:981172800000,spreadId:'daily',topic:'career',questionId:'own',questionText:'',contextEnabled:false,reversals:true,pool:ids.map(id=>({id,reversed:true})),picked:[0],revealed:[0],active:0,phase:'read',dailyDate:'2001-02-03'};
    localStorage.setItem(KEY,JSON.stringify({version:1,settings:{topic:'career',spreadId:'daily',questionId:'own',reversals:true},draft,history:[],practice:[],daily:[draft],ui:{view:'table',category:'all',guideId:'three',guideActive:0,question:''}}));
   },{ids:['p12',...cards.map(c=>c.id).filter(id=>id!=='p12')],KEY});
   await q.goto(fallbackUrl);await q.locator('.bottomnav [data-page=reading]').click();assert.equal(await q.locator('html').getAttribute('lang'),'zh-CN');assert.equal(await q.locator('[data-language-toggle]').count(),0);assert.equal(await q.locator('.daily-calendar').getAttribute('datetime'),'2001-02-03');assert.equal(await q.locator('.daily-calendar strong').innerText(),'03');
   assert.equal(await q.locator('.daily-advice>p').innerText(),cards.find(c=>c.id==='p12').reversed);
   assert.equal(await q.locator('.daily-do>p').innerText(),guides.p12.reversed.do);
   assert.equal(await q.locator('.daily-avoid>p').innerText(),guides.p12.reversed.avoid);
   assert.equal(await q.locator('.daily-calendar>span').last().innerText(),'星期六');
   assert.equal(await q.locator('.daily-cover img').evaluate(e=>getComputedStyle(e).transform),'matrix(-1, 0, 0, -1, 0, 0)');
   await q.locator('.daily-cover').click();assert.equal(await q.locator('.zoom-backdrop img').evaluate(e=>getComputedStyle(e).transform),'matrix(-1, 0, 0, -1, 0, 0)','zoom keeps reversal');await q.locator('[data-action=close]').click();assert(await q.locator('.daily-almanac').isVisible());
   await q.emulateMedia({reducedMotion:'no-preference'});await q.reload();await q.locator('.bottomnav [data-page=reading]').click();assert.equal(await q.locator('.daily-almanac').evaluate(e=>getComputedStyle(e).animationName),'daily-arrive');
   await q.close();assert.deepEqual(errors,[]);await ctx.close();
  }finally{await browser.close();}
 }
 console.log(JSON.stringify({status:'PASS',cards:78,reminders:312,checks:['original core/advice retained','card-specific upright/reversed reminders','saved historical date and weekday','one result sheet, no share action','320/390/1280px Chinese-only UI','?lang=en falls back to zh-CN with no toggle','full card aspect and reversed zoom','saved deck preserved on revisit','normal/reduced motion'],physicalIPhone:false}));
})().catch(e=>{console.error(e);process.exitCode=1;});
