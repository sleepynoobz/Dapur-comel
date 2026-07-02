/**
 * ActionStage.jsx — animated cooking action scenes for toddler steps.
 *
 * Instead of a plain tap button, every step type renders a mini "scene"
 * where the real action visibly happens on each tap:
 *   CRACK_EGG     egg cracks, shell splits, yolk drops into the bowl
 *   POUR          carton tilts, milk stream flows, bowl fills up
 *   STIR          spoon orbits the bowl, batter swirls and blends
 *   FRY           food flips in the pan with a 3D somersault over flames
 *   BAKE          cake slides into the oven, window glows, rises
 *   FLATTEN_DOUGH rolling pin sweeps, dough squashes flatter
 *   SPREAD_SAUCE  sauce spiral grows across the pizza base
 *   ADD_TOPPINGS  toppings rain down and bounce onto the pizza
 *   STACK         burger layers drop and squash into place
 *   DECORATE      sauce zig-zags draw themselves onto the burger
 *
 * Pure SVG + CSS keyframes (perspective/rotateX for the 3D moves).
 * No dependencies. The whole stage is the tap target.
 */

import { memo } from 'react'
import { STEP } from '../../../utils/constants.js'

const W = 320
const H = 260

/* ── shared bits ─────────────────────────────────────────────────────── */

const OUT = '#2A1A0E' // outline colour shared with the sprite art

function Counter() {
  return (
    <g>
      <rect x="-10" y={H - 38} width={W + 20} height="48" fill="#C98A4B" stroke={OUT} strokeWidth="3" rx="6" />
      <line x1="0" y1={H - 24} x2={W} y2={H - 24} stroke="rgba(120,70,20,0.35)" strokeWidth="2" />
    </g>
  )
}

function Bowl({ cx = W / 2, cy = H - 44, rx = 74, fillPct = 0, liquid = '#F5E9D0' }) {
  const rimY  = cy - 58            // top rim centre
  const level = Math.max(0, Math.min(1, fillPct))
  return (
    <g>
      {/* body */}
      <path
        d={`M${cx - rx},${rimY} L${cx - rx + 8},${cy - 14} Q${cx - rx + 14},${cy} ${cx - rx + 30},${cy} L${cx + rx - 30},${cy} Q${cx + rx - 14},${cy} ${cx + rx - 8},${cy - 14} L${cx + rx},${rimY} Z`}
        fill="#5BA8D4" stroke={OUT} strokeWidth="3.5" strokeLinejoin="round"
      />
      {/* inner shading */}
      <path
        d={`M${cx - rx + 10},${rimY + 4} L${cx - rx + 16},${cy - 16} Q${cx - rx + 20},${cy - 6} ${cx - rx + 34},${cy - 6} L${cx},${cy - 6}`}
        fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="6" strokeLinecap="round"
      />
      {/* rim opening */}
      <ellipse cx={cx} cy={rimY} rx={rx} ry="13" fill="#3D7BA8" stroke={OUT} strokeWidth="3.5" />
      {/* contents */}
      {level > 0 && (
        <ellipse
          cx={cx} cy={rimY + 2}
          rx={rx - 8} ry={10}
          fill={liquid} stroke="rgba(0,0,0,0.1)" strokeWidth="1.5"
          style={{ transition: 'all 0.6s ease' }}
        />
      )}
      {/* foot */}
      <rect x={cx - 26} y={cy - 2} width="52" height="7" rx="3.5" fill="#3D7BA8" stroke={OUT} strokeWidth="2.5" />
    </g>
  )
}

