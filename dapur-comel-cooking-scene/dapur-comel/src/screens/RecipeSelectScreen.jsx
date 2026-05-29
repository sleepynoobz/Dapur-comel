/**
 * RecipeSelectScreen.jsx — Visual polish
 *
 * Game-style 2×2 grid cards with kitchen depth.
 * Each card has colour-matched gradient + emoji hero + step count badge.
 * Press: card squashes down (3D press illusion).
 * Oyen reacts with EXCITED expression on press.
 */

import { useEffect, useRef, useCallback, useState, memo } from 'react'
import { Oyen }       from '../components/mascot/Oyen.jsx'
import { ParentGate } from '../components/gates/ParentGate.jsx'
import {
  useVoiceContext, useGameContext, useProgressContext,
} from '../App.jsx'
import { OYEN_EXPRESSION } from '../utils/constants.js'
import { sfx } from '../utils/audio.js'

const RECIPE_CARDS = [
  { id:'pancake', name:'Pancake',  emoji:'🥞', color:'#FFB347', accent:'#E8840A',
    bg:'linear-gradient(160deg, #FFF9F0 0%, #FFE8CC 100%)', steps:8, desc:'Goreng & balik!' },
  { id:'cake',    name:'Kek',      emoji:'🎂', color:'#E8527A', accent:'#C02858',
    bg:'linear-gradient(160deg, #FFF0F4 0%, #FFD8E8 100%)', steps:7, desc:'Bakar & hias!' },
  { id:'pizza',   name:'Pizza',    emoji:'🍕', color:'#FF6B35', accent:'#CC3A00',
    bg:'linear-gradient(160deg, #FFF8F0 0%, #FFE0C8 100%)', steps:6, desc:'Tepek & potong!' },
  { id:'burger',  name:'Burger',   emoji:'🍔', color:'#C4521E', accent:'#8B2800',
    bg:'linear-gradient(160deg, #FFF8EC 0%, #FFE4C0 100%)', steps:4, desc:'Susun lapis!' },
]

// Floating kitchen items in the background
const BG_ITEMS = ['🍳','✨','🧁','🔪','⭐','🫙']

const FloatingBg = memo(function FloatingBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Wall gradient */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'55%',
                    background:'linear-gradient(180deg, #FDF6E8, #F5E8CC)' }} />
      {/* Tile lines */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'55%',
                    backgroundImage:'linear-gradient(rgba(200,160,100,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,160,100,0.1) 1px, transparent 1px)',
                    backgroundSize:'48px 48px' }} />
      {/* Counter */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'48%',
                    background:'linear-gradient(180deg, #D4956A, #A0724A)',
                    boxShadow:'inset 0 6px 16px rgba(0,0,0,0.18)' }} />
      {/* Counter edge shadow */}
      <div style={{ position:'absolute', bottom:'48%', left:0, right:0, height:10,
                    background:'linear-gradient(180deg, rgba(0,0,0,0.2), transparent)' }} />
      {/* Ambient items */}
      {BG_ITEMS.map((e, i) => (
        <div key={i} style={{
          position:'absolute',
          fontSize: i % 2 === 0 ? '1.3rem' : '1rem',
          top:  `${6+i*7}%`,
          left: i < 3 ? `${3+i*2}%` : undefined,
          right: i >= 3 ? `${3+(i-3)*2}%` : undefined,
          opacity:0.1,
          animation:`ambientFloat ${3.5+i*0.6}s ${i*0.3}s ease-in-out infinite`,
          userSelect:'none',
        }}>{e}</div>
      ))}
    </div>
  )
})

