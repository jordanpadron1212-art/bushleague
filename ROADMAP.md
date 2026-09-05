# ROADMAP — Bush League

What's next and what's genuinely open. Updated against reality — not against the plan — at every session close.

> **CI was red for this project's entire history until just now (D92, v2.13.0) — every version claimed
> "live" before this was never actually deployed.** See HANDOFF.md's own alert on this; don't repeat the
> mistake of trusting local `pnpm test`/`pnpm build` green as proof of a real deploy without also checking
> the actual GitHub Actions run.
>
> **Status update, 2026-09-04 (DECISIONS.md D78-D92):** the engineering substrate was rebuilt from
> scratch (React/TypeScript/Vite, hosted on GitHub Pages — see CHANGELOG.md v2.0.0). **Everything below
> "Done" describes the retired `bush-league-v0.10.html` build and is kept as a historical record of
> what was proven, not a description of what runs today.** Ported so far (`packages/sim-kit`): the
> ledger, chart of accounts, RNG, formatters, player generation and grading (v2.1.0), club/world
> generation and the full schedule (v2.2.0), plate-appearance resolution (v2.3.0), roster construction/
> depth charts/`simGame`'s full inning loop (v2.4.0), the realism-research merge (v2.4.1), and the
> season-play driver (v2.5.0) — a full real season plays end to end, verified against RESEARCH.md §7.1
> at full scale. **v2.6.0: state, save/load, and two real screens** — `newGame()`/`advanceDay()`
> assemble and drive a real `GameState`, IndexedDB persists it, and Office + Books are lit for real —
> UI.md §13.3's own signed-off checkpoint. **As of v2.7.0: the money loop.** Opening capital seeds the
> ledger, gate revenue posts on every home date against real attendance, operating costs and payroll post
> monthly, and Office + Books show real, populated, audited financial data — no longer real-but-empty.
> `bush-league-v0.10.html`, the primary source every pass through v2.6.0 read code out of, was NOT
> available in this pass's container (never committed to git, only ever a session attachment) — this
> pass's `gateDay`/`postMonth`/`seedOpeningBooks`/`rosterPayroll` are reconstructed from working notes,
> cross-checked hard against this project's own committed historical record (an empirical re-solve of the
> independent-league economics against `CHANGELOG.md`'s own Build 0.7 / D49's sourced "-$385 to +$963 at
> .500" target), not a re-verified line-for-line port — see HANDOFF.md's "Waiting for you" item 4.
> **As of v2.8.0: player development and ageing, plus a minimal season rollover.** Every player's hidden
> true grades now move with age — eleven tools, each sourced to RESEARCH.md §18, two of them (pitcher
> control and stamina) genuinely role-aware because the source gives starters and relievers opposite-shape
> curves. `rollover.ts` gives a save the minimal mechanism to reach a second year — new logic, not a port
> (the original never built this system as its own piece either; its own equivalent is bundled into the
> full winter/market system below, deliberately NOT reproduced here). Disclosed, not hidden: with no
> roster churn yet, the population ages uniformly across consecutive rollovers — the same "closed
> population has exactly one destiny" finding the ORIGINAL build's own v0.9 pass made (next paragraph)
> before building real churn to fix it, verified directly (not assumed) in this pass's own test suite.
> **As of v2.9.0: that rollover has a real caller.** The action bar detects an exhausted schedule directly
> from state and offers to start the next year — `rollover.ts`'s primitive (v2.8.0) had no way to reach
> it from the app until now, closing D87's own "not yet built" list item, verified with a real click
> through a real browser at 360px (the new button's label is longer than the ordinary one ever gets).
> **As of v2.10.0: real roster churn.** `churn.ts`, wired into `startNewSeason` itself, retires an
> age-weighted share of every club's roster each rollover and fills every vacancy with a fresh, legally
> composed signee — re-solved against Build 0.9's own sourced Frontier League target (median age, aged-28+
> share, roster continuity) the same empirical method D86 used for the independent-league economics. A
> club's average age now measurably stabilizes across many consecutive rollovers instead of climbing
> forever, closing half of D87's own disclosed gap — verified directly in `churn.test.ts`/
> `rollover.test.ts`, not assumed. Deliberately NOT built this pass: free agency as its OWN system (a
> named player choosing a club, AI GM valuation/negotiation, a market UI) — turnover is real but
> anonymous, same scope boundary D89 states explicitly.
> **As of v2.11.0: a real scouting budget.** A monthly cost finally posts to the long-empty chart-of-
> accounts entry 5300, and — a genuinely new finding this pass surfaced, not planned in advance —
> `refineScout` (D24's sample-size-driven reliability mechanism) turned out to have been called only ONCE
> per player, at roster construction, ever since it was first ported: `advance.ts` now recomputes it for
> the owned roster on every real month crossing, so a season of actual plate appearances and innings
> finally reaches the reliability number. `scoutBoostFor` adds a bounded term (0 to 0.12, saturating at 2x
> a level's baseline spend) on top of that, before the same [0.15, 0.93] ceiling already in place —
> re-measured against the existing sourced-target economics tolerances (still comfortably inside) rather
> than assumed safe. Deliberately NOT built this pass, same discipline as v2.10.0's own disclosed scope
> boundary: the amateur draft, a scouting-director/area-scout staff system, and any owner-facing control
> to move the budget off its default — `FRONT-OFFICE-DESIGN-PROPOSAL.md` stays unsigned and still gates
> the ladder/staff work specifically.
> **As of v2.12.0: real minor-league parent affiliation.** Before starting the amateur draft, a real
> blocker surfaced: nobody had recorded which MLB org owns which of the 120 affiliated MiLB clubs
> `buildWorld` generates — a real pick needs somewhere real to go. Researched and sourced instead of
> guessed past (RESEARCH.md §2.6, cross-checked two independent ways for all 120 pairings): a new `parent`
> field on every MiLB `Club`, 119 of 120 resolved to a real MLB club in the same world, one ("Hill City")
> genuinely unmatched against any real source and left disclosed rather than guessed. Pays off twice — the
> correct foundation for the draft, and separately closes this file's own long-standing "the Organization
> page stays dark until [parent affiliation] is researched" note below. A real hand-transcription defect
> (the Cubs' affiliate dropped at all four levels) was caught by a new test assertion and fixed before this
> pass closed — the discipline working as intended, not a mistake glossed over. What's still real logic
> sitting in the old build and not yet ported: the ownership ladder, the market/free-agency-as-a-system,
> retirement, the amateur draft itself (now unblocked), and everything below.
>
> **v2.13.0 fixed a project-wide blind spot, not a game system: every CI run since the rewrite began had
> actually been failing on GitHub's own servers** (a Node 24 vs. Node 22 jsdom/undici mismatch), meaning no
> version of this game had ever actually gone live at the GitHub Pages URL despite every pass's own local
> "green." Fixed and verified against a real Node 24 binary — see DECISIONS.md D92.
>
> **As of v2.14.0: the amateur draft is real.** `draft.ts` generates a fresh 600-prospect talent pool
> (scored on scouted grades only, never hidden true ones), a real draft order with the sourced top-6
> lottery (RESEARCH.md §1.5), and 20 rounds — wired into `startNewSeason` before churn runs, so drafted
> players land on their own drafting org's MiLB affiliates via `churn.ts`'s existing fill-vacancy loop
> (never the MLB roster directly, never displacing a survivor). Every club drafts automatically
> (best-player-available); the owner's own club follows a settable philosophy via a real, newly-lit Draft
> page. Deliberately out of scope, disclosed rather than absorbed: Competitive Balance rounds, the
> bonus-pool/slot-value financial system, revenue-sharing lottery restrictions, and interactive picking —
> RESEARCH.md §1.5 has real sourced numbers for the first two, waiting for a pass of their own. A genuine,
> pre-existing `player.ts` id-collision risk (~1e9-value id space) surfaced incidentally via a draft-
> absorption diagnostic and was disclosed rather than fixed in DECISIONS.md D93 — **since measured,
> confirmed real, and fixed in v2.15.1 (D97).**

**Status (pre-rewrite): v0.10 shipped 2026-08-28.** `bush-league-v0.10.html`. Seventeen harnesses, 380+ passing assertions, 2 known reds — both pre-existing and both in the game engine, not the world (`simcal.js`: BB/9 10.4% high; `sweep3.js`: batting order captures 44% of achievable signal).

**THE ARC — RETIRED 2026-09-05.** This file said for a long time that "the ownership ladder — the
climb from the floor to the Show — is the game." Jordan corrected that directly: **it is an endless
sandbox.** Real clubs at all levels and leagues, the player chooses **which leagues load into a
save**, **custom leagues** arrive later as their own layer, and the role is **always owner, in every
save**. The struck-through arc is kept here rather than deleted, same convention as the rest of this
file, so nobody re-derives it from an old doc. ~~the ownership ladder — the climb from the floor to
the Show is the game; the five independent leagues are the bottom rungs~~

**v0.8 made the market. v0.9 made the world survive it.** v0.8 gave every club free agency, sign and release, and turned five published rulebooks into predicates. v0.9 discovered that a closed population under an age rule has exactly one destiny — run v0.8 out ten years and the Frontier League has a **median age of 36 with 100% of the league aged 30 or over** — and built the churn that real independent baseball runs on: weekly contract purchases by affiliated organisations, contracts expiring every January, an age-curve exit, a demand-sized intake, an exclusive re-sign window, and a four-month open market.

**The simulated Frontier League now matches the real one** on three of four measures after ten years: 14.6% aged 28+ (real 15%), 2.4% aged 30+ (real 2%), roster continuity 32.6% (real 24–41%), median age 26 (real 24–25 — one year old, and stated as a gap rather than tuned away).

**The price of a win, measured** (`qa/econ.js`, annual net per 100 points of win%): Atlantic **$131,889** · American Association **$147,688** · Pioneer **$106,272** · Frontier **$44,920** · Pecos **$3,610**.

## Next, in order — as of the 2026-09-04 rewrite (updated after v2.14.0)

**Done: player generation and grading** (v2.1.0, D79), **club/world generation plus the full schedule**
(v2.2.0, D80), **plate-appearance resolution** (v2.3.0, D81), **roster construction, depth charts, and
a full played game** (v2.4.0, D82), **the realism-research merge** (§18–24, v2.4.1, D83), **the
season-play driver** (v2.5.0, D84), **state, save/load, and Office + Books lit for real** (v2.6.0,
D85), **the money loop** (v2.7.0, D86), **player development and ageing, plus a minimal season
rollover** (v2.8.0, D87), **a real UI caller for that rollover** (v2.9.0, D88), **real roster
churn** (v2.10.0, D89), **a real scouting budget** (v2.11.0, D90), **real minor-league parent
affiliation** (v2.12.0, D91), **a CI/deploy fix closing a project-wide blind spot** (v2.13.0, D92), and —
**the amateur draft** (v2.14.0, DECISIONS.md D93). UI.md §13.3's own signed-off checkpoint ("Office +
Books") is met AND populated, and Draft is now a third real, browsable page: a real club picker, a real
Office page, a real five-pane Books page, a real Advance/rollover button, IndexedDB save/load verified
with a real round trip, a rollover whose rosters actually turn over (including a real 20-round draft,
worst-record-first with the sourced top-6 lottery, landing picks on the drafting org's own affiliates), a
settable draft philosophy for the owned club, and a real scouting cost whose reliability effect the owned
roster actually shows over a season. The RNG stream is fully save-reproducible, and CI actually deploys to
GitHub Pages on every push — both genuine improvements over the original, which never closed either gap.

**1. World configuration — which leagues load into a save.** The new top item, and it displaces the
ownership ladder, which was the old arc (see the retired-arc note above). `buildWorld()` currently
generates all 218 clubs unconditionally; a sandbox needs that to be a parameter. It reaches the
schedule, the economy, the draft and the save schema, and it is the foundation custom leagues will
need later — so it is much cheaper now, while `SCHEMA_VERSION` is 1 and there are no real saves to
protect. **Scoped and designed 2026-09-05 — see `proposals/WORLD-CONFIGURATION.md` and DECISIONS.md D95.**
Decided: the world grows by complex/rookie and an amateur/college layer (international pro leagues
offered and not selected); unloaded leagues **exist as data but don't play** — real named clubs with
budgets that buy and sell, no games simulated; the fail state is **optional, set at new-game**; and
league depth is answered by making leagues **authorable data** rather than by sourcing quantity, which
collapses selection, the shipped packs and custom leagues into one mechanism. Still open: what the
owner owns — **resolved 2026-09-05 (D96)**: you own the whole organization, but you do not operate
it. Staff do, through a per-area delegation dial. See `proposals/OWNER-AND-STAFF.md`, which is now the
interaction model for every screen in the game and should be read before designing any of them.

**1a. The delegation dial** (`proposals/OWNER-AND-STAFF.md` step 1) — settings exist per area, and the
systems that already run automatically (the draft philosophy, churn) start reporting through it. Small,
and it proves or disproves the game's core interaction model before any new simulation is written.

**1b. Apply the signed-off visual direction to the app** (`design/DESIGN-SYSTEM.md` §7). Deliberately
sequenced after 1: the league picker is the most important screen in the game and does not exist yet,
so re-skinning three screens before adding a fourth is backwards.

**2. The ownership ladder** (club valuation and purchase) — demoted, and needs redesigning against the
sandbox framing rather than the retired climb. `proposals/
FRONT-OFFICE-DESIGN-PROPOSAL.md`'s open §1 question (does an affiliate purchase carry real baseball
authority, or none?) still blocks designing it properly. The ladder's valuation model should use
RESEARCH.md §14.3's team-specific ratio (+36%, one verified transaction), not §9.6's retracted "~1.5×
high" framing (DECISIONS.md D77). This is also where a new game's club choice needs to grow past "one of
the 30 MLB clubs" into the real indy → MiLB → MLB climb, and where a scouting-director/area-scout staff
system, an owner-facing control for the scouting budget (v2.11.0's own disclosed gaps), and an
Organization page to finally show v2.12.0's own parent data would naturally live.

**2. Free agency as its own named-player system** — `churn.ts` (v2.10.0, D89) already retires and
replaces a real, age-weighted share of every roster each rollover; what's still missing is a specific
player choosing a specific club, AI GM valuation/negotiation, and a market UI to watch any of it happen.
Turnover is real; the market is not — the same distinction D89 draws explicitly in its own scope
disclosure.

**3. The draft's own deferred sub-systems** — Competitive Balance Rounds A/B, the bonus-pool/slot-value/
overage-tax financial system, and revenue-sharing lottery-eligibility restrictions all have real, sourced
numbers waiting in RESEARCH.md §1.5 (v2.14.0's own disclosed scope boundary); interactive pick-by-pick
drafting would need real pause/resume state-machine capability this engine doesn't have yet. Lower
priority than items 1-2 — the draft as shipped is already a real, complete, playable system; these are
depth, not a gap in what's there.

**4. ~~The `makePlayer` id-collision fix~~ — DONE, v2.15.1 (DECISIONS.md D97).** Kept listed so it doesn't
read as silently dropped. It was measured before being fixed (50,000 players collide once, 100,000 collide
four times, matching the birthday-paradox prediction) and closed structurally rather than by widening the
keyspace: every real creation site now mints an id unique by construction. This mattered more than its
position here suggested — the world-configuration work below roughly doubles annual player intake, and
collisions grow with the square of the population.

**Everything from "Next, in order — re-ordered by what v0.9 measured" onward, below, is the pre-rewrite
plan.** Still directionally right once the game exists again; re-sequence it against passes 1-2 above
rather than following its numbers literally.

## Done (pre-rewrite build — historical record, not current state)

1. **V1 research pass** — ten sections in `RESEARCH.md`. §10 (the winter) records what could NOT be found as findings, so nobody re-searches it blindly.
2. **V1 layout proposal** — done and signed off. `UI.md`, with §13 recording Jordan's calls.
3. **UI chassis (v0.1)** · **Finish pass (v0.2)** · **The Roster (v0.3)** · **The sim pass (v0.4)** · **The front door (v0.5)**.
6. **Five leagues, not one (v0.6)** — each with its own published schedule, attendance, park effects, talent centre, cap and roster rule; the Pecos League as the floor; the scheduler's opponent distribution rebuilt after a harness that had counted games for six builds was asked for the first time *who* a club played.
7. **The books meet the roster (v0.7)** — payroll posts what the roster costs; contracts fit each league's cap; all five economies solved to break even at .500.
8. **The market (v0.8)** — free agency, sign and release, for the owner and all 68 independent clubs. Every published roster rule as a predicate, and the Atlantic League's absence of one encoded as an absence. The no-worse rule that keeps it from deadlocking.
9. **The winter (v0.9)** — the whole annual cycle, plus nine defects including one that made every migrated save unplayable and one that handed the owner every free agent in the world on reload.

## Next, in order — re-ordered by what v0.9 measured

**1. Player development and ageing — THE ONE THAT MAKES SCOUTING MEAN ANYTHING.**
Players age and nothing else happens to them. There is no growth curve, no breakout, no decline beyond the age classification. This is now the biggest hole in the game, and v0.9 is what exposed it: a world with real churn makes the question *"is this 22-year-old going to be better than this 26-year-old?"* the central decision of every winter — and right now the answer is fixed at birth. Hidden development curves are already in the locked design (Law 4); this is the pass that builds them. **Do this before scouting**, because scouting without development is scouting a constant.

**2. Scouting and the amateur draft.** Reliability that sharpens with looks already exists on the player profile; nothing yet *spends* on it. A scouting budget, coverage that decides which men you see clearly, and a draft to point it at. Only worth building once there is something hidden that changes.

**3. The ladder itself** — club valuation, buying and selling. Jordan has said plainly this is the point. RESEARCH 9.6 has the rungs: indy club revenue $1.8–4.1M → Triple-A sale $70–100M → MLB sale $1.0–2.5B. Build on **actual transactions, not Forbes valuations.** *(Corrected 2026-09-04, DECISIONS.md D77: the "valuations run ~1.5× high" framing below was comparing one team's sale to the league-wide average, not to that team's own prior valuation — retracted as a modelling input. The Rays sold for $1.7B against their own $1.25B Forbes number, i.e. +36% above estimate. See RESEARCH.md §14.3.)*

**4. The league surfaces** — Standings, Leaders, Wire, Organization. Pure grid work, and what a season *feels* like between advances. **The wire now has real things to say** — every signing, release and contract purchase in the league flows through it — and nothing displays more than the last forty.

**Closed by v0.8/v0.9, removed from this list:** sign and release (was #1) · the contract-out (was #2) · D44, the league rules binding only at generation.

**Still worth knowing:** every salary cap in the build is stale — nothing newer than 2020 is published for any league, and the Frontier's own figures contradict each other by a factor of two (RESEARCH 9.2). Those caps are the binding constraint on play, which makes them the most load-bearing stale numbers in the project.

Then, roughly:

5. Trades + AI GM personalities and valuation logic
6. Contracts: service time, arbitration, extensions, bonus amortization
7. Injuries in depth (severity curves, rehab, recurrence — the mechanic exists, the model does not)
8. Finance depth: media by market size, revenue sharing, luxury tax
9. Watchable play-by-play (the camera over the pitch-aware math — no rewrite needed)
10. Staff · 11. Awards, records, history · 12. Full roster rules (options, waivers, Rule 5)
13+. **Road to the Show** (multi-pass)

## Engineering debt worth paying soon

- **The engine walks too many batters.** BB/9 runs 10.4% and WHIP 6.4% above the published 2025 line, every other figure within 1–5%. Pre-dates v0.8. `simcal.js` has been red on this for several builds. **Reproduced in the new engine (v2.4.0, DECISIONS.md D82):** BB/9 runs up to +9.6% high (Single-A) with 500 simulated games of real lineup play — same characteristic, not a new port defect, still unfixed.
- **Batting order barely matters** — `sweep3.js` measures lineup quality capturing 44% of the achievable signal at MLB. The owner can set a lineup and it does not do much.
- **Difficulty is dead state.** `G.diff` is written and never read. Either wire it to something measurable or delete the field.
- **All 30 major-league clubs still open financially identical** (v2.7.0's `econFor()` returns the same `ECON.MLB` for any MLB club — only the five independent leagues get per-league differentiation via `opScale`), which blocks the takeover scenarios. This is the finance-DEPTH pass in disguise, not the money-loop pass itself (v2.7.0, D86) — media-by-market-size and revenue sharing (item 8 above) are what would actually differentiate MLB clubs from each other.
- **Save growth.** 5.1MB after a decade, driven by **box scores**, not players — v0.9's purge keeps the player array flat. Roll closed years into summary rows.
- ~~The RNG stream is not in the save.~~ **RESOLVED in the rewrite (v2.6.0, DECISIONS.md D85)** — each day's games now draw from a fresh RNG seeded by `state.seed + that day's serial number`, so a reload reproduces the same future an unbroken session would have played. A genuine improvement over the original, kept here struck through rather than deleted so the old build's own debt list stays a complete record.
- **The series planner leaves ~33 single-game "series" a season** where a real schedule would have 2–4.
- **The wire holds forty items and the winter generates hundreds.** It needs a real surface before it needs a bigger buffer.
## Genuinely open (needs research or Jordan's call — do not assume)

- ~~**Minor-league parent affiliation** — which MLB club owns which of the 120 affiliates. Not researched, therefore not asserted. The Organization page stays dark until it is.~~ **RESOLVED (v2.12.0, DECISIONS.md D91)** — RESEARCH.md §2.6, real `Club.parent` data for 119 of 120 affiliates (one, "Hill City," genuinely unmatched against any real source and disclosed rather than guessed). The Organization page itself still doesn't exist — this closed the DATA gap blocking it, not the page. Kept struck through rather than deleted, same convention this file's own debt list already uses.
- **Park factors** — Baseball America publishes 2025 MiLB factors running 66 to 206. For a sim these are a **bigger lever than level**, and nothing in the build reflects a ballpark yet.
- **Ticket pricing by level and market, and the MLB salary scale** — both still Tier 3, both labelled as design knobs in the game. (Per-level run environment is closed — RESEARCH §7.)
- **Independent-league rate stats** — borrowed from affiliated levels (D23). **The Pioneer League is the worst fit**: a high-altitude offensive extreme modelled on Single-A. Closing this needs a browser session against Pointstreak or ~20–40 fetches per league against Baseball-Reference register team pages.
- **Baseball-Reference box-score column order** — every proxy route is robots-blocked; needs one JS-enabled browser fetch.
- Indy detail: whether partner-league affiliation is modelled; whether the Pecos League (the true bottom rung) is in.
- Complex/rookie ball in or out of world gen. Partly settled: complex clubs are owned by the MLB org, not licensed franchises — there is nothing there for a player-owner to buy. The purchasable ladder is indy → the 120 PDL clubs → MLB.
- **Interrupt defaults.** Measured at 18.8 days delivered per 30-day request. Is that the right pacing, or should the injury stop fire only above a day threshold? Jordan's call after a playtest.
- Difficulty knobs: what "hardcore" changes vs normal.
- Whether the CBA-dependent rules (roster sizes, pitcher limits, the 12-team bracket, the 6-pick lottery, 20-round draft) get a UI for editing. They live in `RESEARCH.md` as data — the 2022–26 CBA expires 2026-12-01 and every one of them can change.

## Decided against (do not re-propose)

Multiplayer · frameworks or multi-file builds · real player names · fully fictional league · historical-era start · a single shell · one big hero figure on the Office screen · inventing an indy run environment · rewinding an old save's calendar on migration (all recorded in `DECISIONS.md`)
