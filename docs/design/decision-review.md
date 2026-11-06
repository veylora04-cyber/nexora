# NEXORA — Decision review

Review of the ten proposals in `design-decisions.md` (bucket B) and the four open UX questions in
`ux-architecture.md` §10, against
`NEXORA_Master_Product_Technical_Specification (1).md`.

Every verdict below is grounded in a specific clause of the specification. Where the specification
is silent, that is stated — silence is not permission, so a proposal resting on silence is marked as
such and stays a proposal.

**These verdicts are recommendations, not approvals.** A verdict of APPROVE means "this reviewer
recommends adopting it"; the entry in `design-decisions.md` remains `PROPOSED` until the product owner
decides. The distinction is not pedantic: a document that reads as though a review approved something
is how an unapproved decision gets implemented and later attributed to the wrong person.

**Verdict vocabulary**

| Verdict | Meaning |
|---|---|
| **APPROVE** | Consistent with the specification, and sound on UX, security, scalability and maintainability. Adopt as a decision. |
| **MODIFY** | The direction is right but a specific element is wrong, missing, or contradicts the specification. Adopt after the stated change. |
| **REJECT** | Contradicts an approved requirement, or creates a security or scalability problem that outweighs the benefit. |

**Result:** 6 APPROVE, 4 MODIFY, 0 REJECT.

---

## 1. Verdicts at a glance

| # | Decision | Verdict | Reason in one line | Spec basis |
|---|---|---|---|---|
| D-01 | Saffron reserved for AI / live / approval | **APPROVE** | Makes the approval gate perceptible; no requirement is touched. | §14.5 (visual style), §18.3 |
| D-02 | Turquoise as the authority colour | **APPROVE** | Neutral, non-category colour for the shell; keeps AI purple distinct. | §14.5 |
| D-03 | Instrument Sans + Vazirmatn, self-hosted | **APPROVE** | Only combination that satisfies Persian-first typography and licence-clean redistribution. | §14.5 (Localization), §21.4 |
| D-04 | Dashboard is a fixed layout, not a widget grid | **MODIFY** | Contradicts §14.5, which *requires* an add/remove/reorder grid. Reclassify as a **deferred requirement**, and build the layout grid-ready. | §14.5, §14.4 |
| D-05 | Sidebar is fixed (collapsible only) | **APPROVE** | §14.5 requires only a collapsible sidebar. The customisable sidebar lives in §3.3, which is explicitly unapproved. | §14.5, §3.3 |
| D-06 | Six roles × seven capabilities matrix | **MODIFY** | The matrix is faithful to §17.3, but the decision text claims two roles are invented. They are spec-stated. Add §17.3's two footnotes; fix one cell. | §17.2, §17.3 |
| D-07 | Fail-closed as the default for Personal AI | **APPROVE** | Already a requirement, not a proposal. Behaviour is spec-stated; only the UI treatment is new. | §18.1 |
| D-08 | AI usage shown as cost, not tokens | **MODIFY** | Correct for Central AI. Wrong for Personal AI, where the platform cannot know the user's real bill. | §18.5, §18.1 |
| D-09 | Persistent card is the only approval pattern | **MODIFY** | Correct presentation, insufficient durability. Needs an off-screen queue and the §18.4 binding facts. | §18.3, §18.4, §14.5 |
| D-10 | English-only, LTR-locked component reference | **APPROVE** | Internal artefact; no product surface affected. | — |

---

## 2. Per-decision review

### D-01 · Signal saffron as a reserved colour — APPROVE

**What it claims.** Amber is used only for AI activity, live state, and things awaiting a human
decision. Never decorative, never "premium".

**Consistency.** §14.5 asks for Minimal + Futuristic + Premium SaaS with unified tokens; it does not
assign colours. §18.3 requires human approval for sensitive and destructive writes — an approval that
is not visually unmistakable is an approval that gets clicked through. Reserving one hue for it is a
control, not a style preference.

**UX.** Sound. The constraint is what gives the badge its stop-power. It also survives theming
because the hue, not the lightness, carries the meaning.

