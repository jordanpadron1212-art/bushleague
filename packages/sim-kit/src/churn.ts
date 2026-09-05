/**
 * Roster churn — the actual fix for the gap `development.ts`/`rollover.ts`
 * (DECISIONS.md D87) disclosed rather than solved: with only ageing and no
 * turnover, a rolled-over population marches uniformly older forever, the
 * same "closed population under an age rule has exactly one destination"
 * finding this project's own committed CHANGELOG.md records from the
 * original build's own Build 0.9 ("THE WINTER") pass.
 *
 * NOT a port of that system, and deliberately a SMALLER slice of it than
 * the original build shipped — stated plainly, not left to be discovered
 * later. Build 0.9 is a full annual cycle: weekly in-season contract
 * purchases by affiliated organisations, an exclusive re-sign window,
 * a four-month open market with AI GM valuation, and a demand-sized
 * amateur intake sized against each league's own composition table. Free
 * agency — the owner (and every AI club) actively signing and releasing
 * specific players mid-season — is real, substantial, UI-shaped work of
 * its own (a market/free-agent screen with no home yet) and belongs to
 * the scouting/draft/ownership-ladder pass ROADMAP.md already tracks
 * separately, not folded in here.
 *
 * What THIS file does, once a year, at rollover, for every club in the
 * world: some players' contracts expire and they leave the population
 * outright (an age-curve exit, `bush-league-v0.10.html`'s own real
 * mechanism per CHANGELOG.md's Build 0.9 entry); of those who don't, some
 * are retained onto next year's roster (the "exclusive re-sign window,"
 * simplified to instant retention rather than a negotiable offer); the
 * rest of each roster is filled the exact same way a brand-new world's
 * ever was — `roster.ts`'s own `rosterPlan`/`contractFor`, already tested,
 * already legal-by-construction. A retained player is only ever slotted
 * into a composition row whose age AND service-time range he already
 * falls inside, so a churned indy roster is exactly as legal as a
 * freshly-generated one — never "make it legal after the fact."
 *
 * THE EXIT-HAZARD CURVE'S SHAPE is sourced (age-driven, accelerating past
 * a club's typical prime — CHANGELOG.md Build 0.9: "how much a club
 * discounts a man for each year he is over 26"); its exact TWO PARAMETERS
 * below are solved the same way this project's own economics recalibration
 * already was (DECISIONS.md D86): fit the simulated population against
 * Build 0.9's own MEASURED, published target — median Frontier age 26,
 * 14.6% aged 28+, 2.4% aged 30+, 32.6% roster continuity — not chosen by
 * eye. See `test/churn.test.ts` for the fit and DECISIONS.md D89 for the
 * solve itself. Applied to every level, not just the sourced Frontier
 * League — MLB/MiLB have no equivalent published target in this project's
 * own research to solve against, a real, disclosed gap distinct from the
 * Frontier fit (`churn.test.ts`'s own header says so directly).
 *
 * DECISIONS.md D93 adds one more real source ahead of a random fresh
 * signee: an optional `orgDraftPool` (this year's amateur draft class,
 * `draft.ts`, keyed by MLB org id) — when a MiLB AFFILIATE (never the MLB
 * roster itself; an 18-21 year old draftee does not debut in the majors)
 * has a vacancy `churnClub`'s own fill loop would otherwise hand to
 * `freshPlayer`, it checks that org's own remaining draftees first via
 * `Club.parent` (RESEARCH.md §2.6/DECISIONS.md D91). A draftee never
 * displaces a SURVIVOR — only ever fills a slot nothing else would have.
 */
import type { Rng } from "./rng.js";
import type { Club } from "./world.js";
import type { Player, Role } from "./player.js";
import { makePlayer } from "./player.js";
import { LVL, ILVL } from "./levels.js";
import { indyLeague } from "./world-data.js";
import { refineScout } from "./scouting.js";
import { rosterPlan, contractFor, intIn, SVC_EDGE, SVC_EDGE_CAP, ROSTER_N, OWNED_N } from "./roster.js";
import { clamp, nz } from "./util.js";

