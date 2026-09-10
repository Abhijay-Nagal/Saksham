# DESIGN — Festive Storybook

Read one section at a time (`grep -n '^## ' docs/DESIGN.md`). The visual reference is `docs/reference/style-tile.html`. Grep it for a class name, and never read the whole file. Its hand-drawn avatars are placeholders; real avatars use DiceBear (§8).

## 1. Principles

- **A living storybook town.** Warm, bright, Indian-festive, tactile. It should feel like a toy, not a website.
- **Everything answers a tap.** Kids poke at everything, so every visible thing in the town reacts.
- **One signature moment.** The puppet-theatre curtain in stories. Everything else is consistent and disciplined.
- **Sticker style everywhere.** Ink outlines, hard offset shadows, and buttons that physically press down.
- **Calm where it matters.** The Help Centre drops all play elements.

## 2. Tokens

Paste this into `src/styles/index.css`. Tailwind v4 generates the utilities (`bg-marigold`, `text-ink`, `rounded-card`, `shadow-pop`, `ease-spring`).

```css
@import "tailwindcss";
@import "@fontsource/baloo-2/500.css";
@import "@fontsource/baloo-2/600.css";
@import "@fontsource/baloo-2/700.css";
@import "@fontsource/baloo-2/800.css";

@theme {
  --font-sans: "Baloo 2", system-ui, sans-serif;
  --color-paper: #FFF1CF;
  --color-ink: #2A1F3D;
  --color-ink-soft: #5B4E6E;
  --color-marigold: #FFB320;
  --color-marigold-soft: #FFE3A3;
  --color-rani: #E2457A;
  --color-rani-dark: #A8274F;
  --color-rani-soft: #FDE7EE;
  --color-peacock: #16708A;
  --color-peacock-soft: #E3F3F7;
  --color-leaf: #3E9E4F;
  --color-leaf-soft: #E4F4E6;
  --color-sky: #BFE6F2;
  --color-hill: #8CC57A;
  --color-hill-far: #A9D9A0;
  --color-wood: #C98A4B;
  --color-wood-dark: #8C5A2B;
  --color-locked: #E9E1CC;
  --radius-chip: 10px;
  --radius-btn: 14px;
  --radius-card: 18px;
  --radius-tile: 26px;
  --radius-panel: 28px;
  --shadow-pop: 0 4px 0 #2A1F3D;
  --shadow-pop-sm: 0 2px 0 #2A1F3D;
  --ease-spring: cubic-bezier(.34, 1.56, .64, 1);
}
```

Colour rules:

- The page background is `paper` and panels are white. The town and story stage backgrounds are `sky`.
- `marigold` is the primary action fill, always with `ink` text. Never use marigold as text on paper; it fails contrast.
- `peacock` is for help and trust UI, with white text.
- `rani` is for curtains, card fronts, and "not allowed" bins. White text on rani or leaf must be 22px bold or larger.
- Success is `leaf` / `leaf-soft`. Wrong is `rani` / `rani-soft`. Always pair colour with an icon; colour is never the only signal.
- Never use raw hex in components. The only exceptions are avatar data from content and the SVG scenery fills listed in §7.

## 3. Typography

- Baloo 2 only. Weights: 800 for display, 700 for buttons and labels, 600 for dialogue, 500 for body.
- Scale: display 40/44, h1 32, h2 26, dialogue 22, body 19 (minimum 18 for any reading text), small 16, micro 14 (the legal source line only).
- Line height 1.45 for body. Keep line length under 60ch in cards and dialogue.
- Sentence case everywhere. No all-caps labels.

## 4. Sticker style recipe

- Border: `2.5px solid ink` on buttons, tiles, panels and cards. Chips use 2px.
- Shadow: `shadow-pop` on raised things, `shadow-pop-sm` on chips.
- Press: `:active` translates Y by 4px and removes the shadow. Hover (pointer devices only) lifts by -2px and rotates -1deg with `ease-spring` over 150ms.
- Radii follow hierarchy: chip 10, button 14, card 18, tile 26, panel/stage 28.
- The paper texture is optional: an SVG `feTurbulence` noise data-URI on `body` at 5% opacity.

## 5. Layout and responsive

- Breakpoints: mobile under 768px, desktop from 768px. The demo target is 1366×768; also verify 1920×1080 and 390×844.
- **Desktop shell**: a sticky top bar with the logo and Mitthu on the left, nav tabs (Town, Book, Community, Me) in the centre, and the stars pill, Demo chip and Need help button on the right.
- **Mobile shell**: a slim top bar (logo, stars, Help) and a bottom tab bar with 4 tabs.
- **Play route**: immersive. It hides the nav and shows only the exit ✕, the phase progress (Story, Card, Game, Done) and the Help button.
- Content is max 1100px wide, centred. The town map and theatre stage are max 1000px.
- Tap targets are at least 48×48px. The gap between tappable items is at least 8px.

## 6. Components

These live in `src/components/ui/`, one per file, all using tokens.

