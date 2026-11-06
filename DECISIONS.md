# DECISIONS

A running log. Each entry is dated by phase, not by day, because the work is delivered in stages.

Legend: **[A]** `APPROVED` · **[P]** `PROPOSED` · **[O]** `REQUIRES_USER_DECISION` · **[X]** `REJECTED`

**A review verdict is not an approval.** `docs/design/decision-review.md` recommends approve or modify
for each proposal; the recommendation changes the *recommended* shape of a decision, never its status.
An entry marked **[P]** stays proposed until the product owner says otherwise, however strongly the
review recommends it.

The specification clause grounding each verdict is cited in the review.

---

## Phase 01 · design foundation

**[A] D-001 — Phase 01 is design only.**
No backend, no authentication implementation, no real AI providers, no production schemas. The
deliverable is an inspectable prototype plus a reusable design system.

**[A] D-002 — Persian is the primary locale.**
`fa` is the default language, `rtl` the default direction. English is a first-class second locale,
not an afterthought.

**[A] D-003 — Three workspace levels.**
Personal / Team / Organization, with organisation policy able to constrain teams but never personal
workspaces.

**[A] D-004 — Hybrid onboarding.**
Smart Start (guided, 4 steps) and Free Start (empty, no questions) are both offered as genuine
choices.

**[A] D-005 — AI acts only with human approval.**
Every tool call renders an approval card. Nothing is dispatched before the user confirms.

**[P] D-006 — Reserved signal colour.**
Saffron (`#e9a13b` / `#f0b45c`) is used exclusively for AI activity, live state and pending
approvals. It is never decorative. *Review added a hand-off condition: the prototype's own `Proposal`
badges must be deleted, not restyled, or amber ends up meaning two things.* See §D-01.

**[P] D-007 — Turquoise authority colour with cool neutrals.**
Deliberately outside the purple/blue AI-category palette. *Review added: primary and success share a
hue family, so success can never be colour-only.* See §D-02.

**[P] D-008 — Instrument Sans + Vazirmatn, self-hosted.**
Both OFL, subset to woff2, 148 KB total, no CDN. *Review added two conditions: a reproducible
subsetting script, and OFL notices shipped in the repo and the about screen.* See §D-03.

**[P] D-009 — Dashboard ships as a composed layout; the widget grid is deferred, not rejected.**
The original entry said the grid was rejected. It is not: §14.5 requires add/remove/reorder with
per-user-and-workspace layout and permission-filtered widgets. It is a Phase 02 deliverable, and the
Phase 01 layout must be grid-ready (stable block keys, `(user_id, workspace_id)` as the persistence
key, ACL filtering designed with the grid rather than after it). See §D-04.

**[A] D-010 — Rail is fixed and non-reorderable.**
Collapsible, but items cannot be hidden or reordered. §14.5 requires only a collapsible sidebar; the
customisable one lives in §3.3, which is explicitly unapproved. See §D-05, and C-08 for the open
question.

**[P] D-011 — Roles rendered as an explicit capability matrix.**
Six roles × seven capabilities, carrying §17.3's own value labels and its two footnotes. *Review
corrected the framing: the roles and cells are spec-stated (§17.2, §17.3) — only the rendering is
proposed. One cell (Member × invite) read as a grant where §17.3 says default-deny; corrected to
`No*`.* See §D-06.

**[A] D-012 — Fail-closed by default for Personal AI.**
No silent fallback to Central AI. Opt-in, off by default, explained in place. *Promoted from proposal
to approved: §18.1 states it outright. Only the UI treatment was ever a proposal.* See A-09, §D-07.

**[P] D-013 — Usage is shown as cost, not tokens.**
Currency leads; tokens are secondary. *Review narrowed it: cost-first is metered and authoritative for
Central AI, but must be labelled **estimated** for Personal AI, where the platform cannot know the
user's real provider bill. The hard limit is shown explicitly, not inferred from a progress bar.*
See §D-08.

**[A] D-014 — The component reference is English-only and LTR-locked.**
`data-dir-lock="ltr"` on that page only. Product screens are unaffected. *Review added the
consequence: an LTR-locked reference cannot be used to review RTL mirroring, so mirroring is verified
on the product screens instead.* See §D-10.

**[O] D-015 — Provider list, regions and data residency.**
Commercial and legal, not design.

**[O] D-016 — Pricing model.**
The usage panel assumes a monthly cap per workspace; this is a placeholder.

**[O] D-017 — AI conversation retention default.**
`30 days` is shown as a placeholder.

**[O] D-018 — Free tier and whether it includes AI.**
Affects onboarding and the usage empty state.

**[O] D-019 — Is the customisable sidebar (§3.3) wanted at all?**
Recorded so it stops being invisible. If yes, it needs a per-user preference model, a reset path, and
a rule that dashboard cannot be hidden. See C-08.

