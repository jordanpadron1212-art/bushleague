# DESIGN SYSTEM — "The War Room"

**Signed off 2026-09-05.** This is the visual direction for Bush League, replacing the
original token set. `design/war-room.html` in this folder is the reference render — open it
in a browser. This file is the buildable spec: what actually goes into `apps/web/src/styles/
tokens.css` and the components.

Every future screen and feature is built in this scheme. When something here and the
reference render disagree, the reference render wins — it is the thing that was approved.

---

## 1. The rules, before the values

These are the load-bearing decisions. Values can be re-tuned; these should not be broken
without a new DECISIONS entry.

1. **Two brand colors, and they are customizable.** Everything colored derives from two hue
   angles — `--accent-h` and `--live-h`. Nothing else in the palette carries brand.
2. **Accent touches data and action only — never chrome.** Nav, labels, dividers and static
   text stay neutral. Restraint is what reads as expensive; scattering accent across chrome
   reads cheap. This is the single most important rule here.
3. **`--live` is rationed.** Second accent, reserved for genuinely live or urgent state: a
   game in progress, a clock running out. If it appears anywhere else it stops meaning
   anything.
4. **Positive/negative are direction, never brand, never customizable.** Green means a number
   went up. They are a separate channel from accent and they are fixed hues, deliberately —
   an owner must never have to wonder whether green means "good" or "brand".
5. **Depth comes from elevation tint and hairlines, not shadows.** Surfaces step up; borders
   are low-contrast on purpose. A hairline, not a cage.
6. **Density is the product.** Phone-first at 360px, 328px of content budget, three numeric
   columns is the practical ceiling. Airiness is not an improvement.
7. **Glow is a budget.** One ambient background wash, one live-state treatment. Not per-card.

---

## 2. Color

Hue-driven. Only the hue angle varies; lightness and chroma are held at values that stay
in-gamut and legible across the entire hue circle, so any accent the owner picks works
without per-hue correction.

```css
:root{
  /* neutrals — fixed */
  --bg:#08090b;
  --surface-1:#0e1013;
  --surface-2:#15181c;
  --surface-3:#1d2126;
  --border:#262a30;
  --border-soft:#1a1d22;
  --text:#edeef1;
  --text-dim:#9aa0aa;
  --text-dim2:#6b7178;

  /* the two dials */
  --accent-h:174; --accent-s:70%; --accent-l:58%; --accent-l2:46%;
  --live-h:262;   --live-s:68%;   --live-l:73%;   --live-l2:56%;

  --accent:      hsl(var(--accent-h) var(--accent-s) var(--accent-l));
  --accent-dim2: hsl(var(--accent-h) var(--accent-s) var(--accent-l2));
  --accent-soft: hsl(var(--accent-h) var(--accent-s) var(--accent-l) / .13);
  --accent-mid:  hsl(var(--accent-h) var(--accent-s) var(--accent-l) / .35);
  --accent-glow: hsl(var(--accent-h) var(--accent-s) var(--accent-l) / .38);

  --live:      hsl(var(--live-h) var(--live-s) var(--live-l));
  --live-dim2: hsl(var(--live-h) var(--live-s) var(--live-l2));
  --live-soft: hsl(var(--live-h) var(--live-s) var(--live-l) / .14);
  --live-mid:  hsl(var(--live-h) var(--live-s) var(--live-l) / .4);
  --live-glow: hsl(var(--live-h) var(--live-s) var(--live-l) / .5);

  /* direction — fixed, never themed */
  --pos:#3ecf7a;
  --neg:#ff6b6b;

  --r:3px;
}

/* Progressive enhancement: where oklch() parses, the same two dials drive a
   perceptually-even sweep — a picked red reads as vivid as a picked cyan.
   Falls straight back to the HSL block above. */
@supports (color: oklch(70% .1 174)){
  :root{
    --accent:      oklch(75% .13 var(--accent-h));
    --accent-dim2: oklch(58% .13 var(--accent-h));
    --accent-soft: oklch(75% .13 var(--accent-h) / .13);
    --accent-mid:  oklch(75% .13 var(--accent-h) / .35);
    --accent-glow: oklch(75% .13 var(--accent-h) / .38);
    --live:      oklch(78% .12 var(--live-h));
    --live-dim2: oklch(62% .12 var(--live-h));
    --live-soft: oklch(78% .12 var(--live-h) / .14);
    --live-mid:  oklch(78% .12 var(--live-h) / .4);
    --live-glow: oklch(78% .12 var(--live-h) / .5);
  }
}

/* Registering the seed hues makes a theme change glide instead of snap —
   one registration animates the entire palette, because every token above
   is just that hue through a color function. */
@property --accent-h{syntax:'<number>';inherits:true;initial-value:174;}
@property --live-h{syntax:'<number>';inherits:true;initial-value:262;}
@property --angle{syntax:'<angle>';inherits:false;initial-value:0deg;}
:root{transition:--accent-h .5s ease, --live-h .5s ease;}
```

