# NEXORA — Brand direction

**Status:** proposal for approval · Phase 01
**Scope:** visual identity, palette, typography, motion, voice
**Files:** `design-preview/assets/tokens.css`, `design-preview/assets/base.css`

---

## 1. The problem the identity has to solve

NEXORA is one product with three levels of authority — personal, team, organisation — and an AI
layer that can act on the user's behalf. Two risks dominate the visual language:

1. **Authority blur.** If the personal workspace and the organisation workspace look identical,
   users cannot tell what they are acting on. The identity has to make *scope* legible before
   anything else.
2. **AI theatre.** The default 2024–25 AI aesthetic — glow, gradient mesh, purple, glass — signals
   capability the product does not have, and ages badly. NEXORA's AI is *bounded*: it proposes, it
   waits for approval, it is auditable. The visual language should feel like an instrument, not a
   demo.

The direction below is built to answer both: a calm, precise, slightly technical surface, with
exactly one colour that is allowed to mean "something is happening".

---

## 2. Direction

> **Precise, quiet, instrument-like.** A cool graphite workspace with a single turquoise authority
> colour and a saffron signal reserved for AI, live activity and things awaiting a human decision.

Three adjectives, in priority order:

| | What it means in practice |
|---|---|
| **Precise** | 1px hairlines, 8px baseline rhythm, numbers in tabular figures, no decorative rounding. Structure is visible but never loud. |
| **Quiet** | Surfaces differ by 2–4% luminance, not by shadow. Depth comes from borders and spacing, not from glow. One accent per viewport. |
| **Instrument-like** | Small labels, exact values, dense but breathable data. The UI should look like it is measuring something real. |

### What we deliberately avoided

These are the tells of generic AI-product design, and each one is a conscious rejection:

| Rejected | Why |
|---|---|
| Cream + serif + clay "editorial AI" palette | Reads as a landing page, not a workspace. Also the single most saturated look in the category. |
| Purple/violet gradient identity | Every AI product of 2024–25. Zero ownability. |
| Glassmorphism, blur panels, glow rings | Reduces text contrast, costs GPU, and implies depth that does not exist in the information architecture. |
| Neon accent on pure black | High drama, poor legibility at 12–13px, which is where most of this product lives. |
| One radius for everything | Makes cards, inputs and pills indistinguishable; kills hierarchy. |
| ALL-CAPS tracked eyebrows above every heading | Decoration standing in for structure. |
| Identical 3-up card grids on every page | The "SaaS kit" look; every screen starts to read the same. |
| Middle-dot meta strings (`Design · System · v1`) | Noise in Persian, where the separator fights the RTL flow. |

---

## 3. The mark

`NX.mark(size)` draws a **scope ring with an aperture gap and a centre node**: an incomplete circle
(a boundary that is deliberately open) around a solid point (the work itself).

- It is one stroke at 1.5px on a 24px grid, so it inherits the icon system's weight exactly.
- It scales from 16px (favicon, rail) to 96px (hero) without redrawing.
- It encodes the product's core idea — *a boundary around a centre* — which is also the mental model
  of Personal / Team / Organization.

The wordmark is set in Instrument Sans Medium, `+0.02em` tracking, uppercase. Persian contexts use
the Latin wordmark unchanged; transliteration is **not** proposed.

---

## 4. Colour

### 4.1 Roles, not shades

Every colour in the system has a *job*. Adding a new hue requires removing one.

| Role | Token | Light | Dark | Used for |
|---|---|---|---|---|
| Canvas | `--nx-bg` | `#f3f5f4` | `#070b0a` | Page background |
| Surface | `--nx-surface` | `#ffffff` | `#0d1311` | Panels, cards, rails |
| Raised | `--nx-surface-2` | `#f7f9f8` | `#111917` | Panel feet, inset rows |
| Sunken | `--nx-surface-3` | `#eef2f0` | `#16201d` | Tracks, skeletons |
| Authority | `--nx-primary` | `#0b6b62` | `#3fc2b0` | Primary action, selection, current scope |
| Signal | `--nx-signal-fill` | `#e9a13b` | `#f0b45c` | **AI activity, live state, pending approval — nothing else** |
| Success | `--nx-success` | `#1c7a4d` | `#55c48c` | Connected, healthy, completed |
| Warning | `--nx-warning` | `#8a5a00` | `#e6b25a` | Quota pressure, degraded |
| Error | `--nx-error` | `#ab2a20` | `#f26a5e` | Failed, destructive, invalid |
| Text 1/2/3 | `--nx-text-1..3` | `#0c1512` / `#4d5e58` / `#5d6d66` | `#e9f0ed` / `#a0b2ab` / `#859890` | Body / secondary / tertiary |

### 4.2 The signal rule

Saffron is the only colour with a semantic contract:

> **Saffron appears only where the system is doing something, has done something, or is waiting for a
> human.** It is never used for decoration, never for a "premium" accent, never for hover.

That constraint is what lets a single amber badge ("Pending approval") stop a user mid-scroll. If
saffron were also the marketing accent, it would mean nothing.

### 4.3 Neutrals are cool, not warm

All greys carry a slight green-cyan bias (`#0c1512`, `#1e2a26`, `#f3f5f4`). This is what makes the
turquoise sit *native* in the surface rather than pasted on top — the two families share a hue
family. Warm greys (the default in most design systems) would make the accent look applied.

### 4.4 Contrast is a token-level guarantee

