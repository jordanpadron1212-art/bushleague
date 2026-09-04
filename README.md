# Bush League

Run a ballclub from a folding chair in indy ball to a big-league dynasty. Every dollar posts to real
books; every prospect is a rumor until he proves it. An OOTP-depth baseball management sim with
desk-software finish, phone-first, hosted as an installable PWA.

**Start here → [`HANDOFF.md`](./HANDOFF.md).** It is rewritten at the close of every pass and is always
the first thing to read, before touching any code.

## Status

A chassis, not yet a game — see `HANDOFF.md`'s "Where this stands" for the honest breakdown of what's
real and what's declared-but-dark. World generation, the sim engine, the market and the winter cycle
exist as working logic in a retired single-file build and are not yet ported into this stack.

## Stack

React 19 · TypeScript · Vite 7 · Tailwind CSS v4 · pnpm workspaces · Zustand · TanStack Table/Virtual ·
IndexedDB (`idb`) for saves · deployed to GitHub Pages as a PWA. See `DECISIONS.md` D78 for why, and
`STACK-AND-ENGINES.md` for the fuller tooling inventory this pass's choices were drawn from.

## Repository layout

```
apps/web/          the game — UI, routing, the token/design system
packages/sim-kit/   the portable engine — state schema, ledger, RNG, formatters (framework-agnostic)
proposals/          design proposals awaiting sign-off before anything gets built from them
```

## Working on this project

```
pnpm install
pnpm run dev          # apps/web on Vite's dev server
pnpm run typecheck
pnpm run test          # Vitest — sim-kit + web
pnpm run build          # apps/web/dist, ready for GitHub Pages
```

The full doc set — `HANDOFF.md`, `DECISIONS.md`, `RESEARCH.md`, `LAWS.md`, `DESIGN.md`, `UI.md`,
`ROADMAP.md`, `CHANGELOG.md`, `WORKFLOW.md` — lives at the repository root, following the project's own
established convention rather than a generic `docs/` folder. `WORKFLOW.md` describes exactly how a
session should open, build and close.

## Deployment

Every push to `main` runs typecheck, unit tests and a Playwright visual check (360px + 1440px, both
themes, both UI shells), then deploys `apps/web` to GitHub Pages via GitHub Actions
(`.github/workflows/ci-deploy.yml`). GitHub Pages itself needs to be switched on once in the repository
settings (**Settings → Pages → Source → GitHub Actions**) before the first deploy will go live.
