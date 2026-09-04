/**
 * UI-only state: shell/theme/density and the pinned nav slots (UI.md §11).
 * Deliberately separate from the future game-save store — this is chrome
 * preference, not something that lives inside a save file.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Shell, Theme, Density } from "@bushleague/sim-kit";

interface UiStore {
  shell: Shell;
  theme: Theme;
  density: Density;
  pins: string[];
  setShell: (s: Shell) => void;
  setTheme: (t: Theme) => void;
  setDensity: (d: Density) => void;
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      shell: "ootp",
      theme: "dark",
      density: "compact",
      pins: ["office", "roster", "standings", "books"],
      setShell: (shell) => set({ shell }),
      setTheme: (theme) => set({ theme }),
      setDensity: (density) => set({ density }),
    }),
    { name: "bushleague-ui-prefs" },
  ),
);
