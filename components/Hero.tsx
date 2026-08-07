import { useId } from 'react'

export function Hero() {
  const grainFilterId = useId() + '-hero-grain-filter'

  return (
    <section id="hero" aria-labelledby="hero-heading" className="relative h-screen bg-background">
      {/*
        Fixed + negative z-index so this stays behind every section's normal-flow
        content regardless of DOM nesting. position:fixed is contained by the
        nearest ancestor with transform/filter/perspective/contain — with none
        present on Hero's ancestors, that's the root, so a non-negative z-index
        would paint in the root's "positioned, z>=0" step, which runs after later
        sections' in-flow content and would show through once those get real
        content. Negative z-index avoids that.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            'linear-gradient(color-mix(in srgb, var(--color-texture-overlay) 10%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-texture-overlay) 10%, transparent) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Atmosphere layer A — warm radial glow behind the hero name */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            'radial-gradient(ellipse 75% 55% at 50% 42%, rgba(247,110,0,0.08) 0%, rgba(247,110,0,0.03) 40%, transparent 70%)',
        }}
      />

      {/* Atmosphere layer D — vignette + diagonal sheen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,0.45) 100%), linear-gradient(170deg, rgba(255,255,255,0.012) 0%, transparent 40%, rgba(0,0,0,0.08) 100%)',
        }}
      />

      {/* Atmosphere layer B — feTurbulence grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[4] mix-blend-overlay"
        style={{ backgroundColor: 'white', opacity: 0.045, filter: `url(#${grainFilterId})` }}
      />
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id={grainFilterId} x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves={3} seed={5} stitchTiles="stitch" />
        </filter>
      </svg>

      <div className="relative z-[5] flex h-full flex-col items-center justify-center px-gutter-mobile pt-[var(--nav-height)] text-center md:px-gutter-tablet lg:px-gutter-desktop">
        <h1 id="hero-heading" className="text-[40px] font-bold leading-[1.05] tracking-[-0.02em] text-on-background md:text-[72px] md:leading-[1.0] md:tracking-[-0.03em]">
          Stephan Maready
        </h1>
        <p className="mt-5 font-mono text-[14px] leading-[1.5] text-on-background-dim md:text-[18px] md:tracking-[0.02em]">
          Game Developer · Graphics Engineer · ML Engineer
        </p>
        <a
          href="#projects"
          className="mt-12 rounded-sm bg-accent px-7 py-3 font-mono text-[14px] font-medium leading-[1.4] tracking-[0.04em] text-accent-on transition-colors hover:bg-[#FF8A1A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Explore Projects
        </a>
      </div>
    </section>
  )
}
