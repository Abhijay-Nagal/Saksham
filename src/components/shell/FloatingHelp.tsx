import { useNavigate } from 'react-router'
import { t } from '@/lib/content'
import { Button } from '@/components/ui/Button'
import { LanguageToggle } from '@/components/ui/LanguageToggle'

/**
 * "Need help?" for the screens outside the app shell (profile picker and
 * onboarding), which have no top bar. The safety rule is that it shows on
 * every screen except the Help Centre itself. The language switch rides
 * along, so a child can pick Hindi before making a player.
 */
export function FloatingHelp() {
  const navigate = useNavigate()
  return (
    <div className="fixed top-3 right-3 z-30 flex items-center gap-2">
      {/* Glyph only on phones, so it clears the onboarding progress dots. */}
      <span className="inline-flex sm:hidden">
        <LanguageToggle compact />
      </span>
      <span className="hidden sm:inline-flex">
        <LanguageToggle />
      </span>
      <Button
        variant="help"
        sprite="handshake"
        aria-label={t('nav.help')}
        onClick={() => navigate('/help')}
        className="px-3 sm:px-5"
      >
        <span className="hidden sm:inline">{t('nav.help')}</span>
      </Button>
    </div>
  )
}
