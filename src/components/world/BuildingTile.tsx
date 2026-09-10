import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import type { MapSpot } from '@content/types'
import { cn } from '@/lib/cn'
import type { Stars } from '@/lib/store'
import { Sprite } from '@/components/ui/Sprite'
import { pct } from './TownScenery'

export type TileState = 'done' | 'current' | 'open' | 'locked' | 'teaser' | 'help'

interface BuildingTileProps {
  spot: MapSpot
  state: TileState
  stars: Stars
  onSelect: (spot: MapSpot, el: HTMLElement) => void
  /** Set right after finishing this building — bounce and drop the lock. */
  celebrate?: 'bounce' | 'unlock' | null
}

/** A 96px sticker tile on the town map. States follow DESIGN 6. */
export function BuildingTile({ spot, state, stars, onSelect, celebrate }: BuildingTileProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const inView = useInView(wrapRef, { once: true, amount: 0.3 })
  const [shake, setShake] = useState(false)

  // The lock pops off when this tile is the one that just unlocked.
  const [lockGone, setLockGone] = useState(false)
  useEffect(() => {
    if (celebrate !== 'unlock') return
    const id = window.setTimeout(() => setLockGone(true), 700)
    return () => window.clearTimeout(id)
  }, [celebrate])

  const locked = state === 'locked' || state === 'teaser'
  const showLock = state === 'locked' && !lockGone

  return (
    <motion.div
      ref={wrapRef}
      data-building={spot.id}
      className="absolute z-[5] w-[130px] text-center"
      // Motion owns the transform, so the -50% centring lives here, not in a class.
      style={{ ...pct(spot.x, spot.y), x: '-50%', y: '-50%' }}
      initial={{ scale: 0 }}
      animate={
        celebrate === 'bounce'
          ? { scale: [1, 1.25, 0.95, 1.08, 1] }
          : { scale: inView ? 1 : 0 }
      }
      transition={
        celebrate === 'bounce'
          ? { duration: 0.9, ease: 'easeInOut' }
          : { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }
      }
    >
      {stars > 0 && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[17px] whitespace-nowrap">
          {'⭐'.repeat(stars)}
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        aria-label={
          state === 'locked'
            ? `${spot.title}, locked`
            : state === 'teaser'
              ? `${spot.title}, coming soon`
              : spot.title
        }
        onClick={() => {
          if (state === 'locked') {
            setShake(true)
            window.setTimeout(() => setShake(false), 520)
          }
          if (buttonRef.current) onSelect(spot, buttonRef.current)
        }}
        className={cn(
          'relative mx-auto grid size-24 place-items-center rounded-tile sticker',
          'transition-transform duration-200 ease-spring',
          'md:hover:scale-108 md:hover:-rotate-6',
          state === 'current' && 'bg-marigold anim-pulse',
          state === 'help' && 'bg-peacock',
          state === 'done' && 'bg-white',
          state === 'open' && 'bg-white',
          locked && 'bg-locked opacity-75 grayscale md:hover:scale-100 md:hover:rotate-0',
          shake && 'anim-shake',
        )}
      >
        <Sprite name={spot.sprite} size={54} />

        {state === 'done' && (
          <span
            aria-hidden
            className="anim-spin-slow pointer-events-none absolute -inset-3 rounded-[32px] border-[3px] border-dashed border-marigold"
          />
        )}

        {showLock && (
          <motion.span
            aria-hidden
            className="absolute -right-2 -bottom-2 text-[24px]"
            animate={celebrate === 'unlock' ? { scale: 0, rotate: 220, opacity: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15, ease: 'backIn' }}
          >
            🔒
          </motion.span>
        )}

        {state === 'teaser' && (
          <span className="absolute -top-2.5 -right-3 rotate-6 rounded-chip bg-rani px-1.5 text-[13px] font-bold text-white sticker-sm">
            Soon
          </span>
        )}
      </button>

      <span className="mt-2 inline-block rounded-chip border-2 border-ink bg-white px-2.5 text-[16px] font-extrabold">
        {spot.title}
      </span>

      {state === 'current' && (
        <div aria-hidden className="anim-arrow absolute -bottom-7 left-1/2 -translate-x-1/2 text-[22px]">
          ▼
        </div>
      )}
    </motion.div>
  )
}
