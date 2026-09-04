/**
 * Calibration — the port of `qa/calib.js`'s own discipline: generate a
 * population at each level and prove it reproduces RESEARCH.md §7.1's
 * published 2025 line within the old build's own tolerances (slash line
 * inside 2%, home runs inside 5.5%, per-nine pitching rates inside 2%).
 *
 * Scope, stated rather than silently narrowed: this checks what
 * `rateProfile()` alone can be checked against — a hitter's BA/OBP/SLG/OPS/
 * HR rate/BB%/K%, and a pitcher's BB9/SO9/HR9. ERA and WHIP are opponent-
 * dependent (log5 against a batter) and need the box-score engine, which is
 * not yet ported (see HANDOFF.md) — asserting them here would be testing
 * a formula this package doesn't contain yet, not the generator.
 */
import { describe, expect, it } from "vitest";
import { mulberry32 } from "../src/rng.js";
import { LVL, type LevelKey } from "../src/levels.js";
import { makePlayer } from "../src/player.js";
import { rateProfile, isPitcherRates, type BatterRates, type PitcherRates } from "../src/rates.js";

const N = 1400; // matches qa/calib.js's population size
const LEVELS: Exclude<LevelKey, "INDY" | "PECOS">[] = ["MLB", "AAA", "AA", "HIA", "A"];
const SEED_BASE: Record<string, number> = { MLB: 101, AAA: 102, AA: 103, HIA: 104, A: 105 };

function withinPct(actual: number, expected: number, pct: number): boolean {
  return Math.abs(actual - expected) / Math.abs(expected) <= pct;
}

interface HitterAgg {
  ba: number;
  obp: number;
  slg: number;
  ops: number;
  hr600: number;
  bbRate: number;
  kRate: number;
}

function aggregateHitters(rates: BatterRates[], env: (typeof LVL)["MLB"]["env"]): HitterAgg {
  const e = env!;
  const abF = e.abF;
  let sumBA = 0, sumOBP = 0, sumSLG = 0, sumHR600 = 0, sumBB = 0, sumK = 0;
  for (const r of rates) {
    const ballsInPlay = Math.max(0, abF - r.so - r.hr);
    const hitsPerPA = r.hr + r.bab * ballsInPlay;
    const ba = hitsPerPA / abF;
    const obp = hitsPerPA + r.bb + e.hbp;
    const nonHrHits = Math.max(0, hitsPerPA - r.hr);
    const doubles = r.f2 * nonHrHits;
    const triples = r.f3 * nonHrHits;
    const singles = Math.max(0, nonHrHits - doubles - triples);
    const totalBases = singles + 2 * doubles + 3 * triples + 4 * r.hr;
    const slg = totalBases / abF;
    sumBA += ba;
    sumOBP += obp;
    sumSLG += slg;
    sumHR600 += r.hr * 600;
    sumBB += r.bb;
    sumK += r.so;
  }
  const n = rates.length;
  return {
    ba: sumBA / n,
    obp: sumOBP / n,
    slg: sumSLG / n,
    ops: sumOBP / n + sumSLG / n,
    hr600: sumHR600 / n,
    bbRate: sumBB / n,
    kRate: sumK / n,
  };
}

interface PitcherAgg {
  bb9: number;
  so9: number;
  hr9: number;
}

function aggregatePitchers(rates: PitcherRates[], env: (typeof LVL)["MLB"]["env"]): PitcherAgg {
  const bf9 = env!.bf9;
  let sumBB = 0, sumSO = 0, sumHR = 0;
  for (const r of rates) {
    sumBB += r.bb * bf9;
    sumSO += r.so * bf9;
    sumHR += r.hr * bf9;
  }
  const n = rates.length;
  return { bb9: sumBB / n, so9: sumSO / n, hr9: sumHR / n };
}

