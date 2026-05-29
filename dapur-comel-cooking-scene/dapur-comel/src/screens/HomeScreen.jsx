/**
 * HomeScreen.jsx — Visual polish
 *
 * Game-style hero layout: kitchen atmosphere, 3D CTA button, Oyen centred.
 * Warm kitchen environment visible behind content.
 */

import { useEffect, useRef, useState, useCallback, memo } from 'react'
import { Oyen }       from '../components/mascot/Oyen.jsx'
import { ParentGate } from '../components/gates/ParentGate.jsx'
import { useVoiceContext, useGameContext, useProgressContext } from '../App.jsx'
import { OYEN_EXPRESSION } from '../utils/constants.js'
import { sfx } from '../utils/audio.js'

const FLOATIES = [
  { e:'🍰', style:{ top:'7%',  left:'5%'  }, delay:0,   dur:4.0, size:'2rem' },
  { e:'⭐', style:{ top:'10%', right:'6%' }, delay:0.6, dur:3.3, size:'1.6rem' },
  { e:'🍓', style:{ top:'72%', left:'4%'  }, delay:1.1, dur:4.1, size:'1.8rem' },
  { e:'🧁', style:{ top:'68%', right:'5%' }, delay:0.4, dur:3.7, size:'1.9rem' },
  { e:'✨', style:{ top:'44%', left:'3%'  }, delay:1.0, dur:2.9, size:'1.5rem' },
  { e:'🥚', style:{ top:'38%', right:'4%' }, delay:1.5, dur:3.8, size:'1.7rem' },
]

const Floaties = memo(function Floaties() {
  return FLOATIES.map((f, i) => (
    <div key={i} className="absolute pointer-events-none" aria-hidden="true"
         style={{ ...f.style, fontSize:f.size, opacity:0.6,
                  animation:`ambientFloat ${f.dur}s ${f.delay}s ease-in-out infinite`,
                  filter:'drop-shadow(0 2px 6px rgba(0,0,0,0.1))' }}>
      {f.e}
    </div>
  ))
})

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

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t) }, [])
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
    showSpeechBubble(isReturning ? 'Eh, kamu dah balik! 🥰' : 'Jom masak dengan Oyen! 🎉')
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
    transition: `opacity 0.45s ease ${i*0.1}s, transform 0.45s cubic-bezier(0.34,1.3,0.64,1) ${i*0.1}s`,
  })

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden select-none">

      {/* Kitchen bg */}
      <div className="absolute inset-0" aria-hidden="true">
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'58%',
                      background:'linear-gradient(180deg, #FDF6E8, #F5E8CC)' }} />
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'58%',
                      backgroundImage:'linear-gradient(rgba(200,160,100,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,160,100,0.1) 1px, transparent 1px)',
                      backgroundSize:'48px 48px' }} />
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'45%',
                      background:'linear-gradient(180deg, #D4956A, #A0724A)',
                      boxShadow:'inset 0 6px 16px rgba(0,0,0,0.18)' }} />
        <div style={{ position:'absolute', bottom:'45%', left:0, right:0, height:10,
                      background:'linear-gradient(180deg, rgba(0,0,0,0.2), transparent)' }} />
      </div>

      <Floaties />

      {/* Parent gate */}
      <div className="absolute top-0 right-0 z-50">
        <ParentGate onUnlock={openSettings}><div className="w-12 h-12" /></ParentGate>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-between w-full flex-1 px-6 pt-6 pb-6">

        {/* Title */}
        <div className="text-center" style={fadeUp(0)}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span style={{ fontSize:'1.8rem', filter:'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' }}
                  aria-hidden="true">🍳</span>
            <p style={{ fontSize:'0.72rem', fontWeight:800, color:'rgba(61,43,31,0.55)',
                         letterSpacing:'0.12em', textTransform:'uppercase' }}>
              Selamat Datang ke
            </p>
            <span style={{ fontSize:'1.8rem', filter:'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' }}
                  aria-hidden="true">🍳</span>
          </div>
          {/* 3D title card */}
          <div style={{
            background:   'rgba(255,252,240,0.95)',
            borderRadius: 20,
            padding:      '10px 24px 12px',
            boxShadow:    '0 6px 0 rgba(200,140,60,0.35), 0 8px 24px rgba(0,0,0,0.12)',
            border:       '2px solid rgba(255,200,100,0.4)',
          }}>
            <h1 style={{ fontSize:'2.8rem', fontWeight:900, lineHeight:1,
                          fontFamily:"'Nunito', sans-serif", color:'#3D2B1F',
                          textShadow:'0 2px 0 rgba(200,140,60,0.15)' }}>
              Dapur
            </h1>
            <h1 style={{
              fontSize:'3.2rem', fontWeight:900, lineHeight:1,
              fontFamily:"'Nunito', sans-serif",
              background: 'linear-gradient(135deg, #FF8C5A 0%, #E8527A 45%, #FFD700 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
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
            pointerEvents:'none', marginBottom:'0.75rem',
          }}>
            <div className="game-prompt">
              <span style={{ fontSize:'1.05rem', fontWeight:900, color:'rgba(61,43,31,0.85)' }}>
                {bubbleText}
              </span>
            </div>
          </div>
          <Oyen expression={expression} size="xl" isSpeaking={isSpeaking} onClick={handleOyenTap} />
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 w-full" style={{ maxWidth:300, ...fadeUp(2) }}>
          <button
            type="button"
            className="btn-game btn-game-primary w-full"
            style={{ fontSize:'1.5rem', padding:'18px 0', touchAction:'manipulation' }}
            onClick={handlePlay}
            aria-label="Mula masak bersama Oyen"
          >
            🍳 Jom Masak!
          </button>
          <p style={{ fontSize:'0.82rem', fontWeight:700, color:'rgba(61,43,31,0.45)',
                       textAlign:'center', ...fadeUp(3) }}>
            Masak-masak bersama Oyen Si Kucing 🐱
          </p>
        </div>
      </div>
    </div>
  )
}
