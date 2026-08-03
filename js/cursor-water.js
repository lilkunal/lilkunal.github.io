/* Soft cursor accent — small glow + lagging ring (fits portfolio light/dark themes) */
(function () {
  "use strict";

  if (window.__cursorAccentInit) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(pointer: fine)").matches) return;

  window.__cursorAccentInit = true;

  var root = document.createElement("div");
  root.className = "cursor-accent is-hidden";
  root.setAttribute("aria-hidden", "true");

  var dot = document.createElement("span");
  dot.className = "cursor-accent__dot";

  var ring = document.createElement("span");
  ring.className = "cursor-accent__ring";

  root.appendChild(ring);
  root.appendChild(dot);
  document.body.appendChild(root);

  var mx = -100;
  var my = -100;
  var dotX = mx;
  var dotY = my;
  var ringX = mx;
  var ringY = my;
  var visible = false;
  var running = false;
  var pressed = false;

  var DOT_EASE = 0.28;
  var RING_EASE = 0.12;

  function show() {
    if (visible) return;
    visible = true;
    root.classList.remove("is-hidden");
  }

  function hide() {
    visible = false;
    root.classList.add("is-hidden");
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

    dot.style.transform = "translate3d(" + dotX + "px," + dotY + "px,0)";
    ring.style.transform = "translate3d(" + ringX + "px," + ringY + "px,0)";

    requestAnimationFrame(tick);
  }

  function setPressed(on) {
    pressed = on;
    root.classList.toggle("is-pressed", on);
  }

  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("mousedown", function () { setPressed(true); }, { passive: true });
  window.addEventListener("mouseup", function () { setPressed(false); }, { passive: true });
  document.addEventListener("mouseleave", hide);
  window.addEventListener("blur", hide);

  document.documentElement.classList.add("has-cursor-accent");
})();
