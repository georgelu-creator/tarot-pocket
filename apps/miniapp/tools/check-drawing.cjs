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
 assert.equal(drawing.validateReading({...drawing.blankReading(),draft}), true)
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
 if (duplicate.picked.length > 1) assert.equal(drawing.validateReading({...drawing.blankReading(),draft:duplicate}), false)
}
for (const bad of [{}, { version: 2, draft: {}, todayDaily: null }, { version: 2, draft: null, todayDaily: {} }]) assert.equal(drawing.validateReading(bad), false)
assert.throws(() => readyDraft('not-an-authored-spread'))
assert.throws(() => drawing.toRecord(readyDraft('one')))
const day = drawing.localDate(new Date(2026, 0, 2, 23, 59))
assert.equal(day, '2026-01-02')
const dailyDraft = readyDraft('daily', '', day)
drawing.pickCard(dailyDraft, 77)
const dailyRecord = drawing.toRecord(dailyDraft, new Date(2026, 0, 2, 23, 59).getTime())
assert.equal(dailyRecord.dailyDate, day)
assert.equal(drawing.validateReading({...drawing.blankReading(),dailyDraft,todayDaily:dailyRecord}), true)
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
const beforeFinish = {...drawing.blankReading(),draft:neutral}
const snapshot = JSON.stringify(beforeFinish)
const prepared = drawing.finishReading(beforeFinish,neutral)
assert.equal(JSON.stringify(beforeFinish),snapshot,'preparing completion must not mutate state before storage succeeds')
assert.equal(prepared.store.draft.phase,'read')
const crossing = readyDraft('daily','',day)
drawing.pickCard(crossing,0)
const nextDayAt = new Date(2026,0,3,0,1).getTime()
const savedNextDay = drawing.finishReading({...drawing.blankReading(),dailyDraft:crossing},crossing,nextDayAt)
assert.equal(savedNextDay.record.dailyDate,'2026-01-03')
assert.equal(savedNextDay.record.at,nextDayAt)
const other = readyDraft('daily','','2026-01-02')
drawing.pickCard(other,77)
const sameDay = drawing.finishReading(savedNextDay.store,other,nextDayAt)
assert.equal(sameDay.record.id,savedNextDay.record.id,'an existing daily result wins across stale drafts')
assert.equal(sameDay.store.todayDaily.id,savedNextDay.record.id)
assert.deepEqual(plain(drawing.toRecord(sameDay.store.dailyDraft,sameDay.record.at).cards),plain(savedNextDay.record.cards),'stale completion reuses today card and remains recoverable after reload')
let many = savedNextDay.store
for(let i=0;i<205;i++) {const d=readyDraft('one');drawing.pickCard(d,0);many=drawing.finishReading(many,d,nextDayAt+i+1).store}
assert.deepEqual(Object.keys(many).sort(),['active','dailyDraft','draft','todayDaily','version'])
assert.ok(!JSON.stringify(many).includes('history'))
assert.equal(drawing.todayReading(many,new Date(nextDayAt)).id,savedNextDay.record.id,'today daily survives unrelated draws without any history archive')
assert.ok(drawing.dailyDisplay(savedNextDay.record).do)
assert.ok(drawing.dailyDisplay(savedNextDay.record).avoid)
assert.ok(!drawing.interpretRecord(prepared.record).positions[0].details.some(d=>d.title.includes('工作与发展')))
console.log('PASS delivery regressions: neutral topics, atomic snapshot, midnight, once-per-day, no history archive, daily guidance')

