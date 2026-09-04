/**
 * Dates as plain integers in state (LAWS.md Law 2: no Date objects in `G`).
 * A `Date` is only ever transient, inside these helpers. Ported from
 * bush-league-v0.10.html's `ser`/`unser`/`dfmt`/`dlong`.
 */

export interface CalendarDate {
  y: number;
  m: number; // 1-12
  d: number;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/** Days since the Unix epoch, UTC. The only date representation state ever holds. */
export function toSerial(y: number, m: number, d: number): number {
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

export function fromSerial(n: number): CalendarDate {
  const dt = new Date(n * 86400000);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

export function dateToSerial(o: CalendarDate): number {
  return toSerial(o.y, o.m, o.d);
}

/** "JUN 14" */
export function formatShort(o: CalendarDate): string {
  return `${MONTHS[o.m - 1]!.toUpperCase()} ${o.d}`;
}

/** "June 14, 2026" */
export function formatLong(o: CalendarDate): string {
  return `${MONTHS[o.m - 1]} ${o.d}, ${o.y}`;
}
