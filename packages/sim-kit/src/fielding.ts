/**
 * The fielding model.
 *
 * Until now `def` and `arm` were generated on every batter and read by
 * NOTHING, and `p.pos` separated SP from RP and was otherwise a label. So
 * `chartClub` fielded the nine best bats and a real lineup came out with
 * three right fielders and no catcher. This module is what makes a position
 * mean something.
 *
 * ── WHAT IS SOURCED AND WHAT IS NOT ─────────────────────────────────────
 *
 * SOURCED (RESEARCH.md §21.6, T1/T2 — FanGraphs' WAR positional
 * adjustment): how much harder each position is, in runs per 162 games.
 * That table is canonical and published, and it is the whole basis for
 * position assignment and for pricing a man moved off his natural spot.
 *
 * SOURCED (RESEARCH.md §21.1, T1 — Statcast Fielding Run Value): the
 * out→run conversion. 1 out = 0.9 run in the outfield, 0.75 in the infield.
 * Catcher framing: 1 stolen strike = 0.125 run.
 *
 * NOT SOURCED, and §21.4 is explicit that it does not exist: any bridge
 * from a 20-80 defensive GRADE to runs in the Statcast era. The only two
 * attempts are 2013, UZR-based, and disagree by a factor of 1.4 — Cistulli
 * at 1.00 run per grade point, Smith at 0.71. `RUNS_PER_GRADE` below takes
 * Smith's, as the more conservative of the two and the one with an explicit
 * z-score derivation, and then the constant was CHECKED against a
 * team-level target rather than trusted (see `fielding.test.ts`). Smith's
 * own caveat is the reason it needed checking: the real distribution never
 * populates the 80/20 tails, because an elite glove with no bat does not
 * play every day — and a simulation that DOES populate them will overstate
 * defensive spread on either constant.
 *
 * ── WHY IT ATTACHES WHERE IT DOES ───────────────────────────────────────
 *
 * DIPS: a pitcher has limited control over a ball once it is in play. What
 * happens to it is mostly the defence. So the model attaches at exactly the
 * two places the engine decides a ball in play, and nowhere else:
 *
 *   bab = log5(batter, pitcher, league)   ← gains a third, defensive term
 *   er  = errRate(env)                    ← gains a defensive multiplier
 *
 * plus catcher framing, which is NOT a ball-in-play effect at all — it
 * moves called strikes, so it shifts the pitcher's K and BB before contact
 * is ever made. RESEARCH §21.3 records the 2025 spread as Bailey +25.05
 * runs to Quero −12.90, which makes it the single largest defensive lever
 * in the game and the reason it is modelled separately rather than folded
 * into a catcher's `def`.
 *
 * NO NEW RANDOM NUMBERS ARE DRAWN ANYWHERE IN THIS MODULE. Every figure is
 * a deterministic function of grades that already exist on the player. That
 * is what keeps save-reproducibility (D85) intact through a change this
 * deep in the simulation.
 */
import type { Player, Position } from "./player.js";
import { clamp, nz } from "./util.js";

/** The nine slots a club fields, hardest first — the order positions are filled in. */
export const FIELD_SLOTS = ["C", "SS", "CF", "2B", "3B", "RF", "LF", "1B", "DH"] as const;
export type FieldSlot = (typeof FIELD_SLOTS)[number];

/**
 * FanGraphs' positional adjustment, runs per 162 defensive games
 * (RESEARCH.md §21.6, T1/T2). This IS the defensive spectrum in numbers:
 * a catcher is 25 runs a season harder than a first baseman.
 */
export const POSITION_ADJ: Record<FieldSlot, number> = {
  C: 12.5,
  SS: 7.5,
  CF: 2.5,
  "2B": 2.5,
  "3B": 2.5,
  RF: -7.5,
  LF: -7.5,
  "1B": -12.5,
  DH: -17.5,
};

/**
 * Def runs per point of the 20-80 `def` grade. Smith's 2013 UZR/150 table
 * (RESEARCH.md §21.4, T2): 80 = +22.8, 20 = −19.6, so 42.4 runs across 60
 * grade points ≈ 0.71. Held as a named constant because it is the number
 * most likely to be wrong, and the test that checks it says what it is
 * checking against.
 */
export const RUNS_PER_GRADE = 0.71;

/** Statcast Fielding Run Value, RESEARCH.md §21.1 (T1). */
export const RUN_PER_OUT_OF = 0.9;
export const RUN_PER_OUT_IF = 0.75;
export const RUN_PER_FRAMED_STRIKE = 0.125;

const OUTFIELD = new Set<FieldSlot>(["LF", "CF", "RF"]);

/** A club's own balls in play over a season — the denominator a run of defence is spread across. */
export const BIP_PER_SEASON = 4000;

/**
 * Defensive runs the MEDIAN club actually fields, and therefore the zero
 * point for a defensive effect. MEASURED at +10 across the MLB population
 * (`fieldmeasure`), not assumed: `chartClub` puts the best available glove
 * at each slot, so the nine men on the grass are systematically better than
 * grade 50 even though the underlying population centres there.
 */
export const NEUTRAL_TEAM_RUNS = 10;

