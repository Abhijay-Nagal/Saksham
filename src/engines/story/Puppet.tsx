import type { CastMember, Mood } from '@content/types'
import { cn } from '@/lib/cn'
import { Avatar } from '@/components/avatar/Avatar'

/**
 * A stage puppet: a DiceBear head on a cloth body, the way a rod puppet reads
 * from the stalls. Sizes are container-query units so the puppets grow and
 * shrink with the stage rather than the viewport.
 *
 * Kids render at 0.85 scale and adults at 1.0 (DESIGN 8).
 */

/** Body cloth colours, cycled by position so a scene never repeats one. */
const CLOTHS = ['text-rani', 'text-peacock', 'text-leaf', 'text-marigold'] as const

interface PuppetProps {
  member: CastMember
  mood: Mood
  index: number
  speaking: boolean
  talking: boolean
}

export function Puppet({ member, mood, index, speaking, talking }: PuppetProps) {
  const scale = member.role === 'kid' ? 0.85 : 1
  const cloth = CLOTHS[index % CLOTHS.length]

  return (
    <div
      className={cn('flex flex-col items-center', speaking && talking && 'anim-speaker')}
      style={{ transformOrigin: 'bottom center' }}
    >
      <div
        className="flex flex-col items-center"
        style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center' }}
      >
        {/* Head. The mood swap crossfades via a short pop. */}
        <div
          key={mood}
          className="anim-pop relative z-10"
          style={{ animationDuration: '150ms', marginBottom: '-13cqh' }}
        >
          <Avatar
            spec={member.avatar}
            mood={mood}
            size={null}
            className="size-[clamp(64px,38cqh,200px)] drop-shadow-md"
          />
        </div>

        {/* Cloth body with sleeves */}
        <svg
          viewBox="0 0 120 100"
          className={cn('h-[clamp(44px,26cqh,150px)] w-auto', cloth)}
          aria-hidden
        >
          <path
            d="M60 6 C 40 6 30 16 26 30 L 8 44 C 4 47 4 54 8 57 L 22 66 L 22 96 L 98 96 L 98 66 L 112 57 C 116 54 116 47 112 44 L 94 30 C 90 16 80 6 60 6 Z"
            fill="currentColor"
            stroke="#2A1F3D"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* A marigold trim line, so every puppet reads as festive cloth */}
          <path d="M34 96 L 34 62" stroke="#FFB320" strokeWidth="5" strokeLinecap="round" />
          <path d="M86 96 L 86 62" stroke="#FFB320" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>

      <span
        className={cn(
          'mt-1 rounded-chip border-2 border-ink px-2 text-[clamp(12px,4cqh,16px)] font-extrabold whitespace-nowrap',
          speaking ? 'bg-marigold' : 'bg-white',
        )}
      >
        {member.name}
      </span>
    </div>
  )
}
