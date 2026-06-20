/**
 * StackStep.jsx — Visual polish
 *
 * Each layer is a coloured pill with realistic thickness.
 * Stack grows visually taller with each tap.
 * Layer drops with squash/stretch landing animation.
 * Burger silhouette becomes recognisable as layers accumulate.
 */

import { useState, useCallback, useRef } from 'react'
import { StepShell, SPRING } from './_shared.jsx'
import { hapticSnap, hapticSuccess } from '../../../utils/haptics.js'
import { sfx } from '../../../utils/audio.js'

// Visual config per layer id
const LAYER_STYLES = {
  bun_bottom: { bg: 'linear-gradient(180deg, #DEB887 0%, #C8965A 100%)', h: 28, r: '50% 50% 40% 40% / 60% 60% 40% 40%' },
  patty:      { bg: 'linear-gradient(180deg, #8B4513 0%, #5D2E0C 100%)', h: 22, r: 8 },
  keju:       { bg: 'linear-gradient(180deg, #FFE066 0%, #FFD700 100%)', h: 12, r: 4 },
  salad:      { bg: 'linear-gradient(180deg, #7EC850 0%, #5AAE30 100%)', h: 14, r: 6 },
  tomato:     { bg: 'linear-gradient(180deg, #FF6040 0%, #E03020 100%)', h: 12, r: 4 },
  bun_top:    { bg: 'linear-gradient(180deg, #FFD090 0%, #DEB887 100%)', h: 36, r: '50% 50% 30% 30% / 80% 80% 20% 20%' },
}

export function StackStep({ recipe, step, onComplete }) {
  const layers = step.layers ?? []

  const [placed,   setPlaced]   = useState([])
  const [bouncing, setBouncing] = useState(false)
  const completingRef = useRef(false)

  const handleTap = useCallback(() => {
    if (completingRef.current) return
    const nextIndex = placed.length
    if (nextIndex >= layers.length) return

    hapticSnap()
    sfx.play('stack')
    setBouncing(true)
    setTimeout(() => setBouncing(false), 320)

    const next = [...placed, layers[nextIndex]]
    setPlaced(next)

    if (next.length >= layers.length && !completingRef.current) {
      completingRef.current = true
      hapticSuccess()
      setTimeout(onComplete, 420)
    }
  }, [placed, layers, onComplete])

  const remaining = layers.length - placed.length
  const nextLayer = layers[placed.length]

  return (
    <StepShell step={step}>
      <div className="flex flex-col items-center gap-3 select-none">

        {/* Burger board + stack tap target */}
        <button
          type="button"
          className="relative flex flex-col-reverse items-center justify-end outline-none cooking-board"
          style={{
            width:       200,
            minHeight:   180,
            padding:     '14px 16px 18px',
            touchAction: 'manipulation',
            cursor:      remaining > 0 ? 'pointer' : 'default',
            gap:         0,
          }}
          onPointerUp={handleTap}
          aria-label={`Susun burger — ${remaining} lapisan lagi`}
        >
          {placed.length === 0 && (
            <span style={{ fontSize:'2.5rem', opacity:0.25, marginBottom:8 }} aria-hidden="true">
              🍽️
            </span>
          )}

          {placed.map((layer, i) => {
            const style = LAYER_STYLES[layer.id] ?? { bg:'#DDD', h:18, r:6 }
            const isLast = i === placed.length - 1
            return (
              <div
                key={layer.id}
                style={{
                  width:           '80%',
                  height:          style.h,
                  background:      style.bg,
                  borderRadius:    style.r,
                  boxShadow:       '0 3px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.25)',
                  animation:       isLast && bouncing
                    ? `layerDrop 0.32s ${SPRING} both`
                    : 'none',
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  flexShrink:      0,
                  marginBottom:    2,
                }}
                aria-hidden="true"
              >
                <span style={{ fontSize:'0.75rem', opacity:0.7 }}>{layer.emoji}</span>
              </div>
            )
          })}
        </button>

        {/* Next layer hint */}
        {nextLayer && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full"
               style={{ background:'rgba(255,248,236,0.9)',
                        boxShadow:'0 2px 8px rgba(80,40,10,0.1)' }}>
            <span style={{ fontSize:'1.8rem', filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
                  aria-hidden="true">
              {nextLayer.emoji}
            </span>
            <p className="font-display font-900"
               style={{ fontSize:'0.9rem', color:'rgba(61,43,31,0.7)' }}>
              Tambah {nextLayer.label}!
            </p>
          </div>
        )}

        {!nextLayer && (
          <p className="font-display font-900"
             style={{ fontSize:'1rem', color: recipe.color,
                      animation:`layerDrop 0.4s ${SPRING} both` }}>
            Burger siap! 🍔✨
          </p>
        )}
      </div>
    </StepShell>
  )
}
