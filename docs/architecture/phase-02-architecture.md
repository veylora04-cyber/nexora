# NEXORA — Phase 02 technical architecture

**Status:** proposal for approval · Phase 02 preparation
**Scope:** the engineering architecture that turns the approved product design and the Master
Specification into something buildable.
**Not in scope:** application code, migrations, running services, real provider integrations.

---

## 0. How to read this document

The Master Specification (§13–§25) already fixes a great deal: modular monolith with DDD layering,
the base stack, multi-tenancy by `workspace_id`, RBAC+ABAC, AI Gateway, Agent/Workflow engines,
usage ledger, the security baseline. **None of that is re-opened here.** Re-proposing settled
decisions is how architecture documents waste a reviewer's time.

Three statuses are used, and they are not interchangeable:

| Status | Meaning |
|---|---|
| **[S]** | Stated in the Master Specification. This document only explains how it will be built. |
| **[D]** | **Design decision proposed here.** The specification leaves the detail open; this is a concrete recommendation that needs approval. |
| **[P]** | **Parameter.** Depends on market, contract, budget or law. Left configurable on purpose. |

Every section ends with the trade-off the decision buys, not just the decision.

---

## 1. The architectural stance in one page

```
┌──────────────────────────────────────────────────────────────────────┐
│  Browser                                                             │
│  Next.js (app router) · design tokens · server components by default │
└───────────────┬──────────────────────────────────────────────────────┘
                │ HTTPS · session cookie (HttpOnly) or OAuth bearer
┌───────────────▼──────────────────────────────────────────────────────┐
│  Edge / API Gateway                                                  │
│  TLS · WAF · rate limit · request id · authn hand-off                │
└───────────────┬──────────────────────────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────────────────────────┐
│  API (NestJS modular monolith)                                       │
│  ┌────────────┬────────────┬────────────┬────────────┬────────────┐  │
│  │ Identity   │ Workspace  │ AI Platform│ Agent      │ Knowledge  │  │
│  │ & Access   │ & Org      │            │ Engine     │ & Files    │  │
│  ├────────────┼────────────┼────────────┼────────────┼────────────┤  │
│  │ Workflow   │ API & Dev  │ Marketplace│ Billing &  │ Notification│ │
│  │ Engine     │ Platform   │            │ Entitlement│            │ │
│  └────────────┴────────────┴────────────┴────────────┴────────────┘  │
│  Policy Engine · Audit · Outbox · Tenant Context (cross-cutting)     │
└──┬──────────────┬──────────────┬──────────────┬──────────────────────┘
   │              │              │              │
┌──▼────┐   ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼──────┐
│Postgres│   │  Redis    │  │ S3-compat │  │ AI Gateway │──► providers
│+ RLS   │   │cache/queue│  │  storage  │  │ (egress)   │
└────────┘   └───────────┘  └───────────┘  └────────────┘
```

Three properties drive every decision below:

1. **Tenant isolation is a property of the request, not of the query.** A request carries a tenant
   context; every layer that touches data receives it. There is no code path where "which workspace"
   is inferred.
2. **The AI is a client of the platform, not a peer.** It calls the same authorised APIs a user
   could call, with the user's permissions, and stops at the same approval gates.
3. **Every irreversible action has a durable record before it happens.** Approval, billing, deletion
   and provider egress are recorded first, executed second.

---

## 2. Application architecture

**[S]** Modular monolith, one deployable API, workers as a separate process from the same codebase.

**[D-ARCH-01] Four deployables, one repository.**

| Deployable | Responsibility | Scaling unit |
|---|---|---|
| `web` | Next.js UI, server components, BFF calls to the API | stateless, CDN + node |
| `api` | HTTP surface, all modules, synchronous work | stateless, horizontal |
| `worker` | Outbox relay, workflow steps, agent runs, AI streaming jobs, email, webhooks | stateless, queue-driven |
| `scheduler` | Cron-like triggers, retention sweeps, usage roll-ups | single leader via Postgres advisory lock |

**Why.** Synchronous request latency and background throughput have different scaling curves and
different failure modes. Separating them at deploy time costs one Dockerfile; separating them later
costs a refactor. Keeping them in one repository keeps the module contracts honest.

**Alternatives considered.**
- *Single process for everything* — an AI streaming job or a 10-minute workflow step would compete
  with API latency; a memory leak in a worker takes the product down.
