/**
 * Budget — the owner's three money dials, in one place, for the first time.
 *
 * WHY THIS PAGE IS THE ONE THAT MATTERED. `ticketPrice` (D101),
 * `payrollBudget` (D102) and `scoutingBudget` (D90) are real, tested,
 * load-bearing mechanics: they move talent, wins and cash. Until this pass
 * the owner could not touch any of them anywhere in the app — they moved
 * only if the desk happened to raise an ask. A game whose premise is "you
 * own the club" shipped with its three business levers unreachable.
 *
 * DELEGATION IS HONOURED, NOT ROUTED AROUND (Jordan's call, this pass). A
 * dial whose domain you have handed to staff at Notify or Silent renders
 * DISABLED with the reason printed, rather than vanishing or — worse —
 * quietly working. Hiding it would make the page lie about what the club
 * does; letting it work would make the delegation dial decorative. This is
 * the same pattern `DelegationPage` already uses for its own Approve
 * control.
 *
 * THE AUTHORISED-VS-COMMITTED GAP IS THE POINT. `payrollBudget` applies to
 * INTAKE (D102) — it prices what the organization signs, and cannot
 * re-cut a contract already on the books. So authorised and committed
 * legitimately disagree, and the gap closes over seasons rather than on the
 * day the dial moves. Showing only one of the two numbers would hide the
 * single most important thing about how payroll actually behaves here.
 *
 * MEASURED before deciding how to render it, across 8 seeds on one club and
 * 6 clubs on one seed: the opening gap runs from -42.9% to +15.3%, mean
 * -16.0%. That is not a defect in the defaults — it is D103's service-time
 * pricing doing its job. A 40-man roster that happens to be young is full
 * of players at the league minimum; one full of six-year veterans costs
 * double. So the gap is SIGNAL, and mostly it is HEADROOM: money the owner
 * has authorised and is not spending. A first draft of this page painted
 * "over" in red, which at game start cries wolf at a number the owner did
 * not cause — tone is now spent only when the roster genuinely outruns the
 * budget.
 */
import {
  PAYROLL_MAX_RATIO,
  PAYROLL_MIN_RATIO,
  PRICE_MAX_RATIO,
  PRICE_MIN_RATIO,
  SCOUT_BOOST_MAX,
  SCOUT_BOOST_SATURATE_AT,
  attFor,
  econFor,
  leagueMonths,
  money,
  payrollRatio,
  payrollTalentShift,
  priceDemand,
  rosterPayroll,
  scoutBoostFor,
  delegationFor,
  type DelegableDomain,
} from "@bushleague/sim-kit";
import { useGameStore } from "../store/gameStore.js";
import { ownedClub } from "../store/selectors.js";
import { Bar, EmptyLine, Field, Panel } from "../components/ui.js";

/** A dial the owner may only turn when they have kept the domain (D96). */
function useOwnerControls(domain: DelegableDomain): { can: boolean; reason: string } {
  const state = useGameStore((s) => s.state);
  const level = state ? delegationFor(state.delegation, domain) : "hands-on";
  if (level === "hands-on" || level === "approve") return { can: true, reason: "" };
  return {
    can: false,
    reason:
      level === "notify"
        ? "Your staff set this — you are on Notify. Move the dial back to Approve or Hands-on to take it."
        : "Your staff set this, silently. Move the dial back to Approve or Hands-on to take it.",
  };
}

/**
 * The stepper. A slider would be wrong here: these are money figures the
 * owner reasons about in round numbers, and a drag gesture on a phone
 * cannot land on one. Discrete steps with the figure printed large is both
 * more precise and easier to hit than a 44px-tall track.
 */
