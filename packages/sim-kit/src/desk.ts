/**
 * The owner's desk — what actually reaches it, and when.
 *
 * `delegation.ts` is the pure leaf: the dial, the ask, the log line, and no
 * knowledge of `GameState`. This file is the other half: the emitters that
 * know what happened in the world and route it through the dial. Keeping
 * them apart is what lets `state.ts` import the delegation types without a
 * cycle, and what keeps the routing rules testable without building a world.
 *
 * ## Why these emitters and not the ones the design work proposed
 *
 * Four parallel designs all put every emitter at the rollover. That was
 * measured and rejected: `startNewSeason` runs ONCE a year and `advanceDay`
 * runs ~190 times, so a desk fed only by the rollover is empty on 189 days
 * out of 190 — an annual report, not a desk. The proposal's own fantasy is
 * "you arrive at your desk and things are waiting," and once-a-year mail
 * does not deliver it.
 *
 * A month-end close was the obvious in-season candidate, and the design
 * review's specific suggestion was a **cash call** — borrow, cut scouting,
 * or ride it out when projected cash breaks a floor. **Measuring the cash
 * curve killed it, which is why it is not here.** Across three seasons,
 * every club at every level accumulates cash monotonically:
 *
 * | club | start | trough | after 3 seasons |
 * |---|---|---|---|
 * | MLB (NYY) | $170.0M | $162.7M | $334.9M |
 * | AAA | $0.82M | $0.66M | $10.67M |
 * | Single-A | $0.82M | $0.68M | $2.63M |
 * | INDY (ALPB) | $1.14M | $0.85M | $4.57M |
 *
 * Nothing ever approaches trouble, because `payrollBudget` and `ticketPrice`
 * are both inert (written at `newGame`, read by nothing) so there is no way
 * to overspend, and there is no owner distribution or capex draining the
 * balance. A cash-floor trigger would have been a mechanic that never fires.
 * Shipping it would have been wallpaper, and would have taught the player
 * the desk is decorative — the precise failure the dial exists to avoid.
 *
 * So the in-season content is what the engine can honestly support today:
 * a **month-end close** as a notice (real numbers the ledger just produced),
 * and a **scouting budget** ask once a season — the one owner-native lever
 * that is genuinely live (D90: it posts to account 5300 monthly and feeds
 * `scoutBoostFor`, which sets how reliable your own players' grades are).
 * That ask also closes a gap this project has carried since v2.11.0: there
 * has never been any owner-facing way to move the scouting budget at all.
 */
import type { GameState } from "./state.js";
import type { DeskAsk, DelegableDomain, DelegationLevel } from "./delegation.js";
import {
  answerAsk,
  askFor,
  asksFirst,
  clearAsk,
  delegationFor,
  pushLog,
  raiseAsk,
  recommends,
  resolveAsk,
  surfaces,
} from "./delegation.js";
import { dateToSerial } from "./date.js";
import { cash, incomeStatement } from "./ledger.js";
import { econFor } from "./economics.js";
import { NEED_TARGET_P_RATIO, pitcherRatioByOrg, type DraftPhilosophy } from "./draft.js";
import { SCOUT_BOOST_SATURATE_AT } from "./scouting.js";
import { money } from "./format.js";

/** Writes a line at every level; marks it for the desk unless the area is Silent. */
function report(state: GameState, domain: DelegableDomain, tag: string, day: number, copy: string): void {
  const level = delegationFor(state.delegation, domain);
  pushLog(state.log, {
    d: day,
    t: tag,
    c: copy,
    dm: domain,
    ...(surfaces(level) ? { sf: 1 as const } : {}),
  });
}

// ---- Draft policy: the annual ask ----

export const DRAFT_POLICY_TAG = "draft.policy";

const PHILOSOPHY_LABEL: Record<DraftPhilosophy, string> = {
  BPA: "Best player available",
  NEED: "Fill our needs",
  UPSIDE: "Chase upside",
};

/**
 * What the org would advise. Derived from the same signal `runDraft` itself
 * scores need with — the org's pitcher share against `NEED_TARGET_P_RATIO` —
 * so the recommendation and the draft agree about what "short of pitching"
 * means instead of each having its own opinion.
 *
 * Two outcomes, not three, because there are exactly two real signals here.
 * `UPSIDE` stays available to the owner but is never recommended: there is
 * no measured basis for advising it yet, and inventing one to fill out the
 * table would be a worse lie than a shorter list.
 */
