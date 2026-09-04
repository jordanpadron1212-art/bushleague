/**
 * Seeded PRNG — the seed lives in state, not the function, so a world
 * regenerates identically from a save (LAWS.md Law 2: "an integer, not a
 * function"). mulberry32, ported bit-for-bit from bush-league-v0.10.html's
 * `rng()` so a seed produces the same sequence here as it did there —
 * load-bearing the day the world generator is ported and needs to be
 * checked against the old build's output.
 */

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let s = seed >>> 0;
  return function rng(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box-Muller standard normal, driven by the same seeded stream. */
export function gauss(r: Rng): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = r();
  while (v === 0) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function pick<T>(arr: readonly T[], r: Rng): T {
  const item = arr[Math.floor(r() * arr.length) % arr.length];
  if (item === undefined) throw new Error("pick() called on an empty array");
  return item;
}
