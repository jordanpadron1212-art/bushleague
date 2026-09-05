/**
 * Save migration — the mechanism that lets a schema change without
 * destroying saves, and (just as important) that REFUSES to load a save it
 * cannot honestly handle instead of loading a broken one.
 *
 * Until now `SCHEMA_VERSION` was written into every save (`state.ts`) and
 * never read back: `loadGame()` handed the raw IndexedDB blob straight to
 * the app as a `GameState`. That is fine while the schema has never
 * changed and catastrophic the first time it does — a save from an older
 * build would load, render, and then fail somewhere far from the cause,
 * with a stack trace pointing at a component instead of at the schema.
 *
 * This lands BEFORE the first schema change rather than after, because a
 * migration framework written after the fact has to reconstruct what the
 * old shape was from memory. Two changes are already designed and queued —
 * `worldConfig` (`proposals/WORLD-CONFIGURATION.md` §7) and the delegation
 * dial (`proposals/OWNER-AND-STAFF.md`) — and both will add fields to the
 * save. The registry below is deliberately EMPTY today; the framework is
 * proven with synthetic chains in `migrate.test.ts` so that the first real
 * migration is a few lines plus a test, not a design problem.
 *
 * ## The one rule that matters
 *
 * **A migration operates on plain JSON, never on `GameState`.**
 *
 * This is the mistake almost every codebase makes here, and it is
 * invisible until it bites. A migration typed as `(s: GameState) =>
 * GameState` compiles against whatever `GameState` means TODAY. Add a
 * field in six months and that same migration — whose job is to handle a
 * save written before the field existed — silently starts claiming its
 * input already has it. The types say everything is fine. The data
 * disagrees. So every migration here takes and returns
 * `Record<string, unknown>`: unpleasant to write, and correct forever.
 *
 * ## What this does NOT do
 *
 * It does not validate the save deeply. `checkShape` below confirms the
 * load-bearing fields exist and are the right KIND of thing — enough that
 * the app will not crash on first render — and stops there. A full
 * per-field schema validator is a different tool with a different cost,
 * and pretending a shape check is one would be worse than not having it.
 */
import type { GameState } from "./state.js";
import { SCHEMA_VERSION } from "./state.js";

/** A save as it comes off disk: an object of unknown fields, nothing more. */
export type RawSave = Record<string, unknown>;

export interface Migration {
  /** The version this migration accepts. */
  readonly from: number;
  /** The version it produces. Must be greater than `from`. */
  readonly to: number;
  /** Shown in the load report and in any failure message — write it for a human reading a bug report. */
  readonly name: string;
  /**
   * Transforms one save shape into the next. Receives plain JSON and must
   * return plain JSON — see this file's header for why it is never typed
   * as `GameState`. Must not mutate its input; `applyMigrations` relies on
   * being able to report the original version after a failure.
   */
  migrate(save: RawSave): RawSave;
}

export type LoadFailure =
  /** Not an object at all — null, a primitive, an array, or a corrupt record. */
  | "not-a-save"
  /** An object, but with no readable integer `v`. Every save this engine has ever written has one, so this means corruption, not age. */
  | "no-version"
  /** Written by a NEWER build than this one. Not migratable: a down-migration would have to invent the removal of data it cannot see. */
  | "from-the-future"
  /** Older than this build, but no chain of migrations reaches the current version. */
  | "no-path"
  /** A migration threw. */
  | "migration-failed"
  /** Migrations ran, but the result still doesn't have the shape a `GameState` needs. */
  | "invalid-result";

export type LoadResult =
  | {
      ok: true;
      state: GameState;
      /** The version the save was at on disk — equal to `SCHEMA_VERSION` when nothing ran. */
      fromVersion: number;
      /** Migration names in the order applied. Empty for an already-current save. */
      applied: string[];
    }
  | {
      ok: false;
      reason: LoadFailure;
      /** A sentence fit to show a player, not a stack trace. */
      detail: string;
      /** The version read off the save, when one could be read at all. */
      fromVersion?: number;
    };

