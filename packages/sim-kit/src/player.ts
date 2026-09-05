/**
 * Players — LAWS.md Law 10: hidden truth, noisy estimates. Ported from
 * bush-league-v0.10.html's `makePlayer()`, the derived-stat formulas, and
 * the trait/position constants.
 *
 * Adaptation from the original, noted rather than silent: the old build
 * read `G.club.lvl`/`G.club.lg` as an implicit fallback inside `WARof()`/
 * `opsPlus()`/`eraPlus()` when a player's own level was missing. This port
 * has no hidden global `G` (see ledger.ts's own note) — callers pass the
 * `LevelEnv` explicitly. Behaviourally identical once a real env is passed;
 * just no implicit global read.
 */
import type { Rng } from "./rng.js";
import { gauss, pick } from "./rng.js";
import { genName } from "./names.js";
import type { Level, LevelEnv } from "./levels.js";
import { clamp, nz, round2 } from "./util.js";

export const POS = ["C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"] as const;
export type Position = (typeof POS)[number];

export const BAT_TOOLS = ["hit", "pow", "eye", "spd", "def", "arm"] as const;
export const PIT_TOOLS = ["stf", "mov", "ctl", "sta", "dur"] as const;
export type BatTool = (typeof BAT_TOOLS)[number];
export type PitTool = (typeof PIT_TOOLS)[number];
export type Tool = BatTool | PitTool;

export const TOOL_LABEL: Record<Tool, string> = {
  hit: "Hit", pow: "Power", eye: "Eye", spd: "Speed", def: "Field", arm: "Arm",
  stf: "Stuff", mov: "Movement", ctl: "Control", sta: "Stamina", dur: "Durability",
};

export type Role = "B" | "P";
export type Bats = "R" | "L" | "S";
export type Throws = "R" | "L";
export type RosterStatus = "ACT" | "IL" | "AFF" | "FA";

/** True grades, 20-80 scale, per Law 10 never shown directly to the owner. */
export type TrueGrades = Partial<Record<Tool, number>>;

/** Counting stats only — every rate is computed on read (`playerStats.ts`), never stored. */
export type PlayerStats = Record<string, number>;

export interface Player {
  id: string;
  fn: string;
  ln: string;
  nm: string;
  role: Role;
  pos: Position | "SP" | "RP";
  age: number;
  b: Bats;
  t: Throws;
  ht: number;
  wt: number;
  tru: TrueGrades;
  /** This player's own fixed scouting-noise seed — deterministic, so grades never shimmer between renders. */
  ns: number;
  rel: number;
  ovr: number;
  pot: number;
  num: number;
  sal: number;
  /** Monthly salary — only meaningful for independent-league contracts (`contractFor`), 0 elsewhere. */
  mo: number;
  yrs: number;
  tot: number;
  svc: number;
  opt: number;
  status: RosterStatus;
  inj: string;
  days: number;
  lvl?: string;
  cid?: string;
  st: PlayerStats;
}

export interface MakePlayerOptions {
  ident?: [string, string];
  /** Override the level's own centre/spread — used by independent-league talent centres (levels.ts's ILVL). */
  spec?: Pick<Level, "c" | "s">;
  /**
   * An explicit, caller-guaranteed-unique id. Every real creation site in
   * the game passes one; the random fallback below exists only for tests
   * and one-off generation where the id is never read.
   *
   * DECISIONS.md D97: the fallback scheme (`Math.floor(r()*1e9)`) draws from
   * ~1e9 values, which is NOT enough. Measured directly, not theorised:
   * 50,000 generated players collide once, 100,000 collide four times,
   * matching the birthday-paradox prediction (~1.25 and ~5.00). A real
   * sandbox save mints roughly 1,600 players a year — 600 draft picks plus
   * churn across 218 clubs — so a century-long save passes 160,000 and
   * collides a dozen-plus times. A collision is silent corruption, not a
   * crash: `advance.ts` keys players by id into a Map, so one player simply
   * overwrites another, and lineups and draft records point at the survivor.
   */
  id?: string;
}

/**
 * Generates one player's TRUE grades from a level's talent centre, per Law
 * 10 the only place in the game a true grade is ever produced. Ported
 * 1:1 from `makePlayer()` — same Gaussian draw, same id/name/bats/throws
 * distributions.
 */
