'use client'

import { useEffect, useRef, useState } from 'react'
import { projects, type Project } from '@/data/projects'
import { cn } from '@/lib/cn'
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
 * Pinned rail: vertical scroll drives the track sideways, one project centred
 * at a time. Scroll itself is never intercepted — the section is simply tall
 * and the track reads its position, so trackpads, keyboards and scrollbars all
 * behave normally.
 */
function ProjectRail() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const [pad, setPad] = useState(0)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    let frame = 0

    function update() {
      frame = 0
      const section = sectionRef.current
      const track = trackRef.current
      if (!section || !track) return

      const card = track.firstElementChild as HTMLElement | null
      if (card) setPad(Math.max(0, (track.clientWidth - card.offsetWidth) / 2))

      const rect = section.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      const p = travel <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / travel))

      const distance = Math.max(0, track.scrollWidth - track.clientWidth)
      setOffset(-p * distance)
      setIndex(Math.min(projects.length - 1, Math.round(p * (projects.length - 1))))
    }

    function onScroll() {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <section
      id="work"
      ref={sectionRef}
      aria-labelledby="work-heading"
      className="relative z-10 bg-bg"
      style={{ height: `${projects.length * 80}svh` }}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden pt-[var(--nav-height)]">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-gutter-desktop [&_header]:mb-6">
          <div id="work-heading">
            <SectionHeader title="Selected work" note={`${projects.length} projects`} />
          </div>
        </div>

        <div
          ref={trackRef}
          className="flex w-full items-stretch gap-8 will-change-transform"
          style={{
            paddingLeft: pad,
            paddingRight: pad,
            transform: `translate3d(${offset}px,0,0)`,
          }}
        >
          {projects.map((project) => (
            <div
              key={project.id}
              className="w-[min(62vw,880px)] shrink-0"
              style={{ height: 'min(70svh, 680px)' }}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>

        <div className="mx-auto mt-7 w-full max-w-[var(--page-max)] px-gutter-desktop">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-ink-faint">
              {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-rule-bright">
              <span
                className="block h-px bg-accent transition-[width] duration-100"
                style={{ width: `${((index + 1) / projects.length) * 100}%` }}
              />
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
