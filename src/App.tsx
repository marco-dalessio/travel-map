import { useState, useCallback, useEffect, useRef } from 'react'
import type { Trip, Companion } from './types'
import { loadTrips, saveTrips } from './storage'
import { getCredentials, loadFromGist, saveToGist, saveCredentials } from './gist'
import type { GistCredentials } from './gist'
import Sidebar from './components/Sidebar'
import TravelMap from './components/TravelMap'
import Legend from './components/Legend'
import GistSetup from './components/GistSetup'
import TripForm from './components/TripForm'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

const ALL_COMPANIONS = new Set<Companion>(['solo', 'friends', 'ana', 'family'])

// formMode: null = closed, 'add' = new trip, string = trip ID being edited
type FormMode = null | 'add' | string

export default function App() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [appLoading, setAppLoading] = useState(true)
  const [setupMode, setSetupMode] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [activeCompanions, setActiveCompanions] = useState<Set<Companion>>(new Set(ALL_COMPANIONS))
  const [formMode, setFormMode] = useState<FormMode>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Load trips on mount
  useEffect(() => {
    const creds = getCredentials()
    if (!creds) {
      setTrips(loadTrips())
      setAppLoading(false)
      setSetupMode(true)
      return
    }
    loadFromGist(creds)
      .then(loaded => {
        if (loaded.length === 0) {
          const local = loadTrips()
          if (local.length > 0) {
            setTrips(local)
            saveToGist(creds, local).catch(() => {})
            return
          }
        }
        setTrips(loaded)
        saveTrips(loaded)
      })
      .catch(() => setTrips(loadTrips()))
      .finally(() => setAppLoading(false))
  }, [])

  // Close modal on Escape
  useEffect(() => {
    if (!formMode) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFormMode(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [formMode])

  const persist = useCallback((next: Trip[]) => {
    setTrips(next)
    saveTrips(next)
    const creds = getCredentials()
    if (!creds) return
    setSyncStatus('syncing')
    saveToGist(creds, next)
      .then(() => {
        setSyncStatus('synced')
        setTimeout(() => setSyncStatus('idle'), 2500)
      })
      .catch(() => setSyncStatus('error'))
  }, [])

  function handleGistConnect(creds: GistCredentials) {
    saveCredentials(creds)
    setSetupMode(false)
    setAppLoading(true)
    loadFromGist(creds)
      .then(loaded => {
        if (loaded.length === 0) {
          const local = loadTrips()
          if (local.length > 0) {
            setTrips(local)
            saveToGist(creds, local).catch(() => {})
            return
          }
        }
        setTrips(loaded)
        saveTrips(loaded)
      })
      .catch(() => {})
      .finally(() => setAppLoading(false))
  }

  const addTrip    = (newTrips: Trip[]) => persist([...trips, ...newTrips])
  const editTrip   = (trip: Trip) => persist(trips.map(t => t.id === trip.id ? trip : t))
  const deleteTrip = (id: string) => {
    persist(trips.filter(t => t.id !== id))
    if (selected === id) setSelected(null)
  }
  const importTrips = (imported: Trip[]) => persist(imported)

  function toggleCompanion(c: Companion) {
    setActiveCompanions(prev => {
      const next = new Set(prev)
      if (next.has(c)) {
        if (next.size === 1) return prev
        next.delete(c)
      } else {
        next.add(c)
      }
      return next
    })
  }

  const visibleTrips = trips.filter(t => activeCompanions.has(t.companion))

  const editingTrip = formMode && formMode !== 'add'
    ? trips.find(t => t.id === formMode)
    : undefined

  if (appLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading your travels…</p>
      </div>
    )
  }

  if (setupMode) {
    return (
      <GistSetup
        onConnect={handleGistConnect}
        onSkip={() => setSetupMode(false)}
      />
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        trips={trips}
        selected={selected}
        onSelect={setSelected}
        onAddClick={() => setFormMode('add')}
        onEditClick={(id) => setFormMode(id)}
        onDelete={deleteTrip}
        onImport={importTrips}
        syncStatus={syncStatus}
      />
      <div className="relative flex-1">
        <TravelMap
          trips={visibleTrips}
          selected={selected}
          onSelect={setSelected}
          onEditTrip={(id) => setFormMode(id)}
          onDeleteTrip={deleteTrip}
        />
        <Legend activeCompanions={activeCompanions} onToggle={toggleCompanion} />
      </div>

      {/* Modal overlay */}
      {formMode !== null && (
        <div
          className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/40"
          onClick={e => { if (e.target === e.currentTarget) setFormMode(null) }}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-800">
                  {formMode === 'add' ? 'New trip' : 'Edit trip'}
                </h2>
                <button
                  onClick={() => setFormMode(null)}
                  className="text-gray-300 hover:text-gray-500 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <TripForm
                initial={editingTrip}
                onSave={saved => {
                  if (formMode !== 'add') editTrip(saved[0])
                  else addTrip(saved)
                  setFormMode(null)
                }}
                onCancel={() => setFormMode(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