- *Full microservices now* — explicitly rejected by §13.1 of the specification, and correctly so:
  the domain boundaries are not yet proven by load.

**Security.** Worker and scheduler run with a distinct DB role that has no access to session tables.
Only `api` may mint tokens.

**Scalability.** `api` scales on CPU; `worker` scales on queue depth; `scheduler` is a singleton.
The first thing to extract into its own service will be the AI Gateway (§9), because its egress
pattern and cost profile are unlike anything else.

**Complexity.** Low-to-moderate. The cost is a shared codebase that must be disciplined about
module boundaries — enforced by lint rules (§4), not by good intentions.

---

## 3. Frontend architecture and component strategy

**[S]** Next.js + React, Tailwind, accessible primitives, RTL/LTR, light/dark, Persian first.

**[D-ARCH-02] The design system ships as a package, not as a stylesheet.**

```
packages/ui/
  tokens/            generated from design-preview/assets/tokens.css
  primitives/        Button, Field, Panel, Table, Drawer, … (Radix-based)
  patterns/          ApprovalCard, ContextInspector, EmptyState, ErrorState
  locale/            fa + en dictionaries, typed keys
```

**Why.** Phase 01 produced a working token layer and a component grammar. The fastest way to lose it
is to let product code copy-paste class names. A package with typed props makes the prototype's
rules — one signal colour, logical properties only, `Intl` for numbers — enforceable at build time.

**How the prototype maps to production.**

| Prototype | Production |
|---|---|
| `tokens.css` custom properties | same file, imported once; Tailwind theme reads the variables |
| `components.css` classes | `packages/ui/primitives`, same names, same states |
| `lang/*.js` dictionaries | same shape, compiled to typed keys, loaded per locale |
| `chrome.js` factories | layout components in `apps/web/app/(app)/layout.tsx` |
| `data-t` attributes | `t('key')` calls; the attribute survives only in tests |

**Server vs client.** Default to server components. Client components are limited to: the composer,
the command palette, the AI thread, tab strips, and anything holding optimistic state. This is not
ideology — it keeps the Persian dictionary out of the initial JS bundle, which matters on the
mobile connections this product will actually meet.

**RTL.** `dir` is set on `<html>` from the request locale, never toggled in the client. The token
layer already forces tracking to `0` and one extra type step for `[lang="fa"]`; that logic moves
unchanged.

**Alternatives considered.** A component library bought off the shelf (loses the signal-colour and
approval-card grammar, which are product-specific); CSS-in-JS (runtime cost, worse for RTL
pseudo-elements).

**Security.** No secret ever reaches the client. The Personal AI key is written once and never read
back — the form only ever shows the last four characters, which the API returns as a separate field.

**Complexity.** Moderate. The main cost is discipline: every new component must land in `packages/ui`
with its states, or the reference page and the product diverge — which is exactly the failure the
Phase 01 reference page exists to prevent.

---

## 4. Backend architecture and module boundaries

**[S]** Ten domain modules + cross-cutting platform capabilities, four layers each
(`domain/ application/ infrastructure/ presentation/`).

**[D-ARCH-03] Module communication rules, made mechanical.**

| Allowed | Forbidden |
|---|---|
| Module A calls Module B's *application* port | A imports B's Prisma model or repository |
| A subscribes to B's domain events | A reads B's tables in a query |
| Shared kernel: ids, money, time, result types | Shared "utils" that know about a domain |

Enforcement:
- ESLint `no-restricted-imports` with a per-module allowlist, generated from the module map.
- A CI check that fails when `domain/` imports anything from `infrastructure/` or a framework.
- One `schema.prisma` file per module, merged at build; a table may only be written by its owner.

**Why.** The specification's promise — that any module can be extracted into a service later — is
only true if no module can reach into another's data. Boundary rules that live in a wiki are
boundary rules that will be broken in the third sprint.

**Alternatives considered.** Separate schemas per module in Postgres (stronger, but complicates
migrations and cross-module reporting); a shared "core" package (becomes a dumping ground within
months).

**Security.** Because cross-module reads are impossible, a compromised or buggy module cannot leak
another domain's rows. This is defence in depth on top of RLS.

**Scalability.** Each module's hot paths are visible in traces by module tag, so extraction
decisions are made on data rather than opinion.

