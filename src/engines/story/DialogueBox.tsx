import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { t } from '@/lib/content'
import { speech } from '@/lib/speech'
import { useSettings } from '@/lib/store'
import { IconButton } from '@/components/ui/IconButton'
import { Sprite } from '@/components/ui/Sprite'

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

  // Typewriter. Calm mode shows the whole line at once.
  useEffect(() => {
    setShown(0)
    if (document.documentElement.hasAttribute('data-calm')) {
      setShown(text.length)
      return
    }
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setShown(i)
      if (i >= text.length) window.clearInterval(id)
    }, CHAR_MS)
    return () => window.clearInterval(id)
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

  return (
    <div
      className={cn(
        'relative rounded-panel p-5 pt-6 sticker',
        variant === 'mitthu' ? 'bg-marigold-soft' : 'bg-white',
      )}
    >
      {/* Nameplate */}
      {variant !== 'narrator' && (
        <span
          className={cn(
            'absolute -top-3.5 left-5 inline-flex items-center gap-1.5 rounded-chip border-2 border-ink px-2.5 py-0.5 text-[16px] font-extrabold',
            variant === 'mitthu' ? 'bg-marigold' : 'bg-marigold',
          )}
        >
          {variant === 'mitthu' && <Sprite name="parrot" size={20} />}
          {speakerName}
        </span>
      )}

      <button
        type="button"
        onClick={() => {
          if (!done) setShown(text.length)
          else onTap()
        }}
        className="block w-full cursor-pointer text-left"
        aria-label={done ? t('story.tapToContinue') : 'Show the whole line'}
      >
        <p
          aria-live="polite"
          className="text-dialogue min-h-[3.6em] max-w-[60ch] text-ink"
        >
          {text.slice(0, shown)}
          {!done && <span className="opacity-40">▍</span>}
        </p>
      </button>

      <div className="mt-2 flex items-center justify-between gap-3">
        <IconButton
          aria-label={t('story.readAloud')}
          onClick={() => speech.speak(text)}
          variant="white"
          className="size-11"
        >
          <Sprite name="speaker" size={22} />
        </IconButton>

        {done && showContinue && (
          <span className="text-small animate-pulse font-bold text-ink-soft">
            {t('story.tapToContinue')} ▶
          </span>
        )}
      </div>
    </div>
  )
}
