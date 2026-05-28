/**
 * haptics.js — Pass 4: refined patterns
 *
 * Vibration API wrapper. Silent no-op if API unavailable.
 * All patterns are short and subtle — toddler-safe.
 *
 * Usage policy:
 *   Only on successful meaningful interactions.
 *   NOT on every tap. NOT on wrong taps (no punishing vibration).
 *   Always try/catch — never crashes game.
 */

const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator

function vibe(pattern) {
  if (!canVibrate) return
  try { navigator.vibrate(pattern) } catch { /**/ }
}

export const hapticTap        = () => vibe(12)              // light touch feedback
export const hapticDrop       = () => vibe(22)              // item placed
export const hapticSuccess    = () => vibe([18, 45, 32])    // step complete
export const hapticCelebration= () => vibe([20, 40, 20, 40, 55]) // recipe done
export const hapticGentle     = () => vibe(8)               // very subtle
export const hapticStop       = () => vibe(0)
export const hapticSnap       = () => vibe([10, 20, 15])    // burger stack snap
export const hapticFlip       = () => vibe([15, 30, 10])    // pancake flip
export const hapticFeed       = () => vibe([12, 35, 12, 35, 50]) // feed Oyen
