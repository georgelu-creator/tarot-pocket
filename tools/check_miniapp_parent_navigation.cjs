'use strict'
// Actual restored full-edition H5: parent routes preserve course and current-card evidence.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path')
const { chromium } = require('playwright'), { createPreview } = require('../apps/miniapp/tools/preview.cjs')
const root = path.resolve(__dirname, '..'), LEARN = 'tarot-miniapp-academy-v1', DRAW = 'tarot-miniapp-reading-v1'
;(async () => {
 const server = createPreview(); await new Promise(r => server.listen(0, '127.0.0.1', r))
 const origin = `http://127.0.0.1:${server.address().port}`, browser = await chromium.launch(require('./browser_options.cjs'))
 try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } }), page = await context.newPage(), errors = [], unexpected = []
  page.on('pageerror', e => errors.push(e.message)); page.setDefaultTimeout(10000)
  await page.route('**/*', route => { const u = new URL(route.request().url()); if (u.origin === origin) return route.continue(); if (u.origin === 'https://tarot.georgelu.cn' && /^\/assets\/cards\/[mcwsp]\d{2}\.webp$/.test(u.pathname)) return route.fulfill({ body: fs.readFileSync(path.join(root, u.pathname)), contentType: 'image/webp' }); unexpected.push(u.origin + u.pathname); return route.abort() })
  async function tab(name) { await page.locator('.floating-nav-item').filter({ hasText: new RegExp('^' + name + '$') }).click() }
  async function stored(key) { return page.evaluate(k => { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw).data : null }, key) }
  await page.goto(origin); await page.locator('.hero').waitFor(); await tab('学牌')
  await page.locator('.catalog-link').click(); await page.locator('.lesson-link').first().click(); await page.locator('.lesson-content').waitFor()
  await page.evaluate(key => { window.realSet = Storage.prototype.setItem; Storage.prototype.setItem = function(k, v) { if (k === key) throw Error('quota'); return window.realSet.call(this, k, v) } }, LEARN)
  await page.locator('.lesson-content .primary').click(); await page.locator('.save-status').waitFor()
  const unsavedText = await page.locator('.lesson-content').innerText()
  await page.locator('.lesson-header .link').click(); await page.locator('.lesson-link').first().waitFor(); await page.locator('.save-status').waitFor()
  await page.evaluate(() => { Storage.prototype.setItem = window.realSet })
  await page.locator('.save-status .link').click(); await page.locator('.save-status').waitFor({ state: 'detached' })
  const saved = await stored(LEARN); assert.equal(saved.session.index, 1, 'Back retries persistence without replaying the lesson advance')
  await page.locator('.lesson-link').first().click(); await page.locator('.lesson-content').waitFor(); assert.equal(await page.locator('.lesson-content').innerText(), unsavedText, 'directory resumes the current step')
  await page.locator('.lesson-header .link').click(); await page.locator('.header .link').click(); await page.locator('.current .primary').click(); await page.locator('.lesson-content').waitFor()
  await page.locator('.lesson-header .link').click(); await page.locator('.current .primary').waitFor(); assert.equal((await stored(LEARN)).session.index, 1, 'home entry returns to home without rewinding evidence')
  await page.reload(); await page.locator('.current .primary').click(); await page.locator('.lesson-content').waitFor(); assert.equal(await page.locator('.lesson-content').innerText(), unsavedText, 'retried learning survives reload')
  await tab('抽牌'); await page.locator('.spread-item').first().click(); await page.locator('textarea').fill('怎样安排这一周的绘画练习？'); await page.locator('.setup .primary').click()
  await page.locator('.cut-pile').first().waitFor(); await page.locator('.cut-pile').nth(1).click(); await page.locator('.fan-card').last().waitFor()
  await page.locator('.fan-card').last().click(); await page.locator('.pending-sheet').waitFor(); await page.keyboard.press('Escape'); await page.locator('.pending-sheet').waitFor({ state: 'detached' }); assert.equal((await stored(DRAW)).draft.picked.length, 0)
  await page.locator('.fan-card').last().click(); await page.locator('.pending-sheet .primary').click(); await page.locator('.pending-sheet').waitFor({ state: 'detached' }); await page.locator('.flying-back').waitFor({ state: 'detached' })
  const chosen = (await stored(DRAW)).draft
  await page.locator('.parent-back:visible').click(); await page.locator('.setup').waitFor(); assert.equal(await page.locator('textarea').inputValue(), chosen.question); assert.equal(await page.locator('.setup .primary').innerText(), '回到当前牌局')
  await page.locator('.setup .primary').click(); await page.locator('.slot-back.filled').waitFor(); const resumed = (await stored(DRAW)).draft; for (const key of ['id', 'pool', 'picked', 'phase', 'question', 'topic']) assert.deepEqual(resumed[key], chosen[key], 'parent resume preserves ' + key)
  await page.locator('.parent-back:visible').click(); await page.locator('.setup').waitFor(); await page.locator('.parent-back:visible').click(); await page.locator('.spread-item').first().waitFor(); assert.equal(await page.locator('textarea').count(), 0)
  await page.locator('.spread-item').first().click(); assert.equal(await page.locator('.setup .primary').innerText(), '开始抽牌', 'explicit new selection keeps new-game semantics'); await page.locator('.setup .primary').click(); await page.locator('.shuffle-table').waitFor(); assert.notEqual((await stored(DRAW)).draft.id, chosen.id)
  const ordinary = (await stored(DRAW)).draft
  await tab('首页'); await page.locator('.daily').click(); await page.locator('.cut-pile').first().waitFor(); await page.locator('.cut-pile').first().click(); await page.locator('.fan-card').last().waitFor()
  await page.locator('.parent-back:visible').click(); await page.locator('.setup').waitFor(); await page.locator('textarea').fill('今天可以怎样练习？'); await page.locator('.setup .primary').click(); await page.locator('.shuffle-table').waitFor()
  const dailyState = await stored(DRAW); assert.equal(dailyState.active, 'daily'); assert.match(dailyState.dailyDraft.dailyDate, /^\d{4}-\d{2}-\d{2}$/); assert.equal(dailyState.dailyDraft.question, '今天可以怎样练习？'); for (const key of ['id', 'pool', 'picked', 'phase', 'question', 'topic']) assert.deepEqual(dailyState.draft[key], ordinary[key], 'daily parent settings preserve ordinary ' + key)
  await tab('牌库'); await page.locator('.search input').fill('愚人'); await page.locator('.card').click(); await page.locator('.meaning:visible').waitFor(); await page.locator('.orientation:visible uni-button').last().click(); await page.locator('.chapter:visible').filter({ hasText: '相近牌的区别' }).click(); const name = await page.locator('.page > .title:visible').innerText(); await page.locator('.comparison:visible').first().click(); await page.waitForFunction(name => { const title = [...document.querySelectorAll('.page > .title')].filter(el => el.getClientRects().length).at(-1); return !!title && title.textContent !== name }, name)
  await page.locator('.parent-back:visible').click(); await page.locator('.page > .title:visible').filter({ hasText: new RegExp('^' + name + '$') }).waitFor(); assert.match(await page.locator('.meaning:visible').innerText(), /逆位牌义/)
  await page.locator('.parent-back:visible').click(); await page.locator('.search:visible').waitFor(); assert.equal(await page.locator('.search:visible input').inputValue(), '愚人'); assert.equal(await page.locator('.card:visible').count(), 1)
  assert.deepEqual(errors, []); assert.deepEqual(unexpected, []); await context.close()
  console.log('PASS full-miniapp parent navigation: home/catalog/lesson, failed save/back/retry/reload, pending cancel, retained pool/selection/settings, explicit new draw, comparison/detail/library parent and filters. Native gestures remain unverified.')
 } finally { await browser.close(); server.closeAllConnections(); await new Promise(r => server.close(r)) }
})().catch(e => { console.error(e); process.exitCode = 1 })
