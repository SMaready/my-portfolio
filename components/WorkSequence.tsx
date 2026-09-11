'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { projects, type DomainTag, type Project } from '@/data/projects'
import { smoothstep } from '@/lib/terrain'
import { cn } from '@/lib/cn'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import { ProjectCard } from './ProjectCard'
import { Reveal } from './Reveal'

const STAGES = [
  { key: 'compiling', label: 'Compiling', caption: 'Each one, start to finish.' },
  { key: 'linking', label: 'Linking', caption: 'And everything they were built on.' },
  { key: 'running', label: 'Running', caption: 'Ready.' },
] as const

const STAGE_EDGES = [0, 0.34, 0.62]
const STAGGER = 0.03

/** Deliberate order, not data order. Filtered to whatever the projects use. */
const TAG_ORDER: DomainTag[] = [
  'Graphics & Rendering',
  'Engines & XR',
  'Game Dev',
  'Systems',
  'Machine Learning',
]

/** Scroll budget, in screen-heights. */
const BUILD_SCREENS = 2.6
const HANDOFF_SCREENS = 0.5
/** Per transition between cards. Generous on purpose — this is the slide. */
const CARD_SCREENS = 1.25

/**
 * Share of a card's segment held still at each end. A card therefore rests
 * dead centre for DWELL * 2 of a segment, and slides across the remainder.
 */
const DWELL = 0.24

function stageIndex(p: number) {
  let index = 0
  for (let i = 0; i < STAGE_EDGES.length; i++) if (p >= STAGE_EDGES[i]) index = i
  return index
}

function useTagFilter() {
  const [selected, setSelected] = useState<Set<DomainTag>>(new Set())

  const tags = useMemo(() => {
    const used = new Set(projects.flatMap((p) => p.tags))
    return TAG_ORDER.filter((tag) => used.has(tag)).map((tag) => ({
      tag,
      count: projects.filter((p) => p.tags.includes(tag)).length,
    }))
  }, [])

  // An empty selection means everything. That keeps the default state "all of
  // it" rather than "nothing until you choose".
  const visible = useMemo(
    () =>
      selected.size === 0
        ? projects
        : projects.filter((p) => p.tags.some((tag) => selected.has(tag))),
    [selected]
  )

  function toggle(tag: DomainTag) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  return { selected, setSelected, tags, visible, toggle }
}

function FilterChips({
  tags,
  selected,
  toggle,
  clear,
  total,
  shown,
}: {
  tags: { tag: DomainTag; count: number }[]
  selected: Set<DomainTag>
  toggle: (tag: DomainTag) => void
  clear: () => void
  total: number
  shown: number
}) {
  return (
    <div className="mx-auto w-full max-w-[var(--page-max)] px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          Build
        </span>

        <button
          type="button"
          onClick={clear}
          aria-pressed={selected.size === 0}
          className={cn(
            'cursor-pointer border px-2.5 py-1 font-mono text-[11px] transition-colors',
            selected.size === 0
              ? 'border-accent text-accent'
              : 'border-rule-bright text-ink-dim hover:border-ink-dim hover:text-ink'
          )}
        >
          everything
        </button>

        {tags.map(({ tag, count }) => {
          const on = selected.has(tag)
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              aria-pressed={on}
              className={cn(
                'cursor-pointer border px-2.5 py-1 font-mono text-[11px] transition-colors',
                on
                  ? 'border-accent text-accent'
                  : 'border-rule-bright text-ink-dim hover:border-ink-dim hover:text-ink'
              )}
            >
              {tag.toLowerCase()} <span className="text-ink-faint">{count}</span>
            </button>
          )
        })}

        <span className="ml-auto font-mono text-[11px] text-ink-faint">
          {shown} / {total}
        </span>
      </div>
      <div className="mt-5 h-px w-full bg-rule" />
    </div>
  )
}

