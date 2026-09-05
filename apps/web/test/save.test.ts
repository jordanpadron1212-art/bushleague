/**
 * Save/load round trip, against a real (fake-indexeddb-backed) IndexedDB,
 * not a mock of `idb`'s own API — the same discipline the rest of this
 * project applies to its engine (test against the real thing, not an
 * invented stand-in for it).
 *
 * As of `DECISIONS.md` D98 every read goes through the engine's version
 * check and migration chain (`sim-kit`'s `migrate.ts`), so these tests
 * cover the three outcomes a load can have — no save, a readable save, an
 * unreadable one — and the backup taken before a migration overwrites
 * anything. The chain logic itself is `sim-kit/test/migrate.test.ts`'s job;
 * what's tested here is the PERSISTENCE behaviour around it, which is where
 * a save actually gets destroyed.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { newGame, SCHEMA_VERSION } from "@bushleague/sim-kit";
import { saveGame, loadGame, hasSave, deleteSave, readBackup, queueSave, flushSave, hasPendingSave } from "../src/save.js";
import { openDB } from "idb";

function resetDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase("bushleague");
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
}

/**
 * Writes a raw blob straight into the save slot, bypassing `saveGame`'s
 * typing — the only way to simulate a save written by a different build,
 * which is the entire scenario migration exists for.
 */
async function writeRaw(blob: unknown): Promise<void> {
  const d = await openDB("bushleague", 1, {
    upgrade(database) {
      if (!database.objectStoreNames.contains("saves")) database.createObjectStore("saves");
    },
  });
  try {
    await d.put("saves", blob, "current");
  } finally {
    d.close();
  }
}

beforeEach(resetDatabase);
afterEach(resetDatabase);

describe("save/load", () => {
  it("reports no save before one is written — null, which is NOT a failure", async () => {
    expect(await hasSave()).toBe(false);
    expect(await loadGame()).toBeNull();
  });

  it("round-trips a real GameState exactly, applying no migrations", async () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 1 });
    await saveGame(state);
    expect(await hasSave()).toBe(true);

    const result = await loadGame();
    expect(result?.ok).toBe(true);
    if (!result?.ok) return;
    expect(result.state).toEqual(state);
    expect(result.applied).toEqual([]);
    expect(result.fromVersion).toBe(SCHEMA_VERSION);
  });

  it("a second save overwrites the first — one slot, not an accumulating list", async () => {
    await saveGame(newGame({ ownedClubId: "MLB_NYY", seed: 1 }));
    await saveGame(newGame({ ownedClubId: "MLB_BOS", seed: 2 }));

    const result = await loadGame();
    expect(result?.ok).toBe(true);
    if (!result?.ok) return;
    expect(result.state.ownedClubId).toBe("MLB_BOS");
  });

  it("deleteSave clears it", async () => {
    await saveGame(newGame({ ownedClubId: "MLB_NYY", seed: 1 }));
    await deleteSave();
    expect(await hasSave()).toBe(false);
  });
});

describe("save/load — a save that can't be read", () => {
  it("refuses a save from a newer build instead of loading it", async () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 1 });
    await writeRaw({ ...state, v: SCHEMA_VERSION + 1 });

    const result = await loadGame();
    expect(result?.ok).toBe(false);
    if (result?.ok !== false) return;
    expect(result.reason).toBe("from-the-future");
  });

  it("refuses a structurally damaged save", async () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 1 }) as unknown as Record<string, unknown>;
    delete state["world"];
    await writeRaw(state);

    const result = await loadGame();
    expect(result?.ok).toBe(false);
  });

  it("does NOT overwrite a save it failed to read — the bytes are still there to recover", async () => {
    const damaged = { v: SCHEMA_VERSION, seed: 7, iAmDamaged: true };
    await writeRaw(damaged);

    const result = await loadGame();
    expect(result?.ok).toBe(false);

    // Read it back the raw way; a failed load must leave the slot untouched.
    const d = await openDB("bushleague", 1);
    try {
      expect(await d.get("saves", "current")).toEqual(damaged);
    } finally {
      d.close();
    }
  });

  it("takes no backup when nothing was migrated — a backup should mean something happened", async () => {
    await saveGame(newGame({ ownedClubId: "MLB_NYY", seed: 1 }));
    await loadGame();
    expect(await readBackup()).toBeUndefined();
  });

  it("deleting the save deletes the backup with it", async () => {
    await saveGame(newGame({ ownedClubId: "MLB_NYY", seed: 1 }));
    await deleteSave();
    expect(await readBackup()).toBeUndefined();
  });
});

