import { skills } from '@/data/skills'
import { Reveal } from './Reveal'
import { SectionHeader } from './SectionHeader'

export function SkillsSection() {
  return (
    <section
      id="stack"
      aria-labelledby="stack-heading"
      className="relative z-10 bg-bg"
    >
      <div className="mx-auto w-full max-w-[var(--page-max)] px-gutter-mobile py-24 md:px-gutter-tablet md:py-32 lg:px-gutter-desktop">
      <div id="stack-heading">
        <SectionHeader title="Stack" note="working in / sharpening" />
      </div>

      <div className="grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((group, position) => (
          <Reveal
            key={group.domain}
            delay={position * 60}
            className="bg-bg p-6 transition-colors hover:bg-bg-raise"
          >
            <h3 className="text-[15px] font-medium tracking-[-0.01em] text-ink">{group.domain}</h3>

            <ul className="mt-5 flex flex-wrap gap-1.5">
              {group.working.map((item) => (
                <li
                  key={item}
                  className="border border-rule-bright px-2.5 py-1 font-mono text-[11px] text-ink-dim"
                >
                  {item}
                </li>
              ))}
            </ul>

            {group.sharpening.length > 0 ? (
              <>
                <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                  Sharpening
                </p>
                <ul className="mt-2.5 flex flex-wrap gap-1.5">
                  {group.sharpening.map((item) => (
                    <li
                      key={item}
                      className="border border-dashed border-rule-bright px-2.5 py-1 font-mono text-[11px] text-ink-faint"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </Reveal>
        ))}

        {/* Filler so the last grid row completes and the rule background
            behind the gap never shows through as an empty tile. */}
        <div aria-hidden="true" className="hidden bg-bg sm:block" />
      </div>
      </div>
    </section>
  )
}
