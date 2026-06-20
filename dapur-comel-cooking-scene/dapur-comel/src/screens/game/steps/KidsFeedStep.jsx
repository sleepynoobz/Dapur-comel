/**
 * KidsFeedStep.jsx — Simple "Feed Oyen" final step for toddlers
 *
 * Child taps the food plate to feed Oyen.
 * Oyen grows bigger and says thank you with big animation.
 * Immediately leads to celebration.
 */

import { useState, useCallback, useRef } from 'react'
import { hapticTap, hapticSuccess } from '../../../utils/haptics.js'
import { sfx } from '../../../utils/audio.js'
import confetti from 'canvas-confetti'
import { Oyen } from '../../../components/mascot/Oyen.jsx'
import { GameSprite } from '../../../components/ui/GameSprite.jsx'
import { OYEN_EXPRESSION } from '../../../utils/constants.js'

const FOOD_EMOJI = {
  pancake:        '🥞',
  cake:           '🎂',
  'kek-strawberi':'🍰',
  pizza:          '🍕',
  burger:         '🍔',
  biskut:         '🍪',
}

const PHASE_EXPRESSION = {
  idle:   OYEN_EXPRESSION.HAPPY,
  eating: OYEN_EXPRESSION.EXCITED,
  happy:  OYEN_EXPRESSION.PROUD,
}

export function KidsFeedStep({ recipe, step, onComplete }) {
  const [phase, setPhase] = useState('idle')
  const completingRef = useRef(false)

  const launchConfetti = useCallback(() => {
    confetti({
      particleCount: 80,
      spread:        100,
      origin:        { x: 0.5, y: 0.6 },
      colors:        ['#FF8C5A', '#E8527A', '#FFD700', '#5EC4B6', '#FF6B35'],
      scalar:        1.4,
    })
  }, [])

  const handleFeed = useCallback(() => {
    if (completingRef.current) return
    hapticTap()
    sfx.play('munch')
    setPhase('eating')

    setTimeout(() => {
      completingRef.current = true
      hapticSuccess()
      sfx.play('sparkle')
      setPhase('happy')
      launchConfetti()
      setTimeout(onComplete, 1200)
    }, 800)
  }, [launchConfetti, onComplete])

  const foodEmoji = FOOD_EMOJI[recipe?.id] ?? '🍽️'

  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      width:          '100%',
      height:         '100%',
      padding:        '12px 16px',
      gap:             12,
    }}>
      {/* Prompt */}
      <div style={{
        background:     'rgba(255,252,240,0.95)',
        borderRadius:    20,
        padding:        '12px 20px',
        boxShadow:      '0 4px 20px rgba(80,40,10,0.14)',
        border:         '2px solid rgba(255,210,120,0.4)',
        textAlign:      'center',
      }}>
        <p style={{
          fontFamily: "'Fredoka One', 'Nunito', sans-serif",
          fontWeight:  900,
          fontSize:   '1.5rem',
          color:      '#3D2B1F',
          margin:      0,
        }}>
          {step.label} 😸
        </p>
      </div>

      {/* Main interaction */}
      <div style={{
        flex:           1,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:             24,
      }}>
        {/* Oyen — grows when fed */}
        <div style={{
          transition: 'transform 0.4s cubic-bezier(0.34,1.7,0.64,1)',
          transform:   phase === 'happy' ? 'scale(1.25)' : 'scale(1)',
          animation:  phase === 'eating' ? 'oyenEat 0.4s ease-in-out' : undefined,
        }}>
          <Oyen expression={PHASE_EXPRESSION[phase] ?? OYEN_EXPRESSION.HAPPY} size="lg" />
        </div>

        {/* Arrow pointing down */}
        {phase === 'idle' && (
          <div style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight:  800,
            fontSize:   '1rem',
            color:      'rgba(61,43,31,0.4)',
            animation:  'arrowBounce 1s ease-in-out infinite',
          }}>
            ↑ Oyen lapar! ↑
          </div>
        )}

        {/* Food plate — the tap target */}
        {phase === 'idle' || phase === 'eating' ? (
          <button
            type="button"
            onPointerUp={handleFeed}
            style={{
              width:          140,
              height:         140,
              borderRadius:  '50%',
              background:    'white',
              border:        '4px solid rgba(255,200,100,0.5)',
              boxShadow:     '0 8px 32px rgba(0,0,0,0.12), 0 0 0 12px rgba(255,200,100,0.15)',
              cursor:        'pointer',
              touchAction:   'manipulation',
              display:       'flex',
              alignItems:    'center',
              justifyContent:'center',
              lineHeight:     1,
              animation:     phase === 'idle' ? 'foodPulse 1.5s ease-in-out infinite' : 'none',
              transition:    'transform 0.1s ease',
            }}
            onPointerDown={e => { e.currentTarget.style.transform = 'scale(0.9)' }}
            aria-label="Bagi makan Oyen"
          >
            <GameSprite emoji={foodEmoji} size={84} />
          </button>
        ) : (
          /* Happy result */
          <div style={{
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            gap:            12,
            animation:     'kidsBigPop 0.5s cubic-bezier(0.34,1.7,0.64,1)',
          }}>
            <div style={{
              fontFamily: "'Fredoka One', 'Nunito', sans-serif",
              fontSize:   '1.8rem',
              fontWeight:  900,
              color:      '#FF8C5A',
              textAlign:  'center',
            }}>
              Terima Kasih! 🌟
            </div>
            <div style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize:   '1rem',
              fontWeight:  700,
              color:      'rgba(61,43,31,0.5)',
            }}>
              Oyen suka sangat!
            </div>
          </div>
        )}

        {/* Tap hint */}
        {phase === 'idle' && (
          <p style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight:  800,
            fontSize:   '1.1rem',
            color:      'rgba(61,43,31,0.45)',
            margin:      0,
            animation:  'fingerBounce 1s ease-in-out infinite',
          }}>
            👆 Ketuk makanan!
          </p>
        )}
      </div>

      <style>{`
        @keyframes foodPulse {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.08); }
        }
        @keyframes arrowBounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes fingerBounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes oyenEat {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.2) rotate(-5deg); }
        }
        @keyframes kidsBigPop {
          0%   { transform: scale(0.4); opacity: 0; }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
