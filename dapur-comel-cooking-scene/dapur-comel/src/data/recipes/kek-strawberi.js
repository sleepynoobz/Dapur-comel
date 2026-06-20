/**
 * kek-strawberi.js
 *
 * Single source of truth for Kek Strawberi recipe data.
 * All gameplay stages read from this config — zero hardcoded values in stage components.
 *
 * Ingredients and stage configs are level-gated:
 *   Level 1 → simplified (3 ingredients, 2 circles, etc.)
 *   Level 2 → standard
 *   Level 3 → extended
 */

import { STAGE, LEVEL } from '../../utils/constants.js'

// ── Master ingredient list ────────────────────────────────────────────────────
// emoji = placeholder until illustrated assets arrive
export const KEK_INGREDIENTS = [
  { id: 'tepung',       name: 'Tepung',        emoji: '🌾', bg: '#F5E6C8', unit: 'cawan'      },
  { id: 'gula',         name: 'Gula',           emoji: '🍬', bg: '#FFF5CC', unit: 'cawan'      },
  { id: 'telur',        name: 'Telur',          emoji: '🥚', bg: '#FFF8E7', unit: 'biji'       },
  { id: 'susu',         name: 'Susu',           emoji: '🥛', bg: '#EFF8FF', unit: 'cawan'      },
  { id: 'butter',       name: 'Butter',         emoji: '🧈', bg: '#FFF3CC', unit: 'sudu besar' },
  { id: 'bakingPowder', name: 'Baking Powder',  emoji: '🥄', bg: '#F0F0F0', unit: 'sudu kecil' },
]

// ── Distractors (wrong items shown in grid) ───────────────────────────────────
export const KEK_DISTRACTORS = [
  { id: 'pisang',  name: 'Pisang',  emoji: '🍌', bg: '#FFF9C4' },
  { id: 'epal',    name: 'Epal',    emoji: '🍎', bg: '#FFE8E8' },
  { id: 'keju',    name: 'Keju',    emoji: '🧀', bg: '#FFF5CC' },
  { id: 'tomato',  name: 'Tomato',  emoji: '🍅', bg: '#FFE5E5' },
  { id: 'lobak',   name: 'Lobak',   emoji: '🥕', bg: '#FFE8CC' },
  { id: 'lemon',   name: 'Lemon',   emoji: '🍋', bg: '#FFFDE0' },
  { id: 'bawang',  name: 'Bawang',  emoji: '🧅', bg: '#FFF3E0' },
]

// ── Toppings ──────────────────────────────────────────────────────────────────
export const KEK_TOPPINGS = [
  { id: 'krim',      name: 'Krim',      emoji: '🍦', bg: '#F8F8F8', dropLabel: 'Letak krim dulu!' },
  { id: 'strawberi', name: 'Strawberi', emoji: '🍓', bg: '#FFE0E8', dropLabel: 'Hias dengan strawberi!' },
  { id: 'taburan',   name: 'Taburan',   emoji: '✨', bg: '#FFF9E0', dropLabel: 'Taburkan sikit!' },
]

// ── Recipe definition ─────────────────────────────────────────────────────────
export const kekStrawberi = {
  id:          'kek-strawberi',
  name:        'Kek Strawberi',
  emoji:       '🍰',
  description: 'Kek gebu dengan krim dan strawberi segar!',
  accentColor: '#E8527A',
  unlocked:    true,

  ingredients: KEK_INGREDIENTS,
  toppings:    KEK_TOPPINGS,
  distractors: KEK_DISTRACTORS,

  stages: [
    // ── 1: Gather ─────────────────────────────────────────────────────
    {
      type: STAGE.GATHER,
      // Which ingredient IDs to find, by level
      ingredientsByLevel: {
        [LEVEL.ONE]:   ['tepung', 'telur', 'susu'],
        [LEVEL.TWO]:   ['tepung', 'gula', 'telur', 'susu', 'butter'],
        [LEVEL.THREE]: ['tepung', 'gula', 'telur', 'susu', 'butter', 'bakingPowder'],
      },
      distractorCount:  3,   // wrong items shown alongside target
      hintAfterSeconds: 6,   // seconds of inactivity before hint pulse
    },

    // ── 2: Count ──────────────────────────────────────────────────────
    {
      type: STAGE.COUNT,
      countByLevel: {
        [LEVEL.ONE]:   { ingredientId: 'telur', quantity: 2 },
        [LEVEL.TWO]:   { ingredientId: 'telur', quantity: 2 },
        [LEVEL.THREE]: { ingredientId: 'telur', quantity: 3 },
      },
    },

    // ── 3: Mix ────────────────────────────────────────────────────────
    {
      type: STAGE.MIX,
      circlesByLevel: {
        [LEVEL.ONE]:   2,
        [LEVEL.TWO]:   3,
        [LEVEL.THREE]: 4,
      },
      hintAfterSeconds: 5,
    },

    // ── 4: Oven ───────────────────────────────────────────────────────
    {
      type:             STAGE.OVEN,
      bakingDurationMs: 4000,
    },

    // ── 5: Decorate ───────────────────────────────────────────────────
    {
      type: STAGE.DECORATE,
      toppingsByLevel: {
        [LEVEL.ONE]:   ['krim', 'strawberi'],
        [LEVEL.TWO]:   ['krim', 'strawberi', 'taburan'],
        [LEVEL.THREE]: ['krim', 'strawberi', 'taburan'],
      },
      dropRadiusPx: 80,   // forgiving drop zone radius
    },

    // ── 6: Celebrate ──────────────────────────────────────────────────
    {
      type:          STAGE.CELEBRATE,
      stickerReward: 'sticker-kek-strawberi',
      starsAwarded:  3,
    },
  ],
}
