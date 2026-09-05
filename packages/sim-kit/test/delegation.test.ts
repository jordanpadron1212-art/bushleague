/**
 * Verification for `delegation.ts` and `desk.ts` (DECISIONS.md D100).
 *
 * The trap in testing a delegation dial is proving inertness and filing it
 * as correctness. "Silent and Hands-on produce identical simulations" is
 * trivially true if the dial does nothing, and a suite built on it goes
 * green for the wrong reason. Two things guard against that here:
 *
 *  1. **A control.** `simFingerprint` is shown to detect a single extra RNG
 *     draw before it is used to assert any equivalence. Without that, every
 *     "these are identical" claim below would be a sentence rather than a
 *     measurement.
 *  2. **The right invariant.** The property is that the dial's ROUTING —
 *     which log lines are written, which asks are raised — cannot move the
 *     simulation. It is NOT that the owner's ANSWER cannot: measured, the
 *     same rollover consumes 310,466 draws under BPA, 309,971 under NEED
 *     and 309,540 under UPSIDE, because a different draftee reaches a
 *     different affiliate and `churnClub`'s jersey-number loop draws a
 *     variable number of values. The owner's answer legitimately changes
 *     the world — that is what an answer is. Asserting otherwise would
 *     enshrine something untrue.
 */
import { describe, expect, it } from "vitest";
import { newGame } from "../src/newgame.js";
import { advanceDay } from "../src/advance.js";
import { startNewSeason } from "../src/rollover.js";
import { mulberry32, type Rng } from "../src/rng.js";
import type { GameState } from "../src/state.js";
import {
  DEFAULT_DELEGATION,
  DELEGABLE_DOMAINS,
  DELEGATION_LEVELS,
  DOMAINS,
  LOG_CAP,
  PRESETS,
  acknowledgeLog,
  answerAsk,
  clearAsk,
  defaultDelegation,
  delegationFor,
  normalizeDelegation,
  pushLog,
  raiseAsk,
  resolveAsk,
  setDelegation,
  unreadCount,
  type DelegationLevel,
  type DeskAsk,
  type LogEntry,
} from "../src/delegation.js";
import {
  DRAFT_POLICY_TAG,
  SCOUTING_TAG,
  TICKET_TAG,
  raiseDraftPolicyAsk,
  raiseScoutingAsk,
  raiseTicketAsk,
  recommendedPhilosophy,
  resolveDraftPolicy,
} from "../src/desk.js";

function playOut(s: GameState): void {
  let g = 0;
  while (g++ < 400) if (advanceDay(s).seasonOver) return;
  throw new Error("season never ended");
}

/**
 * A cheap hash over everything the simulation produces. Any shift in the
 * RNG stream moves at least one of these, so a matching fingerprint is
 * evidence of an identical world rather than of a shallow comparison.
 */
function simFingerprint(s: GameState): string {
  let h = 0;
  const mix = (str: string) => {
    for (let i = 0; i < str.length; i++) h = (Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0);
  };
  for (const c of s.world.clubs) mix(`${c.id}|${c.w}|${c.l}|${c.rs}|${c.ra}`);
  for (const p of s.players) mix(`${p.id}|${p.cid ?? ""}|${p.ovr}|${p.num}|${p.age}`);
  return h.toString(16);
}

function withLevels(level: DelegationLevel): GameState["delegation"] {
  const out = defaultDelegation();
  for (const d of DELEGABLE_DOMAINS) out[d] = level;
  return out;
}

describe("the control — the fingerprint has teeth", () => {
  it("detects ONE extra RNG draw at a rollover", () => {
    const a = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
    const b = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
    expect(simFingerprint(a)).toBe(simFingerprint(b));

    startNewSeason(a, mulberry32(1234));
    // Identical seed, one value burned first.
    const burned = mulberry32(1234);
    burned();
    startNewSeason(b, burned as Rng);

    expect(simFingerprint(a)).not.toBe(simFingerprint(b));
  }, 120_000);

  it("and it does NOT report a difference where there is none", () => {
    const a = newGame({ ownedClubId: "MLB_NYY", seed: 9, year: 2026 });
    const b = newGame({ ownedClubId: "MLB_NYY", seed: 9, year: 2026 });
    startNewSeason(a, mulberry32(77));
    startNewSeason(b, mulberry32(77));
    expect(simFingerprint(a)).toBe(simFingerprint(b));
  }, 120_000);
});

