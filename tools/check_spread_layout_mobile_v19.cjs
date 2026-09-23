/* Mobile spread geometry: compact boards must preserve each spread's map. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const h=require('./reading_ui_harness.cjs');

const close=(a,b,tolerance=1)=>Math.abs(a-b)<=tolerance;
const center=rect=>({x:rect.x+rect.width/2,y:rect.y+rect.height/2});

async function boardGeometry(page,spreadId){
  const board=page.locator(`.selection-board.layout-${spreadId==='decision-five'?'decision':'celtic'}`);
  await board.waitFor();
  return board.evaluate(node=>{
    const boardRect=node.getBoundingClientRect();
    const slots=[...node.querySelectorAll('.reading-slot')].map(slot=>{
      const rect=slot.getBoundingClientRect();
      const card=slot.querySelector('.reading-card').getBoundingClientRect();
      return {
        x:rect.x,y:rect.y,width:rect.width,height:rect.height,
        card:{x:card.x,y:card.y,width:card.width,height:card.height}
      };
    });
    return {
      board:{x:boardRect.x,y:boardRect.y,width:boardRect.width,height:boardRect.height},
      slots,
      page:{width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth}
    };
  });
}

function assertContained(geometry,label){
  const board=geometry.board;
  assert(geometry.slots.length,`${label} has no spread positions`);
  for(const [index,slot] of geometry.slots.entries()){
    const card=slot.card;
    assert(card.x>=board.x-1,`${label} position ${index+1} escapes the board on the left`);
    assert(card.x+card.width<=board.x+board.width+1,`${label} position ${index+1} escapes the board on the right`);
    assert(card.y>=board.y-1,`${label} position ${index+1} escapes the board on the top`);
    assert(card.y+card.height<=board.y+board.height+1,`${label} position ${index+1} escapes the board on the bottom`);
  }
  assert(geometry.page.scrollWidth<=geometry.page.width+1,`${label} horizontally overflows at 320 px`);
}

function assertDecisionShape(geometry){
  const points=geometry.slots.map(slot=>center(slot.card));
  assert(close(points[3].y,points[4].y),`decision outcomes must share the top row: ${JSON.stringify(points)}`);
  assert(close(points[1].y,points[2].y),`decision developments must share the middle row: ${JSON.stringify(points)}`);
  assert(points[3].y<points[1].y-2&&points[1].y<points[0].y-2,`decision spread must retain three distinct rows: ${JSON.stringify(points)}`);
  assert(points[3].x<points[4].x&&points[1].x<points[2].x,`decision A and B paths must remain separated: ${JSON.stringify(points)}`);
}

function assertCelticShape(geometry){
  const points=geometry.slots.map(slot=>center(slot.card));
  const sameRow=indexes=>indexes.every(index=>close(points[index].y,points[indexes[0]].y));
  assert(sameRow([2,9]),`Celtic positions 3 and 10 must share the top row: ${JSON.stringify(points)}`);
  assert(sameRow([0,1,4,5,8]),`Celtic core and position 9 must share the second row: ${JSON.stringify(points)}`);
  assert(sameRow([3,7]),`Celtic positions 4 and 8 must share the third row: ${JSON.stringify(points)}`);
  assert(points[2].y<points[0].y-2&&points[0].y<points[3].y-2&&points[3].y<points[6].y-2,`Celtic spread must retain four distinct rows: ${JSON.stringify(points)}`);
  assert(points[4].x<points[0].x&&points[0].x<points[1].x&&points[1].x<points[5].x&&points[5].x<points[8].x,`Celtic cross and staff must retain five columns: ${JSON.stringify(points)}`);
  assert(close(points[6].x,points[7].x)&&close(points[7].x,points[8].x)&&close(points[8].x,points[9].x),`Celtic staff must remain vertically aligned: ${JSON.stringify(points)}`);
}

async function assertFanInFirstScreen(page,label){
  const fan=await page.evaluate(()=>{
    const viewport=document.querySelector('[data-fan-viewport]');
    const rect=viewport.getBoundingClientRect();
    const cards=[...viewport.querySelectorAll('[data-reading="pick"]')];
    const first=cards[0].getBoundingClientRect();
    const hit=document.elementFromPoint(first.x+first.width/2,first.y+first.height/2);
    return {
      rect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height,bottom:rect.bottom},
      cardCount:cards.length,
      enabled:cards.filter(card=>!card.disabled).length,
      first:{x:first.x,y:first.y,width:first.width,height:first.height},
      firstIsHit:cards[0].contains(hit),
      viewportHeight:innerHeight
    };
  });
  assert.equal(fan.cardCount,78,`${label} must expose all 78 cards`);
  assert.equal(fan.enabled,78,`${label} must begin with all 78 cards selectable`);
  assert(fan.rect.y>=0&&fan.rect.bottom<=fan.viewportHeight+1,`${label} fan must fit in the initial 320 x 568 viewport: ${JSON.stringify(fan)}`);
  assert(fan.rect.height>=160,`${label} fan must retain a usable vertical touch area: ${JSON.stringify(fan)}`);
  assert(fan.first.width>=44&&fan.first.height>=44&&fan.firstIsHit,`${label} first card must be a visible 44 px touch target: ${JSON.stringify(fan)}`);
}

async function assertResultLabels(page,spreadId){
  const record=await page.evaluate(id=>{
    const spread=window.TAROT_SPREAD_CONTENT.spreads.find(item=>item.id===id);
    const pool=window.TAROT_READING_DECK.cards.map(card=>({id:card.id,reversed:false}));
    const picked=spread.positions.map((_,index)=>index);
    const draft={id:`layout-${id}`,at:Date.now(),spreadId:id,topic:spread.topic||'general',questionId:'own',questionText:'',reversals:false,pool,picked,revealed:[...picked],phase:'read'};
    return {version:1,settings:{topic:draft.topic,spreadId:id},draft,history:[draft],practice:[]};
  },spreadId);
  await page.context().addInitScript(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:h.KEY,value:record});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#app').waitFor();
  await page.locator('.bottomnav [data-page=reading]').click();
  await page.locator('.reading-result-card').first().waitFor();
  const labels=await page.locator('.reading-result-card .reading-label').evaluateAll(nodes=>nodes.map(node=>({text:node.textContent.trim(),fontSize:Number.parseFloat(getComputedStyle(node).fontSize)})));
  assert.equal(labels.length,record.draft.picked.length,`${spreadId} result must show every spread position`);
  for(const label of labels){
    assert(!/^(\d+)\s*·\s*\1\s*·/.test(label.text),`${spreadId} repeats its position number: ${label.text}`);
    assert(label.fontSize>=10,`${spreadId} result position is too small to read on mobile: ${JSON.stringify(label)}`);
  }
}

(async()=>{
  const server=await h.server();
  const browser=await chromium.launch(require('./browser_options.cjs'));
  try{
    for(const spreadId of ['decision-five','celtic']){
      const context=await h.context(browser,{viewport:{width:320,height:568},isMobile:true,reducedMotion:'reduce'});
      const page=await context.newPage();
      await h.enter(page,server.url);
      await h.start(page,spreadId);
      await h.toPick(page);
      const geometry=await boardGeometry(page,spreadId);
      assertContained(geometry,spreadId);
      if(spreadId==='decision-five')assertDecisionShape(geometry);else assertCelticShape(geometry);
      await assertFanInFirstScreen(page,spreadId);
      await assertResultLabels(page,spreadId);
      await context.close();
    }
    console.log('PASS mobile spread maps: decision and Celtic geometry, containment, first-screen fan, and non-duplicated result labels.');
  }finally{
    await browser.close();
    await server.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
