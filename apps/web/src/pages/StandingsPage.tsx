/**
 * Standings — the league, and whether your record is telling the truth.
 *
 * The data was always here: `Club.w/l/rs/ra/gp/l10/strk` are accumulated by
 * the season driver, and `divisionStandings` has computed games-back since
 * the state-wiring pass. Nothing read it beyond the three-row sliver on the
 * Office page.
 *
 * WHAT THE SCREEN ADDS beyond a table of records is the expected-record
 * comparison (`expectedWins`, `selectors.ts`). A club four wins above its
 * run differential is not as good as its record; one four wins below is
 * better than its record and likely to correct. That is the single most
 * useful thing an owner can read off a standings page, and MLB.com shows
 * exactly this column (RESEARCH.md §286). The exponent behind it is
 * disclosed as a display-only derivation in `selectors.ts`, not treated as
 * a sourced constant.
 *
 * DENSITY. Phone-first: the table becomes a list (ui-phone-first.md's own
 * pattern), each club a two-line block carrying record, pct, games back,
 * run differential, last ten and streak — six figures in the width a real
 * table would spend on three.
 *
 * A ranked bar per club was built here and then REMOVED after rendering it.
 * §5's ranked bar is for a leaderboard whose magnitudes actually spread; a
 * five-club division clusters around .500, so the bars measured .600 → 100%
 * and .491 → 82% and every row looked the same. Full-width rules stacked on
 * top of the row hairlines also broke ui-phone-first's "group with space,
 * separate with lines — not both". Dropping them made two more clubs fit on
 * the screen, which is worth more than a chart that says nothing.
 */
import { winPct } from "@bushleague/sim-kit";
import { useGameStore } from "../store/gameStore.js";
import { expectedWins, leagueDivisions, ownedClub } from "../store/selectors.js";
import { DataRow, Empty, Panel } from "../components/ui.js";

function streakText(strk: number): string {
  if (!strk) return "—";
  return `${strk > 0 ? "W" : "L"}${Math.abs(strk)}`;
}

export default function StandingsPage() {
  const state = useGameStore((s) => s.state);
  const club = state ? ownedClub(state) : null;

  if (!state || !club) {
    return (
      <div className="flex h-full flex-col overflow-y-auto">
        <Panel title="Standings">
          <Empty what="The league table would be here." why="No club yet." />
        </Panel>
      </div>
    );
  }

  const divisions = leagueDivisions(state, club, club.div);
  const played = club.w + club.l;
  const myDiv = divisions.find((d) => d.div === club.div);
  const myRank = myDiv ? myDiv.rows.findIndex((r) => r.club.id === club.id) + 1 : 0;
  const myGb = myDiv?.rows.find((r) => r.club.id === club.id)?.gb ?? 0;
  const xw = expectedWins(club.rs, club.ra, played);
  const luck = xw === null ? null : club.w - xw;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b px-[var(--sp-3)] py-[var(--sp-2)]" style={{ borderColor: "var(--c-border)" }}>
        <div
          className="text-[var(--fs-micro)]"
          style={{ color: "var(--c-dim2)", textTransform: "var(--shell-label-case)" as never, letterSpacing: "var(--shell-label-track)" }}
        >
          {club.abbr} in the {club.div}
        </div>
        <div className="display text-[var(--fs-lg)] leading-none">
          {played ? `${club.w}-${club.l}` : "—"}
        </div>
        <div className="text-[var(--fs-micro)]" style={{ color: "var(--c-dim)" }}>
          {played === 0 ? (
            "Nothing played yet."
          ) : (
            <>
              {myRank ? `${myRank}${["st", "nd", "rd"][myRank - 1] ?? "th"}` : "—"}
              {myGb > 0 ? `, ${myGb.toFixed(1)} back` : ", leading"} ·{" "}
              {luck === null ? (
                "run differential not yet meaningful"
              ) : (
                <span style={{ color: Math.abs(luck) < 1.5 ? "var(--c-dim)" : luck > 0 ? "var(--c-warn)" : "var(--c-pos)" }}>
                  {Math.abs(luck) < 1.5
                    ? "record matches the runs"
                    : `${Math.abs(luck).toFixed(1)} ${luck > 0 ? "above" : "below"} what the runs say`}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {divisions.map(({ div, rows }) => {
        return (
          <Panel key={div} title={div} bare>
            {rows.map((r, i) => {
              const g = r.club.w + r.club.l;
              const diff = r.club.rs - r.club.ra;
              const l10w = r.club.l10.reduce((t, v) => t + v, 0);
              return (
                <DataRow
                    key={r.club.id}
                    lead={i + 1}
                    mine={r.club.id === club.id}
                    name={`${r.club.abbr} ${r.club.name}`}
                    meta={
                      g
                        ? `${diff >= 0 ? "+" : ""}${diff} diff · L10 ${l10w}-${r.club.l10.length - l10w} · ${streakText(r.club.strk)}`
                        : "not started"
                    }
                    value={`${r.club.w}-${r.club.l}`}
                  sub={g ? `${winPct(r.club.w, r.club.l)} · ${r.gb === 0 ? "—" : `${r.gb.toFixed(1)} GB`}` : undefined}
                />
              );
            })}
          </Panel>
        );
      })}
    </div>
  );
}
