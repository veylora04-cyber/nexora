# NEXT_STEPS

**Phase 01 is complete and awaiting review.** Nothing below should start before the design is
approved — the brief is explicit that the design must be reviewable before application development
begins.

---

## 1 · Immediate: review this delivery

1. Open `design-preview/index.html` through a local server (see `PROJECT_STATUS.md`).
2. Walk the six screen cards, toggling **theme** and **language** in the prototype bar at the bottom
   of every page.
3. Read `docs/design/design-decisions.md` §B — ten proposals need a yes/no. Everything in §C needs a
   product or legal answer.
4. Answer the four open UX questions in `docs/design/ux-architecture.md` §10.

**Suggested order of review:** brand direction → dashboard → AI → workspace → auth → onboarding.

---

## 2 · Blocked on approval

| Item | Blocked by |
|---|---|
| Any application code | Design approval (whole phase) |
| Provider list, regions, residency copy | C-01 |
| Pricing and quota model | C-02 |
| Retention default in the AI context inspector | C-03 |
| Free-tier behaviour in onboarding | C-04 |
| Role matrix (6 roles × 7 capabilities) | D-011 |
| Dashboard widget customisation | D-009 |

---

## 3 · Design follow-ups (small, within this phase's scope)

These are known gaps in the current prototype, not new features:

1. **AI context inspector below 1240px.** It disappears with no alternative. Should become a
   slide-over drawer triggered from the thread header.
2. **AI session list below 900px.** Hidden with no replacement. Should become a segmented
   "Sessions / Thread" switch or a dropdown in the thread header.
3. **Composer growth cap.** The dashboard composer grows with content but has no maximum height;
   it should cap at ~160px and scroll internally.
4. **Error states.** AI disconnected and provider `401` exist; rate-limit, timeout and partial
   failure do not.
5. **Empty states.** Dashboard with zero tasks, workspace with zero members, AI with zero sessions.
6. **Onboarding steps 2–4.** Only the first Smart Start step is rendered; the remaining three are
   described in the step marker but not designed as screens.
7. **Notification drawer content.** Four sample rows; needs grouping, read/unread rules and a
   "mark all read" behaviour.

---

## 4 · Phase 02 candidates (after approval)

- Application scaffolding that consumes `tokens.css` / `components.css` unchanged.
- Authentication implementation against the seven designed states.
- AI provider abstraction matching the Central / Personal model, with fail-closed behaviour as
  designed.
- Permission enforcement matching the role matrix.
- Storybook (or equivalent) generated from the same component source, so the reference page and the
  product never diverge.

---

## 5 · Housekeeping

- **Repository:** the work is committed locally on `design/phase-01-foundation`. No remote is
  authenticated in this environment; pushing requires `gh auth login` or a `GH_TOKEN`.
- **Branch policy:** never push to `main` / `master` without explicit permission. Open a pull request
  from `design/phase-01-foundation` when a remote is available.
- **Before merging:** decide whether `design-preview/` stays at the repo root or moves under
  `design/` as the brief's folder structure suggests.
