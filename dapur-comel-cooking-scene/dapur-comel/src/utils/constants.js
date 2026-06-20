// ─── App Identity ─────────────────────────────────────────────────────────────
export const APP_NAME    = 'Dapur Comel'
export const APP_VERSION = '0.2.0'

// ─── Storage Keys ─────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  PROGRESS: 'dapur-comel:progress',
  SETTINGS: 'dapur-comel:settings',
  SESSION:  'dapur-comel:session',
}

// ─── Game Stages ──────────────────────────────────────────────────────────────
// COOKING + FEED_OYEN are the new cooking-loop states.
// Legacy stage names (GATHER…DECORATE) kept so existing stage files
// don't break during the phased refactor — they'll be removed in Pass 3.
export const STAGE = {
  // ── Meta states (unchanged) ───────────────────────────────────────────────
  IDLE:          'IDLE',
  HOME:          'HOME',
  RECIPE_SELECT: 'RECIPE_SELECT',
  REST_NUDGE:    'REST_NUDGE',
  SETTINGS:      'SETTINGS',
  CELEBRATE:     'CELEBRATE',

  // ── New cooking-loop states ───────────────────────────────────────────────
  COOKING:       'COOKING',    // drives recipe.steps[stepIndex] component
  FEED_OYEN:     'FEED_OYEN',  // final interaction — child feeds Oyen

  // ── Legacy stage names (Pass 3 will remove these) ────────────────────────
  // Still referenced by existing stage components and GameScreen during transition.
  GATHER:   'GATHER',
  COUNT:    'COUNT',
  MIX:      'MIX',
  OVEN:     'OVEN',
  DECORATE: 'DECORATE',
}

// STAGE_FLOW removed — step sequence is now owned by each recipe's steps[].
// ProgressDots now receives totalSteps from the active recipe directly.

// ─── Step Types ───────────────────────────────────────────────────────────────
// Canonical identifiers used in recipe.steps[].type.
// GameScreen maps these to React components (Pass 3).
export const STEP = {
  // Egg interactions
  CRACK_EGG:     'CRACK_EGG',

  // Liquid / dry ingredient actions
  POUR:          'POUR',

  // Mixing
  STIR:          'STIR',

  // Pan cooking
  FRY:           'FRY',
  FLIP:          'FLIP',

  // Oven
  BAKE:          'BAKE',

  // Dough / base
  FLATTEN_DOUGH: 'FLATTEN_DOUGH',

  // Sauce / spread
  SPREAD_SAUCE:  'SPREAD_SAUCE',

  // Toppings / assembly
  ADD_TOPPINGS:  'ADD_TOPPINGS',
  STACK:         'STACK',

  // Finishing
  DECORATE:      'DECORATE',
  SLICE:         'SLICE',

  // Final
  FEED_OYEN:     'FEED_OYEN',
}

// ─── Recipe IDs ───────────────────────────────────────────────────────────────
export const RECIPE_ID = {
  PANCAKE: 'pancake',
  CAKE:    'cake',
  PIZZA:   'pizza',
  BURGER:  'burger',
}

// ─── Mascot Expressions ───────────────────────────────────────────────────────
export const OYEN_EXPRESSION = {
  IDLE:        'idle',
  HAPPY:       'happy',
  EXCITED:     'excited',
  CHEEKY:      'cheeky',
  THINKING:    'thinking',
  PROUD:       'proud',
  SURPRISED:   'surprised',
  ENCOURAGING: 'encouraging',
  SLEEPY:      'sleepy',
  TALKING:     'talking',
}

// ─── Voice / TTS ──────────────────────────────────────────────────────────────
// Kept for optional use — not used as primary UX in new gameplay.
export const TTS_CONFIG = {
  LANG_PRIORITY: ['ms-MY', 'ms', 'en-US'],
  RATE:          0.82,
  PITCH:         1.15,
  VOLUME:        1.0,
  QUEUE_GAP:     200,
}

// ─── Rest Timer ───────────────────────────────────────────────────────────────
export const REST_CONFIG = {
  MINUTES:              15,
  AUTO_DISMISS_SECONDS: 30,
}

// ─── Parent Gate ──────────────────────────────────────────────────────────────
export const PARENT_GATE = {
  HOLD_DURATION_MS: 3000,
  POSITION:         'top-right',
}

// ─── Touch & Drag ─────────────────────────────────────────────────────────────
export const TOUCH_CONFIG = {
  DRAG_THRESHOLD:  8,
  DROP_RADIUS:     60,
  SNAP_DURATION:   250,
  REJECT_DURATION: 350,
}

// ─── Stirring Mechanic ────────────────────────────────────────────────────────
export const STIR_CONFIG = {
  MIN_SPEED:       2,
  CIRCLES_REQUIRED:3,
  ANGLE_TOLERANCE: 45,
}

// ─── Celebration ──────────────────────────────────────────────────────────────
export const CELEBRATION = {
  CONFETTI_COUNT:  60,
  AUTO_ADVANCE_MS: 3500,
}

// ─── Colours ──────────────────────────────────────────────────────────────────
export const COLORS = {
  PRIMARY:    '#FF8C5A',
  BACKGROUND: '#FFF8EC',
  BERRY:      '#E8527A',
  MINT:       '#5EC4B6',
  SUNNY:      '#FFD700',
  INK:        '#3D2B1F',
}


// ─── Legacy: Difficulty Levels ───────────────────────────────────────────────
// Used by old stage files (GatherStage, CountStage etc.) and kek-strawberi.js.
// These files are inactive in the new cooking-loop flow but kept during
// the Pass 2→3 transition to avoid import errors.
// Will be removed in Pass 3 when all stage files are replaced.
export const LEVEL = {
  ONE:   1,
  TWO:   2,
  THREE: 3,
}

// ─── Z-Index Stack ────────────────────────────────────────────────────────────
export const Z = {
  BASE:        0,
  STAGE:       10,
  HUD:         20,
  DRAG_ITEM:   50,
  MASCOT:      30,
  OVERLAY:     100,
  PARENT_GATE: 200,
  TOAST:       300,
}
