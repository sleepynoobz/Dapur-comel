/**
 * CelebStage.jsx — Educational celebration for toddlers (2-3 years)
 *
 * Improvements:
 *   - canvas-confetti (open source) for better confetti
 *   - "Hari Ini Kamu Belajar!" summary showing what they learned
 *   - Fredoka One font for bigger, rounder text
 *   - Oyen jumps and spins with CSS animation
 *   - Larger buttons for easy toddler interaction
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { StickerPopup }   from '../../../components/ui/StickerPopup.jsx'
import { BigButton }      from '../../../components/ui/BigButton.jsx'
import { Oyen }           from '../../../components/mascot/Oyen.jsx'
import { GameSprite }     from '../../../components/ui/GameSprite.jsx'
import { useVoiceContext, useGameContext, useProgressContext } from '../../../App.jsx'
import { OYEN_EXPRESSION } from '../../../utils/constants.js'
import confetti from 'canvas-confetti'

// What was learned per recipe
const RECIPE_LEARNING = {
  pancake: {
    color:  { name: 'Kuning',       hex: '#FFD700', emoji: '🟡' },
    shape:  { name: 'Bulatan',       emoji: '⭕' },
    number: { value: 1, word: 'Satu' },
  },
  cake: {
    color:  { name: 'Merah Jambu',  hex: '#FF69B4', emoji: '🩷' },
    shape:  { name: 'Bulatan',       emoji: '⭕' },
    number: { value: 2, word: 'Dua' },
  },
  pizza: {
    color:  { name: 'Merah',        hex: '#FF4500', emoji: '🔴' },
    shape:  { name: 'Bulatan',       emoji: '⭕' },
    number: { value: 3, word: 'Tiga' },
  },
  burger: {
    color:  { name: 'Perang',       hex: '#8B4513', emoji: '🟫' },
    shape:  { name: 'Bulatan',       emoji: '⭕' },
    number: { value: 2, word: 'Dua' },
  },
}

function LaunchConfetti() {
  confetti({
    particleCount: 100,
    spread:        130,
    origin:        { x: 0.5, y: 0.55 },
    colors:        ['#FF8C5A', '#E8527A', '#FFD700', '#5EC4B6', '#FF6B35', '#9C27B0'],
    scalar:        1.5,
    gravity:       0.8,
  })
  // Second burst from sides
  setTimeout(() => {
    confetti({ particleCount: 40, angle: 60,  spread: 60, origin: { x: 0 },   colors: ['#FFD700', '#FF8C5A'] })
    confetti({ particleCount: 40, angle: 120, spread: 60, origin: { x: 1 },   colors: ['#5EC4B6', '#E8527A'] })
  }, 250)
}

function LearnSummaryCard({ recipe }) {
  const learn = RECIPE_LEARNING[recipe?.id]
  if (!learn) return null

  return (
    <div style={{
      background:   'rgba(255,252,240,0.98)',
      borderRadius:  24,
      padding:      '16px 20px',
      boxShadow:    '0 8px 32px rgba(80,40,10,0.15)',
      border:       '2px solid rgba(255,200,100,0.5)',
      width:        '100%',
      maxWidth:      320,
    }}>
      <p style={{
        fontFamily:    "'Nunito', sans-serif",
        fontWeight:     800,
        fontSize:      '0.75rem',
        color:         'rgba(61,43,31,0.5)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        margin:        '0 0 12px',
        textAlign:     'center',
      }}>
        📚 Hari Ini Kamu Belajar!
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        {/* Color */}
        <div style={{
          flex:          1,
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          gap:            8,
          background:   'rgba(61,43,31,0.04)',
          borderRadius:  16,
          padding:       '12px 8px',
        }}>
          <div style={{
            width:        48,
            height:       48,
            borderRadius: '50%',
            background:   learn.color.hex,
            boxShadow:    `0 4px 12px ${learn.color.hex}66`,
            display:      'flex',
            alignItems:   'center',
            justifyContent:'center',
            fontSize:     '1.4rem',
          }}>
            {learn.color.emoji}
          </div>
          <p style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontSize: '0.7rem', fontWeight: 700, color: 'rgba(61,43,31,0.45)', textAlign: 'center' }}>Warna</p>
          <p style={{
            margin:     0,
            fontFamily: "'Fredoka One', 'Nunito', sans-serif",
            fontSize:   '1.1rem',
            fontWeight:  900,
            color:      '#3D2B1F',
            textAlign:  'center',
          }}>
            {learn.color.name}
          </p>
        </div>

        {/* Shape */}
        <div style={{
          flex:          1,
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          gap:            8,
          background:   'rgba(61,43,31,0.04)',
          borderRadius:  16,
          padding:       '12px 8px',
        }}>
          <div style={{ lineHeight: 1 }}><GameSprite emoji={learn.shape.emoji} size={48} /></div>
          <p style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontSize: '0.7rem', fontWeight: 700, color: 'rgba(61,43,31,0.45)', textAlign: 'center' }}>Bentuk</p>
          <p style={{
            margin:     0,
            fontFamily: "'Fredoka One', 'Nunito', sans-serif",
            fontSize:   '1.1rem',
            fontWeight:  900,
            color:      '#3D2B1F',
            textAlign:  'center',
          }}>
            {learn.shape.name}
          </p>
        </div>

        {/* Number */}
        <div style={{
          flex:          1,
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          gap:            8,
          background:   'rgba(61,43,31,0.04)',
          borderRadius:  16,
          padding:       '12px 8px',
        }}>
          <div style={{
            width:        48,
            height:       48,
            borderRadius:  12,
            background:   'linear-gradient(135deg, #FF8C5A, #E8527A)',
            display:      'flex',
            alignItems:   'center',
            justifyContent:'center',
            boxShadow:    '0 4px 12px rgba(255,140,90,0.4)',
          }}>
            <span style={{ fontFamily: "'Fredoka One', sans-serif", fontSize: '2rem', color: '#fff', lineHeight: 1 }}>
              {learn.number.value}
            </span>
          </div>
          <p style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontSize: '0.7rem', fontWeight: 700, color: 'rgba(61,43,31,0.45)', textAlign: 'center' }}>Nombor</p>
          <p style={{
            margin:     0,
            fontFamily: "'Fredoka One', 'Nunito', sans-serif",
            fontSize:   '1.1rem',
            fontWeight:  900,
            color:      '#3D2B1F',
            textAlign:  'center',
          }}>
            {learn.number.word}
          </p>
        </div>
      </div>
    </div>
  )
}

