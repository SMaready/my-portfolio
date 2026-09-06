import { contact } from '@/data/about'

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-rule bg-bg-sink">
      <div className="mx-auto flex w-full max-w-[var(--page-max)] flex-col gap-4 px-gutter-mobile py-8 font-mono text-[11px] text-ink-faint md:flex-row md:items-center md:justify-between md:px-gutter-tablet lg:px-gutter-desktop">
        <p>&copy; {new Date().getFullYear()} Stephan Maready</p>
        <p>Built with Next.js and Tailwind. Deployed on Vercel.</p>
        <div className="flex gap-5">
          <a
            href={contact.github}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-accent"
          >
            GitHub
          </a>
          <a
            href={contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-accent"
          >
            LinkedIn
          </a>
          <a href="#index" className="transition-colors hover:text-accent">
            Top &#8593;
          </a>
        </div>
      </div>
    </footer>
  )
}
