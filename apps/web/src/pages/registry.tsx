/**
 * The page registry — DECISIONS.md D11: "Navigation is a registry, not
 * markup." One array renders the phone tab bar, the desktop rail, and the
 * full index (UI.md §2). Adding a system later is one array entry.
 *
 * As of v2.22.0 (D105) FIFTEEN of the nineteen are live and every page but
 * Office is a lazily-loaded chunk. Four remain dark, and the reason is data
 * rather than effort: `state.wire`, `events`, `history`, `needs` and `form`
 * are written by exactly ZERO sites, so Wire, Trades, Free agents and
 * Ownership have nothing to render. Each `lightsAt` below names the SYSTEM
 * that has to write something first.
 *
 * Keeping them declared-but-dark rather than hidden is deliberate and
 * original to D11: the shape of the finished game stays visible, and the
 * empty state states what is missing instead of faking a control.
 *
 * A warning for whoever edits these notes next: several `lightsAt` strings
 * went STALE between passes and said a page was blocked on work that had
 * already landed — Organization claimed it needed parent-affiliation
 * research that shipped in v2.12.0, and Ownership named an "ownership
 * ladder" that D95 retired outright. The audit that opened v2.22.0 checked
 * every one of them against the engine rather than believing them. Do that
 * again before trusting one.
 */
import { lazy, type ComponentType } from "react";
// Office and the dark placeholder stay in the first chunk: Office is the
// landing route for every session, and DarkPage is tiny and shared by the
// four pages that are still legitimately unbuilt.
import OfficePage from "./OfficePage.js";
import DarkPage from "./DarkPage.js";

/**
 * Every other page is split out. The registry is the ONLY place that
 * names a page component, so this is the one edit that has to be made —
 * which is the payoff for D11's "navigation is a registry, not markup".
 */
const BooksPage = lazy(() => import("./BooksPage.js"));
const DraftPage = lazy(() => import("./DraftPage.js"));
const DelegationPage = lazy(() => import("./DelegationPage.js"));
const RosterPage = lazy(() => import("./RosterPage.js"));
const BudgetPage = lazy(() => import("./BudgetPage.js"));
const GatePage = lazy(() => import("./GatePage.js"));
const StandingsPage = lazy(() => import("./StandingsPage.js"));
const SchedulePage = lazy(() => import("./SchedulePage.js"));
const LeadersPage = lazy(() => import("./LeadersPage.js"));
const OrganizationPage = lazy(() => import("./OrganizationPage.js"));
const LineupPage = lazy(() => import("./LineupPage.js"));
const ScoutingPage = lazy(() => import("./ScoutingPage.js"));
const SettingsPage = lazy(() => import("./SettingsPage.js"));
const SavePage = lazy(() => import("./SavePage.js"));

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
  { id: "roster", label: "Roster", group: "CLUB", icon: "roster", element: RosterPage, live: true },
  { id: "lineup", label: "Lineup", group: "CLUB", icon: "lineup", element: LineupPage, live: true },
  { id: "organization", label: "Organization", group: "CLUB", icon: "org", element: OrganizationPage, live: true },
  // LEAGUE
  { id: "standings", label: "Standings", group: "LEAGUE", icon: "standings", element: StandingsPage, live: true },
  { id: "schedule", label: "Schedule", group: "LEAGUE", icon: "schedule", element: SchedulePage, live: true },
  { id: "leaders", label: "Leaders", group: "LEAGUE", icon: "leaders", element: LeadersPage, live: true },
  { id: "wire", label: "Wire", group: "LEAGUE", icon: "wire", element: DarkPage, live: false, lightsAt: "the market + winter passes — state.wire is written by zero sites today, verified in v2.22.0" },
  // TALENT
  { id: "scouting", label: "Scouting", group: "TALENT", icon: "scouting", element: ScoutingPage, live: true },
  { id: "draft", label: "Draft", group: "TALENT", icon: "draft", element: DraftPage, live: true },
  { id: "trades", label: "Trades", group: "TALENT", icon: "trades", element: DarkPage, live: false, lightsAt: "the trades pass — no trade system exists in the engine yet" },
  { id: "freeagents", label: "Free agents", group: "TALENT", icon: "fa", element: DarkPage, live: false, lightsAt: "the market pass — churn.ts moves players between clubs, but nothing models an open market" },
  // MONEY
  { id: "books", label: "Books", group: "MONEY", icon: "books", element: BooksPage, live: true },
  { id: "budget", label: "Budget", group: "MONEY", icon: "budget", element: BudgetPage, live: true },
  { id: "gate", label: "Gate", group: "MONEY", icon: "gate", element: GatePage, live: true },
  { id: "ownership", label: "Ownership", group: "MONEY", icon: "ownership", element: DarkPage, live: false, lightsAt: "a financing pass — your equity, the note, and owner distributions. NOT the old \"ownership ladder\", which D95 retired when the game became an endless sandbox where you are always the owner" },
  // DESK
  { id: "delegation", label: "Delegation", group: "DESK", icon: "settings", element: DelegationPage, live: true },
  { id: "settings", label: "Settings", group: "DESK", icon: "settings", element: SettingsPage, live: true },
  { id: "save", label: "Save", group: "DESK", icon: "save", element: SavePage, live: true },
] as const;

export const GROUP_ORDER: readonly PageGroup[] = ["CLUB", "LEAGUE", "TALENT", "MONEY", "DESK"];

export function findPage(id: string): PageDef | undefined {
  return PAGES.find((p) => p.id === id);
}
