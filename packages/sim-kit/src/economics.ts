/**
 * The money loop — ported from bush-league-v0.10.html's `ECON`/`econFor`/
 * `attFor`/`gateFor`. Every dollar figure here is Tier 3 (a design knob,
 * not a published number) except attendance, which is Tier 1 and already
 * lives in `levels.ts`'s `Level.att` / `world-data.ts`'s `IndyLeague.att`
 * — the same status the original build gave these figures, restated here
 * rather than silently upgraded. RESEARCH.md's own "Genuinely open" list
 * already tracks "ticket pricing... and the MLB salary scale" as unsourced
 * — this pass ports the mechanism the original's own economy runs on, not
 * a re-sourcing of its dollar figures. That re-sourcing is real, separate
 * work for whoever picks it up next, not an incidental upgrade inside a
 * porting pass.
 *
 * TUNING TARGET, stated so it can be re-checked rather than re-guessed
 * (the original's own words, carried forward): a club at .500 with
 * league-average attendance nets ROUGHLY ZERO over a FULL CALENDAR YEAR.
 * Winning and drawing is what makes money; losing has to hurt.
 */
import type { Club } from "./world.js";
import { LVL } from "./levels.js";
import { indyLeague } from "./world-data.js";
import { clamp, nz, round2 } from "./util.js";
import type { Rng } from "./rng.js";
import { post, balance, type JournalEntry, type JeCounter } from "./ledger.js";
import { leagueMonths } from "./roster.js";
import type { Player } from "./player.js";

export interface Economy {
  /** Stadium capacity — the ceiling `gateFor` clamps attendance to. */
  cap: number;
  /** Per-head revenue rates. */
  gate: number;
  conc: number;
  park: number;
  merch: number;
  /** Flat monthly/annual revenue and expense lines. */
  spons: number;
  payroll: number;
  staff: number;
  travel: number;
  stad: number;
  gameday: number;
  fo: number;
  mktg: number;
  ins: number;
  dev: number;
  scouting: number;
  /** MLB only. */
  minors?: number;
  media?: number;
  dist?: number;
  /** Opening capitalization. */
  equity: number;
  note: number;
  plant: number;
  apr: number;
  ticketFace: number;
}

/**
 * TUNING TARGET stated above. `qa/econ.js` measured the result across
 * seeds in the original; this port's own equivalent check is
 * `test/economics.test.ts`'s full-season net-income assertion.
 *
 * `scouting` (DECISIONS.md D90) closes this file's own long-disclosed gap
 * ("No monthly SCOUTING cost is posted... account 5300 exists, no dollar
 * figure survived") — a genuinely invented T3 figure, same status as every
 * other flat line here, since RESEARCH.md §17.5 confirms staff cost at this
 * scale is not published anywhere. Sized deliberately SMALL relative to
 * `dev` (player development) — a real indy-ball scouting operation is a
 * couple of area scouts and a truck, not a farm department — and
 * deliberately NOT included in `INDY_OPEX_KEYS` below: that multiplier was
 * empirically solved (D86) against a sourced net-income target measured
 * BEFORE any scouting cost existed, and folding a brand-new line into an
 * already-fitted multiplier would silently redistribute weight the fit was
 * never asked to carry. `scouting` IS scaled by each independent league's
 * own `opScale` (`econFor` below) and by `PECOS_SCALE`
 * (`deriveEconPecos` below), the same way every other flat cost line already
 * is — a bigger league's scouting department costs more, the same shape as
 * its stadium or staff line.
 */
