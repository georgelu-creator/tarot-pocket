'use strict';
const assert=require('node:assert/strict'),{chromium}=require('playwright'),h=require('./reading_ui_harness.cjs');
(async()=>{const server=await h.server(),browser=await chromium.launch(require('./browser_options.cjs'));
try{const page=await browser.newPage({viewport:{width:320,height:720},reducedMotion:'reduce'});await page.goto(server.url);const definitions=await page.evaluate(()=>TAROT_SPREAD_CONTENT.spreads.filter(s=>s.layoutGrid));assert(definitions.length>=5,'research-backed added layouts loaded');
for(const d of definitions){
 const raw=await page.evaluate(d=>({version:1,settings:{spreadId:d.id,topic:'general'},draft:{id:'synthetic-layout',at:Date.now(),spreadId:d.id,topic:'general',questionId:'own',questionText:'',userQuestion:'',contextEnabled:false,reversals:true,pool:TAROT_READING_DECK.cards.map(c=>({id:c.id,reversed:false})),picked:d.positions.map((_,i)=>i),revealed:d.positions.map((_,i)=>i),phase:'read'},history:[],practice:[],daily:[],ui:{view:'table',category:'all'}}),d);
 for (const phase of ['pick','reveal','read']) {
 raw.draft.phase=phase;raw.draft.revealed=phase==='read'?d.positions.map((_,i)=>i):[];
 raw.draft.picked=phase==='pick'?[]:d.positions.map((_,i)=>i);
 await page.addInitScript(raw=>localStorage.setItem('tarot-reading-v3',JSON.stringify(raw)),raw);await page.reload();await page.locator('.bottomnav [data-page=reading]').click();
 const board=phase==='pick'?'.selection-board':phase==='reveal'?'.reveal-group-cards':'.reading-result-cards';

 const cells=await page.locator(board+'>.reading-slot').evaluateAll(nodes=>nodes.map(n=>{const css=getComputedStyle(n),r=n.getBoundingClientRect();return {col:+css.gridColumnStart,row:+css.gridRowStart,x:r.x,y:r.y,w:r.width,h:r.height}}));
 assert.equal(cells.length,d.positions.length);
 cells.forEach((cell,i)=>{assert.equal(cell.col,Math.round(d.layoutPositions[i].x*(d.layoutGrid.columns-1))+1,d.id+' col');assert.equal(cell.row,Math.round(d.layoutPositions[i].y*(d.layoutGrid.rows-1))+1,d.id+' row');assert(cell.x>=0&&cell.x+cell.w<=321,d.id+' fit');});
 assert.equal(new Set(cells.map(c=>c.col+':'+c.row)).size,cells.length,d.id+' no overlapping cells');await h.fit(page);
 }
 await page.locator('[data-reading=pause]').first().click();await page.locator('.bottomnav [data-page=library]').click();await page.locator('[data-action=library-view][data-value=spreads]').click();await page.locator(`[data-action=reference-spread][data-id="${d.id}"]`).click();assert.equal(await page.locator('.reference-position-list li').count(),d.positions.length);await page.locator('#overlay [data-action=close]').click();
}
console.log('PASS: '+definitions.length+' selection/reveal/reference/result coordinate layouts at320, all positions and separate encyclopedia');
}finally{await browser.close();await server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
