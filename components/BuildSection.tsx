'use client'

import { useEffect, useRef, useState } from 'react'
import { projects } from '@/data/projects'
import { smoothstep } from '@/lib/terrain'
import { cn } from '@/lib/cn'

/**
 * Progressive forms, because the sequence is unfolding as you scroll and
 * because a real toolchain prints them that way. There is deliberately no
 * "sourcing" stage — sourcing is procurement, not compilation, and the sources
 * simply existing was never really a step.
 */
const STAGES = [
  { key: 'compiling', label: 'Compiling', caption: 'Six projects, each one start to finish.' },
  { key: 'linking', label: 'Linking', caption: 'And everything they were built on.' },
  { key: 'running', label: 'Running', caption: 'Ready.' },
] as const

const STAGE_EDGES = [0, 0.4, 0.7]

/** Rows resolve one after another rather than together — that is what makes it read as a build. */
const STAGGER = 0.035

function stageIndex(p: number) {
  let index = 0
  for (let i = 0; i < STAGE_EDGES.length; i++) if (p >= STAGE_EDGES[i]) index = i
  return index
}

export function BuildSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0

    function update() {
      frame = 0
      const section = sectionRef.current
      if (!section) return
      const rect = section.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      if (travel <= 0) return
      setProgress(Math.min(1, Math.max(0, -rect.top / travel)))
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

  const active = stageIndex(progress)

  // A hard cut, not a fade. Once the last stage has landed the whole thing
  // vanishes in a single frame — the way a build finishes and the terminal
  // hands the screen to the program — and the work rail scrolls up into the
  // gap it leaves behind.
  const launched = progress > 0.93

  return (
    <section
      id="build"
      ref={sectionRef}
      aria-label="What is on this site"
      className="relative z-10 h-[280svh] bg-bg md:h-[340svh]"
    >
      <div
        className={cn(
          'sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden',
          launched && 'opacity-0'
        )}
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

          <ol className="mt-10 space-y-px border-t border-rule md:mt-14">
            {projects.map((project, index) => {
              const offset = index * STAGGER
              const appear = smoothstep(offset, 0.16 + offset, progress)
              const compiled = smoothstep(0.1 + offset, 0.44 + offset, progress)
              const linked = smoothstep(0.42 + offset, 0.66 + offset, progress)
              const ran = smoothstep(0.68 + offset, 0.86 + offset, progress)

              return (
                <li
                  key={project.id}
                  className="border-b border-rule py-4 md:py-5"
                  style={{ opacity: 0.12 + appear * 0.88 }}
                >
                  <div className="flex items-center gap-4 md:gap-8">
                    <span
                      aria-hidden="true"
                      className={cn(
                        'h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-300',
                        ran > 0.5 ? 'bg-accent' : 'bg-rule-bright'
                      )}
                    />

                    <span className="min-w-0 flex-1 truncate text-[15px] font-medium tracking-[-0.01em] text-ink md:text-[18px]">
                      {project.title}
                    </span>

                    {/* Compile bar */}
                    <span
                      aria-hidden="true"
                      className="hidden h-[2px] w-[26%] shrink-0 bg-rule-bright sm:block"
                    >
                      <span
                        className="block h-[2px] bg-accent"
                        style={{ width: `${compiled * 100}%` }}
                      />
                    </span>

                    <span
                      className="w-14 shrink-0 text-right font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint"
                      style={{ opacity: ran }}
                    >
                      ready
                    </span>
                  </div>

                  {/* Link stage: what each project is actually built on. */}
                  <div
                    className="ml-[1.625rem] mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-ink-faint md:ml-[2.375rem]"
                    style={{ opacity: linked }}
                  >
                    {project.stack.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
