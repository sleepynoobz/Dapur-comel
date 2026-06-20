import { STEP } from '../../utils/constants.js'

export const cakeRecipe = {
  id:         'cake',
  name:       'Kek',
  emoji:      '🎂',
  color:      '#E8527A',
  accentColor:'#C02858',
  bgGradient: 'linear-gradient(175deg, #FFF0F4, #FFD8E8)',

  learn: {
    color:      { name: 'Merah Jambu', hex: '#FF69B4', emoji: '🩷' },
    shape:      { name: 'Bulatan', emoji: '⭕' },
    number:     2,
    numberWord: 'Dua',
  },

  steps: [
    {
      type:         STEP.CRACK_EGG,
      label:        'Pecah Telur!',
      emoji:        '🥚',
      gesture:      'tap',
      sfx:          'crack',
      oyenReact:    'surprised',
      durationHint: 2000,
      learn:        { word: 'Telur', color: 'Kuning', colorHex: '#FFD700', emoji: '🥚' },
      encouragement:'Pandai! Telur pecah! 💛',
    },
    {
      type:         STEP.STIR,
      label:        'Kacau Adunan!',
      emoji:        '🥄',
      gesture:      'tap',
      sfx:          'stir',
      oyenReact:    'excited',
      durationHint: 3000,
      learn:        { word: 'Kacau', action: 'putar', emoji: '🌀' },
      encouragement:'Hebat! Adunan dah siap! 🌀',
    },
    {
      type:         STEP.BAKE,
      label:        'Bakar dalam Oven!',
      emoji:        '🎂',
      gesture:      'tap',
      sfx:          'oven',
      oyenReact:    'thinking',
      durationHint: 3000,
      learn:        { word: 'Panas', color: 'Merah', colorHex: '#FF4500', emoji: '🔥' },
      encouragement:'Kek dah masak! 🎉',
    },
  ],
}
