import { useNavigate } from 'react-router'
import { t } from '@/lib/content'
import { Button } from '@/components/ui/Button'

/**
 * "Need help?" for the screens outside the app shell (profile picker and
 * onboarding), which have no top bar. The safety rule is that it shows on
 * every screen except the Help Centre itself.
 */
export function FloatingHelp() {
  const navigate = useNavigate()
  return (
    <div className="fixed top-3 right-3 z-30">
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
