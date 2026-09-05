/**
 * The page registry — DECISIONS.md D11: "Navigation is a registry, not
 * markup." One array renders the phone tab bar, the desktop rail, and the
 * full index (UI.md §2). Adding a system later is one array entry.
 *
 * V1 of the TypeScript rebuild lit exactly one page (Office), matching the
 * project's own v0.1 "CHASSIS" precedent: prove the shell, the routing, the
 * token system and the deploy pipeline before any game system exists to put
 * behind them. Office and Books are now lit for real (the state-wiring
 * pass, `DECISIONS.md` D85) — UI.md §13.3's own checkpoint scope, "Office +
 * Books," not a smaller or larger slice of it. Every other page from UI.md's
 * registry stays declared here, dark, with the pass expected to light it —
 * visible in the index, not hidden, so the shape of the finished game is
 * visible from day one.
 *
 * Several dark pages' own `lightsAt` no longer names a missing SYSTEM —
 * world generation, the schedule, roster construction and the season
 * driver all exist in `@bushleague/sim-kit` now — it names the UI pass
 * that's deliberately deferred past this checkpoint instead (UI.md §13.3:
 * "Roster is deferred to the propagation pass"). Worth the distinction:
 * these pages are blocked on a UI pass now, not on data that doesn't
 * exist yet.
 */
import type { ComponentType } from "react";
import OfficePage from "./OfficePage.js";
import BooksPage from "./BooksPage.js";
import DraftPage from "./DraftPage.js";
import DelegationPage from "./DelegationPage.js";
import DarkPage from "./DarkPage.js";

export type PageGroup = "CLUB" | "LEAGUE" | "TALENT" | "MONEY" | "DESK";

export interface PageDef {
  id: string;
  label: string;
  group: PageGroup;
  icon: string;
  element: ComponentType;
  /** UI.md's "live" flag — false renders the DarkPage empty state instead. */
  live: boolean;
  /** Which future pass is expected to light this page, shown in the dark state. */
  lightsAt?: string;
}

export const PAGES: readonly PageDef[] = [
  // CLUB
  { id: "office", label: "Office", group: "CLUB", icon: "office", element: OfficePage, live: true },
  { id: "roster", label: "Roster", group: "CLUB", icon: "roster", element: DarkPage, live: false, lightsAt: "the roster grid pass (UI.md §13.3's own deferral — the data already exists)" },
  { id: "lineup", label: "Lineup", group: "CLUB", icon: "lineup", element: DarkPage, live: false, lightsAt: "the roster/lineup UI pass — simGame already reads a real lineup, nothing sets one yet" },
  { id: "organization", label: "Organization", group: "CLUB", icon: "org", element: DarkPage, live: false, lightsAt: "parent-affiliation research (RESEARCH.md's own open gap) + a UI pass" },
  // LEAGUE
  { id: "standings", label: "Standings", group: "LEAGUE", icon: "standings", element: DarkPage, live: false, lightsAt: "a standings UI pass — the real data (Club.w/l/gb) already exists, see selectors.ts" },
  { id: "schedule", label: "Schedule", group: "LEAGUE", icon: "schedule", element: DarkPage, live: false, lightsAt: "a schedule UI pass — the real data already exists" },
  { id: "leaders", label: "Leaders", group: "LEAGUE", icon: "leaders", element: DarkPage, live: false, lightsAt: "a leaderboard UI pass — real per-player stats already accumulate in Player.st" },
  { id: "wire", label: "Wire", group: "LEAGUE", icon: "wire", element: DarkPage, live: false, lightsAt: "the market + winter passes" },
  // TALENT
  { id: "scouting", label: "Scouting", group: "TALENT", icon: "scouting", element: DarkPage, live: false, lightsAt: "a dedicated scouting UI pass — the scouting budget/reliability mechanism itself is real (DECISIONS.md D90)" },
  { id: "draft", label: "Draft", group: "TALENT", icon: "draft", element: DraftPage, live: true },
  { id: "trades", label: "Trades", group: "TALENT", icon: "trades", element: DarkPage, live: false, lightsAt: "the trades pass" },
  { id: "freeagents", label: "Free agents", group: "TALENT", icon: "fa", element: DarkPage, live: false, lightsAt: "the market pass" },
  // MONEY
  { id: "books", label: "Books", group: "MONEY", icon: "books", element: BooksPage, live: true },
  { id: "budget", label: "Budget", group: "MONEY", icon: "budget", element: DarkPage, live: false, lightsAt: "the books UI pass" },
  { id: "gate", label: "Gate", group: "MONEY", icon: "gate", element: DarkPage, live: false, lightsAt: "the money-loop pass" },
  { id: "ownership", label: "Ownership", group: "MONEY", icon: "ownership", element: DarkPage, live: false, lightsAt: "the ownership-ladder pass" },
  // DESK
  { id: "delegation", label: "Delegation", group: "DESK", icon: "settings", element: DelegationPage, live: true },
  { id: "settings", label: "Settings", group: "DESK", icon: "settings", element: DarkPage, live: false, lightsAt: "soon — shell/theme/density already work, this is just the screen for it" },
  { id: "save", label: "Save", group: "DESK", icon: "save", element: DarkPage, live: false, lightsAt: "a save-management UI pass — IndexedDB save/load itself already exists and runs on every new game and advance" },
] as const;

export const GROUP_ORDER: readonly PageGroup[] = ["CLUB", "LEAGUE", "TALENT", "MONEY", "DESK"];

export function findPage(id: string): PageDef | undefined {
  return PAGES.find((p) => p.id === id);
}