function Sparkles({ show }) {
  if (!show) return null
  return (
    <g style={{ animation: 'asPop 0.4s ease-out both' }}>
      {[[40, 50], [W - 44, 62], [60, 130], [W - 60, 140], [W / 2, 30]].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x},${y - 8} L${x + 2.5},${y - 2.5} L${x + 8},${y} L${x + 2.5},${y + 2.5} L${x},${y + 8} L${x - 2.5},${y + 2.5} L${x - 8},${y} L${x - 2.5},${y - 2.5} Z`}
          fill="#FFD700" stroke="#C8900A" strokeWidth="1"
          style={{ animation: `asTwinkle 0.9s ease-in-out ${i * 0.12}s infinite` }}
        />
      ))}
    </g>
  )
}

/* ── CRACK_EGG ───────────────────────────────────────────────────────── */

function CrackEggScene({ progress, done }) {
  const eggX = W / 2, eggY = 74
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <Counter />
      <Bowl fillPct={done ? 0.45 : 0} liquid="#FFE9B0" />
      {done && (
        <ellipse cx={W / 2} cy={H - 100} rx="20" ry="10" fill="#FFC400" stroke="#E8A000" strokeWidth="2"
                 style={{ animation: 'asYolkLand 0.5s cubic-bezier(0.34,1.5,0.64,1) 0.35s both' }} />
      )}
      {!done ? (
        <g key={progress} style={{ animation: progress > 0 ? 'asShake 0.4s ease' : 'asHover 1.6s ease-in-out infinite' }}>
          <path d={`M${eggX},${eggY - 44} C${eggX - 32},${eggY - 44} ${eggX - 40},${eggY - 6} ${eggX - 40},${eggY + 8} C${eggX - 40},${eggY + 34} ${eggX - 22},${eggY + 48} ${eggX},${eggY + 48} C${eggX + 22},${eggY + 48} ${eggX + 40},${eggY + 34} ${eggX + 40},${eggY + 8} C${eggX + 40},${eggY - 6} ${eggX + 32},${eggY - 44} ${eggX},${eggY - 44} Z`}
                fill="#FFF6EA" stroke={OUT} strokeWidth="3.5" />
          <ellipse cx={eggX - 14} cy={eggY - 16} rx="9" ry="14" fill="rgba(255,255,255,0.8)" transform={`rotate(-15 ${eggX - 14} ${eggY - 16})`} />
          {progress > 0 && (
            <path d={`M${eggX - 26},${eggY} L${eggX - 12},${eggY - 10} L${eggX - 2},${eggY + 6} L${eggX + 12},${eggY - 8} L${eggX + 26},${eggY + 2}`}
                  fill="none" stroke={OUT} strokeWidth="2.5" strokeLinejoin="round"
                  style={{ animation: 'asPop 0.25s ease-out both' }} />
          )}
        </g>
      ) : (
        <g>
          <g style={{ animation: 'asShellL 0.7s cubic-bezier(0.3,0.8,0.5,1) both' }}>
            <path d={`M${eggX},${eggY - 44} C${eggX - 32},${eggY - 44} ${eggX - 40},${eggY - 6} ${eggX - 40},${eggY + 8} L${eggX - 14},${eggY + 2} L${eggX},${eggY + 10} L${eggX},${eggY - 44} Z`}
                  fill="#FFF6EA" stroke={OUT} strokeWidth="3" />
          </g>
          <g style={{ animation: 'asShellR 0.7s cubic-bezier(0.3,0.8,0.5,1) both' }}>
            <path d={`M${eggX},${eggY - 44} C${eggX + 32},${eggY - 44} ${eggX + 40},${eggY - 6} ${eggX + 40},${eggY + 8} L${eggX + 14},${eggY + 4} L${eggX},${eggY + 10} L${eggX},${eggY - 44} Z`}
                  fill="#FFF0E0" stroke={OUT} strokeWidth="3" />
          </g>
          <circle cx={eggX} cy={eggY} r="16" fill="#FFC400" stroke="#E8A000" strokeWidth="2.5"
                  style={{ animation: 'asYolkFall 0.55s cubic-bezier(0.5,0,0.8,0.4) both' }} />
          {[-30, 0, 30].map((dx, i) => (
            <path key={i} d={`M${W / 2 + dx},${H - 108} q3,-12 0,-18`} stroke="#FFE9B0" strokeWidth="4" fill="none" strokeLinecap="round"
                  style={{ animation: `asPop 0.4s ease-out ${0.4 + i * 0.06}s both` }} />
          ))}
        </g>
      )}
      <Sparkles show={done} />
    </svg>
  )
}

/* ── POUR ────────────────────────────────────────────────────────────── */

function PourScene({ done }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <Counter />
      <Bowl fillPct={done ? 0.85 : 0.25} liquid="#FFFFFF" />
      {done && (
        <rect x={W / 2 + 26} y={54} width="10" height="104" rx="5" fill="#FFFFFF" stroke="rgba(140,200,232,0.8)" strokeWidth="1.5"
              style={{ transformOrigin: `${W / 2 + 31}px 54px`, animation: 'asStream 0.9s ease-out both' }} />
      )}
      <g style={{
        transformOrigin: `${W / 2 + 66}px 66px`,
        transform: done ? 'rotate(-52deg)' : 'rotate(0deg)',
        transition: 'transform 0.5s cubic-bezier(0.34,1.3,0.64,1)',
        animation: done ? 'none' : 'asHover 1.6s ease-in-out infinite',
      }}>
        <path d={`M${W / 2 + 40},34 L${W / 2 + 66},22 L${W / 2 + 92},34 L${W / 2 + 66},29 Z`} fill="#E0EFF8" stroke={OUT} strokeWidth="2.5" />
        <path d={`M${W / 2 + 40},34 L${W / 2 + 40},96 Q${W / 2 + 40},101 ${W / 2 + 45},101 L${W / 2 + 87},101 Q${W / 2 + 92},101 ${W / 2 + 92},96 L${W / 2 + 92},34 Z`}
              fill="#F4FAFF" stroke={OUT} strokeWidth="3" />
        <ellipse cx={W / 2 + 58} cy={62} rx="8" ry="6" fill={OUT} opacity="0.8" />
        <ellipse cx={W / 2 + 74} cy={78} rx="6" ry="5" fill={OUT} opacity="0.8" />
      </g>
      {done && [-26, 2, 28].map((dx, i) => (
        <circle key={i} cx={W / 2 + dx} cy={H - 104} r="4" fill="#FFFFFF" stroke="rgba(140,200,232,0.6)" strokeWidth="1"
                style={{ animation: `asDroplet 0.6s ease-out ${0.5 + i * 0.1}s both` }} />
      ))}
      <Sparkles show={done} />
    </svg>
  )
}

/* ── STIR ────────────────────────────────────────────────────────────── */

function StirScene({ progress, tapsNeeded, done }) {
  const blend = Math.min(1, progress / tapsNeeded)
  const batter = `rgb(${245 - blend * 8}, ${215 + blend * 14}, ${160 + blend * 20})`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <Counter />
      <Bowl fillPct={0.7} liquid={batter} rx={86} />
      <g style={{ transformOrigin: `${W / 2}px ${H - 96}px`, animation: done ? 'none' : 'asOrbit 1.4s linear infinite' }}>
        <g key={progress} style={{ animation: progress > 0 && !done ? 'asStirFast 0.5s ease' : 'none', transformOrigin: `${W / 2}px ${H - 96}px` }}>
          <rect x={W / 2 + 30} y={26} width="11" height="96" rx="5.5" fill="#C98A4B" stroke={OUT} strokeWidth="2.5" transform={`rotate(14 ${W / 2 + 35} 70)`} />
          <ellipse cx={W / 2 + 52} cy={124} rx="15" ry="20" fill="#B87838" stroke={OUT} strokeWidth="2.5" />
        </g>
      </g>
      <g style={{ transformOrigin: `${W / 2}px ${H - 100}px`, animation: 'asOrbit 2.2s linear infinite reverse' }}>
        <path d={`M${W / 2 - 40},${H - 102} Q${W / 2},${H - 114} ${W / 2 + 40},${H - 100}`} stroke="rgba(200,140,60,0.5)" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d={`M${W / 2 - 24},${H - 96} Q${W / 2 + 6},${H - 106} ${W / 2 + 28},${H - 96}`} stroke="rgba(255,255,255,0.5)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      {blend < 0.7 && (
        <g opacity={1 - blend}>
          <circle cx={W / 2 - 34} cy={H - 100} r="6" fill="#FFC400" />
          <circle cx={W / 2 + 26} cy={H - 106} r="5" fill="#FFF" />
          <circle cx={W / 2 + 4} cy={H - 94} r="4" fill="#FFC400" />
        </g>
      )}
      <Sparkles show={done} />
    </svg>
  )
}

/* ── FRY (with 3D flip) ──────────────────────────────────────────────── */

function FryScene({ done, item = 'pancake' }) {
  const isPatty = item === 'patty'
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
      <Counter />
      {/* stove burner */}
      <rect x={W / 2 - 92} y={H - 46} width="184" height="14" rx="7" fill="#4A4A55" stroke={OUT} strokeWidth="2.5" />
      {[-56, -20, 16, 52].map((dx, i) => (
        <path key={i} d={`M${W / 2 + dx},${H - 46} q5,-14 0,-24 q-5,10 0,24`} fill="#FF8C2A" stroke="#E85510" strokeWidth="1.5"
              style={{ transformOrigin: `${W / 2 + dx}px ${H - 46}px`, animation: `asFlame 0.5s ease-in-out ${i * 0.11}s infinite alternate` }} />
      ))}
      {/* pan */}
      <g style={{ animation: done ? 'asPanNudge 0.8s ease' : 'none', transformOrigin: `${W / 2}px ${H - 62}px` }}>
        <rect x={W / 2 + 78} y={H - 78} width="72" height="10" rx="5" fill="#3A3A44" stroke={OUT} strokeWidth="2.5" />
        <path d={`M${W / 2 - 86},${H - 84} L${W / 2 - 80},${H - 58} Q${W / 2 - 78},${H - 54} ${W / 2 - 72},${H - 54} L${W / 2 + 72},${H - 54} Q${W / 2 + 78},${H - 54} ${W / 2 + 80},${H - 58} L${W / 2 + 86},${H - 84}`}
              fill="#55555F" stroke={OUT} strokeWidth="3" />
      </g>
      {/* the food — 3D flip on tap */}
      <g style={{
        transformOrigin: `${W / 2}px ${H - 88}px`,
        animation: done ? 'asFlip3d 1.1s cubic-bezier(0.45,0,0.4,1) both' : 'asSizzleWiggle 0.9s ease-in-out infinite',
        transformStyle: 'preserve-3d',
      }}>
        {isPatty ? (
          <>
            <ellipse cx={W / 2} cy={H - 82} rx="52" ry="15" fill={done ? '#6B2E10' : '#B4644A'} stroke={OUT} strokeWidth="3" style={{ transition: 'fill 0.4s ease 0.9s' }} />
            <path d={`M${W / 2 - 34},${H - 86} Q${W / 2},${H - 92} ${W / 2 + 34},${H - 86}`} stroke="rgba(255,180,120,0.5)" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx={W / 2} cy={H - 82} rx="52" ry="14" fill={done ? '#D4840A' : '#F5D68A'} stroke={OUT} strokeWidth="3" style={{ transition: 'fill 0.4s ease 0.9s' }} />
            <ellipse cx={W / 2 - 14} cy={H - 86} rx="16" ry="4" fill="rgba(255,240,180,0.6)" />
          </>
        )}
      </g>
      {/* steam */}
      {[-30, 8, 40].map((dx, i) => (
        <path key={i} d={`M${W / 2 + dx},${H - 104} q-6,-12 0,-24 q6,-10 0,-22`} stroke="rgba(255,255,255,0.55)" strokeWidth="4" fill="none" strokeLinecap="round"
              style={{ animation: `asSteam 1.6s ease-in-out ${i * 0.3}s infinite` }} />
      ))}
      <Sparkles show={done} />
    </svg>
  )
}

/* ── BAKE ────────────────────────────────────────────────────────────── */

function BakeScene({ done }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <Counter />
      {/* oven body */}
      <rect x={W / 2 - 90} y={40} width="180" height="152" rx="14" fill="#8A6FD4" stroke={OUT} strokeWidth="3.5" />
      <rect x={W / 2 - 74} y={54} width="148" height="14" rx="7" fill="#6C50BC" stroke={OUT} strokeWidth="2" />
      <circle cx={W / 2 - 58} cy={61} r="4" fill="#FFD700" stroke={OUT} strokeWidth="1.5" />
      <circle cx={W / 2 - 40} cy={61} r="4" fill="#FF6B6B" stroke={OUT} strokeWidth="1.5" />
      {/* window */}
      <rect x={W / 2 - 62} y={82} width="124" height="86" rx="10" fill={done ? '#FFB347' : '#3A2A55'} stroke={OUT} strokeWidth="3"
            style={{ transition: 'fill 0.5s ease' }} />
      {done && (
        <rect x={W / 2 - 62} y={82} width="124" height="86" rx="10" fill="url(#bakeGlow)"
              style={{ animation: 'asGlowPulse 1s ease-in-out infinite alternate' }} />
      )}
      <defs>
        <radialGradient id="bakeGlow" cx="50%" cy="60%" r="70%">
          <stop offset="0%" stopColor="rgba(255,220,120,0.9)" />
          <stop offset="100%" stopColor="rgba(255,140,40,0.2)" />
        </radialGradient>
      </defs>
      {/* cake inside — rises when baking */}
      <g style={{ animation: done ? 'asCakeRise 1.2s ease-out 0.3s both' : 'none' }}>
        <path d={`M${W / 2 - 34},152 L${W / 2 - 28},128 L${W / 2 + 28},128 L${W / 2 + 34},152 Z`} fill="#E8527A" stroke={OUT} strokeWidth="2.5" opacity={done ? 1 : 0.5} />
        <ellipse cx={W / 2} cy={128} rx="28" ry="7" fill="#FFB5D0" stroke={OUT} strokeWidth="2.5" opacity={done ? 1 : 0.5} />
      </g>
      {/* handle */}
      <rect x={W / 2 - 50} y={176} width="100" height="8" rx="4" fill="#6C50BC" stroke={OUT} strokeWidth="2" />
      {/* heat waves above when done */}
      {done && [-40, 0, 40].map((dx, i) => (
        <path key={i} d={`M${W / 2 + dx},34 q-6,-10 0,-20`} stroke="rgba(255,160,60,0.7)" strokeWidth="4" fill="none" strokeLinecap="round"
              style={{ animation: `asSteam 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
      <Sparkles show={done} />
    </svg>
  )
}

