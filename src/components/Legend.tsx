import { COMPANION_COLORS, COMPANION_LABELS } from '../types'
import type { Companion } from '../types'

interface Props {
  activeCompanions: Set<Companion>
  onToggle: (c: Companion) => void
}

export default function Legend({ activeCompanions, onToggle }: Props) {
  const allActive = activeCompanions.size === 4

  return (
    <div className="absolute bottom-6 right-4 z-[1000] bg-white rounded-lg shadow-md px-3 py-2.5 text-xs flex flex-col gap-1.5">
      {(Object.keys(COMPANION_LABELS) as Companion[]).map(c => {
        const isActive = activeCompanions.has(c)
        return (
          <button
            key={c}
            type="button"
            onClick={() => onToggle(c)}
            title={isActive ? `Hide ${COMPANION_LABELS[c]}` : `Show ${COMPANION_LABELS[c]}`}
            className={`flex items-center gap-2 text-left rounded px-1 py-0.5 -mx-1 transition-opacity hover:bg-gray-50 ${isActive ? 'opacity-100' : 'opacity-35'}`}
          >
            <span
              className="w-3 h-3 rounded-full shrink-0 transition-opacity"
              style={{ background: COMPANION_COLORS[c] }}
            />
            <span className="text-gray-600 whitespace-nowrap">{COMPANION_LABELS[c]}</span>
          </button>
        )
      })}
      {!allActive && (
        <button
          type="button"
          onClick={() => (Object.keys(COMPANION_LABELS) as Companion[]).forEach(c => !activeCompanions.has(c) && onToggle(c))}
          className="mt-0.5 text-blue-500 text-left hover:underline text-xs"
        >
          Show all
        </button>
      )}
    </div>
  )
}
