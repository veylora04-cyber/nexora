# DESIGN_PROGRESS

**Phase 01 · design foundation** — iteration log and verification record.

---

## Iterations

### 1 · Brand and tokens
Palette built around a turquoise authority colour and cool graphite neutrals, with saffron reserved
as a signal. 182 tokens across colour, type, space, shape, structure and motion. Light and dark
defined as two value blocks behind `[data-theme]`.

**Rejected during this iteration:** a cream/serif "editorial AI" palette, a purple gradient identity,
glass panels, and a single universal radius.

### 2 · Typography
Instrument Sans + Vazirmatn, both OFL, subset to `woff2` (148 KB). Persian rules implemented as
token overrides: tracking forced to `0`, body `+1` step, leading `1.7`. Numbers and dates delegated
to `Intl` so no screen contains a literal Persian digit.

**Fixed:** fonts initially 404'd because `tokens.css` referenced `../fonts/` while the files live
beside it. Corrected to `fonts/…` and verified with `document.fonts.check()`.

### 3 · Core components
Buttons, fields, selection controls, panels, tables, navigation, feedback, overlays — each with six
interaction states. Icons drawn as a single inline sprite (~70 symbols, 24px grid, 1.5px stroke) with
automatic mirroring for directional glyphs.

**Fixed:** `.bars__fill`, `.meter` and `.meter__fill` collapsed to 0×0 because they were inline
spans; `display: block` added. List rows were 71px tall from inherited line-height; explicit leading
added.

### 4 · App shell
Rail (268px, three labelled groups), topbar (60px, sticky, blurred), scope switcher, notification
drawer, command palette, prototype bar.

### 5 · Screens
Auth (7 states), onboarding (choice + Smart Start + Free Start), dashboard, AI (conversation +
models/connection), workspace (members, roles, invite, settings), overview, component reference.

**Fixed:** the auth brand panel composed badly (empty middle, legend colliding with the diagram);
restructured to a top-aligned flow with an HTML legend and the diagram pushed off-canvas.

### 6 · Responsive, RTL/LTR, themes
Verified at 360 / 390 / 768 / 1024 / 1440 in both directions and both themes.

**Fixed:**
- Horizontal overflow on 4 pages, traced to (a) CSS-only tooltips positioned past the viewport edge
  and (b) the off-canvas mobile rail. Tooltips are now logically centred with a `max-width`, disabled
  below 900px, and the shell clips its own overflow on small screens.
- Wide tables widened the page instead of scrolling inside their panel. Added `.table-scroll` with
  `min-width: 0` and a containing block.
- The mobile topbar was overcrowded: theme and language now live in the account menu below 640px,
  and search collapses to an icon.
- The closed mobile rail was still keyboard-focusable. It is now `visibility: hidden` +
  `pointer-events: none` until opened.
- `screens/shell.html` was missing its `layouts.css` link — the dashboard had been rendering without
  its layout layer.
- One panel used `stack-3` without the base `stack` class, so its 12px rhythm never applied.

### 7 · Quality review
Contrast audit, accessible-name audit, focus-ring audit, overflow audit, i18n key audit, page-error
capture, and a visual pass over all 7 pages in 3 viewports.

**Fixed:** `--nx-text-3` failed AA on captions and table meta (3.4–3.8:1). Darkened to `#5d6d66` in
light and lightened to `#859890` in dark; `--nx-signal` darkened to `#96590c` for badge text on
`--nx-signal-soft`. The hero meta line and the hero's ghost button were below AA on the ink
background and were corrected. Three demo inputs on the reference page had no accessible name; added.

---

## Verification record

All checks run against `python3 -m http.server 8080` with the browser cache disabled.

| Check | Method | Result |
|---|---|---|
| i18n coverage | Every `data-t*` attribute resolved against the dictionary, both languages | **0 missing, 0 partial, 0 raw-key leaks** across 7 pages (659 translated bindings) |
| Page errors | `pageerror` listener during full render | **0** |
| Horizontal overflow | `documentElement.scrollWidth` vs viewport, 2 languages × 5 widths × 7 pages | **0 overflows** (70 combinations) |
| Contrast | Computed foreground vs resolved background, per visible text node, WCAG AA | **Pass** on all 7 pages × 2 themes |
| Accessible names | Every `a[href]`, `button`, `input`, `select`, `textarea`, `[tabindex]` | **0 unnamed** |
| Focus visibility | Real keyboard tabbing through the reference page | **Every stop has a visible ring** (only `body` wrap-around does not) |
| Mobile rail focus | 24 × `Tab` at 390px | **0 stops inside the closed rail** |
| Fonts | `document.fonts.check()` for both families | **true / true** |
| Tables | Wide tables at 390px | Scroll inside `.table-scroll`; page width unchanged |

---

## Current visual state

| Screen | Light | Dark | 390px | RTL | LTR |
|---|---|---|---|---|---|
| Overview | ✅ | ✅ | ✅ | ✅ | ✅ |
| Authentication | ✅ | ✅ | ✅ | ✅ | ✅ |
| Onboarding | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| AI workspace | ✅ | ✅ | ✅ | ✅ | ✅ |
| Workspace | ✅ | ✅ | ✅ | ✅ | ✅ |
| Component reference | ✅ | ✅ | ✅ | — (LTR-locked by design) | ✅ |

---

## Remaining known imperfections

1. The dashboard's AI composer is ~107px tall; at 2-row content it grows without a scroll cap.
2. The AI thread's context inspector is hidden below 1240px with no alternative entry point yet
   (it should become a drawer).
3. The onboarding "Free Start" card is intentionally sparse; the balance is achieved with muted
   bullets rather than content.
4. Session list on the AI screen is hidden below 900px with no replacement navigation.
