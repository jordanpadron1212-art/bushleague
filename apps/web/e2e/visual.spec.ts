import { test, expect, type Page } from "@playwright/test";

/**
 * DECISIONS.md D18 (measured, not eyeballed) and D39 (a container with
 * max-width also needs width:100%, or content scrolls sideways at 360px)
 * are exactly the class of defect a unit test cannot see and a real browser
 * catches immediately. This asserts both mechanically and saves a
 * screenshot per shell/theme combination for a human (or a future session)
 * to actually look at — D16's other half, which no assertion replaces.
 *
 * As of the state-wiring pass (`DECISIONS.md` D85), Office and the
 * club-picker are gated behind a real save existing — `startGame` below
 * drives the real flow (choose a club, wait for the Office page) rather
 * than asserting against a state that no longer occurs on first load.
 * Books is checked here too: it's newly lit this pass, and UI.md's own
 * verification matrix (§12) applies to every lit screen, not just Office.
 */
const SHELLS = ["ootp", "desk"] as const;
const THEMES = ["dark", "light"] as const;

async function setShellTheme(page: Page, shell: string, theme: string) {
  await page.evaluate(
    ([s, t]) => {
      document.documentElement.setAttribute("data-shell", s);
      document.documentElement.setAttribute("data-theme", t);
    },
    [shell, theme],
  );
}

async function startGame(page: Page) {
  await page.goto("/");
  await page.getByText("Choose the club").waitFor();
  await page.getByText("NYY", { exact: true }).click();
  await page.getByText(/needs you/i).waitFor({ timeout: 15000 });
}

function assertClean(consoleErrors: string[]) {
  expect(consoleErrors, `console errors: ${consoleErrors.join("; ")}`).toEqual([]);
}

async function overflowPx(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

for (const shell of SHELLS) {
  for (const theme of THEMES) {
    test(`Club picker renders clean — ${shell}/${theme}`, async ({ page }, testInfo) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => msg.type() === "error" && consoleErrors.push(msg.text()));
      page.on("pageerror", (err) => consoleErrors.push(err.message));

      await page.goto("/");
      await page.getByText("Choose the club").waitFor();
      await setShellTheme(page, shell, theme);

      expect(await overflowPx(page)).toBeLessThanOrEqual(1);
      assertClean(consoleErrors);

      await page.screenshot({ path: testInfo.outputPath(`club-picker-${shell}-${theme}.png`), fullPage: true });
    });

    test(`Office renders clean — ${shell}/${theme}`, async ({ page }, testInfo) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => msg.type() === "error" && consoleErrors.push(msg.text()));
      page.on("pageerror", (err) => consoleErrors.push(err.message));

      await startGame(page);
      await setShellTheme(page, shell, theme);
      await expect(page.getByText(/needs you/i)).toBeVisible();

      expect(await overflowPx(page)).toBeLessThanOrEqual(1);
      assertClean(consoleErrors);

      await page.screenshot({ path: testInfo.outputPath(`office-${shell}-${theme}.png`), fullPage: true });
    });

    test(`Books renders clean — ${shell}/${theme}`, async ({ page }, testInfo) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => msg.type() === "error" && consoleErrors.push(msg.text()));
      page.on("pageerror", (err) => consoleErrors.push(err.message));

      await startGame(page);
      await page.goto("/#/p/books");
      await setShellTheme(page, shell, theme);
      await expect(page.getByText(/net income/i)).toBeVisible();

      expect(await overflowPx(page)).toBeLessThanOrEqual(1);
      assertClean(consoleErrors);

      await page.screenshot({ path: testInfo.outputPath(`books-${shell}-${theme}.png`), fullPage: true });
    });
  }
}
