/**
 * Lineup — what your manager is running tonight.
 *
 * READ-ONLY, AND THAT IS THE WHOLE POINT (D96). The registry's note said
 * this page waited on "the roster/lineup UI pass — simGame already reads a
 * real lineup, nothing sets one yet." The second half was a description of
 * a GAP; under D96 it is the DESIGN. An owner does not write the lineup
 * card. He can look at it, and he can notice that his $30M outfielder is
 * batting seventh — which is a conversation with a manager, not a drag
 * handle.
 *
 * NOTHING IS STORED, AND NOTHING NEEDS TO BE. `chartClub` derives the whole
 * depth chart from the roster deterministically — best available bats to
 * the lineup, best starters to the rotation, best arms to the pen — and
 * `simGame` calls exactly the same function to play the game. So this
 * screen is not a mirror of what the sim will do; it IS what the sim will
 * do, computed by the same code. There is no way for the two to drift.
 *
 * Law 10 holds: the order is by SCOUTED grade, so the chart reflects what
 * the organization believes about its players, not what is true about them.
 * A club that scouts badly bats the wrong man leadoff, and it will never
 * know.
 *
 * A GAP THIS SCREEN EXPOSED, disclosed rather than hidden. Rendering it
 * produced a batting order of three right fielders, two left fielders and
 * no catcher — because `chartClub` takes the nine best BATS by scouted
 * overall and nothing constrains the positions. Reading the engine
 * confirms why that is consistent rather than broken: `rateProfile` uses
 * only `hit`, `pow`, `eye` and `spd`, so the `def` and `arm` tools are
 * generated on every player and never read, and `p.pos` separates SP from
 * RP and is otherwise cosmetic. There is no fielding model yet, so no
 * result on any other screen is wrong.
 *
 * This page does NOT sort the card into something that looks like a real
 * lineup. Doing so would show an order the simulation is not playing, which
 * is a worse failure than showing an odd one. The note at the foot says so
 * to the owner, and ROADMAP.md carries the engine work.
 */
import { chartClub, type Player } from "@bushleague/sim-kit";
import { useMemo } from "react";
import { useGameStore } from "../store/gameStore.js";
import { nextGameFor, ownedClub, rosterOf } from "../store/selectors.js";
import { Confidence, DataRow, Empty, Panel } from "../components/ui.js";

function Slot({ n, p, label }: { n: number | string; p: Player | undefined; label?: string }) {
  if (!p) return null;
  return (
    <DataRow
      lead={n}
      name={`${p.fn} ${p.ln}`}
      meta={
        <>
          {label ?? p.pos} · {p.age} · <Confidence rel={p.rel} />
        </>
      }
      value={String(p.ovr)}
      sub={p.pot > p.ovr ? `${p.pot} pot` : undefined}
    />
  );
}

export default function LineupPage() {
  const state = useGameStore((s) => s.state);
  const club = state ? ownedClub(state) : null;

  const chart = useMemo(() => {
    if (!state || !club) return null;
    return chartClub(rosterOf(state, club.id));
  }, [state, club]);

  if (!state || !club || !chart) {
    return (
      <div className="flex h-full flex-col overflow-y-auto">
        <Panel title="Lineup">
          <Empty what="Tonight's card would be here." why="No club yet." />
        </Panel>
      </div>
    );
  }

  const byId = new Map(state.players.filter((p) => p.cid === club.id).map((p) => [p.id, p]));
  const next = nextGameFor(state, club.id);
  // simGame indexes the rotation by games played, so tonight's starter is
  // not "the ace" — it is whoever the turn lands on. Reading it the same
  // way the sim does is the only way this screen stays true.
  const starterIdx = chart.rot.length ? club.gp % chart.rot.length : 0;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b px-[var(--sp-3)] py-[var(--sp-2)]" style={{ borderColor: "var(--c-border)" }}>
        <div
          className="text-[var(--fs-micro)]"
          style={{ color: "var(--c-dim2)", textTransform: "var(--shell-label-case)" as never, letterSpacing: "var(--shell-label-track)" }}
        >
          {next ? `${next.home ? "vs" : "@"} ${next.opponent.abbr}` : "No game scheduled"}
        </div>
        <div className="display text-[var(--fs-lg)] leading-none">
          {byId.get(chart.rot[starterIdx] ?? "")?.ln ?? "—"}
        </div>
        <div className="text-[var(--fs-micro)]" style={{ color: "var(--c-dim)" }}>
          starts · slot {starterIdx + 1} of {chart.rot.length} in the turn
        </div>
      </div>

      <Panel title="Batting order" bare>
        {chart.lineup.map((id, i) => (
          <Slot key={id} n={i + 1} p={byId.get(id)} />
        ))}
      </Panel>

      <Panel title="Rotation" bare>
        {chart.rot.map((id, i) => (
          <Slot key={id} n={i === starterIdx ? "▸" : i + 1} p={byId.get(id)} label="SP" />
        ))}
      </Panel>

      <Panel title="Bullpen" bare>
        {chart.pen.map((id, i) => (
          <Slot key={id} n={i + 1} p={byId.get(id)} label="RP" />
        ))}
      </Panel>

      <Panel title="Who sets this">
        <p className="text-[var(--fs-sm)]" style={{ color: "var(--c-dim2)" }}>
          Your manager does, off the organization&rsquo;s own scouted grades — and the game is played from exactly
          this card. If it looks wrong, the argument is with your scouting budget or your manager, not with a drag
          handle.
        </p>
        <p className="mt-[var(--sp-2)] text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
          Fielding is not simulated yet, so the card is picked on bat alone and the positions beside each name are
          descriptive, not assignments. You will see repeats and gaps. Nothing on any other screen depends on it.
        </p>
      </Panel>
    </div>
  );
}
