# NEXORA — Design decisions

Three buckets, kept strictly separate:

- **A — Approved in the specification.** Treated as requirements. Not up for re-litigation.
- **B — Proposed by this design work.** Implemented in the prototype, but clearly labelled in the UI
  and awaiting approval. Nothing here has been promoted to a requirement.
- **C — Open / market-dependent.** Cannot be decided by design alone; needs product or legal input.

Each entry records the decision, the reason, and what would have to change if it is rejected.

---

## A · Approved in the specification

| # | Decision | How it is honoured |
|---|---|---|
| A-01 | Three workspace levels: Personal, Team, Organization | Scope model in `ux-architecture.md` §1; every scope chip carries its level; the auth brand panel introduces the three rings. |
| A-02 | Hybrid onboarding: Smart Start **and** Free Start | Both paths are first-class, side by side, with the trade-off stated on each card. Neither is a fallback. |
| A-03 | AI must never act without human approval | Tool-call card with explicit `Pending approval` state and *"No outbound request is sent until you approve."* Rendered on the AI screen. |
| A-04 | Central AI + Personal AI (bring your own key) | Two configuration blocks; Personal AI form with masked key, base URL, and a fail-closed switch. |
| A-05 | Persian is the primary locale, English secondary | `fa` is the default; `dir=rtl` by default; Persian typography rules are token-level, not per-screen. |
| A-06 | Phase 01 is design only — no backend, auth, or real providers | The prototype is static; every control is either a local interaction or a clearly-labelled demo. No network calls, no keys. |
| A-07 | Full RTL and LTR parity | Logical CSS properties only; directional icons mirror; numbers and dates via `Intl`. |
| A-08 | Light and dark themes | Token swap on `[data-theme]`; both themes verified on every screen. |

---

## B · Proposed by this design work — needs approval

### D-01 · Signal saffron as a reserved colour

**Decision.** Amber (`--nx-signal-fill`) is used *only* for AI activity, live state, and things
awaiting a human decision. It is never a decorative or "premium" accent.

**Why.** It makes the approval moment unmistakable. If amber were also the marketing colour, the
"Pending approval" badge would lose its stop-power.

**If rejected.** A second accent must be introduced for AI, and the approval affordance needs a
different differentiator (position, animation, or an inline icon).

---

### D-02 · Turquoise as the authority colour

**Decision.** Primary is a deep teal in light (`#0b6b62`) and a bright turquoise in dark
(`#3fc2b0`), with cool green-biased neutrals throughout.

**Why.** Distinct from the purple/blue of the AI category; reads as instrumentation rather than
consumer software; the cool neutrals let the accent sit native instead of applied.

**If rejected.** The neutral ramp must be rebuilt, not just the accent — they share a hue family.

---

### D-03 · Instrument Sans + Vazirmatn, self-hosted

**Decision.** Two OFL variable fonts, subset to `woff2`, served locally (148 KB total).

**Why.** Vazirmatn is designed for Persian rather than adapted from Arabic; Instrument Sans has the
engineered tone the brand needs and holds at 11px. Self-hosting removes a third-party dependency and
prevents layout shift.

**If rejected.** Any replacement must cover Persian numerals, support variable weights, and be
licence-compatible with redistribution.

---

### D-04 · Dashboard = fixed, opinionated layout (not a widget grid)

**Decision.** The dashboard is a composed layout: greeting → composer → tasks → recent work →
usage/workspaces. No drag-and-drop widget grid.

**Why.** A configurable dashboard is a large feature (persistence, permissions, defaults per scope)
and, in practice, most users never configure it. A well-composed default delivers more value in
Phase 01. The "Command Centre" naming is kept, but the customisation is **not** built.

**Status in UI.** The command palette entry is labelled `Proposal`. The dashboard itself is presented
as-is.

**If approved as a widget grid.** Needs: widget registry, per-scope persistence, empty/loading states
per widget, and a mobile stacking model. That is a Phase 02 feature, not a restyle.

---

### D-05 · Sidebar customisation

**Decision.** The rail is fixed: three labelled groups, fixed order. Users can collapse it, but not
reorder or hide items.