**Security.** Positive and under-appreciated: colour is part of the enforcement surface. If amber
appeared on ordinary buttons, users would learn to dismiss it, and the last line of defence before an
outbound action degrades to a formality.

**Scalability.** No cost. One token, one rule.

**Maintainability.** The rule is checkable in review ("does this element use amber for something that
is not AI, live, or pending?") which is more than most design rules manage.

**One finding, and it is a prototype artefact, not a product risk.** In the prototype, `badge--signal`
is used four times: the dashboard's *Proposal* badge, the AI *Pending approval* badge, the workspace
*Proposed matrix* badge, and the chrome-level proposal badge. Three of the four are annotations about
the **design**, not the product — they exist because this is a review artefact and they disappear at
hand-off. Only the fourth is the real use. Record it so nobody inherits the collision: **the proposal
badges must be deleted, not restyled, when the prototype becomes the product.** If they were kept,
amber would mean both "unapproved design decision" and "the AI is waiting for you", and the second
meaning is the one that has to survive.

**Consequences of approval.** Marketing and brand surfaces cannot use amber as an accent, and the
"premium" tier indicator cannot be amber. Both need to be stated in the brand hand-off, or the first
campaign will quietly break the rule.

---

### D-02 · Turquoise as the authority colour — APPROVE

**What it claims.** Primary is a deep teal in light (`#0b6b62`) and bright turquoise in dark
(`#3fc2b0`), with cool green-biased neutrals.

**Consistency.** §14.5 gives no palette. The specification's only colour-adjacent requirement is
WCAG 2.2 AA contrast (§14.5 Accessibility), which the tokens meet — measured, not assumed: the
contrast sweep covers all pages in both themes, and the five AI failure states were re-checked after
they were added.

**UX.** The argument holds. A green-biased neutral ramp reads as instrumentation; a blue-purple one
would read as a consumer AI product and would collide with the AI category colour. Distinctness from
the AI hue is the functional requirement here, and teal delivers it.

**Security.** Neutral. No bearing on access control or data handling.

**Scalability.** The palette is 182 semantic tokens behind a theme switch. Adding a third theme is a
token file, not a refactor — which is the property that matters if a white-label or
high-contrast theme is ever required.

**Maintainability.** One caveat worth writing down rather than discovering later: **primary and
success share a hue family.** A success state must therefore never be conveyed by colour alone —
it needs an icon or a label. That is already required by WCAG 1.4.1 (Use of Color), so this is not a
new constraint, but the palette makes it non-optional rather than merely advisable. Every success
surface in the prototype (toasts, the `ok` badges, the "connected" provider state) carries text.

**Consequences of approval.** The neutral ramp is coupled to the accent — rejecting the accent later
means rebuilding the greys, not swapping one value. Record that so a future palette review does not
underestimate the work.

---

### D-03 · Instrument Sans + Vazirmatn, self-hosted — APPROVE

**What it claims.** Two OFL variable fonts, subset to `woff2`, served locally, 148 KB total.

**Consistency.** §14.5 requires Persian and English from the start, with all text, dates, numbers and
currency localisable, and RTL/LTR support. A Persian-first product cannot ship a Latin typeface with
an Arabic fallback bolted on: the metrics differ, the numerals differ, and the result looks like a
translation. Vazirmatn is designed for Persian rather than adapted from Arabic, which is the specific
property that matters.

**UX.** Measured rather than argued: Persian runs at tracking 0, one type step larger, leading 1.7 —
because the Arabic script's connected baseline makes Latin tracking and leading actively harmful.
This is recorded in bucket D of `design-decisions.md` as a deliberate departure, correctly.

**Security.** Positive, and the reason this is not merely a performance decision: a third-party font
CDN is a third-party request on every page, a privacy leak (the referrer and the IP go to someone
else), and an availability dependency. Self-hosting removes all three. For a product whose §21.3
commitments include data minimisation, that is the right default.

**Scalability.** 148 KB for two variable faces is a hard budget, and it is the correct place to put
one: fonts are render-blocking. Adding a weight or a script means re-subsetting, not adding a file.

**Maintainability.** Two conditions must be written down or this decays: (a) the subsetting pipeline
must be reproducible — a checked-in script and the exact `pyftsubset` ranges, otherwise the next
person cannot regenerate the files; (b) OFL requires the licence text to ship with the product, so
the notices must be in the repo and in the about screen.

**Consequences of approval.** Any replacement face must cover Persian numerals, support variable
weights, and be redistributable. That triple eliminates most of the obvious candidates, which is
worth knowing before someone proposes one.

---

### D-04 · Dashboard is a fixed layout, not a widget grid — MODIFY

**This is the one proposal that contradicts an approved requirement, and the contradiction is inside
the specification itself.**

**What the specification says, twice, in opposite directions.**

- §14.5, *final user experience*, normative: *"Dashboard: widgets can be added, removed and
  reordered; layout settings are stored per user and per workspace. Widgets must be filtered by data
  access."*
- §3.3, a summary of the historical record: the movable-widget dashboard, the smart sidebar and the
  Command Center are listed as *"recorded proposals; final approval of each dashboard component was
  not established in the available sources."*

**Resolution.** §14.5 is the normative experience section and is written in the imperative; §3.3 is a
descriptive note about what earlier records contained, and it says so in its own heading
("proposal recorded, final approval unclear"). Where a normative clause and a note about history
disagree, the normative clause governs. **The widget grid is therefore a requirement, not a
proposal** — and D-04, as written ("the customisation is not built"), is a rejection of a requirement
dressed as a proposal.

That is the finding this review has to make, because a proposal cannot override a requirement. But
the *engineering* judgement behind D-04 is not wrong, and it should be preserved:

**What D-04 gets right.** A configurable dashboard is a feature with its own data model (widget
registry, per-scope layout persistence, per-widget empty and error states, permission-filtered widget
data), and §14.4 puts the MVP ahead of it. Building the grid in Phase 01 would consume the phase.

**Modified decision.** *The dashboard ships in Phase 01 as a composed default layout. The grid is a
**deferred requirement**, scheduled for Phase 02, not a rejected one. The Phase 01 layout must be
built so the grid can be introduced without a restyle.*

**What "grid-ready" concretely means**, so this is not a slogan:

1. Every dashboard block is already a self-contained card with a stable key (`tasks`, `recent`,
   `usage`, `workspaces`). A widget registry is then a list of keys, not a rewrite.
2. Layout persistence needs `(user_id, workspace_id)` as its key. Nothing in Phase 01 may store
   layout preferences on the user alone, or the migration to per-scope layouts becomes a data
   problem.
3. §14.5's last sentence — *widgets must be filtered by data access* — is a security requirement that
   a fixed layout never has to solve and a grid cannot avoid. It must be designed with the grid, not
   after it: a widget is a query, and a query without an ACL filter is a data leak with a friendly
   header.

**UX.** The composed default is genuinely better for a first-run user than an empty grid; the mistake
would be treating "better default" as "no requirement".

**Security.** As above — the permission-filtered widget is the risk the requirement introduces, and
it is the reason deferring is defensible but rejecting is not.

**Scalability.** Layout persistence per user *and* workspace multiplies rows by scope count; trivial
at any realistic size, but only if the key is right from the start.

**Maintainability.** Deferring is cheaper now and more expensive later *unless* the three
grid-ready conditions above are met now. That is the whole point of the modification.

**Consequences of the modification.** `design-decisions.md` D-04 must be rewritten as a deferral, the
prototype keeps its current layout, and the Command Center entry stays labelled `Proposal` — but the
label now means "proposed *surface*", not "proposed requirement". Phase 02's architecture treats
layout persistence as an in-scope table (`phase-02-architecture.md` §4).

**Consequence of leaving it as written.** The next reader concludes the widget grid was rejected, and
Phase 02 ships without it, and the product quietly fails §14.5 with nobody having decided to.

---

### D-05 · Sidebar is fixed — APPROVE

**What it claims.** Three labelled groups, fixed order. Collapsible, not reorderable, not hideable.

**Consistency.** §14.5 requires a *collapsible* sidebar (`Sidebar قابل جمعشدن`). It does not
require customisation. The customisable sidebar appears only in §3.3 — the same unapproved-records
section that produced the D-04 contradiction. So here the specification and the proposal agree, and
the reasoning is the mirror image of D-04: §3.3 lists it, §14.5 does not require it, therefore it
stays a proposal.

**UX.** Reordering a nine-item rail adds a settings surface and solves no problem the user has.
Hiding items breaks the only shared vocabulary support and onboarding have ("where is Agents?").
The collapsible state is the part that earns its keep, and it is the part §14.5 requires.

**Security.** Marginal but real: a hideable rail makes it possible for a user to lose the only route
to a security-relevant screen (Members, Usage, Security). A fixed rail guarantees every user can
always reach every surface their role permits.

**Scalability.** Zero. No preference model, no per-scope state, no migration.

**Maintainability.** A fixed rail means a new module is one entry in one array. A customisable rail
means defaults, resets, required-item rules, and a class of support tickets that only exist because
someone hid the thing they were looking for.

**Consequences of approval.** §3.3's "smart, customisable sidebar" is still on the table as an
unapproved idea. It is added to bucket C as **C-08** so it stops being invisible: if it is ever
wanted, it needs a per-user preference model, a reset path, and a rule that dashboard cannot be
hidden.

---

### D-06 · Roles and permissions matrix — MODIFY

**What it claims.** Six roles × seven capabilities, rendered as an explicit grid of
`yes` / `partial` / `no`, labelled *Proposed matrix*.

**The decision text is wrong about its own provenance.** D-06 says *"Six roles (Owner, Admin, Member,
Guest, plus two proposed)"*, and bucket D item 3 repeats it: *"the role matrix invents two roles
beyond Owner/Admin/Member/Guest."* **It does not.** §17.2 names all six:

> `Owner`, `Admin`, `Member`, `Guest`, `Billing Manager`, `Security Auditor`

and §17.3 gives the full capability matrix for those six. The two "extra" roles are spec-stated, and
the matrix in the prototype is not an invention — it is a **translation of §17.3**, cell by cell,
with the spec's own Persian labels (`محدود`, `مشاهده ممیزی`, `طبق Delegation`, `فقط شخصی`,
`مصرف شخصی`, `فقط مالی`, `طبق سیاست`) carried across.

That matters beyond bookkeeping. If the document says the grid is invented, a future reader treats
§17.3 as unimplemented and rebuilds it differently, and the product ends up with two matrices.

**Cell-by-cell check against §17.3.** Seven rows, six roles, forty-two cells. Forty-one match. One
does not:

| Capability | Role | §17.3 | Prototype | Action |
|---|---|---|---|---|
| Invite and manage members | Member | `خیر*` — no, unless an independent permission is granted | `واگذارشده` (Delegated) | **Change to `خیر*`.** §17.2 states the default is deny; a cell that reads as a grant inverts the default for the one role most likely to be over-permissioned. |

Two further fidelity gaps, both omissions rather than errors:

1. §17.3 carries two footnotes that the prototype drops. `*` — a Member may invite only if granted
   an independent permission. `**` — an Admin may perform permitted billing operations only under
   delegation from the Owner; subscription ownership and Owner transfer stay with the Owner. The
   footnotes are where the *conditions* live; without them the matrix reads as static grants and the
   ABAC half of §17.2 disappears from the design.
