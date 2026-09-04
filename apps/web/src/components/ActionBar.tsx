/**
 * The action bar — UI.md §5: "docked directly above the tab bar, on every
 * page, always the single next thing." Until the save/start-game pass
 * exists, the single next thing really is starting a game — stated
 * honestly rather than wired to a control that does nothing (the rule
 * DECISIONS.md D36 sets for the old start screen's difficulty toggle).
 */
export default function ActionBar() {
  return (
    <div
      className="flex h-[52px] shrink-0 items-center justify-center border-t text-[var(--fs-md)] font-semibold"
      style={{ borderColor: "var(--c-border)", color: "var(--c-dim)" }}
    >
      Start a new game — not built yet
    </div>
  );
}
