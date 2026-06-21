import { useState, useRef } from 'react'
import type { Trip } from '../types'
import { COMPANION_LABELS, COMPANION_COLORS } from '../types'
import { exportJson, importJson } from '../storage'
import type { SyncStatus } from '../App'

interface Props {
  trips: Trip[]
  selected: string | null
  onSelect: (id: string | null) => void
  onAddClick: () => void
  onEditClick: (id: string) => void
  onDelete: (id: string) => void
  onImport: (trips: Trip[]) => void
  syncStatus: SyncStatus
}

export default function Sidebar({ trips, selected, onSelect, onAddClick, onEditClick, onDelete, onImport, syncStatus }: Props) {
  const [filter, setFilter] = useState<string>('')
  const importRef = useRef<HTMLInputElement>(null)

  const filtered = trips.filter(t =>
    !filter || `${t.city} ${t.country}`.toLowerCase().includes(filter.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    const da = a.dateFrom ?? '0'
    const db = b.dateFrom ?? '0'
    return db.localeCompare(da)
  })

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    importJson(file).then(onImport).catch(() => alert('Could not read file.'))
    e.target.value = ''
  }

  // Stats
  const uniqueCities = new Set(trips.map(t => `${t.city}|${t.country}`)).size
  const uniqueCountries = new Set(trips.map(t => t.country)).size
  const years = trips.flatMap(t => [t.dateFrom, t.dateTo])
    .filter(Boolean)
    .map(d => parseInt(d!.split('-')[0]))
    .filter(y => !isNaN(y))
  const minYear = years.length ? Math.min(...years) : null
  const maxYear = years.length ? Math.max(...years) : null

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-72 shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-base font-semibold text-gray-800">My Travels</h1>
          <span className="text-xs text-gray-400">{trips.length} places</span>
        </div>
        {trips.length > 0 && (
          <div className="text-xs text-gray-400 mb-3 flex gap-1.5 flex-wrap">
            <span>{uniqueCities} cities</span>
            <span>·</span>
            <span>{uniqueCountries} countries</span>
            {minYear !== null && (
              <>
                <span>·</span>
                <span>{minYear === maxYear ? minYear : `${minYear}–${maxYear}`}</span>
              </>
            )}
          </div>
        )}
        {trips.length === 0 && <div className="mb-3" />}
        <button
          onClick={onAddClick}
          className="w-full py-2 rounded bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          + Add trip
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-gray-100">
        <input
          className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Search cities…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      {/* Trip list */}
      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <p className="text-center text-sm text-gray-400 mt-8">No trips yet. Add your first one!</p>
        ) : (
          sorted.map(trip => (
            <div
              key={trip.id}
              onClick={() => onSelect(selected === trip.id ? null : trip.id)}
              className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selected === trip.id ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start gap-2">
                <span
                  className="mt-1 shrink-0 w-3 h-3 rounded-full"
                  style={{ background: COMPANION_COLORS[trip.companion] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="font-medium text-sm text-gray-800 truncate">{trip.city}</span>
                    {trip.dateFrom && (
                      <span className="text-xs text-gray-400 shrink-0">{trip.dateFrom}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">{trip.country} · {COMPANION_LABELS[trip.companion]}</div>
                  {trip.notes && selected === trip.id && (
                    <p className="mt-1 text-xs text-gray-500 line-clamp-3">{trip.notes}</p>
                  )}
                </div>
              </div>
              {selected === trip.id && (
                <div className="flex gap-2 mt-2 pl-5">
                  <button
                    onClick={e => { e.stopPropagation(); onEditClick(trip.id) }}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); if (confirm('Delete this trip?')) onDelete(trip.id) }}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer: sync status + import/export */}
      <div className="border-t border-gray-100">
        {syncStatus !== 'idle' && (
          <div className={`px-4 py-1.5 text-xs text-center font-medium ${
            syncStatus === 'syncing' ? 'text-gray-400' :
            syncStatus === 'synced'  ? 'text-green-500' :
                                       'text-red-400'
          }`}>
            {syncStatus === 'syncing' ? '↑ Syncing to Gist…' :
             syncStatus === 'synced'  ? '✓ Saved to Gist' :
                                        '⚠ Sync failed — data saved locally'}
          </div>
        )}
        <div className="p-3 flex gap-2">
          <button
            onClick={() => exportJson(trips)}
            className="flex-1 py-1.5 text-xs rounded border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Export JSON
          </button>
          <button
            onClick={() => importRef.current?.click()}
            className="flex-1 py-1.5 text-xs rounded border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Import JSON
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>
      </div>
    </div>
  )
}
