import { Reveal } from './Reveal'

type SectionHeaderProps = {
  title: string
  note?: string
}

export function SectionHeader({ title, note }: SectionHeaderProps) {
  return (
    <header className="mb-12 md:mb-16">
      <Reveal className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink">{title}</h2>
        {note ? <p className="font-mono text-[11px] text-ink-faint">{note}</p> : null}
      </Reveal>
      <Reveal variant="rule" className="mt-4 h-px w-full bg-rule-bright" />
    </header>
  )
}
