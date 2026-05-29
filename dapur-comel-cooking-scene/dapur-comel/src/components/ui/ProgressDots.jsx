/**
 * ProgressDots.jsx — Pass 1 update
 *
 * Removed dependency on STAGE_FLOW (now deleted).
 * totalStages is now always passed as a prop from GameScreen,
 * which reads it from currentRecipe.steps.length.
 *
 * Dot icons are generic cooking icons — no longer tied to stage names.
 */

const STEP_ICONS = ['🥚','🥄','🍳','🔥','🎂','⭐','🍕','🥞','🍔','✨']

export function ProgressDots({ currentIndex = 0, totalStages = 5 }) {
  return (
    <div
      className="flex items-center gap-1.5"
      role="progressbar"
      aria-valuenow={currentIndex + 1}
      aria-valuemin={1}
      aria-valuemax={totalStages}
      aria-label={`Langkah ${currentIndex + 1} daripada ${totalStages}`}
    >
      {Array.from({ length: totalStages }, (_, i) => {
        const done    = i < currentIndex
        const current = i === currentIndex

        return (
          <div
            key={i}
            className="flex items-center justify-center rounded-full transition-all duration-300 ease-out"
            style={{
              width:           current ? 36 : done ? 28 : 20,
              height:          current ? 36 : done ? 28 : 20,
              backgroundColor: current ? '#FF8C5A' : done ? '#5EC4B6' : '#E8D8CC',
              fontSize:        current ? '1rem' : '0.8rem',
            }}
            aria-hidden="true"
          >
            {done    && <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 900 }}>✓</span>}
            {current && <span>{STEP_ICONS[i % STEP_ICONS.length]}</span>}
          </div>
        )
      })}
    </div>
  )
}
