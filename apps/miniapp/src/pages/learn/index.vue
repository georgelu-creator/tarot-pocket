<template>
  <scroll-view class="screen" scroll-y :scroll-top="scrollTop" :scroll-into-view="scrollTarget" :scroll-with-animation="scrollAnimated" @scroll="onScroll">
    <view class="page">
      <template v-if="view !== 'lesson'">
        <view class="header"><text class="title">{{ view === 'catalog' ? '课程目录' : '今天，继续学一课' }}</text><button v-if="view === 'catalog'" class="link" @tap="goHome">返回上课</button></view>
        <view class="stages"><button v-for="s in stages" :key="s.key" class="stage" :class="{ selected: level === s.key }" @tap="selectLevel(s.key)"><text class="stage-name">{{ s.name }}</text><text class="stage-sub">{{ s.subtitle }}</text></button></view>
        <template v-if="view === 'home'">
          <view class="panel current">
            <view class="row"><text>{{ stageLabel }} · {{ savedSession ? '上次学到这里' : nextItem?.mode === 'practice' || nextItem?.mode === 'review' ? '温习一课' : '当前课程' }}</text><text class="muted">{{ completedCards }} / 78 张</text></view>
            <view class="progress"><view class="fill" :style="{ width: progressPercent + '%' }" /></view>
            <view class="course-cover"><image class="cover" :src="cardImage(coverId)" mode="aspectFit" /><view class="course-info"><text class="small muted">{{ currentChapter }}</text><text class="course-title">{{ text(currentUnit?.title) || '这一阶段已学完' }}</text><text class="description">{{ nextItem?.prerequisite ? '先补上这张牌的基础，再继续本课。' : currentUnit ? stageSubtitle : '可以选择下一阶段，或回到目录温习。' }}</text></view></view>
            <button v-if="currentUnit" class="primary" @tap="continueCourse">{{ savedSession ? '继续上课' : '开始上课' }}</button>
            <button v-else-if="level !== 'A'" class="primary" @tap="selectLevel(level === 'B' ? 'I' : 'A')">进入{{ level === 'B' ? '中级' : '高级' }}</button>
            <button v-else class="primary" @tap="openCatalog">查看课程目录</button>
          </view>
          <view v-if="upNext.length" class="up-next"><text class="section-title">接下来</text><view v-for="node in upNext" :key="node.id" class="next-row"><text>{{ node.title }}</text><text class="small muted">{{ academy.units[node.id].kind === 'lesson' ? '方法课' : stageSubtitle }}</text></view></view>
          <button class="catalog-link" @tap="openCatalog"><text>查看课程目录</text><text class="muted">{{ doneCount }} / {{ route.length }} 课　›</text></button>
        </template>
        <template v-else>
          <view v-for="chapter in chapters" :key="chapter" class="panel chapter">
            <button class="chapter-heading" @tap="openedChapter = openedChapter === chapter ? '' : chapter"><text>{{ chapter }}</text><text class="muted">{{ chapterDone(chapter) }} / {{ chapterNodes(chapter).length }}　{{ openedChapter === chapter ? '−' : '+' }}</text></button>
            <view v-if="openedChapter === chapter"><button v-for="node in chapterNodes(chapter)" :key="node.id" class="lesson-link" @tap="openNode(node)"><text class="number">{{ node.done ? '✓' : route.indexOf(node) + 1 }}</text><view class="lesson-label"><text>{{ node.title }}</text><text class="small muted">{{ node.done ? '已完成 · 可重学' : academy.units[node.id].kind === 'lesson' ? '方法课' : stageSubtitle }}</text></view><text>›</text></button></view>
          </view>
        </template>
      </template>
      <template v-else-if="session && unit">
        <view class="lesson-header"><button class="link" @tap="goHome">‹ 返回课程</button><text class="lesson-heading">{{ text(unit.title) }}</text><text class="small muted">{{ Math.min(session.index + 1, plan.length) }} / {{ plan.length }}</text></view>
        <view class="progress"><view class="fill" :style="{ width: session.index / plan.length * 100 + '%' }" /></view>
        <view v-if="unit.id === 'B03'" class="suits"><view v-for="suit in suits" :key="suit[0]"><text>{{ suit[0] }}</text><text class="muted">{{ suit[1] }}</text></view></view>
        <view v-else-if="shownCards.length" class="cards" :class="{ many: shownCards.length > 3, choice: unit.id === 'A05', cross: unit.id === 'A06' }">
          <view v-for="(id, index) in shownCards" :key="index" class="card-item" :class="{ crossing: unit.id === 'A06' && index === 1 }" :style="cardPosition(index)"><image class="card-picture" :class="{ reversed: reversedCard(id) }" :src="cardImage(id)" mode="aspectFit" @tap="openZoom(id)" /><text class="card-caption">{{ cardCaption(id, index) }}{{ reversedCard(id) ? ' · 逆位' : '' }}</text></view>
        </view>
        <view v-if="unit.id !== 'B03' && shownCards.length && !zoomTipDismissed" class="zoom-tip"><text>点一下牌图，可以放大看细节。</text><button class="link" @tap="dismissZoomTip">知道了</button></view>
        <view v-if="session.complete" :key="lessonKey" class="panel lesson-content lesson-complete">
          <text class="small muted">本轮学习完成</text><text class="heading">{{ text(unit.title) }}</text><text class="paragraph">{{ text(unit.summary) }}</text>
          <text v-if="unit.kind === 'card'" class="result-label">{{ academy.masteryState(data.progress[unit.id]).label }}</text>
          <text v-if="hasPending" class="paragraph muted">需要再练的内容已安排复习，下次继续巩固。</text>
          <button class="primary" @tap="continueCourse">继续下一课</button><button class="secondary" @tap="goHome">返回课程</button>
        </view>
        <view v-else-if="step" :key="lessonKey" class="panel lesson-content">
          <template v-if="step.kind !== 'question'">
            <text class="small muted">{{ step.support ? '换个例子，继续理解' : step.reversed ? '在这个例子里读逆位' : '先看讲解' }}</text>
            <view v-for="(paragraph, index) in step.content" :key="index" class="teaching"><text v-if="unit.kind === 'card' && step.key === 'T1' && !step.support" class="section-title">{{ ['核心意思', '画面线索', '记忆线索'][index] || '理解这张牌' }}</text><text class="paragraph">{{ text(paragraph) }}</text></view>
            <view v-if="lessonInsight" class="knowledge"><text class="section-title">{{ lessonInsight.title }}</text><text class="paragraph">{{ lessonInsight.text }}</text></view>
            <button class="primary" @tap="nextStep">继续</button>
          </template>
          <template v-else>
            <text class="small muted">{{ step.support ? '换个例子试试' : '做一道练习' }}</text><text class="question">{{ text(step.question.prompt) }}</text>
            <button v-for="option in options" :key="option.id" class="option" :class="{ correct: answered && option.id === step.question.correct, incorrect: answered && option.id === answered.selected && !answered.correct }" :disabled="!!answered" @tap="choose(option.id)"><text>{{ text(option.text) }}</text><text v-if="answered && option.id === step.question.correct"> ✓</text></button>
            <view v-if="answered" id="lesson-feedback" class="feedback" :class="{ 'is-correct': answered.correct, 'is-incorrect': !answered.correct }" role="status"><text class="section-title">{{ answered.correct ? '答对了' : '看看这道题的关键' }}</text><text class="paragraph">{{ text(selectedOption?.feedback) }}</text><template v-if="!answered.correct"><text class="paragraph">这题应选：{{ text(correctOption?.text) }}</text><text v-if="text(correctOption?.feedback) !== text(selectedOption?.feedback)" class="paragraph">{{ text(correctOption?.feedback) }}</text></template><button class="primary" @tap="nextStep">继续</button></view>
            <template v-else><button class="link hint-link" @tap="showHint">回看刚才的讲解</button><view v-if="session.hint" class="hint"><text v-for="(paragraph, index) in hintContent" :key="index" class="paragraph">{{ text(paragraph) }}</text></view></template>
          </template>
        </view>
      </template>
    </view>
  </scroll-view>
  <view v-if="zoom" class="zoom" @tap="zoom = null"><button class="zoom-close" @tap="zoom = null">关闭 ×</button><image class="zoom-picture" :class="{ reversed: zoom.reversed }" :src="cardImage(zoom.id)" mode="aspectFit" /><text>{{ text(academy.units[zoom.id]?.title) }}{{ zoom.reversed ? ' · 逆位' : '' }}</text></view>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { onShow, onHide, onUnload } from '@dcloudio/uni-app'