- **Button**: variants `primary` (marigold), `secondary` (white), `help` (peacock, white text), `ghost` (no border). Sizes md (48px) and lg (60px). Optional leading `sprite`. It plays `sound.tap()` on press.
- **IconButton**: 48px round, sticker style, `aria-label` required.
- **Pill**: a counter (stars ⭐, marigolds 🌼). It exposes a ref so fx can fly into it. It bumps (scale 1.3 spring) when the value changes.
- **Panel**: a white sticker card.
- **Sheet**: a bottom sheet on mobile and a centred modal on desktop. It enters with a spring and closes on backdrop tap or Esc.
- **Toast**: bottom centre, marigold, auto-hides after 2.6s, used for badges.
- **Chip**: a small selectable pill for hair options and topics. The selected state has a marigold fill.
- **ProgressBar**: a chunky rounded bar. The quiz variant has Mitthu walking along it.
- **BuildingTile**: a 96px tile with the sprite. States:
  - `done`: stars above, plus a dashed marigold ring spinning in 12s.
  - `current`: marigold fill, pulse, and a bouncing ▼ arrow.
  - `locked`: greyscale, 🔒, and a shake when tapped.
  - `teaser`: greyscale with a "Soon" ribbon.
  - `help`: peacock fill with no animation.
- **Card**: 3:4 ratio.
  - Front: coloured fill, a shimmer sweeping every 3.5s, a big sprite, and the title.
  - Back: white, with the band text, "If it happens", a law chip, and a micro source line.
  - It tilts toward the cursor (max 18° Y, 14° X), flips on tap with a 700ms spring rotateY, and is keyboard operable.
- **DialogueBox**: a speaker nameplate (marigold chip; the Mitthu variant is a marigold-soft box with a parrot), typewriter text, a ▶ continue hint, and a 🔊 read-aloud IconButton.
- **ChoiceButton**: secondary Button, full width, left-aligned, with a sprite. Never show a choice's `kind`.
- **SortBin**: a large drop target coloured by the bin's `color`, with a count badge. It bounces when it receives a card.

## 7. Motion system

Use the `motion` package (`import { motion } from "motion/react"`) for springs, drag and scroll. Use CSS keyframes for ambient loops, which are cheaper.

Tier 1, ambient (always on, slow, looping, town only):
- Clouds: 4 lanes drifting left to right, 42 to 70s linear, negative delays so they start mid-screen. Clouds are sprites at 90px.
- Birds: 1 or 2 crossing on a wavy path, 16 to 20s.
- The sun rotates once every 30s. Kites sway ±8° over 3s.
- Mitthu bobs (translateY -6px, rotate -6°) every 2.4s. Done-building rings spin.
- Scenery fills (allowed raw hex): hills `#8CC57A` and `#A9D9A0` with ink stroke 3; path base `#FFF1CF` at width 26; path progress `#FFB320` at width 10.

Tier 2, scroll (town):
- The town is tall (1000×1400 design units, scaled to container width). Every position in `world.json` is in design units.
- Parallax: the far hills layer moves at 0.25 and near hills at 0.55 relative to scroll progress through the map (`useScroll` + `useTransform`).
- The path draws itself: the progress stroke's `pathLength` follows scroll progress × 1.15, clamped to 1.
- Building tiles spring in (scale 0 to 1, `ease-spring`, 600ms) when 30% visible, once.
- On load, smooth-scroll so Mitthu's recommended building is centred.

Tier 3, tap replies (everything in the town):
- Tree: a shake keyframe over 0.5s and 4 leaf sprites falling and fading.
- Cloud: squash and stretch (scale 1.35/0.8) and 5 droplets falling.
- Sun: scale pop. Kite: a loop-de-loop.
- Mitthu: hop, then a speech bubble with a random `mitthuFacts` line for 3.2s.
- Marigold: flies to the 🌼 pill, the pill bumps, and a toast plus confetti play when all 5 are found.
- Locked tile: a shake and a toast.

Tier 4, rewards:
- Correct answer: tile pop, `sound.correct()`, and a ⭐ flying to the stars pill.
- Results: stars appear one by one (300ms apart, spring from scale 0 with a rotation), confetti bursts in the palette colours, and the card thumbnail flies to the Book tab.
- Back in town after a building: that tile bounces, sparkles orbit it, and the next tile's lock pops off (lock scales to 0 and rotates, then the tile turns `current`).
- Card reveal: a dim overlay (ink at 70%), a rotating sunburst behind the card (conic-gradient rays of marigold, 20s spin), and the card flying in from scale 0.2 with a 360° spin.

Page transitions: a curtain wipe between top-level routes. Two rani panels slide in from the sides (300ms), the route swaps, and they slide out (400ms). `sound.whoosh()` plays. There's no wipe into or out of Help; Help simply appears.

Performance and calm rules:
- Animate only `transform` and `opacity`. At most about 25 ambient elements at once. Pause ambient loops when `document.hidden`.
- `settings.calmMotion` or `prefers-reduced-motion` sets `data-calm` on `<html>`. That pauses all CSS animations, disables parallax, path draw (show it fully drawn), fly-to and confetti. Direct feedback stays (press, flip, correct/wrong colour).
- The Help Centre always behaves as calm.

Durations: tap feedback 150ms; sheet 300ms; flip 700ms; typewriter 28ms per character; fly-to 850ms; toast 2.6s.

