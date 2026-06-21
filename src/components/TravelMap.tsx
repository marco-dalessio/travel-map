import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup, useMap, useMapEvents } from 'react-leaflet'
import type { Trip } from '../types'
import { COMPANION_COLORS, COMPANION_LABELS } from '../types'
import 'leaflet/dist/leaflet.css'

interface Props {
  trips: Trip[]
  selected: string | null
  onSelect: (id: string | null) => void
  onEditTrip: (id: string) => void
  onDeleteTrip: (id: string) => void
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

function formatDate(d?: string): string {
  if (!d) return ''
  const [year, month] = d.split('-')
  if (!month) return year
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(month) - 1]} ${year}`
}

export default function TravelMap({ trips, selected, onSelect, onEditTrip, onDeleteTrip }: Props) {
  return (
    <MapContainer
      center={[20, 10]}
      zoom={2}
      minZoom={2}
      className="flex-1"
      style={{ height: '100%', width: '100%' }}
    >
      <MapClickHandler onSelect={onSelect} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />
      <FlyTo trips={trips} selected={selected} />
      {trips.map(trip => {
        const isSelected = trip.id === selected
        const color = COMPANION_COLORS[trip.companion]
        const dateFrom = formatDate(trip.dateFrom)
        const dateTo = formatDate(trip.dateTo)
        const dateStr = dateFrom
          ? dateTo && dateTo !== dateFrom ? `${dateFrom} – ${dateTo}` : dateFrom
          : ''

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
            {/* Hover tooltip — just the city name */}
            <Tooltip direction="top" offset={[0, -8]} opacity={0.9} sticky={false}>
              <span className="font-medium text-sm">{trip.city}</span>
            </Tooltip>

            {/* Click popup — full details + actions */}
            <Popup
              offset={[0, -6]}
              closeButton={true}
              minWidth={200}
            >
              <div className="py-0.5">
                <div className="font-semibold text-gray-900 text-sm leading-tight">{trip.city}</div>
                <div className="text-xs text-gray-400 mb-2">{trip.country}</div>
                <div className="text-xs font-semibold mb-1" style={{ color }}>
                  {COMPANION_LABELS[trip.companion]}
                </div>
                {dateStr && (
                  <div className="text-xs text-gray-400 mb-1">{dateStr}</div>
                )}
                {trip.notes && (
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed border-t border-gray-100 pt-1.5">
                    {trip.notes}
                  </p>
                )}
                <div className="flex gap-3 mt-2.5 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => onEditTrip(trip.id)}
                    className="text-xs text-blue-500 hover:underline font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { if (confirm(`Delete ${trip.city}?`)) onDeleteTrip(trip.id) }}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
