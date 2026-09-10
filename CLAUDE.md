# Saksham

A gamified web app that teaches Indian kids aged 8 to 16 their legal rights through puppet-theatre stories in a living, explorable town. It's a hackathon prototype (SIH1281), judged on a live laptop demo. A polished demo path beats feature count, and the app must be runnable at every commit.

## Start of every session

1. Read the `## Session notes` section and the unchecked boxes in `docs/BUILD_PLAN.md`. Resume at the first unchecked task.
2. Each task names the doc sections to read. Read ONLY those. Find sections with `grep -n '^## ' docs/<FILE>.md` and read by line range. Never read a whole doc file.
3. Don't explore `content/` JSON. Read `content/types.ts` for shapes.

## Where to look

| Need | Read |
| --- | --- |
| Rules for stars, unlocks, adaptive, profiles, safety | `docs/PRODUCT.md` (sections §4 to §7) |
| Tokens, components, motion, avatars, sprites, sound | `docs/DESIGN.md` (the one section you need) |
| A specific screen's layout and behaviour | `docs/SCREENS.md` (that screen's section) |
| What the look should feel like | grep `docs/reference/style-tile.html` for a class; never read it whole |
| Content shape | `content/types.ts` |
| The demo path to polish | `docs/PRODUCT.md` §8 |

Path-scoped rules in `.claude/rules/` load automatically for UI, engines, avatars, content and the Help Centre.

## Commands

- Install: `npm install`
- Build (the quality gate; runs typecheck and bundle): `npm run build`
- Sprites: `node scripts/fetch-sprites.mjs`
- Dev server: `npm run dev`. Only start it in the background if you truly need it; the human normally runs it. Never block on it.
- No tests in this project. The build passing is the gate.

## Stack (fixed; don't add libraries without writing why in Session notes)

- Vite, React, TypeScript (strict)
- Tailwind v4 via `@tailwindcss/vite`: tokens live in `@theme` in `src/styles/index.css`, and there is NO `tailwind.config.js`
- `motion` (import from `"motion/react"`), not `framer-motion`
- `react-router` v7 (import from `"react-router"`, not `react-router-dom`) with a HashRouter
- `zustand` with `persist`
- `@dicebear/core` and `@dicebear/styles` v10
- `@fontsource/baloo-2`
- `canvas-confetti`

## Architecture

- `content/` holds pre-authored JSON and `types.ts`, imported via the `@content` alias. It is read-only (see `.claude/rules/content.md`).
- `src/screens/<Name>/`: one folder per route (`Town`, `Play`, `Help`, `Community`, `Me`, `Book`, `Profiles`, `Onboarding`, `Credits`).
- `src/engines/story/` and `src/engines/games/`: data-driven engines. No building-specific code.
- `src/components/ui/`, `src/components/world/`, `src/components/avatar/`.
- `src/lib/`: `content.ts` (loaders and `t()`), `store.ts` (zustand plus the stars and unlock rules), `sound.ts`, `speech.ts`, `fx.ts`.
- `public/assets/fluent/`: sprite PNGs, committed.

## Code style

- Function components with named exports, one component per file. Props are typed with interfaces.
- All UI copy goes through `t('key')` from `content/strings.en.json`. No hardcoded user-facing strings.
- The app name comes from `world.appName` in content. Never hardcode it.
- Styling is Tailwind utilities with tokens only. Use inline `style` only for computed values (positions, transforms).

## Workflow

- After each task: `npm run build` must pass, tick the box in BUILD_PLAN, then `git add -A && git commit -m "P<n>: <task>"`.
- At the end of each phase, or when context feels long: append 3 to 6 lines to BUILD_PLAN `## Session notes` and commit. The next session depends on these notes.
- If a library or API fails twice, use the documented fallback (e.g. native emoji for sprites), note it, and move on. Don't rabbit-hole.
- Prefer finishing a phase rough over starting the next phase. Never leave `main` broken.

## Gotchas

- `create-vite` won't scaffold into a non-empty directory without prompting. Scaffold into `_scaffold/` and move the files.
- DiceBear v10 changed its API and option names. Use `new Style(definition)` and `new Avatar(style, opts)`, not the v9 `createAvatar`. See `.claude/rules/avatars.md`.
- Import JSON with `resolveJsonModule`. If `with { type: 'json' }` import attributes cause trouble, a plain JSON import works in Vite.
- WebAudio: create or resume the AudioContext on the first user gesture, otherwise there's silence.
- `speechSynthesis` voices load asynchronously (`voiceschanged`). Cancel speech on unmount.
- Fluent emoji folders contain spaces (URL-encode them). Emoji with skin tones keep their 3D art under `Default/3D/`.
- HashRouter URLs look like `/#/town`. Don't switch to BrowserRouter; it breaks static hosting.

## Never break (safety)

- "Need help?" is visible on every screen except the Help Centre.
- The Help Centre is fully calm: no motion, sound, rewards or points.
- Kids never see other kids' free text. The only personal data is a first name.
- No streaks and no individual leaderboards.
- Legal and story text renders exactly as written in `content/`.
