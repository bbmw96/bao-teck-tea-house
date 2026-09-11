/* ==========================================================================
   BAO TECK TEA HOUSE — MOTION ENGINE

   Every animation on the site. No external libraries, nothing to update,
   nothing that can break years from now.

   Two rules run through all of it:
     1. Only `transform` and `opacity` are animated. Those are the two
        things a browser can hand to the graphics card, so everything
        stays smooth even on an inexpensive phone.
     2. If the visitor has asked their device to reduce motion, every
        effect below switches itself off and the site simply appears.
   ========================================================================== */

'use strict';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE    = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const rAF     = requestAnimationFrame;

/* Shared scroll state, so every effect reads the scroll position once
   per frame instead of each one asking the browser separately. */
const Scroll = {
  y: 0, target: 0, velocity: 0, max: 0, progress: 0,
  listeners: [],
  on(fn) { this.listeners.push(fn); }
};

/* ==========================================================================
   1. SCROLL TRACKING
   Every effect reads the scroll position from here, once per frame, rather
   than each one asking the browser separately.

   Note: an earlier version moved the whole page with a transform to give
   weighted "smooth" scrolling. It looked good but it broke the browser's
   on-screen detection, so sections never appeared. Native scrolling is used
   instead, which is both reliable and what the visitor's device expects.
   ========================================================================== */
(function scrollTracking() {
  let ticking = false;
  const read = () => {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    Scroll.velocity = y - Scroll.y;
    Scroll.y = Scroll.target = y;
    Scroll.max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    Scroll.progress = Math.min(1, Math.max(0, y / Scroll.max));
    Scroll.listeners.forEach(fn => { try { fn(Scroll); } catch (e) {} });
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { rAF(read); ticking = true; } }, { passive: true });
  window.addEventListener('resize', read);
  document.addEventListener('site:ready', read);
  read();
})();

/* ==========================================================================
   2. OPENING SEQUENCE
   The arch assembles itself, medallion by medallion, then lifts away.
   ========================================================================== */
(function opening() {
  const el = document.querySelector('.loader');
  if (!el) { document.body.classList.add('is-loaded'); return; }

  const done = () => {
    el.classList.add('is-done');
    document.body.classList.add('is-loaded');
    document.dispatchEvent(new CustomEvent('site:ready'));
    setTimeout(() => el.remove(), 1200);
  };

  if (REDUCED) { done(); return; }

  let fired = false;
  const go = () => { if (fired) return; fired = true; setTimeout(done, 1500); };
  window.addEventListener('load', go);
  setTimeout(go, 3200);                    // never trap anybody behind a slow image
})();

/* ==========================================================================
   3. HERO
   Three layers moving at three speeds, the whole thing sinking and fading
   as you scroll past it.
   ========================================================================== */
(function hero() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const bg      = hero.querySelector('.hero__bg');
  const content = hero.querySelector('.hero__content');
  const cue     = hero.querySelector('.scroll-cue');
  if (REDUCED) return;

  Scroll.on(s => {
    const h = window.innerHeight;
    const p = Math.min(s.y / h, 1);                 // 0 at top, 1 one screen down
    if (bg)      bg.style.transform      = 'translate3d(0,' + (s.y * 0.32).toFixed(1) + 'px,0) scale(' + (1 + p * 0.16).toFixed(4) + ')';
    if (content) {
      content.style.transform = 'translate3d(0,' + (s.y * 0.14).toFixed(1) + 'px,0)';
      content.style.opacity   = String(Math.max(0, 1 - p * 1.35));
    }
    if (cue) cue.style.opacity = String(Math.max(0, 1 - p * 2.6));
  });
})();

/* ==========================================================================
   4. SCROLL REVEAL
   Sections rise and fade in as they arrive. Children stagger.

   Two independent mechanisms run: the browser's own on-screen detector, and
   a plain position check on every scroll. Either one alone is enough. If both
   somehow fail, everything is shown after three seconds regardless. Content
   must never be left invisible.
   ========================================================================== */
