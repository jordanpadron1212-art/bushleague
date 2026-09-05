/**
 * The delegation dial — `DECISIONS.md` D96 and `proposals/OWNER-AND-STAFF.md`,
 * step 1 of that document's own build order: "the delegation dial with no
 * staff behind it." The settings are real, and the systems that already run
 * automatically start reporting through them.
 *
 * **There is no staff simulation in this file and none is implied by it.**
 * The "GM" of step 1 is the engine's existing automatic logic wearing a
 * name. Saying so here is cheaper than discovering it later.
 *
 * FRAMEWORK- AND STATE-AGNOSTIC on purpose. Nothing here imports
 * `GameState`; every function takes what it operates on as a parameter
 * rather than closing over module state — the same shape `ledger.ts`'s own
 * header argues for. That also lets `state.ts` import these types without a
 * cycle, exactly as it already imports `DraftPhilosophy` from `draft.ts`.
 *
 * ## What the four settings actually do
 *
 * The proposal's table, made mechanical. Every row writes to the log; the
 * dial decides whether it also reaches the desk, and whether it waits.
 *
 * | level | asks first? | recommends? | if you never answer | on the desk |
 * |---|---|---|---|---|
 * | `hands-on` | yes | **no** — no staff opinion, it's your call | nothing changes | the ask |
 * | `approve` | yes | yes | the recommendation is taken | the ask |
 * | `notify` | no | — | already done | a notice |
 * | `silent` | no | — | already done | nothing |
 *
 * Two consequences worth stating because they are easy to get wrong:
 *
 * - **Hands-on gets no recommendation.** Not an oversight — under Hands-on
 *   you have said you want to decide, and there is nobody with an opinion
 *   yet anyway. It also makes Hands-on and Approve visibly different, which
 *   is the whole point of shipping the dial before the staff.
 * - **Nothing ever blocks.** An unanswered ask is resolved by its own
 *   `fallback` at the moment it would matter, and the fallback is written on
 *   the ask when it is raised and shown to the player before they ignore it.
 *   So silence is a safe, informed input rather than a way to deadlock the
 *   simulation. `advanceDay` never consults this module.
 *
 * ## Determinism (D85)
 *
 * Nothing here draws from an `Rng`, reads a clock, or mints an id from
 * randomness. Ids come from a monotonic counter the caller threads through,
 * the same `JeCounter` box `ledger.ts` already uses for `nextJe` — and
 * deliberately NOT `makePlayer`'s old random scheme, whose collision defect
 * D97 fixed five days ago. Days are serial integers, never `Date` (Law 2).
 */

/** The four settings, in ascending order of how much you hand over. */
export type DelegationLevel = "hands-on" | "approve" | "notify" | "silent";

export const DELEGATION_LEVELS: readonly DelegationLevel[] = ["hands-on", "approve", "notify", "silent"];

/**
 * Every area EXCEPT staff hiring. The exclusion is structural rather than a
 * rule someone has to remember: `DelegationSettings` is keyed on this type,
 * so a preset or a "set everything to Silent" helper that tried to include
 * staff would not compile.
 */
export type DelegableDomain =
  | "payroll"
  | "ticketing"
  | "capex"
  | "scouting"
  | "financing"
  | "moves"
  | "signings"
  | "trades"
  | "draft"
  | "lineups";

/**
 * Every area, including the one that is never delegable. Producers and the
 * UI speak in this type; only the SETTINGS map narrows to `DelegableDomain`.
 */
export type DecisionDomain = DelegableDomain | "staff";

export const DELEGABLE_DOMAINS: readonly DelegableDomain[] = [
  "payroll",
  "ticketing",
  "capex",
  "scouting",
  "financing",
  "moves",
  "signings",
  "trades",
  "draft",
  "lineups",
];

/** What the owner has set, per area. Total, never partial — see `normalizeDelegation`. */
export type DelegationSettings = Record<DelegableDomain, DelegationLevel>;

export interface DomainDef {
  id: DecisionDomain;
  label: string;
  group: "owner" | "baseball";
  /**
   * Whether anything in the engine actually reports through this area yet.
   * The same honesty `registry.tsx` already applies to unlit pages: a dial
   * with nothing behind it is shown as such rather than silently doing
   * nothing, because a control that provably changes nothing teaches the
   * player that the mechanic is decorative.
   */
  live: boolean;
  /** One line for the UI — what this area does, or what it is waiting for. */
  note: string;
}