/**
 * Every migration this build knows, in no required order — `applyMigrations`
 * walks the chain by matching `from`, so the array's order is irrelevant and
 * a gap is detected rather than silently skipped.
 *
 * EMPTY BY DESIGN. `SCHEMA_VERSION` is still 1 and no save has ever needed
 * migrating. When the first schema change lands:
 *
 *   1. bump `SCHEMA_VERSION` in `state.ts`,
 *   2. add `{ from: 1, to: 2, name: "...", migrate(s) { ... } }` here,
 *   3. add a test that runs a REAL v1 save (build one with `newGame`, then
 *      strip the new fields) through `loadState` and asserts the result.
 *
 * Step 3 is the one that is easy to skip and the one that catches the bug.
 */
export const MIGRATIONS: readonly Migration[] = [];

const isObject = (o: unknown): o is RawSave =>
  typeof o === "object" && o !== null && !Array.isArray(o);

const isArray = (o: unknown): boolean => Array.isArray(o);

/**
 * The load-bearing fields, and what kind of thing each must be. Not a full
 * schema — the question this answers is narrowly "will the app survive
 * first render," which is exactly the question a migration's output needs
 * answered. Anything deeper belongs to a validator that doesn't exist yet,
 * and claiming this is one would be worse than having nothing.
 */
const REQUIRED: ReadonlyArray<readonly [string, (v: unknown) => boolean, string]> = [
  ["seed", (v) => typeof v === "number" && Number.isFinite(v), "a number"],
  ["season", isObject, "an object"],
  ["date", isObject, "an object"],
  ["ui", isObject, "an object"],
  ["world", isObject, "an object"],
  ["players", isArray, "an array"],
  ["sched", isArray, "an array"],
  ["ledger", isArray, "an array"],
  ["box", isArray, "an array"],
  ["log", isArray, "an array"],
];

/**
 * Returns a human-readable reason the object can't be a `GameState`, or
 * `null` if it passes. Reports EVERY problem rather than the first — a save
 * missing three fields should produce one bug report, not three round trips.
 */
export function checkShape(save: unknown): string | null {
  if (!isObject(save)) return "the save isn't an object";

  const problems: string[] = [];
  for (const [key, ok, kind] of REQUIRED) {
    if (!(key in save)) problems.push(`"${key}" is missing (expected ${kind})`);
    else if (!ok(save[key])) problems.push(`"${key}" isn't ${kind}`);
  }

  // Nested, and checked separately because these are the two the app
  // dereferences before it has rendered anything at all — a save that
  // passes the top level but has no clubs produces an empty screen with no
  // error, which is harder to diagnose than a refusal.
  const world = save["world"];
  if (isObject(world) && !isArray(world["clubs"])) problems.push(`"world.clubs" isn't an array`);
  const season = save["season"];
  if (isObject(season) && typeof season["year"] !== "number") problems.push(`"season.year" isn't a number`);

  return problems.length ? problems.join("; ") : null;
}

/**
 * Walks a save from its own version up to `target`, applying one migration
 * at a time. Separated from `loadState` so the chain logic can be tested
 * against synthetic migrations — which is the only way to test it at all
 * while `MIGRATIONS` is legitimately empty.
 *
 * Guards against a malformed registry as carefully as against a malformed
 * save: a migration whose `to` isn't greater than its `from` would loop
 * forever, so it is rejected on sight rather than trusted.
 */
