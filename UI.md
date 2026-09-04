# UI — Bush League

The interface specification. Proposed 2026-08-27 (pass 1, layout). **Nothing here is coded until Jordan signs off** — that is Law-adjacent process, not a formality: propagating a density call across twenty screens before anyone has seen it is how a pass becomes unshippable.

Governing constraint, from Jordan verbatim: *"very high tech looking with lots of spreadsheet tables and data."* Where a call is between fewer/cleaner and more/denser, **denser wins**. Density is the product. The screen is a phone.

> **Implementation note, added 2026-09-04 (DECISIONS.md D78):** this document is still authoritative for
> layout and information architecture — pages, panes, the grid column schemas, density tiers, the
> provenance sheet. What changed is the renderer: "the shared grid engine" (§6) is now TanStack Table +
> TanStack Virtual; view functions returning HTML strings (old Law 7) are now React components; the
> `:root` token layer (§9) is unchanged in structure and lives at `apps/web/src/styles/tokens.css`. Read
> §9's token block as the spec; the CSS file is the implementation of it, not a replacement for it.

---

## 1 · THE FIVE CONTAINERS, instantiated

| Container | In Bush League | Rule |
|---|---|---|
| **Page** | A place the owner goes: Office, Roster, Standings, Books, Scouting | 1 tap from anywhere. ~20 at finished shape. |
| **Pane** | A view within a page: Roster's *Lineup / Staff / Scout / Paper / Trainer* | Same subject, different question. Never a different subject. |
| **Sheet** | A moment, not a place: a trade offer, a contract negotiation, the column customizer, **the provenance sheet** | Dismissible, over context. |
| **Row** | One player, one club, one journal entry, one game | The unit of the data. Always tappable. |
| **Detail** | The full-page player profile, club profile, game box score | 1 tap from the row. Back returns along the route taken. |

**Three levels maximum on a phone: page → row → detail.** If something wants a fourth level, one of the middle two is a filter pretending to be a level.

---

## 2 · THE PAGE REGISTRY

Navigation is **data, not markup** (D11). One array renders the phone tab bar, the desktop rail, and the full index.

```js
PAGES = [{ id, label, group, view, badge(), value(), pinned }]
```

Every index row carries a **live value** — that is what makes the index a status screen worth opening rather than a menu people avoid.

### Five groups, by what the owner is trying to do

**CLUB** — my ballclub
| Page | Index value | V1 |
|---|---|---|
| Office | `12-9 · 2nd AL East · $412K` | ✅ |
| Roster | `26 active · 38 of 40 · 2 IL` | ✅ |
| Lineup | `set vs RHP · rotation d3` | ✅ |
| Organization | `AAA 71-64 · AA 68-70 · 4 affiliates` | ✅ |

**LEAGUE** — the world
| Page | Index value | V1 |
|---|---|---|
| Standings | `2nd, 1.5 GB · WC +2.0` | ✅ |
| Schedule | `@ BOS tonight · 7-3 last 10` | ✅ |
| Leaders | `Grimsley 4th AL, .291` | ✅ |
| Wire | `14 new · 3 involve you` | ✅ |

**TALENT** — acquiring it
| Page | Index value | V1 |
|---|---|---|
| Scouting | `6 scouts · 41% coverage` | pass 2 |
| Draft | `pick 14 · $8.2M pool · 61 days` | pass 2 |
| Trades | `4 offers open · 2 expiring` | pass 3 |
| Free agents | `212 available · $18M space` | pass 4 |

**MONEY** — the books
| Page | Index value | V1 |
|---|---|---|
| Books | `YTD −$418,203 · cash $412K` | ✅ |
| Budget | `payroll $41.2M of $46M` | ✅ |
| Gate | `$14 avg · 4,180/gm · 71% cap` | ✅ |
| Ownership | `club value $38M · debt $12M` | pass 8 |

**DESK** — the instrument itself
| Page | Index value | V1 |
|---|---|---|
| Settings | `OOTP · dark · compact` | ✅ |
| Save | `autosaved 2 min ago` | ✅ |

