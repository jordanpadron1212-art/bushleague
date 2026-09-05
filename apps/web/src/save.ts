/**
 * Save/load — IndexedDB via `idb`, the stack choice `STACK-AND-ENGINES.md`
 * named for exactly this. One object store, one record ("current"),
 * holding the whole `GameState` as one JSON-serializable blob (LAWS.md
 * Law 2: the state IS the save — nothing here reshapes it). No migration
 * path from an old `bush-league-v0.10.html` localStorage save — a stated,
 * deliberate consequence of the rewrite (`DECISIONS.md` D78, HANDOFF.md's
 * own "Known gaps").
 *
 * `loadGame` no longer hands the raw blob to the app. Every read now goes
 * through the engine's own `loadState` (`sim-kit`'s `migrate.ts`,
 * `DECISIONS.md` D98), which reads the version stamp this file has been
 * writing since day one and never checking, migrates when it can, and
 * REFUSES when it can't — so an unreadable save produces a sentence the
 * player can act on instead of a crash three components deep.
 *
 * **Before any migration overwrites a save, the pre-migration blob is
 * copied to a backup slot.** A migration is code, and code has bugs; the
 * one failure this design refuses to allow is a bad upgrade quietly
 * destroying a save with nothing left to recover. No UI reads the backup
 * yet — that gap is disclosed rather than hidden — but the DATA is kept,
 * which is the part that cannot be added retroactively.
 */
import { openDB } from "idb";
import { loadState, type GameState, type LoadResult } from "@bushleague/sim-kit";

const DB_NAME = "bushleague";
const DB_VERSION = 1;
const STORE = "saves";
const SLOT = "current";
/** The pre-migration copy, written only when a migration is about to change the save. */
const BACKUP_SLOT = "pre-migration-backup";

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

/**
 * Reads the save and puts it through the engine's version check and
 * migration chain.
 *
 * Returns `null` when there is simply no save — a different thing from a
 * save that failed to load, and callers must not conflate them: the first
 * means "show the new-game screen," the second means "tell the player what
 * happened and do NOT overwrite anything."
 *
 * When a migration runs, the pre-migration blob is copied to a backup slot
 * and the upgraded state is written back, so the upgrade happens once
 * rather than on every load.
 *
 * `read` is injectable for one reason, the same one `loadStateWith` exists
 * for: while `SCHEMA_VERSION` is 1 there is no migration to run, so the
 * backup-then-overwrite sequence below — the code path that decides whether
 * a bad upgrade is recoverable — would ship completely unexercised until
 * the first schema change. Tests drive it with a reader that reports a
 * migration. Production calls `loadGame()` with no argument.
 */
export async function loadGame(read: (raw: unknown) => LoadResult = loadState): Promise<LoadResult | null> {
  const raw = await withDb((d) => d.get(STORE, SLOT));
  if (raw === undefined) return null;

  const result = read(raw);
  if (result.ok && result.applied.length > 0) {
    await withDb(async (d) => {
      // Backup first, THEN overwrite — in that order, so a failure between
      // the two leaves the original save intact rather than nothing at all.
      await d.put(STORE, raw, BACKUP_SLOT);
      await d.put(STORE, result.state, SLOT);
    });
  }
  return result;
}

/**
 * The pre-migration copy of the save, if one was ever taken. Nothing in the
 * app surfaces this yet; it exists so that a bad migration is recoverable
 * at all, and so a support conversation has something to ask for.
 */
export function readBackup(): Promise<unknown> {
  return withDb((d) => d.get(STORE, BACKUP_SLOT));
}

export function hasSave(): Promise<boolean> {
  return withDb(async (d) => (await d.count(STORE, SLOT)) > 0);
}

export function deleteSave(): Promise<void> {
  return withDb(async (d) => {
    await d.delete(STORE, SLOT);
    // The backup goes with it. Keeping a stale pre-migration copy of a save
    // the player deliberately deleted would be a small privacy surprise and
    // a large source of confusion if it were ever restored.
    await d.delete(STORE, BACKUP_SLOT);
  });
}
