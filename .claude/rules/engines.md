---
paths:
  - "src/engines/**"
  - "src/screens/Play/**"
---
# Engine rules

- The engines are data-driven. A building must play from its JSON alone; never special-case a building id in engine code. `tone` is the only per-building switch.
- Story state carries forward: `bg`, `props` and `cast` persist until a node changes them. Moods reset to `normal` on every node unless specified.
- On `end: retry`, jump to the last node that had `choices` and restore that node's carried state. Count the retries.
- The stars and unlock rules are in PRODUCT §4. Implement them once in `src/lib/store.ts` and call them from results.
- Stop narration (`speech.cancel()`) on every node change and on unmount.
