# PROJECT_STATUS

**Project:** NEXORA — modular, multi-level AI work platform
**Phase:** 01 (design foundation) — closed · Phase 02 (architecture) — proposal ready
**Branch:** `phase-01-closure-phase-02-architecture`
**Repository:** `https://github.com/veylora04-cyber/nexora` (private)
**Base:** `main` @ `056d0a8c98f22f7e74b2203345939ea989f2eb0c`
**Last updated:** Phase 01 closure

---

## Where the project stands

| Area | State | Notes |
|---|---|---|
| Brand direction | ✅ Complete | `docs/design/brand-direction.md` |
| Design tokens | ✅ Complete | 122 named tokens, 188 declarations (light, dark, locale and direction overrides) |
| Typography | ✅ Complete | Instrument Sans + Vazirmatn, self-hosted, OFL |
| Component library | ✅ Complete | 40+ components, all states, live reference page |
| App shell | ✅ Complete | Rail, topbar, scope switcher, drawer, palette |
| Screens | ✅ Complete | 7 pages / 35+ inspectable states |
| RTL / LTR | ✅ Complete | Logical properties throughout, verified both ways |
| Responsive | ✅ Complete | 390 / 768 / 834 / 1024 / 1440 verified, 0 overflow |
| Accessibility | ✅ Passed | Contrast AA, names, focus, targets, reduced motion |
| Design decisions | ✅ Reviewed, none approved | 10 proposals: review recommends 6 approve, 4 modify, 0 reject. All 10 remain `PROPOSED` (`docs/design/decision-review.md`) |
| Phase 02 architecture | ✅ Proposal | `docs/architecture/phase-02-architecture.md` — 24 sections, 29 decisions, 12 diagrams |
| Security traceability | ✅ Proposal | `docs/architecture/security-traceability.md` — 18 domains with control, phase, test, scope |
| Error taxonomy | ✅ Proposal | `docs/architecture/error-taxonomy.md` — 8 classes mapped to UI surfaces |
| Application code | ⛔ Not started | Deliberately blocked until design + architecture are approved |
| Backend / auth / AI providers | ⛔ Not started | Same |

---

## What changed in this phase

### Phase 01 closure — the seven known gaps are closed

| # | Gap | Resolution |
|---|---|---|
| 1 | AI context inspector vanished below 1240px | Becomes a slide-over drawer (`#ctx-drawer`) triggered from the thread header. Focus lands on the close button; Esc and scrim both dismiss. |
| 2 | AI session list vanished below 900px | Becomes a drawer (`#sessions-drawer`) with search, today/week grouping and a "new conversation" footer. The model chip hides below 900px because the thread header has no room for both. |
| 3 | Composer grew without limit | `max-height: 168px` with internal scrolling. |
| 4 | Missing AI failure states | Nine rendered states — rate limit, timeout, partial failure, invalid credential, quota exhausted, tool execution failed, context overflow, empty, normal — switched by a state strip inside the thread. |
| 5 | Missing empty states | Dashboard with zero tasks, workspace with zero members, AI with zero sessions. |
| 6 | Smart Start steps 2–4 undesigned | All four steps now full, inspectable screens: invite (email, default role, link policy, guest approval), AI setup (Central vs Personal, model, cap, retention, fail-closed), review (editable summary, three consents, what happens after creation). |
| 7 | Notification drawer had no rules | Grouped by Today / Earlier, per-row read/unread state, unread count, mark-all-as-read. |

Nothing was redesigned to achieve this. The token layer, component vocabulary, shell structure and
visual language are unchanged; the additions use existing primitives (`.state-card`, `.empty`,
`.list__row`, `.drawer`) and existing tokens.

### Phase 02 architecture

`docs/architecture/phase-02-architecture.md` covers the seventeen areas the brief requires, as
twenty-three numbered decisions (`D-ARCH-01`…`D-ARCH-23`). Each records the recommended approach, the
reasoning, the alternatives, and the security, scalability and complexity implications. Every claim is
tagged **[S]** spec-stated, **[D]** decided here, or **[P]** parameter still to be set — so a reader can
see which parts are requirements and which are proposals.

Two sections exist because the brief asked for them explicitly: §20 lists what the architecture
**deliberately does not decide** (and why deciding it now would be guessing), and §21 gives a build
order with the dependency reasoning.

### Decision review

All ten proposals in `docs/design/design-decisions.md` were reviewed against the master specification.
The result is in `docs/design/decision-review.md`; the short version:

- **D-04 was wrong and is now corrected.** It claimed the dashboard widget grid was rejected. §14.5
  requires it. It is a **deferred requirement** for Phase 02, not a rejected one, and the Phase 01
  layout must be built grid-ready.
- **D-07 was never a proposal.** §18.1 states fail-closed as the default. Moved to bucket A (A-09).
- **D-06 misstated its own provenance.** The six roles are named in §17.2, not invented here. One cell
  over-granted relative to §17.3 and was corrected.
- **D-08 and D-09 needed conditions** — estimated cost for Personal AI, and a durable approvals queue
  with the §18.4 binding facts.
- The four open UX questions in `ux-architecture.md` §10 are answered.

---

## Phase 01 refinement — the premium UI/UX pass

