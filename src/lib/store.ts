import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AgeBand, AvatarSpec } from '@content/types'
import { world } from './content'

export type Stars = 0 | 1 | 2 | 3

export interface BuildingProgress {
  stars: Stars
  bestScore: number
  completed: boolean
}

export interface AskedQuestion {
  topic: string
  text: string
  at: number
}

export interface Profile {
  id: string
  name: string
  avatar: AvatarSpec
  band: AgeBand
  createdAt: number
  buildings: Record<string, BuildingProgress>
  cards: string[]
  badges: string[]
  marigolds: number[]
  pledges: string[]
  questions: AskedQuestion[]
}

export interface Settings {
  sound: boolean
  narration: boolean
  calmMotion: boolean
  demo: boolean
}

/** What a finished play-through reports back to the store. */
export interface PlayResult {
  buildingId: string
  cardId: string
  /** correct-first-try / total, 0..1 */
  score: number
  retries: number
  gameType: 'quiz' | 'sort'
}

export interface AppState {
  profiles: Profile[]
  activeProfileId: string | null
  settings: Settings

  createProfile: (input: { name: string; avatar: AvatarSpec; band: AgeBand }) => string
  setActiveProfile: (id: string | null) => void
  deleteProfile: (id: string) => void
  updateProfile: (patch: Partial<Pick<Profile, 'name' | 'avatar' | 'band'>>) => void

  recordResult: (result: PlayResult) => { stars: Stars; unlocked: string | null; newBadges: string[] }
  findMarigold: (index: number) => { found: boolean; newBadges: string[] }
  takePledge: (pledgeId: string) => string[]
  askQuestion: (topic: string, text: string) => void

  setSettings: (patch: Partial<Settings>) => void
  toggleDemo: () => void
}

export const DEFAULT_AVATAR: AvatarSpec = {
  skin: '#E2A67E',
  hair: 'shortHair',
  hairColor: '#1B1B1B',
}

const emptyProgress: BuildingProgress = { stars: 0, bestScore: 0, completed: false }

function newId(): string {
  return Math.random().toString(36).slice(2, 10)
}

/** PRODUCT 4: 1 star for the story, +1 at 60%, +1 at 90% with no retries. */
export function starsFor(score: number, retries: number): Stars {
  let stars = 1
  if (score >= 0.6) stars += 1
  if (score >= 0.9 && retries === 0) stars += 1
  return stars as Stars
}

export function progressOf(profile: Profile | null, buildingId: string): BuildingProgress {
  return profile?.buildings[buildingId] ?? emptyProgress
}

/** School is always open; finishing building N opens N+1. Demo mode opens everything. */
export function unlockedBuildings(profile: Profile | null, demo: boolean): string[] {
  const order = world.buildingOrder
  if (demo) return [...order]
  const open: string[] = []
  for (let i = 0; i < order.length; i++) {
    if (i === 0) {
      open.push(order[i])
      continue
    }
    if (progressOf(profile, order[i - 1]).completed) open.push(order[i])
    else break
  }
  return open
}

/** The first unlocked building with fewer than 3 stars; Mitthu perches here. */
export function recommendedBuilding(profile: Profile | null, demo: boolean): string | null {
  const open = unlockedBuildings(profile, demo)
  for (const id of open) {
    if (progressOf(profile, id).stars < 3) return id
  }
  return open.length ? open[open.length - 1] : null
}

export function totalStars(profile: Profile | null): number {
  if (!profile) return 0
  return Object.values(profile.buildings).reduce((sum, b) => sum + b.stars, 0)
}

export function cardCount(profile: Profile | null): number {
  return profile?.cards.length ?? 0
}

/**
 * Recompute the badge list for a profile. Pure, so it can run after any event.
 * `flags` carries facts that are not derivable from the profile alone.
 */
