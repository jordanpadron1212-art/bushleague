/**
 * DECISIONS.md D72: "an unseeded harness cannot be debugged." The same seed
 * must produce the same sequence, every time, on every machine — that's the
 * whole point of storing the seed instead of the RNG state.
 */
import { describe, expect, it } from "vitest";
import { mulberry32, gauss, pick } from "../src/rng.js";

describe("mulberry32", () => {
  it("is deterministic: the same seed produces the same sequence", () => {
    const a = mulberry32(12345);
    const b = mulberry32(12345);
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it("different seeds diverge", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toBeCloseTo(b(), 6);
  });

  it("stays within [0, 1)", () => {
    const r = mulberry32(999);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("gauss", () => {
  it("produces a roughly standard-normal distribution over a large sample", () => {
    const r = mulberry32(42);
    const samples = Array.from({ length: 20_000 }, () => gauss(r));
    const mean = samples.reduce((t, v) => t + v, 0) / samples.length;
    const variance = samples.reduce((t, v) => t + (v - mean) ** 2, 0) / samples.length;
    expect(mean).toBeCloseTo(0, 1);
    expect(variance).toBeCloseTo(1, 1);
  });
});

describe("pick", () => {
  it("always returns an element from the array", () => {
    const r = mulberry32(7);
    const arr = ["a", "b", "c"];
    for (let i = 0; i < 50; i++) expect(arr).toContain(pick(arr, r));
  });
});
