/**
 * Verification for the money loop (`economics.ts`) against the original's
 * own stated tuning target: "a club at .500 with league-average attendance
 * nets ROUGHLY ZERO over a FULL CALENDAR YEAR." `gateFor`/`econFor`/`attFor`
 * were ported directly and are Tier 3 (design knobs) by original design —
 * this file exists to catch a genuinely BROKEN mechanism, not to chase an
 * exact zero from numbers that were never meant to hit one precisely.
 *
 * `gateDay`/`postMonth`/`seedOpeningBooks`/`rosterPayroll` are
 * RECONSTRUCTED, not re-verified against the primary source — see
 * `economics.ts`'s own header and DECISIONS.md D86 for this pass. This
 * file's own diagnostic runs are what CAUGHT two real defects, not
 * inspection: first, every flat cost line posted 12x/year but divided by a
 * 5-7-month season length, a systematic overcharge that read as a -$188M
 * "net loss" on a $200M-revenue MLB club; second, after that fix, every
 * independent league still netted roughly 80% of revenue as profit — far
 * from "roughly zero." The first was a mechanism bug, fixed outright. The
 * second turned out to be a genuinely sourced target this project's own
 * committed CHANGELOG.md/DECISIONS.md (Build 0.7, D49) states directly:
 * "all five [independent] economies sit between -$385 and +$963 at .500."
 * `economics.ts`'s `INDY_OPEX_RECAL` and this pass's re-solved per-league
 * `opScale` values (`world-data.ts`) were fit against that exact sourced
 * number, the same way (fit net against win%, read the intercept at .500)
 * D49 itself describes solving it the first time — see `economics.ts`'s own
 * header on `INDY_OPEX_RECAL` for the full method and its honest remaining
 * error margin.
 */
import { describe, expect, it } from "vitest";
import { newGame } from "../src/newgame.js";
import { advanceDay } from "../src/advance.js";
import { auditBooks, incomeStatement, balance, cash } from "../src/ledger.js";
import { dateToSerial } from "../src/date.js";
import type { GameState } from "../src/state.js";

const YEAR_GUARD = 400; // days — comfortably covers a full calendar year from the 14-day pre-season open through the following winter, WITH room to spare for the bounded-window checks below

