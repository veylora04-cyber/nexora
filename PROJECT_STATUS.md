# PROJECT_STATUS

**Project:** NEXORA — modular, multi-level AI work platform
**Phase:** 01 — design foundation
**Branch:** `design/phase-01-foundation`
**Last updated:** Phase 01 delivery

---

## Where the project stands

| Area | State | Notes |
|---|---|---|
| Brand direction | ✅ Complete | `docs/design/brand-direction.md` |
| Design tokens | ✅ Complete | 182 tokens, light + dark, 2 locales |
| Typography | ✅ Complete | Instrument Sans + Vazirmatn, self-hosted, OFL |
| Component library | ✅ Complete | 40+ components, all states, live reference page |
| App shell | ✅ Complete | Rail, topbar, scope switcher, drawer, palette |
| Screens | ✅ Complete | 7 pages / 20+ states, all inspectable |
| RTL / LTR | ✅ Complete | Logical properties throughout, verified both ways |
| Responsive | ✅ Complete | 360 / 390 / 768 / 1024 / 1440 verified, 0 overflow |
| Accessibility | ✅ Passed | Contrast AA, names, focus, targets, reduced motion |
| Documentation | ✅ Complete | 4 design docs + 4 context files |
| Application code | ⛔ Not started | By design — Phase 01 is design only |
| Backend / auth / AI providers | ⛔ Not started | By design |

---

## What exists on disk

```
design-preview/             static, dependency-free prototype
  index.html                overview + decision status
  screens/                  auth · onboarding · shell · ai · workspace
  components/               design-system reference (English, LTR-locked)
  assets/                   tokens · base · components · layouts CSS
                            app.js · chrome.js · i18n.js · icons.js
                            lang/*.js (7 files) · fonts/*.woff2 (3 files)
docs/design/                brand-direction · design-system
                            ux-architecture · design-decisions
PROJECT_STATUS.md  DECISIONS.md  DESIGN_PROGRESS.md  NEXT_STEPS.md
```

Total: 26 files. No build step, no package manager, no external network requests at runtime.

---

## How to run it

```bash
cd /workspace
python3 -m http.server 8080 --directory design-preview
# open http://localhost:8080
```

The prototype must be served over HTTP (not opened as `file://`) because it loads ES modules, the
icon sprite and self-hosted fonts.

---

## Known limitations

1. **No GitHub connection.** `gh auth status` reports no authenticated account and no token is
   present in the environment. The work is committed locally on `design/phase-01-foundation` only.
   Nothing has been pushed, and no default branch has been touched.
2. **No real product behaviour.** Every action is a local interaction, a toast, or a labelled demo.
   There is no persistence beyond `localStorage` for theme and language.
3. **Two states are illustrative, not exhaustive.** Error/disconnected states exist for AI and auth;
   network failure, rate limiting and partial failure are described but not all rendered.
4. **Content is sample content.** Names, emails, usage figures and dates are fictional and marked as
   such in the overview page.
