/**
 * useGameEngine.js — Phase 3 hardened
 *
 * React wrapper for the game state machine.
 *
 * ── FIX: import.meta.env.DEV ─────────────────────────────────────────────
 *   Was using process.env.NODE_ENV (Node.js style) — wrong for Vite projects.
 *   Replaced with import.meta.env.DEV throughout.
 *
 * ── FIX: dispatch stability ──────────────────────────────────────────────
 *   syncState is now stable (empty deps) — it reads from fsmRef directly.
 *   This prevents dispatch from changing reference every render.
 */

import { useState, useCallback, useRef, useMemo } from 'react'
import { createGameStateMachine } from '../engine/gameStateMachine.js'
import { STAGE }          from '../utils/constants.js'
import { kekStrawberi }   from '../data/recipes/kek-strawberi.js'
import { pancake }        from '../data/recipes/pancake.js'
import { biskut }         from '../data/recipes/biskut.js'

const RECIPE_REGISTRY = {
  'kek-strawberi': kekStrawberi,
  'pancake':       pancake,
  'biskut':        biskut,
}

export function useGameEngine() {
  const fsmRef = useRef(null)
  if (!fsmRef.current) {
    fsmRef.current = createGameStateMachine()
    fsmRef.current.dispatch('INIT')
  }

  const [currentStage,    setCurrentStage]    = useState(() => fsmRef.current.getState())
  const [selectedRecipeId, setSelectedRecipeId] = useState(null)
  const [stageIndex,       setStageIndex]       = useState(-1)
  const [completedStages,  setCompletedStages]  = useState([])

  // Stable sync — reads from ref, no deps needed
  const syncState = useCallback(() => {
    const fsm = fsmRef.current
    setCurrentStage(fsm.getState())
    setSelectedRecipeId(fsm.getRecipe())
    setStageIndex(fsm.getStageIndex())
    setCompletedStages(fsm.getCompletedStages())
  }, [])   // intentionally empty — syncState is stable

  const dispatch = useCallback((action, payload = {}) => {
    const result = fsmRef.current.dispatch(action, payload)
    if (result.success) {
      syncState()
    } else if (import.meta.env?.DEV) {
      console.warn('[useGameEngine]', result.error)
    }
    return result.success
  }, [syncState])

  const goHome           = useCallback(() => dispatch('HOME'),              [dispatch])
  const goToRecipeSelect = useCallback(() => dispatch('PLAY'),              [dispatch])
  const selectRecipe     = useCallback((id) => dispatch('SELECT', { recipeId: id }), [dispatch])
  const completeStage    = useCallback((shouldRest = false) => dispatch(shouldRest ? 'REST' : 'COMPLETE'), [dispatch])
  const resumeFromRest   = useCallback(() => dispatch('RESUME'),            [dispatch])
  const openSettings     = useCallback(() => dispatch('SETTINGS'),          [dispatch])
  const closeSettings    = useCallback(() => dispatch('BACK'),              [dispatch])
  const playAgain        = useCallback(() => dispatch('PLAY_AGAIN'),        [dispatch])

  const resetGame = useCallback(() => {
    fsmRef.current.reset()
    fsmRef.current.dispatch('INIT')
    syncState()
  }, [syncState])

  const currentRecipe = useMemo(
    () => (selectedRecipeId ? RECIPE_REGISTRY[selectedRecipeId] ?? null : null),
    [selectedRecipeId]
  )

  const currentStageConfig = useMemo(() => {
    if (!currentRecipe || stageIndex < 0) return null
    return currentRecipe.stages?.[stageIndex] ?? null
  }, [currentRecipe, stageIndex])

  const stageProgress = useMemo(() => {
    if (stageIndex < 0) return 0
    return stageIndex / fsmRef.current.getTotalStages()
  }, [stageIndex])

  const isInGameFlow = useMemo(() => [
    STAGE.GATHER, STAGE.COUNT, STAGE.MIX,
    STAGE.OVEN, STAGE.DECORATE, STAGE.CELEBRATE,
  ].includes(currentStage), [currentStage])

  return {
    currentStage, selectedRecipeId, stageIndex, completedStages,
    currentRecipe, currentStageConfig, stageProgress, isInGameFlow,
    isHome:         currentStage === STAGE.HOME,
    isRecipeSelect: currentStage === STAGE.RECIPE_SELECT,
    isGather:       currentStage === STAGE.GATHER,
    isCount:        currentStage === STAGE.COUNT,
    isMix:          currentStage === STAGE.MIX,
    isOven:         currentStage === STAGE.OVEN,
    isDecorate:     currentStage === STAGE.DECORATE,
    isCelebrate:    currentStage === STAGE.CELEBRATE,
    isRest:         currentStage === STAGE.REST_NUDGE,
    isSettings:     currentStage === STAGE.SETTINGS,
    dispatch, goHome, goToRecipeSelect, selectRecipe,
    completeStage, resumeFromRest, openSettings, closeSettings,
    playAgain, resetGame,
    recipeRegistry: RECIPE_REGISTRY,
  }
}
