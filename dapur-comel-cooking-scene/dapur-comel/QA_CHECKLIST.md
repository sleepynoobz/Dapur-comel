# Dapur Comel — Parent QA Checklist

Use this before giving the device to your child.
Takes about 5 minutes on a real phone.

---

## 1 — Audio Test

| Step | Expected | Pass? |
|---|---|---|
| Open app, tap `Jom Masak!` | Oyen says "Jom masak dengan Oyen!" | ☐ |
| Tap Oyen mascot on home screen | Oyen makes a sound | ☐ |
| Go to Settings, mute Suara Oyen | No more voice narration | ☐ |
| Unmute Suara Oyen | Narration resumes | ☐ |
| Let app sit idle 30+ seconds, then tap | Voice still works (iOS resume bug fixed) | ☐ |

---

## 2 — Touch Test

| Step | Expected | Pass? |
|---|---|---|
| Tap `Jom Masak!` | Navigates to recipe select | ☐ |
| Tap Kek Strawberi card | Oyen reacts, game begins | ☐ |
| In Gather stage: tap correct ingredient | Green flash + praise | ☐ |
| In Gather stage: tap wrong ingredient | Gentle shake, no punishment | ☐ |
| In Mix stage: draw circles on bowl | Bowl colour changes, ring fills | ☐ |
| In Oven stage: tap oven | Baking animation starts | ☐ |
| In Decorate stage: drag topping to cake | Topping appears on cake | ☐ |
| Rotate phone to landscape | Advisory message shows | ☐ |
| Rotate back to portrait | Game resumes normally | ☐ |

---

## 3 — Install Test

### Android
| Step | Expected | Pass? |
|---|---|---|
| Open in Chrome | App loads correctly | ☐ |
| Open Settings modal (long-press top-right 3s) | "Pasang Sekarang" button visible | ☐ |
| Tap "Pasang Sekarang" | System install prompt appears | ☐ |
| Complete install | Icon appears on home screen | ☐ |
| Launch from home screen icon | Opens fullscreen, no browser bar | ☐ |

### iPhone
| Step | Expected | Pass? |
|---|---|---|
| Open in Safari | App loads correctly | ☐ |
| Open Settings modal | "Tambah ke Skrin Utama" steps visible | ☐ |
| Follow iOS steps: Share → Add to Home Screen | Icon appears on home screen | ☐ |
| Launch from home screen icon | Opens fullscreen, no Safari bar | ☐ |

---

## 4 — Offline Test

| Step | Expected | Pass? |
|---|---|---|
| Open app, play to Mix stage | Works normally | ☐ |
| Turn on Airplane Mode | No network error shown | ☐ |
| Complete full Kek Strawberi game offline | Game completes, stars awarded | ☐ |
| Turn Airplane Mode off, reopen app | Previously earned stars still shown | ☐ |

---

## 5 — Progress Save Test

| Step | Expected | Pass? |
|---|---|---|
| Complete Kek Strawberi (get stars) | Stars shown in celebration screen | ☐ |
| Close app completely (swipe away) | — | ☐ |
| Reopen app | Previous stars still visible in Settings | ☐ |
| Open Settings → Stats | Shows correct session count & stars | ☐ |
| Long-press top-right 3s → Settings → Padam Semua Kemajuan → confirm | Progress wiped | ☐ |
| Check stats after reset | All zeros | ☐ |

---

## 6 — Parent Gate Test

| Step | Expected | Pass? |
|---|---|---|
| Quick tap top-right corner | Nothing happens | ☐ |
| Hold 3 seconds on top-right corner | Orange ring fills, Settings opens | ☐ |
| Two-finger touch on gate zone | Hold cancelled | ☐ |
| Tap backdrop outside modal | Settings closes | ☐ |
| Tap "Selesai ✓" | Settings closes | ☐ |

---

## Known Limitations (by design)

- **iOS voice may be silent on very first app launch**: Tap `Jom Masak!` first — this unlocks audio.
- **Voice quality depends on device**: ms-MY voices are best on Android. iOS uses en-US as fallback.
- **Screen may dim on older iOS**: Wake Lock is not supported on all iOS versions.
- **Pancake & Biskut locked**: MVP ships with Kek Strawberi only. Others coming soon.

---

## Support

If something doesn't work as expected:
1. Force-close the app and reopen
2. If still broken: Settings → Padam Semua Kemajuan (resets to fresh state)
3. If offline content is missing: open in browser once with internet, then switch to offline
