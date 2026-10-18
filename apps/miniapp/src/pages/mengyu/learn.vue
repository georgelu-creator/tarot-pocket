<template>
  <scroll-view class="screen" scroll-y :scroll-top="scrollTop" :scroll-into-view="scrollTarget" :scroll-with-animation="scrollAnimated" @scroll="onScroll">
    <view class="page">
      <view v-if="persistence !== 'ready'" class="save-status" :class="{ protected: persistence === 'unreadable' }" role="status">
        <text class="save-title">{{ persistence === 'unreadable' ? '原学习记录暂时无法读取' : '这次进度尚未保存' }}</text>
        <text class="small">{{ persistence === 'unreadable' ? '本次可以临时学习，原记录受保护。请重新打开后再试，当前进度不会覆盖原记录。' : '当前页面保留着你的进度。请重试保存，成功后再离开或刷新。' }}</text>
        <button v-if="persistence === 'unsaved'" class="save-retry" @tap="retrySave">重试保存进度</button>
      </view>
      <template v-if="view === 'home'">
        <text class="title">今天，读懂一幅画</text>
        <view class="panel current">
          <view class="row"><text class="small muted">{{ activeSession ? '接着上次看' : nextIsReview ? '回顾一幅画' : '从这幅画开始' }}</text><text class="small muted">{{ completedCount }} / {{ cards.length }} 幅</text></view>
          <view class="progress"><view class="fill" :style="{ width: completedCount / cards.length * 100 + '%' }" /></view>
          <view class="course-cover"><image class="cover" :src="cardImage(recommended.id)" mode="aspectFit" /><view class="course-copy"><text class="course-title">{{ recommended.name }}</text><text class="description">看看画面，认识一个象征，再试着辨认。</text></view></view>
          <button class="primary" @tap="beginRecommended">{{ activeSession ? '继续学习' : nextIsReview ? '开始回顾' : '开始学习' }}</button>
        </view>
        <button class="catalog-link" @tap="openCatalog"><text>选择其他图像</text><text>›</text></button>
      </template>
      <template v-else-if="view === 'catalog'">
        <view class="header"><button class="link" @tap="back">‹ 返回</button><text class="title">选择一幅画</text></view>
        <view v-for="group in groups" :key="group" class="panel chapter">
          <button class="chapter-heading" :aria-expanded="openedGroup === group" @tap="openedGroup = openedGroup === group ? '' : group"><text>{{ group }}</text><text class="small muted">{{ groupCompleted(group) }} / {{ groupCards(group).length }}　{{ openedGroup === group ? '−' : '+' }}</text></button>
          <view v-if="openedGroup === group"><button v-for="item in groupCards(group)" :key="item.id" class="lesson-link" @tap="start(item.id)"><text>{{ item.name }}</text><text class="small muted">{{ data.progress[item.id] ? '已看过 · 再辨认' : data.paused[item.id] || data.session?.id === item.id ? '继续学习' : '开始学习' }}　›</text></button></view>
        </view>
      </template>
      <template v-else-if="session && artwork && symbol">
        <view class="header"><button class="link" @tap="back">‹ 返回</button><text class="lesson-title">{{ artwork.name }}</text><text class="small muted">{{ Math.min(session.step + 1, 3) }} / 3</text></view>
        <view class="progress"><view class="fill" :style="{ width: Math.min(session.step, 3) / 3 * 100 + '%' }" /></view>
        <button class="artwork-button" aria-label="放大查看图像" @tap="openZoom"><image class="artwork" :src="cardImage(artwork.id)" mode="aspectFit" /></button>
        <text class="image-tip">点图可以放大看细节</text>
        <view v-if="session.step === 0" class="panel lesson-content">
          <text class="eyebrow">看画面</text><text class="heading">先看看画里有什么</text>
          <text class="paragraph">{{ artwork.observation }}</text>
          <view class="hint"><text class="small">试着在画中找到：{{ symbol.label }}</text></view>
          <button class="primary" @tap="advance">认识这个象征</button>
        </view>
        <view v-else-if="session.step === 1" class="panel lesson-content">
          <text class="eyebrow">认识象征</text><text class="heading">{{ symbol.label }}</text>
          <text class="paragraph">{{ symbol.meaning }}</text>
          <text class="small muted">再看一眼画中的这个细节，接下来试着辨认它的含义。</text>
          <button class="primary" @tap="advance">看图辨认</button>
        </view>
        <view v-else-if="session.step === 2" class="panel lesson-content">
          <text class="eyebrow">看图辨认</text><text class="question">刚才看到的「{{ symbol.label }}」，在这幅画的讲解中表达什么？</text>
          <button v-for="option in options" :key="option.id" class="option" :class="{ correct: session.answer && option.id === 'match', incorrect: session.answer === option.id && option.id !== 'match' }" :disabled="!!session.answer" @tap="choose(option.id)">{{ option.text }}</button>
          <view v-if="session.answer" id="recognition-feedback" class="feedback" :class="{ success: session.answer === 'match' }" role="status">
            <text class="heading">{{ session.answer === 'match' ? '认出来了' : '再看看画中的线索' }}</text>
            <text class="paragraph">{{ symbol.label }}：{{ symbol.meaning }}</text>
            <button v-if="session.answer === 'match'" class="primary" @tap="complete">完成这一幅</button><button v-else class="primary" @tap="retry">重新辨认</button>
          </view>
        </view>
        <view v-else class="panel lesson-content completion">
          <text class="eyebrow">完成一次辨认</text><text class="heading">{{ persistence === 'ready' ? '记住了一个画面线索' : '辨认完成，进度尚未保存' }}</text><text class="paragraph">{{ symbol.label }}：{{ symbol.meaning }}</text>
          <text class="small muted">之后会安排再见一面，看看还能不能想起来。</text>
          <button class="primary" @tap="beginRecommended">{{ nextIsReview ? '回顾下一幅' : '继续下一幅' }}</button><button class="link completion-back" @tap="back">返回</button>
        </view>
      </template>
    </view>
  </scroll-view>
  <view v-if="zoom" class="zoom" role="dialog" aria-modal="true" aria-label="查看图像细节" @tap="closeZoom"><button class="zoom-close" @tap.stop="closeZoom">关闭 ×</button><image class="zoom-artwork" :src="cardImage(artwork?.id || '')" mode="aspectFit" @tap.stop /><text>{{ artwork?.name }}</text></view>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { onShow, onHide, onUnload, onBackPress } from '@dcloudio/uni-app'
