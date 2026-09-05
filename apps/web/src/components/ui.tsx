/**
 * The shared component layer — `design/DESIGN-SYSTEM.md` §5 ("Reusable, and
 * each already solved once — port rather than reinvent") and the instrument
 * doctrine's own workflow step 3: components before screens, because
 * "screens built before components produce a component library
 * reverse-engineered from accidents."
 *
 * WHY THIS FILE EXISTS NOW. `Panel` and `EmptyLine` lived inside
 * `OfficePage`, which was fine while two pages were lit. This pass lights
 * ten more. Copying a section header ten times is how a design token comes
 * to have two values — the exact failure the doctrine's law 1 names ("if
 * the same selector appears in two places, that is a defect").
 *
 * Everything here is presentational and reads NO store. A component that
 * reaches into `useGameStore` cannot be rendered in a test or reused on a
 * screen that shapes its data differently, and every screen in this pass
 * shapes its data differently.
 */
import type { CSSProperties, ReactNode } from "react";

/* ---------------------------------------------------------------- Section */

/**
 * A titled group. Per the component contract: "the section header should be
 * quieter than the content it contains — a header that shouts is a header
 * competing with the data."
 */
export function Panel({
  title,
  right,
  children,
  bare = false,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  /** Drops the body padding, for a panel whose child owns its own edges (a full-bleed table). */
  bare?: boolean;
}) {
  return (
    <section className="border-b" style={{ borderColor: "var(--c-border)" }}>
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
      <div className={bare ? "pb-[var(--sp-2)]" : "px-[var(--sp-3)] pb-[var(--sp-3)]"}>{children}</div>
    </section>
  );
}

/** The quiet one-line note a panel shows instead of data. */
export function EmptyLine({ children }: { children: ReactNode }) {
  return (
    <p className="text-[var(--fs-sm)]" style={{ color: "var(--c-dim2)" }}>
      {children}
    </p>
  );
}

/**
 * The full empty state, for a list or table that can legitimately hold
 * nothing. Three parts, all required by the contract: what would be here,
 * why it is not, and the one thing that changes it. `EmptyLine` is the
 * one-line version for a panel too small to earn all three.
 */
