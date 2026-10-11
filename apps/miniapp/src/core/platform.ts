import { normalizeReading, READING_KEY } from './drawing'
import artwork from './artwork.json'
export function cardImage(id: string): string {
  const path = (artwork as Record<string, string>)[id]
  return path ? 'https://tarot.georgelu.cn/' + path : ''
}
export function notify(title: string) { uni.showToast({ title, icon: 'none' }) }
export function readStore<T>(key: string, fallback: T): T {
  const value = uni.getStorageSync(key)
  return value === '' || value === undefined || value === null ? fallback : value
}
export function writeStore(key: string, value: unknown) { uni.setStorageSync(key, JSON.parse(JSON.stringify(value))) }

// Migrate/prune before displaying a reading. Commit first so failure never claims deletion.
export function loadReadingStore(now = new Date()) {
 const raw = readStore<any>(READING_KEY, null)
 const next = normalizeReading(raw, now)
 if (raw !== null && JSON.stringify(raw) !== JSON.stringify(next)) writeStore(READING_KEY, next)
 return next
}
