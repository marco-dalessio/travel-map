import { useState, useCallback, useEffect } from 'react'
import type { Trip, Companion } from './types'
import { loadTrips, saveTrips } from './storage'
import { getCredentials, loadFromGist, saveToGist, saveCredentials } from './gist'
import type { GistCredentials } from './gist'
import Sidebar from './components/Sidebar'
import TravelMap from './components/TravelMap'
import Legend from './components/Legend'
import GistSetup from './components/GistSetup'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

const ALL_COMPANIONS = new Set<Companion>(['solo', 'friends', 'ana', 'family'])

export default function App() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [appLoading, setAppLoading] = useState(true)
  const [setupMode, setSetupMode] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [activeCompanions, setActiveCompanions] = useState<Set<Companion>>(new Set(ALL_COMPANIONS))

  // Load trips on mount
  useEffect(() => {
    const creds = getCredentials()
    if (!creds) {
      // No Gist configured — use localStorage and show setup prompt
      setTrips(loadTrips())
      setAppLoading(false)
      setSetupMode(true)
      return
    }
    loadFromGist(creds)
      .then(loaded => {
        // Auto-migrate localStorage data if Gist is empty
        if (loaded.length === 0) {
          const local = loadTrips()
          if (local.length > 0) {
            setTrips(local)
            saveToGist(creds, local).catch(() => {})
            return
          }
        }
        setTrips(loaded)
        saveTrips(loaded) // keep localStorage as offline cache
      })
      .catch(() => {
        // Gist unreachable — fall back to localStorage silently
        setTrips(loadTrips())
      })
      .finally(() => setAppLoading(false))
  }, [])

  // Persist: update state + localStorage immediately, then sync to Gist
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
        if (next.size === 1) return prev // always keep at least one visible
        next.delete(c)
      } else {
        next.add(c)
      }
      return next
    })
  }

  const visibleTrips = trips.filter(t => activeCompanions.has(t.companion))

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
        onAdd={addTrip}
        onEdit={editTrip}
        onDelete={deleteTrip}
        onImport={importTrips}
        syncStatus={syncStatus}
      />
      <div className="relative flex-1">
        <TravelMap trips={visibleTrips} selected={selected} onSelect={setSelected} />
        <Legend activeCompanions={activeCompanions} onToggle={toggleCompanion} />
      </div>
    </div>
  )
}
