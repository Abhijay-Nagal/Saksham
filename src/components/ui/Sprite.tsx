import { useState } from 'react'
import { spriteEmoji } from '@/lib/content'
import { cn } from '@/lib/cn'

interface SpriteProps {
  name: string
  size?: number
  className?: string
  /** Decorative sprites are hidden from assistive tech; give a label otherwise. */
  label?: string
  style?: React.CSSProperties
}

/**
 * A Fluent Emoji 3D PNG from public/assets/fluent, falling back to the native
 * emoji if the file is missing (DESIGN 9).
 */
export function Sprite({ name, size = 40, className, label, style }: SpriteProps) {
  const [failed, setFailed] = useState(false)
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true }

  if (failed) {
    return (
      <span
        {...a11y}
        className={cn('inline-block select-none leading-none text-center', className)}
        style={{ fontSize: size * 0.86, width: size, height: size, lineHeight: `${size}px`, ...style }}
      >
        {spriteEmoji(name)}
      </span>
    )
  }

  return (
    <img
      {...a11y}
      src={`${import.meta.env.BASE_URL}assets/fluent/${name}.png`}
      alt={label ?? ''}
      width={size}
      height={size}
      draggable={false}
      onError={() => setFailed(true)}
      className={cn('inline-block select-none object-contain', className)}
      style={{ width: size, height: size, ...style }}
    />
  )
}
