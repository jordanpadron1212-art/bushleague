/**
 * The action bar — UI.md §5: "docked directly above the tab bar, on every
 * page, always the single next thing." Once a save exists, that single
 * next thing is almost always "advance to the next date" (UI.md's own
 * mockup: `▸ ADVANCE TO JUN 15 · @BOS 7:05`) — wired to the real
 * season-play driver (`advanceDay`, via the game store), not a control
 * that does nothing (the rule DECISIONS.md D36 sets for the old start
 * screen's difficulty toggle, applied here to the inverse case: build it
 * real once there's something real to wire it to).
 *
 * One exception, new this pass (DECISIONS.md D87/D88): once the schedule
 * is exhausted (`state.sp >= state.sched.length` — the identical condition
 * `advanceDay`'s own `seasonOver` reports, recomputed here directly from
 * state rather than threaded through `lastResult`, which a fresh page load
 * never populates), advancing has nothing left to do. Before this pass the
 * bar had no way to express that — `rollover.ts`'s `startNewSeason` is a
 * real, tested primitive with no caller anywhere in the app until now.
 */
import { formatShort } from "@bushleague/sim-kit";
import { useGameStore } from "../store/gameStore.js";
import { nextGameFor, ownedClub } from "../store/selectors.js";

export default function ActionBar() {
  const state = useGameStore((s) => s.state);
  const advance = useGameStore((s) => s.advance);
  const startNewSeason = useGameStore((s) => s.startNewSeason);

  if (!state) {
    return (
      <div
        className="flex h-[52px] shrink-0 items-center justify-center border-t text-[var(--fs-md)] font-semibold"
        style={{ borderColor: "var(--c-border)", color: "var(--c-dim)" }}
      >
        Start a new game — not built yet
      </div>
    );
  }

  const seasonOver = state.sp >= state.sched.length;

  if (seasonOver) {
    return (
      <button
        type="button"
        onClick={() => void startNewSeason()}
        className="flex h-[52px] shrink-0 items-center justify-center border-t text-[var(--fs-md)] font-semibold"
        style={{ borderColor: "var(--c-border)", color: "var(--c-accent)" }}
      >
        ▸ START THE {state.season.year + 1} SEASON
      </button>
    );
  }

  const club = ownedClub(state);
  const next = club ? nextGameFor(state, club.id) : null;
  const label = next
    ? `Advance to ${formatShort(state.date)} · ${next.home ? "vs" : "@"} ${next.opponent.abbr}`
    : `Advance to ${formatShort(state.date)}`;

  return (
    <button
      type="button"
      onClick={() => void advance()}
      className="flex h-[52px] shrink-0 items-center justify-center border-t text-[var(--fs-md)] font-semibold"
      style={{ borderColor: "var(--c-border)", color: "var(--c-accent)" }}
    >
      ▸ {label.toUpperCase()}
    </button>
  );
}
