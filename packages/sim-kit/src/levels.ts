/**
 * League environments — RESEARCH.md §7, Tier 1. Ported verbatim from
 * bush-league-v0.10.html's `LVL` table: the published 2025 batting and
 * pitching lines for MLB and the four full-season affiliated levels. MLB is
 * from Baseball-Reference's year-by-year pages; the affiliated levels are
 * aggregated from MLB Stats API team totals and were verified in the
 * original build by a closed-league identity check (league batting runs ==
 * pitching runs, H == H, HR == HR, SO == SO, BB == BB, PA == BF, all
 * differences exactly zero).
 *
 * THE FINDING THAT MATTERS (RESEARCH.md §7.1, restated because it drives
 * every number below): the run environment is NOT monotonic by level.
 * Triple-A is the most offensive league in affiliated ball, above MLB.
 * Double-A is the lowest-scoring level in professional baseball, below MLB.
 * Scoring then climbs again through High-A and Single-A — on traffic, not
 * power: Single-A has the lowest slugging and roughly half the home runs of
 * Triple-A, with the highest walk rate, the highest hit-by-pitch rate, and
 * 15.2% of its runs unearned. A generator that makes players monotonically
 * worse at every level down the ladder is wrong in a way no playtesting
 * would surface.
 *
 * `c` = the level's talent centre on the 20-80 scale (Tier 3 — a design
 * knob, not published). `s` = the spread (also Tier 3). Everything under
 * `env` is Tier 1.
 */
import { indyLeague } from "./world-data.js";

export type LevelKey = "MLB" | "AAA" | "AA" | "HIA" | "A" | "INDY" | "PECOS";

export interface LevelEnv {
  ba: number;
  hr600: number;
  bb: number;
  k: number;
  hbp: number;
  b2: number;
  b3: number;
  babip: number;
  era: number;
  whip: number;
  h9: number;
  bb9: number;
  so9: number;
  hr9: number;
  ue: number;
  obp: number;
  slg: number;
  ops: number;
  rg: number;
  /** Derived at load time below — never hand-authored, always recomputed from the Tier 1 fields above. */
  hrPA: number;
  abF: number;
  f1: number;
  f2: number;
  f3: number;
  bf9: number;
  /** Present only on a derived (altitude-adjusted) environment, e.g. Pecos. */
  alt?: number;
}

export interface Level {
  c: number;
  s: number;
  att: number;
  g: number;
  env: LevelEnv | null;
}

function deriveEnv(raw: Omit<LevelEnv, "hrPA" | "abF" | "f1" | "f2" | "f3" | "bf9">): LevelEnv {
  const e = { ...raw } as LevelEnv;
  e.hrPA = e.hr600 / 600;
  const abF = 1 - e.bb - e.hbp - 0.008;
  e.abF = abF;
  const hPA = e.ba * abF;
  const nonHR = Math.max(1e-6, hPA - e.hrPA);
  e.f2 = (e.b2 * hPA) / nonHR;
  e.f3 = (e.b3 * hPA) / nonHR;
  e.f1 = Math.max(0, 1 - e.f2 - e.f3);
  e.bf9 = 27 / (1 - e.obp);
  return e;
}

