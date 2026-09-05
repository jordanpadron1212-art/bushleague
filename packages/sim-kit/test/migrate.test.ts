/**
 * Verification for `migrate.ts`.
 *
 * The awkward part of testing a migration framework on day one is that
 * there is nothing to migrate: `SCHEMA_VERSION` is 1 and `MIGRATIONS` is
 * legitimately empty. Testing only what runs today would prove almost
 * nothing — the chain walker, the failure paths, and the version stamping
 * would all ship unexercised until the first real schema change, which is
 * exactly the moment you need them already right.
 *
 * So the chain is driven with SYNTHETIC migrations through `loadStateWith`,
 * and the real registry is checked for the one property that matters about
 * it: that it can actually reach `SCHEMA_VERSION` from every version it
 * claims to support. That last test is the one that fires if someone bumps
 * the version and forgets the migration.
 */
import { describe, expect, it } from "vitest";
import { newGame } from "../src/newgame.js";
import {
  loadState,
  loadStateWith,
  applyMigrations,
  checkShape,
  MIGRATIONS,
  type Migration,
  type RawSave,
} from "../src/migrate.js";
import { SCHEMA_VERSION } from "../src/state.js";

/** A save exactly as it comes back off disk — through JSON, like the real thing. */
function realSave(): RawSave {
  return JSON.parse(JSON.stringify(newGame({ ownedClubId: "MLB_NYY", seed: 3, year: 2026 }))) as RawSave;
}

/** A migration that records that it ran and adds one field. */
const step = (from: number, to: number, field: string): Migration => ({
  from,
  to,
  name: `add ${field}`,
  migrate: (s) => ({ ...s, [field]: true }),
});

describe("loadState — a current save", () => {
  it("loads a real, freshly generated save unchanged, with no migrations applied", () => {
    const result = loadState(realSave());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.applied).toEqual([]);
    expect(result.fromVersion).toBe(SCHEMA_VERSION);
    expect(result.state.world.clubs.length).toBeGreaterThan(200);
    expect(result.state.players.length).toBeGreaterThan(3000);
  });

  it("survives the round trip the real save path actually takes (structuredClone, as IndexedDB uses)", () => {
    const result = loadState(structuredClone(newGame({ ownedClubId: "MLB_NYY", seed: 4, year: 2026 })));
    expect(result.ok).toBe(true);
  });
});

describe("loadState — refusals", () => {
  it.each([
    ["null", null],
    ["undefined", undefined],
    ["a number", 42],
    ["a string", "save"],
    ["an array", [1, 2, 3]],
  ])("refuses %s as not-a-save", (_label, value) => {
    const result = loadState(value);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("not-a-save");
  });

  it.each([
    ["no v at all", {}],
    ["a string v", { v: "1" }],
    ["a fractional v", { v: 1.5 }],
    ["a zero v", { v: 0 }],
    ["a negative v", { v: -1 }],
  ])("refuses a save with %s as no-version", (_label, value) => {
    const result = loadState(value);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("no-version");
  });

  it("refuses a save from a NEWER build rather than attempting to down-migrate it", () => {
    const save = { ...realSave(), v: SCHEMA_VERSION + 5 };
    const result = loadState(save);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("from-the-future");
    expect(result.fromVersion).toBe(SCHEMA_VERSION + 5);
    // The message has to tell the player what to DO, not just what went wrong.
    expect(result.detail).toMatch(/newer version/i);
    // The engine states the problem and the version numbers; the REMEDY is
    // the UI's to phrase (SaveProblemPage), so it must not appear here —
    // saying it in both places printed the same sentence twice on screen.
    expect(result.detail).toContain(`v${SCHEMA_VERSION + 5}`);
    expect(result.detail).not.toMatch(/update the game/i);
  });

  it("refuses a structurally damaged save, and names EVERY missing field rather than the first", () => {
    const save = realSave();
    delete save["players"];
    delete save["ledger"];
    save["seed"] = "not a number";

    const result = loadState(save);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("invalid-result");
    expect(result.detail).toContain("players");
    expect(result.detail).toContain("ledger");
    expect(result.detail).toContain("seed");
  });

  it("catches damage NESTED one level down, which a top-level key check would wave through", () => {
    const save = realSave();
    (save["world"] as RawSave)["clubs"] = "not an array";
    const result = loadState(save);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.detail).toContain("world.clubs");
  });
});

