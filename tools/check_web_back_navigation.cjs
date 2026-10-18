/* Isolated navigation checks: locations may rewind, learning and decks may not. */
'use strict';
const assert=require('node:assert/strict'),{chromium,webkit}=require('playwright'),h=require('./reading_ui_harness.cjs');
const options=require('./browser_options.cjs');
const wait=(p,selector)=>p.locator(selector).first().waitFor({state:'visible'});
async function back(p,selector){await p.goBack();await wait(p,selector);}
async function nav(p,page){await p.locator(`.bottomnav [data-page="${page}"]`).click();}
async function snapshot(p){return p.evaluate(()=>JSON.parse(localStorage.getItem('tarot-pocket-demo-v1')).journey.academy);}
const game=s=>({id:s.id,at:s.at,source:s.source,spreadId:s.spreadId,topic:s.topic,pool:s.pool,picked:s.picked,revealed:s.revealed,phase:s.phase,questionText:s.questionText,userQuestion:s.userQuestion,ai:s.ai});
(async()=>{const server=await h.server();try{for(const engine of [chromium,webkit]){
 const browser=await engine.launch(options);try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',serviceWorkers:'block',extraHTTPHeaders:{DNT:'1'}}),p=await ctx.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));await p.goto(server.url);
 await p.locator('[data-action="choose-cards"]').click();const deepCard=p.locator('.library-card[data-id="c10"]');await deepCard.scrollIntoViewIfNeeded();const libraryY=await p.evaluate(()=>scrollY);assert(libraryY>100,'the return case is below the top of the library');await deepCard.click();await p.keyboard.press('Escape');await p.locator('#overlay .sheet').waitFor({state:'detached'});
 await p.waitForFunction(y=>Math.abs(scrollY-y)<2,libraryY);await nav(p,'courses');await wait(p,'.academy-home');assert.equal(await p.locator('#overlay').textContent(),'','return exposes usable bottom navigation');
 await p.goBack();await wait(p,'.library-grid');await p.waitForFunction(y=>Math.abs(scrollY-y)<2,libraryY);assert.equal(await p.evaluate(()=>document.body.classList.contains('nav-away')),false,'restoring library scroll is not treated as a new downward swipe');
 await p.goto(server.url);await wait(p,'.home-simple');
 await nav(p,'library');await p.locator('.library-card[data-id="p08"]').click();await wait(p,'.card-dossier');
 const firstTitle=await p.locator('#overlay h2').first().textContent();
 await p.locator('[data-dossier-section="use"] summary').click();await p.locator('#overlay [data-action="card"]').first().scrollIntoViewIfNeeded();const sheetY=await p.locator('#overlay .sheet').evaluate(e=>e.scrollTop);await p.locator('#overlay [data-action="card"]').first().click();
 assert.notEqual(await p.locator('#overlay h2').first().textContent(),firstTitle);
 await p.locator('#overlay [data-action="close"]').first().click();await p.waitForFunction(t=>document.querySelector('#overlay h2')?.textContent===t,firstTitle);
 assert(Math.abs(await p.locator('#overlay .sheet').evaluate(e=>e.scrollTop)-sheetY)<2,'parent sheet retains its reading position');
 await p.locator('#overlay [data-action="zoom"]').click();await wait(p,'.zoom-backdrop');
 await back(p,'.card-dossier');assert.equal(await p.locator('#overlay h2').first().textContent(),firstTitle);
 await p.locator('#overlay [data-action="sources"]').click();await wait(p,'.source-list');
 await p.keyboard.press('Escape');await wait(p,'.card-dossier');
 await back(p,'.library-grid');assert.equal(await p.locator('#overlay').textContent(),'');
 await back(p,'.home-simple');

 await nav(p,'courses');await p.locator('[data-academy="catalog"]').click();await wait(p,'.academy-catalog');
 await p.locator('.academy-catalog [data-academy="guided-card"]').first().click();await wait(p,'.academy-shell');
 await p.locator('[data-academy="next"]').first().click();await wait(p,'.academy-option');
 await p.locator('.academy-option').first().click();await wait(p,'.academy-feedback');const answered=await snapshot(p);
 await p.locator('[data-academy="home"]').first().click();await wait(p,'.academy-catalog');
 assert.deepEqual(await snapshot(p),answered,'returning to directory preserves committed answers');
 await p.locator('[data-academy="catalog-back"]').click();await wait(p,'.academy-home:not(.academy-catalog)');
 await back(p,'.home-simple');

 await nav(p,'reading');await h.intro(p,'one');await p.locator('[data-reading-question]').fill('隔离测试：如何安排本周的学习？');
 await h.click(p,'start');await h.toPick(p);const initial=(await h.state(p)).draft;
 const card=await h.center(p,0);await card.click();await wait(p,'[data-reading-pick-dialog][open]');
 await back(p,'[data-fan-viewport]');assert.equal(await p.locator('[data-reading-pick-dialog]').evaluate(e=>e.open),false);assert.deepEqual((await h.state(p)).draft.picked,[]);
 await h.pick(p,1);await h.reveal(p);const finished=(await h.state(p)).draft;
 await h.click(p,'parent');await wait(p,'[data-reading-question]');assert.equal(await p.locator('[data-reading-question]').inputValue(),'隔离测试：如何安排本周的学习？');
 assert.deepEqual((await h.state(p)).draft,finished,'returning to settings does not redraw or rewind the deck');
 await p.goForward();await wait(p,'.reading-offline');assert.equal((await h.state(p)).draft.id,initial.id);
 await h.click(p,'result-guide');await wait(p,'.compact-spread-guide');await h.click(p,'guide-back');await wait(p,'.reading-offline');
 await h.click(p,'edit-question');await wait(p,'[data-reading-edit]');await back(p,'.reading-offline');
 await p.locator('.reading-result-card').first().click();await wait(p,'[data-reading-dialog][open]');
 await h.click(p,'detail-zoom');await wait(p,'.reading-detail-portrait.zoomed');await back(p,'[data-reading-dialog][open]');assert.equal(await p.locator('.reading-detail-portrait.zoomed').count(),0,'detail zoom returns to the single-card sheet first');
 await h.click(p,'detail-zoom');await p.keyboard.press('Escape');await wait(p,'[data-reading-dialog][open]');assert.equal(await p.locator('.reading-detail-portrait.zoomed').count(),0,'Escape follows the same one-layer rule');
 await back(p,'.reading-offline');assert.equal(await p.locator('[data-reading-dialog]').evaluate(e=>e.open),false);
 assert.deepEqual((await h.state(p)).draft,finished,'nested references and editing leave the deck intact');
 await h.click(p,'pause');await wait(p,'[data-reading="manual"]');await h.click(p,'manual');
 await p.locator('[data-manual-spread]').selectOption('one');await p.locator('[data-manual="pick"]').click();await wait(p,'.manual-picker[open]');
 await back(p,'.manual-reading');assert.equal(await p.locator('.manual-picker').evaluate(e=>e.open),false);
 await p.locator('[data-manual="pick"]').click();await p.locator('[data-manual="choose"][data-id="m00"]').click();await p.locator('[data-manual="submit"]').click();await wait(p,'.reading-offline');
 await p.locator('.reading-result-card').first().click();await h.click(p,'full-reference');await wait(p,'.card-dossier');
 await p.locator('#overlay [data-action="close"]').first().click();await wait(p,'[data-reading-dialog][open]');
 await h.click(p,'close-reference');await wait(p,'.reading-offline');
 const manual=(await h.state(p)).draft;await p.reload();await wait(p,'.home-simple');await nav(p,'reading');await wait(p,'.reading-offline');
 await h.click(p,'parent');await wait(p,'.manual-reading');assert.equal(await p.locator('.manual-face img').getAttribute('src'),'assets/cards/m00.webp');
 assert.deepEqual(game((await h.state(p)).draft),game(manual),'refresh and parent recovery keep all card identities, orientation, answer and phase');
 await p.locator('[data-manual="back"]').click();await wait(p,'[data-reading="manual"]');
 await h.click(p,'daily');await h.toPick(p);await h.pick(p,0);await h.reveal(p);const daily=(await h.state(p)).daily;
 await h.click(p,'parent');await wait(p,'[data-reading="daily"]');assert.deepEqual((await h.state(p)).daily,daily,'daily remains recoverable');
 const historyState=await p.evaluate(()=>JSON.stringify(history.state));assert(!historyState.includes('隔离测试'),'history stores routes without entered questions');assert.deepEqual(errors,[]);
 await ctx.close();console.log(`PASS ${engine.name()}: browser/UI parent navigation, nested references/dialogs, directory origin, committed answers, deck/day and refresh recovery`);
 }finally{await browser.close();}
}}finally{await server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
