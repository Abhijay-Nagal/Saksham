import { useEffect, useRef, useState } from 'react'
import type { Building } from '@content/types'
import { t, world } from '@/lib/content'
import { sound } from '@/lib/sound'
import { Button } from '@/components/ui/Button'
import { Theatre } from './Theatre'
import { DialogueBox } from './DialogueBox'
import { Choices } from './Choices'
import { useStory } from './useStory'

interface StoryPhaseProps {
  building: Building
  /** Called once the good ending is reached, with the retry count. */
  onFinish: (retries: number) => void
}

export function StoryPhase({ building, onFinish }: StoryPhaseProps) {
  const story = useStory(building)
  const { state, node, onStage } = story

  const [curtainOpen, setCurtainOpen] = useState(false)
  const [typed, setTyped] = useState(false)
  const previousBg = useRef(state.scene.bg)
  const finishing = useRef(false)

  // Opening curtain.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setCurtainOpen(true)
      sound.whoosh()
    }, 320)
    return () => window.clearTimeout(id)
  }, [])

  // A backdrop change closes the curtains, swaps the scene, and reopens them.
  useEffect(() => {
    if (previousBg.current === state.scene.bg) return
    previousBg.current = state.scene.bg
    setCurtainOpen(false)
    sound.whoosh()
    const id = window.setTimeout(() => setCurtainOpen(true), 400)
    return () => window.clearTimeout(id)
  }, [state.scene.bg])

  // `onFinish` and the retry count are read through refs so this effect depends
  // only on the two things that should re-run it.
  const finishRef = useRef(onFinish)
  finishRef.current = onFinish
  const retriesRef = useRef(state.retries)
  retriesRef.current = state.retries

  // Each node starts untyped. Without this the previous node's `typed` value
  // leaks into the new one for a render.
  useEffect(() => setTyped(false), [node.id])

  // The good ending drops the curtains, then hands over to the card phase.
  // This is a one-shot: the timers are cleared on unmount only, never by a
  // re-run, which would otherwise cancel the hand-off and strand the player.
  const endTimers = useRef<number[]>([])
  useEffect(() => () => endTimers.current.forEach(window.clearTimeout), [])

  useEffect(() => {
    if (node.end !== 'good' || !typed || finishing.current) return
    finishing.current = true
    endTimers.current.push(
      window.setTimeout(() => {
        setCurtainOpen(false)
        sound.whoosh()
      }, 900),
      window.setTimeout(() => finishRef.current(retriesRef.current), 1900),
    )
  }, [node.end, typed])

  const speakerName =
    node.speaker === 'mitthu'
      ? world.mascotName
      : (building.cast.find((c) => c.id === node.speaker)?.name ?? '')

  const variant =
    node.speaker === 'mitthu' ? 'mitthu' : node.speaker === 'narrator' ? 'narrator' : 'normal'

  const showChoices = !!node.choices && typed
  const showRetry = node.end === 'retry' && typed

  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col md:min-h-0 md:flex-1">
      <div className="flex justify-center md:min-h-0 md:flex-1">
        <Theatre
          scene={state.scene}
          cast={onStage}
          speaker={node.speaker}
          talking={!typed}
          open={curtainOpen}
        />
      </div>

      <div className="mx-auto mt-4 w-full max-w-[1000px] shrink-0">
        <DialogueBox
          key={node.id}
          speakerName={speakerName}
          variant={variant}
          text={node.text}
          onTyped={setTyped}
          onTap={story.advance}
          showContinue={!!node.next && !node.choices}
        />

        {showChoices && node.choices && (
          <Choices
            // Must not collide with the DialogueBox key: duplicate keys among
            // siblings break reconciliation and strand the old node in the DOM.
            key={`choices-${node.id}`}
            choices={node.choices}
            onChoose={(choice) => story.choose(choice.to)}
          />
        )}

        {showRetry && (
          <Button
            size="lg"
            fullWidth
            className="mt-4 justify-center"
            sprite="sparkles"
            onClick={story.retry}
          >
            {t('story.tryAgain')}
          </Button>
        )}
      </div>
    </div>
  )
}
