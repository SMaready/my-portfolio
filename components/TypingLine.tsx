'use client'

import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

const TYPE_MS = 58
const DELETE_MS = 26
const HOLD_MS = 1900
const GAP_MS = 260
const START_MS = 700

/**
 * Types each phrase, holds, deletes, moves on. Under prefers-reduced-motion it
 * renders the first phrase as static text with no caret.
 *
 * All the loop state lives in closure variables rather than refs so the state
 * updater stays pure — scheduling the next tick from inside setState would run
 * twice under StrictMode and double the timers.
 *
 * The full phrase list is exposed to screen readers once, so the content never
 * depends on the animation running.
 */
export function TypingLine({ phrases }: { phrases: readonly string[] }) {
  const [text, setText] = useState('')
  const reduceMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (reduceMotion || phrases.length === 0) return

    let timer: ReturnType<typeof setTimeout>
    let typed = ''
    let index = 0
    let deleting = false

    function tick() {
      const phrase = phrases[index % phrases.length]

      if (!deleting) {
        typed = phrase.slice(0, typed.length + 1)
        setText(typed)

        if (typed === phrase) {
          deleting = true
          timer = setTimeout(tick, HOLD_MS)
        } else {
          timer = setTimeout(tick, TYPE_MS)
        }
        return
      }

      typed = phrase.slice(0, Math.max(0, typed.length - 1))
      setText(typed)

      if (typed.length === 0) {
        deleting = false
        index += 1
        timer = setTimeout(tick, GAP_MS)
      } else {
        timer = setTimeout(tick, DELETE_MS)
      }
    }

    timer = setTimeout(tick, START_MS)
    return () => clearTimeout(timer)
  }, [phrases, reduceMotion])

  if (reduceMotion) {
    return <span className="text-accent">{phrases[0]}</span>
  }

  return (
    <>
      <span aria-hidden="true" className="text-accent">
        {text}
      </span>
      <span aria-hidden="true" className="caret ml-[2px] align-baseline" />
      <span className="sr-only">{phrases.join(' ')}</span>
    </>
  )
}
