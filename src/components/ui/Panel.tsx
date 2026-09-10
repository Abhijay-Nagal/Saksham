import type { HTMLAttributes, ReactNode, Ref } from 'react'
import { cn } from '@/lib/cn'

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'white' | 'marigold-soft' | 'peacock-soft' | 'leaf-soft' | 'rani-soft'
  children: ReactNode
  ref?: Ref<HTMLDivElement>
}

const TONES = {
  white: 'bg-white',
  'marigold-soft': 'bg-marigold-soft',
  'peacock-soft': 'bg-peacock-soft',
  'leaf-soft': 'bg-leaf-soft',
  'rani-soft': 'bg-rani-soft',
}

/** A white sticker card — the workhorse container. */
export function Panel({ tone = 'white', className, children, ref, ...rest }: PanelProps) {
  return (
    <div ref={ref} className={cn('rounded-panel p-5 sticker', TONES[tone], className)} {...rest}>
      {children}
    </div>
  )
}
