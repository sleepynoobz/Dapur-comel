/**
 * useGameEngine.js — Pass 1 refactor
 *
 * ── What changed ──────────────────────────────────────────────────────────────
 *   Added step-level navigation inside COOKING state:
 *
 *   stepIndex       — which step in recipe.steps[] is active (0-based)
 *   currentStep     — the full step config object (recipe.steps[stepIndex])
 *   advanceStep()   — move to next step; auto-transitions FSM when all steps done
 *   stepProgress    — 0–1 float, for progress indicator
 *
 *   The FSM stays at STAGE.COOKING for the entire recipe.
 *   Step advancement is pure React state — no FSM involvement.
 *   When all steps are exhausted, advanceStep() fires FSM 'FEED_OYEN'.
 *
 * ── Backward compatibility ────────────────────────────────────────────────────
 *   completeStage() still works — it's kept as an alias used by legacy stage
 *   components (GatherStage etc.) that haven't been migrated yet.
 *   Pass 3 will remove completeStage() once all step components are in place.
 *
 * ── Recipe registry ───────────────────────────────────────────────────────────
 *   Now includes all 4 dishes. Placeholder configs for Pass 2.
 *   Pass 2 will populate steps[] for each recipe.
 */

import { useState, useCallback, useRef, useMemo } from 'react'
import { createGameStateMachine } from '../engine/gameStateMachine.js'
import { STAGE } from '../utils/constants.js'

// ── Recipe registry ────────────────────────────────────────────────────────────
// Imported lazily so missing files don't crash the engine.
// Pass 2 will replace stubs with real recipe configs.
import { pancakeRecipe }  from '../data/recipes/pancake.js'
import { cakeRecipe }     from '../data/recipes/cake.js'
import { pizzaRecipe }    from '../data/recipes/pizza.js'
import { burgerRecipe }   from '../data/recipes/burger.js'

