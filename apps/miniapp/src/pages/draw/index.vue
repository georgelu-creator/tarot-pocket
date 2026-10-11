<template>
 <view class="page">
  <view class="heading"><text class="title">{{ !draft && !record && selectingSpread ? '抽一组牌，听听自己' : (selectedScene?.spreadId === currentSpread.id && !record ? selectedScene.name : currentSpread.name) }}</text><button v-if="draft || record || !selectingSpread" class="text-button" @tap="showSelector">选择牌阵</button></view>
  <template v-if="!draft && !record">
   <template v-if="selectingSpread">
    <text class="muted intro">选一个适合你的牌阵。</text><button v-if="store.draft && store.draft.phase !== 'read'" class="secondary wide" @tap="resume">继续上次的选牌</button>
    <view class="spread-list"><template v-for="(scene,i) in availableScenes" :key="scene.id"><text v-if="i === 0 || sceneGroup(availableScenes[i-1]) !== sceneGroup(scene)" class="catalog-section">{{ sceneGroup(scene) }}</text><button class="spread-item" @tap="chooseScene(scene)"><view class="spread-copy"><text class="name">{{ scene.name }}</text><text class="small muted scene-summary">{{ shortDescription(scene.description) }}</text><text class="small count">{{ getSpread(scene.spreadId).positions.length }} 张</text></view><view class="spread-thumb" :style="thumbGrid(scene.spreadId)" aria-hidden="true"><view v-for="(cell,j) in boardLayout(getSpread(scene.spreadId)).cells" :key="j" class="thumb-card" :style="{gridColumn:String(cell.column),gridRow:String(cell.row)}">☽</view></view><text class="spread-arrow">›</text></button></template></view>
   </template>
   <view v-else class="setup">
    <text class="muted intro">{{ currentSpread.summary }}</text>
    <view v-if="currentSpread.topics?.length > 1" class="topics"><button v-for="t in topicOptions" :key="t.id" :class="{ active: topic === t.id }" @tap="topic = t.id">{{ t.label }}</button></view><text class="label">这次想问什么？（选填）</text><textarea v-model="question" maxlength="3000" auto-height placeholder="写下你的处境或疑问" class="question"/><button class="primary" @tap="start">开始抽牌</button>
   </view>
  </template>
  <template v-else-if="draft && (draft.phase !== 'read' || revealing) && !record">
   <text v-if="draft.question" class="question-summary">{{ draft.question }}</text>
   <view class="ritual-steps"><text v-for="(label,i) in ['洗牌','切牌','选牌','揭牌']" :key="label" :class="{active:ritualStep === i,done:ritualStep > i}">{{ i+1 }} · {{ label }}</text></view>
   <view class="panel ritual-panel" :class="[`phase-${draft.phase}`, {revealing}]">
    <template v-if="['shuffle','shuffling'].includes(draft.phase)">
     <text class="section ritual-title">{{ paused ? '洗牌已暂停' : '让思绪慢慢静下来' }}</text><text class="muted ritual-copy">心里想着这次想了解的事。</text>
     <view class="shuffle-table" :class="{mixing:draft.phase==='shuffling',paused}"><view class="ritual-orbit"></view><view v-for="n in 12" :key="n" class="ritual-back shuffle-card" :style="shuffleStyle(n)"><view class="card-inner"><text class="moon">☽</text><text>✧</text></view></view></view>
     <button v-if="paused" class="primary" @tap="resumeMotion">继续洗牌</button><button v-else-if="draft.phase === 'shuffle'" class="primary" @tap="shuffle">开始洗牌</button><text v-else class="small muted ritual-status" role="status">正在洗牌…</text>
    </template>
    <template v-else-if="['cut','cutting'].includes(draft.phase)">
     <text class="section ritual-title">{{ draft.phase === 'cut' ? '选一叠，完成切牌' : paused ? '切牌已暂停' : '牌叠正在合拢' }}</text><text class="muted ritual-copy">{{ draft.phase === 'cut' ? '凭直觉轻点一叠。' : '把这份心意留在牌中。' }}</text>
     <view class="cut-table" :class="{gathering:draft.phase==='cutting',paused}"><view class="ritual-orbit"></view><button v-for="(offset,i) in [0,26,52]" :key="offset" class="ritual-back cut-pile" :class="{chosen:cutChoice===i}" :style="{'--pile':i}" :disabled="draft.phase !== 'cut'" :aria-label="`选择第 ${i+1} 叠牌`" @tap="cut(offset,i)"><view class="card-inner"><text class="moon">☽</text><text>✧</text></view></button></view>
     <button v-if="paused" class="primary" @tap="resumeMotion">继续切牌</button>
    </template>
    <template v-else>
     <view class="row"><text class="section">{{ ['reveal','read'].includes(draft.phase) ? (revealing ? '牌面正在展开…' : '选好了，可以揭牌了') : `选第 ${draft.picked.length + 1} 张 · ${currentSpread.positions[draft.picked.length]?.label || ''}` }}</text><text class="muted">{{ draft.picked.length }} / {{ currentSpread.positions.length }}</text></view>
     <view class="board" :style="boardStyle"><view v-for="(p,i) in currentSpread.positions" :key="p.id" class="slot" :class="`slot-${i}`" :style="cellStyle(i)"><view class="slot-back" :class="{ filled: draft.picked[i] !== undefined, arriving: arrivingSlot === i }"><text>{{ i + 1 }}</text><text v-if="draft.picked[i] !== undefined" class="star">✦</text></view><text class="slot-label">{{ p.label }}</text></view></view>
     <template v-if="draft.phase === 'pick'">
      <view v-if="showGuide" class="pick-guide"><view><text class="guide-title">凭直觉，选一张喜欢的牌</text><text class="small">左右滑动浏览，轻点暂选。确定后才会放入牌位。</text></view><button class="text-button" @tap="dismissGuide">知道了</button></view>
      <view class="fan" @touchstart="touchStart" @touchmove.stop.prevent="touchMove" @touchend="touchEnd" @touchcancel="touchEnd"><button v-for="(index,offset) in visibleIndices" :key="index" class="fan-card" :class="{ picked: draft.picked.includes(index) }" :style="fanStyle(offset)" :disabled="draft.picked.includes(index) || pending !== null || flying !== null" :aria-label="`选择第 ${index+1} 张牌`" @tap="chooseCard(index)"><view class="card-inner"><text class="moon">☽</text><text class="fan-number">{{ index+1 }}</text><text>✧</text></view></button></view>
      <view class="row paging"><button class="secondary" :disabled="fanStart === 0" @tap="fanStart = Math.max(0,fanStart-13)">上一组</button><text class="small">{{ fanStart+1 }}–{{ Math.min(78,fanStart+13) }} / 78</text><button class="secondary" :disabled="fanStart >= 65" @tap="fanStart = Math.min(65,fanStart+13)">下一组</button></view>
      <slider :value="fanStart" :min="0" :max="65" :step="1" activeColor="#62465f" block-color="#62465f" :block-size="18" @change="changeFan"/>
     </template>
     <button v-if="draft.picked.length" class="text-button undo" :disabled="!!flying || revealing" @tap="undo">撤回刚选的一张</button>
     <button v-if="draft.phase === 'reveal'" class="primary" :disabled="revealing || !!flying" @tap="reveal">{{ revealing ? '牌面正在展开…' : '揭牌，查看解读' }}</button>
    </template>
   </view>
   <view v-if="pending !== null" class="pending-mask" @tap="changeCard"><view class="pending-sheet" role="dialog" aria-modal="true" tabindex="-1" aria-label="确认选牌" @tap.stop><text class="section">把这张牌留在这里？</text><text class="small muted">第 {{ draft.picked.length+1 }} 张 · {{ currentSpread.positions[draft.picked.length]?.label }}</text><view class="ritual-back pending-back"><view class="card-inner"><text class="moon">☽</text><text>✧</text></view></view><button class="primary" @tap="confirmCard">确定</button><button class="text-button change-card" @tap="changeCard">换一张</button></view></view>
   <view v-if="flying" class="ritual-back flying-back" :style="flying"><view class="card-inner"><text class="moon">☽</text><text>✧</text></view></view>

  </template>
  <template v-else-if="record && result">
   <text v-if="record.question" class="question-summary">{{ record.question }}</text>
   <view class="board result-board" :class="{fresh:freshResult}" :style="boardStyle"><view v-for="(c,i) in record.cards" :key="c.id" class="slot" :style="cellStyle(i)"><image :src="cardImage(c.id)" mode="aspectFit" class="face" :style="{animationDelay:`${i*120}ms`}" :class="{ reversed:c.reversed }" @tap="openCard(c.id)"/><text class="slot-label">{{ i+1 }} · {{ currentSpread.positions[i].label }}</text><text class="small muted">{{ cardName(c.id) }} · {{ c.reversed ? '逆位' : '正位' }}</text></view></view>
   <view v-if="day" class="panel daily-result"><text class="daily-date">{{ day.date }}</text><text class="message">{{ day.message }}</text><view class="daily-signs"><view><text class="detail-title">宜</text><text class="paragraph">{{ day.do }}</text></view><view><text class="detail-title">忌</text><text class="paragraph">{{ day.avoid }}</text></view></view><text class="paragraph">{{ day.core }}</text><text class="detail-title">今天可以尝试</text><text class="paragraph">{{ day.advice }}</text><button class="text-button" @tap="openCard(day.id)">查看完整牌义　›</button></view>
   <template v-else>
   <view v-if="result.display !== 'positions'" class="panel"><text class="section">{{ result.overview.title }}</text><text class="paragraph">{{ result.overview.text }}</text></view>
   <view v-for="p in result.positions" :key="p.positionId" class="panel reading-card"><view class="reading-title"><image :src="cardImage(p.cardId)" mode="aspectFit" class="reading-face" :class="{ reversed:p.orientation === 'reversed' }" @tap="openCard(p.cardId)"/><view><text class="section">{{ p.positionLabel }}</text><text class="muted">{{ p.cardName }} · {{ p.orientation === 'reversed' ? '逆位' : '正位' }}</text></view></view><text class="message">暗语 · {{ p.message }}</text><text class="paragraph">{{ p.coreMeaning }}</text><text class="paragraph">{{ p.orientationMeaning }}</text><view v-for="(detail,i) in p.details || []" :key="i"><text class="detail-title">{{ detail.title }}</text><text v-for="(paragraph,j) in detail.paragraphs" :key="j" class="paragraph">{{ paragraph }}</text></view></view>
   <view v-if="result.display !== 'positions' && result.sections?.length" class="panel"><view v-for="s in result.sections" :key="s.id"><text class="detail-title">{{ s.title }}</text><text class="paragraph">{{ s.text }}</text></view></view>
   </template>
   <text class="small muted note">依据牌义、牌位与正逆位整理的本地解读，供你思考和参考。</text>
   <button class="secondary wide" @tap="showSelector">再选一个牌阵</button>
  </template>
  <view v-else-if="record" class="panel"><text class="section">暂时无法显示这次解读</text><text class="paragraph">牌和记录仍然保留，可以返回记录重试。</text><button class="secondary wide" @tap="showSelector">返回牌阵</button></view>
 </view>
