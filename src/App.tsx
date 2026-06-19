import { useState, useCallback } from 'react'
import type { Trip } from './types'
import { loadTrips, saveTrips } from './storage'
import Sidebar from './components/Sidebar'
import TravelMap from './components/TravelMap'
import Legend from './components/Legend'

export default function App() {
  const [trips, setTrips] = useState<Trip[]>(loadTrips)
  const [selected, setSelected] = useState<string | null>(null)

  const persist = useCallback((next: Trip[]) => {
    setTrips(next)
    saveTrips(next)
  }, [])

  const addTrip = (newTrips: Trip[]) => persist([...trips, ...newTrips])
  const editTrip = (trip: Trip) => persist(trips.map(t => t.id === trip.id ? trip : t))
  const deleteTrip = (id: string) => {
    persist(trips.filter(t => t.id !== id))
    if (selected === id) setSelected(null)
  }
  const importTrips = (imported: Trip[]) => persist(imported)

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
      />
      <div className="relative flex-1">
        <TravelMap trips={trips} selected={selected} onSelect={setSelected} />
        <Legend />
      </div>
    </div>
  )
}
