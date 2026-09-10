import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Sprite } from './Sprite'

export interface ToastMessage {
  id: number
  text: string
  sprite?: string
}

interface ToastApi {
  /** Show a toast for 2.6s (DESIGN 7). */
  toast: (text: string, sprite?: string) => void
}

const ToastContext = createContext<ToastApi>({ toast: () => {} })

export function useToast(): ToastApi {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastMessage[]>([])
  const nextId = useRef(1)

  const toast = useCallback((text: string, sprite?: string) => {
    const id = nextId.current++
    setItems((list) => [...list, { id, text, sprite }])
    window.setTimeout(() => {
      setItems((list) => list.filter((i) => i.id !== id))
    }, 2600)
  }, [])

  const api = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[95] flex flex-col items-center gap-2 px-4 md:bottom-8"
      >
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ y: 28, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 14, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="flex max-w-[min(92vw,520px)] items-center gap-3 rounded-btn bg-marigold px-4 py-3 font-bold text-ink sticker"
            >
              {item.sprite && <Sprite name={item.sprite} size={28} className="shrink-0" />}
              <span className="text-[18px]">{item.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
