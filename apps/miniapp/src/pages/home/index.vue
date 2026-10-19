<template>
  <view class="page">
    <text class="eyebrow">秘境梦屿</text>
    <text class="title">从一张牌，听见心里的答案</text>
    <text class="intro">带着问题来，或让牌给今天一点启发。</text>
    <view class="hero">
      <view class="moon">☾</view>
      <text class="hero-title">此刻，想问些什么？</text>
      <text class="description">选择一个牌阵，抽取属于你的牌。</text>
      <button class="primary" @tap="openDraw(false)">开始抽牌　→</button>
    </view>
    <button class="daily" @tap="openDraw(true)"><image v-if="todayCard" class="daily-cover" :class="{ reversed: todayCard.reversed }" :src="cardImage(todayCard.id)" mode="aspectFit"/><view class="daily-copy"><text class="section">塔罗日运</text><template v-if="todayCard"><text class="daily-name">{{ todayCard.name }} · {{ todayCard.reversed ? '逆位' : '正位' }}</text><text class="description">{{ todayCard.message }}</text></template><text v-else class="description">看看今天值得留意的方向</text></view><text>→</text></button>
    <text class="section lower">慢慢认识每一张牌</text>
    <button class="secondary" @tap="openTab('learn')"><image class="cover" :src="cardImage('m02')" mode="aspectFit"/><view class="copy"><text class="section">开始学牌</text><text class="description">跟着课程看画面、做练习，从初级逐步深入。</text></view><text>→</text></button>
    <button class="library" @tap="openTab('library')"><text>查阅牌库与牌阵</text><text>→</text></button>
  </view>
</template>
<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { dailyDisplay, todayReading } from '../../core/drawing'
import { cardImage, loadReadingStore, writeStore, notify } from '../../core/platform'
const latestDaily=ref<any>(null)
const todayCard=computed(()=>dailyDisplay(latestDaily.value))
function refreshDaily(){try{latestDaily.value=todayReading(loadReadingStore())}catch{latestDaily.value=null;notify('暂时无法整理日运，请检查储存空间')}}
onShow(refreshDaily)
onMounted(()=>uni.$on('reading-day-changed',refreshDaily))
onBeforeUnmount(()=>uni.$off('reading-day-changed',refreshDaily))

function openTab(page: string) { uni.switchTab({ url: '/pages/' + page + '/index' }) }
function openDraw(daily: boolean) { try{writeStore('tarot-miniapp-entry-v1', { daily }); openTab('draw')}catch{notify('暂时无法保存入口，请检查储存空间后重试')} }
</script>
<style scoped>
.daily-cover{width:86rpx;height:145rpx;flex-shrink:0}.daily-copy{flex:1;min-width:0}.daily-name{display:block;font-size:29rpx;margin:6rpx 0}.reversed{transform:rotate(180deg)}.page{padding:28rpx 30rpx 48rpx;max-width:760px;margin:auto}.eyebrow{font-size:24rpx;color:#766c79}.title{display:block;font-size:42rpx;font-weight:600;line-height:1.4;margin:14rpx 0}.intro{display:block;color:#766c79;font-size:26rpx;margin-bottom:26rpx}.hero{padding:30rpx;border:1px solid #d9cddd;border-radius:30rpx;background:#e9dfec}.moon{font-size:64rpx;color:#705375;line-height:1}.hero-title{display:block;font-size:34rpx;font-weight:600;margin:12rpx 0}.description{display:block;font-size:25rpx;color:#746a77;line-height:1.65}.primary{margin:24rpx 0 0;padding:12rpx;background:#63485f;color:#fffdf8;border-radius:22rpx}.daily,.secondary,.library{display:flex;align-items:center;justify-content:space-between;gap:20rpx;text-align:left;background:#fffdf8;border:1px solid #e0d7df;border-radius:24rpx;padding:24rpx;margin:18rpx 0 0;line-height:1.5}.section{font-size:30rpx;font-weight:600}.lower{display:block;margin-top:30rpx}.secondary{padding:20rpx}.cover{width:78rpx;height:130rpx;flex-shrink:0}.copy{flex:1;min-width:0}.library{font-size:26rpx;background:transparent;border:0;padding:18rpx 4rpx}
</style>
