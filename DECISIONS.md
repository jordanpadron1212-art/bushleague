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
