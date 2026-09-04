/**
 * Formatter tests keyed directly to the VERIFIED EXAMPLES quoted in
 * RESEARCH.md §3.7 — read off live MLB.com / Baseball-Reference pages, not
 * invented. Getting these wrong makes the whole game read as fake.
 */
import { describe, expect, it } from "vitest";
import { avg3, rate, ipFromOuts, winPct, pct, money } from "../src/format.js";

describe("avg3 — BA/OBP/SLG/OPS/W-L%, drop the leading zero", () => {
  it.each([
    [0.311, ".311"],
    [0.219, ".219"],
    [0.274, ".274"],
    [0.425, ".425"],
    [0.686, ".686"],
    [0.712, ".712"],
    [0.818, ".818"],
  ])("%f -> %s", (v, expected) => {
    expect(avg3(v)).toBe(expected);
  });

  it("keeps the leading 1 once OPS crosses 1.000", () => {
    expect(avg3(1.111)).toBe("1.111");
  });
});

describe("rate — ERA/FIP/WHIP/WAR/per-nine, keep the leading zero", () => {
  it.each([
    [2.39, 2, "2.39"],
    [2.49, 2, "2.49"],
    [0.922, 3, "0.922"],
    [10.8, 1, "10.8"],
    [6.51, 2, "6.51"],
  ])("%f (%i dp) -> %s", (v, d, expected) => {
    expect(rate(v, d)).toBe(expected);
  });
});

describe("ipFromOuts — thirds notation", () => {
  it("192.0 IP from 576 outs", () => {
    expect(ipFromOuts(576)).toBe("192.0");
  });
  it("144.1 IP (144 and a third) from 433 outs", () => {
    expect(ipFromOuts(433)).toBe("144.1");
  });
  it("144.2 IP (144 and two thirds) from 434 outs", () => {
    expect(ipFromOuts(434)).toBe("144.2");
  });
});

describe("winPct", () => {
  it("Skenes-style .818 W-L%", () => {
    expect(winPct(18, 4)).toBe(".818");
  });
  it("0-0 reads .000, not NaN", () => {
    expect(winPct(0, 0)).toBe(".000");
  });
});

describe("money", () => {
  it.each([
    [412_088, "$412K"],
    [1_700_000_000, "$1.70B"],
    [24_500_000, "$24.50M"],
    [10_000, "$10K"],
    [9_500, "$9,500"],
  ])("%d -> %s", (v, expected) => {
    expect(money(v)).toBe(expected);
  });
});

describe("pct", () => {
  it("defaults to one decimal", () => {
    expect(pct(0.146)).toBe("14.6%");
  });
});