const RECIPE_REGISTRY = {
  pancake: pancakeRecipe,
  cake:    cakeRecipe,
  pizza:   pizzaRecipe,
  burger:  burgerRecipe,
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useGameEngine() {
  const fsmRef = useRef(null)
  if (!fsmRef.current) {
    fsmRef.current = createGameStateMachine()
    fsmRef.current.dispatch('INIT')
  }

  // ── FSM-level state ──────────────────────────────────────────────────────
  const [currentStage,    setCurrentStage]     = useState(() => fsmRef.current.getState())
  const [selectedRecipeId, setSelectedRecipeId] = useState(null)

  // ── Step-level state (new) ───────────────────────────────────────────────
  // Owned entirely by the hook — FSM never touches this.
  const [stepIndex, setStepIndex] = useState(0)

  // ── Stable FSM sync ──────────────────────────────────────────────────────
  const syncState = useCallback(() => {
    const fsm = fsmRef.current
    setCurrentStage(fsm.getState())
    setSelectedRecipeId(fsm.getRecipe())
    // Reset step index on every FSM transition (new recipe, celebrate, etc.)
    setStepIndex(0)
  }, [])

  const dispatch = useCallback((action, payload = {}) => {
    const result = fsmRef.current.dispatch(action, payload)
    if (result.success) {
      syncState()
    } else if (import.meta.env?.DEV) {
      console.warn('[useGameEngine]', result.error)
    }
    return result.success
  }, [syncState])

  // ── Derived recipe data ──────────────────────────────────────────────────
  const currentRecipe = useMemo(
    () => (selectedRecipeId ? RECIPE_REGISTRY[selectedRecipeId] ?? null : null),
    [selectedRecipeId]
  )

  // Total cooking steps (excludes any FEED_OYEN at end — that's its own FSM state)
  const totalSteps = useMemo(
    () => currentRecipe?.steps?.length ?? 0,
    [currentRecipe]
  )

  // The active step config object
  const currentStep = useMemo(
    () => (currentRecipe?.steps?.[stepIndex] ?? null),
    [currentRecipe, stepIndex]
  )

  // Progress fraction 0–1 for progress dots / bar
  const stepProgress = useMemo(
    () => (totalSteps > 0 ? stepIndex / totalSteps : 0),
    [stepIndex, totalSteps]
  )

  // ── Navigation actions ───────────────────────────────────────────────────

  const goHome           = useCallback(() => dispatch('HOME'),     [dispatch])
  const goToRecipeSelect = useCallback(() => dispatch('PLAY'),     [dispatch])
  const openSettings     = useCallback(() => dispatch('SETTINGS'), [dispatch])
  const closeSettings    = useCallback(() => dispatch('BACK'),     [dispatch])
  const resumeFromRest   = useCallback(() => dispatch('RESUME'),   [dispatch])
  const playAgain        = useCallback(() => dispatch('PLAY_AGAIN'), [dispatch])

  const selectRecipe = useCallback((id) => {
    dispatch('SELECT', { recipeId: id })
    // stepIndex reset happens inside syncState via dispatch
  }, [dispatch])

  /**
   * advanceStep() — primary in-cooking navigation for new step components.
   *
   * If more steps remain:   increment stepIndex (stay in COOKING)
   * If all steps complete:  fire FSM 'FEED_OYEN' transition
   */
  const advanceStep = useCallback((shouldRest = false) => {
    if (shouldRest) {
      dispatch('REST')
      return
    }
    const nextIndex = stepIndex + 1
    if (nextIndex < totalSteps) {
      setStepIndex(nextIndex)
    } else {
      // All steps done — proceed to feed Oyen
      dispatch('FEED_OYEN')
    }
  }, [stepIndex, totalSteps, dispatch])

  /**
   * completeFeedOyen() — called from FeedOyenStep when child feeds Oyen.
   * Transitions FSM to CELEBRATE.
   */
  const completeFeedOyen = useCallback((shouldRest = false) => {
    if (shouldRest) { dispatch('REST'); return }
    dispatch('COMPLETE')
  }, [dispatch])

  /**
   * completeStage() — backward-compat alias for legacy stage components.
   * GatherStage / CountStage etc. still call this.
   * Internally calls advanceStep() so the new engine handles it correctly.
   *
   * NOTE: Legacy stages only run when STAGE is one of the old GATHER/COUNT/…
   * states. That path is only reachable if a legacy recipe config points the
   * FSM there. Once Pass 3 is done this method will be removed.
   */
  const completeStage = useCallback((shouldRest = false) => {
    if (currentStage === STAGE.COOKING) {
      advanceStep(shouldRest)
    } else {
      // Legacy FSM path (GATHER→COUNT→MIX etc.)
      dispatch(shouldRest ? 'REST' : 'COMPLETE')
    }
  }, [currentStage, advanceStep, dispatch])

  const resetGame = useCallback(() => {
    fsmRef.current.reset()
    fsmRef.current.dispatch('INIT')
    syncState()
  }, [syncState])

  // ── Convenience flags ────────────────────────────────────────────────────
  const isCooking    = currentStage === STAGE.COOKING
  const isFeedOyen   = currentStage === STAGE.FEED_OYEN
  const isCelebrate  = currentStage === STAGE.CELEBRATE
  const isInGameFlow = isCooking || isFeedOyen || isCelebrate

  return {
    // FSM state
    currentStage,
    selectedRecipeId,

    // Recipe + step data
    currentRecipe,
    currentStep,
    stepIndex,
    totalSteps,
    stepProgress,

    // Convenience flags
    isHome:         currentStage === STAGE.HOME,
    isRecipeSelect: currentStage === STAGE.RECIPE_SELECT,
    isCooking,
    isFeedOyen,
    isCelebrate,
    isRest:         currentStage === STAGE.REST_NUDGE,
    isSettings:     currentStage === STAGE.SETTINGS,
    isInGameFlow,

    // Actions
    goHome,
    goToRecipeSelect,
    selectRecipe,
    advanceStep,
    completeFeedOyen,
    completeStage,      // backward compat — remove in Pass 3
    resumeFromRest,
    openSettings,
    closeSettings,
    playAgain,
    resetGame,
    dispatch,

    // Full registry (for recipe select screen)
    recipeRegistry: RECIPE_REGISTRY,
  }
}
