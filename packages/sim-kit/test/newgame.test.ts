/**
 * newGame() and advanceDay() — the state-level glue this pass adds on top
 * of an already-verified world/roster/schedule/game/season engine. What's
 * worth testing here is specifically the GLUE: does a fresh state contain
 * a real, playable world; does advancing it actually call the underlying
 * engine and mutate the right things; is a reload (a fresh RNG derived
 * only from state.seed + the current day) reproducible the way the
 * original's own save/load never was.
 */
import { describe, expect, it } from "vitest";
import { newGame } from "../src/newgame.js";
import { advanceDay } from "../src/advance.js";
import { scanNonFinite } from "../src/state.js";
import { auditBooks, cash } from "../src/ledger.js";

describe("newGame", () => {
  it("throws on an unknown club id rather than silently building an empty world", () => {
    expect(() => newGame({ ownedClubId: "not-a-real-club", seed: 1 })).toThrow();
  });

  it("builds a real, complete world with the owned club sized to OWNED_N, not ROSTER_N", () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 42 });
    expect(state.world.clubs.length).toBe(218);
    expect(state.sched.length).toBeGreaterThan(0);
    const mine = state.players.filter((p) => p.cid === "MLB_NYY");
    expect(mine.length).toBe(40); // OWNED_N.MLB
    const someoneElse = state.players.filter((p) => p.cid === "MLB_BOS");
    expect(someoneElse.length).toBe(32); // ROSTER_N.MLB
  });

  it("opens 14 days before the earlier of the owned club's own window or the world's earliest game", () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 7 });
    const earliestDay = state.sched[0]![0];
    expect(state.season.worldOpen).toBe(earliestDay);
    const stateDaySerial = Date.UTC(state.date.y, state.date.m - 1, state.date.d) / 86400000;
    expect(stateDaySerial).toBe(Math.min(state.season.open, state.season.worldOpen) - 14);
  });

  it("seeds the ledger with real opening capital before a single game is played", () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 7 });
    expect(state.ledger.length).toBe(3);
    expect(auditBooks(state.ledger).fails).toEqual([]);
    expect(cash(state.ledger)).toBeGreaterThan(0);
    expect(state.ticketPrice).toBeGreaterThan(0);
    expect(state.payrollBudget).toBeGreaterThan(0);
    const mine = state.world.clubs.find((c) => c.id === "MLB_NYY")!;
    expect(mine.cap).toBeGreaterThan(0);
  });

  it("the same seed produces the same world, roster and schedule", () => {
    const a = newGame({ ownedClubId: "MLB_NYY", seed: 100 });
    const b = newGame({ ownedClubId: "MLB_NYY", seed: 100 });
    expect(a.players.map((p) => p.nm)).toEqual(b.players.map((p) => p.nm));
    expect(a.sched).toEqual(b.sched);
  });

  it("never produces a non-finite number anywhere in the fresh state", () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 55 });
    expect(scanNonFinite(state)).toEqual([]);
  });
});

describe("advanceDay", () => {
  it("plays no games during the 14-day pre-season, then plays real games once it starts", () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 9 });
    const before = { date: { ...state.date }, sp: state.sp };
    const day1 = advanceDay(state);
    expect(day1.played.length).toBe(0); // pre-season — the world hasn't opened yet
    expect(state.sp).toBe(before.sp);
    const beforeSerial = Date.UTC(before.date.y, before.date.m - 1, before.date.d) / 86400000;
    const afterSerial = Date.UTC(state.date.y, state.date.m - 1, state.date.d) / 86400000;
    expect(afterSerial).toBe(beforeSerial + 1);

    let result = day1;
    let guard = 0;
    while (result.played.length === 0 && guard++ < 30) result = advanceDay(state);
    expect(result.played.length).toBeGreaterThan(0);
    expect(state.sp).toBeGreaterThan(before.sp);
    const anyClub = state.world.clubs.find((c) => c.gp > 0);
    expect(anyClub).toBeDefined();
  });

  it("captures the owned club's own games into state.box, capped at 400", () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 11 });
    for (let i = 0; i < 200 && state.sp < state.sched.length; i++) advanceDay(state);
    expect(state.box.length).toBeLessThanOrEqual(400);
    for (const g of state.box) {
      expect(g.homeClubId === "MLB_NYY" || g.awayClubId === "MLB_NYY").toBe(true);
    }
  });

  it("reproduces identically on a fresh 'reload' — the same seed and the same date, not a continuing RNG object", () => {
    // `created` is a real wall-clock timestamp by design (createInitialState's
    // own default is `new Date().toISOString()`) — pinned here so this test
    // isolates simulation determinism, not an unrelated non-determinism this
    // test isn't about.
    const created = "2026-01-01T00:00:00.000Z";
    const a = newGame({ ownedClubId: "MLB_NYY", seed: 21, created });
    advanceDay(a);
    const snapshotAfterOneDay = JSON.parse(JSON.stringify(a));

    // Simulate a save/reload: a brand-new state object built the same way, replayed to the same point.
    const b = newGame({ ownedClubId: "MLB_NYY", seed: 21, created });
    advanceDay(b);

    expect(JSON.parse(JSON.stringify(b))).toEqual(snapshotAfterOneDay);
  });

  it("advancing past the end of the schedule reports seasonOver and stops finding games", () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 33 });
    let seasonOver = false;
    let guard = 0;
    while (!seasonOver && guard++ < 400) {
      seasonOver = advanceDay(state).seasonOver;
    }
    expect(seasonOver).toBe(true);
    expect(state.sp).toBe(state.sched.length);
    const result = advanceDay(state);
    expect(result.played).toEqual([]);
  });
});