/**
 * `P(exit | age)` — a floor (even a 21-year-old's contract sometimes isn't
 * renewed) plus a rising slope past age 26, the same pivot age
 * `roster.ts`'s own SVC_EDGE / Build 0.9's own "discount per year over 26"
 * language centres on. Solved against the sourced target above, not eyeballed
 * — see `test/churn.test.ts`.
 */
const EXIT_BASE = 0.42;
const EXIT_SLOPE_PIVOT = 26;
const EXIT_SLOPE = 0.052;

export function exitProbability(age: number): number {
  return clamp(EXIT_BASE + EXIT_SLOPE * Math.max(0, age - EXIT_SLOPE_PIVOT), 0, 0.97);
}

/** A fresh entry-level age, matching `buildRosters`'s own non-composition draw exactly (`roster.ts`), reused rather than re-invented. */
function entryAge(club: Pick<Club, "lvl">, r: Rng): number {
  return Math.round(clamp(club.lvl === "MLB" ? 23 + r() * 13 : 19 + r() * 9, 18, 42));
}

function freshPlayer(club: Club, role: Role, age: number, svc: number | undefined, spec: { c: number; s: number } | undefined, r: Rng, id: string): Player {
  const level = LVL[club.lvl];
  const p = makePlayer(r, level, role, age, { ...(spec ? { spec } : {}), id });
  p.cid = club.id;
  p.lvl = club.lvl;
  if (svc != null) p.svc = svc;
  // `p.num` stays `makePlayer`'s own default (0) — `claim()` below is the
  // one place that actually assigns a real, collision-free jersey number
  // per club, for retained AND freshly generated players alike.
  refineScout(p);
  contractFor(p, club, r);
  return p;
}

/**
 * Churns one club's roster in place conceptually — returns the NEXT year's
 * full player list for this club (retained survivors plus fresh signings),
 * always exactly the club's real roster size. `clubPlayers` must already
 * be aged (`development.ts`'s `developPlayer`) — exit decisions use each
 * player's age GOING INTO the new year, matching the real "January 1"
 * timing CHANGELOG.md's own Build 0.9 entry describes.
 */
