import { useState } from 'react'
import { motion } from 'motion/react'
import type { Choice } from '@content/types'
import { t } from '@/lib/content'
import { Button } from '@/components/ui/Button'

interface ChoicesProps {
  choices: Choice[]
  onChoose: (choice: Choice) => void
}

/**
 * Choice buttons, staggered in by 80ms. A choice's `kind` is never shown —
 * the player finds out by playing it.
 */
export function Choices({ choices, onChoose }: ChoicesProps) {
  const [picked, setPicked] = useState<number | null>(null)

  return (
    <div className="mt-4">
      <p className="text-small mb-2 font-bold text-ink-soft">{t('story.whatShould')}</p>
      <div className="flex flex-col gap-3">
        {choices.map((choice, i) => (
          <motion.div
            key={choice.to}
            initial={{ opacity: 0, y: 14 }}
            animate={
              picked === null
                ? { opacity: 1, y: 0 }
                : picked === i
                  ? { opacity: 1, scale: [1, 1.06, 1] }
                  : { opacity: 0, y: 6 }
            }
            transition={{ delay: picked === null ? i * 0.08 : 0, duration: 0.28 }}
          >
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              align="left"
              sprite={choice.sprite}
              disabled={picked !== null}
              onClick={() => {
                setPicked(i)
                window.setTimeout(() => onChoose(choice), 320)
              }}
            >
              {choice.label}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
