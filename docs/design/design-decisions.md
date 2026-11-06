# NEXORA — Design decisions

Three buckets, kept strictly separate:

- **A — Approved in the specification.** Treated as requirements. Not up for re-litigation.
- **B — Proposed by this design work.** Implemented in the prototype, but clearly labelled in the UI
  and awaiting approval. Nothing here has been promoted to a requirement.
- **C — Open / market-dependent.** Cannot be decided by design alone; needs product or legal input.

Each entry records the decision, the reason, and what would have to change if it is rejected.

> **Status update.** All ten proposals below have been reviewed against the master specification in
> [`decision-review.md`](decision-review.md): 6 approved, 4 modified, 0 rejected. Where a review
> changed a decision, the entry now carries its verdict and the change. D-04 and D-07 have moved
> buckets as a result of that review — D-04 is a deferred requirement, D-07 was always a requirement.


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
| A-09 | Personal AI fails closed by default (§18.1) | Switch off by default in the Personal AI block, consequence stated in place. Promoted from proposal D-07 — the behaviour was always a requirement. |

---

## B · Proposed by this design work — reviewed

Each entry carries its verdict from [`decision-review.md`](decision-review.md). Implemented in the
prototype and labelled as a proposal in the UI until approved. Nothing here was silently promoted to a
requirement — the one entry that looked like a proposal but was already a requirement (D-07) was moved
to bucket A explicitly, not quietly upgraded.


### D-01 · Signal saffron as a reserved colour — **APPROVE**

**Decision.** Amber (`--nx-signal-fill`) is used *only* for AI activity, live state, and things
awaiting a human decision. It is never a decorative or "premium" accent.

**Why.** It makes the approval moment unmistakable. If amber were also the marketing colour, the
"Pending approval" badge would lose its stop-power.

**If rejected.** A second accent must be introduced for AI, and the approval affordance needs a
different differentiator (position, animation, or an inline icon).

**Hand-off note.** In the prototype, `badge--signal` is used four times: three are *Proposal*
annotations about the design itself, one is the real *Pending approval* badge. The three proposal
badges exist only because this is a review artefact — **delete them, do not restyle them, when the
prototype becomes the product.** Kept, they would make amber mean both "unapproved design decision"
and "the AI is waiting for you", and only the second meaning has to survive.

---

### D-02 · Turquoise as the authority colour — **APPROVE**

**Decision.** Primary is a deep teal in light (`#0b6b62`) and a bright turquoise in dark
(`#3fc2b0`), with cool green-biased neutrals throughout.

**Why.** Distinct from the purple/blue of the AI category; reads as instrumentation rather than
consumer software; the cool neutrals let the accent sit native instead of applied.

**If rejected.** The neutral ramp must be rebuilt, not just the accent — they share a hue family.

**Consequence to write down.** Primary and success share a hue family, so a success state can never be
conveyed by colour alone — it needs an icon or a label. That is already required by WCAG 1.4.1, but this
palette makes it non-optional rather than merely advisable.

---

### D-03 · Instrument Sans + Vazirmatn, self-hosted — **APPROVE**

**Decision.** Two OFL variable fonts, subset to `woff2`, served locally (148 KB total).

**Why.** Vazirmatn is designed for Persian rather than adapted from Arabic; Instrument Sans has the
engineered tone the brand needs and holds at 11px. Self-hosting removes a third-party dependency and
prevents layout shift.

**If rejected.** Any replacement must cover Persian numerals, support variable weights, and be
licence-compatible with redistribution. That triple eliminates most obvious candidates, which is worth
knowing before someone proposes one.

**Two conditions, or this decays.** The subsetting pipeline must be reproducible — a checked-in script
and the exact `pyftsubset` ranges, or the next person cannot regenerate the files. And OFL requires the
licence text to ship, so the notices belong in the repo and in the about screen.

---

### D-04 · Dashboard = composed default layout now, widget grid in Phase 02 — **MODIFY** *(was: "not a widget grid")*

**Reviewed.** The original text rejected the widget grid. That was wrong: §14.5 requires it —
*"Dashboard: widgets can be added, removed and reordered; layout settings are stored per user and per
workspace. Widgets must be filtered by data access."* §3.3 lists it as unapproved, but §3.3 is a note
about historical records and §14.5 is the normative experience section. A proposal cannot override a
requirement.

**Decision.** The dashboard ships in Phase 01 as a composed layout: greeting → composer → tasks →
recent work → usage/workspaces. The grid is a **deferred requirement** for Phase 02, not a rejected
one. The Phase 01 layout must be built **grid-ready**:

1. Every block is already a self-contained card with a stable key (`tasks`, `recent`, `usage`,
   `workspaces`), so a widget registry is a list of keys rather than a rewrite.
