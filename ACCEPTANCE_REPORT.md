# ACCEPTANCE REPORT — Phase 01 refinement, architecture corrections, UI/UX upgrade

**Branch:** `phase-01-closure-phase-02-architecture`
**Branch tip:** `git log -1` on the branch. The table in §1 lists the commits that carry work; small
documentation corrections that follow them are visible in `git log`.
**Base:** `main` @ `056d0a8c98f22f7e74b2203345939ea989f2eb0c` — **not modified, not merged**
**Remote:** the branch has **unpushed commits** on top of
`origin/phase-01-closure-phase-02-architecture` (`e8cfcfa`). Push failed with
`could not read Username for 'https://github.com'`; no credential is available in this environment.
Nothing was force-pushed and no history was rewritten.

---

## 1. Commits

| SHA | Subject |
|---|---|
| `7953a51` | docs(architecture): propose the Phase 02 technical architecture |
| `4abb27f` | docs: reconcile the project record with the actual repository state |
| `e8cfcfa` | docs: correct three counts in the status file |
| `83c9586` | docs(architecture): resolve the auth contradiction, harden approval, trace security |
| `cd0a8e3` | docs: apply one decision-status vocabulary to every decision record |
| `dd330d0` | feat(ui): rebuild the dashboard hierarchy and the approval card |
| `d4958d2` | feat(ui): refine hierarchy, error surfaces and mobile behaviour |
| `d52f00a` | docs: record the refinement pass and reconcile four stale counts |
| `c45d8ef` | docs: the repository tracks 40 files, not 38 |
| `7fb2681` | fix(a11y): return focus to the drawer trigger on close |
| `a16a809` | docs: acceptance report and before/after evidence |
| `3ed84dd` | docs: the tree listing now shows the evidence directory and the report |
| `823fd1c` | docs: pin the report to the commit it describes |
| `f1b12ed` | docs: make the report's git facts drift-proof |

---

## 2. Architecture corrections

### A · Auth and token issuance — a real contradiction, resolved

The document said two different things. §2 said *"Only `api` may mint tokens"*; §6 said
*"Token issuance: Keycloak"*. Both were in the same file, forty lines apart.

Resolved by making Keycloak the sole identity-token issuer and the API a pure resource server. §6.1
now states the rule once, as four prohibitions, and §2 points at it instead of restating it. The
five artefacts are tabulated with who signs them, who consumes them, whether they carry identity, and
their lifetime:

| Artefact | Signed by | Consumed by | Carries identity? | Lifetime |
|---|---|---|---|---|
| ID token | Keycloak | BFF, once, at login | Yes | 5 min |
| Access token (JWT) | Keycloak | API | Yes — identity only, never authorisation | 10 min |
| Refresh token | Keycloak | BFF | No — opaque handle | 30 days, rotating |
| Browser session cookie | BFF | Browser → BFF | No — opaque pointer | 30 days |
| Approval token | API | Worker | No — bound to one approval id + hash | 5 min, single use |

**The workspace bypass was the deeper bug.** `workspace_id` was a claim in the access token, which
is why "switching workspace" appeared to require re-issuing a token — and why editing a claim would
have granted access. The claim is gone. Workspace is resolved per request from the `(sub,
workspace_id)` membership row, and `SET LOCAL app.workspace_id` is fed from that verified row, never
from a header or a claim.

Refresh rotation was also strengthened with reuse detection and family revocation, because rotation
on its own protects nothing: a stolen token that is used first simply wins the race.

### B · Approval and tool execution

Eleven bound facts, eight states (`pending`, `approved`, `rejected`, `expired`, `executing`,
`executed`, `failed`, `cancelled` — the same eight names in architecture, database, API and UI), and
an invalidation table with a reason code for each way an approval can stop being valid:
`argument_mismatch`, `superseded_agent_version`, `superseded_workflow_version`,
`approver_no_longer_entitled`, `policy_changed`, `workspace_restricted`, `ttl_expired`,
`target_removed`.

Three independent defences against duplicate execution, because one is never enough: a
compare-and-set claim on the approval row, a single-use execution token carrying the argument hash,
and an idempotency key at the destination.

### C · AI error states

Eight codes, each with a stable code, an HTTP status, a Persian and an English message, a retry
policy, a recovery action, a logging rule and a UI surface: `AI_RATE_LIMITED` 429, `AI_TIMEOUT` 504,
`AI_PARTIAL_FAILURE` 207, `AI_PROVIDER_UNAVAILABLE` 503, `AI_INVALID_CREDENTIAL` 401,
`AI_QUOTA_EXHAUSTED` 402, `TOOL_EXECUTION_FAILED` 422, `AI_CONTEXT_OVERFLOW` 413.

401 and 402 are never retryable, and the document says why: retrying a request that cannot succeed
is how a product teaches its users that it is broken. Provider responses and stack traces never
reach the client; the only identifier a user can quote is our own `incident_id`.