---

## Phase 01 closure

**[P] D-020 — The four open UX questions are answered, pending sign-off.**
Rail: no auto-collapse between 900–1200px, drawer below 900px. AI composer: dashboard and AI
workspace only, elsewhere a jump-with-context. Onboarding: midway skip allowed, draft kept, nothing
created. Scope switcher: two-level, with the organisation as a destination. Reasoning in
`decision-review.md` §3, resolution in `ux-architecture.md` §10.

**[P] D-021 — Responsive behaviour is three behaviours, not one breakpoint.**
Expanded rail ≥1200px; collapsed-but-expandable 900–1200px; drawer below 900px. Automatic collapse in
the middle band was rejected because it fights the user and teaches them to leave the rail collapsed.

**[P] D-022 — Below 1240px the AI context inspector and below 900px the session list become drawers.**
No content is dropped at any width; the columns become slide-overs with their content intact.

**[P] D-023 — AI failure states are first-class screens, not error strings.**
Rate limit, timeout, partial failure and provider disconnection each get a state card with what
happened, what it means, and the one action available. A provider failure that cannot be explained is
a support ticket.

**[P] D-024 — Approvals use a persistent card, plus a durable queue.**
The card stays as the presentation — an approval that can be dismissed accidentally is not a gate —
but it needs a queue reachable from the rail and the notification drawer, the §18.4 binding facts on
the card (approver identity, workflow version, argument hash, execution window), and an expiry after
which the run fails rather than executing late. One state machine serves all four surfaces:
`proposed → approved → executed`, plus `expired` and `rejected`. See §D-09.

---

## Phase 02 · architecture

The full proposal is `docs/architecture/phase-02-architecture.md`. Twenty-three decisions
(`D-ARCH-01`…`D-ARCH-23`), each tagged **[S]** spec-stated, **[D]** decided here, or **[P]** parameter.
Summarised here by area so this log stays readable:

| Area | Decision | Status |
|---|---|---|
| Deployment shape | Four deployables (web, API, worker, gateway) from one monorepo | [D] |
| Module boundaries | Enforced by lint rule + CI check, not by convention | [D] |
| Multi-tenancy | `workspace_id` on every tenant table, RLS as second defence, `SET LOCAL` per transaction | [S] + [D] |
| Identity | Keycloak owns credentials, NEXORA owns permissions | [D] |
| Authorisation | One in-process policy engine behind a port; OPA later if policy volume justifies it | [D] |
| AI provider abstraction | One adapter interface, fixed error taxonomy mapped onto the five drawn failure states | [D] |
| Fallback | Explicit state machine with a recorded consent, never a `catch` block | [S] + [D] |
| Tool execution | Sandboxed, warm pool, approval gate persisted as `proposed → approved → executed` with argument hash | [S] + [D] |
| API | Contract-first OpenAPI, breaking-change detection in CI | [S] + [D] |
| Metering | Append-only ledger, versioned price tables, adjustment events never updates | [S] |
| Secrets | Three key classes, per-workspace envelope encryption, rewrap-only rotation | [S] + [D] |
| Events | Outbox for correctness, Redis for transport | [S] + [D] |
| Observability | OpenTelemetry, allowlist-based log redaction | [S] + [D] |
| Backup / DR | Monthly automated restore drill, not a documented procedure | [D] |
| Testing | Six mandatory suites as the release gate | [S] + [D] |

---

## Decisions that were considered and rejected

| Rejected | Reason |
|---|---|
| A single-column auth flow without a brand panel | The scope model needs to be introduced before the first workspace exists; the brand panel is where that happens. |
| A dark-only product | Both themes are a specification requirement, and the light theme is what most enterprise buyers will evaluate on. |
| Persian numerals typed directly in markup | Untranslatable and error-prone; `Intl` formatting is used instead. |
| Rejecting the dashboard widget grid | §14.5 requires it. Deferred to Phase 02 instead — see D-009. |
| Auto-collapsing the rail between 900px and 1200px | It fights the user: resize by a pixel and it collapses again, so users leave it collapsed forever. Drawer below 900px is a different navigation model, and that is legitimate. |
| An inline AI composer on every screen | It competes with the page's primary action and does not say what context it attached. A jump-with-context is honest. |
| Approvals as modal dialogs or toasts | An approval that can be dismissed accidentally is not a gate. |
| Approvals as a card only, with no queue | A card is durable in the page and invisible everywhere else; an unanswerable gate is indistinguishable from a bug. |
| A three-state permission vocabulary (`yes` / `partial` / `no`) | §17.3 uses at least five: full, limited, per-delegation, own-scope-only, view-only. Collapsing them loses the security-relevant distinction the matrix exists to show. |
| Rebuilding the neutral ramp without the accent | They share a hue family; rejecting the accent means rebuilding the greys. |
