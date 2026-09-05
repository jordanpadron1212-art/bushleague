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
 * THE GAP THIS SCREEN EXPOSED IS NOW CLOSED. The first version of this
 * page rendered a batting order of three right fielders and no catcher,
 * because `chartClub` took the nine best BATS and nothing constrained
 * position. That was a real engine gap — `def` and `arm` were generated on
 * every player and read by nothing — and this screen is what made it
 * visible. `fielding.ts` closed it: positions are filled hardest-first
 * against the sourced positional adjustment (RESEARCH.md §21.6), up the
 * middle is closed to specialists, and the nine men shown here are the nine
 * the simulation actually fields.
 *
 * So the card now carries a POSITION for every man, and the club's own
 * defensive standing, because both finally mean something.
 */
import { LVL, chartClub, naturalSlot, teamDefense, type FieldSlot, type Player } from "@bushleague/sim-kit";
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

  // Where each man is standing, and what the nine of them are worth.
  const slotOf = new Map<string, FieldSlot>();
  for (const [slot, id] of chart.field) slotOf.set(id, slot);
  const assignment = new Map<FieldSlot, Player>();
  for (const [slot, id] of chart.field) {
    const p = byId.get(id);
    if (p) assignment.set(slot, p);
  }
  const centre = (LVL[club.lvl as keyof typeof LVL] ?? LVL.INDY).c;
  const defence = teamDefense(assignment, centre);

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
        {chart.lineup.map((id, i) => {
          const p = byId.get(id);
          const slot = slotOf.get(id);
          const natural = p ? naturalSlot(p) : undefined;
          return (
            <Slot
              key={id}
              n={i + 1}
              p={p}
              label={slot ? (slot === natural ? slot : `${slot} (${natural})`) : undefined}
            />
          );
        })}
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

      <Panel title="Defence">
        <div className="grid grid-cols-3 gap-[var(--sp-2)] text-[var(--fs-sm)]">
          <div>
            <div className="text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
              GLOVES
            </div>
            <div className="num" style={{ color: defence.runs >= 0 ? "var(--c-pos)" : "var(--c-neg)" }}>
              {defence.runs >= 0 ? "+" : ""}
              {defence.runs.toFixed(0)}
            </div>
            <div className="text-[var(--fs-micro)]" style={{ color: "var(--c-dim)" }}>
              runs / yr
            </div>
          </div>
          <div>
            <div className="text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
              FRAMING
            </div>
            <div className="num" style={{ color: defence.framingRuns >= 0 ? "var(--c-pos)" : "var(--c-neg)" }}>
              {defence.framingRuns >= 0 ? "+" : ""}
              {defence.framingRuns.toFixed(0)}
            </div>
            <div className="text-[var(--fs-micro)]" style={{ color: "var(--c-dim)" }}>
              your catcher
            </div>
          </div>
          <div>
            <div className="text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
              ON CONTACT
            </div>
            <div className="num" style={{ color: defence.babipDelta <= 0 ? "var(--c-pos)" : "var(--c-neg)" }}>
              {defence.babipDelta <= 0 ? "" : "+"}
              {(defence.babipDelta * 1000).toFixed(0)}
            </div>
            <div className="text-[var(--fs-micro)]" style={{ color: "var(--c-dim)" }}>
              pts of BABIP
            </div>
          </div>
        </div>
        <p className="pt-[var(--sp-2)] text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
          What your gloves are worth against the rest of your league — not against the majors. Once a ball is in
          play the pitcher has largely done his job; the rest is who is standing where.
        </p>
      </Panel>

      <Panel title="Who sets this">
        <p className="text-[var(--fs-sm)]" style={{ color: "var(--c-dim2)" }}>
          Your manager does, off the organization&rsquo;s own scouted grades — and the game is played from exactly
          this card. If it looks wrong, the argument is with your scouting budget or your manager, not with a drag
          handle.
        </p>
        <p className="mt-[var(--sp-2)] text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
          A name shown as &ldquo;LF (3B)&rdquo; is playing out of position — a bat your manager wanted in the order,
          hidden at a corner. It costs something, and the figure above says how much.
        </p>
      </Panel>
    </div>
  );
}
