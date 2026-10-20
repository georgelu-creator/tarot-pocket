import { deck, spreadContent, scenarios, offlineReading, daily, reference } from './catalogs'
export const READING_KEY = 'tarot-miniapp-reading-v1'
export const ENTRY_KEY = 'tarot-miniapp-entry-v1'
export type DrawCard = { id: string; reversed: boolean }
export type Draft = { id: string; at: number; spreadId: string; question: string; topic: string; dailyDate: string | null; pool: DrawCard[]; picked: number[]; phase: 'shuffle' | 'shuffling' | 'cut' | 'cutting' | 'pick' | 'reveal' | 'read'; motionRemaining?: number; fanOffset?:number; fanZoom?:number; fanIntroSeen?:true }
export type RecordItem = { id: string; at: number; spreadId: string; question: string; topic: string; dailyDate: string | null; cards: DrawCard[] }
export type ReadingStore = { version: 2; draft: Draft | null; dailyDraft: Draft | null; todayDaily: RecordItem | null; active: 'ordinary' | 'daily' }
export const blankReading = (): ReadingStore => ({ version: 2, draft: null, dailyDraft: null, todayDaily: null, active: 'ordinary' })
export const localDate = (now = new Date()) => `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
export const getSpread = (id: string) => spreadContent.spreads.find((s: any) => s.id === id)
const activeIds = new Set(scenarios.map((s: any) => s.spreadId))
export const availableSpreads = spreadContent.spreads.filter((s: any) => !s.legacy && s.id !== 'daily' && activeIds.has(s.id)).sort((a: any,b: any) => a.positions.length-b.positions.length)
const professionalScenes = new Set(['sc26','sc32','sc27','sc28','sc29','sc30','sc31','sc06'])
const leadingScenes = ['sc01','sc18','sc02','sc03','sc04','sc21','sc05','sc33']
export const isProfessionalScene=(id:string)=>professionalScenes.has(id)
export const availableScenes = scenarios.filter((s:any)=>activeIds.has(s.spreadId)).slice().sort((a:any,b:any)=>{
 const rank=(s:any)=>leadingScenes.includes(s.id)?leadingScenes.indexOf(s.id):professionalScenes.has(s.id)?600:({love:100,work:200,study:300,life:400} as Record<string,number>)[s.category] || 500
 const diff=rank(a)-rank(b)
 return diff || getSpread(a.spreadId).positions.length-getSpread(b.spreadId).positions.length
})
export const SHUFFLE_MS=5000, CUT_MS=1200
const ids = new Set(deck.cards.map((c: any) => c.id))
const validCard = (c: any) => c && ids.has(c.id) && typeof c.reversed === 'boolean'
function validRecord(r: any): boolean {
 const s = getSpread(r?.spreadId)
 return !!s && typeof r.id === 'string' && Number.isFinite(r.at) && typeof r.question === 'string' && typeof r.topic === 'string' && (r.dailyDate === null || typeof r.dailyDate === 'string') && Array.isArray(r.cards) && r.cards.length === s.positions.length && r.cards.every(validCard) && new Set(r.cards.map((c: any) => c.id)).size === r.cards.length
}
function validDraft(d: any): d is Draft | null {
 if (d === null) return true
 const s = getSpread(d?.spreadId)
 return !!s && typeof d.id === 'string' && Number.isFinite(d.at) && typeof d.question === 'string' && typeof d.topic === 'string' && (d.dailyDate === null || typeof d.dailyDate === 'string') && ['shuffle','shuffling','cut','cutting','pick','reveal','read'].includes(d.phase) && Array.isArray(d.pool) && d.pool.length === 78 && d.pool.every(validCard) && new Set(d.pool.map((c: any) => c.id)).size === 78 && Array.isArray(d.picked) && d.picked.length <= s.positions.length && d.picked.every((i: any) => Number.isInteger(i) && i >= 0 && i < 78) && new Set(d.picked).size === d.picked.length && (!['reveal','read'].includes(d.phase) || d.picked.length === s.positions.length) && (['pick','reveal','read'].includes(d.phase) || d.picked.length === 0) && (d.motionRemaining === undefined || (['shuffling','cutting'].includes(d.phase) && Number.isFinite(d.motionRemaining) && d.motionRemaining >= 0 && d.motionRemaining <= (d.phase === 'shuffling' ? SHUFFLE_MS : CUT_MS)))
}
// The existing key is migrated in place; no archive or old questions are retained.
function copyDraft(d: Draft): Draft {
 return {id:d.id,at:d.at,spreadId:d.spreadId,question:d.question,topic:d.topic,dailyDate:d.dailyDate,
  pool:d.pool.map(c=>({id:c.id,reversed:c.reversed})),picked:[...d.picked],phase:d.phase,
  ...(d.motionRemaining === undefined ? {} : {motionRemaining:d.motionRemaining}),
  ...(Number.isFinite(d.fanOffset)&&d.fanOffset!>=0&&d.fanOffset!<=100000?{fanOffset:d.fanOffset}:{}),
  ...(d.fanIntroSeen===true?{fanIntroSeen:true as const}:{}),
  ...(Number.isFinite(d.fanZoom)&&d.fanZoom!>=1&&d.fanZoom!<=2.4?{fanZoom:d.fanZoom}:{})}
}
function copyDaily(r: RecordItem): RecordItem {
 return {id:r.id,at:r.at,spreadId:'daily',question:'',topic:'general',dailyDate:r.dailyDate,cards:r.cards.map(c=>({id:c.id,reversed:c.reversed}))}
}
export function validateReading(value: any): value is ReadingStore {
 return !!value && value.version === 2 && Object.keys(value).every(k=>['version','draft','dailyDraft','todayDaily','active'].includes(k)) &&
  ['ordinary','daily'].includes(value.active) && validDraft(value.draft) && !value.draft?.dailyDate && validDraft(value.dailyDraft) && (!value.dailyDraft || (value.dailyDraft.spreadId === 'daily' && !!value.dailyDraft.dailyDate)) &&
  (value.todayDaily === null || (validRecord(value.todayDaily) && value.todayDaily.spreadId === 'daily' && !!value.todayDaily.dailyDate))
}
export function normalizeReading(value: any, now = new Date()): ReadingStore {
 if (value === null || value === undefined) return blankReading()
 if (![1,2].includes(value.version) || !validDraft(value.draft) || (value.version === 1 && !Array.isArray(value.history)) || (value.version === 2 && value.todayDaily !== null && (!validRecord(value.todayDaily) || value.todayDaily.spreadId !== 'daily' || !value.todayDaily.dailyDate)) || (value.dailyDraft !== undefined && (!validDraft(value.dailyDraft) || value.dailyDraft && (value.dailyDraft.spreadId !== 'daily' || !value.dailyDraft.dailyDate)))) throw new Error('牌局格式不正确')
 const today=localDate(now)
 const candidate=value.version === 1 ? value.history.find((r:any)=>validRecord(r) && r.spreadId === 'daily' && r.dailyDate === today) : value.todayDaily
 const draft:Draft|null=value.draft && !value.draft.dailyDate ? copyDraft(value.draft) : null
 let dailyDraft:Draft|null=value.dailyDraft ? copyDraft(value.dailyDraft) : value.draft?.dailyDate ? copyDraft(value.draft) : null
 if (dailyDraft?.dailyDate !== today) dailyDraft=null
 const todayDaily=candidate?.dailyDate === today ? copyDaily(candidate) : dailyDraft?.phase === 'read' ? copyDaily({...toRecord(dailyDraft,dailyDraft.at),dailyDate:today}) : null
 const active=(value.active === 'daily' || value.active === undefined && !!value.draft?.dailyDate) && (dailyDraft || todayDaily) ? 'daily' : 'ordinary'
 return {version:2,draft,dailyDraft,todayDaily,active}
}
export function currentRecord(store: ReadingStore): RecordItem | null {
 const d=store.draft
 return d?.phase === 'read' ? {...toRecord(d,d.at),dailyDate:d.dailyDate} : null
}
export function createDraft(spreadId: string, question = '', dailyDate: string | null = null, topic = 'general'): Draft {
 const s = getSpread(spreadId)
 if (!s) throw new Error('牌阵不存在')
 const pool: DrawCard[] = deck.cards.map((c: any) => ({ id:c.id,reversed:Math.random() < .5 }))
 for (let i=pool.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]] }
 const at=Date.now()
 return {id:`mini-${at}-${Math.random().toString(36).slice(2,9)}`,at,spreadId,question:question.trim().slice(0,3000),topic:s.topics?.length === 1 ? s.topics[0] : (s.topics?.includes(topic) ? topic : 'general'),dailyDate,pool,picked:[],phase:'shuffle'}
}
export function beginShuffle(d:Draft):boolean {
 if(d.phase !== 'shuffle') return false
 d.phase='shuffling';d.motionRemaining=SHUFFLE_MS;return true
}
export function finishMotion(d:Draft):boolean {
 if(d.phase !== 'shuffling' && d.phase !== 'cutting') return false
 d.phase=d.phase === 'shuffling'?'cut':'pick';delete d.motionRemaining;return true
}
export function beginCut(d:Draft,offset:number):boolean {
 if(d.phase !== 'cut' || ![0,26,52].includes(offset)) return false
 d.pool=[...d.pool.slice(offset),...d.pool.slice(0,offset)]
 d.phase='cutting';d.motionRemaining=CUT_MS;return true
}
export function pickCard(d: Draft,index: number): boolean {
 if (d.phase !== 'pick' || !Number.isInteger(index) || index<0 || index>=78 || d.picked.includes(index) || d.picked.length>=getSpread(d.spreadId).positions.length) return false
 d.picked.push(index)
 if (d.picked.length===getSpread(d.spreadId).positions.length) d.phase='reveal'
 return true
}
export function toRecord(d: Draft, at = Date.now()): RecordItem {
 if (d.picked.length !== getSpread(d.spreadId).positions.length) throw new Error('请先选齐牌')
 return {id:d.id,at,spreadId:d.spreadId,question:d.question,topic:d.topic,dailyDate:d.dailyDate ? localDate(new Date(at)) : null,cards:d.picked.map(i=>({...d.pool[i]}))}
}
// Prepare a new snapshot; the caller commits it only after storage succeeds.
export function finishReading(store: ReadingStore, draft: Draft, at = Date.now()) {
 if (!draft || !validateReading(store) || !validDraft(draft)) throw new Error('牌局格式不正确')
 const generated = toRecord(draft, at)
 const today=localDate(new Date(at))
 const previousDaily=store.todayDaily?.dailyDate === today ? store.todayDaily : null
 const existing=generated.dailyDate ? previousDaily : null
 const record=existing || generated
 interpretRecord(record)
 const completed:Draft=existing ? {
  ...copyDraft(draft),id:record.id,at:record.at,question:'',topic:'general',dailyDate:record.dailyDate,phase:'read',
  pool:draft.pool.map(c=>({...record.cards.find(r=>r.id===c.id) || c})),picked:record.cards.map(c=>draft.pool.findIndex(p=>p.id===c.id))
 } : {...copyDraft(draft),at:record.at,dailyDate:record.dailyDate,phase:'read'}
 const next=normalizeReading(store,new Date(at))
 if(generated.dailyDate){next.dailyDraft=completed;next.todayDaily=copyDaily(record);next.active='daily'}
 else{next.draft=completed;next.active='ordinary'}
 return {store:next,record}
}
export function todayReading(store: ReadingStore, at = new Date()) {
 return store.todayDaily?.dailyDate === localDate(at) ? store.todayDaily : null
}
export function dailyDisplay(record: RecordItem | null) {
 if (!record?.dailyDate || !validRecord(record)) return null
 const draw = record.cards[0], card = deck.cards.find((c:any)=>c.id===draw.id)
 const direction = draw.reversed ? 'reversed' : 'upright'
 return {id:draw.id, name:card.name, reversed:draw.reversed, date:record.dailyDate,
  message:reference.byId[draw.id][direction].message, core:card.core,
  advice:card[direction], do:daily[draw.id][direction].do, avoid:daily[draw.id][direction].avoid}
}
export function interpretRecord(r: RecordItem) {
 if (!validRecord(r)) throw new Error('记录不完整')
 const s=getSpread(r.spreadId)
 return offlineReading.interpret({spreadId:r.spreadId,topic:r.topic,question:r.question,language:'zh',cards:r.cards.map((c,i)=>({...c,positionId:s.positions[i].id}))})
}
// Reuse authored coordinates; preserve the established layout for older spreads.
export function boardLayout(s: any): {columns:number;rows:number;cells:{column:number;row:number}[]} {
 if (s.layoutPositions && s.layoutGrid) return {columns:s.layoutGrid.columns,rows:s.layoutGrid.rows,cells:s.layoutPositions.map((p:any)=>({column:Math.round(p.x*(s.layoutGrid.columns-1))+1,row:Math.round(p.y*(s.layoutGrid.rows-1))+1}))}
 const n=s.positions.length
 const presets: Record<string,number[][]> = {cross:[[1,2],[3,2],[2,2],[2,1],[2,3]],'relation-cross':[[1,2],[3,2],[2,1],[2,2],[2,3]],celtic:[[2,2],[3,2],[2,1],[2,3],[1,2],[4,2],[5,4],[5,3],[5,2],[5,1]],choice:[[2,1],[1,2],[3,2],[1,3],[3,3]],decision:[[2,3],[1,2],[3,2],[1,1],[3,1]],triangle:[[2,2],[1,1],[3,1]],pyramid:[[2,2],[1,2],[3,2],[2,1]]}
 const preset=presets[s.layout]
 if (preset && preset.length===n) return {columns:Math.max(...preset.map(p=>p[0])),rows:Math.max(...preset.map(p=>p[1])),cells:preset.map(p=>({column:p[0],row:p[1]}))}
 const columns=s.layout==='one'?1:s.layout==='grid'?2:Math.min(n,3)
 return {columns,rows:Math.ceil(n/columns),cells:Array.from({length:n},(_,i)=>({column:i%columns+1,row:Math.floor(i/columns)+1}))}
}
