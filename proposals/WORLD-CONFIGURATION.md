# PROPOSAL — World configuration: league packs, selection, and the background world

**Status: awaiting sign-off.** Written 2026-09-05 against the decisions Jordan gave the same day;
§8 was resolved later the same day by D96. Nothing here is built yet.

This replaces the ownership ladder as the top roadmap item. It is the foundation for the
sandbox: real clubs at every level, the player choosing which leagues load, and custom
leagues as a first-class layer rather than a bolt-on.

---

## 1. What was decided

| Question | Answer |
|---|---|
| Scope beyond the current 218 clubs | **Add complex/rookie ball (ACL, FCL) and an amateur/college layer** |
| Unloaded leagues | **Exist as data, don't play** — real named clubs with budgets that buy and sell players; no games, standings or box scores simulated |
| Fail state | **Optional, set at new-game** — sandbox by default, insolvency available |
| How deep the college layer goes | **Through the custom-league system** — leagues are authorable data, and college ships as a pack built with that same mechanism |
| What the owner owns | **The whole organization — but staff operate it (D96, §8)** |

The fourth answer is the important one architecturally: it says the answer to "how much
college data do we source" is *not* a number, it's a system. Leagues stop being hardcoded
tables and become data. That single change also delivers league selection and custom leagues,
because all three are the same mechanism.

---

## 2. The actual problem

`world-data.ts` (326 lines) holds the world in **three incompatible shapes**:

- `MLB` — flat tuple rows: `[abbr, city, name, league, division, park]`
- `MILB` — `Record<level, { games, att, leagues: [name, cities[]][] }>`, with a separate flat
  `MILB_PARENT` lookup keyed `"level:city"`
- `INDY` — an array of objects, each carrying its own game count, attendance, cap, opex scale
  and published roster-composition table

`buildWorld()` takes no arguments and walks all three with three different code paths. Adding
a league today means writing new code, not new data — which is exactly why complex/rookie,
college, and custom leagues are all blocked behind the same wall.

**The work is collapsing those three shapes into one, without losing anything.** Everything
the three shapes currently carry is real, sourced and load-bearing; a unified format has to
hold all of it.

---

## 3. The league pack format

A **pack** is one JSON-shaped object describing one or more leagues. Shipped packs live in
the repo; custom packs are authored by the player and stored with the save.

```ts
interface LeaguePack {
  id: string;                 // "mlb", "milb-aaa", "indy", "college-d1", or a custom id
  name: string;               // "Triple-A", "Frontier League", "NCAA Division I"
  source: "shipped" | "custom";
  leagues: League[];
}

interface League {
  id: string;
  name: string;               // "International League"
  /** Which calibrated run environment this league plays in — see §4. NOT free-form. */
  env: "MLB" | "AAA" | "AA" | "HIA" | "A" | "INDY";
  /** What the player may do here. Complex/rookie and college are never ownable. */
  ownable: boolean;
  affiliation: "affiliated" | "independent" | "amateur";
  games: number;              // published season length
  attendance: number;         // baseline average — drives gate revenue and capacity
  econ?: EconOverrides;       // cap, opex scale — the INDY shape, optional
  roster?: RosterCompRow[];   // published composition rule, where one exists
  divisions?: string[];
  clubs: ClubSeed[];
}

interface ClubSeed {
  city: string;
  name?: string;              // MiLB clubs currently carry none — stays optional
  abbr?: string;              // derived when absent, as today
  park?: string;
  division?: string;
  parent?: string;            // parent club id, for affiliated clubs
}
```

Every field above already exists somewhere in `world-data.ts`. This is a **re-shaping, not an
invention** — the migration should be provably lossless (§9).

`buildWorld()` becomes `buildWorld(config: WorldConfig)`, and the existing 218-club world
becomes the default config rather than a hardcoded constant.

---

## 4. The honest constraint: run environments are calibrated, and can't be authored

The sim's realism rests on per-level calibration — `RESEARCH.md` §7.1 published lines that
`calibration.test.ts` checks 50 ways, plus the Pecos high-altitude environment. Those are
**sourced measurements, not settings.**

