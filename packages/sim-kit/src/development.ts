/**
 * Player development and ageing — RESEARCH.md §18, the gap §8.5 names
 * directly: "players age and nothing else. This is not a drift bug... it
 * is a missing system, and it makes a long career impossible rather than
 * merely inaccurate." Not ported from `bush-league-v0.10.html` — the
 * original never built this either (§8.5 describes it as unbuilt there
 * too) — this is new logic, built the way every system in this project is
 * supposed to be: sourced first, engine second.
 *
 * §18's own methodology note is the honest framing for what follows: "a
 * scattered patchwork... several outlets giving materially different peak
 * ages for the same metric... any aggregation for this project's sim
 * necessarily reconciles inconsistent independent estimates rather than
 * citing one authoritative table." Every `ToolCurve` below cites the
 * specific §18 subsection its PEAK AGE and DIRECTION come from — those are
 * real, sourced findings. The exact annual grade-point MAGNITUDES are this
 * project's own T3 reconciliation: chosen to be directionally correct and
 * proportioned against each other (power declines faster than plate
 * discipline; speed peaks earliest and falls hardest; pitch movement is
 * far more stable than velocity — all real, sourced relative orderings),
 * not derived from a single unit-precise conversion, because §18 itself
 * doesn't publish one for most of these tools (DRS points, sprint-speed
 * percentile bands and SLG points/season don't share a common scale with
 * this engine's 20-80 grades, unlike fastball velocity, which already has
 * one — `grades.ts`'s `FB_PTS` — and is the basis for `stf`'s own rate
 * below).
 *
 * `arm` has NO dedicated aging study anywhere in the public record (§18.5,
 * checked directly, none found) — modelled on `def`'s own sourced defensive
 * curve as the closest disclosed proxy, not invented from nothing.
 *
 * Explicitly NOT built this pass, disclosed rather than silently assumed
 * solved: retirement. No sourced retirement-hazard-by-age curve exists in
 * this project's research (§8.5 asks for one; nothing found). A player
 * simply keeps aging and declining — the same "closed population marches
 * uniformly older forever" problem the original build's own v0.9 pass
 * discovered and solved with real roster churn (free agency, contract
 * expiration, a fresh amateur class every year), none of which is ported
 * yet. `rollover.ts`'s own header repeats this same disclosure at the
 * point it actually bites.
 */
import type { Rng } from "./rng.js";
import { gauss } from "./rng.js";
import type { Player, Tool } from "./player.js";
import { BAT_TOOLS, PIT_TOOLS } from "./player.js";
import { clamp } from "./util.js";

export interface ToolCurve {
  /** Growth phase, `age < peak`: grade points per year (usually positive). */
  growthPerYear: number;
  /** The age a tool is sourced to peak at — cited per curve below. */
  peak: number;
  /** Early decline phase, `peak <= age < cliffAge`: grade points per year (usually a small negative). */
  declinePerYear: number;
  /** The age decline is sourced to steepen at. */
  cliffAge: number;
  /** Late decline phase, `age >= cliffAge`: grade points per year (a larger negative). */
  cliffDeclinePerYear: number;
}

function rateFor(curve: ToolCurve, age: number): number {
  if (age < curve.peak) return curve.growthPerYear;
  if (age < curve.cliffAge) return curve.declinePerYear;
  return curve.cliffDeclinePerYear;
}

/**
 * Hitter tool curves — RESEARCH.md §18.1-§18.3.
 *
 * `hit`: contact/plate-discipline composite. Contact% "rises through ~29
 * then declines" (§18.1); O-Contact% falls ~5 points age 21->40, the
 * biggest mover in an otherwise stable bundle — gentle growth, gentle
 * decline, matching how stable §18.1 found this whole family to be.
 *
 * `pow`: SLG "declines ~10 pts/season after 26" (§18.2); max exit velocity
 * "peaks ~26, decline accelerates at 31" (§18.2) — peaks earlier than
 * `hit`, declines faster once it turns.
 *
 * `eye`: plate discipline is "the most rigorously aged" and most STABLE
 * hitter family (§18.1); walk rate peaks "28-32" per the corroborating
 * range in §18.5 (the refuted 37 figure explicitly excluded) — slow growth,
 * very gentle decline even after the cliff, well short of `pow`'s.
 *
 * `spd`: "the earliest-peaking physical tool" (§18.3) — 78.5% of players
 * age <=27 grade above-average Sprint Speed vs. just 15.2% at 33+, decline
 * "roughly 1 in/sec per year from debut on." Peaks earliest of any tool
 * here and falls hardest once declining.
 *
 * `def`: DRS "peaks age 25-26... sharper drop after 30" (§18.3, Sports
 * Info Solutions); the newer position-specific OAA study for centre
 * fielders finds the same shape (peak 25, plateau 28-30, decline after) —
 * two independent sources agreeing on both the peak age and the
 * plateau-then-cliff shape used here.
 *
 * `arm`: NOT sourced (§18.5) — modelled on `def`'s curve, disclosed above.
 */
