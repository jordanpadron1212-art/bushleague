/**
 * World generation — proves the real structure assembles correctly and
 * that the two defect classes DECISIONS.md records against this exact code
 * (D28's colliding ids, the Sioux City/Sioux Falls abbreviation collision)
 * stay fixed.
 */
import { describe, expect, it } from "vitest";
import { buildWorld } from "../src/world.js";
import { MLB, MILB, INDY } from "../src/world-data.js";

describe("buildWorld()", () => {
  const clubs = buildWorld();

  it("generates the real total: 30 MLB + 120 affiliated + 68 independent", () => {
    const mlbCount = MLB.length;
    const milbCount = Object.values(MILB).reduce(
      (t, lvl) => t + lvl.leagues.reduce((s, [, cities]) => s + cities.length, 0),
      0,
    );
    const indyCount = INDY.reduce((t, lg) => t + lg.divs.reduce((s, [, cities]) => s + cities.length, 0), 0);
    expect(mlbCount).toBe(30);
    expect(milbCount).toBe(120);
    expect(indyCount).toBe(68);
    expect(clubs).toHaveLength(mlbCount + milbCount + indyCount);
  });

  it("every club id is globally unique (DECISIONS.md D28)", () => {
    const ids = clubs.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("MLB splits 15 AL / 15 NL, 5 clubs in each of 6 divisions", () => {
    const mlb = clubs.filter((c) => c.lvl === "MLB");
    expect(mlb).toHaveLength(30);
    expect(mlb.filter((c) => c.lg === "AL")).toHaveLength(15);
    expect(mlb.filter((c) => c.lg === "NL")).toHaveLength(15);
    const byDiv = new Map<string, number>();
    for (const c of mlb) byDiv.set(`${c.lg} ${c.div}`, (byDiv.get(`${c.lg} ${c.div}`) ?? 0) + 1);
    expect(byDiv.size).toBe(6);
    for (const count of byDiv.values()) expect(count).toBe(5);
  });

  it("each affiliated level generates exactly 30 clubs", () => {
    for (const lvl of ["AAA", "AA", "HIA", "A"] as const) {
      expect(clubs.filter((c) => c.lvl === lvl)).toHaveLength(30);
    }
  });

  it("each independent league generates its published club count", () => {
    const byLeague = { "Atlantic League": 10, "American Association": 12, "Frontier League": 18, "Pioneer League": 12, "Pecos League": 16 };
    for (const [lg, n] of Object.entries(byLeague)) {
      expect(clubs.filter((c) => c.lvl === "INDY" && c.lg === lg)).toHaveLength(n);
    }
  });

  it("Sioux City and Sioux Falls (both American Association West) get distinct abbreviations — the D-catalogued Law 14 defect", () => {
    const siouxCity = clubs.find((c) => c.city === "Sioux City");
    const siouxFalls = clubs.find((c) => c.city === "Sioux Falls");
    expect(siouxCity).toBeDefined();
    expect(siouxFalls).toBeDefined();
    expect(siouxCity!.abbr).not.toBe(siouxFalls!.abbr);
  });

  it("abbreviations are unique within every league pool", () => {
    const byPool = new Map<string, string[]>();
    for (const c of clubs) {
      const key = c.lvl === "MLB" ? "MLB" : `${c.lvl}|${c.lg}`;
      const list = byPool.get(key) ?? [];
      list.push(c.abbr);
      byPool.set(key, list);
    }
    for (const [pool, abbrs] of byPool) {
      expect(new Set(abbrs).size, `duplicate abbreviation in ${pool}: ${abbrs.join(",")}`).toBe(abbrs.length);
    }
  });

  it("no club has an empty abbreviation", () => {
    expect(clubs.every((c) => c.abbr.length > 0)).toBe(true);
  });

  it("Grand Junction appears in both the Pioneer and Pecos Leagues without colliding (a real published source conflict, kept visible per world-data.ts's own note)", () => {
    const matches = clubs.filter((c) => c.city === "Grand Junction");
    expect(matches).toHaveLength(2);
    expect(new Set(matches.map((c) => c.lg)).size).toBe(2);
    expect(new Set(matches.map((c) => c.id)).size).toBe(2);
  });

  it("two independent worlds don't leak id counters into each other", () => {
    const worldA = buildWorld();
    const worldB = buildWorld();
    expect(worldA.map((c) => c.id)).toEqual(worldB.map((c) => c.id));
  });
});

describe("buildWorld() — real MLB parent-club affiliation (RESEARCH.md §2.6, DECISIONS.md D91)", () => {
  const clubs = buildWorld();
  const mlbIds = new Set(clubs.filter((c) => c.lvl === "MLB").map((c) => c.id));

  it("MLB and independent-league clubs have no parent of their own", () => {
    for (const c of clubs) {
      if (c.lvl === "MLB" || c.lvl === "INDY") expect(c.parent).toBeUndefined();
    }
  });

  it("119 of 120 affiliated clubs get a real, valid MLB parent id — every one pointing at an actual MLB club generated in this SAME world, not a dangling reference", () => {
    const affiliated = clubs.filter((c) => c.lvl !== "MLB" && c.lvl !== "INDY");
    expect(affiliated).toHaveLength(120);
    const withParent = affiliated.filter((c) => c.parent != null);
    expect(withParent).toHaveLength(119);
    for (const c of withParent) {
      expect(mlbIds.has(c.parent!), `${c.city} (${c.lvl}) points at unknown parent ${c.parent}`).toBe(true);
    }
  });

  it("the one disclosed exception is exactly 'Hill City' at Single-A, not a silent, unexplained gap elsewhere", () => {
    const unparented = clubs.filter((c) => c.lvl !== "MLB" && c.lvl !== "INDY" && c.parent == null);
    expect(unparented).toHaveLength(1);
    expect(unparented[0]!.city).toBe("Hill City");
    expect(unparented[0]!.lvl).toBe("A");
  });

  it("every one of the 30 MLB clubs owns EXACTLY one affiliate at each of AAA/AA/High-A/Single-A — RESEARCH.md §2.1's own published structural rule, not just a plausible spread", () => {
    for (const mlb of clubs.filter((c) => c.lvl === "MLB")) {
      for (const lvl of ["AAA", "AA", "HIA"] as const) {
        // Single-A is the one level with a real, disclosed exception
        // (Hill City has no parent at all), so it can't be asserted at
        // exactly 1 for every org — checked separately below instead.
        const owned = clubs.filter((c) => c.lvl === lvl && c.parent === mlb.id);
        expect(owned, `${mlb.city} ${mlb.name} should own exactly one ${lvl} affiliate`).toHaveLength(1);
      }
    }
    const aOwners = clubs.filter((c) => c.lvl === "A" && c.parent != null).map((c) => c.parent);
    // 29 of 30 MLB orgs get exactly one Single-A affiliate; the 30th (whichever
    // org would have owned "Hill City") legitimately gets zero here, not two.
    const counts = new Map<string, number>();
    for (const p of aOwners) counts.set(p!, (counts.get(p!) ?? 0) + 1);
    expect(counts.size).toBe(29);
    for (const n of counts.values()) expect(n).toBe(1);
  });
});
