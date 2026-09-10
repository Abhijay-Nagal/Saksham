---
paths:
  - "src/components/**"
  - "src/screens/**"
  - "src/engines/**"
  - "src/styles/**"
---
# UI rules

- Colours, radii and shadows come only from tokens (`bg-marigold`, `rounded-card`, `shadow-pop`). No raw hex, except avatar data and the scenery fills in DESIGN §7.
- Sticker style: 2.5px ink border plus `shadow-pop` on raised elements. Buttons press down 4px on `:active`. Details in DESIGN §4.
- Text: Baloo 2. Reading text is at least 18px. Sentence case. All copy comes via `t('key')`; add missing keys to `content/strings.en.json`.
- Tap targets are at least 48px. Every interactive element is a `<button>` or `<a>`. Drag always has a tap alternative.
- Motion: only `transform` and `opacity`. Ambient loops use CSS keyframes. Springs, drag and scroll use `motion/react`. Every fx call goes through `src/lib/fx.ts` so calm mode can disable it.
- Before building any screen, read its section in `docs/SCREENS.md`, and only that section.
- Unsure how something should look? Grep `docs/reference/style-tile.html` for the class (`.world`, `.bld`, `.stage`, `.tilt`, `.calm`). Don't read the whole file.
