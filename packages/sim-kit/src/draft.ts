/**
 * The amateur draft — RESEARCH.md §1.5. Sourced (T1): 20 rounds, fixed by
 * the 2022-26 CBA. Sourced (T1, one number): the top-6 lottery gives the
 * three worst records 16.5% odds each. Everything else about who gets
 * drafted, in what order, and by what logic is disclosed below as either a
 * real, cited figure or an explicit T3 approximation — never silently
 * invented.
 *
 * Deliberately smaller than the real thing, stated plainly, not left to be
 * discovered later:
 *   - No Competitive Balance Rounds A/B (15 extra picks for specific
 *     small-market clubs — no sourced list of exactly which orgs get them
 *     this pass could find). 20 rounds x 30 clubs = 600 modeled picks, not
 *     the real 2026 draft's 613.
 *   - No bonus pool / slot values / overage tax. RESEARCH.md §1.5 has real
 *     numbers for this ($358.66M total pool, 2026; slot values; the tax
 *     brackets) — a real, separate, sourced financial system left for a
 *     follow-up pass, the same "one system per pass" discipline every
 *     other pass in this project has kept since D86.
 *   - No revenue-sharing lottery-eligibility restriction (real MLB
 *     excludes some clubs from the lottery based on recent revenue-sharing
 *     status). Every one of the worst 18 clubs by record is lottery-
 *     eligible here.
 *   - No real playoff-qualification system exists yet in this project
 *     (ROADMAP.md's own "12-team bracket" is still unbuilt), so "the 18
 *     non-playoff clubs" the real lottery covers is approximated as the
 *     worst 18 of 30 MLB clubs by winning percentage — a disclosed T3
 *     stand-in for a bracket this project hasn't built, not an attempt to
 *     simulate one.
 *   - Every pick is an AI decision, including the owner's own club's picks
 *     — DECISIONS.md's own entry for this pass records why: interactive,
 *     in-the-moment picking would need the rollover flow to pause and
 *     resume around real user input, a state machine nothing in this
 *     engine has built yet. The owner instead sets a draft PHILOSOPHY
 *     (`DraftPhilosophy`) for their own club — every other club defaults
 *     to best-player-available, T3, disclosed.
 *
 * Every pick reads SCOUTED grades (`estOf`/`ovrOf`, already noisy per
 * D24/D90's own sample-size-driven reliability), never the hidden true
 * ones — an AI GM drafting off a perfect read of `p.tru` would be a
 * different, less honest game than the one Law 10 already builds
 * everywhere else. A fresh, zero-sample amateur prospect gets exactly the
 * low reliability (wide noise band) `refineScout`'s own formula already
 * gives anyone with no accumulated sample — the draft's own famous
 * uncertainty falls out of a mechanism this project already had, not a
 * new one invented for this file.
 */
import type { Rng } from "./rng.js";
import type { Club } from "./world.js";
import type { Player, Role } from "./player.js";
import { makePlayer } from "./player.js";
import { LVL } from "./levels.js";
import { refineScout } from "./scouting.js";
import { intIn } from "./roster.js";

export const DRAFT_ROUNDS = 20;
/** T3 — no sourced list of which clubs get Competitive Balance picks exists; every club gets exactly one pick per round. */
const PICKS_PER_ROUND_PER_CLUB = 1;

export type DraftPhilosophy = "BPA" | "NEED" | "UPSIDE";
export const DRAFT_PHILOSOPHIES: readonly DraftPhilosophy[] = ["BPA", "NEED", "UPSIDE"];

/**
 * A snapshot of one pick, taken at draft time — deliberately NOT a live
 * reference resolved through `player.id` on every read, so a browsable
 * draft-day record stays accurate even after the player himself ages,
 * develops, or (per churn.ts) eventually leaves the population entirely.
 */
export interface DraftPickResult {
  overall: number;
  round: number;
  clubId: string;
  playerId: string;
  name: string;
  role: Role;
  pos: string;
  age: number;
  ovr: number;
  pot: number;
}

