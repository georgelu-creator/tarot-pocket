<template>
 <view class="page" v-if="card">
  <view class="heading"><button class="back" @tap="back">‹ 返回</button><text class="title">{{ card.name }}</text></view>
  <button class="picture-button" aria-label="放大图像" @tap="zoom=true"><image class="picture" :src="cardImage(card.id)" mode="aspectFit"/></button>
  <text class="identity">{{ card.suit }} · {{ card.number }}</text>
  <view class="section"><text class="label">先看画面</text><text class="paragraph">{{ card.observation }}</text></view>
  <view class="section"><text class="label">图像里的象征</text><view v-for="symbol in card.symbols" :key="symbol.label" class="symbol"><text class="symbol-name">{{ symbol.label }}</text><text class="paragraph">{{ symbol.meaning }}</text></view></view>
  <view class="section"><text class="label">这幅画的主题</text><text class="paragraph">{{ card.core }}</text><text class="paragraph">{{ card.foundation.text }}</text></view>
  <view class="section source"><text class="label">历史图像与来源</text><text class="paragraph">{{ provenance.edition }} · {{ provenance.artist }}</text><text class="paragraph">{{ provenance.note }}</text><text class="paragraph">图像许可记录：{{ source?.license || '见来源页面' }}；原创讲解采用 CC BY-SA 4.0。</text><button class="source-link" @tap="copySource">复制原图来源网址</button></view>
  <button class="secondary" @tap="back">返回刚才的位置</button>
  <view v-if="zoom" class="zoom" role="dialog" aria-label="放大图像" @tap="zoom=false"><button aria-label="关闭放大" class="zoom-close" @tap.stop="zoom=false">×</button><image :src="cardImage(card.id)" mode="aspectFit" @tap.stop/></view>
 </view>
 <view v-else class="empty"><text>没有找到这幅图像。</text><button @tap="back">返回</button></view>
</template>
<script setup lang="ts">
import { computed,ref } from 'vue'
import { onLoad,onBackPress } from '@dcloudio/uni-app'
import { cards,provenance } from '../../core/mengyu-catalog'
import { cardImage,notify } from '../../core/mengyu-platform'
const id=ref(''),zoom=ref(false)
const card=computed(()=>cards.find(c=>c.id===id.value))
const source=computed(()=>provenance.sources.find(s=>s.id===id.value))
onLoad((query:any)=>{id.value=typeof query?.id==='string'?query.id:''})
onBackPress(()=>{if(zoom.value){zoom.value=false;return true}return false})
function back() { if(zoom.value){zoom.value=false;return}if(getCurrentPages().length>1)uni.navigateBack({delta:1});else uni.switchTab({url:'/pages/mengyu/library'}) }
function copySource() { if(source.value)uni.setClipboardData({data:source.value.url,fail:()=>notify('暂时无法复制来源网址')}) }
</script>
<style scoped>
.page{padding:28rpx 30rpx 64rpx;max-width:760px;margin:auto}.heading{display:flex;align-items:center;gap:24rpx}.back{background:none;padding:10rpx 0;margin:0;color:#63485f;font-size:28rpx;line-height:1.6;flex-shrink:0}.title{font-size:42rpx;font-weight:600;line-height:1.5}.picture-button{background:transparent;padding:0;margin:26rpx auto 0;width:250rpx}.picture{width:250rpx;height:416rpx;display:block}.identity{text-align:center;display:block;font-size:26rpx;color:#796b7c;margin:20rpx 0 28rpx}.section{padding:28rpx 0;border-top:1rpx solid #ded3df}.label{display:block;font-size:32rpx;font-weight:600;line-height:1.6}.paragraph{display:block;font-size:29rpx;line-height:1.9;margin-top:16rpx;overflow-wrap:anywhere}.symbol{padding-left:18rpx;border-left:4rpx solid #cbb7cd;margin-top:26rpx}.symbol-name{display:block;font-size:29rpx;font-weight:600}.source .paragraph{font-size:24rpx;color:#796b7c}.source-link{padding:12rpx 0;margin:18rpx 0 0;text-align:left;background:transparent;color:#63485f;font-size:26rpx;line-height:1.8}.secondary{border:1rpx solid #d7cad6;background:#fffdf8;color:#63485f;font-size:28rpx;padding:22rpx;border-radius:20rpx;line-height:1.6}.zoom{position:fixed;inset:0;z-index:1000;background:#251f2bee;display:flex;align-items:center;justify-content:center;padding:100rpx 20rpx}.zoom image{width:100%;height:100%}.zoom-close{position:absolute;right:24rpx;top:28rpx;background:#fffdf8;color:#63485f;border-radius:50%;width:72rpx;height:72rpx;line-height:72rpx;font-size:44rpx;padding:0;margin:0}.empty{padding:80rpx 30rpx;text-align:center;font-size:30rpx;color:#796b7c}.empty button{margin-top:28rpx}
</style>
