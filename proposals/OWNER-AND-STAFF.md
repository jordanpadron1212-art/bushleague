# PROPOSAL — The owner's desk: staff, delegation, and how anything gets decided

**Status: awaiting sign-off.** Written 2026-09-05 from Jordan's own framing, verbatim:

> "I am an owner, I should not be managing players or calling up or sending down players — my GM
> and managers can bring things to my desk if I elect that option and we can discuss and
> recommend moves/trades/signings/releases etc. I want it fully customizable how much I can
> control or have it delegated to staff etc. I plan on this being a deep and highly advanced
> game engine with lots of scenarios and features to be generated through gameplay."

This is the interaction model for the entire game. Every screen and every system answers to it.

---

## 1. The core idea

**You own the organization. You do not operate it.** Staff operate it. What reaches your desk,
and whether you get a say before or after it happens, is a setting *you* control — per area of
the business, not one global difficulty slider.

This replaces the assumption baked into most management sims, and into some of this project's
own planned screens: that the player is the person clicking "promote." They are not. They are
the person who hired the person who clicks it.

The fantasy is **an owner's day**: you arrive, things are waiting for you, you decide what to
engage with, and the rest was handled — well or badly — by people you chose.

---

## 2. The delegation dial

Every decision area has four settings. This is the mechanic.

| Setting | What happens | Who this is for |
|---|---|---|
| **Hands-on** | Nothing happens without your say-so. You are asked first, every time. | The area you care about this save |
| **Approve** | Staff propose with reasoning; you approve or decline. | The default for most areas |
| **Notify** | Staff act, then tell you what they did and why. | Areas you trust your people with |
| **Silent** | Staff act. It's in the log if you go looking. | Areas you genuinely don't want to see |

Set per area, changeable mid-save. A save where everything is Hands-on is a demanding
micro-manager's game; a save where everything is Silent is a pure business-of-baseball game
where you watch results and hire and fire. **Both are legitimate ways to play, and the same
engine serves both.**

### The areas

Owner-native (you'd expect to decide these yourself):

- **Staff hiring and firing** — the one decision that is *always* yours. Never delegable, because
  delegating who you hire is delegating the game itself.
- **Payroll budget** · **ticket pricing** · **facilities and capex** · **scouting budget** ·
  **debt and financing**

Baseball operations (naturally delegated, but you may take the wheel):

- **Player moves** — call-ups, options, releases
- **Signings** — free agents, minor-league deals
- **Trades**
- **Draft** — *already shipped as policy in v2.14.0: you set best-available / fill-needs /
  upside and the org executes it. That is exactly this pattern, built before it was named.*
- **Lineups and rotation** — the clearest case of something an owner should never touch by hand
  (see §5)

---

## 3. Staff are people, not sliders

A delegation setting is only interesting if the person on the other end of it is. Staff need
enough substance that leaving them alone is a real gamble:

- **Competence** — how good their judgment actually is, hidden behind your scouting of them the
  same way player grades are hidden behind scouting (Law 10 already governs this).
- **Philosophy** — what they believe. A GM who values youth will propose different trades than
  one who wants to win now. This is what makes "approve/decline" a real choice rather than
  rubber-stamping.
- **Relationship with you** — override a GM constantly on Hands-on and morale suffers. Trust him
  on Silent and he takes bigger swings.

**A great GM on Silent is the reward for hiring well.** A bad GM on Silent is how you find out
you hired badly — by reading, months later, what he did.

---

## 4. Things arrive at your desk

The engine generates events; the delegation dial decides which of them you see and whether you
get a vote. Jordan's "lots of scenarios and features generated through gameplay" lives here.

Shapes worth building toward:

- **A proposal** — "Sign this free agent, $4.2M / 2yr. Here's why." Approve, decline, or send it
  back with direction.
- **A notification** — "We optioned Castellan to Double-A." Acknowledge, or reverse it if you're
  quick and willing to spend the political capital.
- **A problem** — a stadium lease expiring, an underperforming affiliate, an insurance claim, a
  manager wanting an extension.
- **A judgment call** — something the staff genuinely can't decide for you, escalated regardless
  of your setting.

The **Wire** page in the registry is the natural home for the log; the desk itself belongs on
**Office**.

---

## 5. What this invalidates, immediately

Recording this because it contradicts a planned screen:

- **The Lineup page is wrong as designed.** "Owner sets the batting order" is not this game. It
  becomes a *read-only view of what your manager chose* — with the ability to question it, and
  under Hands-on to override — or it comes off the registry.
- **The Roster page is not a place where you move people.** It's where you see the asset. Moves
  are proposed, approved, or delegated.
- **Owning an organization is about assets and budgets, not rosters.** This settles the open
  question in `WORLD-CONFIGURATION.md` §8: you own the whole org — Yankees plus Scranton plus
  Somerset plus Hudson Valley plus Tampa plus the complex clubs — but you view them as a
  portfolio of assets and cost centres, not as five rosters to hand-edit. The "which club am I
  looking at" concern was overstated: it's a reporting context, not an editing context.

---

## 6. Why this is the right shape for a sandbox

An endless sandbox needs the *reason to keep playing* to renew itself. Fixed goals don't do
that. Staff and delegation do:

- Your org's competence changes as people come and go, so the same club plays differently across
  eras of the same save.
- The delegation dial lets one save be several games — run it Hands-on for three seasons, get
  bored of the detail, promote a GM you trust and switch to Silent, and the game becomes about
  hiring and money instead.
- Scenarios generated by staff and events give the endless middle something to be *about* when
  there is no ladder to climb.

---

## 7. Build order

Nothing here is built. Sequenced so each step is useful alone:

1. **The delegation dial with no staff behind it** — settings exist, and the systems that already
   run automatically (draft philosophy, churn) start reporting through it. Proves the interaction
   model with zero new simulation.
2. **The desk on Office** — proposals and notifications arrive, get approved/declined/acknowledged.
   Still no real staff; the "GM" is the existing automatic logic wearing a name.
3. **Real staff** — competence, philosophy, hiring and firing, and scouting *them*. This is where
   `FRONT-OFFICE-DESIGN-PROPOSAL.md`'s long-open staff question finally gets answered, and it stops
   being deferrable because the delegation dial is meaningless without it.
4. **Scenario generation** — the event engine that keeps an endless save alive.

Step 1 is small and immediately proves or disproves the whole model, which is the right way to
start something this load-bearing.

---

## 8. Open questions

1. **Can you overrule after the fact, and what does it cost?** Reversing your GM's move should be
   possible but not free — morale, or his willingness to bring you good ideas next time.
2. **How much reasoning does a proposal show?** A good GM explains himself well; a bad one says
   "trust me." Tying explanation quality to competence is a nice touch but needs a UI budget.
3. **Does the delegation dial have presets?** "New owner," "hands-off investor," "meddler" as
   starting configurations, rather than making someone set twelve dials before playing.
