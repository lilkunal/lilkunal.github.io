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
    $$(".hero__name, .hero__greeting, .hero__craft, .hero__creds").forEach(function (el) {
      el.style.opacity = "1";
    });
  }

  if (reduce || (!A && !M)) {
    revealHeroImmediately();
    return;
  }

  /* Safety net. CSS hides the hero text until JS animates it in, so anything
     that stops the animation from finishing — a library error, or rAF being
     throttled because the page loaded in a background tab — would otherwise
     leave the headline invisible for good. Force it visible if it hasn't
     arrived on its own. */
  setTimeout(function () {
    $$(".hero__name, .hero__greeting, .hero__craft, .hero__creds").forEach(function (el) {
      if (parseFloat(getComputedStyle(el).opacity) < 0.9) el.style.opacity = "1";
    });
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
     2. Hero entrance (anime.js) — greeting, then the name character by
        character on a spring, then the pitch and credential chips.
     --------------------------------------------------------------------- */
  if (A) {
    var nameEl = document.querySelector(".hero__name");
    var chars = null;

    if (nameEl && A.text && A.text.split) {
      try {
        /* anime's splitter inserts a visually-hidden copy of the full string
           and marks the per-character spans aria-hidden, so the name is still
           announced correctly by screen readers. */
        var split = A.text.split(nameEl, { chars: true });
        chars = split && split.chars && split.chars.length ? split.chars : null;
      } catch (e) { chars = null; }
    }

    var tl = A.createTimeline({ defaults: { ease: "out(3)" } });

    tl.add(".hero__greeting", { opacity: [0, 1], x: [-12, 0], duration: 520 });

    if (chars) {
      nameEl.style.opacity = "1";
      tl.add(chars, {
        opacity: [0, 1],
        y: [38, 0],
        rotate: [-8, 0],
        scale: [0.85, 1],
        duration: 900,
        ease: A.createSpring({ stiffness: 130, damping: 14 }),
        delay: A.stagger(34)
      }, "-=260");
    } else {
      /* Splitting unavailable — fade the whole name in instead. */
      tl.add(".hero__name", { opacity: [0, 1], y: [24, 0], duration: 700 }, "-=260");
    }

    tl.add(".hero__craft", { opacity: [0, 1], y: [18, 0], duration: 620 }, "-=420");
    tl.add(".hero__creds", { opacity: [0, 1], duration: 10 }, "-=300");
    tl.add(".hero__cred", {
      opacity: [0, 1],
      y: [14, 0],
      scale: [0.9, 1],
      duration: 700,
      ease: A.createSpring({ stiffness: 150, damping: 13 }),
      delay: A.stagger(60)
    }, "-=260");
  } else {
    revealHeroImmediately();
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
      [".about__lede", "anim-hide-up", { opacity: 1, y: 0 }, 0.08],
      [".fact", "anim-hide-pop", { opacity: 1, scale: 1 }, 0.1],
      [".value-pillar", "anim-hide-pop", { opacity: 1, scale: 1 }, 0.08],
      [".about__actions", "anim-hide-up", { opacity: 1, y: 0 }, 0],
      [".experience__lede", "anim-hide-up", { opacity: 1, y: 0 }, 0],
      [".experience__cta", "anim-hide-pop", { opacity: 1, scale: 1 }, 0],
      [".bg-panel-wrap", "anim-hide-up", { opacity: 1, y: 0 }, 0],
      [".service-card", "anim-hide-pop", { opacity: 1, scale: 1 }, 0.09],
      [".carousel__slide", "anim-hide-pop", { opacity: 1, scale: 1 }, 0.09],
      [".step", "anim-hide-up", { opacity: 1, y: 0 }, 0.09],
      [".process-note", "anim-hide-up", { opacity: 1, y: 0 }, 0],
      [".work-tile", "anim-hide-pop", { opacity: 1, scale: 1 }, 0.1],
      [".work-panel", "anim-hide-up", { opacity: 1, y: 0 }, 0.12],
      [".work__note", "anim-hide-up", { opacity: 1, y: 0 }, 0],
      [".ask-search", "anim-hide-up", { opacity: 1, y: 0 }, 0],
      [".faq-entry", "anim-hide-left", { opacity: 1, x: 0 }, 0.05],
      [".contact__lede", "anim-hide-up", { opacity: 1, y: 0 }, 0],
      [".form-field", "anim-hide-up", { opacity: 1, y: 0 }, 0.06],
      [".contact-card", "anim-hide-pop", { opacity: 1, scale: 1 }, 0.08],
      [".contact__closing", "anim-hide-up", { opacity: 1, y: 0 }, 0]
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
    var photos = document.querySelector(".hero__visual .hero__persona-bg, .hero__persona-bg");
    var hero = document.querySelector(".hero");
    if (hero && photos) {
      M.scroll(function (progress) {
        photos.style.transform = "scale(" + (1 + progress * 0.06).toFixed(3) + ")";
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
    $$(".service-card, .work-panel, .contact-card, .faq-item, .persona-tab, .bg-tab, .hero__cred, .value-pillar").forEach(function (el) {
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
