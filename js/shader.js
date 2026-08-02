/* Animated gradient mesh — canvas 2D, no WebGL dependency.
   Sits behind the hero as ambient atmosphere; respects reduced motion. */
(function () {
  "use strict";

  var canvas = document.getElementById("hero-shader");
  if (!canvas) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var w = 0;
  var h = 0;
  var t = 0;
  var raf = null;

  var blobs = [
    { x: 0.22, y: 0.35, r: 0.42, hue: 32, speed: 0.00035 },
    { x: 0.78, y: 0.28, r: 0.38, hue: 12, speed: 0.00028 },
    { x: 0.55, y: 0.72, r: 0.45, hue: 145, speed: 0.00022 },
    { x: 0.15, y: 0.78, r: 0.32, hue: 38, speed: 0.00031 }
  ];

  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    function v(name, fallback) {
      var got = cs.getPropertyValue(name).trim();
      return got || fallback;
    }
    return {
      base: v("--shader-base", "#0c0c0f"),
      bloom1: v("--shader-bloom-1", "rgba(212, 168, 83, 0.35)"),
      bloom2: v("--shader-bloom-2", "rgba(232, 165, 152, 0.28)"),
      bloom3: v("--shader-bloom-3", "rgba(143, 166, 143, 0.22)")
    };
  }

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    w = Math.max(1, rect.width);
    h = Math.max(1, rect.height);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    var colors = readColors();
    ctx.fillStyle = colors.base;
    ctx.fillRect(0, 0, w, h);

    var blooms = [colors.bloom1, colors.bloom2, colors.bloom3, colors.bloom1];
    blobs.forEach(function (b, i) {
      var phase = t * b.speed * 1000;
      var cx = (b.x + Math.sin(phase + i) * 0.08) * w;
      var cy = (b.y + Math.cos(phase * 0.9 + i * 1.3) * 0.07) * h;
      var radius = b.r * Math.min(w, h);
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      g.addColorStop(0, blooms[i % blooms.length]);
      g.addColorStop(1, "transparent");
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
    ctx.globalCompositeOperation = "source-over";

    /* Soft vignette */
    var vig = ctx.createRadialGradient(w * 0.5, h * 0.45, h * 0.2, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
    vig.addColorStop(0, "transparent");
    vig.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }

  function loop(ts) {
    t = ts;
    draw();
    raf = requestAnimationFrame(loop);
  }

  resize();
  draw();
  window.addEventListener("resize", function () {
    resize();
    if (reduce) draw();
  });

  document.documentElement.addEventListener("data-theme-set", function () {
    draw();
  });

  if (!reduce) {
    raf = requestAnimationFrame(loop);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    } else if (!reduce && !raf) {
      raf = requestAnimationFrame(loop);
    }
  });
})();