**Complexity.** Moderate up front, low afterwards. The lint configuration is a day's work and saves
a quarter of archaeology.

---

## 5. Data architecture and tenant isolation

**[S]** Shared PostgreSQL, `workspace_id` on every multi-tenant table, RLS as second line of defence,
tenant-scoped cache keys, object paths, search documents, queue payloads and audit events.

**[D-ARCH-04] Tenant context is set per transaction, and RLS is not optional.**

```sql
-- every multi-tenant table
workspace_id uuid not null references workspaces(id),
-- policy, applied by migration to every such table
create policy tenant_isolation on <table>
  using (workspace_id = current_setting('app.workspace_id')::uuid);
```

The application sets the context at the start of the transaction:

```sql
set local app.workspace_id = '…';
set local app.user_id      = '…';
set local app.request_id   = '…';
```

**Why `set local`.** It is transaction-scoped, so a pooled connection cannot leak the previous
tenant's context into the next request. A session-level `SET` would be a cross-tenant data breach
waiting for a connection-pool bug.

**Why RLS at all, given the application already filters.** Because the failure mode is asymmetric:
one forgotten `where` clause is a breach, and RLS turns it into an empty result set. The cost is a
small query-planning overhead on indexed predicates.

**Connection roles.**

| Role | Used by | Rights |
|---|---|---|
| `nx_app` | api | DML on module tables, no DDL, RLS enforced |
| `nx_worker` | worker | DML on job/outbox/usage tables, no session tables |
| `nx_migrator` | CI only | DDL, bypasses RLS |
| `nx_readonly` | analytics | read-only views, no PII columns |

**[D-ARCH-05] Identifier strategy.** UUIDv7 for all primary keys (time-ordered, index-friendly,
non-enumerable). Human-facing references use a separate short code so that no URL exposes a
guessable sequence. IDs are never authorisation — the specification is explicit, and RLS is the
mechanism that makes that true.

**[D-ARCH-06] Soft delete and retention.** `deleted_at` on user-facing entities; hard deletion is a
job, not a cascade, because it must also reach S3 objects, search documents, caches, queue payloads
and provider-side conversation state. A `deletion_jobs` table records each target and its outcome,
so "deleted" is a verifiable claim rather than a promise.

**Alternatives considered.** Schema-per-tenant (thousands of schemas, migration storms, no shared
reporting); database-per-tenant (correct for a handful of enterprise customers, wrong as a default
— kept as the future dedicated-deployment path the specification already anticipates).

**Scalability.** Single-cluster shared schema carries the MVP comfortably; the read path is the
first thing to split (replicas for search and reporting), then large tenants move to dedicated
infrastructure.

**Complexity.** Moderate. RLS policies are generated by migration, so a new table cannot be added
without one.

---

## 6. Authentication and authorization

**[S]** Keycloak as the initial IdP over OIDC; email/password, Google/GitHub/Microsoft, OTP, TOTP,
WebAuthn/Passkey, organisational SSO; short-lived access tokens, rotating refresh tokens, HttpOnly
cookies; step-up authentication for sensitive operations.

**[D-ARCH-07] Keycloak owns credentials; NEXORA owns permissions.**

| Concern | Owner |
|---|---|
| Password hashing, MFA factors, passkeys, federated identity, SSO sessions | Keycloak |
| User profile, workspace membership, roles, permissions, policy | NEXORA (`Identity & Access`, `Workspace`) |
| Token issuance | Keycloak |
| Token *interpretation* and authorisation | NEXORA Policy Engine |

**Why.** An IdP that also owns authorisation becomes impossible to reason about, and a product that
owns credentials takes on a liability it does not need. Keeping the split means an organisation can
bring SAML later without touching a single permission check.

**Token shape.** Access token: 10 minutes, `sub`, `sid`, `workspace_id` (the *active* one), `amr`.
Refresh: 30 days, rotating, revocable, bound to a device record. The active workspace is a claim so
that a stolen token cannot be replayed against another tenant by editing a header.

**[D-ARCH-08] Authorisation is a single policy call, evaluated in the API.**

```ts
await policy.require(ctx, 'workspace.member.invite', { workspaceId, resource });
```

- RBAC supplies the role bundle; ABAC adds conditions (resource owner, data classification, device
  posture, organisation policy).