**Light theme** is still required (D18's rule stands: every semantic value solved against all
four surfaces, worst-case ratio recorded, ≥4.5:1 for text). The reference render commits to
dark because dark is the flagship; the app keeps both.

---

## 3. Type

Three faces, three jobs. Never mix the jobs.

| Role | Face | Used for |
|---|---|---|
| Display | **Space Grotesk** 500/600/700 | the one headline figure a screen wants you to see first |
| UI | **Inter** 400/500/600 | chrome, labels, prose — everything you read |
| Data | **JetBrains Mono** 400/500/700 | every number in a column — everything you compare |

```css
--font-display:'Space Grotesk',ui-sans-serif,system-ui,sans-serif;
--font-ui:'Inter',ui-sans-serif,system-ui,sans-serif;
--font-data:'JetBrains Mono',ui-monospace,'SFMono-Regular',monospace;
```

**Non-negotiable:** `font-variant-numeric: tabular-nums lining-nums` on every number,
everywhere. A column of stats must never jitter. Also set globally:
`-webkit-font-smoothing:antialiased`, `text-rendering:optimizeLegibility`,
`text-wrap:pretty` on prose, `text-wrap:balance` on headings.

---

## 4. Motion

The asymmetry is the point and it is nearly free: **hover-in is instant, hover-out eases.**
Transitioning both directions at 200ms is what makes most interfaces feel a beat behind the
cursor.

```css
--in:0s;          /* hover/press IN */
--out:.15s;       /* hover/press OUT */
--quick:.1s;
--regular:.25s;
--ease-out-expo:cubic-bezier(.16,1,.3,1);   /* entrances, panels */
--ease-out-quart:cubic-bezier(.25,1,.5,1);  /* general UI */
--spring:linear(0,.006,.025 2.8%,.101 6.1%,.539 18.9%,.721 25.3%,.849 31.5%,.937 38.1%,.968 41.8%,.991 45.7%,1.006 50.1%,1.017 63.9%,1.001);
```

Applied as: base rule carries `transition-duration:var(--out)`, and `:hover` overrides it to
`var(--in)`.

Stagger is 26ms per item, capped so item 20 doesn't wait half a second. Prefer CSS-native
`sibling-index()` over per-element inline delays where supported.

**Every motion effect is gated.** `prefers-reduced-motion` disables tilt, spotlight,
parallax, aurora drift, count-ups and reveals — in the JS as well as the CSS, not just one of
them.

---

## 5. Components proven in the reference render

Reusable, and each already solved once — port rather than reinvent.

- **Stat tile** — micro label (uppercase, tracked, dim) / big mono value / dim context line.
- **Data row** — leading ordinal, name + meta stack, right-aligned figure + sub-figure, 2px
  accent left-edge with glow for "yours". Hover lifts the surface one step.
- **Split-flap digits** — the signature motif. A one-time cascading flip on load for the one
  number that matters (a record, a live score). Font inherits from context.
- **Waterfall chart** — for anything with a running balance. Totals anchored to the baseline
  in neutral; increases and decreases in direction colors; dashed connectors carrying the
  balance across. Never the brand accent.
- **Ranked bars** — single hue, linear scale, value printed on every row so a small bar is
  still precise.
- **Radial gauge** — 389.6 circumference ring, drawn in over 1.2s with the number counting
  alongside it, plus a slow conic sweep behind.
