# NEXORA — UX architecture

**Status:** proposal for approval · Phase 01
**Screens:** 7 pages, 20+ states · `design-preview/`

---

## 1. The scope model

Everything in NEXORA happens *inside a scope*. The scope is the first thing a user chooses and the
last thing they should ever be unsure about.

```
Organization  ──  a policy container. Owns members, billing, AI provider rules.
     │
     └─ Team  ──  a working group inside an org, or standalone. Owns projects and shared context.
          │
          └─ Personal  ──  one person. Always available. Never blocked by org policy.
```

Three rules the UI enforces:

1. **A scope is always visible.** The topbar scope switcher never disappears, on any screen, at any
   width.
2. **A scope change is explicit.** Switching workspace is a menu selection with the level shown, not
   a silent context switch. Every scope row carries its level badge (Personal / Team / Organization).
3. **Authority flows down, not up.** A personal workspace is never governed by an organisation. An
   organisation can constrain a team (retention, providers, data residency) and the UI says so in the
   workspace card: *"Organization policy applies."*

---

## 2. Information architecture

```
Overview (index)
│
├── Authentication  ── sign in · sign up · recovery · verify · OTP · 2FA · passkey
├── Onboarding      ── path choice · Smart Start (4 steps) · Free Start
│
└── App shell
    ├── Dashboard / Command Centre
    ├── AI workspace  ── conversation · models & connection
    ├── Agents
    ├── Workflows
    ├── Knowledge
    ├── Members
    ├── Usage
    ├── API & developers
    └── Marketplace
```

The rail groups these into **Workspace / Team / Platform**. The grouping is not cosmetic: it encodes
who a setting belongs to. "Members" and "Usage" are team-scoped; "API & developers" and "Marketplace"
are platform-scoped.

---

## 3. Authentication

**Design position:** seven states, one page, one visual frame. The user should never feel they have
left the product, even mid-recovery.

| State | What it proves |
|---|---|
| Sign in | Email + password, passkey shortcut, three OAuth providers, "keep me signed in" |
| Sign up | Password strength meter that states the rule, not just a colour |
| Recovery | Neutral response for unknown addresses — *"If an account exists…"* — no account enumeration |
| Email verify | 6-digit OTP with resend cooldown, paste support |
| OTP | Auto-advance, backspace, arrow keys, paste |
| Two-factor | 6-digit code + "trust this device for 30 days" with an explicit explanation of what that means |
| Passkey | Device list, platform authenticator language, fallback to password |

**Layout:** an ink brand panel (identity, the scope model, the aperture diagram) and a form panel.
The brand panel collapses below 1024px; the form is never narrower than 360px.

The brand panel is where the product explains its own hierarchy — three labelled rings (Personal,
Team, Organization) — so the concept is introduced before the first workspace exists.

---

## 4. Onboarding (hybrid — approved in the specification)

Two paths, presented as a genuine choice rather than a default with an escape hatch.

### Smart Start (recommended)

Four steps, ~2 minutes: name → workspace type and size → focus areas → confirmation. The summary
column states what *will* be created and, in the same panel, what will *not* happen yet:

> "None of these are activated before you confirm."

This is the trust mechanism. The AI never provisions anything the user has not seen listed.

### Free Start

An empty workspace with no questions and no automatic suggestions. The card states the trade-off
honestly: *"No questions and no automatic suggestions · No AI connection until you set one ·
Every setting can be changed later."*

Both paths end in the same place: a workspace the user can explain.

---

## 5. App shell

### Structure

```
┌──────────┬──────────────────────────────────────────────┐
│          │ topbar: scope · search · theme · alerts · me │
│  rail    ├──────────────────────────────────────────────┤
│ 268px    │                                              │
│          │  content (max 1160px)                        │
│ groups   │                                              │
│ + counts │                                              │
└──────────┴──────────────────────────────────────────────┘
```

- **Rail** — 268px, three labelled groups, item counts where a count is meaningful (4 agents,
  7 workflows). Collapsible to 64px on desktop; off-canvas drawer below 900px.
- **Topbar** — 60px, sticky, blurred. Scope switcher, command search, theme, language, notifications,
  account.
- **Command palette** — `Ctrl/⌘ + K`. Searches screens, workspaces and actions in one field.
  *Labelled as a proposal in the UI.*

### Mobile

The topbar reduces to: menu · scope · search · alerts · account. Theme and language move into the
account menu, where they are still one tap away but no longer compete with the scope switcher.

The rail becomes a full-height overlay drawer with a scrim; when closed it is `visibility: hidden`
and `pointer-events: none`, so it is unreachable by keyboard and cannot cause horizontal scroll.

---

## 6. Dashboard / Command Centre

The dashboard answers three questions in order, top to bottom:

