# DECISIONS — Bush League

One dated entry per settled call, with the reasoning and the options **rejected**. Append-only. This is not a changelog — an entry here must still make sense if the code it touched is deleted tomorrow. Search this file before proposing anything that feels like a fresh idea; good ideas recur, and most were already argued.

---

## 2026-08-27 — Founding planning session (pre-code)

**D1 · Name: "Bush League."**
Rejected: Owner's Box, Full Count. Reason: it names the signature arc — the climb from indy ball to the Show — and makes the indy start the identity of the game, not a side mode.

**D2 · Seat: Owner-GM.**
Rejected: GM-only under an AI owner — that would put the money in AI hands and gut the books-are-real pressure that defines Jordan's games. Field-manager game-day control was *deferred, not rejected*: with box-score resolution (D5) there are no in-game decisions to make yet; revisit when the play-by-play pass lands.

**D3 · World: real complete MLB structure + full affiliated minors + independent leagues; players 100% fictional.**
Rejected: a fully fictional league (Jordan wants the real world's shape), and a historical-era seed (not the fantasy). Fictional players keep all content derivable from real distributions and avoid any likeness problem. Consequence: real MLB team identities are personal-use; a public release swaps identities via the generator.

**D4 · Both starts ship in v1** (indy-owner ladder AND big-league takeover).
Jordan chose the biggest-scope option knowingly. It's affordable because world generation covers both anyway — the start scenario is a question of which club you own on day one. Consequence recorded honestly: the ladder-progression *mechanics* (club valuation, buying and selling clubs) still deepen in their own later pass; v1 ships both starting positions, not full ladder depth.

**D5 · Games resolve to box scores in v1.**
Rejected for v1: at-bat play-by-play (Claude's recommendation) and pitch-by-pitch. Reason: fastest path to a fully playable v1 — Jordan's call after the three levels were explained. Constraint attached, now Law 16: the engine math is pitch-aware from day one so play-by-play and pitch layers bolt on later as camera zooms, with no rewrite and no statistical break in saves.

**D6 · Road to the Show is the second headline mode, built only after the franchise game is complete.**
Create a high-school kid, get scouted and drafted, live at-bats pitch by pitch, play out a full career. Sequencing reason: the career mode needs the pitch-level engine and the finished league world; building it first would mean building everything at once.

**D7 · Instructions live in two places, kept in sync.**
The Claude Project's custom instructions (pasted 2026-08-27) carry the standing summary; this folder's doc set is the authority and the working record. Folder: `C:\Users\jorda\Desktop\bush league sim`. Project chats without folder access close with the zip workflow (current file + catch-up note).

**D8 · Shell: the OOTP look** (black/serif, zero-radius, trait bars).
Provenance, honestly recorded: proposed by Claude in the pitch as the natural fit for baseball; included in the feature map Jordan approved for drafting. Cheap to revisit until v1 code exists; after v1 it is settled.

---

## 2026-08-27 — UI / layout session (pass 1)

**D9 · Shell: BOTH looks ship, behind one switch.**
Jordan's call, overriding the recommendation to confirm OOTP alone. Two complete token sets — `ootp` (near-black, serif for prose, tabular sans for every number, zero radius, trait bars) and `desk` (trading-terminal: all-sans, uppercase micro-labels, status ticker, flash-on-change) — over one shell, one grid, one set of view functions. His stated direction, verbatim: *"very high tech looking with lots of spreadsheet tables and data."* That phrase governs density decisions from here: when a call is between fewer/cleaner and more/denser, denser wins.
Rejected: OOTP alone (the D8 default), desk alone.
Honest cost, recorded so nobody is surprised later: **every screen gets verified twice, forever** — 2 shells x 2 themes x 2 widths = 8 renders per screen in the QA gate. And the token law gets harder to police, because a hardcoded value now breaks in a place you weren't looking. Mitigation, and it is a hard rule: **`--shell-*` tokens are the ONLY layer either shell may redefine; no feature CSS may reference a shell name, and no component may branch on which shell is active.** If a component needs to know the shell, the token layer is wrong.
Supersedes D8's finality clause, not its content — OOTP remains the default shell on a new game.

**D10 · The UI is built against a real generated world, not placeholder rows.**
Claude's recommendation, Jordan agreed on the reasoning. World-gen produces the real structure — 30 MLB clubs in their real divisions, the 120-club affiliated ladder, the four Partner Leagues — with fictional players carrying real-shaped stat lines, before the screens are designed against it.
Rejected: one hand-built club (not enough rows to stress the grid); placeholder filler (designs against data that doesn't exist).
Reason: a roster grid proves nothing at 8 rows. What breaks a grid is 30 clubs across 6 divisions, a leaderboard with 300 qualified batters, a 40-man with option years and service time, and a name long enough to wrap. Designing against short fake data means every one of those defects ships and is found later, on a phone. The generated world is groundwork V1 needs anyway — it is not throwaway scaffolding.

**D11 · Navigation is a registry, not markup.**
`PAGES = [{id, label, group, view, badge(), value(), pinned}]`. The phone tab bar and the full index render from the same array. Adding a system is one array entry.
Reason, recorded because it will be tempting to skip: a tab strip works to about 5–7 destinations and Bush League's finished shape has roughly 20. If adding a system ever requires touching the navigation component, the architecture has already failed. Decided on the day we had six tabs, deliberately, because that is the only day it is cheap.

**D12 · Research is collected before the layout, not after.**
`RESEARCH.md` filled 2026-08-27 with the world structure, the exact column sets of every real document our grids clone (MLB.com standings, Baseball-Reference team/player batting and pitching, FanGraphs Dashboard, MLB.com roster, the box score), the display-formatting table, and the 20–80 scale including real bust rates. Thirteen gaps are listed explicitly and left empty.
Reason: the grid engine's column schema is a direct function of what the real documents contain. Designing the columns first and sourcing them later produces a schema shaped like a guess.

**D13 · The Office has no hero figure. Hierarchy comes from position, weight and the accent rule.**
Jordan's call, reversing Claude's recommendation. His words: *"im not real big on the idea of having one big thing on the homescreen."* He is right, and the reason generalises: the doctrine's "one hero figure per screen" law exists to create hierarchy, not to mandate that hierarchy be created *by scale*. On a game whose stated thesis is *"lots of spreadsheet tables and data,"* a 28px figure floating in 96px of whitespace is the most off-brand element we could ship.
Rejected: cash on hand, record + games back, delta-since-last-advance, and the original 96px decisions hero.
**The rule this becomes, and it now governs every screen:** exactly one element per screen carries the accent rule; type-size jumps stay within two adjacent steps of the scale. The Books statements are the single deliberate exception — there a figure genuinely is the answer to the screen's question, so `--fs-hero` is used there and nowhere else.

**D14 · Three density tiers ship, selectable in Settings.**
Dense 44px (two lines, context moves to the detail view) · compact 62px (default) · standard 70px. They scale `--sp-*` and `--row-h` **only** — never the type scale, because scaling type across density tiers destroys the hierarchy the type scale exists to create.
Cost recorded: the verification matrix is now 2 shells x 2 themes x 3 densities x 2 widths = 24 renders per screen. The fast gate samples 10; the full 24 is reserved for the total sweep.

**D15 · The provenance sheet is in the chassis, not a later pass.**
Every number is tappable and opens a sheet with its formula, its tier, and its source citation; Tier 3 figures carry a dotted underline in the grid. Built now because retrofitting it later means touching every call site in a file that will be 10,000 lines by then — cheap today, expensive at pass 8.
The second reason matters more: it turns *"we have not researched this number yet"* from a hidden defect into a visible, honest feature. The Books screen currently shows ticket pricing, the MLB salary scale and per-level run environment as **NOT SOURCED — design knob**, in the game, where Jordan will actually see it.

**D16 · The QA gate is code, and it lives in the folder.**
`qa/check.js` (the gate) and `qa/probe.js` (24-seed economy probe) ship alongside the artifact and must both pass before anything is delivered.
Written because of what this pass actually found. Five defects were invisible to code review, and **four of the five worst were found by looking at screenshots, not by the harness** — a club falling off the bottom of its own standings panel, ellipsis silently not truncating, dead space in the status strip, and provenance citing MLB attendance to an indy owner. The harness catches the mechanical failures; the eye catches the useless ones. Both are mandatory, permanently.
One methodological finding worth keeping: **`document.scrollWidth` reporting no horizontal scroll proves nothing** when `body{overflow:hidden}` — content was being clipped invisibly at 360px and every automated check passed. The probe must measure each element's right edge against `documentElement.clientWidth`, skipping anything inside a deliberately scrollable ancestor.

**D17 · Cyan replaces amber as the attention colour.**
`#2FD4D4` dark / `#0B5F61` light. Jordan's call — he asked for the amber gone. Cyan was recommended over violet and magenta because it reads as live-terminal attention rather than caution-tape, and because hue 180 gives the widest separation from the green/red money pair for anyone with a colour-vision deficiency.
Consequence accepted: the info blue moved from hue 213 to **hue 230** (`#6E86FF` / `#2F4FC9`) so cyan and blue stay 50 degrees apart. They were 33 degrees apart before, which is too close to read at 10px.
Rejected: violet (reads as 'rare/legendary' from game-UI convention, which is a different meaning than 'act on this'), hot magenta (too loud for something that appears on every screen), and dropping semantic colour entirely (costs glanceability on a phone, which is the primary surface).

**D18 · Contrast is measured against the darkest surface a colour lands on, not the page background.**
Found the hard way. The light-theme green measured 4.16:1 and blue 4.42:1 against `surface3` — both failing AA — while every audit passed, because the harness only sampled nodes that happened to exist on lighter surfaces. A colour that passes on the background and fails on a toast is a colour that fails.
**The rule:** every semantic value is solved against bg, surface, surface2 AND surface3, and the ratio recorded in the token comment is the worst of the four. Applied to all five semantics in both themes.

**D19 · No text glyphs in the interface. Icons are inline SVG.**
`▦ ⚙ ⌕ ▸ ⚠ ✕ ▴` and friends render as a different shape, weight and baseline on every platform, and as full-colour emoji on some — which silently breaks a monochrome shell. 26 stroke icons at 1.4 weight on `currentColor`, sized in `em` so they scale with their context like text does.
This is also what makes the density readable: a glyph that is 60% of its line box next to one that is 95% reads as sloppiness the eye notices before the mind can name it.

**D20 · OneDrive is the project home; the Desktop copy is superseded.**
Jordan's call 2026-08-27. `C:\Users\jorda\OneDrive\bush league sim` is canonical so the build syncs to his phone without moving files by hand. A `SUPERSEDED.md` marker was written into the Desktop folder naming the new location, because a future session that connects the wrong folder would otherwise build quietly on a stale artifact — and that failure is silent and expensive.
Rejected: writing to both every time (two copies drift the moment anything writes to one, and a cold session cannot tell which is current).

**D21 · Generated statistics are calibrated against published league lines, per level.**
`LVL[level].env` holds the real 2025 batting and pitching line for MLB and each affiliated level; every generated rate is that published rate moved by grade. `qa/calib.js` proves the population reproduces the source within tolerance and runs as part of the gate.
Reason: Law 12 says derive, don't author. The previous engine authored a plausible-looking distribution around a talent centre; this one reproduces a real document. The difference is visible — the old model gave MLB a 1.54 WHIP against a real 1.29.

**D22 · The run environment is not monotonic by level, and the engine models that.**
Triple-A is the most offensive league in affiliated ball (.768 OPS, 5.24 R/G) — well above MLB. **Double-A is the lowest-scoring level in professional baseball** (.683 OPS, 3.92 ERA), below MLB. Scoring then rises through High-A and Single-A on traffic rather than power: Single-A has the lowest slugging in the game and the second-highest on-base, with 15.2% of its runs unearned.
Recorded as a decision, not just a figure, because "players get worse the further down you go" is the intuitive model, it is wrong, and someone will try to restore it. The only figure that behaves intuitively is the unearned-run share, which is a clean monotonic **defence** gradient: 8.1% → 9.6% → 11.9% → 12.6% → 15.2%.

**D23 · Independent leagues borrow a published environment rather than getting an invented one.**
No indy league publishes rate statistics and none is reachable from a primary source — the MLB API carries their rosters but no stats, Baseball-Reference's register tables are comment-wrapped, Pointstreak returns 403. Each league therefore uses the published line of the affiliated level its roster rules make it resemble (Atlantic → Triple-A on 40%+ MLB service time; American Association → Double-A; Frontier → High-A on its age cap; Pioneer → Single-A on its 3-year service cap), and the in-game provenance sheet states the borrowing and the reasoning.
Rejected: inventing a plausible indy line. Tier 3 reasoning over Tier 1 numbers, clearly labelled, beats a fabricated Tier 1-looking figure every time.

**D24 · Scouting reliability is a function of sample size, not age.**
It previously saturated at the 0.96 cap for anyone past about 29, which made every veteran a known quantity and quietly flattened the uncertainty that Law 10 exists to create. It now grows with plate appearances or batters faced and tops out at 0.93, so a mid-season roster spans roughly 0.39–0.61 rather than clustering at the cap. Scouting looks — the other input — arrive with the scouting pass.

**D25 · The clock offers Day, Series, Week and Month — and every advance is interruptible.**
Jordan asked for day/week/month. Series was added because baseball is organised in series, not weeks: "play out this set against Yuma" is a decision an owner actually makes, and a week cuts a series in half. Advance-to-a-date is there for the winter, which is otherwise thirty taps.
The interrupts are the real design. A jump you cannot interrupt is a jump you never use, so every advance runs to its limit and stops the moment an injury happens, the active roster falls below the legal minimum, or cash crosses a floor you set — each switchable independently, on by default.
**Measured:** at defaults, 40 month-long jumps asked for 1,200 days and delivered 751 — a "Month" tap actually advances **18.8 days**, stopped 21 times by injuries and once by cash. That is the game's pacing, and it is a number to re-check whenever the injury rate changes.

**D26 · A save is validated, not trusted. `migrate()` is the game's only validator and it asserts the shape the render path actually dereferences.**
It used to be `Object.assign` plus four array guards. The total sweep drove 27 corruptions at it and five ended in a dead session — a missing `world`, a `world.clubs` that was an object, a null date, a nonsense date, a player with no `tru`, a schedule row indexing past the end.
The rule now: **everything recoverable is repaired; only a payload with no world to run is refused.** Repaired — the calendar, the season block, every player's `st`/`tru`/`ns`/`rel`/`cid`, dangling schedule and box indices, malformed journal entries (dropped whole, so double entry stays intact), unknown enum values for tab/shell/theme/density. Refused to a clean start screen — no world, no club, `{}`, `[]`, a bare number, a string, truncated JSON.
Rejected: refusing anything imperfect. A start screen you can begin from is an acceptable outcome; a blank page is not, and neither is telling Jordan to wipe a save (Law 11).

**D27 · A pre-sim save resumes in its own season year, with the world stocked and a schedule drawn from its own seed.**
v0.1–v0.3 saves carry a world, a club, a ledger and 25 men — no rosters for the other 201 clubs and no schedule. v0.4 needs both.
Three options were measured, not argued. **Rewinding the clock** to an opener already past re-posts months the old ledger has closed and strands every game before today, because `playDay` skips them. **Jumping to next year's opener** charged an indy club ten months of winter with no gate and bankrupted it at **-$123K before its first pitch** — the migration suite caught it. **Resuming in the current year with the remainder of the schedule** does neither, so that is what it does.
The old stat lines are cleared. They were generated flavour from a build with no games in it; v0.4 earns them by playing. The club, the books, the settings and the saved column layouts all survive, and the game says so in the log.

**D28 · Every identifier space in `G` is declared, and the gate asserts every reference resolves.**
There are three, and they are not interchangeable: **club ids are strings** (`"MLB_1"`, from a global counter — D18's fix for duplicate slugs); **`G.sched` and `G.box` hold array indices** into `G.world.clubs`; **depth charts hold array indices** into `G.players`. Strings and numbers can never silently collide, which is why this has not bitten yet.
It nearly did. `migrate()`'s validation filter can shrink `G.players`, which silently re-points every depth chart at another club's men. Fix: **`reindexClubs()` runs on every load**, and the gate now asserts that every depth-chart entry, every schedule row, every box score and every player's `cid` resolves to something real.
Anything that reorders `G.world.clubs` — expansion, relegation, the ownership ladder — must renumber the schedule and the box scores, or it corrupts the season silently.

**D29 · A grid id may contain a pipe, so anything that parses one splits on the LAST separator.**
`gsort` split on the first, so tapping any column header on the roster grid — the most-used table in the game — wrote a sort for a column called `"LINEUP"` into a bucket no grid reads. **The roster could not be sorted at all, in any of its six views, with no error anywhere.** Every prior gate passed because it only ever sorted the ledger, whose id has no pipe.
Two rules out of it. **A handler that early-returns on an unknown id reports "ok" and proves nothing** — so the sweep asserts every grid id it drives actually resolves to a config. And **the gate now checks the rendered rows reorder**, not that a state field changed, because the state field was changing the whole time.

**D30 · Materiality is measured against a controlled comparator, or it is not measured.**
The first version of the materiality suite booted twice without a seed and compared two different clubs in two different worlds — noise dressed up as an effect. It also measured boot-to-now, which mixes in the acquisition-year seeding and read a $25M loss where the tuned answer is break-even.
The rule: **same seed, same club, same schedule, one full calendar year, only the variable under test differs.** On that basis a .630 season against a .370 season is worth **$631K to an indy club against a $2.02M cost base (31.2%)** and **$70.0M to a major-league club against $385.5M (18.2%)**. Both material. Neither number was believable before the comparator was fixed.

**D31 · The engine's quality signal is reported against its binomial ceiling, not as a bare correlation.**
"Do better rosters win?" has no honest answer as a raw r, because a 162-game season is a coin-flip sample and luck owns a fixed share of the variance. Measuring the whole 40-man also dilutes the signal with men who never play.
So: talent is measured over **the nine who bat and the five who start**, and r is reported against `sqrt(1 - noise_var/total_var)` — the most any perfect model could achieve given the observed spread. MLB is **r = 0.477 of a 0.681 ceiling, 70% of the achievable signal**; one grade point of lineup quality is worth **2.7 wins per 162**. Independent ball is the weakest at 53%, which is expected from a 105-game season and a borrowed run environment.
Recorded as a decision because the bare number (0.477) reads as weak and the honest one (70% of what is physically possible) reads as sound, and the second is the true one.

---

## 2026-08-27 — Session open on a cold folder (workshop pass, no game change)

**D32 · The fragments live in `src/`, and `compose.py` proves itself with `--check`.**
The v0.4 fragments and `compose.py` never existed anywhere but a scratch container, so the folder shipped a build with no way to build it — a HANDOFF that says "never hand-edit the composed file" beside no fragments to compose. They were re-cut from v0.4 at the banner comments already in the file, into `src/` rather than the project root, so 21 build inputs do not sit in the same listing as the eight docs.
Rejected: leaving them flat in the root (as the v0.4 HANDOFF's bare filenames implied) — the root is the first thing a cold session reads, and 21 fragment names bury the doc set.
The re-cut is only trustworthy if it is proven, so `compose.py --check` composes to memory and diffs against the file on disk. It reports **byte-identical, 205,776 bytes** — the split loses nothing. Any future re-cut must clear the same bar before it is believed.
`compose.py` also runs the data-act/ACTIONS and VIEWS/live-page reconciliation at compose time. A broken wire should fail at the moment it is written, not two minutes later at the gate.

**D33 · Every harness resolves the build through `qa/_build.js`; none may name a version.**
Two failure modes, both of which let a gate pass for the wrong reason. First, the harnesses were authored beside the build and committed into `qa/` unchanged, so `__dirname` no longer found it — and `simcal.js` and `season.js` had hardcoded `/home/claude/bl/bush-league-v0.4.html`, an absolute path from a container that no longer exists. **Two of the eight "clean at v0.4" harnesses could not have run at all as committed.** Second, all eight named `bush-league-v0.4.html` literally, so the day v0.5 composes, the entire gate would have kept grading v0.4 and reported clean.
So: one resolver. Explicit argument, else the highest `bush-league-vN.html` in the project root. It builds file URLs with `pathToFileURL`, which also fixes the unescaped space in "bush league sim" that a naive `'file://'+__dirname` concat would have produced on this machine. Every harness prints `[name] build under test: …` before its first assertion, because a gate that does not say what it graded is not evidence.

**D34 · A gate that is 3% flaky is a defect in the gate, not a rounding error.**
`check.js` boots unseeded, so every run grades a different world, and its own home/away assertion intermittently fails. Rather than re-run until green, the flake was measured: `qa/flake_sched.js` over 200 worlds finds **5 (2.5%)** with one club outside the 2.5-game tolerance, always by **exactly 3 games**, never worse. v0.4's "208 passes, 0 failures" was therefore one sample, not a proof.
Rejected: widening the tolerance to 3. That hides the effect instead of removing it, and the effect is not small — an indy home date nets a measured **$29,070**, so 3 dates is **$87,210**, more than that club's whole annual profit in four of five simulated years.
The fix, when the schedule is next opened: a deterministic repair pass after placement that flips the venue on one meeting between an over-home club and an under-home one until every club is inside tolerance. Recorded now because the temptation on a red gate is always to re-run it.

---

## 2026-08-27 — The front door (v0.5)

**D35 · The start screen is always shown; a save is offered on it, not instead of it.**
`init()` loaded any save straight into the shell and never called `showStart()`. The consequence was not cosmetic: **once a save existed the start screen could not be reached at all**, except through the in-game `restart`, which is a `confirm()` that deletes the save first. Both starts, and now the club picker and the seed, were unreachable to anyone with a game in progress — which is everyone, after the first session.
Rejected: auto-resume with a "new game" entry buried in Settings. It keeps a returning owner one tap closer to his club and makes every other choice two taps further from anyone testing a build.
The cost is one tap on resume. It is paid back by the door carrying the club's name, level, league, date, record and cash, so opening the game tells you where you left off before you are in it. The summary is computed once when the save is read — a single pass over the ledger — so opening and closing a seat never re-parses a 4 MB save.

**D36 · The screen states what it cannot do rather than offering a control that does nothing.**
Three things a start screen "should" have do not exist as systems: difficulty (`G.diff` is written by `newGame()` and read by **nothing** — dead state of exactly the kind the v0.4 sweep deleted `lastAdv` for), takeover scenarios (all 30 clubs open with identical books, which is also why `qa/probe.js`'s "24 seeds" printed one number 24 times), and any per-club financial identity.
Rejected: shipping a Normal/Hard toggle now and wiring it later. A control that changes nothing is worse than its absence — it spends the owner's trust on the one screen whose whole job is to set expectations, and it is invisible to every harness because nothing fails.
So the takeover seat says, in prose, that all 30 clubs open identical and that market size and the scenarios arrive with the finance pass. When difficulty becomes real it gets a control and a measured effect, in that order.

**D37 · A disclosure is prose and gets `.note`; `.l3` is a grid sub-line and clips.**
`.l3` is `white-space:nowrap` with an ellipsis, and `:root[data-density="dense"] .l3{display:none}`. Correct for a row in a table. Applied to the source citation and the D23 Pioneer caveat it truncated them mid-sentence at 360px and **removed them outright at dense density** — a caveat that disappears at a display setting is worse than no caveat, because the number stays.
`.note` wraps, never hides, and `.note.warn` carries the attention colour. Rule: any line whose job is to qualify a number uses `.note`. Found by eye in a screenshot, not by a harness — the fifth time that has happened on this project.

**D38 · Front-door actions are session-destroying and belong on the coverage skip list.**
`qa/sweep1.js` fires every key in `ACTIONS` to prove none throws. `sSeat`/`sLg`/`sClub`/`sSeed` call `showStart()`, which **removes `#app`**; `sGo` calls `boot()`, which replaces the world. Running them inside the coverage loop silently reset the game under every later test in the file — surfacing three files later as an unrelated-looking cash-floor failure that looked like a regression in the interrupt logic and was not.
They join `restart` and `impo` on the skip list, and are exercised for real — through DOM taps, not function calls — by `qa/start.js`.
The general rule, which cost an hour: **a coverage loop over every handler is only safe while no handler owns the session.** Any future action that reboots, navigates away, or tears down the shell must be added to that list in the same pass it is written.

**D39 · A container with `max-width` also declares `width:100%`.**
`#boot` centres its child with `display:grid;place-items:center`, which sizes that child to max-content. With three lines of prose in it that was invisible. With the club picker inside, the child grew to its 640px max-width and the front door scrolled sideways in a 360px viewport — 672px of content, on the phone-first screen, on the first screen of the game.
Fixed in the stylesheet (`.door`, `.door-w`) rather than with inline overrides, because the inline `display:block` that `showStart()` was already setting is what hid the problem in the first place.

**D40 · One runner, and it trusts neither the exit code nor the output alone.**
`qa/run-all.cmd` → `qa/run-all.js` runs all ten harnesses in fast-fail order and prints one verdict.
Six of the ten — sweep1, sweep2, sweep3, season, inv, flake_sched — **do not set an exit code at all**, so a runner built on `%ERRORLEVEL%` would have reported a red sweep as green. Every harness is judged on the exit code *and* on whether it printed a line starting with `FAIL`; a non-zero exit with no FAIL lines is reported as CRASHED, not as a failure, because it means the harness died before it could assert. Writing this runner immediately exposed the same bug in itself — `inv.js` reported "ok" while crashing, because the crash test was gated on the harness's kind.
Two placement rules, both about OneDrive, which is the project home (D20):
**playwright is installed outside the project folder.** Measured: `node_modules` is 13 MB but ~3,000 files, and the browsers are ~920 MB. The browsers already land in `AppData\Local`, outside sync; `node_modules` would not, so it goes to `C:\bl-qa` and the harnesses find it through `NODE_PATH`. The runner probes that path, then asks `npm root -g`, then prints the install instructions rather than failing ten times over.
**Harness logs go to the system temp directory.** A full gate run should not produce a sync event, let alone ten.
Not yet verified on Windows — every harness is plain Node with no shell calls and `_build.js` uses `pathToFileURL` specifically for Windows paths and the space in "bush league sim", but that is reasoning, not a test result, and HANDOFF says so.

---

## 2026-08-27 — The independent leagues become five different leagues (v0.6)

**D41 · The Pecos League is in, and its ownership is fictionalised on the record.**
The ladder needed a bottom rung. The Pecos League is the real one — 16 clubs, 54 games, 22-man rosters, $50-a-week players who by the league's own description are not on contracts at all since 2018, citing the Save America's Pastime Act.
**The liberty, taken deliberately with Jordan's call:** Commissioner Andrew Dunn owns 15 of the 16 clubs. The league is functionally single-entity and **there is no market in which to buy a Pecos club.** The game lets you own one anyway, because a ladder needs a bottom rung you can stand on. Rejected: a rung you operate but cannot own, which was the sourced-accurate option and which he turned down for ladder uniformity.
It is disclosed on the start screen, in the same voice as the D23 proxy warning. The rule this project runs on is not "never depart from the source" — it is **never depart from it silently.**
Second liberty, same entry: **Pecos attendance is a T3 estimate (400).** The league does not collect or release attendance — that is a published finding, not a gap in searching. The estimate comes from anecdotes: ~300 on a Thursday in Tucson, under 500 for a championship series, ~1,000 at Garden City, 20-40 at a typical game.

**D42 · The floor gets its own books, or it is not a rung at all.**
Dropping a Pecos club into ECON.INDY gave it 400 fans a night against a $2.0M cost base built for 2,300: **8 seeds out of 8 went bankrupt inside a year, losing about $200,000 on $83,000 of cash.** Guaranteed bankruptcy is a seeding defect, not difficulty (the same words the ECON comment already used about opening working capital).
The error was scaling everything by the attendance ratio (400/2300 = 0.174). A Pecos club is not a small independent club — it is a **ten-week summer operation with almost no year-round overhead**, and it was still carrying twelve months of front office.
Two scales now, solved against the law ECON.INDY is already tuned to — a .500 club at league-average attendance nets roughly zero over a full calendar year. Operating k ≈ 0.05; capital scaled separately at 0.10, because the owner's stake and the note are what he brought to the table, not a function of the gate. **Measured after: 10 of 10 seeds solvent, year-one net −$21,657 to +$27,289, mean +$1,594.**

**D43 · Talent follows the transaction record, not the proxy ladder.**
Until v0.6 every independent league drew from one `LVL.INDY` distribution, so the Atlantic League posted Triple-A rate statistics using Single-A-grade players — the run environment was a costume over identical men.
`INDY_PROXY` implied an even four-step ladder (AAA → AA → High-A → Single-A). **Two independent sourced signals disagree with that and agree with each other:** contracts purchased per club per season (Atlantic 6.1 · Frontier ~2.1 · Pioneer ~2.2) and team salary caps (Atlantic $225–275K · American Association $115–125K · Frontier $75–85K). Both say the Atlantic is roughly 3× the rest and the other three are bunched.
So: Atlantic 42 · American Association 36 · Frontier 35 · Pioneer 34 · Pecos 30, plus a small service-time edge (survivors are better than their level, +0.5/yr capped at +4). The centres are T3 — nobody publishes a talent measurement for any independent league — but **the shape is sourced, and it is falsifiable**: the contract-out pass must reproduce ~3× the sale rate from the Atlantic. Measured at v0.6: 44.8 > 37.5 > 36.7 > 34.8 > 31.3, the Atlantic 7.2 clear of the next league against a 2.8 spread across the other three.
The American Association's environment proxy moved from Double-A to High-A to match. Recorded against D23, which set the original even ladder.

**D44 · Classification is derived from the published rule, never stored.**
`settleYear` ages the entire world. A class stamped onto a player at generation would be a lie one winter later — and the Frontier League classifies on **age**, so its entire roster reclassifies every January. `clsOf()` computes it on demand from the rule as published.
This also means **the rules bind at generation only.** Every roster in the world is born legal; after a season of ageing, Frontier rosters will drift out of compliance and nothing yet restores them, because there are no transactions to restore them with. That is the honest state and it is written into HANDOFF, not hidden.
The harness that checks this, `qa/leagues.js`, encodes **each league's published rule** rather than the generator's own composition table. Checking a generator against its own spec proves only that the spec was copied twice. It caught three real violations on its first run — 30-year-olds inside the Frontier's 27-29 class and 4-year men in the Pioneer, whose one published rule is a three-year cap — all from a single off-by-one in an integer draw.

**D45 · The venue repair pass landed, and it exposed a deeper defect in the pair allocator.**
D34 wrote down the fix for a 2.5%-flaky gate: after placement, flip the venue of already-scheduled meetings to even out home dates. It is implemented (`balanceVenues`), it is a strict-improvement sweep with a bounded plateau escape, and it **eliminated the imbalance across every affiliated level and all four Partner Leagues — those now come out at 0-1 games, where they used to fail about 2.5% of runs.**
It does **not** fix the Pecos League, and the reason matters: 54 games across 15 opponents is 3.6 meetings per pair. Pair counts are integers, so some pairs meet three times and the odd meeting always falls the same way. **No venue flip can fix a parity problem** — moving a club toward balance moves its partner away. About 18-19% of worlds end with one Pecos club exactly 3 games out.
Rejected, again and for the same reason as in D34: widening the gate's tolerance, or making it proportional to season length. That hides a real effect — 3 home dates is roughly 11% of a Pecos club's home schedule.
**The fix is in `pairCounts`, not in the repair pass:** allocate meetings so each club's odd-meeting pairs cancel, and assign the venue of the odd meeting at allocation time. That is the first thing to do next session.

---

## 2026-08-27 — The schedule was never even (v0.7)

**D46 · The remainder is spread by round-robin. And the defect it fixed was not the one being hunted.**
D45 said the Pecos home/away flake was a parity problem in `pairCounts` and that the fix was to make every pair meet an even number of times. **That was wrong, and the wrongness is the useful part.** Topping up in twos instead of ones changed nothing measurable — the base was already even.
Instrumenting an actual failing club found something far worse and far older: **Roswell played San Rafael 26 times and every other club exactly twice**, including a single 23-game series. It was not confined to the Pecos League. **A Triple-A pair met 42 times against a median of 6. A Double-A pair 30 times. A High-A pair 28. An American Association pair 20.**
The cause: the top-up loop picked the pair joining the two clubs furthest behind target, and those same two clubs stayed furthest behind on the next iteration, so it kept choosing the same pair and dumped the entire remainder onto it. **The two leagues that always looked clean — the Frontier and the Atlantic — are exactly the two whose game count divides evenly by their opponent count, so the loop never ran for them at all.** That coincidence is why it looked like a Pecos problem.
Fixed by walking whole round-robin rounds: each round pairs every club with exactly one opponent, so k rounds give every club exactly 2k extra games and no pair repeats until all have been used once. **Every competitive pool is now within 2 meetings, which is the arithmetic floor whenever games/(n-1) is fractional.**
**Why six builds missed it: every harness counted how many games a club played and none of them ever asked WHO it played.** `check.js` now asserts opponent distribution per pool, and the assertion was verified by running it against v0.6, where it fails.

**D47 · The fair schedule is a fairness fix, not a competitive one — and the measurement says so.**
Comparing sweep3 across the two builds looked spectacular: MLB's talent-to-win correlation appeared to go from r=0.156 to r=0.587. **It is meaningless.** Both runs boot unseeded, so they are single different worlds — the exact error D30 exists to prevent — and v0.7's run reported r at **155% of its own binomial ceiling**, which is impossible and simply means the ceiling was estimated from one sample.
Measured properly instead, with `qa/schedfair.js`: the same 10 seeds through both builds, 17 competitive pools.
- **Strength-of-schedule spread — the direct measurement of the defect — fell from 0.214 to 0.153 grade points (−29%)**, and collapsed where it was broken: **Pecos 0.631 → 0.125 (−80%)** and **Triple-A International 0.411 → 0.090 (−78%)**. Pools that were already even did not move at all (Frontier 0.094 → 0.094, Atlantic 0.178 → 0.178, MLB 0.204 → 0.204 — MLB is unchanged because it uses the other allocator, which is the right control).
- **Talent-to-win correlation moved 0.563 → 0.569. That is +0.006, which at ten seeds is noise.**
**So the honest materiality: the schedule is now demonstrably fair, and it does not change who wins.** A lopsided schedule is symmetric — drawing one opponent 42 times hurts as often as it helps, so it wrecks an individual club's record without systematically favouring good clubs or bad ones. The real return is a gate that can be trusted: the home/away flake that had been present since v0.4 went from 2.5% of runs, and 18-19% once the Pecos League arrived, to **0 out of 200 worlds**.

---

## 2026-08-28 — The roster costs money (v0.7)

**D48 · Payroll posts the roster. Contracts fit the league's cap.**
Six builds charged a flat constant to account 5000 — **$128,000 a season for every independent club in every league** — while every man carried a contract the ledger never read. Signing, releasing or carrying a short roster cost exactly nothing, at a level where the whole annual margin is tens of thousands of dollars. The single biggest decision an owner makes was not a decision.
Two halves, and both were needed:
- **The ledger charges what the roster costs.** `rosterPayroll()` sums the men actually on the books — annual contracts spread over twelve months at MLB, monthly wages in season only below it. `E.payroll` survives solely as the fallback for a save whose players predate contracts.
- **Contracts fit the cap.** The raw ovr-to-dollars curve is one line for all of independent ball, so it produced a **$219,000 Frontier roster against a published $85,000 cap** and **$233,000 in the American Association against $120,000**. Every league was paying Atlantic League money. Each club's contracts are now scaled to its league's cap, which keeps the shape the curve gives — the best man still earns the most — while making the cap the constraint it really is. Measured: all five leagues land within 0.01% of their published cap.
**A defect this created and the harness caught within the hour:** `leagueMonths()` first returned elapsed months (the Frontier's 136 days = 4.47) while `postMonth()` charges once per calendar month in season, which is five. Payroll came out 12% over cap. It counts calendar months now. The arithmetic would never have looked wrong on its own.
The permanent check asserts the **LEDGER**, not the roster: play a season, compare account 5000 against what the men cost, and fail outright if it ever reads $128,000 again. Verified by running it against v0.6, where it fails.

**D49 · One cost base cannot serve five leagues, and `opScale` is solved, never chosen.**
The moment payroll was real the four Partner Leagues stopped being interchangeable. Over three seeds and a full calendar year each, the **Atlantic League cleared +$190,611 while the Frontier lost $253,128 and the Pioneer $234,141** — one ECON.INDY cost structure against gates ranging from 51 dates at 2,146 to 63 dates at 2,529.
`opScale` multiplies the operating cost lines only, never revenue, and each value is **solved from the measured net**, not picked.
**And the first attempt at solving it was wrong in an instructive way.** Averaging net across seeds treated a sample that happened to average .550 as if it were .500, and the Atlantic League looked $53,000 profitable when it was not. `qa/econ.js` now fits net against win% across seeds and reads break-even off the **intercept at .500**, which is what ECON's own law actually says. After one iteration on that basis all five leagues sit between **−$385 and +$963** at .500 — against cost bases from $130,000 to $2.3M.
The fit also produces the number worth more than the intercept: **the slope, in dollars per 100 points of win%.** Atlantic $131,889 · American Association $147,688 · Pioneer $106,272 · Frontier $44,920 · Pecos $3,610.

**D50 · Below 720px the fields move; they do not disappear — including the ones added last.**
The new Class column reached the wide table and stopped there. On a phone the contract line still read `#27 · 29 · – · FA – · indy deal`: a dash where the Frontier League's classification belongs, because `svcTxt()` renders nothing outside MLB, and "FA –" on a one-year deal that every independent contract is.
So on the phone-first screen the game is designed and verified at, **the single constraint an independent roster is built against was invisible.** It now reads `#27 · 29 · Exp-2 · 3 yr svc · $456/mo`.
Found by eye in a screenshot with all twelve harnesses green — the sixth time on this project, against one found by a harness.

**D51 · A test that names one thing must isolate that thing.**
`sweep1`'s "cash floor does not bind one dollar over" advanced a week with the injury and roster interrupts still armed, so it failed whenever an injury happened to land inside its own week — about one run in three, on every build back to v0.4, for a reason unrelated to what it was testing. It disables the other two interrupts now. Same principle as D34 and D45: a gate that reds at random is worse than no gate, because it teaches you to ignore reds.

---

## 2026-08-28 — The market (v0.8)

**D52 · Every published roster rule becomes a predicate, and the Atlantic League's absence of one is encoded as an absence.**
Five leagues, five different rulebooks, and until this pass all five were a sentence in a data note that nothing read. `LIMITS` carries them as functions over a player: the Frontier's four age classes, the American Association's four service classes, the Pioneer's three-year cap, the Pecos veteran limit — and `"Atlantic League":[]`, because Rules 10, 11 and 12 of that league's own rulebook are redacted and it publishes no roster rule at all. An empty list is the honest encoding of "not published"; inventing one would have been the dishonest one.

**D53 · A move is legal when it does not INCREASE the number of violations.**
The obvious rule — "the roster must be legal after the move" — freezes any roster that has drifted out of compliance, which is precisely the roster that needs to move. Under the no-worse rule a club can always repair and can never get worse. Cap and roster maximum sit on top as hard blocks, because those two are what a league actually refuses to process.

**D53a · AI clubs value men through the same fog the owner does.**
`aiVal` reads the scouted grade, not the true one, with a deterministic per-club offset derived from the two ids — so a rival can overpay for a man who cannot play and pass on one who can, and it forms the same opinion of him every time it looks. That is Law 10 applied to somebody other than the player.

---

## 2026-08-28 — The winter (v0.9)

*The pass that stopped the world from dying, and the eight defects found on the way.*

**D54 · A closed population under an age rule has exactly one destiny.**
v0.8 shipped a market you could trade in and a world that could not survive it. Nobody entered the game and nobody left it, so every January the entire population aged one year: **median independent age 25 → 26 → 27, the under-25 market 22 → 12 → 9, and by 2028 all eighteen Frontier clubs were illegal with no legal move available to any of them** — nine young men in the whole market against eighteen rosters each required to carry ten. Measured on v0.8 at ten years: **median age 36, 100% of the league aged 28 or over, 100% aged 30 or over.**
This was not a bug in the AI. It was the absence of a system. Real independent ball is the opposite of closed — 24–41% of a roster comes back and the rest is a fresh class every spring — so that churn is now the game:

- **in season**, affiliated organisations purchase contracts weekly at each league's own published rate;
- **January 1**, every contract expires, men leave the game on an age curve, and a new class is generated;
- **through January**, a club may re-sign its own men and nobody else's;
- **February to April**, the open market, and it is a race;
- **opening day**, anyone still short is filled from what is left.

**The intake is sized against the rulebook, not against a constant.** The Frontier requires ten men aged 25-or-under and six aged 26 on every one of eighteen rosters: 180 and 108 jobs only a young man can hold. A flat intake cannot guarantee those are fillable; counting them can. Each league's own composition table times its club count times a 1.30 margin is the target, and the winter generates the shortfall.

**Measured against reality after ten simulated years:** median Frontier age **26** (real 24–25) · **18.0%** aged 28 or over (real 15%) · **5.1%** aged 30 or over (real 2%, rulebook ceiling 8%) · roster continuity **30.7%** (real 24–41%, n=4 clubs). The world runs about a year older than the real one; that is stated as a gap rather than tuned away, because closing it further would mean fitting the attrition curve to a tail the rulebook already cuts.

**D55 · `settleWeek` had been describing a system that did not exist.**
Its comment since v0.8 read *"a club that loses a man to an affiliated organisation replaces him that week"*. There were no promotions in the game. Both halves are real now, and they run in that order — a club can only replace the man it just lost if it lost him first.

**D56 · A market whose mean ask exceeds cap ÷ roster cannot field a team, however reasonable each man looks alone.**
The first pricing cut asked 2.4× what the identical player earned under contract. The second fixed the individual and missed the aggregate: prices tracked the roster median inside the harness's 0.5–1.8× band and **every Atlantic club still stalled at fifteen men on a twenty-three-man minimum**, each signing defensible and the sum of them impossible. The curve now sets the *shape* and `repriceLeague()` sets the *level* — one scalar per league, solved as `target ÷ observed` against the men who will actually be signed, re-solved every winter against whatever pool that winter produced.

**D57 · A club needs a budget, and it is not a league rule.**
`moveOk` is the league; the league does not care how a club distributes its cap. `budgetOk` is the club: a RESERVE rule that never commits so much that the remaining spots cannot be filled at the league floor (this one guarantees a legal roster exists), and a BUDGET rule capping any single man at 2.2× the average of what is left per remaining spot. The owner is warned by this and never blocked by it.

**D58 · The roster minimum binds on the way down, not on the way up.**
One line, and it explained everything. `moveOk` refused any move leaving the roster below the minimum — so **a club with an empty roster could not sign anybody, because one man is also below twenty-three.** Through the whole of the first winter every club sat at zero and every signing was refused; the only thing that ever filled a roster was the emergency backstop, which bypasses the check, so clubs opened camp both short and over budget. A league refuses a *release* that takes you under the minimum. It does not refuse the *signing* it is waiting for.

**D59 · Shop against the hole, not the top of the board — and rank, never filter.**
The AI's repair walked the forty best free agents looking for one who fixed the roster. The man who closes an age gap is almost never one of the forty best, so clubs with three open spots, twenty thousand dollars of room and **fifty-one eligible men in the market** sat illegal and *accumulated*: three clubs became six in six weeks, every one able to fix itself with a phone call it never made.
Two further lessons inside the fix. **Counting violations cannot steer a roster; counting men can** — "2 rookies, requires 5" and "4 rookies, requires 5" are the same one sentence, so no violation count ever rises to warn a club that is drifting. And the first cut of `needsOf` knew only about *class* rules, so a club merely short of bodies scored every candidate at zero and a `needScore > 0` filter threw away its entire market: **3 illegal clubs became 33.** An ordering can never empty the board; a filter can.

**D60 · The one thing that tells an owner his roster is illegal was measuring something no league enforces — and then it became a wall.**
`checkInterrupt` asked whether an independent club had twenty men. One number for five leagues, while `rosterLimits()` already knew the Frontier requires twenty-two, the Pioneer twenty-five and the Pecos twenty — and a body count cannot see a composition failure at all.
Fixing it introduced something worse. `advanceDays` breaks out of its loop on the first interrupt, so **a condition that is true every day is not a warning, it is a wall**: any owner whose roster had drifted illegal could not advance the clock by a single day, forever, and dismissing the toast changed nothing because the next tick stopped on the same sentence. Every migrated save from before the roster rules existed was unplayable. It fires on the **change** now. Playing on with an illegal roster is the owner's choice — a real league fines you, it does not confiscate your calendar.

**D61 · `cid: "FA"` is a real value, and three separate things could not tell it from corruption.**
`migrate()` repaired any player pointing at a club that does not exist by reassigning him to the owner — and a free agent points at no club by design. **Reloading a v0.8 save handed the owner every free agent in the world: 25 men became 235, and the free-agent pool went to zero.** It shipped. Nothing caught it, because every harness tested the live object and none of them tested the round trip. Saves are forever (Law 8) — the round trip is part of the schema, not a formality after it. `qa/winter.js` now asserts it, and `qa/sweep1.js` and `qa/check.js` had been counting all 204 free agents as dangling references since the day the market shipped.

**D62 · A man sold to an affiliated organisation cannot be deleted mid-season.**
His batting line is half of every pitching line he faced. Splicing him out of `G.players` in June broke the closed-league identity that has held exactly since v0.4 — **1,874 hits and 4,523 strikeouts that batters never took and pitchers still recorded**. He is parked as `cid: "AFF"` for the rest of the season and purged at the winter, after `settleYear` has archived every line into career totals: the one moment removing a man costs nothing.

**D63 · Contracts predate the cap, so migrate backfills them.**
v0.7 fitted every roster to its league's published cap. Saves written before it arrive carrying **$215,000 of payroll against an $85,000 cap** — the ledger charges it, the league forbids it, and nothing repaired it. Old contracts are now rescaled onto the current cap on load, keeping each man's share of his club's payroll.

**D64 · The exclusive window is a league rule, so it lives with the league rules.**
The re-sign window was enforced only inside the AI's own fill routine. Every club in the world was restricted to its own men for a month **while the owner shopped the entire league unopposed** — worth about half a roster of the best players in the market, every year. It is in `moveOk` now, which is also what makes the market list explain itself: a man you cannot sign says why. A man with no former club — this spring's intake — belongs to nobody and is open to all, for the AI too, which the first cut also got wrong in the other direction.

**D65 · Performance is a correctness property when the world is this big.**
`rebuildRates()` ran a linear scan of all 202 clubs for each of five thousand players — a million comparisons per call — and the winter calls it once per signing. Two simulated years went from 26 seconds to 222 the day the market grew. With the clubs keyed by id, a membership index behind `clubMen`/`freeAgents`, and a bulk mode that defers the two whole-world rebuilds to the end of a batch, **the same two years now take 10.9 seconds — faster than the 26 the build managed before the winter existed** — and a full decade of 68 independent clubs runs in 43.

**D66 · Toasts stack, and the winter was invisible.**
Both found by eye at 360px with every harness green — the seventh and eighth time on this project. A dozen taps of *Week* buried the whole screen under a column of "Advanced 7 days", on exactly the screen an owner works the winter from; only the newest message is kept now. And the Free Agents page read **"Roster 0 of 25"** on January 2nd and explained nothing — not that every contract in the league had just expired, not that this club alone could re-sign its own men until February, not how long there was. The single most consequential state in the game looked like a bug. It has a card now: your own men still unsigned, when your rights end, when camp opens, how many you still need.

---

## 2026-08-28 — Speed of building (v0.10)

*One line each from here on. The reasoning lives in the code comments, which are read more often than this file. See WORKFLOW.md.*

**D67 · Fast gate.** `run-all.js --fast` — 7 harnesses, 28s, covers every subsystem; full gate before anything ships, unchanged. Previously the choice was 8 minutes or nothing, so mid-pass I ran the full gate three times a night.

**D68 · The gate runs in parallel.** Longest-first, 2 workers. 481s → 298s. That is the 2-core floor (work is CPU-bound, wall ≈ total ÷ 2); more workers made each harness slower, not the gate faster.

**D69 · `qa/doctor.js` — one probe, every question.** Illegal clubs and *whether they can be repaired*, pool by age bracket, ask vs pay, save round trip, books, NaN, console, in one 15s command. Replaces the three throwaway scripts and ~8 harness re-runs the v0.9 winter cost.

**D70 · The roster interrupt compared active men to a full-roster minimum.** Introduced by D60 the same night. A Pioneer club with one man on the IL had 24 active against a 25-man roster minimum, so the interrupt fired on day one of every advance and **the clock could not move at all**. Active men are measured against a playability floor (T3, 14 below MLB; MLB's 26 is T1); the league's roster minimum is `violations()`'s job and counts injured men, because they are still rostered.

**D71 · The Pioneer League's roster minimum was invented.** Data read `roster:[25,25]` while its own comment said "no published roster minimum" — turning a published *active roster size* into a fabricated hard rule with zero slack, so one contract purchased made a club instantly illegal and clubs generated at 24 were born illegal. Now `[0,25]`; `rosterLimits()` derives max(18, generated−3) and says it is derived.

**D72 · An unseeded harness cannot be debugged.** `qa/sweep1.js` booted an unseeded world for six builds; its box-score check had been failing in ~40% of runs — every world where the random club landed in the Pioneer or Pecos League — and looked like an unexplainable flake. Seeded, with the seed on the command line.

**D73 · Stat lines carry no club attribution.** `p.st` travels with the man, so once he is released or sold his hits leave the roster and stay in the club's box scores. Known gap, asserted around rather than hidden: the exact identity is checked while nobody has moved, the one-sided version always. It will mis-attribute a league leaderboard the day one exists.

**D74 · Sim micro-optimisation: 1.11×, which is negligible.** Membership index validated by G identity, per-club depth-chart rebuild instead of whole-world on every injury, `inc` off the `nz` call. Kept because free and risk-free; reported as immaterial. The real speed came from D67–D69, not from the engine.

**D75 · `simcal.js`'s tolerance misses were invisible to the gate's own classifier.** It signals a real miss with `!!`-prefixed lines and a non-zero exit, but `run-all.js` only recognizes lines starting with literal `FAIL` — so a harness that correctly caught the A-level whip/bb9 miss (see HANDOFF's "two known reds") was labeled CRASHED, indistinguishable from an environment failure. Added one `FAIL` line matching every other harness's convention; re-ran, confirmed the label changed to FAILED with the same content unchanged. Rejected: broadening `run-all.js`'s classifier regex to recognize `!!` generally — touches shared infrastructure for a one-harness gap; fixing the harness's own output convention is smaller and matches how every other gate harness already signals.

**D76 · `start.js`'s stale-footer check false-positived on `Build 0.10`.** `/Build 0\.1/` is unanchored, so it matches the leading substring of `Build 0.10` — a version this project never reached until this pass — and flagged a correctly-generated footer as a stale hardcoded literal. Anchored with a negative lookahead, `/Build 0\.1(?!\d)/`; re-ran, confirmed `start.js` returned to 32/32 clean. Latent since the check was written, never triggered before because the minor version never reached double digits.

---

## 2026-09-04 — Repository setup and the stack pivot

**D77 · §9.6 vs §14.3: the Rays comparison was apples-to-oranges, not wrong numbers.** Renumbered on
merge — a no-folder cloud session on 2026-09-04 drafted this as "D67," not knowing D67 was already
taken by "Fast gate" above. Flagged rather than silently overwritten, per this project's own rule
(see the entry itself: "don't silently pick a side").

**The conflict.** §9.6 (paraphrased in HANDOFF): "valuations run ~1.5× high, citing the Rays selling
for $1.7B against a $2.6B Forbes average." §14.3 (RESEARCH.md, new this pass): the Rays' own Forbes
valuation was $1.25B months before the $1.7B sale — the sale came in *above* estimate, not below.

**What actually happened, verified 2026-09-04:** Forbes' 2025 league-average MLB team value was a
real $2.6B (CBS Sports 2025-03-26). The Rays' own 2025 Forbes valuation was a real $1.25B — 29th of
30, one of four flat teams, ahead of only the Marlins (Forbes, Teitelbaum 2025 list; DRaysBay/St Pete
Catalyst). **Both figures in the conflict are individually correct.** The error in §9.6 is the
comparison itself: measuring one specific, bottom-tier franchise's actual sale price against the
league-wide average, rather than against that franchise's own prior number. The Rays were 29th of 30
in value — of course their sale looks small next to an average topped by an $8.2B Yankees.

**The correct, like-for-like comparison is RESEARCH.md §14.3's:** sale price vs. that team's own prior
Forbes number. $1.7B against $1.25B is **+36%** — the sale came in above Forbes, matching the rest of
the research (DBH, "actual transactions run above Forbes, not below").

**Resolution:** §9.6's "~1.5× high" framing is retracted as a modelling input — it is a real
observation about one comparison, not evidence that Forbes overvalues teams. Left in RESEARCH.md as a
record of what was tried and why it didn't hold, flagged superseded so nobody re-derives ladder
pricing from it. Any ladder valuation model should use the +36% team-specific ratio, treated as **one
verified transaction (T3 as a general multiplier)** until a second recent MLB sale with a matching
pre-sale Forbes figure is found and logged the same way — do not generalize one transaction into a
universal multiplier, which is the same category of error this decision just corrected. MiLB and indy
sales don't have this problem: Forbes doesn't publish per-team valuations at that level, so there's no
average-vs-individual mismatch to make.

**D78 · The engineering substrate is rebuilt from scratch: React 19 + TypeScript + Vite + Tailwind v4
on a pnpm workspace, hosted on GitHub Pages, PWA-installable. This explicitly supersedes LAWS.md Law 1
("one self-contained HTML file... no frameworks, no build step, no CDNs") and Law 17 ("deliver the
complete single file every pass").**

Jordan's call, made explicitly rather than assumed: "best software, engines... a whole new UI,"
hosted on GitHub Pages. Given a choice between (a) a hosted modern app, (b) a modern authoring stack
bundled back down to one portable file via `vite-plugin-singlefile`, or (c) keeping Law 1 exactly as
written, he chose "whatever will work best for a mobile app game," delegating the specific stack to
this session with the instruction to explain the reasoning — recorded here rather than left implicit.

**What Law 1 actually protected, and how it is preserved anyway.** Law 1's stated reason was
portability: "the game must open anywhere, forever, from one file." A hosted app trades that for a
URL, which is a real, named cost — Law 15 records that Jordan plays on Android, and a URL needs a
network connection the first time. The mitigation, built in from this pass rather than deferred (unlike
the "mobile-games" stack's own note that PWA is "deferred" generally): a PWA layer (`vite-plugin-pwa`,
`generateSW`) precaches the app shell so it opens offline after a first visit, and the actual save data
lives in IndexedDB (via `idb`), not on a server — nothing about a dynasty's save file depends on
connectivity once the app is installed. This is not identical to Law 1's guarantee (a truly disconnected
device can't get the FIRST load), but it is the closest available match to the original reason, not an
unexamined trade of it away.

**What was measured, not assumed, before picking the specific packages:** Vite 8's new default bundler
(Rolldown) breaks `vite-plugin-pwa`'s build hook — confirmed by actually running the build, not by
reading changelogs; the plugin's own generateBundle implementation assigns to Rollup's `bundle` object,
which Rolldown explicitly does not support, and it fails loudly. Pinned to Vite 7 (classic Rollup)
instead of the newer major, because the newest tool is not "best" when it breaks a load-bearing plugin
the mobile-offline case depends on. pnpm is pinned to the 11.x line, not the newly-stable 12.x rewrite
(one week old at the time of this pass) — matching the caution already recorded in the mobile-games
stack's own list ("pnpm 12 as day-one pin" under "explicitly not v1").

**What carries over unchanged, as the source of truth:** `RESEARCH.md` (all figures, all tiers),
`DECISIONS.md` (this file, append-only, D1–D76 untouched), `DESIGN.md` (the game's identity — amended
only to correct the now-inaccurate "one self-contained HTML file" sentence, not to change the design),
`UI.md` (the IA — pages, panes, grid schemas, density tiers — the target for the new component layer,
not a document that needs re-arguing).

**What is ported, not reinvented:** the actual logic inside `bush-league-v0.10.html` — the double-entry
ledger (`post()`/`balance()`/`auditBooks()`), the chart of accounts, the seeded RNG (mulberry32), the
RESEARCH §3.7 display formatters — is now `@bushleague/sim-kit`, a tested TypeScript package. One real
bug was found and fixed during the port, not reproduced: the old `post()`'s NaN guard was dead code,
because its own `r2()` rounding helper silently mapped `NaN` to `0` (via `nz()`) before the guard ever
ran, so a non-finite amount was never actually caught — it was just silently dropped as a "zero-amount"
line. Fixed to check the raw amount before rounding. Verified with a test that fails on the old
behaviour and passes on the fix (`packages/sim-kit/test/ledger.test.ts`).

**What is NOT ported, and is a real gap, not an oversight:** the 23 `src/` fragments and the 17 `qa/`
harnesses referenced throughout `HANDOFF.md` were never uploaded in any session — only the composed
`bush-league-v0.10.html` exists here. World generation, the box-score engine, the market, and the
winter cycle are real, working JS inside that file, and are the next passes to port — not yet done.
There is no migration path from an old `.html` save; `packages/sim-kit`'s `SCHEMA_VERSION` starts at 1,
a stated consequence of the rewrite, not a bug.

**This pass shipped a chassis, matching the project's own v0.1 precedent** (`CHANGELOG.md`'s "Build 0.1
· CHASSIS" shipped no game, just the shell) — one live page (Office, with honest empty states, no
fabricated data), the other 17 pages from `UI.md`'s registry declared and dark with the pass that lights
each one, the token layer (`tokens.css`) carrying forward D9's two-shell/two-theme system and D17's
cyan-over-amber call, contrast values computed against DECISIONS.md D18's own rule (worst of four
surfaces, not eyeballed) rather than reused from the old build, because the old build's docs record the
*pattern* but never the exact neutral hex values. CI (`.github/workflows/ci-deploy.yml`) runs typecheck,
unit tests, and a Playwright visual check (360px + 1440px, both shells, both themes, zero console
errors, zero horizontal overflow) before every deploy — the CI-only-Playwright call from this session's
planning discussion, justified by D16's own evidence that a harness alone has historically missed most
of this project's worst defects.

---

## 2026-09-04 — Player generation, ported

**D79 · Player generation and grading is ported into `@bushleague/sim-kit`: `LVL` environments, the
grade-to-real-units tables (with the Jensen's-inequality correction — `expectedOver`), `makePlayer`,
`rateProfile`, and the Law 10 hidden-truth scouting model (`noiseAt`/`estOf`/`ovrOf`/`refineScout`),
each ported from `bush-league-v0.10.html` and verified, not assumed.**

**Measured, the same way `qa/calib.js` measured it:** 1,400 simulated hitters and 1,400 simulated
pitchers generated at each of MLB/AAA/AA/HIA/A, aggregated, and checked against RESEARCH.md §7.1's
published 2025 line. All 50 checks pass inside the old build's own tolerances (slash line 2%, home runs
5.5%, per-nine pitching 2%) — most inside 1%: MLB batting average generated **.244** against a published
**.245**; Triple-A OPS generated **.768** against a published **.768** exactly; every level's walk rate,
strikeout rate, and BB9/SO9/HR9 landed within a few hundredths of a point of the source. `packages/
sim-kit/test/calibration.test.ts` is the permanent regression check.

**Scope, stated rather than silently narrowed:** this calibrates what `rateProfile()` alone can be
checked against — a hitter's BA/OBP/SLG/OPS/HR-rate/BB%/K%, a pitcher's BB9/SO9/HR9. ERA and WHIP are
opponent-dependent (log5 against a batter, RESEARCH.md's engine section) and need the box-score engine,
which is not yet ported — asserting them here would test a formula this package doesn't contain yet.

**One real bug found in the port, fixed rather than reproduced** (the same discipline D78 already
applied to `post()`'s NaN guard): `abbrFor()`'s club-abbreviation generator indexes into a city's first
word at fixed positions (`w0[2]`, `w0[3]`) without a length guard. On a one- or two-character first word
— never hit by any real city name the old build ever generated, but a real latent defect — vanilla JS
would have silently concatenated the literal string `"undefined"` into a club's three-letter
abbreviation. Fixed with a safe `at()` helper that returns `""` past the end of the string instead.

**Reuse note:** `nz`/`clamp`/`round2` were each duplicated between `ledger.ts` and `format.ts` after
D78's pass; consolidated into `util.ts` and both call sites updated, so there is one implementation to
keep correct rather than two that can quietly drift apart.

**What still isn't ported, and is the next pass in order:** club/world generation (`buildWorld`'s 202-
club data tables), the schedule, and the box-score game engine (`log5`/`resolvePA`/`draw`, the `ADV`
calibration constants). Player generation is the substrate those need, not a replacement for them —
nothing plays yet. See ROADMAP.md.

---

## 2026-09-04 — Club/world generation and the schedule, ported

**D80 · Club/world generation (`buildWorld`) and the schedule generator (`pairCounts`/`placeSchedule`/
`balanceVenues`) are ported into `@bushleague/sim-kit`, from the real `MLB`/`MILB`/`INDY`/`RIVALS`/
`SEASONS` data and algorithms in `bush-league-v0.10.html`.**

**Measured:** the real world is 30 MLB + 120 affiliated + 68 independent clubs = **218**, not the 202
the old HANDOFF's "working and verified" line carried forward — that figure predates the Pecos League's
addition in the original build's own history (D41, v0.6: 52 partner-league indy clubs + 16 Pecos = 68).
Recorded here since it's a real discrepancy in inherited documentation, not invented either way.

All 218 clubs generate with globally unique ids (D28's own regression, re-verified) and abbreviations
unique within every league pool — including the exact case D-catalogued against this code: Sioux City
and Sioux Falls, both in the American Association West, get distinct abbreviations. The full-world
schedule (`buildFullSeasonSchedule`) places every pool independently and every one of the 218 clubs
lands on its exact published game count: MLB 162, AAA 150, AA 138, HIA/A 132, and each independent
league's own figure (Atlantic 126 down to Pecos 54) — `packages/sim-kit/test/schedule.test.ts`.

**One real duplication caught and fixed before it could go stale, not a new bug:** last pass's `levels.ts`
had to hardcode the Pecos League's elevation/games/attendance as standalone constants, because the real
`INDY` league table didn't exist in this repository yet. Porting that table this pass exposed exactly the
trap the original build's own comment on this line warned about ("a second copy of 4870 in this line is
exactly the kind of field that goes stale silently when the other one is corrected") — `levels.ts` now
reads Pecos's elevation/games/attendance from `world-data.ts`'s `INDY` table via `indyLeague()`, the same
as the original, with no standalone copy left behind.

**One genuine algorithmic nuance found during the port, verified rather than assumed away:** the
schedule placer's series-length cap (`schedule.ts`'s own comment on `const cap = ...`) gates only its
fast continuation path. The fallback full opponent-scan can still reselect yesterday's opponent when
that pair's remaining game-need dominates every other candidate, and the run counter can't distinguish
which path chose it — so a pair can occasionally run 5-6 calendar days unbroken against the intended
"two to four game series" design, observed and left as-ported (no old test harness exists to confirm
whether the original build's own gate ever caught or excluded this). Confirmed harmless to the
properties that actually matter — exact game totals, D34's home/away balance, D46's opponent-
distribution fairness — all still hold exactly.

**What's still not ported:** the box-score game engine (`log5`/`resolvePA`/`draw`, the `ADV` calibration
constants) — the next pass, and what turns a scheduled matchup into an actual played game.

---

## 2026-09-04 — The plate-appearance resolution engine, ported

**D81 · `log5`, `resolvePA`, `draw`, `advOf`, `errRate` and the `ADV` calibration constants are ported
into `@bushleague/sim-kit` (`pa-resolution.ts`), from `bush-league-v0.10.html`.**

**Scope, narrowed on purpose, not by accident.** `simGame()` in the original build wraps this logic in
a full nine-inning loop against real rosters, lineups, rotations and bullpens — reading `RT[]` (the
whole world's cached rate profiles), `G.world.clubs`, `G.players`, and accumulating box-score lines per
player. That is a materially bigger subsystem (roster legality already exists in `world-data.ts`'s
`comp` tables but nothing yet builds a roster from them; nothing sets a lineup or a rotation) than this
pass covers. Porting it alongside risked rushing both, so it's the next pass, not this one.

**A real, documented finding, not a defect:** a calibration test that ran `resolvePA` directly — a
fresh random batter and a fresh random pitcher drawn from a realistic level population, resampled every
single plate appearance, 200,000 PAs per level — reproduced batting average and OBP within 3% at every
level, but undershot SLG (~4-6%) and home-run rate (~9-12%) even at near-zero population spread. Traced
before assuming a port defect: `ADV.hrCal` (0.92) and `ADV.bbCal` (1.06) are themselves the calibration
constants the original project tuned against `qa/simcal.js` — which simulated full 162-game seasons
through real lineups and rotations, where the same pitcher faces the same ~9 hitters repeatedly across
an outing, not a fresh random opponent every plate appearance. An isolated PA-resolution test measures
a genuinely different experiment than what those two constants were tuned for. `log5`'s own core
identity (`log5(l,l,l) === l`) is proven exact in `test/pa-resolution.test.ts`, and `rateProfile()`'s
own per-player targets are independently verified at tight tolerance in `calibration.test.ts` — the gap
lives specifically in how the ADV constants interact with lineup context, which doesn't exist here yet.
Tolerances widened accordingly and documented in the test file's own header, not silently loosened:
SLG 6%, HR/600 15%, BB%/K% 8%. **Precise reproduction of RESEARCH.md §7.1 waits for the lineup/rotation
pass** — this is functionally the same class of finding as the old build's own "known red" pattern
(`simcal.js`'s BB/9 10.4% high, carried as pre-existing and real rather than hidden).

**What's still not ported:** roster construction from `world-data.ts`'s `comp` tables, lineup/rotation/
bullpen assignment, and `simGame`'s own inning-by-inning loop (base-out state, run scoring, box-score
accumulation per player). Nothing plays yet — there is a world, a schedule, and a plate-appearance
engine now, but no game has ever actually been simulated end to end.

---

## 2026-09-04 — Roster construction, lineups, and the full game loop, ported

**D82 · `clsOf`, `rosterPlan`, `buildRosters`, `contractFor` and `chartClub` are ported into
`@bushleague/sim-kit` (`roster.ts`); `simGame` is ported (`game.ts`), from `bush-league-v0.10.html`.
This is the pass that turns a world, a schedule and a plate-appearance resolver into an actual played
game.**

**Scope, stated plainly:** the original's `buildRosters()` also calls `buildFreeAgents()` (a separate
open-market player pool) and puts two players per club on the injured list. Neither is ported — a
free-agent pool has no meaning without the market pass that draws from it (ROADMAP.md item 4+), and a
game can be simulated without either. Both are structural omissions, not approximations.

**One genuine bug found and fixed, not reproduced — box-score home/away errors were swapped.** Every
other paired field in `simGame`'s return statement follows the convention `h*` = home, `a*` = away
(`hr:T[1].r, ar:T[0].r`; `hh:T[1].h, ah:T[0].h`), but errors read `he:T[0].e, ae:T[1].e` — backwards.
Confirmed against the original's own box-score table (`bush-league-v0.10.html` ~line 4952-4954, which
reads `b.ae` on the away row and `b.he` on the home row): `T[0].e` accumulates errors committed by the
AWAY defence (incremented while `D === T[0]`, i.e. while away is pitching to home's batters), so the
original build's own box score showed each team's OPPONENT's fielding errors under its own column.
Fixed here to follow the same `h*`/`a*` convention as every other field, matching this session's own
established pattern for a found-not-invented defect (D78's `post()` NaN guard, D79's `abbrFor()`
undefined-string bug) — not silently reproduced, not silently "improved" beyond what the evidence
supports.

**Adaptation, noted rather than silent:** the original reads a per-club `gp` (games played) counter
directly off the `Club` object to pick which of the five rotation slots starts a game. `Club`
(`world.ts`) is a pure world-generation output with no mutable season counter, and no season-play
driver exists yet to own one. `simGame` takes the starting rotation slot as an explicit
`homeRotationIndex`/`awayRotationIndex` parameter instead — whichever pass builds the season loop
supplies it. Two more small pieces of the original's per-side scratch state (`t.pER`, `t.pR`, `t.lead`)
are assigned once and never read again inside the function, confirmed dead, not ported.

**Verified the way `qa/simcal.js` verified the original — real games, real lineups, not just isolated
plate appearances.** 500 simulated games per level, real 9-man lineups and 5-man rotations drawn from
every club the level has (`packages/sim-kit/test/game.test.ts`):

- **HR/9 lands within ~10% of published at every level** (worst: AA at +10.4%) — a large improvement
  over D81's isolated-PA test, which ran a consistent ~8-9% LOW at every level. This confirms D81's own
  hypothesis: `ADV.hrCal` was tuned against real lineup/rotation context, and with that context restored
  here, no further correction on top of the existing constant is needed.
- **BB/9 (and WHIP) runs consistently high** — up to +9.6% at Single-A. This is NOT a new defect: it
  reproduces the same characteristic ROADMAP.md's "Engineering debt worth paying soon" already
  documents in the ORIGINAL build ("The engine walks too many batters... `simcal.js` has been red on
  this for several builds"). Left as-ported and documented, not silently retuned — retuning the walk-rate
  formula is a real piece of work belonging to whoever picks it up, not an incidental fix inside a
  porting pass.
- **A real, small, structural finding, distinct from the above:** a starting lineup (`chartClub`'s
  best-9-by-`ovr`) averages ~2-4 points higher power grade than the full hitter population
  `calibration.test.ts` checks — an unavoidable consequence of only the best hitters actually playing,
  which the original build's own whole-population `qa/calib.js` never had to account for. Small at
  every level tried; noted for whoever next touches HR calibration.

A first draft of this test at only 10 clubs and 300 games showed Single-A HR/9 running 27% high;
re-running with more clubs, more games and a different seed each landed within ~10% — diagnosed as
sampling noise at a small population before it was written down as a finding, not after.

**What's still not ported:** the winter cycle, the market, scouting, the draft, trades, contracts in
depth, injuries in depth, player development, the ownership ladder, play-by-play, staff, awards and
history, and — closer at hand — wiring any of this to the UI or a real save. A game can now be
simulated end to end for the first time in this rewrite; nothing yet calls `simGame` from anywhere a
player would see.

---

## 2026-09-04 — The realism-research sweep merged into RESEARCH.md

**D83 · `RESEARCH.md` §18–24 added: development curves (component-specific aging), Statcast pitch
modeling, batted-ball quality, defensive value units, platoon splits, modern baserunning rules, and the
NPB/KBO international pipeline — seven domains this project had never sourced before.**

**Process, not just content.** The background Workflow launched earlier this session ran 15 agents: one
research pass per domain, one independent verification pass per domain (each a fresh re-fetch or
re-derivation against the primary source, never a re-read of the research pass's own claim), then one
synthesis pass merging everything into RESEARCH.md's existing tier/citation format. Before merging,
this session independently re-checked four of the highest-stakes figures a second time, outside the
workflow entirely: Yamamoto's exact $50.625M posting fee, the 2023 MLB stolen-base total (3,503) and
success rate (80.2%), Statcast's Fielding Run Value out-to-run conversion (0.9 run/out OF, 0.75 run/out
IF), and the Barrel definition's exact exit-velocity/launch-angle thresholds (98mph minimum, 26°-30° at
that speed). **All four confirmed exactly** — real, independent evidence the pipeline's own verify
phase was doing its job, not just asserting confidence.

**The pipeline found and documented real errors in its own first-draft research, not just in old
sources — exactly the discipline this project asks of a solo pass too.** Seven claims were refuted on
independent re-check and are recorded as explicit corrections in RESEARCH.md rather than silently
dropped or silently fixed: a FanGraphs glossary figure (walk-rate/ISO peak ages) that doesn't match the
live page; a 2025 OAA-leaders list with four wrong entries (confirmed via independent Baseball Savant
re-pull); a DRS right-field leader that was actually the NL-only leader; a catcher-framing pull that
was a mis-scoped-query artifact; a rules-vote date off by days (traced to an article's publish date, not
its subject's date); and two folk-physics/casual-aggregator figures that couldn't be traced to any
primary source at all. Each is named explicitly in RESEARCH.md's own "not published / could not verify"
subsections, with the correct figure given where one exists — so a future pass doesn't re-cite the wrong
number by mistake.

**Two structural findings, not single figures, worth flagging for whoever builds on this:**
- **No 20-80-scale defensive grade exists anywhere in the current Statcast era** (§21.4) — the only two
  conversion tables ever published are 12-13 years old and built on UZR, a metric FanGraphs itself has
  since de-emphasized. Any defensive 20-80 grade this project builds will have to be authored, not
  sourced, and should say so on the player screen the way §16's other design-knob figures already do.
- **The LHH-vs-RHH "who has the bigger platoon split" question is a genuine, unresolved disagreement in
  the public sabermetric literature** (§22.1) — two credible FanGraphs sources give opposite answers on
  the same underlying question. Recorded as a range/uncertainty band in RESEARCH.md, not arbitrarily
  picked one side to hard-code.

**Scope, stated plainly:** this pass only merges the research. None of it is wired into `packages/sim-kit`
yet — player development/ageing (ROADMAP.md's next pass) is what actually consumes §18's component-aging
curves; §19-22's pitch/batted-ball/defense/platoon research has no consumer yet at all (the game
currently resolves a plate appearance as one outcome draw, not a pitch-by-pitch or ball-in-play-physics
simulation) and will wait for whichever future pass decides to model at that depth.

---

## 2026-09-04 — The season-play driver: a season can now be played, not just one game

**D84 · `playDay`/`pushForm` are ported into `@bushleague/sim-kit` (`season.ts`), from
`bush-league-v0.10.html`. This is the pass that turns "a game can be simulated" (v2.4.0) into "a season
can be played": walk a built schedule day by day, call `simGame` for every game on it, update every
participating club's record.**

**A small, genuine finding on `Club`, caught before it could be silently ported forward as real state.**
The original club object carries a field, `l10w` (a NUMBER), assigned once at creation and never read
again anywhere in the 5800-line source — confirmed by grep, not assumed. The real rolling last-10-games
window is a separate field, `c.l10` (an ARRAY), that `pushForm()` actually maintains, with the win count
derived on every read via `.reduce()`, never stored. This port does not carry `l10w` forward as if it
were live state: `Club.l10` in this port IS the real array. `gp` (games played this season — what
`simGame`'s rotation-slot pick reads) is a genuine addition; the original only ever set it inside a
season-reset function this port doesn't have yet, not at club creation, but a freshly built world needs
it initialized regardless. `z` is left untouched — also unread anywhere in the original, but nothing in
this pass needs to touch it, so it wasn't.

**Scope, stated plainly, matching `game.ts`'s own precedent from the last pass.** The original's
`playDay()` also captures a box score for the OWNER'S OWN club only (`G.box`), posts that day's home
gate revenue through the ledger (`gateDay`), and writes a wire event (`logEvent`) — none of those exist
yet to receive this (no owned-club concept, no ledger-integrated gate, no wire). This pass ports the
pure simulation half only: play every game on a day, update every club's record, return what was
played. `injuryPass`/`settleWeek`/`settleMonth` (injuries, the market, the winter cycle) are separate,
later passes, unchanged from ROADMAP.md's own ordering.

**Verified the way this session's whole engine has been verified — against reality, not against an
invented expectation, and at the largest scale that was actually cheap to run.** Rather than sample
(as `game.test.ts` did last pass, 500 games/level), this pass built the full real 218-club world, its
full real schedule, and played every single game on it — end to end, in under 3 seconds
(`packages/sim-kit/test/season.test.ts`):

- **Closed-system identities hold exactly, across all 218 clubs, not approximately:** total wins ==
  total losses == total games played; total runs scored == total runs allowed. Not a tolerance check —
  an exact equality, because a real closed league has no other way to balance its books.
- **Every one of 218 clubs lands on its exact published game count** — not re-verifying the schedule
  itself (that was D80's job), but confirming `playDay`'s cursor mechanics consume every scheduled game
  exactly once, dropping none and doubling none.
- **The full real 2,430-game MLB season reproduces RESEARCH.md §7.1 tighter than the prior pass's
  500-game sample, at every stat measured:** ERA 3.74% (was ~2-4% at 500 games, consistent), WHIP 0.48%
  (was ~4-5%), K/9 0.86%, BB/9 2.06% (still the same high-walks direction D82 already documented as a
  pre-existing, not-a-port-defect characteristic — just a smaller gap at full scale, as expected from
  more data averaging out sampling noise), BA 2.54%, OBP 1.75%, SLG 1.97%, **HR/9 0.06%** — essentially
  exact. All measured directly this pass, not assumed to improve with scale.

**What's still not built:** the owner's own club (no ownership concept exists to pick a rotation index's
"gp" from — every club in a `playSeason()` run advances identically), a season-reset/year-rollover
function (a fresh `buildWorld()` already zeroes every record, but nothing yet re-zeroes an EXISTING
world's records for year two), the injury/market/winter systems, and — still the standing gap this
session keeps naming — any of this wired to the UI or a real save. A season can be simulated end to
end for the first time in this rewrite; nobody has watched one happen yet.

---

## 2026-09-04 — State wiring: a game can be started, played, saved and reloaded

**D85 · `GameState` carries real types, `newGame()`/`advanceDay()` assemble and drive a save,
IndexedDB persistence exists (`idb`), and Office + Books are wired to real state — UI.md §13.3's own
signed-off checkpoint scope, "Office + Books," not a smaller or larger slice of it.**

**Scope discipline, restated because this pass is the first to touch `apps/web` since the original
chassis pass.** UI.md §13.3 explicitly requires the ledger pane to prove the grid engine this pass, and
explicitly defers Roster ("the propagation pass"). Both honored: the ledger pane is a real, working,
sortable, filterable grid; Roster/Standings/Schedule/Leaders stay dark, with their `lightsAt` text
corrected (§ below) to say what's actually still missing — a UI pass, not the underlying data, which
now exists for all of them.

**Adaptation, noted rather than silent: `GameState.club` (a duplicated `ClubRef` snapshot in the
original schema) is retired in favor of `ownedClubId: string | null`, a reference into `world.clubs`.**
`Club` now carries everything `ClubRef` did and more; a second copy that could drift from the record it
was copied from is exactly the kind of hidden state this package's other modules have been built to
avoid (world.ts's, schedule.ts's own notes). Look the owned club up by id — `selectors.ts`'s
`ownedClub()` does this once so pages don't each reinvent it.

**A genuine, deliberate improvement over the original, not just a port — the RNG stream is now fully
save-reproducible, closing a gap the original never closed.** The original's own `SIMR` reseeds from
`G.seed` on a NEW game but not on a LOAD, so a reloaded save drifts onto a different future than an
unbroken session would have played (HANDOFF.md's own "Known gaps" carried this forward as debt). This
port's `advanceDay()` (`advance.ts`) draws each day's games from a fresh RNG seeded by
`state.seed + that day's serial number` — mulberry32's own intended use for decorrelated per-item
streams from one base seed — so replaying the same day from a save always reproduces the same outcome,
with nothing about an RNG's internal counter needing to be part of the save at all. Verified directly:
`newgame.test.ts`'s "reproduces identically on a fresh 'reload'" test builds two independent states from
the same seed, advances both one day, and asserts byte-identical results.

**One real bug found and fixed before it shipped, not after — an IndexedDB connection leak that hung
`deleteDatabase` forever.** `save.ts`'s first draft cached one long-lived `idb` connection at module
scope. A real IndexedDB `deleteDatabase()` call against a database with an open connection blocks
(fires `onblocked`, waits) rather than erroring — so every test after the first hung for the full hook
timeout. Caught by the test suite itself timing out, not by inspection. Fixed by opening and explicitly
closing a connection per call (`withDb()`) — cheap enough at this call frequency (once per day-advance)
that the earlier caching bought a perf win nothing here will ever notice, at the cost of a correctness
bug real browsers would have hit too (a user closing and reopening a save-management screen, e.g.).

**A version mismatch caught before it cost a day, not after: `@tanstack/react-table`'s installed
version (9.x) turned out to be a genuine API rewrite from the well-established v8 shape** (`useTable`/
`createCoreRowModel`, not `useReactTable`/`getCoreRowModel`) **this project's own stack docs were
written against.** The Books ledger grid does not need it yet — the ledger has few or no rows without
the gate-revenue/payroll posting system (next pass), and UI.md §13.3 itself calls this pass's grid proof
"narrower" than the Roster pass's, where the column customizer, saved views and `@tanstack/react-virtual`
row virtualization get their real justification against a 26-column, many-row grid. Sort/filter are
plain React state instead — same user-facing result, no bet placed on an unfamiliar major-version API to
sort five columns of nothing. Revisit both libraries together when Roster actually needs them.

**Verified end to end, not just per-unit:** `packages/sim-kit/test/newgame.test.ts` (9 tests — an unknown
club id throws, a fresh world is real and complete, the owned club sizes to `OWNED_N` not `ROSTER_N`,
same-seed reproducibility, `scanNonFinite` clean, `advanceDay` mutates real records, `state.box` caps at
400, season-end handling) and `apps/web/test/save.test.ts` (4 tests — a real IndexedDB round trip, not a
mock of `idb`'s API, via `fake-indexeddb`). Then manually, in a real browser, screenshotted at every
step (not just asserted): the club picker showing all 30 real MLB clubs by real division: choosing NYY
generating a real world and a real opening-day schedule (`vs BAL · MAR 26`, the real 2026 slate); the
Office page showing real 0-0 standings; clicking Advance and watching NYY go 1-0, the standings and
streak update correctly, and the next scheduled game change; **reloading the page and getting a
byte-identical Office page back** — the save round trip, working, watched. Books verified the same way
across all five panes, all real and honestly near-empty. The full Playwright visual gate (UI.md §12) —
club picker, Office, Books — passes 24/24: 2 shells x 2 themes x 2 widths, zero console errors, zero
horizontal overflow.

**What's still not built:** the ownership ladder itself (an owner picks only among the 30 MLB clubs
today — the checkpoint's own stated target, not a smaller slice of it, but not the indy-to-MLB climb
either), a season-reset/year-rollover function, the decision queue ("Needs you"), the wire (news), and —
named explicitly as the very next pass, ranked first because Office/Books can't show anything real
without it — the `ECON`/gate-revenue/payroll posting system. The ledger engine has been real and tested
since the original chassis pass; nothing has ever posted to it. See `CHANGELOG.md` v2.6.0.

---

## 2026-09-04 — The money loop: gate revenue and payroll post for real

**D86 · `ECON`/`econFor`/`attFor`/`gateFor`/`gateDay`/`postMonth`/`seedOpeningBooks`/`rosterPayroll` are
ported into `economics.ts`, wired into `newgame.ts` and `advance.ts`, and Office + Books show real,
populated, audited financial data for the first time.** Books stops being "real but honestly near-empty"
(v2.6.0's own stated gap) and becomes real-and-populated, matching this pass's own ranking as the next
thing to build.

**A genuine environment gap, disclosed rather than worked around silently: `bush-league-v0.10.html` —
the primary source every prior pass this rewrite read code out of — was not available in this
container.** It was never committed to this git repository (confirmed: full history search, all 8 prior
commits, turns up nothing); it existed only as an attachment in an earlier session. Asked directly how to
proceed rather than reconstructing from memory and calling it a port: the answer was to reconstruct from
this session's own detailed working notes, explicitly flagged as such rather than presented as a verified
line-for-line port. `ECON`/`econFor`/`attFor`/`gateFor` (already fully drafted before the gap was hit)
carried through with high confidence; `gateDay`/`postMonth`/`seedOpeningBooks`/`rosterPayroll` are marked
in `economics.ts`'s own header as RECONSTRUCTED, not re-verified — a real, load-bearing distinction the
rest of this entry is largely about closing.

**The reconstruction found a genuine mechanism bug in its own first draft, caught by this pass's own
diagnostic run, not by inspection.** Every flat operating cost line was divided by `leagueMonths` (5-7
months, a league's own season length) but posted once per REAL calendar month (12/year) regardless of
season — a systematic 12/leagueMonths overcharge on every single line. A full simulated MLB year read
net income at **-$188M on ~$200M of revenue** — not "roughly zero," an order of magnitude broken. Fixed:
every flat revenue/expense line (`spons`/`staff`/`travel`/`stad`/`fo`/`mktg`/`ins`/`dev`/`minors`/`media`/
`dist`) now prorates over 12 real calendar months and posts every month, in-season or not — matching the
`ECON.MLB` tuning-target comment's own words, carried through from the reconstruction: winter "stadium and
front office" cost lands with no gate to offset it, which only holds if those lines keep posting through
the off-season.

**A second, much larger gap surfaced only after that fix: every one of the four independent leagues
tested netted roughly 80% of revenue as pure profit — an order of magnitude off "roughly zero" in the
OTHER direction.** Rather than accept this as an unresolvable consequence of the missing source, this
project's OWN committed historical record turned out to carry the real, sourced target: `CHANGELOG.md`'s
Build 0.7 entry ("THE ROSTER COSTS MONEY") and this file's own D42/D48/D49 state, in the original's own
words, **"all five [independent] economies... sit between −$385 and +$963 at .500."** Three further
direct confirmations from that same historical record, each closing a specific uncertainty this pass had
flagged as unverified:
- **D48, verbatim: "annual contracts spread over twelve months at MLB, monthly wages in season only below
  it."** The reconstruction had MLB payroll gated to in-season months, dividing by `leagueMonths` (7) —
  backwards from the sourced design. Fixed: `rosterPayroll` divides MLB by 12 and posts every month;
  every other level keeps the season-only, `leagueMonths` proration `contractFor` already established for
  indy contracts.
- **D49, verbatim: "`opScale` multiplies the operating cost lines only, never revenue... solved from the
  measured net, not picked."** Confirms `econFor`'s existing design (opScale scales
  staff/travel/stad/fo/mktg/ins/dev/gameday, never gate/conc/park/merch) needed no change — only the
  BASE figures and the per-league opScale VALUES did.
- **D42, verbatim on the Pecos floor: "Operating k ≈ 0.05; capital scaled separately at 0.10."** Confirms
  `PECOS_SCALE`/`PECOS_CAP_SCALE` (already reconstructed at exactly 0.05/0.10) needed no change either.

**Re-solved the same way D49 itself describes solving it the first time**: fit net income against win%
across several full-calendar-year simulated seasons per league, and read the intercept at .500. Binary-
searched a shared base multiplier for the seven flat INDY operating lines first (against the Frontier
League, ~10 minutes of simulated seasons across 7 iterations x 6 seeds), landing at **`INDY_OPEX_RECAL` ≈
11.465x** the as-reconstructed base — then each OTHER Partner League's `opScale` independently
(American Association 1.058 → 1.077, Pioneer 0.879 → 0.895, Atlantic 1.076 → 1.292, Pecos 0.965 → 0.895;
Frontier's own opScale, 0.883, is unchanged — it is the league the base was solved against directly).
Verified on seeds the solve never trained on (10-12, held out from the [1-4] solving seeds): every league
lands within roughly 14 points of revenue on its worst held-out seed and within 10 points on its
three-seed average — Frontier +1.5%, American Association +9.1%, Pioneer +1.7%, Atlantic −1.4%, Pecos
+4.3% — an order of magnitude closer than the ~80% pre-recalibration margin, though a real, honest
remaining gap from the sourced target's own tight sub-$1K band, attributable to how much a single random
25-man roster's payroll swings seed to seed rather than a mechanism defect.

**MLB itself was NOT re-solved the same way, and that asymmetry is deliberate, not an oversight.** Once
MLB payroll was correctly fixed to post over all 12 months (the D48 correction above), a full calendar
year measured EXACTLY (not the earlier, looser un-bounded read — see below) reads **net income averaging
-21.1% of revenue across five seeds (worst seed -32.1%)** — worse than an earlier, looser reading of
-6.9%, and that earlier number is now understood to have been two bugs partly cancelling (the
12/leagueMonths overcharge fixed above, plus MLB payroll's own in-season gating under-counting it by
about 1/7 of a year), not a correct result. Unlike the independent leagues, there is no equally precise
SOURCED dollar target for MLB in this project's own historical record — only the qualitative "nets
roughly zero" — and the gap traces mostly to `contractFor`'s MLB salary curve (a DIFFERENT, already-
ported-and-verified system from an earlier pass, v2.4.0/D82) pricing a random 40-man roster higher, on
average, than `ECON.MLB`'s reconstructed revenue figures cover. Re-tuning that curve is out of this
pass's scope; re-tuning `ECON.MLB`'s own revenue/cost figures against a target this project has not
sourced would be inventing a number, not reconstructing one. Recorded here as a real, disclosed,
quantified gap rather than silently loosened test tolerances or an unsourced "fix."

**A genuine measurement-methodology bug this pass's own verification caught in itself, not in the
engine**: `economics.test.ts`'s first version measured a "full calendar year" by reading whatever
`incomeStatement` found across the WHOLE ledger after a fixed 400-day `advanceDay` guard — which, once
MLB payroll posted every real month instead of being in-season-gated, could span a 13th partial month and
overcount a seed's margin. Fixed: net income is now measured over an EXPLICIT 365-day window from the
game's own opening day (`oneYearMargin`), not "whatever accumulated." The mechanism was right; the test's
own measurement window was not — worth recording because it is exactly the kind of self-inflicted
methodology bug that would otherwise look like a real economic finding.

**`newgame.ts` gained real scope it was missing, found while reading this pass's own working notes on the
original's new-game flow**: the game now opens 14 days before the earlier of the owned club's own season
window or the world's earliest scheduled game (not on the world's earliest game directly, v2.6.0's
placeholder); `state.season.open`/`close`/`worldOpen` are real, set from `seasonWindow()`; the owned
club's `cap` is overridden with `econFor()`'s own figure rather than left at the world-gen default;
`ticketPrice`/`payrollBudget` are new top-level `GameState` fields (owner settings that used to live on
the retired `ClubRef` snapshot, D85); and `seedOpeningBooks` posts three real opening journal entries
(owner equity, note payable, ballpark & equipment capitalization) dated before the season starts, without
which the ledger opened at $0 and the first month's payroll and stadium cost posted the club straight
into a negative balance before a single game was played.

**Verified, not assumed, at every layer**: `packages/sim-kit/test/economics.test.ts` (6 tests) — the
ledger stays balanced (`auditBooks`: 0 fails) mid-run and at year end across several MLB seeds; cash never
collapses to a catastrophic negative (the opening-capital seed covers the pre-season runway); MLB net
income lands within a bounded, honestly-wide margin of the tuning target (not an order-of-magnitude miss)
across 5 seeds; the MLB local-media receivable (account 1100) stays bounded to roughly one month's accrual
— accrued, collected with a one-month lag, never unbounded; all five independent leagues stay balanced,
solvent and finite; all five land within a bounded margin of revenue on held-out seeds. Manually, in a
real browser (temporary Playwright spec, screenshotted and looked at, then deleted per this project's own
D16 discipline): a fresh save's ledger seeded with three real opening entries before a game is played;
advancing 45 days produces real gate-revenue entries per home date with real attendance figures, real
monthly operating-cost entries, a real income statement with a real revenue/expense breakdown, a real
balanced balance sheet ($648.04M assets = $340.00M liabilities + $308.04M equity), and `auditBooks`
reading PASSES at 48 entries / 144 lines — at both 1440px and 360px, both shells, both themes, zero
console errors, zero horizontal overflow.

Rejected: silently accepting the reconstructed dollar figures without checking them against anything
(would have shipped an ~80%-margin INDY economy and called it "ported"); inventing a precise MLB
correction with no sourced target to solve against (would have been indistinguishable from a guess dressed
up as a fix); hiding the missing-primary-source gap by presenting the reconstruction as a verified
line-for-line port. What's still not built: player development/ageing, scouting/the draft, the ownership
ladder past "pick one of 30 MLB clubs," a season-reset/year-rollover function, and a monthly scouting cost
line (account 5300 exists in the chart of accounts; no dollar figure for it survived into this
reconstruction — left unposted rather than invented, a real gap for whoever sources one). See
`CHANGELOG.md` v2.7.0.

---

## 2026-09-04 — Player development and ageing, and the minimal rollover that lets a save reach it

**D87 · `development.ts` gives every player real, sourced, component-specific aging — not a port
(`bush-league-v0.10.html` never built this either), new logic built the way this project is supposed to
build anything: research first, engine second — and `rollover.ts` provides the minimal season-to-season
mechanism a save needs before ageing can ever actually matter during play.**

**The gap this closes was named directly, not inferred**: RESEARCH.md §8.5, "now the binding gap" —
"players age and nothing else... it makes a long career impossible rather than merely inaccurate."
`Player.age` was a plain integer, set once at `makePlayer()` and never incremented anywhere in this
rewrite; `Player.tru` (the hidden true grades Law 10 protects) never moved. A 22-year-old prospect and a
38-year-old veteran with the same true grades were, mechanically, the same player forever.

**Eleven tools, two of them role-aware, each individually cited to RESEARCH.md §18** — not a single
aggregate "gets worse with age" curve, the component-specific system §8.5 explicitly asked for
("power peaks later than speed; control later than stuff"). Peak ages and DIRECTIONS are real, sourced
findings (§18.1-§18.3): speed peaks earliest (~23) and falls hardest; power peaks next (~26) and declines
faster than contact or plate discipline (~29, the most stable hitter family); pitch movement (spin-
derived) is dramatically more stable than raw velocity/stuff, matching §18.3's own finding that spin
"declines much slower, proportionally, than velocity"; and pitcher CONTROL is genuinely role-aware —
starters' walk rate "improves to ~24, then flat" while relievers' "rises from the outset, full increase
reached by 30" (§18.3) — opposite shapes, not just different rates, and the one place this port could
actually encode a real, sourced, non-obvious distinction the original build never had a chance to build
either.

**The exact annual grade-point magnitudes are this pass's own reconciliation, disclosed as such rather
than presented as equally sourced** — `development.ts`'s own header states this plainly, echoing §18.5's
own methodology note ("a scattered patchwork... necessarily reconciling inconsistent independent
estimates rather than citing one authoritative table"). Most of §18's findings are in units — DRS points,
sprint-speed percentile bands, SLG points/season — with no existing conversion to this engine's 20-80
grade scale; inventing eleven precise new conversions would have been spurious precision the source
material doesn't support. The one tool with an existing, already-verified conversion (`grades.ts`'s
`FB_PTS`: fastball velocity, 60 grade points spans 11.5 mph) anchors `stf`'s own rate — the most precisely
reasoned of the eleven. `arm` has no dedicated aging study anywhere in the public record (§18.5, checked
directly, none found) — modelled on `def`'s own sourced curve as the closest disclosed proxy, stated
plainly rather than left unexplained.

**Verified against the sourced findings' own SHAPE, not chased for an exact replica of any one published
number** (`development.test.ts`, 8 tests, a 2,000-3,000-player simulated population aged from 20 to 40+
so the population MEAN's own noise floor is small enough to read a real signal): speed peaks before power,
which peaks at or before contact/plate discipline — the sourced ordering, reproduced directly; pitch
movement swings far less over a full career than raw stuff/velocity; starters' control trends up through
the 20s while relievers' trends down over the identical span **from the same starting population** (same
RNG seed feeding both role variants, isolating the role effect from the noise) — confirmed opposite in
sign, not just different in magnitude. A quick diagnostic run (not part of the permanent suite, deleted
after) printed the actual measured peak ages against the sourced targets before trusting any of this:
hit@29, pow@26, eye@29, spd@23, def@26, arm@25, SP stf@26, SP mov@27, SP ctl@24, SP sta@28, SP dur@27 —
every one landing exactly where its curve was designed to, and RP ctl declining monotonically from age 20
as designed (no growth phase at all, matching "rises from the outset").

**`rollover.ts` — deliberately NOT the original's own winter system, and the scope boundary is the whole
point of the file, stated in its own header.** `bush-league-v0.10.html`'s Build 0.9 ("THE WINTER" —
`CHANGELOG.md`'s own historical entry) is free agency, contract expiration, an age-curve population exit,
a demand-sized amateur intake, an exclusive re-sign window and a four-month open market — real, substantial,
separately-scoped future work (`ROADMAP.md`'s "the market"/"the winter cycle"), not something this pass
attempts or fakes a smaller version of. `startNewSeason(state, r)` does exactly three things: ages and
develops the EXISTING population in place (`development.ts`), resets every club's season record to a
fresh zero (the same fields a brand-new `buildWorld()` already zeroes), and regenerates the schedule for
`year + 1`, jumping the clock to 14 days before the new season's own opener — the identical convention
`newgame.ts` already established for a save's first day, reused rather than re-invented. No player enters
or leaves the world.

**That simplification has a known, disclosed consequence, verified directly rather than assumed away**:
`rollover.test.ts`'s own last test proves a club's average roster age climbs monotonically across four
consecutive rollovers with no churn to offset it — the SAME "closed population under an age rule has
exactly one destination" finding `CHANGELOG.md`'s Build 0.9 entry already recorded from the original
build's own history, reproduced here on purpose, as a stated fact about what this pass does and does not
solve, not rediscovered as a surprise later. Retirement is not modelled either — no sourced retirement-
hazard-by-age curve exists anywhere in this project's research (§8.5 asks for one; none found) — a real,
disclosed gap, not an invented number standing in for one.

**Scope, stated plainly: sim-kit only, no UI wiring this pass.** `startNewSeason` is a real, tested,
callable primitive — `advanceDay` itself never calls it automatically (would silently change an
already-tested contract, `newgame.test.ts`'s own "advancing past the end of the schedule reports
seasonOver and stops finding games" test, for no reason this pass needs). A UI affordance ("Season over —
start a new one") is the natural next integration point, deferred the same way several earlier passes
this rewrite shipped sim-kit-only work verified by tests before a UI pass touched it (v2.1.0 through
v2.5.0, per their own `CHANGELOG.md` entries). Bundle size is unchanged (356.14 KB → 356.34 KB) —
confirms neither file is dead-imported into `apps/web` yet, consistent with that scope.

Rejected: inventing precise unit conversions for tools with no sourced numeric scale (would have been
spurious precision); silently porting `bush-league-v0.10.html`'s own winter system's SHAPE without its
substance (a fake age-and-nothing-else "rollover" that still looked complete); hiding the closed-population
consequence behind a test that only checks the mechanism works once rather than what it does across
several consecutive years. What's still not built: retirement, free agency/contract expiration/an
amateur intake (the actual fix for the disclosed closed-population consequence), and the UI affordance to
reach `startNewSeason` from the app at all. See `CHANGELOG.md` v2.8.0.

---

## 2026-09-04 — A save can actually reach its second year, from the app

**D88 · `startNewSeason` (D87) gets a real caller: the action bar detects an exhausted schedule and offers
to roll into the next year, wired through a new `gameStore.startNewSeason` action.** D87 shipped a real,
tested `sim-kit` primitive with nothing in `apps/web` calling it — the immediate next item on its own
"what's still not built" list. This closes it: the smallest, most self-contained item left over from the
money-loop/development passes, finished before starting the larger real-roster-churn/scouting work
`ROADMAP.md` ranks next, matching this project's own "one system per pass, fully finished" discipline
applied to a loose end rather than a brand-new system.

**Detection is a direct state check, not threaded through the last advance result.** `ActionBar.tsx`
computes `state.sp >= state.sched.length` itself — the identical condition `advanceDay`'s own
`AdvanceResult.seasonOver` already reports — rather than reading `lastResult.seasonOver`, which is `null`
on a fresh page load (a reloaded save has no `lastResult` yet, only ever set by calling `advance()` in the
current session) and would have left the bar stuck showing "Advance to..." for a save that reloads
already at season's end, silently unreachable until the owner clicked Advance once first. Recomputing
directly from `state` avoids that whole class of staleness.

**The rollover RNG is seeded from `state.seed + state.season.year`, matching the pattern `advance.ts`'s
own day-scoped RNG already established** (`state.seed + that day's serial number`) for exactly the same
reason: a reload before this year's rollover reproduces the identical next season on replay, the save
staying fully reproducible the same way the season-play RNG already is (D85).

**A design decision worth stating rather than assuming: `apps/web`'s own `startNewSeason` action is
distinct from `sim-kit`'s `startNewSeason` (imported under an alias, `rollIntoNewSeason`), matching this
file's own existing `newGame` -> `startNewGame` / `advanceDay` -> `advance` naming convention** — every
store action already wraps its sim-kit primitive under a different name; this one keeping the SAME name
as its primitive would have been the one exception, not a deliberate one.

**Verified at every layer this pass's own discipline requires**: a new `apps/web/test/app.test.tsx` case
fast-forwards a REAL `sim-kit` state to `seasonOver` directly (not by clicking Advance ~200-400 times
through a simulated DOM, which `rollover.test.ts`'s own timing already shows costs several seconds even
running pure JS with no rendering at all), renders the real `<App/>`, clicks the real button, and asserts
the bar reverts to a real "Advance to" control with a fresh 0-0 record — exercising the actual React
component tree and zustand store this time, not `sim-kit`'s primitive in isolation (already covered by
`rollover.test.ts`). Then manually, in a real browser (temporary Playwright spec, screenshotted and
looked at, then deleted per D16): clicked "Advance" up to 400 times against a real preview server until
the button read "START THE 2027 SEASON", screenshotted it at 360px specifically because its label is
longer than the ordinary "ADVANCE TO ..." button ever gets — zero horizontal overflow, zero console
errors — then clicked it and watched cash carry over ($232.08M, unchanged — rollover never touches the
ledger), every club's record and last-10 reset to a genuine 0-0/"No games played yet", the date jump to
March 12, 2027 (14 days before the new season's own opener, the identical convention `newGame()` already
established), and the button revert to a real "ADVANCE TO MAR 12 · VS ATH" — a real opponent, from a real
regenerated schedule, not a stub.

Rejected: reading `lastResult.seasonOver` instead of recomputing from `state` (the reload-staleness bug
above); giving the new store action and its sim-kit primitive the same name (would have broken this
file's own established convention silently). What's still not built: everything D87 already disclosed
(retirement, free agency/contract expiration, an amateur intake) — this pass closes only the UI-reachability
gap, not the underlying closed-population consequence. See `CHANGELOG.md` v2.9.0.

---

## 2026-09-04 — Real roster churn: the population stops marching uniformly older forever

**D89 · `churn.ts` closes the exact gap D87 measured and disclosed rather than solved — with no
turnover, a rolled-over population ages uniformly forever, "the same closed population under an age rule
has exactly one destination" finding `CHANGELOG.md`'s own committed Build 0.9 entry records from the
original build's own history.** `rollover.ts`'s `startNewSeason` now ages, develops, AND churns every
club's roster in the world each year — some contracts expire and the player leaves outright, of those who
don't some are retained onto next year's roster, and the rest is filled exactly the way a brand-new
world's ever was (`roster.ts`'s already-tested `rosterPlan`/`contractFor`), so a churned indy roster stays
exactly as legal-by-construction as a freshly-generated one.

**Deliberately a smaller slice than the original build's own Build 0.9, stated in `churn.ts`'s own header
rather than left to be discovered later.** Build 0.9 is a full annual cycle: weekly in-season contract
purchases by affiliated organisations, an exclusive re-sign window, a four-month open market with AI GM
valuation and negotiation, and a demand-sized amateur intake. Free agency — the owner (and every AI club)
actively signing and releasing SPECIFIC players by name, mid-season — is real, substantial, UI-shaped work
of its own (a market/free-agent screen with no home yet) and stays with the scouting/draft/ownership-ladder
pass ROADMAP.md already tracks separately. This pass ships only the population-turnover mechanism: an
age-curve exit, an instant retention step standing in for the "exclusive re-sign window," and fresh
signings for whatever's left.

**Re-solved against a real, sourced numeric target found in this project's own committed historical
record — the same discipline the economics pass's INDY recalibration already established (D86), applied
here to a second system.** `CHANGELOG.md`'s Build 0.9 entry states its own measured outcome directly,
after ten simulated years of the original build: median Frontier age **26** (real 24-25), **14.6%** aged
28+ (real 15%), **2.4%** aged 30+ (real 2%, "rulebook allows 8%"), **32.6%** roster continuity (real
24-41%). `exitProbability`'s two constants (a flat floor below age 26, a rising slope past it — the same
pivot age `roster.ts`'s own `SVC_EDGE` centres on, and Build 0.9's own "discount per year over 26"
language) were fit by iterate-and-measure against three of those four targets — median lands at exactly
26 every single year across six consecutive rollovers; aged 28+ averages in the high teens against a
14.6% target; roster continuity averages ~44% against a 24-41% target range (running somewhat above it,
not further tuned away — see below).

**One target is structurally unreachable by this port's own design, and that's a real finding, not a
tuning failure — worked out and disclosed, not fudged.** The Frontier League's own published composition
table (`world-data.ts`, already real and already tested for a fresh world — `roster.test.ts`) reserves
EXACTLY 2 of 25 roster spots for its Veteran class (age 30-34) — 8.0%, a REQUIRED count `rosterPlan` fills
every single year, churn or not, not a maximum. That 8.0% is precisely the "rulebook allows 8%" ceiling
Build 0.9's own measurement table already names as distinct from what the original's own population
actually reached (2.4%) — meaning the original's own veteran slots were not always filled at the top of
their published range, a nuance no longer verifiable without the primary source (`bush-league-v0.10.html`,
still not available in this container — HANDOFF.md's own "Waiting for you" item 4). Weakening the
retention match to chase 2.4% would mean generating a roster that ISN'T legal-by-construction on the one
dimension this port can currently prove it is — the wrong trade for a number this project cannot re-verify
against ground truth right now. Measured, understood, and left as a disclosed 8.0%, not asserted against.

**Continuity running above the sourced band (~44% average vs. a 24-41% target) is real and understood,
not unexplained.** Raising `EXIT_BASE` from 0.34 to 0.42 barely moved it — confirming the bottleneck is
which comp row a survivor's post-rollover age/service time still fits, not the exit hazard's own survival
rate. Tightening that match further to force continuity down would trade away the SAME legal-by-
construction guarantee the 30+ finding above already explains is load-bearing. Left as a modest, disclosed
overshoot rather than chased with a change that would cost more than it fixes.

**Verified, not assumed, at every layer**: `packages/sim-kit/test/churn.test.ts` (5 tests) —
`exitProbability`'s own shape (flat to the pivot, rising past it, always in [0,1]); the Frontier League's
median/28%+/continuity against the sourced target across six consecutive rollovers; the 30+ finding
landing at exactly the composition table's own 2/25 share, every year, not approximately; the world's
total population size staying exactly constant across a churned rollover; the owned club still getting its
bigger `OWNED_N` roster, not the plain `ROSTER_N`, after churn. `rollover.test.ts`'s own D87-era tests
updated for the new reality: "ages every player by exactly one year" now correctly distinguishes SURVIVORS
(who age +1, per `development.ts`) from FRESH ARRIVALS (who never had a "before" age to compare against —
the previous version of this test would have failed the moment churn started generating real replacements,
exactly the assertion-rot this project's own discipline exists to catch); the old "climbs monotonically"
test (a deliberately-disclosed FINDING under D87) is replaced with one proving the opposite now holds —
average age STABILIZES across eight consecutive rollovers instead of climbing every single year. Manually,
in a real browser (temporary Playwright spec, screenshotted and looked at, then deleted per D16): played a
full season to exhaustion, clicked "start the next season" (now running `churnWorld` across all 218
clubs), watched the new season open with a real 1-0 record after one game, a real next opponent, real
division standings, cash carried over correctly — no console errors, no crash, at the scale of the whole
world's population turning over at once.

Rejected: loosening comp-row retention matching to chase the 2.4%-aged-30+ figure exactly (would have
traded away an already-proven legality guarantee for a number this project cannot currently re-verify);
building the full Build-0.9-equivalent winter cycle in this pass (free agency, a market screen, AI
negotiation — real, separately-scoped future work); silently asserting the churned population "matches
the original" without checking, the same discipline that caught the INDY economics gap in the prior pass.
What's still not built: free agency (the owner or any AI club acting on a specific player by name),
retirement as its own concept (the exit hazard covers the same real-world outcome without pretending to
model it separately), and the amateur draft. See `CHANGELOG.md` v2.10.0.

---

## 2026-09-04 — Scouting: a real monthly cost, and the dead half of D24 finally reads

**D90 · A club-level scouting budget closes two disclosed gaps at once — `economics.ts`'s "no monthly
SCOUTING cost is posted" (D86) and a genuinely NEW finding this pass surfaced: `refineScout` was only ever
called ONCE per player, at roster construction, so D24's whole sample-size-driven reliability mechanism
never actually re-read a player's accumulated season stats after his roster was built.** Confirmed by
grep before writing a line of code, not assumed: `refineScout`'s only callers anywhere in the engine were
`roster.ts`'s fresh-world build and `churn.ts`'s fresh signees — both called once, before a player had
played a single game that season. `p.rel`/`p.ovr`/`p.pot` were frozen from day one of a save's own
roster-build until the next winter's churn regenerated the player outright. `advance.ts` now recomputes
`refineScout` for the OWNED club's own roster on every real month crossing — the same "only ever resolves
for the ONE owned club" performance pattern `economics.ts`'s own header already established for this
file — so a season's worth of real plate appearances and innings pitched actually reaches the reliability
number for the first time.

**Scope, decided and confirmed with Jordan before any code was written (not assumed): scouting only, not
the amateur draft or the ownership ladder.** `FRONT-OFFICE-DESIGN-PROPOSAL.md` is explicit that it's
unsigned and gates staff/ladder work on resolving its own §1 question first; the draft needs an
amateur-talent-pool generator that doesn't exist yet as its own system. Building either inside this pass
would have meant guessing past an open gate this project's own docs already flag, or inflating a
well-scoped pass into an unscoped one. Both stay explicitly deferred, same discipline `churn.ts` (D89)
already used to defer free agency.

**Mechanism: a bounded ADDITIVE reliability term, not a replacement for D24's sample-size mechanism.**
`scoutBoostFor(spend, baseline)` (`scouting.ts`) returns 0 at zero spend, rises to a max of 0.12 by twice
the level's own baseline scouting budget, and is added to `refineScout`'s existing formula BEFORE the
same [0.15, 0.93] ceiling D24 already established — a maxed-out scouting department cannot buy a player
past the same ceiling a maxed-out sample size already can't cross. Matches
`FRONT-OFFICE-DESIGN-PROPOSAL.md` §3's own bound language for a scouting-director hire ("tightens toward,
never below... scouting gets you clarity, not certainty"), applied here to a budget dial instead — no
staff-hiring UI exists yet to apply it to a hire directly.

**`Economy.scouting` is a genuinely invented T3 dollar figure, same status as every other flat cost line
in `economics.ts` — disclosed, not silently upgraded.** RESEARCH.md §17.5 confirms staff cost at this
scale is not published anywhere. Sized deliberately small relative to `dev` (player development) — a real
indy-ball scouting operation is a couple of area scouts and a truck, not a farm department — and
deliberately EXCLUDED from `INDY_OPEX_RECAL`: that multiplier was empirically solved (D86) against a
sourced net-income target measured before any scouting cost existed; folding a new line into an
already-fitted multiplier would silently redistribute weight the fit was never asked to carry. It IS
scaled by each independent league's own `opScale` and by `PECOS_SCALE`, the same as every other flat cost
line already is.

**Re-measured against `economics.test.ts`'s existing sourced-target tolerances rather than assumed safe —
confirmed with a temporary diagnostic run, not guessed.** Adding the new cost shifted MLB's average margin
from -21.1% to -23.8% (bound: <30% avg, <40% per seed) and moved the five independent leagues' averages to
+5.3%/+6.3%/+2.3%/0.0%/+4.1% (bound: <12% avg, <20% per seed, each still comfortably inside). The shift is
NOT uniformly "more negative by the new cost's own weight" — American Association's own average actually
IMPROVED between the two measurements (+9.1% to +6.3%) — a real, disclosed reminder that this project's
own measured-number comments drift slightly pass to pass even where a change doesn't touch a given seed's
game outcomes at all (`contractFor`/`buildRosters`, which set payroll, are untouched by this pass); both
measurements land in the same neighbourhood, comfortably inside bounds that exist to catch a BROKEN
mechanism, not to police exact reproduction of one historical run. `economics.test.ts`'s own comments were
updated to the newly-measured numbers rather than left to go stale.

**A real, positive, UNPLANNED emergent effect discovered while writing the verification, not designed in
advance — disclosed rather than silently relied on.** `roster.ts`'s `chartClub` sorts by `p.ovr` (the
SCOUTED overall, not the true one) to build every lineup, rotation and bullpen order, and `chartWorld`
recomputes it fresh from current `state.players` on every single `advanceDay` call. Because a scouting
boost shrinks `estOf`'s noise band, a well-scouted club's `p.ovr` tracks its players' true talent more
closely, sooner in a season, than an unscouted club's — meaning real spend can measurably improve WHO
ACTUALLY PLAYS, not just a displayed number. This is exactly the effect
`FRONT-OFFICE-DESIGN-PROPOSAL.md` §3 describes for a scouting director ("how fast a prospect's true grade
becomes visible") landing for free from a much smaller mechanism than a full staff system — but it also
means an otherwise-identical scouted-vs-unscouted state comparison is NOT a strict per-player guarantee
(a scouted club's different depth-chart calls change who accumulates playing time, decoupling any one
player's own sample between the two runs) — `scouting.test.ts`'s own integration test checks the robust,
population-level claim (average roster reliability, not a per-player ordering) for exactly this reason,
recorded there rather than only here so a future reader hits the explanation at the point the test's
design looks surprising.

**No owner-facing UI control exists yet to move `scoutingBudget` off its level-default value — a real,
disclosed gap, not an oversight.** `payrollBudget`/`ticketPrice` (D85) already established the precedent
that an owner-setting `GameState` field can exist, sensibly defaulted, without a UI control — this field
follows the same shape but is NOT inert like those two: `advance.ts` reads it for real every month
crossing, both for the ledger posting and the reliability boost. UI.md's own Office spec (§13.1, Jordan's
sign-off) is a fixed six-panel layout with no room for a new panel, and no Settings/owner-controls surface
exists anywhere in the app yet to host an editable input instead — inventing one now, for this field
alone, would be new UI precedent bigger than this pass's own scope. What the pass DOES deliver needed zero
new UI code at all: Books' Income pane already itemizes every ledger account generically
(`accountName()`/`LineRows`, `BooksPage.tsx`), so "Scouting" appears there automatically once posted —
confirmed in a real browser, not assumed (temporary Playwright spec: advanced a real save through a real
month crossing, opened Books' income pane, screenshotted, and read "Scouting $75K" printed plainly
alongside every other expense line — then deleted the spec per D16).

**Verified, not assumed, at every layer**: `packages/sim-kit/test/scouting.test.ts` (10 tests, new) —
`scoutBoostFor`'s own shape (zero at zero spend/non-positive baseline, monotonic, saturates at exactly
0.12 by 2x baseline); `refineScout`'s new term defaults to 0 (every existing caller unaffected), measurably
raises reliability for an identical sample, never breaches the existing [0.15, 0.93] ceiling even at
maximum boost and a huge sample, and still leaves a near-zero-sample rookie clearly uncertain even at
maximum boost; idempotent recomputation. Three end-to-end tests through the real `advanceDay` path: a real
monthly posting lands on account 5300 and leaves every OTHER club's reliability frozen exactly where
world-construction's own one-time `refineScout` call left it; a real season of accumulated plate
appearances measurably raises `p.rel` for the owned roster where before this pass it never moved past
day one; a scouted state's average roster reliability is measurably higher than an otherwise-identical
unscouted one. `newgame.test.ts` extended to assert `state.scoutingBudget > 0` on a fresh save, the same
check already established for `ticketPrice`/`payrollBudget`. `economics.test.ts`'s existing six tests
re-run and re-measured (numbers above); full workspace suite (265 sim-kit + 8 apps/web tests), typecheck,
build, and the 24-test Playwright visual gate all pass; manual browser verification as described above.

Rejected: folding `scouting` into `INDY_OPEX_RECAL`'s existing multiplier (would silently redistribute an
already-fitted multiplier's weight onto a line it was never solved against); a full scouting-director/
area-scout staff system (real, substantial, UI-shaped work that stays with
`FRONT-OFFICE-DESIGN-PROPOSAL.md`'s own still-open §1 gate); building a new owner-settings UI surface just
for this one field (bigger than this pass's own scope, and `payrollBudget`/`ticketPrice` already establish
that an un-wired-to-UI owner setting is an accepted, disclosed shape in this project); asserting a strict
per-player reliability ordering between a scouted and unscouted state (a real emergent lineup-selection
effect makes that claim false, not the weaker population-level one this pass actually checks). What's
still not built: the amateur draft, the ownership ladder, staff hiring of any kind, and an owner-facing
control to actually move the scouting dial. See `CHANGELOG.md` v2.11.0.

---

## 2026-09-04 — Real minor-league parent affiliation, researched and sourced, closing a standing gap

**D91 · Before starting the amateur draft (the standing next ROADMAP item), a real blocker surfaced and
was resolved rather than guessed past: this project never recorded which MLB organization owns which of
the 120 affiliated MiLB clubs `buildWorld` already generates.** `world-data.ts`'s own header had flagged
this explicitly since an earlier pass: "Parent-club affiliation... is an open gap, not researched,
therefore not asserted" — and a real draft needs to place picks into a specific affiliate level, which
needs exactly this mapping. Rather than invent one, guess past it, or build a draft with nowhere real for
picks to go, this pass did the research and shipped the mapping as its own real, sourced, disclosed
deliverable — the draft itself stays a following pass's work (see "Rejected" below on why splitting these
two was the right call, not scope-timidity).

**Sourced, not invented — RESEARCH.md §2.6.** Per-league Wikipedia membership tables (International,
Pacific Coast, Eastern, Southern, Texas, Midwest, South Atlantic, Northwest, California, Carolina, Florida
State — fetched one league at a time), cross-checked against MiLB.com/MLB.com press releases for every
2024→2025 and 2025→2026 rename or relocation found, AND cross-checked a second, independent way against
`world-data.ts`'s own pre-existing (separately-sourced, §2.1) 120-city inventory. City/level/league
placement — the only part that's load-bearing for this port, since `Club.name` is empty for every MiLB
club — is T1, corroborated two independent ways for all 120 pairings. Exact franchise nicknames (colour
only, read by nothing in the sim) are T2, spot-checked rather than each individually re-verified.

**A real, dated boundary was found and resolved deliberately, not by accident: 2025 and "current" (2026)
differ in 5 of 120 slots**, all real relocations (Orioles High-A Aberdeen→Frederick, Brewers Single-A
Zebulon→Wilson, and a 3-way California League domino — Dodgers/Angels/Mariners Single-A). This project
uses the CURRENT column: it's the one that actually keys against `world-data.ts`'s already-existing 120
city slots (Aberdeen/Zebulon/Modesto appear in none of them; Frederick/Wilson/Ontario do). Using the
literal 2025 mapping instead would have left three of this project's own already-generated clubs
parentless while producing three assignments pointing at clubs that don't exist in this world at all —
diagnosed and avoided, not discovered as a bug after shipping.

**One city of 120 could not be matched and is left unassigned rather than guessed: "Hill City"**
(`world-data.ts`'s Single-A Carolina League list). Every other real 2025/2026 Carolina League member
matched cleanly; the real 12th member (Down East Wood Ducks, Kinston NC) doesn't appear anywhere in
`world-data.ts`'s own city list, and nothing found this pass explains "Hill City" as a real market. Most
likely a pre-existing data question in `world-data.ts`'s own Carolina League entry, predating this pass —
flagged for whoever picks it up, not silently corrected (out of THIS pass's scope, which is adding parent
data, not re-auditing §2.1's own city inventory) and not silently assigned a guessed parent either.

**Implementation: `MILB_PARENT` (`world-data.ts`), a `${level}:${city}` → MLB-abbr lookup, feeding a new
optional `Club.parent` field (`world.ts`) set once in `buildWorld()`.** Keyed by level, not bare city,
for the same reason `buildWorld`'s own abbreviation pools already are: "Columbus" is Cleveland's real AAA
affiliate AND (a different real city) Atlanta's real AA affiliate — colliding only if the key drops the
level. `Club.parent` is `undefined` for MLB/INDY clubs (no parent of their own) and for the one disclosed
Hill City exception, never an empty string or a placeholder value standing in for "unknown."

**A real defect, caught by the test suite exactly the way this project's own discipline is supposed to
work, not by inspection.** The first version of `MILB_PARENT` silently dropped the Chicago Cubs' entry in
all four levels while being hand-transcribed from the research findings — `world.test.ts`'s own new
"every MLB club owns exactly one affiliate per level" assertion failed immediately (5 unparented clubs
found, not the expected 1), diagnosed to the exact four missing rows, and fixed before this pass closed.
Recorded here as the discipline working, not as a mistake to gloss over — this is precisely why "hand-
transcribe a large sourced table, then let a real assertion check every row" beats "hand-transcribe and
trust it."

**Verified, not assumed**: `world.test.ts`'s new tests — 119 of 120 affiliated clubs get a parent id that
resolves to a REAL MLB club generated in the SAME world (no dangling references); the one exception is
exactly "Hill City" at Single-A, not a silent gap anywhere else; every one of the 30 MLB clubs owns
exactly one AAA, one AA, and one High-A affiliate, and exactly 29 of 30 own exactly one Single-A affiliate
(the 30th being whichever org would have owned Hill City). Full workspace suite (269 sim-kit + 8 apps/web
tests) passes, typecheck clean, build succeeds, 24/24 Playwright visual gate passes.

**This pays off twice, not once.** It's the correct foundation for the amateur draft (a pick needs
somewhere real to go) AND separately closes ROADMAP.md's own long-standing "the Organization page stays
dark until [parent affiliation] is [researched]" blocker — no Organization page exists yet to light up
with it, but the data dependency that was blocking it is gone.

Rejected: building the amateur draft in the SAME pass as this research (the draft is real, substantial
work of its own — an amateur-talent-pool generator, draft order and the sourced top-6 lottery, 20 rounds —
and bolting it onto a research pass would either rush the research or bloat the pass; the "one system per
pass, fully finished" discipline this project has kept since D86 applies here too, even though "the
research" doesn't look like a traditional "system"); using the literal 2025 mapping over the current one
(would misalign three real clubs already in this world against clubs that don't exist in it, explained
above); silently correcting "Hill City" to a guessed real city (would be exactly the kind of invented fact
this project's whole discipline exists to prevent — flagged instead). What's still not built: the amateur
draft itself (now unblocked), the Organization page (no page exists, separate UI work), the ownership
ladder, and everything else `DECISIONS.md` D90 already listed as outstanding. See `CHANGELOG.md` v2.12.0.

---

## 2026-09-04 — Every CI run since the rewrite began had been failing, silently, until asked to check

**D92 · Asked "is there anything I can test play," the honest first step was checking whether the
GitHub Pages deploy this project's own CI is supposed to produce actually exists — it did not, and had
never once succeeded.** Every workflow run from the very first rewrite commit (v2.0.0) through v2.12.0 —
14 runs, the entire history of this project's CI — shows `conclusion: failure`, confirmed directly via the
GitHub API, not assumed from "the workflow file looks right." Because the `build` job's own test-failure
short-circuits the pipeline before the `build`/`deploy` steps ever run, no version of this game has EVER
been live at the GitHub Pages URL, despite dozens of passes' own local verification (`pnpm test`,
`pnpm build`, the Playwright visual gate) reporting green every single time. That gap between "verified
locally" and "actually shipped" is exactly the kind of thing this project's own discipline exists to
catch — it simply never had a reason to look at CI's own run history until asked a direct question about
what a real person could actually go open.

**Root cause, reproduced directly rather than inferred from a stack trace: a Node-version-dependent
cross-realm class mismatch between jsdom's `AbortController`/`AbortSignal` polyfill and Node's own
built-in `undici`-based `fetch`/`Request`.** CI's workflow pins Node 24 (`actions/setup-node@v4`); every
session that ever verified this project locally ran Node 22 — a difference nobody had reason to notice
since both were "a supported Node," and `package.json`'s own `engines` field (`>=22`) never pinned an
exact version to match CI with. Downloaded a real Node 24 binary into this session specifically to
reproduce the failure rather than patch around a guess — confirmed: `apps/web/test/app.test.tsx`'s
club-picker/action-bar tests, which drive `react-router`'s real navigation, throw `TypeError: RequestInit:
Expected signal ("AbortSignal {}") to be an instance of AbortSignal` under Node 24, every time, and pass
clean under Node 22. `react-router`'s data router calls `new Request(href, { signal })` on every
navigation; Node 24's built-in `Request` does a strict `instanceof AbortSignal` check against Node's own
native class — but jsdom's test environment shadows the global `AbortController`/`AbortSignal` with its
own separate, DOM-spec-driven implementation, so a signal built from jsdom's `AbortController` fails that
check. Node 22's own `undici` build happened not to enforce this particular check as strictly; that's a
version difference in Node's own webidl validation, not a jsdom regression.

**Fix: the standalone `undici` npm package, not a version pin or a jsdom workaround.** `apps/web/test/
setup.ts` now imports `fetch`/`Request`/`Response`/`Headers`/`FormData` from `undici` (a new devDependency)
and assigns them onto `globalThis`, so every fetch-adjacent call in a test — jsdom's own, react-router's,
anything else — resolves through the SAME self-contained implementation instead of split between Node's
native undici (strict) and jsdom's separate polyfill (incompatible with it). Chosen over pinning CI to
Node 22 to match local sessions: that would paper over a real forward-compatibility gap rather than close
it, and this project's own `engines` field already declares `>=22`, meaning Node 24 is a supported,
expected environment this fix should actually work under, not route around.

**Verified against the real failing environment, not just the one that already worked.** Downloaded Node
24 directly into this session (nodejs.org's official binary, not a system package) specifically so the
fix could be checked against the SAME Node version CI runs, not merely reasoned about: `app.test.tsx`
passes, the full workspace suite (269 sim-kit + 8 apps/web tests) passes, typecheck is clean, `pnpm build`
succeeds, and the 24-test Playwright visual gate passes — all under Node 24. Then re-ran the same full
suite under Node 22 to confirm the fix doesn't regress the environment that DID already work. Both green.
The actual GitHub Actions run this pass's own push produces is the final, real confirmation — checked
directly after pushing, not assumed from the local Node-24 reproduction alone.

Rejected: pinning CI's `node-version` to 22 (matches what already "worked" locally by accident, but ships
a Node-24 incompatibility to every future contributor/session that trusts the `engines: >=22` field
without re-discovering this exact investigation); patching react-router or jsdom directly (neither is this
project's code, and the standalone-`undici` fix is the standard, minimal answer to this exact,
well-understood ecosystem interaction); silently leaving CI red and just telling the user "it works on my
machine" (would have been the actual answer prior to investigating — rejected the moment the real GitHub
Actions run history was checked instead of assumed). See `CHANGELOG.md` v2.13.0.

---

## 2026-09-04 — The amateur draft: a real 20-round, worst-record-first draft with a sourced lottery, wired into rollover, drafted players landing on the drafting org's own affiliates

**D93 · With scouting (D90) and parent affiliation (D91) both real, the standing blocker on the amateur
draft was gone — this pass built the draft itself: a talent pool, a real draft order with the sourced
top-6 lottery, 20 rounds, and a genuine integration into `startNewSeason` that places every drafted player
on his own drafting organization's own affiliate.** Jordan's own direction going in was explicit and
two-part: make the UI "crazy good looking... one of the best games out there," and — after a clarifying
exchange, since the first answer arrived garbled — make every pick automatic ("Automatic via a staff
personality"): the owner's own club follows a settable draft philosophy, every other club drafts
best-player-available. No interactive, pick-by-pick UI exists or was asked for; the philosophy dial is
the one lever this pass gives the owner over an otherwise fully-automatic draft.

**Sourced (T1): 20 rounds, fixed by the 2022-26 CBA, and the top-6 lottery's headline number — the three
worst records each get 16.5% odds at pick #1 (RESEARCH.md §1.5).** Nothing else about the rest of an
18-team lottery pool's odds curve is published anywhere found this pass — the remaining 15 slots' odds
are a disclosed T3 linear decay from that 16.5% anchor, not a second sourced number dressed up as one.
"18 non-playoff clubs" is itself an approximation: no playoff-qualification system exists yet anywhere in
this project, so the lottery pool is simply the worst 18 of 30 clubs by winning percentage — the closest
honest stand-in until a real standings-to-playoff-bracket system exists to ask instead. Best-12 clubs pick
19th through 30th in exact reverse-standings order, same as the real draft.

**Deliberately out of scope, disclosed rather than silently absorbed: Competitive Balance Rounds A/B,
the bonus-pool/slot-value/overage-tax financial system, and the revenue-sharing rule that restricts
lottery eligibility for large-market clubs.** RESEARCH.md §1.5 has real, sourced numbers for the
bonus-pool system specifically — it's a genuinely separate system (a second, parallel constraint on how
teams draft, not on who drafts when) and belongs to a pass of its own, not bolted onto this one to make
the lottery "more complete." Splitting it out follows the same "one system per pass, fully finished"
discipline D86/D89/D91 already established, not scope-timidity.

**Prospects are scored on `p.ovr` (scouted, noisy), never `p.tru` (hidden true grade) — draft uncertainty
falls out of an existing mechanism, not a new one.** Every prospect this pass generates is a fresh,
zero-sample amateur; `refineScout` (D24, D90) already produces exactly the wide, low-reliability estimate
a real amateur scouting report would have, for anyone with no accumulated sample. Reusing it here means
the draft's own "you don't really know what you're getting" honesty comes for free from a mechanism this
project already built and already tested — not a second noise model invented to say the same thing twice.

**Integration design: drafted players are routed through `churn.ts`'s EXISTING fill-vacancy loop, not a
new "prospect pool" roster concept.** `churn.ts` (D89) already generates a `freshPlayer()` for any
MLB/MiLB club with an unfilled roster slot and no published composition rule to fill it from — for a MiLB
AFFILIATE club specifically (`club.lvl !== "MLB"`), that same loop now checks whether that club's owning
org (`club.parent`, D91) still has an undrafted pick waiting before falling back to a random fresh player.
A shared, mutable `ReadonlyMap<string, Player[]>` (built once by `runDraft`, passed through
`churnWorld`→`churnClub`) is what lets one org's affiliates draw down the SAME pool of its own draftees in
iteration order, rather than each affiliate getting its own disconnected slice. Two hard rules enforced by
construction, not by a test asserting after the fact: a draftee never displaces a survivor (the loop only
ever fills an already-open vacancy), and a draftee never lands directly on the MLB roster itself — realistic
(18-21-year-olds don't debut in the majors) and mechanically guaranteed by only ever consulting
`orgDraftPool` inside the `club.lvl !== "MLB"` branch.

**`startNewSeason` runs the draft BEFORE churn, not after, on purpose.** The draft needs the pre-reset
standings (worst-record-first order) and the current, not-yet-churned population (for `pitcherRatioByOrg`,
the NEED philosophy's own signal) — running it after churn/record-reset would compute the lottery off a
blank 0-0 slate and score organizational need off a roster churn had already reshuffled.

**UI: a real Draft results page, not the placeholder `DarkPage` this route had shown since v1** —
`apps/web/src/pages/DraftPage.tsx`, following the `front-office` skill's own doctrine (one token layer,
phone-first, real component states) rather than reaching for anything outside this project's existing
design system. A stat-tile summary (rounds, total picks, the owned club's own pick count and first-pick
number, current philosophy), a three-way philosophy selector wired live to `state.draftPhilosophy`
(`gameStore.setDraftPhilosophy`, a new store action), and a round-grouped, filterable (mine/all clubs, name
search) pick list — the owned club's own picks are visually marked (an accent rule, accent name colour),
never a separate list. No pick is interactive, per the scope note above; browsing what already happened is
what this page does. Screenshotted and reviewed (not just structurally asserted) at 360px/1440px, both
shells, both themes, across both the empty (no-draft-yet) and populated (post-rollover) states, including
via a real click through the actual app rather than an injected fixture — this caught two real bugs no
assertion did: a grammar slip ("1 picks") and two stat-tile context strings ("30 clubs · 1 pick each",
"applies at your next draft") truncating mid-word specifically in the "desk" shell's uppercase
letter-spaced labels at 360px (fixed by shortening the copy; the "ootp" shell's lowercase rendering never
truncated, which is exactly the kind of shell-specific defect D16's "look at both shells" discipline
exists to catch). `registry.tsx`'s `draft` entry is now `live: true`.

**A genuine, PRE-EXISTING, out-of-scope defect surfaced incidentally and must be disclosed, not fixed
here: `makePlayer`'s id scheme has a real collision risk.** `player.ts` draws every id from
`Math.floor(r()*1e9).toString(36)` — about 1e9 distinct values. A temporary diagnostic measuring how
cleanly a rollover's 600 new draft picks land on real roster slots found one sampled year absorbing
"101.5%" of its draftees — impossible unless two distinct `Player` objects in `state.players` ended up
sharing the same `id`, which is possible (not certain) at this project's current scale (several thousand
players plus 600 new picks a year, birthday-paradox arithmetic on a ~1e9 space). This is `player.ts`'s own
id-generation scheme, not a defect in `draft.ts`/`churn.ts`/`rollover.ts` — nothing in this pass touches
how ids are minted — and fixing it is real, separate work (a larger keyspace, or a monotonic counter) for
whoever picks it up. Recorded here, not silently absorbed into this pass's own fix, because the
diagnostic that found it belongs to this pass even though the defect itself predates it.

**Verified, not assumed.** `draft.test.ts` (10 new tests): exact pick/round counts (600 picks, 20 rounds
× 30 clubs), no duplicate players across the whole draft, every pick belongs to a real MLB club with
exactly 20 picks, `byOrg` groups correctly, the best 12 clubs pick 19th-30th in EXACT reverse-standings
order, the empirical lottery odds for the three worst records land inside a wide but real bound around the
sourced 16.5% target (4,000 trials), a club outside the 18-team lottery pool never draws pick #1 (200
trials), BPA and UPSIDE philosophies provably diverge on the same board, and BPA's own definition (max
remaining scouted OVR) holds pick-by-pick against the live remaining pool. `rollover.test.ts` (3 new
tests): `state.lastDraft` is null before any rollover and a complete 600-pick record after one, drafted
players never land on an MLB roster and some do land on real affiliates, a drafted player's landed club's
`parent` exactly matches the pick record's drafting club, and setting `draftPhilosophy` to `"UPSIDE"`
before rollover works with the world's total population size staying exactly constant. Full workspace
suite (282 sim-kit + 8 apps/web tests) passes, typecheck clean, build succeeds, and the Playwright visual
gate — now 32 tests, up from 24, with the Draft page's empty state added as a permanent regression check
— passes in full.

Rejected: an interactive, pause-and-resume-for-input draft UI (not what Jordan asked for once the
clarifying exchange resolved to "automatic via a staff personality"; would also need a real state-machine
pause/resume capability nothing in this engine has); inventing a new "prospect pool" roster concept
instead of reusing `churn.ts`'s existing fill-vacancy loop (would duplicate a mechanism that already does
exactly this job); scoring draft prospects on `p.tru` for "more realistic" team-building (would break Law
10 — no view or system may read a hidden true grade — for the sake of AI opponents nobody watches make
decisions); silently fixing the `makePlayer` id-collision finding inside this pass (a different, unrelated
system; the honest move is disclosure, not an uncredited drive-by fix); building Competitive Balance
rounds or the bonus-pool financial system in the same pass (real, sourced, substantial work of its own —
see above). What's still not built: CB rounds, the bonus pool/slot values/overage tax, revenue-sharing
lottery restrictions, interactive picking, a dedicated Scouting page, the ownership ladder, and the
`makePlayer` id-collision fix now disclosed above. See `CHANGELOG.md` v2.14.0.

---

## 2026-09-05 — The visual direction is signed off, saved into the repo, and is now the scheme every future feature is built in

**D94 · Asked directly whether the UI was working, the answer was "I hate the UI" — and the
response was research, not a re-skin by taste.** Three rounds of real, cited investigation
(premium fintech dashboards, Bloomberg Terminal's own accessibility rebuild, esports
broadcast overlays, then the newest Baseline CSS) produced a direction, iterated live against
Jordan's reactions ("scratching the itch but not quite there", "more high definition", "make
the color scheme fully customizable"), until: "absolutely loving that default color scheme."
That direction is now saved as `design/war-room.html` (the approved reference render) and
`design/DESIGN-SYSTEM.md` (the buildable spec). **Every new screen and feature from here is
built in this scheme.**

**The core of it is a rule, not a palette: the accent touches data and action only, never
chrome.** Every premium dashboard examined enforces the same split independently — neutral
chrome, one rationed brand accent, and "direction" (up/down, good/bad) as a separate channel
entirely. That single rule is what reads as expensive; the specific hues are almost
incidental, which is precisely why they could be made fully customizable without the design
falling apart.

**Fully customizable, and it survives any hue the owner picks.** Everything colored derives
from two hue angles (`--accent-h`, `--live-h`); lightness and chroma are pinned at values
that stay in-gamut across the whole hue circle, so no per-hue hand-correction is needed —
the finding that made a one-dial theme engine viable at all. OKLCH takes over where it
parses (a picked red reads as vivid as a picked cyan; raw HSL does not have that property),
falling back to HSL everywhere else. `@property` registration on just the two seed hues makes
a theme change glide across the entire page rather than snap. Positive/negative stay fixed
and uncustomizable **on purpose** — an owner must never have to wonder whether green means
"good" or "brand".

**Three real defects were found by building it, not by reading about it.** (1) A `var target`
name collision between the gauge and countdown timers, which would have silently broken the
gauge — caught by reading `stroke-dashoffset` back out of a headless browser rather than
trusting the code by eye. (2) Single-key keyboard shortcuts shipped with no way to disable
them, violating WCAG 2.1.4 at Level A — fixed with a toggle in the shortcut sheet itself plus
a modifier-carrying `⌘/` mirror. (3) A per-second ticking countdown left readable by screen
readers, which is unusable; the visible timer is now `aria-hidden` with announcements only on
minute boundaries. The last two were introduced by this work and found by researching it
properly afterward — recorded here because the pattern (ship, then research what you shipped)
is what caught them.

**One thing was tried and cut rather than shipped broken:** `document.startViewTransition()`
for a cross-fade on theme changes. Direct instrumentation showed its callback silently never
firing in the render environment. The `@property` transition already delivers the same glide,
so the exotic API was removed rather than kept as a decorative risk.

**A course correction worth recording, because it was mine to catch and I didn't.** The
first owner-facing charts I proposed were a draft-lottery-odds curve and a scouting-reliability
gauge — GM instruments. Jordan's correction was flat: "im a team owner; this is more business
and Financials." The section was rebuilt around a cash-flow waterfall (reconciling exactly:
18.6 + 11.2 + 10.9 − 15.2 − 11.2 − 0.1 = 14.2, with the monthly payroll tying to the annual
figure shown elsewhere on the page) and the real measured price-of-a-win spread from this
project's own economic QA — a 41× range from the American Association to the Pecos League.
The lesson generalises past this page: **this game is played as an owner, and instruments
should be the ones an owner's accountant would recognise.**

**Verified, not assumed**: every feature exercised in a real headless browser — theme
persistence across reload, palette encoded in and restored from the URL hash, each keyboard
shortcut in both toggle states, the compare wipe by drag and by keyboard, both chart
renderers, tooltip behaviour, and zero horizontal overflow at 1280px and 400px with zero
console errors. Layer geometry for the compare wipe was measured (both layers exactly 104px)
rather than eyeballed, because a wipe between two differently-sized layers is a lie.

Rejected: applying the new tokens to the app in the same pass (the app still ships the
original palette — a deliberate ordering call, since the league-configuration work will add
the most important screen in the game and re-skinning three screens before adding a fourth
is backwards); building the visual direction from taste rather than sourced references;
`mix-blend-mode:overlay` for film grain (it mathematically collapses on a near-black ground —
`plus-lighter` is additive and actually shows); Apple's Liquid Glass refraction (Firefox has
no support, per-frame expensive, and wrong for a screen stared at for hours). What is NOT yet
done: the app itself, whose re-skin is specified in `design/DESIGN-SYSTEM.md` §7 and awaits
the world-configuration work landing first. See `CHANGELOG.md` v2.15.0.

---

## 2026-09-05 — The sandbox is defined: leagues become data, unloaded leagues still exist, and the fail state is opt-in

**D95 · Four scope questions were put to Jordan and three came back decided; the fourth
reshaped the architecture more than any of them.** Recorded here because they arrived through
a question UI that persists nowhere, and every one of them constrains the next build.

**Decided: the world grows by complex/rookie ball and an amateur/college layer** — on top of
the existing 218 (30 MLB + 120 affiliated + 68 independent). International pro leagues (NPB,
KBO, Mexican, winter ball) were offered and NOT selected; they stay unbuilt rather than
assumed.

**Decided: leagues you don't load still exist as data, but don't play.** Unloaded clubs are
real named entities with real budgets that buy and sell players and set market prices — no
games, standings or box scores are simulated for them. This keeps every talent pipeline
intact (an indy-only save still has affiliated orgs buying your best player) at almost no
runtime cost, and it is what makes ~180 complex clubs and hundreds of college programs
affordable at all. The one genuinely new number it needs — how often background clubs buy,
and at what price — is NOT invented: this project already solved it once, in the original
build's v0.9 winter cycle, and the rate gets re-derived against those same sourced churn
targets (roster continuity 24–41%, median age 26, `CHANGELOG.md` Build 0.9) by the same
empirical method D86 and D89 used.

**Decided: the fail state is optional, set at new-game.** Sandbox by default — money is
tracked honestly and shown, nothing forces you out. Insolvency available for players who want
the books to have teeth. Costs slightly more than either alone and serves both, which is the
right trade for a game whose whole framing is "endless sandbox."

**The fourth answer changed the architecture: asked how deep the college layer should go, the
answer was "make it a customization option to add custom leagues."** That reframes the
question from a sourcing quantity into a system. Leagues stop being hardcoded tables and
become authorable data — and league selection, the complex/rookie pack, the college pack and
user-made leagues all collapse into one mechanism instead of four. `proposals/
WORLD-CONFIGURATION.md` is the design.

**The real work this exposes: `world-data.ts` holds the world in three mutually incompatible
shapes** — `MLB` as flat tuple rows, `MILB` as a level-keyed record with a separate flat
parent lookup, `INDY` as objects each carrying their own game count, attendance, cap, opex
scale and published roster table — and `buildWorld()` walks all three with three different
code paths, taking no arguments. Adding a league today means writing code, not data. Collapsing
those into one format without losing anything is the pass, and it is provable: the world built
from packs must be byte-identical to the world built from the constants (same ids, abbreviations,
divisions, parents, capacities) or it doesn't land.

**One limit is stated up front rather than discovered later: run environments are calibrated
measurements, not settings.** Per-level realism rests on RESEARCH.md §7.1's published lines,
which `calibration.test.ts` checks 50 ways. A custom league therefore declares which existing
environment it plays in; it cannot author a new one, because nothing real would be behind it.
The UI says so plainly. This is what stops custom leagues from quietly dismantling the realism
the entire project is built on.

**Sequenced deliberately: this lands before the new tokens reach the app (D94).** The league
picker is the most important screen in the game and does not exist yet; re-skinning three
existing screens before adding a fourth is backwards. It also has to land while
`SCHEMA_VERSION` is 1 and no real saves exist, because it changes what a save *is* — a
`worldConfig` block carrying loaded packs, per-league played/background/absent state, custom
packs (stored in the save, so a save stays self-contained), and the insolvency flag.

**Still open, deliberately not guessed: what the owner actually owns** — one club, a whole
organization with its ~7 affiliates, or a portfolio of unrelated clubs. Jordan asked to
discuss it rather than pick. The recommendation on the table is organization-with-portfolio-
deferred, because it makes D91's sourced affiliate data load-bearing instead of decorative and
matches the shape real ownership takes. It does not block the world-configuration build:
configuration decides what exists, ownership decides what you control, and they can be built
in that order.

Rejected: sourcing all ~300 NCAA Division I programs as a data-entry pass (the custom-league
system answers it better, and §4's constraint means the players were always going to be
generated regardless); international pro leagues (offered, not selected — not assumed in);
fully simulating unloaded leagues (heaviest option, and nobody watches a Florida Complex
League box score); a closed world where unloaded means nonexistent (would break the
sell-players-to-affiliated-orgs mechanic that drove the original build's churn). See
`CHANGELOG.md` — unversioned until the build lands; this is a decision record, not a shipped
system.

---

## 2026-09-05 — You own the organization; you do not operate it. Delegation is the game's core mechanic

**D96 · Asked whether owning a club meant owning its farm system, Jordan answered a better
question than the one asked:** "I am an owner, I should not be managing players or calling up or
sending down players — my GM and managers can bring things to my desk if I elect that option and
we can discuss and recommend moves/trades/signings/releases etc. I want it fully customizable how
much I can control or have it delegated to staff etc." The question was about the *scope* of
ownership; the answer is about the *mode of interaction*, and it defines the whole game.

**The model: every decision area carries a delegation setting — Hands-on, Approve, Notify, or
Silent — set per area and changeable mid-save.** Hands-on means nothing happens without you.
Approve means staff propose with reasoning and you decide. Notify means they act and tell you.
Silent means they act and it's in the log if you go looking. A save with everything Hands-on is a
micro-manager's game; everything Silent is a pure business-of-baseball game where you hire, fund,
and watch. **Both are legitimate, and one engine serves both** — which is exactly what an endless
sandbox needs, because it lets one save become several different games over its life.

**Staff hiring and firing is the one area that is never delegable.** Delegating who you hire is
delegating the game. Everything else — payroll, ticket pricing, capex, scouting spend, player
moves, signings, trades, the draft, lineups — sits on the dial.

**This retroactively validates v2.14.0's draft philosophy.** The owner sets best-available /
fill-needs / upside and the organization executes it — policy-setting, not player-moving. That was
this pattern built before it had a name, and it is the template for every other area.

**It also invalidates a planned screen, which is why this is recorded rather than just discussed.**
The page registry has a **Lineup** page pending — an owner setting a batting order. That is a bench
coach's job, not an owner's. It becomes a read-only view of what the manager chose (questionable,
and overridable only under Hands-on), or it leaves the registry. **Roster** is likewise a view of an
asset, not a place the owner drags players between levels.

**Delegation is only interesting if the person on the other end is.** Staff therefore need
competence (hidden behind scouting *them*, the same way player grades are hidden — Law 10 already
covers the principle), philosophy (a GM who values youth proposes different trades than one who
wants to win now, which is what makes Approve a real choice rather than a rubber stamp), and a
relationship with the owner that constant overriding damages. A great GM on Silent is the reward
for hiring well; a bad GM on Silent is how you discover you hired badly — months later, by reading
what he did. This finally forces an answer to `FRONT-OFFICE-DESIGN-PROPOSAL.md`'s long-open staff
question, which has been deferred across several passes: the delegation dial is meaningless
without real staff behind it, so staff stop being optional.

**It settles `WORLD-CONFIGURATION.md` §8's open question, and dissolves my stated concern with it.**
You own the whole organization — the MLB club plus its AAA/AA/High-A/Single-A and complex clubs —
but you hold them as assets and cost centres, not as five rosters to hand-edit. The "every screen
needs a which-club switcher" objection I raised was overstated: it is a *reporting* context, not an
editing context, which is much cheaper.

**Jordan's stated ambition, recorded so scope is not quietly trimmed later:** "a deep and highly
advanced game engine with lots of scenarios and features to be generated through gameplay." The
event/scenario engine is where that lives — proposals, notifications, problems (an expiring stadium
lease, an underperforming affiliate, a manager wanting an extension) and judgment calls escalated
regardless of setting. `proposals/OWNER-AND-STAFF.md` has the design and a four-step build order
that starts with the dial itself and no staff behind it, so the interaction model can be proven or
disproven cheaply before any new simulation is written.

Also confirmed this exchange: **the college layer ships built by me, and is editable and extendable
by Jordan** — not authored from scratch by the player.

Rejected: treating the owner as a GM with a nicer title (the assumption most management sims make,
and the one two of this project's own planned screens had quietly inherited); a single global
"realism/difficulty" slider instead of per-area delegation (it would collapse the most interesting
choice in the game into one number); building staff before the dial (the dial is provable in
isolation and tells us whether the model works at all). See `proposals/OWNER-AND-STAFF.md`.

## 2026-09-05 — Player ids were a birthday-paradox time bomb; uniqueness is now structural, not statistical

**D97 · D93 disclosed a suspected id-collision risk in `makePlayer` rather than fixing it. This
pass measured it, found it real and worse than the disclosure implied, and replaced the scheme.**

The original ids were `p${Math.floor(r() * 1e9).toString(36)}` — a random draw from roughly a
billion values. That sounds like plenty, and the intuition is wrong for the same reason it is wrong
about shared birthdays: collisions scale with n²/2N, not n/N. **Measured directly rather than
argued:** 10,000 generated players collide zero times, 50,000 collide once, 100,000 collide four
times — tracking the prediction (~1.25 and ~5.00) closely enough to trust the model for
extrapolation.

**The scale that matters is this game's own.** A sandbox save mints roughly 1,600 players a year —
600 draft picks plus churn across 218 clubs — so a save reaches 160,000 players around season 100
and has collided a dozen-plus times by then. The world-configuration work (`proposals/WORLD-CONFIGURATION.md`)
adds ~180 complex/rookie clubs and a college layer on top of that, which roughly doubles the intake
and quadruples the collision count, since it grows with the square.

**A collision is silent corruption, not a crash.** `advance.ts` builds `new Map(state.players.map(p => [p.id, p]))`.
Two players with one id means one silently overwrites the other, and every lineup slot, contract and
draft record pointing at that id now points at whichever won. Nothing throws. Nothing looks wrong.
The save just quietly stops being the world it claims to be — which is the worst possible failure
mode for an engine whose proudest property (D85) is that a seed reproduces its world exactly.

**The fix is structural: every real creation site now passes an id that cannot collide by
construction**, so uniqueness is a property of the scheme rather than a probability.

| site | id | why it cannot repeat |
|---|---|---|
| `roster.ts` | `pr:<club>:<k>` | `buildRosters` runs exactly once per world |
| `draft.ts` | `pd:<year>:<i>` | one draft per year; `i` indexes that year's pool |
| `churn.ts` | `pc:<year>:<club>:<n>` | churn runs once per club per rollover; `n` increments within the call |

`startNewSeason` passes `state.season.year` — the season just finished — and increments the year
afterward, so no two rollovers ever share a year. That is what makes the `year` segment load-bearing
rather than decorative.

**One subtle trap, caught while writing it, worth recording because it would have been invisible.**
The obvious implementation is `id: opts.id ?? \`p${Math.floor(r() * 1e9).toString(36)}\``. That is
wrong. `??` short-circuits, so supplying an id skips the `r()` call, consumes one fewer value from
the stream, and shifts every subsequent draw — meaning the same seed generates a *different world*
depending on whether callers pass ids. It would have broken save-reproducibility while every
existing test still passed. The fallback is therefore computed unconditionally, before the return,
and a test asserts the two streams stay in lockstep.

**`test/identity.test.ts` is the guard, and it was verified to actually fail.** Temporarily removing
the id from one creation site makes it fail immediately and by name. The load-bearing assertion is
the prefix check: a future creation site that forgets to pass an id falls back to the random scheme,
and its `p<base36>` ids are rejected in the same commit that introduces them. There is also a
fifty-season soak asserting no id is ever reused for a *different person* — survivors keeping their
id across a rollover is continuity, not collision, so identity is compared on the player's immutable
noise seed and name rather than on the id itself.

**Impact: negligible at runtime, decisive on correctness.** The new ids are template strings built
from values already in scope — no allocation the old scheme did not also make, no measurable change
to world-generation time (the 286-test suite runs in the same ~97s). What changes is that a
century-long save is now correct instead of quietly corrupt.

Rejected: a UUID (32+ bytes per player × 160,000 players is real save-size weight for a property
structure already gives for free); a global monotonic counter (it would have to live in `GameState`
and be threaded through every creation site, and a desynced counter reintroduces the bug); leaving
the disclosure standing and fixing it "when it bites" (it bites silently, so it would never
visibly bite).

## 2026-09-05 — The save has carried a version stamp since day one and nothing ever read it

**D98 · Two schema changes are designed and queued — `worldConfig`
(`proposals/WORLD-CONFIGURATION.md` §7) and the delegation dial
(`proposals/OWNER-AND-STAFF.md`). Neither can land safely, because the app had no way
to open a save written by a different build. This lands the mechanism first.**

`createInitialState` has written `v: SCHEMA_VERSION` into every save since v2.9.0. `loadGame`
handed the raw IndexedDB blob straight to the app and never looked at it. That is harmless while
the schema has never changed and catastrophic the first time it does.

**What that actually looks like was not theorised — it was witnessed.** A Playwright check written
this pass planted a save from a "newer build" and ran it against a stale bundle from before the
fix. The app didn't refuse it, and it didn't crash cleanly either. It rendered
`Unexpected Application Error! l is not iterable`, ten frames deep in a minified router callback,
with nothing anywhere on screen or in the stack mentioning saves, versions or schemas. That screen
is what every future schema change would have shipped.

**Worse than the crash: what came next.** A failed load left `state` null, and `App.tsx` treats
null as "no save" and renders the club picker. So the player would be shown a friendly *Choose the
club you'll own* — and the moment they picked one, `startNewGame` wrote over the save that had just
failed to open. A recoverable problem became permanent in one click, with no warning and no
confirmation. **Refusing to load a damaged save is only half a safeguard; refusing to let the next
screen destroy it is the other half**, and the second half is the one that was missing.

### The design, and the one rule that carries it

`packages/sim-kit/src/migrate.ts` — a registry of `{from, to, name, migrate}` migrations, a chain
walker, a shape check, and a `loadState` returning a discriminated result that callers cannot
ignore without a type error.

**A migration operates on plain JSON, never on `GameState`.** This is the mistake almost every
codebase makes here and it is invisible until it bites. A migration typed
`(s: GameState) => GameState` compiles against whatever `GameState` means *today*; add a field in
six months and that same migration — whose entire job is to handle saves written before the field
existed — silently begins asserting its input already has it. The types agree. The data doesn't.
So every migration takes and returns `Record<string, unknown>`: unpleasant to write, correct
forever.

Six refusals, each distinct because each needs different advice: `not-a-save`, `no-version`,
`from-the-future`, `no-path`, `migration-failed`, `invalid-result`. **A save from a NEWER build is
refused outright rather than attempted** — a down-migration would have to invent the removal of
data it cannot see, so guessing is worse than stopping. Malformed *registries* are refused as
carefully as malformed saves: a gap in the chain, two migrations claiming the same version, or one
whose `to` isn't greater than its `from` all report rather than loop or silently pick.

The framework stamps the new version itself after each step, so a migration that forgets to set
`v` — or sets it wrong — still lands correctly. One less thing every future migration must get
right.

### Testing something that has nothing to migrate yet

`SCHEMA_VERSION` is still 1 and `MIGRATIONS` is legitimately empty, so testing only what runs today
would prove almost nothing and the whole mechanism would ship unexercised until the exact moment it
first mattered. Two seams solve it, and both are documented as test-only rather than dressed up as
flexibility: `loadStateWith(raw, target, migrations)` drives synthetic chains through the real
code, and `loadGame(read)` drives the persistence side.

**The most valuable test in the file is the smallest:** for every version 1..`SCHEMA_VERSION`, a
migration path to the current version must exist. That is the test that fires when someone bumps
the version and forgets the migration — the failure that actually happens.

### Nothing is overwritten without a copy first

When a migration runs, the pre-migration blob is copied to a backup slot **before** the upgraded
save is written, in that order, so a failure between the two leaves the original intact rather than
nothing at all. A migration is code and code has bugs; the one outcome this design refuses is a bad
upgrade quietly destroying a save with nothing left to recover. **Disclosed gap: no UI reads the
backup yet.** `readBackup()` exists and the data is kept, which is the part that cannot be added
retroactively; a restore flow can be.

A failed load writes nothing at all — asserted directly, by reading the raw bytes back after a
refusal.

### The screen, and what looking at it caught

`SaveProblemPage.tsx` blocks the app on an unreadable save: what happened, in the engine's own
player-facing words; **"Nothing has been deleted"**, which is true and is the most useful sentence
on the screen; and starting over as a two-step, explicitly-destructive path that names its
consequence before it can be taken.

Reading the screenshot caught what no assertion did: the engine's `detail` and the screen's own
guidance line **said the same thing twice**, one under the other, in slightly different words.
Fixed by making the split strict — the engine states the problem and the version numbers, the UI
states the remedy, neither says the other's half — and the engine's sentences were capitalized,
since they now begin a paragraph instead of following a label.

One thing I got wrong and corrected by measuring rather than by staring: I read that paragraph as
rendering in a stray blue and started hunting a CSS bug. Its computed colour is
`rgb(232, 232, 234)` — identical to the heading. There was nothing to fix.

**Impact: negligible at runtime** — one version comparison and ten field checks per load, once per
app start, against a load that already deserialises a multi-megabyte world. **Decisive on
capability:** the two queued schema changes are now safe to make, which they were not this morning.

Rejected: a full per-field schema validator (a different tool with a different cost; `checkShape`
answers the narrow question "will this survive first render" and says so rather than pretending to
be more); versioning by feature-detection instead of a stamp (the stamp already exists and is
already written); attempting a best-effort load of a future save (it produces exactly the
`l is not iterable` screen this decision exists to eliminate); deleting an unreadable save to get
the player to a clean state (the bytes are the only copy — refusing to touch them is the point).

## 2026-09-05 — The save was written 190 times a season when once every few days would do

**D99 · A design review measured that `gameStore.advance()` writes the entire save to IndexedDB
after every single day-advance. Verified independently, then fixed — but the fix is not the one the
first framing implied, and the difference is worth recording because I got it wrong first.**

### What was measured

In a real browser, on a fresh MLB save:

| | |
|---|---|
| Save size | **2.39 MB** |
| `players` | 2,139,194 B — **89.5%**, 5,750 players at ~370 B each |
| `sched` | 205,417 B — 8.6%, 13,866 rows |
| everything else | ~1.9% (`world` 43 KB, `ledger` 326 B, `ui` 254 B) |
| `structuredClone(state)` | ~48 ms |
| one IndexedDB `put` | ~23 ms |

**There is no fat to trim.** The save is 90% the population, which *is* the game — and the pending
world-configuration work (~180 complex/rookie clubs plus a college layer) makes it substantially
bigger. So the question was never what to write; it was how often.

### The correction

The obvious framing — "a 23 ms write blocks every click" — is **wrong**, and measuring it said so.
`gameStore.advance` calls `set()` *before* `await saveGame(current)`, so the `await` already yields
and the put runs after the click handler returns. Measured synchronous work per advance:
**8.2 ms before, 7.7 ms after** — a 6% difference, which is noise. Long-task totals across 30
advances: 249 ms vs 232 ms. Also noise.

Recording this because the first version of this entry claimed a frame-time win, and the honest
measurement does not support one.

### What actually changed

Instrumenting `IDBObjectStore.prototype.put` and advancing 30 days at a realistic pace:

| | writes | bytes written |
|---|---|---|
| before | **30** | **73.8 MB** |
| after | **1** | **2.6 MB** |

**A 30× reduction in write operations and 28× in bytes.** Over a 190-day season that is roughly
467 MB of storage churn replaced by ~16 MB. That is not a frame-rate fix; it is an I/O, battery,
and flash-wear fix, and it matters most exactly where this game is most likely to be played — a
phone, where IndexedDB is slower and writes are more expensive. It also scales with the save, which
is about to grow.

### The mechanism, and the two hazards that make it dangerous

`queueSave` schedules a write rather than performing one; a write scheduled while another is pending
simply **replaces** it. This is safe only because `GameState` is cumulative rather than a delta —
the latest version contains every earlier one, so skipping intermediates loses nothing. A 400 ms
quiet timer coalesces a burst; a 2,000 ms staleness cap means holding Advance still persists as it
goes rather than deferring forever behind a rolling timer.

Write-behind introduces two ways to destroy a save that writing immediately does not have. **Both
are closed inside `save.ts` rather than left to callers to remember, and both are tested — and both
tests were verified to genuinely fail when the guard is removed:**

1. **A queued write landing after a new game.** `saveGame` cancels the queue first. Without it, the
   player starts over, and a moment later the previous save silently overwrites the new one.
2. **A queued write landing after a delete.** `deleteSave` cancels the queue too. Without it, a
   deleted save comes back.

Writes are also serialized — a new write awaits the in-flight one — because IndexedDB does not
promise completion order across overlapping transactions, and the *last* state must win.

`App.tsx` flushes on `visibilitychange → hidden` and `pagehide`. `visibilitychange` is the load-
bearing one: it fires reliably when a tab is backgrounded or an app is swiped away on a phone —
which is how this game is actually left — and early enough that an async write still has time to
start. `beforeunload` is unreliable on mobile and generally too late for IndexedDB.

**Accepted cost, stated plainly:** at any instant up to ~2 seconds of play may not be on disk. If
the tab is killed outright (not backgrounded), those few days are lost. Nothing is corrupted — the
state is cumulative and the engine deterministic, so the player replays a few days. That is a good
trade for a 30× cut in writes, and it is the trade every write-behind cache makes.

Rejected: splitting the save into hot and cold stores (Law 2 — the state IS the save — and 90% of
it is one array that changes every day anyway); dropping `sched` and regenerating it (8.6% of the
save, and it would need the exact RNG state to reproduce); a Web Worker for the write (structured
clone to the worker costs what the write costs); writing less often but unconditionally (the
staleness cap already bounds the loss, and a fixed interval either loses more or coalesces less).

## 2026-09-05 — The delegation dial is real, and two measurements decided what goes on the desk

**D100 · `proposals/OWNER-AND-STAFF.md` step 1 — the dial with no staff behind it. Seven agents
designed and critiqued it in parallel; two of their findings were verified independently and one
of my own measurements overturned the critique's own headline recommendation.**

### What the design work found, and what survived

Four parallel designs, three adversarial critiques. The finding that dominated everything:
**every emitter all four designs proposed fires at the rollover.** `startNewSeason` runs once a
year and `advanceDay` runs ~190 times, so a desk fed only by the rollover is empty on 189 days out
of 190 — an annual report, not a desk. The proposal's own fantasy is "you arrive and things are
waiting"; once-a-year mail does not deliver it.

Two claims were verified against the working tree rather than taken on trust, and both held
exactly:

- **The rollover moves the clock 186 days** (seed 5 / MLB_NYY: serial 20703 → 20889). Any
  day-based expiry filed at a rollover would lapse before the owner could ever see it. This is why
  asks here carry **no TTL at all** — each is consumed at the moment it would matter, which makes
  "nothing blocks" structural rather than a policy enforced by a clock.
- **An owner's answer already changes the whole world.** The same rollover consumes **310,466**
  draws under BPA, **309,971** under NEED, **309,540** under UPSIDE — a different draftee reaches
  a different affiliate, and `churnClub`'s jersey-number loop draws a variable number of values.
  That killed a large apparatus in one design (precomputing both branches "so the quantity of RNG
  consumed is invariant under the owner's answer" defends a property the engine has never had) and
  a proposed law in another ("an owner decision may change selection, never draw count" is simply
  false). The invariant that matters is weaker and free: **the dial's routing cannot move the
  simulation; the owner's answer legitimately can.** The test asserts exactly that and no more.

Two further critique findings were already closed by work done earlier the same day: `migrate.ts`
(two designs proposed rebuilding it) and the `gameStore` fall-through that let a new game overwrite
an unreadable save (D98's `SaveProblemPage`).

### The measurement that overturned the recommendation

The critique's own proposed centrepiece was a **month-end cash call** — borrow on the note, cut
scouting, or ride it out when projected cash breaks a floor — with a caution to measure the cash
curve first. **I measured it, and it kills the feature:**

| club | start | trough | after 3 seasons |
|---|---|---|---|
| MLB (NYY) | $170.0M | $162.7M | **$334.9M** |
| AAA | $0.82M | $0.66M | $10.67M |
| Single-A | $0.82M | $0.68M | $2.63M |
| INDY (ALPB) | $1.14M | $0.85M | $4.57M |

**Every club at every level accumulates cash monotonically.** Nothing approaches trouble, because
`payrollBudget` and `ticketPrice` are both inert (written at `newGame`, read by nothing) so there
is no way to overspend, and there is no owner distribution or capex draining the balance. A
cash-floor trigger would have been a mechanic that never fires — wallpaper, teaching the player
that the desk is decorative, which is the precise failure the dial exists to avoid. **Not built,
and the negative result is recorded here so nobody re-proposes it before the economy has a
spending lever.**

### What is on the desk instead

- **The month-end close**, from `advance.ts`'s existing `postMonth` line: cash on hand and the
  month's net, ~7 times a season, on ordinary days. A notice, never an ask — with nothing at stake
  there is nothing to decide, and a decision with no stakes is worse than a clean report.
- **The draft policy**, annual, consumed by `startNewSeason` *before* `runDraft` reads it. That
  ordering is load-bearing: resolving after would apply the answer a year late and invisibly.
- **The scouting budget**, annual, consumed at whichever month crossing follows the answer — so an
  annual question still lands its effect in-season. The first draft raised it at every month
  crossing, which meant answering in April asked again in May; the boost curve has nothing like
  that resolution. Its options are anchored on `SCOUT_BOOST_SATURATE_AT`, past which more money
  buys literally nothing, so no option is a bad deal dressed as a choice. **This also closes a gap
  carried since v2.11.0: there has never been any owner-facing way to move the scouting budget.**

### The four settings are four different behaviours

| level | asks first? | recommends? | if you never answer | on the desk |
|---|---|---|---|---|
| Hands-on | yes | **no** | nothing changes | the ask |
| Approve | yes | yes | the recommendation is taken | the ask |
| Notify | no | — | already done | a notice |
| Silent | no | — | already done | nothing |

Hands-on deliberately gets **no** recommendation — you said you would decide, and there is nobody
with an opinion yet anyway. It is also what makes Hands-on and Approve visibly different, which is
the whole point of shipping the dial before the staff. Every level writes to the log, Silent
included: **Silent costs you the notice, never the record.**

`DelegableDomain` (10 areas) is a separate type from `DecisionDomain` (11), and
`DelegationSettings` is keyed on the former — so **"staff hiring is never delegable" is a property
of the save's shape**, not a rule to remember. A preset that tried to include it would not compile.
The dial screen still *shows* staff, as a control you cannot move: hiding it would hide the rule.

### Honesty about what is behind each dial

Three of eleven areas are live (`draft`, `signings`, `scouting`). The other eight render with
"not yet active" and a line saying what they are waiting for — the same convention `registry.tsx`
already applies to dark pages. Shipping eleven identical working dials would let a player set
ticket pricing to Hands-on and be asked nothing forever, which teaches them the mechanic is fake.

### Verification

- **A control test first.** `simFingerprint` is shown to detect a single extra RNG draw *before*
  it is used to assert any equivalence — otherwise "these worlds are identical" is a sentence
  rather than a measurement. It is also shown not to report a difference where there is none.
- All four levels produce byte-identical worlds when the resulting policy is the same; and a
  companion test asserts the fingerprint *does* differ when the policy differs, so the first test
  cannot pass vacuously.
- 33 delegation tests, plus the first real save migration (v1 → v2) exercised against a genuine
  v1 save built by `newGame` with the new fields stripped.
- Two defects were caught by reading screenshots, not by assertions: the dial labelled staff
  hiring "not yet active" (conflating "permanently yours" with "system not built"), and an earlier
  scouting emitter would have re-asked every month after being answered.

**Impact: negligible at runtime** — the desk adds no RNG draws, no per-day work, and a few log
lines a month against a 2.4 MB save. **Decisive on design:** the interaction model D96 defines is
now testable by playing it, which is what step 1 existed to make possible.

Rejected: a desk queue with statuses, expiry, a sweep and eviction (all four designs built one;
nothing in step 1 files an item that waits, so it would be several hundred lines of machinery
bounded to two items); per-player winter digests (~160 events a year for a five-club org — a
firehose an owner does not read, so the report is counts and the Roster page has the names);
gating the rollover on an unanswered Hands-on item (it would make the one Advance button refuse to
work); the cash call (measured above).

## 2026-09-05 — Ticket pricing is real, and the model that looked obviously right was provably broken

**D101 · `state.ticketPrice` has been written at new-game and read by nothing since the
state-wiring pass. Making it real needed a demand model, and the first one I chose — the standard,
obvious one — would have shipped a game with exactly one move.**

### The research

Ticket-price elasticity is published, so it was not invented. **RESEARCH.md §25** records the
sourcing: MLB ticket demand is price-**inelastic** at observed prices, a finding replicated since
Noll (1974) and Scully (1989) and known as the *inelastic pricing puzzle*. The primary source used
is Lee & Chun, *Ticket Pricing Per Team: The Case of Major League Baseball* — team-specific
error-correction models, **23 MLB clubs, 1970–2003**: most teams' long-run price elasticities are
"significantly less than 1 in absolute value," TEX and PHI are below 0.5, and a minority (KCR, MIL,
OAK, SDP) are elastic. **0.6** is adopted — inside that distribution, at neither edge (T2).

The paper also gives the *mechanism*, and it is the reason this fits this engine so exactly:
inelastic pricing is rational **"if these teams obtain appreciable offsetting revenue from the
sales of concessions and souvenirs."** `Economy` already carries four independent per-fan lines, and
for MLB they are `gate: 38`, `conc: 19`, `park: 6`, `merch: 8` — **46% of per-fan revenue is not
the ticket.** So the published finding does not have to be asserted anywhere in the code. It falls
out of the engine's own sourced revenue split once attendance responds to price.

### The model I nearly shipped, and why it is wrong

The obvious form is constant elasticity, `attendance ∝ (price/face)^−ε`. It is wrong here, and the
proof is arithmetic rather than aesthetic. With per-fan revenue `g·x + c`:

```
R(x) = x^−ε (g·x + c)     R′(x) = x^−ε−1 [ g(1−ε)x − εc ]
```

The stationary point is a **minimum** (`R″ > 0`), so for any ε below 1 revenue dips and then rises
without bound. Computed against MLB's own numbers, that model indexes revenue at **99.2 at 1.3×
face and 119.6 at 5× face** — its advice is "charge $205 a ticket." I had already written it into
RESEARCH.md, together with an invented long-run fan-base-erosion term to stop the resulting
dominant strategy. Checking the arithmetic before building killed both: **the second invention only
existed to paper over the first mistake.**

Linear demand, calibrated so the elasticity *at the face price* equals the sourced 0.6, behaves
correctly and needs no invented dynamic at all.

### Measured across real simulated seasons, not computed from the formula

| price vs face | gate revenue | attendance-driven revenue | **net income** |
|---|---|---|---|
| 0.7× ($29) | $73.7M | $164.2M | $50.9M |
| 0.9× ($37) | $84.7M | **$166.2M** | **$52.8M ← best** |
| 1.0× ($41, face) | $88.6M | $165.6M | $52.3M |
| 1.2× ($49) | $93.5M | $161.5M | $48.2M |
| **1.4× ($57)** | **$94.4M ← gate peaks** | $153.3M | $40.0M |
| 2.0× ($82) | $70.9M | $101.7M | **−$11.6M** |

**The shape is the whole point.** Gate revenue keeps climbing to 1.4× while net income falls
$12.8M — an owner optimising the ticket line alone is led somewhere materially worse than an owner
optimising the club. The optimum sits slightly *below* face, the curve is nearly flat across
0.8–1.0× (so a new owner who never touches it loses ~1%), and doubling the price turns a $52M
profit into an $11.6M loss. That is the published puzzle rendered as a decision, with no dominant
strategy in it.

A general result worth recording: the face price is exactly optimal when `k = g/(g+c)` — the
ticket's own share of per-fan revenue, **0.535** for MLB. The sourced 0.6 is a little above it,
which is why the model says a real club is very slightly over-priced at its own face.

### What is now live

`ticketing` becomes the **fourth** live delegation domain, and it is the first ask where Approve is
worth more than Hands-on for a reason other than convenience: **your staff recommend the price
CUT**, which is counter-intuitive and correct. A new owner reading the gate line alone would do the
opposite.

Pricing is **opt-in at the function level** — `gateFor` and `gateDay` behave byte-identically when
no price is supplied, and identically again when the price equals the face — so every existing
calibration test measures exactly what it measured before. That is asserted directly rather than
assumed. The owner is clamped to 0.5–2.0× face, because outside that band the model is
extrapolating past anything the research covers.

**Impact:** attendance and four revenue accounts now respond to an owner decision that previously
did nothing; net income swings **$64M** across the legal price range on an MLB club. No measurable
runtime cost — one multiply per home date.

Rejected: constant-elasticity demand (above); a long-run fan-base erosion term (invented to fix a
problem that only existed in the rejected model); letting the owner price outside 0.5–2.0×;
scaling the concession, parking and merchandise lines with the ticket price (a fan's hot dog does
not cost more because his seat did — and that asymmetry IS the mechanism).

## 2026-09-05 — Payroll is real, and the naive model would have bought 45 wins for a doubling

**D102 · The last inert owner lever. `state.payrollBudget` was written at new-game and read by
nothing; it now sets both the talent an organization signs and what those contracts cost, so it
moves wins AND drains cash — which no other lever in this game does.**

### Two slopes, measured separately, and why that mattered

`RESEARCH.md` §26 has the full working. The short version is that measuring **one** slope would
have produced a badly wrong model:

- **+1 point of team talent is worth ~5.5 wins** over 162 games (measured, 3 seeds per point).
- **Buying talent at `contractFor`'s own ovr→salary curve gives ~8.3 points per payroll doubling.**

Multiplied, those say doubling payroll buys **45 wins** — a 2× payroll club at ~128 wins. The
"self-consistent" model, the one that falls out of the engine's existing curves with no new
constants at all, is the wrong one. Published cost-per-win data says the real spread is about
**62–100 wins across a ~4.5× payroll range** (~17.5 wins per doubling), so the adopted figure is
**3.2 talent points per doubling** — money buys talent far more slowly than the engine's own
pricing implies.

That difference is not a fudge. **An owner is bidding against 29 other clubs for the same players,
and the premium is the market.** It is modelled as a per-player `marketFactor` on `contractFor`, so
every contract stays a real number and the payroll expense equals what the owner authorised —
rather than posting a budget the roster's own contracts do not add up to.

### Verified end to end, not just at the formula

Four rollovers plus a played season, so the authorised budget has largely replaced the opening
roster: **$88M → 61.5 wins, $175M → 75.5, $350M → ~95.** Implied cost per marginal win across the
range: **$7.8M**, against a ~$6.5M anchor derived from the sourced "replacement wins a third of its
games" convention. Actual contracts run ~10% under the authorisation because contracts persist,
which is correct rather than an error.

### Two defects this pass found, both pre-existing

1. **`payrollBudget` was stored in the wrong unit.** `newGame` set it to `E.payroll`, which is a
   MONTHLY figure, while `scoutingBudget` beside it holds an ANNUAL one — and `state.ts`'s own
   comment claimed they used "the same convention." Harmless while nothing read the field;
   the moment this pass did, the default budget would have read as 0.083× the norm and clamped to
   the 0.5× floor, quietly making every new save a fire sale. Now stored annually.

2. **An unanswered ask overwrote the owner's own setting.** The first version of
   `resolvePayrollBudget` took the fallback unconditionally, so a budget set by any other route
   snapped back to the league norm at the next rollover. **Caught by a test that set the budget
   directly and watched it reset** — silence must cost nothing, at every ask, and now does.

### The one ask with no recommendation

`payroll` becomes the **fifth** live delegation domain, and its ask deliberately carries **no staff
pick at any level**. Ticket pricing has a right answer and the staff give it (D101). Payroll is a
*trade-off* — win now or bank the money — and nothing in the engine knows which the owner wants. A
recommendation here would be inventing a preference they never stated.

**Impact:** the first lever that can make a club poorer. Payroll swings **$77M → $306M** in actual
contracts across the authorised range, against a club that was previously accumulating cash
monotonically at every level (D100). The insolvency fail state and the month-end cash call — both
measured as unbuildable in D100 — now have something to be about.

Rejected: letting the naive self-consistent talent-per-dollar rate stand (45 wins a doubling);
posting the authorised budget as the expense while contracts said otherwise (breaks double entry,
and Books would show it); applying the talent shift to players already under contract (you cannot
buy a better version of a man you already employ — it lands on the intake, so the decision
compounds across seasons, which is the right timescale for an owner).

## 2026-09-05 — The Roster page, and the defect it exposed the moment anyone could look

**D103 · A baseball game in which you cannot see your own players. The Roster page lights, per
D96 as a view of an asset rather than an editor — and looking at it immediately surfaced an engine
defect no test had any reason to catch.**

### The page

Every player in the organization, MLB down to Single-A, grouped by level, sortable by grade,
ceiling, age or salary. **It offers no way to move anybody, and that is the design**, not an
unfinished feature: D96 settled that promoting, demoting and releasing are a general manager's job,
and a Roster page with those buttons would be exactly the assumption D96 exists to reject. The page
says so in a line at the bottom and points at the Delegation screen, so the absence reads as a
decision. A Playwright check asserts no such button exists.

**Law 10 becomes visible for the first time.** Every grade shown is a *scouted* estimate, and each
row carries a five-step confidence bar from `p.rel` — how much the organization actually knows
about that player. That is what the scouting budget buys (D90, D100), and until now nothing in the
app showed it. A 23-year-old with a 70 and two bars is a completely different asset from a veteran
with a 70 and five.

### What looking at it found

The first screenshot showed a roster where **every 65-grade player earned exactly $13.00M and every
60 earned exactly $8.95M.** `contractFor` priced contracts purely off `p.ovr`, which is rounded to
the nearest 5 — so a 40-man roster carried about **four distinct salaries**. No unit test was ever
going to flag that; it is only obvious when you render forty rows next to each other.

That is the reverse of how a real roster works. **Salary dispersion at equal talent is the defining
financial feature of baseball**, and its cause is service time, which this engine has carried on
every player since the roster pass and never once used for pay.

### The fix, and it was already sourced

RESEARCH.md §15.1 had the structure at T1 all along: under 3.000 years a player earns near the
league minimum; from 3.000 to 6.000 he is arbitration eligible; at 6.000 he is a free agent paid
the market. `salaryForService` implements exactly that, with the league minimum at **$780,000**
(T1, 2026) and arbitration at roughly 25/40/60% of open-market value (**T3** — a widely used rule
of thumb, not a published schedule, and labelled as such).

Measured on one real 40-man roster, before and after:

| | distinct salaries | min | max |
|---|---|---|---|
| before | ~4 | $8.95M | $13.00M |
| after | **16** | **$0.80M** | $13.00M |

And the shape is right: three different 60-grade players now earn $800K, $5.40M and $8.95M
depending on where they are in their service clock.

### The claim in D102 that this proved wrong

D102 said the payroll expense "equals what the owner authorised." **It no longer does, and it
should not.** Contracts now total **62–70%** of the authorisation, because a roster carrying
pre-arbitration and arbitration players is genuinely cheaper than its talent. A real club's payroll
IS the sum of its contracts, and coming in under budget is good management rather than a leak. The
test that asserted "close to" has been replaced by one that bounds the discount from both sides —
between 45% and 95% — so it stays a discount rather than drifting into a disconnect.

**The calibration got better, not worse.** Cost per marginal win moved from **$7.8M to $5.25M**,
closer to the ~$6.5M anchor D102 derived. Wins across the payroll range are unchanged (61.5 / 75.5 /
91.0), because only pricing moved, not talent.

Also fixed by reading the same screenshot: the ceiling column repeated the grade on every veteran
row, because `refineScout` leaves potential equal to the current grade past age 25. It now shows a
dash — "he is what he is" — and the number only when there is genuinely more to come.

Rejected: re-solving D102's market exponent so contracts match the authorisation again (it would
mean paying MORE per player to cancel out the service discount, which is the realistic part);
adding promote/demote/release controls (D96); showing true grades anywhere (Law 10).
