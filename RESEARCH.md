# RESEARCH — Bush League

Every real-world figure the game uses gets an entry here: **value · source · date collected · tier**. The rule that makes the tiers work: **if a number you need isn't in this file, research it and add it with its source — never silently invent one.** An invented number is indistinguishable from a sourced one six weeks later, which quietly poisons every figure in the file. A number appearing here without a source is rot.

**Tiers:** T1 — exact against a real document (ship-blocking if wrong) · T2 — matches a real distribution within a stated tolerance · T3 — labelled estimate / design knob.

**Collection log:** 2026-08-27 — Pass 1 (UI/layout). Four parallel research agents. Scope was deliberately limited to what the LAYOUT pass needs: world structure (so world-gen builds the right shape), the exact column sets of the real documents our grids clone, and the 20–80 scale (so trait bars are honest). Economics beyond attendance, aging curves, and injury rates are NOT collected yet — they belong to their own passes.

---

# 1 · MLB STRUCTURE

## 1.1 Alignment — 2026 season · T1
Source: MLB Stats API `https://statsapi.mlb.com/api/v1/teams?sportId=1&season=2026`, cross-checked against `https://www.mlb.com/standings/`. Collected 2026-08-27.

**30 clubs · 2 leagues · 6 divisions · 5 clubs per division.** No franchise has relocated or changed division since 2013.

**AL East:** Baltimore Orioles · Boston Red Sox · New York Yankees · Tampa Bay Rays · Toronto Blue Jays
**AL Central:** Chicago White Sox · Cleveland Guardians · Detroit Tigers · Kansas City Royals · Minnesota Twins
**AL West:** Athletics · Houston Astros · Los Angeles Angels · Seattle Mariners · Texas Rangers
**NL East:** Atlanta Braves · Miami Marlins · New York Mets · Philadelphia Phillies · Washington Nationals
**NL Central:** Chicago Cubs · Cincinnati Reds · Milwaukee Brewers · Pittsburgh Pirates · St. Louis Cardinals
**NL West:** Arizona Diamondbacks · Colorado Rockies · Los Angeles Dodgers · San Diego Padres · San Francisco Giants

**Identity traps verified, do not assume:**
- **Athletics** — official club name is `Athletics` with **NO city prefix**. MLB API returns `name: "Athletics"`, `locationName: "Sacramento"`. Home park 2026 = **Sutter Health Park**, West Sacramento CA. T1.
- **Rays** — name unchanged, **back at Tropicana Field, St. Petersburg** for 2026 after the 2025 hurricane displacement to Steinbrenner Field. T1.
- **Renamed parks:** White Sox → **Rate Field** · Astros → **Daikin Park** · Dodgers → **UNIQLO Field at Dodger Stadium** (field-only naming deal, Mar 2026). T1.
- **City ≠ metro:** Braves play in Cumberland GA; Rangers in Arlington; Angels in Anaheim; Rays in St. Petersburg. Matters for market-size modelling.

## 1.2 Regular season — T1
Source: `https://www.mlb.com/press-release/press-release-mlb-announces-2026-regular-season-schedule` + Stats API schedule endpoint enumeration. Collected 2026-08-27.

| Item | Value | Tier |
|---|---|---|
| Games per club | **162** | T1 |
| vs division (4 opponents) | **52** — 13 games each | T1, verified NYY-BAL `totalGames: 13` |
| Same-league non-division (10 opponents) | **62** — 8 opponents x 6 + 2 opponents x 7 | T1, all ten NYY opponents enumerated |
| Interleague (15 opponents) | **48** — 6 vs natural rival (two 3-game sets, home + away) + 3 vs each of the other 14 | T1 |
| 2026 Opening Night / Day | Wed Mar 25 (1 game) / Thu Mar 26 (14 games) | T1 |
| 2026 final day | Sun Sep 27 | T1 |
| All-Star Game | Tue Jul 14, Citizens Bank Park | T1 |

**CORRECTION TO COMMON KNOWLEDGE:** the split is **52 / 62 / 48**, NOT the 52/64/46 of the 2023 launch. The natural-rival series grew 4 games → 6 starting **2025**. A schedule generator written from the 2023 press release is wrong by 2 games in two buckets.

## 1.3 Playoffs — T1
Source: `https://www.mlb.com/news/mlb-playoff-format-faq`. Collected 2026-08-27.

- **12 teams** — 6 per league: 3 division winners + 3 wild cards.
- **Seeds 1–3 = division winners by record; 4–6 = wild cards by record.** A wild card never outranks a division winner.
- **Seeds 1 and 2 get first-round byes.**
- **Wild Card Series** — best-of-3, matchups 3v6 and 4v5, **all games at the higher seed** (no travel).
- **Division Series** — best-of-5, 2-2-1, higher seed hosts G1/G2/G5. Seed 1 plays the 4/5 winner; seed 2 plays the 3/6 winner.
- **Championship Series** — best-of-7. **World Series** — best-of-7, 2-3-2, home field to the better regular-season record.
- **No reseeding.** Bracket fixed once seeds are set. Ties resolved mathematically, head-to-head primary. No Game 163 since 2022.

## 1.4 Roster rules — T1
Source: MLB glossary pages under `https://www.mlb.com/glossary/transactions/` and `/injuries/`. Collected 2026-08-27.

| Rule | Value |
|---|---|
| Active roster, Opening Day → Aug 31 | **26** (minimum 25 carried) |
| Active roster, Sep 1 → end of season | **28** (mandatory) |
| Pitcher limit, in-season | **13** |
| Pitcher limit, Sep 1 onward | **14** |
| Doubleheader | 27th man permitted, accrues 1 day service |
| 40-man roster | **40**; includes 7/10/15-day IL, bereavement, paternity |
| 60-day IL | Does **not** count against the 40 — the standard way to open a spot |
| Option years | **3**; a 4th if all 3 burned AND fewer than 5 full seasons |
| Option burn threshold | **20+ days** in the minors in a season; only one option year per season |
| Optional assignments per season | **5**, then outright waivers required |
| IL minimums | **7-day** concussion only · **10-day** position players · **15-day** pitchers & two-way · **60-day** all |
| IL backdating | Max **3 days** |
| Rule 5 | Dec, reverse standings order, **$100,000**; must stay on the 26-man all season, **cannot be optioned**; if given up → waivers, then offered back for **$50,000**. Triple-A phase still exists at **$24,000**; Double-A phase eliminated 2022 |
| Rule 5 eligibility | Signed at 18 or younger → after 5 seasons · 19 or older → after 4 |
| Minor-league domestic reserve list | **165 players** per organization (cut from 180 for 2024; DSL excluded). T2, Baseball America 2024-02-21 |
| MiLB active rosters | **28** at AAA and AA · **30** at Class A. T2 |

**CBA WARNING — design-critical.** The 2022–26 Basic Agreement expires **11:59pm ET Dec 1, 2026**. Roster sizes, pitcher limits, option counts, the 12-team bracket, the 6-pick lottery and the 20-round draft are ALL CBA artifacts. Per Law 3, every one of these belongs in `G` as data, not as a module constant.

## 1.5 Amateur draft — T1
Source: `https://www.mlb.com/glossary/transactions/rule-4-draft`, `https://www.mlb.com/news/mlb-draft-2026-bonus-pool-pick-values`, `https://www.mlb.com/news/mlb-draft-competitive-balance-rounds-set-for-2026`. Collected 2026-08-27.

- **20 rounds**, fixed by the 2022–26 CBA. 2026 draft had **613 total picks** (T2, CBS).
- **Lottery for the first 6 picks** among the 18 non-playoff clubs. Three worst records each get **16.5%** base odds. Revenue-sharing payees cannot receive a lottery pick 3 years running; payors cannot in back-to-back drafts. Lottery-ineligible clubs cannot pick higher than **10th**.
- **Competitive Balance Round A — 7 picks** (after 1st-round comp picks, before Rd 2). **Round B — 8 picks** (after Rd 2). CB picks are **the only tradeable MLB draft picks**.
- **2026 total bonus pool, all 30 clubs: $358,662,500.** No. 1 overall slot value **$11,350,600**. Largest club pool White Sox **$20,489,500**; smallest Dodgers **$3,951,900**. First 10 rounds are slotted.
- **Overage penalties:** 0–5% → 75% tax · 5–10% → 75% tax + 1st-rounder · 10–15% → 100% tax + 1st and 2nd · 15%+ → 100% tax + two 1st-rounders.
- **AI GM calibration, T1 quote:** *"In 14 Drafts with bonus pool rules, clubs have outspent their allotments a total of 260 times but never by more than 5 percent."* Model AI clubs as willing to pay the 75% tax, effectively never crossing 5%.

---

# 2 · THE LADDER BELOW AND BESIDE

## 2.1 Affiliated minors — T1
Source: MLB Stats API `sportId` 11/12/13/14, season 2026; cross-checked `https://www.mlb.com/milb/standings`. Collected 2026-08-27.

**120 affiliated clubs. Every MLB club has exactly 4 full-season affiliates — one each at AAA, AA, High-A, Single-A.** Fixed by the Professional Development License (10-year term, 2021–2030) and locked further by the first MiLB CBA (5 years from 2023).

| Level | Leagues | Clubs | Games |
|---|---|---|---|
| **Triple-A** | International (20), Pacific Coast (10) | 30 | **150** |
| **Double-A** | Eastern (12), Southern (8), Texas (10) | 30 | **138** (69/69) |
| **High-A** | Midwest (12), South Atlantic (12), Northwest (6) | 30 | **132** (66/66) |
| **Single-A** | California (8), Carolina (12), Florida State (10) | 30 | **132** (66/66) |

**Naming traps verified** (2021 placeholder names were retired after one season; "Low-A" was reclassified as **"Single-A"** in 2022):
- **Texas League is Double-A**, not High-A.
- **South Atlantic League is High-A**, not Single-A.
- **Carolina and California Leagues are Single-A** — both were historically High-A.
- **Northwest League has 6 clubs and NO divisions** — a real structural exception. MLB's playoff procedure gives it a single best-of-5 championship series with no division round.

**Division structure:** IL 2x10 · PCL 2x5 · EL 2x6 · SL 2x4 · TL 2x5 · MWL 2x6 · SAL 2x6 · NWL none · CAL 2x4 · CAR 2x6 · FSL 4 East / 6 West (asymmetric).

**Season windows 2026, T1** (Baseball America 2026-04-02): AAA Mar 27–Sep 20 · AA Apr 2/3–Sep 13 · High-A Apr 2–Sep 6 · Single-A opens Apr 2.

**Affiliated minimum salaries, T2** (MLB Trade Rumors 2023-04-03, first MiLB CBA): Complex **$19,800**/yr · Single-A **$26,200** · High-A **$27,300** · Double-A **$30,250** · Triple-A **$35,800**.

## 2.2 Complex / rookie ball — T1/T2
- **Arizona Complex League 15 clubs** (3 divisions of 5) · **Florida Complex League 15 clubs** (East 5 / North 4 / South 6). **15 + 15 = exactly one complex club per MLB org** — a clean rule to hard-code. T1 (Stats API sportId=16).
- Games **~56–60**; season **May 2 – Jul 23, 2026** (T1, Baseball America). MLB's own ACL/FCL "about" pages are STALE — prefer the API.
- **DSL: ~50 clubs, ~54 games. T3.** Sources genuinely disagree (API 49 / MLB.com 53 / Baseball-Reference 51). Wikipedia's "72 games" is stale. Use ~50 and label Tier 3.
- **Complex clubs are NOT part of the 120 PDL franchises.** They are owned and operated by the MLB org at its spring complex — no separate franchise, no gate, no independent owner. **Design consequence: there is nothing at the complex level for a player-owner to buy.** The purchasable ladder is indy → the 120 PDL clubs → MLB.

## 2.3 Independent leagues — T1
Source: `https://www.mlb.com/glossary/miscellaneous/partner-leagues` + each league's own 2026 schedule release. Collected 2026-08-27.

**Exactly four leagues hold MLB Partner League designation:**

| League | Clubs | Structure | Games | Season 2026 |
|---|---|---|---|---|
| **Atlantic League** | 10 | North 5 / South 5 | **126** | Apr 21 – Sep 13 |
| **American Association** | 12 | East 6 / West 6 | **100** | May 14 – Sep 7 |
| **Frontier League** | 18 | 2 conferences x 2 divisions | **102** (up from 96) | opens May 7 |
| **Pioneer League** | 12 | split season | **96** | May 19 – Sep 6 |

Partner status confers **no affiliation, no player supply, no MLB payroll funding, no roster control**. Clubs sign their own players and sell them to MLB orgs. The Atlantic League additionally serves as MLB's formal rules laboratory (pitch clock, ABS, shift restrictions were tested there first).

**Talent tiers are structurally enforced — model this directly:**
- **Atlantic League** — veteran league. T1, league about page: *"more than 40 percent of Atlantic League players have Major League service time"*; has sent *"nearly 1,500 players to MLB organizations."*
- **American Association** — veteran league. Rookie/LS-1…LS-5/Veteran classes; **max 6 Veterans (6+ yrs), min 5 Rookie-or-LS-1**; roster 20–25. T2 (Indy Ball Island, updated 2025-05-01).
- **Frontier League** — hard age-capped developmental. Roster **22 min / 25 max**. Five classes by age at Sep 30: Pro-1 (≤24), Pro-2 (25), Exp-1 (26), Exp-2 (27–29), Veteran (30+). **Min 10 Pro-1/Pro-2 · min 6 Exp-1 · max 8 Exp-2-or-Veteran, of which max 2 Veterans.** T1, frontierleague.com player-eligibility page.
- **Pioneer League** — hard capped: **no player with more than 3 years prior professional service; 25-man roster.** T1.

**Non-partner leagues worth modelling as the true bottom rung:**
- **Pecos League** — 16 clubs, Mountain/Pacific, ~70 games in 72 days. Not affiliated with MLB or MiLB. T2.
- **USPBL** — 4 clubs, **45 games, ALL games at one ballpark** (UWM Field, Utica MI). T2.
- **Canadian Baseball League** — 9 clubs, 48 games, turned fully pro for 2026.

## 2.4 Indy economics — THIN, HANDLE WITH CARE
**No current salary cap is published by any of the four Partner Leagues.** Stated plainly so nobody fills this in later.

| Figure | Value | Tier | Source |
|---|---|---|---|
| Frontier League team salary cap | **$85,000/season** | T2, **2020 vintage** | Spectrum News 1, 2022-08-12 |
| Frontier League per-player max | **$1,600/month** most players | T2, 2020 | same |
| Frontier League top earners | up to **$4,000/month** | T2 | same |
| Frontier League typical | **$1,000–$2,000/month** in season | T2 | same |
| American Association pay band | $800/mo rookie – $3,000/mo veteran, May–Sep only, no benefits | **T3 — undated fan site** | aabfan.com FAQ |
| American Association team cap | "$25–30,000" (period unstated) | **T3 — undated fan site** | same |
| Pecos League typical | **$100–$200/week**; commissioner: *"guys making $3,500 a month, and we got guys that are making nothing"* | T2 | FanSided 2025-06-03 |
| Canadian Baseball League cap | **CA$30,000 per team per month** | T2, **2026 — the only in-date published cap found** | Wikipedia 2026 CBL season |
| **Atlantic League — any salary figure** | — | **UNVERIFIED** | league publishes nothing; 2018 rules PDF robots-blocked |

**Recommended anchor for the Bush League start:** Frontier League **$85,000/season team cap, $1,600/month individual max**, inflated and **labelled Tier 3**. Player band $800–$3,000/month. Anything more precise is invention.

## 2.5 Attendance — 2025, the most recent completed season · T1
Source: MLB Stats API `/api/v1/attendance` aggregated by level; validated against Baseball America's published totals.

| Level | Avg/game | Home dates | Season total |
|---|---|---|---|
| **MLB** | **29,459** | 2,424 | **71,409,421** |
| **Triple-A** | **5,556** | 2,154 | ~11,968,600 |
| **Double-A** | **4,143** | 1,961 | ~8,123,500 |
| **High-A** | **3,333** | 1,891 | ~6,302,200 |
| **Single-A** | **2,106** | 1,886 | ~3,971,500 |
| **MiLB all 120** | **3,847** | — | **30,360,682** |

**Why this is T1 and not T2:** running the identical API method for MLB returns 29,460 avg / 71,410,526 total against Baseball America's published 29,459 / 71,409,421 — agreement to **1 fan per game**. The four per-level totals sum to 30,365,760 against BA's published MiLB total of 30,360,682 — a **0.017%** gap.

**Independent leagues — no 2024 or 2025 figure exists in published form.** Most recent is 2023 (T2, Ballpark Digest 2023-09-19). Label as 2023, never present as current:

| League (2023) | Total | Games | Avg/game |
|---|---|---|---|
| American Association | 1,549,917 | 581 | **2,668** |
| Atlantic League | 1,489,298 | 589 | **2,529** |
| Pioneer League | 968,734 | 431 | **2,248** |
| Frontier League | 1,635,067 | 762 | **2,146** |

**Trend, T2** (Baseball America): MiLB **32.148M (2023) → 31.345M (2024) → 30.365M (2025)**, with 2026 tracking lower again — 3,696/game through 2026-08-11, 84 of 120 clubs down year-over-year, 42 down 200+/game. A steady decline worth modelling rather than a flat attendance constant.

## 2.6 Minor-league parent affiliation — T1/T2, closes a long-standing open gap
Source: per-league Wikipedia membership tables (International, Pacific Coast, Eastern, Southern,
Texas, Midwest, South Atlantic, Northwest, California, Carolina, Florida State Leagues — fetched
individually, one per league), cross-checked against MiLB.com/MLB.com press releases for every
2024→2025 and 2025→2026 rename or relocation found, and cross-checked a second, independent way
against `world-data.ts`'s own pre-existing (and separately-sourced, §2.1) 120-city inventory.
Collected 2026-09-04, closing the gap `world-data.ts`'s own header flagged ("Parent-club affiliation
... not researched, therefore not asserted" — that comment's own `§5.14` cross-reference was stale;
this is the section it should have pointed to).

**Every MLB club has exactly one affiliate at each of AAA/AA/High-A/Single-A — 120 pairings, not
120 independent facts.** City/level/league placement (which is what matters for this project's own
`Club.parent` field — MiLB club NAMES are not separately modelled, `world.ts`'s `Club.name` is empty
for every MiLB club) is **T1**: every one of the 120 pairings below was corroborated two independent
ways (an outside per-league source AND agreement with this project's own already-separately-sourced
§2.1 city list). The exact franchise NICKNAMES quoted for colour (e.g. "Rocket City Trash Pandas")
came through a summarized fetch and were spot-checked, not each individually re-verified — label
those **T2**, they carry no weight in the sim (nothing here reads `Club.name` for a MiLB club).

**A real, dated boundary matters: the 2025 season and the "current" (2026, matching `world-data.ts`'s
own already-committed city list) mapping differ in exactly 5 of 120 slots**, all real relocations
independently dated to 2025-2026:

| Org / level | 2025 | Current (2026) | Source |
|---|---|---|---|
| Orioles High-A | Aberdeen | **Frederick** | MiLB.com 2025-08, WTOP 2025-08 — swap effective 2026, Aberdeen moves to the MLB Draft League |
| Brewers Single-A | Zebulon (Mudcats) | **Wilson** | MiLB.com — Wilson Warbirds debut April 2026 |
| Dodgers Single-A | Rancho Cucamonga | **Ontario** | MLB.com — new-build expansion club, 2026 debut |
| Angels Single-A | Inland Empire | **Rancho Cucamonga** | same 3-way California League 2026 realignment |
| Mariners Single-A | Modesto | **Inland Empire** (San Bernardino) | same realignment; Modesto's CA League franchise (since 1946) goes dark after 2025 |

**This project uses the CURRENT (2026) column** — the one that actually keys against `world-data.ts`'s
already-existing 120 city slots (Aberdeen/Zebulon/Modesto appear in none of them; Frederick/Wilson/
Ontario do). A strict-2025 map would leave those three real, already-generated clubs parentless while
producing three assignments pointing at clubs that don't exist in this world.

**The 30×4 mapping** (MLB abbr → AAA / AA / High-A / Single-A city, matching `world-data.ts`'s own
city strings exactly):

| MLB | AAA | AA | High-A | A |
|---|---|---|---|---|
| ARI | Reno | Amarillo | Hillsboro | Visalia |
| ATL | Gwinnett | Columbus (GA) | Rome | Augusta |
| BAL | Norfolk | Chesapeake | Frederick | Delmarva |
| BOS | Worcester | Portland | Greenville | Salem |
| CWS | Charlotte | Birmingham | Winston-Salem | Kannapolis |
| CIN | Louisville | Chattanooga | Dayton | Daytona |
| CLE | Columbus (OH) | Akron | Lake County | Lynchburg |
| COL | Albuquerque | Hartford | Spokane | Fresno |
| DET | Toledo | Erie | West Michigan | Lakeland |
| HOU | Sugar Land | Corpus Christi | Asheville | Fayetteville |
| KCR | Omaha | Northwest Arkansas | Quad Cities | Columbia |
| LAA | Salt Lake | Rocket City | Tri-City | Rancho Cucamonga |
| LAD | Oklahoma City | Tulsa | Great Lakes | Ontario |
| MIA | Jacksonville | Pensacola | Beloit | Jupiter |
| MIL | Nashville | Biloxi | Wisconsin | Wilson |
| MIN | St. Paul | Wichita | Cedar Rapids | Fort Myers |
| NYM | Syracuse | Binghamton | Brooklyn | St. Lucie |
| NYY | Scranton/W-B | Somerset | Hudson Valley | Tampa |
| ATH | Las Vegas | Midland | Lansing | Stockton |
| PHI | Lehigh Valley | Reading | Jersey Shore | Clearwater |
| PIT | Indianapolis | Altoona | Greensboro | Bradenton |
| SDP | El Paso | San Antonio | Fort Wayne | Lake Elsinore |
| SFG | Sacramento | Richmond | Eugene | San Jose |
| SEA | Tacoma | Arkansas | Everett | Inland Empire |
| STL | Memphis | Springfield | Peoria | Palm Beach |
| TBR | Durham | Montgomery | Bowling Green | Charleston |
| TEX | Round Rock | Frisco | Hub City | Hickory |
| TOR | Buffalo | New Hampshire | Vancouver | Dunedin |
| WSN | Rochester | Harrisburg | Wilmington | Fredericksburg |

