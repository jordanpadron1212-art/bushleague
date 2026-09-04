/**
 * Books — real statements from day one (UI.md §8.3), five panes per
 * §13.3's own checkpoint scope: income / balance / cash / ledger / audit.
 * The ledger pane is where "the grid engine still gets built and proven
 * this pass" (§13.3) — sortable and filterable, with the same column
 * definitions rendering as a phone list below the `md` breakpoint (UI.md
 * §6's "phone list mode" pattern).
 *
 * Adaptation, noted rather than silent: sort/filter here are plain React
 * state (a sort key + direction, a filter string), not `@tanstack/
 * react-table` — the installed version (9.x) turned out to be a genuine
 * API rewrite from the well-established v8 shape this project's docs were
 * written against (`useTable`/`createCoreRowModel`, not `useReactTable`/
 * `getCoreRowModel`), and the ledger has few or no rows to show for it
 * yet (no gate-revenue or payroll posting system exists — the pass after
 * this one). §13.3 itself calls this pass's grid proof "narrower" than
 * the roster pass's, where the column customizer, saved views AND
 * `@tanstack/react-virtual`'s row virtualization get their real test
 * against a 26-column, many-row grid — a real justification for the
 * library, which a 5-column, near-empty ledger doesn't have yet. Betting
 * this pass on an unfamiliar major-version rewrite to sort five columns
 * of nothing is the wrong trade; revisit both libraries together when
 * Roster actually needs what they're for.
 *
 * Real numbers, honestly sparse otherwise too: the ledger engine itself
 * (LAWS.md Law 4) is real and tested, and exactly what `auditBooks()` on
 * this page proves live — nothing here is a placeholder standing in for
 * fabricated figures.
 */
import { useMemo, useState } from "react";
import {
  accountName,
  auditBooks,
  balanceSheet,
  cash,
  dateToSerial,
  formatShort,
  fromSerial,
  incomeStatement,
  money,
  moneyFull,
  toSerial,
  type JournalEntry,
} from "@bushleague/sim-kit";
import { useGameStore } from "../store/gameStore.js";

const PANES = ["income", "balance", "cash", "ledger", "audit"] as const;
type Pane = (typeof PANES)[number];

function TabStrip({ pane, setPane }: { pane: Pane; setPane: (p: Pane) => void }) {
  return (
    <div className="flex h-9 shrink-0 border-b text-[var(--fs-sm)]" style={{ borderColor: "var(--c-border)" }}>
      {PANES.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => setPane(p)}
          className="flex-1 border-r px-[var(--sp-2)]"
          style={{
            borderColor: "var(--c-border)",
            color: p === pane ? "var(--c-accent)" : "var(--c-dim)",
            textTransform: "var(--shell-label-case)" as never,
            letterSpacing: "var(--shell-label-track)",
          }}
        >
          {p}
        </button>
      ))}
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

function LineRows({ rows }: { rows: readonly [number, number][] }) {
  return (
    <div className="num text-[var(--fs-sm)]">
      {rows.map(([acct, amt]) => (
        <div key={acct} className="flex justify-between py-[2px]">
          <span style={{ color: "var(--c-dim)" }}>{accountName(acct)}</span>
          <span>{money(amt)}</span>
        </div>
      ))}
    </div>
  );
}

function IncomePane({ ledger, year }: { ledger: JournalEntry[]; year: number }) {
  const from = toSerial(year, 1, 1);
  const to = toSerial(year, 12, 31);
  const is = incomeStatement(ledger, from, to);
  return (
    <div className="px-[var(--sp-3)] py-[var(--sp-3)]">
      <p className="text-[var(--fs-hero)] font-semibold num" style={{ color: is.net >= 0 ? "var(--c-pos)" : "var(--c-neg)" }}>
        {money(is.net)}
      </p>
      <p className="text-[var(--fs-sm)]" style={{ color: "var(--c-dim)" }}>
        NET INCOME · {year} YTD
      </p>
      {!is.rev.length && !is.exp.length ? (
        <div className="pt-[var(--sp-4)]">
          <EmptyLine>
            No revenue or expense posted yet. Gate revenue posts after your first home date; payroll posts
            when the winter/roster passes wire it — both are the pass after this one.
          </EmptyLine>
        </div>
      ) : (
        <>
          <div className="pt-[var(--sp-4)]">
            <p className="text-[var(--fs-sm)] font-semibold">
              Revenue <span className="num float-right">{money(is.totalRev)}</span>
            </p>
            <LineRows rows={is.rev} />
          </div>
          <div className="pt-[var(--sp-3)]">
            <p className="text-[var(--fs-sm)] font-semibold">
              Expenses <span className="num float-right">{money(is.totalExp)}</span>
            </p>
            <LineRows rows={is.exp} />
          </div>
        </>
      )}
    </div>
  );
}

