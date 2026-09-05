/**
 * The roster — every player in the owner's organization, MLB down to
 * Single-A (`DECISIONS.md` D96, D103).
 *
 * **This screen does not move anybody, and that is the design.** D96 settled
 * the interaction model: you own the organization, you do not operate it.
 * Promoting a player, sending one down and cutting one are a general
 * manager's job, and a Roster page with those buttons on it would be the
 * exact assumption D96 exists to reject. So this is a view of an asset —
 * the same relationship an owner has to a factory floor. The page says so
 * out loud rather than leaving the absence to look unfinished.
 *
 * **Law 10 is visible here for the first time.** Every grade on this page is
 * a SCOUTED estimate — `ovrOf`/`estOf` read a player's own fixed noise, not
 * his true tools — and the confidence bar on each row is `p.rel`, how much
 * the organization actually knows about him. That is what the scouting
 * budget buys (D90), and until now nothing in the app showed it. A young
 * player with a 60 and two bars is a different asset from a veteran with a
 * 60 and five, and the whole point of Law 10 is that the owner can see the
 * difference between them.
 *
 * Density per the instrument-ui doctrine: three numeric columns is the
 * practical ceiling at 360px, so the row carries OVR, POT and salary, with
 * position/age/service in the name stack rather than in columns of their own.
 */
import { useMemo, useState } from "react";
import { money, type Club, type Player } from "@bushleague/sim-kit";
import { useGameStore } from "../store/gameStore.js";
import { orgClubs, ownedClub, rosterOf } from "../store/selectors.js";
import { Confidence } from "../components/ui.js";

type SortKey = "ovr" | "pot" | "age" | "sal";

const LEVEL_LABEL: Record<string, string> = {
  MLB: "Majors",
  AAA: "Triple-A",
  AA: "Double-A",
  HIA: "High-A",
  A: "Single-A",
  INDY: "Club",
};

function PlayerRow({ p }: { p: Player }) {
  const svc = p.svc > 0 ? ` · ${p.svc.toFixed(1)} svc` : "";
  return (
    <li
      className="grid items-baseline border-b px-[var(--sp-3)] py-[var(--sp-2)] last:border-b-0"
      style={{ borderColor: "var(--c-border)", gridTemplateColumns: "1fr auto auto auto", columnGap: "var(--sp-2)" }}
    >
      <span className="min-w-0">
        <span className="block truncate text-[var(--fs-sm)]">{p.nm}</span>
        <span className="block truncate text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
          {p.pos} · {p.age}
          {svc}
        </span>
      </span>

      <span className="num text-right text-[var(--fs-sm)]" style={{ minWidth: "34px" }}>
        {p.ovr}
        <span className="mt-[2px] block">
          <Confidence rel={p.rel} />
        </span>
      </span>

      {/* Ceiling only when there IS one. `refineScout` leaves potential equal
          to the current grade once a player is past 25, so on a veteran-heavy
          roster this column repeated the grade beside it on every row and read
          as broken. A dash says "he is what he is", which is the real answer. */}
      <span
        className="num text-right text-[var(--fs-sm)]"
        style={{ minWidth: "30px", color: p.pot > p.ovr ? "var(--c-pos)" : "var(--c-dim2)" }}
      >
        {p.pot > p.ovr ? p.pot : "—"}
      </span>

      <span className="num text-right text-[var(--fs-sm)]" style={{ minWidth: "56px" }}>
        {p.sal > 0 ? money(p.sal) : "—"}
      </span>
    </li>
  );
}

