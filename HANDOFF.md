# Handoff: how to run the build with Claude Code

This file is for the human running Claude Code. Claude Code doesn't need to read it.

## What's in this kit

- `CLAUDE.md`: loaded automatically every turn. It holds rules and tells Claude which doc section to read when.
- `.claude/rules/`: rules that load only when Claude touches matching files (UI, engines, avatars, content, Help Centre).
- `docs/BUILD_PLAN.md`: the phased checklist. Claude ticks boxes and writes session notes here.
- `docs/PRODUCT.md`, `docs/DESIGN.md`, `docs/SCREENS.md`: specs, read one section at a time.
- `docs/reference/style-tile.html`: open this in a browser to see the intended look.
- `content/`: every story, quiz, card and helpline, already written and checked. Claude only builds the engine.

## Setup (5 minutes)

1. Install Node 20 or newer, git, and Claude Code.
2. Unzip the kit, then run:

```
cd saksham
git init && git add -A && git commit -m "kit"
claude
```

3. Pick Opus with high effort (`/model`).

## Session 1 prompt (Phases 0 to 2)

```
Read CLAUDE.md, then docs/BUILD_PLAN.md. Build Phases 0, 1 and 2 in order, following each task's "Read:" pointers and nothing more. After every task run npm run build, tick the box and commit. When Phase 2 is done, write Session notes and stop.
```

Tips during the session:

- Run `npm run dev` yourself in a second terminal and keep http://localhost:5173 open. Tell Claude about anything that looks wrong, and paste screenshots; it can see images.
- After each phase commit, type `/clear`. The plan and notes live in files, so nothing is lost, and a fresh context costs far less usage than a long one.
- If Claude starts reading whole docs or exploring `content/`, stop it and say "read only the section named in the task".

## Session 2 prompt (Phases 3 to 6)

```
Read CLAUDE.md, then the Session notes and unchecked boxes in docs/BUILD_PLAN.md. Continue from the first unchecked task through Phase 6. Same loop: build, tick, commit, and write Session notes at each phase end. Do Phase 7 only if Phase 6 is fully done.
```

## If usage runs out mid-phase

The last commit always works. Run `git stash` to set aside half-finished changes if the app is broken, and demo from the last commit.

## Renaming

The app name lives in one place: `appName` in `content/world.json`. Change it there and the whole UI follows.

## Demo tips

- Deploy: run `npm run build`, then drag the `dist/` folder into Vercel or Netlify, or run `npx vercel --prod`. HashRouter needs no configuration.
- Before judging: open the app in a fresh browser profile (or clear site data), set zoom to 100% at 1366×768, and turn sound on.
- Demo mode: type `demo` on the keyboard, or long-press the logo, to unlock every building if you want to jump ahead.
- The demo path to rehearse is in `docs/PRODUCT.md` §8.

## Before submission: fact check

The legal facts in `content/` were written carefully, but this is a Ministry of Law problem statement. Spend 15 minutes having a teammate verify these against official sources (India Code, NCPCR, NALSA):

- the ages in the RTE, Child Labour and PCMA Acts
- the penalty amounts
- the helpline numbers 1098, 112, 15100 and 1930

Each card's `source` field lists the sections.