- Default deny. Parent policy (organisation) can only tighten, never loosen, a child (workspace).
- The result carries a *reason*, so the UI can explain a disabled button instead of just disabling
  it — this is what the role matrix in the design is for.

**Why a central engine rather than guards per module.** The specification requires it (§8.2.5), and
the practical reason is auditability: one place to log "who was denied what, and why".

**Alternatives considered.** Casbin/OPA as an external PDP. Both are reasonable; the decision here is
to keep the first version in-process behind a port, so swapping in OPA later is an adapter, not a
rewrite. **[P]** If policy volume or organisational policy authoring grows, OPA becomes attractive.

**Security.** Every token is checked for: signature, expiry, `sid` liveness, device revocation,
workspace membership still valid. Step-up (`acr`/`amr` freshness) is required for email change, MFA
disable, passkey addition, payment method change, workspace deletion and ownership transfer.

**Complexity.** Moderate. The hard part is not the check; it is the inventory of permissions and the
matrix behind them — which the design already renders as a reviewable grid.

---

## 7. Workspace and organisation hierarchy

**[S]** User → (many) Memberships → Workspace (Personal / Team / Organization) → Resources.
Organization owns policy; workspace owns collaboration, configuration and usage.

**[D-ARCH-09] Three levels, one active context, no silent switching.**

- A request always carries exactly one `workspace_id`. There is no "all workspaces" query outside
  analytics.
- Switching workspace re-issues the session's active-workspace claim and invalidates client caches
  keyed by the previous one. The UI already treats this as a hard context switch; the backend must
  agree.
- Personal workspaces are never governed by an organisation policy. The specification is explicit,
  and it is the one place where "organisation can tighten" does not apply.

**Lifecycle** (from §16.4): `created → active → restricted → deletion_pending → deleted`.
`restricted` is the state that makes billing failures survivable: read access continues, writes and
AI calls stop, nothing is deleted.

**Ownership transfer** requires: step-up auth, a named successor who accepts, an audit event, and a
cooling-off window during which the previous owner can cancel. **[D]** The window is 72 hours by
default — long enough to catch an account takeover, short enough not to block a real handover.

---

## 8. Central AI and Personal AI: the provider abstraction

**[S]** Two independent routes; both go through the AI Gateway; Personal keys are server-side only,
envelope-encrypted; fallback only with explicit prior permission; fail-closed by default.

**[D-ARCH-10] One interface, two credentials, one metering path.**

```ts
interface ProviderAdapter {
  readonly id: string;                       // 'openai', 'anthropic', 'custom'
  capabilities(): ModelCapabilities;         // context, tools, vision, streaming
  chat(req: ChatRequest, signal: AbortSignal): AsyncIterable<ChatChunk>;
  embed?(req: EmbedRequest): Promise<EmbedResponse>;
  countTokens(text: string): number;         // best-effort, used for pre-flight budget
}
```

Adapters normalise: message shape, tool-call format, streaming deltas, usage accounting, error
taxonomy, and rate-limit headers. Nothing above the adapter may branch on provider name.

**Error taxonomy** — this is the part that decides what the user sees, so it is designed, not
inherited:

| Class | Example | Product behaviour |
|---|---|---|
| `auth` | 401 invalid key | fail-closed, point at connection settings |
| `rate_limit` | 429 + reset | wait or offer the other route; never silent retry loops |
| `timeout` | no first token in 45 s | cancel, no charge, offer retry |
| `context_overflow` | prompt too long | offer trimming, never truncate silently |
| `provider_down` | 5xx / circuit open | fail-closed unless fallback is explicitly allowed |
| `policy_blocked` | content policy | surface as-is, do not paraphrase |

These map one-to-one onto the five failure states now drawn in the prototype.

**[D-ARCH-11] Personal key lifecycle.**

```
create → encrypt (KMS data key per workspace) → store ciphertext + key id
       → test connection → active
       → rotate (new ciphertext, old key retired) → revoke (ciphertext destroyed)
```

- Envelope encryption: a per-workspace data key, wrapped by the KMS master key. Rotation rewraps the
  data key, so no re-encryption of stored content is needed — the specification asks for exactly this.
- The plaintext key exists only inside the Gateway process, only for the duration of a request.
- Logging filters drop any header matching `authorization`, `x-api-key`, `api-key` before the log
  line is constructed, not after.