(function reveal() {
  const SEL = '.reveal, .reveal-child, [data-reveal-image]';
  const showAll = () => document.querySelectorAll(SEL).forEach(el => el.classList.add('in'));

  if (REDUCED) { showAll(); return; }

  const number = () => document.querySelectorAll('.reveal-child').forEach(parent => {
    Array.from(parent.children).forEach((c, i) => c.style.setProperty('--i', i));
  });
  number();

  const show = el => el.classList.add('in');

  // mechanism one: the browser's on-screen detector
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { show(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    document.querySelectorAll(SEL).forEach(el => io.observe(el));
  }

  // mechanism two: a straightforward position check
  const sweep = () => {
    const h = window.innerHeight;
    document.querySelectorAll(SEL + ':not(.in)').forEach(el => {
      const r = el.getBoundingClientRect();
      /* Anything at or above the trigger line is shown. Deliberately no
         lower bound: during a fast scroll an element can pass the whole
         viewport between two frames, and it must not be left hidden just
         because it is already behind us. */
      if (r.top < h * 0.94) show(el);
    });
  };
  Scroll.on(sweep);
  window.addEventListener('load', () => { number(); sweep(); });
  document.addEventListener('site:ready', () => { number(); setTimeout(sweep, 60); });
  document.addEventListener('i18n:changed', () => { number(); setTimeout(sweep, 60); });

  /* The browser's own detector only reports an element that actually crosses
     the viewport. Something jumped clean over, by an anchor link, a restored
     scroll position, or a very fast flick, may never be reported at all. So
     the sweep is also run whenever scrolling settles, and on a slow ticker
     for the first few seconds while the page is still finding its size. */
  window.addEventListener('scrollend', sweep);          // where supported
  let ticks = 0;
  const ticker = setInterval(() => {
    sweep();
    if (++ticks > 16) clearInterval(ticker);            // eight seconds, then stop
  }, 500);

  setTimeout(sweep, 400);
  setTimeout(sweep, 1200);

  // and if every one of those somehow fails, show everything anyway
  setTimeout(showAll, 3000);
})();

/* ==========================================================================
   5. IMAGE DRIFT
   The picture inside its frame moves gently against the scroll, which gives
   a sense of depth. The frame itself is uncovered by the reveal above.
   ========================================================================== */
(function imageDrift() {
  if (REDUCED) return;
  const inner = () => document.querySelectorAll('[data-reveal-image] img');
  Scroll.on(() => {
    inner().forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      img.style.transform = 'scale(1.14) translate3d(0,' + (p * -20).toFixed(1) + 'px,0)';
    });
  });
})();

/* ==========================================================================
   6. HEADLINES
   Split into words, each rising out of a mask with a slight 3D tilt.
   Rebuilt whenever the language changes, because the words change.
   ========================================================================== */
(function splitText() {
  const build = el => {
    const text = (el.getAttribute('data-original') || el.textContent).trim();
    if (!text) return;
    el.setAttribute('data-original', text);
    el.setAttribute('aria-label', text);          // screen readers get clean text

    el.replaceChildren();
    const line = document.createElement('span');
    line.className = 'split-line';
    line.setAttribute('aria-hidden', 'true');

    // Chinese and Thai are written without spaces, so split by character there
    const hasSpaces = /\s/.test(text);
    const units = hasSpaces ? text.split(/(\s+)/) : Array.from(text);

    let i = 0;
    units.forEach(unit => {
      if (/^\s+$/.test(unit)) { line.appendChild(document.createTextNode(unit)); return; }
      const outer = document.createElement('span');
      outer.className = 'split-mask';
      const inner = document.createElement('span');
      inner.className = 'split-word';
      inner.style.setProperty('--d', (i * 55) + 'ms');
      inner.textContent = unit;
      outer.appendChild(inner);
      line.appendChild(outer);
      if (!hasSpaces) line.appendChild(document.createTextNode('​'));
      i++;
    });
    el.appendChild(line);
  };

  const run = () => {
    document.querySelectorAll('[data-split]').forEach(el => {
      if (REDUCED) { el.classList.add('is-revealed'); return; }
      build(el);
      el.classList.remove('is-revealed');
      const io = new IntersectionObserver((es, obs) => {
        es.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('is-revealed'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.2 });
      io.observe(el);
    });
  };

  /* Same belt-and-braces approach as the section reveals: an on-screen
     detector, a position check on every scroll, and a final catch-all.
     A headline must never be left invisible. */
  const sweep = () => {
    const h = window.innerHeight;
    document.querySelectorAll('[data-split]:not(.is-revealed)').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < h * 0.95 && r.bottom > 0) el.classList.add('is-revealed');
    });
  };
  Scroll.on(sweep);

  document.addEventListener('i18n:changed', () => {
    document.querySelectorAll('[data-split]').forEach(el => el.removeAttribute('data-original'));
    setTimeout(() => { run(); sweep(); }, 40);
    setTimeout(sweep, 600);
    setTimeout(() => document.querySelectorAll('[data-split]')
                       .forEach(el => el.classList.add('is-revealed')), 3000);
  });
  window.addEventListener('load', sweep);
})();

