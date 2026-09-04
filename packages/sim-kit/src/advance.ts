/**
 * Advances a `GameState` by exactly one calendar day — the state-level
 * wrapper around `season.ts`'s `playDay()`.
 *
 * Deliberately more reproducible than the original, not just ported as-is:
 * the original's own RNG stream (`SIMR`) reseeds from `G.seed` on a NEW
 * game but not on a LOAD, so a reloaded save drifts onto a different
 * future than an unbroken session would have played — a real gap the
 * original never closed (carried forward as engineering debt in this
 * project's own docs). This port closes it structurally instead of
 * inheriting it: each day's games are drawn from a fresh RNG seeded by
 * `(state.seed + that day's serial number)` — mulberry32's own intended
 * use for decorrelated per-item streams from one base seed — so replaying
 * the same day from a save always reproduces the same outcome, with
 * nothing about an RNG's internal counter needing to be part of the save
 * at all.
 *
 * Depth charts and rate profiles are recomputed here every call, not read
 * from a cache on `state` — see `newgame.ts`'s own note on why neither is
 * persisted. Rebuilding both for the whole world costs low milliseconds
 * (`game.test.ts`/`season.test.ts` already do this every test run), cheap
 * next to the game simulation itself.
 */
import { dateToSerial, fromSerial } from "./date.js";
import { mulberry32 } from "./rng.js";
import { chartWorld } from "./roster.js";
import { buildRates } from "./rates.js";
import { playDay, type PlayedGame } from "./season.js";
import type { GameState } from "./state.js";

export interface AdvanceResult {
  /** Every game played across the whole world this day. */
  played: PlayedGame[];
  /** The subset involving the owner's own club, if any. */
  ownedGames: PlayedGame[];
  /** True once the cursor has consumed every game the schedule contains. */
  seasonOver: boolean;
}

/** Caps `state.box` the same way the original capped `G.box` — a display window, not the record of truth (that's each `Club`'s own w/l/rs/ra). */
const BOX_CAP = 400;

/**
 * Mutates `state` in place — `date`/`sp`/`box` here, and (via `playDay`)
 * every played club's `w`/`l`/`rs`/`ra`/`gp`/`l10`/`strk` and every played
 * player's `st` — matching this package's established "accumulates in
 * place, by design" pattern for exactly this kind of season-long state
 * (`game.ts`'s and `season.ts`'s own notes).
 */
export function advanceDay(state: GameState): AdvanceResult {
  const day = dateToSerial(state.date);
  const charts = chartWorld(state.world.clubs, state.players);
  const rates = buildRates(state.players, state.world.clubs);
  const players = new Map(state.players.map((p) => [p.id, p] as const));
  const r = mulberry32((state.seed + day) >>> 0);

  const { played, nextCursor } = playDay(day, { games: state.sched }, state.sp, state.world.clubs, charts, players, rates, r);
  state.sp = nextCursor;
  state.date = fromSerial(day + 1);

  const ownedGames = state.ownedClubId
    ? played.filter((g) => g.homeClubId === state.ownedClubId || g.awayClubId === state.ownedClubId)
    : [];
  if (ownedGames.length) {
    state.box.push(...ownedGames);
    if (state.box.length > BOX_CAP) state.box.splice(0, state.box.length - BOX_CAP);
  }

  return { played, ownedGames, seasonOver: state.sp >= state.sched.length };
}
