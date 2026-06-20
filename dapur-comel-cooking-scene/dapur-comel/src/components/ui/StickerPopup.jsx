/**
 * StickerPopup.jsx
 *
 * Reward sticker popup shown during celebration.
 * Pops in with spring animation, shimmers, tap to dismiss.
 */

import { useEffect, useState } from 'react'

const STICKERS = {
  'sticker-kek-strawberi': { emoji: '🍰', name: 'Kek Strawberi', bg: '#FFD6E0', glow: '#E8527A' },
  'sticker-pancake':        { emoji: '🥞', name: 'Pancake',       bg: '#FFE8C0', glow: '#FFB347' },
  'sticker-biskut':         { emoji: '🍪', name: 'Biskut',        bg: '#FFD4B0', glow: '#C4521E' },
  'default':                { emoji: '⭐', name: 'Bintang',       bg: '#FFF9D0', glow: '#FFD700' },
}

export function StickerPopup({ stickerId, onDismiss }) {
  const [visible, setVisible] = useState(false)
  const sticker = STICKERS[stickerId] ?? STICKERS.default

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  const handleDismiss = () => {
    setVisible(false)
    setTimeout(onDismiss, 250)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 600 }}
      onClick={handleDismiss}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(61,43,31,0.35)',
          backdropFilter:  'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity:    visible ? 1 : 0,
          transition: 'opacity 0.25s ease',
        }}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        className="relative flex flex-col items-center gap-4 rounded-[2rem] px-10 py-8"
        style={{
          backgroundColor: sticker.bg,
          boxShadow:       `0 0 0 4px ${sticker.glow}40, 0 20px 60px rgba(0,0,0,0.2)`,
          maxWidth:        300,
          transform:       visible ? 'scale(1) rotate(0deg)' : 'scale(0.4) rotate(-10deg)',
          opacity:         visible ? 1 : 0,
          transition:      'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
        }}
        role="dialog"
        aria-label={`Stiker baru: ${sticker.name}`}
        onClick={e => e.stopPropagation()}
      >

        {/* Sticker badge */}
        <div
          className="text-9xl leading-none"
          style={{
            filter:    `drop-shadow(0 0 16px ${sticker.glow}80)`,
            animation: visible ? 'stickerFloat 2s ease-in-out infinite' : 'none',
          }}
          aria-hidden="true"
        >
          {sticker.emoji}
        </div>

        {/* Labels */}
        <div className="text-center">
          <p className="text-[0.7rem] font-display font-900 text-ink-muted uppercase tracking-widest">
            Stiker Baru! ✨
          </p>
          <p className="text-toddler-lg font-display font-900 text-ink mt-0.5">
            {sticker.name}
          </p>
        </div>

        {/* Dismiss hint */}
        <p className="text-toddler-xs text-ink-muted font-body font-700">
          Tap untuk teruskan!
        </p>
      </div>

      <style>{`
        @keyframes stickerFloat {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-8px) rotate(3deg); }
        }
      `}</style>
    </div>
  )
}
