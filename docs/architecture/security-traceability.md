# NEXORA — Security traceability matrix

All eighteen security domains of the Master Specification (§8.2), traced from requirement to
component to control to acceptance criterion to test, with an honest scope decision for each.

The purpose is not to claim eighteen capabilities. It is to make it impossible to say "we handle
security" without naming which control, in which component, proven by which test, in which release.

---

## 0. How to read this

**Scope**

| Mark | Meaning |
|---|---|
| **MVP** | Required before the first paying tenant. A product without it is not sellable, not merely incomplete. |
| **R1** | Release 1 — the first three months after launch. Deferred deliberately, with a compensating control in the meantime. |
| **R2** | Release 2. |
| **ENT** | Enterprise readiness: built when a customer contract requires it. Not built speculatively. |

**Phase** — the delivery stage from §23 of the specification (0–6).

**A domain marked ENT is not unhandled.** It has a named owner, a stated compensating control, and a
trigger that promotes it. What it does not have is code that nobody is paying for yet.

---

## 1. The matrix at a glance

| # | Domain | Scope | Phase | Primary component | Compensating control until built |
|---|---|---|---|---|---|
| 1 | Encryption | MVP | 0–1 | KMS + `data` layer | — |
| 2 | Data retention | MVP | 1 | Retention worker | Manual deletion runbook |
| 3 | Backup & DR | MVP | 1 | Infra + restore drill | — |
| 4 | Monitoring & threat detection | MVP / ENT | 1 / 6 | Observability + SIEM feed | Alert rules in OTel backend |
| 5 | Enterprise authorization | MVP | 1 | Policy engine | — |
| 6 | AI security | MVP | 3 | AI Gateway | — |
| 7 | API & network security | MVP | 1 | API edge + WAF | — |
| 8 | Incident response | MVP (process) / ENT (tooling) | 0 / 6 | On-call + runbooks | Documented IR plan |
| 9 | Governance & compliance | R1 | 2 | Programme, not code | Control register = this document |
| 10 | Secure SDLC | MVP | 0 | CI pipeline | — |
| 11 | Infrastructure & cloud | MVP | 0–1 | IaC + cloud baseline | — |
| 12 | File & document security | MVP | 3 | Upload pipeline | — |
| 13 | Privacy architecture | MVP / R1 | 1 / 2 | Data inventory + DSR service | Manual DSAR handling |
| 14 | Data residency | R1 / ENT | 2 / 6 | Region-pinned deployment | Single-region launch with disclosed residency |
| 15 | Third-party & supply chain | MVP | 0 | Dependency + vendor register | — |
| 16 | Multi-tenant security | MVP | 1 | RLS + tenant guard | — |
| 17 | Device & endpoint | ENT | 6 | Device posture signals | Session binding only |
| 18 | Privileged access management | R1 / ENT | 2 / 6 | Break-glass + admin roles | Owner approval + audit |

---

## 2. Domain detail

### 1 · Encryption

**Requirement** — TLS 1.2+ (prefer 1.3) in transit; encryption at rest with standard algorithms; key
management through a KMS; Argon2id for passwords; no reversible password storage.

**Component** — KMS; `data` layer; storage adapters; the BFF's session store.

**Control** — Three key classes, each with its own rotation policy:

| Class | Protects | Algorithm | Rotation |
|---|---|---|---|
| Platform key | Database volume, object storage | AES-256-GCM, KMS-managed | Annual, automatic |
| Tenant key | Per-workspace data key, wraps Personal AI keys and stored secrets | AES-256-GCM, envelope | On demand; rewrap-only (see below) |
| Session key | BFF session records | AES-256-GCM | 90 days, dual-read during rotation |

**Rewrap, not re-encrypt.** Rotating a tenant key re-wraps the data key; it does not re-encrypt the
data. Re-encryption of a large workspace is an outage-shaped operation, and a rotation process that
requires one does not get run.

**Acceptance** — A key rotation completes with zero downtime and zero plaintext exposure; a database
dump without KMS access yields no readable Personal AI key; `EXPLAIN` on the secrets table shows the
ciphertext column only.

**Test** — Rotation drill in staging per release; a "stolen dump" test that greps a snapshot for any
key-shaped string; TLS scan on every environment.

