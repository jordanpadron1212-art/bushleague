import { useParams } from "react-router-dom";
import { findPage } from "./registry.js";

/**
 * The empty state for a declared-but-not-built page (UI.md §2's "V1 lights
 * 12 pages... the other 6 exist in the registry as declared-but-dark
 * entries, greyed in the index with the pass number that lights them").
 * States what is missing rather than pretending a control works — the same
 * rule DECISIONS.md D36 applies to the old start screen's difficulty toggle.
 */
export default function DarkPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const page = pageId ? findPage(pageId) : undefined;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
      <div className="text-[var(--fs-lg)]" style={{ color: "var(--c-dim)" }}>
        {page?.label ?? "This page"} isn&rsquo;t built yet.
      </div>
      {page?.lightsAt && (
        <div className="max-w-sm text-[var(--fs-sm)]" style={{ color: "var(--c-dim2)" }}>
          Lights at: {page.lightsAt}.
        </div>
      )}
    </div>
  );
}