function computeBadges(
  p: Profile,
  flags: { perfectQuiz?: boolean; perfectSort?: boolean } = {},
): string[] {
  const earned = new Set(p.badges)
  const completedCount = world.buildingOrder.filter((id) => p.buildings[id]?.completed).length

  if (completedCount >= 1) earned.add('first-voice')
  if (p.cards.length >= 3) earned.add('card-collector')
  if (p.marigolds.length >= world.map.marigolds.length) earned.add('sharp-eyes')
  if (flags.perfectSort) earned.add('fair-play')
  if (flags.perfectQuiz) earned.add('quiz-whiz')
  if (completedCount >= world.buildingOrder.length) earned.add('haq-champion')

  return [...earned]
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,
      settings: { sound: true, narration: false, calmMotion: false, demo: false },

      createProfile: ({ name, avatar, band }) => {
        const id = newId()
        const profile: Profile = {
          id,
          name: name.trim(),
          avatar,
          band,
          createdAt: Date.now(),
          buildings: {},
          cards: [],
          badges: [],
          marigolds: [],
          pledges: [],
          questions: [],
        }
        set((s) => ({ profiles: [...s.profiles, profile], activeProfileId: id }))
        return id
      },

      setActiveProfile: (id) => set({ activeProfileId: id }),

      deleteProfile: (id) =>
        set((s) => ({
          profiles: s.profiles.filter((p) => p.id !== id),
          activeProfileId: s.activeProfileId === id ? null : s.activeProfileId,
        })),

      updateProfile: (patch) =>
        set((s) => ({
          profiles: s.profiles.map((p) => (p.id === s.activeProfileId ? { ...p, ...patch } : p)),
        })),

      recordResult: ({ buildingId, cardId, score, retries, gameType }) => {
        const state = get()
        const profile = state.profiles.find((p) => p.id === state.activeProfileId)
        if (!profile) return { stars: 0 as Stars, unlocked: null, newBadges: [] }

        const earned = starsFor(score, retries)
        const prev = progressOf(profile, buildingId)
        // Replays can only raise stars.
        const stars = Math.max(prev.stars, earned) as Stars
        const bestScore = Math.max(prev.bestScore, score)

        const wasCompleted = prev.completed
        const next: Profile = {
          ...profile,
          buildings: {
            ...profile.buildings,
            [buildingId]: { stars, bestScore, completed: true },
          },
          cards: profile.cards.includes(cardId) ? profile.cards : [...profile.cards, cardId],
        }
        next.badges = computeBadges(next, {
          perfectQuiz: gameType === 'quiz' && score >= 1,
          perfectSort: gameType === 'sort' && score >= 1,
        })
        const newBadges = next.badges.filter((b) => !profile.badges.includes(b))

        // Which building did finishing this one open?
        const order = world.buildingOrder
        const idx = order.indexOf(buildingId)
        const nextId = idx >= 0 && idx + 1 < order.length ? order[idx + 1] : null
        const unlocked = !wasCompleted && nextId ? nextId : null

        set((s) => ({ profiles: s.profiles.map((p) => (p.id === next.id ? next : p)) }))
        return { stars, unlocked, newBadges }
      },

      findMarigold: (index) => {
        const state = get()
        const profile = state.profiles.find((p) => p.id === state.activeProfileId)
        if (!profile || profile.marigolds.includes(index)) return { found: false, newBadges: [] }

        const next: Profile = { ...profile, marigolds: [...profile.marigolds, index] }
        next.badges = computeBadges(next)
        const newBadges = next.badges.filter((b) => !profile.badges.includes(b))

        set((s) => ({ profiles: s.profiles.map((p) => (p.id === next.id ? next : p)) }))
        return { found: true, newBadges }
      },

      takePledge: (pledgeId) => {
        const state = get()
        const profile = state.profiles.find((p) => p.id === state.activeProfileId)
        if (!profile || profile.pledges.includes(pledgeId)) return []

        const next: Profile = { ...profile, pledges: [...profile.pledges, pledgeId] }
        next.badges = computeBadges(next)
        const newBadges = next.badges.filter((b) => !profile.badges.includes(b))

        set((s) => ({ profiles: s.profiles.map((p) => (p.id === next.id ? next : p)) }))
        return newBadges
      },

      askQuestion: (topic, text) =>
        set((s) => ({
          profiles: s.profiles.map((p) =>
            p.id === s.activeProfileId
              ? { ...p, questions: [{ topic, text, at: Date.now() }, ...p.questions] }
              : p,
          ),
        })),

      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      toggleDemo: () => set((s) => ({ settings: { ...s.settings, demo: !s.settings.demo } })),
    }),
    { name: 'saksham-v1' },
  ),
)

/* ---------- Hooks ---------- */

export function useActiveProfile(): Profile | null {
  return useStore((s) => s.profiles.find((p) => p.id === s.activeProfileId) ?? null)
}

export function useSettings(): Settings {
  return useStore((s) => s.settings)
}
