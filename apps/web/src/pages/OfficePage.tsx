/**
 * The Office — home page. Layout per UI.md §13.1's revised spec (Jordan's
 * sign-off, 2026-08-27): six dense panels, no hero figure. Hierarchy comes
 * from position, weight and the accent rule (UI.md's rule extracted from
 * that revision), not from one big number.
 *
 * Real data once a save exists — no fabricated numbers (LAWS.md Law 12,
 * this project's whole culture on the point). Two panels stay honestly
 * empty even with a real save: "Needs you" (no decision-queue system
 * exists yet — nothing yet generates a lineup-not-set or an offer-expiring
 * entry) and "Wire" (no news system exists yet). The financial panel
 * shows the REAL ledger's this-month income statement, which is real and
 * currently near-zero — no gate-revenue or payroll posting system exists
 * yet either (`DECISIONS.md`, the pass after this one) — not a fabricated
 * placeholder standing in for one.
 */
import { dateToSerial, formatShort, incomeStatement, money, toSerial, winPct } from "@bushleague/sim-kit";
import { useGameStore } from "../store/gameStore.js";
import { divisionStandings, nextGameFor, ownedClub } from "../store/selectors.js";

function Panel({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-b" style={{ borderColor: "var(--c-border)" }}>
      <header className="flex items-center justify-between px-[var(--sp-3)] py-[var(--sp-1)]">
        <h2
          className="text-[var(--fs-sm)] font-semibold"
          style={{ color: "var(--c-dim)", textTransform: "var(--shell-label-case)" as never, letterSpacing: "var(--shell-label-track)" }}
        >
          {title}
        </h2>
        {right}
      </header>
      <div className="px-[var(--sp-3)] pb-[var(--sp-3)]">{children}</div>
    </section>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[var(--fs-sm)]" style={{ color: "var(--c-dim2)" }}>
      {children}
    </p>
  );
}

export default function OfficePage() {
  const state = useGameStore((s) => s.state);

  if (!state) {
    return (
      <div className="flex h-full flex-col overflow-y-auto">
        <Panel title="Needs you">
          <EmptyLine>No game in progress yet. Starting a game is a later pass.</EmptyLine>
        </Panel>
      </div>
    );
  }

  const club = ownedClub(state);
  const next = club ? nextGameFor(state, club.id) : null;
  const standings = club ? divisionStandings(state, club) : [];
  const myRow = standings.findIndex((r) => r.club.id === club?.id);
  const nearby = standings.slice(Math.max(0, myRow - 1), Math.max(0, myRow - 1) + 3);

  const monthStart = toSerial(state.date.y, state.date.m, 1);
  const today = dateToSerial(state.date);
  const monthIS = incomeStatement(state.ledger, monthStart, today);

  const l10 = club?.l10 ?? [];
  const l10Wins = l10.reduce((t, v) => t + v, 0);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <Panel title="Needs you">
        <EmptyLine>Nothing waiting on you yet — the decision queue is a later pass.</EmptyLine>
      </Panel>

      <Panel title="Tonight">
        {next ? (
          <p className="text-[var(--fs-md)]">
            {next.home ? "vs" : "@"} {next.opponent.abbr} · {formatShort({ y: state.date.y, m: state.date.m, d: state.date.d })}
          </p>
        ) : (
          <EmptyLine>Nothing left on the schedule for {club?.abbr ?? "your club"} this season.</EmptyLine>
        )}
      </Panel>

      <div className="grid grid-cols-2 border-b" style={{ borderColor: "var(--c-border)" }}>
        <div className="border-r px-[var(--sp-3)] py-[var(--sp-1)]" style={{ borderColor: "var(--c-border)" }}>
          <h2 className="text-[var(--fs-sm)] font-semibold" style={{ color: "var(--c-dim)" }}>
            {club ? `${club.div}` : "Standings"}
          </h2>
          {nearby.length ? (
            <div className="num text-[var(--fs-sm)]">
              {nearby.map((row) => (
                <div
                  key={row.club.id}
                  className="flex justify-between"
                  style={{ color: row.club.id === club?.id ? "var(--c-accent)" : "var(--c-text)" }}
                >
                  <span>{row.club.abbr}</span>
                  <span>
                    {row.club.w}-{row.club.l}
                  </span>
                  <span>{row.gb === 0 ? "—" : row.gb.toFixed(1)}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyLine>No world yet.</EmptyLine>
          )}
        </div>
        <div className="px-[var(--sp-3)] py-[var(--sp-1)]">
          <h2 className="text-[var(--fs-sm)] font-semibold" style={{ color: "var(--c-dim)" }}>
            Last 10
          </h2>
          {l10.length ? (
            <div className="text-[var(--fs-sm)]">
              <p className="num">
                {l10Wins}-{l10.length - l10Wins}
              </p>
              <p style={{ color: "var(--c-dim)" }}>
                {club!.w}-{club!.l} ({winPct(club!.w, club!.l)}) overall
              </p>
            </div>
          ) : (
            <EmptyLine>No games played yet.</EmptyLine>
          )}
        </div>
      </div>

      <Panel title="This month">
        {monthIS.totalRev === 0 && monthIS.totalExp === 0 ? (
          <EmptyLine>
            No entries this period. Gate revenue and payroll posting are a later pass — the ledger engine
            itself (LAWS.md Law 4) is real and tested; nothing posts to it yet.
          </EmptyLine>
        ) : (
          <div className="num text-[var(--fs-sm)]">
            <div className="flex justify-between">
              <span style={{ color: "var(--c-dim)" }}>Revenue</span>
              <span>{money(monthIS.totalRev)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--c-dim)" }}>Expenses</span>
              <span>{money(monthIS.totalExp)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Net</span>
              <span style={{ color: monthIS.net >= 0 ? "var(--c-pos)" : "var(--c-neg)" }}>{money(monthIS.net)}</span>
            </div>
          </div>
        )}
      </Panel>

      <Panel title="Wire">
        <EmptyLine>Quiet week. The wire fills after the market and winter passes.</EmptyLine>
      </Panel>
    </div>
  );
}
