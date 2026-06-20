/**
 * PourStep.jsx — Visual polish
 *
 * Container TILTS as child drags down (CSS rotate).
 * Liquid stream is a sinusoidal SVG path — organic, not a rectangle.
 * Bowl fills with colour gradient as progress increases.
 * Splash particles on completion.
 */

import { useState, useRef, useCallback } from 'react'
import { StepShell, SPRING, BurstParticles } from './_shared.jsx'
import { hapticTap, hapticSuccess } from '../../../utils/haptics.js'
import { sfx } from '../../../utils/audio.js'

const POUR_THRESHOLD = 90

export function PourStep({ recipe, step, onComplete }) {
  const [dragY,      setDragY]      = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [done,       setDone]       = useState(false)
  const [particles,  setParticles]  = useState([])

  const pointerRef    = useRef(null)
  const startYRef     = useRef(0)
  const completingRef = useRef(false)

  const progress    = Math.min(dragY / POUR_THRESHOLD, 1)
  const tiltDeg     = progress * 62       // container tilts 0→62°
  const streamH     = progress * 100      // stream height 0→100px

  // Bowl fill colour interpolation
  const r = Math.round(255 - progress * 30)
  const g = Math.round(200 - progress * 60)
  const b = Math.round(130 - progress * 40)
  const bowlFillColor = `rgba(${r},${g},${b},${0.15 + progress * 0.55})`

  const handlePointerDown = useCallback((e) => {
    if (done) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    pointerRef.current = e.pointerId
    startYRef.current  = e.clientY
    setIsDragging(true)
    hapticTap()
    sfx.play(step.sfx)
  }, [done, step.sfx])

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
      // Splash particles
      setParticles(['💧','💦','✨','💧','💦'].map((e, i) => ({
        id: Date.now() + i, emoji: e,
        x: (Math.random() - 0.5) * 100,
        y: -(Math.random() * 60 + 20),
        size: '1.1rem',
      })))
      setTimeout(() => setParticles([]), 600)
      setTimeout(onComplete, 400)
    }
  }, [done, onComplete])

  const handlePointerUp = useCallback(() => {
    if (completingRef.current) return
    pointerRef.current = null
    setIsDragging(false)
    setDragY(0)
  }, [])

  return (
    <StepShell step={step}>
      <div className="relative flex flex-col items-center select-none"
           style={{ height: 280, width: '100%', touchAction: 'none' }}>

        {/* Container — tilts on drag */}
        <div
          className="absolute flex items-center justify-center rounded-[1.5rem]"
          style={{
            width:        100, height: 110,
            top:          0, left: '50%', marginLeft: -50,
            background:   'linear-gradient(160deg, #FFF8EC, #FFEDD0)',
            boxShadow:    '0 6px 20px rgba(80,40,10,0.15), inset 0 1px 0 rgba(255,255,255,0.8)',
            border:       '2px solid rgba(220,180,100,0.3)',
            transform:    `rotate(${tiltDeg}deg)`,
            transformOrigin: 'bottom right',
            transition:   isDragging ? 'none' : `transform 0.35s ${SPRING}`,
            touchAction:  'none',
            cursor:       done ? 'default' : 'grab',
            zIndex:       3,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          aria-label={step.label}
        >
          <span style={{ fontSize: '3rem', lineHeight: 1,
                         transform: `rotate(-${tiltDeg}deg)`,
                         transition: isDragging ? 'none' : `transform 0.35s ${SPRING}` }}
                aria-hidden="true">
            {step.emoji}
          </span>
        </div>

        {/* Liquid stream — sinusoidal SVG */}
        {streamH > 4 && (
          <svg
            width="30"
            height={streamH}
            viewBox={`0 0 30 ${streamH}`}
            className="absolute"
            style={{ top: 90, left: '50%', marginLeft: -15, zIndex: 2, pointerEvents: 'none' }}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="streamGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#87CEEB" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#4A90D9" stopOpacity="0.7" />
              </linearGradient>
            </defs>
            {/* Wobbly stream path */}
            <path
              d={`M 15 0 Q ${10 + Math.sin(Date.now()/200)*5} ${streamH*0.33} 15 ${streamH*0.5} Q ${20 + Math.sin(Date.now()/200+1)*5} ${streamH*0.66} 15 ${streamH}`}
              stroke="url(#streamGrad)"
              strokeWidth={Math.max(4, 8 * progress)}
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        )}

        {/* Bowl */}
        <div
          className="absolute cooking-bowl"
          style={{
            width:      130, height: 100,
            bottom:     16, left: '50%', marginLeft: -65,
            overflow:   'hidden',
            zIndex:     1,
          }}
          aria-label="Mangkuk"
        >
          {/* Fill level */}
          <div
            style={{
              position:   'absolute',
              bottom:     0, left: 0, right: 0,
              height:     `${progress * 70}%`,
              background: `linear-gradient(0deg, ${bowlFillColor}, transparent)`,
              transition: 'height 0.1s ease',
              borderRadius: '0 0 50% 50%',
            }}
            aria-hidden="true"
          />
          {/* Bowl content emoji */}
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:'2rem', opacity: done ? 1 : 0.3 + progress * 0.5 }}
                  aria-hidden="true">
              {done ? '✨' : '🥣'}
            </span>
          </div>
          {/* Splash particles */}
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <BurstParticles particles={particles} />
          </div>
        </div>

        {/* Drag hint */}
        {!isDragging && !done && (
          <p className="absolute bottom-0 font-display font-900 text-center"
             style={{ fontSize:'0.95rem', color:'rgba(61,43,31,0.5)', width:'100%' }}>
            Seret bekas ke bawah 👇
          </p>
        )}
      </div>
    </StepShell>
  )
}
