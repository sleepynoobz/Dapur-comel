/**
 * useVoice.js — Phase 3 hardened
 *
 * Web Speech API wrapper. Fully hardened for iOS Safari and Android Chrome.
 *
 * ── Fixes applied ─────────────────────────────────────────────────────────
 *   FIX 1: speechSynthesis.resume() called before every speak() — iOS suspends
 *           synthesis after ~30s inactivity; resume() wakes it back up.
 *   FIX 2: processQueue no longer depends on isUnlocked/ttsAvailable in
 *           useCallback deps — uses refs instead. Avoids stale closure where
 *           first speak after iOS gesture unlock would silently drop.
 *   FIX 3: cancel() now resets isProcessingRef before setting queue to [] —
 *           prevents queue deadlock on rapid cancel → speak sequences.
 *   FIX 4: isSpeaking set to false synchronously in cancel() to fix visual
 *           desync on Oyen mouth animation.
 *   FIX 5: Utterance timeout watchdog — if onend/onerror never fires (iOS bug),
 *           we force-advance queue after estimated speech duration + buffer.
 *
 * ── Fallback priority ─────────────────────────────────────────────────────
 *   1. ms-MY female
 *   2. ms generic
 *   3. en-US female
 *   4. Any voice
 *   5. Silent mode — app remains 100% playable visually
 *
 * ── iOS notes ─────────────────────────────────────────────────────────────
 *   - First speak() must be from a user gesture (handled in HomeScreen/main.jsx)
 *   - speechSynthesis suspends if no gesture for ~30s; .resume() fixes this
 *   - voiceschanged may fire multiple times; we dedupe via isReady ref
 *   - Some iOS voices ignore .rate / .pitch; this is expected and harmless
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { TTS_CONFIG } from '../utils/constants.js'
import { loadSettings } from '../utils/storage.js'
import { narration, pickNarration } from '../data/narration.js'

// ─── Detect iOS Safari ────────────────────────────────────────────────────────
const isBrowser   = typeof window !== 'undefined'
const hasSpeech   = isBrowser && 'speechSynthesis' in window

function isIosSafari() {
  if (!isBrowser) return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    && /WebKit/.test(navigator.userAgent)
    && !/CriOS|FxiOS/.test(navigator.userAgent)
}

// ─── Voice selection ──────────────────────────────────────────────────────────
const FEMALE_PATTERN = /\b(zira|samantha|karen|moira|fiona|victoria|kathy|vicki|allison|ava|susan|siri|nicky|kate|tessa|veena|heera|paulina|monica|anna)\b/i

function selectBestVoice(voices) {
  if (!voices?.length) return null
  const isFemale  = (v) => v.name.toLowerCase().includes('female') || FEMALE_PATTERN.test(v.name)
  const matchLang = (p) => (v) => v.lang.toLowerCase().startsWith(p.toLowerCase())
  const strategies = [
    () => voices.filter(matchLang('ms-MY')).find(isFemale),
    () => voices.filter(matchLang('ms_MY')).find(isFemale),
    () => voices.find(matchLang('ms-MY')),
    () => voices.find(matchLang('ms')),
    () => voices.filter(matchLang('en-US')).find(isFemale),
    () => voices.find(matchLang('en-US')),
    () => voices.find(matchLang('en')),
    () => voices[0],
  ]
  for (const s of strategies) { const v = s(); if (v) return v }
  return null
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useVoice() {
  const [isSpeaking,   setIsSpeaking]   = useState(false)
  const [isReady,      setIsReady]      = useState(false)
  const [ttsAvailable, setTtsAvailable] = useState(true)
  const [isUnlocked,   setIsUnlocked]   = useState(!isIosSafari())

  const selectedVoiceRef  = useRef(null)
  const queueRef          = useRef([])
  const isProcessingRef   = useRef(false)
  const isReadyRef        = useRef(false)        // FIX 2: ref mirrors state for processQueue
  const ttsAvailableRef   = useRef(true)         // FIX 2: ref mirrors state for processQueue
  const isUnlockedRef     = useRef(!isIosSafari()) // FIX 2
  const watchdogRef       = useRef(null)         // FIX 5: utterance watchdog timer
  const iosNeedsUnlock    = isIosSafari()

  // Keep refs in sync with state
  useEffect(() => { isUnlockedRef.current = isUnlocked }, [isUnlocked])
  useEffect(() => { ttsAvailableRef.current = ttsAvailable }, [ttsAvailable])
  useEffect(() => { isReadyRef.current = isReady }, [isReady])

  // ── Voice init ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hasSpeech) {
      setTtsAvailable(false)
      ttsAvailableRef.current = false
      setIsReady(true)
      return
    }
    const synth = window.speechSynthesis
    const init = () => {
      if (isReadyRef.current) return   // dedupe multiple voiceschanged fires
      const voices = synth.getVoices()
      if (!voices.length) return
      selectedVoiceRef.current = selectBestVoice(voices)
      isReadyRef.current = true
      setIsReady(true)
      if (import.meta.env?.DEV) {
        console.info('[useVoice] Voice:', selectedVoiceRef.current?.name ?? '(none)', selectedVoiceRef.current?.lang ?? '')
      }
    }
    const voices = synth.getVoices()
    if (voices.length) { init() } else {
      synth.addEventListener('voiceschanged', init)
      setTimeout(init, 800)   // iOS fallback: voiceschanged may never fire
    }
    return () => synth.removeEventListener('voiceschanged', init)
  }, [])

  // ── iOS gesture unlock ───────────────────────────────────────────────────
  useEffect(() => {
    if (!iosNeedsUnlock || isUnlocked || !hasSpeech) return
    const unlock = () => {
      try {
        const warmup = new SpeechSynthesisUtterance('')
        warmup.volume = 0
        warmup.onend   = () => { setIsUnlocked(true); isUnlockedRef.current = true }
        warmup.onerror = () => { setIsUnlocked(true); isUnlockedRef.current = true }
        window.speechSynthesis.speak(warmup)
      } catch {
        setIsUnlocked(true); isUnlockedRef.current = true
      }
    }
    document.addEventListener('touchstart',  unlock, { capture: true, passive: true, once: true })
    document.addEventListener('pointerdown', unlock, { capture: true, passive: true, once: true })
    return () => {
      document.removeEventListener('touchstart',  unlock, { capture: true })
      document.removeEventListener('pointerdown', unlock, { capture: true })
    }
  }, [iosNeedsUnlock, isUnlocked])

  // ── Queue processor ──────────────────────────────────────────────────────
  // FIX 2: Uses refs instead of closure state so it's always fresh.
  // FIX 1: Calls speechSynthesis.resume() before speaking (iOS suspended fix).
  // FIX 5: Watchdog timer force-advances queue if onend/onerror never fires.
  const processQueue = useCallback(() => {
    if (isProcessingRef.current) return
    if (!queueRef.current.length) { setIsSpeaking(false); return }

    const { voiceMuted } = loadSettings()
    if (voiceMuted) { queueRef.current = []; setIsSpeaking(false); return }

    // Guard using refs (not state) — always current value
    if (!ttsAvailableRef.current || !hasSpeech) { queueRef.current = []; setIsSpeaking(false); return }
    if (!isUnlockedRef.current && iosNeedsUnlock) { queueRef.current = []; setIsSpeaking(false); return }

    isProcessingRef.current = true
    const text = queueRef.current.shift()

    try {
      // FIX 1: Wake iOS synthesis if suspended
      const synth = window.speechSynthesis
      if (synth.paused) synth.resume()

      const utt = new SpeechSynthesisUtterance(text)
      if (selectedVoiceRef.current) utt.voice = selectedVoiceRef.current
      utt.lang   = selectedVoiceRef.current?.lang ?? 'ms-MY'
      utt.rate   = TTS_CONFIG.RATE
      utt.pitch  = TTS_CONFIG.PITCH
      utt.volume = TTS_CONFIG.VOLUME

      // FIX 5: Watchdog — force advance if speech hangs (iOS known bug)
      const estimatedMs = Math.max((text.length / 12) * (1 / TTS_CONFIG.RATE) * 1000, 500) + 2500
      watchdogRef.current = setTimeout(() => {
        if (import.meta.env?.DEV) console.warn('[useVoice] Utterance watchdog fired')
        isProcessingRef.current = false
        setIsSpeaking(false)
        if (queueRef.current.length > 0) setTimeout(processQueue, 100)
      }, estimatedMs)

      utt.onstart = () => setIsSpeaking(true)

      utt.onend = () => {
        clearTimeout(watchdogRef.current)
        isProcessingRef.current = false
        setIsSpeaking(queueRef.current.length > 0)
        if (queueRef.current.length > 0) setTimeout(processQueue, TTS_CONFIG.QUEUE_GAP)
      }

      utt.onerror = (e) => {
        clearTimeout(watchdogRef.current)
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          if (import.meta.env?.DEV) console.warn('[useVoice] TTS error:', e.error)
        }
        isProcessingRef.current = false
        setIsSpeaking(false)
        if (queueRef.current.length > 0) setTimeout(processQueue, TTS_CONFIG.QUEUE_GAP)
      }

      synth.speak(utt)
    } catch (err) {
      clearTimeout(watchdogRef.current)
      if (import.meta.env?.DEV) console.warn('[useVoice] speak() threw:', err)
      isProcessingRef.current = false
      setIsSpeaking(false)
    }
  }, [iosNeedsUnlock]) // minimal deps — reads from refs

  // ── Flush helper ─────────────────────────────────────────────────────────
  const flushAndQueue = useCallback((texts) => {
    if (!texts?.length) return
    try { window.speechSynthesis?.cancel() } catch { /**/ }
    clearTimeout(watchdogRef.current)
    // FIX 3: reset processing BEFORE clearing queue
    isProcessingRef.current = false
    queueRef.current = texts
    processQueue()
  }, [processQueue])

  // ── Key resolver ─────────────────────────────────────────────────────────
  const resolveKey = useCallback((key) => {
    const parts = key.split('.')
    let node = narration
    for (const p of parts) { node = node?.[p]; if (node === undefined) break }
    if (!node && import.meta.env?.DEV) console.warn('[useVoice] Key not found:', key)
    return node ? pickNarration(node) : null
  }, [])

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => () => {
    clearTimeout(watchdogRef.current)
    try { window.speechSynthesis?.cancel() } catch { /**/ }
  }, [])

  // ── Public API ────────────────────────────────────────────────────────────

  /** Speak a raw string. Cancels current speech. */
  const speakText = useCallback((text) => {
    if (!text) return
    const { voiceMuted } = loadSettings()
    if (voiceMuted) return
    flushAndQueue([text])
  }, [flushAndQueue])

  /** Speak by dot-notation narration key. Picks randomly if array. */
  const speak = useCallback((key) => {
    const text = resolveKey(key)
    if (text) speakText(text)
  }, [resolveKey, speakText])

  /** Queue multiple keys to play sequentially. Clears current speech. */
  const queue = useCallback((keys) => {
    const { voiceMuted } = loadSettings()
    if (voiceMuted) return
    const texts = keys.map(resolveKey).filter(Boolean)
    if (!texts.length) return
    flushAndQueue(texts)
  }, [resolveKey, flushAndQueue])

  /** Stop all speech and clear queue. */
  const cancel = useCallback(() => {
    clearTimeout(watchdogRef.current)
    // FIX 3: reset processing first, then cancel synthesis
    isProcessingRef.current = false
    queueRef.current = []
    try { window.speechSynthesis?.cancel() } catch { /**/ }
    // FIX 4: sync isSpeaking immediately
    setIsSpeaking(false)
  }, [])

  const encourage = useCallback(() => speak('encouragement'), [speak])

  return { speak, speakText, queue, cancel, encourage, isSpeaking, isReady, ttsAvailable, isUnlocked }
}
