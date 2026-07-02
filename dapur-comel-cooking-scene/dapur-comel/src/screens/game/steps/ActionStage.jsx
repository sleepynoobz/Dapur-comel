/**
 * ActionStage.jsx — gesture-driven cooking scenes (Cooking-Mama style).
 *
 * Every step is a real interaction, not a tap trigger:
 *   SLICE          knife follows your finger; swipe DOWN through the food to cut
 *   STIR           spoon follows your finger round the bowl; real circular motion
 *   POUR           press & HOLD — carton tilts and pours while held
 *   FRY            swipe UP to flip the food with a 3D somersault
 *   CRACK_EGG      DRAG the egg to the bowl rim and knock it to crack
 *   FLATTEN_DOUGH  drag the rolling pin LEFT-RIGHT across the dough
 *   SPREAD_SAUCE   rub your finger over the base — sauce spreads where you rub
 *   ADD_TOPPINGS   drag toppings from the tray and drop them on the pizza
 *   STACK          drag each burger layer down onto the stack
 *   BAKE           drag the cake pan into the glowing oven
 *   DECORATE       hold and sweep the sauce bottle across the bun
 *
 * Pure SVG + pointer events. Scenes own their continuous progress and call
 * onUnit() every time a sub-goal completes; the parent counts units.
 */

import { useState, useRef, useCallback, useEffect, memo } from 'react'
import { STEP } from '../../../utils/constants.js'

const W = 320
const H = 260
const OUT = '#2A1A0E'

/* ── shared ──────────────────────────────────────────────────────────── */

function Counter() {
  return (
    <g>
      <rect x="-10" y={H - 38} width={W + 20} height="48" fill="#C98A4B" stroke={OUT} strokeWidth="3" rx="6" />
      <line x1="0" y1={H - 24} x2={W} y2={H - 24} stroke="rgba(120,70,20,0.35)" strokeWidth="2" />
    </g>
  )
}

function Bowl({ cx = W / 2, cy = H - 44, rx = 74, fillPct = 0, liquid = '#F5E9D0' }) {
  const rimY  = cy - 58
  const level = Math.max(0, Math.min(1, fillPct))
  return (
    <g>
      <path
        d={`M${cx - rx},${rimY} L${cx - rx + 8},${cy - 14} Q${cx - rx + 14},${cy} ${cx - rx + 30},${cy} L${cx + rx - 30},${cy} Q${cx + rx - 14},${cy} ${cx + rx - 8},${cy - 14} L${cx + rx},${rimY} Z`}
        fill="#5BA8D4" stroke={OUT} strokeWidth="3.5" strokeLinejoin="round"
      />
      <path
        d={`M${cx - rx + 10},${rimY + 4} L${cx - rx + 16},${cy - 16} Q${cx - rx + 20},${cy - 6} ${cx - rx + 34},${cy - 6} L${cx},${cy - 6}`}
        fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="6" strokeLinecap="round"
      />
      <ellipse cx={cx} cy={rimY} rx={rx} ry="13" fill="#3D7BA8" stroke={OUT} strokeWidth="3.5" />
      {level > 0 && (
        <ellipse cx={cx} cy={rimY + 2} rx={rx - 8} ry={10}
                 fill={liquid} stroke="rgba(0,0,0,0.1)" strokeWidth="1.5"
                 style={{ transition: 'fill 0.4s ease' }} />
      )}
      <rect x={cx - 26} y={cy - 2} width="52" height="7" rx="3.5" fill="#3D7BA8" stroke={OUT} strokeWidth="2.5" />
    </g>
  )
}

function Sparkles({ show }) {
  if (!show) return null
  return (
    <g style={{ animation: 'asPop 0.4s ease-out both' }}>
      {[[40, 50], [W - 44, 62], [60, 130], [W - 60, 140], [W / 2, 30]].map(([x, y], i) => (
        <path key={i}
          d={`M${x},${y - 8} L${x + 2.5},${y - 2.5} L${x + 8},${y} L${x + 2.5},${y + 2.5} L${x},${y + 8} L${x - 2.5},${y + 2.5} L${x - 8},${y} L${x - 2.5},${y - 2.5} Z`}
          fill="#FFD700" stroke="#C8900A" strokeWidth="1"
          style={{ animation: `asTwinkle 0.9s ease-in-out ${i * 0.12}s infinite` }} />
      ))}
    </g>
  )
}

/* Animated finger hint following a gesture path */
function GestureHint({ kind, x = W / 2, y = H / 2, show = true }) {
  if (!show) return null
  const anim = {
    down:   'ghDown 1.3s ease-in-out infinite',
    up:     'ghUp 1.3s ease-in-out infinite',
    circle: 'ghCircle 1.6s linear infinite',
    lr:     'ghLR 1.4s ease-in-out infinite',
    hold:   'ghHold 1.2s ease-in-out infinite',
    drag:   'ghDown 1.3s ease-in-out infinite',
  }[kind] ?? 'ghHold 1.2s ease-in-out infinite'
  return (
    <g style={{ pointerEvents: 'none' }}>
      <g style={{ transform: `translate(${x}px, ${y}px)` }}>
        <g style={{ animation: anim }}>
          <text x="0" y="0" fontSize="34" textAnchor="middle" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>👆</text>
        </g>
      </g>
    </g>
  )
}

/* ── SLICE — knife follows finger, swipe down cuts ───────────────────── */

const SLICE_FOODS = {
  tomato: {
    body: (
      <g>
        <circle r="34" fill="#E53935" stroke={OUT} strokeWidth="3" />
        <ellipse cx="-11" cy="-13" rx="10" ry="6" fill="rgba(255,200,190,0.55)" transform="rotate(-20 -11 -13)" />
        <path d="M-8,-32 Q-4,-40 0,-34 Q4,-40 8,-32 Q0,-28 -8,-32Z" fill="#43A047" stroke={OUT} strokeWidth="2" />
      </g>
    ),
    sliceFill: '#F06055', sliceInner: '#FFCDD2', ry: 34,
  },
  mushroom: {
    body: (
      <g>
        <path d="M-34,6 Q-34,-26 0,-30 Q34,-26 34,6 Z" fill="#C46A50" stroke={OUT} strokeWidth="3" />
        <rect x="-9" y="6" width="18" height="20" rx="7" fill="#F5E8D8" stroke={OUT} strokeWidth="2.5" />
        <ellipse cx="-10" cy="-16" rx="8" ry="5" fill="rgba(255,220,200,0.6)" />
      </g>
    ),
    sliceFill: '#F5E8D8', sliceInner: '#E8D2B8', ry: 30,
  },
}

