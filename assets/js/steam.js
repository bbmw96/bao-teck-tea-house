/* ==========================================================================
   BAO TECK TEA HOUSE — THE STEAM

   A living background for the top of each page: real steam, drawn by the
   graphics card, never repeating and never the same twice.

   WHY STEAM AND NOT A PHOTOGRAPH
   A steamer basket is the one thing this shop is never without, and steam is
   the one thing a photograph of it can never hold still. It is drawn here in
   code instead: a field of soft noise whose own coordinates are pushed around
   by more noise, drifting upward. That is what gives it the curl and the
   thinning that real steam has, and it costs no image file at all.

   THIS IS AN ENHANCEMENT, NEVER A REQUIREMENT
   If the graphics card is unavailable, if the shader will not compile, or if
   the visitor has asked their computer to reduce motion, this does nothing at
   all and the quiet painted gradient underneath simply stays on show. There
   is always a background. Nothing here can leave a page blank.

   IT ALSO STOPS WHEN NOBODY IS LOOKING
   The moment the hero scrolls out of view, or the visitor changes tab, the
   drawing stops. It costs nothing off screen.

   NOTHING TO EDIT HERE. The colours come from the website's own palette, so
   changing the theme changes the steam with it.
   ========================================================================== */

(function steam() {
  'use strict';

  const root = document.documentElement;

  /* Motion is a medical accommodation, not a preference. If the visitor has
     asked for less of it, we draw nothing and let the painted gradient stand. */
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (still.matches) return;

  const hosts = document.querySelectorAll('[data-steam-field], .hero');
  if (!hosts.length) return;

  /* Read a colour out of the page's own palette so the steam always matches
     the theme, and re-matches for free when the theme changes. */
  function paletteColour(name, fallback) {
    const v = getComputedStyle(root).getPropertyValue(name).trim();
    let m = v.match(/^#?([0-9a-fA-F]{6})$/);
    if (m) {
      const n = parseInt(m[1], 16);
      return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
    }
    m = v.match(/^#?([0-9a-fA-F]{3})$/);
    if (m) {
      const h = m[1];
      return [parseInt(h[0] + h[0], 16) / 255,
              parseInt(h[1] + h[1], 16) / 255,
              parseInt(h[2] + h[2], 16) / 255];
    }
    const rm = v.match(/rgba?\(([^)]+)\)/);
    if (rm) {
      const a = rm[1].split(/[,\s/]+/).filter(Boolean);
      return [parseFloat(a[0]) / 255, parseFloat(a[1]) / 255, parseFloat(a[2]) / 255];
    }
    return fallback;
  }

  const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}';

  /* The shader. Kept on one line per statement so a compile failure is easy
     to place. Everything below is ordinary trigonometry: there is no library. */
  const FRAG = [
    'precision highp float;',
    'uniform vec2 u_res; uniform float u_time;',
    'uniform vec3 u_steam; uniform vec3 u_warm; uniform vec3 u_bg;',
    'uniform float u_strength;',

    // value noise
    'vec2 hash(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));',
    ' return -1.0+2.0*fract(sin(p)*43758.5453123);}',
    'float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);',
    ' return mix(mix(dot(hash(i),f),dot(hash(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),',
    '            mix(dot(hash(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),',
    '                dot(hash(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);}',

    // five octaves, so the steam has both large billows and fine wisps
    'float fbm(vec2 p){float v=0.0,a=0.5;',
    ' for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.02+vec2(1.3,1.7);a*=0.5;}return v;}',

    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/u_res.xy;',
    ' vec2 p=uv; p.x*=u_res.x/u_res.y; p*=2.55;',
    ' float t=u_time*0.055;',

    // The rise. Subtracting time from y walks the noise field upward, which
    // is the whole difference between steam and an ordinary drifting cloud.
    ' vec2 q=vec2(fbm(p+vec2(0.0,-t*1.45)), fbm(p+vec2(3.10,-t*1.15)));',
    ' vec2 r=vec2(fbm(p+1.95*q+vec2(1.7,9.2)-0.17*t),',
    '             fbm(p+1.95*q+vec2(8.3,2.8)-0.13*t));',
    ' float f=fbm(p+1.85*r);',
    ' float m=smoothstep(0.02,0.72,f);',

    // Steam is dense where it leaves the basket and gone by the ceiling.
    ' float rise=smoothstep(1.02,0.02,uv.y);',
    ' m*=rise;',

    // The steam is drawn as a see-through layer, not as a picture.
    //
    // An earlier version filled the canvas with opaque colour. On the dark
    // home page that happened to look right, but on the pale tea and gallery
    // rooms it painted a solid dark green sheet straight over the page and
    // left the headings unreadable. Only the density is carried in the alpha
    // now, so the steam thins to nothing and whatever is behind it shows
    // through, on any colour of ground.
    ' float a=m*0.62*u_strength;',

    // Fade out through the lower middle, where the heading sits.
    ' a*=1.0-smoothstep(0.60,0.04,uv.y)*0.82;',

    ' vec3 col=mix(u_steam,u_warm,smoothstep(0.45,1.12,length(r))*0.45);',
    ' gl_FragColor=vec4(col,clamp(a,0.0,0.72));',
    '}'
  ].join('\n');

  function start(host) {
    const canvas = document.createElement('canvas');
    canvas.className = 'steam-canvas';
    canvas.setAttribute('aria-hidden', 'true');   // decoration, not content
    host.prepend(canvas);

    const opts = {
      antialias: false, alpha: true, premultipliedAlpha: false,
      powerPreference: 'low-power', failIfMajorPerformanceCaveat: false
    };
    const gl = canvas.getContext('webgl', opts) ||
               canvas.getContext('experimental-webgl', opts);
    if (!gl) { canvas.remove(); return; }         // painted gradient stands in

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { canvas.remove(); return; }

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(prog);

    // one full-screen triangle
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uSteam = gl.getUniformLocation(prog, 'u_steam');
    const uWarm = gl.getUniformLocation(prog, 'u_warm');
    const uBg = gl.getUniformLocation(prog, 'u_bg');
    const uStrength = gl.getUniformLocation(prog, 'u_strength');

    function paint() {
      gl.uniform3fv(uSteam, paletteColour('--steam-body', [0.96, 0.93, 0.88]));
      gl.uniform3fv(uWarm,  paletteColour('--steam-warm', [0.87, 0.64, 0.25]));
      gl.uniform3fv(uBg,    paletteColour('--steam-ground', [0.05, 0.10, 0.08]));
      gl.uniform1f(uStrength, parseFloat(
        getComputedStyle(host).getPropertyValue('--steam-strength')) || 1);
    }
    paint();
    document.addEventListener('i18n:changed', paint);
    new MutationObserver(paint).observe(root, {
      attributes: true, attributeFilter: ['data-theme']
    });

    // A retina screen would otherwise cost four times the fill for no gain.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    function resize() {
      const w = host.clientWidth, h = host.clientHeight;
      canvas.width = Math.max(1, (w * dpr) | 0);
      canvas.height = Math.max(1, (h * dpr) | 0);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    }
    resize();
    addEventListener('resize', resize, { passive: true });

    const t0 = performance.now();
    let raf = 0, onscreen = true;

    function draw(now) {
      raf = requestAnimationFrame(draw);
      gl.uniform1f(uTime, (now - t0) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.style.opacity = '1';
    }
    function run(on) {
      if (on && !raf) raf = requestAnimationFrame(draw);
      else if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    document.addEventListener('visibilitychange',
      () => run(!document.hidden && onscreen));

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(e => {
        onscreen = e[0].isIntersecting;
        run(onscreen && !document.hidden);
      }, { threshold: 0 }).observe(host);
    }

    run(true);

    /* If the visitor turns reduced motion on while the page is open, stop. */
    const stop = () => { if (still.matches) { run(false); canvas.remove(); } };
    still.addEventListener ? still.addEventListener('change', stop)
                           : still.addListener && still.addListener(stop);
  }

  hosts.forEach(start);
})();
