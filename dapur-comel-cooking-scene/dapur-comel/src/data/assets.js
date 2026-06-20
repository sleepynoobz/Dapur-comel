/**
 * assets.js — open source game sprite manifest
 *
 * Sources (all open source):
 *   - OpenMoji (CC-BY-SA 4.0) — colour food, cat faces, some utensils
 *     https://openmoji.org  /  https://github.com/hfg-gmuend/openmoji
 *   - game-icons.net (CC-BY 3.0) — kitchen tool silhouettes
 *     https://game-icons.net  /  https://github.com/game-icons/icons
 *
 * Sprites live in /public/assets/game/{food,cat,tools}.
 */

const BASE = '/assets/game'

// OpenMoji full-colour sprites
export const FOOD = [
  'egg', 'milk', 'butter', 'wheat', 'tomato', 'cheese', 'mushroom', 'bread',
  'lettuce', 'meat', 'pancake', 'cake', 'birthday-cake', 'pizza', 'burger',
  'cookie', 'strawberry', 'chocolate', 'olive', 'salt', 'flatbread', 'honey',
  'sugar-cube', 'sparkles', 'star', 'fire', 'droplet', 'redheart', 'yellowheart',
]
export const CAT = [
  'idle', 'happy', 'excited', 'proud', 'cheeky',
  'surprised', 'encouraging', 'sleepy', 'thinking', 'joy',
]
export const COLOR_TOOLS = ['bowl', 'cup', 'knife', 'pan', 'plate', 'spoon']

// game-icons silhouettes (recoloured via CSS mask — need a tint colour)
export const SILHOUETTE_TOOLS = [
  'chef-toque', 'cooking-glove', 'cooking-pot', 'flour',
  'gas-stove', 'hot-meal', 'knife-blade', 'oven', 'whisk',
]

export const foodSrc = (name) => `${BASE}/food/${name}.svg`
export const catSrc  = (name) => `${BASE}/cat/${name}.svg`
export const toolSrc = (name) => `${BASE}/tools/${name}.svg`

/**
 * Resolve a logical sprite name to its source path.
 * Returns { src, tint } where tint=true means the sprite is a single-colour
 * silhouette that should be rendered via CSS mask so the app can colour it.
 */
export function spriteSrc(name) {
  if (!name) return null
  if (FOOD.includes(name))             return { src: foodSrc(name), tint: false }
  if (COLOR_TOOLS.includes(name))      return { src: toolSrc(name), tint: false }
  if (CAT.includes(name))              return { src: catSrc(name),  tint: false }
  if (SILHOUETTE_TOOLS.includes(name)) return { src: toolSrc(name), tint: true  }
  return null
}

// Map the emoji already used across the game to a sprite name, so components
// can switch to real art with a one-line change and fall back to the emoji
// for anything without a dedicated sprite.
export const EMOJI_SPRITE = {
  '🥚': 'egg',        '🥛': 'milk',       '🧈': 'butter',     '🌾': 'wheat',
  '🍅': 'tomato',     '🧀': 'cheese',     '🍄': 'mushroom',   '🍞': 'bread',
  '🥬': 'lettuce',    '🥩': 'meat',       '🥞': 'pancake',    '🍰': 'cake',
  '🎂': 'birthday-cake', '🍕': 'pizza',   '🍔': 'burger',     '🍪': 'cookie',
  '🍓': 'strawberry', '🍫': 'chocolate',  '🫒': 'olive',      '🧂': 'salt',
  '🫓': 'flatbread',  '🍯': 'honey',      '✨': 'sparkles',   '⭐': 'star',
  '🌟': 'star',       '🔥': 'fire',       '💧': 'droplet',    '❤️': 'redheart',
  '💛': 'yellowheart','🥄': 'spoon',      '🍳': 'pan',        '🔪': 'knife',
}

export const emojiToSprite = (emoji) => EMOJI_SPRITE[emoji] ?? null

// Oyen expression (constants.js OYEN_EXPRESSION value) → cat face sprite.
export const OYEN_FACE = {
  idle:        'idle',
  happy:       'happy',
  excited:     'excited',
  cheeky:      'cheeky',
  thinking:    'thinking',
  proud:       'proud',
  surprised:   'surprised',
  encouraging: 'encouraging',
  sleepy:      'sleepy',
  talking:     'happy',
}