**V1 lights 12 pages across 5 groups.** The other 6 exist in the registry as declared-but-dark entries, greyed in the index with the pass number that lights them. Jordan can see the shape of the finished game from day one, and adding a system is one array entry.

---

## 3 · NAVIGATION

### At 360px — bottom bar, 5 pinned + index

```
┌────────────────────────────────────────┐
│  OFFICE   ROSTER   LEAGUE   BOOKS   ⋯  │   56px + safe-area
└────────────────────────────────────────┘
```

Five pinned slots (user-configurable, defaults above) plus `⋯` opening the **full index sheet** — every page, grouped, each with its live value and badge. Bottom because the thumb lives there; primary actions belong low.

### At ≥900px — left rail, always expanded

The same registry rendered as a grouped vertical rail with live values inline. No hamburger on desktop — the width exists, so use it. Content area gets the remainder.

### Depth rule
Page → row → detail. The player profile is a **detail**, not a modal — modals are reserved for utilities (column customizer, provenance, confirmations).

---

## 4 · THE STATUS STRIP — always visible, every screen

A slim terminal strip, **not** a KPI tile band. Numbers live in the tables; the strip carries only what you must know regardless of where you are.

```
┌────────────────────────────────────────┐
│ 2026 · JUN 14 · W11 │ 34-28 │ $412,088 │   40px
└────────────────────────────────────────┘
   date/clock            record    cash
```

At ≥600px it extends: `… │ 2nd AL EAST −1.5 │ PAYROLL $41.2M/$46M │ NEXT @BOS 7:05`.

Cash lives here so it is never more than a glance away — which is what frees the Office page's hero for something else. Values **flash on change** (160ms, `prefers-reduced-motion` honoured) so an advance shows you exactly where the world moved.

---

## 5 · THE ACTION BAR — the core verb, one place

Docked directly above the tab bar, on every page, always the single next thing:

```
┌────────────────────────────────────────┐
│  ▸  ADVANCE TO JUN 15 · @BOS 7:05      │   52px
└────────────────────────────────────────┘
```

When something blocks it, the same bar becomes the block, and tapping it goes there:

```
┌────────────────────────────────────────┐
│  ⚠  3 DECISIONS PENDING — LINEUP NOT SET │
└────────────────────────────────────────┘
```

One location, always low, always the verb. **A silent core verb makes an interface feel broken even when it works perfectly** — so the advance animates: the strip's values flash, the day counter rolls, and results land in the feed.

---

## 6 · THE FLAGSHIP GRID — Roster

Every tabular surface in the game is this one engine (Law 5). The Roster is where it is proven, because it is the widest, densest, most-visited table in the game.

### One column schema, five saved views

Columns come from the real documents in `RESEARCH.md` §3 — the Baseball-Reference team batting and pitching sets, plus the sim's own scouting, contract and medical families.

| View | Columns |
|---|---|
| **LINEUP** *(default)* | `# · Player · Pos · Age · B/T · OVR · POT · G · PA · AB · R · H · 2B · 3B · HR · RBI · SB · BB · SO · BA · OBP · SLG · OPS · OPS+ · WAR` |
| **STAFF** | `# · Player · Role · Age · T · OVR · POT · W · L · ERA · G · GS · SV · IP · H · ER · HR · BB · SO · WHIP · FIP · ERA+ · SO9 · BB9 · WAR` |
| **SCOUT** | `# · Player · Pos · Age · OVR± · POT± · Hit± · Pow± · Eye± · Spd± · Def± · Arm± · REL%` |
| **PAPER** | `# · Player · Pos · Age · Salary · Yrs · Total · SVC · OPT · Status · ARB · FA` |
| **TRAINER** | `# · Player · Pos · Age · Status · Injury · Days · DUR · Fatigue · G · Last` |
| **FULL** | Every column in the schema. Horizontal scroll on desktop; on phone an explicit opt-in toggle, never the default. |

Plus: column customizer (add/remove/reorder), multi-sort, filter chips, **CSV export**, and user-saved views on top of the five built-ins. The customizer is a sheet, not a page.

