/**
 * Settings — the chrome preferences, on a screen at last.
 *
 * Shell, theme and density have all worked since the chassis pass; there
 * was simply nowhere to change them except by editing localStorage. The
 * registry said as much ("soon — shell/theme/density already work, this is
 * just the screen for it") and it was right.
 *
 * These are NOT part of the save (`uiStore` is a separate persisted store,
 * by design) — they follow the browser, not the game. The page says so,
 * because a player who themes their club and then loads the save elsewhere
 * should not be surprised.
 */
import type { Density, Shell, Theme } from "@bushleague/sim-kit";
import { useUiStore } from "../store/uiStore.js";
import { Field, Panel, Segmented, type SegOption } from "../components/ui.js";

const SHELLS: readonly SegOption<Shell>[] = [
  { id: "ootp", label: "Front office", note: "Dense rows, small-caps labels — the default." },
  { id: "desk", label: "Trading desk", note: "Squarer, monospaced chrome, tighter rules." },
];

const THEMES: readonly SegOption<Theme>[] = [
  { id: "dark", label: "Dark", note: "The flagship. Every colour is solved against it first." },
  { id: "light", label: "Light", note: "Solved to the same contrast rule (D18), not an afterthought." },
];

const DENSITIES: readonly SegOption<Density>[] = [
  { id: "dense", label: "Dense", note: "Most rows on screen. Built for a phone held close." },
  { id: "compact", label: "Compact", note: "The default — dense without crowding." },
  { id: "standard", label: "Standard", note: "Roomier rows, fewer of them." },
];

export default function SettingsPage() {
  const shell = useUiStore((s) => s.shell);
  const theme = useUiStore((s) => s.theme);
  const density = useUiStore((s) => s.density);
  const setShell = useUiStore((s) => s.setShell);
  const setTheme = useUiStore((s) => s.setTheme);
  const setDensity = useUiStore((s) => s.setDensity);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <Panel title="Appearance">
        <Field label="Shell">
          <Segmented label="Shell" options={SHELLS} value={shell} onChange={setShell} />
        </Field>
        <Field label="Theme">
          <Segmented label="Theme" options={THEMES} value={theme} onChange={setTheme} />
        </Field>
        <Field label="Density">
          <Segmented label="Density" options={DENSITIES} value={density} onChange={setDensity} />
        </Field>
      </Panel>

      <Panel title="Where these live">
        <p className="text-[var(--fs-sm)]" style={{ color: "var(--c-dim2)" }}>
          Appearance follows this browser, not your save. Load the same club on another device and it will look
          however that device is set — the club, the money and the players come with the save; the furniture does
          not.
        </p>
      </Panel>
    </div>
  );
}
