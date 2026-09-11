/**
 * WebAudio sound effects. No audio files ship with the app; every sound is
 * synthesised. Recipes come from DESIGN 10.
 *
 * The AudioContext can only start after a user gesture, so `unlock()` is wired
 * to the first pointer/key event in App.
 */

import { useStore } from './store'

let ctx: AudioContext | null = null
/** No context until the first gesture: creating one earlier only logs a
    browser warning and stays suspended (e.g. Mitthu landing on page load). */
let gestured = false
/** Gentle-tone buildings play at half gain. */
let gainScale = 1

type Ctor = typeof AudioContext

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined' || !gestured) return null
  if (!ctx) {
    const Ctor: Ctor | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext
    if (!Ctor) return null
    try {
      ctx = new Ctor()
    } catch {
      return null
    }
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function enabled(): boolean {
  return useStore.getState().settings.sound
}

interface ToneOptions {
  type?: OscillatorType
  from: number
  to?: number
  duration: number
  gain?: number
  delay?: number
}

function tone({ type = 'sine', from, to, duration, gain = 0.12, delay = 0 }: ToneOptions) {
  const ac = getCtx()
  if (!ac) return
  const t0 = ac.currentTime + delay
  const osc = ac.createOscillator()
  const amp = ac.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(from, t0)
  if (to !== undefined && to !== from) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + duration)
  }

  const peak = Math.max(0.0001, gain * gainScale)
  amp.gain.setValueAtTime(0.0001, t0)
  amp.gain.exponentialRampToValueAtTime(peak, t0 + Math.min(0.02, duration / 3))
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)

  osc.connect(amp).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

function noise(duration: number, gain = 0.09, centre = 1200) {
  const ac = getCtx()
  if (!ac) return
  const frames = Math.floor(ac.sampleRate * duration)
  const buffer = ac.createBuffer(1, frames, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1

  const src = ac.createBufferSource()
  src.buffer = buffer

  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = centre
  filter.Q.value = 0.8

  const amp = ac.createGain()
  const t0 = ac.currentTime
  amp.gain.setValueAtTime(gain * gainScale, t0)
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)

  src.connect(filter).connect(amp).connect(ac.destination)
  src.start(t0)
}

/** Call from the first user gesture so the context is running when we need it. */
export function unlock() {
  gestured = true
  getCtx()
}

/** Gentle-tone buildings (Home) halve every gain and skip the whoosh. */
export function setGentle(gentle: boolean) {
  gainScale = gentle ? 0.5 : 1
}

export const sound = {
  unlock,
  setGentle,

  tap() {
    if (!enabled()) return
    tone({ type: 'sine', from: 520, to: 780, duration: 0.07, gain: 0.12 })
  },

  pop() {
    if (!enabled()) return
    tone({ type: 'triangle', from: 300, to: 900, duration: 0.06, gain: 0.11 })
  },

  correct() {
    if (!enabled()) return
    const notes = [523.25, 659.25, 783.99] // C5 E5 G5
    notes.forEach((f, i) =>
      tone({ type: 'triangle', from: f, duration: 0.09, gain: 0.11, delay: i * 0.09 }),
    )
  },

  wrong() {
    if (!enabled()) return
    tone({ type: 'sine', from: 330, to: 220, duration: 0.18, gain: 0.08 })
  },

  star() {
    if (!enabled()) return
    tone({ type: 'sine', from: 1320, duration: 0.15, gain: 0.09 })
    tone({ type: 'sine', from: 1760, duration: 0.15, gain: 0.07, delay: 0.02 })
  },

  whoosh() {
    if (!enabled() || gainScale < 1) return
    noise(0.25, 0.09, 1100)
  },

  unlockChime() {
    if (!enabled()) return
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((f, i) =>
      tone({ type: 'triangle', from: f, duration: 0.12, gain: 0.1, delay: i * 0.1 }),
    )
  },
}
