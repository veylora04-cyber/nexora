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
| Design tokens | ✅ Complete | 182 tokens, light + dark, 2 locales |
| Typography | ✅ Complete | Instrument Sans + Vazirmatn, self-hosted, OFL |
| Component library | ✅ Complete | 40+ components, all states, live reference page |
| App shell | ✅ Complete | Rail, topbar, scope switcher, drawer, palette |
| Screens | ✅ Complete | 7 pages / 40+ inspectable states |
| RTL / LTR | ✅ Complete | Logical properties throughout, verified both ways |
| Responsive | ✅ Complete | 390 / 768 / 834 / 1024 / 1440 verified, 0 overflow |
| Accessibility | ✅ Passed | Contrast AA, names, focus, targets, reduced motion |
| Design decisions | ✅ Reviewed | 10 proposals → 6 approved, 4 modified, 0 rejected (`docs/design/decision-review.md`) |
| Phase 02 architecture | ✅ Proposal | `docs/architecture/phase-02-architecture.md` — 21 sections, 23 decisions |
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
| 4 | Missing AI failure states | Five rendered states — rate limit, timeout, partial failure, provider disconnected, no sessions — switched by a sticky state strip inside the thread. |
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

## What exists on disk

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
docs/architecture/          phase-02-architecture
PROJECT_STATUS.md  DECISIONS.md  DESIGN_PROGRESS.md  NEXT_STEPS.md  README.md
NEXORA_Master_Product_Technical_Specification (1).md
```

36 tracked files. No build step, no package manager, no external network request at runtime.

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
