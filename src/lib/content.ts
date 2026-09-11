import type { AvatarSpec, Badge, Building, MapSpot, Mood } from '@content/types'

import worldJson from '@content/world.json'
import spritesJson from '@content/sprites.json'
import stringsJson from '@content/strings.en.json'
import stringsHiJson from '@content/strings.hi.json'
import helpJson from '@content/help.json'
import communityJson from '@content/community.json'
import worldHiJson from '@content/hi/world.json'
import helpHiJson from '@content/hi/help.json'
import communityHiJson from '@content/hi/community.json'

/* ---------- Language ----------
 *
 * English is the source of truth. Hindi lives in content/hi/ as overlays that
 * mirror the English shape but carry only text. `localize` lays an overlay
 * over the English: objects merge key by key, arrays of objects match by `id`
 * (or by position when they have none), and only strings are ever replaced.
 * Numbers, booleans and the structural keys in KEEP always come from English,
 * so a translation can never move a building, change a quiz answer, rewire a
 * story, alter a helpline number or touch a legal citation.
 *
 * The exported content (`world`, `help`, `community`, `allBuildings`) are
 * live `let` bindings: `setContentLanguage` reassigns them, and the app
 * remounts on a language change so every screen reads the new values.
 */

export type Lang = 'en' | 'hi'

const KEEP = new Set([
  'id', 'sprite', 'to', 'speaker', 'bg', 'kind', 'color', 'tone', 'bin', 'number',
  'start', 'next', 'end', 'band', 'type', 'status', 'law', 'source', 'pledge',
  'building', 'item', 'appName', 'props', 'avatar', 'skin', 'hair', 'hairColor',
])

type Json = string | number | boolean | null | Json[] | { [k: string]: Json }
type JsonObject = { [k: string]: Json }

const isObject = (v: Json | undefined): v is JsonObject =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

function merge(base: Json, over: Json | undefined): Json {
  if (over === undefined || over === null) return base
  if (typeof base === 'string') return typeof over === 'string' ? over : base

  if (Array.isArray(base)) {
    if (!Array.isArray(over)) return base
    // Arrays of plain strings (options, facts, steps) swap whole, if they line up.
    if (!isObject(base[0])) {
      return over.length === base.length && over.every((v) => typeof v === 'string') ? over : base
    }
    const byId = 'id' in base[0]
    return base.map((item, i) => {
      const match = byId
        ? over.find((o) => isObject(o) && isObject(item) && o.id === item.id)
        : over[i]
      return merge(item, match)
    })
  }

  if (isObject(base)) {
    if (!isObject(over)) return base
    const out: JsonObject = {}
    for (const key of Object.keys(base)) {
      out[key] = KEEP.has(key) ? base[key] : merge(base[key], over[key])
    }
    return out
  }

  return base
}

function localize<T>(base: T, overlay: unknown): T {
  return merge(base as Json, overlay as Json | undefined) as T
}

let lang: Lang = 'en'

export function currentLang(): Lang {
  return lang
}

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

const worldEn = worldJson as unknown as World
export let world: World = worldEn

/* ---------- Buildings ---------- */

const buildingModules = import.meta.glob<{ default: Building }>('../../content/buildings/*.json', {
  eager: true,
})
const buildingHiModules = import.meta.glob<{ default: unknown }>(
  '../../content/hi/buildings/*.json',
  { eager: true },
)

const buildingsEn: Record<string, Building> = {}
for (const path in buildingModules) {
  const b = buildingModules[path].default as unknown as Building
  buildingsEn[b.id] = b
}

/** Hindi overlays, keyed by building id (the file name matches the English one). */
const buildingsHiOverlay: Record<string, unknown> = {}
for (const path in buildingHiModules) {
  const file = (path.split('/').pop() ?? '').replace('.json', '')
  buildingsHiOverlay[file] = buildingHiModules[path].default
}

let buildings: Record<string, Building> = buildingsEn

export function getBuilding(id: string): Building | undefined {
  return buildings[id]
}

function orderBuildings(): Building[] {
  return world.buildingOrder.map((id) => buildings[id]).filter(Boolean)
}

/** Playable buildings in `buildingOrder` order. */
export let allBuildings: Building[] = orderBuildings()

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

const helpEn = helpJson as unknown as HelpContent
export let help: HelpContent = helpEn

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

const communityEn = communityJson as unknown as CommunityContent
export let community: CommunityContent = communityEn

/* ---------- Strings ---------- */

type StringTree = { [key: string]: string | StringTree }

const STRINGS: Record<Lang, StringTree> = {
  en: stringsJson as unknown as StringTree,
  hi: stringsHiJson as unknown as StringTree,
}

function lookup(tree: StringTree, key: string): string | undefined {
  let node: string | StringTree | undefined = tree
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined
    node = node[part]
  }
  return typeof node === 'string' ? node : undefined
}

/**
 * Look up a dotted key in the current language's strings (falling back to
 * English) and interpolate `{var}` placeholders. Returns the key itself if it
 * is missing everywhere, so a typo is visible rather than silent.
 */
export function t(key: string, vars?: Record<string, string | number>): string {
  const node = lookup(STRINGS[lang], key) ?? lookup(STRINGS.en, key)
  if (node === undefined) return key
  if (!vars) return node
  return node.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  )
}

/* ---------- Switching ---------- */

interface ContentPack {
  world: World
  buildings: Record<string, Building>
  help: HelpContent
  community: CommunityContent
}

const packs: Partial<Record<Lang, ContentPack>> = {}

function buildPack(next: Lang): ContentPack {
  if (next === 'en') {
    return { world: worldEn, buildings: buildingsEn, help: helpEn, community: communityEn }
  }
  const b: Record<string, Building> = {}
  for (const id in buildingsEn) b[id] = localize(buildingsEn[id], buildingsHiOverlay[id])
  return {
    world: localize(worldEn, worldHiJson),
    buildings: b,
    help: localize(helpEn, helpHiJson),
    community: localize(communityEn, communityHiJson),
  }
}

/** Swap every piece of content (and `t`) to `next`. Cheap after the first call. */
export function setContentLanguage(next: Lang) {
  const safe: Lang = next === 'hi' ? 'hi' : 'en'
  const pack = (packs[safe] ??= buildPack(safe))
  lang = safe
  world = pack.world
  buildings = pack.buildings
  help = pack.help
  community = pack.community
  allBuildings = orderBuildings()
  if (typeof document !== 'undefined') document.documentElement.lang = safe
}
