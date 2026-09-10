import { useRef, useState } from 'react'
import { Link } from 'react-router'
import type { AgeBand, Card as CardData } from '@content/types'
import { cn } from '@/lib/cn'
import { t } from '@/lib/content'
import { sound } from '@/lib/sound'
import { speech } from '@/lib/speech'
import { Sprite } from './Sprite'
import { IconButton } from './IconButton'

const FILLS: Record<CardData['color'], string> = {
  peacock: 'bg-peacock text-white',
  rani: 'bg-rani text-white',
  leaf: 'bg-leaf text-white',
  marigold: 'bg-marigold text-ink',
}

interface CardProps {
  card: CardData
  band: AgeBand
  /** Controlled flip; omit to let the card own its state. */
  flipped?: boolean
  onFlip?: (next: boolean) => void
  width?: number
  /** Tilt toward the cursor (DESIGN 6). */
  tilt?: boolean
  className?: string
  /** Show the 🔊 and Need help affordances (reveal and book modal only). */
  interactiveBack?: boolean
  /** The reveal screen shows its own timed flip hint, so it turns this off. */
  showFlipHint?: boolean
}

/**
 * A 3:4 collectible card. The front is a coloured sticker with a shimmer
 * sweep; the back carries the band text, "If it happens", the law chip and the
 * source line.
 *
 * The flip target is a full-size button *behind* the two faces. The faces are
 * pointer-events:none so taps fall through to it, and only the genuinely
 * interactive bits on the back opt back in. That keeps links and buttons out
 * of a button, which would be invalid.
 */
export function Card({
  card,
  band,
  flipped,
  onFlip,
  width = 300,
  tilt = true,
  className,
  interactiveBack = true,
  showFlipHint = true,
}: CardProps) {
  const [ownFlipped, setOwnFlipped] = useState(false)
  const [tellMore, setTellMore] = useState(false)
  const [angle, setAngle] = useState({ x: 0, y: 0 })
  const boxRef = useRef<HTMLDivElement>(null)

  const isFlipped = flipped ?? ownFlipped
  const bodyText = band === 'teen' || tellMore ? card.teen : card.kid

  function toggle() {
    sound.pop()
    const next = !isFlipped
    onFlip?.(next)
    if (flipped === undefined) setOwnFlipped(next)
  }

  function onMove(e: React.PointerEvent) {
    if (!tilt || e.pointerType !== 'mouse') return
    const rect = boxRef.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setAngle({ x: -py * 14, y: px * 18 })
  }

  return (
    <div className={cn('select-none', className)} style={{ width }}>
      <div
        ref={boxRef}
        className="relative"
        style={{ perspective: 1200, aspectRatio: '3 / 4' }}
        onPointerMove={onMove}
        onPointerLeave={() => setAngle({ x: 0, y: 0 })}
      >
        <button
          type="button"
          aria-label={`${card.title}. ${isFlipped ? 'Showing details' : t('card.flip')}`}
          aria-pressed={isFlipped}
          onClick={toggle}
          className="absolute inset-0 z-0 cursor-pointer rounded-card"
        />

        <div
          className="pointer-events-none relative size-full transition-transform duration-700 ease-spring"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${angle.x}deg) rotateY(${angle.y + (isFlipped ? 180 : 0)}deg)`,
          }}
        >
          {/* Front */}
          <div
            className={cn(
              'absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-hidden rounded-card p-4 sticker',
              FILLS[card.color],
            )}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-white/25"
              style={{ animation: 'shimmer 3.5s ease-in-out infinite' }}
            />
            <Sprite name={card.sprite} size={Math.round(width * 0.36)} />
            <p className="text-h2 text-center leading-tight">{card.title}</p>
            <span className="rounded-chip border-2 border-ink bg-white px-2 py-0.5 text-center text-[14px] font-bold text-ink">
              {card.law}
            </span>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col gap-2 overflow-y-auto rounded-card bg-white p-4 text-left sticker"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <h3 className="text-[20px] font-extrabold">{card.title}</h3>
            <p className="text-[17px] leading-[1.45] font-medium">{bodyText}</p>

            {band === 'young' && !tellMore && (
              <button
                type="button"
                onClick={() => {
                  sound.tap()
                  setTellMore(true)
                }}
                className="pointer-events-auto w-fit rounded-chip bg-marigold px-2.5 py-1.5 text-[15px] font-bold sticker-sm press-sm"
              >
                {t('card.tellMeMore')}
              </button>
            )}

            <div className="rounded-card bg-peacock-soft p-2.5">
              <p className="text-[14px] font-extrabold text-peacock">{t('card.ifItHappens')}</p>
              <p className="text-[16px] font-medium">{card.ifItHappens}</p>
              {interactiveBack && (
                <Link
                  to="/help"
                  className="pointer-events-auto inline-block pt-1 text-[15px] font-bold text-peacock underline"
                >
                  {t('card.needHelp')}
                </Link>
              )}
            </div>

            <p className="text-micro mt-auto text-ink-soft">{card.source}</p>
          </div>
        </div>
      </div>

      {interactiveBack && (
        <div className="mt-3 flex items-center justify-center gap-3">
          <IconButton
            aria-label={t('story.readAloud')}
            onClick={() =>
              speech.speak(
                isFlipped ? `${card.title}. ${bodyText}. ${card.ifItHappens}` : card.title,
              )
            }
          >
            <Sprite name="speaker" size={22} />
          </IconButton>
          {!isFlipped && showFlipHint && (
            <span className="text-small font-bold text-ink-soft">{t('card.flip')}</span>
          )}
        </div>
      )}
    </div>
  )
}

/** A small non-flipping front, used in the book grid. */
export function CardThumb({
  card,
  width = 180,
  className,
}: {
  card: CardData
  width?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 overflow-hidden rounded-card p-3 sticker',
        FILLS[card.color],
        className,
      )}
      style={{ width, aspectRatio: '3 / 4' }}
    >
      <Sprite name={card.sprite} size={Math.round(width * 0.36)} />
      <p className="text-center text-[17px] leading-tight font-extrabold">{card.title}</p>
    </div>
  )
}