### D · Security traceability

All 18 domains from §8.2 of the specification, each with requirement, responsible component,
control, phase, acceptance criteria, testing strategy, dependencies and scope, in
`docs/architecture/security-traceability.md`. Incident response and forensics, SIEM/UEBA, PAM,
break-glass, device posture, data residency, privacy dashboard and DSAR, consent lifecycle, vendor
risk, encryption and key rotation, audit retention, backup and DR are all present.

**The document does not pretend everything is MVP.** It states plainly what is not in MVP and why
that is defensible, names the compensating control for each gap, and closes with a section titled
"What this document does not claim". Data residency is specified separately for databases, object
storage, backups, logs, analytics and AI providers, because those six fail independently.

### E · Decision governance

One vocabulary — `APPROVED`, `PROPOSED`, `REQUIRES_USER_DECISION`, `REJECTED` — applied to every
record in `DECISIONS.md`, `design-decisions.md`, `ux-architecture.md` and `decision-review.md`.

**Two misrepresentations were found and corrected:**

1. `DECISIONS.md` marked seven entries `[M]` — "approved after modification". Nothing was approved.
   All seven are now `[P]`.
2. Four closure-phase decisions were marked `[A]` — "approved in the specification" — although the
   specification says nothing about them. Also `[P]`.
3. `DESIGN_PROGRESS.md` said the review "approved" six proposals. It recommends six; a
   recommendation is not an approval, and the file now says so in those words.

---

## 3. UI/UX improvements

Before/after screenshots are in `docs/evidence/`. Each pair is the same page, same viewport
(1440×900), same locale and theme (Persian, dark), taken from `e8cfcfa` and from `HEAD`.

### Dashboard — `before-dashboard.png` / `after-dashboard.png`

The old layout was nine cards of equal weight: a usage panel, a "my workspaces" panel that duplicated
the rail, and a task list. Equal weight is a way of saying nothing matters.

The new layout opens with a context strip that states scope, policy, member count and provider
*before* any card, then splits into one primary column — **"Needs you"** — led by the approval that
is actually waiting, and a secondary column carrying live AI activity and usage against the hard
limit. The "my workspaces" panel was removed; the rail already does that job.

### AI workspace — `before-ai.png` / `after-ai.png`

**A real defect was found here.** In the delivered prototype the three context-inspector blocks had
escaped their `<aside>` and become flex children of the page column, so the conversation thread was
squeezed to 182 px at 1440 and the context blocks sprawled across the bottom of the page. It was
invisible to every earlier test because none of them measured the thread's width with a tall card
present. The screenshot shows it plainly.

The tool call, previously a one-line chip with an Approve button, is now an approval card
(`approval-390.png` shows it at 318 px wide with all six facts intact): what the tool is, where it
sends, what changes, the risk level, whether it can be undone, when it expires — then the argument
hash and the exact arguments behind a disclosure, then approve/decline, then the binding note. A
non-technical approver can read it top to bottom and know what they are agreeing to.

### Onboarding — `before-onboarding.png` / `after-onboarding.png`

Before: a step list with no progress, and cap, retention and fail-closed all expanded — a
configuration form dump. After: a progress hairline under the header and a compact counter that
replaces the step list below 640 px, both derived from the current view so they cannot disagree with
the screen; and one collapsed disclosure whose summary states the defaults it is hiding.

The hybrid onboarding approach was not changed.

### Workspace — `before-workspace.png` / `after-workspace.png`

The permission matrix had six kinds of cell in one colour and no explanation. A legend now names all
six, and it is no longer `aria-hidden` — a screen-reader user can read the same explanation a sighted
one can.

### AI failure states — `ai-state-quota.png`, `ai-state-toolfail.png`, `ai-state-context.png`

Three new surfaces. Quota is the only error whose recovery is a decision about money; tool failure is
the only one that arrives *after* an approval and has to make the spent approval obvious; context
overflow is the only one whose recovery is to move the thread rather than to retry.

### Mobile AI — `ai-390-after.png`

At 390 px five header triggers left the thread title about 30 px, so it wrapped one character per
line, and the composer's send button was clipped out of its own bar. Below 720 px the title takes its
own row; below 480 px the token counter drops out of the bar so both actions keep their place.

### Design system

The auth brand column and the overview hero are dark in both themes and carried eight repeated hex
literals between them. They now use four `--nx-inverse-*` tokens; saffron's ink is
`--nx-on-signal`. **No hex literal remains outside `tokens.css`.**

The `frontend-design` skill was available and was consulted. Its guidance on generic tells was
checked against this work: the uniform rounded-card kit was exactly the defect removed from the
dashboard; the middle-dot meta strings (`429 · provider limit`) were kept because here they encode
`code · qualifier` rather than decorate; the numbered step markers were kept because onboarding is a
sequence.

---

## 4. Responsive results

