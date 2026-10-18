<template>
 <view class="page">
  <text class="eyebrow">秘境梦屿</text><text class="title">从一幅画，认识一个故事</text>
  <text class="intro">观察经典卡牌里的细节，认识图像与象征。</text>
  <view class="hero"><image class="cover" :src="cardImage('p08')" mode="aspectFit"/><view class="hero-copy"><text class="section">每天学懂一点</text><text class="description">先看画面，再做一道辨认练习。学过的内容，用复习慢慢记住。</text></view><button class="primary" @tap="open('learn')">开始学习　→</button></view>
  <button class="library" @tap="open('library')"><view><text class="section">78 张图像资料</text><text class="description">人物、场景和象征，随时查一查。</text></view><text class="arrow">→</text></button>
  <view class="about"><text class="label">关于这些图像</text><text class="description">{{ provenance.edition }} · {{ provenance.artist }}</text><text class="description">{{ provenance.note }}</text></view>
 </view>
</template>
<script setup lang="ts">
import { provenance } from '../../core/mengyu-catalog'
import { cardImage } from '../../core/mengyu-platform'
function open(page:'learn'|'library') { uni.switchTab({url:'/pages/mengyu/'+page}) }
</script>
<style scoped>
.page{padding:32rpx 32rpx 60rpx;max-width:760px;margin:auto}.eyebrow{font-size:25rpx;color:#796b7c}.title{display:block;font-size:44rpx;line-height:1.5;font-weight:600;margin:18rpx 0}.intro{display:block;color:#796b7c;font-size:28rpx;line-height:1.8;margin-bottom:32rpx}.hero{display:grid;grid-template-columns:108rpx minmax(0,1fr);gap:26rpx;padding:30rpx;background:#eee5ed;border:1rpx solid #dccedc;border-radius:28rpx}.cover{width:108rpx;height:180rpx}.hero-copy{align-self:center;min-width:0}.section{display:block;font-size:33rpx;font-weight:600;line-height:1.5;margin-bottom:12rpx}.description{display:block;color:#796b7c;font-size:27rpx;line-height:1.8;overflow-wrap:anywhere}.primary{grid-column:1/-1;width:100%;margin:0;background:#63485f;color:#fffdf8;border-radius:20rpx;font-size:30rpx;line-height:1.6;padding:22rpx}.library{display:flex;align-items:center;gap:24rpx;text-align:left;line-height:1.6;width:100%;padding:30rpx;margin:28rpx 0 0;background:#fffdf8;border:1rpx solid #ded3df;border-radius:24rpx}.library>view{flex:1;min-width:0}.arrow{color:#63485f;font-size:36rpx}.about{margin-top:40rpx;padding-top:24rpx;border-top:1rpx solid #ded3df}.label{display:block;font-size:27rpx;font-weight:600;margin-bottom:12rpx}.about .description{font-size:24rpx}
</style>
