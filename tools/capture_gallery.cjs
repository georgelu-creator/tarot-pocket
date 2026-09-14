// Produce real, isolated demo screenshots; never capture personal browser records.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/images');
const url=process.env.DEMO_URL||require('node:url').pathToFileURL(path.join(root,'demo/tarot-demo.html')).href;
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch(require('./browser_options.cjs'));
 try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,reducedMotion:'reduce'}),p=await ctx.newPage();
 await p.goto(url+'?lang=en');await p.locator('[data-home-choice]').first().waitFor();
 await p.screenshot({path:path.join(out,'home.png')});
 await p.locator('[data-home-choice][data-journey=continue]').click();await p.locator('[data-journey=next]').click();await p.locator('.journey-stage').waitFor();
 await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await p.screenshot({path:path.join(out,'practice.png')});
 await p.locator('[data-action=nav][data-page=home]').first().click();await p.locator('.bottomnav [data-page=reading]').click();
 await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await p.screenshot({path:path.join(out,'reading.png')});
 const phone=fs.readFileSync(path.join(out,'home.png')).toString('base64');
 const art=fs.readFileSync(path.join(root,'assets/cards/p04.webp')).toString('base64');
 const hero=await ctx.newPage();await hero.setViewportSize({width:1200,height:630});
 await hero.setContent(`<!doctype html><html lang="en"><meta charset="UTF-8"><style>*{box-sizing:border-box}body{margin:0;background:#F6F1E9;color:#302C32;font-family:Arial,sans-serif}.canvas{width:1200px;height:630px;position:relative;overflow:hidden;padding:55px 64px}.brand{font-size:23px;font-weight:bold;letter-spacing:.2px}.spark{display:inline-grid;place-items:center;border:1px solid #60465C;border-radius:7px;width:33px;height:42px;margin-right:12px}h1{font-family:Georgia,serif;font-size:62px;line-height:1.1;letter-spacing:-1.7px;margin:48px 0 24px;font-weight:400}p{font-size:19px;line-height:1.65;max-width:540px;color:#736B73}.tags{display:flex;gap:10px;margin-top:28px}.tags span{border:1px solid #DCD4DC;border-radius:30px;padding:10px 14px;font-size:13px}.bottom{position:absolute;bottom:40px;color:#736B73;font-size:14px}.phone{position:absolute;right:78px;top:37px;width:270px;height:558px;border:7px solid #fff;border-radius:33px;overflow:hidden;box-shadow:0 20px 45px #302C3220;transform:rotate(4deg)}.phone img{width:100%}.art{position:absolute;width:122px;right:334px;top:337px;transform:rotate(-13deg);border:5px solid white;border-radius:7px;box-shadow:0 14px 28px #302C3230}.orb{position:absolute;width:530px;height:530px;border:1px solid #E7DEE8;border-radius:50%;right:-40px;top:58px}.orb:before{content:'';position:absolute;inset:38px;border:1px solid #E7DEE8;border-radius:50%}</style><div class="canvas"><div class="orb"></div><div class="brand"><span class="spark">✧</span> TAROT POCKET</div><h1>Learn the picture.<br>Remember the meaning.</h1><p>A quiet place to learn tarot through images,<br>active recall, and readings in context.</p><div class="tags"><span>78 historical RWS cards</span><span>23 spreads + daily tarot</span><span>English / 中文</span></div><div class="bottom">OFFLINE LEARNING · OPEN SOURCE · NO ACCOUNT</div><div class="phone"><img src="data:image/png;base64,${phone}"></div><img class="art" src="data:image/webp;base64,${art}"></div></html>`);
 await hero.locator('img').evaluateAll(ims=>Promise.all(ims.map(im=>im.decode())));
 await hero.screenshot({path:path.join(out,'hero.png')});
 console.log('Created isolated screenshots and social preview in docs/images.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
