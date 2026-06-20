import { STEP } from '../../utils/constants.js'

export const pancakeRecipe = {
  id:         'pancake',
  name:       'Pancake',
  emoji:      '🥞',
  color:      '#FFB347',
  accentColor:'#E8840A',
  bgGradient: 'linear-gradient(175deg, #FFF9F0, #FFE8CC)',

  // Educational metadata for 2-3 year olds
  learn: {
    color:      { name: 'Kuning', hex: '#FFD700', emoji: '🟡' },
    shape:      { name: 'Bulatan', emoji: '⭕' },
    number:     3,
    numberWord: 'Tiga',
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
      encouragement:'Pandai! Telur dah pecah! 🌟',
    },
    {
      type:         STEP.POUR,
      label:        'Tuang Susu!',
      emoji:        '🥛',
      gesture:      'tap',
      sfx:          'pour',
      oyenReact:    'happy',
      durationHint: 2000,
      learn:        { word: 'Susu', color: 'Putih', colorHex: '#FFFFFF', emoji: '🥛' },
      encouragement:'Bagus! Susu dah tuang! 🌟',
    },
    {
      type:         STEP.FRY,
      label:        'Goreng Pancake!',
      emoji:        '🍳',
      gesture:      'tap',
      sfx:          'sizzle',
      oyenReact:    'excited',
      durationHint: 2500,
      learn:        { word: 'Bulatan', shape: 'circle', emoji: '⭕' },
      encouragement:'Syabas! Pancake dah masak! 🥞',
    },
  ],
}