export function CelebStage({ recipe, stageConfig, onComplete }) {
  const { speak, isSpeaking }      = useVoiceContext()
  const { playAgain, goHome }      = useGameContext()
  const { awardStars, addSticker } = useProgressContext()

  const [starsVisible,  setStarsVisible]  = useState([false, false, false])
  const [showLearn,     setShowLearn]     = useState(false)
  const [showSticker,   setShowSticker]   = useState(false)
  const [showButtons,   setShowButtons]   = useState(false)
  const [mounted,       setMounted]       = useState(false)
  const [expression,    setExpression]    = useState(OYEN_EXPRESSION.SURPRISED)

  const savedRef    = useRef(false)
  const starsToShow = stageConfig?.starsAwarded ?? 3
  const stickerId   = stageConfig?.stickerReward ?? 'default'

  useEffect(() => {
    if (savedRef.current) return
    savedRef.current = true
    if (recipe?.id) { awardStars(recipe.id, starsToShow); addSticker(stickerId) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const timers = []
    timers.push(setTimeout(() => setExpression(OYEN_EXPRESSION.PROUD), 400))
    timers.push(setTimeout(() => setExpression(OYEN_EXPRESSION.EXCITED), 1200))
    timers.push(setTimeout(() => speak('celebrate.main'), 300))

    // Launch confetti
    timers.push(setTimeout(() => LaunchConfetti(), 500))

    // Reveal stars
    for (let i = 0; i < starsToShow; i++) {
      timers.push(setTimeout(() => {
        setStarsVisible(prev => { const n = [...prev]; n[i] = true; return n })
      }, 1400 + i * 300))
    }

    // Show learning summary
    timers.push(setTimeout(() => setShowLearn(true), 2800))

    // Show sticker
    timers.push(setTimeout(() => setShowSticker(true), 4200))

    // Show buttons
    timers.push(setTimeout(() => setShowButtons(true), 5800))

    return () => timers.forEach(clearTimeout)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStickerDismiss = useCallback(() => {
    setShowSticker(false)
    if (!showButtons) setShowButtons(true)
  }, [showButtons])

  const foodEmoji = { pancake: '🥞', cake: '🎂', pizza: '🍕', burger: '🍔' }[recipe?.id] ?? '🍽️'

  return (
    <div
      className="relative flex flex-col items-center w-full h-full px-5 pt-4 pb-6 gap-3 overflow-hidden"
      style={{ background: 'linear-gradient(175deg, #FFFDE0, #FFF8EC, #FFF0D6)' }}
    >
      {/* Oyen — animated */}
      <div style={{
        opacity:    mounted ? 1 : 0,
        transform:  mounted ? 'scale(1)' : 'scale(0.6)',
        transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.5,0.64,1)',
        animation:  mounted ? 'oyenJump 1.8s ease-in-out 0.8s 3' : 'none',
      }}>
        <Oyen expression={expression} size="lg" isSpeaking={isSpeaking} />
      </div>

      {/* Headline */}
      <div
        className="text-center"
        style={{
          opacity:    mounted ? 1 : 0,
          transform:  mounted ? 'none' : 'translateY(20px)',
          transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
        }}
      >
        <h2 style={{
          fontFamily: "'Fredoka One', 'Nunito', sans-serif",
          fontSize:   '3rem',
          fontWeight:  900,
          background: 'linear-gradient(135deg, #FF8C5A, #E8527A, #FFD700)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin:      0,
          lineHeight:  1.1,
        }}>
          Tahniah! 🎉
        </h2>
        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize:   '1.1rem',
          fontWeight:  700,
          color:      'rgba(61,43,31,0.6)',
          margin:     '4px 0 0',
        }}>
          {recipe?.name ?? 'Makanan'} dah siap!{' '}
          <GameSprite emoji={foodEmoji} size={24} style={{ verticalAlign: 'middle' }} />
        </p>
      </div>

      {/* Stars */}
      <div
        style={{
          display:    'flex',
          gap:         12,
          opacity:     mounted ? 1 : 0,
          transition: 'opacity 0.4s ease 0.2s',
        }}
        aria-label={`${starsToShow} bintang`}
      >
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              lineHeight:  1,
              opacity:    i < starsToShow ? 1 : 0.15,
              filter:     starsVisible[i] ? 'drop-shadow(0 0 12px rgba(255,215,0,0.9))' : 'none',
              transform:  starsVisible[i] ? 'scale(1.3)' : 'scale(0.7)',
              transition: 'transform 0.4s cubic-bezier(0.34,1.7,0.64,1), filter 0.4s ease',
              display:    'inline-block',
            }}
            aria-hidden="true"
          >
            <GameSprite name="star" size={44} />
          </span>
        ))}
      </div>

      {/* Learning summary */}
      {showLearn && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center',
                      animation: 'celebSlideUp 0.4s cubic-bezier(0.34,1.4,0.64,1)' }}>
          <LearnSummaryCard recipe={recipe} />
        </div>
      )}

      {/* Action buttons */}
      {showButtons && (
        <div
          style={{
            display:       'flex',
            flexDirection: 'column',
            gap:            10,
            width:         '100%',
            maxWidth:       300,
            animation:     'celebSlideUp 0.4s cubic-bezier(0.34,1.4,0.64,1)',
          }}
        >
          <button
            type="button"
            onClick={playAgain}
            style={{
              width:        '100%',
              height:        72,
              borderRadius:  20,
              background:   'linear-gradient(135deg, #FF8C5A, #E8527A)',
              border:       'none',
              boxShadow:    '0 5px 0 #C02858',
              fontFamily:   "'Fredoka One', 'Nunito', sans-serif",
              fontSize:     '1.4rem',
              fontWeight:    900,
              color:        '#fff',
              cursor:       'pointer',
              touchAction:  'manipulation',
              display:      'inline-flex',
              alignItems:   'center',
              justifyContent:'center',
              gap:           8,
            }}
          >
            <GameSprite emoji="🍳" size={28} /> Masak Lagi!
          </button>
          <button
            type="button"
            onClick={goHome}
            style={{
              width:        '100%',
              height:        60,
              borderRadius:  16,
              background:   'rgba(61,43,31,0.07)',
              border:       'none',
              fontFamily:   "'Nunito', sans-serif",
              fontSize:     '1rem',
              fontWeight:    800,
              color:        'rgba(61,43,31,0.6)',
              cursor:       'pointer',
              touchAction:  'manipulation',
            }}
          >
            Balik Rumah
          </button>
        </div>
      )}

      {showSticker && <StickerPopup stickerId={stickerId} onDismiss={handleStickerDismiss} />}

      <style>{`
        @keyframes oyenJump {
          0%,100% { transform: translateY(0) scale(1); }
          30%      { transform: translateY(-18px) scale(1.05); }
          55%      { transform: translateY(-4px) scale(1.02); }
        }
        @keyframes celebSlideUp {
          from { transform: translateY(24px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}
