<template>
 <!-- WXS observes a normal view property. Unknown scroll-view properties do not
      reliably notify its observer on the native renderer. -->
 <view class="continuous-fan intro" :prop="fanConfig" :change:prop="fan.configure">
  <scroll-view class="continuous-fan-scroll fan-scroll" data-fan-scroll="true" :style="{height:(120*zoom+118)+'px'}" :scroll-x="true" :scroll-left="requestedLeft" :scroll-with-animation="introFallback" :enhanced="true" :bounces="false" :show-scrollbar="false" @scroll="fan.scroll" @touchstart="fan.start" @touchmove="fan.move" @touchend="fan.end" @touchcancel="fan.cancel">
   <view class="continuous-fan-strip" :style="stripStyle"><view class="continuous-fan-plane">
    <view v-for="index in indices" :key="index" class="continuous-fan-card fan-card" :class="['fan-item-'+index,{picked:picked.includes(index)}]" :style="cardStyle(index)" :data-index="index" :aria-disabled="disabled || picked.includes(index)" @tap="fan.tap"><button class="continuous-fan-pick" :disabled="disabled || picked.includes(index)" :aria-label="`选择第 ${index+1} 张牌${picked.includes(index)?'，已选':''}`"><view class="continuous-fan-back" aria-hidden="true"></view><text class="continuous-fan-number fan-number">{{index+1}}</text></button></view>
   </view></view>
  </scroll-view>
  <view class="continuous-fan-controls"><text class="continuous-fan-hint">左右滑动 · 双指缩放查看序号</text><view class="continuous-fan-zoom"><button class="continuous-fan-zoom-button" :class="{'is-disabled':zoom<=1}" aria-label="缩小牌扇" :disabled="zoom<=1" @tap="resize(-1)">−</button><text class="continuous-fan-scale" aria-live="polite">{{Math.round(zoom*100)}}%</text><button class="continuous-fan-zoom-button" :class="{'is-disabled':zoom>=2.4}" aria-label="放大牌扇，查看序号" :disabled="zoom>=2.4" @tap="resize(1)">＋</button></view></view>
 </view>
