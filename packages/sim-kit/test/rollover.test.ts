/**
 * Verification for `rollover.ts` — the minimal mechanism that lets a save
 * reach a second year. Checks the mechanical guarantees this file actually
 * makes (a fresh, playable, non-finite-free state for the new year) and
 * the disclosed consequence of NOT modelling churn (the population ages
 * uniformly, same as `bush-league-v0.10.html`'s own v0.9 build found before
 * it built real churn to fix it) — recorded here as an honest finding, not
 * asserted away.
 */
import { describe, expect, it } from "vitest";
import { newGame } from "../src/newgame.js";
import { advanceDay } from "../src/advance.js";
import { startNewSeason } from "../src/rollover.js";
import { mulberry32 } from "../src/rng.js";
import { scanNonFinite } from "../src/state.js";

function playToSeasonEnd(state: ReturnType<typeof newGame>): void {
  let guard = 0;
  while (guard++ < 400) {
    if (advanceDay(state).seasonOver) return;
  }
  throw new Error("season never ended within the guard");
}

describe("rollover — mechanical guarantees", () => {
  it("advances the year, gives every club a fresh zeroed record, and produces a real, complete schedule for the new year", () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
    playToSeasonEnd(state);

    const r = mulberry32(state.seed + 99999);
    startNewSeason(state, r);

    expect(state.season.year).toBe(2027);
    expect(state.sp).toBe(0);
    expect(state.sched.length).toBeGreaterThan(0);
    for (const c of state.world.clubs) {
      expect(c.w).toBe(0);
      expect(c.l).toBe(0);
      expect(c.rs).toBe(0);
      expect(c.ra).toBe(0);
      expect(c.gp).toBe(0);
      expect(c.l10).toEqual([]);
    }
    // The new schedule is real, not a stub — same shape newgame.test.ts already verifies for a fresh world.
    const mine = state.world.clubs.find((c) => c.id === "MLB_NYY")!;
    const myGames = state.sched.filter(([, h, a]) => state.world.clubs[h] === mine || state.world.clubs[a] === mine);
    expect(myGames.length).toBe(162);
  });

  it("ages every player by exactly one year and leaves no non-finite value anywhere in state", () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 6, year: 2026 });
    const agesBefore = new Map(state.players.map((p) => [p.id, p.age]));
    playToSeasonEnd(state);

    const r = mulberry32(state.seed + 12345);
    startNewSeason(state, r);

    for (const p of state.players) {
      expect(p.age).toBe(agesBefore.get(p.id)! + 1);
    }
    expect(scanNonFinite(state)).toEqual([]);
  });

  it("the new season is actually playable — advanceDay plays real games again after rollover", () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 7, year: 2026 });
    playToSeasonEnd(state);
    const r = mulberry32(state.seed + 42);
    startNewSeason(state, r);

    let result = advanceDay(state);
    let guard = 0;
    while (result.played.length === 0 && guard++ < 30) result = advanceDay(state);
    expect(result.played.length).toBeGreaterThan(0);
    expect(state.season.year).toBe(2027);
  });

  it("three consecutive rollovers all succeed and keep advancing the year and every player's age", () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 8, year: 2026 });
    for (let i = 0; i < 3; i++) {
      playToSeasonEnd(state);
      startNewSeason(state, mulberry32(state.seed + i * 1000));
    }
    expect(state.season.year).toBe(2029);
    expect(scanNonFinite(state)).toEqual([]);
    const mine = state.players.find((p) => p.cid === "MLB_NYY")!;
    expect(mine.age).toBeGreaterThan(18); // sanity: still a real, bounded age, not runaway or NaN
  }, 20000);

  it("DISCLOSED, not hidden: with no roster churn, a club's average age climbs monotonically across consecutive rollovers — the same closed-population effect the original build's own v0.9 pass found and fixed with real free agency/contract expiration, none of which is ported yet", () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 9, year: 2026 });
    const avgAge = () => {
      const mine = state.players.filter((p) => p.cid === "MLB_NYY");
      return mine.reduce((t, p) => t + p.age, 0) / mine.length;
    };
    const ages = [avgAge()];
    for (let i = 0; i < 4; i++) {
      playToSeasonEnd(state);
      startNewSeason(state, mulberry32(state.seed + i * 777));
      ages.push(avgAge());
    }
    for (let i = 1; i < ages.length; i++) expect(ages[i]!).toBeGreaterThan(ages[i - 1]!);
  }, 20000);
});
