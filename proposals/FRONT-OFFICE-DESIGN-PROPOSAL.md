# DESIGN PROPOSAL — The Front Office

**Status: proposal only. No code written. Per project law, this needs your sign-off on the layout
before anything gets built.** Written 2026-09-04, no computer linked this session — this is what a
future session composes from `src/`, once you've told me what to change here.

**What this answers:** you said you want the game to feel like being a real owner — the actual
decisions and work an owner does, plus the staff a real club would have. Research is in
RESEARCH.md §17 (paste-in provided separately). This is what that research turns into as a system.

---

## 1. The one decision that shapes everything else

§17.1 is load-bearing: at a real affiliated minor-league club, the on-site "GM" runs the business side
only — tickets, sponsorship, facilities. Player transactions belong to the MLB parent. At an
independent club, there's no parent, so the owner (or their GM) really does run baseball ops.

That means **staff authority has to change by rung of the ownership ladder, not just staff quantity.**
Two ways to build it:

- **(A) Skip affiliate ownership as a playable rung.** The ladder goes indy ball → MLB
  takeover/expansion only. Affiliated clubs stay simulated backdrop, never purchasable. Simpler, and
  it matches what's already decided — the indy leagues are the point, the affiliated world is backdrop.
- **(B) Allow affiliate ownership, but make it deliberately hollow.** You can buy a Double-A club as a
  ladder rung (real transactions exist for this — §14.3), but the "Baseball Ops" tab on that club is
  read-only, grayed out, controlled by an NPC parent org. The lesson being taught is the real one: you
  bought a business, not a team.

**I'd default to (A)** unless you want (B)'s realism-as-a-gut-punch specifically — it's a good moment
(new owner buys their first MiLB club expecting control and gets none), but it's also a screen that
exists mostly to tell the player "no." Your call — flagging it rather than picking it.

## 2. Staff as a second roster, reusing what already exists

You already have a dense player-roster grid. Staff should be that same component, not a new one:
rows are people, columns are attributes, sortable, no hero numbers. Two departments, gated by rung
per §1:

**Business Ops** (available at every rung, indy through MLB): GM/team president, director of ticket
sales, director of sponsorship, director of marketing, community relations, director of stadium ops.
Each has a rating; ratings interact with the ticket-price elasticity and attendance model your economy
already has real figures for (MLB elasticity ≈ −0.5 to −1.2, MiLB ≈ −0.25, winning% as the primary
driver — already in RESEARCH). A better sponsorship director should move sponsorship revenue within a
bounded range, not invent a new revenue source.

**Baseball Ops** (indy rungs and a fully-owned MLB club only — grayed out for an owned affiliate under
option B): scouting director + area scouts, farm director, hitting/pitching coordinators, medical/S&C
staff, analytics.

## 3. Materiality — what each hire is actually allowed to move

Per the project's own rule (report the effect in units of a decision you make, and say "negligible" if
it is), every staff rating gets a *bound*, not a blank check — reusing numbers RESEARCH already has
instead of inventing new ones:

| role | what it's allowed to move | the bound, sourced |
|---|---|---|
| Farm director / dev coordinators | player development rate | capped at the measured best-to-worst org spread: **~1.8 mph** equivalent (§12.2) — a great farm director closes that gap, doesn't exceed it |
| Scouting director / area scouts | how fast a prospect's true grade becomes visible | tightens toward, never below, **ρ ≈ 0.86** rank-to-outcome (§12.3) — scouting gets you clarity, not certainty |
| Medical / S&C staff | injury incidence and recurrence | shifts within the already-licensed **2–6× prior-injury multiplier** (§13.2), not a new number |
| Ticket sales / sponsorship / marketing directors | revenue | bounded by the existing elasticity figures, not a flat "+X% revenue" stat |
| Community relations, stadium ops | attendance / franchise reputation | smallest effect of the set — likely **negligible** on win-loss outcomes; keep it flavor-adjacent unless you want a slow reputation mechanic tied to the ladder's purchase-approval step (real MLB sales need 3/4 league vote — §8/§14.3 — a reputation stat could feed that gate later) |

Anything not in this table (a "League Historian"-type role, useful in the real org chart but touching
no number the sim tracks) doesn't get a slot. Same discipline the project already applies to makeup/
mental-skills grades (§16.2) — flavor stays flavor, it doesn't get a fake coefficient.

## 4. Decision cadence — what you actually *do*, not just what you look at

- **Hiring/firing**: pool of candidate staff at each open slot, rated, priced — same shape as the
  transaction market you already have for players, reused rather than reinvented.
- **Weekly, in season**: nothing new — business-ops ratings already feed the existing weekly economy
  tick.
- **Winter**: staff contracts can expire alongside player contracts (you already have this cycle built
  for players — §10 of the original research, "the winter"); re-sign or let go.
- **Budget allocation**: one dial per department, not per person — how much of the club's money goes to
  scouting vs. development vs. business ops. This is the actual "owner" decision; individual hires are
  downstream of it.

## 5. Layout proposal — for sign-off, not final

At 360px, one new tab off the existing office/roster shell: **Staff**. Two sub-tabs: *Business* /
*Baseball* (baseball sub-tab hidden or grayed per §1 at an owned affiliate, if you go with option B).
Above the fold: a compact department-budget summary (five or six numbers, dense, no hero stat) and the
top of the staff grid, sorted by department. No new visual language — same dark/serif or trading-desk
shell you already ship both of, same grid component as the roster screen.

## 6. What this deliberately doesn't do

No headcount or salary numbers are invented as "sourced" — §17.5 confirms those aren't published at
this scale, so costs are exposed as tunable assumptions, labelled as such in-game, same as the
affiliated-club P&L line items already handled that way in §14.1.

## 7. Where this sits against the existing roadmap

This isn't a fourth pass bolted on — it's the *frame* the next two planned passes (player development,
scouting) sit inside. Building development/scouting mechanics first and staff second would mean
retrofitting a farm director's effect onto a development curve that already has no hook for it.
Recommend: **resolve §1's ladder question with Jordan, then build Staff before Development** — the
order matters more than it looks like it does.

---

Awaiting your confirmation to proceed with any of this before it goes near `src/`.