- Base URL validation blocks loopback, link-local, private ranges, metadata endpoints; resolves DNS
  and re-checks the resolved IP to defeat rebinding; enforces an egress allowlist for custom hosts.

**[D-ARCH-12] Fallback is a state machine, not a boolean.**

```
Personal ──failure──► BLOCKED ──user consent──► Central (this session only)
                        │
                        └──workspace policy denies──► BLOCKED (no route)
```

Consent is per-session by default, and per-workspace only if the user explicitly says so. The
decision is written to the audit log with the reason, because "why did my private prompt reach the
platform provider" must always have an answer.

**Alternatives considered.** A single aggregated provider SDK (loses the ability to model failure
classes precisely); client-side key storage (unacceptable — the specification forbids it).

**Scalability.** The Gateway is the first candidate for extraction: it is the only component with
long-lived connections, external latency and per-provider circuit breakers.

**Complexity.** Moderate-high. It is the component where most of the product's trust is stored.

---

## 9. AI Gateway, tool permissions and the approval workflow

**[S]** No direct provider access from the frontend or an agent; tool calls are risk-classified;
write-sensitive and destructive actions require human approval; a model answer is never permission.

**[D-ARCH-13] The approval gate is a persisted state machine.**

```
proposed ──approve──► approved ──execute──► executed
   │                    │                     │
   ├──deny──► denied    └──expire──► expired  └──fail──► failed
   └──expire──► expired
```

Every transition writes a row containing: tool name, canonical arguments hash, the actor who
approved, the *policy snapshot* used, the agent version, the workspace, the correlation id, and the
expiry. Approval is bound to the exact arguments — a changed argument set invalidates the approval.

**Why persisted rather than in-memory.** The card in the UI says "no outbound request is sent until
you approve". That claim has to survive a worker restart, a deploy, and a user who comes back the
next morning. An in-memory gate cannot.

**Risk classification** (drives whether approval is required at all):

| Class | Examples | Gate |
|---|---|---|
| `read_internal` | search workspace, read a file | policy only |
| `read_external` | web search, fetch URL | policy + egress rules |
| `write_internal` | create task, update record | approval if scope > N records |
| `write_external` | send email, post to a third party | always approval |
| `destructive` | delete, revoke, transfer | always approval + step-up |

**[D-ARCH-14] Tool execution is isolated.** Plugin and user-authored tools run in a sandbox with no
filesystem, no network except declared endpoints, a CPU/memory/time budget, and no ambient
credentials. The specification forbids running untrusted code in the API process; this is how that
is honoured without inventing a second runtime for the MVP — a container-per-invocation runner with a
warm pool.

**Prompt-injection posture.** Retrieved content and tool output enter the context tagged with a
trust level and are never concatenated into the system instruction. The model may *propose* an
action; the Policy Engine decides whether it is allowed, and the approval gate decides whether it
happens. A model cannot widen its own permissions because permissions are not expressed to it as
data it can edit.

**Complexity.** High. This is the highest-risk area of the product and should be built by whoever
owns security, not by whoever is free.

---

## 10. API and webhook architecture

**[S]** REST with `/v1`, OpenAPI contract, OAuth 2.1/OIDC for apps, API keys for machines, HMAC-signed
webhooks with retry and replay protection, transactional outbox, standard event envelope.

**[D-ARCH-15] Contract-first, generated, and checked in CI.**

```
packages/contracts/openapi.yaml  →  server types (NestJS)  →  client SDK (TS)
                                 →  contract tests (both directions)
```

A breaking change fails CI unless it lands under a new major version. Additive changes are allowed
in minor versions. Deprecation requires a `Sunset` header and a published end-of-support date.

**Idempotency.** Every mutating endpoint accepts `Idempotency-Key`; the response is stored for 24
hours keyed by `(workspace, key)`. This is not a nicety — retries are guaranteed by the network.

**Webhooks.** Delivery is at-least-once, ordered only within an aggregate. Signature covers
`timestamp.body`; timestamps older than 5 minutes are rejected. Retries: 8 attempts over ~24 hours
with exponential backoff and jitter, then a dead-letter queue with manual redelivery from the
developer portal. A webhook that fails 100 consecutive times is disabled and the owner is notified.

