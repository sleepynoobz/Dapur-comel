/**
 * PressStep.jsx — Visual polish
 *
 * Dough has a textured radial gradient (flour dusting effect).
 * Flour dust particles scatter outward as dough expands.
 * Dough expands with squash/stretch — squashes first, then rounds out.
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { StepShell, SPRING, BurstParticles } from './_shared.jsx'
import { hapticTap, hapticSuccess } from '../../../utils/haptics.js'
import { sfx } from '../../../utils/audio.js'

const HOLD_MS = 700

export function PressStep({ recipe, step, onComplete }) {
  const [holding,   setHolding]   = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [done,      setDone]      = useState(false)
  const [particles, setParticles] = useState([])

  const holdTimerRef  = useRef(null)
  const tickRef       = useRef(null)
  const startRef      = useRef(0)
  const completingRef = useRef(false)

  useEffect(() => () => {
    clearTimeout(holdTimerRef.current)
    clearInterval(tickRef.current)
  }, [])

  const startHold = useCallback((e) => {
    if (done || completingRef.current) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    hapticTap()
    sfx.play(step.sfx)
    startRef.current = Date.now()
    setHolding(true)

    // Flour dust particles
    setParticles(['🌾','✨','🌾','✨','🌾'].map((em, i) => ({
      id: Date.now() + i, emoji: em,
      x: (Math.random() - 0.5) * 160,
      y: -(Math.random() * 60 + 20),
      size: '1rem',
    })))
    setTimeout(() => setParticles([]), 700)

    tickRef.current = setInterval(() => {
      setProgress(Math.min((Date.now() - startRef.current) / HOLD_MS, 1))
    }, 30)

    holdTimerRef.current = setTimeout(() => {
      clearInterval(tickRef.current)
      completingRef.current = true
      hapticSuccess()
      setDone(true)
      setHolding(false)
      setProgress(1)
      setTimeout(onComplete, 320)
    }, HOLD_MS)
  }, [done, step.sfx, onComplete])

  const cancelHold = useCallback(() => {
    if (completingRef.current) return
    clearTimeout(holdTimerRef.current)
    clearInterval(tickRef.current)
    setHolding(false)
    setProgress(0)
    setParticles([])
  }, [])

  // Dough dimensions: squash horizontal, then expand evenly
  const size    = 90 + progress * 110        // 90→200px
  const scaleX  = 1 + progress * 0.18        // widens as pressed
  const scaleY  = 1 - progress * 0.12        // flattens slightly

  // Dough texture: radial gradient simulates flour dusting
  const doughBg = done
    ? 'radial-gradient(circle at 40% 35%, #FFFFF0 0%, #F5F0DC 40%, #EBE0C0 70%, #D8C890 100%)'
    : holding
      ? 'radial-gradient(circle at 40% 35%, #FFFEF8 0%, #F8F0D8 40%, #F0E0B0 70%, #E0D090 100%)'
      : 'radial-gradient(circle at 40% 35%, #FFFFF5 0%, #FDFAEE 40%, #F5EFD0 70%, #EDE0A8 100%)'

  const RADIUS = 16
  const CIRC   = 2 * Math.PI * RADIUS

  return (
    <StepShell step={step}>
      <div className="relative flex flex-col items-center gap-4">

        {/* Hold progress ring */}
        {holding && !done && (
          <svg width="44" height="44" style={{ position:'absolute', top:8, right:16 }}
               aria-hidden="true">
            <circle cx="22" cy="22" r={RADIUS} fill="none"
              stroke="rgba(200,160,100,0.2)" strokeWidth="4" />
            <circle cx="22" cy="22" r={RADIUS} fill="none"
              stroke={recipe.color ?? '#FF8C5A'} strokeWidth="4" strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - progress)}
              style={{ transformOrigin:'center', transform:'rotate(-90deg)',
                       transition:'stroke-dashoffset 30ms linear' }}
            />
          </svg>
        )}

        {/* Dough */}
        <div className="relative flex items-center justify-center" style={{ height: 240 }}>
          <button
            type="button"
            className="relative flex items-center justify-center rounded-full outline-none"
            style={{
              width:       size, height: size * scaleY / scaleX * 0.85,
              background:  doughBg,
              boxShadow:   done
                ? `0 0 0 ${Math.round(progress * 10)}px rgba(245,222,179,0.3), 0 8px 32px rgba(80,40,10,0.15)`
                : holding
                  ? `0 0 0 ${Math.round(progress * 12)}px rgba(245,222,179,0.35), 0 4px 20px rgba(80,40,10,0.12)`
                  : '0 6px 24px rgba(80,40,10,0.15)',
              transform:   `scaleX(${scaleX}) scaleY(${scaleY})`,
              transition:  holding ? `width 0.06s ease, height 0.06s ease, box-shadow 0.1s ease`
                                   : `all 0.35s ${SPRING}`,
              touchAction: 'none',
              cursor:      done ? 'default' : 'pointer',
              border:      '2px solid rgba(220,190,120,0.35)',
            }}
            onPointerDown={startHold}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            onPointerCancel={cancelHold}
            aria-label={step.label}
          >
            {/* Flour texture spots */}
            {[0,1,2,3].map(i => (
              <div key={i} style={{
                position:'absolute',
                width:  8+i*4, height: 8+i*4,
                borderRadius:'50%',
                background:'rgba(255,255,255,0.5)',
                top:  `${20+i*18}%`,
                left: `${15+i*20}%`,
                opacity: done ? 0.6 : 0.4,
              }} aria-hidden="true" />
            ))}

            <span style={{
              fontSize: `${1.8 + progress * 1.5}rem`,
              lineHeight:1,
              userSelect:'none',
              opacity: done ? 0.8 : 1,
            }} aria-hidden="true">
              {done ? '✅' : step.emoji}
            </span>

            {/* Particles */}
            <div style={{ position:'absolute', inset:0, display:'flex',
                          alignItems:'center', justifyContent:'center' }}>
              <BurstParticles particles={particles} />
            </div>
          </button>
        </div>

        <p className="font-display font-900"
           style={{ fontSize:'0.95rem', color: done ? recipe.color : 'rgba(61,43,31,0.5)' }}>
          {done ? 'Rata! Cantik! 🎉' : holding ? 'Tekan lagi...' : 'Tekan & tahan! 👇'}
        </p>
      </div>
    </StepShell>
  )
}
