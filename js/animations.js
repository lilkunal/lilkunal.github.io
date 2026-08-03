/* Motion layer — anime.js v4 for the hero's orchestrated entrance and text
   splitting, Motion for scroll-linked and viewport-triggered work.
   Both libraries are vendored in js/vendor/ rather than loaded from a CDN, so
   the site works offline and the self-contained build (which blocks every
   external host via CSP) behaves identically.
   Everything here is progressive enhancement: if a library fails to load, or
   the visitor prefers reduced motion, the page stays fully readable. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var A = window.anime && window.anime.animate ? window.anime : null;
  var M = window.Motion && window.Motion.animate ? window.Motion : null;

  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  /* The .js class gates the pre-animation hidden state in CSS. If we bail out
     below, it has to come off or hero text would stay invisible. */
  function revealHeroImmediately() {
    $$(".deck__slide.is-active, .deck__title, .sticker").forEach(function (el) {
      el.style.opacity = "1";
    });
  }

  if (reduce || (!A && !M)) {
    revealHeroImmediately();
    /* Still run scroll progress + section animations below if Motion available */
    if (!M) return;
  }

  setTimeout(function () {
    var active = document.querySelector(".deck__slide.is-active");
    if (active && parseFloat(getComputedStyle(active).opacity) < 0.9) active.style.opacity = "1";
  }, 2200);

  var EASE = [0.16, 1, 0.3, 1];

  /* ---------------------------------------------------------------------
     1. Scroll progress bar (Motion `scroll`)
     --------------------------------------------------------------------- */
  if (M && M.scroll) {
    var bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    M.scroll(function (progress) {
      bar.style.transform = "scaleX(" + progress + ")";
    });
  }

  /* ---------------------------------------------------------------------
     2. Hero entrance — deck card + stickers (anime.js)
     --------------------------------------------------------------------- */
  if (A) {
    var tl = A.createTimeline({ defaults: { ease: "out(3)" } });
    tl.add(".sticker", {
      opacity: [0, 1],
      scale: [0.85, 1],
      delay: A.stagger(40, { from: "random" }),
      duration: 680
    }, 0);
    tl.add(".deck-wrap", { opacity: [0, 1], y: [24, 0], duration: 720 }, 120);
  }

  /* ---------------------------------------------------------------------
     3. Scroll-triggered reveals (Motion `inView`)
        Replaces the old CSS keyframe entrances, which fired on page load —
        so anything below the fold had already finished before being seen.
     --------------------------------------------------------------------- */
  if (M && M.inView) {
    /* [selector, hidden-class, animated properties, stagger seconds] */
    var groups = [
      [".section__title", "anim-hide-up", { opacity: 1, y: 0 }, 0],
      [".fact", "anim-hide-pop", { opacity: 1, scale: 1 }, 0.1],
      [".cv-carousel-wrap", "anim-hide-up", { opacity: 1, y: 0 }, 0],
      [".cv-carousel__thumb", "anim-hide-pop", { opacity: 1, scale: 1 }, 0.05],
      [".reels__card", "anim-hide-pop", { opacity: 1, scale: 1 }, 0.08],
      [".reels__lede", "anim-hide-up", { opacity: 1, y: 0 }, 0],
      [".work-fly", "anim-hide-up", { opacity: 1, y: 0 }, 0],
      [".work-fly__thumb", "anim-hide-pop", { opacity: 1, scale: 1 }, 0.06],
      [".work__note", "anim-hide-up", { opacity: 1, y: 0 }, 0],
      [".ask-search", "anim-hide-up", { opacity: 1, y: 0 }, 0],
      [".faq-entry", "anim-hide-left", { opacity: 1, x: 0 }, 0.05],
      [".contact__motion-wrap", "anim-hide-up", { opacity: 1, y: 0 }, 0],
      [".form-field", "anim-hide-up", { opacity: 1, y: 0 }, 0.06],
      [".contact-card", "anim-hide-pop", { opacity: 1, scale: 1 }, 0.08],
    ];

    groups.forEach(function (group) {
      var sel = group[0], hideClass = group[1], to = group[2], stagger = group[3];
      var els = $$(sel);
      if (!els.length) return;

      /* Hide from JS, never from the stylesheet — a failed script must not
         leave content permanently invisible. */
      els.forEach(function (el) { el.classList.add(hideClass); });

      /* Group siblings so a row of cards staggers together rather than each
         card animating alone as it crosses the threshold. */
      var byParent = new Map();
      els.forEach(function (el) {
        var key = el.parentNode;
        if (!byParent.has(key)) byParent.set(key, []);
        byParent.get(key).push(el);
      });

      byParent.forEach(function (siblings) {
        var fired = false;
        var stop = M.inView(siblings[0], function () {
          if (fired) return;
          fired = true;
          M.animate(siblings, to, {
            duration: 0.7,
            ease: EASE,
            delay: stagger ? M.stagger(stagger) : 0
          }).then(function () {
            /* Drop the helper class and inline transforms so hover states and
               the FAQ accordion's own grid animation aren't fighting leftovers. */
            siblings.forEach(function (el) {
              el.classList.remove(hideClass);
              el.style.transform = "";
              el.style.opacity = "";
            });
          });
          if (typeof stop === "function") stop();
        }, { amount: 0.15 });
      });
    });
  }

  /* ---------------------------------------------------------------------
     4. Magnetic buttons (Motion springs on registered custom properties)
        CSS composes --magnet-x/y with its own --lift, so the pointer pull and
        the hover lift never overwrite each other's transform.
     --------------------------------------------------------------------- */
  if (M && M.animate && window.matchMedia("(pointer: fine)").matches) {
    $$(".btn--primary, .btn--ghost").forEach(function (btn) {
      var PULL = 0.28;
      var MAX = 10;

      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * PULL;
        var dy = (e.clientY - (r.top + r.height / 2)) * PULL;
        dx = Math.max(-MAX, Math.min(MAX, dx));
        dy = Math.max(-MAX, Math.min(MAX, dy));
        btn.style.setProperty("--magnet-x", dx.toFixed(2) + "px");
        btn.style.setProperty("--magnet-y", dy.toFixed(2) + "px");
      });

      btn.addEventListener("mouseleave", function () {
        M.animate(btn,
          { "--magnet-x": "0px", "--magnet-y": "0px" },
          { type: "spring", stiffness: 260, damping: 18 }
        );
      });
    });
  }

  /* ---------------------------------------------------------------------
     5. Hero parallax on decorative layers only (Motion `scroll`)
        Skipped on coarse pointers — it costs more than it adds on phones.
     --------------------------------------------------------------------- */
  if (M && M.scroll && window.matchMedia("(pointer: fine)").matches) {
    var field = document.querySelector("[data-sticker-field]");
    var hero = document.querySelector(".hero--milo");
    if (hero && field) {
      M.scroll(function (progress) {
        field.style.transform = "scale(" + (1 + progress * 0.04).toFixed(3) + ")";
      }, { target: hero, offset: ["start start", "end start"] });
    }
  }

  /* ---------------------------------------------------------------------
     6. Press feedback (Motion springs on `scale`)
        Buttons are deliberately excluded: they already compose a magnetic
        transform through CSS custom properties (see #4 and style.css), and
        animating `scale` there would set an inline `transform` that clobbers
        it. Cards and tabs have no such conflict, so they get a quick tactile
        squash on press — inline style is cleared on release so ordinary CSS
        hover rules keep control afterward rather than losing to a leftover
        inline transform.
     --------------------------------------------------------------------- */
  if (M && M.animate) {
    $$(".service-card, .work-fly__btn, .work-fly__thumb, .contact-card, .faq-item, .bg-tab, .value-pillar, .deck__btn, .cv-carousel__btn, .cv-carousel__thumb").forEach(function (el) {
      el.addEventListener("pointerdown", function () {
        M.animate(el, { scale: 0.96 }, { type: "spring", stiffness: 420, damping: 22 });
      });
      var release = function () {
        M.animate(el, { scale: 1 }, { type: "spring", stiffness: 300, damping: 20 }).then(function () {
          el.style.transform = "";
        });
      };
      el.addEventListener("pointerup", release);
      el.addEventListener("pointerleave", release);
    });
  }
})();
