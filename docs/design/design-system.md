# NEXORA — Design system

**Status:** implemented and inspectable · Phase 01
**Live reference:** `design-preview/components/components.html` (English-only, LTR-locked)
**Source:** `tokens.css` → `base.css` → `components.css` → `layouts.css`

---

## 1. Layer model

Four layers, one direction of dependency. A layer may only consume the layer beneath it.

```
tokens.css      182 custom properties — the only place a raw value lives
   ↓
base.css        reset, focus, type utilities, layout utilities, app frame
   ↓
components.css  the component grammar (buttons, fields, panels, overlays …)
   ↓
layouts.css     screen composition only (auth, onboarding, AI, workspace, docs)
```

No screen file contains a colour, radius, shadow or spacing value. If a screen needs a new value,
the value belongs in `tokens.css` and the pattern in `components.css`. This is what makes the theme
switch and the RTL switch free: nothing is hardcoded to flip.

---

## 2. Tokens

182 tokens across nine groups. Naming is semantic (`--nx-primary`, not `--nx-teal`), so a theme can
change the value without renaming anything.

| Group | Examples | Count |
|---|---|---|
| Colour — surfaces | `--nx-bg`, `--nx-surface`, `--nx-surface-2/3`, `--nx-elevated` | 12 |
| Colour — text | `--nx-text-1/2/3`, `--nx-text-inverse` | 4 |
| Colour — brand | `--nx-primary`, `-hover`, `-active`, `-soft`, `-border`, `--nx-on-primary` | 10 |
| Colour — signal / semantic | `--nx-signal*`, `--nx-success*`, `--nx-warning*`, `--nx-error*`, `--nx-info*` | 18 |
| Colour — borders | `--nx-border`, `-strong`, `-faint`, `--nx-hairline` | 4 |
| Type | 10 sizes, 4 weights, 4 leading, 4 tracking, 2 families | 24 |
| Space | `--nx-space-1 … 12` (4 → 96px) | 12 |
| Shape | 5 radii, 3 shadows, 2 border widths | 10 |
| Structure & motion | rail width, topbar height, content max, 3 durations, 2 easings, 6 z-layers | 18 |

### Theming

`[data-theme="dark"]` and `[data-theme="light"]` on `<html>` swap the value block. Nothing else
changes — no component knows which theme is active. `applyTheme()` also dispatches `nx:theme` so the
design-system page's live swatches repaint from `getComputedStyle`.

### Direction

`[dir="rtl"]` and `[lang="fa"]` adjust three things only: tracking → 0, body size +1 step, leading →
1.7. Everything else is direction-agnostic because **the entire codebase uses logical properties**:

```css
padding-inline: …;   inset-inline-start: …;   border-inline-end: …;   margin-block-start: …;
```

There is no `left`/`right` in any layout rule. RTL is therefore not a "mode" — it is the same layout
with the writing direction changed, which is why it cannot drift out of sync.

---

## 3. Component inventory

Every component below exists in `components.css`, is rendered on the reference page with all states,
and is used in at least one screen.

### 3.1 Actions

| Component | Variants | States |
|---|---|---|
| `.btn` | `--primary`, `--secondary`, `--ghost`, `--quiet`, `--danger`, `--signal` | default, hover, active, focus-visible, `[disabled]`, `[data-loading="true"]` (inline spinner, label preserved) |
| `.btn--sm / --lg` | size modifiers | — |
| `.icon-btn` | default, `--sm`, bordered | as above + `[aria-pressed="true"]` |
| `.chip` | default, `--action` | `[aria-pressed="true"]` |

Rules: one primary button per view. `--signal` is for AI-triggering actions only. Destructive actions
are `--danger` and never sit next to a primary without a gap.

### 3.2 Form controls

| Component | Notes |
|---|---|
| `.field` + `.field__label` | Label always visible; placeholder is never the label |
| `.input`, `.textarea`, `.select` | `.select` draws its own chevron in CSS (no native arrow), RTL-aware |
| `.input-wrap` | Leading icon / trailing slot (password reveal, unit) |
| `.field--error` / `.field--success` | Border + icon + message; colour is never the only signal |
| `.field__hint` / `.field__msg` | Helper text vs validation text, different tones |
| `.check` (checkbox, radio) | `appearance: none`, 18px, drawn check via inline SVG data-URI |
| `.switch` | 34×20, knob translates logically (RTL-correct) |
| `.segmented` | 2–4 exclusive options, used for workspace type and AI mode |
| `.otp` | 6 single-character inputs: digits only, auto-advance, backspace to previous, arrow keys, paste distributes |

All inputs are 36–40px tall (≥44px on touch via padding), and every control has a visible focus ring
(`0 0 0 2px` at 55% primary).

