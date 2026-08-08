/* Scroll-linked motion — Pinterest-style hero shrink + section scrub (Motion.js) */
(function () {
  "use strict";

  function $$(sel) {
    return Array.prototype.slice.call(document.querySelectorAll(sel));
  }

  var M = window.Motion && window.Motion.scroll ? window.Motion : null;
  if (!M) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  var hero = document.querySelector(".hero--editorial");
  if (hero) {
    var type = hero.querySelector(".hero-editorial__type");
    var photoBg = hero.querySelector(".hero-editorial__photo-bg");
    var intro = hero.querySelector(".hero-editorial__intro");
    var foot = hero.querySelector(".hero-editorial__foot");

    M.scroll(
      function (p) {
        if (type) {
          type.style.transform =
            "translateY(" + (p * -48).toFixed(1) + "px) scale(" + (1 - p * 0.08).toFixed(3) + ")";
          type.style.opacity = (1 - p * 0.35).toFixed(2);
        }
        if (photoBg) {
          photoBg.style.transform =
            "translateY(" + (p * 28).toFixed(1) + "px) scale(" + (1 + p * 0.05).toFixed(3) + ")";
          photoBg.style.opacity = (1 - p * 0.65).toFixed(2);
        }
        if (intro) intro.style.opacity = (1 - p * 0.9).toFixed(2);
        if (foot) foot.style.opacity = (1 - p * 0.55).toFixed(2);
      },
      { target: hero, offset: ["start start", "end start"] }
    );
  }

  $$(".section__title--scroll").forEach(function (title) {
    M.scroll(
      function (p) {
        var scale = 0.92 + p * 0.08;
        var y = (1 - p) * 28;
        title.style.transform = "translateY(" + y.toFixed(1) + "px) scale(" + scale.toFixed(3) + ")";
        title.style.opacity = Math.min(1, p * 1.2).toFixed(2);
      },
      { target: title, offset: ["start 0.9", "start 0.35"] }
    );
  });

  $$("[data-scroll-reveal]").forEach(function (el) {
    M.scroll(
      function (p) {
        el.style.transform = "translateY(" + ((1 - p) * 40).toFixed(1) + "px)";
        el.style.opacity = p.toFixed(2);
      },
      { target: el, offset: ["start 0.95", "start 0.55"] }
    );
  });

})();
