import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { t } from '@/lib/content'
import { speech } from '@/lib/speech'
import { useSettings } from '@/lib/store'
import { MitthuBird } from '@/components/avatar/MitthuBird'
import { SpeechControls } from '@/components/ui/SpeechControls'

interface DialogueBoxProps {
  /** Nameplate text; empty for the narrator. */
  speakerName: string
  variant: 'normal' | 'narrator' | 'mitthu'
  text: string
  /** Called when the typewriter finishes. */
  onTyped: (done: boolean) => void
  /** Tap anywhere to complete typing, then to continue. */
  onTap: () => void
  /** Hide the ▶ hint when choices or a button follow instead. */
  showContinue: boolean
}

const CHAR_MS = 28

export function DialogueBox({
  speakerName,
  variant,
  text,
  onTyped,
  onTap,
  showContinue,
}: DialogueBoxProps) {
  const [shown, setShown] = useState(0)
  const done = shown >= text.length
  const settings = useSettings()
  const typedRef = useRef(onTyped)
  typedRef.current = onTyped
  const timer = useRef<number | null>(null)

  const stopTyping = () => {
    if (timer.current !== null) window.clearInterval(timer.current)
    timer.current = null
  }

  // Typewriter. Calm mode shows the whole line at once.
  useEffect(() => {
    setShown(0)
    if (document.documentElement.hasAttribute('data-calm')) {
      setShown(text.length)
      return
    }
    let i = 0
    timer.current = window.setInterval(() => {
      i += 1
      setShown(i)
      if (i >= text.length) stopTyping()
    }, CHAR_MS)
    return stopTyping
  }, [text])

  useEffect(() => {
    typedRef.current(done)
  }, [done])

  // Read each node aloud when narration is on; always cancel on change/unmount.
  useEffect(() => {
    speech.cancel()
    if (settings.narration) speech.speak(text)
    return () => speech.cancel()
  }, [text, settings.narration])

  // The first tap finishes the line at once (the typewriter must stop, or it
  // would carry on overwriting it); the next tap continues.
  function handleTap() {
    if (!done) {
      stopTyping()
      setShown(text.length)
    } else {
      onTap()
    }
  }

  return (
    // The whole panel is the tap target. The inner <button> keeps it reachable
    // by keyboard; its click bubbles up here, so it needs no handler of its own.
    <div
      onClick={handleTap}
      className={cn(
        'relative cursor-pointer rounded-panel px-5 pt-5 pb-3 sticker select-none',
        variant === 'mitthu' ? 'bg-marigold-soft' : 'bg-white',
      )}
    >
      {/* Nameplate */}
      {variant !== 'narrator' && (
        <span className="absolute -top-3.5 left-5 inline-flex items-center gap-1.5 rounded-chip border-2 border-ink bg-marigold px-2.5 py-0.5 text-[16px] font-extrabold">
          {variant === 'mitthu' && <MitthuBird size={22} still />}
          {speakerName}
        </span>
      )}

      <button
        type="button"
        className="block w-full cursor-pointer text-left"
        aria-label={done ? t('story.tapToContinue') : t('story.showWholeLine')}
      >
        {/* The full line is rendered invisibly to reserve exactly its own
            height, so the box never jumps as the text types and never leaves
            dead space on a short line. */}
        <p data-dialogue className="text-dialogue relative max-w-[60ch] text-ink">
          <span aria-hidden className="invisible">
            {text}
          </span>
          <span aria-live="polite" className="absolute inset-0">
            {text.slice(0, shown)}
            {!done && <span className="opacity-40">▍</span>}
          </span>
        </p>
      </button>

      <div className="mt-2 flex min-h-12 items-center justify-between gap-3">
        <SpeechControls text={text} />

        {done && showContinue && (
          <span className="text-small animate-pulse font-bold text-ink-soft">
            {t('story.tapToContinue')} ▶
          </span>
        )}
      </div>
    </div>
  )
}
