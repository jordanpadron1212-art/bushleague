/**
 * Roster construction — legal-by-construction checks matching the original
 * build's own discipline: a composition plan is built to spec, not
 * drawn-and-repaired, so what's worth testing is that the spec was actually
 * honoured (every age/service year lands inside its published range, every
 * indy payroll lands exactly on its league's real cap), not that a repair
 * loop eventually converged.
 */
import { describe, expect, it } from "vitest";
import { mulberry32 } from "../src/rng.js";
import { buildWorld, type Club } from "../src/world.js";
import { INDY, indyLeague } from "../src/world-data.js";
import {
  clsOf,
  rosterPlan,
  intIn,
  contractFor,
  buildRosters,
  chartWorld,
  ROSTER_N,
  OWNED_N,
} from "../src/roster.js";

function clubsFor(all: readonly Club[], lvl: string, lg?: string): Club[] {
  return all.filter((c) => c.lvl === lvl && (lg === undefined || c.lg === lg));
}

describe("intIn — inclusive integer draw", () => {
  it("never returns a value outside [lo, hi], for 10,000 draws", () => {
    const r = mulberry32(1);
    for (let i = 0; i < 10_000; i++) {
      const v = intIn(r, 27, 29);
      expect(v).toBeGreaterThanOrEqual(27);
      expect(v).toBeLessThanOrEqual(29);
    }
  });
  it("reaches both endpoints over enough draws", () => {
    const r = mulberry32(2);
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) seen.add(intIn(r, 5, 7));
    expect(seen).toEqual(new Set([5, 6, 7]));
  });
});

describe("clsOf — indy classification, RESEARCH.md §9.1's published rules", () => {
  it("is empty for a non-independent club", () => {
    expect(clsOf("MLB", "AL", { age: 27, svc: 3 })).toBe("");
  });
  it("Frontier League — age bands", () => {
    expect(clsOf("INDY", "Frontier League", { age: 22, svc: 0 })).toBe("Pro-1");
    expect(clsOf("INDY", "Frontier League", { age: 25, svc: 0 })).toBe("Pro-2");
    expect(clsOf("INDY", "Frontier League", { age: 26, svc: 0 })).toBe("Exp-1");
    expect(clsOf("INDY", "Frontier League", { age: 28, svc: 0 })).toBe("Exp-2");
    expect(clsOf("INDY", "Frontier League", { age: 32, svc: 0 })).toBe("Veteran");
  });
  it("American Association — service years, with the Sep-1 age override at 6+ years", () => {
    expect(clsOf("INDY", "American Association", { age: 22, svc: 0 })).toBe("Rookie");
    expect(clsOf("INDY", "American Association", { age: 24, svc: 3 })).toBe("LS-3");
    expect(clsOf("INDY", "American Association", { age: 22, svc: 7 })).toBe("LS-3");
    expect(clsOf("INDY", "American Association", { age: 25, svc: 7 })).toBe("LS-4");
    expect(clsOf("INDY", "American Association", { age: 30, svc: 7 })).toBe("Veteran");
  });
  it("Pioneer League — year in the league, capped at 4th year", () => {
    expect(clsOf("INDY", "Pioneer League", { age: 20, svc: 0 })).toBe("1st yr");
    expect(clsOf("INDY", "Pioneer League", { age: 23, svc: 3 })).toBe("4th yr");
    expect(clsOf("INDY", "Pioneer League", { age: 23, svc: 9 })).toBe("4th yr");
  });
  it("Pecos League — age 24 cutoff", () => {
    expect(clsOf("INDY", "Pecos League", { age: 24, svc: 0 })).toBe("Rookie");
    expect(clsOf("INDY", "Pecos League", { age: 25, svc: 0 })).toBe("Veteran");
  });
  it("Atlantic League publishes no class — the em dash", () => {
    expect(clsOf("INDY", "Atlantic League", { age: 30, svc: 5 })).toBe("—");
  });
});

