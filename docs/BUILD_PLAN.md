# BUILD PLAN

Work top to bottom. Resume at the first unchecked box. Each task lists the only doc sections to read for it.

After every task: `npm run build` passes, tick the box here, then commit `P<n>: <task>`.

Budget: **Session 1 covers Phases 0 to 2** (Milestone A: School playable end to end). **Session 2 covers Phases 3 to 6** (Milestone B: full demo, deployed). Phase 7 only if budget remains.

## Phase 0: Foundations

- [x] Scaffold Vite `react-ts` into `_scaffold/` (non-interactive), move its files into the repo root without overwriting `CLAUDE.md`, `docs/`, `content/` or `.claude/`, then delete `_scaffold/`. Run `git init` if needed. Add `.gitignore` for `node_modules` and `dist`.
- [x] Install: `npm i react-router zustand motion @dicebear/core @dicebear/styles @fontsource/baloo-2 canvas-confetti` and `npm i -D tailwindcss @tailwindcss/vite @types/canvas-confetti`. Remove the Vite demo assets and CSS.
- [x] Config: add `@tailwindcss/vite` to `vite.config.ts`, the alias `@content` for `./content` and `@` for `./src` (in both vite and tsconfig paths), and `resolveJsonModule`. Include `content/` in the tsconfig `include`.
- [x] `src/styles/index.css`: tokens and base styles, the calm rules (`html[data-calm] *` pauses animations), and focus-visible. Read: DESIGN §2, §3, §4, §7 (calm rules only).
- [x] `src/lib/content.ts`: typed loaders (`getBuilding(id)`, `world`, `help`, `community`, `sprites`) using static imports or `import.meta.glob({ eager: true })` for `content/buildings/*.json`. Add `t(key, vars)` for strings with `{var}` interpolation. Read: `content/types.ts` only.
- [x] `src/lib/store.ts`: zustand persist store, profile helpers, and derived selectors (unlocked buildings, recommended building, total stars). TEMP: if there are no profiles, auto-create a "Guest" profile (removed in Phase 4). Read: PRODUCT §4, §5, §6.
- [x] `src/lib/sound.ts` and `src/lib/speech.ts`. Read: DESIGN §10, §11.
- [x] `scripts/fetch-sprites.mjs`: run it, commit the PNGs, and build the `<Sprite>` component. Read: DESIGN §9.
- [x] App shell: HashRouter with every route in SCREENS §Routes as placeholder screens; TopBar, BottomNav, HelpButton; `data-calm` syncing from settings and `prefers-reduced-motion`. Read: DESIGN §5, SCREENS §Routes.

Done when: the build passes, every route renders, sprites show, and the shell works at desktop and mobile widths.

## Phase 1: UI kit and the living town

- [x] UI components: Button, IconButton, Pill, Panel, Sheet, Toast (plus a provider), Chip, ProgressBar. Read: DESIGN §6.
- [x] `src/lib/fx.ts`: `confetti(el)` (canvas-confetti in palette colours), `flyTo(fromEl, toEl, sprite, count)`, `sparkle(el)`. All are no-ops under calm. Read: DESIGN §7 tier 4.
- [x] Avatar component (DiceBear, mood mapping, memoised) and Mitthu component (bob, hop, bubble). Read: DESIGN §8 (not the headwear part).
- [x] Town map: layers, ambient loops, scroll parallax and path draw, spot tiles with all states, BuildingSheet, every scenery tap reply, marigolds plus the Sharp Eyes badge, and auto-scroll to the recommended building. Read: SCREENS §Town, DESIGN §7. Check against `docs/reference/style-tile.html` by grepping `.world`, `.bld` and `.cloud`.

Done when: the town feels like style tile v2 at 1366×768 and 390×844, and nothing janks while scrolling.

## Phase 2: Story engine and School end to end (MILESTONE A)

- [x] `src/engines/story/`: `useStory` reducer (current node; carried-over bg, props, cast and moods; retry target; retries count), Theatre (valance, curtains, backdrops, puppets, Mitthu popup), DialogueBox (typewriter, read aloud, aria-live), and Choices. Read: SCREENS §Play: story, DESIGN §6 (DialogueBox, ChoiceButton), `content/buildings/school.json`.
- [x] `/play/:buildingId` phase machine (story, card, game, results) with the play header and phase progress.
- [x] HaqCard component and card reveal phase. Read: SCREENS §Play: card reveal, DESIGN §6 (HaqCard).
- [x] `src/engines/games/QuizGame` with band filtering and the hint round. Read: SCREENS §Play: quiz, PRODUCT §4.
- [x] Results phase, the stars rule, saving progress, badges, unlocking, and the town return celebration. Read: SCREENS §Play: results and §Town (return celebration), PRODUCT §4.

Done when: School plays from the town through to results and back, and stars and unlocks survive a reload. **Write Session notes and commit. This is the end of Session 1.**

