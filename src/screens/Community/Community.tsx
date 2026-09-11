import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { AvatarSpec, HairVariant } from '@content/types'
import { cn } from '@/lib/cn'
import { community, t, world } from '@/lib/content'
import { fx } from '@/lib/fx'
import { sound } from '@/lib/sound'
import { totalStars, useActiveProfile, useStore } from '@/lib/store'
import { Avatar } from '@/components/avatar/Avatar'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { Panel } from '@/components/ui/Panel'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Sheet } from '@/components/ui/Sheet'
import { Sprite } from '@/components/ui/Sprite'
import { useToast } from '@/components/ui/Toast'

type Tab = 'pledge' | 'mission' | 'expert' | 'places'

const TABS: { id: Tab; key: string; sprite: string }[] = [
  { id: 'pledge', key: 'community.pledgeWall', sprite: 'pledge' },
  { id: 'mission', key: 'community.classMission', sprite: 'trophy' },
  { id: 'expert', key: 'community.askExpert', sprite: 'bulb' },
  { id: 'places', key: 'community.resources', sprite: 'shield' },
]

/** Sample wall avatars only carry a partial spec; fill in the rest. */
function wallSpec(a: { skin: string; hair: string; hairColor: string; accessory?: string }): AvatarSpec {
  return {
    skin: a.skin,
    hair: a.hair as HairVariant,
    hairColor: a.hairColor,
    accessory: a.accessory as AvatarSpec['accessory'],
  }
}

/** Small "Sample" label — community content is never real user data. */
function SampleTag() {
  return (
    <span className="text-micro rounded-chip bg-white px-2 py-0.5 font-bold text-ink-soft sticker-sm">
      {t('community.sample')}
    </span>
  )
}

export function Community() {
  const [tab, setTab] = useState<Tab>('pledge')

  return (
    <div className="mx-auto max-w-[900px]">
      <h1 className="text-h1 mb-3">{t('community.title')}</h1>

      <div role="tablist" aria-label={t('community.title')} className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={tab === item.id}
            onClick={() => {
              sound.tap()
              setTab(item.id)
            }}
            className={cn(
              'flex min-h-12 items-center gap-2 rounded-btn px-4 font-bold transition-transform duration-150 ease-spring sticker-sm',
              tab === item.id ? 'bg-marigold text-ink' : 'bg-white text-ink-soft',
            )}
          >
            <Sprite name={item.sprite} size={22} />
            {t(item.key)}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === 'pledge' && <PledgeWall />}
        {tab === 'mission' && <ClassMission />}
        {tab === 'expert' && <AskExpert />}
        {tab === 'places' && <Places />}
      </div>
    </div>
  )
}

/* ---------- 1. Pledge Wall ---------- */

