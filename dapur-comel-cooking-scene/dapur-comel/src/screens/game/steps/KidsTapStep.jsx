/**
 * KidsTapStep.jsx — Ultra-simple tap step for toddlers (2-3 years)
 *
 * Design principles:
 *   - ONE big tap target (min 120px)
 *   - Immediate visual feedback on every tap
 *   - Big bounce animation on success
 *   - Clear "Ketuk!" instruction with finger emoji
 *   - Supports CRACK_EGG (2 taps), FRY, BAKE, POUR, FLATTEN_DOUGH (1 tap)
 *   - Shows learning moment (color/shape) after completion
 *
 * Open source assets used:
 *   - Fredoka One font (Google Fonts)
 *   - CSS animations only, no dependencies
 */

import { useState, useCallback, useRef } from 'react'
import { hapticTap, hapticSuccess } from '../../../utils/haptics.js'
import { sfx } from '../../../utils/audio.js'
import { STEP } from '../../../utils/constants.js'
import { LearnCard } from '../../../components/learning/LearnCard.jsx'
import { ColorSpot } from '../../../components/learning/ColorSpot.jsx'
import { ShapeTeach } from '../../../components/learning/ShapeTeach.jsx'

const STEP_CONFIG = {
  [STEP.CRACK_EGG]:     { tapsNeeded: 2, mainEmoji: '🥚', successEmoji: '💛', bg: '#FFF9EC', borderColor: '#FFD700' },
  [STEP.POUR]:          { tapsNeeded: 1, mainEmoji: '🥛', successEmoji: '💧', bg: '#F0F8FF', borderColor: '#87CEEB' },
  [STEP.STIR]:          { tapsNeeded: 3, mainEmoji: '🥄', successEmoji: '🌀', bg: '#FFF0F8', borderColor: '#E8527A' },
  [STEP.FRY]:           { tapsNeeded: 1, mainEmoji: '🍳', successEmoji: '🔥', bg: '#FFF8EC', borderColor: '#FF8C5A' },
  [STEP.BAKE]:          { tapsNeeded: 1, mainEmoji: '🔥', successEmoji: '✨', bg: '#FFF4E0', borderColor: '#FF6B00' },
  [STEP.FLATTEN_DOUGH]: { tapsNeeded: 2, mainEmoji: '🫓', successEmoji: '⭕', bg: '#FFFBF0', borderColor: '#DEB887' },
  [STEP.SPREAD_SAUCE]:  { tapsNeeded: 2, mainEmoji: '🍅', successEmoji: '❤️', bg: '#FFF5F5', borderColor: '#FF4500' },
  [STEP.ADD_TOPPINGS]:  { tapsNeeded: 3, mainEmoji: '🧀', successEmoji: '⭐', bg: '#FFFFF0', borderColor: '#FFD700' },
  [STEP.STACK]:         { tapsNeeded: 4, mainEmoji: '🍔', successEmoji: '🌟', bg: '#FFF8EC', borderColor: '#C4521E' },
  [STEP.DECORATE]:      { tapsNeeded: 2, mainEmoji: '🎨', successEmoji: '✨', bg: '#FFF0F8', borderColor: '#E8527A' },
}

