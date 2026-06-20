/**
 * ParentGate.jsx — Phase 3 hardened
 *
 * ── Improvements ──────────────────────────────────────────────────────────
 *   FIX 1: Multi-touch rejection is more robust. If a second pointer comes
 *          in while holding, we cancel the hold (toddler grabbed with 2 fingers).
 *
 *   FIX 2: Unlock callback wrapped in setTimeout(0) to defer past the event
 *          handler — prevents state update inside a pointerdown handler
 *          which can cause React batching issues on some iOS versions.
 *
 *   FIX 3: Hold only starts on primary pointer (e.isPrimary).
 *
 *   FIX 4: Cleanup timers on unmount to prevent memory leak.
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { PARENT_GATE } from '../../utils/constants.js'

const HOLD_MS         = PARENT_GATE.HOLD_DURATION_MS
const RING_SIZE       = 48
const RADIUS          = 18
const CIRCUMFERENCE   = 2 * Math.PI * RADIUS

export function ParentGate({ onUnlock, children }) {
  const [holding,  setHolding]  = useState(false)
  const [progress, setProgress] = useState(0)

  const holdTimerRef     = useRef(null)
  const progressTimerRef = useRef(null)
  const startTimeRef     = useRef(0)
  const activePointerRef = useRef(null)

  // FIX 4: cleanup on unmount
  useEffect(() => () => {
    clearTimeout(holdTimerRef.current)
    clearInterval(progressTimerRef.current)
  }, [])

  const cancelHold = useCallback(() => {
    clearTimeout(holdTimerRef.current)
    clearInterval(progressTimerRef.current)
    activePointerRef.current = null
    setHolding(false)
    setProgress(0)
  }, [])

  const startHold = useCallback((e) => {
    // FIX 3: primary pointer only
    if (!e.isPrimary) return
    e.preventDefault()
    e.stopPropagation()
    // FIX 1: reject if another pointer is already active
    if (activePointerRef.current !== null) { cancelHold(); return }

    activePointerRef.current = e.pointerId
    startTimeRef.current     = Date.now()
    setHolding(true)
    setProgress(0)

    progressTimerRef.current = setInterval(() => {
      setProgress(Math.min((Date.now() - startTimeRef.current) / HOLD_MS, 1))
    }, 50)

    holdTimerRef.current = setTimeout(() => {
      clearInterval(progressTimerRef.current)
      setHolding(false)
      setProgress(0)
      activePointerRef.current = null
      // FIX 2: defer callback past event handler
      setTimeout(() => onUnlock?.(), 0)
    }, HOLD_MS)
  }, [onUnlock, cancelHold])

  const handlePointerUp = useCallback((e) => {
    if (e.pointerId !== activePointerRef.current) return
    cancelHold()
  }, [cancelHold])

  // FIX 1: any extra pointer cancels hold
  const handlePointerDown = useCallback((e) => {
    if (activePointerRef.current !== null && e.pointerId !== activePointerRef.current) {
      cancelHold()
    } else {
      startHold(e)
    }
  }, [startHold, cancelHold])

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)

  return (
    <div className="relative">
      {children}
      <div
        className="absolute top-0 right-0 z-[200]"
        style={{ width: RING_SIZE, height: RING_SIZE, touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={cancelHold}
        role="button"
        aria-label="Kawalan ibu bapa"
        aria-hidden="true"
      >
        {holding && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20" aria-hidden="true">
            <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
                 style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={RING_SIZE/2} cy={RING_SIZE/2} r={RADIUS} fill="none"
                      stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
              <circle cx={RING_SIZE/2} cy={RING_SIZE/2} r={RADIUS} fill="none"
                      stroke="#FF8C5A" strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={CIRCUMFERENCE} strokeDashoffset={strokeDashoffset}
                      style={{ transition: 'stroke-dashoffset 50ms linear' }} />
            </svg>
            <span className="absolute text-sm leading-none" style={{ fontSize: 16 }}>🔒</span>
          </div>
        )}
      </div>
    </div>
  )
}
