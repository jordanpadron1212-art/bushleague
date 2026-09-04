/**
 * The real world's structure — RESEARCH.md §1–2 and §9. Ported verbatim
 * from bush-league-v0.10.html's `MLB`/`MILB`/`INDY`/`LEAGUE_EVENTS` consts.
 * Every club name, division, park and league here is a real, current
 * (2026 season) name — this is Tier 1 data, not generated.
 */

export type MlbRow = readonly [
  abbr: string,
  city: string,
  name: string,
  league: "AL" | "NL",
  division: "East" | "Central" | "West",
  park: string,
];

/** 30 MLB clubs, real 2026 identities, parks and divisions — RESEARCH.md §1.1. */
export const MLB: readonly MlbRow[] = [
  ["NYY", "New York", "Yankees", "AL", "East", "Yankee Stadium"],
  ["BAL", "Baltimore", "Orioles", "AL", "East", "Oriole Park at Camden Yards"],
  ["BOS", "Boston", "Red Sox", "AL", "East", "Fenway Park"],
  ["TBR", "Tampa Bay", "Rays", "AL", "East", "Tropicana Field"],
  ["TOR", "Toronto", "Blue Jays", "AL", "East", "Rogers Centre"],
  ["CWS", "Chicago", "White Sox", "AL", "Central", "Rate Field"],
  ["CLE", "Cleveland", "Guardians", "AL", "Central", "Progressive Field"],
  ["DET", "Detroit", "Tigers", "AL", "Central", "Comerica Park"],
  ["KCR", "Kansas City", "Royals", "AL", "Central", "Kauffman Stadium"],
  ["MIN", "Minnesota", "Twins", "AL", "Central", "Target Field"],
  ["ATH", "Sacramento", "Athletics", "AL", "West", "Sutter Health Park"],
  ["HOU", "Houston", "Astros", "AL", "West", "Daikin Park"],
  ["LAA", "Los Angeles", "Angels", "AL", "West", "Angel Stadium"],
  ["SEA", "Seattle", "Mariners", "AL", "West", "T-Mobile Park"],
  ["TEX", "Texas", "Rangers", "AL", "West", "Globe Life Field"],
  ["ATL", "Atlanta", "Braves", "NL", "East", "Truist Park"],
  ["MIA", "Miami", "Marlins", "NL", "East", "loanDepot park"],
  ["NYM", "New York", "Mets", "NL", "East", "Citi Field"],
  ["PHI", "Philadelphia", "Phillies", "NL", "East", "Citizens Bank Park"],
  ["WSN", "Washington", "Nationals", "NL", "East", "Nationals Park"],
  ["CHC", "Chicago", "Cubs", "NL", "Central", "Wrigley Field"],
  ["CIN", "Cincinnati", "Reds", "NL", "Central", "Great American Ball Park"],
  ["MIL", "Milwaukee", "Brewers", "NL", "Central", "American Family Field"],
  ["PIT", "Pittsburgh", "Pirates", "NL", "Central", "PNC Park"],
  ["STL", "St. Louis", "Cardinals", "NL", "Central", "Busch Stadium"],
  ["ARI", "Arizona", "Diamondbacks", "NL", "West", "Chase Field"],
  ["COL", "Colorado", "Rockies", "NL", "West", "Coors Field"],
  ["LAD", "Los Angeles", "Dodgers", "NL", "West", "Dodger Stadium"],
  ["SDP", "San Diego", "Padres", "NL", "West", "Petco Park"],
  ["SFG", "San Francisco", "Giants", "NL", "West", "Oracle Park"],
] as const;

export type MilbLevelKey = "AAA" | "AA" | "HIA" | "A";

export interface MilbLevel {
  games: number;
  att: number;
  leagues: readonly (readonly [name: string, cities: readonly string[]])[];
}

/**
 * Affiliated ladder — Tier 1 club names and league placement, RESEARCH.md
 * §2.1. Parent-club affiliation (which MLB org owns which affiliate) is now
 * real, sourced data too — RESEARCH.md §2.6, `MILB_PARENT` below — closing
 * the gap this comment used to flag as open (DECISIONS.md D91).
 */
