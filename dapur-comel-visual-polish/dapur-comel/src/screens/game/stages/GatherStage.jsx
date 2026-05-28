/**
 * GatherStage.jsx — Phase 3 hardened
 *
 * ── Fixes applied ─────────────────────────────────────────────────────────
 *   FIX 1: resetHint useCallback no longer has stale closure on currentTarget.
 *          Uses a ref (currentTargetRef) instead of closure value, so hint
 *          timer always speaks the CURRENT target, not a stale one.
 *
 *   FIX 2: Grid rebuild effect has stable dependencies — only rebuilds on
 *          targetIndex change, not on every render. distractorPool and count
 *          are computed once via useMemo and stable across renders.
 *
 *   FIX 3: handleTap guards against rapid multi-tap with `completingRef.current`
 *          check BEFORE any state updates.
 *
 *   FIX 4: Wrong-tap shake animation injected once via a shared <style> tag
 *          outside the mapped items, not inside each card.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useVoiceContext } from '../../../App.jsx'
import { hapticTap, hapticGentle } from '../../../utils/haptics.js'
import { getGatherConfig, pickN, shuffle, pickOne } from '../../../engine/recipeRunner.js'
import { LEVEL } from '../../../utils/constants.js'

const WRONG_LINES = [
  'Cuba lagi sayang! 💛',
  'Hmm, yang tu bukan. Cuba tengok lagi!',
  'Tak pe, cuba sekali lagi ya!',
  'Dekat dah tu! Cuba lagi!',
]

export function GatherStage({ recipe, stageConfig, level = LEVEL.ONE, onComplete }) {
  const { speak, speakText } = useVoiceContext()

  // FIX 2: stable config — computed once per stage mount
  const { targets, distractorPool, distractorCount, hintAfterSeconds } = useMemo(
    () => getGatherConfig(recipe, stageConfig, level),
    [] // eslint-disable-line react-hooks/exhaustive-deps
    // intentionally empty: recipe/stageConfig/level are stable for lifetime of stage
  )

  const [targetIndex,  setTargetIndex]  = useState(0)
  const [gatheredIds,  setGatheredIds]  = useState([])
  const [gridItems,    setGridItems]    = useState([])
  const [hinting,      setHinting]      = useState(false)
  const [successId,    setSuccessId]    = useState(null)
  const [wrongId,      setWrongId]      = useState(null)
  const [stageVisible, setStageVisible] = useState(false)

  const hintTimerRef     = useRef(null)
  const completingRef    = useRef(false)
  // FIX 1: ref always has latest target — avoids stale closure in resetHint
  const currentTargetRef = useRef(targets[0])

  const currentTarget = targets[targetIndex]

  // Keep ref current
  useEffect(() => {
    currentTargetRef.current = currentTarget
  }, [currentTarget])

  // Mount fade
  useEffect(() => {
    const t = setTimeout(() => setStageVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  // Cleanup on unmount
  useEffect(() => () => clearTimeout(hintTimerRef.current), [])

  // FIX 2: stable dep — only rebuilds on targetIndex
  useEffect(() => {
    if (!currentTarget) return
    const distractors = pickN(distractorPool, distractorCount)
    setGridItems(shuffle([
      { ...currentTarget, isTarget: true },
      ...distractors.map(d => ({ ...d, isTarget: false })),
    ]))
    setHinting(false)
    setSuccessId(null)
    setWrongId(null)
  }, [targetIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // Voice prompt on new target
  useEffect(() => {
    if (!currentTarget) return
    const t = setTimeout(() => speak(`gather.findIngredient.${currentTarget.id}`), 350)
    return () => clearTimeout(t)
  }, [targetIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // FIX 1: hint timer reads from ref — never stale
  const resetHint = useCallback(() => {
    setHinting(false)
    clearTimeout(hintTimerRef.current)
    hintTimerRef.current = setTimeout(() => {
      setHinting(true)
      const target = currentTargetRef.current
      if (target) speak(`gather.findIngredient.${target.id}`)
    }, hintAfterSeconds * 1000)
  }, [hintAfterSeconds, speak]) // no currentTarget in deps — uses ref instead

  useEffect(() => {
    resetHint()
    return () => clearTimeout(hintTimerRef.current)
  }, [targetIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // FIX 3: handleTap with race condition guard
  const handleTap = useCallback((item) => {
    // Guard: ignore if completing or already processing success
    if (completingRef.current || successId !== null) return
    resetHint()

    if (item.isTarget) {
      completingRef.current = true
      hapticTap()
      setSuccessId(item.id)
      speak('gather.correct')

      setTimeout(() => {
        setSuccessId(null)
        const next = targetIndex + 1
        if (next >= targets.length) {
          speak('gather.allGathered')
          setTimeout(onComplete, 1000)
        } else {
          setGatheredIds(prev => [...prev, currentTarget.id])
          setTargetIndex(next)
          completingRef.current = false
        }
      }, 700)
    } else {
      hapticGentle()
      setWrongId(item.id)
      speakText(pickOne(WRONG_LINES))
      setTimeout(() => setWrongId(null), 450)
    }
  }, [targetIndex, targets.length, currentTarget, successId, speak, speakText, resetHint, onComplete])

  if (!currentTarget) return null

  return (
    <div
      className="flex flex-col w-full h-full px-4 pt-3 pb-5 gap-3"
      style={{ opacity: stageVisible ? 1 : 0, transition: 'opacity 0.3s ease' }}
    >
      {/* Prompt */}
      <div className="bg-white rounded-[1.25rem] px-4 py-3 text-center
                      shadow-[0_2px_12px_rgba(61,43,31,0.08)]">
        <p className="text-toddler-xs text-ink-muted font-body font-700 mb-0.5">Cuba cari...</p>
        <p className="text-toddler-lg font-display font-900 text-ink leading-tight">
          <span style={{ color: recipe.accentColor ?? '#E8527A' }}>{currentTarget.name}</span>
          {'  '}{currentTarget.emoji}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {gridItems.map((item) => {
          const isSuccess = successId === item.id
          const isWrong   = wrongId   === item.id
          const isHint    = hinting && item.isTarget
          return (
            <button
              key={item.id + (item.isTarget ? '-t' : '')}
              type="button"
              className="relative flex flex-col items-center justify-center gap-2
                         rounded-[1.25rem] select-none
                         transition-transform duration-100 active:scale-95"
              style={{
                backgroundColor: isSuccess ? '#E8F8F0' : isWrong ? '#FFF0F0' : item.bg ?? '#FFF8EC',
                boxShadow: isSuccess
                  ? '0 0 0 3px #5EC4B6, 0 4px 16px rgba(94,196,182,0.25)'
                  : isHint
                    ? '0 0 0 3px #FF8C5A, 0 4px 20px rgba(255,140,90,0.35)'
                    : '0 3px 12px rgba(61,43,31,0.08)',
                animation: isWrong ? 'gatherWrongShake 0.4s ease' : undefined,
                touchAction: 'manipulation',
              }}
              onPointerUp={() => handleTap(item)}
              aria-label={item.name}
            >
              <span
                className="leading-none select-none"
                style={{
                  fontSize:  '3.5rem',
                  transform: isHint ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.3s ease',
                }}
                aria-hidden="true"
              >
                {item.emoji}
              </span>
              <span className="text-toddler-xs font-display font-800 text-ink-soft px-2 text-center leading-tight">
                {item.name}
              </span>
              {isSuccess && (
                <div className="absolute inset-0 rounded-[1.25rem] flex items-center justify-center bg-mint/20"
                     style={{ animation: 'gatherPopIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
                  <span className="text-4xl" aria-hidden="true">✓</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Progress pips */}
      <div className="flex items-center justify-center gap-2">
        {targets.map((t, i) => (
          <div
            key={t.id}
            className="rounded-full flex items-center justify-center
                       transition-all duration-300"
            style={{
              width:  i < gatheredIds.length ? 28 : i === gatheredIds.length ? 32 : 20,
              height: i < gatheredIds.length ? 28 : i === gatheredIds.length ? 32 : 20,
              backgroundColor: i < gatheredIds.length ? '#5EC4B6'
                : i === gatheredIds.length ? (recipe.accentColor ?? '#FF8C5A')
                : '#E5D5C8',
              fontSize: '0.85rem',
            }}
            aria-hidden="true"
          >
            {i < gatheredIds.length ? '✓' : t.emoji}
          </div>
        ))}
      </div>

      {/* FIX 4: single shared keyframe block, not inside each card */}
      <style>{`
        @keyframes gatherWrongShake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
        @keyframes gatherPopIn {
          from { transform: scale(0.7); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  )
}