/* ── FLATTEN_DOUGH ───────────────────────────────────────────────────── */

function FlattenScene({ progress, tapsNeeded, done }) {
  const t = Math.min(1, progress / tapsNeeded)
  const sx = 1 + t * 0.65, sy = 1 - t * 0.58
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <Counter />
      {/* dough */}
      <g style={{ transform: `translate(${W / 2}px, ${H - 60}px) scale(${sx}, ${sy})`, transition: 'transform 0.45s cubic-bezier(0.34,1.4,0.64,1)' }}>
        <ellipse cx="0" cy="-24" rx="58" ry="34" fill="#F5E2B8" stroke={OUT} strokeWidth="3" />
        <ellipse cx="-18" cy="-34" rx="16" ry="9" fill="rgba(255,250,230,0.7)" />
      </g>
      {/* rolling pin sweeps on each tap */}
      <g key={progress} style={{ animation: progress > 0 ? 'asRollSweep 0.7s ease-in-out both' : 'asHover 1.6s ease-in-out infinite' }}>
        <rect x={W / 2 - 62} y={64} width="124" height="26" rx="13" fill="#D4A46A" stroke={OUT} strokeWidth="3" />
        <rect x={W / 2 - 96} y={70} width="34" height="14" rx="7" fill="#B87838" stroke={OUT} strokeWidth="2.5" />
        <rect x={W / 2 + 62} y={70} width="34" height="14" rx="7" fill="#B87838" stroke={OUT} strokeWidth="2.5" />
        <line x1={W / 2 - 40} y1={77} x2={W / 2 + 40} y2={77} stroke="rgba(120,70,20,0.25)" strokeWidth="2" />
      </g>
      {/* flour puffs */}
      {progress > 0 && [-52, 0, 52].map((dx, i) => (
        <circle key={`${progress}-${i}`} cx={W / 2 + dx} cy={H - 92} r="7" fill="rgba(255,255,255,0.8)"
                style={{ animation: `asDroplet 0.5s ease-out ${i * 0.08}s both` }} />
      ))}
      <Sparkles show={done} />
    </svg>
  )
}

