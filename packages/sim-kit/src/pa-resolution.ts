/**
 * Plate-appearance resolution — ported from bush-league-v0.10.html's
 * `log5()`/`resolvePA()`/`draw()`/`advOf()`/`errRate()` and the `ADV`
 * constants. This is the pure outcome-resolution core of the box-score
 * engine: given a batter's and pitcher's true rates (from `rates.ts`'s
 * `rateProfile()`) and a level environment, it draws one plate appearance's
 * outcome.
 *
 * Scope, stated rather than silently expanded: `simGame()` in the original
 * build wraps this in a full nine-inning loop against real rosters,
 * lineups, rotations and bullpens — a materially bigger subsystem (roster
 * legality, lineup/rotation construction, pitcher usage, box-score
 * accumulation per player) that this pass does not include. That's a
 * separate pass, not an oversight — porting it alongside this risked
 * rushing both. See HANDOFF.md.
 *
 * Adaptation, noted rather than silent: the original attaches `_rt` (the
 * cached rate profile) onto the batter/pitcher Player objects as a
 * side-channel before calling `resolvePA`. This port takes the two Rates
 * objects as explicit parameters instead — the same "no hidden state"
 * pattern as every other module in this package.
 */
import type { Rng } from "./rng.js";
import type { LevelEnv } from "./levels.js";
import type { BatterRates, PitcherRates } from "./rates.js";
import { clamp, nz } from "./util.js";
import type { TeamDefense } from "./fielding.js";

/** Outcome codes — the original build's own numbering, preserved so a future box-score/stat-line layer can match it directly. */
export const Outcome = {
  StrikeOut: 0,
  Walk: 1,
  HitByPitch: 2,
  HomeRun: 3,
  Single: 4,
  Double: 5,
  Triple: 6,
  ReachOnError: 7,
  Out: 8,
} as const;
export type OutcomeCode = (typeof Outcome)[keyof typeof Outcome];

/**
 * Advancement, defence and the small multiplicative corrections that close
 * the gap between "the event rates are right" and "the SCORING is right."
 * Tier 3 and CALIBRATED (against `qa/simcal.js` in the original — this
 * package's own calibration lives in `test/pa-resolution.test.ts`), not
 * chosen: getting the plate appearance right is only half a run-scoring
 * model; how runners move is the other half.
 */
export const ADV = {
  s1_1to3: 0.33,
  s1_2score: 0.7,
  d2_1score: 0.55,
  dp: 0.098,
  sf: 0.31,
  err: 0.0165,
  sbTry: 0.058,
  sbOk: 0.745,
  hrCal: 0.92,
  bbCal: 1.06,
} as const;

/** The standard odds-ratio method for combining a batter's rate, a pitcher's rate and the league baseline. Because that baseline is the PUBLISHED line (RESEARCH.md §7), a league of average players reproduces its own real statistics with no tuning. */
export function log5(b: number, p: number, l: number): number {
  if (!(l > 0 && l < 1)) return clamp(b, 0, 1);
  const x = (b / l) * (p / l) * l;
  const y = ((1 - b) / (1 - l)) * ((1 - p) / (1 - l)) * (1 - l);
  const d = x + y;
  return d > 0 ? clamp(x / d, 0, 0.99) : 0;
}

/**
 * Errors scale with the level's PUBLISHED unearned-run share — the one
 * figure in RESEARCH.md that behaves the way intuition expects: 8.1% at
 * the majors rising to 15.2% at Single-A. A single global error rate gave
 * every level major-league defence.
 */
export function errRate(env: Pick<LevelEnv, "ue">): number {
  return clamp((ADV.err * nz(env.ue)) / 0.081, 0.004, 0.06);
}

export interface Advancement {
  s1_1to3: number;
  s1_2score: number;
  d2_1score: number;
  sf: number;
  dp: number;
  sbTry: number;
}

/**
 * Baserunning is also a function of the defence behind it — the lower
 * levels score more than Double-A's power numbers suggest because runners
 * take the extra base against worse arms and worse decisions, the same
 * weakness the unearned-run share measures. Anchored at the major-league
 * rate and scaled by how much worse the defence is.
 */