describe("applyMigrations — the chain", () => {
  it("walks several versions in order, applying each exactly once", () => {
    const chain = [step(1, 2, "a"), step(2, 3, "b"), step(3, 4, "c")];
    const out = applyMigrations({ v: 1 }, 1, 4, chain);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.applied).toEqual(["add a", "add b", "add c"]);
    expect(out.save).toMatchObject({ v: 4, a: true, b: true, c: true });
  });

  it("does not care what order the registry is written in — it matches on `from`, not position", () => {
    const shuffled = [step(3, 4, "c"), step(1, 2, "a"), step(2, 3, "b")];
    const out = applyMigrations({ v: 1 }, 1, 4, shuffled);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.applied).toEqual(["add a", "add b", "add c"]);
  });

  it("starts partway up the chain when the save is only one version behind", () => {
    const chain = [step(1, 2, "a"), step(2, 3, "b"), step(3, 4, "c")];
    const out = applyMigrations({ v: 3 }, 3, 4, chain);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.applied).toEqual(["add c"]);
    expect(out.save).not.toHaveProperty("a");
  });

  it("applies nothing at all when the save is already current", () => {
    const out = applyMigrations({ v: 4 }, 4, 4, [step(1, 2, "a")]);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.applied).toEqual([]);
  });

  it("stamps the new version itself, so a migration that forgets to set `v` still lands correctly", () => {
    const forgetful: Migration = { from: 1, to: 2, name: "forgetful", migrate: (s) => ({ ...s, x: 1 }) };
    const out = applyMigrations({ v: 1 }, 1, 2, [forgetful]);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.save["v"]).toBe(2);
  });

  it("overrides a migration that stamps the WRONG version — the registry is the authority, not the function body", () => {
    const wrong: Migration = { from: 1, to: 2, name: "wrong stamp", migrate: (s) => ({ ...s, v: 99 }) };
    const out = applyMigrations({ v: 1 }, 1, 2, [wrong]);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.save["v"]).toBe(2);
  });

  it("never mutates the save handed to it", () => {
    const original: RawSave = { v: 1 };
    const snapshot = JSON.stringify(original);
    applyMigrations(original, 1, 3, [step(1, 2, "a"), step(2, 3, "b")]);
    expect(JSON.stringify(original)).toBe(snapshot);
  });
});

describe("applyMigrations — malformed registries are refused, not trusted", () => {
  it("reports no-path when the chain has a gap, naming the version it got stuck on", () => {
    const gapped = [step(1, 2, "a"), step(3, 4, "c")]; // nothing handles v2
    const out = applyMigrations({ v: 1 }, 1, 4, gapped);
    expect(out.ok).toBe(false);
    if (out.ok) return;
    expect(out.reason).toBe("no-path");
    expect(out.detail).toContain("version 2");
  });

  it("refuses an AMBIGUOUS chain rather than silently picking one of two migrations", () => {
    const ambiguous = [step(1, 2, "a"), step(1, 2, "b")];
    const out = applyMigrations({ v: 1 }, 1, 2, ambiguous);
    expect(out.ok).toBe(false);
    if (out.ok) return;
    expect(out.reason).toBe("no-path");
    expect(out.detail).toMatch(/ambiguous/i);
  });

  it("refuses a migration that doesn't move forward, instead of looping forever on it", () => {
    const stuck: Migration = { from: 1, to: 1, name: "stuck", migrate: (s) => s };
    const out = applyMigrations({ v: 1 }, 1, 2, [stuck]);
    expect(out.ok).toBe(false);
    if (out.ok) return;
    expect(out.detail).toContain("stuck");
  });

  it("reports a migration that throws, by name, without letting the exception escape", () => {
    const boom: Migration = {
      from: 1,
      to: 2,
      name: "explodes",
      migrate: () => {
        throw new Error("field was already gone");
      },
    };
    const out = applyMigrations({ v: 1 }, 1, 2, [boom]);
    expect(out.ok).toBe(false);
    if (out.ok) return;
    expect(out.reason).toBe("migration-failed");
    expect(out.detail).toContain("explodes");
    expect(out.detail).toContain("field was already gone");
  });

  it("reports a migration that returns something that isn't an object", () => {
    const bad = { from: 1, to: 2, name: "returns null", migrate: () => null } as unknown as Migration;
    const out = applyMigrations({ v: 1 }, 1, 2, [bad]);
    expect(out.ok).toBe(false);
    if (out.ok) return;
    expect(out.reason).toBe("migration-failed");
  });
});

