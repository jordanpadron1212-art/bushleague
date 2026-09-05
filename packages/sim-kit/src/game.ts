/**
 * The box score — ported from bush-league-v0.10.html's `simGame()`. Plays
 * one full game between two rosters: nine-plus innings of half-innings,
 * each half-inning a sequence of `resolvePA()` calls against a live
 * base-out state, with baserunner advancement (`advOf`), stolen-base
 * attempts, double plays and sacrifice flies layered on top exactly as the
 * original built them. This is what turns a scheduled matchup
 * (`schedule.ts`), a roster (`roster.ts`) and the plate-appearance engine
 * (`pa-resolution.ts`) into a played game with a real line score and a
 * decided winner, loser and (sometimes) save.
 *
 * Adaptation, noted rather than silent, three places:
 *
 * 1. The original reads a per-club `gp` (games played) counter directly off
 *    the `Club` object to pick which of the five rotation slots starts —
 *    `t.cur = t.c.rot[G.club.gp % t.c.rot.length]`. `Club` (world.ts) is a
 *    pure world-generation output with no such mutable season counter, and
 *    no season-play driver exists yet to own one. This port takes the
 *    starting rotation slot as an explicit `homeRotationIndex`/
 *    `awayRotationIndex` parameter instead — whichever pass builds the
 *    season loop supplies it, the same "no hidden state" pattern as every
 *    other module here.
 *
 * 2. Two fields on the original's per-side scratch state (`t.pER`, `t.pR`,
 *    `t.lead`) are assigned once at game start and never read again inside
 *    the function, and `T` itself never escapes `simGame` — confirmed dead
 *    state, not ported.
 *
 * 3. FOUND, NOT REPRODUCED — the original's own return statement swaps
 *    home and away fielding errors. Every other paired field follows the
 *    convention `h*` = home (`T[1]`), `a*` = away (`T[0]`): `hr:T[1].r,
 *    ar:T[0].r`, `hh:T[1].h, ah:T[0].h`. But errors read `he:T[0].e,
 *    ae:T[1].e` — backwards relative to that convention, and confirmed
 *    against the original's own box-score table (line ~4952-4954 of
 *    bush-league-v0.10.html), which reads `b.ae` on the away row and `b.he`
 *    on the home row. `T[0].e` accumulates errors committed by the AWAY
 *    defence (incremented while `D === T[0]`, i.e. while the away team is
 *    pitching to the home team's batters) — so the original box score
 *    showed each team's OPPONENT's errors under its own team's column.
 *    Fixed here to follow the same `h*`/`a*` convention as every other
 *    field. See DECISIONS.md D82.
 */
import type { Rng } from "./rng.js";
import type { LevelEnv } from "./levels.js";
import type { Player } from "./player.js";
import type { Club } from "./world.js";
import type { BatterRates, PitcherRates, Rates } from "./rates.js";
import { resolvePA, advOf, Outcome, ADV, type OutcomeCode } from "./pa-resolution.js";
import { teamDefense, type FieldSlot, type TeamDefense } from "./fielding.js";
import { inc } from "./util.js";

export interface GameRoster {
  club: Club;
  /** Player ids, batting order. */
  lineup: readonly string[];
  /** Who is standing where — `RosterChart.field`. Absent means league-average defence. */
  field?: ReadonlyMap<FieldSlot, string>;
  /** Player ids, starting rotation. */
  rot: readonly string[];
  /** Player ids, bullpen. */
  pen: readonly string[];
}

export interface GameResult {
  homeRuns: number;
  awayRuns: number;
  homeHits: number;
  awayHits: number;
  homeErrors: number;
  awayErrors: number;
  /** Innings played — 9 unless extras. */
  innings: number;
  /** Runs per inning; `null` for a home half not played (game-ending walk-off before the bottom of the 9th or later). */
  homeLine: (number | null)[];
  awayLine: (number | null)[];
  winningPitcherId: string;
  losingPitcherId: string;
  homeStarterId: string;
  awayStarterId: string;
}

interface PitcherLine {
  o: number;
  er: number;
  ra: number;
}

interface Side {
  /** This club's fielding, computed once per game. `undefined` = league average. */
  def: TeamDefense | undefined;
  lineup: readonly string[];
  rot: readonly string[];
  pen: readonly string[];
  r: number;
  h: number;
  e: number;
  ord: number;
  line: (number | null)[];
  pi: number;
  pOut: number;
  cur: string;
  sp: string;
  seen: string[];
  budget: number;
  pstat: Map<string, PitcherLine>;
}

