import { createHashRouter, Navigate, RouterProvider } from "react-router-dom";
import AppShell from "./components/AppShell.js";
import { PAGES, findPage } from "./pages/registry.js";

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
  return <RouterProvider router={router} />;
}
