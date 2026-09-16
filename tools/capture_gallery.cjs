// Capture current source UI with synthetic browser state, never personal records.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),h=require('./reading_ui_harness.cjs');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/images');
(async()=>{
 if(process.env.DEMO_URL)throw Error('Screenshot refresh uses the current isolated source; unset DEMO_URL.');
 fs.mkdirSync(out,{recursive:true});const server=await h.server(),browser=await chromium.launch(require('./browser_options.cjs'));
 try{
 for(const lang of ['zh','en']){
  const ctx=await h.context(browser,{viewport:{width:390,height:844},deviceScaleFactor:2,reducedMotion:'reduce',serviceWorkers:'block'}),p=await ctx.newPage(),errors=[],external=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(!r.url().startsWith(server.url)&&/^https?:/.test(r.url()))external.push(r.url());});
  const capture=async(name,{full=false}={})=>{await p.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(i=>i.complete||i.loading!=='lazy').map(i=>i.decode().catch(()=>{})));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});await h.fit(p);await p.screenshot({path:path.join(out,`${name}-v17-${lang}.png`),fullPage:full});};
  await p.goto(server.url+'?lang='+lang);await p.locator('[data-home-choice]').first().waitFor();
  assert.deepEqual(await p.evaluate(()=>[TAROT_ACADEMY_CONTENT.lessons.length,TAROT_ACADEMY_CONTENT.cards.length,TAROT_READING_SCENARIOS.length]),[20,78,25]);
  await p.locator('.bottomnav [data-page=courses]').click();await capture('courses');
  await p.locator('[data-academy=start][data-id=p08]').click();await capture('practice',{full:true});
  await p.locator('[data-academy=home]').first().click();await p.locator('.bottomnav [data-page=reading]').click();await capture('reading');
  await p.locator('[data-reading=guide][data-scenario=sc05]').click();await capture('reading-guide',{full:true});
  await h.click(p,'start');await h.toPick(p);await h.pick(p,33);await h.center(p,40);await p.evaluate(()=>window.scrollTo(0,0));await capture('ritual-select');
  await h.click(p,'pause');await h.click(p,'daily');await h.toPick(p);
  const sunIndex=(await h.state(p)).draft.pool.findIndex(c=>c.id==='m19');await h.pick(p,sunIndex);await h.reveal(p);await capture('daily',{full:true});
  assert.deepEqual(errors,[]);assert.deepEqual(external,[],'no production or provider traffic');await ctx.close();
 }
 const phone=fs.readFileSync(path.join(out,'courses-v17-en.png')).toString('base64');
 const art=fs.readFileSync(path.join(root,'assets/cards/p08.webp')).toString('base64');
 const hero=await browser.newPage();await hero.setViewportSize({width:1200,height:630});
 await hero.setContent(`<!doctype html><html lang="en"><meta charset="UTF-8"><style>*{box-sizing:border-box}body{margin:0;background:#F6F1E9;color:#302C32;font-family:Arial,sans-serif}.canvas{width:1200px;height:630px;position:relative;overflow:hidden;padding:55px 64px}.brand{font-size:23px;font-weight:bold;letter-spacing:.2px}.spark{display:inline-grid;place-items:center;border:1px solid #60465C;border-radius:7px;width:33px;height:42px;margin-right:12px}h1{font-family:Georgia,serif;font-size:62px;line-height:1.1;letter-spacing:-1.7px;margin:48px 0 24px;font-weight:400}p{font-size:19px;line-height:1.65;max-width:540px;color:#736B73}.tags{display:flex;gap:10px;margin-top:28px}.tags span{border:1px solid #DCD4DC;border-radius:30px;padding:10px 14px;font-size:13px}.bottom{position:absolute;bottom:40px;color:#736B73;font-size:14px}.phone{position:absolute;right:78px;top:37px;width:270px;height:558px;border:7px solid #fff;border-radius:33px;overflow:hidden;box-shadow:0 20px 45px #302C3220;transform:rotate(4deg)}.phone img{width:100%}.art{position:absolute;width:122px;right:334px;top:337px;transform:rotate(-13deg);border:5px solid white;border-radius:7px;box-shadow:0 14px 28px #302C3230}.orb{position:absolute;width:530px;height:530px;border:1px solid #E7DEE8;border-radius:50%;right:-40px;top:58px}.orb:before{content:'';position:absolute;inset:38px;border:1px solid #E7DEE8;border-radius:50%}</style><div class="canvas"><div class="orb"></div><div class="brand"><span class="spark">✧</span> TAROT POCKET</div><h1>Learn the cards.<br>Read the whole story.</h1><p>20 guided lessons. 78 individual card courses.<br>25 reading scenarios, with room for your question.</p><div class="tags"><span>78 historical RWS cards</span><span>20 lessons · 25 scenarios</span><span>English / 中文</span></div><div class="bottom">OFFLINE LEARNING · OPEN SOURCE · EN / 中文</div><div class="phone"><img src="data:image/png;base64,${phone}"></div><img class="art" src="data:image/webp;base64,${art}"></div></html>`);
 await hero.locator('img').evaluateAll(ims=>Promise.all(ims.map(im=>im.decode())));
 await hero.screenshot({path:path.join(out,'hero.png')});
 console.log('Created 12 current source screenshots (20 lessons / 78 cards / 25 scenarios) and hero.png; synthetic isolated state, no live AI.');
 }finally{await browser.close();await server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