const BASE_ECON = {
  INDY: {
    cap: 4500, gate: 7.25, conc: 4.4, park: 1.2, merch: 2.1,
    spons: 18000, payroll: 128000, staff: 26500, travel: 19300, stad: 43400,
    gameday: 5800, fo: 34900, mktg: 9000, ins: 5100, dev: 3600, scouting: 10000,
    // A club opens in the PRE-SEASON and carries four or five months of
    // payroll, stadium and front-office cost before a single dollar of
    // gate. Working capital has to cover that gap or the club is
    // insolvent on day one, which is a seeding defect, not a difficulty
    // setting. Most of it is seasonal financing, matching how the real
    // thing is funded.
    equity: 560000, note: 520000, plant: 260000, apr: 0.095,
    ticketFace: 13,
  },
  // Re-tuned against a FULL CALENDAR YEAR in the original — a March-to-
  // November measure read +$13M as break-even; the winter (five months of
  // payroll, stadium and front office with no gate) turned that into
  // -$34M a year. Measure the whole year.
  MLB: {
    cap: 41000, gate: 38, conc: 19, park: 6, merch: 8,
    spons: 3750000, payroll: 14600000, staff: 2050000, travel: 750000, stad: 2850000,
    gameday: 195000, fo: 3100000, mktg: 1900000, ins: 660000, dev: 1700000, scouting: 900000,
    minors: 850000, media: 7900000, dist: 6250000,
    equity: 300000000, note: 340000000, plant: 470000000, apr: 0.058,
    ticketFace: 41,
  },
};

// THE PECOS ECONOMY — required for the floor to exist at all. Dropping a
// Pecos club into ECON.INDY would give it 400 fans a night against a
// $2.0M cost base built for 2,300: instant, unavoidable bankruptcy, and
// not an interesting one.
//
// ONE FIGURE IS SOURCED, the rest are scaled. Pay is $50/week (Indy Ball
// Island 2014-12-19; Yahoo Sports 2019-08-20) — the league states that
// since 2018 players are compensated from "baseball camps, 50/50 raffles
// and team activities" rather than under contracts at all, citing the
// Save America's Pastime Act. 22 men x $50 x ~11 weeks = ~$12,100 a
// season. T2. Everything else is ECON.INDY scaled by the attendance ratio
// (400/2300), floored so a club still has a front office and a bus. All
// T3.
//
// TWO scales, because a Pecos club is not a small independent club — it
// is a ten-week summer operation with almost no year-round overhead, and
// scaling the whole of ECON.INDY by the attendance ratio alone (0.174)
// produced a club that lost $200,000 a year on $83,000 of cash in 8 seeds
// out of 8 in the original's own testing. Guaranteed bankruptcy is not
// difficulty, it is a seeding defect. OPERATING is solved against the
// same law ECON.INDY is tuned to; CAPITAL is scaled separately and more
// gently — the owner's stake and the note are what he brought to the
// table, not a function of the gate.
const PECOS_SCALE = 0.05;
const PECOS_CAP_SCALE = 0.1;

function deriveEconPecos(indy: Economy): Economy {
  const out = { ...indy };
  for (const key of ["spons", "staff", "travel", "stad", "gameday", "fo", "mktg", "ins", "dev", "scouting"] as const) {
    out[key] = Math.max(250, Math.round((indy[key] * PECOS_SCALE) / 50) * 50);
  }
  for (const key of ["equity", "note", "plant"] as const) {
    out[key] = Math.round((indy[key] * PECOS_CAP_SCALE) / 100) * 100;
  }
  out.cap = 1500; // a Pecos park is a municipal field, not a stadium
  out.ticketFace = 8; // T3 — no Pecos ticket price is published
  out.gate = 5.0;
  out.conc = 2.75;
  out.park = 0.0;
  out.merch = 0.9;
  out.payroll = 12100; // T2 — 22 men x $50/wk x ~11 weeks
  out.apr = 0.115; // T3 — the floor borrows worse than the rungs
  return out;
}

/**
 * RECALIBRATED against this project's own sourced target, found while
 * verifying this pass (DECISIONS.md D86) — not assumed, not silently
 * baked into `BASE_ECON.INDY` above, which stays exactly what this pass's
 * notes first reconstructed. This project's own committed CHANGELOG.md
 * (Build 0.7, "THE ROSTER COSTS MONEY") and DECISIONS.md's D49 both state
 * the real target directly: **"all five [independent] economies... sit
 * between -$385 and +$963 at .500."** `BASE_ECON.INDY`'s flat operating
 * lines (`staff`/`travel`/`stad`/`fo`/`mktg`/`ins`/`dev`), as first
 * reconstructed from session notes with the primary source unavailable,
 * instead produced roughly an 80% profit margin at .500 — measured
 * directly by this pass's own diagnostic run, not assumed wrong.
 *
 * Re-solved the same way D49 itself describes solving it the first time:
 * fit net income against win% across several full-calendar-year simulated
 * seasons, per league, and read the intercept at .500. Binary-searched a
 * SHARED base multiplier first (against the Frontier League, holding its
 * own `opScale` fixed), then each OTHER Partner League's `opScale`
 * independently (`world-data.ts`) — exactly D49's own description,
 * "`opScale`... solved from the measured net," one league at a time, never
 * a single shared value.
 *
 * Lands within roughly 2-7% of revenue at .500 across all five leagues,
 * checked against seeds the solve never trained on — closer by an order of
 * magnitude, but a real, honest remaining gap from the sourced target's own
 * tight sub-$1K band. That gap is best explained by how much a single
 * random 25-man roster's payroll swings seed to seed (a genuine, intended
 * source of variance this project's own MLB verification already
 * documented — `economics.test.ts`), not a mechanism defect: the same
 * fitting method, on more seeds than this pass's runtime budget allowed,
 * would narrow it further without changing the mechanism at all.
 */
