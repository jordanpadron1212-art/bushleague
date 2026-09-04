# HANDOFF — Bush League

**Current state: the repository itself is the build.** There is no more single artifact file — read
this file, then open `apps/web/src/` and `packages/sim-kit/src/`. Search `DECISIONS.md` before
proposing anything that feels like a new idea — 80 of them are already recorded, several against
things that sound good.

> **Rewritten whole, not patched — 2026-09-04.** `WORKFLOW.md` says "patch it, never rewrite it" for
> an incremental pass; this isn't one. The engineering substrate changed (`DECISIONS.md` D78), so every
> file path, command and status claim in the old HANDOFF was stale at once. Full rewrite is the
> documented exception, same as the original project instructions' close ritual specified.

---

## Where everything is

This GitHub repository (`jordanpadron1212-art/bushleague`), not a local folder — the old project lived
in `C:\Users\jorda\OneDrive\bush league sim` and synced via zip between sessions (D20). That's retired:
the repo is now the single source of truth, cloned fresh by whichever session (cloud or local) is
working on it, and deployed straight from `main` (LAWS.md's old Law 17, reinterpreted: every pass
leaves `main` green, not a handed-over file).

| path | what |
|---|---|
| `apps/web/` | the game — React 19 + TypeScript + Vite + Tailwind v4, deployed to GitHub Pages |
| `packages/sim-kit/` | the portable engine — state schema, the double-entry ledger, RNG, formatters. Framework-agnostic, tested with Vitest |
| `.github/workflows/ci-deploy.yml` | typecheck → test → build → Playwright visual check → deploy, on every push to `main` |
| `HANDOFF.md` | this file |
| `DECISIONS.md` | every decision with its reasoning, D1–D80. Search before proposing |
| `RESEARCH.md` | every real-world figure with source, date and tier. Seventeen sections |
| `LAWS.md` / `DESIGN.md` / `UI.md` | the architecture laws (Laws 1/13/17 superseded, flagged not deleted), the design, the interface spec |
| `CHANGELOG.md` / `ROADMAP.md` / `WORKFLOW.md` | what shipped, what is next, how a session runs |
| `PROJECT-INSTRUCTIONS.md` / `STACK-AND-ENGINES.md` | the standing brief this mirrors, and the tooling inventory this pass's stack choices were drawn from |
| `proposals/FRONT-OFFICE-DESIGN-PROPOSAL.md` | unbuilt, still awaiting Jordan's call on its §1 — see "Waiting for you" below |

No `qa/` folder and no `compose.py` — those belonged to the retired single-file build and have no
equivalent yet. The nearest thing to a gate is `.github/workflows/ci-deploy.yml`.

---

## How to work on it

1. **Read this file. Search `DECISIONS.md`. Open `apps/web/src/` and `packages/sim-kit/src/`** — never
   assume what the code does from an old build's description.
2. **Research before code**, unchanged from the original project instructions: source every real-world
   figure a pass needs before writing the system, log it in `RESEARCH.md` with source, date and tier.
