import { useNavigate } from 'react-router'
import type { MapSpot } from '@content/types'
import { getBuilding, t } from '@/lib/content'
import { progressOf, useActiveProfile } from '@/lib/store'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Sprite } from '@/components/ui/Sprite'

interface BuildingSheetProps {
  spot: MapSpot | null
  playable: boolean
  onClose: () => void
}

/** The intro sheet for a town spot: what you'll learn, and Play. */
export function BuildingSheet({ spot, playable, onClose }: BuildingSheetProps) {
  const navigate = useNavigate()
  const profile = useActiveProfile()

  const building = spot ? getBuilding(spot.id) : undefined
  const progress = spot ? progressOf(profile, spot.id) : null
  const gentle = building?.tone === 'gentle'

  return (
    <Sheet open={!!spot} onClose={onClose} className="text-center">
      {spot && (
        <>
          <Sprite name={spot.sprite} size={92} className="mx-auto" />
          <h2 className="text-h1 mt-2">{spot.title}</h2>

          {building ? (
            <>
              <p className="text-small mt-3 font-bold text-ink-soft">{t('building.youWillLearn')}</p>
              <p className="text-h2 text-peacock">{building.right}</p>
              <p className="text-body mx-auto mt-3 max-w-[46ch] text-ink-soft">{building.tagline}</p>

              {gentle && (
                <p className="text-small mx-auto mt-4 max-w-[46ch] rounded-card bg-peacock-soft p-3 font-semibold">
                  This story is about staying safe. You can stop anytime.
                </p>
              )}

              {progress && progress.stars > 0 && (
                <p className="mt-4 text-[22px]">{'⭐'.repeat(progress.stars)}</p>
              )}

              {playable ? (
                <Button
                  size="lg"
                  fullWidth
                  className="mt-5 justify-center"
                  sprite="party"
                  onClick={() => navigate(`/play/${spot.id}`)}
                >
                  {progress?.completed ? t('building.replay') : t('building.play')}
                </Button>
              ) : (
                <p className="text-body mt-5 font-bold text-ink-soft">
                  {t('town.locked', { building: spot.title })}
                </p>
              )}
            </>
          ) : (
            <p className="text-body mx-auto mt-4 max-w-[46ch] text-ink-soft">{spot.teaser}</p>
          )}

          <Button variant="ghost" fullWidth className="mt-3 justify-center" onClick={onClose}>
            {t('building.close')}
          </Button>
        </>
      )}
    </Sheet>
  )
}
