<template>
  <scroll-view class="screen" scroll-y>
    <view v-if="card && article && detail" class="page">
      <button class="source-link parent-back" aria-label="返回上一级" @tap="back">‹</button>
      <text class="title">{{ card.name }}</text>
      <view class="hero"><button class="cover" aria-label="放大牌面" @tap="preview"><image class="picture" :class="{ reversed: orientation === 'reversed' }" :src="cardImage(card.id)" mode="aspectFit" /><text class="zoom-label">放大牌面</text></button><view class="hero-copy"><text class="eyebrow">牌库 · 完整参考</text><view class="identity"><text>{{ card.suit }}</text><text>{{ card.number }}</text></view><text class="memory-anchor">{{ meaning.message }}</text><view class="keywords"><text v-for="keyword in card.keywords" :key="keyword">{{ keyword }}</text></view></view></view>
      <view class="section core"><text class="heading">核心含义</text><text class="paragraph">{{ article.core }}</text></view>
      <view class="section"><button class="chapter" :aria-expanded="expanded.scene" @tap="toggle('scene')"><text class="chapter-marker" aria-hidden="true">{{ expanded.scene ? '▾' : '▸' }}</text><text class="heading">画面与象征</text></button><view v-if="expanded.scene"><text class="paragraph">{{ article.observation }}</text><view v-for="symbol in article.symbols" :key="symbol.detail" class="symbol"><text class="label">{{ symbol.detail }}</text><text class="paragraph">{{ symbol.meaning }}</text></view></view></view>
      <view class="orientation"><button :class="{ active: orientation === 'upright' }" @tap="orientation = 'upright'">正位</button><button :class="{ active: orientation === 'reversed' }" @tap="orientation = 'reversed'">逆位</button></view>
      <view class="section meaning"><text class="heading">{{ orientation === 'upright' ? '正位牌义' : '逆位牌义' }}</text><text v-for="(paragraph, index) in meaning.meaning" :key="index" class="paragraph">{{ paragraph }}</text><template v-if="orientation === 'upright'"><text v-for="paragraph in detail?.nuances || []" :key="paragraph" class="paragraph">{{ paragraph }}</text></template><template v-else><view v-for="branch in detail?.reversedBranches || []" :key="branch.title" class="symbol"><text class="label">{{ branch.title }}</text><text class="paragraph">{{ branch.text }}</text></view></template></view>
      <view class="section"><button class="chapter" :aria-expanded="expanded.domains" @tap="toggle('domains')"><text class="chapter-marker" aria-hidden="true">{{ expanded.domains ? '▾' : '▸' }}</text><text class="heading">感情、工作、学业与生活</text></button><view v-if="expanded.domains"><view v-for="context in contexts" :key="context.key" class="domain"><text class="label">{{ context.label }}</text><text v-for="(paragraph, index) in meaning.contexts?.[context.key] || []" :key="index" class="paragraph">{{ paragraph }}</text><text class="paragraph">{{ detail.domains[context.key][orientation] }}</text></view></view></view>
      <view class="section"><button class="chapter" :aria-expanded="expanded.money" @tap="toggle('money')"><text class="chapter-marker" aria-hidden="true">{{ expanded.money ? '▾' : '▸' }}</text><text class="heading">金钱与资源</text></button><text v-if="expanded.money" class="paragraph">{{ detail.domains.money[orientation] }}</text></view>
      <view class="section"><button class="chapter" :aria-expanded="expanded.comparisons" @tap="toggle('comparisons')"><text class="chapter-marker" aria-hidden="true">{{ expanded.comparisons ? '▾' : '▸' }}</text><text class="heading">相近牌的区别</text></button><view v-if="expanded.comparisons"><view v-for="item in detail.comparisons" :key="item.id" class="domain"><text class="paragraph">{{ item.text }}</text><button class="comparison" @tap="openComparison(item.id)">查看{{ cardName(item.id) }}　›</button></view></view></view>
      <view v-if="article.misread" class="section"><button class="chapter" :aria-expanded="expanded.misread" @tap="toggle('misread')"><text class="chapter-marker" aria-hidden="true">{{ expanded.misread ? '▾' : '▸' }}</text><text class="heading">常见误读</text></button><text v-if="expanded.misread" class="paragraph">{{ article.misread }}</text></view>
      <view class="section"><button class="chapter" :aria-expanded="expanded.structure" @tap="toggle('structure')"><text class="chapter-marker" aria-hidden="true">{{ expanded.structure ? '▾' : '▸' }}</text><text class="heading">在整副牌中的位置</text></button><text v-if="expanded.structure" class="paragraph">{{ detail.structure }}</text></view>
      <view class="section"><button class="chapter" :aria-expanded="expanded.examples" @tap="toggle('examples')"><text class="chapter-marker" aria-hidden="true">{{ expanded.examples ? '▾' : '▸' }}</text><text class="heading">情境实例</text></button><view v-if="expanded.examples"><view v-for="example in detail.examples" :key="example.title" class="domain"><text class="label">{{ example.title }}</text><text class="paragraph">{{ example.situation }}</text><text class="paragraph">{{ example.reading }}</text></view><text class="licence">以上为原创虚构例子。</text></view></view>
      <view class="section sources"><button class="chapter" :aria-expanded="expanded.history" @tap="toggle('history')"><text class="chapter-marker" aria-hidden="true">{{ expanded.history ? '▾' : '▸' }}</text><text class="heading">传统出处与延伸理解</text></button><view v-if="expanded.history"><text v-if="article.encyclopedia?.tradition" class="paragraph">{{ article.encyclopedia.tradition }}</text><text v-if="card.element !== '—'" class="paragraph">{{ card.element }}元素</text><text class="paragraph">{{ detail.history.text }}</text><view v-for="source in detail.sources" :key="source.url" class="source"><text class="label">{{ source.title }}</text><text class="paragraph">{{ source.scope }}</text><button class="source-link" @tap="copySource(source.url)">复制来源网址</button></view></view><text class="licence">牌义内容为 Tarot Pocket contributors 原创编辑，采用 CC BY-SA 4.0 许可。历史牌图来源与内容许可各自独立。</text></view>
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
function back() { if (getCurrentPages().length > 1) uni.navigateBack({ delta: 1 }); else uni.switchTab({ url: '/pages/library/index' }) }
</script>

