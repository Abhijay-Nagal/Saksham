import { useNavigate } from 'react-router'
import { motion } from 'motion/react'
import { t, world } from '@/lib/content'
import { sound } from '@/lib/sound'
import { totalStars, useStore } from '@/lib/store'
import { Avatar } from '@/components/avatar/Avatar'
import { Mitthu } from '@/components/avatar/Mitthu'
import { Sprite } from '@/components/ui/Sprite'
import { FloatingHelp } from '@/components/shell/FloatingHelp'

export function Profiles() {
  const navigate = useNavigate()
  const profiles = useStore((s) => s.profiles)
  const setActiveProfile = useStore((s) => s.setActiveProfile)

  return (
    <div className="mx-auto flex min-h-dvh max-w-[900px] flex-col items-center justify-center px-4 py-10">
      <FloatingHelp />
      <div className="mb-2 flex items-center gap-3">
        <Mitthu size={64} />
        <h1 className="text-display">{t('profiles.title')}</h1>
      </div>
      <p className="text-body mb-8 text-ink-soft">{t('profiles.hint')}</p>

      <div className="grid w-full grid-cols-2 justify-items-center gap-5 sm:grid-cols-3 md:grid-cols-4">
        {profiles.map((profile, i) => (
          <motion.button
            key={profile.id}
            type="button"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.07, type: 'spring', stiffness: 320, damping: 26 }}
            onClick={() => {
              sound.pop()
              setActiveProfile(profile.id)
              navigate('/town')
            }}
            className="flex w-full flex-col items-center gap-2 rounded-panel p-3 transition-transform duration-200 ease-spring md:hover:-translate-y-1"
          >
            <Avatar
              spec={profile.avatar}
              mood="happy"
              size={112}
              framed
              className="anim-bob-soft"
              name={profile.name}
              headwearColor={profile.headwearColor}
            />
            <span className="rounded-chip border-2 border-ink bg-white px-3 py-0.5 text-[18px] font-extrabold">
              {profile.name}
            </span>
            <span className="text-small flex items-center gap-1 font-bold text-ink-soft">
              <Sprite name="star" size={18} />
              {totalStars(profile)}
            </span>
          </motion.button>
        ))}

        <motion.button
          type="button"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: profiles.length * 0.07, type: 'spring', stiffness: 320, damping: 26 }}
          onClick={() => {
            sound.tap()
            navigate('/onboarding')
          }}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-panel border-[3px] border-dashed border-ink-soft/60 p-3 py-8 transition-transform duration-200 ease-spring md:hover:-translate-y-1"
        >
          <span aria-hidden className="text-[52px] leading-none text-ink-soft">
            +
          </span>
          <span className="text-[18px] font-extrabold text-ink-soft">{t('profiles.add')}</span>
        </motion.button>
      </div>

      <p className="text-micro mt-10 text-ink-soft">{world.appName}</p>
    </div>
  )
}
