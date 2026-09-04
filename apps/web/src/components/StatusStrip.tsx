/**
 * The status strip — UI.md §4: "always visible, every screen... a slim
 * terminal strip, not a KPI tile band." Carries only what you must know
 * regardless of where you are: date, the owned club's record and streak,
 * and cash on hand. Real numbers once a save exists — no fabricated
 * placeholders (OfficePage.tsx's own header comment note carries forward).
 */
import { cash, formatShort, money, winPct } from "@bushleague/sim-kit";
import { useGameStore } from "../store/gameStore.js";
import { ownedClub } from "../store/selectors.js";

export default function StatusStrip() {
  const state = useGameStore((s) => s.state);

  if (!state) {
    return (
      <div
        className="flex h-10 shrink-0 items-center justify-between border-b px-[var(--sp-3)] text-[var(--fs-sm)] num"
        style={{ borderColor: "var(--c-border)", color: "var(--c-dim)" }}
      >
        <span>NO SAVE LOADED</span>
        <span>—</span>
        <span>$—</span>
      </div>
    );
  }

  const club = ownedClub(state);
  const streak = club ? (club.strk > 0 ? `W${club.strk}` : club.strk < 0 ? `L${-club.strk}` : "—") : "—";
  const cashOnHand = cash(state.ledger);

  return (
    <div
      className="flex h-10 shrink-0 items-center justify-between border-b px-[var(--sp-3)] text-[var(--fs-sm)] num"
      style={{ borderColor: "var(--c-border)", color: "var(--c-dim)" }}
    >
      <span>
        {state.date.y} · {formatShort(state.date)} · {streak}
      </span>
      <span>
        {club ? `${club.w}-${club.l} (${winPct(club.w, club.l)})` : "—"}
      </span>
      <span>{money(cashOnHand)}</span>
    </div>
  );
}
