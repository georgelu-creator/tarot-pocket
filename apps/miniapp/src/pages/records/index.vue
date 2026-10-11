<template>
 <view class="page"><text class="title">我的牌桌记录</text><text class="intro">每一次抽到的牌，都留在这里。</text>
  <view v-if="invalid" class="empty">本地记录格式异常，原记录已保留，暂时无法显示。</view>
  <view v-else-if="!history.length" class="empty"><text>还没有抽牌记录</text><button class="primary" @tap="goDraw">去抽一组牌</button></view>
  <button v-for="r in history" :key="r.id" class="record" @tap="open(r.id)"><view class="covers"><image v-for="c in r.cards.slice(0,3)" :key="c.id" :src="cardImage(c.id)" mode="aspectFit" class="cover" :class="{ reversed:c.reversed }"/></view><view class="info"><text class="name">{{ getSpread(r.spreadId)?.name }}</text><text class="date">{{ date(r.at) }}{{ r.dailyDate ? ' · 塔罗日运' : '' }}</text><text v-if="r.question" class="question">{{ r.question }}</text><text v-else class="question">{{ r.cards.map(c => cardName(c.id)).join(' · ') }}</text></view><text class="arrow">›</text></button>
  <text v-if="history.length" class="footnote">记录仅保存在当前设备，最近 200 次抽牌可在这里回看。</text>
 </view>
</template>
<script setup lang="ts">
import {ref} from 'vue'
import {onShow} from '@dcloudio/uni-app'
import {readStore,writeStore,cardImage,notify} from '../../core/platform'
import {deck} from '../../core/catalogs'
import {validateReading,getSpread,READING_KEY,ENTRY_KEY} from '../../core/drawing'
import type {RecordItem} from '../../core/drawing'
const history=ref<RecordItem[]>([]),invalid=ref(false)
onShow(()=>{try{const raw:any=readStore(READING_KEY,null);invalid.value=raw!==null&&!validateReading(raw);history.value=!invalid.value&&raw?raw.history:[]}catch{invalid.value=true;history.value=[]}})
const cardName=(id:string)=>deck.cards.find((c:any)=>c.id===id)?.name||id
const date=(at:number)=>{const d=new Date(at);return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`}
function goDraw(){uni.switchTab({url:'/pages/draw/index'})}
function open(recordId:string){try{writeStore(ENTRY_KEY,{recordId});goDraw()}catch{notify('暂时无法打开记录，请检查储存空间')}}
</script>
<style scoped>
.page{padding:28rpx 28rpx 170rpx;color:#302b32}.title{font-size:44rpx;font-weight:600;display:block}.intro{display:block;font-size:28rpx;color:#7c7480;margin:18rpx 0 28rpx}.record{width:100%;box-sizing:border-box;display:flex;align-items:center;gap:20rpx;background:#fffdf8;border:1rpx solid #dfd5de;padding:22rpx;border-radius:24rpx;margin:0 0 18rpx;text-align:left;line-height:1.5}.covers{width:142rpx;height:145rpx;flex-shrink:0;display:flex;align-items:center;justify-content:center}.cover{width:74rpx;height:124rpx;margin-left:-20rpx;flex-shrink:0}.cover:first-child{margin-left:0}.reversed{transform:rotate(180deg)}.info{flex:1;min-width:0}.name{font-size:31rpx;font-weight:600;display:block}.date{display:block;font-size:23rpx;color:#7c7480;margin:7rpx 0}.question{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:26rpx;overflow-wrap:anywhere}.arrow{font-size:38rpx;color:#62465f;flex-shrink:0}.empty{margin-top:40rpx;padding:50rpx 28rpx;text-align:center;font-size:30rpx;background:#fffdf8;border-radius:26rpx;line-height:1.8}.primary{background:#62465f;color:#fffdf8;border-radius:20rpx;font-size:29rpx;padding:20rpx;margin-top:25rpx}.footnote{display:block;color:#7c7480;font-size:24rpx;text-align:center;margin-top:30rpx;line-height:1.6}
</style>