/* ── SPREAD_SAUCE ────────────────────────────────────────────────────── */

function SauceScene({ progress, tapsNeeded, done }) {
  const t = Math.min(1, progress / tapsNeeded)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <Counter />
      {/* pizza base top-down */}
      <ellipse cx={W / 2} cy={H - 96} rx="96" ry="62" fill="#E8B86D" stroke={OUT} strokeWidth="3.5" />
      <ellipse cx={W / 2} cy={H - 96} rx="82" ry="50" fill="#F5D68A" stroke="#D4A24A" strokeWidth="2" />
      {/* growing sauce */}
      <g style={{ transform: `translate(${W / 2}px, ${H - 96}px) scale(${t})`, transition: 'transform 0.5s cubic-bezier(0.34,1.3,0.64,1)' }}>
        <ellipse cx="0" cy="0" rx="72" ry="42" fill="#D94E2B" stroke="#B03A20" strokeWidth="2" />
        <path d="M-40,0 Q-20,-16 0,-4 Q24,10 44,-4" stroke="rgba(255,130,90,0.6)" strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
      {/* spoon dips on each tap */}
      <g key={progress} style={{ animation: progress > 0 ? 'asSpoonDip 0.6s ease-in-out both' : 'asHover 1.6s ease-in-out infinite' }}>
        <rect x={W / 2 + 58} y={20} width="10" height="70" rx="5" fill="#C98A4B" stroke={OUT} strokeWidth="2.5" transform={`rotate(24 ${W / 2 + 63} 55)`} />
        <ellipse cx={W / 2 + 92} cy={92} rx="14" ry="17" fill="#D94E2B" stroke={OUT} strokeWidth="2.5" />
      </g>
      <Sparkles show={done} />
    </svg>
  )
}