3. **One system per pass, fully finished.** For any pass that adds a screen, propose the layout first
   (`UI.md` is already the spec for most of what's coming — check it before drawing a new one) and get
   Jordan's sign-off before coding.
4. **Verify before delivering** — run the commands below, in full, every pass.
5. **End with build notes**: what shipped · number tiers with sources · what was verified, quoting the
   numbers · materiality in units of a decision Jordan actually makes, and say "negligible" if it is ·
   known gaps · the next two or three passes.
6. **Close**: commit and push to `main` (CI deploys automatically), append decisions with reasoning,
   patch this file (rewrite only for a substrate-level change, per the note at the top), update
   `ROADMAP.md` against reality.

## Run this before you deliver anything

```
pnpm install
pnpm run typecheck
pnpm run test
pnpm --filter web exec playwright install --with-deps chromium   # first time only
pnpm run build
pnpm --filter web run test:visual
```

That is the whole gate right now — five commands, under two minutes, verified end-to-end while building
this pass. It is much thinner than the old 17-harness gate because most of what that gate defended
(closed-league identity, roster legality, the save round trip, schedule fairness) doesn't exist yet to
defend — **the gate will need to regrow as each system is ported, not stay this short forever.**

Then — not optional, `DECISIONS.md` D16's lesson survives the rewrite — **look at the Playwright
screenshots** (`apps/web/test-results/`, or the `visual-qa-screenshots` artifact on a CI run). Eight of
the ten worst defects in the old build were found by eye with every harness green.

---

## Waiting for you — do these before starting a pass

1. **`proposals/FRONT-OFFICE-DESIGN-PROPOSAL.md` has one open question at its §1**, unresolved for two
   sessions running: does the ownership ladder let you buy an affiliated MiLB club, and if so, does that
   purchase carry real baseball authority (unrealistic, per RESEARCH.md §17.1) or none (realistic, but a
   screen that mostly says "no")? Recommended default in the proposal is "skip affiliate ownership as a
   playable rung" — flagged, not decided.
2. **Has Jordan played the old build?** Asked and apparently answered mid-project (the 2026-09-04
   catch-up note this repo's docs were assembled from says "you've played v0.9," but what specifically
   stood out never made it into a doc). Worth raising directly — it may change what the world-generation
   port should prioritize.

---

## Where this stands

**A chassis, a verified player-generation engine, a real 218-club world, and a real schedule — still
not a game you can open and play.**

Working and verified: the pnpm workspace and its CI/CD to GitHub Pages · the token layer (two shells,
two themes, three density tiers, contrast computed against DECISIONS.md D18's own rule) · the page
registry (`DECISIONS.md` D11's pattern, now 18 pages, 1 live) · the Office page, honestly empty ·
`@bushleague/sim-kit`'s ledger, chart of accounts, RNG and formatters, all tested against real sourced
examples · a PWA that installs and precaches for offline play after a first visit · player generation
and grading, calibrated against RESEARCH.md §7.1 (`DECISIONS.md` D79) · **club/world generation** — all
218 real clubs (30 MLB + 120 affiliated + 68 independent) with correct divisions, leagues and unique
ids/abbreviations · **the schedule** — every club lands on its exact published game count, home/away
balanced (D34), opponent distribution fair (D46) — `DECISIONS.md` D80.

**Not built yet:** the box-score game engine, the market, the winter cycle, scouting, the draft, trades,
contracts, injuries in depth, player development, the ownership ladder, play-by-play, staff, awards and
history. All of it existed and worked in `bush-league-v0.10.html`. See ROADMAP.md's "Next, in order."
**Nothing plays yet — there is a world and a schedule, but no game has ever been simulated.**

---

## What was measured, not assumed, this pass

| claim | measured | source |
|---|---|---|
| `@bushleague/sim-kit` ledger reconciles a season of postings | 61 entries, `auditBooks()` returns 0 fails, assets == liabilities+equity+net income | `packages/sim-kit/test/ledger.test.ts` |
| formatters match RESEARCH.md §3.7's verified examples | `.311`, `2.39`, `144.1`, `.818`, `$412K` all exact | `packages/sim-kit/test/format.test.ts` |
| mulberry32 RNG is deterministic | same seed → identical 10-value sequence | `packages/sim-kit/test/rng.test.ts` |
| light-theme token contrast (D18's rule: worst of 4 surfaces) | all six semantic colours ≥ 4.5:1, dark and light | computed, `apps/web/src/styles/tokens.css`'s own header comment |
| Vite 8 + `vite-plugin-pwa` | build throws a Rolldown-incompatibility error | reproduced directly, not read about — pinned to Vite 7 instead |
| font payload, all Unicode subsets vs. Latin-only | PWA precache 672.00 KiB → 412.80 KiB (−38.6%) | `vite build` output, before/after `@fontsource` subset imports |
| Playwright visual check | 8/8 pass — both shells, both themes, 360px + 1440px, 0 console errors, 0 horizontal overflow | `apps/web/e2e/visual.spec.ts`, run against the pre-installed sandbox Chromium |
| generated hitter/pitcher populations reproduce RESEARCH.md §7.1's published lines | 50/50 checks pass at MLB/AAA/AA/HIA/A (slash line ≤2%, HR ≤5.5%, per-nine ≤2%) — MLB BA .244 vs published .245, Triple-A OPS .768 vs .768 exactly | `packages/sim-kit/test/calibration.test.ts` |
| Pecos environment stays hotter than the Single-A baseline it's derived from | `rg`/`hr9` both strictly greater, elevation (4,870ft) recorded on the env for the provenance sheet | same file |
| the real world is 218 clubs, not the old docs' "202" | 30 MLB + 120 affiliated + 68 independent, counted from the actual data tables, not asserted | `packages/sim-kit/test/world.test.ts` |
| every club id is globally unique; Sioux City/Sioux Falls get distinct abbreviations | both regressions re-verified against the exact cases DECISIONS.md D28 and its Law 14 catalogue entry record | same file |
| every one of 218 clubs lands on its exact published game count | MLB 162, AAA 150, AA 138, HIA/A 132, Atlantic 126 … Pecos 54 — all exact, via `buildFullSeasonSchedule` | `packages/sim-kit/test/schedule.test.ts` |
| MLB home/away balance and Pecos's parity-limited balance | within 2.5 games (D34) and within 4 (D45's stated arithmetic floor for a 54-game/15-opponent pool) | same file |

**Nothing about the old build's own game-outcome numbers** (the +8.5 win materiality, the age-structure
match, the per-league economics) was re-measured — none of that system is ported yet, so there is
nothing yet to measure it against. Restating those old numbers here would be citing a build that no
longer runs.

---

## Known gaps — say these out loud, do not let them look solved

- **Nothing plays.** This is a shell around an empty world. Say so before a screenshot makes it look
  otherwise.
- **No gate depth yet.** The five-command gate above is what exists, not what's enough — it will need
  the equivalent of `qa/doctor.js`'s "every diagnostic in one command" property once there's a world and
  a save to diagnose.
- **No save/load.** `packages/sim-kit`'s `GameState` type and `createInitialState()` exist; nothing
  persists it to IndexedDB yet, and nothing reads it back. The action bar says so rather than pretending
  a "Start a new game" button works.
- **The 23 old `src/` fragments and 17 `qa/` harnesses are gone**, in the sense that they were never
  uploaded to any session in editable form — only the composed `bush-league-v0.10.html` was. World-gen
  and the engine have to be read out of that file and ported with fresh tests, not diffed from a
  fragment set that doesn't exist here. (Player generation, this pass, is the proof that this approach
  works — 50/50 calibration checks against real published lines, ported without the fragments.)
- **Player generation has no ERA/WHIP calibration.** Those are opponent-dependent (log5 against a
  batter) and need the box-score engine — see `packages/sim-kit/test/calibration.test.ts`'s own header
  comment. Not an oversight; stated as the reason ERA/WHIP aren't in the 50 checks above.
- **A world and a schedule exist; no game has ever been played on it.** `buildWorld()` and
  `buildFullSeasonSchedule()` produce real clubs and a real calendar of matchups — nothing resolves one
  into a score yet.
- **The schedule placer's series-length cap has a verified fallback-scan interaction** (`DECISIONS.md`
  D80): a pair can occasionally play 5-6 unbroken calendar days instead of the intended 2-4-game series,
  when that pair's remaining need dominates every other candidate. Confirmed harmless to game totals and
  home/away balance; left as-ported rather than silently tightened, documented in `schedule.ts`'s own
  comment on the cap.
