/**
 * Roster construction — ported from bush-league-v0.10.html's `clsOf()`/
 * `rosterPlan()`/`buildRosters()`/`contractFor()`/`chartClub()`. Turns the
 * 218-club world (`world.ts`) into a full population of rostered players
 * with legal-by-construction composition, contracts scaled to each
 * independent league's real cap, and per-club lineup/rotation/bullpen depth
 * charts.
 *
 * Scope, stated rather than silently expanded: the original's
 * `buildRosters()` also calls `buildFreeAgents()` (a separate open-market
 * player pool) at the end of every call, and puts two players per club on
 * the injured list (a display concern for the not-yet-built medical view).
 * Neither is ported here — a free-agent pool has no meaning without the
 * market pass that draws from it (ROADMAP.md item 4+), and a game can be
 * simulated without it. Both omissions are structural, not approximated
 * incorrectly: this file simply doesn't call them yet.
 *
 * Adaptation, noted rather than silent: the original stores `lineup`/`rot`/
 * `pen` as arrays of INDICES into a global `G.players` flat array, mutated
 * directly onto each `Club` object by `chartClub`. This port has no global
 * player array and `Club` (world.ts) stays a pure world-generation output —
 * so `chartClub`/`chartWorld` return a `Map<club id, RosterChart>` of
 * player ids instead of mutating anything, matching this package's "no
 * hidden state" pattern (see world.ts's and schedule.ts's own notes). The
 * original also filters a `"MIN"` roster status out of an available player
 * pool in `chartClub`; this port's `RosterStatus` union has no `"MIN"`
 * value yet (nothing produces one — there is no promotion/demotion system
 * built), so only `"IL"` is filtered. Not a behavioural gap today, just
 * something the next pass that adds `"MIN"` needs to remember to wire in
 * here too.
 */
import type { Rng } from "./rng.js";
import type { Club } from "./world.js";
import { LVL, ILVL } from "./levels.js";
import { indyLeague, type RosterCompRow } from "./world-data.js";
import { SEASONS } from "./schedule.js";
import { makePlayer, type Player, type Role } from "./player.js";
import { refineScout } from "./scouting.js";
import { clamp, nz, round2 } from "./util.js";
import { FIELD_SLOTS, defFit, eligibleAt, type FieldSlot } from "./fielding.js";

/** Roster size for a club nobody owns — DECISIONS.md, RESEARCH.md §5-9. */
export const ROSTER_N: Record<string, number> = { MLB: 32, AAA: 26, AA: 26, HIA: 26, A: 26, INDY: 25 };
/** Roster size for the owner's own club — bigger everywhere but independent ball, where an owner gets no extra spots (an indy roster's size is set entirely by its league's own composition rule). */
export const OWNED_N: Record<string, number> = { MLB: 40, AAA: 30, AA: 30, HIA: 30, A: 30, INDY: 25 };

/** Small edge for survivors of a legal-by-construction composition slot — the league centre does the work, this only tilts within a league. Tier 3. */
export const SVC_EDGE = 0.5;
export const SVC_EDGE_CAP = 4;

/** A uniform draw over an INCLUSIVE integer range. `round(lo + r*(hi-lo+0.999))` overshoots by one at the top — not cosmetic: it is what let 30-year-olds into the Frontier League's 27-29 class and 4-year men into the Pioneer, whose one published rule is a three-year service cap. */
export function intIn(r: Rng, lo: number, hi: number): number {
  return lo + Math.floor(r() * (hi - lo + 1));
}

/**
 * A player's roster classification under his league's published rule —
 * DERIVED, not stored, so it stays true after a birthday (age drives every
 * indy rule but Pecos's, and nothing here is re-run when a player ages).
 * RESEARCH.md §9.1 carries the citations for each branch.
 */