describe("loadStateWith — the whole path, end to end, on a REAL save", () => {
  /**
   * The scenario the framework exists for, rehearsed before it is needed:
   * a save written by an older build, missing a field this build requires.
   * Everything here is real except the version numbers.
   */
  it("upgrades a genuine older save and returns a usable state", () => {
    const old = realSave();
    delete old["draftPhilosophy"]; // pretend v1 predated it
    delete old["lastDraft"];
    old["v"] = 1;

    const restore: Migration = {
      from: 1,
      to: 2,
      name: "add draft philosophy",
      migrate: (s) => ({ ...s, draftPhilosophy: "BPA", lastDraft: null }),
    };

    const result = loadStateWith(old, 2, [restore]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.applied).toEqual(["add draft philosophy"]);
    expect(result.fromVersion).toBe(1);
    expect(result.state.v).toBe(2);
    expect(result.state.draftPhilosophy).toBe("BPA");
    expect(result.state.world.clubs.length).toBeGreaterThan(200);
  });

  it("refuses when migrations ran but the result is STILL unusable, and says which ones ran", () => {
    const old = realSave();
    old["v"] = 1;

    const destructive: Migration = {
      from: 1,
      to: 2,
      name: "drops the world",
      migrate: (s) => {
        const next = { ...s };
        delete next["world"];
        return next;
      },
    };

    const result = loadStateWith(old, 2, [destructive]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("invalid-result");
    expect(result.detail).toContain("drops the world");
    expect(result.detail).toContain("world");
  });
});

describe("checkShape", () => {
  it("passes a real state", () => {
    expect(checkShape(realSave())).toBeNull();
  });

  it("rejects non-objects with a readable reason rather than throwing", () => {
    expect(checkShape(null)).toContain("isn't an object");
    expect(checkShape([])).toContain("isn't an object");
    expect(checkShape("x")).toContain("isn't an object");
  });

  it("distinguishes a MISSING field from one of the wrong type", () => {
    const save = realSave();
    delete save["players"];
    expect(checkShape(save)).toContain("missing");

    const wrong = realSave();
    wrong["players"] = {};
    expect(checkShape(wrong)).toContain("isn't an array");
  });
});

describe("the real registry", () => {
  /**
   * The test that fires when someone bumps `SCHEMA_VERSION` and forgets to
   * write the migration. It is worth more than every synthetic test above,
   * because it is the failure that actually happens.
   */
  it("can bring a save at ANY supported version up to the current one", () => {
    for (let v = 1; v <= SCHEMA_VERSION; v++) {
      const out = applyMigrations({ v }, v, SCHEMA_VERSION, MIGRATIONS);
      expect(out.ok, `no migration path from v${v} to v${SCHEMA_VERSION}`).toBe(true);
    }
  });

  it("contains no migration that fails to move forward, and no two that claim the same version", () => {
    const froms = MIGRATIONS.map((m) => m.from);
    expect(new Set(froms).size).toBe(froms.length);
    for (const m of MIGRATIONS) expect(m.to).toBeGreaterThan(m.from);
  });

  it("carries exactly one migration per version step, with no gaps", () => {
    expect(MIGRATIONS.length).toBe(SCHEMA_VERSION - 1);
  });

  it("upgrades a REAL v1 save — one built by newGame with the v2 fields stripped — into something playable", () => {
    // The test `migrate.ts`'s own header specifies as step 3 of adding a
    // migration, and the one that would catch a backfill that produces a
    // state the engine can't actually run.
    const save = realSave();
    delete save["delegation"];
    delete save["asks"];
    delete save["nextAsk"];
    save["v"] = 1;

    const result = loadState(save);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.applied).toEqual(["add the delegation dial"]);
    expect(result.state.v).toBe(2);
    expect(result.state.asks).toEqual([]);
    expect(result.state.nextAsk).toBe(1);
    expect(result.state.delegation.draft).toBe("approve");
    expect(result.state.delegation).not.toHaveProperty("staff");
    // And the world survived the trip untouched.
    expect(result.state.world.clubs.length).toBeGreaterThan(200);
    expect(result.state.players.length).toBeGreaterThan(3000);
  });

  it("a v1 save's existing log lines are still legal v2 lines — the new fields are optional, so nothing is rewritten", () => {
    const save = realSave();
    save["v"] = 1;
    save["log"] = [{ d: 100, t: "old.line", c: "something that happened" }];
    delete save["delegation"];

    const result = loadState(save);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.log).toEqual([{ d: 100, t: "old.line", c: "something that happened" }]);
  });
});