export function recommendedPhilosophy(state: GameState): DraftPhilosophy {
  if (!state.ownedClubId) return "BPA";
  const ratios = pitcherRatioByOrg(state.world.clubs, state.players);
  const mine = ratios.get(state.ownedClubId);
  if (mine === undefined) return "BPA";
  return mine < NEED_TARGET_P_RATIO - 0.02 ? "NEED" : "BPA";
}

/**
 * Puts next year's draft policy on the desk, if the dial says to ask.
 *
 * Raised at the END of a rollover (and at `newGame`) so the owner has a
 * whole season to answer before it is consumed by the next one. Under
 * Notify or Silent nothing is raised — the org simply keeps its policy and
 * says so when the draft happens.
 */
export function raiseDraftPolicyAsk(state: GameState): void {
  const level = delegationFor(state.delegation, "draft");
  if (!asksFirst(level)) return;
  if (askFor(state.asks, "draft", DRAFT_POLICY_TAG)) return;

  const counter = { value: state.nextAsk };
  const ask = raiseAsk(counter, {
    domain: "draft",
    tag: DRAFT_POLICY_TAG,
    day: dateToSerial(state.date),
    level,
    options: (["BPA", "NEED", "UPSIDE"] as DraftPhilosophy[]).map((id) => ({ id, label: PHILOSOPHY_LABEL[id] })),
    // Hands-on means nothing changes without you, so the fallback is the
    // policy already in force. Approve means you delegated, so the fallback
    // is what your people advised.
    fallback: level === "hands-on" ? state.draftPhilosophy : recommendedPhilosophy(state),
    recommended: recommends(level) ? recommendedPhilosophy(state) : null,
    facts: { pitcherShare: Math.round((pitcherRatioByOrg(state.world.clubs, state.players).get(state.ownedClubId ?? "") ?? 0) * 1000) / 10 },
  });
  state.nextAsk = counter.value;
  state.asks = [...state.asks, ask];
}

/**
 * Consumes the draft ask, if any, into `state.draftPhilosophy`. Called at
 * the top of `startNewSeason`, before `runDraft` reads the policy —
 * an ordering that is load-bearing, not incidental.
 */
export function resolveDraftPolicy(state: GameState): void {
  const day = dateToSerial(state.date);
  const ask = askFor(state.asks, "draft", DRAFT_POLICY_TAG);
  const level = delegationFor(state.delegation, "draft");

  if (!ask) {
    // Notify or Silent: nobody was asked, so the org acts on its own read.
    if (!asksFirst(level)) {
      const rec = recommendedPhilosophy(state);
      const changed = rec !== state.draftPhilosophy;
      state.draftPhilosophy = rec;
      report(state, "draft", "draft.policy.set", day,
        changed
          ? `Your front office switched the draft board to ${PHILOSOPHY_LABEL[rec].toLowerCase()}.`
          : `Your front office kept the draft board on ${PHILOSOPHY_LABEL[rec].toLowerCase()}.`);
    }
    return;
  }

  const picked = resolveAsk(ask) as DraftPhilosophy;
  const answered = ask.chosen !== null;
  state.draftPhilosophy = picked;
  state.asks = clearAsk(state.asks, ask.id);
  report(state, "draft", "draft.policy.set", day,
    answered
      ? `You set the draft board to ${PHILOSOPHY_LABEL[picked].toLowerCase()}.`
      : `You didn't weigh in, so the draft board went with ${PHILOSOPHY_LABEL[picked].toLowerCase()}.`);
}

/** What the draft did. One line, not 20 picks — the picks are already on the Draft page. */
export function reportDraft(state: GameState, picked: number, ownPicks: number): void {
  report(state, "draft", "draft.complete", dateToSerial(state.date),
    `The amateur draft is done — ${picked} players taken league-wide, ${ownPicks} of them yours.`);
}

/**
 * What the winter did to the owner's own organization. Counts, never a list:
 * a five-club org turns over ~150 player-years, and a firehose of names is
 * not something an owner reads. The Roster page has the names.
 */
export function reportWinter(state: GameState, left: number, arrived: number): void {
  report(state, "signings", "signings.winter", dateToSerial(state.date),
    `Winter business closed — ${left} players left the organization, ${arrived} came in.`);
}

// ---- Scouting budget: the in-season ask ----

export const SCOUTING_TAG = "scouting.budget";

/**
 * Puts the scouting budget on the desk, once a season, raised at the
 * rollover alongside the draft policy.
 *
 * Once, not monthly: the first draft of this raised it at every in-season
 * month crossing, which meant that answering it in April got you the same
 * question again in May — nagging, and the boost curve has nothing like
 * that resolution anyway. Raised annually and answerable at any point, it
 * takes effect at whichever month crossing follows the answer, so the
 * decision still lands in-season even though the question is annual.
 *
 * Options are anchored on the club's own baseline and on
 * `SCOUT_BOOST_SATURATE_AT` — past that multiple more money buys literally
 * nothing, so offering a bigger number would be dressing a bad deal up as
 * a choice.
 */
