/**
 * The delegation dial — how much of the club you run personally, per area
 * (`DECISIONS.md` D96, D100). The most important settings screen in the
 * game: it is where a save decides what kind of game it is.
 *
 * Two rules shape it, both about honesty:
 *
 * 1. **An area with nothing behind it says so.** Three of the eleven areas
 *    are live today. Rendering eleven identical working dials would let a
 *    player set ticket pricing to Hands-on, wait, and be asked nothing
 *    forever — which teaches them the whole mechanic is decorative. The
 *    same convention `registry.tsx` already applies to dark pages.
 * 2. **Staff hiring is shown, and is not a control.** Leaving it off the
 *    screen would hide the rule; showing it as a dial you cannot move
 *    states it. It is not even representable in the settings type, so
 *    there is no dial here to disable.
 */
import {
  DELEGATION_LEVELS,
  DOMAINS,
  PRESETS,
  delegationFor,
  type DelegableDomain,
  type DelegationLevel,
  type PresetId,
} from "@bushleague/sim-kit";
import { useGameStore } from "../store/gameStore.js";

const LEVEL_LABEL: Record<DelegationLevel, string> = {
  "hands-on": "Hands-on",
  approve: "Approve",
  notify: "Notify",
  silent: "Silent",
};

const LEVEL_BLURB: Record<DelegationLevel, string> = {
  "hands-on": "Nothing happens without your say-so.",
  approve: "Staff propose; you approve or decline.",
  notify: "Staff act, then tell you what they did.",
  silent: "Staff act. It's in the log if you go looking.",
};

export default function DelegationPage() {
  const state = useGameStore((s) => s.state);
  const setDelegation = useGameStore((s) => s.setDelegation);

  if (!state) return null;

  const applyPreset = (id: PresetId) => {
    const settings = PRESETS[id].settings;
    for (const [domain, level] of Object.entries(settings)) {
      void setDelegation(domain as DelegableDomain, level);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <header className="border-b px-[var(--sp-3)] py-[var(--sp-3)]" style={{ borderColor: "var(--c-border)" }}>
        <h1 className="text-[var(--fs-md)] font-semibold">How much do you run yourself?</h1>
        <p className="mt-[var(--sp-1)] text-[var(--fs-sm)]" style={{ color: "var(--c-dim)" }}>
          You own the club. You don&rsquo;t have to operate it. Set each area to whatever you actually
          want to be involved in — and change your mind any time.
        </p>
      </header>

      <section className="border-b px-[var(--sp-3)] py-[var(--sp-3)]" style={{ borderColor: "var(--c-border)" }}>
        <h2
          className="mb-[var(--sp-2)] text-[var(--fs-micro)]"
          style={{ color: "var(--c-dim2)", textTransform: "var(--shell-label-case)" as never, letterSpacing: "var(--shell-label-track)" }}
        >
          Start from
        </h2>
        <div className="flex flex-wrap gap-[var(--sp-2)]">
          {(Object.keys(PRESETS) as PresetId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => applyPreset(id)}
              className="flex-1 border px-[var(--sp-2)] py-[var(--sp-2)] text-left"
              style={{ borderColor: "var(--c-border)", background: "var(--c-surface)", minWidth: "150px" }}
            >
              <span className="block text-[var(--fs-sm)] font-semibold">{PRESETS[id].label}</span>
              <span className="mt-[var(--sp-1)] block text-[var(--fs-micro)]" style={{ color: "var(--c-dim)" }}>
                {PRESETS[id].note}
              </span>
            </button>
          ))}
        </div>
      </section>

      {(["owner", "baseball"] as const).map((group) => (
        <section key={group} className="border-b" style={{ borderColor: "var(--c-border)" }}>
          <h2
            className="px-[var(--sp-3)] py-[var(--sp-2)] text-[var(--fs-micro)]"
            style={{ color: "var(--c-dim2)", textTransform: "var(--shell-label-case)" as never, letterSpacing: "var(--shell-label-track)" }}
          >
            {group === "owner" ? "Yours by nature" : "Baseball operations"}
          </h2>

          {DOMAINS.filter((d) => d.group === group).map((d) => {
            const fixed = d.id === "staff";
            const level = delegationFor(state.delegation, d.id);
            return (
              <div key={d.id} className="border-t px-[var(--sp-3)] py-[var(--sp-2)]" style={{ borderColor: "var(--c-border)" }}>
                <div className="flex items-baseline justify-between gap-[var(--sp-2)]">
                  <h3 className="text-[var(--fs-base)]">{d.label}</h3>
                  {/*
                    Two different things, and the first draft of this screen
                    labelled them the same way: staff hiring is not "waiting
                    on a system", it is permanently yours. Reading a
                    screenshot caught it.
                  */}
                  {fixed ? (
                    <span className="shrink-0 text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
                      always yours
                    </span>
                  ) : !d.live ? (
                    <span className="shrink-0 text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
                      not yet active
                    </span>
                  ) : null}
                </div>
                <p className="mt-[var(--sp-1)] text-[var(--fs-micro)]" style={{ color: "var(--c-dim)" }}>
                  {d.note}
                </p>

                <div className="mt-[var(--sp-2)] flex flex-wrap gap-[var(--sp-1)]">
                  {DELEGATION_LEVELS.map((l) => {
                    const on = level === l;
                    return (
                      <button
                        key={l}
                        type="button"
                        disabled={fixed}
                        aria-pressed={on}
                        title={LEVEL_BLURB[l]}
                        onClick={() => void setDelegation(d.id as DelegableDomain, l)}
                        className="border px-[var(--sp-2)] py-[var(--sp-1)] text-[var(--fs-micro)] disabled:cursor-not-allowed"
                        style={{
                          borderColor: on ? "var(--c-accent)" : "var(--c-border)",
                          background: on ? "var(--c-surface2)" : "transparent",
                          color: fixed ? "var(--c-dim2)" : on ? "var(--c-accent)" : "var(--c-dim)",
                          opacity: !d.live && !on ? 0.55 : 1,
                        }}
                      >
                        {LEVEL_LABEL[l]}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      ))}

      <p className="px-[var(--sp-3)] py-[var(--sp-3)] text-[var(--fs-micro)]" style={{ color: "var(--c-dim2)" }}>
        Everything staff do is written down whatever you set here — Silent costs you the notice, never
        the record.
      </p>
    </div>
  );
}
