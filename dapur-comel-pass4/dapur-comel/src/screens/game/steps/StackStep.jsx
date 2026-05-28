/**
 * StackStep.jsx
 *
 * Handles: STACK (burger layers)
 * Gesture: sequential tap — each tap snaps the next layer onto the stack
 *
 * Completion: fires after all layers placed.
 * Each layer drops in with a CSS spring animation.
 * Child just taps anywhere on the stack — no precision required.
 */

import { useState, useCallback, useRef } from 'react'
import { StepShell, SPRING } from './_shared.jsx'
import { hapticTap, hapticSuccess, hapticDrop } from '../../../utils/haptics.js'
import { sfx } from '../../../utils/audio.js'
import { hapticSnap } from '../../../utils/haptics.js'

export function StackStep({ recipe, step, onComplete }) {
  const layers = step.layers ?? []

  const [placed,    setPlaced]    = useState([])   // layers placed so far (array of layer objects)
  const [bouncing,  setBouncing]  = useState(false) // last-placed layer bounce

  const completingRef = useRef(false)

  const handleTap = useCallback(() => {
    if (completingRef.current) return
    const nextIndex = placed.length
    if (nextIndex >= layers.length) return

    hapticSnap()
    sfx.play('stack')
    setBouncing(true)
    setTimeout(() => setBouncing(false), 350)

    const next = [...placed, layers[nextIndex]]
    setPlaced(next)

    if (next.length >= layers.length && !completingRef.current) {
      completingRef.current = true
      hapticSuccess()
      setTimeout(onComplete, 400)
    }
  }, [placed, layers, onComplete])

  const remaining = layers.length - placed.length
  const nextLayer = layers[placed.length]

  return (
    <StepShell step={step}>
      <div className="flex flex-col items-center gap-3 select-none">

        {/* Stack display — tap target */}
        <button
          type="button"
          className="relative flex flex-col-reverse items-center justify-end
                     rounded-[1.5rem] outline-none"
          style={{
            width:       180,
            minHeight:   180,
            background:  'rgba(255,248,236,0.6)',
            boxShadow:   '0 4px 20px rgba(61,43,31,0.1)',
            padding:     '12px 12px 16px',
            touchAction: 'manipulation',
            cursor:      remaining > 0 ? 'pointer' : 'default',
            gap:         4,
          }}
          onPointerUp={handleTap}
          aria-label={`Susun burger — ${remaining} lapisan lagi`}
        >
          {placed.map((layer, i) => (
            <div
              key={layer.id}
              className="flex items-center justify-center rounded-full"
              style={{
                width:     120,
                height:    42,
                background: 'rgba(255,255,255,0.7)',
                animation:  i === placed.length - 1 && bouncing
                  ? `layerDrop 0.35s ${SPRING} both`
                  : 'none',
                boxShadow:  '0 2px 6px rgba(61,43,31,0.08)',
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{layer.emoji}</span>
              <span className="text-[0.6rem] font-display font-800 text-ink-muted ml-1">
                {layer.label}
              </span>
            </div>
          ))}

          {/* Empty placeholder when nothing placed */}
          {placed.length === 0 && (
            <div className="text-4xl text-ink-muted opacity-20" aria-hidden="true">🍽️</div>
          )}
        </button>

        {/* Next layer hint */}
        {nextLayer && (
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">{nextLayer.emoji}</span>
            <p className="text-toddler-xs font-body font-700 text-ink-muted">
              Tambah {nextLayer.label}! Tap!
            </p>
          </div>
        )}

        {!nextLayer && (
          <p className="text-toddler-xs font-body font-700 text-mint">
            Burger siap! 🎉
          </p>
        )}
      </div>

      <style>{`
        @keyframes layerDrop {
          0%   { transform: translateY(-40px); opacity: 0; }
          60%  { transform: translateY(6px); }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </StepShell>
  )
}
