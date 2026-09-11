import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, animate, motion, useMotionValue } from 'motion/react'
import type { AnimationPlaybackControls } from 'motion/react'
import { t, world } from '@/lib/content'
import { fx } from '@/lib/fx'
import { sound } from '@/lib/sound'
import { Mitthu } from '@/components/avatar/Mitthu'
import { MitthuBird } from '@/components/avatar/MitthuBird'

const { width: W, height: H } = world.map

interface Point {
  x: number
  y: number
}

interface TownMitthuProps {
  /** His perch beside the recommended building, in map design units. */
  home: Point
  /** Where he starts (the building just finished); he flies home from there. */
  start?: Point | null
  /** Hold still while a sheet is open over the map. */
  paused?: boolean
}

/** Sitting on a crown, not inside it. */
const TREE_PERCH_Y = 50
/** Only visit trees about a screen away, so he never vanishes off the bottom. */
const TREE_RANGE_Y = 560

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms))
const rand = (min: number, max: number) => min + Math.random() * (max - min)

/** Long enough to read: about 60ms a character, 4.5s to 12s. */
function readingTime(text: string) {
  return Math.min(12000, Math.max(4500, 1500 + text.length * 60))
}

/**
 * Mitthu in the town. He perches by the recommended building, and every so
 * often flies off to a nearby tree or two, sits a while, and comes home.
 * While he's away a "Call Mitthu back" button floats at the bottom of the
 * screen. Tap him anywhere for a fact, which stays up long enough to read.
 *
 * Flights animate x/y motion values in pixels (transform only), converted
 * from map design units using the map's measured size. The map is measured
 * as this component's own parent: a ref passed down from the map would still
 * be null in this child's layout effect, which runs before the parent's ref
 * is attached.
 */
