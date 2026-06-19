import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import type { Trip } from '../types'
import { COMPANION_COLORS, COMPANION_LABELS } from '../types'
import 'leaflet/dist/leaflet.css'

interface Props {
  trips: Trip[]
  selected: string | null
  onSelect: (id: string | null) => void
}

function MapClickHandler({ onSelect }: { onSelect: (id: string | null) => void }) {
  useMapEvents({ click: () => onSelect(null) })
  return null
}

function FlyTo({ trips, selected }: { trips: Trip[]; selected: string | null }) {
  const map = useMap()
  useEffect(() => {
    if (!selected) return
    const trip = trips.find(t => t.id === selected)
    if (trip) map.flyTo([trip.lat, trip.lng], Math.max(map.getZoom(), 6), { duration: 0.8 })
  }, [selected, trips, map])
  return null
}

export default function TravelMap({ trips, selected, onSelect }: Props) {
  return (
    <MapContainer
      center={[20, 10]}
      zoom={2}
      minZoom={2}
      className="flex-1"
    >
      <MapClickHandler onSelect={onSelect} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo trips={trips} selected={selected} />
      {trips.map(trip => {
        const isSelected = trip.id === selected
        const color = COMPANION_COLORS[trip.companion]
        return (
          <CircleMarker
            key={trip.id}
            center={[trip.lat, trip.lng]}
            radius={isSelected ? 10 : 7}
            pathOptions={{
              fillColor: color,
              fillOpacity: isSelected ? 1 : 0.8,
              color: 'white',
              weight: isSelected ? 3 : 1.5,
            }}
            eventHandlers={{
              click: (e) => {
                e.originalEvent.stopPropagation()
                onSelect(isSelected ? null : trip.id)
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
              <div className="text-center">
                <div className="font-semibold">{trip.city}</div>
                <div className="text-xs text-gray-500">{trip.country}</div>
                <div className="text-xs mt-0.5" style={{ color }}>
                  {COMPANION_LABELS[trip.companion]}
                </div>
                {trip.dateFrom && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    {trip.dateFrom}{trip.dateTo && trip.dateTo !== trip.dateFrom ? ` – ${trip.dateTo}` : ''}
                  </div>
                )}
              </div>
            </Tooltip>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
