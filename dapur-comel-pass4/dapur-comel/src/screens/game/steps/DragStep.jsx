/**
 * DragStep.jsx
 *
 * Handles: DECORATE, ADD_TOPPINGS
 * Gesture: drag toppings from palette onto target
 *
 * Reuses the proven pointer-capture drag mechanic from Phase 2 DecorateStage.
 * Driven entirely by step.toppings[] and step.requiredCount from recipe data.
 *
 * Completion: fires immediately when requiredCount toppings are placed.
 * Extra toppings beyond requiredCount are optional — child can keep dragging.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { StepShell, SPRING } from './_shared.jsx'
import { hapticDrop, hapticTap } from '../../../utils/haptics.js'
import { sfx } from '../../../utils/audio.js'

const DROP_RADIUS = 85  // px — forgiving

export function DragStep({ recipe, step, onComplete }) {
  const toppings     = step.toppings      ?? []
  const requiredCount = step.requiredCount ?? toppings.length

  const [placedIds,    setPlacedIds]    = useState([])
  const [drag,         setDrag]         = useState(null)
  const [targetGlow,   setTargetGlow]   = useState(false)
  const [completed,    setCompleted]    = useState(false)

  const cakeRef       = useRef(null)
  const dragRef       = useRef(null)
  const completingRef = useRef(false)

  useEffect(() => { dragRef.current = drag }, [drag])
  useEffect(() => () => { setDrag(null); dragRef.current = null }, [])

  const isOverTarget = useCallback((x, y) => {
    const el = cakeRef.current
    if (!el) return false
    const rect = el.getBoundingClientRect()
    const cx   = rect.left + rect.width  / 2
    const cy   = rect.top  + rect.height / 2
    return Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) <= DROP_RADIUS
  }, [])

  const handleDragStart = useCallback((e, topping) => {
    if (placedIds.includes(topping.id) || completingRef.current) return
    e.preventDefault()
    hapticTap()
    const d = { id: topping.id, topping, x: e.clientX, y: e.clientY }
    setDrag(d)
    dragRef.current = d
  }, [placedIds])

  const handleMove = useCallback((e) => {
    if (!dragRef.current) return
    e.preventDefault()
    const next = { ...dragRef.current, x: e.clientX, y: e.clientY }
    setDrag(next)
    dragRef.current = next
    setTargetGlow(isOverTarget(e.clientX, e.clientY))
  }, [isOverTarget])

  const handleEnd = useCallback((e) => {
    const d = dragRef.current
    if (!d) return
    setTargetGlow(false)
    const onTarget = isOverTarget(d.x, d.y)
    setDrag(null)
    dragRef.current = null

    if (onTarget && !placedIds.includes(d.id)) {
      hapticDrop()
      sfx.play(step.sfx)
      const next = [...placedIds, d.id]
      setPlacedIds(next)

      if (next.length >= requiredCount && !completingRef.current) {
        completingRef.current = true
        setCompleted(true)
        setTimeout(onComplete, 350)
      }
    }
  }, [placedIds, requiredCount, isOverTarget, onComplete])

  const dragHandlers = drag ? {
    onPointerMove:   handleMove,
    onPointerUp:     handleEnd,
    onPointerCancel: handleEnd,
  } : {}

  const remaining = toppings.filter(t => !placedIds.includes(t.id))

  // Target visual: cake/pizza emoji changes as toppings placed
  const targetEmoji = completed
    ? '✨'
    : placedIds.length >= requiredCount
      ? recipe.emoji
      : recipe.emoji

  return (
    <StepShell step={step}>
      <div
        className="flex flex-col items-center w-full h-full gap-4 select-none"
        style={{ touchAction: 'none' }}
        {...dragHandlers}
      >
        {/* Drop target */}
        <div
          ref={cakeRef}
          className="relative flex flex-col items-center justify-center rounded-full"
          style={{
            width:      180,
            height:     180,
            background: `linear-gradient(135deg, ${recipe.color}30, ${recipe.color}18)`,
            boxShadow:  targetGlow
              ? `0 0 0 5px ${recipe.color}, 0 0 30px ${recipe.color}55, 0 6px 24px rgba(0,0,0,0.12)`
              : '0 6px 24px rgba(61,43,31,0.12)',
            transition: 'box-shadow 0.15s ease',
            border:     drag && !targetGlow ? `3px dashed ${recipe.color}55` : '3px solid transparent',
          }}
          aria-label="Letak hiasan di sini"
        >
          <span style={{ fontSize: '3.5rem', lineHeight: 1 }} aria-hidden="true">
            {recipe.emoji}
          </span>

          {/* Placed toppings */}
          {placedIds.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 justify-center max-w-[120px]"
                 aria-live="polite">
              {placedIds.map(id => {
                const t = toppings.find(tp => tp.id === id)
                return (
                  <span key={id} style={{ fontSize: '1.5rem', animation: `toppingPop 0.3s ${SPRING} both` }}
                        aria-label={t?.label}>
                    {t?.emoji}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* Progress hint */}
        <p className="text-toddler-xs font-body font-700 text-ink-muted text-center">
          {completed
            ? 'Cantik! 🎉'
            : `Lagi ${Math.max(0, requiredCount - placedIds.length)} lagi`}
        </p>

        {/* Palette */}
        {remaining.length > 0 && (
          <div className="flex gap-3 justify-center flex-wrap">
            {remaining.map(topping => (
              <div
                key={topping.id}
                className="flex flex-col items-center gap-1 rounded-[1.1rem]"
                style={{
                  width:           80,
                  height:          80,
                  background:      '#FFF8EC',
                  boxShadow:       '0 3px 10px rgba(61,43,31,0.1)',
                  touchAction:     'none',
                  cursor:          'grab',
                  opacity:         drag?.id === topping.id ? 0.3 : 1,
                  transition:      'opacity 0.12s ease',
                }}
                onPointerDown={(e) => {
                  if (!e.isPrimary) return
                  e.currentTarget.setPointerCapture(e.pointerId)
                  handleDragStart(e, topping)
                }}
                aria-label={topping.label}
                role="button"
              >
                <span style={{ fontSize: '2.2rem', lineHeight: 1, marginTop: 12 }}
                      aria-hidden="true">
                  {topping.emoji}
                </span>
                <span className="text-[0.6rem] font-display font-800 text-ink-soft text-center">
                  {topping.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Drag ghost */}
        {drag && (
          <div
            className="pointer-events-none"
            style={{
              position:  'fixed',
              left:       drag.x,
              top:        drag.y,
              transform: 'translate(-50%, -50%) scale(1.3)',
              zIndex:     999,
              fontSize:  '3rem',
              filter:    'drop-shadow(0 6px 16px rgba(61,43,31,0.25))',
            }}
            aria-hidden="true"
          >
            {drag.topping.emoji}
          </div>
        )}
      </div>

      <style>{`
        @keyframes toppingPop {
          from { transform: scale(0) rotate(-10deg); opacity: 0; }
          to   { transform: scale(1) rotate(0deg);  opacity: 1; }
        }
      `}</style>
    </StepShell>
  )
}
