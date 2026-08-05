/* Image stretch transition, scroll-driven.
   Modelled on the Jitter "Image Stretch Transition" look: the frame opens
   vertically from a squashed state while the picture inside counter-scales,
   so the image reads as stretching open rather than simply fading in. A
   second pass adds live squash-and-stretch tied to scroll velocity — the
   classic animation principle, driven by how fast the page is moving.

   Deliberately animates a PARENT frame, never the images themselves. The
   work images already carry a slow ken-burns scale of their own, and this
   session has hit transform collisions twice: CSS transforms on one element
   don't merge, the last writer wins. Parent and child transforms multiply
   instead, which is exactly the frame-stretch + counter-scale effect wanted
   here — so the two compose rather than fight.

   Never touches opacity, so a stalled or blocked animation leaves the image
   fully visible rather than invisible. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  var frames = Array.prototype.slice.call(
    document.querySelectorAll(".work-fly__hero, [data-stretch]")
  );
  if (!frames.length) return;

  frames.forEach(function (f) {
    f.style.willChange = "transform";
    f.style.transformOrigin = "center center";
  });

  /* ---- 1. Stretch-open reveal as each frame enters the viewport ---- */
  function revealed(frame) {
    frame.dataset.stretchDone = "1";
    /* Squashed to start, springs open. Y overshoots slightly past 1 then
       settles; X does the inverse, which is what sells it as elastic rather
       than a plain scale. */
    frame.animate(
      [
        { transform: "scaleY(0.72) scaleX(1.06)" },
        { transform: "scaleY(1.05) scaleX(0.985)", offset: 0.55 },
        { transform: "scaleY(1) scaleX(1)" }
      ],
      { duration: 900, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "none" }
    );
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || e.target.dataset.stretchDone) return;
        revealed(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.25 });
    frames.forEach(function (f) { io.observe(f); });

    /* Some in-app browsers (the ones Instagram and LinkedIn open links in)
       fire IntersectionObserver unreliably — that already caused invisible
       content on the résumé page this session. Here the stakes are lower, but
       the velocity effect below is gated on stretchDone, so a never-firing
       observer would silently disable it for good. Mark them eligible after a
       few seconds regardless; they just skip the one-off open animation. */
    setTimeout(function () {
      frames.forEach(function (f) {
        if (!f.dataset.stretchDone) f.dataset.stretchDone = "1";
      });
    }, 3000);
  } else {
    frames.forEach(function (f) { f.dataset.stretchDone = "1"; });
  }

  /* ---- 2. Live squash-and-stretch from scroll velocity ---- */
  var lastY = window.scrollY;
  var velocity = 0;
  var ticking = false;

  function apply() {
    ticking = false;
    /* Volume-preserving: stretch on Y is paid for by squash on X, which is
       what makes it read as elastic rather than as a size change. */
    var v = Math.max(-1, Math.min(1, velocity / 55));
    var sy = 1 + v * 0.06;
    var sx = 1 - v * 0.035;

    for (var i = 0; i < frames.length; i++) {
      var f = frames[i];
      /* Skip anything mid-reveal so the two effects never write transform in
         the same frame — the reveal uses the Web Animations API, which owns
         the property while it runs. */
      if (!f.dataset.stretchDone) continue;
      f.style.transform = "scaleY(" + sy.toFixed(4) + ") scaleX(" + sx.toFixed(4) + ")";
    }
  }

  function onScroll() {
    var y = window.scrollY;
    velocity = y - lastY;
    lastY = y;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(apply);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  /* Decay back to rest when scrolling stops, otherwise the last velocity
     value would stay baked into the transform. */
  setInterval(function () {
    if (Math.abs(velocity) < 0.01) return;
    velocity *= 0.82;
    if (Math.abs(velocity) < 0.01) velocity = 0;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(apply);
    }
  }, 50);
})();
