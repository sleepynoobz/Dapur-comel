/**
 * RecipeSelectScreen.jsx
 *
 * Image-first recipe picker. Architecture Revision #5.
 *
 * ── Design Intent ─────────────────────────────────────────────────────────
 *   Giant visual cards — child picks by picture, not text.
 *   Each card is 70% visual: large emoji (placeholder for final food art).
 *   Oyen at top guides with voice: "Nak buat apa hari ni?"
 *
 * ── Locked Recipe Behaviour ───────────────────────────────────────────────
 *   Pancake and Biskut show "Segera!" badge + dimmed overlay.
 *   Tapping a locked card → Oyen redirects gently (not an error).
 *   No harsh "LOCKED" messaging — stays playful.
 *
 * ── Voice on Hover/Focus ──────────────────────────────────────────────────
 *   When child presses (pointerdown) any card, Oyen speaks the recipe name.
 *   This helps with vocabulary building even before the card is "selected".
 *   Debounced 400ms so rapid swipes don't spam TTS.
 *
 * ── Narration Guard ───────────────────────────────────────────────────────
 *   Screen prompt "Nak buat apa hari ni?" fires once on mount.
 *   Subsequent card focus narrations use speakText (shorter, instant).
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { Oyen }       from '../components/mascot/Oyen.jsx'
import { BigButton }  from '../components/ui/BigButton.jsx'
import { ParentGate } from '../components/gates/ParentGate.jsx'
import {
  useVoiceContext,
  useGameContext,
  useProgressContext,
} from '../App.jsx'
import { OYEN_EXPRESSION, RECIPE_ID } from '../utils/constants.js'

// ── Recipe card definitions ───────────────────────────────────────────────────
// Visual config kept here — recipe logic lives in data/recipes/
const RECIPE_CARDS = [
  {
    id:          RECIPE_ID.KEK_STRAWBERI,
    name:        'Kek Strawberi',
    emoji:       '🍰',
    emojiStack:  ['🍰', '🍓', '🤍'],   // stacked visual
    color:       '#E8527A',
    bgFrom:      '#FFD6E0',
    bgTo:        '#FFF0F4',
    locked:      false,
    comingSoon:  false,
    focusNarration: 'Kek Strawberi! Oyen suka ni!',
    selectNarration: 'Jom buat kek strawberi!',
  },
  {
    id:          RECIPE_ID.PANCAKE,
    name:        'Pancake',
    emoji:       '🥞',
    emojiStack:  ['🥞', '🍯', '🧈'],
    color:       '#FFB347',
    bgFrom:      '#FFE8C0',
    bgTo:        '#FFF8EC',
    locked:      true,
    comingSoon:  true,
    focusNarration: 'Pancake! Nanti kita buat tau!',
  },
  {
    id:          RECIPE_ID.BISKUT,
    name:        'Biskut',
    emoji:       '🍪',
    emojiStack:  ['🍪', '🍫', '⭐'],
    color:       '#C4521E',
    bgFrom:      '#FFD4B0',
    bgTo:        '#FFF5EC',
    locked:      true,
    comingSoon:  true,
    focusNarration: 'Biskut! Rangup-rangup! Jom tunggu!',
  },
]

export function RecipeSelectScreen() {
  const { speak, speakText, cancel, isSpeaking } = useVoiceContext()
  const { selectRecipe, goHome, openSettings }    = useGameContext()
  const { getStarsForRecipe }                     = useProgressContext()

  const [expression,    setExpression]    = useState(OYEN_EXPRESSION.CHEEKY)
  const [bubbleText,    setBubbleText]    = useState('Nak buat apa hari ni? 🤔')
  const [showBubble,    setShowBubble]    = useState(false)
  const [mounted,       setMounted]       = useState(false)
  const [activeCard,    setActiveCard]    = useState(null)  // pressed card id

  const hasSpokenRef    = useRef(false)
  const focusDebounceRef = useRef(null)
  const bubbleTimerRef  = useRef(null)

  // ── Mount stagger ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40)
    return () => clearTimeout(t)
  }, [])

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearTimeout(bubbleTimerRef.current)
      clearTimeout(focusDebounceRef.current)
    }
  }, [])

  // ── Screen intro narration ────────────────────────────────────────────────
  useEffect(() => {
    if (hasSpokenRef.current) return
    hasSpokenRef.current = true

    const t = setTimeout(() => {
      speak('recipeSelect.prompt')
      showOyenBubble('Nak buat apa hari ni? 🤔', 3500)
    }, 500)

    return () => clearTimeout(t)
  }, [speak])

  // ── Speech bubble helper ─────────────────────────────────────────────────
  const showOyenBubble = useCallback((text, ms = 3000) => {
    clearTimeout(bubbleTimerRef.current)
    setBubbleText(text)
    setShowBubble(true)
    bubbleTimerRef.current = setTimeout(() => setShowBubble(false), ms)
  }, [])

  // ── Card press ────────────────────────────────────────────────────────────
  const handleCardPress = useCallback((card) => {
    setActiveCard(card.id)

    // Debounce voice so rapid presses don't stack
    clearTimeout(focusDebounceRef.current)
    focusDebounceRef.current = setTimeout(() => {
      speakText(card.focusNarration)
    }, 100)
  }, [speakText])

  // ── Card release (select or bounce) ──────────────────────────────────────
  const handleCardRelease = useCallback((card) => {
    if (activeCard !== card.id) return   // pointer left the card
    setActiveCard(null)

    if (card.locked) {
      setExpression(OYEN_EXPRESSION.THINKING)
      speak('recipeSelect.locked')
      showOyenBubble('Ni belum boleh lagi! Habiskan kek dulu ya~ 🔒', 3000)
      setTimeout(() => setExpression(OYEN_EXPRESSION.CHEEKY), 1500)
      return
    }

    // ✅ Valid selection
    cancel()
    setExpression(OYEN_EXPRESSION.EXCITED)
    speakText(card.selectNarration)
    showOyenBubble('Yeay! Jom mulakan! 🎉', 2000)
    setTimeout(() => selectRecipe(card.id), 500)
  }, [activeCard, speak, speakText, cancel, selectRecipe, showOyenBubble])

  // ── Cancel card press if pointer leaves ──────────────────────────────────
  const handleCardLeave = useCallback(() => {
    setActiveCard(null)
  }, [])

  return (
    <div
      className="relative w-full h-full flex flex-col
                 bg-gradient-to-b from-[#FFF8EC] to-[#FFF0D6]
                 overflow-hidden select-none"
    >

      {/* Parent gate — top right */}
      <div className="absolute top-0 right-0 z-50">
        <ParentGate onUnlock={openSettings}>
          <div className="w-12 h-12" />
        </ParentGate>
      </div>

      {/* ── Header: Oyen + bubble ─────────────────────────────────── */}
      <div
        className="flex items-end gap-4 px-5 pt-6 pb-2"
        style={{
          opacity:    mounted ? 1 : 0,
          transform:  mounted ? 'none' : 'translateY(-16px)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
        }}
      >
        <Oyen
          expression={expression}
          size="md"
          isSpeaking={isSpeaking}
          onClick={() => {
            speak('recipeSelect.prompt')
            showOyenBubble('Nak buat apa hari ni? 🤔', 2500)
          }}
        />

        {/* Bubble */}
        <div
          className="flex-1 mb-1"
          style={{
            opacity:    showBubble ? 1 : 0,
            transform:  showBubble ? 'scale(1)' : 'scale(0.9)',
            transformOrigin: 'left center',
            transition: 'opacity 0.2s ease, transform 0.25s cubic-bezier(0.34,1.4,0.64,1)',
          }}
        >
          <div className="speech-bubble" style={{ textAlign: 'left' }}>
            <span className="text-toddler-xs">{bubbleText}</span>
          </div>
        </div>
      </div>

      {/* ── Recipe cards ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center gap-3 px-5 py-2 overflow-y-auto">
        {RECIPE_CARDS.map((card, i) => {
          const stars   = getStarsForRecipe(card.id)
          const pressed = activeCard === card.id

          return (
            <RecipeCard
              key={card.id}
              card={card}
              stars={stars}
              pressed={pressed}
              mountDelay={0.1 + i * 0.1}
              mounted={mounted}
              onPress={handleCardPress}
              onRelease={handleCardRelease}
              onLeave={handleCardLeave}
            />
          )
        })}
      </div>

      {/* ── Back button ───────────────────────────────────────────── */}
      <div
        className="flex justify-center pb-5 pt-1"
        style={{
          opacity:    mounted ? 1 : 0,
          transition: 'opacity 0.4s ease 0.4s',
        }}
      >
        <button
          type="button"
          className="flex items-center gap-2 px-5 py-3 rounded-pill
                     bg-white/70 backdrop-blur-sm
                     text-toddler-xs font-display font-800 text-ink-soft
                     shadow-[0_2px_8px_rgba(0,0,0,0.08)]
                     active:scale-95 transition-transform duration-100"
          style={{ touchAction: 'manipulation' }}
          onClick={() => { cancel(); goHome() }}
        >
          <span aria-hidden="true">←</span>
          Balik
        </button>
      </div>

    </div>
  )
}

