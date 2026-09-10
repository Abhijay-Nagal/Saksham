---
paths:
  - "src/components/avatar/**"
---
# Avatar rules

- DiceBear v10 API: `new Style(definition)`, then `new Avatar(style, options).toString()`. Option names are v10: `skinColor`, `hairVariant`, `hairColor`, `eyesVariant`, `mouthVariant`, `accessoriesVariant`, `accessoriesProbability`.
- Don't use v9-style `createAvatar` or `@dicebear/collection` examples.
- The full option list is at https://www.dicebear.com/styles/big-smile/index.md; fetch it if an option errors.
- Allowed accessories are `glasses` and `mustache` only.
- Mood maps to eyes and mouth through `world.moodMap`. The palette comes from `world.avatarPalette`; never invent skin colours.
- Render as an `<img>` data URI, memoised on the spec plus mood.
- Headwear overlays (stretch): see DESIGN §8.
