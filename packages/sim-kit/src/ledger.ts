/**
 * The books — LAWS.md Law 4: "nothing touches cash except post()."
 *
 * Signed double entry: every journal line is [account, amount], every entry
 * sums to zero, debits positive, credits negative. It follows that the sum
 * of ALL account balances is zero — that is what auditBooks() proves.
 *
 * Ported from `post()`/`balance()`/`auditBooks()` etc. in
 * bush-league-v0.10.html, with the hidden global `G` made explicit: every
 * function here takes the ledger it operates on as a parameter instead of
 * closing over module state, so this stays testable and framework-agnostic.
 * `post()` remains the only function in this package that appends to a
 * ledger — that is what keeps Law 4 true in the port.
 */
import { accountExists, accountType, type AccountType } from "./accounts.js";

export type AccountId = number;
export type JournalLine = readonly [AccountId, number];

export interface JournalEntry {
  readonly i: number;
  readonly d: number; // serial day
  readonly m: string; // memo
  readonly t: string; // tag
  readonly l: readonly JournalLine[];
}

/** Mutable counter box so callers can thread `nextJe` the way `G.nextJe` did. */
export interface JeCounter {
  value: number;
}

function round2(v: number): number {
  return Number.isFinite(v) ? Math.round(v * 100) / 100 : 0;
}

function sumLines(lines: readonly JournalLine[]): number {
  return lines.reduce((t, [, amt]) => t + (Number.isFinite(amt) ? amt : 0), 0);
}

/**
 * Posts a balanced journal entry. Throws on an unbalanced entry, an unknown
 * account, or a non-finite amount — the same three guards `post()` shipped
 * with, because a save with a NaN account balance is worse than a crash at
 * the moment it was introduced.
 */
export function post(
  ledger: JournalEntry[],
  counter: JeCounter,
  day: number,
  memo: string,
  lines: readonly (readonly [AccountId, number])[],
  tag = "",
): JournalEntry {
  // Checked on the RAW amounts, before rounding. The original v0.10 source
  // rounded first (its `r2()` silently maps NaN to 0 via `nz()`), so a NaN
  // line was zeroed and then filtered out as a "zero amount" before its own
  // NaN guard ever ran — the guard was dead code. Fixed here: a non-finite
  // amount fails loudly, matching what Law 4 ("nothing touches cash except
  // post()") actually requires, not what the old build happened to do.
  if (lines.some(([, amt]) => !Number.isFinite(amt))) {
    throw new Error(`NaN in entry: ${memo}`);
  }
  const cleaned = lines
    .map(([acct, amt]) => [acct, round2(amt)] as JournalLine)
    .filter(([, amt]) => amt !== 0);
  const bal = round2(sumLines(cleaned));
  if (Math.abs(bal) > 0.005) {
    throw new Error(`unbalanced entry: ${memo} off by ${bal}`);
  }
  if (cleaned.some(([acct]) => !accountExists(acct))) {
    throw new Error(`unknown account in: ${memo}`);
  }
  const entry: JournalEntry = { i: counter.value++, d: day, m: memo, t: tag, l: cleaned };
  ledger.push(entry);
  return entry;
}

export function balance(
  ledger: readonly JournalEntry[],
  acct: AccountId,
  from?: number,
  to?: number,
): number {
  let t = 0;
  for (const e of ledger) {
    if (from != null && e.d < from) continue;
    if (to != null && e.d > to) continue;
    for (const [a, amt] of e.l) if (a === acct) t += amt;
  }
  return round2(t);
}

export function balancesByType(
  ledger: readonly JournalEntry[],
  type: AccountType,
  from?: number,
  to?: number,
): [AccountId, number][] {
  const out: [AccountId, number][] = [];
  const seen = new Set<AccountId>();
  for (const e of ledger) for (const [a] of e.l) seen.add(a);
  for (const a of seen) {
    if (accountType(a) !== type) continue;
    const b = balance(ledger, a, from, to);
    if (b !== 0) out.push([a, b]);
  }
  return out.sort((x, y) => x[0] - y[0]);
}

export function cash(ledger: readonly JournalEntry[]): number {
  return balance(ledger, 1000);
}

export interface IncomeStatement {
  rev: [AccountId, number][];
  exp: [AccountId, number][];
  totalRev: number;
  totalExp: number;
  net: number;
}

export function incomeStatement(
  ledger: readonly JournalEntry[],
  from?: number,
  to?: number,
): IncomeStatement {
  const rev = balancesByType(ledger, "R", from, to).map(([a, b]) => [a, -b] as [AccountId, number]);
  const exp = balancesByType(ledger, "X", from, to);
  const totalRev = round2(rev.reduce((t, [, b]) => t + b, 0));
  const totalExp = round2(exp.reduce((t, [, b]) => t + b, 0));
  return { rev, exp, totalRev, totalExp, net: round2(totalRev - totalExp) };
}

export interface BalanceSheet {
  as: [AccountId, number][];
  li: [AccountId, number][];
  eq: [AccountId, number][];
  totalA: number;
  totalL: number;
  totalE: number;
  net: number;
  totalLE: number;
  ok: boolean;
}

export function balanceSheet(ledger: readonly JournalEntry[], to?: number): BalanceSheet {
  const as = balancesByType(ledger, "A", undefined, to);
  const li = balancesByType(ledger, "L", undefined, to).map(([a, b]) => [a, -b] as [AccountId, number]);
  const eq = balancesByType(ledger, "E", undefined, to).map(([a, b]) => [a, -b] as [AccountId, number]);
  const is = incomeStatement(ledger, undefined, to);
  const totalA = round2(as.reduce((t, [, b]) => t + b, 0));
  const totalL = round2(li.reduce((t, [, b]) => t + b, 0));
  const totalE = round2(eq.reduce((t, [, b]) => t + b, 0));
  const totalLE = round2(totalL + totalE + is.net);
  return {
    as,
    li,
    eq,
    totalA,
    totalL,
    totalE,
    net: is.net,
    totalLE,
    ok: Math.abs(round2(totalA - totalLE)) < 0.02,
  };
}

export interface AuditResult {
  fails: string[];
  entries: number;
  lines: number;
}

/** Ships wired into the app and must return zero fails. Law 4's proof. */
export function auditBooks(ledger: readonly JournalEntry[]): AuditResult {
  const fails: string[] = [];
  let all = 0;
  for (const e of ledger) {
    const s = round2(sumLines(e.l));
    if (Math.abs(s) > 0.005) fails.push(`Entry #${e.i} (${e.m}) is unbalanced by ${s}`);
    for (const [acct, amt] of e.l) {
      if (!Number.isFinite(amt)) fails.push(`Entry #${e.i} has a non-finite amount`);
      if (!accountExists(acct)) fails.push(`Entry #${e.i} posts to unknown account ${acct}`);
      all += Number.isFinite(amt) ? amt : 0;
    }
  }
  if (Math.abs(round2(all)) > 0.02) fails.push(`Trial balance does not close: off by ${round2(all)}`);
  const bs = balanceSheet(ledger);
  if (!bs.ok) {
    fails.push(`Balance sheet does not balance: assets ${bs.totalA} vs liabilities+equity ${bs.totalLE}`);
  }
  return { fails, entries: ledger.length, lines: ledger.reduce((t, e) => t + e.l.length, 0) };
}
