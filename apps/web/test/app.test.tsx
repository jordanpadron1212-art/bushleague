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
});