export const MILB: Record<MilbLevelKey, MilbLevel> = {
  AAA: {
    games: 150,
    att: 5556,
    leagues: [
      ["International", ["Buffalo", "Charlotte", "Durham", "Jacksonville", "Lehigh Valley", "Norfolk", "Rochester", "Scranton/W-B", "Syracuse", "Worcester", "Columbus", "Gwinnett", "Indianapolis", "Iowa", "Louisville", "Memphis", "Nashville", "Omaha", "St. Paul", "Toledo"]],
      ["Pacific Coast", ["Albuquerque", "El Paso", "Oklahoma City", "Round Rock", "Sugar Land", "Las Vegas", "Reno", "Sacramento", "Salt Lake", "Tacoma"]],
    ],
  },
  AA: {
    games: 138,
    att: 4143,
    leagues: [
      ["Eastern", ["Binghamton", "Hartford", "New Hampshire", "Portland", "Reading", "Somerset", "Akron", "Altoona", "Chesapeake", "Erie", "Harrisburg", "Richmond"]],
      ["Southern", ["Birmingham", "Chattanooga", "Knoxville", "Rocket City", "Biloxi", "Columbus", "Montgomery", "Pensacola"]],
      ["Texas", ["Arkansas", "Northwest Arkansas", "Springfield", "Tulsa", "Wichita", "Amarillo", "Corpus Christi", "Frisco", "Midland", "San Antonio"]],
    ],
  },
  HIA: {
    games: 132,
    att: 3333,
    leagues: [
      ["Midwest", ["Dayton", "Fort Wayne", "Great Lakes", "Lake County", "Lansing", "West Michigan", "Beloit", "Cedar Rapids", "Peoria", "Quad Cities", "South Bend", "Wisconsin"]],
      ["South Atlantic", ["Brooklyn", "Frederick", "Greensboro", "Hudson Valley", "Jersey Shore", "Wilmington", "Asheville", "Bowling Green", "Greenville", "Hub City", "Rome", "Winston-Salem"]],
      ["Northwest", ["Eugene", "Everett", "Hillsboro", "Spokane", "Tri-City", "Vancouver"]],
    ],
  },
  A: {
    games: 132,
    att: 2106,
    leagues: [
      ["California", ["Fresno", "San Jose", "Stockton", "Visalia", "Inland Empire", "Lake Elsinore", "Ontario", "Rancho Cucamonga"]],
      ["Carolina", ["Delmarva", "Fayetteville", "Fredericksburg", "Hill City", "Salem", "Wilson", "Augusta", "Charleston", "Columbia", "Hickory", "Kannapolis", "Myrtle Beach"]],
      ["Florida State", ["Daytona", "Jupiter", "Palm Beach", "St. Lucie", "Bradenton", "Clearwater", "Dunedin", "Fort Myers", "Lakeland", "Tampa"]],
    ],
  },
};

/**
 * Which MLB club owns which affiliate — RESEARCH.md §2.6. Keyed
 * `${level}:${city}` rather than bare city, the same disambiguation
 * `buildWorld`'s own abbreviation pools already use, since "Columbus"
 * (Cleveland's AAA International affiliate) and "Columbus" (Atlanta's AA
 * Southern affiliate) are two different real cities that only collide
 * because this table doesn't otherwise carry a league name. Values are
 * `MLB` row abbreviations (`world.ts`'s `buildWorld` turns them into the
 * real `MLB_<abbr>` club id). One of 120 real cities has no entry —
 * `A:Hill City` — a genuine, disclosed research gap (RESEARCH.md §2.6's own
 * note), not an oversight: every other real 2025/2026 Carolina League
 * member matched cleanly, and no source found explains "Hill City" as a
 * real market. Left unassigned rather than guessed.
 */