2. Layout persistence is keyed on `(user_id, workspace_id)`. Nothing may store layout preferences on
   the user alone, or the move to per-scope layouts becomes a data migration.
3. §14.5's *widgets must be filtered by data access* is a security requirement that a fixed layout
   never has to solve and a grid cannot avoid. It is designed with the grid, not after it: a widget is
   a query, and a query without an ACL filter is a data leak with a friendly header.

**Why defer at all.** A configurable dashboard needs a widget registry, per-scope persistence,
per-widget empty and error states, and permission-filtered data — and §14.4 puts the MVP ahead of it.

**Status in UI.** The command palette entry stays labelled `Proposal`; the label now refers to the
proposed *surface*, not to the requirement.

**Consequence of leaving the old text.** The next reader concludes the grid was rejected, Phase 02
ships without it, and the product fails §14.5 without anyone having decided to.

---

### D-05 · Sidebar customisation — **APPROVE**

**Decision.** The rail is fixed: three labelled groups, fixed order. Users can collapse it, but not
reorder or hide items.

**Why.** §14.5 requires a *collapsible* sidebar and nothing more. The customisable sidebar appears
only in §3.3 — the same unapproved-records section that made D-04 look like a free choice. Here the
specification and the proposal agree, so the fixed rail stands.

**Why it is also the better product.** Reordering a nine-item rail adds settings surface without
solving a real problem; hiding items makes support and onboarding harder ("where is Agents?"). A
hideable rail also lets a user lose the only route to a security-relevant screen (Members, Usage,
Security). A fixed rail guarantees every user can always reach every surface their role permits.

**Still open.** §3.3's "smart, customisable sidebar" is not rejected, only unbuilt — see C-08.

**If it is ever approved.** Needs a per-user preference model, a reset path, and a rule that
dashboard cannot be hidden.

---

### D-06 · Roles & permissions matrix — **MODIFY**

**Decision.** Six roles × seven capabilities, rendered as an explicit grid carrying the
specification's own value labels (`محدود`, `مشاهده ممیزی`, `طبق Delegation`, `فقط شخصی`,
`مصرف شخصی`, `فقط مالی`, `طبق سیاست`), with §17.3's two footnotes.

**Corrected provenance.** Earlier drafts of this document claimed the matrix "invents two roles beyond
Owner/Admin/Member/Guest". It does not. §17.2 names all six — `Owner`, `Admin`, `Member`, `Guest`,
`Billing Manager`, `Security Auditor` — and §17.3 gives the full matrix for them. The roles and the
cells are **spec-derived**; only the *rendering* is proposed. The distinction matters: if the document
says the grid is invented, a future reader treats §17.3 as unimplemented and builds it differently.

**What the review changed.** Forty-one of forty-two cells matched §17.3. The exception: Member ×
"Invite and manage members" read `Delegated` where §17.3 says `خیر*` — no, unless an independent
permission is granted. Since §17.2 states the default is deny, a cell that reads as a grant inverts
the default for the role most likely to be over-permissioned. It is now `No*`. §17.3's footnotes (`*`
Member invites need an independent permission; `**` Admin billing needs Owner delegation) are now
shown, because they are where the *conditions* live — without them the matrix reads as static grants
and the ABAC half of §17.2 disappears from the design.

**Why the grid at all.** A disabled button with no explanation is the most common support ticket in
permissioned products. The grid is what turns "you can't do that" into "you can't do that, because you
are a Member". It is labelled `Proposed matrix` in the UI because the rendering, not the content, is
under review.

**If rejected.** The matrix is replaced by prose, and the product loses the ability to show *why* a
button is disabled.

**Known gap.** §17.2 requires that an organisation policy can be stricter than the workspace policy
and that a child policy never weakens a parent's restriction. The subtitle says this; the grid shows
nothing about it. Not a cell change, but the one clause of §17.2 with no visual representation.

---

### D-07 · Fail-closed as the default behaviour for Personal AI — **APPROVE, moved to bucket A**

**This is not a proposal.** §18.1 states it: *"On Personal AI disconnection the default is Fail
Closed; return to Central only if the user has previously authorised it and the workspace policy
permits."* It is now **A-09** in the approved table. Only the UI treatment stays proposed here, and
the review approved that too.

**Proposed treatment.** When Personal AI fails, requests stop. Falling back to Central AI is opt-in,
off by default, and explained in place — a switch inside the Personal AI block with the consequence
written next to it, not a preferences-page toggle and not a modal at the moment of failure.

**Why fail-closed matters.** Silent fallback means data intended for a private provider can reach the
platform provider without the user noticing, and the user experiences it as reliability — the worst
possible failure mode, because nobody reports it. Fail-closed is the only default that cannot violate
§18.1's prohibition on changing provider, region or data policy without authorisation.

**Copy requirement.** The explanation must say what actually happens: requests stop, the key is not
used, nothing is sent to the platform provider. Vague reassurance here is worse than none.

