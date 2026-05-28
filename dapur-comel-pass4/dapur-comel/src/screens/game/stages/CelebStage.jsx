/**
 * CelebStage.jsx — Phase 4: Grand finale with real Oyen proud + excited
 *
 * Oyen cycles proud → excited expression during celebration.
 * Stars reveal, sticker popup, action buttons.
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { Confetti }       from '../../../components/ui/Confetti.jsx'
import { StickerPopup }   from '../../../components/ui/StickerPopup.jsx'
import { BigButton }      from '../../../components/ui/BigButton.jsx'
import { Oyen }           from '../../../components/mascot/Oyen.jsx'
import { useVoiceContext, useGameContext, useProgressContext } from '../../../App.jsx'
import { OYEN_EXPRESSION } from '../../../utils/constants.js'

export function CelebStage({ recipe, stageConfig, onComplete }) {
  const { speak, isSpeaking }      = useVoiceContext()
  const { playAgain, goHome }      = useGameContext()
  const { awardStars, addSticker } = useProgressContext()

  const [starsVisible,  setStarsVisible]  = useState([false, false, false])
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

  useEffect(() => { const t = setTimeout(() => setMounted(true), 40); return () => clearTimeout(t) }, [])

  useEffect(() => {
    const timers = []
    // Expression sequence: surprised → proud → excited (stays)
    timers.push(setTimeout(() => setExpression(OYEN_EXPRESSION.PROUD), 400))
    timers.push(setTimeout(() => setExpression(OYEN_EXPRESSION.EXCITED), 1200))

    // Voice sequence
    timers.push(setTimeout(() => speak('celebrate.main'), 300))
    for (let i = 0; i < starsToShow; i++) {
      timers.push(setTimeout(() => {
        setStarsVisible(prev => { const n = [...prev]; n[i] = true; return n })
      }, 1500 + i * 350))
    }
    timers.push(setTimeout(() => speak(`celebrate.stars.${starsToShow}`), 1500 + starsToShow * 350 + 200))
    timers.push(setTimeout(() => setShowSticker(true), 3800))
    timers.push(setTimeout(() => setShowButtons(true), 5500))

    return () => timers.forEach(clearTimeout)
  }, [speak, starsToShow])

  const handleStickerDismiss = useCallback(() => {
    setShowSticker(false)
    if (!showButtons) setShowButtons(true)
  }, [showButtons])

  return (
    <div className="relative flex flex-col items-center w-full h-full px-6 pt-5 pb-8 gap-4 overflow-hidden"
         style={{ background: 'linear-gradient(175deg, #FFFDE0, #FFF8EC, #FFF0D6)' }}>

      <Confetti />

      {/* Oyen — proud/excited expression cycles */}
      <div style={{
        opacity:    mounted ? 1 : 0,
        transform:  mounted ? 'scale(1)' : 'scale(0.75)',
        transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.5,0.64,1)',
      }}>
        <Oyen expression={expression} size="lg" isSpeaking={isSpeaking} />
      </div>

      {/* Headline */}
      <div className="text-center"
           style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(16px)', transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s' }}>
        <h2 className="font-display font-900 leading-tight"
            style={{
              fontSize: '2.8rem',
              background: 'linear-gradient(135deg, #FF8C5A, #E8527A, #FFD700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
          Tahniah! 🎉
        </h2>
        <p className="text-toddler-sm font-body font-700 text-ink-soft mt-1">
          {recipe?.name ?? 'Kek'} dah siap!
        </p>
      </div>

      {/* Stars */}
      <div className="flex gap-4" aria-label={`${starsToShow} bintang`}
           style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.4s ease 0.2s' }}>
        {[0, 1, 2].map(i => (
          <span key={i} className="leading-none" style={{
            fontSize:   '2.8rem',
            opacity:    i < starsToShow ? 1 : 0.15,
            filter:     starsVisible[i] ? 'drop-shadow(0 0 12px rgba(255,215,0,0.8))' : 'none',
            transform:  starsVisible[i] ? 'scale(1.2)' : 'scale(0.7)',
            transition: 'transform 0.4s cubic-bezier(0.34,1.7,0.64,1), filter 0.4s ease',
            display: 'inline-block',
          }} aria-hidden="true">⭐</span>
        ))}
      </div>

      {/* Finished cake */}
      <div className="text-8xl leading-none"
           style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.13))', animation: mounted ? 'celebFloat 3s ease-in-out infinite' : 'none' }}
           aria-label={`${recipe?.name ?? 'Kek'} siap`}>
        🍰
      </div>

      {/* Buttons */}
      {showButtons && (
        <div className="flex flex-col gap-3 w-full" style={{ maxWidth: 280, animation: 'celebSlideUp 0.4s cubic-bezier(0.34,1.4,0.64,1)' }}>
          <BigButton onClick={playAgain} size="lg" emoji="🍳" className="w-full">Masak Lagi!</BigButton>
          <BigButton onClick={goHome} variant="ghost" size="md" className="w-full">Balik Rumah</BigButton>
        </div>
      )}

      {showSticker && <StickerPopup stickerId={stickerId} onDismiss={handleStickerDismiss} />}

      <style>{`
        @keyframes celebFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes celebSlideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>
    </div>
  )
}