function SliceScene({ ptr, onUnit, unitsDone, unitsTotal, done, sliceItem = 'tomato' }) {
  const food = SLICE_FOODS[sliceItem] ?? SLICE_FOODS.tomato
  const foodX = 120, foodY = H - 78
  const zone = { left: foodX - 44, right: foodX + 44, top: foodY - 52, bottom: foodY + 30 }
  const dragRef = useRef({ armed: false, cutThisDrag: false })

  // cut detection: pointer must start above the food then travel below it
  useEffect(() => {
    const d = dragRef.current
    if (!ptr.active) { d.armed = false; d.cutThisDrag = false; return }
    if (done) return
    const inX = ptr.x > zone.left && ptr.x < zone.right
    if (!d.armed && inX && ptr.y < zone.top) d.armed = true
    if (d.armed && !d.cutThisDrag && inX && ptr.y > zone.bottom) {
      d.cutThisDrag = true
      onUnit()
    }
  }, [ptr, done]) // eslint-disable-line react-hooks/exhaustive-deps

  const knifeX = ptr.active ? ptr.x : W - 74
  const knifeY = ptr.active ? ptr.y : 108

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <Counter />
      {/* cutting board */}
      <rect x="34" y={H - 64} width="180" height="34" rx="10" fill="#E8C48A" stroke={OUT} strokeWidth="3" />
      <rect x="200" y={H - 56} width="26" height="14" rx="7" fill="#D4A46A" stroke={OUT} strokeWidth="2.5" />

      {/* whole food (shrinks as slices come off) */}
      {!done && (
        <g style={{ transform: `translate(${foodX}px, ${foodY}px) scale(${1 - unitsDone * 0.12})`, transition: 'transform 0.25s ease' }}
           key={`w-${unitsDone}`}>
          <g style={{ animation: unitsDone > 0 ? 'asShake 0.3s ease' : 'none' }}>
            {food.body}
          </g>
        </g>
      )}

      {/* cut slices pile up on the right */}
      {Array.from({ length: unitsDone }).map((_, i) => (
        <g key={i} style={{ transform: `translate(${186 + i * 16}px, ${H - 72}px)` }}>
          <g style={{ animation: i === unitsDone - 1 ? 'asSliceFly 0.45s cubic-bezier(0.34,1.4,0.64,1) both' : 'none' }}>
            <ellipse rx="8" ry={food.ry * 0.72} fill={food.sliceFill} stroke={OUT} strokeWidth="2.5" transform="rotate(10)" />
            <ellipse rx="4" ry={food.ry * 0.5} fill={food.sliceInner} transform="rotate(10)" />
          </g>
        </g>
      ))}

      {/* knife follows the finger */}
      <g style={{
        transform: `translate(${knifeX}px, ${knifeY}px) rotate(${ptr.active ? 8 : -6}deg)`,
        transition: ptr.active ? 'none' : 'transform 0.35s ease',
      }}>
        <g style={{ animation: ptr.active || done ? 'none' : 'asHover 1.5s ease-in-out infinite' }}>
          {/* blade points down — tip at pointer */}
          <path d="M0,0 Q-10,-26 -8,-56 L10,-56 Q10,-24 0,0 Z" fill="#D8E2EA" stroke={OUT} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M-4,-50 Q-6,-28 -1,-8" stroke="rgba(255,255,255,0.7)" strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="-9" y="-88" width="20" height="34" rx="8" fill="#8B5A2B" stroke={OUT} strokeWidth="2.5" />
          <line x1="-2" y1="-80" x2="-2" y2="-62" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>

      {/* swipe-down hint over the food */}
      {!ptr.active && !done && <GestureHint kind="down" x={foodX + 34} y={foodY - 30} />}
      <Sparkles show={done} />
    </svg>
  )
}

/* ── STIR — spoon follows finger in real circles ─────────────────────── */

function StirScene({ ptr, onUnit, unitsTotal, done }) {
  const cx = W / 2, cy = H - 102          // batter surface centre
  const accRef  = useRef({ last: null, total: 0, fired: 0 })
  const [spin, setSpin] = useState(0)      // accumulated radians for rendering

  useEffect(() => {
    const a = accRef.current
    if (!ptr.active || done) { a.last = null; return }
    const ang = Math.atan2(ptr.y - cy, ptr.x - cx)
    if (a.last != null) {
      let d = ang - a.last
      if (d > Math.PI) d -= 2 * Math.PI
      if (d < -Math.PI) d += 2 * Math.PI
      a.total += Math.abs(d)
      setSpin(a.total)
      const unitRad = 2 * Math.PI          // one full circle per unit
      const shouldFire = Math.floor(a.total / unitRad)
      if (shouldFire > a.fired && a.fired < unitsTotal) {
        a.fired = shouldFire
        onUnit()
      }
    }
    a.last = ang
  }, [ptr, done]) // eslint-disable-line react-hooks/exhaustive-deps

  const blend  = Math.min(1, spin / (unitsTotal * 2 * Math.PI))
  const batter = `rgb(${245 - blend * 8}, ${215 + blend * 14}, ${160 + blend * 20})`
  // spoon head position: follow finger but stay inside the bowl
  const ang = ptr.active ? Math.atan2(ptr.y - cy, ptr.x - cx) : spin
  const sx = cx + Math.cos(ang) * 46
  const sy = cy + Math.sin(ang) * 9

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <Counter />
      <Bowl fillPct={0.7} liquid={batter} rx={86} />
      {/* swirl lines rotate with real stirring */}
      <g style={{ transform: `translate(${cx}px, ${cy}px) rotate(${spin * 57.3}deg)` }}>
        <path d="M-40,-2 Q0,-14 40,0" stroke="rgba(200,140,60,0.5)" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M-24,4 Q6,-6 28,4" stroke="rgba(255,255,255,0.5)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      {/* unblended flecks fade as you stir */}
      {blend < 0.75 && (
        <g opacity={1 - blend * 1.2}>
          <circle cx={cx - 34} cy={cy + 2} r="6" fill="#FFC400" />
          <circle cx={cx + 26} cy={cy - 4} r="5" fill="#FFF" />
          <circle cx={cx + 4} cy={cy + 6} r="4" fill="#FFC400" />
        </g>
      )}
      {/* spoon head at finger angle, handle leaning out */}
      <g style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <rect x="-5" y="-96" width="11" height="84" rx="5.5" fill="#C98A4B" stroke={OUT} strokeWidth="2.5"
              transform={`rotate(${Math.cos(ang) * 16})`} />
        <ellipse cx="0" cy="0" rx="15" ry="10" fill="#B87838" stroke={OUT} strokeWidth="2.5" />
      </g>
      {!ptr.active && !done && <GestureHint kind="circle" x={cx} y={cy - 8} />}
      <Sparkles show={done} />
    </svg>
  )
}

/* ── POUR — press & hold to pour ─────────────────────────────────────── */

