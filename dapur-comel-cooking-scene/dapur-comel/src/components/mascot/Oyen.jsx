/**
 * Oyen.jsx — the cat chef mascot.
 *
 * Now uses OyenCharacter, a fully illustrated inline-SVG cat with body, chef
 * outfit, paws, tail, and 8 facial expressions — no external asset needed.
 * Keeps the expression → animation / glow / overlay system and random idle
 * micro-behaviours from before.
 */

import { memo, useEffect, useRef, useState } from 'react'
import { OYEN_EXPRESSION } from '../../utils/constants.js'
import { OyenCharacter } from './OyenCharacter.jsx'

// ── Size map — width only; OyenCharacter maintains its own aspect ratio ──────
const SIZE_DIM = {
  xs: 60,
  sm: 96,
  md: 140,
  lg: 188,
  xl: 248,
}

// ── Expression definitions ────────────────────────────────────────────────────
const EXPRESSIONS = {
  [OYEN_EXPRESSION.IDLE]: {
    anim: 'oyenBreathe', glow: 'rgba(255,179,128,0.20)', overlay: null,
    label: 'Oyen bersedia',
  },
  [OYEN_EXPRESSION.HAPPY]: {
    anim: 'oyenBreathe', glow: 'rgba(255,215,0,0.25)', overlay: 'sparkle',
    label: 'Oyen gembira',
  },
  [OYEN_EXPRESSION.EXCITED]: {
    anim: 'oyenBounce', glow: 'rgba(255,215,0,0.45)', overlay: 'stars',
    label: 'Oyen teruja',
  },
  [OYEN_EXPRESSION.CHEEKY]: {
    anim: 'oyenWiggle', glow: 'rgba(255,140,90,0.25)', overlay: null,
    label: 'Oyen nakal',
  },
  [OYEN_EXPRESSION.THINKING]: {
    anim: 'oyenBreathe', glow: 'rgba(184,159,216,0.30)', overlay: 'dots',
    label: 'Oyen fikir',
  },
  [OYEN_EXPRESSION.PROUD]: {
    anim: 'oyenBounce', glow: 'rgba(255,215,0,0.55)', overlay: 'stars',
    label: 'Oyen bangga',
  },
  [OYEN_EXPRESSION.SURPRISED]: {
    anim: 'oyenPopIn', glow: 'rgba(94,196,182,0.35)', overlay: 'sparkle',
    label: 'Oyen terkejut',
  },
  [OYEN_EXPRESSION.ENCOURAGING]: {
    anim: 'oyenWiggle', glow: 'rgba(94,196,182,0.25)', overlay: 'heart',
    label: 'Oyen galakkan',
  },
  [OYEN_EXPRESSION.SLEEPY]: {
    anim: 'oyenSway', glow: 'rgba(184,159,216,0.20)', overlay: 'zzz',
    label: 'Oyen mengantuk',
  },
  [OYEN_EXPRESSION.TALKING]: {
    anim: 'oyenTalking', glow: 'rgba(255,140,90,0.30)', overlay: 'soundwave',
    label: 'Oyen bercakap',
  },
}