export const MILB_PARENT: Readonly<Record<string, string>> = {
  "AAA:Reno": "ARI", "AAA:Gwinnett": "ATL", "AAA:Norfolk": "BAL", "AAA:Worcester": "BOS",
  "AAA:Charlotte": "CWS", "AAA:Louisville": "CIN", "AAA:Columbus": "CLE", "AAA:Albuquerque": "COL",
  "AAA:Toledo": "DET", "AAA:Sugar Land": "HOU", "AAA:Omaha": "KCR", "AAA:Salt Lake": "LAA",
  "AAA:Iowa": "CHC",
  "AAA:Oklahoma City": "LAD", "AAA:Jacksonville": "MIA", "AAA:Nashville": "MIL", "AAA:St. Paul": "MIN",
  "AAA:Syracuse": "NYM", "AAA:Scranton/W-B": "NYY", "AAA:Las Vegas": "ATH", "AAA:Lehigh Valley": "PHI",
  "AAA:Indianapolis": "PIT", "AAA:El Paso": "SDP", "AAA:Sacramento": "SFG", "AAA:Tacoma": "SEA",
  "AAA:Memphis": "STL", "AAA:Durham": "TBR", "AAA:Round Rock": "TEX", "AAA:Buffalo": "TOR",
  "AAA:Rochester": "WSN",

  "AA:Amarillo": "ARI", "AA:Columbus": "ATL", "AA:Chesapeake": "BAL", "AA:Portland": "BOS",
  "AA:Birmingham": "CWS", "AA:Chattanooga": "CIN", "AA:Akron": "CLE", "AA:Hartford": "COL",
  "AA:Knoxville": "CHC",
  "AA:Erie": "DET", "AA:Corpus Christi": "HOU", "AA:Northwest Arkansas": "KCR", "AA:Rocket City": "LAA",
  "AA:Tulsa": "LAD", "AA:Pensacola": "MIA", "AA:Biloxi": "MIL", "AA:Wichita": "MIN",
  "AA:Binghamton": "NYM", "AA:Somerset": "NYY", "AA:Midland": "ATH", "AA:Reading": "PHI",
  "AA:Altoona": "PIT", "AA:San Antonio": "SDP", "AA:Richmond": "SFG", "AA:Arkansas": "SEA",
  "AA:Springfield": "STL", "AA:Montgomery": "TBR", "AA:Frisco": "TEX", "AA:New Hampshire": "TOR",
  "AA:Harrisburg": "WSN",

  "HIA:Hillsboro": "ARI", "HIA:Rome": "ATL", "HIA:Frederick": "BAL", "HIA:Greenville": "BOS",
  "HIA:Winston-Salem": "CWS", "HIA:Dayton": "CIN", "HIA:Lake County": "CLE", "HIA:Spokane": "COL",
  "HIA:South Bend": "CHC",
  "HIA:West Michigan": "DET", "HIA:Asheville": "HOU", "HIA:Quad Cities": "KCR", "HIA:Tri-City": "LAA",
  "HIA:Great Lakes": "LAD", "HIA:Beloit": "MIA", "HIA:Wisconsin": "MIL", "HIA:Cedar Rapids": "MIN",
  "HIA:Brooklyn": "NYM", "HIA:Hudson Valley": "NYY", "HIA:Lansing": "ATH", "HIA:Jersey Shore": "PHI",
  "HIA:Greensboro": "PIT", "HIA:Fort Wayne": "SDP", "HIA:Eugene": "SFG", "HIA:Everett": "SEA",
  "HIA:Peoria": "STL", "HIA:Bowling Green": "TBR", "HIA:Hub City": "TEX", "HIA:Vancouver": "TOR",
  "HIA:Wilmington": "WSN",

  "A:Visalia": "ARI", "A:Augusta": "ATL", "A:Delmarva": "BAL", "A:Salem": "BOS",
  "A:Kannapolis": "CWS", "A:Daytona": "CIN", "A:Lynchburg": "CLE", "A:Fresno": "COL",
  "A:Myrtle Beach": "CHC",
  "A:Lakeland": "DET", "A:Fayetteville": "HOU", "A:Columbia": "KCR", "A:Rancho Cucamonga": "LAA",
  "A:Ontario": "LAD", "A:Jupiter": "MIA", "A:Wilson": "MIL", "A:Fort Myers": "MIN",
  "A:St. Lucie": "NYM", "A:Tampa": "NYY", "A:Stockton": "ATH", "A:Clearwater": "PHI",
  "A:Bradenton": "PIT", "A:Lake Elsinore": "SDP", "A:San Jose": "SFG", "A:Inland Empire": "SEA",
  "A:Palm Beach": "STL", "A:Charleston": "TBR", "A:Hickory": "TEX", "A:Dunedin": "TOR",
  "A:Fredericksburg": "WSN",
};

export interface RosterCompRow {
  k: string;
  l: string;
  n: number;
  age: readonly [number, number];
  svc: readonly [number, number];
}