function PourScene({ ptr, onUnit, done }) {
  const [fill, setFill] = useState(0.2)
  const firedRef = useRef(false)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!ptr.active || done || firedRef.current) return
    let last = performance.now()
    const tick = (now) => {
      const dt = (now - last) / 1000
      last = now
      setFill(f => {
        const nf = Math.min(1, f + dt * 0.45)
        if (nf >= 1 && !firedRef.current) { firedRef.current = true; onUnit() }
        return nf
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [ptr.active, done]) // eslint-disable-line react-hooks/exhaustive-deps

  const pouring = ptr.active && !done && fill < 1
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <Counter />
      <Bowl fillPct={fill} liquid="#FFFFFF" />
      {pouring && (
        <rect x={W / 2 + 26} y={54} width="10" height="104" rx="5" fill="#FFFFFF" stroke="rgba(140,200,232,0.8)" strokeWidth="1.5" />
      )}
      <g style={{
        transformOrigin: `${W / 2 + 66}px 66px`,
        transform: pouring ? 'rotate(-52deg)' : 'rotate(0deg)',
        transition: 'transform 0.35s cubic-bezier(0.34,1.3,0.64,1)',
      }}>
        <g style={{ animation: pouring || done ? 'none' : 'asHover 1.6s ease-in-out infinite' }}>
          <path d={`M${W / 2 + 40},34 L${W / 2 + 66},22 L${W / 2 + 92},34 L${W / 2 + 66},29 Z`} fill="#E0EFF8" stroke={OUT} strokeWidth="2.5" />
          <path d={`M${W / 2 + 40},34 L${W / 2 + 40},96 Q${W / 2 + 40},101 ${W / 2 + 45},101 L${W / 2 + 87},101 Q${W / 2 + 92},101 ${W / 2 + 92},96 L${W / 2 + 92},34 Z`}
                fill="#F4FAFF" stroke={OUT} strokeWidth="3" />
          <ellipse cx={W / 2 + 58} cy={62} rx="8" ry="6" fill={OUT} opacity="0.8" />
          <ellipse cx={W / 2 + 74} cy={78} rx="6" ry="5" fill={OUT} opacity="0.8" />
        </g>
      </g>
      {pouring && [-26, 2, 28].map((dx, i) => (
        <circle key={i} cx={W / 2 + dx} cy={H - 104} r="4" fill="#FFFFFF" stroke="rgba(140,200,232,0.6)" strokeWidth="1"
                style={{ animation: `asDroplet 0.6s ease-out ${i * 0.15}s infinite` }} />
      ))}
      {!ptr.active && !done && <GestureHint kind="hold" x={W / 2 + 66} y={130} />}
      <Sparkles show={done} />
    </svg>
  )
}

/* ── FRY — swipe UP to flip ──────────────────────────────────────────── */

function FryScene({ ptr, onUnit, done, sliceItem, fryItem = 'pancake' }) {
  const isPatty = fryItem === 'patty'
  const [flipping, setFlipping] = useState(false)
  const dragRef = useRef({ y0: null, fired: false })

  useEffect(() => {
    const d = dragRef.current
    if (!ptr.active) { d.y0 = null; d.fired = false; return }
    if (done || flipping) return
    if (d.y0 == null) d.y0 = ptr.y
    if (!d.fired && d.y0 - ptr.y > 64) {
      d.fired = true
      setFlipping(true)
      setTimeout(() => { setFlipping(false); onUnit() }, 1100)
    }
  }, [ptr, done, flipping]) // eslint-disable-line react-hooks/exhaustive-deps

  const cooked = done
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
      <Counter />
      <rect x={W / 2 - 92} y={H - 46} width="184" height="14" rx="7" fill="#4A4A55" stroke={OUT} strokeWidth="2.5" />
      {[-56, -20, 16, 52].map((dx, i) => (
        <path key={i} d={`M${W / 2 + dx},${H - 46} q5,-14 0,-24 q-5,10 0,24`} fill="#FF8C2A" stroke="#E85510" strokeWidth="1.5"
              style={{ transformOrigin: `${W / 2 + dx}px ${H - 46}px`, animation: `asFlame 0.5s ease-in-out ${i * 0.11}s infinite alternate` }} />
      ))}
      <g style={{ animation: flipping ? 'asPanNudge 0.8s ease' : 'none', transformOrigin: `${W / 2}px ${H - 62}px` }}>
        <rect x={W / 2 + 78} y={H - 78} width="72" height="10" rx="5" fill="#3A3A44" stroke={OUT} strokeWidth="2.5" />
        <path d={`M${W / 2 - 86},${H - 84} L${W / 2 - 80},${H - 58} Q${W / 2 - 78},${H - 54} ${W / 2 - 72},${H - 54} L${W / 2 + 72},${H - 54} Q${W / 2 + 78},${H - 54} ${W / 2 + 80},${H - 58} L${W / 2 + 86},${H - 84}`}
              fill="#55555F" stroke={OUT} strokeWidth="3" />
      </g>
      <g style={{
        transformOrigin: `${W / 2}px ${H - 88}px`,
        animation: flipping ? 'asFlip3d 1.1s cubic-bezier(0.45,0,0.4,1) both' : 'asSizzleWiggle 0.9s ease-in-out infinite',
      }}>
        {isPatty ? (
          <>
            <ellipse cx={W / 2} cy={H - 82} rx="52" ry="15" fill={cooked ? '#6B2E10' : '#B4644A'} stroke={OUT} strokeWidth="3" style={{ transition: 'fill 0.4s ease' }} />
            <path d={`M${W / 2 - 34},${H - 86} Q${W / 2},${H - 92} ${W / 2 + 34},${H - 86}`} stroke="rgba(255,180,120,0.5)" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx={W / 2} cy={H - 82} rx="52" ry="14" fill={cooked ? '#D4840A' : '#F5D68A'} stroke={OUT} strokeWidth="3" style={{ transition: 'fill 0.4s ease' }} />
            <ellipse cx={W / 2 - 14} cy={H - 86} rx="16" ry="4" fill="rgba(255,240,180,0.6)" />
          </>
        )}
      </g>
      {[-30, 8, 40].map((dx, i) => (
        <path key={i} d={`M${W / 2 + dx},${H - 104} q-6,-12 0,-24 q6,-10 0,-22`} stroke="rgba(255,255,255,0.55)" strokeWidth="4" fill="none" strokeLinecap="round"
              style={{ animation: `asSteam 1.6s ease-in-out ${i * 0.3}s infinite` }} />
      ))}
      {!ptr.active && !done && !flipping && <GestureHint kind="up" x={W / 2} y={H - 120} />}
      <Sparkles show={done} />
    </svg>
  )
}

/* ── CRACK_EGG — drag the egg to the bowl and knock ──────────────────── */

