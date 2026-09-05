import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    /**
     * 60s, not vitest's 5s default.
     *
     * This suite simulates whole seasons of a 218-club world — several of
     * these tests legitimately run 5-45 seconds, and the 5s default was
     * never right for them. It had been surviving on luck: measured, three
     * rollover tests ran at 4.5-5.1s against the hard 5.0s ceiling, and one
     * failed at 5109ms while its siblings passed at 4697ms and 4531ms.
     *
     * The fielding model then added ~5ms per `chartWorld` call (6.3 ->
     * 11.6ms median, measured directly against the previous commit), which
     * is roughly +1s per simulated season, and that was enough to tip the
     * whole cluster over at once.
     *
     * 120s, and ONE number for the whole suite — no per-test budgets at
     * all. Three earlier attempts set it at the edge of measured cost (5s,
     * then 20s, then 60s) and each one failed something by 0.6-10%: 5109ms
     * against 5000, 22152ms against 20000, 60374ms against 60000. Tuning a
     * timeout to just above what you measured is how you get a suite that
     * fails whenever the machine is busy.
     *
     * For scale: CI runs this ENTIRE suite in 139 seconds, while a single
     * test here can take 60. This container is several times slower for
     * this workload, so the budget is set for the slow case with real
     * headroom rather than for the fast one.
     *
     * A timeout exists to catch a HANG, and 120s catches a hang exactly as
     * well as 5s does.
     *
     * This is a TIME budget matched to measured cost. No assertion or
     * tolerance is touched — a test that computes the wrong answer still
     * fails, and the calibration bands against RESEARCH.md's published
     * lines are exactly as tight as they were.
     */
    testTimeout: 120_000,
  },
});
