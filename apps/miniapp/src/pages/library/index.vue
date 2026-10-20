<template>
  <scroll-view class="screen" scroll-y>
    <view class="page">
      <view class="pagehead"><text class="eyebrow">随身参考</text><text class="title">牌库</text><text class="subtitle">查阅牌义、画面与基本牌阵。</text></view>
      <view class="tabs"><button :class="{ active: section === 'cards' }" @tap="section = 'cards'">78 张塔罗牌</button><button :class="{ active: section === 'spreads' }" @tap="section = 'spreads'">基本牌阵</button></view>
      <template v-if="section === 'cards'">
        <input v-model="search" class="search" placeholder="搜索牌名或关键词" confirm-type="search" :maxlength="40" />
        <view class="filter-scroll"><view class="filters"><button v-for="s in suits" :key="s.value" :class="{ active: suit === s.value }" :aria-pressed="suit === s.value" @tap="suit = s.value">{{ s.label }}</button></view></view>
        <view class="grid"><button v-for="card in filteredCards" :key="card.id" class="card" @tap="openCard(card.id)"><view class="picture-frame"><image class="picture" :src="cardImage(card.id)" mode="aspectFit" lazy-load /></view><text class="card-suit">{{ card.suit }}</text><text class="card-name">{{ card.name }}</text><text class="keywords">{{ card.keywords.join(' · ') }}</text></button></view>
        <view v-if="!filteredCards.length" class="empty"><text>没有找到这张牌，换一个牌名或关键词试试。</text><button @tap="reset">查看全部牌</button></view>
      </template>
      <template v-else>
        <view v-for="spread in spreads" :key="spread.id" class="spread">
          <button class="spread-heading" @tap="expanded = expanded === spread.id ? '' : spread.id"><view class="spread-label"><text class="spread-title">{{ spread.name }}</text><text class="muted">{{ spread.bestFor || spread.description || spread.summary }}</text><text class="spread-count">{{ spread.positions.length }} 张牌</text></view><text class="chevron">{{ expanded === spread.id ? '⌄' : '›' }}</text></button>
          <view v-if="expanded === spread.id" class="spread-body">
            <view class="spread-diagram" :style="{ gridTemplateColumns: 'repeat(' + boardLayout(spread).columns + ', minmax(0, 1fr))', gridTemplateRows: 'repeat(' + boardLayout(spread).rows + ', 100rpx)' }"><view v-for="(cell, index) in boardLayout(spread).cells" :key="index" class="diagram-card" :style="{ gridColumn: cell.column, gridRow: cell.row }"><text>{{ index + 1 }}</text></view></view><text v-if="spread.description" class="paragraph">{{ spread.description }}</text>
            <view v-if="spread.bestFor" class="block"><text class="label">适合的问题</text><text class="paragraph">{{ spread.bestFor }}</text></view>
            <view v-for="(position, index) in spread.positions" :key="position.id" class="position"><text class="position-number">{{ index + 1 }}</text><view class="position-copy"><text class="label">{{ position.label }}</text><text class="paragraph">{{ position.question }}</text></view></view>
            <view v-if="spread.avoid" class="block"><text class="label">使用边界</text><text class="paragraph">{{ spread.avoid }}</text></view>
            <text v-if="spread.source?.title" class="source">参考：{{ spread.source.title }}{{ spread.source.note ? '。' + spread.source.note : '' }}</text>
          </view>
        </view>
      </template>
    </view>
  </scroll-view>
  <FloatingNavigation active="library" />
</template>

<script setup lang="ts">
import { hideNativeTabBar } from '../../core/navigation'
onShow(hideNativeTabBar)

