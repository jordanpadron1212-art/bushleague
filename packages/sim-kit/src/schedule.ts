/**
 * The schedule — ported from bush-league-v0.10.html's `pairCounts()`/
 * `placeSchedule()`/`balanceVenues()`/`rrRounds()`/`SEASONS`. This code
 * carries four hard-won decisions (DECISIONS.md D34, D45, D46, D47) — the
 * comments explaining WHY are preserved verbatim, not summarized, because
 * they are the reason the next rewrite of this file won't reintroduce the
 * same three bugs.
 *
 * Adaptation, noted rather than silent: the original threads the games-
 * per-club figure through a scratch property (`club.__g`) set before
 * calling `placeSchedule` and deleted after. This port passes it as an
 * explicit parameter instead — no mutation of the caller's club objects,
 * consistent with this package's own "no hidden state" pattern (see
 * ledger.ts's and world.ts's own notes).
 */
import type { Rng } from "./rng.js";
import { toSerial } from "./date.js";
import { indyLeague } from "./world-data.js";
import { LVL } from "./levels.js";
import type { Club } from "./world.js";

export interface ScheduledGame {
  /** Serial day. */
  d: number;
  /** Home club index, into the `clubs` array passed to `placeSchedule`. */
  h: number;
  /** Away club index. */
  a: number;
}

/** Every club's one cross-league natural rival, where a real one exists under the current alignment (RESEARCH.md's schedule structure; DECISIONS.md's own note on deriving rather than assuming a rivalry table). */
export const RIVALS: readonly (readonly [string, string])[] = [
  ["NYY", "NYM"], ["CHC", "CWS"], ["LAD", "LAA"], ["SFG", "ATH"], ["BAL", "WSN"],
  ["STL", "KCR"], ["CIN", "CLE"], ["MIL", "MIN"], ["PIT", "DET"], ["MIA", "TBR"],
  ["ARI", "SEA"], ["PHI", "TOR"], ["ATL", "BOS"], ["HOU", "COL"], ["TEX", "SDP"],
];

/** Circle method: club 0 fixed, the rest rotate, so every round pairs all n clubs (n even) and no pair repeats until all n-1 rounds are used. */
function rrRounds(n: number): number[][][] {
  const rest: number[] = [];
  for (let i = 1; i < n; i++) rest.push(i);
  const rounds: number[][][] = [];
  for (let r = 0; r < n - 1; r++) {
    const p: number[][] = [[0, rest[0]!]];
    for (let i = 1; i <= (rest.length - 1) / 2; i++) p.push([rest[i]!, rest[rest.length - i]!]);
    rounds.push(p);
    rest.unshift(rest.pop()!);
  }
  return rounds;
}

export type PairCount = [i: number, j: number, games: number];

