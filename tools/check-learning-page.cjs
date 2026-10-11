'use strict'
// Mount the production SFC and generated engine. Only the uni lifecycle/storage boundary is mocked.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')
const mini = path.resolve(__dirname, '../apps/miniapp')
const miniRequire = createRequire(path.join(mini, 'package.json'))
const { parse, compileScript, compileTemplate } = miniRequire('@vue/compiler-sfc')
const esbuild = miniRequire('esbuild')
const { chromium } = require('playwright')
const filename = path.join(mini, 'src/pages/learn/index.vue')
const { descriptor } = parse(fs.readFileSync(filename, 'utf8'), { filename })
const script = compileScript(descriptor, { id: 'learning-regression' })
const template = compileTemplate({ source: descriptor.template.content, filename, id: 'learning-regression', compilerOptions: { bindingMetadata: script.bindings } })
assert.deepEqual(template.errors, [])
const source = script.content.replace('export default', 'const component =').replace("'../../core/platform'", "'test-platform'") + '\n' + template.code.replace('export function render', 'function render') + `
import { createApp } from 'vue';
component.render = render;
const setup = component.setup;
component.setup = (props, context) => { const bindings = setup(props, context); window.lesson = bindings; return bindings };
window.lessonKnowledge = knowledge;
createApp(component).mount('#app');`
const scratch = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'tarot-learning-'))
fs.writeFileSync(path.join(scratch, 'hooks.cjs'), `exports.onShow = cb => window.hooks.show.push(cb); exports.onHide = cb => window.hooks.hide.push(cb); exports.onUnload = cb => window.hooks.unload.push(cb);`)
fs.writeFileSync(path.join(scratch, 'platform.cjs'), `exports.readStore = () => { if(window.failRead) throw Error('unavailable'); return null }; exports.writeStore = (key, data) => window.writes.push(data); exports.notify = text => window.notices.push(text); exports.cardImage = id => 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';`)
const bundle = esbuild.buildSync({ stdin: { contents: source, loader: 'ts', resolveDir: path.dirname(filename) }, bundle: true, platform: 'browser', format: 'iife', write: false, 
 alias: { '@dcloudio/uni-app': path.join(scratch, 'hooks.cjs'), 'test-platform': path.join(scratch, 'platform.cjs') } })
