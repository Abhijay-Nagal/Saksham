import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import { cn } from '@/lib/cn'
import { sound } from '@/lib/sound'
import { Sprite } from './Sprite'

export type ButtonVariant = 'primary' | 'secondary' | 'help' | 'ghost' | 'danger'
export type ButtonSize = 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  sprite?: string
  fullWidth?: boolean
  align?: 'center' | 'left'
  children?: ReactNode
  ref?: Ref<HTMLButtonElement>
  /** Skip the tap sound — the Help Centre is silent. */
  silent?: boolean
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-marigold text-ink sticker press lift',
  secondary: 'bg-white text-ink sticker press lift',
  help: 'bg-peacock text-white sticker press lift',
  danger: 'bg-rani text-white sticker press lift',
  ghost: 'bg-transparent text-ink-soft hover:text-ink border-0 shadow-none',
}

const SIZES: Record<ButtonSize, string> = {
  md: 'min-h-12 px-5 text-[19px]',
  lg: 'min-h-15 px-7 text-[22px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  sprite,
  fullWidth,
  align = 'center',
  className,
  children,
  onClick,
  silent,
  ref,
  ...rest
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        if (!silent) sound.tap()
        onClick?.(e)
      }}
      className={cn(
        'inline-flex items-center gap-3 rounded-btn font-bold',
        'disabled:opacity-45 disabled:pointer-events-none',
        align === 'left' ? 'justify-start text-left' : 'justify-center',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {sprite && <Sprite name={sprite} size={size === 'lg' ? 32 : 26} className="shrink-0" />}
      {children != null && <span className="min-w-0">{children}</span>}
    </button>
  )
}