## 8. Avatars

Library: DiceBear v10, style Big Smile (`@dicebear/core` + `@dicebear/styles`). The docs are at https://www.dicebear.com/styles/big-smile/index.md. It's CC BY 4.0, so it's credited on the Credits screen.

```ts
import { Style, Avatar } from '@dicebear/core';
import definition from '@dicebear/styles/big-smile.json';
const style = new Style(definition);
const svg = new Avatar(style, { seed, skinColor: [hex], hairVariant: [hair], hairColor: [hex],
  eyesVariant: [eyes], mouthVariant: [mouth],
  accessoriesVariant: acc ? [acc] : undefined, accessoriesProbability: acc ? 100 : 0 }).toString();
```

- Render the SVG as an `<img>` data URI (`data:image/svg+xml;utf8,` + encodeURIComponent), memoised on the spec plus mood.
- Mood maps to eyes and mouth through `world.json` `moodMap`.
- Only the `glasses` and `mustache` accessories are allowed. The style also includes cat ears, clown nose and other novelty accessories; never use them.
- The builder palette comes from `world.json` `avatarPalette`: 10 skin tones, 5 hair colours and 13 hairstyles. "Surprise me" randomises everything except grey hair.
- Puppets in stories: kids render at 0.85 scale and adults at 1.0. The speaker bounces (translateY -6px, scaleY 1.03, 350ms alternate) while text types, and the others idle-bob slowly. Each puppet has a name chip under it. Changing mood crossfades over 150ms.
- **Headwear overlays (stretch, Phase 7)**: an absolutely positioned SVG layered over the avatar `<img>` in a shared box.
  - `patka`: a rounded dome over the top of the head with a small front knot. It forces `hairVariant: shortHair`.
  - `hijab`: covers the hair and wraps the face oval down to the shoulders (evenodd face cutout). It sets `hairProbability: 0`.
  - `dupatta`: drapes over the back of the head and down both sides, with a front hair fringe visible. It has a lighter fill with a border stripe.
  - Colours are a chooser of peacock, marigold, rani and leaf. Add them to the builder as a fourth row.
  - Until the overlays exist, ignore `headwear` in content.
  - Build a dev route `/#/dev/avatars` showing every headwear × 3 hairstyles for the human to check alignment.

## 9. Sprites and assets

- Sprites are Microsoft Fluent Emoji 3D PNGs (MIT). The registry is `content/sprites.json` (key → Fluent folder and fallback emoji).
- `scripts/fetch-sprites.mjs` downloads each one to `public/assets/fluent/<key>.png`:
  - URL: `https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/<Folder>/3D/<file>_3d.png`, where file is the folder lowercased with spaces replaced by `_`. URL-encode spaces in the folder.
  - Emoji that have skin tones keep their 3D art under `<Folder>/Default/3D/`.
  - If a URL 404s, list the folder with `https://api.github.com/repos/microsoft/fluentui-emoji/contents/assets/<Folder>` and pick the 3D PNG.
  - Log misses and continue; never block on a sprite.
- The `<Sprite name size />` component renders the PNG and falls back to the native emoji on `onError`. Decorative sprites get `aria-hidden`.
- Assets are committed to the repo. Nothing is loaded from a CDN at runtime; venue Wi-Fi can't be trusted.

## 10. Sound

There are no audio files. `src/lib/sound.ts` synthesises every sound with WebAudio:

| Sound | Recipe |
| --- | --- |
| `tap` | sine sweeping 520 to 780Hz, 70ms, gain 0.12 |
| `pop` | triangle sweeping 300 to 900Hz, 60ms |
| `correct` | triangle notes C5, E5, G5, 90ms each |
| `wrong` | sine sweeping 330 to 220Hz, 180ms, gain 0.08 (soft, never a buzzer) |
| `star` | sines at 1320 and 1760Hz with exponential decay, 150ms |
| `whoosh` | bandpassed noise, 250ms |
| `unlock` | an up-arpeggio of 4 notes |

- Create or resume the AudioContext on the first user gesture.
- Respect `settings.sound`. Gentle-tone buildings use half gain and no `whoosh`. The Help Centre plays no sounds at all.

## 11. Narration

- `src/lib/speech.ts` wraps `speechSynthesis`. Voices load asynchronously, so listen for `voiceschanged`.
- Prefer a voice whose `lang` is `en-IN`, then any voice starting with `en`. Use rate 0.95 and pitch 1.05.
- The 🔊 button reads the current dialogue or card text. If `settings.narration` is on, it reads each node automatically.
- Always `cancel()` on node change and unmount. Skip the narration button quietly if `speechSynthesis` isn't available.

## 12. Accessibility

- Every interactive thing is a `<button>` or `<a>`. There are no clickable `div`s.
- Focus-visible shows a 3px peacock outline with a 3px offset.
- Dialogue text sits in an `aria-live="polite"` region.
- Drag interactions always have a tap alternative: select a card, then tap a bin.
- Colour is never the only signal: pair it with ✓/✗ icons and text.
- Respect `prefers-reduced-motion` (§7 calm rules).