export function advOf(env: Pick<LevelEnv, "ue">): Advancement {
  const f = clamp(1 + (nz(env.ue) - 0.081) * 3.2, 1, 1.34);
  return {
    s1_1to3: clamp(ADV.s1_1to3 * f, 0, 0.62),
    s1_2score: clamp(ADV.s1_2score * f, 0, 0.93),
    d2_1score: clamp(ADV.d2_1score * f, 0, 0.88),
    sf: clamp(ADV.sf * f, 0, 0.5),
    dp: clamp(ADV.dp / f, 0.05, 0.2),
    sbTry: clamp(ADV.sbTry * f, 0, 0.12),
  };
}

/**
 * Resolves one plate appearance. `u` is the single draw that decides
 * between K/BB/HBP/HR/ball-in-play; a ball in play that isn't an error
 * spends a second, independent draw from `r` on hit type — matching the
 * original's own two-draw structure exactly (one call in `resolvePA`, one
 * inside this function).
 */
function draw(
  u: number,
  pBB: number,
  pSO: number,
  pHR: number,
  pHB: number,
  rem: number,
  batter: BatterRates,
  pitcher: PitcherRates,
  env: LevelEnv,
  r: Rng,
  def?: TeamDefense,
): OutcomeCode {
  let a = pSO;
  if (u < a) return Outcome.StrikeOut;
  a += pBB;
  if (u < a) return Outcome.Walk;
  a += pHB;
  if (u < a) return Outcome.HitByPitch;
  a += pHR;
  if (u < a) return Outcome.HomeRun;

  // Ball in play. This is where DIPS says the defence lives: once the ball
  // is struck the pitcher's influence is largely spent, and what happens
  // next is who is standing where. The league BABIP gains a third term for
  // exactly that, and the error rate stops being a property of the LEVEL
  // alone and becomes a property of the hands on the field too.
  const bab = clamp(log5(batter.bab, pitcher.bab, env.babip) + (def?.babipDelta ?? 0), 0.15, 0.5);
  const uu = (u - a) / Math.max(1e-9, rem);
  const er = errRate(env) * (def?.errFactor ?? 1);
  if (uu < er) return Outcome.ReachOnError;
  if (uu < er + bab * (1 - er)) {
    const v = r();
    if (v < batter.f3) return Outcome.Triple;
    if (v < batter.f3 + batter.f2) return Outcome.Double;
    return Outcome.Single;
  }
  return Outcome.Out;
}

/**
 * How hard a stolen strike pushes the strikeout and walk rates.
 *
 * A framed strike is not a strikeout — it changes a count, and only some
 * counts turn over. So this is a sensitivity, not an identity, and it is
 * the one number here that could not be read off a source. It is therefore
 * SET BY MEASUREMENT, not by argument: `fielding.test.ts` plays real
 * seasons with an elite and an average catcher and checks the run
 * difference lands near the ~15 runs the sourced +120-strike figure implies
 * at the glossary's 0.125 runs per strike.
 */
export const FRAMING_SENSITIVITY = 10;

/**
 * `def` is the DEFENDING club's fielding, and it is optional so that every
 * caller and calibration test written before the fielding model measures
 * exactly what it measured before — the same technique D101 used when
 * ticket pricing entered `gateDay`. Omitted means league-average defence
 * and byte-identical behaviour.
 */
export function resolvePA(
  batter: BatterRates,
  pitcher: PitcherRates,
  env: LevelEnv,
  r: Rng,
  def?: TeamDefense,
): OutcomeCode {
  // Framing moves CALLED STRIKES, so it lands here — before contact, on the
  // strikeout and walk rates — and not on the ball in play. A catcher who
  // steals strikes turns some walks into strikeouts; one who does not,
  // does the reverse.
  const frame = def ? def.framingStrikeShift * FRAMING_SENSITIVITY : 0;
  const pBB = log5(batter.bb, pitcher.bb, env.bb) * ADV.bbCal * (1 - frame);
  const pSO = log5(batter.so, pitcher.so, env.k) * (1 + frame);
  const pHR = log5(batter.hr, pitcher.hr, env.hrPA) * ADV.hrCal;
  const pHB = env.hbp;
  let rem = 1 - pBB - pSO - pHR - pHB;

  if (rem < 0.05) {
    const sc = 0.95 / (pBB + pSO + pHR + pHB);
    rem = 0.05;
    return draw(r(), pBB * sc, pSO * sc, pHR * sc, pHB * sc, rem, batter, pitcher, env, r, def);
  }
  return draw(r(), pBB, pSO, pHR, pHB, rem, batter, pitcher, env, r, def);
}
