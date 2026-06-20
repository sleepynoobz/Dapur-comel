/**
 * audio.js — Pass 4: Rich synthesised SFX
 *
 * Architecture: Web Audio API synthesis with warm, toddler-safe timbres.
 * Zero audio files — all procedural → zero download, works offline instantly.
 *
 * Why synthesis over files:
 *   - Instant play (no fetch/decode latency after first AudioContext creation)
 *   - Zero payload (no audio assets to cache or download)
 *   - Always offline (no CDN dependency)
 *   - Tunable warmth/volume without re-encoding files
 *
 * All sounds engineered to be:
 *   - Soft and warm (low pitch range, gentle attack)
 *   - Toddler-safe volume (0.35–0.60 max gain)
 *   - Short (< 1.2s)
 *   - Non-startling (no sharp transients)
 *
 * Usage:
 *   import { sfx } from '../utils/audio.js'
 *   sfx.play('crack')      ← key from recipe step.sfx
 *   sfx.pop()              ← direct call for UI
 */

import { loadSettings } from './storage.js'

// ─── AudioContext singleton ───────────────────────────────────────────────────
let ctx = null

function getCtx() {
  if (ctx?.state !== 'closed') return ctx ?? null
  ctx = null
  return null
}

function ensureCtx() {
  if (!ctx || ctx.state === 'closed') {
    try {
      const Ctor = window.AudioContext || window.webkitAudioContext
      if (!Ctor) return null
      ctx = new Ctor()
    } catch { return null }
  }
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
  return ctx
}

export function unlockAudio() {
  ensureCtx()
}

// ─── Guard: respect mute setting ─────────────────────────────────────────────
function isMuted() {
  try { return loadSettings().sfxMuted } catch { return false }
}

// ─── Low-level synthesis helpers ─────────────────────────────────────────────

/**
 * Play a simple shaped tone.
 * @param {{ freq, freq2, type, dur, vol, attack, release, detune }}
 */
function tone({ freq = 440, freq2, type = 'sine', dur = 0.15,
                vol = 0.4, attack = 0.008, release = 0.08, detune = 0 }) {
  const c = ensureCtx()
  if (!c || isMuted()) return
  try {
    const osc  = c.createOscillator()
    const gain = c.createGain()
    const now  = c.currentTime

    osc.connect(gain)
    gain.connect(c.destination)

    osc.type    = type
    osc.detune.value = detune
    osc.frequency.setValueAtTime(freq, now)
    if (freq2) osc.frequency.exponentialRampToValueAtTime(freq2, now + dur)

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(vol, now + attack)
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur + release)

    osc.start(now)
    osc.stop(now + dur + release + 0.02)
  } catch { /**/ }
}

/** Filtered noise burst — used for crack, chop, sizzle, pour */
function noise({ dur = 0.12, vol = 0.3, attack = 0.003, release = 0.06,
                 lowHz = 800, highHz = 3000, type = 'bandpass' }) {
  const c = ensureCtx()
  if (!c || isMuted()) return
  try {
    const bufSize = Math.ceil(c.sampleRate * (dur + release + 0.05))
    const buf     = c.createBuffer(1, bufSize, c.sampleRate)
    const data    = buf.getChannelData(0)
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1

    const src    = c.createBufferSource()
    const filter = c.createBiquadFilter()
    const gain   = c.createGain()
    const now    = c.currentTime

    src.buffer = buf
    src.connect(filter)
    filter.connect(gain)
    gain.connect(c.destination)

    filter.type            = type
    filter.frequency.value = (lowHz + highHz) / 2
    filter.Q.value         = (highHz - lowHz > 500) ? 0.8 : 2

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(vol, now + attack)
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur + release)

    src.start(now)
    src.stop(now + dur + release + 0.05)
  } catch { /**/ }
}

/** Multiple sequential tones */
function seq(notes, gapMs = 55) {
  notes.forEach((n, i) => setTimeout(() => tone(n), i * gapMs))
}

// ─── Named SFX ───────────────────────────────────────────────────────────────

