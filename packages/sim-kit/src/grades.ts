/**
 * Grade -> real units — RESEARCH.md §4.2, Tier 1 (Baseball America 2025).
 * Ported verbatim from bush-league-v0.10.html's `interp()`/`BA_PTS`/
 * `HR_PTS`/`FB_PTS`/`expectedOver()`.
 *
 * Jensen's inequality bites here, and it is why `expectedOver` exists at
 * all: the grade-to-home-run curve is convex, so the AVERAGE of `hrFrom()`
 * across a population sits above `hrFrom()` at the population mean — by 5%
 * at the major-league centre and 21% at Double-A's. Scaling a level's
 * generator by the value at the centre therefore inflates power at every
 * level, worse the lower you go. The fix is to scale by the expected value
 * over the ACTUAL grade distribution, not the value at its centre.
 */

export function interp(pts: readonly (readonly [number, number])[], grade: number): number {
  const g = Math.min(80, Math.max(20, grade));
  for (let i = 1; i < pts.length; i++) {
    const point = pts[i]!;
    if (g <= point[0]) {
      const a = pts[i - 1]!;
      const b = point;
      const f = (g - a[0]) / (b[0] - a[0]);
      return a[1] + (b[1] - a[1]) * f;
    }
  }
  return pts[pts.length - 1]![1];
}

/** Batting average by grade, Baseball America 2025 — RESEARCH.md §4.2. */
export const BA_PTS = [
  [20, 0.21], [30, 0.225], [40, 0.24], [45, 0.25], [50, 0.26],
  [55, 0.27], [60, 0.285], [70, 0.305], [80, 0.32],
] as const;

/** Home runs (per-season equivalent) by grade, Baseball America 2025 — RESEARCH.md §4.2. */
export const HR_PTS = [
  [20, 2], [30, 7], [40, 11.5], [45, 16], [50, 20.5],
  [55, 25], [60, 30.5], [70, 36.5], [80, 42],
] as const;

/** Starter fastball velocity (mph) by grade, Baseball America 2025 — RESEARCH.md §4.2. "Add 1-2 mph for relievers" per BA, not applied here. */
export const FB_PTS = [
  [20, 87], [30, 88.5], [40, 90.5], [45, 92], [50, 93],
  [55, 94], [60, 95], [65, 96], [70, 97], [80, 98.5],
] as const;

export const baFrom = (g: number): number => interp(BA_PTS, g);
export const hrFrom = (g: number): number => interp(HR_PTS, g);
export const fbFrom = (g: number): number => interp(FB_PTS, g);

const expectedCache = new Map<string, number>();

/**
 * The expected value of `fn` over a population whose grades are ~N(c, sd),
 * sampled discretely (a Gaussian-weighted sum over ±3 SD in 0.1-SD steps —
 * the same numerical integration the old build used, kept identical so a
 * population generated here is comparable to one generated there).
 */
export function expectedOver(fn: (g: number) => number, tag: string, c: number, sd: number): number {
  const key = `${tag}|${c}|${sd}`;
  const cached = expectedCache.get(key);
  if (cached != null) return cached;
  let t = 0;
  let w = 0;
  for (let i = -30; i <= 30; i++) {
    const z = i / 10;
    const k = Math.exp((-z * z) / 2);
    t += k * fn(Math.min(80, Math.max(20, c + z * sd)));
    w += k;
  }
  const value = t / w;
  expectedCache.set(key, value);
  return value;
}

/** FV -> washout probability, Tier 1, RESEARCH.md §4.4 (FanGraphs/Clemens 2025). */
export const BUST: Record<"bat" | "pit", Record<45 | 50 | 55 | 60, number>> = {
  bat: { 45: 0.51, 50: 0.23, 55: 0.17, 60: 0.14 },
  pit: { 45: 0.53, 50: 0.27, 55: 0.17, 60: 0.17 },
};
