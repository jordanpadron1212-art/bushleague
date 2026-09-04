import { test, expect } from "@playwright/test";

/**
 * DECISIONS.md D18 (measured, not eyeballed) and D39 (a container with
 * max-width also needs width:100%, or content scrolls sideways at 360px)
 * are exactly the class of defect a unit test cannot see and a real browser
 * catches immediately. This asserts both mechanically and saves a
 * screenshot per shell/theme combination for a human (or a future session)
 * to actually look at — D16's other half, which no assertion replaces.
 */
const SHELLS = ["ootp", "desk"] as const;
const THEMES = ["dark", "light"] as const;

for (const shell of SHELLS) {
  for (const theme of THEMES) {
    test(`Office renders clean — ${shell}/${theme}`, async ({ page }, testInfo) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      page.on("pageerror", (err) => consoleErrors.push(err.message));

      await page.goto("/");
      await page.evaluate(
        ([s, t]) => {
          document.documentElement.setAttribute("data-shell", s);
          document.documentElement.setAttribute("data-theme", t);
        },
        [shell, theme],
      );
      await expect(page.getByText(/needs you/i)).toBeVisible();

      // No horizontal scroll at the viewport width — the D39 defect class.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);

      expect(consoleErrors, `console errors: ${consoleErrors.join("; ")}`).toEqual([]);

      await page.screenshot({
        path: testInfo.outputPath(`office-${shell}-${theme}.png`),
        fullPage: true,
      });
    });
  }
}