2. §17.2 requires that an Organization policy can be stricter than the workspace policy and that a
   child policy can never weaken a parent's restriction. The matrix says this in the subtitle
   ("effective access is computed from roles plus organization policy") but shows nothing about it.
   Not a cell change — a note is enough — but it is the one row of §17.2 that has no visual
   representation at all.

**Modified decision.** *The matrix stays. Its provenance is corrected: roles and cells are
spec-derived, and only the **rendering** is a proposal. §17.3's footnotes are added. The Member/invite
cell becomes `No*`.*

**UX.** A disabled button with no explanation is the most common support ticket in permissioned
products. The matrix is what turns "you can't do that" into "you can't do that, because you are a
Member". That argument survives the modification intact.

**Security.** This is the highest-stakes proposal in the set, because a permission matrix that is
*wrong* is worse than no matrix — it gets copied into code. The single cell fix above is the one place
where the prototype currently over-grants relative to the specification.

**Scalability.** §17.2 allows custom roles while forbidding removal of critical system permissions.
The matrix must therefore be presented as *defaults*, not as the permission model — which the
subtitle already does, and which the corrected framing reinforces.

**Maintainability.** Keeping the spec's own labels means the matrix can be diffed against §17.3
mechanically. Renaming them for elegance would break that.

**Consequences of modification.** One cell changes, two footnotes are added, and `design-decisions.md`
D-06 and bucket D item 3 are rewritten. The `Proposed matrix` badge stays — the *rendering* is still
a proposal.

