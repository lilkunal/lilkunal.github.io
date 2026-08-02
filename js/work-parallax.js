/* Scroll-linked work showcase — vanilla take on Motion's parallax pattern
   (https://motion.dev/examples/react-parallax). Background layers drift at a
   different rate to foreground copy as each panel crosses the viewport. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var M = window.Motion && window.Motion.scroll ? window.Motion : null;
  var root = document.querySelector("[data-work-parallax]");
  if (!root || reduce || !M) return;

  var panels = Array.prototype.slice.call(root.querySelectorAll("[data-work-panel]"));
  if (!panels.length) return;

  panels.forEach(function (panel) {
    var bg = panel.querySelector(".work-panel__bg-inner");
    var content = panel.querySelector(".work-panel__content");
    if (!bg || !content) return;

    M.scroll(function (progress) {
      /* progress 0 → panel entering, 1 → panel leaving */
      var drift = (progress - 0.5) * 22;
      bg.style.transform = "translate3d(0, " + drift.toFixed(2) + "%, 0) scale(1.08)";

      var opacity = progress < 0.15 ? progress / 0.15
        : progress > 0.85 ? (1 - progress) / 0.15
        : 1;
      opacity = Math.max(0, Math.min(1, opacity));
      content.style.opacity = opacity.toFixed(3);
      content.style.transform = "translate3d(0, " + ((1 - opacity) * 18).toFixed(1) + "px, 0)";
    }, { target: panel, offset: ["start end", "end start"] });
  });
})();
