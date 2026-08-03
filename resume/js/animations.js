/* Résumé page — anime.js + scroll effects (SVGator-inspired) */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var A = window.anime;

  /* SVG line draw on section heads */
  function initLineDraw() {
    var lines = document.querySelectorAll("[data-svg-draw]");
    if (!lines.length) return;

    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(
        function (entries, o) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-drawn");
              o.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      lines.forEach(function (el) { obs.observe(el); });
    } else {
      lines.forEach(function (el) { el.classList.add("is-drawn"); });
    }
  }

  /* Stagger skill chips when skills section enters view */
  function initChipStagger() {
    if (!A || reduce) return;
    var section = document.getElementById("skills");
    if (!section) return;
    var chips = section.querySelectorAll(".chip");
    if (!chips.length) return;

    chips.forEach(function (c) {
      c.style.opacity = "0";
      c.style.transform = "translateY(6px)";
    });

    if ("IntersectionObserver" in window) {
      var fired = false;
      var obs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting || fired) return;
            fired = true;
            A.animate(chips, {
              opacity: [0, 1],
              translateY: [6, 0],
              delay: A.stagger(28, { from: "first" }),
              duration: 480,
              ease: "out(3)"
            });
            obs.disconnect();
          });
        },
        { threshold: 0.2 }
      );
      obs.observe(section);
    } else {
      chips.forEach(function (c) {
        c.style.opacity = "1";
        c.style.transform = "";
      });
    }
  }

  /* Hero name — subtle anime stagger (CSS fallback still works) */
  function initHeroName() {
    if (!A || reduce) return;
    var chars = document.querySelectorAll(".hero__name-chars .char");
    if (!chars.length) return;
    A.animate(chars, {
      opacity: [0, 1],
      translateY: [12, 0],
      rotate: [-4, 0],
      delay: A.stagger(35),
      duration: 620,
      ease: "out(4)"
    });
  }

  /* Signal trace draw with anime */
  function initSignal() {
    if (!A || reduce) return;
    var trace = document.querySelector(".signal__trace");
    if (!trace) return;
    var len = trace.getTotalLength ? trace.getTotalLength() : 620;
    trace.style.strokeDasharray = len;
    trace.style.strokeDashoffset = len;
    A.animate(trace, {
      strokeDashoffset: [len, 0],
      duration: 1400,
      delay: 200,
      ease: "inOut(2)"
    });
  }

  /* Smooth anchor scroll with offset for fixed rail */
  function initSmoothAnchors() {
    var offset = window.matchMedia("(max-width: 900px)").matches ? 72 : 24;
    document.querySelectorAll('.rail__link[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (!id || id === "#") return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" });
      });
    });
  }

  initLineDraw();
  initChipStagger();
  initHeroName();
  initSignal();
  initSmoothAnchors();
})();
