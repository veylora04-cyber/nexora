/* NEXORA prototype · i18n + formatting core
   Persian is the primary locale: digits, calendar and direction are all
   derived from the active language, never hardcoded per screen. */

(function () {
  window.NX = window.NX || {};

  const i18n = {
    lang: localStorage.getItem('nx.lang') || 'fa',
    dict: {},

    add(obj) {
      Object.assign(this.dict, obj);
      return this;
    },

    t(key) {
      const e = this.dict[key];
      if (!e) return key; // visible in QA, never silently blank
      return e[this.lang] != null ? e[this.lang] : e.fa != null ? e.fa : key;
    },

    dir() {
      return this.lang === 'fa' ? 'rtl' : 'ltr';
    },

    /* Numbers: Persian digits + Persian thousands separator for fa. */
    num(value, decimals) {
      const n = typeof value === 'string' ? parseFloat(value) : value;
      if (!isFinite(n)) return String(value);
      return new Intl.NumberFormat(this.lang === 'fa' ? 'fa-IR' : 'en-US', {
        minimumFractionDigits: decimals || 0,
        maximumFractionDigits: decimals == null ? 0 : decimals,
      }).format(n);
    },

    /* Dates: Jalali calendar in Persian, Gregorian in English. */
    date(value, style) {
      const d = value instanceof Date ? value : new Date(value);
      if (isNaN(d)) return String(value);
      const locale = this.lang === 'fa' ? 'fa-IR' : 'en-GB';
      const calendar = this.lang === 'fa' ? 'persian' : 'gregory';
      const presets = {
        short: { month: 'short', day: 'numeric' },
        medium: { year: 'numeric', month: 'short', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
        time: { hour: '2-digit', minute: '2-digit', hour12: false },
        daymonth: { day: 'numeric', month: 'long' },
      };
      return new Intl.DateTimeFormat(locale, Object.assign({ calendar }, presets[style] || presets.medium)).format(d);
    },

    apply(root) {
      const scope = root || document;
      document.documentElement.lang = this.lang;
      /* A page may pin its direction (e.g. the English-only component
         reference) so its specs stay readable whatever the UI language is. */
      const lock = document.documentElement.getAttribute('data-dir-lock');
      document.documentElement.dir = lock || this.dir();

      scope.querySelectorAll('[data-t]').forEach((el) => {
        const v = this.t(el.getAttribute('data-t'));
        if (el.hasAttribute('data-t-html')) el.innerHTML = v;
        else el.textContent = v;
      });
      scope.querySelectorAll('[data-t-ph]').forEach((el) => {
        el.setAttribute('placeholder', this.t(el.getAttribute('data-t-ph')));
      });
      scope.querySelectorAll('[data-t-aria]').forEach((el) => {
        el.setAttribute('aria-label', this.t(el.getAttribute('data-t-aria')));
      });
      scope.querySelectorAll('[data-t-tip]').forEach((el) => {
        el.setAttribute('data-tip', this.t(el.getAttribute('data-t-tip')));
      });
      scope.querySelectorAll('[data-num]').forEach((el) => {
        const dec = el.getAttribute('data-num-dec');
        el.textContent = this.num(el.getAttribute('data-num'), dec == null ? 0 : parseInt(dec, 10));
      });
      scope.querySelectorAll('[data-date]').forEach((el) => {
        el.textContent = this.date(el.getAttribute('data-date'), el.getAttribute('data-date-style') || 'medium');
      });
      document.dispatchEvent(new CustomEvent('nx:lang', { detail: { lang: this.lang } }));
    },

    set(lang) {
      this.lang = lang;
      localStorage.setItem('nx.lang', lang);
      this.apply();
    },

    toggle() {
      this.set(this.lang === 'fa' ? 'en' : 'fa');
    },
  };

  NX.i18n = i18n;
  NX.t = (k) => i18n.t(k);
})();