function pitcherBudget(rates: Rates | undefined): number {
  const bud = rates && "bud" in rates ? rates.bud : 0;
  return bud || 16;
}

function makeSide(
  team: GameRoster,
  rotationIndex: number,
  rates: ReadonlyMap<string, Rates>,
  players: ReadonlyMap<string, Player>,
): Side {
  const cur = team.rot[rotationIndex % Math.max(1, team.rot.length)]!;
  // The club's defence is fixed for the game — nine men, computed once,
  // rather than re-derived on every one of ~76 plate appearances.
  const assignment = new Map<FieldSlot, Player>();
  if (team.field) {
    for (const [slot, id] of team.field) {
      const p = players.get(id);
      if (p) assignment.set(slot, p);
    }
  }
  const def = assignment.size ? teamDefense(assignment) : undefined;
  const pstat = new Map<string, PitcherLine>();
  pstat.set(cur, { o: 0, er: 0, ra: 0 });
  return {
    def,
    lineup: team.lineup,
    rot: team.rot,
    pen: team.pen,
    r: 0,
    h: 0,
    e: 0,
    ord: 0,
    line: [],
    pi: 0,
    pOut: 0,
    cur,
    sp: cur,
    seen: [cur],
    budget: pitcherBudget(rates.get(cur)),
    pstat,
  };
}

function statLine(d: Side, id: string): PitcherLine {
  let q = d.pstat.get(id);
  if (!q) {
    q = { o: 0, er: 0, ra: 0 };
    d.pstat.set(id, q);
  }
  return q;
}

/** Records outs against the individual pitcher currently on the mound, not just the team counter. */
function recordOuts(d: Side, n: number): void {
  d.pOut += n;
  statLine(d, d.cur).o += n;
}

/**
 * Plays one full game. `players`/`rates` must cover every id in both
 * rosters' lineups, rotations and bullpens — `roster.buildRosters` and
 * `rates.buildRates` produce exactly that. Player stat lines (`Player.st`)
 * are accumulated IN PLACE, by design (`player.ts`'s own doc: counting
 * stats are meant to accumulate across a season, computed to rates only on
 * read) — this is the one place in the package that intentionally mutates
 * shared state, not an exception to the "no hidden state" rule so much as
 * what that rule was always going to hand off to.
 */
