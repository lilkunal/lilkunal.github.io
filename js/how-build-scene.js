/* Mario-style runner along How I Build ground line — original pixel art (not Nintendo sprites) */
(function () {
  "use strict";

  var canvas = document.querySelector("[data-how-build-scene]");
  if (!canvas) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var W = 960;
  var H = 140;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var raf = null;
  var t = 0;
  var x = 60;
  var facing = 1;
  var speed = 2.1;
  var scale = 1.55;

  function resize() {
    var rect = canvas.getBoundingClientRect();
    W = Math.max(320, Math.floor(rect.width) || canvas.parentElement.clientWidth || 960);
    H = Math.max(110, Math.floor(rect.height) || 140);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scale = W < 640 ? 1.25 : 1.55;
  }

  function px(x0, y0, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x0), Math.round(y0), w, h);
  }

  /* Original plumber-inspired runner — homage silhouette only */
  function drawRunner(ox, oy, frame, dir) {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(dir < 0 ? -scale : scale, scale);

    var leg = frame % 4;
    var bob = (leg === 1 || leg === 3) ? -1 : 0;

    px(-10, -34 + bob, 22, 6, "#c62828");
    px(-6, -40 + bob, 14, 6, "#c62828");
    px(2, -38 + bob, 8, 4, "#ffffff");

    px(-8, -28 + bob, 16, 12, "#f5c39a");
    px(-10, -24 + bob, 4, 6, "#5d4037");
    px(6, -24 + bob, 4, 4, "#5d4037");
    px(-4, -22 + bob, 3, 3, "#1a1814");
    px(-2, -16 + bob, 8, 3, "#5d4037");

    px(-10, -16 + bob, 20, 14, "#1565c0");
    px(-6, -16 + bob, 12, 6, "#c62828");
    px(-2, -10 + bob, 4, 4, "#fbbf24");

    px(-14, -14 + bob, 4, 10, "#f5c39a");
    px(10, -14 + bob, 4, 10, "#f5c39a");

    if (leg === 0) {
      px(-8, -2 + bob, 6, 10, "#1565c0");
      px(2, -2 + bob, 6, 8, "#1565c0");
      px(-8, 8 + bob, 7, 4, "#3e2723");
      px(2, 6 + bob, 7, 4, "#3e2723");
    } else if (leg === 1) {
      px(-10, -2 + bob, 6, 8, "#1565c0");
      px(4, -2 + bob, 6, 10, "#1565c0");
      px(-10, 6 + bob, 7, 4, "#3e2723");
      px(4, 8 + bob, 7, 4, "#3e2723");
    } else if (leg === 2) {
      px(-6, -2 + bob, 6, 10, "#1565c0");
      px(0, -2 + bob, 6, 8, "#1565c0");
      px(-6, 8 + bob, 7, 4, "#3e2723");
      px(0, 6 + bob, 7, 4, "#3e2723");
    } else {
      px(-4, -2 + bob, 6, 8, "#1565c0");
      px(2, -2 + bob, 6, 10, "#1565c0");
      px(-4, 6 + bob, 7, 4, "#3e2723");
      px(2, 8 + bob, 7, 4, "#3e2723");
    }

    ctx.restore();
  }

  function drawDust(ox, oy, frame) {
    var f = frame % 6;
    ctx.fillStyle = "rgba(120,110,90,0.4)";
    if (f < 3) {
      ctx.beginPath();
      ctx.ellipse(ox - facing * 18, oy + 4, 7 + f, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (f > 1 && f < 5) {
      ctx.beginPath();
      ctx.ellipse(ox - facing * 28, oy + 6, 5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawSoftHills() {
    ctx.fillStyle = "rgba(90, 120, 80, 0.08)";
    for (var i = 0; i < 4; i++) {
      var hx = ((i * 260 + t * 0.12) % (W + 240)) - 120;
      ctx.beginPath();
      ctx.ellipse(hx, H - 18, 80 + i * 10, 26, 0, Math.PI, 0);
      ctx.fill();
    }
  }

  function drawCoins() {
    var gy = H - 48;
    for (var i = 0; i < 5; i++) {
      var cx = ((i * 190 + t * 0.9) % (W + 50)) - 25;
      var cy = gy - 36 - Math.sin((t + i * 18) * 0.07) * 5;
      px(cx, cy, 9, 9, "rgba(251, 191, 36, 0.4)");
      px(cx + 2, cy + 2, 5, 5, "rgba(255, 236, 179, 0.45)");
    }
  }

  function render() {
    t += 1;
    ctx.clearRect(0, 0, W, H);

    drawSoftHills();
    drawCoins();

    if (!reduce) {
      x += speed * facing;
      if (x > W - 50) facing = -1;
      else if (x < 50) facing = 1;
    }

    var groundY = H - 48;
    var frame = Math.floor(t / 5);
    drawDust(x, groundY, frame);
    drawRunner(x, groundY, frame, facing);

    if (!reduce) raf = requestAnimationFrame(render);
  }

  function onVis() {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    } else if (!raf && !reduce) {
      raf = requestAnimationFrame(render);
    }
  }

  resize();
  window.addEventListener("resize", function () {
    resize();
    if (reduce) render();
  }, { passive: true });
  document.addEventListener("visibilitychange", onVis);

  if (reduce) {
    x = W * 0.35;
    render();
  } else {
    raf = requestAnimationFrame(render);
  }
})();