export function clsOf(lvl: string, lg: string, p: Pick<Player, "age" | "svc">): string {
  if (lvl !== "INDY") return "";
  const age = nz(p.age);
  const svc = nz(p.svc);
  switch (lg) {
    case "Frontier League":
      return age <= 24 ? "Pro-1" : age === 25 ? "Pro-2" : age === 26 ? "Exp-1" : age <= 29 ? "Exp-2" : "Veteran";
    case "American Association": {
      if (svc >= 6) {
        if (age < 24) return "LS-3";
        if (age < 26) return "LS-4";
        return "Veteran";
      }
      return svc < 1 ? "Rookie" : `LS-${Math.min(5, Math.ceil(svc))}`;
    }
    case "Pioneer League":
      return ["1st yr", "2nd yr", "3rd yr", "4th yr"][Math.min(3, svc)] ?? "1st yr";
    case "Pecos League":
      return age <= 24 ? "Rookie" : "Veteran";
    default:
      return "—";
  }
}

/**
 * One shuffled roster-composition slot per spot, built to spec rather than
 * drawn-and-repaired — a repair loop can fail quietly and leave an illegal
 * roster, and this cannot. `null` for a non-independent club: only
 * independent leagues publish a composition rule to build to.
 */
export function rosterPlan(club: Pick<Club, "lvl" | "lg">, r: Rng): readonly RosterCompRow[] | null {
  if (club.lvl !== "INDY") return null;
  const league = indyLeague(club.lg);
  if (!league?.comp) return null;
  const plan: RosterCompRow[] = [];
  for (const row of league.comp) for (let i = 0; i < row.n; i++) plan.push(row);
  for (let i = plan.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = plan[i]!;
    plan[i] = plan[j]!;
    plan[j] = t;
  }
  return plan;
}

/** A pool's playing months, for prorating a monthly wage — the Pecos League plays ten weeks, the Atlantic nearly five months, and paying both over a hardcoded five was part of why one roster costing $290,000 posted $128,000. */
export function leagueMonths(club: Pick<Club, "lvl" | "lg">): number {
  const key = club.lvl === "INDY" ? club.lg : club.lvl;
  const season = SEASONS[key];
  if (!season) return 5;
  return Math.max(1, season.e[0] - season.s[0] + 1);
}

const MILB_SALARY_SCALE: Record<string, number> = { AAA: 35800, AA: 30250, HIA: 27300, A: 26200 };

/**
 * Assigns a contract. MLB is a Tier 3 curve off the scouted overall;
 * independent ball is priced off its own published wage floor (Pecos:
 * ~$217/month, not on a contract at all per the league's own rules,
 * RESEARCH.md T2); MiLB is the flat 2025 CBA minimum by level, T2.
 */
/**
 * The league minimum. RESEARCH.md §15.1 — T1, $780,000 for 2026.
 * A player with under three years of service earns this almost regardless
 * of how good he is, which is the single largest source of salary
 * dispersion on a real roster.
 */
export const MLB_MIN_SALARY = 780000;

/**
 * What a player earns as a share of his open-market value, by service time.
 *
 * The structure is T1 (RESEARCH.md §15.1): under 3.000 years a player has no
 * leverage and earns near the minimum; from 3.000 to 6.000 he is arbitration
 * eligible; at 6.000 he is a free agent and paid the market. **The three
 * arbitration shares themselves are T3** — the widely used industry
 * rule of thumb that arbitration years pay roughly a quarter, then two
 * fifths, then three fifths of free-agent value. No published schedule
 * exists, because arbitration is decided case by case.
 *
 * This is what fixes a defect the Roster page surfaced the moment it could
 * be looked at (D103): pricing purely off a grade rounded to the nearest 5
 * gave every 65-grade player on the roster the identical $13.00M salary, and
 * every 60 the identical $8.95M. A real roster's defining financial feature
 * is the opposite — a 65-grade rookie on the minimum next to a 65-grade
 * veteran on eight figures.
 */
export function salaryForService(marketValue: number, svc: number): number {
  if (svc < 3) return MLB_MIN_SALARY;
  if (svc >= 6) return marketValue;
  const share = svc < 4 ? 0.25 : svc < 5 ? 0.4 : 0.6;
  // Never pay an arbitration-eligible player less than a rookie would get.
  return Math.max(MLB_MIN_SALARY, marketValue * share);
}

