import { useMemo } from 'react'
import { Style, Avatar as DiceBearAvatar } from '@dicebear/core'
import definition from '@dicebear/styles/big-smile.json'
import type { AvatarSpec, Mood } from '@content/types'
import { world } from '@/lib/content'
import { cn } from '@/lib/cn'
import { Headwear, headwearHairRule } from './Headwear'
import type { HeadwearColor } from './Headwear'

/** One Style instance, reused for every avatar (v10 guidance). */
const style = new Style(definition)

/** Cache by spec+mood: the builder re-renders on every swatch tap. */
const cache = new Map<string, string>()

export function avatarDataUri(spec: AvatarSpec, mood: Mood = 'normal'): string {
  // Headwear changes the hair underneath, so it belongs in the cache key.
  const rule = headwearHairRule(spec.headwear)
  const key = `${spec.skin}|${spec.hair}|${spec.hairColor}|${spec.accessory ?? ''}|${mood}|${rule}`
  const hit = cache.get(key)
  if (hit) return hit

  const face = world.moodMap[mood] ?? world.moodMap.normal
  const accessory = spec.accessory

  // The style definition types these as narrow unions; content.ts widens them
  // to string, and content is validated against the same variant names.
  //
  // `accessoriesVariant` must be *absent* when there is no accessory: the
  // validator rejects the whole options object if the key is present but
  // undefined, so it is spread in conditionally rather than set to undefined.
  const options = {
    seed: 'saksham',
    skinColor: [spec.skin.replace('#', '')],
    hairVariant: [rule === 'short' ? 'shortHair' : spec.hair],
    hairProbability: rule === 'hide' ? 0 : 100,
    hairColor: [spec.hairColor.replace('#', '')],
    eyesVariant: [face.eyes],
    mouthVariant: [face.mouth],
    accessoriesProbability: accessory ? 100 : 0,
    ...(accessory ? { accessoriesVariant: [accessory] } : {}),
  } as unknown as ConstructorParameters<typeof DiceBearAvatar<typeof style>>[1]

  const svg = new DiceBearAvatar(style, options).toString()

  const uri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
  if (cache.size > 400) cache.clear()
  cache.set(key, uri)
  return uri
}

interface AvatarProps {
  spec: AvatarSpec
  mood?: Mood
  /** Pixel size. Omit to let CSS size the image (stage puppets do this). */
  size?: number | null
  className?: string
  /** Round sky-filled sticker frame, used in profile tiles and Me. */
  framed?: boolean
  name?: string
  /** Headwear tint; the spec carries the kind, this picks its colour. */
  headwearColor?: HeadwearColor
}

export function Avatar({
  spec,
  mood = 'normal',
  size = 96,
  className,
  framed,
  name,
  headwearColor = 'peacock',
}: AvatarProps) {
  const sized = typeof size === 'number'
  const src = useMemo(() => avatarDataUri(spec, mood), [spec, mood])

  const face = (
    <img
      src={src}
      alt={name ? `${name}'s avatar` : ''}
      aria-hidden={name ? undefined : true}
      width={sized ? size : undefined}
      height={sized ? size : undefined}
      draggable={false}
      className={cn(
        'select-none object-contain',
        framed && 'rounded-full bg-sky p-1 sticker',
        className,
      )}
      style={sized ? { width: size, height: size } : undefined}
    />
  )

  if (!spec.headwear) return face

  // The overlay shares a box with the face so the 480x480 canvases line up.
  return (
    <span
      className={cn('relative inline-block', framed && 'rounded-full bg-sky p-1 sticker', className)}
      style={sized ? { width: size, height: size } : undefined}
    >
      <img
        src={src}
        alt={name ? `${name}'s avatar` : ''}
        aria-hidden={name ? undefined : true}
        draggable={false}
        className="size-full select-none object-contain"
      />
      <Headwear kind={spec.headwear} color={headwearColor} />
    </span>
  )
}
