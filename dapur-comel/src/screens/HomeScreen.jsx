/**
 * HomeScreen.jsx — Educational update for 2-3 year olds
 *
 * Changes:
 *   - Fredoka One display font for bigger, rounder title
 *   - "Belajar Hari Ini" section: color + number + shape of the day
 *   - Bigger play button (toddler-friendly 90px height)
 *   - Simpler mascot interaction
 *   - Daily lesson rotates based on day of year
 */

import { useEffect, useRef, useState, useCallback, memo } from 'react'
import { Oyen }       from '../components/mascot/Oyen.jsx'
import { ParentGate } from '../components/gates/ParentGate.jsx'
import { useVoiceContext, useGameContext, useProgressContext } from '../App.jsx'
import { OYEN_EXPRESSION } from '../utils/constants.js'
import { sfx } from '../utils/audio.js'

// Daily lesson rotation — one new lesson per day for variety
const DAILY_LESSONS = [
  { color: '#FF4500', colorName: 'Merah',        colorEmoji: '🔴', shape: '⭕', shapeName: 'Bulatan', number: 1, food: '🍅' },
  { color: '#FFD700', colorName: 'Kuning',       colorEmoji: '🟡', shape: '🔶', shapeName: 'Berlian',  number: 2, food: '🌟' },
  { color: '#4CAF50', colorName: 'Hijau',        colorEmoji: '🟢', shape: '🔺', shapeName: 'Segitiga', number: 3, food: '🥦' },
  { color: '#2196F3', colorName: 'Biru',         colorEmoji: '🔵', shape: '🟦', shapeName: 'Segiempat', number: 4, food: '🫐' },
  { color: '#E91E63', colorName: 'Merah Jambu',  colorEmoji: '🩷', shape: '⭕', shapeName: 'Bulatan',  number: 5, food: '🍓' },
  { color: '#FF9800', colorName: 'Oren',         colorEmoji: '🟠', shape: '🔶', shapeName: 'Berlian',  number: 1, food: '🍊' },
  { color: '#9C27B0', colorName: 'Ungu',         colorEmoji: '🟣', shape: '⭐', shapeName: 'Bintang',  number: 2, food: '🍇' },
]

const MALAY_NUMBERS = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima']

function getDailyLesson() {
  const dayOfYear = Math.floor(Date.now() / 86400000)
  return DAILY_LESSONS[dayOfYear % DAILY_LESSONS.length]
}

const FLOATIES = [
  { e: '🍰', style: { top: '7%',  left: '5%'  }, delay: 0,   dur: 4.0, size: '2.2rem' },
  { e: '⭐',  style: { top: '10%', right: '6%' }, delay: 0.6, dur: 3.3, size: '1.8rem' },
  { e: '🍓', style: { top: '72%', left: '4%'  }, delay: 1.1, dur: 4.1, size: '2rem' },
  { e: '🧁', style: { top: '68%', right: '5%' }, delay: 0.4, dur: 3.7, size: '2.1rem' },
  { e: '✨', style: { top: '44%', left: '3%'  }, delay: 1.0, dur: 2.9, size: '1.6rem' },
  { e: '🥚', style: { top: '38%', right: '4%' }, delay: 1.5, dur: 3.8, size: '1.9rem' },
]

const Floaties = memo(function Floaties() {
  return FLOATIES.map((f, i) => (
    <div
      key={i}
      className="absolute pointer-events-none"
      aria-hidden="true"
      style={{
        ...f.style,
        fontSize:  f.size,
        opacity:   0.6,
        animation: `ambientFloat ${f.dur}s ${f.delay}s ease-in-out infinite`,
        filter:    'drop-shadow(0 2px 6px rgba(0,0,0,0.1))',
      }}
    >
      {f.e}
    </div>
  ))
})

