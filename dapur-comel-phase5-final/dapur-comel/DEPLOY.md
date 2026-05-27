# Dapur Comel — Deployment Guide

## Quick Start

```bash
npm install
npm run build      # builds to /dist
npm run preview    # local preview at http://localhost:4173 (LAN accessible)
```

---

## Deploy to Vercel (Recommended)

### Option A — CLI (fastest)
```bash
npm install -g vercel
vercel --prod
```

### Option B — Git-based
1. Push to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Framework: **Vite** (auto-detected)
4. Build command: `npm run build`
5. Output directory: `dist`
6. Click **Deploy**

Vercel config is pre-set in `vercel.json` — no further setup needed.

---

## Deploy to Netlify (Alternative)

### Option A — Drag & Drop
```bash
npm run build
# Drag the /dist folder to netlify.com/drop
```

### Option B — Git-based
1. Push to GitHub
2. Go to [netlify.com](https://netlify.com) → New site from Git
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Click **Deploy site**

Netlify config is pre-set in `netlify.toml`.

---

## Post-Deploy Checklist

After deploying, verify these on a **real phone** (not desktop):

### iOS (iPhone Safari)
- [ ] Open URL in Safari
- [ ] App loads, Oyen visible, `Jom Masak!` button shows
- [ ] Tap `Jom Masak!` — narration plays (Oyen speaks Malay)
- [ ] Navigate to Recipe Select → Kek Strawberi card present
- [ ] Long-press top-right corner 3s → Settings opens
- [ ] Settings → "Tambah ke Skrin Utama" instructions visible
- [ ] Add to Home Screen → launch from icon → runs fullscreen (no address bar)
- [ ] In installed mode: voice still works after 30s idle (iOS resume fix)
- [ ] Kill app and reopen → progress still saved

### Android (Chrome)
- [ ] Open URL in Chrome
- [ ] "Install app" banner appears in Settings after a few visits
- [ ] Install → icon appears on home screen
- [ ] Launch from icon → fullscreen, no browser chrome
- [ ] Gameplay works completely offline (airplane mode test)
- [ ] Stars and progress survive app close + reopen

### Both platforms
- [ ] Rotate to landscape → "Putar telefon" advisory shows (not a hard lock)
- [ ] Rotate back to portrait → game resumes normally
- [ ] Screen stays on during gameplay (Wake Lock active)
- [ ] Settings voice toggle works — mutes Oyen narration
- [ ] Reset progress → confirmation required → progress wiped

---

## Expected dist/ Structure

```
dist/
├── index.html                          # Entry point
├── manifest.webmanifest                # PWA manifest
├── sw.js                               # Service worker (Workbox)
├── workbox-[hash].js                   # Workbox runtime
├── icons/
│   ├── icon-192x192.png
│   ├── icon-512x512.png
│   ├── icon-512x512-maskable.png
│   ├── apple-touch-icon.png
│   └── favicon-32.png
├── assets/
│   ├── images/
│   │   └── mascot/
│   │       ├── oyen-base-xl.webp       (20 KB)
│   │       ├── oyen-base-lg.webp       (11 KB)
│   │       ├── oyen-base-md.webp       (7 KB)
│   │       ├── oyen-base-sm.webp       (4 KB)
│   │       └── oyen-base-xs.webp       (2 KB)
│   └── [hash].js / [hash].css          # Vite-hashed bundles
└── _headers                            # Cache/security headers
```

### Approximate bundle sizes (gzipped)
| Chunk | Size |
|---|---|
| vendor-react | ~45 KB |
| main app | ~60 KB |
| CSS | ~15 KB |
| Mascot (total) | ~44 KB |
| **Total first load** | **~164 KB** |

---

## Troubleshooting

**Voice not working on iOS after install:**
The iOS audio unlock requires the first tap to come from a real user gesture.
The `Jom Masak!` button is deliberately the first large target — tapping it
triggers the unlock. If voice is still silent, check Settings → Suara Oyen is ON.

**PWA not installable on iOS:**
iOS does not support the `beforeinstallprompt` event. The only install path
is Safari → Share → "Add to Home Screen". Instructions are shown in Settings modal.

**App not updating after redeploy:**
The service worker uses `skipWaiting + clientsClaim` — it should update
silently within seconds of the next app open. Hard reload (clear cache) as fallback.

**Offline gameplay broken:**
Verify the service worker precached all assets. Open DevTools → Application →
Service Workers → check cache storage. All `/assets/` and `/icons/` paths
should be in `dapur-comel-runtime-v1`.