function CrackEggScene({ ptr, onUnit, unitsDone, unitsTotal, done }) {
  const restX = W / 2 - 88, restY = 66
  const rimY = H - 102
  const inZoneRef = useRef(false)

  const ex = ptr.active && !done ? ptr.x : restX
  const ey = ptr.active && !done ? ptr.y : restY

  useEffect(() => {
    if (!ptr.active || done) { inZoneRef.current = false; return }
    const nearRim = Math.abs(ptr.x - W / 2) < 70 && Math.abs(ptr.y - rimY) < 26
    if (nearRim && !inZoneRef.current) {
      inZoneRef.current = true
      onUnit()                                    // knock!
    } else if (!nearRim) {
      inZoneRef.current = false
    }
  }, [ptr, done]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <Counter />
      <Bowl fillPct={done ? 0.45 : 0} liquid="#FFE9B0" />
      {done && (
        <ellipse cx={W / 2} cy={H - 100} rx="20" ry="10" fill="#FFC400" stroke="#E8A000" strokeWidth="2"
                 style={{ animation: 'asYolkLand 0.5s cubic-bezier(0.34,1.5,0.64,1) 0.35s both' }} />
      )}
      {!done ? (
        <g style={{ transform: `translate(${ex}px, ${ey}px)`, transition: ptr.active ? 'none' : 'transform 0.4s ease' }}
           key={`egg-${unitsDone}`}>
          <g style={{ animation: unitsDone > 0 ? 'asShake 0.35s ease' : ptr.active ? 'none' : 'asHover 1.6s ease-in-out infinite' }}>
            <path d="M0,-40 C-28,-40 -36,-6 -36,6 C-36,30 -20,42 0,42 C20,42 36,30 36,6 C36,-6 28,-40 0,-40 Z"
                  fill="#FFF6EA" stroke={OUT} strokeWidth="3.5" />
            <ellipse cx="-12" cy="-14" rx="8" ry="12" fill="rgba(255,255,255,0.8)" transform="rotate(-15 -12 -14)" />
            {unitsDone > 0 && (
              <path d="M-24,0 L-11,-9 L-2,5 L11,-7 L24,2" fill="none" stroke={OUT} strokeWidth="2.5" strokeLinejoin="round"
                    style={{ animation: 'asPop 0.25s ease-out both' }} />
            )}
          </g>
        </g>
      ) : (
        <g>
          <g style={{ transform: `translate(${W / 2}px, 70px)` }}>
            <g style={{ animation: 'asShellL 0.7s cubic-bezier(0.3,0.8,0.5,1) both' }}>
              <path d="M0,-40 C-28,-40 -36,-6 -36,6 L-12,0 L0,8 L0,-40 Z" fill="#FFF6EA" stroke={OUT} strokeWidth="3" />
            </g>
            <g style={{ animation: 'asShellR 0.7s cubic-bezier(0.3,0.8,0.5,1) both' }}>
              <path d="M0,-40 C28,-40 36,-6 36,6 L12,2 L0,8 L0,-40 Z" fill="#FFF0E0" stroke={OUT} strokeWidth="3" />
            </g>
            <circle cx="0" cy="0" r="15" fill="#FFC400" stroke="#E8A000" strokeWidth="2.5"
                    style={{ animation: 'asYolkFall 0.55s cubic-bezier(0.5,0,0.8,0.4) both' }} />
          </g>
          {[-30, 0, 30].map((dx, i) => (
            <path key={i} d={`M${W / 2 + dx},${H - 108} q3,-12 0,-18`} stroke="#FFE9B0" strokeWidth="4" fill="none" strokeLinecap="round"
                  style={{ animation: `asPop 0.4s ease-out ${0.4 + i * 0.06}s both` }} />
          ))}
        </g>
      )}
      {/* drop-zone glow on the rim while dragging */}
      {ptr.active && !done && (
        <ellipse cx={W / 2} cy={rimY} rx="78" ry="16" fill="none" stroke="rgba(255,210,80,0.85)" strokeWidth="4"
                 strokeDasharray="10 8" style={{ animation: 'asTwinkle 0.8s ease-in-out infinite' }} />
      )}
      {!ptr.active && !done && <GestureHint kind="down" x={restX + 40} y={restY + 30} />}
      <Sparkles show={done} />
    </svg>
  )
}

/* ── FLATTEN_DOUGH — sweep the rolling pin across ────────────────────── */

function FlattenScene({ ptr, onUnit, unitsDone, unitsTotal, done }) {
  const t = Math.min(1, unitsDone / unitsTotal)
  const sx = 1 + t * 0.65, sy = 1 - t * 0.58
  const passRef = useRef({ minX: null, maxX: null })

  useEffect(() => {
    const p = passRef.current
    if (!ptr.active || done) { p.minX = null; p.maxX = null; return }
    if (ptr.y < H - 150 || ptr.y > H - 30) return    // must sweep near the dough
    p.minX = p.minX == null ? ptr.x : Math.min(p.minX, ptr.x)
    p.maxX = p.maxX == null ? ptr.x : Math.max(p.maxX, ptr.x)
    if (p.maxX - p.minX > 130) {
      p.minX = null; p.maxX = null
      onUnit()
    }
  }, [ptr, done]) // eslint-disable-line react-hooks/exhaustive-deps

  const pinX = ptr.active ? Math.max(60, Math.min(W - 60, ptr.x)) : W / 2
  const pinY = ptr.active ? Math.max(70, Math.min(H - 88, ptr.y)) : 78

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <Counter />
      <g style={{ transform: `translate(${W / 2}px, ${H - 60}px) scale(${sx}, ${sy})`, transition: 'transform 0.4s cubic-bezier(0.34,1.4,0.64,1)' }}>
        <ellipse cx="0" cy="-24" rx="58" ry="34" fill="#F5E2B8" stroke={OUT} strokeWidth="3" />
        <ellipse cx="-18" cy="-34" rx="16" ry="9" fill="rgba(255,250,230,0.7)" />
      </g>
      {/* rolling pin follows the finger */}
      <g style={{ transform: `translate(${pinX - W / 2}px, ${pinY - 78}px)`, transition: ptr.active ? 'none' : 'transform 0.35s ease' }}>
        <g style={{ animation: ptr.active || done ? 'none' : 'asHover 1.6s ease-in-out infinite' }}>
          <rect x={W / 2 - 62} y={64} width="124" height="26" rx="13" fill="#D4A46A" stroke={OUT} strokeWidth="3" />
          <rect x={W / 2 - 96} y={70} width="34" height="14" rx="7" fill="#B87838" stroke={OUT} strokeWidth="2.5" />
          <rect x={W / 2 + 62} y={70} width="34" height="14" rx="7" fill="#B87838" stroke={OUT} strokeWidth="2.5" />
          <line x1={W / 2 - 40} y1={77} x2={W / 2 + 40} y2={77} stroke="rgba(120,70,20,0.25)" strokeWidth="2" />
        </g>
      </g>
      {ptr.active && !done && [-52, 0, 52].map((dx, i) => (
        <circle key={`${unitsDone}-${i}`} cx={W / 2 + dx} cy={H - 96} r="6" fill="rgba(255,255,255,0.7)"
                style={{ animation: `asDroplet 0.7s ease-out ${i * 0.15}s infinite` }} />
      ))}
      {!ptr.active && !done && <GestureHint kind="lr" x={W / 2} y={H - 120} />}
      <Sparkles show={done} />
    </svg>
  )
}

