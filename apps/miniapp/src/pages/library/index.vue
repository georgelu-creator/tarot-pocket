<template>
  <scroll-view class="screen" scroll-y>
    <view class="page">
      <text class="title">牌库</text>
      <view class="tabs"><button :class="{ active: section === 'cards' }" @tap="section = 'cards'">塔罗牌 · 78</button><button :class="{ active: section === 'spreads' }" @tap="section = 'spreads'">牌阵</button></view>
      <template v-if="section === 'cards'">
        <input v-model="search" class="search" placeholder="搜索牌名或关键词" confirm-type="search" :maxlength="40" />
        <view class="filters"><button v-for="s in suits" :key="s.value" :class="{ active: suit === s.value }" @tap="suit = s.value">{{ s.label }}</button></view>
        <text class="count">{{ filteredCards.length }} 张牌</text>
        <view class="grid"><button v-for="card in filteredCards" :key="card.id" class="card" @tap="openCard(card.id)"><image class="picture" :src="cardImage(card.id)" mode="aspectFit" lazy-load /><text class="card-name">{{ card.name }}</text><text class="keywords">{{ card.keywords.join(' · ') }}</text></button></view>
        <view v-if="!filteredCards.length" class="empty"><text>没有找到这张牌，换一个牌名或关键词试试。</text><button @tap="reset">查看全部牌</button></view>
      </template>
      <template v-else>
        <text class="intro">按牌数浏览，了解每个牌位回答什么。</text>
        <view v-for="spread in spreads" :key="spread.id" class="spread">
          <button class="spread-heading" @tap="expanded = expanded === spread.id ? '' : spread.id"><view class="spread-label"><text class="spread-title">{{ spread.name }}</text><text class="muted">{{ spread.positions.length }} 张牌 · {{ spread.summary }}</text></view><text class="chevron">{{ expanded === spread.id ? '−' : '+' }}</text></button>
          <view v-if="expanded === spread.id" class="spread-body">
            <text v-if="spread.description" class="paragraph">{{ spread.description }}</text>
            <view v-if="spread.bestFor" class="block"><text class="label">适合的问题</text><text class="paragraph">{{ spread.bestFor }}</text></view>
            <view v-for="(position, index) in spread.positions" :key="position.id" class="position"><text class="position-number">{{ index + 1 }}</text><view class="position-copy"><text class="label">{{ position.label }}</text><text class="paragraph">{{ position.question }}</text></view></view>
            <view v-if="spread.avoid" class="block"><text class="label">使用边界</text><text class="paragraph">{{ spread.avoid }}</text></view>
            <text v-if="spread.source?.title" class="source">参考：{{ spread.source.title }}{{ spread.source.note ? '。' + spread.source.note : '' }}</text>
          </view>
        </view>
      </template>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { deck, spreadContent, scenarios } from '../../core/catalogs'
import { cardImage } from '../../core/platform'
const section = ref('cards')
const search = ref('')
const suit = ref('')
const expanded = ref('')
const suits = [{ value: '', label: '全部' }, { value: '大阿尔卡纳', label: '大牌' }, { value: '权杖', label: '权杖' }, { value: '圣杯', label: '圣杯' }, { value: '宝剑', label: '宝剑' }, { value: '星币', label: '星币' }]
const filteredCards = computed(() => {
  const query = search.value.trim().toLowerCase()
  return deck.cards.filter((card: any) => (!suit.value || card.suit === suit.value) && (!query || [card.name, card.en, ...(card.keywords || [])].join(' ').toLowerCase().includes(query)))
})
const activeIds = new Set(scenarios.map((scenario: any) => scenario.spreadId))
activeIds.add('daily')
const spreads = spreadContent.spreads.filter((spread: any) => activeIds.has(spread.id)).slice().sort((a: any, b: any) => a.positions.length - b.positions.length)
function openCard(id: string) { uni.navigateTo({ url: '/pages/card/index?id=' + encodeURIComponent(id) }) }
function reset() { search.value = ''; suit.value = '' }
</script>

<style scoped>
.screen{height:100vh;background:#f6f1e8}.page{padding:24rpx 28rpx 64rpx;color:#332d34;box-sizing:border-box}.title{display:block;font-size:46rpx;font-weight:600;margin:10rpx 0 24rpx}.tabs{display:flex;background:#e9e0eb;border-radius:22rpx;padding:6rpx;margin-bottom:24rpx}.tabs button{flex:1;font-size:28rpx;line-height:76rpx;background:transparent;border-radius:18rpx;color:#655367}.tabs button.active{background:#fffdf8;color:#583f59}.search{height:84rpx;padding:0 24rpx;background:#fffdf8;border:1rpx solid #ded3df;border-radius:20rpx;box-sizing:border-box;font-size:28rpx}.filters{display:flex;flex-wrap:wrap;gap:10rpx;margin:20rpx 0}.filters button{margin:0;padding:0 20rpx;line-height:62rpx;font-size:24rpx;border-radius:32rpx;background:#fffdf8;color:#655367}.filters button.active{background:#654b65;color:#fffdf8}.count{display:block;color:#827785;font-size:24rpx;margin-bottom:18rpx}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16rpx 12rpx}.card{margin:0;padding:14rpx 8rpx 18rpx;background:#fffdf8;border-radius:18rpx;line-height:1.5;min-width:0}.picture{width:100%;height:238rpx;display:block}.card-name{display:block;font-size:26rpx;font-weight:600;margin:12rpx 0 6rpx;overflow-wrap:anywhere}.keywords{display:block;font-size:20rpx;color:#827785;white-space:normal;overflow-wrap:anywhere}.empty{padding:60rpx 20rpx;text-align:center;font-size:28rpx;color:#827785}.empty button{margin-top:24rpx;font-size:26rpx}.intro{display:block;font-size:26rpx;color:#827785;margin-bottom:22rpx}.spread{background:#fffdf8;border:1rpx solid #ded3df;border-radius:22rpx;margin-bottom:20rpx;overflow:hidden}.spread-heading{display:flex;align-items:center;text-align:left;padding:26rpx 24rpx;margin:0;background:transparent;line-height:1.6;gap:16rpx}.spread-label{flex:1;min-width:0}.spread-title{display:block;font-size:31rpx;font-weight:600}.muted{display:block;font-size:24rpx;color:#827785;margin-top:8rpx;white-space:normal}.chevron{font-size:34rpx;color:#654b65;flex-shrink:0}.spread-body{padding:0 24rpx 28rpx;border-top:1rpx solid #eee6ee}.paragraph{display:block;font-size:28rpx;line-height:1.9;margin-top:12rpx;overflow-wrap:anywhere}.block{margin-top:26rpx}.label{display:block;font-size:28rpx;font-weight:600}.position{display:flex;gap:18rpx;margin-top:26rpx;align-items:flex-start}.position-number{background:#eee5ef;color:#654b65;min-width:48rpx;height:48rpx;line-height:48rpx;text-align:center;border-radius:50%;font-size:25rpx}.position-copy{flex:1;min-width:0}.source{display:block;font-size:23rpx;color:#827785;line-height:1.8;margin-top:28rpx;overflow-wrap:anywhere}button::after{border:0}
</style>