---

### D-07 · Fail-closed as the default for Personal AI — APPROVE

**What it claims.** When Personal AI fails, requests stop. Falling back to Central AI is opt-in, off
by default, explained in place.

**This is not a proposal. It is a requirement, and it is already in the specification** — §18.1, last
bullet:

> *"On Personal AI disconnection the default is Fail Closed; return to Central only if the user has
> previously authorised it and the workspace policy permits."*

So D-07 should move from bucket B to bucket A. What is genuinely proposed is narrower and worth
keeping as a proposal: **the UI treatment** — a switch inside the Personal AI block, with the
consequence stated next to it, rather than a settings toggle buried in a preferences page, and
rather than a modal at the moment of failure.

**UX.** Explaining the consequence where the switch is, rather than in documentation, is correct. The
copy has to say what actually happens: *requests stop; your key is not used; nothing is sent to the
platform provider.* Vague reassurance here is worse than none.

**Security.** This is the strongest decision in the set. Silent fallback is a data-residency
violation that the user experiences as reliability — the worst possible failure mode, because nobody
reports it. §18.1 also forbids changing provider, region or data policy without authorisation, and
fail-closed is the only default that cannot violate that by accident.

**Scalability.** Fallback as an explicit state machine (recorded consent, workspace policy check,
cost ceiling) is more work than a `catch` block — and it is the only version that survives an audit.

**Maintainability.** A default that is also a requirement is the easiest kind of behaviour to keep:
any change is a specification change, not a preference.

**Consequences of approval.** Reclassify to bucket A, keep the UI treatment in bucket B. The
prototype's Personal AI block already reflects it (switch off, explanation in place). The Phase 02
architecture formalises the consent record (`phase-02-architecture.md` §10).

---

### D-08 · AI usage shown as cost, not tokens — MODIFY

**What it claims.** Dashboard and context inspector lead with currency — *"$36.40 of the $50 monthly
cap"* — with tokens as secondary detail.

**Consistency.** §18.5 requires usage events to carry provider, model, input/output tokens,
**computed cost, currency**, user, workspace, agent/workflow and correlation ID. It specifies the data,
not the presentation, so the proposal is legitimate. But it also requires that **hard limit and soft
alert are distinct**, and that the ledger is append-only with corrections as adjustment events. A
single currency figure with a cap is a presentation that can express the soft alert but not the hard
limit's behaviour, and it hides the append-only correction model entirely.

**Where it breaks: Personal AI.** §18.1 routes Central and Personal AI through the same gateway, but
the *billing relationship* is not the same. For Central AI the platform meters tokens and applies its
own price table — the number is authoritative. For Personal AI the user pays their own provider
directly; the platform sees tokens and can only *estimate* cost from a reference price list. Presenting
that estimate as "$36.40 of the $50 monthly cap" is a claim the platform cannot stand behind, and the
first time the user's real invoice differs, the usage screen becomes untrustworthy — after which the
cost model has no behaviour-changing power at all, which was the entire argument for D-08.

**Modified decision.** *Cost leads for Central AI, labelled as metered. For Personal AI, cost is
labelled as estimated and shown alongside the token counts and the platform's own metered usage. The
hard-limit state is shown explicitly, not inferred from a progress bar. Tokens are never removed —
they are demoted.*

**UX.** Cost-first is right for the audience that has to approve spend. It is wrong for the audience
that brings its own key and already knows their provider's dashboard; those users want tokens,
because tokens are what their provider bills.

**Security.** No direct impact. Indirect: an inaccurate usage figure is how budget overruns get
discovered late.

