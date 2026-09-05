/**
 * Scouting — what your money bought, and what you still do not know.
 *
 * THE MECHANIC IS REAL AND WAS INVISIBLE. `scoutingBudget` posts to the
 * ledger every month (account 5300) and feeds `scoutBoostFor`, which raises
 * every one of your players' `rel` — how much the organization actually
 * knows about him (D90). `rel` is what makes a scouted grade accurate:
 * `ovrOf`/`estOf` add per-player noise scaled by `(1 - p.rel)`. So the
 * budget does not buy better players, it buys a smaller lie.
 *
 * WHAT AN OWNER SHOULD READ HERE is therefore not a number of scouts. It is
 * the SHAPE of his own ignorance: how much of the organization he can see
 * clearly, and specifically which assets are least understood. A 21-year-old
 * with a 65 potential and one bar of confidence is the most interesting
 * player in the system — he is either the next star or nothing, and nobody
 * in the building can tell you which.
 *
 * THE BUDGET CONTROL LIVES ON BUDGET, not here, and this page links to it
 * rather than duplicating it. Two controls writing one field is how they
 * come to disagree.
 */
import { SCOUT_BOOST_MAX, SCOUT_BOOST_SATURATE_AT, econFor, money, scoutBoostFor } from "@bushleague/sim-kit";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore.js";
import { orgClubs, ownedClub, rosterOf } from "../store/selectors.js";
import { Bar, Confidence, DataRow, Empty, Panel, StatTile, TileRow, confidenceSteps } from "../components/ui.js";

const STEP_LABEL = ["", "barely known", "thin", "fair", "good", "well known"];

export default function ScoutingPage() {
  const state = useGameStore((s) => s.state);
  const club = state ? ownedClub(state) : null;
  const navigate = useNavigate();

  const data = useMemo(() => {
    if (!state || !club) return null;
    const players = orgClubs(state).flatMap((c) => rosterOf(state, c.id));
    const buckets = [0, 0, 0, 0, 0];
    for (const p of players) buckets[confidenceSteps(p.rel) - 1]!++;
    // The interesting ones: highest upside we understand least. Ranking by
    // potential alone lists the same names the Roster already does; ranking
    // by uncertainty alone lists whoever just signed. The product is what
    // an owner would actually ask about.
    const murk = [...players].sort((a, b) => b.pot * (1 - b.rel) - a.pot * (1 - a.rel)).slice(0, 12);
    const avgRel = players.length ? players.reduce((t, p) => t + p.rel, 0) / players.length : 0;
    return { players, buckets, murk, avgRel };
  }, [state, club]);

  if (!state || !club || !data) {
    return (
      <div className="flex h-full flex-col overflow-y-auto">
        <Panel title="Scouting">
          <Empty what="What your scouts know would be here." why="No club yet." />
        </Panel>
      </div>
    );
  }

  const E = econFor(club);
  const boost = scoutBoostFor(state.scoutingBudget, E.scouting);
  const saturates = SCOUT_BOOST_SATURATE_AT * E.scouting;
  const maxBucket = Math.max(1, ...data.buckets);
  const clear = data.buckets[3]! + data.buckets[4]!;
  const clubIndex = new Map(state.world.clubs.map((c) => [c.id, c]));

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b px-[var(--sp-3)] py-[var(--sp-2)]" style={{ borderColor: "var(--c-border)" }}>
        <div
          className="text-[var(--fs-micro)]"
          style={{ color: "var(--c-dim2)", textTransform: "var(--shell-label-case)" as never, letterSpacing: "var(--shell-label-track)" }}
        >
          Seen clearly
        </div>
        <div className="display text-[var(--fs-lg)] leading-none">
          {data.players.length ? `${Math.round((clear / data.players.length) * 100)}%` : "—"}
        </div>
        <div className="text-[var(--fs-micro)]" style={{ color: "var(--c-dim)" }}>
          {clear} of {data.players.length} under contract · average confidence {Math.round(data.avgRel * 100)}%
        </div>
      </div>

      <TileRow>
        <StatTile label="Authorised" value={money(state.scoutingBudget)} context="annual, posts monthly" />
        <StatTile
          label="Coverage"
          value={`+${(boost * 100).toFixed(0)} pts`}
          context={boost >= SCOUT_BOOST_MAX ? "saturated" : `saturates at ${money(saturates)}`}
          tone={boost >= SCOUT_BOOST_MAX ? "pos" : undefined}
        />
      </TileRow>

      <Panel title="How well you know your own players">
        {data.buckets.map((n, i) => (
          <div key={i} className="flex items-center gap-[var(--sp-2)] py-[3px]">
            <span className="w-[5.5rem] shrink-0 truncate text-[var(--fs-micro)]" style={{ color: "var(--c-dim)" }}>
              {STEP_LABEL[i + 1]}
            </span>
            <span className="min-w-0 flex-1">
              <Bar pct={(n / maxBucket) * 100} tone={i >= 3 ? "pos" : i === 0 ? "neg" : "dim"} />
            </span>
            <span className="num w-[2.5rem] shrink-0 text-right text-[var(--fs-micro)]">{n}</span>
          </div>
        ))}
        <p className="pt-[var(--sp-2)] text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
          Money buys confidence, not talent. A grade you trust is worth more than a grade that flatters.
        </p>
      </Panel>

      <Panel title="Least understood, most upside" bare>
        {data.murk.length === 0 ? (
          <Empty what="Your murkiest assets." why="Nobody is under contract yet." />
        ) : (
          data.murk.map((p) => (
            <DataRow
              key={p.id}
              name={`${p.fn} ${p.ln}`}
              meta={
                <>
                  {clubIndex.get(p.cid ?? "")?.abbr ?? "—"} · {p.pos} · {p.age} · <Confidence rel={p.rel} />
                </>
              }
              value={String(p.pot)}
              sub={`${p.ovr} now`}
            />
          ))
        )}
      </Panel>

      <Panel title="Set the budget">
        <button
          type="button"
          onClick={() => navigate("/p/budget")}
          className="w-full border px-[var(--sp-3)] text-left text-[var(--fs-sm)]"
          style={{ minHeight: "2.75rem", borderColor: "var(--c-border)", color: "var(--c-accent)" }}
        >
          Scouting budget is on Budget →
        </button>
      </Panel>
    </div>
  );
}
