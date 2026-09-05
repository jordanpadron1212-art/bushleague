/**
 * Leaders — who is actually having a season.
 *
 * LAW 10 DOES NOT APPLY HERE, and that is the point worth stating. Player
 * GRADES are hidden truth shown only as noisy scouted estimates. Player
 * STATISTICS are not: a box score is public, and every figure on this
 * screen is a counting stat the sim really accumulated in `Player.st`,
 * divided by another one. Nothing here is estimated, so nothing here needs
 * a confidence treatment — which is exactly why this screen can be dense in
 * a way the Roster page deliberately is not.
 *
 * QUALIFICATION IS REAL. Without a minimum, a leaderboard is a list of
 * players with three at-bats: one 2-for-3 afternoon beats a .330 season.
 * MLB's own rule (9.22) is 3.1 plate appearances per team game for a
 * batting title and 1.0 inning pitched per team game for an ERA title, and
 * those are the thresholds used here, against the club's OWN games played
 * rather than a league-wide constant — clubs at different levels play
 * schedules of different lengths.
 *
 * The unqualified are not hidden, they are SEPARATED: the page says how
 * many there are and what the bar is. An empty leaderboard early in a
 * season is otherwise indistinguishable from a broken one.
 */
import {
  BAof,
  ERAof,
  IPof,
  K9of,
  OBPof,
  OPSof,
  SLGof,
  WHIPof,
  type Player,
} from "@bushleague/sim-kit";
import { useMemo, useState } from "react";
import { useGameStore } from "../store/gameStore.js";
import { ownedClub } from "../store/selectors.js";
import { DataRow, Empty, Panel, Segmented, type SegOption } from "../components/ui.js";

/** MLB Rule 9.22 — the qualification bars for a batting and an ERA title. */
const PA_PER_GAME = 3.1;
const IP_PER_GAME = 1.0;

const nz = (v: number | undefined): number => (Number.isFinite(v) ? (v as number) : 0);

interface Cat {
  id: string;
  label: string;
  role: "B" | "P";
  /** Higher is better unless this is set. */
  asc?: boolean;
  value: (p: Player) => number;
  fmt: (p: Player) => string;
  sub: (p: Player) => string;
}

const avg3 = (v: number) => (v < 1 ? v.toFixed(3).slice(1) : v.toFixed(3));

const CATS: readonly Cat[] = [
  { id: "avg", label: "AVG", role: "B", value: BAof, fmt: (p) => avg3(BAof(p)), sub: (p) => `${nz(p.st["h"])}-for-${nz(p.st["ab"])}` },
  { id: "ops", label: "OPS", role: "B", value: OPSof, fmt: (p) => OPSof(p).toFixed(3), sub: (p) => `${avg3(OBPof(p))} / ${avg3(SLGof(p))}` },
  { id: "hr", label: "HR", role: "B", value: (p) => nz(p.st["hr"]), fmt: (p) => String(nz(p.st["hr"])), sub: (p) => `${nz(p.st["rbi"])} RBI` },
  { id: "rbi", label: "RBI", role: "B", value: (p) => nz(p.st["rbi"]), fmt: (p) => String(nz(p.st["rbi"])), sub: (p) => `${nz(p.st["hr"])} HR` },
  { id: "sb", label: "SB", role: "B", value: (p) => nz(p.st["sb"]), fmt: (p) => String(nz(p.st["sb"])), sub: (p) => `${nz(p.st["r"])} R` },
  { id: "era", label: "ERA", role: "P", asc: true, value: ERAof, fmt: (p) => ERAof(p).toFixed(2), sub: (p) => `${IPof(p).toFixed(1)} IP` },
  { id: "whip", label: "WHIP", role: "P", asc: true, value: WHIPof, fmt: (p) => WHIPof(p).toFixed(2), sub: (p) => `${IPof(p).toFixed(1)} IP` },
  { id: "k9", label: "K/9", role: "P", value: K9of, fmt: (p) => K9of(p).toFixed(1), sub: (p) => `${nz(p.st["pso"])} K` },
  { id: "w", label: "W", role: "P", value: (p) => nz(p.st["w"]), fmt: (p) => String(nz(p.st["w"])), sub: (p) => `${nz(p.st["l"])} L · ${ERAof(p).toFixed(2)}` },
  { id: "sv", label: "SV", role: "P", value: (p) => nz(p.st["sv"]), fmt: (p) => String(nz(p.st["sv"])), sub: (p) => `${IPof(p).toFixed(1)} IP` },
];

/** Rate categories need the qualification bar; counting categories do not. */
const RATE_CATS = new Set(["avg", "ops", "era", "whip", "k9"]);

