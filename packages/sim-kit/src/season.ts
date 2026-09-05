/**
 * The season-play driver — ported from bush-league-v0.10.html's
 * `playDay()` and `pushForm()`. Walks a built schedule (`schedule.ts`'s
 * `buildFullSeasonSchedule`) day by day, calls `simGame` (`game.ts`) for
 * every game scheduled on it, and updates each participating club's
 * season record — wins, losses, runs scored/allowed, games played (which
 * drives `simGame`'s rotation-slot pick), and a rolling last-10-games form
 * window — in place. Same "accumulates in place, by design" pattern
 * `game.ts`'s own header already established for `Player.st`; `Club`'s
 * season-record fields exist for exactly this and nothing else touches
 * them.
 *
 * This is the piece that turns "a game can be simulated" (v2.4.0) into "a
 * season can be played."
 *
 * Scope, stated plainly: the original's `playDay()` also captures a box
 * score for the OWNER'S OWN club only (`G.box`), posts that day's home-
 * game gate revenue through the ledger (`gateDay`), and writes a wire
 * event (`logEvent`). All three are UI/money-loop/save concerns that
 * belong to later passes (state wiring, the ledger-integrated gate, the
 * wire) — none of them exist yet to receive this. This file is the pure
 * simulation half only: play every game scheduled for a day, update every
 * participating club's record, return what was played. A caller that
 * wants one club's own box score can filter this function's own return
 * value instead of a separately-threaded `G.box`.
 */
import type { Rng } from "./rng.js";
import { envFor } from "./levels.js";
import type { Club } from "./world.js";
import type { WorldSchedule } from "./schedule.js";
import type { RosterChart } from "./roster.js";
import type { Player } from "./player.js";
import type { Rates } from "./rates.js";
import { simGame, type GameResult, type GameRoster } from "./game.js";

export interface PlayedGame {
  day: number;
  homeClubId: string;
  awayClubId: string;
  result: GameResult;
}

/** Updates one club's rolling last-10-games window and current streak — ported from `pushForm()`. */
export function pushForm(c: Pick<Club, "l10" | "strk">, won: boolean): void {
  c.l10.push(won ? 1 : 0);
  if (c.l10.length > 10) c.l10.shift();
  c.strk = won ? (c.strk > 0 ? c.strk + 1 : 1) : c.strk < 0 ? c.strk - 1 : -1;
}

/** `[wins, losses]` over a club's current last-10 window — the original derived this on every read (`c.l10.reduce(...)`) rather than storing a count, and this port does the same. */
export function clubFormRecord(c: Pick<Club, "l10">): [wins: number, losses: number] {
  const w = c.l10.reduce((t, v) => t + v, 0);
  return [w, c.l10.length - w];
}

function rosterFor(club: Club, chart: RosterChart): GameRoster {
  // `field` MUST be carried through. Dropping it here compiles perfectly
  // and silently reverts every club to league-average defence — the same
  // shape of failure that left `def` and `arm` generated-but-unread for
  // four passes. `fielding.test.ts` asserts a real season is affected.
  return { club, lineup: chart.lineup, rot: chart.rot, pen: chart.pen, field: chart.field };
}

/**
 * Plays every game scheduled for exactly one day, resuming from `cursor`
 * (an index into `schedule.games`, which `buildFullSeasonSchedule` returns
 * pre-sorted by day) — the same resumable-cursor shape as the original's
 * `G.sp`, so a save can pick up mid-season without replaying from day one.
 * Any game whose club is missing a depth chart is skipped rather than
 * thrown on — shouldn't happen when `charts` was built from the same club
 * list the schedule was, but this function doesn't assume its caller got
 * that right.
 */
export function playDay(
  day: number,
  schedule: WorldSchedule,
  cursor: number,
  clubs: readonly Club[],
  charts: ReadonlyMap<string, RosterChart>,
  players: ReadonlyMap<string, Player>,
  rates: ReadonlyMap<string, Rates>,
  r: Rng,
): { played: PlayedGame[]; nextCursor: number } {
  const games = schedule.games;
  const played: PlayedGame[] = [];
  let i = cursor;
  while (i < games.length && games[i]![0] < day) i++; // skip anything stranded, matches the original
  while (i < games.length && games[i]![0] === day) {
    const [, hi, ai] = games[i]!;
    const home = clubs[hi]!;
    const away = clubs[ai]!;
    const homeChart = charts.get(home.id);
    const awayChart = charts.get(away.id);
    if (homeChart && awayChart) {
      const env = envFor(home.lvl, home.lg);
      const homeRotIdx = home.gp % Math.max(1, homeChart.rot.length);
      const awayRotIdx = away.gp % Math.max(1, awayChart.rot.length);
      const result = simGame(
        rosterFor(home, homeChart),
        rosterFor(away, awayChart),
        homeRotIdx,
        awayRotIdx,
        players,
        rates,
        env,
        r,
      );
      home.gp++;
      away.gp++;
      home.rs += result.homeRuns;
      home.ra += result.awayRuns;
      away.rs += result.awayRuns;
      away.ra += result.homeRuns;
      const homeWon = result.homeRuns > result.awayRuns;
      if (homeWon) {
        home.w++;
        away.l++;
      } else {
        home.l++;
        away.w++;
      }
      pushForm(home, homeWon);
      pushForm(away, !homeWon);
      played.push({ day, homeClubId: home.id, awayClubId: away.id, result });
    }
    i++;
  }
  return { played, nextCursor: i };
}

/**
 * Plays an entire schedule from day one through its last game, in a
 * single call — the primitive `playDay` above is built from (each call is
 * just `playDay` for the next distinct day present in the schedule). Not
 * a port of anything in the original — `advanceDays()`/`advanceTo()`
 * there are UI-driven, stop-condition-aware wrappers (stop on an injury,
 * a full roster, cash below a floor) that belong to a later, state-wired
 * pass. This is the plain, unconditional "play it all" primitive tests
 * and calibration need now, and the natural building block whatever
 * "simulate to end of season" feature comes later would call in a loop.
 */
export function playSeason(
  schedule: WorldSchedule,
  clubs: readonly Club[],
  charts: ReadonlyMap<string, RosterChart>,
  players: ReadonlyMap<string, Player>,
  rates: ReadonlyMap<string, Rates>,
  r: Rng,
): { played: PlayedGame[] } {
  const played: PlayedGame[] = [];
  let cursor = 0;
  while (cursor < schedule.games.length) {
    const day = schedule.games[cursor]![0];
    const { played: dayPlayed, nextCursor } = playDay(day, schedule, cursor, clubs, charts, players, rates, r);
    played.push(...dayPlayed);
    cursor = nextCursor;
  }
  return { played };
}
