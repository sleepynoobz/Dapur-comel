/**
 * KitchenScene.jsx
 *
 * Illustrated kitchen background drawn entirely as inline SVG.
 * Replaces the CSS gradient background with a proper 2D game scene:
 *   - Warm cream walls with subtle tile backsplash
 *   - Wooden kitchen counter and lower cabinets
 *   - A window with curtains and outdoor view
 *   - Upper cabinets with handles
 *   - Stove with glowing burners
 *   - Decorative shelves with pots, jars, a plant
 *   - Warm wooden floor
 *
 * Usage:
 *   <KitchenScene className="absolute inset-0" />
 */

import { memo } from 'react'

// Repeat a tile pattern across a row
function TileRow({ x, y, cols, tileW = 52, tileH = 38 }) {
  return Array.from({ length: cols }, (_, i) => (
    <rect
      key={i}
      x={x + i * tileW}
      y={y}
      width={tileW - 1}
      height={tileH - 1}
      rx="2"
      fill="#FFF8EC"
      stroke="#EED9B0"
      strokeWidth="1"
    />
  ))
}

export const KitchenScene = memo(function KitchenScene({ className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 400 700"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      style={{ width: '100%', height: '100%', ...style }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ks-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#FDF6E8" />
          <stop offset="100%" stopColor="#F5E8CC" />
        </linearGradient>
        <linearGradient id="ks-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#C8956A" />
          <stop offset="100%" stopColor="#A07040" />
        </linearGradient>
        <linearGradient id="ks-counter" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#E8D0A8" />
          <stop offset="100%" stopColor="#D4B888" />
        </linearGradient>
        <linearGradient id="ks-cabinet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#D4A462" />
          <stop offset="100%" stopColor="#B8864A" />
        </linearGradient>
        <linearGradient id="ks-cabinet-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#E0B070" />
          <stop offset="100%" stopColor="#C89050" />
        </linearGradient>
        <linearGradient id="ks-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#B8DEFF" />
          <stop offset="100%" stopColor="#E0F0FF" />
        </linearGradient>
        <linearGradient id="ks-stove" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#8A8A88" />
          <stop offset="100%" stopColor="#6A6A68" />
        </linearGradient>
        <radialGradient id="ks-burner-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#FF6000" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FF6000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ══ WALL ══ */}
      <rect x="0" y="0" width="400" height="430" fill="url(#ks-wall)" />

      {/* ══ WINDOW ══ */}
      {/* Window recess */}
      <rect x="148" y="22" width="104" height="98" rx="6" fill="#C0D8F0" stroke="#C8A870" strokeWidth="3" />
      {/* Sky outside */}
      <rect x="152" y="26" width="96" height="90" rx="3" fill="url(#ks-sky)" />
      {/* Outdoor clouds */}
      <ellipse cx="170" cy="50" rx="18" ry="10" fill="white" opacity="0.8" />
      <ellipse cx="185" cy="45" rx="14" ry="9" fill="white" opacity="0.8" />
      <ellipse cx="225" cy="55" rx="16" ry="9" fill="white" opacity="0.75" />
      <ellipse cx="238" cy="50" rx="12" ry="8" fill="white" opacity="0.75" />
      {/* Outdoor greenery */}
      <ellipse cx="165" cy="114" rx="25" ry="12" fill="#5DAA60" opacity="0.6" />
      <ellipse cx="230" cy="114" rx="20" ry="10" fill="#4A9A50" opacity="0.55" />
      {/* Window frame cross */}
      <rect x="148" y="68" width="104" height="3" fill="#C8A870" />
      <rect x="198" y="22" width="3" height="98" fill="#C8A870" />
      {/* Window sill */}
      <rect x="144" y="116" width="112" height="8" rx="4" fill="#DDB870" />

      {/* ══ LEFT UPPER CABINET ══ */}
      <rect x="0" y="28" width="128" height="100" rx="4" fill="url(#ks-cabinet)" />
      <rect x="4" y="32" width="120" height="92" rx="3" fill="url(#ks-cabinet-face)" />
      {/* Door lines */}
      <rect x="10" y="36" width="52" height="84" rx="4" fill="rgba(255,255,255,0.12)" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      <rect x="66" y="36" width="52" height="84" rx="4" fill="rgba(255,255,255,0.12)" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      {/* Handles */}
      <ellipse cx="36" cy="78" rx="9" ry="5" fill="#9A7040" />
      <ellipse cx="36" cy="78" rx="6" ry="3" fill="#C8A060" />
      <ellipse cx="92" cy="78" rx="9" ry="5" fill="#9A7040" />
      <ellipse cx="92" cy="78" rx="6" ry="3" fill="#C8A060" />

      {/* ══ RIGHT UPPER CABINET ══ */}
      <rect x="272" y="28" width="128" height="100" rx="4" fill="url(#ks-cabinet)" />
      <rect x="276" y="32" width="120" height="92" rx="3" fill="url(#ks-cabinet-face)" />
      {/* Door lines */}
      <rect x="282" y="36" width="52" height="84" rx="4" fill="rgba(255,255,255,0.12)" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      <rect x="338" y="36" width="52" height="84" rx="4" fill="rgba(255,255,255,0.12)" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      {/* Handles */}
      <ellipse cx="308" cy="78" rx="9" ry="5" fill="#9A7040" />
      <ellipse cx="308" cy="78" rx="6" ry="3" fill="#C8A060" />
      <ellipse cx="364" cy="78" rx="9" ry="5" fill="#9A7040" />
      <ellipse cx="364" cy="78" rx="6" ry="3" fill="#C8A060" />

      {/* ══ TILE BACKSPLASH ══ */}
      {[0, 1, 2, 3].map(row => (
        <TileRow key={row} x={0} y={132 + row * 38} cols={8} tileW={52} tileH={38} />
      ))}

      {/* ══ SHELF (left side) ══ */}
      <rect x="6" y="138" width="116" height="8" rx="4" fill="#C8A060" />
      {/* Shelf items */}
      {/* Jar 1 */}
      <rect x="14" y="104" width="22" height="32" rx="5" fill="#88CCA0" stroke="#60A870" strokeWidth="1.5" />
      <rect x="16" y="100" width="18" height="6" rx="3" fill="#50906A" />
      <ellipse cx="25" cy="115" rx="7" ry="5" fill="rgba(255,255,255,0.3)" />
      {/* Jar 2 */}
      <rect x="44" y="108" width="20" height="28" rx="5" fill="#FFA060" stroke="#D07030" strokeWidth="1.5" />
      <rect x="46" y="104" width="16" height="6" rx="3" fill="#B85A20" />
      <ellipse cx="54" cy="117" rx="6" ry="4" fill="rgba(255,255,255,0.3)" />
      {/* Jar 3 */}
      <rect x="72" y="106" width="22" height="30" rx="5" fill="#88B8E8" stroke="#5890C8" strokeWidth="1.5" />
      <rect x="74" y="102" width="18" height="6" rx="3" fill="#4070A0" />
      <ellipse cx="83" cy="116" rx="7" ry="4.5" fill="rgba(255,255,255,0.3)" />
      {/* Small plant */}
      <rect x="100" y="124" width="14" height="12" rx="3" fill="#C8956A" />
      <ellipse cx="107" cy="120" rx="10" ry="8" fill="#5DB85D" />
      <ellipse cx="100" cy="116" rx="8" ry="7" fill="#4DA84D" />
      <ellipse cx="114" cy="118" rx="7" ry="6" fill="#5DB85D" />

      {/* ══ SHELF (right side) ══ */}
      <rect x="278" y="138" width="116" height="8" rx="4" fill="#C8A060" />
      {/* Small cooking pot */}
      <ellipse cx="304" cy="128" rx="18" ry="8" fill="#888" />
      <rect x="286" y="116" width="36" height="20" rx="6" fill="#999" />
      <rect x="282" y="118" width="8" height="5" rx="2" fill="#777" />
      <rect x="310" y="118" width="8" height="5" rx="2" fill="#777" />
      <ellipse cx="304" cy="116" rx="16" ry="5" fill="#AAA" />
      {/* Spice rack */}
      <rect x="330" y="106" width="14" height="28" rx="4" fill="#E8D8A0" stroke="#C8B060" strokeWidth="1.5" />
      <rect x="348" y="110" width="14" height="24" rx="4" fill="#FFB0C8" stroke="#E07090" strokeWidth="1.5" />
      <rect x="366" y="108" width="14" height="26" rx="4" fill="#B0E0A0" stroke="#70C060" strokeWidth="1.5" />
      <rect x="330" y="103" width="14" height="5" rx="2" fill="#B09040" />
      <rect x="348" y="107" width="14" height="5" rx="2" fill="#D05070" />
      <rect x="366" y="105" width="14" height="5" rx="2" fill="#50A840" />

      {/* ══ COUNTER TOP ══ */}
      <rect x="0" y="426" width="400" height="16" rx="4" fill="url(#ks-counter)" />
      <rect x="0" y="424" width="400" height="8" rx="4" fill="#E0C090" />
      <rect x="0" y="438" width="400" height="4" fill="rgba(0,0,0,0.1)" />

      {/* ══ LOWER CABINETS ══ */}
      <rect x="0" y="442" width="400" height="258" fill="url(#ks-cabinet)" />
      {/* Left door */}
      <rect x="6" y="448" width="118" height="130" rx="6" fill="url(#ks-cabinet-face)" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
      <ellipse cx="65" cy="513" rx="12" ry="7" fill="#9A7040" />
      <ellipse cx="65" cy="513" rx="8" ry="4.5" fill="#C8A060" />
      {/* Center door */}
      <rect x="134" y="448" width="132" height="130" rx="6" fill="url(#ks-cabinet-face)" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
      <ellipse cx="200" cy="513" rx="12" ry="7" fill="#9A7040" />
      <ellipse cx="200" cy="513" rx="8" ry="4.5" fill="#C8A060" />
      {/* Right door */}
      <rect x="276" y="448" width="118" height="130" rx="6" fill="url(#ks-cabinet-face)" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
      <ellipse cx="335" cy="513" rx="12" ry="7" fill="#9A7040" />
      <ellipse cx="335" cy="513" rx="8" ry="4.5" fill="#C8A060" />
      {/* Drawer above doors */}
      <rect x="0" y="440" width="400" height="8" rx="2" fill="rgba(0,0,0,0.1)" />

      {/* ══ STOVE ══ */}
      {/* Stove body */}
      <rect x="110" y="350" width="180" height="80" rx="10" fill="url(#ks-stove)" />
      {/* Stove top surface */}
      <rect x="115" y="355" width="170" height="60" rx="7" fill="#797978" />
      {/* Back panel / oven hood */}
      <rect x="120" y="320" width="160" height="36" rx="6" fill="#929290" />
      <rect x="130" y="326" width="140" height="24" rx="4" fill="#888886" />
      {/* Vent */}
      {[0, 1, 2, 3, 4].map(i => (
        <rect key={i} x={138 + i * 26} y={330} width={18} height={4} rx="2"
              fill="rgba(0,0,0,0.25)" />
      ))}
      {/* Burner left */}
      <ellipse cx="162" cy="385" rx="26" ry="24" fill="#686866" />
      <ellipse cx="162" cy="385" rx="20" ry="18" fill="#5A5A58" />
      <ellipse cx="162" cy="385" rx="10" ry="9" fill="#484846" />
      {/* Burner glow left */}
      <ellipse cx="162" cy="385" rx="26" ry="24" fill="url(#ks-burner-glow)" />
      {/* Burner right */}
      <ellipse cx="238" cy="385" rx="26" ry="24" fill="#686866" />
      <ellipse cx="238" cy="385" rx="20" ry="18" fill="#5A5A58" />
      <ellipse cx="238" cy="385" rx="10" ry="9" fill="#484846" />
      <ellipse cx="238" cy="385" rx="26" ry="24" fill="url(#ks-burner-glow)" />
      {/* Stove control knobs */}
      <circle cx="150" cy="425" r="8" fill="#4A4A48" />
      <circle cx="150" cy="425" r="5" fill="#686866" />
      <rect x="149" y="417" width="2" height="5" rx="1" fill="#CCC" />
      <circle cx="175" cy="425" r="8" fill="#4A4A48" />
      <circle cx="175" cy="425" r="5" fill="#686866" />
      <rect x="174" y="417" width="2" height="5" rx="1" fill="#CCC" />
      <circle cx="225" cy="425" r="8" fill="#4A4A48" />
      <circle cx="225" cy="425" r="5" fill="#686866" />
      <rect x="224" y="417" width="2" height="5" rx="1" fill="#CCC" />
      <circle cx="250" cy="425" r="8" fill="#4A4A48" />
      <circle cx="250" cy="425" r="5" fill="#686866" />
      <rect x="249" y="417" width="2" height="5" rx="1" fill="#CCC" />

      {/* ══ FLOOR ══ */}
      <rect x="0" y="660" width="400" height="40" fill="url(#ks-floor)" />
      {/* Floor planks */}
      <rect x="0" y="660" width="400" height="2" fill="rgba(0,0,0,0.1)" />
      <line x1="80" y1="662" x2="80" y2="700" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
      <line x1="180" y1="662" x2="180" y2="700" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
      <line x1="290" y1="662" x2="290" y2="700" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
    </svg>
  )
})
