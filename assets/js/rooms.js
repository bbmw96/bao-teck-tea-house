/* ==========================================================================
   BAO TECK TEA HOUSE — THE ROOMS

   The motion that belongs to one page only. Loads after motion.js, which
   provides the shared Scroll object and the REDUCED flag.

       Home      the five-foot way    the doors part
       Menu      the steamer          steam rises off the baskets
       Tea       the pour             the pot fills as you scroll
       Story     the airwell          a shaft of light, with dust in it
       Gallery   the lattice window   the screen opens
       Visit     the door             the threshold

   Everything switches itself off when the visitor has asked for reduced
   motion, and nothing here is required for the page to make sense.
   ========================================================================== */

'use strict';

(function rooms() {

  const room = document.body.getAttribute('data-room') || 'home';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ======================================================================
     THE COUPLETS
     A pair of vertical Chinese inscriptions down the page edges, as on a
     shophouse doorway. Each page carries a different pair, chosen to suit
     the room. They are decorative, so they are hidden from screen readers.
     ====================================================================== */
  const COUPLETS = {
    home:    ['貨真價實', '童叟無欺'],   // the two pledges carved on the sign
    menu:    ['一籠一味', '現點現蒸'],   // one basket one flavour / folded when ordered
    tea:     ['茶過三巡', '味有餘香'],   // three pours in / the fragrance lingers
    story:   ['老屋深井', '天光入戶'],   // old house, deep airwell / daylight enters
    gallery: ['窗花漏影', '光陰可見'],   // lattice lets the shadows through / time made visible
    visit:   ['門常開', '客常來']        // the door stays open / guests keep coming
  };

  function buildCouplets() {
    if (document.querySelector('.couplet')) return;
    const pair = COUPLETS[room] || COUPLETS.home;
    ['start', 'end'].forEach((side, i) => {
      const el = document.createElement('div');
      el.className = 'couplet couplet--' + side;
      el.setAttribute('aria-hidden', 'true');
      el.lang = 'zh-Hant';
      el.textContent = pair[i];
      document.body.appendChild(el);
    });
  }

  /* ======================================================================
     ROOM 2: THE STEAMER
     Steam drawn on a canvas behind the dish grid. Soft, slow, and drawn
     only while the grid is actually on screen, so it costs nothing on a
     page the visitor is not looking at.
     ====================================================================== */
  function steam() {
    const host = document.querySelector('[data-steam]');
    if (!host || reduced) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'steam-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    host.style.position = host.style.position || 'relative';
    host.prepend(canvas);
    const ctx = canvas.getContext('2d');

    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const puffs = [];

    function size() {
      const r = host.getBoundingClientRect();
      w = Math.max(1, r.width); h = Math.max(1, r.height * 1.2);
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    new ResizeObserver(size).observe(host);

    function spawn() {
      puffs.push({
        x: Math.random() * w,
        y: h + 20,
        r: 22 + Math.random() * 46,
        vy: 0.22 + Math.random() * 0.42,
        drift: (Math.random() - 0.5) * 0.28,
        life: 0,
        max: 340 + Math.random() * 260
      });
    }

    let visible = false;
    new IntersectionObserver(es => { visible = es[0].isIntersecting; },
                             { threshold: 0.02 }).observe(host);

    let frame = 0;
    (function draw() {
      requestAnimationFrame(draw);
      if (!visible) return;
      frame++;
      if (frame % 14 === 0 && puffs.length < 26) spawn();

      ctx.clearRect(0, 0, w, h);
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.life++;
        p.y -= p.vy;
        p.x += p.drift + Math.sin(p.life / 60) * 0.22;
        p.r += 0.09;
        const t = p.life / p.max;
        if (t >= 1) { puffs.splice(i, 1); continue; }
        const alpha = Math.sin(t * Math.PI) * 0.10;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, 'rgba(160,160,150,' + alpha.toFixed(3) + ')');
        g.addColorStop(1, 'rgba(160,160,150,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
    })();
  }

  /* ======================================================================
     ROOM 3: THE POUR
     The pot fills as you scroll past it, the way a cup darkens while the
     leaves steep.
     ====================================================================== */
  function steep() {
    const pot  = document.querySelector('[data-steep-pot]');
    const zone = document.querySelector('[data-steep-zone]');
    if (!pot || !zone) return;

    const numeral  = zone.querySelector('[data-steep-label]');
    const announce = zone.querySelector('[data-steep-announce]');
    let shown = 0;

    /* A pour is a whole thing: you are on the first, second or third, never
       on the one-point-ninth. The fill of the pot moves smoothly; the number
       beside it steps. */
    /* --steep is set on the zone (the full-bleed section), not the pot, so
       the mood wash behind the pot and the drifting steam above it can read
       the same live number the fill itself uses — a CSS custom property
       inherits from an ancestor to everything inside it for free. */
    const setPour = n => {
      if (n === shown) return; // only real changes reach here — no per-frame DOM writes
      shown = n;
      if (numeral) numeral.textContent = String(n);
      if (announce && typeof I18N !== 'undefined') {
        announce.textContent = I18N.t('tea.pours.announce', { n: n });
      }
      // A small ripple in the pot exactly when a new pour begins. Restarting
      // the animation on a class that might already be set needs the reflow
      // trick below, since scrolling fast back and forth across the same
      // boundary would otherwise re-add a class that never left.
      if (!reduced) {
        pot.classList.remove('is-pouring');
        void pot.offsetWidth;
        pot.classList.add('is-pouring');
      }
    };

    if (reduced) {
      zone.style.setProperty('--steep', '0.7');
      setPour(2);
      return;
    }

    Scroll.on(() => {
      const r = zone.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      if (total <= 0) return;
      const p = Math.max(0, Math.min(1, -r.top / total));
      zone.style.setProperty('--steep', p.toFixed(3));
      setPour(Math.min(3, Math.floor(p * 3) + 1));
    });

    // the spoken sentence has to be rewritten when the language changes
    document.addEventListener('i18n:changed', () => {
      const n = shown || 1; shown = 0; setPour(n);
    });
    setPour(1);
  }

  /* ======================================================================
     ROOM 4: THE AIRWELL
     A shaft of daylight down the centre of the building. Its brightness
     and length follow the scroll, and specks of dust turn in it.
     ====================================================================== */
  function airwell() {
    const well = document.querySelector('.airwell');
    if (!well) return;

    const shaft = well.querySelector('.airwell__shaft');
    const items = well.querySelectorAll('.timeline__item');

    if (reduced) {
      // No progressive lighting under reduced motion: every entry is
      // simply there, at full strength, from the first paint.
      items.forEach(item => item.style.setProperty('--lit', '1'));
    } else if (shaft || items.length) {
      const LIGHT_LINE = 0.58; // fraction of the viewport height the light sits at
      Scroll.on(() => {
        const r = well.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        if (shaft && total > 0) {
          const p = Math.max(0, Math.min(1, -r.top / total));
          // the sun crosses the airwell: brightest in the middle of the descent
          const bright = Math.sin(p * Math.PI);
          shaft.style.opacity = (0.28 + bright * 0.72).toFixed(3);
          shaft.style.transform = 'translateX(-50%) skewX(' + ((p - 0.5) * 9).toFixed(2) + 'deg)';
        }
        if (items.length) {
          /* Each entry in the timeline lights as the shaft's light reaches
             it, instead of fading in on a generic timer — measured against
             a fixed line rather than a scroll fraction of the whole zone,
             since entries vary in height and a fraction would light the
             short ones and the long ones at different, uneven moments. */
          const lightY = window.innerHeight * LIGHT_LINE;
          items.forEach(item => {
            const ir = item.getBoundingClientRect();
            const centre = ir.top + ir.height / 2;
            const falloff = Math.max(140, ir.height * 0.9);
            const reach = (lightY - centre) / falloff + 0.5;
            item.style.setProperty('--lit', Math.max(0, Math.min(1, reach)).toFixed(3));
          });
        }
      });
    }

    const dust = well.querySelector('.airwell__dust');
    if (!dust || reduced) return;

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'width:100%;height:100%;display:block';
    dust.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let w = 0, h = 0, motes = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() {
      const r = dust.getBoundingClientRect();
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      motes = Array.from({ length: 46 }, () => ({
        x: w * (0.34 + Math.random() * 0.32),
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.5,
        vy: -0.06 - Math.random() * 0.16,
        vx: (Math.random() - 0.5) * 0.12,
        a: 0.15 + Math.random() * 0.4
      }));
    }
    size();
    new ResizeObserver(size).observe(dust);

    let visible = false;
    new IntersectionObserver(es => { visible = es[0].isIntersecting; },
                             { threshold: 0.02 }).observe(well);

    (function draw() {
      requestAnimationFrame(draw);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      motes.forEach(m => {
        m.y += m.vy; m.x += m.vx;
        if (m.y < -6) { m.y = h + 6; m.x = w * (0.34 + Math.random() * 0.32); }
        ctx.fillStyle = 'rgba(237,196,120,' + m.a.toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill();
      });
    })();
  }

  /* ======================================================================
     ROOM 5: THE LATTICE WINDOW
     Each picture sits behind a carved screen that opens when it arrives.
     The opening itself is done in CSS; this only staggers them so the
     screen seems to unfold rather than vanish all at once.
     ====================================================================== */
  function lattice() {
    if (room !== 'gallery') return;

    /* The screen over each picture is opened by adding the "in" class.
       The gallery buttons are built by site.js after the page loads, so
       they are not part of the shared reveal set and have to be handled
       here. Three mechanisms again, because a screen that fails to open
       leaves the photograph invisible, which is the worst outcome. */
    const open = el => el.classList.add('in');
    const items = () => document.querySelectorAll('.gallery__item');

    const prepare = () => {
      items().forEach((el, i) => {
        if (el.dataset.latticeReady) return;
        el.dataset.latticeReady = '1';
        el.style.setProperty('transition-delay', (i % 5) * 80 + 'ms');
        if (reduced) { open(el); return; }
        if ('IntersectionObserver' in window) {
          const io = new IntersectionObserver((es, obs) => {
            es.forEach(e => { if (e.isIntersecting) { open(e.target); obs.unobserve(e.target); } });
          }, { threshold: 0.15, rootMargin: '0px 0px -4% 0px' });
          io.observe(el);
        }
      });
    };

    const sweep = () => {
      const h = window.innerHeight;
      document.querySelectorAll('.gallery__item:not(.in)').forEach(el => {
        const r = el.getBoundingClientRect();
        // no lower bound, for the same reason as the section reveals: a fast
        // scroll must never leave a photograph behind a closed screen
        if (r.top < h * 0.92) open(el);
      });
    };

    Scroll.on(sweep);
    document.addEventListener('i18n:changed', () => { prepare(); setTimeout(sweep, 80); });
    window.addEventListener('load', () => { prepare(); sweep(); });
    window.addEventListener('scrollend', sweep);
    let ticks = 0;
    const ticker = setInterval(() => {
      prepare(); sweep();
      if (++ticks > 16) clearInterval(ticker);
    }, 500);
    setTimeout(() => { prepare(); sweep(); }, 300);
    setTimeout(sweep, 1200);
    setTimeout(() => items().forEach(open), 3200);   // last resort
    prepare();
  }

  /* ======================================================================
     ROOM 5, ELEVATED: THE SCREEN BEHIND THE SCREEN
     A second, fainter lattice sits behind the whole grid (see peranakan.css,
     "43. The lattice, layered") and drifts a little as the visitor scrolls
     past, so the carved screens on each photograph, above, read as standing
     in front of something with real depth rather than flat against the
     page. One rAF-gated write, the same custom-property technique as the
     pour and the airwell: a bounded progress value turned into a single
     translateY, written to the section itself so its own ::before inherits
     it directly. Nothing here ever touches layout.
     ====================================================================== */
  function galleryDepth() {
    if (room !== 'gallery' || reduced) return;
    const host = document.querySelector('.gallery-depth');
    if (!host) return;

    const AMPLITUDE = 44; // px either side of centre; the backdrop is 30% taller than its box, so this never uncovers an edge

    Scroll.on(() => {
      const r = host.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      const mid = r.top + r.height / 2 - window.innerHeight / 2;
      const p = Math.max(-1, Math.min(1, mid / window.innerHeight));
      host.style.setProperty('--depth-shift', (p * AMPLITUDE).toFixed(1) + 'px');
    });
  }

  /* ======================================================================
     ROOM 6: THE THRESHOLD, KINETIC
     The site's own front door (motion.js, "Opening sequence") has just
     shown the visitor in; this gives the page about visiting its own
     door, swinging shut and open again over its hero once the site's
     own doors have properly cleared, so the room announces itself the
     way the real shophouse would. See peranakan.css, "44. The threshold,
     kinetic", for why the closed position is never the resting one: it
     is added here, once, only after there is somewhere safe to open back
     out to, and never at all if the visitor has asked for less motion.
     ====================================================================== */
  function doorOpener() {
    if (room !== 'visit' || reduced) return;
    const host = document.querySelector('.door-opener');
    if (!host) return;

    // A beat after the site's own doors have cleared the viewport (their
    // own slide is 1.15s from the instant site:ready fires) rather than
    // layered on top of them, so this reads as a second, distinct door
    // rather than a collision with the first.
    const play = () => host.classList.add('door-opener--play');
    if (document.body.classList.contains('is-loaded')) {
      setTimeout(play, 1300);
    } else {
      document.addEventListener('site:ready', () => setTimeout(play, 1300), { once: true });
    }
  }

  /* ======================================================================
     ROOM 1: THE FIVE-FOOT WAY
     The opening screen parts down the middle like a pair of doors.
     ====================================================================== */
  function doors() {
    const loader = document.querySelector('.loader');
    if (!loader || reduced) return;
    loader.classList.add('loader--doors');
  }

  /* ======================================================================
     A SEAL, STAMPED
     The red chop presses down once when it comes into view, the way a
     seal is pressed onto paper.
     ====================================================================== */
  function seals() {
    const marks = document.querySelectorAll('.seal');
    if (!marks.length || reduced) return;
    const io = new IntersectionObserver((es, obs) => {
      es.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.animate(
          [{ transform: 'rotate(-7deg) scale(1.5)', opacity: 0 },
           { transform: 'rotate(-7deg) scale(0.94)', opacity: 1, offset: 0.62 },
           { transform: 'rotate(-7deg) scale(1)', opacity: 1 }],
          { duration: 620, easing: 'cubic-bezier(0.34,1.4,0.64,1)', fill: 'both' });
        obs.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    marks.forEach(m => io.observe(m));
  }

  /* ====================================================================== */
  function init() {
    buildCouplets();
    doors();
    steam();
    steep();
    airwell();
    lattice();
    galleryDepth();
    doorOpener();
    seals();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
