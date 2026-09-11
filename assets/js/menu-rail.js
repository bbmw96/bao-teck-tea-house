/* ==========================================================================
   MENU-RAIL — the steamer trolley, wheeled past as you scroll

   The dish cards are real, ordinary DOM built by site.js's buildMenu() long
   before this file does anything: every name, price and photo is there and
   readable with no JS at all. This file's only job, once that catalogue
   exists, is to pin it in place and turn "how far the visitor has scrolled
   through the pinned section" into "how far the row of baskets has panned
   sideways" — so filtering by category still works exactly as before
   (site.js hides and shows .dish elements with the hidden attribute; this
   file never touches that), and a visitor just sees fewer baskets to pan
   past.

   Ground rules, matched to hero-scrub.js and the rest of the motion system:
   - No raw scroll listener touches layout. Scroll only sets a flag; a
     single rAF loop reads scroll position and writes a transform, once per
     frame, at most.
   - The loop only exists while the rail is on screen and the tab is
     visible.
   - Desktop and motion-allowed only. Below that, or if this script never
     runs at all, .menu-rail stays exactly as plain as its markup: no
     class, no pin, no clipping — the CSS only turns the trolley mechanic on
     for .menu-rail.is-rail-active, and that class is the very last thing
     this file adds, only once it knows the catalogue is really there. A
     phone gets the normal wrapping basket grid the page already had.
   ========================================================================== */
(function () {
  'use strict';

  var section = document.querySelector('[data-menu-rail]');
  if (!section) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isDesktop = window.matchMedia('(min-width: 61rem)').matches;
  if (reduceMotion || !isDesktop) return; // the plain grid in the markup already covers this visitor

  function boot() {
    var pin = section.querySelector('.menu-rail__pin');
    var stage = section.querySelector('.steam-stage');
    var grid = section.querySelector('[data-menu-grid]');
    // If the catalogue never got built (shared.js missing, a script error
    // upstream), there is nothing to pan — leave the section inert rather
    // than pin an empty box over the visitor's scroll.
    if (!pin || !stage || !grid || !grid.children.length) return;

    section.classList.add('is-rail-active');

    var progressThread = document.createElement('div');
    progressThread.className = 'menu-rail__progress';
    progressThread.setAttribute('aria-hidden', 'true');
    progressThread.innerHTML = '<span></span>';
    pin.appendChild(progressThread);
    var progressFill = progressThread.querySelector('span');

    var isRTL = document.documentElement.dir === 'rtl';
    var maxScroll = 0;
    var dirty = false;
    var looping = false;
    var lastProgress = -1;

    function clamp01(n) { return n < 0 ? 0 : n > 1 ? 1 : n; }

    // The rail's own scrollable width, in both directions: a category
    // filter hiding most of the catalogue, a viewport resize, a web font
    // swapping in a touch late and nudging card widths — all change this,
    // and the ResizeObserver below re-runs it whenever any of them happen.
    function measure() {
      maxScroll = Math.max(0, grid.scrollWidth - stage.clientWidth);
    }

    function currentProgress() {
      var rect = section.getBoundingClientRect();
      var scrubDistance = section.offsetHeight - window.innerHeight;
      if (scrubDistance <= 0) return 0;
      return clamp01(-rect.top / scrubDistance);
    }

    function paint() {
      dirty = false;
      var p = currentProgress();
      if (Math.abs(p - lastProgress) > 0.001) {
        lastProgress = p;
        var x = (isRTL ? 1 : -1) * p * maxScroll;
        grid.style.transform = 'translateX(' + x + 'px)';
        progressFill.style.transform = 'scaleX(' + p + ')';
      }
    }

    function frame() {
      if (dirty) paint();
      if (looping) requestAnimationFrame(frame);
    }

    function startLoop() {
      if (looping) return;
      looping = true;
      dirty = true; // paint immediately on entry, don't wait for the next scroll
      requestAnimationFrame(frame);
    }

    function stopLoop() { looping = false; }

    function onScroll() { dirty = true; }

    var io = new IntersectionObserver(function (entries) {
      var visible = entries[0] && entries[0].isIntersecting;
      if (visible && document.visibilityState === 'visible') startLoop();
      else stopLoop();
    }, { threshold: 0 });
    io.observe(section);

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState !== 'visible') { stopLoop(); return; }
      var r = section.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) startLoop();
    });

    window.addEventListener('scroll', onScroll, { passive: true });

    // One observer covers every reason the row's width could change —
    // replaces a separate resize listener and a separate filter hook.
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(function () {
        measure();
        lastProgress = -1; // force a repaint even if the scroll position hasn't moved
        dirty = true;
      });
      ro.observe(grid);
      ro.observe(stage);
    } else {
      window.addEventListener('resize', function () { measure(); dirty = true; }, { passive: true });
    }

    measure();
    dirty = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