export function applyMigrations(
  save: RawSave,
  fromVersion: number,
  target: number,
  migrations: readonly Migration[],
): { ok: true; save: RawSave; applied: string[] } | { ok: false; reason: LoadFailure; detail: string } {
  const applied: string[] = [];
  let current = save;
  let version = fromVersion;

  // Bounded by the registry's size: each step advances the version, and no
  // two migrations may share a `from` (checked below), so the chain can
  // visit each migration at most once. The guard is a backstop against a
  // registry edited into an inconsistent state, not an expected path.
  let guard = 0;
  while (version < target) {
    if (guard++ > migrations.length + 1) {
      return { ok: false, reason: "no-path", detail: `The upgrade path from version ${fromVersion} didn't terminate.` };
    }

    const candidates = migrations.filter((m) => m.from === version);
    if (candidates.length === 0) {
      return {
        ok: false,
        reason: "no-path",
        detail: `This save is version ${version}, and this build can only open version ${target}.`,
      };
    }
    if (candidates.length > 1) {
      return {
        ok: false,
        reason: "no-path",
        detail: `Ambiguous migration path: ${candidates.length} migrations claim version ${version} (${candidates.map((m) => m.name).join(", ")}).`,
      };
    }

    const step = candidates[0]!;
    if (step.to <= step.from) {
      return {
        ok: false,
        reason: "no-path",
        detail: `Migration "${step.name}" doesn't move forward (v${step.from} → v${step.to}).`,
      };
    }

    try {
      const next = step.migrate(current);
      if (!isObject(next)) {
        return { ok: false, reason: "migration-failed", detail: `Migration "${step.name}" didn't return an object.` };
      }
      current = next;
    } catch (err) {
      return {
        ok: false,
        reason: "migration-failed",
        detail: `Upgrading this save failed at "${step.name}": ${err instanceof Error ? err.message : String(err)}`,
      };
    }

    // The migration is the authority on the version it produced — stamping
    // it here rather than trusting the migration to remember means one
    // fewer thing every future migration has to get right.
    current = { ...current, v: step.to };
    applied.push(step.name);
    version = step.to;
  }

  return { ok: true, save: current, applied };
}

/**
 * The single entry point for turning something read off disk into a
 * `GameState` — or into a clear refusal. Callers must handle both; the
 * discriminated result makes that a type error to forget, which is the
 * point of returning a result instead of throwing.
 */
export function loadState(raw: unknown): LoadResult {
  return loadStateWith(raw, SCHEMA_VERSION, MIGRATIONS);
}

/**
 * `loadState` with the target version and the registry supplied explicitly.
 *
 * This exists for ONE reason, stated plainly rather than dressed up as
 * flexibility: while `SCHEMA_VERSION` is 1 and `MIGRATIONS` is empty, the
 * production entry point has no migration path to exercise, so the
 * read-version → migrate → shape-check sequence would ship untested until
 * the first real schema change — which is precisely the moment you want it
 * already proven. Tests drive a synthetic registry through here.
 *
 * Production code calls `loadState`. There is no legitimate reason for the
 * app to name its own target version.
 */
export function loadStateWith(raw: unknown, target: number, migrations: readonly Migration[]): LoadResult {
  if (!isObject(raw)) {
    return { ok: false, reason: "not-a-save", detail: "That file isn't a Bush League save." };
  }

  const v = raw["v"];
  if (typeof v !== "number" || !Number.isInteger(v) || v < 1) {
    return {
      ok: false,
      reason: "no-version",
      detail: "This save has no readable version stamp.",
    };
  }

  if (v > target) {
    return {
      ok: false,
      reason: "from-the-future",
      // States the PROBLEM only. The remedy ("update the game") belongs to
      // whatever surface shows this, which knows how updating works there.
      // Saying it in both places printed the same sentence twice on screen —
      // found by reading a screenshot, not by any assertion.
      detail: `This save was made by a newer version of the game (save v${v}, this build reads v${target}).`,
      fromVersion: v,
    };
  }

  const migrated = applyMigrations(raw, v, target, migrations);
  if (!migrated.ok) return { ...migrated, fromVersion: v };

  const problem = checkShape(migrated.save);
  if (problem !== null) {
    return {
      ok: false,
      reason: "invalid-result",
      detail:
        migrated.applied.length > 0
          ? `After upgrading this save (${migrated.applied.join(", ")}) it still isn't usable: ${problem}.`
          : `This save is damaged: ${problem}.`,
      fromVersion: v,
    };
  }

  return {
    ok: true,
    // The one cast in this file, and it is earned: `checkShape` has just
    // confirmed every field the app dereferences. Anything beyond that
    // would need the deep validator this file's header declines to fake.
    state: migrated.save as unknown as GameState,
    fromVersion: v,
    applied: migrated.applied,
  };
}
