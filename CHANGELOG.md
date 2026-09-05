# CHANGELOG — Bush League

Newest first. Through Build 0.10 this was regenerated from the `BUILD` const at the top of the single
HTML artifact (LAWS.md's old Law 13). As of v2.0.0 there is no more artifact file to carry that const —
entries are written directly here, one per pass, versioned against `package.json` and a git tag.
See `DECISIONS.md` D78.

## v2.19.0 · PAYROLL IS REAL — AND THE OBVIOUS MODEL WOULD HAVE BOUGHT 45 WINS — 2026-09-05

The last inert owner lever. What you authorise for payroll now sets both the quality of who your
organisation signs and what those contracts cost — so it moves wins and, for the first time in this
game, it can make a club poorer.

Two slopes were measured separately, and measuring only one would have shipped a badly wrong model.
A point of team talent is worth about 5.5 wins over a season. Buying talent at the salary curve the
game already uses gives about 8.3 points per payroll doubling. Multiply them and doubling payroll
buys 45 wins — a big-spending club winning 128 games. The self-consistent model, the one that needs
no new constants at all, is the wrong one.

Published cost-per-win data says the real spread is roughly 62 to 100 wins across a 4.5x payroll
range. So money buys talent far more slowly than the engine's own pricing implies, and the gap
isn't a fudge: you're bidding against 29 other clubs for the same players, and the premium is the
market. It's modelled as a per-player premium, so every contract stays a real number and the
payroll expense equals what you actually authorised.

Verified across four rollovers plus a played season, so the budget has replaced the opening roster:
$88M buys 61.5 wins, $175M buys 75.5, $350M buys about 95. That's $7.8M per marginal win against a
$6.5M anchor. Contracts run about 10% under the authorisation because deals persist — a club that
raises its budget carries older, cheaper contracts for a few years, which is right rather than an
error.

Two pre-existing defects surfaced. The payroll budget was stored monthly while the scouting budget
beside it was stored annually — and the code comment claimed they matched. Harmless while nothing
read it; the moment this pass did, every new save would have quietly started at the minimum. And an
unanswered payroll question overwrote a budget set any other way, snapping it back to the league
norm at the next rollover. A test that set the budget directly and watched it reset caught it.
Silence must cost nothing, at every question.

Payroll is the fifth live delegation area, and its question deliberately carries no staff
recommendation at any setting. Ticket pricing has a right answer and your people give it. Payroll is
a trade-off — win now or bank the money — and nothing in the engine knows which you want. A
recommendation there would be inventing a preference you never stated.

See `DECISIONS.md` D102 and `RESEARCH.md` §26.

## v2.18.0 · TICKET PRICING IS REAL — 2026-09-05

The ticket price has been stored in every save since the state-wiring pass and read by nothing.
Now it moves both how many people come and what they're worth.

Ticket-price elasticity is published, so it wasn't invented. MLB ticket demand is price-inelastic
at observed prices — replicated since 1974, and known in the literature as the inelastic pricing
puzzle. The source used here models 23 MLB clubs across 1970–2003: most teams' long-run
elasticities are well under 1, a couple below 0.5, a minority elastic. This uses 0.6, inside that
range.

The reason it fits this engine so exactly is the mechanism the same paper gives: teams price low
because a fan in the park buys concessions and souvenirs. This game already tracks four separate
per-fan lines, and for an MLB club 46% of what a fan is worth isn't the ticket. So the published
finding didn't have to be coded in — it falls out of the engine's own revenue split once
attendance responds to price.

The obvious demand model was nearly shipped and is provably broken. Constant elasticity has no
interior revenue optimum — its only stationary point is a minimum, so revenue dips and then climbs
forever, and the model's advice becomes "charge $205 a ticket." An invented fan-loyalty decay term
had already been written to stop the resulting dominant strategy. Checking the arithmetic before
building killed both: the second invention only existed to cover the first mistake.

Measured across real seasons, the shape is the finding. Net income peaks at 90% of face. Gate
revenue keeps climbing to 140% of face — $94M against $89M at face — while net income drops from
$53M to $40M. Chasing the ticket line leads you somewhere $13M worse. Double the price and a $52M
profit becomes an $11.6M loss. Leave it alone and you give up about 1%.

Ticket pricing is now the fourth live delegation area, and the first where Approve beats Hands-on
for a real reason: your people recommend cutting the price. That sounds wrong and is right.

Everything is opt-in at the function level, so every existing calibration test measures exactly
what it measured before — asserted, not assumed. See `DECISIONS.md` D101 and `RESEARCH.md` §25.

## v2.17.0 · THE DELEGATION DIAL — 2026-09-05

You own the club. You don't have to operate it. Every area of the business now has a setting —
Hands-on, Approve, Notify, Silent — and it decides whether your people ask you first, tell you
after, or just handle it. Set per area, changeable any time. This is the mechanic the whole game
answers to.

Seven agents designed and critiqued this in parallel. Their dominant finding was that every
emitter all four designs proposed fired at the season rollover — which runs once a year, against
~190 day-advances. A desk fed only by the rollover is empty 189 days out of 190. That is annual
mail, not a desk, and it would have missed the entire point.

Two claims were verified against the real code rather than trusted, and both held exactly. The
rollover moves the clock 186 days in one call, so any expiring desk item filed there would lapse
before you could see it — which is why nothing here expires; each question is consumed at the
moment it would matter. And an owner's answer already reshapes the whole world: the same rollover
consumes 310,466 random draws under best-player-available, 309,971 under fill-needs, 309,540
under upside. Two designs had built machinery to defend an invariant the engine never had. The
property that actually matters is that the dial's routing can't move the simulation — your answer
legitimately can, because that's what an answer is.

The critique's own centrepiece was a monthly cash call: borrow, cut scouting, or ride it out when
cash breaks a floor. Measuring the cash curve killed it. Every club at every level accumulates
money monotonically — the Yankees go from $170M to $335M over three seasons, and the tightest club
in the game dips 25% once and then climbs. Nothing is ever in trouble, because payroll and ticket
price are both inert and nothing drains the balance. That feature would have been a trigger that
never fires. It is not built, and the measurement is recorded so nobody proposes it again before
the economy has a spending lever.

What's on the desk instead: a month-end close (cash and the month's net, ~7 times a season, on
ordinary days), your draft policy for the year, and what you're spending on scouting — which also
closes a gap open since v2.11.0, where the scouting budget was real but had no owner-facing
control at all.

The four settings genuinely differ. Hands-on asks and offers no recommendation — you said you'd
decide. Approve asks and your people name their pick. Notify acts and tells you. Silent acts and
says nothing. Every one of them writes to the log: Silent costs you the notice, never the record.
And every question shows what happens if you ignore it, before you ignore it.

Staff hiring is never delegable, and that's enforced by the type system rather than by a rule
someone has to remember — it isn't representable in the settings at all. The screen still shows it,
as a control you can't move, because hiding it would hide the rule.

Three of eleven areas have something behind them today. The other eight say "not yet active" and
what they're waiting for, rather than pretending to work.

Verified with a control test first: the fingerprint used to prove worlds identical is itself shown
to detect a single extra random draw, so no equivalence claim below it is vacuous. 356 engine
tests, 24 app tests, 60 browser checks. Two bugs were caught by looking at screenshots rather than
by assertions. See `DECISIONS.md` D100.

## v2.16.1 · THE SAVE WAS WRITTEN 190 TIMES A SEASON — 2026-09-05

A design review flagged that every day-advance wrote the whole save to IndexedDB. Verified, then
fixed — and the fix is not the one the first framing implied.

Measured in a real browser: the save is 2.39 MB, of which 89.5% is the 5,750 players and 8.6% is
the schedule's 13,866 rows. There is nothing to trim — that is the game, and the pending
world-configuration work makes it bigger. So the question was how often to write, not what.

The obvious story — "a 23 ms write blocks every click" — turned out to be wrong, and measuring it
said so: the store already calls `set()` before awaiting the write, so the put runs after the click
handler returns. Synchronous work per advance was 8.2 ms before and 7.7 ms after. That is noise,
and this entry says so rather than claiming a frame-rate win.

What actually changed, counted by instrumenting IndexedDB directly over 30 days of play:
30 writes and 73.8 MB become 1 write and 2.6 MB. Roughly 467 MB of storage churn per season
becomes ~16 MB. That is an I/O, battery and flash-wear fix, and it matters most on a phone, where
this game is most likely to be played and where IndexedDB is slowest.

Writes are now queued and coalesced: a write scheduled while another is pending replaces it, which
is safe only because the state is cumulative rather than a delta. A 400 ms quiet timer catches a
burst of clicks; a 2 s staleness cap means holding Advance still persists as it goes.

Write-behind adds two ways to destroy a save that writing immediately does not have — a queued
write landing after a new game (silently reverting it) or after a delete (resurrecting it). Both
are cancelled inside the persistence layer rather than left to callers, both are tested, and both
tests were verified to genuinely fail when the guard is removed.

The app flushes when the page is hidden, which is when a phone actually leaves a game.

Accepted cost, stated plainly: up to ~2 seconds of play may not be on disk at any instant. Nothing
corrupts — the state is cumulative and the engine deterministic, so a killed tab costs a few
replayed days. See `DECISIONS.md` D99.

## v2.16.0 · SAVES CAN NOW SURVIVE A SCHEMA CHANGE — 2026-09-05

