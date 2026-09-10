/**
 * A thin wrapper over speechSynthesis (DESIGN 11).
 * Voices load asynchronously, so we listen for `voiceschanged` and re-pick.
 */

let cached: SpeechSynthesisVoice | null = null
let listening = false

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

export function speak(text: string, onEnd?: () => void) {
  const s = synth()
  if (!s || !text.trim() || !isAvailable()) {
    onEnd?.()
    return
  }
  s.cancel()

  const u = new SpeechSynthesisUtterance(text)
  const voice = cached ?? pickVoice()
  if (voice) {
    u.voice = voice
    u.lang = voice.lang
  }
  u.rate = 0.95
  u.pitch = 1.05
  if (onEnd) {
    u.onend = onEnd
    u.onerror = onEnd
  }
  s.speak(u)
}

export function cancel() {
  synth()?.cancel()
}

export const speech = { speak, cancel, prime, isAvailable }
