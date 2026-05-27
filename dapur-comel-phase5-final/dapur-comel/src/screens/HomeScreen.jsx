/**
 * HomeScreen.jsx — Phase 4: branded, emotionally engaging
 *
 * Full Oyen branding integration. Child sees the real Oyen immediately.
 * Warm bakery kitchen atmosphere with depth and life.
 */

import { useEffect, useRef, useState, useCallback, memo } from 'react'
import { Oyen }       from '../components/mascot/Oyen.jsx'
import { BigButton }  from '../components/ui/BigButton.jsx'
import { ParentGate } from '../components/gates/ParentGate.jsx'
import { useVoiceContext, useGameContext, useProgressContext } from '../App.jsx'
import { OYEN_EXPRESSION } from '../utils/constants.js'

// Floating bakery decorations
const FLOATIES = [
  { emoji: '🍰', style: { top: '6%',  left: '5%'  }, delay: 0,    dur: 4.0, size: '1.8rem' },
  { emoji: '⭐', style: { top: '10%', right: '6%' }, delay: 0.7,  dur: 3.2, size: '1.5rem' },
  { emoji: '🍓', style: { top: '73%', left: '4%'  }, delay: 1.2,  dur: 4.1, size: '1.7rem' },
  { emoji: '🧁', style: { top: '69%', right: '5%' }, delay: 0.4,  dur: 3.6, size: '1.8rem' },
  { emoji: '✨', style: { top: '43%', left: '3%'  }, delay: 1.0,  dur: 2.9, size: '1.4rem' },
  { emoji: '🥚', style: { top: '38%', right: '4%' }, delay: 1.5,  dur: 3.7, size: '1.6rem' },
  { emoji: '🧈', style: { top: '56%', left: '3%'  }, delay: 0.6,  dur: 4.3, size: '1.4rem' },
  { emoji: '🍬', style: { top: '21%', right: '4%' }, delay: 1.8,  dur: 3.1, size: '1.4rem' },
]

const Floaties = memo(function Floaties() {
  return FLOATIES.map((f, i) => (
    <div key={i} className="absolute pointer-events-none" aria-hidden="true"
         style={{ ...f.style, fontSize: f.size, animation: `float ${f.dur}s ${f.delay}s ease-in-out infinite`, opacity: 0.65 }}>
      {f.emoji}
    </div>
  ))
})

