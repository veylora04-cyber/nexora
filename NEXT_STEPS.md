# NEXT_STEPS

**Phase 01 is closed. Phase 02 has an architecture proposal.** Nothing in §4 should start before both
are reviewed — the brief is explicit that no production code, schema, auth service or real AI
integration is built until the design foundation and the architecture are approved.

---

## 1 · Immediate: review

1. Open `design-preview/index.html` through a local server (see `PROJECT_STATUS.md`), walk the six
   screen cards, and toggle **theme** and **language** in the prototype bar on every page.
2. Read **`docs/design/decision-review.md`** — it is the review artefact. Ten proposals, with the review recommending
   six approvals and four modifications, none rejected, each with the specification clause that grounds it. The four UX
   questions that were open are answered in §3 of that document.
3. Read **`docs/architecture/phase-02-architecture.md`** — twenty-nine decisions across the seventeen
   required areas, plus `security-traceability.md` (18 domains) and `error-taxonomy.md` (8 error classes). §20 lists what it deliberately does *not* decide; §21 gives the build order.
4. Answer the six questions in `design-decisions.md` §C. They are product and legal questions, not
   design ones, and three of them block work that is otherwise ready.

**Suggested order:** decision review → Phase 02 architecture §21 → brand direction → dashboard → AI →
workspace → auth → onboarding.

---

## 2 · Blocked on approval

| Item | Blocked by |
|---|---|
| Any application code | Design + architecture approval |
| Provider list, regions, residency copy | C-01 |
| Pricing and quota model — and therefore D-08's headline number | C-02 |
| Retention default in the AI context inspector | C-03 |
| Free-tier behaviour in onboarding | C-04 |
| SSO/SCIM in Phase 02 | C-06 |
| Customisable sidebar (§3.3) | C-08 |
| The four review recommendations in §3 | Sign-off on `decision-review.md` |

---

## 3 · Design follow-ups — recommended, not built

Each of these is a recommendation of the decision review that changes an approved surface. They are
deliberately **not** implemented in this phase: a closure phase should not ship new approved
behaviour without sign-off.

1. **Approvals queue.** A pending-approval count in the rail, an approvals group in the notification
   drawer, and the §18.4 binding facts on the card — approver identity, workflow version, argument
   hash, execution window — with an expiry after which the run fails rather than executing late.
   Without it, an approval that the user is not looking at is indistinguishable from a bug. (D-09)
2. **Estimated-cost display for Personal AI.** The usage surfaces currently present one currency figure
   with a cap. For Personal AI that figure is an estimate the platform cannot stand behind, and the
   hard limit needs to be shown explicitly rather than inferred from a progress bar. (D-08)
3. **Two-level scope switcher.** The organisation becomes a selectable destination — billing, security
   and policy live there — with the current team pinned at the top. Below 900px it becomes a sheet, not
   a dropdown. (Q4)
4. **Onboarding draft persistence.** Midway skip is allowed; what was entered must survive it, with a
   "resume setup" entry point on the dashboard, and skip must create nothing. (Q3)

---

## 4 · Phase 02 — after approval

Build order and dependency reasoning are in `phase-02-architecture.md` §21. The short version:

1. Monorepo and the four deployables, with module-boundary enforcement in CI before any feature lands.
2. Tenant model, RLS policy generation, and the tenancy test suite — because every later feature is
   written on top of this, and retrofitting isolation is not a refactor.
3. Identity (Keycloak) and the policy engine, with the role matrix as the seed data.
4. AI Gateway and the provider adapter, with the fixed error taxonomy mapped onto the five failure
   states that are already drawn.
5. Approval gate and sandboxed tool execution.
6. Metering ledger, then billing.
7. The dashboard widget grid — deferred requirement, not a new feature (D-04).

Explicitly **not** in the first release: marketplace, public API beyond `/v1` read endpoints, SCIM,
multi-region. Each has a section in the architecture explaining what it would cost to add later and why
deferring is safe.

---

## 5 · Housekeeping

- **Repository:** `https://github.com/veylora04-cyber/nexora` (private). This work is on
  `phase-01-closure-phase-02-architecture`, branched from `main` at `056d0a8`. `main` is untouched.
- **Branch policy:** never push to `main` without explicit permission. Open a pull request from the
  phase branch.
- **Open question:** should `design-preview/` stay at the repo root, or move under `design/` to match
  the brief's folder structure? It is currently at the root, because it is the thing people are asked
  to open first.
- **Before hand-off:** delete the prototype's `Proposal` badges. They are review scaffolding, and
  leaving them would make saffron mean two different things (D-01).