Every save has carried a version stamp since v2.9.0. Nothing ever read it. That's fine while the
schema has never changed and catastrophic the first time it does — and two schema changes are
already designed and waiting (world configuration, and the delegation dial).

What the old behaviour actually looked like was witnessed rather than imagined: a check written
this pass planted a save from a "newer build" and ran it against the previous bundle. The app
didn't refuse it and didn't crash cleanly either — it rendered `Unexpected Application Error!
l is not iterable`, ten frames deep in a minified router callback, with nothing on screen
mentioning saves or versions.

Worse was what came next. A failed load left the app thinking there was no save at all, so it
showed the club picker — and picking a club overwrote the save that had just failed to open. A
recoverable problem became permanent in one click. Refusing to load a damaged save is only half a
safeguard; refusing to let the next screen destroy it is the other half.

Now: a migration registry, a chain walker, and a load that returns either a state or a clear
refusal callers can't ignore. Six distinct refusals, because each needs different advice. A save
from a newer build is refused outright rather than guessed at. Malformed migration *registries* —
a gap in the chain, two migrations claiming the same version, one that doesn't move forward — are
caught as carefully as malformed saves.

The rule the whole thing rests on: a migration operates on plain JSON, never on the current
`GameState` type. A migration typed against today's state silently starts claiming that saves
written before a field existed already have it. The types agree; the data doesn't.

When a migration runs, the original save is copied to a backup slot before anything is
overwritten. When a load fails, nothing is written at all — verified by reading the raw bytes back
after a refusal. No UI reads the backup yet; that gap is disclosed, and the data is kept, which is
the part that can't be added later.

A new screen replaces the silent fallthrough: what happened, in plain words; "Nothing has been
deleted," which is true and is the most useful sentence on it; and starting over as a two-step
path that names its consequence before it can be taken.

Reading a screenshot of that screen caught what no assertion did — the engine's message and the
screen's guidance said the same thing twice, one under the other. The split is now strict: the
engine states the problem, the UI states the remedy.

Testing a migration framework with nothing yet to migrate needed two documented test-only seams,
so the mechanism isn't exercised for the first time on the day it first matters. The most valuable
test is the smallest: every version must have a path to the current one — the test that fires when
someone bumps the schema and forgets the migration.

Impact: negligible at runtime (one version check and ten field checks per app start). Decisive on
capability — the two queued schema changes are now safe to make. 321 engine tests, 18 app tests,
42 browser checks. See `DECISIONS.md` D98.

## v2.15.1 · PLAYER IDS WERE A TIME BOMB — 2026-09-05

v2.14.0 disclosed a suspected id-collision risk instead of fixing it. This pass measured it, found
it real, and fixed it structurally.

Ids were a random draw from ~1e9 values, which sounds like plenty and isn't — collisions scale with
the square of the population, the same reason a room of 23 people probably shares a birthday.
Measured, not argued: 50,000 generated players collide once, 100,000 collide four times. A sandbox
save mints roughly 1,600 players a year, so a century-long save passes 160,000 and collides
repeatedly. And a collision doesn't crash — the engine keys players by id into a Map, so one player
silently overwrites another and the lineups, contracts and draft records pointing at him quietly
re-point at someone else.

Every real creation site now mints an id that can't collide by construction: `pr:<club>:<slot>` for
world rosters, `pd:<year>:<pick>` for the draft, `pc:<year>:<club>:<n>` for churn. Uniqueness is now
a property of the scheme rather than a probability.

One trap was caught while writing the fix and is worth naming: writing the fallback as
`opts.id ?? randomId()` would have short-circuited the random draw, consumed one fewer value from
the seeded stream, and made the same seed generate a different world depending on whether callers
passed ids — breaking save-reproducibility while every existing test still passed. The draw now
happens unconditionally, and a test proves the two streams stay in lockstep.

`test/identity.test.ts` guards it, and was verified to genuinely fail: removing the id from one
creation site makes it fail immediately. Its most important assertion is a prefix check, so a future
creation site that forgets to pass an id is rejected in the same commit that adds it. A fifty-season
soak confirms no id is ever reused for a different person.

Impact: negligible at runtime (286 tests still run in ~97s, no new allocation), decisive on
correctness. See `DECISIONS.md` D97.

## v2.15.0 · THE VISUAL DIRECTION, SIGNED OFF AND SAVED — 2026-09-05

Asked whether the UI was working, the answer was that it wasn't. Three rounds of real, cited
research — premium fintech dashboards, Bloomberg Terminal's own accessibility rebuild, esports
broadcast overlays, and the newest Baseline CSS — produced a direction, iterated live until it
landed. It's now saved in the repo: `design/war-room.html` is the approved reference render,
`design/DESIGN-SYSTEM.md` is the buildable spec. Every future screen and feature is built in
this scheme.

The core is a rule rather than a palette: the accent touches data and action only, never chrome,
and "direction" (up/down) is a separate channel that is never brand and never customizable. That
rule is what reads as expensive — which is exactly why the hues themselves could then be made
fully customizable without the design coming apart. Two hue dials drive every colored thing on
the page, held at a lightness and chroma that stay in-gamut across the whole hue circle, with
OKLCH where it parses and HSL everywhere else, and `@property` making a theme change glide across
the entire page instead of snapping. Palettes persist and are encoded in the URL, so a link
carries a theme.