describe("the dial cannot move the simulation — routing invariance", () => {
  it("all four levels produce byte-identical worlds when the resulting policy is the same", () => {
    // Chosen so every level lands on the same philosophy: the org starts at
    // BPA and BPA is also what the front office would advise, so hands-on's
    // "keep what you had", approve's "take the recommendation", and
    // notify/silent's "apply the recommendation" all agree.
    const probe = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
    expect(probe.draftPhilosophy).toBe("BPA");
    expect(recommendedPhilosophy(probe)).toBe("BPA");

    const prints = DELEGATION_LEVELS.map((level) => {
      const s = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
      s.delegation = withLevels(level);
      playOut(s);
      startNewSeason(s, mulberry32(4242));
      return simFingerprint(s);
    });

    expect(new Set(prints).size).toBe(1);
  }, 300_000);

  it("but the owner's ANSWER does change the world — recorded, because a test asserting otherwise would be wrong", () => {
    const a = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
    const b = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
    a.draftPhilosophy = "BPA";
    b.draftPhilosophy = "UPSIDE";
    a.delegation = withLevels("silent");
    b.delegation = withLevels("silent");
    // Silent applies the recommendation, so force the difference to survive.
    a.asks = [];
    b.asks = [];
    playOut(a);
    playOut(b);
    a.delegation.draft = "hands-on"; // hands-on with no ask keeps the current policy
    b.delegation.draft = "hands-on";
    startNewSeason(a, mulberry32(4242));
    startNewSeason(b, mulberry32(4242));
    expect(simFingerprint(a)).not.toBe(simFingerprint(b));
  }, 300_000);
});

describe("staff is never delegable — structurally, not by convention", () => {
  it("delegationFor always answers hands-on for staff", () => {
    for (const level of DELEGATION_LEVELS) {
      expect(delegationFor(withLevels(level), "staff")).toBe("hands-on");
    }
  });

  it("a hand-edited save carrying a staff setting cannot change it", () => {
    const raw = JSON.parse('{"staff":"silent","draft":"silent"}') as unknown;
    const settings = normalizeDelegation(raw);
    expect(delegationFor(settings, "staff")).toBe("hands-on");
    // ...and the key is dropped rather than carried in saves forever.
    expect(settings).not.toHaveProperty("staff");
    expect(settings.draft).toBe("silent");
  });
});

describe("the settings map", () => {
  it("DOMAINS covers every DecisionDomain exactly once, and DEFAULT_DELEGATION every delegable one", () => {
    const ids = DOMAINS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(ids)).toEqual(new Set([...DELEGABLE_DOMAINS, "staff"]));
    expect(Object.keys(DEFAULT_DELEGATION).sort()).toEqual([...DELEGABLE_DOMAINS].sort());
  });

  it("every preset is total and legal, and none mentions staff", () => {
    for (const [id, preset] of Object.entries(PRESETS)) {
      expect(Object.keys(preset.settings).sort(), id).toEqual([...DELEGABLE_DOMAINS].sort());
      for (const level of Object.values(preset.settings)) {
        expect(DELEGATION_LEVELS, id).toContain(level);
      }
      expect(preset.settings, id).not.toHaveProperty("staff");
    }
  });

  it("normalizeDelegation keeps what it recognizes and defaults the rest", () => {
    expect(normalizeDelegation(undefined)).toEqual(DEFAULT_DELEGATION);
    expect(normalizeDelegation(null)).toEqual(DEFAULT_DELEGATION);
    expect(normalizeDelegation("nope")).toEqual(DEFAULT_DELEGATION);
    expect(normalizeDelegation({ draft: "banana" }).draft).toBe(DEFAULT_DELEGATION.draft);
    expect(normalizeDelegation({ draft: "silent" }).draft).toBe("silent");
    expect(normalizeDelegation({ draft: "silent" }).trades).toBe(DEFAULT_DELEGATION.trades);
  });

  it("setDelegation never mutates", () => {
    const a = defaultDelegation();
    const b = setDelegation(a, "draft", "silent");
    expect(a.draft).toBe(DEFAULT_DELEGATION.draft);
    expect(b.draft).toBe("silent");
  });

  it("every domain declares honestly whether anything stands behind it", () => {
    // Three are live today. If this number changes, it is because a system
    // was wired up or removed — not something to update to make a test pass.
    expect(DOMAINS.filter((d) => d.live).map((d) => d.id).sort()).toEqual(["draft", "scouting", "signings", "ticketing"]);
    for (const d of DOMAINS) expect(d.note.length, d.id).toBeGreaterThan(10);
  });
});

