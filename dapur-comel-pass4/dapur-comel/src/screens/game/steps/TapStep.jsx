/**
 * TapStep.jsx
 *
 * Handles: CRACK_EGG, FRY, BAKE
 * Gesture: tap the big target
 *
 * Interaction-complete logic:
 *   CRACK_EGG — two taps = crack animation + onComplete
 *   FRY / BAKE — one tap = start animation, onComplete fires when animation ends
 *
 * No blind durationHint timeout. Completion fires at animation end.
 *
 * Visual:
 *   Jumbo emoji target (180×180px).
 *   On tap: spring scale burst + particle scatter.
 *   After completion: green flash + checkmark.
 */

import { useState, useCallback, useRef } from 'react'
import { StepShell, useWrongTap, SPRING, WIGGLE_KEYFRAME } from './_shared.jsx'
import { hapticTap, hapticSuccess } from '../../../utils/haptics.js'
import { sfx } from '../../../utils/audio.js'
import { STEP } from '../../../utils/constants.js'

// Crack needs 2 taps; fry/bake needs 1
function requiredTaps(type) {
  return type === STEP.CRACK_EGG ? 2 : 1
}

// Particle emojis per step type
const PARTICLES = {
  [STEP.CRACK_EGG]: ['✨', '💛', '✨'],
  [STEP.FRY]:       ['💨', '🔥', '💨'],
  [STEP.BAKE]:      ['💨', '⭐', '💨'],
}

export function TapStep({ recipe, step, onComplete }) {
  const needed = requiredTaps(step.type)

  const [taps,       setTaps]       = useState(0)
  const [bursting,   setBursting]   = useState(false)
  const [done,       setDone]       = useState(false)
  const [particles,  setParticles]  = useState([])
  const { shaking, triggerWrong }   = useWrongTap()
  const completingRef = useRef(false)

  const handleTap = useCallback(() => {
    if (done || completingRef.current) return
    hapticTap()
    sfx.play(step.sfx)
    setBursting(true)
    setTimeout(() => setBursting(false), 300)

    const next = taps + 1
    setTaps(next)

    // Scatter particles
    const pts = (PARTICLES[step.type] ?? ['✨', '✨', '✨']).map((e, i) => ({
      id: Date.now() + i, emoji: e,
      x: (Math.random() - 0.5) * 120,
      y: -(Math.random() * 80 + 40),
    }))
    setParticles(pts)
    setTimeout(() => setParticles([]), 600)

    if (next >= needed && !completingRef.current) {
      completingRef.current = true
      hapticSuccess()
      setDone(true)
      // Complete immediately when last tap animation starts — feels instant
      setTimeout(onComplete, 280)
    }
  }, [taps, needed, done, step.type, onComplete])

  // Contextual visuals per step type
  const bgColor = step.type === STEP.FRY   ? '#FFE0CC'
                : step.type === STEP.BAKE  ? '#FFE8B0'
                : '#FFF8EC'

  const glowColor = step.type === STEP.FRY  ? 'rgba(255,140,90,0.45)'
                  : step.type === STEP.BAKE ? 'rgba(255,200,80,0.45)'
                  : 'rgba(255,215,0,0.35)'

  // Crack progress indicator (2 taps)
  const showCrackProgress = step.type === STEP.CRACK_EGG && needed === 2

  return (
    <StepShell step={step}>
      <div className="relative flex flex-col items-center gap-5">

        {/* Crack progress pips */}
        {showCrackProgress && (
          <div className="flex gap-3" aria-label={`${taps} dari 2 ketukan`}>
            {[0, 1].map(i => (
              <div
                key={i}
                className="rounded-full transition-all duration-200"
                style={{
                  width:           i < taps ? 32 : 24,
                  height:          i < taps ? 32 : 24,
                  backgroundColor: i < taps ? '#5EC4B6' : '#E8D8CC',
                }}
                aria-hidden="true"
              />
            ))}
          </div>
        )}

        {/* Main tap target */}
        <button
          type="button"
          className="relative flex items-center justify-center
                     rounded-full select-none outline-none"
          style={{
            width:       180,
            height:      180,
            background:  done
              ? 'linear-gradient(135deg, #5EC4B6, #3A9E91)'
              : bgColor,
            boxShadow:   done
              ? '0 8px 32px rgba(94,196,182,0.45)'
              : `0 8px 32px ${glowColor}, 0 2px 8px rgba(61,43,31,0.1)`,
            transform:   bursting ? 'scale(0.88)' : 'scale(1)',
            transition:  `transform 0.12s ${SPRING}, box-shadow 0.3s ease`,
            animation:   shaking ? 'gentleWiggle 0.35s ease' : undefined,
            touchAction: 'manipulation',
            cursor:      done ? 'default' : 'pointer',
          }}
          onPointerUp={handleTap}
          aria-label={step.label}
          disabled={done}
        >
          <span
            style={{
              fontSize:   '4.5rem',
              lineHeight: 1,
              userSelect: 'none',
              transition: `transform 0.12s ${SPRING}`,
              transform:  bursting ? 'scale(1.3)' : done ? 'scale(1.1)' : 'scale(1)',
              filter:     done ? 'none' : undefined,
            }}
            aria-hidden="true"
          >
            {done ? '✅' : step.emoji}
          </span>

          {/* Burst particles */}
          {particles.map(p => (
            <span
              key={p.id}
              className="absolute pointer-events-none"
              style={{
                fontSize:  '1.4rem',
                animation: `particleBurst 0.55s ease-out forwards`,
                '--tx':    `${p.x}px`,
                '--ty':    `${p.y}px`,
              }}
              aria-hidden="true"
            >
              {p.emoji}
            </span>
          ))}
        </button>

        {/* Tap hint */}
        {!done && (
          <p className="text-toddler-xs font-body font-700 text-ink-muted">
            {step.type === STEP.CRACK_EGG ? 'Ketuk 2 kali!' : 'Ketuk!'}
          </p>
        )}
      </div>

      <style>{`
        ${WIGGLE_KEYFRAME}
        @keyframes particleBurst {
          0%   { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0.5); opacity: 0; }
        }
      `}</style>
    </StepShell>
  )
}
