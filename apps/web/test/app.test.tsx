/**
 * A render smoke test — proves the whole pipeline (router, zustand store,
 * IndexedDB persistence, the page registry, the token layer) actually
 * mounts and moves through its real states without throwing. DECISIONS.md
 * D40's own lesson applies here in spirit: a harness that doesn't actually
 * exercise the thing it claims to isn't a harness. This renders the real
 * <App/>, not a mocked shell — and now that a real save exists, drives it
 * through loading → choose a club → the real Office page, not a
 * pre-populated store standing in for what actually happens.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.js";

function resetDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase("bushleague");
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
}

beforeEach(resetDatabase);
afterEach(resetDatabase);

describe("<App />", () => {
  it("with no save, shows the club picker after loading", async () => {
    render(<App />);
    expect(await screen.findByText(/choose the club you.ll own/i)).toBeInTheDocument();
    expect(screen.getAllByText("NYY").length).toBeGreaterThan(0);
  });

  it("choosing a club starts a real game and lands on the Office page", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText(/choose the club you.ll own/i);
    const nyy = screen.getAllByText("NYY")[0]!;
    await user.click(nyy);
    expect(await screen.findByText(/needs you/i, undefined, { timeout: 10000 })).toBeInTheDocument();
    expect(document.documentElement.getAttribute("data-shell")).toBe("ootp");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.getAttribute("data-density")).toBe("compact");
  }, 15000);

  it("a save from a previous session is loaded straight into the Office page, not the club picker", async () => {
    const { newGame } = await import("@bushleague/sim-kit");
    const { saveGame } = await import("../src/save.js");
    await saveGame(newGame({ ownedClubId: "MLB_BOS", seed: 1 }));

    render(<App />);
    expect(await screen.findByText(/needs you/i)).toBeInTheDocument();
    expect(screen.queryByText(/choose the club you.ll own/i)).not.toBeInTheDocument();
  });

  it("once a season is exhausted, the action bar offers to start the next one — and doing so produces a real, playable new season", async () => {
    // Fast-forwards a real sim-kit state to seasonOver directly (not by
    // clicking Advance hundreds of times through the DOM) — the same
    // `advanceDay` loop `rollover.test.ts` already verifies against, here
    // proving the ONE piece that lives in apps/web: the action bar actually
    // detects seasonOver and calls the real gameStore.startNewSeason action
    // (DECISIONS.md D88), not just that the underlying sim-kit primitive
    // works in isolation.
    const { newGame, advanceDay } = await import("@bushleague/sim-kit");
    const { saveGame } = await import("../src/save.js");
    const state = newGame({ ownedClubId: "MLB_BOS", seed: 1 });
    let guard = 0;
    let seasonOver = false;
    while (!seasonOver && guard++ < 400) {
      seasonOver = advanceDay(state).seasonOver;
    }
    expect(seasonOver).toBe(true); // sanity: this test actually reached the state it means to exercise
    await saveGame(state);

    const user = userEvent.setup();
    render(<App />);
    const startButton = await screen.findByText(/start the 2027 season/i, undefined, { timeout: 10000 });
    await user.click(startButton);

    // Rollover happened for real: the bar reverts to a real "advance to"
    // control (not stuck, not still offering to start a season that just
    // started), and Office's own record resets to a fresh 0-0.
    expect(await screen.findByText(/advance to/i, undefined, { timeout: 10000 })).toBeInTheDocument();
    expect(screen.getByText("0-0 (.000)")).toBeInTheDocument();
  }, 20000);
});
