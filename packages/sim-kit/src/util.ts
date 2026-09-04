/**
 * Small numeric guards shared across the package — ported from
 * bush-league-v0.10.html's `nz`/`clamp`/`r2` helpers. Kept in one place so
 * `ledger.ts`, `player.ts` and `format.ts` don't each carry their own copy.
 */

export function nz(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

export function clamp(v: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, nz(v)));
}

export function round2(v: number): number {
  return Number.isFinite(v) ? Math.round(v * 100) / 100 : 0;
}

/** Counting-stat accumulator — ported from bush-league-v0.10.html's `inc()`. Mutates a `PlayerStats`-shaped record in place. */
export function inc(o: Record<string, number>, k: string, n = 1): void {
  o[k] = (o[k] ?? 0) + n;
}
