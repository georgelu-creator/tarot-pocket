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
async function toPick(p,offset=0){const reduce=await p.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);if(!reduce&&(await state(p)).draft.phase==='shuffling')await advanceForTest(p);await p.locator(`[data-reading="cut"][data-index="${offset}"]`).click();if(!reduce&&(await state(p)).draft.phase==='cutting')await advanceForTest(p);await p.locator('[data-fan-viewport]').waitFor();await p.waitForTimeout(150);}
async function center(p,index){const c=p.locator(`[data-reading="pick"][data-index="${index}"]`);await c.evaluate(el=>el.scrollIntoView({block:'nearest',inline:'center',behavior:'instant'}));await p.waitForTimeout(350);return c;}
async function pick(p,index){const c=await center(p,index);await c.click();assert.equal((await state(p)).draft.picked.at(-1),index,'one tap picks the intended numbered card');}
async function reveal(p){await p.locator('[data-reading="reveal"]').waitFor();await click(p,'reveal');await p.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).draft.phase==='read',KEY);}
async function fit(p){assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'page must fit the viewport');}
async function english(p){const missing=await p.locator('body').evaluate(el=>{const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),out=[];let n;while(n=walker.nextNode())if(/[\u3400-\u9fff]/.test(n.nodeValue)&&n.parentElement.checkVisibility()&&!n.parentElement.closest('[data-i18n-ignore],script,style'))out.push(n.nodeValue.trim());return out;});assert.deepEqual(missing,[],'visible English copy must be translated');}
module.exports={server,context,state,click,enter,intro,start,toPick,center,pick,reveal,fit,english,KEY};
