/* Isolated local reading UI fixture. Never serves private/server files or real AI. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),KEY='tarot-reading-v3';
async function server(){
 if(process.env.DEMO_URL)return {url:process.env.DEMO_URL,close:async()=>{}};
 const allowed=new Set(fs.readdirSync(root).filter(n=>/\.(?:html|js|css|webmanifest)$/.test(n)));
 const s=http.createServer((req,res)=>{
  let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'')||'index.html';}catch{res.writeHead(400).end();return;}
  if(name==='ai-config.js'){res.setHeader('Content-Type','text/javascript');res.end('window.TAROT_AI_CONFIG={endpoint:"",sessionEndpoint:""}');return;}
  if(name==='locales/en.js'){res.setHeader('Content-Type','text/javascript');const dict=Object.assign({},...fs.readdirSync(path.join(root,'locales')).filter(n=>/^en-.*\.json$/.test(n)).sort().map(n=>JSON.parse(fs.readFileSync(path.join(root,'locales',n),'utf8'))));res.end('window.TAROT_EN='+JSON.stringify(dict));return;}
  if(name.includes('..')||name.split('/').some(n=>n.startsWith('.'))||!(allowed.has(name)||/^(assets|icons)\/[\w./-]+\.(webp|svg|png|jpg|json)$/.test(name))){res.writeHead(404).end();return;}
  const file=path.resolve(root,name);try{if(!file.startsWith(root+path.sep)||!fs.statSync(file).isFile())throw Error();res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
 });await new Promise(r=>s.listen(0,'127.0.0.1',r));return {url:`http://127.0.0.1:${s.address().port}/`,close:async()=>{s.closeAllConnections();await new Promise(r=>s.close(r));}};
}
async function context(browser,options={}){const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,...options});await ctx.addInitScript(()=>sessionStorage.setItem('tarot-pocket-session-v1',JSON.stringify({token:'tp1.'+'f'.repeat(80),expiresAt:Date.now()+3600000})));return ctx;}
const activeState=s=>s.ui.dailyActive?s.daily[0]:s.draft;
const state=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
const click=(p,a)=>p.locator(`[data-reading="${a}"]`).first().click();
async function enter(p,url){await p.goto(url,{timeout:120000});await p.locator('.bottomnav [data-page=reading]').click();}
async function intro(p,id='three'){
 const visible=p.locator(`[data-reading="guide"][data-value="${id}"]`).first();
 if(!await visible.count()){
  const category=await p.evaluate(id=>(window.TAROT_READING_SCENARIOS||[]).find(s=>s.spreadId===id)?.category,id);
  if(category)await p.locator(`[data-reading="category"][data-value="${category}"]`).click();
 }
 await visible.click();
}
async function start(p,id='three'){await intro(p,id);await click(p,'start');}
async function advanceForTest(p){await p.evaluate(()=>{const control=document.createElement('button');control.dataset.reading='skip-animation';document.body.append(control);control.click();control.remove();});}
async function toPick(p,offset=0){const reduce=await p.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);if(!reduce&&activeState(await state(p)).phase==='shuffling')await advanceForTest(p);await p.locator(`[data-reading="cut"][data-index="${offset}"]`).click();if(!reduce&&activeState(await state(p)).phase==='cutting')await advanceForTest(p);await p.locator('[data-fan-viewport]').waitFor();await p.waitForTimeout(150);}
async function center(p,index){const c=p.locator(`[data-reading="pick"][data-index="${index}"]`);await c.evaluate(el=>new Promise((resolve,reject)=>{let frames=0;function ready(){if(!el.isConnected)return reject(Error('Fan card detached before mounting'));if(el.style.transform.startsWith('translateY('))return resolve();if(++frames>=180)return reject(Error('Fan did not paint before centering'));requestAnimationFrame(ready);}ready();}));await c.evaluate(el=>{el.scrollIntoView({block:'nearest',inline:'center',behavior:'instant'});const viewport=el.closest('[data-fan-viewport]');viewport.scrollLeft=el.offsetLeft+el.offsetWidth/2-viewport.clientWidth/2;});await c.evaluate(el=>new Promise((resolve,reject)=>{let previous='',stable=0,frames=0;function sample(){if(!el.isConnected)return reject(Error('Fan card detached while centering'));const r=el.getBoundingClientRect(),viewport=el.closest('[data-fan-viewport]'),v=viewport.getBoundingClientRect(),key=[r.x,r.y,r.width,r.height,viewport.scrollLeft].map(n=>n.toFixed(2)).join(',');stable=key===previous?stable+1:0;previous=key;if(stable>=4&&r.right>v.left&&r.left<v.right&&r.bottom>0&&r.top<innerHeight)return resolve();if(++frames>=180)return reject(Error('Fan geometry did not settle: '+key+' scrollWidth='+viewport.scrollWidth+' clientWidth='+viewport.clientWidth+' offsetLeft='+el.offsetLeft+' overflowX='+getComputedStyle(viewport).overflowX));requestAnimationFrame(sample);}requestAnimationFrame(sample);}));return c;}
async function pick(p,index){try{const before=activeState(await state(p)).picked.slice(),c=await center(p,index);await c.click();assert.deepEqual(activeState(await state(p)).picked,before,'a tap only previews the chosen card');const dialog=p.locator('[data-reading-pick-dialog]');assert(await dialog.evaluate(el=>el.open),'selection opens a confirmation dialog');assert.equal(await dialog.locator('img').count(),0,'preview never leaks the card face');await click(p,'pick-confirm');assert.deepEqual(activeState(await state(p)).picked,[...before,index],'confirmation commits exactly the intended numbered card once');}catch(error){let diagnostic={index,closed:p.isClosed()};if(!p.isClosed())try{diagnostic=await p.evaluate(({index,key})=>{const saved=JSON.parse(localStorage.getItem(key)||'null'),draft=saved&&(saved.ui.dailyActive?saved.daily[0]:saved.draft);return {index,url:location.href,phase:draft?.phase,picked:draft?.picked,renderedCards:document.querySelectorAll('[data-reading=pick]').length,scroll:document.querySelector('[data-fan-viewport]')?.scrollLeft};},{index,key:KEY});}catch{}error.message+='\nPick diagnostic: '+JSON.stringify(diagnostic);throw error;}}
async function reveal(p){await p.locator('[data-reading="reveal"]').waitFor();await click(p,'reveal');await p.waitForFunction(k=>{const saved=JSON.parse(localStorage.getItem(k));return(saved.ui.dailyActive?saved.daily[0]:saved.draft)?.phase==='read'},KEY);}
// These tests intend to reach the directory, not silently substitute one Back
// control for another. In-progress ordinary readings have two explicit levels.
async function returnToGallery(p){
 const before=await state(p),draw=activeState(before);assert.equal(before.ui.view,'table','directory return starts at the current table');assert(draw,'current table has a recoverable draw');
 const identity=s=>({id:s.id,spreadId:s.spreadId,pool:s.pool,picked:s.picked,revealed:s.revealed,questionText:s.questionText,userQuestion:s.userQuestion,optionA:s.optionA,optionB:s.optionB,optionC:s.optionC});
 if(draw.dailyDate){await click(p,draw.phase==='read'?'finish':'parent');}
 else if(draw.phase==='read'){assert.equal(await p.locator('.reading-result-return [data-reading="pause"]').count(),1,'completed ordinary result retains its explicit directory button');await click(p,'pause');}
 else{
  await click(p,'parent');await p.locator('.compact-spread-guide').waitFor();
  const parent=await state(p);assert.equal(parent.ui.view,'detail','first Back returns to the selected spread settings');assert.equal(parent.ui.guideId,draw.spreadId);assert.deepEqual(identity(parent.draft),identity(draw),'first Back cannot redraw or rewind the current cards');
  if(draw.userQuestion!==undefined)assert.equal(await p.locator('[data-reading-question]').inputValue(),draw.userQuestion,'first Back keeps the optional entered question');
  for(const key of ['optionA','optionB','optionC'])if(draw[key]!==undefined)assert.equal(await p.locator(`[data-reading-option="${key}"]`).inputValue(),draw[key],'first Back keeps choice labels');
  await click(p,'guide-back');
 }
 await p.locator('.reading-directory').waitFor();const after=await state(p);assert.equal(after.ui.view,'gallery','the second level is the reading directory');assert.deepEqual(identity(draw.dailyDate?after.daily[0]:after.draft),identity(draw),'directory return preserves the current draw');
}
async function closeCardReference(p){
 const dialog=p.locator('[data-reading-dialog]');assert(await dialog.evaluate(el=>el.open),'single-card reference is open');
 if(await p.locator('.reading-detail-portrait.zoomed').count()){
  await click(p,'close-reference');await p.waitForFunction(()=>document.querySelector('[data-reading-dialog]')?.open&&!document.querySelector('.reading-detail-portrait.zoomed'));
  assert(await dialog.evaluate(el=>el.open),'first Back from a zoom returns to the single-card reference');
 }
 await click(p,'close-reference');await p.waitForFunction(()=>!document.querySelector('[data-reading-dialog]')?.open);
}
async function fit(p){assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'page must fit the viewport');}
async function english(p){const missing=await p.locator('body').evaluate(el=>{const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),out=[];let n;while(n=walker.nextNode())if(/[\u3400-\u9fff]/.test(n.nodeValue)&&n.parentElement.checkVisibility()&&!n.parentElement.closest('[data-i18n-ignore],script,style'))out.push(n.nodeValue.trim());return out;});assert.deepEqual(missing,[],'visible English copy must be translated');}
module.exports={server,context,state,activeState,click,enter,intro,start,toPick,center,pick,reveal,returnToGallery,closeCardReference,fit,english,KEY};
