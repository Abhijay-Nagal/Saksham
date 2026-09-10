# Saksham

A gamified web app that teaches Indian children aged 8 to 16 their legal rights,
through puppet-theatre stories set in a living, explorable town.

Built for Smart India Hackathon, problem statement **SIH1281** (Ministry of Law
and Justice).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

`npm run build` is the quality gate: it typechecks and bundles. There are no
tests in this project — the build passing is the gate.

Sprite PNGs are committed, so nothing is downloaded at runtime. To refetch them:

```bash
node scripts/fetch-sprites.mjs
```

## Deploy

```bash
npm run build
npx vercel --prod        # or drag dist/ into Vercel or Netlify
```

The app uses a `HashRouter`, so URLs look like `/#/town` and no server rewrite
rules are needed. It is a fully static bundle and works from any static host,
or straight off the filesystem.

## Demoing it

- Open a fresh browser profile (or clear site data) so onboarding runs.
- Set zoom to 100% at 1366×768, and turn the sound on.
- **Demo mode** unlocks every building: type `d e m o` anywhere, or long-press
  the logo for two seconds. A "Demo" chip appears in the top bar.
- The 90-second judge path is in `docs/PRODUCT.md` §8.

## How it is put together

- `content/` — every story, quiz, card and helpline, pre-authored and validated.
  Imported through the `@content` alias; nothing is fetched at runtime.
  `content/types.ts` is the shape contract.
- `src/engines/` — the story and mini-game engines. They are **data-driven**: a
  building plays from its JSON alone, and no engine code ever refers to a
  building by id. `tone: "gentle"` is the only per-building switch.
- `src/screens/<Name>/` — one folder per route.
- `src/components/` — `ui/`, `world/` and `avatar/`.
- `src/lib/` — `content.ts` (loaders and `t()`), `store.ts` (zustand plus the
  stars and unlock rules), `sound.ts`, `speech.ts`, `fx.ts`.

Stack: Vite, React, TypeScript (strict), Tailwind v4 (tokens live in `@theme`
in `src/styles/index.css` — there is no `tailwind.config.js`), `motion`,
`react-router` v7, `zustand`, DiceBear v10 and Fluent Emoji sprites.

## Safety rules the code must keep

These are non-negotiable and are checked on every change:

- "Need help?" is reachable from every screen except the Help Centre itself.
- The Help Centre is fully calm: no motion, sound, rewards or points, and never
  red. Its copy comes from `content/help.json` exactly as written.
- Children never see other children's free text. The Pledge Wall uses preset
  pledges; Ask an Expert questions stay on the device.
- The only personal data collected is a first name.
- No streaks and no individual leaderboards. Class Mission is cooperative.
- Legal and story text renders exactly as authored in `content/`.

## Accessibility

- Everything interactive is a `<button>` or `<a>`; tap targets are at least
  48px; dialogue sits in an `aria-live` region; drag always has a tap
  alternative.
- `prefers-reduced-motion`, or the "Calm motion" toggle in Me, sets `data-calm`
  on `<html>`, which pauses ambient loops and disables parallax, confetti and
  fly-to. Direct feedback (presses, flips, right/wrong colour) stays.

## Credits

- Avatars: DiceBear "Big Smile", a remix of "Custom Avatar" by Ashley Seo
  (CC BY 4.0).
- Sprites: Fluent Emoji by Microsoft (MIT).
- Type: Baloo 2 by Ek Type (SIL OFL).

Legal sources for every card are listed on the Credits screen and in each
card's `source` field.