7 pages × 4 language/theme combinations × 7 widths (360, 390, 768, 1024, 1280, 1440, 1920) = **196
page loads**, each checking document overflow, every element's box against the viewport, console
errors, and translation coverage.

**0 overflowing documents. 0 offending elements. 0 console errors. 0 missing, partial or leaked
translation keys.**

Mobile-specific fixes were made at 390 and 360 and re-measured: thread title on its own row, composer
bar 0 px overflow, send button inside the composer at 360 and 390.

---

## 5. Accessibility results

| Check | Result |
|---|---|
| Accessible names on every `a[href]`, `button`, `input`, `select`, `textarea`, `[tabindex]` | 0 unnamed |
| Visible focus ring on every keyboard stop | 0 missing (only the `body` wrap-around has none) |
| Focus cannot land inside the closed mobile rail | 0 stops over 24 tabs at 390 px |
| Drawers move focus to the close button, and return it to the trigger on Escape or on the close button | Verified at 390 and 1200, both AI drawers, all three dismissal paths |
| Contrast, WCAG AA, computed foreground against nearest opaque background | Pass on all 7 pages in both themes, and on all 9 AI states at 1440 and 390 in both themes (72 checks) |
| Reduced motion | `prefers-reduced-motion` zeroes all three duration tokens |

---

## 6. Browser test results

Playwright (Chromium), real rendering — not source inspection.

- Nine AI states switched and measured at 1440, 768 and 390 in Persian and English: no clipping, no
  overflow, no console error.
- Approval card geometry: 504 px at 1440, 612 px at 768, 318 px at 390 — six facts, decision row and
  binding note present at all three.
- Onboarding: five views stepped through at 1440 and 390, progress bar width measured at 25 / 50 /
  75 / 100 %, counter text matched the view at every step, disclosure opened and closed with the
  chevron rotating correctly in RTL.
- Permission legend measured at 1440 and 390 in both languages: right-aligned to the table edge, no
  wrap overflow.

---

## 7. Remaining known issues

**Found and fixed while testing:** focus was not returned when a drawer closed. Escape and the close
button dropped focus on `<body>`, so a keyboard user had to tab in from the top of the page again.
All three dismissal paths now return focus to the trigger that opened the drawer, verified at 390 and
1200 on both AI drawers.

What remains:

1. **The branch is not pushed.** No GitHub credential exists in this environment. Everything is
   committed locally on `phase-01-closure-phase-02-architecture`; `git push` will work from a
   machine that has one.
2. **`AI_PROVIDER_UNAVAILABLE` (503) has no card of its own.** It shares the timeout card, differing
   only in the code and the retry delay. `error-taxonomy.md` §3 says so rather than implying a
   separate surface exists.
3. **The AI reading column is 544 px at 1440.** Correct for a three-pane layout, but a reader who
   maximises the thread would want the session list to collapse on demand; that is a Phase 02
   interaction, not a Phase 01 defect.
4. **The prototype's annotation layer is still present.** Three `Proposal` badges mark unapproved
   decisions and must be deleted, not restyled, at hand-off.
5. **The dashboard widget grid remains deferred**, as §14.5 requires — Phase 01's layout is
   grid-ready, the grid itself is Phase 02.
6. **No real behaviour.** Every action is a local interaction or a toast. Persistence is
   `localStorage` for theme and language only.

---

## 8. Decisions requiring your approval

All ten design decisions remain `PROPOSED`. The review recommends six approve, four modify, zero
reject. None of them has been treated as approved anywhere in the documents.

| ID | Proposal | Recommendation |
|---|---|---|
| D-01 | Graphite/teal foundation, saffron reserved for AI and attention | Approve |
| D-02 | Persian-first typography with a +1 type step and 1.7 leading | Approve |
| D-03 | Self-hosted woff2 subsets, no CDN | Approve |
| D-04 | Dashboard widget grid | **Deferred to Phase 02, not rejected** — §14.5 requires it |
| D-05 | Command palette as the primary navigation shortcut | Approve |
| D-06 | Six workspace roles | **Modify** — the roles are named in §17.2, not invented here |
| D-07 | Fail-closed as the default when the provider fails | Already stated in §18.1 — not a proposal |
| D-08 | Personal AI carries an estimated cost | **Modify** — add the qualifier |
| D-09 | Approvals queue with durable storage | **Modify** — bind it to the §18.4 facts |
| D-10 | Onboarding offers a recommended path and a free path | Approve |

The four open UX questions in `ux-architecture.md` §10 are answered, and marked `PROPOSED` rather
than `APPROVED`.

---

## 9. Confirmation

- `main` was **not** modified. `origin/main` is still `056d0a8`.
- Nothing was merged into `main`.
- Nothing was force-pushed, and no commit on the branch was rewritten.
- No secrets were committed.
- No production backend, auth service, database migration or live AI integration was created.
