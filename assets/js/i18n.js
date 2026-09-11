/* ==========================================================================
   BAO TECK TEA HOUSE — LANGUAGE ENGINE

   NO TEXT IS HARDCODED ANYWHERE ON THIS SITE.
   Every visible word comes from a file in /content/languages/.

   How it works:
     1. Each page loads the content files with ordinary <script> tags.
        They put themselves into window.BTTH.lang and window.BTTH.shared.
     2. HTML elements carry a key, e.g. <h1 data-i18n="home.hero.title"></h1>
     3. This engine walks the page and fills every key with the right words.
     4. It sets <html lang> and <html dir> so the correct typeface and
        reading direction follow automatically.

   WHY SCRIPT TAGS RATHER THAN FETCHING A FILE:
   browsers refuse to let a page opened straight from your hard drive read
   a separate data file. Script files are not blocked. This means the site
   works when you simply double-click index.html, and also works on a
   proper web server. No preview server required just to look at it.

   To add an eighth language: add a file to /content/languages/, add one
   line to the LANGUAGES list below, and add one <script> tag to each page.
   ========================================================================== */

'use strict';

window.BTTH = window.BTTH || {};
window.BTTH.lang = window.BTTH.lang || {};

const I18N = (() => {

  /* ----------------------------------------------------------------------
     THE LANGUAGES
     nativeName  how speakers write their own language. Never translate a
                 language's own name; always show it in its own script.
     dir         'ltr' or 'rtl'
     htmlLang    the correct BCP-47 tag for <html lang="">
     locale      used to format prices and numbers correctly
     ---------------------------------------------------------------------- */
  const LANGUAGES = [
    { code:'en',      nativeName:'English',         englishName:'English',                  dir:'ltr', htmlLang:'en',      locale:'en-GB' },
    { code:'ms',      nativeName:'Bahasa Melayu',   englishName:'Malay',                    dir:'ltr', htmlLang:'ms',      locale:'ms-MY' },
    { code:'zh-Hans', nativeName:'简体中文',          englishName:'Mandarin (Simplified)',    dir:'ltr', htmlLang:'zh-Hans', locale:'zh-Hans-MY' },
    { code:'zh-Hant', nativeName:'廣東話',            englishName:'Cantonese (Traditional)',  dir:'ltr', htmlLang:'zh-Hant', locale:'zh-Hant-HK' },
    { code:'ar',      nativeName:'العربية',          englishName:'Arabic',                   dir:'rtl', htmlLang:'ar',      locale:'ar' },
    { code:'th',      nativeName:'ไทย',              englishName:'Thai',                     dir:'ltr', htmlLang:'th',      locale:'th-TH' },
    { code:'ta',      nativeName:'தமிழ்',             englishName:'Tamil',                    dir:'ltr', htmlLang:'ta',      locale:'ta-MY' }
  ];

  const DEFAULT_LANG = 'en';
  const STORAGE_KEY  = 'btth.lang';

  let current = DEFAULT_LANG;
  let dict    = {};
  const listeners = [];

  /* ---------------------------------------------------------------------- */
  function lookup(obj, path) {
    if (!obj) return null;
    let node = obj;
    for (const part of path.split('.')) {
      if (node == null || typeof node !== 'object' || !(part in node)) return null;
      node = node[part];
    }
    return node;
  }

  function interpolate(str, vars) {
    if (typeof str !== 'string' || !vars) return str;
    return str.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  }

  /* PUBLIC: fetch a translated string. Falls back to English rather than
     ever showing the visitor a raw key or an empty space. */
  function t(key, vars) {
    let val = lookup(dict, key);
    if (typeof val !== 'string') {
      val = lookup(window.BTTH.lang[DEFAULT_LANG], key);
      if (typeof val !== 'string') {
        console.warn('[i18n] missing key:', key, '(language: ' + current + ')');
        return '';
      }
    }
    return interpolate(val, vars);
  }

  /* Prices.
     The number itself is grouped the way the reader's language groups
     numbers, but the symbol is always RM, because that is what is written
     on menus and price lists in Malaysia. Intl would otherwise print the
     code "MYR", which nobody uses in a shop. */
  function price(amount) {
    const lang = LANGUAGES.find(l => l.code === current) || LANGUAGES[0];
    let n;
    try {
      n = new Intl.NumberFormat(lang.locale, {
        minimumFractionDigits: 2, maximumFractionDigits: 2
      }).format(amount);
    } catch (e) {
      n = Number(amount).toFixed(2);
    }
    return 'RM ' + n;
  }

  /* ----------------------------------------------------------------------
     Fill the page.
     Translated strings are always written with textContent, never innerHTML,
     so nothing in a content file can ever run as code.
     ---------------------------------------------------------------------- */
  function apply(root = document) {
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const val = t(el.getAttribute('data-i18n'));
      if (val !== '') el.textContent = val;
    });

    const attrMap = {
      'data-i18n-alt':        'alt',
      'data-i18n-title':      'title',
      'data-i18n-placeholder':'placeholder',
      'data-i18n-aria-label': 'aria-label',
      'data-i18n-content':    'content',
      'data-i18n-value':      'value'
    };
    Object.entries(attrMap).forEach(([dataAttr, realAttr]) => {
      root.querySelectorAll('[' + dataAttr + ']').forEach(el => {
        const val = t(el.getAttribute(dataAttr));
        if (val !== '') el.setAttribute(realAttr, val);
      });
    });

    const titleKey = document.documentElement.getAttribute('data-page-title-key');
    if (titleKey) {
      const val = t(titleKey);
      if (val) document.title = val + ' · ' + t('site.name');
    }

    listeners.forEach(fn => {
      try { fn(current, dict, window.BTTH.shared); }
      catch (err) { console.error('[i18n] listener failed:', err); }
    });
  }

  /* ---------------------------------------------------------------------- */
  function applyDocumentAttributes(langObj) {
    const html = document.documentElement;
    html.setAttribute('lang', langObj.htmlLang);
    html.setAttribute('dir',  langObj.dir);
    html.setAttribute('data-lang', langObj.code);

    const label = document.querySelector('[data-lang-current]');
    if (label) label.textContent = langObj.nativeName;

    /* On a narrow screen the button shows a short code instead of the full
       native name, so the row still fits. The full name is in the menu. */
    document.querySelectorAll('.lang-switch__toggle').forEach(t => {
      t.setAttribute('data-short', langObj.code.split('-')[0].toUpperCase());
    });

    document.querySelectorAll('[data-lang-code]').forEach(btn => {
      btn.setAttribute('aria-current', btn.dataset.langCode === langObj.code ? 'true' : 'false');
    });
  }

  /* ----------------------------------------------------------------------
     Switch language. Everything is already in memory, so this is instant.
     ---------------------------------------------------------------------- */
  function load(code, { save = true, animate = true } = {}) {
    let langObj = LANGUAGES.find(l => l.code === code);
    if (!langObj || !window.BTTH.lang[code]) {
      if (code !== DEFAULT_LANG) {
        console.warn('[i18n] "' + code + '" is not available; using ' + DEFAULT_LANG);
        return load(DEFAULT_LANG, { save: false, animate: false });
      }
      langObj = LANGUAGES[0];
    }

    dict = window.BTTH.lang[code] || {};
    current = code;
    I18N.current = code;

    if (save) { try { localStorage.setItem(STORAGE_KEY, code); } catch (e) {} }

    const main = document.querySelector('main');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const finish = () => {
      applyDocumentAttributes(langObj);
      apply();
      document.dispatchEvent(new CustomEvent('i18n:changed', {
        detail: { lang: code, dir: langObj.dir }
      }));
      if (animate && main && !reduced) {
        requestAnimationFrame(() => { main.style.opacity = '1'; });
        setTimeout(() => { main.style.transition = ''; main.style.opacity = ''; }, 420);
      }
    };

    if (animate && main && !reduced) {
      main.style.transition = 'opacity 160ms ease';
      main.style.opacity = '0';
      setTimeout(finish, 160);
    } else {
      finish();
    }
    return code;
  }

  /* ----------------------------------------------------------------------
     Choose the starting language:
       1. ?lang= in the address  (so links can be shared in one language)
       2. whatever they chose last time
       3. their browser's own language
       4. English
     ---------------------------------------------------------------------- */
  function detect() {
    try {
      const urlLang = new URLSearchParams(window.location.search).get('lang');
      if (urlLang && LANGUAGES.some(l => l.code === urlLang)) return urlLang;
    } catch (e) {}

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LANGUAGES.some(l => l.code === saved)) return saved;
    } catch (e) {}

    const nav = (navigator.languages || [navigator.language || '']).map(String);
    for (const raw of nav) {
      const low = raw.toLowerCase();
      const exact = LANGUAGES.find(l => l.code.toLowerCase() === low);
      if (exact) return exact.code;
      if (low.startsWith('zh')) return /hant|tw|hk|mo/.test(low) ? 'zh-Hant' : 'zh-Hans';
      const base = low.split('-')[0];
      const hit = LANGUAGES.find(l => l.code.split('-')[0] === base);
      if (hit) return hit.code;
    }
    return DEFAULT_LANG;
  }

  /* ----------------------------------------------------------------------
     The language menu, built from the list above
     ---------------------------------------------------------------------- */
  function buildSwitcher() {
    document.querySelectorAll('[data-lang-menu]').forEach(menu => {
      menu.replaceChildren();
      LANGUAGES.forEach(lang => {
        const li  = document.createElement('li');
        li.className = 'lang-switch__item';
        li.setAttribute('role', 'none');

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'lang-switch__btn';
        btn.setAttribute('role', 'menuitemradio');
        btn.setAttribute('lang', lang.htmlLang);
        btn.setAttribute('dir', lang.dir);
        btn.dataset.langCode = lang.code;
        btn.setAttribute('aria-current', lang.code === current ? 'true' : 'false');

        const native = document.createElement('span');
        native.className = 'lang-switch__native';
        native.textContent = lang.nativeName;

        const en = document.createElement('span');
        en.className = 'lang-switch__en';
        en.setAttribute('dir', 'ltr');
        en.textContent = lang.englishName;

        btn.append(native, en);
        btn.addEventListener('click', () => {
          load(lang.code);
          const root = menu.closest('.lang-switch');
          if (root) {
            root.dataset.open = 'false';
            const tgl = root.querySelector('.lang-switch__toggle');
            if (tgl) { tgl.setAttribute('aria-expanded', 'false'); tgl.focus(); }
          }
        });

        li.appendChild(btn);
        menu.appendChild(li);
      });
    });
  }

  function wireSwitcher() {
    document.querySelectorAll('.lang-switch').forEach(root => {
      if (root.dataset.wired) return;
      root.dataset.wired = '1';

      const toggle = root.querySelector('.lang-switch__toggle');
      const menu   = root.querySelector('.lang-switch__menu');
      if (!toggle || !menu) return;

      const close = () => { root.dataset.open = 'false'; toggle.setAttribute('aria-expanded', 'false'); };
      const open  = () => {
        root.dataset.open = 'true';
        toggle.setAttribute('aria-expanded', 'true');
        const first = menu.querySelector('[aria-current="true"]') || menu.querySelector('button');
        if (first) first.focus();
      };

      toggle.addEventListener('click', e => {
        e.stopPropagation();
        root.dataset.open === 'true' ? close() : open();
      });

      menu.addEventListener('keydown', e => {
        const items = Array.from(menu.querySelectorAll('button'));
        const i = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
        if (e.key === 'Home')      { e.preventDefault(); items[0].focus(); }
        if (e.key === 'End')       { e.preventDefault(); items[items.length - 1].focus(); }
        if (e.key === 'Escape')    { e.preventDefault(); close(); toggle.focus(); }
      });

      document.addEventListener('click', e => { if (!root.contains(e.target)) close(); });
    });
  }

  /* ---------------------------------------------------------------------- */
  function onChange(fn) { listeners.push(fn); }

  function init() {
    if (!window.BTTH.lang[DEFAULT_LANG]) {
      console.error('[i18n] No content loaded. Check that the <script> tags for ' +
                    '/content/shared.js and /content/languages/*.js are present.');
      document.documentElement.classList.add('i18n-failed');
      return;
    }
    buildSwitcher();
    wireSwitcher();
    load(detect(), { save: false, animate: false });
    buildSwitcher();
    wireSwitcher();
    document.documentElement.classList.add('i18n-ready');
  }

  /* The header is built by site.js AFTER this engine starts, so the language
     menu has to be mounted again once that header exists. site.js calls this. */
  function mountSwitcher() {
    buildSwitcher();
    wireSwitcher();
    const langObj = LANGUAGES.find(l => l.code === current) || LANGUAGES[0];
    const label = document.querySelector('[data-lang-current]');
    if (label) label.textContent = langObj.nativeName;
  }

  return {
    init, load, t, price, apply, onChange, mountSwitcher,
    LANGUAGES, current: DEFAULT_LANG,
    get dict()   { return dict; },
    get shared() { return window.BTTH.shared || {}; }
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => I18N.init());
} else {
  I18N.init();
}
