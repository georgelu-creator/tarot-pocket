// Capture an isolated, synthetic ritual with real animation timing; no AI or user data.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/images');
(async()=>{
 const browser=await chromium.launch(require('./browser_options.cjs'));
 try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,recordVideo:{dir:fs.mkdtempSync(path.join(os.tmpdir(),'tarot-ui-recording-')),size:{width:390,height:844}}});
 const p=await ctx.newPage(),video=p.video();await p.goto((process.env.DEMO_URL||pathToFileURL(path.join(root,'demo/tarot-demo.html')).href)+'?lang=zh');
 const tap=(a,i)=>p.locator(`[data-reading="${a}"]${i===undefined?'':`[data-index="${i}"]`}`).first().click();
 await p.locator('.bottomnav [data-page=reading]').click();await p.locator('[data-reading=guide][data-value=three]').click();await p.locator('[data-reading=use-spread]').click();await tap('start');
 await p.waitForTimeout(1300);await p.screenshot({path:path.join(out,'ritual-shuffle-v13.png')});await p.locator('[data-reading=motion-continue]').click();
 await p.waitForTimeout(600);await tap('cut',52);await p.locator('[data-reading=motion-continue]').click();
 for(const i of [2,4,1]){await tap('pick',i);await p.waitForTimeout(650);if(i===2)await p.screenshot({path:path.join(out,'ritual-select-v13.png')});await tap('pick-confirm',i);await p.waitForTimeout(350);}
 for(let i=0;i<3;i++){await tap('reveal-next',i);await p.waitForTimeout(2100);if(i===0)await p.screenshot({path:path.join(out,'ritual-reveal-v13.png')});await tap('reveal-place',i);}
 await p.waitForTimeout(1000);await ctx.close();await video.saveAs(path.join(out,'ritual-v13.webm'));
 const g=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await g.goto((process.env.DEMO_URL||pathToFileURL(path.join(root,'demo/tarot-demo.html')).href)+'?lang=zh');await g.locator('[data-action=choose-cards]').click();await g.locator('.library-card[data-id=m16]').click();await g.screenshot({path:path.join(out,'dossier-v13.png')});
 console.log('Captured isolated ritual video and mobile UI screenshots.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
