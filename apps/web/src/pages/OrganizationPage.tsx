/**
 * Organization — the whole ladder you own, one club per rung.
 *
 * The registry's own note said this page waited on "parent-affiliation
 * research (RESEARCH.md's own open gap)". That note is STALE: the research
 * landed and `Club.parent` has carried real, sourced affiliations since
 * v2.12.0 (D91). Nothing was blocking this but a screen.
 *
 * D96 again: this is a REPORTING context, not five rosters you hand-edit.
 * An owner asks how the farm is doing, where the payroll is going, and
 * which rung is thin — not which reliever should be in Double-A. Every row
 * here answers one of those and none of them moves a player.
 *
 * An independent club has no affiliates, and the same shape degrades to a
 * single row rather than needing a special case.
 */
import { econFor, leagueMonths, money, rosterPayroll, winPct } from "@bushleague/sim-kit";
import { useGameStore } from "../store/gameStore.js";
import { orgClubs, ownedClub, rosterOf } from "../store/selectors.js";
import { Bar, DataRow, Empty, Panel, StatTile, TileRow } from "../components/ui.js";

const LEVEL_LABEL: Record<string, string> = {
  MLB: "Majors",
  AAA: "Triple-A",
  AA: "Double-A",
  HIA: "High-A",
  A: "Single-A",
  INDY: "Club",
};

export default function OrganizationPage() {
  const state = useGameStore((s) => s.state);
  const club = state ? ownedClub(state) : null;

  if (!state || !club) {
    return (
      <div className="flex h-full flex-col overflow-y-auto">
        <Panel title="Organization">
          <Empty what="Your clubs would be here." why="No club yet." />
        </Panel>
      </div>
    );
  }

  const clubs = orgClubs(state);
  const rows = clubs.map((c) => {
    const roster = rosterOf(state, c.id);
    const months = c.lvl === "MLB" ? 12 : leagueMonths(c);
    const annual = rosterPayroll(state.players, c) * months;
    const g = c.w + c.l;
    // The scouted average, not the true one — Law 10 holds on this screen
    // exactly as it does on the Roster.
    const avgOvr = roster.length ? roster.reduce((t, p) => t + p.ovr, 0) / roster.length : 0;
    const avgAge = roster.length ? roster.reduce((t, p) => t + p.age, 0) / roster.length : 0;
    return { c, n: roster.length, annual, g, avgOvr, avgAge, econ: econFor(c) };
  });

  const totalPlayers = rows.reduce((t, r) => t + r.n, 0);
  const totalPayroll = rows.reduce((t, r) => t + r.annual, 0);
  const bestOvr = Math.max(1, ...rows.map((r) => r.avgOvr));

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b px-[var(--sp-3)] py-[var(--sp-2)]" style={{ borderColor: "var(--c-border)" }}>
        <div
          className="text-[var(--fs-micro)]"
          style={{ color: "var(--c-dim2)", textTransform: "var(--shell-label-case)" as never, letterSpacing: "var(--shell-label-track)" }}
        >
          {club.city} {club.name} organization
        </div>
        <div className="display text-[var(--fs-lg)] leading-none">{clubs.length}</div>
        <div className="text-[var(--fs-micro)]" style={{ color: "var(--c-dim)" }}>
          {clubs.length === 1 ? "club — independent, no affiliates" : `clubs, ${totalPlayers} players under contract`}
        </div>
      </div>

      <TileRow>
        <StatTile label="Org payroll" value={money(totalPayroll)} context="annual, every level" />
        <StatTile
          label="Players"
          value={String(totalPlayers)}
          context={`${(totalPlayers / Math.max(1, clubs.length)).toFixed(0)} per club`}
        />
      </TileRow>

      <Panel title="The ladder" bare>
        {rows.map(({ c, n, annual, g, avgOvr, avgAge }) => (
          <div key={c.id}>
            <DataRow
              lead={LEVEL_LABEL[c.lvl] ?? c.lvl}
              mine={c.id === club.id}
              name={`${c.city} ${c.name}`}
              meta={g ? `${c.w}-${c.l} (${winPct(c.w, c.l)}) · ${n} players · age ${avgAge.toFixed(1)}` : `${n} players · age ${avgAge.toFixed(1)}`}
              value={money(annual)}
              sub={`${avgOvr.toFixed(0)} avg`}
            />
            <div className="px-[var(--sp-3)] pb-[3px]">
              <Bar pct={(avgOvr / bestOvr) * 100} tone={c.id === club.id ? "accent" : "dim"} />
            </div>
          </div>
        ))}
      </Panel>

      <Panel title="What this page is not">
        <p className="text-[var(--fs-sm)]" style={{ color: "var(--c-dim2)" }}>
          There is nothing here to promote, demote or release. You own the organization; your general manager
          operates it. What you set is on Delegation and Budget.
        </p>
      </Panel>
    </div>
  );
}
