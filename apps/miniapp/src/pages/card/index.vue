<template>
  <scroll-view class="screen" scroll-y>
    <view v-if="card && article && detail" class="page">
      <view class="hero"><image class="picture" :class="{ reversed: orientation === 'reversed' }" :src="cardImage(card.id)" mode="aspectFit" @tap="preview" /><view class="hero-copy"><text class="title">{{ card.name }}</text><text class="meta">{{ card.suit }}{{ card.element !== '—' ? ' · ' + card.element + '元素' : '' }}</text><text class="keywords">{{ card.keywords.join(' · ') }}</text><text class="tradition">{{ article.encyclopedia?.tradition }}</text></view></view>
      <text class="core">{{ article.core }}</text>
      <view class="section"><text class="heading">画面与象征</text><text class="paragraph">{{ article.observation }}</text><view v-for="symbol in article.symbols" :key="symbol.detail" class="symbol"><text class="label">{{ symbol.detail }}</text><text class="paragraph">{{ symbol.meaning }}</text></view></view>
      <view class="orientation"><button :class="{ active: orientation === 'upright' }" @tap="orientation = 'upright'">正位</button><button :class="{ active: orientation === 'reversed' }" @tap="orientation = 'reversed'">逆位</button></view>
      <view class="section meaning"><text class="heading">{{ orientation === 'upright' ? '正位牌义' : '逆位牌义' }}</text><text class="message">{{ meaning.message }}</text><text v-for="(paragraph, index) in meaning.meaning" :key="index" class="paragraph">{{ paragraph }}</text><template v-if="orientation === 'upright'"><text v-for="paragraph in detail?.nuances || []" :key="paragraph" class="paragraph">{{ paragraph }}</text></template><template v-else><view v-for="branch in detail?.reversedBranches || []" :key="branch.title" class="symbol"><text class="label">{{ branch.title }}</text><text class="paragraph">{{ branch.text }}</text></view></template></view>
      <view class="section"><button class="chapter" :aria-expanded="expanded.domains" @tap="toggle('domains')"><text class="heading">感情、工作、学业与生活</text><text>{{ expanded.domains ? '−' : '+' }}</text></button><view v-if="expanded.domains"><view v-for="context in contexts" :key="context.key" class="domain"><text class="label">{{ context.label }}</text><text v-for="(paragraph, index) in meaning.contexts?.[context.key] || []" :key="index" class="paragraph">{{ paragraph }}</text><text class="paragraph">{{ detail.domains[context.key][orientation] }}</text></view></view></view>
      <view class="section"><button class="chapter" :aria-expanded="expanded.money" @tap="toggle('money')"><text class="heading">金钱与资源</text><text>{{ expanded.money ? '−' : '+' }}</text></button><text v-if="expanded.money" class="paragraph">{{ detail.domains.money[orientation] }}</text></view>
      <view class="section"><button class="chapter" :aria-expanded="expanded.comparisons" @tap="toggle('comparisons')"><text class="heading">相近牌的区别</text><text>{{ expanded.comparisons ? '−' : '+' }}</text></button><view v-if="expanded.comparisons"><view v-for="item in detail.comparisons" :key="item.id" class="domain"><text class="paragraph">{{ item.text }}</text><button class="comparison" @tap="openComparison(item.id)">查看{{ cardName(item.id) }}　›</button></view></view></view>
      <view v-if="article.misread" class="section"><text class="heading">常见误读</text><text class="paragraph">{{ article.misread }}</text></view>
      <view class="section"><button class="chapter" :aria-expanded="expanded.structure" @tap="toggle('structure')"><text class="heading">在整副牌中的位置</text><text>{{ expanded.structure ? '−' : '+' }}</text></button><text v-if="expanded.structure" class="paragraph">{{ detail.structure }}</text></view>
      <view class="section"><button class="chapter" :aria-expanded="expanded.examples" @tap="toggle('examples')"><text class="heading">情境实例</text><text>{{ expanded.examples ? '−' : '+' }}</text></button><view v-if="expanded.examples"><view v-for="example in detail.examples" :key="example.title" class="domain"><text class="label">{{ example.title }}</text><text class="paragraph">{{ example.situation }}</text><text class="paragraph">{{ example.reading }}</text></view><text class="licence">以上为原创虚构例子。</text></view></view>
      <view class="section sources"><button class="chapter" :aria-expanded="expanded.history" @tap="toggle('history')"><text class="heading">传统出处与延伸理解</text><text>{{ expanded.history ? '−' : '+' }}</text></button><view v-if="expanded.history"><text class="paragraph">{{ detail.history.text }}</text><view v-for="source in detail.sources" :key="source.url" class="source"><text class="label">{{ source.title }}</text><text class="paragraph">{{ source.scope }}</text><button class="source-link" @tap="copySource(source.url)">复制来源网址</button></view></view><text class="licence">牌义内容为 Tarot Pocket contributors 原创编辑，采用 CC BY-SA 4.0 许可。历史牌图来源与内容许可各自独立。</text></view>
    </view>
    <view v-else class="empty"><text>未找到这张牌。</text><button @tap="back">返回牌库</button></view>
  </scroll-view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { deck, reference } from '../../core/catalogs'
