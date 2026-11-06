# DECISIONS

A running log. Newest last. Each entry is dated by phase, not by day, because the work is delivered
in stages.

Legend: **[A]** approved in the specification · **[P]** proposed by design, awaiting approval ·
**[O]** open

---

### 2026 · Phase 01

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
approvals. It is never decorative. See `docs/design/design-decisions.md` §D-01.

**[P] D-007 — Turquoise authority colour with cool neutrals.**
Deliberately outside the purple/blue AI-category palette. See §D-02.

**[P] D-008 — Instrument Sans + Vazirmatn, self-hosted.**
Both OFL, subset to woff2, 148 KB total, no CDN. See §D-03.

**[P] D-009 — Dashboard is a composed layout, not a widget grid.**
The "Command Centre" customisation is not built; the palette entry that implies it is labelled
`Proposal`. See §D-04.

**[P] D-010 — Rail is fixed and non-reorderable.**
Collapsible, but items cannot be hidden or reordered. See §D-05.

**[P] D-011 — Roles rendered as an explicit capability matrix.**
Labelled `Proposed matrix` in the UI because the specification names roles but not capabilities.
See §D-06.

**[P] D-012 — Fail-closed by default for Personal AI.**
No silent fallback to Central AI. Opt-in, off by default, explained in place. See §D-07.

**[P] D-013 — Usage is shown as cost, not tokens.**
Currency leads; tokens are secondary. See §D-08.

**[P] D-014 — The component reference is English-only and LTR-locked.**
`data-dir-lock="ltr"` on that page only. Product screens are unaffected. See §D-10.

**[O] D-015 — Provider list, regions and data residency.**
Commercial and legal, not design.

**[O] D-016 — Pricing model.**
The usage panel assumes a monthly cap per workspace; this is a placeholder.

**[O] D-017 — AI conversation retention default.**
`30 days` is shown as a placeholder.

**[O] D-018 — Free tier and whether it includes AI.**
Affects onboarding and the usage empty state.

---

## Decisions that were considered and rejected

| Rejected | Reason |
|---|---|
| A single-column auth flow without a brand panel | The scope model needs to be introduced before the first workspace exists; the brand panel is where that happens. |
| A dark-only product | Both themes are a specification requirement, and the light theme is what most enterprise buyers will evaluate on. |
| Persian numerals typed directly in markup | Untranslatable and error-prone; `Intl` formatting is used instead. |
| A widget-based customisable dashboard | Large feature, low usage; see D-009. |
| Auto-collapsing the rail below 1200px | Breaks spatial memory mid-session; collapse is user-initiated. |
