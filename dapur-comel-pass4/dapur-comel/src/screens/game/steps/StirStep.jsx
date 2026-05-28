/**
 * StirStep.jsx
 *
 * Handles: STIR, SPREAD_SAUCE
 * Gesture: circular motion on bowl/pizza base
 *
 * Reuses the proven circular gesture detector from MixStage (Phase 2).
 * Circles required: 2 (was 3) — faster, toddler-friendly.
 *
 * Interaction-complete: fires immediately when circles threshold met.
 *
 * Visual difference between STIR and SPREAD_SAUCE:
 *   STIR:        round bowl, contents change colour as mixed
 *   SPREAD_SAUCE: circular pizza base, red sauce spreads via CSS radial gradient
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { StepShell, SPRING } from './_shared.jsx'
import { hapticTap, hapticSuccess } from '../../../utils/haptics.js'
import { sfx } from '../../../utils/audio.js'
import { STEP } from '../../../utils/constants.js'

const CIRCLES_REQUIRED = 2

export function StirStep({ recipe, step, onComplete }) {
  const [progress,   setProgress]   = useState(0)
  const [isDone,     setIsDone]     = useState(false)
  const [isStirring, setIsStirring] = useState(false)
  const [spoonAngle, setSpoonAngle] = useState(0)

  const pointerRef    = useRef(null)
  const lastAngleRef  = useRef(null)
  const totalRotRef   = useRef(0)
  const completingRef = useRef(false)
  const halfSpoken    = useRef(false)
  const stirTimerRef  = useRef(null)
  const centerRef     = useRef({ x: 0, y: 0 })
  const targetRef     = useRef(null)

  useEffect(() => () => clearTimeout(stirTimerRef.current), [])

  const getAngle = useCallback((cx, cy) => {
    const dx = cx - centerRef.current.x
    const dy = cy - centerRef.current.y
    return Math.atan2(dy, dx) * (180 / Math.PI)
  }, [])

  const handlePointerDown = useCallback((e) => {
    if (isDone) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    pointerRef.current = e.pointerId
    const rect = targetRef.current?.getBoundingClientRect()
    if (rect) {
      centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    }
    lastAngleRef.current = getAngle(e.clientX, e.clientY)
    setIsStirring(true)
    hapticTap()
    sfx.play(step.sfx)
  }, [isDone, getAngle])

  const handlePointerMove = useCallback((e) => {
    if (pointerRef.current === null || isDone || completingRef.current) return
    e.preventDefault()

    const angle = getAngle(e.clientX, e.clientY)
    const last  = lastAngleRef.current
    if (last === null) { lastAngleRef.current = angle; return }

    let delta = angle - last
    if (delta >  180) delta -= 360
    if (delta < -180) delta += 360

    totalRotRef.current += Math.abs(delta)
    lastAngleRef.current = angle

    setSpoonAngle(prev => prev + delta * 1.2)

    const p = Math.min(totalRotRef.current / (CIRCLES_REQUIRED * 360), 1)
    setProgress(p)

    clearTimeout(stirTimerRef.current)
    stirTimerRef.current = setTimeout(() => setIsStirring(false), 300)

    if (p >= 1 && !completingRef.current) {
      completingRef.current = true
      hapticSuccess()
      setIsDone(true)
      setIsStirring(false)
      setTimeout(onComplete, 300)
    }
  }, [isDone, getAngle, onComplete])

  const handlePointerUp = useCallback(() => {
    pointerRef.current   = null
    lastAngleRef.current = null
    setIsStirring(false)
  }, [])

  const isSauce = step.type === STEP.SPREAD_SAUCE

  // Bowl/base colour shifts as progress increases
  const bgColor = isSauce
    ? `rgba(220,50,30,${0.05 + progress * 0.55})`
    : progress < 0.33 ? '#FFF8EC'
    : progress < 0.66 ? '#FFDBB8'
    : '#FFC88A'

  const SIZE = 200
  const RADIUS = 84
  const CIRC = 2 * Math.PI * RADIUS

  return (
    <StepShell step={step}>
      <div className="relative flex flex-col items-center gap-4">

        {/* Progress ring + target */}
        <div className="relative" style={{ width: SIZE + 20, height: SIZE + 20 }}>

          {/* SVG ring */}
          <svg width={SIZE + 20} height={SIZE + 20} className="absolute inset-0" aria-hidden="true">
            <circle cx={(SIZE+20)/2} cy={(SIZE+20)/2} r={RADIUS}
              fill="none" stroke="rgba(61,43,31,0.08)" strokeWidth="5" />
            <circle cx={(SIZE+20)/2} cy={(SIZE+20)/2} r={RADIUS}
              fill="none"
              stroke={isDone ? '#5EC4B6' : recipe.color ?? '#FF8C5A'}
              strokeWidth="5" strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - progress)}
              style={{ transformOrigin: 'center', transform: 'rotate(-90deg)', transition: 'stroke-dashoffset 80ms linear' }}
            />
          </svg>

          {/* Bowl / pizza base */}
          <div
            ref={targetRef}
            className="absolute rounded-full flex items-center justify-center overflow-hidden"
            style={{
              inset:       10,
              background:  isSauce
                ? `radial-gradient(circle, rgba(220,50,30,${0.08 + progress * 0.5}) 0%, ${bgColor} 70%)`
                : bgColor,
              boxShadow:   isStirring
                ? '0 4px 24px rgba(255,140,90,0.35), inset 0 2px 6px rgba(0,0,0,0.08)'
                : '0 6px 24px rgba(61,43,31,0.1), inset 0 2px 6px rgba(0,0,0,0.05)',
              transition:  'background 0.5s ease, box-shadow 0.25s ease',
              touchAction: 'none',
              cursor:      isDone ? 'default' : 'pointer',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            aria-label={isSauce ? 'Piza — sapukan sos' : 'Mangkuk — kacau'}
            role="application"
          >
            <span
              style={{
                fontSize:  '3rem',
                transform: `rotate(${spoonAngle}deg)`,
                transition: isStirring ? 'none' : 'transform 0.25s ease',
                userSelect: 'none',
              }}
              aria-hidden="true"
            >
              {isDone ? '✨' : isSauce ? '🥄' : '🥄'}
            </span>
          </div>
        </div>

        <p className="text-toddler-xs font-body font-700 text-ink-muted">
          {isDone ? 'Bagus!' : 'Pusing-pusing! 🔄'}
        </p>
      </div>
    </StepShell>
  )
}
