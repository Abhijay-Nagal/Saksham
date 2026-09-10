import type { AvatarSpec, Badge, Building, MapSpot, Mood } from '@content/types'

import worldJson from '@content/world.json'
import spritesJson from '@content/sprites.json'
import stringsJson from '@content/strings.en.json'
import helpJson from '@content/help.json'
import communityJson from '@content/community.json'

/* ---------- World ---------- */

export interface WorldMap {
  width: number
  height: number
  path: string
  spots: MapSpot[]
  trees: { x: number; y: number; sprite: string }[]
  kites: { x: number; y: number }[]
  clouds: { y: number; speed: number }[]
  marigolds: { x: number; y: number }[]
}

export interface World {
  appName: string
  mascotName: string
  buildingOrder: string[]
  map: WorldMap
  avatarPalette: {
    skins: string[]
    hairColors: string[]
    hairs: string[]
    headwear: string[]
  }
  moodMap: Record<Mood, { eyes: string; mouth: string }>
  badges: Badge[]
  mitthuFacts: string[]
}

export const world = worldJson as unknown as World

/* ---------- Buildings ---------- */

const buildingModules = import.meta.glob<{ default: Building }>('../../content/buildings/*.json', {
  eager: true,
})

const buildings: Record<string, Building> = {}
for (const path in buildingModules) {
  const b = buildingModules[path].default as unknown as Building
  buildings[b.id] = b
}

export function getBuilding(id: string): Building | undefined {
  return buildings[id]
}

/** Playable buildings in `buildingOrder` order. */
export const allBuildings: Building[] = world.buildingOrder
  .map((id) => buildings[id])
  .filter(Boolean)

/* ---------- Sprites ---------- */

export interface SpriteEntry {
  fluent: string
  emoji: string
}

export const sprites = spritesJson as unknown as Record<string, SpriteEntry>

export function spriteEmoji(name: string): string {
  return sprites[name]?.emoji ?? '✨'
}

/* ---------- Help & community ---------- */

export interface Helpline {
  number: string
  name: string
  desc: string
  primary: boolean
}

export interface HelpContent {
  headline: string
  subline: string
  helplines: Helpline[]
  tellAnAdult: { title: string; steps: string[] }
  yourRights: { title: string; points: string[] }
  moreHelp: { title: string; items: { name: string; desc: string }[] }
  hideLabel: string
  disclaimer: string
}

export const help = helpJson as unknown as HelpContent

export interface Pledge {
  id: string
  text: string
  sprite: string
}

export interface WallEntry {
  name: string
  place: string
  pledge: string
  avatar: Partial<AvatarSpec> & { skin: string; hair: string; hairColor: string }
}

export interface CommunityContent {
  pledges: Pledge[]
  wall: WallEntry[]
  classChallenge: {
    title: string
    goal: string
    target: number
    current: number
    note: string
  }
  askExpert: {
    intro: string
    safetyNote: string
    topics: string[]
    submittedMessage: string
    answered: { q: string; a: string; topic: string }[]
  }
  resources: { name: string; desc: string; sprite: string }[]
  teacherDashboard: {
    className: string
    students: Record<string, string | number>[]
    commonMistakes?: { title: string; note: string }[]
  }
}

export const community = communityJson as unknown as CommunityContent

/* ---------- Strings ---------- */

type StringTree = { [key: string]: string | StringTree }

const strings = stringsJson as unknown as StringTree

/**
 * Look up a dotted key in strings.en.json and interpolate `{var}` placeholders.
 * Returns the key itself if missing, so a typo is visible rather than silent.
 */
export function t(key: string, vars?: Record<string, string | number>): string {
  let node: string | StringTree | undefined = strings
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return key
    node = node[part]
  }
  if (typeof node !== 'string') return key
  if (!vars) return node
  return node.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  )
}