export function TownMitthu({ home, start, paused = false }: TownMitthuProps) {
  const anchor = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const [flying, setFlying] = useState(false)
  const [away, setAway] = useState(false)
  const [facingRight, setFacingRight] = useState(true)
  const [side, setSide] = useState<'left' | 'right'>('right')
  const [says, setSays] = useState<string | null>(null)
  const [hop, setHop] = useState(false)

  const pos = useRef<Point>(start ?? home)
  const homeRef = useRef(home)
  homeRef.current = home
  const trip = useRef(0)
  const controls = useRef<AnimationPlaybackControls[]>([])
  const timers = useRef<number[]>([])
  const saysTimer = useRef<number | null>(null)
  const pausedRef = useRef(paused)
  pausedRef.current = paused
  const saysRef = useRef(says)
  saysRef.current = says

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  const toPx = useCallback((p: Point) => {
    const map = anchor.current?.parentElement
    const w = map?.clientWidth ?? 0
    const h = map?.clientHeight ?? 0
    return { x: (p.x / W) * w, y: (p.y / H) * h }
  }, [])

  const face = (p: Point) => setSide(p.x < W * 0.56 ? 'right' : 'left')

  // Place him before the first paint, and keep him put when the map resizes.
  useLayoutEffect(() => {
    const place = () => {
      const px = toPx(pos.current)
      x.set(px.x)
      y.set(px.y)
    }
    place()
    face(pos.current)
    const el = anchor.current?.parentElement
    if (!el) return
    const ro = new ResizeObserver(() => {
      if (controls.current.length === 0) place()
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [toPx, x, y])

  const stopFlight = () => {
    controls.current.forEach((c) => c.stop())
    controls.current = []
  }

  /** Fly to `p` along an arc. Resolves false if a newer trip took over. */
  const flyTo = useCallback(
    async (p: Point, id: number): Promise<boolean> => {
      const to = toPx(p)
      const x0 = x.get()
      const y0 = y.get()
      const dist = Math.hypot(to.x - x0, to.y - y0)
      face(p)

      if (dist < 2 || fx.isCalm()) {
        stopFlight()
        x.set(to.x)
        y.set(to.y)
        pos.current = p
        return id === trip.current
      }

      setFacingRight(to.x > x0)
      setFlying(true)
      const duration = Math.min(2.6, Math.max(1.1, dist / 300))
      const peak = Math.min(y0, to.y) - Math.min(90, 28 + dist * 0.2)
      stopFlight()
      const cx = animate(x, [x0, to.x], { duration, ease: 'easeInOut' })
      const cy = animate(y, [y0, peak, to.y], {
        duration,
        times: [0, 0.45, 1],
        ease: ['easeOut', 'easeIn'],
      })
      controls.current = [cx, cy]
      await Promise.all([cx.finished, cy.finished])
      if (id !== trip.current) return false
      controls.current = []
      pos.current = p
      setFlying(false)
      return true
    },
    [toPx, x, y],
  )

  const land = useCallback(() => {
    setHop(true)
    later(() => setHop(false), 520)
  }, [])

  /** Which way he faces while sitting: toward the building at home, else inward. */
  const settle = useCallback((p: Point, atHome: boolean) => {
    setFacingRight(atHome ? true : p.x < W / 2)
  }, [])

  const scheduleRef = useRef<() => void>(() => {})

  const goHome = useCallback(
    async (id: number) => {
      const ok = await flyTo(homeRef.current, id)
      if (!ok) return
      setAway(false)
      settle(homeRef.current, true)
      land()
      scheduleRef.current()
    },
    [flyTo, land, settle],
  )

  const wander = useCallback(async () => {
    const id = ++trip.current
    const h = homeRef.current
    const trees = world.map.trees
      .map((tr) => ({ x: tr.x, y: tr.y - TREE_PERCH_Y }))
      .filter((p) => Math.abs(p.y - h.y) < TREE_RANGE_Y)
      .sort(() => Math.random() - 0.5)
    if (trees.length === 0) return scheduleRef.current()

    const stops = trees.slice(0, Math.random() < 0.45 ? 2 : 1)
    setAway(true)
    for (const stop of stops) {
      if (!(await flyTo(stop, id))) return
      settle(stop, false)
      land()
      await wait(rand(3800, 6200))
      if (id !== trip.current) return
      // Hold on while a fact is still being read.
      while (saysRef.current && id === trip.current) await wait(600)
    }
    if (id === trip.current) await goHome(id)
  }, [flyTo, goHome, land, settle])

  // The idle timer: a trip every 13–22s, only when nothing else is going on.
  scheduleRef.current = () => {
    later(
      () => {
        const busy =
          pausedRef.current || saysRef.current || document.hidden || fx.isCalm()
        if (busy) scheduleRef.current()
        else void wander()
      },
      rand(13000, 22000),
    )
  }

  // Start: fly in from the building just finished, else settle at home.
  useEffect(() => {
    const id = trip.current
    if (start && (start.x !== home.x || start.y !== home.y)) {
      // Moving house, not exploring: no "call back" button for this flight.
      later(() => void goHome(id), 1300)
    } else {
      settle(home, true)
      // The first trip comes a little sooner, so it happens during a demo.
      later(() => {
        if (!pausedRef.current && !saysRef.current && !fx.isCalm()) void wander()
        else scheduleRef.current()
      }, rand(8000, 11000))
    }
    const t = timers.current
    return () => {
      trip.current++
      stopFlight()
      t.forEach(window.clearTimeout)
      if (saysTimer.current) window.clearTimeout(saysTimer.current)
    }
    // Mount only; a changed home is handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The recommended building changed under him: fly over to the new one.
  const lastHome = useRef(home)
  useEffect(() => {
    if (lastHome.current.x === home.x && lastHome.current.y === home.y) return
    lastHome.current = home
    const id = ++trip.current
    void goHome(id)
  }, [home, goHome])

  function onTap() {
    sound.pop()
    const facts = world.mitthuFacts
    let fact = facts[Math.floor(Math.random() * facts.length)]
    if (facts.length > 1) while (fact === saysRef.current) fact = facts[Math.floor(Math.random() * facts.length)]
    setSays(fact)
    if (!flying) land()
    if (saysTimer.current) window.clearTimeout(saysTimer.current)
    saysTimer.current = window.setTimeout(() => setSays(null), readingTime(fact))
  }

  function callBack() {
    sound.pop()
    const id = ++trip.current
    void goHome(id)
  }

  return (
    <>
      <motion.div ref={anchor} className="absolute top-0 left-0 z-[7]" style={{ x, y }}>
        <div className="-translate-x-1/2 -translate-y-1/2">
          <Mitthu
            birdClassName="size-[clamp(40px,6.4cqw,64px)]"
            says={says}
            onClick={onTap}
            hop={hop}
            bubbleSide={side}
            pose={flying ? 'fly' : 'perch'}
            flip={facingRight}
          />
        </div>
      </motion.div>

      {createPortal(
        <AnimatePresence>
          {away && (
            <motion.div
              key="call-back"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="fixed inset-x-0 bottom-24 z-30 flex justify-center px-3 md:bottom-6"
            >
              <button
                type="button"
                onClick={callBack}
                className="flex min-h-12 items-center gap-2 rounded-btn bg-marigold py-1.5 pr-4 pl-2 text-[18px] font-extrabold sticker press"
              >
                <MitthuBird size={40} pose="fly" />
                {t('town.callMitthu', { mascot: world.mascotName })}
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