/* ── ADD_TOPPINGS ────────────────────────────────────────────────────── */

const TOPPING_WAVES = [
  // wave per tap: [dx, dy, kind]
  [[-38, -12, 'cheese'], [22, 6, 'cheese'], [-4, 18, 'cheese'], [40, -14, 'cheese']],
  [[-50, 8, 'mush'], [12, -18, 'mush'], [48, 12, 'mush']],
  [[-20, -4, 'olive'], [30, 20, 'olive'], [-44, 22, 'olive'], [4, -22, 'olive']],
]

function Topping({ kind }) {
  if (kind === 'cheese') return <rect x="-9" y="-3" width="18" height="6" rx="3" fill="#F9D55A" stroke="#D4A80A" strokeWidth="1.5" transform="rotate(-24)" />
  if (kind === 'mush')   return (
    <g>
      <path d="M-10,2 Q-10,-9 0,-9 Q10,-9 10,2 Z" fill="#F0D5C8" stroke={OUT} strokeWidth="1.8" />
      <rect x="-3" y="2" width="6" height="6" rx="2" fill="#F5E8D8" stroke={OUT} strokeWidth="1.5" />
    </g>
  )
  return <circle r="6" fill="#3A5F2A" stroke={OUT} strokeWidth="1.8" />
}