### Formatting is ship-blocking
`RESEARCH.md` §3.7 is law for every figure. BA/OBP/SLG/OPS/W-L% drop the leading zero (`.291`, `.844`); ERA/FIP/WHIP/WAR/per-nine keep it (`3.45`, `0.922`, `1.9`). IP uses thirds (`144.1` = 144⅓). Tabular numerals everywhere, right-aligned on the decimal.

### Phone list mode — the same column definitions, a different renderer

```
T. Grimsley  1B                        .291
55/60 ovr · 18 hr · .844 ops · 1.9 war
#12 · 27 · R/R · $2.4M thru '29 · 2 opt
```

Line 1 identity + the view's hero figure, right-aligned. Line 2 the three or four supporting numbers with micro-labels. Line 3 quiet context. **Nothing is dropped — the fields move, they do not disappear.** Sort and filter chips pin to the top of the list and the active sort is always visible, because an unexplained short list is otherwise indistinguishable from a bug.

---

## 7 · THE PROVENANCE SHEET — Law 12, made visible

Every number in the game is tappable. Tapping opens a sheet:

```
┌────────────────────────────────────────┐
│  GATE REVENUE — JUN                    │
│  $412,500                              │
│                                        │
│  4,180 avg attendance × 15 dates       │
│  × $6.58 net per head                  │
│                                        │
│  ATTENDANCE   Tier 1                   │
│  MLB Stats API /attendance, 2025       │
│  Indy avg 2,146–2,668 (2023)           │
│  Ballpark Digest, collected 2026-08-27 │
│                                        │
│  NET PER HEAD   Tier 3 — design knob   │
│  Not sourced. Anchored to Frontier     │
│  League 2020 economics.                │
└────────────────────────────────────────┘
```

Tier 3 figures carry a dotted underline in the grid so you can see, at a glance, which numbers are load-bearing and which are still estimates. This is the single feature that makes the difference between a research-grounded sim and a themed one legible **inside the game** rather than only in a markdown file.

---

## 8 · ABOVE THE FOLD AT 360px

360px wide, 16px edge padding = **328px of content**. Vertical budget ~640px after browser chrome. Three columns of numbers is the practical ceiling; four only if all four are short.

### 8.1 OFFICE — the home page

```
┌────────────────────────────────────────┐ 40
│ 2026 · JUN 14 · W11 │ 34-28 │ $412,088 │
├────────────────────────────────────────┤
│                                        │
│  3                                     │ 96   ← hero
│  DECISIONS WAITING                     │
│  lineup · 2 offers expire tonight      │
│                                        │
├────────────────────────────────────────┤ 72
│ NEXT   @ BOSTON  ·  7:05  ·  Crochet   │
│ Fenway · you 4-2 in the season series  │
├────────────────────────────────────────┤
│ NEEDS YOU                              │ 160
│ ▸ Lineup not set vs LHP          →     │
│ ▸ Reyes offer expires 11:00 PM   →     │
│ ▸ Mendoza to 10-day IL — call up →     │
├────────────────────────────────────────┤
│ LAST 5    W7-2  L1-4  W5-3  W2-0  L3-6 │ 80
│ ▁▃▂▅▆▄▇▃  run differential, 10 games   │
├────────────────────────────────────────┤ 52
│  ▸  ADVANCE TO JUN 15 · @BOS 7:05      │
├────────────────────────────────────────┤ 56
│  OFFICE   ROSTER   LEAGUE   BOOKS   ⋯  │
└────────────────────────────────────────┘
                                     ≈556px
```

**Hero rationale, for Jordan's call.** Cash and record are in the strip on *every* screen — so making either one the Office hero spends the game's single biggest visual asset on information already present four pixels above it. What is *not* anywhere else is the answer to "can I advance, or is something waiting on me?" That is the question the owner actually opens the game to answer, and it turns the home page into a launcher. **Recommended.** Alternatives are live and cheap to switch — see §11.

### 8.2 ROSTER — the flagship grid

