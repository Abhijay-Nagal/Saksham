import { useCallback, useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { cn } from '@/lib/cn'
import { getBuilding, t } from '@/lib/content'
import { sound } from '@/lib/sound'
import { speech } from '@/lib/speech'
import type { Stars } from '@/lib/store'
import { useActiveProfile, useStore } from '@/lib/store'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Sheet } from '@/components/ui/Sheet'
import { Sprite } from '@/components/ui/Sprite'
import { StoryPhase } from '@/engines/story/StoryPhase'
import { QuizGame } from '@/engines/games/QuizGame'
import type { GameResult } from '@/engines/games/QuizGame'
import { SortGame } from '@/engines/games/SortGame'
import { CardPhase } from './CardPhase'
import { ResultsPhase } from './ResultsPhase'

type Phase = 'story' | 'card' | 'game' | 'results'

const STEPS: { id: Phase; key: string }[] = [
  { id: 'story', key: 'play.story' },
  { id: 'card', key: 'play.cardPhase' },
  { id: 'game', key: 'play.game' },
  { id: 'results', key: 'play.done' },
]

/**
 * One immersive route for the whole loop: story → card → game → results.
 * The phase machine lives here; the engines below it are data-driven.
 */
export function Play() {
  const { buildingId } = useParams()
  const navigate = useNavigate()
  const profile = useActiveProfile()
  const recordResult = useStore((s) => s.recordResult)

  const building = buildingId ? getBuilding(buildingId) : undefined

  const [phase, setPhase] = useState<Phase>('story')
  const [retries, setRetries] = useState(0)
  const [confirmExit, setConfirmExit] = useState(false)
  const [outcome, setOutcome] = useState<{
    stars: Stars
    unlocked: string | null
    newBadges: string[]
  } | null>(null)

  // Gentle-tone buildings play at half volume and skip the whoosh.
  useEffect(() => {
    sound.setGentle(building?.tone === 'gentle')
    return () => {
      sound.setGentle(false)
      speech.cancel()
    }
  }, [building])

  const onGameFinish = useCallback(
    (result: GameResult) => {
      if (!building) return
      const recorded = recordResult({
        buildingId: building.id,
        cardId: building.card.id,
        score: result.score,
        retries,
        gameType: building.game.type,
      })
      setOutcome(recorded)
      setPhase('results')
    },
    [building, recordResult, retries],
  )

  if (!building) return <Navigate to="/town" replace />
  if (!profile) return <Navigate to="/profiles" replace />

  const stepIndex = STEPS.findIndex((s) => s.id === phase)

  return (
    // Only the story is fitted to the screen height on desktop (the theatre
    // takes whatever the dialogue leaves). Every other phase is a normal page
    // that scrolls, so zooming in never hides the buttons at the bottom.
    <div
      className={cn(
        'flex min-h-dvh flex-col px-3 pt-3 pb-10',
        phase === 'story' && 'md:h-dvh md:overflow-y-auto md:pb-4',
      )}
    >
      {/* Play header */}
      <header className="relative z-50 mx-auto mb-3 flex w-full max-w-[1000px] shrink-0 items-center gap-3">
        <IconButton aria-label={t('play.exit')} onClick={() => setConfirmExit(true)}>
          ✕
        </IconButton>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[20px] font-extrabold">{building.title}</h1>
          <ol className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {STEPS.map((step, i) => (
              <li
                key={step.id}
                aria-current={i === stepIndex ? 'step' : undefined}
                className={cn(
                  'text-[14px] font-bold',
                  i < stepIndex && 'text-leaf',
                  i === stepIndex && 'text-ink',
                  i > stepIndex && 'text-ink-soft/55',
                )}
              >
                {i < stepIndex ? '✓ ' : ''}
                {t(step.key)}
                {i < STEPS.length - 1 && <span aria-hidden className="pl-2 opacity-40">›</span>}
              </li>
            ))}
          </ol>
        </div>

        <Button variant="help" onClick={() => navigate('/help')} className="shrink-0 px-3">
          <Sprite name="handshake" size={22} />
          <span className="hidden sm:inline">{t('nav.help')}</span>
        </Button>
      </header>

      {phase === 'story' && (
        <StoryPhase
          building={building}
          onFinish={(n) => {
            setRetries(n)
            setPhase('card')
          }}
        />
      )}

      {phase === 'card' && (
        <CardPhase
          card={building.card}
          band={profile.band}
          onContinue={() => setPhase('game')}
        />
      )}

      {phase === 'game' &&
        (building.game.type === 'quiz' ? (
          <QuizGame game={building.game} band={profile.band} onFinish={onGameFinish} />
        ) : (
          <SortGame game={building.game} onFinish={onGameFinish} />
        ))}

      {phase === 'results' && outcome && (
        <ResultsPhase
          building={building}
          stars={outcome.stars}
          unlocked={outcome.unlocked}
          newBadges={outcome.newBadges}
          onReplayGame={() => {
            setOutcome(null)
            setPhase('game')
          }}
        />
      )}

      <Sheet
        open={confirmExit}
        onClose={() => setConfirmExit(false)}
        title={t('play.leaveTitle')}
      >
        <p className="text-body text-ink-soft">{t('play.leaveBody')}</p>
        <div className="mt-5 flex flex-col gap-3">
          <Button size="lg" fullWidth onClick={() => setConfirmExit(false)}>
            {t('play.leaveStay')}
          </Button>
          <Button variant="secondary" fullWidth onClick={() => navigate('/town')}>
            {t('play.leaveGo')}
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