describe.each(LEVELS)("hitter population calibration — %s", (levelKey) => {
  const level = LVL[levelKey];
  const env = level.env!;
  const r = mulberry32(SEED_BASE[levelKey]!);
  const players = Array.from({ length: N }, () => makePlayer(r, level, "B", 27));
  const spread = Math.sqrt(level.s * level.s + 36);
  const rates = players.map((p) => rateProfile(p, env, level.c, spread)) as BatterRates[];
  const agg = aggregateHitters(rates, env);

  it(`batting average reproduces RESEARCH.md §7.1 within 2% (generated ${agg.ba.toFixed(3)}, published ${env.ba})`, () => {
    expect(withinPct(agg.ba, env.ba, 0.02)).toBe(true);
  });
  it(`OBP within 2% (generated ${agg.obp.toFixed(3)}, published ${env.obp})`, () => {
    expect(withinPct(agg.obp, env.obp, 0.02)).toBe(true);
  });
  it(`SLG within 2% (generated ${agg.slg.toFixed(3)}, published ${env.slg})`, () => {
    expect(withinPct(agg.slg, env.slg, 0.02)).toBe(true);
  });
  it(`OPS within 2% (generated ${agg.ops.toFixed(3)}, published ${env.ops})`, () => {
    expect(withinPct(agg.ops, env.ops, 0.02)).toBe(true);
  });
  it(`home runs per 600 PA within 5.5% (generated ${agg.hr600.toFixed(2)}, published ${env.hr600})`, () => {
    expect(withinPct(agg.hr600, env.hr600, 0.055)).toBe(true);
  });
  it(`walk rate within 2% (generated ${(agg.bbRate * 100).toFixed(2)}%, published ${(env.bb * 100).toFixed(2)}%)`, () => {
    expect(withinPct(agg.bbRate, env.bb, 0.02)).toBe(true);
  });
  it(`strikeout rate within 2% (generated ${(agg.kRate * 100).toFixed(2)}%, published ${(env.k * 100).toFixed(2)}%)`, () => {
    expect(withinPct(agg.kRate, env.k, 0.02)).toBe(true);
  });
});

describe.each(LEVELS)("pitcher population calibration — %s", (levelKey) => {
  const level = LVL[levelKey];
  const env = level.env!;
  const r = mulberry32(SEED_BASE[levelKey]! + 1000);
  const players = Array.from({ length: N }, () => makePlayer(r, level, "P", 27));
  const spread = Math.sqrt(level.s * level.s + 36);
  const rates = players.map((p) => rateProfile(p, env, level.c, spread));
  rates.forEach((rt) => expect(isPitcherRates(rt)).toBe(true));
  const agg = aggregatePitchers(rates as PitcherRates[], env);

  it(`BB/9 within 2% (generated ${agg.bb9.toFixed(2)}, published ${env.bb9})`, () => {
    expect(withinPct(agg.bb9, env.bb9, 0.02)).toBe(true);
  });
  it(`SO/9 within 2% (generated ${agg.so9.toFixed(2)}, published ${env.so9})`, () => {
    expect(withinPct(agg.so9, env.so9, 0.02)).toBe(true);
  });
  it(`HR/9 within 2% (generated ${agg.hr9.toFixed(2)}, published ${env.hr9})`, () => {
    expect(withinPct(agg.hr9, env.hr9, 0.02)).toBe(true);
  });
});

describe("Pecos environment (derived, not borrowed — RESEARCH.md §9.5)", () => {
  const base = LVL.A.env!;
  const pecos = LVL.PECOS!.env!;

  it("run environment is hotter than the Single-A baseline it derives from", () => {
    expect(pecos.rg).toBeGreaterThan(base.rg);
  });
  it("home run rate is hotter than the Single-A baseline", () => {
    expect(pecos.hr9).toBeGreaterThan(base.hr9);
  });
  it("records its own elevation for the provenance sheet", () => {
    expect(pecos.alt).toBe(4870);
  });
});