export interface DraftResult {
  picks: readonly DraftPickResult[];
  /** This year's draftees, grouped by the drafting MLB org's own club id — `rollover.ts` hands this to `churnWorld` so a drafted player can actually land on one of his own org's affiliates instead of a random fresh signee. Picks that never fit an affiliate vacancy (churn.ts's own scope, not this file's) simply never appear in `state.players` — `picks` above is still the complete, permanent record of what happened on draft day. */
  byOrg: ReadonlyMap<string, Player[]>;
}

/** T3 — no sourced draft-eligibility age rule exists in this project's research; shaped like the real high-school-to-college-junior range, not cited to a specific source. */
function draftEligibleAge(r: Rng): number {
  return intIn(r, 18, 21);
}

/**
 * T3 — deliberately below every modeled pro level's own talent centre
 * (Single-A's 33/6 is the lowest, `levels.ts`) and wider-spread than any of
 * them: amateur scouting carries more real bust/star variance than reading
 * a player already inside a pro league's own numbers.
 */
const PROSPECT_SPEC = { c: 28, s: 9 };

function makeProspect(r: Rng, role: Role, id: string): Player {
  const p = makePlayer(r, LVL.A, role, draftEligibleAge(r), { spec: PROSPECT_SPEC, id });
  refineScout(p);
  return p;
}

/** T1: three worst records at 16.5% odds each. Everything past the third slot is T3 — no source found publishes the rest of an 18-team lottery pool's own odds curve, so the remainder splits by a simple descending-linear weighting, renormalized to what's left after the sourced 3 x 16.5%. */
const LOTTERY_TOP_ODDS = 0.165;

function lotteryWeights(n: number): number[] {
  const topN = Math.min(3, n);
  const tailN = n - topN;
  const remainder = Math.max(0, 1 - LOTTERY_TOP_ODDS * topN);
  const tailWeights = Array.from({ length: tailN }, (_, i) => tailN - i);
  const sumTail = tailWeights.reduce((a, b) => a + b, 0) || 1;
  const tail = tailWeights.map((w) => (remainder * w) / sumTail);
  return [...Array<number>(topN).fill(LOTTERY_TOP_ODDS), ...tail];
}

function winPct(c: Pick<Club, "w" | "l">): number {
  const g = c.w + c.l;
  return g > 0 ? c.w / g : 0.5;
}

const LOTTERY_POOL_SIZE = 18;
const LOTTERY_PICKS = 6;

/**
 * Worst-record-first for all 30 clubs, with the sourced top-6 lottery
 * applied within the worst 18 (this project's own stand-in for "non-
 * playoff clubs" — see this file's own header). A live, odds-redistributed
 * draw, the same shape the real lottery broadcast actually runs: each of
 * the 6 slots is drawn from whoever's left, weighted by their own
 * remaining odds, then the rest of the 18-club lottery pool fills in by
 * their own original (worst-first) order, and the 12 clubs that missed the
 * lottery pool entirely follow in their own standings order after that.
 */
export function buildDraftOrder(mlbClubs: readonly Club[], r: Rng): string[] {
  const sorted = [...mlbClubs].sort((a, b) => winPct(a) - winPct(b));
  const poolSize = Math.min(LOTTERY_POOL_SIZE, sorted.length);
  const pool = sorted.slice(0, poolSize);
  const rest = sorted.slice(poolSize);

  const remainingIds = pool.map((c) => c.id);
  let weights = lotteryWeights(poolSize);
  const drawn: string[] = [];
  const picks = Math.min(LOTTERY_PICKS, remainingIds.length);
  for (let slot = 0; slot < picks; slot++) {
    const total = weights.reduce((a, b) => a + b, 0) || 1;
    let x = r() * total;
    let idx = weights.length - 1;
    for (let i = 0; i < weights.length; i++) {
      x -= weights[i]!;
      if (x <= 0) {
        idx = i;
        break;
      }
    }
    drawn.push(remainingIds[idx]!);
    remainingIds.splice(idx, 1);
    weights.splice(idx, 1);
  }

  return [...drawn, ...remainingIds, ...rest.map((c) => c.id)];
}

/** Each MLB org's current pitcher share across its own MLB roster and every affiliate found via `Club.parent` — the input `DraftPhilosophy.NEED` biases against, target ~0.47 per this codebase's own established roster-composition convention (`roster.ts`'s `nP`). */
/**
 * Each org's pitcher share of its whole system, keyed by MLB club id.
 * Exported since D100 so the desk can recommend a draft policy from the same
 * signal the draft itself uses to score need — one number, one meaning.
 */