export function raiseScoutingAsk(state: GameState): void {
  const level = delegationFor(state.delegation, "scouting");
  if (!asksFirst(level)) return;
  if (askFor(state.asks, "scouting", SCOUTING_TAG)) return;

  const mine = state.world.clubs.find((c) => c.id === state.ownedClubId);
  if (!mine) return;
  const baseline = econFor(mine).scouting;
  if (!(baseline > 0)) return;

  const lean = Math.round(baseline * 0.5);
  const hold = Math.round(baseline);
  const full = Math.round(baseline * SCOUT_BOOST_SATURATE_AT);

  const counter = { value: state.nextAsk };
  const ask = raiseAsk(counter, {
    domain: "scouting",
    tag: SCOUTING_TAG,
    day: dateToSerial(state.date),
    level,
    options: [
      { id: "lean", label: `Trim to ${money(lean)}` },
      { id: "hold", label: `Hold at ${money(hold)}` },
      { id: "full", label: `Go to ${money(full)} — as far as it's worth spending` },
    ],
    // Doing nothing means nothing changes, at every level. Scouting money is
    // spent monthly and compounds; taking a bigger bill from an owner who
    // never answered would be a fallback that costs them for silence.
    fallback: "hold",
    recommended: recommends(level) ? "full" : null,
    facts: { lean, hold, full, current: Math.round(state.scoutingBudget) },
  });
  state.nextAsk = counter.value;
  state.asks = [...state.asks, ask];
}

/** Consumes the scouting ask into `state.scoutingBudget`. Called at a month crossing, before the month posts. */
export function resolveScoutingBudget(state: GameState): void {
  const ask = askFor(state.asks, "scouting", SCOUTING_TAG);
  if (!ask) return;
  if (ask.chosen === null) return; // Unanswered: "hold" costs nothing, so let it sit until the season ends.

  const day = dateToSerial(state.date);
  const picked = resolveAsk(ask);
  const next = ask.facts[picked];
  state.asks = clearAsk(state.asks, ask.id);
  if (next === undefined) return;

  const before = state.scoutingBudget;
  state.scoutingBudget = next;
  report(state, "scouting", "scouting.budget.set", day,
    next === before
      ? `You held the scouting budget at ${money(next)}.`
      : `You moved the scouting budget from ${money(before)} to ${money(next)}.`);
}

/** Drops an unanswered scouting ask at the rollover, so next season asks fresh rather than stacking. */
export function expireScoutingAsk(state: GameState): void {
  const ask = askFor(state.asks, "scouting", SCOUTING_TAG);
  if (!ask || ask.chosen !== null) return;
  state.asks = clearAsk(state.asks, ask.id);
  report(state, "scouting", "scouting.budget.held", dateToSerial(state.date),
    `You never revisited the scouting budget, so it stayed at ${money(state.scoutingBudget)} all year.`);
}

// ---- The month-end close: the notice that arrives on an ordinary Tuesday ----

/**
 * The close, reported the day the calendar turns. Three numbers the ledger
 * has just produced — no forecast model, no new simulation, nothing this
 * file computes that `postMonth` did not already.
 *
 * Filed under `financing` because it is the owner's money. It is a notice,
 * never an ask: the cash measurement above says there is nothing to decide
 * here yet, and a decision with no stakes is worse than a clean report.
 */
export function reportMonthClose(state: GameState, monthStart: number, day: number): void {
  const onHand = cash(state.ledger);
  const month = incomeStatement(state.ledger, monthStart, day);
  const sign = month.net >= 0 ? "+" : "−";
  report(state, "financing", "finance.monthClose", day,
    `Month closed ${sign}${money(Math.abs(month.net))}. Cash on hand ${money(onHand)}.`);
}

// ---- Answering, from the app ----

/** Records the owner's answer to an ask. The engine consumes it later, at the moment it matters. */
export function answer(state: GameState, askId: string, optionId: string): void {
  state.asks = answerAsk(state.asks, askId, optionId);
}

/** The level in force for an area — re-exported so the app has one import for the desk. */
export function levelFor(state: GameState, domain: DelegableDomain): DelegationLevel {
  return delegationFor(state.delegation, domain);
}

/** Every open question, in the order raised. */
export function openAsks(state: GameState): readonly DeskAsk[] {
  return state.asks;
}