describe("rosterPlan", () => {
  it("is null for a non-independent club", () => {
    const r = mulberry32(3);
    expect(rosterPlan({ lvl: "MLB", lg: "AL" }, r)).toBeNull();
  });
  it("for every independent league, the plan's length and per-class counts match the league's own published comp table", () => {
    const r = mulberry32(4);
    for (const league of INDY) {
      const plan = rosterPlan({ lvl: "INDY", lg: league.name }, r)!;
      expect(plan).not.toBeNull();
      const total = league.comp.reduce((t, row) => t + row.n, 0);
      expect(plan.length).toBe(total);
      const counts = new Map<string, number>();
      for (const row of plan) counts.set(row.k, (counts.get(row.k) ?? 0) + 1);
      for (const row of league.comp) expect(counts.get(row.k)).toBe(row.n);
    }
  });
});

describe("buildRosters — legal by construction", () => {
  const world = buildWorld();

  it("a non-independent club gets its plain roster size, or the bigger owned size when it's the owner's own club", () => {
    const mlb = clubsFor(world, "MLB").slice(0, 3);
    const r = mulberry32(10);
    const players = buildRosters(mlb, r, mlb[0]!.id);
    expect(players.filter((p) => p.cid === mlb[0]!.id)).toHaveLength(OWNED_N.MLB!);
    expect(players.filter((p) => p.cid === mlb[1]!.id)).toHaveLength(ROSTER_N.MLB!);
  });

  it("an independent club's roster size is set by its league's comp table regardless of ownership", () => {
    const frontier = clubsFor(world, "INDY", "Frontier League")[0]!;
    const r = mulberry32(11);
    const owned = buildRosters([frontier], r, frontier.id);
    const notOwned = buildRosters([frontier], mulberry32(11), undefined);
    const expectedN = indyLeague("Frontier League")!.comp.reduce((t, row) => t + row.n, 0);
    expect(owned).toHaveLength(expectedN);
    expect(notOwned).toHaveLength(expectedN);
  });

  it("every generated player carries the club id and level it was built for", () => {
    const some = [...clubsFor(world, "AA").slice(0, 2), ...clubsFor(world, "INDY", "Pecos League").slice(0, 1)];
    const players = buildRosters(some, mulberry32(12));
    for (const c of some) {
      const mine = players.filter((p) => p.cid === c.id);
      expect(mine.length).toBeGreaterThan(0);
      for (const p of mine) expect(p.lvl).toBe(c.lvl);
    }
  });

  it("uniform numbers are unique within a club", () => {
    const mlb = clubsFor(world, "MLB").slice(0, 5);
    const players = buildRosters(mlb, mulberry32(13));
    for (const c of mlb) {
      const nums = players.filter((p) => p.cid === c.id).map((p) => p.num);
      expect(new Set(nums).size).toBe(nums.length);
    }
  });

  it("every independent league: every player's age and service year lands inside its class's published range", () => {
    const r = mulberry32(14);
    for (const league of INDY) {
      const clubs = clubsFor(world, "INDY", league.name).slice(0, 2);
      const players = buildRosters(clubs, r);
      for (const p of players) {
        // At least one comp row must accept this exact (age, svc) pair — we
        // don't know which row generated a given player after the shuffle,
        // so check that SOME row's range covers him.
        const fits = league.comp.some(
          (row) => p.age >= row.age[0] && p.age <= row.age[1] && p.svc >= row.svc[0] && p.svc <= row.svc[1],
        );
        expect(fits, `${league.name}: age ${p.age}/svc ${p.svc} fits no published comp row`).toBe(true);
      }
    }
  });

  it("every independent club's total payroll lands exactly on its league's published cap (residual rounding absorbed by the best-paid man)", () => {
    const r = mulberry32(15);
    for (const league of INDY) {
      if (!league.cap) continue;
      const club = clubsFor(world, "INDY", league.name)[0]!;
      const players = buildRosters([club], r);
      const total = players.reduce((t, p) => t + p.sal, 0);
      expect(total).toBe(league.cap);
    }
  });

  it("MLB contracts scale with scouted overall and stay within a plausible range", () => {
    const mlb = clubsFor(world, "MLB")[0]!;
    const players = buildRosters([mlb], mulberry32(16));
    for (const p of players) {
      expect(p.sal).toBeGreaterThanOrEqual(700000);
      expect(p.sal).toBeLessThanOrEqual(32_000_000);
    }
    const sorted = [...players].sort((a, b) => a.ovr - b.ovr);
    expect(sorted[0]!.sal).toBeLessThanOrEqual(sorted[sorted.length - 1]!.sal);
  });

  it("the Pecos League prices players far below the other independent leagues, per its own published $50/week rule", () => {
    const pecos = clubsFor(world, "INDY", "Pecos League")[0]!;
    const frontier = clubsFor(world, "INDY", "Frontier League")[0]!;
    const pecosPlayers = buildRosters([pecos], mulberry32(17));
    const frontierPlayers = buildRosters([frontier], mulberry32(17));
    const avg = (ps: typeof pecosPlayers) => ps.reduce((t, p) => t + p.sal, 0) / ps.length;
    expect(avg(pecosPlayers)).toBeLessThan(avg(frontierPlayers) / 4);
  });
});