export function simGame(
  home: GameRoster,
  away: GameRoster,
  homeRotationIndex: number,
  awayRotationIndex: number,
  players: ReadonlyMap<string, Player>,
  rates: ReadonlyMap<string, Rates>,
  env: LevelEnv,
  r: Rng,
): GameResult {
  // Index 0 bats first (away), matching the original's own `T` ordering.
  const T: [Side, Side] = [
    makeSide(away, awayRotationIndex, rates, players),
    makeSide(home, homeRotationIndex, rates, players),
  ];
  const A = advOf(env);

  let inn = 1;
  let over = false;
  const wpCand: [string | null, string | null] = [null, null];
  const lpCand: [string | null, string | null] = [null, null];

  while (!over) {
    for (let s = 0; s < 2; s++) {
      // The home team does not bat in the ninth or later if already ahead.
      if (s === 1 && inn >= 9 && T[1].r > T[0].r) {
        T[1].line.push(null);
        break;
      }
      const B = T[s]!;
      const D = T[1 - s]!;
      let outs = 0;
      let runs = 0;
      // Fixed-length tuples, not `(string | null)[]` — a literal-index read
      // (`bR[0]`) on a tuple is exactly `string | null`; the same read on a
      // plain array would be `string | null | undefined` under this
      // package's `noUncheckedIndexedAccess` setting, for no reason (the
      // three base slots always exist).
      const bR: [string | null, string | null, string | null] = [null, null, null];
      const bP: [string | null, string | null, string | null] = [null, null, null];
      let errInInning = false;

      const score = (who: string | null, charged: string | null): void => {
        runs++;
        if (who) {
          const wp = players.get(who);
          if (wp) inc(wp.st, "r");
        }
        const pk = charged ?? D.cur;
        const q = statLine(D, pk);
        q.ra++;
        if (!errInInning) q.er++;
        const pp = players.get(pk);
        if (pp) inc(pp.st, "ra");
      };

      while (outs < 3) {
        if (D.pOut >= D.budget && D.pen.length) {
          D.cur = D.pen[D.pi % D.pen.length]!;
          D.pi++;
          D.pOut = 0;
          D.budget = 3;
          if (!D.seen.includes(D.cur)) D.seen.push(D.cur);
          statLine(D, D.cur);
        }
        const bi = B.lineup[B.ord % B.lineup.length]!;
        B.ord++;
        const bat = players.get(bi);
        const pit = players.get(D.cur);
        const batRates = rates.get(bi) as BatterRates | undefined;
        const pitRates = rates.get(D.cur) as PitcherRates | undefined;
        if (!bat || !pit || !batRates || !pitRates) {
          outs = 3;
          break;
        }
        const bs = bat.st;
        const ps = pit.st;
        // D is the side in the field, so D's defence is what this ball meets.
        const o: OutcomeCode = resolvePA(batRates, pitRates, env, r, D.def);
        inc(bs, "pa");
        inc(ps, "bf");

        if (o === Outcome.StrikeOut) {
          outs++;
          recordOuts(D, 1);
          inc(bs, "ab");
          inc(bs, "so");
          inc(ps, "pso");
        } else if (o === Outcome.Walk || o === Outcome.HitByPitch) {
          if (o === Outcome.Walk) {
            inc(bs, "bb");
            inc(ps, "pbb");
          } else {
            inc(bs, "hbp");
            inc(ps, "phbp");
          }
          if (bR[0] && bR[1] && bR[2]) {
            score(bR[2], bP[2]);
            inc(bs, "rbi");
          } else if (bR[0] && bR[1]) {
            bR[2] = bR[1]; bP[2] = bP[1]; bR[1] = bR[0]; bP[1] = bP[0];
          } else if (bR[0]) {
            bR[1] = bR[0]; bP[1] = bP[0];
          }
          bR[0] = bi; bP[0] = D.cur;
        } else if (o === Outcome.HomeRun) {
          inc(bs, "ab"); inc(bs, "h"); inc(bs, "hr"); inc(ps, "ph"); inc(ps, "phr"); B.h++;
          for (const k of [0, 1, 2] as const) {
            if (bR[k]) {
              score(bR[k], bP[k]);
              inc(bs, "rbi");
              bR[k] = null; bP[k] = null;
            }
          }
          score(bi, D.cur);
          inc(bs, "rbi");
        } else if (o === Outcome.Single || o === Outcome.Double || o === Outcome.Triple) {
          inc(bs, "ab"); inc(bs, "h"); inc(ps, "ph"); B.h++;
          const nR: [string | null, string | null, string | null] = [null, null, null];
          const nP: [string | null, string | null, string | null] = [null, null, null];
          if (o === Outcome.Single) {
            if (bR[2]) { score(bR[2], bP[2]); inc(bs, "rbi"); }
            if (bR[1]) {
              if (r() < A.s1_2score) { score(bR[1], bP[1]); inc(bs, "rbi"); }
              else { nR[2] = bR[1]; nP[2] = bP[1]; }
            }
            if (bR[0]) {
              if (!nR[2] && r() < A.s1_1to3) { nR[2] = bR[0]; nP[2] = bP[0]; }
              else { nR[1] = bR[0]; nP[1] = bP[0]; }
            }
            nR[0] = bi; nP[0] = D.cur;
          } else if (o === Outcome.Double) {
            inc(bs, "d2");
            if (bR[2]) { score(bR[2], bP[2]); inc(bs, "rbi"); }
            if (bR[1]) { score(bR[1], bP[1]); inc(bs, "rbi"); }
            if (bR[0]) {
              if (r() < A.d2_1score) { score(bR[0], bP[0]); inc(bs, "rbi"); }
              else { nR[2] = bR[0]; nP[2] = bP[0]; }
            }
            nR[1] = bi; nP[1] = D.cur;
          } else {
            inc(bs, "d3");
            for (const k of [0, 1, 2] as const) if (bR[k]) { score(bR[k], bP[k]); inc(bs, "rbi"); }
            nR[2] = bi; nP[2] = D.cur;
          }
          bR[0] = nR[0]; bR[1] = nR[1]; bR[2] = nR[2];
          bP[0] = nP[0]; bP[1] = nP[1]; bP[2] = nP[2];
        } else if (o === Outcome.ReachOnError) {
          inc(bs, "ab");
          D.e++;
          errInInning = true;
          if (bR[0] && bR[1] && bR[2]) score(bR[2], bP[2]);
          else if (bR[0] && bR[1]) { bR[2] = bR[1]; bP[2] = bP[1]; bR[1] = bR[0]; bP[1] = bP[0]; }
          else if (bR[0]) { bR[1] = bR[0]; bP[1] = bP[0]; }
          bR[0] = bi; bP[0] = D.cur;
        } else {
          // Out — a double play, a sacrifice fly, or a plain out.
          inc(bs, "ab");
          if (bR[0] && outs < 2 && r() < A.dp) {
            outs += 2;
            recordOuts(D, 2);
            bR[0] = null; bP[0] = null;
          } else if (bR[2] && outs < 2 && r() < A.sf) {
            outs++;
            recordOuts(D, 1);
            score(bR[2], bP[2]);
            inc(bs, "rbi"); inc(bs, "sf"); inc(bs, "ab", -1);
            bR[2] = null; bP[2] = null;
          } else {
            outs++;
            recordOuts(D, 1);
          }
        }

        if (outs >= 3) break;
        if (bR[0] && !bR[1] && r() < A.sbTry) {
          const runner = players.get(bR[0]);
          if (r() < ADV.sbOk) {
            if (runner) inc(runner.st, "sb");
            bR[1] = bR[0]; bP[1] = bP[0]; bR[0] = null; bP[0] = null;
          } else {
            if (runner) inc(runner.st, "cs");
            bR[0] = null; bP[0] = null;
            outs++;
            recordOuts(D, 1);
          }
        }
      }

      const before = B.r;
      B.r += runs;
      B.line.push(runs);
      if (before <= D.r && B.r > D.r) {
        wpCand[s] = B.cur;
        lpCand[1 - s] = D.cur;
      }
    }

    if (inn >= 9 && T[0]!.r !== T[1]!.r) over = true;
    else if (inn >= 18) over = true;
    inn++;
  }

  // No ties in baseball.
  if (T[0]!.r === T[1]!.r) T[r() < 0.5 ? 0 : 1]!.r++;

  const wS = T[0]!.r > T[1]!.r ? 0 : 1;
  const lS = 1 - wS;
  for (const t of T) {
    for (const id of t.seen) {
      const st = t.pstat.get(id);
      const p = players.get(id);
      if (!p || !st) continue;
      inc(p.st, "outs", st.o);
      inc(p.st, "er", st.er);
      inc(p.st, "g");
      if (id === t.sp) inc(p.st, "gs");
    }
  }

  // Win goes to the winning team's pitcher of record when they took the
  // lead for good; a starter who did not finish five innings cedes it to
  // the first reliever, which is the actual rule. Save: the last man in,
  // not the winner, finished it, and it was a save situation. Simplified
  // but not invented.
  const wT = T[wS]!;
  const lT = T[lS]!;
  let wp = wpCand[wS];
  let lp = lpCand[lS];
  if (wp === wT.sp && (wT.pstat.get(wT.sp) ?? { o: 0 }).o < 15) wp = wT.seen.length > 1 ? wT.seen[1]! : wp;
  if (wp == null) wp = wT.sp;
  if (lp == null) lp = lT.sp;
  const wpPlayer = players.get(wp);
  if (wpPlayer) inc(wpPlayer.st, "w");
  const lpPlayer = players.get(lp);
  if (lpPlayer) inc(lpPlayer.st, "l");
  const last = wT.seen[wT.seen.length - 1]!;
  const marg = Math.abs(T[0]!.r - T[1]!.r);
  if (last !== wp && wT.seen.length > 1 && marg <= 3) {
    const lastPlayer = players.get(last);
    if (lastPlayer) inc(lastPlayer.st, "sv");
  }

  return {
    homeRuns: T[1]!.r,
    awayRuns: T[0]!.r,
    homeHits: T[1]!.h,
    awayHits: T[0]!.h,
    // Fixed swap — see this file's header note 3 and DECISIONS.md D82.
    homeErrors: T[1]!.e,
    awayErrors: T[0]!.e,
    innings: inn - 1,
    homeLine: T[1]!.line,
    awayLine: T[0]!.line,
    winningPitcherId: wp,
    losingPitcherId: lp,
    homeStarterId: T[1]!.sp,
    awayStarterId: T[0]!.sp,
  };
}
