import { useEffect } from "react";
import { createHashRouter, Navigate, RouterProvider } from "react-router-dom";
import AppShell from "./components/AppShell.js";
import NewGamePage from "./pages/NewGamePage.js";
import SaveProblemPage from "./pages/SaveProblemPage.js";
import { PAGES, findPage } from "./pages/registry.js";
import { useGameStore } from "./store/gameStore.js";

/**
 * Hash routing (createHashRouter), not browser history routing — required
 * for GitHub Pages, which serves static files with no server-side rewrite
 * rule to send a deep link like /p/roster back to index.html.
 */
function PageRoute({ pageId }: { pageId: string }) {
  const page = findPage(pageId);
  if (!page) return <Navigate to="/p/office" replace />;
  const Element = page.element;
  return <Element />;
}

const router = createHashRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/p/office" replace /> },
      ...PAGES.map((p) => ({
        path: `/p/${p.id}`,
        element: <PageRoute pageId={p.id} />,
      })),
      { path: "*", element: <Navigate to="/p/office" replace /> },
    ],
  },
]);

export default function App() {
  const state = useGameStore((s) => s.state);
  const loading = useGameStore((s) => s.loading);
  const saveProblem = useGameStore((s) => s.saveProblem);
  const loadFromDisk = useGameStore((s) => s.loadFromDisk);

  useEffect(() => {
    void loadFromDisk();
    // Runs once on mount — loadFromDisk's own identity is stable (Zustand
    // actions don't change reference), and re-running this on every
    // render would re-read IndexedDB for no reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center" style={{ background: "var(--c-bg)", color: "var(--c-dim)" }}>
        <span className="text-[var(--fs-md)]">Loading…</span>
      </div>
    );
  }

  // Checked BEFORE the new-game fallthrough, and that order is the whole
  // point: a save that failed to load must never quietly present the club
  // picker, because choosing a club is what overwrites it (D98).
  if (saveProblem) return <SaveProblemPage />;

  if (!state) return <NewGamePage />;

  return <RouterProvider router={router} />;
}
