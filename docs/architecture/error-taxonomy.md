# NEXORA — AI error taxonomy and UI mapping

One table that the backend, the API contract, the logs and the interface all read from. It exists
because the alternative — each layer inventing its own vocabulary — produces the failure mode where
the API returns `500 upstream_error`, the UI says "Something went wrong", and the user retries an
operation that will never succeed.

**Rules that apply to every entry**

1. **Stable code.** The code is part of the public API contract. It may be added to, never renamed,
   without a major version.
2. **One message per code per locale.** The user message is written by the product, never passed
   through from a provider.
3. **Nothing internal crosses the boundary.** No provider payload, no stack trace, no key fragment,
   no upstream hostname, no request id that is not ours. The client receives `code`, `message`,
   `retryable`, `retry_after_ms`, `recovery_action`, and `incident_id`.
4. **Every error is a metric.** Each code is a counter with a provider and workspace label, and a
   sample of the redacted payload goes to the trace.
5. **Retry is a decision, not a reflex.** `retryable` is computed server-side from the category, and
   the UI is not allowed to retry anything the server marked non-retryable.

---

## 1. The eight categories

| Code | Category | HTTP | Retryable | `retry_after_ms` | UI surface |
|---|---|---|---|---|---|
| `AI_RATE_LIMITED` | Rate limit | 429 | Yes, with backoff | From the provider, capped at 30 s | Full state card, thread preserved |
| `AI_TIMEOUT` | Timeout | 504 | Yes, once automatically | 2 s | Full state card, partial output kept |
| `AI_PARTIAL_FAILURE` | Partial failure | 207 | No — partial is a result | — | Inline notice above the delivered part |
| `AI_PROVIDER_UNAVAILABLE` | Provider disconnection | 503 | Yes, manual | 10 s | Full state card, fail-closed note |
| `AI_INVALID_CREDENTIAL` | Invalid API key | 401 | **No** | — | Full state card with a fix action |
| `AI_QUOTA_EXHAUSTED` | Insufficient credits or quota | 402 | **No** | Until the next period | Full state card with a fix action |
| `TOOL_EXECUTION_FAILED` | Tool execution failure | 422 | Per tool policy | — | Inline on the tool card |
| `AI_CONTEXT_OVERFLOW` | Context overflow | 413 | **No** — needs a different request | — | Inline, with a trim action |

Two properties are deliberate and worth stating:

- **402 and 401 are never retryable.** A retry of an exhausted quota or a revoked key is a request
  that cannot succeed, and retrying it is how a UI teaches users that the product is broken.
- **207 for partial failure.** A partial result is a success with a caveat, not an error with a
  result. Modelling it as `200` plus a flag is the alternative, and it loses the distinction at the
  transport layer where proxies and SDKs look first.

---

## 2. Each category, in full

### `AI_RATE_LIMITED` — 429

| | |
|---|---|
| **Cause** | The provider's requests-per-minute or tokens-per-minute limit was hit, or our own per-workspace ceiling was. |
| **Message (en)** | The provider is rate-limiting this workspace. Requests resume automatically. |
| **Message (fa)** | ارائه‌دهنده در حال محدودکردن این فضای کاری است. درخواست‌ها به‌طور خودکار از سر گرفته می‌شوند. |
| **Retry policy** | Automatic, exponential backoff with jitter, max 3 attempts, honouring `Retry-After`. |
| **Recovery action** | `wait` — no button that lies. If the wait exceeds 30 s, offer *Try a different model*. |
| **Logging** | `warn`, with provider, model, limit kind (rpm/tpm), and the reset window. Alert if a workspace sustains > 5 min of 429s. |
| **UI** | Full state card. The thread and the typed prompt are preserved. |

### `AI_TIMEOUT` — 504