export function RecipeSelectScreen() {
  const { isSpeaking }                         = useVoiceContext()
  const { selectRecipe, goHome, openSettings } = useGameContext()
  const { getStarsForRecipe }                  = useProgressContext()

  const [expression, setExpression] = useState(OYEN_EXPRESSION.CHEEKY)
  const [activeCard, setActiveCard] = useState(null)
  const [mounted,    setMounted]    = useState(false)

  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t) }, [])

  const handlePress = useCallback((id) => {
    setActiveCard(id)
    setExpression(OYEN_EXPRESSION.EXCITED)
    sfx.pop()
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

      <FloatingBg />

      {/* Parent gate */}
      <div className="absolute top-0 right-0 z-50">
        <ParentGate onUnlock={openSettings}><div className="w-12 h-12" /></ParentGate>
      </div>

      {/* Oyen + bubble header */}
      <div
        className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-2"
        style={{ opacity: mounted ? 1 : 0, transition:'opacity 0.2s ease' }}
      >
        <Oyen expression={expression} size="sm" isSpeaking={isSpeaking}
              onClick={() => setExpression(OYEN_EXPRESSION.CHEEKY)} />
        <div className="game-prompt flex-1">
          <span style={{ fontSize:'1.05rem', fontWeight:900, color:'rgba(61,43,31,0.8)' }}>
            Nak masak apa hari ni? 🤔
          </span>
        </div>
      </div>

      {/* Recipe grid */}
      <div className="relative z-10 flex-1 grid grid-cols-2 gap-3 px-4 py-2">
        {RECIPE_CARDS.map((card, i) => {
          const stars   = getStarsForRecipe?.(card.id) ?? 0
          const pressed = activeCard === card.id
          return (
            <div
              key={card.id}
              className="relative flex flex-col items-center justify-between overflow-hidden"
              style={{
                background:   card.bg,
                borderRadius: 24,
                boxShadow:    pressed
                  ? `0 2px 0 ${card.accent}, 0 4px 16px rgba(0,0,0,0.15)`
                  : `0 6px 0 ${card.accent}, 0 8px 24px rgba(0,0,0,0.18)`,
                border:       `2px solid ${card.color}44`,
                transform:    pressed
                  ? 'translateY(4px) scale(0.97)'
                  : mounted ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.95)',
                opacity:      mounted ? 1 : 0,
                transition:   mounted
                  ? `transform 80ms ease, box-shadow 80ms ease, opacity 0.25s ease ${i*0.06}s`
                  : `opacity 0.25s ease ${i*0.06}s, transform 0.3s ease ${i*0.06}s`,
                touchAction:  'manipulation',
                cursor:       'pointer',
                paddingBottom: 0,
              }}
              onPointerDown={(e) => { if (e.isPrimary) handlePress(card.id) }}
              onPointerUp={(e)   => { if (e.isPrimary) handleRelease(card.id) }}
              onPointerLeave={handleCancel}
              onPointerCancel={handleCancel}
              role="button"
              aria-label={`${card.name} — ${card.desc}`}
            >
              {/* Stars (earned) */}
              {stars > 0 && (
                <div className="absolute top-2 right-2 flex gap-0.5" aria-label={`${stars} bintang`}>
                  {[1,2,3].map(n => (
                    <span key={n} style={{ fontSize:'0.75rem',
                                           opacity: n <= stars ? 1 : 0.2 }}
                          aria-hidden="true">⭐</span>
                  ))}
                </div>
              )}

              {/* Emoji hero */}
              <div style={{
                width:      70, height: 70,
                borderRadius:'50%',
                background: 'rgba(255,255,255,0.55)',
                display:    'flex', alignItems:'center', justifyContent:'center',
                marginTop:  16,
                boxShadow:  '0 3px 10px rgba(0,0,0,0.1)',
                filter:     `drop-shadow(0 3px 8px ${card.color}55)`,
              }} aria-hidden="true">
                <span style={{ fontSize:'2.8rem', lineHeight:1 }}>{card.emoji}</span>
              </div>

              {/* Text */}
              <div className="flex flex-col items-center px-2 mt-2 mb-0">
                <h2 style={{ fontSize:'1.25rem', fontWeight:900, color:'#3D2B1F',
                             lineHeight:1.1, fontFamily:"'Nunito', sans-serif" }}>
                  {card.name}
                </h2>
                <p style={{ fontSize:'0.72rem', fontWeight:700, color:'rgba(61,43,31,0.55)',
                             marginTop:2 }}>
                  {card.desc}
                </p>
              </div>

              {/* Step count badge */}
              <div style={{ fontSize:'0.65rem', fontWeight:800,
                            color:'rgba(255,255,255,0.9)',
                            background: card.color,
                            padding:'3px 10px', borderRadius:'0 0 14px 14px',
                            marginTop:8, alignSelf:'stretch', textAlign:'center',
                            boxShadow:`inset 0 2px 4px rgba(0,0,0,0.1)` }}>
                {card.steps} langkah
              </div>
            </div>
          )
        })}
      </div>

      {/* Back */}
      <div className="relative z-10 flex justify-center pb-4 pt-1">
        <button
          type="button"
          className="btn-game btn-game-mint"
          style={{ padding:'10px 28px', fontSize:'0.95rem', touchAction:'manipulation' }}
          onClick={goHome}
        >
          ← Balik
        </button>
      </div>
    </div>
  )
}
