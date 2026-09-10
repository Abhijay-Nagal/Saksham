import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { fx } from '@/lib/fx'
import { sound } from '@/lib/sound'

const CURTAIN_STRIPES = 'repeating-linear-gradient(90deg,#E2457A 0 22px,#A8274F 22px 30px)'

/** Routes the wipe never plays for: Help must simply appear (safety rule). */
const NO_WIPE = ['/help']

function topLevel(pathname: string): string {
  return '/' + pathname.split('/')[1]
}

/**
 * A rani curtain wipe between top-level routes (DESIGN 7). Two panels slide in
 * (300ms), the route has already swapped underneath, then they slide out
 * (400ms). Disabled under calm mode and never used for the Help Centre.
 */
export function CurtainTransition() {
  const { pathname } = useLocation()
  const previous = useRef(topLevel(pathname))
  const [wiping, setWiping] = useState(false)

  useEffect(() => {
    const next = topLevel(pathname)
    const from = previous.current
    previous.current = next
    if (from === next) return
    if (fx.isCalm() || NO_WIPE.includes(next) || NO_WIPE.includes(from)) return

    setWiping(true)
    sound.whoosh()
    const id = window.setTimeout(() => setWiping(false), 320)
    return () => window.clearTimeout(id)
  }, [pathname])

  return (
    <AnimatePresence>
      {wiping && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 border-r-[3px] border-ink"
            style={{ backgroundImage: CURTAIN_STRIPES }}
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '-100%', transition: { duration: 0.4, ease: [0.6, 0, 0.2, 1] } }}
            transition={{ duration: 0.3, ease: [0.6, 0, 0.2, 1] }}
          />
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2 border-l-[3px] border-ink"
            style={{ backgroundImage: CURTAIN_STRIPES }}
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%', transition: { duration: 0.4, ease: [0.6, 0, 0.2, 1] } }}
            transition={{ duration: 0.3, ease: [0.6, 0, 0.2, 1] }}
          />
        </div>
      )}
    </AnimatePresence>
  )
}
