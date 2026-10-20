import type {ContinuousFanWxs} from './continuous-fan'

// uni's H5 Button merges click listeners and drops the WXS owner argument.
// Use actual DOM descriptors on H5; the same gesture module stays native WXS on WeChat.
export function bindH5Fan(runtime:ContinuousFanWxs,root:HTMLElement,callMethod:(name:string,payload:unknown)=>void){
 runtime.setClock(()=>Date.now())
 type WxsElement=HTMLElement&{__wxsState?:Record<string,unknown>,__wxsStyle?:Record<string,string>,__wxsRemoveClass?:string[]}
 const wxsRoot=root as WxsElement
 const state=wxsRoot.__wxsState || (wxsRoot.__wxsState={})
 const describe=(element:HTMLElement)=>({
  setStyle(styles:Record<string,string>){
   // Match this pinned uni runtime's style ledger: a subsequent Vue patch must
   // preserve view-layer zoom, rather than restore stale pre-pinch dimensions.
   const node=element as WxsElement
   node.__wxsStyle={...node.__wxsStyle,...styles}
   for(const key of Object.keys(styles))element.style.setProperty(key,styles[key])
  },
  removeClass(name:string){const node=element as WxsElement;node.__wxsRemoveClass ||= [];if(!node.__wxsRemoveClass.includes(name))node.__wxsRemoveClass.push(name);element.classList.remove(name)}
 })
 const owner={
  getState:()=>state,
  selectComponent(selector:string){const element=root.matches(selector)?root:root.querySelector<HTMLElement>(selector);return element?describe(element):null},
  callMethod,
  requestAnimationFrame(callback:()=>void){return window.requestAnimationFrame(()=>{if(root.isConnected)callback()})}
 }
 const scroller=[root,...Array.from(root.querySelectorAll<HTMLElement>('*'))].find(node=>node.scrollWidth>node.clientWidth+1&&/auto|scroll/.test(getComputedStyle(node).overflowX))
 if(scroller)scroller.style.overscrollBehaviorX='contain'
 let introFrame=0
 const cancelIntro=()=>{if(introFrame)cancelAnimationFrame(introFrame);introFrame=0}
 const animateForward=(target:number,duration:number)=>{
  if(!scroller)return
  cancelIntro();const start=scroller.scrollLeft,started=performance.now()
  const frame=(timestamp:number)=>{if(!root.isConnected)return;const progress=Math.min(1,(timestamp-started)/duration),eased=progress*progress*progress*(10-15*progress+6*progress*progress);scroller.scrollLeft=start+(target-start)*eased;if(progress<1)introFrame=requestAnimationFrame(frame);else introFrame=0}
  introFrame=requestAnimationFrame(frame)
 }
 const handlers={...runtime}
 handlers.tap=(event:unknown)=>runtime.tap(event,owner)
 // Read the actual compositor-owned DOM offset at scroll delivery. Sending it
 // through ScrollView's custom-event normalization is unnecessary on H5.
 // Native WeChat continues to use the WXS scroll binding unchanged.
 const onNativeScroll=()=>{if(scroller)runtime.scroll({detail:{scrollLeft:scroller.scrollLeft}},owner)}
 if(scroller){
  scroller.addEventListener('scroll',onNativeScroll,{passive:true})
  handlers.scroll=()=>{} // Do not paint or reset the settle clock twice.
 }else{
  handlers.scroll=(event:unknown)=>runtime.scroll(event,owner)
 }
 // H5 ScrollView stops bubbling touchmove itself. Capture gestures before that
 // native scroller handler, consuming only two-finger motion.
 const listeners=(['start','move','end','cancel'] as const).map(name=>{
  const type={start:'touchstart',move:'touchmove',end:'touchend',cancel:'touchcancel'}[name]
  const listener=(event:TouchEvent)=>{
   if(name==='start')cancelIntro()
   const result=runtime[name](event,owner)
   if(result===false){if(event.cancelable)event.preventDefault();event.stopPropagation()}
  }
  root.addEventListener(type,listener as EventListener,{capture:true,passive:false})
  handlers[name]=()=>{}
  return {type,listener}
 })
 const interrupt=()=>{cancelIntro();runtime.start({touches:[]},owner)}
 for(const type of ['wheel','pointerdown','keydown'])root.addEventListener(type,interrupt,{capture:true,passive:true})
 handlers.configure=(config:unknown,oldConfig:unknown)=>runtime.configure(config,oldConfig,owner)
 return {handlers,configure:handlers.configure,animateForward,cancelIntro,dispose(){cancelIntro();scroller?.removeEventListener('scroll',onNativeScroll);for(const type of ['wheel','pointerdown','keydown'])root.removeEventListener(type,interrupt,true);for(const {type,listener} of listeners)root.removeEventListener(type,listener as EventListener,true)}}
}
