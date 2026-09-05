/**
 * Season rollover — the mechanism that lets a save reach a second year at
 * all, and (as of DECISIONS.md D89) actually SURVIVE many of them. Without
 * it, `advanceDay` (`advance.ts`) simply stops once `state.sched` runs out
 * (`seasonOver: true`, tested in `newgame.test.ts`) and nothing else ever
 * happens — the exact dead end RESEARCH.md §8.5 describes: "players age
 * and nothing else... it makes a long career impossible."
 *
 * NOT a port of `bush-league-v0.10.html`'s own winter cycle (Build 0.9,
 * "THE WINTER" — CHANGELOG.md's own historical entry), and still a
 * deliberately SMALLER slice of it — stated plainly, not left to be
 * discovered later. Build 0.9 is a full annual cycle: weekly in-season
 * contract purchases by affiliated organisations, an exclusive re-sign
 * window, a four-month open market with AI GM valuation and negotiation,
 * and a demand-sized amateur intake. Free agency — the owner (and every AI
 * club) actively signing and releasing SPECIFIC players by name, mid-season
 * — is real, substantial, UI-shaped work of its own (a market/free-agent
 * screen with no home yet) and belongs to the scouting/draft/ownership-
 * ladder pass ROADMAP.md already tracks separately, not folded in here.
 *
 * What this file DOES do, every rollover, for every club in the world: age
 * and develop the existing population (`development.ts`), then churn it
 * (`churn.ts` — an age-curve exit, an instant "exclusive re-sign window"
 * retention, and fresh signings filling whatever's left, all exactly as
 * legal-by-construction as a brand-new world's roster), reset every club's
 * season record, and generate next year's schedule. D87's own original
 * disclosure — "no player enters or leaves... run this for enough
 * consecutive years and the whole world converges toward old" — is what
 * `churn.ts` actually fixes; `rollover.test.ts`'s own age-trend test is
 * updated this pass to prove the population no longer does that.
 *
 * Retirement still isn't modelled as its own concept — no sourced
 * retirement-hazard-by-age curve exists in this project's research
 * (§8.5 asks for one; none found). `churn.ts`'s exit hazard covers the
 * same real-world outcome (a veteran's contract not renewed) without
 * pretending to be a dedicated retirement system.
 *
 * DECISIONS.md D93 adds the amateur draft (`draft.ts`) as the first real
 * step of every rollover, BEFORE anything resets: `runDraft` needs the
 * season the world just finished (standings for draft order, the current
 * population for each org's own pitcher/batter need), not a record already
 * zeroed for the year ahead. Its `byOrg` result is handed straight into
 * `churnWorld`, so a drafted player can land on his own org's affiliate
 * instead of an anonymous fresh signee — and `state.lastDraft` keeps the
 * full pick-by-pick record for the UI, independent of whether every pick
 * actually found a roster slot to land on.
 */
import type { Rng } from "./rng.js";
import { fromSerial } from "./date.js";
import { buildFullSeasonSchedule, seasonWindow } from "./schedule.js";
import { developPopulation } from "./development.js";
import { churnWorld } from "./churn.js";
import { runDraft } from "./draft.js";
import type { GameState } from "./state.js";
import {
  expireScoutingAsk,
  raiseDraftPolicyAsk,
  raiseScoutingAsk,
  reportDraft,
  reportWinter,
  resolveDraftPolicy,
} from "./desk.js";

/**
 * Rolls `state` from the end of one season into the start of the next, in
 * place: every player ages and develops one year, the whole world's
 * population churns (see this file's own header), every club's win/loss/
 * runs/form/games-played resets to a fresh season's zero (the same fields
 * `buildWorld()`'s own `makeClub` zeroes for a brand-new world), a new
 * schedule is generated for `year + 1`, and the game clock jumps to 14
 * days before that new season's own opener — the identical convention
 * `newGame()` already establishes for a save's very first day, reused here
 * rather than invented a second time.
 *
 * Callers decide WHEN to call this — typically once `advanceDay`'s own
 * `seasonOver` flag is true — `advanceDay` itself never calls it
 * automatically (a behavioural change to an already-tested contract this
 * file has no reason to make).
 */
export function startNewSeason(state: GameState, r: Rng): void {
  // D100: the owner's draft policy is settled BEFORE the draft reads it.
  // This ordering is load-bearing, not incidental — resolving after would
  // apply the answer to next year's draft, a year late and invisibly.
  // Consumes no randomness, so the stream below is untouched.
  resolveDraftPolicy(state);
  expireScoutingAsk(state);

  const orgBefore = state.ownedClubId ? countOrg(state, state.ownedClubId) : new Set<string>();

  const draft = runDraft(state.world.clubs, state.players, state.ownedClubId ?? undefined, state.draftPhilosophy, r, state.season.year);
  state.lastDraft = draft.picks.slice();

  developPopulation(state.players, r);
  state.players = churnWorld(state.world.clubs, state.players, state.ownedClubId ?? undefined, r, state.season.year, draft.byOrg);

  if (state.ownedClubId) {
    const orgAfter = countOrg(state, state.ownedClubId);
    let left = 0;
    for (const id of orgBefore) if (!orgAfter.has(id)) left++;
    let arrived = 0;
    for (const id of orgAfter) if (!orgBefore.has(id)) arrived++;
    reportWinter(state, left, arrived);
    reportDraft(state, draft.picks.length, draft.picks.filter((p) => p.clubId === state.ownedClubId).length);
  }

  for (const c of state.world.clubs) {
    c.w = 0;
    c.l = 0;
    c.rs = 0;
    c.ra = 0;
    c.gp = 0;
    c.l10 = [];
    c.strk = 0;
  }

  const year = state.season.year + 1;
  const schedule = buildFullSeasonSchedule(state.world.clubs, year, r);
  state.sched = schedule.games;
  state.sp = 0;
  state.box = [];

  // Next year's policy question goes on the desk now, so the owner has a
  // whole season to answer it rather than being asked at the moment it is
  // needed. Raised after the year advances, so its day is in the new season.
  const mine = state.ownedClubId ? state.world.clubs.find((c) => c.id === state.ownedClubId) : undefined;
  const [open, close] = mine ? seasonWindow(mine, year) : [state.season.open, state.season.close];
  const worldOpen = schedule.games[0]?.[0] ?? open;
  state.season = { ...state.season, year, gp: 0, phase: "offseason", open, close, worldOpen, dates: 0 };
  state.date = fromSerial(Math.min(open, worldOpen) - 14);

  raiseDraftPolicyAsk(state);
  raiseScoutingAsk(state);
}

/**
 * Every player id in one organization — the MLB club plus its affiliates.
 * Used only to count winter arrivals and departures for the desk; a Set of
 * ids rather than a list of players, because the report is counts and the
 * comparison is membership.
 */
function countOrg(state: GameState, orgId: string): Set<string> {
  const own = new Set<string>();
  for (const c of state.world.clubs) {
    if (c.id === orgId || c.parent === orgId) own.add(c.id);
  }
  const ids = new Set<string>();
  for (const p of state.players) if (p.cid && own.has(p.cid)) ids.add(p.id);
  return ids;
}