function ToppingsScene({ progress, done }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <Counter />
      <ellipse cx={W / 2} cy={H - 96} rx="96" ry="62" fill="#E8B86D" stroke={OUT} strokeWidth="3.5" />
      <ellipse cx={W / 2} cy={H - 96} rx="76" ry="46" fill="#D94E2B" stroke="#B03A20" strokeWidth="2" />
      {TOPPING_WAVES.slice(0, progress).map((wave, wi) =>
        wave.map(([dx, dy, kind], i) => (
          <g key={`${wi}-${i}`} style={{ transform: `translate(${W / 2 + dx}px, ${H - 96 + dy}px)` }}>
            <g style={{ animation: wi === progress - 1 ? `asToppingDrop 0.55s cubic-bezier(0.34,1.4,0.64,1) ${i * 0.09}s both` : 'none' }}>
              <Topping kind={kind} />
            </g>
          </g>
        ))
      )}
      {!done && (
        <g style={{ animation: 'asHover 1.6s ease-in-out infinite' }}>
          <g transform={`translate(${W / 2}, 40)`}><Topping kind={['cheese', 'mush', 'olive'][Math.min(progress, 2)]} /></g>
        </g>
      )}
      <Sparkles show={done} />
    </svg>
  )
}

/* ── STACK ───────────────────────────────────────────────────────────── */

const STACK_LAYERS = [
  { id: 'lettuce', y: -14, el: <path d={`M-52,0 Q-40,-12 -26,-3 Q-12,-13 0,-4 Q14,-13 28,-3 Q42,-12 52,0 Q30,8 0,7 Q-30,8 -52,0Z`} fill="#43A047" stroke={OUT} strokeWidth="2.5" /> },
  { id: 'tomato',  y: -26, el: <ellipse rx="44" ry="9" fill="#E53935" stroke={OUT} strokeWidth="2.5" /> },
  { id: 'cheese',  y: -36, el: <path d={`M-48,4 L48,4 L52,-2 L48,-8 L-48,-8 L-52,-2 Z`} fill="#FFD700" stroke={OUT} strokeWidth="2.5" /> },
  { id: 'topbun',  y: -58, el: (
    <g>
      <path d={`M-50,8 Q-50,-18 0,-22 Q50,-18 50,8 Z`} fill="#E8AA5A" stroke={OUT} strokeWidth="3" />
      <ellipse cx="-16" cy="-10" rx="6" ry="3" fill="#F5E6C8" stroke="#C49A3A" strokeWidth="1" />
      <ellipse cx="10" cy="-14" rx="6" ry="3" fill="#F5E6C8" stroke="#C49A3A" strokeWidth="1" />
    </g>
  ) },
]

function StackScene({ progress, done }) {
  const baseY = H - 66
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <Counter />
      {/* plate */}
      <ellipse cx={W / 2} cy={H - 46} rx="92" ry="14" fill="#F4FAFF" stroke={OUT} strokeWidth="3" />
      {/* bottom bun + patty pre-placed */}
      <path d={`M${W / 2 - 48},${baseY} Q${W / 2},${baseY + 14} ${W / 2 + 48},${baseY} L${W / 2 + 44},${baseY - 10} L${W / 2 - 44},${baseY - 10} Z`} fill="#D98C40" stroke={OUT} strokeWidth="3" />
      <ellipse cx={W / 2} cy={baseY - 12} rx="46" ry="10" fill="#6B2E10" stroke={OUT} strokeWidth="2.5" />
      {/* stacked layers drop in */}
      {STACK_LAYERS.slice(0, progress).map((l, i) => (
        <g key={l.id} style={{ transform: `translate(${W / 2}px, ${baseY + l.y}px)` }}>
          <g style={{ animation: i === progress - 1 ? 'asLayerDrop 0.5s cubic-bezier(0.34,1.5,0.64,1) both' : 'none' }}>
            {l.el}
          </g>
        </g>
      ))}
      {/* next layer hovering */}
      {!done && progress < STACK_LAYERS.length && (
        <g style={{ transform: `translate(${W / 2}px, 44px)`, animation: 'asHover 1.4s ease-in-out infinite' }}>
          {STACK_LAYERS[progress].el}
        </g>
      )}
      <Sparkles show={done} />
    </svg>
  )
}

/* ── DECORATE (sauce zig-zags on the finished burger) ───────────────── */

