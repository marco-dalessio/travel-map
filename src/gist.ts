import type { Trip } from './types'

const CREDS_KEY = 'travel-map-gist-creds'
const FILE_NAME = 'trips.json'

export interface GistCredentials {
  gistId: string
  token: string
}

export function getCredentials(): GistCredentials | null {
  try {
    const raw = localStorage.getItem(CREDS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveCredentials(creds: GistCredentials): void {
  localStorage.setItem(CREDS_KEY, JSON.stringify(creds))
}

export function clearCredentials(): void {
  localStorage.removeItem(CREDS_KEY)
}

async function gistFetch(gistId: string, token: string, method: 'GET' | 'PATCH', body?: object): Promise<Response> {
  return fetch(`https://api.github.com/gists/${gistId}`, {
    method,
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
}

export async function loadFromGist(creds: GistCredentials): Promise<Trip[]> {
  const res = await gistFetch(creds.gistId, creds.token, 'GET')
  if (!res.ok) throw new Error(`GitHub API ${res.status}`)
  const data = await res.json()
  const file = data.files?.[FILE_NAME]
  if (!file) return []
  // Large gists are truncated — fetch raw content separately
  const content = file.truncated
    ? await fetch(file.raw_url).then(r => r.text())
    : (file.content as string)
  return JSON.parse(content) as Trip[]
}

export async function saveToGist(creds: GistCredentials, trips: Trip[]): Promise<void> {
  const res = await gistFetch(creds.gistId, creds.token, 'PATCH', {
    files: { [FILE_NAME]: { content: JSON.stringify(trips, null, 2) } },
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status}`)
}

export async function validateCredentials(creds: GistCredentials): Promise<boolean> {
  try {
    const res = await gistFetch(creds.gistId, creds.token, 'GET')
    return res.ok
  } catch {
    return false
  }
}
