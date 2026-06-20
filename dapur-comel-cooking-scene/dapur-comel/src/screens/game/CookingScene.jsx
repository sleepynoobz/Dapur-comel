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

// ── Persistent food object per recipe ────────────────────────────────────────
// Renders the food in its current cooking state based on stepIndex.
// This is the CONTINUITY piece — food stays in same position throughout.
function FoodObject({ recipe, stepIndex, totalSteps }) {
  const progress = totalSteps > 0 ? stepIndex / totalSteps : 0

  if (recipe.id === 'pancake') return <PancakeFoodObject progress={progress} stepIndex={stepIndex} />
  if (recipe.id === 'cake')    return <CakeFoodObject    progress={progress} stepIndex={stepIndex} />
  if (recipe.id === 'pizza')   return <PizzaFoodObject   progress={progress} stepIndex={stepIndex} />
  if (recipe.id === 'burger')  return <BurgerFoodObject  progress={progress} stepIndex={stepIndex} />
  return null
}

function PancakeFoodObject({ progress, stepIndex }) {
  // Shows: batter bowl + pan with evolving pancake
  const hasBatter    = stepIndex >= 1
  const inPan        = stepIndex >= 3
  const isBrowning   = stepIndex >= 4
  const isFlipped    = stepIndex >= 5
  const hasStack     = stepIndex >= 6

  const browning = Math.min(Math.max((stepIndex - 4) / 2, 0), 1)
  const panColor = inPan
    ? `radial-gradient(circle at 40% 35%, ${isFlipped ? '#C87820' : `rgb(${255-browning*40},${220-browning*70},${150-browning*80})`} 0%, #8B4A10 80%)`
    : 'radial-gradient(circle, #555 0%, #333 100%)'

  return (
    <div className="absolute pointer-events-none" style={{ inset: 0 }} aria-hidden="true">
      {/* Batter bowl — left side */}
      {hasBatter && (
        <div style={{
          position:'absolute', left:'6%', bottom:'38%',
          width: 80, height: 56,
          background: 'linear-gradient(160deg, #FFF8EC, #F0D8A8 60%, #E0C090)',
          borderRadius: '50% 50% 48% 48% / 28% 28% 72% 72%',
          boxShadow: 'inset 0 8px 16px rgba(0,0,0,0.12), 0 4px 12px rgba(80,40,10,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <div style={{
            position:'absolute', bottom:0, left:0, right:0,
            height: `${hasBatter ? 65 : 0}%`,
            background: `rgba(255,220,130,${0.3 + browning*0.3})`,
            borderRadius: '0 0 50% 50%',
            transition: 'height 0.5s ease',
          }} />
          <span style={{ fontSize:'1.1rem', position:'relative', zIndex:1 }}>🥣</span>
        </div>
      )}

      {/* Stove + pan — centre */}
      <div style={{
        position:'absolute', left:'50%', transform:'translateX(-50%)',
        bottom:'35%', width: 140, height: 130,
      }}>
        {/* Stove surface */}
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:24,
          background:'linear-gradient(180deg, #3A3A3A, #252525)',
          borderRadius: '8px 8px 12px 12px',
          boxShadow:'0 4px 12px rgba(0,0,0,0.35)',
        }}>
          {/* Burner rings */}
          <div style={{
            position:'absolute', top:4, left:'50%', marginLeft:-24,
            width:48, height:16,
            borderRadius:'50%',
            border: inPan ? '2px solid #FF6020' : '2px solid #555',
            boxShadow: inPan ? '0 0 8px rgba(255,100,0,0.6)' : 'none',
            transition: 'border-color 0.5s ease, box-shadow 0.5s ease',
          }} />
        </div>

        {/* Pan */}
        <div style={{
          position:'absolute', bottom:16, left:'50%', marginLeft:-56,
          width:112, height:90,
          background: 'linear-gradient(160deg, #5A5A5A, #3D3D3D)',
          borderRadius: '50% 50% 45% 45% / 30% 30% 70% 70%',
          boxShadow: 'inset 0 8px 20px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.3)',
          display:'flex', alignItems:'center', justifyContent:'center',
          overflow:'hidden',
        }}>
          {/* Pan contents */}
          {inPan && (
            <div style={{
              width:76, height:60,
              borderRadius:'50% 50% 45% 45% / 30% 30% 70% 70%',
              background: panColor,
              boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.15)',
              transition: 'background 0.4s ease',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {/* Bubbles when batter stage */}
              {isBrowning && !isFlipped && (
                <>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      position:'absolute',
                      width:8, height:8,
                      borderRadius:'50%',
                      background:'rgba(255,220,130,0.8)',
                      top:`${30+i*18}%`, left:`${22+i*24}%`,
                      animation:`sizzleBubble ${0.8+i*0.2}s ${i*0.15}s ease-out infinite`,
                    }} />
                  ))}
                </>
              )}
            </div>
          )}

          {/* Pan handle */}
          <div style={{
            position:'absolute', right:-28, top:'40%', marginTop:-7,
            width:32, height:14,
            background:'linear-gradient(90deg, #3D3D3D, #2A2A2A)',
            borderRadius:'0 7px 7px 0',
          }} />
        </div>
      </div>

      {/* Pancake stack result — right side */}
      {hasStack && (
        <div style={{
          position:'absolute', right:'6%', bottom:'36%',
          display:'flex', flexDirection:'column-reverse', gap:2,
          animation:'layerDrop 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width:64, height:14,
              background:'radial-gradient(circle at 45% 35%, #FFD080, #C87820)',
              borderRadius:'50%',
              boxShadow:'0 2px 6px rgba(0,0,0,0.2)',
            }} />
          ))}
          <span style={{ fontSize:'1rem', textAlign:'center' }}>🧈</span>
        </div>
      )}
    </div>
  )
}

