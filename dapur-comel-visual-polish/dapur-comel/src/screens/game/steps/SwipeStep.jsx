/**
 * SwipeStep.jsx — Visual polish
 *
 * FLIP: pancake/burger shows golden-brown underside on flip.
 *       Flies off with rotateX + translateY, new side lands with squash.
 * SLICE: pizza clip-path separates into visible wedge sections on each swipe.
 */

import { useState, useRef, useCallback } from 'react'
import { StepShell, SPRING, useWrongTap, SteamPuff } from './_shared.jsx'
import { hapticTap, hapticSuccess, hapticDrop, hapticFlip } from '../../../utils/haptics.js'
import { sfx } from '../../../utils/audio.js'
import { STEP } from '../../../utils/constants.js'

const SWIPE_THRESHOLD = 55

export function SwipeStep({ recipe, step, onComplete }) {
  const isFlip  = step.type === STEP.FLIP
  const isSlice = step.type === STEP.SLICE
  const totalSlices = step.sliceCount ?? 3

  const [slicesDone,  setSlicesDone]  = useState(0)
  const [flipped,     setFlipped]     = useState(false)
  const [flipAnim,    setFlipAnim]    = useState(false)
  const [showLanded,  setShowLanded]  = useState(false)  // after flip lands
  const [sliceAngles, setSliceAngles] = useState([])     // degrees per cut
  const [dragging,    setDragging]    = useState(false)

  const { shaking, triggerWrong } = useWrongTap()
  const pointerRef    = useRef(null)
  const startRef      = useRef({ x: 0, y: 0 })
  const completingRef = useRef(false)

  const handlePointerDown = useCallback((e) => {
    if (completingRef.current) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    pointerRef.current = e.pointerId
    startRef.current   = { x: e.clientX, y: e.clientY }
    setDragging(true)
    hapticTap()
  }, [])

  const handlePointerUp = useCallback((e) => {
    if (pointerRef.current === null || completingRef.current) return
    pointerRef.current = null
    setDragging(false)

    const dx   = e.clientX - startRef.current.x
    const dy   = e.clientY - startRef.current.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < SWIPE_THRESHOLD) { triggerWrong(); return }

    if (isFlip) {
      hapticFlip()
      sfx.play(step.sfx)
      setFlipAnim(true)
      completingRef.current = true
      setTimeout(() => {
        setFlipped(true)
        setShowLanded(true)
        setFlipAnim(false)
        hapticDrop()
        setTimeout(onComplete, 350)
      }, 420)

    } else if (isSlice) {
      // Compute angle of the swipe for visual cut line
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)
      hapticDrop()
      sfx.play(step.sfx)
      const next = slicesDone + 1
      setSlicesDone(next)
      setSliceAngles(prev => [...prev, angle])

      if (next >= totalSlices && !completingRef.current) {
        completingRef.current = true
        hapticSuccess()
        setTimeout(onComplete, 380)
      }
    }
  }, [isFlip, isSlice, slicesDone, totalSlices, step.sfx, triggerWrong, onComplete])

  // ── FLIP ────────────────────────────────────────────────────────────────────
  if (isFlip) {
    // Golden-brown gradient for the cooked side
    const cookedGrad = 'radial-gradient(circle at 45% 40%, #FFD080 0%, #C87820 55%, #A05010 100%)'
    const rawGrad    = 'radial-gradient(circle at 45% 40%, #FFF8E0 0%, #F0D880 55%, #D0A840 100%)'

    return (
      <StepShell step={step}>
        <div className="relative flex flex-col items-center gap-4">
          <SteamPuff active={showLanded} count={4} />

          <div
            className="relative flex items-center justify-center rounded-[1.75rem]"
            style={{
              width:       200, height: 180,
              background:  flipped ? cookedGrad : rawGrad,
              boxShadow:   '0 8px 28px rgba(80,40,10,0.22), inset 0 2px 4px rgba(255,255,255,0.4)',
              border:      '3px solid rgba(200,140,40,0.4)',
              touchAction: 'none',
              cursor:      flipped ? 'default' : 'grab',
              animation:   flipAnim ? `flipTumble 0.42s ease-in-out` : undefined,
              transform:   dragging && !flipAnim ? 'scale(0.97)' : showLanded ? 'scaleX(1.08) scaleY(0.92)' : 'scale(1)',
              transition:  flipAnim ? 'none' : `transform 0.2s ${SPRING}`,
            }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => { pointerRef.current = null; setDragging(false) }}
            aria-label={step.label}
          >
            <span style={{ fontSize: '5rem', lineHeight: 1, userSelect:'none',
                           filter: flipped ? 'brightness(0.85)' : 'none' }}
                  aria-hidden="true">
              {step.emoji}
            </span>

            {/* Bubbles on raw side */}
            {!flipped && [0,1,2].map(i => (
              <div key={i} style={{
                position:'absolute',
                width: 10, height: 10,
                borderRadius:'50%',
                background:'rgba(220,160,40,0.7)',
                top: `${25+i*20}%`,
                left:`${20+i*25}%`,
                animation:`brownPulse ${1+i*0.3}s ${i*0.2}s ease-in-out infinite`,
              }} aria-hidden="true" />
            ))}

            {/* Grill marks on cooked side */}
            {flipped && (
              <svg style={{ position:'absolute', inset:0, pointerEvents:'none', borderRadius:'inherit', overflow:'hidden' }}
                   width="100%" height="100%" aria-hidden="true">
                {[30,55,80].map(y => (
                  <line key={y} x1="10%" y1={`${y}%`} x2="90%" y2={`${y-8}%`}
                    stroke="rgba(80,30,0,0.25)" strokeWidth="3" strokeLinecap="round" />
                ))}
              </svg>
            )}
          </div>

          {!flipped && (
            <p className="font-display font-900"
               style={{ fontSize:'0.95rem', color:'rgba(61,43,31,0.5)' }}>
              Leret ke atas! ↑
            </p>
          )}
          {showLanded && (
            <p className="font-display font-900"
               style={{ fontSize:'1rem', color:'#FF8C5A',
                        animation:`yolkFall 0.35s ${SPRING} both` }}>
              Terbalik! 🎉
            </p>
          )}
        </div>

        <style>{`
          @keyframes yolkFall { from{transform:translateY(-12px);opacity:0} to{transform:translateY(0);opacity:1} }
        `}</style>
      </StepShell>
    )
  }

  // ── SLICE ────────────────────────────────────────────────────────────────────
  return (
    <StepShell step={step}>
      <div className="relative flex flex-col items-center gap-4">
        {/* Progress pips */}
        <div className="flex gap-2">
          {Array.from({ length: totalSlices }, (_, i) => (
            <div key={i} className="rounded-full transition-all duration-200"
                 style={{ width: i < slicesDone ? 28 : 20,
                          height: i < slicesDone ? 28 : 20,
                          background: i < slicesDone
                            ? `linear-gradient(135deg, ${recipe.color ?? '#FF6B35'}, #FFB347)`
                            : 'rgba(200,160,100,0.3)' }}
                 aria-hidden="true" />
          ))}
        </div>

        {/* Pizza */}
        <div
          className="relative flex items-center justify-center cooking-pizza-base"
          style={{
            width: 200, height: 200,
            touchAction: 'none',
            cursor: completingRef.current ? 'default' : 'crosshair',
            animation: shaking ? 'gentleWiggle 0.35s ease' : undefined,
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => { pointerRef.current = null; setDragging(false) }}
          aria-label={step.label}
        >
          <span style={{ fontSize:'4.5rem', lineHeight:1 }} aria-hidden="true">
            {step.emoji}
          </span>

          {/* Cut lines as SVG */}
          <svg style={{ position:'absolute', inset:0, pointerEvents:'none', borderRadius:'50%', overflow:'hidden' }}
               viewBox="0 0 200 200" width="200" height="200" aria-hidden="true">
            {sliceAngles.map((angle, i) => {
              const rad = angle * Math.PI / 180
              return (
                <line key={i}
                  x1={100 - Math.cos(rad) * 95} y1={100 - Math.sin(rad) * 95}
                  x2={100 + Math.cos(rad) * 95} y2={100 + Math.sin(rad) * 95}
                  stroke="rgba(255,255,255,0.9)" strokeWidth="3" strokeLinecap="round"
                  style={{ animation: `sliceAppear 0.22s ease-out` }}
                />
              )
            })}
          </svg>
        </div>

        <p className="font-display font-900"
           style={{ fontSize:'0.95rem', color: completingRef.current ? recipe.color : 'rgba(61,43,31,0.5)' }}>
          {completingRef.current ? 'Siap dipotong! 🎉' : `Leret potong! Lagi ${totalSlices - slicesDone}×`}
        </p>
      </div>

      <style>{`
        @keyframes sliceAppear { from{opacity:0;stroke-dashoffset:200;stroke-dasharray:200} to{opacity:1;stroke-dashoffset:0} }
        @keyframes gentleWiggle { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-4deg)} 75%{transform:rotate(4deg)} }
      `}</style>
    </StepShell>
  )
}
