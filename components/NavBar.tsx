'use client'

import { useEffect, useRef, useState } from 'react'
import { about, contact } from '@/data/about'
import { cn } from '@/lib/cn'

// `sections` is what the scroll-spy watches; `href` is where the link goes.
// The build sequence and the cards share one pinned section, so Work lands on
// Compiling and stays lit right through to the last card.
const NAV_LINKS = [
  { label: 'Work', href: '#work', sections: ['work'] },
  { label: 'About', href: '#about', sections: ['about'] },
  { label: 'Stack', href: '#stack', sections: ['stack'] },
  { label: 'Now', href: '#now', sections: ['now'] },
  { label: 'Contact', href: '#contact', sections: ['contact'] },
] as const

const STATUS =
  about.hero.meta.find((item) => item.label === 'Status')?.value ??
  'Open to Summer 2027 internships'

const SOCIAL_LINKS = [
  { label: 'GitHub', href: contact.github },
  { label: 'LinkedIn', href: contact.linkedin },
] as const

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 5.02 3.26 9.28 7.77 10.78.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.16.69-3.83-1.34-3.83-1.34-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.74 2.65 1.23 3.3.94.1-.74.4-1.23.72-1.51-2.52-.29-5.17-1.26-5.17-5.6 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.16a10.9 10.9 0 0 1 5.73 0c2.19-1.47 3.15-1.16 3.15-1.16.62 1.57.23 2.73.11 3.02.73.79 1.17 1.8 1.17 3.04 0 4.35-2.65 5.31-5.18 5.59.41.35.77 1.04.77 2.1 0 1.52-.01 2.74-.01 3.11 0 .3.2.66.79.55A11.26 11.26 0 0 0 23.25 11.75C23.25 5.48 18.27.5 12 .5Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.83v1.64h.05c.53-.98 1.83-2.02 3.77-2.02 4.03 0 4.77 2.5 4.77 5.76V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4V9Z" />
    </svg>
  )
}

function SocialIcon({ label }: { label: 'GitHub' | 'LinkedIn' }) {
  return label === 'GitHub' ? <GitHubIcon /> : <LinkedInIcon />
}

function MenuGlyph({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      aria-hidden="true"
    >
      {open ? (
        <>
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </>
      ) : (
        <>
          <line x1="3" y1="8" x2="21" y2="8" />
          <line x1="3" y1="16" x2="21" y2="16" />
        </>
      )}
    </svg>
  )
}

