import { STORAGE_KEYS, UNLOCK_CONFIG, LEVEL } from './constants.js'

// ─── Default State ────────────────────────────────────────────────────────────
const DEFAULT_PROGRESS = {
  version:            1,
  level:              LEVEL.ONE,
  unlockedRecipes:    [...UNLOCK_CONFIG.DEFAULT_UNLOCKED],
  starsEarned:        {},    // { [recipeId]: 1|2|3 }
  stickersCollected:  [],    // string IDs
  sessionsCompleted:  0,
  totalPlayMinutes:   0,
  lastPlayedAt:       null,  // ISO date string
}

const DEFAULT_SETTINGS = {
  version:   1,
  voiceMuted: false,
  sfxMuted:   false,
}

// ─── Core read/write ──────────────────────────────────────────────────────────

/**
 * Safe JSON read from localStorage.
 * Returns null if key missing or parse fails.
 */
function safeRead(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    console.warn(`[storage] Failed to read key: ${key}`)
    return null
  }
}

/**
 * Safe JSON write to localStorage.
 * Returns true on success, false if storage is full or unavailable.
 */
function safeWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    console.warn(`[storage] Failed to write key: ${key}`, err)
    return false
  }
}

/**
 * Delete a key from localStorage.
 */
function safeDelete(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

// ─── Progress ─────────────────────────────────────────────────────────────────

/**
 * Load player progress.
 * Merges stored data with defaults to handle schema additions gracefully.
 */
export function loadProgress() {
  const stored = safeRead(STORAGE_KEYS.PROGRESS)
  if (!stored) return { ...DEFAULT_PROGRESS }

  // Schema migration: always merge with defaults so new fields appear
  return {
    ...DEFAULT_PROGRESS,
    ...stored,
    // Ensure arrays are arrays (defensive)
    unlockedRecipes:   Array.isArray(stored.unlockedRecipes)   ? stored.unlockedRecipes   : DEFAULT_PROGRESS.unlockedRecipes,
    stickersCollected: Array.isArray(stored.stickersCollected) ? stored.stickersCollected : DEFAULT_PROGRESS.stickersCollected,
  }
}

/**
 * Save full progress object.
 */
export function saveProgress(progress) {
  return safeWrite(STORAGE_KEYS.PROGRESS, {
    ...progress,
    lastPlayedAt: new Date().toISOString(),
  })
}

/**
 * Record stars earned for a recipe.
 * Only updates if new stars > previous stars.
 */
export function recordStars(recipeId, stars) {
  const progress = loadProgress()
  const existing = progress.starsEarned[recipeId] ?? 0
  if (stars > existing) {
    progress.starsEarned[recipeId] = stars
    saveProgress(progress)
  }
  return progress
}

/**
 * Add a sticker to the collection (deduplicated).
 */
export function collectSticker(stickerId) {
  const progress = loadProgress()
  if (!progress.stickersCollected.includes(stickerId)) {
    progress.stickersCollected.push(stickerId)
    saveProgress(progress)
  }
  return progress
}

/**
 * Unlock a new recipe.
 */
export function unlockRecipe(recipeId) {
  const progress = loadProgress()
  if (!progress.unlockedRecipes.includes(recipeId)) {
    progress.unlockedRecipes.push(recipeId)
    saveProgress(progress)
  }
  return progress
}

/**
 * Increment sessions completed and update total play time.
 * @param {number} minutesPlayed - session duration in minutes
 */
export function recordSession(minutesPlayed = 0) {
  const progress = loadProgress()
  progress.sessionsCompleted  += 1
  progress.totalPlayMinutes   += minutesPlayed
  saveProgress(progress)
  return progress
}

/**
 * Set player level (1–3).
 */
export function setLevel(level) {
  const progress = loadProgress()
  progress.level = level
  saveProgress(progress)
  return progress
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function loadSettings() {
  const stored = safeRead(STORAGE_KEYS.SETTINGS)
  if (!stored) return { ...DEFAULT_SETTINGS }
  return { ...DEFAULT_SETTINGS, ...stored }
}

export function saveSettings(settings) {
  return safeWrite(STORAGE_KEYS.SETTINGS, settings)
}

export function toggleVoice() {
  const settings = loadSettings()
  settings.voiceMuted = !settings.voiceMuted
  saveSettings(settings)
  return settings
}

export function toggleSfx() {
  const settings = loadSettings()
  settings.sfxMuted = !settings.sfxMuted
  saveSettings(settings)
  return settings
}

// ─── Session Timing ───────────────────────────────────────────────────────────
// Uses sessionStorage (clears on tab close) for play-time tracking

export function startSessionTimer() {
  sessionStorage.setItem(STORAGE_KEYS.SESSION, Date.now().toString())
}

export function getSessionMinutes() {
  const startRaw = sessionStorage.getItem(STORAGE_KEYS.SESSION)
  if (!startRaw) return 0
  const elapsed = Date.now() - parseInt(startRaw, 10)
  return Math.floor(elapsed / 60000)
}

export function clearSessionTimer() {
  sessionStorage.removeItem(STORAGE_KEYS.SESSION)
}

// ─── Reset (parent-gated) ─────────────────────────────────────────────────────

/**
 * Full wipe — parent settings only.
 * Resets all progress and settings to defaults.
 */
export function resetAll() {
  safeDelete(STORAGE_KEYS.PROGRESS)
  safeDelete(STORAGE_KEYS.SETTINGS)
  clearSessionTimer()
  console.info('[storage] All data reset.')
}

/**
 * Reset only progress, keep settings.
 */
export function resetProgress() {
  safeDelete(STORAGE_KEYS.PROGRESS)
  clearSessionTimer()
  console.info('[storage] Progress reset.')
}
