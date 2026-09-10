import { useState } from 'react'
import type { AvatarSpec, HairVariant, Headwear as HeadwearKind } from '@content/types'
import { world } from '@/lib/content'
import { Avatar } from '@/components/avatar/Avatar'
import { HEADWEAR_COLORS } from '@/components/avatar/Headwear'
import type { HeadwearColor } from '@/components/avatar/Headwear'
import { Chip } from '@/components/ui/Chip'

const HAIRS: HairVariant[] = ['shortHair', 'braids', 'curlyBob']
const KINDS: (HeadwearKind | undefined)[] = [undefined, 'patka', 'hijab', 'dupatta']
const COLORS = Object.keys(HEADWEAR_COLORS) as HeadwearColor[]

/**
 * Dev-only alignment grid: every headwear against three hairstyles and the
 * full skin range, so overlay fit can be eyeballed (DESIGN 8, stretch).
 * Reachable at /#/dev/avatars. Not linked from the app.
 */
export function DevAvatars() {
  const [color, setColor] = useState<HeadwearColor>('peacock')

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8">
      <h1 className="text-h1">Headwear alignment</h1>
      <p className="text-body mb-4 text-ink-soft">
        Dev only. Rows are headwear, columns are hairstyles.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {COLORS.map((c) => (
          <Chip key={c} selected={color === c} onClick={() => setColor(c)}>
            {c}
          </Chip>
        ))}
      </div>

      {KINDS.map((kind) => (
        <section key={kind ?? 'none'} className="mb-8">
          <h2 className="text-h2 mb-2">{kind ?? 'no headwear'}</h2>
          <div className="flex flex-wrap gap-4">
            {HAIRS.map((hair) =>
              ['#F6D7C3', '#C07A4A', '#5A321D'].map((skin) => {
                const spec: AvatarSpec = {
                  skin,
                  hair,
                  hairColor: world.avatarPalette.hairColors[0],
                  headwear: kind,
                }
                return (
                  <div key={`${hair}-${skin}`} className="text-center">
                    <Avatar spec={spec} size={140} framed headwearColor={color} />
                    <p className="text-micro mt-1 text-ink-soft">{hair}</p>
                  </div>
                )
              }),
            )}
          </div>
        </section>
      ))}
    </div>
  )
}