const BAT_CURVES: Record<Tool, ToolCurve> = {
  hit: { growthPerYear: 0.35, peak: 29, declinePerYear: -0.25, cliffAge: 35, cliffDeclinePerYear: -0.55 },
  pow: { growthPerYear: 0.55, peak: 26, declinePerYear: -0.45, cliffAge: 31, cliffDeclinePerYear: -0.85 },
  eye: { growthPerYear: 0.25, peak: 29, declinePerYear: -0.15, cliffAge: 34, cliffDeclinePerYear: -0.35 },
  spd: { growthPerYear: 0.3, peak: 23, declinePerYear: -0.55, cliffAge: 33, cliffDeclinePerYear: -0.95 },
  def: { growthPerYear: 0.35, peak: 26, declinePerYear: -0.35, cliffAge: 30, cliffDeclinePerYear: -0.7 },
  arm: { growthPerYear: 0.3, peak: 25, declinePerYear: -0.3, cliffAge: 31, cliffDeclinePerYear: -0.6 },
  // Pitcher-only keys, unused for a batter — present so the Record<Tool,...> type is total.
  stf: { growthPerYear: 0, peak: 0, declinePerYear: 0, cliffAge: 0, cliffDeclinePerYear: 0 },
  mov: { growthPerYear: 0, peak: 0, declinePerYear: 0, cliffAge: 0, cliffDeclinePerYear: 0 },
  ctl: { growthPerYear: 0, peak: 0, declinePerYear: 0, cliffAge: 0, cliffDeclinePerYear: 0 },
  sta: { growthPerYear: 0, peak: 0, declinePerYear: 0, cliffAge: 0, cliffDeclinePerYear: 0 },
  dur: { growthPerYear: 0, peak: 0, declinePerYear: 0, cliffAge: 0, cliffDeclinePerYear: 0 },
};

/**
 * Pitcher tool curves — RESEARCH.md §18.3. Two, `ctl` and `sta`, are
 * ROLE-AWARE (starter vs. reliever) because §18.3's own table gives
 * materially different curves for each — a real, sourced distinction this
 * engine can actually encode via `Player.pos` ("SP"/"RP").
 *
 * `stf` (velocity/raw stuff): "-4 mph, age 21->38" for the average pitcher,
 * "velocity-maintainers" losing only -0.3 mph through peak years 25-30
 * (§18.3) — the one tool here with an existing engine-wide mph<->grade
 * scale to anchor against (`grades.ts`'s `FB_PTS`: 60 grade points spans
 * 11.5 mph, ~5.2 grade points/mph), which is why its magnitude is the
 * most precisely reasoned of the eleven curves in this file.
 *
 * `mov` (movement/shape, spin-derived): spin "declines much slower,
 * proportionally, than velocity" — a modelled 21->36 span lost ~1.8 mph of
 * four-seam velocity against only ~18.8 rpm of spin on a ~2,300 rpm base,
 * under 1% (§18.3) — almost flat by comparison to every other pitcher tool.
 *
 * `ctl` (command/walk rate): starters' walk rate "improves to ~24, then
 * flat"; relievers' BB/9 "rises from the outset, full increase reached by
 * 30" (§18.3) — opposite SHAPES for the two roles, not just different
 * rates: a starter's control keeps improving into his mid-20s and holds; a
 * reliever's erodes from day one of the sample.
 *
 * `sta` (stamina/effectiveness across an outing, proxied by the K/9-hold
 * pattern): starters' K/9 "flat until ~32"; relievers' K/9 "declines from
 * 31; loses 2+ K/9 by 34" (§18.3) — starters hold their stuff deep into
 * their 30s, relievers turn over noticeably earlier.
 *
 * `dur` (durability/attrition risk): pitcher attrition "spikes age 25-27
 * and 34-39, especially after a velocity drop" (§18.3) — a genuinely
 * non-monotonic finding (elevated risk in the mid-20s too, not just late
 * career) this piecewise-linear curve does not attempt to reproduce;
 * modelled instead on the general "holds, then declines after ~30-33"
 * shape most other pitcher components share. The mid-20s attrition spike
 * is a disclosed simplification, not a claim this curve captures it.
 */
