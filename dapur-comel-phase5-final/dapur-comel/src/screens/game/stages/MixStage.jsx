/**
 * MixStage.jsx — Phase 3 hardened
 *
 * ── Fixes applied ─────────────────────────────────────────────────────────
 *   FIX 1: getMixConfig called with useMemo([], []) — stable per stage mount.
 *
 *   FIX 2: MixStage's processQueue (via useVoice) was previously capturing
 *          stale isUnlocked. This is fixed in useVoice.js itself (ref-based).
 *
 *   FIX 3: stirTimerRef now properly cleared on unmount.
 *
 *   FIX 4: handlePointerMove checks completingRef before processing — prevents
 *          extra angle accumulation after the 100% threshold is crossed.
 *
 *   FIX 5: Inline keyframes moved to a single <style> block at bottom,
 *          not inside conditional renders.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useVoiceContext } from '../../../App.jsx'
import { hapticSuccess, hapticTap } from '../../../utils/haptics.js'
import { getMixConfig } from '../../../engine/recipeRunner.js'
import { LEVEL } from '../../../utils/constants.js'

const BOWL_SIZE   = 220
const RING_RADIUS = 96

export function MixStage({ recipe, stageConfig, level = LEVEL.ONE, onComplete }) {
  const { speak, speakText } = useVoiceContext()

  // FIX 1: stable config
  const { circlesRequired, hintAfterSeconds } = useMemo(
    () => getMixConfig(stageConfig, level),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const [progress,     setProgress]     = useState(0)
  const [isDone,       setIsDone]       = useState(false)
  const [spoonAngle,   setSpoonAngle]   = useState(0)
  const [isStirring,   setIsStirring]   = useState(false)
  const [showHint,     setShowHint]     = useState(false)
  const [stageVisible, setStageVisible] = useState(false)

  const pointerRef      = useRef(null)
  const lastAngleRef    = useRef(null)
  const totalRotRef     = useRef(0)
  const centerRef       = useRef({ x: 0, y: 0 })
  const completingRef   = useRef(false)
  const halfSpokenRef   = useRef(false)
  const hintTimerRef    = useRef(null)
  const stirTimerRef    = useRef(null)
  const bowlRef         = useRef(null)

  // Mount
  useEffect(() => {
    const t = setTimeout(() => setStageVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  // FIX 3: cleanup both timers on unmount
  useEffect(() => () => {
    clearTimeout(hintTimerRef.current)
    clearTimeout(stirTimerRef.current)
  }, [])

  // Intro narration
  useEffect(() => {
    const t = setTimeout(() => speak('mix.intro'), 400)
    return () => clearTimeout(t)
  }, [speak])

  // Hint timer
  const resetHint = useCallback(() => {
    setShowHint(false)
    clearTimeout(hintTimerRef.current)
    hintTimerRef.current = setTimeout(() => {
      setShowHint(true)
      speakText('Pusing-pusing jari kamu kat dalam mangkuk!')
    }, hintAfterSeconds * 1000)
  }, [hintAfterSeconds, speakText])

  useEffect(() => { resetHint(); return () => clearTimeout(hintTimerRef.current) }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
    const rect = bowlRef.current?.getBoundingClientRect()
    if (rect) {
      centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    }
    lastAngleRef.current = getAngle(e.clientX, e.clientY)
    setIsStirring(true)
    resetHint()
    hapticTap()
  }, [isDone, getAngle, resetHint])

  const handlePointerMove = useCallback((e) => {
    // FIX 4: stop processing if completing or done
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

    const p = Math.min(totalRotRef.current / (circlesRequired * 360), 1)
    setProgress(p)

    if (p >= 0.45 && p < 0.55 && !halfSpokenRef.current) {
      halfSpokenRef.current = true
      speakText('Lagi sikit! Terus kacau!')
    }

    clearTimeout(stirTimerRef.current)
    stirTimerRef.current = setTimeout(() => setIsStirring(false), 300)

    if (p >= 1 && !completingRef.current) {
      completingRef.current = true
      setIsDone(true)
      setIsStirring(false)
      hapticSuccess()
      speak('mix.done')
      setTimeout(onComplete, 1800)
    }
  }, [isDone, getAngle, circlesRequired, speak, speakText, onComplete])

  const handlePointerUp = useCallback(() => {
    pointerRef.current   = null
    lastAngleRef.current = null
    setIsStirring(false)
  }, [])

  const bowlColor = isDone ? '#FFB380'
    : progress < 0.33 ? '#FFF8EC'
    : progress < 0.66 ? '#FFDBB8'
    : '#FFC88A'

  const ringCircumference = 2 * Math.PI * RING_RADIUS
  const ringOffset = ringCircumference * (1 - progress)

  return (
    <div
      className="flex flex-col items-center w-full h-full px-5 pt-4 pb-6 gap-4"
      style={{ opacity: stageVisible ? 1 : 0, transition: 'opacity 0.3s ease' }}
    >
      {/* Instruction */}
      <div className="w-full bg-white rounded-[1.25rem] px-4 py-3 text-center
                      shadow-[0_2px_12px_rgba(61,43,31,0.08)]">
        <p className="text-toddler-md font-display font-900 text-ink">
          {isDone ? 'Dah sebati! 🎉' : 'Kacau dalam mangkuk! 🥄'}
        </p>
        {!isDone && (
          <p className="text-toddler-xs text-ink-muted font-body font-700 mt-0.5">
            Pusing-pusing jari kamu!
          </p>
        )}
      </div>

      {/* Bowl + ring */}
      <div className="relative flex-1 flex items-center justify-center">
        <svg
          width={BOWL_SIZE + 24} height={BOWL_SIZE + 24}
          className="absolute" style={{ pointerEvents: 'none' }}
          aria-hidden="true"
        >
          <circle cx={(BOWL_SIZE + 24) / 2} cy={(BOWL_SIZE + 24) / 2} r={RING_RADIUS}
            fill="none" stroke="rgba(61,43,31,0.08)" strokeWidth="6" />
          <circle cx={(BOWL_SIZE + 24) / 2} cy={(BOWL_SIZE + 24) / 2} r={RING_RADIUS}
            fill="none"
            stroke={isDone ? '#5EC4B6' : '#FF8C5A'}
            strokeWidth="6" strokeLinecap="round"
            strokeDasharray={ringCircumference}
            strokeDashoffset={ringOffset}
            style={{ transformOrigin: 'center', transform: 'rotate(-90deg)', transition: 'stroke-dashoffset 100ms linear, stroke 0.5s ease' }}
          />
        </svg>

        <div
          ref={bowlRef}
          className="relative flex items-center justify-center rounded-full overflow-hidden select-none"
          style={{
            width:       BOWL_SIZE,
            height:      BOWL_SIZE,
            background:  `radial-gradient(circle at 40% 40%, ${bowlColor}, ${bowlColor}CC)`,
            boxShadow:   isStirring
              ? '0 4px 32px rgba(255,140,90,0.4), inset 0 2px 8px rgba(0,0,0,0.1)'
              : '0 8px 32px rgba(61,43,31,0.12), inset 0 2px 8px rgba(0,0,0,0.06)',
            transition:  'background 0.6s ease, box-shadow 0.3s ease',
            touchAction: 'none',
            cursor:      isDone ? 'default' : 'pointer',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          aria-label="Mangkuk — kacau kat sini"
          role="application"
        >
          <div
            style={{
              fontSize:       '3rem',
              transform:      `rotate(${spoonAngle}deg)`,
              transition:     isStirring ? 'none' : 'transform 0.3s ease',
              transformOrigin:'center',
              userSelect:     'none',
            }}
            aria-hidden="true"
          >
            {isDone ? '✨' : '🥄'}
          </div>

          {showHint && !isStirring && !isDone && (
            <div
              className="absolute"
              style={{ animation: 'mixStirHint 1.5s linear infinite', top: '18%', left: '50%', transformOrigin: '0px 60px' }}
              aria-hidden="true"
            >
              <span style={{ fontSize: '1.5rem' }}>👆</span>
            </div>
          )}

          {isDone && (
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(94,196,182,0.15)', animation: 'mixPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}
            />
          )}
        </div>
      </div>

      <p className="text-toddler-xs font-body font-700 text-ink-muted text-center">
        {isDone ? '🎉 Wah! Dah sebati!' : isStirring ? 'Bagus! Terus kacau!' : 'Sentuh mangkuk dan pusing!'}
      </p>

      {/* FIX 5: single keyframe block */}
      <style>{`
        @keyframes mixStirHint {
          from { transform: rotate(0deg) translateX(60px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
        }
        @keyframes mixPopIn {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
