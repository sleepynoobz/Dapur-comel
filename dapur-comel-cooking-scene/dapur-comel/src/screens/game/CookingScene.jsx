/**
 * CookingScene.jsx
 *
 * THE PERSISTENT COOKING ENVIRONMENT.
 * This wraps all step interactions — the scene never disappears.
 * Food evolves visually as steps advance. Kitchen stays alive throughout.
 *
 * Architecture:
 *   ┌─────────────────────────────────────┐
 *   │  SCENE BG (window, cabinets, wall)  │ ← z:0
 *   │  COUNTER (wood surface)             │ ← z:1
 *   │  STAGED PROPS (nearby ingredients)  │ ← z:2
 *   │  FOOD OBJECT (evolves per step)     │ ← z:3  ← persistent
 *   │  STEP INTERACTION (gesture zone)    │ ← z:4  ← changes per step
 *   │  OYEN PEEK (bottom edge, reacts)    │ ← z:5  ← fixed position
 *   └─────────────────────────────────────┘
 *
 * The food object has its own state driven by props:
 *   stepIndex → determines food visual stage
 *   recipe.id → determines which food type to render
 *
 * Oyen peeks from bottom-left, not in top HUD.
 * Top HUD kept minimal: back button + progress dots only.
 */

import { memo, useMemo } from 'react'
import { Oyen } from '../../components/mascot/Oyen.jsx'

// ── Recipe scene configs ──────────────────────────────────────────────────────
const SCENE_CONFIGS = {
  pancake: {
    wallColor:    '#FFF4E0',
    wallColor2:   '#FFEBB0',
    windowLight:  'rgba(255,230,150,0.35)',
    counterColor: '#C8956C',
    counterDark:  '#9A6840',
    cabinets:     '#D4956A',
    props: [
      { emoji: '🧈', x: '8%',  y: '54%', size: '2rem',  label: 'butter', rot: -8 },
      { emoji: '🍯', x: '82%', y: '52%', size: '1.8rem', label: 'honey',  rot: 5  },
      { emoji: '🥛', x: '76%', y: '48%', size: '2.2rem', label: 'milk',   rot: -3 },
      { emoji: '🌾', x: '12%', y: '48%', size: '1.6rem', label: 'flour',  rot: 8  },
    ],
    ambientItems: ['☀️', '✨', '🌟'],
    label: 'Stesen Pancake',
  },
  cake: {
    wallColor:    '#FFF0F4',
    wallColor2:   '#FFD8EC',
    windowLight:  'rgba(255,200,220,0.3)',
    counterColor: '#D4956A',
    counterDark:  '#A06840',
    cabinets:     '#C8806A',
    props: [
      { emoji: '🍓', x: '8%',  y: '54%', size: '2rem',  label: 'strawberry', rot: -5 },
      { emoji: '🧁', x: '80%', y: '50%', size: '2rem',  label: 'cupcake',    rot: 6  },
      { emoji: '🥚', x: '75%', y: '56%', size: '1.8rem', label: 'egg',       rot: -4 },
      { emoji: '🌾', x: '14%', y: '49%', size: '1.7rem', label: 'flour',     rot: 10 },
    ],
    ambientItems: ['🎀', '✨', '🌸'],
    label: 'Stesen Kek',
  },
  pizza: {
    wallColor:    '#FFF8F0',
    wallColor2:   '#FFE8D0',
    windowLight:  'rgba(255,180,100,0.25)',
    counterColor: '#B8804A',
    counterDark:  '#8A5828',
    cabinets:     '#C8905A',
    props: [
      { emoji: '🍅', x: '8%',  y: '54%', size: '2rem',  label: 'tomato',  rot: -6 },
      { emoji: '🧀', x: '80%', y: '52%', size: '2rem',  label: 'cheese',  rot: 4  },
      { emoji: '🍄', x: '76%', y: '58%', size: '1.7rem', label: 'mushroom', rot: -8 },
      { emoji: '🌿', x: '12%', y: '50%', size: '1.6rem', label: 'herbs',  rot: 12 },
    ],
    ambientItems: ['🌶️', '✨', '🫒'],
    label: 'Stesen Pizza',
  },
  burger: {
    wallColor:    '#FFF8EC',
    wallColor2:   '#FFE8C0',
    windowLight:  'rgba(255,200,120,0.28)',
    counterColor: '#C08040',
    counterDark:  '#8A5818',
    cabinets:     '#B87040',
    props: [
      { emoji: '🥬', x: '8%',  y: '54%', size: '2rem',  label: 'lettuce', rot: -5 },
      { emoji: '🍅', x: '80%', y: '52%', size: '1.9rem', label: 'tomato', rot: 5  },
      { emoji: '🧂', x: '76%', y: '58%', size: '1.6rem', label: 'salt',   rot: -3 },
      { emoji: '🧅', x: '13%', y: '50%', size: '1.7rem', label: 'onion',  rot: 8  },
    ],
    ambientItems: ['🌭', '✨', '🫙'],
    label: 'Stesen Burger',
  },
}

