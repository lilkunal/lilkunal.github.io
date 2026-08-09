/* Playful accents — mascot blink + hero blob parallax (imesaros-inspired) */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mascot = document.querySelector("[data-hero-mascot]");
  var blobs = document.querySelector(".hero-editorial__blobs");
  var hero = document.querySelector(".hero--editorial");

  if (mascot && !reduce) {
    var blinkTimer = null;

    function scheduleBlink() {
      var delay = 2800 + Math.random() * 4200;
      blinkTimer = window.setTimeout(function () {
        mascot.classList.add("is-blinking");
        window.setTimeout(function () {
          mascot.classList.remove("is-blinking");
          scheduleBlink();
        }, 200);
      }, delay);
    }

    scheduleBlink();

    document.addEventListener("visibilitychange", function () {
      if (document.hidden && blinkTimer) {
        window.clearTimeout(blinkTimer);
        blinkTimer = null;
      } else if (!document.hidden && !blinkTimer) {
        scheduleBlink();
      }
    });
  }

  if (blobs && hero && !reduce) {
    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var rect = hero.getBoundingClientRect();
        var progress = Math.min(Math.max(-rect.top / Math.max(rect.height, 1), 0), 1);
        blobs.style.transform = "translateY(" + (progress * 28) + "px)";
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();
