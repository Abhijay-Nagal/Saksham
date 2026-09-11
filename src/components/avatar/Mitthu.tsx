import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/cn'
import { t, world } from '@/lib/content'
import { MitthuBird } from './MitthuBird'
import type { MitthuPose } from './MitthuBird'

interface MitthuProps {
  size?: number
  className?: string
  /** Speech bubble text; null hides the bubble. */
  says?: string | null
  /** Bubble side relative to the parrot. */
  bubbleSide?: 'right' | 'left' | 'top'
  /** A happy hop, played whenever this flips to true. */
  hop?: boolean
  onClick?: () => void
  label?: string
  /** Sizes the bird with a CSS class instead of `size` (the town uses cqw). */
  birdClassName?: string
  pose?: MitthuPose
  /** Face right instead of left. */
  flip?: boolean
}

/**
 * The mascot with an optional speech bubble. The bird itself (MitthuBird)
 * breathes, blinks, tilts his head and stretches his wings on his own; this
 * adds the tap hop and the bubble. Interactive only when `onClick` is given.
 */
export function Mitthu({
  size = 56,
  className,
  says,
  bubbleSide = 'right',
  hop,
  onClick,
  label,
  birdClassName,
  pose = 'perch',
  flip,
}: MitthuProps) {
  const name = label ?? t('mascot.label', { mascot: world.mascotName })

  const bird = (
    <motion.div
      animate={hop ? { y: [0, -22, 0], rotate: [0, flip ? 12 : -12, 0], scale: [1, 1.08, 1] } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <MitthuBird
        size={birdClassName ? 0 : size}
        className={birdClassName}
        pose={pose}
        flip={flip}
        label={onClick ? undefined : name}
      />
    </motion.div>
  )

  return (
    <div className={cn('relative inline-flex items-center', className)}>
      {onClick ? (
        <button
          type="button"
          aria-label={name}
          onClick={onClick}
          className="rounded-full transition-transform duration-150 ease-spring active:scale-90"
        >
          {bird}
        </button>
      ) : (
        bird
      )}

      <AnimatePresence>
        {says && (
          <motion.div
            key={says}
            role="status"
            initial={{ opacity: 0, scale: 0.7, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className={cn(
              'pointer-events-none absolute z-20 w-max max-w-[min(260px,40cqw)] min-w-[150px] rounded-card bg-white px-3 py-2',
              'text-small font-semibold text-ink sticker-sm',
              bubbleSide === 'right' && 'left-full ml-2 origin-left',
              bubbleSide === 'left' && 'right-full mr-2 origin-right',
              bubbleSide === 'top' && 'bottom-full left-1/2 mb-3 -translate-x-1/2 origin-bottom',
            )}
          >
            {says}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