export const LVL: Record<Exclude<LevelKey, "PECOS">, Level> & { PECOS?: Level } = {
  MLB: {
    c: 50, s: 8, att: 29459, g: 162,
    env: deriveEnv({
      ba: 0.245, hr600: 18.53, bb: 0.0841, k: 0.2222, hbp: 0.0105, b2: 0.1929, b3: 0.0156,
      babip: 0.291, era: 4.15, whip: 1.289, h9: 8.4, bb9: 3.2, so9: 8.5, hr9: 1.2, ue: 0.081,
      obp: 0.315, slg: 0.404, ops: 0.719, rg: 4.45,
    }),
  },
  AAA: {
    c: 44, s: 7, att: 5556, g: 150,
    env: deriveEnv({
      ba: 0.258, hr600: 17.22, bb: 0.1093, k: 0.2263, hbp: 0.0131, b2: 0.2005, b3: 0.023,
      babip: 0.314, era: 4.92, whip: 1.475, h9: 8.91, bb9: 4.36, so9: 9.03, hr9: 1.15, ue: 0.096,
      obp: 0.347, slg: 0.421, ops: 0.768, rg: 5.24,
    }),
  },
  AA: {
    c: 40, s: 7, att: 4143, g: 138,
    env: deriveEnv({
      ba: 0.235, hr600: 12.04, bb: 0.1034, k: 0.2347, hbp: 0.0136, b2: 0.1903, b3: 0.0236,
      babip: 0.296, era: 3.92, whip: 1.321, h9: 7.9, bb9: 3.99, so9: 9.05, hr9: 0.77, ue: 0.119,
      obp: 0.323, slg: 0.36, ops: 0.683, rg: 4.29,
    }),
  },
  HIA: {
    c: 36, s: 6, att: 3333, g: 132,
    env: deriveEnv({
      ba: 0.233, hr600: 11.37, bb: 0.1103, k: 0.2367, hbp: 0.0176, b2: 0.1989, b3: 0.027,
      babip: 0.296, era: 4.08, whip: 1.345, h9: 7.81, bb9: 4.3, so9: 9.22, hr9: 0.74, ue: 0.126,
      obp: 0.33, slg: 0.358, ops: 0.688, rg: 4.51,
    }),
  },
  A: {
    c: 33, s: 6, att: 2106, g: 132,
    env: deriveEnv({
      ba: 0.237, hr600: 8.5, bb: 0.1187, k: 0.235, hbp: 0.0188, b2: 0.1845, b3: 0.0307,
      babip: 0.307, era: 4.23, whip: 1.407, h9: 7.96, bb9: 4.7, so9: 9.3, hr9: 0.56, ue: 0.152,
      obp: 0.34, slg: 0.345, ops: 0.685, rg: 4.82,
    }),
  },
  INDY: { c: 34, s: 7, att: 2300, g: 100, env: null },
};

/**
 * No independent league publishes rate statistics, and none is reachable
 * from a primary source (RESEARCH.md §7.3, §9.9). Rather than invent one,
 * each indy league BORROWS the published environment of the affiliated
 * level its roster rules make it resemble — Tier 3 reasoning over Tier 1
 * numbers, disclosed rather than hidden.
 */
export const INDY_PROXY: Record<string, [Exclude<LevelKey, "INDY" | "PECOS">, string]> = {
  "Atlantic League": ["AAA", "No roster rule is published — Rules 10, 11 and 12 are redacted in its public rulebook. Top rung on money and transactions instead. Run environment modelled on Triple-A."],
  "American Association": ["HIA", "A veteran league capped at six 6-year men per roster. Modelled on High-A (RESEARCH §9.4)."],
  "Frontier League": ["HIA", "Age-capped: at least ten players 25-or-under, at most two aged 30+. Modelled on High-A."],
  "Pioneer League": ["A", "No player with more than three years of professional service. Modelled on Single-A — the league's real high-altitude offensive extreme is not captured by this proxy (RESEARCH §9.5)."],
};

/**
 * Talent centres by independent league — RESEARCH.md §9, T3 centres on a
 * sourced shape: contracts purchased per club per season and team salary
 * caps both put the Atlantic League alone at the top, the other three
 * bunched. No talent measurement is published for any independent league.
 */
export const ILVL: Record<string, { c: number; s: number }> = {
  "Atlantic League": { c: 42, s: 7 },
  "American Association": { c: 36, s: 7 },
  "Frontier League": { c: 35, s: 7 },
  "Pioneer League": { c: 34, s: 7 },
  "Pecos League": { c: 30, s: 6 },
};

/**
 * The Pecos environment is DERIVED, not borrowed (RESEARCH.md §9.5) — it
 * sits below the bottom affiliated level and at a real, sourced average
 * elevation the league itself credits for its offense. Coefficients:
 * Eliza Richardson, "High Altitude Offense," SABR Baseball Research
 * Journal, Fall 2014 — 5.61e-4 runs/game/ft and 1.20e-4 HR/game/ft, T1,
 * measured across the Pioneer/Northwest/Appalachian Leagues 2008-2012.
 *
 * Halved for a per-team figure (the coefficients are total runs, both
 * teams — a Coors Field cross-check settles this: reading them per-team
 * would imply roughly +60% at 5,000ft, far outside anything ever measured).
 * Single-A is treated as the sea-level baseline, which is a T3 assumption
 * sitting on a T1 coefficient (real Single-A parks average somewhat above
 * sea level). Elevation, games and attendance are read from `world-data.ts`'s
 * `INDY` table (the league's own published figures, RESEARCH.md §9.7, T1),
 * not duplicated as standalone constants here — the original build's own
 * comment on this exact line: "a second copy of 4870 in this line is
 * exactly the kind of field that goes stale silently when the other one is
 * corrected."
 */