/* ── SPREAD_SAUCE — rub to spread ────────────────────────────────────── */

function SauceScene({ ptr, onUnit, unitsTotal, done }) {
  const cx = W / 2, cy = H - 96
  const accRef = useRef({ last: null, dist: 0, fired: 0 })
  const [sauceT, setSauceT] = useState(0)

  useEffect(() => {
    const a = accRef.current
    if (!ptr.active || done) { a.last = null; return }
    const inside = ((ptr.x - cx) / 96) ** 2 + ((ptr.y - cy) / 62) ** 2 < 1.3
    if (!inside) { a.last = null; return }
    if (a.last) {
      a.dist += Math.hypot(ptr.x - a.last.x, ptr.y - a.last.y)
      const target = 420 * unitsTotal / 2      // total rub distance
      setSauceT(Math.min(1, a.dist / target))
      const shouldFire = Math.min(unitsTotal, Math.floor((a.dist / target) * unitsTotal))
      while (a.fired < shouldFire) { a.fired += 1; onUnit() }
    }
    a.last = { x: ptr.x, y: ptr.y }
  }, [ptr, done]) // eslint-disable-line react-hooks/exhaustive-deps

  const t = done ? 1 : sauceT
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <Counter />
      <ellipse cx={cx} cy={cy} rx="96" ry="62" fill="#E8B86D" stroke={OUT} strokeWidth="3.5" />
      <ellipse cx={cx} cy={cy} rx="82" ry="50" fill="#F5D68A" stroke="#D4A24A" strokeWidth="2" />
      <g style={{ transform: `translate(${cx}px, ${cy}px) scale(${t})`, transition: 'transform 0.2s ease' }}>
        <ellipse cx="0" cy="0" rx="72" ry="42" fill="#D94E2B" stroke="#B03A20" strokeWidth="2" />
        <path d="M-40,0 Q-20,-16 0,-4 Q24,10 44,-4" stroke="rgba(255,130,90,0.6)" strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
      {/* spoon follows the finger */}
      <g style={{
        transform: ptr.active ? `translate(${ptr.x - (W / 2 + 92)}px, ${ptr.y - 92}px)` : 'translate(0,0)',
        transition: ptr.active ? 'none' : 'transform 0.35s ease',
      }}>
        <g style={{ animation: ptr.active || done ? 'none' : 'asHover 1.6s ease-in-out infinite' }}>
          <rect x={W / 2 + 58} y={20} width="10" height="70" rx="5" fill="#C98A4B" stroke={OUT} strokeWidth="2.5" transform={`rotate(24 ${W / 2 + 63} 55)`} />
          <ellipse cx={W / 2 + 92} cy={92} rx="14" ry="17" fill="#D94E2B" stroke={OUT} strokeWidth="2.5" />
        </g>
      </g>
      {!ptr.active && !done && <GestureHint kind="circle" x={cx} y={cy} />}
      <Sparkles show={done} />
    </svg>
  )
}

/* ── ADD_TOPPINGS — drag from tray, drop on pizza ────────────────────── */

const TOPPING_WAVES = [
  [[-38, -12, 'cheese'], [22, 6, 'cheese'], [-4, 18, 'cheese'], [40, -14, 'cheese']],
  [[-50, 8, 'mush'], [12, -18, 'mush'], [48, 12, 'mush']],
  [[-20, -4, 'olive'], [30, 20, 'olive'], [-44, 22, 'olive'], [4, -22, 'olive']],
]

function Topping({ kind }) {
  if (kind === 'cheese') return <rect x="-9" y="-3" width="18" height="6" rx="3" fill="#F9D55A" stroke="#D4A80A" strokeWidth="1.5" transform="rotate(-24)" />
  if (kind === 'mush') return (
    <g>
      <path d="M-10,2 Q-10,-9 0,-9 Q10,-9 10,2 Z" fill="#F0D5C8" stroke={OUT} strokeWidth="1.8" />
      <rect x="-3" y="2" width="6" height="6" rx="2" fill="#F5E8D8" stroke={OUT} strokeWidth="1.5" />
    </g>
  )
  return <circle r="6" fill="#3A5F2A" stroke={OUT} strokeWidth="1.8" />
}

function ToppingsScene({ ptr, onUnit, unitsDone, done }) {
  const cx = W / 2, cy = H - 96
  const kinds = ['cheese', 'mush', 'olive']
  const kind = kinds[Math.min(unitsDone, 2)]
  const wasActive = useRef(false)

  // count a unit when a drag is RELEASED over the pizza
  useEffect(() => {
    if (ptr.active) { wasActive.current = true; return }
    if (wasActive.current && !done) {
      wasActive.current = false
      const overPizza = ((ptr.x - cx) / 100) ** 2 + ((ptr.y - cy) / 66) ** 2 < 1.4
      if (overPizza) onUnit()
    }
  }, [ptr.active, done]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <Counter />
      <ellipse cx={cx} cy={cy} rx="96" ry="62" fill="#E8B86D" stroke={OUT} strokeWidth="3.5" />
      <ellipse cx={cx} cy={cy} rx="76" ry="46" fill="#D94E2B" stroke="#B03A20" strokeWidth="2" />
      {TOPPING_WAVES.slice(0, unitsDone).map((wave, wi) =>
        wave.map(([dx, dy, k], i) => (
          <g key={`${wi}-${i}`} style={{ transform: `translate(${cx + dx}px, ${cy + dy}px)` }}>
            <g style={{ animation: wi === unitsDone - 1 ? `asToppingDrop 0.5s cubic-bezier(0.34,1.4,0.64,1) ${i * 0.08}s both` : 'none' }}>
              <Topping kind={k} />
            </g>
          </g>
        ))
      )}
      {/* tray */}
      {!done && (
        <g>
          <rect x={W / 2 - 52} y={16} width="104" height="42" rx="12" fill="#FFF3DC" stroke={OUT} strokeWidth="2.5" opacity="0.95" />
          {!ptr.active && (
            <g style={{ transform: `translate(${W / 2}px, 37px)`, animation: 'asHover 1.4s ease-in-out infinite' }}>
              <g transform="scale(1.5)"><Topping kind={kind} /></g>
            </g>
          )}
        </g>
      )}
      {/* topping being carried */}
      {ptr.active && !done && (
        <g style={{ transform: `translate(${ptr.x}px, ${ptr.y}px)` }}>
          <g transform="scale(1.7)"><Topping kind={kind} /></g>
        </g>
      )}
      {/* drop-zone glow */}
      {ptr.active && !done && (
        <ellipse cx={cx} cy={cy} rx="86" ry="54" fill="none" stroke="rgba(255,210,80,0.85)" strokeWidth="4"
                 strokeDasharray="12 9" style={{ animation: 'asTwinkle 0.8s ease-in-out infinite' }} />
      )}
      {!ptr.active && !done && <GestureHint kind="down" x={W / 2 + 66} y={44} />}
      <Sparkles show={done} />
    </svg>
  )
}

