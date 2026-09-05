/**
 * Gate — what a night at the park is actually worth.
 *
 * THE DATA IS ALREADY THERE, AND IT IS UNUSUALLY GOOD. Every home date
 * posts one journal entry tagged `"gate"` splitting four revenue accounts
 * (4000 receipts, 4100 concessions, 4600 parking, 4300 merchandise) plus a
 * second entry for game-day staff (5700). Nothing had ever read them apart.
 * That split IS the game's most important economic result — RESEARCH.md
 * §25's finding that roughly HALF of per-fan revenue is not the ticket,
 * which is why MLB ticket demand is price-inelastic and why the
 * revenue-maximising price is not the highest one. D101 built the mechanic;
 * this screen is where you can finally see it.
 *
 * ATTENDANCE IS DERIVED, NOT PARSED. `gateDay` writes the crowd into the
 * entry's memo ("Home gate — 34,102 fans"), and scraping that string back
 * out would be the obvious move and a bad one: it is locale-formatted, so a
 * regex over it is one `toLocaleString` away from breaking. Concessions
 * revenue is `att * E.conc` where `E.conc` is a FIXED per-head rate that
 * the ticket price deliberately does not move — so `concRev / E.conc`
 * recovers the crowd exactly, in arithmetic, with no string handling at all.
 *
 * The waterfall is `design/DESIGN-SYSTEM.md` §5's, ported here rather than
 * on a screen invented to hold it: this is the first running balance in the
 * game that a chart genuinely clarifies.
 *
 * A first draft put "$/head" on every home-date row. Rendering it showed
 * all fourteen rows reading $71.00 — because per-head take is a CONSTANT by
 * construction (the four rates, times a price ratio that does not move
 * between dates). An honest number that is identical on every row is a
 * column of noise, so the row now carries the date, who was in town and the
 * seat revenue instead.
 */
import { econFor, formatShort, fromSerial, money, type JournalEntry } from "@bushleague/sim-kit";
import { useGameStore } from "../store/gameStore.js";
import { ownedClub } from "../store/selectors.js";
import { DataRow, Empty, Panel, StatTile, TileRow, Waterfall } from "../components/ui.js";

const ACC = { gate: 4000, conc: 4100, merch: 4300, park: 4600, staff: 5700 } as const;

interface HomeDate {
  day: number;
  att: number;
  gate: number;
  conc: number;
  park: number;
  merch: number;
  staff: number;
  net: number;
}

/**
 * Revenue accounts are credited (negative in this ledger's sign
 * convention — see `balanceSheet`), expenses debited. Both are returned
 * POSITIVE here so the screen never has to think about signs.
 */
function amountOn(e: JournalEntry, account: number): number {
  let t = 0;
  for (const [acc, amt] of e.l) if (acc === account) t += amt;
  return t;
}

function collectHomeDates(ledger: readonly JournalEntry[], concRate: number): HomeDate[] {
  const byDay = new Map<number, HomeDate>();
  for (const e of ledger) {
    if (e.t !== "gate") continue;
    const row =
      byDay.get(e.d) ?? { day: e.d, att: 0, gate: 0, conc: 0, park: 0, merch: 0, staff: 0, net: 0 };
    row.gate += -amountOn(e, ACC.gate);
    row.conc += -amountOn(e, ACC.conc);
    row.park += -amountOn(e, ACC.park);
    row.merch += -amountOn(e, ACC.merch);
    row.staff += amountOn(e, ACC.staff);
    byDay.set(e.d, row);
  }
  const out = [...byDay.values()];
  for (const r of out) {
    r.att = concRate > 0 ? Math.round(r.conc / concRate) : 0;
    r.net = r.gate + r.conc + r.park + r.merch - r.staff;
  }
  return out.sort((a, b) => b.day - a.day);
}