export interface IndyLeague {
  id: string;
  name: string;
  games: number;
  att: number;
  /** [min, max]; min 0 means "no published minimum" — see rosterLimits() derivation, not yet ported. */
  roster: readonly [number, number];
  note: string;
  /** Tier 3, solved from measured net so a .500 club at league-average attendance nets ~zero over a calendar year. */
  opScale: number;
  /** The team's published annual payroll cap — the real, binding constraint from v0.7 on. */
  cap: number;
  /** Generated legal by construction from each league's own published rule, not solved at runtime — RESEARCH.md §9.1. */
  comp: readonly RosterCompRow[];
  divs: readonly (readonly [name: string, cities: readonly string[]])[];
  /** False only for the Pecos League — not an MLB Partner League. */
  partner?: false;
  /** Average park elevation in feet — only the Pecos League publishes/needs this (RESEARCH.md §9.5). */
  elev?: number;
}

/**
 * Independent leagues — RESEARCH.md §9. THE CENTRAL FINDING (kept from the
 * original): the leagues are not equally knowable. The Frontier publishes a
 * complete age-based system; the American Association a complete
 * service-based one; the Pioneer exactly one rule; the Atlantic League has
 * redacted Rules 10, 11 and 12 (contracts, player limits, reserved lists)
 * in the only public edition of its rulebook. The Atlantic gets no roster
 * rule here because it has none — what makes it the top rung is talent and
 * money, both of which are sourced.
 */