/* ==========================================================================
   7. THE CURSOR
   A small dot with a ring trailing behind it. The ring grows over anything
   you can click, and inverts over photographs so it stays visible.
   ========================================================================== */
(function cursor() {
  if (REDUCED || !FINE) return;

  const dot  = document.createElement('div'); dot.className  = 'cursor-dot';
  const ring = document.createElement('div'); ring.className = 'cursor-ring';
  const label= document.createElement('span'); label.className = 'cursor-label';
  ring.appendChild(label);
  dot.setAttribute('aria-hidden','true'); ring.setAttribute('aria-hidden','true');
  document.body.append(dot, ring);

  let mx = -200, my = -200, rx = -200, ry = -200;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  (function tick() {
    dot.style.transform = 'translate3d(' + (mx - 3) + 'px,' + (my - 3) + 'px,0)';
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.transform = 'translate3d(' + (rx - 21) + 'px,' + (ry - 21) + 'px,0)';
    rAF(tick);
  })();

  const HOVER = 'a, button, .dish, .gallery__item, input, textarea, select, [role="button"]';
  document.addEventListener('mouseover', e => {
    const zoom = e.target.closest('[data-cursor]');
    if (zoom) {
      ring.classList.add('is-zoom');
      label.textContent = zoom.dataset.cursor || '';
    } else if (e.target.closest(HOVER)) {
      ring.classList.add('is-hovering');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('[data-cursor]')) { ring.classList.remove('is-zoom'); label.textContent = ''; }
    if (e.target.closest(HOVER)) ring.classList.remove('is-hovering');
  });
  document.addEventListener('mousedown', () => ring.classList.add('is-down'));
  document.addEventListener('mouseup',   () => ring.classList.remove('is-down'));
})();

/* ==========================================================================
   8. MAGNETIC BUTTONS
   ========================================================================== */
(function magnetic() {
  if (REDUCED || !FINE) return;
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    const strength = parseFloat(el.dataset.magnetic) || 0.3;
    let raf = null, tx = 0, ty = 0, cx = 0, cy = 0;

    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left - r.width  / 2) * strength;
      ty = (e.clientY - r.top  - r.height / 2) * strength;
      if (!raf) raf = rAF(run);
    });
    el.addEventListener('mouseleave', () => { tx = ty = 0; if (!raf) raf = rAF(run); });

    function run() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      el.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0)';
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) raf = rAF(run);
      else { el.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0)'; raf = null; }
    }
  });
})();

/* ==========================================================================
   9. CARD TILT
   ========================================================================== */
(function tilt() {
  if (REDUCED || !FINE) return;
  document.querySelectorAll('[data-tilt]').forEach(el => {
    const max = parseFloat(el.dataset.tilt) || 7;
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width  - 0.5;
      const py = (e.clientY - r.top)  / r.height - 0.5;
      el.style.transform =
        'perspective(1000px) rotateY(' + (px * max).toFixed(2) + 'deg) rotateX(' +
        (-py * max).toFixed(2) + 'deg) translateZ(10px)';
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

/* ==========================================================================
   10. STICKY SCENES
   A section pins while its contents change. Used for the tea ritual.
   ========================================================================== */
(function stickyScenes() {
  const scenes = document.querySelectorAll('[data-scene]');
  if (!scenes.length || REDUCED) {
    scenes.forEach(s => s.querySelectorAll('[data-scene-step]').forEach(st => st.classList.add('in')));
    return;
  }
  Scroll.on(() => {
    scenes.forEach(scene => {
      const r = scene.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      if (total <= 0) return;
      const p = Math.max(0, Math.min(1, -r.top / total));
      const steps = scene.querySelectorAll('[data-scene-step]');
      const idx = Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999));
      steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      scene.style.setProperty('--scene-progress', p.toFixed(4));
    });
  });
})();

/* ==========================================================================
   11. SCROLL PROGRESS, STICKY HEADER, BACK TO TOP
   ========================================================================== */
(function chrome() {
  const bar    = document.querySelector('.scroll-progress');
  const header = document.querySelector('.site-header');
  const top    = document.querySelector('.to-top');
  let last = 0;

  Scroll.on(s => {
    if (bar) bar.style.transform = 'scaleX(' + s.progress.toFixed(4) + ')';

    /* The home page opens on a dark photograph, so while the visitor is
       still at the top the header and the couplet rails have to be light.
       Everywhere else the page begins on pale rice paper and they stay
       dark. One class carries that state. */
    document.body.classList.toggle('at-top', s.y < 90);

    if (header) {
      header.classList.toggle('is-stuck', s.y > 40);
      if (s.y > 500 && s.y > last + 4)      header.classList.add('is-hidden');
      else if (s.y < last - 4 || s.y < 240) header.classList.remove('is-hidden');
    }
    if (top) top.classList.toggle('is-visible', s.y > 700);
    last = s.y;
  });

  if (top) top.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }));
})();

