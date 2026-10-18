'use strict'
// Mount the public cultural-learning Vue SFC with real 78-card projected content.
// Native lifecycle, storage and page navigation are the only mocked boundaries.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), os = require('node:os')
const { createRequire } = require('node:module'), { chromium } = require('playwright')
const mini = path.resolve(__dirname, '../apps/miniapp'), requireMini = createRequire(path.join(mini, 'package.json'))
const { parse, compileScript, compileTemplate } = requireMini('@vue/compiler-sfc'), esbuild = requireMini('esbuild')
const filename = path.join(mini, 'src/pages/mengyu/learn.vue'), raw = fs.readFileSync(filename, 'utf8')
assert.ok(raw.includes("'mengyu-image-learning-v1'"))
assert.ok(!/from ['"][^'"]*(?:catalogs|academy|drawing|\/platform)['"]/.test(raw), 'public lesson only imports its cultural catalog and generic platform boundary')
const { descriptor } = parse(raw, { filename }), script = compileScript(descriptor, { id: 'mengyu-learning' })
const template = compileTemplate({ source: descriptor.template.content, filename, id: 'mengyu-learning', compilerOptions: { bindingMetadata: script.bindings } })
assert.deepEqual(template.errors, [])
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'mengyu-learning-'))
fs.writeFileSync(path.join(scratch, 'hooks.cjs'), `exports.onBackPress = cb => window.hooks.back = cb; exports.onShow = cb => window.hooks.show.push(cb); exports.onHide = cb => window.hooks.hide.push(cb); exports.onUnload = cb => window.hooks.unload.push(cb);`)
const source = script.content.replace('export default', 'const component =') + '\n' + template.code.replace('export function render', 'function render') + `\nimport { createApp, nextTick as testNextTick } from 'vue'; window.flush = testNextTick; window.projectedCards = cards; component.render = render; const setup = component.setup; component.setup = (props, context) => { const bindings = setup(props, context); window.subject = bindings; return bindings }; createApp(component).mount('#app');`
const bundle = esbuild.buildSync({ stdin: { contents: source, loader: 'ts', resolveDir: path.dirname(filename) }, bundle: true, platform: 'browser', format: 'iife', write: false, alias: { '@dcloudio/uni-app': path.join(scratch, 'hooks.cjs') } }).outputFiles[0].text
fs.unlinkSync(path.join(scratch, 'hooks.cjs')); fs.rmdirSync(scratch)
;(async () => {
 const browser = await chromium.launch(require('./browser_options.cjs'))
 try {
  async function mount(width = 390, saved = null, failRead = false) {
   const page = await browser.newPage({ viewport: { width, height: 844 } }), errors = []
   page.on('pageerror', e => errors.push(e.message))
   await page.setContent('<div id="app"></div>')
   await page.addStyleTag({ content: 'view,scroll-view{display:block}image{display:inline-block}button{border:0}body{margin:0}*{box-sizing:border-box}' + descriptor.styles.map(s => s.content).join('\n').replace(/([\d.]+)rpx/g, (_, n) => Number(n) / 2 + 'px') })
   await page.evaluate(({ saved, failRead }) => { window.hooks = { show: [], hide: [], unload: [] }; window.clock = Date.now(); Date.now = () => window.clock; window.notices = []; window.writes = []; window.failRead = failRead; window.values = { 'tarot-miniapp-academy-v1': { private: 'legacy-learning-sentinel' }, 'tarot-miniapp-reading-v1': { private: 'legacy-reading-sentinel' } }; if (saved !== null) window.values['mengyu-image-learning-v1'] = saved; window.uni = { getStorageSync: key => { if (window.failRead) throw Error('unavailable'); return window.values[key] }, setStorageSync: (key, value) => { if (window.failWrite) throw Error('quota'); window.writes.push(key); window.values[key] = JSON.parse(JSON.stringify(value)) }, showToast: options => window.notices.push(options.title) } }, { saved, failRead })
   await page.addScriptTag({ content: bundle })
   return { page, errors }
  }
  const { page, errors } = await mount()
  assert.equal(await page.locator('button.primary').count(), 1, 'home has one clear primary learning task')
  assert.equal(await page.locator('.lesson-link').count(), 0, '78-image directory is deferred')
  const covered = await page.evaluate(async () => {
   const s = window.subject, all = window.projectedCards
   if (all.length !== 78 || new Set(all.map(item => item.id)).size !== 78) throw Error('expected 78 distinct historical images')
   for (const item of all) {
    s.start(item.id); await window.flush()
    if (s.session.value.step !== 0 || !document.querySelector('.lesson-content')?.textContent.includes(item.observation)) throw Error(item.id + ': observation must precede assessment')
    if (document.querySelectorAll('.option').length) throw Error(item.id + ': assessment appeared before teaching')
    s.advance(); await window.flush()
    if (!document.querySelector('.lesson-content')?.textContent.includes(s.symbol.value.meaning)) throw Error(item.id + ': missing authored symbol teaching')
    s.advance(); await window.flush()
    if (s.options.value.length !== 3 || new Set(s.options.value.map(option => option.text)).size !== 3 || s.options.value.find(option => option.id === 'match')?.text !== s.symbol.value.meaning) throw Error(item.id + ': unsupported answer set')
    const wrong = s.options.value.find(option => option.id !== 'match').id
    await s.choose(wrong); s.complete(); await window.flush()
    if (s.data.value.progress[item.id] || s.session.value.step !== 2) throw Error(item.id + ': wrong answer awarded completion')
    if (!document.querySelector('.feedback')?.textContent.includes(s.symbol.value.label + '：' + s.symbol.value.meaning)) throw Error(item.id + ': wrong answer needs symbol evidence')
    s.retry(); await window.flush()
    if (s.session.value.answer !== null || document.querySelector('.feedback')) throw Error(item.id + ': retry must allow a fresh recognition')
    await s.choose('match'); s.complete(); s.complete(); await window.flush()
    if (s.session.value.step !== 3 || s.data.value.progress[item.id]?.visits !== 1) throw Error(item.id + ': correct completion must count exactly once')
   }
   const snapshot = JSON.parse(JSON.stringify(s.data.value)), ids = all.map(item => item.id)
   window.clock += 2 * 86400000; window.hooks.show.forEach(callback => callback())
   if (!s.nextIsReview.value || s.recommended.value.id !== ids[0]) throw Error('due cultural recognition must be offered again')
   s.beginRecommended(); if (s.session.value.variant !== 1) throw Error('review rotates the taught symbol when available')
   return { count: s.completedCount.value, snapshot, untouched: window.values['tarot-miniapp-academy-v1'].private === 'legacy-learning-sentinel' && window.values['tarot-miniapp-reading-v1'].private === 'legacy-reading-sentinel', keys: [...new Set(window.writes)] }
  })
  assert.equal(covered.count, 78); assert.equal(covered.untouched, true); assert.deepEqual(covered.keys, ['mengyu-image-learning-v1'])
  const navigation = await page.evaluate(async () => {
   const s = window.subject; s.data.value = s.blank(); s.view.value = 'home'; s.navigation.length = 0
   s.onScroll({ detail: { scrollTop: 80 } }); s.openCatalog(); s.onScroll({ detail: { scrollTop: 540 } }); const group = s.openedGroup.value
   s.start(window.projectedCards[2].id); s.advance(); s.onScroll({ detail: { scrollTop: 215 } }); const snapshot = JSON.stringify(s.session.value)
   s.openZoom(); const closedZoom = window.hooks.back(), viewAfterZoom = s.view.value
   const returned = window.hooks.back(); await window.flush(); await window.flush()
   const catalog = { view: s.view.value, scroll: s.scrollTop.value, group: s.openedGroup.value, same: JSON.stringify(s.session.value) === snapshot }
   s.start(window.projectedCards[2].id); await window.flush(); await window.flush(); const resumedScroll = s.scrollTop.value
   s.back(); s.back(); await window.flush(); await window.flush()
   return { closedZoom, viewAfterZoom, returned, catalog, group, resumedScroll, home: s.view.value, homeScroll: s.scrollTop.value, root: window.hooks.back(), saved: window.values['mengyu-image-learning-v1'] }
  })
  assert.equal(navigation.closedZoom, true); assert.equal(navigation.viewAfterZoom, 'lesson'); assert.equal(navigation.returned, true)
  assert.deepEqual(navigation.catalog, { view: 'catalog', scroll: 540, group: navigation.group, same: true }); assert.equal(navigation.resumedScroll, 215)
  assert.equal(navigation.home, 'home'); assert.equal(navigation.homeScroll, 80); assert.equal(navigation.root, false)
  assert.deepEqual(errors, []); await page.close()
  const resumed = await mount(320, navigation.saved)
  assert.equal(await resumed.page.locator('button.primary').innerText(), '继续学习')
  await resumed.page.locator('button.primary').dispatchEvent('tap')
  assert.equal(await resumed.page.locator('.eyebrow').innerText(), '认识象征', 'reloading resumes the saved teaching step')
  assert.ok((await resumed.page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, '320px lesson has no horizontal overflow')
  assert.deepEqual(resumed.errors, []); await resumed.page.close()
  const failing = await mount()
  const failedCompletion = await failing.page.evaluate(async () => {
   const s = window.subject; s.openCatalog(); s.start(window.projectedCards[0].id); s.advance(); s.advance(); await s.choose('match')
   const committed = JSON.stringify(window.values['mengyu-image-learning-v1']); window.failWrite = true; s.complete(); s.complete(); await window.flush()
   const inMemory = JSON.stringify(s.data.value), completedText = document.querySelector('.completion')?.textContent
   s.back(); await window.flush(); const catalog = s.view.value
   window.hooks.hide.forEach(callback => callback()); window.hooks.show.forEach(callback => callback())
   const pendingVisible = !!document.querySelector('.save-status .save-retry'), statusAfterBack = s.persistence.value
   if (JSON.stringify(window.values['mengyu-image-learning-v1']) !== committed) throw Error('failed completion overwrote prior storage')
   window.failWrite = false; s.retrySave(); s.retrySave(); await window.flush()
   return { completedText, inMemory, catalog, pendingVisible, statusAfterBack, status: s.persistence.value, saved: window.values['mengyu-image-learning-v1'], notice: !!document.querySelector('.save-status'), visits: s.data.value.progress[window.projectedCards[0].id].visits }
  })
  assert.ok(failedCompletion.completedText.includes('进度尚未保存')); assert.equal(failedCompletion.catalog, 'catalog'); assert.equal(failedCompletion.pendingVisible, true); assert.equal(failedCompletion.statusAfterBack, 'unsaved')
  assert.equal(failedCompletion.status, 'ready'); assert.equal(failedCompletion.notice, false); assert.equal(failedCompletion.visits, 1)
  assert.equal(JSON.stringify(failedCompletion.saved), failedCompletion.inMemory, 'retry commits the entire current memory state without repeating completion')
  assert.deepEqual(failing.errors, []); await failing.page.close()
  const restoredCompletion = await mount(390, failedCompletion.saved)
  assert.deepEqual(await restoredCompletion.page.evaluate(() => window.subject.data.value), failedCompletion.saved, 'reload restores the exact saved completion and visit count')
  assert.deepEqual(restoredCompletion.errors, []); await restoredCompletion.page.close()
  const broken = await mount(390, { version: 99, private: 'preserve-invalid-new-data' })
  const safe = await broken.page.evaluate(() => { const s = window.subject; s.beginRecommended(); s.advance(); window.hooks.hide.forEach(callback => callback()); return { writes: window.writes, raw: window.values['mengyu-image-learning-v1'], notices: window.notices } })
  assert.deepEqual(safe.writes, []); assert.deepEqual(safe.raw, { version: 99, private: 'preserve-invalid-new-data' }); assert.ok(safe.notices.some(text => text.includes('原记录未覆盖')))
  assert.equal(await broken.page.locator('.save-status.protected').count(), 1, 'read failure remains visible after temporary learning'); assert.equal(await broken.page.locator('.save-retry').count(), 0, 'unreadable original data offers no overwrite retry'); await broken.page.evaluate(() => window.subject.retrySave()); assert.deepEqual(await broken.page.evaluate(() => window.writes), []); assert.deepEqual(broken.errors, []); await broken.page.close()
  console.log('PASS Mengyu cultural learning: all 78 authored images teach before symbol recognition; wrong-answer evidence/retry; exact-once completion; due reviews; visible unsaved completion/Back/retry/exact reload and read-failure protection; isolated store/legacy preservation; one-level Back/zoom/catalog scroll; reload and 320px layout. Native WeChat gesture support remains a manual check.')
 } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