**Scalability.** Price tables are versioned (§18.5, append-only ledger). A display that assumes one
price per model will misreport historical usage the first time a price changes — so the display must
read the price version attached to each usage event, not the current table.

**Maintainability.** One `usage_mode` distinction (`metered` | `estimated`) in the component, driven
by the provider's ownership, keeps this from becoming a per-provider special case.

**Consequences of modification.** The context inspector and the usage panel gain an `estimated`
qualifier and a hard-limit state. The dashboard's usage block keeps currency-first for Central AI.
`design-decisions.md` D-08 is rewritten with the Personal AI caveat.

---

### D-09 · Persistent card is the only approval pattern — MODIFY

**What it claims.** No modals, no toasts for approvals. A persistent card in the task list and in the
AI thread, which stays until answered.

**Consistency.** §18.3 requires human approval for sensitive writes and destructive operations. §14.5
requires that sensitive operations launched from the Command Center are also approved. Neither
prescribes the surface. So the *presentation* is a free choice — and the reasoning for it is right:
an approval that can be dismissed accidentally is not a gate.

**Where it falls short, and this is the substantive finding.** A card that lives in a task list is
durable *in the page* and invisible *everywhere else*. If the user is on Members, or on mobile, or
has not opened the dashboard since the agent stalled, the approval exists and cannot be found. The
gate holds — the agent waits — but the product appears broken, and the predictable operator response
is to widen the agent's permissions so it stops asking. That outcome is worse than a dismissible
modal.

Second gap, and it is a specification requirement rather than a UX preference. §18.4:

> *"Human approval must be bound to the approver's identity, the workflow version, the approved data,
> and the execution time."*

A card showing a title and two buttons carries none of that. Approval without a version and a data
hash is approval of whatever the workflow happens to be at execution time — which is exactly the
substitution attack the clause exists to prevent.

**Modified decision.** *The card stays as the presentation, and it gains: (a) a durable approvals
queue reachable from the rail and from the notification drawer, so a pending approval is discoverable
from any screen at any width; (b) the §18.4 binding facts on the card — approver identity, agent or
workflow version, a hash of the approved arguments, and the execution window; (c) an explicit expiry,
after which the run fails rather than executing late.*

**UX.** Discoverability is the whole point of an approval: an unanswerable gate is indistinguishable
from a bug. The queue also gives the approver a place to see *what they have approved*, which is a
different and equally necessary view.

**Security.** This is the decision's own argument, extended. "Cannot be dismissed" without "can be
found" produces pressure to remove the gate. Adding version and data binding converts the card from a
confirmation dialog into an authorisation record.

**Scalability.** A queue is a table with an index on `(workspace_id, state)`; a card is a DOM node. The
queue is the version that survives a page refresh, a device change, and a second approver.

**Maintainability.** One approval state machine — `proposed → approved → executed`, with `expired` and
`rejected` — serves the card, the queue, the notification and the audit log. Four surfaces, one model.

**Consequences of modification.** The AI screen's tool-call card gains the binding facts; the
notification drawer gains an approvals group; the rail gains a pending-approval count. Phase 02's
architecture defines the persisted approval record and the argument hash
(`phase-02-architecture.md` §11).

**Consequence of leaving it as written.** Approvals are missed, agents stall silently, and the
product's central safety promise (§18.3) is implemented as a UI element that only works if the user
happens to be looking at it.

---

### D-10 · English-only, LTR-locked component reference — APPROVE

**What it claims.** `components/components.html` is pinned to `dir="ltr"` regardless of UI language.

**Consistency.** The component reference is an engineering specification, not a product screen. No
requirement in §14.5 applies to it: the localisation clause governs *the product's* text, dates,
numbers and direction, and the reference is not the product.

**UX.** The argument is correct and slightly counter-intuitive: right-aligned English paragraphs in an
RTL shell are harder to read, and they make the specification look broken — which erodes trust in the
specification itself. Pinning direction makes the document legible at the cost of making it
unrepresentative, and legibility wins for a document whose only job is to be read.

**Security.** None.

**Scalability.** None.