**Event envelope** (§19): `event_id`, `event_type`, `occurred_at`, `workspace_id`, `actor_id`,
`correlation_id`, `schema_version`, `payload`. Consumers must be idempotent; the envelope carries
enough to make that possible.

**Alternatives considered.** GraphQL (premature; the SDK story and the partner-integration story
both favour REST+OpenAPI for v1); gRPC externally (no browser story).

---

## 11. Billing, usage metering and quotas

**[S]** Hybrid model; entitlements separate from billing; the usage ledger is the source of truth;
hard limits separate from soft alerts; append-only ledger with adjustment events.

**[D-ARCH-16] Meter first, bill later, and never estimate silently.**

```
provider response ──► usage_event (raw, immutable)
                        │
                        ├─► usage_ledger (append-only, priced)
                        ├─► quota counters (Redis, fast path)
                        └─► budget alarms (soft 80%, hard 100%)
```

- `usage_event` records provider, model, input/output tokens, computed cost, currency, user,
  workspace, agent/workflow, correlation id, and the price table version used.
- Corrections are new `adjustment` rows. Nothing is ever updated in place — an invoice must be
  reproducible from the ledger alone.
- Quota checks happen **before** the call, using a fast Redis counter; the authoritative number is
  the ledger. If the two disagree, the ledger wins and the counter is rebuilt.

**Why a price-table version.** Provider prices change. An invoice from March must remain explainable
in July, which is impossible if cost is computed from today's table.

**[P]** Prices, plan names, tax, currency and payment provider remain parameters. The architecture
only requires: an adapter per payment provider, idempotent webhook handling, and a reconciliation
job that compares the provider's settlement file with the ledger.

---

## 12. Files and knowledge

**[S]** Upload validation, malware scanning, versioning, per-workspace encryption, short-lived
download links, quarantine before AI ingestion.

**[D-ARCH-17] A file is not "uploaded" until it is scanned.**

```
request → presigned PUT → object in quarantine/ → scan (AV + type sniff)
   → clean: move to workspace/ prefix, emit file.clean
   → infected: keep in quarantine, emit file.infected, notify, never index
```

- Object keys are `ws/{workspace_id}/{file_id}/{version}`, so a bucket policy can be scoped by
  prefix and a cross-workspace read is structurally impossible.
- Downloads are signed URLs valid for 5 minutes, bound to the requesting user's session.
- Text extraction and embedding happen only after `file.clean`; the AI layer has no path to a
  quarantined object.

**[D-ARCH-18] Retrieval is permission-filtered before it is ranked.** The vector query carries
`workspace_id` and the caller's accessible-resource set; pgvector's `WHERE` clause runs before
similarity ordering. Ranking first and filtering later is how a search feature leaks the existence
of documents.

**Scaling note.** pgvector is right for the MVP (metadata and vectors live together, one transaction,
one backup). It stops being right somewhere around tens of millions of chunks; the port that hides
it means moving to a dedicated vector store is an adapter change, not a rewrite.

---

## 13. Security: encryption, audit and secrets

**[S]** TLS 1.2+ (prefer 1.3), encryption at rest, KMS with rotation, Argon2id, mandatory MFA for
administrative accounts, step-up for sensitive actions, immutable audit log, four data
classification levels, secrets never in environment files or logs.

**[D-ARCH-19] Three key classes, three lifetimes.**

| Key | Scope | Rotation | Storage |
|---|---|---|---|
| Master key | platform | yearly, or on incident | KMS/HSM |
| Workspace data key | one workspace | on demand, rewrap only | KMS-wrapped, in DB |
| Field key | provider credentials, tokens | per secret | derived, never stored |

**Audit.** One append-only table plus an export stream. Every row: actor, action, target, workspace,
result, reason, IP, user agent, request id, and a hash chain to the previous row for tamper evidence.
Audit writes happen in the same transaction as the change they describe, so there is no window where
an action exists without its record.

**Secrets.** Application secrets live in a secret manager and are injected at runtime. The build
fails if a file matching known credential patterns is committed; the CI runs a secret scanner on
every push, not only on the default branch.

**Threat model coverage** (§21.1): CSRF (double-submit + SameSite), XSS (CSP with nonces, no
`innerHTML` on user content), SSRF (egress allowlist + DNS re-check), SQL injection (parameterised
queries only), IDOR/BOLA (RLS + explicit ownership checks), replay (nonce/timestamp on webhooks and
signed URLs), brute force (per-account and per-IP limiters with progressive delay).