**If rejected.** Needs an explicit consent flow before the first fallback, not a settings toggle.

---

### D-08 · AI usage shown as cost, not tokens — **MODIFY**

**Decision.** Cost leads for **Central AI**, labelled as metered: `$36.40 of the $50 monthly cap`,
tokens as secondary detail. For **Personal AI**, cost is labelled **estimated** and shown alongside
token counts, because the user pays their own provider and the platform can only estimate from a
reference price list.

**Why cost-first.** Cost is the number that changes behaviour. Token counts are meaningless to most
users — but they are not meaningless to the user who brought their own key, who wants tokens precisely
because that is what their provider bills.

**What the review changed.** Presenting a Personal AI estimate as a metered figure is a claim the
platform cannot stand behind; the first time the user's invoice differs, the usage screen becomes
untrustworthy and the cost model loses the behaviour-changing power that justified it. The review also
required the **hard limit** to be shown explicitly rather than inferred from a progress bar, because
§18.5 keeps hard limit and soft alert distinct, and that the display read the price version attached to
each usage event rather than the current table — otherwise historical usage misreports after a price
change.

**If rejected.** Token-first display requires a plan/quota model that is understandable without
pricing.

---

### D-09 · Saffron "Pending approval" as the only interruption pattern — **MODIFY**

**Decision.** No modals, no toasts for approval requests. A persistent card in the task list and in
the AI thread that stays until it is answered — **plus** a durable approvals queue reachable from the
rail and the notification drawer, the §18.4 binding facts on the card, and an expiry.

**Why the card.** An approval that can be dismissed accidentally is not a real gate.

**What the review changed, and why the card alone is not enough.** A card that lives in a task list is
durable *in the page* and invisible *everywhere else*. If the user is on Members, or on mobile, or has
not opened the dashboard since the agent stalled, the approval exists and cannot be found. The gate
holds — the agent waits — but the product looks broken, and the predictable operator response is to
widen the agent's permissions so it stops asking. That outcome is worse than a dismissible modal.
Discoverability is the whole point of an approval: an unanswerable gate is indistinguishable from a bug.

Second gap, and this one is a requirement rather than a preference. §18.4: *"Human approval must be
bound to the approver's identity, the workflow version, the approved data, and the execution time."*
A card showing a title and two buttons carries none of that. Approval without a version and a data hash
is approval of whatever the workflow happens to be at execution time — exactly the substitution attack
the clause exists to prevent.

So the card gains: approver identity, agent/workflow version, a hash of the approved arguments, and the
execution window; and after expiry the run **fails** rather than executing late.

**Why this is still one pattern, not two.** One state machine — `proposed → approved → executed`, with
`expired` and `rejected` — serves the card, the queue, the notification and the audit log. Four
surfaces, one model.

**If rejected.** Needs a notification-based approval queue, which changes the dashboard's job.

---

### D-10 · English-only, LTR-locked component reference — **APPROVE**

**Decision.** `components/components.html` is pinned to `dir="ltr"` via `data-dir-lock`, regardless
of the UI language.

**Why.** It is a specification document for engineers. Right-aligned English paragraphs in an RTL
shell are harder to read and make the spec look broken. The product screens are unaffected.

**If rejected.** The reference page follows the UI language, and the spec copy must be rewritten to
survive RTL.

**Consequence to write down.** An LTR-locked reference **cannot be used to review RTL mirroring**.
Directional icons, logical properties and mirrored affordances have to be verified on the product
screens instead — they are, in the QA sweep — but the next person to add a component will look for a
mirrored specimen here and not find one. The reference says so at the top.

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
| C-08 | Is the customisable sidebar (§3.3) still wanted, beyond the collapsible rail D-05 approves? | §3.3 lists it as an unapproved idea; §14.5 does not require it. It is invisible unless recorded. | Product decision. If yes: per-user preference model, reset path, and a rule that dashboard cannot be hidden. |

---

## D · Things this design work changed in the source material

Recorded for transparency — none of these contradict an approved decision, but all are judgement
calls made without asking:

1. **Persian body size is one step larger than Latin.** The specification defines one type scale; the
   system applies a `+1` step for `[lang="fa"]`. This is a typographic correction, not a new scale.
2. **The dashboard's "AI usage" block leads with currency.** The specification mentions usage
   tracking without specifying the unit.
3. **The command palette exists but is labelled a proposal.** The specification mentions search; a
   full command palette is an extension of that.
4. **`--nx-text-3` was darkened (light) and lightened (dark)** to meet WCAG AA. This changes a
   specification-adjacent visual value for an accessibility reason.

*(An earlier item here claimed the role matrix "invents two roles beyond
Owner/Admin/Member/Guest". It does not — §17.2 names all six. The item is removed; see D-06.)*
