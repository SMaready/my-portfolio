'use client'

import { useEffect, useRef, useState } from 'react'
import { projects, type Project } from '@/data/projects'
import { cn } from '@/lib/cn'
import { smoothstep } from '@/lib/terrain'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import { Reveal } from './Reveal'
import { SectionHeader } from './SectionHeader'

function StatusDot({ status }: { status: Project['status'] }) {
  const active = status === 'In development'
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
      <span
        aria-hidden="true"
        className={cn('h-1.5 w-1.5 rounded-full', active ? 'bg-signal' : 'bg-ink-faint')}
      />
      {status}
    </span>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="flex h-full flex-col overflow-hidden border border-rule bg-bg-raise p-6 md:p-8">
      <div className="flex items-baseline justify-between gap-6">
        <span className="font-mono text-[12px] text-ink-faint">{project.index}</span>
        <StatusDot status={project.status} />
      </div>

      <h3 className="mt-5 text-[clamp(1.6rem,2.6vw,2.4rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-ink">
        {project.title}
      </h3>

      <p className="mt-2 font-mono text-[11px] text-ink-faint">
        {project.kicker} · {project.year}
      </p>

      <p className="mt-4 max-w-[52ch] text-[14.5px] leading-relaxed text-ink">{project.summary}</p>

      <div className="mt-5 grid min-h-0 flex-1 gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-9">
        <div
          className="min-h-0 space-y-3 overflow-y-auto pr-1"
          style={{
            // A half-clipped last line reads as a bug; a fade reads as "more below".
            maskImage: 'linear-gradient(to bottom, #000 calc(100% - 28px), transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, #000 calc(100% - 28px), transparent)',
          }}
        >
          {project.detail.map((paragraph) => (
            <p
              key={paragraph.slice(0, 28)}
              className="text-[12.5px] leading-relaxed text-ink-dim"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="min-h-0 space-y-5 overflow-y-auto pr-1">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              Highlights
            </p>
            <ul className="mt-2.5 space-y-1.5">
              {project.highlights.map((item) => (
                <li key={item} className="flex gap-3 text-[12px] leading-relaxed text-ink-dim">
                  <span aria-hidden="true" className="mt-[0.6em] h-px w-2.5 shrink-0 bg-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((item) => (
              <span
                key={item}
                className="border border-rule-bright px-2 py-0.5 font-mono text-[10px] text-ink-dim"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-rule pt-4">
        {project.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-[12px] text-accent underline-offset-4 hover:underline"
          >
            {link.label}
            <span aria-hidden="true">&#8599;</span>
          </a>
        ))}
        {project.privateRepo ? (
          <span className="font-mono text-[11px] text-ink-faint">
            Private repository — walkthrough available on request
          </span>
        ) : null}
      </div>
    </article>
  )
}

/**
 * Pinned rail: one project on screen at a time. Vertical scroll drives the
 * track sideways, so the current card leaves to the left as the next arrives
 * from the right, and reverses exactly when you scroll back.
 *
 * Two things keep it smooth. The transform is written straight to the DOM
 * rather than going through React state, because re-rendering six full project
 * cards on every scroll frame is far more work than the animation itself. And
 * the position eases toward the scroll target instead of snapping to it —
 * wheel and trackpad scroll arrives in chunks, and easing is what turns those
 * steps into continuous motion.
 */
function ProjectRail() {
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLSpanElement>(null)
  const slidesRef = useRef<(HTMLDivElement | null)[]>([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    let raf = 0
    let target = 0
    let current = 0
    let last = performance.now()
    let slot = window.innerWidth
    let indexNow = 0

    const lastCard = projects.length - 1

    // Dead zones at each end of the track. Without the first one the card is
    // already sliding while it is still fading in; without the second the last
    // card never gets a beat centred before the section lets go.
    const HOLD_IN = 0.08
    const HOLD_OUT = 0.06

    // Each card's scroll segment is part rest, part move. Without this the
    // position is a straight function of scroll, so a card is only perfectly
    // centred at a single pixel of scroll and stopping anywhere else leaves it
    // half off-screen. DWELL is the share of a segment held still at each end,
    // so a card rests centred for DWELL * 2 of a segment across the boundary.
    const DWELL = 0.28

    function measure() {
      const section = sectionRef.current
      if (!section) return
      slot = slidesRef.current[0]?.offsetWidth || window.innerWidth
      const rect = section.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      target = travel <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / travel))
      if (!raf) raf = window.requestAnimationFrame(tick)
    }

    function apply(p: number) {
      // Invisible until the section pins, then fades in already centred, so it
      // arrives in place instead of sliding up from the bottom of the screen.
      if (stickyRef.current) stickyRef.current.style.opacity = String(smoothstep(0, 0.05, p))

      const travelled = Math.min(
        1,
        Math.max(0, (p - HOLD_IN) / (1 - HOLD_IN - HOLD_OUT))
      )

      const segment = travelled * lastCard
      const step = Math.max(0, Math.min(lastCard - 1, Math.floor(segment)))
      const withinStep = segment - step
      const moving = Math.min(1, Math.max(0, (withinStep - DWELL) / (1 - DWELL * 2)))
      const position = step + smoothstep(0, 1, moving)

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${-position * slot}px, 0, 0)`
      }

      slidesRef.current.forEach((slide, i) => {
        if (!slide) return
        const distance = Math.min(1, Math.abs(i - position))
        slide.style.opacity = String(1 - distance * 0.8)
      })

      if (railRef.current) {
        railRef.current.style.width = `${((position + 1) / projects.length) * 100}%`
      }

      const next = Math.min(lastCard, Math.round(position))
      if (next !== indexNow) {
        indexNow = next
        setIndex(next)
      }
    }

    function tick(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      const k = 1 - Math.exp(-dt * 13)
      current += (target - current) * k

      const settled = Math.abs(target - current) < 0.0003
      if (settled) current = target
      apply(current)

      raf = settled ? 0 : window.requestAnimationFrame(tick)
    }

    measure()
    apply(current)
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <section
      id="work"
      ref={sectionRef}
      aria-labelledby="work-heading"
      className="relative z-10 bg-bg"
      style={{ height: `${projects.length * 85}svh` }}
    >
      <div
        ref={stickyRef}
        className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden pt-[var(--nav-height)] opacity-0"
      >
        <div className="mx-auto w-full max-w-[var(--page-max)] px-gutter-desktop [&_header]:mb-6">
          <div id="work-heading">
            <SectionHeader title="Selected work" note={`${projects.length} projects`} />
          </div>
        </div>

        <div ref={trackRef} className="flex will-change-transform">
          {projects.map((project, i) => (
            <div
              key={project.id}
              ref={(node) => {
                slidesRef.current[i] = node
              }}
              className="flex w-screen shrink-0 justify-center px-gutter-mobile md:px-gutter-tablet"
            >
              <div className="w-[min(90vw,1120px)]" style={{ height: 'min(66svh, 660px)' }}>
                <ProjectCard project={project} />
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-7 w-full max-w-[var(--page-max)] px-gutter-desktop">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-ink-faint">
              {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-rule-bright">
              <span ref={railRef} className="block h-px w-0 bg-accent" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
              scroll
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Small screens and reduced motion get a plain vertical stack. */
function ProjectStack() {
  return (
    <section id="work" aria-labelledby="work-heading" className="relative z-10 bg-bg">
      <div className="mx-auto w-full max-w-[var(--page-max)] px-gutter-mobile py-24 md:px-gutter-tablet md:py-32 lg:px-gutter-desktop">
        <div id="work-heading">
          <SectionHeader title="Selected work" note={`${projects.length} projects`} />
        </div>

        <div className="space-y-6">
          {projects.map((project, position) => (
            <Reveal key={project.id} delay={position * 40}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ProjectsSection() {
  const wide = useMediaQuery('(min-width: 1024px)')
  const reduceMotion = usePrefersReducedMotion()
  return wide && !reduceMotion ? <ProjectRail /> : <ProjectStack />
}