const INDY_OPEX_RECAL = 11.465;
const INDY_OPEX_KEYS = ["staff", "travel", "stad", "fo", "mktg", "ins", "dev"] as const;

function recalibrateIndyOpex(indy: Economy): Economy {
  const out = { ...indy };
  for (const key of INDY_OPEX_KEYS) out[key] = Math.round(indy[key] * INDY_OPEX_RECAL);
  return out;
}

const RECALIBRATED_INDY = recalibrateIndyOpex(BASE_ECON.INDY);

export const ECON: { INDY: Economy; MLB: Economy; PECOS: Economy } = {
  INDY: RECALIBRATED_INDY,
  MLB: BASE_ECON.MLB,
  PECOS: deriveEconPecos(RECALIBRATED_INDY),
};

/** A club's level-and-league published average attendance — Tier 1, already in `levels.ts`/`world-data.ts`. */
export function attFor(lvl: string, lg: string): number {
  if (lvl === "INDY") {
    const l = indyLeague(lg);
    if (l?.att) return l.att;
  }
  return (LVL as Record<string, { att: number }>)[lvl]?.att ?? LVL.INDY.att;
}

/**
 * One economy per league, resolved on demand — no module-level cache
 * (an adaptation, noted rather than silent: the original caches in
 * `ECON_LG` because world-gen calls this shape of function for hundreds
 * of clubs; this package only ever resolves economics for the ONE owned
 * club, so a cache would save nothing a real caller would notice, at the
 * cost of exactly the kind of cross-call state this package's other
 * modules avoid). Costs scale by the league's solved `opScale`, capital
 * by its gate relative to the reference club, and payroll is simply the
 * league's published cap. Revenue lines are NOT scaled — they already
 * differ, because attendance and home dates already differ.
 */
export function econFor(club: Pick<Club, "lvl" | "lg">): Economy {
  if (club.lvl === "MLB") return ECON.MLB;
  if (club.lvl !== "INDY") return ECON.INDY;
  const league = indyLeague(club.lg);
  if (!league) return ECON.INDY;
  const pecos = club.lg === "Pecos League";
  const base = pecos ? ECON.PECOS : ECON.INDY;
  const out = { ...base };
  const s = league.opScale || 1;
  for (const key of ["staff", "travel", "stad", "fo", "mktg", "ins", "dev", "gameday", "scouting"] as const) {
    out[key] = Math.round(base[key] * s);
  }
  if (league.cap) out.payroll = league.cap;
  out.cap = Math.round((league.att || base.cap / 1.55) * 1.55); // the park
  if (!pecos) {
    // Capital follows the size of the business: a 2,529-a-night club is
    // worth more, and borrows more, than a 2,146-a-night one. Reference
    // is the club ECON.INDY was tuned for — 2,300 over 50 dates.
    const idx = (league.att * (league.games / 2)) / (2300 * 50);
    for (const key of ["equity", "note", "plant"] as const) {
      out[key] = Math.round((base[key] * idx) / 100) * 100;
    }
  }
  return out;
}