- **Live treatment** — rotating conic-gradient border driven by `@property --angle`, violet
  glow, pulsing dot, signal waveform. Reserved for genuinely live state.
- **Drag-to-compare** — `role="slider"`, `setPointerCapture`, `touch-action:none` on the
  handle, keyboard operable via arrows/Home/End.
- **Theme panel** — two hue sliders with spectrum tracks, preset swatches, persistence to
  localStorage, palette encoded in the URL hash.
- **Ambient layer** — one aurora conic wash built from the two theme hues, drifting on
  transform only, plus film grain at 3.5% with `mix-blend-mode:plus-lighter` (overlay and
  soft-light mathematically collapse on a near-black ground — do not use them).

---

## 6. Accessibility — part of the design, not a later pass

- **Double-ring focus.** A single ring cannot clear 3:1 against both a near-black page and a
  lit card. Bright inner ring, dark outer ring, ~9:1 apart:
  `outline:2px solid #f2f4f6; outline-offset:2px; box-shadow:0 0 0 6px rgba(4,5,7,.92);`
- **Single-key shortcuts must be disableable** — WCAG 2.1.4, Level A. Ship the toggle, and
  mirror at least one path with a modifier (`⌘/`).
- **Never let a screen reader walk a per-second timer.** `aria-hidden` the visible ticker;
  announce on coarse boundaries only. Same for decorative SVG that restates a visible number.
- **`forced-colors`** must demolish the decoration — grain, aurora, conic borders — and fall
  back to system colors. A heavily themed page is exactly the case that breaks High Contrast.
- **`prefers-reduced-transparency`** drops backdrop blur to a solid surface.

---

## 7. Applying this to the app — DONE, v2.21.0 (`DECISIONS.md` D104)

Applied. `apps/web/src/styles/tokens.css` carries the two-dial palette, `styles/fonts.css` the
three faces, and `styles/index.css` the global type, motion and focus rules. Components that
already read role tokens needed no edits, which is what the palette → role → shell → component
structure was for.

### Five deviations from the reference render, every one forced by D18

The render is a dark-only artefact and was never contrast-solved for the app's four surfaces, two
themes, and a **user-customizable accent that must hold across the whole hue circle**. Solving it
produced five changes, all measured:

| # | what | render | shipped | why |
|---|---|---|---|---|
| 1 | `--text-dim2` | `#6b7178` | `#878d94` | render measures **3.28** on surface-3 |
| 2 | HSL fallback accent lightness | 58% | 72% | render bottoms out at **2.54** on blue (H=240) |
| 3 | HSL fallback live lightness | 73% | 72% | unified with the accent |
| 4 | `--pos`/`--neg` in light | "fixed, never themed" | themed | `#3ecf7a` measures **1.56** on white |
| 5 | light accent/live lightness | unspecified | oklch 45% / hsl 22% | §2 leaves light to the app |

Deviation 1 also fixed a **pre-existing** violation: the app's previous `--c-dim2` measured
**2.65**, and the token file's compliance header had simply never listed that token.

Deviation 4 contradicts §1's rule 4 ("positive/negative are direction, never brand, never
customizable"). That rule was written for a dark render; D18 outranks it on a light ground. The
*hues* are preserved, so green still reads as green.

### It is now enforced, not asserted

`apps/web/e2e/visual.spec.ts` measures contrast **in a real browser**, by painting each token to a
1×1 canvas and sampling the pixel — the accent is an `oklch()` expression only a browser resolves,
and Chromium returns it as `oklch(...)` rather than `rgb(...)`, which a naive string parse gets
catastrophically wrong. Every text token is checked against all four surfaces in both themes, and
the accent and live hues are swept the whole circle in 15° steps. Verified to fail on a
regression, not merely to pass today.

### Not done, and deliberately

Only the token, type, motion and focus layers plus the two headline figures are in. The signature
COMPONENTS of §5 — split-flap digits, the waterfall, the radial gauge, the live conic border,
drag-to-compare, the aurora and grain — are not ported. They belong to screens that mostly do not
exist yet (Standings, Schedule, Leaders, Gate), and porting a gauge before there is a number worth
gauging would be decoration. The tokens they need are all present.
