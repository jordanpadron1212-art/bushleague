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

    // The DRAFT page's populated-board state (real picks, a completed
    // rollover) is verified manually per pass, not here — driving a full
    // season to rollover on every CI run would multiply this file's own
    // cost for no ongoing regression value the empty state doesn't already
    // cover (DECISIONS.md D93). The empty state IS reachable for free
    // (no rollover needed) and is exactly as regression-prone as any other
    // screen, so it stays in the permanent gate like Office/Books do.
    test(`Draft (empty state) renders clean — ${shell}/${theme}`, async ({ page }, testInfo) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => msg.type() === "error" && consoleErrors.push(msg.text()));
      page.on("pageerror", (err) => consoleErrors.push(err.message));

      await startGame(page);
      await page.goto("/#/p/draft");
      await setShellTheme(page, shell, theme);
      await expect(page.getByText("No draft yet.")).toBeVisible();

      expect(await overflowPx(page)).toBeLessThanOrEqual(1);
      assertClean(consoleErrors);

      await page.screenshot({ path: testInfo.outputPath(`draft-empty-${shell}-${theme}.png`), fullPage: true });
    });
  }
}

/**
 * The save-problem screen (`DECISIONS.md` D98). A real app state, reached
 * by planting a save this build can't read directly into IndexedDB before
 * the app boots — the same thing a version downgrade would do to a real
 * player. Checked in every shell/theme like any other lit screen: this is
 * the one screen a player only ever sees on a bad day, which makes it the
 * one most likely to ship broken and never be looked at.
 */
async function plantUnreadableSave(page: Page) {
  // Loaded once first so the app itself creates the database and object
  // store; writing from an init script instead races the app's own read and
  // wins only sometimes, which is worse than failing — it produces a test
  // that passes locally and flakes in CI.
  await page.goto("/");
  await page.getByText("Choose the club").waitFor();

  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open("bushleague", 1);
        open.onupgradeneeded = () => {
          if (!open.result.objectStoreNames.contains("saves")) open.result.createObjectStore("saves");
        };
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const tx = db.transaction("saves", "readwrite");
          // A version far ahead of anything this build could ever write.
          tx.objectStore("saves").put({ v: 9999, seed: 1 }, "current");
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
  );

  await page.reload();
}

for (const shell of SHELLS) {
  for (const theme of THEMES) {
    test(`Unreadable save shows the problem screen — ${shell}/${theme}`, async ({ page }, testInfo) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => msg.type() === "error" && consoleErrors.push(msg.text()));
      page.on("pageerror", (err) => consoleErrors.push(err.message));

      await plantUnreadableSave(page);
      await page.getByText(/save couldn.t be opened/i).waitFor();
      await setShellTheme(page, shell, theme);

      // The safeguard itself, checked in a real browser: the club picker —
      // the screen whose next click overwrites the save — must not be here.
      await expect(page.getByText(/choose the club/i)).toHaveCount(0);
      await expect(page.getByText(/nothing has been deleted/i)).toBeVisible();

      expect(await overflowPx(page)).toBeLessThanOrEqual(1);
      assertClean(consoleErrors);

      await page.screenshot({ path: testInfo.outputPath(`save-problem-${shell}-${theme}.png`), fullPage: true });
    });
  }
}

test("the destructive path on the problem screen states its consequence before it can be taken", async ({
  page,
}, testInfo) => {
  await plantUnreadableSave(page);
  await page.getByText(/save couldn.t be opened/i).waitFor();

  await page.getByText(/start a new game instead/i).click();
  await expect(page.getByText(/overwrite this save/i)).toBeVisible();
  await expect(page.getByText(/choose the club/i)).toHaveCount(0);

  await page.screenshot({ path: testInfo.outputPath("save-problem-confirm.png"), fullPage: true });
});

/**
 * The owner's desk and the delegation dial (`DECISIONS.md` D100). The desk
 * replaces the Office page's honestly-empty "Needs you" panel, so this also
 * guards the claim that it is no longer empty.
 */