import { academy, knowledge } from '../../core/catalogs'
import { readStore, writeStore, cardImage, notify } from '../../core/platform'

const STORE = 'tarot-miniapp-academy-v1'
let readableStore = true
function initial() { try { return academy.validate(readStore(STORE, null)) } catch { readableStore = false; notify('学习记录暂时无法读取，原记录未覆盖。'); return academy.blank() } }
const data = ref<any>(initial())
const currentTime = ref(Date.now())
const view = ref<'home' | 'catalog' | 'lesson'>('home')
const scrollTop = ref(0)
const scrollTarget = ref('')
const scrollAnimated = ref(false)
const ZOOM_TIP_STORE = 'tarot-miniapp-academy-zoom-tip-v1'
function hasSeenZoomTip() { try { return readStore<boolean>(ZOOM_TIP_STORE, false) === true } catch { return false } }
const zoomTipDismissed = ref(hasSeenZoomTip())
function dismissZoomTip() { zoomTipDismissed.value = true; try { writeStore(ZOOM_TIP_STORE, true) } catch { /* Optional guidance remains dismissed for this visit. */ } }
function openZoom(id: string) { dismissZoomTip(); zoom.value = { id, reversed: reversedCard(id) } }
const openedChapter = ref('大阿卡纳')
const zoom = ref<any>(null)
const stages = [{ key: 'B', name: '初级', subtitle: '看懂画面' }, { key: 'I', name: '中级', subtitle: '正逆位应用' }, { key: 'A', name: '高级', subtitle: '辨析与解读' }]
const suits = [['权杖', '火'], ['圣杯', '水'], ['宝剑', '风'], ['星币', '土']]
const text = (value: any): string => typeof value === 'string' ? value : value?.zh || ''
const level = computed(() => data.value.courseLevel || 'B')
const stageLabel = computed(() => stages.find(s => s.key === level.value)?.name)
const stageSubtitle = computed(() => stages.find(s => s.key === level.value)?.subtitle)
const route = computed<any[]>(() => academy.courseRoute(data.value, level.value))
const chapters = ['大阿卡纳', '数字牌', '宫廷牌']
const session = computed(() => data.value.session)
function sessionLevel(s: any) { return s?.courseLevel || academy.units[s?.unitId]?.level || ({ foundation: 'B', application: 'I', integration: 'A' } as any)[s?.mode] || level.value }
const savedSession = computed(() => {
  if (session.value && !session.value.complete && sessionLevel(session.value) === level.value) return session.value
  return Object.values(data.value.paused || {}).filter((s: any) => !s.complete && sessionLevel(s) === level.value).sort((a: any, b: any) => b.startedAt - a.startedAt)[0] as any || null
})
const nextItem = computed(() => savedSession.value ? { id: savedSession.value.unitId, mode: savedSession.value.mode, key: savedSession.value.practiceKey } : academy.stageNext(data.value, level.value, currentTime.value))
const currentUnit = computed(() => academy.units[nextItem.value?.id])
const coverId = computed(() => currentUnit.value?.kind === 'card' ? currentUnit.value.id : currentUnit.value?.cards?.[0] || 'm00')
const currentChapter = computed(() => route.value.find(n => n.id === nextItem.value?.id)?.chapter || '')
const doneCount = computed(() => route.value.filter(n => n.done).length)
const completedCards = computed(() => route.value.filter(n => n.done && academy.units[n.id].kind === 'card').length)
const progressPercent = computed(() => route.value.length ? doneCount.value / route.value.length * 100 : 0)
const upNext = computed(() => route.value.filter(n => !n.done && n.id !== nextItem.value?.id).slice(0, 2))
const unit = computed(() => academy.units[session.value?.unitId])
const plan = computed(() => unit.value ? academy.planFor(unit.value, session.value.mode, session.value) : [])
const step = computed(() => academy.stepFor(session.value))
const lessonInsight = computed(() => unit.value?.kind === 'card' ? academy.knowledgeLesson(knowledge, unit.value.id, step.value) : null)
const lessonKey = computed(() => [session.value?.unitId, session.value?.mode, session.value?.index, session.value?.support?.key, session.value?.support?.phase, session.value?.complete].join(':'))
const answered = computed(() => step.value?.question ? session.value.answers[step.value.question.id] : null)
function hash(value: string) { let h = 0; for (const c of value) h = (Math.imul(h, 31) + c.charCodeAt(0)) | 0; return h }
const options = computed<any[]>(() => [...(step.value?.question?.options || [])].sort((a, b) => hash(a.id + session.value.seed) - hash(b.id + session.value.seed)))
const selectedOption = computed(() => options.value.find(o => o.id === answered.value?.selected))
const correctOption = computed(() => options.value.find(o => o.id === step.value?.question?.correct))
const hintContent = computed(() => step.value?.key === 'Q2' && unit.value.application ? [unit.value.application] : step.value?.reversed ? [unit.value.reversal] : unit.value?.teachings || [])
const hasPending = computed(() => Object.values(data.value.progress[unit.value?.id]?.targets || {}).some((target: any) => target.status === 'pending'))
const shownCards = computed<string[]>(() => {
  if (!unit.value) return []
  if (unit.value.id === 'B07') return [['T1', 'T2', 'Q1'].includes(step.value?.key) ? 'c02' : 'm08']
  if (unit.value.id === 'I04') return [step.value?.key === 'T2' ? 's09' : 'p08']
  return unit.value.kind === 'card' ? [unit.value.id] : unit.value.cards || []
})
function reversedCard(id: string) { return !!(step.value?.reversed || session.value?.mode?.startsWith('reverse') || unit.value?.id === 'A04' && id === 'p08' || unit.value?.id === 'I04' && step.value?.key !== 'T1' && !session.value?.complete) }
function cardCaption(id: string, index: number) { const roles: any = { A05: ['现状', 'A 发展', 'B 发展', 'A 趋势', 'B 趋势'], A06: ['整体影响', '交叉阻碍', '目标', '基础', '渐退影响', '将来影响', '自己', '环境', '希望或担忧', '结果趋势'] }; return roles[unit.value?.id] ? `${index + 1} · ${roles[unit.value.id][index]}` : text(academy.units[id]?.title) }
function cardPosition(index: number) { const layouts: any = { A05: [[2, 3], [1, 2], [3, 2], [1, 1], [3, 1]], A06: [[2, 2], [2, 2], [2, 1], [2, 3], [1, 2], [4, 2], [5, 4], [5, 3], [5, 2], [5, 1]] }; const p = layouts[unit.value?.id]?.[index]; return p ? { gridColumn: String(p[0]), gridRow: String(p[1]) } : {} }
function chapterNodes(chapter: string) { return route.value.filter(n => n.chapter === chapter) }
function chapterDone(chapter: string) { return chapterNodes(chapter).filter(n => n.done).length }
function save() { if (!readableStore) { notify('原学习记录读取失败，本次进度暂未保存。'); return }; data.value.contentVersion = academy.version; try { writeStore(STORE, JSON.parse(JSON.stringify(data.value))) } catch { notify('学习记录未能保存，请检查存储空间。') } }
function moveScroll(value = 0) { scrollAnimated.value = false; scrollTarget.value = ''; scrollTop.value = value + 0.1; nextTick(() => { scrollTop.value = value }) }
async function focusFeedback() {
  const savedSession = session.value, questionId = step.value?.question?.id
  scrollTarget.value = ''
  await nextTick()
  // A learner can leave or move to another lesson before Vue paints the answer.
  if (view.value !== 'lesson' || session.value !== savedSession || step.value?.question?.id !== questionId || !answered.value) return
  scrollAnimated.value = true
  scrollTarget.value = 'lesson-feedback'
}
function onScroll(event: any) { if (view.value === 'lesson' && session.value) session.value.scroll = event.detail.scrollTop }
function goHome() { save(); view.value = 'home'; moveScroll() }
function selectLevel(key: string) { data.value.courseLevel = key; save(); moveScroll() }
function openCatalog() { openedChapter.value = currentChapter.value || '大阿卡纳'; view.value = 'catalog'; moveScroll() }
function start(item: any) {
  if (!item || !academy.units[item.id]) return
  const d = data.value, s = d.session, practiceKey = item.mode === 'practice' ? item.key || 'V1' : null
  if (s && !s.complete && s.unitId === item.id && s.mode === item.mode && (item.mode !== 'practice' || s.practiceKey === practiceKey)) { s.courseLevel = level.value; view.value = 'lesson'; save(); moveScroll(s.scroll || 0); return }
  if (s && !s.complete) d.paused[s.unitId + ':' + s.mode + (s.mode === 'practice' ? ':' + s.practiceKey : '')] = JSON.parse(JSON.stringify(s))
  const key = item.id + ':' + item.mode + (practiceKey ? ':' + practiceKey : ''), resumed = d.paused[key]
  d.session = resumed || { unitId: item.id, mode: item.mode, index: 0, startedAt: Date.now(), seed: Math.floor(Math.random() * 1e9) + 1, contentVersion: academy.version, answers: {}, support: null, hint: false, complete: false, lang: 'zh', animation: { frame: 0, static: true, paused: true }, scroll: 0 }
  d.session.courseLevel = level.value
  if (practiceKey && !resumed) { d.session.practiceKey = practiceKey; const variants = academy.practiceVariants(academy.units[item.id], practiceKey); d.session.variant = (d.progress[item.id]?.history || []).flatMap((r: any) => r.answers || []).filter((a: any) => variants.some((q: any) => q.id === a.questionId)).length }
  delete d.paused[key]; save(); view.value = 'lesson'; moveScroll(d.session.scroll || 0)
}
function continueCourse() { const item = nextItem.value; if (item) start(item); else { notify('本阶段已完成，可以选择下一阶段。'); goHome() } }
function openNode(node: any) { const modes = ['foundation', 'application', 'integration'], skills = academy.skillState(data.value.progress[node.id]); const required = modes.slice(0, Math.max(0, modes.indexOf(node.mode))); start({ ...node, mode: required.find(key => !skills[key]) || node.mode }) }
function choose(id: string) { if (academy.answer(data.value, id)) { save(); focusFeedback() } }
function showHint() { session.value.hint = true; save() }
function nextStep() { if (academy.advance(data.value)) { save(); moveScroll() } }
onShow(() => { currentTime.value = Date.now() })
onHide(save)
onUnload(save)
</script>

