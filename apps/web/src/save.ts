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
 *
 * ## Writes are coalesced, not one-per-day (`DECISIONS.md` D99)
 *
 * Measured in a real browser on a fresh MLB save: the state is **2.39 MB**,
 * of which 89.5% is the 5,750 players themselves and 8.6% is the schedule's
 * 13,866 rows. There is no fat to trim — that IS the game, and the pending
 * world-configuration work makes it bigger. But writing all of it after
 * every single day-advance cost **~23 ms per put and ~48 ms of structured
 * clone**, against ~11 ms to simulate the day: the game spent more time
 * saving than playing, and 30 rapid advances took 1,898 ms.
 *
 * So `queueSave` schedules a write instead of performing one, and a write
 * scheduled while another is pending simply replaces it. Advancing thirty
 * days writes once, not thirty times. The state is cumulative rather than
 * a delta, so skipping intermediate versions loses nothing — the last one
 * contains every earlier one.
 *
 * Two ordering hazards make this dangerous if done naively, and both are
 * closed here rather than left to callers: `saveGame` and `deleteSave` each
 * CANCEL a pending queued write first. Without that, a queued write of the
 * old state could land after a new game's write (resurrecting the previous
 * save) or after a delete (resurrecting a deleted one). Both are tested.
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

/**
 * Writes immediately and waits for it. Use for the moments that must be on
 * disk before anything else happens — starting a new game, rolling into a
 * new season — not for routine play.
 *
 * Cancels any queued write first: an immediate write supersedes whatever
 * was scheduled, and letting a stale queued state land afterwards is how a
 * new game would silently revert to the previous one.
 */
export function saveGame(state: GameState): Promise<void> {
  cancelQueued();
  return writeNow(state);
}

function writeNow(state: GameState): Promise<void> {
  return withDb(async (d) => {
    await d.put(STORE, state, SLOT);
  });
}

// ---- Write-behind scheduling (see this file's header) ----

/** Flush once the player stops advancing. Long enough to coalesce a burst of clicks, short enough to be invisible. */
const QUIET_MS = 400;
/** ...but never let an unsaved change sit longer than this, so holding Advance still persists as it goes. */
const MAX_STALE_MS = 2000;

let queued: GameState | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let queuedSince = 0;
/** The write currently in flight, so two puts never overlap and the last one always wins. */
let inFlight: Promise<void> | null = null;
let reportError: ((err: unknown) => void) | null = null;

function cancelQueued(): void {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
  queued = null;
  queuedSince = 0;
}

async function drain(): Promise<void> {
  // Serialize: awaiting the in-flight write before starting another keeps
  // the last queued state authoritative instead of racing two puts whose
  // completion order IndexedDB does not promise.
  while (inFlight) await inFlight.catch(() => undefined);

  const state = queued;
  if (!state) return;
  queued = null;
  queuedSince = 0;

  inFlight = writeNow(state);
  try {
    await inFlight;
  } catch (err) {
    reportError?.(err);
  } finally {
    inFlight = null;
  }

  // Anything queued while that write was in flight goes now.
  if (queued) await drain();
}

/**
 * Schedules a save. Cheap and synchronous — the cost is paid later, once,
 * however many times this is called in between.
 *
 * `onError` is how a failure reaches the player: the write happens after
 * the caller has moved on, so there is no promise left to reject into.
 */
export function queueSave(state: GameState, onError?: (err: unknown) => void): void {
  queued = state;
  if (onError) reportError = onError;
  if (queuedSince === 0) queuedSince = Date.now();

  const budget = MAX_STALE_MS - (Date.now() - queuedSince);
  const delay = Math.max(0, Math.min(QUIET_MS, budget));

  if (timer !== null) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void drain();
  }, delay);
}

/**
 * Writes anything queued right now and waits for it. Call before the page
 * can go away (visibility change, pagehide) and before anything that reads
 * the save back.
 */
export async function flushSave(): Promise<void> {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
  await drain();
}

/** True when a write is scheduled or running — for tests and diagnostics. */
export function hasPendingSave(): boolean {
  return queued !== null || inFlight !== null || timer !== null;
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
  // Cancel first, or a queued write lands afterwards and resurrects the
  // save the player just deleted.
  cancelQueued();
  return withDb(async (d) => {
    await d.delete(STORE, SLOT);
    // The backup goes with it. Keeping a stale pre-migration copy of a save
    // the player deliberately deleted would be a small privacy surprise and
    // a large source of confusion if it were ever restored.
    await d.delete(STORE, BACKUP_SLOT);
  });
}
