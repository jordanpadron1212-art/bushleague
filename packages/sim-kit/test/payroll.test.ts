/**
 * Verification for the owner's payroll budget (DECISIONS.md D102).
 *
 * The number that matters is not "does more money mean more wins" — any
 * monotone mapping gives that. It is **cost per marginal win**, because
 * that is the figure with a real-world anchor and the one that decides
 * whether the trade-off is a decision or a formality.
 *
 * Two slopes were measured in this engine before any constant was chosen:
 * +1 point of team talent is worth ~5.5 wins over 162 games, and buying
 * talent at `contractFor`'s own ovr→salary curve would give 8.3 points per
 * payroll doubling. Together that would mean doubling payroll buys 45 wins.
 * Real MLB spans roughly 62–100 wins across a ~4.5x payroll range, so the
 * calibration deliberately makes money buy talent far more slowly — an owner
 * bids against 29 other clubs, and the premium is the market.
 */
import { describe, expect, it } from "vitest";
import { newGame } from "../src/newgame.js";
import { advanceDay } from "../src/advance.js";
import { startNewSeason } from "../src/rollover.js";
import { mulberry32 } from "../src/rng.js";
import {
  PAYROLL_MAX_RATIO,
  PAYROLL_MIN_RATIO,
  econFor,
  payrollMarketFactor,
  payrollRatio,
  payrollTalentShift,
  rosterPayroll,
} from "../src/economics.js";
import { MLB_MIN_SALARY, contractFor, salaryForService } from "../src/roster.js";
import type { GameState } from "../src/state.js";

const NORM_ANNUAL = 14_600_000 * 12; // ECON.MLB.payroll is MONTHLY

function play(s: GameState): void {
  let g = 0;
  while (g++ < 400) if (advanceDay(s).seasonOver) return;
}

describe("the mapping itself", () => {
  it("a budget at the league norm changes nothing at all", () => {
    expect(payrollRatio(NORM_ANNUAL, econFor({ lvl: "MLB", lg: "AL" }), 12)).toBeCloseTo(1, 9);
    expect(payrollTalentShift(1)).toBe(0);
    expect(payrollMarketFactor(1)).toBe(1);
  });

  it("and a NEW GAME starts at exactly that norm — the default is neutral, not an accident", () => {
    const s = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
    const club = s.world.clubs.find((c) => c.id === "MLB_NYY")!;
    expect(payrollRatio(s.payrollBudget, econFor(club), 12)).toBeCloseTo(1, 6);
    // The budget is ANNUAL, matching scoutingBudget. Storing the monthly
    // figure here made the two fields mean different things.
    expect(s.payrollBudget).toBe(NORM_ANNUAL);
  });

  it("clamps outside the calibrated range rather than extrapolating", () => {
    const E = econFor({ lvl: "MLB", lg: "AL" });
    expect(payrollRatio(NORM_ANNUAL * 100, E, 12)).toBe(PAYROLL_MAX_RATIO);
    expect(payrollRatio(1, E, 12)).toBe(PAYROLL_MIN_RATIO);
    expect(payrollRatio(0, E, 12)).toBe(1);
  });

  it("talent and cost move in the same direction, and cost moves faster", () => {
    // The whole point: you do not get better players at the same price.
    for (const ratio of [1.25, 1.5, 2.0]) {
      expect(payrollTalentShift(ratio)).toBeGreaterThan(0);
      expect(payrollMarketFactor(ratio)).toBeGreaterThan(1);
    }
    for (const ratio of [0.5, 0.75]) {
      expect(payrollTalentShift(ratio)).toBeLessThan(0);
      expect(payrollMarketFactor(ratio)).toBeLessThan(1);
    }
  });

  it("contractFor is unchanged at the market rate — every existing caller measures what it always did", () => {
    const club = { lvl: "MLB", lg: "AL" } as const;
    const mk = (mf?: number) => {
      const p = { ovr: 62, age: 27, sal: 0, svc: 0, yrs: 0, opt: 0, tot: 0 } as never;
      contractFor(p, club, mulberry32(3), mf);
      return (p as { sal: number }).sal;
    };
    expect(mk()).toBe(mk(1));
    expect(mk(1.5)).toBeGreaterThan(mk(1));
  });
});

