/**
 * RecipeSelectScreen.jsx — Toddler-optimized for ages 2-3
 *
 * Changes:
 *   - Bigger recipe cards (easier tap targets)
 *   - Difficulty shown as ⭐⭐⭐ instead of step count
 *   - Color badge shows the main color to learn
 *   - Simple 1-word descriptions
 *   - Fredoka One font for card titles
 */

import { useEffect, useRef, useCallback, useState, memo } from 'react'
import { Oyen }         from '../components/mascot/Oyen.jsx'
import { GameSprite }   from '../components/ui/GameSprite.jsx'
import { KitchenScene } from '../components/ui/KitchenScene.jsx'
import { ParentGate }   from '../components/gates/ParentGate.jsx'
import {
  useVoiceContext, useGameContext, useProgressContext,
} from '../App.jsx'
import { OYEN_EXPRESSION } from '../utils/constants.js'
import { sfx } from '../utils/audio.js'

const RECIPE_CARDS = [
  {
    id:         'pancake',
    name:       'Pancake',
    emoji:      '🥞',
    color:      '#FFB347',
    accent:     '#E8840A',
    bg:         'linear-gradient(160deg, #FFF9F0 0%, #FFE8CC 100%)',
    difficulty: 1,
    desc:       'Goreng & Makan! 🍳',
    learnColor: { name: 'Kuning', hex: '#FFD700', emoji: '🟡' },
  },
  {
    id:         'cake',
    name:       'Kek',
    emoji:      '🎂',
    color:      '#E8527A',
    accent:     '#C02858',
    bg:         'linear-gradient(160deg, #FFF0F4 0%, #FFD8E8 100%)',
    difficulty: 2,
    desc:       'Bakar & Hias! 🎉',
    learnColor: { name: 'Merah Jambu', hex: '#FF69B4', emoji: '🩷' },
  },
  {
    id:         'pizza',
    name:       'Pizza',
    emoji:      '🍕',
    color:      '#FF6B35',
    accent:     '#CC3A00',
    bg:         'linear-gradient(160deg, #FFF8F0 0%, #FFE0C8 100%)',
    difficulty: 2,
    desc:       'Bulat & Sedap! ⭕',
    learnColor: { name: 'Merah', hex: '#FF4500', emoji: '🔴' },
  },
  {
    id:         'burger',
    name:       'Burger',
    emoji:      '🍔',
    color:      '#C4521E',
    accent:     '#8B2800',
    bg:         'linear-gradient(160deg, #FFF8EC 0%, #FFE4C0 100%)',
    difficulty: 3,
    desc:       'Susun Lapis! 🍔',
    learnColor: { name: 'Perang', hex: '#8B4513', emoji: '🟫' },
  },
]


function DifficultyStars({ count }) {
  return (
    <div style={{ display: 'flex', gap: 2 }} aria-label={`Tahap ${count}`}>
      {[1, 2, 3].map(n => (
        <span key={n} style={{ fontSize: '0.85rem', opacity: n <= count ? 1 : 0.2 }} aria-hidden="true">⭐</span>
      ))}
    </div>
  )
}

