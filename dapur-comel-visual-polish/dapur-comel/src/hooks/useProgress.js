/**
 * useProgress.js
 *
 * React hook for reading and writing player progress.
 * Wraps storage.js utilities with React state so components
 * re-render when progress changes.
 */

import { useState, useCallback } from 'react'
import {
  loadProgress,
  saveProgress,
  recordStars,
  collectSticker,
  unlockRecipe,
  recordSession,
  setLevel as setLevelInStorage,
  loadSettings,
  saveSettings,
} from '../utils/storage.js'

export function useProgress() {
  const [progress, setProgress] = useState(() => loadProgress())
  const [settings, setSettings] = useState(() => loadSettings())

  // ── Progress Mutations ───────────────────────────────────────────────────

  const awardStars = useCallback((recipeId, stars) => {
    const updated = recordStars(recipeId, stars)
    setProgress({ ...updated })
    return updated
  }, [])

  const addSticker = useCallback((stickerId) => {
    const updated = collectSticker(stickerId)
    setProgress({ ...updated })
    return updated
  }, [])

  const unlock = useCallback((recipeId) => {
    const updated = unlockRecipe(recipeId)
    setProgress({ ...updated })
    return updated
  }, [])

  const completeSession = useCallback((minutesPlayed) => {
    const updated = recordSession(minutesPlayed)
    setProgress({ ...updated })
    return updated
  }, [])

  const advanceLevel = useCallback(() => {
    const next = Math.min((progress.level || 1) + 1, 3)
    const updated = setLevelInStorage(next)
    setProgress({ ...updated })
    return updated
  }, [progress.level])

  const refreshProgress = useCallback(() => {
    setProgress(loadProgress())
  }, [])

  // ── Settings ─────────────────────────────────────────────────────────────

  const toggleVoiceMuted = useCallback(() => {
    const updated = { ...settings, voiceMuted: !settings.voiceMuted }
    saveSettings(updated)
    setSettings(updated)
    return updated
  }, [settings])

  const toggleSfxMuted = useCallback(() => {
    const updated = { ...settings, sfxMuted: !settings.sfxMuted }
    saveSettings(updated)
    setSettings(updated)
    return updated
  }, [settings])

  // ── Helpers ──────────────────────────────────────────────────────────────

  const isRecipeUnlocked = useCallback(
    (recipeId) => progress.unlockedRecipes?.includes(recipeId) ?? false,
    [progress.unlockedRecipes]
  )

  const getStarsForRecipe = useCallback(
    (recipeId) => progress.starsEarned?.[recipeId] ?? 0,
    [progress.starsEarned]
  )

  const hasStickerCollected = useCallback(
    (stickerId) => progress.stickersCollected?.includes(stickerId) ?? false,
    [progress.stickersCollected]
  )

  return {
    // State
    progress,
    settings,
    // Mutations
    awardStars,
    addSticker,
    unlock,
    completeSession,
    advanceLevel,
    refreshProgress,
    toggleVoiceMuted,
    toggleSfxMuted,
    // Helpers
    isRecipeUnlocked,
    getStarsForRecipe,
    hasStickerCollected,
  }
}