```
┌────────────────────────────────────────┐ 40
│ 2026 · JUN 14 · W11 │ 34-28 │ $412,088 │
├────────────────────────────────────────┤ 36
│ LINEUP  staff  scout  paper  trainer   │  ← panes
├────────────────────────────────────────┤ 32
│ 26 ACTIVE · 38/40 · 2 IL      ⚙ ↓ ⌕    │
├────────────────────────────────────────┤ 30
│ ▾ OPS   pos: all   ✕ clear             │  ← sort + filter, pinned
├────────────────────────────────────────┤
│ T. Grimsley  1B                   .291 │ 62
│ 55/60 ovr · 18 hr · .844 ops · 1.9 war │
│ #12 · 27 · R/R · $2.4M thru '29 · 2opt │
├────────────────────────────────────────┤
│ R. Villalobos  C                  .248 │ 62
│ 45/55 ovr · 9 hr · .701 ops · 0.8 war  │
│ #7 · 24 · R/R · $760K · pre-arb · 3opt │
├────────────────────────────────────────┤
│ D. Okonkwo  CF                    .276 │ 62
│ 60/60 ovr · 12 hr · .812 ops · 2.4 war │
│ #22 · 29 · L/L · $8.1M thru '28 · 0opt │
├────────────────────────────────────────┤
│ … 23 more                              │
├────────────────────────────────────────┤ 52
│  ▸  ADVANCE TO JUN 15 · @BOS 7:05      │
├────────────────────────────────────────┤ 56
│  OFFICE   ROSTER   LEAGUE   BOOKS   ⋯  │
└────────────────────────────────────────┘
```

Three rows above the fold at 62px each. `⚙` opens the column customizer, `↓` exports CSV, `⌕` filters. At ≥900px the same view renders as the full spreadsheet — 26 columns, sticky header, sticky name column, heat-scaled cells, hairline dividers.

### 8.3 BOOKS — real statements from day one

```
┌────────────────────────────────────────┐ 40
│ 2026 · JUN 14 · W11 │ 34-28 │ $412,088 │
├────────────────────────────────────────┤ 36
│ INCOME  balance  cash  ledger  audit   │  ← panes
├────────────────────────────────────────┤ 30
│ YTD ▾    vs LAST YEAR ▾           ↓    │
├────────────────────────────────────────┤
│  −$418,203                             │ 90  ← hero
│  NET INCOME · YTD                      │
│  −$6,741 per home date                 │
├────────────────────────────────────────┤
│ REVENUE                     $2,104,880 │ 26
│   Gate                       1,412,500 │ 24
│   Concessions                  488,200 │ 24
│   Sponsorship                  142,180 │ 24
│   Merchandise                   62,000 │ 24
├────────────────────────────────────────┤
│ OPERATING EXPENSES          $2,523,083 │ 26
│   Player payroll             1,284,000 │ 24
│   Staff & coaching             412,600 │ 24
│   Travel                       268,400 │ 24
│   Stadium operations           311,083 │ 24
│   Front office                 247,000 │ 24
├────────────────────────────────────────┤ 52
│  ▸  ADVANCE TO JUN 15 · @BOS 7:05      │
└────────────────────────────────────────┘
```

Every line taps through to the journal entries behind it. `audit` is a live pane running `auditBooks()` — the books prove themselves inside the game, on demand, and it is a pane rather than a hidden dev tool because a number the player cannot drill into does not exist here.

---

## 9 · TOKEN LAYER — one `:root`, two shells

**Structure:** palette (the only place a hex appears) → role → shell override → component. Components reference roles only.

```css
:root{
  --pal-ink-98:#050506; --pal-ink-94:#0a0a0a; /* … the only hexes */

  --c-bg:var(--pal-ink-98);  --c-surface:…;  --c-border:…;
  --c-text:…; --c-dim:…; --c-dim2:…;
  --c-pos:…; --c-neg:…; --c-warn:…; --c-accent:…;

  --fs-micro:10px; --fs-sm:11.5px; --fs-base:13px;
  --fs-md:15.5px;  --fs-lg:19px;   --fs-hero:28px;

  --sp-1:4px; --sp-2:8px; --sp-3:12px; --sp-4:16px; --sp-5:24px;

  --dur-instant:90ms; --dur-fast:160ms; --dur-base:240ms;
}
```

