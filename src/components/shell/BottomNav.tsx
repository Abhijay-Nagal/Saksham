import { Link, useLocation } from 'react-router'
import { cn } from '@/lib/cn'
import { t } from '@/lib/content'
import { Sprite } from '@/components/ui/Sprite'

const TABS = [
  { to: '/town', key: 'nav.town', sprite: 'school' },
  { to: '/book', key: 'nav.book', sprite: 'books' },
  { to: '/community', key: 'nav.community', sprite: 'friends' },
  { to: '/me', key: 'nav.me', sprite: 'star' },
]

/** Mobile-only tab bar. Desktop uses the tabs in the top bar. */
export function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t-[2.5px] border-ink bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden"
    >
      <ul className="mx-auto flex max-w-[520px]">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.to)
          return (
            <li key={tab.to} className="flex-1">
              <Link
                to={tab.to}
                id={tab.to === '/book' ? 'book-tab-mobile' : undefined}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-16 flex-col items-center justify-center gap-0.5 text-[14px] font-bold transition-colors',
                  active ? 'text-ink' : 'text-ink-soft',
                )}
              >
                <span
                  className={cn(
                    'flex size-9 items-center justify-center rounded-chip',
                    active && 'bg-marigold sticker-sm',
                  )}
                >
                  <Sprite name={tab.sprite} size={22} />
                </span>
                {t(tab.key)}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