// ─── RecipeCard ───────────────────────────────────────────────────────────────

function RecipeCard({ card, stars, pressed, mountDelay, mounted, onPress, onRelease, onLeave }) {
  return (
    <div
      className="relative overflow-hidden rounded-[1.5rem]
                 bg-white
                 shadow-[0_4px_20px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)]"
      style={{
        opacity:    mounted ? 1 : 0,
        transform:  mounted
          ? pressed ? 'scale(0.97) translateY(2px)' : 'scale(1)'
          : 'translateY(28px)',
        transition: mounted
          ? pressed
            ? 'transform 0.1s ease'
            : 'transform 0.2s cubic-bezier(0.34,1.4,0.64,1)'
          : `opacity 0.45s ease ${mountDelay}s, transform 0.45s cubic-bezier(0.34,1.4,0.64,1) ${mountDelay}s`,
        boxShadow: pressed
          ? '0 2px 8px rgba(0,0,0,0.10)'
          : '0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
        touchAction: 'manipulation',
      }}
      onPointerDown={(e) => {
        if (!e.isPrimary) return
        e.currentTarget.setPointerCapture(e.pointerId)
        onPress(card)
      }}
      onPointerUp={(e) => {
        if (!e.isPrimary) return
        onRelease(card)
      }}
      onPointerLeave={(e) => {
        if (!e.isPrimary) return
        onLeave()
      }}
      onPointerCancel={() => onLeave()}
      role="button"
      aria-label={`${card.name}${card.locked ? ' — belum dibuka' : ''}`}
      aria-disabled={card.locked}
    >
      {/* ── Card interior ─────────────────────────────────── */}
      <div className="flex items-center gap-0 h-[100px]">

        {/* Colour bar (left accent) */}
        <div
          className="w-2 self-stretch flex-shrink-0 rounded-l-[1.5rem]"
          style={{ backgroundColor: card.color }}
          aria-hidden="true"
        />

        {/* Visual panel — image-first ───────────────── */}
        <div
          className="flex items-center justify-center
                     w-[108px] h-full flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${card.bgFrom}, ${card.bgTo})`,
          }}
          aria-hidden="true"
        >
          {/* Stacked emoji art (placeholder for final food illustration) */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <span className="text-5xl leading-none">{card.emoji}</span>
            {/* Mini accents */}
            <span
              className="absolute text-xl leading-none"
              style={{ bottom: -4, right: -8, opacity: 0.8 }}
            >
              {card.emojiStack?.[1]}
            </span>
          </div>
        </div>

        {/* Text panel */}
        <div className="flex flex-col justify-center flex-1 px-4 py-3 min-w-0">
          <h2 className="text-toddler-md font-display font-900 text-ink leading-tight truncate">
            {card.name}
          </h2>

          {/* Stars (if any earned) */}
          {stars > 0 && (
            <div
              className="flex gap-0.5 mt-1"
              aria-label={`${stars} bintang`}
            >
              {[1, 2, 3].map((n) => (
                <span
                  key={n}
                  className="text-base leading-none"
                  style={{ opacity: n <= stars ? 1 : 0.2 }}
                  aria-hidden="true"
                >
                  ⭐
                </span>
              ))}
            </div>
          )}

          {/* Coming soon label */}
          {card.comingSoon && (
            <span
              className="mt-1.5 self-start text-[0.65rem] font-display font-900
                         px-2 py-0.5 rounded-full uppercase tracking-wider text-white"
              style={{ backgroundColor: card.color }}
              aria-hidden="true"
            >
              Segera!
            </span>
          )}

          {/* Active recipe hint */}
          {!card.locked && !card.comingSoon && (
            <div className="flex items-center gap-1 mt-1.5">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: card.color }}
                aria-hidden="true"
              />
              <span className="text-[0.7rem] font-body font-700 text-ink-muted">
                Sedia dimainkan!
              </span>
            </div>
          )}
        </div>

        {/* Arrow or lock icon */}
        <div className="flex-shrink-0 pr-4" aria-hidden="true">
          {card.locked
            ? <span className="text-2xl opacity-40">🔒</span>
            : <span
                className="text-2xl"
                style={{
                  color: card.color,
                  transform: pressed ? 'translateX(3px)' : 'none',
                  transition: 'transform 0.1s ease',
                  display: 'inline-block',
                }}
              >
                ›
              </span>
          }
        </div>
      </div>

      {/* ── Locked overlay ─────────────────────────────── */}
      {card.locked && (
        <div
          className="absolute inset-0 rounded-[1.5rem]"
          style={{ backgroundColor: 'rgba(255,248,236,0.55)' }}
          aria-hidden="true"
        />
      )}

    </div>
  )
}