export function Empty({ what, why, next }: { what: string; why: string; next?: string }) {
  return (
    <div className="px-[var(--sp-3)] py-[var(--sp-4)] text-center">
      <p className="text-[var(--fs-sm)]" style={{ color: "var(--c-dim)" }}>
        {what}
      </p>
      <p className="mt-[var(--sp-1)] text-[var(--fs-sm)]" style={{ color: "var(--c-dim2)" }}>
        {why}
      </p>
      {next && (
        <p className="mt-[var(--sp-1)] text-[var(--fs-sm)]" style={{ color: "var(--c-dim2)" }}>
          {next}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- Stat tiles */

/**
 * One figure, one label, one line of context. The contract's own limits:
 * the value is the largest thing in the tile, and the empty state shows an
 * em dash rather than a zero — "$0 and 'no data' mean different things and
 * conflating them is a real error."
 */
export function StatTile({
  label,
  value,
  context,
  tone,
}: {
  label: string;
  /** `null` renders the em dash — pass it for "not known", never 0. */
  value: string | null;
  context?: ReactNode;
  tone?: "pos" | "neg" | "accent";
}) {
  const color =
    tone === "pos" ? "var(--c-pos)" : tone === "neg" ? "var(--c-neg)" : tone === "accent" ? "var(--c-accent)" : "var(--c-text)";
  return (
    <div className="min-w-0 px-[var(--sp-3)] py-[var(--sp-2)]">
      <div
        className="text-[var(--fs-micro)]"
        style={{
          color: "var(--c-dim2)",
          textTransform: "var(--shell-label-case)" as never,
          letterSpacing: "var(--shell-label-track)",
        }}
      >
        {label}
      </div>
      <div className="num truncate text-[var(--fs-md)] font-semibold" style={{ color }}>
        {value ?? "—"}
      </div>
      {context && (
        <div className="truncate text-[var(--fs-micro)]" style={{ color: "var(--c-dim)" }}>
          {context}
        </div>
      )}
    </div>
  );
}

/** Two tiles per row at 360px — the phone budget's own ceiling. */
export function TileRow({ children }: { children: ReactNode }) {
  return (
    <div
      className="grid grid-cols-2 border-b [&>*]:border-r [&>*:nth-child(2n)]:border-r-0"
      style={{ borderColor: "var(--c-border)" }}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------- Row */

/**
 * The workhorse. Leading slot (ordinal, rank, position), an identity stack
 * that truncates, and a right-aligned figure with an optional sub-figure.
 * `mine` paints §5's 2px accent left edge — rationed, because "a page where
 * every row is marked has marked nothing."
 */
export function DataRow({
  lead,
  name,
  meta,
  value,
  sub,
  mine = false,
  tone,
  onClick,
  title,
}: {
  lead?: ReactNode;
  name: ReactNode;
  meta?: ReactNode;
  value?: ReactNode;
  sub?: ReactNode;
  mine?: boolean;
  tone?: "pos" | "neg";
  onClick?: () => void;
  title?: string;
}) {
  const valueColor = tone === "pos" ? "var(--c-pos)" : tone === "neg" ? "var(--c-neg)" : "var(--c-text)";
  const inner = (
    <>
      {lead !== undefined && (
        <span
          className="num w-[2.25rem] shrink-0 text-[var(--fs-micro)] tabular-nums"
          style={{ color: "var(--c-dim2)" }}
        >
          {lead}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[var(--fs-base)]">{name}</span>
        {meta && (
          <span className="block truncate text-[var(--fs-micro)]" style={{ color: "var(--c-dim)" }}>
            {meta}
          </span>
        )}
      </span>
      {value !== undefined && (
        <span className="shrink-0 text-right">
          <span className="num block text-[var(--fs-base)]" style={{ color: valueColor }}>
            {value}
          </span>
          {sub && (
            <span className="num block text-[var(--fs-micro)]" style={{ color: "var(--c-dim)" }}>
              {sub}
            </span>
          )}
        </span>
      )}
    </>
  );

  const cls = `flex w-full items-center gap-[var(--sp-2)] px-[var(--sp-3)] text-left ${mine ? "is-mine" : ""}`;
  const style: CSSProperties = { minHeight: "var(--row-h)", borderColor: "var(--c-border-soft)" };

  // A row that navigates and a row that does not must be visually
  // distinguishable — so only the tappable variant is a button, and only it
  // gets a press state.
  return onClick ? (
    <button type="button" onClick={onClick} title={title} className={`${cls} border-b`} style={style}>
      {inner}
    </button>
  ) : (
    <div title={title} className={`${cls} border-b`} style={style}>
      {inner}
    </div>
  );
}

/* ------------------------------------------------------------------- Bars */

/**
 * §5's ranked bar — "single hue, linear scale, value printed on every row so
 * a small bar is still precise." The printed value is the point: a bar alone
 * asks the reader to estimate, which is exactly what an instrument must not do.
 */
export function Bar({ pct, tone = "accent" }: { pct: number; tone?: "accent" | "pos" | "neg" | "dim" }) {
  const bg =
    tone === "pos" ? "var(--c-pos)" : tone === "neg" ? "var(--c-neg)" : tone === "dim" ? "var(--c-dim2)" : "var(--c-accent)";
  const w = Math.max(0, Math.min(100, pct));
  return (
    <span
      aria-hidden="true"
      className="block h-[3px] w-full overflow-hidden"
      style={{ background: "var(--c-surface3)" }}
    >
      <span
        className="block h-full"
        style={{ width: `${w}%`, background: bg, transition: `width var(--regular) var(--ease-out-quart)` }}
      />
    </span>
  );
}

/* ------------------------------------------------------------- Segmented */

export interface SegOption<T extends string> {
  id: T;
  label: string;
  /** Shown under the group when this option is selected. */
  note?: string;
}

/**
 * The option picker. Options carry a STABLE KEY and are selected by it,
 * never by index — the component contract is explicit that anything reading
 * options positionally "will silently choose wrong when the order changes."
 *
 * `disabled` renders the whole group inert and prints `reason`, because a
 * disabled control that does not explain itself reads as a bug.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
  reason,
  label,
}: {
  options: readonly SegOption<T>[];
  value: T;
  onChange: (id: T) => void;
  disabled?: boolean;
  reason?: string;
  label: string;
}) {
  const active = options.find((o) => o.id === value);
  return (
    <div>
      <div className="flex flex-wrap gap-[var(--sp-1)]" role="group" aria-label={label}>
        {options.map((o) => {
          const on = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              disabled={disabled}
              onClick={() => onChange(o.id)}
              className="border px-[var(--sp-2)] py-[var(--sp-1)] text-[var(--fs-sm)]"
              style={{
                minHeight: "2.75rem",
                borderColor: on ? "var(--c-accent)" : "var(--c-border)",
                background: on ? "var(--c-accent-soft)" : "transparent",
                color: disabled ? "var(--c-dim2)" : on ? "var(--c-accent)" : "var(--c-text)",
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {disabled && reason ? (
        <p className="mt-[var(--sp-1)] text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
          {reason}
        </p>
      ) : (
        active?.note && (
          <p className="mt-[var(--sp-1)] text-[var(--fs-micro)]" style={{ color: "var(--c-dim)" }}>
            {active.note}
          </p>
        )
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- Fields */

/** A labelled control row — label left, control right, explanation under. */
export function Field({ label, value, children, note }: { label: string; value?: ReactNode; children: ReactNode; note?: ReactNode }) {
  return (
    <div className="border-b py-[var(--sp-2)] last:border-b-0" style={{ borderColor: "var(--c-border-soft)" }}>
      <div className="flex items-baseline justify-between gap-[var(--sp-2)]">
        <span className="text-[var(--fs-sm)]" style={{ color: "var(--c-dim)" }}>
          {label}
        </span>
        {value !== undefined && <span className="num text-[var(--fs-md)] font-semibold">{value}</span>}
      </div>
      <div className="mt-[var(--sp-1)]">{children}</div>
      {note && (
        <p className="mt-[var(--sp-1)] text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
          {note}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- Waterfall */

export interface WaterStep {
  label: string;
  /** Signed — positive lifts the running balance, negative cuts it. */
  amount: number;
}

/**
 * §5's waterfall, for anything with a running balance. Per the spec:
 * "totals anchored to the baseline in neutral; increases and decreases in
 * direction colors ... never the brand accent."
 *
 * VERTICAL, and that is a phone decision, not a stylistic one. The classic
 * waterfall runs left-to-right with one column per step; six columns inside
 * 328px is ~54px each, which cannot hold a label OR a money figure at a
 * legible size. Turned on its side, every step gets the full width for its
 * label and value, the bars still encode magnitude and offset, and the
 * whole thing scrolls the way the device already wants to.
 *
 * The connector is the thin rule down the left of each following bar — it
 * carries the running balance across exactly as the dashed connector does
 * in the horizontal form.
 */
export function Waterfall({ steps, total }: { steps: readonly WaterStep[]; total: { label: string; amount: number } }) {
  // The scale must cover the highest point the running balance reaches, not
  // just the final total — a series that climbs and then falls would
  // otherwise overflow its own track.
  let run = 0;
  let peak = Math.abs(total.amount);
  const laid = steps.map((s) => {
    const from = run;
    run += s.amount;
    peak = Math.max(peak, Math.abs(from), Math.abs(run));
    return { ...s, from, to: run };
  });
  const scale = peak > 0 ? 100 / peak : 0;

  return (
    <div>
      {laid.map((s) => {
        const lo = Math.min(s.from, s.to);
        const hi = Math.max(s.from, s.to);
        const up = s.amount >= 0;
        return (
          <div key={s.label} className="flex items-center gap-[var(--sp-2)] py-[2px]">
            <span className="w-[5.5rem] shrink-0 truncate text-[var(--fs-micro)]" style={{ color: "var(--c-dim)" }}>
              {s.label}
            </span>
            <span className="relative h-[10px] min-w-0 flex-1" style={{ background: "var(--c-surface2)" }}>
              <span
                className="absolute top-0 h-full"
                style={{
                  left: `${lo * scale}%`,
                  width: `${Math.max(0.6, (hi - lo) * scale)}%`,
                  background: up ? "var(--c-pos)" : "var(--c-neg)",
                }}
              />
            </span>
            <span
              className="num w-[4.75rem] shrink-0 text-right text-[var(--fs-micro)]"
              style={{ color: up ? "var(--c-pos)" : "var(--c-neg)" }}
            >
              {s.amount < 0 ? "−" : "+"}
              {fmtAbbrev(Math.abs(s.amount))}
            </span>
          </div>
        );
      })}
      <div
        className="mt-[var(--sp-1)] flex items-center gap-[var(--sp-2)] border-t pt-[var(--sp-1)]"
        style={{ borderColor: "var(--c-border)" }}
      >
        <span className="w-[5.5rem] shrink-0 truncate text-[var(--fs-micro)] font-semibold">{total.label}</span>
        <span className="relative h-[10px] min-w-0 flex-1" style={{ background: "var(--c-surface2)" }}>
          {/* The total is anchored to the baseline and neutral — it is a
              position, not a movement, so it carries no direction colour. */}
          <span
            className="absolute top-0 left-0 h-full"
            style={{ width: `${Math.max(0.6, Math.abs(total.amount) * scale)}%`, background: "var(--c-dim)" }}
          />
        </span>
        <span className="num w-[4.75rem] shrink-0 text-right text-[var(--fs-micro)] font-semibold">
          {fmtAbbrev(total.amount)}
        </span>
      </div>
    </div>
  );
}

/** Compact money for a chart gutter, where `money()`'s full form will not fit. */
function fmtAbbrev(v: number): string {
  const a = Math.abs(v);
  if (a >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${Math.round(v)}`;
}