## Phase 3: All buildings

- [x] `src/engines/games/SortGame` (drag plus the tap alternative). Read: SCREENS §Play: sort, DESIGN §12.
- [x] Wire Dhaba, Home and Panchayat. This should be content only; if one needs code changes, fix the engine, not the content. Check the Home gentle tone. Read: PRODUCT §7 (gentle).
- [x] Haq Book screen. Read: SCREENS §Haq Book.

Done when: all 4 buildings are playable and each unlocks the next.

## Phase 4: Players and safety

- [x] ProfilePicker, Onboarding, and AvatarBuilder (reused later in Me). Remove the TEMP Guest auto-create. Read: SCREENS §Profile picker and §Onboarding, DESIGN §8.
- [x] Help Centre. Read: SCREENS §Help Centre, PRODUCT §7.
- [x] Me screen and Credits. Read: SCREENS §Me and §Credits.
- [x] Demo mode. Read: PRODUCT §6.

## Phase 5: Community

- [x] Community with 4 tabs. Read: SCREENS §Community, PRODUCT §7.

## Phase 6: Polish and demo (MILESTONE B)

- [x] Curtain page transitions. Read: DESIGN §7 (page transitions).
- [x] Walk the demo path (PRODUCT §8) and fix every rough edge at 1366×768, then check 1920×1080 and 390×844.
- [x] Calm motion and reduced motion pass. Keyboard pass (tab through the demo path).
- [x] Performance: town ambient count and pausing when hidden; no console errors; `npm run build` is clean.
- [x] Add `README.md` with how to run and deploy (`npm run build`, then deploy `dist/` to Vercel or any static host; HashRouter needs no rewrites).

## Phase 7: Stretch (in order, stop anytime)

- [x] Headwear overlays, builder row, and `/dev/avatars`. Read: DESIGN §8 (headwear).
- [x] Teacher dashboard. Read: SCREENS §Teacher dashboard.
- [x] Time-of-day sky (morning, day, evening and night palettes from the clock; night gets stars and glowing windows).

## Session notes

Append at the end of every phase and before stopping. Three to six lines: what's done, what's broken or hacky, and the exact next task. The next session reads only this section and the unchecked boxes.

- **Session 1 (Phases 0-2 + SortGame) done.** School plays end to end: town -> story -> card -> quiz -> results -> town celebration. Build is green, no console errors.
- Sprites: 39/41 fetched. `zipper` and `pledge` 404 upstream (folder names differ); they fall back to native emoji, which looks fine. Not worth chasing.
- Two React bugs found by driving the app headless, both fixed: duplicate `key` on sibling DialogueBox/Choices stranded a second dialogue in the DOM; and an unstable `onFinish` re-ran the end-of-story effect, whose guard then cleared its own timers so the card phase never fired. Watch for that pattern in new effects.
- Dev tooling: Playwright chromium lives in the scratchpad (NOT a project dependency) and drives the app for screenshots. Scripts: `shot.mjs`, `loop.mjs`.
- Puppets are DiceBear heads on an SVG cloth body, sized in `cqh` against the stage (`container-type: size`). The stage is capped at `max-w-[min(1000px,104vh)]` so the whole play screen fits 1366x768.
- Next: Phase 3 — wire Dhaba, Home and Panchayat, then the Haq Book screen.
- **Session 2 (Phases 3-7) done. Every phase and every stretch goal is ticked.** All four buildings play; profiles, onboarding, avatar builder, Help Centre, Me, Credits, Haq Book, Community and the teacher dashboard are built; curtain page transitions are in.
- Verified by driving the real app headless (Playwright, in the scratchpad — NOT a project dependency): the full demo path, all four buildings end to end, 390x844 and 1920x1080, a keyboard pass, and a calm/reduced-motion pass. No console errors anywhere; no horizontal overflow; no tap target under 44px; every `t()` key resolves.
- The play screen is height-fitted on desktop (`md:h-dvh` + a flex column; the theatre carries `md:aspect-[1.69/1]` so its width follows the space the dialogue and choices leave). This is why the story fits 1366x768 with three choices showing. Don't reintroduce a fixed `max-w` on the stage.
- The town is a size container; tiles, scenery and Mitthu scale in `cqw`, which is what stops the map crowding on a phone.
- Stretch: headwear overlays are hand-drawn SVGs calibrated to Big Smile's three-quarter head (crown y 75..170, features centred near x 260). Check any change on `/#/dev/avatars`. `headwearColor` lives on the Profile, not AvatarSpec, because AvatarSpec is a content contract.
- Time-of-day sky uses a CSS `filter` per layer, not a blend-mode overlay (multiply did not composite over the transformed parallax layers).
- Still open for the human: the fact check in HANDOFF.md (ages, penalties, helpline numbers), and the two sprites that 404 upstream (`zipper`, `pledge`) which fall back to native emoji.

