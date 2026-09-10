import { useMemo } from 'react'
import { Style, Avatar as DiceBearAvatar } from '@dicebear/core'
import definition from '@dicebear/styles/big-smile.json'
import type { AvatarSpec, Mood } from '@content/types'
import { world } from '@/lib/content'
import { cn } from '@/lib/cn'

/** One Style instance, reused for every avatar (v10 guidance). */
const style = new Style(definition)

/** Cache by spec+mood: the builder re-renders on every swatch tap. */
const cache = new Map<string, string>()

export function avatarDataUri(spec: AvatarSpec, mood: Mood = 'normal'): string {
  const key = `${spec.skin}|${spec.hair}|${spec.hairColor}|${spec.accessory ?? ''}|${mood}`
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
    hairVariant: [spec.hair],
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
}

export function Avatar({ spec, mood = 'normal', size = 96, className, framed, name }: AvatarProps) {
  const sized = typeof size === 'number'
  const src = useMemo(() => avatarDataUri(spec, mood), [spec, mood])

  return (
    <img
      src={src}
      alt={name ? `${name}'s avatar` : ''}
      aria-hidden={name ? undefined : true}
      width={sized ? size : undefined}
      height={sized ? size : undefined}
      draggable={false}
      className={cn(
        'select-none object-contain',
        framed && 'rounded-full bg-sky sticker',
        className,
      )}
      style={sized ? { width: size, height: size } : undefined}
    />
  )
}