### 3.3 Surfaces

| Component | When to use |
|---|---|
| `.panel` | A bounded object with a head/body/foot — the default container |
| `.flat` | A group inside a panel, no border, no shadow |
| `.float` | A transient surface (menus, popovers) with elevation |
| `.callout` | Inline message; `--signal`, `--error`, `--success` tones |
| `.table-scroll` | Wrapper for any table that can exceed its column |

Panels are separated by a 1px `--nx-border` on `--nx-surface`. **Cards are not the default** — most
dashboard content is a panel with a labelled head, and several blocks are plain lists with hairlines.

### 3.4 Navigation

| Component | Notes |
|---|---|
| `.rail` + `.nav-item` | 268px, three labelled groups, `[aria-current="page"]` gets an inline-start marker and a soft fill |
| `.nav-group__label` | 4px node + rule — the "lattice" that makes grouping legible without boxes |
| `.topbar` | Sticky, blurred backdrop, 60px |
| `.scope` | Workspace switcher: level badge + name + chevron |
| `.searchbar` | Opens the command palette; shows the `Ctrl K` hint |
| `.tabs` / `.tab` | Underline indicator, `role="tablist"` |
| `.menu` | Popover menu with `menu__label`, `menu__item`, `menu__sep` |

### 3.5 Data display

| Component | Notes |
|---|---|
| `.table` | Header in `--nx-text-3`, 12px; rows 48–56px; hover tint |
| `.matrix` | Capability × role grid for permissions; `.yes` / `.partial` / `.no` |
| `.meter` | 6px track, `--warn` / `--err` / `--signal` fills |
| `.bars` | Horizontal bar rows: label · track · value, RTL-anchored |
| `.spark` | 24px inline trend line |
| `.badge` | `--primary`, `--ok`, `--warn`, `--err`, `--signal`, `--plain` |
| `.dot` | `--live` (pulsing), `--signal`, `--idle` |
| `.avatar` | Initials, `--sm`, stacked group |

### 3.6 Feedback

| Component | Notes |
|---|---|
| `.toast` | Bottom-end, auto-dismiss, `role="status"` |
| `.empty` | Icon + one sentence + one action. Never a shrug emoji |
| `.skeleton` | Shimmer only under `prefers-reduced-motion: no-preference` |
| `.spinner` | 14px inline, 20px standalone |
| `.scrim` | Overlay behind drawer/modal/palette, click to close |

### 3.7 Overlays

| Component | Behaviour |
|---|---|
| `.modal` | Centre on desktop, bottom sheet ≤640px, `Esc` closes, focus trapped |
| `.drawer` | Inline-end side sheet (notifications), 380px, full-width ≤640px |
| `.palette` | Command palette, `Ctrl/⌘+K`, arrow-key navigation, `Enter` to run |
| `[data-tip]` | CSS-only tooltip, `:hover` + `:focus-visible`, logical centring, disabled below 900px |

---

## 4. Interaction states

Every interactive component defines six states. This is the checklist used on the reference page:

1. **Default**
2. **Hover** — surface or border change, never a layout shift
3. **Active/pressed** — 1px inset or 4% darker
4. **Focus-visible** — 2px ring at 55% primary, never removed
5. **Disabled** — 45% opacity, `cursor: not-allowed`, removed from tab order
6. **Loading** — spinner replaces the label's leading icon; the label stays, the width does not jump

Plus two component-specific states: `[aria-pressed]` for toggles and `[aria-current]` for navigation.

---

## 5. Accessibility contract

| Requirement | Implementation |
|---|---|
| Contrast | All body text ≥ 4.5:1, all large text and UI borders ≥ 3:1. Verified per page, per theme. |
| Focus | One visible ring style, never `outline: none` without replacement. Skip link is the first tab stop. |
| Names | Every interactive element has an accessible name (text, `aria-label`, or `data-t-aria`). Audited: 0 unnamed controls. |
| Targets | 36px minimum on desktop, 44px on touch. |
| Motion | `prefers-reduced-motion` collapses all transitions to 0ms and stops the live-dot pulse. |
| Colour independence | Status is always icon + text + colour, never colour alone. |
| Direction | Logical properties throughout; directional icons mirror; numbers/date via `Intl`. |
| Hidden content | The off-canvas rail is `visibility: hidden` + `pointer-events: none` when closed, so it cannot receive focus or scroll on mobile. |

---

## 6. How to add a component

1. Does an existing component already cover it with a variant? If yes, add the variant.
2. If not, add the structural CSS to `components.css` using **only** tokens.
3. Add every state to `components/components.html` under the right section.
4. Check it in: light, dark, LTR, RTL, 390px, and with keyboard focus.
5. If it needed a new value, that value goes into `tokens.css` first.