1. **What is happening?** — greeting, Jalali date, scope, one line of status.
2. **What needs me?** — tasks, with exactly one item marked as awaiting approval (saffron), and a
   single primary action.
3. **What changed?** — recent work, AI usage against quota, workspace membership.

The AI composer sits *in the shell*, not behind a nav item: asking the AI is a primary act, so it is
one line away from anywhere on the dashboard. Underneath it, a single sentence carries the safety
model: *"Nothing runs without your approval. Every tool call is authorised separately."*

**Proposal (not approved):** the dashboard as a "Command Centre" with a customisable widget grid.
The current design is a fixed, opinionated layout. See `design-decisions.md` §D-04.

---

## 7. AI experience

Three columns on desktop, collapsing to one on mobile:

```
┌────────────┬─────────────────────────────┬──────────────┐
│ sessions   │ thread                      │ context      │
│ 268px      │                             │ 312px        │
│ today /    │ message · tool call ·       │ workspace    │
│ this week  │ approval · sources          │ access       │
│            │                             │ model        │
│            │ composer                    │ retention    │
└────────────┴─────────────────────────────┴──────────────┘
```

The third column is the differentiator: every conversation continuously answers *what can this AI
see, which model is answering, how much has it cost, and what happens to this data.* It is visible
by default, not behind a settings link.

### Tool calls are first-class UI

When the AI wants to act, it renders a card: tool name, scope of the action (`4 outbound searches`),
state (`Pending approval`, saffron), and two buttons. The card states the boundary in its own footer:
*"No outbound request is sent until you approve."*

This is the single most important screen in the product. It is designed to make the AI *slower* at
exactly the moment speed would be dangerous.

### Models & connection

- **Central AI** — the platform's own provider, with quota, allowed models and current usage.
- **Personal AI** — bring your own key. Provider, model, base URL, API key. The key field is masked
  after save, shows a success state (*"Key stored and encrypted. Only the last four characters are
  shown again."*), and the base-URL hint states the SSRF rule: *"Private and internal addresses are
  blocked."*
- **Fail-closed** — off by default, and the copy explains the consequence: if Personal AI fails,
  requests stop rather than falling back to Central AI.

No key is ever hardcoded or logged in the prototype. The demo key is a masked placeholder.

---

## 8. Workspace experience

Four tabs, each answering one question:

| Tab | Question |
|---|---|
| Members | Who is here, with what role, and are they active? |
| Roles & access | What can each role actually do? (capability × role matrix) |
| Invite | How do I add someone, and what does the link grant? |
| Settings | What is this workspace, and how do I remove it? |

The role matrix is **labelled as a proposal** in the UI (`Proposed matrix`), because the
specification defines roles by name but not by capability.

Destructive actions live in a danger zone with an explicit recovery window
(*"Recoverable for 30 days"*), not in a menu.

---

## 9. Navigation model, in one paragraph

The rail is the map; the topbar is the context; the scope switcher is the axis both rotate around.
Anything that changes *what the user is looking at* lives in the rail. Anything that changes *who
they are* lives in the topbar. Anything that changes *what the AI may do* lives in the AI context
column. If a control does not clearly belong to one of those three, it is in the wrong place.

---

## 10. Open UX questions — answered

These four were open through Phase 01 and are now decided. The full reasoning is in
[`decision-review.md`](decision-review.md) §3; this is the resolution.

**1 · Rail collapse.** Not a single breakpoint, two behaviours. Expanded and user-collapsible at
≥ 1200px; collapsed by default but user-expandable between 900px and 1200px; replaced by a drawer
below 900px. Automatic collapse in the middle band was rejected because it fights the user — resize
the window by a pixel and the rail collapses again, so users leave it collapsed forever and never see
the labelled navigation. The collapse state is a user preference, not a media-query side effect.

**2 · AI composer placement.** Dashboard and AI workspace only. Everywhere else, an "Ask AI"
affordance opens the AI workspace with the current page's context attached. An inline composer on
Members or Billing is ambiguous — it implies the AI can see the page, and it does not say what it
attached. A jump-with-context is honest: the context inspector shows exactly what came along.

**3 · Skipping Smart Start midway.** Allowed, under three conditions: skipping creates nothing (no
workspace, no subscription, no cost — §14.5); entered values persist as a draft with a "resume setup"
entry point on the dashboard; and the final review step stays all-or-nothing, because that is where
the user consents to creation.

**4 · Switching between an organisation's teams.** The scope switcher becomes two-level and gains the
organisation as a *destination*, not just a container: the org is selectable (billing, security,
policy live there), the current team stays pinned at the top of the list, and switching stays an
explicit selection — never a hover-expanding tree, which is how users end up approving an action in
the wrong workspace. Below 900px the switcher becomes a sheet rather than a dropdown.

