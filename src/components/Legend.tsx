import { COMPANION_COLORS, COMPANION_LABELS } from '../types'
import type { Companion } from '../types'

export default function Legend() {
  return (
    <div className="absolute bottom-6 right-4 z-[1000] bg-white rounded-lg shadow-md px-3 py-2 text-xs flex flex-col gap-1.5">
      {(Object.keys(COMPANION_LABELS) as Companion[]).map(c => (
        <div key={c} className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: COMPANION_COLORS[c] }} />
          <span className="text-gray-600">{COMPANION_LABELS[c]}</span>
        </div>
      ))}
    </div>
  )
}
