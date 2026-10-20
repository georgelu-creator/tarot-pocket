<template>
  <scroll-view class="screen" scroll-y :scroll-top="scrollTop" :scroll-into-view="scrollTarget" :scroll-with-animation="scrollAnimated" @scroll="onScroll">
    <view class="page" :class="{ 'card-intro': foundationStep && !session?.complete, 'course-home': view === 'home', 'course-catalog': view === 'catalog', 'lesson-page': view === 'lesson' }">
      <view v-if="saveStatus" class="save-status" role="status"><text>{{ saveStatus }}</text><button v-if="readableStore" class="link" @tap="save">重试保存</button></view>
      <template v-if="view !== 'lesson'">
        <view class="header"><button v-if="view === 'catalog'" class="link" @tap="back">返回上课</button><text class="title">{{ view === 'catalog' ? '课程目录' : hasLearning || savedSession ? '继续学一课' : '从一张牌开始' }}</text></view>
        <view v-if="view === 'catalog'" class="stages"><button v-for="s in stages" :key="s.key" class="stage" :class="{ selected: level === s.key }" @tap="selectLevel(s.key)"><text class="stage-name">{{ s.name }}</text><text class="stage-sub">{{ s.subtitle }}</text></button></view>
        <template v-if="view === 'home'">
          <view class="panel current">
            <view class="row"><text>{{ savedSession ? '上次学到这里' : nextItem?.mode === 'practice' || nextItem?.mode === 'review' ? '复习学过的内容' : hasLearning ? '这一课' : '你的第一课' }}</text><text v-if="hasLearning" class="muted">已学 {{ completedCards }} / 78 张</text></view>
            <view v-if="hasLearning" class="progress"><view class="fill" :style="{ width: progressPercent + '%' }" /></view>
            <view class="course-cover"><image v-if="currentUnit" class="cover" :src="cardImage(coverId)" mode="aspectFit" /><view class="course-info"><text class="course-title">{{ text(currentUnit?.title) || '这一阶段已学完' }}</text><text class="description">{{ nextItem?.prerequisite ? '先补上这张牌的基础，再继续本课。' : currentUnit ? coursePurpose : '随时回来温习学过的内容。' }}</text></view></view>
            <button v-if="currentUnit" class="primary" @tap="continueCourse">{{ savedSession ? '继续上课' : '开始上课' }}</button>
            <button v-else-if="level !== 'A'" class="primary" @tap="selectLevel(level === 'B' ? 'I' : 'A')">进入{{ level === 'B' ? '中级' : '高级' }}</button>
            <button v-else class="primary" @tap="openCatalog">查看课程目录</button>
          </view>
          <button class="catalog-link" @tap="openCatalog"><text>选择其他课程</text><text class="muted">›</text></button>
        </template>
        <template v-else>
          <view v-for="(chapter, chapterIndex) in chapters" :key="chapter" class="panel chapter">
            <button class="chapter-heading" @tap="openedChapter = openedChapter === chapter ? '' : chapter"><view class="chapter-title"><text class="chapter-number">第 {{ chapterIndex + 1 }} 章</text><text>{{ chapter }}</text></view><text class="muted">{{ chapterDone(chapter) }} / {{ chapterNodes(chapter).length }}</text><text class="chapter-toggle">{{ openedChapter === chapter ? '−' : '＋' }}</text></button>
            <view v-if="openedChapter === chapter" class="chapter-lessons"><button v-for="node in chapterNodes(chapter)" :key="node.id" class="lesson-link" @tap="openNode(node)"><text class="number">{{ node.done ? '✓' : route.indexOf(node) + 1 }}</text><view class="lesson-label"><text>{{ node.title }}</text><text class="small muted">{{ node.done ? '已完成' : savedSession && node.id === savedSession.unitId ? '上次学到这里' : academy.units[node.id].kind === 'lesson' ? '方法课' : '看图与练习' }}</text></view><text>›</text></button></view>
          </view>
        </template>
      </template>
      <template v-else-if="session && unit">
        <view class="lesson-header"><button class="link" @tap="back">‹ 返回课程</button><text class="lesson-heading">{{ text(unit.title) }}</text><text class="small muted">{{ Math.min(session.index + 1, plan.length) }} / {{ plan.length }}</text></view>
        <view class="progress"><view class="fill" :style="{ width: session.index / plan.length * 100 + '%' }" /></view>
        <text v-if="visual.note && !session.complete" class="visual-note">{{ visual.note }}</text>
        <view v-if="unit.id === 'B03' && step?.key === 'T1' && !step.support && !session.complete" class="suits"><view v-for="suit in suits" :key="suit[0]"><text>{{ suit[0] }}</text><text class="muted">{{ suit[1] }}</text></view></view>
        <view v-else-if="shownCards.length" class="cards" :class="{ many: shownCards.length > 3, choice: fullChoice, cross: fullCross }">
          <view v-for="(id, index) in shownCards" :key="index" class="card-item" :class="{ crossing: fullCross && index === 1 }" :style="cardPosition(index)"><image class="card-picture" :class="{ reversed: reversedCard(id) }" :src="cardImage(id)" mode="aspectFit" @tap="openZoom(id)" /><text class="card-caption">{{ cardCaption(id, index) }}{{ reversedCard(id) ? ' · 逆位' : '' }}</text></view>
        </view>
        <view v-if="shownCards.length && !zoomTipDismissed" class="zoom-tip"><text>点一下牌图，可以放大看细节。</text><button class="link" @tap="dismissZoomTip">知道了</button></view>
        <view v-if="session.complete" :key="lessonKey" class="panel lesson-content lesson-complete">
          <text class="small muted">本轮学习完成</text><text class="heading">{{ text(unit.title) }}</text><text class="paragraph">{{ text(unit.summary) }}</text>
          <view v-if="unit.kind === 'card'" class="result-label"><text class="result-title">当前：{{ academy.masteryState(data.progress[unit.id]).label }}</text><text class="result-detail">{{ completionDetail }}</text></view>
          <text v-if="hasPending" class="paragraph muted">需要再练的内容已安排复习，下次继续巩固。</text>
          <view class="completion-actions"><button class="primary" @tap="continueCourse">继续下一课</button><view class="completion-links"><button class="link" @tap="openCatalog">选择其他课程</button><button class="link" @tap="back">返回课程</button></view></view>
        </view>
        <view v-else-if="step" :key="lessonKey" class="panel lesson-content">
          <template v-if="step.kind !== 'question'">
            <text class="small muted eyebrow">{{ step.kind === 'summary' ? '把刚才的要点连起来' : step.support ? '换个例子，继续理解' : step.key === 'T2' && unit.kind === 'card' ? '看看怎样用' : step.reversed ? '在这个例子里读逆位' : '先看讲解' }}</text><text class="lesson-title">{{ step.kind === 'summary' ? '先记住这点，再往下学' : text(unit.title) }}</text>
            <view v-show="!recallActive" class="lesson-explanation">
            <template v-if="foundationStep">
              <view class="teaching teaching-core"><text class="section-title">核心意思</text><text class="paragraph">{{ text(step.content[0]) }}</text></view>
              <view class="knowledge foundation-memory"><button class="knowledge-toggle" :aria-expanded="insightOpen" @tap="toggleInsight"><text>看图怎么记</text><text>{{ insightOpen ? '−' : '+' }}</text></button><view v-show="insightOpen"><view v-for="(paragraph, index) in step.content.slice(1)" :key="index" class="teaching"><text class="section-title">{{ ['画面线索', '记忆线索'][index] || '理解这张牌' }}</text><text class="paragraph">{{ text(paragraph) }}</text></view><template v-if="lessonInsight"><text class="section-title">{{ lessonInsight.title }}</text><text class="paragraph">{{ lessonInsight.text }}</text></template></view></view>
            </template>
            <template v-else>
              <view v-for="(paragraph, index) in step.content" :key="index" class="teaching"><text class="paragraph">{{ text(paragraph) }}</text></view>
              <view v-if="lessonInsight" class="knowledge"><button class="knowledge-toggle" :aria-expanded="insightOpen" @tap="toggleInsight"><text>再看一个例子</text><text>{{ insightOpen ? '−' : '+' }}</text></button><view v-show="insightOpen"><text class="section-title">{{ lessonInsight.title }}</text><text class="paragraph">{{ lessonInsight.text }}</text></view></view>
            </template>
            </view>
            <button class="primary" @tap="nextStep">{{ step.kind === 'summary' ? '继续学习' : '继续' }}</button>
            <view v-if="lessonInsight?.recall" class="recall-area">
              <button v-if="!recallActive" class="link recall-entry" @tap="setRecall('think')">合上讲解，试着回忆</button>
              <view v-else class="recall panel" aria-label="看图回忆">
                <text class="section-title recall-title">看图回忆</text><text class="paragraph">{{ lessonInsight.recall.prompt }}</text><text class="recall-note">先在心里说一说，再核对。也可以直接继续上课。</text>
                <view v-if="recallReason" class="recall-reason" role="status"><text class="section-title">对照刚才的讲解</text><text v-for="(paragraph, index) in lessonInsight.recall.reason" :key="index" class="paragraph">{{ paragraph }}</text></view>
                <button v-else class="recall-button" @tap="setRecall('reason')">核对画面与牌义</button>
                <button v-if="recallReason && !recallExample" class="recall-button" @tap="setRecall('example')">{{ lessonInsight.recall.exampleTitle }}</button>
                <view v-if="recallExample" class="recall-example" role="status"><text class="section-title">{{ lessonInsight.recall.exampleTitle }}</text><text class="paragraph">{{ lessonInsight.recall.example }}</text></view>
                <view class="recall-actions"><button v-if="recallReason" class="link" @tap="setRecall('think')">再回想一次</button><button class="link" @tap="setRecall('close')">返回讲解</button></view>
              </view>
            </view>
          </template>
          <template v-else>
            <text class="small muted eyebrow">{{ step.key === 'Q4' ? '把整张牌连起来理解' : step.support ? '换个例子试试' : '做一道练习' }}</text><text class="question">{{ text(step.question.prompt) }}</text>
            <button v-for="option in options" :key="option.id" class="option" :class="{ correct: answered && option.id === step.question.correct, incorrect: answered && option.id === answered.selected && !answered.correct }" :disabled="!!answered" @tap="choose(option.id)"><text>{{ text(option.text) }}</text><text v-if="answered && option.id === step.question.correct"> ✓</text></button>
            <view v-if="answered" id="lesson-feedback" class="feedback" :class="{ 'is-correct': answered.correct, 'is-incorrect': !answered.correct }" role="status"><text class="section-title">{{ answered.correct ? '答对了' : '这题不对，我们看一下原因' }}</text><text class="paragraph">{{ text(selectedOption?.feedback) }}</text><template v-if="!answered.correct"><text class="paragraph">这题应选：{{ text(correctOption?.text) }}</text><text v-if="text(correctOption?.feedback) !== text(selectedOption?.feedback)" class="paragraph">{{ text(correctOption?.feedback) }}</text></template><button class="primary" @tap="nextStep">继续</button></view>
            <template v-else><button class="link hint-link" @tap="showHint">回看刚才的讲解</button><view v-if="session.hint" class="hint"><text v-for="(paragraph, index) in hintContent" :key="index" class="paragraph">{{ text(paragraph) }}</text></view></template>
          </template>
        </view>
      </template>
    </view>
  </scroll-view>
  <view v-if="zoom" class="zoom" @tap="zoom = null"><button class="zoom-close" @tap="zoom = null">关闭 ×</button><image class="zoom-picture" :class="{ reversed: zoom.reversed }" :src="cardImage(zoom.id)" mode="aspectFit" /><text>{{ text(academy.units[zoom.id]?.title) }}{{ zoom.reversed ? ' · 逆位' : '' }}</text></view>
  <FloatingNavigation active="learn" />