/** The same zero point expressed as a mean fielded grade, for the error rate. */
export const NEUTRAL_MEAN_DEF = 52;

/**
 * Position is a KIND as well as a difficulty, and the first version of this
 * model got that wrong. Charging only the spectrum gap produced real
 * alignments with a centre fielder catching — because the gap from CF to C
 * is 10 runs, ~14 grade points, and a good enough bat simply paid it. No
 * amount of hitting makes an outfielder a catcher.
 *
 * So slots belong to families, and moving between families costs far more
 * than moving inside one:
 *
 *   C   — a specialist. Nobody else catches.
 *   IF  — SS, 2B, 3B, 1B shuffle among themselves readily.
 *   OF  — LF, CF, RF likewise.
 *   DH  — anyone; no defence is played there at all.
 *
 * An infielder in the outfield or vice versa is a real thing that happens
 * and is charged accordingly; a non-catcher behind the plate is charged
 * enough that it only occurs when a club genuinely has no catcher, which is
 * exactly the behaviour a short roster should show.
 */
export type PosFamily = "C" | "IF" | "OF" | "DH";

export const FAMILY: Record<FieldSlot, PosFamily> = {
  C: "C",
  SS: "IF",
  "2B": "IF",
  "3B": "IF",
  "1B": "IF",
  LF: "OF",
  CF: "OF",
  RF: "OF",
  DH: "DH",
};

/**
 * Who may stand where — an ELIGIBILITY gate, not a price.
 *
 * The first two attempts PRICED catching (45 grade points) and both were
 * beaten by a good bat: a shortstop at ovr 70 / def 77 scored 61.2 behind
 * the plate against the best natural catcher's 47.2, because a 20-point
 * hitting advantage simply outran an 18-point penalty. That is the wrong
 * shape of model. A shortstop is not an expensive catcher — he is not a
 * catcher, and no batting line changes that.
 *
 * Up the middle is closed: only catchers catch, only infielders play short,
 * only outfielders play centre. The CORNERS are where a club hides a bat,
 * which is exactly what real clubs do with them, and first base and DH take
 * anybody.
 */
export const ELIGIBLE: Record<FieldSlot, readonly PosFamily[]> = {
  C: ["C"],
  SS: ["IF"],
  CF: ["OF"],
  "2B": ["IF"],
  "3B": ["IF"],
  RF: ["OF", "IF"],
  LF: ["OF", "IF"],
  "1B": ["IF", "OF", "C"],
  DH: ["IF", "OF", "C", "DH"],
};

export function eligibleAt(p: Pick<Player, "pos">, slot: FieldSlot): boolean {
  return ELIGIBLE[slot].includes(FAMILY[naturalSlot(p)]);
}

/** Grade points charged for crossing families where it IS allowed (the corners). */
const CROSS_FAMILY = 12;

export function outOfPositionPenalty(natural: FieldSlot, playing: FieldSlot): number {
  if (natural === playing) return 0;
  let cost = 0;

  // The sourced spectrum gap: moving to a HARDER position costs, moving to
  // an easier one is free.
  const gap = POSITION_ADJ[playing] - POSITION_ADJ[natural];
  if (gap > 0) cost += gap / RUNS_PER_GRADE;

  const from = FAMILY[natural];
  const to = FAMILY[playing];
  if (from !== to && to !== "DH") cost += CROSS_FAMILY;
  return cost;
}

/**
 * A player's effective defensive grade in a slot, CLAMPED to the 20-80
 * scale — this is the number run values are computed from, because a grade
 * outside the scale is meaningless.
 */
export function defAt(p: Pick<Player, "pos" | "tru">, slot: FieldSlot): number {
  if (slot === "DH") return 50; // nobody fields at DH; the slot is defensively neutral
  return clamp(defFit(p, slot), 20, 80);
}

/**
 * The same figure UNCLAMPED, and the distinction is load-bearing.
 *
 * `defAt`'s floor of 20 makes a 45-point penalty and a 15-point one cost
 * exactly the same, which turned the catcher wall into a mere floor: a
 * shortstop with a good bat took the job while a natural catcher sat at DH,
 * and the measurement showed 7 of 9 men out of position. Assignment must
 * therefore see the true cost, so a man who cannot do the job scores
 * arbitrarily badly at it rather than bottoming out alongside a man who
 * merely does it poorly.
 */
export function defFit(p: Pick<Player, "pos" | "tru">, slot: FieldSlot): number {
  if (slot === "DH") return 50;
  const raw = nz(p.tru.def) || 50;
  return raw - outOfPositionPenalty(naturalSlot(p), slot);
}

/** Where this player actually belongs. Anything not a field slot (a pitcher's SP/RP) sits at DH. */
export function naturalSlot(p: Pick<Player, "pos">): FieldSlot {
  const pos = p.pos as Position | "SP" | "RP";
  return (FIELD_SLOTS as readonly string[]).includes(pos) ? (pos as FieldSlot) : "DH";
}

/** One fielder's Def runs over a full season at a slot, before the positional adjustment. */
export function defRunsAt(p: Pick<Player, "pos" | "tru">, slot: FieldSlot): number {
  if (slot === "DH") return 0;
  return (defAt(p, slot) - 50) * RUNS_PER_GRADE;
}

