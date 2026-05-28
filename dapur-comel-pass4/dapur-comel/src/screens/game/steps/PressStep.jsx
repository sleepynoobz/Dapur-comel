/**
 * PressStep.jsx
 *
 * Handles: FLATTEN_DOUGH
 * Gesture: press and hold — dough expands outward
 *
 * Hold duration: 700ms max (toddler-friendly, per Pass 3 refinements).
 * Completion: fires at hold-complete, not on release.
 *
 * Visual:
 *   Dough circle starts small (80px), grows to 200px as child holds.
 *   Squish marks (flour puff lines) appear around dough during press.
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { StepShell, SPRING } from './_shared.jsx'
import { hapticTap, hapticSuccess } from '../../../utils/haptics.js'
import { sfx } from '../../../utils/audio.js'

const HOLD_MS = 700

export function PressStep({ recipe, step, onComplete }) {
  const [holding,    setHolding]    = useState(false)
  const [progress,   setProgress]   = useState(0)   // 0–1
  const [done,       setDone]       = useState(false)
  const [puffs,      setPuffs]      = useState([])

  const holdTimerRef  = useRef(null)
  const tickRef       = useRef(null)
  const startRef      = useRef(0)
  const completingRef = useRef(false)

  useEffect(() => () => {
    clearTimeout(holdTimerRef.current)
    clearInterval(tickRef.current)
  }, [])

  const startHold = useCallback((e) => {
    if (done || completingRef.current) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    hapticTap()
    sfx.play(step.sfx)
    startRef.current = Date.now()
    setHolding(true)

    // Progress ticker
    tickRef.current = setInterval(() => {
      const p = Math.min((Date.now() - startRef.current) / HOLD_MS, 1)
      setProgress(p)
    }, 30)

    // Scatter puffs
    setPuffs(Array.from({ length: 5 }, (_, i) => ({
      id: i,
      angle: (i / 5) * 360,
    })))

    holdTimerRef.current = setTimeout(() => {
      clearInterval(tickRef.current)
      completingRef.current = true
      hapticSuccess()
      setDone(true)
      setHolding(false)
      setProgress(1)
      setTimeout(onComplete, 300)
    }, HOLD_MS)
  }, [done, onComplete])

  const cancelHold = useCallback(() => {
    if (completingRef.current) return
    clearTimeout(holdTimerRef.current)
    clearInterval(tickRef.current)
    setHolding(false)
    setProgress(0)
    setPuffs([])
  }, [])

  // Dough size: 80px → 200px as progress increases
  const size = 80 + progress * 120

  return (
    <StepShell step={step}>
      <div className="relative flex flex-col items-center gap-4 select-none">

        <div className="relative flex items-center justify-center"
             style={{ width: 220, height: 220 }}>

          {/* Flour puffs */}
          {holding && puffs.map(p => (
            <div
              key={p.id}
              className="absolute pointer-events-none text-xl"
              style={{
                transform:  `rotate(${p.angle}deg) translateX(${60 + progress * 50}px) rotate(-${p.angle}deg)`,
                opacity:    0.4 + progress * 0.4,
                transition: 'transform 0.1s ease, opacity 0.1s ease',
              }}
              aria-hidden="true"
            >
              ✨
            </div>
          ))}

          {/* Dough */}
          <button
            type="button"
            className="flex items-center justify-center rounded-full outline-none"
            style={{
              width:       size,
              height:      size,
              background:  done
                ? 'linear-gradient(135deg, #F5DEB3, #DEB887)'
                : `linear-gradient(135deg, #FFF8DC, ${holding ? '#F5DEB3' : '#FFFAEC'})`,
              boxShadow:   holding
                ? `0 0 0 ${Math.round(progress * 8)}px rgba(245,222,179,0.4), 0 4px 20px rgba(61,43,31,0.15)`
                : '0 4px 20px rgba(61,43,31,0.12)',
              transition:  `width 0.06s ease, height 0.06s ease, box-shadow 0.1s ease, background 0.3s ease`,
              touchAction: 'none',
              cursor:      done ? 'default' : 'pointer',
            }}
            onPointerDown={startHold}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            onPointerCancel={cancelHold}
            aria-label={step.label}
          >
            <span style={{ fontSize: `${1.5 + progress * 2}rem`, lineHeight: 1 }}
                  aria-hidden="true">
              {done ? '✅' : step.emoji}
            </span>
          </button>
        </div>

        <p className="text-toddler-xs font-body font-700 text-ink-muted">
          {done ? 'Rata dah!' : holding ? 'Tekan lagi...' : 'Tekan dan tahan! 👇'}
        </p>

        {/* Hold progress arc */}
        {holding && !done && (
          <div className="absolute top-4 right-4" aria-hidden="true">
            <svg width={36} height={36} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={18} cy={18} r={14} fill="none" stroke="rgba(61,43,31,0.1)" strokeWidth={3} />
              <circle cx={18} cy={18} r={14} fill="none"
                stroke={recipe.color ?? '#FF8C5A'} strokeWidth={3}
                strokeDasharray={2 * Math.PI * 14}
                strokeDashoffset={2 * Math.PI * 14 * (1 - progress)}
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
      </div>
    </StepShell>
  )
}
