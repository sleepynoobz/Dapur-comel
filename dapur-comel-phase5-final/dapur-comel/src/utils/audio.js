/**
 * audio.js
 *
 * Lightweight optional SFX utility using Web Audio API.
 *
 * Architecture: Procedurally generated sounds — NO audio files needed.
 * All sounds are synthesised from oscillators → zero download size.
 *
 * If Web Audio API unavailable, all functions are silent no-ops.
 * Never throws — always safe to call.
 *
 * Usage:
 *   import { sfx } from '../utils/audio.js'
 *   sfx.pop()
 *   sfx.success()
 *   sfx.tap()
 */

import { loadSettings } from './storage.js'

// ─── Audio Context ────────────────────────────────────────────────────────────

let ctx = null

/**
 * Lazily create AudioContext on first use.
 * Required by browser autoplay policy — must be triggered by user gesture.
 */
function getContext() {
  if (ctx) return ctx
  if (typeof window === 'undefined') return null

  try {
    const Ctor = window.AudioContext || window.webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
    return ctx
  } catch {
    return null
  }
}

/**
 * Resume context if suspended (Chrome autoplay policy).
 */
async function ensureRunning() {
  const c = getContext()
  if (!c) return null
  if (c.state === 'suspended') {
    try { await c.resume() } catch { /**/ }
  }
  return c
}

// ─── Synthesis helpers ────────────────────────────────────────────────────────

/**
 * Play a simple tone burst.
 *
 * @param {object} opts
 * @param {number}   opts.freq      - frequency in Hz
 * @param {'sine'|'square'|'triangle'|'sawtooth'} opts.type - waveform
 * @param {number}   opts.duration  - duration in seconds
 * @param {number}   opts.volume    - 0–1
 * @param {number}   opts.attack    - attack time in seconds
 * @param {number}   opts.decay     - decay time in seconds
 */
async function tone({ freq = 440, type = 'sine', duration = 0.1, volume = 0.3, attack = 0.005, decay = 0.05 }) {
  const c = await ensureRunning()
  if (!c) return

  const { sfxMuted } = loadSettings()
  if (sfxMuted) return

  try {
    const osc  = c.createOscillator()
    const gain = c.createGain()

    osc.connect(gain)
    gain.connect(c.destination)

    osc.type = type
    osc.frequency.setValueAtTime(freq, c.currentTime)

    gain.gain.setValueAtTime(0, c.currentTime)
    gain.gain.linearRampToValueAtTime(volume, c.currentTime + attack)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)

    osc.start(c.currentTime)
    osc.stop(c.currentTime + duration + decay)
  } catch {
    // Silent fail — never crash the game for missing SFX
  }
}

/**
 * Play a chord (multiple tones simultaneously).
 */
async function chord(freqs, opts = {}) {
  await Promise.all(freqs.map(freq => tone({ ...opts, freq })))
}

// ─── Named Sound Effects ──────────────────────────────────────────────────────

export const sfx = {

  /** Light tap feedback — ingredient selected */
  tap: () => tone({ freq: 880, type: 'sine', duration: 0.08, volume: 0.25, attack: 0.002 }),

  /** Satisfying pop — correct answer */
  pop: () => tone({ freq: 1200, type: 'sine', duration: 0.12, volume: 0.3, attack: 0.003 }),

  /** Gentle boing — wrong tap (non-punishing) */
  boing: () => tone({ freq: 320, type: 'sine', duration: 0.15, volume: 0.2, attack: 0.005 }),

  /** Ding! — oven done, stage complete */
  ding: async () => {
    await tone({ freq: 1047, type: 'sine', duration: 0.15, volume: 0.35, attack: 0.003 })
    await new Promise(r => setTimeout(r, 80))
    await tone({ freq: 1319, type: 'sine', duration: 0.25, volume: 0.3, attack: 0.003 })
  },

  /** Happy chord — celebration */
  celebrate: async () => {
    await chord([523, 659, 784], { type: 'sine', duration: 0.4, volume: 0.2, attack: 0.01 })
    await new Promise(r => setTimeout(r, 200))
    await chord([659, 784, 988], { type: 'sine', duration: 0.5, volume: 0.25, attack: 0.01 })
  },

  /** Drop sound — item placed */
  drop: () => tone({ freq: 600, type: 'sine', duration: 0.1, volume: 0.2, attack: 0.002 }),

  /** Woosh — drag started */
  woosh: () => tone({ freq: 400, type: 'triangle', duration: 0.08, volume: 0.15, attack: 0.001 }),

  /** Star earned */
  star: async () => {
    const freqs = [523, 659, 784, 1047]
    for (const freq of freqs) {
      await tone({ freq, type: 'sine', duration: 0.1, volume: 0.25, attack: 0.002 })
      await new Promise(r => setTimeout(r, 60))
    }
  },
}

/**
 * Unlock AudioContext on first user gesture.
 * Call this from your first touch handler.
 */
export function unlockAudio() {
  getContext()
  ensureRunning()
}
