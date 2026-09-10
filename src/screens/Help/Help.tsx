import { useNavigate } from 'react-router'
import { help, t } from '@/lib/content'
import { Button } from '@/components/ui/Button'
import { Panel } from '@/components/ui/Panel'

/**
 * The Help Centre. Safety-critical, so it is deliberately plain: no ambient
 * layer, no motion, no sound, no rewards, no counters, and never red.
 * `data-calm` is forced for this route in App's useCalmMode.
 *
 * Copy comes from content/help.json exactly as written.
 */
export function Help() {
  const navigate = useNavigate()

  const primary = help.helplines.filter((h) => h.primary)
  const secondary = help.helplines.filter((h) => !h.primary)

  return (
    <div className="min-h-dvh bg-peacock-soft">
      <div className="mx-auto max-w-[860px] px-4 py-6 md:px-6">
        <div className="flex justify-end">
          <Button variant="ghost" silent onClick={() => navigate('/town')}>
            {help.hideLabel} ✕
          </Button>
        </div>

        <h1 className="text-h1 mt-2 text-peacock">{help.headline}</h1>
        <p className="text-body mt-2 max-w-[58ch]">{help.subline}</p>

        {/* Primary helplines */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {primary.map((line) => (
            <div
              key={line.number}
              className="rounded-panel border-[2.5px] border-peacock bg-white p-5"
            >
              <p className="text-[34px] leading-tight font-extrabold text-peacock">{line.number}</p>
              <p className="text-h2 mt-1">{line.name}</p>
              <p className="text-body mt-1 text-ink-soft">{line.desc}</p>
              <a
                href={`tel:${line.number}`}
                className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-btn border-[2.5px] border-ink bg-peacock px-5 font-bold text-white"
              >
                📞 {t('help.call', { number: line.number })}
              </a>
            </div>
          ))}
        </div>

        {/* Secondary helplines */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {secondary.map((line) => (
            <div
              key={line.number}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-card border-2 border-peacock bg-white px-4 py-3"
            >
              <a
                href={`tel:${line.number}`}
                className="inline-flex min-h-12 items-center text-[22px] font-extrabold text-peacock underline"
              >
                {line.number}
              </a>
              <span className="text-body font-bold">{line.name}</span>
              <span className="text-small w-full text-ink-soft">{line.desc}</span>
            </div>
          ))}
        </div>

        {/* How to tell a trusted adult — a real sequence, so numbers are right */}
        <Panel className="mt-6 border-peacock">
          <h2 className="text-h2 text-peacock">{help.tellAnAdult.title}</h2>
          <ol className="mt-3 flex flex-col gap-3">
            {help.tellAnAdult.steps.map((stepText, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-peacock bg-peacock-soft text-[17px] font-extrabold text-peacock">
                  {i + 1}
                </span>
                <span className="text-body max-w-[60ch]">{stepText}</span>
              </li>
            ))}
          </ol>
        </Panel>

        {/* Your rights when you ask for help */}
        <Panel className="mt-4 border-peacock">
          <h2 className="text-h2 text-peacock">{help.yourRights.title}</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {help.yourRights.points.map((point, i) => (
              <li key={i} className="text-body flex max-w-[62ch] gap-2.5">
                <span aria-hidden className="text-peacock">
                  •
                </span>
                {point}
              </li>
            ))}
          </ul>
        </Panel>

        {/* More places that help */}
        <Panel className="mt-4 border-peacock">
          <h2 className="text-h2 text-peacock">{help.moreHelp.title}</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {help.moreHelp.items.map((item) => (
              <li key={item.name}>
                <p className="text-body font-extrabold">{item.name}</p>
                <p className="text-body max-w-[62ch] text-ink-soft">{item.desc}</p>
              </li>
            ))}
          </ul>
        </Panel>

        <p className="text-small mt-6 max-w-[62ch] text-ink-soft">{help.disclaimer}</p>

        <div className="mt-6 pb-10">
          <Button variant="secondary" silent onClick={() => navigate('/town')}>
            {t('building.close')}
          </Button>
        </div>
      </div>
    </div>
  )
}