| | |
|---|---|
| **Cause** | No first token within the connect budget, or the stream stalled past the idle budget. |
| **Message (en)** | The provider did not respond in time. Partial output has been kept. |
| **Message (fa)** | ارائه‌دهنده در زمان مقرر پاسخ نداد. خروجی ناقص حفظ شده است. |
| **Retry policy** | One automatic retry on a different connection; then manual only. |
| **Recovery action** | `retry` — re-sends the same request. Never silently re-sends with different parameters. |
| **Logging** | `warn`, with time-to-first-token, bytes received, and the idle budget that fired. |
| **UI** | Full state card, with whatever streamed so far still above it. |

### `AI_PARTIAL_FAILURE` — 207

| | |
|---|---|
| **Cause** | The answer completed but a step did not: a tool returned an error, a retrieval source failed, one of several parallel calls failed. |
| **Message (en)** | The answer is complete, but one step failed: {step}. |
| **Message (fa)** | پاسخ کامل است، اما یک مرحله ناموفق بود: {step}. |
| **Retry policy** | None at the request level. The failed step may be retried individually. |
| **Recovery action** | `retry_step` — scoped to the step that failed, not the whole turn. |
| **Logging** | `info`, naming the failed step and its error code. Not an incident. |
| **UI** | Inline warning strip above the answer. The answer stays usable. |

### `AI_PROVIDER_UNAVAILABLE` — 503

| | |
|---|---|
| **Cause** | The provider is down, the circuit breaker is open, or the network path is blocked. |
| **Message (en)** | The AI provider is unreachable. Personal AI is set to stop rather than fall back. |
| **Message (fa)** | دسترسی به ارائه‌دهنده هوش مصنوعی ممکن نیست. هوش مصنوعی شخصی طوری تنظیم شده که به‌جای جایگزینی، متوقف شود. |
| **Retry policy** | Manual, with a 10 s suggestion. Circuit breaker probes in the background. |
| **Recovery action** | `retry`, plus `switch_model` when another provider is configured. |
| **Logging** | `error`, with the circuit state and the last successful call. Pages on sustained failure. |
| **UI** | Full state card. When Personal AI is in play, the fail-closed consequence is stated in place — not in a settings page. |

### `AI_INVALID_CREDENTIAL` — 401

| | |
|---|---|
| **Cause** | The Personal AI key was revoked, expired, or was pasted incorrectly. Central AI never produces this for a user. |
| **Message (en)** | This provider rejected the API key. Update the key to continue. |
| **Message (fa)** | ارائه‌دهنده این کلید API را نپذیرفت. برای ادامه کلید را به‌روزرسانی کنید. |
| **Retry policy** | **None.** Retrying a rejected credential is a lockout waiting to happen. |
| **Recovery action** | `update_key` — opens the Personal AI block with the key field focused. |
| **Logging** | `warn`, with the provider and the key's *label*, never the key, never a prefix of it, never its length. |
| **UI** | Full state card with the fix action as the primary button. The message says what to do, not what broke. |

### `AI_QUOTA_EXHAUSTED` — 402

| | |
|---|---|
| **Cause** | The workspace's monthly cap is reached, or the plan's included credits are spent. |
| **Message (en)** | This workspace has reached its monthly AI budget. It resets on {date}. |
| **Message (fa)** | این فضای کاری به سقف ماهانه هوش مصنوعی رسیده است. سقف در {date} بازنشانی می‌شود. |
| **Retry policy** | **None** until the period resets or the cap changes. |
| **Recovery action** | `raise_cap` for an Owner or Billing Manager; `request_cap` for anyone else. The role decides which button exists — the matrix already knows. |
| **Logging** | `info` on first occurrence per workspace per period; `warn` on every subsequent attempt, because repeated attempts mean the UI is not explaining itself. |
| **UI** | Full state card showing spend against cap, and the reset date. |

### `TOOL_EXECUTION_FAILED` — 422

| | |
|---|---|
| **Cause** | A tool ran and errored, timed out, or was denied by the sandbox. Distinct from `AI_PARTIAL_FAILURE`, which is about the turn. |
| **Message (en)** | The {tool} step failed: {reason}. Nothing further was sent. |
| **Message (fa)** | مرحله {tool} ناموفق بود: {reason}. چیز دیگری ارسال نشد. |
| **Retry policy** | Per tool policy. Destructive tools require a **new approval**, never a retry of the old one (§9.3). |
| **Recovery action** | `retry_tool` (new approval) or `skip_tool`. |
| **Logging** | `warn`, with tool name, version, sandbox exit code, and duration. Never the tool's raw output. |
| **UI** | Inline on the tool card, which already carries the approval state. |

