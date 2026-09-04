/**
 * Small derived-data helpers shared across pages — kept out of the pages
 * themselves so Office, Books and (once it's lit) Standings compute the
 * same things the same way, rather than each re-deriving "the owned
 * club's next game" or "division standings" slightly differently.
 */
import type { Club, GameState } from "@bushleague/sim-kit";

export function ownedClub(state: GameState): Club | null {
  if (!state.ownedClubId) return null;
  return state.world.clubs.find((c) => c.id === state.ownedClubId) ?? null;
}

export interface NextGame {
  day: number;
  home: boolean;
  opponent: Club;
}

/** The owned club's next unplayed game, scanning forward from the schedule cursor — `null` once nothing remains for it this season. */
export function nextGameFor(state: GameState, clubId: string): NextGame | null {
  for (let i = state.sp; i < state.sched.length; i++) {
    const [day, hi, ai] = state.sched[i]!;
    const home = state.world.clubs[hi]!;
    const away = state.world.clubs[ai]!;
    if (home.id === clubId) return { day, home: true, opponent: away };
    if (away.id === clubId) return { day, home: false, opponent: home };
  }
  return null;
}

export interface StandingsRow {
  club: Club;
  /** Games back of the pool's leader — 0 for the leader itself. */
  gb: number;
}

/** Every club sharing `club`'s level/league/division, sorted by winning percentage (most wins as the tiebreak), with games-back computed against whoever leads. */
export function divisionStandings(state: GameState, club: Pick<Club, "lvl" | "lg" | "div">): StandingsRow[] {
  const pool = state.world.clubs.filter((c) => c.lvl === club.lvl && c.lg === club.lg && c.div === club.div);
  const ranked = [...pool].sort((a, b) => {
    const gA = a.w + a.l;
    const gB = b.w + b.l;
    const pctA = gA ? a.w / gA : 0;
    const pctB = gB ? b.w / gB : 0;
    return pctB - pctA || b.w - a.w;
  });
  const leader = ranked[0];
  return ranked.map((c) => ({
    club: c,
    gb: leader ? (leader.w - c.w + (c.l - leader.l)) / 2 : 0,
  }));
}
