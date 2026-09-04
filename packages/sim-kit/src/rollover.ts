/**
 * Season rollover — the minimal mechanism that lets a save reach a second
 * year at all. Without it, `advanceDay` (`advance.ts`) simply stops once
 * `state.sched` runs out (`seasonOver: true`, tested in `newgame.test.ts`)
 * and nothing else ever happens — the exact dead end RESEARCH.md §8.5
 * describes: "players age and nothing else... it makes a long career
 * impossible."
 *
 * Deliberately NOT a port of `bush-league-v0.10.html`'s own winter cycle
 * (Build 0.9, "THE WINTER" — CHANGELOG.md's own historical entry), and not
 * an attempt to reproduce it. That system is free agency, contract
 * expiration, an age-curve exit, a demand-sized amateur intake, an
 * exclusive re-sign window and a four-month open market — real, sourced,
 * substantial work belonging to its own future pass (ROADMAP.md's "the
 * market"/"the winter cycle"). What this file does instead: age and
 * develop the EXISTING population in place (`development.ts`), reset every
 * club's season record, and generate next year's schedule — the same
 * population, one year older, playing again. No player enters or leaves.
 *
 * That is a real, disclosed simplification with a known consequence,
 * stated plainly rather than discovered the hard way a second time: run
 * this for enough consecutive years with no churn and the whole world
 * converges toward old, same as `bush-league-v0.10.html`'s own v0.9 build
 * found before it built real churn to fix it ("a closed population under
 * an age rule has exactly one destination" — CHANGELOG.md Build 0.9). This
 * file does not solve that; it only stops pretending the game can't reach
 * a second year at all. Retirement isn't modelled either — `development.ts`'s
 * own header explains why (no sourced hazard curve exists to build one
 * from).
 */
import type { Rng } from "./rng.js";
import { fromSerial } from "./date.js";
import { buildFullSeasonSchedule, seasonWindow } from "./schedule.js";
import { developPopulation } from "./development.js";
import type { GameState } from "./state.js";

/**
 * Rolls `state` from the end of one season into the start of the next, in
 * place: every player ages and develops one year, every club's win/loss/
 * runs/form/games-played resets to a fresh season's zero (the same fields
 * `buildWorld()`'s own `makeClub` zeroes for a brand-new world), a new
 * schedule is generated for `year + 1`, and the game clock jumps to 14
 * days before that new season's own opener — the identical convention
 * `newGame()` already establishes for a save's very first day, reused here
 * rather than invented a second time.
 *
 * Callers decide WHEN to call this — typically once `advanceDay`'s own
 * `seasonOver` flag is true — `advanceDay` itself never calls it
 * automatically (a behavioural change to an already-tested contract this
 * file has no reason to make).
 */
export function startNewSeason(state: GameState, r: Rng): void {
  developPopulation(state.players, r);

  for (const c of state.world.clubs) {
    c.w = 0;
    c.l = 0;
    c.rs = 0;
    c.ra = 0;
    c.gp = 0;
    c.l10 = [];
    c.strk = 0;
  }

  const year = state.season.year + 1;
  const schedule = buildFullSeasonSchedule(state.world.clubs, year, r);
  state.sched = schedule.games;
  state.sp = 0;
  state.box = [];

  const mine = state.ownedClubId ? state.world.clubs.find((c) => c.id === state.ownedClubId) : undefined;
  const [open, close] = mine ? seasonWindow(mine, year) : [state.season.open, state.season.close];
  const worldOpen = schedule.games[0]?.[0] ?? open;
  state.season = { ...state.season, year, gp: 0, phase: "offseason", open, close, worldOpen, dates: 0 };
  state.date = fromSerial(Math.min(open, worldOpen) - 14);
}