describe("asks", () => {
  const opts = [
    { id: "a", label: "A" },
    { id: "b", label: "B" },
  ];
  const base = { domain: "draft" as const, tag: "t", day: 1, level: "approve" as const, options: opts };

  it("mints monotonic ids from the caller's counter, never randomness", () => {
    const counter = { value: 1 };
    const one = raiseAsk(counter, { ...base, fallback: "a", recommended: "b" });
    const two = raiseAsk(counter, { ...base, fallback: "a", recommended: "b" });
    expect(one.id).toBe("ask:1");
    expect(two.id).toBe("ask:2");
    expect(counter.value).toBe(3);
  });

  it("refuses a fallback that isn't one of its options — a deadlock caught at the emitter", () => {
    expect(() => raiseAsk({ value: 1 }, { ...base, fallback: "zzz", recommended: null })).toThrow(/fallback/);
  });

  it("refuses a recommendation that isn't one of its options", () => {
    expect(() => raiseAsk({ value: 1 }, { ...base, fallback: "a", recommended: "zzz" })).toThrow(/recommendation/);
  });

  it("resolves to the answer when answered, and to the fallback when not", () => {
    const ask = raiseAsk({ value: 1 }, { ...base, fallback: "a", recommended: "b" });
    expect(resolveAsk(ask)).toBe("a");
    const [answered] = answerAsk([ask], ask.id, "b");
    expect(resolveAsk(answered!)).toBe("b");
  });

  it("ignores an answer to an unknown ask or an option that isn't on it, rather than throwing at a stale click", () => {
    const ask = raiseAsk({ value: 1 }, { ...base, fallback: "a", recommended: null });
    expect(answerAsk([ask], "ask:999", "b")[0]!.chosen).toBeNull();
    expect(answerAsk([ask], ask.id, "not-an-option")[0]!.chosen).toBeNull();
  });

  it("answering twice lands once — the last answer, not two applications", () => {
    const ask = raiseAsk({ value: 1 }, { ...base, fallback: "a", recommended: null });
    let asks: DeskAsk[] = [ask];
    asks = answerAsk(asks, ask.id, "b");
    asks = answerAsk(asks, ask.id, "b");
    expect(asks.length).toBe(1);
    expect(asks[0]!.chosen).toBe("b");
  });

  it("survives a JSON round trip unchanged — Law 2, and structuredClone wouldn't catch a Date", () => {
    const ask = raiseAsk({ value: 1 }, { ...base, fallback: "a", recommended: "b", facts: { n: 3 } });
    expect(JSON.parse(JSON.stringify(ask))).toEqual(ask);
    expect(JSON.parse(JSON.stringify(defaultDelegation()))).toEqual(defaultDelegation());
  });

  it("clearAsk removes exactly one", () => {
    const c = { value: 1 };
    const one = raiseAsk(c, { ...base, fallback: "a", recommended: null });
    const two = raiseAsk(c, { ...base, fallback: "a", recommended: null });
    expect(clearAsk([one, two], one.id).map((a) => a.id)).toEqual([two.id]);
  });
});

describe("the log", () => {
  it("caps at LOG_CAP, dropping oldest first", () => {
    const log: LogEntry[] = [];
    for (let i = 0; i < LOG_CAP + 50; i++) pushLog(log, { d: i, t: "t", c: `line ${i}` });
    expect(log.length).toBe(LOG_CAP);
    expect(log[0]!.c).toBe("line 50");
    expect(log[log.length - 1]!.c).toBe(`line ${LOG_CAP + 49}`);
  });

  it("counts and clears unread lines", () => {
    const log: LogEntry[] = [
      { d: 1, t: "a", c: "x", sf: 1 },
      { d: 2, t: "b", c: "y" },
      { d: 3, t: "c", c: "z", sf: 1 },
    ];
    expect(unreadCount(log)).toBe(2);
    const read = acknowledgeLog(log);
    expect(unreadCount(read)).toBe(0);
    expect(read[0]).not.toHaveProperty("sf");
    expect(read.map((l) => l.c)).toEqual(["x", "y", "z"]);
  });
});

