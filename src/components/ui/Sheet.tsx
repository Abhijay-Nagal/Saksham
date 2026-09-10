import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/cn'
import { IconButton } from './IconButton'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
  /** Hide the ✕ when the sheet has its own dismiss button. */
  hideClose?: boolean
}

/**
 * A bottom sheet on mobile, a centred modal on desktop. Springs in, closes on
 * backdrop tap or Esc, and traps focus loosely by moving focus inside on open.
 */
export function Sheet({ open, onClose, title, children, className, hideClose }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const id = window.setTimeout(() => panelRef.current?.focus(), 60)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.clearTimeout(id)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <motion.button
            type="button"
            aria-label="Close"
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-ink/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className={cn(
              'relative w-full max-w-[560px] rounded-t-panel bg-white p-6 pb-8 sticker outline-none',
              'max-h-[88dvh] overflow-y-auto md:rounded-panel md:pb-6',
              className,
            )}
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30, duration: 0.3 }}
          >
            {!hideClose && (
              <IconButton
                aria-label="Close"
                onClick={onClose}
                className="absolute top-4 right-4 z-10"
              >
                ✕
              </IconButton>
            )}
            {title && <h2 className="text-h2 mb-3 pr-14">{title}</h2>}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