Also shipped in the reference: split-flap scoreboard digits, a rotating conic-gradient live
border, a cash-flow waterfall and a real measured price-of-a-win chart (a 41× spread across the
independent leagues, straight from this project's own economic QA), a drag-to-compare wipe, a
payroll gauge, keyboard control of everything, scroll-driven reveals, film grain, and an aurora
built from the theme's own hues.

Three real defects were found by building and then researching it: a variable collision that
would have silently broken the gauge, single-key shortcuts that violated WCAG 2.1.4 Level A with
no way to disable them, and a per-second countdown left readable by screen readers. All three
fixed. One technique — `document.startViewTransition()` — was instrumented, found to silently
never fire here, and cut rather than shipped as a decorative risk.

Not done, deliberately: the app itself still ships the original palette. The re-skin is specified
in `design/DESIGN-SYSTEM.md` §7 and waits for the world-configuration work, since that adds the
most important screen in the game and re-skinning three screens before adding a fourth is
backwards. See `DECISIONS.md` D94.

## v2.14.0 · THE AMATEUR DRAFT — 2026-09-04

With scouting (v2.11.0) and parent affiliation (v2.12.0) both real, the standing blocker on the amateur
draft was gone. This pass builds the draft itself: `draft.ts` generates a fresh amateur talent pool (600
prospects, scored on scouted grades only, never hidden true ones), a real draft order with the sourced
top-6 lottery (RESEARCH.md §1.5's 16.5%-odds anchor for the three worst records; the rest of the 18-team
pool's curve is a disclosed T3 approximation), and 20 rounds of picks. Per Jordan's own direction, no pick
is interactive — every club drafts automatically, best-player-available, except the owner's own club,
which follows a settable philosophy (best-available / fill-needs / upside) via a new `DraftPhilosophy`
control on the Draft page.

Drafted players are routed through `churn.ts`'s existing fill-vacancy mechanism rather than a new
"prospect pool" concept: a MiLB affiliate's own vacancies now check its parent org's undrafted picks
(`Club.parent`, v2.12.0) before falling back to a random signee. A draftee never displaces a survivor and
never lands directly on the MLB roster — only on the drafting organization's own MiLB affiliates.
`startNewSeason` runs the draft before churn, so the lottery reads real pre-reset standings.

The Draft page (`apps/web/src/pages/DraftPage.tsx`) is real for the first time — a stat-tile summary, the
philosophy selector, and a round-grouped, filterable pick board with the owned club's picks visually
marked. Screenshotted and reviewed at 360px/1440px across both shells/themes and both the empty and
populated states, catching and fixing two real bugs (a grammar slip, and two stat-tile labels truncating
mid-word in the "desk" shell's uppercase tracking at 360px).

Disclosed rather than fixed here: a genuine, pre-existing `makePlayer` id-collision risk (a ~1e9-value
id space, surfaced by a temporary draft-absorption diagnostic) — a different system's defect, left for
whoever picks it up next. Also deliberately out of scope: Competitive Balance rounds, the bonus-pool/
slot-value financial system, revenue-sharing lottery restrictions, and interactive picking.

Verified: `draft.test.ts` (10 new tests) and 3 new `rollover.test.ts` integration tests; full workspace
suite (282 sim-kit + 8 apps/web tests) passes, typecheck clean, build succeeds, 32/32 Playwright visual
gate passes (up from 24, adding the Draft empty-state as a permanent check). See `DECISIONS.md` D93.

## v2.13.0 · FIX: EVERY CI RUN HAD BEEN FAILING SINCE THE REWRITE BEGAN — 2026-09-04

Asked whether there was anything to test-play, the honest first step was checking whether the GitHub
Pages deploy actually existed. It didn't — every one of this project's 14 CI runs, from v2.0.0 through
v2.12.0, shows `conclusion: failure` on GitHub's own API. Because the build job's test failure
short-circuits before the deploy step ever runs, no version of this game had ever gone live, despite
every pass's own local verification (tests, build, the Playwright gate) reporting green every time.

Root cause, reproduced directly with a real downloaded Node 24 binary (CI's pinned version) rather than
guessed from the stack trace: a cross-realm class mismatch between jsdom's `AbortController`/`AbortSignal`
polyfill and Node 24's own stricter `undici`-based `Request` validation. `react-router`'s data router
calls `new Request(href, { signal })` on every navigation; a signal built from jsdom's shadowed
`AbortController` fails Node 24's `instanceof AbortSignal` check, throwing inside `app.test.tsx`'s
club-picker/action-bar tests every time — but not under Node 22, which every local session had been
running without anyone noticing the version gap.

Fix: `apps/web/test/setup.ts` now imports `fetch`/`Request`/`Response`/`Headers`/`FormData` from the
standalone `undici` package (new devDependency) and assigns them onto `globalThis`, so every fetch call in
a test resolves through one self-contained implementation instead of split between Node's native undici
and jsdom's incompatible polyfill. Chosen over pinning CI to Node 22 — this project's own `engines` field
already declares `>=22`, so Node 24 is a supported environment this fix should actually work under, not
route around.

Verified against the real failing environment: full workspace suite (269 sim-kit + 8 apps/web tests),
typecheck, build, and the 24-test Playwright visual gate all pass under a real Node 24 binary; re-verified
clean under Node 22 too, so the fix doesn't regress the environment that already worked. See `DECISIONS.md`
D92.

## v2.12.0 · REAL MINOR-LEAGUE PARENT AFFILIATION, RESEARCHED AND SOURCED — 2026-09-04

Before starting the amateur draft, a real blocker surfaced: this project never recorded which MLB
organization owns which of the 120 affiliated MiLB clubs `buildWorld` already generates — a real pick
needs somewhere real to go. Rather than guess past it, this pass researched and sourced the mapping as
its own deliverable: RESEARCH.md §2.6, cross-checked two independent ways for all 120 pairings (per-league
membership tables AND agreement with this project's own already-sourced city inventory). A new `parent`
field on `Club` (`world.ts`), fed by a `${level}:${city}` lookup (`world-data.ts`'s `MILB_PARENT`), set
once in `buildWorld()`. See `DECISIONS.md` D91.

One real, dated wrinkle handled deliberately: 2025 and "current" (2026) affiliations differ in 5 of 120
slots (real relocations — an Orioles High-A swap, a Brewers Single-A move, a 3-way California League
domino). This project uses the current mapping, since it's the one that actually keys against the 120
city slots already generated — the literal 2025 mapping would leave three real clubs parentless while
pointing at three that don't exist here. One city of 120 ("Hill City," Single-A Carolina League) couldn't
be matched against any real source and is left unassigned rather than guessed — a genuine, narrow,
disclosed gap, likely a pre-existing data question in this project's own city inventory, not fixed here
since it's outside this pass's scope.

The test suite caught a real defect exactly the way it's supposed to: the first hand-transcribed version
of the mapping silently dropped the Chicago Cubs' affiliate in all four levels, caught immediately by a
new assertion ("every MLB club owns exactly one affiliate per level"), diagnosed and fixed before this
pass closed.

Pays off twice: it's the correct foundation for the amateur draft (next pass) AND separately closes
ROADMAP.md's own long-standing "the Organization page stays dark until [parent affiliation] is
researched" blocker.

Verified: `world.test.ts`'s new tests (119/120 affiliated clubs resolve to a real MLB parent in the same
world, no dangling references; the one exception is exactly Hill City; every MLB club owns exactly one
AAA/AA/High-A affiliate and 29 of 30 own exactly one Single-A affiliate). Full workspace suite (269
sim-kit + 8 apps/web tests), typecheck, build, and the 24-test Playwright visual gate all pass.

## v2.11.0 · SCOUTING: A REAL MONTHLY COST, AND THE DEAD HALF OF D24 FINALLY READS — 2026-09-04

A club-level scouting budget closes two disclosed gaps: `economics.ts`'s long-standing "no monthly
SCOUTING cost is posted" (v2.7.0), and a genuinely new finding this pass surfaced while wiring it up —
`refineScout` was only ever called ONCE per player, at roster construction, so the sample-size-driven
reliability mechanism (v2.1.0, D24) never actually re-read a player's accumulated season stats after his
roster was built. `advance.ts` now recomputes it for the owned club's own roster on every real month
crossing, so a season of real plate appearances and innings finally reaches the reliability number. See
`DECISIONS.md` D90.

Scope, decided before any code was written: scouting only, not the amateur draft or the ownership ladder
— `FRONT-OFFICE-DESIGN-PROPOSAL.md` stays unsigned and gates staff/ladder work on its own open §1
question, and the draft needs an amateur-talent-pool system that doesn't exist yet. `scoutBoostFor` adds a
bounded reliability term (0 to 0.12, saturating at twice a level's baseline scouting spend) on top of the
existing sample-size formula, before the same [0.15, 0.93] ceiling already in place — spend buys clarity,
never certainty. `Economy.scouting` is a new, disclosed T3 dollar figure, sized deliberately small and
kept OUT of the empirically-solved `INDY_OPEX_RECAL` multiplier so it doesn't silently redistribute a fit
that was never asked to carry it; re-measured against `economics.test.ts`'s existing sourced-target
tolerances (MLB avg -21.1% → -23.8%, still inside the ±30% bound; the five independent leagues still
comfortably inside their own bounds) rather than assumed safe.

A real, unplanned emergent effect turned up while writing the verification: `roster.ts` builds every
lineup/rotation by sorting on the SCOUTED overall, so a well-scouted club's depth chart tracks true talent
sooner in a season than an unscouted one's — spend can measurably change who actually plays, not just a
displayed number. No owner-facing control exists yet to move the budget off its default (the same
disclosed shape `payrollBudget`/`ticketPrice` already established) — but the cost and its effect are both
real: "Scouting" appears in Books' income statement automatically, with zero new UI code, confirmed in a
real browser.

Verified: `scouting.test.ts` (10 new tests) covering the boost formula, the reliability ceiling, and three
end-to-end checks through the real `advanceDay` path; `economics.test.ts`'s six existing tests re-measured
and its comments updated to the new real numbers; full workspace suite (265 sim-kit + 8 apps/web tests),
typecheck, build, and the 24-test Playwright visual gate all pass.

## v2.10.0 · REAL ROSTER CHURN — 2026-09-04

`churn.ts` closes the exact gap v2.8.0 measured and disclosed: with no turnover, a rolled-over population
ages uniformly forever — "a closed population under an age rule has exactly one destination," this
project's own committed CHANGELOG.md records from the original build's own Build 0.9. Every rollover now
ages, develops, AND churns every club's roster in the world: some contracts expire and the player leaves
outright, some survivors are retained (an "exclusive re-sign window," simplified to instant retention),
and the rest is filled exactly the way a brand-new world's ever was — legal-by-construction, not made
legal after the fact. See `DECISIONS.md` D89.

Deliberately a smaller slice than the original build's own Build 0.9 winter cycle — no free agency, no
market screen, no AI negotiation, no amateur draft; those stay real, separately-scoped future work. Re-
solved against Build 0.9's own measured target already sitting in this project's committed history: median
Frontier age 26 (exact, every year across six rollovers), 14.6% aged 28+ (close), 32.6% roster continuity
(running somewhat above the 24-41% real range, understood not chased further). One target — 2.4% aged
30+ — is structurally unreachable by this port's own legal-by-construction design (the Frontier comp
table reserves exactly 2 of 25 Veteran slots, 8.0%, the "rulebook allows 8%" ceiling the source itself
names as distinct from what the original actually reached) — measured, explained, and disclosed rather
than chased by weakening the same legality guarantee the rest of this project already proved.

Verified: `churn.test.ts` (5 tests) against the sourced target; `rollover.test.ts`'s own D87-era tests
updated for the new reality — the population's average age now STABILIZES across eight consecutive
rollovers instead of climbing every year, verified directly, not assumed. Manually, in a real browser: a
full season played to exhaustion, "start the next season" clicked (running churn across all 218 clubs),
the new season opening clean with real games, real standings, real cash — no console errors.

## v2.9.0 · A SAVE CAN REACH ITS SECOND YEAR, FROM THE APP — 2026-09-04

`rollover.ts`'s `startNewSeason` (v2.8.0) gets a real caller: the action bar detects an exhausted
schedule (`state.sp >= state.sched.length`, computed directly from state rather than a stale last-advance
result that a reloaded save never has) and offers to roll into the next year, wired through a new
`gameStore.startNewSeason` action seeded the same reproducible way `advance.ts`'s own day-scoped RNG
already is. See `DECISIONS.md` D88.

Verified: a new `app.test.tsx` case fast-forwards a real state to `seasonOver`, renders the real app,
clicks the real button, and confirms a fresh 0-0 season starts. Manually, in a real browser: clicked
through an entire season to "START THE 2027 SEASON," screenshotted it at 360px specifically because the
label is longer than the ordinary advance button ever gets — no overflow, no console errors — then
clicked it and watched cash carry over, every record reset, and a real new schedule take over.

## v2.8.0 · PLAYER DEVELOPMENT AND AGEING — 2026-09-04

`development.ts` gives every player real, component-specific ageing for the first time in this rewrite —
new logic, not a port (the original never built this either). Eleven tools, sourced individually to
RESEARCH.md §18: speed peaks earliest (~23) and falls hardest; power peaks next (~26); contact and plate
discipline are the most stable, peaking ~29; pitch movement is far more stable than raw stuff/velocity;
and pitcher control is genuinely role-aware — starters improve into their mid-20s and hold, relievers
erode from the outset, opposite shapes pulled directly from §18.3's own table. `rollover.ts` gives a save
the minimal mechanism to reach a second year at all: ages and develops the existing population, resets
every club's season record, and regenerates the schedule — deliberately NOT the original's own winter
system (free agency, contract expiration, an amateur intake), which stays real, separately-scoped future
work. See `DECISIONS.md` D87.

Verified against the sourced findings' own shape, not an exact replica of any one number: a 2,000-3,000-
player simulated population aged 20-40+ reproduces the sourced peak-age ordering exactly, and starters'
and relievers' control trend in opposite directions from an identical starting population. Also verified,
and disclosed rather than hidden: with no roster churn yet, a club's average age climbs monotonically
across consecutive rollovers — the same closed-population effect the original build's own v0.9 pass found
and solved with real churn, reproduced here on purpose as a stated, known consequence of this pass's own
deliberately smaller scope, not a surprise for later.

Sim-kit only this pass — no UI wiring. `startNewSeason` is a real, tested, callable primitive; nothing in
`apps/web` calls it yet (bundle size unchanged, confirming it). Not yet built: retirement (no sourced
hazard curve exists to build one from), free agency/contract expiration/an amateur intake, and the UI
affordance to actually reach a new season from the app.

## v2.7.0 · GATE REVENUE AND PAYROLL POST FOR REAL — 2026-09-04

`ECON`/`econFor`/`attFor`/`gateFor`/`gateDay`/`postMonth`/`seedOpeningBooks`/`rosterPayroll` ported into
`economics.ts` and wired into `newgame.ts`/`advance.ts`. Books stops being real-but-empty and becomes
real-and-populated: opening capital seeds the ledger before a game is played, gate revenue posts on every
home date against real attendance, and operating costs and payroll post monthly. See `DECISIONS.md` D86.

The primary source (`bush-league-v0.10.html`) was not available in this container for this pass — never
committed to git, only ever an attachment in an earlier session. `ECON`/`econFor`/`attFor`/`gateFor` were
already fully ported before that was discovered; `gateDay`/`postMonth`/`seedOpeningBooks`/`rosterPayroll`
were reconstructed from this project's own detailed working notes instead, explicitly flagged as such.

That reconstruction caught two real, order-of-magnitude bugs, both against this project's own committed
historical record (`CHANGELOG.md`'s own Build 0.7 entry, `DECISIONS.md` D42/D48/D49), not assumed fixed:
every flat operating line was posting 12x/year while divided by a 5-7-month season length (**-$188M** on
a $200M-revenue MLB club before the fix), and — after that fix — every independent league still netted
roughly **80% of revenue as profit**, an order of magnitude off the sourced "-$385 to +$963 at .500"
target those same historical entries state directly. Re-solved the same way the original build's own
D49 describes solving it the first time: fit net against win% across simulated seasons, read the
intercept at .500. Landed within roughly 10 points of revenue on average across all five independent
leagues, on seeds the solve never trained on. MLB payroll also turned out to spread over all 12 calendar
months, not in-season only (D48, stated directly) — the opposite of this pass's own first draft.

Verified: `economics.test.ts` (6 tests) — the ledger stays balanced across full simulated seasons, cash
never collapses during the pre-season runway, MLB and all five independent leagues land within a bounded
margin of the tuning target (not an order-of-magnitude miss), the MLB media receivable stays bounded to
one month's accrual. Manually, in a real browser: a fresh save's ledger seeded with real opening capital,
45 days of advancing producing real gate-revenue and monthly-cost entries, a real balanced balance sheet,
`auditBooks` reading PASSES — at both 1440px and 360px, both shells, both themes, zero console errors.

Not yet built: a monthly scouting cost (chart-of-accounts entry 5300 exists; no sourced dollar figure
survived the reconstruction, left unposted rather than invented), player development/ageing, the ownership
ladder past "pick one of 30 MLB clubs," and a season-reset/year-rollover function.

## v2.6.0 · A GAME CAN BE STARTED, PLAYED, SAVED AND RELOADED — 2026-09-04

`GameState` carries real types, `newGame()`/`advanceDay()` assemble and drive a save, IndexedDB
persistence exists (via `idb`), and Office + Books are wired to real state — UI.md §13.3's own
signed-off checkpoint scope. The first pass to touch `apps/web` since the original chassis: a real club
picker (all 30 MLB clubs), a real Office page (real standings, real next-game, real streak), and a real
Books page (income/balance/cash/ledger/audit, all five panes real). See `DECISIONS.md` D85.

A genuine improvement over the original, not just a port: the RNG stream is now fully save-reproducible
— each day's games draw from a fresh RNG seeded by `state.seed + that day's serial number`, closing a
gap the original never closed (a reloaded save there drifted onto a different future than an unbroken
session). Verified directly: two independent states built from the same seed and advanced one day
produce byte-identical results.

One real bug caught before shipping: an IndexedDB connection leak that hung `deleteDatabase()` forever
(a real browser API behavior, not a test-only quirk) — caught by the test suite itself timing out.
Fixed by closing each connection after use. A second thing caught before costing a day: the installed
`@tanstack/react-table` (9.x) turned out to be a genuine API rewrite from the v8 shape this project's
docs were written against — the Books ledger grid uses plain React state for sort/filter instead,
deferring both TanStack libraries to the Roster pass where their 26-column, many-row scale actually
justifies them.

Verified with real browser screenshots at every step, not just assertions: choose a club → real
generated world and schedule → advance a day → real standings update → reload the page → byte-identical
state back. The full Playwright visual gate passes 24/24 across the club picker, Office and Books.

Not yet built: the ownership ladder itself (MLB-only club selection for now), a season-reset/year-
rollover function, the decision queue, the wire, and — the next pass, ranked first — the gate-revenue/
payroll posting system that turns Books from real-but-empty into real-and-populated.

## v2.5.0 · A SEASON CAN BE PLAYED — 2026-09-04

`playDay`/`pushForm` ported into `@bushleague/sim-kit` (`season.ts`), from
`bush-league-v0.10.html`. Walks a built schedule day by day, calls `simGame` for every game on it, and
updates every participating club's record (wins, losses, runs scored/allowed, games played, a rolling
last-10 form window) in place. This turns v2.4.0's "a game can be simulated" into "a season can be
played." See `DECISIONS.md` D84.

Small finding on `Club`, caught before being ported forward as if it were live state: the original's
`l10w` field is written once at creation and never read again anywhere in the source (confirmed by
grep) — the real rolling window is a separate array (`l10`) `pushForm()` actually maintains. This
port's `Club.l10` IS that real array, not the dead placeholder.

Verified at the largest scale that was actually cheap: the full real 218-club world, its full real
schedule, played end to end in under 3 seconds. Closed-system identities hold EXACTLY across all 218
clubs (total wins == total losses == total games played; total runs scored == total runs allowed), and
the full real 2,430-game MLB season reproduces RESEARCH.md §7.1 tighter than the prior pass's 500-game
sample at every stat — HR/9 within 0.06% of published.

Not yet built: an owner's own club, a season-reset/year-rollover function, injuries/market/winter, and
wiring any of this to the UI or a real save.

## v2.4.1 · SEVEN NEW RESEARCH DOMAINS — 2026-09-04

`RESEARCH.md` §18–24 added: component-specific player aging curves, Statcast pitch modeling, batted-
ball quality, defensive value units, platoon splits, modern (2023+) baserunning rules, and the NPB/KBO
posting system — a background research workflow (15 agents: research → independent verify → synthesize
per domain) launched earlier this session, merged now that it completed. Before merging, four of the
highest-stakes figures were independently re-checked a second time outside the workflow (Yamamoto's
exact posting fee, 2023 stolen-base totals, Statcast's Fielding Run Value conversion, the Barrel
definition) — all four confirmed exactly. Seven claims the pipeline's own verify phase found wrong are
recorded as explicit corrections, not silently dropped. See `DECISIONS.md` D83.

Two structural findings worth carrying forward: no 20-80-scale defensive grade exists anywhere in the
current Statcast era (the only two conversion tables ever published are pre-Statcast and built on a
metric FanGraphs has since de-emphasized), and the "which handedness has the bigger platoon split"
question is a genuine, unresolved disagreement between two credible sources in the public literature —
recorded as an uncertainty band, not arbitrarily resolved.

Not yet consumed by anything in `packages/sim-kit` — this is research, not code. §18's aging curves are
what the next pass (player development) will build from.

## v2.4.0 · A GAME CAN BE PLAYED — 2026-09-04

Roster construction (`clsOf`/`rosterPlan`/`buildRosters`/`contractFor`/`chartClub`, `roster.ts`) and
the full inning-by-inning game loop (`simGame`, `game.ts`) ported into `@bushleague/sim-kit`, from
`bush-league-v0.10.html`. For the first time in this rewrite, a real game can be simulated end to end:
a world, a schedule, real rosters with real lineups and rotations, and a plate-appearance engine now
all connect. **One genuine bug found and fixed, not reproduced:** the original's box score swapped
home and away fielding errors (confirmed against its own display code, which expected them the other
way around) — fixed here, not silently carried over. See `DECISIONS.md` D82.

Verified with 500 simulated games per level, real lineups: HR/9 lands within ~10% of published at
every affiliated level — a big improvement over the isolated-PA test two passes ago, confirming that
test's own hypothesis that `ADV.hrCal` was tuned against real lineup context. BB/9 runs consistently
high, up to +9.6% at Single-A — not a new defect, the same "walks too many batters" red the original
build's own QA left unresolved for several builds (ROADMAP.md), reproduced and documented rather than
silently retuned.

Not yet ported: the winter cycle, the market, scouting, the draft, trades, player development, and
wiring any of this to the UI or a real save. A game can be played for the first time — nothing yet
calls it from anywhere a player would see.

## v2.3.0 · THE PLATE-APPEARANCE ENGINE — 2026-09-04

`log5`, `resolvePA`, `draw`, `advOf`, `errRate` and the `ADV` calibration constants ported into
`@bushleague/sim-kit` (`pa-resolution.ts`), from `bush-league-v0.10.html`. `log5`'s core identity
(`log5(l,l,l) === l`) proven exact. A real finding from calibrating it directly (200,000 simulated PAs
per level): isolated PA resolution undershoots SLG (~4-6%) and home-run rate (~9-12%) even at near-zero
population spread, because `ADV.hrCal`/`bbCal` were tuned by the original project against full
lineup-and-rotation game context (`qa/simcal.js`), not against a fresh random opponent every plate
appearance. Not a port defect — `log5` and `rateProfile()` are independently verified exact/tight
elsewhere — documented and tolerances widened accordingly rather than silently loosened. See
`DECISIONS.md` D81.

Scope stated plainly: roster construction, lineup/rotation/bullpen assignment, and the actual
inning-by-inning game loop (`simGame`) are not yet ported. There is a world, a schedule, and a
plate-appearance engine now — no game has been simulated end to end yet.

## v2.2.0 · WORLD GENERATION AND THE SCHEDULE — 2026-09-04

Club/world generation (`buildWorld`) and the schedule generator (`pairCounts`/`placeSchedule`/
`balanceVenues`) ported into `@bushleague/sim-kit`, from the real MLB/MiLB/independent-league data and
scheduling algorithms in `bush-league-v0.10.html`. All **218** real clubs generate (30 MLB + 120
affiliated + 68 independent — corrects a stale "202" figure carried in the old docs since before the
Pecos League was added). Every club lands on its exact published game count via
`buildFullSeasonSchedule`; D28's id-uniqueness and the Sioux City/Sioux Falls abbreviation-collision
regressions are both re-verified. See `DECISIONS.md` D80 for a real duplication fixed (Pecos's
elevation/games/attendance now reads from the real league table instead of last pass's standalone
placeholder constants) and a genuine algorithmic nuance found and documented, not silently patched
over (the series-length cap's fallback-scan interaction).

Not yet ported: the box-score game engine. Nothing plays yet — there's a world and a schedule, but no
game has been simulated.

## v2.1.0 · PLAYER GENERATION — 2026-09-04

Player generation and grading ported into `@bushleague/sim-kit`: level environments, the grade-to-
real-units tables (Jensen's-inequality-corrected), `makePlayer`, `rateProfile`, and the Law 10
hidden-truth scouting model. Calibrated the same way the old build's `qa/calib.js` calibrated it:
1,400 simulated hitters and 1,400 simulated pitchers generated at each of MLB/AAA/AA/HIA/A, checked
against RESEARCH.md §7.1's published 2025 line. **50/50 checks pass**, most within 1% — Triple-A OPS
generated .768 against a published .768 exactly. `packages/sim-kit/test/calibration.test.ts` is the
permanent regression check. See `DECISIONS.md` D79 for the one real bug found and fixed during the
port (a club-abbreviation generator that could silently emit the string "undefined").

Not yet ported: club/world generation, the schedule, and the box-score game engine. Nothing plays yet.

## v2.0.0 · THE REBOOT — 2026-09-04

The engineering substrate is rebuilt from scratch: React 19 + TypeScript + Vite + Tailwind v4 on a
pnpm workspace (`apps/web` + `packages/sim-kit`), hosted on GitHub Pages, PWA-installable. This
supersedes `LAWS.md` Laws 1, 13 and 17 (single HTML file / `BUILD` const / never split parts) —
recorded as `DECISIONS.md` D78, not a silent rewrite. `RESEARCH.md`, `DECISIONS.md` (D1–D76 untouched,
appended not edited), `DESIGN.md` and `UI.md` carry forward as the source of truth for what the game
is and looks like; only the implementation technology changed.

**Ported, not reinvented**, into `@bushleague/sim-kit` (tested — 35 passing Vitest assertions): the
double-entry ledger (`post`/`balance`/`incomeStatement`/`balanceSheet`/`auditBooks`, LAWS.md Law 4),
the chart of accounts, the seeded RNG (mulberry32, bit-for-bit compatible with the old build's), and
the RESEARCH.md §3.7 display formatters, tested against §3.7's own verified examples (`.311`, `2.39`,
`144.1`, `.818`, …). One real bug found in the old source during the port and fixed, not reproduced:
`post()`'s NaN guard was dead code, because its own rounding helper silently mapped `NaN` to `0` before
the guard ever ran — a non-finite amount was dropped as a "zero-amount" line instead of throwing.

**Shipped as a chassis**, matching this project's own Build 0.1 precedent: one live page (Office, honest
empty states, no fabricated data), the other 17 pages from `UI.md`'s registry declared and dark with
the pass that lights each — visible in the nav, not hidden. Token layer carries forward D9's two-shell
system and D17's cyan-over-amber accent call; the neutral greys are a fresh construction (the old docs
record the token *pattern*, never the exact hex values) verified against D18's own contrast rule
(worst of four surfaces, computed) rather than eyeballed.

**CI** (`.github/workflows/ci-deploy.yml`): typecheck, Vitest, and a Playwright visual check (360px +
1440px, both shells, both themes, zero console errors, zero horizontal overflow) gate every deploy to
GitHub Pages. Playwright is dev/CI-only, never shipped — justified by D16's own evidence that a harness
alone missed most of this project's worst defects historically.

**Known gap, stated plainly:** world generation, the box-score engine, the market and the winter cycle
are real, working logic inside the retired `bush-league-v0.10.html` and are not yet ported — that file
is not in this repository's history (never uploaded to any session in a form other than the single
composed HTML). No migration path exists from an old `.html` save; `SCHEMA_VERSION` starts at 1.

## Build 0.10 · GATE & LEGALITY — 2026-08-28
`bush-league-v0.10.html` · 5,826 lines · 324,957 bytes

Gate tooling and two roster-legality bugs. run-all.js --fast (7 harnesses, 28s, covers every subsystem) and the gate now runs in parallel, longest-first, 2 workers — 481s to 298s, the measured 2-core floor; the full gate is unchanged and still required before anything ships. qa/doctor.js replaces three throwaway scripts and roughly eight harness re-runs the v0.9 winter pass cost: illegal clubs and whether they’re repairable, pool by age bracket, ask vs pay, save round trip, books, NaN, console, in one 15s command. Fixed: the roster interrupt compared active men to the full 25-man roster minimum instead of a playability floor, so a Pioneer club with one man on the IL had 24 active against 25 required and the clock could not move at all, on day one of every advance. The Pioneer League’s roster minimum was invented — roster:[25,25] against its own comment stating no published minimum exists — turning a real active-roster figure into a hard rule with zero slack; now [0,25], with the derived maximum labeled as derived. qa/sweep1.js was booting an unseeded world; its box-score check had been failing in about 40% of runs for six builds and looked like an unexplainable flake. Seeded, with the seed on the command line. Known gap, not hidden: stat lines carry no club attribution, so a released or sold player’s hits leave the roster and stay in the club’s box scores — will mis-attribute a league leaderboard the day one exists.

## Build 0.9 · THE WINTER — 2026-08-28
`bush-league-v0.9.html` · 5,412 lines · 322,116 bytes · schema v3

The world was a closed, ageing population and it had exactly one destiny.
Nobody entered the game and nobody left it, so every January the whole
population aged a year: **median independent age 25 → 26 → 27, the under-25
market 22 → 12 → 9, and by 2028 all eighteen Frontier clubs were illegal with
no legal move available to any of them.** Run v0.8 out to ten years and its
Frontier League has a **median age of 36 and 100% of the league aged 30 or
over.** That is not a bug in the AI; a closed population under an age rule has
one destination.

Real independent ball is the opposite of closed — between a quarter and two
fifths of a roster comes back and the rest is a fresh class every spring — so
that churn is now the game.

**In season**, affiliated organisations purchase contracts weekly at each
league's own published rate. This is the system `settleWeek` had been
*describing* since v0.8 ("a club that loses a man to an affiliated organisation
replaces him that week") without having it.

**January 1**, every contract expires, men leave the game on an age curve
fitted to the real Frontier age distribution, and a new class arrives — sized
against each league's own composition table rather than a constant, so the 180
under-25 jobs and 108 age-26 jobs the Frontier rulebook creates are fillable by
construction.

**Through January**, a club may re-sign its own men and nobody else's.
**February to April**, the open market, and it is a race you can lose.
**Opening day**, nobody plays short.

### Measured against the real thing, after ten simulated years

| | simulated | real | source |
|---|---|---|---|
| median Frontier age | **26** | 24–25 | B-R register, 2025 FL position players, n=48 |
| aged 28 or over | **14.6%** | 15% | same |
| aged 30 or over | **2.4%** | 2% (rulebook allows 8%) | same |
| roster continuity | **32.6%** | 24–41% | four club press releases |
| contracts purchased | ~1/club/year | 1.15/club/year | league pages, THT 2016 |

Two constants were **solved from those measurements, not chosen**: the wage
level each league's market is struck at, and how much a club discounts a man
for each year he is over 26 — raised from 0.8 to 1.6 in one measured iteration
when the league came out at 6.5% aged 30-or-over against a real 2%.

### Nine defects, of which four were only visible because something was measured

- **The roster minimum bound on the way up.** A club with an empty roster could
  not sign anybody, because one man is also below twenty-three. One line, and
  it made every winter signing in the game impossible.
- **`cid: "FA"` was indistinguishable from corruption.** Reloading a v0.8 save
  handed the owner **every free agent in the world — 25 men became 235.** It
  shipped, because every harness tested the live object and none tested the
  round trip.
- **A market whose mean ask exceeds cap ÷ roster cannot field a team**, however
  reasonable each man looks alone. Atlantic clubs stalled at fifteen men on a
  twenty-three-man minimum.
- **The AI shopped the top of the board instead of its own hole**, so clubs with
  three open spots, $20,000 of room and fifty-one eligible men in the market sat
  illegal and accumulated — three became six in six weeks.
- **The roster interrupt became a wall.** `advanceDays` breaks on the first
  interrupt, so a condition true every day stopped the clock forever; every
  migrated save from before the roster rules was unplayable.
- **A man sold to an affiliated organisation cannot be deleted mid-season** —
  his batting line is half of every pitching line he faced. 1,874 hits and
  4,523 strikeouts that batters never took and pitchers still recorded.
- **`rebuildRates()` scanned all 202 clubs for each of 5,000 players**, once per
  signing. Two simulated years went 26s → 222s. Now **10.9s** — faster than
  before the winter existed — and a full decade runs in 43.
- Found by eye at 360px with every harness green: **toasts stacked** until they
  buried the screen, and **the winter was invisible** — "Roster 0 of 25" on
  January 2nd with nothing saying why.

### Materiality

Paired seeds, same world, one variable: does working the winter yourself beat
letting your front office do it? Reported in full in the build notes; the short
version is that the first two answers were confounded and had to be thrown out,
and the honest one is much smaller than either.

---

## Build 0.8 · THE MARKET — 2026-08-27
`bush-league-v0.8.html` · 277,977 bytes · schema v3

Free agency, sign and release, for the owner and for all 68 independent clubs.
Every league's published roster rule becomes a predicate rather than a note
nothing reads: the Frontier's four age classes, the American Association's four
service classes, the Pioneer's three-year cap, the Pecos veteran limit — and
the Atlantic League's conspicuous absence of any rule at all, encoded as an
empty list because Rules 10, 11 and 12 of its own rulebook are redacted.

The rule that keeps it from deadlocking: **a move is allowed when it does not
increase the number of violations.** "The roster must be legal afterwards"
freezes exactly the roster that needs to move. Cap and roster maximum sit on
top as hard blocks, because those two are what a league actually refuses to
process.

AI clubs value men through the same 20-80 fog the owner does, with a
deterministic per-club offset — so a rival can overpay for a man who cannot
play, pass on one who can, and hold the same opinion of him every time it
looks. Law 10, applied to somebody other than the player.

---

## Build 0.7 · THE ROSTER COSTS MONEY — 2026-08-28
`bush-league-v0.7.html` · 4,610 lines · 257,160 bytes · schema v2

**Payroll posts the roster.** Six builds charged a flat $128,000 a season to every independent club
in every league while every man carried a contract the ledger never read. Signing or releasing
anyone cost exactly nothing. Now the books charge what the men on them actually cost — annual
contracts spread over twelve months at MLB, monthly wages in season only below it. **D48.**

**Contracts fit each league's published cap.** One ovr-to-dollars curve served all of independent
ball, so a Frontier roster cost $219,000 against an $85,000 cap and an American Association roster
$233,000 against $120,000 — every league paying Atlantic League money. Each club is now scaled to
its own cap: Atlantic $250,000 · American Association $120,000 · Frontier $85,000 · Pioneer $95,000
· Pecos $12,100. All five land within 0.01%. The Frontier's own published figures contradict each
other (an $85,000 cap and a $1,500/month average that implies $168,750) and RESEARCH 9.2 records the
contradiction rather than resolving it by preference.

**Five economies, each solved to break-even.** With payroll real, one cost base could not serve
leagues playing 51 dates to 2,146 and 63 dates to 2,529: the Atlantic cleared +$190,611 a year while
the Frontier lost $253,128. `opScale` scales operating costs per league and every value is solved
from measurement. **All five leagues now sit between −$385 and +$963 at .500.** D49.

**THE SCHEDULE WAS NEVER EVEN — and it was not a Pecos problem.** Hunting the Pecos home/away flake
found something six builds older and far worse: **a Triple-A pair meeting 42 times against a median
of 6**, Double-A 30, Pecos 26 against a median of 2. The top-up loop kept choosing the pair joining
the two clubs furthest behind target, and they stayed furthest behind, so it dumped the whole
remainder onto one pair. The two leagues that always looked clean — Frontier and Atlantic — are
exactly the two whose game count divides evenly by opponents, so the loop never ran for them.
The remainder now walks whole round-robin rounds: **every pool is within 2 meetings, the arithmetic
floor.** Home/away imbalance goes from 2.5% of runs (since v0.4) and 18–19% (since v0.6) to
**0 of 200 worlds**. D46.

**Measured honestly, and one result is negative.** `qa/schedfair.js` runs the same 10 seeds through
both builds: strength-of-schedule spread falls **0.214 → 0.153 grade points**, collapsing where it
was broken (**Pecos 0.631 → 0.125**, **Triple-A International 0.411 → 0.090**) while already-even
pools do not move at all. But **talent-to-win correlation moves 0.563 → 0.569 — noise.** A lopsided
schedule is symmetric: drawing one opponent 42 times hurts as often as it helps. **The fair schedule
is a fairness fix, not a competitive one, and the sweep3 numbers that appeared to show otherwise
were two different unseeded worlds.** D47.

**New harnesses:** `qa/econ.js` fits net against record per league and reads break-even off the
intercept at .500 — the first attempt averaged a .550 sample and called the Atlantic League $53,000
profitable when it was not. `qa/schedfair.js` is the paired-seed comparator. `check.js` now asserts
**who** a club plays, not just how many games — the assertion that six builds lacked, verified by
failing against v0.6.

**Fixed by eye, with twelve harnesses green:** the Class column reached the wide table and stopped
there, so on a phone the contract line read `#27 · 29 · – · FA – · indy deal` — a dash where the
Frontier classification belongs. It now reads `#27 · 29 · Exp-2 · 3 yr svc · $456/mo`. D50.

**Fixed a three-year-old flaky test:** sweep1's cash-floor check advanced a week with injury
interrupts armed and failed about one run in three for an unrelated reason. D51.

**Verified: 304 passing assertions, 0 failures, twelve harnesses.**

## Build 0.6 · FIVE DIFFERENT LEAGUES — 2026-08-27
`bush-league-v0.6.html` · 4,420 lines · 246,432 bytes · schema v2 (world.renames added, backfilled)

**The independent leagues stop being one league wearing five hats.** Until this build every indy
club drew from one talent distribution, every player had zero service time, every league drew 2,300
fans, and the published roster rules sat in the data read by nothing.

**The rules are enforced at generation**, each from its own published document (RESEARCH 9.1):
- **Frontier — age.** 25-man · min 10 aged ≤25 · min 6 aged 26 · max 8 aged 27+ · max 2 aged 30+.
- **American Association — service.** 25-man · max 6 veterans (6+ yrs) · min 5 rookie/LS-1 · max 6
  LS-4 of whom 2 LS-5. A year of service accrues at **75 AB or 30 IP**.
- **Pioneer — a service cap.** 25 active, nobody above 3 years prior professional service.
- **Atlantic — none, because it publishes none.** Rules 10, 11 and 12 are redacted in its public
  rulebook. It is the top rung on money and transactions instead, and the screen says so.
- **Pecos — the new floor.** 22-man, rookie ≤24, max 10 veterans.

Rosters are built **to spec, not drawn and repaired** — a repair loop can fail quietly and leave an
illegal roster. Classification is **derived** from the rule on demand (`clsOf`), never stored, so it
stays true when the world ages. New **Class** column on the roster grid; service now shows below MLB.

**The Pecos League** — 16 clubs, 54 games, its own season window, its own economy. Two liberties,
both disclosed on screen: ownership is fictionalised (one man owns 15 of 16 real clubs) and
attendance is a T3 estimate (the league publishes none). **D41.**

**Talent follows the transaction record** (D43). Atlantic 42 · American Association 36 · Frontier 35
· Pioneer 34 · Pecos 30, plus a service edge. Measured: 44.8 > 37.5 > 36.7 > 34.8 > 31.3, the
Atlantic **7.2 clear** of the next league against a 2.8 spread across the other three.

**Attendance is per league at last** — the Ballpark Digest figures had been in the file since v0.1
and were read by nothing; every indy club drew LVL.INDY's 2,300.

**The Pecos environment is derived, not borrowed** — the first thing in this project that is. SABR's
published elevation coefficients at the league's own 4,870 ft average give **.275 / .791 OPS /
6.19 R/G / 5.43 ERA**, a run factor of **1.283** against Coors Field's historical ~1.30 at 5,200 ft.
The coefficients are read as total runs, both teams; the Coors cross-check is what settles that, and
the comment says where to look if the reading is wrong.

**The Frontier League becomes the NAPB in 2027** — a real, dated, sourced change inside the world's
own timeline, stored as a display override so the canonical `lg` key keeps finding the league's
rules, proxy, salary scale and schedule.

**Fixed**
- **8 of 8 Pecos seeds went bankrupt** on the first attempt — costs scaled by attendance while the
  club still carried twelve months of overhead for a ten-week season. Re-solved against ECON's own
  break-even law: **10 of 10 solvent, mean year-one net +$1,594.** D42.
- An off-by-one in an integer draw put 30-year-olds in the Frontier's 27-29 class and 4-year men in
  the Pioneer. Caught by the new harness on its first run.
- `balanceVenues` — the D34 venue repair. **Every affiliated level and all four Partner Leagues now
  come out 0-1 games from even**, where the gate used to fail ~2.5% of runs.
- Dead locals (`LV`, `env`, `SD`) removed from `buildRosters`; `indyLeague()` de-duplicated.

**KNOWN, NOT FIXED:** ~18-19% of worlds leave **one Pecos club exactly 3 games** off home/away
balance. 54 games across 15 opponents is 3.6 meetings per pair; the odd meeting cannot cancel, and
**no venue flip can fix a parity problem**. The fix is in `pairCounts`, not the repair pass. D45.

**Verified:** leagues, start, sweep1/2/3, simcal, probe, season and inv all clean; check.js clean on
the run recorded here and expected red on roughly one run in five until D45 lands.

## Build 0.5 · THE FRONT DOOR — 2026-08-27
`bush-league-v0.5.html` · 3,963 lines · 219,600 bytes · schema v2 (no schema change)

**The start screen becomes a screen.** It had been the v0.1 stub for three builds — two hardcoded
cards, difficulty wired to the literal string `normal`, a random club, and footer copy that still
said "Build 0.1 — the UI chassis".

**Reachable at all**
- `init()` auto-loaded any save and never called `showStart()`. **With a save present the start
  screen could not be reached** except through the in-game `restart`, which is a `confirm()` dialog
  that deletes the save. The door is now always shown, with the saved club at the top of it —
  name, level, league, date, record and cash — and Resume one tap away. D35.
- The summary is computed once when the save is read, from one pass over its ledger. Opening and
  closing a seat does not re-parse a 4 MB save.
- Import a save file works from the door (it called `applyUI()`/`repaint()` without
  `buildShell()`, so from the door it would have painted into a shell that does not exist).

**Choosing**
- Both seats open in place. The Bush League seat filters by league against each league's real
  numbers — Atlantic 10 clubs/126 games/2,529 per game, American Association 12/100/2,668,
  Frontier 18/102/2,146, Pioneer 12/96/2,248 (T1, RESEARCH 2.3), with the source cited under them.
- The club picker is **the shared grid engine running before a game exists** (Law 5) — sortable,
  filterable, CSV-exportable, phone list mode, across all 52 independent or 30 major-league clubs.
  Grid state reads through `UI()`: `G.ui` when there is a game, a module scratch before there is one.
- A **seed** field fixes the whole world. The draw is consumed whether or not you pick a club, so
  the seed alone determines the world — the pick only decides which desk you sit at. Verified: same
  seed, different club, identical 5,380 players and 13,434 games.

**What it refuses to fake.** No difficulty control: `G.diff` is written by `newGame()` and read by
nothing in the build. No takeover scenarios: all 30 clubs open with identical books. Both are
disclosed in prose on the screen instead of implied by a control. D36.

**Fixed**
- `#boot` centres its child with a grid, which sizes it to max-content. Fine for three lines of
  prose, not fine once a real grid lives inside it: the door scrolled sideways at 360px (672px of
  content in a 360px viewport). `.door`/`.door-w` in the stylesheet, `width:100%` declared.
- `.l3` is a grid sub-line — one clipped line, and `display:none` at dense density. The source
  citation and the D23 Pioneer caveat were being **truncated to an ellipsis and hidden entirely at
  one density setting**. Disclosures use `.note`, which wraps and never hides. D37.
- `inv.js` reported 6 VIEWS as 1 and 18 PAGES as 21 — both regexes were line-anchored or too loose.
  Both now parse the actual arrays. `compose.py` runs the same reconciliation before it writes.

**Workshop** (no game change)
- The build is composed from `src/` again. The v0.4 fragments and `compose.py` had only ever
  existed in a scratch container and were lost. Re-cut from v0.4 at its own banner comments;
  `compose.py --check` proves the recomposition **byte-identical**, 205,776 bytes. D32.
- Every harness resolves its build through `qa/_build.js` instead of naming a version. Two of them
  had hardcoded `/home/claude/bl/bush-league-v0.4.html` and **could not have run at all** as
  committed; all eight would have kept grading v0.4 the day v0.5 composed. D33.
- New `qa/start.js` — 30 checks on the front door, driven by real DOM taps. It found three of the
  defects above on its first run. New `qa/flake_sched.js` measures the schedule flake. D34.
- `qa/sweep1.js`'s coverage loop fires every ACTIONS key; the front-door actions tear down the
  shell and reboot the world, so they join `restart` and `impo` on the destructive skip list and
  are driven by `qa/start.js` instead. D38.

**Verified:** all nine harnesses clean on v0.5 — gate, start, sweep1/2/3, simcal, probe, season,
flake. `qa/season.js` output is **bit-identical to v0.4's**: this pass changed no game outcome, and
is not claimed to.

## Build 0.4 · THE SIM — 2026-08-27
`bush-league-v0.4.html` · 3,722 lines · 205,776 bytes · schema v2   (the 3,716 first recorded here was wrong)

**The world plays.** Every club at every level runs a real season, simmed in about 1.2 seconds.

**The schedule**
- Day-by-day, most-constrained-first placement for all 202 clubs: MLB 162, Triple-A 150, Double-A 138, High-A and Single-A 132, indy by league (Atlantic 126, American Association 100, Frontier 102, Pioneer 96 — the “100–105” recorded here was wrong on both figures). Series continuity (2–4 games, one venue per series), a doubleheader escape hatch, verification with 10 retries.
- Cross-league rivalries are filtered to genuinely cross-league pairs and completed programmatically — the first attempt made four clubs play 159 games because HOU–TEX and COL–SDP are same-league now.
- Home and away balance within 2.5 games for every one of the 202 clubs.

**The game engine**
- Plate appearance by plate appearance. Batter rate, pitcher rate and the league baseline combine through **log5**; the FIP core's constant is solved so a league-rate pitcher posts the league ERA, landing on **3.24 for MLB 2025 — the real published constant**.
- Base-out state with runner and responsible-pitcher tracking, errors scaled by each level's unearned-run share, steals, double plays, sacrifice flies. Nine outcome codes.
- v1 resolves straight to a box score. The math is already pitch-aware, so play-by-play is a later pass and not a rewrite (Law 16).
- **Calibration:** every simulated league reproduces its published 2025 line — R/G within 0.9–4.2%, ERA within 0.3–7.0% — and the closed-league identity is **exact**: batting hits equal pitching hits, and HR/SO/BB/HBP reconcile to zero at every level.

**The clock**
- `advanceDays(n)` → `tickDay()` → `settleDay/Week/Month/Year`. Four units — Day, Series, Week, Month — plus advance-to-a-date. Period closes run before the new period's charges.
- Three interrupts, each switchable: an injury, the active roster falling below the legal minimum, cash crossing a floor you set. **At defaults a "Month" tap actually advances 18.8 days** (measured over 40 jumps).
- Injuries, box scores kept for the owned club, standings, and season rollover with a history row per completed season.

**Money**
- Gate and concessions post per home date, on attendance that responds to form with a 40-game prior and a season's lag — season tickets are sold on last year's club. MLB media money accrues to a receivable and is collected the following month.
- Break-even sits at .500 for both starts across five calendar years.

**What the total sweep found — ten real defects, each now with a permanent regression check**
- **The roster grid could not be sorted at all.** A grid id containing a pipe was split on the first one, so every header tap sorted a bucket no grid reads. Silent, total, and invisible to every prior gate, which only ever sorted the pipe-free ledger id.
- **`migrate()` was not a validator.** Five of 27 corruption cases produced a dead session; all 27 now end in a playable game or a clean refusal to the start screen.
- **A pre-sim save could not play** — no rosters for 201 clubs and no schedule. Both are now generated from the save's own seed, resuming in its own season year.
- **`live` and `VIEWS` disagreed** — the Roster page was fully built while the index called it "not built yet".
- **`envNote()` was orphaned** — the disclosure that indy ERA+/OPS+ borrow a proxy denominator existed and was never rendered.
- **Depth charts are indices into `G.players`** and were not rebuilt on load. `migrate()` reindexes now.
- **The advance summary read "-85--77"** when a season rolled over mid-jump.
- **`lastAdv` was dead state** — it is the Last Advance line in the advance sheet now.
- **`toast()` threw when the shell did not exist**, turning a books warning into "World generation failed".
- **"26-man" was shown as the roster label for indy players.** It is a major-league rule.
- Seven orphaned functions deleted. Inventory clean: 0 never-called functions, 0 unhandled data-acts, 0 unreachable handlers.

**Verified — 208 checks, 0 failures across eight harnesses**
`inv.js` · `check.js` · `sweep1` (coverage, edge, ledger, cross-view, rare paths) · `sweep2` (migration from every prior build, 27-case corruption matrix, 1,200-action chaos churn) · `sweep3` (deployment context on `file://` and http, does-quality-win, materiality, five-year scale) · `simcal.js` · `probe.js` · `season.js`.

**Measured, not assumed**
- Better lineups win: MLB **r = 0.477 against a 0.681 binomial ceiling — 70% of the signal a 162-game season can carry**. One grade point of lineup quality is worth 2.7 wins per 162.
- The record moves the books: indy **$631K on a $2.02M cost base (31.2%)**, MLB **$70.0M on $385.5M (18.2%)**, same seed and same club both ways.
- Injuries bind: 11 of 25 men on the IL over a season, 4 out at once at the worst.
- Five seasons: no NaN, books reconcile yearly, competitive spread holds at sd 55 points, 7.2 seconds for the lot.

**Known gaps** — no aging, development or retirement (average age reaches 34.8 by year five); the wire is static; the save grows ~206 KB a season; ~33 single-game "series" per season; indy environments are borrowed proxies and the Pioneer League is the worst fit; no park factors; and **the owner has no roster lever yet** — the engine rewards quality but nothing in v0.4 lets you supply it.

## Build 0.3 · ROSTER + CALIBRATION — 2026-08-27
`bush-league-v0.3.html` · 2,510 lines · 141 KB

**The Roster — the flagship grid**
- **65-column schema, six saved views**: LINEUP, STAFF, SCOUT, PAPER, TRAINER, FULL. Columns come from the real Baseball-Reference team batting and pitching sets (RESEARCH §3.2–3.4) plus the sim's own scouting, contract and medical families. Each view carries its own row filter, so LINEUP shows bats and STAFF shows arms without the user doing anything.
- **Working column customizer** — add, remove, reorder, reset to the view default. Persists per view in `G.ui.view`.
- Role and roster-status filter chips, multi-sort three deep, CSV export, and phone list mode with a per-view hero figure and supporting line.
- **Player profile** as a detail page, never a modal: trait bars showing the scout estimate with tick marks bracketing its uncertainty band, a reliability meter, the season line, and contract with service time, options and free-agency year. Every derived figure taps through to its provenance.

**The stat engine, recalibrated against Tier 1 data**
- `LVL` now carries the **published 2025 league line** for MLB, Triple-A, Double-A, High-A and Single-A (RESEARCH §7). Every generated rate is that level's real rate moved by grade.
- **The run environment is not monotonic.** Triple-A is the most offensive league in affiliated ball; Double-A is the least, below MLB. The old model assumed a smooth decline down the ladder and was wrong in a way playtesting would never have surfaced.
- Independent leagues borrow the published environment of the affiliated level their roster rules make them resemble — Atlantic → Triple-A, American Association → Double-A, Frontier → High-A, Pioneer → Single-A — and the provenance sheet says which and why. No invented indy line.
- **ERA derives from a FIP core** whose constant is solved so a pitcher at league rates posts the league ERA. For MLB 2025 that lands on **3.24 — the real published FIP constant.** Not tuned for; it is the check the model is dimensioned right.
- `qa/calib.js` generates 1,400 players per level and reproduces every published figure: slash line inside 2%, ERA and WHIP inside 2.2%, per-nine rates inside 2%, home runs inside 5.5%.

**Fixed**
- **Per-nine rates were multiplied by innings instead of innings/9** — 489 strikeouts in 75 frames, WHIP 13.820. Invisible in the code; obvious the moment a profile rendered.
- **Deviations were measured from grade 50 instead of the level's own centre.** Grade 50 is *major-league* average, so a Double-A club centred at 40 generated a 6.85 ERA league. A 40-grade player IS Double-A average.
- **The grade-to-home-run curve is convex**, so the population average of `hrFrom()` exceeds `hrFrom()` at the population mean — 5% at MLB's centre, 21% at Double-A's. Now scaled by the expected value over the actual grade distribution.
- **Scouting reliability saturated at its cap for anyone past 29**, flattening the uncertainty Law 10 exists to create. It is now a function of sample size, not age.
- WAR recalibrated so a league-average full-time season is 2.0 and replacement is 0.0, anchored to each level's own line.

**New gate checks:** Law 10 static (no view reads a true rating) and runtime (every trait bar on every profile shows the estimate) · all six roster views render · role filters partition exactly · column customizer removes, adds, reorders, resets · every player profile opens and back returns · CSV carries no markup and column counts match · phone list mode carries identity, hero and supporting line in every view.

## Build 0.2 · FINISH — 2026-08-27
`bush-league-v0.2.html` · 2,082 lines · 118 KB

**Colour**
- **Cyan replaces amber** as the attention colour (`#2FD4D4` dark / `#0B5F61` light). Jordan's call. Hue 180 sits 50 degrees clear of the info blue, which was pushed to hue 230 to keep them separable, and it is well clear of the green/red pair under colour-vision deficiency.
- **Every light-theme semantic was re-solved against `surface3`** (`#e2e2e6`), the darkest surface any of them lands on. The green measured **4.16:1** and the blue **4.42:1** there — both genuinely failing AA, and both passing every prior audit only because nothing happened to be sampled on that surface. New values clear 4.5:1 on all four surfaces with headroom.
- Ratios in the token comments are now the WORST case across bg / surface / surface2 / surface3, not the flattering one against the page background.

**Fidelity**
- **Inline SVG icon set** (26 icons, 1.4 stroke, `currentColor`) replaces every text glyph in the tab bar, rail, grid toolbar, sort carets, action bar and sheet close. Text glyphs render as a different shape, weight and baseline on every platform — and as colour emoji on some.
- **Sub-pixel hairlines**: `--hair` drops to 0.5px at 2dppx and 0.34px at 3dppx. A 1px CSS border is 2–3 device pixels on a phone, which is what makes a dense grid read as a cage.
- Lining + tabular figures via `font-feature-settings`. Hover states gated behind `(hover:hover) and (pointer:fine)`.
- **Sparkline** rebuilt: gradient area fill, dashed zero baseline, inset min/max ticks drawn as vertical lines rather than circles (`preserveAspectRatio="none"` turns a circle into an ellipse). Coloured by data role, not the shell accent — the OOTP accent is near-white and the area fill read as haze.
- **Heat cells** wired to the ledger cash column, right-anchored to match the column's alignment, on a sqrt scale so a single $14.8M payroll does not flatten every $200K line to an invisible sliver.
- The accent is now the **rule only**, not the row's text — colouring both is the same signal twice (D13).

**Fixed**
- **Duplicate club abbreviations.** Sioux City and Sioux Falls both truncated to `SIO`, putting two identical rows in one standings table. Multi-word cities now take two letters from the first word plus one from the second, deduplicated per league.
- **Journal entries were not chronological** — home dates seeded before monthlies, so the `#` column jumped around. Entries are now collected, sorted by date, then posted.
- **Revenue posted before the club was acquired.** The opening entry was dated 45 days before the season, which put January sponsorship ahead of the purchase. Acquisition now dates to 2025-12-15.

**New gate checks:** journal chronology and acquisition-first · club abbreviation uniqueness within a league · ellipsis actually truncates · restart preserves scaffolding · owner's club present in the division panel on every seed · wire scoped to the owner's league.

## Build 0.1 · CHASSIS — 2026-08-27
`bush-league-v0.1.html` · 1,978 lines · 111 KB

**Shipped**
- Dual-shell token layer: `ootp` and `desk` over one component set, x dark/light, x dense/compact/standard. Zero colour literals outside `:root` (audited).
- Page registry (18 pages, 5 groups) rendering the phone tab bar, the desktop rail and the full index from one array.
- Status strip, action bar (the core verb in one place), bottom sheets, toasts.
- The shared grid engine: multi-sort, filter, CSV export, table renderer >=720px and list renderer below from one column model.
- Double-entry books: `post()`, income statement, balance sheet, cash flow, journal, and `auditBooks()` as a live in-game pane.
- The provenance sheet — every number tappable, showing formula, tier and source; Tier 3 figures dotted-underlined in the UI.
- World generation: 202 clubs (30 MLB, 120 affiliated, 52 indy) with internally consistent records and Pythagorean-derived run differentials.
- Player generation with hidden true ratings, noised estimates and reliability; batting average and home runs derived from the Tier 1 Baseball America 2025 grade tables.
- Both starts, save/load/migrate, autosave.
- **Finished screens:** Office, Books. All others declared-but-dark with the pass that lights them.

**Fixed during the pass** (all found by the harness or by looking at screenshots, none by reading code)
- `#main` grid item `min-width:auto` clipped all content at 360px while reporting no horizontal scroll.
- `text-overflow:ellipsis` silently ignored on inline spans — list-mode lines collided.
- Light-theme amber failed AA at 10px (4.08:1); replaced at 5.28:1.
- Contrast harness measured colours mid-transition; `applyUI()` now suppresses transitions for one frame.
- The owner's own club could fall off the bottom of the Office division panel.
- The wire reported clubs from other indy leagues.
- Restart destroyed `#scrim` and `#toasts`.
- Takeover clubs opened with negative cash; MLB payroll posted only in-season.
- MLB records balanced per-league (15 clubs, odd games) instead of across all 30.
