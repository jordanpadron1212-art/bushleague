/**
 * Provenance registry — LAWS.md Law 12: "every number carries a tier... if a
 * number isn't in RESEARCH.md, research it and add it with a source — never
 * silently invent." This registry is what makes that checkable inside the
 * game (UI.md §7, "the provenance sheet"), not just in a markdown file.
 *
 * Ported from bush-league-v0.10.html's `SRC` object. Citations are quoted
 * from RESEARCH.md, not re-derived — do not edit a citation here without
 * updating RESEARCH.md first, and vice versa.
 */

export type Tier = 1 | 2 | 3;

export interface Source {
  /** Tier 1 = exact figure from a real document · 2 = within a stated tolerance · 3 = labelled estimate. */
  t: Tier;
  /** Short name shown in the UI. */
  n: string;
  /** Full citation, quoted from RESEARCH.md. */
  c: string;
}

export const SOURCES: Readonly<Record<string, Source>> = {
  att_mlb: {
    t: 1,
    n: "MLB attendance 2025",
    c: "29,459 per game across 2,424 dates (71,409,421 total). MLB Stats API /attendance, cross-checked against Baseball America 2025-09-28 — agreement to 1 fan per game. Collected 2026-08-27.",
  },
  att_milb: {
    t: 1,
    n: "MiLB attendance by level 2025",
    c: "AAA 5,556 · AA 4,143 · High-A 3,333 · Single-A 2,106 per game. MLB Stats API /attendance aggregated by level; the four level totals reconcile to Baseball America's published MiLB total within 0.017%. Collected 2026-08-27.",
  },
  att_indy: {
    t: 2,
    n: "Independent league attendance 2023",
    c: "American Association 2,668 · Atlantic 2,529 · Pioneer 2,248 · Frontier 2,146 per game. Ballpark Digest 2023-09-19. No 2024 or 2025 figure exists in published form — this is the most recent available and is labelled 2023, not current.",
  },
  ticket: {
    t: 3,
    n: "Net revenue per head",
    c: "NOT SOURCED. Design knob. Ticket pricing by level and market is an outstanding RESEARCH.md target — it belongs to the money-loop pass.",
  },
  pay_indy: {
    t: 2,
    n: "Independent-league payroll caps",
    c: "Team caps: Atlantic $225,000-$275,000 (Indy Ball Island, 2018, T3). American Association $125,000, $1,200/month rookie minimum (Dakota News Now, 2018-06-10, T2). Frontier $85,000, $1,600/month individual max (Spectrum News 1, 2022-08-12, reporting 2020, T1). Pioneer: no cap published, $95,000 placed between Frontier and American Association, T3. Pecos $12,100. Nothing newer than 2020 is published for any league. RESEARCH §9.2.",
  },
  lgrules: {
    t: 1,
    n: "Independent-league roster rules",
    c: "Frontier: age-based (frontierleague.com/player-eligibility, T1). American Association: service-based (Media Guide, T1/T2). Pioneer: 25 active, no player above 3 years prior professional service — its only published rule (MiLB.com, T1). Atlantic League: no roster rule is published — Rules 10/11/12 of its 2025 Umpire Edition are marked NA in their entirety. Pecos: pecosleague.com, T1. RESEARCH §9.1.",
  },
  pay_milb: {
    t: 2,
    n: "Affiliated minimum salaries",
    c: "Complex $19,800 · Single-A $26,200 · High-A $27,300 · Double-A $30,250 · Triple-A $35,800 per year. First MiLB CBA, five years from 2023 (MLB Trade Rumors 2023-04-03).",
  },
  roster: {
    t: 1,
    n: "Roster rules",
    c: "26 active (28 from Sep 1), 13 pitchers (14 from Sep 1), 40-man, 3 option years burned at 20+ days, IL minimums 7/10/15/60 days. MLB glossary, collected 2026-08-27. All are 2022-26 CBA artifacts — that agreement expires 2026-12-01.",
  },
  sched: {
    t: 1,
    n: "Schedule structure",
    c: "162 games: 52 division + 62 same-league non-division + 48 interleague. Verified against the MLB Stats API schedule endpoint.",
  },
  scale: {
    t: 1,
    n: "The 20-80 scale",
    c: "50 is major-league average; each 10 points is one standard deviation. Grade-to-units from Baseball America 2025-09-23 (current). RESEARCH §4.2.",
  },
  bust: {
    t: 1,
    n: "Prospect outcome rates",
    c: "A 50 FV hitter washes out 23% of the time; a 45 FV hitter 51%. FanGraphs (Clemens) 2025-02-10, prospect lists 2019-2022 vs three-year-forward outcomes. RESEARCH §4.4.",
  },
  pay_mlb: {
    t: 3,
    n: "Major-league salary scale",
    c: "NOT SOURCED. Design knob. MLB minimum salary, arbitration and luxury-tax thresholds are outstanding RESEARCH.md targets belonging to the contracts pass.",
  },
  runenv: {
    t: 1,
    n: "League environment by level, 2025",
    c: "MLB .245/.315/.404, 4.45 R/G, 4.15 ERA. Triple-A .258/.347/.421, 5.24 R/G. Double-A .235/.323/.360, 4.29 R/G — the lowest-scoring level in professional baseball. Verified by a closed-league identity check. RESEARCH §7.1.",
  },
  indyenv: {
    t: 3,
    n: "Independent-league environment — borrowed",
    c: "No independent league publishes rate statistics. Each indy league uses the published environment of the affiliated level its roster rules make it resemble. RESEARCH §7.3.",
  },
  gen: {
    t: 3,
    n: "Generated figure",
    c: "Produced by the world generator from the distributions above. Player identities are fictional by design.",
  },
} as const;

export type SourceKey = keyof typeof SOURCES;

/** The worst (highest) tier among a figure's cited sources — what the UI's dotted underline keys off. */
export function worstTier(keys: readonly SourceKey[]): Tier {
  if (keys.length === 0) return SOURCES.gen!.t;
  return keys.reduce<Tier>((worst, k) => {
    const t = SOURCES[k]?.t ?? 3;
    return t > worst ? t : worst;
  }, 1);
}
