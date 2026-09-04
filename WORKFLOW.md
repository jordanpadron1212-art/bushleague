# HOW A SESSION RUNS — Bush League

Replaces the "How every session runs" and "END EVERY PASS / CLOSE" sections of
the project instructions. Written 2026-08-28 because passes were taking a whole
night and producing 25KB of prose. **Minimum ceremony, same integrity.**

> **2026-09-04 (DECISIONS.md D78):** the `qa/*.js` commands below describe the
> retired single-HTML-file build. There is no `qa/doctor.js`-equivalent yet in
> the new stack — CI runs typecheck, `vitest`, and a Playwright visual check
> (see `.github/workflows/ci-deploy.yml`), and that is the whole gate until a
> session writes the rest. Say so rather than pretend the old commands still
> work.

## The one rule that did not change

Nothing ships that has not passed the full gate, and every number still carries
a tier. Speed comes from cutting waiting and writing, never from cutting checks.

## Open (30 seconds, not 10 minutes)

1. `pnpm install && pnpm run typecheck && pnpm run test` — proves the repo on
   disk actually builds and its tests actually pass before you trust anything
   in it (the new-stack replacement for "the build in the folder is the build
   you think it is").
2. Read `HANDOFF.md`. Nothing else. `DECISIONS.md` is searched, never read whole.

## Build

**Fan out.** Research, harness authoring, doc writing and independent code areas
run as parallel subagents, not one after another. One agent per independent
question, all launched in the same message. Sequential subagents are the single
biggest waste in a session.

**One probe, not five round trips.** When something fails, `node qa/doctor.js`
first — it answers every standing question at once (which clubs are illegal,
whether they are *stuck* or repairable, pool by age bracket, ask vs pay, the
save round trip, books, NaN, console). If it does not answer the question, add
the question to `doctor.js` rather than writing another throwaway script.

**Fast gate while iterating. Full gate once, at the end.** Not three times.

**Measure once.** A materiality run is one run at pass close, and only when the
pass claims to change an outcome. No re-measuring because a confound got
interesting — note it and move on.

**Seed everything.** An unseeded harness cannot be debugged. `qa/sweep1.js` ran
unseeded for six builds and its box-score check was failing in ~40% of runs for
a reason nobody could reproduce.

## Close (five minutes, not ninety)

- **`DECISIONS.md`: one line per decision.** `D67 · what changed — why, in one
  sentence. Measured: <number>.` No essays. The code comments carry the
  reasoning; that is what they are for and they are read more often.
- **`HANDOFF.md`: patch it, never rewrite it** for an incremental pass. A pass
  that changes the engineering substrate (like this one) is the documented
  exception — a full rewrite, same as the original project instructions'
  close ritual specified, because patching would leave stale file paths and
  commands throughout. Say explicitly when a rewrite happens and why.
- **`CHANGELOG.md`: one new entry per pass, newest first**, versioned against
  `package.json` and a git tag — there is no more `BUILD` const to copy.
- **`RESEARCH.md`: only new figures**, with source, date and tier. A figure that
  could not be found is still a finding and still gets a line.
- **No per-pass build notes.** The chat reply is the build note: what shipped,
  what was measured with the numbers, what is still broken. Short.
- **`ROADMAP.md`: only when reality diverged from it.**

## Commands

```
pnpm install                          # workspace deps, all packages
pnpm run typecheck                    # tsc -b, every workspace
pnpm run test                         # vitest, sim-kit + web
pnpm --filter web run test:visual     # Playwright, 360px + 1440px, both shells/themes — CI-only
pnpm run dev                          # vite dev server, apps/web
pnpm run build                        # production build, apps/web/dist
```

Retired (the old single-HTML-file build): `node qa/run-all.js[--fast]`,
`node qa/doctor.js`, `node qa/prof.js`, `node qa/material.js`, `node qa/sweepN.js`,
`python3 compose.py`. None of these exist in the new stack. A future pass that
wants doctor.js's "every diagnostic in one command" property should write its
TypeScript equivalent rather than assume the old one still applies.

## What this cost

Nothing in rigor. The gate is unchanged and still mandatory; tiers, seeds and
paired comparators are unchanged. What was cut is waiting (serial harnesses,
serial subagents, repeated gates) and prose (essay-length decision entries,
rewritten handoffs, per-pass notes).
