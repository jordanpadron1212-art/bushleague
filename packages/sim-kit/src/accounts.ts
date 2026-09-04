/**
 * Chart of accounts — double-entry (LAWS.md Law 4).
 * Ported verbatim from bush-league-v0.10.html's `COA` (the last vanilla-JS
 * build) so every account id and balance in the old game still means the
 * same thing here. See DECISIONS.md for the entry recording this port.
 */

export type AccountType = "A" | "L" | "E" | "R" | "X";

export interface AccountDef {
  name: string;
  type: AccountType;
}

export const CHART_OF_ACCOUNTS: Readonly<Record<number, AccountDef>> = {
  1000: { name: "Cash", type: "A" },
  1100: { name: "Accounts receivable", type: "A" },
  1500: { name: "Ballpark & equipment", type: "A" },
  1600: { name: "Player contracts (capitalised bonus)", type: "A" },
  2000: { name: "Accounts payable", type: "L" },
  2100: { name: "Deferred compensation", type: "L" },
  2500: { name: "Notes payable", type: "L" },
  3000: { name: "Owner equity", type: "E" },
  3900: { name: "Retained earnings", type: "E" },
  4000: { name: "Gate receipts", type: "R" },
  4100: { name: "Concessions", type: "R" },
  4200: { name: "Sponsorship & signage", type: "R" },
  4300: { name: "Merchandise", type: "R" },
  4400: { name: "Local media", type: "R" },
  4500: { name: "League distribution", type: "R" },
  4600: { name: "Parking", type: "R" },
  5000: { name: "Player payroll", type: "X" },
  5100: { name: "Minor-league payroll", type: "X" },
  5200: { name: "Coaching & staff", type: "X" },
  5300: { name: "Scouting", type: "X" },
  5400: { name: "Player development", type: "X" },
  5500: { name: "Travel", type: "X" },
  5600: { name: "Stadium operations", type: "X" },
  5700: { name: "Game-day staff", type: "X" },
  5800: { name: "Marketing", type: "X" },
  5900: { name: "Front office & admin", type: "X" },
  6000: { name: "Insurance", type: "X" },
  6100: { name: "Interest expense", type: "X" },
};

export function accountType(id: number): AccountType | "?" {
  return CHART_OF_ACCOUNTS[id]?.type ?? "?";
}

export function accountName(id: number): string {
  return CHART_OF_ACCOUNTS[id]?.name ?? `acct ${id}`;
}

export function accountExists(id: number): boolean {
  return id in CHART_OF_ACCOUNTS;
}
