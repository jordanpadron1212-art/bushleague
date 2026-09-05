/**
 * Verification for owner-set ticket pricing (DECISIONS.md D101,
 * RESEARCH.md §25).
 *
 * The load-bearing test here is not "attendance falls when price rises" —
 * that is true of any downward-sloping demand curve and proves nothing
 * about whether the model is right. It is the SHAPE: that total revenue has
 * an interior optimum slightly below the face price, and that chasing gate
 * revenue alone leads the owner somewhere materially worse. That shape is
 * the published inelastic-pricing finding, and a model that lost it would
 * still pass every naive assertion.
 */
import { describe, expect, it } from "vitest";
import { newGame } from "../src/newgame.js";
import { advanceDay } from "../src/advance.js";
import { incomeStatement } from "../src/ledger.js";
import {
  PRICE_ELASTICITY,
  PRICE_MAX_RATIO,
  PRICE_MIN_RATIO,
  econFor,
  gateFor,
  priceDemand,
} from "../src/economics.js";
import { mulberry32 } from "../src/rng.js";
import type { GameState } from "../src/state.js";

const FACE = 41; // MLB, ECON.MLB.ticketFace

function seasonAt(ratio: number): { perFan: number; gate: number; net: number } {
  const s: GameState = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
  s.ticketPrice = Math.round(FACE * ratio);
  let g = 0;
  while (g++ < 400) if (advanceDay(s).seasonOver) break;
  const is = incomeStatement(s.ledger);
  const pick = (a: number) => is.rev.find(([acc]) => acc === a)?.[1] ?? 0;
  return { gate: pick(4000), perFan: pick(4000) + pick(4100) + pick(4300) + pick(4600), net: is.net };
}

describe("priceDemand — the curve itself", () => {
  it("is exactly 1 at the face price, whatever the face is", () => {
    for (const face of [8, 13, 41]) expect(priceDemand(face, face)).toBeCloseTo(1, 10);
  });

  it("has the SOURCED elasticity at the face price, measured rather than asserted", () => {
    // ε = -(dA/dp)(p/A). Measured numerically at p = face, where A = 1.
    const h = 0.001;
    const slope = (priceDemand(FACE * (1 + h), FACE) - priceDemand(FACE * (1 - h), FACE)) / (2 * h);
    expect(-slope).toBeCloseTo(PRICE_ELASTICITY, 6);
  });

  it("falls as price rises and rises as it falls, monotonically", () => {
    const pts = [0.5, 0.7, 0.9, 1.0, 1.1, 1.5, 2.0].map((x) => priceDemand(FACE * x, FACE));
    for (let i = 1; i < pts.length; i++) expect(pts[i]!).toBeLessThan(pts[i - 1]!);
  });

  it("clamps outside the range the research covers, instead of extrapolating", () => {
    expect(priceDemand(FACE * 0.1, FACE)).toBe(priceDemand(FACE * PRICE_MIN_RATIO, FACE));
    expect(priceDemand(FACE * 99, FACE)).toBe(priceDemand(FACE * PRICE_MAX_RATIO, FACE));
    expect(priceDemand(FACE * PRICE_MAX_RATIO, FACE)).toBeGreaterThanOrEqual(0);
  });

  it("degrades safely on nonsense input rather than producing a NaN attendance", () => {
    expect(priceDemand(41, 0)).toBe(1);
    expect(Number.isFinite(priceDemand(NaN, FACE))).toBe(true);
  });
});

describe("gateFor — pricing is opt-in, so nothing that existed before moved", () => {
  it("is byte-identical when no price is supplied — every calibration test measures what it always did", () => {
    const club = { lvl: "MLB", lg: "AL", w: 40, l: 40, cap: 41000 } as const;
    for (const seed of [1, 7, 99]) {
      expect(gateFor(club, mulberry32(seed))).toBe(gateFor(club, mulberry32(seed), undefined));
    }
  });

  it("is also identical when the price IS the face price", () => {
    const club = { lvl: "MLB", lg: "AL", w: 40, l: 40, cap: 41000 } as const;
    for (const seed of [1, 7, 99]) {
      expect(gateFor(club, mulberry32(seed), 0.5, FACE, FACE)).toBe(gateFor(club, mulberry32(seed), 0.5));
    }
  });
});

describe("a real season — the shape is the finding", () => {
  /**
   * Measured across full simulated seasons, not computed from the formula,
   * so this fails if any part of the chain (gateDay, advanceDay, the ledger)
   * stops carrying the price through.
   */
  const RATIOS = [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.4, 1.6, 2.0];
  const runs = new Map<number, ReturnType<typeof seasonAt>>();
  for (const x of RATIOS) runs.set(x, null as never);

  it("total attendance-driven revenue peaks BELOW the face price", () => {
    for (const x of RATIOS) if (!runs.get(x)) runs.set(x, seasonAt(x));
    let best = RATIOS[0]!;
    for (const x of RATIOS) if (runs.get(x)!.perFan > runs.get(best)!.perFan) best = x;
    // RESEARCH.md §25 predicts 0.9 from the per-fan split; allow the
    // neighbouring sample in case a seed's noise moves it one step.
    expect(best).toBeGreaterThanOrEqual(0.8);
    expect(best).toBeLessThanOrEqual(1.0);
  }, 900_000);

  it("but GATE revenue alone peaks well above it — the trap the puzzle describes", () => {
    for (const x of RATIOS) if (!runs.get(x)) runs.set(x, seasonAt(x));
    let bestGate = RATIOS[0]!;
    for (const x of RATIOS) if (runs.get(x)!.gate > runs.get(bestGate)!.gate) bestGate = x;
    // An owner optimising the ticket line alone is led somewhere materially
    // worse than an owner optimising the club.
    expect(bestGate).toBeGreaterThan(1.1);

    let bestNet = RATIOS[0]!;
    for (const x of RATIOS) if (runs.get(x)!.net > runs.get(bestNet)!.net) bestNet = x;
    expect(bestNet).toBeLessThan(bestGate);
    // And the cost of following the wrong metric is real money, not a rounding error.
    expect(runs.get(bestNet)!.net - runs.get(bestGate)!.net).toBeGreaterThan(5_000_000);
  }, 900_000);

  it("the default face price is close to optimal — a new owner is not punished for not touching it", () => {
    for (const x of RATIOS) if (!runs.get(x)) runs.set(x, seasonAt(x));
    let bestNet = RATIOS[0]!;
    for (const x of RATIOS) if (runs.get(x)!.net > runs.get(bestNet)!.net) bestNet = x;
    const gap = runs.get(bestNet)!.net - runs.get(1.0)!.net;
    expect(gap).toBeGreaterThanOrEqual(0);
    // Within a couple of percent: a real but small edge for paying attention.
    expect(gap / Math.abs(runs.get(1.0)!.net)).toBeLessThan(0.05);
  }, 900_000);

  it("doubling the price is a genuine mistake, not merely suboptimal", () => {
    for (const x of RATIOS) if (!runs.get(x)) runs.set(x, seasonAt(x));
    expect(runs.get(2.0)!.net).toBeLessThan(runs.get(1.0)!.net);
    expect(runs.get(2.0)!.perFan).toBeLessThan(runs.get(1.0)!.perFan * 0.7);
  }, 900_000);
});
