/**
 * pancake.js
 *
 * Quick, playful frying flow — the fastest recipe.
 * Toddler rhythm: crack → pour → stir → pour into pan → fry → flip → decorate → feed.
 * Every step satisfies in 2–3 seconds. The flip is the hero moment.
 *
 * Pacing intent:
 *   Lots of short taps and one satisfying swipe (flip).
 *   No long waits — pan sizzles fast, flip is instant gratification.
 */

import { STEP } from '../../utils/constants.js'

export const pancakeRecipe = {
  id:          'pancake',
  name:        'Pancake',
  emoji:       '🥞',
  color:       '#FFB347',
  bgGradient:  'linear-gradient(175deg, #FFF9F0, #FFE8CC)',
  thumbnail:   '/assets/images/recipes/pancake-thumb.webp',  // Pass 4 asset

  steps: [
    {
      type:         STEP.CRACK_EGG,
      label:        'Pecah Telur',
      emoji:        '🥚',
      gesture:      'tap',          // tap egg twice → crack animation
      sfx:          'crack',
      oyenReact:    'surprised',
      durationHint: 2000,
    },
    {
      type:         STEP.POUR,
      label:        'Tuang Susu',
      emoji:        '🥛',
      gesture:      'tilt',         // tilt/drag carton downward → pour stream
      sfx:          'pour',
      oyenReact:    'happy',
      durationHint: 2500,
    },
    {
      type:         STEP.STIR,
      label:        'Kacau Adunan',
      emoji:        '🥄',
      gesture:      'stir',         // circular motion in bowl
      sfx:          'stir',
      oyenReact:    'excited',
      durationHint: 4000,           // slightly longer — stir needs a few circles
    },
    {
      type:         STEP.POUR,
      label:        'Tuang ke Kuali',
      emoji:        '🍳',
      gesture:      'tilt',         // tilt bowl toward pan
      sfx:          'pour',
      oyenReact:    'happy',
      durationHint: 2000,
    },
    {
      type:         STEP.FRY,
      label:        'Goreng Pancake',
      emoji:        '🔥',
      gesture:      'tap',          // tap stove once to start → auto-sizzle for 3s
      sfx:          'sizzle',
      oyenReact:    'thinking',
      durationHint: 3000,
    },
    {
      type:         STEP.FLIP,
      label:        'Balik Pancake!',
      emoji:        '🥞',
      gesture:      'swipe_up',     // hero moment: swipe up to flip
      sfx:          'flip',
      oyenReact:    'surprised',
      durationHint: 1500,
    },
    {
      type:         STEP.DECORATE,
      label:        'Hias Pancake',
      emoji:        '🍓',
      gesture:      'drag',         // drag toppings onto stack
      sfx:          'sparkle',
      oyenReact:    'excited',
      durationHint: 4000,
      // Toppings available for this recipe
      toppings: [
        { id: 'butter',   emoji: '🧈', label: 'Butter'   },
        { id: 'honey',    emoji: '🍯', label: 'Madu'     },
        { id: 'strawberi',emoji: '🍓', label: 'Strawberi'},
      ],
      requiredCount: 2,             // need at least 2 toppings to proceed
    },
    {
      type:         STEP.FEED_OYEN,
      label:        'Bagi Oyen Makan!',
      emoji:        '😸',
      gesture:      'drag',         // drag plate toward Oyen
      sfx:          'munch',
      oyenReact:    'excited',
      durationHint: 2500,
    },
  ],
}