function DecorateScene({ progress, done }) {
  const baseY = H - 66
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <Counter />
      <ellipse cx={W / 2} cy={H - 46} rx="92" ry="14" fill="#F4FAFF" stroke={OUT} strokeWidth="3" />
      {/* full burger */}
      <path d={`M${W / 2 - 48},${baseY} Q${W / 2},${baseY + 14} ${W / 2 + 48},${baseY} L${W / 2 + 44},${baseY - 10} L${W / 2 - 44},${baseY - 10} Z`} fill="#D98C40" stroke={OUT} strokeWidth="3" />
      <ellipse cx={W / 2} cy={baseY - 12} rx="46" ry="10" fill="#6B2E10" stroke={OUT} strokeWidth="2.5" />
      <path d={`M${W / 2 - 52},${baseY - 18} Q${W / 2 - 40},${baseY - 30} ${W / 2 - 26},${baseY - 21} Q${W / 2 - 12},${baseY - 31} ${W / 2},${baseY - 22} Q${W / 2 + 14},${baseY - 31} ${W / 2 + 28},${baseY - 21} Q${W / 2 + 42},${baseY - 30} ${W / 2 + 52},${baseY - 18} Q${W / 2 + 30},${baseY - 10} ${W / 2},${baseY - 11} Q${W / 2 - 30},${baseY - 10} ${W / 2 - 52},${baseY - 18}Z`} fill="#43A047" stroke={OUT} strokeWidth="2.5" />
      <path d={`M${W / 2 - 48},${baseY - 30} L${W / 2 + 48},${baseY - 30} L${W / 2 + 52},${baseY - 36} L${W / 2 + 48},${baseY - 42} L${W / 2 - 48},${baseY - 42} L${W / 2 - 52},${baseY - 36} Z`} fill="#FFD700" stroke={OUT} strokeWidth="2.5" />
      <path d={`M${W / 2 - 50},${baseY - 40} Q${W / 2 - 50},${baseY - 68} ${W / 2},${baseY - 72} Q${W / 2 + 50},${baseY - 68} ${W / 2 + 50},${baseY - 40} Z`} fill="#E8AA5A" stroke={OUT} strokeWidth="3" />
      {/* ketchup zig-zag: tap 1 */}
      {progress >= 1 && (
        <path d={`M${W / 2 - 40},${baseY - 52} L${W / 2 - 24},${baseY - 60} L${W / 2 - 8},${baseY - 52} L${W / 2 + 8},${baseY - 60} L${W / 2 + 24},${baseY - 52} L${W / 2 + 40},${baseY - 60}`}
              fill="none" stroke="#E53935" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
              style={{ strokeDasharray: 160, strokeDashoffset: 160, animation: 'asDrawLine 0.7s ease-out both' }} />
      )}
      {/* mustard zig-zag: tap 2 */}
      {progress >= 2 && (
        <path d={`M${W / 2 - 40},${baseY - 60} L${W / 2 - 24},${baseY - 52} L${W / 2 - 8},${baseY - 60} L${W / 2 + 8},${baseY - 52} L${W / 2 + 24},${baseY - 60} L${W / 2 + 40},${baseY - 52}`}
              fill="none" stroke="#FFD700" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
              style={{ strokeDasharray: 160, strokeDashoffset: 160, animation: 'asDrawLine 0.7s ease-out both' }} />
      )}
      {/* squeeze bottle */}
      {!done && (
        <g style={{ animation: 'asHover 1.4s ease-in-out infinite' }}>
          <path d={`M${W / 2 + 66},30 L${W / 2 + 62},44 L${W / 2 + 78},44 L${W / 2 + 74},30 Z`} fill={progress === 0 ? '#E53935' : '#FFD700'} stroke={OUT} strokeWidth="2" />
          <rect x={W / 2 + 58} y={44} width="24" height="44" rx="8" fill={progress === 0 ? '#E53935' : '#FFD700'} stroke={OUT} strokeWidth="2.5" />
        </g>
      )}
      {done && (
        <g style={{ transform: `translate(${W / 2}px, ${baseY - 86}px)` }}>
          <g style={{ animation: 'asToppingDrop 0.5s cubic-bezier(0.34,1.5,0.64,1) 0.5s both' }}>
            <line x1="0" y1="0" x2="0" y2="18" stroke="#8B5A2B" strokeWidth="2.5" />
            <path d="M0,0 L20,5 L0,10 Z" fill="#FF6B6B" stroke={OUT} strokeWidth="1.5" />
          </g>
        </g>
      )}
      <Sparkles show={done} />
    </svg>
  )
}

/* ── stage wrapper ───────────────────────────────────────────────────── */

const SCENES = {
  [STEP.CRACK_EGG]:     CrackEggScene,
  [STEP.POUR]:          PourScene,
  [STEP.STIR]:          StirScene,
  [STEP.FRY]:           FryScene,
  [STEP.BAKE]:          BakeScene,
  [STEP.FLATTEN_DOUGH]: FlattenScene,
  [STEP.SPREAD_SAUCE]:  SauceScene,
  [STEP.ADD_TOPPINGS]:  ToppingsScene,
  [STEP.STACK]:         StackScene,
  [STEP.DECORATE]:      DecorateScene,
}

