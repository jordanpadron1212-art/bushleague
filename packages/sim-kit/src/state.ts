/**
 * State schema — LAWS.md Law 2: one state object, plain JSON only, and the
 * schema is defined in exactly one place. `JSON.stringify(state)` must be
 * able to BE the save.
 *
 * This is a fresh schema for the TypeScript rebuild (SCHEMA_VERSION 1), not
 * a continuation of the old HTML build's schema (which reached v3). There is
 * deliberately no migration path from an old `bush-league-v0.10.html` save —
 * that is a real, stated consequence of the rewrite, not an oversight.
 *
 * Fields below mirror `freshState()` in bush-league-v0.10.html one-for-one
 * so the still-to-be-ported systems (world generation, the box-score engine,
 * the market, the winter) have a schema to land in. `world.clubs`,
 * `players`, `sched` and `box` are typed now and populated by a later pass —
 * see ROADMAP.md.
 */
import type { JournalEntry } from "./ledger.js";
import type { CalendarDate } from "./date.js";

export const SCHEMA_VERSION = 1;

export type Mode = "bush" | "takeover";
export type Difficulty = "normal" | "hard";
export type Shell = "ootp" | "desk";
export type Theme = "dark" | "light";
export type Density = "dense" | "compact" | "standard";

export interface UiState {
  shell: Shell;
  theme: Theme;
  density: Density;
  tab: string;
  pane: Record<string, string>;
  pins: string[];
  sort: Record<string, unknown>;
  filt: Record<string, unknown>;
  view: Record<string, unknown>;
  detail: string | null;
  advUnit: "day" | "series" | "week" | "month";
  stop: { inj: boolean; roster: boolean; cash: boolean };
  cashFloor: number;
  rwarn: string;
}

export interface SeasonState {
  year: number;
  gp: number;
  sched: number;
  phase: "offseason" | "spring" | "season" | "playoffs";
  open: number;
  close: number;
  dates: number;
}

export interface ClubRef {
  id: string;
  city: string;
  name: string;
  abbr: string;
  lvl: string;
  lg: string;
  div: string;
  park: string;
  cap: number;
  ticket: number;
  payrollBudget: number;
}

export interface WorldState {
  clubs: unknown[]; // populated by world generation — ROADMAP.md next pass
  renames: Record<string, string>;
  grads: unknown[];
  wage: Record<string, number>;
}

export interface GameState {
  v: number;
  seed: number;
  nextJe: number;
  mode: Mode;
  diff: Difficulty;
  created: string; // ISO string — never a Date object in state
  ui: UiState;
  date: CalendarDate;
  season: SeasonState;
  club: ClubRef;
  world: WorldState;
  players: unknown[];
  sched: unknown[];
  sp: number; // cursor into sched
  box: unknown[];
  events: unknown[];
  history: unknown[];
  lastAdv: unknown | null;
  ledger: JournalEntry[];
  wire: unknown[];
  needs: unknown[];
  form: unknown[];
  log: { d: number; t: string; c: string }[];
}

export interface CreateStateOptions {
  seed?: number;
  mode?: Mode;
  diff?: Difficulty;
  created?: string;
}

export function createInitialState(opts: CreateStateOptions = {}): GameState {
  const seed = (opts.seed ?? Math.floor(Math.random() * 4294967295)) >>> 0;
  return {
    v: SCHEMA_VERSION,
    seed,
    nextJe: 1,
    mode: opts.mode ?? "bush",
    diff: opts.diff ?? "normal",
    created: opts.created ?? new Date().toISOString(),
    ui: {
      shell: "ootp",
      theme: "dark",
      density: "compact",
      tab: "office",
      pane: {},
      pins: ["office", "roster", "standings", "books"],
      sort: {},
      filt: {},
      view: {},
      detail: null,
      advUnit: "day",
      stop: { inj: true, roster: true, cash: true },
      cashFloor: 0,
      rwarn: "",
    },
    date: { y: 2026, m: 6, d: 14 },
    season: { year: 2026, gp: 0, sched: 162, phase: "offseason", open: 0, close: 0, dates: 0 },
    club: {
      id: "",
      city: "",
      name: "",
      abbr: "",
      lvl: "",
      lg: "",
      div: "",
      park: "",
      cap: 0,
      ticket: 0,
      payrollBudget: 0,
    },
    world: { clubs: [], renames: {}, grads: [], wage: {} },
    players: [],
    sched: [],
    sp: 0,
    box: [],
    events: [],
    history: [],
    lastAdv: null,
    ledger: [],
    wire: [],
    needs: [],
    form: [],
    log: [],
  };
}

/** Deep NaN scan of the whole save — the defect that silently poisons a game (DECISIONS.md D61 lineage). */
export function scanNonFinite(o: unknown, path = "state", out: string[] = []): string[] {
  if (o === null || o === undefined) return out;
  if (typeof o === "number") {
    if (!Number.isFinite(o)) out.push(path);
    return out;
  }
  if (typeof o !== "object") return out;
  if (Array.isArray(o)) {
    o.forEach((item, i) => scanNonFinite(item, `${path}[${i}]`, out));
    return out;
  }
  for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
    scanNonFinite(v, `${path}.${k}`, out);
  }
  return out;
}