**Why.** Reordering a 9-item rail adds settings surface without solving a real problem; hiding items
makes support and onboarding harder ("where is Agents?").

**If approved.** Needs a per-user preference model, a reset path, and a rule for required items
(dashboard must stay).

---

### D-06 · Roles & permissions matrix

**Decision.** Six roles (Owner, Admin, Member, Guest, plus two proposed) × seven capabilities,
rendered as an explicit grid with `yes` / `partial` / `no`.

**Why.** The specification names the roles but not their capabilities. Making the grid explicit is
the only way to review it. It is labelled `Proposed matrix` in the UI.

**If rejected.** The matrix is replaced by prose, and the product loses the ability to show *why* a
button is disabled.

---

### D-07 · Fail-closed as the default behaviour for Personal AI

**Decision.** When Personal AI fails, requests stop. Falling back to Central AI is opt-in, off by
default, and explained in place.

**Why.** Silent fallback means data intended for a private provider can reach the platform provider
without the user noticing. Fail-closed is the safer default; the copy states the consequence.

**If rejected.** Needs an explicit consent flow before the first fallback, not a settings toggle.

---

### D-08 · AI usage shown as cost, not tokens

**Decision.** The dashboard and context inspector lead with currency (`$36.40 of the $50 monthly
cap`), with tokens as secondary detail.

**Why.** Cost is the number that changes behaviour. Token counts are meaningless to most users.

**If rejected.** Token-first display requires a plan/quota model that is understandable without
pricing.

---

### D-09 · Saffron "Pending approval" as the only interruption pattern

**Decision.** The system does not use modals or toasts for approval requests. It uses a persistent
card in the task list and in the AI thread.

**Why.** An approval that can be dismissed accidentally is not a real gate. The card stays until it
is answered.

**If rejected.** Needs a notification-based approval queue, which changes the dashboard's job.

---

### D-10 · English-only, LTR-locked component reference

**Decision.** `components/components.html` is pinned to `dir="ltr"` via `data-dir-lock`, regardless
of the UI language.

**Why.** It is a specification document for engineers. Right-aligned English paragraphs in an RTL
shell are harder to read and make the spec look broken. The product screens are unaffected.

**If rejected.** The reference page follows the UI language, and the spec copy must be rewritten to
survive RTL.

---

## C · Open / market-dependent

| # | Question | Why it is open | What would settle it |
|---|---|---|---|
| C-01 | Which AI providers are supported at launch, and in which regions? | Depends on commercial agreements and data-residency law, not design. | Provider contract + legal review. |
| C-02 | Is pricing per-seat, per-workspace, or usage-based? | The usage panel assumes a monthly cap per workspace. | Pricing model decision. |
| C-03 | What is the retention default for AI conversations? | Shown as `30 days` in the context inspector — a placeholder. | Data policy. |
| C-04 | Is there a free tier, and does it include AI? | Affects onboarding (Free Start) and the usage panel's empty state. | Commercial decision. |
| C-05 | Which passkey/platform-authenticator flows are in scope at launch? | Depends on the auth implementation. | Engineering spike. |
| C-06 | Do organisations get SSO/SCIM in Phase 02? | Would add a fourth auth state and a new settings area. | Roadmap decision. |
| C-07 | Is the product name final? | The wordmark is Latin-only; a Persian transliteration is not proposed. | Brand decision. |

---

## D · Things this design work changed in the source material

Recorded for transparency — none of these contradict an approved decision, but all are judgement
calls made without asking:

1. **Persian body size is one step larger than Latin.** The specification defines one type scale; the
   system applies a `+1` step for `[lang="fa"]`. This is a typographic correction, not a new scale.
2. **The dashboard's "AI usage" block leads with currency.** The specification mentions usage
   tracking without specifying the unit.
3. **The role matrix invents two roles beyond Owner/Admin/Member/Guest.** They are labelled as
   proposed and can be deleted without touching the layout.
4. **The command palette exists but is labelled a proposal.** The specification mentions search; a
   full command palette is an extension of that.
5. **`--nx-text-3` was darkened (light) and lightened (dark)** to meet WCAG AA. This changes a
   specification-adjacent visual value for an accessibility reason.
