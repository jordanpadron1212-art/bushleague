# HANDOFF — Bush League

**Current state: the repository itself is the build.** There is no more single artifact file — read
this file, then open `apps/web/src/` and `packages/sim-kit/src/`. Search `DECISIONS.md` before
proposing anything that feels like a new idea — 84 of them are already recorded, several against
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
| `DECISIONS.md` | every decision with its reasoning, D1–D84. Search before proposing |
| `RESEARCH.md` | every real-world figure with source, date and tier. 24 sections |
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

**A chassis, a verified player-generation engine, a real 218-club world, a real schedule, and — for the
first time in this rewrite — a full season that can actually be played end to end.**

Working and verified: the pnpm workspace and its CI/CD to GitHub Pages · the token layer (two shells,
two themes, three density tiers, contrast computed against DECISIONS.md D18's own rule) · the page
registry (`DECISIONS.md` D11's pattern, now 18 pages, 1 live) · the Office page, honestly empty ·
`@bushleague/sim-kit`'s ledger, chart of accounts, RNG and formatters, all tested against real sourced
examples · a PWA that installs and precaches for offline play after a first visit · player generation
and grading, calibrated against RESEARCH.md §7.1 (`DECISIONS.md` D79) · **club/world generation** — all
218 real clubs (30 MLB + 120 affiliated + 68 independent) with correct divisions, leagues and unique
ids/abbreviations · **the schedule** — every club lands on its exact published game count, home/away
balanced (D34), opponent distribution fair (D46) — `DECISIONS.md` D80 · **plate-appearance resolution**
— `log5`, `resolvePA` and `draw` ported and calibrated: the `log5(l,l,l) === l` identity proven exact
— `DECISIONS.md` D81 · **roster construction, depth charts, and a full played game** — every club's
roster generated legal-by-construction to its league's own published rule (age/service-year ranges,
independent-league payroll capped exactly to the real published figure), a lineup/rotation/bullpen
charted from it, and `simGame` playing a real nine-plus-inning game between two rosters through
`resolvePA` — `DECISIONS.md` D82 · **the season-play driver** — `playDay`/`playSeason` walk a built
schedule and call `simGame` for every game on it, updating every club's record; the full real 218-club
world's full real schedule (all its games, not a sample) plays end to end in under 3 seconds, every
closed-system identity (wins==losses==games played, runs scored==runs allowed) holds EXACTLY, and the
full real 2,430-game MLB season reproduces RESEARCH.md §7.1 within 4% at every stat, HR/9 within 0.06%
— `DECISIONS.md` D84.

**Not built yet:** the market, the winter cycle, scouting, the draft, trades, contracts in depth,
injuries in depth, player development, the ownership ladder, play-by-play, staff, awards and history —
and, closer at hand, an owner's own club, a season-reset/year-rollover function, and wiring any of the
engine above to the UI or a real save. All of the game-logic list existed and worked in
`bush-league-v0.10.html`. See ROADMAP.md's "Next, in order." **A full season can be simulated for the
first time — nothing yet calls it from anywhere a player would see, and nothing persists what happens
when it's played.**

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
| `log5(l,l,l)` reproduces the league rate exactly | true for .245/.315/.08/.22, to 10 decimal places | `packages/sim-kit/test/pa-resolution.test.ts` |
| `resolvePA` over 200,000 isolated-pairing PAs per level reproduces RESEARCH.md §7.1 | BA/OBP within 3%, SLG within 6%, HR/600 within 15%, BB%/K% within 8% at MLB/AAA/AA/HIA/A — tolerances documented as a real finding, not a relaxed bar (see next row) | same file |
| the `ADV.hrCal`/`ADV.bbCal` constants (0.92/1.06) were tuned against the full lineup/rotation game, not isolated per-PA pairing | HR rate sits ~8-9% low even at near-zero simulated population spread, matching hrCal's own discount in direction and magnitude | diagnosed via a temporary spread-sweep test, documented in `pa-resolution.test.ts`'s header and `DECISIONS.md` D81 |
| every independent club's roster is legal by construction | every player's age and service year falls inside its league's own published comp-table range, at all five independent leagues | `packages/sim-kit/test/roster.test.ts` |
| every independent club's payroll lands exactly on its league's published cap | residual rounding absorbed by the best-paid man, verified at all five leagues | same file |
| a full simulated game plays at least 9 innings, never ties, and never awards the same pitcher both the win and the loss | 20 games checked directly | `packages/sim-kit/test/game.test.ts` |
| a full simulated season (500 games/level, real lineups) reproduces RESEARCH.md §7.1 | ERA within 8%, WHIP/K9 within 6-8%, BA/OBP/SLG within 3-4% at every affiliated level | same file |
| the D81 hrCal hypothesis, re-checked with real lineup context | HR/9 lands within ~10% of published at every level (worst: AA +10.4%) — a large improvement over D81's isolated-PA ~8-9% LOW, confirming hrCal was tuned against real lineup context | same file, see `DECISIONS.md` D82 |
| BB/9 with real lineup context | still runs high, up to +9.6% at Single-A — reproduces the ORIGINAL build's own documented "walks too many batters" red, not a new port defect | same file |
| the full real 218-club world's full real schedule plays end to end | under 3 seconds; total wins == total losses == total games played and total runs scored == total runs allowed, EXACTLY, across all 218 clubs | `packages/sim-kit/test/season.test.ts` |
| every club's games-played lands exactly on its league's published schedule length after a full season is played | all 218 clubs checked directly, not sampled | same file |
| the full real 2,430-game MLB season reproduces RESEARCH.md §7.1 | ERA 3.74%, WHIP 0.48%, K/9 0.86%, BB/9 2.06%, BA 2.54%, OBP 1.75%, SLG 1.97%, HR/9 0.06% — tighter than the prior pass's 500-game sample at every stat | same file, see `DECISIONS.md` D84 |

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
- **A full season can be simulated end to end, but nothing calls it from anywhere a player would see,
  and nothing persists what happens.** `playSeason` plays every game a real schedule contains — but
  there is no owner's own club (every club in a run advances identically; nothing distinguishes "mine"),
  no save, and no UI wired to any of it.
- **No season-reset/year-rollover function exists yet.** A freshly built world (`buildWorld()`) already
  zeroes every club's record, so year one works out of the box — but nothing yet re-zeroes an EXISTING
  world's w/l/rs/ra/gp/l10/strk for year two. The original's own equivalent (`c.w=0;c.l=0;...` inside a
  season-reset function this port hasn't ported) is a small, known gap for whichever pass adds
  multi-year continuation.
- **The `hrCal`/`bbCal` calibration constants (0.92/1.06) are ported as-is — D81's open question is now
  answered, not still open.** With real lineup context (this pass), HR/9 lands within ~10% of published
  at every level, confirming the constants were tuned against real lineup/rotation play and need no
  further correction now that context exists.
- **BB/9 (and WHIP) run consistently high with real lineup context too** — up to +9.6% at Single-A.
  Confirmed to be the same "walks too many batters" red the ORIGINAL build's own QA left unresolved for
  several builds (ROADMAP.md's "Engineering debt worth paying soon"), not a new port defect. Left
  as-ported and documented — retuning the walk-rate formula is real work for whoever picks it up next,
  not an incidental fix inside a porting pass.
- **Free agency and the injured list are not generated.** The original's `buildRosters()` also builds a
  free-agent pool and puts two players per club on the IL; neither is ported (`roster.ts`'s own header
  note) — a free-agent pool has no meaning without the market pass that draws from it, and a game can be
  simulated without either.
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

**Done: the realism-research workflow's findings are merged into `RESEARCH.md`** (§18–24, `DECISIONS.md`
D83), and **the season-play driver** (`playDay`/`playSeason`, `DECISIONS.md` D84) — a full real season
now plays end to end, verified against RESEARCH.md §7.1 at full scale, not a sample.

1. **Wire Office/Books/Roster to real state** — a Zustand store, an IndexedDB save, and the pages this
   project left honestly empty actually showing something. This is the "winnable and losable, not a menu
   mockup" bar the original project instructions always held V1 to. This is also where an "owner's own
   club" concept finally needs to exist — `season.ts`'s own gap, noted above.
2. **Player development and ageing** — the pass that makes scouting mean anything, and the first
   consumer of §18's newly-sourced component-aging curves rather than something waiting on them.
3. **Scouting, the amateur draft, then the ladder itself** — club valuation and purchase, per
   ROADMAP.md's unchanged pre-rewrite reasoning.

**Playtest still beats roadmap.** Ask Jordan what stood out from playing the old build before assuming
this ordering is right.
