import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { t, world } from '@/lib/content'
import { LogoMark } from '@/components/brand/Logo'
import { markSplashDone } from '@/lib/splash'
import { useStore } from '@/lib/store'

/** How long the splash holds after Mitthu lands, and its hard ceiling. */
const HOLD_MS = 1700
const MAX_MS = 4400
const CALM_MS = 900

function isCalm() {
  return (
    useStore.getState().settings.calmMotion ||
    document.documentElement.hasAttribute('data-calm') ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * The brand moment on every load: the shield pops in, the book opens, Mitthu
 * flies in and lands on it, and the name rises letter by letter. About two
 * seconds, and a tap skips it.
 *
 * Never shown over the Help Centre: a child who opens or refreshes help must
 * reach it at once, and it has to stay calm.
 */
export function Splash() {
  const [show, setShow] = useState(() => !window.location.hash.startsWith('#/help'))
  const [calm] = useState(isCalm)

  useEffect(() => {
    if (!show) {
      markSplashDone()
      return
    }
    const id = window.setTimeout(() => setShow(false), calm ? CALM_MS : MAX_MS)
    return () => window.clearTimeout(id)
  }, [show, calm])

  const letters = Array.from(world.appName)

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          role="presentation"
          onClick={() => setShow(false)}
          className="fixed inset-0 z-[200] flex cursor-pointer flex-col items-center justify-center gap-6 bg-paper px-4"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: calm ? 1 : 1.04 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <LogoMark
            size={148}
            intro={!calm}
            onLanded={() => window.setTimeout(() => setShow(false), HOLD_MS)}
          />

          <h1 aria-label={world.appName} className="flex text-[56px] leading-none font-extrabold tracking-tight text-ink md:text-[72px]">
            {letters.map((ch, i) => (
              <motion.span
                key={i}
                aria-hidden
                initial={calm ? false : { y: 26, opacity: 0, rotate: -8 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ delay: 0.45 + i * 0.06, type: 'spring', stiffness: 420, damping: 18 }}
                className={i === 0 ? 'text-rani' : undefined}
              >
                {ch}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={calm ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.4 }}
            className="text-body -mt-2 text-center font-semibold text-ink-soft"
          >
            {t('splash.tagline')}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
