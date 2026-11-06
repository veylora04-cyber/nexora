# Implementation readiness and roadmap

**Question this document answers:** is the Phase 02 architecture detailed enough to start building,
and in what order?

It is a review, not a new architecture. Where it says something is missing, the fix belongs in
`phase-02-architecture.md`, not here.

---

## 1. Verdict by area

| Area | Defined? | Where | Gap that would bite in week one | Blocking? |
|---|---|---|---|---|
| Module boundaries | **Yes** | §3, §22 container diagram | None. Boundary rules are stated as import directions, enforceable by lint. | No |
| Authentication | **Yes** | §6.1–6.3 | None after the correction: one issuer, four prohibitions, no API-minted tokens. | No |
| Authorization | **Yes** | §6.5, §7 | Policy engine interface is named but its rule language is not chosen. Any choice works if `policy.require()` is the only entry point. | No |
| Tenant isolation | **Yes** | §5, §22 ER + isolation diagram | The RLS policy *generator* is described, not written. It is the single highest-risk item in M1. | No — but M1 cannot close without it |
| Database entities | **Mostly** | §22 ER model | Nine entities are drawn; join tables for membership↔role and for approval↔argument are described in prose only. | No |
| API contracts | **Partly** | §12, §13 | Error envelope and versioning are fixed; only the approval and AI-session resources have field-level contracts. The rest is resource names. | **Yes, for M4+** |
| AI gateway | **Yes** | §10, `error-taxonomy.md` | Provider adapter interface is described; streaming transport (SSE vs WebSocket) is not chosen. | No — decide in M3 |
| Personal vs Central AI | **Yes** | §10.4, `design-decisions.md` D-08 | Cost estimation for Personal AI has no formula, only a requirement to show one. | No |
| Tool execution | **Yes** | §9 | Sandbox technology is named as a category, not a product. | No — decide in M4 |
| Human approval | **Yes** | §9, eight states | The card's eleven bound facts have no DB columns listed one-for-one. | No — M4 derives them |
| Audit | **Partly** | §8.2 domain 12 | Event names are described by category, not enumerated. | No — M2 |
| Security | **Yes** | `security-traceability.md` | 18 domains with scope split. Honest about what is post-MVP. | No |
| Observability | **Yes** | §22 observability diagram | Span names and the metric list are described; no dashboard spec. | No |
| Deployment | **Yes** | §22 deployment diagram | Four deployables, one region, container-first. | No |
| Backup and recovery | **Partly** | §8.2 domain 16 | RPO/RTO are stated as targets, not as a tested procedure. | No — M5 |

**Summary:** nothing blocks the first three milestones. The API contract gap blocks M4, and it is
cheaper to close it by writing the OpenAPI document during M1 than by discovering it in M4.

---

## 2. Milestones

Complexity is relative to this team's likely composition (2–4 engineers), not absolute.

### M0 · Foundation — *2 weeks · complexity M*

| | |
|---|---|
| **Deliverables** | Monorepo with four workspaces (`web`, `api`, `worker`, `packages/*`); TypeScript strict; CI running typecheck, lint, unit tests, and the import-boundary rule; Docker Compose with Postgres, Redis, MinIO, Keycloak; `.env.example`; ADR folder seeded from `phase-02-architecture.md` §2 |
| **Depends on** | Nothing |
| **Acceptance** | A pull request that imports `api` from `web` fails CI with a message naming the boundary. `docker compose up` yields a running API that answers `/healthz` and `/readyz`. |
| **Critical risk** | Scope creep into feature work. The boundary rule must land before the first feature, or it never lands. |

### M1 · Tenancy and identity — *3 weeks · complexity L*

| | |
|---|---|
| **Deliverables** | Org → workspace → membership schema; RLS enabled on every tenant table; the policy generator; `SET LOCAL app.workspace_id` fed from the verified membership row; Keycloak realm, client, and the BFF session store; login, refresh rotation with reuse detection, logout with session revocation |
| **Depends on** | M0 |
| **Acceptance** | A tenancy test suite that runs as *two different users in two workspaces* and proves: cross-workspace reads return zero rows; a forged `X-Nexora-Workspace` header cannot widen access; a revoked refresh family cannot be reused; `SET LOCAL` is never fed from client input. |
| **Critical risk** | RLS is easy to enable and hard to prove. Writing the test suite *first* — as the acceptance criterion, not after — is the only reliable order. |

