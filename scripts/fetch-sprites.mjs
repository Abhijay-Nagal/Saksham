/**
 * Downloads Microsoft Fluent Emoji 3D PNGs for every key in content/sprites.json
 * into public/assets/fluent/<key>.png.
 *
 * Assets are committed to the repo: nothing is fetched at runtime, because
 * venue Wi-Fi cannot be trusted. Misses are logged and skipped -- the <Sprite>
 * component falls back to the native emoji.
 *
 *   node scripts/fetch-sprites.mjs
 */

import { mkdir, writeFile, readFile, access } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'assets', 'fluent')
const RAW = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets'
const API = 'https://api.github.com/repos/microsoft/fluentui-emoji/contents/assets'

const enc = (s) => s.split('/').map(encodeURIComponent).join('/')
const fileBase = (folder) => folder.toLowerCase().replace(/[^a-z0-9]+/g, '_')

/** Candidate URLs, cheapest first. Skin-toned emoji keep 3D art under Default/. */
function candidates(folder) {
  const base = fileBase(folder)
  return [
    `${RAW}/${enc(folder)}/3D/${base}_3d.png`,
    `${RAW}/${enc(folder)}/Default/3D/${base}_3d.png`,
    `${RAW}/${enc(folder)}/Color/3D/${base}_3d.png`,
  ]
}

async function tryFetch(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    return buf.length > 500 ? buf : null
  } catch {
    return null
  }
}

/** Last resort: list the folder through the GitHub API and hunt for a 3D png. */
async function viaApi(folder) {
  const walk = async (path, depth) => {
    if (depth > 3) return null
    const res = await fetch(`${API}/${enc(path)}`, {
      headers: { 'User-Agent': 'saksham-build' },
    })
    if (!res.ok) return null
    const entries = await res.json()
    if (!Array.isArray(entries)) return null

    const png = entries.find((e) => e.type === 'file' && /_3d\.png$/i.test(e.name))
    if (png?.download_url) return tryFetch(png.download_url)

    for (const dir of entries.filter((e) => e.type === 'dir')) {
      const hit = await walk(`${path}/${dir.name}`, depth + 1)
      if (hit) return hit
    }
    return null
  }
  return walk(folder, 0)
}

async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

const registry = JSON.parse(await readFile(join(root, 'content', 'sprites.json'), 'utf8'))
await mkdir(outDir, { recursive: true })

const keys = Object.keys(registry).filter((k) => !k.startsWith('_'))
const misses = []
let fetched = 0
let skipped = 0

for (const key of keys) {
  const dest = join(outDir, `${key}.png`)
  if (await exists(dest)) {
    skipped++
    continue
  }

  const { fluent } = registry[key]
  let buf = null
  for (const url of candidates(fluent)) {
    buf = await tryFetch(url)
    if (buf) break
  }
  if (!buf) buf = await viaApi(fluent)

  if (buf) {
    await writeFile(dest, buf)
    fetched++
    console.log(`  ok   ${key}`)
  } else {
    misses.push(`${key} (${fluent})`)
    console.log(`  MISS ${key} (${fluent})`)
  }
}

console.log(`\n${fetched} fetched, ${skipped} already present, ${misses.length} missing.`)
if (misses.length) console.log('Missing (emoji fallback will be used):\n  ' + misses.join('\n  '))