</template>
<script setup lang="ts">
import { computed,ref,getCurrentInstance,nextTick,onMounted,onBeforeUnmount } from 'vue'
import { onShow,onHide,onUnload } from '@dcloudio/uni-app'
import { deck } from '../../core/catalogs'
import { readStore,writeStore,cardImage,notify } from '../../core/platform'
import { availableScenes,isProfessionalScene,beginShuffle,beginCut,finishMotion,SHUFFLE_MS,CUT_MS,blankReading,validateReading,createDraft,pickCard,finishReading,dailyDisplay,interpretRecord,getSpread,boardLayout,localDate,READING_KEY,ENTRY_KEY } from '../../core/drawing'
import type { Draft,RecordItem,ReadingStore } from '../../core/drawing'
const store=ref<ReadingStore>(blankReading()),draft=ref<Draft|null>(null),record=ref<RecordItem|null>(null),chosen=ref('one'),question=ref(''),fanStart=ref(0),blocked=ref(false),topic=ref('general')
const selectingSpread=ref(true),selectedScene=ref<any>(null),pending=ref<number|null>(null),showGuide=ref(false),paused=ref(false),cutChoice=ref(-1),flying=ref<any>(null),arrivingSlot=ref(-1),revealing=ref(false),freshResult=ref(false)
const instance=getCurrentInstance()
const GUIDE_KEY='tarot-miniapp-pick-guide-v1'
let motionTimer:ReturnType<typeof setTimeout>|null=null,motionEnd=0,flightTimer:ReturnType<typeof setTimeout>|null=null,revealTimer:ReturnType<typeof setTimeout>|null=null
let touchX=0,touchOrigin=0,dragged=false,suppressTapUntil=0,gestureCancelled=false
// #ifdef H5
let previousFocus:HTMLElement|null=null
function modalKeys(e:KeyboardEvent){if(pending.value===null)return;if(e.key==='Escape'){e.preventDefault();changeCard();return}if(e.key==='Tab'){const nodes=Array.from(document.querySelectorAll<HTMLElement>('.pending-sheet button,.pending-sheet uni-button,.pending-sheet [tabindex]')).filter(x=>!x.hasAttribute('disabled')&&x.getAttribute('aria-disabled')!=='true');if(!nodes.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement?.classList.contains('pending-sheet'))){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}
function pageVisibility(){if(document.visibilityState==='hidden')stopVisuals()}
onMounted(()=>{document.addEventListener('keydown',modalKeys);document.addEventListener('visibilitychange',pageVisibility)})
onBeforeUnmount(()=>{document.removeEventListener('keydown',modalKeys);document.removeEventListener('visibilitychange',pageVisibility)})
// #endif
function sceneGroup(scene:any){if(isProfessionalScene(scene.id))return '通用与专业牌阵';return ({all:'常用牌阵',love:'感情',work:'工作',study:'学业',life:'生活'} as Record<string,string>)[scene.category] || '常用牌阵'}
const ritualStep=computed(()=>!draft.value?0:['shuffle','shuffling'].includes(draft.value.phase)?0:['cut','cutting'].includes(draft.value.phase)?1:draft.value.phase==='pick'?2:3)
function shortDescription(text:string){return text.split(/[。；]/)[0]+'。'}
function thumbGrid(id:string){const l=boardLayout(getSpread(id));return{gridTemplateColumns:`repeat(${l.columns},1fr)`,gridTemplateRows:`repeat(${l.rows},1fr)`}}
function chooseScene(scene:any){if(selectedScene.value?.id!==scene.id)question.value='';selectedScene.value=scene;topic.value=scene.topic;chooseSpread(scene.spreadId)}
function shuffleStyle(n:number){const a=(n-1)*Math.PI*2/12;return{'--sx':`${Math.round(Math.cos(a)*105)}rpx`,'--sy':`${Math.round(Math.sin(a)*65)}rpx`,'--turn':`${n*29}deg`,'--delay':`${-n*.16}s`}}
function touchStart(e:any){touchX=e.touches?.[0]?.clientX||0;touchOrigin=fanStart.value;dragged=false;gestureCancelled=e.touches?.length!==1}
function touchMove(e:any){if(gestureCancelled||e.touches?.length!==1){gestureCancelled=true;return}const dx=(e.touches?.[0]?.clientX||0)-touchX;if(Math.abs(dx)>10){dragged=true;fanStart.value=Math.max(0,Math.min(65,touchOrigin-Math.round(dx/9)))}}
function touchEnd(){if(dragged||gestureCancelled){suppressTapUntil=Date.now()+350;dismissGuide()}dragged=false}
function dismissGuide(){showGuide.value=false;try{writeStore(GUIDE_KEY,true)}catch{notify('引导偏好暂未保存')}}
function pauseMotion(){if(motionTimer){clearTimeout(motionTimer);motionTimer=null;if(draft.value){draft.value.motionRemaining=Math.max(0,motionEnd-Date.now());paused.value=true;save()}}}
function stopVisuals(){pauseMotion();if(flightTimer)clearTimeout(flightTimer);if(revealTimer)clearTimeout(revealTimer);flightTimer=null;revealTimer=null;pending.value=null;flying.value=null;arrivingSlot.value=-1;revealing.value=false}
function runMotion(){const d=draft.value;if(motionTimer||!d||!['shuffling','cutting'].includes(d.phase))return;paused.value=false;const remaining=d.motionRemaining ?? (d.phase==='shuffling'?SHUFFLE_MS:CUT_MS);motionEnd=Date.now()+remaining;motionTimer=setTimeout(()=>{motionTimer=null;if(draft.value!==d)return;finishMotion(d);if(save()&&d.phase==='pick')loadGuide()},remaining)}
function resumeMotion(){if(save())runMotion()}
function shuffle(){if(draft.value&&beginShuffle(draft.value)){if(save())runMotion();else paused.value=true}}
function cut(offset:number,i:number){if(draft.value&&beginCut(draft.value,offset)){cutChoice.value=i;if(save())runMotion();else paused.value=true}}
function loadGuide(){try{showGuide.value=!readStore(GUIDE_KEY,false)}catch{showGuide.value=true}}

const topicOptions=[{id:'general',label:'通用'},{id:'love',label:'感情'},{id:'career',label:'工作'},{id:'study',label:'学业'},{id:'life',label:'生活'}]
const day=computed(()=>dailyDisplay(record.value))
const currentSpread=computed(()=>getSpread(record.value?.spreadId || draft.value?.spreadId || chosen.value))
const result=computed(()=>{if(!record.value)return null;try{return interpretRecord(record.value)}catch{return null}})
const layout=computed(()=>boardLayout(currentSpread.value))
const boardStyle=computed(()=>({gridTemplateColumns:`repeat(${layout.value.columns},minmax(0,1fr))`,gridTemplateRows:`repeat(${layout.value.rows},auto)`}))
const cellStyle=(i:number)=>({gridColumn:String(layout.value.cells[i].column),gridRow:String(layout.value.cells[i].row)})
const visibleIndices=computed(()=>Array.from({length:Math.min(13,78-fanStart.value)},(_,i)=>fanStart.value+i))
function fanStyle(offset:number) { const t=(offset-6)/6; return {left:`${13+offset*(74/12)}%`,top:`${54*t*t+14}rpx`,transform:`translateX(-50%) rotate(${t*24}deg)`,zIndex:offset+1} }
function changeFan(e:any){fanStart.value=Number(e.detail.value)}
function cardName(id:string){return deck.cards.find((c:any)=>c.id===id)?.name || id}
function save(){if(blocked.value){notify('本地记录格式异常，暂未覆盖原记录');return false}try{const next={...store.value,draft:draft.value};writeStore(READING_KEY,next);store.value=next;return true}catch{notify('保存失败，请检查设备储存空间');return false}}
function resume(){stopVisuals();draft.value=store.value.draft;record.value=null;if(draft.value?.phase==='read'){record.value=store.value.history.find(x=>x.id===draft.value?.id)||null;if(!record.value)draft.value.phase='reveal'}if(draft.value&&['shuffling','cutting'].includes(draft.value.phase))paused.value=true;if(draft.value?.phase==='pick')loadGuide()}
function showSelector(){stopVisuals();selectingSpread.value=true;record.value=null;draft.value=null;/* preserve the unfinished draft until a new drawing starts */}
function chooseSpread(id:string){chosen.value=id;selectingSpread.value=false;uni.pageScrollTo({scrollTop:0,duration:200})}
function start(){if(draft.value)return;if(blocked.value)return notify('原记录需要恢复后才能保存新牌');draft.value=createDraft(chosen.value,question.value,null,topic.value);record.value=null;fanStart.value=0;cutChoice.value=-1;if(beginShuffle(draft.value)){if(save())runMotion();else paused.value=true}}
function chooseCard(index:number){if(Date.now()<suppressTapUntil||flying.value||pending.value!==null||!draft.value||draft.value.phase!=='pick'||draft.value.picked.includes(index))return;pending.value=index;dismissGuide();
 // #ifdef H5
 previousFocus=document.activeElement as HTMLElement;nextTick(()=>document.querySelector<HTMLElement>('.pending-sheet')?.focus())
 // #endif
}
function changeCard(){pending.value=null;
 // #ifdef H5
 nextTick(()=>previousFocus?.focus())
 // #endif
}
async function confirmCard(){
 const d=draft.value,index=pending.value;if(!d||index===null)return
 const slot=d.picked.length
 const rects:any=await new Promise(resolve=>{try{const query=uni.createSelectorQuery().in(instance?.proxy as any);query.select('.pending-back').boundingClientRect();query.select(`.slot-${slot} .slot-back`).boundingClientRect();query.exec(resolve)}catch{resolve([])}})
 if(draft.value!==d||pending.value!==index)return
 const oldPicked=[...d.picked],oldPhase=d.phase
 if(!pickCard(d,index))return
 if(!save()){d.picked=oldPicked;d.phase=oldPhase;return}
 pending.value=null;arrivingSlot.value=slot
 if(rects?.[0]&&rects?.[1]){const [from,to]=rects;flying.value={left:`${from.left}px`,top:`${from.top}px`,width:`${from.width}px`,height:`${from.height}px`,'--dx':`${to.left-from.left+(to.width-from.width)/2}px`,'--dy':`${to.top-from.top+(to.height-from.height)/2}px`,'--scale':String(to.width/from.width)}}
 flightTimer=setTimeout(()=>{flying.value=null;arrivingSlot.value=-1;flightTimer=null;
 // #ifdef H5
 nextTick(()=>{const selector=draft.value?.phase==='reveal'?'.ritual-panel .primary':'.fan-card:not([disabled])';document.querySelector<HTMLElement>(selector)?.focus()})
 // #endif
 },720)
}

function undo(){if(!draft.value||flying.value||revealing.value)return;draft.value.picked.pop();draft.value.phase='pick';save()}
function reveal(){
 if(!draft.value || blocked.value||revealing.value||flying.value||draft.value.phase!=='reveal')return
 let finished:ReturnType<typeof finishReading>
 try{finished=finishReading(store.value,draft.value)}catch{notify('解读生成失败，已保留选牌，请重试');return}
 try{writeStore(READING_KEY,finished.store)}catch{notify('保存失败，选好的牌仍在，请检查储存空间后重试');return}
 store.value=finished.store;draft.value=finished.store.draft;if(!draft.value){record.value=finished.record;return}revealing.value=true;freshResult.value=true;revealTimer=setTimeout(()=>{record.value=finished.record;revealing.value=false;revealTimer=null;uni.pageScrollTo({scrollTop:0,duration:300})},600)
}
function openCard(id:string){uni.navigateTo({url:`/pages/card/index?id=${encodeURIComponent(id)}`})}
onHide(stopVisuals)
onUnload(stopVisuals)
onShow(()=>{
 freshResult.value=false
 let raw:any
 try{raw=readStore(READING_KEY,null)}catch{blocked.value=true;notify('暂时无法读取记录，请稍后重新进入');return}
 blocked.value=raw !== null && !validateReading(raw)
 if(blocked.value){notify('本地记录格式异常，原记录未覆盖');return}
 store.value=raw || blankReading()
 if(draft.value?.phase==='read'&&!record.value){draft.value=store.value.draft;record.value=store.value.history.find(x=>x.id===draft.value?.id)||null}
 let entry:any=null
 try{entry=readStore(ENTRY_KEY,null)}catch{notify('暂时无法读取入口，请重新进入')}
 if(entry){try{writeStore(ENTRY_KEY,null)}catch{notify('入口状态暂未保存，请检查储存空间')};if(entry.daily === false){showSelector();return}if(entry.recordId){record.value=store.value.history.find(x=>x.id===entry.recordId)||null;draft.value=null;if(!record.value)notify('没有找到这次记录');return}if(entry.daily){const today=localDate();const existing=store.value.history.find(x=>x.dailyDate===today);if(existing){record.value=existing;draft.value=null;return}record.value=null;draft.value=store.value.draft?.dailyDate===today?store.value.draft:createDraft('daily','',today);fanStart.value=0;if(draft.value.phase==='read'){draft.value.phase='reveal';save();notify('上次解读未保存，可重新揭牌')}if(draft.value.phase==='shuffle'){beginShuffle(draft.value);if(save())runMotion()}else if(['shuffling','cutting'].includes(draft.value.phase))paused.value=true;else if(draft.value.phase==='pick')loadGuide();return}}
 if(!draft.value&&!record.value&&store.value.draft){draft.value=store.value.draft;if(draft.value.phase==='read'){record.value=store.value.history.find(x=>x.id===draft.value?.id)||null;if(!record.value){draft.value.phase='reveal';save();notify('上次解读未保存，可重新揭牌')}}}
 if(draft.value?.phase==='shuffle'){beginShuffle(draft.value);if(save())runMotion()}else if(draft.value&&['shuffling','cutting'].includes(draft.value.phase))paused.value=true;else if(draft.value?.phase==='pick')loadGuide()
})
</script>
<style scoped>
.topics{display:flex;flex-wrap:wrap;gap:12rpx;margin-bottom:24rpx}.topics button{margin:0;padding:12rpx 22rpx;font-size:25rpx;line-height:1.5;background:#fffdf8;color:#62465f;border-radius:30rpx}.topics .active{background:#62465f;color:#fffdf8}.daily-date{display:block;font-size:25rpx;color:#7c7480;margin-bottom:16rpx}.daily-signs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24rpx;padding:20rpx 0;border-bottom:1rpx solid #ded4de}.page{padding:28rpx 28rpx 170rpx;color:#302b32}.heading,.row{display:flex;align-items:center;justify-content:space-between;gap:16rpx}.title{font-size:44rpx;font-weight:600;line-height:1.35;flex:1;min-width:0}.muted{color:#7c7480}.small{font-size:25rpx;line-height:1.6}.intro{display:block;margin:18rpx 0 24rpx;font-size:28rpx;line-height:1.7}.spread-list{display:flex;flex-direction:column;gap:14rpx}.spread-item{display:flex;align-items:center;gap:22rpx;text-align:left;padding:22rpx 24rpx;border:1rpx solid #ded4de;background:#fffdf8;border-radius:22rpx;margin:0;line-height:1.5}.spread-item>view{flex:1;min-width:0}.name{display:block;font-size:31rpx;font-weight:600}.spread-item .small{display:block;margin-top:6rpx}.count{flex-shrink:0;font-size:26rpx;color:#745b70}.selected{border-color:#62465f;background:#eee5ee}.setup{margin-top:26rpx}.label{font-size:28rpx}.question{box-sizing:border-box;width:100%;min-height:140rpx;background:#fffdf8;border:1rpx solid #ded4de;border-radius:20rpx;padding:20rpx;margin:15rpx 0 24rpx;font-size:29rpx}.primary,.secondary{border-radius:20rpx;font-size:29rpx;line-height:1.5;padding:22rpx 26rpx}.primary{background:#62465f;color:#fffdf8;width:100%;margin-top:22rpx}.secondary{background:#fffdf8;border:1rpx solid #d7cad6;color:#62465f;margin:0}.text-button{background:none;color:#62465f;padding:8rpx;margin:0;font-size:26rpx;line-height:1.5;flex-shrink:0}.text-button::after,.fan-card::after{border:0}.panel{background:#fffdf8;border:1rpx solid #dfd5de;border-radius:26rpx;padding:24rpx;margin:22rpx 0;overflow:hidden}.section{display:block;font-size:32rpx;font-weight:600;line-height:1.5}.question-summary{display:block;font-size:29rpx;line-height:1.7;margin:20rpx 0;overflow-wrap:anywhere}.board{display:grid;gap:22rpx 12rpx;margin:24rpx auto;width:100%;align-items:start}.slot{min-width:0;text-align:center;display:flex;flex-direction:column;align-items:center}.slot-back{height:130rpx;width:78rpx;border:2rpx dashed #ac95aa;border-radius:12rpx;background:#eee6ef;display:flex;align-items:center;justify-content:center;color:#62465f;position:relative;font-size:32rpx}.slot-back.filled{background:#62465f;color:#fffdf8;border-style:solid}.star{position:absolute;bottom:10rpx;font-size:19rpx}.slot-label{display:block;font-size:23rpx;line-height:1.5;margin-top:10rpx;overflow-wrap:anywhere}.fan{height:270rpx;position:relative;margin:18rpx -14rpx 0;overflow:visible}.fan-card{width:110rpx;height:180rpx;position:absolute;padding:8rpx;background:#62465f;border-radius:12rpx;box-shadow:0 10rpx 20rpx #35273722;transform-origin:50% 90%;color:#f4e9d7;line-height:1;min-height:0;margin:0}.card-inner{height:100%;box-sizing:border-box;border:1rpx solid #c3aebd;border-radius:7rpx;display:flex;flex-direction:column;align-items:center;justify-content:space-around}.moon{font-size:46rpx}.fan-number{font-size:24rpx}.fan-card.picked{opacity:.18}.paging .secondary{font-size:24rpx;padding:14rpx 18rpx}.undo{display:block;margin:10rpx auto}.face{width:100%;max-width:160rpx;height:225rpx}.reversed{transform:rotate(180deg)}.result-board{margin:30rpx 0}.reading-title{display:flex;align-items:center;gap:24rpx;margin-bottom:18rpx}.reading-face{width:94rpx;height:150rpx;flex-shrink:0}.reading-title .muted{display:block;font-size:27rpx;margin-top:6rpx}.message{display:block;font-size:31rpx;line-height:1.7;font-weight:600;color:#62465f}.paragraph{display:block;font-size:29rpx;line-height:1.9;margin:12rpx 0;overflow-wrap:anywhere}.detail-title{display:block;font-size:29rpx;font-weight:600;margin-top:24rpx;line-height:1.6}.note{display:block;margin:24rpx 0}.wide{width:100%}

/* The same paper-and-plum material remains throughout the separate ritual stages. */
.catalog-section{display:block;margin:30rpx 0 8rpx;font-size:28rpx;font-weight:600;color:#745b70}.spread-copy{flex:1;min-width:0}.spread-item .spread-thumb{flex:0 0 104rpx;width:104rpx;height:106rpx;display:grid;gap:5rpx;padding:12rpx;box-sizing:border-box;background:#eee6ef;border-radius:16rpx;align-items:center;justify-items:center;overflow:hidden}.thumb-card{width:100%;max-width:25rpx;height:100%;max-height:38rpx;min-height:12rpx;background:#62465f;color:#e4d1d8;border-radius:3rpx;display:flex;align-items:center;justify-content:center;font-size:12rpx}.spread-arrow{font-size:40rpx;color:#745b70}.scene-summary{display:-webkit-box!important;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.ritual-steps{display:flex;justify-content:space-between;gap:12rpx;padding:26rpx 0 10rpx;color:#9a8c98;font-size:25rpx}.ritual-steps .active{color:#62465f;font-weight:600}.ritual-steps .done{color:#745b70}.ritual-panel{position:relative;background:radial-gradient(ellipse at 50% 45%,#f0e5ed 0%,#fffdf8 72%)}.ritual-title{text-align:center;margin-top:16rpx}.ritual-copy{display:block;text-align:center;font-size:28rpx;line-height:1.6;margin:12rpx 0}.ritual-status{display:block;text-align:center;margin:24rpx 0}.shuffle-table,.cut-table{height:420rpx;position:relative;margin:24rpx 0}.ritual-orbit{position:absolute;left:15%;top:15%;width:70%;height:70%;border:1rpx solid #c9b5c650;border-radius:50%;transform:rotate(-15deg)}.ritual-orbit:after{content:'';position:absolute;inset:18rpx;border:1rpx solid #c9b5c650;border-radius:50%;transform:rotate(30deg)}.ritual-back{box-sizing:border-box;background:#62465f;color:#f4e9d7;border:2rpx solid #9f829a;border-radius:12rpx;padding:8rpx;box-shadow:0 12rpx 26rpx #35273720}.shuffle-card{position:absolute;width:112rpx;height:186rpx;left:calc(50% - 56rpx);top:calc(50% - 93rpx);transform:translate(var(--sx),var(--sy)) rotate(var(--turn))}.mixing .shuffle-card{animation:mini-shuffle 1.65s ease-in-out infinite;animation-delay:var(--delay)}.paused .shuffle-card,.paused .cut-pile{animation-play-state:paused!important}.cut-pile{position:absolute;left:calc(50% - 55rpx);top:108rpx;width:110rpx;height:182rpx;min-height:0;line-height:1;transform:translateX(calc((var(--pile) - 1)*155rpx));margin:0}.cut-pile:after{border:0}.cut-pile:before{content:'';position:absolute;inset:0;border:1rpx solid #9f829a;border-radius:12rpx;transform:translate(4rpx,5rpx);z-index:-1;box-shadow:4rpx 5rpx 0 #62465f}.gathering .cut-pile{animation:mini-cut 1.2s cubic-bezier(.22,1,.36,1) both}.gathering .cut-pile.chosen{z-index:3}.pick-guide{display:flex;align-items:flex-start;gap:12rpx;background:#eee6ef;border-radius:16rpx;padding:18rpx;margin:18rpx 0;color:#62465f}.pick-guide>view{flex:1;min-width:0}.guide-title{display:block;font-size:27rpx;font-weight:600;margin-bottom:6rpx}.pick-guide .text-button{font-size:24rpx}.fan-card{transition:opacity .22s ease,transform .2s ease}.pending-mask{position:fixed;inset:0;z-index:60;background:#30263278;display:flex;align-items:center;justify-content:center;padding:30rpx;animation:mini-fade .25s ease-out}.pending-sheet{box-sizing:border-box;width:100%;max-width:620rpx;max-height:88vh;overflow:auto;background:#f7f2e9;border:1rpx solid #d7cad6;border-radius:30rpx;padding:32rpx;text-align:center;animation:mini-sheet .45s cubic-bezier(.22,1,.36,1)}.pending-sheet>.small{display:block;margin-top:8rpx}.pending-back{width:180rpx;height:300rpx;margin:28rpx auto}.pending-back .moon{font-size:80rpx}.change-card{display:block;margin:12rpx auto 0}.flying-back{position:fixed;z-index:65;pointer-events:none;transform-origin:center;animation:mini-flight .72s cubic-bezier(.22,1,.36,1) both}.slot-back.arriving{animation:mini-slot .72s ease-out both}.revealing .slot-back.filled{animation:mini-before-reveal .6s ease-in-out both}.fresh .face{animation:mini-reveal .9s cubic-bezier(.22,1,.36,1) backwards}.fresh .face.reversed{animation-name:mini-reveal-reversed}.fresh+.panel{animation:mini-sheet .6s ease-out both}
@keyframes mini-shuffle{0%,100%{transform:translate(var(--sx),var(--sy)) rotate(var(--turn))}30%{transform:translate(calc(var(--sx)*-.85),calc(var(--sy)*1.2)) rotate(calc(var(--turn) + 70deg))}65%{transform:translate(calc(var(--sx)*.3),calc(var(--sy)*-.9)) rotate(calc(var(--turn) - 50deg))}}
@keyframes mini-cut{0%{transform:translateX(calc((var(--pile) - 1)*155rpx))}40%{transform:translate(calc((var(--pile) - 1)*80rpx),-24rpx) rotate(calc((var(--pile) - 1)*-6deg))}100%{transform:translateX(0)}}
@keyframes mini-fade{from{opacity:0}to{opacity:1}}
@keyframes mini-sheet{from{opacity:0;transform:translateY(22rpx)}to{opacity:1;transform:translateY(0)}}
@keyframes mini-flight{from{transform:translate(0,0) scale(1);opacity:1}85%{opacity:1}to{transform:translate(var(--dx),var(--dy)) scale(var(--scale));opacity:0}}
@keyframes mini-slot{0%,75%{opacity:0;transform:scale(.92)}100%{opacity:1;transform:scale(1)}}
@keyframes mini-before-reveal{50%{box-shadow:0 0 28rpx #b89aac88;transform:translateY(-6rpx)}100%{transform:translateY(0)}}
@keyframes mini-reveal{from{opacity:0;transform:perspective(700px) rotateY(-90deg)}to{opacity:1;transform:perspective(700px) rotateY(0)}}
@keyframes mini-reveal-reversed{from{opacity:0;transform:perspective(700px) rotateY(-90deg) rotate(180deg)}to{opacity:1;transform:perspective(700px) rotateY(0) rotate(180deg)}}
@media(min-width:700px){.page{max-width:1000px;margin:auto}.spread-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.catalog-section{grid-column:1/-1}.ritual-panel{max-width:840px;margin:24rpx auto}.fan{height:340rpx}.fan-card{height:210rpx;width:130rpx}.shuffle-table,.cut-table{height:480rpx}}
@media(prefers-reduced-motion:reduce){.mixing .shuffle-card{animation:none}.gathering .cut-pile,.flying-back,.fresh .face,.slot-back.arriving,.pending-sheet,.pending-mask,.revealing .slot-back.filled{animation-duration:.01ms!important;animation-delay:0ms!important}}
</style>