/** Returns [[i,j,games],...] for one competitive pool. `gamesPerClub` is ignored for an MLB pool (the 52/62/48 split is hardcoded to the real published structure). */
export function pairCounts(clubs: readonly Club[], gamesPerClub: number): PairCount[] {
  const n = clubs.length;
  const out: PairCount[] = [];
  const isMLB = clubs[0]?.lvl === "MLB";

  if (isMLB) {
    const byAbbr = new Map<string, number>();
    clubs.forEach((c, i) => byAbbr.set(c.abbr, i));
    const rival = new Map<string, string>();
    for (const [a, b] of RIVALS) {
      const A = clubs[byAbbr.get(a) ?? -1];
      const B = clubs[byAbbr.get(b) ?? -1];
      if (A && B && A.lg !== B.lg) {
        rival.set(a, b);
        rival.set(b, a);
      }
    }
    // Every club must have exactly one cross-league rival, or its season is three games short — pair whatever the list left over, in order.
    const loose: { AL: string[]; NL: string[] } = { AL: [], NL: [] };
    for (const c of clubs) if (!rival.has(c.abbr)) loose[c.lg === "AL" ? "AL" : "NL"].push(c.abbr);
    for (let k = 0; k < Math.min(loose.AL.length, loose.NL.length); k++) {
      rival.set(loose.AL[k]!, loose.NL[k]!);
      rival.set(loose.NL[k]!, loose.AL[k]!);
    }
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const A = clubs[i]!;
        const B = clubs[j]!;
        let g: number;
        if (A.lg === B.lg && A.div === B.div) g = 13; // 52 total
        else if (A.lg === B.lg) g = 6; // topped up below
        else g = rival.get(A.abbr) === B.abbr ? 6 : 3; // 48 total
        out.push([i, j, g]);
      }
    }
    // Same-league non-division is 62 = 8 opponents x 6 + 2 x 7. The two top-ups
    // must form a 2-regular graph or club totals drift by a game or two — a
    // greedy pass leaves some clubs at 61 and others at 63. Interleave the
    // divisions into a ring so neighbours are always cross-division, then take
    // the ring's own cycle: every club gets exactly two, and both sides agree.
    const key = new Map<string, PairCount>();
    for (const e of out) key.set(`${e[0]}|${e[1]}`, e);
    for (const lg of ["AL", "NL"] as const) {
      const divs = new Map<string, number[]>();
      clubs.forEach((c, i) => {
        if (c.lg !== lg) return;
        const arr = divs.get(c.div) ?? [];
        arr.push(i);
        divs.set(c.div, arr);
      });
      const dk = [...divs.keys()].sort();
      const ring: number[] = [];
      for (let k = 0; ; k++) {
        let any = false;
        for (const d of dk) {
          const idx = divs.get(d)?.[k];
          if (idx != null) {
            ring.push(idx);
            any = true;
          }
        }
        if (!any) break;
      }
      for (let k = 0; k < ring.length; k++) {
        const a = ring[k]!;
        const b = ring[(k + 1) % ring.length]!;
        const e = key.get(`${Math.min(a, b)}|${Math.max(a, b)}`);
        if (e && clubs[e[0]]!.div !== clubs[e[1]]!.div) e[2] = 7;
      }
    }
    return out.filter((e) => e[2] > 0);
  }

  // Affiliated and independent leagues play within the league. Distribute the game count as evenly as the club count allows.
  const per = gamesPerClub / (n - 1);
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) out.push([i, j, 0]);

  // THE REMAINDER IS SPREAD BY ROUND-ROBIN, NOT BY GREED. D46.
  //
  // The old top-up added games to whichever pair joined the two clubs
  // furthest behind target. Both clubs stay furthest behind for the next
  // iteration too, so it kept choosing THE SAME PAIR and dumped the whole
  // remainder onto it. The result was not a scheduling wobble, it was a
  // broken competition: a Triple-A pair meeting 42 times against a median of
  // 6, a Double-A pair 30 times, a Pecos pair 26 times against a median of 2.
  // Home/away imbalance was only the symptom that happened to be measured —
  // a pair meeting 26 times cannot be balanced by any venue flip.
  //
  // It went unseen for six builds because every harness checked how many
  // games a club played, never WHO it played. The two leagues that always
  // looked fine, the Frontier and the Atlantic, are exactly the two whose
  // game count divides evenly by their opponent count, so this loop never
  // ran for them at all.
  //
  // Now: give every club the same number of extra meetings by walking whole
  // round-robin rounds. Each round pairs every club with exactly one
  // opponent, so k rounds add exactly 2k games to everyone, and no pair is
  // used twice until every pair has been used once.
  const base = Math.floor(per / 2) * 2; // even, so home/away splits
  for (const e of out) e[2] = base;
  const extra = gamesPerClub - base * (n - 1);
  const key = new Map<string, PairCount>();
  for (const e of out) key.set(`${e[0]}|${e[1]}`, e);

  if (extra > 0 && extra % 2 === 0 && n % 2 === 0) {
    const rounds = rrRounds(n);
    for (let r = 0; r < extra / 2; r++) {
      for (const pr of rounds[r % rounds.length]!) {
        const e = key.get(`${Math.min(pr[0]!, pr[1]!)}|${Math.max(pr[0]!, pr[1]!)}`);
        if (e) e[2] += 2;
      }
    }
  } else if (extra > 0) {
    // Odd club count or an odd game count — no league in the world has either
    // today. Fall back to the old greedy so a future league still gets a
    // playable schedule, and leave the degeneracy visible rather than
    // pretending the round-robin covers a case it does not.
    const tally = (): number[] => {
      const t = new Array(n).fill(0) as number[];
      for (const e of out) {
        t[e[0]] = t[e[0]]! + e[2];
        t[e[1]] = t[e[1]]! + e[2];
      }
      return t;
    };
    let guard = 0;
    while (guard++ < 20000) {
      const t = tally();
      let lo = -1;
      let loV = 1e9;
      for (let i = 0; i < n; i++) if (t[i]! < loV) { loV = t[i]!; lo = i; }
      if (loV >= gamesPerClub) break;
      let best = -1;
      let bestV = 1e9;
      out.forEach((e, k2) => {
        if (e[0] !== lo && e[1] !== lo) return;
        const oo = e[0] === lo ? e[1] : e[0];
        if (t[oo]! < bestV) { bestV = t[oo]!; best = k2; }
      });
      if (best < 0) break;
      out[best]![2]++;
    }
  }
  return out.filter((e) => e[2] > 0);
}

