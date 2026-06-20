import { useEffect, useRef, useState, useCallback, memo } from 'react'
import { Oyen }         from '../components/mascot/Oyen.jsx'
import { KitchenScene } from '../components/ui/KitchenScene.jsx'
import { ParentGate }   from '../components/gates/ParentGate.jsx'
import { useVoiceContext, useGameContext, useProgressContext } from '../App.jsx'
import { OYEN_EXPRESSION } from '../utils/constants.js'
import { sfx } from '../utils/audio.js'

// Inline SVG star for the stars-earned display
function StarIcon({ filled, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={filled ? '#FFD700' : 'rgba(255,255,255,0.2)'}
        stroke={filled ? '#C8900A' : 'rgba(255,255,255,0.3)'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Floating food particles in the background
const FLOATIES = [
  { emoji: '🥞', x: '8%',  y: '12%', size: 36, delay: 0,    dur: 4.2, rot: -15 },
  { emoji: '⭐', x: '88%', y: '9%',  size: 28, delay: 0.6,  dur: 3.5, rot: 10  },
  { emoji: '🍕', x: '6%',  y: '55%', size: 34, delay: 1.1,  dur: 4.0, rot: 20  },
  { emoji: '🎂', x: '86%', y: '52%', size: 32, delay: 0.3,  dur: 3.8, rot: -10 },
  { emoji: '🍔', x: '5%',  y: '82%', size: 30, delay: 1.4,  dur: 4.3, rot: 8   },
  { emoji: '✨', x: '90%', y: '80%', size: 26, delay: 0.8,  dur: 3.2, rot: 0   },
  { emoji: '🍓', x: '45%', y: '5%',  size: 28, delay: 1.8,  dur: 3.9, rot: -5  },
]

const Floaties = memo(function Floaties({ mounted }) {
  return FLOATIES.map((f, i) => (
    <div
      key={i}
      aria-hidden="true"
      style={{
        position:     'absolute',
        left:          f.x,
        top:           f.y,
        fontSize:      f.size,
        transform:    `rotate(${f.rot}deg)`,
        opacity:       mounted ? 0.82 : 0,
        transition:   `opacity 0.6s ease ${i * 0.08}s`,
        animation:    mounted ? `ambientFloat ${f.dur}s ${f.delay}s ease-in-out infinite` : 'none',
        filter:       'drop-shadow(0 3px 8px rgba(0,0,0,0.18))',
        pointerEvents: 'none',
        zIndex:        1,
        lineHeight:    1,
      }}
    >
      {f.emoji}
    </div>
  ))
})

// Stars row — shows total stars earned across all recipes
function StarsRow({ totalStars, maxStars = 12 }) {
  const filled = Math.min(totalStars, maxStars)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {Array.from({ length: Math.min(maxStars, 6) }).map((_, i) => (
        <StarIcon key={i} filled={i < filled} size={20} />
      ))}
      {totalStars > 0 && (
        <span style={{
          fontFamily:  "'Fredoka One', sans-serif",
          fontSize:    '0.9rem',
          color:       '#FFD700',
          textShadow:  '0 1px 4px rgba(0,0,0,0.4)',
          marginLeft:   4,
        }}>
          ×{totalStars}
        </span>
      )}
    </div>
  )
}

export function HomeScreen() {
  const { isSpeaking, isUnlocked } = useVoiceContext()
  const { goToRecipeSelect, openSettings } = useGameContext()
  const { progress, getStarsForRecipe } = useProgressContext()

  const [expression, setExpression] = useState(OYEN_EXPRESSION.HAPPY)
  const [showBubble, setShowBubble] = useState(false)
  const [bubbleText, setBubbleText] = useState('')
  const [mounted,    setMounted]    = useState(false)
  const [playPressed, setPlayPressed] = useState(false)

  const hasSpokenRef   = useRef(false)
  const bubbleTimerRef = useRef(null)

  const totalStars = ['pancake', 'cake', 'pizza', 'burger']
    .reduce((acc, id) => acc + (getStarsForRecipe?.(id) ?? 0), 0)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => () => clearTimeout(bubbleTimerRef.current), [])

  const showSpeechBubble = useCallback((text, ms = 3000) => {
    clearTimeout(bubbleTimerRef.current)
    setBubbleText(text)
    setShowBubble(true)
    bubbleTimerRef.current = setTimeout(() => setShowBubble(false), ms)
  }, [])

  const triggerWelcome = useCallback(() => {
    if (hasSpokenRef.current) return
    hasSpokenRef.current = true
    const isReturning = (progress?.sessionsCompleted ?? 0) > 0
    showSpeechBubble(isReturning ? 'Eh, kamu dah balik! 🥰' : 'Jom belajar masak! 🎉')
    setExpression(OYEN_EXPRESSION.EXCITED)
    setTimeout(() => setExpression(OYEN_EXPRESSION.HAPPY), 1200)
  }, [showSpeechBubble, progress?.sessionsCompleted])

  useEffect(() => {
    if (!isUnlocked) return
    const t = setTimeout(triggerWelcome, 700)
    return () => clearTimeout(t)
  }, [isUnlocked, triggerWelcome])

  const handleOyenTap = useCallback(() => {
    if (!hasSpokenRef.current) { triggerWelcome(); return }
    sfx.play('meow')
    setExpression(OYEN_EXPRESSION.CHEEKY)
    showSpeechBubble('Hehe~ 😼')
    setTimeout(() => setExpression(OYEN_EXPRESSION.HAPPY), 800)
  }, [triggerWelcome, showSpeechBubble])

  const handlePlay = useCallback(() => {
    sfx.play('pop')
    setExpression(OYEN_EXPRESSION.EXCITED)
    goToRecipeSelect()
  }, [goToRecipeSelect])

  const fadeUp = (i) => ({
    opacity:    mounted ? 1 : 0,
    transform:  mounted ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.94)',
    transition: `opacity 0.5s ease ${i * 0.09}s, transform 0.5s cubic-bezier(0.34,1.3,0.64,1) ${i * 0.09}s`,
  })

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden select-none">

      {/* Illustrated kitchen background */}
      <KitchenScene className="absolute inset-0" />

      {/* Dark overlay to make content pop */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.18)', zIndex: 0 }} />

      {/* Floating food emojis */}
      <Floaties mounted={mounted} />

      {/* Parent gate (top-right corner, invisible tap zone) */}
      <div className="absolute top-0 right-0 z-50">
        <ParentGate onUnlock={openSettings}><div className="w-12 h-12" /></ParentGate>
      </div>

      {/* Stars display (top-left) */}
      <div
        className="absolute top-3 left-4 z-20"
        style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease 0.1s' }}
      >
        <div style={{
          background:  'rgba(0,0,0,0.35)',
          borderRadius: 999,
          padding:     '5px 12px',
          backdropFilter: 'blur(6px)',
        }}>
          <StarsRow totalStars={totalStars} />
        </div>
      </div>

      {/* Main content column */}
      <div className="relative z-10 flex flex-col items-center justify-between w-full flex-1 px-5 pt-3 pb-5">

        {/* ── GAME LOGO TITLE ── */}
        <div style={{ textAlign: 'center', ...fadeUp(0) }}>
          {/* Shimmer badge */}
          <div style={{
            display:     'inline-flex',
            alignItems:  'center',
            gap:          6,
            background:  'rgba(255,220,100,0.92)',
            borderRadius: 999,
            padding:     '4px 14px',
            marginBottom: 6,
            boxShadow:   '0 2px 8px rgba(200,140,0,0.4)',
          }}>
            <span style={{ fontSize: '0.8rem' }}>⭐</span>
            <span style={{
              fontFamily:  "'Nunito', sans-serif",
              fontWeight:   900,
              fontSize:    '0.7rem',
              color:       '#7B4800',
              letterSpacing:'0.08em',
            }}>EDUCATIONAL COOKING GAME</span>
            <span style={{ fontSize: '0.8rem' }}>⭐</span>
          </div>

          {/* Main logo panel */}
          <div style={{
            background:        'linear-gradient(160deg, rgba(255,252,240,0.95) 0%, rgba(255,240,200,0.95) 100%)',
            borderRadius:       28,
            padding:           '10px 28px 14px',
            boxShadow:         '0 8px 0 rgba(160,90,20,0.45), 0 14px 36px rgba(0,0,0,0.28)',
            border:            '3px solid rgba(255,210,100,0.6)',
            backdropFilter:    'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}>
            <div style={{
              fontFamily:    "'Fredoka One', 'Nunito', sans-serif",
              fontSize:      '2.6rem',
              fontWeight:     900,
              lineHeight:     1,
              color:         '#3D2B1F',
              letterSpacing: '-0.02em',
            }}>Dapur</div>
            <div style={{
              fontFamily:    "'Fredoka One', 'Nunito', sans-serif",
              fontSize:      '3.2rem',
              fontWeight:     900,
              lineHeight:     1,
              letterSpacing: '-0.02em',
              background:    'linear-gradient(135deg, #FF6B35 0%, #E8527A 50%, #FFD700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor:  'transparent',
              backgroundClip:       'text',
            }}>Comel! 🍳</div>
          </div>
        </div>

        {/* ── OYEN MASCOT (enlarged, central) ── */}
        <div
          className="relative flex flex-col items-center"
          style={{ flex: 1, justifyContent: 'center', ...fadeUp(1) }}
        >
          {/* Speech bubble */}
          <div style={{
            opacity:    showBubble ? 1 : 0,
            transform:  showBubble ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.88)',
            transition: 'opacity 0.22s ease, transform 0.28s cubic-bezier(0.34,1.4,0.64,1)',
            pointerEvents: 'none',
            marginBottom: '0.4rem',
          }}>
            <div
              className="game-prompt"
              style={{ fontSize: '1.05rem', fontWeight: 900, color: 'rgba(61,43,31,0.88)' }}
            >
              {bubbleText}
            </div>
          </div>

          {/* Glow ring behind Oyen */}
          <div style={{
            position:     'absolute',
            width:         220,
            height:        220,
            borderRadius: '50%',
            background:   'radial-gradient(circle, rgba(255,200,100,0.35) 0%, transparent 70%)',
            animation:    'ambientFloat 3.5s ease-in-out infinite',
            pointerEvents: 'none',
          }} />

          <Oyen expression={expression} size="xl" isSpeaking={isSpeaking} onClick={handleOyenTap} />
        </div>

        {/* ── RECIPE BADGES row ── */}
        <div style={{ ...fadeUp(2), width: '100%' }}>
          <div style={{
            display:        'flex',
            justifyContent: 'center',
            gap:             8,
            marginBottom:    14,
          }}>
            {[
              { id: 'pancake', emoji: '🥞', label: 'Pancake' },
              { id: 'cake',    emoji: '🎂', label: 'Kek'     },
              { id: 'pizza',   emoji: '🍕', label: 'Pizza'   },
              { id: 'burger',  emoji: '🍔', label: 'Burger'  },
            ].map(r => {
              const stars = getStarsForRecipe?.(r.id) ?? 0
              return (
                <div key={r.id} style={{
                  display:       'flex',
                  flexDirection: 'column',
                  alignItems:    'center',
                  gap:            2,
                  background:    stars > 0 ? 'rgba(255,220,80,0.25)' : 'rgba(0,0,0,0.3)',
                  borderRadius:   16,
                  padding:       '8px 10px',
                  border:        stars > 0 ? '2px solid rgba(255,220,80,0.6)' : '2px solid rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(6px)',
                  minWidth:       58,
                }}>
                  <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{r.emoji}</span>
                  <div style={{ display: 'flex', gap: 1 }}>
                    {[1,2,3].map(n => (
                      <StarIcon key={n} filled={n <= stars} size={12} />
                    ))}
                  </div>
                  <span style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize:   '0.58rem',
                    fontWeight:  800,
                    color:      stars > 0 ? '#FFD700' : 'rgba(255,255,255,0.5)',
                    lineHeight:  1,
                  }}>{r.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── PLAY BUTTON ── */}
        <div style={{ width: '100%', maxWidth: 340, ...fadeUp(3) }}>
          <button
            type="button"
            aria-label="Mula masak bersama Oyen"
            onPointerDown={() => setPlayPressed(true)}
            onPointerUp={() => { setPlayPressed(false); handlePlay() }}
            onPointerLeave={() => setPlayPressed(false)}
            onPointerCancel={() => setPlayPressed(false)}
            style={{
              width:         '100%',
              height:         88,
              borderRadius:   28,
              background:    'linear-gradient(160deg, #FF8C5A 0%, #E8527A 100%)',
              border:        'none',
              boxShadow:     playPressed
                ? '0 2px 0 #881840, 0 4px 16px rgba(232,82,122,0.35)'
                : '0 7px 0 #AA1840, 0 10px 30px rgba(232,82,122,0.45)',
              fontFamily:    "'Fredoka One', 'Nunito', sans-serif",
              fontSize:      '2rem',
              fontWeight:     900,
              color:         '#fff',
              cursor:        'pointer',
              touchAction:   'manipulation',
              display:       'flex',
              alignItems:    'center',
              justifyContent:'center',
              gap:            12,
              textShadow:    '0 2px 6px rgba(0,0,0,0.25)',
              transform:     playPressed ? 'translateY(5px)' : 'translateY(0)',
              transition:    'transform 80ms ease, box-shadow 80ms ease',
            }}
          >
            <span style={{ fontSize: '2rem' }}>🍳</span>
            Jom Masak!
            <span style={{ fontSize: '1.8rem' }}>▶</span>
          </button>

          <p style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize:   '0.78rem',
            fontWeight:  700,
            color:      'rgba(255,255,255,0.55)',
            textAlign:  'center',
            marginTop:   8,
          }}>
            Untuk kanak-kanak 2–3 tahun 👶
          </p>
        </div>

      </div>
    </div>
  )
}
