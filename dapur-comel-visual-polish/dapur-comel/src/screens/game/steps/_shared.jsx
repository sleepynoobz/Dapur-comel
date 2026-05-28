/**
 * _shared.jsx — Visual polish update
 *
 * StepShell now sits ON TOP of KitchenBg with glassmorphism cards.
 * Prompt card uses .game-prompt class for floating card appearance.
 * Added SNAP and EASE to exports.
 * useWrongTap cooldown: 800ms, adds red tint flash too.
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
 * StepShell — game-style wrapper
 * Renders on top of KitchenBg (KitchenBg is z-index 0, content is z-index 1)
 */
export function StepShell({ step, children, className = '' }) {
  return (
    <div
      className={`flex flex-col w-full h-full px-4 pt-3 pb-4 gap-3 ${className}`}
      style={{
        position: 'relative',
        zIndex:   1,
        animation: 'stepFadeIn 0.12s ease-out both',
      }}
    >
      {/* Floating game prompt card */}
      <div className="game-prompt">
        <p
          className="font-display font-900 text-ink leading-tight"
          style={{ fontSize: '1.35rem' }}
        >
          {step.label}
          <span style={{ marginLeft: 8 }}>{step.emoji}</span>
        </p>
      </div>

      {/* Interaction area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {children}
      </div>

      <style>{`
        @keyframes stepFadeIn {
          from { opacity: 0; transform: scale(0.96) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}

/**
 * useWrongTap — 800ms cooldown, returns { shaking, triggerWrong }
 */
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

/**
 * SteamPuff — 2-3 rising steam particles
 */
export function SteamPuff({ active, count = 3 }) {
  if (!active) return null
  return (
    <div
      className="absolute pointer-events-none flex gap-3"
      style={{ top: -20, left: '50%', transform: 'translateX(-50%)' }}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          style={{
            fontSize:        '1.2rem',
            animation:       `steamRise ${0.9 + i * 0.15}s ${i * 0.2}s ease-out infinite`,
            opacity:         0,
            display:         'inline-block',
          }}
        >
          💨
        </span>
      ))}
    </div>
  )
}

/**
 * BurstParticles — scattered emoji from a point
 */
export function BurstParticles({ particles }) {
  return particles.map(p => (
    <span
      key={p.id}
      className="absolute pointer-events-none leading-none"
      style={{
        fontSize:  p.size ?? '1.3rem',
        '--tx':    `${p.x}px`,
        '--ty':    `${p.y}px`,
        animation: 'burst 0.55s ease-out forwards',
        top:       '50%',
        left:      '50%',
        marginTop: '-0.5em',
        marginLeft:'-0.5em',
      }}
      aria-hidden="true"
    >
      {p.emoji}
    </span>
  ))
}

/**
 * CompletionFlash — full-area white flash on step done
 */
export function CompletionFlash({ show }) {
  if (!show) return null
  return (
    <div
      className="absolute inset-0 pointer-events-none rounded-[inherit]"
      style={{
        background: 'rgba(255,255,255,0.9)',
        animation:  'completionFlash 0.4s ease-out forwards',
        zIndex:     50,
      }}
      aria-hidden="true"
    />
  )
}
