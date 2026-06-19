export interface GeoSuggestion {
  label: string   // "Toronto, Ontario, Canada"
  city: string
  country: string
  lat: number
  lng: number
}

export async function searchPlaces(query: string): Promise<GeoSuggestion[]> {
  if (query.length < 2) return []
  const q = encodeURIComponent(query)
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=6&featuretype=city&addressdetails=1`,
    { headers: { 'Accept-Language': 'en' } }
  )
  const data = await res.json()
  return data
    .filter((r: any) => r.address)
    .map((r: any) => {
      const a = r.address
      const city = a.city ?? a.town ?? a.village ?? a.municipality ?? a.county ?? r.display_name.split(',')[0]
      const state = a.state ?? a.region ?? ''
      const country = a.country ?? ''
      const label = [city, state, country].filter(Boolean).join(', ')
      return { label, city, country, lat: parseFloat(r.lat), lng: parseFloat(r.lon) }
    })
    .filter((s: GeoSuggestion, i: number, arr: GeoSuggestion[]) =>
      arr.findIndex(x => x.label === s.label) === i
    )
}