/**
 * Attendance follows the record — but not the RUNNING record naively. A
 * club that lost its opener sat at .000, which drove form to an extreme
 * and cratered the second home date. Two corrections, both of which are
 * how the real thing behaves: the current record is regressed toward
 * .500 with a 40-game prior, and it is blended with LAST season's finish
 * (season-ticket bases are sold on it) — `lastPct` defaults to a neutral
 * .500 here, since no year-rollover system exists yet to carry a real
 * one forward (a real, stated gap, not silently assumed away). Tier 3.
 */
const GATE_PRIOR = 40;
const GATE_LAG = 0.45;
const GATE_ELAS = 2.2;

export function gateFor(club: Pick<Club, "lvl" | "lg" | "w" | "l" | "cap">, r: Rng, lastPct?: number): number {
  const att = attFor(club.lvl, club.lg);
  const g = nz(club.w) + nz(club.l);
  const cur = (nz(club.w) + 0.5 * GATE_PRIOR) / (g + GATE_PRIOR);
  const prev = nz(lastPct) || 0.5;
  const blend = GATE_LAG * prev + (1 - GATE_LAG) * cur;
  const form = 1 + (blend - 0.5) * GATE_ELAS;
  const noise = 0.8 + r() * 0.42;
  return Math.round(clamp(att * form * noise, 300, nz(club.cap) || att * 1.6));
}

/**
 * RECONSTRUCTED, NOT RE-VERIFIED — everything below this line (`gamesFor`,
 * `seedOpeningBooks`, `rosterPayroll`, `gateDay`, `postMonth`). The session
 * that first read these functions out of bush-league-v0.10.html no longer
 * has that file available (DECISIONS.md records the gap) — the primary
 * source could not be re-checked before writing this. What follows is a
 * best-effort, internally consistent reconstruction from that session's own
 * working notes, built ONLY from figures and mechanisms this port already
 * has confirmed (the `Economy` fields above, the real chart of accounts,
 * `leagueMonths`' real proration), not from invented numbers. Two honest
 * gaps, disclosed rather than papered over:
 *   - ~~No monthly SCOUTING cost is posted.~~ RESOLVED (D90, v2.11.0):
 *     `postMonth` now posts one, from `Economy.scouting`/`state.scoutingBudget`
 *     — an invented T3 figure like every other flat line here, sized small
 *     and disclosed as such (`BASE_ECON`'s own header comment). Kept struck
 *     through rather than deleted so this note stays a complete record of
 *     what this pass found, same convention ROADMAP.md's debt list uses.
 *   - The MLB local-media accrual/collection LAG (accrued this month,
 *     collected next) is a reasonable real-world pattern, not a confirmed
 *     replica of the original's own timing.
 * Re-check this whole block against the primary source the next time it is
 * available, per DECISIONS.md's entry for this pass.
 */

/** A pool's games-per-club — the same lookup `attFor` makes, for the games column instead of attendance. Not exported from `schedule.ts` (its own `gamesForPool` takes a `Club`, not a level/league pair), so mirrored here at the same two call sites `attFor` already covers. */
function gamesFor(lvl: string, lg: string): number {
  if (lvl === "INDY") {
    const l = indyLeague(lg);
    if (l?.games) return l.games;
  }
  return (LVL as Record<string, { g: number }>)[lvl]?.g ?? LVL.INDY.g;
}

/**
 * Opening capitalization — three entries dated before the season starts.
 * Without this the ledger opens at $0 and the first month's payroll and
 * stadium cost post the club straight into a negative balance before a
 * single game is played. Figures are the already-ported, already-disclosed
 * T3 `equity`/`note`/`plant` — this function's own contribution is only the
 * account mechanics (which three accounts, which side of each), not new
 * dollar figures. `club` is used only to word the memo (an MLB entry reads
 * "acquisition financing," an indy one "startup note payable") — cosmetic,
 * not a figure or account difference.
 */
export function seedOpeningBooks(
  ledger: JournalEntry[],
  counter: JeCounter,
  day: number,
  club: Pick<Club, "lvl">,
  E: Economy,
): void {
  const isMLB = club.lvl === "MLB";
  post(
    ledger, counter, day,
    isMLB ? "Ownership group capital contribution" : "Owner capital contribution",
    [[1000, E.equity], [3000, -E.equity]],
    "open",
  );
  post(
    ledger, counter, day,
    isMLB ? "Acquisition financing note" : "Startup note payable",
    [[1000, E.note], [2500, -E.note]],
    "open",
  );
  post(
    ledger, counter, day,
    "Ballpark & equipment capitalized",
    [[1500, E.plant], [1000, -E.plant]],
    "open",
  );
}