/**
 * Home/away repair — DECISIONS.md D34. `placeSchedule` colours the calendar
 * to get every game PLACED; it never balances who hosts. A strict-
 * improvement sweep over every game (not a hunt for the two most extreme
 * clubs — that version stalled when the worst pair had no remaining
 * meeting left to flip), then a bounded plateau-escape pass allowing
 * sideways flips that host-relieve a club in surplus, while the worst
 * imbalance in the league keeps falling.
 */
export function balanceVenues(games: ScheduledGame[], n: number): void {
  const home = new Int32Array(n);
  const tot = new Int32Array(n);
  for (const g of games) {
    home[g.h]!++;
    tot[g.h]!++;
    tot[g.a]!++;
  }
  const sur = (i: number): number => home[i]! - tot[i]! / 2;

  for (let pass = 0; pass < 80; pass++) {
    let moved = 0;
    for (const g of games) {
      const before = Math.abs(sur(g.h)) + Math.abs(sur(g.a));
      home[g.h]!--;
      home[g.a]!++;
      if (Math.abs(sur(g.h)) + Math.abs(sur(g.a)) < before) {
        const h = g.h;
        g.h = g.a;
        g.a = h;
        moved++;
      } else {
        home[g.h]!++;
        home[g.a]!--;
      }
    }
    if (!moved) break;
  }

  const worst = (): number => {
    let w = 0;
    for (let i = 0; i < n; i++) w = Math.max(w, Math.abs(sur(i)));
    return w;
  };
  let last = worst();
  for (let guard = 0; guard < 40; guard++) {
    for (const g of games) {
      if (sur(g.h) <= 0.5) continue;
      const before = Math.abs(sur(g.h)) + Math.abs(sur(g.a));
      home[g.h]!--;
      home[g.a]!++;
      if (Math.abs(sur(g.h)) + Math.abs(sur(g.a)) <= before) {
        const h = g.h;
        g.h = g.a;
        g.a = h;
      } else {
        home[g.h]!++;
        home[g.a]!--;
      }
    }
    const now = worst();
    if (now >= last) break;
    last = now;
  }
}

/**
 * Places every game for one competitive pool. Density is the whole
 * problem: 162 games in ~186 days means a club is busy most of the
 * calendar. Packing whole series into free windows strands the last few
 * every time — instead colour the calendar day by day, always serving the
 * most constrained club first, and prefer yesterday's opponent so series
 * emerge naturally. Leftovers become doubleheaders, exactly what a real
 * schedule does with them.
 */
