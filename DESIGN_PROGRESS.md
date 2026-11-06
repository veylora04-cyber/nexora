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
to `Intl`, so no value is digit-converted by hand.

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

### 8 · Phase 01 closure — the seven known gaps

Closed one at a time, without touching the token layer or the component vocabulary. Every addition
reuses an existing primitive.

**AI context inspector below 1240px → drawer.** Added `#ctx-drawer` with the same content: scope rows,
attached files, usage meter, rule callout. The generic opener (`data-drawer-open="<id>"`) was written
so any trigger can open any drawer.

**AI session list below 900px → drawer.** `#sessions-drawer` with search, today/week grouping and a
"new conversation" footer. The model chip hides below 900px — the thread header cannot hold both the
sessions trigger and the model chip at that width, and the trigger wins because it is navigation.

**Composer cap.** `max-height: 168px` with internal scrolling.

**Five AI failure states.** Rate limit, timeout, partial failure, provider disconnected, and no
sessions, switched by a sticky strip inside the thread. A generic mechanism (`data-demo-variant`) was
added rather than five bespoke toggles: it hides the sibling whose `data-variant` does not match and
hides any element carrying `data-hide-in` for that state, so the session list and the context column
empty themselves without duplicating markup.

**Empty states.** Dashboard with zero tasks, workspace with zero members, AI with zero sessions —
each with a real next action, not a shrug.

**Smart Start steps 2–4.** Three new full views: invite (email, default role segmented control, invite
link policy, guest approval), AI setup (Central vs Personal comparison, model, monthly cap, retention,
fail-closed), review (three editable rows, three consents, "after creation" summary, callout). The
step marker derives `data-state` from the active view, so the marker can never disagree with the
content.

**Notification drawer.** Grouped Today / Earlier, per-row `data-unread`, unread count, mark-all-as-read
with a confirming toast.

**Fixed during this iteration:**
- The context drawer rendered empty: its content wrapper reused `ai__col--ctx`, which is
  `display: none` below 1240px. Replaced with a plain flex column.
- An open drawer sat *under* the prototype bar. `z-index: calc(var(--nx-z-toast) + 1)` when
  `data-open="true"`.
- Focus did not move into an opened drawer: `focus()` ran in the same frame, while the drawer was
  still `visibility: hidden`. Deferred by one frame; verified landing on the close button at 390px and
  1200px.
- The onboarding rewrite leaked `onb.role.member/admin/guest`. Added; re-audited clean.
- Hardcoded Persian numerals in the step marker and the member count replaced with `data-num`.
- Page content sat under the prototype bar. Bottom padding added to `.content`; verified
  `switchBottom 796 < devTop 843`.

### 9 · Decision review and Phase 02 architecture

Ten proposals reviewed against the master specification (`docs/design/decision-review.md`): the review
**recommends** 6 approve, 4 modify, 0 reject. A recommendation is not an approval — all ten remain
`PROPOSED` until the user signs off. The four open UX questions were answered rather than deferred.

**Corrected in the prototype as a result:** the role matrix now matches §17.3 cell for cell — Member ×
invite changed from a grant to `No*`, and §17.3's two footnotes are rendered, because they are where
the *conditions* live.

**Written as a proposal, not built:** the approvals queue, the estimated-cost qualifier for Personal
AI, the two-level scope switcher, and onboarding draft persistence. Each changes an approved surface,
so each waits for sign-off.

`docs/architecture/phase-02-architecture.md` covers the seventeen required areas as twenty-nine
numbered decisions, each tagged spec-stated, decided, or parameter-still-open.

### 10 · Refinement — hierarchy, the approval card, and mobile AI

The prototype was correct and complete but read as a system rather than a product. This pass changed
hierarchy and left the vocabulary alone: same tokens, same primitives, same visual language.

1. **Dashboard became a command centre.** A context strip states scope, policy, member count and
   provider before any card. One primary column, "Needs you", leads with the approval that is waiting;
   everything else that used to compete with it moved to a secondary column carrying live AI activity
   and usage against the hard limit. The old grid gave nine cards equal weight, which is a way of
   saying none of them matters.