/**
 * The eleven areas from `proposals/OWNER-AND-STAFF.md` §2, with `live` set
 * by what the engine can actually emit today rather than by what is planned.
 *
 * Four are live. `draft` because `runDraft` already executes an owner
 * policy (D93 built this pattern before it had a name). `signings` because
 * `churnWorld` already runs the winter. `scouting` because the budget posts
 * monthly to account 5300 and feeds `scoutBoostFor` (D90). And `ticketing`
 * as of D101 — the face price now moves both attendance and realised gate
 * revenue, against a sourced elasticity (RESEARCH.md §25).
 *
 * The last two happen DURING a season, which is what makes the desk
 * something other than annual mail.
 */
export const DOMAINS: readonly DomainDef[] = [
  { id: "staff", label: "Staff hiring", group: "owner", live: false, note: "Never delegable — hiring is the one call that is always yours. No staff exist yet." },
  { id: "payroll", label: "Payroll budget", group: "owner", live: false, note: "Waiting on a payroll system — the budget is recorded but nothing spends against it yet." },
  { id: "ticketing", label: "Ticket pricing", group: "owner", live: true, note: "Live. Sets what you charge — and how many people come through the gate." },
  { id: "capex", label: "Facilities and capex", group: "owner", live: false, note: "Waiting on a facilities system." },
  { id: "scouting", label: "Scouting budget", group: "owner", live: true, note: "Live. Posts monthly and sets how reliable your own players' grades are." },
  { id: "financing", label: "Debt and financing", group: "owner", live: false, note: "Waiting on a financing system — every club currently carries its opening note and nothing else." },
  { id: "moves", label: "Player moves", group: "baseball", live: false, note: "Waiting on a transaction system — call-ups, options and releases." },
  { id: "signings", label: "Signings", group: "baseball", live: true, note: "Live. The winter's departures, retentions and signings are reported through here." },
  { id: "trades", label: "Trades", group: "baseball", live: false, note: "Waiting on a trade system." },
  { id: "draft", label: "Amateur draft", group: "baseball", live: true, note: "Live. Your draft policy, and what the org did with it." },
  { id: "lineups", label: "Lineups and rotation", group: "baseball", live: false, note: "A bench coach's job. Reported, never set by you." },
];

/**
 * The starting dial. `approve` for most areas, per the proposal's own
 * "the default for most areas"; `lineups` starts at `silent` because it is
 * the clearest case of something an owner should never touch (§5), and
 * defaulting it to Approve would ask the owner to rubber-stamp a batting
 * order on day one — the exact experience D96 exists to prevent.
 */
export const DEFAULT_DELEGATION: DelegationSettings = {
  payroll: "approve",
  ticketing: "approve",
  capex: "approve",
  scouting: "approve",
  financing: "approve",
  moves: "approve",
  signings: "notify",
  trades: "approve",
  draft: "approve",
  lineups: "silent",
};

export function defaultDelegation(): DelegationSettings {
  return { ...DEFAULT_DELEGATION };
}

export type PresetId = "new-owner" | "investor" | "meddler";

/**
 * Three starting stances, so the dial is a choice on day one instead of ten
 * dropdowns. Named for how someone would describe themselves, not for a
 * difficulty tier — there is no harder or easier here, only more or less
 * involved.
 */
export const PRESETS: Record<PresetId, { label: string; note: string; settings: DelegationSettings }> = {
  "new-owner": {
    label: "New owner",
    note: "Staff propose, you decide. The default.",
    settings: defaultDelegation(),
  },
  investor: {
    label: "Investor",
    note: "You hire well and stay out of it. Everything is handled; read the log if you want to know how.",
    settings: {
      payroll: "notify", ticketing: "silent", capex: "silent", scouting: "notify", financing: "notify",
      moves: "silent", signings: "silent", trades: "notify", draft: "silent", lineups: "silent",
    },
  },
  meddler: {
    label: "Hands-on owner",
    note: "Nothing happens without you. Expect to be asked about everything.",
    settings: {
      payroll: "hands-on", ticketing: "hands-on", capex: "hands-on", scouting: "hands-on", financing: "hands-on",
      moves: "hands-on", signings: "hands-on", trades: "hands-on", draft: "hands-on", lineups: "notify",
    },
  },
};