export function NavBar() {
  const [activeLink, setActiveLink] = useState<number | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const firstMenuLinkRef = useRef<HTMLAnchorElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Scroll-spy and the progress rail, from one rAF-throttled scroll read.
  //
  // This used to pick whichever section had the largest intersectionRatio,
  // which is wrong at the end of the page: ratio is a fraction of the *target*,
  // so a tall section like Now beats a short one like Contact even when
  // Contact is what fills the screen. A reading line a quarter down the
  // viewport is unambiguous, and the bottom-of-document case is handled
  // outright so the final section always wins when you reach the end.
  useEffect(() => {
    // Flattened so one nav item can cover several sections, in document order.
    const tracked = NAV_LINKS.flatMap((link, linkIndex) =>
      link.sections.map((id) => ({ linkIndex, el: document.getElementById(id) }))
    ).filter((entry): entry is { linkIndex: number; el: HTMLElement } => entry.el !== null)

    let frame = 0

    function update() {
      frame = 0

      const doc = document.documentElement
      const scrollable = doc.scrollHeight - window.innerHeight
      setProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0)

      if (tracked.length === 0) return

      // At the bottom of the document the last section is active by definition,
      // however short it is.
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - 4) {
        setActiveLink(tracked[tracked.length - 1].linkIndex)
        return
      }

      const navHeight =
        parseInt(getComputedStyle(doc).getPropertyValue('--nav-height'), 10) || 56
      const line = navHeight + window.innerHeight * 0.25

      let current: number | null = null
      for (const entry of tracked) {
        if (entry.el.getBoundingClientRect().top <= line) current = entry.linkIndex
      }
      setActiveLink(current)
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

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)')
    function handleChange(event: MediaQueryListEvent) {
      if (event.matches) setIsMenuOpen(false)
    }
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return

    function closeMenu() {
      setIsMenuOpen(false)
      menuButtonRef.current?.focus()
    }

    document.body.style.overflow = 'hidden'
    firstMenuLinkRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeMenu()
        return
      }
      if (event.key !== 'Tab' || !overlayRef.current) return

      const focusable = overlayRef.current.querySelectorAll<HTMLElement>('a[href], button')
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node
      const insideOverlay = overlayRef.current?.contains(target)
      const insideMenuButton = menuButtonRef.current?.contains(target)
      if (!insideOverlay && !insideMenuButton) closeMenu()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isMenuOpen])

  return (
    <nav className="fixed left-0 top-0 z-[100] h-[var(--nav-height)] w-full border-b border-rule bg-[rgba(8,9,10,0.92)] backdrop-blur-[14px]">
      <div className="mx-auto flex h-full max-w-[var(--page-max)] items-center justify-between px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop">
        <a href="#index" className="group flex items-baseline gap-2.5">
          <span className="border border-rule-bright px-1.5 py-0.5 font-mono text-[11px] text-accent transition-colors group-hover:border-accent">
            SM
          </span>
          <span className="text-[14px] font-medium tracking-[-0.01em] text-ink">
            Stephan Maready
          </span>
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link, linkIndex) => {
            const isActive = activeLink === linkIndex
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'font-mono text-[12px] tracking-[0.04em] transition-colors',
                  isActive ? 'text-accent' : 'text-ink-dim hover:text-ink'
                )}
              >
                {link.label}
              </a>
            )
          })}

          <span aria-hidden="true" className="h-4 w-px bg-rule-bright" />

          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="text-ink-dim transition-colors hover:text-accent"
            >
              <SocialIcon label={social.label} />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4 md:hidden">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="text-ink-dim"
            >
              <SocialIcon label={social.label} />
            </a>
          ))}
          <button
            ref={menuButtonRef}
            type="button"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-menu"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="cursor-pointer p-1.5 text-ink"
          >
            <MenuGlyph open={isMenuOpen} />
          </button>
        </div>
      </div>

      {/* Scroll progress rail */}
      <div
        aria-hidden="true"
        className="absolute bottom-[-1px] left-0 h-px bg-accent transition-[width] duration-150 ease-out"
        style={{ width: `${progress * 100}%` }}
      />

      {/* Scrim. Without it the panel sat on the same colour as the page and
          there was nothing to tell you the menu had opened. */}
      <div
        aria-hidden="true"
        className={cn(
          'fixed inset-x-0 bottom-0 top-[var(--nav-height)] z-[90] bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 md:hidden',
          isMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      {/* Kept mounted rather than unmounted so the staggered entrance can
          actually transition. `invisible` also takes it out of the tab order,
          which display:none was doing before. */}
      <div
        id="mobile-nav-menu"
        ref={overlayRef}
        className={cn(
          'fixed inset-x-0 top-[var(--nav-height)] z-[100] flex flex-col border-b border-rule-bright bg-bg-raise px-gutter-mobile pb-8 pt-6 shadow-[0_28px_60px_rgba(0,0,0,0.7)] transition-all duration-300 md:hidden',
          isMenuOpen
            ? 'visible translate-y-0 opacity-100'
            : 'pointer-events-none invisible -translate-y-3 opacity-0'
        )}
      >
        {NAV_LINKS.map((link, index) => {
          const isActive = activeLink === index
          return (
            <a
              key={link.href}
              href={link.href}
              ref={index === 0 ? firstMenuLinkRef : undefined}
              onClick={() => setIsMenuOpen(false)}
              aria-current={isActive ? 'true' : undefined}
              style={{ transitionDelay: isMenuOpen ? `${90 + index * 45}ms` : '0ms' }}
              className={cn(
                'group flex flex-col items-center gap-2 py-4 text-center text-[26px] font-medium tracking-[-0.02em] transition-all duration-300',
                isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
                isActive ? 'text-accent' : 'text-ink'
              )}
            >
              {link.label}
              {/* The rule under the current section — same draw-in language as
                  the section headers. */}
              <span
                aria-hidden="true"
                className={cn(
                  'h-px bg-accent transition-all duration-500',
                  isActive ? 'w-10' : 'w-0'
                )}
              />
            </a>
          )
        })}

        <div
          style={{ transitionDelay: isMenuOpen ? `${90 + NAV_LINKS.length * 45}ms` : '0ms' }}
          className={cn(
            'mt-6 flex flex-col items-center gap-3 border-t border-rule pt-6 transition-all duration-300',
            isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
          )}
        >
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
            {STATUS}
          </p>
          <a
            href={`mailto:${contact.email}`}
            onClick={() => setIsMenuOpen(false)}
            className="font-mono text-[12px] text-ink-dim underline-offset-4 transition-colors hover:text-accent hover:underline"
          >
            {contact.email}
          </a>
        </div>
      </div>

    </nav>
  )
}