export interface TeamDefense {
  /** Sum of every fielder's Def runs — positive is better than average. */
  runs: number;
  /** Outs above average implied by those runs, via the sourced out→run rate. */
  outs: number;
  /** What to add to the league BABIP for balls hit against this club. Negative for good defence. */
  babipDelta: number;
  /** Multiplier on the league error rate. Below 1 for a sure-handed club. */
  errFactor: number;
  /** The catcher's framing runs, kept separate — it moves strikes, not balls in play. */
  framingRuns: number;
  /** Framing expressed as a shift in the pitcher's called-strike rate. */
  framingStrikeShift: number;
}

const EMPTY_DEFENSE: TeamDefense = {
  runs: 0,
  outs: 0,
  babipDelta: 0,
  errFactor: 1,
  framingRuns: 0,
  framingStrikeShift: 0,
};

/**
 * A club's defence, from the nine men actually on the field.
 *
 * `assignment` maps a slot to the player in it — exactly what `chartClub`
 * now produces. A club with nobody at a slot is simply weaker there, rather
 * than throwing: a short roster still has to take the field.
 */
export function teamDefense(assignment: ReadonlyMap<FieldSlot, Player>): TeamDefense {
  if (assignment.size === 0) return EMPTY_DEFENSE;

  let runs = 0;
  let outs = 0;
  for (const slot of FIELD_SLOTS) {
    const p = assignment.get(slot);
    if (!p || slot === "DH") continue;
    const r = defRunsAt(p, slot);
    runs += r;
    outs += r / (OUTFIELD.has(slot) ? RUN_PER_OUT_OF : RUN_PER_OUT_IF);
  }

  // An out above average is a hit that did not happen. Spread across the
  // club's own balls in play, that is a straight shift in BABIP — and the
  // sign is inverted, because a better defence produces a LOWER BABIP.
  //
  // CENTRED ON WHAT CLUBS ACTUALLY FIELD, not on grade 50. Measured: once
  // assignment prefers eligible men and scores their glove at the slot,
  // the median club fields roughly +10 runs of defence, because a club
  // plays its BEST defenders and not a random nine. Left uncentred, every
  // club in the league would suppress BABIP and the whole league's offence
  // would drift off RESEARCH.md §7.1's published lines — a uniform shift
  // that looks like a defence model working and is actually a calibration
  // error.
  const babipDelta = -(runs - NEUTRAL_TEAM_RUNS) / RUN_PER_OUT_IF / BIP_PER_SEASON;

  // Sure hands make fewer errors. Anchored to the same grade scale rather
  // than a second invented constant: a full 30 points of team-average
  // defence moves the error rate by 30%.
  const meanDef = teamMeanDef(assignment);
  const errFactor = clamp(1 - (meanDef - NEUTRAL_MEAN_DEF) / 100, 0.55, 1.6);

  // Framing, driven off the catcher's own grade and modelled in STRIKES
  // rather than runs — see FRAMING_STRIKES_PER_GRADE for why.
  const c = assignment.get("C");
  const framingStrikes = c ? (nz(c.tru.def) - 50) * FRAMING_STRIKES_PER_GRADE : 0;
  const framingRuns = framingStrikes * RUN_PER_FRAMED_STRIKE;
  const framingStrikeShift = framingStrikes / PITCHES_PER_SEASON;

  return { runs, outs, babipDelta, errFactor, framingRuns, framingStrikeShift };
}

/**
 * Called strikes stolen per point of catcher grade above average.
 *
 * MODELLED IN STRIKES, NOT RUNS, AND THAT IS DELIBERATE — the two sourced
 * figures for the same catcher do not agree. RESEARCH.md §21.3 records
 * Patrick Bailey's 2025 as BOTH "+25.05 framing runs" AND "120
 * called-strikes-above-expectation". Those imply 0.21 runs per strike; the
 * Statcast glossary's own general constant (§21.1) is 0.125. Something in
 * that pair is scoped differently from the other and this project has not
 * established which, so it is NOT quietly averaged or reconciled.
 *
 * The strike count is the more direct observation, so the mechanic runs on
 * it: Bailey, the best in baseball, is +120 strikes. Taking him as roughly
 * a 70 grade gives 6 strikes per point. Runs are then REPORTED at the
 * glossary's 0.125, which makes this model's framing runs read conservative
 * against Statcast's own headline number — an understatement chosen on
 * purpose over an unexplained reconciliation.
 */
export const FRAMING_STRIKES_PER_GRADE = 6;

/** Called pitches a club's catchers receive in a season — the denominator for a framing shift. */
export const PITCHES_PER_SEASON = 23000;

export function teamMeanDef(assignment: ReadonlyMap<FieldSlot, Player>): number {
  let t = 0;
  let n = 0;
  for (const slot of FIELD_SLOTS) {
    if (slot === "DH") continue;
    const p = assignment.get(slot);
    if (!p) continue;
    t += defAt(p, slot);
    n++;
  }
  return n ? t / n : 50;
}
