/**
 * The books law (LAWS.md Law 4), tested the way DECISIONS.md D16 demands:
 * assert the ledger actually reconciles, not that a function returned
 * without throwing.
 */
import { describe, expect, it } from "vitest";
import { post, balance, incomeStatement, balanceSheet, auditBooks, type JournalEntry, type JeCounter } from "../src/ledger.js";

function freshLedger(): { ledger: JournalEntry[]; counter: JeCounter } {
  return { ledger: [], counter: { value: 1 } };
}

describe("post()", () => {
  it("rejects an unbalanced entry", () => {
    const { ledger, counter } = freshLedger();
    expect(() => post(ledger, counter, 0, "bad", [[1000, 100], [4000, -50]])).toThrow(/unbalanced/);
  });

  it("rejects an unknown account", () => {
    const { ledger, counter } = freshLedger();
    expect(() => post(ledger, counter, 0, "bad acct", [[9999, 100], [4000, -100]])).toThrow(/unknown account/);
  });

  it("rejects a non-finite amount", () => {
    const { ledger, counter } = freshLedger();
    expect(() => post(ledger, counter, 0, "nan", [[1000, NaN], [4000, -NaN]])).toThrow();
  });

  it("drops zero-amount lines and assigns sequential ids", () => {
    const { ledger, counter } = freshLedger();
    const e1 = post(ledger, counter, 0, "gate", [[1000, 100], [4000, -100], [4100, 0]]);
    expect(e1.l).toHaveLength(2);
    const e2 = post(ledger, counter, 1, "concessions", [[1000, 50], [4100, -50]]);
    expect(e2.i).toBe(e1.i + 1);
  });
});

describe("a season of postings", () => {
  it("reconciles: assets == liabilities + equity + net income, and auditBooks() returns clean", () => {
    const { ledger, counter } = freshLedger();
    // opening capital
    post(ledger, counter, 0, "owner buy-in", [[1000, 500_000], [3000, -500_000]]);
    // a season of home dates
    for (let day = 1; day <= 20; day++) {
      post(ledger, counter, day, `gate ${day}`, [[1000, 14_500], [4000, -14_500]]);
      post(ledger, counter, day, `concessions ${day}`, [[1000, 4_200], [4100, -4_200]]);
      post(ledger, counter, day, `payroll ${day}`, [[1000, -12_000], [5000, 12_000]]);
    }
    const audit = auditBooks(ledger);
    expect(audit.fails).toEqual([]);
    expect(audit.entries).toBe(61);

    const bs = balanceSheet(ledger);
    expect(bs.ok).toBe(true);
    expect(bs.totalA).toBeCloseTo(bs.totalLE, 2);

    const is = incomeStatement(ledger);
    expect(is.totalRev).toBeCloseTo(20 * (14_500 + 4_200), 2);
    expect(is.totalExp).toBeCloseTo(20 * 12_000, 2);
    expect(balance(ledger, 1000)).toBeCloseTo(500_000 + is.net, 2);
  });

  it("catches a corrupted ledger the same way DECISIONS.md D61's round-trip check does", () => {
    // Simulate a corrupted save: an entry line reaching into an account the
    // chart of accounts doesn't define. auditBooks must report it, not hide it.
    const ledger: JournalEntry[] = [
      { i: 1, d: 0, m: "corrupted", t: "", l: [[1000, 100], [9999, -100]] },
    ];
    const audit = auditBooks(ledger);
    expect(audit.fails.some((f) => f.includes("unknown account"))).toBe(true);
  });
});
