/* ==========================================================================
   BAO TECK TEA HOUSE — SITE BUILDER

   Builds the header, footer, menu, tea list, opening hours, gallery,
   WhatsApp buttons and the search-engine data from the content files.

   The header and footer are built here, in one place. Change a navigation
   link once and it changes on every page.
   ========================================================================== */

'use strict';

const SITE = (() => {

  const base = () => /\/pages\/[^/]*$/.test(window.location.pathname) ? '../' : './';
  const link = f => (f === 'index.html' ? base() + 'index.html' : base() + 'pages/' + f);

  /* ======================================================================
     THE SHOP LOGO

     The website shows the shop's own name, 包德館, set in type. It does NOT
     show an invented emblem, because the shop's real logo is the carved sign
     over the door and only the shop can supply that file.

     WHEN THE OWNER HAS THE REAL LOGO:
     The file name lives in content/shared.js, under brand.logoFile, and is
     also a plain field on the Brand tab of admin/index.html — so switching
     it on never needs a developer or a code edit, only the same Save-and-
     upload routine as every other change on the site. See that file's own
     "_logoFile_note" for the exact steps. Leave it blank and the name in
     type is what shows, which is deliberate: nothing here ever invents a
     logo of its own.
     ====================================================================== */

  /* The Chinese label beside each entry in the phone menu is decorative and
     is written in Traditional characters to match the carved shop sign. It is
     hidden from screen readers, since the link already has a spoken name. */
  const NAV = [
    { key: 'nav.home',    file: 'index.html',   cn: '首頁' },
    { key: 'nav.menu',    file: 'menu.html',    cn: '點心' },
    { key: 'nav.tea',     file: 'tea.html',     cn: '茶'   },
    { key: 'nav.story',   file: 'story.html',   cn: '緣起' },
    { key: 'nav.gallery', file: 'gallery.html', cn: '光影' },
    { key: 'nav.visit',   file: 'visit.html',   cn: '蒞臨' },
    { key: 'nav.reserve', file: 'reserve.html', cn: '訂'   }
  ];

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (v === null || v === undefined || v === false) return;
      if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v;   // only ever our own icon constants
      else node.setAttribute(k, v);
    });
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  const LOGO_CN = '<svg viewBox="0 0 332 104" fill="currentColor" aria-hidden="true" class="logo__cn"><path d="M25.6 2.799999999999997C20.900000000000002 20.39999999999999 11.8 37.5 2.9000000000000004 47.9L4.0 48.8C9.3 45.599999999999994 14.3 41.8 18.900000000000002 37.3V83.1C18.900000000000002 93.6 24.6 95.1 39.6 95.1H60.0C90.5 95.1 96.5 93.4 96.5 87.2C96.5 85.0 95.10000000000001 83.7 90.7 82.3L90.30000000000001 66.8H89.30000000000001C86.4 75.3 84.60000000000001 79.6 83.0 82.0C81.9 83.2 80.80000000000001 83.8 78.30000000000001 84.0C75.10000000000001 84.2 68.60000000000001 84.3 60.800000000000004 84.3H39.2C32.1 84.3 30.5 83.5 30.5 80.4V58.599999999999994H48.900000000000006V64.6H50.900000000000006C53.300000000000004 64.6 56.400000000000006 63.7 58.5 62.8C59.6 62.3 60.5 61.8 60.5 61.5V39.5C62.6 39.099999999999994 64.0 38.199999999999996 64.60000000000001 37.4L53.400000000000006 28.9L48.0 34.699999999999996H31.5L23.900000000000002 31.799999999999997C26.3 29.0 28.6 25.9 30.700000000000003 22.599999999999994H75.7C75.0 47.5 73.5 59.7 70.8 62.2C69.9 63.0 69.0 63.3 67.5 63.3C65.7 63.3 61.2 63.0 58.5 62.8L58.300000000000004 64.1C61.800000000000004 65.0 64.10000000000001 66.2 65.4 67.9C66.60000000000001 69.6 66.9 72.3 66.9 76.1C72.0 76.1 76.2 74.8 79.4 71.9C84.80000000000001 67.2 86.60000000000001 55.8 87.5 24.599999999999994C89.7 24.299999999999997 90.9 23.599999999999994 91.7 22.700000000000003L81.0 13.599999999999994L74.7 19.799999999999997H32.5C34.2 16.89999999999999 35.9 13.799999999999997 37.4 10.5C39.7 10.699999999999989 41.0 9.899999999999991 41.5 8.599999999999994ZM48.900000000000006 55.8H30.5V37.5H48.900000000000006Z"/><path d="M154.9 66.2 153.4 66.1C153.8 70.7 150.4 76.1 147.9 78.2C145.0 80.1 143.3 83.2 144.8 86.5C146.6 90.2 152.2 90.3 154.5 87.7C157.6 84.0 158.5 76.4 154.9 66.2ZM195.3 65.4 194.3 66.0C198.4 71.0 202.7 78.7 203.3 85.4C213.0 93.2 222.3 73.0 195.3 65.4ZM174.2 61.2 173.2 61.8C176.3 65.8 178.8 72.2 178.5 77.8C187.2 85.9 198.0 67.9 174.2 61.2ZM173.9 65.9 160.9 64.8V85.7C160.9 92.4 162.5 94.2 171.6 94.2H181.2C196.2 94.2 200.2 92.3 200.2 88.1C200.2 86.2 199.5 85.1 196.7 84.0L196.4 74.7H195.3C193.8 79.1 192.5 82.5 191.7 83.8C191.10000000000002 84.6 190.5 84.8 189.3 84.8C188.2 84.9 185.4 85.0 182.2 85.0H174.0C171.2 85.0 170.8 84.6 170.8 83.4V68.4C172.8 68.1 173.7 67.2 173.9 65.9ZM150.4 10.799999999999997 137.0 3.0C133.5 11.299999999999997 125.9 24.099999999999994 118.5 32.5L119.4 33.5C130.2 27.699999999999996 140.3 18.89999999999999 146.5 12.0C148.9 12.399999999999991 149.9 11.799999999999997 150.4 10.799999999999997ZM202.3 7.3999999999999915 196.2 15.299999999999997H184.3L185.5 8.899999999999991C187.8 8.799999999999997 189.2 7.8999999999999915 189.60000000000002 6.5L174.1 2.799999999999997L172.4 15.299999999999997H146.9L147.7 18.099999999999994H171.9L170.5 27.099999999999994H162.7L152.1 22.89999999999999V54.8H153.8C158.6 54.8 161.7 53.1 161.7 52.4V50.4H196.9V53.199999999999996H198.60000000000002L200.0 53.1L196.2 57.7H146.6L147.4 60.5H210.7C212.10000000000002 60.5 213.10000000000002 60.0 213.4 58.9C210.7 56.7 207.0 54.0 204.60000000000002 52.3C206.0 51.8 206.8 51.3 206.8 51.0V30.599999999999994C209.0 30.299999999999997 209.9 29.699999999999996 210.60000000000002 28.799999999999997L201.2 21.799999999999997L196.5 27.099999999999994H182.0L183.7 18.099999999999994H210.60000000000002C212.10000000000002 18.099999999999994 213.10000000000002 17.599999999999994 213.4 16.5C209.3 12.799999999999997 202.3 7.3999999999999915 202.3 7.3999999999999915ZM182.5 47.5H176.3V30.0H182.5ZM190.8 47.5V30.0H196.9V47.5ZM168.2 47.5H161.7V30.0H168.2ZM145.6 44.4 141.2 42.8C143.9 39.199999999999996 146.2 35.8 148.1 32.599999999999994C150.7 32.8 151.6 32.199999999999996 152.0 31.099999999999994L137.1 24.0C134.0 35.199999999999996 126.7 52.4 118.3 63.8L119.2 64.7C123.5 61.8 127.5 58.3 131.1 54.6V97.0H133.2C138.1 97.0 142.4 94.1 142.5 93.1V46.3C144.3 46.0 145.2 45.3 145.6 44.4Z"/><path d="M293.3 92.8V86.8H313.0V95.0H314.7C318.2 95.0 323.2 92.7 323.3 92.0V67.6C325.1 67.2 326.4 66.4 327.0 65.7L316.8 58.0L312.0 63.2H293.3V52.0H309.3V56.9H311.1C314.4 56.9 319.5 55.1 319.6 54.4V35.4C321.4 35.0 322.7 34.3 323.3 33.599999999999994L317.1 28.9C320.3 26.799999999999997 324.3 23.5 326.8 21.200000000000003C328.8 21.0 329.8 20.799999999999997 330.6 20.0L320.7 10.599999999999994L315.1 16.200000000000003H305.3C310.6 13.399999999999991 310.9 3.5999999999999943 293.1 2.1999999999999886L292.3 2.799999999999997C294.9 5.799999999999997 297.4 10.599999999999994 297.5 15.200000000000003L299.1 16.200000000000003H285.5C285.0 14.299999999999997 284.3 12.399999999999991 283.4 10.299999999999997L281.9 10.399999999999991C282.8 15.599999999999994 280.4 21.299999999999997 277.8 23.599999999999994C275.2 25.199999999999996 273.5 27.799999999999997 274.8 30.799999999999997C276.2 34.0 280.3 34.199999999999996 282.9 32.199999999999996V96.5H284.5C289.2 96.5 293.3 94.1 293.3 92.8ZM285.7 27.699999999999996C286.4 25.4 286.6 22.5 286.1 19.099999999999994H316.0L315.3 27.5L313.2 25.9L308.4 31.099999999999994H293.8ZM293.3 83.9V66.1H313.0V83.9ZM309.3 34.0V49.099999999999994H293.3V34.0ZM261.0 9.5C263.7 9.399999999999991 264.8 8.5 265.1 7.199999999999989L248.4 2.5C246.7 12.599999999999994 240.9 30.0 234.4 39.8L235.3 40.5C237.3 39.099999999999994 239.2 37.5 241.1 35.9V80.6C241.1 82.8 240.7 83.7 237.6 85.5L243.5 96.8C244.7 96.2 246.1 94.9 246.9 92.9C254.0 87.9 260.2 83.0 264.5 79.5C265.8 82.5 266.8 85.7 267.2 88.6C276.8 96.4 286.3 76.9 260.0 68.9L259.0 69.4C260.5 71.7 262.1 74.4 263.5 77.2L251.5 81.3V63.9H262.5V66.8H264.3C267.5 66.8 272.6 64.8 272.7 64.0V41.699999999999996C274.3 41.3 275.5 40.599999999999994 276.0 40.0L266.3 32.699999999999996L261.6 37.599999999999994H252.0L243.0 34.099999999999994C244.7 32.5 246.3 30.799999999999997 247.8 29.099999999999994L248.2 30.4H266.8C268.2 30.4 269.2 29.9 269.4 28.799999999999997C266.2 25.699999999999996 261.0 21.599999999999994 261.0 21.599999999999994L256.4 27.5H249.2C253.6 22.39999999999999 257.3 16.89999999999999 259.9 11.799999999999997C263.2 16.200000000000003 265.4 21.200000000000003 266.2 24.799999999999997C273.4 31.799999999999997 285.8 16.5 260.8 10.0ZM251.5 40.3H262.5V49.0H251.5ZM251.5 61.0V51.9H262.5V61.0Z"/></svg>';

  const ICON = {
    globe:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18"/></svg>',
    sun:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="4.4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    menu:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="20" height="20" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>',
    chevron:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="14" height="14" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    fb:     '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z"/></svg>',
    ig:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>',
    tt:     '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.5 3c.4 2.3 1.9 3.9 4.2 4.1v2.9c-1.5.1-2.9-.3-4.2-1.1v5.9c0 4-3.3 6.6-6.8 5.9-2.7-.5-4.6-2.9-4.6-5.7 0-3.4 3-6 6.4-5.6v3c-.4-.1-.8-.2-1.2-.2-1.5 0-2.7 1.3-2.5 2.9.1 1.2 1.1 2.1 2.3 2.2 1.5.1 2.8-1.1 2.8-2.6V3h3.6z"/></svg>',
    wa:     '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.22-8.24 8.22zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.8-.78.97-.15.16-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.74 2.65 4.21 3.72.59.25 1.05.4 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/></svg>',
    up:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="20" height="20" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>'
  };

  /* ======================================================================
     HEADER
     ====================================================================== */
  function buildHeader(shared) {
    const mount = document.querySelector('[data-site-header]');
    if (!mount) return;

    const logoFile = shared.brand.logoFile;
    const mark = logoFile
      ? el('img', { src: base() + 'images/brand/' + logoFile,
                    alt: '', height: '58' })
      : null;

    const logo = el('a', { class: 'logo', href: link('index.html'), 'aria-label': 'Bao Teck Tea House' }, [
      el('span', { class: 'logo__mark no-flip', html: mark ? '' : LOGO_CN }, mark),
      el('span', { class: 'logo__text' }, [
        el('span', { class: 'logo__name', text: 'Bao Teck' }),
        el('span', { class: 'logo__sub',  text: 'Tea House' })
      ])
    ]);

    const links = el('ul', { class: 'nav__links', role: 'list' },
      NAV.map(n => el('li', {}, el('a', { class: 'nav__link', href: link(n.file), 'data-i18n': n.key }))));

    const langSwitch = el('div', { class: 'lang-switch', 'data-open': 'false' }, [
      el('button', {
        class: 'lang-switch__toggle', type: 'button',
        'aria-haspopup': 'true', 'aria-expanded': 'false',
        'data-i18n-aria-label': 'nav.chooseLanguage',
        html: ICON.globe + '<span data-lang-current>English</span>' + ICON.chevron
      })
      ,
      el('ul', { class: 'lang-switch__menu', role: 'menu', 'data-lang-menu': '' })
    ]);

    const themeBtn = el('button', {
      class: 'icon-btn', type: 'button', 'data-theme-toggle': '',
      'aria-pressed': 'false', 'data-i18n-aria-label': 'nav.toggleTheme', html: ICON.sun
    });

    const navToggle = el('button', {
      class: 'icon-btn nav__toggle', type: 'button',
      'aria-expanded': 'false', 'aria-controls': 'mobile-nav',
      'data-i18n-aria-label': 'nav.openMenu', html: ICON.menu
    });

    mount.replaceChildren(
      el('div', { class: 'wrap' },
        el('nav', { class: 'nav', 'aria-label': 'Main' }, [
          logo, links, el('div', { class: 'nav__actions' }, [langSwitch, themeBtn, navToggle])
        ])));

    if (!document.querySelector('.mobile-nav')) {
      /* A phone has no Escape key, so the panel must carry its own way out.
         Without this the menu is a trap: it covers the header, which means it
         also covers the button that opened it, and the only escape is to
         navigate somewhere else. */
      const closeBtn = el('button', {
        type: 'button', class: 'mobile-nav__close', 'data-nav-close': '',
        'data-i18n-aria-label': 'nav.closeMenu', 'aria-label': 'Close menu',
        html: ICON.close
      });

      document.body.appendChild(
        el('div', { class: 'mobile-nav', id: 'mobile-nav', 'data-open': 'false' }, [
          closeBtn,
          el('span', { class: 'mobile-nav__seal', 'aria-hidden': 'true' }, '包'),
          el('ul', { class: 'mobile-nav__list', role: 'list' },
            NAV.map(n => el('li', {}, el('a', { class: 'mobile-nav__link', href: link(n.file) }, [
              el('span', { class: 'mobile-nav__cn', 'aria-hidden': 'true' }, n.cn),
              el('span', { class: 'mobile-nav__en', 'data-i18n': n.key })
            ])))),
          el('a', {
            class: 'btn btn--whatsapp mobile-nav__wa', href: shared.contact.whatsappUrl,
            target: '_blank', rel: 'noopener noreferrer',
            html: ICON.wa + '<span data-i18n="common.whatsapp">WhatsApp</span>'
          }),
          el('span', { class: 'mobile-nav__motto', 'aria-hidden': 'true' },
            shared.brand.mottoRight + '　' + shared.brand.mottoLeft)
        ]));
    }
  }

  /* ======================================================================
     FLOATING WHATSAPP BUTTON
     ====================================================================== */
  function buildWhatsApp(shared) {
    if (document.querySelector('.wa-float')) return;
    const a = el('a', {
      class: 'wa-float', href: shared.contact.whatsappUrl,
      target: '_blank', rel: 'noopener noreferrer',
      'data-i18n-aria-label': 'common.whatsappUs', html: ICON.wa
    });
    document.body.appendChild(a);
  }

  /* ======================================================================
     FOOTER
     ====================================================================== */
  function buildFooter(shared) {
    const mount = document.querySelector('[data-site-footer]');
    if (!mount) return;
    const c = shared.contact, s = shared.social, b = shared.brand;

    mount.replaceChildren(
      el('div', { class: 'wrap' }, [
        el('div', { class: 'footer-arch' },
          el('img', { src: base() + 'assets/svg/logo-wordmark-gilt.svg', alt: '',
                      width: '332', height: '104', loading: 'lazy' })),

        el('div', { class: 'footer-grid' }, [
          el('div', {}, [
            el('p', { class: 'footer__title', 'data-i18n': 'footer.explore' }),
            el('ul', { class: 'footer__list', role: 'list' },
              NAV.map(n => el('li', {}, el('a', { href: link(n.file), 'data-i18n': n.key }))))
          ]),
          el('div', {}, [
            el('p', { class: 'footer__title', 'data-i18n': 'footer.visitUs' }),
            el('ul', { class: 'footer__list', role: 'list' }, [
              el('li', {}, el('span', { text: c.addressLine1 })),
              el('li', {}, el('span', { text: c.addressLine2 })),
              el('li', {}, el('span', { text: c.addressCity + ', ' + c.addressCountry })),
              el('li', { style: 'margin-block-start:.6rem' },
                el('a', { href: 'tel:' + c.phoneLink, dir: 'ltr', text: c.phone })),
              el('li', {}, el('a', { href: c.whatsappUrl, target: '_blank',
                rel: 'noopener noreferrer', dir: 'ltr', text: c.whatsapp + ' (WhatsApp)' })),
              el('li', {}, el('a', { href: c.mapsUrl, target: '_blank',
                rel: 'noopener noreferrer', 'data-i18n': 'common.getDirections' }))
            ])
          ]),
          el('div', {}, [
            el('p', { class: 'footer__title', 'data-i18n': 'footer.hours' }),
            el('ul', { class: 'footer__list', role: 'list', 'data-footer-hours': '' })
          ]),
          el('div', {}, [
            el('p', { class: 'footer__title', 'data-i18n': 'footer.followUs' }),
            el('div', { class: 'social' }, [
              el('a', { href: s.facebook,  target: '_blank', rel: 'noopener noreferrer', 'data-i18n-aria-label': 'footer.facebook',  html: ICON.fb }),
              el('a', { href: s.instagram, target: '_blank', rel: 'noopener noreferrer', 'data-i18n-aria-label': 'footer.instagram', html: ICON.ig }),
              el('a', { href: s.tiktok,    target: '_blank', rel: 'noopener noreferrer', 'data-i18n-aria-label': 'footer.tiktok',    html: ICON.tt }),
              el('a', { href: c.whatsappUrl, target: '_blank', rel: 'noopener noreferrer', 'data-i18n-aria-label': 'common.whatsappUs', html: ICON.wa })
            ]),
            el('p', { class: 'text-sm', style: 'margin-block-start:1.4rem;opacity:.6', text: b.legalName }),
            el('p', { class: 'text-sm', style: 'opacity:.45', dir: 'ltr', text: b.registrationNo })
          ])
        ]),

        el('div', { class: 'footer__bottom' }, [
          el('span', { 'data-copyright': '' }),
          el('span', { class: 'text-sm', 'data-i18n': 'footer.madeNote' }),
          el('a', { class: 'text-sm', href: 'https://bbmw0.com', target: '_blank',
                    rel: 'noopener noreferrer', 'data-i18n': 'footer.createdBy' })
        ])
      ]));
  }

  /* ======================================================================
     OPENING HOURS
     ====================================================================== */
  const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  const todayKey = () => DAYS[(new Date().getDay() + 6) % 7];

  function buildHours(shared) {
    const today = todayKey();

    const table = document.querySelector('[data-hours-table]');
    if (table) {
      table.replaceChildren(...DAYS.map(d => {
        const h = shared.hours[d];
        const row = el('div', { class: 'hours-row' + (d === today ? ' is-today' : '') + (h.closed ? ' is-closed' : '') }, [
          el('span', { 'data-i18n': 'days.' + d }),
          el('span', { class: 'hours-row__time' })
        ]);
        const t = row.lastChild;
        if (h.closed) t.setAttribute('data-i18n', 'common.closed');
        else t.textContent = h.open + ' - ' + h.close;
        return row;
      }));
    }

    const foot = document.querySelector('[data-footer-hours]');
    if (foot) {
      foot.replaceChildren(...DAYS.map(d => {
        const h = shared.hours[d];
        const li = el('li', { style: 'display:flex;justify-content:space-between;gap:1rem' }, [
          el('span', { 'data-i18n': 'days.' + d }),
          el('span', { class: 'hours-row__time' })
        ]);
        const t = li.lastChild;
        if (h.closed) t.setAttribute('data-i18n', 'common.closed');
        else t.textContent = h.open + '-' + h.close;
        return li;
      }));
    }

    document.querySelectorAll('[data-open-status]').forEach(node => {
      const h = shared.hours[today];
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      let open = false;
      if (!h.closed && h.open && h.close) {
        const [oh, om] = h.open.split(':').map(Number);
        const [ch, cm] = h.close.split(':').map(Number);
        open = mins >= oh * 60 + om && mins < ch * 60 + cm;
      }
      node.setAttribute('data-i18n', open ? 'common.openNow' : 'common.closedNow');
      node.classList.toggle('badge--veg', open);
    });
  }

  /* ======================================================================
     MENU
     ====================================================================== */
  function buildMenu(shared) {
    const grid = document.querySelector('[data-menu-grid]');
    if (!grid) return;
    const b = base();
    const limit = parseInt(grid.dataset.limit || '0', 10);

    const items = limit ? shared.menu.items.slice(0, limit) : shared.menu.items;

    grid.replaceChildren(...items.map(item => {
      const k = 'menu.items.' + item.id;

      const priceBox = el('div', { style: 'text-align:end' });
      if (item.price === null) {
        priceBox.appendChild(el('span', { class: 'dish__unit', 'data-i18n': 'common.priceOnRequest' }));
      } else {
        priceBox.appendChild(el('span', { class: 'dish__price', 'data-price': item.price, dir: 'ltr' }));
        if (item.unit > 1) {
          priceBox.appendChild(el('span', { class: 'dish__unit' }, [
            el('span', { text: item.unit + ' ' }),
            el('span', { 'data-i18n': 'common.pieces' })
          ]));
        }
      }

      return el('article', { class: 'dish', tabindex: '0', 'data-cat': item.cat }, [
        el('div', { class: 'dish__media' }, [
          el('img', {
            src: b + item.image, alt: '', loading: 'lazy', decoding: 'async',
            width: '600', height: '450', 'data-glyph': item.glyph,
            'data-i18n-alt': k + '.name'
          }),
          el('div', { class: 'dish__reveal' }, [
            el('p',  { class: 'dish__reveal-native', 'data-i18n': k + '.native' }),
            el('h3', { class: 'dish__reveal-title',  'data-i18n': k + '.name' }),
            el('p',  { class: 'dish__reveal-desc',   'data-i18n': k + '.desc' }),
            el('div', { class: 'dish__reveal-tags' },
              (item.tags || []).map(t => el('span', {
                class: 'badge' + (t === 'veg' ? ' badge--veg' : t === 'chef' ? ' badge--chef' : ''),
                'data-i18n': 'menu.tags.' + t
              })))
          ])
        ]),
        el('div', { class: 'dish__bar' }, [
          el('h3', { class: 'dish__name', 'data-i18n': k + '.name' }),
          priceBox
        ])
      ]);
    }));

    buildFilters(shared, grid);
  }

  function buildFilters(shared, grid) {
    const bar = document.querySelector('[data-menu-filters]');
    if (!bar || bar.dataset.built) return;
    bar.dataset.built = '1';

    ['all', ...shared.menu.categories].forEach((c, i) => {
      const btn = el('button', {
        class: 'filter-btn', type: 'button',
        'aria-pressed': i === 0 ? 'true' : 'false',
        'data-filter': c, 'data-i18n': 'menu.categories.' + c
      });
      btn.addEventListener('click', () => {
        bar.querySelectorAll('.filter-btn').forEach(b => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        grid.querySelectorAll('.dish').forEach(d => { d.hidden = !(c === 'all' || d.dataset.cat === c); });
      });
      bar.appendChild(btn);
    });
  }

  /* ======================================================================
     TEA
     ====================================================================== */
  function buildTeas(shared) {
    ['chinese', 'english'].forEach(origin => {
      const mount = document.querySelector('[data-tea-list="' + origin + '"]');
      if (!mount) return;
      mount.replaceChildren(...shared.teas.items.filter(t => t.origin === origin).map(t => {
        const k = 'tea.items.' + t.id;
        return el('div', { class: 'tea-item' }, [
          el('div', {}, [
            el('h3', { class: 'tea-item__name', 'data-i18n': k + '.name' }),
            el('p',  { class: 'tea-item__native', dir: 'ltr', text: t.native })
          ]),
          el('span', { class: 'tea-item__price', 'data-price': t.price, dir: 'ltr' }),
          el('p', { class: 'tea-item__note', 'data-i18n': k + '.note' })
        ]);
      }));
    });
    const fee = document.querySelector('[data-byo-fee]');
    if (fee) fee.setAttribute('data-price', shared.teas.byoCorkage);
  }

  /* ======================================================================
     GALLERY
     ====================================================================== */
  function buildGallery(shared) {
    const mount = document.querySelector('[data-gallery]');
    if (!mount) return;
    const b = base();
    mount.replaceChildren(...shared.gallery.map(g =>
      el('button', {
        class: 'gallery__item', type: 'button',
        'data-full': b + g.image,
        'data-cursor': 'View',
        'data-i18n-aria-label': g.captionKey
      }, [
        el('img', { src: b + g.image, alt: '', loading: 'lazy', decoding: 'async',
                    width: '800', height: '600', 'data-glyph': g.glyph,
                    'data-i18n-alt': g.captionKey }),
        el('span', { class: 'gallery__cap', 'data-i18n': g.captionKey })
      ])));
  }

  /* ======================================================================
     STATS
     ====================================================================== */
  function buildStats(shared) {
    const mount = document.querySelector('[data-stats]');
    if (!mount) return;
    mount.replaceChildren(...shared.stats.map(s =>
      el('div', { class: 'stat' }, [
        el('div', { class: 'stat__num', 'data-count': s.value, 'data-count-suffix': s.suffix, text: '0', dir: 'ltr' }),
        el('div', { class: 'stat__label', 'data-i18n': s.labelKey })
      ])));
  }

  /* ======================================================================
     CONTACT DETAILS
     ====================================================================== */
  function buildContact(shared) {
    const c = shared.contact, b = shared.brand;

    document.querySelectorAll('[data-phone]').forEach(n => {
      n.textContent = c.phone; n.setAttribute('dir', 'ltr');
      if (n.tagName === 'A') n.setAttribute('href', 'tel:' + c.phoneLink);
    });
    document.querySelectorAll('[data-phone-link]').forEach(n => n.setAttribute('href', 'tel:' + c.phoneLink));
    document.querySelectorAll('[data-whatsapp]').forEach(n => {
      n.textContent = c.whatsapp; n.setAttribute('dir', 'ltr');
      if (n.tagName === 'A') {
        n.setAttribute('href', c.whatsappUrl);
        n.setAttribute('target', '_blank'); n.setAttribute('rel', 'noopener noreferrer');
      }
    });
    document.querySelectorAll('[data-whatsapp-link]').forEach(n => {
      n.setAttribute('href', c.whatsappUrl);
      n.setAttribute('target', '_blank'); n.setAttribute('rel', 'noopener noreferrer');
    });
    document.querySelectorAll('[data-maps-link]').forEach(n => {
      n.setAttribute('href', c.mapsUrl);
      n.setAttribute('target', '_blank'); n.setAttribute('rel', 'noopener noreferrer');
    });
    /* The address is written in the Latin alphabet even in the Arabic
       edition, because that is what is on the street sign and what a taxi
       driver needs to read. Each line is marked left-to-right so that the
       house number and commas do not get rearranged inside Arabic text. */
    document.querySelectorAll('[data-address]').forEach(n => {
      n.replaceChildren(
        el('span', { dir: 'ltr', text: c.addressLine1 }), el('br'),
        el('span', { dir: 'ltr', text: c.addressLine2 }), el('br'),
        el('span', { dir: 'ltr', text: c.addressCity + ', ' + c.addressCountry }));
    });
    document.querySelectorAll('[data-legal-name]').forEach(n => { n.textContent = b.legalName; });
    document.querySelectorAll('[data-registration]').forEach(n => {
      n.textContent = b.registrationNo; n.setAttribute('dir', 'ltr');
    });
    document.querySelectorAll('[data-motto-left]').forEach(n  => { n.textContent = b.mottoLeft; });
    document.querySelectorAll('[data-motto-right]').forEach(n => { n.textContent = b.mottoRight; });
    document.querySelectorAll('[data-name-cn]').forEach(n => {
      n.textContent = (I18N.current === 'zh-Hans') ? b.nameChineseSimp : b.nameChinese;
    });

    document.querySelectorAll('[data-email]').forEach(n => {
      const valid = c.email && !/REPLACE-WITH/i.test(c.email) && c.email.includes('@');
      if (valid) {
        n.textContent = c.email;
        if (n.tagName === 'A') n.setAttribute('href', 'mailto:' + c.email);
      } else {
        n.setAttribute('data-i18n', 'visit.reach.emailFallback');
        if (n.tagName === 'A') n.removeAttribute('href');
      }
    });

    const map = document.querySelector('[data-map-embed]');
    if (map && !map.dataset.built) {
      map.dataset.built = '1';
      map.replaceChildren(el('iframe', {
        src: c.mapEmbedUrl, loading: 'lazy',
        referrerpolicy: 'no-referrer-when-downgrade',
        title: 'Bao Teck Tea House on the map', allowfullscreen: ''
      }));
    }

    const year = new Date().getFullYear();
    document.querySelectorAll('[data-copyright]').forEach(n => {
      n.replaceChildren(
        el('span', { text: '© ' + year + ' ' + b.legalName + '. ' }),
        el('span', { 'data-i18n': 'footer.rights' }));
    });
  }

  function formatPrices() {
    document.querySelectorAll('[data-price]').forEach(n => {
      const v = parseFloat(n.getAttribute('data-price'));
      if (!isNaN(v)) n.textContent = I18N.price(v);
    });
  }

  /* ======================================================================
     SEARCH ENGINE DATA
     ====================================================================== */
  function buildSchema(shared) {
    const c = shared.contact, b = shared.brand;
    const spec = DAYS.filter(d => !shared.hours[d].closed).map(d => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'https://schema.org/' + d.charAt(0).toUpperCase() + d.slice(1),
      opens: shared.hours[d].open, closes: shared.hours[d].close
    }));

    const data = {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: b.nameLatin,
      alternateName: [b.nameChinese, b.nameChineseSimp],
      legalName: b.legalName,
      description: I18N.t('site.shortDesc'),
      servesCuisine: ['Cantonese', 'Dim Sum', 'Chinese'],
      priceRange: '$$',
      telephone: c.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: c.addressLine1,
        addressLocality: c.addressCity,
        postalCode: c.postcode,
        addressCountry: 'MY'
      },
      geo: { '@type': 'GeoCoordinates', latitude: c.latitude, longitude: c.longitude },
      hasMap: c.mapsUrl,
      openingHoursSpecification: spec,
      sameAs: [s_(shared, 'facebook'), s_(shared, 'instagram'), s_(shared, 'tiktok'), s_(shared, 'michelin')],
      acceptsReservations: 'True'
    };

    let tag = document.getElementById('ld-json');
    if (!tag) {
      tag = document.createElement('script');
      tag.type = 'application/ld+json'; tag.id = 'ld-json';
      document.head.appendChild(tag);
    }
    tag.textContent = JSON.stringify(data, null, 2);
  }
  const s_ = (shared, k) => shared.social[k];

  function buildHreflang() {
    if (document.querySelector('link[data-hreflang]')) return;
    let url;
    try { url = new URL(window.location.href); } catch (e) { return; }
    I18N.LANGUAGES.forEach(l => {
      url.searchParams.set('lang', l.code);
      const a = document.createElement('link');
      a.rel = 'alternate'; a.hreflang = l.htmlLang; a.href = url.toString();
      a.setAttribute('data-hreflang', '');
      document.head.appendChild(a);
    });
  }

  /* ======================================================================
     BOOT
     ====================================================================== */
  /* Build everything, then fill in the words.
     Called once at start-up and again whenever the language changes. */
  function render(shared) {
    if (!document.body.dataset.built) {
      buildFooter(shared);
      buildMenu(shared);
      buildTeas(shared);
      buildGallery(shared);
      buildStats(shared);
      document.body.dataset.built = '1';
    }
    buildHours(shared);
    buildContact(shared);
    formatPrices();
    buildSchema(shared);
    I18N.apply();          // fill in everything we just created
  }

  function init() {
    const shared = window.BTTH && window.BTTH.shared;
    if (!shared) { console.error('[site] shared.js did not load.'); return; }

    buildHeader(shared);
    buildWhatsApp(shared);
    buildHreflang();

    // The language menu lives inside the header we have only just created,
    // so it has to be mounted now.
    // (I18N is declared with const, which does not attach to window, so it
    //  has to be tested with typeof rather than window.I18N.)
    if (typeof I18N !== 'undefined' && I18N.mountSwitcher) I18N.mountSwitcher();

    // Keep in step with any later language change.
    document.addEventListener('i18n:changed', () => render(shared));

    /* The language engine may already have started and finished before this
       file was reached, in which case its ready event has been and gone.
       Rather than relying on the order the two scripts happen to run in,
       build straight away if the language engine is already up. */
    if (document.documentElement.classList.contains('i18n-ready')) {
      render(shared);
    } else {
      // It has not finished yet; its event will call render for us. Belt and
      // braces, check once more on the next tick in case we just missed it.
      setTimeout(() => {
        if (!document.body.dataset.built &&
            document.documentElement.classList.contains('i18n-ready')) {
          render(shared);
        }
      }, 0);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { ICON, el, base, link };
})();
