/**
 * RecipeSelectScreen.jsx — Pass 3: all 4 dishes, all unlocked
 *
 * Image-first cards. Tap card → enters COOKING immediately.
 * No locked state. No narration-first. Sound FX (Pass 4) on card tap.
 * Oyen reacts (expression) when card is pressed.
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { Oyen }       from '../components/mascot/Oyen.jsx'
import { ParentGate } from '../components/gates/ParentGate.jsx'
import {
  useVoiceContext,
  useGameContext,
  useProgressContext,
} from '../App.jsx'
import { sfx } from '../utils/audio.js'
import { OYEN_EXPRESSION } from '../utils/constants.js'

// All 4 recipes — card config
const RECIPE_CARDS = [
  {
    id:    'pancake',
    name:  'Pancake',
    emoji: '🥞',
    color: '#FFB347',
    bg:    'linear-gradient(135deg, #FFF9F0, #FFE8CC)',
    steps: 8,
    description: 'Goreng & balik!',
  },
  {
    id:    'cake',
    name:  'Kek',
    emoji: '🎂',
    color: '#E8527A',
    bg:    'linear-gradient(135deg, #FFF0F4, #FFE0EC)',
    steps: 7,
    description: 'Bakar & hiaskan!',
  },
  {
    id:    'pizza',
    name:  'Pizza',
    emoji: '🍕',
    color: '#FF6B35',
    bg:    'linear-gradient(135deg, #FFF8F0, #FFE8D0)',
    steps: 6,
    description: 'Tepek & potong!',
  },
  {
    id:    'burger',
    name:  'Burger',
    emoji: '🍔',
    color: '#C4521E',
    bg:    'linear-gradient(135deg, #FFF8EC, #FFE8CC)',
    steps: 4,
    description: 'Susun lapis!',
  },
]

export function RecipeSelectScreen() {
  const { isSpeaking }                    = useVoiceContext()
  const { selectRecipe, goHome, openSettings } = useGameContext()
  const { getStarsForRecipe }             = useProgressContext()

  const [expression, setExpression] = useState(OYEN_EXPRESSION.CHEEKY)
  const [activeCard, setActiveCard] = useState(null)
  const [mounted,    setMounted]    = useState(false)

  useEffect(() => { const t = setTimeout(() => setMounted(true), 40); return () => clearTimeout(t) }, [])

  const handleCardPress = useCallback((id) => {
    setActiveCard(id)
    sfx.pop()
    setExpression(OYEN_EXPRESSION.EXCITED)
  }, [])

  const handleCardRelease = useCallback((id) => {
    if (activeCard !== id) return
    setActiveCard(null)
    selectRecipe(id)
  }, [activeCard, selectRecipe])

  const handleCardLeave = useCallback(() => {
    setActiveCard(null)
    setExpression(OYEN_EXPRESSION.CHEEKY)
  }, [])

  return (
    <div
      className="relative w-full h-full flex flex-col select-none overflow-hidden"
      style={{ background: 'linear-gradient(175deg, #FFF8EC, #FFF0D6)' }}
    >
      {/* Parent gate */}
      <div className="absolute top-0 right-0 z-50">
        <ParentGate onUnlock={openSettings}><div className="w-12 h-12" /></ParentGate>
      </div>

      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 pt-5 pb-2"
        style={{
          opacity:    mounted ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <Oyen
          expression={expression}
          size="sm"
          isSpeaking={isSpeaking}
          onClick={() => setExpression(OYEN_EXPRESSION.CHEEKY)}
        />
        <div className="speech-bubble flex-1">
          <span className="text-toddler-xs">Nak masak apa hari ni? 🤔</span>
        </div>
      </div>

      {/* Recipe grid — 2×2 */}
      <div className="flex-1 grid grid-cols-2 gap-3 px-4 py-3 overflow-hidden">
        {RECIPE_CARDS.map((card, i) => {
          const stars   = getStarsForRecipe(card.id)
          const pressed = activeCard === card.id
          return (
            <div
              key={card.id}
              className="flex flex-col items-center justify-center rounded-[1.5rem] overflow-hidden"
              style={{
                background:  card.bg,
                boxShadow:   pressed
                  ? '0 2px 8px rgba(61,43,31,0.12)'
                  : '0 4px 16px rgba(61,43,31,0.12), 0 1px 4px rgba(61,43,31,0.06)',
                transform:   pressed ? 'scale(0.95)' : 'scale(1)',
                opacity:     mounted ? 1 : 0,
                transition:  mounted
                  ? 'transform 0.1s ease, box-shadow 0.1s ease'
                  : `opacity 0.25s ease ${i * 0.06}s`,
                touchAction: 'manipulation',
                cursor:      'pointer',
              }}
              onPointerDown={(e) => { if (e.isPrimary) handleCardPress(card.id) }}
              onPointerUp={(e)   => { if (e.isPrimary) handleCardRelease(card.id) }}
              onPointerLeave={handleCardLeave}
              onPointerCancel={handleCardLeave}
              role="button"
              aria-label={card.name}
            >
              {/* Big emoji — image-first */}
              <div
                className="flex items-center justify-center rounded-full mb-2"
                style={{
                  width:      80,
                  height:     80,
                  background: 'rgba(255,255,255,0.5)',
                  marginTop:  16,
                }}
                aria-hidden="true"
              >
                <span style={{ fontSize: '3rem', lineHeight: 1 }}>{card.emoji}</span>
              </div>

              {/* Text */}
              <h2 className="text-toddler-md font-display font-900 text-ink leading-tight">
                {card.name}
              </h2>
              <p className="text-toddler-xs font-body font-700 text-ink-muted mt-0.5 mb-1">
                {card.description}
              </p>

              {/* Stars if earned */}
              {stars > 0 && (
                <div className="flex gap-0.5 mb-2" aria-label={`${stars} bintang`}>
                  {[1,2,3].map(n => (
                    <span key={n} style={{ fontSize: '0.85rem', opacity: n <= stars ? 1 : 0.2 }}
                          aria-hidden="true">⭐</span>
                  ))}
                </div>
              )}

              {/* Accent bar at bottom */}
              <div
                className="w-full h-1.5 rounded-b-none mt-1"
                style={{ background: card.color, opacity: 0.7 }}
                aria-hidden="true"
              />
            </div>
          )
        })}
      </div>

      {/* Back */}
      <div className="flex justify-center pb-4 pt-1">
        <button
          type="button"
          className="flex items-center gap-2 px-5 py-3 rounded-pill
                     bg-white/70 backdrop-blur-sm
                     text-toddler-xs font-display font-800 text-ink-soft
                     shadow-[0_2px_8px_rgba(0,0,0,0.08)]
                     active:scale-95 transition-transform duration-100"
          style={{ touchAction: 'manipulation' }}
          onClick={goHome}
        >
          ← Balik
        </button>
      </div>
    </div>
  )
}