export function pitcherRatioByOrg(clubs: readonly Club[], players: readonly Player[]): Map<string, number> {
  const clubById = new Map(clubs.map((c) => [c.id, c] as const));
  const counts = new Map<string, { p: number; b: number }>();
  for (const pl of players) {
    if (!pl.cid) continue;
    const club = clubById.get(pl.cid);
    if (!club) continue;
    const orgId = club.lvl === "MLB" ? club.id : club.parent;
    if (!orgId) continue;
    const entry = counts.get(orgId) ?? { p: 0, b: 0 };
    if (pl.role === "P") entry.p++;
    else entry.b++;
    counts.set(orgId, entry);
  }
  const ratios = new Map<string, number>();
  for (const [orgId, { p, b }] of counts) ratios.set(orgId, p / Math.max(1, p + b));
  return ratios;
}

/** The pitcher share the NEED philosophy steers an org toward. Exported for the desk's recommendation (D100). */
export const NEED_TARGET_P_RATIO = 0.47;
const NEED_BONUS = 6;

function scoreProspect(p: Player, philosophy: DraftPhilosophy, pRatio: number | undefined): number {
  if (philosophy === "UPSIDE") return p.pot;
  if (philosophy === "NEED" && pRatio != null) {
    const wantsPitching = pRatio < NEED_TARGET_P_RATIO;
    return p.ovr + (p.role === "P" === wantsPitching ? NEED_BONUS : 0);
  }
  return p.ovr;
}

function bestIndex(prospects: readonly Player[], philosophy: DraftPhilosophy, pRatio: number | undefined): number {
  let bestI = 0;
  let bestS = -Infinity;
  for (let i = 0; i < prospects.length; i++) {
    const s = scoreProspect(prospects[i]!, philosophy, pRatio);
    if (s > bestS) {
      bestS = s;
      bestI = i;
    }
  }
  return bestI;
}

/**
 * Runs the whole amateur draft for one rollover: builds the pool, the
 * order (with its lottery), and every pick, for every one of the 30 MLB
 * clubs across all `DRAFT_ROUNDS` rounds. `clubs`/`players` should be the
 * standings and population from BEFORE this year's churn/reset — a club's
 * draft position depends on the season it just finished, not a record
 * already zeroed for the year ahead.
 */
export function runDraft(
  clubs: readonly Club[],
  players: readonly Player[],
  ownedClubId: string | undefined,
  ownedPhilosophy: DraftPhilosophy,
  r: Rng,
  /** The draft year — part of every prospect's id (D97). One draft per year, so (year, i) is unique. */
  year: number,
): DraftResult {
  const mlbClubs = clubs.filter((c) => c.lvl === "MLB");
  const order = buildDraftOrder(mlbClubs, r);
  const pRatios = pitcherRatioByOrg(clubs, players);

  const poolSize = DRAFT_ROUNDS * order.length * PICKS_PER_ROUND_PER_CLUB;
  const nP = Math.round(poolSize * 0.47);
  const prospects: Player[] = [];
  for (let i = 0; i < poolSize; i++) prospects.push(makeProspect(r, i < nP ? "P" : "B", `pd:${year}:${i}`));

  const picks: DraftPickResult[] = [];
  const byOrg = new Map<string, Player[]>();
  let overall = 0;

  for (let round = 1; round <= DRAFT_ROUNDS; round++) {
    for (const clubId of order) {
      overall++;
      const philosophy: DraftPhilosophy = clubId === ownedClubId ? ownedPhilosophy : "BPA";
      const idx = bestIndex(prospects, philosophy, pRatios.get(clubId));
      const [player] = prospects.splice(idx, 1);
      if (!player) continue;

      picks.push({
        overall,
        round,
        clubId,
        playerId: player.id,
        name: player.nm,
        role: player.role,
        pos: player.pos,
        age: player.age,
        ovr: player.ovr,
        pot: player.pot,
      });

      const list = byOrg.get(clubId);
      if (list) list.push(player);
      else byOrg.set(clubId, [player]);
    }
  }

  return { picks, byOrg };
}
