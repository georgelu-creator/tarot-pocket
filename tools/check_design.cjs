/* Verify the design integration without replacing the existing regression suite. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const h=require('./reading_ui_harness.cjs');
const key='tarot-reading-v3';
const state=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
function contrast(a,b){const L=s=>{const c=s.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return c[0]*.2126+c[1]*.7152+c[2]*.0722};const x=L(a),y=L(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
(async()=>{
 const server=await h.server(),url=server.url;
 const browser=await chromium.launch(require('./browser_options.cjs'));
 try{
 const ctx=await h.context(browser,{viewport:{width:390,height:844}}),p=await ctx.newPage();
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(url+'?lang=en');assert.equal(await p.locator('html').getAttribute('lang'),'zh-CN');assert.equal(await p.locator('[data-language-toggle]').count(),0);
 const design=await p.evaluate(()=>{const c=getComputedStyle(document.documentElement),n=getComputedStyle(document.querySelector('.bottomnav'));return {bg:c.backgroundColor,ink:c.color,accent:c.getPropertyValue('--accent').trim(),muted:c.getPropertyValue('--muted').trim(),font:getComputedStyle(document.querySelector('h1')).fontFamily,glass:n.backgroundColor}});
 assert.equal(design.bg,'rgb(246, 241, 233)');assert.equal(design.accent,'#60465C');assert(design.font.includes('Serif')||design.font.includes('Songti'));
 assert(contrast(design.ink,design.bg)>=4.5);
 assert(contrast('rgb(115,107,115)',design.bg)>=4.5);
 assert(contrast('rgb(246,241,233)','rgb(96,70,92)')>=4.5);
 for(const w of [320,390,430,1280]){
     await p.setViewportSize({width:w,height:844});
     assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
     if(w===390)assert.equal(await p.locator('[data-home-choice]').count(),2,'home keeps only the two primary choices');
 }
 await p.setViewportSize({width:390,height:844});
 await p.locator('.bottomnav [data-page=reading]').click();
 await h.intro(p,'three');
 await p.locator('[data-reading-question]').fill('我想推进这个项目，当前最值得先核对和行动的是什么？');
 assert.equal(await p.locator('[data-reading-setting=reversals]').count(),0);
 await p.locator('[data-reading=start]').click();
 const before=(await state(p)).draft;
 assert.equal(await p.locator('.bottomnav').count(),0,'focused draw retains an exit instead of persistent navigation');
 assert(await p.locator('[data-reading=pause]').isVisible());
 await p.locator('[data-reading=cut][data-index="26"]').waitFor();
 assert.equal(await p.locator('[data-reading=skip-animation],[data-reading=motion-pause],[data-reading=motion-replay]').count(),0,'the ritual does not add effect controls');
 assert.deepEqual((await state(p)).draft.pool,before.pool,'the automatic shuffle keeps its original randomized pool');
 await p.locator('[data-reading=cut][data-index="26"]').click();await p.locator('[data-reading=pick]').first().waitFor();
 const cutPool=(await state(p)).draft.pool;assert.deepEqual(cutPool,[...before.pool.slice(26),...before.pool.slice(0,26)],'cut rotates the existing pool');
 const styles=await p.locator('.reading-fan-card:not(:disabled) .reading-back').evaluateAll(els=>[...new Set(els.map(e=>getComputedStyle(e).backgroundImage))]);
 assert.equal(styles.length,1);const standalone=await p.evaluate(()=>!!window.TAROT_STANDALONE);if(standalone)assert(styles[0].includes('data:image/svg+xml;base64,'),'standalone card-back must be embedded');else assert(styles[0].includes('/assets/design/card-back.svg'),'web edition uses the bundled local card back');assert(await p.locator('.reading-fan-card .reading-back').first().evaluate(async e=>{const url=getComputedStyle(e).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];const i=new Image();i.src=url;await i.decode();return i.naturalWidth>0;}),'actual shared card-back image decodes');
 await p.evaluate(()=>TAROT_I18N.setLocale('en'));assert.equal(await p.locator('html').getAttribute('lang'),'zh-CN');assert.equal(await p.locator('[data-language-toggle]').count(),0);assert.deepEqual((await state(p)).draft.pool,cutPool);
 for(let i=0;i<3;i++)await h.pick(p,i);await p.locator("[data-reading=reveal]").waitFor();
 await p.locator('[data-reading=reveal]').evaluate(b=>{b.click();b.click();b.click()});
 assert.deepEqual((await state(p)).draft.revealed,[0,1,2],'rapid group reveal cannot create duplicate outcomes');
 assert.equal(await p.locator('.reveal-group.is-revealing-group .group-flip-back').count(),3);
 assert.equal(await p.locator('.is-revealing-group .reveal-group-face').first().evaluate(el=>getComputedStyle(el).animationName),'group-face-arrive');
 const saved=(await state(p)).draft;
 await p.locator('[data-reading=pause]').first().click();await p.reload();await p.locator('.bottomnav [data-page=reading]').click();
 assert.deepEqual((await state(p)).draft.pool,saved.pool);assert.deepEqual((await state(p)).draft.revealed,[0,1,2]);
 await p.locator('[data-reading=resume]').click();await ctx.setOffline(true);await p.emulateMedia({reducedMotion:'reduce'});
 assert.equal((await state(p)).draft.phase,'read');assert.equal(await p.locator('.bottomnav').count(),0);
 assert.equal(await p.locator('.reading-result-card img').count(),3,'all faces survive an interrupted group animation');
 for(const w of [320,390,1280]){await p.setViewportSize({width:w,height:900});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 // Large text and solid-material fallbacks use real browser CSS/media, not a screenshot stub.
 await p.setViewportSize({width:390,height:844});
 await p.addStyleTag({content:'body{font-size:200%}button,p{font-size:1em!important}'});
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await p.emulateMedia({contrast:'more'});
 await p.locator('[data-reading=pause]').first().click();
 assert.equal(await p.locator('.bottomnav').evaluate(e=>getComputedStyle(e).backdropFilter),'none');
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({status:'PASS',design:'Moonlit',checks:['palette and text contrast','Chinese-only responsive home','?lang=en and compatibility locale call keep zh-CN with no toggle','decoded bundled or embedded shared card back','focused draw with exit','skip retains shuffled pool','rapid reveal is unique','locale call and reload preserve draw','reduced motion and offline reveal','200 percent reading text','opaque contrast fallback']}));
 }finally{await browser.close();await server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
