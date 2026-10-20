'use strict';
// Compare actual web and built uni-app surfaces at the same viewport.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium,webkit}=require('playwright'),h=require('./reading_ui_harness.cjs'),{createPreview}=require('../apps/miniapp/tools/preview.cjs');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/miniapp-ui');
const measure=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return{width:r.width,height:r.height,fontSize:s.fontSize,fontFamily:s.fontFamily,lineHeight:s.lineHeight,padding:s.padding,borderRadius:s.borderRadius}};
(async()=>{const web=await h.server(),server=createPreview();await new Promise(r=>server.listen(0,'127.0.0.1',r));const mini=`http://127.0.0.1:${server.address().port}`;
try{for(const [engine,type]of Object.entries({chromium,webkit})){const browser=await type.launch(engine==='chromium'?require('./browser_options.cjs'):{});try{for(const width of [320,390,768]){
 const context=await h.context(browser,{viewport:{width,height:width===320?568:844}}),w=await context.newPage(),m=await context.newPage(),errors=[];m.on('pageerror',e=>errors.push(e.message));w.on('pageerror',e=>errors.push(e.message));
 await m.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin===mini)return route.continue();if(u.origin==='https://tarot.georgelu.cn'&&/^\/assets\/cards\/[mcwsp]\d{2}\.webp$/.test(u.pathname))return route.fulfill({body:fs.readFileSync(path.join(root,u.pathname)),contentType:'image/webp'});return route.abort()});
 await h.enter(w,web.url);await m.goto(mini);await m.locator('.floating-nav-item').filter({hasText:/^抽牌$/}).click();await m.locator('.spread-item').first().waitFor();
 assert.equal(await m.locator('.uni-tabbar:visible').count(),0,'system bar is hidden on the real build');
 assert.equal(await w.locator('.reading-spread-choice').count(),40);assert.equal(await m.locator('.spread-item').count(),40);
 assert.deepEqual((await m.locator('.catalog-section').allTextContents()).map(t=>t.trim().replace(/\d+$/,'')),['常用牌阵','感情','工作','学业','生活','专业通用']);
 assert.deepEqual(await m.locator('.spread-copy .name').allTextContents(),await w.locator('.spread-choice-copy strong').allTextContents(),'same spread order and names');
 const pairs=[['.reading-spread-choice','.spread-item'],['.reading-spread-choice .spread-thumbnail','.spread-item .spread-thumbnail'],['.spread-choice-copy strong','.spread-copy .name'],['.spread-choice-copy p','.spread-copy .scene-summary'],['.spread-choice-copy small','.spread-copy .count']];
 for(const[a,b]of pairs){const x=await w.locator(a).first().evaluate(measure),y=await m.locator(b).first().evaluate(measure);for(const key of ['fontSize','lineHeight','borderRadius'])assert.equal(y[key],x[key],`${engine} ${width} ${b} ${key}`);if(a.includes('thumbnail')){assert.equal(y.width,x.width);assert.equal(y.height,x.height)}assert.equal(y.fontFamily,x.fontFamily,`${engine} ${width} ${b} typeface`)}
 for(const [page,selector]of [[w,'.reading-spread-choice'],[m,'.spread-item']]){
  const diagrams=await page.locator(selector).evaluateAll(nodes=>nodes.map(node=>{const tile=node.querySelector('.spread-thumbnail'),t=tile.getBoundingClientRect(),copy=node.querySelector('.spread-choice-copy,.spread-copy').getBoundingClientRect();return{left:t.right<=copy.left,cards:[...tile.children].map(c=>{const r=c.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,inside:r.x>=t.x&&r.y>=t.y&&r.right<=t.right+.1&&r.bottom<=t.bottom+.1}})}}));
  for(const d of diagrams){assert(d.left,'diagram stays left of text');for(const c of d.cards){assert(c.inside,'all diagram cards inside tile');assert(Math.abs(c.w/c.h-.6)<.015,'portrait card proportion preserved')}for(let i=0;i<d.cards.length;i++)for(let j=i+1;j<d.cards.length;j++){const a=d.cards[i],b=d.cards[j];assert(a.x+a.w<=b.x+.5||b.x+b.w<=a.x+.5||a.y+a.h<=b.y+.5||b.y+b.h<=a.y+.5,'diagram cards do not overlap')}}
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow')
 }
 for(const id of ['love','professional','all']){await m.locator('.theme-chip').filter({hasText:id==='love'?'感情':id==='professional'?'专业通用':'常用牌阵'}).click();await m.waitForFunction(id=>{const r=document.querySelector('#spread-group-'+id).getBoundingClientRect();return r.top>=0&&r.top<innerHeight},id);assert.equal(await m.locator('.spread-item').count(),40,'anchors retain all spreads')}
 if(width===390){
  const scenes=await w.evaluate(()=>TAROT_READING_SCENARIOS);assert.equal(new Set(scenes.map(s=>s.questionExample)).size,40);
  for(const scene of scenes){await w.locator(`[data-reading="guide"][data-scenario="${scene.id}"]`).click();await m.locator('.spread-item').filter({has:m.locator('.name').filter({hasText:new RegExp('^'+scene.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')})}).click();
   assert.equal(await w.locator('[data-reading-question]').getAttribute('placeholder'),scene.questionExample);assert.equal(await m.locator('.uni-textarea-placeholder').innerText(),scene.questionExample);assert.equal(await w.locator('[data-reading-question]').inputValue(),'','example is not an entered question');assert.equal(await m.locator('textarea').inputValue(),'','native example never writes user input');
   await w.locator('[data-reading="guide-back"]').click();await m.locator('.parent-back').click();await m.locator('.spread-item').first().waitFor();
  }
 }
 const nav=await m.locator('.floating-navigation').evaluate(measure);assert.equal(nav.height,70);assert.equal(nav.borderRadius,'32px');
 if(width===390){await w.screenshot({path:path.join(out,engine+'-web-spreads.png')});await m.screenshot({path:path.join(out,engine+'-mini-spreads.png')})}
 assert.deepEqual(errors,[]);await context.close();console.log(`PASS ${engine} ${width}: actual web/native-build directory order, fonts, left diagrams, all40 portrait layouts, anchors, floating navigation`)
 }}finally{await browser.close()}}}finally{await web.close();server.closeAllConnections();await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);process.exitCode=1});
