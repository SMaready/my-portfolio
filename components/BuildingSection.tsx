import { buildingItems, buildingUpdated } from '@/data/building'
import { cn } from '@/lib/cn'
import { Reveal } from './Reveal'
import { SectionHeader } from './SectionHeader'

export function BuildingSection() {
  return (
    <section id="now" aria-labelledby="now-heading" className="relative z-10 border-t border-rule bg-bg-sink">
      <div className="mx-auto w-full max-w-[var(--page-max)] px-gutter-mobile py-24 md:px-gutter-tablet md:py-32 lg:px-gutter-desktop">
        <div id="now-heading">
          <SectionHeader title="Currently building" note={`Updated ${buildingUpdated}`} />
        </div>

        <ol className="space-y-px bg-rule">
          {buildingItems.map((item, position) => (
            <Reveal
              key={item.title}
              as="li"
              delay={position * 70}
              className="grid gap-4 bg-bg-sink py-7 md:grid-cols-[16rem_1fr] md:gap-10"
            >
              <div>
                <h3 className="flex items-baseline gap-3 text-[16px] font-medium text-ink">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'h-1.5 w-1.5 shrink-0 translate-y-[-0.15em] rounded-full',
                      item.status === 'active' ? 'bg-accent' : 'bg-ink-faint'
                    )}
                  />
                  {item.title}
                </h3>
                <p className="ml-[1.125rem] mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                  {item.status === 'active' ? 'active' : 'queued'}
                </p>
              </div>

              <div className="space-y-2">
                {item.lines.map((line) => (
                  <p
                    key={line.slice(0, 24)}
                    className="max-w-[64ch] text-[14px] leading-relaxed text-ink-dim"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
