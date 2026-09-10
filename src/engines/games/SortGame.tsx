import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { SortBin, SortGame as SortGameData } from '@content/types'
import { cn } from '@/lib/cn'
import { t } from '@/lib/content'
import { sound } from '@/lib/sound'
import { Button } from '@/components/ui/Button'
import { Panel } from '@/components/ui/Panel'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Sprite } from '@/components/ui/Sprite'
import { useToast } from '@/components/ui/Toast'
import type { GameResult } from './QuizGame'

const BIN_FILLS: Record<SortBin['color'], string> = {
  leaf: 'bg-leaf-soft',
  rani: 'bg-rani-soft',
  peacock: 'bg-peacock-soft',
  marigold: 'bg-marigold-soft',
}

interface SortGameProps {
  game: SortGameData
  onFinish: (result: GameResult) => void
}

/**
 * Drag a card into a bin, or tap the card then tap a bin — drag always has a
 * tap alternative (DESIGN 12). Score is correct-on-first-try / total.
 */
export function SortGame({ game, onFinish }: SortGameProps) {
  const [index, setIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [selected, setSelected] = useState(false)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [bounced, setBounced] = useState<string | null>(null)
  const [wrong, setWrong] = useState<{ explain: string; bin: string } | null>(null)
  const [shake, setShake] = useState(false)
  const { toast } = useToast()
  const binRefs = useRef<Record<string, HTMLElement | null>>({})
  /** Motion fires a click after a drag; this suppresses the tap-select. */
  const justDragged = useRef(false)

  const item = game.items[index]
  const total = game.items.length

  function land(binId: string) {
    setCounts((c) => ({ ...c, [binId]: (c[binId] ?? 0) + 1 }))
    setBounced(binId)
    window.setTimeout(() => setBounced((b) => (b === binId ? null : b)), 500)
  }

  function advance() {
    setSelected(false)
    setWrong(null)
    if (index + 1 < total) setIndex((i) => i + 1)
    else onFinish({ score: correct / total, correct, total })
  }

  function drop(binId: string) {
    if (!item || wrong) return
    setSelected(false)

    if (binId === item.bin) {
      setCorrect((c) => c + 1)
      sound.correct()
      land(binId)
      toast(item.explain, 'check')
      window.setTimeout(advance, 620)
    } else {
      sound.wrong()
      setShake(true)
      window.setTimeout(() => setShake(false), 500)
      setWrong({ explain: item.explain, bin: item.bin })
    }
  }

  /** After "Got it", the card flies to the correct bin, then we move on. */
  function acknowledgeWrong() {
    if (!wrong) return
    land(wrong.bin)
    window.setTimeout(advance, 520)
  }

  if (!item) return null

  return (
    <div className="mx-auto max-w-[820px]">
      <ProgressBar
        value={(index + (wrong ? 1 : 0)) / total}
        label={t('sort.itemOf', { n: index + 1, total })}
      />

      <p className="text-body mx-auto mt-4 max-w-[62ch] text-center font-semibold">{game.prompt}</p>
      <p className="text-small mt-1 text-center text-ink-soft">{t('sort.dragHint')}</p>

      {/* The card in play */}
      <div className="mt-5 flex min-h-[190px] items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.button
            key={item.id}
            type="button"
            drag={!wrong}
            dragSnapToOrigin
            dragElastic={0.22}
            aria-pressed={selected}
            onDragStart={() => {
              justDragged.current = true
            }}
            onDragEnd={(event) => {
              window.setTimeout(() => {
                justDragged.current = false
              }, 120)
              // Hit-test the bins geometrically. elementFromPoint would return
              // the dragged card itself, which is under the pointer.
              const point = event as PointerEvent
              const x = point.clientX
              const y = point.clientY
              if (x === undefined || y === undefined) return
              for (const [id, el] of Object.entries(binRefs.current)) {
                if (!el) continue
                const r = el.getBoundingClientRect()
                if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
                  drop(id)
                  return
                }
              }
            }}
            onClick={() => {
              if (wrong || justDragged.current) return
              sound.tap()
              setSelected((s) => !s)
            }}
            initial={{ opacity: 0, y: 22, scale: 0.94 }}
            animate={
              shake
                ? { x: [0, -10, 10, -6, 0], opacity: 1, y: 0, scale: 1 }
                : { opacity: 1, y: selected ? -8 : 0, scale: 1 }
            }
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className={cn(
              'w-full max-w-[520px] cursor-grab rounded-panel bg-white p-5 text-center text-[20px] font-bold sticker active:cursor-grabbing',
              selected && 'outline-3 outline-offset-3 outline-peacock',
            )}
          >
            {item.text}
          </motion.button>
        </AnimatePresence>
      </div>

      {/* Bins */}
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {game.bins.map((bin) => (
          <motion.button
            key={bin.id}
            type="button"
            data-bin={bin.id}
            ref={(el) => {
              binRefs.current[bin.id] = el
            }}
            onClick={() => {
              if (selected) drop(bin.id)
            }}
            animate={bounced === bin.id ? { scale: [1, 1.07, 0.97, 1] } : {}}
            transition={{ duration: 0.45 }}
            className={cn(
              'flex min-h-24 items-center gap-3 rounded-panel px-4 py-4 text-left text-[19px] font-extrabold sticker press',
              BIN_FILLS[bin.color],
              selected && 'outline-3 outline-offset-3 outline-marigold',
            )}
          >
            <Sprite name={bin.sprite} size={40} className="shrink-0" />
            <span className="min-w-0 flex-1">{bin.label}</span>
            <span className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-white text-[17px] tabular-nums">
              {counts[bin.id] ?? 0}
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {wrong && (
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-5"
          >
            <Panel tone="rani-soft" className="p-4">
              <p className="text-h2 flex items-center gap-2">
                <Sprite name="bulb" size={28} />
                {t('sort.wrong')}
              </p>
              <p className="text-body mt-1.5 max-w-[60ch]">{wrong.explain}</p>
              <Button className="mt-4" onClick={acknowledgeWrong} sprite="check">
                {t('sort.gotIt')}
              </Button>
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
