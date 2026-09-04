/**
 * The amateur draft (DECISIONS.md D93) — UI.md's registry had this
 * declared dark since v1 ("lights at: the scouting + draft pass"). Every
 * pick is a real, sourced-shape decision (`draft.ts`'s 20 rounds, the
 * worst-record-first order with the real top-6 lottery) rendered here
 * exactly as it happened — a browsable draft board, not a placeholder.
 *
 * No pick is interactive (DECISIONS.md D93's own scope note: an in-the-
 * moment "your turn" flow needs the rollover state machine to pause and
 * resume around real input, which nothing in this engine does yet). What
 * IS real and owner-facing: the philosophy dial that decides how the
 * owned club's OWN picks get made at the next rollover — `BPA`/`NEED`/
 * `UPSIDE`, the one lever an otherwise fully-automatic draft gives the
 * owner today.
 *
 * Every scouted grade shown is genuinely noisy (Law 10, D24, D90) — a
 * freshly-drafted 18-year-old with zero accumulated sample reads with real
 * uncertainty, the same honesty the rest of the game already has for every
 * other player. This page doesn't pretend otherwise.
 */
import { useMemo, useState } from "react";
import { DRAFT_PHILOSOPHIES, DRAFT_ROUNDS, type DraftPhilosophy, type DraftPickResult } from "@bushleague/sim-kit";
import { useGameStore } from "../store/gameStore.js";
import { ownedClub } from "../store/selectors.js";

const PHILOSOPHY_LABEL: Record<DraftPhilosophy, string> = {
  BPA: "Best available",
  NEED: "Fill needs",
  UPSIDE: "Upside",
};

const PHILOSOPHY_HINT: Record<DraftPhilosophy, string> = {
  BPA: "Always the single highest-scouted prospect left on the board.",
  NEED: "Leans toward whichever of pitching or hitting your org is thinner on.",
  UPSIDE: "Chases ceiling (ranks by potential, not today's grade).",
};

function StatTile({ label, value, context }: { label: string; value: string; context?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-[2px]">
      <span
        className="truncate text-[var(--fs-micro)]"
        style={{ color: "var(--c-dim)", textTransform: "var(--shell-label-case)" as never, letterSpacing: "var(--shell-label-track)" }}
      >
        {label}
      </span>
      <span className="num truncate text-[var(--fs-lg)] font-semibold">{value}</span>
      {context && (
        <span className="truncate text-[var(--fs-sm)]" style={{ color: "var(--c-dim)" }}>
          {context}
        </span>
      )}
    </div>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[var(--fs-sm)]" style={{ color: "var(--c-dim2)" }}>
      {children}
    </p>
  );
}

function clubAbbrOf(clubs: readonly { id: string; abbr: string }[], clubId: string): string {
  return clubs.find((c) => c.id === clubId)?.abbr ?? clubId;
}

function PickRow({ pick, abbr, mine }: { pick: DraftPickResult; abbr: string; mine: boolean }) {
  return (
    <div
      className="flex items-center gap-[var(--sp-2)] py-[var(--sp-2)] pr-[var(--sp-3)]"
      style={{ borderLeft: `3px solid ${mine ? "var(--c-accent)" : "transparent"}`, paddingLeft: "calc(var(--sp-3) - 3px)" }}
    >
      <span className="num w-9 shrink-0 text-right text-[var(--fs-sm)]" style={{ color: "var(--c-dim)" }}>
        {pick.overall}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[var(--fs-base)]" style={{ color: mine ? "var(--c-accent)" : "var(--c-text)" }}>
          {pick.name}
        </div>
        <div className="num truncate text-[var(--fs-sm)]" style={{ color: "var(--c-dim)" }}>
          {abbr} · {pick.pos} · {pick.age}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="num text-[var(--fs-md)] font-semibold">{pick.ovr}</div>
        <div className="num text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
          pot {pick.pot}
        </div>
      </div>
    </div>
  );
}

