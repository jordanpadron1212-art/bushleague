/**
 * Assembles a fresh, playable `GameState` — the point where every system
 * ported so far (world generation, roster construction, the schedule)
 * actually meets a save for the first time. Not a direct port of anything
 * in the original: `bush-league-v0.10.html`'s own new-game flow is spread
 * across a UI wizard and several setup functions this rewrite hasn't
 * built yet. This is the minimal, honest equivalent — generate a world,
 * staff the owner's chosen club up to the bigger `OWNED_N` roster size,
 * schedule the season, done.
 *
 * Depth charts and rate profiles are deliberately NOT part of the
 * returned state — `rates.ts`'s own doc calls `Rates` "a pure cache,
 * deliberately outside G," and the same is true of `RosterChart`. Both
 * are cheap, deterministic functions of `players`/`world.clubs`, so
 * whichever pass loads a save recomputes them instead of persisting a
 * cache that could drift from the data it was computed from.
 */
import { mulberry32 } from "./rng.js";
import { fromSerial } from "./date.js";
import { buildWorld } from "./world.js";
import { buildRosters } from "./roster.js";
import { buildFullSeasonSchedule } from "./schedule.js";
import { createInitialState, type GameState, type CreateStateOptions } from "./state.js";

export interface NewGameOptions extends CreateStateOptions {
  /** Must be the id of a club `buildWorld()` actually generates — validated, not assumed. */
  ownedClubId: string;
  year?: number;
}

export function newGame(opts: NewGameOptions): GameState {
  const base = createInitialState(opts);
  const clubs = buildWorld();
  if (!clubs.some((c) => c.id === opts.ownedClubId)) {
    throw new Error(`newGame: "${opts.ownedClubId}" is not a club id this world generated`);
  }

  const r = mulberry32(base.seed);
  const players = buildRosters(clubs, r, opts.ownedClubId);
  const year = opts.year ?? base.season.year;
  const schedule = buildFullSeasonSchedule(clubs, year, r);

  // Opens on the earliest day anything in the world is scheduled — not
  // necessarily the owned club's own opener (different levels/leagues
  // start on different real dates), matching how the rest of the sport
  // is already underway on the day a real season begins for any one club.
  const openDay = schedule.games[0]?.[0];
  const date = openDay !== undefined ? fromSerial(openDay) : base.date;

  return {
    ...base,
    date,
    ownedClubId: opts.ownedClubId,
    season: { ...base.season, year },
    world: { ...base.world, clubs },
    players,
    sched: schedule.games,
    sp: 0,
  };
}
