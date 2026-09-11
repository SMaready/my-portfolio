import { type Project } from '@/data/projects'
import { cn } from '@/lib/cn'

export function StatusDot({ status }: { status: Project['status'] }) {
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

export function ProjectCard({ project }: { project: Project }) {
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
