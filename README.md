# Travel Map

A personal world map for tracking everywhere you've been — by city, with color-coded pins by travel companion, optional dates and notes, and a searchable sidebar. Built with React + Leaflet, deployed to GitHub Pages, no backend required.

**Live app:** https://marco-dalessio.github.io/travel-map/

---

## Features

- **Interactive world map** with circle pins, one per city visited
- **Color-coded by companion** — solo, with friends, with Ana, or with Ana & kid
- **City autocomplete** — type a partial name, pick from a "City, State, Country" dropdown; no free-text typos, no manual coordinates
- **Multi-city trip entry** — add several cities in one form submission when they share the same companion, dates, and notes
- **Sidebar** with a searchable, date-sorted list of all trips; click any entry to fly the map to that pin
- **Edit and delete** individual trips from the sidebar
- **Export / Import JSON** — download your data as a backup or import it to restore or sync across devices
- Data persists in **localStorage** — no account, no server, no cost

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Bundler | Vite 8 |
| Map | Leaflet 1.9 + react-leaflet 5 |
| Styling | Tailwind CSS 3 |
| Geocoding | Nominatim (OpenStreetMap) — free, no API key |
| Persistence | Browser localStorage |
| Hosting | GitHub Pages via GitHub Actions |

---

## Project structure

```
src/
├── types.ts                  # Trip type, Companion enum, color/label maps
├── storage.ts                # localStorage read/write, JSON export/import
├── geocode.ts                # Nominatim autocomplete search
├── App.tsx                   # Root state, wires Sidebar ↔ TravelMap
└── components/
    ├── TravelMap.tsx         # Leaflet map, circle markers, fly-to behavior
    ├── Sidebar.tsx           # Trip list, search, add/edit/delete, import/export
    ├── TripForm.tsx          # Add/edit form with multi-city support
    ├── CityAutocomplete.tsx  # Debounced autocomplete input backed by Nominatim
    └── Legend.tsx            # Color legend overlay on the map
```

---

## Data model

Each trip is stored as a flat JSON object:

```ts
interface Trip {
  id: string           // crypto.randomUUID()
  city: string         // "Toronto"
  country: string      // "Canada"
  lat: number          // from Nominatim
  lng: number          // from Nominatim
  companion: Companion // "solo" | "friends" | "ana" | "family"
  dateFrom?: string    // "2023-06" or "2023" — free format, optional
  dateTo?: string
  notes?: string
}
```

All trips are stored as a JSON array under the `travel-map-trips` key in localStorage.

---

## Companion colors

| Value | Label | Color |
|-------|-------|-------|
| `solo` | Solo | Blue `#3b82f6` |
| `friends` | With friends | Orange `#f97316` |
| `ana` | With Ana | Pink `#ec4899` |
| `family` | With Ana & kid | Green `#22c55e` |

---

## How to use the app

### Adding trips

1. Click **+ Add trip** in the sidebar
2. Type a city name in the autocomplete field — suggestions appear as "City, State, Country" after 2+ characters
3. Pick the correct city from the dropdown (required — the app uses the coordinates from the suggestion)
4. To log multiple cities from the same trip, click **+ add another city** and repeat
5. Select who you traveled with using the colored buttons
6. Optionally fill in dates (any format works — `2023`, `2023-06`, `Jun 2023`) and a note
7. Click **Add trip** — all cities are pinned to the map at once

### Editing a trip

Click a trip in the sidebar to select it, then click **Edit**. The form opens pre-filled with that city's data. You can change any field except the city count (editing is single-city only).

### Deleting a trip

Click the trip in the sidebar to select it, then click **Delete**. You'll be asked to confirm.

### Navigating the map

- Click any pin on the map to select it — the sidebar highlights the matching entry
- Click a city in the sidebar to fly the map to that pin
- Click anywhere on the map background to deselect
- Hover a pin for a tooltip showing city, country, companion, and date

### Backup and restore

Use the **Export JSON** button at the bottom of the sidebar to download all your trips as `my-travels.json`. To restore on a new device or browser, click **Import JSON** and select the file — it replaces the current data.

---

## Running locally

```bash
git clone https://github.com/marco-dalessio/travel-map.git
cd travel-map
npm install
npm run dev
```

The app opens at `http://localhost:5173/travel-map/`.

To build for production:

```bash
npm run build
```

Output goes to `dist/`.

---

## Deployment

The repo includes a GitHub Actions workflow at `.github/workflows/deploy.yml` that builds and deploys to GitHub Pages automatically on every push to `main`.

**One-time setup** (already done):
1. Repo Settings → Pages → Source: **GitHub Actions**
2. Ensure the repo is **public** (GitHub Pages requires this on free accounts)

Any `git push origin main` triggers a new deploy. The live URL is always `https://marco-dalessio.github.io/travel-map/`.

---

## Geocoding

City lookup uses the [Nominatim](https://nominatim.openstreetmap.org/) API from OpenStreetMap — free, no API key required. Requests are debounced at 300ms to avoid hammering the API while typing. Results are deduplicated by label and limited to 6 suggestions per query.

Nominatim's usage policy asks that requests include a descriptive `User-Agent` and are not made at high volume. This app's debouncing and single-user nature keep it well within acceptable use.

---

## Known limitations

- **localStorage is browser-local** — trips added in Chrome won't appear in Safari or on another device. Use Export/Import to move data around.
- **No offline map tiles** — the map requires an internet connection to load tiles from OpenStreetMap.
- **Nominatim coverage** — very small towns or obscure locations may not appear in autocomplete results.
- **Single city per pin** — if you visited a region rather than a specific city, pick the nearest city as a proxy.