/* ==========================================================================
   12. MARQUEE THAT RESPONDS TO SCROLLING
   It drifts on its own, and speeds up in the direction you are scrolling.
   ========================================================================== */
(function marquee() {
  const tracks = document.querySelectorAll('.marquee__track');
  if (!tracks.length || REDUCED) return;
  let offset = 0;

  Scroll.on(s => {
    offset += 0.45 + Math.min(Math.abs(s.velocity) * 0.09, 5) * Math.sign(s.velocity || 1);
    tracks.forEach(t => {
      const w = t.scrollWidth / 2;
      if (w > 0) {
        const x = -(((offset % w) + w) % w);
        t.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
      }
    });
  });
})();

/* ==========================================================================
   13. COUNT UP
   ========================================================================== */
(function countUp() {
  const nums = document.querySelectorAll('[data-count]');
  if (!nums.length) return;

  const animate = el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.countSuffix || '';
    if (REDUCED) { el.textContent = target + suffix; return; }
    const dur = 1700, start = performance.now();
    const step = now => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) rAF(step);
    };
    rAF(step);
  };

  const io = new IntersectionObserver((es, obs) => {
    es.forEach(e => { if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.45 });
  nums.forEach(el => io.observe(el));
})();

/* ==========================================================================
   14. MOBILE MENU
   On a phone this is the only navigation there is, so it has to be robust.

   IMPORTANT: the header, and therefore this button, is built by site.js
   AFTER this file has finished running. An earlier version looked the
   button up once at start-up, found nothing, and silently gave up, which
   left the menu permanently dead on every phone. Everything below is bound
   to the document instead, so it works no matter when the button appears.
   ========================================================================== */
(function mobileNav() {
  const panel  = () => document.querySelector('.mobile-nav');
  const toggle = () => document.querySelector('.nav__toggle');
  let lastFocus = null;

  const stagger = () => {
    const p = panel(); if (!p) return;
    p.querySelectorAll('.mobile-nav__link').forEach((l, i) =>
      l.style.setProperty('--d', (180 + i * 80) + 'ms'));
  };

  const open = () => {
    const p = panel(), t = toggle(); if (!p) return;
    lastFocus = document.activeElement;
    stagger();
    p.dataset.open = 'true';
    if (t) t.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
    setTimeout(() => {
      const first = p.querySelector('.mobile-nav__link');
      if (first) first.focus();
    }, 380);
  };

  const close = () => {
    const p = panel(), t = toggle(); if (!p) return;
    p.dataset.open = 'false';
    if (t) t.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  };

  document.addEventListener('click', e => {
    if (e.target.closest('.nav__toggle')) {
      e.preventDefault();
      const p = panel();
      (p && p.dataset.open === 'true') ? close() : open();
      return;
    }
    // the X inside the panel: a phone has no Escape key
    if (e.target.closest('[data-nav-close]')) { e.preventDefault(); close(); return; }
    // any link inside the panel closes it on the way out
    if (e.target.closest('.mobile-nav a')) close();
  });

  document.addEventListener('keydown', e => {
    const p = panel(); if (!p || p.dataset.open !== 'true') return;
    if (e.key === 'Escape') { e.preventDefault(); close(); const t = toggle(); if (t) t.focus(); return; }
    if (e.key !== 'Tab') return;
    const f = p.querySelectorAll('a[href], button:not([disabled])');
    if (!f.length) return;
    const first = f[0], lastEl = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
    else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
  });

  document.addEventListener('i18n:changed', stagger);
})();

/* ==========================================================================
   15. THEME
   Bound to the document for the same reason as the menu above: the button
   is created later, so looking it up once at start-up found nothing and the
   light/dark switch never worked at all.
   ========================================================================== */
