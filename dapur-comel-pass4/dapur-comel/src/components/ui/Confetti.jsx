/**
 * Confetti.jsx
 *
 * CSS-only confetti celebration effect.
 * No canvas, no external lib — zero overhead.
 * Pieces fall, rotate, and fade using pure CSS animation.
 */

import { useMemo } from 'react'

const COLORS = ['#FF8C5A', '#E8527A', '#FFD700', '#5EC4B6', '#B89FD8', '#FFFFFF']
const SHAPES = [
  { borderRadius: '2px' },                        // square
  { borderRadius: '50%' },                        // circle
  { borderRadius: '2px', transform: 'rotate(45deg)' }, // diamond
]

export function Confetti({ count = 55 }) {
  const pieces = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id:       i,
      color:    COLORS[i % COLORS.length],
      shape:    SHAPES[i % SHAPES.length],
      left:     `${(i / count) * 100 + (Math.random() * 8 - 4)}%`,
      size:     Math.round(Math.random() * 8 + 6),   // 6–14px
      duration: (Math.random() * 1.5 + 1.8).toFixed(2),
      delay:    (Math.random() * 1.0).toFixed(2),
      wobble:   Math.round(Math.random() * 60 - 30),
    })),
  [count])

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 500 }}
      aria-hidden="true"
    >
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position:        'absolute',
            top:             -16,
            left:            p.left,
            width:           p.size,
            height:          p.size,
            backgroundColor: p.color,
            ...p.shape,
            animation:       `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
            '--wobble':      `${p.wobble}px`,
          }}
        />
      ))}

      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg) translateX(0); opacity: 1; }
          70%  { opacity: 1; }
          100% {
            transform: translateY(105vh) rotate(540deg) translateX(var(--wobble, 0px));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