import { cards } from '../../core/mengyu-catalog'
import { cardImage, notify, readStore, writeStore } from '../../core/mengyu-platform'

type Session = { id: string; step: number; variant: number; answer: string | null; scroll: number }
type Progress = { completedAt: number; visits: number }
type LearningStore = { version: 1; progress: Record<string, Progress>; session: Session | null; paused: Record<string, Session> }
const STORE = 'mengyu-image-learning-v1', DAY = 86400000
const byId = new Map(cards.map(card => [card.id, card]))
function blank(): LearningStore { return { version: 1, progress: {}, session: null, paused: {} } }
function validSession(value: any): value is Session { return !!value && byId.has(value.id) && Number.isInteger(value.step) && value.step >= 0 && value.step <= 3 && Number.isInteger(value.variant) && value.variant >= 0 && value.variant < 10000 && (value.answer === null || ['match', 'alt-0', 'alt-1'].includes(value.answer)) && Number.isFinite(value.scroll) && value.scroll >= 0 }
let readable = true
function initial() {
  try {
    const raw = readStore<any>(STORE, null)
    if (raw === null) return blank()
    if (raw.version !== 1 || !raw.progress || typeof raw.progress !== 'object' || !raw.paused || typeof raw.paused !== 'object' || (raw.session !== null && !validSession(raw.session))) throw Error('unsupported learning data')
    const result = blank()
    for (const [id, value] of Object.entries(raw.progress) as [string, any][]) { if (!byId.has(id) || !Number.isFinite(value?.completedAt) || !Number.isInteger(value?.visits) || value.visits < 1 || value.visits > 10000) throw Error('invalid learning progress'); result.progress[id] = { completedAt: value.completedAt, visits: value.visits } }
    for (const [id, value] of Object.entries(raw.paused)) { if (!validSession(value) || value.id !== id) throw Error('invalid paused learning'); result.paused[id] = { ...value } }
    result.session = raw.session ? { ...raw.session } : null
    return result
  } catch { readable = false; notify('学习记录暂时无法读取，原记录未覆盖。'); return blank() }
}
const data = ref<LearningStore>(initial()), now = ref(Date.now())
const persistence = ref<'ready' | 'unsaved' | 'unreadable'>(readable ? 'ready' : 'unreadable')
const view = ref<'home' | 'catalog' | 'lesson'>('home'), zoom = ref(false), openedGroup = ref(cards[0]?.suit || '')
const scrollTop = ref(0), scrollTarget = ref(''), scrollAnimated = ref(false)
let currentScroll = 0, zoomScroll = 0
const navigation: { view: 'home' | 'catalog' | 'lesson'; scroll: number }[] = []
const session = computed(() => data.value.session)
const artwork = computed(() => session.value ? byId.get(session.value.id) : null)
const symbol = computed(() => { const item = artwork.value; return item ? item.symbols[session.value!.variant % item.symbols.length] : null })
const activeSession = computed(() => session.value && session.value.step < 3 ? session.value : Object.values(data.value.paused).find(item => item.step < 3) || null)
const completedCount = computed(() => Object.keys(data.value.progress).length)
const nextCard = computed(() => {
  const unfinished = cards.find(item => !data.value.progress[item.id])
  const due = cards.filter(item => { const progress = data.value.progress[item.id]; return progress && now.value >= progress.completedAt + [1, 3, 7][Math.min(progress.visits - 1, 2)] * DAY }).sort((a, b) => data.value.progress[a.id].completedAt - data.value.progress[b.id].completedAt)
  return due[0] || unfinished || [...cards].sort((a, b) => data.value.progress[a.id].completedAt - data.value.progress[b.id].completedAt)[0]
})
const recommended = computed(() => byId.get(activeSession.value?.id || '') || nextCard.value)
const nextIsReview = computed(() => !!data.value.progress[recommended.value.id])
const groups = [...new Set(cards.map(item => item.suit))]
function groupCards(group: string) { return cards.filter(item => item.suit === group) }
function groupCompleted(group: string) { return groupCards(group).filter(item => data.value.progress[item.id]).length }
function hash(value: string) { return Array.from(value).reduce((number, letter) => (number * 31 + letter.charCodeAt(0)) >>> 0, 7) }
const options = computed(() => {
  if (!symbol.value || !session.value) return []
  const correct = symbol.value.meaning
  const alternatives = [...new Set(cards.filter(item => item.id !== session.value!.id).flatMap(item => item.symbols.map(detail => detail.meaning)))].filter(text => text !== correct)
  const seed = hash(session.value.id + ':' + session.value.variant), offset = seed % alternatives.length
  const selected = [alternatives[offset], alternatives[(offset + Math.max(1, Math.floor(alternatives.length / 2))) % alternatives.length]]
  return [{ id: 'match', text: correct }, ...selected.map((text, index) => ({ id: 'alt-' + index, text }))].sort((a, b) => hash(a.id + seed) - hash(b.id + seed))
})
function save() { if (!readable) { persistence.value = 'unreadable'; return false }; try { writeStore(STORE, data.value); persistence.value = 'ready'; return true } catch { persistence.value = 'unsaved'; notify('学习进度未能保存，请检查存储空间。'); return false } }
function retrySave() { if (save()) notify('进度已保存') }
function moveScroll(value = 0) { currentScroll = value; scrollAnimated.value = false; scrollTarget.value = ''; scrollTop.value = value + .1; nextTick(() => { scrollTop.value = value }) }
function onScroll(event: any) { currentScroll = event.detail.scrollTop; if (view.value === 'lesson' && session.value) session.value.scroll = currentScroll }
function enterView(target: 'home' | 'catalog' | 'lesson', scroll = 0) { if (view.value !== target) navigation.push({ view: view.value, scroll: currentScroll }); view.value = target; moveScroll(scroll) }
function openCatalog() { openedGroup.value = recommended.value.suit; enterView('catalog') }
function back() { if (zoom.value) { closeZoom(); return true }; if (view.value === 'home') return false; save(); const parent = navigation.pop() || { view: 'home' as const, scroll: 0 }; view.value = parent.view; moveScroll(parent.scroll); return true }
// #ifdef H5
let previousFocus: HTMLElement | null = null
function zoomKeys(event: KeyboardEvent) { if (!zoom.value) return; if (event.key === 'Escape') { event.preventDefault(); closeZoom() } else if (event.key === 'Tab') { event.preventDefault(); document.querySelector<HTMLElement>('.zoom-close')?.focus() } }
onMounted(() => document.addEventListener('keydown', zoomKeys))
onBeforeUnmount(() => document.removeEventListener('keydown', zoomKeys))
// #endif
function openZoom() {
  zoomScroll = currentScroll; zoom.value = true
  // #ifdef H5
  previousFocus = document.activeElement as HTMLElement; nextTick(() => document.querySelector<HTMLElement>('.zoom-close')?.focus())
  // #endif
}
function closeZoom() {
  zoom.value = false; moveScroll(zoomScroll)
  // #ifdef H5
  nextTick(() => previousFocus?.focus())
  // #endif
}
function start(id: string) {
  if (!byId.has(id)) return
  if (session.value?.id === id && session.value.step < 3) { enterView('lesson', session.value.scroll); return }
  if (session.value && session.value.step < 3) data.value.paused[session.value.id] = { ...session.value }
  data.value.session = data.value.paused[id] || { id, step: 0, variant: data.value.progress[id]?.visits || 0, answer: null, scroll: 0 }
  delete data.value.paused[id]; save(); enterView('lesson', session.value!.scroll)
}
function beginRecommended() { start(recommended.value.id) }
function advance() { if (!session.value || session.value.step >= 2) return; session.value.step++; session.value.scroll = 0; save(); moveScroll() }
async function choose(id: string) {
  if (!session.value || session.value.step !== 2 || session.value.answer || !options.value.some(option => option.id === id)) return
  const current = session.value; current.answer = id; save(); scrollTarget.value = ''; await nextTick()
  if (view.value !== 'lesson' || session.value !== current || !current.answer) return
  scrollAnimated.value = true; scrollTarget.value = 'recognition-feedback'
}
function retry() { if (!session.value || session.value.step !== 2 || session.value.answer === 'match') return; session.value.answer = null; save(); moveScroll() }
function complete() {
  const current = session.value
  if (!current || current.step !== 2 || current.answer !== 'match') return
  const before = data.value.progress[current.id]; data.value.progress[current.id] = { completedAt: Date.now(), visits: Math.min(10000, (before?.visits || 0) + 1) }; current.step = 3; current.scroll = 0; now.value = Date.now(); save(); moveScroll()
}
onBackPress(() => back())
onShow(() => { now.value = Date.now() })
onHide(save)
onUnload(save)
</script>

