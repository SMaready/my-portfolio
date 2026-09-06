'use client'

import { useState } from 'react'
import { projects, type Project } from '@/data/projects'
import { cn } from '@/lib/cn'
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

function ProjectRow({ project, isOpen, onToggle }: { project: Project; isOpen: boolean; onToggle: () => void }) {
  const panelId = `project-panel-${project.id}`
  const buttonId = `project-button-${project.id}`

  return (
    <div className="border-b border-rule">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="group grid w-full cursor-pointer grid-cols-[2.5rem_1fr_auto] items-start gap-x-4 py-7 text-left transition-colors hover:bg-bg-raise md:grid-cols-[3.5rem_1fr_11rem] md:gap-x-8 md:px-3"
        >
          <span className="pt-1 font-mono text-[12px] text-ink-faint transition-colors group-hover:text-accent">
            {project.index}
          </span>

          <span className="min-w-0">
            <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-[1.35rem] font-medium leading-tight tracking-[-0.02em] text-ink transition-colors group-hover:text-accent md:text-[1.6rem]">
                {project.title}
              </span>
              <span className="font-mono text-[11px] text-ink-faint">{project.kicker}</span>
            </span>

            <span className="mt-2 block max-w-[62ch] text-[14px] leading-relaxed text-ink-dim">
              {project.summary}
            </span>

            <span className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-ink-faint">
              {project.stack.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </span>
          </span>

          <span className="hidden flex-col items-end gap-2 pt-1 md:flex">
            <StatusDot status={project.status} />
            <span className="font-mono text-[11px] text-ink-faint">{project.year}</span>
            <span
              aria-hidden="true"
              className={cn(
                'mt-1 font-mono text-[11px] text-ink-faint transition-transform group-hover:text-accent',
                isOpen && 'rotate-45'
              )}
            >
              +
            </span>
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        className="pb-10 md:px-3"
      >
        <div className="grid gap-x-8 gap-y-8 md:grid-cols-[3.5rem_1fr] md:gap-x-8">
          <div aria-hidden="true" className="hidden md:block" />

          <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
            <div className="space-y-4">
              {project.detail.map((paragraph) => (
                <p key={paragraph.slice(0, 28)} className="max-w-[62ch] text-[14px] leading-relaxed text-ink-dim">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="space-y-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                  Highlights
                </p>
                <ul className="mt-3 space-y-2">
                  {project.highlights.map((item) => (
                    <li key={item} className="flex gap-3 text-[13px] leading-relaxed text-ink-dim">
                      <span aria-hidden="true" className="mt-[0.55em] h-px w-3 shrink-0 bg-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                  Domain
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-rule-bright px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-dim"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProjectsSection() {
  const [openId, setOpenId] = useState<string | null>(projects[0]?.id ?? null)

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="mx-auto w-full max-w-[var(--page-max)] scroll-mt-[var(--nav-height)] px-gutter-mobile py-24 md:px-gutter-tablet md:py-32 lg:px-gutter-desktop"
    >
      <div id="work-heading">
        <SectionHeader index="02" title="Selected work" note={`${projects.length} projects`} />
      </div>

      <Reveal className="border-t border-rule">
        {projects.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            isOpen={openId === project.id}
            onToggle={() => setOpenId((current) => (current === project.id ? null : project.id))}
          />
        ))}
      </Reveal>
    </section>
  )
}
