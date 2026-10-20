'use strict';
// Timing regression: checking settled screenshots cannot catch a one-frame stale arc.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const wxs=fs.readFileSync(path.join(root,'apps/miniapp/src/components/continuous-fan.wxs'),'utf8');
let clock=1000;
const sandbox={module:{exports:{}},Math,getDate:()=>({getTime:()=>clock})};
vm.runInNewContext(wxs,sandbox);const fan=sandbox.module.exports;
const state={},transforms=new Map(),pending=[],bridgeCalls=[];let writes=0;
const owner={getState:()=>state,selectComponent:selector=>({setStyle:styles=>{if(styles.transform){transforms.set(selector,styles.transform);writes++}},removeClass(){}}),requestAnimationFrame:callback=>pending.push(callback),callMethod:(name,value)=>bridgeCalls.push({name,value})};
const config={width:352,pageLeft:0,left:0,zoom:1.35,revision:0,picked:[],disabled:false,skipIntro:true};
// Start at a normal measured viewport without the restore handshake.
fan.configure({...config,zoom:1},null,owner);fan.configure(config,null,owner);
// Zoom sync is an intentional one-shot bridge operation. Acknowledge its native offset.
fan.scroll({detail:{scrollLeft:state.syncTarget||0}},owner);
bridgeCalls.length=0;
function expected(index){const spacing=Math.max(24,Math.min(36,state.width/9))*Math.pow(state.zoom,1.65);const unit=Math.max(-1.2,Math.min(1.2,(40*state.zoom+index*spacing+36*state.zoom-state.left-state.width/2)/(state.width/2)));return `translate3d(0,${Math.round(3000*unit*unit)/100}px,0) rotate(${Math.round(1700*unit)/100}deg)`}
// No RAF is flushed during this burst. Every scroll callback must finish aligned,
// including fast reversals, before the compositor can display that native offset.
for(let frame=0;frame<180;frame++){
 clock+=8;
 const offset=frame<60?frame*37:frame<120?(120-frame)*37:(frame-120)*61;
 fan.scroll({detail:{scrollLeft:offset}},owner);
 assert.equal(state.left,offset,'native offset retained during the same event');
 const spacing=Math.max(24,Math.min(36,state.width/9))*Math.pow(state.zoom,1.65);
 const first=Math.max(0,Math.floor((offset-72*state.zoom-40*state.zoom)/spacing)-2),last=Math.min(77,Math.ceil((offset+state.width-40*state.zoom)/spacing)+2);
 for(let index=first;index<=last;index++)assert.equal(transforms.get('.fan-item-'+index),expected(index),`scroll event ${frame} card ${index}: visible arc must match current native offset before another animation frame`);
 assert.equal(bridgeCalls.length,0,'high-frequency native scroll never calls Vue or persistence');
 assert.equal(pending.length,1,'only the settled-state observer is queued; scroll paint adds no second frame');
}
const before=writes;fan.scroll({detail:{scrollLeft:state.left}},owner);assert.equal(writes,before,'identical offset writes no card transforms');
clock+=250;pending.splice(0).forEach(callback=>callback());
assert.equal(pending.length,0,'settling stops its observer');assert.equal(bridgeCalls.length,1);assert.equal(bridgeCalls[0].name,'onFanViewport');assert.equal(bridgeCalls[0].value.offset,state.left,'one settled persistence update contains final native offset');
console.log('PASS fan scroll timing: 180 fast/reversing native offsets align visible geometry inside each callback, no extra paint frame or Vue calls, one settled persistence');

