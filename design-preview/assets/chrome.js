/* NEXORA prototype · shared chrome
   The application frame is defined once so every screen shares the same
   navigation, scope switcher and overlays. Screens only supply content. */

(function () {
  const NX = window.NX;

  /* Brand mark: a scope ring with a single aperture. The gap marks where the
     boundary opens; the centre node marks the unit of work inside it. */
  NX.mark = function (size) {
    const s = size || 24;
    return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" aria-hidden="true">
      <path d="M19.9 8.6a8.4 8.4 0 1 0 1.1 6.9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
      <path d="M12 12 17.9 5.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
      <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
    </svg>`;
  };

  const NAV = [
    {
      label: 'nav.group.workspace',
      items: [
        { id: 'dashboard', href: 'shell.html', icon: 'home', key: 'nav.dashboard' },
        { id: 'ai', href: 'ai.html', icon: 'sparkle', key: 'nav.ai' },
        { id: 'agents', href: '#', icon: 'zap', key: 'nav.agents', count: '4' },
        { id: 'workflows', href: '#', icon: 'flow', key: 'nav.workflows', count: '7' },
        { id: 'knowledge', href: '#', icon: 'folder', key: 'nav.knowledge' },
      ],
    },
    {
      label: 'nav.group.team',
      items: [
        { id: 'members', href: 'workspace.html', icon: 'users', key: 'nav.members' },
        { id: 'usage', href: '#', icon: 'chart', key: 'nav.usage' },
      ],
    },
    {
      label: 'nav.group.platform',
      items: [
        { id: 'api', href: '#', icon: 'code', key: 'nav.api' },
        { id: 'marketplace', href: '#', icon: 'grid', key: 'nav.marketplace' },
      ],
    },
  ];

  NX.rail = function (active) {
    const groups = NAV.map((g) => {
      const items = g.items
        .map(
          (it) => `<a class="nav-item" href="${it.href}"${
            it.id === active ? ' aria-current="page"' : ''
          }>
            ${NX.icon(it.icon)}
            <span class="nav-item__label" data-t="${it.key}"></span>
            ${it.count ? `<span class="nav-item__count">${it.count}</span>` : ''}
          </a>`
        )
        .join('');
      return `<div class="nav-group">
        <div class="nav-group__label"><span data-t="${g.label}"></span></div>
        ${items}
      </div>`;
    }).join('');

    return `<aside class="rail" id="rail" aria-label="NEXORA">
      <div class="rail__head">
        <a class="brand" href="../index.html" aria-label="NEXORA">
          <span class="brand__mark">${NX.mark(26)}</span>
          <span class="brand__word">NEXORA</span>
        </a>
      </div>
      <nav class="rail__nav" aria-label="Primary">
        ${groups}
      </nav>
      <div class="rail__foot">
        <a class="nav-item" href="#">
          ${NX.icon('sliders')}
          <span class="nav-item__label" data-t="nav.settings"></span>
        </a>
        <a class="nav-item" href="#">
          ${NX.icon('book')}
          <span class="nav-item__label" data-t="nav.help"></span>
        </a>
      </div>
    </aside>`;
  };

  NX.topbar = function (opts) {
    const o = opts || {};
    return `<header class="topbar">
      <button class="icon-btn only-mobile" id="rail-open" aria-label="Menu">${NX.icon('menu')}</button>

      <div style="position:relative">
        <button class="scope" id="scope-btn" aria-haspopup="menu" aria-expanded="false">
          <span class="scope__mark">${NX.icon('layers', 'icon-16')}</span>
          <span class="scope__name" data-t="ws.team">استودیو آرا</span>
          <span class="scope__level" data-t="ws.team.level">تیمی</span>
          ${NX.icon('chevronDown', 'icon-16')}
        </button>
        <div class="menu" id="scope-menu" role="menu" style="inset-block-start:calc(100% + 6px);inset-inline-start:0;min-width:300px">
          <div class="menu__label" data-t="ws.switch">تغییر فضای کاری</div>
          <button class="menu__item" role="menuitem">
            ${NX.icon('user')}
            <span class="grow" data-t="ws.personal">فضای شخصی</span>
            <span class="badge badge--plain" data-t="ws.level.personal"></span>
          </button>
          <button class="menu__item menu__item--active" role="menuitem" aria-current="true">
            ${NX.icon('users')}
            <span class="grow" data-t="ws.team"></span>
            <span class="badge badge--primary" data-t="ws.level.team"></span>
          </button>
          <button class="menu__item" role="menuitem">
            ${NX.icon('building')}
            <span class="grow" data-t="ws.org"></span>
            <span class="badge badge--plain" data-t="ws.level.org"></span>
          </button>
          <div class="menu__sep"></div>
          <button class="menu__item" role="menuitem">${NX.icon('plus')}<span data-t="ws.create"></span></button>
          <button class="menu__item" role="menuitem">${NX.icon('sliders')}<span data-t="ws.manage"></span></button>
        </div>
      </div>

      <button class="searchbar" id="palette-open" style="margin-inline-start:var(--nx-space-2)">
        ${NX.icon('search')}
        <span class="searchbar__label" data-t="common.searchPlaceholder"></span>
        <span class="searchbar__keys"><span class="kbd">Ctrl</span><span class="kbd">K</span></span>
      </button>

      <div class="spacer"></div>

      <button class="icon-btn topbar__pref" id="theme-btn" data-t-tip="tip.theme" aria-label="Theme">
        ${NX.icon('moon')}
      </button>
      <button class="icon-btn topbar__pref" id="lang-btn" data-t-tip="tip.language" aria-label="Language" style="font-size:12px;font-weight:600;letter-spacing:0">
        <span id="lang-label">EN</span>
      </button>
      <button class="icon-btn" id="notif-btn" aria-label="Notifications" data-t-tip="tip.notifications">
        ${NX.icon('bell')}
        <span class="dot dot--signal" style="position:absolute;margin-inline-start:14px;margin-block-start:-12px"></span>
      </button>
      <button class="avatar avatar--sm" id="user-btn" aria-label="Account" style="margin-inline-start:var(--nx-space-1)">س‌م</button>
      <div class="menu" id="user-menu" role="menu" style="inset-block-start:calc(100% + 6px);inset-inline-end:var(--nx-space-6);min-width:240px">
        <div style="padding:var(--nx-space-3);border-block-end:1px solid var(--nx-border-faint)">
          <div style="font-size:var(--nx-text-sm);font-weight:500" data-t="user.name"></div>
          <div class="t-caption" data-t="user.email"></div>
        </div>
        <button class="menu__item" role="menuitem">${NX.icon('user')}<span data-t="menu.profile"></span></button>
        <button class="menu__item" role="menuitem">${NX.icon('shield')}<span data-t="menu.security"></span></button>
        <button class="menu__item" role="menuitem">${NX.icon('card')}<span data-t="menu.billing"></span></button>
        <div class="menu__sep"></div>
        <button class="menu__item" role="menuitem" data-theme-action>
          ${NX.icon('moon')}
          <span class="grow" data-t="tip.theme"></span>
          <span class="badge badge--plain" data-theme-val></span>
        </button>
        <button class="menu__item" role="menuitem" data-lang-action>
          ${NX.icon('globe')}
          <span class="grow" data-t="tip.language"></span>
          <span class="badge badge--plain" data-lang-val></span>
        </button>
        <div class="menu__sep"></div>
        <button class="menu__item" role="menuitem">${NX.icon('logout')}<span data-t="menu.signout"></span></button>
      </div>
    </header>`;
  };

  /* Notification drawer, shared by all app screens.
     Grouped by day, with an explicit read/unread state that "mark all" can
     actually change — an approval queue that cannot be cleared is a trap. */
  NX.drawer = function () {
    const row = (n, unread) => `<button class="list__row notif__row" data-unread="${unread ? 'true' : 'false'}"
        style="align-items:flex-start;text-align:start;width:100%;background:none;border:0;cursor:pointer">
      <span class="dot notif__dot ${unread ? 'dot--signal' : 'dot--idle'}" style="margin-block-start:7px"></span>
      <div class="list__main">
        <div class="list__title"><span data-t="notif.${n}.title"></span></div>
        <div class="t-caption" style="margin-block-start:2px" data-t="notif.${n}.body"></div>
      </div>
      <span class="list__meta"><span data-t="notif.${n}.when"></span></span>
    </button>`;

    return `<div class="drawer" id="notif-drawer" role="dialog" aria-modal="true" aria-labelledby="notif-title">
      <div class="modal__head" style="padding:var(--nx-space-5)">
        <div>
          <div class="t-h3" id="notif-title" data-t="notif.title"></div>
          <div class="t-caption"><span id="notif-sub" data-t="notif.sub"></span></div>
        </div>
        <button class="icon-btn" data-drawer-close data-t-aria="common.close">${NX.icon('x')}</button>
      </div>
      <div class="tabs" style="padding-inline:var(--nx-space-5);gap:var(--nx-space-4)">
        <button class="tab" aria-selected="true">
          <span data-t="notif.all"></span><span class="tab__count" id="notif-count">2</span>
        </button>
        <button class="tab" aria-selected="false"><span data-t="notif.mentions"></span></button>
        <button class="tab" aria-selected="false"><span data-t="notif.system"></span></button>
      </div>
      <div class="list grow" style="overflow-y:auto">
        <div class="rule-label" style="padding:var(--nx-space-3) var(--nx-space-5) var(--nx-space-1)">
          <span data-t="notif.today"></span>
        </div>
        ${row(1, true)}
        ${row(2, true)}
        <div class="rule-label" style="padding:var(--nx-space-4) var(--nx-space-5) var(--nx-space-1)">
          <span data-t="notif.earlier"></span>
        </div>
        ${row(3, false)}
        ${row(4, false)}
      </div>
      <div class="modal__foot" style="justify-content:space-between">
        <button class="btn btn--ghost btn--sm" data-notif-mark-all data-t="notif.markRead"></button>
        <button class="btn btn--secondary btn--sm" data-t="notif.settings"></button>
      </div>
    </div>`;
  };

  /* Command palette — proposed direction, flagged as such in the UI. */
  NX.palette = function () {
    const item = (icon, label, hint, sel) =>
      `<button class="palette__item" role="option"${sel ? ' aria-selected="true"' : ''}>${NX.icon(icon)}<span>${label}</span>${hint ? `<span class="kbd">${hint}</span>` : ''}</button>`;
    return `<div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Command centre">
      <div class="palette__input">
        ${NX.icon('search', 'icon-18')}
        <input id="palette-input" type="text" data-t-ph="palette.placeholder" autocomplete="off" />
        <span class="badge badge--signal" data-t="badge.proposal"></span>
      </div>
      <div class="palette__list" role="listbox">
        <div class="palette__group" data-t="palette.group.actions"></div>
        ${item('sparkle', '<span data-t="palette.newChat"></span>', '↵', true)}
        ${item('plus', '<span data-t="palette.newTask"></span>', '', false)}
        ${item('play', '<span data-t="palette.startTimer"></span>', '', false)}
        <div class="palette__group" data-t="palette.group.jump"></div>
        ${item('home', '<span data-t="nav.dashboard"></span>', 'G D', false)}
        ${item('users', '<span data-t="nav.members"></span>', 'G M', false)}
        ${item('chart', '<span data-t="nav.usage"></span>', '', false)}
        <div class="palette__group" data-t="palette.group.recent"></div>
        ${item('file', '<span data-t="palette.doc1"></span>', '', false)}
        ${item('folder', '<span data-t="palette.doc2"></span>', '', false)}
      </div>
      <div class="palette__foot">
        <span><span class="kbd">↑</span><span class="kbd">↓</span> <span data-t="palette.nav"></span></span>
        <span><span class="kbd">↵</span> <span data-t="palette.open"></span></span>
        <span><span class="kbd">Esc</span> <span data-t="palette.close"></span></span>
      </div>
    </div>`;
  };

  /* Prototype scaffolding. Deliberately styled as tooling, not product. */
  NX.devbar = function (screens, current) {
    const base = /\/(screens|components)\//.test(location.pathname) ? '../' : '';
    const links = screens
      .map(
        (s) =>
          `<a href="${base}${s.path}" style="text-decoration:none;color:inherit;opacity:${
            s.id === current ? 1 : 0.62
          };padding:5px 9px;border-radius:999px;white-space:nowrap;${
            s.id === current ? 'background:rgba(255,255,255,.14)' : ''
          }">${s.label}</a>`
      )
      .join('');
    return `<div class="devbar" role="group" aria-label="Prototype controls">
      <span class="devbar__label">PROTOTYPE</span>
      <button data-dev-theme="light">Light</button>
      <button data-dev-theme="dark">Dark</button>
      <span class="devbar__sep"></span>
      <button data-dev-lang="fa">فارسی</button>
      <button data-dev-lang="en">EN</button>
      <span class="devbar__sep"></span>
      ${links}
    </div>`;
  };

  NX.screens = [
    { id: 'index', path: 'index.html', label: 'Overview' },
    { id: 'auth', path: 'screens/auth.html', label: 'Auth' },
    { id: 'onboarding', path: 'screens/onboarding.html', label: 'Onboarding' },
    { id: 'dashboard', path: 'screens/shell.html', label: 'Dashboard' },
    { id: 'ai', path: 'screens/ai.html', label: 'AI' },
    { id: 'workspace', path: 'screens/workspace.html', label: 'Workspace' },
    { id: 'components', path: 'components/components.html', label: 'Components' },
  ];
})();
