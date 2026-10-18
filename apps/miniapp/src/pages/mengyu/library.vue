<template>
 <scroll-view class="screen" scroll-y><view class="page">
  <text class="title">图像资料</text><text class="intro">看清一幅画，再认识它的象征。</text>
  <input v-model="search" class="search" placeholder="搜索图像名称或关键词" :maxlength="40" confirm-type="search"/>
  <view class="filters"><button v-for="item in suits" :key="item.value" :class="{active:suit===item.value}" @tap="suit=item.value">{{ item.label }}</button></view>
  <text class="count">{{ filtered.length }} 幅图像</text>
  <view class="grid"><button v-for="card in filtered" :key="card.id" class="card" @tap="openCard(card.id)"><image class="picture" :src="cardImage(card.id)" mode="aspectFit" lazy-load/><text class="name">{{ card.name }}</text><text class="keywords">{{ card.keywords.join(' · ') }}</text></button></view>
  <view v-if="!filtered.length" class="empty"><text>没有找到，换个名称或关键词试试。</text><button @tap="reset">查看全部图像</button></view>
 </view></scroll-view>
</template>
<script setup lang="ts">
import { computed,ref } from 'vue'
import { cards } from '../../core/mengyu-catalog'
import { cardImage } from '../../core/mengyu-platform'
const search=ref(''),suit=ref('')
const suits=[{value:'',label:'全部'},{value:'大阿尔卡纳',label:'大牌'},{value:'权杖',label:'权杖'},{value:'圣杯',label:'圣杯'},{value:'宝剑',label:'宝剑'},{value:'星币',label:'星币'}]
const filtered=computed(()=>{const q=search.value.trim().toLowerCase();return cards.filter(c=>(!suit.value||c.suit===suit.value)&&(!q||[c.name,...c.keywords].join(' ').toLowerCase().includes(q)))})
function openCard(id:string) { uni.navigateTo({url:'/pages/artwork/index?id='+encodeURIComponent(id)}) }
function reset() { search.value='';suit.value='' }
</script>
<style scoped>
.screen{height:100vh;background:#f6f1e8}.page{padding:28rpx 28rpx 60rpx;max-width:760px;margin:auto}.title{display:block;font-size:44rpx;font-weight:600;line-height:1.5}.intro{display:block;font-size:27rpx;line-height:1.8;color:#796b7c;margin:12rpx 0 26rpx}.search{height:84rpx;padding:0 22rpx;background:#fffdf8;border:1rpx solid #ded3df;border-radius:20rpx;font-size:28rpx}.filters{display:flex;flex-wrap:wrap;gap:12rpx;margin:22rpx 0}.filters button{margin:0;padding:10rpx 20rpx;line-height:1.6;font-size:25rpx;border-radius:28rpx;background:#fffdf8;color:#63485f}.filters button.active{background:#63485f;color:#fffdf8}.count{display:block;font-size:25rpx;color:#796b7c;margin-bottom:18rpx}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18rpx 12rpx}.card{min-width:0;padding:14rpx 8rpx 20rpx;margin:0;background:#fffdf8;border-radius:18rpx;line-height:1.5}.picture{display:block;width:100%;height:238rpx}.name{display:block;font-size:26rpx;font-weight:600;margin:12rpx 0 8rpx}.keywords{display:block;font-size:22rpx;color:#796b7c;white-space:normal}.empty{text-align:center;padding:50rpx 0;color:#796b7c;font-size:28rpx;line-height:1.8}.empty button{margin-top:24rpx;font-size:28rpx;color:#63485f}
</style>
