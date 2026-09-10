import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { cn } from '@/lib/cn'
import { world } from '@/lib/content'
import { fx } from '@/lib/fx'
import { sound } from '@/lib/sound'
import { Sprite } from '@/components/ui/Sprite'
import { NIGHT_STARS, SKIES } from './timeOfDay'
import type { TimeOfDay } from './timeOfDay'

const { width: W, height: H } = world.map

/** Design units → percentage of the map box. */
export function pct(x: number, y: number) {
  return { left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` }
}

/* ---------- Hills (parallax layers) ---------- */

interface HillsProps {
  far: MotionValue<number>
  near: MotionValue<number>
  time?: TimeOfDay
}

export function Hills({ far, near, time = 'day' }: HillsProps) {
  const filter = SKIES[time].sceneryFilter
  return (
    <>
      <motion.div className="pointer-events-none absolute inset-0" style={{ y: far, filter }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="size-full" aria-hidden>
          <ellipse cx="-40" cy="420" rx="200" ry="150" fill="#A9D9A0" stroke="#2A1F3D" strokeWidth="3" />
          <ellipse cx="1060" cy="700" rx="230" ry="170" fill="#A9D9A0" stroke="#2A1F3D" strokeWidth="3" />
          <ellipse cx="-20" cy="980" rx="220" ry="160" fill="#A9D9A0" stroke="#2A1F3D" strokeWidth="3" />
          <ellipse cx="1040" cy="1320" rx="240" ry="150" fill="#A9D9A0" stroke="#2A1F3D" strokeWidth="3" />
        </svg>
      </motion.div>

      <motion.div className="pointer-events-none absolute inset-0" style={{ y: near, filter }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="size-full" aria-hidden>
          <ellipse cx="1040" cy="260" rx="160" ry="120" fill="#8CC57A" stroke="#2A1F3D" strokeWidth="3" />
          <ellipse cx="0" cy="700" rx="150" ry="110" fill="#8CC57A" stroke="#2A1F3D" strokeWidth="3" />
          <ellipse cx="1030" cy="1060" rx="200" ry="120" fill="#8CC57A" stroke="#2A1F3D" strokeWidth="3" />
          <ellipse cx="60" cy="1400" rx="220" ry="130" fill="#8CC57A" stroke="#2A1F3D" strokeWidth="3" />
        </svg>
      </motion.div>

    </>
  )
}

/* ---------- Night sky ---------- */

export function NightStars() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {NIGHT_STARS.map((star, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y * 0.72}%`,
            width: star.size,
            height: star.size,
            opacity: 0.85,
            animation: `twinkle 3.2s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

/* ---------- The winding path ---------- */

export function TownPath({ draw }: { draw: MotionValue<number> }) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 size-full"
      aria-hidden
    >
      <path
        d={world.map.path}
        fill="none"
        stroke="#FFF1CF"
        strokeWidth={26}
        strokeLinecap="round"
      />
      <motion.path
        d={world.map.path}
        fill="none"
        stroke="#FFB320"
        strokeWidth={10}
        strokeLinecap="round"
        style={{ pathLength: draw }}
      />
    </svg>
  )
}

/* ---------- Ambient: clouds, birds, sun, kites ---------- */

export function Clouds({ time = 'day' }: { time?: TimeOfDay }) {
  const [puffed, setPuffed] = useState<number | null>(null)
  const filter = SKIES[time].sceneryFilter

  return (
    <>
      {world.map.clouds.map((cloud, i) => (
        <button
          key={i}
          type="button"
          aria-label="A cloud"
          onClick={(e) => {
            sound.pop()
            setPuffed(i)
            fx.fall(e.currentTarget, 'droplet', 5)
            window.setTimeout(() => setPuffed((v) => (v === i ? null : v)), 520)
          }}
          className="absolute z-[3] -left-[220px]"
          style={{
            top: `${(cloud.y / H) * 100}%`,
            animation: `drift ${cloud.speed}s linear infinite`,
            animationDelay: `${-cloud.speed * (0.15 + i * 0.22)}s`,
          }}
        >
          <span
            className={cn('inline-block transition-transform', puffed === i && 'scale-x-135 scale-y-80')}
            style={{ transitionDuration: '250ms', filter }}
          >
            <Sprite name="cloud" size={0} className="size-[clamp(48px,9cqw,90px)]" />
          </span>
        </button>
      ))}

      {/* Two birds crossing on a wavy path */}
      {[0, 1].map((i) => (
        <div
          key={i}
          className="pointer-events-none absolute z-[3] -left-16"
          style={{
            top: `${18 + i * 44}%`,
            animation: `fly ${16 + i * 4}s linear infinite`,
            animationDelay: `${-i * 7}s`,
            filter,
          }}
        >
          <Sprite name="bird" size={0} className="size-[clamp(18px,3cqw,30px)]" />
        </div>
      ))}
    </>
  )
}

export function Sun({ time = 'day' }: { time?: TimeOfDay }) {
  const [pop, setPop] = useState(false)
  const sprite = SKIES[time].sunSprite
  return (
    <button
      type="button"
      aria-label={sprite === 'moon' ? 'The moon' : 'The sun'}
      onClick={() => {
        sound.pop()
        setPop(true)
        window.setTimeout(() => setPop(false), 400)
      }}
      className="absolute top-6 left-8 z-[4]"
    >
      <span className={cn('anim-sun inline-block', pop && 'scale-125')} style={{ transition: 'transform 300ms var(--ease-spring)' }}>
        <Sprite name={sprite} size={0} className="size-[clamp(42px,7.8cqw,78px)]" />
      </span>
    </button>
  )
}

export function Trees({ time = 'day' }: { time?: TimeOfDay }) {
  const [shaking, setShaking] = useState<number | null>(null)
  const filter = SKIES[time].sceneryFilter

  return (
    <>
      {world.map.trees.map((tree, i) => (
        <button
          key={i}
          type="button"
          aria-label="A tree"
          onClick={(e) => {
            sound.pop()
            setShaking(i)
            fx.fall(e.currentTarget, 'leaf', 4)
            window.setTimeout(() => setShaking((v) => (v === i ? null : v)), 520)
          }}
          className="absolute z-[4] -translate-x-1/2 -translate-y-1/2"
          style={pct(tree.x, tree.y)}
        >
          <span
            className={cn('inline-block', shaking === i && 'anim-tree-shake')}
            style={{ filter }}
          >
            <Sprite name={tree.sprite} size={0} className="size-[clamp(36px,6.4cqw,64px)]" />
          </span>
        </button>
      ))}
    </>
  )
}

export function Kites({ time = 'day' }: { time?: TimeOfDay }) {
  const [looping, setLooping] = useState<number | null>(null)
  const filter = SKIES[time].sceneryFilter

  return (
    <>
      {world.map.kites.map((kite, i) => (
        <button
          key={i}
          type="button"
          aria-label="A kite"
          onClick={() => {
            sound.pop()
            setLooping(i)
            window.setTimeout(() => setLooping((v) => (v === i ? null : v)), 900)
          }}
          className="absolute z-[4] -translate-x-1/2 -translate-y-1/2"
          style={pct(kite.x, kite.y)}
        >
          <motion.span
            className={cn('inline-block', looping !== i && 'anim-sway')}
            style={{ filter }}
            animate={looping === i ? { rotate: 360, y: [0, -40, 0] } : {}}
            transition={{ duration: 0.85, ease: 'easeInOut' }}
          >
            <Sprite name="kite" size={0} className="size-[clamp(30px,5.2cqw,52px)]" />
          </motion.span>
        </button>
      ))}
    </>
  )
}

/* ---------- Hidden marigolds ---------- */

interface MarigoldsProps {
  found: number[]
  onFind: (index: number, el: Element) => void
}

export function Marigolds({ found, onFind }: MarigoldsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  return (
    <>
      {world.map.marigolds.map((m, i) => {
        if (found.includes(i)) return null
        return (
          <button
            key={i}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            aria-label="A hidden marigold"
            onClick={() => {
              const el = refs.current[i]
              if (el) onFind(i, el)
            }}
            // A 48px hit area around a deliberately small 24px flower.
            className="absolute z-[6] grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center opacity-90 transition-transform duration-200 hover:scale-130 hover:rotate-12"
            style={pct(m.x, m.y)}
          >
            <Sprite name="marigold" size={0} className="size-[clamp(16px,2.4cqw,24px)]" />
          </button>
        )
      })}
    </>
  )
}
