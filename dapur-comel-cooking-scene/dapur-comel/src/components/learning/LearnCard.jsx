/**
 * LearnCard.jsx
 *
 * Popup that appears after each cooking step to reinforce one concept:
 *   - Color  → "Warna KUNING! 🟡"
 *   - Number → "Kita guna DUA! 2️⃣"
 *   - Shape  → "Bentuk BULATAN! ⭕"
 *
 * Designed for 2-3 year olds: 3 seconds on screen, then auto-dismiss.
 * Large emoji, single bold word, high contrast.
 */

import { useEffect, useState, useCallback } from 'react'
import { hapticSuccess } from '../../utils/haptics.js'
import { GameSprite } from '../ui/GameSprite.jsx'

const DISPLAY_MS = 3000

const TYPE_CONFIG = {
  color:  { bg: '#FFF9EC', border: '#FFD700', icon: '🎨', prefix: 'Warna' },
  number: { bg: '#F0FFF4', border: '#5EC4B6', icon: '🔢', prefix: 'Nombor' },
  shape:  { bg: '#FFF0F8', border: '#E8527A', icon: '🔷', prefix: 'Bentuk' },
  word:   { bg: '#F0F4FF', border: '#7B8FD4', icon: '💬', prefix: '' },
}

export function LearnCard({ type = 'color', word, subtext, colorHex, emoji, onDismiss }) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const dismiss = useCallback(() => {
    setLeaving(true)
    setTimeout(() => {
      setVisible(false)
      onDismiss?.()
    }, 280)
  }, [onDismiss])

  useEffect(() => {
    hapticSuccess()
    const showTimer = setTimeout(() => setVisible(true), 30)
    const hideTimer = setTimeout(dismiss, DISPLAY_MS)
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.word

  return (
    <div
      onClick={dismiss}
      style={{
        position:   'fixed',
        inset:       0,
        zIndex:      80,
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.35)',
        opacity:    visible && !leaving ? 1 : 0,
        transition: 'opacity 0.28s ease',
        cursor:     'pointer',
      }}
      aria-label={`Belajar: ${word}`}
    >
      {/* Card */}
      <div
        style={{
          background:   cfg.bg,
          border:       `4px solid ${cfg.border}`,
          borderRadius:  32,
          padding:      '32px 40px',
          textAlign:    'center',
          boxShadow:    '0 16px 48px rgba(0,0,0,0.25)',
          transform:    visible && !leaving ? 'scale(1) translateY(0)' : 'scale(0.7) translateY(30px)',
          transition:   'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          maxWidth:      300,
          minWidth:      240,
        }}
      >
        {/* Color swatch if applicable */}
        {colorHex && (
          <div style={{
            width:        72,
            height:       72,
            borderRadius: '50%',
            background:   colorHex,
            margin:       '0 auto 12px',
            boxShadow:    `0 4px 16px ${colorHex}88`,
            border:       '4px solid rgba(255,255,255,0.9)',
          }} />
        )}

        {/* Main sprite */}
        {!colorHex && emoji && (
          <div style={{ marginBottom: 8, lineHeight: 1 }}>
            <GameSprite emoji={emoji} size={88} />
          </div>
        )}

        {/* Prefix label */}
        {cfg.prefix && (
          <p style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight:  700,
            fontSize:   '0.9rem',
            color:      'rgba(61,43,31,0.5)',
            margin:     '0 0 4px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            {cfg.prefix}
          </p>
        )}

        {/* Main word — very large for 2-3 year olds */}
        <p style={{
          fontFamily: "'Fredoka One', 'Nunito', sans-serif",
          fontWeight:  900,
          fontSize:   '2.8rem',
          color:      '#3D2B1F',
          margin:     0,
          lineHeight:  1.1,
        }}>
          {word}
        </p>

        {/* Subtext */}
        {subtext && (
          <p style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight:  700,
            fontSize:   '1.1rem',
            color:      'rgba(61,43,31,0.6)',
            margin:     '8px 0 0',
          }}>
            {subtext}
          </p>
        )}

        {/* Tap hint */}
        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize:   '0.72rem',
          color:      'rgba(61,43,31,0.35)',
          margin:     '16px 0 0',
          fontWeight:  700,
        }}>
          Ketuk untuk teruskan →
        </p>
      </div>
    </div>
  )
}
