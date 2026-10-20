<template>
  <view class="page home-simple">
    <text class="eyebrow">秘境梦屿</text>
    <text class="title">学会读牌，<text class="home-title-line">也听听自己。</text></text>
    <text class="intro">从零开始学牌，或带着今天的问题抽一组牌。</text>
    <view class="home-decisions">
      <button class="daily" @tap="openDraw(true)"><image v-if="todayCard" class="daily-cover" :class="{ reversed: todayCard.reversed }" :src="cardImage(todayCard.id)" mode="aspectFit"/><view v-else class="daily-orbit" aria-hidden="true">☾</view><view class="daily-copy"><text class="choice-label">每天的一张牌</text><text class="section">塔罗日运</text><template v-if="todayCard"><text class="daily-name">{{ todayCard.name }} · {{ todayCard.reversed ? '逆位' : '正位' }}</text><text class="description">{{ todayCard.message }}</text></template><text v-else class="description">看看今天值得留意的方向</text></view><text class="arrow">→</text></button>
      <view class="hero">
        <button class="primary home-choice reading-choice" @tap="openDraw(false)">
          <view class="home-spread-art" aria-hidden="true"><view v-for="n in 3" :key="n" class="home-card-back" /></view>
          <view class="copy"><text class="choice-label">随身牌桌</text><text class="section">开始抽牌</text><text class="description">选一个想问的问题，洗牌、选牌，看看牌给你的回答。</text></view><text class="arrow">→</text>
        </button>
      </view>
      <button class="secondary home-choice learn-choice" @tap="openTab('learn')"><view class="home-choice-art"><image class="cover" :src="cardImage('p08')" mode="aspectFit"/></view><view class="copy"><text class="choice-label">初级 · 中级 · 高级</text><text class="section">开始学牌</text><text class="description">先看讲解，再试一题。学过的内容，下次接着来。</text></view><text class="arrow">→</text></button>
    </view>
    <button class="library" @tap="openTab('library')"><text>查阅牌库与牌阵</text><text class="arrow">→</text></button>
  </view>
  <FloatingNavigation active="home" />
</template>
<script setup lang="ts">
import { hideNativeTabBar } from '../../core/navigation'
onShow(hideNativeTabBar)

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
.page{padding:20px 20px 100px;max-width:820px;margin:auto;color:var(--ink)}
.eyebrow{display:block;font-size:12px;color:var(--muted);letter-spacing:1px}
.title{display:block;font:500 38px/1.35 var(--font-display);white-space:pre-line;margin:10px 0 0}
.home-title-line{display:block}.intro{display:block;color:var(--muted);font-size:14px;line-height:1.65;margin:12px 0 0}
.home-decisions{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:30px;align-items:stretch}
.hero{min-width:0;grid-column:1}.home-choice{display:flex;flex-direction:column;align-items:flex-start;gap:16px;width:100%;height:100%;text-align:left;padding:26px;border:1px solid var(--line);border-radius:24px;background:var(--paper);color:var(--ink);font-weight:400;box-shadow:none}
.home-spread-art,.home-choice-art{width:100%;height:155px;display:flex;justify-content:center;align-items:center;gap:13px}
.home-card-back{width:55px;height:92px;border-radius:5px;background:var(--accent) var(--card-back) center/100% 100%;box-shadow:var(--shadow-card)}
.home-card-back:first-child{transform:rotate(-7deg) translateY(8px)}.home-card-back:last-child{transform:rotate(7deg) translateY(8px)}
.cover{display:block;width:86px;height:145px;border-radius:6px;box-shadow:var(--shadow-card)}
.copy{flex:1;min-width:0}.choice-label{display:block;color:var(--accent);font-size:12px;line-height:1.5}
.section{display:block;font:500 25px/1.4 var(--font-display);margin:4px 0 6px}
.description{display:block;font-size:13px;color:var(--muted);line-height:1.65}.arrow{color:var(--accent);font-size:22px;flex:none;line-height:1.4;align-self:flex-end}
.learn-choice{grid-column:2;grid-row:2}.daily{grid-column:1/-1;grid-row:1;display:flex;align-items:center;gap:16px;width:100%;text-align:left;padding:20px;border:1px solid var(--line);border-radius:18px;background:var(--paper);color:var(--ink)}
.daily-copy{min-width:0;flex:1}.daily-cover{width:48px;height:78px;flex:none;box-shadow:var(--shadow-card);border-radius:5px}.reversed{transform:rotate(180deg)}.daily-name{display:block;font-size:13px;color:var(--accent);margin-bottom:4px}.daily-orbit{display:flex;align-items:center;justify-content:center;width:48px;height:64px;border:1px solid var(--line);border-radius:50%;font:36px var(--font-display);color:var(--accent);flex:none}.daily .section{font-size:24px}.daily .arrow{align-self:center}
.library{display:flex;align-items:center;justify-content:space-between;width:100%;min-height:48px;padding:14px 0;background:transparent;border:0;border-radius:0;margin-top:10px;color:var(--muted);text-align:left;font-size:14px}.library .arrow{align-self:center}
@media(max-width:600px){.page{padding:10px 20px 100px}.eyebrow{display:none}.title{font-size:28px;line-height:1.25;margin:0}.intro{font-size:13px;line-height:1.55;margin-top:6px}.home-decisions{grid-template-columns:1fr;gap:12px;margin-top:18px}.hero,.learn-choice,.daily{grid-column:1;grid-row:auto}.home-choice{display:flex;flex-direction:row;align-items:center;gap:12px;padding:14px;border-radius:24px}.home-spread-art,.home-choice-art{width:82px;height:102px;flex:none;gap:4px}.home-card-back{width:25px;height:43px}.cover{width:55px;height:91px}.choice-label{font-size:11px}.section{font-size:19px;margin:3px 0}.description{font-size:12px;line-height:1.55}.home-choice .arrow{display:none}.daily{padding:12px 14px;gap:12px;border-radius:16px}.daily .section{font-size:20px}.daily .choice-label{font-size:11px}.daily .description{font-size:12px}.daily-orbit{width:43px;height:52px;font-size:30px}}
</style>