/* ── STACK — drag each layer onto the burger ─────────────────────────── */

const STACK_LAYERS = [
  { id: 'lettuce', y: -14, el: <path d="M-52,0 Q-40,-12 -26,-3 Q-12,-13 0,-4 Q14,-13 28,-3 Q42,-12 52,0 Q30,8 0,7 Q-30,8 -52,0Z" fill="#43A047" stroke={OUT} strokeWidth="2.5" /> },
  { id: 'tomato',  y: -26, el: <ellipse rx="44" ry="9" fill="#E53935" stroke={OUT} strokeWidth="2.5" /> },
  { id: 'cheese',  y: -36, el: <path d="M-48,4 L48,4 L52,-2 L48,-8 L-48,-8 L-52,-2 Z" fill="#FFD700" stroke={OUT} strokeWidth="2.5" /> },
  { id: 'topbun',  y: -58, el: (
    <g>
      <path d="M-50,8 Q-50,-18 0,-22 Q50,-18 50,8 Z" fill="#E8AA5A" stroke={OUT} strokeWidth="3" />
      <ellipse cx="-16" cy="-10" rx="6" ry="3" fill="#F5E6C8" stroke="#C49A3A" strokeWidth="1" />
      <ellipse cx="10" cy="-14" rx="6" ry="3" fill="#F5E6C8" stroke="#C49A3A" strokeWidth="1" />
    </g>
  ) },
]

function StackScene({ ptr, onUnit, unitsDone, done }) {
  const baseY = H - 66
  const wasActive = useRef(false)

  useEffect(() => {
    if (ptr.active) { wasActive.current = true; return }
    if (wasActive.current && !done && unitsDone < STACK_LAYERS.length) {
      wasActive.current = false
      const overStack = Math.abs(ptr.x - W / 2) < 90 && ptr.y > H - 170
      if (overStack) onUnit()
    }
  }, [ptr.active, done]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <Counter />
      <ellipse cx={W / 2} cy={H - 46} rx="92" ry="14" fill="#F4FAFF" stroke={OUT} strokeWidth="3" />
      <path d={`M${W / 2 - 48},${baseY} Q${W / 2},${baseY + 14} ${W / 2 + 48},${baseY} L${W / 2 + 44},${baseY - 10} L${W / 2 - 44},${baseY - 10} Z`} fill="#D98C40" stroke={OUT} strokeWidth="3" />
      <ellipse cx={W / 2} cy={baseY - 12} rx="46" ry="10" fill="#6B2E10" stroke={OUT} strokeWidth="2.5" />
      {STACK_LAYERS.slice(0, unitsDone).map((l, i) => (
        <g key={l.id} style={{ transform: `translate(${W / 2}px, ${baseY + l.y}px)` }}>
          <g style={{ animation: i === unitsDone - 1 ? 'asLayerDrop 0.45s cubic-bezier(0.34,1.5,0.64,1) both' : 'none' }}>
            {l.el}
          </g>
        </g>
      ))}
      {/* next layer — rests on the shelf, follows the finger while dragging */}
      {!done && unitsDone < STACK_LAYERS.length && (
        <g style={{
          transform: ptr.active ? `translate(${ptr.x}px, ${ptr.y}px)` : `translate(${W / 2}px, 44px)`,
          transition: ptr.active ? 'none' : 'transform 0.35s ease',
        }}>
          <g style={{ animation: ptr.active ? 'none' : 'asHover 1.4s ease-in-out infinite' }}>
            {STACK_LAYERS[unitsDone].el}
          </g>
        </g>
      )}
      {ptr.active && !done && (
        <ellipse cx={W / 2} cy={baseY - 30} rx="70" ry="28" fill="none" stroke="rgba(255,210,80,0.85)" strokeWidth="4"
                 strokeDasharray="12 9" style={{ animation: 'asTwinkle 0.8s ease-in-out infinite' }} />
      )}
      {!ptr.active && !done && <GestureHint kind="down" x={W / 2 + 68} y={54} />}
      <Sparkles show={done} />
    </svg>
  )
}

/* ── BAKE — slide the cake into the oven ─────────────────────────────── */