export default function LeadersPage() {
  const state = useGameStore((s) => s.state);
  const club = state ? ownedClub(state) : null;
  const [catId, setCatId] = useState("avg");

  const cat = CATS.find((c) => c.id === catId) ?? CATS[0]!;

  const { rows, unqualified, bar, pool } = useMemo(() => {
    if (!state || !club) return { rows: [] as Player[], unqualified: 0, bar: 0, pool: 0 };

    // Scope: the level and league the owner actually competes in. A single
    // list mixing MLB and rookie ball would be a list of MLB players.
    const clubIds = new Set(state.world.clubs.filter((c) => c.lvl === club.lvl && c.lg === club.lg).map((c) => c.id));
    // Games played is taken from the pool's own leader, not the owner's
    // club: clubs inside one league are not all on the same game number,
    // and using the owner's would move everyone's bar when the owner
    // happened to have an off day.
    let games = 0;
    for (const c of state.world.clubs) if (clubIds.has(c.id)) games = Math.max(games, c.w + c.l);

    const needPA = games * PA_PER_GAME;
    const needIP = games * IP_PER_GAME;
    const gated = RATE_CATS.has(cat.id);

    const eligible: Player[] = [];
    let short = 0;
    let seen = 0;
    for (const p of state.players) {
      if (!p.cid || !clubIds.has(p.cid)) continue;
      if (p.role !== cat.role) continue;
      seen++;
      const has = cat.role === "B" ? nz(p.st["pa"]) > 0 : nz(p.st["outs"]) > 0;
      if (!has) continue;
      if (gated) {
        const ok = cat.role === "B" ? nz(p.st["pa"]) >= needPA : IPof(p) >= needIP;
        if (!ok) {
          short++;
          continue;
        }
      }
      eligible.push(p);
    }

    eligible.sort((a, b) => (cat.asc ? cat.value(a) - cat.value(b) : cat.value(b) - cat.value(a)));
    return {
      rows: eligible.slice(0, 25),
      unqualified: short,
      bar: cat.role === "B" ? needPA : needIP,
      pool: seen,
    };
  }, [state, club, cat]);

  if (!state || !club) {
    return (
      <div className="flex h-full flex-col overflow-y-auto">
        <Panel title="Leaders">
          <Empty what="League leaders would be here." why="No club yet." />
        </Panel>
      </div>
    );
  }

  const bats: SegOption<string>[] = CATS.filter((c) => c.role === "B").map((c) => ({ id: c.id, label: c.label }));
  const arms: SegOption<string>[] = CATS.filter((c) => c.role === "P").map((c) => ({ id: c.id, label: c.label }));
  const gated = RATE_CATS.has(cat.id);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* One panel, two rows. Two separate panels cost ~50px of header and
          padding for a control strip, and implied the groups were
          independent when only one category can be live at a time. */}
      <Panel title="Category">
        <div className="flex items-center gap-[var(--sp-2)]">
          <span className="w-[2.5rem] shrink-0 text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
            BAT
          </span>
          <Segmented label="Batting category" options={bats} value={catId} onChange={setCatId} />
        </div>
        <div className="mt-[var(--sp-1)] flex items-center gap-[var(--sp-2)]">
          <span className="w-[2.5rem] shrink-0 text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
            ARM
          </span>
          <Segmented label="Pitching category" options={arms} value={catId} onChange={setCatId} />
        </div>
      </Panel>

      <Panel
        title={`${club.lg} · ${cat.label}`}
        right={
          <span className="num text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
            {rows.length} of {pool}
          </span>
        }
        bare
      >
        {rows.length === 0 ? (
          <Empty
            what={`The ${club.lg} ${cat.label} leaders.`}
            why={
              gated && unqualified > 0
                ? `Nobody has reached the bar yet — ${Math.ceil(bar)} ${cat.role === "B" ? "plate appearances" : "innings"} qualifies, and ${unqualified} ${unqualified === 1 ? "player is" : "players are"} short.`
                : "No games have been played yet."
            }
            next="Advance the season and this fills in."
          />
        ) : (
          <>
            {rows.map((p, i) => {
              const c = state.world.clubs.find((x) => x.id === p.cid);
              return (
                <DataRow
                  key={p.id}
                  lead={i + 1}
                  mine={p.cid === club.id}
                  name={`${p.fn} ${p.ln}`}
                  meta={`${c?.abbr ?? "—"} · ${p.pos} · ${p.age}`}
                  value={cat.fmt(p)}
                  sub={cat.sub(p)}
                />
              );
            })}
            {gated && (
              <p className="px-[var(--sp-3)] pt-[var(--sp-2)] text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
                Qualified at {Math.ceil(bar)} {cat.role === "B" ? "PA" : "IP"} (MLB rule 9.22) · {unqualified} short of it.
              </p>
            )}
          </>
        )}
      </Panel>
    </div>
  );
}
