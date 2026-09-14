/* Public fixtures only: guide depth, context switching and uninterrupted reading. */
const assert=require('node:assert/strict'),path=require('node:path');
const {chromium}=require('playwright');
const url=process.env.DEMO_URL||'file://'+path.resolve(__dirname,'../demo/tarot-demo.html');
(async()=>{const browser=await chromium.launch(require('./browser_options.cjs'));try{
 const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(url);
 await p.locator('[data-action=choose-cards]').click();
 const ids=await p.locator('.library-card').evaluateAll(xs=>xs.map(x=>x.dataset.id));assert.equal(ids.length,78);
 for(const id of ids){
  await p.locator(`.library-card[data-id="${id}"]`).click();
  assert((await p.locator('.dossier-editorial').innerText()).length>45,'Each card has substantive editorial context: '+id);
  assert.equal(await p.locator('.dossier-pair img').count(),2,'Visual comparison');
  assert.equal(await p.locator('.dossier-matrix').count(),2,'Context and observation tables');
  assert(await p.locator('.dossier-cover img').evaluate(im=>im.complete&&im.naturalWidth>100));
  await p.locator('#overlay [data-action=close]').first().click();
 }
 await p.locator('.library-card[data-id="m16"]').click();const sheet=await p.locator('.sheet').elementHandle();
 for(const topic of ['love','study','career']){
  const btn=p.locator(`[data-action=detail-topic][data-value="${topic}"]`);await btn.scrollIntoViewIfNeeded();const before=await sheet.evaluate(e=>e.scrollTop);await btn.click();
  assert(await sheet.evaluate(e=>e===document.querySelector('.sheet')),'Topic must not replace sheet');assert(Math.abs(await sheet.evaluate(e=>e.scrollTop)-before)<2,'Topic must preserve scroll');
  assert.equal(await p.locator('.dossier-matrix').first().locator('tbody tr').count(),3);
  await p.locator('[data-action=detail-position][data-value=advice]').click();assert.equal(await p.locator('.dossier-position-board [aria-pressed=true]').count(),1);
 }
 await p.locator('[data-action=dossier-jump][data-value=scene]').click();await p.locator('[data-action=dossier-lens][data-value="1"]').click();assert.match(await p.locator('[data-dossier-lens-copy]').innerText(),/闪电/);
 await p.locator('[data-action=face][data-value=reversed]').click();assert(await p.locator('.dossier-cover img').evaluate(e=>e.classList.contains('reversed-img')));
 await p.locator('[data-action=face][data-value=upright]').click();
 await p.locator('[data-action=detail-language]').click();
 const missing=await p.evaluate(()=>{const w=document.createTreeWalker(document.querySelector('.sheet'),NodeFilter.SHOW_TEXT),a=[];for(let n=w.nextNode();n;n=w.nextNode())if(!n.parentElement.closest('[data-i18n-ignore]')&&/[\u3400-\u9fff]/.test(n.textContent))a.push(n.textContent);return a;});assert.deepEqual(missing,[]);
 for(const width of [320,390,430,1280]){await p.setViewportSize({width,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page overflow '+width);assert(await sheet.evaluate(e=>e.scrollWidth<=e.clientWidth+1),'Guide overflow '+width);}
 await p.setViewportSize({width:390,height:844});await p.locator('[data-action=detail-language]').click();await sheet.evaluate(e=>{e.scrollTop=0;});
 await p.screenshot({path:process.env.DOSSIER_SCREENSHOT||'/tmp/tarot-v13-dossier.png'});assert.deepEqual(errors,[]);
 console.log('PASS: all 78 richer guides, real images, context matrices, scroll-preserving interaction, bilingual content and responsive layout.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
