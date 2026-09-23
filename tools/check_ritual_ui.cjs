/* Chinese-only ritual screens, local daily return and non-disruptive references. */
'use strict';
const assert=require('node:assert/strict'),{chromium}=require('playwright'),h=require('./reading_ui_harness.cjs');
(async()=>{const server=await h.server(),browser=await chromium.launch(require('./browser_options.cjs'));try{
 const ctx=await h.context(browser,{reducedMotion:'reduce'}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await h.enter(p,server.url+'?lang=en');
 assert.equal(await p.locator('html').getAttribute('lang'),'zh-CN');assert.equal(await p.locator('[data-language-toggle]').count(),0);
 await h.click(p,'daily');await h.toPick(p);await h.pick(p,5);await h.reveal(p);const day=(await h.state(p)).draft;
 assert.equal(await p.locator('.daily-almanac').count(),1);assert.equal(await p.locator('[data-reading=ai-request]').count(),0);assert(/[\u3400-\u9fff]/.test(await p.locator('.daily-almanac').innerText()));
 await p.locator('.daily-reference>summary').click();await p.locator('[data-reading=card][data-index="0"]').click();assert(await p.locator('[data-reading-dialog]').evaluate(e=>e.open));await h.click(p,'close-reference');
 await p.evaluate(()=>TAROT_I18N.setLocale('en'));assert.equal(await p.locator('html').getAttribute('lang'),'zh-CN');assert.equal(await p.locator('[data-language-toggle]').count(),0);assert.equal((await h.state(p)).draft.id,day.id);assert.deepEqual((await h.state(p)).draft.pool,day.pool);assert.deepEqual((await h.state(p)).draft.picked,[5]);
 for(const width of [320,390,430,1280]){await p.setViewportSize({width,height:844});await h.fit(p);}
 await h.click(p,'finish');await h.click(p,'daily');assert.equal((await h.state(p)).draft.id,day.id);assert.deepEqual((await h.state(p)).draft.pool,day.pool);assert.deepEqual((await h.state(p)).draft.picked,[5]);await h.click(p,'finish');
 await h.start(p,'three');await h.toPick(p);for(const i of [0,3,8])await h.pick(p,i);await h.reveal(p);await p.locator('.reading-header').evaluate(e=>window.__header=e);await p.locator('[data-reading=card][data-index="0"]').first().click();assert(await p.locator('.reading-header').evaluate(e=>e===window.__header));await h.click(p,'close-reference');assert.equal(await p.locator('.bottomnav').count(),0);assert(await p.locator('.reading-result-return [data-reading=pause]').isVisible());await h.click(p,'pause');assert(await p.locator('.bottomnav [data-page=reading]').isVisible());
 assert.deepEqual(errors,[]);await ctx.close();console.log('PASS: Chinese-only daily result and detail, ?lang=en fallback/no toggle, compatibility locale call preserves state, same-day no redraw, 320–1280 fit, native single-card overlay retains page, focused exit restores navigation.');
}finally{await browser.close();await server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