// ── Overlay components ────────────────────────────────────────────────────────
function OverlaySparkle() {
  return (
    <div className="absolute -top-2 -right-1 pointer-events-none" aria-hidden="true">
      {['✨','⭐','✨'].map((e, i) => (
        <span key={i} className="absolute text-sm leading-none"
              style={{ top: i===1?-14:i===0?-4:4, right: i===1?2:i===0?-8:-14,
                       animation: `oyenSparkle 1.2s ${i*0.3}s ease-in-out infinite`, opacity: 0 }}>
          {e}
        </span>
      ))}
    </div>
  )
}
function OverlayStars() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {['⭐','🌟','⭐'].map((e, i) => (
        <span key={i} className="absolute leading-none"
              style={{ fontSize: i===1?'1.2rem':'0.9rem', top: i===0?'5%':i===1?'-8%':'8%',
                       right: i===0?'-5%':i===1?'5%':'-12%',
                       animation: `oyenStar 0.9s ${i*0.25}s ease-out infinite`, opacity: 0 }}>
          {e}
        </span>
      ))}
    </div>
  )
}
function OverlayDots({ size }) {
  const d = (size==='xs'||size==='sm') ? 5 : 7
  return (
    <div className="absolute flex gap-1 bg-white/90 rounded-full px-2 py-1.5"
         style={{ bottom: size==='xl'?16:size==='lg'?12:8, right:'10%', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}
         aria-hidden="true">
      {[0,1,2].map(i => (
        <div key={i} className="rounded-full bg-lavender"
             style={{ width:d, height:d, animation:`oyenDot 1.1s ${i*0.2}s ease-in-out infinite` }} />
      ))}
    </div>
  )
}
function OverlayZzz() {
  return (
    <div className="absolute pointer-events-none" style={{ top:'5%', right:'5%' }} aria-hidden="true">
      {['z','z','Z'].map((t,i) => (
        <span key={i} className="absolute font-display font-900 text-lavender"
              style={{ fontSize: i===2?'1.1rem':'0.75rem', top: i*-14, right: i*-8,
                       animation: `oyenZzz 2s ${i*0.5}s ease-in-out infinite`, opacity: 0 }}>
          {t}
        </span>
      ))}
    </div>
  )
}
function OverlayHeart({ size }) {
  return (
    <div className="absolute pointer-events-none" style={{ top:'0%', right:'-5%' }} aria-hidden="true">
      <span style={{ fontSize: size==='xl'?'1.5rem':'1.1rem', animation:'oyenHeart 0.8s ease-in-out infinite alternate', display:'block' }}>💛</span>
    </div>
  )
}
function OverlaySoundwave({ size }) {
  const h = size==='xl'?20:size==='lg'?14:10
  return (
    <div className="absolute flex items-end gap-0.5"
         style={{ bottom: size==='xl'?20:12, right:'5%' }} aria-hidden="true">
      {[0,1,2,3].map(i => (
        <div key={i} className="rounded-full bg-oyen-500"
             style={{ width: size==='xl'?5:4, height: h,
                      animation: `oyenBar 0.6s ${i*0.1}s ease-in-out infinite alternate`,
                      transformOrigin:'bottom' }} />
      ))}
    </div>
  )
}

const OVERLAY_MAP = {
  sparkle: OverlaySparkle, stars: OverlayStars, dots: OverlayDots,
  zzz: OverlayZzz, heart: OverlayHeart, soundwave: OverlaySoundwave,
}

// ── Idle micro-behaviour hook ─────────────────────────────────────────────────
const IDLE_ELIGIBLE = new Set([OYEN_EXPRESSION.IDLE, OYEN_EXPRESSION.HAPPY, OYEN_EXPRESSION.THINKING])
const IDLE_ANIMS    = ['oyenBlink', 'oyenDeepBreath', 'oyenTailWag']

function useOyenIdle(expression, isSpeaking) {
  const [idleAnim, setIdleAnim] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!IDLE_ELIGIBLE.has(expression) || isSpeaking) {
      clearTimeout(timerRef.current)
      setIdleAnim(null)
      return
    }
    const schedule = () => {
      const delay = 3000 + Math.random() * 5000
      timerRef.current = setTimeout(() => {
        const anim = IDLE_ANIMS[Math.floor(Math.random() * IDLE_ANIMS.length)]
        setIdleAnim(anim)
        setTimeout(() => { setIdleAnim(null); schedule() }, 800)
      }, delay)
    }
    schedule()
    return () => clearTimeout(timerRef.current)
  }, [expression, isSpeaking])

  return idleAnim
}

function getAnimDuration(anim) {
  return { oyenBreathe:'3.2s', oyenBounce:'0.65s', oyenWiggle:'0.55s',
           oyenSway:'2.5s', oyenTalking:'0.45s', oyenPopIn:'0.4s' }[anim] ?? '3s'
}