function BakeScene({ ptr, onUnit, unitsDone, done }) {
  const ovenX = W / 2 + 44
  const [inside, setInside] = useState(false)
  const wasActive = useRef(false)

  useEffect(() => {
    if (done || inside) return
    if (ptr.active) {
      wasActive.current = true
      if (ptr.x > ovenX - 40 && ptr.y > 70 && ptr.y < 180) {
        setInside(true)
        setTimeout(onUnit, 900)
      }
    }
  }, [ptr, done, inside]) // eslint-disable-line react-hooks/exhaustive-deps

  const glow = inside || done
  const panX = inside || done ? ovenX + 18 : ptr.active ? ptr.x : 56
  const panY = inside || done ? 128 : ptr.active ? ptr.y : H - 76

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <Counter />
      {/* oven */}
      <rect x={ovenX - 28} y={40} width="150" height="152" rx="14" fill="#8A6FD4" stroke={OUT} strokeWidth="3.5" />
      <rect x={ovenX - 14} y={54} width="122" height="14" rx="7" fill="#6C50BC" stroke={OUT} strokeWidth="2" />
      <circle cx={ovenX + 2} cy={61} r="4" fill="#FFD700" stroke={OUT} strokeWidth="1.5" />
      <circle cx={ovenX + 20} cy={61} r="4" fill="#FF6B6B" stroke={OUT} strokeWidth="1.5" />
      <rect x={ovenX - 6} y={82} width="106" height="86" rx="10" fill={glow ? '#FFB347' : '#3A2A55'} stroke={OUT} strokeWidth="3"
            style={{ transition: 'fill 0.5s ease' }} />
      <defs>
        <radialGradient id="bakeGlow" cx="50%" cy="60%" r="70%">
          <stop offset="0%" stopColor="rgba(255,220,120,0.9)" />
          <stop offset="100%" stopColor="rgba(255,140,40,0.2)" />
        </radialGradient>
      </defs>
      {glow && (
        <rect x={ovenX - 6} y={82} width="106" height="86" rx="10" fill="url(#bakeGlow)"
              style={{ animation: 'asGlowPulse 1s ease-in-out infinite alternate' }} />
      )}
      <rect x={ovenX + 6} y={176} width="82" height="8" rx="4" fill="#6C50BC" stroke={OUT} strokeWidth="2" />

      {/* cake pan — drag it in */}
      <g style={{ transform: `translate(${panX}px, ${panY}px)`, transition: ptr.active && !inside ? 'none' : 'transform 0.5s ease' }}>
        <g style={{ animation: ptr.active || glow ? 'none' : 'asHover 1.6s ease-in-out infinite' }}>
          <path d="M-30,10 L-24,-12 L24,-12 L30,10 Z" fill="#E8527A" stroke={OUT} strokeWidth="2.5" />
          <ellipse cx="0" cy="-12" rx="24" ry="6" fill="#FFB5D0" stroke={OUT} strokeWidth="2.5" />
          {glow && <ellipse cx="0" cy="-16" rx="20" ry="7" fill="#FFB5D0" stroke={OUT} strokeWidth="2"
                            style={{ animation: 'asCakeRise 1.2s ease-out 0.3s both' }} />}
        </g>
      </g>

      {glow && [-30, 10, 50].map((dx, i) => (
        <path key={i} d={`M${ovenX + 40 + dx},34 q-6,-10 0,-20`} stroke="rgba(255,160,60,0.7)" strokeWidth="4" fill="none" strokeLinecap="round"
              style={{ animation: `asSteam 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
      {ptr.active && !glow && (
        <rect x={ovenX - 6} y={82} width="106" height="86" rx="10" fill="none" stroke="rgba(255,210,80,0.85)" strokeWidth="4"
              strokeDasharray="12 9" style={{ animation: 'asTwinkle 0.8s ease-in-out infinite' }} />
      )}
      {!ptr.active && !glow && <GestureHint kind="down" x={100} y={H - 120} />}
      <Sparkles show={done} />
    </svg>
  )
}

/* ── DECORATE — hold and sweep the bottle over the bun ───────────────── */

function DecorateScene({ ptr, onUnit, unitsDone, unitsTotal, done }) {
  const baseY = H - 66
  const accRef = useRef({ minX: null, maxX: null })
  const [sweep, setSweep] = useState(0)   // 0..1 progress of the current zig-zag

  useEffect(() => {
    const a = accRef.current
    if (!ptr.active || done || unitsDone >= unitsTotal) { a.minX = null; a.maxX = null; return }
    if (ptr.y < baseY - 110 || ptr.y > baseY + 10) return
    a.minX = a.minX == null ? ptr.x : Math.min(a.minX, ptr.x)
    a.maxX = a.maxX == null ? ptr.x : Math.max(a.maxX, ptr.x)
    const span = a.maxX - a.minX
    setSweep(Math.min(1, span / 110))
    if (span > 110) {
      a.minX = null; a.maxX = null
      setSweep(0)
      onUnit()
    }
  }, [ptr, done]) // eslint-disable-line react-hooks/exhaustive-deps

  const zig = (yBase, flip) =>
    `M${W / 2 - 40},${yBase + (flip ? -8 : 0)} L${W / 2 - 24},${yBase + (flip ? 0 : -8)} L${W / 2 - 8},${yBase + (flip ? -8 : 0)} L${W / 2 + 8},${yBase + (flip ? 0 : -8)} L${W / 2 + 24},${yBase + (flip ? -8 : 0)} L${W / 2 + 40},${yBase + (flip ? 0 : -8)}`

  const ketchupDone = unitsDone >= 1
  const mustardDone = done || unitsDone >= 2
  const activeColor = ketchupDone ? '#FFD700' : '#E53935'

  const bx = ptr.active && !done ? ptr.x : W / 2 + 70
  const by = ptr.active && !done ? ptr.y : 58

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <Counter />
      <ellipse cx={W / 2} cy={H - 46} rx="92" ry="14" fill="#F4FAFF" stroke={OUT} strokeWidth="3" />
      <path d={`M${W / 2 - 48},${baseY} Q${W / 2},${baseY + 14} ${W / 2 + 48},${baseY} L${W / 2 + 44},${baseY - 10} L${W / 2 - 44},${baseY - 10} Z`} fill="#D98C40" stroke={OUT} strokeWidth="3" />
      <ellipse cx={W / 2} cy={baseY - 12} rx="46" ry="10" fill="#6B2E10" stroke={OUT} strokeWidth="2.5" />
      <path d={`M${W / 2 - 52},${baseY - 18} Q${W / 2 - 40},${baseY - 30} ${W / 2 - 26},${baseY - 21} Q${W / 2 - 12},${baseY - 31} ${W / 2},${baseY - 22} Q${W / 2 + 14},${baseY - 31} ${W / 2 + 28},${baseY - 21} Q${W / 2 + 42},${baseY - 30} ${W / 2 + 52},${baseY - 18} Q${W / 2 + 30},${baseY - 10} ${W / 2},${baseY - 11} Q${W / 2 - 30},${baseY - 10} ${W / 2 - 52},${baseY - 18}Z`} fill="#43A047" stroke={OUT} strokeWidth="2.5" />
      <path d={`M${W / 2 - 48},${baseY - 30} L${W / 2 + 48},${baseY - 30} L${W / 2 + 52},${baseY - 36} L${W / 2 + 48},${baseY - 42} L${W / 2 - 48},${baseY - 42} L${W / 2 - 52},${baseY - 36} Z`} fill="#FFD700" stroke={OUT} strokeWidth="2.5" />
      <path d={`M${W / 2 - 50},${baseY - 40} Q${W / 2 - 50},${baseY - 68} ${W / 2},${baseY - 72} Q${W / 2 + 50},${baseY - 68} ${W / 2 + 50},${baseY - 40} Z`} fill="#E8AA5A" stroke={OUT} strokeWidth="3" />

      {/* ketchup zig-zag: completed or partial sweep */}
      {(ketchupDone || (!ketchupDone && sweep > 0)) && (
        <path d={zig(baseY - 52, false)}
              fill="none" stroke="#E53935" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="160" strokeDashoffset={ketchupDone ? 0 : 160 * (1 - sweep)}
              style={{ transition: 'stroke-dashoffset 0.15s linear' }} />
      )}
      {/* mustard zig-zag */}
      {(mustardDone || (ketchupDone && sweep > 0)) && (
        <path d={zig(baseY - 58, true)}
              fill="none" stroke="#FFD700" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="160" strokeDashoffset={mustardDone ? 0 : 160 * (1 - sweep)}
              style={{ transition: 'stroke-dashoffset 0.15s linear' }} />
      )}

      {/* squeeze bottle follows the finger */}
      {!done && (
        <g style={{ transform: `translate(${bx}px, ${by}px)`, transition: ptr.active ? 'none' : 'transform 0.35s ease' }}>
          <g style={{ animation: ptr.active ? 'none' : 'asHover 1.4s ease-in-out infinite' }}>
            <path d="M-4,26 L-8,40 L8,40 L4,26 Z" fill={activeColor} stroke={OUT} strokeWidth="2" transform="rotate(180 0 33)" />
            <rect x="-12" y="-24" width="24" height="44" rx="8" fill={activeColor} stroke={OUT} strokeWidth="2.5" />
            {ptr.active && (
              <circle cx="0" cy="46" r="3.5" fill={activeColor} style={{ animation: 'asDroplet 0.5s ease-out infinite' }} />
            )}
          </g>
        </g>
      )}
      {done && (
        <g style={{ transform: `translate(${W / 2}px, ${baseY - 86}px)` }}>
          <g style={{ animation: 'asToppingDrop 0.5s cubic-bezier(0.34,1.5,0.64,1) 0.4s both' }}>
            <line x1="0" y1="0" x2="0" y2="18" stroke="#8B5A2B" strokeWidth="2.5" />
            <path d="M0,0 L20,5 L0,10 Z" fill="#FF6B6B" stroke={OUT} strokeWidth="1.5" />
          </g>
        </g>
      )}
      {!ptr.active && !done && <GestureHint kind="lr" x={W / 2} y={baseY - 84} />}
      <Sparkles show={done} />
    </svg>
  )
}

/* ── stage wrapper with pointer tracking ─────────────────────────────── */

const SCENES = {
  [STEP.SLICE]:         SliceScene,
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

export const ActionStage = memo(function ActionStage({
  type, recipeId, unitsDone, unitsTotal, done, onUnit,
}) {
  const Scene = SCENES[type] ?? FryScene
  const boxRef = useRef(null)
  const [ptr, setPtr] = useState({ active: false, x: 0, y: 0 })

  const toVB = useCallback((e) => {
    const r = boxRef.current.getBoundingClientRect()
    return {
      x: ((e.clientX - r.left) / r.width) * W,
      y: ((e.clientY - r.top) / r.height) * H,
    }
  }, [])

  const onDown = useCallback((e) => {
    if (!e.isPrimary) return
    boxRef.current.setPointerCapture?.(e.pointerId)
    setPtr({ active: true, ...toVB(e) })
  }, [toVB])

  const onMove = useCallback((e) => {
    if (!e.isPrimary) return
    setPtr(p => (p.active ? { active: true, ...toVB(e) } : p))
  }, [toVB])

  const onUp = useCallback((e) => {
    if (!e.isPrimary) return
    setPtr(p => ({ ...p, active: false }))
  }, [])

  return (
    <div
      ref={boxRef}
      role="button"
      aria-label="Kawasan masak"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{
        width:       '100%',
        maxWidth:     360,
        aspectRatio: `${W} / ${H}`,
        borderRadius: 28,
        background:  'linear-gradient(180deg, #FFF6E4 0%, #FFE8C4 100%)',
        border:      '3px solid rgba(200,140,60,0.45)',
        boxShadow:   '0 8px 0 rgba(160,90,20,0.3), 0 12px 32px rgba(0,0,0,0.18)',
        overflow:    'hidden',
        cursor:      'pointer',
        touchAction: 'none',
        userSelect:  'none',
      }}
    >
      <Scene
        ptr={ptr}
        onUnit={onUnit}
        unitsDone={unitsDone}
        unitsTotal={unitsTotal}
        done={done}
        fryItem={recipeId === 'burger' ? 'patty' : 'pancake'}
        sliceItem={recipeId === 'pizza' ? 'mushroom' : 'tomato'}
      />

      <style>{`
        @keyframes asHover      { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        @keyframes asShake      { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-5deg); } 75% { transform: rotate(5deg); } }
        @keyframes asPop        { from { opacity: 0; transform: scale(0.4); } to { opacity: 1; transform: scale(1); } }
        @keyframes asTwinkle    { 0%,100% { opacity: 0.4; transform: scale(0.98); } 50% { opacity: 1; transform: scale(1.02); } }
        @keyframes asShellL     { 70% { opacity: 0.9; } to { transform: translate(-68px, 30px) rotate(-42deg); opacity: 0; } }
        @keyframes asShellR     { 70% { opacity: 0.9; } to { transform: translate(68px, 30px) rotate(42deg); opacity: 0; } }
        @keyframes asYolkFall   { to { transform: translateY(84px) scale(1, 0.72); opacity: 0; } }
        @keyframes asYolkLand   { from { opacity: 0; transform: scale(0.3); } to { opacity: 1; transform: scale(1); } }
        @keyframes asDroplet    { 0% { opacity: 0; transform: translateY(0); } 40% { opacity: 1; } 100% { opacity: 0; transform: translateY(-22px); } }
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
        @keyframes asToppingDrop { from { transform: translateY(-150px) scale(0.7); opacity: 0; } 60% { opacity: 1; } to { opacity: 1; } }
        @keyframes asLayerDrop  { from { transform: translateY(-140px); opacity: 0; } 60% { opacity: 1; transform: translateY(8px) scale(1.05, 0.9); } to { opacity: 1; } }
        @keyframes asSliceFly   { from { transform: translate(-56px, -24px) rotate(-30deg); opacity: 0; } 50% { opacity: 1; } to { opacity: 1; } }
        @keyframes ghDown       { 0% { transform: translateY(-26px); opacity: 0; } 25% { opacity: 1; } 80% { transform: translateY(30px); opacity: 1; } 100% { transform: translateY(34px); opacity: 0; } }
        @keyframes ghUp         { 0% { transform: translateY(26px); opacity: 0; } 25% { opacity: 1; } 80% { transform: translateY(-30px); opacity: 1; } 100% { transform: translateY(-34px); opacity: 0; } }
        @keyframes ghCircle     { 0% { transform: rotate(0deg) translateX(30px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(30px) rotate(-360deg); } }
        @keyframes ghLR         { 0% { transform: translateX(-44px); opacity: 0; } 20% { opacity: 1; } 80% { transform: translateX(44px); opacity: 1; } 100% { transform: translateX(48px); opacity: 0; } }
        @keyframes ghHold       { 0%,100% { transform: scale(1); } 50% { transform: scale(0.82); } }
      `}</style>
    </div>
  )
})