export default function GatePage() {
  const state = useGameStore((s) => s.state);
  const club = state ? ownedClub(state) : null;

  if (!state || !club) {
    return (
      <div className="flex h-full flex-col overflow-y-auto">
        <Panel title="Gate">
          <Empty what="Your home dates would be here." why="No club yet." />
        </Panel>
      </div>
    );
  }

  const E = econFor(club);
  const dates = collectHomeDates(state.ledger, E.conc);

  // Who was in town. `state.box` carries the owner's own played games, so
  // the opponent for a home date is a lookup by serial day — no new data,
  // and it turns an anonymous row of money into a night you remember.
  const oppByDay = new Map<number, string>();
  for (const g of state.box) {
    if (g.homeClubId !== club.id) continue;
    const away = state.world.clubs.find((c) => c.id === g.awayClubId);
    if (away) oppByDay.set(g.day, `${away.abbr} ${g.result.awayRuns}-${g.result.homeRuns}`);
  }

  if (!dates.length) {
    return (
      <div className="flex h-full flex-col overflow-y-auto">
        <Panel title="Gate">
          <Empty
            what={`Every home date at ${club.park} lands here — the crowd, and what each of them spent.`}
            why="You have not played a home game yet."
            next="Advance to your first home date and this fills in on its own."
          />
        </Panel>
      </div>
    );
  }

  const sum = dates.reduce(
    (t, d) => ({
      gate: t.gate + d.gate,
      conc: t.conc + d.conc,
      park: t.park + d.park,
      merch: t.merch + d.merch,
      staff: t.staff + d.staff,
      att: t.att + d.att,
      net: t.net + d.net,
    }),
    { gate: 0, conc: 0, park: 0, merch: 0, staff: 0, att: 0, net: 0 },
  );

  const revenue = sum.gate + sum.conc + sum.park + sum.merch;
  // The number this whole screen exists to show.
  const notTicket = revenue > 0 ? 1 - sum.gate / revenue : 0;
  const avgAtt = Math.round(sum.att / dates.length);
  const perHead = sum.att > 0 ? revenue / sum.att : 0;
  const full = club.cap > 0 ? avgAtt / club.cap : 0;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b px-[var(--sp-3)] py-[var(--sp-2)]" style={{ borderColor: "var(--c-border)" }}>
        <div
          className="text-[var(--fs-micro)]"
          style={{ color: "var(--c-dim2)", textTransform: "var(--shell-label-case)" as never, letterSpacing: "var(--shell-label-track)" }}
        >
          Not the ticket
        </div>
        <div className="display text-[var(--fs-lg)] leading-none" style={{ color: "var(--c-text)" }}>
          {(notTicket * 100).toFixed(0)}%
        </div>
        <div className="text-[var(--fs-micro)]" style={{ color: "var(--c-dim)" }}>
          of {money(revenue)} taken over {dates.length} date{dates.length === 1 ? "" : "s"} — concessions, parking and
          merchandise, not seats
        </div>
      </div>

      <TileRow>
        <StatTile label="Avg crowd" value={avgAtt.toLocaleString()} context={`${(full * 100).toFixed(0)}% of ${club.cap.toLocaleString()}`} />
        <StatTile label="Per head" value={`$${perHead.toFixed(2)}`} context={`face $${Math.round(state.ticketPrice)}`} />
      </TileRow>

      <Panel title="Where the money comes from">
        <Waterfall
          steps={[
            { label: "Receipts", amount: sum.gate },
            { label: "Concessions", amount: sum.conc },
            { label: "Parking", amount: sum.park },
            { label: "Merch", amount: sum.merch },
            { label: "Game-day", amount: -sum.staff },
          ]}
          total={{ label: "Net", amount: sum.net }}
        />
      </Panel>

      <Panel title={`Home dates · ${dates.length}`} bare>
        {dates.slice(0, 40).map((d) => (
          <DataRow
            key={d.day}
            name={formatShort(fromSerial(d.day))}
            meta={`${oppByDay.get(d.day) ?? "—"} · ${d.att.toLocaleString()} in · ${(club.cap > 0 ? (d.att / club.cap) * 100 : 0).toFixed(0)}% full`}
            value={money(d.net)}
            sub={`${money(d.gate)} seats`}
            tone={d.net >= 0 ? undefined : "neg"}
          />
        ))}
        {dates.length > 40 && (
          <p className="px-[var(--sp-3)] pt-[var(--sp-2)] text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
            Showing the last 40 of {dates.length}.
          </p>
        )}
      </Panel>
    </div>
  );
}
