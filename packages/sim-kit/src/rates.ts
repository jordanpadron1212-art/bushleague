/**
 * Rate profiles — the bridge between a player's true grades and the rates
 * the (not-yet-ported) game engine draws outcomes from. Ported from
 * bush-league-v0.10.html's `rateProfile()`.
 *
 * This is also what makes the player-generation engine calibratable without
 * the box-score engine existing yet: the population-average of
 * `rateProfile()`'s outputs at a level should reproduce that level's
 * published environment line (RESEARCH.md §7.1) — see
 * `test/calibration.test.ts`, which is this package's port of the old
 * build's `qa/calib.js` discipline.
 */
import type { Player } from "./player.js";
import type { LevelEnv } from "./levels.js";
import { baFrom, expectedOver, hrFrom } from "./grades.js";
import { clamp, nz } from "./util.js";

export interface BatterRates {
  bb: number;
  so: number;
  hr: number;
  bab: number;
  spd: number;
  f2: number;
  f3: number;
}

export interface PitcherRates {
  bb: number;
  so: number;
  hr: number;
  bab: number;
  /** Outs a starter is trusted for, from stamina. */
  bud: number;
}

export type Rates = BatterRates | PitcherRates;

export function isPitcherRates(r: Rates): r is PitcherRates {
  return "bud" in r;
}

/**
 * True (not scouted) per-PA/per-BF rates for one player, from his true
 * grades, the level environment, and the population centre/spread used to
 * correct for Jensen's inequality (levels.ts's `Level.c`/`Level.s`, or an
 * independent league's `ILVL` entry). `sd` defaults to the same
 * `sqrt(s*s+36)` the old build used to fold in makePlayer's own per-tool
 * noise (the 6-point-SD draw around `base` in `makePlayer()`) on top of the
 * population spread.
 */
export function rateProfile(p: Player, env: LevelEnv, centre: number, sd: number): Rates {
  const t = p.tru;
  if (p.role === "P") {
    const stf = nz(t.stf);
    const ctl = nz(t.ctl);
    const mov = nz(t.mov);
    const sta = nz(t.sta);
    const so9 = clamp(env.so9 * (1 + (stf - centre) * 0.03), 2, 16);
    const bb9 = clamp(env.bb9 * (1 - (ctl - centre) * 0.03), 0.7, 9.5);
    const hr9 = clamp(env.hr9 * (1 - (mov - centre) * 0.025), 0.05, 3.2);
    const pitcherRates: PitcherRates = {
      bb: clamp(bb9 / env.bf9, 0.005, 0.3),
      so: clamp(so9 / env.bf9, 0.02, 0.55),
      hr: clamp(hr9 / env.bf9, 0.001, 0.1),
      bab: clamp(env.babip * (1 - (stf - centre) * 0.004), 0.2, 0.4),
      bud: Math.round(clamp(15.6 + (sta - centre) * 0.2, 9, 22)),
    };
    return pitcherRates;
  }

  const eye = nz(t.eye);
  const pow = nz(t.pow);
  const hit = nz(t.hit);
  const spd = nz(t.spd);

  const bb = clamp(env.bb * (1 + (eye - centre) * 0.022), 0.008, 0.28);
  const so = clamp(env.k * (1 - (eye - centre) * 0.015), 0.03, 0.45);

  const hrScale = env.hr600 / expectedOver(hrFrom, "hr", centre, sd || 10);
  const hr = clamp((hrFrom(pow) * hrScale) / 600, 0.0005, 0.13);

  const baScale = env.ba / expectedOver(baFrom, "ba", centre, sd || 10);
  const ba = clamp(baFrom(hit) * baScale, 0.12, 0.4);

  const abF = 1 - bb - env.hbp - 0.008;
  // Solve the BABIP that puts batting average where the hit grade says, given this player's own BB/K/HR rates.
  const bab = clamp((ba * abF - hr) / Math.max(1e-6, abF - so - hr), 0.18, 0.43);

  const batterRates: BatterRates = {
    bb,
    so,
    hr,
    bab,
    spd: clamp(spd, 20, 80),
    f2: clamp(env.f2 * (1 + (pow - centre) * 0.004), 0.05, 0.45),
    f3: clamp(env.f3 * (1 + (spd - centre) * 0.012), 0.002, 0.12),
  };
  return batterRates;
}
