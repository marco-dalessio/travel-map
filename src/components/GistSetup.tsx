import { useState } from 'react'
import type { GistCredentials } from '../gist'
import { validateCredentials } from '../gist'

interface Props {
  onConnect: (creds: GistCredentials) => void
  onSkip: () => void
}

export default function GistSetup({ onConnect, onSkip }: Props) {
  const [gistId, setGistId] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConnect() {
    setError('')
    setLoading(true)
    try {
      const creds: GistCredentials = { gistId: gistId.trim(), token: token.trim() }
      if (!creds.gistId || !creds.token) {
        setError('Please fill in both fields.')
        return
      }
      const valid = await validateCredentials(creds)
      if (!valid) {
        setError('Could not connect — check your Gist ID and token.')
        return
      }
      onConnect(creds)
    } catch {
      setError('Connection failed. Check your credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Connect to GitHub Gist</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Your trips will be saved to a private GitHub Gist — permanent, version-controlled, and fully under your control.
          </p>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Gist ID
            </label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
              placeholder="e.g. 4e76310d0646e5e22b3e2c5975416d2b"
              value={gistId}
              onChange={e => setGistId(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <p className="mt-1 text-xs text-gray-400">The hash at the end of your Gist URL</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              GitHub Token
            </label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
              placeholder="ghp_…"
              value={token}
              onChange={e => setToken(e.target.value)}
              type="password"
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-gray-400">Personal access token with <code className="bg-gray-100 px-1 rounded">gist</code> scope only — stored locally in your browser</p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 border border-gray-200 transition-colors"
          >
            Use local storage
          </button>
          <button
            onClick={handleConnect}
            disabled={!gistId || !token || loading}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 transition-colors"
          >
            {loading ? 'Connecting…' : 'Connect'}
          </button>
        </div>

        {/* How-to hint */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-xs text-gray-400 leading-relaxed">
            <strong className="text-gray-500">Setup:</strong> Create a secret Gist at <span className="font-mono">gist.github.com</span> with a file named <span className="font-mono bg-gray-100 px-1 rounded">trips.json</span> containing <span className="font-mono bg-gray-100 px-1 rounded">[]</span>. Then generate a token at <span className="font-mono">github.com/settings/tokens</span> with the <span className="font-mono bg-gray-100 px-1 rounded">gist</span> scope.
          </p>
        </div>
      </div>
    </div>
  )
}