for (const shell of SHELLS) {
  for (const theme of THEMES) {
    test(`The desk has real questions on it — ${shell}/${theme}`, async ({ page }, testInfo) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => msg.type() === "error" && consoleErrors.push(msg.text()));
      page.on("pageerror", (err) => consoleErrors.push(err.message));

      await startGame(page);
      await setShellTheme(page, shell, theme);

      // A fresh save opens with both questions already waiting.
      await expect(page.getByText(/how should we draft this year/i)).toBeVisible();
      await expect(page.getByText(/what are we spending on scouting/i)).toBeVisible();
      await expect(page.getByText(/what are we charging at the gate/i)).toBeVisible();
      // The staff pick on the gate question is the COUNTER-INTUITIVE one —
      // dropping the price. If this ever flips to "push", the pricing model
      // has changed and RESEARCH.md §25 needs re-measuring, not this test
      // needs updating.
      await expect(page.getByRole("button", { name: /^Drop to \$/ })).toBeVisible();
      // Payroll is on the desk too, and deliberately carries NO staff pick —
      // it is a trade-off, not a puzzle with a right answer.
      await expect(page.getByText(/what are we spending on players/i)).toBeVisible();
      // Every question states what silence costs, before it is ignored.
      await expect(page.getByText(/if you never answer/i).first()).toBeVisible();

      expect(await overflowPx(page)).toBeLessThanOrEqual(1);
      assertClean(consoleErrors);
      await page.screenshot({ path: testInfo.outputPath(`desk-${shell}-${theme}.png`), fullPage: true });
    });

    test(`The delegation dial renders clean — ${shell}/${theme}`, async ({ page }, testInfo) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => msg.type() === "error" && consoleErrors.push(msg.text()));
      page.on("pageerror", (err) => consoleErrors.push(err.message));

      await startGame(page);
      await page.goto("/#/p/delegation");
      await page.getByText(/how much do you run yourself/i).waitFor();
      await setShellTheme(page, shell, theme);

      // Staff hiring is shown and is not a control — stating the rule
      // rather than hiding it. `.first()` because the phrase deliberately
      // appears twice: once as the badge, once inside the explanation.
      await expect(page.getByText("always yours").first()).toBeVisible();
      await expect(page.getByRole("button", { name: "Approve", exact: true }).first()).toBeDisabled();

      expect(await overflowPx(page)).toBeLessThanOrEqual(1);
      assertClean(consoleErrors);
      await page.screenshot({ path: testInfo.outputPath(`dial-${shell}-${theme}.png`), fullPage: true });
    });
  }
}

test("answering a question is recorded and survives a reload", async ({ page }) => {
  await startGame(page);
  await page.getByRole("button", { name: /fill our needs/i }).click();
  await expect(page.getByText(/your answer is recorded/i).first()).toBeVisible();

  // Wait for the answer to reach DISK, not just the screen.
  //
  // The store sets React state and then awaits the IndexedDB write, so the
  // "recorded" line renders while the write is still in flight — ordinary
  // optimistic UI. Reloading on the strength of that render is a race, and
  // it is one this test lost in CI while passing locally every time: a
  // slower runner had not finished the write when the reload discarded it.
  // Polling the save itself is the only version of this assertion that is
  // actually about persistence.
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            new Promise<boolean>((resolve) => {
              const open = indexedDB.open("bushleague", 1);
              open.onerror = () => resolve(false);
              open.onsuccess = () => {
                const db = open.result;
                const rq = db.transaction("saves", "readonly").objectStore("saves").get("current");
                rq.onerror = () => {
                  db.close();
                  resolve(false);
                };
                rq.onsuccess = () => {
                  const save = rq.result as { asks?: { tag: string; chosen: string | null }[] } | undefined;
                  db.close();
                  resolve(!!save?.asks?.some((a) => a.tag === "draft.policy" && a.chosen === "NEED"));
                };
              };
            }),
        ),
      { timeout: 15000 },
    )
    .toBe(true);

  await page.reload();
  await page.getByText(/needs you/i).waitFor({ timeout: 20000 });
  // The answer lives in the save, not in React state.
  await expect(page.getByRole("button", { name: /fill our needs/i })).toHaveAttribute("aria-pressed", "true");
});
