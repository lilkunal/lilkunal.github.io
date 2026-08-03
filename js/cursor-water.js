/* Water-flow cursor — canvas trail with soft metaball blobs.
   Shared default: copy from shared/cursor-water/ or link relatively in monorepo. */
(function () {
  "use strict";

  if (window.__cursorWaterInit) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(pointer: fine)").matches) return;

  window.__cursorWaterInit = true;

  var canvas = document.createElement("canvas");
  canvas.className = "cursor-water";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);

  var ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  var w = 0;
  var h = 0;
  var dpr = 1;
  var trail = [];
  var mx = -999;
  var my = -999;
  var lx = mx;
  var ly = my;
  var running = true;
  var MAX_TRAIL = 80;

  function colors() {
    var s = getComputedStyle(document.documentElement);
    return {
      core: s.getPropertyValue("--cursor-water-core").trim() || "96, 165, 250",
      glow: s.getPropertyValue("--cursor-water-glow").trim() || "56, 189, 248",
      accent: s.getPropertyValue("--cursor-water-accent").trim() || "251, 191, 36",
      fade: parseFloat(s.getPropertyValue("--cursor-water-fade")) || 0.1
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function splat(x, y, radius, alpha, rgb) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, "rgba(" + rgb + "," + alpha + ")");
    g.addColorStop(0.35, "rgba(" + rgb + "," + (alpha * 0.45) + ")");
    g.addColorStop(1, "rgba(" + rgb + ",0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function pushPoint(x, y, force) {
    var f = force || 1;
    trail.push({
      x: x,
      y: y,
      r: (10 + Math.random() * 6) * f,
      a: 0.28 + Math.random() * 0.12,
      wobble: Math.random() * Math.PI * 2
    });
    if (trail.length > MAX_TRAIL) trail.splice(0, trail.length - MAX_TRAIL);
  }

  function onMove(e) {
    mx = e.clientX;
    my = e.clientY;
    var dx = mx - lx;
    var dy = my - ly;
    var dist = Math.hypot(dx, dy);
    if (dist < 0.5) return;
    var steps = Math.max(1, Math.min(12, Math.floor(dist / 5)));
    var force = Math.min(2.2, 0.6 + dist * 0.04);
    for (var i = 1; i <= steps; i++) {
      var t = i / steps;
      pushPoint(lx + dx * t, ly + dy * t, force);
    }
    lx = mx;
    ly = my;
  }

  function onClick(e) {
    var c = colors();
    for (var i = 0; i < 6; i++) {
      var angle = (Math.PI * 2 * i) / 6;
      trail.push({
        x: e.clientX + Math.cos(angle) * 4,
        y: e.clientY + Math.sin(angle) * 4,
        r: 18 + i * 2,
        a: 0.35,
        wobble: angle,
        rgb: c.accent
      });
    }
  }

  function frame() {
    if (!running) return;
    var c = colors();

    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0," + c.fade + ")";
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = "lighter";

    for (var i = trail.length - 1; i >= 0; i--) {
      var p = trail[i];
      p.a *= 0.935;
      p.r *= 0.975;
      p.wobble += 0.08;
      if (p.a < 0.015 || p.r < 2) {
        trail.splice(i, 1);
        continue;
      }
      var ox = Math.cos(p.wobble) * 1.2;
      var oy = Math.sin(p.wobble * 1.3) * 1.2;
      var rgb = p.rgb || c.glow;
      splat(p.x + ox, p.y + oy, p.r, p.a, rgb);
      splat(p.x - ox * 0.5, p.y - oy * 0.5, p.r * 0.55, p.a * 0.35, c.core);
    }

    if (mx > -500) {
      splat(mx, my, 20, 0.22, c.accent);
      splat(mx, my, 12, 0.35, c.core);
    }

    requestAnimationFrame(frame);
  }

  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) requestAnimationFrame(frame);
  });

  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("mousedown", onClick, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("blur", function () {
    mx = -999;
    my = -999;
  });

  resize();
  document.documentElement.classList.add("has-cursor-water");
  requestAnimationFrame(frame);
})();
