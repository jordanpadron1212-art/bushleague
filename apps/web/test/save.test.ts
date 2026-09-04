/**
 * Save/load round trip, against a real (fake-indexeddb-backed) IndexedDB,
 * not a mock of `idb`'s own API — the same discipline the rest of this
 * project applies to its engine (test against the real thing, not an
 * invented stand-in for it).
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { newGame } from "@bushleague/sim-kit";
import { saveGame, loadGame, hasSave, deleteSave } from "../src/save.js";

function resetDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase("bushleague");
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
}

beforeEach(resetDatabase);
afterEach(resetDatabase);

describe("save/load", () => {
  it("has no save before one is written", async () => {
    expect(await hasSave()).toBe(false);
    expect(await loadGame()).toBeUndefined();
  });

  it("round-trips a real GameState exactly", async () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 1 });
    await saveGame(state);
    expect(await hasSave()).toBe(true);
    const loaded = await loadGame();
    expect(loaded).toEqual(state);
  });

  it("a second save overwrites the first — one slot, not an accumulating list", async () => {
    const a = newGame({ ownedClubId: "MLB_NYY", seed: 1 });
    const b = newGame({ ownedClubId: "MLB_BOS", seed: 2 });
    await saveGame(a);
    await saveGame(b);
    const loaded = await loadGame();
    expect(loaded?.ownedClubId).toBe("MLB_BOS");
  });

  it("deleteSave clears it", async () => {
    await saveGame(newGame({ ownedClubId: "MLB_NYY", seed: 1 }));
    await deleteSave();
    expect(await hasSave()).toBe(false);
  });
});