const ALT = {
  rPerFt: 5.61e-4,
  hrPerFt: 1.2e-4,
  src: "SABR Baseball Research Journal, Fall 2014 (Richardson)",
};

/** Base Runs, used only as a ratio against the reference line — its constants cancel, so no run-scoring constant is invented here. */
function bsrPA(e: Pick<LevelEnv, "ba" | "bb" | "hbp" | "hr600" | "b2" | "b3">): number {
  const abF = 1 - e.bb - e.hbp - 0.008;
  const hPA = e.ba * abF;
  const hrPA = e.hr600 / 600;
  const nonHR = Math.max(1e-6, hPA - hrPA);
  const f2 = (e.b2 * hPA) / nonHR;
  const f3 = (e.b3 * hPA) / nonHR;
  const f1 = Math.max(0, 1 - f2 - f3);
  const tb = (f1 + 2 * f2 + 3 * f3) * nonHR + 4 * hrPA;
  const A = hPA + e.bb + e.hbp - hrPA;
  const B = (1.4 * tb - 0.6 * hPA - 3 * hrPA + 0.1 * (e.bb + e.hbp)) * 1.02;
  const C = Math.max(1e-6, abF - hPA);
  return (A * B) / (B + C) + hrPA;
}

export function deriveAltEnv(base: LevelEnv, feet: number): LevelEnv {
  const dR = (ALT.rPerFt * feet) / 2;
  const dHR = (ALT.hrPerFt * feet) / 2;
  const hr9 = base.hr9 + dHR;
  const hr600 = base.hr600 * (hr9 / base.hr9);
  const target = base.rg + dR;

  // Solve the hit-rate multiplier k that puts Base Runs on the sourced run target.
  let lo = 1;
  let hi = 2.5;
  let k = 1;
  for (let i = 0; i < 48; i++) {
    k = (lo + hi) / 2;
    const t = { ...base, hr600, hr9, ba: base.ba * k, babip: base.babip * k };
    if ((base.rg * bsrPA(t)) / bsrPA(base) < target) lo = k;
    else hi = k;
  }
  const ba = base.ba * k;
  const babip = base.babip * k;

  const abF = 1 - base.bb - base.hbp - 0.008;
  const abFb = abF;
  const hPA = ba * abF;
  const hrPA = hr600 / 600;
  const nonHR = Math.max(1e-6, hPA - hrPA);
  const f2 = (base.b2 * hPA) / nonHR;
  const f3 = (base.b3 * hPA) / nonHR;
  const f1 = Math.max(0, 1 - f2 - f3);
  const obp = hPA + base.bb + base.hbp;
  const slg = ((f1 + 2 * f2 + 3 * f3) * nonHR + 4 * hrPA) / abF;

  return {
    ...base,
    hr9,
    hr600,
    ba,
    babip,
    obp,
    slg,
    ops: obp + slg,
    rg: target,
    h9: base.h9 * (ba / base.ba),
    whip: base.whip * ((hPA + base.bb) / (base.ba * abFb + base.bb)),
    era: base.era * (target / base.rg),
    alt: feet,
    hrPA,
    abF,
    f1,
    f2,
    f3,
    bf9: 27 / (1 - obp),
  };
}

const PECOS_LEAGUE = indyLeague("Pecos League");
LVL.PECOS = {
  c: 30,
  s: 6,
  att: PECOS_LEAGUE?.att ?? 400,
  g: PECOS_LEAGUE?.games ?? 54,
  env: deriveAltEnv(LVL.A.env!, PECOS_LEAGUE?.elev ?? 4870),
};

export function envFor(lvl: string, lg?: string): LevelEnv {
  const L = (LVL as Record<string, Level>)[lvl] ?? LVL.INDY;
  if (L.env) return L.env;
  const px = lg ? INDY_PROXY[lg] : undefined;
  return px ? LVL[px[0]].env! : LVL.A.env!;
}

export function envNote(lvl: string, lg?: string): string | null {
  if ((LVL as Record<string, Level>)[lvl]?.env) return null;
  const px = lg ? INDY_PROXY[lg] : undefined;
  return px ? px[1] : "No published environment for this league; modelled on Single-A.";
}
