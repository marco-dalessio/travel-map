import { useState, useRef, useEffect, useCallback } from 'react'
import type { GeoSuggestion } from '../geocode'
import { searchPlaces } from '../geocode'

interface Props {
  value: string
  onChange: (val: string) => void
  onSelect: (suggestion: GeoSuggestion) => void
  placeholder?: string
}

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

export default function CityAutocomplete({ value, onChange, onSelect, placeholder }: Props) {
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  const search = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) { setSuggestions([]); setOpen(false); return }
      setLoading(true)
      const results = await searchPlaces(q).catch(() => [])
      setSuggestions(results)
      setOpen(results.length > 0)
      setHighlighted(-1)
      setLoading(false)
    }, 300),
    []
  )

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    onChange(v)
    search(v)
  }

  function pick(s: GeoSuggestion) {
    onChange(s.label)
    onSelect(s)
    setOpen(false)
    setSuggestions([])
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, suggestions.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)) }
    if (e.key === 'Enter' && highlighted >= 0) { e.preventDefault(); pick(suggestions[highlighted]) }
    if (e.key === 'Escape') setOpen(false)
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <input
        className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder ?? 'Type a city…'}
        autoComplete="off"
      />
      {loading && (
        <span className="absolute right-3 top-2.5 text-xs text-gray-400">…</span>
      )}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-[2000] mt-1 w-full rounded border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto text-sm">
          {suggestions.map((s, i) => (
            <li
              key={s.label}
              onMouseDown={() => pick(s)}
              className={`px-3 py-2 cursor-pointer ${i === highlighted ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
