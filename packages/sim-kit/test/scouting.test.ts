/**
 * Verification for `scouting.ts`'s new pieces this pass (DECISIONS.md D90):
 * `scoutBoostFor` and `refineScout`'s optional `scoutBoost` term. The
 * pre-existing sample-size-driven half of `refineScout` (D24) is untouched
 * and already covered by every other module's own tests that call it
 * (`roster.test.ts`, `churn.test.ts`) — this file is scoped to the new
 * behavior only.
 */
import { describe, expect, it } from "vitest";
import { mulberry32 } from "../src/rng.js";
import { LVL } from "../src/levels.js";
import { makePlayer } from "../src/player.js";
import { refineScout, scoutBoostFor } from "../src/scouting.js";
import { newGame } from "../src/newgame.js";
import { advanceDay } from "../src/advance.js";
import { balance } from "../src/ledger.js";

describe("scoutBoostFor", () => {
  it("is zero at zero spend and at a non-positive baseline", () => {
    expect(scoutBoostFor(0, 10000)).toBe(0);
    expect(scoutBoostFor(5000, 0)).toBe(0);
    expect(scoutBoostFor(5000, -1)).toBe(0);
  });

  it("rises monotonically with spend and saturates at the documented max (0.12) by 2x baseline", () => {
    const baseline = 10000;
    const half = scoutBoostFor(baseline * 0.5, baseline);
    const at1x = scoutBoostFor(baseline, baseline);
    const at2x = scoutBoostFor(baseline * 2, baseline);
    const at10x = scoutBoostFor(baseline * 10, baseline);
    expect(half).toBeGreaterThan(0);
    expect(at1x).toBeGreaterThan(half);
    expect(at2x).toBeGreaterThan(at1x);
    expect(at2x).toBeCloseTo(0.12, 5);
    expect(at10x).toBeCloseTo(0.12, 5); // saturated, never exceeds the max past 2x
  });
});

describe("refineScout — the new scoutBoost term", () => {
  const r = mulberry32(777);

  it("defaults to 0 boost, unchanged from every existing call site's behavior", () => {
    const p = makePlayer(r, LVL.AAA, "B", 24);
    p.st["pa"] = 200;
    refineScout(p);
    const relNoArg = p.rel;
    p.rel = 0.2; // reset, then call again explicitly passing 0
    refineScout(p, {}, 0);
    expect(p.rel).toBe(relNoArg);
  });

  it("a real scouting spend measurably raises reliability for the SAME player and sample size, and stays within [0.15, 0.93]", () => {
    const p = makePlayer(r, LVL.AAA, "B", 24);
    p.st["pa"] = 150; // a partial season — mid-range of the sample curve, where a boost is easiest to see

    refineScout(p, {}, 0);
    const relUnscouted = p.rel;

    refineScout(p, {}, scoutBoostFor(20000, 10000)); // 2x baseline — saturated boost
    const relScouted = p.rel;

    expect(relScouted).toBeGreaterThan(relUnscouted);
    expect(relScouted - relUnscouted).toBeCloseTo(0.12, 2); // the full, saturated boost, before any ceiling clamp bites
    expect(relScouted).toBeGreaterThanOrEqual(0.15);
    expect(relScouted).toBeLessThanOrEqual(0.93);
  });

  it("never lets spend buy past the existing [0.15, 0.93] reliability ceiling — clarity, not certainty", () => {
    // A veteran with a huge sample already sits near the 0.93 ceiling
    // (D24) on its own; the maximum possible boost must not push past it.
    const p = makePlayer(r, LVL.MLB, "B", 32);
    p.st["pa"] = 5000;
    refineScout(p, {}, 0.12);
    expect(p.rel).toBeLessThanOrEqual(0.93);
  });

  it("a rookie with almost no sample is still read with real uncertainty even at a saturated boost", () => {
    const p = makePlayer(r, LVL.A, "P", 19);
    p.st["outs"] = 3; // one inning pitched
    refineScout(p, {}, 0.12);
    // Even the maximum boost on top of the sample-floor (~0.18 + age term)
    // stays well short of full confidence — spend narrows the noise, it
    // doesn't erase it.
    expect(p.rel).toBeLessThan(0.5);
  });

  it("recomputing with the same boost twice is idempotent (deterministic, not drifting)", () => {
    const p = makePlayer(r, LVL.AA, "B", 26);
    p.st["pa"] = 300;
    refineScout(p, {}, 0.06);
    const rel1 = p.rel;
    const ovr1 = p.ovr;
    refineScout(p, {}, 0.06);
    expect(p.rel).toBe(rel1);
    expect(p.ovr).toBe(ovr1);
  });
});

