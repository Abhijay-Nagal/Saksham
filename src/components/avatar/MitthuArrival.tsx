import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { t, world } from '@/lib/content'
import { fx } from '@/lib/fx'
import { sound } from '@/lib/sound'
import { MitthuBird } from './MitthuBird'

interface MitthuArrivalProps {
  size?: number
  /** Fires once he has landed on the branch (at once in calm mode). */
  onLanded?: () => void
}

/**
 * Mitthu's entrance: he swoops in from the top-left, wings flapping, and
 * lands on a branch in front of the player with a little squash. The branch
 * dips under his weight. Afterwards he's tappable for a happy hop.
 */
export function MitthuArrival({ size = 150, onLanded }: MitthuArrivalProps) {
  const [calm] = useState(() => fx.isCalm())
  const [landed, setLanded] = useState(calm)
  const [hops, setHops] = useState(0)

  // In calm mode he is simply there; still tell the parent he has landed.
  useEffect(() => {
    if (calm) onLanded?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const land = () => {
    if (landed) return
    setLanded(true)
    sound.pop()
    onLanded?.()
  }

  return (
    <div className="relative flex flex-col items-center" style={{ width: size * 1.7 }}>
      <motion.div
        className="relative z-10"
        initial={calm ? false : { x: '-55vw', y: '-45vh' }}
        animate={calm ? undefined : { x: ['-55vw', '-20vw', '0vw'], y: ['-45vh', '-6vh', '0vh'] }}
        transition={{ duration: 1.8, times: [0, 0.62, 1], ease: 'easeOut', delay: 0.15 }}
        onAnimationComplete={land}
      >
        <motion.button
          type="button"
          aria-label={t('mascot.label', { mascot: world.mascotName })}
          disabled={!landed}
          onClick={() => {
            sound.pop()
            setHops((n) => n + 1)
          }}
          key={hops}
          animate={
            hops > 0
              ? { y: [0, -30, 0, -8, 0], rotate: [0, 8, 0, 0, 0] }
              : landed && !calm
                ? { scaleX: [1, 1.12, 0.96, 1], scaleY: [1, 0.86, 1.05, 1] }
                : {}
          }
          transition={{ duration: hops > 0 ? 0.65 : 0.45, ease: 'easeOut' }}
          style={{ transformOrigin: '50% 95%' }}
          className="block rounded-full disabled:cursor-default"
        >
          <MitthuBird size={size} pose={landed ? 'perch' : 'fly'} flip />
        </motion.button>
      </motion.div>

      {/* The branch he lands on; it dips when he arrives. */}
      <motion.svg
        aria-hidden
        viewBox="0 0 240 40"
        className="relative z-0 overflow-visible"
        style={{ width: size * 1.7, marginTop: -size * 0.15, transformOrigin: '10% 50%' }}
        animate={landed && !calm ? { rotate: [0, 3, -1.2, 0] } : {}}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <path d="M44 20 C30 8 22 6 12 8" stroke="var(--color-wood-dark)" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path
          d="M8 22 C60 14 150 13 232 19 C236 19.5 236 27 232 27.5 C150 30 60 31 8 30 C3 30 3 22 8 22 Z"
          fill="var(--color-wood)"
          stroke="var(--color-ink)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M40 24.5 C80 22 130 21.5 190 23" stroke="var(--color-wood-dark)" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M196 20 C204 6 218 2 228 4 C222 14 210 20 196 20 Z" fill="var(--color-leaf)" stroke="var(--color-ink)" strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M24 26 C18 36 8 40 0 38 C4 30 14 26 24 26 Z" fill="var(--color-hill)" stroke="var(--color-ink)" strokeWidth="2.6" strokeLinejoin="round" />
      </motion.svg>
    </div>
  )
}
