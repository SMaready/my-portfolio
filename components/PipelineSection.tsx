'use client'

import { useEffect, useRef, useState } from 'react'
import { STAGES } from '@/lib/terrain'
import { cn } from '@/lib/cn'

/** Where each stage takes over, matched to the cross-fades in stageMix(). */
const STAGE_EDGES = [0, 0.24, 0.46, 0.66, 0.84]

function stageIndex(p: number) {
  let index = 0
  for (let i = 0; i < STAGE_EDGES.length; i++) {
    if (p >= STAGE_EDGES[i]) index = i
  }
  return index
}

/**
 * The scroll track for the render sequence. This section owns the height; the
 * terrain itself is drawn by <RenderStage />, which reads this element's
 * position. Scroll is never intercepted — the page scrolls normally and both
 * components just read the resulting number.
 */
export function PipelineSection() {
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

  return (
    <section
      id="pipeline"
      ref={sectionRef}
      aria-label="How a frame is rendered"
      // Shorter track on phones: four screens of canvas scrolling is a lot of
      // thumb work, and the fill cost is the same at any viewport size.
      className="relative z-10 h-[280svh] md:h-[420svh]"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-end overflow-hidden">
        <div className="mx-auto flex w-full max-w-[var(--page-max)] items-end justify-between gap-8 px-gutter-mobile pb-16 md:px-gutter-tablet md:pb-24 lg:px-gutter-desktop">
          <div className="max-w-[34ch]">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint">
              {String(active + 1).padStart(2, '0')} / {String(STAGES.length).padStart(2, '0')}
            </p>

            <h2 className="mt-3 text-[clamp(2.4rem,7vw,5rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-ink">
              {STAGES[active].label}
            </h2>

            <p className="mt-4 max-w-[40ch] text-[15px] leading-relaxed text-ink-dim md:text-[17px]">
              {STAGES[active].caption}
            </p>
          </div>

          {/* Stage rail — also the progress indicator for the sequence. */}
          <ol className="hidden shrink-0 flex-col items-end gap-3 md:flex">
            {STAGES.map((stage, index) => (
              <li key={stage.key} className="flex items-center gap-3">
                <span
                  className={cn(
                    'font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-300',
                    index === active ? 'text-accent' : 'text-ink-faint'
                  )}
                >
                  {stage.label}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-px transition-all duration-500',
                    index === active ? 'w-10 bg-accent' : 'w-4 bg-rule-bright'
                  )}
                />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
