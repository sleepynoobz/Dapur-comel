/**
 * KidsTapStep.jsx — gesture-driven cooking step shell for toddlers (2-3 years)
 *
 * The ActionStage renders the interactive scene (knife slicing, real
 * stirring, drag & drop stacking…) and reports each completed sub-goal
 * via onUnit. This shell keeps score, plays sfx/haptics, shows the
 * gesture hint, progress dots, encouragement and the learning overlay.
 */

import { useState, useCallback, useRef } from 'react'
import { hapticTap, hapticSuccess } from '../../../utils/haptics.js'
import { sfx } from '../../../utils/audio.js'
import { STEP } from '../../../utils/constants.js'
import { LearnCard } from '../../../components/learning/LearnCard.jsx'
import { GameSprite } from '../../../components/ui/GameSprite.jsx'
import { ActionStage } from './ActionStage.jsx'

const STEP_CONFIG = {
  [STEP.SLICE]:         { units: 4, successEmoji: '🔪' },
  [STEP.CRACK_EGG]:     { units: 2, successEmoji: '💛' },
  [STEP.POUR]:          { units: 1, successEmoji: '💧' },
  [STEP.STIR]:          { units: 3, successEmoji: '🌀' },
  [STEP.FRY]:           { units: 1, successEmoji: '🔥' },
  [STEP.BAKE]:          { units: 1, successEmoji: '✨' },
  [STEP.FLATTEN_DOUGH]: { units: 2, successEmoji: '⭕' },
  [STEP.SPREAD_SAUCE]:  { units: 2, successEmoji: '❤️' },
  [STEP.ADD_TOPPINGS]:  { units: 3, successEmoji: '⭐' },
  [STEP.STACK]:         { units: 4, successEmoji: '🌟' },
  [STEP.DECORATE]:      { units: 2, successEmoji: '✨' },
}

// What the toddler should DO, per gesture
const GESTURE_HINT = {
  [STEP.SLICE]:         '🔪 Sapu ke bawah untuk potong!',
  [STEP.CRACK_EGG]:     '🥚 Tarik telur ke mangkuk!',
  [STEP.POUR]:          '👇 Tekan & tahan untuk tuang!',
  [STEP.STIR]:          '🌀 Pusing-pusing jari!',
  [STEP.FRY]:           '⬆️ Sapu ke atas untuk terbalik!',
  [STEP.BAKE]:          '🎂 Tarik kek masuk oven!',
  [STEP.FLATTEN_DOUGH]: '↔️ Gerakkan penggiling kiri-kanan!',
  [STEP.SPREAD_SAUCE]:  '🖐️ Gosok sos atas pizza!',
  [STEP.ADD_TOPPINGS]:  '👇 Tarik topping ke pizza!',
  [STEP.STACK]:         '👇 Tarik ke atas burger!',
  [STEP.DECORATE]:      '↔️ Sapu sos kiri-kanan!',
}

export function KidsTapStep({ recipe, step, onComplete }) {
  const cfg = STEP_CONFIG[step.type] ?? STEP_CONFIG[STEP.FRY]
  const unitsTotal = cfg.units

  const [unitsDone,      setUnitsDone]      = useState(0)
  const [done,           setDone]           = useState(false)
  const [particles,      setParticles]      = useState([])
  const [showLearnColor, setShowLearnColor] = useState(false)
  const [showLearnShape, setShowLearnShape] = useState(false)
  const completingRef = useRef(false)

  const spawnParticles = useCallback((emojis) => {
    setParticles(emojis.map((e, i) => ({ id: Date.now() + i, emoji: e })))
    setTimeout(() => setParticles([]), 700)
  }, [])

  const handleUnit = useCallback(() => {
    if (done || completingRef.current) return
    hapticTap()
    sfx.play(step.sfx ?? 'pop')

    setUnitsDone(prev => {
      const next = prev + 1

      const successEmojis = Array.from({ length: 5 }, () => cfg.successEmoji)
      spawnParticles(successEmojis)

      if (next >= unitsTotal && !completingRef.current) {
        completingRef.current = true
        hapticSuccess()
        setDone(true)

        const hasColor = step.learn?.colorHex
        const hasShape = step.learn?.shape

        // Let the finishing action animation play out before the overlay.
        if (hasColor && !hasShape) {
          setTimeout(() => setShowLearnColor(true), 1400)
        } else if (hasShape) {
          setTimeout(() => setShowLearnShape(true), 1400)
        } else {
          setTimeout(onComplete, 1700)
        }
      }
      return next
    })
  }, [unitsTotal, done, step, cfg, spawnParticles, onComplete])

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
          display:     'inline-flex',
          alignItems:  'center',
          justifyContent: 'center',
          gap:          8,
        }}>
          <span>{step.label}</span>
          <GameSprite emoji={step.emoji} size={32} />
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%' }}>
          {/* Interactive cooking scene — gesture-driven */}
          <ActionStage
            type={step.type}
            recipeId={recipe?.id}
            unitsDone={unitsDone}
            unitsTotal={unitsTotal}
            done={done}
            onUnit={handleUnit}
          />

          {/* Progress dots */}
          {unitsTotal > 1 && !done && (
            <div style={{ display: 'flex', gap: 10 }}>
              {Array.from({ length: unitsTotal }, (_, i) => (
                <div
                  key={i}
                  style={{
                    width:        i < unitsDone ? 32 : 22,
                    height:       i < unitsDone ? 32 : 22,
                    borderRadius: '50%',
                    background:   i < unitsDone
                      ? 'linear-gradient(135deg, #FF8C5A, #E8527A)'
                      : 'rgba(61,43,31,0.14)',
                    transition:  'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                    display:     'flex',
                    alignItems:  'center',
                    justifyContent: 'center',
                    fontSize:    '0.9rem',
                    color:       '#fff',
                  }}
                  aria-hidden="true"
                >
                  {i < unitsDone ? '✓' : ''}
                </div>
              ))}
            </div>
          )}

          {!done ? (
            <p style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight:  800,
              fontSize:   '1.15rem',
              color:      'rgba(61,43,31,0.6)',
              margin:      0,
              textAlign:  'center',
              animation:  'fingerBounce 1s ease-in-out infinite',
            }}>
              {GESTURE_HINT[step.type] ?? '👆 Ketuk sini!'}
            </p>
          ) : (
            step.encouragement && (
              <div style={{
                fontFamily: "'Fredoka One', 'Nunito', sans-serif",
                fontSize:   '1.35rem',
                fontWeight:  900,
                color:      '#FF8C5A',
                textAlign:  'center',
                padding:    '0 16px',
                animation:  'kidsBigPop 0.5s cubic-bezier(0.34,1.7,0.64,1)',
              }}>
                {step.encouragement}
              </div>
            )
          )}
        </div>

        {/* Burst particles */}
        {particles.map((p, i) => (
          <span
            key={p.id}
            aria-hidden="true"
            style={{
              position:   'absolute',
              top:        '50%',
              left:       '50%',
              transform:  `translate(-50%,-50%)`,
              '--tx':     `${(Math.random() - 0.5) * 140}px`,
              '--ty':     `${-(Math.random() * 100 + 40)}px`,
              animation:  `burst 0.6s ease-out forwards ${i * 0.04}s`,
              pointerEvents:'none',
            }}
          >
            <GameSprite emoji={p.emoji} size={30} />
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
