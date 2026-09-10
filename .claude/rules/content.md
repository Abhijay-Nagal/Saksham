---
paths:
  - "content/**"
  - "src/lib/content.ts"
---
# Content rules

- `content/` is pre-authored and validated: story graphs resolve, answers are in range, and sprite keys exist. Treat it as read-only.
- NEVER rewrite, shorten or "improve" story, card or legal text. If something looks wrong, note it in BUILD_PLAN Session notes for the human.
- The only allowed edit is adding new UI string keys to `strings.en.json`.
- Shape reference: `content/types.ts`. Read it instead of opening JSON files. Open a building JSON only when wiring that specific building.
- Import through the `@content` alias. Never fetch content at runtime.