export function placeSchedule(clubs: readonly Club[], startDay: number, endDay: number, gamesPerClub: number, r: Rng): ScheduledGame[] {
  const n = clubs.length;
  const days = endDay - startDay + 1;
  const counts = pairCounts(clubs, gamesPerClub);

  for (let attempt = 0; attempt < 10; attempt++) {
    const need: Int16Array[] = Array.from({ length: n }, () => new Int16Array(n));
    const home: Int16Array[] = Array.from({ length: n }, () => new Int16Array(n));
    const remain = new Int32Array(n);
    const hostCnt = new Int32Array(n);
    for (const [i, j, g] of counts) {
      need[i]![j] = g;
      need[j]![i] = g;
      remain[i]! += g;
      remain[j]! += g;
    }
    const games: ScheduledGame[] = [];
    let yest = new Int16Array(n).fill(-1);
    let yestH = new Int16Array(n).fill(-1);
    let run = new Int16Array(n);

    for (let d = 0; d < days; d++) {
      const free = new Uint8Array(n).fill(1);
      const today = new Int16Array(n).fill(-1);
      const todayH = new Int16Array(n).fill(-1);
      const todayR = new Int16Array(n);

      for (;;) {
        let bi = -1;
        let bv = -1;
        for (let i = 0; i < n; i++) {
          if (!free[i] || remain[i]! <= 0) continue;
          const p = remain[i]! * 1000 - ((r() * 7) | 0);
          if (p > bv) { bv = p; bi = i; }
        }
        if (bi < 0) break;

        let bj = -1;
        const y = yest[bi]!;
        // Keep the series going, but a series is two to four games. Without a
        // cap the rule simply kept re-pairing the same clubs and produced an
        // eleven-game set against one division rival.
        //
        // Verified during the port (calibration/testing this pass, not
        // present in the original's own comments): this cap gates only the
        // FAST PATH below (`bj = y`). If it blocks that path, the fallback
        // full scan can still reselect the SAME opponent — its score is
        // `need[bi][j]*100000 + ...`, so whichever team has the most
        // remaining games against `bi` dominates every other candidate — and
        // `cont` (which drives the run counter) only checks "is today's
        // opponent the same as yesterday's," not which path chose it. A
        // pair whose remaining need against each other dwarfs every other
        // matchup can occasionally run 5-6 calendar days rather than 3-4.
        // Confirmed harmless to the properties that matter (exact game
        // totals, D34 home/away balance, D46 opponent-distribution fairness
        // — see test/schedule.test.ts) and never approaches the actual
        // defect class this cap exists to prevent (an unbroken double-digit
        // run). Left as ported rather than silently tightened, since there
        // is no old test harness available to confirm whether the original
        // build ever exhibited or excluded this same behaviour.
        const cap = (bi * 7 + d * 13) % 10 < 4 ? 4 : 3;
        if (y >= 0 && free[y] && need[bi]![y]! > 0 && run[bi]! < cap) {
          bj = y;
        } else {
          let bw = -1;
          for (let j = 0; j < n; j++) {
            if (j === bi || !free[j] || need[bi]![j]! <= 0) continue;
            const w = need[bi]![j]! * 100000 + remain[j]! * 10 + ((r() * 7) | 0);
            if (w > bw) { bw = w; bj = j; }
          }
        }
        if (bj < 0) { free[bi] = 0; continue; }

        // A series is played at ONE park. Re-picking the host each day
        // produced "@ SFG, @ SFG, vs SFG" inside a single three-game set.
        let h: number;
        if (bj === yest[bi] && yestH[bi]! >= 0) h = yestH[bi]!;
        else if (hostCnt[bi]! < hostCnt[bj]!) h = bi;
        else if (hostCnt[bj]! < hostCnt[bi]!) h = bj;
        else h = home[bi]![bj]! <= home[bj]![bi]! ? bi : bj;
        const a = h === bi ? bj : bi;

        games.push({ d: startDay + d, h, a });
        home[h]![a]!++;
        hostCnt[h]!++;
        need[bi]![bj]!--;
        need[bj]![bi]!--;
        remain[bi]!--;
        remain[bj]!--;
        free[bi] = 0;
        free[bj] = 0;
        today[bi] = bj;
        today[bj] = bi;
        todayH[bi] = h;
        todayH[bj] = h;
        const cont = bj === yest[bi];
        todayR[bi] = cont ? run[bi]! + 1 : 1;
        todayR[bj] = cont ? run[bj]! + 1 : 1;
      }
      yest = today;
      yestH = todayH;
      run = todayR;
    }

    // Whatever is left becomes a doubleheader on a day the pair already meets.
    let stuck = 0;
    outer: for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        while (need[i]![j]! > 0) {
          let put = false;
          for (const g of games) {
            if ((g.h === i && g.a === j) || (g.h === j && g.a === i)) {
              games.push({ d: g.d, h: g.h, a: g.a });
              put = true;
              break;
            }
          }
          if (!put) { stuck++; break; }
          need[i]![j]!--;
          need[j]![i]!--;
          remain[i]!--;
          remain[j]!--;
        }
        if (stuck) break outer;
      }
    }

    let ok = !stuck;
    if (ok) {
      for (let i = 0; i < n; i++) {
        if (remain[i] !== 0) { ok = false; break; }
      }
    }
    if (ok) {
      balanceVenues(games, n);
      games.sort((a, b) => a.d - b.d);
      return games;
    }
  }
  throw new Error(`schedule generator failed to place all games for ${clubs[0]?.lg}`);
}

