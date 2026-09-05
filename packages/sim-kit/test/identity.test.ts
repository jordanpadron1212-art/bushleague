/**
 * Player identity — the guarantee that no two players in a save ever share
 * an id (DECISIONS.md D97).
 *
 * This is not a theoretical concern. The original scheme minted ids from
 * `Math.floor(r() * 1e9)`, and the collision rate was MEASURED, not
 * assumed: 50,000 generated players collide once and 100,000 collide four
 * times, matching the birthday-paradox prediction (n²/2N → ~1.25 and
 * ~5.00). A real sandbox save mints roughly 1,600 players a year — 600
 * draft picks plus churn across 218 clubs — so a century-long save passes
 * 160,000 and collides a dozen-plus times.
 *
 * A collision is SILENT CORRUPTION, not a crash. `advance.ts` keys the
 * population by id into a Map, so one player simply overwrites another:
 * a lineup slot, a draft record and a contract all quietly re-point at
 * whichever player won. Nothing throws and nothing looks wrong.
 *
 * The fix is structural rather than statistical — every real creation site
 * passes an id that is unique BY CONSTRUCTION, so uniqueness is a property
 * of the scheme instead of a probability. The prefix test below is the one
 * that actually prevents regression: a future creation site that forgets
 * to pass an id falls back to the random scheme, and its `p<base36>` ids
 * fail the prefix assertion immediately, in the same commit that adds it.
 */
import { describe, expect, it } from "vitest";
import { newGame } from "../src/newgame.js";
import { advanceDay } from "../src/advance.js";
import { startNewSeason } from "../src/rollover.js";
import { mulberry32 } from "../src/rng.js";
import type { Player } from "../src/player.js";

/** Every id a real creation site mints. `pr:` rosters, `pd:` draft, `pc:` churn. */
const STRUCTURED_ID = /^(pr|pd|pc):/;

/**
 * What makes two Players the same PERSON across years. `ns` is a player's
 * own scouting-noise seed, drawn once at creation and never mutated; with
 * the name it identifies a career, so a survivor keeping his id across a
 * rollover reads as continuity rather than as a collision.
 */
const who = (p: Player): string => `${p.ns}|${p.fn}|${p.ln}|${p.role}`;

/**
 * Walks a population and folds it into a running id→person ledger. Throws
 * with a readable message naming BOTH players, because "expected 1200 to
 * be 1201" is useless when this fails a decade into a soak.
 */
function absorb(seen: Map<string, string>, players: readonly Player[], where: string): void {
  for (const p of players) {
    const prior = seen.get(p.id);
    if (prior !== undefined && prior !== who(p)) {
      throw new Error(`id collision at ${where}: "${p.id}" is both {${prior}} and {${who(p)}}`);
    }
    seen.set(p.id, who(p));
  }
}

describe("player identity — ids are unique by construction", () => {
  it("a brand-new world gives every one of its thousands of players a distinct, structured id", () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 7, year: 2026 });
    const ids = new Set(state.players.map((p) => p.id));

    expect(state.players.length).toBeGreaterThan(3000); // 218 clubs; guards against testing an empty world
    expect(ids.size).toBe(state.players.length);
    for (const p of state.players) expect(p.id).toMatch(STRUCTURED_ID);
  });

  it("no id is ever reused for a different person across fifty consecutive seasons of drafts and churn", () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 11, year: 2026 });
    const seen = new Map<string, string>();
    absorb(seen, state.players, "world generation");

    for (let i = 0; i < 50; i++) {
      startNewSeason(state, mulberry32(state.seed + i * 7919));
      absorb(seen, state.players, `season ${state.season.year}`);
      // The draft record outlives the players it names — a pick pointing at
      // a recycled id would mis-attribute someone else's career to it.
      expect(state.lastDraft).not.toBeNull();
      for (const pick of state.lastDraft ?? []) expect(pick.playerId).toMatch(STRUCTURED_ID);
    }

    // Fifty years of intake is real volume, not a token loop — this is the
    // range where the old 1e9 scheme was already colliding repeatedly.
    expect(seen.size).toBeGreaterThan(60_000);
    for (const id of seen.keys()) expect(id).toMatch(STRUCTURED_ID);
  }, 120_000);

  it("holds when the seasons are actually PLAYED, not just rolled over — the path a real save takes", () => {
    const state = newGame({ ownedClubId: "MLB_NYY", seed: 13, year: 2026 });
    const seen = new Map<string, string>();
    absorb(seen, state.players, "world generation");

    for (let i = 0; i < 2; i++) {
      let guard = 0;
      while (guard++ < 400 && !advanceDay(state).seasonOver);
      startNewSeason(state, mulberry32(state.seed + i * 4001));
      absorb(seen, state.players, `played season ${state.season.year}`);
    }

    // Games mutate players in place all season; identity must survive that.
    expect(new Set(state.players.map((p) => p.id)).size).toBe(state.players.length);
  }, 120_000);

  it("an explicitly supplied id does not change the world the seed generates (save-reproducibility, D85)", async () => {
    const { makePlayer } = await import("../src/player.js");
    const { LVL } = await import("../src/levels.js");

    // The id draw happens unconditionally inside makePlayer. If it were
    // short-circuited by `??`, supplying an id would consume one fewer
    // random value and every subsequent player in the world would differ —
    // the same seed would reload as a different save.
    const withId = mulberry32(4242);
    const without = mulberry32(4242);
    makePlayer(withId, LVL.A, "B", 24, { id: "pr:TEST:0" });
    makePlayer(without, LVL.A, "B", 24);

    expect(withId()).toBe(without());
  });
});
