/**
 * recipeRunner.js
 *
 * Pure helper that extracts level-appropriate config from a recipe stage.
 * Stage components call this to get their working data without branching logic.
 *
 * Keeps stage components clean — they receive ready-to-use values,
 * not raw level-branching config objects.
 */

import { LEVEL } from '../utils/constants.js'
import { KEK_INGREDIENTS, KEK_TOPPINGS, KEK_DISTRACTORS } from '../data/recipes/kek-strawberi.js'

/**
 * Resolve level-keyed value with graceful fallback to LEVEL.ONE.
 *
 * @param {object} byLevel  - e.g. { 1: [...], 2: [...], 3: [...] }
 * @param {number} level    - current player level (1–3)
 * @returns {*} resolved value
 */
export function resolveLevel(byLevel, level) {
  return byLevel?.[level] ?? byLevel?.[LEVEL.ONE] ?? null
}

/**
 * Get gather stage working data for a recipe at the given level.
 *
 * @param {object} recipe
 * @param {object} stageConfig  - from recipe.stages[n]
 * @param {number} level
 * @returns {{ targets: object[], distractors: object[], hintAfterSeconds: number }}
 */
export function getGatherConfig(recipe, stageConfig, level) {
  const ingredientIds = resolveLevel(stageConfig.ingredientsByLevel, level) ?? []
  const allIngredients = recipe.ingredients ?? KEK_INGREDIENTS
  const allDistractors = recipe.distractors ?? KEK_DISTRACTORS

  const targets = ingredientIds
    .map(id => allIngredients.find(i => i.id === id))
    .filter(Boolean)

  // Distractors must not include any target ingredient
  const targetIds = new Set(ingredientIds)
  const distPool  = allDistractors.filter(d => !targetIds.has(d.id))

  return {
    targets,
    distractorPool:   distPool,
    distractorCount:  stageConfig.distractorCount ?? 3,
    hintAfterSeconds: stageConfig.hintAfterSeconds ?? 6,
  }
}

/**
 * Get count stage config for a recipe at the given level.
 *
 * @returns {{ ingredient: object, quantity: number }}
 */
export function getCountConfig(recipe, stageConfig, level) {
  const cfg = resolveLevel(stageConfig.countByLevel, level)
  const allIngredients = recipe.ingredients ?? KEK_INGREDIENTS
  const ingredient = allIngredients.find(i => i.id === cfg?.ingredientId) ?? allIngredients[0]

  return {
    ingredient,
    quantity: cfg?.quantity ?? 2,
  }
}

/**
 * Get mix stage config.
 *
 * @returns {{ circlesRequired: number, hintAfterSeconds: number }}
 */
export function getMixConfig(stageConfig, level) {
  return {
    circlesRequired:  resolveLevel(stageConfig.circlesByLevel, level) ?? 3,
    hintAfterSeconds: stageConfig.hintAfterSeconds ?? 5,
  }
}

/**
 * Get decorate stage toppings for a recipe at the given level.
 *
 * @returns {{ toppings: object[], dropRadiusPx: number }}
 */
export function getDecorateConfig(recipe, stageConfig, level) {
  const toppingIds   = resolveLevel(stageConfig.toppingsByLevel, level) ?? []
  const allToppings  = recipe.toppings ?? KEK_TOPPINGS

  return {
    toppings:     toppingIds.map(id => allToppings.find(t => t.id === id)).filter(Boolean),
    dropRadiusPx: stageConfig.dropRadiusPx ?? 80,
  }
}

/**
 * Shuffle an array (Fisher-Yates). Pure, no side effects.
 */
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Pick N random items from array (no repeats).
 */
export function pickN(arr, n) {
  return shuffle(arr).slice(0, n)
}

/**
 * Pick one random item.
 */
export function pickOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