/** Yields to the event loop — see `playFullYear`'s own note on why a full-year run needs to. */
function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Plays a full year, yielding to the event loop every 20 simulated days.
 * Not needed for correctness (`advanceDay` is fully synchronous) — needed
 * because several full-year runs back to back is tens of seconds of
 * unbroken synchronous CPU work, and this pass's own runs of the full
 * workspace suite (not this file in isolation) caught vitest's worker-RPC
 * heartbeat timing out during exactly that stretch ("Timeout calling
 * onTaskUpdate"), which fails the suite's exit code even though every
 * assertion passes. Periodic yields cost nothing here and let the runner's
 * own bookkeeping keep up.
 */
async function playFullYear(ownedClubId: string, seed: number): Promise<{ state: GameState; startDay: number }> {
  const state = newGame({ ownedClubId, seed, year: 2026 });
  const startDay = dateToSerial(state.date);
  for (let i = 0; i < YEAR_GUARD; i++) {
    advanceDay(state);
    if (i % 20 === 19) await tick();
  }
  return { state, startDay };
}

/**
 * Net income for EXACTLY one calendar year from the game's own opening
 * day — not "whatever `incomeStatement` finds in the whole ledger," which
 * a fixed `YEAR_GUARD` day count doesn't cleanly align to (`advanceDay`
 * runs in real calendar days, and MLB's own season window means 400 days
 * spills roughly a month into a 13th partial month). Caught by this pass's
 * own verification, not assumed: an un-bounded read let one extra full
 * monthly posting (payroll included, once `INDY_OPEX_RECAL`/D86 made MLB
 * payroll post every calendar month rather than in-season only) inflate a
 * single seed's measured margin past this file's own sanity bound. The fix
 * is the measurement, not the mechanism — `postMonth` posting real costs
 * for a real 13th month it was actually asked to advance through is
 * correct; measuring "a full calendar year" against more than 365 days of
 * postings is not.
 */
async function oneYearMargin(ownedClubId: string, seed: number): Promise<number> {
  const { state, startDay } = await playFullYear(ownedClubId, seed);
  const is = incomeStatement(state.ledger, startDay, startDay + 364);
  if (is.totalRev <= 0) throw new Error(`${ownedClubId} seed ${seed}: no revenue posted in the measured year`);
  return is.net / is.totalRev;
}

describe("economics — ledger integrity over a full season", () => {
  it("stays balanced (auditBooks: 0 fails) throughout, checked mid-run and at year end, across several MLB seeds", async () => {
    for (const seed of [1, 2, 3]) {
      const state = newGame({ ownedClubId: "MLB_NYY", seed, year: 2026 });
      for (let i = 0; i < YEAR_GUARD; i++) {
        advanceDay(state);
        if (i % 20 === 19) await tick();
        if (i === 180 || i === YEAR_GUARD - 1) {
          expect(auditBooks(state.ledger).fails).toEqual([]);
        }
      }
    }
  }, 30000);

  it("never lets cash collapse to a catastrophic negative — the opening-capital seed actually covers the pre-season runway", async () => {
    const { state } = await playFullYear("MLB_NYY", 9);
    let minCash = Infinity;
    // Re-walk isn't needed — cash only needs checking at points already
    // exercised above; this test's own run re-derives it cheaply from the
    // ledger built during its own playFullYear call.
    for (let i = 1; i <= state.ledger.length; i++) {
      const c = cash(state.ledger.slice(0, i));
      if (c < minCash) minCash = c;
    }
    expect(minCash).toBeGreaterThan(0);
  }, 15000);
});

describe("economics — MLB net income against the tuning target", () => {
  it("lands within a bounded margin of zero over a full calendar year, not an order-of-magnitude miss", async () => {
    // Measured this pass (seeds 1-5, exactly 365 days from the game's own
    // opening day — see `oneYearMargin`'s own header on why that exact
    // window matters): margins of -24.9%, -32.1%, -16.9%, -8.0%, -23.7% of
    // revenue — average -21.1%. WORSE than an earlier, looser measurement
    // of this same pass (-6.9%), and that regression is itself a real
    // finding, not noise: the looser number came from a version where MLB
    // payroll was still (incorrectly) gated to in-season months only, which
    // under-counted it by about 1/7 of a year purely from where the season
    // window's edges fell relative to calendar-month boundaries — two bugs
    // partly cancelling, not a correct result. With payroll now correctly
    // spread over all 12 months (sourced, `rosterPayroll`'s own header),
    // this -21% is the honest number. Unlike the independent leagues (this
    // file's other describe block), there is no equally precise SOURCED
    // dollar target for MLB to re-solve against — only the qualitative
    // "nets roughly zero" — and the gap traces mostly to `contractFor`'s
    // MLB salary curve (ported and verified in an earlier, separate pass,
    // v2.4.0) pricing a random 40-man roster higher, on average, than
    // `ECON.MLB`'s revenue figures cover; not a bug to silently paper over
    // with an unsourced number, and not this pass's scope to re-tune a
    // different, already-verified system. Recorded here as a real, disclosed
    // gap (DECISIONS.md D86) — bounds below catch a broken mechanism
    // (order-of-magnitude), not a precise replica of this one run.
    const margins: number[] = [];
    for (const seed of [1, 2, 3, 4, 5]) {
      const margin = await oneYearMargin("MLB_NYY", seed);
      expect(Math.abs(margin)).toBeLessThan(0.4); // no individual seed explodes
      margins.push(margin);
    }
    const avg = margins.reduce((t, m) => t + m, 0) / margins.length;
    expect(Math.abs(avg)).toBeLessThan(0.3);
  }, 60000);

  it("keeps the local-media receivable (account 1100) bounded — accrued monthly, collected with a one-month lag, never allowed to grow unbounded", async () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 9, year: 2026 });
    let maxAR = 0;
    for (let i = 0; i < YEAR_GUARD; i++) {
      advanceDay(state);
      if (i % 20 === 19) await tick();
      const ar = balance(state.ledger, 1100);
      expect(ar).toBeGreaterThanOrEqual(0);
      if (ar > maxAR) maxAR = ar;
    }
    // One month's worth of MLB media revenue, +1% for rounding slack — the
    // bound this mechanism is actually supposed to guarantee.
    const oneMonthMedia = 7_900_000 / 12;
    expect(maxAR).toBeLessThanOrEqual(oneMonthMedia * 1.01);
    expect(maxAR).toBeGreaterThan(0); // proves the accrual mechanism actually engaged, not a no-op
  }, 15000);
});