---

## 14. Background jobs and event processing

**[S]** Transactional outbox, idempotent consumers, BullMQ on Redis for the MVP.

**[D-ARCH-20] Outbox for correctness, Redis for throughput.**

```
tx: { business write + outbox row }  ──commit──►  relay ──► queue ──► handler
```

- The relay polls the outbox with `FOR UPDATE SKIP LOCKED`, publishes, marks sent. If publishing
  fails, the row stays; nothing is lost between commit and publish.
- Handlers are idempotent by `(event_id, handler)` in a processed-events table. At-least-once
  delivery is assumed everywhere.
- Retry policy per job class: transient errors exponential, permanent errors dead-letter immediately.
- Poison messages go to a DLQ with the original payload and the failure reason; the DLQ has an
  owner and an alert, because an unmonitored DLQ is just a quieter outage.

**Why Redis/BullMQ and not Kafka.** At MVP volume, a log-based broker is operational weight without
a matching benefit. The outbox means the *contract* is broker-agnostic; swapping the transport later
does not touch business code.

---

## 15. Observability, logging and monitoring

**[S]** OpenTelemetry, metrics/logs/traces, SLOs, sensitive data masked.

**[D-ARCH-21] Three signals, one correlation id, and a hard rule about PII.**

- **Traces**: every request and every job. Span attributes include `workspace_id`, `module`,
  `operation`, and for AI calls `provider`, `model`, `token counts` — never prompt text.
- **Metrics**: RED for HTTP, USE for infrastructure, plus product metrics (approvals pending,
  fallbacks taken, quota rejections).
- **Logs**: structured JSON, one line per event, with `request_id` and `correlation_id`.

**PII rule.** Prompts, responses, file contents, emails and names are never logged. The logging
layer redacts by key allowlist rather than blocklist — a new field is invisible until someone
deliberately adds it.

**Initial SLOs** (from §21.2, treated as design targets, not promises): 99.5% monthly availability
for the MVP core; p95 read API under 500 ms excluding provider time; error budget burn alerts at 2%
and 10%.

---

## 16. Backup, disaster recovery and deployment

**[S]** Automated, incremental, multi-version, immutable, multi-region; RPO ≤ 24 h and RTO ≤ 8 h at
MVP, tightening later; quarterly restore tests.

**[D-ARCH-22] Restore is a rehearsed procedure, not a hope.**

- Postgres: continuous WAL archiving + daily base backup; point-in-time recovery to any second in
  the retention window.
- Object storage: versioning + cross-region replication; delete markers protected.
- Backups are encrypted with a key that the production account cannot read — ransomware protection
  is mostly about credential separation.
- A monthly automated restore into a scratch environment, with a smoke test that asserts row counts
  and a known query result. A backup that has never been restored is a hypothesis.

**Deployment.** Container images, immutable tags, signed; IaC for every environment; blue/green for
the API with a migration gate that runs expand-then-contract (add column → backfill → switch reads →
drop), so no deploy requires downtime and no rollback requires a data restore.

---

## 17. Testing strategy and CI/CD

**[S]** Test pyramid; contract tests; security tests for IDOR, tenant escape, privilege escalation,
SSRF, prompt injection, secret leakage; Definition of Done in §22.2.

**[D-ARCH-23] The tests that must exist before the first customer, in priority order.**

| Test | Why it is non-negotiable |
|---|---|
| Tenant isolation (API + DB + cache + search + queue + storage) | A single escape ends the company |
| Authorisation matrix (role × capability × resource state) | The design publishes this matrix; the code must match it |
| Approval gate state machine | The product's central promise |
| Usage ledger reconciliation | Money must be reproducible |
| Contract tests (OpenAPI + events) | Prevents silent breakage of the SDK and webhooks |
| Restore drill | Proves the backup claim |

Coverage targets are a poor proxy; these six suites are the actual gate.

**CI pipeline:** lint → typecheck → unit → integration (with a real Postgres) → contract →
tenant-isolation suite → SAST → dependency and license scan → secret scan → container scan → SBOM →
sign → deploy to staging → smoke → promote. Main is protected; nothing merges on a red build.

---

## 18. Environments and configuration

