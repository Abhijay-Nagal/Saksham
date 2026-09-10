# PRODUCT — Saksham

Read one section at a time. Sections are `## ` headers; find them with `grep -n '^## ' docs/PRODUCT.md`.

## 1. What and who

- A gamified web app that teaches Indian children aged 8 to 16 their legal rights through interactive stories in an explorable town.
- Problem statement SIH1281 (Ministry of Law and Justice). This is a hackathon prototype for an internal judging round.
- It's judged on a live demo on a laptop and projector, plus short user testing on phones. Polish on the demo path beats breadth.
- Two age bands: `young` (8 to 11) and `teen` (12 to 16). The band changes card text and adds teen-only quiz questions.
- The prototype is English only. All UI strings live in `content/strings.en.json` so Hindi and other languages can be added later.

## 2. Scope

In scope (build this):
- Profiles on a shared device (no login, no email, first name only), onboarding, and an avatar builder.
- The town map with 4 playable buildings (School, Dhaba, Home, Panchayat), 2 locked "coming soon" teasers (Playground, Cyber Adda), and the Help Centre.
- The core loop per building: story, then a rights card, then mini-game, then results.
- Two game engines only: quiz and sort.
- Book (card album), Me (badges, settings), Help Centre, Community (sample data), Credits.
- Demo mode (unlock everything).

Out of scope (do NOT build): backend, login, real chat, real expert messaging, analytics, multi-language switching, PWA/offline caching, and tests.

Stretch goals, only after Phase 6, in this order: headwear overlays, teacher dashboard, time-of-day sky.

## 3. Core loop

1. Tap a building on the town map. A sheet opens with the right's name, the tagline and a Play button.
2. **Story**: a puppet-theatre scene. The player reads or listens, then makes a choice. Bad choices play a consequence, and Mitthu asks them to try again from the choice. The good choice leads to the good ending.
3. **Card reveal**: a collectible card explaining the right. The text shown depends on the age band.
4. **Mini-game**: a quiz or sort game from the building's JSON.
5. **Results**: stars, the card goes into the Book, badges are checked, and the next building unlocks. Back in town, the building "lights up".

## 4. Rules

- **Stars (max 3 per building)**:
  - 1 star for finishing the story.
  - +1 if the game score is 60% or more.
  - +1 if the game score is 90% or more AND the story had no retries.
  - Keep the best result per building. Replays can only raise stars.
- **Game score** is correct on the first attempt divided by total questions or items. For the quiz, only questions shown for the player's band count.
- **Unlocks**: School is always unlocked. Finishing building N in `world.json` `buildingOrder` unlocks N+1. Teasers are never playable.
- **Adaptive rules (rule-based, no ML)**:
  - The `young` band sees `card.kid` with a "Tell me more" button that shows `card.teen`. The `teen` band sees `card.teen`.
  - Teen-only questions (`band: "teen"`) appear only for `teen`.
  - If the quiz score is under 60%, offer "Mitthu's hint round". It replays the missed questions with the explanation shown first. The hint round does NOT change the score.
  - On the town map, Mitthu perches at the next recommended building: the first unlocked building with fewer than 3 stars.
- **Badges**: see `world.json` `badges`. Check them after results, after finding a marigold, and after a pledge. Show a toast when one unlocks.
- **Marigolds**: 5 are hidden on the town map, tracked per profile. Finding all 5 unlocks `sharp-eyes`.

## 5. Data and persistence

Zustand store persisted to localStorage under the key `saksham-v1`:

```ts
interface Profile {
  id: string; name: string; avatar: AvatarSpec; band: AgeBand; createdAt: number;
  buildings: Record<string, { stars: 0|1|2|3; bestScore: number; completed: boolean }>;
  cards: string[];        // Card ids
  badges: string[];
  marigolds: number[];    // indexes into world.map.marigolds
  pledges: string[];      // pledge ids taken
  questions: { topic: string; text: string; at: number }[]; // Ask an Expert, local only
}
interface Settings { sound: boolean; narration: boolean; calmMotion: boolean; demo: boolean }
interface AppState { profiles: Profile[]; activeProfileId: string | null; settings: Settings }
```

- Settings are device-wide, not per profile.
- Content is static JSON imported at build time. Nothing is fetched at runtime.

## 6. Demo mode

- Typing the letters `d e m o` anywhere, or long-pressing the header logo for 2 seconds, toggles `settings.demo`.
- In demo mode every playable building is unlocked and a small "Demo" chip shows in the top bar. Stars and progress still work normally.

## 7. Safety rules (non-negotiable)

- A "Need help?" button is visible on every screen except the Help Centre itself.
- The Help Centre has no animation, confetti, points, badges or sounds, and gives no rewards for visiting. Its colour is calm peacock blue, never red.
- Kids never type text that other kids can see. The Pledge Wall uses preset pledges only. Ask an Expert questions are private and stored locally.
- The name field asks for a first name only, with a helper line saying so. Nothing else personal is collected.
- There are no streaks, no individual leaderboards and no comparing kids. Class Mission is cooperative: everyone's stars add up.
- Buildings with `tone: "gentle"` (Home) use a soft sparkle instead of confetti and quieter sounds. Their results screen shows the `results.gentleNote` line with a link to Help.
- Community content is sample data and is labelled "Sample".
- Legal text is displayed exactly as written in content. Never paraphrase it in code.

## 8. Demo path (polish this first)

The 90-second judge demo, in order:

1. Profile picker, then create a player (avatar builder with the skin range).
2. The town (scroll, tap a tree and Mitthu).
3. School: the curtain opens and a story choice is made (show one wrong choice, then the right one).
4. Card reveal and flip.
5. Quiz with two answers.
6. Results: stars fly and the Dhaba unlocks in town.
7. The Help Centre, showing the calm contrast.
8. The Pledge Wall, taking a pledge.

Every screen on this path must be flawless at 1366×768.
