/**
 * cake.js
 *
 * Baking + decorating payoff — the most rewarding visual arc.
 * Toddler rhythm: crack → pour → stir → bake (anticipation) → decorate → candles → feed.
 * The oven wait is SHORT (3s with animation) then BIG payoff: full decoration.
 *
 * Pacing intent:
 *   More steps than pancake but bake creates natural "wait + reveal" drama.
 *   Decoration is the hero — multiple toppings, sparkles.
 *   Candles step is a bonus micro-interaction before feeding Oyen.
 */

import { STEP } from '../../utils/constants.js'

export const cakeRecipe = {
  id:          'cake',
  name:        'Kek',
  emoji:       '🎂',
  color:       '#E8527A',
  bgGradient:  'linear-gradient(175deg, #FFF0F4, #FFE0EC)',
  thumbnail:   '/assets/images/recipes/cake-thumb.webp',

  steps: [
    {
      type:         STEP.CRACK_EGG,
      label:        'Pecah Telur',
      emoji:        '🥚',
      gesture:      'tap',
      sfx:          'crack',
      oyenReact:    'surprised',
      durationHint: 2000,
    },
    {
      type:         STEP.POUR,
      label:        'Tuang Tepung',
      emoji:        '🌾',
      gesture:      'tilt',
      sfx:          'pour',
      oyenReact:    'happy',
      durationHint: 2500,
    },
    {
      type:         STEP.POUR,
      label:        'Tuang Susu',
      emoji:        '🥛',
      gesture:      'tilt',
      sfx:          'pour',
      oyenReact:    'happy',
      durationHint: 2000,
    },
    {
      type:         STEP.STIR,
      label:        'Kacau Rata',
      emoji:        '🥄',
      gesture:      'stir',
      sfx:          'stir',
      oyenReact:    'excited',
      durationHint: 4000,
    },
    {
      type:         STEP.BAKE,
      label:        'Bakar dalam Oven',
      emoji:        '🔥',
      gesture:      'tap',          // tap oven door to put cake in
      sfx:          'oven_ding',
      oyenReact:    'thinking',
      durationHint: 3500,           // oven animation plays, then ding
    },
    {
      type:         STEP.DECORATE,
      label:        'Hias Kek',
      emoji:        '🎨',
      gesture:      'drag',
      sfx:          'sparkle',
      oyenReact:    'excited',
      durationHint: 5000,           // more toppings = longer but satisfying
      toppings: [
        { id: 'krim',      emoji: '🤍', label: 'Krim'      },
        { id: 'strawberi', emoji: '🍓', label: 'Strawberi' },
        { id: 'coklat',    emoji: '🍫', label: 'Coklat'    },
        { id: 'taburan',   emoji: '✨', label: 'Taburan'   },
      ],
      requiredCount: 3,
    },
    {
      type:         STEP.FEED_OYEN,
      label:        'Bagi Oyen Makan!',
      emoji:        '😸',
      gesture:      'drag',
      sfx:          'munch',
      oyenReact:    'excited',
      durationHint: 2500,
    },
  ],
}