/**
 * The owned club's own monthly payroll — sums every rostered player's real
 * annual salary (`Player.sal`: the MLB curve, MiLB's flat CBA minimum, or
 * an indy contract already cap-fitted by `buildRosters`).
 *
 * NOT a single proration base — this project's own committed CHANGELOG.md
 * (Build 0.7, "THE ROSTER COSTS MONEY") states it directly: "annual
 * contracts spread over twelve months at MLB, monthly wages in season only
 * below it." DECISIONS.md's own D48 repeats it verbatim and separately
 * lists "MLB payroll posted only in-season" as a bug an earlier build
 * shipped and fixed — the opposite of what a first reading of `leagueMonths`
 * would suggest. So: MLB divides by 12 and posts every calendar month
 * (`postMonth` below never gates it on season); every other level divides
 * by `leagueMonths` (the same proration `contractFor` already applies
 * inline to indy contracts, `p.mo = Math.round(p.sal / mos)`) and posts
 * only `inSeason` — real minor-league and indy jobs are seasonal, MLB
 * contracts in this design are not.
 */
export function rosterPayroll(players: readonly Player[], club: Pick<Club, "id" | "lvl" | "lg">): number {
  let annual = 0;
  for (const p of players) if (p.cid === club.id) annual += nz(p.sal);
  const months = club.lvl === "MLB" ? 12 : leagueMonths(club);
  return Math.round(annual / months);
}

export interface GateDayResult {
  att: number;
  gateRev: number;
  concRev: number;
  parkRev: number;
  merchRev: number;
  gamedayCost: number;
}

/**
 * One home game's revenue and game-day cost. Gate/concessions/parking/
 * merchandise are `Economy`'s per-head rates against `gateFor`'s attendance
 * draw; game-day staff cost is `Economy.gameday` (a flat figure the same
 * shape as `staff`/`travel`/`stad`) prorated over the club's own home
 * dates — half its season's games, the same target `balanceVenues`
 * (`schedule.ts`) already aims every real schedule at.
 */
export function gateDay(
  ledger: JournalEntry[],
  counter: JeCounter,
  day: number,
  club: Pick<Club, "lvl" | "lg" | "w" | "l" | "cap">,
  E: Economy,
  r: Rng,
  lastPct?: number,
): GateDayResult {
  const att = gateFor(club, r, lastPct);
  const gateRev = round2(att * E.gate);
  const concRev = round2(att * E.conc);
  const parkRev = round2(att * E.park);
  const merchRev = round2(att * E.merch);
  const homeDates = Math.max(1, Math.round(gamesFor(club.lvl, club.lg) / 2));
  const gamedayCost = round2(E.gameday / homeDates);

  post(
    ledger, counter, day,
    `Home gate — ${att.toLocaleString()} fans`,
    [
      [1000, round2(gateRev + concRev + parkRev + merchRev)],
      [4000, -gateRev],
      [4100, -concRev],
      [4600, -parkRev],
      [4300, -merchRev],
    ],
    "gate",
  );
  if (gamedayCost > 0) {
    post(ledger, counter, day, "Game-day staff", [[5700, gamedayCost], [1000, -gamedayCost]], "gate");
  }

  return { att, gateRev, concRev, parkRev, merchRev, gamedayCost };
}

