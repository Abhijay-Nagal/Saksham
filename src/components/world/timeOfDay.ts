import { useEffect, useState } from 'react'

/**
 * Time-of-day sky (stretch). The town's sky, hills and light follow the
 * device clock, so a demo at 9pm looks like a night town rather than noon.
 *
 * These are the only raw hex values outside the scenery fills in DESIGN 7;
 * they are a palette for one decorative layer, not UI colour.
 */

export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night'

export interface SkyPalette {
  /** Top-to-bottom sky gradient. */
  sky: string
  /** CSS filter applied to the scenery layers, to sit them in the light. */
  sceneryFilter: string
  /** Buildings glow at night. */
  litWindows: boolean
  /** Night gets stars and lit windows. */
  stars: boolean
  sunSprite: 'sun' | 'moon'
}

export const SKIES: Record<TimeOfDay, SkyPalette> = {
  morning: {
    sky: 'linear-gradient(#FFD9A6 0%, #FFE9C9 32%, #CDEBF4 100%)',
    sceneryFilter: 'saturate(1.05) brightness(1.02) sepia(0.12)',
    litWindows: false,
    stars: false,
    sunSprite: 'sun',
  },
  day: {
    sky: 'linear-gradient(#A9DCEE 0%, #BFE6F2 55%, #DAF2F8 100%)',
    sceneryFilter: 'none',
    litWindows: false,
    stars: false,
    sunSprite: 'sun',
  },
  evening: {
    sky: 'linear-gradient(#F2A25C 0%, #F6C48B 38%, #C9D9E8 100%)',
    sceneryFilter: 'saturate(0.9) brightness(0.9) sepia(0.22)',
    litWindows: true,
    stars: false,
    sunSprite: 'sun',
  },
  night: {
    sky: 'linear-gradient(#1B2447 0%, #2A3566 55%, #46527F 100%)',
    sceneryFilter: 'saturate(0.55) brightness(0.5) hue-rotate(-12deg)',
    litWindows: true,
    stars: true,
    sunSprite: 'moon',
  },
}

export function timeOfDayFor(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 10) return 'morning'
  if (hour >= 10 && hour < 17) return 'day'
  if (hour >= 17 && hour < 20) return 'evening'
  return 'night'
}

/** Re-checks every five minutes, which is plenty for a sky. */
export function useTimeOfDay(): TimeOfDay {
  const [time, setTime] = useState<TimeOfDay>(() => timeOfDayFor(new Date().getHours()))

  useEffect(() => {
    const id = window.setInterval(
      () => setTime(timeOfDayFor(new Date().getHours())),
      5 * 60 * 1000,
    )
    return () => window.clearInterval(id)
  }, [])

  return time
}

/** Deterministic star field, so it doesn't dance between renders. */
export const NIGHT_STARS = Array.from({ length: 34 }, (_, i) => {
  const a = Math.sin((i + 1) * 12.9898) * 43758.5453
  const bx = a - Math.floor(a)
  const b = Math.sin((i + 1) * 78.233) * 12345.6789
  const by = b - Math.floor(b)
  return { x: bx * 100, y: by * 100, size: 2 + (i % 3), delay: (i % 7) * 0.4 }
})