describe("the four levels are four different games — the point of shipping the dial", () => {
  /**
   * The failure this guards against is the one every design of this feature
   * risked: a dial the player sets before playing that produces an identical
   * experience whatever they choose. Each level is checked for what it
   * actually does, not merely that it is stored.
   */
  function fresh(level: DelegationLevel): GameState {
    const s = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
    s.delegation = withLevels(level);
    s.asks = [];
    s.log = [];
    return s;
  }

  it("hands-on asks, offers NO recommendation, and changes nothing if ignored", () => {
    const s = fresh("hands-on");
    s.draftPhilosophy = "UPSIDE";
    raiseDraftPolicyAsk(s);

    const ask = s.asks.find((a) => a.tag === DRAFT_POLICY_TAG);
    expect(ask).toBeDefined();
    // No staff opinion: under hands-on you said you'd decide.
    expect(ask!.recommended).toBeNull();
    // And the fallback is the status quo — nothing happens without you.
    expect(ask!.fallback).toBe("UPSIDE");

    resolveDraftPolicy(s);
    expect(s.draftPhilosophy).toBe("UPSIDE");
  });

  it("approve asks, DOES recommend, and takes the recommendation if ignored", () => {
    const s = fresh("approve");
    s.draftPhilosophy = "UPSIDE";
    raiseDraftPolicyAsk(s);

    const ask = s.asks.find((a) => a.tag === DRAFT_POLICY_TAG)!;
    const rec = recommendedPhilosophy(s);
    expect(ask.recommended).toBe(rec);
    expect(ask.fallback).toBe(rec);

    resolveDraftPolicy(s);
    // You delegated, so silence means your people's call was taken.
    expect(s.draftPhilosophy).toBe(rec);
    expect(s.draftPhilosophy).not.toBe("UPSIDE");
  });

  it("an answered ask beats the fallback, and the log says it was yours", () => {
    const s = fresh("approve");
    raiseDraftPolicyAsk(s);
    const ask = s.asks.find((a) => a.tag === DRAFT_POLICY_TAG)!;
    s.asks = answerAsk(s.asks, ask.id, "UPSIDE");

    resolveDraftPolicy(s);
    expect(s.draftPhilosophy).toBe("UPSIDE");
    expect(s.asks.find((a) => a.tag === DRAFT_POLICY_TAG)).toBeUndefined();
    expect(s.log.some((l) => l.t === "draft.policy.set" && /^You set/.test(l.c))).toBe(true);
  });

  it("notify never asks, acts on its own, and puts a line on the desk", () => {
    const s = fresh("notify");
    raiseDraftPolicyAsk(s);
    expect(s.asks).toEqual([]);

    resolveDraftPolicy(s);
    const line = s.log.find((l) => l.t === "draft.policy.set");
    expect(line).toBeDefined();
    expect(line!.sf).toBe(1); // surfaced
    expect(line!.c).toMatch(/front office/i);
  });

  it("silent never asks, acts, and writes the record WITHOUT surfacing it", () => {
    const s = fresh("silent");
    raiseDraftPolicyAsk(s);
    expect(s.asks).toEqual([]);

    resolveDraftPolicy(s);
    const line = s.log.find((l) => l.t === "draft.policy.set");
    // The record is never optional — Silent costs you the desk item, not the log.
    expect(line).toBeDefined();
    expect(line!.sf).toBeUndefined();
    expect(unreadCount(s.log)).toBe(0);
  });

  it("a fresh save starts with its questions already on the desk — unless you delegated them away", () => {
    const asked = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
    expect(asked.asks.map((a) => a.tag).sort()).toEqual([DRAFT_POLICY_TAG, SCOUTING_TAG, TICKET_TAG].sort());

    const delegated = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
    delegated.delegation = withLevels("silent");
    delegated.asks = [];
    raiseDraftPolicyAsk(delegated);
    raiseScoutingAsk(delegated);
    raiseTicketAsk(delegated);
    expect(delegated.asks).toEqual([]);
  });

  it("the same question is never raised twice", () => {
    const s = fresh("approve");
    raiseDraftPolicyAsk(s);
    raiseDraftPolicyAsk(s);
    raiseDraftPolicyAsk(s);
    expect(s.asks.filter((a) => a.tag === DRAFT_POLICY_TAG).length).toBe(1);
  });
});

