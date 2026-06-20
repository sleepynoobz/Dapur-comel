/**
 * TapStep.jsx — Visual polish
 *
 * CRACK_EGG: SVG egg with crack animation, yolk splat, shell halves fly apart
 * FRY:       Pan with browning gradient, sizzle bubbles rising
 * BAKE:      Oven window with heat glow pulsing
 */

import { useState, useCallback, useRef } from 'react'
import { StepShell, useWrongTap, SPRING, SteamPuff, BurstParticles } from './_shared.jsx'
import { hapticTap, hapticSuccess } from '../../../utils/haptics.js'
import { sfx } from '../../../utils/audio.js'
import { STEP } from '../../../utils/constants.js'

function requiredTaps(type) { return type === STEP.CRACK_EGG ? 2 : 1 }

export function TapStep({ recipe, step, onComplete }) {
  const needed = requiredTaps(step.type)
  const [taps,       setTaps]       = useState(0)
  const [cracked,    setCracked]    = useState(false)  // shows crack line
  const [done,       setDone]       = useState(false)
  const [bursting,   setBursting]   = useState(false)
  const [particles,  setParticles]  = useState([])
  const [sizzling,   setSizzling]   = useState(false)  // FRY: sizzle started
  const [browning,   setBrowning]   = useState(0)      // FRY: 0–1
  const { shaking, triggerWrong }   = useWrongTap()
  const completingRef = useRef(false)
  const brownTimerRef = useRef(null)

  const handleTap = useCallback(() => {
    if (done || completingRef.current) return
    hapticTap()
    sfx.play(step.sfx)
    setBursting(true)
    setTimeout(() => setBursting(false), 280)

    const next = taps + 1
    setTaps(next)

    if (step.type === STEP.CRACK_EGG && next === 1) {
      setCracked(true)
    }

    // Particles
    const emojis = step.type === STEP.CRACK_EGG ? ['💛','✨','💛','✨']
                 : step.type === STEP.FRY        ? ['💨','🔥','💨','🔥']
                 : ['💨','⭐','💨','⭐']
    setParticles(emojis.map((e, i) => ({
      id: Date.now() + i, emoji: e,
      x: (Math.random() - 0.5) * 130,
      y: -(Math.random() * 90 + 30),
      size: '1.2rem',
    })))
    setTimeout(() => setParticles([]), 580)

    if (next >= needed && !completingRef.current) {
      completingRef.current = true
      hapticSuccess()
      setDone(true)

      if (step.type === STEP.FRY) {
        setSizzling(true)
        let b = 0
        brownTimerRef.current = setInterval(() => {
          b += 0.12
          setBrowning(Math.min(b, 1))
          if (b >= 1) { clearInterval(brownTimerRef.current); setTimeout(onComplete, 300) }
        }, 120)
      } else {
        setTimeout(onComplete, 320)
      }
    }
  }, [taps, needed, done, step.type, step.sfx, onComplete])

  // ── CRACK EGG ───────────────────────────────────────────────────────────────
  if (step.type === STEP.CRACK_EGG) {
    return (
      <StepShell step={step}>
        <div className="relative flex flex-col items-center gap-4">
          <button
            type="button" onPointerUp={handleTap}
            className="relative flex items-center justify-center outline-none select-none"
            style={{ width: 180, height: 200, touchAction: 'manipulation',
                     transform: bursting ? 'scale(0.9)' : 'scale(1)',
                     transition: `transform 0.1s ${SPRING}`,
                     animation: shaking ? 'gentleWiggle 0.35s ease' : undefined }}
            aria-label="Pecah telur"
          >
            {/* Egg SVG */}
            <svg viewBox="0 0 120 140" width="150" height="175" aria-hidden="true">
              {/* Shadow */}
              <ellipse cx="60" cy="135" rx="38" ry="6" fill="rgba(0,0,0,0.1)" />
              {/* Egg body */}
              {!done ? (
                <path
                  d="M60 8 C90 8 105 50 105 78 C105 110 85 132 60 132 C35 132 15 110 15 78 C15 50 30 8 60 8 Z"
                  fill="url(#eggGrad)"
                  stroke="rgba(220,190,130,0.4)" strokeWidth="1.5"
                />
              ) : (
                <>
                  {/* Left shell half */}
                  <path d="M60 8 C40 8 22 40 16 65 C35 55 55 58 60 70 Z"
                    fill="url(#eggGrad)"
                    style={{ animation: 'crackSplit 0.5s 0.1s ease-out forwards', transformOrigin: '60px 70px' }}
                  />
                  {/* Right shell half */}
                  <path d="M60 8 C80 8 98 40 104 65 C85 55 65 58 60 70 Z"
                    fill="url(#eggGrad)"
                    style={{ animation: 'crackSplitR 0.5s 0.1s ease-out forwards', transformOrigin: '60px 70px' }}
                  />
                  {/* Yolk */}
                  <circle cx="60" cy="90" r="22" fill="#FFD700"
                    style={{ animation: 'yolkFall 0.4s 0.2s ease-out both' }}
                  />
                  <circle cx="54" cy="84" r="6" fill="rgba(255,255,255,0.5)" />
                </>
              )}
              {/* Crack line (appears on first tap) */}
              {cracked && !done && (
                <path d="M60 50 L56 70 L62 82 L58 100" stroke="rgba(180,140,80,0.8)"
                  strokeWidth="2.5" fill="none" strokeLinecap="round"
                  style={{ animation: 'crackAppear 0.2s ease-out' }}
                />
              )}
              <defs>
                <radialGradient id="eggGrad" cx="38%" cy="30%">
                  <stop offset="0%" stopColor="#FFFDE8" />
                  <stop offset="60%" stopColor="#FFF5CC" />
                  <stop offset="100%" stopColor="#F0D890" />
                </radialGradient>
              </defs>
            </svg>

            {/* Particles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <BurstParticles particles={particles} />
            </div>
          </button>

          {/* Pip indicators */}
          <div className="flex gap-3">
            {[0,1].map(i => (
              <div key={i} className="rounded-full transition-all duration-200"
                style={{ width: i < taps ? 32 : 22, height: i < taps ? 32 : 22,
                         background: i < taps ? 'linear-gradient(135deg,#FFD700,#FFA500)' : 'rgba(200,170,100,0.3)' }}
                aria-hidden="true" />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes crackAppear { from { stroke-dashoffset: 60; stroke-dasharray: 60; } to { stroke-dashoffset: 0; } }
          @keyframes gentleWiggle { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-6deg)} 75%{transform:rotate(6deg)} }
        `}</style>
      </StepShell>
    )
  }

  // ── FRY ─────────────────────────────────────────────────────────────────────
  if (step.type === STEP.FRY) {
    // Browning colour: pale yellow → golden brown
    const itemColor = `rgb(${Math.round(255 - browning * 30)}, ${Math.round(220 - browning * 80)}, ${Math.round(80 - browning * 50)})`

    return (
      <StepShell step={step}>
        <div className="relative flex flex-col items-center gap-3">
          {/* Steam above pan when sizzling */}
          <SteamPuff active={sizzling} count={3} />

          {/* Pan + item */}
          <button
            type="button" onPointerUp={handleTap}
            className="relative flex items-center justify-center outline-none select-none cooking-pan"
            style={{ width: 200, height: 200, touchAction: 'manipulation',
                     cursor: done ? 'default' : 'pointer',
                     transform: bursting ? 'scale(0.94)' : 'scale(1)',
                     transition: `transform 0.1s ${SPRING}`,
                     animation: shaking ? 'gentleWiggle 0.35s ease' : undefined }}
            aria-label="Goreng"
          >
            {/* Item in pan */}
            <div style={{
              width: 120, height: 120,
              borderRadius: '50%',
              background: done
                ? `radial-gradient(circle at 40% 35%, ${itemColor} 0%, #8B4513 100%)`
                : 'radial-gradient(circle at 40% 35%, #FFF8E0 0%, #F5E0A0 100%)',
              boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.15)',
              transition: 'background 0.3s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '3rem', filter: done ? `sepia(${browning})` : 'none',
                             transition: 'filter 0.3s ease' }} aria-hidden="true">
                {step.emoji}
              </span>
            </div>

            {/* Sizzle bubbles */}
            {sizzling && [0,1,2,3].map(i => (
              <div key={i} className="absolute rounded-full"
                style={{
                  width: 8, height: 8,
                  background: 'rgba(255,220,150,0.85)',
                  bottom: `${20 + i * 12}px`,
                  left:   `${40 + i * 22}px`,
                  '--bx': `${(Math.random()-0.5)*20}px`,
                  animation: `sizzleBubble ${0.7 + i * 0.2}s ${i * 0.15}s ease-out infinite`,
                }}
                aria-hidden="true"
              />
            ))}

            <div className="absolute inset-0 flex items-center justify-center">
              <BurstParticles particles={particles} />
            </div>

            {/* Pan handle */}
            <div style={{
              position:'absolute', right:-36, top:'50%', marginTop:-8,
              width: 40, height: 16,
              background: 'linear-gradient(90deg, #3D3D3D, #2A2A2A)',
              borderRadius: '0 8px 8px 0',
              boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
            }} aria-hidden="true" />
          </button>

          {!done && <p style={{ fontSize:'1rem', fontWeight:800, color:'rgba(61,43,31,0.5)' }}>Ketuk untuk goreng!</p>}
        </div>
        <style>{`@keyframes gentleWiggle { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-5deg)} 75%{transform:rotate(5deg)} }`}</style>
      </StepShell>
    )
  }

  // ── BAKE ─────────────────────────────────────────────────────────────────────
  return (
    <StepShell step={step}>
      <div className="relative flex flex-col items-center gap-3">
        <SteamPuff active={done} count={3} />

        <button
          type="button" onPointerUp={handleTap}
          className="relative outline-none select-none"
          style={{ width: 200, height: 200, touchAction: 'manipulation',
                   background: 'linear-gradient(160deg, #5A5A5A 0%, #3D3D3D 100%)',
                   borderRadius: 28,
                   boxShadow: done
                     ? '0 0 0 4px rgba(255,180,50,0.6), 0 8px 32px rgba(200,100,0,0.4)'
                     : '0 8px 32px rgba(0,0,0,0.3)',
                   transition: `box-shadow 0.4s ease, transform 0.1s ${SPRING}`,
                   transform: bursting ? 'scale(0.94)' : 'scale(1)',
                   cursor: done ? 'default' : 'pointer' }}
          aria-label="Oven"
        >
          {/* Oven window */}
          <div style={{
            position:'absolute', top:28, left:24, right:24, height:100,
            background: done
              ? 'radial-gradient(circle, #FFD700 0%, #FF6B00 60%, #3D1A00 100%)'
              : 'radial-gradient(circle, #FF6B00 0%, #2A0A00 100%)',
            borderRadius: 14,
            boxShadow: done
              ? 'inset 0 0 30px rgba(255,200,0,0.7)'
              : 'inset 0 0 16px rgba(0,0,0,0.5)',
            transition: 'background 0.5s ease',
            display:'flex', alignItems:'center', justifyContent:'center',
            overflow:'hidden',
          }}>
            <span style={{ fontSize: '3rem', opacity: done ? 1 : 0.6,
                           filter: done ? 'none' : 'brightness(0.5)',
                           transition: 'all 0.5s ease' }} aria-hidden="true">
              {done ? '🍰' : step.emoji}
            </span>
            {/* Heat shimmer lines */}
            {done && [0,1,2].map(i => (
              <div key={i} style={{
                position:'absolute', bottom:0, width:2, height:'60%',
                left: `${25 + i*25}%`,
                background: 'rgba(255,220,100,0.4)',
                animation: `steamRise ${0.8+i*0.2}s ${i*0.2}s ease-in-out infinite`,
              }} aria-hidden="true" />
            ))}
          </div>

          {/* Oven handle */}
          <div style={{
            position:'absolute', bottom:24, left:40, right:40,
            height:12, background:'rgba(255,255,255,0.12)',
            borderRadius:6,
          }} aria-hidden="true" />

          <div className="absolute inset-0 flex items-center justify-center">
            <BurstParticles particles={particles} />
          </div>
        </button>

        {!done && (
          <p style={{ fontSize:'1rem', fontWeight:800, color:'rgba(61,43,31,0.5)' }}>
            Ketuk untuk bakar!
          </p>
        )}
        {done && (
          <p style={{ fontSize:'1.1rem', fontWeight:900, color:'#FF8C5A',
                      animation:`yolkFall 0.4s ${SPRING} both` }}>
            🔔 Ding! Siap!
          </p>
        )}
      </div>
    </StepShell>
  )
}