function PledgeWall() {
  const profile = useActiveProfile()
  const takePledge = useStore((s) => s.takePledge)
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const wallRef = useRef<HTMLDivElement>(null)

  const taken = profile?.pledges ?? []
  const pledgeById = (id: string) => community.pledges.find((p) => p.id === id)

  function choose(pledgeId: string) {
    const newBadges = takePledge(pledgeId)
    setOpen(false)
    sound.star()
    window.setTimeout(() => {
      fx.confetti(wallRef.current)
      toast(t('community.pledgeAdded'), 'pledge')
      newBadges.forEach((id) => {
        const badge = world.badges.find((b) => b.id === id)
        if (badge) toast(t('results.badge', { badge: badge.title }), badge.sprite)
      })
    }, 220)
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button size="lg" sprite="pledge" onClick={() => setOpen(true)}>
          {t('community.takePledge')}
        </Button>
        <SampleTag />
      </div>

      <div ref={wallRef} className="columns-1 gap-4 sm:columns-2 md:columns-3">
        {/* The player's own pledges sit at the top of the wall */}
        <AnimatePresence initial={false}>
          {taken.map((id) => {
            const pledge = pledgeById(id)
            if (!pledge || !profile) return null
            return (
              <motion.div
                key={`mine-${id}`}
                initial={{ opacity: 0, scale: 0.85, y: -12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                className="mb-4 break-inside-avoid"
              >
                <Panel tone="marigold-soft" className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      spec={profile.avatar}
                      mood="proud"
                      size={48}
                      framed
                      headwearColor={profile.headwearColor}
                    />
                    <div>
                      <p className="text-body font-extrabold">{profile.name}</p>
                      <p className="text-micro text-ink-soft">{t('community.you')}</p>
                    </div>
                  </div>
                  <p className="text-body mt-3 flex gap-2">
                    <Sprite name={pledge.sprite} size={26} className="shrink-0" />
                    {pledge.text}
                  </p>
                </Panel>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {community.wall.map((entry, i) => {
          const pledge = pledgeById(entry.pledge)
          return (
            <div key={`${entry.name}-${i}`} className="mb-4 break-inside-avoid">
              <Panel className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar spec={wallSpec(entry.avatar)} mood="happy" size={48} framed />
                  <div className="min-w-0">
                    <p className="text-body font-extrabold">{entry.name}</p>
                    <p className="text-micro text-ink-soft">{entry.place}</p>
                  </div>
                </div>
                <p className="text-body mt-3 flex gap-2">
                  {pledge && <Sprite name={pledge.sprite} size={26} className="shrink-0" />}
                  {pledge?.text}
                </p>
              </Panel>
            </div>
          )
        })}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title={t('community.takePledge')}>
        <div className="flex flex-col gap-3">
          {community.pledges.map((pledge) => {
            const already = taken.includes(pledge.id)
            return (
              <Button
                key={pledge.id}
                variant="secondary"
                align="left"
                fullWidth
                sprite={pledge.sprite}
                disabled={already}
                onClick={() => choose(pledge.id)}
                className="min-h-16 py-2"
              >
                <span className="block text-[17px] leading-snug">{pledge.text}</span>
                {already && (
                  <span className="text-micro block text-leaf">{t('community.alreadyTaken')} ✓</span>
                )}
              </Button>
            )
          })}
        </div>
      </Sheet>
    </div>
  )
}

/* ---------- 2. Class Mission ---------- */

function ClassMission() {
  const profile = useActiveProfile()
  const mission = community.classChallenge
  const current = mission.current + totalStars(profile)

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h2 className="text-h2">{mission.title}</h2>
        <SampleTag />
      </div>

      <Panel>
        <p className="text-body font-bold">{mission.goal}</p>
        <div className="mt-4">
          <ProgressBar value={current / mission.target} tone="leaf" />
        </div>
        <p className="text-h2 mt-3 flex items-center gap-2">
          <Sprite name="star" size={30} />
          {t('community.starsTogether', { n: current, total: mission.target })}
        </p>
        <p className="text-body mt-2 text-ink-soft">{mission.note}</p>
        <p className="text-small mt-3 rounded-card bg-leaf-soft p-3 font-bold">
          {t('community.yourShare', { n: totalStars(profile) })}
        </p>
      </Panel>
    </div>
  )
}

/* ---------- 3. Ask an Expert ---------- */

const MAX_QUESTION = 300

function AskExpert() {
  const askQuestion = useStore((s) => s.askQuestion)
  const profile = useActiveProfile()
  const [topic, setTopic] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)
  const [openAnswer, setOpenAnswer] = useState<number | null>(null)

  const canSend = !!topic && text.trim().length > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-body max-w-[62ch]">{community.askExpert.intro}</p>
        <SampleTag />
      </div>

      <Panel>
        <p className="text-small mb-2 font-extrabold text-ink-soft">{t('community.pickTopic')}</p>
        <div className="flex flex-wrap gap-2">
          {community.askExpert.topics.map((item) => (
            <Chip key={item} selected={topic === item} onClick={() => setTopic(item)}>
              {item}
            </Chip>
          ))}
        </div>

        <label htmlFor="ask" className="text-small mt-4 mb-2 block font-extrabold text-ink-soft">
          {t('community.yourQuestion')}
        </label>
        <textarea
          id="ask"
          value={text}
          maxLength={MAX_QUESTION}
          rows={4}
          onChange={(e) => {
            setText(e.target.value)
            setSent(false)
          }}
          className="w-full rounded-card bg-white p-3 text-[18px] font-medium sticker"
        />
        <p className="text-micro mt-1 text-right text-ink-soft">
          {text.length} / {MAX_QUESTION}
        </p>

        <p className="text-small mt-3 rounded-card bg-peacock-soft p-3 font-bold text-peacock">
          {community.askExpert.safetyNote}
        </p>

        <Button
          className="mt-4"
          sprite="telephone"
          disabled={!canSend}
          onClick={() => {
            if (!topic) return
            askQuestion(topic, text.trim())
            setText('')
            setSent(true)
          }}
        >
          {t('community.sendPrivately')}
        </Button>

        {sent && (
          <p className="text-body mt-3 rounded-card bg-leaf-soft p-3 font-bold">
            {community.askExpert.submittedMessage}
          </p>
        )}
      </Panel>

      {!!profile?.questions.length && (
        <Panel>
          <h3 className="text-h2">{t('community.yourQuestions')}</h3>
          <p className="text-small text-ink-soft">
            {t('community.questionsPrivate')}
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {profile.questions.map((q, i) => (
              <li key={i} className="rounded-card bg-paper p-3">
                <p className="text-micro font-bold text-peacock">{q.topic}</p>
                <p className="text-body">{q.text}</p>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <div>
        <h3 className="text-h2 mb-2">{t('community.answered')}</h3>
        <div className="flex flex-col gap-2">
          {community.askExpert.answered.map((qa, i) => (
            <div key={i} className="overflow-hidden rounded-card bg-white sticker">
              <button
                type="button"
                aria-expanded={openAnswer === i}
                onClick={() => {
                  sound.tap()
                  setOpenAnswer(openAnswer === i ? null : i)
                }}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span aria-hidden className="text-[20px]">
                  {openAnswer === i ? '▾' : '▸'}
                </span>
                <span className="text-body flex-1 font-bold">{qa.q}</span>
                <span className="text-micro rounded-chip bg-peacock-soft px-2 py-0.5 font-bold text-peacock">
                  {qa.topic}
                </span>
              </button>
              {openAnswer === i && (
                <p className="text-body max-w-[68ch] px-4 pb-4 pl-11">{qa.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------- 4. Places that help ---------- */

function Places() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {community.resources.map((resource) => (
        <Panel key={resource.name} className="flex items-start gap-3">
          <Sprite name={resource.sprite} size={44} className="shrink-0" />
          <div>
            <p className="text-body font-extrabold">{resource.name}</p>
            <p className="text-body text-ink-soft">{resource.desc}</p>
          </div>
        </Panel>
      ))}
    </div>
  )
}
