/**
 * _shared.jsx
 *
 * Shared utilities for all step components.
 * Kept minimal — just the pieces every step needs.
 *
 * Exports:
 *   StepShell       — wrapper with fade-in, prompt card, consistent padding
 *   useWrongTap     — debounced wrong-tap feedback (800ms cooldown)
 *   WrongHint       — subtle visual hint arrow pointing toward correct target
 *   SPRING          — reused cubic-bezier string
 */

import { useState, useCallback, useRef } from 'react'

// ── Animation constants ───────────────────────────────────────────────────────
export const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)'
export const EASE   = 'cubic-bezier(0.25, 0.1, 0.25, 1)'

// ── StepShell ─────────────────────────────────────────────────────────────────
// Consistent wrapper: fade-in on mount, prompt card at top, padded stage area.
export function StepShell({ step, children, className = '' }) {
  return (
    <div
      className={`flex flex-col w-full h-full px-4 pt-3 pb-5 gap-3 ${className}`}
      style={{
        animation: 'stepFadeIn 0.1s ease-out both',
      }}
    >
      {/* Prompt card */}
      <div
        className="w-full text-center px-4 py-3 rounded-[1.25rem] select-none"
        style={{
          background:   'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow:    '0 2px 12px rgba(61,43,31,0.08)',
        }}
      >
        <p className="text-toddler-md font-display font-900 text-ink leading-tight">
          {step.label} {step.emoji}
        </p>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {children}
      </div>

      <style>{`
        @keyframes stepFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

// ── useWrongTap ───────────────────────────────────────────────────────────────
// Rate-limited wrong-tap feedback. 800ms cooldown prevents animation spam.
export function useWrongTap(cooldownMs = 800) {
  const [shaking,    setShaking]    = useState(false)
  const lastWrongRef = useRef(0)

  const triggerWrong = useCallback(() => {
    const now = Date.now()
    if (now - lastWrongRef.current < cooldownMs) return
    lastWrongRef.current = now
    setShaking(true)
    setTimeout(() => setShaking(false), 400)
  }, [cooldownMs])

  return { shaking, triggerWrong }
}

// ── WrongHint ─────────────────────────────────────────────────────────────────
// Small pulsing arrow pointing toward the correct target area.
export function WrongHint({ visible }) {
  if (!visible) return null
  return (
    <div
      className="absolute bottom-6 left-1/2 -translate-x-1/2
                 flex flex-col items-center gap-1 pointer-events-none"
      style={{ animation: 'hintPulse 0.6s ease-in-out 2' }}
      aria-hidden="true"
    >
      <span className="text-2xl">👆</span>
      <style>{`
        @keyframes hintPulse {
          0%,100% { opacity: 0.5; transform: translateX(-50%) scale(0.9); }
          50%      { opacity: 1;   transform: translateX(-50%) scale(1.1); }
        }
      `}</style>
    </div>
  )
}

// ── Shared keyframe: gentle wiggle for wrong taps ─────────────────────────────
export const WIGGLE_KEYFRAME = `
  @keyframes gentleWiggle {
    0%,100% { transform: rotate(0deg); }
    20%      { transform: rotate(-5deg); }
    60%      { transform: rotate(5deg); }
    80%      { transform: rotate(-3deg); }
  }
`