**Depends on** — Cloud KMS availability; the envelope-encryption port in `data`.

---

### 2 · Data retention

**Requirement** — Per-data-class retention; deletion on request; retention configurable at workspace
level with a minimal default; AI session retention independent of agent memory retention.

**Component** — Retention worker (scheduled); `data` with a `retention_class` on every table.

**Control** — Every table declares a retention class. The worker enforces it by class, writes a
deletion receipt per batch, and refuses to delete anything whose class is unset — an unclassified
table fails CI rather than being silently kept forever.

**Acceptance** — A workspace deletion removes all tenant rows within the stated window across
Postgres, object storage, vector index and cache; a receipt exists per data class.

**Test** — Deletion drill: seed a workspace, delete it, assert zero rows in every store by direct
query, not by API. Runs monthly, alongside the restore drill.

**Depends on** — Data inventory (§13); cascade rules; the deletion job in §5 of the architecture.

---

### 3 · Backup & disaster recovery

**Requirement** — Encrypted, immutable backups; periodic restore testing; RPO 24 h, RTO 8 h for MVP.

**Component** — Managed Postgres PITR; object storage versioning; IaC-defined restore path.

**Control** — Backups are immutable for 30 days (object lock). A **monthly automated restore drill**
restores into an isolated environment, runs a checksum comparison against production row counts, and
fails loudly if the restore takes longer than the RTO. A documented procedure that has never been
executed is not a control.

**Acceptance** — The drill passes for three consecutive months; restore time is measured, not
estimated; the report is linked from the on-call runbook.

**Test** — The drill *is* the test. Its output is the evidence.

**Depends on** — Region strategy (§14); IaC.

---

### 4 · Security monitoring & threat detection

**Requirement** — Centralised logging, anomaly detection, alerting, and a path to SIEM/UEBA.

**Component** — OpenTelemetry pipeline; audit log store; alert rules; (ENT) SIEM export.

**Control** — MVP: structured security events with a fixed schema, alert rules for the eight
highest-signal conditions (repeated auth failure, privilege escalation, mass export, policy denial
spike, cross-tenant access attempt, secret access, admin action outside business hours, key rotation
failure). ENT: SIEM export via syslog/HTTP and UEBA baselines.

**Acceptance** — Every event in the audit schema is queryable by actor, workspace and time; the eight
alerts fire in a staging drill; mean time to alert < 5 min for the auth-failure case.

**Test** — Alert drills: inject the condition, assert the alert. Quarterly.

**Depends on** — Audit schema (§13); the log pipeline (§15 of the architecture).

**Honest note** — UEBA is ENT because it requires months of baseline data to be worth anything. A
UEBA deployed on day one produces noise, and noise gets muted.

---

### 5 · Enterprise authorization

**Requirement** — RBAC + ABAC, default deny, parent policy can tighten but never loosen, permission
evaluation server-side only.

**Component** — Policy engine behind a port (§6.6 of the architecture); role matrix as seed data.

**Control** — One `policy.require()` call per request, returning a decision *with a reason*. Every
denial is an audit event. The permission strings are the same ones that disable UI affordances, so a
drift between UI and server is a build failure, not a discovery.

**Acceptance** — The §17.3 matrix is executable: a test asserts all 42 cells; no endpoint exists
without a policy call (enforced by a route-table test).

**Test** — The 42-cell matrix test; a fuzz test that sends every endpoint with every role.

**Depends on** — §6 of the architecture; membership resolution.

---

### 6 · AI security

**Requirement** — No direct provider access from clients or agents; Personal keys server-side only;
SSRF defence on custom base URLs; fail-closed fallback; human approval for write and destructive
actions; prompt injection treated as untrusted data.

**Component** — AI Gateway; provider adapter; sandboxed tool executor; approval gate.

**Control** — See architecture §8, §9 and `error-taxonomy.md`. The load-bearing controls are: keys
never leave the gateway process; base URLs are validated against a deny-list of private, link-local
and metadata ranges with DNS-rebinding defence; retrieved content is tagged with a trust level and
never concatenated into the system instruction; a model's proposal is not a permission.

**Acceptance** — A Personal key never appears in any log, trace or error payload (tested by
canary-key injection and log grep); an SSRF attempt to `169.254.169.254` is refused; a destructive
tool call without an approval row does not execute.

