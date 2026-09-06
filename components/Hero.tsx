import { about } from '@/data/about'
import { GridField } from './GridField'
import { TypingLine } from './TypingLine'

function CornerTicks() {
  const base = 'pointer-events-none absolute h-3 w-3 border-rule-bright'
  return (
    <div aria-hidden="true">
      <span className={`${base} left-0 top-0 border-l border-t`} />
      <span className={`${base} right-0 top-0 border-r border-t`} />
      <span className={`${base} bottom-0 left-0 border-b border-l`} />
      <span className={`${base} bottom-0 right-0 border-b border-r`} />
    </div>
  )
}

export function Hero() {
  const { name, prefix, rotating, meta } = about.hero

  return (
    <section
      id="index"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-bg pt-[var(--nav-height)]"
    >
      <GridField />

      {/* Vignette — pulls the eye to the centre without a gradient wash. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 38%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-[var(--page-max)] px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop">
        <div className="relative py-14 md:py-20">
          <CornerTicks />

          <div className="px-5 md:px-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint">
              01 / index
            </p>

            <h1
              id="hero-heading"
              className="mt-6 text-[clamp(2.6rem,8vw,5.6rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-ink"
            >
              {name}
            </h1>

            <p className="mt-6 font-mono text-[clamp(0.95rem,2.4vw,1.35rem)] leading-tight text-ink-dim">
              {prefix}{' '}
              <TypingLine phrases={rotating} />
            </p>

            <div className="mt-12 flex flex-wrap items-center gap-3">
              <a
                href="#work"
                className="group inline-flex items-center gap-2 border border-accent bg-accent px-6 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-bg-sink transition-colors hover:bg-transparent hover:text-accent"
              >
                View work
                <span aria-hidden="true" className="transition-transform group-hover:translate-y-0.5">
                  &#8595;
                </span>
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 border border-rule-bright px-6 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-ink-dim transition-colors hover:border-ink-dim hover:text-ink"
              >
                Get in touch
              </a>
            </div>

            <dl className="mt-14 grid gap-x-10 gap-y-5 border-t border-rule pt-6 sm:grid-cols-3">
              {meta.map((item) => (
                <div key={item.label}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                    {item.label}
                  </dt>
                  <dd className="mt-1.5 text-[13px] leading-snug text-ink-dim">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