export function makePlayer(
  r: Rng,
  level: Level,
  role: Role,
  age: number,
  opts: MakePlayerOptions = {},
): Player {
  const spec = opts.spec ?? level;
  const tools: readonly Tool[] = role === "P" ? PIT_TOOLS : BAT_TOOLS;
  const base = spec.c + gauss(r) * spec.s;
  const tru: TrueGrades = {};
  for (const k of tools) tru[k] = clamp(Math.round(base + gauss(r) * 6), 20, 80);

  const [fn, ln] = opts.ident ?? genName(r);
  const bats: Bats = role === "P" ? (r() < 0.72 ? "R" : "L") : r() < 0.62 ? "R" : r() < 0.92 ? "L" : "S";
  const throwsHand: Throws = role === "P" ? (r() < 0.72 ? "R" : "L") : r() < 0.88 ? "R" : "L";
  const pos: Position | "SP" | "RP" = role === "P" ? (r() < 0.55 ? "SP" : "RP") : pick(POS, r);

  // Drawn unconditionally, and BEFORE the return, so the RNG stream is
  // consumed identically whether or not the caller supplied an id. Letting
  // `??` short-circuit the draw would silently shift every subsequent value
  // and regenerate a different world from the same seed — which would break
  // save-reproducibility (D85), the property this engine is proudest of.
  const fallbackId = `p${Math.floor(r() * 1e9).toString(36)}`;

  return {
    id: opts.id ?? fallbackId,
    fn,
    ln,
    nm: `${fn.charAt(0)}. ${ln}`,
    role,
    pos,
    age,
    b: bats,
    t: throwsHand,
    ht: Math.round(69 + r() * 9),
    wt: Math.round(180 + r() * 55),
    tru,
    ns: Math.floor(r() * 2147483646) + 1,
    rel: 0.2,
    ovr: 50,
    pot: 50,
    num: 0,
    sal: 0,
    mo: 0,
    yrs: 0,
    tot: 0,
    svc: 0,
    opt: 0,
    status: "ACT",
    inj: "",
    days: 0,
    st: {},
  };
}

// ---- Derived statistics — counting stats produced by the (not-yet-ported) sim, rates computed on read. ----

const stat = (p: Player, k: string): number => nz(p.st[k]);

export const IPof = (p: Player): number => stat(p, "outs") / 3;
export const ERAof = (p: Player): number => (stat(p, "outs") ? (stat(p, "er") * 27) / stat(p, "outs") : 0);
export const WHIPof = (p: Player): number =>
  stat(p, "outs") ? ((stat(p, "ph") + stat(p, "pbb")) * 3) / stat(p, "outs") : 0;
export const BAof = (p: Player): number => (stat(p, "ab") ? stat(p, "h") / stat(p, "ab") : 0);
export const OBPof = (p: Player): number =>
  stat(p, "pa") ? (stat(p, "h") + stat(p, "bb") + stat(p, "hbp")) / stat(p, "pa") : 0;
export const TBof = (p: Player): number => stat(p, "h") + stat(p, "d2") + 2 * stat(p, "d3") + 3 * stat(p, "hr");
export const SLGof = (p: Player): number => (stat(p, "ab") ? TBof(p) / stat(p, "ab") : 0);
export const OPSof = (p: Player): number => OBPof(p) + SLGof(p);
export const K9of = (p: Player): number => (stat(p, "outs") ? (stat(p, "pso") * 27) / stat(p, "outs") : 0);
export const BB9of = (p: Player): number => (stat(p, "outs") ? (stat(p, "pbb") * 27) / stat(p, "outs") : 0);

export function warOf(p: Player, env: LevelEnv): number {
  if (p.role === "P") {
    const ip = IPof(p);
    if (!ip) return 0;
    const rep = env.era * 1.22;
    const span = Math.max(0.15, rep - env.era);
    return round2(clamp(((rep - ERAof(p)) / span) * 2.0 * (ip / 180), -3, 11));
  }
  const pa = stat(p, "pa");
  if (!pa) return 0;
  const rep = env.ops * 0.86;
  const span = Math.max(0.02, env.ops - rep);
  return round2(clamp(((OPSof(p) - rep) / span) * 2.0 * (pa / 600), -3, 11));
}

export function opsPlus(p: Player, env: LevelEnv): number {
  if (!stat(p, "pa")) return 0;
  return Math.round(100 * (OBPof(p) / env.obp + SLGof(p) / env.slg - 1));
}

export function eraPlus(p: Player, env: LevelEnv): number {
  const era = ERAof(p);
  return era > 0 ? Math.round((100 * env.era) / era) : 0;
}