function Stepper({
  value,
  onChange,
  step,
  min,
  max,
  disabled,
  label,
  fmt,
}: {
  value: number;
  onChange: (v: number) => void;
  step: number;
  min: number;
  max: number;
  disabled: boolean;
  label: string;
  fmt: (v: number) => string;
}) {
  const set = (v: number) => onChange(Math.max(min, Math.min(max, v)));
  const btn = (delta: number, text: string, aria: string) => (
    <button
      type="button"
      disabled={disabled || (delta < 0 ? value <= min : value >= max)}
      onClick={() => set(value + delta)}
      aria-label={`${aria} ${label}`}
      className="border px-[var(--sp-3)] text-[var(--fs-md)]"
      style={{
        minHeight: "2.75rem",
        minWidth: "2.75rem",
        borderColor: "var(--c-border)",
        color: disabled ? "var(--c-dim2)" : "var(--c-text)",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {text}
    </button>
  );
  return (
    <div className="flex items-center gap-[var(--sp-2)]">
      {btn(-step, "−", "Decrease")}
      <output
        className="num flex-1 text-center text-[var(--fs-md)] font-semibold"
        style={{ color: disabled ? "var(--c-dim2)" : "var(--c-text)" }}
      >
        {fmt(value)}
      </output>
      {btn(step, "+", "Increase")}
    </div>
  );
}

/** Clamps a price ratio into the band the engine itself honours. */
function clampRatio(x: number): number {
  return Math.max(PRICE_MIN_RATIO, Math.min(PRICE_MAX_RATIO, x));
}

/**
 * The one quiet line under a control. Kept to a single sentence on purpose:
 * a first draft of this page carried a four-line paragraph under each of the
 * three dials, and rendering it at 360px showed the prose had eaten the
 * screen — two and a half panels visible, on a page whose entire job is to
 * put three dials side by side. Density is the product.
 */
function Note({ text }: { text: string }) {
  return (
    <p className="pt-[var(--sp-1)] text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
      {text}
    </p>
  );
}

/**
 * The caption under a bar. TWO facts, not three, and the render is what
 * settled it: a `justify-between` flex row let three spans touch with no gap
 * ("no coverage+6 pts confidencesaturates $1.80M" as one word), and a
 * three-column grid fixed the gap but then truncated every cell
 * ("signings +0…"). Truncation is the worse failure — it silently drops
 * data the owner came for. 328px of content fits two of these comfortably
 * and three never, so the third fact moved into the note line.
 */
function BarCaption({ left, right }: { left: string; right: string }) {
  return (
    <div className="mt-[var(--sp-1)] flex justify-between gap-[var(--sp-3)] text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
      <span className="num truncate">{left}</span>
      <span className="num truncate text-right" style={{ color: "var(--c-dim)" }}>
        {right}
      </span>
    </div>
  );
}

/** A figure with the change it represents — three across is the 360px ceiling. */
function Metric({ label, value, delta }: { label: string; value: string; delta: number }) {
  const flat = Math.abs(delta) < 0.005;
  return (
    <div className="min-w-0">
      <div className="text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
        {label}
      </div>
      <div className="num truncate">{value}</div>
      <div
        className="num text-[var(--fs-micro)]"
        style={{ color: flat ? "var(--c-dim2)" : delta > 0 ? "var(--c-pos)" : "var(--c-neg)" }}
      >
        {flat ? "at face" : `${delta > 0 ? "+" : ""}${(delta * 100).toFixed(0)}%`}
      </div>
    </div>
  );
}

export default function BudgetPage() {
  const state = useGameStore((s) => s.state);
  const setTicketPrice = useGameStore((s) => s.setTicketPrice);
  const setPayrollBudget = useGameStore((s) => s.setPayrollBudget);
  const setScoutingBudget = useGameStore((s) => s.setScoutingBudget);

  const payrollCtl = useOwnerControls("payroll");
  const ticketCtl = useOwnerControls("ticketing");
  const scoutCtl = useOwnerControls("scouting");

  const club = state ? ownedClub(state) : null;
  if (!state || !club) {
    return (
      <div className="flex h-full flex-col overflow-y-auto">
        <Panel title="Budget">
          <EmptyLine>No club yet.</EmptyLine>
        </Panel>
      </div>
    );
  }

  const E = econFor(club);
  const months = club.lvl === "MLB" ? 12 : leagueMonths(club);

  // --- payroll -------------------------------------------------------
  const normAnnual = E.payroll * months;
  const ratio = payrollRatio(state.payrollBudget, E, months);
  const shift = payrollTalentShift(ratio);
  const committedAnnual = rosterPayroll(state.players, club) * months;
  const headroom = state.payrollBudget - committedAnnual;

  // --- ticketing -----------------------------------------------------
  const face = E.ticketFace;
  const demand = priceDemand(state.ticketPrice, face);
  const priceRatio = face > 0 ? clampRatio(state.ticketPrice / face) : 1;
  const baseAtt = attFor(club.lvl, club.lg);
  const att = Math.round(baseAtt * demand);
  // Per-head take moves on BOTH sides: fewer fans through the gate, each
  // paying more for the seat and exactly the same for a hot dog. That
  // asymmetry IS the inelastic-pricing result (RESEARCH.md §25), and it is
  // why the revenue-maximising price is not the highest one.
  const perHead = E.gate * priceRatio + E.conc + E.park + E.merch;
  const baseHead = E.gate + E.conc + E.park + E.merch;
  const nightly = att * perHead;
  const baseNightly = baseAtt * baseHead;

  // --- scouting ------------------------------------------------------
  const scoutBase = E.scouting;
  const boost = scoutBoostFor(state.scoutingBudget, scoutBase);
  const scoutSaturates = SCOUT_BOOST_SATURATE_AT * scoutBase;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* The one figure this screen exists for: what you have authorised and
          are not spending. Law 2 — one hero, and it is the decision. */}
      <div className="border-b px-[var(--sp-3)] py-[var(--sp-2)]" style={{ borderColor: "var(--c-border)" }}>
        <div
          className="text-[var(--fs-micro)]"
          style={{ color: "var(--c-dim2)", textTransform: "var(--shell-label-case)" as never, letterSpacing: "var(--shell-label-track)" }}
        >
          {headroom >= 0 ? "Payroll headroom" : "Over payroll"}
        </div>
        <div className="display text-[var(--fs-lg)] leading-none" style={{ color: headroom >= 0 ? "var(--c-text)" : "var(--c-neg)" }}>
          {money(Math.abs(headroom))}
        </div>
        <div className="text-[var(--fs-micro)]" style={{ color: "var(--c-dim)" }}>
          {money(committedAnnual)} committed of {money(state.payrollBudget)} authorised
        </div>
      </div>

      <Panel title="Payroll">
        <Field label="Authorised, annual">
          <Stepper
            label="payroll budget"
            value={state.payrollBudget}
            onChange={(v) => void setPayrollBudget(v)}
            step={Math.max(100000, Math.round(normAnnual / 20))}
            min={Math.round(normAnnual * PAYROLL_MIN_RATIO)}
            max={Math.round(normAnnual * PAYROLL_MAX_RATIO)}
            disabled={!payrollCtl.can}
            fmt={money}
          />
        </Field>
        <div className="pt-[var(--sp-2)]">
          <Bar pct={((ratio - PAYROLL_MIN_RATIO) / (PAYROLL_MAX_RATIO - PAYROLL_MIN_RATIO)) * 100} />
          <BarCaption
            left={`${ratio.toFixed(2)}× league`}
            right={`signings ${shift >= 0 ? "+" : ""}${shift.toFixed(1)} pts`}
          />
        </div>
        <Note text={payrollCtl.can ? `League norm ${money(normAnnual)}. Prices what you sign — it cannot re-cut a contract already on the books.` : payrollCtl.reason} />
      </Panel>

      <Panel title="Ticket price">
        <Field label="Face price">
          <Stepper
            label="ticket price"
            value={Math.round(state.ticketPrice)}
            onChange={(v) => void setTicketPrice(v)}
            step={1}
            min={Math.max(1, Math.round(face * PRICE_MIN_RATIO))}
            max={Math.round(face * PRICE_MAX_RATIO)}
            disabled={!ticketCtl.can}
            fmt={(v) => `$${v}`}
          />
        </Field>
        <div className="grid grid-cols-3 gap-[var(--sp-2)] pt-[var(--sp-2)] text-[var(--fs-sm)]">
          <Metric label="Crowd" value={att.toLocaleString()} delta={demand - 1} />
          <Metric label="Per head" value={`$${perHead.toFixed(2)}`} delta={baseHead > 0 ? perHead / baseHead - 1 : 0} />
          <Metric label="A night" value={money(nightly)} delta={baseNightly > 0 ? nightly / baseNightly - 1 : 0} />
        </div>
        <Note
          text={
            ticketCtl.can
              ? `League face is $${Math.round(face)}. A fan who stays home buys no hot dog either.`
              : ticketCtl.reason
          }
        />
      </Panel>

      <Panel title="Scouting">
        <Field label="Authorised, annual">
          <Stepper
            label="scouting budget"
            value={state.scoutingBudget}
            onChange={(v) => void setScoutingBudget(v)}
            step={Math.max(10000, Math.round(scoutBase / 10))}
            min={0}
            max={Math.round(scoutSaturates * 1.5)}
            disabled={!scoutCtl.can}
            fmt={money}
          />
        </Field>
        <div className="pt-[var(--sp-2)]">
          <Bar pct={(boost / SCOUT_BOOST_MAX) * 100} tone={boost >= SCOUT_BOOST_MAX ? "pos" : "accent"} />
          <BarCaption
            left={`+${(boost * 100).toFixed(0)} pts confidence`}
            right={`saturates ${money(scoutSaturates)}`}
          />
        </div>
        <Note
          text={
            scoutCtl.can
              ? "Buys confidence in your own grades, not better players. Past the saturation point every dollar buys nothing."
              : scoutCtl.reason
          }
        />
      </Panel>
    </div>
  );
}
