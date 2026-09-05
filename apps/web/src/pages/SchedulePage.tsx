/**
 * Schedule — your season, behind and ahead, on one strip.
 *
 * WHAT IS AND IS NOT RECOVERABLE, and the page is built to the honest
 * answer. `state.sched` holds EVERY game in the world as
 * `[day, homeIndex, awayIndex]`, so the fixtures ahead are exact for every
 * club. RESULTS, though, are kept per game only for the OWNER's club
 * (`state.box`, `season.ts`'s `PlayedGame`); every other club keeps a
 * season aggregate and nothing else. So this screen is the owner's own
 * season — which is the only one an owner would ask for anyway — and it
 * never implies it knows a score it does not have.
 *
 * `state.box` is CAPPED, the same way the original capped `G.box`. A long
 * season will therefore have played games with no surviving box score. The
 * page renders those as played-but-unrecorded rather than silently dropping
 * them, because a schedule with holes in it reads as a bug.
 *
 * AHEAD FIRST, BEHIND SECOND. The first build of this page was one
 * chronological list of all 162, which opens on the season's first game in
 * March and makes an owner in July scroll past four months to find out who
 * is in town tomorrow. What is COMING is the thing a schedule is consulted
 * for; results are a second, shorter section. The date also moved out of the
 * row's leading slot, where "MAR 26" wrapped onto two lines in 36px.
 */
import { formatShort, fromSerial } from "@bushleague/sim-kit";
import { useGameStore } from "../store/gameStore.js";
import { ownedClub } from "../store/selectors.js";
import { DataRow, Empty, Panel, StatTile, TileRow } from "../components/ui.js";

interface Fixture {
  day: number;
  home: boolean;
  oppAbbr: string;
  /** `null` when the game has not been played, or fell off the capped box. */
  result: { us: number; them: number; won: boolean } | null;
  played: boolean;
}

export default function SchedulePage() {
  const state = useGameStore((s) => s.state);
  const club = state ? ownedClub(state) : null;

  if (!state || !club) {
    return (
      <div className="flex h-full flex-col overflow-y-auto">
        <Panel title="Schedule">
          <Empty what="Your season would be here." why="No club yet." />
        </Panel>
      </div>
    );
  }

  const today = state.date;
  const todaySerial = new Date(Date.UTC(today.y, today.m - 1, today.d)).getTime() / 86400000;

  const boxByDay = new Map<number, (typeof state.box)[number]>();
  for (const g of state.box) if (g.homeClubId === club.id || g.awayClubId === club.id) boxByDay.set(g.day, g);

  const fixtures: Fixture[] = [];
  for (const [day, hi, ai] of state.sched) {
    const home = state.world.clubs[hi];
    const away = state.world.clubs[ai];
    if (!home || !away) continue;
    const isHome = home.id === club.id;
    if (!isHome && away.id !== club.id) continue;
    const opp = isHome ? away : home;
    const g = boxByDay.get(day);
    let result: Fixture["result"] = null;
    if (g) {
      const us = isHome ? g.result.homeRuns : g.result.awayRuns;
      const them = isHome ? g.result.awayRuns : g.result.homeRuns;
      result = { us, them, won: us > them };
    }
    fixtures.push({ day, home: isHome, oppAbbr: opp.abbr, result, played: day < todaySerial });
  }
  fixtures.sort((a, b) => a.day - b.day);

  if (!fixtures.length) {
    return (
      <div className="flex h-full flex-col overflow-y-auto">
        <Panel title="Schedule">
          <Empty what={`${club.abbr}'s fixtures would be here.`} why="This club has no games on the schedule." />
        </Panel>
      </div>
    );
  }

  const remaining = fixtures.filter((f) => !f.played);
  const done = fixtures.filter((f) => f.played).reverse();
  const homeLeft = remaining.filter((f) => f.home).length;
  const next = remaining[0];
  const wins = done.filter((f) => f.result?.won).length;
  const losses = done.filter((f) => f.result && !f.result.won).length;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <TileRow>
        <StatTile
          label="Games left"
          value={remaining.length ? String(remaining.length) : null}
          context={remaining.length ? `${homeLeft} at ${club.park}` : "season complete"}
        />
        <StatTile
          label="Next"
          value={next ? `${next.home ? "vs" : "@"} ${next.oppAbbr}` : null}
          context={next ? formatShort(fromSerial(next.day)) : "nothing scheduled"}
        />
      </TileRow>

      <Panel title={`Ahead · ${remaining.length}`} bare>
        {remaining.length === 0 ? (
          <Empty what="Your remaining fixtures." why="The season is complete." />
        ) : (
          remaining.slice(0, 30).map((f, i) => (
            <DataRow
              key={`${f.day}-${f.oppAbbr}-${f.home ? "h" : "a"}`}
              mine={i === 0}
              name={`${f.home ? "vs" : "@"} ${f.oppAbbr}`}
              meta={`${formatShort(fromSerial(f.day))} · ${f.home ? club.park : "away"}`}
              value={i === 0 ? "next" : undefined}
            />
          ))
        )}
      </Panel>

      <Panel title={`Behind · ${wins}-${losses}`} bare>
        {done.length === 0 ? (
          <Empty what="Your results." why="Nothing played yet." next="Advance a day." />
        ) : (
          done.slice(0, 30).map((f) => (
            <DataRow
              key={`${f.day}-${f.oppAbbr}-${f.home ? "h" : "a"}`}
              name={`${f.home ? "vs" : "@"} ${f.oppAbbr}`}
              meta={`${formatShort(fromSerial(f.day))} · ${f.home ? club.park : "away"}`}
              value={f.result ? `${f.result.us}-${f.result.them}` : "played"}
              sub={f.result ? (f.result.won ? "W" : "L") : "not kept"}
              tone={f.result ? (f.result.won ? "pos" : "neg") : undefined}
            />
          ))
        )}
      </Panel>
    </div>
  );
}
