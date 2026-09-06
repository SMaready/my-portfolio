'use client'

import { useSyncExternalStore } from 'react'

/**
 * Server render assumes the query does not match; the client corrects on
 * hydrate. Used to keep the pinned horizontal rail off small screens without
 * setting state inside an effect.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', callback)
      return () => media.removeEventListener('change', callback)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}
