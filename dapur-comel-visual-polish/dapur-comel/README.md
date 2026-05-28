# Dapur Comel 🍰

**Permainan masak-masak interaktif untuk kanak-kanak 3 tahun ke atas.**

Masak bersama Oyen Si Kucing dalam pengalaman memasak yang menggembirakan!

---

## Tentang Permainan

Dapur Comel adalah Progressive Web App (PWA) untuk kanak-kanak prasekolah.
Anak anda akan memasak Kek Strawberi bersama Oyen — mengumpul bahan-bahan,
mengira, mengacau, membakar, dan menghias.

**Bahasa:** Bahasa Melayu  
**Umur:** 3 tahun ke atas  
**Platform:** iPhone Safari, Android Chrome  
**Sambungan internet:** Diperlukan untuk muat turun pertama sahaja

---

## Untuk Pembangun

```bash
npm install
npm run dev       # development server
npm run build     # production build → /dist
npm run preview   # preview production build
npm run lint      # ESLint check
```

**Node.js:** 18+  
**Framework:** React 18 + Vite 5  
**Styling:** TailwindCSS 3  
**PWA:** vite-plugin-pwa (Workbox)

### Deployment
Lihat [DEPLOY.md](./DEPLOY.md) untuk arahan Vercel/Netlify.

### QA
Lihat [QA_CHECKLIST.md](./QA_CHECKLIST.md) untuk senarai semakan sebelum release.

---

## Struktur Projek

```
src/
├── App.jsx                    # Root, context providers, screen router
├── main.jsx                   # Entry point, PWA registration, safety guards
├── components/
│   ├── mascot/Oyen.jsx        # Final mascot with CSS expression system
│   ├── ui/                    # BigButton, Confetti, InstallBanner, etc.
│   ├── gates/ParentGate.jsx   # 3s long-press parent gate
│   └── layout/SafeArea.jsx    # Safe area wrapper
├── screens/
│   ├── HomeScreen.jsx         # Welcome + Oyen interaction
│   ├── RecipeSelectScreen.jsx # Image-first recipe picker
│   ├── SettingsScreen.jsx     # Parent settings modal
│   ├── RestScreen.jsx         # Gentle rest nudge
│   └── game/
│       ├── GameScreen.jsx     # HUD + stage orchestrator
│       └── stages/            # Gather, Count, Mix, Oven, Decorate, Celeb
├── engine/
│   ├── gameStateMachine.js    # Pure FSM (no React)
│   └── recipeRunner.js        # Level-aware stage config resolver
├── hooks/
│   ├── useVoice.js            # TTS with iOS resume + watchdog
│   ├── useGameEngine.js       # React FSM wrapper
│   ├── useProgress.js         # localStorage progress state
│   ├── useRestTimer.js        # Session timer
│   └── useInstallPrompt.js    # PWA install detection
├── data/
│   ├── narration.js           # All BM narration strings
│   └── recipes/               # Recipe configs (kek-strawberi.js)
└── utils/
    ├── constants.js           # App-wide enums and config
    ├── storage.js             # localStorage helpers
    ├── audio.js               # Web Audio API SFX
    └── haptics.js             # Vibration API wrapper
```
