/**
 * OvenStage.jsx
 *
 * Child taps the oven to start baking, then watches the anticipation animation.
 *
 * ── Interaction ───────────────────────────────────────────────────────────
 *   1. Idle: giant oven, "Tap untuk bakar!" prompt
 *   2. Child taps → baking begins
 *   3. Oven window glows, progress bar fills, steam particles rise
 *   4. Timer complete → "Ding! Siap!" → done overlay
 *   5. 1.8s delay → onComplete()
 *
 * ── Animation ────────────────────────────────────────────────────────────
 *   Steam particles: CSS keyframe, 3 particles with staggered timing.
 *   Oven window: glows orange → warm yellow as baking progresses.
 *   Progress bar: fills over bakingDurationMs.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useVoiceContext } from '../../../App.jsx'
import { hapticSuccess, hapticTap } from '../../../utils/haptics.js'

export function OvenStage({ stageConfig, onComplete }) {
  const { speak, speakText } = useVoiceContext()

  const [phase, setPhase]           = useState('idle')   // idle | baking | done
  const [progress, setProgress]     = useState(0)        // 0–1
  const [stageVisible, setStageVisible] = useState(false)

  const tickRef       = useRef(null)
  const halfSpokenRef = useRef(false)
  const bakingMs      = stageConfig?.bakingDurationMs ?? 4000

  // ── Mount ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setStageVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  // ── Intro narration ──────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => speak('oven.intro'), 400)
    return () => clearTimeout(t)
  }, [speak])

  // ── Cleanup ──────────────────────────────────────────────────────────────
  useEffect(() => () => clearInterval(tickRef.current), [])

  // ── Start baking ─────────────────────────────────────────────────────────
  const startBaking = useCallback(() => {
    if (phase !== 'idle') return
    setPhase('baking')
    hapticTap()
    speakText('Masuk dalam oven! Tunggu sekejap ya!')

    const start = Date.now()
    tickRef.current = setInterval(() => {
      const elapsed = Date.now() - start
      const p = Math.min(elapsed / bakingMs, 1)
      setProgress(p)

      if (p >= 0.5 && !halfSpokenRef.current) {
        halfSpokenRef.current = true
        speakText('Hmm, baunya dah mula sedap!')
      }

      if (p >= 1) {
        clearInterval(tickRef.current)
        setPhase('done')
        hapticSuccess()
        speak('oven.done')
        setTimeout(onComplete, 2000)
      }
    }, 80)
  }, [phase, bakingMs, speak, speakText, onComplete])

  // ── Oven window colour ────────────────────────────────────────────────────
  const windowColor = phase === 'idle'
    ? '#3A3A3A'
    : phase === 'done'
      ? '#FFD700'
      : `rgb(${Math.round(60 + progress * 180)}, ${Math.round(60 + progress * 80)}, 40)`

  return (
    <div
      className="flex flex-col items-center w-full h-full px-5 pt-4 pb-6 gap-4"
      style={{
        opacity:    stageVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >

      {/* ── Instruction ──────────────────────────────────────────── */}
      <div className="w-full bg-white rounded-[1.25rem] px-4 py-3 text-center
                      shadow-[0_2px_12px_rgba(61,43,31,0.08)]">
        <p className="text-toddler-md font-display font-900 text-ink">
          {phase === 'idle' ? 'Masukkan dalam oven! 🔥'
           : phase === 'baking' ? 'Tunggu sekejap... 🌡️'
           : 'Siap! Wangiinya! 🎉'}
        </p>
      </div>

      {/* ── Oven body ────────────────────────────────────────────── */}
      <div className="relative flex-1 flex flex-col items-center justify-center gap-4">

        {/* Steam particles */}
        {phase === 'baking' && (
          <div className="absolute -top-4 flex gap-6" aria-hidden="true">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  animation: `steam 1.8s ${i * 0.5}s ease-in-out infinite`,
                  fontSize: '1.6rem',
                  opacity: 0,
                }}
              >
                💨
              </div>
            ))}
          </div>
        )}

        {/* Oven */}
        <button
          type="button"
          className="relative flex flex-col items-center justify-center
                     rounded-[1.75rem] select-none
                     transition-transform duration-100"
          style={{
            width:       240,
            height:      260,
            background:  'linear-gradient(160deg, #5A5A5A 0%, #3D3D3D 100%)',
            boxShadow:   phase === 'baking'
              ? `0 0 40px rgba(${Math.round(200 * progress)}, ${Math.round(80 * progress)}, 0, 0.4), 0 8px 32px rgba(0,0,0,0.3)`
              : '0 8px 32px rgba(0,0,0,0.2)',
            touchAction: 'manipulation',
            cursor:      phase === 'idle' ? 'pointer' : 'default',
            transform:   phase === 'idle' ? undefined : 'none',
          }}
          onPointerUp={phase === 'idle' ? startBaking : undefined}
          aria-label={phase === 'idle' ? 'Oven — tap untuk mula bakar' : 'Sedang membakar'}
          aria-disabled={phase !== 'idle'}
        >

          {/* Oven window */}
          <div
            className="rounded-[1rem] border-4 border-gray-500 overflow-hidden
                       flex items-center justify-center"
            style={{
              width:      160,
              height:     110,
              backgroundColor: windowColor,
              boxShadow:  phase === 'baking'
                ? `inset 0 0 30px rgba(255, ${Math.round(200 * progress)}, 0, 0.6)`
                : 'inset 0 0 10px rgba(0,0,0,0.4)',
              transition: 'background-color 0.8s ease, box-shadow 0.8s ease',
            }}
          >
            <span
              className="leading-none"
              style={{
                fontSize: '3.5rem',
                opacity:  phase === 'idle' ? 0.2 : 1,
                filter:   phase === 'done' ? 'none' : phase === 'baking' ? `brightness(${0.7 + progress * 0.5})` : 'none',
              }}
              aria-hidden="true"
            >
              {phase === 'done' ? '🍰' : '🎂'}
            </span>
          </div>

          {/* Progress bar */}
          {phase === 'baking' && (
            <div className="mt-4 rounded-full overflow-hidden"
                 style={{ width: 140, height: 8, background: 'rgba(255,255,255,0.1)' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progress * 100}%`,
                  background: 'linear-gradient(90deg, #FF8C5A, #FFD700)',
                  borderRadius: 4,
                  transition: 'width 100ms linear',
                }}
              />
            </div>
          )}

          {/* Oven handle */}
          <div
            className="mt-3 rounded-full"
            style={{ width: 80, height: 10, background: 'rgba(255,255,255,0.15)' }}
            aria-hidden="true"
          />

          {/* Tap prompt */}
          {phase === 'idle' && (
            <p className="mt-3 text-toddler-xs font-display font-900 text-white/70">
              Tap oven! 👆
            </p>
          )}
        </button>

        {/* Done message */}
        {phase === 'done' && (
          <div
            className="bg-sunny/20 rounded-[1.25rem] px-6 py-3 text-center"
            style={{ animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}
          >
            <p className="text-toddler-md font-display font-900 text-ink">
              🔔 Ding! Siap!
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes steam {
          0%   { transform: translateY(0) scale(0.8); opacity: 0; }
          40%  { opacity: 0.7; }
          100% { transform: translateY(-40px) scale(1.3); opacity: 0; }
        }
        @keyframes popIn {
          from { transform: scale(0.8); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  )
}
