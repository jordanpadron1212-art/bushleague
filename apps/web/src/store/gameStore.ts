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
import { newGame, advanceDay, type GameState, type NewGameOptions, type AdvanceResult } from "@bushleague/sim-kit";
import { saveGame, loadGame } from "../save.js";

interface GameStore {
  state: GameState | null;
  /** True while IndexedDB is being read or a new game is being generated — not while advancing (that's synchronous and fast; see advance.ts's own note on cost). */
  loading: boolean;
  error: string | null;
  lastResult: AdvanceResult | null;
  loadFromDisk: () => Promise<void>;
  startNewGame: (opts: NewGameOptions) => Promise<void>;
  advance: () => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: null,
  loading: true,
  error: null,
  lastResult: null,

  loadFromDisk: async () => {
    set({ loading: true, error: null });
    try {
      const loaded = await loadGame();
      set({ state: loaded ?? null, loading: false });
    } catch (err) {
      set({ loading: false, error: `Couldn't read your save — ${String(err)}` });
    }
  },

  startNewGame: async (opts) => {
    set({ loading: true, error: null });
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
}));
