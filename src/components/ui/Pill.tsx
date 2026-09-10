import { useEffect, useRef, useState } from 'react'
import type { Ref } from 'react'
import { cn } from '@/lib/cn'
import { Sprite } from './Sprite'

interface PillProps {
  sprite: string
  value: number | string
  label: string
  className?: string
  /** fx.flyTo targets this node, so the caller keeps the ref. */
  ref?: Ref<HTMLDivElement>
  tone?: 'white' | 'marigold'
}

/**
 * A counter chip (stars, marigolds). It bumps when the value changes so a
 * fly-to lands on something that visibly reacts.
 */
export function Pill({ sprite, value, label, className, ref, tone = 'white' }: PillProps) {
  const [bump, setBump] = useState(false)
  const previous = useRef(value)

  useEffect(() => {
    if (previous.current === value) return
    previous.current = value
    setBump(true)
    const id = window.setTimeout(() => setBump(false), 420)
    return () => window.clearTimeout(id)
  }, [value])

  return (
    <div
      ref={ref}
      aria-label={`${label}: ${value}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-chip px-2.5 py-1 font-bold tabular-nums sticker-sm',
        'transition-transform duration-300 ease-spring',
        tone === 'marigold' ? 'bg-marigold text-ink' : 'bg-white text-ink',
        bump && 'scale-130',
        className,
      )}
    >
      <Sprite name={sprite} size={22} />
      <span aria-hidden>{value}</span>
    </div>
  )
}
