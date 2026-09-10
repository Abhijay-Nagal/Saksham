import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router'
import { ToastProvider } from '@/components/ui/Toast'
import { Shell } from '@/components/shell/Shell'
import { CurtainTransition } from '@/components/shell/CurtainTransition'
import { useActiveProfile, useSettings, useStore } from '@/lib/store'
import { sound } from '@/lib/sound'
import { speech } from '@/lib/speech'

import { Town } from '@/screens/Town/Town'
import { Play } from '@/screens/Play/Play'
import { Book } from '@/screens/Book/Book'
import { Help } from '@/screens/Help/Help'
import { Community } from '@/screens/Community/Community'
import { Me } from '@/screens/Me/Me'
import { Credits } from '@/screens/Credits/Credits'
import { Profiles } from '@/screens/Profiles/Profiles'
import { Onboarding } from '@/screens/Onboarding/Onboarding'
import { DevAvatars } from '@/screens/DevAvatars/DevAvatars'

/** `/` sends the player wherever they should be (SCREENS Routes). */
function StartRedirect() {
  const profile = useActiveProfile()
  const hasProfiles = useStore((s) => s.profiles.length > 0)
  if (profile) return <Navigate to="/town" replace />
  return <Navigate to={hasProfiles ? '/profiles' : '/onboarding'} replace />
}

/** Any shell route needs a player; bounce to the picker if there isn't one. */
function RequireProfile({ children }: { children: React.ReactNode }) {
  const profile = useActiveProfile()
  const hasProfiles = useStore((s) => s.profiles.length > 0)
  if (!profile) return <Navigate to={hasProfiles ? '/profiles' : '/onboarding'} replace />
  return <>{children}</>
}

function InShell({ children }: { children: React.ReactNode }) {
  return (
    <RequireProfile>
      <Shell>{children}</Shell>
    </RequireProfile>
  )
}

/** Keep `data-calm` on <html> in sync with settings and the OS preference. */
function useCalmMode() {
  const calmMotion = useSettings().calmMotion
  const { pathname } = useLocation()

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => {
      // The Help Centre is always calm (safety rule).
      const calm = calmMotion || media.matches || pathname.startsWith('/help')
      document.documentElement.toggleAttribute('data-calm', calm)
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [calmMotion, pathname])
}

/** Pause every ambient loop while the tab is in the background. */
function useHiddenPause() {
  useEffect(() => {
    const apply = () => document.documentElement.toggleAttribute('data-hidden', document.hidden)
    apply()
    document.addEventListener('visibilitychange', apply)
    return () => document.removeEventListener('visibilitychange', apply)
  }, [])
}

/** Typing d-e-m-o anywhere toggles demo mode (PRODUCT 6). */
function useDemoCode() {
  useEffect(() => {
    let buffer = ''
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return
      if (e.key.length !== 1) return
      buffer = (buffer + e.key.toLowerCase()).slice(-4)
      if (buffer === 'demo') {
        useStore.getState().toggleDemo()
        buffer = ''
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

/** WebAudio and speechSynthesis both need a user gesture / early priming. */
function useAudioUnlock() {
  useEffect(() => {
    const once = () => {
      sound.unlock()
      speech.prime()
      window.removeEventListener('pointerdown', once)
      window.removeEventListener('keydown', once)
    }
    window.addEventListener('pointerdown', once)
    window.addEventListener('keydown', once)
    return () => {
      window.removeEventListener('pointerdown', once)
      window.removeEventListener('keydown', once)
      speech.cancel()
    }
  }, [])
}

/** Scroll to the top when the route changes; the town manages its own scroll. */
function useScrollReset() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (pathname.startsWith('/town')) return
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
}

function AppRoutes() {
  useCalmMode()
  useHiddenPause()
  useDemoCode()
  useAudioUnlock()
  useScrollReset()

  return (
    <>
      <CurtainTransition />
      <Routes>
        <Route path="/" element={<StartRedirect />} />
        <Route path="/profiles" element={<Profiles />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/play/:buildingId" element={<RequireProfile><Play /></RequireProfile>} />
        <Route path="/help" element={<Help />} />
        <Route path="/town" element={<InShell><Town /></InShell>} />
        <Route path="/book" element={<InShell><Book /></InShell>} />
        <Route path="/community" element={<InShell><Community /></InShell>} />
        <Route path="/me" element={<InShell><Me /></InShell>} />
        <Route path="/credits" element={<InShell><Credits /></InShell>} />
          <Route path="/dev/avatars" element={<DevAvatars />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </HashRouter>
  )
}
