import { useState } from 'react'
import { motion } from 'motion/react'
import type { Card as CardData } from '@content/types'
import { allBuildings, t, world } from '@/lib/content'
import { useActiveProfile } from '@/lib/store'
import { Card, CardThumb } from '@/components/ui/Card'
import { Sheet } from '@/components/ui/Sheet'
import { Sprite } from '@/components/ui/Sprite'

/** The two "coming soon" town teasers get silhouettes in the album too. */

export function Book() {
  // Read at render, not module load, so it follows the language setting.
  const TEASERS = world.map.spots.filter((s) => s.status === 'locked-teaser')
  const profile = useActiveProfile()
  const [open, setOpen] = useState<CardData | null>(null)

  const owned = profile?.cards ?? []
  const cards = allBuildings.map((b) => ({ card: b.card, title: b.title }))
  const ownedCount = cards.filter((c) => owned.includes(c.card.id)).length

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h1 className="text-h1">{t('book.title')}</h1>
        <p className="text-body font-bold text-ink-soft">
          {t('book.count', { n: ownedCount, total: cards.length })}
        </p>
      </div>

      {ownedCount === 0 && (
        <p className="text-body mb-4 text-ink-soft">{t('book.empty')}</p>
      )}

      <div className="mt-4 grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-3 md:grid-cols-4">
        {cards.map(({ card, title }, i) => {
          const has = owned.includes(card.id)

          if (!has) {
            return (
              <div
                key={card.id}
                className="flex w-full max-w-[180px] flex-col items-center justify-center gap-1.5 rounded-card border-[2.5px] border-dashed border-ink-soft/50 bg-white/60 p-3 text-center"
                style={{ aspectRatio: '3 / 4' }}
              >
                <span aria-hidden className="text-[38px] leading-none opacity-30">
                  ?
                </span>
                <p className="text-body font-extrabold text-ink-soft">{title}</p>
                <p className="text-small font-bold text-ink-soft/70">{t('book.lockedCard')}</p>
              </div>
            )
          }

          return (
            <motion.button
              key={card.id}
              type="button"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 320, damping: 28 }}
              onClick={() => setOpen(card)}
              aria-label={`${card.title}, open card`}
              className="w-full max-w-[180px] rounded-card transition-transform duration-200 ease-spring md:hover:-translate-y-1 md:hover:-rotate-2"
            >
              <CardThumb card={card} width={180} className="w-full" />
            </motion.button>
          )
        })}

        {TEASERS.map((teaser) => (
          <div
            key={teaser.id}
            className="flex w-full max-w-[180px] flex-col items-center justify-center gap-2 rounded-card border-[2.5px] border-dashed border-ink-soft/50 bg-white/60 p-3 text-center"
            style={{ aspectRatio: '3 / 4' }}
          >
            <Sprite name={teaser.sprite} size={44} className="opacity-40 grayscale" />
            <p className="text-small font-bold text-ink-soft">{teaser.title}</p>
            <p className="text-micro text-ink-soft">{t('common.comingSoon')}</p>
          </div>
        ))}
      </div>

      <Sheet open={!!open} onClose={() => setOpen(null)} className="md:max-w-[420px]">
        {open && profile && (
          <div className="flex justify-center pt-2">
            <Card card={open} band={profile.band} width={280} />
          </div>
        )}
      </Sheet>
    </div>
  )
}