- **No migration path from an old save.** `SCHEMA_VERSION` starts at 1. A real, stated consequence of
  the rewrite (LAWS.md's old Law 11, "saves are forever," doesn't survive a substrate change — noted,
  not silently dropped).
- **PWA offline is not the same guarantee Law 1 made.** A device needs one successful first load before
  it works offline. Closest available match to the old guarantee, not identical to it.

---

## The next three passes, in order

See `ROADMAP.md`'s "Next, in order" for the full reasoning. Short version:

1. **Port the box-score game engine** (`log5`/`resolvePA`/`draw`, the `ADV` calibration constants) —
   this is what turns a scheduled matchup and two `rateProfile()` outputs into an actual score, and what
   unlocks ERA/WHIP calibration (the one stated gap in player generation).
2. **Wire Office/Books/Roster to real state** — a Zustand store, an IndexedDB save, and the pages this
   project left honestly empty actually showing something. This is the "winnable and losable, not a menu
   mockup" bar the original project instructions always held V1 to.
3. **Player development and ageing** — the pass that makes scouting mean anything, still queued behind
   the two above.

A deep realism-research workflow (development curves by individual tool, Statcast-era pitch/batted-ball
modeling, defensive value in real units, platoon splits, the post-2023 baserunning rule effects, the
NPB/KBO posting system) was launched this session and should be merged into `RESEARCH.md` — check
whether it landed and reconcile it with the same rigor D77 used for the earlier §9.6/§14.3 conflict
before treating any of it as sourced.

**Playtest still beats roadmap.** Ask Jordan what stood out from playing the old build before assuming
this ordering is right.