### `AI_CONTEXT_OVERFLOW` — 413

| | |
|---|---|
| **Cause** | The assembled context exceeded the model's window after retrieval, history and attachments were added. |
| **Message (en)** | This request is larger than the model can hold. Trim the context to continue. |
| **Message (fa)** | این درخواست از ظرفیت مدل بیشتر است. برای ادامه زمینه را کاهش دهید. |
| **Retry policy** | **None** — the same request will fail identically. |
| **Recovery action** | `trim_context` — opens the context inspector with the largest contributors ranked. |
| **Logging** | `info`, with token counts by segment (system, history, retrieval, attachments) so the cause is visible without reproducing it. |
| **UI** | Inline, with the ranked contributors as the action. |

---

## 3. Mapping to the interface

The prototype renders five AI states. Eight categories need six surfaces, because two of them are not
full-page conditions:

| UI surface | States it covers | Where it appears |
|---|---|---|
| Full state card | rate limit, timeout, provider unavailable, invalid credential, quota exhausted | Replaces the thread body; the composer stays usable where retry is possible |
| Inline notice | partial failure | Above the delivered answer |
| Inline on tool card | tool execution failure | Inside the tool call that failed |
| Inline with action | context overflow | Above the composer, with the trim action |
| Normal | — | — |
| Empty | — | No sessions yet |

**What was missing before this revision.** The prototype drew rate limit, timeout, partial failure and
provider disconnection — four of eight. Invalid credential and quota exhaustion are now drawn as
their own cards, because they are the two errors where the user's next action is *not* "wait": one
needs a new key, the other needs a decision about money, and a generic "provider problem" card sends
them to the wrong place. Tool failure and context overflow are inline by design: they are about one
step or one request, not about the workspace.

---

## 4. What the client receives

```json
{
  "error": {
    "code": "AI_RATE_LIMITED",
    "message": "The provider is rate-limiting this workspace. Requests resume automatically.",
    "retryable": true,
    "retry_after_ms": 12000,
    "recovery_action": "wait",
    "incident_id": "01J8Z9K3V7QW4M2N6P8R0T5B1C"
  }
}
```

`incident_id` is ours, not the provider's. It is the only identifier a user can quote to support, and
it maps to a trace that contains the redacted upstream detail — which is how support can answer
"what happened" without the response ever containing an upstream payload.

**Never included:** `provider_response`, `stack`, `cause`, `api_key`, `base_url`, `upstream_status`,
`model_raw`, or any field the provider chose. A provider that echoes part of a key in an error
message must not be able to leak it through us; the adapter strips the message and keeps only the
code.

---

## 5. Monitoring

| Signal | Threshold | Response |
|---|---|---|
| `AI_PROVIDER_UNAVAILABLE` rate | > 5 % of calls for 5 min | Page on-call; circuit breaker should already be open |
| `AI_TIMEOUT` p95 | > 20 % of calls | Page; usually an egress or provider-region problem |
| `AI_RATE_LIMITED` sustained | One workspace > 5 min | Notify the workspace Owner; it is usually a runaway agent |
| `AI_INVALID_CREDENTIAL` | Any increase | Product issue, not user issue — it usually means a rotation shipped badly |
| `AI_QUOTA_EXHAUSTED` first-hit | Per workspace per period | Informational; a spike means the pricing model is wrong, not that users are abusing it |
| `TOOL_EXECUTION_FAILED` | > 2 % per tool | Alert the tool's owner; a tool that fails often trains users to approve blindly |

The last row is the one that matters most and is the one usually missing: **a high tool failure rate
degrades the approval gate**, because users learn that approving produces errors and stop reading the
card. It is a security metric wearing an availability costume.