const sceneScope={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'reading-scenarios.js'),'utf8'),sceneScope)
assert.equal(drawing.availableScenes.length,sceneScope.window.TAROT_READING_SCENARIOS.length,'all authored scenes remain directly reachable')
assert.deepEqual([...drawing.availableScenes.map(s=>s.id)].sort(),[...sceneScope.window.TAROT_READING_SCENARIOS.map(s=>s.id)].sort())
assert.deepEqual(plain(drawing.availableScenes.slice(0,8).map(s=>s.id)),['sc01','sc18','sc02','sc03','sc04','sc21','sc05','sc33'])
const firstProfessional=drawing.availableScenes.findIndex(s=>drawing.isProfessionalScene(s.id))
assert.ok(firstProfessional>0)
assert.ok(drawing.availableScenes.slice(firstProfessional).every(s=>drawing.isProfessionalScene(s.id)))
const paused=drawing.createDraft('three')
drawing.beginShuffle(paused);paused.motionRemaining=2380
assert.equal(drawing.validateReading({...drawing.blankReading(),draft:paused}),true,'paused animation remaining time can restore')
paused.motionRemaining=-1
assert.equal(drawing.validateReading({...drawing.blankReading(),draft:paused}),false)
const legacy=readyDraft('three');delete legacy.motionRemaining
assert.equal(drawing.validateReading({...drawing.blankReading(),draft:legacy}),true,'existing pick-phase drafts remain compatible')
console.log('PASS ritual stages: shuffle/cut timing, stage gating, deterministic cut, legacy and paused drafts, complete authored scene ordering')

// Privacy migration: retain only the current game and today's daily, never prior queries.
const current=readyDraft('one','当前问题');drawing.pickCard(current,1);current.phase='read'
const old=readyDraft('one','历史敏感问题必须移除');drawing.pickCard(old,2)
const oldRecord=drawing.toRecord(old,nextDayAt-86400000)
const legacyStore={version:1,draft:current,history:[oldRecord,savedNextDay.record],extraArchive:[oldRecord]}
const migrated=drawing.normalizeReading(legacyStore,new Date(nextDayAt))
assert.equal(migrated.version,2)
assert.equal(migrated.draft.id,current.id)
assert.equal(migrated.draft.question,'当前问题')
assert.deepEqual(plain(drawing.currentRecord(migrated).cards),plain(current.picked.map(i=>current.pool[i])))
assert.equal(migrated.todayDaily.id,savedNextDay.record.id)
assert.ok(!JSON.stringify(migrated).includes('历史敏感问题必须移除'))
assert.ok(!JSON.stringify(migrated).includes('history'))
assert.ok(!JSON.stringify(migrated).includes('extraArchive'))
const midnight=drawing.normalizeReading(migrated,new Date(2026,0,4,0,0))
assert.equal(midnight.todayDaily,null)
assert.equal(midnight.draft.id,current.id,'ordinary current game survives midnight')
const expired=drawing.normalizeReading(savedNextDay.store,new Date(2026,0,4,0,0))
assert.equal(expired.todayDaily,null)
assert.equal(expired.draft,null,'expired daily current game is pruned')
const legacyDaily=drawing.normalizeReading({version:1,draft:savedNextDay.store.dailyDraft,history:[]},new Date(nextDayAt))
assert.equal(legacyDaily.todayDaily.id,savedNextDay.record.id,'completed current daily can recover without old history')
const crossedLegacy=plain(savedNextDay.store.dailyDraft);crossedLegacy.at=nextDayAt-86400000
assert.equal(drawing.normalizeReading({version:1,draft:crossedLegacy,history:[]},new Date(nextDayAt)).todayDaily.dailyDate,'2026-01-03','legacy completion date wins over creation day')
assert.equal(drawing.normalizeReading({version:1,draft:crossedLegacy,history:[]},new Date(nextDayAt)).dailyDraft.dailyDate,'2026-01-03')
const historyOnly=drawing.normalizeReading({version:1,draft:null,history:[oldRecord,savedNextDay.record]},new Date(nextDayAt))
assert.equal(historyOnly.draft,null)
assert.equal(historyOnly.todayDaily.id,savedNextDay.record.id)
const partial=readyDraft('three','选牌仍需恢复');drawing.pickCard(partial,5)
assert.deepEqual(plain(drawing.normalizeReading({version:1,draft:partial,history:[oldRecord]},new Date()).draft),plain(partial))
const newDraft=readyDraft('one','替换后的问题');drawing.pickCard(newDraft,0)
const replaced=drawing.finishReading(migrated,newDraft,nextDayAt+1000).store
assert.ok(!JSON.stringify(replaced).includes('当前问题'),'replaced game question is not retained')
assert.equal(replaced.todayDaily.id,migrated.todayDaily.id)
const canonical=drawing.normalizeReading({...migrated,history:[oldRecord]},new Date(nextDayAt))
assert.ok(!JSON.stringify(canonical).includes('历史敏感问题必须移除'))
assert.equal(drawing.validateReading({...migrated,history:[]}),false,'new schema cannot carry a hidden archive')
const pages=JSON.parse(fs.readFileSync(path.join(base,'src/pages.json')))
assert.ok(!pages.pages.some(p=>p.path.includes('records')))
assert.ok(!pages.tabBar.list.some(p=>p.text==='记录'))
// Storage migration is committed atomically; quota failure cannot claim records were removed.
const platformBundle=esbuild.buildSync({entryPoints:[path.join(base,'src/core/platform.ts')],bundle:true,platform:'node',format:'cjs',write:false})
let persisted=plain(legacyStore),failSave=true
const platformScope={module:{exports:{}},require,console,Math,Date,Set,uni:{getStorageSync:()=>persisted,setStorageSync:(_key,value)=>{if(failSave)throw Error('quota');persisted=plain(value)}}}
platformScope.exports=platformScope.module.exports
vm.runInNewContext(platformBundle.outputFiles[0].text,platformScope)
assert.throws(()=>platformScope.module.exports.loadReadingStore(new Date(nextDayAt)),/quota/)
assert.deepEqual(persisted,plain(legacyStore))
failSave=false
const loaded=platformScope.module.exports.loadReadingStore(new Date(nextDayAt))
assert.deepEqual(persisted,plain(loaded))
assert.equal(persisted.version,2)
assert.ok(!('history' in persisted))
console.log('PASS privacy migration: current draft, today-only daily, midnight pruning, old query removal, no archive routes, atomic migration retry')

