/**
 * Every visual reward goes through here so calm mode can switch it all off in
 * one place (DESIGN 7, tier 4). All functions are no-ops when `data-calm` is
 * set on <html>.
 */

import confettiLib from 'canvas-confetti'
import { spriteEmoji } from './content'

const PALETTE = ['#FFB320', '#E2457A', '#3E9E4F', '#16708A', '#FFE3A3']

export function isCalm(): boolean {
  return typeof document !== 'undefined' && document.documentElement.hasAttribute('data-calm')
}

function centreOf(el: Element | null): { x: number; y: number } {
  if (!el) return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

/** A confetti burst in the palette colours, originating at `el` (or the centre). */
export function confetti(el?: Element | null, options: { count?: number } = {}) {
  if (isCalm()) return
  const { x, y } = centreOf(el ?? null)
  void confettiLib({
    particleCount: options.count ?? 90,
    spread: 78,
    startVelocity: 42,
    ticks: 220,
    scalar: 1.1,
    colors: PALETTE,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    disableForReducedMotion: true,
  })
}

/** The quieter reward used by `tone: gentle` buildings — a soft upward sparkle. */
export function softSparkle(el?: Element | null) {
  if (isCalm()) return
  const { x, y } = centreOf(el ?? null)
  void confettiLib({
    particleCount: 26,
    spread: 50,
    startVelocity: 18,
    gravity: 0.35,
    ticks: 180,
    scalar: 0.85,
    colors: ['#FFE3A3', '#E3F3F7', '#FFFFFF'],
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    disableForReducedMotion: true,
  })
}

let layer: HTMLDivElement | null = null

function fxLayer(): HTMLDivElement {
  if (!layer || !layer.isConnected) {
    layer = document.createElement('div')
    layer.setAttribute('aria-hidden', 'true')
    layer.style.cssText =
      'position:fixed;inset:0;pointer-events:none;z-index:90;overflow:hidden;contain:strict'
    document.body.appendChild(layer)
  }
  return layer
}

function spriteNode(sprite: string, size: number): HTMLElement {
  const img = document.createElement('img')
  img.src = `${import.meta.env.BASE_URL}assets/fluent/${sprite}.png`
  img.width = size
  img.height = size
  img.style.cssText = `width:${size}px;height:${size}px;object-fit:contain`
  img.onerror = () => {
    const span = document.createElement('span')
    span.textContent = spriteEmoji(sprite)
    span.style.cssText = `font-size:${size}px;line-height:1`
    img.replaceWith(span)
  }
  return img
}

/**
 * Fly `count` sprites from one element to another — a star into the stars pill,
 * a marigold into the flower pill, a card into the book tab.
 * Duration 850ms (DESIGN 7).
 */
export function flyTo(
  fromEl: Element | null,
  toEl: Element | null,
  sprite: string,
  count = 1,
  options: { size?: number; onArrive?: () => void } = {},
) {
  if (isCalm() || !fromEl || !toEl) {
    options.onArrive?.()
    return
  }
  const from = centreOf(fromEl)
  const to = centreOf(toEl)
  const size = options.size ?? 34
  const host = fxLayer()

  for (let i = 0; i < count; i++) {
    const node = spriteNode(sprite, size)
    const jitterX = (Math.random() - 0.5) * 46
    const jitterY = (Math.random() - 0.5) * 30
    node.style.position = 'absolute'
    node.style.left = `${from.x - size / 2}px`
    node.style.top = `${from.y - size / 2}px`
    node.style.willChange = 'transform, opacity'
    host.appendChild(node)

    const anim = node.animate(
      [
        { transform: 'translate(0,0) scale(0.6) rotate(0deg)', opacity: 0 },
        {
          transform: `translate(${(to.x - from.x) * 0.4 + jitterX}px, ${
            (to.y - from.y) * 0.4 + jitterY - 60
          }px) scale(1.25) rotate(160deg)`,
          opacity: 1,
          offset: 0.45,
        },
        {
          transform: `translate(${to.x - from.x}px, ${to.y - from.y}px) scale(0.45) rotate(360deg)`,
          opacity: 0.9,
        },
      ],
      { duration: 850, delay: i * 90, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'forwards' },
    )

    anim.onfinish = () => {
      node.remove()
      if (i === count - 1) options.onArrive?.()
    }
  }
}

/** A ring of sparkles orbiting an element — used on the town return celebration. */
export function sparkle(el: Element | null, count = 6) {
  if (isCalm() || !el) return
  const { x, y } = centreOf(el)
  const host = fxLayer()

  for (let i = 0; i < count; i++) {
    const node = spriteNode('sparkles', 22)
    node.style.position = 'absolute'
    node.style.left = `${x - 11}px`
    node.style.top = `${y - 11}px`
    host.appendChild(node)

    const angle = (i / count) * Math.PI * 2
    const radius = 54
    const anim = node.animate(
      [
        { transform: 'translate(0,0) scale(0.2)', opacity: 0 },
        {
          transform: `translate(${Math.cos(angle) * radius}px, ${
            Math.sin(angle) * radius
          }px) scale(1)`,
          opacity: 1,
          offset: 0.5,
        },
        {
          transform: `translate(${Math.cos(angle) * radius * 1.5}px, ${
            Math.sin(angle) * radius * 1.5
          }px) scale(0.3)`,
          opacity: 0,
        },
      ],
      { duration: 1100, delay: i * 60, easing: 'ease-out', fill: 'forwards' },
    )
    anim.onfinish = () => node.remove()
  }
}

/**
 * Little sprites falling away from an element — leaves off a tapped tree,
 * droplets out of a squeezed cloud (DESIGN 7, tier 3).
 */
export function fall(el: Element | null, sprite: string, count = 4) {
  if (isCalm() || !el) return
  const { x, y } = centreOf(el)
  const host = fxLayer()

  for (let i = 0; i < count; i++) {
    const size = 16 + Math.random() * 10
    const node = spriteNode(sprite, size)
    node.style.position = 'absolute'
    node.style.left = `${x - size / 2 + (Math.random() - 0.5) * 40}px`
    node.style.top = `${y - size / 2}px`
    host.appendChild(node)

    const anim = node.animate(
      [
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        {
          transform: `translate(${(Math.random() - 0.5) * 70}px, ${70 + Math.random() * 50}px) rotate(${
            (Math.random() - 0.5) * 420
          }deg)`,
          opacity: 0,
        },
      ],
      { duration: 900 + Math.random() * 400, delay: i * 70, easing: 'ease-in', fill: 'forwards' },
    )
    anim.onfinish = () => node.remove()
  }
}

export const fx = { confetti, softSparkle, flyTo, sparkle, fall, isCalm }
