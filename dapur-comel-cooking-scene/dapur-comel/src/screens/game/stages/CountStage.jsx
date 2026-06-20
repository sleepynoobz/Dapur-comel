/**
 * CountStage.jsx
 *
 * Child taps the ingredient card the correct number of times.
 * Oyen counts along with each tap — "Satu! Dua! Tiga!"
 *
 * ── Interaction ───────────────────────────────────────────────────────────
 *   - One large central tap target (not tiny)
 *   - Each tap animates a new ingredient flying into the bowl
 *   - Counter fills up as child taps
 *   - Over-tapping is silently ignored (forgiving)
 *   - Completion: short delay → stage advances
 *
 * ── Visual feedback ───────────────────────────────────────────────────────
 *   Filled circles (one per required count) appear below the tap target.
 *   Empty = placeholder. Filled = emoji. Full = done + praise.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useVoiceContext } from '../../../App.jsx'
import { hapticTap } from '../../../utils/haptics.js'
import { getCountConfig } from '../../../engine/recipeRunner.js'
import { LEVEL } from '../../../utils/constants.js'

// Oyen counts along in Malay
const COUNT_WORDS = ['Satu!', 'Dua!', 'Tiga!', 'Empat!', 'Lima!']

export function CountStage({ recipe, stageConfig, level = LEVEL.ONE, onComplete }) {
  const { speak, speakText } = useVoiceContext()

  const { ingredient, quantity } = getCountConfig(recipe, stageConfig, level)

  const [count,        setCount]        = useState(0)
  const [bounceKey,    setBounceKey]    = useState(0)   // forces re-mount for animation
  const [done,         setDone]         = useState(false)
  const [stageVisible, setStageVisible] = useState(false)

  const completingRef = useRef(false)

  // ── Mount ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setStageVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  // ── Intro narration ──────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => speak('count.intro'), 400)
    return () => clearTimeout(t)
  }, [speak])

  // ── Tap handler ──────────────────────────────────────────────────────────
  const handleTap = useCallback(() => {
    if (done || completingRef.current) return
    if (count >= quantity) return   // already full, silently ignore

    const next = count + 1
    hapticTap()
    setBounceKey(k => k + 1)   // trigger bounce animation
    setCount(next)

    // Oyen counts along
    speakText(COUNT_WORDS[count] ?? `${next}!`)

    if (next >= quantity) {
      completingRef.current = true
      setDone(true)
      setTimeout(() => {
        speak('count.correct')
        setTimeout(onComplete, 1400)
      }, 300)
    }
  }, [count, quantity, done, speak, speakText, onComplete])

  const unitLabel = quantity === 1
    ? ingredient.unit
    : ingredient.unit

  const quantityLabel = quantity === 1 ? 'SATU'
    : quantity === 2 ? 'DUA'
    : quantity === 3 ? 'TIGA'
    : `${quantity}`

  return (
    <div
      className="flex flex-col items-center w-full h-full px-5 pt-4 pb-6 gap-5"
      style={{
        opacity:    stageVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >

      {/* ── Instruction card ──────────────────────────────────────── */}
      <div className="w-full bg-white rounded-[1.25rem] px-5 py-4 text-center
                      shadow-[0_2px_12px_rgba(61,43,31,0.08)]">
        <p className="text-toddler-xs text-ink-muted font-body font-700">
          Masukkan...
        </p>
        <p className="text-toddler-lg font-display font-900 text-ink mt-0.5">
          <span style={{ color: '#FF8C5A' }}>{quantityLabel}</span>
          {' '}{unitLabel} {ingredient.name} {ingredient.emoji}
        </p>
      </div>

      {/* ── Count circles ────────────────────────────────────────── */}
      <div className="flex gap-4 justify-center" aria-label={`${count} dari ${quantity}`}>
        {Array.from({ length: quantity }, (_, i) => (
          <div
            key={i}
            className="flex items-center justify-center rounded-full
                       transition-all duration-300"
            style={{
              width:           56,
              height:          56,
              backgroundColor: i < count ? '#5EC4B6' : '#EDE0D6',
              transform:       i < count ? 'scale(1.05)' : 'scale(1)',
              boxShadow:       i < count
                ? '0 4px 12px rgba(94,196,182,0.3)'
                : '0 2px 6px rgba(61,43,31,0.08)',
            }}
            aria-hidden="true"
          >
            {i < count
              ? <span className="text-xl leading-none">{ingredient.emoji}</span>
              : <span className="text-xl leading-none opacity-30">○</span>
            }
          </div>
        ))}
      </div>

      {/* ── Big tap target ───────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center">
        <button
          type="button"
          className="relative flex flex-col items-center justify-center
                     rounded-full select-none
                     transition-all duration-100
                     active:scale-90"
          style={{
            width:           180,
            height:          180,
            background:      done
              ? 'linear-gradient(135deg, #5EC4B6, #3A9E91)'
              : `linear-gradient(135deg, ${ingredient.bg ?? '#FFF8EC'}, #FFE8CC)`,
            boxShadow:       done
              ? '0 8px 32px rgba(94,196,182,0.4)'
              : '0 8px 32px rgba(255,140,90,0.2), 0 2px 8px rgba(61,43,31,0.1)',
            touchAction:     'manipulation',
          }}
          onPointerUp={handleTap}
          aria-label={`Masukkan ${ingredient.name}`}
          aria-disabled={done}
        >
          {/* Bounce animation container — keyed to re-mount on each tap */}
          <div
            key={bounceKey}
            style={{
              animation: bounceKey > 0 ? 'tapBounce 0.35s cubic-bezier(0.34,1.7,0.64,1)' : 'none',
            }}
          >
            <span
              className="leading-none select-none"
              style={{ fontSize: '5rem' }}
              aria-hidden="true"
            >
              {done ? '✓' : ingredient.emoji}
            </span>
          </div>

          {!done && (
            <span className="text-toddler-xs font-display font-900 text-ink-soft mt-1">
              Tap! {count}/{quantity}
            </span>
          )}

          {done && (
            <span className="text-toddler-xs font-display font-900 text-white mt-1">
              Bagus! ✓
            </span>
          )}
        </button>
      </div>

      {/* ── Keyframes ────────────────────────────────────────────── */}
      <style>{`
        @keyframes tapBounce {
          0%   { transform: scale(0.8); }
          60%  { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
