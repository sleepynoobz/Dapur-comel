/**
 * OyenCharacter.jsx
 *
 * Full-body illustrated Oyen the cat chef, drawn entirely as inline SVG.
 * This replaces the plain floating emoji-face with a proper 2D game character:
 *   - Orange tabby body with chest fluff and tail
 *   - Chef hat with puffy crown
 *   - White apron with pocket
 *   - Paws holding position
 *   - 8 distinct facial expressions
 *   - Blush cheeks
 */

import { memo } from 'react'

// ── Expression → face shape data ─────────────────────────────────────────────
const EXPR = {
  idle:        { eyes: 'normal',   mouth: 'neutral'  },
  happy:       { eyes: 'happy',    mouth: 'smile'    },
  excited:     { eyes: 'star',     mouth: 'bigsmile' },
  cheeky:      { eyes: 'wink',     mouth: 'smirk'   },
  thinking:    { eyes: 'think',    mouth: 'neutral'  },
  proud:       { eyes: 'happy',    mouth: 'bigsmile' },
  surprised:   { eyes: 'wide',     mouth: 'open'    },
  encouraging: { eyes: 'happy',    mouth: 'smile'    },
  sleepy:      { eyes: 'sleepy',   mouth: 'sleepy'  },
  talking:     { eyes: 'normal',   mouth: 'talk'    },
}

function LeftEye({ type }) {
  const cx = 76, cy = 95, r = 15
  return <EyeShape cx={cx} cy={cy} r={r} type={type} which="left" />
}
function RightEye({ type }) {
  const cx = 124, cy = 95, r = 15
  return <EyeShape cx={cx} cy={cy} r={r} type={type} which="right" />
}

function EyeShape({ cx, cy, r, type, which }) {
  if (type === 'happy') {
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={r} ry={r} fill="white" />
        <path d={`M${cx-r+2},${cy+2} Q${cx},${cy-r+4} ${cx+r-2},${cy+2}`}
              fill="#2A1A0E" />
        <circle cx={cx + 5} cy={cy - 6} r={2.5} fill="white" />
      </g>
    )
  }
  if (type === 'star') {
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={r} ry={r} fill="white" />
        <text x={cx} y={cy + 7} textAnchor="middle" fontSize="18" fill="#FFD700"
              style={{ fontFamily: 'serif', userSelect: 'none' }}>★</text>
      </g>
    )
  }
  if (type === 'wink') {
    if (which === 'left') {
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx={r} ry={r} fill="white" />
          <path d={`M${cx-r+2},${cy} Q${cx},${cy-10} ${cx+r-2},${cy}`}
                fill="#2A1A0E" />
        </g>
      )
    }
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={r} ry={r} fill="white" />
        <circle cx={cx} cy={cy + 1} r={9} fill="#2A1A0E" />
        <circle cx={cx + 4} cy={cy - 3} r={3} fill="white" />
        <circle cx={cx + 8} cy={cy + 3} r={1.5} fill="white" />
      </g>
    )
  }
  if (type === 'think') {
    const tiltDir = which === 'left' ? -4 : 4
    return (
      <g transform={`translate(${tiltDir},-4)`}>
        <ellipse cx={cx - tiltDir} cy={cy + 4} rx={r} ry={r - 3} fill="white" />
        <circle cx={cx - tiltDir} cy={cy + 5} r={8} fill="#2A1A0E" />
        <circle cx={cx - tiltDir + 3} cy={cy + 2} r={2.5} fill="white" />
      </g>
    )
  }
  if (type === 'wide') {
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={r + 3} ry={r + 3} fill="white"
                 stroke="#2A1A0E" strokeWidth="2" />
        <circle cx={cx} cy={cy + 1} r={10} fill="#2A1A0E" />
        <circle cx={cx + 4} cy={cy - 4} r={3.5} fill="white" />
        <circle cx={cx + 8} cy={cy + 3} r={1.5} fill="white" />
      </g>
    )
  }
  if (type === 'sleepy') {
    return (
      <g>
        <ellipse cx={cx} cy={cy + 5} rx={r} ry={r * 0.45} fill="white" />
        <ellipse cx={cx} cy={cy + 6} rx={10} ry={5} fill="#2A1A0E" />
        <path d={`M${cx - r + 1},${cy + 1} Q${cx},${cy - 6} ${cx + r - 1},${cy + 1}`}
              fill="#F5813F" opacity="0.7" />
      </g>
    )
  }
  // default / normal / talking
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={r} ry={r} fill="white" />
      <circle cx={cx} cy={cy + 1} r={9} fill="#2A1A0E" />
      <circle cx={cx + 4} cy={cy - 3} r={3} fill="white" />
      <circle cx={cx + 8} cy={cy + 4} r={1.5} fill="white" />
    </g>
  )
}

