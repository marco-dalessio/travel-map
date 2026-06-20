import { useState } from 'react'
import type { Trip, Companion } from '../types'
import { COMPANION_LABELS, COMPANION_COLORS } from '../types'
import type { GeoSuggestion } from '../geocode'
import CityAutocomplete from './CityAutocomplete'
import DatePicker from './DatePicker'

interface CityEntry {
  inputVal: string
  resolved: GeoSuggestion | null
}

interface Props {
  initial?: Trip
  onSave: (trips: Trip[]) => void
  onCancel: () => void
}

function emptyCity(): CityEntry {
  return { inputVal: '', resolved: null }
}

export default function TripForm({ initial, onSave, onCancel }: Props) {
  const [cities, setCities] = useState<CityEntry[]>(
    initial
      ? [{ inputVal: `${initial.city}, ${initial.country}`, resolved: { label: `${initial.city}, ${initial.country}`, city: initial.city, country: initial.country, lat: initial.lat, lng: initial.lng } }]
      : [emptyCity()]
  )
  const [companion, setCompanion] = useState<Companion>(initial?.companion ?? 'solo')
  const [dateFrom, setDateFrom] = useState(initial?.dateFrom ?? '')
  const [dateTo, setDateTo] = useState(initial?.dateTo ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [error, setError] = useState('')

  const isEdit = !!initial

  function updateCity(i: number, val: string) {
    setCities(prev => prev.map((c, idx) => idx === i ? { inputVal: val, resolved: null } : c))
  }

  function selectCity(i: number, s: GeoSuggestion) {
    setCities(prev => prev.map((c, idx) => idx === i ? { inputVal: s.label, resolved: s } : c))
  }

  function addCity() {
    setCities(prev => [...prev, emptyCity()])
  }

  function removeCity(i: number) {
    setCities(prev => prev.filter((_, idx) => idx !== i))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const unresolved = cities.filter(c => !c.resolved)
    if (unresolved.length > 0) {
      setError('Please select a city from the dropdown for each entry.')
      return
    }
    if (cities.length === 0) {
      setError('Add at least one city.')
      return
    }
    setError('')
    const trips: Trip[] = cities.map(c => ({
      id: initial?.id ?? crypto.randomUUID(),
      city: c.resolved!.city,
      country: c.resolved!.country,
      lat: c.resolved!.lat,
      lng: c.resolved!.lng,
      companion,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      notes: notes || undefined,
    }))
    onSave(trips)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Cities */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {isEdit ? 'City' : 'Cities'}
        </label>
        {cities.map((c, i) => (
          <div key={i} className="flex gap-1.5 items-center">
            <div className="flex-1">
              <CityAutocomplete
                value={c.inputVal}
                onChange={val => updateCity(i, val)}
                onSelect={s => selectCity(i, s)}
                placeholder="Type a city…"
              />
            </div>
            {!isEdit && cities.length > 1 && (
              <button
                type="button"
                onClick={() => removeCity(i)}
                className="text-gray-300 hover:text-red-400 text-lg leading-none px-1"
                title="Remove"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {!isEdit && (
          <button
            type="button"
            onClick={addCity}
            className="text-xs text-blue-500 hover:underline self-start"
          >
            + add another city
          </button>
        )}
      </div>

      {/* Companion */}
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">With whom</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {(Object.keys(COMPANION_LABELS) as Companion[]).map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setCompanion(c)}
              className="px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all"
              style={companion === c
                ? { background: COMPANION_COLORS[c], borderColor: COMPANION_COLORS[c], color: 'white' }
                : { background: 'white', borderColor: '#e5e7eb', color: '#374151' }
              }
            >
              {COMPANION_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-2">
        <DatePicker
          label="From (optional)"
          value={dateFrom}
          onChange={setDateFrom}
          placeholder="Month, Year"
        />
        <DatePicker
          label="To (optional)"
          value={dateTo}
          onChange={setDateTo}
          placeholder="Month, Year"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes (optional)</label>
        <textarea
          className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          rows={2}
          value={notes}
          onChange={e => setNotes(e.target.value)}
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
          className="px-4 py-2 rounded text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          {isEdit ? 'Save changes' : cities.length > 1 ? `Add ${cities.length} cities` : 'Add trip'}
        </button>
      </div>
    </form>
  )
}