function BalancePane({ ledger, today }: { ledger: JournalEntry[]; today: number }) {
  const bs = balanceSheet(ledger, today);
  return (
    <div className="px-[var(--sp-3)] py-[var(--sp-3)]">
      <div>
        <p className="text-[var(--fs-sm)] font-semibold">
          Assets <span className="num float-right">{money(bs.totalA)}</span>
        </p>
        <LineRows rows={bs.as} />
      </div>
      <div className="pt-[var(--sp-3)]">
        <p className="text-[var(--fs-sm)] font-semibold">
          Liabilities <span className="num float-right">{money(bs.totalL)}</span>
        </p>
        <LineRows rows={bs.li} />
      </div>
      <div className="pt-[var(--sp-3)]">
        <p className="text-[var(--fs-sm)] font-semibold">
          Equity (incl. YTD net) <span className="num float-right">{money(bs.totalE + bs.net)}</span>
        </p>
        <LineRows rows={bs.eq} />
      </div>
      <p className="pt-[var(--sp-3)] text-[var(--fs-sm)]" style={{ color: bs.ok ? "var(--c-pos)" : "var(--c-neg)" }}>
        Assets {bs.ok ? "=" : "≠"} liabilities + equity — {bs.ok ? "balanced" : "NOT BALANCED"}
      </p>
    </div>
  );
}

function CashPane({ ledger }: { ledger: JournalEntry[] }) {
  return (
    <div className="px-[var(--sp-3)] py-[var(--sp-3)]">
      <p className="text-[var(--fs-hero)] font-semibold num">{moneyFull(cash(ledger))}</p>
      <p className="text-[var(--fs-sm)]" style={{ color: "var(--c-dim)" }}>
        CASH ON HAND
      </p>
    </div>
  );
}