// Exercise the actual H5 adapter, including subscription and disposal, without
// rebuilding shared outputs or substituting a second geometry implementation.
const ts=require(path.join(root,'apps/miniapp/node_modules/typescript'));
const adapterSource=fs.readFileSync(path.join(root,'apps/miniapp/src/components/continuous-fan-h5.ts'),'utf8');
const compiled=ts.transpileModule(adapterSource,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
function node(selector,{scrollWidth=320,clientWidth=320,overflowX='hidden'}={}){
 const listeners=new Map(),styleValues={};
 return {selector,scrollWidth,clientWidth,scrollLeft:0,isConnected:true,overflowX,style:{setProperty:(key,value)=>styleValues[key]=value},classList:{remove(){}},matches:value=>value===selector,listeners,styleValues,
 addEventListener(type,listener,options){const existing=listeners.get(type)||[];listeners.set(type,[...existing,{listener,options}])},
 removeEventListener(type,listener){listeners.set(type,(listeners.get(type)||[]).filter(item=>item.listener!==listener))},
 dispatch(type){for(const item of listeners.get(type)||[])item.listener({type})}};
}
const domRoot=node('.continuous-fan'),domScroller=node('.native-scroller',{scrollWidth:7000,overflowX:'auto'}),elements=new Map();
for(const selector of ['.continuous-fan-scroll','.continuous-fan-strip','.continuous-fan-plane',...Array.from({length:78},(_,index)=>'.fan-item-'+index)])elements.set(selector,node(selector));
domRoot.querySelector=selector=>elements.get(selector)||null;domRoot.querySelectorAll=()=>[domScroller,...elements.values()];
const h5Frames=[],h5Calls=[];
const adapterScope={exports:{},Date:{now:()=>clock},performance:{now:()=>clock},getComputedStyle:element=>({overflowX:element.overflowX}),window:{requestAnimationFrame:callback=>h5Frames.push(callback)},requestAnimationFrame:callback=>h5Frames.push(callback),cancelAnimationFrame(){}};
vm.runInNewContext(compiled,adapterScope);const adapter=adapterScope.exports.bindH5Fan(fan,domRoot,(name,value)=>h5Calls.push({name,value}));
assert.equal(domScroller.listeners.get('scroll').length,1,'one direct DOM scroll subscription');assert.equal(domScroller.listeners.get('scroll')[0].options.passive,true,'scroll delivery does not block native motion');
adapter.configure({width:320,left:0,zoom:1,revision:0,disabled:false,picked:[],skipIntro:true},null);
for(let index=0;index<120;index++){
 clock+=8;domScroller.scrollLeft=(index*43)%2400;domScroller.dispatch('scroll');
 assert.equal(domRoot.__wxsState.left,domScroller.scrollLeft,'H5 direct event updates from native DOM offset immediately');
 const latest=domRoot.__wxsState.left;adapter.handlers.scroll({detail:{scrollLeft:12345}});assert.equal(domRoot.__wxsState.left,latest,'uni custom scroll forwarding is disabled when direct subscription exists');
 assert.equal(h5Calls.length,0,'DOM scroll bypasses the component bridge');
}
assert.equal(h5Frames.length,1,'H5 burst keeps only one settle observer queued');
clock+=250;h5Frames.splice(0).forEach(callback=>callback());assert.equal(h5Calls.length,1);assert.equal(h5Calls[0].name,'onFanViewport');
adapter.dispose();assert.equal(domScroller.listeners.get('scroll').length,0,'unmount removes native scroll listener');
console.log('PASS H5 adapter timing: passive direct DOM subscription, no duplicate uni forwarding/bridge during burst, one settled write, listener cleanup');

// Sample the product adapter's real animation callback over the entire entry
// timeline. This checks trajectory and interruption without taking screenshots.
const animationFrames=new Map();let animationSerial=0;
const queueAnimation=callback=>{animationFrames.set(++animationSerial,callback);return animationSerial};
adapterScope.requestAnimationFrame=queueAnimation;adapterScope.window.requestAnimationFrame=queueAnimation;adapterScope.cancelAnimationFrame=id=>animationFrames.delete(id);
domRoot.__wxsState={};domScroller.scrollLeft=0;
const timeline=adapterScope.exports.bindH5Fan(fan,domRoot,()=>{});
timeline.configure({width:320,left:0,zoom:1,revision:0,disabled:false,picked:[],skipIntro:false},null);
clock=20000;const unfoldedAt=clock;clock+=1150;timeline.animateForward(160,1200);const movingAt=clock,trajectory=[];
function animateAt(timestamp){clock=timestamp;const current=[...animationFrames.values()];animationFrames.clear();for(const callback of current)callback(timestamp);domScroller.dispatch('scroll');return domScroller.scrollLeft}
for(let elapsed=0;elapsed<=1200;elapsed+=16){const left=animateAt(movingAt+elapsed),progress=elapsed/1200,expected=160*progress*progress*progress*(10-15*progress+6*progress*progress);assert(Math.abs(left-expected)<1e-8,'H5 forward uses the shared zero-speed/zero-acceleration endpoint curve');trajectory.push({elapsed:clock-unfoldedAt,left});}
const overlapping=trajectory.filter(point=>point.elapsed<1800&&point.left>.5);assert(overlapping.length>10,'many moving forward frames overlap the ongoing 1.8 second unfold');for(let index=1;index<trajectory.length;index++)assert(trajectory[index].left>=trajectory[index-1].left,'native offset never rocks backward');assert.equal(domScroller.scrollLeft,160,'full 2.35 second sequence remains at its forward endpoint');
// A touch reaches the same adapter during the moving phase and cancels only
// automatic displacement; its gesture handler remains enabled immediately.
domScroller.scrollLeft=0;clock+=1000;timeline.animateForward(160,1200);const takeoverStart=clock;animateAt(takeoverStart+450);const takeoverLeft=domScroller.scrollLeft;domRoot.dispatch('touchstart');animateAt(takeoverStart+800);animateAt(takeoverStart+1600);assert.equal(domScroller.scrollLeft,takeoverLeft,'touch immediately freezes future automatic forward steps');timeline.dispose();
console.log('PASS continuous entry trajectory: 76 sampled smootherstep offsets, 1.15 s start overlaps 1.8 s unfold, 2.35 s forward endpoint retained, immediate touch takeover');