2. **The tool call became an approval card.** It states the tool, the destination, what changes, the
   risk level, whether the change can be reversed, and when the approval expires — then the argument
   hash and the exact arguments behind a disclosure, then approve/decline, then the note that binds
   the decision to this user, this workspace and this agent version. Six facts, because the six are
   what a non-technical approver actually needs to decide.
3. **Nine AI states instead of five.** Quota exhausted, tool execution failed and context overflow
   were missing; each has a recovery that is unlike the others, and a generic "provider problem" card
   would send the user to the wrong place. `error-taxonomy.md` §3 maps all eight codes to surfaces.
4. **Onboarding became progressive.** A progress bar and a step counter that are derived from the view,
   so they cannot disagree with the screen. Cap, retention and fail-closed collapsed behind a
   disclosure that states their defaults in its own summary — the defaults are the recommendation, and
   hiding them without saying so would be a dark pattern.
5. **The permission matrix got a legend.** Six kinds of cell, one colour, no explanation; the legend
   names all six, and the cells keep their own variants.
6. **Mobile AI was fixed.** At 390px the five header triggers left the thread title about 30px, so it
   wrapped one character per line, and the composer's send button was clipped out of its own bar.
   Below 720px the title takes its own row; below 480px the token counter drops out of the bar.
7. **Design-system debt.** The auth brand column and the overview hero are dark in both themes and
   carried eight repeated hex literals between them. They now use four `--nx-inverse-*` tokens; the
   saffron button's ink uses `--nx-on-signal`. No hex literal remains outside `tokens.css`.


---

## Verification record

All checks run against `python3 -m http.server 8080` with the browser cache disabled.

| Check | Method | Result |
|---|---|---|
| i18n coverage | Every `data-t*` attribute resolved against the dictionary, both languages | **0 missing, 0 partial, 0 raw-key leaks** across 7 pages × 4 language/theme combinations |
| Page errors | `pageerror` and `console.error` listeners during full render | **0** |
| Horizontal overflow | `documentElement.scrollWidth` vs viewport, plus every element's box against the viewport, 4 language/theme combinations × 7 widths × 7 pages | **0 overflowing documents, 0 offending elements** (196 page loads) |
| Contrast | Computed foreground vs resolved background, per visible text node, WCAG AA | **Pass** on all 7 pages × 2 themes, plus all nine AI states in both themes |
| Accessible names | Every `a[href]`, `button`, `input`, `select`, `textarea`, `[tabindex]` | **0 unnamed** |
| Focus visibility | Real keyboard tabbing through the reference page | **Every stop has a visible ring** (only `body` wrap-around does not) |
| Mobile rail focus | 24 × `Tab` at 390px | **0 stops inside the closed rail** |
| Drawer focus | Open each drawer, read `document.activeElement` | Lands on the close button at 390px and 1200px |
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

The four gaps listed here at Phase 01 delivery are closed (§8 above). What remains:

1. **Four review recommendations are designed but not built** — the approvals queue, the estimated-cost
   qualifier for Personal AI, the two-level scope switcher, and onboarding draft persistence. Each
   changes an approved surface, so each waits for sign-off rather than shipping inside a closure phase.
2. **The dashboard widget grid is deferred, not rejected** (§14.5 requires it). Phase 01's layout is
   grid-ready; the grid itself is Phase 02.
3. **The prototype carries its own annotation layer.** Three `Proposal` badges mark unapproved design
   decisions. They are review scaffolding and must be deleted, not restyled, at hand-off — otherwise
   saffron would mean both "unapproved design" and "the AI is waiting for you".
4. **The role matrix scrolls horizontally at 390px.** The Billing Manager and Security Auditor columns
   are off-screen until scrolled. Correct for a seven-column comparison table, but comparing a Member's
   access against a Billing Manager's takes a scroll on the narrowest screens.
5. **The Free Start card is intentionally sparse.** The balance is achieved with muted bullets rather
   than content, which reads as unfinished to some reviewers. It is deliberate: the card's job is to be
   clearly *less* than Smart Start without being a warning.

