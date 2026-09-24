/* Chinese-only 320 px acceptance: directory, fan, reading detail and card dossier. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const h=require('./reading_ui_harness.cjs');
const repo=path.resolve(__dirname,'..');

const screenshotDirectory='/tmp/tarot-mobile-zh-v19-directory-320.png';
const screenshotPick='/tmp/tarot-mobile-zh-v19-pick-320x568.png';
const screenshotResult='/tmp/tarot-mobile-zh-v19-result-320.png';

async function noHorizontalOverflow(page,label){
  const fit=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
  assert(fit.scrollWidth<=fit.width+1,`${label} horizontally overflows: ${JSON.stringify(fit)}`);
}
async function minimumTarget(page,selector,label){
  const boxes=await page.locator(selector).evaluateAll(nodes=>nodes.filter(node=>node.checkVisibility()).map(node=>{const r=node.getBoundingClientRect();return {text:(node.textContent||node.getAttribute('aria-label')||'').trim(),width:r.width,height:r.height};}));
  assert(boxes.length,`${label} has no visible targets`);
  for(const box of boxes)assert(box.width>=43.5&&box.height>=43.5,`${label} target is smaller than 44 px: ${JSON.stringify(box)}`);
  return boxes;
}
async function assertThumbnailContainment(page,label){
  const rows=await page.locator('.reading-spread-choice').evaluateAll(nodes=>nodes.map(row=>{
    const thumb=row.querySelector('.spread-thumb').getBoundingClientRect();
    const copy=row.querySelector('.spread-choice-copy').getBoundingClientRect();
    const cards=[...row.querySelectorAll('.spread-thumb i')].map(card=>{const rect=card.getBoundingClientRect();return {left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,width:rect.width,height:rect.height};});
    return {thumb:{left:thumb.left,right:thumb.right,top:thumb.top,bottom:thumb.bottom},copy:{left:copy.left},cards};
  }));
  assert(rows.length,`${label} has no spread choices`);
  for(const [rowIndex,row] of rows.entries()){
    assert(row.thumb.right<=row.copy.left+.5,`${label} thumbnail ${rowIndex+1} enters its copy column: ${JSON.stringify(row)}`);
    for(const [cardIndex,card] of row.cards.entries()){
      assert(card.width>0&&card.height>0,`${label} thumbnail ${rowIndex+1} card ${cardIndex+1} is not visible`);
      assert(card.left>=row.thumb.left-.5&&card.right<=row.thumb.right+.5&&card.top>=row.thumb.top-.5&&card.bottom<=row.thumb.bottom+.5,`${label} thumbnail ${rowIndex+1} card ${cardIndex+1} escapes its container: ${JSON.stringify({thumb:row.thumb,card})}`);
      assert(card.right<=row.copy.left+.5,`${label} thumbnail ${rowIndex+1} card ${cardIndex+1} enters its copy column: ${JSON.stringify({copy:row.copy,card})}`);
    }
  }
}
async function assertChineseShell(page){
  const shell=await page.evaluate(()=>({
    lang:document.documentElement.lang,
    toggles:document.querySelectorAll('[data-language-toggle]').length,
    text:document.body.innerText
  }));
  assert.equal(shell.lang,'zh-CN');
  assert.equal(shell.toggles,0,'English language entry must be absent');
  assert(!/(?:TAROT POCKET|78 CARDS|YOUR RECORDS|UNDERSTAND, THEN REMEMBER|LOCAL SPREAD READING|OPTIONAL DEEP READING|AI DEEP READING)/.test(shell.text),`visible English label remains: ${shell.text.match(/(?:TAROT POCKET|78 CARDS|YOUR RECORDS|UNDERSTAND, THEN REMEMBER|LOCAL SPREAD READING|OPTIONAL DEEP READING|AI DEEP READING)/)?.[0]}`);
}

(async()=>{
  const index=fs.readFileSync(path.join(repo,'index.html'),'utf8');
  const update=fs.readFileSync(path.join(repo,'update.html'),'utf8');
  const manifest=JSON.parse(fs.readFileSync(path.join(repo,'manifest.webmanifest'),'utf8'));
  assert(!/<(?:title|meta)[^>]*(?:Tarot Pocket|English and Chinese|中英双语)/i.test(index),'public index metadata must describe the Chinese-only release');
  assert(!/>\s*TAROT POCKET\s*</i.test(update),'public update page must not expose the English brand eyebrow');
  assert.equal(manifest.name,'塔罗随身学','installed app name must be Chinese-only');
  assert.equal(manifest.short_name,'塔罗随身学','installed short name must be Chinese-only');
  const server=await h.server();
  const browser=await chromium.launch(require('./browser_options.cjs'));
  try{
    const context=await h.context(browser,{viewport:{width:320,height:568},isMobile:true,reducedMotion:'reduce'});
    const page=await context.newPage();
    await page.addInitScript(()=>localStorage.setItem('tarot-pocket-language','en'));
    await page.goto(server.url+'?lang=en',{waitUntil:'domcontentloaded'});
    await page.locator('#app').waitFor();
    const stableBefore=await page.evaluate(()=>localStorage.getItem('tarot-pocket-demo-v1'));
    await page.evaluate(()=>window.TAROT_I18N.setLocale('en'));
    await page.reload({waitUntil:'domcontentloaded'});
    assert.equal(await page.evaluate(()=>localStorage.getItem('tarot-pocket-demo-v1')),stableBefore,'language fallback must not rewrite the main saved record');
    await assertChineseShell(page);
    const imagePlaceholder=await page.locator('.tarot-card-image').first().evaluate(img=>{const style=getComputedStyle(img);return {backgroundImage:style.backgroundImage,backgroundColor:style.backgroundColor,className:img.className};});
    assert(imagePlaceholder.backgroundImage.includes('card-back.svg')||imagePlaceholder.backgroundColor!=='rgba(0, 0, 0, 0)',`card art lacks a visible loading placeholder: ${JSON.stringify(imagePlaceholder)}`);
    await page.locator('.tarot-card-image').first().evaluate(img=>{img.src='assets/cards/__missing-v19__.webp';});
    await page.locator('.tarot-card-image.image-load-failed').waitFor();
    const failedImageBackground=await page.locator('.tarot-card-image.image-load-failed').first().evaluate(img=>getComputedStyle(img).backgroundImage);
    assert.notEqual(failedImageBackground,'none','a failed card image must keep the card-back placeholder');

    await page.locator('.bottomnav [data-page=reading]').click();
    await page.locator('.reading-theme-nav').waitFor();
    await assertChineseShell(page);
    await noHorizontalOverflow(page,'reading directory');
    const directory=await page.evaluate(()=>{
      const nav=document.querySelector('.reading-theme-nav'),navRect=nav.getBoundingClientRect();
      const buttons=[...nav.querySelectorAll('button')].map(button=>{const r=button.getBoundingClientRect();return {text:button.textContent.trim(),left:r.left,right:r.right,width:r.width,height:r.height};});
      const row=document.querySelector('[data-scenario="sc02"]'),summary=row.querySelector('p'),style=getComputedStyle(summary);
      return {nav:{left:navRect.left,right:navRect.right,clientWidth:nav.clientWidth,scrollWidth:nav.scrollWidth},buttons,summary:{text:summary.textContent.trim(),clientHeight:summary.clientHeight,scrollHeight:summary.scrollHeight,lineClamp:style.webkitLineClamp,overflow:style.overflow}};
    });
    assert.deepEqual(directory.buttons.map(x=>x.text),['基础牌阵','感情','工作','学业','生活']);
    assert(directory.nav.scrollWidth<=directory.nav.clientWidth+1,'category row must not hide an entry');
    for(const button of directory.buttons){assert(button.left>=directory.nav.left-.5&&button.right<=directory.nav.right+.5,`category is clipped: ${JSON.stringify(button)}`);assert(button.width>=43.5&&button.height>=43.5,`category target is too small: ${JSON.stringify(button)}`);}
    assert.equal(directory.summary.text,'不分配固定牌位，把三张牌放在一起回答同一个问题。');
    assert.equal(directory.summary.lineClamp,'none');
    assert(directory.summary.scrollHeight<=directory.summary.clientHeight+1,'directory summary must be fully visible');
    for(const category of ['all','love','work','study','life']){
      await page.locator(`[data-reading="category"][data-value="${category}"]`).click();
      await page.locator(`#reading-theme-${category}`).waitFor();
      await assertThumbnailContainment(page,`320 px ${category} directory`);
    }
    await page.locator('[data-reading="category"][data-value="all"]').click();
    await page.screenshot({path:screenshotDirectory,fullPage:true});

    await page.locator('[data-scenario="sc02"]').click();
    await page.locator('.reading-purpose').waitFor();
    const fullDescription=await page.locator('.reading-purpose').innerText();
    assert(fullDescription.includes('适合直接问一件事；没有具体问题时'),'spread detail must keep the complete description');
    await noHorizontalOverflow(page,'spread guide');
    await h.click(page,'start');
    await h.toPick(page);
    await page.waitForTimeout(120);
    assert.equal((await page.locator('.ritual-selection-heading h2').innerText()).trim(),'选第 1 张','number-only position must not repeat 第 1 张');
    const fan=await page.evaluate(()=>{
      const viewport=document.querySelector('[data-fan-viewport]'),vr=viewport.getBoundingClientRect();
      const cards=[...document.querySelectorAll('[data-deck-card]')],first=cards[0].getBoundingClientRect();
      return {range:document.querySelector('[data-fan-range]').textContent.trim(),count:cards.length,viewport:{left:vr.left,right:vr.right,top:vr.top,bottom:vr.bottom,width:vr.width,height:vr.height},first:{left:first.left,right:first.right,width:first.width,height:first.height},overlap:cards[1].offsetLeft-cards[0].offsetLeft,cardWidth:cards[0].offsetWidth,scrollWidth:document.documentElement.scrollWidth};
    });
    assert.equal(fan.range,'1 / 78','the initial fan must begin with card 1');
    assert.equal(fan.count,78);
    assert(fan.first.left>=fan.viewport.left-.5&&fan.first.right<=fan.viewport.right+.5,'card 1 must be fully visible initially');
    assert(fan.first.width>=44&&fan.first.height>=44,'fan cards must keep 44 px touch size');
    assert(fan.overlap>0&&fan.overlap<fan.cardWidth*.65,`fan is not densely overlapped: ${JSON.stringify(fan)}`);
    assert(fan.viewport.bottom<=568&&fan.viewport.height>=170,`fan must fit the first 320 x 568 view: ${JSON.stringify(fan.viewport)}`);
    assert(fan.scrollWidth<=320,'pick view must not overflow horizontally');
    await minimumTarget(page,'[data-reading="fan-out"],[data-reading="fan-in"],[data-reading="pause"]','pick controls');
    // Capture the true initial state before the reachability probes scroll to card 78.
    await page.screenshot({path:screenshotPick,fullPage:true});
    for(const index of [0,39,77]){
      const card=await h.center(page,index),box=await card.boundingBox(),viewport=await page.locator('[data-fan-viewport]').boundingBox();
      assert(box.x>=viewport.x-1&&box.x+box.width<=viewport.x+viewport.width+1,`card ${index+1} cannot be reached and centered`);
    }

    await h.pick(page,0);
    await h.pick(page,3);
    await page.emulateMedia({reducedMotion:'no-preference'});
    await h.pick(page,8);
    assert.equal((await page.locator('.ritual-selection-heading h2').innerText()).trim(),'选好了，可以一起揭牌','completed selection must not offer a nonexistent fourth card');
    await page.locator('[data-reading="reveal"]').waitFor({timeout:2000});
    await page.emulateMedia({reducedMotion:'reduce'});
    await h.reveal(page);
    await page.waitForFunction(()=>{
      const images=[...document.querySelectorAll('.reading-result-card img')];
      return images.length===3&&images.every(image=>image.complete&&image.naturalWidth>0&&!image.classList.contains('image-load-failed'));
    },null,{timeout:10000});
    await page.locator('.reading-result-card img').evaluateAll(images=>Promise.all(images.map(image=>image.decode?.().catch(()=>{})||Promise.resolve())));
    await assertChineseShell(page);
    assert.equal((await page.locator('.reading-offline h2').innerText()).trim(),'牌阵里的提示');
    assert.equal(await page.locator('.reading-offline .offline-position').count(),3,'Unwritten question gives each selected card its own position message');
    assert.equal(await page.locator('.reading-result-question').count(),0,'A preset is not presented as a question the user wrote');
    assert.equal((await page.locator('.reading-ai .eyebrow').innerText()).trim(),'可选深度解读');
    await noHorizontalOverflow(page,'reading result');
    await page.screenshot({path:screenshotResult,fullPage:true});

    await page.locator('[data-reading="card"]').first().click();
    await page.locator('[data-reading-dialog][open]').waitFor();
    const readingDetail=await page.evaluate(()=>{
      const portrait=document.querySelector('.reading-detail-portrait'),button=portrait.querySelector('button'),copy=portrait.querySelector('div'),br=button.getBoundingClientRect(),cr=copy.getBoundingClientRect(),dialog=document.querySelector('[data-reading-dialog]');
      return {display:getComputedStyle(portrait).display,buttonBottom:br.bottom,copyTop:cr.top,dialogWidth:dialog.getBoundingClientRect().width,clientWidth:dialog.clientWidth,scrollWidth:dialog.scrollWidth};
    });
    assert.equal(readingDetail.display,'grid');
    assert(readingDetail.buttonBottom<=readingDetail.copyTop+1,`320 px reading detail must stack image over text: ${JSON.stringify(readingDetail)}`);
    assert(readingDetail.dialogWidth<=320&&readingDetail.scrollWidth<=readingDetail.clientWidth+1,'reading detail must fit 320 px');
    await minimumTarget(page,'.reading-detail-close,.reading-detail-portrait>button,.reading-detail-dialog .secondary','reading detail controls');
    await h.click(page,'close-reference');

    const dossier=await context.newPage();
    await dossier.goto(server.url+'?lang=en',{waitUntil:'domcontentloaded'});
    await dossier.locator('[data-action="choose-cards"]').click();
    await dossier.locator('.library-card').first().waitFor();
    await assertChineseShell(dossier);
    await noHorizontalOverflow(dossier,'card library');
    await dossier.locator('.library-card').first().click();
    await dossier.locator('#overlay .dossier-hero').waitFor();
    const cardDetail=await dossier.evaluate(()=>{
      const hero=document.querySelector('.dossier-hero'),cover=hero.querySelector('.dossier-cover'),copy=hero.querySelector(':scope>div'),hr=hero.getBoundingClientRect(),br=cover.getBoundingClientRect(),cr=copy.getBoundingClientRect(),sheet=document.querySelector('#overlay .sheet');
      return {columns:getComputedStyle(hero).gridTemplateColumns,hero:{left:hr.left,right:hr.right},cover:{left:br.left,right:br.right,bottom:br.bottom},copy:{left:cr.left,right:cr.right,top:cr.top},sheet:{clientWidth:sheet.clientWidth,scrollWidth:sheet.scrollWidth},eyebrow:hero.querySelector('.eyebrow').textContent.trim(),languageToggles:document.querySelectorAll('[data-language-toggle]').length};
    });
    assert.equal(cardDetail.eyebrow,'牌库 · 完整参考');
    assert.equal(cardDetail.languageToggles,0);
    assert(cardDetail.cover.bottom<=cardDetail.copy.top+1,`320 px dossier must stack image over text: ${JSON.stringify(cardDetail)}`);
    assert(cardDetail.sheet.scrollWidth<=cardDetail.sheet.clientWidth+1,'dossier must not overflow horizontally');
    await minimumTarget(dossier,'.dossier-nav button,.detail-start button,.sheethead .iconbtn','dossier controls');
    await assertChineseShell(dossier);
    await context.close();
    console.log('PASS Chinese-only mobile 320 x 568');
    console.log(JSON.stringify({directory,fan,readingDetail,cardDetail,screenshots:[screenshotDirectory,screenshotPick,screenshotResult]},null,2));
  }finally{
    await browser.close();
    await server.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
