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
 * `world.clubs`, `players` and `sched` now carry the real types the world-
 * gen, roster and schedule passes produced (`newgame.ts` assembles them into
 * a fresh state). Still placeholder, waiting on the systems that produce
 * them: `history`, `events`, `wire`, `needs`, `lastAdv`, `log` (the winter,
 * the market, the decision queue, the wire).
 *
 * Adaptation, noted rather than silent: the original's `G.club` is a
 * snapshot object (`ClubRef` below, kept for reference) duplicating fields
 * — city, name, abbr, lvl, lg, div, park — that now live on the real `Club`
 * record inside `world.clubs`. A snapshot that can drift from the record it
 * was copied from is exactly the kind of hidden state this package's other
 * modules (world.ts's, schedule.ts's own notes) have been built to avoid.
 * `GameState.ownedClubId` is a reference instead — look the club up in
 * `world.clubs` by id for anything the record itself already knows.
 */
import type { JournalEntry } from "./ledger.js";
import type { CalendarDate } from "./date.js";
import type { Club } from "./world.js";
import type { Player } from "./player.js";
import type { PlayedGame } from "./season.js";
import type { DraftPhilosophy, DraftPickResult } from "./draft.js";
import type { DelegationSettings, DeskAsk, LogEntry } from "./delegation.js";
import { defaultDelegation } from "./delegation.js";

/**
 * Bumped to 2 by the delegation pass (`DECISIONS.md` D100), which adds
 * `delegation`, `asks` and `nextAsk`, and gives `log` two new optional
 * fields. `migrate.ts`'s registry carries the v1 → v2 step; a save written
 * before this build loads, backfills and plays.
 */
export const SCHEMA_VERSION = 2;

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
  /** The OWNED club's own season window — `schedule.ts`'s `seasonWindow(ownedClub, year)`, not the whole world's. */
  open: number;
  close: number;
  /** Earliest scheduled game across the ENTIRE world — different levels/leagues open on different real dates, and the rest of the sport is already underway on the day any one club's own season begins. Set once in `newGame()`. */
  worldOpen: number;
  dates: number;
}

export interface WorldState {
  clubs: Club[];
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
  /** The owner's own club — a reference into `world.clubs`, not a duplicated snapshot. `null` before a club is chosen. */
  ownedClubId: string | null;
  /** Owner-set ticket face price — lived on the original's `G.club` snapshot (`ticket`); now a top-level owner setting since `Club` itself carries no per-owner configuration. Defaulted from `econFor(ownedClub).ticketFace` in `newGame()`. */
  ticketPrice: number;
  /**
   * Owner-set payroll budget, an ANNUAL dollar figure (the same convention
   * `scoutingBudget` uses). Defaulted in `newGame()` from
   * `econFor(ownedClub).payroll` multiplied up to a year — that field is
   * MONTHLY, and storing it raw here used to make this number mean something
   * different from the one below it.
   *
   * REAL as of `DECISIONS.md` D102: what the owner authorises sets both the
   * talent of what the organization signs and what those contracts cost, so
   * it moves wins and drains cash. It applies to the INTAKE, so the effect
   * compounds across seasons rather than landing the moment the dial moves —
   * you cannot buy a better version of a player already under contract.
   */
  payrollBudget: number;
  /** Owner-set scouting budget (DECISIONS.md D90) — an annual dollar figure, same convention as `payrollBudget`. Defaulted from `econFor(ownedClub).scouting` in `newGame()`, and unlike `ticketPrice`/`payrollBudget` it is REAL, not inert: `advance.ts` posts it to the ledger every month crossing (account 5300) and feeds it into `scoutBoostFor` to narrow the owned roster's own scouting reliability. No owner-facing control to move it off that default exists yet (a disclosed gap, not an oversight) — see CHANGELOG.md v2.11.0. */
  scoutingBudget: number;
  /** Owner-set draft philosophy (DECISIONS.md D93) — every OTHER MLB club drafts best-player-available (T3, disclosed); the owned club's own picks follow whichever of "BPA"/"NEED"/"UPSIDE" this is set to. Defaults to "BPA" in `newGame()`. No pick is interactive — this is the one lever the owner has over an otherwise fully-automatic draft. */
  draftPhilosophy: DraftPhilosophy;
  /** The most recently completed amateur draft's full pick-by-pick record (`draft.ts`'s `runDraft`), or `null` before any rollover has ever run one. A draft-day SNAPSHOT per pick, not a live reference — stays accurate after a drafted player ages, develops, or (per churn.ts) eventually leaves the population. Only the latest draft is kept; multi-year draft history is a disclosed future enhancement, not an oversight. */
  lastDraft: DraftPickResult[] | null;
  world: WorldState;
  players: Player[];
  /** `[day, homeClubIndex, awayClubIndex][]`, sorted by day — `schedule.ts`'s `WorldSchedule.games`, indices into `world.clubs`. */
  sched: [number, number, number][];
  sp: number; // cursor into sched — see season.ts's playDay
  /** The owner's own games, most recent last — `season.ts`'s `PlayedGame`, capped the same way the original capped `G.box`. */
  box: PlayedGame[];
  events: unknown[];
  history: unknown[];
  lastAdv: unknown | null;
  ledger: JournalEntry[];
  wire: unknown[];
  needs: unknown[];
  form: unknown[];
  /**
   * The owner's permanent record (`delegation.ts`). Typed since v1 and
   * written by nothing until D100; capped at `LOG_CAP`, since this pass is
   * what starts filling it.
   */
  log: LogEntry[];
  /**
   * How much of the club the owner runs personally, per area (D96, D100).
   * Never carries a `staff` key — that area is not delegable, and the type
   * is what enforces it.
   */
  delegation: DelegationSettings;
  /**
   * Questions waiting for an answer. At most one per (area, tag), and each
   * is consumed at the moment it would matter rather than expiring on a
   * clock — so this array is short and never needs sweeping.
   */
  asks: DeskAsk[];
  /** Monotonic source of ask ids. Never random (D97). */
  nextAsk: number;
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
    season: { year: 2026, gp: 0, sched: 162, phase: "offseason", open: 0, close: 0, worldOpen: 0, dates: 0 },
    ownedClubId: null,
    ticketPrice: 0,
    payrollBudget: 0,
    scoutingBudget: 0,
    draftPhilosophy: "BPA",
    lastDraft: null,
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
    delegation: defaultDelegation(),
    asks: [],
    nextAsk: 1,
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
