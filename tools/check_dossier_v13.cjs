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
  assert.equal(await p.locator('.dossier-pair img').count(),0,'No forced unfamiliar-card comparison');
  assert((await p.locator('[data-dossier-section=use]').innerText()).length>35,'Authored card-specific application example');
  assert(await p.locator('.dossier-cover img').evaluate(im=>im.complete&&im.naturalWidth>100));
  await p.locator('#overlay [data-action=close]').first().click();
 }
 await p.locator('.library-card[data-id="m16"]').click();const sheet=await p.locator('.sheet').elementHandle();
 await p.locator('[data-action=dossier-jump][data-value=scene]').click();await p.locator('[data-action=dossier-lens][data-value="1"]').click();assert((await p.locator('[data-dossier-lens-copy]').innerText()).length>20);
 await p.locator('[data-action=face][data-value=reversed]').click();assert(await p.locator('.dossier-cover img').evaluate(e=>e.classList.contains('reversed-img')));
 await p.locator('[data-action=face][data-value=upright]').click();
 const beforeLocale=await p.locator('.sheet').innerText();assert(/[\u3400-\u9fff]/.test(beforeLocale),'Card guide is authored in Chinese');
 assert.equal(await p.locator('[data-action=detail-language],[data-language-toggle]').count(),0,'Chinese-only card guide has no English entry');
 await p.evaluate(()=>TAROT_I18N.setLocale('en'));
 assert.equal(await p.locator('html').getAttribute('lang'),'zh-CN');assert.equal(await p.locator('.sheet').innerText(),beforeLocale,'Compatibility locale call keeps the open guide and its Chinese copy');
 for(const width of [320,390,430,1280]){await p.setViewportSize({width,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page overflow '+width);assert(await sheet.evaluate(e=>e.scrollWidth<=e.clientWidth+1),'Guide overflow '+width);}
 await p.setViewportSize({width:390,height:844});await sheet.evaluate(e=>{e.scrollTop=0;});
 await p.screenshot({path:process.env.DOSSIER_SCREENSHOT||'/tmp/tarot-v13-dossier.png'});assert.deepEqual(errors,[]);
 console.log('PASS: all 78 authored guides, real images, card-specific application, no forced comparison, Chinese-only compatibility and responsive layout.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
