# Stack, engines & packs — name list

Simple inventory of software, runtimes, engines, packs, and related names locked or catalogued for **mobile-games**. Names only.

---

## Languages & runtimes

- TypeScript
- JavaScript
- Node.js 24
- Corepack
- Android Chrome (primary play target)
- Android (primary OS target)

## Package / monorepo tooling

- pnpm 11
- pnpm workspaces
- pnpm catalogs
- Turborepo (ready; add when 2+ games)
- Vitest
- Zod

## App / UI stack

- React 19
- Vite
- vite-plugin-singlefile
- Tailwind CSS v4
- react-router v7
- createHashRouter
- Zustand
- TanStack Table
- TanStack Virtual (when rosters get huge)
- CSS (desk motions; optional `motion` later)

## Fonts

- IBM Plex Sans
- IBM Plex Mono

## Persistence / browser APIs

- SavePort
- IndexedDB
- idb (Jake Archibald)
- File System Access API (optional Link Save Folder)
- FileSystemDirectoryHandle
- localStorage (rejected as primary)
- Dexie (rejected)
- idb-keyval (rejected)
- Zustand persist middleware (rejected as primary saver)

## Hosting / play / ship

- Cloudflare Pages
- Cloudflare Tunnel (optional off-LAN)
- ngrok (optional off-LAN)
- Vite `dev --host`
- Vite `preview --host`
- adb reverse (USB playtest)
- PWA (deferred)
- Capacitor (rejected v1)
- Electron (rejected)
- Next.js (rejected)

## Shared packages / layout names

- `@mobile-games/sim-kit`
- `@mobile-games/template`
- `@mobile-games/<slug>`
- packages/sim-kit
- games/_template
- games/<slug>
- PackModule

## Host kernel (locked)

- C+ (K4)
- Façade
- Phase pipeline
- Plan / apply RNG
- tickJournal (bounded ring)

## Kernel catalog (arsenal)

- K1 — Pure functional reducer
- K2 — Class / mutable engine
- K3 — Hybrid façade + reducer
- K4 — C+ Deterministic façade + phase pipeline
- K5 — Full event sourcing (+ snapshots)
- K6 — boardgame.io–style moves + flow
- K7 — ECS (bitECS-class)
- K8 — Calendar / priority-queue time
- K9 — XState / actor / hierarchical FSM
- K10 — Command queue + undo stack
- K11 — CQRS / projections
- K12 — Neutral multi-league sports kernel

## RNG

- sfc32
- splitmix-style seed mix
- mulberry32 (rejected as host default)
- Math.random (rejected for sim)
- LCG (rejected)
- Crypto RNG (rejected for sim)

## Desk / UI concepts

- DataView
- bottom sheet
- statusbar
- flash-on-change
- tabular-nums
- formatMoney
- formatNumber
- navChrome menu
- navChrome tabbar
- orientation portrait
- orientation landscape
- orientation system
- textDensity comfortable
- textDensity dense
- phone canvas
- Galaxy S26 Ultra

## Template desk tabs

- Roster
- Ticker
- Office
- Sim
- Advance (Sim control/sheet, not a tab)

## Birth / charter / research names

- Game Charter Protocol
- Research Protocol
- Game Birth
- selectEngines
- resolveGameSpec
- focusAxis
- realismTier
- CHARTER.md
- DESK.md
- RESEARCH.md
- ENGINE.md

## Narrative packs (arsenal)

- N1 — Branching dialogue (Ink / Yarn / JSON trees)
- N2 — Storylets (quality-based narrative)
- N3 — Story state + relationship-gated dialog
- N4 — Emergent narrative + story sifting
- N5 — LLM-assisted scenario / dialog generation
- N6 — Beat / world-directive engines
- Ink
- Yarn
- LlmProvider

## Social / AI packs (arsenal)

- S1 — Scalar affinity
- S2 — Bidirectional opinion matrix
- S3 — Social graph + logic database (Versu / Praxis lineage)
- S4 — Needs / utility AI + smart objects (Sims lineage)
- S5 — GOAP / HTN / behavior trees
- S6 — BDI cognitive agents
- S7 — Registry-driven behavioral physics
- GOAP
- HTN
- behavior trees
- BDI
- FSM
- ThinkInterval

## Sports / management / ops packs (arsenal)

- M1 — Phase pipeline seasons
- M2 — Nested match engine
- M3 — Finance / contract / negotiation engines
- M4 — Exact replay / hash governance
- MatchEngine
- MatchSlice

## Finance / markets patterns

- Ledger
- double-entry
- OrderBook
- order_book
- CLOB
- bigint money
- WAL / journal replay
- ALM
- IFRS 9–style credit stages
- instruments
- ratios
- regulator

## Crime / logistics / life patterns

- Heat
- heat
- dual_funds
- logistics_graph
- loyalty_opinion
- utility_needs
- relationships
- lod_cast
- opinion_matrix
- storylets
- story_sift
- dialog_trees

## Genetics patterns

- Genome
- genome_g0
- genome_g1
- genome_g2
- pedigree
- EBV / BLUP-style (approx)

## Business patterns

- bom_recipes
- inventory
- price_formation
- MarketClearing
- AI COO policies
- phases_season
- fog_knowledge
- development

## Birth pack IDs (registry starter)

- ledger
- match_slice
- order_book
- genome_g0
- genome_g1
- genome_g2
- story_sift
- lod_cast
- phases_season
- fog_knowledge
- dual_funds
- heat
- loyalty_opinion
- utility_needs
- relationships
- opinion_matrix
- dialog_trees
- bom_recipes
- inventory
- price_formation
- logistics_graph
- instruments
- ratios
- regulator
- development

## Compute tiers

- T0 Instant
- T1 Advance
- T2 Chunk
- T3 Worker
- T4 LLM

## Genetics depth tiers (arsenal)

- G0 Cosmetic Mendelian
- G1 Quantitative traits
- G2 Genomic
- G3 Hybrid / engineering
- G4 Population genetics

## Code / architecture types

- Monorepo
- Dual-build (multi-file + single-file)
- Hash routing
- Turn-based sim
- Pure TS sim core
- Façade commands
- Reducer / phase apply
- Save envelope (versioned JSON)
- Pack composition
- Single-writer SavePort path
- Client-only SPA

## Explicitly not v1 / rejected defaults

- Redux Toolkit
- ECS as host
- XState as host
- boardgame.io as host
- Full event sourcing as host
- Bun as package manager default
- pnpm 12 as day-one pin
- Safari file:// certification gate
- Cloud accounts / cloud saves (v1)
- Playwright (v1 scaffold)
- Workers (v1)

---

*Source: `DECISIONS.md`, `docs/SCAFFOLD_BRIEF.md`, `docs/ENGINE_ARSENAL.md`, `docs/GAME_BIRTH.md`. Docs-only until laptop scaffold.*
