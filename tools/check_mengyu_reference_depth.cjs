'use strict'
// Actual H5 cultural articles: all 78 historical images, authored symbol evidence and provenance.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path')
const { chromium } = require('playwright'), { createPreview } = require('../apps/miniapp/tools/preview.cjs')
const root = path.resolve(__dirname, '..')
;(async () => {
 const { cards, provenance } = await import(require('node:url').pathToFileURL(path.join(root, 'apps/miniapp/src/core/generated/mengyu.mjs')).href)
 assert.equal(cards.length, 78); assert.equal(new Set(cards.map(card => card.id)).size, 78)
 const server = createPreview(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
 const origin = `http://127.0.0.1:${server.address().port}`, browser = await chromium.launch(require('./browser_options.cjs'))
 try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } }), page = await context.newPage(), errors = [], unexpected = []
  page.setDefaultTimeout(10000); page.on('pageerror', e => errors.push(e.message))
  await page.route('**/*', route => { const u = new URL(route.request().url()); if (u.origin === origin) return route.continue(); if (u.origin === 'https://tarot.georgelu.cn' && /^\/assets\/cards\/[mcwsp]\d{2}\.webp$/.test(u.pathname)) return route.fulfill({ body: fs.readFileSync(path.join(root, u.pathname)), contentType: 'image/webp' }); unexpected.push(u.origin + u.pathname); return route.abort() })
  for (const card of cards) {
   await page.goto(origin + '/?referenceCase=' + card.id + '#/pages/artwork/index?id=' + card.id); await page.locator('.identity').waitFor()
   assert.equal(await page.locator('.heading .title').innerText(), card.name)
   const article = await page.locator('.page').innerText()
   const theme = await page.locator('.section').nth(2).innerText()
   assert(!/解读|建议位|牌位|旁边的牌|抽到|正位|逆位/.test(theme), card.id + ' cultural theme must not give reading instructions')
   for (const expected of [card.observation, card.core, card.foundation.text, provenance.edition, provenance.artist, provenance.note, 'CC BY-SA 4.0']) assert.ok(article.includes(expected), card.id + ' missing authored culture/provenance field')
   assert.equal(await page.locator('.symbol').count(), card.symbols.length)
   for (const symbol of card.symbols) assert.ok(article.includes(symbol.label) && article.includes(symbol.meaning), card.id + ' missing symbol evidence')
   assert.equal(await page.locator('.source-link').count(), 1); assert.equal(await page.locator('textarea,.orientation,.meaning,.comparison,.reading-card').count(), 0, 'reference does not contain prediction/directional reading controls')
   await page.locator('.picture img').waitFor(); await page.waitForFunction(() => document.querySelector('.picture img')?.naturalWidth > 0)
   if (['m00', 'm16', 'w14', 'c07', 's09', 'p06'].includes(card.id)) {
    for (const width of [320, 390, 768, 1200]) { await page.setViewportSize({ width, height: 844 }); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), card.id + ' viewport ' + width) }
    await page.setViewportSize({ width: 390, height: 844 }); await page.locator('.picture-button').click(); await page.locator('.zoom').waitFor(); await page.locator('.zoom-close').click(); await page.locator('.zoom').waitFor({ state: 'detached' })
   }
   // A standalone detail link has no prior stack: its fallback remains within the public cultural library.
   await page.locator('.heading .back').click(); await page.locator('.grid .card').first().waitFor(); assert.equal(await page.locator('.card').count(), 78)
   assert.match(page.url(), /#\/pages\/mengyu\/library/)
  }
  await page.goto(origin + '/#/pages/artwork/index?id=missing'); await page.locator('.empty').waitFor(); assert.match(await page.locator('.empty').innerText(), /没有找到/); await page.locator('.empty uni-button').click(); await page.locator('.grid .card').first().waitFor()
  assert.deepEqual(errors, []); assert.deepEqual(unexpected, []); await context.close()
  console.log('PASS actual cultural uni-app H5: all 78 full observation/symbol/theme/source articles, verified artwork loads, direct-link Back fallback and missing-image recovery; representative 320/390/768/1200 without overflow or third-party requests.')
 } finally { await browser.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)) }
})().catch(error => { console.error(error); process.exitCode = 1 })
