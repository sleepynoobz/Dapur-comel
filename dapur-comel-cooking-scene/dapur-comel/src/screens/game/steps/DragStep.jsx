/**
 * DragStep.jsx — Visual polish
 *
 * Target glows with recipe colour on hover.
 * Toppings have drop-shadows and realistic sizing.
 * Snap-in: scale(0) → scale(1.2) → scale(1) overshoot.
 * Target rotates slightly on each drop for playful feel.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { StepShell, SPRING } from './_shared.jsx'
import { hapticDrop, hapticTap } from '../../../utils/haptics.js'
import { sfx } from '../../../utils/audio.js'

const DROP_RADIUS = 88

export function DragStep({ recipe, step, onComplete }) {
  const toppings      = step.toppings ?? []
  const requiredCount = step.requiredCount ?? toppings.length

  const [placedIds,  setPlacedIds]  = useState([])
  const [drag,       setDrag]       = useState(null)
  const [targetGlow, setTargetGlow] = useState(false)
  const [done,       setDone]       = useState(false)
  const [targetTilt, setTargetTilt] = useState(0)   // slight rotate on each drop

  const cakeRef       = useRef(null)
  const dragRef       = useRef(null)
  const completingRef = useRef(false)

  useEffect(() => { dragRef.current = drag }, [drag])
  useEffect(() => () => { setDrag(null); dragRef.current = null }, [])

  const isOverTarget = useCallback((x, y) => {
    const el = cakeRef.current
    if (!el) return false
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width  / 2
    const cy = rect.top  + rect.height / 2
    return Math.sqrt((x-cx)**2 + (y-cy)**2) <= DROP_RADIUS
  }, [])

  const handleDragStart = useCallback((e, topping) => {
    if (placedIds.includes(topping.id) || completingRef.current) return
    e.preventDefault()
    hapticTap()
    sfx.play(step.sfx)
    const d = { id: topping.id, topping, x: e.clientX, y: e.clientY }
    setDrag(d); dragRef.current = d
  }, [placedIds, step.sfx])

  const handleMove = useCallback((e) => {
    if (!dragRef.current) return
    e.preventDefault()
    const next = { ...dragRef.current, x: e.clientX, y: e.clientY }
    setDrag(next); dragRef.current = next
    setTargetGlow(isOverTarget(e.clientX, e.clientY))
  }, [isOverTarget])

  const handleEnd = useCallback((e) => {
    const d = dragRef.current
    if (!d) return
    setTargetGlow(false)
    const onTarget = isOverTarget(d.x, d.y)
    setDrag(null); dragRef.current = null

    if (onTarget && !placedIds.includes(d.id)) {
      hapticDrop()
      // Playful tilt on each drop
      setTargetTilt(prev => prev + (Math.random() > 0.5 ? 2 : -2))
      const next = [...placedIds, d.id]
      setPlacedIds(next)

      if (next.length >= requiredCount && !completingRef.current) {
        completingRef.current = true
        setDone(true)
        setTimeout(onComplete, 380)
      }
    }
  }, [placedIds, requiredCount, isOverTarget, onComplete])

  const dragHandlers = drag ? {
    onPointerMove: handleMove, onPointerUp: handleEnd, onPointerCancel: handleEnd,
  } : {}

  const remaining = toppings.filter(t => !placedIds.includes(t.id))

  // Target background per recipe
  const targetBg = recipe.id === 'pizza'
    ? 'radial-gradient(circle at 40% 35%, #FFE4A0 0%, #F0C060 55%, #D4A040 100%)'
    : recipe.id === 'cake'
      ? 'linear-gradient(160deg, #FFE8E8 0%, #FFD0D0 60%, #FFC0C0 100%)'
      : `linear-gradient(160deg, ${recipe.color ?? '#FF8C5A'}22, ${recipe.color ?? '#FF8C5A'}44)`

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
            width:      190, height: 190,
            background: targetBg,
            boxShadow:  targetGlow
              ? `0 0 0 5px ${recipe.color ?? '#FF8C5A'}, 0 0 32px ${recipe.color ?? '#FF8C5A'}66, 0 8px 32px rgba(0,0,0,0.15)`
              : '0 8px 32px rgba(80,40,10,0.18), inset 0 4px 8px rgba(255,255,255,0.3)',
            border:     `3px solid ${targetGlow ? recipe.color ?? '#FF8C5A' : 'rgba(220,180,100,0.3)'}`,
            transform:  `rotate(${targetTilt}deg)`,
            transition: `box-shadow 0.15s ease, border-color 0.15s ease, transform 0.3s ${SPRING}`,
          }}
          aria-label="Letakkan hiasan di sini"
        >
          <span style={{ fontSize:'3.5rem', lineHeight:1, filter:'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' }}
                aria-hidden="true">
            {recipe.emoji}
          </span>

          {/* Placed toppings with snap animation */}
          {placedIds.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 justify-center" style={{ maxWidth:130 }}
                 aria-live="polite">
              {placedIds.map((id, idx) => {
                const t = toppings.find(tp => tp.id === id)
                return (
                  <span key={id}
                        style={{
                          fontSize: '1.6rem',
                          filter:   'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                          animation:`toppingSnap 0.35s ${SPRING} both`,
                          animationDelay: `${idx * 0.04}s`,
                          display:'inline-block',
                        }}
                        aria-label={t?.label}>
                    {t?.emoji}
                  </span>
                )
              })}
            </div>
          )}

          {/* Dashed drop ring */}
          {drag && !done && (
            <div style={{
              position:'absolute', inset:-4,
              borderRadius:'50%',
              border: `3px dashed ${recipe.color ?? '#FF8C5A'}${targetGlow ? 'cc' : '44'}`,
              transition:'border-color 0.15s ease',
            }} aria-hidden="true" />
          )}
        </div>

        <p className="font-display font-900 text-center"
           style={{ fontSize:'0.92rem', color: done ? recipe.color : 'rgba(61,43,31,0.5)' }}>
          {done ? 'Cantik sekali! 🎉' : `Lagi ${Math.max(0, requiredCount - placedIds.length)} lagi`}
        </p>

        {/* Topping palette */}
        {remaining.length > 0 && (
          <div className="flex gap-3 justify-center flex-wrap">
            {remaining.map(topping => (
              <div
                key={topping.id}
                className="ingredient-card"
                style={{
                  width: 78, height: 82,
                  opacity: drag?.id === topping.id ? 0.28 : 1,
                  transition: 'opacity 0.12s ease',
                }}
                onPointerDown={(e) => {
                  if (!e.isPrimary) return
                  e.currentTarget.setPointerCapture(e.pointerId)
                  handleDragStart(e, topping)
                }}
                aria-label={topping.label}
                role="button"
              >
                <span style={{ fontSize:'2.2rem', lineHeight:1, marginTop:10,
                               filter:'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' }}
                      aria-hidden="true">
                  {topping.emoji}
                </span>
                <span style={{ fontSize:'0.62rem', fontWeight:800, color:'rgba(61,43,31,0.6)',
                               textAlign:'center', padding:'0 4px' }}>
                  {topping.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Drag ghost */}
        {drag && (
          <div style={{
            position:'fixed', left:drag.x, top:drag.y,
            transform:'translate(-50%, -50%) scale(1.35)',
            zIndex:999, fontSize:'3rem',
            filter:'drop-shadow(0 8px 20px rgba(0,0,0,0.3))',
            pointerEvents:'none',
          }} aria-hidden="true">
            {drag.topping.emoji}
          </div>
        )}
      </div>
    </StepShell>
  )
}
