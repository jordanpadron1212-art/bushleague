/**
 * The game store — the actual save, not UI chrome (uiStore.ts's own
 * separation note: "this is chrome preference, not something that lives
 * inside a save file"). Holds a `GameState` or `null` (no game in
 * progress) and persists to IndexedDB (save.ts) after every mutating
 * action.
 *
 * `sim-kit`'s engine mutates `GameState` in place by design (`game.ts`'s,
 * `season.ts`'s, `advance.ts`'s own notes — accumulating in place is the
 * established pattern for a season's worth of state, not an exception to
 * it). `set({ state: { ...current } })` after each mutation exists to give
 * React a new top-level object reference to detect, not to avoid the
 * mutation itself — nested arrays (`world.clubs`, `players`) stay the
 * same mutated references, which is fine as long as nothing memoizes
 * against their identity instead of the top-level `state` reference this
 * store hands out.
 */
import { create } from "zustand";
import {
  newGame,
  advanceDay,
  startNewSeason as rollIntoNewSeason,
  mulberry32,
  type GameState,
  type NewGameOptions,
  type AdvanceResult,
  type DraftPhilosophy,
} from "@bushleague/sim-kit";
import { saveGame, loadGame } from "../save.js";

/**
 * A save that exists on disk but could not be read. Kept separate from
 * `error` deliberately: `error` is a transient "that didn't work" message
 * shown alongside a working screen, whereas this one BLOCKS the app —
 * falling through to the new-game screen would invite the player to start
 * a game that silently overwrites the save we just failed to understand.
 */
export interface SaveProblem {
  reason: string;
  /** Written for a player to read (`sim-kit`'s migrate.ts), not a stack trace. */
  detail: string;
}

interface GameStore {
  state: GameState | null;
  /** True while IndexedDB is being read or a new game is being generated — not while advancing (that's synchronous and fast; see advance.ts's own note on cost). */
  loading: boolean;
  error: string | null;
  /** Set when a save exists but can't be loaded — see `SaveProblem`. Blocks the app until resolved. */
  saveProblem: SaveProblem | null;
  lastResult: AdvanceResult | null;
  loadFromDisk: () => Promise<void>;
  /**
   * Abandons an unreadable save and returns to the new-game screen. Does
   * NOT delete anything — the bytes stay on disk until a new game actually
   * overwrites them, so a player who clears this by mistake has lost
   * nothing yet.
   */
  dismissSaveProblem: () => void;
  startNewGame: (opts: NewGameOptions) => Promise<void>;
  advance: () => Promise<void>;
  /** Rolls the save into the next year — `rollover.ts`'s `startNewSeason`, real and tested in `sim-kit` since DECISIONS.md D87 but never callable from the app until now. Only meaningful once `state.sp >= state.sched.length` (the same condition `advanceDay`'s own `seasonOver` already reports) — `ActionBar.tsx` is what decides when to show it. */
  startNewSeason: () => Promise<void>;
  /** The owner's own draft philosophy (DECISIONS.md D93) — takes effect at the NEXT rollover's draft, not retroactively; `runDraft` reads `state.draftPhilosophy` fresh every time it runs. */
  setDraftPhilosophy: (philosophy: DraftPhilosophy) => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: null,
  loading: true,
  error: null,
  saveProblem: null,
  lastResult: null,

  loadFromDisk: async () => {
    set({ loading: true, error: null, saveProblem: null });
    try {
      const result = await loadGame();

      // Three outcomes, and collapsing any two of them is a real bug.
      // `null` means no save exists — the new-game screen, not an error.
      if (result === null) {
        set({ state: null, loading: false });
        return;
      }

      // A save that exists but can't be read. `state` stays null so the app
      // never renders against a half-valid world, and NOTHING is written
      // back — overwriting a save we failed to understand is how a
      // recoverable problem becomes a permanent one. `result.detail` is
      // written for a player to read (`sim-kit`'s migrate.ts), so it is
      // shown as-is rather than wrapped in a second layer of apology.
      if (!result.ok) {
        set({ state: null, loading: false, saveProblem: { reason: result.reason, detail: result.detail } });
        return;
      }

      set({ state: result.state, loading: false });
    } catch (err) {
      set({ loading: false, error: `Couldn't read your save — ${String(err)}` });
    }
  },

  dismissSaveProblem: () => set({ saveProblem: null }),

  startNewGame: async (opts) => {
    set({ loading: true, error: null, saveProblem: null });
    try {
      const state = newGame(opts);
      await saveGame(state);
      set({ state, loading: false, lastResult: null });
    } catch (err) {
      set({ loading: false, error: `Couldn't start a new game — ${String(err)}` });
    }
  },

  advance: async () => {
    const current = get().state;
    if (!current) return;
    const result = advanceDay(current);
    set({ state: { ...current }, lastResult: result });
    try {
      await saveGame(current);
    } catch (err) {
      set({ error: `Couldn't save — ${String(err)}. Your progress this session is still here, but won't survive a reload.` });
    }
  },

  startNewSeason: async () => {
    const current = get().state;
    if (!current) return;
    // Same decorrelated-per-item-from-one-base-seed pattern advance.ts's own
    // day-scoped RNG already established (state.seed + day) — here scoped by
    // the year rollover actually advances FROM, so a reload before this
    // year's rollover reproduces the identical next season on replay.
    const r = mulberry32((current.seed + current.season.year) >>> 0);
    rollIntoNewSeason(current, r);
    set({ state: { ...current }, lastResult: null });
    try {
      await saveGame(current);
    } catch (err) {
      set({ error: `Couldn't save — ${String(err)}. Your progress this session is still here, but won't survive a reload.` });
    }
  },

  setDraftPhilosophy: async (philosophy) => {
    const current = get().state;
    if (!current) return;
    current.draftPhilosophy = philosophy;
    set({ state: { ...current } });
    try {
      await saveGame(current);
    } catch (err) {
      set({ error: `Couldn't save — ${String(err)}. Your progress this session is still here, but won't survive a reload.` });
    }
  },
}));
