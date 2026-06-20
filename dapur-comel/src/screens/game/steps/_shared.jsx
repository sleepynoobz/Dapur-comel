/**
 * _shared.jsx — Scene-aware update
 *
 * StepShell is now minimal — transparent, no background card.
 * The kitchen scene is the background. Step prompt floats on top.
 * Interaction content sits in upper portion of the scene.
 */

import { useState, useCallback, useRef } from 'react'

export const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)'
export const SNAP   = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
export const EASE   = 'cubic-bezier(0.4, 0, 0.2, 1)'

export const WIGGLE_KEYFRAME = `
  @keyframes gentleWiggle {
    0%,100% { transform: rotate(0deg) translateX(0); }
    20%      { transform: rotate(-5deg) translateX(-4px); }
    60%      { transform: rotate(5deg) translateX(4px); }
    80%      { transform: rotate(-2deg) translateX(-2px); }
  }
`

/**
 * StepShell — transparent wrapper, scene is the bg.
 * Prompt card floats at top, children centred below it.
 */
export function StepShell({ step, children, className = '' }) {
  return (
    <div
      className={`flex flex-col w-full h-full px-4 pt-3 pb-3 gap-3 ${className}`}
      style={{ animation: 'stepFadeIn 0.12s ease-out both' }}
    >
      {/* Floating prompt — glass card */}
      <div style={{
        background:   'rgba(255,252,240,0.92)',
        borderRadius:  18,
        padding:       '10px 18px',
        boxShadow:     '0 4px 20px rgba(80,40,10,0.14), inset 0 1px 0 rgba(255,255,255,0.8)',
        border:        '1.5px solid rgba(255,210,120,0.4)',
        textAlign:     'center',
        backdropFilter:'blur(8px)',
        WebkitBackdropFilter:'blur(8px)',
        position:      'relative',
      }}>
        {/* Top shimmer */}
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:2,
          background:'linear-gradient(90deg, transparent, rgba(255,200,100,0.7), transparent)',
          borderRadius:'18px 18px 0 0',
        }} />
        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontWeight:  900,
          fontSize:    '1.3rem',
          color:       '#3D2B1F',
          lineHeight:  1.2,
          margin:      0,
        }}>
          {step.label}
          <span style={{ marginLeft:8 }}>{step.emoji}</span>
        </p>
      </div>

      {/* Interaction area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {children}
      </div>

      <style>{`
        @keyframes stepFadeIn {
          from { opacity: 0; transform: scale(0.97) translateY(4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}

/** useWrongTap — 800ms cooldown */
export function useWrongTap(cooldownMs = 800) {
  const [shaking,  setShaking]  = useState(false)
  const lastRef = useRef(0)
  const triggerWrong = useCallback(() => {
    const now = Date.now()
    if (now - lastRef.current < cooldownMs) return
    lastRef.current = now
    setShaking(true)
    setTimeout(() => setShaking(false), 380)
  }, [cooldownMs])
  return { shaking, triggerWrong }
}

/** SteamPuff */
export function SteamPuff({ active, count = 3 }) {
  if (!active) return null
  return (
    <div className="absolute pointer-events-none flex gap-3"
         style={{ top:-18, left:'50%', transform:'translateX(-50%)' }} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} style={{
          fontSize:'1.1rem',
          animation:`steamRise ${0.9+i*0.15}s ${i*0.2}s ease-out infinite`,
          opacity:0, display:'inline-block',
        }}>💨</span>
      ))}
    </div>
  )
}

/** BurstParticles */
export function BurstParticles({ particles }) {
  return particles.map(p => (
    <span key={p.id} className="absolute pointer-events-none leading-none"
          style={{
            fontSize:  p.size ?? '1.2rem',
            '--tx':    `${p.x}px`,
            '--ty':    `${p.y}px`,
            animation: 'burst 0.55s ease-out forwards',
            top:'50%', left:'50%',
            marginTop:'-0.5em', marginLeft:'-0.5em',
          }}
          aria-hidden="true">
      {p.emoji}
    </span>
  ))
}

/** CompletionFlash */
export function CompletionFlash({ show }) {
  if (!show) return null
  return (
    <div className="absolute inset-0 pointer-events-none"
         style={{ background:'rgba(255,255,255,0.85)',
                  animation:'completionFlash 0.4s ease-out forwards', zIndex:50 }}
         aria-hidden="true" />
  )
}
