/**
 * FeedOyenStep.jsx — Pass 4: full payoff polish
 *
 * Feeding Oyen is the emotional climax of every recipe.
 *
 * On successful feed:
 *   1. Munch SFX + happy chirp
 *   2. Haptic feed pattern
 *   3. Food emoji shrinks into Oyen (CSS scale 0)
 *   4. Oyen squash/stretch bounce
 *   5. Three hearts float upward (staggered)
 *   6. Oyen expression: PROUD
 *   7. "Nyam nyam! 😋" text pops in
 *   8. onComplete after 800ms
 *
 * Drag approach:
 *   Proximity detection as before.
 *   EXCITED expression at 130px, PROUD at 60px contact zone.
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { StepShell, SPRING } from './_shared.jsx'
import { Oyen } from '../../../components/mascot/Oyen.jsx'
import { hapticTap } from '../../../utils/haptics.js'
import { hapticFeed } from '../../../utils/haptics.js'
import { sfx } from '../../../utils/audio.js'
import { OYEN_EXPRESSION } from '../../../utils/constants.js'

const CONTACT_RADIUS = 70
const EXCITED_RADIUS = 130

export function FeedOyenStep({ recipe, step, onComplete }) {
  const [drag,       setDrag]       = useState(null)
  const [oyenExpr,   setOyenExpr]   = useState(OYEN_EXPRESSION.HAPPY)
  const [fed,        setFed]        = useState(false)
  const [showHearts, setShowHearts] = useState(false)
  const [munchAnim,  setMunchAnim]  = useState(false)
  const [foodScale,  setFoodScale]  = useState(1)

  const oyenRef       = useRef(null)
  const dragRef       = useRef(null)
  const completingRef = useRef(false)

  useEffect(() => { dragRef.current = drag }, [drag])
  useEffect(() => () => { setDrag(null) }, [])

  const getDistToOyen = useCallback((x, y) => {
    const el = oyenRef.current
    if (!el) return 999
    const rect = el.getBoundingClientRect()
    const cx   = rect.left + rect.width  / 2
    const cy   = rect.top  + rect.height / 2
    return Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
  }, [])

  const handleDragStart = useCallback((e) => {
    if (fed || completingRef.current) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    hapticTap()
    const d = { x: e.clientX, y: e.clientY }
    setDrag(d); dragRef.current = d
  }, [fed])

  const handleMove = useCallback((e) => {
    if (!dragRef.current || completingRef.current) return
    e.preventDefault()
    const next = { x: e.clientX, y: e.clientY }
    setDrag(next); dragRef.current = next

    const dist = getDistToOyen(e.clientX, e.clientY)
    setOyenExpr(dist < CONTACT_RADIUS ? OYEN_EXPRESSION.EXCITED
              : dist < EXCITED_RADIUS ? OYEN_EXPRESSION.HAPPY
              : OYEN_EXPRESSION.HAPPY)
  }, [getDistToOyen])

  const handleEnd = useCallback((e) => {
    const d = dragRef.current
    if (!d || completingRef.current) return
    setDrag(null); dragRef.current = null

    if (getDistToOyen(d.x, d.y) < CONTACT_RADIUS + 20) {
      completingRef.current = true

      // 1. Immediate sensory feedback
      hapticFeed()
      sfx.play('munch')
      setTimeout(() => sfx.play('happy_chirp'), 220)

      // 2. Food shrinks into Oyen
      setFoodScale(0)

      // 3. Oyen squash/stretch + expression
      setMunchAnim(true)
      setOyenExpr(OYEN_EXPRESSION.PROUD)
      setTimeout(() => setMunchAnim(false), 700)

      // 4. Hearts float up
      setFed(true)
      setTimeout(() => setShowHearts(true), 100)

      // 5. Advance
      setTimeout(onComplete, 850)
    } else {
      setOyenExpr(OYEN_EXPRESSION.HAPPY)
    }
  }, [getDistToOyen, onComplete])

  return (
    <StepShell step={step}>
      <div
        className="relative flex flex-col items-center gap-4 w-full select-none"
        style={{ touchAction: 'none' }}
        onPointerMove={drag ? handleMove : undefined}
        onPointerUp={drag   ? handleEnd  : undefined}
        onPointerCancel={drag ? handleEnd : undefined}
      >

        {/* Oyen — hero size, reacts to proximity */}
        <div
          ref={oyenRef}
          style={{
            animation: munchAnim ? `oyenSquash 0.45s cubic-bezier(0.34,1.56,0.64,1) both` : undefined,
          }}
        >
          <Oyen expression={oyenExpr} size="lg" isSpeaking={false} />
        </div>

        {/* Floating hearts */}
        {showHearts && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center"
               aria-hidden="true">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="absolute"
                style={{
                  fontSize: i === 1 ? '2rem' : '1.4rem',
                  left:     `calc(50% + ${(i - 1) * 28}px)`,
                  top:      '30%',
                  animation: `heartFloat 0.9s ${i * 0.15}s ease-out forwards`,
                  opacity:   0,
                }}
              >
                ❤️
              </span>
            ))}
          </div>
        )}

        {/* "Nyam nyam!" text */}
        {fed && (
          <p
            className="text-toddler-lg font-display font-900"
            style={{
              color:     recipe.color ?? '#FF8C5A',
              animation: `toppingPop 0.4s ${SPRING} both`,
            }}
          >
            Nyam nyam! 😋
          </p>
        )}

        {/* Food draggable */}
        {!fed && (
          <>
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width:       110,
                height:      110,
                background:  `linear-gradient(135deg, ${recipe.color ?? '#FF8C5A'}22, ${recipe.color ?? '#FF8C5A'}44)`,
                boxShadow:   '0 4px 20px rgba(61,43,31,0.12)',
                cursor:      'grab',
                touchAction: 'none',
                opacity:     drag ? 0.3 : 1,
                transform:   `scale(${foodScale})`,
                transition:  foodScale === 0 ? 'transform 0.25s ease-in' : 'opacity 0.1s ease',
              }}
              onPointerDown={handleDragStart}
              aria-label={`Bagi Oyen makan ${recipe.emoji}`}
              role="button"
            >
              <span style={{ fontSize: '3rem', lineHeight: 1 }} aria-hidden="true">
                {recipe.emoji}
              </span>
            </div>

            {!drag && (
              <p className="text-toddler-xs font-body font-700 text-ink-muted">
                Seret ke Oyen! ☝️
              </p>
            )}
          </>
        )}

        {/* Drag ghost */}
        {drag && (
          <div
            className="pointer-events-none"
            style={{
              position: 'fixed', left: drag.x, top: drag.y,
              transform: 'translate(-50%, -50%) scale(1.3)',
              zIndex: 999, fontSize: '3rem',
              filter: 'drop-shadow(0 6px 16px rgba(61,43,31,0.25))',
            }}
            aria-hidden="true"
          >
            {recipe.emoji}
          </div>
        )}
      </div>

      <style>{`
        @keyframes heartFloat {
          0%   { opacity: 0; transform: translateY(0) scale(0.5); }
          30%  { opacity: 1; transform: translateY(-20px) scale(1.2); }
          100% { opacity: 0; transform: translateY(-70px) scale(0.8); }
        }
        @keyframes toppingPop {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes oyenSquash {
          0%   { transform: scaleX(1.25) scaleY(0.75); }
          40%  { transform: scaleX(0.88) scaleY(1.18); }
          70%  { transform: scaleX(1.05) scaleY(0.97); }
          100% { transform: scaleX(1) scaleY(1); }
        }
      `}</style>
    </StepShell>
  )
}
