import { useState, useRef, useEffect } from 'react'

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_FULL  = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

interface Props {
  value: string            // "YYYY-MM" or ""
  onChange: (val: string) => void
  placeholder?: string
  label?: string
}

function parseValue(value: string): { year: number; month: number } | null {
  if (!value) return null
  const parts = value.split('-')
  if (parts.length < 2) return null
  return { year: parseInt(parts[0]), month: parseInt(parts[1]) - 1 }
}

function formatDisplay(value: string): string {
  const p = parseValue(value)
  if (!p) return ''
  return `${MONTHS_FULL[p.month]} ${p.year}`
}

export default function DatePicker({ value, onChange, placeholder = 'Month, Year', label }: Props) {
  const parsed = parseValue(value)
  const currentYear = new Date().getFullYear()

  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'month' | 'year'>('month')
  const [viewYear, setViewYear] = useState(parsed?.year ?? currentYear)
  const [decadeStart, setDecadeStart] = useState(() => Math.floor((parsed?.year ?? currentYear) / 12) * 12)
  const [popupPos, setPopupPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 240 })

  const triggerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function openPicker() {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      // Decide whether to open above or below
      const spaceBelow = window.innerHeight - rect.bottom
      const popupHeight = 220
      const top = spaceBelow >= popupHeight ? rect.bottom + 4 : rect.top - popupHeight - 4
      setPopupPos({ top, left: rect.left, width: Math.max(rect.width, 220) })
    }
    // Sync view state to current value
    if (parsed) {
      setViewYear(parsed.year)
      setDecadeStart(Math.floor(parsed.year / 12) * 12)
    }
    setView('month')
    setOpen(true)
  }

  function selectMonth(monthIndex: number) {
    onChange(`${viewYear}-${String(monthIndex + 1).padStart(2, '0')}`)
    setOpen(false)
  }

  function selectYear(year: number) {
    setViewYear(year)
    setView('month')
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
  }

  const display = formatDisplay(value)

  return (
    <div ref={containerRef}>
      {label && (
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      )}
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={openPicker}
        className={`mt-1 w-full rounded border px-3 py-2 text-sm cursor-pointer flex items-center justify-between select-none transition-colors
          ${open ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'}
          ${display ? 'text-gray-800' : 'text-gray-400'}
        `}
      >
        <span>{display || placeholder}</span>
        {value && (
          <button
            type="button"
            onClick={clear}
            className="ml-2 text-gray-300 hover:text-gray-500 text-base leading-none"
            tabIndex={-1}
          >
            ×
          </button>
        )}
      </div>

      {/* Popup — fixed position so it escapes any overflow:hidden parent */}
      {open && (
        <div
          style={{ position: 'fixed', top: popupPos.top, left: popupPos.left, width: popupPos.width, zIndex: 9999 }}
          className="bg-white border border-gray-200 rounded-xl shadow-xl p-3"
        >
          {view === 'month' ? (
            <>
              {/* Year nav row */}
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => setViewYear(y => y - 1)}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-lg leading-none"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setView('year')}
                  className="text-sm font-bold text-gray-800 hover:text-blue-600 px-2 py-0.5 rounded hover:bg-gray-50 transition-colors"
                  title="Jump to year"
                >
                  {viewYear}
                </button>
                <button
                  type="button"
                  onClick={() => setViewYear(y => y + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-lg leading-none"
                >
                  ›
                </button>
              </div>
              {/* Month grid */}
              <div className="grid grid-cols-3 gap-1">
                {MONTHS_SHORT.map((m, i) => {
                  const isSelected = parsed?.year === viewYear && parsed?.month === i
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => selectMonth(i)}
                      className={`py-1.5 rounded-lg text-sm font-medium transition-colors
                        ${isSelected
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      {m}
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              {/* Decade nav row */}
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => setDecadeStart(d => d - 12)}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-lg leading-none"
                >
                  ‹
                </button>
                <span className="text-sm font-bold text-gray-800">
                  {decadeStart} – {decadeStart + 11}
                </span>
                <button
                  type="button"
                  onClick={() => setDecadeStart(d => d + 12)}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-lg leading-none"
                >
                  ›
                </button>
              </div>
              {/* Year grid */}
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 12 }, (_, i) => decadeStart + i).map(y => {
                  const isSelected = parsed?.year === y
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => selectYear(y)}
                      className={`py-1.5 rounded-lg text-sm font-medium transition-colors
                        ${isSelected
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      {y}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