**Maintainability.** This is where the decision earns its place: a spec page that reflows with the UI
language has to be re-verified in two directions on every change. Pinning it halves the maintenance
surface of the one page that changes most often.

**One consequence that must be written down.** An LTR-locked reference **cannot be used to review RTL
mirroring**. Directional icons, logical properties and mirrored affordances have to be verified on the
product screens instead. They are — the QA sweep covers both directions across every page — but the
next person to add a component will look for a mirrored specimen in the reference and not find one.
The reference should say so, in one line, at the top.

---

## 3. The four open UX questions

### Q1 · Should the rail collapse automatically below 1200px, or only on user action?

**Answer: neither, at the widths where it matters. Keep user-action-only collapse between 900px and
1200px; below 900px the rail is replaced by a drawer.**

The question assumed one breakpoint. There are two behaviours, and the prototype now has both:

| Width | Rail | Why |
|---|---|---|
| ≥ 1200px | Expanded, user may collapse | Spatial memory: the map stays where the user left it. |
| 900–1200px | Collapsed icon rail, user may expand | Automatic collapse on resize causes layout thrash and destroys the user's chosen state. 260px of a 1024px viewport is affordable; 260px of a 940px viewport is not, which is why the default flips — but only as a default. |
| < 900px | Hidden; opened as a drawer from the topbar | At this width a rail is not a rail, it is a permanent 30% tax on the content area. |

The reason to reject automatic collapse in the middle band is not aesthetic. Auto-collapse fights the
user: expand the rail at 1100px, resize the window by one pixel, and it collapses again. Users
respond by leaving it collapsed forever, which means the labelled navigation — the thing that makes
nine modules learnable — is never seen.

**Consequence.** The rail's expanded/collapsed state must be a user preference, not a media-query
side effect, or the middle band re-introduces the fight. Verified in the prototype: no horizontal
overflow at any of five widths in either language, and the closed mobile rail traps no focus.

### Q2 · Should the AI composer be available inside every screen, or only on the dashboard and AI workspace?

**Answer: dashboard and AI workspace only. Everywhere else, an "Ask AI" affordance that *opens* the AI
workspace with the current page's context attached.**

An inline composer on Members, Usage or Marketplace competes with the page's primary action and,
worse, is ambiguous: a composer sitting on the billing page implies the AI can see the billing page.
It can — but only if the context is explicitly attached, and an inline composer does not say what it
attached.

A jump-with-context is honest: the user lands in the AI workspace, the context inspector shows exactly
what came along (scope, page, selected resources), and the scope rules of `ux-architecture.md` §1
still apply. It also means one composer to maintain, one input model, one set of states.

**Consequence.** This needs a context-handoff contract — what a page contributes when it hands off.
The context inspector already models the answer (scope, attached files, retrieval scope), so the
contract is a small addition, not a new subsystem. §14.5's requirement that the active
provider/model, workspace, access level and usage state are always visible is satisfied by the AI
workspace's own header, which is why the jump works.

### Q3 · Should onboarding allow skipping Smart Start midway and keeping what was entered?

**Answer: yes, with three conditions.**

1. **Skipping creates nothing.** §14.5 is explicit: Smart Start must not create a workspace,
   subscription or cost without the user knowing. Skip must therefore land in Free Start with a
   workspace that has no provider configured — not a half-configured one.
2. **Entered values persist as a draft**, and the dashboard offers "resume setup" until the draft is
   either completed or explicitly discarded. Silent loss is the failure mode that makes users distrust
   onboarding forever.
3. **The summary stays all-or-nothing.** The final step's review screen is where the user consents to
   creation; partial consent there would produce a workspace nobody can describe.

**Consequence.** This needs draft persistence — client-side at minimum, server-side if the user might
resume on another device, which for a B2B product they will. The prototype now carries steps 2–4 as
separate views with back navigation, so the draft is retained in-page; the persistence layer is a
Phase 02 concern and is listed as such.

### Q4 · How should a user switch between an organisation's teams without leaving the current team context?

**Answer: the scope switcher becomes two-level, and gains a third destination rather than a third
container.**

The current switcher is a flat list of scopes. For an organisation with teams, it becomes:

```
Organization: Acme            ← a destination in its own right (billing, security, policy)
  ├ Team: Platform            ← current
  ├ Team: Growth
  └ Team: Research
Personal: Sara                ← always present, never governed by the org
```

Three properties, and each fixes a specific failure:

- **The organisation is selectable, not just expandable.** Billing and security reporting are
  org-scope screens; without an org destination the user reaches them from inside a team and cannot
  tell whose money they are looking at.
- **The current team stays pinned** at the top of the list with a marker, so bouncing out to the org
  and back is one selection, not a re-navigation.
- **Switching is still explicit** — `ux-architecture.md` §1 rule 2. A two-level menu must not become a
  hover-expanding tree that changes context on mouse-over; that is how users end up approving an
  action in the wrong workspace.

**Consequence.** The switcher must render three levels without exceeding the topbar's height budget on
mobile, which means it becomes a sheet below 900px rather than a dropdown. And the "Organization
policy applies" note on the workspace card (§1 rule 3) has to appear on the org destination too, or
the hierarchy reads as flat.

---

## 4. Corrections this review forces in existing documents

| Document | Change | Why |
|---|---|---|
| `design-decisions.md` D-04 | Rewrite as a **deferred requirement** (§14.5), not a rejected proposal. Add the three grid-ready conditions. | A proposal cannot override a normative requirement. |
| `design-decisions.md` D-06 | Remove "plus two proposed". All six roles are §17.2. Only the rendering is proposed. | The document currently misstates its own provenance. |
| `design-decisions.md` D-07 | Move to bucket A. Behaviour is §18.1; only the UI treatment stays proposed. | A requirement recorded as a proposal will be re-litigated. |
| `design-decisions.md` D-08 | Add the Personal AI estimation caveat and the hard-limit state. | The platform cannot know a user's own provider bill. |
| `design-decisions.md` D-09 | Add the durable queue, the §18.4 binding facts, and expiry. | Discoverability, and a specification requirement the card does not currently carry. |
| `design-decisions.md` bucket D item 3 | Delete. The two roles are not invented. | Factually wrong. |
| `design-decisions.md` bucket C | Add **C-08** — is the customisable sidebar (§3.3) still wanted? | It is currently invisible; D-05 answers it for Phase 01 only. |
| `ux-architecture.md` §10 | Replace the four open questions with the four answers above. | They are now decided; leaving them "open" implies the prototype is provisional. |
| Master specification §3.3 vs §14.5 | Recorded as a contradiction for the product owner to resolve. Design proceeds on §14.5. | The spec disagrees with itself about the dashboard. |

## 5. What changes in the prototype now, and what waits

**Applied now** (spec-fidelity fixes, not design changes):

- Member/invite cell → `No*`; §17.3's two footnotes added to the matrix.
- `ux-architecture.md` §10 rewritten with the four answers.

**Waits for approval of this review** (they change approved surfaces):

- The approvals queue, its rail entry and the §18.4 binding facts on the card (D-09).
- The `estimated` qualifier and hard-limit state in the usage surfaces (D-08).
- The two-level scope switcher with an org destination (Q4).
- Onboarding draft persistence and the "resume setup" entry point (Q3).

**Waits for Phase 02** (deferred requirement):

- The dashboard widget grid, with per-user-and-workspace layout and permission-filtered widgets (D-04).

## 6. Still needs product or legal input

These are not design decisions and this review does not answer them. They are restated here because
three of them block work that is otherwise ready:

| # | Question | Blocks |
|---|---|---|
| C-01 | Providers and launch regions | The provider catalogue, the fail-closed copy, and data-residency claims. |
| C-02 | Pricing unit (seat / workspace / usage) | The usage panel's cap, and therefore D-08's headline number. |
| C-03 | AI conversation retention default | The context inspector's `30 days` is a placeholder, and it is displayed as fact. |
| C-04 | Free tier, and whether it includes AI | The onboarding empty states and the usage panel's zero state. |
| C-06 | SSO/SCIM in Phase 02 | The org-scope screens and a fourth authentication state. |
| C-08 | Customisable sidebar | Whether §3.3's sidebar ever ships. |
