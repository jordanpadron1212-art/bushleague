/**
 * Save/load — IndexedDB via `idb`, the stack choice `STACK-AND-ENGINES.md`
 * named for exactly this. One object store, one record ("current"),
 * holding the whole `GameState` as one JSON-serializable blob (LAWS.md
 * Law 2: the state IS the save — nothing here reshapes it). No migration
 * path from an old `bush-league-v0.10.html` localStorage save — a stated,
 * deliberate consequence of the rewrite (`DECISIONS.md` D78, HANDOFF.md's
 * own "Known gaps").
 */
import { openDB } from "idb";
import type { GameState } from "@bushleague/sim-kit";

const DB_NAME = "bushleague";
const DB_VERSION = 1;
const STORE = "saves";
const SLOT = "current";

// No module-level connection cache, and every call below closes its
// connection when done: an IndexedDB connection left open blocks a future
// `indexedDB.deleteDatabase()` (browsers fire `onblocked` and simply wait
// rather than erroring — confirmed against fake-indexeddb in this
// package's own tests) until it closes, so leaking one is a correctness
// bug here, not just a resource-hygiene nit. `openDB` against the same
// name and version is cheap enough that opening fresh per call, rather
// than caching a long-lived connection, costs nothing this app will ever
// notice (called at most once per day-advance, never in a hot loop).
async function withDb<T>(fn: (db: Awaited<ReturnType<typeof openDB>>) => Promise<T>): Promise<T> {
  const d = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE)) database.createObjectStore(STORE);
    },
  });
  try {
    return await fn(d);
  } finally {
    d.close();
  }
}

export function saveGame(state: GameState): Promise<void> {
  return withDb(async (d) => {
    await d.put(STORE, state, SLOT);
  });
}

export function loadGame(): Promise<GameState | undefined> {
  return withDb((d) => d.get(STORE, SLOT));
}

export function hasSave(): Promise<boolean> {
  return withDb(async (d) => (await d.count(STORE, SLOT)) > 0);
}

export function deleteSave(): Promise<void> {
  return withDb(async (d) => {
    await d.delete(STORE, SLOT);
  });
}
