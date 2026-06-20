/**
 * useInstallPrompt.js
 *
 * Manages the PWA "Add to Home Screen" install prompt.
 *
 * ── Behaviour ─────────────────────────────────────────────────────────────
 *   Android Chrome: shows native install prompt (beforeinstallprompt).
 *   iOS Safari: no native prompt — we show parent instructions instead.
 *   Already installed: isInstalled=true, no prompt shown.
 *
 * ── Toddler-safe design ───────────────────────────────────────────────────
 *   The install banner is PARENT-FACING only.
 *   It appears in the Settings modal, not during gameplay.
 *   It never interrupts the child's game flow.
 *
 * ── Detection ─────────────────────────────────────────────────────────────
 *   isInstalled: running in standalone/fullscreen mode (already installed)
 *   isIos: iPhone/iPad Safari (needs manual instructions)
 *   canPrompt: Android Chrome deferred prompt available
 */

import { useState, useEffect, useCallback, useRef } from 'react'

function isRunningStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true
  )
}

function detectIos() {
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) && !window.MSStream
}

function detectIosSafari() {
  return detectIos() && /WebKit/.test(navigator.userAgent) && !/CriOS|FxiOS/.test(navigator.userAgent)
}

export function useInstallPrompt() {
  const [isInstalled, setIsInstalled]   = useState(false)
  const [canPrompt,   setCanPrompt]     = useState(false)
  const [isIos,       setIsIos]         = useState(false)
  const [isIosSafari, setIsIosSafari]   = useState(false)
  const [justInstalled, setJustInstalled] = useState(false)

  const deferredPromptRef = useRef(null)

  useEffect(() => {
    // Check install state
    setIsInstalled(isRunningStandalone())
    setIsIos(detectIos())
    setIsIosSafari(detectIosSafari())

    // Android Chrome: capture deferred install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      deferredPromptRef.current = e
      setCanPrompt(true)
    }

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanPrompt(false)
      setJustInstalled(true)
      deferredPromptRef.current = null
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  /**
   * Trigger native Android install prompt.
   * Returns true if user accepted, false if dismissed.
   */
  const triggerInstall = useCallback(async () => {
    const prompt = deferredPromptRef.current
    if (!prompt) return false
    try {
      await prompt.prompt()
      const { outcome } = await prompt.userChoice
      deferredPromptRef.current = null
      setCanPrompt(false)
      return outcome === 'accepted'
    } catch {
      return false
    }
  }, [])

  return {
    isInstalled,
    canPrompt,    // Android: native prompt available
    isIos,        // iOS device (any browser)
    isIosSafari,  // iOS Safari specifically (install supported)
    justInstalled,
    triggerInstall,
  }
}