| Environment | Data | Access | Purpose |
|---|---|---|---|
| local | seeded, synthetic | developer | fast loop |
| preview (per PR) | synthetic | team | review |
| staging | synthetic, production-shaped | team + QA | release candidate |
| production | real | break-glass only | customers |

**Configuration.** Typed, validated at boot, fail-fast. No environment variable is read outside the
config module. Feature flags gate every risky path and are removed after the rollout completes —
a flag that lives forever is a second codebase.

**Rule from §21.4:** non-production environments never contain real customer data. This is a
constraint on tooling (anonymised snapshots), not a policy on slides.

---

## 19. New decisions this document proposes

These are **[D]** — they need approval and are not implied by the specification.

| # | Decision | Reversible? |
|---|---|---|
| D-ARCH-01 | Four deployables (web/api/worker/scheduler) from one monorepo | yes, merge worker into api |
| D-ARCH-02 | Design system as a versioned package, tokens generated from Phase 01 | yes, costly |
| D-ARCH-03 | Module boundaries enforced by lint + CI, not convention | yes |
| D-ARCH-04 | `set local` tenant context + generated RLS policy per table | yes, but this is the safety net |
| D-ARCH-05 | UUIDv7 primary keys + separate human-facing references | no (migration is painful) |
| D-ARCH-06 | Deletion as a tracked job across every store | yes |
| D-ARCH-07 | Keycloak owns credentials, NEXORA owns permissions | yes, at cost |
| D-ARCH-08 | Single in-process policy engine behind a port (OPA later) | yes |
| D-ARCH-09 | One active workspace per request; switch is a hard context change | no |
| D-ARCH-10 | Provider adapter with a fixed error taxonomy | yes |
| D-ARCH-11 | Envelope encryption per workspace, rewrap-only rotation | no |
| D-ARCH-12 | Fallback as an explicit state machine with recorded consent | yes |
| D-ARCH-13 | Approval gate persisted with argument hash and policy snapshot | no |
| D-ARCH-14 | Sandboxed tool execution with a warm container pool | yes |
| D-ARCH-15 | Contract-first OpenAPI with generated SDK and CI break detection | yes |
| D-ARCH-16 | Append-only ledger with versioned price tables | no |
| D-ARCH-17 | Quarantine-before-index for every file | no |
| D-ARCH-18 | Permission filter before vector ranking | no |
| D-ARCH-19 | Three key classes with separate rotation | partly |
| D-ARCH-20 | Outbox for correctness, Redis for transport | yes (broker swap) |
| D-ARCH-21 | Allowlist-based log redaction | yes |
| D-ARCH-22 | Monthly automated restore drill with assertions | yes |
| D-ARCH-23 | Six mandatory test suites as the release gate | yes |

## 20. What this document deliberately does not decide

- Cloud provider, region, and the residency map — **[P]**, contract and law dependent.
- Which AI providers ship at launch and at what price — **[P]**.
- Plan names, prices, tax, payment provider, marketplace commission — **[P]**.
- Whether the first release includes a free tier with AI — **[P]**.
- Exact SLO commitments and contractual RPO/RTO — **[P]**, must be validated against real
  infrastructure cost before being promised to a customer.
- Kubernetes: not now. The specification's position — containers first, orchestration when there is
  evidence — is the right one, and adopting it early would buy operational burden without benefit.

---

## 21. Suggested build order

1. **Skeleton that proves the boundaries.** Monorepo, CI, one module end-to-end (Workspace), RLS,
   tenant context, audit, outbox. Nothing else. This is the phase where the architecture is either
   real or decorative.
2. **Identity and membership.** Keycloak integration, invitations, role matrix, policy engine.
3. **AI Gateway with one provider.** Central AI only, usage ledger, quotas, the five failure states.
4. **Agent + approval gate.** One tool, full state machine, audit.
5. **Knowledge & Files.** Upload → quarantine → scan → index → retrieval with permission filtering.
6. **Billing and entitlements.** Plans, subscriptions, hard/soft limits.
7. **Public API and webhooks.** Contract-first, SDK, developer portal skeleton.
8. **Enterprise controls.** SSO, SCIM, BYOK, residency, dedicated deployment.

Each step ends with its security tests green. The order is chosen so that the riskiest promises —
tenant isolation, approval, money — are proven early, while they are still cheap to change.
