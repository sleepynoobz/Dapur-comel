/**
 * CountBubble.jsx
 *
 * Animated count-up bubbles for 2-3 year olds.
 * Shows: SATU → DUA → TIGA with bouncing emoji.
 *
 * Usage: <CountBubble count={3} emoji="🧀" onDone={callback} />
 */

import { useState, useEffect } from 'react'
import { hapticTap } from '../../utils/haptics.js'
import { GameSprite } from '../ui/GameSprite.jsx'

const MALAY_NUMBERS = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima']
const NUMBER_COLORS = ['', '#FF6B6B', '#FFD700', '#5EC4B6', '#E8527A', '#FF8C5A']

export function CountBubble({ count = 3, emoji = '⭐', onDone }) {
  const [showing, setShowing] = useState(0)
  const [done,    setDone]    = useState(false)

  useEffect(() => {
    const timers = []
    for (let i = 1; i <= count; i++) {
      timers.push(setTimeout(() => {
        hapticTap()
        setShowing(i)
      }, i * 700))
    }
    timers.push(setTimeout(() => {
      setDone(true)
      setTimeout(onDone, 400)
    }, count * 700 + 800))
    return () => timers.forEach(clearTimeout)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const clampedShowing = Math.min(showing, count)

  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      gap:             16,
      padding:        '24px 32px',
    }}>
      {/* Emoji row */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            style={{
              lineHeight:  1,
              transform:   i < clampedShowing ? 'scale(1)' : 'scale(0)',
              opacity:     i < clampedShowing ? 1 : 0,
              transition: `transform 0.35s cubic-bezier(0.34,1.7,0.64,1) ${i * 0.05}s,
                           opacity 0.25s ease ${i * 0.05}s`,
              filter:     'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
            }}
            aria-hidden="true"
          >
            <GameSprite emoji={emoji} size={56} />
          </div>
        ))}
      </div>

      {/* Current number word */}
      {clampedShowing > 0 && (
        <div style={{
          textAlign: 'center',
          animation: 'countPop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          {/* Arabic numeral */}
          <div style={{
            fontFamily: "'Fredoka One', 'Nunito', sans-serif",
            fontSize:    '4.5rem',
            fontWeight:  900,
            color:       NUMBER_COLORS[clampedShowing] ?? '#FF8C5A',
            lineHeight:   1,
            textShadow:  '0 3px 0 rgba(0,0,0,0.1)',
          }}>
            {clampedShowing}
          </div>
          {/* Malay word */}
          <div style={{
            fontFamily: "'Fredoka One', 'Nunito', sans-serif",
            fontSize:    '2rem',
            fontWeight:  900,
            color:       '#3D2B1F',
            marginTop:   4,
          }}>
            {MALAY_NUMBERS[clampedShowing]}
          </div>
        </div>
      )}

      {/* Done message */}
      {done && (
        <div style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize:    '1.2rem',
          fontWeight:  900,
          color:       '#5EC4B6',
          animation:  'countPop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          Pandai kira! 🌟
        </div>
      )}

      <style>{`
        @keyframes countPop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  )
}