describe("chartWorld — depth charts", () => {
  const world = buildWorld();

  it("every MLB club charts a full lineup (9), a rotation, and a bullpen from its own roster, sorted best-first", () => {
    const mlb = clubsFor(world, "MLB").slice(0, 4);
    const players = buildRosters(mlb, mulberry32(20));
    const charts = chartWorld(mlb, players);
    const byId = new Map(players.map((p) => [p.id, p] as const));
    for (const c of mlb) {
      const chart = charts.get(c.id)!;
      expect(chart.lineup).toHaveLength(9);
      expect(chart.rot.length).toBeGreaterThanOrEqual(1);
      expect(chart.rot.length).toBeLessThanOrEqual(5);
      expect(chart.pen.length).toBeGreaterThanOrEqual(1);
      const lineupOvrs = chart.lineup.map((id) => byId.get(id)!.ovr);
      for (let i = 1; i < lineupOvrs.length; i++) expect(lineupOvrs[i]!).toBeLessThanOrEqual(lineupOvrs[i - 1]!);
    }
  });

  it("a club with at least one player of each role never comes back with an empty lineup, rotation or bullpen", () => {
    const clubs = [
      ...clubsFor(world, "A").slice(0, 1),
      ...clubsFor(world, "INDY", "Pioneer League").slice(0, 1),
    ];
    const players = buildRosters(clubs, mulberry32(21));
    const charts = chartWorld(clubs, players);
    for (const c of clubs) {
      const chart = charts.get(c.id)!;
      expect(chart.lineup.length).toBeGreaterThan(0);
      expect(chart.rot.length).toBeGreaterThan(0);
      expect(chart.pen.length).toBeGreaterThan(0);
    }
  });

  it("a player on the injured list is excluded from every chart", () => {
    const club = clubsFor(world, "MLB")[0]!;
    const players = buildRosters([club], mulberry32(22));
    players[0]!.status = "IL";
    const charts = chartWorld([club], players);
    const chart = charts.get(club.id)!;
    expect(chart.lineup).not.toContain(players[0]!.id);
    expect(chart.rot).not.toContain(players[0]!.id);
    expect(chart.pen).not.toContain(players[0]!.id);
  });
});

describe("contractFor — determinism", () => {
  it("the same seed produces the same contract", () => {
    const world = buildWorld();
    const club = clubsFor(world, "MLB")[0]!;
    const players = buildRosters([club], mulberry32(30));
    const rerun = buildRosters([club], mulberry32(30));
    expect(players.map((p) => p.sal)).toEqual(rerun.map((p) => p.sal));
    void contractFor; // exercised transitively above; imported directly to keep the export's own signature checked by the type system.
  });
});
