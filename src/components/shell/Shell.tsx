import type { ReactNode } from 'react'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'

/** The standard app frame: top bar, content, and a mobile tab bar. */
export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-3 pt-4 pb-28 md:px-5 md:pb-10">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
