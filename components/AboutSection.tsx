import { about } from '@/data/about'
import { Reveal } from './Reveal'
import { SectionHeader } from './SectionHeader'

export function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="border-t border-rule bg-bg-sink"
    >
      <div className="mx-auto w-full max-w-[var(--page-max)] px-gutter-mobile py-24 md:px-gutter-tablet md:py-32 lg:px-gutter-desktop">
        <div id="about-heading">
          <SectionHeader index="03" title="About" />
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          <Reveal className="space-y-6">
            {about.paragraphs.map((paragraph, position) => (
              <p
                key={paragraph.slice(0, 28)}
                className={
                  position === 0
                    ? 'max-w-[64ch] text-[17px] leading-relaxed text-ink md:text-[19px]'
                    : 'max-w-[64ch] text-[15px] leading-relaxed text-ink-dim'
                }
              >
                {paragraph}
              </p>
            ))}
          </Reveal>

          <Reveal delay={90}>
            <dl className="divide-y divide-rule border-y border-rule">
              {about.facts.map((fact) => (
                <div key={fact.label} className="py-4">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                    {fact.label}
                  </dt>
                  <dd className="mt-1.5 text-[14px] leading-snug text-ink-dim">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
