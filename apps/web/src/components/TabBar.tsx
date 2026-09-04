/**
 * Navigation — UI.md §3. Phone: bottom bar, 5 pinned slots + an index sheet
 * (⋯) listing every page grouped, with a live/dark badge. Desktop (>=900px):
 * a left rail, always expanded, same registry. One registry (registry.tsx,
 * per DECISIONS.md D11), two renderers, no separate desktop/mobile nav data.
 */
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { GROUP_ORDER, PAGES } from "../pages/registry.js";
import { useUiStore } from "../store/uiStore.js";

function NavItem({ id, label, live }: { id: string; label: string; live: boolean }) {
  return (
    <NavLink
      to={`/p/${id}`}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center justify-center gap-0.5 text-[var(--fs-micro)] ${
          isActive ? "" : ""
        }`
      }
      style={({ isActive }) => ({
        color: isActive ? "var(--c-accent)" : live ? "var(--c-text)" : "var(--c-dim2)",
      })}
    >
      <span className="text-[var(--fs-sm)]">{label}</span>
    </NavLink>
  );
}

export default function TabBar() {
  const pins = useUiStore((s) => s.pins);
  const [indexOpen, setIndexOpen] = useState(false);
  const pinned = pins.map((id) => PAGES.find((p) => p.id === id)).filter((p) => p !== undefined);

  return (
    <>
      <nav
        className="flex h-14 shrink-0 border-t md:hidden"
        style={{ borderColor: "var(--c-border)" }}
        aria-label="Primary"
      >
        {pinned.map((p) => (
          <NavItem key={p.id} id={p.id} label={p.label} live={p.live} />
        ))}
        <button
          type="button"
          onClick={() => setIndexOpen(true)}
          className="flex flex-1 flex-col items-center justify-center text-[var(--fs-sm)]"
          style={{ color: "var(--c-dim)" }}
          aria-label="More pages"
        >
          more
        </button>
      </nav>

      {indexOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end md:hidden"
          style={{ background: "color-mix(in srgb, black 60%, transparent)" }}
          onClick={() => setIndexOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full overflow-y-auto border-t"
            style={{ background: "var(--c-surface)", borderColor: "var(--c-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {GROUP_ORDER.map((group) => (
              <div key={group} className="px-[var(--sp-3)] py-[var(--sp-2)]">
                <h3 className="text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
                  {group}
                </h3>
                {PAGES.filter((p) => p.group === group).map((p) => (
                  <NavLink
                    key={p.id}
                    to={`/p/${p.id}`}
                    onClick={() => setIndexOpen(false)}
                    className="flex items-center justify-between py-[var(--sp-2)] text-[var(--fs-md)]"
                    style={{ color: p.live ? "var(--c-text)" : "var(--c-dim2)" }}
                  >
                    <span>{p.label}</span>
                    {!p.live && <span className="text-[var(--fs-micro)]">dark</span>}
                  </NavLink>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export function DesktopRail() {
  return (
    <nav
      className="hidden w-56 shrink-0 flex-col overflow-y-auto border-r md:flex"
      style={{ borderColor: "var(--c-border)" }}
      aria-label="Primary"
    >
      {GROUP_ORDER.map((group) => (
        <div key={group} className="px-[var(--sp-3)] py-[var(--sp-2)]">
          <h3 className="text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
            {group}
          </h3>
          {PAGES.filter((p) => p.group === group).map((p) => (
            <NavLink
              key={p.id}
              to={`/p/${p.id}`}
              className="flex items-center justify-between py-[var(--sp-1)] text-[var(--fs-md)]"
              style={({ isActive }) => ({
                color: isActive ? "var(--c-accent)" : p.live ? "var(--c-text)" : "var(--c-dim2)",
              })}
            >
              <span>{p.label}</span>
              {!p.live && <span className="text-[var(--fs-micro)]">dark</span>}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}
