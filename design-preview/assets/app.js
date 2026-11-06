/* NEXORA prototype · behaviour
   Theme, direction, navigation chrome, overlays and shared interactions.
   Kept dependency-free on purpose: the prototype must run from a plain
   static server with no build step. */

(function () {
  const NX = window.NX;
  const doc = document;

  /* ---------- Theme ------------------------------------------------------ */
  const THEME_KEY = 'nx.theme';

  function applyTheme(theme) {
    doc.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
    doc.querySelectorAll('#theme-btn, [data-theme-btn]').forEach((b) => {
      b.innerHTML = NX.icon(theme === 'dark' ? 'sun' : 'moon');
    });
    doc.querySelectorAll('[data-theme-val]').forEach((b) => {
      b.textContent = NX.i18n.t(theme === 'dark' ? 'common.theme.dark' : 'common.theme.light');
    });
    doc.querySelectorAll('[data-dev-theme]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-dev-theme') === theme));
    });
    document.dispatchEvent(new CustomEvent('nx:theme', { detail: { theme } }));
  }

  function currentTheme() {
    return doc.documentElement.getAttribute('data-theme') || 'dark';
  }

  function toggleTheme() {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  }

  /* ---------- Language -------------------------------------------------- */
  function syncLangButtons() {
    const label = doc.getElementById('lang-label');
    if (label) label.textContent = NX.i18n.lang === 'fa' ? 'EN' : 'فا';
    doc.querySelectorAll('[data-dev-lang]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-dev-lang') === NX.i18n.lang));
    });
    doc.querySelectorAll('[data-lang-btn]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang-btn') === NX.i18n.lang));
    });
    doc.querySelectorAll('[data-lang-val]').forEach((b) => {
      b.textContent = NX.i18n.t(NX.i18n.lang === 'fa' ? 'common.lang.fa' : 'common.lang.en');
    });
    const t = doc.documentElement.getAttribute('data-theme') || 'dark';
    doc.querySelectorAll('[data-theme-val]').forEach((b) => {
      b.textContent = NX.i18n.t(t === 'dark' ? 'common.theme.dark' : 'common.theme.light');
    });
  }

  /* ---------- Overlay helpers ------------------------------------------- */
  const scrim = () => doc.getElementById('scrim');

  function openScrim() {
    const s = scrim();
    if (s) s.setAttribute('data-open', 'true');
  }

  function closeScrim() {
    const s = scrim();
    if (s) s.setAttribute('data-open', 'false');
  }

  function closeAll() {
    doc.querySelectorAll('.menu[data-open="true"]').forEach((m) => m.setAttribute('data-open', 'false'));
    doc.querySelectorAll('[aria-expanded="true"][aria-haspopup="menu"]').forEach((b) =>
      b.setAttribute('aria-expanded', 'false')
    );
    closeScrim();
  }

  function bindMenu(triggerId, menuId) {
    const trigger = doc.getElementById(triggerId);
    const menu = doc.getElementById(menuId);
    if (!trigger || !menu) return;
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = menu.getAttribute('data-open') === 'true';
      closeAll();
      menu.setAttribute('data-open', String(!open));
      trigger.setAttribute('aria-expanded', String(!open));
    });
    menu.addEventListener('click', (e) => e.stopPropagation());
  }

  /* ---------- Command palette ------------------------------------------- */
  let paletteIndex = 0;

  function paletteItems() {
    const p = doc.getElementById('palette');
    return p ? Array.from(p.querySelectorAll('.palette__item')) : [];
  }

  function openPalette() {
    const p = doc.getElementById('palette');
    if (!p) return;
    p.setAttribute('data-open', 'true');
    openScrim();
    const input = doc.getElementById('palette-input');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 20);
    }
    filterPalette('');
  }

  function closePalette() {
    const p = doc.getElementById('palette');
    if (!p) return;
    p.setAttribute('data-open', 'false');
    closeScrim();
  }

  function filterPalette(q) {
    const query = q.trim().toLowerCase();
    const items = paletteItems();
    let first = -1;
    items.forEach((it, i) => {
      const match = !query || it.textContent.toLowerCase().indexOf(query) > -1;
      it.style.display = match ? '' : 'none';
      it.setAttribute('aria-selected', 'false');
      if (match && first === -1) first = i;
    });
    paletteIndex = first === -1 ? 0 : first;
    if (items[paletteIndex]) items[paletteIndex].setAttribute('aria-selected', 'true');
  }

  function movePalette(delta) {
    const items = paletteItems().filter((i) => i.style.display !== 'none');
    if (!items.length) return;
    items.forEach((i) => i.setAttribute('aria-selected', 'false'));
    paletteIndex = (paletteIndex + delta + items.length) % items.length;
    items[paletteIndex].setAttribute('aria-selected', 'true');
    items[paletteIndex].scrollIntoView({ block: 'nearest' });
  }

  /* ---------- Toasts ---------------------------------------------------- */
  function toast(message, tone) {
    let region = doc.querySelector('.toast-region');
    if (!region) {
      region = doc.createElement('div');
      region.className = 'toast-region';
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      doc.body.appendChild(region);
    }
    const el = doc.createElement('div');
    el.className = 'toast' + (tone ? ' toast--' + tone : '');
    el.innerHTML =
      NX.icon(tone === 'err' ? 'alert' : 'check') + '<span>' + message + '</span>';
    region.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(6px)';
      setTimeout(() => el.remove(), 200);
    }, 3200);
  }
  NX.toast = toast;

  /* ---------- Tabs ------------------------------------------------------ */
  function bindTabs() {
    doc.querySelectorAll('[data-tabs]').forEach((group) => {
      const buttons = Array.from(group.querySelectorAll('[role="tab"]'));
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          buttons.forEach((b) => b.setAttribute('aria-selected', 'false'));
          btn.setAttribute('aria-selected', 'true');
          const target = btn.getAttribute('data-tab');
          const scope = group.getAttribute('data-tabs');
          doc.querySelectorAll(`[data-tab-panel][data-group="${scope}"]`).forEach((panel) => {
            panel.hidden = panel.getAttribute('data-tab-panel') !== target;
          });
        });
      });
    });
  }

  /* ---------- Boot ------------------------------------------------------ */
  function boot() {
    NX.mountSprite();
    applyTheme(currentTheme());
    NX.i18n.apply();
    syncLangButtons();
    bindTabs();

    bindMenu('scope-btn', 'scope-menu');
    bindMenu('user-btn', 'user-menu');

    doc.addEventListener('click', closeAll);

    doc.getElementById('theme-btn') &&
      doc.getElementById('theme-btn').addEventListener('click', toggleTheme);
    doc.getElementById('lang-btn') &&
      doc.getElementById('lang-btn').addEventListener('click', () => {
        NX.i18n.toggle();
        syncLangButtons();
      });

    /* Same two actions, mirrored inside the account menu so they stay
       reachable once the topbar is compressed on small screens. */
    doc.querySelectorAll('[data-theme-action]').forEach((b) =>
      b.addEventListener('click', toggleTheme)
    );
    doc.querySelectorAll('[data-lang-action]').forEach((b) =>
      b.addEventListener('click', () => {
        NX.i18n.toggle();
        syncLangButtons();
      })
    );

    const railToggle = doc.getElementById('rail-collapse');
    if (railToggle) {
      railToggle.addEventListener('click', () => {
        const shell = doc.getElementById('shell');
        const collapsed = shell.getAttribute('data-rail') === 'collapsed';
        shell.setAttribute('data-rail', collapsed ? 'expanded' : 'collapsed');
        railToggle.setAttribute('aria-pressed', String(!collapsed));
      });
    }

    const railOpen = doc.getElementById('rail-open');
    if (railOpen) {
      railOpen.addEventListener('click', (e) => {
        e.stopPropagation();
        const rail = doc.getElementById('rail');
        rail.setAttribute('data-open', 'true');
        openScrim();
      });
    }

    /* Every drawer closes the same way: Escape, the scrim, or the close button.
       Focus goes back to whatever opened it — without that a keyboard user
       lands on <body> and has to tab in from the top of the page again. */
    let drawerOpener = null;
    const closeDrawers = () => {
      const open = doc.querySelectorAll('.drawer[data-open="true"]');
      if (!open.length) return false;
      open.forEach((d) => d.setAttribute('data-open', 'false'));
      if (drawerOpener && doc.contains(drawerOpener)) drawerOpener.focus();
      drawerOpener = null;
      return true;
    };

    const notifBtn = doc.getElementById('notif-btn');
    const notifDrawer = doc.getElementById('notif-drawer');
    if (notifBtn && notifDrawer) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        drawerOpener = notifBtn;
        notifDrawer.setAttribute('data-open', 'true');
        openScrim();
        setTimeout(() => notifDrawer.querySelector('[data-drawer-close]').focus(), 30);
      });
    }
    doc.querySelectorAll('[data-drawer-close]').forEach((b) =>
      b.addEventListener('click', () => {
        b.closest('.drawer').setAttribute('data-open', 'false');
        closeScrim();
        if (drawerOpener && doc.contains(drawerOpener)) drawerOpener.focus();
        drawerOpener = null;
      })
    );

    /* Generic opener: any trigger can open any drawer by id. Used by the AI
       screen, where the session list and context inspector become drawers
       below the width that hides their column. */
    doc.querySelectorAll('[data-drawer-open]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const drawer = doc.getElementById(btn.getAttribute('data-drawer-open'));
        if (!drawer) return;
        drawerOpener = btn;
        drawer.setAttribute('data-open', 'true');
        openScrim();
        const target = drawer.querySelector('[data-drawer-close]') || drawer;
        /* The drawer is still visibility:hidden at this point in the frame,
           so focus has to wait for the style change to land. */
        setTimeout(() => target.focus(), 30);
      });
    });

    /* Prototype state switchers. A button carries `data-demo-variant="group:name"`;
       every element with `data-variant-group="group"` shows only when its
       `data-variant` matches. Used for error and empty states that would
       otherwise need a second page per state. */
    doc.querySelectorAll('[data-demo-variant]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const [group, name] = btn.getAttribute('data-demo-variant').split(':');
        doc.querySelectorAll('[data-variant-group="' + group + '"]').forEach((el) => {
          el.hidden = el.getAttribute('data-variant') !== name;
        });
        doc.querySelectorAll('[data-demo-variant^="' + group + ':"]').forEach((b) => {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        doc.querySelectorAll('[data-hide-in]').forEach((el) => {
          const [g, n] = el.getAttribute('data-hide-in').split(':');
          el.hidden = g === group && n === name;
        });
      });
    });

    /* Mark-all-read. Read state is data, not decoration: the row keeps its
       content, loses its weight, and the unread count goes to zero. */
    doc.querySelectorAll('[data-notif-mark-all]').forEach((btn) => {
      btn.addEventListener('click', () => {
        doc.querySelectorAll('.notif__row[data-unread="true"]').forEach((r) => {
          r.setAttribute('data-unread', 'false');
        });
        const c = doc.getElementById('notif-count');
        if (c) c.textContent = NX.i18n.num(0);
        NX.toast(NX.i18n.t('toast.read'), 'ok');
      });
    });

    const scrimEl = scrim();
    if (scrimEl) {
      scrimEl.addEventListener('click', () => {
        closeAll();
        closePalette();
        closeDrawers();
        doc.querySelectorAll('.modal[data-open="true"]').forEach((m) =>
          m.setAttribute('data-open', 'false')
        );
        const rail = doc.getElementById('rail');
        if (rail) rail.removeAttribute('data-open');
      });
    }

    const paletteOpen = doc.getElementById('palette-open');
    if (paletteOpen) paletteOpen.addEventListener('click', openPalette);

    const paletteInput = doc.getElementById('palette-input');
    if (paletteInput) {
      paletteInput.addEventListener('input', (e) => filterPalette(e.target.value));
      paletteInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          movePalette(1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          movePalette(-1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          closePalette();
          toast(NX.t('toast.paletteRun'));
        }
      });
    }
    paletteItems().forEach((it) =>
      it.addEventListener('click', () => {
        closePalette();
        toast(NX.t('toast.paletteRun'));
      })
    );

    doc.addEventListener('keydown', (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openPalette();
      } else if (e.key === 'Escape') {
        closeAll();
        closePalette();
        closeDrawers();
        doc.querySelectorAll('.modal[data-open="true"]').forEach((m) =>
          m.setAttribute('data-open', 'false')
        );
        const rail = doc.getElementById('rail');
        if (rail) rail.removeAttribute('data-open');
      }
    });

    /* Prototype controls */
    doc.querySelectorAll('[data-dev-theme]').forEach((b) =>
      b.addEventListener('click', () => applyTheme(b.getAttribute('data-dev-theme')))
    );
    doc.querySelectorAll('[data-dev-lang]').forEach((b) =>
      b.addEventListener('click', () => {
        NX.i18n.set(b.getAttribute('data-dev-lang'));
        syncLangButtons();
      })
    );

    /* Demo-only: any element with data-demo-toast fires a confirmation. */
    doc.querySelectorAll('[data-demo-toast]').forEach((el) =>
      el.addEventListener('click', (e) => {
        if (el.tagName === 'A' || el.tagName === 'BUTTON') e.preventDefault();
        toast(NX.t(el.getAttribute('data-demo-toast')), el.getAttribute('data-demo-tone') || 'ok');
      })
    );

    /* OTP groups: digits only, auto-advance, paste support. */
    doc.querySelectorAll('[data-otp]').forEach((group) => {
      const inputs = Array.from(group.querySelectorAll('input'));
      inputs.forEach((input, i) => {
        input.addEventListener('input', () => {
          input.value = input.value.replace(/\D/g, '').slice(0, 1);
          if (input.value && inputs[i + 1]) inputs[i + 1].focus();
        });
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !input.value && inputs[i - 1]) {
            inputs[i - 1].focus();
            inputs[i - 1].value = '';
            e.preventDefault();
          }
          if (e.key === 'ArrowLeft' && inputs[i - 1]) inputs[i - 1].focus();
          if (e.key === 'ArrowRight' && inputs[i + 1]) inputs[i + 1].focus();
        });
        input.addEventListener('paste', (e) => {
          const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
          if (!text) return;
          e.preventDefault();
          text.split('').slice(0, inputs.length).forEach((ch, k) => {
            if (inputs[i + k]) inputs[i + k].value = ch;
          });
          const next = inputs[Math.min(i + text.length, inputs.length - 1)];
          if (next) next.focus();
        });
      });
    });

    /* Password visibility */
    doc.querySelectorAll('[data-pass-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const field = doc.getElementById(btn.getAttribute('data-pass-toggle'));
        if (!field) return;
        const show = field.type === 'password';
        field.type = show ? 'text' : 'password';
        btn.innerHTML = NX.icon(show ? 'eyeOff' : 'eye');
        btn.setAttribute('aria-pressed', String(show));
      });
    });

    /* A conversation opens at its newest message, not its oldest. Without
       this the approval card — the reason the screen exists — sits below the
       fold on first paint, and the user sees a discussion instead of a
       decision. The state strip is sticky, so it stays put. */
    const thread = doc.querySelector('.ai__thread');
    if (thread) {
      requestAnimationFrame(() => {
        const card = thread.querySelector('.approval');
        /* On a phone the card is taller than the thread, so something has to
           be clipped. Align its top instead of its bottom: the user needs to
           read what they are approving before they reach the buttons, and the
           six pixels that fall off the end are the binding note's padding. */
        const strip = thread.querySelector('.thread-states');
        const covered = strip ? strip.offsetHeight : 0;
        const tooTall = card && card.offsetHeight + covered + 16 > thread.clientHeight;
        if (tooTall) {
          const delta = card.getBoundingClientRect().top - thread.getBoundingClientRect().top;
          thread.scrollTop += delta - covered - 8;
        } else {
          thread.scrollTop = thread.scrollHeight;
          /* Scrolling to the end can still park the card's head behind the
             sticky strip. Nudge it down until the head clears. */
          if (card) {
            const head = card.getBoundingClientRect().top;
            const limit = thread.getBoundingClientRect().top + covered + 8;
            if (head < limit) thread.scrollTop -= (limit - head);
          }
        }
      });
    }

    /* Loading-state demo */
    doc.querySelectorAll('[data-demo-loading]').forEach((el) =>
      el.addEventListener('click', () => {
        el.setAttribute('data-loading', 'true');
        setTimeout(() => el.removeAttribute('data-loading'), 1600);
      })
    );
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