// ── Keyframe singleton ────────────────────────────────────────────────────────
let keyframesInjected = false
function OyenKeyframes() {
  if (keyframesInjected) return null
  keyframesInjected = true
  return (
    <style>{`
      @keyframes oyenBreathe  { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.025) translateY(-2px)} }
      @keyframes oyenBounce   { 0%,100%{transform:translateY(0) scale(1)} 30%{transform:translateY(-14px) scale(1.04)} 60%{transform:translateY(-5px) scale(1.01)} }
      @keyframes oyenWiggle   { 0%,100%{transform:rotate(0deg)} 20%{transform:rotate(-5deg)} 60%{transform:rotate(5deg)} 80%{transform:rotate(-2deg)} }
      @keyframes oyenSway     { 0%,100%{transform:rotate(0deg)} 30%{transform:rotate(5deg) translateY(2px)} 70%{transform:rotate(-3deg) translateY(1px)} }
      @keyframes oyenTalking  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.02) translateY(-2px)} }
      @keyframes oyenPopIn    { 0%{transform:scale(0.75);opacity:0.6} 60%{transform:scale(1.1)} 100%{transform:scale(1.08);opacity:1} }

      @keyframes oyenBlink     { 0%,90%,100%{transform:scaleY(1)} 95%{transform:scaleY(0.15)} }
      @keyframes oyenDeepBreath{ 0%,100%{transform:scaleY(1) scaleX(1)} 40%{transform:scaleY(1.06) scaleX(0.96)} 70%{transform:scaleY(0.97) scaleX(1.03)} }
      @keyframes oyenTailWag   { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-8deg) translateX(4px)} 75%{transform:rotate(8deg) translateX(-4px)} }

      @keyframes oyenSparkle  { 0%,100%{opacity:0;transform:scale(0.5) translateY(0)} 50%{opacity:1;transform:scale(1.1) translateY(-6px)} }
      @keyframes oyenStar     { 0%{opacity:0;transform:scale(0.3) translateY(4px)} 50%{opacity:1;transform:scale(1.2) translateY(-8px)} 100%{opacity:0;transform:scale(0.8) translateY(-14px)} }
      @keyframes oyenDot      { 0%,100%{transform:scaleY(0.5);opacity:0.4} 50%{transform:scaleY(1);opacity:1} }
      @keyframes oyenZzz      { 0%{opacity:0;transform:translate(0,0) scale(0.6)} 40%{opacity:0.9} 100%{opacity:0;transform:translate(-8px,-16px) scale(1.1)} }
      @keyframes oyenHeart    { from{transform:scale(0.9)} to{transform:scale(1.2)} }
      @keyframes oyenBar      { from{transform:scaleY(0.3);opacity:0.5} to{transform:scaleY(1);opacity:1} }
    `}</style>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export const Oyen = memo(function Oyen({
  expression = OYEN_EXPRESSION.IDLE,
  size       = 'md',
  isSpeaking = false,
  showHat    = true,
  onClick,
  className  = '',
}) {
  const TALKING_ELIGIBLE = new Set([
    OYEN_EXPRESSION.IDLE, OYEN_EXPRESSION.HAPPY,
    OYEN_EXPRESSION.THINKING, OYEN_EXPRESSION.ENCOURAGING,
  ])

  const activeExpression = (isSpeaking && TALKING_ELIGIBLE.has(expression))
    ? OYEN_EXPRESSION.TALKING : expression

  const expr = EXPRESSIONS[activeExpression] ?? EXPRESSIONS[OYEN_EXPRESSION.IDLE]
  const dim  = SIZE_DIM[size] ?? SIZE_DIM.md

  const idleAnim   = useOyenIdle(activeExpression, isSpeaking)
  const OverlayComp = expr.overlay ? OVERLAY_MAP[expr.overlay] : null

  const animStr = idleAnim
    ? `${idleAnim} 0.7s ease-in-out 1`
    : `${expr.anim} ${getAnimDuration(expr.anim)} ease-in-out infinite`

  // OyenCharacter maintains ~1.38 aspect ratio; container must match
  const charHeight = Math.round(dim * 1.38)

  return (
    <div
      className={`relative inline-block select-none ${className}`}
      style={{ width: dim, height: charHeight, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      role={onClick ? 'button' : 'img'}
      aria-label={expr.label}
    >
      {/* Ambient glow behind character */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: '-20%',
          background: `radial-gradient(ellipse at 50% 40%, ${expr.glow} 0%, transparent 65%)`,
          transition: 'background 0.4s ease',
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      {/* Animated character group */}
      <div
        style={{
          position: 'relative', zIndex: 1,
          width: dim, height: charHeight,
          animation: animStr, transformOrigin: 'center bottom',
          willChange: 'transform',
        }}
      >
        <OyenCharacter
          expression={activeExpression}
          width={dim}
          isSpeaking={isSpeaking}
        />
      </div>

      {OverlayComp && <OverlayComp size={size} />}
      <OyenKeyframes />
    </div>
  )
})
