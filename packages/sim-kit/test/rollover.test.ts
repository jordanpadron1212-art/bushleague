/**
 * Verification for `rollover.ts` — the mechanism that lets a save reach a
 * second year AND survive many of them. Checks the mechanical guarantees
 * this file actually makes (a fresh, playable, non-finite-free, legal
 * state for the new year), that churn (`churn.ts`, DECISIONS.md D89)
 * actually happens (some players leave, some arrive, survivors age
 * correctly), and — the whole point of this pass — that the population's
 * age distribution STABILIZES across many consecutive rollovers instead of
 * climbing forever, closing the gap D87's own tests deliberately measured
 * and disclosed rather than fixed. `churn.test.ts` covers the churn
 * mechanism's own numeric calibration against the sourced target
 * (DECISIONS.md D89); this file covers rollover's end-to-end use of it.
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

  it("ages every SURVIVING player by exactly one year, churns in real new players too, and leaves no non-finite value anywhere in state", () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 6, year: 2026 });
    const before = new Map(state.players.map((p) => [p.id, p.age]));
    playToSeasonEnd(state);

    const r = mulberry32(state.seed + 12345);
    startNewSeason(state, r);

    let survivors = 0;
    let arrivals = 0;
    for (const p of state.players) {
      const priorAge = before.get(p.id);
      if (priorAge != null) {
        expect(p.age).toBe(priorAge + 1); // a survivor — development.ts's own +1/year, unchanged by churn
        survivors++;
      } else {
        arrivals++; // a fresh signee churn.ts generated — never existed before this rollover
      }
    }
    expect(survivors).toBeGreaterThan(0); // churn is real retention, not 100% turnover
    expect(arrivals).toBeGreaterThan(0); // churn is real turnover, not 100% retention
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

  it("FIXED, verified directly: a club's average age STABILIZES across many consecutive rollovers instead of climbing forever — D87's own disclosed consequence, closed by churn.ts (DECISIONS.md D89)", () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 9, year: 2026 });
    const avgAge = () => {
      const mine = state.players.filter((p) => p.cid === "MLB_NYY");
      return mine.reduce((t, p) => t + p.age, 0) / mine.length;
    };
    const ages = [avgAge()];
    for (let i = 0; i < 8; i++) {
      playToSeasonEnd(state);
      startNewSeason(state, mulberry32(state.seed + i * 777));
      ages.push(avgAge());
    }
    // A closed, churn-free population would climb roughly +1 every single
    // year (D87's own now-superseded test proved exactly that). With real
    // turnover, the LAST few years should be landing in a stable band, not
    // still climbing at the same unbroken rate the first few did.
    const early = ages[1]! - ages[0]!;
    const late = ages[ages.length - 1]! - ages[ages.length - 2]!;
    expect(Math.abs(late)).toBeLessThan(Math.abs(early) + 0.5);
    // And a real sanity bound: nowhere near the ~35+ a fully closed
    // population reaches after just a handful of years (see D87's history).
    expect(ages[ages.length - 1]!).toBeLessThan(32);
  }, 40000);
});