/**
 * The only read path. `staff` always answers `hands-on` — it is not a key in
 * the settings map, so this is the one place that fact has to be stated, and
 * a hand-edited save that somehow carries one cannot change it.
 */
export function delegationFor(settings: DelegationSettings, domain: DecisionDomain): DelegationLevel {
  if (domain === "staff") return "hands-on";
  return settings[domain] ?? DEFAULT_DELEGATION[domain];
}

/** The only write path. Returns a new object; never mutates. */
export function setDelegation(
  settings: DelegationSettings,
  domain: DelegableDomain,
  level: DelegationLevel,
): DelegationSettings {
  return { ...settings, [domain]: level };
}

const isLevel = (v: unknown): v is DelegationLevel =>
  typeof v === "string" && (DELEGATION_LEVELS as readonly string[]).includes(v);

/**
 * The only cast. Takes anything — a save from an older build, a hand-edited
 * file, `undefined` — and returns a total, legal settings map, keeping
 * whatever was recognizable and defaulting the rest. Unknown keys (including
 * `staff`, if some future save carries one) are dropped rather than
 * preserved, so they cannot accumulate in saves forever.
 */
export function normalizeDelegation(raw: unknown): DelegationSettings {
  const out = defaultDelegation();
  if (typeof raw !== "object" || raw === null) return out;
  const src = raw as Record<string, unknown>;
  for (const d of DELEGABLE_DOMAINS) {
    const v = src[d];
    if (isLevel(v)) out[d] = v;
  }
  return out;
}

// ---- Asks: the one thing that waits for an answer ----

export interface AskOption {
  id: string;
  label: string;
}

/**
 * A question on the owner's desk.
 *
 * Deliberately NOT a queue item with a status machine, an expiry day and a
 * sweep. An ask is consumed at the exact moment it would matter — the
 * rollover reads the draft ask just before drafting, the month crossing
 * reads the scouting ask just before posting — which makes "nothing ever
 * blocks" structural rather than a policy enforced by a clock. Nothing
 * expires because nothing waits indefinitely: the moment arrives, the answer
 * or the fallback is taken, and the ask is gone.
 *
 * That also sidesteps a defect worth recording: `startNewSeason` moves the
 * calendar **186 days** in one call (measured, seed 5 / MLB_NYY: serial
 * 20703 → 20889). Any design that filed a day-based TTL at rollover would
 * have it expire before the owner could ever see it.
 */
export interface DeskAsk {
  id: string;
  domain: DelegableDomain;
  /** Stable machine tag (`draft.policy`, `scouting.budget`) — never prose. */
  tag: string;
  /** Serial day raised. */
  day: number;
  /**
   * The level in force when this was raised. Recorded rather than looked up
   * later, so moving the dial afterwards does not retroactively change what
   * an already-open question was asking.
   */
  level: DelegationLevel;
  options: AskOption[];
  /** Option id taken if the owner never answers. Always one of `options`. */
  fallback: string;
  /** The staff recommendation, or null under Hands-on (nobody is offering an opinion). */
  recommended: string | null;
  /** The owner's answer, or null. */
  chosen: string | null;
  /**
   * Numbers the UI renders into prose. Stored as data, never as English, so
   * the copy can be rewritten in a later build without thirty seasons of
   * saves carrying the old wording.
   */
  facts: Record<string, number>;
}

/** A monotonic counter box, the same shape `ledger.ts` uses for `nextJe`. */
export interface AskCounter {
  value: number;
}

export interface RaiseAskInput {
  domain: DelegableDomain;
  tag: string;
  day: number;
  level: DelegationLevel;
  options: AskOption[];
  fallback: string;
  recommended: string | null;
  facts?: Record<string, number>;
}

/**
 * Mints an ask. Ids are `ask:<n>` from the caller's counter — provably
 * unique, never random (D97's lesson, applied to the second id-minting
 * system in the codebase rather than rediscovered later).
 *
 * Throws if `fallback` or `recommended` is not one of the options: an ask
 * whose fallback cannot be taken is a deadlock waiting to happen, and it is
 * far better to fail at the emitter than to discover it at a rollover.
 */
