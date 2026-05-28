/**
 * DecorateStage.jsx — Phase 3 hardened
 *
 * ── Fixes applied ─────────────────────────────────────────────────────────
 *   FIX 1: onPointerMove/onPointerUp only attached when drag is active.
 *          Previous version attached them unconditionally to the outer div —
 *          fired on every mouse movement even during idle. Now uses
 *          conditional event props so handlers are null when not dragging.
 *
 *   FIX 2: drag state cleared on unmount — prevents stale drag ref if
 *          stage transitions while finger is still on screen.
 *
 *   FIX 3: completingRef guard prevents double-complete if child rapidly
 *          drops last topping and something else fires onComplete again.
 *
 *   FIX 4: dropRadiusPx uses actual measured cake rect (re-measured on
 *          every drag end) rather than cached at mount.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useVoiceContext } from '../../../App.jsx'
import { hapticDrop, hapticTap } from '../../../utils/haptics.js'
import { getDecorateConfig } from '../../../engine/recipeRunner.js'
import { LEVEL } from '../../../utils/constants.js'

const PRAISE = ['Cantiknya! 🎨', 'Bagus! Lagi!', 'Oyen suka!', 'Pandai!', 'Hebat!']

export function DecorateStage({ recipe, stageConfig, level = LEVEL.ONE, onComplete }) {
  const { speak, speakText } = useVoiceContext()

  const { toppings, dropRadiusPx } = useMemo(
    () => getDecorateConfig(recipe, stageConfig, level),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const [placedIds,    setPlacedIds]    = useState([])
  const [drag,         setDrag]         = useState(null)
  const [cakeGlow,     setCakeGlow]     = useState(false)
  const [stageVisible, setStageVisible] = useState(false)

  const cakeRef       = useRef(null)
  const completingRef = useRef(false)
  const dragRef       = useRef(null)   // FIX 2: mirror drag in ref for cleanup

  // Keep dragRef in sync
  useEffect(() => { dragRef.current = drag }, [drag])

  // Mount
  useEffect(() => {
    const t = setTimeout(() => setStageVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  // FIX 2: clear drag on unmount
  useEffect(() => () => {
    setDrag(null)
    dragRef.current = null
    setCakeGlow(false)
  }, [])

  // Intro narration
  useEffect(() => {
    const t = setTimeout(() => speak('decorate.intro'), 400)
    return () => clearTimeout(t)
  }, [speak])

  // FIX 4: re-measure cake centre on every evaluation
  const isOverCake = useCallback((clientX, clientY) => {
    const el = cakeRef.current
    if (!el) return false
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width  / 2
    const cy = rect.top  + rect.height / 2
    const dx = clientX - cx
    const dy = clientY - cy
    return Math.sqrt(dx * dx + dy * dy) <= dropRadiusPx
  }, [dropRadiusPx])

  const handleDragStart = useCallback((e, topping) => {
    if (placedIds.includes(topping.id) || completingRef.current) return
    hapticTap()
    speakText(topping.dropLabel ?? `Letak ${topping.name}!`)
    const newDrag = { id: topping.id, topping, x: e.clientX, y: e.clientY }
    setDrag(newDrag)
    dragRef.current = newDrag
  }, [placedIds, speakText])

  // FIX 1: move/end only fire when drag is active (conditional attachment below)
  const handleDragMove = useCallback((e) => {
    if (!dragRef.current) return
    e.preventDefault()
    const next = { ...dragRef.current, x: e.clientX, y: e.clientY }
    setDrag(next)
    dragRef.current = next
    setCakeGlow(isOverCake(e.clientX, e.clientY))
  }, [isOverCake])

  const handleDragEnd = useCallback((e) => {
    const d = dragRef.current
    if (!d) return
    setCakeGlow(false)
    const onCake = isOverCake(d.x, d.y)
    setDrag(null)
    dragRef.current = null

    if (onCake && !placedIds.includes(d.id) && !completingRef.current) {
      hapticDrop()
      const next = [...placedIds, d.id]
      setPlacedIds(next)
      speakText(PRAISE[(next.length - 1) % PRAISE.length])
      if (next.length >= toppings.length) {
        completingRef.current = true
        setTimeout(() => { speak('decorate.done'); setTimeout(onComplete, 1500) }, 500)
      }
    }
  }, [placedIds, toppings.length, isOverCake, speak, speakText, onComplete])

  const remaining = toppings.filter(t => !placedIds.includes(t.id))
  const allPlaced = placedIds.length >= toppings.length

  // FIX 1: conditional event handlers
  const dragHandlers = drag ? {
    onPointerMove:   handleDragMove,
    onPointerUp:     handleDragEnd,
    onPointerCancel: handleDragEnd,
  } : {}

  return (
    <div
      className="flex flex-col items-center w-full h-full px-5 pt-4 pb-5 gap-4 select-none"
      style={{ opacity: stageVisible ? 1 : 0, transition: 'opacity 0.3s ease', touchAction: 'none' }}
      {...dragHandlers}
    >
      {/* Instruction */}
      <div className="w-full bg-white rounded-[1.25rem] px-4 py-3 text-center
                      shadow-[0_2px_12px_rgba(61,43,31,0.08)]">
        <p className="text-toddler-md font-display font-900 text-ink">
          {allPlaced ? 'Cantiknya kek kita! 🎉' : 'Hias kek! Seret hiasan ke atas kek!'}
        </p>
      </div>

      {/* Cake drop zone */}
      <div className="relative flex-1 flex items-center justify-center">
        <div
          ref={cakeRef}
          className="relative flex flex-col items-center justify-center rounded-full"
          style={{
            width:      200,
            height:     200,
            background: 'linear-gradient(135deg, #FFD6E0 0%, #FFAABB 100%)',
            boxShadow:  cakeGlow
              ? '0 0 0 6px #FFB347, 0 0 40px rgba(255,140,90,0.5), 0 8px 32px rgba(0,0,0,0.15)'
              : '0 8px 32px rgba(0,0,0,0.12)',
            transition: 'box-shadow 0.2s ease',
          }}
          aria-label="Kek — letakkan hiasan di sini"
        >
          <span className="text-6xl leading-none" aria-hidden="true">🎂</span>
          {placedIds.length > 0 && (
            <div className="flex gap-2 mt-2" aria-live="polite">
              {placedIds.map(id => {
                const t = toppings.find(tp => tp.id === id)
                return <span key={id} className="text-2xl" style={{ animation: 'decPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }} aria-label={t?.name}>{t?.emoji}</span>
              })}
            </div>
          )}
          {drag && !allPlaced && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                border: cakeGlow ? '3px dashed rgba(255,140,90,0.8)' : '3px dashed rgba(255,140,90,0.3)',
                transition: 'border 0.2s ease',
              }}
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {/* Palette */}
      {remaining.length > 0 && (
        <div className="flex gap-4 justify-center flex-wrap pb-1">
          {remaining.map(topping => (
            <div
              key={topping.id}
              className="flex flex-col items-center gap-2 rounded-[1.25rem]"
              style={{
                width:           90,
                height:          90,
                backgroundColor: topping.bg ?? '#FFF8EC',
                boxShadow:       '0 3px 12px rgba(61,43,31,0.1)',
                touchAction:     'none',
                cursor:          'grab',
                opacity:         drag?.id === topping.id ? 0.35 : 1,
                transition:      'opacity 0.15s ease',
              }}
              onPointerDown={(e) => {
                if (!e.isPrimary) return
                e.currentTarget.setPointerCapture(e.pointerId)
                handleDragStart(e, topping)
              }}
              aria-label={topping.name}
              role="button"
            >
              <span className="text-4xl leading-none select-none" aria-hidden="true">{topping.emoji}</span>
              <span className="text-[0.7rem] font-display font-800 text-ink-soft leading-tight text-center">{topping.name}</span>
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
            transform: 'translate(-50%, -50%) scale(1.25)',
            zIndex:     999,
            fontSize:  '3.5rem',
            filter:    'drop-shadow(0 8px 20px rgba(61,43,31,0.3))',
          }}
          aria-hidden="true"
        >
          {drag.topping.emoji}
        </div>
      )}

      <style>{`
        @keyframes decPopIn {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
