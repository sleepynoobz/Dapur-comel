/**
 * useDrag.js
 *
 * Custom touch-first drag & drop hook.
 * Architecture Revision #3: NO HTML5 native drag/drop.
 * Uses pointer events for unified touch/mouse handling.
 *
 * Design:
 * - Attach useDraggable() to draggable items
 * - Attach useDropZone() to drop targets
 * - DragContext (optional) coordinates between them
 *
 * Touch-first principles:
 * - touch-action: none on draggable elements (CSS)
 * - pointer events capture for seamless drag tracking
 * - TOUCH_CONFIG constants for tuning
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { TOUCH_CONFIG } from '../utils/constants.js'
import { hapticTap, hapticDrop } from '../utils/haptics.js'

// ─── useDraggable ─────────────────────────────────────────────────────────────

/**
 * Attach to a draggable item.
 *
 * @param {object} options
 * @param {string}   options.id         - unique ID for this draggable
 * @param {function} options.onDragStart - called when drag begins
 * @param {function} options.onDragEnd   - called with {dropped, dropZoneId}
 * @param {boolean}  options.disabled    - prevent dragging
 *
 * @returns {object} { dragHandlers, isDragging, dragStyle }
 */
export function useDraggable({ id, onDragStart, onDragEnd, disabled = false }) {
  const [isDragging, setIsDragging]   = useState(false)
  const [position, setPosition]       = useState({ x: 0, y: 0 })

  const originRef     = useRef({ x: 0, y: 0 })    // pointer start position
  const elementRef    = useRef({ x: 0, y: 0 })    // element start position
  const hasDraggedRef = useRef(false)
  const pointerIdRef  = useRef(null)

  const handlePointerDown = useCallback((e) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()

    // Capture this pointer (critical for smooth touch tracking)
    e.currentTarget.setPointerCapture(e.pointerId)
    pointerIdRef.current = e.pointerId

    originRef.current  = { x: e.clientX, y: e.clientY }
    elementRef.current = { x: 0, y: 0 }
    hasDraggedRef.current = false

    hapticTap()
  }, [disabled])

  const handlePointerMove = useCallback((e) => {
    if (pointerIdRef.current === null) return
    e.preventDefault()

    const dx = e.clientX - originRef.current.x
    const dy = e.clientY - originRef.current.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Only start dragging after threshold to allow taps
    if (!hasDraggedRef.current && distance < TOUCH_CONFIG.DRAG_THRESHOLD) return

    if (!hasDraggedRef.current) {
      hasDraggedRef.current = true
      setIsDragging(true)
      onDragStart?.({ id, x: e.clientX, y: e.clientY })
    }

    setPosition({ x: dx, y: dy })
  }, [id, onDragStart])

  const handlePointerUp = useCallback((e) => {
    if (pointerIdRef.current === null) return

    const wasDragging = hasDraggedRef.current
    pointerIdRef.current  = null
    hasDraggedRef.current = false

    setIsDragging(false)
    setPosition({ x: 0, y: 0 })

    if (wasDragging) {
      hapticDrop()
      // Drop detection happens in the drop zone via global event
      // We broadcast pointer position for drop zones to evaluate
      const dropEvent = new CustomEvent('dapur-drop', {
        detail: { draggableId: id, x: e.clientX, y: e.clientY },
        bubbles: true,
      })
      e.currentTarget.dispatchEvent(dropEvent)
      onDragEnd?.({ dropped: true, x: e.clientX, y: e.clientY })
    } else {
      // Was a tap, not a drag
      onDragEnd?.({ dropped: false })
    }
  }, [id, onDragEnd])

  const handlePointerCancel = useCallback(() => {
    pointerIdRef.current  = null
    hasDraggedRef.current = false
    setIsDragging(false)
    setPosition({ x: 0, y: 0 })
    onDragEnd?.({ dropped: false, cancelled: true })
  }, [onDragEnd])

  // CSS transform applied during drag
  const dragStyle = isDragging
    ? {
        transform: `translate(${position.x}px, ${position.y}px)`,
        zIndex: 1000,
        transition: 'none',
        filter: 'drop-shadow(0 8px 16px rgba(61,43,31,0.3))',
        cursor: 'grabbing',
      }
    : {
        transform: 'translate(0px, 0px)',
        transition: `transform ${TOUCH_CONFIG.SNAP_DURATION}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
        cursor: 'grab',
      }

  const dragHandlers = {
    onPointerDown:   handlePointerDown,
    onPointerMove:   handlePointerMove,
    onPointerUp:     handlePointerUp,
    onPointerCancel: handlePointerCancel,
    // Critical: prevent scroll stealing during drag
    style:           { touchAction: 'none' },
  }

  return { dragHandlers, isDragging, dragStyle, position }
}

// ─── useDropZone ──────────────────────────────────────────────────────────────

/**
 * Attach to a drop target container.
 *
 * @param {object} options
 * @param {string}   options.id         - unique ID for this drop zone
 * @param {string[]} options.accepts    - draggable IDs this zone accepts
 * @param {function} options.onDrop     - called with { draggableId } when valid drop occurs
 * @param {function} options.onReject   - called when wrong item dropped
 *
 * @returns {object} { dropRef, isActive, isAccepted }
 */
export function useDropZone({ id, accepts = [], onDrop, onReject }) {
  const [isActive, setIsActive]     = useState(false)  // any drag hovering
  const [isAccepted, setIsAccepted] = useState(false)  // correct item hovering
  const dropRef = useRef(null)

  useEffect(() => {
    const el = dropRef.current
    if (!el) return

    const handleDaburDrop = (e) => {
      const { draggableId, x, y } = e.detail

      // Check if pointer is within this drop zone
      const rect = el.getBoundingClientRect()
      const inBounds =
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top  &&
        y <= rect.bottom

      if (!inBounds) return

      // Check if this draggable is accepted
      const accepted = accepts.length === 0 || accepts.includes(draggableId)

      if (accepted) {
        setIsAccepted(true)
        onDrop?.({ draggableId, dropZoneId: id })
        // Reset visual state after animation
        setTimeout(() => setIsAccepted(false), 600)
      } else {
        onReject?.({ draggableId, dropZoneId: id })
      }
    }

    // Listen on document for bubbled events
    document.addEventListener('dapur-drop', handleDaburDrop)
    return () => document.removeEventListener('dapur-drop', handleDaburDrop)
  }, [id, accepts, onDrop, onReject])

  return { dropRef, isActive, isAccepted }
}

// ─── useStir ─────────────────────────────────────────────────────────────────

/**
 * Circular stirring gesture detection.
 * Detects clockwise or counter-clockwise circles on a touch surface.
 *
 * @param {object} options
 * @param {number}   options.circlesRequired  - how many full circles to complete
 * @param {function} options.onProgress       - called with progress 0–1
 * @param {function} options.onComplete       - called when all circles done
 *
 * @returns {object} { stirHandlers, stirRef, progress }
 */
export function useStir({ circlesRequired = 3, onProgress, onComplete }) {
  const [progress, setProgress] = useState(0)
  const stirRef = useRef(null)

  const lastAngleRef     = useRef(null)
  const totalRotationRef = useRef(0)
  const isStirringRef    = useRef(false)
  const centerRef        = useRef({ x: 0, y: 0 })
  const completedRef     = useRef(false)

  const getAngle = useCallback((x, y) => {
    const cx = centerRef.current.x
    const cy = centerRef.current.y
    return Math.atan2(y - cy, x - cx) * (180 / Math.PI)
  }, [])

  const handlePointerDown = useCallback((e) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    centerRef.current = {
      x: rect.left + rect.width  / 2,
      y: rect.top  + rect.height / 2,
    }
    lastAngleRef.current     = getAngle(e.clientX, e.clientY)
    isStirringRef.current    = true
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [getAngle])

  const handlePointerMove = useCallback((e) => {
    if (!isStirringRef.current || completedRef.current) return
    e.preventDefault()

    const currentAngle = getAngle(e.clientX, e.clientY)
    const lastAngle    = lastAngleRef.current

    if (lastAngle === null) {
      lastAngleRef.current = currentAngle
      return
    }

    // Calculate delta angle, handle 180° wrap-around
    let delta = currentAngle - lastAngle
    if (delta >  180) delta -= 360
    if (delta < -180) delta += 360

    totalRotationRef.current += Math.abs(delta)
    lastAngleRef.current      = currentAngle

    // Progress: total degrees / (circlesRequired * 360°)
    const totalRequired = circlesRequired * 360
    const newProgress   = Math.min(totalRotationRef.current / totalRequired, 1)

    setProgress(newProgress)
    onProgress?.(newProgress)

    if (newProgress >= 1 && !completedRef.current) {
      completedRef.current = true
      isStirringRef.current = false
      onComplete?.()
    }
  }, [circlesRequired, getAngle, onProgress, onComplete])

  const handlePointerUp = useCallback(() => {
    isStirringRef.current = false
    lastAngleRef.current  = null
  }, [])

  const reset = useCallback(() => {
    totalRotationRef.current = 0
    completedRef.current     = false
    lastAngleRef.current     = null
    isStirringRef.current    = false
    setProgress(0)
  }, [])

  const stirHandlers = {
    onPointerDown:   handlePointerDown,
    onPointerMove:   handlePointerMove,
    onPointerUp:     handlePointerUp,
    onPointerCancel: handlePointerUp,
    style:           { touchAction: 'none' },
  }

  return { stirRef, stirHandlers, progress, reset }
}
