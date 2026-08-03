/* Full-bleed project carousel — fly-in / fly-out transitions via anime.js */
(function () {
  "use strict";

  var root = document.querySelector("[data-work-fly]");
  if (!root) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var A = window.anime && window.anime.animate ? window.anime : null;

  var slides = Array.prototype.slice.call(root.querySelectorAll("[data-work-slide]"));
  var thumbs = Array.prototype.slice.call(root.querySelectorAll("[data-work-thumb]"));
  var prevBtn = root.querySelector("[data-work-prev]");
  var nextBtn = root.querySelector("[data-work-next]");
  var counter = root.querySelector("[data-work-counter]");

  if (!slides.length) return;

  var index = 0;
  var busy = false;
  var autoplayTimer = null;
  var AUTO_MS = 6500;

  function updateUi() {
    slides.forEach(function (s, i) {
      s.setAttribute("aria-hidden", i === index ? "false" : "true");
    });
    thumbs.forEach(function (t, i) {
      t.classList.toggle("is-active", i === index);
      t.setAttribute("aria-selected", i === index ? "true" : "false");
    });
    if (counter) counter.textContent = (index + 1) + " / " + slides.length;
  }

  function animateCopy(slide) {
    if (!A || reduce) return;
    var copy = slide.querySelector(".work-fly__content");
    if (!copy) return;
    A.animate(copy.children, {
      opacity: [0, 1],
      y: [20, 0],
      duration: 640,
      ease: "out(4)",
      delay: A.stagger(55)
    });
  }

  function resetSlideStyles(slide) {
    slide.style.transform = "";
    slide.style.opacity = "";
    slide.style.filter = "";
    slide.classList.remove("is-entering");
  }

  function flyTo(next, direction) {
    if (busy || next === index || next < 0 || next >= slides.length) return;
    busy = true;
    stopAutoplay();

    var outgoing = slides[index];
    var incoming = slides[next];
    var dir = direction || (next > index ? 1 : -1);

    if (reduce || !A) {
      outgoing.classList.remove("is-active");
      resetSlideStyles(outgoing);
      incoming.classList.add("is-active");
      resetSlideStyles(incoming);
      index = next;
      updateUi();
      animateCopy(incoming);
      busy = false;
      startAutoplay();
      return;
    }

    incoming.classList.add("is-active", "is-entering");
    incoming.style.pointerEvents = "none";

    var outX = dir > 0 ? "-22%" : "22%";
    var inX = dir > 0 ? "28%" : "-28%";
    var outRot = dir > 0 ? 10 : -10;
    var inRot = dir > 0 ? -14 : 14;

    A.animate(outgoing, {
      translateX: outX,
      rotateY: outRot,
      scale: 0.86,
      opacity: 0,
      filter: "blur(10px)",
      duration: 680,
      ease: "in(3)"
    });

    incoming.style.opacity = "0";
    incoming.style.transform =
      "translateX(" + inX + ") rotateY(" + inRot + "deg) scale(1.08) perspective(1400px)";
    incoming.style.filter = "blur(6px)";

    A.animate(incoming, {
      translateX: "0%",
      rotateY: 0,
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      duration: 920,
      ease: "out(4)",
      delay: 60
    }).then(function () {
      outgoing.classList.remove("is-active");
      resetSlideStyles(outgoing);
      incoming.classList.remove("is-entering");
      incoming.style.pointerEvents = "";
      index = next;
      updateUi();
      animateCopy(incoming);
      busy = false;
      startAutoplay();
    });
  }

  function goNext() {
    if (index < slides.length - 1) flyTo(index + 1, 1);
    else flyTo(0, 1);
  }

  function goPrev() {
    if (index > 0) flyTo(index - 1, -1);
    else flyTo(slides.length - 1, -1);
  }

  function startAutoplay() {
    if (reduce) return;
    stopAutoplay();
    autoplayTimer = setInterval(goNext, AUTO_MS);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  if (prevBtn) prevBtn.addEventListener("click", goPrev);
  if (nextBtn) nextBtn.addEventListener("click", goNext);

  thumbs.forEach(function (thumb, i) {
    thumb.addEventListener("click", function () {
      flyTo(i, i > index ? 1 : -1);
    });
  });

  root.addEventListener("mouseenter", stopAutoplay);
  root.addEventListener("mouseleave", startAutoplay);
  root.addEventListener("focusin", stopAutoplay);
  root.addEventListener("focusout", function (e) {
    if (!root.contains(e.relatedTarget)) startAutoplay();
  });

  document.addEventListener("keydown", function (e) {
    if (!root.matches(":hover") && document.activeElement && !root.contains(document.activeElement)) return;
    if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
  });

  /* Stagger copy on first paint */
  if (A && !reduce && slides[0]) {
    var copy = slides[0].querySelector(".work-fly__content");
    if (copy) {
      A.animate(copy.children, {
        opacity: [0, 1],
        y: [22, 0],
        duration: 720,
        ease: "out(4)",
        delay: A.stagger(70)
      });
    }
  }

  updateUi();
  startAutoplay();
})();
