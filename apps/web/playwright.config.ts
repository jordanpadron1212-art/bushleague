import { defineConfig, devices } from "@playwright/test";

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
        launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH },
      },
    },
    {
      name: "desktop-1440",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH },
      },
    },
  ],
});
