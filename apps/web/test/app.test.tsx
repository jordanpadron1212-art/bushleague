/**
 * A render smoke test — proves the whole pipeline (router, zustand store,
 * the page registry, the token layer) actually mounts without throwing.
 * DECISIONS.md D40's own lesson applies here in spirit: a harness that
 * doesn't actually exercise the thing it claims to isn't a harness. This
 * renders the real <App/>, not a mocked shell.
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../src/App.js";

describe("<App />", () => {
  it("mounts and redirects to the Office page by default", async () => {
    render(<App />);
    expect(await screen.findByText(/needs you/i)).toBeInTheDocument();
  });

  it("renders the tab bar with the pinned pages", async () => {
    render(<App />);
    expect(await screen.findAllByText(/office/i)).not.toHaveLength(0);
  });

  it("sets the shell/theme/density attributes on the document root", async () => {
    render(<App />);
    await screen.findByText(/needs you/i);
    expect(document.documentElement.getAttribute("data-shell")).toBe("ootp");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.getAttribute("data-density")).toBe("compact");
  });
});