export function RecipeSelectScreen() {
  const { isSpeaking }                         = useVoiceContext()
  const { selectRecipe, goHome, openSettings } = useGameContext()
  const { getStarsForRecipe }                  = useProgressContext()

  const [expression, setExpression] = useState(OYEN_EXPRESSION.CHEEKY)
  const [activeCard, setActiveCard] = useState(null)
  const [mounted,    setMounted]    = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  const handlePress = useCallback((id) => {
    setActiveCard(id)
    setExpression(OYEN_EXPRESSION.EXCITED)
    sfx.play('pop')
  }, [])

  const handleRelease = useCallback((id) => {
    if (activeCard !== id) return
    setActiveCard(null)
    selectRecipe(id)
  }, [activeCard, selectRecipe])

  const handleCancel = useCallback(() => {
    setActiveCard(null)
    setExpression(OYEN_EXPRESSION.CHEEKY)
  }, [])

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden select-none">

      <KitchenScene className="absolute inset-0" />

      {/* Parent gate */}
      <div className="absolute top-0 right-0 z-50">
        <ParentGate onUnlock={openSettings}><div className="w-12 h-12" /></ParentGate>
      </div>

      {/* Oyen header */}
      <div
        className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-2"
        style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.2s ease' }}
      >
        <Oyen expression={expression} size="sm" isSpeaking={isSpeaking}
              onClick={() => setExpression(OYEN_EXPRESSION.CHEEKY)} />
        <div className="game-prompt flex-1">
          <span style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize:   '1.1rem',
            fontWeight:  900,
            color:      'rgba(61,43,31,0.85)',
          }}>
            Nak masak apa? 🤔
          </span>
        </div>
      </div>

      {/* Recipe grid — 2×2, bigger cards */}
      <div className="relative z-10 flex-1 grid grid-cols-2 gap-3 px-4 py-1">
        {RECIPE_CARDS.map((card, i) => {
          const stars   = getStarsForRecipe?.(card.id) ?? 0
          const pressed = activeCard === card.id

          return (
            <div
              key={card.id}
              className="relative flex flex-col items-center justify-between overflow-hidden"
              style={{
                background:         card.bg,
                borderRadius:        24,
                boxShadow:          pressed
                  ? `0 2px 0 ${card.accent}, 0 4px 16px rgba(0,0,0,0.18)`
                  : `0 8px 0 ${card.accent}, 0 12px 32px rgba(0,0,0,0.22)`,
                border:             `2px solid ${card.color}55`,
                backdropFilter:     'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                transform:          pressed
                  ? 'translateY(6px) scale(0.97)'
                  : mounted ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.93)',
                opacity:            mounted ? 1 : 0,
                transition:         mounted
                  ? `transform 80ms ease, box-shadow 80ms ease, opacity 0.28s ease ${i * 0.07}s`
                  : `opacity 0.28s ease ${i * 0.07}s, transform 0.35s cubic-bezier(0.34,1.3,0.64,1) ${i * 0.07}s`,
                touchAction:        'manipulation',
                cursor:             'pointer',
                minHeight:           170,
              }}
              onPointerDown={e => { if (e.isPrimary) handlePress(card.id) }}
              onPointerUp={e   => { if (e.isPrimary) handleRelease(card.id) }}
              onPointerLeave={handleCancel}
              onPointerCancel={handleCancel}
              role="button"
              aria-label={`${card.name}: ${card.desc}`}
            >
              {/* Stars earned */}
              {stars > 0 && (
                <div className="absolute top-2 right-2 flex gap-0.5">
                  {[1, 2, 3].map(n => (
                    <span key={n} style={{ fontSize: '0.75rem', opacity: n <= stars ? 1 : 0.15 }} aria-hidden="true">⭐</span>
                  ))}
                </div>
              )}

              {/* Color learn badge */}
              <div style={{
                position:   'absolute',
                top:         8,
                left:        8,
                width:       20,
                height:      20,
                borderRadius:'50%',
                background:  card.learnColor.hex,
                boxShadow:  `0 2px 6px ${card.learnColor.hex}88`,
                border:     '2px solid rgba(255,255,255,0.8)',
                display:    'flex',
                alignItems: 'center',
                justifyContent:'center',
                fontSize:   '0.7rem',
              }} title={`Belajar warna ${card.learnColor.name}`}>
                {card.learnColor.emoji}
              </div>

              {/* Illustrated food hero */}
              <div style={{
                position:     'relative',
                width:         100,
                height:        100,
                marginTop:      12,
              }} aria-hidden="true">
                {/* Glow ring */}
                <div style={{
                  position:     'absolute',
                  inset:        -6,
                  borderRadius: '50%',
                  background:   `radial-gradient(circle, ${card.color}40 0%, transparent 70%)`,
                }} />
                {/* Plate circle */}
                <div style={{
                  position:     'absolute',
                  inset:         0,
                  borderRadius: '50%',
                  background:   'rgba(255,255,255,0.85)',
                  boxShadow:    `0 6px 18px ${card.color}44, inset 0 2px 4px rgba(255,255,255,0.9)`,
                  border:       `3px solid ${card.color}55`,
                }} />
                <div style={{
                  position:     'absolute',
                  inset:         0,
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent:'center',
                }}>
                  <GameSprite emoji={card.emoji} size={72} />
                </div>
              </div>

              {/* Name + desc */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 6px', marginTop: 8 }}>
                <h2 style={{
                  fontFamily: "'Fredoka One', 'Nunito', sans-serif",
                  fontSize:   '1.4rem',
                  fontWeight:  900,
                  color:      '#3D2B1F',
                  lineHeight:  1.1,
                  margin:      0,
                  textAlign:  'center',
                }}>
                  {card.name}
                </h2>
                <p style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize:   '0.72rem',
                  fontWeight:  700,
                  color:      'rgba(61,43,31,0.55)',
                  marginTop:   3,
                  textAlign:  'center',
                  margin:     '3px 0 0',
                }}>
                  {card.desc}
                </p>
              </div>

              {/* Difficulty stars badge */}
              <div style={{
                display:      'flex',
                alignItems:   'center',
                justifyContent:'center',
                gap:           4,
                background:    card.color,
                padding:      '5px 12px',
                borderRadius: '0 0 18px 18px',
                marginTop:     8,
                alignSelf:    'stretch',
                boxShadow:    `inset 0 2px 4px rgba(0,0,0,0.1)`,
              }}>
                <DifficultyStars count={card.difficulty} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Back button */}
      <div className="relative z-10 flex justify-center pb-3 pt-1">
        <button
          type="button"
          onClick={goHome}
          style={{
            fontFamily:  "'Nunito', sans-serif",
            fontWeight:   800,
            fontSize:    '1rem',
            padding:     '10px 28px',
            borderRadius: 999,
            border:      'none',
            background:  'rgba(61,43,31,0.1)',
            color:       'rgba(61,43,31,0.7)',
            cursor:      'pointer',
            touchAction: 'manipulation',
          }}
        >
          ← Balik
        </button>
      </div>
    </div>
  )
}
