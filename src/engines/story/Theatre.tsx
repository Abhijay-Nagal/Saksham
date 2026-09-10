import { AnimatePresence, motion } from 'motion/react'
import type { CastMember, Mood } from '@content/types'
import { cn } from '@/lib/cn'
import { Sprite } from '@/components/ui/Sprite'
import { Backdrop } from './Backdrop'
import { Puppet } from './Puppet'
import type { Scene } from './useStory'

/** Puppet positions by cast count (SCREENS Play: story). */
const LAYOUTS: Record<number, string[]> = {
  0: [],
  1: ['50%'],
  2: ['28%', '72%'],
  3: ['18%', '50%', '82%'],
}

interface TheatreProps {
  scene: Scene
  cast: CastMember[]
  /** The speaking cast id, or 'narrator' / 'mitthu'. */
  speaker: string
  /** True while the dialogue is still typing — the speaker bounces. */
  talking: boolean
  /** Curtains are open when true. */
  open: boolean
}

export function Theatre({ scene, cast, speaker, talking, open }: TheatreProps) {
  const positions = LAYOUTS[Math.min(cast.length, 3)] ?? []

  return (
    // On desktop the theatre is height-driven: the stage takes the space the
    // dialogue and choices leave, and its width follows from the aspect ratio.
    // On mobile it stays width-driven and the page scrolls, which is natural.
    <div
      className="mx-auto flex w-full max-w-full flex-col overflow-hidden rounded-panel sticker md:h-full md:w-auto md:max-w-[1000px] md:aspect-[1.69/1]"
      style={{ background: '#A8274F' }}
    >
      {/* Valance: rani band, marigold trim, scalloped edge */}
      <div className="relative h-9 shrink-0 border-b-[3px] border-marigold bg-rani md:h-11">
        <div
          aria-hidden
          className="absolute inset-x-0 top-full z-30 h-5"
          style={{
            background:
              'radial-gradient(circle at 50% 0, #E2457A 17px, transparent 18px) 0 0/38px 20px repeat-x',
          }}
        />
      </div>

      {/* Stage. `container-type: size` lets the puppets scale in cqh units. */}
      <div
        className="relative mx-4 aspect-4/5 overflow-hidden md:mx-9 md:aspect-auto md:min-h-0 md:flex-1"
        style={{ containerType: 'size' }}
      >
        <Backdrop bg={scene.bg} props={scene.props} />

        {/* Wooden floor strip */}
        <div
          className="absolute inset-x-0 bottom-0 h-[9%] border-t-[3px] border-ink"
          style={{ background: '#C98A4B' }}
        />

        {/* Puppets */}
        {cast.map((member, i) => {
          const mood: Mood = scene.moods[member.id] ?? 'normal'

          return (
            <motion.div
              key={member.id}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="absolute bottom-[9%] z-10"
              style={{ left: positions[i], x: '-50%', transformOrigin: 'bottom center' }}
            >
              <Puppet
                member={member}
                mood={mood}
                index={i}
                speaking={speaker === member.id}
                talking={talking}
              />
            </motion.div>
          )
        })}

        {/* Mitthu pops up from the bottom-right when he speaks */}
        <AnimatePresence>
          {speaker === 'mitthu' && (
            <motion.div
              initial={{ y: 90, opacity: 0, rotate: -14 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 70, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className="absolute right-4 bottom-[8%] z-20"
            >
              <Sprite name="parrot" size={92} className="anim-bob" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Curtains */}
        <div
          aria-hidden
          className={cn(
            'absolute inset-y-0 left-0 z-30 w-[52%] border-r-[3px] border-ink',
            'transition-transform duration-[1100ms] ease-[cubic-bezier(.6,0,.2,1)]',
            open && '-translate-x-[97%]',
          )}
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg,#E2457A 0 22px,#A8274F 22px 30px)',
          }}
        />
        <div
          aria-hidden
          className={cn(
            'absolute inset-y-0 right-0 z-30 w-[52%] border-l-[3px] border-ink',
            'transition-transform duration-[1100ms] ease-[cubic-bezier(.6,0,.2,1)]',
            open && 'translate-x-[97%]',
          )}
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg,#A8274F 0 8px,#E2457A 8px 30px)',
          }}
        />
      </div>

      <div className="h-4 shrink-0 md:h-5" />
    </div>
  )
}