// Mini "Belajar Hari Ini" card shown on home screen
function DailyLessonCard({ lesson }) {
  const [tab, setTab] = useState('color')

  return (
    <div style={{
      background:   'rgba(255,252,240,0.96)',
      borderRadius:  24,
      padding:      '14px 20px',
      boxShadow:    '0 4px 20px rgba(80,40,10,0.12)',
      border:       '2px solid rgba(255,200,100,0.4)',
      width:        '100%',
      maxWidth:      340,
    }}>
      {/* Header */}
      <p style={{
        fontFamily:    "'Nunito', sans-serif",
        fontWeight:     800,
        fontSize:      '0.72rem',
        color:         'rgba(61,43,31,0.5)',
        margin:        '0 0 10px',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        textAlign:     'center',
      }}>
        📚 Belajar Hari Ini
      </p>

      {/* Tab pills */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
        {[
          { key: 'color',  label: '🎨 Warna' },
          { key: 'number', label: '🔢 Nombor' },
          { key: 'shape',  label: '🔷 Bentuk' },
        ].map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{
              fontFamily:  "'Nunito', sans-serif",
              fontWeight:   800,
              fontSize:    '0.7rem',
              padding:     '4px 10px',
              borderRadius: 999,
              border:      'none',
              cursor:      'pointer',
              background:  tab === t.key ? '#FF8C5A' : 'rgba(61,43,31,0.08)',
              color:       tab === t.key ? '#fff' : 'rgba(61,43,31,0.6)',
              transition:  'all 0.2s ease',
              touchAction: 'manipulation',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, minHeight: 72 }}>
        {tab === 'color' && (
          <>
            <div style={{
              width:        64,
              height:       64,
              borderRadius: '50%',
              background:   lesson.color,
              boxShadow:    `0 4px 16px ${lesson.color}66`,
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              fontSize:     '2rem',
              flexShrink:    0,
            }}>
              {lesson.colorEmoji}
            </div>
            <div>
              <p style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: 'rgba(61,43,31,0.5)' }}>Warna</p>
              <p style={{ margin: 0, fontFamily: "'Fredoka One', 'Nunito', sans-serif", fontSize: '2rem', fontWeight: 900, color: '#3D2B1F' }}>
                {lesson.colorName}
              </p>
            </div>
          </>
        )}

        {tab === 'number' && (
          <>
            <div style={{
              width:        64,
              height:       64,
              borderRadius:  16,
              background:   'linear-gradient(135deg, #FF8C5A, #E8527A)',
              display:      'flex',
              alignItems:   'center',
              justifyContent:'center',
              flexShrink:    0,
              boxShadow:    '0 4px 16px rgba(255,140,90,0.4)',
            }}>
              <span style={{ fontFamily: "'Fredoka One', sans-serif", fontSize: '2.8rem', color: '#fff', lineHeight: 1 }}>
                {lesson.number}
              </span>
            </div>
            <div>
              <p style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: 'rgba(61,43,31,0.5)' }}>Nombor</p>
              <p style={{ margin: 0, fontFamily: "'Fredoka One', 'Nunito', sans-serif", fontSize: '2rem', fontWeight: 900, color: '#3D2B1F' }}>
                {MALAY_NUMBERS[lesson.number]}
              </p>
            </div>
          </>
        )}

        {tab === 'shape' && (
          <>
            <div style={{ fontSize: '3.5rem', flexShrink: 0 }}>{lesson.shape}</div>
            <div>
              <p style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: 'rgba(61,43,31,0.5)' }}>Bentuk</p>
              <p style={{ margin: 0, fontFamily: "'Fredoka One', 'Nunito', sans-serif", fontSize: '2rem', fontWeight: 900, color: '#3D2B1F' }}>
                {lesson.shapeName}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export function HomeScreen() {
  const { isSpeaking, isUnlocked } = useVoiceContext()
  const { goToRecipeSelect, openSettings } = useGameContext()
  const { progress } = useProgressContext()

  const [expression, setExpression] = useState(OYEN_EXPRESSION.HAPPY)
  const [showBubble, setShowBubble] = useState(false)
  const [bubbleText, setBubbleText] = useState('')
  const [mounted,    setMounted]    = useState(false)

  const hasSpokenRef   = useRef(false)
  const bubbleTimerRef = useRef(null)
  const lesson = getDailyLesson()

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => () => clearTimeout(bubbleTimerRef.current), [])

  const showSpeechBubble = useCallback((text, ms = 3200) => {
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
    triggerWelcome()
    if (hasSpokenRef.current) {
      sfx.play('meow')
      setExpression(OYEN_EXPRESSION.CHEEKY)
      showSpeechBubble('Hehe~ 😼')
      setTimeout(() => setExpression(OYEN_EXPRESSION.HAPPY), 800)
    }
  }, [triggerWelcome, showSpeechBubble])

  const handlePlay = useCallback(() => {
    sfx.play('pop')
    setExpression(OYEN_EXPRESSION.EXCITED)
    goToRecipeSelect()
  }, [goToRecipeSelect])

  const fadeUp = (i) => ({
    opacity:    mounted ? 1 : 0,
    transform:  mounted ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.45s ease ${i * 0.1}s, transform 0.45s cubic-bezier(0.34,1.3,0.64,1) ${i * 0.1}s`,
  })

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden select-none">

      {/* Kitchen background */}
      <div className="absolute inset-0" aria-hidden="true">
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '58%',
                      background: 'linear-gradient(180deg, #FDF6E8, #F5E8CC)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '58%',
                      backgroundImage: 'linear-gradient(rgba(200,160,100,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,160,100,0.1) 1px, transparent 1px)',
                      backgroundSize: '48px 48px' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
                      background: 'linear-gradient(180deg, #D4956A, #A0724A)',
                      boxShadow: 'inset 0 6px 16px rgba(0,0,0,0.18)' }} />
        <div style={{ position: 'absolute', bottom: '45%', left: 0, right: 0, height: 10,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.2), transparent)' }} />
      </div>

      <Floaties />

      {/* Parent gate */}
      <div className="absolute top-0 right-0 z-50">
        <ParentGate onUnlock={openSettings}><div className="w-12 h-12" /></ParentGate>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-between w-full flex-1 px-5 pt-5 pb-5">

        {/* Title — Fredoka One font, bigger and rounder */}
        <div className="text-center" style={fadeUp(0)}>
          <div style={{
            background:   'rgba(255,252,240,0.96)',
            borderRadius:  22,
            padding:      '10px 28px 14px',
            boxShadow:    '0 6px 0 rgba(200,140,60,0.35), 0 8px 24px rgba(0,0,0,0.12)',
            border:       '2px solid rgba(255,200,100,0.4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: '1.4rem' }} aria-hidden="true">🍳</span>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '0.72rem',
                           color: 'rgba(61,43,31,0.5)', letterSpacing: '0.12em',
                           textTransform: 'uppercase', margin: 0 }}>
                Selamat Datang ke
              </p>
              <span style={{ fontSize: '1.4rem' }} aria-hidden="true">🍳</span>
            </div>
            <h1 style={{
              fontFamily: "'Fredoka One', 'Nunito', sans-serif",
              fontSize:   '3.2rem',
              fontWeight:  900,
              lineHeight:  1,
              color:      '#3D2B1F',
              margin:      0,
            }}>
              Dapur
            </h1>
            <h1 style={{
              fontFamily: "'Fredoka One', 'Nunito', sans-serif",
              fontSize:   '3.6rem',
              fontWeight:  900,
              lineHeight:  1,
              margin:      0,
              background: 'linear-gradient(135deg, #FF8C5A 0%, #E8527A 45%, #FFD700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Comel!
            </h1>
          </div>
        </div>

        {/* Oyen + speech bubble */}
        <div className="relative flex flex-col items-center" style={fadeUp(1)}>
          <div style={{
            opacity:    showBubble ? 1 : 0,
            transform:  showBubble ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.92)',
            transition: 'opacity 0.25s ease, transform 0.3s cubic-bezier(0.34,1.4,0.64,1)',
            pointerEvents: 'none',
            marginBottom: '0.5rem',
          }}>
            <div className="game-prompt">
              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'rgba(61,43,31,0.85)' }}>
                {bubbleText}
              </span>
            </div>
          </div>
          <Oyen expression={expression} size="xl" isSpeaking={isSpeaking} onClick={handleOyenTap} />
        </div>

        {/* Daily Lesson Card */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', ...fadeUp(2) }}>
          <DailyLessonCard lesson={lesson} />
        </div>

        {/* Play button — bigger for toddlers */}
        <div className="flex flex-col items-center gap-2 w-full" style={{ maxWidth: 320, ...fadeUp(3) }}>
          <button
            type="button"
            onClick={handlePlay}
            aria-label="Mula masak bersama Oyen"
            style={{
              width:        '100%',
              height:        90,
              borderRadius:  24,
              background:   'linear-gradient(135deg, #FF8C5A, #E8527A)',
              border:       'none',
              boxShadow:    '0 6px 0 #C02858, 0 8px 24px rgba(232,82,122,0.35)',
              fontFamily:   "'Fredoka One', 'Nunito', sans-serif",
              fontSize:     '1.8rem',
              fontWeight:    900,
              color:        '#fff',
              cursor:       'pointer',
              touchAction:  'manipulation',
              display:      'flex',
              alignItems:   'center',
              justifyContent:'center',
              gap:           10,
              textShadow:   '0 2px 4px rgba(0,0,0,0.2)',
              transition:   'transform 0.1s ease, box-shadow 0.1s ease',
            }}
            onPointerDown={e => {
              e.currentTarget.style.transform = 'translateY(4px)'
              e.currentTarget.style.boxShadow = '0 2px 0 #C02858, 0 4px 12px rgba(232,82,122,0.25)'
            }}
            onPointerUp={e => {
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = ''
              handlePlay()
            }}
            onPointerLeave={e => {
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = ''
            }}
          >
            🍳 Jom Masak!
          </button>

          <p style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize:   '0.8rem',
            fontWeight:  700,
            color:      'rgba(61,43,31,0.4)',
            textAlign:  'center',
          }}>
            Untuk kanak-kanak 2–3 tahun 👶
          </p>
        </div>

      </div>
    </div>
  )
}