(function theme() {
  const KEY = 'btth.theme';

  const paint = mode => {
    document.documentElement.setAttribute('data-theme', mode);
    const btn = document.querySelector('[data-theme-toggle]');
    if (btn) btn.setAttribute('aria-pressed', mode === 'dark' ? 'true' : 'false');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', mode === 'dark' ? '#14100e' : '#f4ece0');
  };

  const set = mode => {
    paint(mode);
    try { localStorage.setItem(KEY, mode); } catch (e) {}
  };

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  paint(saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  document.addEventListener('click', e => {
    if (!e.target.closest('[data-theme-toggle]')) return;
    set(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  // the button is built after this runs, so set its state once it exists
  document.addEventListener('i18n:changed', () =>
    paint(document.documentElement.getAttribute('data-theme') || 'light'));
})();

/* ==========================================================================
   16. FAQ
   ========================================================================== */
(function faq() {
  document.addEventListener('click', e => {
    const q = e.target.closest('.faq-q');
    if (!q) return;
    const open = q.getAttribute('aria-expanded') === 'true';
    const group = q.closest('[data-faq-group]');
    if (group && !open) {
      group.querySelectorAll('.faq-q[aria-expanded="true"]')
           .forEach(o => o.setAttribute('aria-expanded', 'false'));
    }
    q.setAttribute('aria-expanded', String(!open));
  });
})();

/* ==========================================================================
   17. LIGHTBOX
   ========================================================================== */
(function lightbox() {
  const box = document.querySelector('.lightbox');
  if (!box) return;

  const img   = box.querySelector('.lightbox__img');
  const cap   = box.querySelector('.lightbox__cap');
  const close = box.querySelector('.lightbox__close');
  const prev  = box.querySelector('.lightbox__nav--prev');
  const next  = box.querySelector('.lightbox__nav--next');

  let items = [], index = 0, lastFocus = null;
  const refresh = () => { items = Array.from(document.querySelectorAll('.gallery__item')); };

  const show = i => {
    refresh();
    if (!items.length) return;
    index = (i + items.length) % items.length;
    const source = items[index].querySelector('img');
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = items[index].dataset.full || (source ? source.src : '');
      img.alt = source ? source.alt : '';
      if (cap) cap.textContent = source ? source.alt : '';
      img.style.opacity = '1';
    }, 130);
  };

  const open = i => {
    lastFocus = document.activeElement;
    show(i);
    box.dataset.open = 'true';
    document.documentElement.style.overflow = 'hidden';
    if (close) close.focus();
  };
  const hide = () => {
    box.dataset.open = 'false';
    document.documentElement.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };

  document.addEventListener('click', e => {
    const item = e.target.closest('.gallery__item');
    if (!item) return;
    refresh();
    open(items.indexOf(item));
  });

  if (close) close.addEventListener('click', hide);
  if (prev)  prev.addEventListener('click', () => show(index - 1));
  if (next)  next.addEventListener('click', () => show(index + 1));
  box.addEventListener('click', e => { if (e.target === box) hide(); });

  document.addEventListener('keydown', e => {
    if (box.dataset.open !== 'true') return;
    if (e.key === 'Escape')     hide();
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'ArrowLeft')  show(index - 1);
    if (e.key === 'Tab') {
      const f = box.querySelectorAll('button');
      if (!f.length) return;
      const first = f[0], lastEl = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
    }
  });

  let sx = 0;
  box.addEventListener('touchstart', e => { sx = e.changedTouches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 55) show(index + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();

/* ==========================================================================
   18. MISSING PHOTOGRAPH FALLBACK
   If the owner has not added a photo yet, decorative artwork appears
   instead. The site never shows a broken image.
   ========================================================================== */
(function imageFallback() {
  document.addEventListener('error', e => {
    const img = e.target;
    if (img.tagName !== 'IMG' || img.dataset.fallbackApplied) return;
    img.dataset.fallbackApplied = '1';
    img.style.display = 'none';
    const holder = img.closest('.dish__media, .card__media, .gallery__item, .hero__bg, .frame');
    if (holder && !holder.querySelector('.art-placeholder')) {
      const ph = document.createElement('div');
      ph.className = 'art-placeholder';
      ph.setAttribute('aria-hidden', 'true');
      const s = document.createElement('span');
      s.textContent = img.dataset.glyph || '茶';
      ph.appendChild(s);
      holder.prepend(ph);
    }
  }, true);
})();

/* ==========================================================================
   19. CURRENT PAGE IN THE NAVIGATION
   ========================================================================== */
(function currentPage() {
  const here = window.location.pathname.split('/').pop() || 'index.html';
  document.addEventListener('i18n:changed', () => {
    document.querySelectorAll('.nav__link, .mobile-nav__link').forEach(a => {
      const target = (a.getAttribute('href') || '').split('/').pop() || 'index.html';
      if (target === here) a.setAttribute('aria-current', 'page');
    });
  });
})();
