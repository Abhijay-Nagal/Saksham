import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import type { AgeBand, AvatarSpec } from '@content/types'
import { cn } from '@/lib/cn'
import { t, world } from '@/lib/content'
import { fx } from '@/lib/fx'
import { sound } from '@/lib/sound'
import { useStore } from '@/lib/store'
import { Avatar } from '@/components/avatar/Avatar'
import { AvatarBuilder, randomSpec } from '@/components/avatar/AvatarBuilder'
import type { HeadwearColor } from '@/components/avatar/Headwear'
import { Mitthu } from '@/components/avatar/Mitthu'
import { MitthuArrival } from '@/components/avatar/MitthuArrival'
import { useSplashDone } from '@/lib/splash'
import { FloatingHelp } from '@/components/shell/FloatingHelp'
import { Button } from '@/components/ui/Button'
import { Panel } from '@/components/ui/Panel'
import { Sprite } from '@/components/ui/Sprite'

const STEPS = 5
const NAME_RE = /^[A-Za-z][A-Za-z ]*$/

export function Onboarding() {
  const navigate = useNavigate()
  const createProfile = useStore((s) => s.createProfile)

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState(false)
  const [spec, setSpec] = useState<AvatarSpec>(() => randomSpec())
  const [band, setBand] = useState<AgeBand | null>(null)
  const [headwearColor, setHeadwearColor] = useState<HeadwearColor>('peacock')
  const [mitthuLanded, setMitthuLanded] = useState(false)
  const splashDone = useSplashDone()
  const readyRef = useRef<HTMLDivElement>(null)

  // The last step is a small celebration.
  useEffect(() => {
    if (step !== 4) return
    const id = window.setTimeout(() => fx.confetti(readyRef.current), 350)
    return () => window.clearTimeout(id)
  }, [step])

  function next() {
    if (step === 1) {
      const trimmed = name.trim()
      if (!trimmed || trimmed.length > 20 || !NAME_RE.test(trimmed)) {
        setNameError(true)
        return
      }
      setNameError(false)
    }
    if (step === 3 && !band) return
    setStep((s) => Math.min(STEPS - 1, s + 1))
  }

  function finish() {
    createProfile({ name: name.trim(), avatar: spec, band: band ?? 'young', headwearColor })
    sound.unlockChime()
    navigate('/town', { replace: true })
  }

  const canContinue = step === 3 ? !!band : true

  return (
    <div className="mx-auto flex min-h-dvh max-w-[900px] flex-col px-4 py-6">
      <FloatingHelp />
      {/* Progress dots */}
      <div className="mb-6 flex min-h-12 items-center justify-start gap-2 pl-1 sm:justify-center sm:pl-0" aria-label={`Step ${step + 1} of ${STEPS}`}>
        {Array.from({ length: STEPS }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className={cn(
              'h-3 rounded-full border-2 border-ink transition-all duration-300 ease-spring',
              i === step ? 'w-8 bg-marigold' : i < step ? 'w-3 bg-leaf' : 'w-3 bg-white',
            )}
          />
        ))}
      </div>

      <div className="flex flex-1 items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="w-full"
          >
            {step === 0 && (
              <div className="flex flex-col items-center gap-5 text-center">
                {splashDone ? (
                  <MitthuArrival size={150} onLanded={() => setMitthuLanded(true)} />
                ) : (
                  <div aria-hidden style={{ height: 150 * 1.1 }} />
                )}
                <motion.div
                  initial={{ opacity: 0, y: 14, scale: 0.96 }}
                  animate={mitthuLanded ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                >
                  <Panel className="max-w-[52ch]">
                    <p className="text-dialogue">{t('onboarding.mitthuHello')}</p>
                  </Panel>
                </motion.div>
              </div>
            )}

            {step === 1 && (
              <div className="mx-auto flex max-w-[560px] flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Mitthu size={56} />
                  <h1 className="text-h1">{t('onboarding.askName')}</h1>
                </div>
                <input
                  autoFocus
                  value={name}
                  maxLength={20}
                  onChange={(e) => {
                    setName(e.target.value)
                    setNameError(false)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') next()
                  }}
                  placeholder={t('onboarding.namePlaceholder')}
                  aria-label={t('onboarding.askName')}
                  aria-invalid={nameError}
                  className={cn(
                    'min-h-16 w-full rounded-btn bg-white px-4 text-[24px] font-bold sticker',
                    'placeholder:font-medium placeholder:text-ink-soft/50',
                  )}
                />
                <p className="text-small text-ink-soft">{t('onboarding.nameSafety')}</p>
                {nameError && (
                  <p className="text-body font-bold text-rani-dark">{t('onboarding.nameError')}</p>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-5">
                <h1 className="text-h1 text-center">{t('onboarding.makeAvatar')}</h1>
                <AvatarBuilder
                  spec={spec}
                  onChange={setSpec}
                  headwearColor={headwearColor}
                  onHeadwearColorChange={setHeadwearColor}
                />
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center gap-6">
                <h1 className="text-h1 text-center">{t('onboarding.askAge')}</h1>
                <div className="grid w-full max-w-[560px] gap-4 sm:grid-cols-2">
                  {(
                    [
                      { id: 'young' as const, key: 'onboarding.young', sprite: 'kite' },
                      { id: 'teen' as const, key: 'onboarding.teen', sprite: 'graduation-cap' },
                    ]
                  ).map((option) => (
                    <motion.button
                      key={option.id}
                      type="button"
                      aria-pressed={band === option.id}
                      onClick={() => {
                        sound.pop()
                        setBand(option.id)
                      }}
                      animate={band === option.id ? { scale: [1, 1.07, 1] } : { scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className={cn(
                        'flex min-h-40 flex-col items-center justify-center gap-3 rounded-panel p-6 text-[24px] font-extrabold sticker press',
                        band === option.id ? 'bg-marigold' : 'bg-white',
                      )}
                    >
                      <Sprite name={option.sprite} size={56} />
                      {t(option.key)}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div ref={readyRef} className="flex flex-col items-center gap-5 text-center">
                <motion.div
                  initial={{ scale: 0.3, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                >
                  <Avatar
                    spec={spec}
                    mood="proud"
                    size={190}
                    framed
                    name={name.trim()}
                    headwearColor={headwearColor}
                  />
                </motion.div>
                <h1 className="text-display">{t('onboarding.greeting', { name: name.trim() })}</h1>
                <p className="text-body max-w-[46ch] text-ink-soft">
                  {t('onboarding.waiting', { mascot: world.mascotName })}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer controls */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className={cn(step === 0 && 'invisible')}
        >
          ← {t('common.back')}
        </Button>

        {step < STEPS - 1 ? (
          <Button size="lg" onClick={next} disabled={!canContinue} sprite="star">
            {t('common.next')}
          </Button>
        ) : (
          <Button size="lg" onClick={finish} sprite="party">
            {t('onboarding.ready')}
          </Button>
        )}
      </div>
    </div>
  )
}