**Test** — Canary key grep in CI; SSRF test suite; approval bypass attempts (direct tool endpoint,
replayed token, mutated arguments).

**Depends on** — KMS; sandbox runtime; approval state machine.

---

### 7 · API & network security

**Requirement** — CSRF, XSS, SSRF, injection, IDOR/BOLA, replay and brute force covered by the threat
model and tests; CSP, HSTS, secure cookies, restricted CORS, security headers.

**Component** — API edge; BFF; WAF; egress proxy.

**Control** — Deny-by-default CORS with an explicit origin list; CSP with nonces, no `unsafe-inline`;
HSTS preload; rate limits per user, workspace, credential, IP and endpoint; object-level
authorisation on every resource fetch (the BOLA class, which is the most common real-world API
vulnerability).

**Acceptance** — A scanner run finds no missing security headers; an IDOR test that swaps a resource
id across tenants returns 404, not 403 (404 avoids confirming existence).

**Test** — Automated header scan; IDOR suite per resource type; rate-limit assertions; ZAP baseline in
CI on the API.

**Depends on** — §6.6; tenant guard.

---

### 8 · Incident response & digital forensics

**Requirement** — Documented IR process, severity levels, notification duties, evidence preservation.

**Component** — Process + on-call rotation; (ENT) forensic capture tooling.

**Control** — MVP is a written plan with four severity levels, a named incident commander role, a
notification matrix, and a **forensic-ready audit trail**: append-only, tamper-evident (hash chain),
retained 12 months, exportable per workspace. The audit trail is the forensic capability; without it
no amount of tooling helps.

**Acceptance** — A tabletop exercise per quarter; an export of a workspace's audit trail is complete
and verifiable in under an hour; every incident produces a written post-mortem within five working
days.

**Test** — Tabletop exercises; audit-export integrity check (hash chain verifies).

**Depends on** — Audit store (§13); on-call.

**Honest note** — Full digital forensics (disk imaging, memory capture) is ENT. What a SaaS product
actually needs early is the ability to reconstruct *who did what, when*, and that is the audit trail,
not an imaging toolkit.

---

### 9 · Security governance & compliance

**Requirement** — Policies, control register, evidence, audit readiness. Explicitly **not** a claim of
certification.

**Component** — Programme, not software. This document is the control register.

**Control** — Each domain here maps to a control with an owner and an evidence artefact. Evidence is
collected continuously (test output, drill reports, scan results), not assembled before an audit.

**Acceptance** — Every MVP domain has an owner and an evidence artefact that is less than 90 days old.

**Test** — Quarterly control review; evidence freshness check.

**Depends on** — Everything above.

**Honest note** — §8.2 of the specification says these are architecture readiness goals, not
certification. Treating this document as a SOC 2 claim would be a misrepresentation, and the document
says so in its own first paragraph.

---

### 10 · Secure SDLC / DevSecOps

**Requirement** — Threat modelling, dependency scanning, secret scanning, code review, signed
artefacts, least-privilege CI.

**Component** — CI pipeline; branch protection; artefact registry.

**Control** — Required checks: type check, unit, integration, contract, dependency audit, secret scan,
SAST, container scan, IaC scan. A threat model per epic touching auth, tenancy, AI or files. CI
credentials are short-lived and scoped per job; no long-lived deploy key.

**Acceptance** — A PR cannot merge with a failing security check; no secret has ever been committed
(verified by history scan); every image is signed and verified at deploy.

**Test** — The pipeline is the test; a deliberately vulnerable dependency must fail the build.

**Depends on** — Nothing. This is Phase 0 and is the cheapest control in the document.

---

### 11 · Infrastructure & cloud security

**Requirement** — Least privilege, network segmentation, private subnets, no public database, IaC with
review, environment isolation.

**Component** — IaC modules; cloud baseline; VPC layout.

**Control** — Database and cache in private subnets with no public route; egress through a proxy with
an allowlist; separate cloud accounts (or at minimum separate projects) per environment; IaC plans
reviewed and drift-detected daily.

**Acceptance** — A port scan from the internet finds only 443; drift detection reports zero
unmanaged resources; no human has standing write access to production data.

