/* Editorial cursor — crosshair grid + magnetic ring + sticker spotlight */
(function () {
  "use strict";

  if (window.__cursorAccentInit) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(pointer: fine)").matches) return;

  window.__cursorAccentInit = true;

  var root = document.createElement("div");
  root.className = "cursor-accent is-hidden";
  root.setAttribute("aria-hidden", "true");

  var crossH = document.createElement("span");
  crossH.className = "cursor-accent__cross cursor-accent__cross--h";

  var crossV = document.createElement("span");
  crossV.className = "cursor-accent__cross cursor-accent__cross--v";

  var ring = document.createElement("span");
  ring.className = "cursor-accent__ring";

  var dot = document.createElement("span");
  dot.className = "cursor-accent__dot";

  var glow = document.createElement("span");
  glow.className = "cursor-accent__glow";

  root.appendChild(crossH);
  root.appendChild(crossV);
  root.appendChild(glow);
  root.appendChild(ring);
  root.appendChild(dot);
  document.body.appendChild(root);

  var mx = -100;
  var my = -100;
  var dotX = mx;
  var dotY = my;
  var ringX = mx;
  var ringY = my;
  var crossX = mx;
  var crossY = my;
  var visible = false;
  var running = false;
  var mode = "default";

  var DOT_EASE = 0.32;
  var RING_EASE = 0.14;
  var CROSS_EASE = 0.08;

  function show() {
    if (visible) return;
    visible = true;
    root.classList.remove("is-hidden");
  }

  function hide() {
    visible = false;
    root.classList.add("is-hidden");
  }

  function setMode(next) {
    if (mode === next) return;
    mode = next;
    root.dataset.mode = next;
  }

  function onMove(e) {
    mx = e.clientX;
    my = e.clientY;
    show();
    if (!running) {
      running = true;
      requestAnimationFrame(tick);
    }
  }

  function tick() {
    if (!visible) {
      running = false;
      return;
    }

    dotX += (mx - dotX) * DOT_EASE;
    dotY += (my - dotY) * DOT_EASE;
    ringX += (mx - ringX) * RING_EASE;
    ringY += (my - ringY) * RING_EASE;
    crossX += (mx - crossX) * CROSS_EASE;
    crossY += (my - crossY) * CROSS_EASE;

    dot.style.transform = "translate3d(" + dotX + "px," + dotY + "px,0)";
    ring.style.transform = "translate3d(" + ringX + "px," + ringY + "px,0)";
    glow.style.transform = "translate3d(" + dotX + "px," + dotY + "px,0)";
    crossH.style.transform = "translate3d(0," + crossY + "px,0)";
    crossV.style.transform = "translate3d(" + crossX + "px,0,0)";

    requestAnimationFrame(tick);
  }

  function setPressed(on) {
    root.classList.toggle("is-pressed", on);
  }

  function updateModeFromTarget(el) {
    if (!el || !el.closest) {
      setMode("default");
      return;
    }
    if (el.closest(".hero--milo") && !el.closest(".deck-wrap") && !el.closest("a, button")) {
      setMode("hero-flip");
      return;
    }
    if (el.closest("a, button, .deck__btn, .work-stack__cta, .contact-chip, .offclock__tile")) {
      setMode("magnetic");
      return;
    }
    if (el.closest(".work-stack__visual, .cv-scroll__panel")) {
      setMode("focus");
      return;
    }
    setMode("default");
  }

  window.addEventListener("mousemove", function (e) {
    onMove(e);
    updateModeFromTarget(e.target);
  }, { passive: true });

  window.addEventListener("mousedown", function () { setPressed(true); }, { passive: true });
  window.addEventListener("mouseup", function () { setPressed(false); }, { passive: true });
  document.addEventListener("mouseleave", hide);
  window.addEventListener("blur", hide);

  /* Sticker spotlight — brighten stickers near pointer in hero */
  var hero = document.querySelector(".hero--milo");
  var stickers = hero
    ? Array.prototype.slice.call(hero.querySelectorAll(".sticker"))
    : [];
  var spotlightR = 140;

  if (hero && stickers.length) {
    window.addEventListener("mousemove", function (e) {
      if (!hero.contains(e.target) && e.target !== hero) {
        stickers.forEach(function (st) {
          st.style.filter = "";
          st.style.zIndex = "";
        });
        return;
      }
      var hr = hero.getBoundingClientRect();
      if (e.clientY < hr.top || e.clientY > hr.bottom) return;

      stickers.forEach(function (st) {
        var r = st.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        var dist = Math.hypot(e.clientX - cx, e.clientY - cy);
        if (dist < spotlightR) {
          var t = 1 - dist / spotlightR;
          st.style.filter = "brightness(" + (1 + t * 0.35).toFixed(2) + ") saturate(" + (1 + t * 0.2).toFixed(2) + ")";
          st.style.zIndex = "2";
        } else {
          st.style.filter = "brightness(0.82) saturate(0.85)";
          st.style.zIndex = "";
        }
      });
    }, { passive: true });
  }

  document.documentElement.classList.add("has-cursor-accent");
})();
