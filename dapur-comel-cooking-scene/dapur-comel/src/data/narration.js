/**
 * narration.js
 *
 * Single source of truth for ALL voice narration strings.
 * Keys map directly to useVoice.speak(key) calls.
 * Arrays = pick randomly for variety, prevents repetition fatigue.
 *
 * Language: Bahasa Melayu (colloquial, warm, child-friendly)
 */

export const narration = {

  // ─── App-wide ───────────────────────────────────────────────────────────────
  app: {
    loading: 'Jom masak-masak dengan Oyen!',
  },

  // ─── Home Screen ────────────────────────────────────────────────────────────
  home: {
    welcome: [
      'Haa, Oyen dah tunggu! Jom kita masak hari ni!',
      'Selamat datang ke Dapur Comel! Oyen gembira kamu datang!',
      'Oyen lapar ni! Jom kita buat sesuatu yang sedap!',
    ],
    playPrompt: 'Tekan butang besar tu untuk mula!',
    returning: [
      'Eh, kamu dah balik! Oyen rindu tau!',
      'Yeay! Kawan Oyen dah datang!',
    ],
  },

  // ─── Recipe Selection ───────────────────────────────────────────────────────
  recipeSelect: {
    prompt: [
      'Nak buat apa hari ni? Pilih satu!',
      'Hmm, apa agaknya yang sedap? Tunjuk kat Oyen!',
      'Oyen nak makan! Pilih resepi kita hari ni!',
    ],
    kekStrawberi: [
      'Ooo, kek strawberi! Sedapnya!',
      'Kek strawberi! Warna merah cantik tu!',
    ],
    pancake: 'Pancake! Lembut dan gebu!',
    biskut: 'Biskut! Rangup rangup!',
    locked: [
      'Ini kena buka dulu! Habiskan kek dulu ya!',
      'Belum boleh lagi! Siapkan kek strawberi dulu!',
    ],
  },

  // ─── Gather Stage ───────────────────────────────────────────────────────────
  gather: {
    intro: [
      'Jom kita kumpul bahan-bahan dulu!',
      'Mana semua bahan kita? Jom cari!',
    ],
    findIngredient: {
      // Keyed by ingredient ID — used when prompting for specific ingredient
      tepung:     'Cuba cari tepung! Mana dia agaknya?',
      telur:      'Mana telur ya? Cuba tunjuk kat Oyen!',
      susu:       'Oyen nak susu! Mana susu tu?',
      butter:     'Butter mana? Cuba cari!',
      gula:       'Nak gula! Mana gula putih tu?',
      strawberi:  'Strawberi merah tu kat mana? Cantik tau!',
      krimputih:  'Krim putih tu mana? Gebu gebu!',
      vanilla:    'Vanilla extract! Harumnya! Mana dia?',
      bakingPowder: 'Baking powder tu! Kecik je tapi penting!',
    },
    correct: [
      'Pandainya! Betul tu!',
      'Wah, betul sekali! Hebat!',
      'Cayalah! Kamu memang bijak!',
      'Haah! Tu dia! Bagus!',
      'Oyen pun tahu tu! Betul!',
    ],
    wrong: [
      'Cuba lagi sayang 💛',
      'Hmm, yang tu bukan. Cuba tengok lagi!',
      'Tak pe, cuba sekali lagi ya!',
      'Dekat dah tu! Cuba lagi!',
    ],
    allGathered: [
      'Yeay! Semua bahan dah ada! Jom buat!',
      'Bagus! Semua dah kumpul! Boleh mula!',
    ],
  },

  // ─── Count Stage ────────────────────────────────────────────────────────────
  count: {
    intro: 'Sekarang kita kira sama-sama!',
    prompts: {
      1: 'Masukkan SATU biji. Cuba!',
      2: 'Masukkan DUA biji! Satu... dua!',
      3: 'Tiga! Satu, dua, tiga! Cuba kita kira!',
    },
    countAlong: {
      1: 'Satu!',
      2: 'Dua!',
      3: 'Tiga!',
    },
    correct: [
      'Pandai kira! Bagus!',
      'Betul! Kamu pandai matematik!',
      'Haah! Betul tu! Oyen pun suka kira!',
    ],
    tooMany: [
      'Eh, lebih dah tu! Oyen cakap berapa tadi?',
      'Banyak sangat! Cuba semak balik berapa kita nak!',
    ],
  },

  // ─── Mix Stage ──────────────────────────────────────────────────────────────
  mix: {
    intro: [
      'Jom kacau sama-sama! Pusing-pusing!',
      'Oyen suka bahagian ni! Kacau kacau kacau!',
    ],
    stirring: [
      'Pusing lagi! Lagi laju!',
      'Kacau kacau! Bagus!',
      'Lagi sikit! Hampir siap!',
    ],
    halfway: 'Separuh dah! Teruskan!',
    done: [
      'Wah, dah sebati! Cantiknya! Hebat!',
      'Siap! Oyen pun nak rasa! Tapi tunggu dulu ya!',
      'Wow! Kamu kacau dengan hebatnya!',
    ],
  },

  // ─── Oven Stage ─────────────────────────────────────────────────────────────
  oven: {
    intro: [
      'Sekarang masukkan dalam oven ya!',
      'Jom bakar! Tekan oven tu!',
    ],
    placing: [
      'Masuk... masuk... siap!',
      'Elok tu! Masuk dalam oven!',
    ],
    baking: [
      'Tunggu sekejap... baunya dah mula harumnya!',
      'Sabar ya sayang! Oven tengah masak!',
      'Hmm sedapnya! Tak sabar nak makan!',
    ],
    done: [
      'Ding! Siap dah! Bau sedap!',
      'Yeay! Masak dah! Cantiknya!',
      'Wah! Kek dah siap! Cantik betul!',
    ],
  },

  // ─── Decorate Stage ─────────────────────────────────────────────────────────
  decorate: {
    intro: [
      'Bestnya! Sekarang kita hiaskan!',
      'Jom buat cantik sikit! Letak hiasan!',
    ],
    prompts: {
      krim:      'Letak krim dulu! Gebu gebu!',
      strawberi: 'Sekarang, strawberi merah tu! Cantiknya!',
      taburan:   'Taburkan sikit kat atas tu!',
      lilin:     'Letak lilin! Nak tiup ke?',
    },
    placed: [
      'Cantiknya! Lagi!',
      'Elok letak tu! Pandai!',
      'Oyen suka! Cantik!',
    ],
    done: [
      'Wah! Cantik gila! Macam dalam kedai kek!',
      'Oyen tak sangka! Cantiknya kek kita!',
    ],
  },

  // ─── Celebration ────────────────────────────────────────────────────────────
  celebrate: {
    main: [
      'Cayalah! Oyen bangga dengan kamu!',
      'Tahniah! Kamu berjaya buat kek! Hebat!',
      'Waaah! Oyen nak nangis terharu! Pandainya!',
      'Luar biasa! Oyen rasa kamu dah jadi chef betul!',
    ],
    sticker: 'Dapat stiker baru! Tahniah!',
    stars: {
      1: 'Dapat satu bintang! Cuba lagi untuk lebih!',
      2: 'Dua bintang! Bagus sekali!',
      3: 'Tiga bintang! Sempurna! Oyen kagum!',
    },
    playAgain: 'Nak masak lagi? Jom!',
  },

  // ─── Rest Nudge ─────────────────────────────────────────────────────────────
  rest: {
    nudge: [
      'Jom rehat sekejap dan minum air ya sayang!',
      'Oyen pun penat sikit. Kita rehat dulu, minum air okay!',
      'Dah lama main! Masa rehat! Minum air dulu ya!',
    ],
    resume: 'Dah rehat? Jom sambung masak!',
  },

  // ─── Generic Encouragement (random, used between steps) ──────────────────
  encouragement: [
    'Bagus!',
    'Pandai!',
    'Hebat!',
    'Best!',
    'Oyen suka!',
    'Cayalah!',
    'Wah!',
  ],

  // ─── Oyen Reactions ─────────────────────────────────────────────────────────
  oyen: {
    idle: [
      'Oyen kat sini!',
      'Jom jom jom!',
      'Oyen lapar ni!',
    ],
    thinking: 'Hmm... apa agaknya?',
    excited: [
      'Yeay yeay yeay!',
      'Woohooo!',
      'Oyen happy sangat!',
    ],
  },

}

/**
 * Get a random item from an array of narration variants,
 * or return the string directly if not an array.
 *
 * @param {string | string[]} entry - narration entry
 * @returns {string}
 */
export function pickNarration(entry) {
  if (Array.isArray(entry)) {
    return entry[Math.floor(Math.random() * entry.length)]
  }
  return entry ?? ''
}
