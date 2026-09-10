import { useState } from 'react'
import { spriteEmoji } from '@/lib/content'
import { cn } from '@/lib/cn'

interface SpriteProps {
  name: string
  /** Pixel size. Pass 0 to let a CSS class size it (the town scales in cqw). */
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
  const sized = size > 0
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true }

  if (failed) {
    return (
      <span
        {...a11y}
        className={cn('inline-block select-none leading-none text-center', className)}
        style={
          sized
            ? { fontSize: size * 0.86, width: size, height: size, lineHeight: `${size}px`, ...style }
            : { fontSize: '80cqh', lineHeight: 1, ...style }
        }
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
      width={sized ? size : undefined}
      height={sized ? size : undefined}
      draggable={false}
      onError={() => setFailed(true)}
      className={cn('inline-block select-none object-contain', className)}
      style={sized ? { width: size, height: size, ...style } : style}
    />
  )
}
