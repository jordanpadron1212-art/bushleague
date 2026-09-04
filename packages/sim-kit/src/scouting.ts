/**
 * Scout estimates — Law 10's other half. Ported from
 * bush-league-v0.10.html's `noiseAt()`/`estOf()`/`ovrOf()`/`refineScout()`.
 *
 * An estimate is a scouting report, deliberately never stored: storing one
 * for every player in the world means shipping a report the owner never
 * earned. Each player carries one integer noise seed; the shown grade is
 * his true grade plus that player's own fixed noise, scaled by how
 * reliable the look is — deterministic, so grades never shimmer between
 * renders, and reliability can move without regenerating anything.
 *
 * DECISIONS.md D24: reliability is a function of SAMPLE SIZE, not age. It
 * used to saturate at a 0.96 cap for anyone past ~29, which flattened the
 * uncertainty Law 10 exists to create — every veteran read as a known
 * quantity. Ported with that fix already in place, not the earlier bug.
 */
import type { Player, Tool } from "./player.js";
import { BAT_TOOLS, IPof } from "./player.js";
import { clamp, nz, round2 } from "./util.js";

const TRAIT_IX: Record<Tool, number> = {
  hit: 0, pow: 1, eye: 2, spd: 3, def: 4, arm: 5,
  stf: 0, mov: 1, ctl: 2, sta: 3, dur: 4,
};

/** A deterministic, approximately-N(0,1) noise value from a player's own seed and a trait index — never Math.random(). */
export function noiseAt(seed: number, i: number): number {
  let u = 0;
  for (let k = 0; k < 3; k++) {
    let s = (seed + 0x9e3779b9 * (i * 3 + k + 1)) ^ 0x85ebca6b;
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    u += ((s ^ (s >>> 14)) >>> 0) / 4294967296;
  }
  return (u - 1.5) * 2;
}

/** The scouted grade the owner sees for one tool — true grade plus this player's fixed noise, scaled by (1 - reliability). Never the true grade itself unless reliability is already saturating. */
export function estOf(p: Player, k: Tool): number | null {
  const t = p.tru[k];
  if (t == null) return null;
  const b = 14 * (1 - nz(p.rel));
  if (b < 0.5) return t;
  return clamp(Math.round(t + noiseAt(nz(p.ns), TRAIT_IX[k] ?? 0) * b), 20, 80);
}

/** Overall grade — the mean of the SCOUTED (not true) tool grades, rounded to the nearest 5. What the owner sees is what this averages, never `p.tru` directly. */
export function ovrOf(p: Player): number {
  const tools = p.role === "P" ? (["stf", "mov", "ctl", "sta", "dur"] as const) : BAT_TOOLS;
  const total = tools.reduce((t, k) => t + nz(estOf(p, k)), 0);
  return Math.round(total / tools.length / 5) * 5;
}

export interface CareerSample {
  outs?: number;
  pa?: number;
}

/**
 * Scouting spend narrows an org's own reliability the same bounded way
 * `FRONT-OFFICE-DESIGN-PROPOSAL.md` §3 already sources for a scouting
 * director hire: "tightens toward, never below" a real ceiling — spend
 * buys clarity, not certainty. A bounded ADDITIVE term on top of
 * `refineScout`'s existing sample-size-driven reliability (D24), not a
 * replacement for it: `SCOUT_BOOST_MAX` is small enough that a five-PA
 * rookie is still read with real uncertainty no matter the budget, and
 * `refineScout`'s own [0.15, 0.93] clamp still applies after this is added
 * — a maxed-out scouting department cannot buy its way past the same
 * ceiling D24 already found (nobody reads as a fully known quantity).
 * Both constants are T3 design knobs (DECISIONS.md D90) — no sourced
 * dollar-to-clarity conversion exists — sized so a club spending twice its
 * own level's baseline (`Economy.scouting`) saturates the full boost, and
 * spending nothing gets none.
 */
const SCOUT_BOOST_MAX = 0.12;
const SCOUT_BOOST_SATURATE_AT = 2;

/** `spend`/`baseline` are both annual dollar figures — the same convention every other `Economy` line already uses. */
export function scoutBoostFor(spend: number, baseline: number): number {
  if (!(baseline > 0)) return 0;
  return SCOUT_BOOST_MAX * clamp(nz(spend) / (SCOUT_BOOST_SATURATE_AT * baseline), 0, 1);
}

/**
 * Recomputes a player's reliability, overall and potential grades from his
 * accumulated sample (season stats via `p.st` plus a caller-supplied career
 * total — the original read `p.car`, which belongs to the not-yet-ported
 * season/career-rollup system; passed in explicitly here instead of assumed)
 * plus `scoutBoost` (`scoutBoostFor` above) — 0 by default, so every
 * existing caller (`roster.ts`'s fresh-world build, `churn.ts`'s fresh
 * signees) is unaffected unless it opts in.
 */
export function refineScout(p: Player, career: CareerSample = {}, scoutBoost = 0): void {
  const sample =
    p.role === "P"
      ? (IPof(p) + nz(career.outs) / 3) * 4.3
      : nz(p.st["pa"]) + nz(career.pa);
  const base = 0.18 + 0.62 * (1 - Math.exp(-sample / 380)) + (p.age - 18) * 0.006;
  p.rel = round2(clamp(base + scoutBoost, 0.15, 0.93));
  p.ovr = ovrOf(p);
  // Potential must not move on every recompute, so it comes off the player's own seed, not a fresh roll.
  const jit = nz(p.ns) % 7;
  const peak = p.age < 25 ? Math.round(p.ovr + (25 - p.age) * 1.6 + jit) : p.ovr;
  p.pot = clamp(Math.round(peak / 5) * 5, 20, 80);
}