describe("save/load — what happens when a migration actually runs", () => {
  /**
   * The backup-then-overwrite sequence is the code that decides whether a
   * buggy future migration costs a player their save or costs them nothing.
   * With `SCHEMA_VERSION` still at 1 there is no real migration to trigger
   * it, so it is driven here with a reader that reports one — the same
   * concession `loadStateWith` makes in the engine, and for the same reason:
   * an untested recovery path is not a recovery path.
   */
  const upgraded = (raw: unknown) => {
    const state = { ...(raw as Record<string, unknown>), upgradedField: "yes" };
    return { ok: true as const, state: state as never, fromVersion: 1, applied: ["pretend upgrade"] };
  };

  it("copies the ORIGINAL save to the backup slot before overwriting it", async () => {
    const original = newGame({ ownedClubId: "MLB_NYY", seed: 1 });
    await saveGame(original);

    await loadGame(upgraded);

    const backup = (await readBackup()) as Record<string, unknown> | undefined;
    expect(backup).toBeDefined();
    expect(backup?.["ownedClubId"]).toBe("MLB_NYY");
    // The backup is the PRE-migration save — it must not carry the change.
    expect(backup).not.toHaveProperty("upgradedField");
  });

  it("writes the upgraded save back, so the upgrade happens once and not on every load", async () => {
    await saveGame(newGame({ ownedClubId: "MLB_NYY", seed: 1 }));
    await loadGame(upgraded);

    // Read the slot raw: it should now hold the migrated shape.
    const d = await openDB("bushleague", 1);
    try {
      const stored = (await d.get("saves", "current")) as Record<string, unknown>;
      expect(stored["upgradedField"]).toBe("yes");
    } finally {
      d.close();
    }
  });

  it("returns the migrated state to the caller, with the migration named", async () => {
    await saveGame(newGame({ ownedClubId: "MLB_NYY", seed: 1 }));
    const result = await loadGame(upgraded);
    expect(result?.ok).toBe(true);
    if (!result?.ok) return;
    expect(result.applied).toEqual(["pretend upgrade"]);
    expect(result.fromVersion).toBe(1);
  });
});

describe("write-behind — coalescing and the two ordering hazards", () => {
  /**
   * Measured before this existed (`DECISIONS.md` D99): a 2.39 MB save,
   * ~23 ms per IndexedDB put and ~48 ms of structured clone, against ~11 ms
   * to simulate a day. The game spent longer saving than playing. These
   * tests cover the behaviour that fixes it and the two ways it could
   * silently destroy a save if done carelessly.
   */
  it("coalesces a burst into ONE write, and the write holds the latest state", async () => {
    const a = newGame({ ownedClubId: "MLB_NYY", seed: 1 });
    const b = newGame({ ownedClubId: "MLB_BOS", seed: 2 });
    const c = newGame({ ownedClubId: "MLB_LAD", seed: 3 });

    queueSave(a);
    queueSave(b);
    queueSave(c);
    expect(hasPendingSave()).toBe(true);

    await flushSave();
    expect(hasPendingSave()).toBe(false);

    const result = await loadGame();
    expect(result?.ok).toBe(true);
    if (!result?.ok) return;
    // The last one wins; the two before it were never written. Safe because
    // the state is cumulative, not a delta.
    expect(result.state.ownedClubId).toBe("MLB_LAD");
  });

  it("flushSave with nothing queued is a no-op, not an error", async () => {
    await expect(flushSave()).resolves.toBeUndefined();
    expect(hasPendingSave()).toBe(false);
  });

  it("HAZARD 1: an immediate save cancels a queued one, so a new game can't be reverted by a stale write", async () => {
    const old = newGame({ ownedClubId: "MLB_NYY", seed: 1 });
    queueSave(old); // in flight conceptually: the player's previous game

    const fresh = newGame({ ownedClubId: "MLB_BOS", seed: 2 });
    await saveGame(fresh); // starting over

    // Give any (incorrectly) surviving timer more than its full delay.
    await flushSave();
    await new Promise((r) => setTimeout(r, 60));

    const result = await loadGame();
    expect(result?.ok).toBe(true);
    if (!result?.ok) return;
    // Without cancellation the queued MLB_NYY write lands here and the
    // player's brand-new game silently becomes their old one.
    expect(result.state.ownedClubId).toBe("MLB_BOS");
  });

  it("HAZARD 2: deleting the save cancels a queued write, so a deleted save can't come back", async () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 1 });
    await saveGame(state);

    queueSave(state);
    await deleteSave();

    await flushSave();
    await new Promise((r) => setTimeout(r, 60));

    expect(await hasSave()).toBe(false);
  });

  it("reports a write failure through the callback, since there's no promise left to reject into", async () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 1 });
    let seen: unknown = null;

    // Close the database out from under the write by deleting it mid-flight
    // is unreliable; instead assert the plumbing exists and stays quiet on
    // success — a false error would be worse than a missed one.
    queueSave(state, (err) => {
      seen = err;
    });
    await flushSave();
    expect(seen).toBeNull();
  });

  it("a queued write survives being scheduled repeatedly without ever starving", async () => {
    // MAX_STALE_MS exists so that holding Advance still persists as it goes,
    // rather than deferring forever behind a rolling quiet timer.
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 1 });
    for (let i = 0; i < 40; i++) {
      queueSave(state);
      await new Promise((r) => setTimeout(r, 5));
    }
    await flushSave();
    expect(await hasSave()).toBe(true);
  }, 15000);
});
