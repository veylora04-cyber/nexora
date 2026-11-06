# Visual QA — final polish pass

Everything below was measured in Chromium against the served prototype
(`python3 -m http.server 8080 --directory design-preview`). Nothing here is read from source.
Screenshots live in `docs/evidence/v2/`.

---

## 1. What changed, and why

This pass is deliberately narrow. The previous phase rebuilt hierarchy; this one fixes the places
where the *decision* was still off-screen and adds the two states the AI workspace was missing.

### 1.1 The approval card now lands in view

**Problem.** The AI screen opened at scroll position 0, which showed the conversation and pushed the
approval card — the only thing on the screen that is blocked on a human — below the fold. At 1440 the
card began at y≈480 in a thread that ends at 682; the approve and decline buttons were never visible
on first paint. At 390 the card was 634 px tall inside a 438 px thread.

**Fix.** The thread opens at its newest content, and the card is aligned deliberately rather than
incidentally:

- if the card fits beside the state strip, scroll to the end, then nudge until the card's head clears
  the strip;
- if it does not fit, align its top, because the user needs to read *what* they are approving before
  reaching the buttons.

At 390 the card is now 444 px (from 634) because the six facts became label/value rows instead of a
two-column grid — a 318 px grid forced every value onto two or three lines.

| | Before | After |
|---|---|---|
| Card visible on first paint (1440) | head and foot both below the fold | head, six facts, hash row, buttons, binding note all visible |
| Card height at 390 | 634 px | 444 px |
| Facts at 390 | 2-column grid, 400 px | rows, 212 px |

Evidence: `before-ai-fa-1440.png` → `ai-fa-1440.png`, `approval-card-390.png`.

### 1.2 The state strip no longer overlaps the conversation

**Problem.** The prototype's state switcher was `position: sticky` inside the scroll container, so it
covered the first ~72 px of whatever was scrolled under it — including, after the fix above, the
approval card's own header. It also wrapped onto two rows at 1280 and three at 390, taking 107 px and
~100 px out of the thread respectively.

**Fix.** It moved out of the scroll container (it is prototype chrome, not product chrome) and became
a single horizontally scrollable row below 1400 px.

| Width | Strip height before | After |
|---|---|---|
| 1440 | 72 | 72 (one row, fits) |
| 1280 | 107 (two rows) | 39 (one scrollable row) |
| 390 | ~100 (three rows) | 38 |

### 1.3 A streaming state exists

The brief lists streaming as an AI state; the prototype had nine states and none of them was
"the answer is arriving". Added as a tenth:

- the assistant message ends in a caret at the exact position the next token will land — a spinner
  cannot express that;
- a "Writing…" row with a stop control, and the composer's send button becomes stop;
- both animations are suppressed under `prefers-reduced-motion`; the state stays legible from the
  label and the control.

Evidence: `ai-stream-fa-1440.png`.

### 1.4 The dashboard's first screenful

The date moved from its own row into the subtitle line, where it reads as part of the sentence
instead of a separate label. Small, but it is 24 px of the most expensive space on the screen and it
removed a row that carried one fact.

Evidence: `before-dashboard-fa-1440.png` → `dashboard-fa-1440.png`.

### 1.5 What was deliberately not changed

The token layer, the component vocabulary, the shell, the typography and the colour semantics are
untouched. No new dependency, no new component family, no new colour literal.

---

## 2. Results

| Check | Method | Result |
|---|---|---|
| Horizontal overflow | 7 pages × 4 language/theme combinations × 7 widths (360–1920), `documentElement.scrollWidth` vs `clientWidth` **and** every element's box against the viewport | **0 overflowing documents, 0 offending elements** (196 page loads) |
| i18n | Every `data-t` / `data-t-ph` / `data-t-aria` / `data-t-tip` key resolved against the dictionary, plus a scan for keys rendered as their own name | **0 missing, 0 partial, 0 raw-key leaks** |
| Console | `pageerror` + `console.error` on every load above | **0** |
| AI states | All 10 states at 1440/1920 in fa+dark and en+light, and at 390 in fa+dark: exactly one thread body visible, no internal overflow, no leaks | **pass** |
| Contrast | Computed foreground vs nearest opaque background, per visible text node, WCAG AA, 7 pages × 2 themes | **0 failures** |
| Accessible names | Every `a[href]`, `button`, `input`, `select`, `textarea`, `[tabindex]` | **0 unnamed** |
| Focus rings | Full keyboard traversal | **0 missing** — except 3 intentionally `disabled` controls on the component reference page, which cannot receive focus by definition |
| Closed mobile rail | 24 × `Tab` at 390 px | **0 focus stops inside the closed rail** |

---

## 3. Remaining visual issues

Honest list. None of these is hidden behind a green check.

1. **At 390 the approval card is 444 px inside a 388 px thread.** The card is inherently taller than
   the phone viewport once the state strip is present, so ~56 px of the binding note sits below the
   fold. The head, all six facts, the hash row and both buttons are visible; the note is not. Options
   are a full-screen approval sheet (better product, larger change) or dropping the strip on mobile
   (dishonest, since it is how states are inspected). Left as-is for this phase.
2. **The AI reading column is 544 px at 1440.** Correct for a three-pane layout, but a reader who
   wants to maximise the thread has no way to collapse the session list. Phase 02 interaction.
3. **The state strip scrolls horizontally below 1400 px.** Reachable, not discoverable — there is no
   affordance saying "more states this way". It is prototype chrome and will be deleted at hand-off.
4. **`AI_PROVIDER_UNAVAILABLE` still has no card of its own**; it shares the timeout card and differs
   only in code and retry delay. `error-taxonomy.md` §3 says so rather than implying otherwise.
5. **The component reference page still contains three disabled controls without focus rings.** They
   are the "disabled" examples; a disabled control that could receive focus would be the defect.