The prototype was correct and complete but read as a competent system rather than a product. This
pass changed hierarchy, not vocabulary: the token layer, the component set and the visual language are
the same, and every addition is built from existing primitives.

| Screen | Before | After |
|---|---|---|
| Dashboard | A wall of equal-weight cards; the one thing that needed a decision sat among eight that did not | A command centre with a context strip (scope, policy, members, provider), one primary column led by the approval that is waiting, and a secondary column carrying live AI activity and usage against the hard limit |
| AI workspace | A tool call rendered as a one-line chip with an Approve button | An approval card that states the tool, the destination, what changes, the risk level, whether it can be undone and when it expires — then the argument hash and the exact arguments behind a disclosure, then approve/decline, then the binding note |
| AI failure states | Five | Nine, covering all eight codes in `error-taxonomy.md` plus normal and empty |
| Onboarding | A configuration form, four steps deep, all fields visible at once | A progress bar and a step counter that cannot disagree with the screen, with cap, retention and fail-closed collapsed behind a disclosure that states their defaults |
| Permission matrix | Six kinds of cell, one colour, no explanation | A legend naming all six kinds, and the cells keep their own variants |
| Mobile AI | Thread title wrapped one character per line; the composer's send button was clipped out of its own bar | Title gets its own row below 720px, triggers share the next; the token counter drops below 480px so both actions keep their place |

Design-system debt cleared in the same pass: the auth brand column and the overview hero were dark in
both themes and carried eight repeated hex literals between them, so a brand change would have missed
half of them. They now use four `--nx-inverse-*` tokens, and the saffron button's ink uses
`--nx-on-signal`. **No hex literal remains outside `tokens.css`.**

### Evidence

Every claim above was measured in a browser, not read from source.

| Check | Method | Result |
|---|---|---|
| Overflow | 7 pages × 4 language/theme combinations × 7 widths (360–1920), comparing `scrollWidth` to `clientWidth` and testing every element's box against the viewport | 0 overflowing documents, 0 offending elements |
| i18n | Every `data-t`/`data-t-ph`/`data-t-aria`/`data-t-tip` key resolved against the dictionary, plus a check for keys rendered as their own name | 0 missing, 0 partial, 0 raw-key leaks |
| Console | `pageerror` and `console.error` captured on every load above | 0 errors |
| Contrast | Computed foreground against nearest opaque ancestor background, both themes | Passes AA on all 7 pages, and on all 9 AI states at 1440 and 390 in both themes (72 checks) |
| Accessibility | Accessible names, focus visibility, tab order, and that the closed mobile rail cannot receive focus | 0 unnamed controls, 0 missing focus rings, 0 focus leaks |
| Layout defects | Element geometry for the AI thread, approval card and composer at 390/768/1440 | Approval card holds six facts at 318px wide with no clipping; composer bottom meets the prototype bar exactly |

---

```
design-preview/             static, dependency-free prototype
  index.html                overview + decision status
  screens/                  auth · onboarding · shell · ai · workspace
  components/               design-system reference (English, LTR-locked)
  assets/                   tokens · base · components · layouts CSS
                            app.js · chrome.js · i18n.js · icons.js
                            lang/*.js (7 files) · fonts/*.woff2 (3 files)
docs/design/                brand-direction · design-system · ux-architecture
                            design-decisions · decision-review
docs/architecture/          phase-02-architecture · security-traceability
                            error-taxonomy
docs/evidence/              before/after pairs and AI state captures (13 PNGs)
PROJECT_STATUS.md  DECISIONS.md  DESIGN_PROGRESS.md  NEXT_STEPS.md  README.md
ACCEPTANCE_REPORT.md
NEXORA_Master_Product_Technical_Specification (1).md
```

54 tracked files — 41 source and document files plus 13 evidence captures. No build step, no package
manager, no external network request at runtime.

---

## How to run it

```bash
python3 -m http.server 8080 --directory design-preview
# open http://localhost:8080
```

It must be served over HTTP, not opened as `file://` — it loads ES modules, the icon sprite and
self-hosted fonts.

---

## Known limitations

1. **No real product behaviour.** Every action is a local interaction, a toast, or a labelled demo.
   Persistence is `localStorage` for theme and language only.
2. **The prototype's own annotation layer.** Three `Proposal` badges exist to mark unapproved design
   decisions. They are review scaffolding and must be **deleted, not restyled**, at hand-off —
   otherwise saffron would mean both "unapproved design" and "the AI is waiting for you", and only the
   second meaning has to survive.
3. **Sample content.** Names, emails, usage figures and dates are fictional and marked as such on the
   overview page.
4. **The specification contradicts itself in one place.** §3.3 records the widget dashboard as an
   unapproved proposal; §14.5 requires it. Design proceeds on §14.5, which is the normative experience
   section. The contradiction is logged for the product owner in `decision-review.md` §4.
5. **Six questions still need product or legal answers** — providers/regions, pricing unit, retention
   default, free tier, SSO/SCIM scope, and whether the customisable sidebar is wanted at all. See
   `design-decisions.md` §C.
6. **The approval queue, estimated-cost display, two-level scope switcher and onboarding draft
   persistence are designed but not built.** They are recommendations of the review that change
   approved surfaces, so they wait for sign-off rather than shipping inside a closure phase.
