/**
 * InstallBanner.jsx
 *
 * Parent-facing install guidance. Lives inside Settings modal only.
 * Never shown to toddlers during gameplay.
 *
 * Three states:
 *   1. Already installed → nothing shown
 *   2. Android Chrome + canPrompt → "Install App" button
 *   3. iOS Safari → step-by-step manual instructions
 *   4. Other browser → generic instructions
 */

import { useState, useCallback } from 'react'

export function InstallBanner({ isInstalled, canPrompt, isIos, isIosSafari, triggerInstall }) {
  const [installing,   setInstalling]   = useState(false)
  const [showIosSteps, setShowIosSteps] = useState(false)

  // Already installed — show success badge
  if (isInstalled) {
    return (
      <div
        className="flex items-center gap-3 rounded-comel px-4 py-3"
        style={{ backgroundColor: '#E8F8F0' }}
      >
        <span className="text-xl" aria-hidden="true">✅</span>
        <div>
          <p className="text-toddler-xs font-display font-900 text-ink">
            Dah dipasang!
          </p>
          <p className="text-[0.65rem] font-body font-600 text-ink-muted">
            Dapur Comel ada kat skrin utama.
          </p>
        </div>
      </div>
    )
  }

  // Android Chrome — native install prompt
  if (canPrompt) {
    const handleInstall = async () => {
      setInstalling(true)
      const accepted = await triggerInstall()
      setInstalling(false)
    }

    return (
      <div className="rounded-comel overflow-hidden" style={{ border: '2px solid #FFD4B0' }}>
        <div className="px-4 py-3" style={{ backgroundColor: '#FFF5E8' }}>
          <p className="text-[0.7rem] font-display font-900 text-ink-muted uppercase tracking-wider mb-2">
            📲 Pasang Aplikasi
          </p>
          <p className="text-toddler-xs font-body font-700 text-ink mb-3">
            Pasang Dapur Comel untuk main tanpa internet.
          </p>
          <button
            type="button"
            className="w-full py-3 rounded-comel font-display font-900 text-toddler-xs
                       text-white transition-opacity active:opacity-80"
            style={{
              background: installing
                ? '#E5D5C0'
                : 'linear-gradient(145deg, #FF9A5A, #FF7A3A)',
              touchAction: 'manipulation',
            }}
            onClick={handleInstall}
            disabled={installing}
          >
            {installing ? 'Memasang...' : '📲 Pasang Sekarang'}
          </button>
        </div>
      </div>
    )
  }

  // iOS Safari — manual steps
  if (isIosSafari || isIos) {
    return (
      <div className="rounded-comel overflow-hidden" style={{ border: '2px solid #FFD4B0' }}>
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3
                     active:opacity-70 transition-opacity"
          style={{ backgroundColor: '#FFF5E8', touchAction: 'manipulation' }}
          onClick={() => setShowIosSteps(v => !v)}
        >
          <div className="text-left">
            <p className="text-[0.7rem] font-display font-900 text-ink-muted uppercase tracking-wider">
              📲 Tambah ke Skrin Utama
            </p>
            <p className="text-toddler-xs font-body font-700 text-ink mt-0.5">
              Pasang untuk main tanpa internet
            </p>
          </div>
          <span className="text-ink-muted font-display font-900 text-lg"
                style={{ transform: showIosSteps ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
            ›
          </span>
        </button>

        {showIosSteps && (
          <div className="px-4 pb-4 pt-2 space-y-2.5" style={{ backgroundColor: '#FFFAF5' }}>
            {[
              { icon: '1️⃣', text: 'Tap butang Share (kotak dengan anak panah naik) di bawah Safari' },
              { icon: '2️⃣', text: 'Skrol ke bawah dan tap "Add to Home Screen" / "Tambah ke Skrin Utama"' },
              { icon: '3️⃣', text: 'Tap "Add" / "Tambah" di penjuru kanan atas' },
              { icon: '✅', text: 'Selesai! Ikon Dapur Comel kini ada di skrin utama' },
            ].map(({ icon, text }, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-base leading-tight flex-shrink-0" aria-hidden="true">{icon}</span>
                <p className="text-[0.7rem] font-body font-700 text-ink leading-tight">{text}</p>
              </div>
            ))}

            <div className="mt-2 rounded-lg px-3 py-2" style={{ backgroundColor: '#FFF0D6' }}>
              <p className="text-[0.65rem] font-body font-600 text-ink-muted">
                💡 Selepas pasang: buka dari ikon (bukan Safari) untuk pengalaman penuh skrin.
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Other browser — generic
  return (
    <div className="rounded-comel px-4 py-3" style={{ backgroundColor: '#FFF5E8', border: '2px solid #FFD4B0' }}>
      <p className="text-[0.7rem] font-display font-900 text-ink-muted uppercase tracking-wider mb-1">
        📲 Pasang Aplikasi
      </p>
      <p className="text-toddler-xs font-body font-700 text-ink">
        Buka Dapur Comel di Chrome (Android) atau Safari (iPhone) untuk pasang ke skrin utama.
      </p>
    </div>
  )
}
