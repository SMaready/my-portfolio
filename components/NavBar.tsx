'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

const NAV_LINKS = [
  { label: 'Projects', href: '#projects' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
] as const

const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/SMaready' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/stephan-maready/' },
] as const

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 5.02 3.26 9.28 7.77 10.78.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.16.69-3.83-1.34-3.83-1.34-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.74 2.65 1.23 3.3.94.1-.74.4-1.23.72-1.51-2.52-.29-5.17-1.26-5.17-5.6 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.16a10.9 10.9 0 0 1 5.73 0c2.19-1.47 3.15-1.16 3.15-1.16.62 1.57.23 2.73.11 3.02.73.79 1.17 1.8 1.17 3.04 0 4.35-2.65 5.31-5.18 5.59.41.35.77 1.04.77 2.1 0 1.52-.01 2.74-.01 3.11 0 .3.2.66.79.55A11.26 11.26 0 0 0 23.25 11.75C23.25 5.48 18.27.5 12 .5Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.83v1.64h.05c.53-.98 1.83-2.02 3.77-2.02 4.03 0 4.77 2.5 4.77 5.76V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4V9Z" />
    </svg>
  )
}

function SocialIcon({ label }: { label: 'GitHub' | 'LinkedIn' }) {
  return label === 'GitHub' ? <GitHubIcon /> : <LinkedInIcon />
}

function HamburgerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  )
}

export function NavBar() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const firstMenuLinkRef = useRef<HTMLAnchorElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sections = NAV_LINKS.map((link) => document.getElementById(link.href.slice(1))).filter(
      (el): el is HTMLElement => el !== null
    )

    if (sections.length === 0) return

    const navHeightPx =
      parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 60
    const ratios = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0)
        })

        let topId: string | null = null
        let topRatio = 0
        for (const section of sections) {
          const ratio = ratios.get(section.id) ?? 0
          if (ratio > topRatio) {
            topRatio = ratio
            topId = section.id
          }
        }
        setActiveSection(topId)
      },
      { rootMargin: `-${navHeightPx}px 0px -60% 0px`, threshold: [0, 0.25, 0.5, 0.75, 1] }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  function closeMenu() {
    setIsMenuOpen(false)
    menuButtonRef.current?.focus()
  }

  // Force-close if the viewport crosses into desktop while the overlay is open,
  // since it disappears via md:hidden but React state wouldn't otherwise know.
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
      if (!insideOverlay && !insideMenuButton) {
        closeMenu()
      }
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
    <nav className="fixed left-0 top-0 z-[100] h-[var(--nav-height)] w-full border-b border-outline bg-[rgba(14,14,14,0.88)] backdrop-blur-[12px]">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop">
        <span className="text-base font-semibold text-on-background">Stephan Maready</span>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href.slice(1)
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'text-sm font-medium leading-none tracking-[0.01em] no-underline transition-colors',
                  isActive ? 'text-accent' : 'text-on-background-dim'
                )}
              >
                {link.label}
              </a>
            )
          })}
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="text-on-background-dim transition-colors hover:text-accent"
            >
              <SocialIcon label={social.label} />
            </a>
          ))}
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav-menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="p-2.5 text-on-background md:hidden"
        >
          {isMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      <div
        id="mobile-nav-menu"
        ref={overlayRef}
        className={cn(
          'fixed inset-x-0 top-[var(--nav-height)] bottom-0 z-[100] flex-col gap-8 bg-background px-gutter-mobile py-12 md:hidden',
          isMenuOpen ? 'flex' : 'hidden'
        )}
      >
        {NAV_LINKS.map((link, index) => (
          <a
            key={link.href}
            href={link.href}
            ref={index === 0 ? firstMenuLinkRef : undefined}
            onClick={closeMenu}
            className="text-2xl font-medium text-on-background"
          >
            {link.label}
          </a>
        ))}

        <div className="flex gap-6 pt-4">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              onClick={closeMenu}
              className="text-on-background-dim"
            >
              <SocialIcon label={social.label} />
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}
