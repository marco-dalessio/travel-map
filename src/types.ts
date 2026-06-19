export type Companion = 'solo' | 'friends' | 'ana' | 'family'

export interface Trip {
  id: string
  city: string
  country: string
  lat: number
  lng: number
  companion: Companion
  dateFrom?: string  // YYYY-MM or YYYY
  dateTo?: string
  notes?: string
}

export const COMPANION_LABELS: Record<Companion, string> = {
  solo: 'Solo',
  friends: 'With friends',
  ana: 'With Ana',
  family: 'With Ana & kid',
}

export const COMPANION_COLORS: Record<Companion, string> = {
  solo: '#3b82f6',    // blue
  friends: '#f97316', // orange
  ana: '#ec4899',     // pink
  family: '#22c55e',  // green
}