**One city of 120 could NOT be matched and is left unassigned rather than guessed: "Hill City"**
(`world-data.ts`'s Single-A Carolina League list, one of its 12 entries). Real 2025/2026 Carolina
League membership is 12 clubs; 11 of them (Delmarva, Fayetteville, Fredericksburg, Salem, Wilson,
Augusta, Charleston, Columbia, Hickory, Kannapolis, Myrtle Beach) matched `world-data.ts`'s list
cleanly. The real 12th member is the Down East Wood Ducks (Kinston, NC) — "Down East" does not appear
anywhere in `world-data.ts`'s city list, and no source consulted this pass explains "Hill City" as a
real market anywhere in professional baseball. The most likely explanation is a pre-existing data
question in `world-data.ts`'s own Carolina League entry (possibly "Down East" miscopied), predating
this pass and outside its scope to fix — flagged here for whoever picks it up, not silently corrected
or silently assigned a guessed parent.

---

# 3 · THE DOCUMENTS THE GRIDS CLONE

This section exists because Law 5 says every tabular surface runs through one grid engine. These are the real column sets that engine must be able to express. Verified by fetching the actual pages 2026-08-27.

## 3.1 Standings

**MLB.com** (`https://www.mlb.com/standings`) · T1
```
W · L · PCT · GB · WCGB · L10 · STRK · RS · RA · DIFF · X-W/L · HOME · AWAY · >=.500 · Next Game
```
Team name is the row label, not a headed column. Tabs on the page: Regular Season / Wild Card / Spring Training. **No E# column present on 2026-08-27.** MLB.com labels run differential `DIFF` and expected record `X-W/L`.

**Baseball-Reference** (`/leagues/AL/2026-standings.shtml`) · T1
Completed season: `Tm · W · L · W-L% · GB`
In-season: `Tm · W · L · W-L% · GB · E#`

Deliberately minimal — five columns, six in-season. BR says `W-L%` where MLB.com says `PCT`. BR shows `E#` in-season; MLB.com did not.

> **UNVERIFIED:** BR's "Detailed Standings" tables (SRS, pythWL, Luck, vRHP/vLHP, 1Run) — headings render, tables are comment-wrapped and did not load across five fetches. Not reported from memory.

## 3.2 Team batting — Baseball-Reference team page · T1
`https://www.baseball-reference.com/teams/NYY/2025.shtml` (cross-checked LAD, identical)
```
Rk · Player · Age · Pos · WAR · G · PA · AB · R · H · 2B · 3B · HR · RBI · SB · CS · BB · SO ·
BA · OBP · SLG · OPS · OPS+ · rOBA · Rbat+ · TB · GIDP · HBP · SH · SF · IBB · Pos · Awards
```
**`Pos` appears twice and this is correct** — col 4 = primary position (`C`, `1B`); second-to-last = positions-played string (`*2/HD`, `*3H/D8`).

Verified row: `1, Austin Wells, 25, C, 0.1, 126, 448, 401, 51, 88, 22, 1, 21, 71, 5, 1, 30, 118, .219, .275, .436, .712, 93, .305, 91, 175, 10, 5, 0, 11, 0, *2/HD,`

**League-level team batting** (one row per club, `/leagues/majors/2025.shtml`) · T1
```
Tm · #Bat · BatAge · R/G · G · PA · AB · R · H · 2B · 3B · HR · RBI · SB · CS · BB · SO ·
BA · OBP · SLG · OPS · OPS+ · TB · GDP · HBP · SH · SF · IBB · LOB
```
Note **`GDP` here vs `GIDP` on the team page** — a real inconsistency in the source documents. Verified row: `Toronto Blue Jays, 58, 28.1, 4.93, 162, 6180, 5507, 798, 1461, 294, 13, 191, 771, 77, 25, 520, 1099, .265, .333, .427, .761, 108, 2354, 133, 65, 35, 45, 25, 1121`

## 3.3 Team pitching — Baseball-Reference team page · T1
```
Rk · Player · Age · Pos · WAR · W · L · W-L% · ERA · G · GS · GF · CG · SHO · SV · IP ·
H · R · ER · HR · BB · IBB · SO · HBP · BK · WP · BF · ERA+ · FIP · WHIP ·
H9 · HR9 · BB9 · SO9 · SO/BB · Awards
```

## 3.4 Player season tables — Baseball-Reference · T1
**Standard Batting** (`/players/j/judgeaa01.shtml`)
```
Season · Age · Team · Lg · WAR · G · PA · AB · R · H · 2B · 3B · HR · RBI · SB · CS · BB · SO ·
BA · OBP · SLG · OPS · OPS+ · rOBA · Rbat+ · TB · GIDP · HBP · SH · SF · IBB · Pos · Awards
```
Verified row: `2022, 30, NYY, AL, 10.8, 157, 696, 570, 133, 177, 28, 0, 62, 131, 16, 3, 111, 175, .311, .425, .686, 1.111, 210, .463, 208, 391, 14, 6, 0, 5, 19, *89D/H, AS,MVP-1,SS`

**Standard Pitching** (`/players/s/skubata01.shtml`)
```
Season · Age · Team · Lg · WAR · W · L · W-L% · ERA · G · GS · GF · CG · SHO · SV · IP ·
H · R · ER · HR · BB · IBB · SO · HBP · BK · WP · BF · ERA+ · FIP · WHIP ·
H9 · HR9 · BB9 · SO9 · SO/BB · Awards
```
Verified row: `2024, 27, DET, AL, 6.7, 18, 4, .818, 2.39, 31, 31, 0, 0, 0, 0, 192.0, 142, 54, 51, 15, 35, 0, 228, 9, 0, 2, 753, 174, 2.49, 0.922, 6.7, 0.7, 1.6, 10.7, 6.51, AS,CYA-1,MVP-7`

**KEY STRUCTURAL FINDING FOR THE GRID ENGINE:** player and team tables are the **same column set from column 5 onward**. The team table swaps the leading `Season · Age · Team · Lg` for `Rk · Player · Age · Pos`. **One shared column schema serves both** — exactly what Law 5 wants. Player pitching has no `Pos` column; player batting does.

## 3.5 FanGraphs leaderboard — Dashboard preset · T1 (headers)
**Batters:** `# · Name · Team · G · PA · HR · R · RBI · SB · BB% · K% · ISO · BABIP · AVG · OBP · SLG · wOBA · xwOBA · wRC+ · BsR · Off · Def · WAR`
**Pitchers:** `# · Name · Team · W · L · SV · G · GS · IP · K/9 · BB/9 · HR/9 · BABIP · LOB% · GB% · HR/FB · vFA (pi) · ERA · xERA · FIP · xFIP · WAR`

Caveat: FanGraphs renders table bodies client-side; headers were read off the page and confirmed identical across two independently parameterized fetches each, but no data row was observable. FanGraphs number formatting is therefore **UNVERIFIED**.

## 3.6 MLB.com team roster · T1
`https://www.mlb.com/yankees/roster/40-man`, `https://www.mlb.com/dodgers/roster`

The header row has **five cells and the first is NOT "Player"** — it is the position-group name, and the roster is **split into four separate tables by position group** rather than one table with a position column:
```
Pitchers | B/T | Ht | Wt | DOB
Catchers | B/T | Ht | Wt | DOB
Infielders | B/T | Ht | Wt | DOB
Outfielders | B/T | Ht | Wt | DOB
```
**There is no separate jersey-number column** — the number rides inside the first cell with the headshot, name, and (on the 40-man page) roster status. Verified rows: `Brendan Beck [89, Minors] · R/R · 6' 2" · 218 · 10/06/1998` and `Jack Dreyer [86] · R/L · 6' 2" · 205 · 02/27/1999`.

Formats: **B/T** = `R/R` `R/L` `L/L` `S/R` · **Ht** = `6' 2"` · **Wt** = bare integer lbs · **DOB** = `MM/DD/YYYY` zero-padded.

## 3.7 Display formatting — T1, THE SHIP-BLOCKING TABLE
Read off live pages 2026-08-27. Getting any of these wrong makes the whole game read as fake.

| Stat | Decimals | Leading zero | Verified examples |
|---|---|---|---|
| BA / AVG | 3 | **No** | `.311` `.219` `.274` |
| OBP | 3 | **No** | `.425` `.275` `.358` |
| SLG | 3 | **No** | `.686` `.436` `.524` |
| OPS | 3 | **No** below 1.000 | `.712` `.882`; `1.111` above |
| W-L% | 3 | **No** | `.818` |
| rOBA | 3 | **No** | `.463` `.305` |
| ERA | 2 | **Yes** | `2.39` `1.68` |
| FIP | 2 | **Yes** | `2.49` |
| WHIP | **source-dependent** | Yes | BR `0.922` (3dp); MLB.com `0.76` (2dp) |
| IP | 1, **thirds notation** | Yes | `192.0` `144.1` — `.1` = 1/3, `.2` = 2/3 |
| WAR | 1 | Yes | `0.1` `6.7` `10.8` |
| H9 / HR9 / BB9 / SO9 | 1 | Yes | `6.7` `0.7` `10.7` |
| SO/BB | 2 | Yes | `6.51` |
| OPS+ / ERA+ / Rbat+ / wRC+ | 0 integer | n/a | `93` `210` `174` |
| R/G | 2 | Yes | `4.93` |
| BatAge | 1 | Yes | `28.1` |

**The governing rule, derived and verified:** stats conceptually bounded at 1.000 and read as three-digit "batting-average style" numbers — BA, OBP, SLG, OPS, W-L%, rOBA — **drop the leading zero**. Anything read as a rate or ratio that can naturally exceed 1 — ERA, FIP, WHIP, WAR, per-nine, SO/BB — **keeps it**. OPS is the edge case: no leading zero below 1.000, prints the `1` when it crosses.

> Minor gap: no sub-1.00 ERA was observed on any fetched page, so `0.96`-style ERA formatting is inferred from the WHIP/WAR family rather than directly verified.

## 3.8 Box score · T1 where marked
**Line score** (Baseball-Reference `/boxes/NYA/NYA202409010.shtml`) · T1
Columns exactly: `1 2 3 4 5 6 7 8 9 | R H E`. Two rows, **visitor on top, home below**. Inning count is dynamic (extras extend it; home team not batting in the 9th gets `X` — that rendering detail UNVERIFIED).

**Batting table — ESPN** (`site.api.espn.com/.../summary?event=401570528`) · T1, literal displayed header row:
```
H-AB · AB · R · H · RBI · HR · BB · K · #P · AVG · OBP · SLG
```
**Baseball Almanac traditional/print layout** · T1: `ab · r · h · rbi` only.

**Pitching table — Baseball Almanac** · T1: `IP · H · R · ER · BB · SO`.

> **UNVERIFIED — OPEN GAP:** Baseball-Reference's own box-score batting and pitching column order. BR wraps every table except the line score in HTML comments and un-hides them client-side. Direct fetch, the `widgets.sports-reference.com` endpoint, archive.org and every proxy tried are robots-blocked or 403 from this environment. **To close: one JS-enabled browser fetch of the box-score page.** Do this when the box-score screen is built — do not fill it in from memory.

**Batting order encoding — MLB statsapi** · T1: `battingOrder` is a 3-digit string. `"700"` = 7th in the order, starter; `"200"` = 2nd, starter; a substitute at the same slot gets `"701"`, `"702"`. **Model as slot x 100 + substitution index** — this is the clean encoding for the sim.

**Below-the-tables notes — MLB statsapi boxscore, gamePk 745701** · T1, in the exact order returned.
Per-team, three titled blocks: **BATTING** → **BASERUNNING** → **FIELDING**.
- BATTING fields in order: `2B` · `HR` · `TB` · `RBI` · `2-out RBI` · `Runners left in scoring position, 2 out` · `SF` · `GIDP` · `Team RISP` · `Team LOB`
- BASERUNNING: `SB` · `CS` · `PO`
- FIELDING: `E` · `Pickoffs` · `DP`

Value formats worth copying verbatim:
- `2B`: "Donovan (29, Cortes); Goldschmidt 2 (25, Cortes, Bickford)" — season total, then pitcher(s).
- `HR`: "Baker (2, 4th inning off Cortes, 1 on, 2 out)" — season total, inning, pitcher, men on, outs.
- `SB`: "Walker, J (1, 2nd base off Marinaccio/Wells, A)" — note the **pitcher/catcher pair**.
- `E`: "Mikolas (1, throw); Goldschmidt (5, missed catch)" — season error count + error type.
- `DP`: "2 (Herrera-Donovan; Donovan-Winn-Goldschmidt)" — count, then hyphenated fielder chains. A single DP renders without the leading count.
- `Team RISP`: "8-for-18." · `Team LOB`: "7."

Game-level `info` array, exact returned order · T1:
`IBB` · `Pitches-strikes` · `Groundouts-flyouts` · `Batters faced` · `Inherited runners-scored` · `Umpires` · `Weather` · `Wind` · `First pitch` · `T` · `Att` · `Venue`
Examples: Weather "78 degrees, Cloudy." · Wind "8 mph, In From RF." · T "3:21" · Att "42,768" · Umpires "HP: Adam Beck. 1B: Dan Iassogna. 2B: CB Bucknor. 3B: Ben May."

> Slot positions for `3B`, `SAC`/`SH`, `HBP`, team-level `IBB` are UNVERIFIED — they did not occur in the reference game.

**Decisions line** · T1, Baseball-Reference verbatim: `WP: JoJo Romero (6-2) • LP: Jake Cousins (1-1)`
**Correction to common assumption: only the W-L record is in parentheses, no ERA.** ERA lives in the pitching table's own column. Separator is a literal `•`. `HLD` did not appear on either fetched page — UNVERIFIED whether BR surfaces holds.

**BR game-info footer** · T1 verbatim labels: `Attendance: 42,768` · `Venue: Yankee Stadium III` · `Game Duration: 3:21` · `Start Time: 1:35 p.m. Local` + a "Day Game, on grass" descriptor. Note BR disambiguates ballpark generations ("Yankee Stadium III") where MLB says "Yankee Stadium".

---

# 4 · THE 20–80 SCALE

## 4.1 What the scale is · T1
Sources: FanGraphs, McDaniel, *"Scouting Explained: The 20-80 Scouting Scale"*, 2014-09-04 · FanGraphs, Longenhagen & McDaniel, *"The New FanGraphs Scouting Primer"*, 2018-11-13 · Baseball America, Glaser, 2025-09-23 · MLB.com glossary.

Invented by Branch Rickey. **50 is major-league average; each 10-point increment is one standard deviation.** The 20–80 span is +/-3 SD, ~99.7% of the population. 45 and 55 give granularity around average; 65 and 35 are used sparingly.

T1 direct quote (FanGraphs 2014): *"75 is almost never used because scouts will yell at you to make a choice and many don't use 65."*

| Grade | FanGraphs 2014 | Baseball America 2025 |
|---|---|---|
| 80 | top of scale | "Top of the scale" |
| 70 | Plus Plus | Plus-Plus |
| 60 | Plus | Plus |
| 55 | Above Avg | Above-average |
| 50 | Avg | Major league average |
| 45 | Below Avg (also "fringe-average" ~47.5) | Fringe-average |
| 40 | — | Below-average |
| 30 | — | Well below-average but playable |
| 20 | — | "As bad as it gets for a big leaguer" |

Working half-steps scouts actually speak: **"solid average" ~52.5**, **"fringe-average / fringy" ~47.5**. Some clubs use a 2–8 scale, equivalent without half-grades.

## 4.2 Grade → real units — TWO TABLES, ELEVEN YEARS APART

**USE THE 2025 COLUMN. This is the single most important calibration finding of the pass.**

**Baseball America 2025 (Glaser, 2025-09-23) · T1 — CURRENT**

| Grade | FB velo (**starters**) | Batting avg | Home runs | RHH home-to-1B | LHH home-to-1B | C pop time to 2B |
|---|---|---|---|---|---|---|
| 80 | 98+ | .315+ | 40+ | 4.00 | 3.90 | <1.90 |
| 70 | 97 | .295–.314 | 34–39 | 4.10 | 4.00 | 1.90–1.94 |
| 65 | 96 | — | — | 4.15 | 4.05 | — |
| 60 | 95 | .275–.294 | 28–33 | 4.20 | 4.10 | 1.95–1.99 |
| 55 | 94 | .265–.274 | 23–27 | 4.25 | 4.15 | — |
| 50 | 93 | .255–.264 | 19–22 | 4.30 | 4.20 | 2.00–2.04 |
| 45 | 92 | .245–.254 | 14–18 | 4.35 | 4.25 | — |
| 40 | 90–91 | .235–.244 | 10–13 | 4.40 | 4.30 | 2.05–2.09 |
| 30 | 88–89 | .215–.234 | 5–9 | 4.50 | 4.40 | 2.10–2.14 |
| 20 | 87 or less | <.215 | 0–4 | 4.60 | 4.50 | >2.15 |

BA verbatim: **"add 1-2 mph for relievers"** — the velocity table is calibrated to starters.

**FanGraphs 2014 (McDaniel) · T1 — HISTORICAL, kept to show the drift**
80: 97mph/.320/40+ · 70: 95/.300/30-35 · 60: 93/.280/23-27 · **50: 90-91/.260/15-18** · 40: 88/.240/8-12 · 30: 86/.220/3-5. 60-yd dash: 50 = 6.9–7.0s.

**What changed in eleven years:**
- **Velocity inflated a full grade.** 2014's 50 (90–91) is 2025's **40**. 2014's 80 (97) is 2025's **70**.
- **Power inflated about half a grade.** 2014 50 = 15–18 HR; 2025 50 = 19–22 (2014's 55).
- **Hit tool essentially stable.** 50 ~ .260 both times.
- **Speed completely stable.** Home-to-first 50 = 4.30 RHH / 4.20 LHH in both sources eleven years apart, and again in an independent dated pro-scouting 2–8 chart. **Three sources, identical numbers — the most reliable tool mapping available.**

**UNVERIFIED, do not invent:**
- **Raw power vs game power in units.** The HR tables above are GAME power. No fetched primary publishes a separate raw-power table. A FanGraphs Community piece maps grades to max exit velocity but publishes the tables as images.
- **Outfield/infield arm strength in mph by grade.** No authoritative published table found. Catcher pop time (above) is the only T1 arm number.
- **FIELD → units.** Does not exist in published form; it is definitionally a judgment grade. FanGraphs 2014 T1: *"fielding range, hands, instincts and all the components of defense are folded into the fielding grade."* If units are needed, back them out of a defensive-runs distribution and label **Tier 3**.
- **CONTROL / COMMAND → BB/9 or zone%.** No published mapping exists.

## 4.3 Future Value → role · T1
FanGraphs 2018 primer: *"Future Value is a grade on the 20-80 scale that maps to anticipated annual WAR production during the player's first six years of service."* **Average annual WAR over the first six service years — not peak.**

| FV | Hitter role | WAR/yr | Pitcher role | WAR/yr |
|---|---|---|---|---|
| 20 | Org guy | — | Org guy | — |
| 30 | Up & Down | < -0.1 | Up & Down | < -0.1 |
| 40 | Bench player | 0.0–0.7 | Backend SP, FIP ~5.00 | 0.0–0.9 |
| 45 | Low-end regular / platoon | 0.8–1.5 | #4/5 SP, FIP ~4.20 | 1.0–1.7 |
| 50 | Avg everyday player | 1.6–2.4 | #4 SP, FIP ~4.00 | 1.8–2.5 |
| 55 | Above-avg regular | 2.5–3.3 | #3/4 SP, FIP ~3.70, ~160 IP | 2.6–3.4 |
| 60 | All-Star | 3.4–4.9 | #3 SP, FIP 3.30, ~200 IP | 3.5–4.9 |
| 70 | Top 10 overall | 5.0–7.0 | #2 SP, FIP <3.00, ~200 IP | 5.0–7.0 |
| 80 | Top 5 overall | >7.0 | #1 / top 1-3 arms | >7.0 |

For relievers, 45 FV corresponds to a dominant bullpen piece. **FV is explicitly NOT an average of the tool grades** — T1: it represents *"how valuable this player is on the overall player market, taking into account risk, distance to ceiling and other factors."* That is a modelling instruction: FV is a separate, risk-adjusted number.

**"+" grades · T1** (FanGraphs, Clemens, 2026-07-02): the current ladder on THE BOARD is `35+ · 40 · 40+ · 45 · 45+ · 50 · 55 · 60 · 65 · 70`. A "+" denotes *"a player at the upper end of that grade threshold."*

**FV → surplus value and star odds · T1** (same source; expected WAR here is **cumulative over six controlled years** — do not mix with the annual table above):

| FV | Hitter surplus | Pitcher surplus | Expected WAR (6yr) | Star odds |
|---|---|---|---|---|
| 70 | $195M | $195M | 27–27.5 | 87.5% |
| 65 | $95M | $95M | 13.5 | 40% |
| 60 | $82M | $70M | 11–12.5 | 21–33% |
| 55 | $55M | $45M | 7–8 | 7–17.5% |
| 50 | $45M | $33.5M | 5–7 | 7–13.5% |
| 45+ | $18.5M | $15M | 2.6–3.2 | 3–6% |
| 45 | $14.5M | $9.5M | 1.6–2.5 | 1.5–3.5% |
| 40+ | $8M | $7M | 1.0–1.2 | 1–1.8% |
| 40 | $5.5M | $4M | 0.55–0.75 | 0.4–0.8% |
| 35+ | $2M | $1.5M | 0.25–0.3 | 0.4% |

## 4.4 Bust rates — THE HIDDEN-TRUTH CALIBRATION · T1
FanGraphs, Clemens, *"How Do Prospect Grades Translate to Future Outcomes?"*, 2025-02-10. Prospect lists 2019–2022 vs three-year-forward outcomes. Buckets: <0.5 WAR washout · 0.5–1.5 backup · 1.5–2.5 regular · 2.5–4 above avg · 4+ star.

**Hitters**

| FV | Washed out | Backup | Regular | Above avg | Star | n |
|---|---|---|---|---|---|---|
| 45 | **51%** | 25% | 17% | 6% | 1% | 295 |
| 50 | **23%** | 24% | 30% | 21% | 2% | 197 |
| 55 | **17%** | 17% | 30% | 31% | 6% | 54 |
| 60 | **14%** | 12% | 19% | 38% | 17% | 42 |

**Pitchers**

| FV | Washed out | Backup | Regular | Above avg | Star | n |
|---|---|---|---|---|---|---|
| 45 | **53%** | 26% | 16% | 5% | 0% | 230 |
| 50 | **27%** | 27% | 24% | 20% | 2% | 96 |
| 55 | **17%** | 20% | 37% | 27% | 0% | 30 |
| 60 | **17%** | 33% | 25% | 25% | 0% | 12 |

T1 finding: *"pitching prospects just turn into major league pitchers in a less predictable way"* than hitters. **This is the real bust-rate table Law 10 needs** — a 50 FV hitter busts 23% of the time, a 45 FV hitter 51%. Small samples at 55/60, especially pitchers (n=12 at 60) — widen those bands rather than treating them as precise.

## 4.5 Present / future notation · T1, single-sourced
FanGraphs 2014: scouts write paired grades **"20/50"** — present first, future second, slash-separated. T1 quote: *"Present grades often are 20's for high school players while, in the upper levels of the minors, the gap between present and future grades is very small."*

**Directly usable design rule:** the present/future spread is a function of level and age, collapsing toward zero at AAA, and present grades floor near 20 for teenagers rather than at future-minus-a-constant. Neither the 2018 FanGraphs primer nor BA 2025 discusses the notation — treat as T1 but single-sourced.

---

# 7 · LEAGUE ENVIRONMENT BY LEVEL — 2025 · T1

**Collected 2026-08-27.** This closes the largest outstanding gap in the file. Sources: Baseball-Reference league year-by-year pages for MLB (`/leagues/majors/bat.shtml`, `/pitch.shtml`, `/leagues/AL/…`, `/leagues/NL/…`); the four affiliated levels aggregated from **MLB Stats API team totals** (`statsapi.mlb.com/api/v1/teams/stats?season=2025&sportIds=11|12|13|14`).

**Why this is T1 and not T2.** Every affiliated level passed a **closed-league identity check** across two independent endpoints: league batting runs = league pitching runs, batting H = pitching H, and HR, SO, BB and PA/BF all reconcile — **all differences exactly zero**. Double-A was checked against a third endpoint (standings): 17,625 runs scored, matching the computed total exactly. A single transcription error in 60 team rows would break the identity. The MLB row comes from the year-by-year pages rather than the 2025 season page, because that page's pitching table is comment-hidden and the one extraction obtained from it was internally inconsistent (ERA 4.15 against ER/IP implying 4.36) — it was discarded.

## 7.1 The cross-level table

| Level | AVG | OBP | SLG | OPS | R/G | R/9IP | HR/600PA | BB% | K% | HBP% | BABIP | ERA | WHIP | H/9 | BB/9 | SO/9 | HR/9 | unearned | Games |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **MLB** | .245 | .315 | .404 | .719 | 4.45 | 4.52 | 18.53 | 8.41 | 22.22 | 1.05 | .291 | 4.15 | 1.289 | 8.4 | 3.2 | 8.5 | 1.2 | 8.1% | 2430 |
| **Triple-A** | .258 | .347 | .421 | .768 | 5.24 | 5.44 | 17.22 | 10.93 | 22.63 | 1.31 | .314 | 4.92 | 1.475 | 8.91 | 4.36 | 9.03 | 1.15 | 9.6% | 2232 |
| **Double-A** | .235 | .323 | .360 | .683 | 4.29 | 4.45 | 12.04 | 10.34 | 23.47 | 1.36 | .296 | 3.92 | 1.321 | 7.90 | 3.99 | 9.05 | 0.77 | 11.9% | 2056 |
| **High-A** | .233 | .330 | .358 | .688 | 4.51 | 4.67 | 11.37 | 11.03 | 23.67 | 1.76 | .296 | 4.08 | 1.345 | 7.81 | 4.30 | 9.22 | 0.74 | 12.6% | 1958 |
| **Single-A** | .237 | .340 | .345 | .685 | 4.82 | 4.98 | 8.50 | 11.87 | 23.50 | 1.88 | .307 | 4.23 | 1.407 | 7.96 | 4.70 | 9.30 | 0.56 | 15.2% | 1948 |
| **Mexican (LMB)** | .295 | .378 | .465 | .844 | 6.19 | 6.41 | 18.25 | 10.71 | 17.62 | 1.37 | .337 | 5.82 | 1.661 | 10.52 | 4.43 | 7.29 | 1.26 | 9.1% | 915 |

**THE FINDING THAT CHANGES THE ENGINE: the run environment is NOT monotonic by level.**

Triple-A is the most offensive league in affiliated ball — 49 points of OPS above MLB and +0.79 R/G. **Double-A is the lowest-scoring level in professional baseball, below MLB.** Scoring then climbs again through High-A and Single-A, but on a completely different mechanism: Single-A has the *lowest* slugging (.345) and less than half MLB's home-run rate, yet the second-highest on-base percentage — it scores on traffic. Highest walk rate (11.87%), highest hit-by-pitch rate (1.88%), and **15.2% of its runs unearned**.

The unearned-run share is a clean monotonic **defence** gradient and the only figure in the table that behaves the way intuition expects: 8.1% → 9.6% → 11.9% → 12.6% → 15.2%.

Generating "worse players at every rung down the ladder" would have been wrong in a way no amount of playtesting would surface.

**MiLB doubleheaders are seven innings**, so IP per team-game is 8.66–8.70 at every affiliated level against 8.86 in MLB. **R/9IP is the cleaner rate to calibrate against than R/G.**

## 7.2 AL / NL split, 2025 · T1
Sources: `baseball-reference.com/leagues/AL/bat.shtml`, `/AL/pitch.shtml`, `/NL/…`

| | AVG | OBP | SLG | OPS | R/G | BB% | K% | HR/600 | ERA | WHIP | BABIP |
|---|---|---|---|---|---|---|---|---|---|---|---|
| AL | .244 | .313 | .406 | .719 | 4.42 | 8.28 | 22.55 | 19.33 | 4.09 | 1.282 | .288 |
| NL | .247 | .317 | .402 | .719 | 4.47 | 8.54 | 21.90 | 17.66 | 4.22 | 1.296 | .293 |

Identical OPS by different routes — the AL is the power league, the NL the contact/on-base league.

**MLB 2024 for trend · T1:** .243/.312/.399, .711 OPS, 4.39 R/G, 4.07 ERA, 1.270 WHIP. Offense ticked up slightly in 2025.

## 7.3 Independent leagues — UNVERIFIED, and deliberately left so

**No independent league publishes rate statistics, and none is reachable from a primary source.** What was tried:

- **MLB Stats API** carries all four Partner Leagues under `sportId=23` with full team lists, but `teams/stats` returns no stat splits and `standings` returns an empty records array. MLB carries their rosters and schedules, not their statistics.
- **Baseball-Reference register** 2025 pages load, but team batting/pitching tables are comment-wrapped and absent from the fetched HTML. The standings tables ARE present but carry only W/L/PCT/GB — no R or RA, so runs cannot even be backed out.
- **Pointstreak** (the official stats platform for the Atlantic League and American Association) and **pioneerleague.com**: HTTP 403.

**How the build handles it, and this is Tier 3 reasoning over Tier 1 numbers:** each indy league BORROWS the published environment of the affiliated level its roster rules make it resemble, and the game's provenance sheet says which and why.

| League | Borrows | Reasoning (all T1 roster facts from §2.3) |
|---|---|---|
| Atlantic League | Triple-A | 40%+ of its players have major-league service time |
| American Association | Double-A | Veteran league, max six 6-year men per roster |
| Frontier League | High-A | Hard age cap: min ten players 25-or-under, max two 30+ |
| Pioneer League | Single-A | No player with more than 3 years professional service |

Closing this properly needs a browser session against Pointstreak (ALPB leagueid=174) or summing Baseball-Reference register team pages one at a time — roughly 20–40 fetches per league.

## 7.4 Park factors — the bigger lever · T1/T2
Baseball America, *"Minor League Park Factors & Left/Right wOBA Splits For 2025"*, 2026-01-30 (partially paywalled). Park factors run from **66 (Toledo, home runs) to 206 (Amarillo, home runs)**; most parks 80–120; Amarillo at 153 runs / 206 HR. Methodology: home vs away, team batting plus pitching, 100 = average.

**For the generator, park factor is a bigger lever than level.** Independently corroborated by the 2025 aggregation: Amarillo led Double-A in both runs (721) and home runs (163), and within a single level Reno allowed a 6.29 ERA against Jacksonville's 3.73.

Run environments have always varied as much within a level as between them — The Hardball Times, *"Minor league run environments"* (2010-02-23, covering 2007–09, T2 and out of date) found PCL 5.1 R/G vs International 4.4 at the same level, and California 5.3 vs Florida State 4.2 at another.

## 7.5 Rule and equipment effects · T1

- **ABS vs the challenge system, Triple-A** (Baseball America 2024-06-19, same-league same-season comparison): full ABS is worth roughly **+1.5 points of walk rate and +0.45 ERA** against the challenge system. 2023 ABS BB% 12.30 / ERA 5.18 vs challenge 10.45 / 4.73; 2024 ABS 11.78 / 5.21 vs challenge 11.01 / 4.86.
- **Triple-A ran challenge-only ABS for the whole of 2025** (MLB.com 2026-02-26) — ~861,000 pitches, 9,432 challenges, ~50% overturn. So the Triple-A row above is a *challenge-system* environment, not full ABS.
- **The pre-tacked "enhanced grip" ball, Double-A Southern League** (Baseball America), April 2023 vs April 2022: **BB/9 4.06 → 4.70 (+16%), K/9 10.45 → 11.52 (+10%), WP/9 0.80 → 0.98 (+23%), AVG .240 → .229.** Fastball carry up 2+ inches. The cleanest published natural experiment on the ball.
- **MiLB walk rates hit a 60-year high in 2023** — all four full-season levels above 11%, Triple-A at 12% (Baseball America 2023-10-02). The 2025 Triple-A figure of 10.93% computed above fits the expected decline after the move to challenge-only ABS, which is a useful external check on the aggregation.
- **2026 MiLB rule changes** (Baseball America 2026-03-17): checked-swing challenges in the Triple-A PCL and Florida State League, disengagement cut to once per at-bat at Triple-A and Double-A, second base moved 9 inches closer to home in the second-half International League season.

## 7.6 What the build does with all this

`LVL` carries an `env` block per level holding the published line. Every generated rate is that level's published rate **moved by grade**, with the deviation measured from the LEVEL'S OWN talent centre rather than from 50 — because the 20-80 scale is anchored to major-league average, so a Double-A club centred at grade 40 is full of 40-grade players and 40-grade players ARE Double-A average.

Two corrections were needed and both are recorded because they are easy to get wrong again:

1. **Measuring deviations from 50 instead of the level's centre** generated a Single-A league with a 6.85 ERA and a .570 OPS.
2. **The grade-to-home-run curve is convex**, so the average of `hrFrom()` across a population sits above `hrFrom()` at the population mean — by 5% at the major-league centre and **21% at Double-A's**. Scaling by the value at the centre inflates power at every level, worse the further down you go. The build scales by the expected value over the actual grade distribution instead.

**ERA is derived from a FIP core** whose constant is solved so that a pitcher at the league's own rates posts the league ERA. For MLB 2025 that constant lands on **3.24** — which is the real published FIP constant. That agreement was not tuned for; it is the check that the model is dimensioned correctly.

**Verified by `qa/calib.js`:** generating 1,400 players at each level and aggregating reproduces every published figure within tolerance — batting average, OBP, SLG and OPS inside 2%, ERA and WHIP inside 2.2%, H/9, BB/9 and SO/9 inside 2%, home runs inside 5.5%.

---

# 5 · OPEN GAPS — do not fill these from memory

0. ~~Stat environment by level~~ — **CLOSED 2026-08-27, see §7.**
1. **Baseball-Reference box-score batting/pitching column order.** Needs one JS-enabled browser fetch. Close it when the box-score screen is built. (§3.8)
2. **MLB.com Gameday's rendered column headers** — underlying data fully verified via statsapi, but the on-screen header row is not; mlb.com is a client-rendered SPA.
3. **FanGraphs number formatting** (decimals / leading zeros) — bodies render client-side.
4. **BR "Detailed Standings"** columns — comment-wrapped.
5. **Raw power vs game power in units** — FanGraphs Community piece has it as images.
6. **Arm strength in mph by grade** (OF/IF) — no authoritative published table.
7. **FIELD → units** and **CONTROL/COMMAND → BB/9** — no published mapping exists anywhere.
8. **Atlantic League roster limits and any salary figure** — league publishes neither; 2018 rules PDF robots-blocked.
9. **Current (2025/26) salary cap for any Partner League** — none published. Best available is Frontier League 2020.
10. **DSL club count** — sources give 49/51/53. Using ~50 at Tier 3.
11. **2024/2025 independent-league attendance** — does not exist in published form; 2023 is the latest.
12. **Two-way player ("Ohtani Rule") thresholds** for 2026 — no official current statement found.
13. **Rounds 11–20 draft bonus threshold** counting against the pool — not stated in the 2026 slot-values article.
14. **Minor-league parent affiliation** — which MLB club owns which of the 120 affiliated clubs. The club names and league placement in §2.1 are T1; the ownership map was NOT researched and is therefore NOT asserted anywhere in the build. The Organization page stays dark until this is collected. Target source: MLB.com / MiLB affiliate listings.

**Stale-source warnings:** MLB's own `/milb/pioneer/league`, `/milb/arizona-complex/about` and `/milb/florida-complex/about` pages are years out of date. Prefer the Stats API and current standings pages for anything below Single-A.

---

# 6 · V1 RESEARCH TARGETS STILL OUTSTANDING

Collected above: league structure, minors ladder, indy leagues, attendance, the 20-80 scale, and every column set the grid must express.

Still needed before the systems that use them are coded:

| Domain | What's needed | Target sources | Tier | Needed by pass |
|---|---|---|---|---|
| ~~Stat environment by level~~ | **DONE — §7** | | T1 | |
| Park factors | Per-park run and HR factors, MLB and MiLB | Baseball America park factors | T2 | Sim engine — bigger lever than level |
| Indy rate stats | Slash lines and ERA for the four Partner Leagues | Pointstreak (browser session), B-R register per team | T2 | Replaces the borrowed proxies |
| Aging curves | Peak ages and decline slopes by skill | Published sabermetric aging research | T2 | Development + aging |
| Salary scales | MLB minimum, arbitration patterns | CBA summaries | T1/T2 | Contracts |
| Club economics | Revenue and valuation by market size; media deals; revenue sharing | Forbes valuations, published estimates | T2/T3 | Finance depth |
| Injuries | IL stint rates and lengths by position, age, usage | Published IL studies | T2 | Injuries |
| Ticket pricing | Price ranges by level and market | MLB/MiLB published | T2 | Money loop |
| Travel | Series structure, travel costs by level | Published schedules, cost reporting | T2/T3 | Finance depth |

---

# 8 · GAPS OPENED OR CONFIRMED BY THE SIM PASS (v0.4, 2026-08-27)

Recorded here so the next pass inherits the *reasoning*, not just the numbers.

## 8.1 Cross-league rivalries · **T3, and the reasoning is the source**

The schedule generator needs each MLB club to have exactly one cross-league rival, because the
modern format gives every club a home-and-home against its natural opposite plus a rotating
interleague slate. No published document lists "the rival pairs" as such — MLB publishes schedules,
not a rivalry table.

The build therefore **derives** the pairing: geographic and historical pairs are seeded
(NYY–NYM, CHC–CWS, LAD–LAA, SFG–OAK, BAL–WSN, STL–KCR, CIN–CLE, PIT–PHI, MIA–TBR, MIL–MIN,
ARI–SEA, PHI–TOR, ATL–BOS), any pair that is **not** cross-league under the current alignment is
discarded, and the remaining clubs are paired programmatically so the map is a perfect matching.

**Why this is written down:** the first version kept HOU–TEX and COL–SDP, both of which are
same-league now. Four clubs ended up scheduled for 159 games instead of 162, and every automated
count check passed because the totals still balanced. A rivalry table copied from memory of the
1997–2012 format is a silent schedule corruption.

## 8.2 The Pioneer League proxy is the weakest borrowing · **T3, flagged in-game**

D23 assigns each independent league the published environment of the affiliated level its roster
rules make it resemble. Three of the four are defensible. **The Pioneer League is not**: its
parks sit at 3,500–4,700 feet, it is one of the highest-scoring leagues in professional baseball,
and it is currently modelled on Single-A, the *lowest*-slugging level in the game.

The build now says so on screen — the player profile carries the borrowing note under ERA+/OPS+ —
but a Pioneer League start is running a materially wrong run environment until either the indy
rate stats (§7.3) or park factors (§7.4) close it. **Park factors would close it more cheaply**,
because altitude is the whole story.

## 8.3 The binomial ceiling — how to report an engine's quality signal · **method, not a figure**

"Does roster quality predict winning?" cannot be answered with a bare correlation, because a season
is a finite sample and luck owns a fixed share of the variance no model can reach into.

For a league of clubs playing `gp` games each, with observed win-percentage standard deviation
`sd_obs`, the irreducible noise is `sd_noise = sqrt(0.25 / gp)` and the **maximum achievable
correlation** between true talent and observed win% is

```
ceiling = sqrt(1 - sd_noise^2 / sd_obs^2)
```

Report `r / ceiling`, not `r`. At MLB 2026 in-build: `sd_obs = 0.055`, `gp = 162`,
`sd_noise = 0.0393`, `ceiling = 0.681`, measured `r = 0.477` → **70% of the achievable signal**.

Talent must also be measured over the men who play — the nine in the lineup and the five in the
rotation. Averaging the whole 40-man dilutes the signal with players who never take the field and
reads as a broken engine when the engine is fine (it read `r = 0.328` that way).

## 8.4 Interrupt pacing · **T3, measured in-build, needs Jordan's call**

At default settings (all three interrupts on), 40 requested 30-day advances delivered **751 of
1,200 days — 18.8 days per tap** — stopped 21 times by an injury and once by the cash floor.

There is no real-world document to check this against; it is a pacing decision. The relevant real
figure for the underlying rate is IL stints per club-season, which is in the §7 gap table and
unsourced. Until then the injury rate is Tier 3 and the pacing is Jordan's to judge from a playtest.

## 8.5 Aging — now the binding gap · **T2, unsourced, blocks the world**

Five simulated seasons leave the major-league club at an average age of **34.8** with an unchanged
overall grade, because players age and nothing else. This is not a drift bug — the books reconcile,
the leagues still separate, no NaN appears — it is a missing system, and it makes a long career
impossible rather than merely inaccurate.

Needed: peak ages and decline slopes by skill (power peaks later than speed; control later than
stuff), plus retirement hazard by age and level. Published sabermetric aging research is the source;
the delta method and the harmonic-mean method disagree materially and the disagreement should be
recorded rather than resolved by picking one.

---

# 9 · THE INDEPENDENT LEAGUES IN DEPTH — 2026-08-27

Gathered because the project turned to focus on independent ball with the ownership ladder as the
arc. This section supersedes nothing in §7.3; it fills it in. **The single most important finding is
that the four Partner Leagues are not equally knowable** — two publish complete roster systems, one
publishes a single rule, and one has redacted every business rule in its public rulebook. Any model
that treats them symmetrically is inventing three quarters of itself.

## 9.1 Roster rules — what is actually published

### Frontier League · **T1, complete, AGE-based**
Source: Frontier League, *Player Eligibility*, https://www.frontierleague.com/player-eligibility
(page carries no publication date; accessed 2026-08-27).

| item | rule |
|---|---|
| off-season roster | max 34 |
| pre-season cutdown | 28, the Sunday before Opening Day |
| active roster | **min 22, max 25** |
| Professional-1 | completes the season aged **24 or younger** |
| Professional-2 | completes the season aged **25** |
| Experienced-1 | completes the season aged **26** |
| Experienced-2 | completes the season aged **27–29** |
| Veteran | completes the season aged **30+** |
| composition | **min 10** Pro-1/Pro-2 · **min 6** Exp-1 (adjusted down if more than 10 Professionals) · **max 8** Exp-2/Veteran, of whom **max 2** may be Veteran |
| a season counts toward classification only with | **>75 AB, 15 games pitched, or 30 IP** |
| military service | one year credited per year of active duty |

Age sets a **ceiling** on classification, not a floor. Position-switchers may be reset to Pro-1.

**Superseded system — do not mix.** Before ~2023 the Frontier used a service-based system
(Rookie-1/Rookie-2/Experienced/Veteran) with a hard age cap of 28 (2019) or 29 (2022) and max four
Veterans. T1 as history, **T3 if applied to today**. The build's current note describes the CURRENT
system and is correct.

### American Association · **T1/T2, complete, SERVICE-based**
Primary: *American Association Media Guide 2013*,
https://nyc3.digitaloceanspaces.com/sportsarchive-documents/prod/60ea4748c42c4/AA-Guide-2013.pdf
Current values relayed from the *2022 Media Guide* via Wikipedia (aabaseball.com is entirely
robots-disallowed, so the current primary could not be reached).

| item | rule |
|---|---|
| active roster | **25** (min 20) |
| veterans (6+ years service) | **max 6** |
| rookies or LS-1 | **min 5** |
| LS-4 | **max 6**, of whom **max 2** may be LS-5 |
| Rookie | fewer than 1 year of service |
| LS-1 … LS-5 | fewer than 2, 3, 4, 5, 6 years of service |
| Veteran | 6+ years |
| **a year of service accrues at** | **75 official at bats, or 30 innings pitched**, in specified leagues in a prior calendar year |
| age override | 6+ years service but **under 26** by Sep 1 → classified LS-4; **under 24** by Sep 1 → LS-3 |
| disabled list | max 2 at once, 7-day minimum |

**No overall age cap exists.** Roster-size history: 22 active in 2013 (4 vets / 4 rookies), 23 in
2018 (5 / 5), 25 from 2022 (6 / 5). T1 for 2013 from the primary; T2 for the later years.

### Pioneer Baseball League · **T1 on the one rule it publishes**
Source: MiLB.com, *About the Pioneer League*, https://www.milb.com/pioneer/league ·
MLB.com press release 2024-05-13.

- **25 active players.**
- **No player on the Active List may have more than three years of prior professional service.**
- Roster **minimum: NOT PUBLISHED.** No age cap and no classification system — the league gates on
  service only.
- Thresholds for "a year of professional experience": 45 games played (position players), 10 games
  started (starters), 25 games (relievers). **T2** — Indy Ball Island, not verified against a rulebook.
- `pioneerleague.com` returned HTTP 403 on every URL attempted; all of the above is secondary.

### Atlantic League · **THE RULES ARE REDACTED. This is a documented absence, not a gap in searching.**
Source: *ALPB Official Rules & Regulations, 2025 Umpire Edition*, ratified 2025-03-28,
https://atlanticleague.com/wp-content/uploads/2025/04/ALPB-Rules-Regulations-25-Umpire-Edition-033025.pdf

Rule 10 (Player Contracts & Compensation, including §4 Compensation and §5 Salary Guidelines),
Rule 11 (Player Limits, Trades, Reserved Lists) and Rule 12 (Protected Player List, Seven Day Rule,
Tampering) are marked **"NA"** in their entirety in the only public edition.

**Therefore the Atlantic League has NO published:** active roster minimum or maximum · veteran
definition or limit · age cap · prior-service limit · classification system of any kind.
The only quantitative signal is a back-solve from a league marketing sentence — 53 purchases
"represented over 25% of active roster players across eight clubs" → ~26.5 per club → roster ~25–27.
**T3, an inference from marketing copy.** The build's `roster:[0,0]` for the Atlantic League is
accidentally the most honest encoding in the file: unknown.

**The 40% claim.** "More than 40 percent of Atlantic League players have Major League service time"
— https://atlanticleague.com/about/, undated, the league's own promotional page, no methodology,
unaudited. **T3.** At ~26 × 10 clubs it implies ~104 men with MLB service in the league at once.
Use it as a direction, not as a distribution parameter.

**⚠ POISONED SOURCE — do not use.** Wikipedia's ALPB article cites Atlantic League minimum salaries
of "$13,800/yr" (2021) and "$30,250/yr" (2023). Both citations are Baseball America articles about
**MLB-affiliated MiLB pay**; $13,800 is the 2021 Double-A minimum. The figures have nothing to do
with independent baseball. Discard on sight.

## 9.2 Salaries — a real ladder, and every figure is stale

| league | team cap | individual | year | source | tier |
|---|---|---|---|---|---|
| Atlantic | **$225,000–$275,000**/season, varies by club | — | **2018** | Indy Ball Island | 3 |
| American Association | **$125,000** | rookie min **$1,200**/mo | **2018** | Dakota News Now 2018-06-10 | 2 |
| American Association | $115,000/yr (conflicts with the above) | $800–$3,000/mo | 2018 / undated | Indy Ball Island · aabfan.com | 3 |
| Frontier | **$75,000** | $600–$1,600/mo, league avg **$750**/mo | **2018** | Observer-Reporter 2018-04-01 | 1 |
| Frontier | **$85,000** | max $1,600/mo standard, up to **$4,000**/mo for the best | **2020** | Spectrum News 1 2022-08-12 | 1 |
| Frontier | — | avg **$1,500**/mo + housing | **2024** | Front Office Sports 2024-09-10 | 1 |
| Pioneer | not published | avg **$1,500–$2,500**/mo | **2025** | SWX 2025-07-30 | 1 |

**The ordering is the finding: Atlantic ≈ 3× Frontier on team payroll.** The build charges one
`ECON.INDY.payroll` of $128,000/season to every indy club, which sits at roughly the American
Association rung and is 40–55% of the Atlantic and ~1.6× the Frontier. **No cap figure newer than
2020 is published for any league.** Any current cap in the build is T3 by necessity — say so.

## 9.3 Club revenue — one real published range

**Frontier League club revenue: $1.8M – $4.1M per club.** Front Office Sports, 2024-09-10,
https://frontofficesports.com/independent-baseball-frontier-league-new-york-boulders/ · **T1**.

This is a genuine validation of the existing model: `qa/season.js` produces $1.96M–$2.17M of revenue
for an indy club, inside the published Frontier band. It is the **only** published per-club revenue
figure for any independent league. Atlantic, American Association and Pioneer: **not published.**

Atlantic League 2019 attendance, T1 (league PDF, Greater Hagerstown): 1,940,590 over 558 games,
3,147–3,478 per game; Somerset 344,641 · Long Island 328,194 · Sugar Land 304,753 · Lancaster
285,441 · Southern Maryland 200,889 · York 199,045 · High Point 144,486.

## 9.4 Contracts purchased by MLB organisations — **the number the contract-out needs**

**MLB pays $5,000–$10,000 to purchase an independent player's contract.**
Baseball America, 2021-06-25, *Partner Leagues Face Player Shortage As MLB Clubs Purchase Contracts
At Record Rate*. **T1.** This is the single most useful figure in the section: it prices the
transaction the whole indy fantasy turns on.

| league | season | contracts purchased | tier | note |
|---|---|---|---|---|
| Atlantic | 2024 | **61** | 2 | counted from the league's name list; two duplicate entries, true count may be 59 |
| Atlantic | 2023 | 36 | 2 | counted from names |
| Atlantic | 2022 | 40 | 2 | counted from names |
| Atlantic | 2021 (to Jun 23) | **53** | **1** | league press release states the number outright — partial season |
| Frontier | 2026 (in progress) | 38 | 1 | league's own running tally, accessed 2026-08-27 |
| Frontier | 2021, first month | 36 | 1 | Baseball America 2021-06-25 |
| Frontier | 2019, same span | 14 | 1 | same |
| Frontier | pre-2021 single-season record | 53 | 1 | same |
| Pioneer | 2024, first half | **13** by 8 MLB orgs | 1 | SWX 2024-07-14 |
| Pioneer | 2021, first month | 4 | 1 | Baseball America 2021-06-25 |
| American Association | all seasons | **UNREACHABLE** | — | published by the league; aabaseball.com is entirely robots-disallowed |

Direction is consistent and steep: **Atlantic ≫ Frontier > Pioneer**, matching the talent ladder.
Roughly 40–60 a season from the Atlantic against ~13 a half-season from the Pioneer.

## 9.5 Pioneer League altitude — **replaces the Single-A borrowing (closes D23's worst case)**

Eliza Richardson, *High Altitude Offense: An Empirical Examination of the Relationship Between Runs
Scored and Stadium Elevation*, SABR **Baseball Research Journal**, Fall 2014 (published 2014-11-12).
Covers the Pioneer, Northwest and Appalachian Leagues, 2008–2012. **T1.**

- **Runs: 5.61 × 10⁻⁴ runs per game per foot of elevation** → **+2.8 R/G at 5,000 ft** vs sea level
- **Home runs: 1.20 × 10⁻⁴ HR per foot** → **+0.6 HR/G at 5,000 ft**

Ballpark elevations (SABR 2014 unless noted). ✓ = still in the league in 2026:

| park | elevation | 2026 |
|---|---|---|
| Idaho Falls, ID | 4,705 ft | ✓ |
| Ogden, UT | 4,376 ft | ✓ |
| Great Falls, MT | 3,300 ft | ✓ |
| Missoula, MT | 3,232 ft | ✓ |
| Billings, MT | 3,153 ft | ✓ |
| Boise, ID | ~2,610 ft (Wikipedia, T2) | ✓ |
| Casper WY 5,150 · Orem UT 4,734 · Helena MT 4,068 | | gone |

**⚠ Material caveat that changes the conclusion.** The 2026 Pioneer League is 12 clubs including
**four in California at or near sea level** (Oakland, Long Beach, Modesto, Yuba-Sutter). The
"extreme altitude league" characterisation fits the Montana/Idaho/Utah core, **not the league as a
whole**, and is materially diluted against the 2008–2012 footprint the study measured. Elevations
for the four California parks and for Kalispell were not found.

This is enough to model the Pioneer environment **from altitude per park** rather than by borrowing
Single-A wholesale — which is exactly the weakness D23 and §8.2 flag. It also delivers the project's
first real park-factor input.

## 9.6 The ownership ladder — what a club costs

**Method, T2:** independent and minor-league clubs are valued at **EBITDA × 4–7**, and an expansion
fee sets a floor even for a money-loser. Baseball America, *How To Value A Minor League Baseball
Franchise*, 2020-08-26.

**Independent — expansion fees are NOT PUBLISHED by any of the four leagues.** The Atlantic League
buy-in is described only as "several million dollars" (Greater Hagerstown PDF, Nov 2020, T3).
Actual sales: Adirondack Lumberjacks **$575,000** (2002) · Cook County Cheetahs **$700,000** (2003) ·
Grand Prairie AirHogs **$1.5M** (2011) — all T1 for their year, all from Fun While It Lasted.
**Long Island Ducks → REV Entertainment, January 2026: price not disclosed.** Modern indy sales are
structurally undisclosed.

**Affiliated (post-restructuring):** Sacramento River Cats **$90M** (2022, AAA, includes the
ballpark) · Worcester Red Sox **~$70M** (Jan 2024, AAA) · Charlotte Knights **~$100M** (~2024, AAA,
reported as approached) · Dayton Dragons **~$40M** (2014, Single-A, a record at the time) ·
Dayton Dragons → Diamond Baseball Holdings (2025): **not disclosed**. Front Office Sports, 2024-01-16
and 2025-03-13. **No modern Double-A, High-A or Single-A price is published at all** beyond 2014.

**Major League — ACTUAL SALES, which is what a purchase price should be built on:**
Tampa Bay Rays **$1.7B** (closed 2025-09-30) · Baltimore Orioles **$1.725B** (2023) · New York Mets
**$2.475B** (2020) · Kansas City Royals **$1.0B** (2019) · Miami Marlins **$1.2B** (2017). T1.

**Valuations are not sales, and the gap is large.** Forbes' 2025 average was **$2.6B** (CBS Sports,
2025-03-26, T1) while the Rays actually cleared **$1.7B** six months later. Forbes 2026 average
~$2.9B, Yankees $8.5B, Marlins $1.5B (T2, via secondary reporting; forbes.com 403). **Pricing the
top rung off Forbes overstates the buy-in by roughly 1.5×.** Build the ladder on transactions.

**The rung gaps are enormous and non-linear:** indy revenue $1.8–4.1M → Triple-A sale $70–100M →
MLB sale $1.0–2.5B. Roughly 20–25× indy→AAA, then 15–20× AAA→MLB. The AA/High-A/Single-A steps in
between have **no modern published prices** and will have to be interpolated and labelled T3.

**Affiliated ownership economics, T1:** MiLB 2025 attendance 30,360,682 across 120 clubs, −2.9% YoY,
3,847 per game (Baseball America 2025-09-24). PDL profit share per club **$17,976 (2025) rising to
$44,274 (2027)** (Defector 2025-07-10). Minor-league margins are structurally healthy because
**MLB parents pay the players' salaries** — a fact the ladder must model or the rungs make no sense.

## 9.7 The Pecos League — the rung below the rungs

**Active, 2026 is its 16th season. 16 teams in 2 divisions, 54 games.**
Source: 2026 schedule release via OurSports Central, 2026-01-01. T1. (The league's own About page
says 14–15 teams — a published inconsistency; the dated schedule release wins.)

Roster rules, T1, http://www.pecosleague.com/pecosleague.asp?page=112 —
**22-man active, 25-man expanded** · Rookie = born after Jan 1, 2002 · up to 15 players born on or
after Jan 1, 2000 with fewer than 165 AB or 65 IP · up to **10 veterans** of any age · up to
3 imports · a player removed from the expanded roster cannot return for 14 days.

**Pay: $50/week (2014 and 2019), $200–$500/month league-wide with $60/week at Tucson (2023),
$100–$200/week typical and $300–$400 at the better-funded clubs (2025).** T1/T2.
**And the mechanism matters more than the number:** the league states that since 2018 players are
compensated "from baseball camps, 50/50 raffles and team activities" rather than under contracts,
citing the Save America's Pastime Act. **Pecos players are not salaried employees by the league's
own description.** T1.

**Average ballpark elevation 4,870 ft**, which the league itself credits for high-offence baseball.

**Two facts that decide whether Pecos can be a ladder rung at all:**
1. **Commissioner Andrew Dunn owns 15 of the 16 teams** (FanSided 2025-06-03, T2). The league is
   functionally single-entity. **There is no market in which to buy a Pecos club.**
2. **The league does not collect or release attendance** (FanSided, T2) — this is a finding, not a
   gap. Anecdotes only: ~300 on a Thursday in Tucson (2023), under 500 for the 2022 championship
   series, ~1,000 at Garden City (2025), 20–40 at typical games with 500+ on July 4th (2019).

Pecos is **not** an MLB Partner League. Partner status and dates, T1, MLB.com glossary:
American Association 2006 · Atlantic League 2019 · Frontier League 2021 · Pioneer League 2021.
Quality ordering, T2: Atlantic → American Association → Frontier → (other indy) → Pecos.

## 9.8 A real-world event inside the game's timeline

**The Frontier League becomes the National Association of Professional Baseball (NAPB) from the 2027
season, with 18 clubs, remaining an MLB Partner League.** Ballpark Digest, 2026-04-29. **T1.**
The game's world opens in 2026 and is meant to run for decades, so this happens in year two.

**Atlantic League 2026, T1** (league release 2025-09-10): 10 clubs, 2 divisions, **126 games**,
Apr 21 – Sep 13. Matches the build exactly.

## 9.9 What could not be reached — record it so it is not re-searched blindly

- **`aabaseball.com` — the entire domain is robots-disallowed.** This blocks the current American
  Association Media Guide (the primary rulebook), the players-transferred-to-MLB pages, and the
  per-year transaction pages. The biggest single gap.
- **`pioneerleague.com` — HTTP 403 on every URL.** Blocks the eligibility rules and the league's own
  "Pioneer League by the Numbers" analytics release.
- **`atlanticleague.com.ismmedia.com` — HTTP 523 / timeouts.** Blocks the 2018 and 2023 full Rules &
  Regulations editions, the likeliest place unredacted Rule 10/11 text would exist.
- **`forbes.com`, `sportico.com`, `cnbc.com` — 403.** Valuations reached via secondary reporting.
- **Not published anywhere:** average player age and age range for **all four** Partner Leagues ·
  share of players with prior affiliated experience for all four · any salary cap newer than 2020 ·
  expansion fees for any independent league · per-club revenue for Atlantic, American Association
  and Pioneer · league-aggregate rate statistics for any independent league (still true; §7.3 stands)
  · Pioneer League park factors · Pecos attendance.

---

## 10. The independent winter — turnover, attrition, intake, promotion
*Researched 2026-08-28 for v0.9. The pass this feeds is the one that stopped the
world from ageing to death; every figure below either sets a constant or sets a
test threshold, and the ones that could not be found are recorded as findings.*

### 10.1 Contracts purchased by affiliated organisations, per club per year

**SOURCE CONFLICT, carried rather than resolved.**

| source | Atlantic | Am. Assoc. | Frontier | Pioneer |
|---|---|---|---|---|
| Zimmerman, The Hardball Times, 2016-02-12 (2013–15 sample) — T1 | 3.9 | 1.6 | 1.4 | n/a |
| League transaction pages, 2024–25 — T1 | 2.3 | 1.1–1.3 | 0.88 | ~1.1 (half-season) |

- Zimmerman: overall average 2.1 per team per year; of 208 players signed across three leagues, 120 pitchers (58%) / 88 hitters (42%). https://tht.fangraphs.com/independent-league-to-affiliated-baseball-who-makes-the-move/
- Atlantic League contract purchases, 2025: 45 rows, of which ~23 to MLB organisations and ~22 to foreign leagues (mostly Mexican). https://atlanticleague.com/players/player-contracts-purchased/ · **Reliability caveat: repeated automated reads of the same page returned 31, 45 and 48 for 2025, and 78 vs 82 for 2021. Verify by eye before treating as T1.**
- American Association: 2024 — 15 transfers, 14 to MLB organisations, 1 to Mexican League. 2025 — 13, all to MLB organisations. https://aabaseball.com/2024-transactions
- Frontier League 2025: 14 "sold the contract of…" entries. https://www.frontierleague.com/transactions
- Pioneer League: "Eight MLB teams purchase the contracts of 13 players", first half of 2024 only, 12 clubs. https://www.pioneerleague.com/sports/bsb/2024/releases/20240712ym91wm
- Historical single-season records (Baseball America, 2021-06-25): Atlantic 72 · Frontier 53 · American Association 50. 2021 is an outlier — MLB had cut ~40 affiliates and released 80 minor leaguers in a window that saw 508 in 2019.

**The recent counts run below the 2013–15 study in every league.** `PROMO` carries the midpoint and names both. Pecos is not an MLB Partner League and publishes nothing — **T3**, set low deliberately, because the difference between the floor and the rungs is exactly that nobody is watching.

### 10.2 Career length and age structure

**NOT PUBLISHED.** No career-length study or age distribution exists for independent baseball, from any league, Baseball America, FanGraphs/THT, SABR, or academic work. Searched; found MLB and MiLB work only. Recording that as a finding so nobody re-searches it blindly.

**Derived instead — T1 within its sample.** 2025 Frontier League position players, n=48, Evansville Otters + Lake Erie Crushers, baseball-reference register (pitching tables would not render through fetch, so this is batters only):

```
21:1  22:2  23:8  24:13  25:9  26:6  27:2  28:4  29:2  30:0  31:0  32:1
```

- **median age 24–25**
- **28 or over: 7 of 48 = 15%**
- **30 or over: 1 of 48 = 2%** (Alfredo González, 32, in a Veteran slot)

**The tail past 27 is cut by the RULEBOOK, not by attrition** — max 8 aged 27–29 and max 2 aged 30+ per roster — so the attrition curve must not be fitted to it or the same constraint is counted twice. What the rulebook does *not* explain is the gap between the 8% of veteran slots the Frontier allows and the 2% real clubs use; that gap is club preference, and it is where `AGE_PREF` comes from.

Ages at which indy players are signed into affiliated ball (Zimmerman, 2013–15): AAA 29.3 · AA 27.7 · High-A 25.3 · Low-A 23.8.

### 10.3 Roster turnover

**NO LEAGUE PUBLISHES A RETURNER RATE.** Searched all four Partner League sites, Baseball America, and general coverage. What exists is club press releases:

| club | year | returning | roster | rate |
|---|---|---|---|---|
| Sioux City Explorers | 2026 | 9 | 27 | 33% |
| Sioux City Explorers | 2025 | 11 | 27 | 41% |
| Evansville Otters | 2025 | 6 | 25 batters | 24% |
| Lake Erie Crushers | 2025 | 7 | 23 batters | 30% |

Combined 13 of 48 = **27%**. Sources: oursportscentral.com/services/releases/explorers-set-roster-for-opening-day/n-6362325 (2026-05-15); xsbaseball.com/explorers-set-roster-for-opening-day-2/ (2025); baseball-reference register team pages for the two derived rows. The B-R rows count season appearances rather than opening-day rosters, so their denominator is inflated and 24–30% is a floor.

**T2 band used: 24–41%.** The simulated world is measured against it in `qa/winter.js` and currently returns **30.7%**.

### 10.4 Wages

- Atlantic League minimum **$850/month**, average **$2,100/month**; Pecos League minimum **$300/month**; season "less than 5 months" — Longenecker, Baseball America, 2012-08-15. https://www.baseballamerica.com/stories/indy-ball-players-arent-playing-for-the-pay/
- Same article: **1,366 jobs in independent baseball** across six leagues and 57 teams in 2010; total 2012 salary expense across the sport ~$6M.
- **In 2011, less than 4% of independent players reached affiliated ball** — same source. This is the only hard attrition-adjacent figure that exists, and it measures promotion, not attrition.

These are 2012 dollars against current published caps, so **the ratio is what carries, not the level**: minimum / average = 0.40, which is `WAGE_FLOOR`.

### 10.5 What could not be found

Recorded so the same searches are not repeated:

- Any league-wide published roster-turnover or returner percentage, any league, any year.
- Any career-length distribution (seasons played) for independent players.
- Any percentage breakdown of first-year player backgrounds — released affiliated vs undrafted college vs tryout vs returning. The closest is one club's itemised newcomer list (Sioux City 2025) and the Frontier tryout draft, which supplies about **5% of league roster slots** (19 of ~400 in 2024) and is itself substantially recycled professionals: both of 2025's top two picks had prior indy service.
- League-level year-over-year retention — what share of a season's players are in no league at all the next year. No source since the 2012 "less than 4 percent" figure.
- American Association 2023 transactions and all AA media guides — robots.txt disallowed.
- Frontier League season totals for 2023 and 2024 — no archive page exists, only the current season is maintained.

---

**Merged into the base file 2026-09-04.** §11–16 and §17 below were written 2026-09-03/04 as separate append-blocks while no folder was connected (see DECISIONS.md D78). Pasted in now verbatim, unedited, per the standing instruction in their own headers.


## 11. Level translation and minor-league progression

The spine of the development pass. These are the numbers that let a man move between Pecos and the
Show without the sim inventing a difficulty curve.

### 11.1 Davenport level-translation coefficients — the value of one run at each level vs. one MLB run

| level | league measured | coefficient | tier |
|---|---|---|---|
| Triple-A | Pacific Coast League | 0.759 | T1 |
| Double-A | Texas League | 0.667 | T1 |
| High-A | Carolina League | 0.556 | T1 |
| Single-A | South Atlantic League | 0.476 | T1 |
| Rookie | Pioneer League | 0.387 | T1 |
| Rookie | Appalachian League | 0.381 | T1 |

· Source: Clay Davenport translation factors, claydavenport.com, reproduced by Royals Review, 2017.
· Read as: a PCL run is worth about three-quarters of an MLB run; a Rookie-level run about a third.
· Originating concept: Bill James, *1985 Baseball Abstract* — James called MLEs his most important
  concept. Szymborski's ZiPS and Cartwright's Oliver both take MLEs as an input. Tom Tango accepts
  them as a first step while criticising how they get used (FanGraphs library, League Equivalencies).
· **Recorded 2026-09-03.**

### 11.2 Independent-league placement — NOT quantified

· The Atlantic League is consistently described as sitting between Double-A and Triple-A in talent
  (indyballisland.com, 2026). **A Davenport-style numeric coefficient for any independent league does
  not exist publicly.** The placement is qualitative only. T3 if used.
· **Finding: not published.** Any indy coefficient in the build is a designer assumption and must be
  labelled as one in-game. **Recorded 2026-09-03.**

### 11.3 Current level baselines — the ABS era

| figure | value | tier |
|---|---|---|
| Triple-A run scoring, 2022 | 4.98 R/G | T1 |
| Triple-A run scoring, 2025 | 4.94 R/G | T1 |
| Triple-A average fastball velocity, 2022 | 92.4 mph | T1 |
| Triple-A average fastball velocity, 2025 | 93.2 mph | T1 |
| Pioneer League (Rk) ERA, representative year | ~5.65 | T1 |
| Southern League (AA) ERA, representative year | ~3.60 | T1 |

· Source: Boston Globe ABS explainer citing MLB data, 2026; Royals Review, 2017 (ERA spread).
· Note the shape: run scoring flat while velocity rose nearly a full mph — better arms, same runs.
· **Recorded 2026-09-03.**

### 11.4 ABS effects on the baseline — matters if the sim ever models it

· Under ABS in Triple-A: pitches in the zone up ~5%, chase rate down ~5%, walk rate up ~6%,
  strikeout rate down ~2%, slugging slightly down. T1, MLB data via Boston Globe, 2026.
· ~4.2 challenges per Triple-A game in 2025, ~50% overturn rate (catchers 56%, hitters 50%,
  pitchers 41%). T1, mlb.com, 2025.
· Timeline: Atlantic League first pro league with ABS 2019 · Low-A 2021 · select Triple-A 2022 · all
  Triple-A 2023 · challenge system full-time in Triple-A from 2024-06-25 · MLB leaguewide 2026. T1.
· **Relevance to this build: the Atlantic League ran ABS before affiliated ball did.** If the sim
  ever models league-specific rules, this is a real published difference between our five leagues.
· **Recorded 2026-09-03.**

### 11.5 Age relative to level

| figure | value | tier |
|---|---|---|
| "on-time" age, Single-A | 19 | T2 |
| "on-time" age, High-A | 20 | T2 |
| "on-time" age, Double-A | 21 | T2 |
| "on-time" age, Triple-A | 22 | T2 |
| share of Triple-A players aged 22 or under (2012) | ~7% | T1 |
| average Triple-A hitter age, 2022 | 26.6 | T1 |

· Sources: Baseball America, deadline-prospect study; FanGraphs, 2012; Baseball America, 2022.
· Pitchers run roughly a year older than hitters at each level.
· Baseball America found ages 19 and 21 the "sweet spot"; players 2+ years old for their level did
  post productive success rates but on samples too small to rely on.
· **Recorded 2026-09-03.**

### 11.6 Year-over-year improvement inside the minors — NOT published

· Searched directly across two passes. Clean minor-league-only delta curves in wRC+, K%, BB%, ISO or
  velocity by age do not exist in rigorous public form. Baseball Prospectus's delta-method work
  restricts to MLB ages 21–41.
· The only usable anchor: an MLB-anchored curve in which age-19 ISO roughly doubles by age 26
  (The Dynasty Guru, 2019) — T3, and the author's own caveat is that it understates minor-league
  growth.
· **Finding: not published. The development curve must be derived by chaining MLB-anchored curves
  backward through §11.1, and every figure so derived is T3.** This is the single largest hole under
  the development pass and it should be stated in the build notes, not tuned away.
· **Recorded 2026-09-03.**

---

## 12. What development spending buys — the owner's lever

### 12.1 Measured training effect — the flagship study

| figure | value | tier |
|---|---|---|
| pitch velocity gain, 6-week weighted-ball program | +3.3% | T1 |
| injury rate, experimental group | 24% (4 of 17, elbow) | T1 |
| injury rate, control group | 0% | T1 |
| shoulder external rotation gain | +4.3° | T1 |
| control group that ALSO gained velocity | 67% | T1 |

· Source: Reinold MM, Macrina LC, Fleisig GS, Aune K, Andrews JR, *Sports Health* 2018;10(4):327–333.
· **The 67% figure is the important one.** Two-thirds of the control gained velocity from ordinary
  throwing and lifting, so the marginal return on the expensive program is far smaller than the
  headline, and it is paid for in elbows.
· Subjects were high-school-aged. Extrapolating 24% to professional adults likely overstates risk.
· Driveline's own program data: within a 6-week block, 8% of pitchers showed no velocity change and
  12% decreased. T1, drivelinebaseball.com.
· **Recorded 2026-09-03.**

### 12.2 Organisational spread — the ceiling on how good a development org can be

| figure | value | tier |
|---|---|---|
| best org four-seam velocity, MiLB 2025 | 93.2 mph (Dodgers, Marlins) | T1 |
| worst org four-seam velocity, MiLB 2025 | 91.4 mph (Astros) | T1 |
| **spread, best to worst** | **1.8 mph** | T1 |
| league average | 92.2 mph | T1 |
| best composite MiLB Stuff+ | 103.9 (Dodgers) | T1 |
| worst composite MiLB Stuff+ | 96.3 (Diamondbacks) | T1 |
| top individual gainer, 2024→2025 | +5.0 mph | T1 |

· Source: Baseball America MiLB Statcast pitching rankings, Hawk-Eye, full 2025 season, all 30 orgs.
· **Caveat that governs its use: this is cross-sectional.** It measures pitch quality in one season,
  not mph added per pitcher by org. No source publishes a longitudinal org-development delta.
· **Use as a hard cap: no development org in the sim should add more than ~1.8 mph of edge over the
  worst one.** T2 as applied.
· **Recorded 2026-09-03.**

### 12.3 Farm-system value spread

| figure | value | tier |
|---|---|---|
| best farm system, surplus WAR (2016) | 42.5 (Red Sox) | T2 |
| worst farm system, surplus WAR (2016) | 5.5 (Angels) | T2 |
| average farm system output, following six seasons | 45.83 fWAR | T2 |
| rank-to-outcome correlation, BA org rankings since 1990 | Spearman ρ ≈ 0.86 | T2 |

· Sources: FanGraphs (grade-derived, 2016); FanGraphs Community using BA Handbooks 2001–2014;
  Neil Paine, neilpaine.substack.com.
· **The ρ ≈ 0.86 is the calibration target for the scouting pass**: rankings predict outcomes well
  but not perfectly. If the sim's prospect rankings predict better than that, the noise is too low.
· **Recorded 2026-09-03.**

### 12.4 Cost of development infrastructure

| figure | value | tier |
|---|---|---|
| Trackman B1 | from $18,995 | T1 |
| Edgertronic SC1, research-grade | ~$5,000 | T1 |
| Driveline baseball Edgertronic kit | $8,999 | T1 |
| Driveline estimate: value of a velocity program to a farm system | ~$38M NPV (≈ one 55-FV prospect) | T3 |
| industry rule of thumb: 1 mph on a 150-IP starter | ~$4.5M value | T3 |

· Sources: talksox.com; Sports Illustrated 2019; drivelinebaseball.com 2019 (Monte Carlo, ~13,000
  pseudo-prospects); Reboot Motion.
· **Not published:** club-level player-development budgets, Dominican academy construction costs,
  KinaTrax install prices, PD headcount growth 2015→present. **Finding: not published.**
· **Recorded 2026-09-03.**

---

## 13. The injury model beyond Tommy John

### 13.1 Cost and volume

| figure | value | tier |
|---|---|---|
| pitcher IL days from throwing injuries, MLB 2019 | 18,369 | T1 |
| salary lost to those injuries, 2019 | ~$318.7M | T1 |
| average per club, 2019 | ~$10.6M | T1 |
| range, 2019 | Twins 111 days ($1.13M) → Padres 1,259 days | T1 |
| most dollars lost, 2019 | Phillies, $28.5M | T1 |
| cumulative salary lost, shoulder/elbow study period | $3.33B | T1 |
| — elbow share | 68.3% ($2.28B) | T1 |
| — shoulder share | 31.7% ($1.06B) | T1 |
| costliest single diagnosis | UCL, $1.29B over 539 events | T1 |
| **reliever IL burden** | **27.4 IL days per 1,000 pitches** | T1 |
| **starter IL burden** | **15.3 IL days per 1,000 pitches** | T1 |

· Sources: Spotrac data via DVS Baseball; AJSM-lineage shoulder/elbow burden study.
· 2019 used deliberately as the last full pre-COVID season.
· **The reliever/starter ratio (~80% higher per pitch) is directly implementable** and is the kind of
  asymmetry the sim currently has no model for.
· **Recorded 2026-09-03.**

### 13.2 Recurrence and proneness — whether "injury prone" is real

| figure | value | tier |
|---|---|---|
| professional hamstring strains in study, 2011–2016 | 2,633 total (MiLB 2,192) | T1 |
| recurrence, MLB | 16.3% | T1 |
| recurrence, MiLB | 14.2% | T1 |
| days lost, first injury | mean 14.5 | T1 |
| days lost, recurrence | mean 16.4 | T1 |
| share of hamstring injuries to infielders | 37.5% | T1 |
| share occurring while base-running | >50% (home-to-first) | T1 |
| prior-year hamstring history present, MLB cases | 20% | T1 |
| prior-year hamstring history present, MiLB cases | 8% | T1 |
| **prior strain → future strain risk multiplier** | **2–6× (RR 2.3–6.1)** | T1 |

· Sources: Okoroha KR, Conte S, Camp CL, Ahmad CS et al., *Orthopaedic Journal of Sports Medicine*
  2019;7(7):2325967119861064 (MLB Health and Injury Tracking System); PMC systematic reviews for the
  multiplier (soccer-heavy but consistent across cohorts, elevated beyond one year post-injury).
· **This is the empirical licence for a hidden injury-proneness trait.** It is not folklore: prior
  injury multiplies future risk 2–6×, and the effect persists past a season.
· Knee injuries (Conte, 11-year MLB): 7.3% of all IL days, 16.2 days per injury, ~12% surgical, 44%
  caused by base-running. T1.
· **Recorded 2026-09-03.**

### 13.3 Return and career termination

· Most players return to pre-injury performance after hamstring injury, but a distinct tail does not:
  17 players in the MLB study played one season or fewer afterward. T2, ResearchGate.
· Career-termination distributions by injury type crossed with age are **not cleanly published**.
  **Finding: not published.**
· **Recorded 2026-09-03.**

---

## 14. The club as a business, and the rungs of the ladder

### 14.1 Minor-league and independent club economics

| figure | value | tier |
|---|---|---|
| MiLB per-capita spend (tickets + parking + concessions + merch) | ~$22/fan | T1 |
| MLB comparison (Pirates) | ~$51/fan | T2 |
| MiLB club net worth range | $3M–$25M | T2 |
| MiLB club revenue, upper end | >$10M | T2 |
| MiLB club profit, upper end | ~$4M | T2 |
| on-field player costs at an affiliate | $10–15M/season, **paid by the MLB parent** | T2 |
| independent franchise valuation range | $1M–$20M+ | T2 |

· Sources: Baseball America economics explainer, 2021; Forbes/Ozanian via College of Charleston
  thesis; Sports Advisory Group.
· A concessions-only per-cap is not published; the $22 is bundled and described as conservative.
· **Not published:** affiliated-club line items — league dues, umpire fees, bus-travel budgets,
  baseballs per dozen. **Finding: not published.** Expose as designer-tunable, label in-game.
· **Recorded 2026-09-03.**

### 14.2 Stadiums — the biggest number in minor-league baseball

| figure | value | tier |
|---|---|---|
| **public money spent on MiLB stadiums, cumulative** | **$7 billion across 134 ballparks** | T1 |
| Wilson NC ballpark (opened 2026-04-14, Single-A) | $70M, inside a $280M development | T1 |
| Hillsboro Hops park (High-A, broke ground 2024-08) | $120M | T1 |
| Maryland statewide MiLB stadium allocation | $200M | T1 |
| MLB context: median venue construction cost, 2025 | $393M | T1 |
| MLB context: median public contribution | $227M (58%) | T1 |
| richest MiLB naming rights | ~$4M/yr (Las Vegas, $80M/20yrs) | T1 |
| Chukchansi Park, Fresno | $16M/15 yrs ≈ $1.07M/yr | T1 |
| typical MiLB naming rights | $50K–$300K/yr | T2 |

· Sources: Bradbury JC, "The public cost of Minor League Baseball stadium subsidies," *Economic
  Inquiry* 2026, DOI 10.1111/ecin.70055; municipal records; OPB; USA Today; jcbradbury.com.
· **The $7B figure reframes the ladder**: a club's value is substantially a function of who paid for
  its ballpark and on what lease. That belongs in the valuation model.
· **Recorded 2026-09-03.**

### 14.3 The rungs — actual transactions

| rung | figure | tier |
|---|---|---|
| Diamond Baseball Holdings acquisition by Silver Lake | ~$280M cash, agreed 2022-08-09, closed 2022-09-29 | T1 |
| DBH portfolio now | ~48 MiLB clubs against an MLB-imposed ~50-club cap | T1 |
| MiLB club sale range, recent years | $10M–$100M | T2 |
| Sacramento River Cats + Sutter Health Park, 2022 | ~$90M | T2 |
| Tampa Bay Rays sale, July 2025 | $1.7B | T1 |
| — Forbes valuation months earlier | $1.25B | T1 |
| MLB expansion fee, expected | ~$2.1B, ~$140M to each existing owner | T2 |
| MLB expansion timing, expected | 2031 or 2032 | T2 |
| favourites | Salt Lake City, Nashville | T2 |

· Sources: Endeavor SEC 8-K / Silver Lake release; Bob Nightengale, USA Today; Manfred statements
  (~$2.2B, 2021); Forbes framing $2.0–2.5B.
· **Confirms the existing ROADMAP note**: actual transactions run above Forbes, not below. The Rays
  sold ~36% above their Forbes number. The project's existing "~1.5× high" note is directionally
  right but **inverted for this transaction** — worth reconciling against RESEARCH 9.6 before the
  ladder pass, not silently overwriting.
· Expansion figures are expectations and pre-CBA. T2, flagged.
· **Recorded 2026-09-03.**

---

## 15. The rules an owner-GM plays against

All T1 and all codified. These should be hard-coded constants behind a CBA-version flag, not modelled.

### 15.1 Service time and arbitration

| rule | value | tier |
|---|---|---|
| full service year | 172 days | T1 |
| standard arbitration eligibility | 3.000 years | T1 |
| Super Two | top 22% of 2–3 year players with ≥86 days prior season | T1 |
| Super Two cutoff, 2019 | 2.115 | T1 |
| Super Two cutoff, 2024 | 2.118 | T1 |
| Super Two cutoff, 2025 | 2.132 | T1 |
| Super Two cutoff, 2026 | 2.140 | T1 |
| historic high | 2.146 (2011) | T1 |
| pre-arbitration bonus pool | $50M, ~$1.67M per club | T1 |
| award shares | $2.5M (MVP/Cy Young) down to $150K | T1 |
| Rookie of the Year win | $750K | T1 |
| largest single pre-arb payout | Paul Skenes, $3,436,343 (2025); $5,588,400 across 2024–25 | T1 |

· Sources: MLB Trade Rumors; ESPN, Nov 2025; MLB.com; FanGraphs.
· Prospect Promotion Incentive (2022 CBA): a club earns an extra amateur-draft pick if a pre-arb
  top-100 rookie on the Opening Day roster finishes top-2 in ROY or top-5 in MVP/Cy Young. T1.
· **Recorded 2026-09-03.**

### 15.2 Roster mechanics

| rule | value | tier |
|---|---|---|
| Rule 5 clock, signed at age ≤18 | 5 seasons to the 40-man | T1 |
| Rule 5 clock, signed at age ≥19 | 4 seasons | T1 |
| Rule 5 selection price | $100,000 | T1 |
| Rule 5 return price | $50,000 | T1 |
| Rule 5 active-roster requirement | full season, ~90 active days minimum | T1 |
| option years per player | 3 | T1 |
| days on optional assignment that charge an option | ≥20 | T1 |
| maximum optional assignments in one season | 5 | T1 |
| top-100 prospects protected from Rule 5, 10-yr window | 98 of 98 | T1 |
| organisational top-30 protection rate | ~40–58%/yr | T1 |

· Sources: MLB.com glossary; MiLB.com; MLB.com 2025.
· **Recorded 2026-09-03.**

### 15.3 International amateur signings — 2025 bonus pools

| tier | pool | clubs |
|---|---|---|
| highest | $7,555,500 | Athletics, Brewers, Mariners, Marlins, Rays, Reds, Tigers, Twins |
| second | $6,908,600 | Diamondbacks, Guardians, Orioles, Pirates, Rockies, Royals |
| third | $6,261,600 | 12 large-market clubs |
| QO penalty | $5,646,200 | Astros, Cardinals |
| CBT + QO penalty | $5,146,200 | Dodgers, Giants |

· Bonuses ≤$10,000 do not count against the pool. Clubs may trade for up to ~60% above the initial
  allotment. T1, Baseball America / MLB Trade Rumors.
· Headline 2025 signings: Elian Peña $5M (Mets franchise record); Andrew Salas $3.7M (Marlins).
· **Probability of reaching MLB by international bonus tier: not published.** **Finding.**
· **Recorded 2026-09-03.**

---

## 16. Remaining figures and what could not be found

### 16.1 New-stadium attendance effect

| figure | value | tier |
|---|---|---|
| first-year attendance bump, regardless of performance | ~30% | T1 |
| duration of novelty effect | ~7–11 years | T1 |
| decay estimate | ~1.19%/yr | T2 |

· Sources: Clapp & Hakes 2005; Coates & Humphreys 2005; Zygmont & Leadley; Bradbury 2024 (*Economic
  Inquiry*) finds a smaller and slower effect using an event-study design — the conflict is recorded
  rather than resolved.
· MiLB-specific honeymoon work exists (Gitter & Rhoads; Soebbing et al.) but a clean minor-league
  percentage bump was not extracted. **Partially published.**
· **Recorded 2026-09-03.**

### 16.2 Makeup and mental skills — do NOT model as a stat

· MLB's Prospect Development Pipeline has evaluated 1,352 elite junior players (2017–2020) on
  athletic, processing, visual-function and on-field measures. T1, mlb.com.
· **Published peer-reviewed evidence that psychological or makeup testing predicts professional
  baseball outcomes is thin to nonexistent.** **Finding: predictive validity not demonstrated.**
· **Recommendation: makeup stays a flavour and qualitative modifier. There is no defensible
  coefficient, and inventing one would violate the number-tier law.** **Recorded 2026-09-03.**

### 16.3 The full "not published" list from both passes

Recorded so nobody searches these blind again, in the manner of §10.

1. Minor-league year-over-year improvement deltas by age — §11.6.
2. A numeric difficulty coefficient for any independent league — §11.2.
3. Club-level player-development budgets, academy construction costs, PD headcount growth — §12.4.
4. Affiliated-club P&L line items: league dues, umpire fees, travel, baseballs — §14.1.
5. Career-termination distributions by injury type × age — §13.3.
6. MLB-attainment probability by international bonus tier — §15.3.
7. A clean MiLB-specific new-stadium attendance bump — §16.1.
8. Makeup/psychological predictive validity — §16.2.
9. Indy-player exit and attrition rates for men never signed (from pass one, §-unassigned).
10. GM, analytics, coaching and player-development salaries in any reliable public document.

### 16.4 Source-reliability notes

· Third-party aggregators (Glassdoor, ZipRecruiter, RocketReach, Growjo) are algorithmic and were
  treated as low-reliability throughout. One Glassdoor figure for area scouts ($103,859) rests on
  n=4 and should not be used.
· One correction applied during review: the flagship weighted-ball study is in *Sports Health*
  2018;10(4):327–333, not AJSM.
· **Threshold that invalidates §15 wholesale:** the current CBA expires 2026-12-01. A 2027 CBA may
  reset arbitration, the pre-arb pool, service rules, and could introduce a salary cap. Gate every
  §15 constant behind a CBA-version flag now rather than retrofitting.
· **Recorded 2026-09-03.**

---

## 17. The front office — what an owner actually has authority over, and who's on staff

### 17.1 The load-bearing finding: at an affiliated MiLB club, "General Manager" is a business title

Jonathan Nelson, GM of the Birmingham Barons (a White Sox Double-A affiliate), on the record: **"A minor
league club's front office's primary function is business operations, while their major league
affiliate handles baseball operations."** MLB parent clubs supply the manager, the coaches, and the
players, and pay their salaries; the affiliate pays for travel, front-office overhead, and facility
contracts. Roster construction, call-ups, and every player transaction belong to the parent
organization, not the local club. T1 — futuresox.net (Nelson interview) and The Sports Advisory Group's
buyer's-guide series ("The 411" for acquiring a minor league / affiliated club) both state this
identically and independently.

**This is the single most important design constraint for the pass.** If the sim ever lets an owner buy
an *affiliated* minor-league club as a rung on the ladder, that owner should NOT get baseball-operations
authority over it — only the business side (ticketing, sponsorship, facility, promotions). Baseball
decisions for that club would need to come from wherever the sim's fictional MLB parent sits, which is
either a hole to design around or a reason to keep affiliate ownership off the ladder entirely and
route the climb through indy ball → MLB expansion/takeover only, skipping affiliate purchase as a
playable rung. **This is a decision for Jordan, not an assumption to bake in — flagged, not resolved,
in this pass.**

### 17.2 Independent ownership is the opposite: the owner (or their GM) really does run baseball ops

The Sports Advisory Group's companion piece on independent leagues: indy owners have **"much more say
in the day-to-day baseball operations of the Club"** than affiliated owners, and it is "not unusual
(but not essential) for Independent owners to wear several hats and be very much involved in the day to
day operations of their teams." There is no parent club to defer to — indy clubs sign, cut, and trade
their own players. T1/T2.

Read together with 17.1, this is exactly the shape of the ownership ladder already decided (indy ball
is the point of the game, the bottom rung is ownable, the world above it is backdrop): **the further
down the ladder, the more of the org an owner personally touches; the further up, the more of it is
delegated or, at the affiliate rung specifically, not under the owner's control at all.** That
delegation curve is itself a real, sourced game mechanic, not a difficulty slider invented for feel.

### 17.3 Business-side departments — well-documented as a pattern, not as one citable headcount

Across MiLB and indy club sites the same functional departments recur, consistently enough across dozens
of clubs to treat as an industry-standard pattern (T2, synthesis — not one single document): general
manager (business-side) or team president; assistant GM; director of ticket sales / box office manager;
director of corporate partnerships or sponsorship; director of marketing and promotions; director of
broadcasting or media relations; community relations manager; director of stadium operations /
facilities, with a head groundskeeper under it; merchandise manager. A minor-league GM's own description
of game-night reality (Nelson again): parking, concessions, ticket sales, umpire liaison, tarp crew, and
suite relations all land on one person's desk at the smaller end of the business. T1 for the anecdote,
T2 for the department list as a generalizable pattern.

### 17.4 Baseball-ops departments — mostly already sourced in §11–13, just not yet assembled as an org chart

The pieces exist scattered across the pending §11–13 append and don't need re-deriving: a scouting
department (scouting director, crosscheckers, area scouts — §11 of the Real-World doc, "GM &
Scouting"), a farm/player-development department (farm director, hitting/pitching coordinators — §12),
medical and strength-and-conditioning staff (§13's injury-burden and recurrence figures are the
empirical case for why this department matters at all), and an analytics/R&D function (implied by the
Trackman/Edgertronic infrastructure costs already logged in §12.4). This section doesn't re-source those
— it just names them as the shape a "baseball operations" tab would take **at the rung where the owner
actually has baseball authority** (indy ball, and a fully-owned MLB club), per 17.1–17.2.

### 17.5 Staff headcount and compensation — still not published, same finding as before

Searched directly this pass, specifically for MiLB/indy-scale figures (not MLB-scale, which the earlier
passes already covered in §11 "Staff and Front Office" of the Real-World doc). Nothing changed: no club
publishes front-office headcount, and the only compensation numbers available are algorithmic aggregator
estimates (Glassdoor, Payscale, ZipRecruiter, Salary.com) with no disclosed sample size or methodology —
the same category the project has already ruled low-reliability (§16.4 source-reliability notes). **Not
re-cited here for the same reason the Glassdoor n=4 scout figure wasn't used: a number with no
verifiable sample is not a T3 estimate, it's a guess wearing a number.** **Finding: not published,
confirmed on a second search pass.**

**Implication for the build:** staff cost and headcount are designer-tunable parameters, same treatment
as the affiliated-club P&L line items in §14.1 — expose them as assumptions, don't dress them as sourced
figures.

---

**Recorded 2026-09-04.**

---

# Part two — the realism-research sweep (2026-09-04)

Everything above (§1–17) is this project's original research. What follows (§18–24) is a separate,
later pass: a targeted sweep across seven domains the game's realism-focused rebuild specifically
needed and the original research never covered — component-specific player aging, Statcast-era pitch
and batted-ball modeling, a real defensive value system, platoon splits, the post-2023 baserunning
rules, and the NPB/KBO posting system. Run as 15 parallel research/verification agents (one research
pass per domain, one independent verification pass per domain's findings, then a synthesis pass), with
every verification pass an independent re-fetch or re-derivation against the primary source — not a
re-read of the research pass's own claim. Where verification found a claim wrong, it is recorded here
as a correction with the wrong figure named explicitly (so it is never re-cited by mistake), not
silently dropped. **Four of the highest-stakes figures below** (Yamamoto's exact posting fee, the 2023
MLB stolen-base total and success rate, Statcast's out-to-run conversion table, and the Barrel exit-
velocity/launch-angle definition) **were independently re-checked a second time**, outside the
workflow, before this merge — all four confirmed exactly. Same tier key as the rest of this document:
T1 = exact from a real document, T2 = within tolerance of a real distribution, T3 = a labelled estimate.

---

## 18. Development curves — component-specific aging (hitters, pitchers, defense)

*Researched and independently verified 2026-09-04. Question behind this pass: does age affect a player's individual tools — power, contact, discipline, speed, stuff — at different rates, or does the field still only publish an aggregate value curve? Answer: a scattered patchwork, several outlets giving materially different peak ages for the same metric. No single unified study exists (§18.5).*

### 18.1 Hitters — plate discipline and bat speed are the most rigorously aged components

Bill Petti's original FanGraphs decomposition (2012) remains the cleanest hitter finding in the literature: most **plate-discipline rates vary less than 3 percentage points from age 21 to 40**. The one big mover is **O-Contact%** (contact on pitches outside the zone), which falls **~5 points age 21→40**. Contact rate rises through **~age 29** then declines, pulled down by falling O-Contact%; swinging-strike rate turns upward from ~29. T1 — Bill Petti, "Hitter Aging Curves: Plate Discipline," FanGraphs, 2012-10-08. https://blogs.fangraphs.com/hitter-aging-curves-plate-discipline/

Companion work (Jeff Zimmerman, FanGraphs, 2013-12-13) established the still-cited era-adjusted baseline: era-adjusted wRC+ is **flat from debut through ~age 25–26**, then declines — no tool breakdown given, and a commenter explicitly requested one at the time (still unanswered in full — see §18.5). T1. https://blogs.fangraphs.com/hitters-no-longer-peak-only-decline/

Tom Tango's own bat-speed aging curve (Jan 2025, delta method with chaining — the same rigorous methodology as the classic series) is the first genuine **age-based decline curve for a physical bat-tracking tool**: bat speed is nearly flat ages 22–31 (**-0.02 mph/yr**), then falls much faster from 31 on (**-0.31 mph/yr**); league-average at age 26 is **71.1 mph**. Built on only ~1.5 seasons of bat-tracking data (since mid-2023), so the tails (n=6 at ages 21–22; Jordan Walker's +2.4 mph outlier) are noisy by the author's own admission. T2 — Tom Tango, "Aging Curve - Swing Speed," tangotiger.com, 2025-01-14. http://tangotiger.com/index.php/site/article/aging-curve-swing-speed

Ben Clemens (FanGraphs, 2025-02-13) is the direct caveat on how far bat-tracking-based aging conclusions can be trusted at the individual level: a player's own year-over-year change in bat speed (2023→2024) explained essentially nothing about his change in wRC+ (**r² = 0.03**). Gainers/losers: Gurriel +3.2 mph, Cowser +3.0 mph; Espinal -2.7 mph, Betts -2.1 mph. T1. https://blogs.fangraphs.com/early-notes-on-the-new-bat-speed-data-release/

### 18.2 Hitters — power's sub-skills age in opposite directions from each other

The most directly responsive new (2025) source: Travis Sawchik, for Driveline Baseball, splits "power" into physical and technique sub-skills that age in opposite directions.

| Sub-skill | Aging pattern | Tier |
|---|---|---|
| SLG | declines ~10 pts/season after 26 | T3 |
| Average exit velocity | declines from career start, no real peak | T3 |
| Max exit velocity | peaks ~26; decline accelerates at 31 | T3 |
| Bat speed | peaks 25; slow taper through 20s, steepens in 30s | T3 |
| Z-minus-O swing% (decision quality) | flat, gentle mid-career decline | T3 |
| Pull-Air% | the one metric that *improves* with age — approach compensating for lost raw power (e.g., Schwarber's age-32 career year) | T3 |

T3 — Travis Sawchik, "How power ages (It might surprise you)," Driveline Baseball, 2025-10-02. https://www.drivelinebaseball.com/2025/10/how-power-ages-it-might-surprise-you/

An independent (2026-07-31), pseudonymous Japanese sabermetrics blog (鯖茶漬/"Saba Chazuke" — not a SABR publication despite the URL slug) ran a larger sample (n=3,204 players, 2000–2025) incorporating bat-tracking data and got broadly consistent, if not identical, peak ages: OBP/SLG ~27, K% (best) ~27, BB% ~29, ISO ~28, contact% ~26–27, maxEV ~28, bat speed ~28, Fast-Swing% ~27 — while Squared-Up% and Ideal Attack Angle% (technique metrics) **keep rising into a player's 30s**. T3, corroborating data point only — no verifiable institutional affiliation or peer review. https://note.com/nana_metrics/n/nf8e2d361540e

Older but foundational: Peter L'Oiseau's Statcast EV aging curve (2015–2019 data) puts exit-velocity peak at **age 29**, with launch angle rising **monotonically** with age across the whole career span studied. T2 — The Hardball Times/FanGraphs, 2019-07-25. https://tht.fangraphs.com/creating-aging-curves-for-statcast-metrics/

### 18.3 Speed and defense peak earliest; pitcher components peak in a defined order

Speed is the earliest-peaking physical tool, by exact figures now nearly a decade old and never re-run: **78.5%** of qualified players age ≤27 have above-average Sprint Speed (27 ft/s), vs. **47.5%** at 28–32, vs. just **15.2%** at 33+; decline runs roughly **1 in/sec per year** from debut on. T1 — Mike Petriello, MLB.com, 2017. https://www.mlb.com/news/statcast-sprint-speed-shows-speed-peaks-young-c239376598

Defense: Sports Info Solutions (Mark Simon, in *The Fielding Bible Vol. V*, 2020-05-08) finds DRS peaks **age 25–26** with a sharper drop after 30 — illustrative curve: +5 DRS at 25 → +3 at 30 → 0 at 34. T2. https://www.sportsinfosolutions.com/2020/05/08/a-closer-look-at-defensive-aging-curves/ A newer (2025-12-15), position-specific OAA study for center fielders (all qualified CF seasons since 2016) finds the same shape at the position level: OAA peaks **age 25**, plateaus **28–30**, then declines further. Fan-blog source (Lookout Landing), named byline unconfirmed — T3. https://www.lookoutlanding.com/the-more-you-know/137519/julio-rodriguez-and-centerfielder-aging

Pitchers, per the 2012 FanGraphs series (Zimmerman/Petti), still cited today as the field's most precise component breakdown, old or new:

| Component | Finding | Tier |
|---|---|---|
| Fastball velocity, average pitcher | **-4 mph, age 21→38** | T1 |
| Fastball velocity, velocity-maintainers | only **-0.3 mph** over the same span; peak years 25–30 | T1 |
| Walk rate | improves to **~24**, then flat | T1 |
| Starters' K/9 | flat until **~32** | T1 |
| Relievers' K/9 | declines from **31**; loses 2+ K/9 by 34 (starters don't hit that loss until 39) | T1 |
| Starters' BB/9 | stays within ±1.0 of peak the whole career | T1 |
| Relievers' BB/9 | rises from the outset, full increase reached by **30** | T1 |
| FB velocity by cohort age (2002–11 sample) | **91.1 mph (age 24) → 89.4 mph (age 34)** | T1 |
| Pitcher attrition (failure to reach 40 IP next year) | spikes **age 25–27** and **34–39**, especially after a velocity drop | T1 |

Source: Jeff Zimmerman, "Pitcher Aging Curves: Maintaining Velocity" (2012-05-09); Bill Petti, "Pitcher Aging Curves: Starters and Relievers" and "Velocity Decline and Pitcher Attrition by Age" (2012), all FanGraphs. https://blogs.fangraphs.com/pitcher-aging-curves-maintaining-velocity/ ; https://blogs.fangraphs.com/pitcher-aging-curves-starters-and-relievers/

A secondary physical trait — spin rate — declines much slower, proportionally, than velocity: across a modeled age 21→36 span, four-seam velocity fell **~1.8 mph** while spin fell only **~18.8 rpm** cumulatively; two-seam spin fell faster (**-105.9 rpm by 33**). Case study built on Rich Hill's own tracked pitches (4-seam spin 2,316→2,470 rpm, 2015→17; curveball 2,682→2,798 rpm). T1 — Travis Sawchik, "Rich Hill Has a Theory About Spin and Aging," FanGraphs, 2018-03-27. https://blogs.fangraphs.com/rich-hill-has-a-theory-about-spin-and-aging/ **No study has re-run this using post-2021 (sticky-substance-crackdown) or post-2023 data — see §18.5.**

### 18.4 Methodology: naive aging curves overstate decline, and cross-league work still isn't component-level

Peer-reviewed (Journal of Sports Analytics 10 (2024), 77–85): a two-level multiple-imputation mixed model correcting for survivorship/dropout bias finds **naive delta-method aging curves systematically overstate decline** — players who stop appearing in the league are implicitly assumed by a naive curve to have performed at the population average, when in fact they were already declining faster. T1 — Quang Nguyen & Gregory J. Matthews. Studies only aggregate offensive value, not components. https://journals.sagepub.com/doi/10.3233/JSA-240744

SABR Analytics Conference 2023 (John Asel & Jeremy Losak) computed and compared aggregate batter aging curves across MLB, KBO, and NPB — Lahman/Baseball-Reference, 1982–2022, **27,682 player-seasons** (16,694 MLB / 6,487 NPB / 4,501 KBO) across **5,157 players**. T1. Again aggregate, not component-level. https://sabr.org/analytics/presentations/2023

A commonly-cited 2024 SABR Analytics Conference award winner, Patrick Dubuque's "The Other Aging Curve" (Baseball Prospectus, 2023-01-31), is a literary essay with **zero quantitative aging data** despite the title — flagged explicitly because it surfaces prominently in searches and could be mistaken for a data source. T1. https://www.baseballprospectus.com/news/article/80052/cold-takes-the-other-aging-curve/

### 18.5 Not published / could not verify

- **FanGraphs Sabermetrics Library glossary ("Aging Curve" entry) claim that walk rate peaks ~37 and ISO peaks ~34 — REFUTED.** The live page contains neither figure; it states only that "defense and running peak early" and decline starts "around 30." A companion FanGraphs Library page ("Beginner's Guide to Aging Curves") gives materially different, lower figures instead: **walk rate peaks 28–32, ISO holds on until 30.** Do not cite the 37/34 figures for anything. https://library.fangraphs.com/principles/aging-curve/
- **Pitcher secondary-pitch-quality aging (Stuff+/PitchingBot vs. age):** no dated, named-author publication decomposes pitcher aging by pitch-quality-model output as a function of age, separate from raw velocity. Searched specifically for work by PitchingBot's creator; none found.
- **Arm strength (throwing velocity) aging curve:** Statcast has published Arm Strength since 2020, but no dedicated age-decline curve for infielder/outfielder/catcher arm strength exists anywhere in the public record.
- **Post-2021 spin-rate-decay-by-age, re-baselined for the sticky-substance crackdown:** the only spin-vs-age analysis (Sawchik/FanGraphs 2018, §18.3) predates the 2021 enforcement that materially changed league spin rates. No re-derivation exists.
- **Minor-league year-over-year improvement deltas by age:** re-confirms this project's prior two passes from an independent angle — no rigorous, quantified, age-bucketed table exists on FanGraphs, Baseball Prospectus, Baseball America, SABR, or in the 2023–24 academic literature.
- **A single unified, component-by-component aging study** (all five hitter tools + all three pitcher components, one methodology) does not exist. What exists is a scattered patchwork — plate discipline in one FanGraphs article, power in a different Driveline article, speed in a Statcast glossary post, defense in an SIS/fan-blog post, bat speed in a Tom Tango blog post, spin in an 8-year-old Sawchik article — from different authors, samples, and outlets, several giving **materially different peak ages for the same metric** (bat speed peak reported as 25, 28, or "flat 22–31 then declining" by three different 2025–26 sources). Any aggregation for this project's sim necessarily reconciles inconsistent independent estimates rather than citing one authoritative table.

**Recorded 2026-09-04.**

---

## 19. Statcast pitch modeling — velocity, movement, Stuff+/PitchingBot, MiLB comparison

*Researched and independently verified 2026-09-04, including direct reproduction of several self-computed leaderboard aggregations against live Baseball Savant CSV exports.*

### 19.1 2025 league-wide pitch characteristics, by pitch type

Self-computed, pitch-count-weighted from Baseball Savant per-pitcher CSV exports (min 50 pitches of that type), **independently reproduced to the decimal** during verification:

| Pitch | Velo (mph) | Spin (rpm) | IVB (in) | HB (in, magnitude) |
|---|---|---|---|---|
| Four-seam (FF) | 94.5 | 2,324 | +15.8 | 7.8 |
| Sinker (SI) | 93.8 | 2,189 | +7.4 | 15.2 |
| Cutter (FC) | 89.7 | 2,415 | +8.2 | 2.5 |
| Slider (SL) | 86.3 | 2,431 | +1.9 | 4.2 |
| Curveball (CU) | 80.2 | 2,581 | -10.1 | 8.7 |
| Changeup (CH) | 85.8 | 1,799 | +4.5 | 14.4 |
| Splitter (FS) | 86.5 | 1,375 | +3.4 | 11.2 |

T1. Baseball Savant "Pitch Movement" and "Spin Direction/Pitches" leaderboards, 2025 season. https://baseballsavant.mlb.com/leaderboard/pitch-movement

League-wide season total: four-seam averaged **94.5 mph / 2,322 rpm** (record spin), up from 94.2/2,283 in 2023 and from 91.9 mph at the start of Statcast tracking (2008). RHP four-seamers hit 95.0 mph for the first time; RHP relievers 95.6 mph. **3,700 pitches ≥100 mph** thrown in 2025 (up from 3,321 in 2024). T1 — AP wire, published 2025-09-30. https://www.foxsports.com/articles/mlb/flamethrowers-rule-mound-as-righthander-average-4seam-fastball-reaches-95-mph

### 19.2 2025 outcome quality by pitch type

Self-computed, pitch-count-weighted (arsenals ≥100 pitches), **independently reproduced exactly** during verification:

| Pitch | Whiff% | wOBA-against | xwOBA-against | Hard-Hit% | Put-Away% |
|---|---|---|---|---|---|
| FF | 21.6 | .339 | .343 | 46.6 | 18.1 |
| SI | 13.9 | .349 | .343 | 44.8 | 18.3 |
| FC | 22.3 | .353 | .347 | 39.1 | 17.3 |
| SL | 33.3 | .296 | .289 | 37.1 | 20.8 |
| CU | 32.5 | .291 | .276 | 37.5 | 20.4 |
| CH | 31.1 | .283 | .283 | 33.1 | 18.2 |
| FS | 34.5 | .263 | .254 | 34.6 | 20.8 |

T1. Baseball Savant "Pitch Arsenal Stats," 2025. https://baseballsavant.mlb.com/leaderboard/pitch-arsenal-stats. Chase rate (O-Swing%) by pitch type was not found published or cleanly exportable — see §19.5.

### 19.3 Stuff+/Location+/Pitching+ and PitchingBot — a scale, not a design tool

Stuff+/Location+/Pitching+ (FanGraphs-hosted, built by Eno Sarris/Max Bay/Owen McGrattan) scale like wRC+, **100 = average**, 10 points = 1 SD at the pitch level. Season-level SD: Stuff+ **12.16 (SP) / 17.02 (RP)**; Location+ **3.34 / 5.87**; Pitching+ **4.94 / 6.61**. Reliability thresholds: Stuff+ readable after **~80 pitches**, Location+ needs **~400**. Per-pitch-type Stuff+ baselines differ (a known architecture quirk — breaking balls score systematically higher): FF 99.2±18.3, SI 92.5±13.6, SL 110.8±15.6, CU 105.5±16.8, CH 87.2±16.4. T1 — FanGraphs Sabermetrics Library, "Stuff+, Location+, and Pitching+ Primer," originally 2023-03-10, live-maintained. https://library.fangraphs.com/pitching/stuff-location-and-pitching-primer/

PitchingBot (Cameron Grove, FanGraphs-hosted) instead speaks natively in the **20-80 scouting scale** — 50 = average MLB, 10 points = 1 SD — with three grades (Overall/Stuff/Command). Stuff uses only physical characteristics; Command uses only location/count. The model deliberately restricts its Stuff predictions to swing events (whiffs, fouls, balls in play), excluding called strikes as location-dominated. T1. https://library.fangraphs.com/pitching/pitchingbot-pitch-modeling-primer/ **This is the one major public model that already speaks 20-80 natively — useful if the sim wants to drive pitch quality off that scale directly — but it publishes no reverse table from grade to raw Statcast numbers (§19.5).**

A single-analyst FanGraphs RotoGraphs piece (2023-05-05) fit an exponential regression converting season Stuff+/PitchingBot grades to expected ERA on 2021–22 data (min 40 IP): PitchingBot→ERA = 22.697·e^(-0.035·grade), r²=.992; Stuff+→ERA = 49.19·e^(-0.025·grade), r²=.996. Reference points: Stuff+ 135/PitchingBot 78 ≈ 1.50 ERA … Stuff+ 96/PitchingBot 50 ≈ 4.00 ERA. Author flags the model as "black box" and not guaranteed to hold as the league's velocity/spin environment keeps shifting (it already has, per §19.1). T2. https://fantasy.fangraphs.com/referencing-pitch-quality-models-to-more-traditional-stats/

Driveline's own team (2024-05-31), revisiting its public Stuff+ model, states explicitly that pitch-type Stuff+ scores "can only be compared directly within their respective categories" — it is a relative ranking tool, not a design-prescription tool. Velocity is the dominant lever for breaking-ball Stuff+; sinkers outscore four-seams up to roughly 97 mph. **No formula exists anywhere for converting a target Stuff+ number into a velocity+spin+movement combination.** T2. https://www.drivelinebaseball.com/2024/05/revisiting-stuff-plus/

Baseball Savant itself has **no native branded Stuff+-style grade** — confirmed directly against its own CSV schema (run_value, woba, xwoba, whiff_percent, put_away, hard_hit_percent — no physical-characteristics composite field). Stuff+/Location+/Pitching+/PitchingBot are independently-built, third-party models FanGraphs hosts, not Savant products. T2.

Elite real-world anchor: Jhoan Duran's "splinker" (~99–101 mph) graded **142 Stuff+** in 2022, 2nd-highest among qualifying splitters (min 50 IP) — roughly +2.3 SD above the FF/SI baseline. T2 — FanGraphs, 2023-04-14. https://blogs.fangraphs.com/is-jhoan-duran-getting-even-nastier/

### 19.4 20-80 velocity anchors have drifted upward; MLB vs. MiLB (2021-23)

20-80 fastball-velocity anchor points are informal and drift: FanGraphs' 2014 primer set 50=90-91 mph, 80=97 mph; a 2026 informal recap instead anchors 50=92-93 mph, 80=99-100+ mph. Neither is a current, vetted, comprehensive institutional chart — the instability is itself the finding: there is no single authoritative 20-80→velocity table. T3 (the 2014 chart alone would be T2 but is stale; the 2026 recap is an unvetted Substack). https://blogs.fangraphs.com/scouting-explained-the-20-80-scouting-scale/ ; https://dodgersafterduty.substack.com/p/understanding-the-2080-scouting-scale

The most substantive MLB-vs-MiLB pitch-characteristics comparison found, level by level, combined 2021–23 Statcast data:

| Metric | MLB | Triple-A | Single-A |
|---|---|---|---|
| FF/SI velocity | 93.7 | 92.7 | 91.1 |
| Rate of FF/SI ≥95 mph | 32% | 19% | 11% |
| Whiff rate on ≥95 mph | 23% | 25% | 29% (inverse of the velocity gap) |
| Curveball IVB | -9.6 in | -8.2 in | -6.0 in |
| Whiff rate vs. curveball | 32% | 34% | 37% |
| Sliders w/ ≥12in HB (2023 only) | 26% | 25% | 16% |
| Hard-hit rate (batters) | 39% | 36% | 31% |
| Avg HR distance | 400 ft | 396 ft | 386 ft |

T1 — Mike Petriello, MLB.com/Baseball Savant, 2024-03-17. **Coverage caveat, stated directly in the source:** Triple-A = all 2023 + PCL/Charlotte home games 2022; Single-A = only the 8 Statcast-enabled Florida State League parks since 2021; **no Double-A data at all**; High-A/Low-A outside those 8 FSL parks not covered; no newer (2024–25) refresh exists. https://www.mlb.com/news/minor-league-statcast-data-compared-to-mlb

Individual 2025 Triple-A pitch examples (illustrative outliers, not level averages — a mid-season feature, not a systematic study): a **97.3 mph / 2,575 rpm** four-seamer (highest among 146 qualifying Triple-A four-seam throwers); a 98.0 mph four-seamer; a 95.2 mph sinker with 16.9in of arm-side movement; sweepers at 79.3 mph/3,001 rpm and 82 mph/14.1in gloveside/2,728 rpm; a 77.4 mph/3,086 rpm curveball (highest curve spin among 10+-curve throwers); an 83.8 mph/1,194 rpm changeup. T3 — MLB.com (Sam Dykstra), 2025-05-21. https://www.mlb.com/news/statcast-triple-a-best-pitches-2025

### 19.5 Not published / could not verify

- **No official formula or tool converts a single 20-80 stuff grade into a full pitch-type Statcast target set** (velocity + spin + horizontal/vertical movement together). Public models are explicitly comparative/diagnostic within a pitch type, not generative (Driveline's own team says so directly, §19.3). Any such mapping this project uses will have to be authored/assumed, not sourced.
- **A dated, sourced 2025 chase-rate (O-Swing%) breakdown by pitch type** — not located, though the rest of §19.2's table was.
- **Any current (2024/2025) refresh of the MLB-vs-MiLB level comparison** — the one substantive comparison (§19.4) is 2021–23 combined; nothing newer found.
- **Public Statcast pitch-tracking data for Double-A, High-A, or Low-A** (outside 8 specific FSL Single-A parks) — explicitly confirmed absent as of the source's 2024-03-17 publication.
- **A pre-aggregated public leaderboard of league-average velocity/spin/movement by pitch type for Triple-A or any MiLB level**, analogous to Savant's MLB leaderboards. A raw pitch-level "Statcast Search - Minors" tool exists and could in principle be aggregated the same way §19.1's table was built, but no such aggregate exists today, and building one was out of scope for this pass.
- **A current, single, authoritative, dated 20-80 fastball-velocity chart** — the two data points found (stale 2014 FanGraphs, informal 2026 Substack) do not constitute one.

**Recorded 2026-09-04.**

---

## 20. Batted-ball quality — Statcast exit velocity, launch angle, barrels, bat speed

*Researched and independently verified 2026-09-04. Most figures below were self-computed from Baseball Savant's raw Statcast Search CSV export and independently reproduced during verification by a second, from-scratch pull of the same public endpoint — as close to primary-source confirmation as this kind of derived statistic gets. The Barrel exit-velocity/launch-angle definition in §20.2 was independently re-checked a second time outside the workflow before this merge — confirmed exactly.*

### 20.1 2025 league-wide exit velocity and launch angle distributions

Full 2025 regular season, n≈124,441–124,887 batted-ball events (population-level, not the per-player leaderboard averages Baseball Savant itself publishes — no Savant page publishes this percentile table directly; both distributions below were derived from the raw event-level export and reproduced independently to the decimal).

**Exit velocity (mph):** mean **88.8**, median **91.9**, SD **15.1**. Percentiles: p1=38.2, p5=60.9, p10=68.8, p25=80.4, p50=91.9, p75=100.0, p90=105.1, p95=107.4, p99=111.1, max observed=122.9.

**Launch angle (°):** mean **13.1**, median **14.0**, SD **28.8**. Percentiles: p1=-63, p5=-36, p10=-22, p25=-5, p50=14, p75=31, p90=50, p95=62, p99=78.

T1 both. https://baseballsavant.mlb.com/statcast_search/csv

### 20.2 Barrels, hard-hit, and the quality-of-contact bucket table

Statcast's Barrel rule: a batted ball barrels when its EV/LA combination has historically (since 2015) produced a minimum **.500 AVG / 1.500 SLG**. Minimum EV to ever qualify is **98 mph**; at 98 mph the qualifying LA window is 26°–30°, widening ~2–3°/mph up to 116 mph, where any LA 8°–50° qualifies. Realized outcome in 2016 was far above the definitional floor: **.822 AVG / 2.386 SLG**. T1 — MLB.com Glossary, "Barrel." https://www.mlb.com/glossary/statcast/barrel

**2025 league barrel rate: 8.63%** of batted balls (10,737/124,439), using Statcast's own internal quality-of-contact classification field (not an approximation of the rule). T1, independently reproduced exactly.

Full six-bucket breakdown, 2025, actual wOBA vs. Statcast's own xwOBAcon:

| Category | Share | Actual wOBA | xwOBAcon |
|---|---|---|---|
| Weak | 4.4% | .209 | .166 |
| Topped | 30.3% | .184 | .162 |
| Under | 25.8% | .075 | .081 |
| Flare/Burner | 24.4% | .638 | .626 |
| Solid Contact | 6.5% | .517 | .554 |
| Barrel | 8.6% | 1.192 | 1.181 |

T1, independently reproduced exactly. Close agreement between actual and xwOBAcon per bucket validates the categorical field's predictive power — directly usable as a simplified 6-bucket contact-quality-to-outcome table.

**Hard-hit rate (EV ≥95 mph): 41.05%** of batted balls in 2025. MLB's own stated rationale for the threshold: hard-hit balls have historically produced **.524 AVG / 1.047 SLG / .653 wOBA**, vs. **.219 / .259 / .206** below it — 95 mph is where EV starts to reliably "matter." T1 both. https://www.mlb.com/glossary/statcast/hard-hit-rate

Launch-angle batted-ball buckets: ground ball <10°, line drive 10°–25°, fly ball 25°–50°, popup >50°; Sweet Spot (best hit-production zone) = **8°–32°**. T1 — MLB.com Glossary. https://www.mlb.com/glossary/statcast/launch-angle

### 20.3 xwOBA is a lookup, not a formula — and a self-derived EV×LA grid to fill the gap

xwOBA/xwOBAcon is a **nonparametric empirical lookup**: exit velocity + launch angle (plus, since 2019, seasonal Sprint Speed on weakly-hit/topped balls) against the historical wOBA outcome of comparable batted balls since 2015 — not a closed-form regression equation. T1 — MLB.com Glossary, "Expected Weighted On-base Average." https://www.mlb.com/glossary/statcast/expected-woba **No public, downloadable EV×LA bin table with explicit boundaries and wOBA values exists** — confirmed against Baseball Savant's own CSV field-documentation page, which is a data dictionary, not a lookup table. https://baseballsavant.mlb.com/csv-docs

Self-derived replacement (5 mph × 10° bins, actual wOBA, 2025, n≥100/cell, independently reproduced exactly): 100mph/20°→n=3,509, wOBA=**.996**; 100mph/30°→n=2,090, **.975**; 105mph/20°→n=2,157, **1.604**; 90mph/10°→n=2,274, **.719**; 90mph/30°→n=2,226, **.099**; 75mph/10°→n=1,025, **.656**; 75mph/30°→n=877, **.102**; 60mph/60°→n=123, **.000**. Shows the standard pattern: wOBA rises steeply with EV inside the 5°–30° LA band and collapses above ~40°–45° or below 0° regardless of EV. T1.

2025 wOBA-on-contact sanity bound: actual mean **.376** vs. Statcast's own xwOBAcon mean **.369** (n=124,887) — a ~2% gap even for Statcast's own model, a reasonable bound for how tightly a sim's EV/LA-derived xwOBA should be expected to track outcomes. T1.

### 20.4 Bat speed — measurement, league distribution, and its (moderate) relationship to exit velocity

Squared-up (≥80% of theoretical max EV for that swing's bat speed and the pitch's speed) and Blast ([squared-up% × 100] + bat speed ≥164, i.e., the average of the two ≥82) are officially defined; "fast swing" = bat speed ≥75 mph. T1 — MLB.com Glossary. https://www.mlb.com/glossary/statcast/squared-up ; https://www.mlb.com/glossary/statcast/bat-tracking-blasts Bat speed is measured at the bat's sweet spot, and a season average is the mean of a hitter's fastest 90% of competitive swings — plausible but not independently re-confirmed from a live page fetch (the MLB.com bat-speed glossary page would not render its body to either fetch attempt). T1, plausible.

**2025 league bat speed, PA-weighted: 71.7 mph** (537 hitters ≥50 PA; unweighted mean 71.5, median 71.6, SD across hitters **2.6 mph**; range 62.5–80.6). T1, independently reproduced exactly. MLB.com's own 2024 reporting gives a very close **72 mph** league average and the same 75+ mph fast-swing threshold — the league average appears essentially flat year over year. T1 — leaders: Stanton 80.6, Cruz 77.7, Schwarber 77.0, Chapman 76.9, Acuña/Morel 76.7, Judge 76.5, Adell 76.3, Rodríguez 76.2, Soto 76.1. https://www.mlb.com/news/mlb-bat-speed-leaders-for-2024

**Per-swing (not per-hitter) 2025 distribution is much wider,** as expected: n=119,495 swings, mean **71.1**, median **71.9**, SD **7.35 mph** (p1=49.6, p5=61.6, p10=64.5, p25=68.4, p75=75.1, p90=77.8, p95=79.6, p99=83.3; range 1.0–88.0). A sim modeling swing-to-swing noise should use the **7.35 mph SD**, not the 2.6 mph hitter-to-hitter SD. T1, independently reproduced exactly. Swing length, same population: mean **7.17 ft**, median 7.2, SD **0.84 ft**. T1.

Bat speed's correlation with EV is only moderate and shrinks at finer grain:
- Player-season level (FanGraphs/Podhorzer, 2024-05-20, 2024 partial season): **r = 0.575**. Other correlations with HR/FB rate in the same piece: Barrel% .737, HardHit% .579, Avg EV .535, Blast-per-contact .528, Avg Bat Speed .437, Fast-Swing-Rate .434, Max EV .372 — author's conclusion: bat-tracking metrics add "no additional value" over existing EV/Barrel/HardHit measures for predicting power. T2. https://fantasy.fangraphs.com/correlation-fun-with-statcasts-new-bat-tracking-data/
- Swing level, pooled, full 2025 season: **r = 0.464** (r²=0.215, n=119,088). OLS: EV ≈ 0.94 × bat_speed + 21.8 mph. T1, independently reproduced exactly.
- Split by quality-of-contact category, 2025: average bat speed rises monotonically from Weak (57.7 mph) through Barrel (74.9 mph) contact, but the within-category correlation stays only moderate (Weak r=.705 down to Topped/Under r≈.23, back up to Barrel r=.464). **Design implication: model bat speed as shifting the probability distribution over contact-quality tiers, not as a direct linear multiplier onto EV** — timing/contact quality within a bat-speed tier explains most of the swing-to-swing EV variance. T1, independently reproduced exactly.

Launch-angle "tightness" (a hitter's own within-season LA consistency, indexed league-wide, distinct from the full-population LA spread in §20.1): SD ran 25.3° (2017) / 25.1° (2018) / 25.0° (2019) / **28.5° (2020)**, the 2020 spike attributed to the Hawk-Eye transition capturing previously-untracked batted balls. T2 — FanGraphs/Chamberlain citing Connor Kurcon, 2020-11-23. https://fantasy.fangraphs.com/a-needed-update-on-launch-angle-tightness/

### 20.5 MiLB batted-ball data: real, searchable, uncalibrated

Baseball Savant's Minor League Statcast Search tool is real and functions (level/org/team/park filters); Triple-A coverage runs since 2023, with PCL/Charlotte since 2022 and the Florida State League since 2021. T1. https://baseballsavant.mlb.com/statcast-search-minors One independent, non-peer-reviewed analysis (2023-03-04) comparing MLB vs. PCL/Triple-A exit velocity found MLB parks averaging **86.6–87.6 mph** vs. PCL/AAA parks at **90.4–91.7 mph** — Triple-A reading ~4 mph *higher* than MLB despite lower-skill hitters, while fastball pitch velocity matched closely between levels (~0.25 mph gap) — strongly suggesting a **bat-tracking/sensor calibration artifact** (Trackman vs. Hawk-Eye), not a real physics difference. All 80 hitters sampled who played both levels in 2021–22 recorded higher EV in the minors. T3 — MLB Data Warehouse Substack, Jon A. No newer (post-full-Hawkeye-rollout) validation exists. **Do not treat MiLB Statcast EV/LA figures as directly comparable to MLB figures without independent validation.** https://www.mlbdatawarehouse.com/p/studying-milb-statcast-exit-velo

### 20.6 Not published / could not verify

- **The commonly-repeated "each +1 mph of bat speed adds ~1.2 mph of exit velocity on squared-up contact" figure could not be traced to any primary MLB/Statcast source** despite targeted searching — appears to be informally circulated derivative content. This project's own pooled swing-level slope (0.94 mph EV per mph bat speed, all contact, §20.4) is in the same ballpark but is a different measurement. Do not cite the "1.2" figure as fact.
- No official population-level percentile table for raw EV/LA is published as a static document by Savant/MLB — everything in §20.1 had to be derived from the raw event-level export.
- No downloadable, official EV×LA→wOBA bin table exists; §20.3's grid is this project's own reconstruction.
- No official league-average-by-MiLB-level batted-ball-quality comparison exists (barrel rate, EV, LA by AAA/AA/High-A/Low-A); the raw per-pitch minors search tool exists but nothing pre-aggregated does.
- No current (2024/25) validation of MiLB Statcast calibration against MLB post-full-Hawk-Eye-rollout; the one relevant study (§20.5) is from 2023 and flags likely sensor-calibration bias, unresolved.
- The MLB.com bat-speed glossary page would not render body content to either fetch attempt in this pass; its cited figures (§20.4) rest on search-indexed snippets, not a confirmed raw-page read.

**Recorded 2026-09-04.**

---

## 21. Defensive value units — OAA, DRS, Fielding Run Value, and the missing 20-80 bridge

*Researched and independently verified 2026-09-04. Central question: does a 20-80-style defensive grade exist anywhere in the public record, tied to OAA/DRS the way offensive grades tie to wRC+? It does not, in the current Statcast era — see §21.4. The out-to-run conversion table in §21.1 was independently re-checked a second time outside the workflow before this merge — confirmed exactly.*

### 21.1 The one real, published conversion: OAA → Fielding Run Value → WAR

Statcast's own, official conversion of outs to runs (Fielding Run Value): **1 out = 0.9 run for outfielders, 0.75 run for infielders.** Catcher components: blocking 1 saved block = 0.25 run; framing 1 saved strike = 0.125 run; throwing 1 SB prevented = 0.65 run; fielder throwing runs convert 1:1. T1 — MLB.com/Baseball Savant Statcast Glossary, "Fielding Run Value." https://baseballsavant.mlb.com/leaderboard/fielding-run-value

This is the real answer to "how does OAA become WAR": OAA-derived Fielding Runs Prevented replaced UZR's range component in FanGraphs WAR, retroactive to 2016 (UZR's ARM and Double-Play-Runs components similarly replaced by Statcast-sourced equivalents). No single defense-specific "points per win" shortcut exists beyond this out→run step and the standard ~10 runs = 1 win rule used elsewhere in WAR. T1 — FanGraphs, "A FanGraphs WAR Fielding Update" / "2024 FanGraphs WAR Update." https://blogs.fangraphs.com/a-fangraphs-war-fielding-update/

FanGraphs' Def component (includes positional adjustment) has a published 7-tier verbal scale, not framed as 20-80: Excellent +20, Great +12, Above Average +4, Average 0, Below Average -4, Poor -12, Awful -20 (Def runs). T2 — FanGraphs Sabermetrics Library, "Def." https://library.fangraphs.com/defense/def/

### 21.2 Why single-season defensive metrics resist a 20-80 grade: reliability

The load-bearing modern (2023) finding for why defense doesn't behave like offense on a 20-80 scale: **year-to-year (Spearman) reliability for team-changing players, 2016–2022, is OAA 0.31, DRS 0.23, UZR 0.15, FRAA 0.12**, vs. Baseball Prospectus's new RDA at **0.43**. Restricted to the Hawk-Eye era (2021–22) only: OAA 0.22, DRS 0.23, UZR 0.16, FRAA 0.11, RDA 0.57. T1 — Jonathan Judge, Baseball Prospectus, "Introducing Range Defense Added," 2023-02-08. https://www.baseballprospectus.com/news/article/80209/prospectus-feature-introducing-range-defense-added/ A 20-80 grade implies a stable true-talent point estimate; single-season OAA/DRS/UZR explain roughly (0.31² ≈) **10% of year-to-year variance** — too noisy to support that without multi-year aggregation.

Older SD benchmark, never re-run on current data: OAA/1000 innings SD ≈10 (2016)/≈9 (2017) for outfielders; UZR range component (RngR)/1000 SD ≈8 (2016)/≈6 (2017) — OAA's year-to-year R² substantially exceeds UZR range's. T2 — FanGraphs, 2018-01-10. https://blogs.fangraphs.com/statcasts-outs-above-average-and-uzr/

Baseball Prospectus's newest defensive work (RDA/DRP) was built specifically to raise reliability above OAA/DRS/UZR/FRAA (table above); a 2025-06-26 follow-up ("All the Range: An Update to Infield RDA" — an earlier draft of this research mis-dated it 2023-24) stays focused on reliability and coverage, not on building a scouting-grade bridge. The field's current research frontier is not aimed at the 20-80 conversion problem. T2. https://www.baseballprospectus.com/news/article/99395/all-the-range-an-update-to-infield-rda/

### 21.3 2025 season figures

Statcast Fielding Run Value / catcher framing, 2025 (directly re-pulled and reproduced): **Patrick Bailey (SF) led all catchers and all fielders at +25.05 framing runs**, 8.4 runs ahead of 2nd place (Alejandro Kirk, +16.66); Bailey also led with 120 called-strikes-above-expectation. Worst qualified: **Edgar Quero (CWS) at -12.90**; Logan O'Hoppe (LAA) also bottom-tier (-8.23). T1. https://www.mlb.com/news/patrick-bailey-catcher-framing-fielding-run-value

DRS full-season 2025 leaders check out at 9 of 10 named positions (1B Olson 17, 2B Hoerner 17, 3B Hayes 19, SS Betts/Walls tied 17, LF Kwan 22, CF Rafaela 20, C Bailey 19, P Fried 10, multi-position Kwan/Clement tied 22); best single-season DRS values cluster **15–22**, consistent with the "15-20 = elite" rule of thumb repeated across secondary explainers (no codified DRS-to-grade table is published by SIS itself). T1/T2. https://www.sportsinfosolutions.com/2025/10/23/the-2025-fielding-bible-awards-winners/ (RF was NOT Tatís — see §21.5.)

Historical framing range (plausible, not independently pinned to a primary pull): Elias Díaz posted -18.78 framing runs in an All-Star season, used as the league-worst-outlier anecdote — this figure independently corroborates. Tyler Stephenson's cited -9 in 2023 does not cleanly match this pass's search results (-4.9 framing / -11 total FRV found instead) — treat the Díaz figure as the more solid of the two. T3.

### 21.4 The 20-80 defensive grade does not exist for the Statcast era — two 2013 attempts are the closest thing published

Two FanGraphs pieces built the only defensive 20-80 conversion tables ever published, both **12-13 years old and built on UZR** (a metric FanGraphs itself has since de-emphasized in favor of OAA-derived Fielding Runs Prevented):

- Mark Smith's UZR/150 z-score table (2013-02-19): 80=+22.8 UZR/150 (z=3 — "there are no 80 defenders in the game," no player actually reaches it), 70=+15.7 (Adrian Beltre), 60=+8.7, 50=+1.6, 40=-5.4, 30=-12.5, 20=-19.6 (z=-3 also unreached). T2. https://blogs.fangraphs.com/the-20-80-scale-sabr-style/
- Carson Cistulli's grade↔Def-runs↔WAR table (2013-11-05): 20=-30 Def/-1.2 WAR … 50=0/2.0 … 80=+30/5.2 WAR, roughly **1.1 WAR per 10 grade points**. T2. https://blogs.fangraphs.com/the-20-80-scouting-scale-translated-to-wins/

Both are instructive for *why* nobody has redone this with OAA/DRS/FRV since: Smith found the **realized distribution doesn't actually populate the 80/20 tails** the way a Gaussian z-score model assumes — elite-glove/weak-bat defenders don't get full-time playing time (selection bias), and the metric itself is too noisy. A companion Smith piece built 20-80 tables for wRC+, WAR/600, OBP, wOBA, and FIP but explicitly left fielding out, calling it a "whole player" metric problem. T2. FanGraphs' own current, canonical 20-80 scouting explainer (Kiley McDaniel, 2014, still linked as of 2026) gives hard numeric anchors for fastball velocity, batting average, HR, times-to-first, and 60-yard dash — and **nothing numeric for fielding**, folding "range, hands, instincts" into a qualitative grade instead. T2. https://blogs.fangraphs.com/scouting-explained-the-20-80-scouting-scale/

The one commercial precedent checked directly — Out of the Park Baseball (OOTP), which must assign a defensive rating to every real MLB player every season — **discloses no formula** for deriving in-game Range/Error/Arm/Turn-Double-Play ratings from DRS/UZR/OAA/Fielding%; both the official manual and a 2025 community explainer describe the ratings only conceptually. T2. https://manuals.ootpdevelopments.com/index.php?man=ootp16&page=defensive_ratings

Historical framing: a 2010 Baseball Prospectus piece (Colin Wyers) argued defensive metrics hadn't progressed meaningfully past 1980s tools, citing only **r=0.79** correlation between two metrics on identical data (vs. r=0.94 for offensive stats) — outside the 2023-26 window but useful as the baseline the 2023 BP reliability numbers (§21.2: OAA 0.31, RDA 0.43) are a measurable, partial improvement over. T3. https://www.baseballprospectus.com/news/article/11476/indefensible-what-do-we-really-know-about-defense/

### 21.5 Not published / could not verify

- **No official OAA→20-80 or DRS→20-80 grade conversion is published anywhere as of this search.** The two conversion attempts that exist (§21.4) are pre-Statcast, UZR-based, and neither has been redone with 2016+ OAA/DRS/FRV data by any outlet found.
- **No current (2023-26) published SD table for OAA or DRS by position** exists for z-score-based grade construction; the most recent (§21.2) is outfield-only OAA from 2018.
- **No single "OAA points per WAR" or "DRS points per WAR" constant** analogous to offense's "10 runs = 1 win" — the real pathway runs through the multi-step Fielding Run Value conversion (§21.1), not a single defense-specific multiplier.
- **A "2025 OAA leaders by position" list circulated in an earlier draft of this pass — REFUTED on independent Baseball Savant re-pull.** Bobby Witt Jr.'s 2025 OAA (+24) is a **tie** with Pete Crow-Armstrong, not a sole lead; the actual 2025 low among qualified players is Jonathan India/Brandon Lowe at **-14** (2B), not Acuña's -11; the SS leader is Witt (+24), not Nick Allen (+17, actually 3rd); the 3B leader is Ke'Bryan Hayes (+21), not Maikel Garcia (+17, 2nd). Witt's 2023-25 cumulative OAA is **+53**, not +54 (still MLB's best over that span, next is Giménez at +50). Do not cite the earlier figures.
- **A "2025 DRS leaders by position" list similarly had the RF slot wrong — REFUTED on that point.** Adolís García (16 DRS) led MLB right fielders, not Fernando Tatís Jr. (15 DRS, led only among *NL* right fielders). The other 9 positions in that list check out (§21.3).
- **A separate "2025 catcher framing" pull (Valenzuela +7.54 best / O'Hoppe -10.69 worst) is a confirmed extraction artifact — REFUTED**, from a mis-scoped (unqualified-player) query. The real 2025 figures are Bailey +25.05 / Quero -12.90 (§21.3). Do not use the Valenzuela/O'Hoppe numbers for anything.

**Recorded 2026-09-04.**

---

## 22. Platoon splits — magnitude, decision thresholds, pitch-type mechanics

*Researched and independently verified 2026-09-04. Every finding below survived direct re-fetch of its cited source; the one open question the literature itself hasn't settled is flagged in §22.5, not resolved.*

### 22.1 League-average platoon-split magnitude — and a real, unresolved disagreement over which side has it bigger

The canonical figure, still cited everywhere (*The Book*, Tango/Lichtman/Dolphin, 2000–2004 MLB PA data): **RHB average platoon split ≈ .017 wOBA** better vs. LHP; **LHB average platoon split ≈ .027 wOBA** better vs. RHP. T1. https://tht.fangraphs.com/platooning-the-meaning-of-mean-part-1/ A FanGraphs companion piece (2007-09 data) restates this as **LHH ~8.6% / RHH ~6.1%** relative wOBA splits, and gives the regression-to-mean sample sizes that matter for a sim's confidence model: a hitter's observed platoon split needs **~1,000 career PA vs. LHP (LHH)**, **~2,200 PA (RHH)**, or **~600 PA (switch-hitters)** before it's regressed 50% toward league average — implying LHH and switch-hitters show more *true*, persistent platoon-skill variation than RHH. T2. https://blogs.fangraphs.com/estimating-hitter-platoon-skill/

Actual year-by-year splits widen over time and are not stable: 2002 vs. 2012 — LHH split grew **9.33% → 12.77%** (largest in the sample), RHH grew **3.68% → 7.48%**. T2 — Matt Klaassen, FanGraphs, 2012-12-17. https://blogs.fangraphs.com/basic-hitter-platoon-splits-2002-2012/

**Open disagreement, not resolved by this pass:** a separate FanGraphs Community analysis (2007-13 data, excluding switch-hitters) found the *opposite* pattern — **RHH averaging a larger split (.043 wOBA) than LHH (.031 wOBA)**. Both figures independently check out at their respective sources. Treat "LHH have bigger splits than RHH" as the majority-view default, not a settled fact. T2. https://community.fangraphs.com/what-types-of-hitters-have-large-platoon-splits/

Recent pitcher-side confirmation (2024 starters): LHP allowed **.294 wOBA** vs. LHB (27.9% of PAs faced); RHP allowed **.320 wOBA** vs. LHB (48.2% of PAs faced) — lefty relievers get the platoon (same-handed) matchup roughly twice as often as lefty starters, a legacy of the 2020 three-batter-minimum rule's effect on bullpen usage. T2 — Michael Baumann, FanGraphs, 2024-08-29. https://blogs.fangraphs.com/are-you-a-starting-pitcher-who-wants-the-platoon-advantage-too-bad/

### 22.2 Practical thresholds and predictability at the individual-hitter level

Directly usable in-game decision heuristics (Ben Clemens, FanGraphs, 2020-03-31): lefties hit **.308 wOBA / 88 wRC+** vs. LHP, righties **.331 wOBA / 104 wRC+** vs. LHP. A same-handed pinch-hit replacement should be **~20 wRC+ points better**; forcing an opposing pitching change needs a **15-20 wRC+ edge**; simply swapping to the platoon-advantaged bench bat needs only **~10 wRC+ points better**. T2. https://blogs.fangraphs.com/updating-the-pinch-hit-penalty-with-a-few-rules-of-thumb/

Individual hitters' platoon-split *magnitude* is barely predictable from other stats — batted-ball/plate-discipline indicators (ISO, K%, LD%) explain only **~4% of variance**; moving a hitter's split by .010 wOBA needs roughly a .100-point wOBA swing or a 10-point K%/LD% change. Conclusion: aside from a handful of extreme, long-track-record hitters (Shin-Soo Choo, Ichiro Suzuki cited as examples), **it's generally safe to assume a given hitter's true platoon split is close to league average**. T2 — Chris Mitchell, FanGraphs Community, 2014-08-11. https://community.fangraphs.com/what-types-of-hitters-have-large-platoon-splits/ **No public 20-80-style grading scale for "platoon skill" exists anywhere in the sabermetric literature** — confirmed absent from the FanGraphs Sabermetrics Library's own "Splits" page and targeted search. T3, absence finding. https://library.fangraphs.com/principles/split/

Switch-hitters get only partial, uneven neutralization, not a clean fix: Ozzie Albies posted **.398 wOBA** batting right-handed vs. LHP but only **.318 wOBA** batting left-handed vs. RHP — an .080 gap despite always taking the nominal platoon advantage. The share of qualified switch-hitters has fallen from **21.1% (1986-95) to 13.1% (2021)**, evidence that many switch-hitters' weak-side production doesn't justify forgoing a strong natural-side platoon-advantaged bat. T2 — Jake Mailhot, FanGraphs, 2022-01-11. https://blogs.fangraphs.com/finding-switch-hitters-who-should-stop-switch-hitting/ A small (n=24), single-season (2013) BB/K check found no strong aggregate switch-hitting advantage — some players (Callaspo, Saltalamacchia) benefited, others (Crisp, V. Martinez) performed worse from their natural/weak side. T3, low-power corroboration only, consistent direction with the Mailhot finding. https://community.fangraphs.com/estimating-the-advantage-of-switch-hitting-on-bbk-splits/

### 22.3 Pitcher-side platoon splits are driven by pitch mix and arm slot, and are precisely quantified per pitch type

True reverse-split pitchers (worse vs. opposite-handed batters) are "not exceedingly rare"; roughly **three-quarters** of pitchers with large platoon splits lean heavily on a slider or a non-overhand curveball. Side-arm/¾-arm deliveries associate with larger same-handed splits; changeup/curveball-heavy repertoires associate with smaller or reverse splits. T1 — Jared Cross, SABR, 2015-08-14, citing *The Book* and John Walsh's 1957-2006 Retrosheet research. https://sabr.org/latest/cross-forecasting-pitcher-platoon-splits/

Tom Tango's own pitch-type-level quantification (runs/100 pitches, 2023-09-19), the most precise figure in this domain: against RHP, **changeups+curveballs reverse the normal split** — RHB (same-handed) **+.18** vs. LHB (opposite-handed) **-.14**, a .32-run swing against the RHP's overall platoon effect of ~+.19; for **LH relief pitchers'** sliders specifically, LHB (same-handed) **-0.88** vs. RHB (opposite-handed) **+0.59**, a 1.47-run differential vs. a baseline LHP platoon advantage of ~+0.70 — the slider roughly doubles a lefty reliever's effectiveness against same-side hitters. (Note: the slider figures are scoped by the source to LH *relievers*, not LHP generally.) T1. https://tangotiger.com/index.php/site/article/platoon-splits-by-pitch-type

Real pitchers restructure arsenals dramatically by batter handedness: Max Scherzer (since 2020) throws slider **39%**/curve **5%** to same-handed batters vs. slider **<1%**/curve **15%** to opposite-handed; Lance McCullers **36%** slider/6% curve/10% changeup same-handed vs. **6%** slider/48% curve/21% changeup opposite-handed. T2, same source.

2021 Statcast data shows the platoon effect shaping batted-ball shape before it fully shows in outcomes: RHP sinkers vs. RHH average **.341 wOBA-on-contact / 2° launch angle**; vs. LHH, **.390 wOBA / 8°**. Ground-ball rate: RHH 43.4% vs. RHP / 41.4% vs. LHP; LHH 41.1% vs. RHP / 47.5% vs. LHP. RHH posted **.184 ISO vs. LHP vs. .161 vs. RHP** (23-point gap). T2 — Justin Choi, FanGraphs, 2022-01-10. https://blogs.fangraphs.com/the-platoon-split-you-may-have-never-heard-of/

### 22.4 Rule-change context: shift ban and three-batter minimum

Hard-hit pulled groundballs from LH hitters fell from **.366 wOBA (2015) to .299 wOBA (2021)** as shift deployment increased pre-ban — since shifts were deployed disproportionately against pull-heavy LH hitters (who face RHP ~70%+ of the time), this is a plausible mechanism (not a directly measured post-ban effect) for how the 2023 shift ban could partially restore LHB-vs-RHP production. T2 — Justin Choi, FanGraphs, 2022-03-10 (pre-ban). https://blogs.fangraphs.com/what-banning-the-shift-does-and-does-not-accomplish/ A real, if loosely-sourced, downstream trend: the OPS platoon gap for LHB vs. LHP shrank from **110 points (2021) to 52 points (2026, in-season)** — narrowing every season since 2021, per a local-outlet piece that does not attribute the cause to the pitch clock or shift ban specifically. T3. https://shepherdexpress.com/sports/brewers-on-deck/the-platoon-split-is-shrinking-but-not-in-milwaukee/

The 2020 three-batter-minimum rule cut same-handed relief-specialist (LOOGY) single-batter usage by **roughly a factor of three**; the underlying Retrosheet study's actual headline finding is that the LOOGY *role* itself has not disappeared, only the single-batter appearance pattern. T3 — David W. Smith, Retrosheet. https://www.retrosheet.org/Research/SmithD/LOOGYandThreeBatterRule.pdf **Implication for realism: fewer late-game handedness-matched substitutions since 2020 means observed in-game platoon gaps may understate a sim AI manager's theoretical access to the platoon advantage** if it isn't itself constrained the way real bullpens now are.

### 22.5 Not published / could not verify

- No official, industry-wide numeric "platoon skill" grading scale (20-80 or otherwise) for individual hitters or pitchers exists; public sources substitute raw wOBA/wRC+ splits plus *The Book*'s regression-to-mean PA thresholds (§22.2).
- No single, precise, current (2020s) study computes one aggregate "switch-hitters neutralize X% of the platoon penalty" figure; the evidence (§22.2) supports only a qualitative "partial, uneven" conclusion.
- No rigorous published analysis isolates how the 2023 pitch clock and/or shift ban specifically changed platoon-split *magnitude*, as distinct from the concurrent 2020 three-batter-minimum rule or general offensive-environment shifts. The one relevant trend (§22.4, Shepherd Express) is T3 and doesn't attribute cause.
- A commonly-repeated claim that switch-hitting yields "~28 points higher wOBA" or "5-8% overall improvement" over one-sided peers could not be traced to any checkable source — do not use it.
- **The LHH-vs-RHH "who has the bigger platoon split" question is a genuine open disagreement in the public literature** (§22.1), not a data-entry error to reconcile — record it as a range/uncertainty band in the sim's design assumptions, not a single hard-coded number.

**Recorded 2026-09-04.**

---

## 23. Modern baserunning rules — 2023 rule changes and their measured effect on stolen bases

*Researched and independently verified 2026-09-04, including independent recomputation of every year's league-wide SB/CS totals directly from Baseball-Reference's own season tables. The 2023 total/success-rate figures in §23.2 were independently re-checked a second time outside the workflow before this merge — confirmed exactly.*

### 23.1 The mechanics — bases, pitch timer, disengagement limit

Base size grew from a 15-inch to an **18-inch square bag** for 2023, shortening the 1st-2nd and 2nd-3rd running distance by **4.5 inches each**. Pitch timer: **15 seconds** with bases empty, **20 seconds** with a runner on, **30 seconds** between batters; a batter not in the box by the **8-second mark** is charged an automatic strike. Pitchers are capped at **two disengagements** (step-offs or pickoff throws) per plate appearance, resetting if the runner(s) advance; a third, unsuccessful disengagement is a balk (runner awarded the next base). T1 — MLB.com, Anthony Castrovince. https://www.mlb.com/news/mlb-2023-rule-changes-pitch-timer-larger-bases-shifts **Correction:** the cited article is dated Feb. 1, 2023 but describes a vote that happened "Friday" — Jan. 27, 2023, not Feb. 1; other reporting places the original Competition Committee approval of this same rules package on **Sept. 9, 2022**. Do not cite Feb. 1, 2023 as the vote date (see §23.5).

### 23.2 Stolen bases, before and after — every season 2021-2025, independently recomputed

| Year | Total SB | Success rate | SB/team-game | Notes |
|---|---|---|---|---|
| 2021 (baseline) | 2,213 | 75.7% | 0.46 | lowest SB/game since 1967 |
| 2022 (last pre-rule) | 2,486 | 75.4% | 0.51 | |
| **2023 (rule-change year)** | **3,503** | **80.2%** | **0.72** | +41% vs. 2022; most since 1987; success rate highest since CS tracking began (1951); rate/game highest since 1997 |
| 2024 | 3,617 | 79.0% | 0.73 | highest total since 1915 (109 years); 3rd-most since 1900 behind only 1914/1915 |
| 2025 | 3,440 | ~79%† | — | 2nd-highest of the rule-change era |

T1 for 2022–2024 (independently recomputed from raw Baseball-Reference season batting tables, exact match); T2 for 2021 and 2025 (Baseball-Reference totals confirmed directly; †2025's full-season success rate computes to 77.7% from Baseball-Reference's own final tally — an April-2025 in-season snapshot cited elsewhere gave 78.8%; both are recorded since they answer different questions). **Citation note:** cite Baseball-Reference's season batting tables directly for the 2022/2023 rows — the MLB.com URL originally attached to those figures does not actually contain them (it's a different, in-season 2023 Petriello piece with matching but not identical numbers). Derived caught-stealing rate (1 − success rate) by year: 24.3% (2021), 24.6% (2022), **19.8% (2023, record low)**, ~21% (2024), ~21–22% (2025). T3, arithmetic derived from the confirmed rates above.

### 23.3 Causal isolation — the 2021 MiLB natural experiment

MiLB tested the mechanics separately by level in 2021, which is what actually isolates the disengagement/pickoff limit — not base size — as the primary driver of the later MLB surge, vs. 2019 baseline:

| Level | Rule tested | SB/game 2019→2021 | Change |
|---|---|---|---|
| Low-A | 2-disengagement limit | 0.83 → 1.42 | **+71%** |
| High-A | mandatory step-off before throw | 0.80 → 1.41 | **+76%** |
| Triple-A | bigger bases only, no pickoff limit | 0.63 → 0.83 | +32% |
| Double-A (control) | shift limits only, no baserunning change | 0.76 → 0.79 | +4% |

T2 — Dayn Perry, CBS Sports, 2021-05-23. https://www.cbssports.com/mlb/news/thanks-to-mlbs-experimental-rule-changes-stolen-bases-in-the-minor-leagues-are-way-up/ By 2022, with all three mechanics live at every full-season MiLB level, attempts rose **2.23 → 2.81/game (+26%)** and success rate rose **68.2% → 78% (+9.8 points)** vs. 2019. T2 — Anthony Castrovince, MLB.com, 2022-06-15. https://www.mlb.com/news/pitch-clock-may-bring-back-stolen-bases

### 23.4 Second-order effects

MLB's own officially-distributed mid-2023 data: BABIP **.292 (2021) → .290 (2022) → .297 (2023)**; batting average **.243 (2022) → .248 (2023)**; combined runs/game **8.6 (2022) → 9.2 (2023)**; league attendance **+8.1%** vs. 2022. T1 — reported by SI/FanNation, 2023-07-11, sourced to MLB's own data release. https://www.si.com/fannation/mlb/fastball/news/mlb-distributes-new-data-on-how-rule-changes-have-impacted-pace-of-play-attendance-babip

Catcher pop time (throw to 2nd) kept improving even as it became less decisive: **1.98s (2022) → 1.96s (2023) → 1.945s (2024)**; pickoff throws per team-game rose **1.96 → 2.13** over the same span, and successful pickoffs rose too — 185 runners picked off through July 6, 2023 (full-season pace ~346) vs. 275 in each of 2021 and 2022, a >25% year-over-year jump. T2 — FanGraphs (Ben Clemens, 2024-04-11; Leo Morgenstern, 2023-07-07). https://blogs.fangraphs.com/the-stolen-base-explosion-hasnt-continued/

Stolen-base behavior reverts sharply in the postseason under the same rules — runners get conservative when games matter most: 2023 regular season **0.72 SB/team-game, 0.90 attempts/team-game, 80.2% success**, vs. postseason **0.50 SB/team-game, 0.64 attempts/team-game, 78.4% success** — a ~40% drop in raw steal rate driven almost entirely by fewer attempts, not a lower success rate. T2 — FanGraphs, 2023-10-20. https://blogs.fangraphs.com/what-happened-to-all-those-stolen-bases/

Doubles and triples got a small, non-persistent bump from bigger bases in 2023 before resuming a longer decline driven by better outfield positioning (a trend the shift-restriction rules don't touch): doubles fell from **8,254 (2016) to 7,771 (2024) to 7,745 (2025)** — confirmed directly against Baseball-Reference's own league tables, though the specific AP article originally cited for this framing could not be located and should not be re-cited without a better source (see §23.5). T2. One team-level anecdote for context: the 2023 Reds took an extra base on qualifying hits **47%** of the time, 3rd-best in MLB — a single-team figure, not a league average. T3 — MLB.com. https://www.mlb.com/news/reds-among-mlb-s-best-baserunning-teams-in-2023

### 23.5 Not published / could not verify

- **The claimed Feb. 1, 2023 rules-vote date is REFUTED** by the primary source's own text (it describes a "Friday" vote — Jan. 27, 2023) and by corroborating reporting placing the original Competition Committee approval on Sept. 9, 2022. Do not cite Feb. 1, 2023 as the vote date.
- The AP article "Doubles and triples are dwindling in MLB. Blame better outfielders and sluggers" could not be located at any of its claimed mirror URLs or via exact-phrase search, despite the underlying doubles totals checking out independently against Baseball-Reference. Cite Baseball-Reference directly for the totals; treat the AP byline/article itself as unconfirmed.
- theScore's specific historical pop-time data points (2015 record high 2.021s; "2020, first time under 2.0s") could not be independently located — the confirmed pop-time trend (§23.4) covers only 2022-2024, from FanGraphs.
- A league-wide, full-season-final 2025 stolen-base success rate/CS total could not be confirmed from a single authoritative live page in this pass; §23.2 records two different, non-contradictory figures (an in-season snapshot and Baseball-Reference's own final tally) rather than picking one.
- A true league-wide "extra bases taken %" (XBT%) before/after comparison (Baseball-Reference tracks this) could not be retrieved — baseball-reference.com blocked direct fetch in this session. The Reds anecdote (§23.4) is single-team, not league-wide.

**Recorded 2026-09-04.**

---

## 24. International pipeline — the NPB/KBO posting system

*Researched and independently verified 2026-09-04, including exact-dollar reconciliation of eight real posting/free-agency transactions against the published fee formula. Yamamoto's exact posting fee in §24.3 was independently re-checked a second time outside the workflow before this merge — confirmed exactly.*

### 24.1 The posting fee formula and windows

Posting fee for a player who signs a Major League contract (NPB and KBO alike, current agreements): **20% of the first $25M** of guaranteed value + **17.5% of the next $25M** ($25M-$50M) + **15% of anything over $50M**, plus a **15% supplemental fee** on later-earned bonuses/escalators and exercised options. T1 — confirmed exactly against eight independent real transactions (§24.3). If instead the player signs a **Minor League contract** (the path required when he's restricted to the international-amateur bonus pool, §24.2), the fee is a **flat 25% of the signing bonus** — confirmed to the dollar via Roki Sasaki (§24.3). https://en.wikipedia.org/wiki/Posting_system

NPB: once posted, **all 30 MLB clubs get a 45-day exclusive window**; no deal in that window returns the player to his NPB club for the following season. T1, confirmed both via Wikipedia and independently via a real 2024-25 posting (Ogasawara) that states the same 45-day mechanic. https://www.mlbtraderumors.com/2024/12/shinnosuke-ogasawara-officially-posted-for-mlb-clubs.html KBO: **30-day exclusive negotiation window** once posted (confirmed directly); a stated "one player per club per offseason" limit could not be independently re-confirmed and should be treated as plausible, not certain. T2. https://en.wikipedia.org/wiki/Posting_system_(KBO)

### 24.2 Eligibility — service-time thresholds on both sides, and the age/service trap that blocks a market contract

KBO: posting requires **≥7 years of KBO service plus club consent**; without consent a player must instead wait for full free agency. A player who accrues **9 years of KBO service** is said to become a fee-free MLB free agent with no posting required — this specific 9-year KBO threshold could not be independently re-confirmed against a primary source this pass (directionally consistent with NPB's confirmed parallel rule below, since KBO's system is modeled on NPB's, but treat as plausible, not certain). T2. https://en.wikipedia.org/wiki/Posting_system_(KBO)

NPB: a club can lawfully refuse a posting request only until the player completes **9 NPB seasons** — at that point he's an unrestricted international free agent, no fee owed. T2, confirmed directly (Kazuma Okamoto and Tatsuya Imai's posting eligibility explicitly tied to reaching 9 years after 2026; Tomoyuki Sugano's real 2024 free-agent move after 12 NPB seasons carried no posting fee). https://www.mlbtraderumors.com/2025/09/npb-kazuma-okamoto-tatsuya-imai-posted-mlb-free-agents.html

**The critical crossover with the international amateur system, confirmed exactly:** a posted NPB/KBO player who is **under 25 years old AND has fewer than 6 years of service** in his home league is treated as an international amateur under the MLB CBA — even if formally posted, he can't sign a market MLB contract and is instead restricted to a club's international amateur bonus pool, typically landing a Minor League deal with a capped bonus. Players **25-or-older with 6+ years of experience can sign major league contracts of any length or amount.** T1. This is why Roki Sasaki (23, ~4 NPB seasons) got a $6.5M-bonus Minor League deal while Yamamoto (25, 7 NPB seasons) got a $325M market contract for what scouts considered comparable stuff. https://www.mlbtraderumors.com/2025/09/npb-kazuma-okamoto-tatsuya-imai-posted-mlb-free-agents.html

### 24.3 Real transactions, 2023-2025 — every figure reconciled to the formula

| Player | From | To | Contract | Posting fee | Tier |
|---|---|---|---|---|---|
| Yoshinobu Yamamoto | Orix (NPB) | Dodgers | 12yr/$325M | **$50.625M** | T1 |
| Munetaka Murakami | Yakult (NPB) | White Sox | 2yr/$34M | **$6.575M** | T2 |
| Roki Sasaki | Chiba Lotte (NPB) | Dodgers | MiLB, $6.5M bonus | **$1.625M** (25% of bonus) | T2 |
| Shinnosuke Ogasawara | Chunichi (NPB) | Nationals | 2yr/$3.5M | **$700K** | T2 |
| Lee Jung-hoo | Kiwoom (KBO) | Giants | 6yr/$113M | **$18.825M** | T2 |
| Go Woo-suk | LG (KBO) | Padres | 2yr/$4.5M | **$900K** | T2 |
| Hyeseong Kim | Kiwoom (KBO) | Dodgers | 3yr/$12.5M gtd (up to $22M w/ options) | **$2M** + 15% supplemental on earned amounts | T1 |
| Kodai Senga | SoftBank (NPB) | Mets | 5yr/$75M | **$0** (reached FA via a contract opt-out, not posting) | T2 |

Every fee above reconciles exactly to the §24.1 formula. **Yamamoto's $50.625M is the largest fee under the current (2018-format) rules** — still below the sport's all-time record, Boston's $51.1M to Seibu for Daisuke Matsuzaka (2006, old blind-auction system); Masahiro Tanaka's 2013 fee was capped at exactly $20M under the since-replaced 2013-18 rules.

### 24.4 Scale and historical context

Since 1998, **28 players** have used the NPB posting system (upper bound of a range some secondary sources give as low as 22 — 28 is the number independently confirmed at Wikipedia). T3. A small (n=21, 8 hitters/13 pitchers), non-peer-reviewed regression study found NPB hitters mostly *underperformed* a simple NPB-based MLB projection — Ohtani was the sole outperformer (+.247 OPS vs. predicted), Norihiro Nakamura the worst miss (.873 NPB OPS → .654 predicted → .350 actual). Explicitly flagged by its own author as having very low predictive power (R²) — illustrative, not authoritative. T3 — CJ Lu Sing, Sports Analytics Group at Berkeley, 2022-11-29. https://sportsanalytics.studentorg.berkeley.edu/articles/japan-to-mlb.html

### 24.5 Not published / could not verify

- **A widely-repeated general pattern — "NPB hitters' OPS drops ~15-20% in year one, pitchers' ERA rises ~0.75-1.25, walk rate falls ~2.9 points" — could not be traced to any locatable primary study.** The likely original source (a 2015 Beyond the Box Score piece) is unreachable. Do not cite this figure set as sourced.
- No official, methodologically rigorous aggregate "success rate" or "bust rate" for posted NPB/KBO players in MLB has been published by MLB, NPB, or KBO; the only quantitative attempt found (§24.4) is a small, non-peer-reviewed student analysis with self-acknowledged low predictive power.
- No single authoritative, continuously-updated count of "total players posted since 1998" exists; secondary sources disagree (22-28), and the specific named examples of posted players who never reached MLB (Alejandro Diaz, Shinji Mori) could not be independently confirmed.
- The exact date/mechanism by which KBO adopted its current tiered (20%/17.5%/15%) fee formula, as distinct from any earlier KBO-specific formula, was not confirmed against a primary source.
- MLB.com's own glossary pages for the Japanese and Korean posting systems (the likeliest primary/official source) blocked automated fetch (HTTP 406) throughout this research; all MLB.com-sourced claims above rest on independent cross-verification against real transactions and Wikipedia rather than a direct read of the glossary pages themselves.
- The KBO "one posted player per club per offseason" limit and the KBO "9 years service = fee-free free agency" threshold (§24.1-24.2) could not be independently re-confirmed against a primary source this pass — treat both as plausible, not certain.

**Recorded 2026-09-04.**

## 25. Ticket-price elasticity, and why a real club prices below the revenue-maximising point — T1/T2

**Why this section exists.** `state.ticketPrice` has been written at new-game and read by nothing
since the state-wiring pass. Making it real means deciding what a price change actually *does* to
attendance, and that is a published question with a well-replicated answer — not something to
invent.

### The finding

**MLB ticket demand is price-INELASTIC at observed prices.** This is one of the most replicated
results in sports economics, going back to Noll (1974) and Scully (1989), and it is known in the
literature as the *inelastic pricing puzzle*: teams appear to set prices "too low" for a
profit-maximising single-product firm.

**Primary source used here — T1 on the qualitative finding, T2 on the magnitudes.**
Lee & Chun, *Ticket Pricing Per Team: The Case of Major League Baseball* (NYU Stern hosted copy).
Team-specific error-correction models, **23 MLB clubs, every year from 1970 to 2003**:

| what the paper reports | value |
|---|---|
| Most teams' long-run price elasticities | **significantly less than 1 in absolute value** — i.e. inelastic |
| The lowest reported | **TEX and PHI below 0.5** |
| Teams with long-run *elastic* demand | KCR, MIL, OAK, SDP |
| Sign of the long-run price elasticity | negative in every case **except** BAL, BOS, NYY |
| Long-run income elasticity, average | **1.88** |

The paper's own explanation of the BAL/BOS/NYY exceptions is worth keeping: BOS and NYY are
"classic rivals with a large legion of loyal fans" playing in classic parks for the whole sample,
and BAL was the first franchise into a new retro stadium — effects the specification does not fully
control for. That is a caveat on those three estimates, not a finding about the sign of demand.

### The mechanism, and why it matters to this engine specifically

The paper states the reason directly: inelastic pricing is consistent with profit maximisation
**"if these teams obtain appreciable offsetting revenue from the sales of concessions and
souvenirs"** — the franchise owner "will rationally price tickets where marginal revenue is
negative: in the inelastic portion of the demand curve," because a club is not a single-product
firm. Krautmann & Berri (2007) make the same argument formally.

**This engine already models exactly that split.** `Economy` carries four independent per-fan
revenue lines, and for MLB they are `gate: 38`, `conc: 19`, `park: 6`, `merch: 8` — so **46% of
per-fan revenue does not come from the ticket at all**. The inelastic-pricing result therefore does
not need to be asserted anywhere in the code: it falls out of the engine's own sourced revenue
split once attendance responds to price. A club that prices for maximum gate revenue empties its
own concession stands.

### What is adopted, and at what tier

| quantity | value | tier | basis |
|---|---|---|---|
| Demand form | **linear** — `attendance ∝ 1 + k − k·(price / face)` | T3 | the paper estimates elasticities, which are local; it does not estimate a curve shape |
| k (elasticity at the face price) | **0.6** | T2 | inside the reported distribution — below 1.0 like "most teams", above the 0.5 floor TEX/PHI show |
| Realised gate per fan scales with the face price | yes | T3 | `E.gate` is realised revenue per attendee; moving the face without moving realised revenue would be incoherent |

### The trap: constant-elasticity demand cannot be used here, and the reason is arithmetic

The obvious functional form — `attendance ∝ (price / face)^−ε` — was written into an earlier draft
of this section and is **wrong for this purpose**. Constant-elasticity demand has no interior
revenue optimum. With per-fan revenue `g·x + c` (gate plus ancillary) and demand `x^−ε`:

```
R(x) = x^−ε (g·x + c)      R′(x) = x^−ε−1 [ g(1−ε)x − εc ]
```

The stationary point `x* = εc / (g(1−ε))` is a **minimum**, not a maximum (`R″(x*) > 0`), so for
any ε < 1 revenue *falls* to that dip and then rises without bound. Computed against MLB's own
per-fan lines (g = 38, c = 33, ε = 0.6), revenue indexes to **99.2 at 1.3× face and 119.6 at 5×
face** — the model's advice is "charge $205 a ticket." A game shipped on that has one move.

Linear demand, calibrated so the elasticity *at the face price* equals the sourced 0.6, behaves
properly. Against the same per-fan lines:

| price vs face | attendance | revenue index |
|---|---|---|
| 0.6× | 1.24 | 97.5 |
| 0.8× | 1.12 | 100.0 |
| **0.9×** | **1.06** | **100.3 ← optimum** |
| 1.0× (face) | 1.00 | 100.0 |
| 1.2× | 0.88 | 97.4 |
| 1.6× | 0.64 | 84.6 |
| 2.0× | 0.40 | 61.4 |

**And the shape is the finding.** The optimum sits *below* the face price, the curve is almost flat
across 0.8–1.0×, and it falls away sharply above it. That is the inelastic-pricing puzzle rendered
as a decision: the counter-intuitive move (cut the price) is mildly right, the intuitive one (raise
it) is quietly expensive, and neither is a free lunch. Note the general result that falls out —
the face price is exactly optimal when `k = g / (g + c)`, i.e. **0.535** for MLB, the ticket's own
share of per-fan revenue. The sourced 0.6 is a little above that, which is why the model says a real
club is very slightly over-priced at its own face.

**No long-run fan-base dynamic is modelled, and none is needed.** An earlier draft of this section
proposed one — pricing above the market eroding next year's base — to stop "raise the price" being a
dominant strategy. With linear demand there is no dominant strategy to stop, so the invented knob
was dropped rather than kept for flavour. If a dynamic is ever wanted, the literature points at
Chang, Potter & Sanders (2016) — the effect of the win-loss record on demand for FUTURE home games —
and Kesenne (1996, 2000) on win maximisation under a profit constraint.

**Sources:**
- Lee & Chun, *Ticket Pricing Per Team: The Case of Major League Baseball* —
  https://pages.stern.nyu.edu/~wgreene/entertainmentandmedia/JSM-Baseball-Elasticity.pdf
- Fort, R. (2004). *Inelastic sports pricing.* Managerial and Decision Economics 25, 87–94.
- Krautmann, A. & Berri, D. (2007) — concessions as the offsetting revenue.
- Kesenne, S. (1996, 2000) — win maximisation under a profit constraint.
- Chang, Potter & Sanders (2016) — dynamic effect on future home demand.
- Noll (1974), Scully (1989) — the original inelastic findings.
