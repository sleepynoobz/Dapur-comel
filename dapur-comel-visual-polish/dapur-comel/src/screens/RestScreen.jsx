/**
 * RestScreen.jsx — Phase 4: Oyen sleepy with zzz overlay
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { Oyen }      from '../components/mascot/Oyen.jsx'
import { BigButton } from '../components/ui/BigButton.jsx'
import { useVoiceContext, useGameContext } from '../App.jsx'
import { OYEN_EXPRESSION, REST_CONFIG } from '../utils/constants.js'

const LOCKOUT_S = 5

export function RestScreen() {
  const { speak, isSpeaking }        = useVoiceContext()
  const { resumeFromRest, restTimer } = useGameContext()

  const [countdown,  setCountdown]  = useState(LOCKOUT_S)
  const [canResume,  setCanResume]  = useState(false)
  const [mounted,    setMounted]    = useState(false)

  const countRef       = useRef(null)
  const autoDismissRef = useRef(null)

  useEffect(() => { const t = setTimeout(() => setMounted(true), 40); return () => clearTimeout(t) }, [])
  useEffect(() => { const t = setTimeout(() => speak('rest.nudge'), 400); return () => clearTimeout(t) }, [speak])
  useEffect(() => () => { clearInterval(countRef.current); clearTimeout(autoDismissRef.current) }, [])

  useEffect(() => {
    countRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(countRef.current); setCanResume(true); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(countRef.current)
  }, [])

  useEffect(() => {
    autoDismissRef.current = setTimeout(() => { restTimer?.dismissRest(); resumeFromRest() }, REST_CONFIG.AUTO_DISMISS_SECONDS * 1000)
    return () => clearTimeout(autoDismissRef.current)
  }, [resumeFromRest, restTimer])

  const handleResume = useCallback(() => {
    clearTimeout(autoDismissRef.current)
    restTimer?.dismissRest()
    speak('rest.resume')
    setTimeout(resumeFromRest, 600)
  }, [restTimer, speak, resumeFromRest])

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center gap-7 px-8 select-none overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #EDE0F7 0%, #D4C4EC 40%, #C8EDE8 100%)' }}
    >
      {/* Background blobs */}
      <div className="absolute pointer-events-none" aria-hidden="true"
           style={{ width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', top: -80, left: -80 }} />
      <div className="absolute pointer-events-none" aria-hidden="true"
           style={{ width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.13)', bottom: -60, right: -60 }} />

      {/* Oyen sleepy */}
      <div style={{
        opacity:    mounted ? 1 : 0,
        transform:  mounted ? 'scale(1)' : 'scale(0.85)',
        transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.2,0.64,1)',
      }}>
        <Oyen expression={OYEN_EXPRESSION.SLEEPY} size="xl" isSpeaking={isSpeaking} />
      </div>

      {/* Message */}
      <div className="text-center space-y-3"
           style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(16px)', transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s' }}>
        <h2 className="text-toddler-xl font-display font-900 text-ink leading-tight">
          Rehat Sekejap!
        </h2>
        <div className="text-6xl leading-none" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))' }} aria-hidden="true">
          💧
        </div>
        <p className="text-toddler-md font-display font-900 text-lavender-dark">Minum air dulu ya! 🥤</p>
        <p className="text-toddler-xs text-ink-soft font-body font-700">Oyen pun ngantuk sikit~</p>
      </div>

      {/* Action */}
      <div className="w-full" style={{ maxWidth: 280, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease 0.2s' }}>
        {canResume ? (
          <BigButton onClick={handleResume} size="lg" emoji="▶️" variant="secondary" className="w-full">
            Dah Siap! Sambung!
          </BigButton>
        ) : (
          <div className="text-center">
            <p className="text-toddler-xs font-body font-700 text-ink-muted">
              Sambung dalam <span className="font-display font-900 text-lavender-dark">{countdown}</span> saat...
            </p>
            <div className="mt-3 w-full bg-white/40 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-lavender rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${((LOCKOUT_S - countdown) / LOCKOUT_S) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
