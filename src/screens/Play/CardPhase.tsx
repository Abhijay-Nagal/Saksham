import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import type { AgeBand, Card as CardData } from '@content/types'
import { t } from '@/lib/content'
import { sound } from '@/lib/sound'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface CardPhaseProps {
  card: CardData
  band: AgeBand
  onContinue: () => void
}

/**
 * The reward beat: a dim overlay, a rotating sunburst, and the card flying in
 * with a spin (DESIGN 7, tier 4).
 */
export function CardPhase({ card, band, onContinue }: CardPhaseProps) {
  const [flipped, setFlipped] = useState(false)
  const [hint, setHint] = useState(false)
  const collectCard = useStore((s) => s.collectCard)

  useEffect(() => {
    // The card is the player's as soon as it is revealed (SCREENS Play: card).
    collectCard(card.id)
    sound.star()
    const id = window.setTimeout(() => setHint(true), 1200)
    return () => window.clearTimeout(id)
  }, [card.id, collectCard])

  return (
    // The overlay scrolls; the inner column is at least as tall as the screen
    // and centres itself, so a zoomed-in or short screen scrolls instead of
    // cutting off the top (which plain justify-center on the scroller would).
    <div className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-ink/70">
      <div className="relative flex min-h-full flex-col items-center justify-center overflow-x-hidden px-4 pt-20 pb-10">
      {/* Sunburst */}
      <div
        aria-hidden
        className="anim-sun pointer-events-none absolute top-1/2 left-1/2 size-[820px] max-w-[190vw] -translate-x-1/2 -translate-y-1/2 opacity-40"
        style={{
          animationDuration: '20s',
          background:
            'repeating-conic-gradient(from 0deg, #FFB320 0deg 7deg, transparent 7deg 22deg)',
          maskImage: 'radial-gradient(circle, black 30%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 72%)',
        }}
      />

      <motion.h2
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-h1 relative z-10 mb-4 text-center text-white drop-shadow"
      >
        {t('card.newCard')}
      </motion.h2>

      <motion.div
        initial={{ scale: 0.2, rotate: -360, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 16, duration: 0.9 }}
        className="relative z-10"
      >
        <Card
          card={card}
          band={band}
          width={288}
          flipped={flipped}
          onFlip={setFlipped}
          showFlipHint={false}
        />
      </motion.div>

      {hint && !flipped && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 mt-3 text-[18px] font-bold text-white"
        >
          {t('card.flip')}
        </motion.p>
      )}

      <Button
        size="lg"
        sprite="party"
        onClick={onContinue}
        className="relative z-10 mt-6"
      >
        {t('card.continue')}
      </Button>
      </div>
    </div>
  )
}
