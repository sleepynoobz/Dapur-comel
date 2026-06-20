/**
 * ColorSpot.jsx
 *
 * Teaches one color during cooking. Large color circle + big word.
 * Designed for 2-3 year olds — simple, bold, 2.5 seconds auto-dismiss.
 *
 * Usage: <ColorSpot colorName="Kuning" colorHex="#FFD700" emoji="🟡" onDone={fn} />
 */

import { useEffect, useState } from 'react'
import { hapticSuccess } from '../../utils/haptics.js'

export function ColorSpot({ colorName, colorHex, emoji, onDone }) {
  const [phase, setPhase] = useState('in')

  useEffect(() => {
    hapticSuccess()
    const hideTimer = setTimeout(() => {
      setPhase('out')
      setTimeout(onDone, 300)
    }, 2400)
    return () => clearTimeout(hideTimer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const visible = phase === 'in'

  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      gap:             16,
      opacity:         visible ? 1 : 0,
      transform:       visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.85)',
      transition:     'opacity 0.3s ease, transform 0.35s cubic-bezier(0.34,1.2,0.64,1)',
      padding:        '20px 0',
    }}
    onClick={() => { setPhase('out'); setTimeout(onDone, 300) }}
    >
      {/* Big color circle — the main visual */}
      <div style={{
        width:        120,
        height:       120,
        borderRadius: '50%',
        background:   colorHex,
        boxShadow:    `0 8px 32px ${colorHex}88, 0 0 0 8px ${colorHex}33`,
        display:      'flex',
        alignItems:   'center',
        justifyContent:'center',
        fontSize:     '3.5rem',
        animation:    'colorPop 0.5s cubic-bezier(0.34,1.7,0.64,1)',
      }}>
        {emoji}
      </div>

      {/* "Warna" label */}
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
          🎨 Warna
        </p>
        <p style={{
          fontFamily: "'Fredoka One', 'Nunito', sans-serif",
          fontWeight:  900,
          fontSize:   '2.8rem',
          color:      '#3D2B1F',
          margin:      0,
          lineHeight:  1.1,
        }}>
          {colorName}!
        </p>
      </div>

      <style>{`
        @keyframes colorPop {
          0%   { transform: scale(0); }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
