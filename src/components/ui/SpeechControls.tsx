import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/cn'
import { t } from '@/lib/content'
import { speech, useSpeech } from '@/lib/speech'
import { IconButton } from './IconButton'
import { Sprite } from './Sprite'

interface SpeechControlsProps {
  /** The text these controls read. */
  text: string
  className?: string
  variant?: 'white' | 'marigold'
}

/**
 * Read-aloud controls. The speaker starts reading; while reading it becomes a
 * stop button, and pause/resume and start-again buttons slide in beside it.
 *
 * Clicks never bubble, so the controls can sit inside a tappable panel (the
 * story dialogue) without also advancing it.
 */
export function SpeechControls({ text, className, variant = 'white' }: SpeechControlsProps) {
  const status = useSpeech(text)
  const active = status !== 'idle'

  if (!speech.isAvailable()) return null

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <IconButton
        aria-label={active ? t('speech.stop') : t('story.readAloud')}
        aria-pressed={active}
        variant={active ? 'marigold' : variant}
        onClick={() => (active ? speech.cancel() : speech.speak(text))}
      >
        {active ? <StopIcon /> : <Sprite name="speaker" size={22} />}
      </IconButton>

      <AnimatePresence initial={false}>
        {active && (
          <motion.div
            key="more"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-2"
          >
            <IconButton
              aria-label={status === 'paused' ? t('speech.resume') : t('speech.pause')}
              variant={variant}
              onClick={() => (status === 'paused' ? speech.resume() : speech.pause())}
            >
              {status === 'paused' ? <PlayIcon /> : <PauseIcon />}
            </IconButton>
            <IconButton
              aria-label={t('speech.restart')}
              variant={variant}
              onClick={() => speech.speak(text)}
            >
              <RestartIcon />
            </IconButton>
          </motion.div>
        )}
      </AnimatePresence>

      {status === 'speaking' && (
        <span aria-hidden className="flex h-5 items-end gap-[3px]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="anim-eq w-[4px] rounded-full bg-ink-soft"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      )}
    </div>
  )
}

/* Inline SVG icons: the Unicode media glyphs render as colour emoji on Windows. */

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <rect x="5" y="5" width="14" height="14" rx="3" fill="currentColor" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <rect x="5" y="4" width="5" height="16" rx="2" fill="currentColor" />
      <rect x="14" y="4" width="5" height="16" rx="2" fill="currentColor" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" fill="currentColor" />
    </svg>
  )
}

function RestartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12a8 8 0 1 0 2.4-5.7" />
      <path d="M4 3.5v4.8h4.8" />
    </svg>
  )
}
