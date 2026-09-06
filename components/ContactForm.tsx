'use client'

import { useEffect, useState } from 'react'
import { contact } from '@/data/about'
import { SectionHeader } from './SectionHeader'
import { Reveal } from './Reveal'

export function ContactForm() {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2200)
    return () => clearTimeout(timer)
  }, [copied])

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(contact.email)
      setCopied(true)
    } catch {
      // Clipboard can be blocked (insecure context, permissions). The mailto
      // link beside this button still works, so fail quietly.
      setCopied(false)
    }
  }

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="mx-auto w-full max-w-[var(--page-max)] px-gutter-mobile py-24 md:px-gutter-tablet md:py-32 lg:px-gutter-desktop"
    >
      <div id="contact-heading">
        <SectionHeader index="06" title="Contact" />
      </div>

      <Reveal className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <div>
          <p className="max-w-[54ch] text-[17px] leading-relaxed text-ink md:text-[19px]">
            I&apos;m looking for a Summer 2027 internship in Unreal Engine work, graphics
            programming, or simulation. If you have one — or you just want to talk about
            renderers — the fastest way to reach me is email.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${contact.email}`}
              className="border border-accent bg-accent px-6 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-bg-sink transition-colors hover:bg-transparent hover:text-accent"
            >
              {contact.email}
            </a>
            <button
              type="button"
              onClick={copyEmail}
              className="cursor-pointer border border-rule-bright px-5 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-ink-dim transition-colors hover:border-ink-dim hover:text-ink"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p aria-live="polite" className="sr-only">
            {copied ? 'Email address copied to clipboard' : ''}
          </p>
        </div>

        <dl className="divide-y divide-rule border-y border-rule">
          <div className="flex items-baseline justify-between gap-6 py-4">
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              GitHub
            </dt>
            <dd>
              <a
                href={contact.github}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[13px] text-ink-dim underline-offset-4 transition-colors hover:text-accent hover:underline"
              >
                @SMaready
              </a>
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-6 py-4">
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              LinkedIn
            </dt>
            <dd>
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[13px] text-ink-dim underline-offset-4 transition-colors hover:text-accent hover:underline"
              >
                stephan-maready
              </a>
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-6 py-4">
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              Location
            </dt>
            <dd className="font-mono text-[13px] text-ink-dim">Fullerton, CA</dd>
          </div>
        </dl>
      </Reveal>
    </section>
  )
}
