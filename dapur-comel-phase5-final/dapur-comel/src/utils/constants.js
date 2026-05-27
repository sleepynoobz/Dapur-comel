// ─── App Identity ─────────────────────────────────────────────────────────────
export const APP_NAME = 'Dapur Comel'
export const APP_VERSION = '0.1.0'

// ─── Storage Keys ─────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  PROGRESS: 'dapur-comel:progress',
  SETTINGS: 'dapur-comel:settings',
  SESSION:  'dapur-comel:session',
}

// ─── Game Stages ──────────────────────────────────────────────────────────────
// Order matters — this is the canonical flow
export const STAGE = {
  IDLE:           'IDLE',
  HOME:           'HOME',
  RECIPE_SELECT:  'RECIPE_SELECT',
  GATHER:         'GATHER',
  COUNT:          'COUNT',
  MIX:            'MIX',
  OVEN:           'OVEN',
  DECORATE:       'DECORATE',
  CELEBRATE:      'CELEBRATE',
  REST_NUDGE:     'REST_NUDGE',
  SETTINGS:       'SETTINGS',
}

// Ordered stage flow (excludes meta-stages)
export const STAGE_FLOW = [
  STAGE.GATHER,
  STAGE.COUNT,
  STAGE.MIX,
  STAGE.OVEN,
  STAGE.DECORATE,
  STAGE.CELEBRATE,
]

// ─── Difficulty Levels ────────────────────────────────────────────────────────
export const LEVEL = {
  ONE:   1,  // Simple tapping, 1–2 ingredients
  TWO:   2,  // Counting 1–3, 3 ingredients
  THREE: 3,  // More ingredients, more steps
}

// ─── Recipe IDs ───────────────────────────────────────────────────────────────
export const RECIPE_ID = {
  KEK_STRAWBERI: 'kek-strawberi',
  PANCAKE:       'pancake',
  BISKUT:        'biskut',
}

// ─── Mascot Expressions ───────────────────────────────────────────────────────
export const OYEN_EXPRESSION = {
  IDLE:        'idle',        // Default calm breathing
  HAPPY:       'happy',       // General positive
  EXCITED:     'excited',     // Celebration / big moment
  CHEEKY:      'cheeky',      // Recipe selection / playful
  THINKING:    'thinking',    // Waiting for child action
  PROUD:       'proud',       // After child succeeds
  SURPRISED:   'surprised',   // Correct answer surprise
  ENCOURAGING: 'encouraging', // Wrong tap gentle redirect
  SLEEPY:      'sleepy',      // Rest screen
  TALKING:     'talking',     // Active TTS narration
}

// ─── Voice / TTS ──────────────────────────────────────────────────────────────
export const TTS_CONFIG = {
  // Fallback priority chain (Architecture Revision #1)
  LANG_PRIORITY: ['ms-MY', 'ms', 'en-US'],
  RATE:          0.82,   // Slightly slower for toddlers
  PITCH:         1.15,   // Slightly higher = friendly female
  VOLUME:        1.0,
  // Min gap between utterances in queue (ms)
  QUEUE_GAP:     200,
}

// ─── Rest Timer ───────────────────────────────────────────────────────────────
export const REST_CONFIG = {
  // Trigger rest nudge after this many minutes (Architecture Revision #4)
  MINUTES:                15,
  // Only show at stage boundaries — enforced in game engine
  ONLY_BETWEEN_STAGES:    true,
  // Dismiss timeout (auto-dismiss after 30s so child can continue)
  AUTO_DISMISS_SECONDS:   30,
}

// ─── Parent Gate ──────────────────────────────────────────────────────────────
export const PARENT_GATE = {
  // Long press duration to unlock parent settings
  HOLD_DURATION_MS: 3000,
  // Corner position of the gate trigger
  POSITION:         'top-right',
}

// ─── Touch & Drag ─────────────────────────────────────────────────────────────
export const TOUCH_CONFIG = {
  // Minimum movement (px) before drag is initiated
  DRAG_THRESHOLD:     8,
  // Pixels from drop zone center to count as "dropped"
  DROP_RADIUS:        60,
  // Snap animation duration (ms)
  SNAP_DURATION:      250,
  // Spring back duration if miss (ms)
  REJECT_DURATION:    350,
}

// ─── Stirring Mechanic ────────────────────────────────────────────────────────
export const STIR_CONFIG = {
  // Minimum speed to count as "stirring" (px/frame)
  MIN_SPEED:          2,
  // Number of full circles needed to complete mixing
  CIRCLES_REQUIRED:   3,
  // Tolerance for circle detection (deviation in degrees)
  ANGLE_TOLERANCE:    45,
}

// ─── Celebration ──────────────────────────────────────────────────────────────
export const CELEBRATION = {
  // Confetti piece count
  CONFETTI_COUNT:     60,
  // Duration of celebration stage (ms) before showing "Masak Lagi!"
  AUTO_ADVANCE_MS:    4000,
  // Star award thresholds (future feature)
  STARS: {
    ONE:   true,    // Always get at least 1 star for completing
    TWO:   true,    // Get 2 for completing with hints
    THREE: true,    // Get 3 for completing without any hints
  },
}

// ─── Progress / Unlock ────────────────────────────────────────────────────────
export const UNLOCK_CONFIG = {
  // Recipes available from the start (no unlock needed)
  DEFAULT_UNLOCKED: [RECIPE_ID.KEK_STRAWBERI],
  // Recipes locked until parent unlocks (placeholder for MVP)
  LOCKED_RECIPES:   [RECIPE_ID.PANCAKE, RECIPE_ID.BISKUT],
}

// ─── Colours (mirror design tokens for JS use) ────────────────────────────────
export const COLORS = {
  PRIMARY:    '#FF8C5A',
  BACKGROUND: '#FFF8EC',
  BERRY:      '#E8527A',
  MINT:       '#5EC4B6',
  SUNNY:      '#FFD700',
  INK:        '#3D2B1F',
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
