import type { Trip } from './types'

const KEY = 'travel-map-trips'

export function loadTrips(): Trip[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveTrips(trips: Trip[]): void {
  localStorage.setItem(KEY, JSON.stringify(trips))
}

export function exportJson(trips: Trip[]): void {
  const blob = new Blob([JSON.stringify(trips, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'my-travels.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function importJson(file: File): Promise<Trip[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const trips = JSON.parse(e.target?.result as string)
        resolve(trips)
      } catch {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.readAsText(file)
  })
}
