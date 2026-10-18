'use strict'
// Exercise the public cultural edition's actual H5 build; historical product flows are not public routes.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path')
const { chromium } = require('playwright'), { createPreview } = require('../apps/miniapp/tools/preview.cjs')
const root = path.resolve(__dirname, '..'), KEY = 'mengyu-image-learning-v1'
;(async () => {
 const server = createPreview(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
 const origin = `http://127.0.0.1:${server.address().port}`, browser = await chromium.launch(require('./browser_options.cjs'))
 try {
  for (const width of [320, 390, 768, 1200]) {
   const context = await browser.newContext({ viewport: { width, height: 844 } }), page = await context.newPage(), errors = [], unexpected = []
   page.setDefaultTimeout(10000); page.on('pageerror', e => errors.push(e.message))
   await page.route('**/*', route => { const u = new URL(route.request().url()); if (u.origin === origin) return route.continue(); if (u.origin === 'https://tarot.georgelu.cn' && /^\/assets\/cards\/[mcwsp]\d{2}\.webp$/.test(u.pathname)) return route.fulfill({ body: fs.readFileSync(path.join(root, u.pathname)), contentType: 'image/webp' }); unexpected.push(u.origin + u.pathname); return route.abort() })
   await page.addInitScript(() => { if (!localStorage.getItem('cultural-ui-fixture')) { localStorage.setItem('tarot-miniapp-academy-v1', JSON.stringify({ type: 'object', data: { private: 'preserve-legacy-learning' } })); localStorage.setItem('tarot-miniapp-reading-v1', JSON.stringify({ type: 'object', data: { private: 'preserve-legacy-reading' } })); localStorage.setItem('cultural-ui-fixture', '1') } })
   const tabs = page.locator('.uni-tabbar__item')
   async function tab(label) { await tabs.filter({ hasText: new RegExp('^' + label + '$') }).click() }
   async function noOverflow(label) { assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width}px ${label} horizontal overflow`) }
   async function oldUnchanged() { assert.deepEqual(await page.evaluate(() => [localStorage.getItem('tarot-miniapp-academy-v1'), localStorage.getItem('tarot-miniapp-reading-v1')]), legacy, 'culture edition never migrates or overwrites prior learning/reading stores') }
   async function scrollPosition(screen = '.screen') { return page.locator(screen).evaluate(el => Math.max(0, ...[el, ...el.querySelectorAll('*')].map(node => node.scrollTop || 0))) }
   await page.goto(origin); await page.locator('.hero .primary').waitFor()
   const legacy = await page.evaluate(() => [localStorage.getItem('tarot-miniapp-academy-v1'), localStorage.getItem('tarot-miniapp-reading-v1')])
   assert.equal(await page.title(), '秘境梦屿'); assert.equal(await tabs.count(), 3)
   assert.deepEqual((await tabs.allTextContents()).map(text => text.trim()), ['首页', '学习', '图鉴'])
   assert.match(await page.locator('.eyebrow').innerText(), /秘境梦屿/)
   await noOverflow('home'); await page.locator('.hero .primary').click(); await page.locator('.current .primary').waitFor()
   assert.equal(await page.locator('uni-button.primary').count(), 1, 'learning starts with one primary task')
   assert.equal(await page.locator('.lesson-link').count(), 0, '78 images are not flattened onto the learning home')
   await page.locator('.catalog-link').click(); await page.locator('.chapter-heading').first().waitFor(); await noOverflow('course directory')
   // Enter from the secondary directory; return must restore that directory rather than leave learning.
   await page.locator('.lesson-link').nth(2).click(); await page.locator('.lesson-content').waitFor(); const courseName = await page.locator('.lesson-title').innerText()
   assert.equal(await page.locator('.option').count(), 0, 'observation is taught before any assessment')
   assert.match(await page.locator('.eyebrow').innerText(), /看画面/)
   await page.locator('.artwork-button').click(); await page.locator('.zoom').waitFor(); await page.keyboard.press('Escape'); await page.locator('.zoom').waitFor({ state: 'detached' })
   await page.locator('.header .link').click(); await page.locator('.chapter-heading').first().waitFor()
   assert.ok((await page.locator('.lesson-link').allInnerTexts()).some(text => text.includes(courseName) && text.includes('继续学习')))
   await page.locator('.lesson-link').filter({ hasText: courseName }).click(); await page.locator('.lesson-content').waitFor()
   // Fail one real H5 storage write, then retry by returning; the saved teaching step must survive reload.
   const before = await page.evaluate(key => localStorage.getItem(key), KEY)
   await page.evaluate(key => { window.originalStorageSet = Storage.prototype.setItem; Storage.prototype.setItem = function (name, value) { if (name === key) throw Error('quota'); return window.originalStorageSet.call(this, name, value) } }, KEY)
   await page.locator('.lesson-content .primary').click(); await page.getByText('认识象征', { exact: true }).waitFor()
   assert.equal(await page.evaluate(key => localStorage.getItem(key), KEY), before, 'failed storage write preserves last committed progress')
   await page.evaluate(() => { Storage.prototype.setItem = window.originalStorageSet })
   await page.locator('.header .link').click(); await page.locator('.chapter-heading').first().waitFor(); await page.reload()
   await page.locator('.current .primary').waitFor(); assert.equal(await page.locator('.current .primary').innerText(), '继续学习')
   await page.locator('.current .primary').click(); await page.getByText('认识象征', { exact: true }).waitFor(); assert.equal(await page.locator('.lesson-title').innerText(), courseName)
   await page.locator('.lesson-content .primary').click(); await page.locator('.option').first().waitFor()
   const beforeAnswer = await page.locator('.question').innerText(); await tab('首页'); await tab('学习'); assert.equal(await page.locator('.question').innerText(), beforeAnswer, 'background/foreground preserves the active recognition task')
   // Correctness is authored, not inferred from displayed text. Read the isolated synthetic session identity only.
   const correctText = await page.evaluate(key => { const raw = JSON.parse(localStorage.getItem(key)); const s = raw.data.session; return { id: s.id, variant: s.variant } }, KEY)
   const { cards } = await import(require('node:url').pathToFileURL(path.join(root, 'apps/miniapp/src/core/generated/mengyu.mjs')).href)
   const expected = cards.find(card => card.id === correctText.id).symbols[correctText.variant % cards.find(card => card.id === correctText.id).symbols.length]
   const options = await page.locator('.option').allInnerTexts(), wrongIndex = options.findIndex(text => text !== expected.meaning)
   assert.equal(options.length, 3); await page.locator('.option').nth(wrongIndex).click(); await page.locator('.feedback').waitFor()
   assert.match(await page.locator('.feedback').innerText(), /再看看画中的线索/); assert.ok((await page.locator('.feedback').innerText()).includes(expected.meaning))
   assert.equal(await page.evaluate(key => Object.keys(JSON.parse(localStorage.getItem(key)).data.progress).length, KEY), 0, 'wrong recognition awards no completion')
   await page.locator('.feedback .primary').click(); await page.locator('.feedback').waitFor({ state: 'detached' })
   await page.locator('.option').filter({ hasText: expected.meaning }).click()
   const beforeCompletion = await page.evaluate(key => localStorage.getItem(key), KEY)
   await page.evaluate(key => { window.originalStorageSet = Storage.prototype.setItem; Storage.prototype.setItem = function (name, value) { if (name === key) throw Error('quota'); return window.originalStorageSet.call(this, name, value) } }, KEY)
   await page.locator('.feedback .primary').click(); await page.locator('.completion').waitFor(); await page.locator('.save-status .save-retry').waitFor()
   assert.match(await page.locator('.completion').innerText(), /进度尚未保存/)
   assert.equal(await page.evaluate(key => localStorage.getItem(key), KEY), beforeCompletion, 'completion write failure keeps the last committed exercise state')
   await noOverflow('unsaved completed cultural lesson')
   if (width === 390) { await page.locator('.completion').evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished))); await page.screenshot({ path: '/tmp/mengyu-unsaved-h5.png' }) }
   await page.locator('.header .link').click(); await page.locator('.current .primary').waitFor()
   assert.equal(await page.locator('.save-status .save-retry').isVisible(), true, 'one-level Back preserves a persistent retry action')
   await page.evaluate(() => { Storage.prototype.setItem = window.originalStorageSet })
   await page.locator('.save-status .save-retry').click(); await page.locator('.save-status').waitFor({ state: 'detached' })
   const savedCompletion = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).data, KEY)
   assert.equal(Object.keys(savedCompletion.progress).length, 1); assert.equal(savedCompletion.progress[correctText.id].visits, 1); assert.equal(savedCompletion.session.step, 3)
   await page.reload(); await page.locator('.current .primary').waitFor()
   assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).data, KEY), savedCompletion, 'retry and reload restore the entire completion once')
   await noOverflow('saved learning home')
   await tab('图鉴'); await page.locator('.card').first().waitFor(); assert.equal(await page.locator('.card').count(), 78)
   await page.locator('.filters uni-button').filter({ hasText: /^权杖$/ }).click(); assert.equal(await page.locator('.card').count(), 14)
   const cardTarget = page.locator('.card').nth(13); await cardTarget.scrollIntoViewIfNeeded(); const cardName = await cardTarget.locator('.name').innerText(), libraryScroll = await scrollPosition()
   assert.ok(libraryScroll > 0, 'the fixture reaches a scrolled filtered library')
   await cardTarget.click(); await page.locator('.identity').waitFor(); assert.equal(await page.locator('.heading .title').innerText(), cardName)
   await page.locator('.picture-button').click(); await page.locator('.zoom').waitFor(); await page.locator('.zoom-close').click(); await page.locator('.zoom').waitFor({ state: 'detached' }); await noOverflow('artwork detail')
   if (width === 390) await page.screenshot({ path: '/tmp/mengyu-artwork-h5.png' })
   await page.locator('.heading .back').click(); await page.locator('.grid .card').first().waitFor(); assert.equal(await page.locator('.card').count(), 14)
   assert.equal(await page.locator('.filters uni-button.active').innerText(), '权杖'); assert.ok(Math.abs(await scrollPosition() - libraryScroll) < 10, 'Back preserves filtered library scroll')
   await page.locator('.search input').fill('权杖王后'); assert.equal(await page.locator('.card').count(), 1); await page.locator('.card').click(); await page.locator('.identity').waitFor(); await page.locator('.heading .back').click(); await page.locator('.search input').waitFor(); assert.equal(await page.locator('.search input').inputValue(), '权杖王后'); assert.equal(await page.locator('.card').count(), 1)
   await oldUnchanged()
   for (const forbidden of ['/pages/draw/index', '/pages/learn/index', '/pages/card/index?id=m00', '/pages/library/index', '/pages/history/index']) {
    await page.goto(origin + '/#' + forbidden); await page.waitForTimeout(120)
    assert.equal(await page.locator('textarea,.fan-card,.reading-card,.daily-result,.orientation,.stages,.ritual-panel').count(), 0, forbidden + ' cannot expose retired product behavior')
    assert.ok(!(await page.locator('body').innerText()).includes('开始抽牌'), forbidden + ' cannot show a retired draw action')
   }
   await page.goto(origin); await page.locator('.hero .primary').waitFor(); await oldUnchanged(); await noOverflow('public home')
   const protectedRaw = JSON.stringify({ type: 'object', data: { version: 99, private: 'preserve-invalid-cultural-progress' } })
   await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: KEY, value: protectedRaw })
   await page.reload(); await page.locator('.hero .primary').click(); await page.locator('.save-status.protected').waitFor()
   assert.equal(await page.locator('.save-retry').count(), 0, 'unreadable original progress has no overwrite action')
   await page.locator('.current .primary').click(); await page.locator('.lesson-content').waitFor(); await page.locator('.lesson-content .primary').click(); await page.locator('.header .link').click(); await page.locator('.current .primary').waitFor()
   assert.equal(await page.locator('.save-status.protected').isVisible(), true)
   assert.equal(await page.evaluate(key => localStorage.getItem(key), KEY), protectedRaw, 'temporary learning never overwrites unreadable progress')
   await oldUnchanged(); assert.equal(await page.locator('textarea,input[type=password]').count(), 0)
   assert.deepEqual(errors, []); assert.deepEqual(unexpected, []); await context.close()
   console.log(`PASS actual cultural H5 ${width}px: three public tabs, clear learning task/teaching/recognition/retry, persistent completion failure/Back/retry/exact reload/read protection/background, library filter/detail/zoom/one-level Back/scroll, retired routes inaccessible, legacy stores preserved, no overflow or extra requests`)
  }
 } finally { await browser.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)) }
})().catch(error => { console.error(error); process.exitCode = 1 })
