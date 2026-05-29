/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // ─── Brand Colours ────────────────────────────────────────────────
      colors: {
        // Primary warm orange — Oyen's signature
        oyen: {
          50:  '#FFF8EC',
          100: '#FFE9C8',
          200: '#FFD08A',
          300: '#FFB347',
          400: '#FF9A1F',
          500: '#FF8C5A',  // primary CTA
          600: '#E8703A',
          700: '#C4521E',
          800: '#9A3A0E',
          900: '#6B2406',
        },
        // Warm cream background
        cream: {
          DEFAULT: '#FFF8EC',
          dark:    '#FFF0D6',
        },
        // Soft teal for secondary actions
        mint: {
          DEFAULT: '#5EC4B6',
          light:   '#A8E6DF',
          dark:    '#3A9E91',
        },
        // Berry for accents (strawberry theme)
        berry: {
          DEFAULT: '#E8527A',
          light:   '#F5A0B8',
          dark:    '#B83058',
        },
        // Warm yellow for stars and highlights
        sunny: {
          DEFAULT: '#FFD700',
          light:   '#FFE866',
          dark:    '#E5B800',
        },
        // Soft purple for decorations
        lavender: {
          DEFAULT: '#B89FD8',
          light:   '#D4C4EC',
          dark:    '#8B6BB8',
        },
        // Safe dark for text — never pure black (too harsh for toddlers)
        ink: {
          DEFAULT: '#3D2B1F',
          soft:    '#6B4C3B',
          muted:   '#9E7B68',
        },
      },

      // ─── Typography ───────────────────────────────────────────────────
      fontFamily: {
        // Nunito: rounded, friendly, highly legible for children
        display: ['Nunito', 'Fredoka One', 'system-ui', 'sans-serif'],
        body:    ['Nunito', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Toddler-optimised scale — larger than typical web
        'toddler-xs': ['1.1rem',  { lineHeight: '1.4' }],
        'toddler-sm': ['1.3rem',  { lineHeight: '1.4' }],
        'toddler-md': ['1.6rem',  { lineHeight: '1.3' }],
        'toddler-lg': ['2rem',    { lineHeight: '1.2' }],
        'toddler-xl': ['2.5rem',  { lineHeight: '1.1' }],
        'toddler-2xl':['3rem',    { lineHeight: '1.0' }],
      },

      // ─── Spacing ──────────────────────────────────────────────────────
      spacing: {
        'touch': '44px',    // minimum touch target (Apple HIG)
        'touch-lg': '56px', // comfortable touch target for toddlers
        'touch-xl': '72px', // large interactive elements
      },

      // ─── Border Radius ────────────────────────────────────────────────
      borderRadius: {
        'bubble': '2rem',     // card-like bubbles
        'pill':   '9999px',   // fully rounded buttons
        'comel':  '1.5rem',   // signature rounded feel
      },

      // ─── Shadows ──────────────────────────────────────────────────────
      boxShadow: {
        'comel':    '0 6px 20px rgba(61,43,31,0.12)',
        'comel-lg': '0 10px 40px rgba(61,43,31,0.18)',
        'button':   '0 4px 0 rgba(61,43,31,0.20)',         // pressed-down feel
        'button-pressed': '0 1px 0 rgba(61,43,31,0.20)',   // state: pressed
        'glow-sunny': '0 0 20px rgba(255,215,0,0.5)',
        'glow-berry': '0 0 20px rgba(232,82,122,0.4)',
      },

      // ─── Animation ────────────────────────────────────────────────────
      keyframes: {
        // Oyen idle breathing
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.03)' },
        },
        // Oyen excited bounce
        bounce_comel: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '30%':      { transform: 'translateY(-18px) scale(1.05)' },
          '60%':      { transform: 'translateY(-8px) scale(1.02)' },
        },
        // Oyen cheeky wiggle
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '20%':      { transform: 'rotate(-6deg)' },
          '60%':      { transform: 'rotate(6deg)' },
          '80%':      { transform: 'rotate(-3deg)' },
        },
        // Ingredient pop-in
        pop_in: {
          '0%':   { transform: 'scale(0) rotate(-10deg)', opacity: '0' },
          '70%':  { transform: 'scale(1.15) rotate(3deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        // Success shimmer
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        // Gentle float for decorative elements
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        // Pulse glow for hints
        pulse_glow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,140,90,0.4)' },
          '50%':      { boxShadow: '0 0 0 16px rgba(255,140,90,0)' },
        },
        // Confetti fall
        confetti_fall: {
          '0%':   { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        // Button press feedback
        press: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(0.94)' },
        },
        // Slide up from bottom
        slide_up: {
          '0%':   { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        // Stirring rotation indicator
        stir_hint: {
          '0%':   { transform: 'rotate(0deg) translateX(30px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(30px) rotate(-360deg)' },
        },
      },
      animation: {
        'breathe':          'breathe 3s ease-in-out infinite',
        'bounce-comel':     'bounce_comel 0.6s ease-in-out',
        'wiggle':           'wiggle 0.5s ease-in-out',
        'pop-in':           'pop_in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shimmer':          'shimmer 2s linear infinite',
        'float':            'float 3s ease-in-out infinite',
        'pulse-glow':       'pulse_glow 1.5s ease-in-out infinite',
        'confetti-fall':    'confetti_fall linear forwards',
        'press':            'press 0.15s ease-in-out',
        'slide-up':         'slide_up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'stir-hint':        'stir_hint 1.5s linear infinite',
      },

      // ─── Screens (mobile-first) ───────────────────────────────────────
      screens: {
        'xs': '375px',   // small phones
        'sm': '390px',   // iPhone 14 width
        'md': '430px',   // large phones
        // Deliberately no desktop breakpoints — mobile-only MVP
      },
    },
  },
  plugins: [],
}
