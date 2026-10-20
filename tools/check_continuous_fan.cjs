'use strict'
const assert=require('node:assert/strict')
const fs=require('node:fs')
const path=require('node:path')
const vm=require('node:vm')
const root=path.resolve(__dirname,'..')
const component=fs.readFileSync(path.join(root,'apps/miniapp/src/components/ContinuousFan.vue'),'utf8')
const source=fs.readFileSync(path.join(root,'apps/miniapp/src/components/continuous-fan.wxs'),'utf8')
assert.doesNotMatch(source,/(^|[^\w])\.[0-9]/m,'native WXS rejects leading-dot numeric literals')
assert.doesNotMatch(source,/Date\.now|#ifdef|#ifndef/,'native WXS never depends on unprocessed platform branches or a JavaScript Date global')
let clock=1000
const scope={module:{exports:{}},Math,getDate:()=>({getTime:()=>clock})}
vm.runInNewContext(source.replace(/ \/\/ #ifdef H5[\s\S]*? \/\/ #endif/,''),scope)
const fan=scope.module.exports
const state={},calls=[],frames=[],styles=new Map(),renderedStyles=new Map(),removed=[]
const owner={getState:()=>state,requestAnimationFrame:callback=>frames.push(callback),callMethod:(name,payload)=>calls.push({name,payload:JSON.parse(JSON.stringify(payload))}),selectComponent:selector=>({setStyle:value=>{styles.set(selector,value);renderedStyles.set(selector,{...renderedStyles.get(selector),...value})},removeClass:value=>removed.push(value)})}
const config={width:320,pageLeft:18,left:0,zoom:1,revision:0,disabled:false,picked:[]}
fan.configure(config,null,owner)
const touch=(x,y=100)=>({pageX:x,pageY:y})
const event=touches=>({touches})
const tap=index=>fan.tap({currentTarget:{dataset:{index}}},owner)
const chosen=()=>calls.filter(call=>call.name==='onFanChoose')
function settle(){clock+=250;const queued=frames.splice(0);queued.forEach(callback=>callback());assert.equal(frames.length,0,'settled WXS callbacks stop scheduling frames')}
function simpleTap(index){fan.start(event([touch(100)]),owner);clock+=60;fan.end(event([]),owner);tap(index)}

// Each native-scroll frame touches only the cards around the viewport, even with all 78 mounted.
assert.ok([...styles.keys()].filter(key=>key.startsWith('.fan-item')).length<18)
assert.equal(styles.get('.continuous-fan-strip')['--fan-label-opacity'],'0','numbers are hidden before zoom')
assert.match(styles.get('.fan-item-0').transform,/rotate\(-/)
assert.match(styles.get('.fan-item-8').transform,/rotate\([\d.]+deg/)
simpleTap(3)
assert.deepEqual(chosen().map(call=>call.payload.index),[3],'a settled intentional tap selects its original deck index')
clock+=300
fan.start(event([touch(160)]),owner)
fan.move(event([touch(70)]),owner)
fan.scroll({detail:{scrollLeft:600}},owner)
fan.end(event([]),owner)
tap(19)
assert.equal(chosen().length,1,'drag release cannot select a card')
// A tap that stops ongoing native inertia must not become a selection after it settles.
clock+=40
fan.scroll({detail:{scrollLeft:640}},owner)
fan.start(event([touch(120)]),owner)
clock+=240
fan.end(event([]),owner)
tap(20)
assert.equal(chosen().length,1,'stopping inertia is not choosing')
settle()
styles.clear();calls.length=0
fan.scroll({detail:{scrollLeft:1200}},owner)
settle()
assert.ok([...styles.keys()].filter(key=>key.startsWith('.fan-item')).length<20)
assert.equal(calls.filter(call=>call.name==='onFanViewport').length,1,'scroll persistence emits after settling only')
assert.equal(calls[0].payload.offset,1200)

// Actual two-touch distance changes the view-layer geometry, with midpoint preserved.
clock+=250
fan.start(event([touch(98),touch(198)]),owner)
const anchor=state.anchor,middle=state.middle
const priorCalls=calls.length
assert.equal(fan.move(event([touch(48),touch(248)]),owner),false,'pinch consumes native/page zoom')
assert.equal(state.zoom,2)
assert.equal(styles.get('.continuous-fan-strip')['--fan-label-opacity'],'1','numbers appear while pinch enlarges the cards')
assert.ok(Math.abs(80+anchor*(320/9)*Math.pow(2,1.65)-state.left-middle)<.001,'pinch holds the same deck location under its midpoint')
assert.equal(calls.length,priorCalls,'pinch frames never cross to Vue')
assert.equal(styles.get('.continuous-fan-strip')['--fan-card-width'],'144px')
assert.equal(styles.get('.continuous-fan-strip')['--fan-card-height'],'240px','card artwork stays exactly 3:5')
fan.end(event([touch(48)]),owner)
assert.equal(fan.move(event([touch(68)]),owner),false,'lifting one finger does not restart a pan or tap')
fan.end(event([]),owner)
tap(40)
assert.equal(calls.filter(call=>call.name==='onFanChoose').length,0,'pinch release cannot select a card')
const zoomed=calls.find(call=>call.name==='onFanZoom').payload
assert.equal(zoomed.zoom,2)
fan.configure({...config,zoom:zoomed.zoom,left:zoomed.left,revision:1},config,owner)
settle()
simpleTap(40)
assert.equal(calls.filter(call=>call.name==='onFanChoose').at(-1).payload.index,40,'the next fresh settled tap can choose')

// Picked/disabled updates keep live position, original indices and zoom.
const retained=state.left
fan.configure({...config,zoom:2,left:zoomed.left,revision:1,picked:[40],disabled:true},config,owner)
assert.equal(state.left,retained)
clock+=300;simpleTap(44)
assert.equal(calls.filter(call=>call.name==='onFanChoose').length,1)
fan.configure({...config,zoom:2,left:zoomed.left,revision:1,picked:[40]},config,owner)
clock+=300;simpleTap(40)
assert.equal(calls.filter(call=>call.name==='onFanChoose').length,1,'selected deck slots cannot be reused')
clock+=300;fan.start(event([touch(100)]),owner);fan.cancel(event([]),owner);tap(41)
assert.equal(calls.filter(call=>call.name==='onFanChoose').length,1,'cancelled gestures cannot select')
assert.ok(removed.includes('intro'),'interaction cancels introductory motion')
clock+=400;fan.start(event([touch(100)]),owner);fan.move(event([touch(60)]),owner);fan.end(event([]),owner);tap(41)
assert.equal(calls.filter(call=>call.name==='onFanChoose').length,1,'the release from another drag stays blocked')
clock+=701;tap(41)
assert.equal(calls.filter(call=>call.name==='onFanChoose').length,2,'a later keyboard or screen-reader activation is not permanently blocked by an old gesture')

// Every card can enter the live arc, through a continuous native offset.
for(let index=0;index<78;index++){
 styles.clear();fan.scroll({detail:{scrollLeft:Math.min(index*(320/9)*Math.pow(2,1.65),160+77*(320/9)*Math.pow(2,1.65)+144-320)}},owner);settle()
 const spacing=(320/9)*Math.pow(2,1.65),unit=Math.max(-1.2,Math.min(1.2,(80+index*spacing+72-state.left-160)/160));assert.equal(renderedStyles.get('.fan-item-'+index)?.transform,'translate3d(0,'+(Math.round(3000*unit*unit)/100)+'px,0) rotate('+(Math.round(1700*unit)/100)+'deg)','card '+(index+1)+' remains reachable at its correct curve without paging')
}
const restoredState={},restoredOwner={...owner,getState:()=>restoredState}
const saved={...config,left:8555,zoom:2,revision:0}
fan.configure(saved,null,restoredOwner)
assert.equal(restoredState.zoom,2,'saved zoom is applied during initial render')
fan.configure({...saved,width:352,revision:1},saved,restoredOwner)
assert.equal(restoredState.left,8555,'saved final-card offset is reapplied after actual viewport measurement')
fan.configure({...saved,width:352,revision:2,picked:[77],disabled:true},{...saved,width:352,revision:1},restoredOwner)
assert.equal(restoredState.left,8555,'picked and pending props preserve restored offset')
styles.clear();fan.scroll({detail:{scrollLeft:state.left}},owner);settle();assert.equal([...styles.keys()].filter(key=>key.startsWith('.fan-item')).length,0,'identical frames do not rewrite card transforms')
const keyboardState={},keyboardCalls=[]
const keyboardOwner={...owner,getState:()=>keyboardState,callMethod:(name,payload)=>keyboardCalls.push({name,payload})}
fan.configure({...config,skipIntro:true},null,keyboardOwner);fan.scroll({detail:{scrollLeft:100}},keyboardOwner);const tapEvent={currentTarget:{dataset:{index:4}}};fan.tap(tapEvent,keyboardOwner)
assert.equal(keyboardCalls.filter(call=>call.name==='onFanChoose').length,1,'explicit keyboard or mouse activation after focus scrolling is not mistaken for a touch fling')
const cancelState={},cancelCalls=[]
const cancelOwner={...owner,getState:()=>cancelState,callMethod:(name,payload)=>cancelCalls.push({name,payload})}
fan.configure(config,null,cancelOwner)
fan.tap(tapEvent,cancelOwner)
fan.configure({...config,disabled:true},config,cancelOwner)
fan.configure(config,{...config,disabled:true},cancelOwner)
fan.tap(tapEvent,cancelOwner)
assert.equal(cancelCalls.filter(call=>call.name==='onFanChoose').length,2,'an explicit preview cancel permits an immediate new activation without waiting out the previous tap cooldown')
fan.start(event([touch(160)]),cancelOwner);fan.move(event([touch(70)]),cancelOwner);fan.scroll({detail:{scrollLeft:100}},cancelOwner);fan.end(event([]),cancelOwner)
fan.configure({...config,disabled:true},config,cancelOwner);fan.configure(config,{...config,disabled:true},cancelOwner);fan.tap(tapEvent,cancelOwner)
assert.equal(cancelCalls.filter(call=>call.name==='onFanChoose').length,2,'unlocking selection never makes a moved touch release choose a card')
clock+=400;fan.start(event([touch(100)]),cancelOwner);fan.cancel(event([]),cancelOwner)
fan.configure({...config,disabled:true},config,cancelOwner);fan.configure(config,{...config,disabled:true},cancelOwner);fan.tap(tapEvent,cancelOwner)
assert.equal(cancelCalls.filter(call=>call.name==='onFanChoose').length,2,'preview unlock preserves the touchcancel guard against a late synthetic tap')
assert.match(component,/height:\(120\*zoom\+118\)\+'px'/,'native scroll-view has an explicit gesture viewport height')
assert.match(component,/<view[^>]*:prop="fanConfig"[^>]*:change:prop="fan\.configure"/,'native gesture state is observed on a view, independently of the scroll-view built-in properties')
assert.match(component,/length:78/)
assert.match(component,/prefers-reduced-motion:reduce/)
assert.match(component,/initialOffset:\{type:Number,default:0\}/)
assert.doesNotMatch(component,/上一组|下一组|<slider/)
console.log('WXS gesture logic (Node VM): 78 reachable stable slots; curved visible subset; native inertia guard; real pinch + midpoint; 3:5 geometry; settled persistence; cancellation passed.')

// Execute the authored component methods with a native scroll context, not a duplicate implementation.
;(async()=>{
 const ts=require(path.join(root,'apps/miniapp/node_modules/typescript'))
 const script=component.match(/<script lang="ts">([\s\S]*?)<\/script>/)[1].replace(/\/\/ #ifdef H5[\s\S]*?\/\/ #endif/g,'')
 const compiled=ts.transpileModule(script,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText
 const timers=new Map(),calls=[];let serial=0
 const nativeUni={createSelectorQuery:()=>{const query={in:()=>query,select:()=>query,scrollOffset:callback=>{query.callback=callback;return query},exec:()=>query.callback?.({scrollLeft:91})};return query}}
 const scope={exports:{},require:id=>{assert.equal(id,'vue');return{defineComponent:value=>value,markRaw:value=>value}},uni:nativeUni,setTimeout:callback=>{timers.set(++serial,callback);return serial},clearTimeout:id=>timers.delete(id)}
 vm.runInNewContext(compiled,scope)
 const options=scope.exports.default
 const context={...options.data.call({initialZoom:1,initialOffset:0,skipIntro:false}),initialZoom:1,initialOffset:0,picked:[],disabled:false,$emit(){},$nextTick:()=>Promise.resolve()}
 for(const [key,method] of Object.entries(options.methods))context[key]=method.bind(context)
 context.introControl.context={scrollTo:value=>calls.push(JSON.parse(JSON.stringify(value)))}
 context.scheduleIntro('fan-unfold');timers.values().next().value()
 assert.equal(calls[0].animated,true,'native introduction scrolls the actual context forward')
 await context.resize(1)
 assert.deepEqual(calls.at(-1),{left:91,animated:false},'zoom control stops native introduction at the live offset before changing scale')
 assert.equal(context.zoom,1.35)
 const skipped={...context,introEnabled:false,introControl:{stopped:false,timer:null}}
 options.methods.scheduleIntro.call(skipped,'fan-unfold')
 assert.equal(skipped.introControl.timer,null,'seen introduction never schedules again')
 console.log('Native component methods: actual forward context; accessible zoom cancellation uses live scroll offset; seen intro suppression passed.')
})().catch(error=>{console.error(error);process.exitCode=1})

// Optional actual H5 build, including real browser touch events through the product adapter.
// CONTINUOUS_FAN_H5=/path/to/built/h5 node tools/check_continuous_fan.cjs
if(process.env.CONTINUOUS_FAN_H5)(async()=>{
 const http=require('node:http'),{chromium}=require('playwright')
 const built=path.resolve(process.env.CONTINUOUS_FAN_H5)
 const server=http.createServer((request,response)=>{
  const pathname=new URL(request.url,'http://localhost').pathname
  const file=path.resolve(built,'.'+(pathname==='/'?'/index.html':pathname))
  if(!file.startsWith(built+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){response.writeHead(404);response.end();return}
  response.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream')
  fs.createReadStream(file).pipe(response)
 })
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
 const browser=await chromium.launch(require('./browser_options.cjs'))
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true})
  const page=await context.newPage(),errors=[]
  page.on('pageerror',error=>errors.push(error.message))
  page.on('console',message=>{if(message.type()==='error'&&/TypeError|ReferenceError|RangeError/.test(message.text()))errors.push(message.text())})
  await page.route('https://tarot.georgelu.cn/**',route=>{const pathname=new URL(route.request().url()).pathname;if(/^\/assets\/cards\/[mcwsp]\d{2}\.webp$/.test(pathname))return route.fulfill({body:fs.readFileSync(path.join(root,pathname)),contentType:'image/webp'});return route.abort()})
  await page.goto('http://127.0.0.1:'+server.address().port)
  await page.locator('.floating-nav-item').filter({hasText:/^抽牌$/}).click()
  await page.locator('.spread-item').first().click()
  await page.getByText('开始抽牌',{exact:true}).click()
  await page.locator('.cut-pile').nth(1).waitFor({timeout:10000})
  await page.locator('.cut-pile').nth(1).click()
  await page.locator('.continuous-fan-card').last().waitFor({timeout:5000})
  await page.waitForTimeout(2900)
  assert.equal(await page.locator('.fan-card').count(),78)
  assert.equal(await page.locator('.fan-number').first().evaluate(node=>getComputedStyle(node).opacity),'0','sequence numbers stay hidden at normal size')
  const introductoryOffset=await page.locator('.fan-scroll').evaluate(root=>[...root.querySelectorAll('*')].find(node=>node.scrollWidth>node.clientWidth+1&&/auto|scroll/.test(getComputedStyle(node).overflowX)).scrollLeft)
  assert.ok(introductoryOffset>=100&&introductoryOffset<=180,`unfold actually scrolls forward several cards and stays there: ${introductoryOffset}`)
  await page.waitForTimeout(250)
  assert.ok(Math.abs(await page.locator('.fan-scroll').evaluate(root=>[...root.querySelectorAll('*')].find(node=>node.scrollWidth>node.clientWidth+1&&/auto|scroll/.test(getComputedStyle(node).overflowX)).scrollLeft)-introductoryOffset)<1,'intro does not rock the whole strip back to its start')
  await page.locator('.fan-scroll').scrollIntoViewIfNeeded();const initialNumberSize=await page.locator('.fan-number').first().evaluate(node=>parseFloat(getComputedStyle(node).fontSize))
  const curves=await page.locator('.fan-card').evaluateAll(nodes=>[0,7].map(index=>getComputedStyle(nodes[index]).transform))
  assert.notEqual(curves[0],curves[1],'the live fan is curved across the measured viewport')
  await page.locator('.fan-card').nth(5).click()
  await page.locator('.pending-sheet').waitFor()
  await page.getByText('换一张',{exact:true}).click()
  const session=await context.newCDPSession(page)
  const bounds=await page.locator('.fan-scroll').boundingBox()
  const y=bounds.y+95
  const send=(type,points)=>session.send('Input.dispatchTouchEvent',{type,touchPoints:points.map((x,index)=>({x,y,id:index+1}))})
  await page.evaluate(()=>{window.fanSamples=[];window.fanSampling=true;let previous=performance.now();const sample=timestamp=>{if(!window.fanSampling)return;const panel=document.querySelector('.ritual-panel').getBoundingClientRect();const root=document.querySelector('.fan-scroll'),scroller=[...root.querySelectorAll('*')].find(node=>node.scrollWidth>node.clientWidth+1&&/auto|scroll/.test(getComputedStyle(node).overflowX));window.fanSamples.push({delta:timestamp-previous,top:panel.top,width:panel.width,scrollWidth:scroller.scrollWidth});previous=timestamp;requestAnimationFrame(sample)};requestAnimationFrame(sample)})
  await send('touchStart',[bounds.x+bounds.width-40])
  for(let offset=0;offset<9;offset++){await send('touchMove',[bounds.x+bounds.width-60-offset*23]);await page.waitForTimeout(20)}
  await send('touchEnd',[])
  await page.waitForTimeout(650)
  assert.equal(await page.locator('.pending-sheet').count(),0,'native swiping cannot open confirmation')
  await page.waitForFunction(()=>[...document.querySelector('.fan-scroll').querySelectorAll('*')].some(node=>node.scrollWidth>node.clientWidth+1&&/auto|scroll/.test(getComputedStyle(node).overflowX)&&node.scrollLeft>50),null,{timeout:3000})
  const offset=await page.locator('.fan-scroll').evaluate(root=>[...root.querySelectorAll('*')].find(node=>node.scrollWidth>node.clientWidth+1&&/auto|scroll/.test(getComputedStyle(node).overflowX)).scrollLeft)
  assert.ok(offset>50,'real single-finger swipe scrolls the native container')
  for(let flick=0;flick<3;flick++){
   await send('touchStart',[bounds.x+bounds.width-35])
   for(let frame=0;frame<6;frame++){await send('touchMove',[bounds.x+bounds.width-50-frame*38]);await page.waitForTimeout(12)}
   await send('touchEnd',[]);await page.waitForTimeout(260)
  }
  const samples=await page.evaluate(()=>{window.fanSampling=false;return window.fanSamples})
  assert.ok(samples.length>10,'fast flicks sampled actual rendering frames')
  assert.ok(Math.max(...samples.map(s=>s.top))-Math.min(...samples.map(s=>s.top))<1,'fast horizontal flicks never shift the entire page vertically')
  assert.ok(Math.max(...samples.map(s=>s.width))-Math.min(...samples.map(s=>s.width))<1,'fast flicks keep a stable viewport width')
  assert.equal(Math.max(...samples.map(s=>s.scrollWidth)),Math.min(...samples.map(s=>s.scrollWidth)),'curved card corners never change the scroll boundary during fast flicks')
  assert.equal(await page.locator('.fan-card').count(),78,'fast flicking never remounts or groups the deck')
  assert.equal(await page.locator('.pending-sheet').count(),0,'fast flicking does not accidentally pick')
  console.log('H5 actual fast-flick frames',JSON.stringify({samples:samples.length,maxFrameMs:Math.round(Math.max(...samples.map(s=>s.delta))*10)/10,p95FrameMs:Math.round([...samples.map(s=>s.delta)].sort((a,b)=>a-b)[Math.floor(samples.length*.95)]*10)/10,verticalDrift:Math.max(...samples.map(s=>s.top))-Math.min(...samples.map(s=>s.top)),physicalDevice:false}))
  await send('touchStart',[bounds.x+90,bounds.x+190])
  await send('touchMove',[bounds.x+65,bounds.x+215]);await page.waitForTimeout(30)
  await send('touchMove',[bounds.x+40,bounds.x+240])
  await send('touchEnd',[])
  await page.waitForTimeout(500)
  assert.equal(await page.locator('.pending-sheet').count(),0,'actual pinch cannot choose a card')
  assert.equal(await page.locator('.fan-number').first().evaluate(node=>getComputedStyle(node).opacity),'1','numbers appear only after enlarging')
  const zoomLabel=await page.locator('.continuous-fan-zoom uni-text').innerText()
  assert.ok(parseInt(zoomLabel)>140,'actual two-finger pinch enlarges the fan');assert.equal(await page.evaluate(()=>visualViewport.scale),1,'pinch changes cards rather than the page scale')
  assert.ok(await page.locator('.fan-number').first().evaluate(node=>parseFloat(getComputedStyle(node).fontSize))>initialNumberSize,'pinch enlarges the printed sequence numbers');const picked=await page.evaluate(()=>JSON.parse(localStorage.getItem('tarot-miniapp-reading-v1')).data.draft.picked);assert.deepEqual(picked,[],'gestures do not commit a picked card');const cardGeometry=await page.locator('.continuous-fan-back').first().evaluate(node=>{const style=getComputedStyle(node);return{width:parseFloat(style.width),height:parseFloat(style.height)}})
  assert.ok(Math.abs(cardGeometry.width/cardGeometry.height-.6)<.001)
  await page.locator('.fan-scroll').evaluate(root=>{const scroller=[...root.querySelectorAll('*')].find(node=>node.scrollWidth>node.clientWidth+1&&/auto|scroll/.test(getComputedStyle(node).overflowX));scroller.scrollLeft=scroller.scrollWidth-scroller.clientWidth})
  await page.waitForTimeout(400)
  const last=await page.locator('.fan-card').last().boundingBox()
  assert.ok(last.x<390&&last.x+last.width>bounds.x,'the last original card is reachable continuously')
  const beforeChange=await page.locator('.fan-scroll').evaluate(root=>[...root.querySelectorAll('*')].find(node=>node.scrollWidth>node.clientWidth+1&&/auto|scroll/.test(getComputedStyle(node).overflowX)).scrollLeft)
  const point=await page.locator('.fan-card[data-index="77"]').evaluate(node=>{const rect=node.getBoundingClientRect();for(let y=rect.top+3;y<Math.min(rect.bottom,innerHeight);y+=3)for(let x=Math.max(rect.left+3,0);x<Math.min(rect.right,innerWidth);x+=3)if(document.elementFromPoint(x,y)?.closest('.fan-card')===node)return{x,y};return null})
  assert.ok(point,'last card has an intentional visible hit target')
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,id:1}]})
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
  await page.locator('.pending-sheet').waitFor()
  await page.getByText('换一张',{exact:true}).click()
  const afterChange=await page.locator('.fan-scroll').evaluate(root=>[...root.querySelectorAll('*')].find(node=>node.scrollWidth>node.clientWidth+1&&/auto|scroll/.test(getComputedStyle(node).overflowX)).scrollLeft)
  assert.ok(Math.abs(afterChange-beforeChange)<2,`change keeps the same scrolled position: ${beforeChange} -> ${afterChange}`)
  await page.waitForTimeout(300)
  const priorRestoreDiagnostic=await page.locator('.fan-scroll').evaluate(root=>{const scroller=[...root.querySelectorAll('*')].find(node=>node.scrollWidth>node.clientWidth+1&&/auto|scroll/.test(getComputedStyle(node).overflowX)),state=root.closest('.continuous-fan').__wxsState;return{actual:scroller.scrollLeft,client:scroller.clientWidth,scrollWidth:scroller.scrollWidth,strip:getComputedStyle(root.querySelector('.continuous-fan-strip')).width,state:{width:state.width,left:state.left,nativeLeft:state.nativeLeft,zoom:state.zoom},saved:JSON.parse(localStorage.getItem('tarot-miniapp-reading-v1')).data.draft.fanOffset}})
  await page.reload()
  await page.locator('.continuous-fan-card').last().waitFor()
  await page.waitForTimeout(500)
  const restoredOffset=await page.locator('.fan-scroll').evaluate(root=>[...root.querySelectorAll('*')].find(node=>node.scrollWidth>node.clientWidth+1&&/auto|scroll/.test(getComputedStyle(node).overflowX)).scrollLeft)
  if(Math.abs(restoredOffset-afterChange)>=2)console.error('restore diagnostic',priorRestoreDiagnostic,await page.locator('.fan-scroll').evaluate(root=>{const scroller=[...root.querySelectorAll('*')].find(node=>node.scrollWidth>node.clientWidth+1&&/auto|scroll/.test(getComputedStyle(node).overflowX)),state=root.closest('.continuous-fan').__wxsState;return{actual:scroller.scrollLeft,client:scroller.clientWidth,scrollWidth:scroller.scrollWidth,strip:getComputedStyle(root.querySelector('.continuous-fan-strip')).width,state:{width:state.width,left:state.left,nativeLeft:state.nativeLeft,zoom:state.zoom,restoring:state.restoring},saved:JSON.parse(localStorage.getItem('tarot-miniapp-reading-v1')).data.draft.fanOffset}}));assert.ok(Math.abs(restoredOffset-afterChange)<2,`reload restores the settled fan position: ${afterChange} -> ${restoredOffset}`)
  assert.equal(await page.locator('.continuous-fan-scale').innerText(),zoomLabel,'reload restores zoom')
  await page.emulateMedia({reducedMotion:'reduce'})
  assert.equal(await page.locator('.continuous-fan-back').first().evaluate(node=>getComputedStyle(node).animationName),'none')
  assert.deepEqual(errors,[])
  for(const mode of ['before-forward','during-forward','reduce']){
   const introContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:mode==='reduce'?'reduce':'no-preference'})
   const introPage=await introContext.newPage(),introErrors=[]
   introPage.on('pageerror',error=>introErrors.push(error.message))
   await introPage.route('https://tarot.georgelu.cn/**',route=>{const pathname=new URL(route.request().url()).pathname;if(/^\/assets\/cards\/[mcwsp]\d{2}\.webp$/.test(pathname))return route.fulfill({body:fs.readFileSync(path.join(root,pathname)),contentType:'image/webp'});return route.abort()})
   await introPage.goto('http://127.0.0.1:'+server.address().port)
   await introPage.locator('.floating-nav-item').filter({hasText:/^抽牌$/}).click();await introPage.locator('.spread-item').first().click();await introPage.getByText('开始抽牌',{exact:true}).click();await introPage.locator('.cut-pile').nth(1).waitFor({timeout:10000});await introPage.locator('.cut-pile').nth(1).click();await introPage.locator('.fan-card').last().waitFor({timeout:5000})
   const readOffset=()=>introPage.locator('.fan-scroll').evaluate(root=>[...root.querySelectorAll('*')].find(node=>node.scrollWidth>node.clientWidth+1&&/auto|scroll/.test(getComputedStyle(node).overflowX)).scrollLeft)
   if(mode!=='reduce'){
    if(mode==='during-forward')await introPage.waitForFunction(()=>[...document.querySelector('.fan-scroll').querySelectorAll('*')].some(node=>node.scrollWidth>node.clientWidth+1&&/auto|scroll/.test(getComputedStyle(node).overflowX)&&node.scrollLeft>20))
    await introPage.locator('.fan-scroll').scrollIntoViewIfNeeded();const box=await introPage.locator('.fan-scroll').boundingBox(),input=await introContext.newCDPSession(introPage)
    await input.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+5,id:1}]});await input.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await introPage.waitForTimeout(100)
    const stopped=await readOffset();await introPage.waitForTimeout(2800);assert.ok(Math.abs(await readOffset()-stopped)<1,mode+' touch cancels the actual forward animation immediately and never restarts it');assert.equal(await introPage.locator('.pending-sheet').count(),0,'interrupting blank fan space never picks a card');assert.equal(await introPage.evaluate(()=>JSON.parse(localStorage.getItem('tarot-miniapp-reading-v1')).data.draft.fanIntroSeen),true,'only the current draft records that introduction has been seen');await introPage.reload();await introPage.locator('.fan-card').last().waitFor();await introPage.waitForTimeout(2900);assert.ok(Math.abs(await readOffset()-stopped)<1,'reload never replays a previously cancelled introduction, including offset zero')
   }else{await introPage.waitForTimeout(2900);assert.equal(await readOffset(),0,'reduced-motion preference disables automatic forward scrolling');assert.equal(await introPage.locator('.continuous-fan-back').first().evaluate(node=>getComputedStyle(node).animationName),'none')}
   assert.deepEqual(introErrors,[]);await introContext.close()
  }
  console.log('Actual H5 introduction: real forward-only deck offset; touch cancellation before/during forward; no accidental card; reduced-motion skips automatic scroll passed.')
  console.log('Actual H5 product: 78 mounted; settled tap opens confirmation; CDP swipe + pinch do not select; zoom >140%; 3:5; card77 confirmation + same-offset cancel; saved offset/zoom reload; reduced motion; no JS errors passed.')
 }finally{await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve))}
})().catch(error=>{console.error(error);process.exitCode=1})
