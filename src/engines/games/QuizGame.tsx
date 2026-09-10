import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { AgeBand, QuizGame as QuizGameData, QuizQuestion } from '@content/types'
import { cn } from '@/lib/cn'
import { t } from '@/lib/content'
import { fx } from '@/lib/fx'
import { sound } from '@/lib/sound'
import { Button } from '@/components/ui/Button'
import { Panel } from '@/components/ui/Panel'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Sprite } from '@/components/ui/Sprite'

export interface GameResult {
  /** correct on the first attempt / total, 0..1 */
  score: number
  correct: number
  total: number
}

interface QuizGameProps {
  game: QuizGameData
  band: AgeBand
  onFinish: (result: GameResult) => void
}

/**
 * Data-driven quiz. Teen-only questions appear only for the teen band, and
 * only the questions actually shown count toward the score (PRODUCT 4).
 * A score under 60% offers Mitthu's hint round, which never changes the score.
 */
export function QuizGame({ game, band, onFinish }: QuizGameProps) {
  const questions = useMemo(
    () => game.questions.filter((q) => q.band !== 'teen' || band === 'teen'),
    [game.questions, band],
  )

  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [missed, setMissed] = useState<QuizQuestion[]>([])
  const [correct, setCorrect] = useState(0)
  const [phase, setPhase] = useState<'quiz' | 'offer' | 'hint'>('quiz')
  const [hintIndex, setHintIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)

  const inHint = phase === 'hint'
  const list = inHint ? missed : questions
  const current = list[inHint ? hintIndex : index]
  const answered = picked !== null

  const score = questions.length ? correct / questions.length : 0

  function answer(optionIndex: number) {
    if (answered || !current) return
    setPicked(optionIndex)

    const right = optionIndex === current.answer
    if (inHint) {
      if (right) sound.correct()
      else sound.wrong()
      return
    }

    if (right) {
      setCorrect((c) => c + 1)
      sound.correct()
      const tile = rootRef.current?.querySelector(`[data-option="${optionIndex}"]`)
      fx.flyTo(tile ?? null, document.querySelector('.star-pill'), 'star', 1, { size: 28 })
    } else {
      sound.wrong()
      setMissed((m) => (m.some((q) => q.id === current.id) ? m : [...m, current]))
    }
  }

  function next() {
    setPicked(null)

    if (inHint) {
      if (hintIndex + 1 < missed.length) setHintIndex((i) => i + 1)
      else onFinish({ score, correct, total: questions.length })
      return
    }

    if (index + 1 < questions.length) {
      setIndex((i) => i + 1)
      return
    }

    // Finished the real round.
    const finalScore = questions.length ? correct / questions.length : 0
    if (finalScore < 0.6 && missed.length > 0) setPhase('offer')
    else onFinish({ score: finalScore, correct, total: questions.length })
  }

  if (phase === 'offer') {
    return (
      <div className="mx-auto max-w-[700px] text-center">
        <Sprite name="parrot" size={92} className="anim-bob mx-auto" />
        <h2 className="text-h1 mt-3">{t('quiz.hintRound')}</h2>
        <p className="text-body mt-2 text-ink-soft">
          {t('quiz.score', { n: correct, total: questions.length })}
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Button size="lg" sprite="bulb" onClick={() => setPhase('hint')}>
            {t('quiz.startHintRound')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onFinish({ score, correct, total: questions.length })}
          >
            {t('quiz.skipHintRound')}
          </Button>
        </div>
      </div>
    )
  }

  if (!current) return null

  const progress = inHint
    ? (hintIndex + (answered ? 1 : 0)) / Math.max(1, missed.length)
    : (index + (answered ? 1 : 0)) / Math.max(1, questions.length)

  return (
    <div ref={rootRef} className="mx-auto max-w-[760px]">
      <ProgressBar
        value={progress}
        mitthu
        label={t('quiz.questionOf', {
          n: (inHint ? hintIndex : index) + 1,
          total: inHint ? missed.length : questions.length,
        })}
      />

      {inHint && (
        <Panel tone="marigold-soft" className="mt-4 flex items-start gap-3 p-4">
          <Sprite name="parrot" size={34} className="shrink-0" />
          <p className="text-body font-semibold">{current.explain}</p>
        </Panel>
      )}

      <h2 className="text-h2 mt-5 max-w-[52ch]">{current.q}</h2>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {current.options.map((option, i) => {
          const isAnswer = i === current.answer
          const isPicked = i === picked
          const showRight = answered && isAnswer
          const showWrong = answered && isPicked && !isAnswer

          return (
            <motion.button
              key={i}
              type="button"
              data-option={i}
              disabled={answered}
              onClick={() => answer(i)}
              animate={showWrong ? { x: [0, -8, 8, -5, 0] } : showRight ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.4 }}
              className={cn(
                'flex min-h-16 items-center gap-3 rounded-card px-4 py-3 text-left text-[19px] font-bold sticker press',
                'disabled:pointer-events-none',
                showRight && 'bg-leaf-soft',
                showWrong && 'bg-rani-soft',
                !showRight && !showWrong && 'bg-white',
                answered && !showRight && !showWrong && 'opacity-55',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-full border-2 border-ink text-[16px] font-extrabold',
                  showRight ? 'bg-leaf text-white' : showWrong ? 'bg-rani text-white' : 'bg-paper',
                )}
              >
                {showRight ? '✓' : showWrong ? '✗' : String.fromCharCode(65 + i)}
              </span>
              <span className="min-w-0">{option}</span>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ y: 26, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="mt-5"
          >
            <Panel tone={picked === current.answer ? 'leaf-soft' : 'rani-soft'} className="p-4">
              <p className="text-h2 flex items-center gap-2">
                <Sprite name={picked === current.answer ? 'check' : 'bulb'} size={28} />
                {picked === current.answer ? t('quiz.correct') : t('quiz.wrong')}
              </p>
              <p className="text-body mt-1.5 max-w-[60ch]">{current.explain}</p>
              <Button className="mt-4" onClick={next} sprite="star">
                {t('quiz.next')}
              </Button>
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
