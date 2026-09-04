# DESIGN — Bush League

What this game is supposed to be. Present tense, timeless. If the build drifts from this document, that's information — record the change in `DECISIONS.md` first, then update here. Never silently edit this to match what got built.

## The game in one line

Run a ballclub from a folding chair in indy ball to a big-league dynasty. Every dollar posts to real books; every prospect is a rumor until he proves it.

An OOTP-depth baseball management sim with desk-software finish, playable for decades of sim time, phone-first. *(Amended 2026-09-04, DECISIONS.md D78: was "built as one self-contained HTML file" — now a hosted PWA on GitHub Pages. The design intent this sentence protects — open it anywhere, forever, no install friction — is unchanged; only how that's delivered changed. See LAWS.md Law 1.)*

## The world

The real, complete MLB structure: 30 clubs, two leagues, six divisions, the 162-game schedule, the full playoff format. Beneath it, the complete affiliated minor-league ladder (AAA → A). Beside it, the independent leagues. Every club in the world exists, plays a schedule, keeps standings, and is run by an AI operator.

Players are 100% fictional, generated from real statistical distributions by level, with real-flavor name banks. Real MLB team identities are for personal use; a public release swaps identities to the fictional generator.

## Your seat

Owner-GM. The club's money is yours: budgets, ticket prices, staff hires, debt. And baseball ops is yours: rosters, trades, contracts, the draft, player development. Nobody hands you a budget — you answer to the ledger.

## The two starts

- **Bush League start** — owner of a broke independent-league club. Win, turn a profit, and buy your way up the ownership ladder to the Show.
- **Takeover start** — buy a big-league club: distressed seller, rebuild, or contender scenarios.

Both are available from the start screen from v1 on.

## The player model

Every player carries **hidden truth**: true ratings, a hidden development curve, injury proneness, makeup. What the owner sees is **20–80 scout grades with noise**, plus a reliability that sharpens with scouting looks and statistical sample size. This uncertainty is the soul of the game — true values are never displayed, anywhere, ever.

Position players: hit · power · eye · speed · defense · arm. Pitchers: stuff · movement · control · stamina · durability.

## The core loop

One advanced week: games resolve, gate and payroll settle through the ledger, prospects develop, injuries hit, trade offers land, scouting reports refine, the news feed fills. Between advances: lineups and rotation, roster moves, negotiations, scouting assignments, money decisions.

## The systems (the full franchise build)

Roster ops (26-man / 40-man, IL, options, waivers) · scouting (staff, coverage, accuracy) · amateur draft with generated classes · trades against AI GMs with personalities and real valuation logic · contracts with service time and arbitration · development and aging from published research · injuries at realistic rates · full double-entry finances (gate, concessions, media by market size, merch, revenue sharing; payroll, staff, travel, stadium ops; debt and covenants) · a living league where every AI club acts weekly · awards, records, and league history accumulating for decades · the ownership ladder (club valuations, buying and selling clubs).

## The engine progression

v1 resolves games straight to box scores. The underlying math is pitch-aware from day one, so watchable at-bat play-by-play arrives as its own later pass, and pitch-by-pitch arrives with career mode — with no rewrite and no statistical discontinuity in existing saves.

## Road to the Show (second headline mode)

Built only after the franchise game is complete: create a high-school kid, get scouted and drafted, live your at-bats pitch by pitch, grind the minors, play out a full career.

## Look & voice

The OOTP shell: black/serif, zero-radius, trait bars, dense tables. Phone-first — designed and verified at 360px. UI copy is front-office desk-speak, terse and all-business; flavor lives in names, the news feed, and event-log lines, never in chrome. Numbers in tabular figures with units, always; where a number needs explaining, a quiet sub-line cites something real.

## Boundaries

One file forever. No multiplayer. No frameworks. No real player names.