**Test** — Weekly external scan; drift report; IAM policy diff on every change.

**Depends on** — Cloud provider choice.

---

### 12 · File & document security

**Requirement** — Size and type limits, real MIME detection, malware scan, quarantine before
processing.

**Component** — Upload pipeline; scanner; quarantine bucket; indexing worker.

**Control** — Upload → quarantine → scan → promote. Nothing is indexed, parsed or shown to the AI
before the scan passes. Type is determined by content sniffing, never by the declared header or
extension. Archives are rejected or scanned recursively with a depth limit.

**Acceptance** — An EICAR test file is quarantined and never reaches the index; a file with a forged
extension is classified by its real type; a zip bomb is refused by the size guard, not by the scanner
timing out.

**Test** — Malware fixture suite in CI; forged-extension fixtures; zip-bomb fixture.

**Depends on** — Object storage; scanner service; the knowledge pipeline.

---

### 13 · Privacy architecture

**Requirement** — Data classification (four levels), data inventory, DSAR support, consent lifecycle,
privacy dashboard, minimisation.

**Component** — Data inventory (generated from the schema); DSR service; consent store.

**Control** — MVP: every table carries a classification; the inventory is generated, not written by
hand, so it cannot drift; a manual DSAR runbook exists. R1: a self-service privacy dashboard and an
automated DSAR export/delete. Consent is a first-class record with a version, a timestamp, the text
shown, and a withdrawal path — a boolean column is not a consent record.

**Acceptance** — A DSAR can be answered within the statutory window from the dashboard; withdrawing
consent stops the processing it covered within one job cycle; the inventory lists every table with a
classification and an owner.

**Test** — DSAR drill per quarter; consent-withdrawal integration test; inventory completeness test
that fails when a new table has no classification.

**Depends on** — Data inventory; retention worker.

---

### 14 · Data residency & sovereignty

**Requirement** — Data stays in the declared region, across every store, not only the database.

**Component** — Region-pinned deployment; per-store region configuration; provider region selection.

**Control** — Residency is a property of the **workspace**, enforced at provisioning: a workspace is
created in a region and every store it touches is in that region.

| Store | Residency mechanism |
|---|---|
| Database | Region-pinned instance; no cross-region replica |
| Object storage | Region-pinned bucket; replication disabled unless contracted |
| Backups | Same region as the database; cross-region copy only with explicit consent |
| Logs & traces | Region-pinned collector; no global aggregation of tenant payloads |
| Analytics | Tenant identifiers only in the global warehouse; payloads stay regional |
| AI providers | Provider and region chosen per workspace; the adapter refuses a model whose region is not permitted |

**Acceptance** — A workspace in region A produces no request to any service in region B, verified by
egress logs, not by configuration review; an AI call to a disallowed region is refused before it
leaves the gateway.

**Test** — Egress assertion per region in staging; a provider-region matrix test.

**Depends on** — Multi-region infrastructure (R1); provider contracts (C-01).

**Honest note** — Single-region launch with disclosed residency is a legitimate MVP position. What is
not legitimate is claiming residency before the egress path is provable.

---

### 15 · Third-party & supply chain security

**Requirement** — Vendor risk assessment, dependency provenance, SBOM, vulnerability response.

**Component** — Vendor register; dependency policy; SBOM generation in CI.

**Control** — Every third-party service has an entry with: data categories shared, region, DPA status,
sub-processor list, and an owner. Dependencies are pinned, audited on every build, and a new dependency
requires a stated reason in the PR — not a policy, a review question.

**Acceptance** — SBOM published per release; zero critical advisories unresolved past SLA; every
vendor in the register has a current DPA.

**Test** — Dependency audit in CI; SBOM diff per release; annual vendor review.

**Depends on** — Nothing. Starts in Phase 0.

---

### 16 · Multi-tenant security

**Requirement** — Absolute tenant isolation; no cross-tenant read by any path, including search,
vectors, cache and exports.

**Component** — Tenant guard; Postgres RLS; vector index partitioning; cache key namespacing.

**Control** — `workspace_id` on every tenant table, RLS policy generated per table, `SET LOCAL
app.workspace_id` from the *verified membership row*, never from a header. Cache keys are prefixed by
workspace. Vector search filters by workspace before ranking, not after.

