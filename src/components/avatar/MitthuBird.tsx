import { useState } from 'react'
import type { CSSProperties } from 'react'
import { cn } from '@/lib/cn'

export type MitthuPose = 'perch' | 'fly'

interface MitthuBirdProps {
  /** Pixel size; 0 lets `className` size it (the town scales him in cqw). */
  size?: number
  pose?: MitthuPose
  /** Face right instead of left. */
  flip?: boolean
  /** No idle loops, for tiny uses like a nameplate. */
  still?: boolean
  className?: string
  /** Decorative by default; give a label when he stands alone. */
  label?: string
}

/*
 * Mitthu, drawn as a flat sticker (ink outline, token colours) so every part
 * can move on its own: the eye blinks (sometimes twice), the head tilts, the
 * wings stretch now and then, the tail sways, and he does the odd little hop.
 * In flight the feet tuck away and both wings flap.
 *
 * All motion is CSS keyframes on transform only (the `mb-*` classes in
 * index.css), so calm mode switches it off like every other ambient loop.
 * Each bird gets a random phase so two Mitthus never blink in step.
 *
 * Parts pivot in viewBox units via `transform-box: view-box`.
 */

const BELLY = '#F57FA6'
const BLUE = '#3B9BE0'
const ORANGE = '#F28C28'
const CHEEK = '#FF9BB8'
const INK = 'var(--color-ink)'
const RANI = 'var(--color-rani)'
const MARIGOLD = 'var(--color-marigold)'

function pivot(x: number, y: number): CSSProperties {
  return { transformBox: 'view-box', transformOrigin: `${x}px ${y}px` }
}

export function MitthuBird({
  size = 56,
  pose = 'perch',
  flip = false,
  still = false,
  className,
  label,
}: MitthuBirdProps) {
  // A random negative delay per instance desynchronises the loops.
  const [phase] = useState(() => -Math.round(Math.random() * 1200) / 100)
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true }

  return (
    <svg
      {...a11y}
      viewBox="0 0 100 100"
      width={size > 0 ? size : undefined}
      height={size > 0 ? size : undefined}
      className={cn(
        'inline-block shrink-0 overflow-visible',
        !still && (pose === 'fly' ? 'mb-flying' : 'mb-perch'),
        className,
      )}
      style={{ '--mb-phase': `${phase}s`, transform: flip ? 'scaleX(-1)' : undefined } as CSSProperties}
    >
      <g className="mb-root" style={pivot(54, 94)}>
        <g className="mb-breathe" style={pivot(54, 94)}>
          {/* Tail */}
          <g className="mb-tail" style={pivot(60, 74)}>
            <path
              d="M58 72 C66 83 76 93 87 99 C89 100 91 98 90 96 C83 87 73 79 65 69 Z"
              fill={BLUE}
              stroke={INK}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <path
              d="M55 75 C61 86 69 95 78 100 C80 101 82 99 81 97 C75 88 68 80 62 71 Z"
              fill={RANI}
              stroke={INK}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
          </g>

          {/* Feet sit behind the body so its outline covers the tops */}
          <g className="mb-feet" stroke={ORANGE} strokeWidth="3.4" strokeLinecap="round" fill="none">
            <path d="M48 82 L47.5 93" />
            <path d="M43.5 94.5 Q47.5 91.5 51.5 94.5" />
            <path d="M58 82 L58 93" />
            <path d="M54 94.5 Q58 91.5 62 94.5" />
          </g>

          {/* Far wing: hidden behind the body until it stretches or flaps */}
          <g className="mb-wing-far" style={pivot(58, 49)}>
            <path
              d="M58 47 C71 49 78 63 76 83 C74 86 71 86 69 83 C63 75 57 66 53 57 C52 51 54 47 58 47 Z"
              fill="#E09A12"
              stroke={INK}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
          </g>

          {/* One silhouette: both outlines first, then both fills on top, so
              head and body merge without a seam. */}
          <ellipse cx="54" cy="64" rx="21" ry="25" fill={INK} stroke={INK} strokeWidth="5" />
          <g className="mb-head" style={pivot(47, 47)}>
            <circle cx="45" cy="33" r="17.5" fill={INK} stroke={INK} strokeWidth="5" />
            <path
              d="M31 26.5 C21.5 25.5 16.5 33 18.8 42.2 C19.6 44.6 22.2 44.6 23 42.2 C24 38.4 27 36.2 31.2 36 Z"
              fill={INK}
              stroke={INK}
              strokeWidth="4.4"
              strokeLinejoin="round"
            />
          </g>

          <ellipse cx="54" cy="64" rx="21" ry="25" fill={RANI} />
          <ellipse cx="47.5" cy="70" rx="11" ry="15.5" fill={BELLY} />

          <g className="mb-head" style={pivot(47, 47)}>
            <circle cx="45" cy="33" r="17.5" fill={RANI} />
            <ellipse cx="51" cy="21.5" rx="6" ry="3.2" fill="white" opacity="0.35" transform="rotate(-24 51 21.5)" />

            {/* Beak: hooked top, small lower jaw */}
            <path
              d="M31 26.5 C21.5 25.5 16.5 33 18.8 42.2 C19.6 44.6 22.2 44.6 23 42.2 C24 38.4 27 36.2 31.2 36 Z"
              fill={MARIGOLD}
              stroke={INK}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <path
              d="M31.2 36 C27.6 36.8 25.4 39.6 26.2 42.8 C29.2 44 31.4 41.8 32.4 39 Z"
              fill={ORANGE}
              stroke={INK}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M26 30 C24 31.5 23 34 23.2 36.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.6" />

            {/* Cheek and smile */}
            <circle cx="40.5" cy="40.2" r="3.8" fill={CHEEK} />
            <path d="M31.5 40.2 Q35.6 45.4 40.8 42.6" stroke={INK} strokeWidth="2.1" strokeLinecap="round" fill="none" />

            {/* Eye */}
            <g className="mb-blink" style={pivot(45, 28)}>
              <circle cx="45" cy="28" r="7.6" fill="white" stroke={INK} strokeWidth="2.2" />
              <circle className="mb-pupil" cx="43.4" cy="28.6" r="4.3" fill={INK} />
              <circle cx="41.8" cy="26.6" r="1.7" fill="white" />
              <circle cx="45.2" cy="30.6" r="0.8" fill="white" />
            </g>
            {/* The closed lid, shown only for the instant of a blink */}
            <g className="mb-lid" opacity="0">
              <circle cx="45" cy="28" r="8.8" fill={RANI} />
              <path d="M37.6 28.4 Q45 33.6 52.4 28.4" stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none" />
            </g>
          </g>

          {/* Near wing: yellow with blue flight feathers */}
          <g className="mb-wing" style={pivot(57, 49)}>
            <path
              d="M57 47 C71 49 79 64 76 85 C74 88 71 88 69 85 C63 76 57 66 52 56 C51 51 53 47 57 47 Z"
              fill={MARIGOLD}
            />
            <path
              d="M69.5 68 C74.5 73 76.6 79 76 85 C74 88 71 88 69 85 C66 80 63.5 76 61.5 72 Z"
              fill={BLUE}
            />
            <path d="M59.5 57 C63.5 62.5 66.4 68 68.2 74" stroke={INK} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.45" />
            <path
              d="M57 47 C71 49 79 64 76 85 C74 88 71 88 69 85 C63 76 57 66 52 56 C51 51 53 47 57 47 Z"
              fill="none"
              stroke={INK}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </g>
    </svg>
  )
}