export const ActionStage = memo(function ActionStage({ type, recipeId, progress, tapsNeeded, done, onTap }) {
  const Scene = SCENES[type] ?? FryScene
  const fryItem = recipeId === 'burger' ? 'patty' : 'pancake'

  return (
    <div
      role="button"
      aria-label="Ketuk untuk masak"
      onPointerUp={onTap}
      style={{
        width:        '100%',
        maxWidth:      360,
        aspectRatio:  `${W} / ${H}`,
        borderRadius:  28,
        background:   'linear-gradient(180deg, #FFF6E4 0%, #FFE8C4 100%)',
        border:       '3px solid rgba(200,140,60,0.45)',
        boxShadow:    '0 8px 0 rgba(160,90,20,0.3), 0 12px 32px rgba(0,0,0,0.18)',
        overflow:     'hidden',
        cursor:       'pointer',
        touchAction:  'manipulation',
        perspective:  '700px',
        userSelect:   'none',
      }}
    >
      <Scene progress={progress} tapsNeeded={tapsNeeded} done={done} item={fryItem} />

      <style>{`
        @keyframes asHover      { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        @keyframes asShake      { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-5deg); } 75% { transform: rotate(5deg); } }
        @keyframes asPop        { from { opacity: 0; transform: scale(0.4); } to { opacity: 1; transform: scale(1); } }
        @keyframes asTwinkle    { 0%,100% { opacity: 0.4; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.15); } }
        @keyframes asShellL     { 70% { opacity: 0.9; } to { transform: translate(-68px, 30px) rotate(-42deg); opacity: 0; } }
        @keyframes asShellR     { 70% { opacity: 0.9; } to { transform: translate(68px, 30px) rotate(42deg); opacity: 0; } }
        @keyframes asYolkFall   { to { transform: translateY(84px) scale(1, 0.72); opacity: 0; } }
        @keyframes asYolkLand   { from { opacity: 0; transform: scale(0.3); } to { opacity: 1; transform: scale(1); } }
        @keyframes asStream     { 0% { transform: scaleY(0); } 25% { transform: scaleY(1); } 85% { transform: scaleY(1); } 100% { transform: scaleY(1); } }
        @keyframes asDroplet    { 0% { opacity: 0; transform: translateY(0); } 40% { opacity: 1; } 100% { opacity: 0; transform: translateY(-22px); } }
        @keyframes asOrbit      { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes asStirFast   { 0% { transform: rotate(0); } 100% { transform: rotate(360deg); } }
        @keyframes asFlame      { from { transform: scaleY(0.85); } to { transform: scaleY(1.25); } }
        @keyframes asSizzleWiggle { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-2px); } 75% { transform: translateX(2px); } }
        @keyframes asFlip3d     {
          0%   { transform: perspective(500px) translateY(0) rotateX(0deg); }
          45%  { transform: perspective(500px) translateY(-92px) rotateX(360deg); }
          80%  { transform: perspective(500px) translateY(4px) rotateX(540deg); }
          100% { transform: perspective(500px) translateY(0) rotateX(540deg); }
        }
        @keyframes asPanNudge   { 0%,100% { transform: rotate(0); } 30% { transform: rotate(-3deg); } 60% { transform: rotate(2deg); } }
        @keyframes asSteam      { 0% { opacity: 0; transform: translateY(6px); } 40% { opacity: 0.8; } 100% { opacity: 0; transform: translateY(-14px); } }
        @keyframes asGlowPulse  { from { opacity: 0.55; } to { opacity: 1; } }
        @keyframes asCakeRise   { from { transform: translateY(10px) scaleY(0.8); } to { transform: translateY(0) scaleY(1); } }
        @keyframes asRollSweep  {
          0%   { transform: translate(-90px, 0); }
          50%  { transform: translate(0, 58px); }
          100% { transform: translate(90px, 0); }
        }
        @keyframes asSpoonDip   { 0%,100% { transform: translate(0,0) rotate(0); } 50% { transform: translate(-34px, 42px) rotate(-16deg); } }
        @keyframes asToppingDrop { from { transform: translate(var(--tx, 0), -170px) scale(0.7); opacity: 0; } 60% { opacity: 1; } to { opacity: 1; } }
        @keyframes asLayerDrop  { from { transform: translateY(-150px); opacity: 0; } 60% { opacity: 1; transform: translateY(8px) scale(1.05, 0.9); } to { opacity: 1; } }
        @keyframes asDrawLine   { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  )
})