export function raiseAsk(counter: AskCounter, input: RaiseAskInput): DeskAsk {
  const ids = new Set(input.options.map((o) => o.id));
  if (!ids.has(input.fallback)) {
    throw new Error(`ask "${input.tag}": fallback "${input.fallback}" is not one of its options`);
  }
  if (input.recommended !== null && !ids.has(input.recommended)) {
    throw new Error(`ask "${input.tag}": recommendation "${input.recommended}" is not one of its options`);
  }
  return {
    id: `ask:${counter.value++}`,
    domain: input.domain,
    tag: input.tag,
    day: input.day,
    level: input.level,
    options: input.options,
    fallback: input.fallback,
    recommended: input.recommended,
    chosen: null,
    ...(input.facts ? { facts: input.facts } : { facts: {} }),
  };
}

/**
 * Records an answer. Returns a new array; never mutates. An unknown ask id
 * or an option that isn't on the ask is ignored rather than thrown — this
 * is reachable from a stale UI (the ask was consumed by a rollover between
 * render and click), and losing a click is better than losing the session.
 */
export function answerAsk(asks: readonly DeskAsk[], askId: string, optionId: string): DeskAsk[] {
  return asks.map((a) => {
    if (a.id !== askId) return a;
    if (!a.options.some((o) => o.id === optionId)) return a;
    return { ...a, chosen: optionId };
  });
}

/** What actually happens: the owner's answer if there is one, else the fallback they were shown. */
export function resolveAsk(ask: DeskAsk): string {
  return ask.chosen ?? ask.fallback;
}

/** The open ask for an area, if any. At most one per area is ever raised. */
export function askFor(asks: readonly DeskAsk[], domain: DelegableDomain, tag: string): DeskAsk | undefined {
  return asks.find((a) => a.domain === domain && a.tag === tag);
}

/** Removes an ask once it has been consumed. */
export function clearAsk(asks: readonly DeskAsk[], askId: string): DeskAsk[] {
  return asks.filter((a) => a.id !== askId);
}

// ---- The log: the permanent record, written at every level ----

/**
 * One line in the owner's record.
 *
 * `state.log` has been typed `{d, t, c}[]` and EMPTY since v1 — nothing in
 * this codebase has ever written to it. This pass is its first writer, so
 * it also settles the convention: `d` serial day, `t` the machine tag, `c`
 * the copy, plus `dm` the area (so the record can be filtered by area later
 * without re-deriving it from the tag) and `sf` marking a line that should
 * surface on the desk until acknowledged.
 *
 * Every reportable fact writes a line at EVERY level, Silent included —
 * that is the proposal's own wording ("It's in the log if you go looking").
 * Silent costs you the desk item, never the record.
 */
export interface LogEntry {
  d: number;
  t: string;
  c: string;
  dm?: DecisionDomain;
  /** 1 while this should show on the desk. Absent once acknowledged, or never set under Silent. */
  sf?: 1;
}

/**
 * A rolling window, mirroring `box`'s own cap. `state.log` is otherwise
 * unbounded and this pass is what starts filling it; a save that grows
 * forever is a defect that takes a year of play to show up, which is the
 * worst kind.
 *
 * Honest consequence, since the proposal calls the log "the record": at a
 * few lines a month plus a dozen a rollover, 500 lines is roughly a decade.
 * Beyond that the earliest lines are dropped. A per-area archive is the fix
 * if that ever matters; it is not built.
 */
export const LOG_CAP = 500;

/** Appends a line and trims to `LOG_CAP`, oldest first. Mutates, like the rest of the day-advance path. */
export function pushLog(log: LogEntry[], entry: LogEntry): void {
  log.push(entry);
  if (log.length > LOG_CAP) log.splice(0, log.length - LOG_CAP);
}

/** Whether an area's activity should appear on the desk at all, given its level. */
export function surfaces(level: DelegationLevel): boolean {
  return level !== "silent";
}

/** Whether the owner is asked BEFORE the thing happens. */
export function asksFirst(level: DelegationLevel): boolean {
  return level === "hands-on" || level === "approve";
}

/** Whether staff offer an opinion. Hands-on gets none — you said you'd decide. */
export function recommends(level: DelegationLevel): boolean {
  return level === "approve";
}

/** Marks every surfaced line as read. */
export function acknowledgeLog(log: readonly LogEntry[]): LogEntry[] {
  return log.map((l) => {
    if (l.sf !== 1) return l;
    const { sf: _sf, ...rest } = l;
    return rest;
  });
}

/** How many lines are waiting to be read — the desk's unread count. */
export function unreadCount(log: readonly LogEntry[]): number {
  let n = 0;
  for (const l of log) if (l.sf === 1) n++;
  return n;
}
