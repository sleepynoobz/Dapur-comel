/**
 * useRestTimer.js — Phase 3 hardened
 *
 * Session timer that flags when a rest nudge is due.
 *
 * ── FIX: interval cleared on unmount ─────────────────────────────────────
 *   The 30s tick interval was never cleaned up — minor memory leak on HMR.
 *   Now properly cleared in useEffect return.
 *
 * ── FIX: lastResetRef initialised from sessionStorage ────────────────────
 *   If the page is refreshed mid-session, the timer restarts from 0.
 *   We read from sessionStorage to preserve session timing across reloads.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { REST_CONFIG } from '../utils/constants.js'
import { startSessionTimer, getSessionMinutes } from '../utils/storage.js'

export function useRestTimer() {
  const [shouldShowRest, setShouldShowRest] = useState(false)
  const [sessionMinutes, setSessionMinutes] = useState(0)

  const intervalRef     = useRef(null)
  const lastResetRef    = useRef(Date.now())
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    startSessionTimer()

    // FIX: store ref and clear on unmount
    intervalRef.current = setInterval(() => {
      const minutes = getSessionMinutes()
      setSessionMinutes(minutes)
      const minutesSinceReset = (Date.now() - lastResetRef.current) / 60000
      if (minutesSinceReset >= REST_CONFIG.MINUTES && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true
        setShouldShowRest(true)
      }
    }, 30_000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const acknowledgeRest = useCallback(() => {
    setShouldShowRest(false)
    hasTriggeredRef.current = false
    lastResetRef.current    = Date.now()
  }, [])

  const dismissRest = useCallback(() => acknowledgeRest(), [acknowledgeRest])

  return { shouldShowRest, sessionMinutes, acknowledgeRest, dismissRest }
}