function pitCurves(isReliever: boolean): Record<Tool, ToolCurve> {
  return {
    stf: { growthPerYear: 0.5, peak: 26, declinePerYear: -0.35, cliffAge: 32, cliffDeclinePerYear: -0.75 },
    mov: { growthPerYear: 0.2, peak: 27, declinePerYear: -0.05, cliffAge: 33, cliffDeclinePerYear: -0.2 },
    ctl: isReliever
      ? { growthPerYear: 0, peak: 20, declinePerYear: -0.4, cliffAge: 30, cliffDeclinePerYear: -0.15 }
      : { growthPerYear: 0.6, peak: 24, declinePerYear: -0.05, cliffAge: 36, cliffDeclinePerYear: -0.3 },
    sta: isReliever
      ? { growthPerYear: 0.3, peak: 26, declinePerYear: -0.1, cliffAge: 31, cliffDeclinePerYear: -0.6 }
      : { growthPerYear: 0.3, peak: 28, declinePerYear: -0.05, cliffAge: 32, cliffDeclinePerYear: -0.5 },
    dur: { growthPerYear: 0.25, peak: 27, declinePerYear: -0.1, cliffAge: 33, cliffDeclinePerYear: -0.5 },
    // Batter-only keys, unused for a pitcher — present so the Record<Tool,...> type is total.
    hit: { growthPerYear: 0, peak: 0, declinePerYear: 0, cliffAge: 0, cliffDeclinePerYear: 0 },
    pow: { growthPerYear: 0, peak: 0, declinePerYear: 0, cliffAge: 0, cliffDeclinePerYear: 0 },
    eye: { growthPerYear: 0, peak: 0, declinePerYear: 0, cliffAge: 0, cliffDeclinePerYear: 0 },
    spd: { growthPerYear: 0, peak: 0, declinePerYear: 0, cliffAge: 0, cliffDeclinePerYear: 0 },
    def: { growthPerYear: 0, peak: 0, declinePerYear: 0, cliffAge: 0, cliffDeclinePerYear: 0 },
    arm: { growthPerYear: 0, peak: 0, declinePerYear: 0, cliffAge: 0, cliffDeclinePerYear: 0 },
  };
}

/** Year-to-year randomness on top of the deterministic curve — real players don't age on rails. Chosen so the noise and the curve are comparable in size at the peak-to-cliff rates above, not so large it swamps the sourced trend, not so small development reads as a formula. */
const NOISE_SD = 1.4;

/**
 * Ages one player by exactly one year: increments `age`, then moves every
 * TRUE grade (Law 10 — never the scouted estimate) by that tool's sourced
 * rate for the player's age-at-start-of-year, plus independent per-tool
 * noise. Mutates in place, matching this package's established "accumulates
 * in place, by design" pattern (`game.ts`'s, `season.ts`'s own notes).
 */
export function developPlayer(p: Player, r: Rng): void {
  const curves = p.role === "P" ? pitCurves(p.pos === "RP") : BAT_CURVES;
  const tools: readonly Tool[] = p.role === "P" ? PIT_TOOLS : BAT_TOOLS;
  for (const k of tools) {
    const g = p.tru[k];
    if (g == null) continue;
    const rate = rateFor(curves[k], p.age);
    p.tru[k] = clamp(Math.round(g + rate + gauss(r) * NOISE_SD), 20, 80);
  }
  p.age += 1;
}

/** Ages and develops every player in a population by one year — `rollover.ts`'s own per-player call, exposed separately so a test can verify the curve shapes directly against a large population without needing a whole `GameState`. */
export function developPopulation(players: readonly Player[], r: Rng): void {
  for (const p of players) developPlayer(p, r);
}