**Acceptance** — A cross-tenant query returns zero rows at the database layer even when the application
layer is bypassed; a cache key collision across tenants is impossible by construction.

**Test** — A dedicated tenancy suite that runs every repository method with a mismatched workspace id
and asserts zero rows; a "bypass the service layer" test that queries directly under a wrong
`app.workspace_id`.

**Depends on** — §5 of the architecture.

---

### 17 · Device & endpoint security

**Requirement** — Device posture and conditional access for enterprise tenants.

**Component** — Device records (already needed for session binding); posture signals; conditional
access policy conditions.

**Control** — MVP: sessions are bound to a device record, and a new device requires re-authentication.
ENT: posture signals (managed device, OS version, disk encryption, screen lock) as ABAC conditions, so
an organisation can require "managed device" for `destructive` approvals.

**Acceptance** — A session presented from an unknown device is challenged; a policy condition on device
posture denies correctly when the signal is missing (deny on absent, not allow).

**Test** — Device-binding test; posture-condition test with the signal deliberately omitted.

**Depends on** — Enterprise contract; MDM integration.

---

### 18 · Privileged access management

**Requirement** — No standing production access; just-in-time elevation; break-glass with full audit.

**Component** — Cloud IAM; admin console; break-glass procedure; audit store.

**Control** — Engineers have no standing write access to production data. Access is requested, approved
by a second person, time-boxed (max 4 h), and every query is logged with the actor's justification.
Break-glass is a separate, deliberately awkward path: it requires two approvers, opens a dedicated
audit channel, pages the security owner, and produces a mandatory post-incident review — even when
nothing went wrong.

**Acceptance** — A production data query by an engineer without an active elevation is refused; every
elevation has an approver, a duration and a justification; break-glass use is reviewed within 24 h.

**Test** — Quarterly access review; an attempted unauthorised query must fail; break-glass drill twice
a year.

**Depends on** — Cloud IAM; on-call; audit store.

**Honest note** — The break-glass path must be *slightly* painful. A frictionless emergency path
becomes the normal path within a quarter.

---

## 3. Cross-cutting schedules

**Audit retention** — 12 months hot, 24 months cold, then deletion. Audit records are append-only and
hash-chained; a break in the chain is itself an alert.

**Key rotation**

| Key | Interval | Trigger for early rotation |
|---|---|---|
| Platform | 12 months | Suspected exposure |
| Tenant | On demand | Workspace key reset, member removal at Owner level |
| Session | 90 days | Incident |
| Signing (approval tokens, webhooks) | 6 months | Incident, staff departure |

**Break-glass** — Two approvers, 4 h maximum, dedicated audit channel, security-owner page, mandatory
review. Tested twice a year, and the test is announced to nobody.

---

## 4. Realistic phasing

**Before the first paying tenant (MVP):** 1, 2, 3, 5, 6, 7, 10, 11, 12, 15, 16 — plus the *process*
half of 8 (a written plan and a forensic-ready audit trail).

**Release 1:** 9 (evidence collection), 13 (privacy dashboard and DSAR), 14 (second region), 18
(break-glass and JIT elevation).

**Release 2:** 4 (SIEM export).

**Enterprise, on contract:** 4 (UEBA), 8 (forensic tooling), 14 (residency guarantees beyond the
launch region), 17 (device posture), 18 (PAM integration with the customer's IdP).

**What is explicitly not in MVP, and why that is defensible**

| Not in MVP | Why it can wait | What covers the gap |
|---|---|---|
| UEBA | Needs months of baseline; early output is noise that gets muted | Eight high-signal alert rules |
| Forensic imaging | A SaaS product needs reconstruction, not disk capture | Hash-chained audit trail, 12-month retention |
| Multi-region residency | Doubles infrastructure cost before a customer requires it | Single region, residency disclosed honestly |
| Device posture | Requires MDM integration per customer | Device-bound sessions and re-auth |
| Customer-managed keys (BYOK) | Contract-driven | Envelope encryption already supports the shape |

---

## 5. What this document does not claim

It does not claim certification, and it does not claim that eighteen domains are "done". It claims
that each has an owner, a control, an acceptance test, a phase, and a stated compensating control
where it is deferred. That is the difference between a security posture and a security slide.
