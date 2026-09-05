import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

/**
 * Which Chromium to drive.
 *
 * Playwright's default resolves to `chrome-headless-shell`, which is NOT
 * what a preinstalled-browser image necessarily ships. This container has
 * `/opt/pw-browsers/chromium` and no headless shell, so an unconfigured
 * `playwright test` here fails EVERY test in 3ms with "Executable doesn't
 * exist" — which looks nothing like a real failure and is easy to misread
 * as one, or to miss entirely behind a wrapper's exit code.
 *
 * Resolution order: an explicit PLAYWRIGHT_CHROMIUM_PATH, then the common
 * preinstalled location if it exists, then Playwright's own default (which
 * is what CI uses, since CI runs `playwright install` and has the shell).
 * `undefined` means "Playwright decides", so CI is unaffected.
 */
const CHROMIUM =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ??
  (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);

/**
 * CI-only visual QA. DECISIONS.md D16's lesson from the old build: "the
 * harness catches the mechanical failures; the eye catches the useless
 * ones. Both are mandatory, permanently." Vitest covers logic; this covers
 * what a component test can't — real layout, real overflow, real console
 * errors, at the real viewport (360px, per LAWS.md's old Law 15: designed
 * and verified at 360px, phone-first). This is never shipped to users —
 * dev/CI only.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:4173",
    trace: "retain-on-failure",
  },
  webServer: {
    // `vite preview` serves dist/ — it does NOT build. Running the suite
    // without building first tests the PREVIOUS bundle, silently: the code
    // under test looks wrong and the source looks right. The `test:visual`
    // script builds first for exactly this reason (it cost a full red run to
    // find). CI builds separately too; the second build is a few seconds and
    // buys certainty that what is under test is what is on disk.
    command: "pnpm exec vite preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: "phone-360",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 360, height: 740 },
        launchOptions: { executablePath: CHROMIUM },
      },
    },
    {
      name: "desktop-1440",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        launchOptions: { executablePath: CHROMIUM },
      },
    },
  ],
});
