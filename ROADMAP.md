# Travel Map — Rollout Plan

A personal world map for tracking everywhere you've been. Built with React + Leaflet, deployed to GitHub Pages, data stored permanently in a private GitHub Gist.

---

## Phase 1 — Visual polish & permanent storage ✅ Done

Quick wins: high-visibility improvements with low implementation cost.

| Item | Status | Notes |
|------|--------|-------|
| Switch basemap to CartoDB Positron | ✅ Done | Muted gray tiles let colored pins stand out |
| Legend as companion filter | ✅ Done | Click chips to toggle visibility; "Show all" resets |
| Year/month date picker | ✅ Done | Two-level: month grid → click year to zoom to decade |
| GitHub Gist sync | ✅ Done | Permanent storage tied to your GitHub account; auto-migrates localStorage data on first connect |
| Stats strip in sidebar header | ✅ Done | Shows unique cities, countries, and year range |

---

## Phase 2 — Core UX improvements ✅ Done

Address the main friction points in the add/edit and map interaction flows.

**Modal form for add/edit** ✅
Add/edit form moved out of the sidebar into a centered full-screen modal. Click the backdrop or press Escape to dismiss. The sidebar now calls back to App.tsx which owns form state.

**Click-to-popup on map pins** ✅
Clicking a pin opens a Leaflet Popup with city name, companion (color-coded), date range, notes, and Edit/Delete buttons. Hover still shows a lightweight tooltip with just the city name.

---

## Phase 3 — Trip grouping (data model change)

The current data model is flat: each city is an independent `Trip` record. Adding Paris + Rome + Barcelona creates 3 unrelated entries in the sidebar with no visible connection. This phase introduces a group concept.

**What changes**

Add an optional `tripId` field to the `Trip` type:

```ts
interface Trip {
  // ... existing fields
  tripId?: string  // shared by all cities added in the same multi-city submission
}
```

This is backward-compatible — existing single-city entries get no `tripId` and behave exactly as before. New multi-city submissions share one generated `tripId`.

**What this unlocks**

- Sidebar groups cities under a collapsible trip header (e.g. "Italy · Jun 2019 · 3 cities")
- Deleting a trip deletes all cities sharing its `tripId`
- Editing a trip allows adding or removing cities from the group
- Migration: no changes needed to existing data; lone entries simply have no `tripId`

---

## Phase 4 — Nice-to-haves

Revisit after the core experience is solid.

**Timeline / year slider** — a horizontal slider to scrub through trips chronologically, animating which pins are visible.

**Marker clustering** — at low zoom levels many pins overlap, especially in Europe. A clustering layer (e.g. Leaflet.markercluster) would group nearby pins and expand on zoom.

**Dark mode** — dark map tiles (CartoDB DarkMatter) paired with a dark sidebar theme. Leaflet tiles swap with a single URL change; the UI needs a Tailwind dark mode pass.

**Companion label customization** — currently the four companion types are hardcoded and personal. A future settings screen could let you rename or recolor them for sharing the app with others.

---

## Data model reference

```ts
type Companion = 'solo' | 'friends' | 'ana' | 'family'

interface Trip {
  id: string           // crypto.randomUUID()
  city: string
  country: string
  lat: number
  lng: number
  companion: Companion
  dateFrom?: string    // "YYYY-MM" — set by the date picker
  dateTo?: string
  notes?: string
  tripId?: string      // Phase 3 — shared by multi-city submissions
}
```

## Storage

Data lives in a private GitHub Gist (`trips.json`) under your GitHub account. The Gist ID and a personal access token (gist scope only) are stored in the browser's localStorage — never in source code. Every add/edit/delete syncs to the Gist in the background. localStorage acts as an offline cache and fallback.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Bundler | Vite 8 |
| Map | Leaflet 1.9 + react-leaflet 5 |
| Basemap | CartoDB Positron (free, no API key) |
| Styling | Tailwind CSS 3 |
| Geocoding | Nominatim (OpenStreetMap) — free, no API key |
| Persistence | GitHub Gist (primary) + localStorage (cache/fallback) |
| Hosting | GitHub Pages via GitHub Actions |