function TapTarget({ emoji, progress, tapsNeeded, pulsing, onTap }) {
  const pct = tapsNeeded > 0 ? (progress / tapsNeeded) * 100 : 0
  const size = 160

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Progress ring around the big tap button */}
      <div style={{ position: 'relative', width: size + 20, height: size + 20 }}>
        {/* SVG progress ring */}
        <svg
          width={size + 20}
          height={size + 20}
          style={{ position: 'absolute', top: 0, left: 0 }}
          aria-hidden="true"
        >
          <circle
            cx={(size + 20) / 2}
            cy={(size + 20) / 2}
            r={(size + 4) / 2}
            fill="none"
            stroke="rgba(255,200,100,0.2)"
            strokeWidth="8"
          />
          <circle
            cx={(size + 20) / 2}
            cy={(size + 20) / 2}
            r={(size + 4) / 2}
            fill="none"
            stroke="#FF8C5A"
            strokeWidth="8"
            strokeDasharray={`${Math.PI * (size + 4)} ${Math.PI * (size + 4)}`}
            strokeDashoffset={Math.PI * (size + 4) * (1 - pct / 100)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.3s ease', transformOrigin: 'center', transform: 'rotate(-90deg)' }}
          />
        </svg>

        {/* The actual button */}
        <button
          type="button"
          onPointerUp={onTap}
          style={{
            position:       'absolute',
            top:             10,
            left:            10,
            width:           size,
            height:          size,
            borderRadius:   '50%',
            background:     '#fff',
            border:         'none',
            boxShadow:      pulsing
              ? '0 0 0 16px rgba(255,140,90,0.15), 0 8px 32px rgba(255,140,90,0.3)'
              : '0 8px 32px rgba(0,0,0,0.12)',
            cursor:         'pointer',
            touchAction:    'manipulation',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       '5rem',
            lineHeight:      1,
            animation:      pulsing ? 'kidsPulse 1.5s ease-in-out infinite' : 'none',
            transition:     'box-shadow 0.2s ease',
          }}
          aria-label={`Ketuk ${emoji}`}
        >
          {emoji}
        </button>
      </div>

      {/* Tap dots progress */}
      {tapsNeeded > 1 && (
        <div style={{ display: 'flex', gap: 10 }}>
          {Array.from({ length: tapsNeeded }, (_, i) => (
            <div
              key={i}
              style={{
                width:        i < progress ? 36 : 24,
                height:       i < progress ? 36 : 24,
                borderRadius: '50%',
                background:   i < progress
                  ? 'linear-gradient(135deg, #FF8C5A, #E8527A)'
                  : 'rgba(61,43,31,0.12)',
                transition:  'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                display:     'flex',
                alignItems:  'center',
                justifyContent:'center',
                fontSize:    '1rem',
              }}
              aria-hidden="true"
            >
              {i < progress ? '✓' : ''}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function KidsTapStep({ recipe, step, onComplete }) {
  const cfg = STEP_CONFIG[step.type] ?? STEP_CONFIG[STEP.FRY]
  const tapsNeeded = cfg.tapsNeeded

  const [tapCount,       setTapCount]       = useState(0)
  const [done,           setDone]           = useState(false)
  const [particles,      setParticles]      = useState([])
  const [showLearnColor, setShowLearnColor] = useState(false)
  const [showLearnShape, setShowLearnShape] = useState(false)
  const completingRef = useRef(false)

  const spawnParticles = useCallback((emojis) => {
    setParticles(emojis.map((e, i) => ({ id: Date.now() + i, emoji: e })))
    setTimeout(() => setParticles([]), 700)
  }, [])

  const handleTap = useCallback(() => {
    if (done || completingRef.current) return
    hapticTap()
    sfx.play(step.sfx ?? 'pop')

    const next = tapCount + 1
    setTapCount(next)

    const successEmojis = Array.from({ length: 5 }, () => cfg.successEmoji)
    spawnParticles(successEmojis)

    if (next >= tapsNeeded && !completingRef.current) {
      completingRef.current = true
      hapticSuccess()
      setDone(true)

      // Show educational moment based on step data
      const hasColor = step.learn?.colorHex
      const hasShape = step.learn?.shape

      if (hasColor && !hasShape) {
        setTimeout(() => setShowLearnColor(true), 300)
      } else if (hasShape) {
        setTimeout(() => setShowLearnShape(true), 300)
      } else {
        setTimeout(onComplete, 600)
      }
    }
  }, [tapCount, tapsNeeded, done, step, cfg, spawnParticles, onComplete])

  const handleLearnDone = useCallback(() => {
    setShowLearnColor(false)
    setShowLearnShape(false)
    onComplete()
  }, [onComplete])

  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      width:         '100%',
      height:        '100%',
      padding:       '12px 16px',
      gap:            12,
    }}>
      {/* Prompt card */}
      <div style={{
        background:     'rgba(255,252,240,0.95)',
        borderRadius:    20,
        padding:        '12px 20px',
        boxShadow:      '0 4px 20px rgba(80,40,10,0.14)',
        border:         '2px solid rgba(255,210,120,0.4)',
        textAlign:      'center',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}>
        <p style={{
          fontFamily: "'Fredoka One', 'Nunito', sans-serif",
          fontWeight:  900,
          fontSize:   '1.5rem',
          color:      '#3D2B1F',
          margin:      0,
          lineHeight:  1.2,
        }}>
          {step.label} {step.emoji}
        </p>
      </div>

      {/* Main interaction area */}
      <div style={{
        flex:           1,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        position:       'relative',
      }}>
        {!done ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <TapTarget
              emoji={cfg.mainEmoji}
              progress={tapCount}
              tapsNeeded={tapsNeeded}
              pulsing={true}
              onTap={handleTap}
            />

            {/* "Ketuk!" hint with finger pointer */}
            <p style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight:  800,
              fontSize:   '1.2rem',
              color:      'rgba(61,43,31,0.55)',
              margin:      0,
              animation:  'fingerBounce 1s ease-in-out infinite',
            }}>
              👆 Ketuk sini!
            </p>
          </div>
        ) : (
          /* Success state */
          <div style={{
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            gap:            16,
            animation:     'kidsBigPop 0.5s cubic-bezier(0.34,1.7,0.64,1)',
          }}>
            <div style={{ fontSize: '6rem', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))' }}>
              {cfg.mainEmoji}
            </div>
            {step.encouragement && (
              <div style={{
                fontFamily: "'Fredoka One', 'Nunito', sans-serif",
                fontSize:   '1.4rem',
                fontWeight:  900,
                color:      '#FF8C5A',
                textAlign:  'center',
                padding:    '0 16px',
              }}>
                {step.encouragement}
              </div>
            )}
          </div>
        )}

        {/* Burst particles */}
        {particles.map((p, i) => (
          <span
            key={p.id}
            aria-hidden="true"
            style={{
              position:   'absolute',
              fontSize:   '1.8rem',
              top:        '50%',
              left:       '50%',
              transform:  `translate(-50%,-50%)`,
              '--tx':     `${(Math.random() - 0.5) * 140}px`,
              '--ty':     `${-(Math.random() * 100 + 40)}px`,
              animation:  `burst 0.6s ease-out forwards ${i * 0.04}s`,
              pointerEvents:'none',
            }}
          >
            {p.emoji}
          </span>
        ))}
      </div>

      {/* Color learning overlay */}
      {showLearnColor && step.learn?.colorHex && (
        <LearnCard
          type="color"
          word={step.learn.color}
          colorHex={step.learn.colorHex}
          emoji={step.learn.emoji}
          onDismiss={handleLearnDone}
        />
      )}

      {/* Shape learning overlay */}
      {showLearnShape && step.learn?.shape && (
        <LearnCard
          type="shape"
          word={step.learn?.word ?? 'Bulatan'}
          emoji={step.learn?.emoji ?? '⭕'}
          onDismiss={handleLearnDone}
        />
      )}

      <style>{`
        @keyframes kidsPulse {
          0%,100% { transform: scale(1); box-shadow: 0 8px 32px rgba(255,140,90,0.2); }
          50%      { transform: scale(1.06); box-shadow: 0 0 0 20px rgba(255,140,90,0.1), 0 8px 32px rgba(255,140,90,0.3); }
        }
        @keyframes fingerBounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes kidsBigPop {
          0%   { transform: scale(0.4) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
