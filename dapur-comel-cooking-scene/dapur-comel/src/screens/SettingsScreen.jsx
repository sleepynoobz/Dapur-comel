/**
 * SettingsScreen.jsx — Phase 5: Install banner integrated
 *
 * Added InstallBanner section for parent install guidance.
 * All Phase 3 hardening preserved.
 */

import { useState, useCallback, useEffect } from 'react'
import { useVoiceContext, useGameContext, useProgressContext } from '../App.jsx'
import { InstallBanner }   from '../components/ui/InstallBanner.jsx'
import { useInstallPrompt } from '../hooks/useInstallPrompt.js'
import { APP_VERSION }     from '../utils/constants.js'
import { resetAll }        from '../utils/storage.js'

export function SettingsScreen() {
  const { cancel }                = useVoiceContext()
  const { closeSettings, resetGame } = useGameContext()
  const {
    settings,
    progress,
    toggleVoiceMuted,
    toggleSfxMuted,
    refreshProgress,
  } = useProgressContext()

  const install = useInstallPrompt()

  const [confirmReset, setConfirmReset] = useState(false)
  const [resetting,    setResetting]    = useState(false)
  const [visible,      setVisible]      = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(closeSettings, 280)
  }, [closeSettings])

  const handleVoiceToggle = useCallback(() => {
    if (!settings.voiceMuted) cancel()
    toggleVoiceMuted()
  }, [settings.voiceMuted, cancel, toggleVoiceMuted])

  const handleResetConfirm = useCallback(() => {
    if (resetting) return
    setResetting(true)
    cancel()
    resetAll()
    refreshProgress()
    setConfirmReset(false)
    resetGame()
  }, [resetting, cancel, refreshProgress, resetGame])

  const totalStars   = Object.values(progress?.starsEarned  ?? {}).reduce((a, b) => a + b, 0)
  const totalMinutes = progress?.totalPlayMinutes ?? 0

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[150]"
        style={{
          backgroundColor:      'rgba(61,43,31,0.45)',
          backdropFilter:       'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          opacity:    visible ? 1 : 0,
          transition: 'opacity 0.25s ease',
        }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed left-0 right-0 bottom-0 z-[160] flex flex-col bg-white rounded-t-[2rem]"
        style={{
          transform:   visible ? 'translateY(0)' : 'translateY(100%)',
          transition:  'transform 0.3s cubic-bezier(0.34,1.2,0.64,1)',
          maxHeight:   '92dvh',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          touchAction: 'pan-y',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Kawalan Ibu Bapa"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
          <div className="w-10 h-1.5 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
          <div>
            <h2 className="text-toddler-sm font-display font-900 text-ink">
              Kawalan Ibu Bapa
            </h2>
            <p className="text-[0.7rem] font-body font-600 text-ink-muted mt-0.5">
              Tetapan hanya untuk ibu bapa
            </p>
          </div>
          <button
            type="button"
            className="flex items-center justify-center rounded-full bg-cream
                       font-display font-900 text-lg text-ink-muted
                       active:scale-90 transition-transform"
            style={{ width: 48, height: 48, touchAction: 'manipulation' }}
            onClick={handleClose}
            aria-label="Tutup tetapan"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div
          className="overflow-y-auto flex-1 px-6 py-4 space-y-5"
          style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}
        >
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <StatPill emoji="⭐" value={totalStars}                       label="Bintang" />
            <StatPill emoji="🎮" value={progress?.sessionsCompleted ?? 0} label="Sesi" />
            <StatPill emoji="⏱️" value={`${totalMinutes}m`}              label="Main" />
          </div>

          <div className="h-px bg-gray-100" />

          {/* Install section — parent facing */}
          <section aria-label="Pasang aplikasi">
            <p className="text-[0.7rem] font-display font-900 text-ink-muted uppercase tracking-wider mb-3">
              📲 Pasang Aplikasi
            </p>
            <InstallBanner
              isInstalled={install.isInstalled}
              canPrompt={install.canPrompt}
              isIos={install.isIos}
              isIosSafari={install.isIosSafari}
              triggerInstall={install.triggerInstall}
            />
          </section>

          <div className="h-px bg-gray-100" />

          {/* Audio */}
          <section aria-label="Tetapan bunyi">
            <p className="text-[0.7rem] font-display font-900 text-ink-muted uppercase tracking-wider mb-3">
              🔊 Bunyi
            </p>
            <div className="space-y-3">
              <ToggleRow
                label="Suara Oyen"
                description="Narasi semasa bermain"
                active={!settings.voiceMuted}
                onToggle={handleVoiceToggle}
              />
              <ToggleRow
                label="Kesan Bunyi"
                description="Bunyi tap dan interaksi"
                active={!settings.sfxMuted}
                onToggle={toggleSfxMuted}
              />
            </div>
          </section>

          <div className="h-px bg-gray-100" />

          {/* Reset */}
          <section aria-label="Set semula">
            <p className="text-[0.7rem] font-display font-900 text-ink-muted uppercase tracking-wider mb-3">
              ⚠️ Set Semula
            </p>
            {!confirmReset ? (
              <button
                type="button"
                className="w-full py-3.5 px-4 rounded-comel
                           border-2 border-berry/40 text-berry
                           font-display font-900 text-toddler-xs
                           bg-berry/5 active:bg-berry/10 transition-colors"
                style={{ touchAction: 'manipulation' }}
                onClick={() => setConfirmReset(true)}
              >
                Padam Semua Kemajuan
              </button>
            ) : (
              <div className="rounded-comel border-2 border-berry/30 bg-berry/5 p-4 space-y-3">
                <p className="text-toddler-xs font-display font-900 text-berry text-center">
                  Pasti nak padam? Tak boleh undo! 😬
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="flex-1 py-3 rounded-comel bg-berry text-white
                               font-display font-900 text-toddler-xs
                               active:opacity-80 disabled:opacity-50"
                    style={{ touchAction: 'manipulation' }}
                    onClick={handleResetConfirm}
                    disabled={resetting}
                  >
                    {resetting ? '...' : 'Ya, Padam'}
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-3 rounded-comel bg-gray-100 text-ink-soft
                               font-display font-900 text-toddler-xs active:opacity-80"
                    style={{ touchAction: 'manipulation' }}
                    onClick={() => setConfirmReset(false)}
                    disabled={resetting}
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </section>

          <p className="text-center text-[0.65rem] text-gray-300 font-body pb-2">
            Dapur Comel v{APP_VERSION} • Dibuat dengan ❤️
          </p>
        </div>

        {/* Close CTA */}
        <div className="px-6 pt-2 pb-4">
          <button
            type="button"
            className="w-full py-4 rounded-pill bg-oyen-500 text-white
                       font-display font-900 text-toddler-md
                       shadow-button active:translate-y-[2px] active:shadow-button-pressed
                       transition-transform duration-100"
            style={{ touchAction: 'manipulation' }}
            onClick={handleClose}
            aria-label="Tutup kawalan ibu bapa"
          >
            Selesai ✓
          </button>
        </div>
      </div>
    </>
  )
}

function StatPill({ emoji, value, label }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-cream rounded-comel py-3 px-2">
      <span className="text-xl leading-none" aria-hidden="true">{emoji}</span>
      <span className="font-display font-900 text-ink text-toddler-sm leading-none">{value}</span>
      <span className="text-[0.6rem] font-body font-700 text-ink-muted">{label}</span>
    </div>
  )
}

function ToggleRow({ label, description, active, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      className="w-full flex items-center justify-between py-2
                 active:opacity-70 transition-opacity"
      onClick={onToggle}
      style={{ touchAction: 'manipulation' }}
    >
      <div className="flex flex-col items-start text-left">
        <span className="text-toddler-xs font-display font-900 text-ink">{label}</span>
        <span className="text-[0.65rem] font-body font-600 text-ink-muted">{description}</span>
      </div>
      <div
        className="relative rounded-full flex-shrink-0 ml-4 transition-colors duration-200"
        style={{ width: 56, height: 32, backgroundColor: active ? '#5EC4B6' : '#E5E7EB' }}
        aria-hidden="true"
      >
        <div
          className="absolute top-1 w-6 h-6 rounded-full bg-white
                     shadow-[0_1px_4px_rgba(0,0,0,0.2)]
                     transition-transform duration-200"
          style={{ transform: active ? 'translateX(26px)' : 'translateX(4px)' }}
        />
      </div>
    </button>
  )
}
