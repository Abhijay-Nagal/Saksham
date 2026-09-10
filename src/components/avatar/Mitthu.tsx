import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/cn'
import { Sprite } from '@/components/ui/Sprite'

interface MitthuProps {
  size?: number
  className?: string
  /** Speech bubble text; null hides the bubble. */
  says?: string | null
  /** Bubble side relative to the parrot. */
  bubbleSide?: 'right' | 'left' | 'top'
  hop?: boolean
  onClick?: () => void
  label?: string
  /** Overrides `size` with a CSS class, so the town can scale him in cqw. */
  spriteClassName?: string
}

/**
 * The mascot. Bobs on a 2.4s loop, hops on demand, and can hold a speech
 * bubble. Interactive only when `onClick` is given.
 */
export function Mitthu({
  size = 56,
  className,
  says,
  bubbleSide = 'right',
  hop,
  onClick,
  label = 'Mitthu the parrot',
  spriteClassName,
}: MitthuProps) {
  const bird = (
    <motion.div
      animate={hop ? { y: [0, -22, 0], rotate: [0, -12, 0] } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(!hop && 'anim-bob')}
    >
      <Sprite
        name="parrot"
        size={spriteClassName ? 0 : size}
        className={spriteClassName}
        label={onClick ? undefined : label}
      />
    </motion.div>
  )

  return (
    <div className={cn('relative inline-flex items-center', className)}>
      {onClick ? (
        <button
          type="button"
          aria-label={label}
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
            initial={{ opacity: 0, scale: 0.7, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className={cn(
              'pointer-events-none absolute z-20 w-max max-w-[240px] rounded-card bg-white px-3 py-2',
              'text-small font-semibold text-ink sticker-sm',
              bubbleSide === 'right' && 'left-full ml-3 origin-left',
              bubbleSide === 'left' && 'right-full mr-3 origin-right',
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
