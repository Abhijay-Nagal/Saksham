import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { sound } from '@/lib/sound'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
  children: ReactNode
}

/** A small selectable pill — hair options, quiz topics, band switches. */
export function Chip({ selected, className, children, onClick, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={(e) => {
        sound.tap()
        onClick?.(e)
      }}
      className={cn(
        'inline-flex min-h-12 items-center gap-2 rounded-chip px-3.5 font-bold sticker-sm press-sm',
        selected ? 'bg-marigold text-ink' : 'bg-white text-ink-soft',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
