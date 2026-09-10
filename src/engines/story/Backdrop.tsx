import type { SceneBg } from '@content/types'
import { Sprite } from '@/components/ui/Sprite'

/**
 * Scene backdrops, drawn as CSS/SVG shapes plus sprites (SCREENS Play: story).
 * These are the only places raw scenery hex is allowed (DESIGN 7).
 *
 * Node props render on the backdrop, off to the sides so the puppets keep the
 * centre. A backdrop's own scenery sprite is skipped when the node already
 * supplies the same one as a prop, so nothing is drawn twice.
 */
export function Backdrop({ bg, props }: { bg: SceneBg; props: string[] }) {
  const has = (name: string) => props.includes(name)

  return (
    <div className="absolute inset-0 overflow-hidden">
      {bg === 'school' && (
        <>
          <div className="absolute inset-0 bg-sky" />
          <div className="absolute inset-x-0 bottom-0 h-[38%]" style={{ background: '#9FD08A' }} />
          {!has('school') && (
            <div className="absolute bottom-[34%] left-[5%]">
              <Sprite name="school" size={120} />
            </div>
          )}
        </>
      )}

      {bg === 'street' && (
        <>
          <div className="absolute inset-0 bg-sky" />
          <div className="absolute inset-x-0 bottom-0 h-[34%]" style={{ background: '#E7D7B8' }} />
          <div
            className="absolute inset-x-0 bottom-[16%] h-1.5"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg,#FFF1CF 0 34px,transparent 34px 62px)',
            }}
          />
        </>
      )}

      {bg === 'dhaba' && (
        <>
          <div className="absolute inset-0 bg-marigold-soft" />
          <div
            className="absolute inset-x-0 bottom-0 h-[28%] border-t-[3px] border-ink"
            style={{ background: '#C98A4B' }}
          />
          <div className="absolute inset-x-0 bottom-[28%] h-2.5" style={{ background: '#8C5A2B' }} />
        </>
      )}

      {bg === 'home' && (
        <>
          <div className="absolute inset-0 bg-paper" />
          {/* A simple repeating rangoli motif band along the top of the wall */}
          <div
            className="absolute inset-x-0 top-0 h-10"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='40' viewBox='0 0 60 40'%3E%3Cg fill='none' stroke='%23E2457A' stroke-width='3'%3E%3Ccircle cx='30' cy='20' r='9'/%3E%3Cpath d='M30 4v6M30 30v6M14 20h6M40 20h6'/%3E%3C/g%3E%3Ccircle cx='30' cy='20' r='3' fill='%23FFB320'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'repeat-x',
              backgroundSize: '60px 40px',
            }}
          />
          <div className="absolute top-[24%] right-[10%] size-20 rounded-md border-[3px] border-ink bg-sky md:size-24" />
          <div
            className="absolute inset-x-[14%] bottom-2 h-[14%] rounded-lg border-[3px] border-ink opacity-80"
            style={{ background: '#E2457A' }}
          />
        </>
      )}

      {bg === 'panchayat' && (
        <>
          <div className="absolute inset-0 bg-sky" />
          <div className="absolute inset-x-0 bottom-0 h-[36%]" style={{ background: '#9FD08A' }} />
          {!has('classical-building') && (
            <div className="absolute bottom-[32%] left-[6%]">
              <Sprite name="classical-building" size={116} />
            </div>
          )}
          {!has('tree') && (
            <div className="absolute right-[6%] bottom-[30%]">
              <Sprite name="tree" size={100} />
            </div>
          )}
        </>
      )}

      {/* Node props: tucked to the left so the puppets own the centre. */}
      <div className="absolute bottom-[30%] left-[4%] flex items-end gap-4">
        {props.map((p, i) => (
          <Sprite key={`${p}-${i}`} name={p} size={i === 0 ? 110 : 84} />
        ))}
      </div>
    </div>
  )
}
