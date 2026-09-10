import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion } from 'motion/react'
import type { Building } from '@content/types'
import { t, world } from '@/lib/content'
import { fx } from '@/lib/fx'
import { sound } from '@/lib/sound'
import type { Stars } from '@/lib/store'
import { useActiveProfile } from '@/lib/store'
import { Avatar } from '@/components/avatar/Avatar'
import { Button } from '@/components/ui/Button'
import { Panel } from '@/components/ui/Panel'
import { Sprite } from '@/components/ui/Sprite'
import { HaqCardThumb } from '@/components/ui/HaqCard'
import { useToast } from '@/components/ui/Toast'

interface ResultsPhaseProps {
  building: Building
  stars: Stars
  unlocked: string | null
  newBadges: string[]
  onReplayGame: () => void
}

export function ResultsPhase({
  building,
  stars,
  unlocked,
  newBadges,
  onReplayGame,
}: ResultsPhaseProps) {
  const navigate = useNavigate()
  const profile = useActiveProfile()
  const { toast } = useToast()
  const [shown, setShown] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)
  const gentle = building.tone === 'gentle'

  // Stars appear one by one, 300ms apart.
  useEffect(() => {
    const timers: number[] = []
    for (let i = 1; i <= stars; i++) {
      timers.push(
        window.setTimeout(() => {
          setShown(i)
          sound.star()
        }, 400 + i * 300),
      )
    }

    timers.push(
      window.setTimeout(
        () => {
          const root = cardRef.current
          if (gentle) fx.softSparkle(root)
          else fx.confetti(root)
        },
        500 + stars * 300,
      ),
    )

    // The card thumbnail flies to the Haq Book tab.
    timers.push(
      window.setTimeout(
        () => {
          const tab =
            (document.querySelector('#book-tab') as HTMLElement | null)?.offsetParent != null
              ? document.querySelector('#book-tab')
              : document.querySelector('#book-tab-mobile')
          fx.flyTo(cardRef.current, tab, building.card.sprite, 1, { size: 42 })
        },
        900 + stars * 300,
      ),
    )

    return () => timers.forEach(window.clearTimeout)
  }, [stars, gentle, building.card.sprite])

  // Badge toasts. Guarded: effects run twice under StrictMode in development,
  // and a badge should never be announced twice.
  const badgesShown = useRef(false)
  useEffect(() => {
    if (badgesShown.current) return
    badgesShown.current = true
    newBadges.forEach((id, i) => {
      const badge = world.badges.find((b) => b.id === id)
      if (!badge) return
      window.setTimeout(
        () => toast(t('results.badge', { badge: badge.title }), badge.sprite),
        1400 + i * 900,
      )
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const unlockedTitle = world.map.spots.find((s) => s.id === unlocked)?.title

  return (
    <div className="mx-auto max-w-[720px] pb-10 text-center">
      <h1 className="text-display">{t('results.title')}</h1>

      {profile && (
        <Avatar
          spec={profile.avatar}
          mood="proud"
          size={116}
          framed
          className="anim-bob-soft mx-auto mt-4"
          name={profile.name}
          headwearColor={profile.headwearColor}
        />
      )}

      {/* Star slots */}
      <div className="mt-5 flex justify-center gap-3">
        {[1, 2, 3].map((slot) => (
          <motion.div
            key={slot}
            initial={{ scale: 0.85 }}
            animate={shown >= slot ? { scale: [0, 1.3, 1], rotate: [0, 22, 0] } : { scale: 0.85 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="grid size-16 place-items-center rounded-tile border-[2.5px] border-ink bg-white shadow-pop"
          >
            {shown >= slot ? (
              <Sprite name="star" size={38} />
            ) : (
              <span aria-hidden className="text-[30px] opacity-20 grayscale">
                ⭐
              </span>
            )}
          </motion.div>
        ))}
      </div>

      <p className="text-h2 mt-3">
        {stars === 1 ? t('results.starsOne') : t('results.stars', { n: stars })}
      </p>

      <div ref={cardRef} className="mt-6 flex flex-col items-center gap-2">
        <HaqCardThumb card={building.card} width={150} />
        <p className="text-small font-bold text-ink-soft">{t('results.cardEarned')}</p>
      </div>

      {unlockedTitle && (
        <Panel tone="marigold-soft" className="mt-6 flex items-center justify-center gap-3">
          <Sprite name="party" size={32} />
          <p className="text-body font-bold">{t('results.unlocked', { building: unlockedTitle })}</p>
        </Panel>
      )}

      {gentle && (
        <Panel tone="peacock-soft" className="mt-6 text-left">
          <p className="text-body">{t('results.gentleNote')}</p>
          <Link to="/help" className="text-body font-bold text-peacock underline">
            {t('nav.help')}
          </Link>
        </Panel>
      )}

      <div className="mt-8 flex flex-col items-center gap-3">
        <Button
          size="lg"
          sprite="school"
          onClick={() =>
            navigate('/town', { state: { justCompleted: building.id, unlocked } })
          }
        >
          {t('results.backToTown')}
        </Button>
        <Button variant="ghost" onClick={onReplayGame}>
          {t('results.tryAgain')}
        </Button>
      </div>
    </div>
  )
}