<style scoped>
.knowledge{margin:28rpx 0;padding:24rpx 26rpx;border-left:5rpx solid #654b65;background:#fffdf8;border-radius:0 20rpx 20rpx 0;overflow-wrap:anywhere}.knowledge .paragraph{margin-bottom:0}

.screen{height:100vh;background:#f6f1e8;color:#302a32}.page{padding:24rpx 28rpx 72rpx;box-sizing:border-box;max-width:900px;margin:auto}button{font-size:28rpx;line-height:1.5;margin:0;box-sizing:border-box;border-radius:20rpx}button::after{border:0}text{overflow-wrap:anywhere}.header,.row,.lesson-header,.catalog-link,.chapter-heading,.lesson-link{display:flex;align-items:center;justify-content:space-between;gap:16rpx}.header{margin:12rpx 0 28rpx}.title{font-size:40rpx;font-weight:700}.stages{display:flex;gap:12rpx;margin-bottom:24rpx}.stage{flex:1;min-width:0;padding:18rpx 6rpx;background:#fffcf7;color:#67516b;border:1px solid #dfd4df}.stage.selected{background:#66506c;color:#fff9f0}.stage-name,.stage-sub{display:block}.stage-name{font-weight:700}.stage-sub{font-size:22rpx;margin-top:6rpx}.panel{background:#fffcf7;border:1px solid #e1d7df;border-radius:28rpx;padding:28rpx}.row{font-size:25rpx}.muted{color:#827985}.small{font-size:24rpx}.progress{height:8rpx;background:#e9e0e8;border-radius:10rpx;overflow:hidden;margin:22rpx 0}.fill{height:100%;background:#8d7391}.course-cover{display:flex;gap:24rpx;align-items:center;margin:30rpx 0}.cover{width:145rpx;height:240rpx;flex-shrink:0}.course-info{min-width:0;flex:1}.course-title{display:block;font-size:36rpx;font-weight:700;margin:10rpx 0}.description{display:block;line-height:1.7;font-size:27rpx;color:#7c7180}.primary{background:#66506c;color:#fffaf2;padding:23rpx 20rpx;width:100%;font-weight:600;margin-top:24rpx}.secondary{background:#eee6ee;color:#66506c;padding:20rpx;margin-top:16rpx}.link{background:transparent;color:#6b526e;padding:10rpx 0;font-size:25rpx;flex-shrink:0}.up-next{margin:36rpx 0}.section-title{font-size:29rpx;font-weight:600;display:block}.next-row{display:flex;justify-content:space-between;gap:20rpx;font-size:27rpx;padding:22rpx 0;border-bottom:1px solid #e2d8df}.catalog-link{background:transparent;width:100%;text-align:left;padding:24rpx 0}.chapter{padding:0 24rpx;margin-bottom:20rpx}.chapter-heading{background:transparent;width:100%;padding:26rpx 0;text-align:left;font-weight:600}.lesson-link{width:100%;text-align:left;background:transparent;border-top:1px solid #eee6ec;padding:20rpx 0}.number{width:52rpx;flex-shrink:0;font-size:25rpx;color:#7e6683}.lesson-label{flex:1;min-width:0}.lesson-label text{display:block}.lesson-label .small{margin-top:4rpx}.lesson-header{align-items:center}.lesson-heading{font-size:28rpx;font-weight:600;flex:1;min-width:0}.cards{display:flex;justify-content:center;gap:20rpx;flex-wrap:wrap;margin:26rpx 0}.card-item{width:165rpx;text-align:center;min-width:0}.card-picture{width:100%;height:265rpx}.reversed{transform:rotate(180deg)}.card-caption{display:block;font-size:22rpx;line-height:1.5;margin-top:10rpx}.cards.many{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18rpx}.cards.many .card-item{width:100%}.cards.many .card-picture{height:170rpx}.cards.cross{grid-template-columns:repeat(5,minmax(0,1fr));grid-template-rows:repeat(4,210rpx);gap:12rpx}.cards.cross .card-picture{height:140rpx}.cards.cross .card-caption{font-size:20rpx}.cards.cross .crossing{position:relative;z-index:2;align-self:start;padding-top:32rpx}.cards.cross .crossing .card-picture{transform:rotate(90deg)}.cards.cross .crossing .card-picture.reversed{transform:rotate(270deg)}.cards.cross .crossing .card-caption{position:absolute;left:calc(100% + 4rpx);top:40rpx;width:100%;padding:4rpx;background:#f6f1e8;border-radius:6rpx;box-sizing:border-box}.lesson-content{margin-top:26rpx;padding:28rpx}.heading{display:block;font-size:36rpx;font-weight:700;margin:18rpx 0}.paragraph{display:block;font-size:30rpx;line-height:1.9;white-space:pre-wrap;margin:18rpx 0}.teaching{margin-top:26rpx}.question{display:block;font-size:33rpx;line-height:1.7;font-weight:600;margin:20rpx 0 26rpx}.option{display:block;width:100%;text-align:left;background:#f7f1f8;border:1px solid #dacddc;padding:24rpx;margin:16rpx 0;color:#382f3b;font-size:29rpx;line-height:1.7}.option[disabled]{color:#514556;opacity:1}.option.correct{border-color:#668776;background:#e9f0e9}.option.incorrect{border-color:#ac7e86;background:#f4e6e7}.feedback,.hint{padding:24rpx;margin-top:24rpx;background:#eee5ee;border-radius:18rpx}.hint-link{margin-top:20rpx}.result-label{display:inline-block;padding:10rpx 20rpx;background:#ece3ee;border-radius:14rpx;color:#68506d}.suits{display:grid;grid-template-columns:repeat(2,1fr);gap:16rpx;margin:28rpx 0}.suits view{padding:24rpx;background:#eee5ef;border-radius:18rpx;display:flex;justify-content:space-between}.zoom{position:fixed;inset:0;z-index:20;background:rgba(30,23,34,.95);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff7eb;padding:36rpx;box-sizing:border-box}.zoom-close{position:absolute;right:32rpx;top:30rpx;background:transparent;color:#fff7eb}.zoom-picture{width:85vw;height:72vh;max-width:600px}.zoom>text{margin-top:24rpx;font-size:30rpx}

/* Match the calm ivory/plum lesson surface; effects only mark learning changes. */
.zoom-tip{display:flex;align-items:center;justify-content:space-between;gap:18rpx;margin:0 0 24rpx;padding:12rpx 20rpx;background:#fffcf7;border:1px solid #e1d7df;border-radius:20rpx;color:#827985;font-size:25rpx;line-height:1.6}.zoom-tip .link{min-height:80rpx}.lesson-content{animation:lesson-arrive .26s cubic-bezier(.22,.61,.36,1) both}.lesson-complete{animation-duration:.42s}.lesson-complete>.small{display:inline-block;border-bottom:1px solid #e1d7df;padding-bottom:12rpx}.feedback{border-left:6rpx solid #66506c;animation:lesson-arrive .24s ease-out}.feedback.is-correct{border-left-color:#668776}.feedback.is-incorrect{border-left-color:#ac7e86}.option{transition:background .18s ease,border-color .18s ease}.option:active:not([disabled]){transform:scale(.99)}.fill{transition:width .3s ease-out}.zoom{animation:lesson-arrive .22s ease-out}
@keyframes lesson-arrive{from{opacity:0;transform:translateY(10rpx)}to{opacity:1;transform:translateY(0)}}
@media(prefers-reduced-motion:reduce){.lesson-content,.feedback,.zoom{animation:none}.option,.fill{transition:none}}
</style>
