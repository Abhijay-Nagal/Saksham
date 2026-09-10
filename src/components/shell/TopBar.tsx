import { useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { cn } from '@/lib/cn'
import { t, world } from '@/lib/content'
import { totalStars, useActiveProfile, useSettings, useStore } from '@/lib/store'
import { Sprite } from '@/components/ui/Sprite'
import { Pill } from '@/components/ui/Pill'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

const TABS = [
  { to: '/town', key: 'nav.town', sprite: 'school' },
  { to: '/book', key: 'nav.haqBook', sprite: 'books' },
  { to: '/community', key: 'nav.community', sprite: 'friends' },
  { to: '/me', key: 'nav.me', sprite: 'star' },
]

export function TopBar() {
  const profile = useActiveProfile()
  const settings = useSettings()
  const toggleDemo = useStore((s) => s.toggleDemo)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const pressTimer = useRef<number | null>(null)

  const stars = totalStars(profile)
  const marigolds = profile?.marigolds.length ?? 0

  // Long-press the logo for 2s to toggle demo mode (PRODUCT 6).
  const startPress = () => {
    pressTimer.current = window.setTimeout(() => {
      toggleDemo()
      toast(t('demo.on'), 'sparkles')
    }, 2000)
  }
  const endPress = () => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current)
    pressTimer.current = null
  }

  return (
    <header className="sticky top-0 z-40 border-b-[2.5px] border-ink bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1100px] items-center gap-3 px-3 md:h-18 md:px-5">
        <button
          type="button"
          onPointerDown={startPress}
          onPointerUp={endPress}
          onPointerLeave={endPress}
          onClick={() => navigate('/town')}
          aria-label={world.appName}
          className="flex shrink-0 items-center gap-2 rounded-btn px-1 py-1"
        >
          <Sprite name="parrot" size={34} className="anim-bob" />
          <span className="text-h2 hidden font-extrabold tracking-tight sm:block">
            {world.appName}
          </span>
        </button>

        <nav aria-label="Main" className="mx-auto hidden items-center gap-1 md:flex">
          {TABS.map((tab) => {
            const active = pathname.startsWith(tab.to)
            return (
              <Link
                key={tab.to}
                to={tab.to}
                id={tab.to === '/book' ? 'book-tab' : undefined}
                className={cn(
                  'flex min-h-12 items-center gap-2 rounded-btn px-4 font-bold transition-colors',
                  active ? 'bg-marigold text-ink sticker-sm' : 'text-ink-soft hover:bg-white',
                )}
              >
                <Sprite name={tab.sprite} size={22} />
                {t(tab.key)}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {settings.demo && (
            <span className="rounded-chip bg-rani px-2 py-1 text-[14px] font-bold text-white sticker-sm">
              Demo
            </span>
          )}
          <Pill
            sprite="star"
            value={stars}
            label="Stars"
            className="star-pill"
            tone="marigold"
          />
          <Pill sprite="marigold" value={marigolds} label="Marigolds found" className="marigold-pill hidden sm:inline-flex" />
          <Button
            variant="help"
            onClick={() => navigate('/help')}
            sprite="handshake"
            className="hidden md:inline-flex"
          >
            {t('nav.help')}
          </Button>
          <Button
            variant="help"
            onClick={() => navigate('/help')}
            aria-label={t('nav.help')}
            className="px-3 md:hidden"
          >
            <Sprite name="handshake" size={24} />
          </Button>
        </div>
      </div>
    </header>
  )
}
