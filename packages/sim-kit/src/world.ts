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
 */
import { MLB, MILB, INDY, type MilbLevelKey } from "./world-data.js";
import { abbrFor } from "./names.js";

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
  l10w: number;
  strk: number;
  z: number;
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
): Club {
  return { id, city, name, abbr, lvl, lg, div, park, w: 0, l: 0, rs: 0, ra: 0, l10w: 0, strk: 0, z: 0 };
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
        clubs.push(makeClub(nid(lvlKey), city, "", abbrFor(city, taken), lvlKey, leagueName, leagueName));
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
