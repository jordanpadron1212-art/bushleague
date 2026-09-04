/**
 * The page registry — DECISIONS.md D11: "Navigation is a registry, not
 * markup." One array renders the phone tab bar, the desktop rail, and the
 * full index (UI.md §2). Adding a system later is one array entry.
 *
 * V1 of the TypeScript rebuild lights exactly one page (Office), matching
 * the project's own v0.1 "CHASSIS" precedent: prove the shell, the routing,
 * the token system and the deploy pipeline before any game system exists to
 * put behind them. Every other page from UI.md's registry is declared here,
 * dark, with the pass that is expected to light it — visible in the index,
 * not hidden, so the shape of the finished game is visible from day one.
 */
import type { ComponentType } from "react";
import OfficePage from "./OfficePage.js";
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
  { id: "roster", label: "Roster", group: "CLUB", icon: "roster", element: DarkPage, live: false, lightsAt: "world generation + the roster grid pass" },
  { id: "lineup", label: "Lineup", group: "CLUB", icon: "lineup", element: DarkPage, live: false, lightsAt: "the box-score engine pass" },
  { id: "organization", label: "Organization", group: "CLUB", icon: "org", element: DarkPage, live: false, lightsAt: "affiliated-ladder world generation" },
  // LEAGUE
  { id: "standings", label: "Standings", group: "LEAGUE", icon: "standings", element: DarkPage, live: false, lightsAt: "world generation + the schedule" },
  { id: "schedule", label: "Schedule", group: "LEAGUE", icon: "schedule", element: DarkPage, live: false, lightsAt: "world generation + the schedule" },
  { id: "leaders", label: "Leaders", group: "LEAGUE", icon: "leaders", element: DarkPage, live: false, lightsAt: "the box-score engine pass" },
  { id: "wire", label: "Wire", group: "LEAGUE", icon: "wire", element: DarkPage, live: false, lightsAt: "the market + winter passes" },
  // TALENT
  { id: "scouting", label: "Scouting", group: "TALENT", icon: "scouting", element: DarkPage, live: false, lightsAt: "the scouting + draft pass" },
  { id: "draft", label: "Draft", group: "TALENT", icon: "draft", element: DarkPage, live: false, lightsAt: "the scouting + draft pass" },
  { id: "trades", label: "Trades", group: "TALENT", icon: "trades", element: DarkPage, live: false, lightsAt: "the trades pass" },
  { id: "freeagents", label: "Free agents", group: "TALENT", icon: "fa", element: DarkPage, live: false, lightsAt: "the market pass" },
  // MONEY
  { id: "books", label: "Books", group: "MONEY", icon: "books", element: DarkPage, live: false, lightsAt: "the books UI pass (the ledger engine already exists in @bushleague/sim-kit)" },
  { id: "budget", label: "Budget", group: "MONEY", icon: "budget", element: DarkPage, live: false, lightsAt: "the books UI pass" },
  { id: "gate", label: "Gate", group: "MONEY", icon: "gate", element: DarkPage, live: false, lightsAt: "the money-loop pass" },
  { id: "ownership", label: "Ownership", group: "MONEY", icon: "ownership", element: DarkPage, live: false, lightsAt: "the ownership-ladder pass" },
  // DESK
  { id: "settings", label: "Settings", group: "DESK", icon: "settings", element: DarkPage, live: false, lightsAt: "soon — shell/theme/density already work, this is just the screen for it" },
  { id: "save", label: "Save", group: "DESK", icon: "save", element: DarkPage, live: false, lightsAt: "the save/load pass (IndexedDB, via idb)" },
] as const;

export const GROUP_ORDER: readonly PageGroup[] = ["CLUB", "LEAGUE", "TALENT", "MONEY", "DESK"];

export function findPage(id: string): PageDef | undefined {
  return PAGES.find((p) => p.id === id);
}
