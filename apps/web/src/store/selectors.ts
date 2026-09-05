/**
 * Small derived-data helpers shared across pages — kept out of the pages
 * themselves so Office, Books and (once it's lit) Standings compute the
 * same things the same way, rather than each re-deriving "the owned
 * club's next game" or "division standings" slightly differently.
 */
import type { Player, Club, GameState } from "@bushleague/sim-kit";

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

/**
 * Every club in the owner's organization, MLB first then down the ladder
 * (`DECISIONS.md` D96: you own the whole org, and it is a REPORTING context
 * — not five rosters you hand-edit). An independent club simply has no
 * affiliates, so the same shape degrades to one club with nothing
 * special-cased.
 */
export function orgClubs(state: GameState): Club[] {
  const mine = ownedClub(state);
  if (!mine) return [];
  const order = ["MLB", "AAA", "AA", "HIA", "A", "INDY"];
  return state.world.clubs
    .filter((c) => c.id === mine.id || c.parent === mine.id)
    .sort((a, b) => order.indexOf(a.lvl) - order.indexOf(b.lvl));
}

/** Everyone on one club, pitchers first then batters, best scouted grade first within each. */
export function rosterOf(state: GameState, clubId: string): Player[] {
  return state.players
    .filter((p) => p.cid === clubId)
    .sort((a, b) => {
      if (a.role !== b.role) return a.role === "P" ? -1 : 1;
      return b.ovr - a.ovr;
    });
}

/**
 * Every division in one league, in a stable order, each already ranked by
 * `divisionStandings`. Standings needs the whole league, not just the
 * owner's own division, and deriving it here keeps the ordering identical
 * to the row the Office panel already shows.
 */
export function leagueDivisions(
  state: GameState,
  club: Pick<Club, "lvl" | "lg">,
  /** The owner's own division is listed FIRST — it is the one they came to read. */
  first?: string,
): { div: string; rows: StandingsRow[] }[] {
  const divs = [...new Set(state.world.clubs.filter((c) => c.lvl === club.lvl && c.lg === club.lg).map((c) => c.div))].sort();
  if (first && divs.includes(first)) divs.sort((a, b) => (a === first ? -1 : b === first ? 1 : 0));
  return divs.map((div) => ({ div, rows: divisionStandings(state, { ...club, div }) }));
}

/**
 * Expected wins from run differential — what MLB.com's own standings page
 * labels "X-W/L" (RESEARCH.md's read of it, §286, which also records that
 * they label run differential DIFF).
 *
 * DISCLOSURE: `rs`/`ra` are real, accumulated by the sim. The EXPONENT is
 * not a figure this project has sourced — 1.83 is the widely-used
 * sabermetric refinement of the original squared form, and it is used here
 * as a DISPLAY derivation only. It touches no engine path, no RNG draw and
 * no ledger entry; changing it would move a number on this one screen and
 * nothing else. Recorded rather than smuggled.
 */
export const PYTH_EXPONENT = 1.83;

export function expectedWins(rs: number, ra: number, games: number): number | null {
  if (!(games > 0) || !(rs > 0 && ra > 0)) return null;
  const share = Math.pow(rs, PYTH_EXPONENT) / (Math.pow(rs, PYTH_EXPONENT) + Math.pow(ra, PYTH_EXPONENT));
  return share * games;
}
