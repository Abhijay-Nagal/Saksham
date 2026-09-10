import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useScroll, useTransform } from 'motion/react'
import type { MapSpot } from '@content/types'
import { t, world } from '@/lib/content'
import { fx } from '@/lib/fx'
import { sound } from '@/lib/sound'
import {
  progressOf,
  recommendedBuilding,
  unlockedBuildings,
  useActiveProfile,
  useSettings,
  useStore,
} from '@/lib/store'
import { useToast } from '@/components/ui/Toast'
import { Mitthu } from '@/components/avatar/Mitthu'
import { BuildingTile } from '@/components/world/BuildingTile'
import type { TileState } from '@/components/world/BuildingTile'
import { BuildingSheet } from '@/components/world/BuildingSheet'
import { Clouds, Hills, Kites, Marigolds, Sun, TownPath, Trees, pct } from '@/components/world/TownScenery'

const { width: W, height: H } = world.map

interface CelebrationState {
  justCompleted?: string
  unlocked?: string | null
}

export function Town() {
  const mapRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const profile = useActiveProfile()
  const settings = useSettings()
  const findMarigold = useStore((s) => s.findMarigold)

  const [selected, setSelected] = useState<MapSpot | null>(null)
  const [mitthuSays, setMitthuSays] = useState<string | null>(null)
  const [mitthuHop, setMitthuHop] = useState(false)

  const open = unlockedBuildings(profile, settings.demo)
  const recommended = recommendedBuilding(profile, settings.demo)

  /* ----- Parallax and the drawing path (DESIGN 7, tier 2) ----- */

  const { scrollYProgress } = useScroll({ target: mapRef, offset: ['start start', 'end end'] })
  const farY = useTransform(scrollYProgress, [0, 1], [0, -0.25 * 240])
  const nearY = useTransform(scrollYProgress, [0, 1], [0, -0.55 * 240])
  const draw = useTransform(scrollYProgress, (v) => Math.min(1, v * 1.15))

  /* ----- Return celebration (SCREENS Town) ----- */

  const celebration = (location.state ?? {}) as CelebrationState
  const [celebrating, setCelebrating] = useState<CelebrationState>({})

  useEffect(() => {
    if (!celebration.justCompleted) return
    setCelebrating(celebration)
    // Clear the location state so a refresh doesn't replay the celebration.
    navigate('/town', { replace: true, state: {} })

    const tile = document.querySelector<HTMLElement>(`[data-building="${celebration.justCompleted}"]`)
    tile?.scrollIntoView({ behavior: fx.isCalm() ? 'auto' : 'smooth', block: 'center' })

    const sparkleId = window.setTimeout(() => fx.sparkle(tile, 7), 400)
    const unlockId = window.setTimeout(() => {
      if (celebration.unlocked) sound.unlockChime()
    }, 900)
    const clearId = window.setTimeout(() => setCelebrating({}), 3200)

    return () => {
      window.clearTimeout(sparkleId)
      window.clearTimeout(unlockId)
      window.clearTimeout(clearId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebration.justCompleted])

  /* ----- On load, centre the recommended building ----- */

  useEffect(() => {
    if (celebration.justCompleted || !recommended) return
    const id = window.setTimeout(() => {
      const tile = document.querySelector<HTMLElement>(`[data-building="${recommended}"]`)
      tile?.scrollIntoView({ behavior: fx.isCalm() ? 'auto' : 'smooth', block: 'center' })
    }, 500)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ----- Handlers ----- */

  function tileState(spot: MapSpot): TileState {
    if (spot.status === 'help') return 'help'
    if (spot.status === 'locked-teaser') return 'teaser'
    if (!open.includes(spot.id)) return 'locked'
    const p = progressOf(profile, spot.id)
    if (p.completed) return spot.id === recommended ? 'current' : 'done'
    return spot.id === recommended ? 'current' : 'open'
  }

  function onSelect(spot: MapSpot) {
    if (spot.status === 'help') {
      navigate('/help')
      return
    }
    if (spot.status === 'playable' && !open.includes(spot.id)) {
      toast(t('town.locked', { building: spot.title }), 'lock')
      return
    }
    sound.pop()
    setSelected(spot)
  }

  function onMarigold(index: number, el: Element) {
    const result = findMarigold(index)
    if (!result.found) return
    sound.star()
    // The marigold pill is hidden on narrow screens; fall back to the stars pill.
    const marigoldPill = document.querySelector<HTMLElement>('.marigold-pill')
    const target = marigoldPill?.offsetParent ? marigoldPill : document.querySelector('.star-pill')
    fx.flyTo(el, target, 'marigold', 1, { size: 30 })
    toast(t('town.marigoldFound'), 'marigold')

    if (result.newBadges.includes('sharp-eyes')) {
      window.setTimeout(() => {
        fx.confetti(el)
        toast(t('town.allMarigolds'), 'trophy')
      }, 900)
    }
  }

  function onMitthu() {
    sound.pop()
    setMitthuHop(true)
    const fact = world.mitthuFacts[Math.floor(Math.random() * world.mitthuFacts.length)]
    setMitthuSays(fact)
    window.setTimeout(() => setMitthuHop(false), 520)
    window.setTimeout(() => setMitthuSays(null), 3200)
  }

  const recommendedSpot = world.map.spots.find((s) => s.id === recommended)
  const recommendedTitle = recommendedSpot?.title ?? ''

  return (
    <div className="mx-auto max-w-[1000px]">
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <h1 className="text-h1">{t('town.welcome', { name: profile?.name ?? '' })}</h1>
        {recommendedTitle && (
          <p className="text-small font-bold text-ink-soft">
            {t('town.nextUp', { building: recommendedTitle })}
          </p>
        )}
      </div>

      <div
        ref={mapRef}
        className="relative overflow-hidden rounded-panel bg-sky sticker"
        // A size container, so tiles and scenery scale in cqw with the map
        // rather than staying fixed and crowding each other on a phone.
        style={{ aspectRatio: `${W} / ${H}`, containerType: 'size' }}
      >
        <Hills far={farY} near={nearY} />
        <Clouds />
        <Sun />
        <TownPath draw={draw} />
        <Trees />
        <Kites />

        {world.map.spots.map((spot) => (
          <BuildingTile
            key={spot.id}
            spot={spot}
            state={tileState(spot)}
            stars={progressOf(profile, spot.id).stars}
            onSelect={onSelect}
            celebrate={
              celebrating.justCompleted === spot.id
                ? 'bounce'
                : celebrating.unlocked === spot.id
                  ? 'unlock'
                  : null
            }
          />
        ))}

        <Marigolds found={profile?.marigolds ?? []} onFind={onMarigold} />

        {recommendedSpot && (
          <div
            className="absolute z-[7] -translate-x-1/2 -translate-y-1/2"
            style={pct(recommendedSpot.x - 135, recommendedSpot.y - 95)}
          >
            <Mitthu
              spriteClassName="size-[clamp(38px,6.2cqw,62px)]"
              says={mitthuSays}
              onClick={onMitthu}
              hop={mitthuHop}
              bubbleSide="right"
            />
          </div>
        )}
      </div>

      <BuildingSheet
        spot={selected}
        playable={!!selected && selected.status === 'playable' && open.includes(selected.id)}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
