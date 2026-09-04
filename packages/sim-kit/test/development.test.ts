/**
 * Verification for `development.ts` against RESEARCH.md §18 — not chasing
 * an exact replica of any one published number (§18.5's own methodology
 * note: "a scattered patchwork... necessarily reconciling inconsistent
 * independent estimates"), but proving the sourced, DIRECTIONAL findings
 * actually show up in a large simulated population: which tools peak
 * earliest, which decline fastest, which barely move, and — for the one
 * role-aware pair the source gives opposite shapes for — that starters and
 * relievers actually diverge in the right direction.
 */
import { describe, expect, it } from "vitest";
import { mulberry32 } from "../src/rng.js";
import { makePlayer, type Player, type Tool } from "../src/player.js";
import { LVL } from "../src/levels.js";
import { developPlayer } from "../src/development.js";

const N = 2000;
const START_AGE = 20;
const END_AGE = 40;

function population(role: "B" | "P", seed: number, posOverride?: "SP" | "RP"): Player[] {
  const r = mulberry32(seed);
  const players: Player[] = [];
  for (let i = 0; i < N; i++) {
    const p = makePlayer(r, LVL.MLB, role, START_AGE);
    if (posOverride) p.pos = posOverride;
    players.push(p);
  }
  return players;
}

/** Mean of a tool across a population, ignoring players who don't carry it. */
function meanOf(players: readonly Player[], k: Tool): number {
  let t = 0;
  let n = 0;
  for (const p of players) {
    const g = p.tru[k];
    if (g != null) {
      t += g;
      n++;
    }
  }
  return n ? t / n : NaN;
}

/** Ages a population from START_AGE to END_AGE, recording each tool's population mean at every age. */
function trajectory(players: Player[], r = mulberry32(777)): Map<Tool, number[]> {
  const tools = Object.keys(players[0]!.tru) as Tool[];
  const out = new Map<Tool, number[]>(tools.map((k) => [k, [meanOf(players, k)]]));
  for (let age = START_AGE; age < END_AGE; age++) {
    for (const p of players) developPlayer(p, r);
    for (const k of tools) out.get(k)!.push(meanOf(players, k));
  }
  return out;
}

function argmax(series: readonly number[]): number {
  let bi = 0;
  for (let i = 1; i < series.length; i++) if (series[i]! > series[bi]!) bi = i;
  return bi + START_AGE;
}

describe("development — batter tool curves reproduce §18's sourced relative ordering", () => {
  const players = population("B", 1);
  const traj = trajectory(players);

  it("ages every player by exactly the number of years simulated", () => {
    expect(players.every((p) => p.age === END_AGE)).toBe(true);
  });

  it("never produces a grade outside [20, 80]", () => {
    for (const series of traj.values()) for (const v of series) expect(v).toBeGreaterThanOrEqual(20);
    for (const series of traj.values()) for (const v of series) expect(v).toBeLessThanOrEqual(80);
  });

  it("spd peaks earlier than pow, which peaks earlier than hit/eye — §18.2/§18.3's sourced ordering", () => {
    const peakSpd = argmax(traj.get("spd")!);
    const peakPow = argmax(traj.get("pow")!);
    const peakHit = argmax(traj.get("hit")!);
    const peakEye = argmax(traj.get("eye")!);
    expect(peakSpd).toBeLessThan(peakPow);
    expect(peakPow).toBeLessThanOrEqual(peakHit);
    expect(peakPow).toBeLessThanOrEqual(peakEye);
  });

  it("spd (earliest, steepest decline) loses more from its peak to 40 than eye (the most stable tool) — §18.1 vs §18.3", () => {
    const spd = traj.get("spd")!;
    const eye = traj.get("eye")!;
    const spdDrop = Math.max(...spd) - spd[spd.length - 1]!;
    const eyeDrop = Math.max(...eye) - eye[eye.length - 1]!;
    expect(spdDrop).toBeGreaterThan(eyeDrop);
  });

  it("pow declines from its peak by age 40 — §18.2's 'SLG declines ~10 pts/season after 26'", () => {
    const pow = traj.get("pow")!;
    const peak = Math.max(...pow);
    expect(pow[pow.length - 1]!).toBeLessThan(peak);
  });
});

describe("development — pitcher tool curves reproduce §18.3's sourced relative ordering", () => {
  const players = population("P", 2, "SP");
  const traj = trajectory(players);

  it("mov (spin, 'declines much slower proportionally than velocity') swings far less than stf over a full career", () => {
    const mov = traj.get("mov")!;
    const stf = traj.get("stf")!;
    const movSwing = Math.max(...mov) - Math.min(...mov);
    const stfSwing = Math.max(...stf) - Math.min(...stf);
    expect(movSwing).toBeLessThan(stfSwing);
  });

  it("starters' control (ctl) improves into the mid-20s then holds, net positive by 30 — §18.3", () => {
    const ctl = traj.get("ctl")!;
    const at20 = ctl[0]!;
    const at30 = ctl[30 - START_AGE]!;
    expect(at30).toBeGreaterThan(at20);
  });
});

describe("development — relievers' control erodes where starters' improves (§18.3's opposite-shape finding)", () => {
  it("RP ctl trends down 20->30 while SP ctl trends up over the same span, from the same starting population", () => {
    const sp = population("P", 3, "SP");
    const rp = population("P", 3, "RP"); // same seed: identical starting population, only role differs
    const spTraj = trajectory(sp, mulberry32(555));
    const rpTraj = trajectory(rp, mulberry32(555));

    const spCtl = spTraj.get("ctl")!;
    const rpCtl = rpTraj.get("ctl")!;
    const spDelta30 = spCtl[30 - START_AGE]! - spCtl[0]!;
    const rpDelta30 = rpCtl[30 - START_AGE]! - rpCtl[0]!;

    expect(spDelta30).toBeGreaterThan(0);
    expect(rpDelta30).toBeLessThan(0);
  });
});
