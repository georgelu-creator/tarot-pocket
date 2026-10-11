/* Exercise authored details and lesson excerpts through the actual browser UI. */
const assert=require('node:assert/strict'),{chromium,webkit}=require('playwright'),h=require('./reading_ui_harness.cjs');
(async()=>{const server=await h.server();try{
 for(const [name,type]of Object.entries({chromium,webkit})){
  const browser=await type.launch(name==='chromium'?require('./browser_options.cjs'):{headless:true});try{
   const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
   page.on('pageerror',error=>errors.push(error.message));await page.goto(server.url);
   await page.locator('.bottomnav [data-page=library]').click();
   const ids=await page.locator('.library-card').evaluateAll(xs=>xs.map(x=>x.dataset.id));assert.equal(ids.length,78);
   for(const id of ids){
    await page.locator(`.library-card[data-id="${id}"]`).click();
    assert.equal(await page.locator('[data-knowledge-section]').count(),3);
    for(const key of ['contexts','money'])await page.locator(`[data-reference-section=${key}]>summary`).click();
    for(const key of ['structure','examples','history'])await page.locator(`[data-knowledge-section=${key}]>summary`).click();
    assert.equal(await page.locator('.reference-example').count(),2);
    const sources=await page.locator('.reference-source a').evaluateAll(xs=>xs.map(x=>({url:x.href,target:x.target,rel:x.rel})));
    assert(sources.length);assert(sources.every(s=>s.url.startsWith('https:')&&s.target==='_blank'&&s.rel.includes('noopener')));
    const upright=await page.locator('[data-reference-body]').innerText();
    await page.locator('[data-action=face][data-value=reversed]').click();
    assert.notEqual(await page.locator('[data-reference-body]').innerText(),upright);
    assert.equal(await page.locator('.reference-branch').count(),3);
    assert(await page.locator('[data-reference-section=money]').evaluate(x=>x.open));
    assert(await page.locator('[data-knowledge-section=examples]').evaluate(x=>x.open));
    assert.doesNotMatch(await page.locator('.card-dossier').innerText(),/Yes\s*\/?\s*No|开始学习这张牌|学习进度/);
    if(['m00','m16','w14','c07','s09','p06'].includes(id))for(const width of [320,390,1280]){await page.setViewportSize({width,height:844});assert(await page.locator('.sheet').evaluate(e=>e.scrollWidth<=e.clientWidth+1),id+' chapter overflow '+width);await h.fit(page);}
    await page.setViewportSize({width:390,height:844});await page.locator('#overlay [data-action=close]').first().click();
   }
   const evidence=await page.evaluate(()=>{
    const api=TarotAcademy,k=TAROT_CARD_KNOWLEDGE,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    let stored=api.blank();const ui=api.create({esc,img:id=>`<img data-id="${id}">`,icon:()=>'',go(){},toast(){},get:()=>stored,set:x=>stored=x});
    let count=0;for(const card of TAROT_ACADEMY_CONTENT.cards)for(const [mode,index,key]of [['foundation',0,'foundation'],['application',0,'application'],['application',2,'reversal'],['integration',0,'integration']]){
     stored=api.blank();stored.session={unitId:card.id,mode,index,startedAt:1000,seed:37,contentVersion:api.version,answers:{},support:null,hint:false,complete:false,lang:'zh'};
     const before=JSON.stringify(stored),html=ui.render();if(!html.includes(esc(k.byId[card.id].learning[key].text)))throw Error(card.id+' missing '+key);
     if(JSON.stringify(stored)!==before)throw Error('Rendering changed progress');count++;
    }return count;
   });assert.equal(evidence,312);assert.deepEqual(errors,[]);
   await context.close();console.log(`PASS ${name}: all 78 reference articles, direction/chapter preservation, source links, six card types at 320/390/1280; 312 teaching excerpts without progress writes.`);
  }finally{await browser.close();}
 }
}finally{await server.close();}})().catch(error=>{console.error(error);process.exitCode=1});
