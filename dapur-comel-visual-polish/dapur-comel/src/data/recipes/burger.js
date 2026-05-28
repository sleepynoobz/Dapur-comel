/**
 * burger.js
 *
 * Stacking satisfaction — the most spatially gratifying recipe.
 * Toddler rhythm: fry patty → flip → add cheese → stack bun → add veg → feed.
 * The hero interaction: stacking layers. Each layer snaps onto the burger — visual delight.
 *
 * Pacing intent:
 *   No oven — all pan interactions = immediate feedback.
 *   Flip is the same hero moment as pancake but with more weight (thick patty).
 *   Stacking is unique: one tap per ingredient = instant layer appears.
 *   Shortest recipe by feel — every interaction is immediate.
 */

import { STEP } from '../../utils/constants.js'

export const burgerRecipe = {
  id:          'burger',
  name:        'Burger',
  emoji:       '🍔',
  color:       '#C4521E',
  bgGradient:  'linear-gradient(175deg, #FFF8EC, #FFE8CC)',
  thumbnail:   '/assets/images/recipes/burger-thumb.webp',

  steps: [
    {
      type:         STEP.FRY,
      label:        'Goreng Daging',
      emoji:        '🥩',
      gesture:      'tap',          // tap pan → patty appears, sizzle begins
      sfx:          'sizzle',
      oyenReact:    'thinking',
      durationHint: 3000,
    },
    {
      type:         STEP.FLIP,
      label:        'Balik Daging!',
      emoji:        '🍖',
      gesture:      'swipe_up',
      sfx:          'flip',
      oyenReact:    'surprised',
      durationHint: 1500,
    },
    {
      type:         STEP.STACK,
      label:        'Susun Burger',
      emoji:        '🍔',
      gesture:      'tap',          // tap each ingredient = snaps onto stack
      sfx:          'sparkle',
      oyenReact:    'excited',
      durationHint: 4500,
      // Each layer tapped in order — tap advances through the list
      layers: [
        { id: 'bun_bottom', emoji: '🟤', label: 'Roti Bawah'  },
        { id: 'patty',      emoji: '🥩', label: 'Daging'      },
        { id: 'keju',       emoji: '🧀', label: 'Keju'        },
        { id: 'salad',      emoji: '🥬', label: 'Salad'       },
        { id: 'tomato',     emoji: '🍅', label: 'Tomato'      },
        { id: 'bun_top',    emoji: '🟤', label: 'Roti Atas'   },
      ],
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
