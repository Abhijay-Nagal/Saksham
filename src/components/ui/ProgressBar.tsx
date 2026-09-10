import { cn } from '@/lib/cn'
import { Sprite } from './Sprite'

interface ProgressBarProps {
  /** 0..1 */
  value: number
  label?: string
  /** The quiz variant walks Mitthu along the bar. */
  mitthu?: boolean
  className?: string
  tone?: 'marigold' | 'leaf' | 'peacock'
}

const TONES = {
  marigold: 'bg-marigold',
  leaf: 'bg-leaf',
  peacock: 'bg-peacock',
}

/** A chunky rounded progress bar. */
export function ProgressBar({
  value,
  label,
  mitthu,
  className,
  tone = 'marigold',
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100

  return (
    <div className={cn('w-full', className)}>
      {label && <p className="text-small mb-1.5 font-bold text-ink-soft">{label}</p>}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-label={label}
        className={cn('relative h-5 rounded-full bg-white sticker-sm', mitthu && 'mt-6')}
      >
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-spring',
            TONES[tone],
          )}
          style={{ width: `${pct}%` }}
        />
        {mitthu && (
          <div
            className="absolute -top-6 transition-[left] duration-500 ease-spring"
            style={{ left: `calc(${pct}% - 16px)` }}
          >
            <Sprite name="parrot" size={32} className="anim-bob" />
          </div>
        )}
      </div>
    </div>
  )
}