const SFX = {

  /** 🥚 Egg crack — two sharp noise pops */
  crack() {
    noise({ dur: 0.04, vol: 0.38, attack: 0.001, release: 0.03, lowHz: 900, highHz: 4000 })
    setTimeout(() =>
      noise({ dur: 0.06, vol: 0.30, attack: 0.001, release: 0.04, lowHz: 600, highHz: 3000 }), 90)
  },

  /** 🔪 Chop — percussive thud */
  chop() {
    noise({ dur: 0.07, vol: 0.40, attack: 0.001, release: 0.05, lowHz: 200, highHz: 1200, type: 'lowshelf' })
    tone({ freq: 180, type: 'triangle', dur: 0.05, vol: 0.20, attack: 0.001, release: 0.05 })
  },

  /** 🥛 Pour — descending filtered noise swirl */
  pour() {
    for (let i = 0; i < 4; i++) {
      setTimeout(() =>
        noise({ dur: 0.12, vol: 0.18 + i * 0.03, attack: 0.01, release: 0.1,
                lowHz: 600 - i * 60, highHz: 2000 - i * 100 }), i * 80)
    }
  },

  /** 🥄 Stir — looping swirl (plays twice) */
  stir() {
    ;[0, 220].forEach(offset =>
      setTimeout(() =>
        noise({ dur: 0.18, vol: 0.22, attack: 0.02, release: 0.15, lowHz: 400, highHz: 1800 }), offset))
  },

  /** 🔥 Sizzle — sustained noise with crackle */
  sizzle() {
    for (let i = 0; i < 6; i++) {
      setTimeout(() =>
        noise({ dur: 0.1, vol: 0.14 + Math.random() * 0.08, attack: 0.005, release: 0.08,
                lowHz: 1000 + Math.random() * 500, highHz: 4000 + Math.random() * 1000 }),
        i * 90 + Math.random() * 30)
    }
  },

  /** 🥞 Pancake flip — woosh + light thud */
  flip() {
    tone({ freq: 320, freq2: 180, type: 'triangle', dur: 0.12, vol: 0.30, attack: 0.005, release: 0.1 })
    setTimeout(() =>
      noise({ dur: 0.08, vol: 0.28, attack: 0.002, release: 0.06, lowHz: 300, highHz: 1500 }), 130)
  },

  /** 🍔 Burger stack snap — soft pop */
  stack() {
    tone({ freq: 520, freq2: 340, type: 'sine', dur: 0.06, vol: 0.35, attack: 0.003, release: 0.07 })
    setTimeout(() =>
      tone({ freq: 260, type: 'triangle', dur: 0.08, vol: 0.20, attack: 0.002, release: 0.07 }), 55)
  },

  /** 🔪 Pizza slice — crisp scrape */
  slice() {
    noise({ dur: 0.14, vol: 0.32, attack: 0.002, release: 0.08, lowHz: 1500, highHz: 5000 })
    tone({ freq: 380, freq2: 220, type: 'sawtooth', dur: 0.1, vol: 0.15, attack: 0.002, release: 0.08 })
  },

  /** 🔔 Oven ding — warm bell tone */
  oven_ding() {
    tone({ freq: 880,  type: 'sine',     dur: 0.5,  vol: 0.40, attack: 0.005, release: 0.45 })
    setTimeout(() =>
      tone({ freq: 1108, type: 'sine',   dur: 0.4,  vol: 0.28, attack: 0.005, release: 0.35 }), 80)
    setTimeout(() =>
      tone({ freq: 1320, type: 'sine',   dur: 0.35, vol: 0.20, attack: 0.005, release: 0.30 }), 160)
  },

  /** ✨ Sparkle reward — ascending chime */
  sparkle() {
    seq([
      { freq: 660,  type: 'sine', dur: 0.12, vol: 0.32, attack: 0.004, release: 0.10 },
      { freq: 880,  type: 'sine', dur: 0.12, vol: 0.30, attack: 0.004, release: 0.10 },
      { freq: 1108, type: 'sine', dur: 0.16, vol: 0.28, attack: 0.004, release: 0.14 },
      { freq: 1320, type: 'sine', dur: 0.20, vol: 0.26, attack: 0.004, release: 0.18 },
    ], 65)
  },

  /** 🎵 Squish — soft dough press */
  squish() {
    tone({ freq: 160, freq2: 100, type: 'sine', dur: 0.18, vol: 0.30, attack: 0.01, release: 0.15 })
    noise({ dur: 0.12, vol: 0.12, attack: 0.01, release: 0.10, lowHz: 100, highHz: 600 })
  },

  /** 🐱 Meow — FM-ish cat meow */
  meow() {
    tone({ freq: 520, freq2: 380, type: 'triangle', dur: 0.30, vol: 0.35, attack: 0.02, release: 0.20 })
    setTimeout(() =>
      tone({ freq: 380, freq2: 460, type: 'triangle', dur: 0.20, vol: 0.25, attack: 0.01, release: 0.18 }), 310)
  },

  /** 😻 Purr — low tremolo */
  purr() {
    const c = ensureCtx()
    if (!c || isMuted()) return
    try {
      const osc  = c.createOscillator()
      const lfo  = c.createOscillator()
      const gain = c.createGain()
      const lfoG = c.createGain()
      const now  = c.currentTime

      lfo.connect(lfoG)
      lfoG.connect(osc.frequency)
      osc.connect(gain)
      gain.connect(c.destination)

      osc.type               = 'triangle'
      osc.frequency.value    = 55
      lfo.type               = 'sine'
      lfo.frequency.value    = 28  // 28Hz = purr rumble
      lfoG.gain.value        = 25

      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.28, now + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.80)

      osc.start(now); osc.stop(now + 0.85)
      lfo.start(now); lfo.stop(now + 0.85)
    } catch { /**/ }
  },

  /** 😋 Munch — soft eating sound */
  munch() {
    ;[0, 120, 240].forEach(t =>
      setTimeout(() =>
        noise({ dur: 0.07, vol: 0.22, attack: 0.003, release: 0.06, lowHz: 200, highHz: 900 }), t))
  },

  /** 😸 Happy chirp — two bright rising tones */
  happy_chirp() {
    seq([
      { freq: 660, type: 'sine', dur: 0.1, vol: 0.30, attack: 0.006, release: 0.08 },
      { freq: 880, type: 'sine', dur: 0.14, vol: 0.28, attack: 0.006, release: 0.12 },
    ], 90)
  },

  /** 🎮 Button pop — UI feedback */
  pop() {
    tone({ freq: 480, freq2: 320, type: 'sine', dur: 0.06, vol: 0.30, attack: 0.003, release: 0.06 })
  },

  /** ✅ Success chord — end-of-recipe reward */
  success() {
    seq([
      { freq: 523, type: 'sine', dur: 0.25, vol: 0.30, attack: 0.008, release: 0.20 },
      { freq: 659, type: 'sine', dur: 0.25, vol: 0.28, attack: 0.008, release: 0.20 },
      { freq: 784, type: 'sine', dur: 0.35, vol: 0.26, attack: 0.008, release: 0.28 },
    ], 80)
  },
}

/**
 * Play a sound by key name (matches step.sfx in recipe data).
 * Silent no-op if key unknown or muted.
 */
export const sfx = {
  play(key) {
    if (!key || isMuted()) return
    const fn = SFX[key]
    if (typeof fn === 'function') {
      try { fn() } catch { /**/ }
    }
  },
  // Direct named methods for convenience
  ...SFX,
}