</template>

<script setup lang="ts">
import { hideNativeTabBar } from '../../core/navigation'
onShow(hideNativeTabBar)

import { computed, ref, nextTick } from 'vue'
import { onShow, onHide, onUnload, onBackPress } from '@dcloudio/uni-app'
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
const saveStatus = ref(readableStore ? '' : '原学习记录读取失败，本次进度暂未保存。')
const navigation: { view: 'home' | 'catalog' | 'lesson', scroll: number, chapter: string }[] = []
let currentScroll = 0
function rememberParent() { navigation.push({ view: view.value, scroll: currentScroll, chapter: openedChapter.value }) }
function back() {
  if (zoom.value) { zoom.value = null; return true }
  const parent = navigation.pop()
  if (!parent) { if (view.value === 'home') return false; goHome(); return true }
  save(); view.value = parent.view; openedChapter.value = parent.chapter; moveScroll(parent.scroll); return true
}
onBackPress(back)
const stages = [{ key: 'B', name: '初级', subtitle: '看懂画面' }, { key: 'I', name: '中级', subtitle: '正逆位应用' }, { key: 'A', name: '高级', subtitle: '辨析与解读' }]
const suits = [['权杖', '火'], ['圣杯', '水'], ['宝剑', '风'], ['星币', '土']]
const text = (value: any): string => typeof value === 'string' ? value : value?.zh || ''
const level = computed(() => data.value.courseLevel || 'B')
const stageSubtitle = computed(() => stages.find(s => s.key === level.value)?.subtitle)
const route = computed<any[]>(() => academy.courseRoute(data.value, level.value))
const chapters = computed<string[]>(() => [...new Set(route.value.map(node => node.chapter))])
const session = computed(() => data.value.session)
function sessionLevel(s: any) { return s?.courseLevel || academy.units[s?.unitId]?.level || ({ foundation: 'B', application: 'I', integration: 'A' } as any)[s?.mode] || level.value }
const savedSession = computed(() => {
  if (session.value && !session.value.complete && sessionLevel(session.value) === level.value) return session.value
  return Object.values(data.value.paused || {}).filter((s: any) => !s.complete && sessionLevel(s) === level.value).sort((a: any, b: any) => b.startedAt - a.startedAt)[0] as any || null
})
const nextItem = computed(() => savedSession.value ? { id: savedSession.value.unitId, mode: savedSession.value.mode, key: savedSession.value.practiceKey } : academy.stageNext(data.value, level.value, currentTime.value))
const currentUnit = computed(() => academy.units[nextItem.value?.id])
const coursePurpose = computed(() => academy.coursePurpose(currentUnit.value, nextItem.value?.mode))
const coverId = computed(() => currentUnit.value?.kind === 'card' ? currentUnit.value.id : currentUnit.value?.cards?.[0] || 'm00')
const currentChapter = computed(() => route.value.find(n => n.id === nextItem.value?.id)?.chapter || '')
const hasLearning = computed(() => Object.values(data.value.progress).some((progress: any) => progress.completedAt || progress.uprightAt || progress.rounds))
const doneCount = computed(() => route.value.filter(n => n.done).length)
const completedCards = computed(() => route.value.filter(n => n.done && academy.units[n.id].kind === 'card').length)
const progressPercent = computed(() => route.value.length ? doneCount.value / route.value.length * 100 : 0)
const unit = computed(() => academy.units[session.value?.unitId])
const plan = computed(() => unit.value ? academy.planFor(unit.value, session.value.mode, session.value) : [])
const step = computed(() => academy.stepFor(session.value))
const foundationStep = computed(() => unit.value?.kind === 'card' && step.value?.key === 'T1' && !step.value?.support)
const lessonInsight = computed(() => unit.value?.kind === 'card' ? academy.knowledgeLesson(knowledge, unit.value.id, step.value) : null)
const lessonKey = computed(() => [session.value?.unitId, session.value?.mode, session.value?.index, session.value?.support?.key, session.value?.support?.phase, session.value?.complete].join(':'))
const disclosureKey = computed(() => foundationStep.value ? 'memory' : step.value?.key)
const insightOpen = computed(() => session.value?.disclosures?.[disclosureKey.value] === true)
function toggleInsight() { const current = session.value, key = disclosureKey.value; if (!current || !['memory', 'T2', 'T3', 'T4'].includes(key)) return; (current.disclosures ||= {})[key] = !insightOpen.value; save() }
// These are disclosure choices, not answers or evidence of mastery.
const recallActive = computed(() => !!lessonInsight.value?.recall && session.value?.disclosures?.['recall-' + step.value?.key] === true)
const recallReason = computed(() => session.value?.disclosures?.['reason-' + step.value?.key] === true)
const recallExample = computed(() => session.value?.disclosures?.['example-' + step.value?.key] === true)
function setRecall(phase: string) {
  const current = session.value, key = step.value?.key
  if (!current || !lessonInsight.value?.recall || !['think', 'reason', 'example', 'close'].includes(phase)) return
  const state = current.disclosures ||= {}
  if (['reason', 'example'].includes(phase) && !state['recall-' + key]) return
  if (phase === 'example' && !state['reason-' + key]) return
  state['recall-' + key] = phase !== 'close'
  if (phase === 'think' || phase === 'close') { state['reason-' + key] = false; state['example-' + key] = false }
  if (phase === 'reason') state['reason-' + key] = true
  if (phase === 'example') state['example-' + key] = true
  save()
}
const answered = computed(() => step.value?.question ? session.value.answers[step.value.question.id] : null)
function hash(value: string) { let h = 0; for (const c of value) h = (Math.imul(h, 31) + c.charCodeAt(0)) | 0; return h }
const options = computed<any[]>(() => [...(step.value?.question?.options || [])].sort((a, b) => hash(a.id + session.value.seed) - hash(b.id + session.value.seed)))
const selectedOption = computed(() => options.value.find(o => o.id === answered.value?.selected))
const correctOption = computed(() => options.value.find(o => o.id === step.value?.question?.correct))
const hintContent = computed(() => step.value?.key === 'Q2' && unit.value.application ? [unit.value.application] : step.value?.reversed ? [unit.value.reversal] : unit.value?.teachings || [])
const completionDetail = computed(() => { const record = data.value.progress[unit.value?.id]; if (!['foundation', 'application', 'integration', 'practice'].includes(session.value?.mode)) return academy.masteryState(record).detail; const skills = academy.skillState(record); return [['foundation', '认识画面'], ['application', '正逆位应用'], ['integration', '辨析与迁移']].filter(([key]) => skills[key]).map(([, label]) => label).join('、') + '已完成本轮练习' })
const hasPending = computed(() => Object.values(data.value.progress[unit.value?.id]?.targets || {}).some((target: any) => target.status === 'pending'))
const visual = computed(() => academy.learningVisual(unit.value, session.value, step.value))
const shownCards = computed<string[]>(() => visual.value.cards)
const fullChoice = computed(() => unit.value?.id === 'A05' && shownCards.value.length === 5)
const fullCross = computed(() => unit.value?.id === 'A06' && shownCards.value.length === 10)
function reversedCard(id: string) { return !!(step.value?.reversed || session.value?.mode?.startsWith('reverse') || unit.value?.id === 'A04' && id === 'p08' || unit.value?.id === 'I04' && step.value?.key !== 'T1' && !session.value?.complete) }
function cardCaption(id: string, index: number) { return visual.value.captions[index] || text(academy.units[id]?.title) }
function cardPosition(index: number) { if (!fullChoice.value && !fullCross.value) return {}; const layouts: any = { A05: [[3, 3], [2, 2], [4, 2], [1, 1], [5, 1]], A06: [[3, 2], [3, 2], [3, 1], [3, 3], [1, 2], [5, 2], [7, 4], [7, 3], [7, 2], [7, 1]] }; const p = layouts[unit.value?.id]?.[index]; return p ? { gridColumn: String(p[0]), gridRow: String(p[1]) } : {} }
function chapterNodes(chapter: string) { return route.value.filter(n => n.chapter === chapter) }
function chapterDone(chapter: string) { return chapterNodes(chapter).filter(n => n.done).length }
function save() { if (!readableStore) { saveStatus.value = '原学习记录读取失败，本次进度暂未保存。'; return false }; data.value.contentVersion = academy.version; try { writeStore(STORE, JSON.parse(JSON.stringify(data.value))); saveStatus.value = ''; return true } catch { saveStatus.value = '进度尚未保存，请检查存储空间后重试。'; notify('学习记录未能保存，请检查存储空间。'); return false } }
function moveScroll(value = 0) { currentScroll = value; scrollAnimated.value = false; scrollTarget.value = ''; scrollTop.value = value + 0.1; nextTick(() => { scrollTop.value = value }) }
async function focusFeedback() {
  const savedSession = session.value, questionId = step.value?.question?.id
  scrollTarget.value = ''
  await nextTick()
  // A learner can leave or move to another lesson before Vue paints the answer.
  if (view.value !== 'lesson' || session.value !== savedSession || step.value?.question?.id !== questionId || !answered.value) return
  scrollAnimated.value = true
  scrollTarget.value = 'lesson-feedback'
}
function onScroll(event: any) { currentScroll = event.detail.scrollTop; if (view.value === 'lesson' && session.value) session.value.scroll = event.detail.scrollTop }
function goHome() { navigation.length = 0; save(); view.value = 'home'; moveScroll() }
function selectLevel(key: string) { data.value.courseLevel = key; save(); moveScroll() }
function openCatalog() { if (view.value !== 'catalog') rememberParent(); openedChapter.value = currentChapter.value || '大阿卡纳'; view.value = 'catalog'; moveScroll() }
function start(item: any) {
  if (!item || !academy.units[item.id]) return
  if (view.value !== 'lesson') rememberParent()
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
/* Native markup follows the existing web academy components. Numeric dimensions
   mirror academy.css; shared colours, artwork and type remain design tokens. */
.screen{height:100vh;background:var(--bg);color:var(--ink)}
.page{box-sizing:border-box;padding:16px 20px 100px;max-width:760px;margin:auto;font-family:var(--font-body);font-size:16px;line-height:1.65}
button{box-sizing:border-box;font-family:var(--font-body);font-size:16px;line-height:1.65;margin:0;color:var(--ink);border-radius:var(--radius-button)}
button::after{border:0}text{overflow-wrap:anywhere}
.muted{color:var(--muted)}.small{font-size:12px}.panel{background:var(--paper);border:1px solid var(--line)}
.title{display:block;font:500 28px/1.35 var(--font-display)}
.header,.row,.lesson-header,.catalog-link,.chapter-heading,.lesson-link{display:flex;align-items:center;justify-content:space-between;gap:16px}
.header{margin:0 0 18px}.primary{display:inline-flex;align-items:center;justify-content:center;width:100%;min-height:50px;padding:12px 24px;border:1px solid var(--accent);border-radius:var(--radius-button);background:var(--accent);color:var(--paper);font-size:16px;font-weight:500;margin-top:24px}
.link{background:transparent;color:var(--accent);padding:8px 0;font-size:13px;min-width:44px;min-height:44px;flex-shrink:0;border:0}
.progress{height:4px;background:var(--line);border-radius:3px;overflow:hidden;margin:10px 0 20px}.fill{height:100%;background:var(--accent);transition:width .3s ease-out}
.course-home{max-width:676px;padding-top:12px;padding-inline:18px}.course-home .header{display:block;margin:0 0 16px}.course-home .title{font-size:25px}
.current{border-radius:22px;margin:0 0 18px;padding:20px}.current .row{gap:10px;font-size:13px;color:var(--muted);margin-bottom:18px}.current .row .muted{font-size:12px;white-space:nowrap}.current .progress{height:5px;background:var(--soft);border-radius:10px;margin:12px 0 16px}
.course-cover{display:flex;align-items:center;gap:17px;margin:0 0 18px;min-width:0}.cover{width:73px;height:122px;border-radius:6px;flex-shrink:0;box-shadow:var(--shadow-card)}.course-info{min-width:0}.course-title{display:block;font-size:22px;font-weight:600;line-height:1.4;margin:6px 0 10px}.description{display:block;font-size:13px;line-height:1.6;color:var(--muted)}.current .primary{margin-top:0}
.catalog-link{width:100%;max-width:640px;margin:0 auto;gap:12px;justify-content:center;min-height:44px;padding:8px;color:var(--muted);font-size:14px;background:transparent;text-align:left;border:0}.catalog-link>.muted{font-size:22px;line-height:18px}
.course-catalog{padding:0 18px 100px}.course-catalog .header{display:block;margin:0}.course-catalog .header .link{display:block;min-height:40px;padding:0;text-align:left}.course-catalog .title{font-size:28px;margin:12px 0 20px}
.stages{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;background:var(--soft);padding:5px;border-radius:17px;margin:0 0 18px}.stage{min-width:0;min-height:58px;padding:8px 5px;background:transparent;border:1px solid transparent;border-radius:13px;text-align:center}.stage.selected{background:var(--accent);color:var(--paper);border-color:var(--accent)}.stage-name,.stage-sub{display:block}.stage-name{font-size:16px;font-weight:600}.stage-sub{font-size:11px;font-weight:400;margin-top:3px}
.chapter{border-radius:18px;padding:0;margin-bottom:12px;overflow:hidden}.chapter-heading{width:100%;text-align:left;background:transparent;border:0;border-radius:0;gap:12px;padding:18px;font-size:18px;font-weight:600}.chapter-title{display:flex;flex-direction:column;gap:5px;min-width:0;flex:1}.chapter-number{font-size:12px;font-weight:400;color:var(--muted)}.chapter-heading>.muted{font-size:12px;font-weight:400}.chapter-toggle{font-size:20px;font-weight:400;color:var(--accent)}.chapter-lessons{padding:0 14px 8px}.lesson-link{width:100%;gap:14px;background:transparent;border:0;border-top:1px solid var(--line);border-radius:0;text-align:left;padding:14px 0}.number{width:30px;height:30px;display:flex;align-items:center;justify-content:center;flex:0 0 30px;border-radius:50%;background:var(--soft);font-size:12px}.lesson-label{flex:1;min-width:0}.lesson-label text{display:block}.lesson-label>text:first-child{font-size:15px;font-weight:600;line-height:1.5}.lesson-label .small{font-size:12px;margin-top:5px}
.lesson-header{min-height:48px;gap:7px}.lesson-heading{flex:1;min-width:0;font-size:12px;font-weight:400;line-height:1.5}.lesson-header .link{min-width:60px;font-size:12px;padding:8px 0;text-align:left}.lesson-header>.small{font-size:13px;white-space:nowrap}
.cards{height:220px;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:nowrap;margin:0 auto 22px}.card-item{width:108px;min-width:0;text-align:center;flex:none}.card-picture{width:108px;height:184px;max-width:100%;border-radius:7px;filter:drop-shadow(0 8px 9px #20172920)}.reversed{transform:rotate(180deg)}.card-caption{display:block;font-size:13px;line-height:1.3;margin-top:7px}
/* Ordinary three-card examples shrink as one row, retaining every full face. */
.cards:not(.choice):not(.cross):not(.many) .card-item{flex:0 1 108px}.cards:not(.choice):not(.cross):not(.many) .card-picture{width:100%}
.cards.many{height:auto;min-height:225px;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;align-items:center}.cards.many .card-item{width:100%}.cards.many .card-picture{width:53px;height:88px;margin:auto}.cards.many .card-caption{font-size:10px}
.cards.choice{height:310px;min-height:0;grid-template-columns:repeat(5,minmax(0,1fr));grid-template-rows:repeat(3,minmax(0,1fr));gap:0;max-width:420px}.cards.choice .card-picture{width:48px;height:80px}
.cards.cross{height:400px;align-items:start;min-height:0;grid-template-columns:repeat(7,minmax(0,1fr));grid-template-rows:repeat(4,minmax(0,1fr));gap:0;max-width:550px}.cards.cross .card-picture{width:43px;height:72px}.cards.cross .card-caption{font-size:10px}.cards.cross .crossing{position:relative;z-index:2;align-self:start;padding-top:18px}.cards.cross .crossing .card-picture{transform:rotate(90deg);box-shadow:0 2px 8px #241a2620}.cards.cross .crossing .card-picture.reversed{transform:rotate(270deg)}.cards.cross .crossing .card-caption{position:absolute;left:calc(100% + 3px);top:22px;width:46px;max-width:46px;padding:3px;background:var(--bg);border-radius:4px;box-sizing:border-box}
.visual-note{display:block;font-size:13px;max-width:640px;margin:12px auto 14px;color:var(--muted);line-height:1.6}.zoom-tip{display:flex;align-items:center;justify-content:space-between;max-width:640px;margin:-8px auto 22px;padding:10px 14px;gap:12px;border:1px solid var(--line);border-radius:12px;background:var(--paper);color:var(--muted);font-size:13px;line-height:1.6}.zoom-tip .link{min-height:44px;padding:8px 0;font:inherit}
.lesson-content.panel{max-width:640px;margin:0 auto;padding:0;background:transparent;border:0;border-radius:0;animation:lesson-arrive .26s cubic-bezier(.22,.61,.36,1) both}.lesson-content>.small{font-size:11px;line-height:1.65}.lesson-title{display:block;font-size:21px;line-height:1.55;font-weight:500;margin:10px 0 18px}.card-intro .lesson-title{margin-bottom:8px}.paragraph{display:block;font-size:15px;line-height:1.8;white-space:pre-wrap;margin:14px 0}.section-title{display:block;font-size:16px;line-height:1.65;font-weight:600}.teaching{margin:0}.teaching-core{padding:14px;background:var(--paper);border:1px solid var(--line);border-radius:13px}.teaching-core .section-title{color:var(--accent);font-size:16px;line-height:1.45;margin:8px 0}.teaching-core .paragraph{font-size:15px;line-height:1.75;margin:8px 0}
.knowledge{margin:18px 0;padding:0 14px;border:1px solid var(--line);border-radius:12px;overflow-wrap:anywhere;background:transparent}.knowledge-toggle{display:flex;align-items:center;justify-content:space-between;gap:16px;width:100%;min-height:44px;padding:10px 0;background:transparent;color:var(--accent);font-size:14px;text-align:left}.knowledge .section-title{font-size:16px;line-height:1.65;margin:12px 0 6px}.knowledge .paragraph{font-size:15px;line-height:1.9;margin:0 0 16px}
.question{display:block;font-size:21px;line-height:1.55;font-weight:500;margin:10px 0 18px}.option{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:62px;padding:13px;border:1px solid var(--line);border-radius:15px;background:var(--paper);color:var(--ink);text-align:left;font-size:15px;line-height:1.65;margin:12px 0;transition:background .18s ease,border-color .18s ease}.option[disabled]{color:var(--ink);opacity:1}.option.correct{border-color:var(--success);background:var(--success-bg);color:var(--success)}.option.incorrect{border-color:var(--error);background:var(--error-bg)}.option:active:not([disabled]){transform:scale(.99)}
.feedback{padding:17px;border-radius:15px;margin-top:20px;background:var(--soft);border-left:3px solid var(--accent);animation:lesson-arrive .24s ease-out}.feedback.is-correct{border-left-color:var(--success)}.feedback.is-incorrect{border-left-color:var(--error)}.feedback .section-title{font-size:19px;line-height:1.5}.feedback .paragraph{font-size:15px}.feedback .primary{margin-top:16px}.hint{border-left:3px solid var(--line);padding-left:16px}.hint .paragraph{font-size:14px;color:var(--muted)}
.lesson-complete{animation-duration:.42s}.lesson-complete>.small{display:inline-block;border-bottom:1px solid var(--line);padding-bottom:8px}.heading{display:block;font:500 28px/1.3 var(--font-display);margin:0}.result-label{display:grid;gap:4px;margin:18px 0;padding:14px 16px;border:1px solid var(--line);border-radius:13px;background:var(--paper)}.result-title{font-size:15px;font-weight:600}.result-detail{font-size:13px;line-height:1.6;color:var(--muted)}.lesson-complete>.paragraph{font-size:16px;line-height:1.8}.completion-actions{display:grid;gap:10px;margin-top:24px}.completion-actions>.primary{margin-top:0}.completion-links{display:grid;gap:10px;margin-top:0}.completion-links .link{width:100%;text-align:center}
.suits{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;height:170px;align-items:center;margin:25px 0}.suits view{min-height:110px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:10px;padding:16px 5px;background:var(--paper);border:1px solid var(--line);border-radius:16px;font-size:15px;font-weight:600}.suits .muted{font-size:14px;font-weight:400}
.save-status{padding:12px 14px;margin-bottom:12px;border:1px solid var(--control-line);border-radius:12px;background:var(--soft);line-height:1.7;font-size:14px}.save-status .link{display:block;margin-top:4px}
.zoom{position:fixed;inset:0;z-index:80;background:rgba(30,23,34,.95);display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--paper);padding:18px;box-sizing:border-box;animation:lesson-arrive .22s ease-out}.zoom-close{position:absolute;right:16px;top:calc(12px + env(safe-area-inset-top));min-height:44px;background:transparent;color:var(--paper)}.zoom-picture{width:85vw;height:72vh;max-width:600px}.zoom>text{margin-top:12px;font-size:15px}
@keyframes lesson-arrive{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
@media(prefers-reduced-motion:reduce){.lesson-content.panel,.feedback,.zoom{animation:none}.option,.fill{transition:none}}
@media(min-width:541px){.course-home{max-width:712px;padding-top:22px;padding-inline:36px}.course-home .header{margin:8px 0 20px}.course-home .title{font-size:30px}.current{padding:26px;margin-bottom:22px}.current .row{margin-bottom:22px}.course-cover{gap:24px;margin-bottom:24px}.cover{width:89px;height:148px}.course-title{font-size:26px}.description{font-size:14px}.current .progress{margin-bottom:20px}.course-catalog{max-width:832px;padding-top:10px;padding-inline:36px}.stage{min-height:64px}.stage-name{font-size:17px}.stage-sub{font-size:12px}.cards{height:225px}.cards.many{grid-template-columns:repeat(auto-fit,minmax(50px,1fr));gap:8px}.cards.many .card-picture{width:78px;height:130px}.cards.choice{height:310px;grid-template-columns:repeat(5,minmax(0,1fr));gap:0}.cards.choice .card-picture{width:48px;height:80px}.cards.cross{height:400px;grid-template-columns:repeat(7,minmax(0,1fr));gap:0}.cards.cross .card-picture{width:43px;height:72px}.lesson-heading{font-size:14px}.lesson-header{gap:12px}.question,.lesson-title{font-size:27px}.option{font-size:16px;padding:15px 17px}.paragraph{font-size:16px}.teaching-core .paragraph{font-size:15px}.visual-note{font-size:14px}}
@media(min-width:800px){.lesson-page{padding-inline:28px}}
@media(max-width:360px){.course-home,.course-catalog{padding-inline:20px}.cards.cross .crossing .card-caption{left:calc(100% + 2px);width:36px;max-width:36px;padding:2px;font-size:9px;line-height:1.15}}
@media(max-width:540px) and (max-height:650px){.page{padding-top:8px}.course-home{padding-top:12px}.course-catalog{padding-top:0}.card-intro .cards:not(.choice):not(.cross){height:125px;margin-bottom:8px}.card-intro .cards:not(.choice):not(.cross) .card-item{width:64px;max-width:64px}.card-intro .cards:not(.choice):not(.cross) .card-picture{width:64px;height:104px}.card-intro .zoom-tip,.card-intro .lesson-title,.card-intro .lesson-content>.small{display:none}.card-intro .lesson-content.panel{margin-top:0}.card-intro .teaching-core{padding:0;border:0;background:transparent}.card-intro .teaching-core .section-title{margin:0 0 6px}.card-intro .teaching-core .paragraph{margin:0;font-size:14px;line-height:1.65}.card-intro .lesson-content>.primary{margin-top:10px;min-height:46px;padding:10px 24px;line-height:1.5}.card-intro .progress{margin-bottom:10px}.card-intro .knowledge{margin:10px 0}}


/* Same optional recall aid as the web classroom; primary lesson flow stays intact. */
.recall-entry{width:100%;min-height:44px;margin-top:8px;font-size:14px;text-align:center}.recall{padding:16px;margin:18px 0;border-radius:13px;overflow-wrap:anywhere}.recall-title{color:var(--accent)}.recall .paragraph{font-size:15px;line-height:1.8;margin:10px 0}.recall .section-title{font-size:15px;line-height:1.6}.recall>.recall-title{font-size:16px;line-height:1.5;margin-bottom:10px}.recall-note{display:block;font-size:13px;line-height:1.8;color:var(--muted);margin:10px 0}.recall-reason,.recall-example{border-top:1px solid var(--line);margin-top:14px;padding-top:14px}.recall-button{width:100%;min-height:44px;margin-top:10px;padding:10px 12px;background:transparent;color:var(--accent);border:1px solid var(--line);border-radius:var(--radius-button);font-size:14px;white-space:normal}.recall-actions{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:8px}.recall-actions .link{font-size:13px;padding:8px 0}

/* Keep the first explanation and Continue above the 70px floating navigation
   on compact phones without shrinking artwork, reading type or touch targets. */
@media(max-width:360px) and (max-height:600px){.page.card-intro .lesson-header{min-height:44px}.page.card-intro>.progress{margin:6px 0}.page.card-intro .cards:not(.choice):not(.cross){margin-bottom:6px}.page.card-intro .card-picture{display:block}.page.card-intro .knowledge{margin:6px 0}}
</style>
