# HANDOFF — Bush League

**Current state: the repository itself is the build.** There is no more single artifact file — read
this file, then open `apps/web/src/` and `packages/sim-kit/src/`. Search `DECISIONS.md` before
proposing anything that feels like a new idea — 104 of them are already recorded, several against
things that sound good.

> **Rewritten whole, not patched — 2026-09-04.** `WORKFLOW.md` says "patch it, never rewrite it" for
> an incremental pass; this isn't one. The engineering substrate changed (`DECISIONS.md` D78), so every
> file path, command and status claim in the old HANDOFF was stale at once. Full rewrite is the
> documented exception, same as the original project instructions' close ritual specified.

> **The game is an endless sandbox, owned — not a career climb. Corrected by Jordan 2026-09-05.**
> ROADMAP.md said for a long time that "the ownership ladder — the climb from the floor to the
> Show — is the game." That is no longer the design. The game is an **endless sandbox**: real
> clubs at all levels and leagues, the player picks **which leagues load into a save**, custom
> leagues come later as their own layer, and the role is **always owner, in every save**. Scoped and
> designed the same day: **DECISIONS.md D95** records the answers, `proposals/WORLD-CONFIGURATION.md`
> is the design awaiting sign-off.

> **You own the organization; you do NOT operate it (D96) — read `proposals/OWNER-AND-STAFF.md`
> before designing any screen.** Staff run baseball operations. A per-area delegation dial
> (Hands-on / Approve / Notify / Silent) decides what reaches the owner's desk. This invalidates the
> pending **Lineup** page as designed (an owner does not set a batting order) and makes **Roster** a
> view of an asset rather than a place to move players. v2.14.0's draft philosophy is the pattern
> done right, before it had a name.

> **The visual direction is signed off and saved (D94), but is NOT in the app yet.** `design/
> war-room.html` is the approved reference; `design/DESIGN-SYSTEM.md` is the spec. The app still
> ships the original palette. Build every new screen in the new scheme, and re-skin the existing
> three per §7 of the spec.

