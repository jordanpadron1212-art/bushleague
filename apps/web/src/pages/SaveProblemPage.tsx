/**
 * Shown when a save exists but can't be loaded (`DECISIONS.md` D98).
 *
 * This screen exists because of what the app did BEFORE it: a failed load
 * left `state` null, the app fell through to the club picker, and the
 * player — with no indication anything was wrong — would pick a club and
 * silently overwrite the save that had just failed to load. A recoverable
 * problem became a permanent one, quietly, in one click. Refusing to load
 * a damaged save is only half a safeguard; this is the other half.
 *
 * Three rules shape it:
 *
 * 1. **Say what happened in the player's language.** `result.detail` from
 *    the engine is already written for a person to read, so it is shown
 *    as-is rather than wrapped in a second apology.
 * 2. **Promise nothing has been lost, because nothing has.** The save is
 *    still on disk, untouched. That single sentence is the difference
 *    between an alarming screen and a merely annoying one.
 * 3. **Make the destructive option obviously destructive.** Starting fresh
 *    is what actually overwrites the save, so it takes a second,
 *    deliberate confirmation and never shares a shape with the safe one.
 */
import { useState } from "react";
import { useGameStore } from "../store/gameStore.js";

/**
 * The REMEDY for each refusal — never a restatement of the problem.
 *
 * The first draft of this screen put the engine's `detail` and a line from
 * this map one under the other, and reading a screenshot of it showed the
 * same sentence twice ("...made by a newer version — update the game" then
 * "This save was written by a newer build... Updating should open it").
 * No assertion caught that; only looking did. So the split is now strict:
 * the engine states what is wrong, this states what to do about it, and
 * neither says the other's half.
 *
 * Falls back to a generic line for a reason this screen hasn't been taught
 * yet, so a new failure mode degrades to unhelpful rather than to blank.
 */
const GUIDANCE: Record<string, string> = {
  "from-the-future": "Updating to the latest version of the game should open it.",
  "not-a-save": "Whatever is in storage under this save slot isn't a game.",
  "no-version":
    "That usually means the stored data was truncated — often a browser clearing site data partway through a write.",
  "no-path": "It's too old for this build to upgrade on its own.",
  "migration-failed": "The upgrade stopped partway. Your original save was not changed.",
  "invalid-result": "Some of the data the game needs to open it is missing.",
};

export default function SaveProblemPage() {
  const problem = useGameStore((s) => s.saveProblem);
  const loadFromDisk = useGameStore((s) => s.loadFromDisk);
  const dismiss = useGameStore((s) => s.dismissSaveProblem);
  const [confirming, setConfirming] = useState(false);

  if (!problem) return null;

  return (
    <div
      className="flex h-dvh flex-col items-center justify-center overflow-y-auto px-[var(--sp-4)]"
      style={{ background: "var(--c-bg)", color: "var(--c-text)" }}
    >
      <div className="w-full max-w-[560px] border" style={{ borderColor: "var(--c-border)", background: "var(--c-surface)" }}>
        <header className="border-b px-[var(--sp-4)] py-[var(--sp-3)]" style={{ borderColor: "var(--c-border)" }}>
          <h1 className="text-[var(--fs-md)] font-semibold">Your save couldn&rsquo;t be opened</h1>
        </header>

        <div className="px-[var(--sp-4)] py-[var(--sp-4)]">
          {/* The engine's own sentence, verbatim. */}
          <p className="text-[var(--fs-base)]">{problem.detail}</p>

          <p className="mt-[var(--sp-3)] text-[var(--fs-sm)]" style={{ color: "var(--c-dim)" }}>
            {GUIDANCE[problem.reason] ?? "The game stopped rather than open a save it couldn't read correctly."}
          </p>

          {/* Rule 2 — the reassurance is the most useful sentence here. */}
          <p
            className="mt-[var(--sp-3)] border-l-2 pl-[var(--sp-3)] text-[var(--fs-sm)]"
            style={{ borderColor: "var(--c-pos)", color: "var(--c-dim)" }}
          >
            <strong style={{ color: "var(--c-text)" }}>Nothing has been deleted.</strong> Your save is still stored
            exactly as it was — the game refused to change it rather than risk making the problem permanent.
          </p>

          <div className="mt-[var(--sp-4)] flex flex-wrap gap-[var(--sp-2)]">
            <button
              type="button"
              onClick={() => void loadFromDisk()}
              className="border px-[var(--sp-3)] py-[var(--sp-2)] text-[var(--fs-sm)] font-semibold"
              style={{ borderColor: "var(--c-accent)", color: "var(--c-accent)", background: "transparent" }}
            >
              Try again
            </button>

            {!confirming ? (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="px-[var(--sp-3)] py-[var(--sp-2)] text-[var(--fs-sm)] underline"
                style={{ color: "var(--c-dim)", background: "transparent" }}
              >
                Start a new game instead
              </button>
            ) : (
              // Rule 3 — the confirmation states the consequence in the same
              // breath as the button, so it can't be clicked past without
              // reading what it does.
              <div
                className="w-full border px-[var(--sp-3)] py-[var(--sp-3)]"
                style={{ borderColor: "var(--c-neg)", background: "var(--c-surface2)" }}
              >
                <p className="text-[var(--fs-sm)]">
                  Starting a new game will <strong style={{ color: "var(--c-neg)" }}>overwrite this save</strong> as soon
                  as you choose a club. There&rsquo;s only one save slot, and this can&rsquo;t be undone.
                </p>
                <div className="mt-[var(--sp-3)] flex gap-[var(--sp-2)]">
                  <button
                    type="button"
                    onClick={dismiss}
                    className="border px-[var(--sp-3)] py-[var(--sp-2)] text-[var(--fs-sm)] font-semibold"
                    style={{ borderColor: "var(--c-neg)", color: "var(--c-neg)", background: "transparent" }}
                  >
                    I understand — start over
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="px-[var(--sp-3)] py-[var(--sp-2)] text-[var(--fs-sm)]"
                    style={{ color: "var(--c-dim)", background: "transparent" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
