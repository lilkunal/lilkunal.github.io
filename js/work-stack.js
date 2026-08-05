/* Work stack — scroll-reveal for alternating editorial project rows */
(function () {
  "use strict";

  var rows = Array.prototype.slice.call(document.querySelectorAll("[data-work-row]"));
  if (!rows.length) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce) {
    rows.forEach(function (r) { r.classList.add("is-visible"); });
    return;
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.15 });

    rows.forEach(function (row) { io.observe(row); });
  } else {
    rows.forEach(function (r) { r.classList.add("is-visible"); });
  }
})();
