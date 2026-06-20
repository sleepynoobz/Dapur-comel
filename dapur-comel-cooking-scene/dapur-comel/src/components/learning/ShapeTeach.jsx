/**
 * ShapeTeach.jsx
 *
 * Shows a geometric shape to teach toddlers (2-3 years).
 * Shapes: Bulatan (circle), Segiempat (square), Segitiga (triangle).
 * Animated SVG shape with color fill matching the food.
 */

import { useEffect, useState } from 'react'
import { hapticSuccess } from '../../utils/haptics.js'

const SHAPES = {
  circle:   { name: 'Bulatan',     emoji: '⭕', Component: CircleShape },
  square:   { name: 'Segiempat',   emoji: '🟥', Component: SquareShape },
  triangle: { name: 'Segitiga',    emoji: '🔺', Component: TriangleShape },
  star:     { name: 'Bintang',     emoji: '⭐', Component: StarShape },
}

function CircleShape({ color }) {
  return (
    <svg viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="52" fill={color} stroke="white" strokeWidth="4" />
    </svg>
  )
}

function SquareShape({ color }) {
  return (
    <svg viewBox="0 0 120 120" width="120" height="120">
      <rect x="14" y="14" width="92" height="92" rx="12" fill={color} stroke="white" strokeWidth="4" />
    </svg>
  )
}

function TriangleShape({ color }) {
  return (
    <svg viewBox="0 0 120 120" width="120" height="120">
      <polygon points="60,8 112,112 8,112" fill={color} stroke="white" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  )
}

function StarShape({ color }) {
  return (
    <svg viewBox="0 0 120 120" width="120" height="120">
      <polygon
        points="60,5 74,45 115,45 82,70 94,110 60,87 26,110 38,70 5,45 46,45"
        fill={color} stroke="white" strokeWidth="3" strokeLinejoin="round"
      />
    </svg>
  )
}

export function ShapeTeach({ shape = 'circle', color = '#FF8C5A', onDone }) {
  const [visible, setVisible] = useState(false)

  const cfg = SHAPES[shape] ?? SHAPES.circle
  const ShapeComp = cfg.Component

  useEffect(() => {
    hapticSuccess()
    setTimeout(() => setVisible(true), 30)
    const hideTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 300)
    }, 2600)
    return () => clearTimeout(hideTimer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      onClick={() => { setVisible(false); setTimeout(onDone, 300) }}
      style={{
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:            16,
        opacity:        visible ? 1 : 0,
        transform:      visible ? 'scale(1)' : 'scale(0.75)',
        transition:    'opacity 0.3s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        padding:       '20px 0',
        cursor:        'pointer',
      }}
    >
      {/* Animated shape */}
      <div style={{
        filter:    'drop-shadow(0 6px 16px rgba(0,0,0,0.2))',
        animation: visible ? 'shapeWobble 2s ease-in-out infinite' : 'none',
      }}>
        <ShapeComp color={color} />
      </div>

      {/* Labels */}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily:    "'Nunito', sans-serif",
          fontWeight:     700,
          fontSize:      '0.85rem',
          color:         'rgba(61,43,31,0.5)',
          margin:        '0 0 2px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}>
          🔷 Bentuk
        </p>
        <p style={{
          fontFamily: "'Fredoka One', 'Nunito', sans-serif",
          fontWeight:  900,
          fontSize:   '2.8rem',
          color:      '#3D2B1F',
          margin:      0,
          lineHeight:  1.1,
        }}>
          {cfg.name}!
        </p>
      </div>

      <style>{`
        @keyframes shapeWobble {
          0%,100% { transform: rotate(-4deg) scale(1); }
          50%      { transform: rotate(4deg) scale(1.05); }
        }
      `}</style>
    </div>
  )
}
