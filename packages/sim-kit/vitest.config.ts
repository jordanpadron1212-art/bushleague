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
     * This is a TIME budget matched to measured cost. No assertion or
     * tolerance is touched — a test that computes the wrong answer still
     * fails, and the calibration bands against RESEARCH.md's published
     * lines are exactly as tight as they were.
     */
    testTimeout: 60_000,
  },
});
