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
  assert((await p.locator('.reference-core').innerText()).length>45,'Each card has substantive editorial context: '+id);
  assert.equal(await p.locator('.dossier-pair img').count(),0,'No forced unfamiliar-card comparison');
  await p.locator('[data-reference-section=contexts]>summary').click();
  assert.equal(await p.locator('.reference-context').count(),4,'Four authored application domains: '+id);
  assert((await p.locator('[data-reference-section=contexts]').innerText()).length>120,'Substantive card-specific applications: '+id);
  await p.locator('[data-reference-section=roles]>summary').click();
  assert.equal(await p.locator('[data-reference-section=roles] dt').count(),9,'Complete named position references: '+id);
  assert.equal(await p.locator('.dossier-lenses,.dossier-reversal-guide').count(),0,'No duplicated lesson controls or generic reversal reminders');
  assert(await p.locator('.dossier-cover img').evaluate(im=>im.complete&&im.naturalWidth>100));
  await p.locator('#overlay [data-action=close]').first().click();
 }
 await p.locator('.library-card[data-id="m16"]').click();const sheet=await p.locator('.sheet').elementHandle();
 await p.locator('[data-dossier-section=scene]>summary').click();assert((await p.locator('[data-dossier-section=scene]').innerText()).length>40);
 await p.locator('[data-reference-section=contexts]>summary').click();const uprightText=await p.locator('[data-reference-body]').innerText();
 await p.locator('[data-action=face][data-value=reversed]').click();assert(await p.locator('.dossier-cover img').evaluate(e=>e.classList.contains('reversed-img')));
 assert.notEqual(await p.locator('[data-reference-body]').innerText(),uprightText,'Reversal changes substantive meaning and application');
 assert(await p.locator('[data-reference-section=contexts]').evaluate(e=>e.open),'Changing direction preserves expanded reference chapters');
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