**D9's hard rule.** `--shell-*` tokens are the **only** layer either shell may redefine:

| Token | `ootp` | `desk` |
|---|---|---|
| `--shell-font-prose` | serif | sans |
| `--shell-font-num` | sans, `tabular-nums` | sans, `tabular-nums` |
| `--shell-radius` | `0` | `2px` |
| `--shell-label-case` | `none` | `uppercase` |
| `--shell-label-track` | `0` | `.06em` |
| `--shell-row-rule` | 1px hairline | 1px hairline |
| `--shell-flash` | off | on |

**No feature CSS may reference a shell name, and no component may branch on which shell is active.** If a component needs to know the shell, the token layer is wrong. Light/dark flips roles only; shell is orthogonal to theme. That is 2 shells × 2 themes = 4 combinations, all rendered from one component set.

**Contrast is a measured gate, not an eyeball:** 4.5:1 for body and any read figure, 3:1 for large text and interactive borders. Checked computationally in the QA gate, in all four combinations. Dark themes are where 10px small-caps labels fail, every time.

---

## 10 · COMPONENTS — and the four states everyone forgets

Every component ships **default · empty · loading · error · interactive**. The empty state is the one a new owner sees first.

| Component | Empty state must say |
|---|---|
| Grid | "No players match `pos: C` + `OPS > .800`. Clear filters." — never a blank panel |
| Statement | "No entries this period. First gate revenue posts after your home opener, Apr 8." |
| Wire / feed | "Quiet week. The wire fills after your first advance." |
| Scouting | "No looks yet. Assign a scout to see grades tighten." |
| Trade offers | "No offers. AI clubs shop in the two weeks before the deadline." |
| Provenance sheet | "This figure is computed, not sourced — Tier 3 design knob." |

Tap targets **44×44 minimum**, 8px between adjacent targets, even where the row is 26px to read — extend with padding, not visual density. No hover-only affordance anywhere; hover may enhance, never inform.

---

## 11 · OPEN — needs Jordan

1. **Office hero.** Recommended: decisions waiting (§8.1). Live alternatives: cash on hand · record + GB · what changed since last advance.
2. **Default pinned five.** Recommended: Office · Roster · League(Standings) · Books · ⋯.
3. **Roster default view.** Recommended LINEUP; FULL is one tap away.
4. **Default density.** Recommended compact (62px phone rows); standard adds ~8px per row and loses one row above the fold.
5. **Default shell on a new game.** Recommended OOTP, per D8.

---

## 12 · VERIFICATION — what this pass must pass

Per D9 the matrix doubled, so it is written down rather than remembered:

- **8 renders per screen**: {ootp, desk} × {dark, light} × {360px, 1440px}.
- Zero console errors. No horizontal scroll at 360px **or 320px**.
- Contrast measured computationally in all four token combinations.
- Every column reachable in phone list mode — nothing silently dropped.
- Every `data-act` has an `ACTIONS` key; every `VIEWS` key has a function.
- Screenshots **looked at**, not just captured: a DOM harness reports `ok` while content overlaps inside its own container.

---

## 13 · REVISION + SIGN-OFF — 2026-08-27

Jordan's calls on §11:

| Open item | Decision |
|---|---|
| Office hero | Decisions waiting — **but** with a stated reservation: *"im not real big on the idea of having one big thing on the homescreen."* |
| Density | **Ship all three tiers** (dense 44px / compact 62px / standard 70px), selectable in Settings. Compact is the default. |
| Provenance sheet | **Build it into the chassis now**, not a later pass. |
| Checkpoint screens | **Office + Books** (not Roster + Books as recommended). |

### 13.1 The Office is re-specified — hierarchy without a hero figure