### M2 · Policy, roles, audit — *2 weeks · complexity M*

| | |
|---|---|
| **Deliverables** | Policy engine behind `policy.require()`; the six roles seeded from §17.3; audit log with the append-only guarantee; the workspace screen's member and role flows wired to real endpoints |
| **Depends on** | M1 |
| **Acceptance** | Every route declares a policy; a route without one fails the build. The role matrix in the product matches §17.3 cell for cell, asserted by a test generated from the specification table. |
| **Critical risk** | Role semantics drift from the specification during implementation. The generated test is what prevents it. |

### M3 · AI gateway — *3 weeks · complexity L*

| | |
|---|---|
| **Deliverables** | Provider adapter interface; one real provider; the eight-code error taxonomy implemented at the boundary; streaming transport; context assembly with segment accounting; usage metering written to the ledger |
| **Depends on** | M1 |
| **Acceptance** | Each of the eight error codes is reproducible in staging with a fault-injection switch, and the UI renders the mapped surface for each. No provider response body or stack trace reaches the client — asserted by a test that greps the response envelope. |
| **Critical risk** | Provider outages are treated as bugs. The taxonomy exists precisely so they are treated as states. |

### M4 · Approval gate and tool execution — *4 weeks · complexity XL*

| | |
|---|---|
| **Deliverables** | The eight-state machine with compare-and-set transitions; argument canonicalisation and hashing; the single-use approval token; the sandboxed executor; the approvals queue; the approval card wired to real data |
| **Depends on** | M2, M3 |
| **Acceptance** | Changing one argument byte invalidates the approval. Two concurrent approve clicks execute once. An approval past its expiry fails rather than executing late. A replayed token is rejected. Each of those four is a test, not a review. |
| **Critical risk** | This is the milestone where a shortcut is most tempting and most expensive. The three duplicate-execution defences are independent on purpose; removing one because "the other covers it" is how the class of bug returns. |

### M5 · Billing, usage, operations — *3 weeks · complexity L*

| | |
|---|---|
| **Deliverables** | Metering reconciliation; quota enforcement; the usage surfaces on real numbers; backup and restore rehearsed once; the runbook for the eight error states |
| **Depends on** | M3 |
| **Acceptance** | A restore from backup into a clean environment reproduces the previous day's data, timed, with the result recorded. Quota exhaustion produces `AI_QUOTA_EXHAUSTED`, not a 500. |
| **Critical risk** | Backup is assumed to work until it is needed. One rehearsal is the difference between a plan and a hope. |

### M6 · Public surface — *post-MVP*

Marketplace, `/v1` write endpoints, SCIM, multi-region, SIEM export, PAM, break-glass. Each is scoped
`R1`/`R2`/`ENT` in `security-traceability.md` with the compensating control that makes deferral
defensible.

---

## 3. Decisions needed before M1 starts

These are the ones that block, not the ones that can wait.

| # | Decision | Why it blocks | Owner |
|---|---|---|---|
| 1 | Provider list and data residency regions (C-01) | The AI gateway adapter and the residency matrix are both shaped by it | Product + legal |
| 2 | Pricing unit and quota model (C-02) | The metering ledger's grain is the pricing unit | Product |
| 3 | Retention default (C-03) | The context inspector's copy and the deletion job's schedule | Product + legal |
| 4 | Streaming transport: SSE or WebSocket | Two different client architectures; retrofitting is a rewrite of the composer | Engineering |
| 5 | Sandbox technology for tool execution | Determines whether execution is a container or a process, and therefore the deployment shape | Engineering |

Items 4 and 5 are engineering decisions that can be made in M0 and recorded as ADRs. Items 1–3 are
product decisions and cannot be made by the team.

---

## 4. What this document does not claim

- It does not claim the architecture is complete. §20 of `phase-02-architecture.md` lists what was
  deliberately left undecided, and that list is still accurate.
- It does not claim the estimates are reliable to the week. They are relative sizes with a stated
  dependency order; the order is the durable part.
- It does not claim M1–M6 can run in parallel. M1 gates everything, M4 gates revenue.
