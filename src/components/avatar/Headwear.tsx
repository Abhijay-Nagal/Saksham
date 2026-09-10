import type { Headwear as HeadwearKind } from '@content/types'

/**
 * Headwear overlays, drawn in the DiceBear 480x480 canvas so they layer
 * exactly over the avatar `<img>` in a shared box (DESIGN 8).
 *
 * Calibration, read off the style's canvas transforms:
 *   head   x 52..419, y 75..407   (matrix .857/.854 offset 52, 75.4)
 *   eyes   origin x 261.6, y 170.8
 *   mouth  origin x 222,   y 253.2
 *
 * Big Smile draws a three-quarter head: the crown is shallow (y 75..170) and
 * the face features sit right of centre, around x 260. The paths below follow
 * that rather than the box centre. Check alignment on /#/dev/avatars.
 */

export type HeadwearColor = 'peacock' | 'marigold' | 'rani' | 'leaf'

export const HEADWEAR_COLORS: Record<HeadwearColor, { fill: string; trim: string }> = {
  peacock: { fill: '#16708A', trim: '#FFB320' },
  marigold: { fill: '#FFB320', trim: '#A8274F' },
  rani: { fill: '#E2457A', trim: '#FFB320' },
  leaf: { fill: '#3E9E4F', trim: '#FFE3A3' },
}

const INK = '#2A1F3D'

interface HeadwearProps {
  kind: HeadwearKind
  color?: HeadwearColor
  className?: string
}

/**
 * `hijab` hides the hair entirely and `patka` needs the flattest hairstyle, so
 * the avatar renderer asks here rather than hard-coding those rules.
 */
export function headwearHairRule(kind?: HeadwearKind): 'hide' | 'short' | 'keep' {
  if (kind === 'hijab') return 'hide'
  if (kind === 'patka') return 'short'
  return 'keep'
}

export function Headwear({ kind, color = 'peacock', className }: HeadwearProps) {
  const { fill, trim } = HEADWEAR_COLORS[color]

  return (
    <svg
      viewBox="0 0 480 480"
      className={className}
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      {kind === 'patka' && (
        <g>
          {/* Dome over the crown, stopping just above the eyes (y 170) */}
          <path
            d="M58 196c0-78 78-136 179-136s179 58 179 136c0 12-9 17-21 13-44-14-97-21-158-21s-114 7-158 21c-12 4-21-1-21-13Z"
            fill={fill}
            stroke={INK}
            strokeWidth="9"
            strokeLinejoin="round"
          />
          {/* Front knot, over the brow on the face side */}
          <ellipse cx="252" cy="56" rx="27" ry="23" fill={fill} stroke={INK} strokeWidth="9" />
          {/* Fold line sweeping back from the knot */}
          <path
            d="M84 186c42-50 96-78 153-78s111 28 153 78"
            fill="none"
            stroke={trim}
            strokeWidth="8"
            strokeLinecap="round"
          />
        </g>
      )}

      {kind === 'hijab' && (
        <g>
          {/* Outer wrap with the face opening cut out (evenodd). The opening is
              centred on the features at (264, 252), not on the box. */}
          <path
            fillRule="evenodd"
            d="M238 38c118 0 190 80 190 190 0 78-20 150-52 204H92c-32-54-52-126-52-204C40 118 120 38 238 38Z
               M264 112c-70 0-122 60-122 142s54 148 122 148 122-66 122-148-52-142-122-142Z"
            fill={fill}
            stroke={INK}
            strokeWidth="9"
            strokeLinejoin="round"
          />
          {/* Trim along the face opening */}
          <path
            d="M142 258c0-82 52-146 122-146s122 64 122 146"
            fill="none"
            stroke={trim}
            strokeWidth="9"
            strokeLinecap="round"
          />
        </g>
      )}

      {kind === 'dupatta' && (
        <g>
          {/* Drapes over the back of the head and down both sides, with the
              front edge above the eyes so the hair fringe stays visible. */}
          <path
            d="M238 44c118 0 190 76 190 186 0 86-18 158-42 212h-74c28-60 42-130 42-198 0-74-46-118-116-118S122 170 122 244c0 68 14 138 42 198H88c-24-54-42-126-42-212C46 120 120 44 238 44Z"
            fill={fill}
            fillOpacity="0.95"
            stroke={INK}
            strokeWidth="9"
            strokeLinejoin="round"
          />
          {/* Border stripe down each side */}
          <path
            d="M78 312c8 50 20 96 34 138M398 312c-8 50-20 96-34 138"
            fill="none"
            stroke={trim}
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Front edge of the drape */}
          <path
            d="M122 236c8-70 52-110 116-110s108 40 116 110"
            fill="none"
            stroke={trim}
            strokeWidth="9"
            strokeLinecap="round"
          />
        </g>
      )}

    </svg>
  )
}
