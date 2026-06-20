/**
 * KitchenBg.jsx
 *
 * Kitchen scene behind every cooking step.
 * Pure CSS + emoji — zero images, zero SVGs, offline-safe.
 *
 * Layers (back to front):
 *   1. Wall — warm tile gradient
 *   2. Counter — wood grain strip
 *   3. Ambient particles — floating emojis at low opacity
 *   4. Counter edge shadow for depth
 *
 * Each recipe has unique ambient decorations.
 */

import { memo } from 'react'

const RECIPE_AMBIENTS = {
  pancake: { items: ['🧁','✨','🍯','☁️'], accent: '#FFB347' },
  cake:    { items: ['🎀','✨','🍓','🎂'], accent: '#E8527A' },
  pizza:   { items: ['🌿','✨','🍅','🧄'], accent: '#FF6B35' },
  burger:  { items: ['🌿','✨','🧅','🧂'], accent: '#C4521E' },
}

export const KitchenBg = memo(function KitchenBg({ recipe }) {
  const config = RECIPE_AMBIENTS[recipe?.id] ?? RECIPE_AMBIENTS.pancake
  const accent = config.accent

  return (
    <div className="kitchen-bg" aria-hidden="true">

      {/* Wall */}
      <div className="kitchen-wall" />

      {/* Subtle colour tint per recipe */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '62%',
          background: `linear-gradient(180deg, ${accent}12 0%, transparent 100%)`,
        }}
      />

      {/* Ambient floating items */}
      {config.items.map((emoji, i) => (
        <div
          key={i}
          style={{
            position:   'absolute',
            fontSize:   i % 2 === 0 ? '1.4rem' : '1.1rem',
            top:        `${8 + i * 10}%`,
            left:       i < 2 ? `${4 + i * 3}%` : undefined,
            right:      i >= 2 ? `${4 + (i - 2) * 3}%` : undefined,
            '--ao':     '0.14',
            animation:  `ambientFloat ${3.5 + i * 0.7}s ${i * 0.4}s ease-in-out infinite`,
            opacity:    0.14,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {emoji}
        </div>
      ))}

      {/* Counter */}
      <div className="kitchen-counter" />

      {/* Counter top edge — depth line */}
      <div
        style={{
          position:   'absolute',
          bottom:     '42%',
          left: 0, right: 0,
          height:     12,
          background: `linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 100%)`,
        }}
      />

    </div>
  )
})