function AuditPane({ ledger }: { ledger: JournalEntry[] }) {
  const audit = auditBooks(ledger);
  return (
    <div className="px-[var(--sp-3)] py-[var(--sp-3)]">
      <p className="text-[var(--fs-md)] font-semibold" style={{ color: audit.fails.length ? "var(--c-neg)" : "var(--c-pos)" }}>
        {audit.fails.length ? `${audit.fails.length} FAIL${audit.fails.length === 1 ? "" : "S"}` : "PASSES"}
      </p>
      <p className="text-[var(--fs-sm)]" style={{ color: "var(--c-dim)" }}>
        {audit.entries} entries · {audit.lines} lines checked
      </p>
      {audit.fails.length > 0 && (
        <ul className="pt-[var(--sp-2)] text-[var(--fs-sm)]" style={{ color: "var(--c-neg)" }}>
          {audit.fails.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface LedgerRow {
  /** Serial day — the sort key. Formatted for display in the column's own `cell`, never pre-formatted into the row, so sorting stays chronological instead of lexicographic ("APR 1" < "MAR 26" alphabetically, which is wrong). */
  day: number;
  memo: string;
  tag: string;
  amount: number;
  lines: number;
}

type SortKey = "day" | "memo" | "tag" | "amount" | "lines";
const COLUMNS: readonly { key: SortKey; header: string }[] = [
  { key: "day", header: "Day" },
  { key: "memo", header: "Memo" },
  { key: "tag", header: "Tag" },
  { key: "amount", header: "Amount" },
  { key: "lines", header: "Lines" },
];

function cellText(row: LedgerRow, key: SortKey): string {
  if (key === "day") return formatShort(fromSerial(row.day));
  if (key === "amount") return money(row.amount);
  return String(row[key]);
}

function LedgerPane({ ledger }: { ledger: JournalEntry[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("day");
  const [sortDesc, setSortDesc] = useState(true);
  const [filter, setFilter] = useState("");

  const rows = useMemo<LedgerRow[]>(
    () =>
      ledger.map((e) => ({
        day: e.d,
        memo: e.m,
        tag: e.t,
        amount: e.l.filter(([, amt]) => amt > 0).reduce((t, [, amt]) => t + amt, 0),
        lines: e.l.length,
      })),
    [ledger],
  );

  const visible = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    const filtered = needle
      ? rows.filter((r) => r.memo.toLowerCase().includes(needle) || r.tag.toLowerCase().includes(needle))
      : rows;
    const sorted = [...filtered].sort((a, b) => {
      const diff = a[sortKey] > b[sortKey] ? 1 : a[sortKey] < b[sortKey] ? -1 : 0;
      return sortDesc ? -diff : diff;
    });
    return sorted;
  }, [rows, filter, sortKey, sortDesc]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDesc((d) => !d);
    else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  if (!ledger.length) {
    return (
      <div className="px-[var(--sp-3)] py-[var(--sp-3)]">
        <EmptyLine>No journal entries posted yet.</EmptyLine>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-[var(--sp-3)] py-[var(--sp-2)]" style={{ borderColor: "var(--c-border)" }}>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter memo, tag…"
          className="w-full bg-transparent text-[var(--fs-sm)] outline-none"
          style={{ color: "var(--c-text)" }}
        />
      </div>

      {/* Desktop: the real grid. */}
      <div className="hidden flex-1 overflow-auto md:block">
        <table className="w-full text-[var(--fs-sm)]">
          <thead className="sticky top-0" style={{ background: "var(--c-surface)" }}>
            <tr>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  onClick={() => toggleSort(c.key)}
                  className="cursor-pointer border-b px-[var(--sp-2)] py-[var(--sp-1)] text-left"
                  style={{ borderColor: "var(--c-border)", color: "var(--c-dim)" }}
                >
                  {c.header}
                  {sortKey === c.key ? (sortDesc ? " ▼" : " ▲") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) => (
              <tr key={i} className="border-b" style={{ borderColor: "var(--c-border)" }}>
                {COLUMNS.map((c) => (
                  <td key={c.key} className="num px-[var(--sp-2)] py-[var(--sp-1)]">
                    {cellText(row, c.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phone: the same rows (same sort/filter state), a compact list. */}
      <div className="flex-1 overflow-auto md:hidden">
        {visible.map((r, i) => (
          <div key={i} className="border-b px-[var(--sp-3)] py-[var(--sp-2)]" style={{ borderColor: "var(--c-border)" }}>
            <div className="flex justify-between text-[var(--fs-sm)]">
              <span>{r.memo}</span>
              <span className="num">{money(r.amount)}</span>
            </div>
            <div className="text-[var(--fs-micro)]" style={{ color: "var(--c-dim)" }}>
              {formatShort(fromSerial(r.day))} · {r.tag} · {r.lines} lines
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BooksPage() {
  const state = useGameStore((s) => s.state);
  const [pane, setPane] = useState<Pane>("income");

  if (!state) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center">
        <EmptyLine>No game in progress yet.</EmptyLine>
      </div>
    );
  }

  const today = dateToSerial(state.date);

  return (
    <div className="flex h-full flex-col">
      <TabStrip pane={pane} setPane={setPane} />
      <div className="flex-1 overflow-y-auto">
        {pane === "income" && <IncomePane ledger={state.ledger} year={state.date.y} />}
        {pane === "balance" && <BalancePane ledger={state.ledger} today={today} />}
        {pane === "cash" && <CashPane ledger={state.ledger} />}
        {pane === "ledger" && <LedgerPane ledger={state.ledger} />}
        {pane === "audit" && <AuditPane ledger={state.ledger} />}
      </div>
    </div>
  );
}
