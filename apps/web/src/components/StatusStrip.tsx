/**
 * The status strip — UI.md §4: "always visible, every screen... a slim
 * terminal strip, not a KPI tile band." Carries only what you must know
 * regardless of where you are; date/record/cash are placeholders until a
 * save exists (no fabricated numbers — see OfficePage.tsx's header comment).
 */
export default function StatusStrip() {
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
