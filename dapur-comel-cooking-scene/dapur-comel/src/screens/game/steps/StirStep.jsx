/**
 * StirStep.jsx — Visual polish
 *
 * Batter/sauce colour transforms as child stirs.
 * Spoon leaves a visible trail arc via CSS box-shadow trick.
 * STIR:        warm cream bowl, batter goes golden
 * SPREAD_SAUCE: pizza base, red sauce radiates outward
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
  const [trailDots,  setTrailDots]  = useState([])   // recent spoon positions

  const pointerRef    = useRef(null)
  const lastAngleRef  = useRef(null)
  const totalRotRef   = useRef(0)
  const completingRef = useRef(false)
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
    if (rect) centerRef.current = { x: rect.left + rect.width/2, y: rect.top + rect.height/2 }
    lastAngleRef.current = getAngle(e.clientX, e.clientY)
    setIsStirring(true)
    hapticTap()
    sfx.play(step.sfx)
  }, [isDone, getAngle, step.sfx])

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

    // Trail dot
    const rect = targetRef.current?.getBoundingClientRect()
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setTrailDots(prev => [...prev.slice(-8), { x, y, id: Date.now() }])
    }

    clearTimeout(stirTimerRef.current)
    stirTimerRef.current = setTimeout(() => {
      setIsStirring(false)
      setTrailDots([])
    }, 300)

    if (p >= 1 && !completingRef.current) {
      completingRef.current = true
      hapticSuccess()
      setIsDone(true)
      setIsStirring(false)
      setTimeout(onComplete, 320)
    }
  }, [isDone, getAngle, onComplete])

  const handlePointerUp = useCallback(() => {
    pointerRef.current   = null
    lastAngleRef.current = null
    setIsStirring(false)
    setTrailDots([])
  }, [])

  const isSauce = step.type === STEP.SPREAD_SAUCE

  // Colour shift: cream → golden (STIR) or white → red (SPREAD_SAUCE)
  const bowlBg = isSauce
    ? `radial-gradient(circle at 50% 50%, rgba(220,50,30,${0.08 + progress * 0.55}) 0%, rgba(200,30,10,${progress * 0.35}) 70%, transparent 100%)`
    : progress < 0.33
      ? 'radial-gradient(circle at 40% 35%, #FFF8EC 0%, #F5E8C8 100%)'
      : progress < 0.66
        ? 'radial-gradient(circle at 40% 35%, #FFDDB0 0%, #F0C070 100%)'
        : 'radial-gradient(circle at 40% 35%, #FFB860 0%, #E09030 100%)'

  const SIZE = 200
  const RADIUS = 82
  const CIRC = 2 * Math.PI * RADIUS

  return (
    <StepShell step={step}>
      <div className="relative flex flex-col items-center gap-3">

        <div className="relative" style={{ width: SIZE + 20, height: SIZE + 20 }}>
          {/* Progress ring */}
          <svg width={SIZE+20} height={SIZE+20} className="absolute inset-0"
               style={{ pointerEvents:'none' }} aria-hidden="true">
            <circle cx={(SIZE+20)/2} cy={(SIZE+20)/2} r={RADIUS}
              fill="none" stroke="rgba(200,160,100,0.2)" strokeWidth="5" />
            <circle cx={(SIZE+20)/2} cy={(SIZE+20)/2} r={RADIUS}
              fill="none"
              stroke={isDone ? '#5EC4B6' : (recipe.color ?? '#FF8C5A')}
              strokeWidth="5" strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - progress)}
              style={{ transformOrigin:'center', transform:'rotate(-90deg)',
                       transition:'stroke-dashoffset 80ms linear' }}
            />
          </svg>

          {/* Bowl or pizza base */}
          <div
            ref={targetRef}
            className="absolute"
            style={{
              inset:        10,
              borderRadius: isSauce ? '50%' : '50% 50% 48% 48% / 28% 28% 72% 72%',
              background:   isSauce
                ? `radial-gradient(circle at 40% 35%, #FFE4A0 0%, #F0C060 55%, #D4A040 100%)`
                : 'linear-gradient(160deg, #FFF8EC 0%, #F0D8A8 60%, #E0C090 100%)',
              boxShadow:    isSauce
                ? 'inset 0 -8px 16px rgba(0,0,0,0.12), 0 8px 28px rgba(80,40,10,0.2)'
                : 'inset 0 10px 24px rgba(0,0,0,0.14), 0 8px 28px rgba(80,40,10,0.18)',
              overflow:     'hidden',
              touchAction:  'none',
              cursor:       isDone ? 'default' : 'pointer',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            aria-label={isSauce ? 'Sapukan sos' : 'Kacau adunan'}
            role="application"
          >
            {/* Colour fill layer */}
            <div style={{ position:'absolute', inset:0, background: bowlBg,
                          transition: isStirring ? 'none' : 'background 0.4s ease' }} />

            {/* Sauce spread ripples */}
            {isSauce && progress > 0.1 && (
              <div style={{
                position:'absolute', inset:0,
                background: `radial-gradient(circle at 50% 50%, rgba(200,30,10,${progress*0.25}) 0%, transparent ${50+progress*30}%)`,
                animation: isDone ? undefined : 'sauceSpread 0.4s ease-out',
              }} aria-hidden="true" />
            )}

            {/* Spoon trail dots */}
            {trailDots.map((d, i) => (
              <div key={d.id} style={{
                position:'absolute',
                left:`${d.x}%`, top:`${d.y}%`,
                width: 8, height: 8,
                borderRadius:'50%',
                background: isSauce
                  ? `rgba(180,20,0,${0.15 + (i/trailDots.length)*0.35})`
                  : `rgba(255,160,40,${0.15 + (i/trailDots.length)*0.4})`,
                transform:'translate(-50%,-50%)',
                pointerEvents:'none',
              }} aria-hidden="true" />
            ))}

            {/* Spoon */}
            <div style={{
              position:'absolute', inset:0,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <span style={{
                fontSize: '2.8rem',
                transform: `rotate(${spoonAngle}deg)`,
                transition: isStirring ? 'none' : 'transform 0.25s ease',
                display:'block', userSelect:'none', lineHeight:1,
              }} aria-hidden="true">
                {isDone ? '✨' : '🥄'}
              </span>
            </div>
          </div>
        </div>

        <p className="font-display font-900 text-center"
           style={{ fontSize:'0.95rem', color: isDone ? '#5EC4B6' : 'rgba(61,43,31,0.5)' }}>
          {isDone ? 'Wah, dah sebati! 🎉' : 'Pusing-pusing! 🔄'}
        </p>
      </div>
    </StepShell>
  )
}
