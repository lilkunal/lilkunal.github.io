/* CV carousel — swipe through highlights; full résumé is on its own page */
(function () {
  "use strict";

  var root = document.querySelector("[data-cv-carousel]");
  if (!root) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var A = window.anime && window.anime.animate ? window.anime : null;

  var slides = Array.prototype.slice.call(root.querySelectorAll("[data-cv-slide]"));
  var dots = Array.prototype.slice.call(root.querySelectorAll("[data-cv-dot]"));
  var prevBtn = root.querySelector("[data-cv-prev]");
  var nextBtn = root.querySelector("[data-cv-next]");
  var counter = root.querySelector("[data-cv-counter]");

  if (!slides.length) return;

  var index = 0;
  var busy = false;

  function updateUi() {
    slides.forEach(function (s, i) {
      s.classList.toggle("is-active", i === index);
      s.setAttribute("aria-hidden", i === index ? "false" : "true");
    });
    dots.forEach(function (d, i) {
      d.classList.toggle("is-active", i === index);
      d.setAttribute("aria-selected", i === index ? "true" : "false");
    });
    if (counter) counter.textContent = (index + 1) + " / " + slides.length;
  }

  function resetSlide(slide) {
    slide.style.transform = "";
    slide.style.opacity = "";
    slide.classList.remove("is-entering");
  }

  function goTo(next, direction) {
    if (busy || next === index || next < 0 || next >= slides.length) return;
    busy = true;

    var outgoing = slides[index];
    var incoming = slides[next];
    var dir = direction || (next > index ? 1 : -1);

    if (reduce || !A) {
      outgoing.classList.remove("is-active");
      resetSlide(outgoing);
      incoming.classList.add("is-active");
      resetSlide(incoming);
      index = next;
      updateUi();
      busy = false;
      return;
    }

    incoming.classList.add("is-active", "is-entering");
    var outX = dir > 0 ? "-18%" : "18%";
    var inStart = dir > 0 ? "18%" : "-18%";

    A.animate(outgoing, {
      translateX: outX,
      opacity: [1, 0],
      duration: 420,
      ease: "in(3)"
    });

    incoming.style.opacity = "0";
    incoming.style.transform = "translateX(" + inStart + ")";

    A.animate(incoming, {
      translateX: [inStart, "0%"],
      opacity: [0, 1],
      duration: 520,
      ease: "out(4)",
      complete: function () {
        outgoing.classList.remove("is-active");
        resetSlide(outgoing);
        incoming.classList.remove("is-entering");
        resetSlide(incoming);
        index = next;
        updateUi();
        busy = false;
      }
    });
  }

  function step(delta) {
    var next = (index + delta + slides.length) % slides.length;
    goTo(next, delta);
  }

  if (prevBtn) prevBtn.addEventListener("click", function () { step(-1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { step(1); });

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () { goTo(i); });
  });

  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
  });

  var touchStartX = 0;
  root.addEventListener("touchstart", function (e) {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  root.addEventListener("touchend", function (e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 40) return;
    step(dx < 0 ? 1 : -1);
  }, { passive: true });

  updateUi();
})();
