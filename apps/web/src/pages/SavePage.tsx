/**
 * Save — what is on disk, and how to get it off this device.
 *
 * TWO REAL GAPS CLOSED HERE, both of them previously disclosed in the code
 * rather than fixed:
 *
 * 1. `readBackup()` had no caller. `loadGame` takes a pre-migration copy of
 *    the save before it overwrites it (D98), and that copy existed purely
 *    so "a support conversation has something to ask for" — its own
 *    comment. There is now a restore button, and it is honest about what a
 *    restore does and does not repair.
 *
 * 2. The save lived in ONE browser's IndexedDB with no way out. For a
 *    sandbox game meant to run for many seasons that is a real fragility:
 *    clearing site data, a new phone, or a different browser loses
 *    everything. Export writes the save as JSON; import reads one back.
 *
 * IMPORT GOES THROUGH THE MIGRATION FRAMEWORK, not around it. A file picked
 * off a disk is untrusted input of unknown version — exactly what
 * `loadState` exists to vet (`migrate.ts`'s `checkShape` reports EVERY
 * problem, not the first). Writing the parsed object straight into the slot
 * would bypass the one component built to say no.
 */
import { useEffect, useState } from "react";
import { dateToSerial, formatLong, loadState, type GameState } from "@bushleague/sim-kit";
import { useGameStore } from "../store/gameStore.js";
import { deleteSave, hasPendingSave, readBackup, restoreBackup, saveGame } from "../save.js";
import { ownedClub } from "../store/selectors.js";
import { Empty, Field, Panel, StatTile, TileRow } from "../components/ui.js";

function Btn({
  children,
  onClick,
  tone,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: "neg" | "accent";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full border px-[var(--sp-3)] text-left text-[var(--fs-sm)]"
      style={{
        minHeight: "2.75rem",
        borderColor: tone === "neg" ? "var(--c-neg)" : "var(--c-border)",
        color: disabled ? "var(--c-dim2)" : tone === "neg" ? "var(--c-neg)" : tone === "accent" ? "var(--c-accent)" : "var(--c-text)",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

export default function SavePage() {
  const state = useGameStore((s) => s.state);
  const loadFromDisk = useGameStore((s) => s.loadFromDisk);
  const flush = useGameStore((s) => s.flush);
  const [backup, setBackup] = useState<boolean | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [confirmWipe, setConfirmWipe] = useState(false);

  useEffect(() => {
    void readBackup().then((b) => setBackup(b !== undefined));
  }, []);

  const club = state ? ownedClub(state) : null;

  const doExport = () => {
    if (!state) return;
    void flush().then(() => {
      const blob = new Blob([JSON.stringify(state)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bushleague-${club?.abbr ?? "save"}-${state.date.y}-${String(state.date.m).padStart(2, "0")}-${String(state.date.d).padStart(2, "0")}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setNote("Exported. Keep it somewhere that is not this browser.");
    });
  };

  const doImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      void file.text().then(async (text) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
        } catch {
          setNote("That file is not JSON.");
          return;
        }
        // The framework decides, not this page.
        const result = loadState(parsed);
        if (!result.ok) {
          setNote(`That save can't be loaded — ${result.reason}.`);
          return;
        }
        await saveGame(result.state as GameState);
        await loadFromDisk();
        setNote("Imported.");
      });
    };
    input.click();
  };

  const doRestore = () => {
    void restoreBackup().then(async (ok) => {
      if (!ok) {
        setNote("There is no backup to restore.");
        setBackup(false);
        return;
      }
      await loadFromDisk();
      setBackup(false);
      setNote("Restored the pre-upgrade save.");
    });
  };

  const doDelete = () => {
    if (!confirmWipe) {
      setConfirmWipe(true);
      return;
    }
    void deleteSave().then(async () => {
      setConfirmWipe(false);
      await loadFromDisk();
    });
  };

  if (!state) {
    return (
      <div className="flex h-full flex-col overflow-y-auto">
        <Panel title="Save">
          <Empty what="Your save would be described here." why="No game in progress." next="Start one from the club picker." />
        </Panel>
        <Panel title="Bring one in">
          <Btn onClick={doImport} tone="accent">
            Import a save file…
          </Btn>
          {note && (
            <p className="pt-[var(--sp-2)] text-[var(--fs-micro)]" style={{ color: "var(--c-dim)" }}>
              {note}
            </p>
          )}
        </Panel>
      </div>
    );
  }

  const bytes = JSON.stringify(state).length;
  const seasonDay = dateToSerial(state.date);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <TileRow>
        <StatTile
          label="On disk"
          value={`${(bytes / 1048576).toFixed(2)} MB`}
          context={hasPendingSave() ? "a write is queued" : "up to date"}
        />
        <StatTile label="Schema" value={`v${state.v}`} context={`seed ${state.seed}`} />
      </TileRow>

      <Panel title="This save">
        <div className="text-[var(--fs-sm)]">
          <div className="flex justify-between py-[2px]">
            <span style={{ color: "var(--c-dim)" }}>Club</span>
            <span>{club ? `${club.city} ${club.name}` : "—"}</span>
          </div>
          <div className="flex justify-between py-[2px]">
            <span style={{ color: "var(--c-dim)" }}>Date</span>
            <span className="num">{formatLong(state.date)}</span>
          </div>
          <div className="flex justify-between py-[2px]">
            <span style={{ color: "var(--c-dim)" }}>Players</span>
            <span className="num">{state.players.length.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-[2px]">
            <span style={{ color: "var(--c-dim)" }}>Ledger entries</span>
            <span className="num">{state.ledger.length.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-[2px]">
            <span style={{ color: "var(--c-dim)" }}>Started</span>
            <span className="num">{state.created.slice(0, 10)}</span>
          </div>
        </div>
      </Panel>

      <Panel title="Off this device">
        <Field
          label="Export"
          note="Your save lives in this browser's storage and nowhere else. Clearing site data, or picking up a different phone, loses it. A file does not."
        >
          <Btn onClick={doExport} tone="accent">
            Download this save…
          </Btn>
        </Field>
        <Field label="Import" note="Checked and migrated on the way in, the same as a save already on disk. Replaces what is here.">
          <Btn onClick={doImport}>Load a save file…</Btn>
        </Field>
      </Panel>

      {backup && (
        <Panel title="Pre-upgrade backup">
          <Field
            label="Restore"
            note="Taken automatically the last time an upgrade changed this save's format. Restoring puts back the original data — it does not by itself undo a bad upgrade, because the same upgrade runs again on load. It means nothing is lost while a fix ships."
          >
            <Btn onClick={doRestore}>Restore the pre-upgrade save</Btn>
          </Field>
        </Panel>
      )}

      <Panel title="Start over">
        <Btn onClick={doDelete} tone="neg">
          {confirmWipe ? `Delete ${club?.abbr ?? "this save"} permanently — tap again` : "Delete this save…"}
        </Btn>
        {confirmWipe && (
          <button
            type="button"
            onClick={() => setConfirmWipe(false)}
            className="mt-[var(--sp-1)] w-full px-[var(--sp-3)] text-left text-[var(--fs-sm)]"
            style={{ minHeight: "2.75rem", color: "var(--c-dim)" }}
          >
            Keep it
          </button>
        )}
        <p className="pt-[var(--sp-2)] text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
          {seasonDay > 0 ? "There is no undo, and the backup goes with it. Export first." : ""}
        </p>
      </Panel>

      {note && (
        <Panel title="Last action">
          <p className="text-[var(--fs-sm)]" style={{ color: "var(--c-dim)" }}>
            {note}
          </p>
        </Panel>
      )}
    </div>
  );
}