export function HomeScreen() {
  const { speak, cancel, isSpeaking, isUnlocked } = useVoiceContext()
  const { goToRecipeSelect, openSettings }         = useGameContext()
  const { progress }                               = useProgressContext()

  const [expression, setExpression] = useState(OYEN_EXPRESSION.HAPPY)
  const [showBubble, setShowBubble] = useState(false)
  const [bubbleText, setBubbleText] = useState('')
  const [mounted,    setMounted]    = useState(false)

  const hasSpokenRef   = useRef(false)
  const bubbleTimerRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => () => clearTimeout(bubbleTimerRef.current), [])

  const showBubble_ = useCallback((text, ms = 3500) => {
    clearTimeout(bubbleTimerRef.current)
    setBubbleText(text)
    setShowBubble(true)
    bubbleTimerRef.current = setTimeout(() => setShowBubble(false), ms)
  }, [])

  const triggerWelcome = useCallback(() => {
    if (hasSpokenRef.current) return
    hasSpokenRef.current = true
    const isReturning = (progress?.sessionsCompleted ?? 0) > 0
    speak(isReturning ? 'home.returning' : 'home.welcome')
    showBubble_(isReturning ? 'Eh, kamu dah balik! 🥰' : 'Jom masak dengan Oyen! 🎉')
    setExpression(OYEN_EXPRESSION.EXCITED)
    setTimeout(() => setExpression(OYEN_EXPRESSION.HAPPY), 1200)
  }, [speak, showBubble_, progress?.sessionsCompleted])

  useEffect(() => {
    if (!isUnlocked) return
    const t = setTimeout(triggerWelcome, 700)
    return () => clearTimeout(t)
  }, [isUnlocked, triggerWelcome])

  const handleOyenTap = useCallback(() => {
    triggerWelcome()
    if (hasSpokenRef.current) {
      setExpression(OYEN_EXPRESSION.CHEEKY)
      speak('oyen.idle')
      showBubble_('Hehe~ 😼')
      setTimeout(() => setExpression(OYEN_EXPRESSION.HAPPY), 800)
    }
  }, [speak, showBubble_, triggerWelcome])

  const handlePlay = useCallback(() => {
    cancel()
    setExpression(OYEN_EXPRESSION.EXCITED)
    goToRecipeSelect()
  }, [cancel, goToRecipeSelect])

  const fadeIn = (i) => ({
    opacity:    mounted ? 1 : 0,
    transform:  mounted ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s cubic-bezier(0.34,1.3,0.64,1) ${i * 0.1}s`,
  })

  return (
    <div className="relative w-full h-full flex flex-col items-center overflow-hidden select-none"
         style={{ background: 'linear-gradient(175deg, #FFF0E0 0%, #FFF8EC 45%, #FFF0D6 100%)' }}>

      <Floaties />

      {/* Parent gate */}
      <div className="absolute top-0 right-0 z-50">
        <ParentGate onUnlock={openSettings}><div className="w-12 h-12" /></ParentGate>
      </div>

      <div className="relative flex flex-col items-center justify-between w-full flex-1 px-6 pt-6 pb-6 z-10">

        {/* Brand title */}
        <div className="text-center" style={fadeIn(0)}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-2xl" aria-hidden="true">🍳</span>
            <p className="text-toddler-xs font-body font-700 text-ink-muted tracking-widest uppercase">
              Selamat Datang ke
            </p>
            <span className="text-2xl" aria-hidden="true">🍳</span>
          </div>
          <h1 className="font-display font-900 text-ink leading-none"
              style={{ fontSize: '2.6rem' }}>
            Dapur
          </h1>
          <h1
            className="font-display font-900 leading-none"
            style={{
              fontSize: '3rem',
              background: 'linear-gradient(135deg, #FF8C5A 0%, #E8527A 45%, #FFD700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Comel!
          </h1>
        </div>

        {/* Oyen + speech bubble */}
        <div className="relative flex flex-col items-center" style={fadeIn(1)}>

          {/* Speech bubble above Oyen */}
          <div
            style={{
              opacity:        showBubble ? 1 : 0,
              transform:      showBubble ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.92)',
              transition:     'opacity 0.3s ease, transform 0.35s cubic-bezier(0.34,1.4,0.64,1)',
              pointerEvents:  'none',
              marginBottom:   '0.75rem',
            }}
          >
            <div className="speech-bubble">
              <span className="text-toddler-xs">{bubbleText}</span>
            </div>
          </div>

          {/* Real Oyen mascot — XL size on home screen */}
          <Oyen
            expression={expression}
            size="xl"
            isSpeaking={isSpeaking}
            onClick={handleOyenTap}
          />
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 w-full" style={{ maxWidth: 300, ...fadeIn(2) }}>
          <BigButton
            onClick={handlePlay}
            size="lg"
            emoji="🍳"
            pulse
            className="w-full"
            aria-label="Mula masak bersama Oyen"
          >
            Jom Masak!
          </BigButton>
          <p className="text-toddler-xs text-ink-muted font-body font-700 text-center"
             style={fadeIn(3)}>
            Masak-masak bersama Oyen Si Kucing 🐱
          </p>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: 72 }} aria-hidden="true">
        <svg viewBox="0 0 390 72" fill="none" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path d="M0 36 Q97.5 0 195 36 Q292.5 72 390 36 L390 72 L0 72 Z" fill="rgba(255,140,90,0.07)" />
          <path d="M0 50 Q97.5 14 195 50 Q292.5 86 390 50 L390 72 L0 72 Z" fill="rgba(255,140,90,0.05)" />
        </svg>
      </div>
    </div>
  )
}