function churnClub(
  club: Club,
  clubPlayers: readonly Player[],
  ownedClubId: string | undefined,
  r: Rng,
  /** The season this intake belongs to — part of every fresh player's id (D97). */
  year: number,
  orgDraftPool?: ReadonlyMap<string, Player[]>,
): Player[] {
  // D97: (year, club, n) is unique by construction — churn runs once per
  // club per rollover, and `n` only ever increments within this call.
  let n = 0;
  const mint = (): string => `pc:${year}:${club.id}:${n++}`;
  const owned = club.id === ownedClubId;
  const survivors = clubPlayers.filter((p) => r() >= exitProbability(p.age));

  const plan = rosterPlan(club, r);
  const targetN = plan ? plan.length : (owned ? OWNED_N[club.lvl] : ROSTER_N[club.lvl]) ?? 25;
  const lvlBase = ILVL[club.lg] ?? LVL[club.lvl] ?? LVL.INDY;

  const roster: Player[] = [];
  const used = new Set<number>();
  const claim = (p: Player): void => {
    let num = p.num && !used.has(p.num) ? p.num : 0;
    let guard = 0;
    while (!num || used.has(num)) {
      num = 1 + Math.floor(r() * 74);
      if (guard++ > 200) break;
    }
    used.add(num);
    p.num = num;
    roster.push(p);
  };

  if (plan) {
    // INDY: fill each shuffled composition row with a still-eligible
    // survivor first (the "exclusive re-sign window," simplified), else
    // generate fresh for that exact row — identical to how `buildRosters`
    // built the row from nothing, so the result is exactly as
    // legal-by-construction as a brand-new world's roster.
    const pool = survivors.slice();
    for (let k = 0; k < plan.length; k++) {
      const row = plan[k]!;
      const role: Role = k < Math.round(plan.length * 0.47) ? "P" : "B";
      const fitIdx = pool.findIndex(
        (p) => p.role === role && p.age >= row.age[0] && p.age <= row.age[1] && p.svc >= row.svc[0] && p.svc <= row.svc[1],
      );
      if (fitIdx >= 0) {
        const [p] = pool.splice(fitIdx, 1);
        claim(p!);
        continue;
      }
      const age = intIn(r, row.age[0], row.age[1]);
      const svc = intIn(r, row.svc[0], row.svc[1]);
      const spec = { c: lvlBase.c + Math.min(SVC_EDGE_CAP, svc * SVC_EDGE), s: lvlBase.s };
      claim(freshPlayer(club, role, age, svc, spec, r, mint()));
    }
  } else {
    // MLB/MiLB: no published composition rule to preserve — keep survivors
    // (capped at the real roster size) and fill any remaining spots with
    // fresh entry-level talent, the same age draw `buildRosters` already
    // uses for these levels. A MiLB AFFILIATE (never the MLB roster
    // itself — D93) checks its own org's remaining draftees first.
    const kept = survivors.slice(0, targetN);
    for (const p of kept) claim(p);
    const nP = Math.round(targetN * 0.47);
    let pCount = kept.filter((p) => p.role === "P").length;
    let bCount = kept.length - pCount;
    const draftees = club.lvl !== "MLB" && club.parent ? orgDraftPool?.get(club.parent) : undefined;
    while (roster.length < targetN) {
      const role: Role = pCount < nP && (pCount <= bCount || bCount >= targetN - nP) ? "P" : "B";
      if (role === "P") pCount++;
      else bCount++;
      const fitIdx = draftees?.findIndex((p) => p.role === role) ?? -1;
      if (draftees && fitIdx >= 0) {
        const [drafted] = draftees.splice(fitIdx, 1);
        drafted!.cid = club.id;
        drafted!.lvl = club.lvl;
        contractFor(drafted!, club, r);
        claim(drafted!);
        continue;
      }
      claim(freshPlayer(club, role, entryAge(club, r), undefined, undefined, r, mint()));
    }
  }

  // INDY contracts fit the league's cap — the identical pass `buildRosters` already applies to a fresh world.
  if (club.lvl === "INDY") {
    const league = indyLeague(club.lg);
    if (league?.cap) {
      let tot = 0;
      for (const p of roster) tot += nz(p.sal);
      if (tot > 0) {
        const k = league.cap / tot;
        for (const p of roster) {
          p.sal = Math.round(p.sal * k);
          p.tot = p.sal;
        }
        let sum = 0;
        for (const p of roster) sum += p.sal;
        const resid = league.cap - sum;
        if (resid !== 0) {
          let top = roster[0]!;
          for (const p of roster) if (p.sal > top.sal) top = p;
          top.sal += resid;
          top.tot = top.sal;
        }
      }
    }
  }

  return roster;
}

/**
 * Churns the WHOLE world's population for one rollover — every club, not
 * just the owned one, the same "every club in the world" scope
 * `buildRosters` already has for a fresh save. Returns a brand-new flat
 * player array (`rollover.ts`'s own caller replaces `state.players` with
 * it); does not mutate `players` in place, because a departed player must
 * actually disappear from the array, not just get flagged.
 *
 * `orgDraftPool` (D93, `draft.ts`'s `DraftResult.byOrg`), if given, is
 * passed straight through to every club — `churnClub` itself decides
 * whether a given club may draw from it (its own org's affiliates only,
 * never the MLB roster). The SAME map (and the SAME per-org array inside
 * it) is handed to every club in the loop below, deliberately not copied —
 * an org's draftees are shared, mutable, and consumed exactly once across
 * however many of that org's own affiliates end up drawing from them this
 * rollover, in whatever order `clubs` itself iterates them.
 */
export function churnWorld(
  clubs: readonly Club[],
  players: readonly Player[],
  ownedClubId: string | undefined,
  r: Rng,
  /** The season this intake belongs to — part of every fresh player's id (D97). */
  year: number,
  orgDraftPool?: ReadonlyMap<string, Player[]>,
): Player[] {
  const byClub = new Map<string, Player[]>();
  for (const p of players) {
    if (!p.cid) continue;
    const arr = byClub.get(p.cid);
    if (arr) arr.push(p);
    else byClub.set(p.cid, [p]);
  }
  const next: Player[] = [];
  for (const c of clubs) {
    const roster = churnClub(c, byClub.get(c.id) ?? [], ownedClubId, r, year, orgDraftPool);
    next.push(...roster);
  }
  return next;
}
