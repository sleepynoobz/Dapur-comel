/**
 * Oyen.jsx — Pass 4: idle behaviours + emotional polish
 *
 * Added:
 *   - useOyenIdle hook: random micro-animations every 3–8s
 *     blink / breathe-deep / tail-wiggle / yawn (not all — just what CSS can do)
 *   - Idle behaviours never fire during active interaction (isSpeaking/onClick)
 *   - OyenKeyframes: added squash/stretch, blink, yawn keyframes
 *   - No new props — all internal to component
 */

import { memo, useEffect, useRef, useState } from 'react'
import { OYEN_EXPRESSION } from '../../utils/constants.js'

// ── Asset size map ────────────────────────────────────────────────────────────
const ASSET = {
  xs: '/assets/images/mascot/oyen-base-xs.webp',
  sm: '/assets/images/mascot/oyen-base-sm.webp',
  md: '/assets/images/mascot/oyen-base-md.webp',
  lg: '/assets/images/mascot/oyen-base-lg.webp',
  xl: '/assets/images/mascot/oyen-base-xl.webp',
}

const SIZE_DIM = {
  xs: { w: 64,  h: 48  },
  sm: { w: 96,  h: 72  },
  md: { w: 160, h: 120 },
  lg: { w: 220, h: 165 },
  xl: { w: 320, h: 240 },
}

// ── Expression definitions ────────────────────────────────────────────────────
const EXPRESSIONS = {
  [OYEN_EXPRESSION.IDLE]: {
    filter: 'none', transform: 'scaleX(-1)',
    anim: 'oyenBreathe', glow: 'rgba(255,179,128,0.20)', overlay: null,
    label: 'Oyen bersedia',
  },
  [OYEN_EXPRESSION.HAPPY]: {
    filter: 'brightness(1.08) saturate(1.15)', transform: 'scaleX(-1) translateY(-4px)',
    anim: 'oyenBreathe', glow: 'rgba(255,215,0,0.25)', overlay: 'sparkle',
    label: 'Oyen gembira',
  },
  [OYEN_EXPRESSION.EXCITED]: {
    filter: 'brightness(1.12) saturate(1.2) hue-rotate(-5deg)', transform: 'scaleX(-1) scale(1.05)',
    anim: 'oyenBounce', glow: 'rgba(255,215,0,0.45)', overlay: 'stars',
    label: 'Oyen teruja',
  },
  [OYEN_EXPRESSION.CHEEKY]: {
    filter: 'none', transform: 'scaleX(1)',
    anim: 'oyenWiggle', glow: 'rgba(255,140,90,0.25)', overlay: null,
    label: 'Oyen nakal',
  },
  [OYEN_EXPRESSION.THINKING]: {
    filter: 'brightness(0.95) saturate(0.9)', transform: 'scaleX(-1) rotate(-4deg)',
    anim: 'oyenBreathe', glow: 'rgba(184,159,216,0.30)', overlay: 'dots',
    label: 'Oyen fikir',
  },
  [OYEN_EXPRESSION.PROUD]: {
    filter: 'brightness(1.15) saturate(1.25)', transform: 'scaleX(-1) translateY(-6px) scale(1.06)',
    anim: 'oyenBounce', glow: 'rgba(255,215,0,0.55)', overlay: 'stars',
    label: 'Oyen bangga',
  },
  [OYEN_EXPRESSION.SURPRISED]: {
    filter: 'brightness(1.1) contrast(1.05)', transform: 'scaleX(-1) scale(1.08)',
    anim: 'oyenPopIn', glow: 'rgba(94,196,182,0.35)', overlay: 'sparkle',
    label: 'Oyen terkejut',
  },
  [OYEN_EXPRESSION.ENCOURAGING]: {
    filter: 'brightness(1.05) saturate(1.1)', transform: 'scaleX(-1) rotate(3deg)',
    anim: 'oyenWiggle', glow: 'rgba(94,196,182,0.25)', overlay: 'heart',
    label: 'Oyen galakkan',
  },
  [OYEN_EXPRESSION.SLEEPY]: {
    filter: 'brightness(0.88) saturate(0.7) hue-rotate(10deg)', transform: 'scaleX(-1) rotate(6deg) translateY(4px)',
    anim: 'oyenSway', glow: 'rgba(184,159,216,0.20)', overlay: 'zzz',
    label: 'Oyen mengantuk',
  },
  [OYEN_EXPRESSION.TALKING]: {
    filter: 'brightness(1.05)', transform: 'scaleX(-1)',
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
// Triggers a brief CSS override animation every 3–8 seconds.
// Never fires while Oyen is in an active expression state.
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
      const delay = 3000 + Math.random() * 5000  // 3–8s
      timerRef.current = setTimeout(() => {
        const anim = IDLE_ANIMS[Math.floor(Math.random() * IDLE_ANIMS.length)]
        setIdleAnim(anim)
        // Reset after animation completes
        setTimeout(() => { setIdleAnim(null); schedule() }, 800)
      }, delay)
    }

    schedule()
    return () => clearTimeout(timerRef.current)
  }, [expression, isSpeaking])

  return idleAnim
}

