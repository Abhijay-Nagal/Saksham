# SCREENS

One section per screen. Read only the section for the screen you're building (`grep -n '^## ' docs/SCREENS.md`). All copy comes from `content/strings.en.json`; add new keys there rather than hardcoding text.

## Routes

HashRouter (`react-router` v7). Every route except `/play/:id` sits inside the App shell (DESIGN §5).

| Route | Screen |
| --- | --- |
| `/` | Start redirect: active profile goes to `/town`; profiles exist goes to `/profiles`; otherwise `/onboarding` |
| `/profiles` | Profile picker |
| `/onboarding` | Onboarding |
| `/town` | Town map (home) |
| `/play/:buildingId` | Play flow: story, card, game, results (one route, internal phase state) |
| `/book` | Book |
| `/help` | Help Centre |
| `/community` | Community |
| `/me` | Me |
| `/credits` | Credits |
| `/teacher` | Teacher dashboard (stretch) |
| `/dev/avatars` | Headwear alignment grid (stretch, dev only) |

## Profile picker

- A big "Who's playing?" heading and Mitthu.
- A grid of profile tiles: avatar in a circle with a gentle bob, and the name chip. The last tile is a "+ New player" dashed tile.
- Tapping a tile sets the active profile, then a curtain wipe to `/town`.

## Onboarding

Five steps with progress dots at the top. Back is allowed. Each step springs in from the right.

0. **Hello**: Mitthu flies in from the left (spring) with a speech bubble (`onboarding.mitthuHello`). Button: Next.
1. **Name**:
   - A large input with `onboarding.nameSafety` below it.
   - Validate a non-empty trimmed value, 20 characters max, letters and spaces only.
   - Show an inline error (`onboarding.nameError`) and stay on the step until it's valid.
2. **Avatar**: AvatarBuilder.
   - A big preview on the left, desktop only (200px circle on sky, bobbing, re-springs on every change).
   - On the right: a skin row (10 swatches), hair chips (each chip has a tiny avatar preview), a hair colour row (5 swatches), a glasses toggle, and "Surprise me".
   - Mobile stacks the preview above the controls.
3. **Age band**: two big cards, "8 to 11" and "12 to 16", each with a sprite. Selecting one springs it and gives it a marigold fill.
4. **Ready**: the avatar pops, confetti plays, and the "Let's go to town!" button creates the profile and does a curtain wipe to `/town`.

## Town

Layout: the app shell, then the map container (max 1000px, aspect 1000:1400, sky background, rounded panel, sticker border) with a small welcome strip above it (`town.welcome`, plus `town.nextUp` from Mitthu).

Layers, back to front:
1. Sky
2. Far hills (parallax)
3. Near hills (parallax)
4. Clouds and birds (ambient)
5. Sun
6. Path (base plus progress draw)
7. Trees and kites
8. Building spots
9. Hidden marigolds (24px, partly tucked behind trees or tiles)
10. Mitthu, perched to the upper left of the recommended building
11. Bubbles and fx

All spots come from `world.json` `map`, positioned in design units converted to percentages. Tile states are in DESIGN §6. Motion is in DESIGN §7.

Interactions:
- A playable tile opens BuildingSheet: the sprite, title, `right`, `tagline`, stars earned, and a Play (or "Play again") button that goes to `/play/:id`.
- For `tone: gentle` the sheet adds "This story is about staying safe. You can stop anytime."
- A locked tile shakes and shows the `town.locked` toast.
- A teaser tile opens a sheet with the teaser text and no Play button.
- The Help tile navigates to `/help`.
- Scenery taps follow DESIGN §7 tier 3.

Return celebration: when arriving from results, the location state `{ justCompleted: id, unlocked: nextId }` triggers the tier 4 town celebration. Scroll to that tile first.

## Play: story

Full-screen stage, max 1000px, centred. From top to bottom:

1. The play header: exit ✕, the building title, the phase progress, and Help.
2. **Stage** (16:9 on desktop, 4:5 on mobile):
   - A rani valance with a scalloped edge and a marigold trim line, and rani striped curtains.
   - The backdrop depends on `bg`.
   - Props: node sprites rendered at 90 to 120px on the backdrop.
   - Cast puppets are placed by count: 1 in the centre; 2 at 28% and 72%; 3 at 18%, 50% and 82%.
   - A wooden floor strip.
3. **DialogueBox** with choices beneath it.

Backdrops, drawn as CSS/SVG shapes plus sprites:

| `bg` | Look |
| --- | --- |
| `school` | sky top 62%, grass below, school sprite at left |
| `street` | sky, a beige road band with a dashed line, props on the roadside |
| `dhaba` | a warm marigold-soft wall, a wood counter band, and props on the counter |
| `home` | a paper-coloured wall with a rangoli border band (repeating simple SVG motif), a window square showing sky, and a rug |
| `panchayat` | sky and grass, with the classical-building sprite and a large tree |

Flow:
- On enter, the curtains open (1.1s) with `sound.whoosh()`.
- When `bg` changes between nodes, the curtains close (400ms), the scene swaps, and they open (600ms).
- Text types out. A tap completes it; the next tap goes to `next`.
- If a node has choices, show ChoiceButtons after typing finishes, staggered 80ms.
- **On choose**: the other choices fade out, the chosen one pops, and the story goes to `to`.
- **`end: retry`**: Mitthu's node shows a "Try again" Button. It jumps back to the last choice node and restores that node's bg, props, cast and moods. Increment `retries`.
- **`end: good`**: the curtains close, then the card phase.
- Mitthu-speaker nodes show the parrot sprite popping up from the bottom-right of the stage with the Mitthu DialogueBox variant.