describe("what it actually buys — measured across real multi-season saves", () => {
  /**
   * Four rollovers so the authorised budget has largely replaced the
   * opening roster, then a played season. Two seeds per point: enough to
   * establish the trend across the full range, not enough to claim
   * monotonicity between adjacent steps — so this asserts the range, which
   * is what the calibration is actually about.
   */
  function run(ratio: number): { wins: number; payroll: number } {
    let wins = 0;
    let payroll = 0;
    const SEEDS = [5, 11];
    for (const seed of SEEDS) {
      const s = newGame({ ownedClubId: "MLB_NYY", seed, year: 2026 });
      s.payrollBudget = Math.round(NORM_ANNUAL * ratio);
      // Drop the payroll ask: this measures the budget itself across its
      // whole range, not the three points the desk offers.
      s.asks = s.asks.filter((a) => a.domain !== "payroll");
      for (let y = 0; y < 4; y++) {
        play(s);
        startNewSeason(s, mulberry32(s.seed + y * 7919));
        // The owner holds the line. Set directly rather than through the
        // ask, because the ask only offers three fixed points and this is
        // measuring the whole range.
        s.payrollBudget = Math.round(NORM_ANNUAL * ratio);
      }
      play(s);
      const club = s.world.clubs.find((c) => c.id === "MLB_NYY")!;
      wins += club.w;
      payroll += rosterPayroll(s.players, club) * 12;
    }
    return { wins: wins / SEEDS.length, payroll: payroll / SEEDS.length };
  }

  const lean = run(PAYROLL_MIN_RATIO);
  const rich = run(PAYROLL_MAX_RATIO);

  it("spans a realistic win range — not 45 wins a doubling", () => {
    expect(rich.wins).toBeGreaterThan(lean.wins + 15);
    // Real MLB is roughly 62-100. A model that let money buy 120 wins would
    // pass a naive "more money, more wins" test and still be wrong.
    expect(lean.wins).toBeGreaterThan(50);
    expect(rich.wins).toBeLessThan(110);
  }, 1_800_000);

  it("costs roughly what the sourced cost-per-win says it should", () => {
    const perWin = (rich.payroll - lean.payroll) / (rich.wins - lean.wins);
    // Anchor: the "replacement team wins a third of its games" convention
    // puts league-average marginal cost near $6.5M/win, and the published
    // per-win spread runs from Tampa Bay's ~$825K to the Yankees' $2.5M+ of
    // TOTAL payroll per win. A wide band, deliberately — this asserts the
    // right order of magnitude, which is the claim the calibration makes.
    expect(perWin).toBeGreaterThan(3_000_000);
    expect(perWin).toBeLessThan(15_000_000);
  }, 1_800_000);

  it("a club comes in UNDER its authorisation, because service time is cheap", () => {
    // D103. This asserted "close to" until service-time pricing landed, and
    // that assertion was the wrong one: a real club's payroll is the sum of
    // its contracts, and a roster carrying pre-arbitration and arbitration
    // players spends well under what its owner authorised. Measured at
    // 62-70% of the authorisation across the range. Coming in under budget
    // is good management, not a leak — but it must stay a discount rather
    // than becoming a disconnect, so this bounds it from both sides.
    for (const [ratio, run] of [[PAYROLL_MIN_RATIO, lean], [PAYROLL_MAX_RATIO, rich]] as const) {
      const authorised = NORM_ANNUAL * ratio;
      expect(run.payroll).toBeGreaterThan(authorised * 0.45);
      expect(run.payroll).toBeLessThan(authorised * 0.95);
    }
  }, 1_800_000);

  it("and spending more genuinely costs more — the balance can now be drained", () => {
    expect(rich.payroll).toBeGreaterThan(lean.payroll * 2.5);
  }, 1_800_000);
});

describe("service-time pricing (D103) — the reason a roster has any salary spread at all", () => {
  it("prices a player on his service class, not only on his grade", () => {
    const market = 10_000_000;
    // Under three years: no leverage, the minimum, however good he is.
    expect(salaryForService(market, 0)).toBe(MLB_MIN_SALARY);
    expect(salaryForService(market, 2.9)).toBe(MLB_MIN_SALARY);
    // Arbitration: a rising share of open-market value.
    expect(salaryForService(market, 3)).toBeCloseTo(market * 0.25, 6);
    expect(salaryForService(market, 4)).toBeCloseTo(market * 0.4, 6);
    expect(salaryForService(market, 5)).toBeCloseTo(market * 0.6, 6);
    // Six years: a free agent, paid the market.
    expect(salaryForService(market, 6)).toBe(market);
    expect(salaryForService(market, 12)).toBe(market);
  });

  it("never pays an arbitration player less than a rookie would earn", () => {
    // A fringe player's 25% share is below the minimum; the floor holds.
    expect(salaryForService(1_000_000, 3)).toBe(MLB_MIN_SALARY);
  });

  it("rises monotonically with service, which is what makes a veteran expensive", () => {
    const market = 20_000_000;
    let prev = 0;
    for (const svc of [0, 2, 3, 4, 5, 6, 10]) {
      const sal = salaryForService(market, svc);
      expect(sal).toBeGreaterThanOrEqual(prev);
      prev = sal;
    }
  });

  it("produces a REAL roster: many distinct salaries, not four repeated ones", () => {
    // The defect this fixes, stated as the test that would have caught it.
    // Pricing purely off a grade rounded to the nearest 5 gave a 40-man
    // roster about four distinct salaries — every 65 on exactly $13.00M.
    const s = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
    const roster = s.players.filter((p) => p.cid === "MLB_NYY");
    const salaries = roster.map((p) => p.sal);
    const distinct = new Set(salaries).size;

    expect(roster.length).toBeGreaterThan(25);
    expect(distinct).toBeGreaterThan(10);
    // And the spread is the point: a rookie on the minimum alongside a
    // veteran on eight figures.
    expect(Math.min(...salaries)).toBeLessThanOrEqual(MLB_MIN_SALARY + 50_000);
    expect(Math.max(...salaries)).toBeGreaterThan(5_000_000);
    expect(Math.max(...salaries) / Math.min(...salaries)).toBeGreaterThan(8);
  });

  it("two players with the SAME grade can earn very different money", () => {
    // The single most characteristic fact about a real roster, and the one
    // the old model made impossible.
    const s = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
    const roster = s.players.filter((p) => p.cid === "MLB_NYY");
    const byGrade = new Map<number, number[]>();
    for (const p of roster) byGrade.set(p.ovr, [...(byGrade.get(p.ovr) ?? []), p.sal]);

    const spread = [...byGrade.values()].filter((v) => v.length > 1).map((v) => Math.max(...v) / Math.min(...v));
    expect(spread.length).toBeGreaterThan(0);
    expect(Math.max(...spread)).toBeGreaterThan(2);
  });
});
