import { allBuildings, t, world } from '@/lib/content'
import { Panel } from '@/components/ui/Panel'
import { LogoMark } from '@/components/brand/Logo'

const ASSETS = [
  {
    name: 'DiceBear "Big Smile"',
    detail: 'A remix of "Custom Avatar" by Ashley Seo. Licensed CC BY 4.0.',
  },
  { name: 'Fluent Emoji', detail: 'By Microsoft. Licensed MIT.' },
  { name: 'Baloo 2', detail: 'By Ek Type. Licensed SIL OFL.' },
]

export function Credits() {
  return (
    <div className="mx-auto max-w-[760px]">
      <div className="flex items-center gap-3">
        <LogoMark size={64} className="mt-3" />
        <div>
          <h1 className="text-h1">{world.appName}</h1>
          <p className="text-body text-ink-soft">
            {t('credits.built')}
          </p>
        </div>
      </div>

      <Panel className="mt-6">
        <h2 className="text-h2">{t('credits.title')}</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {ASSETS.map((asset) => (
            <li key={asset.name}>
              <p className="text-body font-extrabold">{asset.name}</p>
              <p className="text-body text-ink-soft">{asset.detail}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="mt-4 mb-10">
        <h2 className="text-h2">{t('credits.sources')}</h2>
        <p className="text-small mt-1 text-ink-soft">
          {t('credits.sourcesNote')}
        </p>
        <ul className="mt-3 flex flex-col gap-3">
          {allBuildings.map((building) => (
            <li key={building.id}>
              <p className="text-body font-extrabold">{building.card.title}</p>
              <p className="text-micro text-ink-soft">{building.card.source}</p>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