function Mouth({ type }) {
  if (type === 'smile')    return <path d="M85,122 Q100,134 115,122" stroke="#3D2B1F" strokeWidth="3" fill="none" strokeLinecap="round" />
  if (type === 'bigsmile') return <path d="M82,121 Q100,140 118,121" stroke="#3D2B1F" strokeWidth="3" fill="#FF9EB5" strokeLinecap="round" />
  if (type === 'smirk')   return <path d="M88,125 Q106,133 114,120" stroke="#3D2B1F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  if (type === 'open')    return <ellipse cx="100" cy="128" rx="13" ry="12" fill="#3D2B1F" />
  if (type === 'talk')    return <ellipse cx="100" cy="127" rx="10" ry="7" fill="#3D2B1F" />
  if (type === 'sleepy')  return <path d="M90,127 Q100,130 110,127" stroke="#3D2B1F" strokeWidth="2" fill="none" strokeLinecap="round" />
  // neutral
  return <path d="M88,126 Q100,131 112,126" stroke="#3D2B1F" strokeWidth="2" fill="none" strokeLinecap="round" />
}

// ── Main component ────────────────────────────────────────────────────────────
export const OyenCharacter = memo(function OyenCharacter({
  expression = 'idle',
  width = 200,
  isSpeaking = false,
}) {
  const resolved = isSpeaking ? 'talking' : expression
  const face = EXPR[resolved] ?? EXPR.idle
  const height = Math.round(width * 1.38)

  return (
    <svg
      viewBox="0 0 200 276"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Oyen"
      style={{ overflow: 'visible', userSelect: 'none' }}
    >
      <defs>
        <radialGradient id="og-body" cx="38%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#FFBB75" />
          <stop offset="60%"  stopColor="#F5813F" />
          <stop offset="100%" stopColor="#D96B2A" />
        </radialGradient>
        <radialGradient id="og-head" cx="40%" cy="28%" r="62%">
          <stop offset="0%"   stopColor="#FFBB75" />
          <stop offset="55%"  stopColor="#F5813F" />
          <stop offset="100%" stopColor="#D96B2A" />
        </radialGradient>
        <radialGradient id="og-hat" cx="35%" cy="20%" r="70%">
          <stop offset="0%"   stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#EEEEE8" />
        </radialGradient>
        <filter id="og-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(80,40,10,0.22)" />
        </filter>
      </defs>

      {/* ── TAIL ── */}
      <path d="M152,230 Q182,200 178,248 Q174,268 155,262"
            fill="none" stroke="#E88030" strokeWidth="20" strokeLinecap="round" />
      <path d="M152,230 Q182,200 178,248 Q174,268 155,262"
            fill="none" stroke="#F5953E" strokeWidth="10" strokeLinecap="round" />
      {/* Tail tip */}
      <ellipse cx="155" cy="262" rx="12" ry="9" fill="#FFCC88" />

      {/* ── BODY ── */}
      <ellipse cx="100" cy="210" rx="58" ry="62" fill="url(#og-body)" filter="url(#og-shadow)" />

      {/* Chest fluff */}
      <ellipse cx="100" cy="190" rx="30" ry="28" fill="#FFCC88" opacity="0.7" />

      {/* Body stripes */}
      <path d="M65,175 Q100,183 135,175" stroke="#D0702A" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M62,195 Q100,204 138,195" stroke="#D0702A" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
      <path d="M68,218 Q100,226 132,218" stroke="#D0702A" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.4" />

      {/* ── APRON ── */}
      <path d="M74,168 L126,168 L132,270 L68,270 Z" fill="#F8F8F2" opacity="0.96" />
      {/* Apron bib */}
      <path d="M80,168 L80,182 Q100,190 120,182 L120,168 Q110,162 100,162 Q90,162 80,168 Z" fill="#EFEFE8" />
      {/* Apron pocket */}
      <rect x="87" y="225" width="26" height="20" rx="5" fill="#EFEFE8" stroke="#DDD" strokeWidth="1.5" />
      <rect x="87" y="225" width="26" height="5" rx="2" fill="#E8E8E0" />
      {/* Apron straps */}
      <path d="M80,162 Q74,150 70,145" stroke="#E0E0D0" strokeWidth="6" strokeLinecap="round" />
      <path d="M120,162 Q126,150 130,145" stroke="#E0E0D0" strokeWidth="6" strokeLinecap="round" />

      {/* ── ARMS / PAWS ── */}
      {/* Left arm */}
      <path d="M55,200 Q35,215 38,235 Q42,250 58,245 Q68,240 65,220 Z" fill="url(#og-body)" />
      {/* Left paw */}
      <ellipse cx="46" cy="240" rx="16" ry="11" fill="#FFBB75" />
      <ellipse cx="38" cy="238" rx="6" ry="8" fill="#F5813F" />
      <ellipse cx="46" cy="250" rx="6" ry="7" fill="#F5813F" />
      <ellipse cx="55" cy="245" rx="5" ry="7" fill="#F5813F" />

      {/* Right arm */}
      <path d="M145,200 Q165,215 162,235 Q158,250 142,245 Q132,240 135,220 Z" fill="url(#og-body)" />
      {/* Right paw */}
      <ellipse cx="154" cy="240" rx="16" ry="11" fill="#FFBB75" />
      <ellipse cx="162" cy="238" rx="6" ry="8" fill="#F5813F" />
      <ellipse cx="154" cy="250" rx="6" ry="7" fill="#F5813F" />
      <ellipse cx="145" cy="245" rx="5" ry="7" fill="#F5813F" />

      {/* ── HEAD ── */}
      <circle cx="100" cy="96" r="68" fill="url(#og-head)" filter="url(#og-shadow)" />

      {/* Head stripes */}
      <path d="M72,50 Q100,44 128,50" stroke="#D0702A" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.45" />
      <path d="M60,65 Q100,58 140,65" stroke="#D0702A" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.35" />

      {/* ── EARS ── */}
      {/* Left ear */}
      <polygon points="44,52 26,8 72,40" fill="#F5813F" />
      <polygon points="47,49 33,16 68,38" fill="#FF9EB5" />
      {/* Right ear */}
      <polygon points="156,52 174,8 128,40" fill="#F5813F" />
      <polygon points="153,49 167,16 132,38" fill="#FF9EB5" />

      {/* ── CHEF HAT ── */}
      {/* Brim */}
      <rect x="56" y="36" width="88" height="16" rx="8" fill="url(#og-hat)"
            stroke="rgba(0,0,0,0.07)" strokeWidth="1" />
      {/* Crown */}
      <rect x="67" y="4" width="66" height="38" rx="18" fill="url(#og-hat)"
            stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
      {/* Hat crease lines */}
      <line x1="82" y1="8" x2="82" y2="38" stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" />
      <line x1="100" y1="5" x2="100" y2="38" stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" />
      <line x1="118" y1="8" x2="118" y2="38" stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" />
      {/* Hat highlight */}
      <ellipse cx="88" cy="16" rx="14" ry="8" fill="rgba(255,255,255,0.6)" />

      {/* ── FACE ── */}
      {/* Blush */}
      <ellipse cx="64" cy="114" rx="15" ry="10" fill="#FF9EB5" opacity="0.38" />
      <ellipse cx="136" cy="114" rx="15" ry="10" fill="#FF9EB5" opacity="0.38" />

      {/* Eyes */}
      <LeftEye type={face.eyes} />
      <RightEye type={face.eyes} />

      {/* Nose */}
      <path d="M94,110 L100,117 L106,110 Q100,105 94,110 Z" fill="#E8527A" />
      <ellipse cx="100" cy="111" rx="5" ry="3.5" fill="#FF6B8A" />

      {/* Mouth */}
      <Mouth type={face.mouth} />

      {/* Whiskers */}
      <line x1="24" y1="104" x2="88" y2="111" stroke="#7A5C40" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
      <line x1="22" y1="114" x2="87" y2="115" stroke="#7A5C40" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
      <line x1="24" y1="124" x2="88" y2="119" stroke="#7A5C40" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      <line x1="112" y1="111" x2="176" y2="104" stroke="#7A5C40" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
      <line x1="113" y1="115" x2="178" y2="114" stroke="#7A5C40" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
      <line x1="112" y1="119" x2="176" y2="124" stroke="#7A5C40" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
    </svg>
  )
})