describe("economics — independent leagues, recalibrated against the sourced -$385/+$963-at-.500 target", () => {
  it("stays balanced, solvent and finite across all five independent leagues", async () => {
    const leagues: [id: string, seed: number, label: string][] = [
      ["INDY_FRON_143", 3, "Frontier League"],
      ["INDY_AAPB_131", 3, "American Association"],
      ["INDY_PION_161", 3, "Pioneer League"],
      ["INDY_ALPB_121", 3, "Atlantic League"],
      ["INDY_PECO_173", 3, "Pecos League"],
    ];
    for (const [id, seed, label] of leagues) {
      const { state } = await playFullYear(id, seed);
      const audit = auditBooks(state.ledger);
      expect(audit.fails, `${label}: ${audit.fails.join("; ")}`).toEqual([]);
      expect(cash(state.ledger)).toBeGreaterThan(0);
      const is = incomeStatement(state.ledger);
      expect(Number.isFinite(is.net)).toBe(true);
      expect(Number.isFinite(is.totalRev)).toBe(true);
    }
  }, 30000);

  it("lands within a bounded margin of revenue over a full calendar year for every independent league, not an order-of-magnitude miss", async () => {
    // Measured this pass on seeds this project's own solve did NOT train
    // on (10-12, held out from the [1-4] seeds `INDY_OPEX_RECAL`/`opScale`
    // were fit against — DECISIONS.md D86), exactly 365 days from each
    // game's own opening day: Frontier +0.8/+0.8/+3.0% (avg +1.5%),
    // American Association +6.3/+13.5/+7.4% (avg +9.1%), Pioneer -5.1/+6.2/
    // +3.9% (avg +1.7%), Atlantic -0.8/+4.0/-7.5% (avg -1.4%), Pecos +5.4/
    // +4.3/+3.1% (avg +4.3%) — every league within about 14 points of
    // revenue on its WORST single seed, every average within 10 points, an
    // order of magnitude closer than the ~80% margin before recalibration.
    // Bounds here are deliberately wide of that measured spread, for the
    // same reason the MLB test above is: proving "close to zero, not
    // broken," not re-asserting one specific run's own numbers.
    const leagues: [id: string, seeds: number[], label: string][] = [
      ["INDY_FRON_143", [10, 11, 12], "Frontier League"],
      ["INDY_AAPB_131", [10, 11, 12], "American Association"],
      ["INDY_PION_161", [10, 11, 12], "Pioneer League"],
      ["INDY_ALPB_121", [10, 11, 12], "Atlantic League"],
      ["INDY_PECO_173", [10, 11, 12], "Pecos League"],
    ];
    for (const [id, seeds, label] of leagues) {
      const margins: number[] = [];
      for (const seed of seeds) {
        const margin = await oneYearMargin(id, seed);
        expect(Math.abs(margin), `${label} seed ${seed}`).toBeLessThan(0.2); // no individual seed explodes
        margins.push(margin);
      }
      const avg = margins.reduce((t, m) => t + m, 0) / margins.length;
      expect(Math.abs(avg), label).toBeLessThan(0.12);
    }
  }, 120000);
});