describe("scouting — wired end to end through advanceDay (DECISIONS.md D90)", () => {
  it("posts a real monthly cost to account 5300, and DOESN'T touch any other club's reliability", () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 21, year: 2026 });
    expect(state.scoutingBudget).toBeGreaterThan(0);
    // Every player already gets ONE `refineScout` call at world-construction
    // time (`roster.ts`'s `buildRosters`, unrelated to this pass), so a
    // non-owned club's `p.rel` is NOT still `makePlayer`'s raw 0.2 default —
    // the real claim this test checks is that it stays FROZEN at whatever
    // that one construction-time call set it to, since this pass's own
    // monthly recompute loop (`advance.ts`) only ever touches `mine.id`.
    const relBefore = new Map(
      state.players.filter((p) => p.cid !== "MLB_NYY").map((p) => [p.id, p.rel] as const),
    );
    for (let i = 0; i < 60; i++) advanceDay(state);
    expect(balance(state.ledger, 5300)).toBeGreaterThan(0); // an expense (type "X") account's raw ledger balance is positive — the same debit-normal convention every other `postMonth` expense line already posts under
    for (const p of state.players) {
      if (p.cid === "MLB_NYY") continue;
      expect(p.rel).toBe(relBefore.get(p.id));
    }
  });

  it("a real season of accumulated PAs actually reaches p.rel now — the dead half of D24 this pass fixes", () => {
    // Before this pass, `refineScout` was only ever called once, at roster
    // construction, when every player's `p.st` was still empty — so D24's
    // whole sample-size mechanism was live in the FORMULA but never
    // actually re-read after a player started accumulating a real season.
    // This is the direct proof that's fixed: an owned player's reliability
    // is measurably higher after a season of games than it was on day one.
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 22, year: 2026 });
    const mine = state.players.filter((p) => p.cid === "MLB_NYY");
    const relBefore = new Map(mine.map((p) => [p.id, p.rel] as const));
    for (let i = 0; i < 200; i++) advanceDay(state);
    const after = state.players.filter((p) => p.cid === "MLB_NYY");
    const withSample = after.filter((p) => (p.st["pa"] ?? p.st["outs"] ?? 0) > 20);
    expect(withSample.length).toBeGreaterThan(0);
    const improved = withSample.filter((p) => p.rel > (relBefore.get(p.id) ?? 0));
    expect(improved.length).toBeGreaterThan(0);
  }, 20000);

  it("a bigger scouting budget raises the owned roster's AVERAGE reliability — not asserted per-player, a real discovered reason why", () => {
    // NOT a per-player monotonic guarantee, and that's a real finding from
    // writing this test, not a weaker assertion for convenience:
    // `roster.ts`'s `chartClub` sorts by `p.ovr` (the SCOUTED overall) to
    // build every lineup/rotation, and `chartWorld` recomputes it fresh
    // from CURRENT `state.players` every single `advanceDay` call. A boost
    // shrinks `estOf`'s noise band (`scouting.ts`), which moves `p.ovr`
    // toward its true-grade value sooner — so a scouted club's depth chart
    // reflects real talent more accurately, earlier in the season, than an
    // unscouted club's. That's the intended effect (`FRONT-OFFICE-DESIGN-
    // PROPOSAL.md` §3: "how fast a prospect's true grade becomes visible"),
    // but it means WHO ACTUALLY PLAYS can differ between an otherwise-
    // identical scouted and unscouted state, which decouples any one
    // player's own accumulated PA/IP sample between the two runs — a
    // strictly-per-player comparison is comparing two different seasons by
    // that point, not the same season with one extra input. The ROBUST,
    // population-level claim — average reliability across the whole roster
    // is higher with real spend than with none — still holds and is what's
    // checked here.
    const seed = 23;
    const unscouted = newGame({ ownedClubId: "MLB_NYY", seed, year: 2026 });
    unscouted.scoutingBudget = 0;
    const scouted = newGame({ ownedClubId: "MLB_NYY", seed, year: 2026 });
    scouted.scoutingBudget = scouted.scoutingBudget * 3; // comfortably past the 2x-baseline saturation point

    for (let i = 0; i < 90; i++) {
      advanceDay(unscouted);
      advanceDay(scouted);
    }

    const avgRel = (s: typeof unscouted): number => {
      const mine = s.players.filter((p) => p.cid === "MLB_NYY");
      return mine.reduce((t, p) => t + p.rel, 0) / mine.length;
    };
    expect(avgRel(scouted)).toBeGreaterThan(avgRel(unscouted));
  });
});
