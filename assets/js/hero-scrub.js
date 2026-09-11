/* ==========================================================================
   HERO-SCRUB — the moss garden film, driven by scroll position

   The footage is real: the owner's own video of the airwell, trimmed to a
   clean nineteen-and-a-half-second push and graded to match the room. This
   file's only job is to turn "how far the visitor has scrolled through the
   pinned hero" into "which frame of that film is showing", so the arrival
   plays at the visitor's own pace rather than autoplaying at the camera's.

   Ground rules, matched to the rest of the motion system in motion.js:
   - No raw scroll listener ever touches layout or writes every frame it
     fires. Scroll only sets a flag; a single rAF loop reads scroll and
     writes video.currentTime and a transform, once per frame, at most.
   - The loop only exists while the hero is on screen and the tab is
     visible. Off screen, nothing runs at all — the same pattern steam.js
     uses for its WebGL field.
   - Desktop only. A phone does not scroll like a mouse wheel, and the CSS
     already collapses the tall pinned section back to a normal one-screen
     hero below 61rem and under prefers-reduced-motion — this file simply
     declines to do any work in either case, so there is nothing to undo.
   - If the video never loads (slow connection, blocked, missing file) the
     poster photograph already on screen simply stays there. Nothing here
     can leave the hero broken or blank.
   ========================================================================== */
(function () {
  'use strict';

  var container = document.querySelector('[data-hero-scrub]');
  if (!container) return;

  var video = container.querySelector('[data-scrub-video]');
  if (!video) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isDesktop = window.matchMedia('(min-width: 61rem)').matches;
  if (reduceMotion || !isDesktop) return; // the poster carries the hero; nothing to wire up

  var progressThread = document.createElement('div');
  progressThread.className = 'hero-scrub__progress';
  progressThread.setAttribute('aria-hidden', 'true');
  progressThread.innerHTML = '<span></span>';
  container.appendChild(progressThread);
  var progressFill = progressThread.querySelector('span');

  var ready = false;
  var dirty = false;
  var looping = false;
  var lastProgress = -1;

  function clamp01(n) { return n < 0 ? 0 : n > 1 ? 1 : n; }

  function currentProgress() {
    var rect = container.getBoundingClientRect();
    var scrubDistance = container.offsetHeight - window.innerHeight;
    if (scrubDistance <= 0) return 0;
    return clamp01(-rect.top / scrubDistance);
  }

  function paint() {
    dirty = false;
    var p = currentProgress();
    // Skip the write if the frame would not visibly change — video.currentTime
    // is a real seek, not a cheap compositor property, so this matters.
    if (Math.abs(p - lastProgress) > 0.0008) {
      lastProgress = p;
      if (ready && isFinite(video.duration) && video.duration > 0) {
        var t = p * video.duration;
        // Guard against redundant seeks landing on the same decoded frame.
        if (Math.abs(video.currentTime - t) > 0.02) video.currentTime = t;
      }
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

  function stopLoop() {
    looping = false;
  }

  function onScroll() { dirty = true; }

  var io = new IntersectionObserver(function (entries) {
    var visible = entries[0] && entries[0].isIntersecting;
    if (visible && document.visibilityState === 'visible') startLoop();
    else stopLoop();
  }, { threshold: 0 });
  io.observe(container);

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'visible') stopLoop();
    else if (container.getBoundingClientRect().bottom > 0 &&
             container.getBoundingClientRect().top < window.innerHeight) startLoop();
  });

  window.addEventListener('scroll', onScroll, { passive: true });

  function markReady() {
    if (ready) return;
    ready = true;
    container.classList.add('is-scrub-ready');
    dirty = true; // land on the right frame the instant the crossfade starts
  }

  // preload="none" in the markup means nothing downloads until we ask —
  // deliberate, so a visitor who never reaches the hero on a slow link never
  // pays for 3.5MB they didn't need. Desktop-and-motion-allowed visitors ask
  // for it immediately.
  video.addEventListener('loadeddata', markReady, { once: true });
  video.preload = 'auto';
  video.load();

  // Belt and braces: if the video errors out or simply never fires
  // loadeddata (corrupt file, unsupported codec, blocked request), the
  // poster picture already on screen is the entire fallback and needs no
  // further action from this file.
})();