<style scoped>
.save-status{position:sticky;top:0;z-index:8;display:block;padding:22rpx;margin:0 0 24rpx;background:#fff4e7;border:1px solid #dbc6aa;border-radius:18rpx;color:#6a513c}.save-title{display:block;font-size:28rpx;font-weight:600;margin-bottom:8rpx}.save-status.protected{background:#eee7ef;border-color:#d6c8d9;color:#65506a}.save-retry{display:block;margin:16rpx 0 0;padding:12rpx 20rpx;background:#fffaf2;color:#66506c;border:1px solid #c9b6cd;font-size:26rpx;line-height:1.7}
.screen{height:calc(100vh - var(--window-top, 0px) - var(--window-bottom, 0px));background:#f6f1e8;color:#302a32}.page{padding:28rpx 28rpx 80rpx;box-sizing:border-box;max-width:900px;margin:auto}button{font-size:28rpx;line-height:1.6;margin:0;border-radius:20rpx;box-sizing:border-box}button::after{border:0}text{overflow-wrap:anywhere}.title{display:block;font-size:40rpx;font-weight:700;margin:12rpx 0 28rpx}.panel{background:#fffcf7;border:1px solid #e1d7df;border-radius:28rpx;padding:28rpx}.row,.header,.catalog-link,.chapter-heading,.lesson-link{display:flex;justify-content:space-between;align-items:center;gap:18rpx}.small{font-size:25rpx;line-height:1.8}.muted{color:#827985}.progress{height:8rpx;background:#e9e0e8;border-radius:10rpx;overflow:hidden;margin:22rpx 0}.fill{height:100%;background:#8d7391;transition:width .3s ease-out}.course-cover{display:flex;align-items:center;gap:28rpx;margin:30rpx 0}.cover{width:150rpx;height:246rpx;flex-shrink:0}.course-copy{flex:1;min-width:0}.course-title{display:block;font-size:36rpx;font-weight:600;margin-bottom:18rpx}.description{font-size:28rpx;color:#7c7180;line-height:1.8}.primary{display:block;width:100%;background:#66506c;color:#fffaf2;padding:23rpx 18rpx;font-weight:600;margin-top:26rpx}.catalog-link{width:100%;background:transparent;color:#6b526e;text-align:left;padding:26rpx 0}.link{background:transparent;color:#6b526e;padding:12rpx 0;font-size:26rpx;flex-shrink:0}.header .title{font-size:34rpx;margin:0;flex:1}.lesson-title{font-size:31rpx;font-weight:600;flex:1;min-width:0}.header{margin:10rpx 0 28rpx}.chapter{padding:0 24rpx;margin-bottom:20rpx}.chapter-heading{width:100%;background:transparent;color:#302a32;text-align:left;padding:24rpx 0;font-weight:600}.lesson-link{width:100%;background:transparent;text-align:left;color:#302a32;border-top:1px solid #eee6ec;padding:20rpx 0}.lesson-link>text:first-child{flex:1;min-width:0}.artwork-button{display:block;width:220rpx;background:transparent;padding:0;margin:28rpx auto 10rpx;line-height:0}.artwork{display:block;width:220rpx;height:366rpx}.image-tip{display:block;text-align:center;font-size:23rpx;color:#827985;margin-bottom:28rpx}.eyebrow{display:block;color:#827985;font-size:25rpx}.heading{display:block;font-size:34rpx;font-weight:600;line-height:1.6;margin:18rpx 0}.paragraph{display:block;font-size:30rpx;line-height:1.95;margin:18rpx 0;white-space:pre-wrap;overflow-wrap:anywhere}.hint{padding:18rpx 22rpx;background:#eee5ef;color:#66506c;border-radius:18rpx}.question{display:block;font-size:31rpx;font-weight:600;line-height:1.8;margin:20rpx 0 26rpx}.option{display:block;width:100%;padding:22rpx;margin:18rpx 0;background:#f6eff7;border:1px solid #dacddc;color:#382f3b;text-align:left;font-size:28rpx;line-height:1.85;overflow-wrap:anywhere}.option[disabled]{opacity:1;color:#514556}.option.correct{border-color:#668776;background:#e9f0e9}.option.incorrect{border-color:#ac7e86;background:#f4e6e7}.feedback{padding:24rpx;margin-top:24rpx;background:#eee5ef;border-left:5rpx solid #ac7e86;border-radius:18rpx}.feedback.success{border-left-color:#668776}.feedback .heading{font-size:30rpx}.completion-back{display:block;margin:12rpx auto 0}.zoom{position:fixed;inset:0;z-index:30;background:rgba(30,23,34,.96);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff7eb;box-sizing:border-box;padding:38rpx}.zoom-close{position:absolute;right:32rpx;top:32rpx;background:transparent;color:#fff7eb;font-size:28rpx}.zoom-artwork{width:85vw;max-width:600px;height:72vh}.zoom>text{font-size:30rpx;margin-top:22rpx}.lesson-content{animation:arrive .25s ease-out}.completion{animation-duration:.4s}@keyframes arrive{from{opacity:0;transform:translateY(8rpx)}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.lesson-content{animation:none}.fill{transition:none}}
</style>
