export async function geocodeCity(city: string, country: string): Promise<{ lat: number; lng: number } | null> {
  const q = encodeURIComponent(`${city}, ${country}`)
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
    { headers: { 'Accept-Language': 'en' } }
  )
  const data = await res.json()
  if (!data.length) return null
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
}