export function contractFor(
  p: Player,
  club: Pick<Club, "lvl" | "lg">,
  r: Rng,
  /**
   * What this club pays relative to the market for the same player
   * (DECISIONS.md D102). 1 is the market rate and leaves every existing
   * caller byte-identical. Above 1 is what an owner who has authorised a
   * big payroll actually experiences: you do not get better players at the
   * same price, you outbid 29 other clubs for them.
   */
  marketFactor = 1,
): void {
  if (club.lvl === "MLB") {
    // Service time FIRST, because as of D103 it is what prices the contract.
    // Moving this line above the salary consumes no extra `r()` and does not
    // reorder any draw — the salary expression uses none.
    p.svc = round2(clamp((p.age - 22) * 0.9 + r() * 1.4, 0, 16));
    const market = (760000 + Math.pow(clamp(p.ovr - 30, 0, 50) / 50, 2.6) * 31000000) * marketFactor;
    p.sal = Math.round(salaryForService(market, p.svc) / 50000) * 50000;
    p.yrs = p.svc < 3 ? 1 : 1 + Math.floor(r() * 5);
    p.opt = p.svc < 3 ? Math.max(0, 3 - Math.floor(r() * 3)) : 0;
  } else if (club.lvl === "INDY") {
    const pecos = club.lg === "Pecos League";
    const mo = pecos
      ? Math.round(clamp(150 + ((p.ovr - 25) / 35) * 250, 120, 450) / 10) * 10
      : Math.round(clamp(800 + ((p.ovr - 25) / 35) * 2600, 700, 4000) / 50) * 50;
    p.sal = mo * (pecos ? 2.5 : 5);
    p.mo = mo;
    p.yrs = 1;
    p.svc = nz(p.svc);
    p.opt = 0;
  } else {
    p.sal = MILB_SALARY_SCALE[club.lvl] ?? 26200;
    p.yrs = 1;
    p.svc = 0;
    p.opt = 3;
  }
  p.tot = p.sal * Math.max(1, p.yrs);
}

/**
 * Generates every player for every club in the world — the whole
 * population `simGame` (`game.ts`) plays with. `ownedClubId`, if given,
 * gets the bigger `OWNED_N` roster (matching the original's `G.club`); an
 * independent club's size is set entirely by its own composition rule and
 * ignores ownership, because an indy owner gets no extra roster spots.
 */