</template>
<script module="fan" lang="wxs" src="./continuous-fan.wxs"></script>
<script lang="ts">
import {defineComponent,markRaw} from 'vue'
// #ifdef H5
import {bindH5Fan} from './continuous-fan-h5'
// #endif
export default defineComponent({
 name:'ContinuousFan',
 props:{picked:{type:Array as ()=>number[],required:true},disabled:{type:Boolean,default:false},initialOffset:{type:Number,default:0},initialZoom:{type:Number,default:1},skipIntro:{type:Boolean,default:false}},
 emits:['choose','interaction','viewport-change','introduced'],
 data(){
  const zoom=Number.isFinite(this.initialZoom)?Math.max(1,Math.min(2.4,this.initialZoom)):1
  const left=Number.isFinite(this.initialOffset)?Math.max(0,this.initialOffset):0
  return {introEnabled:!this.skipIntro,indices:Array.from({length:78},(_,index)=>index),zoom,width:320,pageLeft:0,left,revision:0,requestedLeft:0,stopFanListeners:null as null|(()=>void),introFallback:false,introControl:markRaw({stopped:false,timer:null as ReturnType<typeof setTimeout>|null,context:null as null|{scrollTo:(options:{left:number,animated:boolean,duration?:number})=>void},forward:null as null|((target:number,duration:number)=>void),cancel:null as null|(()=>void)})}
 },
 computed:{
  fanConfig(){return {width:this.width,pageLeft:this.pageLeft,left:this.left,zoom:this.zoom,revision:this.revision,disabled:this.disabled,picked:this.picked,skipIntro:!this.introEnabled}},
  stripStyle():string{
   const step=Math.max(24,Math.min(36,this.width/9))*Math.pow(this.zoom,1.65)
   return `width:${80*this.zoom+77*step+72*this.zoom}px;height:${120*this.zoom+118}px;--fan-edge:${40*this.zoom}px;--fan-step:${step}px;--fan-card-width:${72*this.zoom}px;--fan-card-height:${120*this.zoom}px;--fan-label-size:${Math.round(11+5*(this.zoom-1))}px;--fan-label-opacity:${this.zoom>1.08?1:0}`
  }
 },
 methods:{
  cardStyle(index:number):string{
   const unit=Math.max(-1.2,Math.min(1.2,(40+index*(320/9)+36-160)/160))
   return `left:calc(var(--fan-edge) + ${index} * var(--fan-step));transform:translate3d(0,${30*unit*unit}px,0) rotate(${17*unit}deg);z-index:${index};--unfold-x:${-Math.min(index,10)*12}px;--unfold-delay:${Math.min(index,10)*24}ms`
  },
  // Options API methods are intentional: WXS calls the raw component proxy.
  async onFanChoose(payload:{index:number}){
   await this.onFanInteraction()
   if(!this.disabled && Number.isInteger(payload.index) && payload.index>=0 && payload.index<78 && !this.picked.includes(payload.index))this.$emit('choose',payload.index)
  },
  async onFanInteraction(payload:{left?:number}={}){
   const control=this.introControl;if(control.stopped)return
   control.stopped=true;if(control.timer)clearTimeout(control.timer);control.timer=null;control.cancel?.()
   if(control.context||this.introFallback){
    const left=payload.left ?? await new Promise<number>(resolve=>uni.createSelectorQuery().in(this).select('.continuous-fan-scroll').scrollOffset(result=>resolve((result as {scrollLeft?:number})?.scrollLeft || 0)).exec())
    control.context?.scrollTo({left,animated:false})
    if(this.introFallback){this.introFallback=false;this.requestedLeft=left}
   }
   this.$emit('interaction')
  },
  scheduleIntro(animationName:string){
   const control=this.introControl
   if(!this.introEnabled||control.stopped||animationName==='none'||this.initialOffset>0||this.initialZoom>1||this.picked.length)return
   control.timer=setTimeout(()=>{
    control.timer=null;if(control.stopped)return
    const target=Math.max(24,Math.min(36,this.width/9))*4.5
    if(control.forward)control.forward(target,1200)
    else if(control.context)control.context.scrollTo({left:target,animated:true,duration:1200})
    else{this.introFallback=true;this.requestedLeft=target}
   },1350)
  },
  async onFanZoom(payload:{zoom:number,left:number}){
   // Sync once after a pinch; native inertia and WXS own every intermediate frame.
   this.zoom=Math.max(1,Math.min(2.4,payload.zoom));this.left=Math.max(0,payload.left)
   this.requestedLeft=this.left+.01
   await this.$nextTick()
   this.requestedLeft=this.left;this.revision++
   this.$emit('viewport-change',{offset:this.left,zoom:this.zoom})
  },
  onFanViewport(payload:{offset:number,zoom:number}){this.$emit('viewport-change',payload)},
  async resize(direction:number){
   await this.onFanInteraction()
   this.zoom=Math.round(Math.max(1,Math.min(2.4,this.zoom+direction*.35))*100)/100;this.revision++
  }
 },
 mounted(){this.$nextTick(()=>{
  if(this.introEnabled)this.$emit('introduced')
  // #ifdef H5
  const callbacks={onFanChoose:this.onFanChoose,onFanInteraction:this.onFanInteraction,onFanZoom:this.onFanZoom,onFanViewport:this.onFanViewport}
  const adapter=bindH5Fan(this.fan,this.$el as HTMLElement,(name,payload)=>{
   const callback=callbacks[name as keyof typeof callbacks]
   if(callback)callback(payload as {index:number,zoom:number,left:number,offset:number})
  })
  this.stopFanListeners=adapter.dispose
  this.introControl.forward=adapter.animateForward;this.introControl.cancel=adapter.cancelIntro
  this.fan=adapter.handlers
  this.$forceUpdate()
  this.$watch(()=>this.fanConfig,adapter.configure,{deep:true,immediate:true})
  // #endif
  uni.createSelectorQuery().in(this).select('.continuous-fan-scroll').boundingClientRect(async result=>{
   if(result && !Array.isArray(result) && result.width){this.width=result.width;this.pageLeft=result.left || 0;await this.$nextTick();this.revision++}
  }).exec()
  // Native scroll context keeps the forward demonstration on its compositor.
  // #ifdef MP-WEIXIN
  uni.createSelectorQuery().in(this).select('.continuous-fan-scroll').node(result=>{if(result?.node?.scrollTo)this.introControl.context=result.node}).exec()
  // #endif
  uni.createSelectorQuery().in(this).select('.continuous-fan-back').fields({computedStyle:['animationName']},result=>{this.scheduleIntro((result as {animationName?:string})?.animationName || 'fan-unfold')}).exec()
 })},
 beforeUnmount(){const control=this.introControl;control.stopped=true;if(control.timer)clearTimeout(control.timer);control.cancel?.();this.stopFanListeners?.()}
})
</script>
<style scoped>
.continuous-fan{width:100%;min-width:0;overflow:hidden}.continuous-fan-scroll{width:100%;white-space:nowrap;touch-action:pan-x;overscroll-behavior-x:contain}.continuous-fan-strip{position:relative;box-sizing:border-box;min-height:238px;padding:0;overflow:hidden;transform-origin:left center}.continuous-fan-plane{position:relative;width:100%;height:100%;will-change:transform;transform:translate3d(0,0,0)}.continuous-fan-card{box-sizing:border-box;position:absolute;top:34px;display:block;width:var(--fan-card-width);height:var(--fan-card-height);min-height:0;padding:0;margin:0;line-height:1;border:0;border-radius:6px;overflow:visible;background:transparent;transition:none;transform-origin:50% 85%;backface-visibility:hidden;will-change:transform;color:var(--muted);font:var(--fan-label-size)/1.4 var(--font-body)}.continuous-fan-pick{position:relative;display:block;box-sizing:border-box;width:100%;height:100%;padding:0;margin:0;min-height:0;border:0;border-radius:6px;overflow:visible;background:transparent;transition:none;opacity:1}.continuous-fan-pick::after{border:0}.continuous-fan-back{width:100%;height:100%;box-sizing:border-box;background-image:var(--card-back);background-size:100% 100%;background-repeat:no-repeat;border-radius:6px;box-shadow:0 2px 4px #37273e25,0 0 0 1px #f2e2ab55;backface-visibility:hidden}.continuous-fan-number{position:absolute;left:0;right:0;top:-23px;text-align:center;pointer-events:none;color:var(--accent);font-size:var(--fan-label-size);font-variant-numeric:tabular-nums;opacity:var(--fan-label-opacity,0);transition:opacity .18s ease}.continuous-fan-card.picked .continuous-fan-back{opacity:.22}.continuous-fan-card.picked .continuous-fan-number{color:var(--muted)}.continuous-fan-controls{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 14px 5px;white-space:normal}.continuous-fan-hint{font:11px/1.65 var(--font-body);color:var(--muted)}.continuous-fan-zoom{display:flex;align-items:center;flex-shrink:0;gap:2px}.continuous-fan-zoom-button{box-sizing:border-box;display:flex;align-items:center;justify-content:center;width:40px;height:44px;min-height:44px;padding:0;margin:0;background:transparent;border:0;color:var(--accent);font:20px/1 var(--font-body)}.continuous-fan-zoom-button::after{border:0}.continuous-fan-zoom-button.is-disabled{opacity:.35}.continuous-fan-scale{min-width:32px;text-align:center;font:10px/1.5 var(--font-body);color:var(--muted)}
.intro .continuous-fan-back{animation:fan-unfold 950ms cubic-bezier(.2,.65,.25,1) both;animation-delay:var(--unfold-delay)}
@keyframes fan-unfold{from{opacity:.1;transform:translateX(var(--unfold-x)) translateY(12px) rotate(-7deg)}to{opacity:1;transform:translateX(0) translateY(0) rotate(0)}}

@media(prefers-reduced-motion:reduce){.intro .continuous-fan-back,.intro .continuous-fan-strip{animation:none!important}}
@media(max-width:360px){.continuous-fan-controls{padding-left:10px;padding-right:8px;gap:2px}.continuous-fan-hint{font-size:10px}.continuous-fan-zoom-button{width:32px}}
</style>
