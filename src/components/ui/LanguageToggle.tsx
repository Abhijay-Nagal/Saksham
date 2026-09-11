import { cn } from '@/lib/cn'
import { t } from '@/lib/content'
import { sound } from '@/lib/sound'
import { speech } from '@/lib/speech'
import { useSettings, useStore } from '@/lib/store'

interface LanguageToggleProps {
  /** No tap sound; the Help Centre is silent. */
  silent?: boolean
  /** Hide the word and keep only the glyph (tight top bars). */
  compact?: boolean
  className?: string
}

/**
 * Switches between English and Hindi. It names the language you'd switch
 * *to*, in that language ("हिंदी" while in English, "English" while in
 * Hindi), the way Indian government sites do, so a child who can't read the
 * current language can still find it.
 */
export function LanguageToggle({ silent, compact, className }: LanguageToggleProps) {
  const language = useSettings().language
  const setSettings = useStore((s) => s.setSettings)
  const next = language === 'hi' ? 'en' : 'hi'

  return (
    <button
      type="button"
      lang={next}
      aria-label={t('lang.toggleLabel')}
      title={t('lang.toggleLabel')}
      onClick={() => {
        if (!silent) sound.tap()
        speech.cancel()
        setSettings({ language: next })
      }}
      className={cn(
        'inline-flex min-h-12 min-w-12 items-center justify-center gap-1.5 rounded-btn bg-white px-2.5 text-[17px] font-extrabold whitespace-nowrap text-ink sticker press',
        className,
      )}
    >
      <span
        aria-hidden
        className="grid size-7 shrink-0 place-items-center rounded-full bg-peacock-soft text-[16px] leading-none font-extrabold text-peacock"
      >
        {next === 'hi' ? 'अ' : 'A'}
      </span>
      <span className={cn(compact && 'sr-only')}>{t('lang.toggle')}</span>
    </button>
  )
}
