/* Ludo-style pixel sprite — original 8-bit builder walk, not Nintendo art */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var hosts = Array.prototype.slice.call(document.querySelectorAll("[data-ludo-sprite]"));
  if (!hosts.length) return;

  function boot(canvas) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var compact = canvas.getAttribute("data-ludo-sprite") === "compact";
    var W = 640;
    var H = compact ? 44 : 56;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var x = 36;
    var dir = 1;
    var frame = 0;
    var acc = 0;
    var last = 0;
    var visible = true;
    var raf = 0;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      W = Math.max(160, Math.floor(rect.width) || 320);
      H = Math.max(36, Math.floor(rect.height) || H);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    }

    function px(x0, y0, w, h, c) {
      ctx.fillStyle = c;
      ctx.fillRect(Math.round(x0), Math.round(y0), w, h);
    }

    function drawSprite(ox, oy, f, facing) {
      ctx.save();
      ctx.translate(ox, oy);
      if (facing < 0) ctx.scale(-1, 1);
      var s = compact ? 2 : 2.5;
      ctx.scale(s, s);

      var ink = "#1a1814";
      var paper = "#f4ece4";
      var accent = "#d4a853";
      var skin = "#e8c4a8";
      var boot = "#3a3228";
      var step = f % 4;

      /* hat */
      px(-7, -10, 14, 3, ink);
      px(-5, -12, 10, 3, accent);
      /* head */
      px(-5, -8, 10, 8, skin);
      px(-6, -7, 1, 6, ink);
      px(5, -7, 1, 6, ink);
      px(-3, -5, 2, 2, ink);
      px(2, -5, 2, 2, ink);
      /* torso */
      px(-5, 0, 10, 9, accent);
      px(-4, 2, 8, 2, paper);
      /* arms */
      if (step === 1 || step === 2) {
        px(-8, 1, 4, 3, skin);
        px(4, 3, 4, 3, skin);
      } else {
        px(-8, 3, 4, 3, skin);
        px(4, 1, 4, 3, skin);
      }
      /* legs */
      if (step === 0) {
        px(-4, 9, 3, 6, boot);
        px(2, 9, 3, 4, boot);
        px(-5, 14, 4, 2, ink);
        px(2, 12, 4, 2, ink);
      } else if (step === 1) {
        px(-3, 9, 3, 7, boot);
        px(1, 9, 3, 7, boot);
        px(-4, 15, 4, 2, ink);
        px(1, 15, 4, 2, ink);
      } else if (step === 2) {
        px(-4, 9, 3, 4, boot);
        px(2, 9, 3, 6, boot);
        px(-4, 12, 4, 2, ink);
        px(2, 14, 4, 2, ink);
      } else {
        px(-3, 9, 3, 7, boot);
        px(1, 9, 3, 7, boot);
        px(-3, 15, 4, 2, ink);
        px(1, 15, 4, 2, ink);
      }
      ctx.restore();
    }

    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (!visible) {
        last = now;
        return;
      }
      if (!last) last = now;
      var dt = Math.min(32, now - last);
      last = now;
      acc += dt;
      if (acc >= 90) {
        acc = 0;
        frame++;
      }
      x += dir * (dt * 0.055);
      if (x > W - 30) dir = -1;
      if (x < 30) dir = 1;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(212,168,83,0.45)";
      ctx.fillRect(0, H - 5, W, 2);
      var dots = Math.floor(W / 28);
      var i;
      for (i = 0; i < dots; i++) {
        ctx.fillStyle = "rgba(26,24,20,0.18)";
        ctx.fillRect(8 + i * 28, H - 5, 4, 2);
      }
      drawSprite(x, H - 30, frame, dir);
    }

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", function () {
      visible = !document.hidden;
      if (visible) last = 0;
    });

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visible = entry.isIntersecting && !document.hidden;
          if (visible) last = 0;
        });
      }, { threshold: 0.1 });
      io.observe(canvas);
    }

    raf = requestAnimationFrame(loop);
  }

  hosts.forEach(boot);
})();
