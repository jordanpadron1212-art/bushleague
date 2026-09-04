# HANDOFF — Bush League

**Current state: the repository itself is the build.** There is no more single artifact file — read
this file, then open `apps/web/src/` and `packages/sim-kit/src/`. Search `DECISIONS.md` before
proposing anything that feels like a new idea — 87 of them are already recorded, several against
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
| `DECISIONS.md` | every decision with its reasoning, D1–D87. Search before proposing |
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

That is the whole gate right now — five commands, under two minutes. It is thinner than the old
17-harness gate, but has been regrowing pass by pass, per the note above: roster legality
(`roster.test.ts`) and schedule fairness (`schedule.test.ts`, D34/D46) were both real by the roster and
schedule passes; this pass adds closed-league identity at full-season-driver scale (`season.test.ts`'s
exact wins==losses, runs==runs checks across all 218 clubs) and the save round trip
(`save.test.ts`, `newgame.test.ts`'s reload-reproducibility test) for the first time. **The gate will
keep regrowing as each remaining system is ported — it is not yet the equivalent of `qa/doctor.js`'s
"every diagnostic in one command," just several of that command's individual diagnostics, each in its
own real test file.**

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
3. **The "choose your club" screen isn't speced in UI.md.** UI.md jumps straight from "no save" to the
   Office/Books mockups without ever drawing a new-game flow. Shipped anyway (`apps/web/src/pages/
   NewGamePage.tsx`) rather than leaving the checkpoint's own "all 30 MLB clubs" target unreachable —
   kept deliberately minimal (a plain grouped list, no styling pass) and flagged here rather than
   presented as if it were signed off. Worth a real design pass once Jordan's seen it.
4. **`bush-league-v0.10.html` — the primary source every porting pass through v2.6.0 read code out of —
   is gone from whatever container the next session runs in.** Found the hard way this pass (D86): it was
   never committed to this git repository (only the composed `.html` artifact ever existed, and only as a
   session attachment, never a repo file), so a fresh container has no way to re-read it. Everything
   through v2.6.0 was ported having actually read the real source; this pass's `gateDay`/`postMonth`/
   `seedOpeningBooks`/`rosterPayroll` were reconstructed from working notes instead (flagged in
   `economics.ts`'s own header, cross-checked hard against this project's own committed CHANGELOG.md/
   DECISIONS.md historical record, but still not a verified line-for-line port). If a future pass needs to
   read the original source directly — to re-verify this pass's reconstruction, or to port a system this
   project hasn't reached yet — **re-attach `bush-league-v0.10.html` to that session**, or nobody can
   check anything in it against ground truth again.

---

## Where this stands

**For the first time in this rewrite: a real game you can open, play, watch post real money, close, and
come back to.** Choose a club, watch a real world and schedule generate, advance days, watch real
standings move and real gate revenue and payroll hit the books, reload the page and get your save back
exactly as you left it.

Working and verified: the pnpm workspace and its CI/CD to GitHub Pages · the token layer (two shells,
two themes, three density tiers, contrast computed against DECISIONS.md D18's own rule) · the page
registry (`DECISIONS.md` D11's pattern, now 18 pages, **2 live**) · `@bushleague/sim-kit`'s ledger,
chart of accounts, RNG and formatters, all tested against real sourced examples · a PWA that installs
and precaches for offline play after a first visit · player generation and grading, calibrated against
RESEARCH.md §7.1 (`DECISIONS.md` D79) · **club/world generation** — all 218 real clubs with correct
divisions, leagues and unique ids/abbreviations · **the schedule** — every club lands on its exact
published game count, home/away balanced, opponent distribution fair — `DECISIONS.md` D80 ·
**plate-appearance resolution** — `log5`, `resolvePA` and `draw`, the `log5(l,l,l) === l` identity
proven exact — `DECISIONS.md` D81 · **roster construction, depth charts, and a full played game** —
every club's roster legal-by-construction to its league's own published rule, `simGame` playing a real
nine-plus-inning game — `DECISIONS.md` D82 · **the season-play driver** — the full real 218-club
world's full real schedule plays end to end in under 3 seconds, every closed-system identity holds
EXACTLY, the full real MLB season reproduces RESEARCH.md §7.1 within 4% at every stat — `DECISIONS.md`
D84 · **state, save/load, and two real screens** — `newGame()`/`advanceDay()` assemble and drive a
`GameState`, IndexedDB persists it (`idb`) — `DECISIONS.md` D85 · **the money loop** — opening capital
seeds the ledger before a game is played, gate revenue posts on every home date against real attendance
(a 40-game prior blended with last season's finish), operating costs and payroll post monthly (MLB over
all 12 calendar months, independent leagues in-season only), MLB local media accrues to a receivable and
collects with a one-month lag, and both **Office and Books show real, populated, audited financial
data** — a real income statement, a real balanced balance sheet, `auditBooks()` reading PASSES, verified
with actual browser screenshots including a page reload — `DECISIONS.md` D86 · **player development and
ageing** — every player's hidden true grades now move with age, eleven tools each individually sourced to
RESEARCH.md §18 (speed peaks earliest and falls hardest, power next, contact/plate discipline latest and
most stable, pitcher control genuinely role-aware — starters improve then hold, relievers erode from the
start), plus `rollover.ts`, the minimal mechanism that lets a save reach a second year at all (ages and
develops the existing population, resets club records, regenerates the schedule) — `DECISIONS.md` D87.
The RNG stream is fully save-reproducible, closing a gap the original build never closed.

**Not built yet:** the market, the winter cycle (free agency, contract expiration, an amateur intake —
the actual fix for D87's own disclosed "no churn means the population only ages" consequence),
retirement (no sourced hazard curve exists), scouting (including a monthly scouting cost — chart-of-
accounts entry 5300 exists, no sourced dollar figure survived the economics pass's reconstruction), the
draft, trades, contracts in depth, injuries in depth, the ownership ladder (an owner picks only among the
30 MLB clubs today), play-by-play, staff, awards and history, and a UI affordance to actually reach
`startNewSeason` from the app — it's a real, tested `sim-kit` primitive with no caller in `apps/web` yet.
See ROADMAP.md's "Next, in order."

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
| a fresh save is real and complete | 218 clubs, the owned club sized to `OWNED_N` not `ROSTER_N`, a real full-season schedule, zero non-finite values anywhere in the state | `packages/sim-kit/test/newgame.test.ts` |
| the RNG stream is fully save-reproducible | two independently-built states from the same seed, each advanced one day, produce byte-identical results — the original build never closed this gap | same file |
| a real IndexedDB save round-trips exactly | against `fake-indexeddb`, not a mock of `idb`'s own API | `apps/web/test/save.test.ts` |
| the whole app mounts and moves through its real states | no save → club picker → real game → Office, and a save from a prior session loads straight to Office | `apps/web/test/app.test.tsx` |
| Office, Books and the club picker render clean | 24/24 — 2 shells × 2 themes × 2 widths, 0 console errors, 0 horizontal overflow; screenshots looked at, not just captured (choose a club → real standings → advance → reload → byte-identical) | `apps/web/e2e/visual.spec.ts`, manual verification this pass |
| the ledger stays balanced across a full simulated season | `auditBooks()`: 0 fails, checked mid-run and at year end, across several MLB seeds | `packages/sim-kit/test/economics.test.ts` |
| the opening-capital seed covers the pre-season runway | cash never goes negative at any point across a full simulated year | same file |
| MLB net income against the tuning target ("nets roughly zero over a full calendar year") | averages -21.1% of revenue across 5 seeds (worst seed -32.1%) — a real, disclosed, quantified gap, not silently hidden; see `DECISIONS.md` D86 on why | same file |
| the four flat-cost independent-league economies against the sourced "-$385 to +$963 at .500" target (`CHANGELOG.md` Build 0.7, `DECISIONS.md` D49) | after an empirical re-solve (`INDY_OPEX_RECAL`, per-league `opScale`), every league lands within ~14 points of revenue on its worst held-out seed and within 10 points on its 3-seed average — an order of magnitude closer than the ~80% margin the first reconstruction produced | same file, see `DECISIONS.md` D86 |
| the MLB local-media receivable (account 1100) never grows unbounded | stays at or below one month's accrual throughout a full simulated year | same file |
| Office's "This month" panel and all five Books panes show real, non-zero, populated data | screenshotted at 1440px and 360px, both shells, both themes: real gate-revenue ledger entries with real attendance figures, a real income statement, a balanced balance sheet ($648.04M assets = $340.00M liabilities + $308.04M equity in one run), `auditBooks()` reading PASSES (48 entries / 144 lines) | temporary Playwright spec, run and screenshots looked at, then deleted per D16 |
| aging tool curves reproduce RESEARCH.md §18's sourced peak-age ORDERING | speed peaks before power, which peaks at or before contact/plate discipline, in a 2,000-player simulated population aged 20→40 | `packages/sim-kit/test/development.test.ts` |
| pitch movement is far more stable across a career than raw stuff/velocity | movement's full-career swing is smaller than stuff's, same simulated population | same file |
| starters' and relievers' control diverge in the sourced opposite directions | from an IDENTICAL starting population (same RNG seed, only role differs): starter control trends up 20→30, reliever control trends down over the same span | same file |
| ageing never produces a grade outside the 20-80 scale | checked at every simulated age, every tool | same file |
| `startNewSeason` produces a real, complete, playable next season | every club's record resets to zero, the regenerated schedule gives the owned club its exact published game count (162 for MLB), `advanceDay` plays real games again immediately after rollover, three consecutive rollovers all succeed | `packages/sim-kit/test/rollover.test.ts` |
| rollover leaves no non-finite value anywhere in state, and ages every player by exactly one year | checked directly against each player's pre-rollover age | same file |
| DISCLOSED: with no roster churn, a club's average age climbs monotonically across consecutive rollovers | measured directly across 4 consecutive rollovers, not assumed — the same closed-population effect the original build's own v0.9 pass found | same file, see `DECISIONS.md` D87 |

**Nothing about the old build's own game-outcome numbers not yet re-verified here** (the +8.5 win
materiality) was re-measured this pass. The age-structure match (the original's own "median age 34.8
after five seasons" finding, §8.5) IS now directly comparable — D87's own rollover test reproduces the
same underlying phenomenon on purpose, as a stated consequence of this pass's scope, not a fresh discovery.
The per-league economics ARE now measured against the old build's own numbers (rows above) — restating the
old build's own dollar figures beyond what's cited above would be citing a build that no longer runs.

---

## Known gaps — say these out loud, do not let them look solved

- **`bush-league-v0.10.html` is not in this container and never was in the repo.** See "Waiting for
  you" item 4 above — anyone who needs to re-verify this pass's reconstructed money-loop functions
  (`gateDay`/`postMonth`/`seedOpeningBooks`/`rosterPayroll`) against the real primary source needs it
  re-attached to a session first.
- **MLB net income runs about -21% of revenue over a full simulated calendar year, not "roughly zero."**
  A real, measured, disclosed gap (`DECISIONS.md` D86), not silently loosened test tolerances. Unlike the
  independent leagues (which WERE re-solved against a sourced target this pass found in the project's own
  historical record and now land within ~10 points on average), there is no equally precise sourced
  dollar target for MLB — only the qualitative "nets roughly zero" — and the gap traces mostly to
  `contractFor`'s MLB salary curve (a different, already-verified system, v2.4.0) pricing a random 40-man
  roster higher than `ECON.MLB`'s reconstructed revenue figures cover. Re-tuning either system further is
  real work for whoever picks it up next armed with either the primary source or a sourced MLB target,
  not a fix to slip inside another pass.
- **No monthly scouting cost is posted.** `accounts.ts`'s chart-of-accounts entry 5300 ("Scouting")
  exists; no dollar figure for it survived this pass's reconstruction. Left unposted rather than
  inventing one — a real gap for the scouting pass to close, not an oversight.
- **The ownership ladder doesn't exist — a new game picks only among the 30 MLB clubs.** The checkpoint's
  own stated target ("all 30 MLB clubs"), not a smaller slice of it, but not the indy-to-MLB climb
  either. `proposals/FRONT-OFFICE-DESIGN-PROPOSAL.md`'s open §1 question is still unresolved and still
  blocks designing this properly.
- **`startNewSeason` (D87) has no UI affordance to reach it.** A real, tested `sim-kit` primitive — ages
  and develops the population, resets club records, regenerates the schedule — with nothing in `apps/web`
  calling it yet. A save that reaches `seasonOver` today just stops; nothing in the app offers to roll it
  into a new year.
- **No roster churn — a real, disclosed, MEASURED consequence, not a guess.** `rollover.test.ts` proves a
  club's average age climbs every consecutive year with nobody entering or leaving the population — the
  same "closed population under an age rule has exactly one destination" finding the original build's own
  v0.9 pass made before it built real free agency/contract expiration/an amateur intake to fix it. None of
  that is ported yet; D87's own ageing system is real and correct, but only solves half of §8.5's original
  gap (players now age realistically; nobody yet leaves or arrives to keep the population from aging
  uniformly toward the ceiling over many years).
- **No retirement.** No sourced retirement-hazard-by-age curve exists anywhere in this project's
  research (RESEARCH.md §8.5 asks for one; none found this pass either) — left unmodelled rather than
  inventing a hazard curve with nothing behind it.
- **The "choose your club" screen isn't UI.md-speced** — flagged in "Waiting for you" above, not
  presented as if it were signed off.
- **No gate depth yet.** The five-command gate above is what exists, not what's enough — it will need
  the equivalent of `qa/doctor.js`'s "every diagnostic in one command" property once there's more to
  diagnose (injuries, the market, contracts).
- **The 23 old `src/` fragments and 17 `qa/` harnesses are gone**, in the sense that they were never
  uploaded to any session in editable form — only the composed `bush-league-v0.10.html` was. World-gen
  and the engine have to be read out of that file and ported with fresh tests, not diffed from a
  fragment set that doesn't exist here. (Player generation, this pass, is the proof that this approach
  works — 50/50 calibration checks against real published lines, ported without the fragments.)
- **Player generation has no ERA/WHIP calibration.** Those are opponent-dependent (log5 against a
  batter) and need the box-score engine — see `packages/sim-kit/test/calibration.test.ts`'s own header
  comment. Not an oversight; stated as the reason ERA/WHIP aren't in the 50 checks above.
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

**Done: the realism-research merge** (§18–24, `DECISIONS.md` D83), **the season-play driver** (D84),
**state/save/Office/Books** (D85), **the money loop** (D86), and **player development and ageing plus a
minimal season rollover** (D87) — a real game you can start, play, save, reload, watch post real gate
revenue and payroll, and (via the `sim-kit` primitive, not yet wired into the UI) age a whole season's
worth of players realistically into a second year. UI.md §13.3's own checkpoint ("Office + Books") is met
AND populated.

1. **Scouting, the amateur draft, then the ladder itself** — club valuation and purchase, per
   ROADMAP.md's unchanged pre-rewrite reasoning. This is also where a real monthly scouting-cost dollar
   figure needs sourcing (account 5300 exists, unposted — D86's own disclosed gap), and where the
   ownership ladder (indy → MiLB → MLB, not just "pick one of 30 MLB clubs") needs to get designed —
   `proposals/FRONT-OFFICE-DESIGN-PROPOSAL.md`'s open §1 question blocks it.
2. **Real roster churn** — free agency, contract expiration, an amateur intake. D87's own rollover test
   proves the population ages uniformly with nobody entering or leaving; this is the actual fix, the same
   one the original build's own v0.9 pass built, not a smaller version of it.
3. **A UI affordance for `startNewSeason`.** The `sim-kit` primitive (D87) is real and tested; nothing in
   `apps/web` calls it yet — a save that reaches `seasonOver` today just stops.

**Playtest still beats roadmap.** Ask Jordan what stood out from playing the old build before assuming
this ordering is right.
