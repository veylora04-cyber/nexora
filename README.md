# NEXORA — Design Foundation

> **فارسی:** این مخزن، خروجی فاز ۰۱ پروژهٔ نکسورا است: هویت بصری، توکن‌های طراحی، کتابخانهٔ کامپوننت و
> شش صفحهٔ محصول به‌صورت یک نمونهٔ HTML/CSS/JS مستقل و قابل بازدید. هیچ کد اپلیکیشن، بک‌اند یا منطق
> احراز هویتی نوشته نشده — این فاز فقط طراحی است. برای دیدن نمونه: بخش [Preview](#preview).

Design-only deliverable for **NEXORA**, a modular multi-level work platform (personal, team,
organisation) with an AI layer. Phase 01 establishes the visual and UX foundation: brand
direction, token layer, component library, application shell, and six product screens — as a
static prototype with no build step and no external runtime dependency.

**No application code was written.** No backend, no auth logic, no real AI provider calls, no
production schema. Every screen is a design artefact intended for review and approval.

---

## Preview

```bash
python3 -m http.server 8080 --directory design-preview
# open http://localhost:8080
```

The floating bar at the bottom of every page switches **light / dark**, **فارسی / EN**, and
jumps between screens. All three axes are live, not screenshots.

| Page | Path |
|---|---|
| Overview | `design-preview/index.html` |
| Authentication — 7 states | `design-preview/screens/auth.html` |
| Onboarding — Smart Start / Free Start | `design-preview/screens/onboarding.html` |
| Dashboard | `design-preview/screens/shell.html` |
| AI workspace — conversation + models & connection | `design-preview/screens/ai.html` |
| Workspace — members, roles, invite, settings | `design-preview/screens/workspace.html` |
| Component reference | `design-preview/components/components.html` |

## Repository layout

```
design-preview/
  assets/
    tokens.css       182 semantic tokens — the single source of truth
    base.css         reset, focus, type scale, app frame
    components.css   40+ components, every interaction state
    layouts.css      screen composition only
    chrome.js        rail / topbar / drawer / palette factories
    app.js           theme, i18n binding, menus, palette, toasts, OTP
    i18n.js          language store + Intl number/date formatting
    icons.js         70 one-stroke symbols as an inline sprite
    lang/            Persian + English strings, one file per screen
    fonts/           Instrument Sans + Vazirmatn, self-hosted woff2
  screens/           six product screens
  components/        live component reference
docs/design/
  brand-direction.md  identity, palette, type, motion, voice
  design-system.md    tokens, components, states, contribution rules
  ux-architecture.md  information architecture, flows, screen specs
  design-decisions.md approved / proposed / unresolved
PROJECT_STATUS.md · DECISIONS.md · DESIGN_PROGRESS.md · NEXT_STEPS.md
```

## Foundations

- **Tokens first.** Colour, type, spacing, radius, elevation, motion and layout are all named
  semantically. Nothing in a screen file hardcodes a hex value.
- **Logical properties only.** Every inset, margin, padding and border uses
  `inline-start` / `block-end` forms. There is no `left` or `right` anywhere in the CSS, so RTL is
  the same layout rather than a parallel one.
- **Persian is the default, not a translation.** `dir="rtl"` and `lang="fa"` on load; letter
  spacing forced to `0`; body size one step larger; leading `1.7`; all numbers and dates through
  `Intl` (`fa-IR`, Persian calendar) so no screen contains a literal Persian digit.
- **Self-hosted type.** Instrument Sans (Latin) and Vazirmatn (Arabic + Latin), both OFL, subset
  to 148 KB total. Zero external requests — the prototype runs offline.
- **Motion with restraint.** Two durations, two easings, entrance only, all suppressed under
  `prefers-reduced-motion`.

## Verification

Measured, not asserted. Scripts ran against the served prototype in Chromium.

| Check | Result |
|---|---|
| Horizontal overflow | 7 pages × 5 widths (360–1440) × 2 languages = 70 combinations, **0 overflow** |
| Contrast | 7 pages × 2 themes, **all pass WCAG AA** |
| Accessible names | **0 missing** on interactive elements |
| Focus rings | Full keyboard traversal, **every stop has a visible ring** |
| Closed mobile drawer | **0 focus landings** (visibility gated, not just translated) |
| i18n bindings | 659 bindings, **0 missing keys, 0 raw-key leaks** |
| Runtime errors | **0** across all pages and viewports |

## Status

Phase 01 is **complete and awaiting approval**. Ten design proposals are marked as needing a
decision and seven items are open — see [`docs/design/design-decisions.md`](docs/design/design-decisions.md).
No application development starts until the design is approved.

## Branch

Work lives on `design/phase-01-foundation`. This repository was created to receive it; there is
no prior history to protect.
