/**
 * FeedOyenStep.jsx — Visual polish
 *
 * Biggest payoff moment of each recipe.
 * Food shrinks into Oyen on contact.
 * Oyen squash/stretch + PROUD expression.
 * 5 hearts float up in a fan formation.
 * Sparkle burst + munch sound + happy chirp.
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { StepShell, SPRING } from './_shared.jsx'
import { Oyen } from '../../../components/mascot/Oyen.jsx'
import { hapticTap, hapticFeed } from '../../../utils/haptics.js'
import { sfx } from '../../../utils/audio.js'
import { OYEN_EXPRESSION } from '../../../utils/constants.js'

const CONTACT_RADIUS  = 75
const EXCITED_RADIUS  = 140

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
    return Math.sqrt((x - (rect.left + rect.width/2))**2 + (y - (rect.top + rect.height/2))**2)
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
    if (getDistToOyen(d.x, d.y) < CONTACT_RADIUS + 25) {
      completingRef.current = true
      hapticFeed()
      sfx.play('munch')
      setTimeout(() => sfx.play('happy_chirp'), 220)
      setFoodScale(0)
      setMunchAnim(true)
      setOyenExpr(OYEN_EXPRESSION.PROUD)
      setTimeout(() => setMunchAnim(false), 700)
      setFed(true)
      setTimeout(() => setShowHearts(true), 80)
      setTimeout(onComplete, 820)
    } else {
      setOyenExpr(OYEN_EXPRESSION.HAPPY)
    }
  }, [getDistToOyen, onComplete])

  return (
    <StepShell step={step}>
      <div
        className="relative flex flex-col items-center gap-4 w-full select-none"
        style={{ touchAction:'none' }}
        onPointerMove={drag ? handleMove : undefined}
        onPointerUp={drag ? handleEnd : undefined}
        onPointerCancel={drag ? handleEnd : undefined}
      >
        {/* Oyen — hero */}
        <div
          ref={oyenRef}
          style={{ animation: munchAnim ? `oyenSquash 0.45s ${SPRING} both` : undefined }}
        >
          <Oyen expression={oyenExpr} size="lg" isSpeaking={false} />
        </div>

        {/* Floating hearts — fan formation */}
        {showHearts && (
          <div className="absolute pointer-events-none"
               style={{ top:'20%', left:'50%', transform:'translateX(-50%)' }}
               aria-hidden="true">
            {[
              { x:-40, delay:0,    size:'1.8rem' },
              { x:-18, delay:0.08, size:'1.4rem' },
              { x:4,   delay:0.04, size:'2rem'   },
              { x:26,  delay:0.1,  size:'1.4rem' },
              { x:48,  delay:0.02, size:'1.6rem' },
            ].map((h, i) => (
              <span key={i} style={{
                position:'absolute',
                left: h.x,
                fontSize: h.size,
                animation: `heartFloat 1s ${h.delay}s ease-out forwards`,
                opacity: 0,
              }}>❤️</span>
            ))}
          </div>
        )}

        {/* "Nyam nyam!" */}
        {fed && (
          <div style={{
            background:  'rgba(255,255,255,0.92)',
            borderRadius: 999,
            padding:     '8px 24px',
            boxShadow:   '0 4px 16px rgba(80,40,10,0.12)',
            animation:   `toppingSnap 0.4s ${SPRING} both`,
          }}>
            <p className="font-display font-900"
               style={{ fontSize:'1.4rem', color: recipe.color ?? '#FF8C5A' }}>
              Nyam nyam! 😋
            </p>
          </div>
        )}

        {/* Food draggable */}
        {!fed && (
          <>
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width:       120, height: 120,
                background:  `radial-gradient(circle at 40% 35%, ${recipe.color ?? '#FF8C5A'}33, ${recipe.color ?? '#FF8C5A'}66)`,
                boxShadow:   `0 6px 24px ${recipe.color ?? '#FF8C5A'}44`,
                border:      `3px solid ${recipe.color ?? '#FF8C5A'}55`,
                cursor:      'grab',
                touchAction: 'none',
                opacity:     drag ? 0.3 : 1,
                transform:   `scale(${foodScale})`,
                transition:  foodScale === 0 ? `transform 0.22s ease-in` : 'opacity 0.1s ease',
              }}
              onPointerDown={handleDragStart}
              aria-label={`Bagi Oyen makan ${recipe.emoji}`}
              role="button"
            >
              <span style={{ fontSize:'3.2rem', lineHeight:1,
                             filter:'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
                    aria-hidden="true">
                {recipe.emoji}
              </span>
            </div>
            {!drag && (
              <p className="font-display font-900"
                 style={{ fontSize:'0.95rem', color:'rgba(61,43,31,0.5)' }}>
                Seret ke Oyen! ☝️
              </p>
            )}
          </>
        )}

        {/* Drag ghost */}
        {drag && (
          <div style={{
            position:'fixed', left:drag.x, top:drag.y,
            transform:'translate(-50%, -50%) scale(1.4)',
            zIndex:999, fontSize:'3.2rem',
            filter:'drop-shadow(0 8px 24px rgba(0,0,0,0.3))',
            pointerEvents:'none',
          }} aria-hidden="true">
            {recipe.emoji}
          </div>
        )}
      </div>

      <style>{`
        @keyframes oyenSquash {
          0%  { transform: scaleX(1.3) scaleY(0.72); }
          45% { transform: scaleX(0.87) scaleY(1.2); }
          72% { transform: scaleX(1.04) scaleY(0.97); }
          100%{ transform: scaleX(1) scaleY(1); }
        }
        @keyframes toppingSnap {
          0%  { transform: scale(0) rotate(-10deg); opacity:0; }
          65% { transform: scale(1.2) rotate(3deg); opacity:1; }
          100%{ transform: scale(1) rotate(0deg);  opacity:1; }
        }
      `}</style>
    </StepShell>
  )
}
