import { useState } from 'react'
import type { Trip, Companion } from '../types'
import { COMPANION_LABELS, COMPANION_COLORS } from '../types'
import { geocodeCity } from '../geocode'

interface Props {
  initial?: Trip
  onSave: (trip: Trip) => void
  onCancel: () => void
}

const blank = (): Omit<Trip, 'id' | 'lat' | 'lng'> => ({
  city: '',
  country: '',
  companion: 'solo',
  dateFrom: '',
  dateTo: '',
  notes: '',
})

export default function TripForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<Omit<Trip, 'id' | 'lat' | 'lng'>>(
    initial
      ? { city: initial.city, country: initial.country, companion: initial.companion, dateFrom: initial.dateFrom ?? '', dateTo: initial.dateTo ?? '', notes: initial.notes ?? '' }
      : blank()
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.city.trim() || !form.country.trim()) {
      setError('City and country are required.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const coords = await geocodeCity(form.city.trim(), form.country.trim())
      if (!coords) {
        setError(`Couldn't find "${form.city}, ${form.country}". Check the spelling.`)
        setLoading(false)
        return
      }
      onSave({
        id: initial?.id ?? crypto.randomUUID(),
        ...form,
        city: form.city.trim(),
        country: form.country.trim(),
        dateFrom: form.dateFrom || undefined,
        dateTo: form.dateTo || undefined,
        notes: form.notes || undefined,
        ...coords,
      })
    } catch {
      setError('Geocoding failed. Check your connection.')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">City *</label>
          <input
            className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={form.city}
            onChange={e => set('city', e.target.value)}
            placeholder="Rome"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Country *</label>
          <input
            className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={form.country}
            onChange={e => set('country', e.target.value)}
            placeholder="Italy"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">With whom</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {(Object.keys(COMPANION_LABELS) as Companion[]).map(c => (
            <button
              key={c}
              type="button"
              onClick={() => set('companion', c)}
              className="px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all"
              style={form.companion === c
                ? { background: COMPANION_COLORS[c], borderColor: COMPANION_COLORS[c], color: 'white' }
                : { background: 'white', borderColor: '#e5e7eb', color: '#374151' }
              }
            >
              {COMPANION_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">From (optional)</label>
          <input
            className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={form.dateFrom}
            onChange={e => set('dateFrom', e.target.value)}
            placeholder="2023-06 or 2023"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">To (optional)</label>
          <input
            className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={form.dateTo}
            onChange={e => set('dateTo', e.target.value)}
            placeholder="2023-06 or 2023"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes (optional)</label>
        <textarea
          className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          rows={2}
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Anything worth remembering…"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2 justify-end pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Looking up…' : initial ? 'Save changes' : 'Add trip'}
        </button>
      </div>
    </form>
  )
}