const ordinaryStore=drawing.finishReading(drawing.blankReading(),current,nextDayAt).store
const dailyIndependent=readyDraft('daily','',drawing.localDate(new Date(nextDayAt)));drawing.pickCard(dailyIndependent,3)
const ordinarySnapshot=JSON.stringify(ordinaryStore.draft)
const withDaily=drawing.finishReading(ordinaryStore,dailyIndependent,nextDayAt).store
assert.equal(JSON.stringify(withDaily.draft),ordinarySnapshot,'first daily never replaces ordinary current game')
assert.equal(withDaily.dailyDraft.id,dailyIndependent.id)
assert.equal(withDaily.active,'daily')
const unfinishedDaily=readyDraft('daily','',drawing.localDate(new Date(nextDayAt)))
const partialDaily=drawing.normalizeReading({...ordinaryStore,dailyDraft:unfinishedDaily,active:'daily'},new Date(nextDayAt))
assert.equal(JSON.stringify(partialDaily.draft),ordinarySnapshot,'unfinished daily occupies its own slot')
assert.equal(partialDaily.dailyDraft.id,unfinishedDaily.id)
const prunedIndependent=drawing.normalizeReading(withDaily,new Date(nextDayAt+86400000))
assert.equal(JSON.stringify(prunedIndependent.draft),ordinarySnapshot)
assert.equal(prunedIndependent.dailyDraft,null)
assert.equal(prunedIndependent.todayDaily,null)
assert.equal(prunedIndependent.active,'ordinary')
console.log('PASS independent daily slot: first/unfinished/completed daily, active restore, midnight preserves ordinary game')
