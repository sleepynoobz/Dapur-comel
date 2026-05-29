/**
 * pizza.js
 *
 * Topping-heavy interaction — the most tactile recipe.
 * Toddler rhythm: flatten dough → spread sauce → add cheese → toppings → bake → slice → feed.
 * The hero interactions: flattening dough (press/hold) and loading toppings (drag-heavy).
 * Slice at the end is a satisfying single swipe before feeding Oyen.
 *
 * Pacing intent:
 *   Flatten = satisfying press + squish feedback.
 *   Spread sauce = sweeping drag — different muscle memory from stir.
 *   Toppings = most toppings of any recipe (4 required).
 *   Slice = one clean swipe across pizza = instant gratification.
 */

import { STEP } from '../../utils/constants.js'

export const pizzaRecipe = {
  id:          'pizza',
  name:        'Pizza',
  emoji:       '🍕',
  color:       '#FF6B35',
  bgGradient:  'linear-gradient(175deg, #FFF8F0, #FFE8D0)',
  thumbnail:   '/assets/images/recipes/pizza-thumb.webp',

  steps: [
    {
      type:         STEP.FLATTEN_DOUGH,
      label:        'Tepek Doh',
      emoji:        '🫓',
      gesture:      'press',        // press + drag outward to spread dough
      sfx:          'squish',
      oyenReact:    'happy',
      durationHint: 3000,
    },
    {
      type:         STEP.SPREAD_SAUCE,
      label:        'Sapu Sos Tomato',
      emoji:        '🍅',
      gesture:      'swipe',        // circular swipe across pizza base
      sfx:          'pour',
      oyenReact:    'happy',
      durationHint: 3000,
    },
    {
      type:         STEP.ADD_TOPPINGS,
      label:        'Tambah Keju',
      emoji:        '🧀',
      gesture:      'drag',         // drag cheese onto pizza
      sfx:          'sparkle',
      oyenReact:    'excited',
      durationHint: 2500,
      toppings: [
        { id: 'keju',     emoji: '🧀', label: 'Keju'    },
        { id: 'cendawan', emoji: '🍄', label: 'Cendawan'},
        { id: 'lada',     emoji: '🫑', label: 'Lada'    },
        { id: 'tomato',   emoji: '🍅', label: 'Tomato'  },
        { id: 'olive',    emoji: '🫒', label: 'Olive'   },
      ],
      requiredCount: 3,             // need 3 of 5 toppings
    },
    {
      type:         STEP.BAKE,
      label:        'Bakar Pizza',
      emoji:        '🔥',
      gesture:      'tap',
      sfx:          'oven_ding',
      oyenReact:    'thinking',
      durationHint: 3500,
    },
    {
      type:         STEP.SLICE,
      label:        'Potong Pizza!',
      emoji:        '🔪',
      gesture:      'swipe',        // swipe across pizza = slice lines appear
      sfx:          'chop',
      oyenReact:    'surprised',
      durationHint: 2000,
      sliceCount:   4,              // 4 swipes = 8 slices
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