import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { deck, spreadContent, scenarios } from '../../core/catalogs'
import { cardImage } from '../../core/platform'
import { boardLayout } from '../../core/drawing'
const section = ref('cards')
const search = ref('')
const suit = ref('')
const expanded = ref('')
const suits = [{ value: '', label: '全部' }, { value: '大阿尔卡纳', label: '大阿尔卡纳' }, { value: '权杖', label: '权杖' }, { value: '圣杯', label: '圣杯' }, { value: '宝剑', label: '宝剑' }, { value: '星币', label: '星币' }]
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
.screen{height:100vh;background:var(--bg)}
.page{max-width:1000px;margin:0 auto;padding:0 18px 130px;color:var(--ink);font-family:var(--font-body);box-sizing:border-box}
.pagehead{margin:0}.eyebrow{display:block;font-size:11px;line-height:1.65;color:var(--muted)}
.title{display:block;font:500 28px/1.3 var(--font-display);margin:0}.subtitle{display:block;font-size:14px;line-height:1.65;color:var(--muted);margin:10px 0 6px}
.tabs{display:flex;gap:3px;background:var(--soft);border-radius:12px;padding:4px;margin:10px 0}
.tabs button{flex:1;min-width:0;margin:0;padding:0 6px;min-height:44px;line-height:44px;font-size:13px;background:transparent;border:0;border-radius:9px;color:var(--ink)}
.tabs button.active{background:var(--paper);color:var(--accent)}
.search{height:48.4px;padding:10px 14px;background:var(--paper);color:var(--ink);border:1px solid var(--control-line);border-radius:10px;box-sizing:border-box;font-size:16px;margin:30px 0 12px;width:calc(100% - 15px)}
.filter-scroll{width:100%;margin:10px 0 14px}.filters{display:flex;flex-wrap:wrap;gap:7px;padding-bottom:3px}
.filters button{flex-shrink:0;margin:0;padding:6px 12px;min-height:44px;line-height:30px;font-size:11px;border:1px solid var(--control-line);border-radius:999px;background:transparent;color:var(--ink)}
.filters button.active{background:var(--accent);border-color:var(--accent);color:var(--paper)}
.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
.card{display:flex;flex-direction:column;justify-content:center;margin:0;padding:6px;background:var(--paper);color:var(--ink);border:1px solid var(--line);border-radius:13px;text-align:left;line-height:1.65;min-width:0;transition:transform .14s var(--ease-settle)}
.card:active{transform:translateY(1px)}.picture-frame{position:relative;width:100%;height:0;padding-bottom:170.6485%;border-radius:6px;overflow:hidden}.picture{position:absolute;left:0;top:0;width:100%;height:100%;display:block}
.card-suit{display:block;font-size:10px;line-height:26.4px;color:var(--muted);margin:5px 1px 0}.card-name{display:block;font-size:14px;font-weight:600;margin:5px 1px 4px;overflow-wrap:anywhere}
.keywords{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;font-size:11px;color:var(--ink);white-space:normal;overflow-wrap:anywhere;line-height:1.6;margin:0 1px 3px}
.empty{padding:30px 10px;text-align:center;font-size:14px;color:var(--muted)}.empty button{margin-top:12px;font-size:13px;background:var(--paper);color:var(--accent);border:1px solid var(--control-line)}
.spread{border-bottom:1px solid var(--line);margin:0;overflow:hidden}
.spread-heading{display:flex;align-items:center;text-align:left;padding:21px 0;margin:0;width:100%;border:0;border-radius:0;background:transparent;color:var(--ink);line-height:1.65;gap:16px}
.spread-label{flex:1;min-width:0}.spread-title{display:block;font-size:16px;font-weight:600}.muted{display:block;font-size:14px;color:var(--muted);margin:5px 0;line-height:1.6;white-space:normal}.spread-count{display:block;font-size:12px;color:var(--muted)}
.chevron{font-size:22px;color:var(--ink);flex-shrink:0;width:21px;text-align:center}.spread-body{padding:0 0 22px}
.spread-diagram{display:grid;gap:6px;width:80%;max-width:220px;margin:16px auto;justify-items:center;align-items:center}.diagram-card{display:flex;align-items:center;justify-content:center;width:29px;height:48px;border:1px solid var(--control-line);border-radius:3px;background-color:var(--accent);background-image:var(--card-back);background-size:100% 100%;color:var(--paper)}.diagram-card text{background:var(--accent);border-radius:50%;width:17px;height:17px;text-align:center;line-height:17px;font-size:11px}
.paragraph{display:block;font-size:14px;line-height:1.8;margin-top:6px;overflow-wrap:anywhere}.block{margin-top:13px}.label{display:block;font-size:17px;font-weight:600}
.position{display:flex;gap:9px;margin-top:13px;align-items:flex-start}.position-number{color:var(--ink);min-width:24px;font-size:16px;line-height:1.8;text-align:center}.position-copy{flex:1;min-width:0}.source{display:block;font-size:12px;color:var(--muted);line-height:1.8;margin-top:14px;overflow-wrap:anywhere}
button::after{border:0}
@media(min-width:601px){.page{padding-left:36px;padding-right:36px}.title{font-size:34px}.grid{gap:18px}.card{padding:12px;border-radius:16px}.card-name{font-size:16px}.keywords{font-size:12px;-webkit-line-clamp:3}.card-suit{margin-top:10px}.tabs{margin:12px 0 16px}}
@media(min-width:800px){.grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(max-width:360px){.page{padding-left:20px;padding-right:20px}.eyebrow{font-size:10px}.title{font-size:24px;line-height:1.25}.subtitle{font-size:12px;line-height:1.45;margin-top:4px}.filter-scroll{margin:7px 0 11px}}
@media(prefers-reduced-motion:reduce){.card{transition:none}}
</style>