His reservation is correct and it outranks the doctrine's default reading. "One hero figure per screen" exists to create hierarchy; it is not a requirement that hierarchy be created *by a large number*. On a screen whose whole thesis is *"lots of spreadsheet tables and data,"* a 28px figure floating in 96px of space is the single most off-brand element we could ship.

**Revised: six dense panels. Hierarchy from position, weight and a single accent rule.**

```
┌────────────────────────────────────────┐ 40
│ 2026 · JUN 14 · W11 │ 34-28 │ $412,088 │
├────────────────────────────────────────┤
│ NEEDS YOU                          3 ▸ │ 22   ← primary: top slot,
│▌Lineup not set vs LHP         SET  →   │ 30      accent left-rule,
│▌Reyes 3yr/$14M offer     11:00 PM  →   │ 30      every line tappable
│▌Mendoza to IL — 40-man spot open   →   │ 30
├────────────────────────────────────────┤
│ TONIGHT  @ BOS 7:05   Crochet L 3.12   │ 22
│ SP Tavares R  4-3  3.88 · 4-2 series   │ 22
├──────────────────────┬─────────────────┤
│ AL EAST     W-L   GB │ LAST 10    7-3  │ 20
│ 1 NYY     38-24   —  │ ▁▃▂▅▆▄▇▃▆▂      │ 26
│ 2 YOU     34-28  1.5 │ RS 51   RA 39   │ 20
│ 3 TOR     33-29  2.5 │ DIFF +12        │ 20
├──────────────────────┴─────────────────┤
│ JUN        GATE      +412,500          │ 20
│            OPS       −398,140          │ 20
│            NET        +14,360          │ 20
│            YTD       −418,203          │ 20
├────────────────────────────────────────┤
│ WIRE                                   │ 20
│ TOR places Alvarez on 10-day IL    2h  │ 22
│ BAL claims RHP Whitlock off waivers 5h │ 22
│ AAA: Okafor 4-for-4, 2 HR          9h  │ 22
├────────────────────────────────────────┤ 52
│  ▸  ADVANCE TO JUN 15 · @BOS 7:05      │
├────────────────────────────────────────┤ 56
│  OFFICE   ROSTER   LEAGUE   BOOKS   ⋯  │
└────────────────────────────────────────┘
                                     ≈528px
```

**Rule extracted from this, and it now governs every screen in the game:** hierarchy is created by *position, weight, and restraint with the accent colour* — not by scale. Exactly one element per screen carries the accent rule. Type-size jumps stay within two adjacent steps of the scale except in the Books statements, where a single figure genuinely is the answer to the screen's question.

### 13.2 Density tiers

Three tiers, scaling **only** `--sp-*` and `--row-h` tokens. **Never the type scale** — scaling type across density tiers destroys the hierarchy the type scale exists to create.

| Tier | Phone row | Lines | Rows above fold |
|---|---|---|---|
| `dense` | 44px | 2 — context moves to detail | ~5 |
| `compact` **(default)** | 62px | 3 | ~3 |
| `standard` | 70px | 3, more air | ~3 |

Verification cost, recorded honestly: the matrix is now 2 shells × 2 themes × 3 densities × 2 widths = **24 renders per screen**. The gate samples — all 4 shell/theme combinations at both widths in `compact`, plus `dense` and `standard` at 360px in the default shell. 8 + 2 = 10 renders per screen, with the full 24 reserved for the total sweep.

### 13.3 Checkpoint scope — Office + Books

Roster is deferred to the propagation pass. Consequence, stated so it is not a surprise: the grid engine still gets built and proven this pass, because **the Books `ledger` pane is a grid surface** — journal entries, sortable, filterable, CSV-exportable, phone list mode. It is a narrower proof than the 26-column roster, so the roster build is where the column customizer and saved views get their real test.

What the checkpoint ships against, per D10: all 30 MLB clubs with real identity and division, generated records and team aggregates; the owned club's full 40-man with fictional players, stat lines, contracts and noisy 20–80 grades; the affiliated ladder and four partner leagues as real structure; and a real double-entry ledger with a season of postings behind every figure on the Books screen.
