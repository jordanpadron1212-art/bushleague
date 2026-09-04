import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import StatusStrip from "./StatusStrip.js";
import ActionBar from "./ActionBar.js";
import TabBar, { DesktopRail } from "./TabBar.js";
import { useUiStore } from "../store/uiStore.js";

/**
 * The shell — UI.md's "five containers": page / pane / sheet / row / detail.
 * This component is the outermost of those, present on every route. Applies
 * shell/theme/density to the document root so the token layer (Law 6) picks
 * them up; nothing here branches on which shell is active (D9's hard rule —
 * only --shell-* tokens differ between ootp and desk).
 */
export default function AppShell() {
  const { shell, theme, density } = useUiStore();

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-shell", shell);
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-density", density);
  }, [shell, theme, density]);

  return (
    <div className="flex h-dvh flex-col">
      <StatusStrip />
      <div className="flex min-h-0 flex-1">
        <DesktopRail />
        <main className="min-w-0 flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
      <ActionBar />
      <TabBar />
    </div>
  );
}