function RoundSection({
  round,
  picks,
  clubs,
  ownedClubId,
}: {
  round: number;
  picks: DraftPickResult[];
  clubs: readonly { id: string; abbr: string }[];
  ownedClubId: string | null;
}) {
  return (
    <div>
      <div
        className="sticky top-0 flex items-baseline justify-between px-[var(--sp-3)] py-[var(--sp-1)]"
        style={{ background: "var(--c-bg)", borderBottom: "1px solid var(--c-border)" }}
      >
        <span
          className="text-[var(--fs-sm)] font-semibold"
          style={{ color: "var(--c-dim)", textTransform: "var(--shell-label-case)" as never, letterSpacing: "var(--shell-label-track)" }}
        >
          Round {round}
        </span>
        <span className="num text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
          {picks.length} pick{picks.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="px-[var(--sp-3)]">
        {picks.map((p) => (
          <PickRow key={p.overall} pick={p} abbr={clubAbbrOf(clubs, p.clubId)} mine={p.clubId === ownedClubId} />
        ))}
      </div>
    </div>
  );
}

type FilterTab = "all" | "mine";

export default function DraftPage() {
  const state = useGameStore((s) => s.state);
  const setDraftPhilosophy = useGameStore((s) => s.setDraftPhilosophy);
  const [tab, setTab] = useState<FilterTab>("mine");
  const [query, setQuery] = useState("");

  const club = state ? ownedClub(state) : null;
  const picks = state?.lastDraft ?? null;

  const filtered = useMemo(() => {
    if (!picks) return [];
    const needle = query.trim().toLowerCase();
    return picks.filter((p) => {
      if (tab === "mine" && p.clubId !== state?.ownedClubId) return false;
      if (needle && !p.name.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [picks, tab, query, state?.ownedClubId]);

  const grouped = useMemo(() => {
    const byRound = new Map<number, DraftPickResult[]>();
    for (const p of filtered) {
      const list = byRound.get(p.round);
      if (list) list.push(p);
      else byRound.set(p.round, [p]);
    }
    return [...byRound.entries()].sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  if (!state) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center">
        <EmptyLine>No game in progress yet.</EmptyLine>
      </div>
    );
  }

  const myPicksCount = picks?.filter((p) => p.clubId === state.ownedClubId).length ?? 0;
  const myFirstPick = picks?.find((p) => p.clubId === state.ownedClubId);
  const philosophy = state.draftPhilosophy;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <section className="border-b" style={{ borderColor: "var(--c-border)" }}>
        <div className="grid grid-cols-2 gap-x-[var(--sp-3)] gap-y-[var(--sp-3)] px-[var(--sp-3)] py-[var(--sp-3)]">
          <StatTile label="Rounds" value={String(DRAFT_ROUNDS)} context="30 clubs" />
          <StatTile label="Total picks" value={picks ? String(picks.length) : "—"} context={picks ? "this class" : "no draft yet"} />
          <StatTile
            label={`${club?.abbr ?? "your"} picks`}
            value={picks ? String(myPicksCount) : "—"}
            context={myFirstPick ? `first #${myFirstPick.overall}` : undefined}
          />
          <StatTile label="Philosophy" value={PHILOSOPHY_LABEL[philosophy]} context="next draft only" />
        </div>
      </section>

      <section className="border-b px-[var(--sp-3)] py-[var(--sp-2)]" style={{ borderColor: "var(--c-border)" }}>
        <div
          className="text-[var(--fs-sm)] font-semibold"
          style={{ color: "var(--c-dim)", textTransform: "var(--shell-label-case)" as never, letterSpacing: "var(--shell-label-track)" }}
        >
          Your draft philosophy
        </div>
        <div className="mt-[var(--sp-2)] flex gap-[var(--sp-2)]">
          {DRAFT_PHILOSOPHIES.map((ph) => (
            <button
              key={ph}
              type="button"
              onClick={() => void setDraftPhilosophy(ph)}
              className="flex-1 border px-[var(--sp-2)] py-[var(--sp-2)] text-[var(--fs-sm)]"
              style={{
                borderColor: ph === philosophy ? "var(--c-accent)" : "var(--c-border)",
                color: ph === philosophy ? "var(--c-accent)" : "var(--c-text)",
                borderRadius: "var(--shell-radius)",
              }}
              aria-pressed={ph === philosophy}
            >
              {PHILOSOPHY_LABEL[ph]}
            </button>
          ))}
        </div>
        <p className="mt-[var(--sp-1)] text-[var(--fs-sm)]" style={{ color: "var(--c-dim)" }}>
          {PHILOSOPHY_HINT[philosophy]}
        </p>
      </section>

      {!picks ? (
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <div>
            <p className="text-[var(--fs-md)]">No draft yet.</p>
            <p className="mt-[var(--sp-1)] text-[var(--fs-sm)]" style={{ color: "var(--c-dim2)" }}>
              The amateur draft runs automatically at your next rollover — every club picks once per
              round, 20 rounds, worst record first. Set your philosophy above before it happens.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex border-b" style={{ borderColor: "var(--c-border)" }}>
            {(["mine", "all"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className="flex-1 border-r px-[var(--sp-2)] py-[var(--sp-2)] text-[var(--fs-sm)]"
                style={{
                  borderColor: "var(--c-border)",
                  color: tab === t ? "var(--c-accent)" : "var(--c-dim)",
                  textTransform: "var(--shell-label-case)" as never,
                  letterSpacing: "var(--shell-label-track)",
                }}
              >
                {t === "mine" ? `${club?.abbr ?? "Mine"} only` : "All 30 clubs"}
              </button>
            ))}
          </div>
          <div className="border-b px-[var(--sp-3)] py-[var(--sp-2)]" style={{ borderColor: "var(--c-border)" }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by name…"
              className="w-full bg-transparent text-[var(--fs-sm)] outline-none"
              style={{ color: "var(--c-text)" }}
            />
          </div>

          <div className="flex-1">
            {grouped.length === 0 ? (
              <div className="px-[var(--sp-3)] py-[var(--sp-4)]">
                <EmptyLine>No picks match `{query}`. Clear the filter to see them.</EmptyLine>
              </div>
            ) : (
              grouped.map(([round, roundPicks]) => (
                <RoundSection key={round} round={round} picks={roundPicks} clubs={state.world.clubs} ownedClubId={state.ownedClubId} />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
