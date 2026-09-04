/**
 * Display formatting — RESEARCH.md §3.7 is law. Getting any of these wrong
 * makes the whole game read as fake. Ported verbatim from
 * bush-league-v0.10.html's formatter set; tested against the exact verified
 * examples RESEARCH.md §3.7 quotes off live MLB.com / Baseball-Reference
 * pages, not against invented expectations.
 *
 * The governing rule: stats conceptually bounded at 1.000 (BA, OBP, SLG,
 * OPS, W-L%, rOBA) drop the leading zero. Rates that can naturally exceed 1
 * (ERA, FIP, WHIP, WAR, per-nine, SO/BB) keep it.
 */
import { nz } from "./util.js";

export function money(v: number): string {
  const n = nz(v);
  const a = Math.abs(n);
  const s = n < 0 ? "-" : "";
  if (a >= 1e9) return `${s}$${(a / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${s}$${(a / 1e6).toFixed(2)}M`;
  if (a >= 1e4) return `${s}$${Math.round(a / 1e3)}K`;
  return `${s}$${Math.round(a).toLocaleString("en-US")}`;
}

export function moneyFull(v: number): string {
  const n = nz(v);
  return `${n < 0 ? "-" : ""}$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
}

export function signed(v: number): string {
  const n = Math.round(nz(v));
  return `${n > 0 ? "+" : n < 0 ? "-" : ""}${Math.abs(n).toLocaleString("en-US")}`;
}

export function pct(v: number, d = 1): string {
  return `${(nz(v) * 100).toFixed(d)}%`;
}

/** .311 — three decimals, no leading zero below 1.000 (BA/OBP/SLG/OPS/W-L%). */
export function avg3(v: number): string {
  const n = nz(v);
  const s = n.toFixed(3);
  return n < 1 && n >= 0 ? s.replace(/^0/, "") : s;
}

/** 3.45 / 0.922 — keeps the leading zero (ERA/FIP/WHIP/WAR/per-nine). */
export function rate(v: number, d = 2): string {
  return nz(v).toFixed(d);
}

/** 144.1 = 144 and one third (thirds notation for IP, from an outs count). */
export function ipFromOuts(outs: number): string {
  const o = Math.max(0, Math.round(nz(outs)));
  return `${Math.floor(o / 3)}.${o % 3}`;
}

export function gamesBack(v: number): string {
  return nz(v) === 0 ? "-" : (Math.round(nz(v) * 2) / 2).toFixed(1);
}

export function winPct(w: number, l: number): string {
  const g = nz(w) + nz(l);
  return g ? avg3(nz(w) / g) : ".000";
}

export type Trend = "pos" | "neg" | "dim";
export function trendClass(v: number): Trend {
  return nz(v) > 0 ? "pos" : nz(v) < 0 ? "neg" : "dim";
}
