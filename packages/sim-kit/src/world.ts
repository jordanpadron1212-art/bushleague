/**
 * World generation — ported from bush-league-v0.10.html's `makeClub()`/
 * `buildWorld()`. Assembles the real MLB/MiLB/independent-league structure
 * (`world-data.ts`) into `Club` records with unique ids and abbreviations.
 *
 * Adaptation, noted rather than silent: club ids are a global counter in
 * the original (`nid = pfx => pfx+"_"+(++SEQ)`), scoped to one `buildWorld`
 * call via a closure over module state. This port takes the same shape but
 * keeps the counter local to each call (a plain closure returned by
 * `buildWorld`, not a module-level mutable), so generating two worlds in
 * the same process — e.g. two tests in the same file — can't leak a
 * counter between them. DECISIONS.md D28 requires ids to be globally
 * unique within ONE world; nothing in that decision requires the counter
 * to survive across separate worlds, and a module-level counter that does
 * survive is a subtler bug waiting to happen in a test suite.
 *
 * Second adaptation, found while porting the season-play driver
 * (`season.ts`, DECISIONS.md D84): the original club object's `l10w` field
 * is a NUMBER, written once at creation and never read again anywhere in
 * the 5800-line source (confirmed by grep) — the real last-10-games window
 * is a separate array, `c.l10`, that `pushForm()` actually maintains, with
 * the win count derived on read via `.reduce()`. Not ported forward as
 * dead weight: this port's `Club.l10` IS that real array. `gp` (games
 * played this season — what the season driver uses to pick a rotation
 * slot) is a genuine addition; the original set it only at a season-reset
 * function this port doesn't have yet, not at club creation, but a fresh
 * world needs it initialized regardless. `z` is left alone — also unread
 * anywhere in the original, but untouched here since nothing in this pass
 * needs to touch it.
 *
 * Third adaptation, found while porting the economics pass (`economics.ts`,
 * DECISIONS.md D86): the original sets `c.cap` (stadium capacity) in a
 * separate `forEach` bolted onto the new-game flow, AFTER `buildWorld()`
 * returns — meaning any other caller of `buildWorld()` (a test, a future
 * tool) gets clubs with no capacity unless it remembers to run that pass
 * too. `cap` is a real structural property of a club, not an owner setting
 * (the owned club's own capacity IS overridden later, in `newgame.ts`, same
 * as the original's `mine.cap=E.cap`) — so this port computes it once, here,
 * for every club, via `attFor(lvl, lg) * 1.55` (RESEARCH.md's own
 * capacity-to-average-attendance ratio), so a club is never capacity-less.
 */
import { MLB, MILB, MILB_PARENT, INDY, type MilbLevelKey } from "./world-data.js";
import { abbrFor } from "./names.js";
import { attFor } from "./economics.js";

export interface Club {
  id: string;
  city: string;
  name: string;
  abbr: string;
  lvl: MilbLevelKey | "MLB" | "INDY";
  lg: string;
  div: string;
  park: string;
  w: number;
  l: number;
  rs: number;
  ra: number;
  /** Games played this season — drives `simGame`'s rotation-slot index (`gp % rot.length`). */
  gp: number;
  /** Rolling window of the last 10 decisions, oldest first, 1=win/0=loss — see `clubFormRecord` in `season.ts`. */
  l10: number[];
  strk: number;
  z: number;
  /** Stadium capacity — `gateFor`'s ceiling. Overridden for the owned club in `newgame.ts`. */
  cap: number;
  /** The owning MLB club's id (`MLB_<abbr>`) — real, sourced data (RESEARCH.md §2.6, DECISIONS.md D91), set for MiLB clubs only. `undefined` for MLB/INDY clubs (no parent of their own) AND for the one disclosed MiLB city (`world-data.ts`'s `MILB_PARENT`, "Hill City") this pass could not source a real parent for. */
  parent?: string;
}

export function makeClub(
  id: string,
  city: string,
  name: string,
  abbr: string,
  lvl: Club["lvl"],
  lg: string,
  div: string,
  park = "",
  parent?: string,
): Club {
  const cap = Math.round(attFor(lvl, lg) * 1.55);
  return { id, city, name, abbr, lvl, lg, div, park, w: 0, l: 0, rs: 0, ra: 0, gp: 0, l10: [], strk: 0, z: 0, cap, ...(parent ? { parent } : {}) };
}

export function buildWorld(): Club[] {
  const clubs: Club[] = [];
  // Abbreviation registry, scoped per (level|league) pool — matches the
  // original's `taken[k]=taken[k]||{}` so "Sioux City"/"Sioux Falls" can
  // both be SIO in different leagues without colliding, but never within
  // the same one (DECISIONS.md's Law 14 catalogue entry).
  const pools = new Map<string, Record<string, 1>>();
  const pool = (key: string): Record<string, 1> => {
    let p = pools.get(key);
    if (!p) {
      p = {};
      pools.set(key, p);
    }
    return p;
  };

  // Club ids are a GLOBAL counter, not a slug (DECISIONS.md D28) — slugging
  // the division name collided in the Frontier League ("Atlantic East" and
  // "Atlantic North" both truncate to ATL), giving two clubs the same
  // identity.
  let seq = 0;
  const nid = (prefix: string): string => `${prefix}_${++seq}`;

  const mlbTaken = pool("MLB");
  for (const [abbr, city, name, league, division, park] of MLB) {
    mlbTaken[abbr] = 1;
    clubs.push(makeClub(`MLB_${abbr}`, city, name, abbr, "MLB", league, division, park));
  }

  for (const lvlKey of Object.keys(MILB) as MilbLevelKey[]) {
    for (const [leagueName, cities] of MILB[lvlKey].leagues) {
      const taken = pool(`${lvlKey}|${leagueName}`);
      for (const city of cities) {
        const parentAbbr = MILB_PARENT[`${lvlKey}:${city}`];
        const parent = parentAbbr ? `MLB_${parentAbbr}` : undefined;
        clubs.push(makeClub(nid(lvlKey), city, "", abbrFor(city, taken), lvlKey, leagueName, leagueName, "", parent));
      }
    }
  }

  for (const league of INDY) {
    const taken = pool(`INDY|${league.name}`);
    for (const [divName, cities] of league.divs) {
      for (const city of cities) {
        clubs.push(makeClub(nid(`INDY_${league.id}`), city, "", abbrFor(city, taken), "INDY", league.name, divName));
      }
    }
  }

  return clubs;
}
