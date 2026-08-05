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

  function splitIntoChars(el, charClass) {
    if (!el || el.dataset.splitDone) return;
    var text = el.textContent;
    if (!text || !text.trim()) return;
    el.dataset.splitDone = "1";
    el.textContent = "";
    el.setAttribute("aria-label", text);
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      var span = document.createElement("span");
      span.className = charClass;
      span.setAttribute("aria-hidden", "true");
      span.textContent = ch === " " ? "\u00a0" : ch;
      if (ch === " ") span.style.minWidth = "0.28em";
      el.appendChild(span);
    }
  }

  function revealDeckTitle(slide, staggerMs) {
    if (!slide) return;
    var title = slide.querySelector(".deck__title");
    if (!title) return;
    if (!title.dataset.splitDone) splitIntoChars(title, "deck__char");
    title.classList.add("is-chars-ready");
    if (reduce || !A) return;
    var chars = title.querySelectorAll(".deck__char");
    if (!chars.length) return;
    A.animate(chars, {
      opacity: [0, 1],
      y: ["0.85em", "0"],
      filter: ["blur(4px)", "blur(0px)"],
      duration: 620,
      ease: "out(4)",
      delay: A.stagger(staggerMs || 22)
    });
  }

  /* The .js class gates the pre-animation hidden state in CSS. If we bail out
     below, it has to come off or hero text would stay invisible. */
  function revealHeroImmediately() {
    $$(".hero-center, .deck__slide.is-active, .deck__title, .sticker").forEach(function (el) {
      el.style.opacity = "1";
    });
    var curtain = document.querySelector(".hero-curtain");
    if (curtain) curtain.style.display = "none";
  }

  if (reduce || (!A && !M)) {
    revealHeroImmediately();
    /* Still run scroll progress + section animations below if Motion available */
    if (!M) return;
  }

  setTimeout(function () {
    var active = document.querySelector(".deck__slide.is-active");
    if (active && parseFloat(getComputedStyle(active).opacity) < 0.9) active.style.opacity = "1";
    var heroCenter = document.querySelector(".hero-center");
    if (heroCenter && parseFloat(getComputedStyle(heroCenter).opacity) < 0.9) {
      heroCenter.style.opacity = "1";
    }
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
    tl.add(".hero-curtain", {
      scaleY: [1, 0],
      opacity: [1, 0],
      duration: 1100,
      ease: "inOut(3)"
    }, 350);
    tl.call(function () {
      var curtain = document.querySelector(".hero-curtain");
      if (curtain) curtain.style.display = "none";
    }, 1500);
    tl.add(".sticker", {
      opacity: [0, 1],
      scale: [0.85, 1],
      delay: A.stagger(40, { from: "random" }),
      duration: 680
    }, 420);
    tl.add(".hero-float--headphones", {
      opacity: [0, 0.22],
      scale: [0.92, 1],
      duration: 900
    }, 420);
    tl.add(".hero-portrait", {
      opacity: [0, 1],
      scale: [0.88, 1],
      y: [24, 0],
      filter: ["blur(8px)", "blur(0px)"],
      duration: 780
    }, 520);
    tl.add(".hero-center", { opacity: [0, 1], duration: 720 }, 640);
    tl.add(".deck__slide.is-active", {
      scale: [0.94, 1],
      y: [18, 0],
      filter: ["blur(6px)", "blur(0px)"],
      duration: 820,
      ease: "out(4)"
    }, 720);
    tl.call(function () {
      var active = document.querySelector(".deck__slide.is-active");
      revealDeckTitle(active, 24);
      var label = active && active.querySelector(".deck__label");
      var kicker = active && active.querySelector(".deck__kicker");
      var extras = [label, kicker].filter(Boolean);
      if (extras.length && A) {
        A.animate(extras, {
          opacity: [0, 1],
          y: [14, 0],
          duration: 560,
          ease: "out(4)",
          delay: A.stagger(80)
        });
      }
    }, 980);
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
      [".eyebrow", "anim-hide-up", { opacity: 1, y: 0 }, 0],
      [".how-build__lede", "anim-hide-up", { opacity: 1, y: 0 }, 0],
      [".how-build__list li", "anim-hide-left", { opacity: 1, x: 0 }, 0.06],
      [".fact", "anim-hide-pop", { opacity: 1, scale: 1 }, 0.1],
      [".cv-scroll", "anim-hide-up", { opacity: 1, y: 0 }, 0],
      [".reels__card", "anim-hide-pop", { opacity: 1, scale: 1 }, 0.08],
      [".reels__lede", "anim-hide-up", { opacity: 1, y: 0 }, 0],
      [".work-stack", "anim-hide-up", { opacity: 1, y: 0 }, 0],
      [".work__note", "anim-hide-up", { opacity: 1, y: 0 }, 0],
      [".ask-search", "anim-hide-up", { opacity: 1, y: 0 }, 0],
      [".faq-entry", "anim-hide-left", { opacity: 1, x: 0 }, 0.05],
      [".contact__intro", "anim-hide-up", { opacity: 1, y: 0 }, 0],
      [".contact-action", "anim-hide-pop", { opacity: 1, scale: 1 }, 0.08],
      [".form-field", "anim-hide-up", { opacity: 1, y: 0 }, 0.06],
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
            siblings.forEach(function (el) {
              el.classList.remove(hideClass);
              el.style.transform = "";
              el.style.opacity = "";
              if (el.classList.contains("section__title") && !el.dataset.splitDone) {
                splitIntoChars(el, "title-char");
                el.classList.add("is-revealed");
                var chars = el.querySelectorAll(".title-char");
                if (chars.length && M) {
                  M.animate(chars, {
                    clipPath: ["inset(0 0 100% 0)", "inset(0 0 0 0)"],
                    y: ["0.6em", "0"]
                  }, {
                    duration: 0.55,
                    ease: EASE,
                    delay: M.stagger(0.018)
                  });
                }
              }
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

    var portrait = document.querySelector(".hero-portrait");
    if (portrait && hero) {
      M.scroll(function (progress) {
        var y = (progress * -36).toFixed(1);
        var sc = (1 + progress * 0.03).toFixed(3);
        portrait.style.transform = "translateY(" + y + "px) scale(" + sc + ")";
      }, { target: hero, offset: ["start start", "end start"] });
    }

    var cvScroll = document.querySelector("[data-cv-scroll]");
    if (cvScroll) {
      $$(".cv-scroll__visual img", cvScroll).forEach(function (img) {
        M.scroll(function (progress) {
          var sc = (1 + progress * 0.08).toFixed(3);
          img.style.transform = "scale(" + sc + ")";
        }, { target: cvScroll, offset: ["start end", "end start"] });
      });
    }

    var workStack = document.querySelector("[data-work-stack]");
    if (workStack) {
      $$(".work-stack__visual img", workStack).forEach(function (img) {
        M.scroll(function (progress) {
          var y = (progress * -8 - 4).toFixed(1);
          img.style.transform = "translateY(" + y + "%) scale(1.06)";
        }, { target: workStack, offset: ["start end", "end start"] });
      });
    }
  }

  /* Deck slide changes — re-run theatrical title split */
  var deck = document.querySelector("[data-deck]");
  if (deck && !reduce) {
    deck.addEventListener("deck-change", function (e) {
      if (!e.detail || !e.detail.slide) return;
      revealDeckTitle(e.detail.slide, 18);
      if (A) {
        var bits = e.detail.slide.querySelectorAll(".deck__label, .deck__kicker, .deck__list li");
        if (bits.length) {
          A.animate(bits, {
            opacity: [0, 1],
            y: [12, 0],
            duration: 520,
            ease: "out(4)",
            delay: A.stagger(55)
          });
        }
      }
    });
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
    $$(".service-card, .contact-card, .faq-item, .bg-tab, .value-pillar, .deck__btn, .cv-scroll__rail-item, .work-stack__cta, .offclock__tile").forEach(function (el) {
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