<style scoped>
.screen{height:100vh;background:var(--bg)}.page{position:relative;max-width:820px;margin:0 auto;padding:20px 18px calc(32px + env(safe-area-inset-bottom));color:var(--ink);font-family:var(--font-body);box-sizing:border-box}
.title{display:block;font-family:var(--font-body);font-size:19px;font-weight:600;line-height:1.45;margin:0;padding:12.225px 56px 18.225px 0;min-height:58px;overflow-wrap:anywhere}
.hero{display:flex;align-items:center;gap:16px;margin:18px 0}.cover{display:block;position:relative;margin:0;padding:0;width:126px;height:215px;flex-shrink:0;background:transparent;border-radius:7px;overflow:hidden;box-shadow:0 9px 22px #46334325}
.picture{width:126px;height:215px;display:block;transition:transform var(--motion-flip) var(--ease-settle)}.picture.reversed{transform:rotate(180deg)}
.zoom-label{position:absolute;left:4px;right:4px;bottom:8px;border-radius:5px;background:#392e3ce6;color:var(--paper);font-size:10px;line-height:1.65;padding:5px;text-align:center}
.hero-copy{flex:1;min-width:0}.eyebrow{display:block;font-size:10px;line-height:1.65;letter-spacing:.6px;color:var(--muted)}.identity{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0;font-size:11px;line-height:1.65;color:var(--muted)}.identity>text+text{border-left:1px solid var(--line);padding-left:8px}
.memory-anchor{display:block;font:18px/1.55 var(--font-display);margin:10px 0;overflow-wrap:anywhere}.keywords{display:flex;gap:6px;flex-wrap:wrap;margin:16px 0}.keywords text{font-size:12px;line-height:1.5;background:var(--soft);color:var(--accent);padding:4px 8px;border-radius:4px}
.section{padding:18px 0;border-bottom:1px solid var(--line)}.section.core{padding-top:18px}.heading{display:block;font-size:19px;font-weight:600;line-height:1.6;margin-bottom:10px}.core .heading{font-size:18px;line-height:1.65}
.paragraph{display:block;font-size:14px;line-height:1.9;margin:12px 0;overflow-wrap:anywhere}.symbol{margin-top:16px}.label{display:block;font-size:14px;font-weight:600;line-height:1.65;color:var(--accent)}
.chapter{display:flex;align-items:center;gap:7px;width:100%;padding:4px 0;margin:0;background:transparent;text-align:left;color:var(--ink);line-height:1.6;min-height:44px;border:0;border-radius:0}.chapter .heading{margin:0;flex:1;min-width:0}.chapter-marker{font-size:14px;color:var(--ink);flex:none;width:10px}
.domain{margin:22px 0;padding:0}.domain .label{font-size:15px;color:var(--ink);margin-bottom:8px}.domain .paragraph{margin:8px 0}.domain+.domain{border:0}
.orientation{display:flex;gap:3px;background:var(--soft);border-radius:12px;padding:4px;margin:20px 0 0}.orientation button{flex:1;background:transparent;color:var(--ink);font-size:13px;min-height:44px;line-height:44px;border-radius:9px;border:0;padding:0 6px;margin:0}.orientation button.active{background:var(--paper);color:var(--accent)}
.comparison{margin:12px 0 0;padding:12px 20px;background:var(--paper);color:var(--ink);border:1px solid var(--control-line);font-size:16px;border-radius:var(--radius-button);min-height:48px;line-height:1.65;white-space:normal;max-width:100%}
.sources .paragraph{font-size:14px}.source{margin:20px 0;min-width:0}.source .paragraph{font-size:13px;color:var(--muted)}.source-link{margin:6px 0 0;padding:6px 0;background:transparent;text-align:left;color:var(--accent);font-size:13px;min-height:44px;line-height:1.8}.parent-back{position:absolute;top:24px;right:18px;display:flex;align-items:center;justify-content:center;width:44px;height:44px;margin:0;padding:0;border:1px solid var(--paper);border-radius:50%;background:var(--glass);box-shadow:var(--shadow-float);font:30px/1 var(--font-body)}.licence{display:block;font-size:12px;line-height:1.8;color:var(--muted);margin-top:24px}
.empty{padding:50px 20px;text-align:center;color:var(--muted);font-size:15px}.empty button{margin-top:14px;font-size:14px;background:var(--paper);color:var(--accent);border:1px solid var(--control-line)}
button::after{border:0}
@media(min-width:431px){.page{padding-left:28px;padding-right:28px}.parent-back{right:28px}.hero{gap:24px}.cover{width:175px;height:299px}.picture{width:175px;height:299px}.memory-anchor{font-size:21px}.identity{font-size:12px}.eyebrow{letter-spacing:1px}.section{padding:25px 0}.core .heading{font-size:19px}.paragraph{font-size:15px}}
@media(max-width:360px){.hero{flex-direction:column;text-align:center;gap:14px}.cover{width:156px;height:266px}.picture{width:156px;height:266px}.identity,.keywords{justify-content:center}}
@media(prefers-reduced-motion:reduce){.picture{transition:none}}
</style>