Every text/surface pair was measured, not eyeballed. `--nx-text-3` was darkened from `#78877f` to
`#5d6d66` in light and lightened from `#73857e` to `#859890` in dark specifically because tertiary
text (captions, timestamps, table meta) was landing at 3.4–3.8:1 against AA's 4.5:1. The audit now
passes on all 7 pages in both themes (see `DESIGN_PROGRESS.md`).

---

## 5. Typography

### 5.1 Two families, one voice

| Script | Family | Why |
|---|---|---|
| Latin | **Instrument Sans** (variable, 400–700) | A grotesque with slightly condensed proportions and an engineered feel. Holds up at 11px in tables, has enough character at 44px for display. |
| Arabic/Persian | **Vazirmatn** (variable) | Designed for Persian (not Arabic-with-Persian-bolts), correct Persian numerals, open apertures at small sizes, extensive weight range. |

Both are **SIL Open Font License 1.1** and are self-hosted as `woff2` subsets
(`instrument-sans-latin.woff2` 30 KB, `vazirmatn-arabic.woff2` 79 KB, `vazirmatn-latin.woff2` 35 KB,
148 KB total). No CDN, no third-party request, no layout shift.

Instrument Sans has no Arabic coverage, so the stack is:

```css
--nx-font-sans: "Instrument Sans", "Vazirmatn", system-ui, sans-serif;
```

Vazirmatn carries Latin glyphs too, so mixed Persian/English strings stay internally consistent
instead of switching typeface mid-sentence.

### 5.2 Persian is not "English, translated"

Three rules are enforced in CSS, not left to the author:

| Rule | English | Persian | Why |
|---|---|---|---|
| Letter-spacing | −0.01em to −0.03em at display sizes | **forced to 0** | Tracking breaks Arabic joining; it is the single most common RTL bug. |
| Body size | 15px | **+1 step (≈15.5px)** | Persian glyphs have a smaller x-height ratio; equal px reads smaller. |
| Leading | 1.55 | **1.7** | Taller ascenders/descenders and the need for diacritic clearance. |

Numbers and dates are never hardcoded:

- `Intl.NumberFormat('fa-IR')` → `۱۲٬۴۸۰` (Eastern Arabic numerals, Persian thousands separator `٬`)
- `Intl.DateTimeFormat('fa-IR', { calendar: 'persian' })` → `۱۶ آبان ۱۴۰۵`

This means a number written as `data-num="12480"` renders correctly in both languages, and no screen
contains a literal Persian digit.

### 5.3 Scale

`11 · 12 · 13 · 14 · 15 · 17 · 20 · 24 · 32 · 44` (px). Ten steps, no in-between values. Display and
heading sizes tighten tracking; label and caption sizes never go below 11px.

---

## 6. Space, shape, motion

**Spacing** — 4px base: `4 8 12 16 20 24 32 40 48 64 80 96`. Every gap in the prototype is a token;
there are no arbitrary pixel values.

**Radius** — deliberately unequal, because equal radii flatten hierarchy:

| Token | Value | Used for |
|---|---|---|
| `--nx-radius-xs` | 4px | Checkboxes, tags, kbd |
| `--nx-radius-sm` | 6px | Buttons, inputs, menu items |
| `--nx-radius-md` | 8px | Nested panels, callouts |
| `--nx-radius-lg` | 12px | Panels, cards, modals |
| `--nx-radius-pill` | 999px | Badges, chips, meters, avatars |

**Elevation** — three levels only (`sm`, `md`, `lg`), each a low-opacity, wide, cool shadow. On dark
surfaces shadows are nearly invisible by design; there, borders carry the structure instead.

**Motion** — `120ms` (micro), `180ms` (base), `260ms` (overlay). One easing curve
(`cubic-bezier(0.2, 0.7, 0.2, 1)`) plus a linear one for spinners. Motion is used for three things
only: state change, spatial continuity (drawer/modal), and the single entrance reveal on page load.
Everything collapses to 0ms under `prefers-reduced-motion: reduce`.

---

## 7. Iconography

~70 symbols, hand-drawn on a 24px grid, 1.5px stroke, round caps and joins, `currentColor`. They are
delivered as a single inline sprite (`NX.icon(name)` → `<use href="#i-name">`), so there is no icon
font, no network request, and no mismatch between icon sets.

Two exceptions are filled rather than stroked — GitHub and Microsoft — because their brand marks are
solid shapes; drawing them as outlines makes them unrecognisable.

Directional icons (chevrons, arrows, send, logout) carry `.icon-dir` and **mirror automatically** in
RTL. Non-directional icons never mirror.

---

## 8. Voice

- **Sentence case** everywhere. No Title Case, no ALL CAPS.
- Labels name the object ("Members", "Usage"), never the mechanism ("Member management module").
- The product states its own constraints plainly: *"Nothing runs without your approval."*,
  *"No outbound request is sent until you approve."*, *"None of these are activated before you
  confirm."* These are design elements, not legal copy — they are set at body size, in the flow,
  not buried in a footnote.
- Errors say what happened and what to do next. They never apologise and never blame.
- Persian copy is written natively (not translated from English), uses `نیم‌فاصله` correctly
  (`می‌شود`, `داده‌ها`), and avoids Arabic loanwords where a common Persian word exists.

---

## 9. What this direction rules out

If a future proposal contains any of the following, it contradicts this document and needs an
explicit decision to change it:

1. A second accent colour.
2. Saffron used for anything other than AI / live / attention.
3. Gradients on surfaces (the hero diagram is the only gradient-adjacent element, and it is line art).
4. Letter-spacing on Persian text.
5. More than three elevation levels.
6. A component with a radius not in the table above.
7. Persian numerals typed as literals in markup.
