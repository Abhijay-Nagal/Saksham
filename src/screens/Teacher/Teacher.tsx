import { cn } from '@/lib/cn'
import { allBuildings, community, t, world } from '@/lib/content'
import { Panel } from '@/components/ui/Panel'
import { Sprite } from '@/components/ui/Sprite'

/**
 * Teacher dashboard (stretch). Sample class data only — clearly labelled, and
 * deliberately cooperative in tone: no ranking, no per-child leaderboard.
 */

/** Cell colour by stars (SCREENS Teacher dashboard). */
const STAR_FILL = ['bg-locked', 'bg-rani-soft', 'bg-marigold-soft', 'bg-leaf-soft']

const dash = community.teacherDashboard
const COLUMNS = world.buildingOrder

function titleOf(id: string): string {
  return world.map.spots.find((s) => s.id === id)?.title ?? id
}

export function Teacher() {
  const students = dash.students as unknown as ({ name: string } & Record<string, number>)[]

  const average = (buildingId: string) =>
    students.reduce((sum, s) => sum + (Number(s[buildingId]) || 0), 0) / students.length

  const mistakes = (dash.commonMistakes ?? []) as unknown as {
    building: string
    item: string
    note: string
  }[]

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h1 className="text-h1">{dash.className}</h1>
        <span className="text-micro rounded-chip bg-white px-2 py-0.5 font-bold text-ink-soft sticker-sm">
          Sample class
        </span>
      </div>
      <p className="text-body mb-5 max-w-[62ch] text-ink-soft">
        Stars per building. Nobody is ranked against anybody — this is here to
        show a teacher where the class needs another go.
      </p>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-separate border-spacing-1">
          <caption className="sr-only">Stars earned per student per building</caption>
          <thead>
            <tr>
              <th scope="col" className="text-small px-2 py-1 text-left font-extrabold">
                Student
              </th>
              {COLUMNS.map((id) => (
                <th key={id} scope="col" className="text-small px-2 py-1 font-extrabold">
                  {titleOf(id)}
                </th>
              ))}
              <th scope="col" className="text-small px-2 py-1 font-extrabold">
                Done
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const done = COLUMNS.filter((id) => Number(student[id]) > 0).length
              return (
                <tr key={student.name}>
                  <th scope="row" className="text-body px-2 text-left font-bold whitespace-nowrap">
                    {student.name}
                  </th>
                  {COLUMNS.map((id) => {
                    const stars = Number(student[id]) || 0
                    return (
                      <td
                        key={id}
                        className={cn(
                          'rounded-chip border-2 border-ink px-2 py-2 text-center text-[16px] font-bold',
                          STAR_FILL[stars],
                        )}
                      >
                        <span className="sr-only">{stars} stars</span>
                        <span aria-hidden>{stars === 0 ? '–' : '★'.repeat(stars)}</span>
                      </td>
                    )
                  })}
                  <td className="text-body px-2 text-center font-bold tabular-nums">
                    {done} / {COLUMNS.length}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Class average per building */}
      <h2 className="text-h2 mt-8 mb-3">Class average stars</h2>
      <Panel className="flex flex-col gap-3">
        {COLUMNS.map((id) => {
          const avg = average(id)
          return (
            <div key={id} className="flex items-center gap-3">
              <span className="text-body w-28 shrink-0 font-bold">{titleOf(id)}</span>
              <span className="h-5 flex-1 overflow-hidden rounded-full bg-paper sticker-sm">
                <span
                  className="block h-full rounded-full bg-marigold"
                  style={{ width: `${(avg / 3) * 100}%` }}
                />
              </span>
              <span className="text-body w-12 shrink-0 text-right font-bold tabular-nums">
                {avg.toFixed(1)}
              </span>
            </div>
          )
        })}
      </Panel>

      {/* Common mistakes */}
      {mistakes.length > 0 && (
        <>
          <h2 className="text-h2 mt-8 mb-3">Worth revisiting</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {mistakes.map((mistake, i) => (
              <Panel key={i} tone="marigold-soft" className="flex items-start gap-3">
                <Sprite name="bulb" size={34} className="shrink-0" />
                <div>
                  <p className="text-body font-extrabold">{titleOf(mistake.building)}</p>
                  <p className="text-body">{mistake.note}</p>
                </div>
              </Panel>
            ))}
          </div>
        </>
      )}

      <p className="text-small mt-8 mb-10 text-ink-soft">
        {allBuildings.length} buildings · {t('community.sample')} data for the prototype.
      </p>
    </div>
  )
}
