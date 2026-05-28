/**
 * PourStep.jsx
 *
 * Handles: POUR
 * Gesture: drag container downward (no gyroscope — pure drag simulation)
 *
 * Interaction-complete: onComplete fires when stream fills target bowl.
 *
 * Mechanic:
 *   Child drags the ingredient container downward.
 *   As drag distance increases, a liquid stream grows below container.
 *   When stream reaches bowl target (or drag distance ≥ threshold), complete.
 *
 * Visual:
 *   Container emoji at top.
 *   CSS-animated stream between container and bowl.
 *   Bowl "fills" with colour as pour progresses.
 *   Completion: bowl splashes, container returns up.
 */

import { useState, useRef, useCallback } from 'react'
import { StepShell, SPRING, WIGGLE_KEYFRAME } from './_shared.jsx'
import { hapticTap, hapticSuccess } from '../../../utils/haptics.js'
import { sfx } from '../../../utils/audio.js'

const POUR_THRESHOLD = 100  // px drag needed to complete pour

export function PourStep({ recipe, step, onComplete }) {
  const [dragY,      setDragY]      = useState(0)    // 0–POUR_THRESHOLD
  const [isDragging, setIsDragging] = useState(false)
  const [done,       setDone]       = useState(false)

  const pointerRef    = useRef(null)
  const startYRef     = useRef(0)
  const completingRef = useRef(false)

  const progress = Math.min(dragY / POUR_THRESHOLD, 1)

  const handlePointerDown = useCallback((e) => {
    if (done) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    pointerRef.current = e.pointerId
    startYRef.current  = e.clientY
    setIsDragging(true)
    hapticTap()
    sfx.play(step.sfx)
  }, [done])

  const handlePointerMove = useCallback((e) => {
    if (pointerRef.current === null || done || completingRef.current) return
    e.preventDefault()
    const delta = Math.max(0, e.clientY - startYRef.current)
    setDragY(Math.min(delta, POUR_THRESHOLD + 20))

    if (delta >= POUR_THRESHOLD && !completingRef.current) {
      completingRef.current = true
      hapticSuccess()
      setDone(true)
      setIsDragging(false)
      setTimeout(onComplete, 350)  // brief splash moment then advance
    }
  }, [done, onComplete])

  const handlePointerUp = useCallback(() => {
    if (pointerRef.current === null) return
    pointerRef.current = null
    setIsDragging(false)
    if (!completingRef.current) {
      // Snap back if didn't complete
      setDragY(0)
    }
  }, [])

  const streamHeight = progress * 90  // max 90px stream
  const bowlFill     = progress

  return (
    <StepShell step={step}>
      <div className="relative flex flex-col items-center gap-2 select-none"
           style={{ height: 260 }}>

        {/* Container — draggable */}
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width:       110,
            height:      110,
            background:  '#FFF8EC',
            boxShadow:   '0 4px 20px rgba(61,43,31,0.12)',
            transform:   `translateY(${dragY * 0.6}px)`,
            transition:  isDragging ? 'none' : `transform 0.35s ${SPRING}`,
            touchAction: 'none',
            cursor:      done ? 'default' : 'grab',
            zIndex:      2,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          aria-label={step.label}
        >
          <span style={{ fontSize: '3.5rem', lineHeight: 1 }} aria-hidden="true">
            {done ? '✅' : step.emoji}
          </span>
        </div>

        {/* Liquid stream */}
        {(isDragging || done) && streamHeight > 2 && (
          <div
            className="rounded-full"
            style={{
              width:           10,
              height:          done ? 90 : streamHeight,
              background:      'linear-gradient(180deg, #87CEEB 0%, #4A9EBF 100%)',
              transition:      isDragging ? 'none' : 'height 0.2s ease',
              marginTop:       -8,
              zIndex:          1,
              opacity:         done ? 0 : 0.85,
            }}
            aria-hidden="true"
          />
        )}

        {/* Bowl target */}
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width:        100,
            height:       100,
            background:   `linear-gradient(135deg, rgba(255,200,130,${0.1 + bowlFill * 0.6}), rgba(255,160,80,${0.15 + bowlFill * 0.5}))`,
            boxShadow:    done
              ? '0 0 0 4px #5EC4B6, 0 4px 20px rgba(94,196,182,0.3)'
              : '0 4px 16px rgba(61,43,31,0.1)',
            transition:   'background 0.15s ease, box-shadow 0.3s ease',
            marginTop:    4,
          }}
          aria-label="Mangkuk"
        >
          <span style={{ fontSize: '2.5rem', lineHeight: 1 }} aria-hidden="true">
            {done ? '✨' : '🥣'}
          </span>
        </div>

        {/* Drag hint */}
        {!isDragging && !done && (
          <p className="absolute bottom-0 text-toddler-xs font-body font-700 text-ink-muted">
            Seret ke bawah! 👇
          </p>
        )}
      </div>

      <style>{`${WIGGLE_KEYFRAME}`}</style>
    </StepShell>
  )
}