export function buildRosters(clubs: readonly Club[], r: Rng, ownedClubId?: string): Player[] {
  const players: Player[] = [];

  for (const c of clubs) {
    const owned = c.id === ownedClubId;
    const plan = rosterPlan(c, r);
    const n = plan ? plan.length : (owned ? OWNED_N[c.lvl] : ROSTER_N[c.lvl]) ?? 25;
    const nP = Math.round(n * 0.47);
    const lvlBase = ILVL[c.lg] ?? LVL[c.lvl] ?? LVL.INDY;
    const level = LVL[c.lvl];
    const used = new Set<number>();
    const mine: Player[] = [];

    for (let k = 0; k < n; k++) {
      const role: Role = k < nP ? "P" : "B";
      const cl = plan ? plan[k]! : null;
      const age = cl
        ? intIn(r, cl.age[0], cl.age[1])
        : Math.round(clamp(c.lvl === "MLB" ? 23 + r() * 13 : 19 + r() * 9, 18, 42));
      const svc = cl ? intIn(r, cl.svc[0], cl.svc[1]) : 0;
      const spec = cl ? { c: lvlBase.c + Math.min(SVC_EDGE_CAP, svc * SVC_EDGE), s: lvlBase.s } : undefined;

      // D97: an explicit id, unique by construction — this club, this slot.
      // buildRosters runs exactly once per world, so (club, k) can't repeat.
      // Positions come from a template, not the uniform draw. Cycling the
      // eight fielding positions HARDEST FIRST guarantees that a club of
      // any size owns a catcher and a shortstop before it owns a second
      // first baseman — which is how real rosters are built, and without
      // which `chartClub` is asked to find a catcher who does not exist.
      // Pitchers keep their own SP/RP draw untouched.
      const p = makePlayer(r, level, role, age, {
        ...(spec ? { spec } : {}),
        id: `pr:${c.id}:${k}`,
        ...(role === "B" ? { pos: FIELDING_TEMPLATE[(k - nP) % FIELDING_TEMPLATE.length]! } : {}),
      });
      p.cid = c.id;
      p.lvl = c.lvl;
      if (cl) p.svc = svc;

      let num = 0;
      let guard = 0;
      do {
        num = 1 + Math.floor(r() * 74);
      } while (used.has(num) && guard++ < 200);
      used.add(num);
      p.num = num;

      refineScout(p);
      contractFor(p, c, r);
      players.push(p);
      mine.push(p);
    }

    // CONTRACTS FIT THE LEAGUE'S CAP. The raw ovr-to-dollars curve is one
    // curve for all of independent ball, so scaling the whole club to its
    // real published cap keeps the curve's SHAPE (the best man still earns
    // the most) while making the cap the real constraint it is in these
    // leagues.
    if (c.lvl === "INDY") {
      const league = indyLeague(c.lg);
      if (league?.cap) {
        let tot = 0;
        for (const p of mine) tot += nz(p.sal);
        if (tot > 0) {
          const k = league.cap / tot;
          const mos = leagueMonths(c);
          for (const p of mine) {
            p.sal = Math.round(p.sal * k);
            p.mo = Math.round(p.sal / mos);
            p.tot = p.sal;
          }
          // Rounding every contract independently leaves the club a few
          // dollars over its own cap. Put the residual on the best-paid
          // man, who can absorb it without changing what he is.
          let sum = 0;
          for (const p of mine) sum += p.sal;
          const resid = league.cap - sum;
          if (resid !== 0) {
            let top = mine[0]!;
            for (const p of mine) if (p.sal > top.sal) top = p;
            top.sal += resid;
            top.mo = Math.round(top.sal / mos);
            top.tot = top.sal;
          }
        }
      }
    }
  }

  return players;
}

export interface RosterChart {
  /** Player ids, batting order — always non-empty for any club with at least one player. */
  lineup: readonly string[];
  /** Player ids, starting rotation. */
  rot: readonly string[];
  /** Player ids, bullpen. */
  pen: readonly string[];
  /**
   * Who is standing where. Added with the fielding model — before it a
   * "lineup" was nine bats and the positions beside their names were
   * decoration. `lineup` is the batting order; this is the alignment the
   * defence is computed from.
   */
  field: ReadonlyMap<FieldSlot, string>;
}

/**
 * Builds one club's depth chart.
 *
 * THE LINEUP IS NOW A DEFENSIVE ALIGNMENT, not nine bats. Before the
 * fielding model this took the best nine hitters by scouted overall, which
 * produced real lineups carrying three right fielders and no catcher —
 * visible the moment a screen finally rendered one.
 *
 * Positions are filled HARDEST FIRST, in `FIELD_SLOTS` order (C, SS, CF,
 * 2B, 3B, RF, LF, 1B, DH), which is the sourced positional adjustment in
 * descending difficulty (RESEARCH.md §21.6). That order is the algorithm's
 * whole cleverness, and it mirrors how a real club is built: you find a
 * catcher and a shortstop first, because almost nobody can do those jobs,
 * and you can always put your last man at first base.
 *
 * Each candidate is scored for each slot as his bat plus his glove THERE —
 * `defAt` having already charged him for playing out of position. So a
 * good-hit/no-field player drifts down the spectrum to first base and DH on
 * his own, without a rule saying so, and a shortstop who can hit stays at
 * short because that is where his glove is worth most.
 *
 * A club too short to fill nine slots fields who it has rather than
 * throwing — the same fallback the bat-only version had, for the same
 * reason: a short roster still has to take the field.
 */
