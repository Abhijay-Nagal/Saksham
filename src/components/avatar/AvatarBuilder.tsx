import { useMemo } from 'react'
import { motion } from 'motion/react'
import type { AvatarSpec, HairVariant, Headwear as HeadwearKind } from '@content/types'
import { cn } from '@/lib/cn'
import { t, world } from '@/lib/content'
import { sound } from '@/lib/sound'
import { Button } from '@/components/ui/Button'
import { Avatar } from './Avatar'
import { HEADWEAR_COLORS } from './Headwear'
import type { HeadwearColor } from './Headwear'

interface AvatarBuilderProps {
  spec: AvatarSpec
  onChange: (spec: AvatarSpec) => void
  headwearColor?: HeadwearColor
  onHeadwearColorChange?: (color: HeadwearColor) => void
}

const HEADWEAR: { kind?: HeadwearKind; key: string }[] = [
  { kind: undefined, key: 'onboarding.headwearNone' },
  { kind: 'patka', key: 'onboarding.patka' },
  { kind: 'hijab', key: 'onboarding.hijab' },
  { kind: 'dupatta', key: 'onboarding.dupatta' },
]

const HEADWEAR_COLOR_KEYS = Object.keys(HEADWEAR_COLORS) as HeadwearColor[]

const { skins, hairColors, hairs } = world.avatarPalette
/** "Surprise me" never picks the grey, which reads as an elder. */
const GREY = '#B9B4AE'

function randomSpec(): AvatarSpec {
  const pickable = hairColors.filter((c) => c !== GREY)
  return {
    skin: skins[Math.floor(Math.random() * skins.length)],
    hair: hairs[Math.floor(Math.random() * hairs.length)] as HairVariant,
    hairColor: pickable[Math.floor(Math.random() * pickable.length)],
    accessory: Math.random() < 0.25 ? 'glasses' : undefined,
  }
}

/** A swatch button: a colour circle with a selected ring. */
function Swatch({
  color,
  selected,
  label,
  onClick,
}: {
  color: string
  selected: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={() => {
        sound.tap()
        onClick()
      }}
      className={cn(
        'size-12 shrink-0 rounded-full border-[2.5px] border-ink transition-transform duration-150 ease-spring',
        selected ? 'scale-115 shadow-pop-sm ring-3 ring-marigold ring-offset-2' : 'md:hover:scale-110',
      )}
      style={{ background: color }}
    />
  )
}

/**
 * The avatar maker: skin row, hair chips with live previews, hair colour row,
 * a glasses toggle and "Surprise me" (SCREENS Onboarding, step 2).
 */
export function AvatarBuilder({
  spec,
  onChange,
  headwearColor = 'peacock',
  onHeadwearColorChange,
}: AvatarBuilderProps) {
  const set = (patch: Partial<AvatarSpec>) => onChange({ ...spec, ...patch })

  // Hair chips preview the current skin and hair colour, so the choice is real.
  const hairPreviews = useMemo(
    () =>
      hairs.map((h) => ({
        hair: h as HairVariant,
        spec: { ...spec, hair: h as HairVariant, headwear: undefined },
      })),
    [spec],
  )

  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-start">
      {/* Big preview, desktop left / mobile top */}
      <div className="flex justify-center">
        <motion.div
          key={`${spec.skin}-${spec.hair}-${spec.hairColor}-${spec.accessory ?? ''}`}
          initial={{ scale: 0.86 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 16 }}
        >
          <Avatar
            spec={spec}
            mood="happy"
            size={180}
            framed
            className="anim-bob-soft"
            name="Your"
            headwearColor={headwearColor}
          />
        </motion.div>
      </div>

      <div className="flex flex-col gap-5">
        <fieldset>
          <legend className="text-small mb-2 font-extrabold text-ink-soft">{t('onboarding.skin')}</legend>
          <div className="flex flex-wrap gap-2">
            {skins.map((skin) => (
              <Swatch
                key={skin}
                color={skin}
                label={`Skin tone ${skins.indexOf(skin) + 1}`}
                selected={spec.skin === skin}
                onClick={() => set({ skin })}
              />
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-small mb-2 font-extrabold text-ink-soft">{t('onboarding.hair')}</legend>
          <div className="flex flex-wrap gap-2">
            {hairPreviews.map(({ hair, spec: preview }) => (
              <button
                key={hair}
                type="button"
                aria-label={hair}
                aria-pressed={spec.hair === hair}
                onClick={() => {
                  sound.tap()
                  set({ hair })
                }}
                className={cn(
                  'grid size-14 place-items-center overflow-hidden rounded-chip border-2 border-ink bg-sky transition-transform duration-150 ease-spring',
                  spec.hair === hair ? 'scale-108 bg-marigold shadow-pop-sm' : 'md:hover:scale-105',
                )}
              >
                <Avatar spec={preview} size={50} />
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-small mb-2 font-extrabold text-ink-soft">{t('onboarding.hairColour')}</legend>
          <div className="flex flex-wrap gap-2">
            {hairColors.map((hairColor) => (
              <Swatch
                key={hairColor}
                color={hairColor}
                label={`Hair colour ${hairColors.indexOf(hairColor) + 1}`}
                selected={spec.hairColor === hairColor}
                onClick={() => set({ hairColor })}
              />
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-small mb-2 font-extrabold text-ink-soft">
            {t('onboarding.headwear')}
          </legend>
          <div className="flex flex-wrap gap-2">
            {HEADWEAR.map(({ kind, key }) => (
              <button
                key={key}
                type="button"
                aria-pressed={spec.headwear === kind}
                onClick={() => {
                  sound.tap()
                  set({ headwear: kind })
                }}
                className={cn(
                  'flex min-h-12 items-center gap-2 rounded-chip border-2 border-ink px-2.5 text-[16px] font-bold transition-transform duration-150 ease-spring',
                  spec.headwear === kind ? 'bg-marigold shadow-pop-sm' : 'bg-white text-ink-soft',
                )}
              >
                <span className="grid size-9 place-items-center overflow-hidden rounded-full bg-sky">
                  <Avatar
                    spec={{ ...spec, headwear: kind }}
                    size={34}
                    headwearColor={headwearColor}
                  />
                </span>
                {t(key)}
              </button>
            ))}
          </div>
        </fieldset>

        {spec.headwear && onHeadwearColorChange && (
          <fieldset>
            <legend className="text-small mb-2 font-extrabold text-ink-soft">
              {t('onboarding.headwearColour')}
            </legend>
            <div className="flex flex-wrap gap-2">
              {HEADWEAR_COLOR_KEYS.map((c) => (
                <Swatch
                  key={c}
                  color={HEADWEAR_COLORS[c].fill}
                  label={c}
                  selected={headwearColor === c}
                  onClick={() => onHeadwearColorChange(c)}
                />
              ))}
            </div>
          </fieldset>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={spec.accessory === 'glasses' ? 'primary' : 'secondary'}
            aria-pressed={spec.accessory === 'glasses'}
            onClick={() => set({ accessory: spec.accessory === 'glasses' ? undefined : 'glasses' })}
          >
            👓 {t('onboarding.glasses')}
          </Button>
          <Button variant="secondary" sprite="sparkles" onClick={() => onChange(randomSpec())}>
            {t('onboarding.surprise')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export { randomSpec }
