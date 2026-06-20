import { STEP } from '../../utils/constants.js'

export const burgerRecipe = {
  id:         'burger',
  name:       'Burger',
  emoji:      '🍔',
  color:      '#C4521E',
  accentColor:'#8B2800',
  bgGradient: 'linear-gradient(175deg, #FFF8EC, #FFE4C0)',

  learn: {
    color:      { name: 'Perang', hex: '#8B4513', emoji: '🟫' },
    shape:      { name: 'Bulatan', emoji: '⭕' },
    number:     2,
    numberWord: 'Dua',
  },

  steps: [
    {
      type:         STEP.FRY,
      label:        'Goreng Daging!',
      emoji:        '🥩',
      gesture:      'tap',
      sfx:          'sizzle',
      oyenReact:    'thinking',
      durationHint: 2500,
      learn:        { word: 'Panas', color: 'Perang', colorHex: '#8B4513', emoji: '🟫' },
      encouragement:'Wah! Daging dah masak! 🥩',
    },
    {
      type:         STEP.STACK,
      label:        'Susun Burger!',
      emoji:        '🍔',
      gesture:      'tap',
      sfx:          'pop',
      oyenReact:    'excited',
      durationHint: 3000,
      learn:        { word: 'Dua', number: 2, emoji: '2️⃣' },
      encouragement:'Syabas! Burger dah siap! 🍔',
      toppings: [
        { id: 'bun',     emoji: '🫓', label: 'Roti' },
        { id: 'lettuce', emoji: '🥬', label: 'Salad' },
        { id: 'tomato',  emoji: '🍅', label: 'Tomato' },
        { id: 'cheese',  emoji: '🧀', label: 'Keju' },
      ],
      requiredCount: 4,
    },
    {
      type:         STEP.DECORATE,
      label:        'Hiaskan Burger!',
      emoji:        '🌟',
      gesture:      'tap',
      sfx:          'sparkle',
      oyenReact:    'happy',
      durationHint: 2000,
      toppings: [
        { id: 'ketchup', emoji: '🟥', label: 'Sos Merah', color: 'Merah',  colorHex: '#FF4500' },
        { id: 'mustard', emoji: '🟡', label: 'Mustard',   color: 'Kuning', colorHex: '#FFD700' },
      ],
      requiredCount: 1,
      learn:        { word: 'Merah', color: 'Merah', colorHex: '#FF4500', emoji: '🔴' },
      encouragement:'Cantik! Burger siap dihias! ✨',
    },
  ],
}
