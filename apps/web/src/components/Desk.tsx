/**
 * The owner's desk — what's waiting for you, on the Office page's "Needs
 * you" panel (`DECISIONS.md` D100). That panel has been honestly empty
 * since the page was lit; this is the system it was waiting for.
 *
 * Two kinds of thing appear here, and the difference is the whole mechanic:
 *
 * - **Questions**, which are waiting on an answer. Every one shows what
 *   happens if you never answer, BEFORE you ignore it — so silence is an
 *   informed choice rather than a gamble. Under Approve your staff also
 *   name their pick; under Hands-on they deliberately don't, because you
 *   said you'd decide.
 * - **Notices**, which are things already done. They are the record, not a
 *   request, and they're marked read when you look at them.
 *
 * Nothing here can block the simulation: an unanswered question is resolved
 * by its own stated fallback at the moment it would matter. That is a
 * property of the engine (`delegation.ts`), not something this component
 * has to be careful about.
 */
import { money, type DeskAsk, type LogEntry } from "@bushleague/sim-kit";
import { useGameStore } from "../store/gameStore.js";

const LEVEL_LABEL: Record<string, string> = {
  "hands-on": "You decide",
  approve: "You approve",
  notify: "Told after",
  silent: "Handled",
};

function AskCard({ ask }: { ask: DeskAsk }) {
  const answerAsk = useGameStore((s) => s.answerAsk);

  return (
    <article
      className="border-b px-[var(--sp-3)] py-[var(--sp-3)] last:border-b-0"
      style={{ borderColor: "var(--c-border)" }}
    >
      <div className="flex items-baseline justify-between gap-[var(--sp-2)]">
        <h3 className="text-[var(--fs-base)] font-semibold">{TITLES[ask.tag] ?? ask.tag}</h3>
        <span
          className="shrink-0 text-[var(--fs-micro)]"
          style={{ color: "var(--c-dim2)", textTransform: "var(--shell-label-case)" as never, letterSpacing: "var(--shell-label-track)" }}
        >
          {LEVEL_LABEL[ask.level] ?? ask.level}
        </span>
      </div>

      <p className="mt-[var(--sp-1)] text-[var(--fs-sm)]" style={{ color: "var(--c-dim)" }}>
        {BLURBS[ask.tag]?.(ask) ?? ""}
      </p>

      <div className="mt-[var(--sp-2)] flex flex-col gap-[var(--sp-1)]">
        {ask.options.map((o) => {
          const chosen = ask.chosen === o.id;
          const advised = ask.recommended === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => void answerAsk(ask.id, o.id)}
              aria-pressed={chosen}
              className="flex items-center justify-between border px-[var(--sp-2)] py-[var(--sp-2)] text-left text-[var(--fs-sm)]"
              style={{
                borderColor: chosen ? "var(--c-accent)" : "var(--c-border)",
                background: chosen ? "var(--c-surface2)" : "var(--c-surface)",
                color: chosen ? "var(--c-accent)" : "var(--c-text)",
              }}
            >
              <span>{o.label}</span>
              {advised && !chosen && (
                <span className="shrink-0 text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
                  their pick
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Stated before you ignore it, which is what makes ignoring it safe. */}
      <p className="mt-[var(--sp-2)] text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
        {ask.chosen
          ? "Your answer is recorded. It takes effect the next time this comes up."
          : `If you never answer: ${ask.options.find((o) => o.id === ask.fallback)?.label ?? ask.fallback}.`}
      </p>
    </article>
  );
}

/**
 * Copy lives here, not in the save. The engine stores a machine tag plus
 * numbers (`ask.facts`); the words are rendered fresh every time — so this
 * wording can be rewritten in a later build without thirty seasons of saves
 * carrying the old phrasing.
 */
const TITLES: Record<string, string> = {
  "draft.policy": "How should we draft this year?",
  "scouting.budget": "What are we spending on scouting?",
  "ticketing.price": "What are we charging at the gate?",
};

const BLURBS: Record<string, (a: DeskAsk) => string> = {
  "draft.policy": (a) => {
    const share = a.facts["pitcherShare"];
    return share === undefined
      ? "Your scouting director wants a steer before the board is set."
      : `Pitchers are ${share}% of the organization right now. Your scouting director wants a steer before the board is set.`;
  },
  "scouting.budget": (a) => {
    const current = a.facts["current"];
    return current === undefined
      ? "What you spend here sets how well you know your own players."
      : `You're at ${money(current)} a year. What you spend here sets how well you actually know your own players — spend nothing and the grades you see are guesses.`;
  },
  "ticketing.price": (a) => {
    const current = a.facts["current"];
    // The point of this one is that the obvious move is the wrong move, so
    // the blurb says WHY rather than just quoting the number.
    return current === undefined
      ? "A cheaper seat is a fuller park, and a full park spends money on everything else."
      : `You're at $${current} a seat. Remember that nearly half of what a fan is worth to us isn't the ticket — it's the beer, the parking and the cap. A fuller park at a lower price has beaten a thinner one at a higher price more often than not.`;
  },
};

function NoticeLine({ entry }: { entry: LogEntry }) {
  return (
    <li className="border-b px-[var(--sp-3)] py-[var(--sp-2)] text-[var(--fs-sm)] last:border-b-0" style={{ borderColor: "var(--c-border)" }}>
      {entry.c}
    </li>
  );
}

export default function Desk() {
  const state = useGameStore((s) => s.state);
  const acknowledge = useGameStore((s) => s.acknowledge);
  if (!state) return null;

  const asks = state.asks;
  const notices = state.log.filter((l) => l.sf === 1).slice(-6).reverse();

  if (asks.length === 0 && notices.length === 0) {
    return (
      <p className="px-[var(--sp-3)] py-[var(--sp-2)] text-[var(--fs-sm)]" style={{ color: "var(--c-dim)" }}>
        Nothing waiting on you. Your people are handling it — it&rsquo;s all in the log if you want to look.
      </p>
    );
  }

  return (
    <div>
      {asks.map((a) => (
        <AskCard key={a.id} ask={a} />
      ))}

      {notices.length > 0 && (
        <>
          <div className="flex items-center justify-between px-[var(--sp-3)] pt-[var(--sp-2)]">
            <span
              className="text-[var(--fs-micro)]"
              style={{ color: "var(--c-dim2)", textTransform: "var(--shell-label-case)" as never, letterSpacing: "var(--shell-label-track)" }}
            >
              Already handled
            </span>
            <button
              type="button"
              onClick={() => void acknowledge()}
              className="text-[var(--fs-micro)] underline"
              style={{ color: "var(--c-dim)", background: "transparent" }}
            >
              Mark read
            </button>
          </div>
          <ul>
            {notices.map((n, i) => (
              <NoticeLine key={`${n.d}:${n.t}:${i}`} entry={n} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
