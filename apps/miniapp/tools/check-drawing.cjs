'use strict'
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const esbuild = require('esbuild')
const base = path.resolve(__dirname, '..')
const root = path.resolve(base, '../..')
const bundle = esbuild.buildSync({ entryPoints: [path.join(base, 'src/core/drawing.ts')], bundle: true, platform: 'node', format: 'cjs', write: false })
const scope = { module: { exports: {} }, require, console, Math, Date, Set }
scope.exports = scope.module.exports
vm.runInNewContext(bundle.outputFiles[0].text, scope)
const drawing = scope.module.exports
function plain(value) { return JSON.parse(JSON.stringify(value)) }
function readyDraft(...args) {
 const draft=drawing.createDraft(...args)
 assert.equal(draft.phase,'shuffle')
 assert.equal(drawing.pickCard(draft,0),false,'cannot pick before the separate ritual stages')
 assert.equal(drawing.beginShuffle(draft),true)
 assert.equal(drawing.beginCut(draft,26),false,'cannot cut during shuffle')
 assert.equal(draft.motionRemaining,5000)
 assert.equal(drawing.finishMotion(draft),true)
 assert.equal(draft.phase,'cut','shuffle must wait at the cut screen')
 assert.equal(drawing.pickCard(draft,0),false)
 const order=plain(draft.pool)
 assert.equal(drawing.beginCut(draft,26),true)
 assert.equal(draft.motionRemaining,1200)
 assert.deepEqual(plain(draft.pool),[...order.slice(26),...order.slice(0,26)],'cut rotates existing cards without rerandomization')
 assert.equal(drawing.finishMotion(draft),true)
 assert.equal(draft.phase,'pick')
 return draft
}
assert.equal(drawing.validateReading(drawing.blankReading()), true)
for (const spread of drawing.availableSpreads) {
 const draft = readyDraft(spread.id, '  当前处境  ')
 assert.equal(draft.question, '当前处境')
 assert.equal(new Set(draft.pool.map(c => c.id)).size, 78)
 const original = plain(draft.pool)
 for (let index = 0; index < spread.positions.length; index++) {
  assert.equal(drawing.pickCard(draft, index), true)
  assert.equal(drawing.pickCard(draft, index), false, 'a card cannot occupy two positions')
 }
 assert.equal(draft.phase, 'reveal')
 assert.equal(drawing.pickCard(draft, 77), false, 'a completed spread cannot accept another card')
 assert.deepEqual(plain(draft.pool), original, 'picking must not change card identities or orientations')
 const record = drawing.toRecord(draft)
 const result = drawing.interpretRecord(record)
 assert.equal(result.positions.length, spread.positions.length)
 result.positions.forEach((position, index) => {
  assert.equal(position.positionId, spread.positions[index].id)
  assert.equal(position.cardId, record.cards[index].id)
  assert.equal(position.orientation, record.cards[index].reversed ? 'reversed' : 'upright')
 })
 assert.equal(drawing.validateReading({ version: 1, draft, history: [record] }), true)
 const layout = drawing.boardLayout(spread)
 assert.equal(layout.cells.length, spread.positions.length)
 for (const cell of layout.cells) {
  assert.ok(cell.column >= 1 && cell.column <= layout.columns)
  assert.ok(cell.row >= 1 && cell.row <= layout.rows)
 }
 if (spread.layoutPositions) spread.layoutPositions.forEach((p, index) => {
  assert.equal(layout.cells[index].column, Math.round(p.x * (spread.layoutGrid.columns - 1)) + 1)
  assert.equal(layout.cells[index].row, Math.round(p.y * (spread.layoutGrid.rows - 1)) + 1)
 })
 const duplicate = plain(draft)
 duplicate.picked[1] = duplicate.picked[0]
 if (duplicate.picked.length > 1) assert.equal(drawing.validateReading({ version: 1, draft: duplicate, history: [] }), false)
}
for (const bad of [{}, { version: 1, draft: {}, history: [] }, { version: 1, draft: null, history: [{}] }]) assert.equal(drawing.validateReading(bad), false)
assert.throws(() => readyDraft('not-an-authored-spread'))
assert.throws(() => drawing.toRecord(readyDraft('one')))
const day = drawing.localDate(new Date(2026, 0, 2, 23, 59))
assert.equal(day, '2026-01-02')
const dailyDraft = readyDraft('daily', '', day)
drawing.pickCard(dailyDraft, 77)
const dailyRecord = drawing.toRecord(dailyDraft, new Date(2026, 0, 2, 23, 59).getTime())
assert.equal(dailyRecord.dailyDate, day)
assert.equal(drawing.validateReading({ version: 1, draft: dailyDraft, history: [dailyRecord] }), true)
assert.equal(drawing.interpretRecord(dailyRecord).positions.length, 1)
// Compare established layouts with the actual Web CSS rules, including its base cross/celtic rules.
const css = fs.readFileSync(path.join(root, 'reading.css'), 'utf8')
const presets = {
 cross: [[1,2],[3,2],[2,2],[2,1],[2,3]],
 celtic: [[2,2],[3,2],[2,1],[2,3],[1,2],[4,2],[5,4],[5,3],[5,2],[5,1]],
 decision: [[2,3],[1,2],[3,2],[1,1],[3,1]],
 'relation-cross': [[1,2],[3,2],[2,1],[2,2],[2,3]],
 pyramid: [[2,2],[1,2],[3,2],[2,1]]
}
for (const [name, expected] of Object.entries(presets)) {
 const result = drawing.boardLayout({ layout: name, positions: Array(expected.length).fill({}) })
 assert.deepEqual(plain(result.cells), expected.map(([column,row]) => ({column,row})))
 expected.forEach(([column,row],index) => {
  const selector = new RegExp(`\\.layout-${name} \\.slot-${index+1}(?:,[^{]*)?\\{([^}]+)\\}`)
  const rule = css.match(selector)
  assert.ok(rule, `${name} position ${index+1} must still exist in Web source`)
  assert.ok(new RegExp(`grid-column:${column}(?:;|$)`).test(rule[1]))
  assert.ok(new RegExp(`grid-row:${row}(?:;|$)`).test(rule[1]))
 })
}
assert.deepEqual(plain(drawing.boardLayout({ layout: 'triangle', positions: [{},{},{}] }).cells), [{column:2,row:2},{column:1,row:1},{column:3,row:1}])
assert.ok(css.includes('.layout-triangle .slot-1{grid-row:2;grid-column:1 / 3'))
// Evaluate the real page expression rather than duplicating its fan-window implementation.
const page = fs.readFileSync(path.join(base, 'src/pages/draw/index.vue'), 'utf8')
const fanExpression = page.match(/const visibleIndices=computed\(\(\)=>\s*(Array\.from\([^\n]+)\)/)
assert.ok(fanExpression, 'fan expression must remain inspectable')
const reached = new Set()
for (let start = 0; start <= 65; start++) {
 const indices = vm.runInNewContext(fanExpression[1], { fanStart: { value: start } })
 assert.ok(indices.length <= 13)
 indices.forEach(index => { assert.ok(index >= 0 && index < 78); reached.add(index) })
}
assert.equal(reached.size, 78, 'all cards must be reachable through fan paging')
console.log(`PASS drawing: ${drawing.availableSpreads.length} authored spreads; identities, orientations, daily date, malformed state, Web layout parity, 78-card fan reachability`)
// Regressions: neutral topics, atomic completion and local-midnight ownership.
const neutral = readyDraft('one')
assert.equal(neutral.topic, 'general')
assert.equal(readyDraft('one', '', null, 'love').topic, 'love')
assert.equal(readyDraft('relationship-three').topic, 'love')
drawing.pickCard(neutral,0)
const beforeFinish = {version:1,draft:neutral,history:[]}
const snapshot = JSON.stringify(beforeFinish)
const prepared = drawing.finishReading(beforeFinish,neutral)
assert.equal(JSON.stringify(beforeFinish),snapshot,'preparing completion must not mutate state before storage succeeds')
assert.equal(prepared.store.draft.phase,'read')
const crossing = readyDraft('daily','',day)
drawing.pickCard(crossing,0)
const nextDayAt = new Date(2026,0,3,0,1).getTime()
const savedNextDay = drawing.finishReading({version:1,draft:crossing,history:[]},crossing,nextDayAt)
assert.equal(savedNextDay.record.dailyDate,'2026-01-03')
assert.equal(savedNextDay.record.at,nextDayAt)
const other = readyDraft('daily','','2026-01-02')
drawing.pickCard(other,77)
const sameDay = drawing.finishReading(savedNextDay.store,other,nextDayAt)
assert.equal(sameDay.record.id,savedNextDay.record.id,'an existing daily result wins across stale drafts')
assert.equal(sameDay.store.history.length,1)
let many = savedNextDay.store
for(let i=0;i<205;i++) {const d=readyDraft('one');drawing.pickCard(d,0);many=drawing.finishReading(many,d,nextDayAt+i+1).store}
assert.equal(many.history.length,200)
assert.equal(drawing.todayReading(many,new Date(nextDayAt)).id,savedNextDay.record.id,'today daily must survive the general-history limit')
assert.ok(drawing.dailyDisplay(savedNextDay.record).do)
assert.ok(drawing.dailyDisplay(savedNextDay.record).avoid)
assert.ok(!drawing.interpretRecord(prepared.record).positions[0].details.some(d=>d.title.includes('工作与发展')))
console.log('PASS delivery regressions: neutral topics, atomic snapshot, midnight, once-per-day, history retention, daily guidance')

assert.equal(drawing.availableScenes.length,33,'all authored scenes remain directly reachable')
assert.deepEqual(plain(drawing.availableScenes.slice(0,8).map(s=>s.id)),['sc01','sc18','sc02','sc03','sc04','sc21','sc05','sc33'])
const firstProfessional=drawing.availableScenes.findIndex(s=>drawing.isProfessionalScene(s.id))
assert.ok(firstProfessional>0)
assert.ok(drawing.availableScenes.slice(firstProfessional).every(s=>drawing.isProfessionalScene(s.id)))
const paused=drawing.createDraft('three')
drawing.beginShuffle(paused);paused.motionRemaining=2380
assert.equal(drawing.validateReading({version:1,draft:paused,history:[]}),true,'paused animation remaining time can restore')
paused.motionRemaining=-1
assert.equal(drawing.validateReading({version:1,draft:paused,history:[]}),false)
const legacy=readyDraft('three');delete legacy.motionRemaining
assert.equal(drawing.validateReading({version:1,draft:legacy,history:[]}),true,'existing pick-phase drafts remain compatible')
console.log('PASS ritual stages: shuffle/cut timing, stage gating, deterministic cut, legacy and paused drafts, 33 scene ordering')