So a custom league declares which existing environment it plays in (`env`). It cannot invent
a new one, because there would be nothing real behind it. A user-made "Japanese Pacific
League" can say `env: "MLB"` and play at major-league difficulty; it cannot say "here is a
brand new run environment" and have the numbers mean anything.

This is a real limit and the UI should say so plainly rather than hiding it. It is also the
thing that keeps custom leagues from quietly destroying the realism the whole project is
built on.

---

## 5. Selection: three states per league

At new-game, each available league is set to one of:

- **Played** — fully simulated. Games, standings, box scores, its own economy.
- **Background** — clubs exist as real named entities with budgets. They buy and sell
  players and set market prices. No games simulated. *(This is the decided default for
  anything not played.)*
- **Absent** — not in this world at all.

Complex/rookie and college default to **background** even when their parent leagues are
played: they are talent pipelines, not spectator leagues, and nobody wants a box score for a
Florida Complex League game.

---

## 6. What "background" actually means mechanically

This is the part with a genuine open cost. A background league needs:

1. **Named clubs** — so a transaction reads "sold to the Somerset Patriots," not "sold."
2. **A budget** — derived from its league's `attendance`/`econ`, the same figures the played
   economy already uses. No new sourcing.
3. **A demand model** — how often background clubs buy players, and what they pay.

Item 3 is the only genuinely new number. **This project has already solved it once:** the
original build's v0.9 winter cycle ran weekly contract purchases by affiliated organisations,
and that mechanism is what produced the churn figures still cited in `CHANGELOG.md` Build 0.9
(roster continuity 24–41%, median age 26). The rate should be re-derived against those same
sourced targets rather than invented — the same empirical method D86 and D89 already used.

Background clubs do **not** get: schedules, standings, box scores, or per-game simulation.
That is what keeps 300+ college programs and ~180 complex clubs affordable.

---

## 7. Save schema

Adding world configuration changes what a save *is*, so it must land while
`SCHEMA_VERSION` is 1 and no real saves exist. Additions:

```ts
worldConfig: {
  packs: string[];                              // pack ids loaded
  leagues: Record<string, "played" | "background" | "absent">;
  customPacks: LeaguePack[];                    // authored packs travel inside the save
  insolvency: boolean;                          // the optional fail state
}
```

Custom packs are stored **in the save**, not referenced externally — a save must stay
self-contained and openable on another device, which the IndexedDB persistence already
assumes.

---

## 8. Resolved: you own the organization, but you don't operate it

**Answered 2026-09-05 (DECISIONS.md D96, `proposals/OWNER-AND-STAFF.md`).** You own the whole
organization — the MLB club plus its AAA/AA/High-A/Single-A and complex clubs. But you hold them
as **assets and cost centres, not as rosters you hand-edit.** Staff run baseball operations, and a
per-area delegation dial (Hands-on / Approve / Notify / Silent) decides what reaches your desk.

That dissolves the concern this section originally raised. "Every screen needs a which-club
switcher" assumed the owner edits rosters at each level. They don't — it's a *reporting* context,
which is far cheaper. An independent club simply has no affiliates, so the same model degrades to
a single club with nothing special-cased.

Portfolio ownership (unrelated clubs at once) stays deferred behind a toggle.

## 9. Build order, and how each step is proven

1. **Define the format and migrate the existing 218 clubs onto it.** Proven by a test that
   the world built from packs is *identical* to the world built from the old constants —
   same club count, ids, abbreviations, divisions, parents, capacities. Lossless or it
   doesn't land.
2. **`buildWorld(config)` + the three-state selection**, defaulting to today's world.
   Existing tests must pass untouched.
3. **The background-world model**, re-derived against Build 0.9's own sourced churn targets.
4. **Source and ship the complex/rookie pack** (ACL + FCL, ~180 clubs, all `background`,
   all owned by MLB orgs — `RESEARCH.md` needs a new section, same discipline as §2.6).
5. **Ship a college pack** — real program and conference names, generated players (§4's
   constraint means the players were always going to be generated).
6. **The new-game league picker.** The most important screen in the game and it does not
   exist yet; built in the new design system (`design/DESIGN-SYSTEM.md`), not the old one.
7. **Custom league authoring** — the same format, an editor, validation against §4.

Steps 1–2 are pure refactor with a provable equivalence check, which makes them safe to do
first and safe to do fast.