function ClubSection({ club, players, sort }: { club: Club; players: Player[]; sort: SortKey }) {
  const sorted = useMemo(() => {
    const copy = players.slice();
    copy.sort((a, b) => (sort === "age" ? a.age - b.age : b[sort] - a[sort]));
    return copy;
  }, [players, sort]);

  const payroll = players.reduce((t, p) => t + p.sal, 0);
  const avgAge = players.length ? players.reduce((t, p) => t + p.age, 0) / players.length : 0;

  return (
    <section className="border-b" style={{ borderColor: "var(--c-border)" }}>
      <header
        className="flex items-baseline justify-between px-[var(--sp-3)] py-[var(--sp-2)]"
        style={{ background: "var(--c-surface2)" }}
      >
        <h2 className="text-[var(--fs-sm)] font-semibold">
          {LEVEL_LABEL[club.lvl] ?? club.lvl}
          <span className="ml-[var(--sp-2)] text-[var(--fs-micro)] font-normal" style={{ color: "var(--c-dim)" }}>
            {club.city} {club.name}
          </span>
        </h2>
        <span className="num shrink-0 text-[var(--fs-micro)]" style={{ color: "var(--c-dim)" }}>
          {players.length} · {avgAge.toFixed(1)}y · {money(payroll)}
        </span>
      </header>

      {sorted.length === 0 ? (
        <p className="px-[var(--sp-3)] py-[var(--sp-2)] text-[var(--fs-sm)]" style={{ color: "var(--c-dim)" }}>
          No players assigned here.
        </p>
      ) : (
        <ul>
          {sorted.map((p) => (
            <PlayerRow key={p.id} p={p} />
          ))}
        </ul>
      )}
    </section>
  );
}

const SORTS: { id: SortKey; label: string }[] = [
  { id: "ovr", label: "Grade" },
  { id: "pot", label: "Ceiling" },
  { id: "age", label: "Age" },
  { id: "sal", label: "Salary" },
];

export default function RosterPage() {
  const state = useGameStore((s) => s.state);
  const [sort, setSort] = useState<SortKey>("ovr");

  if (!state) return null;
  const mine = ownedClub(state);
  const clubs = orgClubs(state);
  if (!mine) return null;

  const orgIds = new Set(clubs.map((c) => c.id));
  const all = state.players.filter((p) => p.cid && orgIds.has(p.cid));
  const orgPayroll = all.reduce((t, p) => t + p.sal, 0);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <header className="border-b px-[var(--sp-3)] py-[var(--sp-3)]" style={{ borderColor: "var(--c-border)" }}>
        {/* The stat tile from the design system §5: micro label, big value,
            dim context line. The headline figure gets the display face, and
            its label sits under it rather than beside it — a first draft put
            the count in the corner and left the sentence below starting
            "under contract ·", which read as a fragment. */}
        <div className="flex items-start justify-between gap-[var(--sp-3)]">
          <h1 className="text-[var(--fs-md)] font-semibold">{mine.city} organization</h1>
          <span className="shrink-0 text-right">
            <span className="display block text-[var(--fs-lg)] leading-none">{all.length}</span>
            <span
              className="mt-[var(--sp-1)] block text-[var(--fs-micro)]"
              style={{ color: "var(--c-dim2)", textTransform: "var(--shell-label-case)" as never, letterSpacing: "var(--shell-label-track)" }}
            >
              under contract
            </span>
          </span>
        </div>
        <p className="mt-[var(--sp-2)] text-[var(--fs-micro)]" style={{ color: "var(--c-dim)" }}>
          {money(orgPayroll)} in contracts across {clubs.length}{" "}
          {clubs.length === 1 ? "club" : "clubs"}. Grades are what your scouts report, not what a
          player is — the bars are how sure they are.
        </p>
      </header>

      <div
        className="flex items-center gap-[var(--sp-1)] border-b px-[var(--sp-3)] py-[var(--sp-2)]"
        style={{ borderColor: "var(--c-border)" }}
      >
        <span
          className="mr-[var(--sp-1)] text-[var(--fs-micro)]"
          style={{ color: "var(--c-dim2)", textTransform: "var(--shell-label-case)" as never, letterSpacing: "var(--shell-label-track)" }}
        >
          Sort
        </span>
        {SORTS.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={sort === s.id}
            onClick={() => setSort(s.id)}
            className="border px-[var(--sp-2)] py-[2px] text-[var(--fs-micro)]"
            style={{
              borderColor: sort === s.id ? "var(--c-accent)" : "var(--c-border)",
              color: sort === s.id ? "var(--c-accent)" : "var(--c-dim)",
              background: "transparent",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {clubs.map((c) => (
        <ClubSection key={c.id} club={c} players={rosterOf(state, c.id)} sort={sort} />
      ))}

      {/* The absence of promote/demote/release is deliberate (D96). Saying so
          is the difference between a design decision and a missing feature. */}
      <p className="px-[var(--sp-3)] py-[var(--sp-3)] text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
        You own these contracts; your general manager decides who plays where. Set how much say you want over roster
        moves on the Delegation screen.
      </p>
    </div>
  );
}
