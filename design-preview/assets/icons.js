/* NEXORA prototype · icon system
   One style only: 24px grid, 1.5px stroke, round caps/joins, no fills
   (brand marks excepted). Consistency here is what stops the UI reading
   as a mixed icon pack. */

(function () {
  const P = {
    home: '<path d="M3 10.4 12 3l9 7.4"/><path d="M5.6 9.6V20a1 1 0 0 0 1 1h3.9v-5.6h3v5.6h3.9a1 1 0 0 0 1-1V9.6"/>',
    sparkle: '<path d="M12 3.2l1.9 5.1 5.1 1.9-5.1 1.9L12 17.2l-1.9-5.1L5 10.2l5.1-1.9z"/><path d="M18.4 15.6l.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8z"/>',
    layers: '<path d="m12 3 8.6 4.7L12 12.4 3.4 7.7 12 3Z"/><path d="m3.4 12.3 8.6 4.7 8.6-4.7"/><path d="m3.4 16.6 8.6 4.7 8.6-4.7"/>',
    folder: '<path d="M3 7.4A1.4 1.4 0 0 1 4.4 6h3.9l2.1 2.6h7.2A1.4 1.4 0 0 1 19 10v7.6a1.4 1.4 0 0 1-1.4 1.4H4.4A1.4 1.4 0 0 1 3 17.6V7.4Z"/>',
    flow: '<circle cx="6" cy="6" r="2.4"/><circle cx="6" cy="18" r="2.4"/><circle cx="18" cy="12" r="2.4"/><path d="M8.4 6h2.2A3.4 3.4 0 0 1 14 9.4v.2"/><path d="M8.4 18h2.2A3.4 3.4 0 0 0 14 14.6v-.2"/><path d="M15.6 12h-1.2"/>',
    users: '<path d="M15.5 19.5v-1.3a3.7 3.7 0 0 0-3.7-3.7H7.2a3.7 3.7 0 0 0-3.7 3.7v1.3"/><circle cx="9.5" cy="7.8" r="3.3"/><path d="M16.6 11.1a3.3 3.3 0 0 0 0-6.6"/><path d="M20.5 19.5v-1.3a3.7 3.7 0 0 0-2.8-3.6"/>',
    chart: '<path d="M4.5 20V12"/><path d="M12 20V4.5"/><path d="M19.5 20v-6"/>',
    sliders: '<path d="M4 7.5h8.5"/><path d="M17.5 7.5H20"/><circle cx="15" cy="7.5" r="2.2"/><path d="M4 16.5h4.5"/><path d="M13.5 16.5H20"/><circle cx="11" cy="16.5" r="2.2"/>',
    search: '<circle cx="11" cy="11" r="6.6"/><path d="m20 20-4.3-4.3"/>',
    bell: '<path d="M18 9.2a6 6 0 1 0-12 0c0 4.6-2 5.8-2 5.8h16s-2-1.2-2-5.8"/><path d="M10.3 19.4a2 2 0 0 0 3.4 0"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.6v1.8M12 19.6v1.8M2.6 12h1.8M19.6 12h1.8M5.4 5.4l1.3 1.3M17.3 17.3l1.3 1.3M18.6 5.4l-1.3 1.3M6.7 17.3l-1.3 1.3"/>',
    moon: '<path d="M20.2 14.6A8.6 8.6 0 0 1 9.4 3.8a8.6 8.6 0 1 0 10.8 10.8Z"/>',
    chevronDown: '<path d="m6.5 9.5 5.5 5.5 5.5-5.5"/>',
    chevronRight: '<path d="m9.5 6 6 6-6 6"/>',
    chevronLeft: '<path d="m14.5 6-6 6 6 6"/>',
    plus: '<path d="M12 5.2v13.6M5.2 12h13.6"/>',
    check: '<path d="M20 6.5 9.2 17.3 4 12.1"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    alert: '<path d="M10.3 4 2.7 17.1A1.9 1.9 0 0 0 4.4 20h15.2a1.9 1.9 0 0 0 1.7-2.9L13.7 4a1.9 1.9 0 0 0-3.4 0Z"/><path d="M12 9.4v4"/><path d="M12 16.8h.01"/>',
    info: '<circle cx="12" cy="12" r="8.8"/><path d="M12 11v5.2"/><path d="M12 7.9h.01"/>',
    lock: '<rect x="4.6" y="10.2" width="14.8" height="10.3" rx="2.2"/><path d="M8.1 10.2V7.7a3.9 3.9 0 0 1 7.8 0v2.5"/>',
    key: '<circle cx="8.2" cy="15.8" r="3.7"/><path d="m10.9 13.1 8.4-8.4"/><path d="m16.4 4.6 3 3"/><path d="m14.1 6.9 3 3"/>',
    plug: '<path d="M9.2 3.2v5.6M14.8 3.2v5.6"/><path d="M6.4 8.8h11.2v3.1a5.6 5.6 0 0 1-11.2 0V8.8Z"/><path d="M12 17.5v3.3"/>',
    refresh: '<path d="M20 11.2A8 8 0 0 0 6.4 6.6L4 9"/><path d="M4 4.8V9h4.2"/><path d="M4 12.8a8 8 0 0 0 13.6 4.6L20 15"/><path d="M20 19.2V15h-4.2"/>',
    more: '<circle cx="5.2" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.8" cy="12" r="1.3"/>',
    arrowUpRight: '<path d="M7 17 17 7"/><path d="M8.6 7H17v8.4"/>',
    arrowRight: '<path d="M3.6 12h15.2"/><path d="m13.2 6.4 5.6 5.6-5.6 5.6"/>',
    command: '<path d="M9.2 9.2V6.8a2.4 2.4 0 1 0-2.4 2.4h9.2a2.4 2.4 0 1 0-2.4-2.4v9.2a2.4 2.4 0 1 0 2.4-2.4H6.8a2.4 2.4 0 1 0 2.4 2.4V9.2Z"/>',
    play: '<path d="M8.4 5.6v12.8l10.2-6.4-10.2-6.4Z"/>',
    clock: '<circle cx="12" cy="12" r="8.8"/><path d="M12 7.4V12l3.1 1.9"/>',
    file: '<path d="M13.4 3.2H7.2a2 2 0 0 0-2 2v13.6a2 2 0 0 0 2 2h9.6a2 2 0 0 0 2-2V8.6l-5.4-5.4Z"/><path d="M13.4 3.2v5.4h5.4"/>',
    filter: '<path d="M3.4 6.2h17.2l-6.8 7.7v5.6l-3.6-1.9v-3.7L3.4 6.2Z"/>',
    grid: '<rect x="3.6" y="3.6" width="6.9" height="6.9" rx="1.6"/><rect x="13.5" y="3.6" width="6.9" height="6.9" rx="1.6"/><rect x="3.6" y="13.5" width="6.9" height="6.9" rx="1.6"/><rect x="13.5" y="13.5" width="6.9" height="6.9" rx="1.6"/>',
    list: '<path d="M8.4 6.2h12.2M8.4 12h12.2M8.4 17.8h12.2"/><path d="M3.9 6.2h.01M3.9 12h.01M3.9 17.8h.01"/>',
    logout: '<path d="M9.4 20.8H6.2a2 2 0 0 1-2-2V5.2a2 2 0 0 1 2-2h3.2"/><path d="m16.2 16.8 4.8-4.8-4.8-4.8"/><path d="M21 12H9.4"/>',
    user: '<circle cx="12" cy="8.2" r="3.9"/><path d="M4.8 20.8a7.2 7.2 0 0 1 14.4 0"/>',
    shield: '<path d="M12 3.2 4.8 6v5.9c0 4.4 3 7.4 7.2 8.9 4.2-1.5 7.2-4.5 7.2-8.9V6L12 3.2Z"/><path d="m9.2 12 2 2 3.6-3.9"/>',
    card: '<rect x="2.8" y="5.6" width="18.4" height="12.8" rx="2.4"/><path d="M2.8 10h18.4"/><path d="M6.4 14.4h3.2"/>',
    external: '<path d="M14 4.2h5.8V10"/><path d="M19.8 4.2 11 13"/><path d="M17.6 13.6v5a1.8 1.8 0 0 1-1.8 1.8H5.2a1.8 1.8 0 0 1-1.8-1.8V8a1.8 1.8 0 0 1 1.8-1.8h4.6"/>',
    copy: '<rect x="8.6" y="8.6" width="11.6" height="11.6" rx="2"/><path d="M15.4 5.4A1.8 1.8 0 0 0 13.6 3.6H5.4a1.8 1.8 0 0 0-1.8 1.8v8.2a1.8 1.8 0 0 0 1.8 1.8"/>',
    trash: '<path d="M4.2 6.8h15.6"/><path d="M9.4 6.8V5.2a1.6 1.6 0 0 1 1.6-1.6h2a1.6 1.6 0 0 1 1.6 1.6v1.6"/><path d="m6.4 6.8 1 13a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5l1-13"/>',
    edit: '<path d="M12.4 20.4h8.4"/><path d="M16.6 3.8a2.1 2.1 0 0 1 3 3L7.2 19.2l-4 1 1-4L16.6 3.8Z"/>',
    send: '<path d="M21 3.4 10.6 13.8"/><path d="M21 3.4l-6.6 17.4-3.8-7.6L3 9.4 21 3.4Z"/>',
    clip: '<path d="M19.6 11.8 12 19.4a4.8 4.8 0 0 1-6.8-6.8l8-8a3.2 3.2 0 0 1 4.6 4.6l-7.8 7.8a1.6 1.6 0 0 1-2.3-2.3l7-7"/>',
    code: '<path d="m9.2 7.4-4.8 4.6 4.8 4.6"/><path d="m14.8 7.4 4.8 4.6-4.8 4.6"/>',
    database: '<ellipse cx="12" cy="6.2" rx="7.6" ry="2.9"/><path d="M4.4 6.2v5.6c0 1.6 3.4 2.9 7.6 2.9s7.6-1.3 7.6-2.9V6.2"/><path d="M4.4 11.8v5.6c0 1.6 3.4 2.9 7.6 2.9s7.6-1.3 7.6-2.9v-5.6"/>',
    globe: '<circle cx="12" cy="12" r="8.8"/><path d="M3.4 12h17.2"/><path d="M12 3.2a13.6 13.6 0 0 1 0 17.6 13.6 13.6 0 0 1 0-17.6Z"/>',
    calendar: '<rect x="3.6" y="5.4" width="16.8" height="15" rx="2.2"/><path d="M3.6 10.2h16.8"/><path d="M8.2 3.2v4M15.8 3.2v4"/>',
    inbox: '<path d="M3.4 12.4h4.6l1.4 2.8h5.2l1.4-2.8h4.6"/><path d="M4.9 12.4 7 5.6a2 2 0 0 1 1.9-1.4h6.2a2 2 0 0 1 1.9 1.4l2.1 6.8v5.8a2 2 0 0 1-2 2H6.9a2 2 0 0 1-2-2v-5.8Z"/>',
    star: '<path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8L12 3.6Z"/>',
    menu: '<path d="M3.4 6.6h17.2M3.4 12h17.2M3.4 17.4h17.2"/>',
    panel: '<rect x="3.4" y="4.4" width="17.2" height="15.2" rx="2.2"/><path d="M9.4 4.4v15.2"/>',
    download: '<path d="M12 3.4v11.8"/><path d="m7.2 10.4 4.8 4.8 4.8-4.8"/><path d="M4.2 20.4h15.6"/>',
    upload: '<path d="M12 15.8V4"/><path d="m7.2 8.8 4.8-4.8 4.8 4.8"/><path d="M4.2 20.4h15.6"/>',
    link: '<path d="M10.2 13.6a3.9 3.9 0 0 0 5.5 0l2.7-2.7a3.9 3.9 0 0 0-5.5-5.5l-1.2 1.2"/><path d="M13.8 10.4a3.9 3.9 0 0 0-5.5 0l-2.7 2.7a3.9 3.9 0 0 0 5.5 5.5l1.2-1.2"/>',
    eye: '<path d="M2.8 12S6.2 5.8 12 5.8 21.2 12 21.2 12 17.8 18.2 12 18.2 2.8 12 2.8 12Z"/><circle cx="12" cy="12" r="2.9"/>',
    eyeOff: '<path d="M3.4 3.4 20.6 20.6"/><path d="M10.4 6.1A9.6 9.6 0 0 1 12 6c5.8 0 9.2 6 9.2 6a16.6 16.6 0 0 1-2.6 3.4"/><path d="M6.6 7.9A15.4 15.4 0 0 0 2.8 12S6.2 18 12 18a9 9 0 0 0 3.5-.7"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    activity: '<path d="M3.2 12h3.9l2.4-6.6 3.9 13.2L15.8 12h5"/>',
    zap: '<path d="M13.2 2.6 4.8 13.4h5.9l-1 8 8.5-11h-5.9l1-7.8Z"/>',
    book: '<path d="M4.4 5.6A2.4 2.4 0 0 1 6.8 3.2h12.8v14.6H6.8a2.4 2.4 0 0 0-2.4 2.4V5.6Z"/><path d="M4.4 20.2a2.4 2.4 0 0 1 2.4-2.4h12.8v3H6.8"/>',
    terminal: '<rect x="3.4" y="4.6" width="17.2" height="14.8" rx="2.2"/><path d="m7.6 10 2.4 2.4-2.4 2.4"/><path d="M13 14.8h3.6"/>',
    message: '<path d="M20.2 11.8a7.6 7.6 0 0 1-7.6 7.6H8.4L4.2 22v-5.2a7.6 7.6 0 0 1 8-11.4 7.6 7.6 0 0 1 8 6.4Z"/>',
    mic: '<rect x="9.2" y="3.2" width="5.6" height="10.4" rx="2.8"/><path d="M5.8 11.4a6.2 6.2 0 0 0 12.4 0"/><path d="M12 17.6v3.2"/>',
    pause: '<path d="M9.2 5v14M14.8 5v14"/>',
    dot: '<circle cx="12" cy="12" r="4.2"/>',
    fingerprint: '<path d="M12 3.6a8.4 8.4 0 0 0-8.4 8.4"/><path d="M20.4 12A8.4 8.4 0 0 0 12 3.6"/><path d="M7.2 19.4a8.4 8.4 0 0 1-1.2-4.3"/><path d="M18 15.1a8.4 8.4 0 0 1-1.2 4.3"/><path d="M12 7.2a4.8 4.8 0 0 0-4.8 4.8c0 2.2.5 4.2 1.4 5.9"/><path d="M12 16.8V12"/><path d="M16.8 12A4.8 4.8 0 0 0 12 7.2"/><path d="M15.4 18.2c.6-1.3.9-2.7.9-4.2"/>',
    building: '<path d="M4.6 20.4V5a1.8 1.8 0 0 1 1.8-1.8h6a1.8 1.8 0 0 1 1.8 1.8v15.4"/><path d="M14.2 9.6h3.4a1.8 1.8 0 0 1 1.8 1.8v9"/><path d="M2.8 20.4h18.4"/><path d="M8 7.6h2.6M8 11.2h2.6M8 14.8h2.6"/>',
    target: '<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="3.4"/><path d="M12 3.6v2.2M12 18.2v2.2M3.6 12h2.2M18.2 12h2.2"/>',
    flag: '<path d="M5.4 21V4.2c3.6-1.8 6.4 1.2 9.6-.2 1.6-.7 3.2-.4 4.4.3v9c-1.2-.7-2.8-1-4.4-.3-3.2 1.4-6-1.6-9.6.2"/>',
    // Brand marks — single-colour, optically balanced at 18px.
    github: '<path d="M12 2.2a9.9 9.9 0 0 0-3.13 19.3c.5.1.68-.21.68-.48v-1.7c-2.76.6-3.34-1.33-3.34-1.33-.45-1.15-1.1-1.46-1.1-1.46-.9-.61.07-.6.07-.6 1 .07 1.52 1.02 1.52 1.02.88 1.5 2.3 1.07 2.85.82.09-.64.35-1.07.63-1.32-2.2-.25-4.52-1.1-4.52-4.9 0-1.08.39-1.96 1.02-2.65-.1-.25-.44-1.26.1-2.63 0 0 .84-.27 2.74 1.02a9.4 9.4 0 0 1 4.98 0c1.9-1.29 2.73-1.02 2.73-1.02.55 1.37.2 2.38.1 2.63.64.69 1.02 1.57 1.02 2.65 0 3.81-2.32 4.65-4.53 4.9.36.31.68.92.68 1.85v2.73c0 .27.18.59.69.49A9.9 9.9 0 0 0 12 2.2Z"/>',
    microsoft: '<rect x="3.4" y="3.4" width="8" height="8" rx="1"/><rect x="12.6" y="3.4" width="8" height="8" rx="1"/><rect x="3.4" y="12.6" width="8" height="8" rx="1"/><rect x="12.6" y="12.6" width="8" height="8" rx="1"/>',
    google: '<path d="M20.8 12.2a8.8 8.8 0 1 1-2.9-6.6"/><path d="M20.8 12.2h-8.6"/>',
  };

  // Filled marks are the only icons allowed to use fill.
  const FILLED = { github: true, microsoft: true };

  function symbol(name, d) {
    const attrs = FILLED[name]
      ? 'fill="currentColor" stroke="none"'
      : '';
    return `<symbol id="i-${name}" viewBox="0 0 24 24" ${attrs}>${d}</symbol>`;
  }

  const sprite = `<svg aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden">${Object.keys(
    P
  )
    .map((n) => symbol(n, P[n]))
    .join('')}</svg>`;

  window.NX = window.NX || {};
  window.NX.iconNames = Object.keys(P);
  const DIRECTIONAL = ['arrowRight', 'chevronRight', 'chevronLeft', 'logout', 'send', 'external', 'panel'];
  window.NX.icon = function (name, cls) {
    const dir = DIRECTIONAL.indexOf(name) > -1 ? ' icon-dir' : '';
    return `<svg class="icon${dir}${cls ? ' ' + cls : ''}" aria-hidden="true" focusable="false"><use href="#i-${name}"></use></svg>`;
  };
  window.NX.mountSprite = function () {
    if (document.getElementById('nx-sprite')) return;
    const host = document.createElement('div');
    host.id = 'nx-sprite';
    host.innerHTML = sprite;
    document.body.insertBefore(host.firstElementChild, document.body.firstChild);
  };
  // Directional icons that must mirror in RTL.
  window.NX.isDirectional = function (name) {
    return ['arrowRight', 'arrowUpRight', 'chevronRight', 'chevronLeft', 'logout', 'send', 'external', 'panel'].includes(name);
  };
})();
