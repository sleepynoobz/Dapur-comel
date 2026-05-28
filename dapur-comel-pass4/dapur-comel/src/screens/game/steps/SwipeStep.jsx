/**
 * SwipeStep.jsx
 *
 * Handles: FLIP (swipe_up), SLICE (swipe across)
 * Gesture: directional swipe
 *
 * Completion logic:
 *   FLIP  — swipe distance ≥ 60px upward → fires immediately on threshold hit
 *   SLICE — 3 swipes across pizza → fires after sliceCount swipes
 *
 * No durationHint blind timer. Completion fires when gesture is detected.
 */

import { useState, useRef, useCallback } from 'react'
import { StepShell, SPRING, WIGGLE_KEYFRAME, useWrongTap } from './_shared.jsx'
import { hapticTap, hapticSuccess, hapticDrop } from '../../../utils/haptics.js'
import { sfx } from '../../../utils/audio.js'
import { STEP } from '../../../utils/constants.js'

const SWIPE_THRESHOLD = 60  // px to count as valid swipe

export function SwipeStep({ recipe, step, onComplete }) {
  const isFlip  = step.type === STEP.FLIP
  const isSlice = step.type === STEP.SLICE
  const totalSlices = step.sliceCount ?? 3

  const [slicesDone,   setSlicesDone]   = useState(0)
  const [flipped,      setFlipped]      = useState(false)
  const [flipAnim,     setFlipAnim]     = useState(false)  // triggers CSS flip
  const [sliceLines,   setSliceLines]   = useState([])     // SVG lines
  const [dragging,     setDragging]     = useState(false)
  const [dragPos,      setDragPos]      = useState({ x: 0, y: 0 })

  const { shaking, triggerWrong } = useWrongTap()
  const pointerRef    = useRef(null)
  const startRef      = useRef({ x: 0, y: 0 })
  const completingRef = useRef(false)
  const targetRef     = useRef(null)

  // ── Pointer handlers ────────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e) => {
    if (completingRef.current) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    pointerRef.current = e.pointerId
    startRef.current   = { x: e.clientX, y: e.clientY }
    setDragging(true)
    setDragPos({ x: e.clientX, y: e.clientY })
    hapticTap()
  }, [])

  const handlePointerMove = useCallback((e) => {
    if (pointerRef.current === null) return
    e.preventDefault()
    setDragPos({ x: e.clientX, y: e.clientY })
  }, [])

  const handlePointerUp = useCallback((e) => {
    if (pointerRef.current === null || completingRef.current) return
    pointerRef.current = null
    setDragging(false)

    const dx = e.clientX - startRef.current.x
    const dy = e.clientY - startRef.current.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < SWIPE_THRESHOLD) {
      triggerWrong()
      return
    }

    if (isFlip) {
      // Valid flip: upward swipe (dy negative) or any direction with enough distance
      hapticSuccess()
      sfx.play(step.sfx)
      setFlipAnim(true)
      setFlipped(true)
      completingRef.current = true
      setTimeout(onComplete, 420)

    } else if (isSlice) {
      // Record slice line on the pizza
      const rect = targetRef.current?.getBoundingClientRect()
      if (rect) {
        const lx1 = ((startRef.current.x - rect.left) / rect.width) * 100
        const ly1 = ((startRef.current.y - rect.top)  / rect.height) * 100
        const lx2 = ((e.clientX         - rect.left)  / rect.width)  * 100
        const ly2 = ((e.clientY         - rect.top)   / rect.height) * 100
        setSliceLines(prev => [...prev, { x1: lx1, y1: ly1, x2: lx2, y2: ly2, id: Date.now() }])
      }
      hapticDrop()
      sfx.play(step.sfx)

      const next = slicesDone + 1
      setSlicesDone(next)
      if (next >= totalSlices && !completingRef.current) {
        completingRef.current = true
        hapticSuccess()
        setTimeout(onComplete, 350)
      }
    }
  }, [isFlip, isSlice, slicesDone, totalSlices, triggerWrong, onComplete])

  // ── Flip render ─────────────────────────────────────────────────────────────
  if (isFlip) {
    return (
      <StepShell step={step}>
        <div className="relative flex flex-col items-center gap-4 select-none">

          <div
            className="flex items-center justify-center rounded-[1.75rem]"
            style={{
              width:       200,
              height:      200,
              background:  '#FFF5E0',
              boxShadow:   '0 6px 24px rgba(61,43,31,0.12)',
              animation:   flipAnim ? 'itemFlip 0.4s ease-out forwards' : undefined,
              touchAction: 'none',
              cursor:      flipped ? 'default' : 'grab',
              transform:   flipped ? 'translateY(-20px)' : undefined,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => { pointerRef.current = null; setDragging(false) }}
            aria-label={step.label}
          >
            <span style={{ fontSize: '5rem', lineHeight: 1 }} aria-hidden="true">
              {flipped ? step.emoji : step.emoji}
            </span>
          </div>

          {!flipped && (
            <p className="text-toddler-xs font-body font-700 text-ink-muted">
              Leret ke atas! 👆
            </p>
          )}
        </div>

        <style>{`
          @keyframes itemFlip {
            0%   { transform: translateY(0) rotateX(0deg); }
            40%  { transform: translateY(-80px) rotateX(180deg); }
            100% { transform: translateY(0) rotateX(360deg); }
          }
          ${WIGGLE_KEYFRAME}
        `}</style>
      </StepShell>
    )
  }

  // ── Slice render ────────────────────────────────────────────────────────────
  return (
    <StepShell step={step}>
      <div className="relative flex flex-col items-center gap-4 select-none">

        {/* Slice progress */}
        <div className="flex gap-2" aria-label={`${slicesDone} of ${totalSlices} slices`}>
          {Array.from({ length: totalSlices }, (_, i) => (
            <div key={i} className="rounded-full transition-all duration-200"
                 style={{
                   width: i < slicesDone ? 28 : 20,
                   height: i < slicesDone ? 28 : 20,
                   backgroundColor: i < slicesDone ? '#FF6B35' : '#E8D8CC',
                 }}
                 aria-hidden="true" />
          ))}
        </div>

        {/* Pizza base with SVG slice lines */}
        <div
          ref={targetRef}
          className="relative flex items-center justify-center rounded-full"
          style={{
            width:       200,
            height:      200,
            background:  'linear-gradient(135deg, #FFD4A0, #FFB870)',
            boxShadow:   '0 6px 24px rgba(61,43,31,0.15)',
            touchAction: 'none',
            cursor:      completingRef.current ? 'default' : 'crosshair',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => { pointerRef.current = null; setDragging(false) }}
          aria-label={step.label}
        >
          <span style={{ fontSize: '4rem', lineHeight: 1 }} aria-hidden="true">
            {step.emoji}
          </span>

          {/* Slice lines as SVG overlay */}
          <svg
            className="absolute inset-0 pointer-events-none"
            viewBox="0 0 100 100"
            style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}
          >
            {sliceLines.map(l => (
              <line key={l.id}
                x1={`${l.x1}%`} y1={`${l.y1}%`}
                x2={`${l.x2}%`} y2={`${l.y2}%`}
                stroke="rgba(255,255,255,0.85)" strokeWidth="2"
                strokeLinecap="round"
                style={{ animation: 'sliceAppear 0.2s ease-out' }}
              />
            ))}
          </svg>
        </div>

        <p className="text-toddler-xs font-body font-700 text-ink-muted">
          {completingRef.current ? 'Siap! 🎉' : `Potong! Lagi ${totalSlices - slicesDone} kali`}
        </p>
      </div>

      <style>{`
        @keyframes sliceAppear {
          from { opacity: 0; stroke-dashoffset: 100; }
          to   { opacity: 1; stroke-dashoffset: 0; }
        }
        ${WIGGLE_KEYFRAME}
      `}</style>
    </StepShell>
  )
}