// ── Asset preload ─────────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  ;['xl', 'lg', 'sm'].forEach(size => {
    const link = document.createElement('link')
    link.rel = 'preload'; link.as = 'image'
    link.href = ASSET[size]; link.type = 'image/webp'
    document.head.appendChild(link)
  })
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
      @keyframes oyenBreathe  { 0%,100%{transform:var(--ot,scaleX(-1)) scaleY(1)} 50%{transform:var(--ot,scaleX(-1)) scaleY(1.025) translateY(-2px)} }
      @keyframes oyenBounce   { 0%,100%{transform:var(--ot,scaleX(-1)) translateY(0) scale(1)} 30%{transform:var(--ot,scaleX(-1)) translateY(-14px) scale(1.04)} 60%{transform:var(--ot,scaleX(-1)) translateY(-5px) scale(1.01)} }
      @keyframes oyenWiggle   { 0%,100%{transform:var(--ot,scaleX(-1)) rotate(0deg)} 20%{transform:var(--ot,scaleX(-1)) rotate(-5deg)} 60%{transform:var(--ot,scaleX(-1)) rotate(5deg)} 80%{transform:var(--ot,scaleX(-1)) rotate(-2deg)} }
      @keyframes oyenSway     { 0%,100%{transform:var(--ot,scaleX(-1)) rotate(0deg)} 30%{transform:var(--ot,scaleX(-1)) rotate(5deg) translateY(2px)} 70%{transform:var(--ot,scaleX(-1)) rotate(-3deg) translateY(1px)} }
      @keyframes oyenTalking  { 0%,100%{transform:var(--ot,scaleX(-1)) scale(1)} 50%{transform:var(--ot,scaleX(-1)) scale(1.02) translateY(-2px)} }
      @keyframes oyenPopIn    { 0%{transform:var(--ot,scaleX(-1)) scale(0.75);opacity:0.6} 60%{transform:var(--ot,scaleX(-1)) scale(1.1)} 100%{transform:var(--ot,scaleX(-1)) scale(1.08);opacity:1} }

      /* ── Idle micro-behaviours ── */
      @keyframes oyenBlink     { 0%,90%,100%{transform:scaleY(1)} 95%{transform:scaleY(0.15)} }
      @keyframes oyenDeepBreath{ 0%,100%{transform:scaleY(1) scaleX(1)} 40%{transform:scaleY(1.06) scaleX(0.96)} 70%{transform:scaleY(0.97) scaleX(1.03)} }
      @keyframes oyenTailWag   { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-8deg) translateX(4px)} 75%{transform:rotate(8deg) translateX(-4px)} }

      /* ── Overlays ── */
      @keyframes oyenSparkle  { 0%,100%{opacity:0;transform:scale(0.5) translateY(0)} 50%{opacity:1;transform:scale(1.1) translateY(-6px)} }
      @keyframes oyenStar     { 0%{opacity:0;transform:scale(0.3) translateY(4px)} 50%{opacity:1;transform:scale(1.2) translateY(-8px)} 100%{opacity:0;transform:scale(0.8) translateY(-14px)} }
      @keyframes oyenDot      { 0%,100%{transform:scaleY(0.5);opacity:0.4} 50%{transform:scaleY(1);opacity:1} }
      @keyframes oyenZzz      { 0%{opacity:0;transform:translate(0,0) scale(0.6)} 40%{opacity:0.9} 100%{opacity:0;transform:translate(-8px,-16px) scale(1.1)} }
      @keyframes oyenHeart    { from{transform:scale(0.9)} to{transform:scale(1.2)} }
      @keyframes oyenBar      { from{transform:scaleY(0.3);opacity:0.5} to{transform:scaleY(1);opacity:1} }

      /* ── Squash/stretch for celebrations ── */
      @keyframes oyenSquash   { 0%{transform:scaleX(1.2) scaleY(0.8)} 50%{transform:scaleX(0.9) scaleY(1.15)} 100%{transform:scaleX(1) scaleY(1)} }
    `}</style>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export const Oyen = memo(function Oyen({
  expression = OYEN_EXPRESSION.IDLE,
  size       = 'md',
  isSpeaking = false,
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
  const { w, h } = SIZE_DIM[size] ?? SIZE_DIM.md
  const src      = ASSET[size]    ?? ASSET.md

  const idleAnim   = useOyenIdle(activeExpression, isSpeaking)
  const OverlayComp = expr.overlay ? OVERLAY_MAP[expr.overlay] : null

  // Combine base animation with idle override
  const animStr = idleAnim
    ? `${idleAnim} 0.7s ease-in-out 1`
    : `${expr.anim} ${getAnimDuration(expr.anim)} ease-in-out infinite`

  return (
    <div
      className={`relative inline-block select-none ${className}`}
      style={{ width: w, height: h, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      role={onClick ? 'button' : 'img'}
      aria-label={expr.label}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 rounded-full pointer-events-none"
           style={{ background: `radial-gradient(ellipse at center, ${expr.glow} 0%, transparent 70%)`,
                    transform: 'scale(1.4)', zIndex: 0, transition: 'background 0.4s ease' }}
           aria-hidden="true" />

      {/* Mascot image */}
      <img
        src={src}
        alt={expr.label}
        width={w} height={h}
        draggable={false}
        loading="eager"
        decoding="async"
        style={{
          position: 'relative', zIndex: 1,
          width: '100%', height: '100%',
          objectFit: 'contain',
          filter: expr.filter,
          transform: expr.transform,
          animation: animStr,
          transformOrigin: 'center bottom',
          transition: 'filter 0.3s ease, transform 0.4s cubic-bezier(0.34,1.2,0.64,1)',
          willChange: 'transform',
          imageRendering: size === 'xs' ? 'crisp-edges' : 'auto',
        }}
      />

      {OverlayComp && <OverlayComp size={size} />}
      <OyenKeyframes />
    </div>
  )
})
