/* Snap carousels — services row + persona strip. anime.js for slide transitions. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var A = window.anime && window.anime.animate ? window.anime : null;

  function initCarousel(root) {
    var track = root.querySelector("[data-carousel-track]");
    var prev = root.querySelector("[data-carousel-prev]");
    var next = root.querySelector("[data-carousel-next]");
    var dots = root.querySelector("[data-carousel-dots]");
    if (!track) return;

    var slides = Array.prototype.slice.call(track.children);
    if (!slides.length) return;

    var index = 0;

    function maxIndex() {
      var slide = slides[0];
      if (!slide) return 0;
      var gap = parseFloat(getComputedStyle(track).gap) || 0;
      var visible = Math.max(1, Math.floor((track.clientWidth + gap) / (slide.offsetWidth + gap)));
      return Math.max(0, slides.length - visible);
    }

    function updateDots() {
      if (!dots) return;
      Array.prototype.slice.call(dots.children).forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
        dot.setAttribute("aria-selected", i === index ? "true" : "false");
      });
    }

    function goTo(i, animate) {
      var max = maxIndex();
      index = Math.max(0, Math.min(i, max));
      var slide = slides[index];
      if (!slide) return;
      var offset = slide.offsetLeft;

      if (animate && A && !reduce) {
        A.animate(track, {
          scrollLeft: offset,
          duration: 680,
          ease: "out(4)"
        });
      } else {
        track.scrollLeft = offset;
      }
      updateDots();
    }

    if (prev) prev.addEventListener("click", function () { goTo(index - 1, true); });
    if (next) next.addEventListener("click", function () { goTo(index + 1, true); });

    if (dots) {
      Array.prototype.slice.call(dots.children).forEach(function (dot, i) {
        dot.addEventListener("click", function () { goTo(i, true); });
      });
    }

    var scrollTimer = null;
    track.addEventListener("scroll", function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        var left = track.scrollLeft;
        var closest = 0;
        var dist = Infinity;
        slides.forEach(function (slide, i) {
          var d = Math.abs(slide.offsetLeft - left);
          if (d < dist) { dist = d; closest = i; }
        });
        index = closest;
        updateDots();
      }, 80);
    }, { passive: true });

    window.addEventListener("resize", function () {
      goTo(Math.min(index, maxIndex()), false);
    });

    updateDots();
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-carousel]")).forEach(initCarousel);
})();
