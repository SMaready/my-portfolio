'use client'

import { useEffect, useRef, useState } from 'react'
import { projects } from '@/data/projects'
import { smoothstep } from '@/lib/terrain'
import { cn } from '@/lib/cn'

const STAGES = [
  { key: 'compiling', label: 'Compiling', caption: 'Six projects, each one start to finish.' },
  { key: 'linking', label: 'Linking', caption: 'And everything they were built on.' },
  { key: 'running', label: 'Running', caption: 'Ready.' },
] as const

const STAGE_EDGES = [0, 0.34, 0.62]

/** Rows resolve one after another rather than together — that is what makes it read as a build. */
const STAGGER = 0.03

function stageIndex(p: number) {
  let index = 0
  for (let i = 0; i < STAGE_EDGES.length; i++) if (p >= STAGE_EDGES[i]) index = i
  return index
}

type RowNodes = {
  root: HTMLLIElement | null
  dot: HTMLSpanElement | null
  bar: HTMLSpanElement | null
  ready: HTMLSpanElement | null
  deps: HTMLDivElement | null
}

export function BuildSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const rowsRef = useRef<RowNodes[]>([])

  // Only the stage label lives in React state — it changes three times over the
  // whole section. Everything else is written straight to the DOM, because
  // re-rendering six rows through React on every scroll frame is itself a
  // source of the stutter it is trying to animate away.
  const [active, setActive] = useState(0)

  useEffect(() => {
    let raf = 0
    let target = 0
    let current = 0
    let last = performance.now()
    let activeNow = 0

    function measure() {
      const section = sectionRef.current
      if (!section) return
      const rect = section.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      target = travel <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / travel))
      if (!raf) raf = window.requestAnimationFrame(tick)
    }

    function apply(p: number) {
      const sticky = stickyRef.current
      if (sticky) {
        // Hold on Running for a good stretch, then leave — quick, but a fade
        // rather than a snap, so the section hands over instead of blinking out.
        sticky.style.opacity = String(1 - smoothstep(0.88, 0.95, p))
      }

      rowsRef.current.forEach((row, index) => {
        const offset = index * STAGGER
        const appear = smoothstep(offset, 0.14 + offset, p)
        const compiled = smoothstep(0.08 + offset, 0.38 + offset, p)
        const linked = smoothstep(0.36 + offset, 0.6 + offset, p)
        const ran = smoothstep(0.6 + offset, 0.78 + offset, p)

        if (row.root) row.root.style.opacity = String(0.12 + appear * 0.88)
        if (row.bar) row.bar.style.width = `${compiled * 100}%`
        if (row.deps) row.deps.style.opacity = String(linked)
        if (row.ready) row.ready.style.opacity = String(ran)
        if (row.dot) row.dot.style.backgroundColor = ran > 0.5 ? 'var(--color-accent)' : 'var(--color-rule-bright)'
      })

      const next = stageIndex(p)
      if (next !== activeNow) {
        activeNow = next
        setActive(next)
      }
    }

    function tick(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      // Frame-rate independent smoothing. Wheel and trackpad scroll arrives in
      // chunks; easing toward the scroll position is what turns those steps
      // into continuous motion.
      const k = 1 - Math.exp(-dt * 14)
      current += (target - current) * k

      const settled = Math.abs(target - current) < 0.0004
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
      id="build"
      ref={sectionRef}
      aria-label="What is on this site"
      className="relative z-10 h-[300svh] bg-bg md:h-[360svh]"
    >
      <div
        ref={stickyRef}
        className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden pt-[var(--nav-height)]"
      >
        <div className="mx-auto w-full max-w-[var(--page-max)] px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop">
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <h2 className="text-[clamp(2.2rem,6.5vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-ink">
              {STAGES[active].label}
            </h2>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
              {String(active + 1).padStart(2, '0')} / {String(STAGES.length).padStart(2, '0')}
            </p>
          </div>

          <p className="mt-3 font-mono text-[13px] text-ink-dim">{STAGES[active].caption}</p>

          <ol className="mt-7 space-y-px border-t border-rule md:mt-14">
            {projects.map((project, index) => (
              <li
                key={project.id}
                ref={(node) => {
                  rowsRef.current[index] = { ...(rowsRef.current[index] ?? {}), root: node } as RowNodes
                }}
                className="border-b border-rule py-3 opacity-[0.12] md:py-5"
              >
                <div className="flex items-center gap-4 md:gap-8">
                  <span
                    aria-hidden="true"
                    ref={(node) => {
                      rowsRef.current[index] = { ...(rowsRef.current[index] ?? {}), dot: node } as RowNodes
                    }}
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-rule-bright transition-colors duration-300"
                  />

                  <span className="min-w-0 flex-1 truncate text-[15px] font-medium tracking-[-0.01em] text-ink md:text-[18px]">
                    {project.title}
                  </span>

                  <span
                    aria-hidden="true"
                    className="hidden h-[2px] w-[26%] shrink-0 bg-rule-bright sm:block"
                  >
                    <span
                      ref={(node) => {
                        rowsRef.current[index] = { ...(rowsRef.current[index] ?? {}), bar: node } as RowNodes
                      }}
                      className="block h-[2px] w-0 bg-accent"
                    />
                  </span>

                  <span
                    ref={(node) => {
                      rowsRef.current[index] = { ...(rowsRef.current[index] ?? {}), ready: node } as RowNodes
                    }}
                    className="w-14 shrink-0 text-right font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint opacity-0"
                  >
                    ready
                  </span>
                </div>

                <div
                  ref={(node) => {
                    rowsRef.current[index] = { ...(rowsRef.current[index] ?? {}), deps: node } as RowNodes
                  }}
                  className={cn(
                    'ml-[1.625rem] mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-ink-faint opacity-0 md:ml-[2.375rem]'
                  )}
                >
                  {project.stack.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
