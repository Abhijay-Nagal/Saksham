import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { App } from './App'
import { DEFAULT_AVATAR, useStore } from './lib/store'

/**
 * TEMP (removed in Phase 4, once Onboarding exists): guarantee a player before
 * the first render, so every screen is reachable while the app is being built.
 */
function tempGuest() {
  const state = useStore.getState()
  if (state.profiles.length === 0) {
    state.createProfile({ name: 'Guest', avatar: DEFAULT_AVATAR, band: 'young' })
  } else if (!state.activeProfileId) {
    state.setActiveProfile(state.profiles[0].id)
  }
}

tempGuest()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