/**
 * Season windows, 2026 — RESEARCH.md §2.1, §2.3, §9.7, all T1. Ported from
 * `SEASONS`. A pool's start/end month-day pair, resolved to a serial day
 * for a given year by `seasonWindow`.
 */
export const SEASONS: Record<string, { s: readonly [number, number]; e: readonly [number, number] }> = {
  MLB: { s: [3, 26], e: [9, 27] },
  AAA: { s: [3, 27], e: [9, 20] },
  AA: { s: [4, 2], e: [9, 13] },
  HIA: { s: [4, 2], e: [9, 6] },
  A: { s: [4, 2], e: [9, 6] },
  "Atlantic League": { s: [4, 21], e: [9, 13] },
  "American Association": { s: [5, 14], e: [9, 7] },
  "Frontier League": { s: [5, 7], e: [9, 20] },
  "Pioneer League": { s: [5, 19], e: [9, 6] },
  // 54 games in about ten weeks — the shortest season in the world by a
  // distance. Pacific division opens May 18, Mountain May 27; 2024 ran to
  // July 28. T1, RESEARCH.md §9.7.
  "Pecos League": { s: [5, 18], e: [7, 28] },
};

export function seasonWindow(club: Pick<Club, "lvl" | "lg">, year: number): [number, number] {
  const key = club.lvl === "INDY" ? club.lg : club.lvl;
  const s = SEASONS[key] ?? SEASONS.A!;
  return [toSerial(year, s.s[0], s.s[1]), toSerial(year, s.e[0], s.e[1])];
}

function gamesForPool(sampleClub: Club): number {
  if (sampleClub.lvl === "INDY") return indyLeague(sampleClub.lg)?.games ?? 100;
  return (LVL as Record<string, { g: number }>)[sampleClub.lvl]?.g ?? LVL.A.g;
}

export interface WorldSchedule {
  /** [day, homeClubIndex, awayClubIndex] — indices into the `clubs` array passed in, sorted by day. */
  games: [number, number, number][];
}

/**
 * Builds one season's full-world schedule: groups every club into its
 * competitive pool (MLB is one pool; each affiliated level+league and each
 * independent league is its own), places each pool's games independently,
 * and merges them sorted by day. The port of `setupSeason`'s scheduling
 * half — the G-mutating half (player stat resets, scouting refinement,
 * G.season bookkeeping) belongs to a later pass that actually has a `G` to
 * mutate.
 */
export function buildFullSeasonSchedule(clubs: readonly Club[], year: number, r: Rng): WorldSchedule {
  const pools = new Map<string, number[]>();
  clubs.forEach((c, i) => {
    const key = c.lvl === "MLB" ? "MLB" : `${c.lvl}|${c.lg}`;
    const arr = pools.get(key) ?? [];
    arr.push(i);
    pools.set(key, arr);
  });

  const games: [number, number, number][] = [];
  for (const idx of pools.values()) {
    const poolClubs = idx.map((i) => clubs[i]!);
    const [s, e] = seasonWindow(poolClubs[0]!, year);
    const gk = gamesForPool(poolClubs[0]!);
    const placed = placeSchedule(poolClubs, s, e, gk, r);
    for (const g of placed) games.push([g.d, idx[g.h]!, idx[g.a]!]);
  }
  games.sort((a, b) => a[0]! - b[0]!);
  return { games };
}
