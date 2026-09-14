/* Seed an explicit historical session so old UI coverage remains meaningful
   after v4 becomes the default. Only isolated test browser contexts use this. */
let sequence=0;
module.exports=async function legacyJourney(page,version=3){
 const key='tarot-pocket-demo-v1',data=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key),s=data.journey.session;
 if(!s)throw Error('Legacy fixture requires a real started session');
 s.playVersion=version;s.inspected=false;delete s.guided;
 if(s.mode==='new')s.steps=['intro','image','meaning','recall','compare','application','reversal'];
 const once='tarot-test-legacy-fixture-'+(++sequence);
 await page.addInitScript(({key,data,once})=>{if(sessionStorage.getItem(once))return;localStorage.setItem(key,JSON.stringify(data));sessionStorage.setItem(once,'applied');},{key,data,once});
 await page.reload();await page.locator('[data-journey=continue]').click();
};
