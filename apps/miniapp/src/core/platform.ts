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
