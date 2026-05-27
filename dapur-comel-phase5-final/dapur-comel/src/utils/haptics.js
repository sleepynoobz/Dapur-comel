/**
 * haptics.js
 *
 * Optional haptic feedback wrapper.
 * Architecture Revision #7: haptics are enhancement only, never core.
 * All functions are silent no-ops if Vibration API is unavailable.
 */

const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator

/**
 * Safe vibrate wrapper — never throws.
 * @param {number | number[]} pattern - ms or pattern array
 */
function vibrate(pattern) {
  if (!isSupported) return
  try {
    navigator.vibrate(pattern)
  } catch {
    // Silently ignore — some browsers block vibration without user gesture
  }
}

// ─── Named Haptic Patterns ────────────────────────────────────────────────────

/** Short tap confirmation — ingredient selected */
export function hapticTap() {
  vibrate(15)
}

/** Slightly longer — drop confirmed */
export function hapticDrop() {
  vibrate(25)
}

/** Double pulse — stage complete */
export function hapticSuccess() {
  vibrate([20, 50, 40])
}

/** Playful triple tap — celebration */
export function hapticCelebration() {
  vibrate([30, 40, 30, 40, 60])
}

/** Gentle nudge — wrong tap (non-punishing) */
export function hapticGentle() {
  vibrate(10)
}

/** Stop all vibration */
export function hapticStop() {
  vibrate(0)
}