// ── Scene Background — deep illustrated kitchen ───────────────────────────────
const SceneBackground = memo(function SceneBackground({ config }) {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {/* Sky / upper wall */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:'58%',
        background:`linear-gradient(180deg, ${config.wallColor} 0%, ${config.wallColor2} 100%)`,
      }} />

      {/* Tile grid */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:'58%',
        backgroundImage:'linear-gradient(rgba(200,160,100,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(200,160,100,0.12) 1px, transparent 1px)',
        backgroundSize:'44px 44px',
      }} />

      {/* Window — top-left, warm light flooding in */}
      <div style={{
        position:'absolute', top:'4%', left:'6%',
        width:72, height:60,
        background:`linear-gradient(135deg, ${config.windowLight}, rgba(255,255,255,0.6))`,
        borderRadius:8,
        boxShadow:'inset 0 0 12px rgba(255,220,150,0.4), 0 2px 8px rgba(0,0,0,0.1)',
        border:'3px solid rgba(200,160,80,0.4)',
        overflow:'hidden',
      }}>
        {/* Window cross */}
        <div style={{ position:'absolute', top:0, left:'50%', marginLeft:-1, width:2, height:'100%', background:'rgba(200,160,80,0.5)' }} />
        <div style={{ position:'absolute', top:'50%', left:0, right:0, height:2, background:'rgba(200,160,80,0.5)' }} />
      </div>

      {/* Hanging utensils — top-right */}
      <div style={{
        position:'absolute', top:'3%', right:'5%',
        display:'flex', gap:10,
      }}>
        {['🔪','🥄','🍴'].map((e,i) => (
          <div key={i} style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap:2,
          }}>
            <div style={{ width:2, height:14, background:'rgba(160,100,50,0.5)', borderRadius:1 }} />
            <span style={{ fontSize:'1.2rem', opacity:0.65,
                           filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>{e}</span>
          </div>
        ))}
      </div>

      {/* Upper shelf / cabinet line */}
      <div style={{
        position:'absolute', top:'28%', left:0, right:0, height:18,
        background:`linear-gradient(180deg, ${config.cabinets}88, ${config.cabinets}44)`,
        boxShadow:'0 2px 6px rgba(0,0,0,0.1)',
      }} />

      {/* Ambient floating items — very subtle */}
      {config.ambientItems.map((e, i) => (
        <div key={i} style={{
          position:'absolute',
          top: `${10 + i * 11}%`,
          right: `${12 + i * 15}%`,
          fontSize:'1rem',
          opacity:0.1,
          '--ao':'0.1',
          animation:`ambientFloat ${3.5+i*0.7}s ${i*0.4}s ease-in-out infinite`,
        }}>{e}</div>
      ))}

      {/* Counter surface */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, height:'44%',
        background:`linear-gradient(180deg, ${config.counterColor} 0%, ${config.counterDark} 100%)`,
        boxShadow:'inset 0 6px 16px rgba(0,0,0,0.18)',
      }} />
      {/* Counter top highlight */}
      <div style={{
        position:'absolute', bottom:'44%', left:0, right:0, height:10,
        background:'linear-gradient(180deg, rgba(0,0,0,0.2), transparent)',
      }} />
      {/* Counter surface sheen */}
      <div style={{
        position:'absolute', bottom:'36%', left:0, right:0, height:3,
        background:'linear-gradient(90deg, transparent, rgba(255,220,160,0.3), transparent)',
      }} />
    </div>
  )
})

// ── Staged props — ingredients nearby ────────────────────────────────────────
const StagedProps = memo(function StagedProps({ config }) {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {config.props.map((prop, i) => (
        <div key={i} style={{
          position:'absolute',
          left:  prop.x,
          top:   prop.y,
          fontSize: prop.size,
          transform: `rotate(${prop.rot}deg)`,
          filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.18))',
          animation: `ambientFloat ${3.8+i*0.5}s ${i*0.35}s ease-in-out infinite`,
          opacity: 0.9,
          '--ao': '0.9',
        }}>
          {prop.emoji}
        </div>
      ))}
    </div>
  )
})

// ── OyenPeek — peeks from bottom edge ────────────────────────────────────────
function OyenPeek({ expression, isSpeaking }) {
  return (
    <div style={{
      position: 'absolute',
      bottom:   -8,
      right:    16,
      zIndex:   5,
      pointerEvents: 'none',
    }} aria-hidden="true">
      <Oyen expression={expression} size="md" isSpeaking={isSpeaking} />
    </div>
  )
}

// ── Main CookingScene ─────────────────────────────────────────────────────────
export const CookingScene = memo(function CookingScene({
  recipe,
  stepIndex,
  totalSteps,
  oyenExpression,
  isSpeaking,
  children,    // step interaction rendered inside scene
}) {
  const config = useMemo(
    () => SCENE_CONFIGS[recipe?.id] ?? SCENE_CONFIGS.pancake,
    [recipe?.id]
  )

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: config.wallColor }}
    >
      {/* Layer 0: Deep scene background */}
      <SceneBackground config={config} />

      {/* Layer 1: Staged ingredient props */}
      <StagedProps config={config} />

      {/* Layer 2: Step interaction — the ActionStage scene renders the food
          and the cooking action itself, so it gets most of the screen. */}
      <div
        style={{
          position: 'absolute',
          top:       0,
          left:      0,
          right:     0,
          bottom:    '6%',
          zIndex:    3,
          display:   'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>

      {/* Layer 4: Oyen peeks from bottom-right */}
      <OyenPeek expression={oyenExpression} isSpeaking={isSpeaking} />
    </div>
  )
})
