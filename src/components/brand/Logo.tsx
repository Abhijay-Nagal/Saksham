import { useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/cn'
import { world } from '@/lib/content'
import { MitthuBird } from '@/components/avatar/MitthuBird'

/*
 * The Saksham mark: a peacock shield (the law has your back) holding an open
 * book (learning your rights), with Mitthu perched on its shoulder, facing
 * the name. Shield and book are one SVG; Mitthu is the live MitthuBird laid
 * over it, so he blinks and fidgets in the top bar too.
 *
 * `intro` plays the splash sequence: the shield pops in, the book opens from
 * its spine, and Mitthu flies in and lands on the shoulder.
 */

const SHIELD =
  'M60 10 C74 19 88 21 103 21 C103 62 95 91 60 111 C25 91 17 62 17 21 C32 21 46 19 60 10 Z'
const PAGE_L = 'M60 52 C50 45.5 38.5 45.5 31 50 L31 81 C38.5 76.5 50 76.5 60 83 Z'
const PAGE_R = 'M60 52 C70 45.5 81.5 45.5 89 50 L89 81 C81.5 76.5 70 76.5 60 83 Z'

interface LogoMarkProps {
  size?: number
  intro?: boolean
  /** Called when the intro has finished (Mitthu has landed). */
  onLanded?: () => void
  className?: string
}

export function LogoMark({ size = 40, intro = false, onLanded, className }: LogoMarkProps) {
  const [landed, setLanded] = useState(!intro)
  const bird = Math.round(size * 0.5)

  return (
    <span
      className={cn('relative inline-block shrink-0', className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 120 120" width={size} height={size} className="overflow-visible">
        <motion.g
          initial={intro ? { scale: 0.4, opacity: 0, rotate: -12 } : false}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 15 }}
          style={{ transformBox: 'view-box', transformOrigin: '60px 64px' }}
        >
          {/* Shield with a drop shadow in the sticker style */}
          <path d={SHIELD} fill="var(--color-ink)" transform="translate(0 5)" />
          <path d={SHIELD} fill="var(--color-peacock)" stroke="var(--color-ink)" strokeWidth="5" strokeLinejoin="round" />
          <path
            d={SHIELD}
            fill="none"
            stroke="var(--color-marigold)"
            strokeWidth="3.2"
            strokeLinejoin="round"
            transform="translate(60 62) scale(0.82) translate(-60 -62)"
          />

          {/* The open book */}
          <motion.g
            initial={intro ? { scaleX: 0 } : false}
            animate={{ scaleX: 1 }}
            transition={{ delay: intro ? 0.3 : 0, type: 'spring', stiffness: 200, damping: 16 }}
            style={{ transformBox: 'view-box', transformOrigin: '60px 64px' }}
          >
            <path d="M28 54 L28 86 C40 81 52 82 60 88 C68 82 80 81 92 86 L92 54" fill="var(--color-marigold)" stroke="var(--color-ink)" strokeWidth="4" strokeLinejoin="round" />
            <path d={PAGE_L} fill="white" stroke="var(--color-ink)" strokeWidth="4" strokeLinejoin="round" />
            <path d={PAGE_R} fill="white" stroke="var(--color-ink)" strokeWidth="4" strokeLinejoin="round" />
            <g stroke="var(--color-peacock)" strokeWidth="3" strokeLinecap="round" opacity="0.55">
              <path d="M38 58.5 C44 56.5 49 56.8 53 58.5" />
              <path d="M38 66 C44 64 49 64.3 53 66" />
              <path d="M67 58.5 C71 56.8 76 56.5 82 58.5" />
              <path d="M67 66 C71 64.3 76 64 82 66" />
            </g>
            {/* A little star on the page: a right, earned */}
            <path
              d="M75 70.5 L76.6 73.8 L80.2 74.3 L77.6 76.8 L78.2 80.4 L75 78.7 L71.8 80.4 L72.4 76.8 L69.8 74.3 L73.4 73.8 Z"
              fill="var(--color-marigold)"
              stroke="var(--color-ink)"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </motion.g>
        </motion.g>
      </svg>

      {/* Mitthu on the shield's right shoulder */}
      <motion.span
        className="absolute"
        style={{ width: bird, height: bird, left: '63%', top: '-27%' }}
        initial={intro ? { x: size * 1.6, y: -size * 1.1, opacity: 0 } : false}
        animate={{ x: 0, y: 0, opacity: 1 }}
        transition={{ delay: intro ? 0.55 : 0, duration: intro ? 1.05 : 0, ease: [0.22, 0.9, 0.3, 1] }}
        onAnimationComplete={() => {
          if (landed) return
          setLanded(true)
          onLanded?.()
        }}
      >
        <MitthuBird size={bird} pose={landed ? 'perch' : 'fly'} flip={landed} />
      </motion.span>
    </span>
  )
}

interface LogoProps {
  size?: number
  className?: string
}

/** The mark with the name beside it, for the top bar. */
export function Logo({ size = 40, className }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={size} />
      {/* Hidden from 768 to 1024px, where the tabs need the room. */}
      <span className="text-h2 hidden font-extrabold tracking-tight sm:block md:hidden lg:block">
        {world.appName}
      </span>
    </span>
  )
}