// @ts-ignore generated reference stays in the card subpackage
import { knowledge } from './generated/knowledge.mjs'
import { cardImage, notify } from '../../core/platform'
const id = ref('')
const orientation = ref('upright')
const expanded = ref<Record<string, boolean>>({})
function toggle(key: string) { expanded.value[key] = !expanded.value[key] }
const card = computed(() => deck.cards.find((item: any) => item.id === id.value))
const article = computed(() => reference.byId[id.value])
const detail = computed(() => knowledge.byId[id.value])
const meaning = computed(() => article.value?.[orientation.value] || {})
function cardName(cardId: string) { return deck.cards.find((item: any) => item.id === cardId)?.name || '' }
const contexts = [{ key: 'love', label: '感情与关系' }, { key: 'career', label: '事业与工作' }, { key: 'study', label: '学习与成长' }, { key: 'life', label: '日常生活' }]
onLoad((query: any) => { id.value = typeof query?.id === 'string' ? query.id : '' })
function preview() { if (card.value) uni.previewImage({ urls: [cardImage(card.value.id)] }) }
function openComparison(cardId: string) { if (cardName(cardId)) uni.navigateTo({ url: '/pages/card/index?id=' + encodeURIComponent(cardId) }) }
function copySource(url: string) { uni.setClipboardData({ data: url, success: () => notify('来源网址已复制'), fail: () => notify('暂时无法复制来源网址') }) }
function back() { uni.switchTab({ url: '/pages/library/index' }) }
</script>

<style scoped>
.chapter{display:flex;align-items:center;justify-content:space-between;gap:20rpx;width:100%;padding:0;background:transparent;text-align:left;color:inherit;line-height:1.65;min-height:80rpx}.chapter .heading{margin:0;flex:1;min-width:0}.domain{padding:20rpx 0}.domain+.domain{border-top:1rpx solid #ded3df}.chapter>text:last-child{font-size:32rpx;color:#827785}

.screen{height:100vh;background:#f6f1e8}.page{padding:32rpx 30rpx 64rpx;color:#332d34;box-sizing:border-box}.hero{display:flex;align-items:center;gap:30rpx;padding:10rpx 0 24rpx}.picture{width:216rpx;height:360rpx;flex-shrink:0;transition:transform .25s}.picture.reversed{transform:rotate(180deg)}.hero-copy{flex:1;min-width:0}.title{display:block;font-size:44rpx;font-weight:600;line-height:1.4;overflow-wrap:anywhere}.meta{display:block;font-size:25rpx;color:#827785;margin-top:18rpx;line-height:1.7}.keywords{display:block;font-size:26rpx;color:#654b65;line-height:1.8;margin-top:14rpx;overflow-wrap:anywhere}.tradition{display:block;font-size:22rpx;line-height:1.7;color:#827785;margin-top:18rpx;overflow-wrap:anywhere}.core{display:block;padding:26rpx;background:#e9e0eb;border-radius:20rpx;font-size:30rpx;line-height:1.9;margin:12rpx 0 30rpx}.section{padding:28rpx 0;border-bottom:1rpx solid #ded3df}.heading{display:block;font-size:33rpx;font-weight:600;margin-bottom:20rpx}.paragraph{display:block;font-size:29rpx;line-height:1.95;margin:14rpx 0;overflow-wrap:anywhere}.symbol{margin-top:24rpx;padding-left:20rpx;border-left:4rpx solid #cbb7cd}.label{display:block;font-size:28rpx;font-weight:600;line-height:1.7}.orientation{display:flex;background:#e9e0eb;border-radius:20rpx;padding:6rpx;margin:32rpx 0 8rpx}.orientation button{flex:1;background:transparent;color:#655367;font-size:28rpx;line-height:78rpx;border-radius:16rpx}.orientation button.active{background:#fffdf8;color:#583f59}.message{display:block;font-size:31rpx;color:#654b65;line-height:1.8;margin:12rpx 0 22rpx}.comparison{margin:24rpx 0 0;background:#fffdf8;color:#654b65;font-size:28rpx;border-radius:20rpx;line-height:84rpx}.sources .paragraph{font-size:25rpx;color:#827785}.source{margin:20rpx 0 30rpx}.source-link{margin:12rpx 0 0;padding:0;background:transparent;text-align:left;color:#654b65;font-size:25rpx;line-height:56rpx}.licence{display:block;font-size:22rpx;line-height:1.9;color:#827785;margin-top:26rpx}.empty{padding:100rpx 40rpx;text-align:center;color:#827785;font-size:30rpx}.empty button{margin-top:28rpx;font-size:28rpx}button::after{border:0}
</style>