for (const name of ['hooks.cjs', 'platform.cjs']) fs.unlinkSync(path.join(scratch, name))
fs.rmdirSync(scratch)
;(async () => {
 const browser = await chromium.launch({ headless: true })
 try {
  async function mount(failRead = false) {
   const page = await browser.newPage({ viewport: { width: 375, height: 812 } })
   page.on('pageerror', error => console.error(error))
   await page.setContent('<div id="app"></div>')
   await page.addStyleTag({ content: 'view,scroll-view{display:block}image{display:inline-block}body{margin:0}' + descriptor.styles.map(s => s.content).join('\n').replace(/([\d.]+)rpx/g, (_, n) => Number(n) / 2 + 'px') })
   await page.evaluate(fail => { window.failRead = fail; window.hooks = { show: [], hide: [], unload: [] }; window.writes = []; window.notices = []; window.clock = 30 * 86400000; Date.now = () => window.clock }, failRead)
   await page.addScriptTag({ content: bundle.outputFiles[0].text })
   return page
  }
  const page = await mount()
  const knowledgeCount = await page.evaluate(async () => {
   const l = window.lesson, a = l.academy
   let count = 0
   for (const id of a.cardPath) for (const [mode, index] of [['foundation',0],['application',0],['application',2],['integration',0]]) {
    l.data.value = a.blank()
    l.data.value.session = {unitId:id,mode,index,startedAt:1000,seed:37,contentVersion:a.version,answers:{},support:null,hint:false,complete:false,lang:'zh'}
    l.view.value = 'lesson'
    const before = JSON.stringify(l.data.value)
    await Promise.resolve()
    const expected = a.knowledgeLesson(window.lessonKnowledge,id,a.stepFor(l.data.value.session))
    if (!expected || !document.querySelector('.knowledge')?.textContent.includes(expected.text)) throw Error(id+' missing '+mode+' knowledge in real Vue lesson')
    if (JSON.stringify(l.data.value)!==before) throw Error('Knowledge rendering changed learning evidence')
    count++
   }
   l.data.value = a.blank(); l.view.value = 'home'; await Promise.resolve()
   return count
  })
  assert.equal(knowledgeCount,312)
  const due = await page.evaluate(async () => {
   const l = window.lesson, a = l.academy, at = window.clock
   // Complete the actual beginner route so that only time determines the next item.
   let item, rounds = 0
   while ((item = a.stageNext(l.data.value, 'B', at)) && rounds++ < 100) {
    l.start(item)
    while (!l.session.value.complete) {
     const step = a.stepFor(l.session.value)
     if (step.kind === 'question') l.choose(step.question.correct)
     l.nextStep()
    }
   }
   l.goHome()
   const before = l.nextItem.value
   const snapshot = JSON.stringify(l.data.value)
   window.clock += 4 * 86400000
   const cached = l.nextItem.value
   window.hooks.show.forEach(cb => cb())
   return { before, cached, mode: l.nextItem.value?.mode, sameData: snapshot === JSON.stringify(l.data.value), rounds }
  })
  assert.equal(due.rounds, 86)
  assert.equal(due.before, null)
  assert.equal(due.cached, null, 'the fixture demonstrates Vue cached the pre-due recommendation')
  assert.ok(['practice', 'review'].includes(due.mode), 'onShow must make newly due reviews visible')
  assert.equal(due.sameData, true, 'refreshing time must not replace saved progress/session')
  const resumed = await page.evaluate(() => {
   const l = window.lesson
   l.data.value = l.academy.blank()
   l.start({ id: 'm00', mode: 'foundation' }); l.nextStep()
   l.choose(l.step.value.question.correct)
   l.onScroll({ detail: { scrollTop: 123 } })
   const snapshot = JSON.stringify(l.session.value)
   l.selectLevel('I'); l.start({ id: 'm01', mode: 'application' })
   window.hooks.hide.forEach(cb => cb()); window.clock += 100; window.hooks.show.forEach(cb => cb())
   l.selectLevel('B'); l.continueCourse()
   return { snapshot, restored: JSON.stringify(l.session.value), view: l.view.value }
  })
  assert.equal(resumed.restored, resumed.snapshot, 'stage switch and onShow preserve answer/index/scroll when resuming')
  assert.equal(resumed.view, 'lesson')
  await page.evaluate(() => { const l = window.lesson; l.data.value = l.academy.blank(); l.selectLevel('A'); l.start({ id: 'A06', mode: 'learn' }); for(let i=0;i<12;i++)l.nextStep() })
  const layout = await page.evaluate(() => {
   const cards = [...document.querySelectorAll('.cards .card-item')]
   const box = element => { const r = element.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height } }
   return cards.map(el => ({ item: box(el), picture: box(el.querySelector('.card-picture')), caption: box(el.querySelector('.card-caption')), rotation: getComputedStyle(el.querySelector('.card-picture')).transform, text: el.querySelector('.card-caption').textContent }))
  })
  assert.equal(layout.length, 10)
  assert.equal(layout[0].item.x, layout[1].item.x)
  assert.equal(layout[0].item.y, layout[1].item.y)
  assert.ok(layout[1].picture.x < layout[0].picture.x && layout[1].picture.width > layout[0].picture.width, 'the crossing image is visibly horizontal over the center')
  assert.equal(layout[1].rotation, 'matrix(0, 1, -1, 0, 0, 0)')
  assert.match(layout[1].text, /2 · 交叉阻碍/)
  assert.ok(layout[1].caption.x >= layout[0].item.x + layout[0].item.width, 'crossing caption sits beside the center')
  assert.ok(layout[4].item.x < layout[0].item.x && layout[0].item.x < layout[5].item.x && layout[5].item.x < layout[8].item.x, 'past, center, future and staff preserve their teaching relationships')
  await page.locator('.crossing .card-picture').dispatchEvent('tap')
  assert.equal(await page.locator('.zoom .zoom-picture.reversed').count(), 0, 'horizontal crossing does not imply reversed zoom')
  await page.locator('.zoom-close').dispatchEvent('tap')
  // Stress the crossing transform with an inverted face; horizontal placement stays separate from semantic orientation.
  await page.evaluate(() => { const l = window.lesson; window.originalStepFor = l.academy.stepFor; l.academy.stepFor = s => ({ ...window.originalStepFor(s), reversed: true }); l.data.value.session = { ...l.session.value } })
  assert.equal(await page.locator('.crossing .card-picture.reversed').count(), 1)
  assert.equal(await page.locator('.crossing .card-picture').evaluate(el => getComputedStyle(el).transform), 'matrix(0, -1, 1, 0, 0, 0)')
  await page.locator('.crossing .card-picture').dispatchEvent('tap')
  assert.equal(await page.locator('.zoom .zoom-picture.reversed').count(), 1)
  assert.match(await page.locator('.zoom').innerText(), /逆位/)
  await page.locator('.zoom-close').dispatchEvent('tap')
  await page.evaluate(() => { const l = window.lesson; l.academy.stepFor = window.originalStepFor; l.data.value.session = { ...l.session.value } })
  const orientations = await page.evaluate(() => {
   const l = window.lesson, cases = []
   for (const mode of ['application', 'practice', 'reverse', 'reverse-review']) {
    l.start({ id: 'm00', mode, key: 'Q3' })
    const count = l.plan.value.length
    for (let index = 0; index < count; index++) {
     l.session.value.index = index
     cases.push({ mode, reversed: l.reversedCard('m00'), expected: !!(l.step.value.reversed || mode.startsWith('reverse')) })
    }
   }
   return cases
  })
  assert.ok(orientations.some(c => !c.reversed) && orientations.some(c => c.reversed))
  orientations.forEach(c => assert.equal(c.reversed, c.expected, 'generated ' + c.mode + ' orientation'))
  await page.close()
  const failed = await mount(true)
  const safe = await failed.evaluate(() => {
   const l = window.lesson
   l.start({ id: 'm00', mode: 'foundation' }); l.nextStep()
   window.hooks.hide.forEach(cb => cb()); window.hooks.show.forEach(cb => cb())
   return { writes: window.writes.length, notices: window.notices, session: l.session.value.unitId }
  })
  assert.equal(safe.writes, 0, 'unreadable existing storage is never overwritten by a blank state')
  assert.equal(safe.session, 'm00', 'temporary in-memory learning remains usable')
  assert.ok(safe.notices.some(n => n.includes('原记录未覆盖')))
  await failed.close()
  console.log('PASS learning page: actual Vue SFC + generated engine; onShow due refresh, pause/resume, crossed A06 layout/captions/orientations/zoom, read failure preserves storage.')
 } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
