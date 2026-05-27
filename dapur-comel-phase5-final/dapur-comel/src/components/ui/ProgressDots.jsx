/**
 * ProgressDots.jsx
 *
 * Stage progress indicator in the HUD.
 * Shows where child is in the cooking journey.
 *
 * Completed: filled mint circle with ✓
 * Current:   filled oyen circle, larger, pulses
 * Pending:   small pale circle
 */

import { STAGE_FLOW } from '../../utils/constants.js'

// Emoji icon per stage (matches STAGE_FLOW order)
const STAGE_ICONS = ['🥚', '🔢', '🥄', '🔥', '🎂', '⭐']

export function ProgressDots({ currentIndex = 0, totalStages }) {
  const count = totalStages ?? STAGE_FLOW.length

  return (
    <div
      className="flex items-center gap-1.5"
      role="progressbar"
      aria-valuenow={currentIndex + 1}
      aria-valuemin={1}
      aria-valuemax={count}
      aria-label={`Langkah ${currentIndex + 1} daripada ${count}`}
    >
      {Array.from({ length: count }, (_, i) => {
        const done    = i < currentIndex
        const current = i === currentIndex
        const pending = i > currentIndex

        return (
          <div
            key={i}
            className="flex items-center justify-center rounded-full
                       transition-all duration-300 ease-out"
            style={{
              width:           current ? 36 : done ? 28 : 20,
              height:          current ? 36 : done ? 28 : 20,
              backgroundColor: current ? '#FF8C5A' : done ? '#5EC4B6' : '#E8D8CC',
              boxShadow:       current
                ? '0 0 0 4px rgba(255,140,90,0.2)'
                : done
                  ? '0 2px 6px rgba(94,196,182,0.3)'
                  : 'none',
              fontSize:        current ? '1rem' : '0.8rem',
            }}
            aria-hidden="true"
          >
            {done    && <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 900 }}>✓</span>}
            {current && <span>{STAGE_ICONS[i] ?? '🍴'}</span>}
          </div>
        )
      })}
    </div>
  )
}
