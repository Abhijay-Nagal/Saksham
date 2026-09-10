import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { AgeBand, AvatarSpec } from '@content/types'
import { cn } from '@/lib/cn'
import { allBuildings, t, world } from '@/lib/content'
import { sound } from '@/lib/sound'
import { totalStars, useActiveProfile, useSettings, useStore } from '@/lib/store'
import { Avatar } from '@/components/avatar/Avatar'
import { AvatarBuilder } from '@/components/avatar/AvatarBuilder'
import type { HeadwearColor } from '@/components/avatar/Headwear'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { Panel } from '@/components/ui/Panel'
import { Sheet } from '@/components/ui/Sheet'
import { Sprite } from '@/components/ui/Sprite'

/** A chunky settings switch. */
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => {
        sound.tap()
        onChange(!checked)
      }}
      className="flex min-h-14 w-full items-center justify-between gap-4 rounded-card bg-white px-4 sticker press"
    >
      <span className="text-body font-bold">{label}</span>
      <span
        aria-hidden
        className={cn(
          'relative h-8 w-14 shrink-0 rounded-full border-2 border-ink transition-colors',
          checked ? 'bg-leaf' : 'bg-locked',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-6 rounded-full border-2 border-ink bg-white transition-all duration-200 ease-spring',
            checked ? 'left-6.5' : 'left-0.5',
          )}
        />
      </span>
    </button>
  )
}

export function Me() {
  const navigate = useNavigate()
  const profile = useActiveProfile()
  const settings = useSettings()
  const setSettings = useStore((s) => s.setSettings)
  const updateProfile = useStore((s) => s.updateProfile)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<AvatarSpec | null>(null)
  const [draftColor, setDraftColor] = useState<HeadwearColor>('peacock')

  if (!profile) return null

  const stars = totalStars(profile)

  return (
    <div className="mx-auto max-w-[860px]">
      <h1 className="text-h1 mb-4">{t('me.title')}</h1>

      {/* Identity card */}
      <Panel className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center gap-2">
          <Avatar
            spec={profile.avatar}
            mood="happy"
            size={160}
            framed
            className="anim-bob-soft"
            name={profile.name}
            headwearColor={profile.headwearColor}
          />
          <Button
            variant="secondary"
            onClick={() => {
              setDraft(profile.avatar)
              setDraftColor(profile.headwearColor ?? 'peacock')
              setEditing(true)
            }}
          >
            {t('me.editAvatar')}
          </Button>
        </div>

        <div className="flex flex-1 flex-col items-center gap-3 sm:items-start">
          <p className="text-display">{profile.name}</p>

          <div className="flex flex-wrap items-center gap-2">
            {(['young', 'teen'] as AgeBand[]).map((b) => (
              <Chip
                key={b}
                selected={profile.band === b}
                onClick={() => updateProfile({ band: b })}
              >
                {t(`onboarding.${b}`)}
              </Chip>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="text-body flex items-center gap-2 rounded-chip bg-marigold px-3 py-1 font-bold sticker-sm">
              <Sprite name="star" size={22} /> {t('me.starsCount', { n: stars })}
            </span>
            <span className="text-body flex items-center gap-2 rounded-chip bg-white px-3 py-1 font-bold sticker-sm">
              <Sprite name="books" size={22} />{' '}
              {t('me.cardsCount', { n: profile.cards.length, total: allBuildings.length })}
            </span>
            <span className="text-body flex items-center gap-2 rounded-chip bg-white px-3 py-1 font-bold sticker-sm">
              <Sprite name="marigold" size={22} /> {profile.marigolds.length} /{' '}
              {world.map.marigolds.length}
            </span>
          </div>
        </div>
      </Panel>

      {/* Badges */}
      <h2 className="text-h2 mt-8 mb-3">{t('me.badges')}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {world.badges.map((badge) => {
          const earned = profile.badges.includes(badge.id)
          return (
            <div
              key={badge.id}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-panel p-4 text-center sticker',
                earned ? 'bg-white' : 'bg-white/60',
              )}
            >
              <Sprite
                name={badge.sprite}
                size={52}
                className={cn(earned ? 'anim-bob-soft' : 'opacity-35 grayscale')}
              />
              <p className="text-body font-extrabold">{badge.title}</p>
              {!earned && <p className="text-small text-ink-soft">{badge.how}</p>}
            </div>
          )
        })}
      </div>

      {/* Settings */}
      <h2 className="text-h2 mt-8 mb-3">{t('me.settings')}</h2>
      <div className="flex flex-col gap-3">
        <Toggle
          label={t('me.sound')}
          checked={settings.sound}
          onChange={(sound) => setSettings({ sound })}
        />
        <Toggle
          label={t('me.narration')}
          checked={settings.narration}
          onChange={(narration) => setSettings({ narration })}
        />
        <Toggle
          label={t('me.calmMotion')}
          checked={settings.calmMotion}
          onChange={(calmMotion) => setSettings({ calmMotion })}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button variant="secondary" sprite="friends" onClick={() => navigate('/profiles')}>
          {t('me.switchPlayer')}
        </Button>
        <Link to="/credits" className="text-body inline-flex min-h-12 items-center font-bold text-peacock underline">
          {t('me.credits')}
        </Link>
      </div>

      <Sheet
        open={editing}
        onClose={() => setEditing(false)}
        title={t('onboarding.makeAvatar')}
        className="md:max-w-[720px]"
      >
        {draft && (
          <AvatarBuilder
            spec={draft}
            onChange={setDraft}
            headwearColor={draftColor}
            onHeadwearColorChange={setDraftColor}
          />
        )}
        <Button
          size="lg"
          fullWidth
          className="mt-6 justify-center"
          sprite="check"
          onClick={() => {
            if (draft) updateProfile({ avatar: draft, headwearColor: draftColor })
            setEditing(false)
          }}
        >
          {t('common.save')}
        </Button>
      </Sheet>
    </div>
  )
}