## Play: card reveal

- An overlay with a sunburst, and the card flies in (DESIGN §7 tier 4). The title reads `card.newCard`.
- The front shows first; after 1.2s it shows the `card.flip` hint. A tap flips it.
- **Back of the card**:
  - The band text. For `young`, a "Tell me more" button expands the teen text inline.
  - `ifItHappens` with a small "Need help?" link.
  - The law chip and the source micro line.
- A 🔊 button reads the visible text.
- Button: `card.continue` goes to the game.
- The card is added to the profile immediately on reveal.

## Play: quiz

- Progress: ProgressBar with Mitthu walking, and "Question n of N".
- The question is at h2 size. Options are big tiles: a 2×2 grid on desktop, stacked on mobile.
- Tapping an option answers instantly:
  - **Correct**: the tile turns leaf with ✓, pops, plays `sound.correct()`, and a star flies up. This is cosmetic only; stars are awarded at results.
  - **Wrong**: the tile shakes and turns rani with ✗, and the correct tile highlights leaf.
  - Either way, the `explain` panel slides up with a "Next question" button.
- At the end: if the score is under 60%, offer the hint round (PRODUCT §4). Otherwise go to results.

## Play: sort

- The `prompt` sits at the top. There are two bins at the bottom (desktop: left and right halves; mobile: two stacked bars). Items are a deck, and one card at a time is shown big in the centre.
- **Drag**: drag the card with Motion drag; on release over a bin, check the answer. **Tap**: tap the card to select it (it lifts and gets a peacock outline), then tap a bin.
- **Correct**: the card flies into the bin, the bin bounces and its count increments, and a short `explain` toast shows.
- **Wrong**: the card shakes and returns, the `explain` shows in a panel with "Got it", then the card auto-flies to the correct bin. It counts as wrong.
- After all items, go to results.

## Play: results

- `results.title` plus a mood-happy avatar of the player.
- Three star slots fill one by one (DESIGN §7 tier 4), with `results.stars`.
- The card thumbnail flies to the Book tab or icon. Badges unlocked now show as toasts.
- Buttons: `results.backToTown` (primary) goes to `/town` with the celebration state, and `results.tryAgain` restarts the game phase only.
- Gentle tone: a soft sparkle instead of confetti, plus the `results.gentleNote` Panel linking to `/help`.

## Book

- An album grid: 4 building cards plus 2 teaser silhouettes ("Coming soon"), and a progress label "n / 4 cards".
- An owned card shows its front with tilt. Tap opens a modal with a large flippable Card.
- An unowned card is a dashed silhouette with "?" and `book.lockedCard`.

## Help Centre

- Calm mode: `data-calm` is forced, there's no ambient layer, no sounds, and the top bar hides the Help button and counters.
- Layout, top to bottom:
  - `headline` and `subline`.
  - The primary helplines as big white cards with a peacock border. Each shows the number at 34px/800, the name, the description, and a "Call" Button (`tel:` link).
  - The secondary helplines in a smaller row.
  - "How to tell a trusted adult" as numbered steps (a real sequence, so numbers are fine).
  - "Your rights when you ask for help" as a list.
  - The "More places" list.
  - The disclaimer in small text.
- A "Hide this screen" ghost button top right goes to `/town`.

## Community

A tab row with four tabs. "Sample" micro label on each.

1. **Pledge Wall**:
   - A masonry grid of wall entries (avatar, name, place, pledge text with sprite).
   - The "Take a pledge" Button opens a Sheet listing the 6 preset pledges.
   - Choosing one adds a card with the player's avatar to the top of the wall (spring-in plus confetti), saves it to `profile.pledges`, and marks already-taken pledges.
2. **Class Mission**: a big chunky progress bar from `current + player's total stars` to `target`, with `note` underneath. Cooperative wording only.
3. **Ask an Expert**:
   - `intro`, then topic Chips and a textarea (max 300 characters).
   - `safetyNote` in a peacock-soft panel.
   - Submit validates a topic and non-empty text, saves to `profile.questions`, and shows `submittedMessage`.
   - Below: the answered Q&A as an accordion.
4. **Places that help**: resource Panels.

## Me

- The avatar (160px) with an "Edit" button that opens AvatarBuilder in a Sheet. Also the name, band chip (tap to change), total stars, and card count.
- Badges grid: unlocked badges are full colour and gently bob; locked ones are greyscale with the `how` text.
- Settings toggles: sound, narration, calm motion. Plus "Switch player" (goes to `/profiles`).
- Footer links: Credits, and "For teachers" once the stretch is done.

## Credits

- The app name and a line: "Built for Smart India Hackathon (SIH1281)".
- Asset credits:
  - DiceBear "Big Smile" style, a remix of "Custom Avatar" by Ashley Seo (CC BY 4.0).
  - Fluent Emoji by Microsoft (MIT).
  - Baloo 2 by Ek Type (SIL OFL).
- Legal sources: the list of each card's `source`.

## Teacher dashboard (stretch)

- Data: `community.json` `teacherDashboard`. Label it "Sample class".
- A heatmap table of students × buildings, with cells coloured by stars (0 = locked grey, 1 = rani-soft, 2 = marigold-soft, 3 = leaf-soft) and ✓ counts.
- Class average stars per building shown as bars. Common mistakes shown as Panels.