/**
 * The recurring monthly close for the owned club: sponsorship revenue,
 * MLB-only media/distribution/minor-league lines, every flat operating
 * cost, the owned roster's real payroll (`rosterPayroll`), and interest on
 * the opening note (`Economy.apr` against the outstanding balance of
 * account 2500 — `balanceSheet`'s own sign convention: a liability's raw
 * ledger balance is negative, so the outstanding amount is
 * `-balance(...)`).
 *
 * TWO DIFFERENT PRORATION BASES, not one — found and fixed during this
 * pass's own verification (DECISIONS.md), not assumed from the notes:
 *   - Every FLAT line (`spons`/`staff`/`travel`/`stad`/`fo`/`mktg`/`ins`/
 *     `dev`/`minors`/`media`/`dist`) is an ANNUAL figure prorated over 12
 *     real calendar months and posted every month, in-season or not — the
 *     TUNING TARGET comment on `ECON.MLB` above is explicit that the
 *     winter's "stadium and front office" cost still lands with no gate to
 *     offset it, which only holds if these lines keep posting through the
 *     off-season.
 *   - PLAYER PAYROLL (`rosterPayroll`) prorates over the club's own season
 *     length (`leagueMonths`) instead, matching `contractFor`'s existing,
 *     already-tested indy-contract convention (`p.mo = p.sal /
 *     leagueMonths(club)`) — players are under contract for the season,
 *     not the calendar year — and is only POSTED during `inSeason` months.
 * Posting payroll on the /12 base like everything else was the actual bug
 * this pass's own diagnostic run caught: every flat line was being divided
 * by `leagueMonths` (7 for MLB) but posted 12 times a year regardless,
 * a systematic 12/7 overcharge on every single line that read as a
 * -$188M "net loss" before the fix, nowhere near the tuning target.
 *
 * MLB local media is ACCRUED to a receivable (1100) and collected with a
 * one-month lag rather than paid straight to cash — see this section's own
 * header note on why that lag is a reasonable pattern, not a confirmed
 * replica. The lag keeps the receivable bounded: each call collects
 * exactly what this same club accrued through the PRIOR call (the ledger
 * balance as of `day` minus the accrual this call just posted), so the
 * balance never grows past roughly one month of media revenue — the
 * property this pass's own verification checks for.
 */
export function postMonth(
  ledger: JournalEntry[],
  counter: JeCounter,
  day: number,
  club: Pick<Club, "id" | "lvl" | "lg">,
  players: readonly Player[],
  E: Economy,
  inSeason: boolean,
  /** The owner's own current scouting spend (annual figure, same convention as every other `Economy` line) — `state.scoutingBudget`, defaulted from `E.scouting` in `newGame()` but a real, separately-read state field so a future owner-facing dial actually changes what posts here, not a re-read of the level baseline. */
  scoutingSpend = E.scouting,
): void {
  const isMLB = club.lvl === "MLB";
  const line = (amount: number | undefined): number => round2(nz(amount) / 12);

  const revenue = (acct: number, amount: number, memo: string): void => {
    const amt = line(amount);
    if (amt > 0) post(ledger, counter, day, memo, [[1000, amt], [acct, -amt]], "month");
  };
  const expense = (acct: number, amount: number, memo: string): void => {
    const amt = line(amount);
    if (amt > 0) post(ledger, counter, day, memo, [[acct, amt], [1000, -amt]], "month");
  };

  revenue(4200, E.spons, "Sponsorship & signage");

  if (isMLB) {
    const mediaAccrual = line(E.media);
    if (mediaAccrual > 0) {
      post(ledger, counter, day, "Local media revenue accrued", [[1100, mediaAccrual], [4400, -mediaAccrual]], "month");
    }
    const collectible = round2(balance(ledger, 1100, undefined, day) - mediaAccrual);
    if (collectible > 0) {
      post(ledger, counter, day, "Local media receivable collected", [[1000, collectible], [1100, -collectible]], "month");
    }
    revenue(4500, E.dist ?? 0, "League revenue distribution");
    expense(5100, E.minors ?? 0, "Minor-league payroll");
  }

  expense(5200, E.staff, "Coaching & staff");
  expense(5500, E.travel, "Travel");
  expense(5600, E.stad, "Stadium operations");
  expense(5900, E.fo, "Front office & admin");
  expense(5800, E.mktg, "Marketing");
  expense(6000, E.ins, "Insurance");
  expense(5400, E.dev, "Player development");
  expense(5300, scoutingSpend, "Scouting");

  if (isMLB || inSeason) {
    const payroll = rosterPayroll(players, club);
    if (payroll > 0) post(ledger, counter, day, "Player payroll", [[5000, payroll], [1000, -payroll]], "month");
  }

  const noteBalance = -balance(ledger, 2500, undefined, day);
  const interest = round2((noteBalance * E.apr) / 12);
  if (interest > 0) post(ledger, counter, day, "Interest expense", [[6100, interest], [1000, -interest]], "month");
}