function CakeFoodObject({ progress, stepIndex }) {
  const hasBatter = stepIndex >= 3
  const inOven    = stepIndex >= 4
  const isReady   = stepIndex >= 5
  const decorated = stepIndex >= 6

  return (
    <div className="absolute pointer-events-none" style={{ inset:0 }} aria-hidden="true">
      {/* Mixing bowl — centre-left */}
      <div style={{
        position:'absolute', left:'50%', marginLeft:-50,
        bottom: inOven ? '60%' : '36%',
        transition:'bottom 0.6s cubic-bezier(0.34,1.2,0.64,1)',
        width:100, height:72,
        background:'linear-gradient(160deg, #FFF8EC, #F0D8A8 60%, #E0C090)',
        borderRadius:'50% 50% 48% 48% / 28% 28% 72% 72%',
        boxShadow:'inset 0 8px 16px rgba(0,0,0,0.12), 0 4px 14px rgba(80,40,10,0.2)',
        display:'flex', alignItems:'center', justifyContent:'center',
        overflow:'hidden',
      }}>
        <div style={{
          position:'absolute', bottom:0, left:0, right:0,
          height:`${hasBatter?70:0}%`,
          background:`rgba(255,200,150,${0.5+progress*0.3})`,
          borderRadius:'0 0 50% 50%',
          transition:'height 0.5s ease',
        }} />
        <span style={{ fontSize:'1.3rem', position:'relative', zIndex:1 }}>
          {isReady ? '🎂' : '🥣'}
        </span>
      </div>

      {/* Oven — right side, shows when baking */}
      {inOven && (
        <div style={{
          position:'absolute', right:'4%', bottom:'32%',
          width:100, height:110,
          background:'linear-gradient(160deg, #5A5A5A, #3D3D3D)',
          borderRadius:16,
          boxShadow: isReady
            ? '0 0 0 3px rgba(255,180,50,0.5), 0 6px 24px rgba(200,100,0,0.35)'
            : '0 6px 20px rgba(0,0,0,0.3)',
          transition:'box-shadow 0.5s ease',
        }}>
          <div style={{
            position:'absolute', top:14, left:10, right:10, height:52,
            background: isReady
              ? 'radial-gradient(circle, #FFD700, #FF6B00 60%, #2A0A00)'
              : 'radial-gradient(circle, #FF4000, #1A0000)',
            borderRadius:8,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <span style={{ fontSize:'1.8rem', opacity: isReady?1:0.5 }}>🎂</span>
          </div>
          <div style={{ position:'absolute', bottom:12, left:20, right:20, height:8,
                        background:'rgba(255,255,255,0.12)', borderRadius:4 }} />
        </div>
      )}

      {/* Decorated cake result */}
      {decorated && (
        <div style={{
          position:'absolute', left:'8%', bottom:'34%',
          animation:'layerDrop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
          fontSize:'3.5rem',
          filter:'drop-shadow(0 8px 16px rgba(232,82,122,0.4))',
        }}>🍰</div>
      )}
    </div>
  )
}

function PizzaFoodObject({ progress, stepIndex }) {
  const hasDough   = stepIndex >= 1
  const hasSauce   = stepIndex >= 2
  const hasToppings= stepIndex >= 3
  const inOven     = stepIndex >= 4
  const isSliced   = stepIndex >= 5

  const sauceOpacity = hasSauce ? Math.min((stepIndex-1)*0.5, 1) : 0

  return (
    <div className="absolute pointer-events-none" style={{ inset:0 }} aria-hidden="true">
      {/* Pizza board — centre */}
      <div style={{
        position:'absolute', left:'50%', marginLeft:-75,
        bottom:'32%',
        width:150, height:150,
      }}>
        {/* Wooden board */}
        <div style={{
          position:'absolute', inset:0,
          background:'linear-gradient(160deg, #DEB887, #C8965A)',
          borderRadius:12,
          boxShadow:'inset 0 4px 8px rgba(0,0,0,0.12), 0 6px 20px rgba(80,40,10,0.25)',
        }} />

        {/* Pizza base */}
        {hasDough && (
          <div style={{
            position:'absolute', top:12, left:12, right:12, bottom:12,
            borderRadius:'50%',
            background:'radial-gradient(circle at 40% 35%, #FFE4A0, #F0C060 55%, #D4A040)',
            boxShadow:'inset 0 -6px 12px rgba(0,0,0,0.1)',
            overflow:'hidden',
          }}>
            {/* Sauce layer */}
            <div style={{
              position:'absolute', inset:10,
              borderRadius:'50%',
              background:`radial-gradient(circle, rgba(200,40,20,${sauceOpacity}) 0%, transparent 80%)`,
              transition:'background 0.4s ease',
            }} />

            {/* Toppings */}
            {hasToppings && (
              <div style={{ position:'absolute', inset:0,
                            display:'flex', flexWrap:'wrap',
                            alignItems:'center', justifyContent:'center',
                            gap:2, padding:8 }}>
                {['🍄','🫒','🍅','🧀'].map((e,i) => (
                  <span key={i} style={{
                    fontSize:'0.7rem', opacity:0,
                    animation:`toppingSnap 0.3s ${0.1+i*0.08}s cubic-bezier(0.34,1.56,0.64,1) both`,
                  }}>{e}</span>
                ))}
              </div>
            )}

            {/* Slice lines */}
            {isSliced && (
              <svg style={{ position:'absolute', inset:0, borderRadius:'50%', overflow:'hidden' }}
                   viewBox="0 0 126 126" width="100%" height="100%">
                {[0,45,90,135].map(angle => (
                  <line key={angle}
                    x1="63" y1="63"
                    x2={63 + Math.cos(angle*Math.PI/180)*60}
                    y2={63 + Math.sin(angle*Math.PI/180)*60}
                    stroke="rgba(255,255,255,0.85)" strokeWidth="2"
                  />
                ))}
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Sauce bowl — left */}
      {hasSauce && (
        <div style={{
          position:'absolute', left:'5%', bottom:'40%',
          width:60, height:42,
          background:'linear-gradient(160deg, #FF8060, #CC3020)',
          borderRadius:'50% 50% 48% 48% / 28% 28% 72% 72%',
          boxShadow:'inset 0 6px 12px rgba(0,0,0,0.2), 0 4px 10px rgba(200,40,0,0.3)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <span style={{ fontSize:'0.9rem' }}>🍅</span>
        </div>
      )}

      {/* Oven overlay when baking */}
      {inOven && !isSliced && (
        <div style={{
          position:'absolute', inset:0,
          background:'radial-gradient(circle at 50% 60%, rgba(255,120,0,0.15) 0%, transparent 70%)',
          animation:'brownPulse 1.5s ease-in-out infinite',
        }} />
      )}
    </div>
  )
}

function BurgerFoodObject({ progress, stepIndex }) {
  const isGrilling = stepIndex >= 1
  const isFlipped  = stepIndex >= 2
  const layerCount = Math.max(0, stepIndex - 2)  // each STACK tap adds a layer

  const LAYERS = [
    { id:'bun_b',  bg:'linear-gradient(180deg, #DEB887, #C8965A)', h:22, r:'50% 50% 40% 40% / 60% 60% 40% 40%' },
    { id:'patty',  bg:'linear-gradient(180deg, #8B4513, #5D2E0C)', h:18, r:6 },
    { id:'cheese', bg:'linear-gradient(180deg, #FFE066, #FFD700)', h:10, r:4 },
    { id:'salad',  bg:'linear-gradient(180deg, #7EC850, #5AAE30)', h:12, r:6 },
    { id:'tomato', bg:'linear-gradient(180deg, #FF6040, #E03020)', h:10, r:4 },
    { id:'bun_t',  bg:'linear-gradient(180deg, #FFD090, #DEB887)', h:28, r:'50% 50% 30% 30% / 80% 80% 20% 20%' },
  ]

  const visibleLayers = layerCount > 0 ? LAYERS.slice(0, Math.min(layerCount, LAYERS.length)) : []

  return (
    <div className="absolute pointer-events-none" style={{ inset:0 }} aria-hidden="true">
      {/* Pan for grilling */}
      {isGrilling && (
        <div style={{
          position:'absolute', left:'50%', marginLeft:-60,
          bottom:'35%', width:120, height:100,
        }}>
          {/* Pan */}
          <div style={{
            position:'absolute', bottom:0, left:0, right:0, height:80,
            background:'linear-gradient(160deg, #5A5A5A, #3D3D3D)',
            borderRadius:'50% 50% 45% 45% / 30% 30% 70% 70%',
            boxShadow:'inset 0 8px 20px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.3)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            {/* Patty */}
            <div style={{
              width:72, height:16,
              background: isFlipped
                ? 'linear-gradient(180deg, #8B4513, #5D2E0C)'
                : 'linear-gradient(180deg, #B05A30, #7A3010)',
              borderRadius:6,
              boxShadow:'inset 0 2px 6px rgba(0,0,0,0.2)',
            }}>
              {/* Grill marks */}
              {isFlipped && (
                <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
                  {[3,9].map(y => (
                    <line key={y} x1="10%" y1={`${y}px`} x2="90%" y2={`${y}px`}
                      stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
                  ))}
                </svg>
              )}
            </div>
            {/* Handle */}
            <div style={{
              position:'absolute', right:-22, top:'40%', marginTop:-5,
              width:26, height:10,
              background:'#3D3D3D', borderRadius:'0 5px 5px 0',
            }} />
          </div>
        </div>
      )}

      {/* Burger plate — appears after stacking */}
      {layerCount > 0 && (
        <div style={{
          position:'absolute', left:'50%', marginLeft:-55,
          bottom:'33%',
        }}>
          {/* Plate */}
          <div style={{
            width:110, height:18,
            background:'linear-gradient(180deg, #F0F0F0, #D8D8D8)',
            borderRadius:'50%',
            boxShadow:'0 4px 8px rgba(0,0,0,0.15)',
            marginTop:4,
          }} />
          {/* Layers */}
          <div style={{
            display:'flex', flexDirection:'column-reverse',
            alignItems:'center', gap:1,
            position:'absolute', bottom:10, left:'50%', marginLeft:-45,
            width:90,
          }}>
            {visibleLayers.map((layer, i) => (
              <div key={layer.id} style={{
                width:'100%', height:layer.h,
                background:layer.bg,
                borderRadius:layer.r,
                boxShadow:'0 2px 4px rgba(0,0,0,0.15)',
                animation:`layerDrop 0.3s ${i*0.05}s cubic-bezier(0.34,1.56,0.64,1) both`,
              }} />
            ))}
          </div>
        </div>
      )}

      {/* Condiment bottles — right side */}
      <div style={{ position:'absolute', right:'5%', bottom:'36%',
                    display:'flex', gap:8, alignItems:'flex-end' }}>
        <div style={{ fontSize:'1.8rem', filter:'drop-shadow(0 3px 6px rgba(0,0,0,0.2))' }}>🟡</div>
        <div style={{ fontSize:'1.8rem', filter:'drop-shadow(0 3px 6px rgba(0,0,0,0.2))' }}>🔴</div>
      </div>
    </div>
  )
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

      {/* Layer 2: Persistent food object — evolves through steps */}
      <div style={{ position:'absolute', inset:0, zIndex:2 }}>
        <FoodObject recipe={recipe} stepIndex={stepIndex} totalSteps={totalSteps} />
      </div>

      {/* Layer 3: Step interaction — gesture zone, centred above food */}
      <div
        style={{
          position: 'absolute',
          top:       0,
          left:      0,
          right:     0,
          bottom:    '38%',   // sits above counter
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