function BuildRows({
  visible,
  rowsRef,
}: {
  visible: Project[]
  rowsRef: React.RefObject<Record<string, HTMLElement | null>>
}) {
  return (
    <ol className="mt-8 space-y-px border-t border-rule md:mt-10">
      {visible.map((project, index) => (
        <li
          key={project.id}
          ref={(node) => {
            rowsRef.current[`root-${index}`] = node
          }}
          className="border-b border-rule py-3 opacity-[0.12] md:py-4"
        >
          <div className="flex items-center gap-4 md:gap-8">
            <span
              aria-hidden="true"
              ref={(node) => {
                rowsRef.current[`dot-${index}`] = node
              }}
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-rule-bright transition-colors duration-300"
            />
            <span className="min-w-0 flex-1 truncate text-[15px] font-medium tracking-[-0.01em] text-ink md:text-[18px]">
              {project.title}
            </span>
            <span aria-hidden="true" className="hidden h-[2px] w-[26%] shrink-0 bg-rule-bright sm:block">
              <span
                ref={(node) => {
                  rowsRef.current[`bar-${index}`] = node
                }}
                className="block h-[2px] w-0 bg-accent"
              />
            </span>
            <span
              ref={(node) => {
                rowsRef.current[`ready-${index}`] = node
              }}
              className="w-14 shrink-0 text-right font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint opacity-0"
            >
              ready
            </span>
          </div>
          <div
            ref={(node) => {
              rowsRef.current[`deps-${index}`] = node
            }}
            className="ml-[1.625rem] mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-ink-faint opacity-0 md:ml-[2.375rem]"
          >
            {project.stack.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </li>
      ))}
    </ol>
  )
}

/**
 * The build sequence and the card rail share one pinned frame: the rows fade
 * out and the cards fade in at the same place on screen, rather than the cards
 * living in a separate section further down the page.
 *
 * Everything scroll-driven is written straight to the DOM. Only the stage label
 * and the current card index go through React, and only when they change.
 */
function PinnedSequence() {
  const { selected, setSelected, tags, visible, toggle } = useTagFilter()

  const sectionRef = useRef<HTMLElement>(null)
  const buildLayerRef = useRef<HTMLDivElement>(null)
  const cardLayerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLSpanElement>(null)
  const slidesRef = useRef<(HTMLDivElement | null)[]>([])
  const rowsRef = useRef<Record<string, HTMLElement | null>>({})

  const [stage, setStage] = useState(0)
  const [cardIndex, setCardIndex] = useState(0)

  const count = visible.length
  const railScreens = count > 1 ? (count - 1) * CARD_SCREENS : 0.5
  const totalTravel = BUILD_SCREENS + HANDOFF_SCREENS + railScreens

  useEffect(() => {
    let raf = 0
    let targetP = 0
    let currentP = 0
    let last = performance.now()
    let slot = window.innerWidth
    let stageNow = -1
    let indexNow = -1

    const buildEnd = BUILD_SCREENS / totalTravel
    const handoffEnd = (BUILD_SCREENS + HANDOFF_SCREENS) / totalTravel
    const lastCard = Math.max(0, count - 1)

    function measure() {
      const section = sectionRef.current
      if (!section) return
      slot = slidesRef.current[0]?.offsetWidth || window.innerWidth
      const rect = section.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      targetP = travel <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / travel))
      if (!raf) raf = window.requestAnimationFrame(tick)
    }

    function apply(p: number) {
      // ── Build phase ──────────────────────────────────────────────────────
      const buildP = Math.min(1, p / buildEnd)
      const buildOut = smoothstep(buildEnd, buildEnd + (handoffEnd - buildEnd) * 0.55, p)
      if (buildLayerRef.current) {
        buildLayerRef.current.style.opacity = String(1 - buildOut)
        buildLayerRef.current.style.pointerEvents = buildOut > 0.5 ? 'none' : 'auto'
      }

      for (let i = 0; i < count; i++) {
        const offset = i * STAGGER
        const appear = smoothstep(offset, 0.14 + offset, buildP)
        const compiled = smoothstep(0.08 + offset, 0.38 + offset, buildP)
        const linked = smoothstep(0.36 + offset, 0.6 + offset, buildP)
        const ran = smoothstep(0.6 + offset, 0.78 + offset, buildP)

        const root = rowsRef.current[`root-${i}`]
        const bar = rowsRef.current[`bar-${i}`]
        const deps = rowsRef.current[`deps-${i}`]
        const ready = rowsRef.current[`ready-${i}`]
        const dot = rowsRef.current[`dot-${i}`]

        if (root) root.style.opacity = String(0.12 + appear * 0.88)
        if (bar) bar.style.width = `${compiled * 100}%`
        if (deps) deps.style.opacity = String(linked)
        if (ready) ready.style.opacity = String(ran)
        if (dot) {
          dot.style.backgroundColor = ran > 0.5 ? 'var(--color-accent)' : 'var(--color-rule-bright)'
        }
      }

      const nextStage = stageIndex(buildP)
      if (nextStage !== stageNow) {
        stageNow = nextStage
        setStage(nextStage)
      }

      // ── Card phase, arriving in the same frame the rows just left ────────
      const cardsIn = smoothstep(buildEnd + (handoffEnd - buildEnd) * 0.45, handoffEnd, p)
      if (cardLayerRef.current) {
        cardLayerRef.current.style.opacity = String(cardsIn)
        cardLayerRef.current.style.pointerEvents = cardsIn > 0.5 ? 'auto' : 'none'
      }

      const railP = Math.min(1, Math.max(0, (p - handoffEnd) / (1 - handoffEnd)))
      const segment = railP * lastCard
      const step = Math.max(0, Math.min(Math.max(0, lastCard - 1), Math.floor(segment)))
      const withinStep = segment - step
      const moving = Math.min(1, Math.max(0, (withinStep - DWELL) / (1 - DWELL * 2)))
      const position = lastCard === 0 ? 0 : step + smoothstep(0, 1, moving)

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${-position * slot}px, 0, 0)`
      }
      slidesRef.current.forEach((slide, i) => {
        if (slide) slide.style.opacity = String(1 - Math.min(1, Math.abs(i - position)) * 0.8)
      })
      if (railRef.current) {
        railRef.current.style.width = `${((position + 1) / Math.max(1, count)) * 100}%`
      }

      const nextIndex = Math.min(lastCard, Math.round(position))
      if (nextIndex !== indexNow) {
        indexNow = nextIndex
        setCardIndex(nextIndex)
      }
    }

    function tick(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      // Softer than before: a fast flick gets damped into a slide rather than
      // teleporting the track to wherever the scroll landed.
      const k = 1 - Math.exp(-dt * 9)
      currentP += (targetP - currentP) * k
      const settled = Math.abs(targetP - currentP) < 0.0002
      if (settled) currentP = targetP
      apply(currentP)
      raf = settled ? 0 : window.requestAnimationFrame(tick)
    }

    measure()
    apply(currentP)
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [count, totalTravel])

  // Changing the filter replays the build from the top. It also sidesteps the
  // section changing height underneath someone mid-scroll.
  function jumpToStart() {
    const section = sectionRef.current
    if (!section) return
    const rect = section.getBoundingClientRect()
    if (rect.top > 0 || rect.bottom < window.innerHeight) return
    window.scrollTo({ top: rect.top + window.scrollY, behavior: 'instant' as ScrollBehavior })
  }

  function handleToggle(tag: DomainTag) {
    toggle(tag)
    requestAnimationFrame(jumpToStart)
  }

  function handleClear() {
    setSelected(new Set())
    requestAnimationFrame(jumpToStart)
  }

  return (
    <section
      id="work"
      ref={sectionRef}
      aria-labelledby="work-heading"
      className="relative z-10 bg-bg"
      style={{ height: `${(totalTravel + 1) * 100}svh` }}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden pt-[var(--nav-height)]">
        <h2 id="work-heading" className="sr-only">
          Selected work
        </h2>

        <div className="pt-8">
          <FilterChips
            tags={tags}
            selected={selected}
            toggle={handleToggle}
            clear={handleClear}
            total={projects.length}
            shown={count}
          />
        </div>

        {/* Both layers fill the same box, so the cards arrive exactly where the
            rows were rather than one screen further down. */}
        <div className="relative min-h-0 flex-1">
          <div
            ref={buildLayerRef}
            className="absolute inset-0 flex flex-col justify-center overflow-hidden"
          >
            <div className="mx-auto w-full max-w-[var(--page-max)] px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop">
              <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
                <p className="text-[clamp(2rem,5.5vw,4rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-ink">
                  {STAGES[stage].label}
                </p>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                  {String(stage + 1).padStart(2, '0')} / {String(STAGES.length).padStart(2, '0')}
                </p>
              </div>
              <p className="mt-3 font-mono text-[13px] text-ink-dim">{STAGES[stage].caption}</p>
              <BuildRows visible={visible} rowsRef={rowsRef} />
            </div>
          </div>

          <div
            ref={cardLayerRef}
            className="pointer-events-none absolute inset-0 flex flex-col justify-center overflow-hidden opacity-0"
          >
            <div ref={trackRef} className="flex will-change-transform">
              {visible.map((project, i) => (
                <div
                  key={project.id}
                  ref={(node) => {
                    slidesRef.current[i] = node
                  }}
                  className="flex w-screen shrink-0 justify-center px-gutter-mobile md:px-gutter-tablet"
                >
                  <div className="w-[min(90vw,1120px)]" style={{ height: 'min(64svh, 640px)' }}>
                    <ProjectCard project={project} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-6 w-full max-w-[var(--page-max)] px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop">
              <div className="flex items-center gap-4">
                <span className="font-mono text-[11px] text-ink-faint">
                  {String(Math.min(cardIndex + 1, count)).padStart(2, '0')} /{' '}
                  {String(count).padStart(2, '0')}
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
        </div>
      </div>
    </section>
  )
}

/** Small screens and reduced motion: the same filter, then a plain stack. */
function StackedSequence() {
  const { selected, tags, visible, toggle, setSelected } = useTagFilter()

  return (
    <section id="work" aria-labelledby="work-heading" className="relative z-10 bg-bg">
      <div className="mx-auto w-full max-w-[var(--page-max)] py-24 md:py-32">
        <h2 id="work-heading" className="sr-only">
          Selected work
        </h2>

        <FilterChips
          tags={tags}
          selected={selected}
          toggle={toggle}
          clear={() => setSelected(new Set())}
          total={projects.length}
          shown={visible.length}
        />

        <div className="mt-10 space-y-6 px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop">
          {visible.map((project, position) => (
            <Reveal key={project.id} delay={position * 40}>
              <div style={{ minHeight: 'min(70svh, 620px)' }}>
                <ProjectCard project={project} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function WorkSequence() {
  const wide = useMediaQuery('(min-width: 1024px)')
  const reduceMotion = usePrefersReducedMotion()
  return wide && !reduceMotion ? <PinnedSequence /> : <StackedSequence />
}
