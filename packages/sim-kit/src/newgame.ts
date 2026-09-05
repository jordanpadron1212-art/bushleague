/**
 * Assembles a fresh, playable `GameState` — the point where every system
 * ported so far (world generation, roster construction, the schedule, the
 * money loop) actually meets a save for the first time. Not a direct port
 * of a single original function: `bush-league-v0.10.html`'s own new-game
 * flow is a UI wizard calling several setup functions this rewrite doesn't
 * have as separate pieces. This assembles the same real outcome — generate
 * a world, staff the owner's chosen club up to the bigger `OWNED_N` roster
 * size, schedule the season, open 14 days early with a seeded ledger — in
 * one factory instead.
 *
 * The open-14-days-early rule and `seedOpeningBooks` are reconstructed from
 * this project's own working notes rather than re-verified against the
 * source directly (see `economics.ts`'s own header on why, and
 * DECISIONS.md for this pass) — flagged here too since this is the other
 * place that gap actually bites: without a seeded ledger, the first
 * `postMonth` call would post a real club's payroll and stadium cost
 * against a $0 balance before a single gate ever opens.
 *
 * Depth charts and rate profiles are deliberately NOT part of the
 * returned state — `rates.ts`'s own doc calls `Rates` "a pure cache,
 * deliberately outside G," and the same is true of `RosterChart`. Both
 * are cheap, deterministic functions of `players`/`world.clubs`, so
 * whichever pass loads a save recomputes them instead of persisting a
 * cache that could drift from the data it was computed from.
 */
import { mulberry32 } from "./rng.js";
import { fromSerial, dateToSerial } from "./date.js";
import { buildWorld } from "./world.js";
import { buildRosters } from "./roster.js";
import { buildFullSeasonSchedule, seasonWindow } from "./schedule.js";
import { raiseDraftPolicyAsk, raiseScoutingAsk, raiseTicketAsk } from "./desk.js";
import { econFor, seedOpeningBooks } from "./economics.js";
import type { JournalEntry, JeCounter } from "./ledger.js";
import { createInitialState, type GameState, type CreateStateOptions } from "./state.js";

export interface NewGameOptions extends CreateStateOptions {
  /** Must be the id of a club `buildWorld()` actually generates — validated, not assumed. */
  ownedClubId: string;
  year?: number;
}

export function newGame(opts: NewGameOptions): GameState {
  const base = createInitialState(opts);
  const clubs = buildWorld();
  const mine = clubs.find((c) => c.id === opts.ownedClubId);
  if (!mine) {
    throw new Error(`newGame: "${opts.ownedClubId}" is not a club id this world generated`);
  }

  const r = mulberry32(base.seed);
  const players = buildRosters(clubs, r, opts.ownedClubId);
  const year = opts.year ?? base.season.year;
  const schedule = buildFullSeasonSchedule(clubs, year, r);

  // The owned club's own season window, and the earliest anything in the
  // WHOLE world is scheduled — not necessarily the owned club's own opener
  // (different levels/leagues start on different real dates). The game
  // opens 14 days before whichever of the two comes first, matching how a
  // real front office is already working before its own opening day, on a
  // calendar where the rest of the sport may already be under way.
  const [open, close] = seasonWindow(mine, year);
  const worldOpen = schedule.games[0]?.[0] ?? open;
  const startDay = Math.min(open, worldOpen) - 14;
  const date = fromSerial(startDay);

  const E = econFor(mine);
  mine.cap = E.cap;

  const ledger: JournalEntry[] = [];
  const counter: JeCounter = { value: base.nextJe };
  seedOpeningBooks(ledger, counter, dateToSerial(date), mine, E);

  const state: GameState = {
    ...base,
    date,
    ownedClubId: opts.ownedClubId,
    ticketPrice: E.ticketFace,
    payrollBudget: E.payroll,
    scoutingBudget: E.scouting,
    season: { ...base.season, year, open, close, worldOpen },
    world: { ...base.world, clubs },
    players,
    sched: schedule.games,
    sp: 0,
    ledger,
    nextJe: counter.value,
  };

  // D100: a brand-new save starts with its first questions already on the
  // desk, rather than with an empty desk until the first rollover a year
  // away. Both raise nothing under Notify or Silent, so a player who
  // delegated everything starts with a clean desk, correctly.
  raiseDraftPolicyAsk(state);
  raiseScoutingAsk(state);
  raiseTicketAsk(state);

  return state;
}
