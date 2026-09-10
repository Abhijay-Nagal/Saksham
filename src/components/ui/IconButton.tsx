import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import { cn } from '@/lib/cn'
import { sound } from '@/lib/sound'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: these buttons only ever show an icon. */
  'aria-label': string
  variant?: 'white' | 'marigold' | 'peacock' | 'ghost'
  children: ReactNode
  ref?: Ref<HTMLButtonElement>
  silent?: boolean
}

const VARIANTS = {
  white: 'bg-white text-ink sticker press',
  marigold: 'bg-marigold text-ink sticker press',
  peacock: 'bg-peacock text-white sticker press',
  ghost: 'bg-transparent text-ink-soft hover:text-ink',
}

/** A 48px round sticker button. */
export function IconButton({
  variant = 'white',
  className,
  children,
  onClick,
  silent,
  ref,
  ...rest
}: IconButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        if (!silent) sound.tap()
        onClick?.(e)
      }}
      className={cn(
        'inline-flex size-12 shrink-0 items-center justify-center rounded-full text-[20px] leading-none',
        'disabled:opacity-45 disabled:pointer-events-none',
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
