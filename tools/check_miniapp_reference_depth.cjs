/* Actual H5 build, all card routes, isolated storage and local verified artwork. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {chromium}=require('playwright'),{createPreview}=require('../apps/miniapp/tools/preview.cjs');
const root=path.resolve(__dirname,'..'),s={window:{}};for(const file of ['card-knowledge.js','reading-deck.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),s);
(async()=>{const server=createPreview();await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch(require('./browser_options.cjs'));
try{const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[],unexpected=[];
page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin===origin)return route.continue();if(u.origin==='https://tarot.georgelu.cn'&&/^\/assets\/cards\/[mcwsp]\d{2}\.webp$/.test(u.pathname))return route.fulfill({body:fs.readFileSync(path.join(root,u.pathname)),contentType:'image/webp'});unexpected.push(u.origin+u.pathname);return route.abort();});
for(const card of s.window.TAROT_READING_DECK.cards){
 const k=s.window.TAROT_CARD_KNOWLEDGE.byId[card.id];await page.goto(origin+'/?referenceCase='+card.id+'#/pages/card/index?id='+card.id);await page.locator('.title').filter({hasText:card.name}).waitFor();await page.locator('.meaning').waitFor();
 assert((await page.locator('.meaning').innerText()).includes(k.nuances[0]),card.id+' expanded upright');
 for(const title of ['感情、工作、学业与生活','金钱与资源','相近牌的区别','在整副牌中的位置','情境实例','传统出处与延伸理解'])await page.locator('.chapter').filter({hasText:title}).click();
 const body=await page.locator('.page').innerText();assert(body.includes(k.domains.money.upright));assert(body.includes(k.examples[1].reading));assert(body.includes(k.history.text));
 await page.locator('.orientation').getByText('逆位',{exact:true}).click();assert((await page.locator('.meaning').innerText()).includes(k.reversedBranches[2].text));assert((await page.locator('.page').innerText()).includes(k.domains.money.reversed),'expanded money retains direction state');
 if(['m00','m16','w14','c07','s09','p06'].includes(card.id))for(const width of [320,390,1280]){await page.setViewportSize({width,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),card.id+' viewport '+width);}
 await page.setViewportSize({width:390,height:844});
 // Also exercise real in-app navigation between two instances of the same card page.
 const compared=s.window.TAROT_READING_DECK.cards.find(x=>x.id===k.comparisons[0].id);
 await page.locator('.comparison').first().click();
 await page.locator('.title').filter({hasText:new RegExp('^'+compared.name+'$')}).waitFor();
 assert((await page.locator('.meaning').last().innerText()).includes(s.window.TAROT_CARD_KNOWLEDGE.byId[compared.id].nuances[0]),card.id+' comparison navigation');
}
assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);await context.close();console.log('PASS actual uni-app H5: all 78 articles, six expandable chapters, directions, source notes, resource domain; representative 320/390/1280 without overflow or extra requests.');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1});