export function chartClub(clubPlayers: readonly Player[]): RosterChart {
  const avail = clubPlayers.filter((p) => p.status !== "IL");
  const bats = avail.filter((p) => p.role === "B").sort((a, b) => b.ovr - a.ovr);
  const sps = avail.filter((p) => p.role === "P" && p.pos === "SP").sort((a, b) => b.ovr - a.ovr);
  const rps = avail.filter((p) => p.role === "P" && p.pos === "RP").sort((a, b) => b.ovr - a.ovr);

  const field = new Map<FieldSlot, string>();
  const taken = new Set<string>();
  const pool = bats.length ? bats : clubPlayers.slice();

  for (const slot of FIELD_SLOTS) {
    // Eligible men first; only a club with nobody who can do the job at all
    // — no catcher anywhere on the roster — falls back to whoever is left,
    // because a short roster still has to take the field.
    //
    // ONE PASS, NO ALLOCATION. The first version filtered `pool` into a new
    // array for each of the nine slots, on every club, on every simulated
    // day — nearly two thousand short-lived arrays a day across the world.
    // Tracking the best eligible and the best ineligible together makes the
    // identical choice (prefer eligible, else the best of the rest, same
    // iteration order, same strict-greater tie-break) with none of the
    // garbage.
    let best: Player | null = null;
    let bestScore = -Infinity;
    let spare: Player | null = null;
    let spareScore = -Infinity;
    for (const p of pool) {
      if (taken.has(p.id)) continue;
      // The bat counts everywhere; the glove only where he is standing.
      // `defFit`, not `defAt`: the UNCLAMPED figure, so a man who simply
      // cannot play the position scores arbitrarily badly there instead of
      // bottoming out level with someone who merely plays it poorly.
      const score = p.ovr + (slot === "DH" ? 0 : (defFit(p, slot) - 50) * DEF_WEIGHT);
      if (eligibleAt(p, slot)) {
        if (score > bestScore) {
          bestScore = score;
          best = p;
        }
      } else if (score > spareScore) {
        spareScore = score;
        spare = p;
      }
    }
    const chosen = best ?? spare;
    if (!chosen) break;
    field.set(slot, chosen.id);
    taken.add(chosen.id);
  }

  // The batting ORDER is still by bat — a manager writes the card in the
  // order he wants them hitting, not in the order they stand on the grass.
  const byId = new Map(pool.map((p) => [p.id, p]));
  let lineup = [...field.values()].sort((a, b) => (byId.get(b)?.ovr ?? 0) - (byId.get(a)?.ovr ?? 0));

  let rot = sps.slice(0, 5).map((p) => p.id);
  let pen = rps.slice(0, 8).map((p) => p.id);

  if (!lineup.length) lineup = clubPlayers.slice(0, 9).map((p) => p.id);
  if (!rot.length) rot = sps.concat(rps).concat(clubPlayers).slice(0, 1).map((p) => p.id);
  if (!pen.length) pen = rot.slice();

  return { lineup, rot, pen, field };
}

/**
 * How much a point of defensive grade is worth against a point of overall
 * when deciding who plays where. Deliberately well under 1: a club will
 * move a man to an easier position for his bat, but will not bench a
 * clearly better hitter for a slightly better glove. Checked in
 * `fielding.test.ts` by asserting a club's best hitter still starts.
 */
const DEF_WEIGHT = 0.35;

/**
 * The order positions are handed out when a roster is built — the sourced
 * spectrum, hardest first (RESEARCH.md §21.6), cycled. Every club therefore
 * has a catcher before it has a spare corner outfielder, at any roster size
 * down to one. DH is absent on purpose: it is a role, not a fielding
 * position, and `chartClub` gives it to whoever is left over, which is what
 * happens on a real card.
 */
const FIELDING_TEMPLATE = ["C", "SS", "CF", "2B", "3B", "RF", "LF", "1B"] as const;


/** `chartClub` for every club in the world at once, keyed by club id. */
export function chartWorld(clubs: readonly Club[], players: readonly Player[]): Map<string, RosterChart> {
  const byClub = new Map<string, Player[]>();
  for (const p of players) {
    if (!p.cid) continue;
    const arr = byClub.get(p.cid);
    if (arr) arr.push(p);
    else byClub.set(p.cid, [p]);
  }
  const charts = new Map<string, RosterChart>();
  for (const c of clubs) charts.set(c.id, chartClub(byClub.get(c.id) ?? []));
  return charts;
}
