/**
 * A thin wrapper over speechSynthesis (DESIGN 11).
 * Voices load asynchronously, so we listen for `voiceschanged` and re-pick.
 *
 * It also tracks what is playing so a control can show play / pause / stop:
 * `useSpeech(text)` tells a component whether *its* text is the one speaking.
 */

import { useSyncExternalStore } from 'react'

let cached: SpeechSynthesisVoice | null = null
let listening = false

export type SpeechStatus = 'idle' | 'speaking' | 'paused'

interface SpeechState {
  status: SpeechStatus
  /** The text currently loaded, so each control knows if it owns playback. */
  text: string | null
}

let state: SpeechState = { status: 'idle', text: null }
const listeners = new Set<() => void>()
/** Bumped on every speak/cancel so a stale utterance's events are ignored. */
let generation = 0
/** Chrome stops long utterances after ~15s unless nudged; this timer nudges. */
let keepAlive: number | null = null

function set(next: SpeechState) {
  state = next
  listeners.forEach((l) => l())
}

function synth(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null
  return window.speechSynthesis ?? null
}

export function isAvailable(): boolean {
  return synth() !== null && typeof window.SpeechSynthesisUtterance === 'function'
}

function pickVoice(): SpeechSynthesisVoice | null {
  const s = synth()
  if (!s) return null
  const voices = s.getVoices()
  if (!voices.length) return null

  cached =
    voices.find((v) => v.lang === 'en-IN') ??
    voices.find((v) => v.lang.replace('_', '-').startsWith('en-IN')) ??
    voices.find((v) => v.lang.toLowerCase().startsWith('en')) ??
    voices[0]
  return cached
}

/** Warm the voice list up early; harmless to call more than once. */
export function prime() {
  const s = synth()
  if (!s) return
  pickVoice()
  if (!listening) {
    listening = true
    s.addEventListener('voiceschanged', () => pickVoice())
  }
}

function stopKeepAlive() {
  if (keepAlive !== null) window.clearInterval(keepAlive)
  keepAlive = null
}

export function speak(text: string, onEnd?: () => void) {
  const s = synth()
  if (!s || !text.trim() || !isAvailable()) {
    onEnd?.()
    return
  }
  s.cancel()
  stopKeepAlive()
  const mine = ++generation

  const u = new SpeechSynthesisUtterance(text)
  const voice = cached ?? pickVoice()
  if (voice) {
    u.voice = voice
    u.lang = voice.lang
  }
  u.rate = 0.95
  u.pitch = 1.05

  const finish = () => {
    if (mine !== generation) return
    stopKeepAlive()
    set({ status: 'idle', text: null })
    onEnd?.()
  }
  u.onend = finish
  u.onerror = finish

  set({ status: 'speaking', text })
  s.speak(u)

  // Network voices in Chrome cut off after ~15s; a pause/resume pair keeps them
  // going. Local voices don't need it (and would stutter), and it is skipped
  // while the player has deliberately paused.
  if (voice?.localService !== false) return
  keepAlive = window.setInterval(() => {
    if (mine !== generation || state.status !== 'speaking') return
    if (s.speaking && !s.paused) {
      s.pause()
      s.resume()
    }
  }, 10000)
}

export function pause() {
  const s = synth()
  if (!s || state.status !== 'speaking') return
  s.pause()
  set({ ...state, status: 'paused' })
}

export function resume() {
  const s = synth()
  if (!s || state.status !== 'paused') return
  s.resume()
  set({ ...state, status: 'speaking' })
}

export function cancel() {
  generation++
  stopKeepAlive()
  synth()?.cancel()
  if (state.status !== 'idle') set({ status: 'idle', text: null })
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getSnapshot = () => state

/** Playback status for `text`: 'idle' unless this exact text is loaded. */
export function useSpeech(text: string): SpeechStatus {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return current.text === text ? current.status : 'idle'
}

export const speech = { speak, pause, resume, cancel, prime, isAvailable }