> **CI was red for the entire history of this rewrite until D92 (v2.13.0), 2026-09-04.** Every one of
> this project's CI runs from v2.0.0 through v2.12.0 — its ENTIRE history — actually failed on GitHub's
> own servers (Node 24 there vs. Node 22 in every session that verified locally, a jsdom/undici
> `AbortSignal` mismatch under Node 24 specifically). Because the build job's own failure short-circuits
> before the deploy step runs, no version of this game had ever gone live at the GitHub Pages URL despite
> every single pass's own "pnpm test / pnpm build / Playwright gate all pass" — that was true locally,
> and CI's own run history says otherwise. Fixed in D92; verify `.github/workflows/`'s most recent run
> actually shows `conclusion: success` before ever telling anyone this game is "live" or "deployed" —
> that claim was wrong every time it was made before this note existed.

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
| `DECISIONS.md` | every decision with its reasoning, D1–D104. Search before proposing |
| `RESEARCH.md` | every real-world figure with source, date and tier. 24 sections |
| `LAWS.md` / `DESIGN.md` / `UI.md` | the architecture laws (Laws 1/13/17 superseded, flagged not deleted), the design, the interface spec |
| `CHANGELOG.md` / `ROADMAP.md` / `WORKFLOW.md` | what shipped, what is next, how a session runs |
| `PROJECT-INSTRUCTIONS.md` / `STACK-AND-ENGINES.md` | the standing brief this mirrors, and the tooling inventory this pass's stack choices were drawn from |
| `design/war-room.html` + `design/DESIGN-SYSTEM.md` | **the signed-off visual direction (D94)** — the reference render, and the buildable spec every new screen is built against. NOT yet applied to the app; see §7 of the spec |
| `proposals/OWNER-AND-STAFF.md` | **the interaction model for the whole game (D96)** — you own the org, staff operate it, delegation is per-area and player-set. Read before designing ANY screen |
| `proposals/WORLD-CONFIGURATION.md` | **the next build** — league packs, selection, the background world (D95). Awaiting sign-off |
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
develops the existing population, resets club records, regenerates the schedule) — `DECISIONS.md` D87 ·
**and the action bar can actually reach it** — once a save's schedule is exhausted, it detects that
directly from state and offers "START THE [next year] SEASON," wired to a real `gameStore.startNewSeason`
action — `DECISIONS.md` D88. The RNG stream is fully save-reproducible, closing a gap the original build
never closed. **And real roster churn** — `churn.ts`, wired into `startNewSeason` itself: every rollover
now retires a real, age-weighted share of each club's roster and fills every vacated (and freshly-grown,
for a level's own comp table) slot with a fresh, legally-composed signee, re-solved against Build 0.9's
own sourced Frontier League target (median age, aged-28+ share, roster continuity) the same empirical
method D86 used for the economics pass — `DECISIONS.md` D89. A club's average age now measurably
stabilizes across many consecutive rollovers instead of climbing forever, closing half of D87's own
disclosed gap; free agency, contract expiration, and an amateur intake as their own systems remain
deliberately out of this pass's scope (see "Not built yet"). **And a real scouting budget** — a monthly
cost finally posts to the chart of accounts' long-empty entry 5300, and `refineScout`'s reliability
mechanism (D24) — dead all season since it was previously only ever called once, at roster construction —
now actually re-reads the owned roster's real accumulated stats every month, narrowed further by real
spend within the same [0.15, 0.93] ceiling D24 already set — `DECISIONS.md` D90. **And real minor-league
parent affiliation** — every one of the 120 affiliated MiLB clubs `buildWorld` generates now carries a
real, sourced `parent` field naming the MLB org that actually owns it (119 of 120; one city, "Hill City,"
couldn't be matched against any real source and stays disclosed rather than guessed) — closing a gap this
project had flagged as open since an earlier pass, unblocking both the amateur draft (a pick needs
somewhere real to go) and the Organization page (dark until this exact data existed) — `DECISIONS.md` D91.
**And a real amateur draft** — `draft.ts`: a fresh 600-prospect talent pool scored on scouted grades only,
a real draft order with the sourced top-6 lottery (RESEARCH.md §1.5), 20 rounds, wired into
`startNewSeason` before churn runs. Every club drafts automatically (best-player-available); the owner's
own club follows a settable philosophy (`state.draftPhilosophy` — best-available/fill-needs/upside) via a
new control on a now-real Draft page. Drafted players are routed through `churn.ts`'s existing
fill-vacancy loop onto their own drafting org's MiLB affiliates — never the MLB roster directly, never
displacing a survivor — `DECISIONS.md` D93.

**Not built yet:** the market and free agency AS THEIR OWN SYSTEM (a named player signing with a specific
club, AI GM valuation/negotiation, a free-agent pool UI) — `churn.ts` (D89) replaces retiring/departing
players anonymously, it does not model any individual player's free agency, retirement as its own modelled
concept (no sourced hazard curve exists), a scouting-DIRECTOR/area-scout staff system and any owner-facing
control to move the scouting budget off its default (D90's own disclosed gap — the cost and its reliability
effect are both real and wired in; the dial to change them from the app isn't), the Organization page (no
UI exists yet to show the parent data D91 provides), Competitive Balance draft rounds, the bonus-pool/
slot-value/overage-tax financial system, revenue-sharing lottery-eligibility restrictions, and interactive
(pick-by-pick) drafting (D93's own disclosed scope boundary — the philosophy dial is the one lever the
owner gets today), trades, contracts in depth, injuries in depth, the ownership ladder (an owner picks only
among the 30 MLB clubs today), play-by-play, staff, awards and history. The `makePlayer` id-collision risk
this pass originally disclosed and left open is **now fixed** — measured, found real, and replaced with
ids that are unique by construction (`DECISIONS.md` D97, v2.15.1). The items D87 itself
listed as "not yet built" that WERE closed since — a UI caller for `startNewSeason` (D88), real roster
turnover (D89), a posted scouting cost (D90), real parent-affiliate data (D91), and the amateur draft
itself (D93) — are resolved, not carried forward. See ROADMAP.md's "Next, in order."

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
| MLB net income against the tuning target ("nets roughly zero over a full calendar year") | averages -23.8% of revenue across 5 seeds (worst seed -33.2%) as of this pass's own added scouting cost (was -21.1%/-32.1% before it — a real, disclosed, quantified gap, not silently hidden; see `DECISIONS.md` D86 on why, D90 on the re-measurement) | same file |
| the four flat-cost independent-league economies against the sourced "-$385 to +$963 at .500" target (`CHANGELOG.md` Build 0.7, `DECISIONS.md` D49) | after an empirical re-solve (`INDY_OPEX_RECAL`, per-league `opScale`), every league lands within ~14 points of revenue on its worst held-out seed and within 10 points on its 3-seed average — an order of magnitude closer than the ~80% margin the first reconstruction produced | same file, see `DECISIONS.md` D86 |
| the MLB local-media receivable (account 1100) never grows unbounded | stays at or below one month's accrual throughout a full simulated year | same file |
| Office's "This month" panel and all five Books panes show real, non-zero, populated data | screenshotted at 1440px and 360px, both shells, both themes: real gate-revenue ledger entries with real attendance figures, a real income statement, a balanced balance sheet ($648.04M assets = $340.00M liabilities + $308.04M equity in one run), `auditBooks()` reading PASSES (48 entries / 144 lines) | temporary Playwright spec, run and screenshots looked at, then deleted per D16 |
| aging tool curves reproduce RESEARCH.md §18's sourced peak-age ORDERING | speed peaks before power, which peaks at or before contact/plate discipline, in a 2,000-player simulated population aged 20→40 | `packages/sim-kit/test/development.test.ts` |
| pitch movement is far more stable across a career than raw stuff/velocity | movement's full-career swing is smaller than stuff's, same simulated population | same file |
| starters' and relievers' control diverge in the sourced opposite directions | from an IDENTICAL starting population (same RNG seed, only role differs): starter control trends up 20→30, reliever control trends down over the same span | same file |
| ageing never produces a grade outside the 20-80 scale | checked at every simulated age, every tool | same file |
| `startNewSeason` produces a real, complete, playable next season | every club's record resets to zero, the regenerated schedule gives the owned club its exact published game count (162 for MLB), `advanceDay` plays real games again immediately after rollover, three consecutive rollovers all succeed | `packages/sim-kit/test/rollover.test.ts` |
| rollover leaves no non-finite value anywhere in state, ages every SURVIVING player by exactly one year, and churns in real new players too | checked directly against each player's pre-rollover age; both survivor and arrival groups confirmed non-empty | `packages/sim-kit/test/rollover.test.ts` |
| FIXED, verified directly: a club's average age STABILIZES across many consecutive rollovers instead of climbing forever | measured across 8 consecutive rollovers — the year-over-year age delta shrinks rather than staying constant, and age stays under 32 throughout — closing D87's own disclosed gap | same file, see `DECISIONS.md` D89 |
| the Frontier League's median age and aged-28%+ share land close to Build 0.9's own sourced target across six consecutive rollovers | median age exactly 26 every year (target 26); aged-28+ averages high teens (target 14.6%) | `packages/sim-kit/test/churn.test.ts` |
| roster continuity runs somewhat above Build 0.9's sourced 24-41% band | averages ~44% across six rollovers — diagnosed as a comp-row age-matching bottleneck, not an under-tuned exit hazard (doubling the hazard's relative slope barely moved it) — disclosed, not fudged away | same file, see `DECISIONS.md` D89 |
| DISCLOSED, structurally explained, not an unexplained miss: aged-30+ lands at exactly 8.0% (2/25), not the sourced 2.4% | the Frontier comp table's own Veteran row is a REQUIRED count `rosterPlan` (already-tested, reused unchanged) fills every year regardless of churn — matches the "rulebook allows 8%" ceiling Build 0.9's own entry names | same file |
| a rollover keeps the world's total population size constant and every churned roster legal by construction | checked directly, including that the owned club still gets `OWNED_N` (40) not the plain `ROSTER_N` (32) after churn | same file |
| the action bar detects an exhausted schedule and calling its new action produces a real, playable new season through the ACTUAL React app | fast-forwards a real state to `seasonOver`, clicks the real button, confirms the bar reverts to "Advance to" with a fresh 0-0 record | `apps/web/test/app.test.tsx` |
| the new, longer "START THE [year] SEASON" button renders clean at 360px | zero horizontal overflow, zero console errors — checked specifically because the label is longer than the ordinary advance button ever gets | temporary Playwright spec, screenshotted and looked at, then deleted per D16 |
| rollover carries cash and ledger history forward untouched, only records/ages/schedule reset | watched directly in the browser: $232.08M cash unchanged across the rollover click, every club 0-0, last-10 "No games played yet", a real regenerated schedule (real opponent, real date) | same manual verification |
| `scoutBoostFor` is zero at zero spend/non-positive baseline, rises monotonically, and saturates at exactly 0.12 by 2x baseline | checked directly across a spend sweep | `packages/sim-kit/test/scouting.test.ts` |
| `refineScout`'s new boost term never breaches the existing [0.15, 0.93] reliability ceiling, even at max boost and a huge sample, and a near-zero-sample rookie stays clearly uncertain even at max boost | checked directly at both extremes | same file |
| `refineScout` was DEAD all season before this pass — only ever called once, at roster construction, before any `p.st` existed | confirmed by grep of every call site before writing any code, not assumed | `DECISIONS.md` D90 |
| a real season of accumulated plate appearances now measurably raises the owned roster's reliability, through the ACTUAL `advanceDay` path | checked directly against each player's pre-season `p.rel`, not asserted | `packages/sim-kit/test/scouting.test.ts` |
| scouting spend posts a real monthly cost to account 5300 and leaves every OTHER club's reliability exactly frozen | checked directly through 60 real simulated days | same file |
| a scouted state's AVERAGE roster reliability is measurably higher than an otherwise-identical unscouted one — not asserted per-player, a real discovered reason why (see D90) | checked directly, same seed, 90 real simulated days each | same file |
| adding a real scouting cost keeps every economics sourced-target margin inside its already-established tolerance | MLB avg -21.1%→-23.8% (bound ±30%), five independent leagues' averages +5.3/+6.3/+2.3/0.0/+4.1% (bound ±12%) — all comfortably inside | temporary diagnostic run, `economics.test.ts`'s own comments updated to the new numbers, see `DECISIONS.md` D90 |
| "Scouting" appears as a real line in Books' income statement automatically, with zero new UI code | screenshotted after a real month crossing: "Scouting $75K" printed plainly alongside every other real expense line | temporary Playwright spec, screenshot looked at, then deleted per D16 |
| 119 of 120 affiliated MiLB clubs resolve to a real MLB parent generated in the SAME world — no dangling references | checked directly against every club's own id, not sampled | `packages/sim-kit/test/world.test.ts` |
| the one disclosed exception ("Hill City") is exactly one club, not a silent gap elsewhere | checked directly, city and level both asserted | same file |
| every one of the 30 MLB clubs owns EXACTLY one AAA, one AA, and one High-A affiliate; 29 of 30 own exactly one Single-A affiliate | checked directly for every org, not sampled | same file |
| a real, hand-transcription defect (the Chicago Cubs' affiliate silently dropped at all four levels) was caught by the new assertions, not by inspection | diagnosed to the exact four missing rows and fixed before this pass closed | `DECISIONS.md` D91 |
| the draft produces exact pick/round counts, no duplicate players, and every pick belongs to a real MLB club with exactly 20 picks | 600 picks total (20 rounds × 30 clubs), checked directly | `packages/sim-kit/test/draft.test.ts` |
| the best 12 clubs pick 19th through 30th in EXACT reverse-standings order | checked directly against the sorted input standings | same file |
| the empirical top-6 lottery odds for the three worst records land near the sourced 16.5% target, and a club outside the 18-team lottery pool never draws pick #1 | 4,000 trials for the odds measurement, 200 trials for the pool-boundary check | same file |
| BPA and UPSIDE philosophies provably diverge on the same board, and BPA's own definition (max remaining scouted OVR) holds pick-by-pick against the live remaining pool | checked directly | same file |
| a real rollover runs a real draft: `state.lastDraft` is null before any rollover and a complete 600-pick record after one; drafted players never land on the MLB roster and some do land on real affiliates | checked directly against every drafted player's landed club | `packages/sim-kit/test/rollover.test.ts` |
| a drafted player's landed club's `parent` exactly matches the pick record's own drafting club id | checked directly, not sampled | same file |
| setting `draftPhilosophy` to `"UPSIDE"` before rollover works, and the world's total population size stays exactly constant across a rollover that includes a real draft | checked directly | same file |
| a genuine, pre-existing `makePlayer` id-collision risk exists at this project's current scale | a temporary diagnostic measured one sampled year absorbing "101.5%" of its draftees onto real roster slots — only possible if two distinct `Player` objects shared an `id` | disclosed in `DECISIONS.md` D93, diagnostic deleted, not a fix inside this pass |
| that five values in the signed-off design system fail this project's own D18 contrast rule | worst case across 4 surfaces x 360 hues x 2 themes: `--text-dim2` 3.28, HSL fallback accent 2.54 on blue, `--pos` 1.56 on white; all re-solved | `DECISIONS.md` D104, `design/DESIGN-SYSTEM.md` §7 |
| that the app was ALREADY shipping a token at 2.65:1 while its own header claimed D18 compliance | the compliance list simply never included `--c-dim2` | fixed in D104 — now 4.83 dark / 4.76 light |
| that a naive contrast test reports the accent at 1.24:1 when it is actually 6.84 | Chromium returns `getComputedStyle().color` as `oklch(0.75 0.13 174)`, not `rgb()`; parsing the first three numbers reads them as RGB bytes. The shipped test paints to a 1x1 canvas and samples the pixel instead | `apps/web/e2e/visual.spec.ts` |
| that a 40-man roster had almost no salary dispersion — found by LOOKING at the new Roster page, not by any test | every 65-grade player on exactly $13.00M, every 60 on $8.95M; ~4 distinct salaries across 40 players. After service-time pricing: 16 distinct, $0.80M-$13.00M | `DECISIONS.md` D103 |
| that D102's "payroll equals what you authorised" claim was wrong once service time landed | contracts now total 62-70% of the authorisation, and the cost per marginal win IMPROVED from $7.8M to $5.25M against a ~$6.5M anchor | corrected in D103; the test now bounds the discount rather than asserting equality |
| whether payroll created financial pressure (it did NOT — D100's negative result still holds) | 5 seasons at 0.5x/1.0x/1.5x/2.0x payroll: cash still grows at every level, $222M -> $257M even at 2.0x while winning 97-115 games. Winning pays for itself | the cash call and insolvency remain unbuildable; the next lever is a competitive-balance tax or owner distributions |
| the engine's own talent->wins slope, and its talent->salary slope, measured SEPARATELY | ~5.5 wins per talent point (3 seeds/point); ~8.3 talent points per payroll doubling at the existing salary curve. Multiplied they give 45 wins per doubling — the naive self-consistent model is badly wrong | `DECISIONS.md` D102, `RESEARCH.md` §26 |
| what payroll actually buys after the budget has replaced the roster | 4 rollovers + a played season: $88M -> 61.5 W, $175M -> 75.5 W, $350M -> ~95 W. $7.8M per marginal win against a ~$6.5M sourced anchor | `packages/sim-kit/test/payroll.test.ts` |
| that an unanswered ask was overwriting the owner's own setting | a test set payrollBudget directly, rolled over, and watched it snap back to the league norm | fixed in D102 — silence changes nothing, at every ask |
| the real revenue curve against ticket price, measured across whole simulated seasons (not computed from the formula) | net income peaks at 0.9x face ($52.8M); GATE revenue peaks at 1.4x ($94.4M) where net has fallen to $40.0M; 2.0x turns a $52M profit into a -$11.6M loss | `DECISIONS.md` D101, `RESEARCH.md` §25 |
| that constant-elasticity demand CANNOT be used for pricing here | its only stationary point is a minimum, so revenue rises without bound — indexes 119.6 at 5x face. Caught by checking the arithmetic before building, after it had already been written into RESEARCH.md | rejected in D101; linear demand used instead |
| whether a cash-flow decision is possible in this economy at all (it is NOT — this killed a designed feature) | month-by-month cash across 3 seasons, four club tiers: MLB $170.0M → $334.9M (trough $162.7M), AAA $0.82M → $10.67M, Single-A $0.82M → $2.63M, INDY $1.14M → $4.57M. Every club accumulates monotonically | `DECISIONS.md` D100 — the cash call was designed, measured, and not built |
| how far the rollover moves the clock (it breaks any day-based desk TTL) | 186 days in one call, seed 5 / MLB_NYY: serial 20703 → 20889 | D100 — which is why desk asks carry no TTL |
| whether an owner's draft answer perturbs the world's RNG stream (it DOES) | 310,466 draws under BPA, 309,971 under NEED, 309,540 under UPSIDE, same seed and season | D100 — two proposed designs defended an invariant the engine never had |
| that the delegation tests can't pass vacuously | a control test shows `simFingerprint` detects ONE extra RNG draw before any equivalence is asserted with it, and that it reports no difference where there is none | `packages/sim-kit/test/delegation.test.ts` |
| the save's real size and composition, and what a day-advance actually costs | 2.39 MB, of which 89.5% is 5,750 players and 8.6% is 13,866 schedule rows; `structuredClone` ~48 ms, one IndexedDB put ~23 ms — measured in a real browser, not jsdom | `DECISIONS.md` D99 |
| whether writing per-day was blocking the click (it was NOT — my first framing was wrong) | synchronous work per advance 8.2 ms before vs 7.7 ms after, long-task totals 249 ms vs 232 ms — both noise, because the store already `set()`s before awaiting the write | corrected in D99 rather than reported as a win |
| what write-behind actually bought | instrumented `IDBObjectStore.put` over 30 days of play: 30 writes / 73.8 MB became 1 write / 2.6 MB — 30x fewer writes, ~467 MB/season of churn down to ~16 MB | same |
| the two ways write-behind can destroy a save, and that the guards work | a queued write landing after a new game or after a delete; both guards removed temporarily and both tests went red | `apps/web/test/save.test.ts` |
| a save the app can't read produced a crash, not a refusal — and then invited the player to overwrite it | planted a "newer build" save and ran it against the pre-fix bundle in a real browser: `Unexpected Application Error! l is not iterable`, ten frames into a minified router callback, then a fallthrough to the club picker whose next click calls `startNewGame` | fixed in `DECISIONS.md` D98; guards are `packages/sim-kit/test/migrate.test.ts`, `apps/web/test/save.test.ts`, and 10 new Playwright checks |
| the migration chain, its failure modes, and the backup-before-overwrite sequence — none of which the empty real registry can exercise | 35 engine tests driving synthetic chains through the real code via two documented test-only seams (`loadStateWith`, `loadGame(read)`) | same files |
| the save-problem screen said the same thing twice, one line under the other | read the screenshot; the engine's `detail` and the screen's guidance line both explained "made by a newer build / update the game" | fixed — the engine states the problem, the UI states the remedy |
| the collision rate itself, directly — confirming the risk was real and quantifying it | 10,000 players collide 0 times, 50,000 collide once, 100,000 collide four times, matching the birthday-paradox prediction (~1.25, ~5.00); a save mints ~1,600/year, so ~160,000 by season 100 | fixed in `DECISIONS.md` D97; guard is `packages/sim-kit/test/identity.test.ts` |
| the guard actually fails when it should | removing the id from one creation site makes `identity.test.ts` fail immediately and by name — verified, then reverted | same file |
| supplying an explicit id does not shift the seeded RNG stream (save-reproducibility, D85) | the two streams checked in lockstep after a supplied-id and a fallback-id generation | same file |
| the Draft page renders clean (empty state) across both shells/themes/widths | 8/8 new Playwright checks, 0 console errors, 0 horizontal overflow | `apps/web/e2e/visual.spec.ts` |
| the Draft page's populated state (post-rollover, real picks) renders clean, and two real truncation/grammar bugs were found and fixed by looking at screenshots, not by an assertion | verified manually at 360px/1440px, both shells/themes | temporary Playwright spec, screenshots looked at, then deleted per D16 |

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
- **MLB net income runs about -24% of revenue over a full simulated calendar year, not "roughly zero."**
  A real, measured, disclosed gap (`DECISIONS.md` D86, re-measured D90 after this pass's own added
  scouting cost moved it from -21% to -24%), not silently loosened test tolerances. Unlike the
  independent leagues (which WERE re-solved against a sourced target this pass found in the project's own
  historical record and now land within ~10 points on average), there is no equally precise sourced
  dollar target for MLB — only the qualitative "nets roughly zero" — and the gap traces mostly to
  `contractFor`'s MLB salary curve (a different, already-verified system, v2.4.0) pricing a random 40-man
  roster higher than `ECON.MLB`'s reconstructed revenue figures cover. Re-tuning either system further is
  real work for whoever picks it up next armed with either the primary source or a sourced MLB target,
  not a fix to slip inside another pass.
- **A monthly scouting cost now posts for real (`DECISIONS.md` D90) — what's still missing is a scouting
  DEPARTMENT and an owner-facing dial.** `Economy.scouting`/`state.scoutingBudget` are real, disclosed T3
  figures (chart-of-accounts entry 5300, previously unposted, closed this pass) that feed a bounded
  reliability boost into `refineScout` — but there is no scouting-director/area-scout staff system
  (`FRONT-OFFICE-DESIGN-PROPOSAL.md`'s own scope, still unsigned) and no UI control anywhere in the app
  to move the budget off its level-default value, the same disclosed shape `payrollBudget`/`ticketPrice`
  already carry. The cost posts and the reliability effect is real regardless — verifiable in Books today,
  just not yet adjustable by the owner.
- **The ownership ladder doesn't exist — a new game picks only among the 30 MLB clubs.** The checkpoint's
  own stated target ("all 30 MLB clubs"), not a smaller slice of it, but not the indy-to-MLB climb
  either. `proposals/FRONT-OFFICE-DESIGN-PROPOSAL.md`'s open §1 question is still unresolved and still
  blocks designing this properly.
- **Real minor-league parent affiliation now exists (`DECISIONS.md` D91) — but one city of 120 is
  genuinely unresolved, and no Organization page exists yet to show any of it.** "Hill City"
  (`world-data.ts`'s Single-A Carolina League list) couldn't be matched against any real 2025/2026 league
  membership source — likely a pre-existing data question in that city list, predating this pass, flagged
  rather than fixed since re-auditing §2.1's own inventory is a different job than adding parent data. And
  `world.ts`'s `Club.parent` field is now consumed by the draft (D93) but still has no dedicated
  Organization page to browse it directly — the data is real and tested, the UI to read it standalone is a
  separate, unbuilt pass.
- **The amateur draft (`DECISIONS.md` D93) is real but deliberately narrow — Competitive Balance rounds,
  the bonus pool, and revenue-sharing lottery rules are all still unbuilt, and no pick is interactive.**
  RESEARCH.md §1.5 has real, sourced numbers for the CB-round and bonus-pool/slot-value/overage-tax
  systems specifically; neither is built here — they're a genuinely separate constraint on the draft (how
  teams spend, not who picks when) and belong to a pass of their own. Every pick is automatic; the owner's
  only lever is `draftPhilosophy` (best-available/fill-needs/upside), per Jordan's own explicit direction
  ("automatic via a staff personality") — an interactive pick-by-pick flow was never asked for and would
  need real pause/resume state-machine capability nothing in this engine has yet. The 18-team lottery pool
  itself is an approximation (worst 18 of 30 by winning percentage — no real playoff-qualification system
  exists yet to define "non-playoff" properly), and only the top-6 lottery's headline 16.5% figure is
  sourced; the rest of an 18-team pool's odds curve is a disclosed T3 linear-decay approximation.
- **CLOSED (v2.15.1, `DECISIONS.md` D97): the `makePlayer` id-collision risk this pass disclosed is
  fixed.** It was measured before being fixed — 50,000 players collide once, 100,000 collide four times —
  and the fix is structural, not statistical: every real creation site now passes an id unique by
  construction (`pr:<club>:<slot>`, `pd:<year>:<pick>`, `pc:<year>:<club>:<n>`), so a future creation site
  that forgets is rejected by `test/identity.test.ts`'s prefix assertion in the same commit that adds it.
  Note for anyone touching `makePlayer`: the random fallback is drawn **unconditionally**, before the
  return, and must stay that way — short-circuiting it with `??` would consume one fewer value from the
  seeded stream and make the same seed generate a different world.
- **Roster churn is real but anonymous — free agency, contract expiration, and an amateur intake as their
  OWN systems are still not built.** `churn.ts` (`DECISIONS.md` D89) closes D87's own disclosed
  age-climbs-forever gap — `rollover.test.ts` now proves average age stabilizes rather than climbing — by
  retiring an age-weighted share of each roster and filling every vacancy with a fresh, legally-composed
  signee. It does NOT model any individual player's free agency (a named player choosing a club), AI GM
  valuation/negotiation, or a market UI to watch it happen — departures and arrivals are anonymous,
  population-level turnover, not the original build's own named-player winter cycle. Roster continuity
  also runs somewhat above the sourced 24-41% band (~44% average, six-rollover test) — diagnosed as a
  comp-row age-matching bottleneck, not an under-tuned exit hazard, and left disclosed rather than chased
  further (see the measured-table rows above and `DECISIONS.md` D89 for the full reasoning, including why
  "aged 30+" is structurally locked at the comp table's own 8.0% ceiling).
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

## The next passes, in order

See `ROADMAP.md`'s "Next, in order" for the full reasoning. Short version:

**Done: the realism-research merge** (§18–24, `DECISIONS.md` D83), **the season-play driver** (D84),
**state/save/Office/Books** (D85), **the money loop** (D86), **player development and ageing plus a
minimal season rollover** (D87), **a real UI caller for that rollover** (D88), **real roster churn**
(D89), **a real scouting budget** (D90), **real minor-league parent affiliation** (D91), and **the
amateur draft** (D93) — a real game you can start, play, save, reload, watch post real gate revenue and
payroll and a real scouting cost, age a whole season's worth of players realistically, click a real button
to start a real second year, watch that new season's rosters actually turn over (including a real 20-round
draft, worst-record-first with a sourced lottery, whose picks land on the drafting org's own affiliates),
set a draft philosophy for the owned club, and watch the owned roster's own scouting reliability actually
improve over a season instead of sitting frozen since day one. UI.md §13.3's own checkpoint ("Office +
Books") is met AND populated, and Draft is now a third real, browsable page.

1. **The ownership ladder** — club valuation and purchase, the standing top item now that scouting (D90),
   parent affiliation (D91), and the draft (D93) are all real. `proposals/FRONT-OFFICE-DESIGN-PROPOSAL.md`'s
   open §1 question (does an affiliate purchase carry real baseball authority, or none?) still blocks
   designing it properly, and a new game's club choice still needs to grow past "one of the 30 MLB clubs"
   into the real indy → MiLB → MLB climb. The ladder's valuation model should use RESEARCH.md §14.3's
   team-specific ratio (+36%, one verified transaction), not §9.6's retracted framing (D77). This is also
   where an Organization page to finally show D91's own parent data, and a scouting-director/area-scout
   staff system plus an owner-facing control for the scouting budget (D90's own disclosed gaps), would
   naturally live.
2. **Free agency as its own named-player system** — `churn.ts` (D89) already replaces departing players
   with fresh, anonymous, legally-composed signees every rollover; a real free-agent pool, AI GM
   valuation/negotiation, and a market UI to watch it happen are the parts still deliberately deferred, per
   D89's own disclosed scope boundary.
3. **The draft's own deferred sub-systems, whenever there's real appetite for them** — Competitive Balance
   Rounds A/B, the bonus-pool/slot-value/overage-tax financial system, and revenue-sharing lottery
   restrictions all have real, sourced numbers waiting in RESEARCH.md §1.5 (D93's own disclosed scope
   boundary); interactive pick-by-pick drafting would need real pause/resume state-machine capability this
   engine doesn't have yet.
4. ~~**The `makePlayer` id-collision fix**~~ — **done in v2.15.1** (`DECISIONS.md` D97). Kept here only so
   the entry doesn't read as silently dropped: it was measured, confirmed real, and fixed structurally
   rather than by widening the keyspace.

**Playtest still beats roadmap.** Ask Jordan what stood out from playing the old build before assuming
this ordering is right.
