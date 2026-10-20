'use strict'
// Actual public H5 card routes: all authored reference fields, directions and verified artwork.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm')
const { pathToFileURL } = require('node:url')
const { chromium } = require('playwright'), { createPreview } = require('../apps/miniapp/tools/preview.cjs')
const root = path.resolve(__dirname, '..')
;(async () => {
 const { deck, reference } = await import(pathToFileURL(path.join(root, 'apps/miniapp/src/core/generated/content.mjs')).href)
 const { knowledge } = await import(pathToFileURL(path.join(root, 'apps/miniapp/src/pages/card/generated/knowledge.mjs')).href)
 const artwork = JSON.parse(fs.readFileSync(path.join(root, 'apps/miniapp/src/core/artwork.json'), 'utf8'))
 const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/manifest.json'), 'utf8'))
 const authored = { window: {} }
 for (const file of ['reading-deck.js', 'card-reference.js', 'card-knowledge.js']) vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), authored)
 const plain = value => JSON.parse(JSON.stringify(value))
 // The public miniapp is Chinese-only; compare every authored field except explicit English translations.
 const chinese = value => Array.isArray(value) ? value.map(chinese) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'en').map(([key, item]) => [key, chinese(item)])) : value
 assert.equal(deck.cards.length, 78); assert.equal(new Set(deck.cards.map(card => card.id)).size, 78)
 assert.deepEqual(plain(deck.cards), plain(chinese(authored.window.TAROT_READING_DECK.cards)), 'all original authored cards survive generation')
 assert.deepEqual(plain(reference.byId), plain(chinese(authored.window.TAROT_CARD_REFERENCE.byId)), 'all original authored reference fields survive generation')
 assert.deepEqual(plain(knowledge.byId), plain(chinese(authored.window.TAROT_CARD_KNOWLEDGE.byId)), 'all original authored detailed articles survive subpackage generation')
 const server = createPreview(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
 const origin = `http://127.0.0.1:${server.address().port}`, browser = await chromium.launch(require('./browser_options.cjs'))
 try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: ['clipboard-read', 'clipboard-write'] }), page = await context.newPage(), errors = [], unexpected = [], requestedImages = new Set()
  page.setDefaultTimeout(10000); page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', route => {
   const url = new URL(route.request().url())
   if (url.origin === origin) return route.continue()
   if (url.origin === 'https://tarot.georgelu.cn' && /^\/assets\/cards\/[mcwsp]\d{2}\.webp$/.test(url.pathname)) {
    requestedImages.add(url.pathname)
    return route.fulfill({ body: fs.readFileSync(path.join(root, url.pathname)), contentType: 'image/webp' })
   }
   unexpected.push(url.origin + url.pathname); return route.abort()
  })
  const chapter = title => page.locator('.chapter').filter({ hasText: title })
  const contains = (text, expected, label) => { assert.equal(typeof expected, 'string', label + ' authored string'); assert(expected.trim(), label + ' nonempty authored content'); assert(text.includes(expected), label + ' missing original content') }
  async function fit(label) {
   assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), label + ' document does not overflow')
   const escaped = await page.locator('.page,.hero,.cover,.paragraph,.symbol,.domain,.source,.comparison').evaluateAll(nodes => nodes.map(node => { const r = node.getBoundingClientRect(); return { left: r.left, right: r.right, width: r.width, className: node.className } }).filter(r => r.width && (r.left < -1 || r.right > innerWidth + 1)))
   assert.deepEqual(escaped, [], label + ' actual reference content stays inside viewport')
  }
  for (const card of deck.cards) {
   const article = reference.byId[card.id], detail = knowledge.byId[card.id], imageSource = manifest.items.find(item => item.card_id === card.id)
   assert(imageSource && imageSource.artist && imageSource.visual_edition && imageSource.source_page && imageSource.license_status_as_listed, card.id + ' historical artwork has provenance')
   assert.equal(artwork[card.id], `assets/cards/${card.id}.webp`, card.id + ' stable verified image mapping')
   await page.goto(origin + '/?referenceCase=' + card.id + '#/pages/card/index?id=' + card.id)
   await page.locator('.page > .title').filter({ hasText: card.name }).waitFor(); await page.locator('.meaning').waitFor()
   assert.equal(await page.locator('.page > .title').innerText(), card.name)
   const identity = await page.locator('.identity').innerText()
   contains(identity, card.suit, card.id + ' suit'); contains(identity, String(card.number), card.id + ' number')
   assert.equal(await page.locator('.memory-anchor').innerText(), article.upright.message)
   for (const keyword of card.keywords) contains(await page.locator('.keywords').innerText(), keyword, card.id + ' keyword')
   contains(await page.locator('.core').innerText(), article.core, card.id + ' core')
   for(const text of Object.values(detail.narrative))contains(await page.locator('.narrative').innerText(),text,card.id+' narrative visible before expanding')
   await page.locator('.picture img').waitFor(); await page.waitForFunction(() => { const image = document.querySelector('.picture img'); return image?.complete && image.naturalWidth > 100 && image.naturalHeight > image.naturalWidth })
   assert.equal(await page.locator('.picture img').getAttribute('src'), 'https://tarot.georgelu.cn/' + artwork[card.id], card.id + ' actual correct image loads')
   const scene = chapter('画面与象征').locator('..')
   assert.equal(await scene.locator('.symbol').count(), 0, card.id + ' scene is initially folded')
   await chapter('画面与象征').click(); contains(await scene.innerText(), article.observation, card.id + ' observation')
   assert.equal(await scene.locator('.symbol').count(), article.symbols.length)
   for (const symbol of article.symbols) { contains(await scene.innerText(), symbol.detail, card.id + ' symbol detail'); contains(await scene.innerText(), symbol.meaning, card.id + ' symbol meaning') }
   await chapter('画面与象征').click(); assert.equal(await scene.locator('.symbol').count(), 0, card.id + ' scene closes'); await chapter('画面与象征').click()
   for (const title of ['感情、工作、学业与生活', '金钱与资源', '相近牌的区别', '常见误读', '在整副牌中的位置', '情境实例', '传统出处与延伸理解']) await chapter(title).click()
   let body = await page.locator('.page').innerText()
   for (const expected of [article.misread, detail.structure, detail.history.text, article.encyclopedia.tradition, 'Tarot Pocket contributors', 'CC BY-SA 4.0']) contains(body, expected, card.id + ' article/history/license')
   for (const comparison of detail.relatedCards) contains(body, comparison.text, card.id + ' comparison')
   assert.equal(await page.locator('.comparison').count(), detail.relatedCards.length)
   for (const example of detail.examples) for (const expected of [example.title, example.situation, example.reading]) contains(body, expected, card.id + ' original example')
   for (const source of detail.sources) for (const expected of [source.title, source.scope]) contains(body, expected, card.id + ' source attribution')
   assert.equal(await page.locator('.sources .source-link').count(), detail.sources.length, card.id + ' every source remains accessible')
   await page.locator('.sources .source-link').first().click(); await page.waitForFunction(async expected => await navigator.clipboard.readText() === expected, detail.sources[0].url)
   for (const direction of ['upright', 'reversed']) {
    await page.locator('.orientation').getByText(direction === 'upright' ? '正位' : '逆位', { exact: true }).click()
    assert.equal(await page.locator('.memory-anchor').innerText(), article[direction].message, card.id + ' direction message')
    assert.match(await page.locator('.meaning .heading').first().innerText(), direction === 'upright' ? /正位/ : /逆位/)
    const meaning = await page.locator('.meaning').innerText(); body = await page.locator('.page').innerText()
    for (const paragraph of article[direction].meaning) contains(meaning, paragraph, card.id + ' ' + direction + ' authored meaning')
    if (direction === 'upright') for (const paragraph of detail.nuances) contains(meaning, paragraph, card.id + ' upright nuance')
    else for (const branch of detail.reversedBranches) { contains(meaning, branch.title, card.id + ' reversed branch title'); contains(meaning, branch.text, card.id + ' reversed branch') }
    for (const domain of ['love', 'career', 'study', 'life']) for (const paragraph of article[direction].contexts[domain]) contains(body, paragraph, card.id + ' ' + direction + ' reference context ' + domain)
    for (const domain of ['love', 'career', 'study', 'life', 'money']) contains(body, detail.domains[domain][direction], card.id + ' ' + direction + ' detailed domain ' + domain)
    assert.equal(await page.locator('.picture').evaluate(node => node.classList.contains('reversed')), direction === 'reversed', card.id + ' actual image orientation')
   }
   if (['m00', 'm16', 'w14', 'c07', 's09', 'p06'].includes(card.id)) {
    for (const width of [320, 390, 768, 1200]) { await page.setViewportSize({ width, height: 844 }); await fit(card.id + ' viewport ' + width) }
    await page.setViewportSize({ width: 390, height: 844 }); await page.locator('.cover').click(); await page.locator('#u-a-p > div').waitFor()
    await page.waitForFunction(() => document.querySelector('#u-a-p img')?.naturalWidth > 100)
    assert.equal(await page.locator('#u-a-p img').getAttribute('src'), 'https://tarot.georgelu.cn/' + artwork[card.id])
    await page.locator('#u-a-p > div > div').last().click(); await page.locator('#u-a-p > div').waitFor({ state: 'hidden' })
    assert.equal(await page.locator('.memory-anchor').innerText(), article.reversed.message, card.id + ' preview close retains direction')
   }
   // Standalone links have no prior route stack; fallback returns to the actual public library.
   await page.locator('.parent-back').click(); await page.locator('.grid .card').first().waitFor(); assert.equal(await page.locator('.grid .card').count(), 78)
   assert.match(page.url(), /#\/pages\/library\/index/)
  }
  for (const suffix of ['?id=missing', '']) {
   await page.goto(origin + '/?missingReferenceCase=' + encodeURIComponent(suffix) + '#/pages/card/index' + suffix)
   await page.locator('.empty').waitFor(); assert.match(await page.locator('.empty').innerText(), /未找到/)
   await page.locator('.empty uni-button').click(); await page.locator('.grid .card').first().waitFor(); assert.equal(await page.locator('.grid .card').count(), 78); assert.match(page.url(), /#\/pages\/library\/index/)
  }
  for (const card of deck.cards) assert(requestedImages.has('/' + artwork[card.id]), card.id + ' artwork actually requested')
  assert.deepEqual(errors, []); assert.deepEqual(unexpected, []); await context.close()
  console.log('PASS public uni-app H5: all 78 authored references and generated fields, symbols, original examples/comparisons, historical and source attribution/clipboard, both directions and five domains, verified full artwork loads; representative 320/390/768/1200 content bounds and preview recovery; standalone Back, invalid/missing-id library recovery; no third-party requests or page errors.')
 } finally { await browser.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)) }
})().catch(error => { console.error(error); process.exitCode = 1 })
