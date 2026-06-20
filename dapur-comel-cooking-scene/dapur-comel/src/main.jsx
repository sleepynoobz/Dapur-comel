/**
 * main.jsx — Phase 5: Production-hardened entry point
 *
 * - PWA SW registration with update notification
 * - Toddler safety guards (zoom, context menu, multi-touch)
 * - Audio + TTS unlock on first gesture
 * - Wake lock request (keeps screen on during gameplay)
 */

import { StrictMode } from 'react'
import { createRoot }  from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import { unlockAudio } from './utils/audio.js'

// ─── PWA Service Worker ───────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register')
    .then(({ registerSW }) => {
      registerSW({
        onRegisteredSW(swUrl) {
          if (import.meta.env.DEV) {
            console.info('[PWA] SW registered:', swUrl)
          }
        },
        onOfflineReady() {
          if (import.meta.env.DEV) {
            console.info('[PWA] App ready for offline use')
          }
        },
        // Silently auto-update — no prompts during gameplay
        immediate: true,
      })
    })
    .catch(() => {
      // Non-fatal: app works without SW (in-browser)
    })
}

// ─── Toddler safety guards ────────────────────────────────────────────────────

// 1. Context menu (long-press shows browser menu on Android — confusing for toddlers)
document.addEventListener('contextmenu', (e) => e.preventDefault(), { passive: false })

// 2. Double-tap zoom (iOS — breaks layout)
{
  let lastTap = 0
  document.addEventListener('touchend', (e) => {
    const now = Date.now()
    if (now - lastTap < 280) e.preventDefault()
    lastTap = now
  }, { passive: false })
}

// 3. Pinch-to-zoom (multi-touch)
document.addEventListener('touchstart', (e) => {
  if (e.touches.length > 1) e.preventDefault()
}, { passive: false })

// 4. Overscroll / pull-to-refresh on body only
//    (NOT on scrollable children like settings panel)
document.body.addEventListener('touchmove', (e) => {
  if (e.target === document.body || e.target === document.documentElement) {
    e.preventDefault()
  }
}, { passive: false })

// ─── Audio + TTS unlock (first user gesture) ─────────────────────────────────
const unlockOnce = () => {
  unlockAudio()
  // Remove both after first fire
  document.removeEventListener('pointerdown', unlockOnce)
  document.removeEventListener('touchstart',  unlockOnce)
}
document.addEventListener('pointerdown', unlockOnce, { passive: true })
document.addEventListener('touchstart',  unlockOnce, { passive: true })

// ─── Wake Lock (keep screen on during gameplay) ───────────────────────────────
// Optional: graceful if unsupported (older iOS, some Android)
if ('wakeLock' in navigator) {
  let wakeLock = null

  const requestWakeLock = async () => {
    try {
      wakeLock = await navigator.wakeLock.request('screen')
    } catch {
      // Not fatal — just means screen may dim
    }
  }

  // Re-acquire on visibility change (released automatically when hidden)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && wakeLock === null) {
      requestWakeLock()
    }
  })

  // Acquire on first gesture to avoid browser policy violation
  document.addEventListener('pointerdown', requestWakeLock, { once: true })
}

// ─── Mount ────────────────────────────────────────────────────────────────────
const root = document.getElementById('root')
if (!root) throw new Error('[Dapur Comel] #root element missing from index.html')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
