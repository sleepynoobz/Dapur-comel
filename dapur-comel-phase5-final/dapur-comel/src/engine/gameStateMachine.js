/**
 * gameStateMachine.js
 *
 * Lightweight finite state machine for Dapur Comel's game flow.
 * No external library — fully custom to keep bundle small.
 *
 * States map to the STAGE constants.
 * Transitions are explicit and predictable.
 *
 * The FSM does NOT hold React state — it's pure logic.
 * useGameEngine.js wraps it with React state management.
 */

import { STAGE, STAGE_FLOW } from '../utils/constants.js'

// ─── Transition Map ───────────────────────────────────────────────────────────
// Defines valid transitions from each state.
// format: { [fromState]: { [action]: toState } }

const TRANSITIONS = {
  [STAGE.IDLE]: {
    INIT:        STAGE.HOME,
  },
  [STAGE.HOME]: {
    PLAY:        STAGE.RECIPE_SELECT,
    SETTINGS:    STAGE.SETTINGS,
  },
  [STAGE.RECIPE_SELECT]: {
    SELECT:      STAGE.GATHER,
    BACK:        STAGE.HOME,
    SETTINGS:    STAGE.SETTINGS,
  },
  [STAGE.GATHER]: {
    COMPLETE:    STAGE.COUNT,
    REST:        STAGE.REST_NUDGE,    // only between stages
    SETTINGS:    STAGE.SETTINGS,
  },
  [STAGE.COUNT]: {
    COMPLETE:    STAGE.MIX,
    REST:        STAGE.REST_NUDGE,
    SETTINGS:    STAGE.SETTINGS,
  },
  [STAGE.MIX]: {
    COMPLETE:    STAGE.OVEN,
    REST:        STAGE.REST_NUDGE,
    SETTINGS:    STAGE.SETTINGS,
  },
  [STAGE.OVEN]: {
    COMPLETE:    STAGE.DECORATE,
    REST:        STAGE.REST_NUDGE,
    SETTINGS:    STAGE.SETTINGS,
  },
  [STAGE.DECORATE]: {
    COMPLETE:    STAGE.CELEBRATE,
    REST:        STAGE.REST_NUDGE,
    SETTINGS:    STAGE.SETTINGS,
  },
  [STAGE.CELEBRATE]: {
    PLAY_AGAIN:  STAGE.RECIPE_SELECT,
    HOME:        STAGE.HOME,
    SETTINGS:    STAGE.SETTINGS,
  },
  [STAGE.REST_NUDGE]: {
    // Resume goes back to whatever stage triggered the rest
    // This is handled by the engine (resume = pop last stage)
    RESUME:      null,   // dynamic: engine fills in the previous stage
    HOME:        STAGE.HOME,
  },
  [STAGE.SETTINGS]: {
    BACK:        null,   // dynamic: return to previous stage
    HOME:        STAGE.HOME,
    RESET:       STAGE.HOME,
  },
}

// ─── State Machine Factory ────────────────────────────────────────────────────

/**
 * Creates a game state machine instance.
 *
 * @returns {object} State machine API
 */
export function createGameStateMachine() {
  let currentState   = STAGE.IDLE
  let previousState  = null
  let selectedRecipe = null
  let completedStages = []

  return {
    /**
     * Get current state.
     */
    getState() {
      return currentState
    },

    /**
     * Get previous state (for back/resume transitions).
     */
    getPreviousState() {
      return previousState
    },

    /**
     * Get the currently selected recipe ID.
     */
    getRecipe() {
      return selectedRecipe
    },

    /**
     * Get list of completed stages in this session.
     */
    getCompletedStages() {
      return [...completedStages]
    },

    /**
     * Check if an action is valid from current state.
     */
    can(action) {
      const transitions = TRANSITIONS[currentState]
      return transitions ? action in transitions : false
    },

    /**
     * Transition to a new state via an action.
     *
     * @param {string} action - the action to perform (e.g. 'COMPLETE', 'PLAY')
     * @param {object} payload - optional data (e.g. { recipeId } for SELECT)
     * @returns {{ success: boolean, from: string, to: string, error?: string }}
     */
    dispatch(action, payload = {}) {
      const transitions = TRANSITIONS[currentState]

      if (!transitions) {
        return {
          success: false,
          from: currentState,
          to: null,
          error: `No transitions defined for state: ${currentState}`,
        }
      }

      if (!(action in transitions)) {
        return {
          success: false,
          from: currentState,
          to: null,
          error: `Action '${action}' not valid from state '${currentState}'`,
        }
      }

      let nextState = transitions[action]

      // Handle dynamic transitions
      if (nextState === null) {
        if (action === 'RESUME' || action === 'BACK') {
          nextState = previousState || STAGE.HOME
        }
      }

      if (!nextState) {
        return {
          success: false,
          from: currentState,
          to: null,
          error: `Could not resolve next state for action: ${action}`,
        }
      }

      // Handle recipe selection
      if (action === 'SELECT' && payload.recipeId) {
        selectedRecipe = payload.recipeId
        completedStages = []  // reset for new recipe session
      }

      // Track completed stages
      if (action === 'COMPLETE' && STAGE_FLOW.includes(currentState)) {
        if (!completedStages.includes(currentState)) {
          completedStages.push(currentState)
        }
      }

      previousState = currentState
      currentState  = nextState

      return {
        success: true,
        from:    previousState,
        to:      currentState,
        payload,
      }
    },

    /**
     * Get the index of the current stage in the flow (0-based).
     * Returns -1 if not in the main stage flow.
     */
    getStageIndex() {
      return STAGE_FLOW.indexOf(currentState)
    },

    /**
     * Get total stages count (for progress display).
     */
    getTotalStages() {
      return STAGE_FLOW.length
    },

    /**
     * Reset to initial state.
     */
    reset() {
      currentState    = STAGE.IDLE
      previousState   = null
      selectedRecipe  = null
      completedStages = []
    },
  }
}