describe("the desk during a season — the reason it isn't just annual mail", () => {
  it("a month-end close lands on the desk every month, on ordinary days", () => {
    const s = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
    s.log = [];
    playOut(s);

    const closes = s.log.filter((l) => l.t === "finance.monthClose");
    // Roughly one per month across a real season.
    expect(closes.length).toBeGreaterThanOrEqual(5);
    expect(closes.length).toBeLessThanOrEqual(9);
    for (const c of closes) {
      expect(c.c).toMatch(/Month closed/);
      expect(c.c).toMatch(/Cash on hand/);
      expect(c.sf).toBe(1);
    }
  }, 120_000);

  it("an unanswered ask never blocks a season, and is still there at the end of it", () => {
    const s = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
    const before = s.asks.length;
    expect(before).toBeGreaterThan(0);

    playOut(s); // ignore everything for a whole year
    expect(s.asks.length).toBe(before);
    expect(s.sp).toBeGreaterThan(0);
  }, 120_000);

  it("answering the scouting budget actually moves the money, at the next month crossing", () => {
    const s = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
    const ask = s.asks.find((a) => a.tag === SCOUTING_TAG)!;
    expect(ask).toBeDefined();
    const target = ask.facts["full"]!;
    expect(target).toBeGreaterThan(s.scoutingBudget);

    s.asks = answerAsk(s.asks, ask.id, "full");
    playOut(s);

    expect(s.scoutingBudget).toBe(target);
    expect(s.asks.find((a) => a.tag === SCOUTING_TAG)).toBeUndefined();
    expect(s.log.some((l) => l.t === "scouting.budget.set")).toBe(true);
  }, 120_000);

  it("a rollover reports the draft and the winter in counts, not a firehose of names", () => {
    const s = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
    playOut(s);
    s.log = [];
    startNewSeason(s, mulberry32(4242));

    const draft = s.log.find((l) => l.t === "draft.complete");
    const winter = s.log.find((l) => l.t === "signings.winter");
    expect(draft?.c).toMatch(/amateur draft is done/i);
    expect(winter?.c).toMatch(/Winter business closed/i);
    // Counts, so the line stays one line however big the org gets.
    expect(winter!.c.length).toBeLessThan(120);
  }, 180_000);

  it("an unanswered scouting ask is retired at the rollover rather than stacking year on year", () => {
    const s = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
    playOut(s);
    startNewSeason(s, mulberry32(4242));
    playOut(s);
    startNewSeason(s, mulberry32(4243));

    expect(s.asks.filter((a) => a.tag === SCOUTING_TAG).length).toBeLessThanOrEqual(1);
    expect(s.asks.filter((a) => a.tag === DRAFT_POLICY_TAG).length).toBeLessThanOrEqual(1);
    expect(s.log.some((l) => l.t === "scouting.budget.held")).toBe(true);
  }, 300_000);
});

describe("the ticket-price ask — the one where your people say charge less", () => {
  it("recommends the CUT under Approve, which is the counter-intuitive and correct call", () => {
    const s = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
    const ask = s.asks.find((a) => a.tag === TICKET_TAG)!;
    expect(ask).toBeDefined();
    expect(ask.level).toBe("approve");
    expect(ask.recommended).toBe("cut");
    // Measured in `pricing.test.ts`: the cut really is worth more net income
    // than either holding or raising. The staff opinion is not flavour.
    expect(ask.facts["cut"]).toBeLessThan(ask.facts["hold"]!);
    expect(ask.facts["raise"]).toBeGreaterThan(ask.facts["hold"]!);
  });

  it("offers no recommendation under Hands-on, and holding is always the cost of silence", () => {
    const s = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
    s.delegation = withLevels("hands-on");
    s.asks = [];
    raiseTicketAsk(s);
    const ask = s.asks.find((a) => a.tag === TICKET_TAG)!;
    expect(ask.recommended).toBeNull();
    expect(ask.fallback).toBe("hold");
  });

  it("an answered price actually reaches state.ticketPrice, at the next month crossing", () => {
    const s = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
    const ask = s.asks.find((a) => a.tag === TICKET_TAG)!;
    const target = ask.facts["cut"]!;
    expect(target).not.toBe(s.ticketPrice);

    s.asks = answerAsk(s.asks, ask.id, "cut");
    playOut(s);

    expect(s.ticketPrice).toBe(target);
    expect(s.asks.find((a) => a.tag === TICKET_TAG)).toBeUndefined();
    expect(s.log.some((l) => l.t === "ticketing.price.set")).toBe(true);
  }, 120_000);

  it("and a changed price actually changes the gate — the whole chain, not just the field", () => {
    const cheap = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
    const dear = newGame({ ownedClubId: "MLB_NYY", seed: 5, year: 2026 });
    cheap.ticketPrice = 21;
    dear.ticketPrice = 82;
    playOut(cheap);
    playOut(dear);

    // Concessions (account 4100) track bodies in the park, not the ticket
    // price — so a doubled ticket price must visibly shrink them. Same seed,
    // same schedule, same games; only the price differs.
    const conc = (st: GameState) =>
      st.ledger
        .filter((e) => e.t === "gate")
        .reduce((total, e) => total + e.l.filter(([acc]) => acc === 4100).reduce((sub, [, v]) => sub - v, 0), 0);

    expect(conc(cheap)).toBeGreaterThan(0);
    expect(conc(dear)).toBeLessThan(conc(cheap) * 0.6);
  }, 180_000);
});
