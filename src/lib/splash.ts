import { useSyncExternalStore } from 'react'

/* Whether the splash has gone, so screens underneath can hold their own
   entrance (Mitthu's arrival) until it can actually be seen. */

let done = false
const listeners = new Set<() => void>()

export function markSplashDone() {
  if (done) return
  done = true
  listeners.forEach((l) => l())
}

export function useSplashDone(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => done,
  )
}
