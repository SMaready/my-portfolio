'use client'

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type RevealProps = {
  children?: ReactNode
  className?: string
  /** 'fade' lifts content in; 'rule' draws a hairline out from the left. */
  variant?: 'fade' | 'rule'
  delay?: number
  as?: ElementType
}

/**
 * Reveals a block once when it first scrolls into view, then stops observing.
 * The animation itself lives in globals.css so `prefers-reduced-motion` can
 * switch it off in one place rather than per component.
 */
export function Reveal({
  children,
  className,
  variant = 'fade',
  delay = 0,
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // If the block is already on screen at mount, skip the observer entirely.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      data-visible={visible ? 'true' : 'false'}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(variant === 'rule' ? 'reveal-rule' : 'reveal', className)}
    >
      {children}
    </Tag>
  )
}