export const INDY: readonly IndyLeague[] = [
  {
    id: "ALPB", name: "Atlantic League", games: 126, att: 2529, roster: [0, 0],
    note: "MLB's rules laboratory. The league claims 40%+ of its players have major-league service time.",
    // Re-solved 2026-09-04 (DECISIONS.md D86) against economics.ts's own
    // recalibrated INDY opex base — the biggest-gate league needed the
    // biggest re-solve (1.076 -> 1.292) to keep pace with its own revenue.
    opScale: 1.292, cap: 250000,
    comp: [{ k: "OPEN", l: "No class limit", n: 26, age: [22, 36], svc: [0, 12] }],
    divs: [
      ["North", ["Hagerstown", "Lancaster", "Long Island", "Staten Island", "York"]],
      ["South", ["Charleston", "Gastonia", "High Point", "Lexington", "Southern Maryland"]],
    ],
  },
  {
    id: "AAPB", name: "American Association", games: 100, att: 2668, roster: [20, 25],
    note: "25-man. Max 6 veterans (6+ yrs service), min 5 rookie-or-LS1, max 6 LS-4 of whom 2 LS-5.",
    // Re-solved 2026-09-04 (DECISIONS.md D86), see the Atlantic entry above.
    opScale: 1.077, cap: 120000,
    comp: [
      { k: "ROOK", l: "Rookie/LS-1", n: 6, age: [20, 24], svc: [0, 1] },
      { k: "LS23", l: "LS-2/LS-3", n: 8, age: [22, 27], svc: [2, 3] },
      { k: "LS4", l: "LS-4", n: 4, age: [24, 29], svc: [4, 4] },
      { k: "LS5", l: "LS-5", n: 2, age: [25, 30], svc: [5, 5] },
      { k: "VET", l: "Veteran", n: 5, age: [27, 35], svc: [6, 11] },
    ],
    divs: [
      ["East", ["Cleburne", "Gary SouthShore", "Kane County", "Lake Country", "Milwaukee", "Winnipeg"]],
      ["West", ["Chicago Dogs", "Fargo-Moorhead", "Kansas City", "Lincoln", "Sioux City", "Sioux Falls"]],
    ],
  },
  {
    id: "FRON", name: "Frontier League", games: 102, att: 2146, roster: [22, 25],
    note: "22-25 man. Min 10 aged 25-or-under, min 6 aged 26, max 8 aged 27+, max 2 aged 30+.",
    // Unchanged by the 2026-09-04 re-solve (DECISIONS.md D86) — this is the
    // reference league `economics.ts`'s own `INDY_OPEX_RECAL` was solved
    // against directly, so its opScale carries none of that correction.
    opScale: 0.883, cap: 85000,
    comp: [
      { k: "PRO1", l: "Professional-1", n: 8, age: [20, 24], svc: [0, 3] },
      { k: "PRO2", l: "Professional-2", n: 3, age: [25, 25], svc: [1, 4] },
      { k: "EX1", l: "Experienced-1", n: 6, age: [26, 26], svc: [2, 5] },
      { k: "EX2", l: "Experienced-2", n: 6, age: [27, 29], svc: [3, 7] },
      { k: "VET", l: "Veteran", n: 2, age: [30, 34], svc: [5, 10] },
    ],
    divs: [
      ["Atlantic East", ["Sussex County", "New York", "Down East", "New Jersey"]],
      ["Atlantic North", ["Quebec", "Tri-City", "Ottawa", "Brockton", "Trois-Rivieres"]],
      ["Midwest Central", ["Washington", "Lake Erie", "Florence", "Evansville"]],
      ["Midwest West", ["Schaumburg", "Gateway", "Mississippi", "Joliet", "Windy City"]],
    ],
  },
  {
    // roster[0]=0 means NO PUBLISHED MINIMUM. Data used to read [25,25], turning
    // the published ACTIVE ROSTER SIZE into a fabricated 25-man hard minimum —
    // DECISIONS.md D71. A derived floor (max(18, generated-3), not yet ported)
    // is the honest encoding; an invented one asserted as a rule is not.
    id: "PION", name: "Pioneer League", games: 96, att: 2248, roster: [0, 25],
    note: "25 active. No player with more than three years of prior professional service. No age cap.",
    // Re-solved 2026-09-04 (DECISIONS.md D86), see the Atlantic entry above.
    opScale: 0.895, cap: 95000,
    comp: [
      { k: "Y0", l: "1st year", n: 9, age: [19, 22], svc: [0, 0] },
      { k: "Y1", l: "2nd year", n: 7, age: [20, 23], svc: [1, 1] },
      { k: "Y2", l: "3rd year", n: 5, age: [21, 25], svc: [2, 2] },
      { k: "Y3", l: "4th year", n: 4, age: [22, 26], svc: [3, 3] },
    ],
    divs: [
      ["Mountain", ["Billings", "Glacier", "Great Falls", "Idaho Falls", "Missoula", "Ogden"]],
      ["Pacific", ["Boise", "Long Beach", "Modesto", "Oakland", "Yuba-Sutter", "Grand Junction"]],
    ],
  },
  {
    // THE FLOOR. Not an MLB Partner League. Two disclosed liberties (D41, D42):
    // ownership is fictionalised (one man owns 15 of 16 real clubs — no market
    // exists in which to buy one; the game lets you own one anyway because a
    // ladder needs a bottom rung to stand on), and attendance is a T3 estimate
    // (the league does not collect or release it).
    id: "PECO", name: "Pecos League", games: 54, att: 400, roster: [22, 25],
    partner: false, elev: 4870,
    note: "Not an MLB Partner League — the floor. 22-man, $50-a-week players, 4,870 ft average elevation.",
    // Re-solved 2026-09-04 (DECISIONS.md D86), see the Atlantic entry above
    // — applied on top of `economics.ts`'s already-separate PECOS_SCALE
    // (0.05), which D42 already confirmed correct and this pass left alone.
    opScale: 0.895, cap: 12100,
    comp: [
      { k: "ROOK", l: "Rookie", n: 12, age: [19, 24], svc: [0, 1] },
      { k: "VET", l: "Veteran", n: 10, age: [23, 33], svc: [1, 8] },
    ],
    // Source conflict, left visible rather than resolved by guessing: the Pecos
    // 2026 schedule lists a Grand Junction club, and so does the Pioneer League
    // list above. Both as published — club identity is per-league, so two clubs
    // may share a city name without colliding.
    divs: [
      ["Mountain", ["Alpine", "Blackwell", "Garden City", "Iola", "North Platte", "Pecos", "Santa Fe", "Trinidad"]],
      ["Pacific", ["Bakersfield", "Dublin", "Grand Junction", "Martinez", "Roswell", "San Rafael", "Tucson", "Vallejo"]],
    ],
  },
];

export function indyLeague(name: string): IndyLeague | null {
  return INDY.find((l) => l.name === name) ?? null;
}

export interface LeagueEvent {
  year: number;
  lg: string;
  rename: string;
  wire: string;
  src: string;
}

/**
 * Scheduled real-world league changes — RESEARCH.md §9.8. The world opens
 * in 2026 and is meant to run for decades, so a documented, dated change in
 * year two is not a detail. A rename is applied as a display override
 * (`renames`), never by mutating a club's league key — that key is what
 * finds the league's rules, run-environment proxy, salary scale and
 * schedule; renaming it would silently unhook all four.
 */
export const LEAGUE_EVENTS: readonly LeagueEvent[] = [
  {
    year: 2027,
    lg: "Frontier League",
    rename: "National Association of Professional Baseball",
    wire: "The Frontier League becomes the National Association of Professional Baseball. Same 18 clubs, same MLB Partner League status, new name.",
    src: "Ballpark Digest, 2026-04-29 · T1",
  },
];
