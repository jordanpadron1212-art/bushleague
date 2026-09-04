/**
 * The Office — home page. Layout per UI.md §13.1's revised spec (Jordan's
 * sign-off, 2026-08-27): six dense panels, no hero figure. Hierarchy comes
 * from position, weight and the accent rule (UI.md's rule extracted from
 * that revision), not from one big number.
 *
 * No game engine has been ported into this stack yet (see registry.tsx) —
 * every panel below is the real layout with its real empty state (UI.md
 * §10's Components table), not fabricated game data. That's a deliberate
 * choice, not a placeholder cut corner: the alternative was inventing a
 * fake club with fake stats, which is exactly what LAWS.md Law 12 forbids
 * for baseball figures and what this project's whole culture argues against
 * for anything else a player might mistake for real state.
 */

function Panel({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className="border-b"
      style={{ borderColor: "var(--c-border)" }}
    >
      <header className="flex items-center justify-between px-[var(--sp-3)] py-[var(--sp-1)]">
        <h2
          className="text-[var(--fs-sm)] font-semibold"
          style={{
            color: "var(--c-dim)",
            textTransform: "var(--shell-label-case)" as never,
            letterSpacing: "var(--shell-label-track)",
          }}
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
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <Panel title="Needs you">
        <EmptyLine>No game in progress yet. Starting a game is a later pass.</EmptyLine>
      </Panel>

      <Panel title="Tonight">
        <EmptyLine>No schedule yet — world generation and the schedule are a later pass.</EmptyLine>
      </Panel>

      <div className="grid grid-cols-2 border-b" style={{ borderColor: "var(--c-border)" }}>
        <div className="border-r px-[var(--sp-3)] py-[var(--sp-1)]" style={{ borderColor: "var(--c-border)" }}>
          <h2 className="text-[var(--fs-sm)] font-semibold" style={{ color: "var(--c-dim)" }}>
            Standings
          </h2>
          <EmptyLine>No world yet.</EmptyLine>
        </div>
        <div className="px-[var(--sp-3)] py-[var(--sp-1)]">
          <h2 className="text-[var(--fs-sm)] font-semibold" style={{ color: "var(--c-dim)" }}>
            Last 10
          </h2>
          <EmptyLine>No games played yet.</EmptyLine>
        </div>
      </div>

      <Panel title="This month">
        <EmptyLine>
          No entries this period. Gate revenue posts after your first home date — the ledger engine
          (LAWS.md Law 4) already exists in <code className="num">@bushleague/sim-kit</code> and is
          tested; this screen is wired up to it in the books UI pass.
        </EmptyLine>
      </Panel>

      <Panel title="Wire">
        <EmptyLine>Quiet week. The wire fills after your first advance.</EmptyLine>
      </Panel>
    </div>
  );
}
