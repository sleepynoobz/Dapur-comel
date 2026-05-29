/**
 * gameStateMachine.js — Pass 1 refactor
 *
 * ── What changed ──────────────────────────────────────────────────────────────
 *   OLD: RECIPE_SELECT → GATHER → COUNT → MIX → OVEN → DECORATE → CELEBRATE
 *        (hardcoded linear chain — all recipes forced through same sequence)
 *
 *   NEW: RECIPE_SELECT → COOKING → FEED_OYEN → CELEBRATE
 *        (FSM manages only the outer shell; step sequence is recipe-owned)
 *
 *   The FSM no longer knows what step is active inside COOKING.
 *   Step index is tracked exclusively in useGameEngine, driven by recipe.steps[].
 *   This lets each recipe define its own unique interaction sequence.
 *
 * ── What's kept ───────────────────────────────────────────────────────────────
 *   Legacy GATHER/COUNT/MIX/OVEN/DECORATE states are still valid FSM states
 *   so existing stage components continue to work untouched during Pass 2→3.
 *   They'll be removed when Pass 3 replaces all stage components.
 *
 * ── FSM is still pure JS — no React, no side effects. ────────────────────────
 */

import { STAGE } from '../utils/constants.js'

const TRANSITIONS = {
  // ── Meta ──────────────────────────────────────────────────────────────────
  [STAGE.IDLE]: {
    INIT:      STAGE.HOME,
  },
  [STAGE.HOME]: {
    PLAY:      STAGE.RECIPE_SELECT,
    SETTINGS:  STAGE.SETTINGS,
  },
  [STAGE.RECIPE_SELECT]: {
    SELECT:    STAGE.COOKING,   // ← was STAGE.GATHER; now goes to COOKING
    BACK:      STAGE.HOME,
    SETTINGS:  STAGE.SETTINGS,
  },

  // ── New cooking loop ──────────────────────────────────────────────────────
  // COOKING: one FSM state — step index managed by useGameEngine
  [STAGE.COOKING]: {
    FEED_OYEN: STAGE.FEED_OYEN,  // all steps complete → feed Oyen
    REST:      STAGE.REST_NUDGE,
    SETTINGS:  STAGE.SETTINGS,
  },
  [STAGE.FEED_OYEN]: {
    COMPLETE:  STAGE.CELEBRATE,
    REST:      STAGE.REST_NUDGE,
    SETTINGS:  STAGE.SETTINGS,
  },

  // ── Legacy cooking states (still reachable for backwards compat) ──────────
  // These exist so existing stage files (GatherStage etc.) don't break
  // during the transition. Pass 3 will remove these transitions entirely.
  [STAGE.GATHER]: {
    COMPLETE:  STAGE.COUNT,
    REST:      STAGE.REST_NUDGE,
    SETTINGS:  STAGE.SETTINGS,
  },
  [STAGE.COUNT]: {
    COMPLETE:  STAGE.MIX,
    REST:      STAGE.REST_NUDGE,
    SETTINGS:  STAGE.SETTINGS,
  },
  [STAGE.MIX]: {
    COMPLETE:  STAGE.OVEN,
    REST:      STAGE.REST_NUDGE,
    SETTINGS:  STAGE.SETTINGS,
  },
  [STAGE.OVEN]: {
    COMPLETE:  STAGE.DECORATE,
    REST:      STAGE.REST_NUDGE,
    SETTINGS:  STAGE.SETTINGS,
  },
  [STAGE.DECORATE]: {
    COMPLETE:  STAGE.CELEBRATE,
    REST:      STAGE.REST_NUDGE,
    SETTINGS:  STAGE.SETTINGS,
  },

  // ── Shared end states ─────────────────────────────────────────────────────
  [STAGE.CELEBRATE]: {
    PLAY_AGAIN: STAGE.RECIPE_SELECT,
    HOME:       STAGE.HOME,
    SETTINGS:   STAGE.SETTINGS,
  },
  [STAGE.REST_NUDGE]: {
    RESUME:    null,  // dynamic: returns to previousState
    HOME:      STAGE.HOME,
  },
  [STAGE.SETTINGS]: {
    BACK:      null,  // dynamic: returns to previousState
    HOME:      STAGE.HOME,
    RESET:     STAGE.HOME,
  },
}

export function createGameStateMachine() {
  let currentState    = STAGE.IDLE
  let previousState   = null
  let selectedRecipe  = null

  return {
    getState()         { return currentState },
    getPreviousState() { return previousState },
    getRecipe()        { return selectedRecipe },

    can(action) {
      return action in (TRANSITIONS[currentState] ?? {})
    },

    dispatch(action, payload = {}) {
      const map = TRANSITIONS[currentState]

      if (!map) {
        return { success: false, error: `No transitions for state: ${currentState}` }
      }
      if (!(action in map)) {
        return { success: false, error: `'${action}' invalid from '${currentState}'` }
      }

      let next = map[action]

      // Dynamic back/resume — return to previous state
      if (next === null && (action === 'RESUME' || action === 'BACK')) {
        next = previousState ?? STAGE.HOME
      }
      if (!next) {
        return { success: false, error: `Cannot resolve next state for '${action}'` }
      }

      // Capture recipe on SELECT
      if (action === 'SELECT' && payload.recipeId) {
        selectedRecipe = payload.recipeId
      }

      previousState = currentState
      currentState  = next

      return { success: true, from: previousState, to: currentState, payload }
    },

    reset() {
      currentState   = STAGE.IDLE
      previousState  = null
      selectedRecipe = null
    },
  }
}
