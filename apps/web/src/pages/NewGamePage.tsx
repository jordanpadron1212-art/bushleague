/**
 * Choose your club — shown before a save exists. Not speced in UI.md,
 * which jumps straight from "no save" to the Office/Books mockups without
 * ever drawing this screen; flagged as an open gap rather than silently
 * invented as if it were signed off (HANDOFF.md's "Waiting for you" list
 * carries it). Kept deliberately minimal: the real 30 MLB clubs, grouped
 * by their real league and division (`world-data.ts`'s own `MLB` table —
 * the same data `buildWorld()` generates from), one tap to start. The
 * fuller "pick your path down the ladder" flow (an indy club, one of the
 * 120 affiliates) waits for whichever pass builds the ownership ladder —
 * this is the checkpoint's own stated target, "all 30 MLB clubs," not
 * a smaller slice of it.
 */
import { useState } from "react";
import { MLB } from "@bushleague/sim-kit";
import { useGameStore } from "../store/gameStore.js";

const DIVISIONS: readonly ["East", "Central", "West"] = ["East", "Central", "West"];

export default function NewGamePage() {
  const startNewGame = useGameStore((s) => s.startNewGame);
  const loading = useGameStore((s) => s.loading);
  const error = useGameStore((s) => s.error);
  const [starting, setStarting] = useState<string | null>(null);

  const choose = (abbr: string) => {
    setStarting(abbr);
    void startNewGame({ ownedClubId: `MLB_${abbr}` });
  };

  return (
    <div className="flex h-dvh flex-col overflow-y-auto" style={{ background: "var(--c-bg)", color: "var(--c-text)" }}>
      <header className="border-b px-[var(--sp-4)] py-[var(--sp-4)]" style={{ borderColor: "var(--c-border)" }}>
        <h1 className="text-[var(--fs-lg)] font-semibold">Bush League</h1>
        <p className="text-[var(--fs-sm)]" style={{ color: "var(--c-dim)" }}>
          Choose the club you&rsquo;ll own. The rest of baseball — 218 real clubs, five independent
          leagues, a full schedule — generates around it.
        </p>
      </header>

      {error && (
        <div className="px-[var(--sp-4)] py-[var(--sp-2)] text-[var(--fs-sm)]" style={{ color: "var(--c-neg)" }}>
          {error}
        </div>
      )}

      <div className="flex-1 px-[var(--sp-4)] py-[var(--sp-3)]">
        {(["AL", "NL"] as const).map((league) => (
          <section key={league} className="mb-[var(--sp-4)]">
            <h2
              className="mb-[var(--sp-2)] text-[var(--fs-sm)] font-semibold"
              style={{ color: "var(--c-dim)", textTransform: "var(--shell-label-case)" as never, letterSpacing: "var(--shell-label-track)" }}
            >
              {league === "AL" ? "American League" : "National League"}
            </h2>
            {DIVISIONS.map((division) => (
              <div key={division} className="mb-[var(--sp-3)]">
                <h3 className="mb-[var(--sp-1)] text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
                  {division}
                </h3>
                <div className="grid grid-cols-2 gap-[var(--sp-2)] sm:grid-cols-3 md:grid-cols-5">
                  {MLB.filter(([, , , lg, div]) => lg === league && div === division).map(([abbr, city, name]) => (
                    <button
                      key={abbr}
                      type="button"
                      disabled={loading}
                      onClick={() => choose(abbr)}
                      className="border px-[var(--sp-2)] py-[var(--sp-2)] text-left text-[var(--fs-sm)] disabled:opacity-50"
                      style={{ borderColor: "var(--c-border)", background: "var(--c-surface)" }}
                    >
                      <div className="font-semibold">{abbr}</div>
                      <div style={{ color: "var(--c-dim)" }}>
                        {starting === abbr && loading ? "Generating…" : `${city} ${name}`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
